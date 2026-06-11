export const CABLE_COLORS = {
  cat5e: '#6B7280',
  cat6: '#3B82F6',
  cat6a: '#06B6D4',
  cat7: '#8B5CF6',
  cat8: '#8B5CF6',
  om3_fiber: '#F59E0B',
  os2_fiber: '#F59E0B',
  dac: '#EC4899',
  other: '#D1D5DB',
}

export const CABLE_TYPE_LABELS = {
  cat5e: 'Cat5e',
  cat6: 'Cat6',
  cat6a: 'Cat6a',
  cat7: 'Cat7',
  cat8: 'Cat8',
  om3_fiber: 'OM3 Fiber',
  os2_fiber: 'OS2 Fiber',
  dac: 'DAC',
  other: 'Other',
}

export const PORT_TYPE_LABELS = {
  rj45: 'RJ45',
  sfp: 'SFP',
  sfp_plus: 'SFP+',
  qsfp: 'QSFP',
  lc_fiber: 'LC Fiber',
  sc_fiber: 'SC Fiber',
  usb_a: 'USB-A',
  usb_c: 'USB-C',
  other: 'Other',
}

export const SPEED_LABELS = {
  '100m': '100M',
  '1g': '1G',
  '2_5g': '2.5G',
  '5g': '5G',
  '10g': '10G',
  '25g': '25G',
  '40g': '40G',
  '100g': '100G',
  'unknown': '?',
}

export const DEVICE_TYPE_LABELS = {
  switch: 'Switch',
  patch_panel: 'Patch Panel',
  wall_plate: 'Wall Plate',
  router: 'Router',
  nas: 'NAS',
  access_point: 'Access Point',
  server: 'Server',
  firewall: 'Firewall',
  modem: 'Modem',
  media_converter: 'Media Converter',
  ups: 'UPS',
  pdu: 'PDU',
  shelf: 'Shelf / Drawer',
  blank: 'Blank Panel',
  other: 'Other',
}

// Passive rack occupants that don't need ports
export const PASSIVE_DEVICE_TYPES = ['ups', 'pdu', 'shelf', 'blank']

export const FORM_FACTORS = [
  { value: 'rackmount', label: 'Rackmount (U)' },
  { value: 'desktop', label: 'Desktop / SFF' },
  { value: 'tower', label: 'Tower' },
  { value: 'wall', label: 'Wall-mount' },
  { value: 'dinrail', label: 'DIN-rail' },
  { value: 'other', label: 'Other' },
]

export const FORM_FACTOR_LABELS = Object.fromEntries(FORM_FACTORS.map(f => [f.value, f.label]))

export const OUTLET_TYPES = [
  { value: 'nema_5_15', label: 'NEMA 5-15R' },
  { value: 'nema_5_20', label: 'NEMA 5-20R' },
  { value: 'c13', label: 'IEC C13' },
  { value: 'c19', label: 'IEC C19' },
  { value: 'other', label: 'Other' },
]
export const OUTLET_TYPE_LABELS = Object.fromEntries(OUTLET_TYPES.map(o => [o.value, o.label]))

export const MONITOR_METHODS = [
  { value: 'ping', label: 'Ping (ICMP)' },
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'tcp', label: 'TCP port' },
]

export const STATUS_DISPLAY = {
  online: { color: '#22C55E', label: 'Online' },
  offline: { color: '#EF4444', label: 'Offline' },
  unknown: { color: '#6B7280', label: 'Unknown' },
}

export const HISTORY_ACTION_COLORS = {
  created: '#22C55E',
  updated: '#06B6D4',
  moved: '#F59E0B',
  deleted: '#EF4444',
}

export const DEVICE_TYPE_COLORS = {
  switch: '#3B82F6', patch_panel: '#8B5CF6', router: '#06B6D4', firewall: '#EF4444',
  server: '#F59E0B', access_point: '#22C55E', nas: '#EC4899', modem: '#D97706',
  wall_plate: '#6B7280', media_converter: '#10B981', ups: '#F59E0B', pdu: '#A855F7',
  shelf: '#6B7280', blank: '#374151', other: '#6B7280',
}

export const STATUS_COLORS = {
  active: '#22C55E',
  inactive: '#6B7280',
  planned: '#F59E0B',
  unknown: '#9CA3AF',
}
