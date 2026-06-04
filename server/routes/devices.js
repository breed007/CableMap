const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/connection');
const { logHistory } = require('../utils/history');

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
const UPLOAD_DIR = path.resolve(DATA_DIR, 'uploads');

const DEVICE_TYPES = ['switch','patch_panel','wall_plate','router','nas','access_point','server','firewall','modem','media_converter','ups','pdu','shelf','blank','other'];

router.get('/', (req, res) => {
  const db = getDb();
  const { location_id, device_type } = req.query;
  let sql = `
    SELECT d.*, l.name as location_name, l.color as location_color,
      COUNT(p.id) as port_count,
      SUM(CASE WHEN EXISTS(
        SELECT 1 FROM connections c WHERE (c.port_a_id = p.id OR c.port_b_id = p.id) AND c.status = 'active'
      ) THEN 1 ELSE 0 END) as connected_port_count
    FROM devices d
    LEFT JOIN locations l ON d.location_id = l.id
    LEFT JOIN ports p ON p.device_id = d.id
  `;
  const conditions = [];
  const params = [];
  if (location_id) { conditions.push('d.location_id = ?'); params.push(location_id); }
  if (device_type) { conditions.push('d.device_type = ?'); params.push(device_type); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' GROUP BY d.id ORDER BY d.name';
  res.json(db.prepare(sql).all(...params));
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, device_type, make, model, os, form_factor, location_id, rack_unit_start, rack_unit_height, management_ip, notes, canvas_x, canvas_y, capacity_watts, capacity_va, breaker_amps } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  // device_type is free-text (custom types allowed); just require a non-empty value.
  if (!device_type || !String(device_type).trim()) return res.status(400).json({ error: 'device_type is required' });
  const result = db.prepare(
    `INSERT INTO devices (name, device_type, make, model, os, form_factor, location_id, rack_unit_start, rack_unit_height, management_ip, notes, canvas_x, canvas_y, capacity_watts, capacity_va, breaker_amps)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(name, device_type, make || null, model || null, os || null, form_factor || null, location_id || null, rack_unit_start || null, rack_unit_height || null, management_ip || null, notes || null, canvas_x || 0, canvas_y || 0, capacity_watts || null, capacity_va || null, breaker_amps || null);
  logHistory(db, { entity_type: 'device', entity_id: result.lastInsertRowid, action: 'created', summary: `Added device ${name} (${device_type})`, device_a_id: result.lastInsertRowid });
  res.status(201).json(getDeviceById(db, result.lastInsertRowid));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const device = getDeviceById(db, req.params.id);
  if (!device) return res.status(404).json({ error: 'Not found' });
  res.json(device);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
  if (!device) return res.status(404).json({ error: 'Not found' });
  const { name, device_type, make, model, os, form_factor, location_id, rack_unit_start, rack_unit_height, management_ip, notes, capacity_watts, capacity_va, breaker_amps } = req.body;
  if (device_type !== undefined && !String(device_type).trim()) return res.status(400).json({ error: 'device_type cannot be empty' });
  db.prepare(
    `UPDATE devices SET name=?, device_type=?, make=?, model=?, os=?, form_factor=?, location_id=?, rack_unit_start=?, rack_unit_height=?, management_ip=?, notes=?, capacity_watts=?, capacity_va=?, breaker_amps=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`
  ).run(name, device_type, make || null, model || null, os || null, form_factor || null, location_id || null, rack_unit_start || null, rack_unit_height || null, management_ip || null, notes || null,
    capacity_watts !== undefined ? (capacity_watts || null) : device.capacity_watts,
    capacity_va !== undefined ? (capacity_va || null) : device.capacity_va,
    breaker_amps !== undefined ? (breaker_amps || null) : device.breaker_amps,
    req.params.id);
  // Record notable field changes
  const changes = [];
  if (name !== undefined && name !== device.name) changes.push(`renamed to ${name}`);
  if (os !== undefined && (os || null) !== device.os) changes.push(`OS → ${os || '—'}`);
  if (location_id !== undefined && (Number(location_id) || null) !== device.location_id) changes.push('moved location');
  const rs = rack_unit_start === '' ? null : (rack_unit_start ?? device.rack_unit_start);
  if (rack_unit_start !== undefined && (rs ? Number(rs) : null) !== device.rack_unit_start) changes.push('rack position changed');
  logHistory(db, { entity_type: 'device', entity_id: Number(req.params.id), action: 'updated', summary: `Edited ${name || device.name}${changes.length ? ': ' + changes.join(', ') : ''}`, device_a_id: Number(req.params.id) });
  res.json(getDeviceById(db, req.params.id));
});

router.put('/:id/position', (req, res) => {
  const db = getDb();
  const { canvas_x, canvas_y } = req.body;
  db.prepare('UPDATE devices SET canvas_x=?, canvas_y=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
    .run(canvas_x, canvas_y, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
  if (!device) return res.status(404).json({ error: 'Not found' });
  // Clean up device photos (polymorphic, no FK cascade)
  const photos = db.prepare(`SELECT filename FROM attachments WHERE entity_type='device' AND entity_id=?`).all(req.params.id);
  db.prepare(`DELETE FROM attachments WHERE entity_type='device' AND entity_id=?`).run(req.params.id);
  for (const p of photos) fs.unlink(path.join(UPLOAD_DIR, p.filename), () => {});
  db.prepare('DELETE FROM devices WHERE id = ?').run(req.params.id);
  logHistory(db, { entity_type: 'device', entity_id: Number(req.params.id), action: 'deleted', summary: `Deleted device ${device.name} (${device.device_type})` });
  res.json({ ok: true });
});

router.post('/:id/ports/bulk-create', (req, res) => {
  const db = getDb();
  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.params.id);
  if (!device) return res.status(404).json({ error: 'Not found' });

  const { count, prefix, port_type, speed, is_patch_panel } = req.body;
  if (!count || count < 1) return res.status(400).json({ error: 'count required' });

  const insertPort = db.prepare(
    `INSERT INTO ports (device_id, label, port_number, port_type, speed, is_uplink, panel_side)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const createdPorts = [];
  const updateLinked = db.prepare('UPDATE ports SET linked_port_id=? WHERE id=?');

  const createPorts = db.transaction(() => {
    if (is_patch_panel || device.device_type === 'patch_panel') {
      for (let i = 1; i <= count; i++) {
        const label = prefix ? `${prefix}${i}` : `Port ${i}`;
        const frontResult = insertPort.run(device.id, label, i, port_type || 'rj45', speed || '1g', 0, 'front');
        const backResult = insertPort.run(device.id, label, i, port_type || 'rj45', speed || '1g', 0, 'back');
        updateLinked.run(backResult.lastInsertRowid, frontResult.lastInsertRowid);
        updateLinked.run(frontResult.lastInsertRowid, backResult.lastInsertRowid);
        createdPorts.push(
          db.prepare('SELECT * FROM ports WHERE id=?').get(frontResult.lastInsertRowid),
          db.prepare('SELECT * FROM ports WHERE id=?').get(backResult.lastInsertRowid)
        );
      }
    } else {
      for (let i = 1; i <= count; i++) {
        const label = prefix ? `${prefix}${i}` : `Port ${i}`;
        const result = insertPort.run(device.id, label, i, port_type || 'rj45', speed || '1g', 0, null);
        createdPorts.push(db.prepare('SELECT * FROM ports WHERE id=?').get(result.lastInsertRowid));
      }
    }
  });

  createPorts();
  res.status(201).json(createdPorts);
});

function getDeviceById(db, id) {
  const device = db.prepare(`
    SELECT d.*, l.name as location_name, l.color as location_color
    FROM devices d LEFT JOIN locations l ON d.location_id = l.id
    WHERE d.id = ?
  `).get(id);
  if (!device) return null;
  device.ports = db.prepare(`
    SELECT p.*,
      CASE WHEN EXISTS(
        SELECT 1 FROM connections c WHERE (c.port_a_id = p.id OR c.port_b_id = p.id)
      ) THEN 1 ELSE 0 END as is_connected
    FROM ports p WHERE p.device_id = ? ORDER BY p.panel_side, p.port_number, p.label
  `).all(id);

  // Power outlets this device provides (UPS/PDU), with what's plugged in
  device.outlets = db.prepare(`
    SELECT o.*,
      pc.id as power_connection_id, pc.watts as connected_watts,
      cd.id as connected_device_id, cd.name as connected_device_name, cd.device_type as connected_device_type
    FROM power_outlets o
    LEFT JOIN power_connections pc ON pc.outlet_id = o.id
    LEFT JOIN devices cd ON pc.device_id = cd.id
    WHERE o.device_id = ? ORDER BY o.outlet_number, o.id
  `).all(id);

  // Power feeds: outlets that power THIS device (its PSUs)
  device.power_feeds = db.prepare(`
    SELECT pc.id as power_connection_id, pc.watts,
      o.id as outlet_id, o.label as outlet_label, o.outlet_type,
      sd.id as source_device_id, sd.name as source_device_name, sd.device_type as source_device_type
    FROM power_connections pc
    JOIN power_outlets o ON pc.outlet_id = o.id
    JOIN devices sd ON o.device_id = sd.id
    WHERE pc.device_id = ?
  `).all(id);

  // Load rollup for power sources (UPS/PDU): connected draw vs rated capacity
  const totalOutlets = device.outlets.length;
  const usedOutlets = device.outlets.filter(o => o.connected_device_id).length;
  const connectedWatts = device.outlets.reduce((s, o) => s + (o.connected_watts || 0), 0);
  device.power = {
    capacity_watts: device.capacity_watts || null,
    capacity_va: device.capacity_va || null,
    breaker_amps: device.breaker_amps || null,
    total_outlets: totalOutlets,
    used_outlets: usedOutlets,
    connected_watts: connectedWatts,
    load_pct: device.capacity_watts ? Math.round((connectedWatts / device.capacity_watts) * 100) : null,
    overloaded: device.capacity_watts ? connectedWatts > device.capacity_watts : false,
  };

  return device;
}

module.exports = router;
