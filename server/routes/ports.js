const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');
const { tracePath } = require('../utils/tracePath');

router.get('/:id', (req, res) => {
  const db = getDb();
  const port = db.prepare(`
    SELECT p.*, d.name as device_name, d.device_type,
      lp.label as linked_port_label, lp.panel_side as linked_panel_side
    FROM ports p
    JOIN devices d ON p.device_id = d.id
    LEFT JOIN ports lp ON p.linked_port_id = lp.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!port) return res.status(404).json({ error: 'Not found' });

  const connection = db.prepare(`
    SELECT c.*,
      pa.id as port_a_id, pa.label as port_a_label, da.id as device_a_id, da.name as device_a_name,
      pb.id as port_b_id, pb.label as port_b_label, db_.id as device_b_id, db_.name as device_b_name,
      v.name as vlan_name, v.color as vlan_color
    FROM connections c
    JOIN ports pa ON c.port_a_id = pa.id
    JOIN devices da ON pa.device_id = da.id
    JOIN ports pb ON c.port_b_id = pb.id
    JOIN devices db_ ON pb.device_id = db_.id
    LEFT JOIN vlans v ON c.vlan_id = v.id
    WHERE c.port_a_id = ? OR c.port_b_id = ?
    LIMIT 1
  `).get(req.params.id, req.params.id);

  res.json({ ...port, connection: connection || null });
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const port = db.prepare('SELECT id FROM ports WHERE id = ?').get(req.params.id);
  if (!port) return res.status(404).json({ error: 'Not found' });
  const { label, port_type, speed, is_uplink, notes } = req.body;
  db.prepare('UPDATE ports SET label=?, port_type=?, speed=?, is_uplink=?, notes=? WHERE id=?')
    .run(label, port_type, speed, is_uplink ? 1 : 0, notes || null, req.params.id);
  res.json(db.prepare('SELECT * FROM ports WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const port = db.prepare('SELECT id FROM ports WHERE id = ?').get(req.params.id);
  if (!port) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM ports WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.get('/:id/trace', (req, res) => {
  const steps = tracePath(req.params.id);
  res.json(steps);
});

module.exports = router;
