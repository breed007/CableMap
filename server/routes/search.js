const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

router.get('/', (req, res) => {
  const db = getDb();
  const { q } = req.query;
  if (!q || q.trim().length < 1) return res.json({ devices: [], ports: [], connections: [], vlans: [] });

  const like = `%${q}%`;

  const devices = db.prepare(`
    SELECT d.id, d.name, d.device_type, d.make, d.model, d.management_ip, l.name as location_name
    FROM devices d LEFT JOIN locations l ON d.location_id = l.id
    WHERE d.name LIKE ? OR d.make LIKE ? OR d.model LIKE ? OR d.management_ip LIKE ? OR d.notes LIKE ?
    LIMIT 20
  `).all(like, like, like, like, like);

  const ports = db.prepare(`
    SELECT p.id, p.label, p.port_type, p.speed, p.notes, d.id as device_id, d.name as device_name, d.device_type
    FROM ports p JOIN devices d ON p.device_id = d.id
    WHERE p.label LIKE ? OR p.notes LIKE ?
    LIMIT 20
  `).all(like, like);

  const connections = db.prepare(`
    SELECT c.id, c.cable_type, c.status, c.notes,
      pa.label as port_a_label, da.name as device_a_name, da.id as device_a_id,
      pb.label as port_b_label, db_.name as device_b_name, db_.id as device_b_id
    FROM connections c
    JOIN ports pa ON c.port_a_id = pa.id JOIN devices da ON pa.device_id = da.id
    JOIN ports pb ON c.port_b_id = pb.id JOIN devices db_ ON pb.device_id = db_.id
    WHERE da.name LIKE ? OR db_.name LIKE ? OR pa.label LIKE ? OR pb.label LIKE ? OR c.notes LIKE ?
    LIMIT 20
  `).all(like, like, like, like, like);

  const vlans = db.prepare(`
    SELECT * FROM vlans WHERE name LIKE ? OR description LIKE ? OR CAST(vlan_id AS TEXT) LIKE ?
    LIMIT 10
  `).all(like, like, like);

  res.json({ devices, ports, connections, vlans });
});

module.exports = router;
