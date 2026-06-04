const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/connection');
const { logHistory } = require('../utils/history');

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
const UPLOAD_DIR = path.resolve(DATA_DIR, 'uploads');

const CONNECTION_SELECT = `
  SELECT c.*,
    pa.label as port_a_label, pa.port_type as port_a_type,
    da.id as device_a_id, da.name as device_a_name,
    la.name as location_a_name,
    pb.label as port_b_label, pb.port_type as port_b_type,
    db_.id as device_b_id, db_.name as device_b_name,
    lb.name as location_b_name,
    v.name as vlan_name, v.vlan_id as vlan_number, v.color as vlan_color
  FROM connections c
  JOIN ports pa ON c.port_a_id = pa.id
  JOIN devices da ON pa.device_id = da.id
  LEFT JOIN locations la ON da.location_id = la.id
  JOIN ports pb ON c.port_b_id = pb.id
  JOIN devices db_ ON pb.device_id = db_.id
  LEFT JOIN locations lb ON db_.location_id = lb.id
  LEFT JOIN vlans v ON c.vlan_id = v.id
`;

router.get('/', (req, res) => {
  const db = getDb();
  const { location_id, vlan_id, cable_type, status, q } = req.query;
  let sql = CONNECTION_SELECT;
  const conditions = [];
  const params = [];

  if (location_id) {
    conditions.push('(da.location_id = ? OR db_.location_id = ?)');
    params.push(location_id, location_id);
  }
  if (vlan_id) { conditions.push('c.vlan_id = ?'); params.push(vlan_id); }
  if (cable_type) { conditions.push('c.cable_type = ?'); params.push(cable_type); }
  if (status) { conditions.push('c.status = ?'); params.push(status); }
  if (q) {
    conditions.push('(da.name LIKE ? OR db_.name LIKE ? OR pa.label LIKE ? OR pb.label LIKE ? OR c.notes LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like, like, like);
  }

  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY c.created_at DESC';

  res.json(db.prepare(sql).all(...params));
});

router.post('/', (req, res) => {
  const db = getDb();
  const { port_a_id, port_b_id, cable_type, cable_color, cable_length_ft, vlan_id, status, notes } = req.body;

  if (!port_a_id || !port_b_id) return res.status(400).json({ error: 'port_a_id and port_b_id required' });
  if (port_a_id === port_b_id) return res.status(400).json({ error: 'port_a_id and port_b_id must differ' });

  const portA = db.prepare('SELECT id FROM ports WHERE id = ?').get(port_a_id);
  const portB = db.prepare('SELECT id FROM ports WHERE id = ?').get(port_b_id);
  if (!portA || !portB) return res.status(400).json({ error: 'One or both ports not found' });

  // Check port conflict (active connections only)
  if (status === 'active' || !status) {
    const conflict = db.prepare(`
      SELECT id FROM connections
      WHERE (port_a_id = ? OR port_b_id = ? OR port_a_id = ? OR port_b_id = ?) AND status = 'active'
    `).get(port_a_id, port_a_id, port_b_id, port_b_id);
    if (conflict) return res.status(409).json({ error: 'One or both ports already have an active connection' });
  }

  const result = db.prepare(
    `INSERT INTO connections (port_a_id, port_b_id, cable_type, cable_color, cable_length_ft, vlan_id, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(port_a_id, port_b_id, cable_type || 'cat6', cable_color || null, cable_length_ft || null, vlan_id || null, status || 'active', notes || null);

  const created = db.prepare(CONNECTION_SELECT + ' WHERE c.id = ?').get(result.lastInsertRowid);
  logHistory(db, {
    entity_type: 'connection', entity_id: created.id, action: 'created',
    summary: `Connected ${created.device_a_name}/${created.port_a_label} ↔ ${created.device_b_name}/${created.port_b_label} (${created.cable_type})`,
    device_a_id: created.device_a_id, device_b_id: created.device_b_id,
  });
  res.status(201).json(created);
});

// Bulk patch: create many connections at once (e.g. switch ports 1-24 -> panel
// ports 1-24). Validates each row (ports exist, differ, no active conflict —
// including conflicts within the same batch) and creates the valid ones.
router.post('/bulk', (req, res) => {
  const db = getDb();
  const rows = Array.isArray(req.body.connections) ? req.body.connections : [];
  if (rows.length === 0) return res.status(400).json({ error: 'connections array required' });
  if (rows.length > 500) return res.status(400).json({ error: 'Too many connections in one batch (max 500)' });

  const created = [];
  const errors = [];
  const usedInBatch = new Set(); // port ids claimed by active rows in this batch

  const insert = db.prepare(
    `INSERT INTO connections (port_a_id, port_b_id, cable_type, cable_color, cable_length_ft, vlan_id, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const activeConflict = db.prepare(`
    SELECT id FROM connections
    WHERE (port_a_id = ? OR port_b_id = ? OR port_a_id = ? OR port_b_id = ?) AND status = 'active'
  `);
  const portExists = db.prepare('SELECT id FROM ports WHERE id = ?');

  const tx = db.transaction(() => {
    rows.forEach((row, i) => {
      const { port_a_id, port_b_id, cable_type, cable_color, cable_length_ft, vlan_id, status, notes } = row;
      const a = Number(port_a_id), b = Number(port_b_id);
      if (!a || !b) { errors.push({ index: i, error: 'Both ports required' }); return; }
      if (a === b) { errors.push({ index: i, error: 'Ports must differ' }); return; }
      if (!portExists.get(a) || !portExists.get(b)) { errors.push({ index: i, error: 'Port not found' }); return; }

      const st = status || 'active';
      if (st === 'active') {
        if (usedInBatch.has(a) || usedInBatch.has(b)) { errors.push({ index: i, error: 'Port used twice in this batch' }); return; }
        if (activeConflict.get(a, a, b, b)) { errors.push({ index: i, error: 'Port already has an active connection' }); return; }
      }

      const r = insert.run(a, b, cable_type || 'cat6', cable_color || null, cable_length_ft || null, vlan_id || null, st, notes || null);
      if (st === 'active') { usedInBatch.add(a); usedInBatch.add(b); }
      created.push(db.prepare(CONNECTION_SELECT + ' WHERE c.id = ?').get(r.lastInsertRowid));
    });
  });
  tx();

  if (created.length > 0) {
    const first = created[0], last = created[created.length - 1];
    logHistory(db, {
      entity_type: 'connection', entity_id: null, action: 'created',
      summary: `Bulk-patched ${created.length} connection${created.length !== 1 ? 's' : ''} (${first.device_a_name} ↔ ${first.device_b_name}${created.length > 1 ? `, …${last.device_a_name} ↔ ${last.device_b_name}` : ''})`,
      device_a_id: first.device_a_id, device_b_id: first.device_b_id,
      meta: { count: created.length, ids: created.map(c => c.id) },
    });
  }
  res.status(created.length ? 201 : 422).json({ created: created.length, errors, connections: created });
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const conn = db.prepare(CONNECTION_SELECT + ' WHERE c.id = ?').get(req.params.id);
  if (!conn) return res.status(404).json({ error: 'Not found' });
  res.json(conn);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM connections WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const { port_a_id, port_b_id, cable_type, cable_color, cable_length_ft, vlan_id, status, notes } = req.body;
  const newPortA = port_a_id || existing.port_a_id;
  const newPortB = port_b_id || existing.port_b_id;
  const newStatus = status || existing.status;

  if (newPortA === newPortB) return res.status(400).json({ error: 'port_a_id and port_b_id must differ' });

  if (newStatus === 'active') {
    const conflict = db.prepare(`
      SELECT id FROM connections
      WHERE (port_a_id = ? OR port_b_id = ? OR port_a_id = ? OR port_b_id = ?) AND status = 'active' AND id != ?
    `).get(newPortA, newPortA, newPortB, newPortB, req.params.id);
    if (conflict) return res.status(409).json({ error: 'One or both ports already have an active connection' });
  }

  db.prepare(
    `UPDATE connections SET port_a_id=?, port_b_id=?, cable_type=?, cable_color=?, cable_length_ft=?, vlan_id=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`
  ).run(newPortA, newPortB, cable_type || existing.cable_type, cable_color !== undefined ? cable_color : existing.cable_color, cable_length_ft !== undefined ? cable_length_ft : existing.cable_length_ft, vlan_id !== undefined ? vlan_id : existing.vlan_id, newStatus, notes !== undefined ? notes : existing.notes, req.params.id);

  const updated = db.prepare(CONNECTION_SELECT + ' WHERE c.id = ?').get(req.params.id);
  const repatched = newPortA !== existing.port_a_id || newPortB !== existing.port_b_id;
  logHistory(db, {
    entity_type: 'connection', entity_id: updated.id, action: repatched ? 'moved' : 'updated',
    summary: `${repatched ? 'Re-patched' : 'Edited'} ${updated.device_a_name}/${updated.port_a_label} ↔ ${updated.device_b_name}/${updated.port_b_label}${newStatus !== existing.status ? ` · status → ${newStatus}` : ''}`,
    device_a_id: updated.device_a_id, device_b_id: updated.device_b_id,
  });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const conn = db.prepare(CONNECTION_SELECT + ' WHERE c.id = ?').get(req.params.id);
  if (!conn) return res.status(404).json({ error: 'Not found' });
  const photos = db.prepare(`SELECT filename FROM attachments WHERE entity_type='connection' AND entity_id=?`).all(req.params.id);
  db.prepare(`DELETE FROM attachments WHERE entity_type='connection' AND entity_id=?`).run(req.params.id);
  for (const p of photos) fs.unlink(path.join(UPLOAD_DIR, p.filename), () => {});
  db.prepare('DELETE FROM connections WHERE id = ?').run(req.params.id);
  logHistory(db, {
    entity_type: 'connection', entity_id: Number(req.params.id), action: 'deleted',
    summary: `Removed connection ${conn.device_a_name}/${conn.port_a_label} ↔ ${conn.device_b_name}/${conn.port_b_label}`,
    device_a_id: conn.device_a_id, device_b_id: conn.device_b_id,
  });
  res.json({ ok: true });
});

module.exports = router;
