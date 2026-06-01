const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/connection');

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
const UPLOAD_DIR = path.resolve(DATA_DIR, 'uploads');

function serialize(t) {
  return { ...t, default_ports: JSON.parse(t.default_ports || '[]') };
}

router.get('/', (req, res) => {
  const db = getDb();
  const { type, custom } = req.query;
  let sql = 'SELECT * FROM device_templates';
  const conditions = [];
  const params = [];
  if (type) { conditions.push('device_type = ?'); params.push(type); }
  if (custom === '1') { conditions.push('is_custom = 1'); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY make, model';
  res.json(db.prepare(sql).all(...params).map(serialize));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const t = db.prepare('SELECT * FROM device_templates WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(serialize(t));
});

// Create a custom template
router.post('/', (req, res) => {
  const db = getDb();
  const { make, model, sku, device_type, default_ports, rack_unit_height, os, form_factor, notes, product_url, datasheet_url } = req.body;
  if (!model || !device_type) return res.status(400).json({ error: 'model and device_type are required' });

  const ports = Array.isArray(default_ports) ? default_ports : [];
  // Generate a unique SKU if none provided / collides.
  let finalSku = (sku && sku.trim()) || `CUSTOM-${(make || 'gen').toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now()}`;
  if (db.prepare('SELECT 1 FROM device_templates WHERE sku = ?').get(finalSku)) {
    finalSku = `${finalSku}-${Date.now()}`;
  }

  const result = db.prepare(
    `INSERT INTO device_templates (make, model, sku, device_type, port_count, default_ports, rack_unit_height, is_custom, os, form_factor, notes, product_url, datasheet_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`
  ).run(
    make || 'Custom', model, finalSku, device_type, ports.length, JSON.stringify(ports),
    rack_unit_height || null, os || null, form_factor || null, notes || null, product_url || null, datasheet_url || null
  );
  res.status(201).json(serialize(db.prepare('SELECT * FROM device_templates WHERE id = ?').get(result.lastInsertRowid)));
});

// Update — custom templates only
router.put('/:id', (req, res) => {
  const db = getDb();
  const t = db.prepare('SELECT * FROM device_templates WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  if (!t.is_custom) return res.status(403).json({ error: 'Seeded templates are read-only' });

  const { make, model, device_type, default_ports, rack_unit_height, os, form_factor, notes, product_url, datasheet_url } = req.body;
  const ports = Array.isArray(default_ports) ? default_ports : JSON.parse(t.default_ports || '[]');

  db.prepare(
    `UPDATE device_templates SET make=?, model=?, device_type=?, port_count=?, default_ports=?, rack_unit_height=?, os=?, form_factor=?, notes=?, product_url=?, datasheet_url=?
     WHERE id=?`
  ).run(
    make ?? t.make, model ?? t.model, device_type ?? t.device_type, ports.length, JSON.stringify(ports),
    rack_unit_height !== undefined ? rack_unit_height : t.rack_unit_height,
    os !== undefined ? os : t.os,
    form_factor !== undefined ? form_factor : t.form_factor,
    notes !== undefined ? notes : t.notes,
    product_url !== undefined ? product_url : t.product_url,
    datasheet_url !== undefined ? datasheet_url : t.datasheet_url,
    req.params.id
  );
  res.json(serialize(db.prepare('SELECT * FROM device_templates WHERE id = ?').get(req.params.id)));
});

// Delete — custom templates only; also removes attached files
router.delete('/:id', (req, res) => {
  const db = getDb();
  const t = db.prepare('SELECT * FROM device_templates WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  if (!t.is_custom) return res.status(403).json({ error: 'Seeded templates are read-only' });

  const atts = db.prepare(`SELECT filename FROM attachments WHERE entity_type='template' AND entity_id=?`).all(req.params.id);
  db.prepare(`DELETE FROM attachments WHERE entity_type='template' AND entity_id=?`).run(req.params.id);
  for (const a of atts) {
    fs.unlink(path.join(UPLOAD_DIR, a.filename), () => {});
    const base = path.basename(a.filename, path.extname(a.filename));
    fs.unlink(path.join(UPLOAD_DIR, 'thumbs', `${base}.jpg`), () => {});
  }
  db.prepare('DELETE FROM device_templates WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
