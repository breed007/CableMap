const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

// Types that normally draw mains power from a UPS/PDU outlet (used to flag
// devices missing a power mapping). APs are excluded (PoE); passive rack
// occupants and the power sources themselves are excluded too.
const MAINS_POWERED = ['switch', 'router', 'nas', 'server', 'firewall', 'modem', 'media_converter'];
// Types where having zero ports is expected.
const PORTLESS_OK = ['ups', 'pdu', 'shelf', 'blank', 'wall_plate'];

router.get('/', (req, res) => {
  const db = getDb();

  // 1. Ports in more than one active connection (shouldn't happen via the API,
  //    but a CSV import or restore could introduce it).
  const portsDoubleBooked = db.prepare(`
    SELECT p.id as port_id, p.label, d.id as device_id, d.name as device_name, x.c as active_count
    FROM (
      SELECT port_id, COUNT(*) c FROM (
        SELECT port_a_id as port_id FROM connections WHERE status='active'
        UNION ALL
        SELECT port_b_id FROM connections WHERE status='active'
      ) GROUP BY port_id HAVING c > 1
    ) x
    JOIN ports p ON p.id = x.port_id
    JOIN devices d ON p.device_id = d.id
  `).all();

  // 2. Rack-unit overlaps: two devices claiming the same U in one rack.
  const racked = db.prepare(`
    SELECT d.id, d.name, d.location_id, l.name as location_name, d.rack_unit_start, COALESCE(d.rack_unit_height,1) as h
    FROM devices d JOIN locations l ON d.location_id = l.id
    WHERE d.rack_unit_start IS NOT NULL ORDER BY d.location_id, d.rack_unit_start
  `).all();
  const rackOverlaps = [];
  const byLoc = {};
  for (const d of racked) (byLoc[d.location_id] ||= []).push(d);
  for (const loc of Object.values(byLoc)) {
    for (let i = 0; i < loc.length; i++) {
      for (let j = i + 1; j < loc.length; j++) {
        const a = loc[i], b = loc[j];
        if (a.rack_unit_start < b.rack_unit_start + b.h && b.rack_unit_start < a.rack_unit_start + a.h) {
          rackOverlaps.push({
            location_name: a.location_name,
            a_id: a.id, a_name: a.name, a_u: `U${a.rack_unit_start}${a.h > 1 ? `–${a.rack_unit_start + a.h - 1}` : ''}`,
            b_id: b.id, b_name: b.name, b_u: `U${b.rack_unit_start}${b.h > 1 ? `–${b.rack_unit_start + b.h - 1}` : ''}`,
          });
        }
      }
    }
  }

  // 3. Mains-powered devices with no power mapping.
  const powerUnmapped = db.prepare(`
    SELECT d.id, d.name, d.device_type
    FROM devices d
    WHERE d.device_type IN (${MAINS_POWERED.map(() => '?').join(',')})
      AND NOT EXISTS (SELECT 1 FROM power_connections pc WHERE pc.device_id = d.id)
    ORDER BY d.name
  `).all(...MAINS_POWERED);

  // 4. Overloaded power sources (connected draw exceeds rated capacity).
  const upsOverloaded = db.prepare(`
    SELECT d.id, d.name, d.device_type, d.capacity_watts,
      (SELECT COALESCE(SUM(pc.watts),0) FROM power_connections pc JOIN power_outlets o ON pc.outlet_id=o.id WHERE o.device_id = d.id) as connected_watts
    FROM devices d
    WHERE d.capacity_watts IS NOT NULL
  `).all().filter(d => d.connected_watts > d.capacity_watts)
    .map(d => ({ ...d, load_pct: Math.round((d.connected_watts / d.capacity_watts) * 100) }));

  // 5. Planned connections never activated.
  const plannedConnections = db.prepare(`
    SELECT c.id, c.cable_type, c.created_at,
      pa.label as port_a_label, da.name as device_a_name,
      pb.label as port_b_label, db_.name as device_b_name
    FROM connections c
    JOIN ports pa ON c.port_a_id = pa.id JOIN devices da ON pa.device_id = da.id
    JOIN ports pb ON c.port_b_id = pb.id JOIN devices db_ ON pb.device_id = db_.id
    WHERE c.status = 'planned' ORDER BY c.created_at
  `).all();

  // 6. Active devices with no ports defined.
  const devicesNoPorts = db.prepare(`
    SELECT d.id, d.name, d.device_type FROM devices d
    WHERE d.device_type NOT IN (${PORTLESS_OK.map(() => '?').join(',')})
      AND NOT EXISTS (SELECT 1 FROM ports p WHERE p.device_id = d.id)
    ORDER BY d.name
  `).all(...PORTLESS_OK);

  const checks = [
    { key: 'ports_double_booked', label: 'Ports in multiple active connections', severity: 'error', items: portsDoubleBooked },
    { key: 'rack_overlaps', label: 'Devices overlapping in the same rack U', severity: 'error', items: rackOverlaps },
    { key: 'ups_overloaded', label: 'Power sources over rated capacity', severity: 'error', items: upsOverloaded },
    { key: 'power_unmapped', label: 'Powered devices not mapped to a UPS/PDU', severity: 'warning', items: powerUnmapped },
    { key: 'devices_no_ports', label: 'Active devices with no ports', severity: 'warning', items: devicesNoPorts },
    { key: 'planned_connections', label: 'Planned connections not yet active', severity: 'info', items: plannedConnections },
  ];

  const total_issues = checks.reduce((s, c) => s + c.items.length, 0);
  res.json({ total_issues, checks });
});

module.exports = router;
