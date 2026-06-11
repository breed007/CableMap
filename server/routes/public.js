const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');
const { publicSnapshot, buildTopology } = require('../utils/topology');

// Token gate — validates a non-revoked share token and stamps last_used_at.
// Everything under here is read-only and requires NO login session.
router.use('/:token', (req, res, next) => {
  const db = getDb();
  const t = db.prepare('SELECT * FROM share_tokens WHERE token = ? AND revoked = 0').get(req.params.token);
  if (!t) return res.status(404).json({ error: 'Invalid or revoked share link' });
  db.prepare('UPDATE share_tokens SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?').run(t.id);
  req.shareLabel = t.label || null;
  next();
});

// Read-only "live view" snapshot for the public share page.
router.get('/:token/snapshot', (req, res) => {
  res.json({ label: req.shareLabel, ...publicSnapshot(getDb()) });
});

// Interop topology feed (e.g. for Homepage / Homelable / dashboards).
router.get('/:token/topology.json', (req, res) => {
  res.json(buildTopology(getDb()));
});

module.exports = router;
