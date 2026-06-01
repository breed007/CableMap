const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

router.get('/', (req, res) => {
  const db = getDb();
  const vlans = db.prepare(`
    SELECT v.*, COUNT(c.id) as connection_count
    FROM vlans v
    LEFT JOIN connections c ON c.vlan_id = v.id
    GROUP BY v.id
    ORDER BY v.vlan_id
  `).all();
  res.json(vlans);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { vlan_id, name, description, color } = req.body;
  if (!vlan_id || !name) return res.status(400).json({ error: 'vlan_id and name required' });
  if (vlan_id < 1 || vlan_id > 4094) return res.status(400).json({ error: 'vlan_id must be 1-4094' });
  const existing = db.prepare('SELECT id FROM vlans WHERE vlan_id = ?').get(vlan_id);
  if (existing) return res.status(409).json({ error: `VLAN ${vlan_id} already exists` });
  const result = db.prepare(
    'INSERT INTO vlans (vlan_id, name, description, color) VALUES (?, ?, ?, ?)'
  ).run(vlan_id, name, description || null, color || '#6B7280');
  res.status(201).json(db.prepare('SELECT * FROM vlans WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const vlan = db.prepare('SELECT id FROM vlans WHERE id = ?').get(req.params.id);
  if (!vlan) return res.status(404).json({ error: 'Not found' });
  const { vlan_id, name, description, color } = req.body;
  db.prepare('UPDATE vlans SET vlan_id=?, name=?, description=?, color=? WHERE id=?')
    .run(vlan_id, name, description || null, color || '#6B7280', req.params.id);
  res.json(db.prepare('SELECT * FROM vlans WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const vlan = db.prepare('SELECT id FROM vlans WHERE id = ?').get(req.params.id);
  if (!vlan) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE connections SET vlan_id = NULL WHERE vlan_id = ?').run(req.params.id);
  db.prepare('DELETE FROM vlans WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/:id/connections', (req, res) => {
  const db = getDb();
  const connections = db.prepare(`
    SELECT c.*,
      pa.label as port_a_label, da.name as device_a_name,
      pb.label as port_b_label, db_.name as device_b_name
    FROM connections c
    JOIN ports pa ON c.port_a_id = pa.id JOIN devices da ON pa.device_id = da.id
    JOIN ports pb ON c.port_b_id = pb.id JOIN devices db_ ON pb.device_id = db_.id
    WHERE c.vlan_id = ?
    ORDER BY c.created_at DESC
  `).all(req.params.id);
  res.json(connections);
});

module.exports = router;
