const { checkDevice } = require('./reachability');
const { logHistory } = require('./history');

// Run a reachability check for one device, persist the result, and log a
// history entry on a real status transition (not the first-ever check).
async function runDeviceCheck(db, device) {
  const result = await checkDevice(device);
  const prev = device.last_status || null;
  db.prepare('UPDATE devices SET last_status=?, last_checked_at=CURRENT_TIMESTAMP, last_latency_ms=? WHERE id=?')
    .run(result.status, result.latency_ms, device.id);
  if (prev && prev !== result.status && result.status !== 'unknown' && prev !== 'unknown') {
    logHistory(db, {
      entity_type: 'device', entity_id: device.id, action: 'updated',
      summary: `${device.name} went ${result.status}${result.latency_ms != null ? ` (${result.latency_ms}ms)` : ''}`,
      device_a_id: device.id,
    });
  }
  return result;
}

// Check all monitored devices, batched to avoid spawning too many at once.
async function checkAllEnabled(db, batchSize = 8) {
  const devices = db.prepare('SELECT * FROM devices WHERE monitor_enabled = 1').all();
  for (let i = 0; i < devices.length; i += batchSize) {
    const batch = devices.slice(i, i + batchSize);
    await Promise.all(batch.map(d => runDeviceCheck(db, d)));
  }
  return { checked: devices.length };
}

module.exports = { runDeviceCheck, checkAllEnabled };
