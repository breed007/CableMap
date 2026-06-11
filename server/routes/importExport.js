const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getDb } = require('../db/connection');
const { buildTopology } = require('../utils/topology');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// JSON topology export — clean, documented shape for interop with other tools.
router.get('/topology.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="cablemap-topology.json"');
  res.send(JSON.stringify(buildTopology(getDb()), null, 2));
});

// CSV Export — all connections
router.get('/connections', (req, res) => {
  const db = getDb();
  const connections = db.prepare(`
    SELECT
      da.name as device_a, pa.label as port_a_label,
      db_.name as device_b, pb.label as port_b_label,
      c.cable_type, c.cable_color, c.cable_length_ft,
      v.vlan_id, c.status, c.notes
    FROM connections c
    JOIN ports pa ON c.port_a_id = pa.id JOIN devices da ON pa.device_id = da.id
    JOIN ports pb ON c.port_b_id = pb.id JOIN devices db_ ON pb.device_id = db_.id
    LEFT JOIN vlans v ON c.vlan_id = v.id
    ORDER BY da.name, pa.label
  `).all();

  const header = 'device_a,port_a_label,device_b,port_b_label,cable_type,cable_color,cable_length_ft,vlan_id,status,notes\n';
  const rows = connections.map(c =>
    [c.device_a, c.port_a_label, c.device_b, c.port_b_label, c.cable_type, c.cable_color || '', c.cable_length_ft || '', c.vlan_id || '', c.status, c.notes || '']
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="cablemap-connections.csv"');
  res.send(header + rows);
});

// CSV Template download
router.get('/template', (req, res) => {
  const csv = 'device_a,port_a_label,device_b,port_b_label,cable_type,cable_color,cable_length_ft,vlan_id,status,notes\n';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="cablemap-import-template.csv"');
  res.send(csv);
});

// CSV Import
router.post('/connections', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const db = getDb();
  const text = req.file.buffer.toString('utf-8');
  const lines = text.split('\n').filter(l => l.trim());
  const headers = parseCsvLine(lines[0]);

  const results = { created: 0, errors: [] };

  const insertConn = db.prepare(
    `INSERT INTO connections (port_a_id, port_b_id, cable_type, cable_color, cable_length_ft, vlan_id, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const importAll = db.transaction(() => {
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      if (row.length < 4) continue;
      const obj = {};
      headers.forEach((h, idx) => obj[h.trim()] = (row[idx] || '').trim());

      const { device_a, port_a_label, device_b, port_b_label, cable_type, cable_color, cable_length_ft, vlan_id, status, notes } = obj;

      if (!device_a || !port_a_label || !device_b || !port_b_label) {
        results.errors.push({ row: i + 1, error: 'Missing required fields (device_a, port_a_label, device_b, port_b_label)' });
        continue;
      }

      const devA = db.prepare('SELECT id FROM devices WHERE name = ? COLLATE NOCASE').get(device_a);
      if (!devA) { results.errors.push({ row: i + 1, error: `Device not found: ${device_a}` }); continue; }

      const devB = db.prepare('SELECT id FROM devices WHERE name = ? COLLATE NOCASE').get(device_b);
      if (!devB) { results.errors.push({ row: i + 1, error: `Device not found: ${device_b}` }); continue; }

      const portA = db.prepare('SELECT id FROM ports WHERE device_id = ? AND label = ? COLLATE NOCASE').get(devA.id, port_a_label);
      if (!portA) { results.errors.push({ row: i + 1, error: `Port not found: ${device_a} / ${port_a_label}` }); continue; }

      const portB = db.prepare('SELECT id FROM ports WHERE device_id = ? AND label = ? COLLATE NOCASE').get(devB.id, port_b_label);
      if (!portB) { results.errors.push({ row: i + 1, error: `Port not found: ${device_b} / ${port_b_label}` }); continue; }

      const connStatus = status || 'active';
      if (connStatus === 'active') {
        const conflict = db.prepare(
          `SELECT id FROM connections WHERE (port_a_id=? OR port_b_id=? OR port_a_id=? OR port_b_id=?) AND status='active'`
        ).get(portA.id, portA.id, portB.id, portB.id);
        if (conflict) { results.errors.push({ row: i + 1, error: `Port conflict: ${device_a}/${port_a_label} or ${device_b}/${port_b_label} already connected` }); continue; }
      }

      let vlanRow = null;
      if (vlan_id) {
        vlanRow = db.prepare('SELECT id FROM vlans WHERE vlan_id = ?').get(parseInt(vlan_id));
      }

      try {
        insertConn.run(portA.id, portB.id, cable_type || 'cat6', cable_color || null, cable_length_ft ? parseFloat(cable_length_ft) : null, vlanRow ? vlanRow.id : null, connStatus, notes || null);
        results.created++;
      } catch (e) {
        results.errors.push({ row: i + 1, error: e.message });
      }
    }
  });

  importAll();
  res.json(results);
});

// PDF device port map
router.get('/device/:id/pdf', (req, res) => {
  const db = getDb();
  const device = db.prepare(`
    SELECT d.*, l.name as location_name FROM devices d
    LEFT JOIN locations l ON d.location_id = l.id WHERE d.id = ?
  `).get(req.params.id);
  if (!device) return res.status(404).json({ error: 'Not found' });

  const ports = db.prepare(`
    SELECT p.*,
      c.cable_type, c.cable_color, c.status as conn_status,
      op.label as other_port_label, od.name as other_device_name
    FROM ports p
    LEFT JOIN connections c ON (c.port_a_id = p.id OR c.port_b_id = p.id)
    LEFT JOIN ports op ON (CASE WHEN c.port_a_id = p.id THEN c.port_b_id = op.id ELSE c.port_a_id = op.id END)
    LEFT JOIN devices od ON op.device_id = od.id
    WHERE p.device_id = ? ORDER BY p.panel_side, p.port_number, p.label
  `).all(req.params.id);

  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 40, size: 'LETTER' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${device.name.replace(/[^a-z0-9]/gi, '_')}-ports.pdf"`);
  doc.pipe(res);

  doc.font('Helvetica-Bold').fontSize(18).text('CableMap — Port Map', { align: 'center' });
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(14).text(device.name);
  doc.font('Helvetica').fontSize(10)
    .text(`Type: ${device.device_type}  |  Location: ${device.location_name || 'Unassigned'}  |  Make/Model: ${[device.make, device.model].filter(Boolean).join(' ') || '—'}`)
    .text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown(1);

  // Table header
  const cols = { label: 40, type: 200, speed: 290, connected: 370, notes: 480 };
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text('Port', cols.label).text('Type', cols.type, doc.y - doc.currentLineHeight()).text('Speed', cols.speed, doc.y - doc.currentLineHeight()).text('Connected To', cols.connected, doc.y - doc.currentLineHeight()).text('Notes', cols.notes, doc.y - doc.currentLineHeight());
  doc.moveTo(40, doc.y + 2).lineTo(570, doc.y + 2).stroke();
  doc.moveDown(0.3);

  doc.font('Courier').fontSize(8);
  for (const port of ports) {
    const y = doc.y;
    if (y > 720) { doc.addPage(); }
    const connTo = port.other_device_name ? `${port.other_device_name} / ${port.other_port_label}` : '—';
    doc.text(port.label, cols.label, doc.y, { width: 155 });
    const lineY = doc.y - doc.currentLineHeight();
    doc.text(port.port_type, cols.type, lineY, { width: 85 });
    doc.text(port.speed, cols.speed, lineY, { width: 75 });
    doc.text(connTo, cols.connected, lineY, { width: 105 });
    doc.text(port.notes || '', cols.notes, lineY, { width: 90 });
  }

  doc.end();
});

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

module.exports = router;
