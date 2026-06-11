const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const schema = require('./schema');
const { seedLocations, seedVlans, seedTemplates } = require('./seeds');

const dataDir = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
const dbPath = process.env.DB_PATH || path.resolve(dataDir, 'cablemap.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log(`Initializing database at: ${dbPath}`);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(schema);
console.log('Schema created.');

// ── Migrations for existing databases (additive, idempotent) ─────────────────
function columnExists(table, column) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some(c => c.name === column);
}
function tableExists(table) {
  return !!db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
}

if (!columnExists('locations', 'is_rack')) {
  db.exec(`ALTER TABLE locations ADD COLUMN is_rack INTEGER DEFAULT 0`);
  console.log('Migrated: locations.is_rack');
}
if (!columnExists('locations', 'rack_units')) {
  db.exec(`ALTER TABLE locations ADD COLUMN rack_units INTEGER`);
  console.log('Migrated: locations.rack_units');
}

// device_templates: custom-template support fields + power outlet defaults + capacity
for (const col of [['is_custom', 'INTEGER DEFAULT 0'], ['os', 'TEXT'], ['form_factor', 'TEXT'], ['notes', 'TEXT'], ['product_url', 'TEXT'], ['datasheet_url', 'TEXT'], ['default_outlets', "TEXT NOT NULL DEFAULT '[]'"], ['default_capacity_watts', 'INTEGER'], ['default_capacity_va', 'INTEGER']]) {
  if (tableExists('device_templates') && !columnExists('device_templates', col[0])) {
    db.exec(`ALTER TABLE device_templates ADD COLUMN ${col[0]} ${col[1]}`);
    console.log(`Migrated: device_templates.${col[0]}`);
  }
}

// New tables for v0.2.0 (history + power mapping). CREATE IF NOT EXISTS in the
// schema handles fresh installs; this ensures existing DBs get them too.
db.exec(`
  CREATE TABLE IF NOT EXISTS power_outlets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    outlet_number INTEGER,
    label TEXT NOT NULL,
    outlet_type TEXT NOT NULL DEFAULT 'nema_5_15',
    max_watts INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS power_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    outlet_id INTEGER NOT NULL REFERENCES power_outlets(id) ON DELETE CASCADE,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    watts INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    action TEXT NOT NULL,
    summary TEXT NOT NULL,
    meta TEXT,
    device_a_id INTEGER,
    device_b_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_power_outlets_device ON power_outlets(device_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_power_connections_outlet ON power_connections(outlet_id);
  CREATE INDEX IF NOT EXISTS idx_power_connections_device ON power_connections(device_id);
  CREATE INDEX IF NOT EXISTS idx_history_entity ON history(entity_type, entity_id);
  CREATE INDEX IF NOT EXISTS idx_history_created ON history(created_at);
`);

