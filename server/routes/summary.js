const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

router.get('/', (req, res) => {
  const db = getDb();

  const total_devices = db.prepare('SELECT COUNT(*) as c FROM devices').get().c;
  const total_ports = db.prepare('SELECT COUNT(*) as c FROM ports').get().c;
  const total_connections = db.prepare('SELECT COUNT(*) as c FROM connections').get().c;
  const total_vlans = db.prepare('SELECT COUNT(*) as c FROM vlans').get().c;
  const total_photos = db.prepare('SELECT COUNT(*) as c FROM attachments').get().c;
  const total_racks = db.prepare('SELECT COUNT(*) as c FROM locations WHERE is_rack = 1').get().c;

  const connected_port_ids = db.prepare(`
    SELECT port_a_id as id FROM connections UNION SELECT port_b_id FROM connections
  `).all().map(r => r.id);
  const unconnected_port_count = total_ports - connected_port_ids.length;

  const recent_connections = db.prepare(`
    SELECT c.*, c.updated_at as activity_at,
      pa.label as port_a_label, da.name as device_a_name,
      pb.label as port_b_label, db_.name as device_b_name
    FROM connections c
    JOIN ports pa ON c.port_a_id = pa.id JOIN devices da ON pa.device_id = da.id
    JOIN ports pb ON c.port_b_id = pb.id JOIN devices db_ ON pb.device_id = db_.id
    ORDER BY c.updated_at DESC LIMIT 10
  `).all();

  const devices_no_ports = db.prepare(`
    SELECT d.id, d.name, d.device_type FROM devices d
    WHERE NOT EXISTS (SELECT 1 FROM ports p WHERE p.device_id = d.id)
  `).all();

  const planned_connections = db.prepare(`
    SELECT COUNT(*) as c FROM connections WHERE status = 'planned'
  `).get().c;

  res.json({
    total_devices,
    total_ports,
    total_connections,
    total_vlans,
    total_photos,
    total_racks,
    unconnected_port_count,
    recent_connections,
    alerts: {
      devices_no_ports,
      planned_connections,
    },
  });
});

module.exports = router;
