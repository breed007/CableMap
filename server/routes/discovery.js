const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');
const { scanSubnet } = require('../utils/discovery');
const { logHistory } = require('../utils/history');

// Run a subnet sweep and upsert results into the pending queue.
router.post('/scan', async (req, res) => {
  const db = getDb();
  const { cidr } = req.body;
  let found;
  try { found = await scanSubnet(cidr); }
  catch (e) { return res.status(400).json({ error: e.message }); }

  const existingByIp = new Set(db.prepare("SELECT management_ip FROM devices WHERE management_ip IS NOT NULL").all().map(r => r.management_ip));
  const upsert = db.prepare(`
    INSERT INTO discovered_devices (ip, mac, hostname, vendor, status, matched_device_id, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(ip) DO UPDATE SET
      mac = COALESCE(excluded.mac, discovered_devices.mac),
      hostname = COALESCE(excluded.hostname, discovered_devices.hostname),
      vendor = COALESCE(excluded.vendor, discovered_devices.vendor),
      matched_device_id = excluded.matched_device_id,
      last_seen = CURRENT_TIMESTAMP
  `);
  const matchDevice = db.prepare("SELECT id FROM devices WHERE management_ip = ?");

  const tx = db.transaction(() => {
    for (const h of found) {
      const match = existingByIp.has(h.ip) ? (matchDevice.get(h.ip)?.id || null) : null;
      const status = match ? 'imported' : 'pending';
      upsert.run(h.ip, h.mac, h.hostname, h.vendor, status, match);
    }
  });
  tx();

  res.json({ found: found.length, hosts: found });
});

// List discovered hosts (default: pending only).
router.get('/', (req, res) => {
  const db = getDb();
  const { status } = req.query;
  let sql = 'SELECT * FROM discovered_devices';
  const params = [];
  if (status) { sql += ' WHERE status = ?'; params.push(status); }
  else sql += " WHERE status = 'pending'";
  sql += ' ORDER BY ip';
  res.json(db.prepare(sql).all(...params));
});

// Approve a discovered host → create a device.
router.post('/:id/import', (req, res) => {
  const db = getDb();
  const d = db.prepare('SELECT * FROM discovered_devices WHERE id = ?').get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  const { name, device_type, location_id, monitor_enabled } = req.body;
  const finalName = (name && name.trim()) || d.hostname || d.ip;
  const type = (device_type && device_type.trim()) || 'other';
  const result = db.prepare(
    `INSERT INTO devices (name, device_type, make, management_ip, location_id, monitor_enabled, monitor_method, notes)
     VALUES (?, ?, ?, ?, ?, ?, 'ping', ?)`
  ).run(finalName, type, d.vendor || null, d.ip, location_id || null, monitor_enabled ? 1 : 0,
    d.mac ? `Discovered ${new Date().toISOString().slice(0, 10)} · MAC ${d.mac}` : `Discovered ${new Date().toISOString().slice(0, 10)}`);

  db.prepare("UPDATE discovered_devices SET status = 'imported', matched_device_id = ? WHERE id = ?").run(result.lastInsertRowid, req.params.id);
  logHistory(db, { entity_type: 'device', entity_id: result.lastInsertRowid, action: 'created', summary: `Imported ${finalName} (${d.ip}) from network scan`, device_a_id: result.lastInsertRowid });
  res.status(201).json({ device_id: result.lastInsertRowid });
});

router.post('/:id/ignore', (req, res) => {
  const db = getDb();
  const d = db.prepare('SELECT id FROM discovered_devices WHERE id = ?').get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  db.prepare("UPDATE discovered_devices SET status = 'ignored' WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM discovered_devices WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Clear ignored/imported entries from the queue.
router.post('/clear', (req, res) => {
  const db = getDb();
  db.prepare("DELETE FROM discovered_devices WHERE status != 'pending'").run();
  res.json({ ok: true });
});

module.exports = router;