// device_type was originally a CHECK enum; rebuild the table without it so DIY
// gear types are allowed. Detect the old constraint and migrate in place.
const devicesSql = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='devices'`).get();
if (devicesSql && devicesSql.sql.includes("CHECK(device_type IN")) {
  console.log('Migrating: removing device_type CHECK constraint...');
  db.exec('PRAGMA foreign_keys = OFF');
  const migrate = db.transaction(() => {
    db.exec(`
      CREATE TABLE devices__new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        device_type TEXT NOT NULL,
        make TEXT,
        model TEXT,
        location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
        rack_unit_start INTEGER,
        rack_unit_height INTEGER,
        management_ip TEXT,
        notes TEXT,
        canvas_x REAL DEFAULT 0,
        canvas_y REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    db.exec(`INSERT INTO devices__new SELECT * FROM devices;`);
    db.exec(`DROP TABLE devices;`);
    db.exec(`ALTER TABLE devices__new RENAME TO devices;`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_devices_location ON devices(location_id);`);
  });
  migrate();
  db.exec('PRAGMA foreign_keys = ON');
  console.log('Migrated: devices table rebuilt without device_type CHECK.');
}

// devices: OS/firmware + form factor + power capacity + monitoring (after any
// table rebuild above, so the rebuild's SELECT * column counts stay aligned)
for (const col of [
  ['os', 'TEXT'], ['form_factor', 'TEXT'], ['capacity_watts', 'INTEGER'], ['capacity_va', 'INTEGER'], ['breaker_amps', 'INTEGER'],
  ['monitor_enabled', 'INTEGER DEFAULT 0'], ['monitor_method', "TEXT DEFAULT 'ping'"], ['monitor_target', 'TEXT'], ['monitor_port', 'INTEGER'],
  ['last_status', 'TEXT'], ['last_checked_at', 'DATETIME'], ['last_latency_ms', 'INTEGER'],
]) {
  if (tableExists('devices') && !columnExists('devices', col[0])) {
    db.exec(`ALTER TABLE devices ADD COLUMN ${col[0]} ${col[1]}`);
    console.log(`Migrated: devices.${col[0]}`);
  }
}

const locationCount = db.prepare('SELECT COUNT(*) as c FROM locations').get().c;
if (locationCount === 0) {
  const insertLocation = db.prepare(
    'INSERT INTO locations (name, description, color, sort_order, is_rack, rack_units) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const loc of seedLocations) {
    insertLocation.run(loc.name, loc.description, loc.color, loc.sort_order, loc.is_rack ? 1 : 0, loc.rack_units || null);
  }
  console.log(`Seeded ${seedLocations.length} locations.`);
}

const vlanCount = db.prepare('SELECT COUNT(*) as c FROM vlans').get().c;
if (vlanCount === 0) {
  const insertVlan = db.prepare(
    'INSERT INTO vlans (vlan_id, name, description, color) VALUES (?, ?, ?, ?)'
  );
  for (const v of seedVlans) {
    insertVlan.run(v.vlan_id, v.name, v.description, v.color);
  }
  console.log(`Seeded ${seedVlans.length} VLANs.`);
}

// Templates are seeded additively by SKU so new gear appears on existing DBs.
const insertTemplate = db.prepare(
  `INSERT INTO device_templates (make, model, sku, device_type, port_count, default_ports, rack_unit_height, default_outlets, default_capacity_watts, default_capacity_va)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
const updateOutlets = db.prepare('UPDATE device_templates SET default_outlets = ? WHERE sku = ? AND is_custom = 0');
const updateCapacity = db.prepare('UPDATE device_templates SET default_capacity_watts = ?, default_capacity_va = ? WHERE sku = ? AND is_custom = 0');
const skuExists = db.prepare('SELECT 1 FROM device_templates WHERE sku = ?');
let added = 0, outletUpdates = 0;
for (const t of seedTemplates) {
  const outletsJson = t.default_outlets || '[]';
  if (skuExists.get(t.sku)) {
    // Backfill outlet + capacity definitions onto existing built-in templates.
    if (outletsJson !== '[]') { updateOutlets.run(outletsJson, t.sku); outletUpdates++; }
    if (t.default_capacity_watts != null || t.default_capacity_va != null) {
      updateCapacity.run(t.default_capacity_watts ?? null, t.default_capacity_va ?? null, t.sku);
    }
    continue;
  }
  const ports = JSON.parse(t.default_ports);
  insertTemplate.run(t.make, t.model, t.sku, t.device_type, ports.length, t.default_ports, t.rack_unit_height || null, outletsJson, t.default_capacity_watts ?? null, t.default_capacity_va ?? null);
  added++;
}
console.log(added > 0 ? `Seeded ${added} new device templates.` : 'Device templates up to date.');
if (outletUpdates > 0) console.log(`Backfilled outlets on ${outletUpdates} existing templates.`);

if (!tableExists('attachments')) {
  console.log('Note: attachments table missing — re-run after schema update.');
}

db.close();
console.log('Database initialization complete.');
