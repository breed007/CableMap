const express = require('express');
const router = express.Router();
const { getDb } = require('../db/connection');

// Global activity feed, with optional filters
router.get('/', (req, res) => {
  const db = getDb();
  const { entity_type, device_id, action, limit } = req.query;
  let sql = 'SELECT * FROM history';
  const conditions = [];
  const params = [];
  if (entity_type) { conditions.push('entity_type = ?'); params.push(entity_type); }
  if (action) { conditions.push('action = ?'); params.push(action); }
  if (device_id) {
    conditions.push('(device_a_id = ? OR device_b_id = ? OR (entity_type = ? AND entity_id = ?))');
    params.push(device_id, device_id, 'device', device_id);
  }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY created_at DESC, id DESC LIMIT ?';
  params.push(Math.min(parseInt(limit) || 200, 1000));
  const rows = db.prepare(sql).all(...params).map(r => ({ ...r, meta: r.meta ? JSON.parse(r.meta) : null }));
  res.json(rows);
});

// History for a single device (events where it was involved on either end)
router.get('/device/:id', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM history
    WHERE device_a_id = ? OR device_b_id = ? OR (entity_type = 'device' AND entity_id = ?)
    ORDER BY created_at DESC, id DESC LIMIT 100
  `).all(req.params.id, req.params.id, req.params.id).map(r => ({ ...r, meta: r.meta ? JSON.parse(r.meta) : null }));
  res.json(rows);
});

module.exports = router;
