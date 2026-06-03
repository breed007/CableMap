// Append-only audit log helper.
function logHistory(db, { entity_type, entity_id, action, summary, meta = null, device_a_id = null, device_b_id = null }) {
  try {
    db.prepare(
      `INSERT INTO history (entity_type, entity_id, action, summary, meta, device_a_id, device_b_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      entity_type,
      entity_id ?? null,
      action,
      summary,
      meta ? JSON.stringify(meta) : null,
      device_a_id,
      device_b_id
    );
  } catch (e) {
    // History logging must never break the underlying operation.
    console.error('history log failed:', e.message);
  }
}

module.exports = { logHistory };
