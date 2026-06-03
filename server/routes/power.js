const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');
const { logHistory } = require('../utils/history');

const OUTLET_TYPES = ['nema_5_15', 'nema_5_20', 'c13', 'c19', 'other'];

function deviceName(db, id) {
  const d = db.prepare('SELECT name FROM devices WHERE id = ?').get(id);
  return d ? d.name : `device ${id}`;
}

// ── Outlets ──────────────────────────────────────────────────────────────────

router.get('/outlets', (req, res) => {
  const db = getDb();
  const { device_id } = req.query;
  let sql = `
    SELECT o.*,
      pc.id as power_connection_id, pc.watts as connected_watts,
      cd.id as connected_device_id, cd.name as connected_device_name, cd.device_type as connected_device_type
    FROM power_outlets o
    LEFT JOIN power_connections pc ON pc.outlet_id = o.id
    LEFT JOIN devices cd ON pc.device_id = cd.id
  `;
  const params = [];
  if (device_id) { sql += ' WHERE o.device_id = ?'; params.push(device_id); }
  sql += ' ORDER BY o.outlet_number, o.id';
  res.json(db.prepare(sql).all(...params));
});

router.post('/outlets/bulk-create', (req, res) => {
  const db = getDb();
  const { device_id, count, prefix, outlet_type, max_watts } = req.body;
  if (!device_id) return res.status(400).json({ error: 'device_id required' });
  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(device_id);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  if (!count || count < 1) return res.status(400).json({ error: 'count required' });
  const type = OUTLET_TYPES.includes(outlet_type) ? outlet_type : 'nema_5_15';

  const existing = db.prepare('SELECT COUNT(*) c FROM power_outlets WHERE device_id = ?').get(device_id).c;
  const insert = db.prepare(
    'INSERT INTO power_outlets (device_id, outlet_number, label, outlet_type, max_watts) VALUES (?, ?, ?, ?, ?)'
  );
  const created = [];
  const tx = db.transaction(() => {
    for (let i = 1; i <= count; i++) {
      const num = existing + i;
      const label = `${prefix || 'Outlet '}${num}`;
      const r = insert.run(device_id, num, label, type, max_watts || null);
      created.push(db.prepare('SELECT * FROM power_outlets WHERE id = ?').get(r.lastInsertRowid));
    }
  });
  tx();
  res.status(201).json(created);
});

router.post('/outlets', (req, res) => {
  const db = getDb();
  const { device_id, label, outlet_type, max_watts, notes } = req.body;
  if (!device_id || !label) return res.status(400).json({ error: 'device_id and label required' });
  const num = (db.prepare('SELECT COALESCE(MAX(outlet_number),0) m FROM power_outlets WHERE device_id = ?').get(device_id).m) + 1;
  const r = db.prepare(
    'INSERT INTO power_outlets (device_id, outlet_number, label, outlet_type, max_watts, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(device_id, num, label, OUTLET_TYPES.includes(outlet_type) ? outlet_type : 'nema_5_15', max_watts || null, notes || null);
  res.status(201).json(db.prepare('SELECT * FROM power_outlets WHERE id = ?').get(r.lastInsertRowid));
});

router.put('/outlets/:id', (req, res) => {
  const db = getDb();
  const o = db.prepare('SELECT * FROM power_outlets WHERE id = ?').get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  const { label, outlet_type, max_watts, notes } = req.body;
  db.prepare('UPDATE power_outlets SET label=?, outlet_type=?, max_watts=?, notes=? WHERE id=?')
    .run(label ?? o.label, OUTLET_TYPES.includes(outlet_type) ? outlet_type : o.outlet_type, max_watts !== undefined ? max_watts : o.max_watts, notes !== undefined ? notes : o.notes, req.params.id);
  res.json(db.prepare('SELECT * FROM power_outlets WHERE id = ?').get(req.params.id));
});

router.delete('/outlets/:id', (req, res) => {
  const db = getDb();
  const o = db.prepare('SELECT id FROM power_outlets WHERE id = ?').get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM power_outlets WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Power connections ────────────────────────────────────────────────────────

const PC_SELECT = `
  SELECT pc.*,
    o.label as outlet_label, o.outlet_type, o.device_id as source_device_id,
    sd.name as source_device_name, sd.device_type as source_device_type,
    d.name as device_name, d.device_type as device_type
  FROM power_connections pc
  JOIN power_outlets o ON pc.outlet_id = o.id
  JOIN devices sd ON o.device_id = sd.id
  JOIN devices d ON pc.device_id = d.id
`;

router.get('/connections', (req, res) => {
  const db = getDb();
  const { device_id, source_id } = req.query;
  let sql = PC_SELECT;
  const conditions = [];
  const params = [];
  if (device_id) { conditions.push('pc.device_id = ?'); params.push(device_id); }
  if (source_id) { conditions.push('o.device_id = ?'); params.push(source_id); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY pc.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/connections', (req, res) => {
  const db = getDb();
  const { outlet_id, device_id, watts, notes } = req.body;
  if (!outlet_id || !device_id) return res.status(400).json({ error: 'outlet_id and device_id required' });

  const outlet = db.prepare('SELECT * FROM power_outlets WHERE id = ?').get(outlet_id);
  if (!outlet) return res.status(400).json({ error: 'Outlet not found' });
  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(device_id);
  if (!device) return res.status(400).json({ error: 'Device not found' });
  if (outlet.device_id === Number(device_id)) return res.status(400).json({ error: 'A device cannot power itself' });

  const inUse = db.prepare('SELECT id FROM power_connections WHERE outlet_id = ?').get(outlet_id);
  if (inUse) return res.status(409).json({ error: 'That outlet is already powering a device' });

  const r = db.prepare(
    'INSERT INTO power_connections (outlet_id, device_id, watts, notes) VALUES (?, ?, ?, ?)'
  ).run(outlet_id, device_id, watts || null, notes || null);

  logHistory(db, {
    entity_type: 'power_connection', entity_id: r.lastInsertRowid, action: 'created',
    summary: `Powered ${device.name} from ${deviceName(db, outlet.device_id)} / ${outlet.label}`,
    device_a_id: outlet.device_id, device_b_id: Number(device_id),
  });

  res.status(201).json(db.prepare(PC_SELECT + ' WHERE pc.id = ?').get(r.lastInsertRowid));
});

router.put('/connections/:id', (req, res) => {
  const db = getDb();
  const pc = db.prepare('SELECT * FROM power_connections WHERE id = ?').get(req.params.id);
  if (!pc) return res.status(404).json({ error: 'Not found' });
  const { watts, notes } = req.body;
  db.prepare('UPDATE power_connections SET watts=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
    .run(watts !== undefined ? watts : pc.watts, notes !== undefined ? notes : pc.notes, req.params.id);
  res.json(db.prepare(PC_SELECT + ' WHERE pc.id = ?').get(req.params.id));
});

router.delete('/connections/:id', (req, res) => {
  const db = getDb();
  const pc = db.prepare(PC_SELECT + ' WHERE pc.id = ?').get(req.params.id);
  if (!pc) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM power_connections WHERE id = ?').run(req.params.id);
  logHistory(db, {
    entity_type: 'power_connection', entity_id: Number(req.params.id), action: 'deleted',
    summary: `Unplugged ${pc.device_name} from ${pc.source_device_name} / ${pc.outlet_label}`,
    device_a_id: pc.source_device_id, device_b_id: pc.device_id,
  });
  res.json({ ok: true });
});

module.exports = router;
