const { getDb } = require('../db/connection');

function tracePath(portId) {
  const db = getDb();
  const steps = [];
  const visited = new Set();
  const MAX_DEPTH = 20;

  const getPort = db.prepare(`
    SELECT p.*, d.id as device_id, d.name as device_name, d.device_type
    FROM ports p JOIN devices d ON p.device_id = d.id
    WHERE p.id = ?
  `);

  const getConnection = db.prepare(`
    SELECT c.*, p.id as other_port_id
    FROM connections c
    JOIN ports p ON (
      CASE WHEN c.port_a_id = ? THEN c.port_b_id = p.id
           ELSE c.port_a_id = p.id END
    )
    WHERE (c.port_a_id = ? OR c.port_b_id = ?) AND c.status != 'inactive'
    LIMIT 1
  `);

  const originPort = getPort.get(portId);
  if (!originPort) return [];

  steps.push({ port: originPort, device: { id: originPort.device_id, name: originPort.device_name, device_type: originPort.device_type }, connection: null, note: 'origin' });
  visited.add(portId);

  let currentPortId = portId;

  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const conn = getConnection.get(currentPortId, currentPortId, currentPortId);
    if (!conn) {
      if (steps.length > 1) steps[steps.length - 1].note = 'endpoint';
      else steps[0].note = 'dead_end';
      break;
    }

    const otherPort = getPort.get(conn.other_port_id);
    if (!otherPort) break;

    if (visited.has(otherPort.id)) {
      steps.push({ port: otherPort, device: { id: otherPort.device_id, name: otherPort.device_name, device_type: otherPort.device_type }, connection: conn, note: 'cycle_detected' });
      break;
    }

    visited.add(otherPort.id);
    steps.push({ port: otherPort, device: { id: otherPort.device_id, name: otherPort.device_name, device_type: otherPort.device_type }, connection: conn, note: 'connection' });

    // Follow patch panel link if present
    if (otherPort.linked_port_id) {
      const linkedPort = getPort.get(otherPort.linked_port_id);
      if (linkedPort && !visited.has(linkedPort.id)) {
        visited.add(linkedPort.id);
        steps.push({ port: linkedPort, device: { id: linkedPort.device_id, name: linkedPort.device_name, device_type: linkedPort.device_type }, connection: null, note: 'patch_through' });
        currentPortId = linkedPort.id;
        continue;
      }
    }

    currentPortId = otherPort.id;
  }

  return steps;
}

module.exports = { tracePath };
