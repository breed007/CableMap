const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const { getDb } = require('../db/connection');

const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
const UPLOAD_DIR = path.resolve(DATA_DIR, 'uploads');
const THUMB_DIR = path.resolve(UPLOAD_DIR, 'thumbs');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });

const THUMB_MAX = 480; // px, longest edge

const VALID_ENTITY_TYPES = ['device', 'connection', 'location', 'gallery', 'template'];

// Allowed non-image document types (spec sheets, Visio stencils, etc.)
const DOC_EXTENSIONS = new Set([
  '.pdf', '.vsd', '.vss', '.vsdx', '.vssx', '.vstx',
  '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt', '.zip',
]);
const DOC_MIME_PREFIXES = ['application/pdf', 'application/vnd.', 'application/zip', 'application/octet-stream', 'text/'];

function isImage(mime) { return /^image\//.test(mime || ''); }

// Thumbnail path is derived deterministically from the stored filename, so no
// extra DB column is needed: <random>.<ext>  ->  thumbs/<random>.jpg
function thumbPathFor(filename) {
  const base = path.basename(filename, path.extname(filename));
  return path.join(THUMB_DIR, `${base}.jpg`);
}

// Generate (or regenerate) a thumbnail. Honors EXIF orientation from phones.
// Returns the thumb path on success, or null on failure (non-fatal).
async function generateThumb(srcPath, thumbPath) {
  try {
    await sharp(srcPath)
      .rotate() // auto-orient from EXIF
      .resize(THUMB_MAX, THUMB_MAX, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 72 })
      .toFile(thumbPath);
    return thumbPath;
  } catch (e) {
    return null;
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10) || '';
    const safe = crypto.randomBytes(16).toString('hex');
    cb(null, `${safe}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB — photos + spec-sheet PDFs / Visio stencils
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeOk = isImage(file.mimetype) || DOC_MIME_PREFIXES.some(p => (file.mimetype || '').startsWith(p));
    if (isImage(file.mimetype) || DOC_EXTENSIONS.has(ext) || mimeOk) cb(null, true);
    else cb(new Error('Unsupported file type. Allowed: images, PDF, Visio, Office docs.'));
  },
});

// List attachments for an entity (or all gallery items)
router.get('/', (req, res) => {
  const db = getDb();
  const { entity_type, entity_id } = req.query;
  let sql = 'SELECT * FROM attachments';
  const conditions = [];
  const params = [];
  if (entity_type) { conditions.push('entity_type = ?'); params.push(entity_type); }
  if (entity_id) { conditions.push('entity_id = ?'); params.push(entity_id); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY sort_order, created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

// Upload a new attachment
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const db = getDb();
  let { entity_type, entity_id, caption } = req.body;

  if (!entity_type || !VALID_ENTITY_TYPES.includes(entity_type)) {
    fs.unlink(path.join(UPLOAD_DIR, req.file.filename), () => {});
    return res.status(400).json({ error: 'valid entity_type required (device|connection|location|gallery)' });
  }
  if (entity_type === 'gallery') entity_id = null;
  else if (!entity_id) {
    fs.unlink(path.join(UPLOAD_DIR, req.file.filename), () => {});
    return res.status(400).json({ error: 'entity_id required for this entity_type' });
  }

  // Best-effort thumbnail at upload time, images only (non-fatal; lazy fallback covers misses).
  if (isImage(req.file.mimetype)) {
    await generateThumb(path.join(UPLOAD_DIR, req.file.filename), thumbPathFor(req.file.filename));
  }

  const result = db.prepare(
    `INSERT INTO attachments (entity_type, entity_id, filename, original_name, mime_type, size_bytes, caption)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(entity_type, entity_id || null, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, caption || null);

  res.status(201).json(db.prepare('SELECT * FROM attachments WHERE id = ?').get(result.lastInsertRowid));
});

// Serve the full-size image file
router.get('/:id/file', (req, res) => {
  const db = getDb();
  const att = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
  if (!att) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(UPLOAD_DIR, att.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on disk' });
  if (att.mime_type) res.setHeader('Content-Type', att.mime_type);
  res.setHeader('Cache-Control', 'private, max-age=86400');
  // Documents keep their original filename when downloaded; PDFs still preview inline.
  if (!isImage(att.mime_type) && att.original_name) {
    const safeName = att.original_name.replace(/[^\w.\- ]/g, '_');
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
  }
  res.sendFile(filePath);
});

// Serve the thumbnail. Generates lazily if missing (covers legacy uploads and
// any upload-time generation failures), then caches to disk.
router.get('/:id/thumb', async (req, res) => {
  const db = getDb();
  const att = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
  if (!att) return res.status(404).json({ error: 'Not found' });

  // Non-image documents have no thumbnail; the client shows a file-type icon instead.
  if (!isImage(att.mime_type)) return res.status(415).json({ error: 'No thumbnail for this file type' });

  const srcPath = path.join(UPLOAD_DIR, att.filename);
  const thumbPath = thumbPathFor(att.filename);

  if (!fs.existsSync(thumbPath)) {
    if (!fs.existsSync(srcPath)) return res.status(404).json({ error: 'File missing on disk' });
    const made = await generateThumb(srcPath, thumbPath);
    // If thumbnailing fails (e.g. unsupported format), fall back to the original.
    if (!made) {
      if (att.mime_type) res.setHeader('Content-Type', att.mime_type);
      res.setHeader('Cache-Control', 'private, max-age=86400');
      return res.sendFile(srcPath);
    }
  }

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'private, max-age=604800');
  res.sendFile(thumbPath);
});

// Update caption / sort order
router.put('/:id', (req, res) => {
  const db = getDb();
  const att = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
  if (!att) return res.status(404).json({ error: 'Not found' });
  const { caption, sort_order } = req.body;
  db.prepare('UPDATE attachments SET caption = ?, sort_order = ? WHERE id = ?')
    .run(caption !== undefined ? caption : att.caption, sort_order !== undefined ? sort_order : att.sort_order, req.params.id);
  res.json(db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id));
});

// Delete (removes original + thumbnail from disk too)
router.delete('/:id', (req, res) => {
  const db = getDb();
  const att = db.prepare('SELECT * FROM attachments WHERE id = ?').get(req.params.id);
  if (!att) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM attachments WHERE id = ?').run(req.params.id);
  fs.unlink(path.join(UPLOAD_DIR, att.filename), () => {});
  fs.unlink(thumbPathFor(att.filename), () => {});
  res.json({ ok: true });
});

module.exports = router;
