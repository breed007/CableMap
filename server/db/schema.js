const schema = `
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  sort_order INTEGER DEFAULT 0,
  is_rack INTEGER DEFAULT 0,
  rack_units INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- device_type is validated in the API layer (not a DB CHECK) so users can add
-- DIY / generic gear types without a schema migration. Known types include:
--   switch, patch_panel, wall_plate, router, nas, access_point, server,
--   firewall, modem, media_converter, ups, pdu, shelf, blank, other
CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  make TEXT,
  model TEXT,
  os TEXT,
  form_factor TEXT,
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

CREATE TABLE IF NOT EXISTS ports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  port_number INTEGER,
  port_type TEXT NOT NULL CHECK(port_type IN ('rj45','sfp','sfp_plus','qsfp','lc_fiber','sc_fiber','usb_a','usb_c','other')),
  speed TEXT NOT NULL DEFAULT 'unknown' CHECK(speed IN ('100m','1g','2_5g','5g','10g','25g','40g','100g','unknown')),
  is_uplink INTEGER DEFAULT 0,
  panel_side TEXT CHECK(panel_side IN ('front','back',NULL)),
  linked_port_id INTEGER REFERENCES ports(id) ON DELETE SET NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vlans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vlan_id INTEGER NOT NULL UNIQUE CHECK(vlan_id BETWEEN 1 AND 4094),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  port_a_id INTEGER NOT NULL REFERENCES ports(id) ON DELETE CASCADE,
  port_b_id INTEGER NOT NULL REFERENCES ports(id) ON DELETE CASCADE,
  cable_type TEXT NOT NULL DEFAULT 'cat6' CHECK(cable_type IN ('cat5e','cat6','cat6a','cat7','cat8','om3_fiber','os2_fiber','dac','other')),
  cable_color TEXT,
  cable_length_ft REAL,
  vlan_id INTEGER REFERENCES vlans(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','planned','unknown')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CHECK(port_a_id != port_b_id)
);

CREATE TABLE IF NOT EXISTS device_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  make TEXT NOT NULL DEFAULT 'Ubiquiti',
  model TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  device_type TEXT NOT NULL,
  port_count INTEGER NOT NULL DEFAULT 0,
  default_ports TEXT NOT NULL DEFAULT '[]',
  rack_unit_height INTEGER,
  thumbnail_svg TEXT,
  store_url TEXT,
  is_custom INTEGER DEFAULT 0,
  os TEXT,
  form_factor TEXT,
  notes TEXT,
  product_url TEXT,
  datasheet_url TEXT
);

-- Polymorphic photo / file attachments.
-- entity_type: 'device' | 'connection' | 'location' | 'gallery'
-- entity_id is NULL for free-form gallery items.
CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  filename TEXT NOT NULL,
  original_name TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ports_device_id ON ports(device_id);
CREATE INDEX IF NOT EXISTS idx_connections_port_a ON connections(port_a_id);
CREATE INDEX IF NOT EXISTS idx_connections_port_b ON connections(port_b_id);
CREATE INDEX IF NOT EXISTS idx_devices_location ON devices(location_id);
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);
`;

module.exports = schema;
