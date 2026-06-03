const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const { getDb } = require('../db/connection');

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
const UPLOAD_DIR = path.resolve(DATA_DIR, 'uploads');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

const BACKUP_VERSION = 1;

// User-data tables included in a backup. device_templates is special-cased to
// custom-only so we never clobber the built-in seed library.
const TABLES = [
  'locations', 'devices', 'ports', 'vlans', 'connections',
  'power_outlets', 'power_connections', 'attachments', 'history',
];

function tableColumns(db, table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
}

// ── Export: zip of data.json + manifest + uploads/ ───────────────────────────
router.get('/export', (req, res) => {
  const db = getDb();
  const data = {};
  for (const t of TABLES) data[t] = db.prepare(`SELECT * FROM ${t}`).all();
  data.device_templates = db.prepare(`SELECT * FROM device_templates WHERE is_custom = 1`).all();

  const manifest = {
    app: 'CableMap',
    backup_version: BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    counts: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])),
  };

  const zip = new AdmZip();
  zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2)));
  zip.addFile('data.json', Buffer.from(JSON.stringify(data, null, 2)));
  if (fs.existsSync(UPLOAD_DIR)) {
    try { zip.addLocalFolder(UPLOAD_DIR, 'uploads'); } catch (e) { /* uploads optional */ }
  }

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="cablemap-backup-${stamp}.zip"`);
  res.send(zip.toBuffer());
});

// ── Import: restore from a backup zip (replaces all user data) ────────────────
router.post('/import', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No backup file uploaded' });

  let zip, manifest, data;
  try {
    zip = new AdmZip(req.file.buffer);
    const manifestEntry = zip.getEntry('manifest.json');
    const dataEntry = zip.getEntry('data.json');
    if (!dataEntry) return res.status(400).json({ error: 'Invalid backup: data.json missing' });
    manifest = manifestEntry ? JSON.parse(manifestEntry.getData().toString('utf-8')) : {};
    data = JSON.parse(dataEntry.getData().toString('utf-8'));
  } catch (e) {
    return res.status(400).json({ error: 'Could not read backup zip: ' + e.message });
  }
  if (manifest.app && manifest.app !== 'CableMap') {
    return res.status(400).json({ error: 'This does not look like a CableMap backup' });
  }

  const db = getDb();
  const restored = {};

  function restoreTable(table, rows) {
    if (!Array.isArray(rows)) return 0;
    const cols = new Set(tableColumns(db, table));
    db.prepare(`DELETE FROM ${table}`).run();
    let n = 0;
    for (const row of rows) {
      const keys = Object.keys(row).filter(k => cols.has(k));
      if (!keys.length) continue;
      const placeholders = keys.map(() => '?').join(', ');
      const stmt = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`);
      stmt.run(...keys.map(k => row[k]));
      n++;
    }
    return n;
  }

  db.exec('PRAGMA foreign_keys = OFF');
  try {
    const tx = db.transaction(() => {
      // Main tables are fully replaced with original IDs preserved (their
      // cross-references — ports→devices, connections→ports, attachments→entity
      // — stay consistent because each table is wiped and reinserted wholesale).
      for (const t of TABLES) restored[t] = restoreTable(t, data[t]);

      // device_templates is a PARTIAL restore: built-ins stay, custom ones are
      // replaced. Custom IDs must NOT be preserved (they can collide with
      // built-in IDs, which differ across app versions), so we let SQLite assign
      // new IDs and remap template photo attachments to them.
      db.prepare('DELETE FROM device_templates WHERE is_custom = 1').run();
      const cols = new Set(tableColumns(db, 'device_templates'));
      const tplIdMap = {};
      let n = 0;
      for (const row of (data.device_templates || [])) {
        const keys = Object.keys(row).filter(k => cols.has(k) && k !== 'id');
        if (!keys.length) continue;
        if (row.sku && db.prepare('SELECT id FROM device_templates WHERE sku = ?').get(row.sku)) continue; // SKU collision with a built-in
        const r = db.prepare(`INSERT INTO device_templates (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`).run(...keys.map(k => row[k]));
        if (row.id != null) tplIdMap[row.id] = r.lastInsertRowid;
        n++;
      }
      restored.device_templates = n;

      // Repoint restored template attachments at the new custom-template IDs.
      for (const a of db.prepare(`SELECT id, entity_id FROM attachments WHERE entity_type='template'`).all()) {
        const newId = tplIdMap[a.entity_id];
        if (newId != null && newId !== a.entity_id) {
          db.prepare('UPDATE attachments SET entity_id = ? WHERE id = ?').run(newId, a.id);
        }
      }
    });
    tx();
  } catch (e) {
    db.exec('PRAGMA foreign_keys = ON');
    return res.status(500).json({ error: 'Restore failed: ' + e.message });
  }
  db.exec('PRAGMA foreign_keys = ON');

  // Restore uploaded files (extract uploads/ entries to UPLOAD_DIR)
  let filesRestored = 0;
  try {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    for (const entry of zip.getEntries()) {
      if (entry.isDirectory) continue;
      if (!entry.entryName.startsWith('uploads/')) continue;
      const rel = entry.entryName.slice('uploads/'.length);
      if (!rel || rel.includes('..')) continue;
      const dest = path.join(UPLOAD_DIR, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, entry.getData());
      filesRestored++;
    }
  } catch (e) {
    return res.status(207).json({ ok: true, restored, files_restored: filesRestored, warning: 'Data restored but some files failed: ' + e.message });
  }

  res.json({ ok: true, restored, files_restored: filesRestored });
});

module.exports = router;
