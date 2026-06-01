const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/connection');

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
const UPLOAD_DIR = path.resolve(DATA_DIR, 'uploads');

function deleteAttachmentsFor(db, entityType, entityId) {
  const rows = db.prepare('SELECT filename FROM attachments WHERE entity_type = ? AND entity_id = ?').all(entityType, entityId);
  db.prepare('DELETE FROM attachments WHERE entity_type = ? AND entity_id = ?').run(entityType, entityId);
  for (const r of rows) {
    fs.unlink(path.join(UPLOAD_DIR, r.filename), () => {});
  }
}

router.get('/', (req, res) => {
  const db = getDb();
  const locations = db.prepare(`
    SELECT l.*,
      (SELECT COUNT(*) FROM devices d WHERE d.location_id = l.id) as device_count,
      (SELECT COUNT(*) FROM attachments a WHERE a.entity_type = 'location' AND a.entity_id = l.id) as photo_count
    FROM locations l ORDER BY sort_order, name
  `).all();
  res.json(locations);
});

// Location detail incl. devices placed in it (for rack elevation)
router.get('/:id', (req, res) => {
  const db = getDb();
  const loc = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
  if (!loc) return res.status(404).json({ error: 'Not found' });

  const devices = db.prepare(`
    SELECT d.*,
      (SELECT COUNT(*) FROM ports p WHERE p.device_id = d.id) as port_count,
      (SELECT COUNT(*) FROM ports p WHERE p.device_id = d.id AND EXISTS(
        SELECT 1 FROM connections c WHERE (c.port_a_id = p.id OR c.port_b_id = p.id) AND c.status = 'active'
      )) as connected_port_count
    FROM devices d WHERE d.location_id = ?
    ORDER BY d.rack_unit_start DESC NULLS LAST, d.name
  `).all(req.params.id);

  res.json({ ...loc, devices });
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, description, color, sort_order, is_rack, rack_units } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const result = db.prepare(
    'INSERT INTO locations (name, description, color, sort_order, is_rack, rack_units) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, description || null, color || '#6B7280', sort_order || 0, is_rack ? 1 : 0, rack_units || null);
  res.status(201).json(db.prepare('SELECT * FROM locations WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, description, color, sort_order, is_rack, rack_units } = req.body;
  const loc = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id);
  if (!loc) return res.status(404).json({ error: 'Not found' });
  db.prepare(
    'UPDATE locations SET name=?, description=?, color=?, sort_order=?, is_rack=?, rack_units=? WHERE id=?'
  ).run(
    name ?? loc.name,
    description !== undefined ? description : loc.description,
    color || loc.color,
    sort_order !== undefined ? sort_order : loc.sort_order,
    is_rack !== undefined ? (is_rack ? 1 : 0) : loc.is_rack,
    rack_units !== undefined ? rack_units : loc.rack_units,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const loc = db.prepare('SELECT id FROM locations WHERE id = ?').get(req.params.id);
  if (!loc) return res.status(404).json({ error: 'Not found' });
  deleteAttachmentsFor(db, 'location', req.params.id);
  db.prepare('DELETE FROM locations WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
