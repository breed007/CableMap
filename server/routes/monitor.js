const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');
const { checkAllEnabled } = require('../utils/monitor');

// Run a reachability check across all monitored devices now.
router.post('/check-all', async (req, res) => {
  try {
    const result = await checkAllEnabled(getDb());
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Current status snapshot for all monitored devices.
router.get('/status', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, name, device_type, last_status, last_checked_at, last_latency_ms, monitor_method
    FROM devices WHERE monitor_enabled = 1 ORDER BY name
  `).all();
  res.json(rows);
});

module.exports = router;
