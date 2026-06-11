// Read-only data shaping shared by the authed API, the public share feed, and
// the MCP server. Every function takes a `db` handle whose prepare().all()/.get()
// API is satisfied by both better-sqlite3 and node:sqlite.

function listDevices(db) {
  return db.prepare(`
    SELECT d.id, d.name, d.device_type, d.make, d.model, d.os, d.management_ip,
      d.monitor_enabled, d.last_status, d.last_checked_at, d.last_latency_ms,
      d.rack_unit_start, d.rack_unit_height, d.location_id,
      l.name AS location_name, l.color AS location_color,
      (SELECT COUNT(*) FROM ports p WHERE p.device_id = d.id) AS port_count
    FROM devices d LEFT JOIN locations l ON d.location_id = l.id
    ORDER BY d.name
  `).all();
}

function listConnections(db) {
  return db.prepare(`
    SELECT c.id, c.cable_type, c.cable_color, c.cable_length_ft, c.status,
      da.id AS device_a_id, da.name AS device_a_name, pa.label AS port_a_label,
      db_.id AS device_b_id, db_.name AS device_b_name, pb.label AS port_b_label,
      v.vlan_id AS vlan_number, v.name AS vlan_name, v.color AS vlan_color
    FROM connections c
    JOIN ports pa ON c.port_a_id = pa.id JOIN devices da ON pa.device_id = da.id
    JOIN ports pb ON c.port_b_id = pb.id JOIN devices db_ ON pb.device_id = db_.id
    LEFT JOIN vlans v ON c.vlan_id = v.id
    ORDER BY c.id
  `).all();
}

function listLocations(db) {
  return db.prepare('SELECT id, name, description, color, is_rack, rack_units FROM locations ORDER BY sort_order, name').all();
}

function listVlans(db) {
  return db.prepare('SELECT id, vlan_id, name, description, color FROM vlans ORDER BY vlan_id').all();
}

// Compact, documented topology document for export / interop.
function buildTopology(db) {
  const devices = listDevices(db).map(d => ({
    id: d.id, name: d.name, type: d.device_type, make: d.make, model: d.model, os: d.os,
    management_ip: d.management_ip,
    status: d.monitor_enabled ? (d.last_status || 'unknown') : null,
    location: d.location_name || null,
    rack: d.rack_unit_start ? { start: d.rack_unit_start, height: d.rack_unit_height || 1 } : null,
    port_count: d.port_count,
  }));
  const connections = listConnections(db).map(c => ({
    id: c.id,
    from: { device: c.device_a_name, port: c.port_a_label },
    to: { device: c.device_b_name, port: c.port_b_label },
    cable_type: c.cable_type,
    vlan: c.vlan_number ? { id: c.vlan_number, name: c.vlan_name } : null,
    status: c.status,
  }));
  return {
    app: 'CableMap',
    generated_at: new Date().toISOString(),
    counts: { devices: devices.length, connections: connections.length },
    devices,
    connections,
    locations: listLocations(db).map(l => ({ id: l.id, name: l.name, is_rack: !!l.is_rack, rack_units: l.rack_units })),
    vlans: listVlans(db).map(v => ({ id: v.vlan_id, name: v.name })),
  };
}

// Bundle used by the public share "live view".
function publicSnapshot(db) {
  const devices = listDevices(db);
  return {
    generated_at: new Date().toISOString(),
    devices,
    connections: listConnections(db),
    locations: listLocations(db),
    vlans: listVlans(db),
    online: devices.filter(d => d.monitor_enabled && d.last_status === 'online').length,
    offline: devices.filter(d => d.monitor_enabled && d.last_status === 'offline').length,
    monitored: devices.filter(d => d.monitor_enabled).length,
  };
}

module.exports = { listDevices, listConnections, listLocations, listVlans, buildTopology, publicSnapshot };
