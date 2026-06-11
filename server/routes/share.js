const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getDb } = require('../db/connection');

// Manage read-only share links (authed).
router.get('/', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT id, token, label, revoked, created_at, last_used_at FROM share_tokens ORDER BY created_at DESC').all());
});

router.post('/', (req, res) => {
  const db = getDb();
  const token = crypto.randomBytes(16).toString('hex');
  const { label } = req.body;
  const r = db.prepare('INSERT INTO share_tokens (token, label) VALUES (?, ?)').run(token, label || null);
  res.status(201).json(db.prepare('SELECT * FROM share_tokens WHERE id = ?').get(r.lastInsertRowid));
});

router.post('/:id/revoke', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE share_tokens SET revoked = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM share_tokens WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
