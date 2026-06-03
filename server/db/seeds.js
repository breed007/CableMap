const seedLocations = [
  { name: 'Main Rack', description: 'Primary network rack', color: '#3B82F6', sort_order: 1, is_rack: 1, rack_units: 12 },
  { name: 'Server Closet', description: 'Server closet equipment', color: '#8B5CF6', sort_order: 2, is_rack: 1, rack_units: 24 },
  { name: 'Office', description: 'Office area', color: '#22C55E', sort_order: 3, is_rack: 0 },
  { name: 'Garage', description: 'Garage equipment', color: '#F59E0B', sort_order: 4, is_rack: 0 },
  { name: 'Unassigned', description: 'No location assigned', color: '#6B7280', sort_order: 5, is_rack: 0 },
];

const seedVlans = [
  { vlan_id: 1, name: 'Default', description: 'Default VLAN', color: '#6B7280' },
  { vlan_id: 10, name: 'Management', description: 'Management network', color: '#3B82F6' },
  { vlan_id: 20, name: 'IoT', description: 'IoT devices', color: '#F59E0B' },
  { vlan_id: 30, name: 'Guest', description: 'Guest network', color: '#22C55E' },
];

// Helper: build a default_outlets JSON string for UPS/PDU templates.
// outlet_type: nema_5_15 | nema_5_20 | c13 | c19 | other
const outlets = (count, type = 'nema_5_15', maxWatts = null) =>
  JSON.stringify(Array.from({ length: count }, (_, i) => ({
    label: `Outlet ${i + 1}`, outlet_type: type, max_watts: maxWatts,
  })));

// UniFi device templates
const seedTemplates = [
  // Gateways
  {
    make: 'Ubiquiti', model: 'UniFi Express 7', sku: 'UX7', device_type: 'router',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'LAN', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Cloud Gateway Ultra', sku: 'UCG-Ultra', device_type: 'router',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 },
      { label: 'LAN1', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      { label: 'LAN2', port_number: 3, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      { label: 'LAN3', port_number: 4, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      { label: 'SFP+', port_number: 5, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Cloud Gateway Max', sku: 'UCG-Max', device_type: 'router',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 },
      { label: 'LAN1', port_number: 2, port_type: 'rj45', speed: '2_5g', is_uplink: 0 },
      { label: 'LAN2', port_number: 3, port_type: 'rj45', speed: '2_5g', is_uplink: 0 },
      { label: 'LAN3', port_number: 4, port_type: 'rj45', speed: '2_5g', is_uplink: 0 },
      { label: 'LAN4', port_number: 5, port_type: 'rj45', speed: '2_5g', is_uplink: 0 },
      { label: 'SFP+', port_number: 6, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Cloud Gateway Fiber', sku: 'UCG-Fiber', device_type: 'router',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN SFP+', port_number: 1, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
      { label: 'WAN RJ45', port_number: 2, port_type: 'rj45', speed: '10g', is_uplink: 1 },
      { label: 'SFP+ 1', port_number: 3, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
      { label: 'SFP+ 2', port_number: 4, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
      { label: 'LAN PoE', port_number: 5, port_type: 'rj45', speed: '2_5g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Dream Machine Pro', sku: 'UDM-Pro', device_type: 'router',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'WAN SFP+', port_number: 2, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
      ...Array.from({length: 8}, (_, i) => ({ label: `LAN${i+1}`, port_number: i+3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP+ 1', port_number: 11, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
      { label: 'SFP+ 2', port_number: 12, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Dream Machine Pro Max', sku: 'UDM-Pro-Max', device_type: 'router',
    rack_unit_height: 2,
    default_ports: JSON.stringify([
      { label: 'WAN SFP+ 1', port_number: 1, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
      { label: 'WAN SFP+ 2', port_number: 2, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
      ...Array.from({length: 8}, (_, i) => ({ label: `LAN${i+1}`, port_number: i+3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP+ 10G 1', port_number: 11, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
      { label: 'SFP+ 10G 2', port_number: 12, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Dream Machine SE', sku: 'UDM-SE', device_type: 'router',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN SFP+', port_number: 1, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
      ...Array.from({length: 8}, (_, i) => ({ label: `LAN${i+1}`, port_number: i+2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP+ 1', port_number: 10, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
      { label: 'SFP+ 2', port_number: 11, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Enterprise Fortress Gateway', sku: 'EFG', device_type: 'firewall',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN SFP28 1', port_number: 1, port_type: 'sfp_plus', speed: '25g', is_uplink: 1 },
      { label: 'WAN SFP28 2', port_number: 2, port_type: 'sfp_plus', speed: '25g', is_uplink: 1 },
      ...Array.from({length: 8}, (_, i) => ({ label: `SFP+ ${i+1}`, port_number: i+3, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
      { label: 'SFP28 LAN 1', port_number: 11, port_type: 'sfp_plus', speed: '25g', is_uplink: 0 },
      { label: 'SFP28 LAN 2', port_number: 12, port_type: 'sfp_plus', speed: '25g', is_uplink: 0 },
    ]),
  },
  // Switches
  {
    make: 'Ubiquiti', model: 'Switch Flex Mini', sku: 'USW-Flex-Mini', device_type: 'switch',
    rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({length: 5}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Ubiquiti', model: 'Switch Flex Mini 2.5G', sku: 'USW-Flex-Mini-2.5G', device_type: 'switch',
    rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({length: 5}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Ubiquiti', model: 'Switch Flex', sku: 'USW-Flex', device_type: 'switch',
    rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({length: 5}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Ubiquiti', model: 'Switch Flex 2.5G', sku: 'USW-Flex-2.5G-5', device_type: 'switch',
    rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({length: 5}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Ubiquiti', model: 'Switch Flex 2.5G 8-Port', sku: 'USW-Flex-2.5G-8', device_type: 'switch',
    rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({length: 8}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Ubiquiti', model: 'Switch Flex 2.5G 8 PoE', sku: 'USW-Flex-2.5G-8-PoE', device_type: 'switch',
    rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({length: 8}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Ubiquiti', model: 'Switch Flex 10 GbE', sku: 'USW-Flex-XG', device_type: 'switch',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'PoE In', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({length: 4}, (_, i) => ({ label: `SFP+ ${i+1}`, port_number: i+2, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Lite 8 PoE', sku: 'USW-Lite-8-PoE', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 8}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: i < 4 ? 0 : 0 })),
      { label: 'SFP 1', port_number: 9, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 10, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Lite 16 PoE', sku: 'USW-Lite-16-PoE', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 16}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 17, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 18, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Ultra', sku: 'USW-Ultra', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 24}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 25, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 26, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Ultra 60W', sku: 'USW-Ultra-60W', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 24}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 25, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 26, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Ultra 210W', sku: 'USW-Ultra-210W', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 24}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 25, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 26, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro 8 PoE', sku: 'USW-Pro-8-PoE', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 8}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP+ 1', port_number: 9, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
      { label: 'SFP+ 2', port_number: 10, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro XG 8 PoE', sku: 'USW-Pro-XG-8-PoE', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 8}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '2_5g', is_uplink: 0 })),
      { label: 'SFP+ 1', port_number: 9, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
      { label: 'SFP+ 2', port_number: 10, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Enterprise 8 PoE', sku: 'USW-Enterprise-8-PoE', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 8}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '2_5g', is_uplink: 0 })),
      { label: 'SFP+ 1', port_number: 9, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
      { label: 'SFP+ 2', port_number: 10, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro 24', sku: 'USW-Pro-24', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 24}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({length: 4}, (_, i) => ({ label: `SFP+ ${i+1}`, port_number: i+25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro 24 PoE', sku: 'USW-Pro-24-PoE', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 24}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({length: 4}, (_, i) => ({ label: `SFP+ ${i+1}`, port_number: i+25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro 48', sku: 'USW-Pro-48', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 48}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({length: 4}, (_, i) => ({ label: `SFP+ ${i+1}`, port_number: i+49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro 48 PoE', sku: 'USW-Pro-48-PoE', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 48}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({length: 4}, (_, i) => ({ label: `SFP+ ${i+1}`, port_number: i+49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro Max 16', sku: 'USW-Pro-Max-16', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 16}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '2_5g', is_uplink: 0 })),
      { label: 'SFP+ 1', port_number: 17, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
      { label: 'SFP+ 2', port_number: 18, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro Max 24', sku: 'USW-Pro-Max-24', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 24}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '2_5g', is_uplink: 0 })),
      ...Array.from({length: 4}, (_, i) => ({ label: `SFP+ ${i+1}`, port_number: i+25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro Max 48', sku: 'USW-Pro-Max-48', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 48}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '2_5g', is_uplink: 0 })),
      ...Array.from({length: 4}, (_, i) => ({ label: `SFP+ ${i+1}`, port_number: i+49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro XG 24', sku: 'USW-Pro-XG-24', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 24}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '10g', is_uplink: 0 })),
      ...Array.from({length: 4}, (_, i) => ({ label: `SFP28 ${i+1}`, port_number: i+25, port_type: 'sfp_plus', speed: '25g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro XG 48', sku: 'USW-Pro-XG-48', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 48}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '10g', is_uplink: 0 })),
      ...Array.from({length: 4}, (_, i) => ({ label: `SFP28 ${i+1}`, port_number: i+49, port_type: 'sfp_plus', speed: '25g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Enterprise Campus 24', sku: 'ECS-24', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 24}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '2_5g', is_uplink: 0 })),
      ...Array.from({length: 4}, (_, i) => ({ label: `SFP+ ${i+1}`, port_number: i+25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
      { label: 'QSFP+ 1', port_number: 29, port_type: 'qsfp', speed: '40g', is_uplink: 1 },
      { label: 'QSFP+ 2', port_number: 30, port_type: 'qsfp', speed: '40g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Enterprise Campus 48', sku: 'ECS-48', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 48}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '2_5g', is_uplink: 0 })),
      ...Array.from({length: 4}, (_, i) => ({ label: `SFP+ ${i+1}`, port_number: i+49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
      { label: 'QSFP+ 1', port_number: 53, port_type: 'qsfp', speed: '40g', is_uplink: 1 },
      { label: 'QSFP+ 2', port_number: 54, port_type: 'qsfp', speed: '40g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Enterprise Campus Aggregation', sku: 'ECA', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 8}, (_, i) => ({ label: `SFP28 ${i+1}`, port_number: i+1, port_type: 'sfp_plus', speed: '25g', is_uplink: 0 })),
      { label: 'QSFP+ 1', port_number: 9, port_type: 'qsfp', speed: '100g', is_uplink: 1 },
      { label: 'QSFP+ 2', port_number: 10, port_type: 'qsfp', speed: '100g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Industrial', sku: 'USW-Industrial', device_type: 'switch',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      ...Array.from({length: 8}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP+ 1', port_number: 9, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Mission Critical', sku: 'USW-Mission-Critical', device_type: 'switch',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({length: 8}, (_, i) => ({ label: `Port ${i+1}`, port_number: i+1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP+ 1', port_number: 9, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
      { label: 'SFP+ 2', port_number: 10, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
    ]),
  },
  // Access Points
  {
    make: 'Ubiquiti', model: 'U6 Lite', sku: 'U6-Lite', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U6+', sku: 'U6-Plus', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U6 Pro', sku: 'U6-Pro', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U6 Enterprise', sku: 'U6-Enterprise', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U6 Enterprise IHD', sku: 'U6-Enterprise-IHD', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U6 Mesh', sku: 'U6-Mesh', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U6 Extender', sku: 'U6-Extender', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U6 Long-Range', sku: 'U6-LR', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U7 Lite', sku: 'U7-Lite', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U7 Pro', sku: 'U7-Pro', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U7 Pro Wall', sku: 'U7-Pro-Wall', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 },
      { label: 'ETH1 (Pass-through)', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'U7 Pro XG Wall', sku: 'U7-Pro-XG-Wall', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '10g', is_uplink: 1 },
      { label: 'ETH1 (Pass-through)', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'U7 Pro Max', sku: 'U7-Pro-Max', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U7 Pro XG', sku: 'U7-Pro-XG', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '10g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U7 Pro XGS', sku: 'U7-Pro-XGS', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'SFP+', port_number: 1, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U7 Long-Range', sku: 'U7-LR', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U7 Outdoor', sku: 'U7-Outdoor', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'UniFi Travel Router', sku: 'UTR', device_type: 'router',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'LAN', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'E7', sku: 'E7', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '10g', is_uplink: 1 },
      { label: 'ETH1', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'E7 Campus', sku: 'E7-Campus', device_type: 'access_point',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '10g', is_uplink: 1 },
      { label: 'ETH1', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },

  // ── Synology NAS ───────────────────────────────────────────────────────────
  {
    make: 'Synology', model: 'DiskStation DS923+', sku: 'DS923+', device_type: 'nas',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'LAN 1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'LAN 2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      { label: 'E10G22 (10G)', port_number: 3, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Synology', model: 'DiskStation DS1522+', sku: 'DS1522+', device_type: 'nas',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      ...Array.from({ length: 4 }, (_, i) => ({ label: `LAN ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      { label: 'E10G22 (10G)', port_number: 5, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Synology', model: 'DiskStation DS1821+', sku: 'DS1821+', device_type: 'nas',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      ...Array.from({ length: 4 }, (_, i) => ({ label: `LAN ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      { label: 'E10G (10G)', port_number: 5, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Synology', model: 'DiskStation DS224+', sku: 'DS224+', device_type: 'nas',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'LAN 1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'LAN 2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Synology', model: 'RackStation RS1221+', sku: 'RS1221+', device_type: 'nas',
    rack_unit_height: 2,
    default_ports: JSON.stringify([
      ...Array.from({ length: 4 }, (_, i) => ({ label: `LAN ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      { label: 'E10G (10G)', port_number: 5, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Synology', model: 'RackStation RS422+', sku: 'RS422+', device_type: 'nas',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'LAN 1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Synology', model: 'RackStation RS2423+', sku: 'RS2423+', device_type: 'nas',
    rack_unit_height: 2,
    default_ports: JSON.stringify([
      ...Array.from({ length: 2 }, (_, i) => ({ label: `LAN ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 })),
      { label: 'E10G (10G)', port_number: 3, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },

  // ── Servers / mini PCs ───────────────────────────────────────────────────────
  {
    make: 'HP', model: 'EliteDesk (Mini PC)', sku: 'GEN-ELITEDESK-MINI', device_type: 'server',
    rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'NIC', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Generic', model: 'Rackmount Server 1U', sku: 'GEN-SRV-1U', device_type: 'server',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'NIC 1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'NIC 2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      { label: 'iLO / IPMI', port_number: 3, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Generic', model: 'Rackmount Server 2U', sku: 'GEN-SRV-2U', device_type: 'server',
    rack_unit_height: 2,
    default_ports: JSON.stringify([
      { label: 'NIC 1', port_number: 1, port_type: 'rj45', speed: '10g', is_uplink: 1 },
      { label: 'NIC 2', port_number: 2, port_type: 'rj45', speed: '10g', is_uplink: 0 },
      { label: 'NIC 3', port_number: 3, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
      { label: 'NIC 4', port_number: 4, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
      { label: 'iLO / IPMI', port_number: 5, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },

  // ── Patch panels (front/back pairs created at device build time) ─────────────
  {
    make: 'Generic', model: 'Patch Panel 24-Port', sku: 'GEN-PP-24', device_type: 'patch_panel',
    rack_unit_height: 1,
    default_ports: JSON.stringify(Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }))),
  },
  {
    make: 'Generic', model: 'Patch Panel 48-Port', sku: 'GEN-PP-48', device_type: 'patch_panel',
    rack_unit_height: 2,
    default_ports: JSON.stringify(Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }))),
  },
  {
    make: 'Generic', model: 'Keystone Patch Panel 12-Port', sku: 'GEN-PP-12', device_type: 'patch_panel',
    rack_unit_height: 1,
    default_ports: JSON.stringify(Array.from({ length: 12 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }))),
  },

  // ── Power ────────────────────────────────────────────────────────────────────
  {
    make: 'Generic', model: 'Rackmount UPS 1U', sku: 'GEN-UPS-1U', device_type: 'ups',
    rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'Network/Mgmt', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
    default_outlets: outlets(8, 'c13'),
  },
  {
    make: 'Generic', model: 'Rackmount UPS 2U', sku: 'GEN-UPS-2U', device_type: 'ups',
    rack_unit_height: 2,
    default_ports: JSON.stringify([
      { label: 'Network/Mgmt', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
    default_outlets: outlets(8, 'c13'),
  },
  {
    make: 'Generic', model: 'Rackmount PDU', sku: 'GEN-PDU-1U', device_type: 'pdu',
    rack_unit_height: 1,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(8, 'c13'),
  },

  // ── Passive rack occupants (no ports) ────────────────────────────────────────
  {
    make: 'Generic', model: 'Rack Shelf / Drawer 1U', sku: 'GEN-SHELF-1U', device_type: 'shelf',
    rack_unit_height: 1,
    default_ports: JSON.stringify([]),
  },
  {
    make: 'Generic', model: 'Rack Shelf / Drawer 2U', sku: 'GEN-SHELF-2U', device_type: 'shelf',
    rack_unit_height: 2,
    default_ports: JSON.stringify([]),
  },
  ...[1, 2, 3, 4, 5, 6].map((u) => ({
    make: 'Generic', model: `Blank Rackspace ${u}U`, sku: `GEN-BLANK-${u}U`, device_type: 'blank',
    rack_unit_height: u,
    default_ports: JSON.stringify([]),
  })),
  {
    make: 'Generic', model: 'DIY / Custom Device', sku: 'GEN-DIY', device_type: 'other',
    rack_unit_height: null,
    default_ports: JSON.stringify([]),
  },

  // ════════════════════════════════════════════════════════════════════════════
  //  Expanded vendor library
  // ════════════════════════════════════════════════════════════════════════════

  // ── Ubiquiti — additional gateways / routers ────────────────────────────────
  {
    make: 'Ubiquiti', model: 'UniFi Express', sku: 'UX', device_type: 'router', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'LAN', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Gateway Lite', sku: 'UXG-Lite', device_type: 'router', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'LAN', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Gateway Pro', sku: 'UXG-Pro', device_type: 'router', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN1 RJ45', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'WAN2 SFP+', port_number: 2, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
      { label: 'LAN RJ45', port_number: 3, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      { label: 'LAN SFP+', port_number: 4, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Dream Machine', sku: 'UDM', device_type: 'router', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `LAN${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Dream Router', sku: 'UDR', device_type: 'router', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `LAN${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },

  // ── Ubiquiti — additional switches ──────────────────────────────────────────
  {
    make: 'Ubiquiti', model: 'Switch 16 PoE', sku: 'USW-16-PoE', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 16 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 17, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 18, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch 24 (Gen2)', sku: 'USW-24-G2', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 25, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 26, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch 24 PoE (Gen2)', sku: 'USW-24-PoE-G2', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 25, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 26, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch 48 (Gen2)', sku: 'USW-48-G2', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 49, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Aggregation', sku: 'USW-Aggregation', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify(Array.from({ length: 8 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 1, port_type: 'sfp_plus', speed: '10g', is_uplink: i < 2 ? 1 : 0 }))),
  },
  {
    make: 'Ubiquiti', model: 'Switch Pro Aggregation', sku: 'USW-Pro-Aggregation', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 28 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 1, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP28 ${i + 1}`, port_number: i + 29, port_type: 'sfp_plus', speed: '25g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Ubiquiti', model: 'Switch Enterprise XG 24', sku: 'USW-EnterpriseXG-24', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '10g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP28 ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '25g', is_uplink: 1 })),
    ]),
  },

  // ── Ubiquiti — additional access points (incl. legacy AC line) ──────────────
  {
    make: 'Ubiquiti', model: 'UAP-AC-Lite', sku: 'UAP-AC-Lite', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'UAP-AC-LR', sku: 'UAP-AC-LR', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'UAP-AC-Pro', sku: 'UAP-AC-Pro', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'ETH0 (Main)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'ETH1 (Secondary)', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Ubiquiti', model: 'UAP-AC-Mesh', sku: 'UAP-AC-M', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH0', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Ubiquiti', model: 'U6 In-Wall', sku: 'U6-IW', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'Uplink', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `Downlink ${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },

  // ── Fortinet — FortiGate firewalls ──────────────────────────────────────────
  {
    make: 'Fortinet', model: 'FortiGate 40F', sku: 'FG-40F', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'WAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 3 }, (_, i) => ({ label: `Internal ${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 60F', sku: 'FG-60F', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'WAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 7 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'DMZ', port_number: 10, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 70F', sku: 'FG-70F', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'WAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 11, port_type: 'sfp', speed: '1g', is_uplink: 0 },
      { label: 'SFP 2', port_number: 12, port_type: 'sfp', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 80F', sku: 'FG-80F', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'WAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 12 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 15, port_type: 'sfp', speed: '1g', is_uplink: 0 },
      { label: 'SFP 2', port_number: 16, port_type: 'sfp', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 100F', sku: 'FG-100F', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 22 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 23, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 27, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 200F', sku: 'FG-200F', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 18 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 19, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 27, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },

  // ── Fortinet — FortiSwitch ──────────────────────────────────────────────────
  {
    make: 'Fortinet', model: 'FortiSwitch 108E', sku: 'FS-108E', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 9, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 10, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 124E', sku: 'FS-124E', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 25, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 148F', sku: 'FS-148F', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 424E-POE', sku: 'FS-424E-POE', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },

  // ── Fortinet — FortiAP ──────────────────────────────────────────────────────
  {
    make: 'Fortinet', model: 'FortiAP 231F', sku: 'FAP-231F', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'LAN/PoE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Fortinet', model: 'FortiAP 431F', sku: 'FAP-431F', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'LAN1/PoE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 },
      { label: 'LAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },

  // ── Fortinet — FortiGate D series ───────────────────────────────────────────
  {
    make: 'Fortinet', model: 'FortiGate 30D', sku: 'FG-30D', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `Internal ${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 60D', sku: 'FG-60D', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'WAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'DMZ', port_number: 3, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 7 }, (_, i) => ({ label: `Internal ${i + 1}`, port_number: i + 4, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 90D', sku: 'FG-90D', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'WAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 14 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 100D', sku: 'FG-100D', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 20 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 21, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 200D', sku: 'FG-200D', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 18 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 19, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 300D', sku: 'FG-300D', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 16 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 17, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 500D', sku: 'FG-500D', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 9, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 17, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },

  // ── Fortinet — FortiGate E series ───────────────────────────────────────────
  {
    make: 'Fortinet', model: 'FortiGate 30E', sku: 'FG-30E', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `Internal ${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 50E', sku: 'FG-50E', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 6 }, (_, i) => ({ label: `Internal ${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 60E', sku: 'FG-60E', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'WAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'DMZ', port_number: 3, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 7 }, (_, i) => ({ label: `Internal ${i + 1}`, port_number: i + 4, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 80E', sku: 'FG-80E', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'WAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 12 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 90E', sku: 'FG-90E', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'WAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 14 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 100E', sku: 'FG-100E', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 20 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 21, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 200E', sku: 'FG-200E', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 16 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 17, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 19, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 300E', sku: 'FG-300E', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 18 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 19, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 23, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 500E', sku: 'FG-500E', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 10 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 11, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 19, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiGate 600E', sku: 'FG-600E', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 10 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 11, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 19, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },

  // ── Fortinet — FortiSwitch D series ─────────────────────────────────────────
  {
    make: 'Fortinet', model: 'FortiSwitch 108D', sku: 'FS-108D', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 9, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 10, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 124D', sku: 'FS-124D', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 25, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 224D-POE', sku: 'FS-224D-POE', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 25, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 26, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 248D', sku: 'FS-248D', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 49, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 424D', sku: 'FS-424D', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 448D', sku: 'FS-448D', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `QSFP+ ${i + 1}`, port_number: i + 53, port_type: 'qsfp', speed: '40g', is_uplink: 1 })),
    ]),
  },

  // ── Fortinet — FortiSwitch E series ─────────────────────────────────────────
  {
    make: 'Fortinet', model: 'FortiSwitch 148E', sku: 'FS-148E', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 49, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 224E-POE', sku: 'FS-224E-POE', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 25, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 248E-POE', sku: 'FS-248E-POE', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 424E', sku: 'FS-424E', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 448E', sku: 'FS-448E', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `QSFP+ ${i + 1}`, port_number: i + 53, port_type: 'qsfp', speed: '40g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 548E', sku: 'FS-548E', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `QSFP+ ${i + 1}`, port_number: i + 53, port_type: 'qsfp', speed: '40g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiSwitch 1024E', sku: 'FS-1024E', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 1, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `QSFP+ ${i + 1}`, port_number: i + 25, port_type: 'qsfp', speed: '40g', is_uplink: 1 })),
    ]),
  },

  // ── Fortinet — FortiAP D series ─────────────────────────────────────────────
  {
    make: 'Fortinet', model: 'FortiAP 21D', sku: 'FAP-21D', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'LAN/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Fortinet', model: 'FortiAP 24D', sku: 'FAP-24D', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'LAN/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Fortinet', model: 'FortiAP 25D', sku: 'FAP-25D', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'Uplink/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 3 }, (_, i) => ({ label: `LAN ${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiAP 28D (Outdoor)', sku: 'FAP-28D', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'LAN/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },

  // ── Fortinet — FortiAP E series ─────────────────────────────────────────────
  {
    make: 'Fortinet', model: 'FortiAP 221E', sku: 'FAP-221E', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'LAN/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Fortinet', model: 'FortiAP 223E', sku: 'FAP-223E', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'LAN1/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'LAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiAP 321E', sku: 'FAP-321E', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'LAN/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Fortinet', model: 'FortiAP 421E', sku: 'FAP-421E', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'LAN/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Fortinet', model: 'FortiAP 423E', sku: 'FAP-423E', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'LAN1/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'LAN2', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Fortinet', model: 'FortiAP S221E', sku: 'FAP-S221E', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'LAN/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },

  // ── Netgate (pfSense) / OPNsense ────────────────────────────────────────────
  {
    make: 'Netgate', model: '1100 (pfSense+)', sku: 'NETGATE-1100', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'LAN', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      { label: 'OPT', port_number: 3, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Netgate', model: '2100 (pfSense+)', sku: 'NETGATE-2100', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `LAN${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Netgate', model: '4100 (pfSense+)', sku: 'NETGATE-4100', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 4 }, (_, i) => ({ label: i === 0 ? 'WAN' : `LAN${i}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Netgate', model: '6100 (pfSense+)', sku: 'NETGATE-6100', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 1, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '2_5g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Netgate', model: '8200 (pfSense+)', sku: 'NETGATE-8200', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 1, port_type: 'sfp_plus', speed: '10g', is_uplink: i < 2 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 5, port_type: 'rj45', speed: '2_5g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'OPNsense', model: 'Appliance (Generic 4-port)', sku: 'OPNSENSE-4P', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 4 }, (_, i) => ({ label: i === 0 ? 'WAN' : `LAN${i}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },

  // ── Sophos XGS ──────────────────────────────────────────────────────────────
  {
    make: 'Sophos', model: 'XGS 87', sku: 'XGS-87', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 8 }, (_, i) => ({ label: i === 0 ? 'WAN' : `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Sophos', model: 'XGS 107', sku: 'XGS-107', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify(Array.from({ length: 8 }, (_, i) => ({ label: i === 0 ? 'WAN' : `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Sophos', model: 'XGS 126', sku: 'XGS-126', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: i === 0 ? 'WAN' : `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      { label: 'SFP 1', port_number: 9, port_type: 'sfp', speed: '1g', is_uplink: 0 },
      { label: 'SFP 2', port_number: 10, port_type: 'sfp', speed: '1g', is_uplink: 0 },
    ]),
  },

  // ── SonicWall TZ ──────────────────────────────────────────────────────────────
  {
    make: 'SonicWall', model: 'TZ270', sku: 'TZ270', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 8 }, (_, i) => ({ label: i === 0 ? 'WAN (X1)' : `X${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'SonicWall', model: 'TZ370', sku: 'TZ370', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 8 }, (_, i) => ({ label: i === 0 ? 'WAN (X1)' : `X${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'SonicWall', model: 'TZ470', sku: 'TZ470', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: i === 0 ? 'WAN (X1)' : `X${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 })),
      { label: 'SFP+ 1', port_number: 9, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
      { label: 'SFP+ 2', port_number: 10, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'SonicWall', model: 'TZ570', sku: 'TZ570', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 10 }, (_, i) => ({ label: i === 0 ? 'WAN (X1)' : `X${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 })),
      { label: 'SFP+ 1', port_number: 11, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
      { label: 'SFP+ 2', port_number: 12, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },

  // ── Cisco Meraki MX ─────────────────────────────────────────────────────────
  {
    make: 'Cisco Meraki', model: 'MX67', sku: 'MX67', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN (Internet 1)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `LAN${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MX75', sku: 'MX75', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 2 }, (_, i) => ({ label: `WAN ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 1 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `LAN${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 11, port_type: 'sfp', speed: '1g', is_uplink: 0 },
      { label: 'SFP 2', port_number: 12, port_type: 'sfp', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MX85', sku: 'MX85', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 2 }, (_, i) => ({ label: `WAN ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 1 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `LAN${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'WAN SFP', port_number: 11, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP+ 1', port_number: 12, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
      { label: 'SFP+ 2', port_number: 13, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MX95', sku: 'MX95', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 5 }, (_, i) => ({ label: `GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 6, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 8, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },

  // ── Cisco Meraki — MS switches ──────────────────────────────────────────────
  {
    make: 'Cisco Meraki', model: 'MS120-8LP', sku: 'MS120-8LP', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 9, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS120-24P', sku: 'MS120-24P', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 25, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS120-48LP', sku: 'MS120-48LP', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 49, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS125-24P', sku: 'MS125-24P', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS125-48', sku: 'MS125-48', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS130-48', sku: 'MS130-48', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS210-48LP', sku: 'MS210-48LP', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS225-24P', sku: 'MS225-24P', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS225-48LP', sku: 'MS225-48LP', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS250-48P', sku: 'MS250-48P', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS350-48', sku: 'MS350-48', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS355-24X2 (mGig)', sku: 'MS355-24X2', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `mGE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '10g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `QSFP+ ${i + 1}`, port_number: i + 29, port_type: 'qsfp', speed: '40g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS390-48P', sku: 'MS390-48P', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Uplink module ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS410-16 (Aggregation)', sku: 'MS410-16', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 16 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 1, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 17, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MS425-16 (Aggregation)', sku: 'MS425-16', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 16 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 1, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `QSFP+ ${i + 1}`, port_number: i + 17, port_type: 'qsfp', speed: '40g', is_uplink: 1 })),
    ]),
  },

  // ── Cisco Meraki — MR / CW access points ────────────────────────────────────
  {
    make: 'Cisco Meraki', model: 'MR33', sku: 'MR33', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Cisco Meraki', model: 'MR36', sku: 'MR36', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Cisco Meraki', model: 'MR44', sku: 'MR44', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Cisco Meraki', model: 'MR46', sku: 'MR46', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Cisco Meraki', model: 'MR56', sku: 'MR56', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Cisco Meraki', model: 'MR57', sku: 'MR57', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '5g', is_uplink: 1 }]),
  },
  {
    make: 'Cisco Meraki', model: 'MR30H (In-Wall)', sku: 'MR30H', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'Uplink/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `LAN ${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Cisco Meraki', model: 'MR76 (Outdoor)', sku: 'MR76', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Cisco Meraki', model: 'MR86 (Outdoor)', sku: 'MR86', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Cisco Meraki', model: 'CW9162I', sku: 'CW9162I', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Cisco Meraki', model: 'CW9164I', sku: 'CW9164I', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '5g', is_uplink: 1 }]),
  },
  {
    make: 'Cisco Meraki', model: 'CW9166I', sku: 'CW9166I', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '5g', is_uplink: 1 }]),
  },

  // ── Protectli / generic fanless appliances ──────────────────────────────────
  {
    make: 'Protectli', model: 'Vault VP2420 (4-port)', sku: 'PROTECTLI-VP2420', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 4 }, (_, i) => ({ label: i === 0 ? 'WAN' : `LAN${i}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Protectli', model: 'Vault VP4670 (6-port)', sku: 'PROTECTLI-VP4670', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 6 }, (_, i) => ({ label: i === 0 ? 'WAN' : `LAN${i}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Generic', model: 'Fanless Appliance 4-port', sku: 'GEN-FW-4P', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 4 }, (_, i) => ({ label: i === 0 ? 'WAN' : `LAN${i}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Generic', model: 'Fanless Appliance 6-port', sku: 'GEN-FW-6P', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 6 }, (_, i) => ({ label: i === 0 ? 'WAN' : `LAN${i}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },

  // ── TP-Link Omada ─────────────────────────────────────────────────────────────
  {
    make: 'TP-Link Omada', model: 'ER605 Gateway', sku: 'ER605', device_type: 'router', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'WAN', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 3 }, (_, i) => ({ label: `WAN/LAN${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'LAN', port_number: 5, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'TP-Link Omada', model: 'ER7206 Gateway', sku: 'ER7206', device_type: 'router', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'WAN SFP', port_number: 1, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'WAN', port_number: 2, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 2 }, (_, i) => ({ label: `WAN/LAN${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'LAN', port_number: 5, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'TP-Link Omada', model: 'ER8411 Gateway', sku: 'ER8411', device_type: 'router', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 1, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `RJ45 ${i + 1}`, port_number: i + 3, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 11, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'TP-Link Omada', model: 'SG2210MP Switch', sku: 'TL-SG2210MP', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 9, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 10, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'TP-Link Omada', model: 'SG3428 Switch', sku: 'TL-SG3428', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 25, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'TP-Link Omada', model: 'SG3428XMP Switch', sku: 'TL-SG3428XMP', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'TP-Link Omada', model: 'SG3452 Switch', sku: 'TL-SG3452', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 49, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'TP-Link Omada', model: 'EAP650 Access Point', sku: 'EAP650', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'TP-Link Omada', model: 'EAP670 Access Point', sku: 'EAP670', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'TP-Link Omada', model: 'EAP683 LR Access Point', sku: 'EAP683-LR', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ETH/PoE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },

  // ── MikroTik ──────────────────────────────────────────────────────────────────
  {
    make: 'MikroTik', model: 'hEX (RB750Gr3)', sku: 'RB750GR3', device_type: 'router', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 5 }, (_, i) => ({ label: `ether${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'MikroTik', model: 'RB5009UG+S+IN', sku: 'RB5009', device_type: 'router', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'ether1 (2.5G)', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 },
      ...Array.from({ length: 7 }, (_, i) => ({ label: `ether${i + 2}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP+', port_number: 9, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'MikroTik', model: 'RB4011iGS+', sku: 'RB4011', device_type: 'router', rack_unit_height: null,
    default_ports: JSON.stringify([
      ...Array.from({ length: 10 }, (_, i) => ({ label: `ether${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      { label: 'SFP+', port_number: 11, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },
  {
    make: 'MikroTik', model: 'CRS305-1G-4S+', sku: 'CRS305', device_type: 'switch', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'ether1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 2, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'MikroTik', model: 'CRS309-1G-8S+', sku: 'CRS309', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'ether1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 2, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'MikroTik', model: 'CRS326-24G-2S+', sku: 'CRS326', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'MikroTik', model: 'CRS328-24P-4S+', sku: 'CRS328', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'MikroTik', model: 'CCR2004-1G-12S+2XS', sku: 'CCR2004', device_type: 'router', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'ether1', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      ...Array.from({ length: 12 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 2, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP28 ${i + 1}`, port_number: i + 14, port_type: 'sfp_plus', speed: '25g', is_uplink: 0 })),
    ]),
  },

  // ── Netgear ───────────────────────────────────────────────────────────────────
  {
    make: 'Netgear', model: 'GS308 (Unmanaged)', sku: 'GS308', device_type: 'switch', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 8 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }))),
  },
  {
    make: 'Netgear', model: 'GS308EP (PoE Smart)', sku: 'GS308EP', device_type: 'switch', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 8 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }))),
  },
  {
    make: 'Netgear', model: 'MS510TXPP (Multi-Gig)', sku: 'MS510TXPP', device_type: 'switch', rack_unit_height: null,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: 0 })),
      { label: '10G RJ45', port_number: 9, port_type: 'rj45', speed: '10g', is_uplink: 1 },
      { label: 'SFP+', port_number: 10, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Netgear', model: 'GS724T (Smart)', sku: 'GS724T', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 25, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Netgear', model: 'GS748T (Smart)', sku: 'GS748T', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 49, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Netgear', model: 'M4250-8G2XF-PoE+ (AV)', sku: 'M4250-8G2XF', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 9, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },

  // ── Aruba Instant On ────────────────────────────────────────────────────────
  {
    make: 'Aruba Instant On', model: '1930 8G PoE 2SFP', sku: 'AIO-1930-8G-PoE', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      { label: 'SFP 1', port_number: 9, port_type: 'sfp', speed: '1g', is_uplink: 1 },
      { label: 'SFP 2', port_number: 10, port_type: 'sfp', speed: '1g', is_uplink: 1 },
    ]),
  },
  {
    make: 'Aruba Instant On', model: '1930 24G 4SFP+', sku: 'AIO-1930-24G', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Aruba Instant On', model: '1960 24G 2SFP+ 2XGT', sku: 'AIO-1960-24G', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `Port ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `10G RJ45 ${i + 1}`, port_number: i + 25, port_type: 'rj45', speed: '10g', is_uplink: 1 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 27, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Aruba Instant On', model: 'AP25 Access Point', sku: 'AIO-AP25', device_type: 'access_point', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'ENET0/PoE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },

  // ── Cisco Catalyst 1200 / 1300 ──────────────────────────────────────────────
  {
    make: 'Cisco', model: 'Catalyst 1200-8T-E-2G', sku: 'C1200-8T-E-2G', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 9, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 1200-24T-4G', sku: 'C1200-24T-4G', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 25, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 1300-24T-4G', sku: 'C1300-24T-4G', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 25, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 1300-24P-4G (PoE)', sku: 'C1300-24P-4G', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 25, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 1300-48T-4X', sku: 'C1300-48T-4X', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 1300-24MGP-4X (mGig PoE)', sku: 'C1300-24MGP-4X', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `mGE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },

  // ── Cisco — Small Business switches (SG350/SG550, legacy) ───────────────────
  {
    make: 'Cisco', model: 'SG350-28P (Small Business)', sku: 'SG350-28P', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `Combo GE${i + 25}`, port_number: i + 25, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 27, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'SG550X-24 (Small Business)', sku: 'SG550X-24', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `10G RJ45 ${i + 1}`, port_number: i + 25, port_type: 'rj45', speed: '10g', is_uplink: 1 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 27, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'SG550X-48 (Small Business)', sku: 'SG550X-48', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `10G RJ45 ${i + 1}`, port_number: i + 49, port_type: 'rj45', speed: '10g', is_uplink: 1 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 51, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },

  // ── Cisco — Catalyst 2960-X (past gen) ──────────────────────────────────────
  {
    make: 'Cisco', model: 'Catalyst 2960X-24TS-L', sku: 'WS-C2960X-24TS-L', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 25, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 2960X-48TS-L', sku: 'WS-C2960X-48TS-L', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 49, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 2960X-24PS-L (PoE)', sku: 'WS-C2960X-24PS-L', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 25, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 2960X-48FPS-L (PoE)', sku: 'WS-C2960X-48FPS-L', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 49, port_type: 'sfp', speed: '1g', is_uplink: 1 })),
    ]),
  },

  // ── Cisco — Catalyst 3850 (past gen) ────────────────────────────────────────
  {
    make: 'Cisco', model: 'Catalyst 3850-24T', sku: 'WS-C3850-24T', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ uplink ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 3850-48T', sku: 'WS-C3850-48T', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ uplink ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 3850-24P (PoE)', sku: 'WS-C3850-24P', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ uplink ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },

  // ── Cisco — Catalyst 9200 / 9300 (current) ──────────────────────────────────
  {
    make: 'Cisco', model: 'Catalyst 9200-24T', sku: 'C9200-24T', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ uplink ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 9200-48P (PoE)', sku: 'C9200-48P', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ uplink ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 9300-24T', sku: 'C9300-24T', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Uplink module ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 9300-48P (PoE)', sku: 'C9300-48P', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 48 }, (_, i) => ({ label: `GE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Uplink module ${i + 1}`, port_number: i + 49, port_type: 'sfp_plus', speed: '10g', is_uplink: 1 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Catalyst 9300-24UX (mGig)', sku: 'C9300-24UX', device_type: 'switch', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 24 }, (_, i) => ({ label: `mGE${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '10g', is_uplink: 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Uplink module ${i + 1}`, port_number: i + 25, port_type: 'sfp_plus', speed: '25g', is_uplink: 1 })),
    ]),
  },

  // ── Cisco — ASA 5500-X firewalls (past gen) ─────────────────────────────────
  {
    make: 'Cisco', model: 'ASA 5506-X', sku: 'ASA5506-X', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'Management', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `GE1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
    ]),
  },
  {
    make: 'Cisco', model: 'ASA 5508-X', sku: 'ASA5508-X', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'Management', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `GE1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
    ]),
  },
  {
    make: 'Cisco', model: 'ASA 5516-X', sku: 'ASA5516-X', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'Management', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `GE1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
    ]),
  },
  {
    make: 'Cisco', model: 'ASA 5525-X', sku: 'ASA5525-X', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'Management', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `GE0/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 6 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 10, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Cisco', model: 'ASA 5555-X', sku: 'ASA5555-X', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'Management', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `GE0/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 6 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 10, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
    ]),
  },

  // ── Cisco — Firepower 1000 / 2100 (recent gen) ──────────────────────────────
  {
    make: 'Cisco', model: 'Firepower 1010', sku: 'FPR-1010', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 8 }, (_, i) => ({ label: i === 0 ? 'WAN' : `Eth1/${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Cisco', model: 'Firepower 1120', sku: 'FPR-1120', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 9, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Firepower 1140', sku: 'FPR-1140', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 9, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Firepower 2110', sku: 'FPR-2110', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'Management', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 12 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 14, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Firepower 2130', sku: 'FPR-2130', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'Management', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 12 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 14, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },

  // ── Cisco — Secure Firewall 1200 / 3100 (current gen) ───────────────────────
  {
    make: 'Cisco', model: 'Secure Firewall 1210CX', sku: 'SFW-1210CX', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 9, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Secure Firewall 3110', sku: 'SFW-3110', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'Management', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 10, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Cisco', model: 'Secure Firewall 3120', sku: 'SFW-3120', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'Management', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP28 ${i + 1}`, port_number: i + 10, port_type: 'sfp_plus', speed: '25g', is_uplink: 0 })),
    ]),
  },

  // ── Palo Alto Networks — legacy (PA-200/500/3000) ───────────────────────────
  {
    make: 'Palo Alto Networks', model: 'PA-220', sku: 'PA-220', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-500', sku: 'PA-500', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-3050', sku: 'PA-3050', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 10, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
    ]),
  },

  // ── Palo Alto Networks — PA-800 series ──────────────────────────────────────
  {
    make: 'Palo Alto Networks', model: 'PA-820', sku: 'PA-820', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 12 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 14, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-850', sku: 'PA-850', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 12 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 14, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 18, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },

  // ── Palo Alto Networks — PA-3200 series (recent) ────────────────────────────
  {
    make: 'Palo Alto Networks', model: 'PA-3220', sku: 'PA-3220', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 12 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 14, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 22, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-3250', sku: 'PA-3250', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 12 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 14, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 22, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-3260', sku: 'PA-3260', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1} (RJ45)`, port_number: i + 2, port_type: 'rj45', speed: '10g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP ${i + 1}`, port_number: i + 10, port_type: 'sfp', speed: '1g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 18, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },

  // ── Palo Alto Networks — PA-400 series (current SMB) ────────────────────────
  {
    make: 'Palo Alto Networks', model: 'PA-410', sku: 'PA-410', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-440', sku: 'PA-440', device_type: 'firewall', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-450', sku: 'PA-450', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-460', sku: 'PA-460', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 10, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },

  // ── Palo Alto Networks — PA-1400 series (current) ───────────────────────────
  {
    make: 'Palo Alto Networks', model: 'PA-1410', sku: 'PA-1410', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 12 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 14, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-1420', sku: 'PA-1420', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 12 }, (_, i) => ({ label: `Eth1/${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 14, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },

  // ── Palo Alto Networks — PA-3400 series (current) ───────────────────────────
  {
    make: 'Palo Alto Networks', model: 'PA-3410', sku: 'PA-3410', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1} (RJ45)`, port_number: i + 2, port_type: 'rj45', speed: '10g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 10, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP28 ${i + 1}`, port_number: i + 18, port_type: 'sfp_plus', speed: '25g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-3420', sku: 'PA-3420', device_type: 'firewall', rack_unit_height: 1,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Eth1/${i + 1} (RJ45)`, port_number: i + 2, port_type: 'rj45', speed: '10g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 8 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 10, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `SFP28 ${i + 1}`, port_number: i + 18, port_type: 'sfp_plus', speed: '25g', is_uplink: 0 })),
    ]),
  },

  // ── Palo Alto Networks — PA-5200 / PA-5400 series ───────────────────────────
  {
    make: 'Palo Alto Networks', model: 'PA-5220', sku: 'PA-5220', device_type: 'firewall', rack_unit_height: 2,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `RJ45 ${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '10g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 16 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 6, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `QSFP+ ${i + 1}`, port_number: i + 22, port_type: 'qsfp', speed: '40g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-5250', sku: 'PA-5250', device_type: 'firewall', rack_unit_height: 2,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `RJ45 ${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '10g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 16 }, (_, i) => ({ label: `SFP+ ${i + 1}`, port_number: i + 6, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `QSFP28 ${i + 1}`, port_number: i + 22, port_type: 'qsfp', speed: '100g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-5410', sku: 'PA-5410', device_type: 'firewall', rack_unit_height: 2,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `RJ45 ${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '10g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 12 }, (_, i) => ({ label: `SFP28 ${i + 1}`, port_number: i + 6, port_type: 'sfp_plus', speed: '25g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `QSFP28 ${i + 1}`, port_number: i + 18, port_type: 'qsfp', speed: '100g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'Palo Alto Networks', model: 'PA-5420', sku: 'PA-5420', device_type: 'firewall', rack_unit_height: 2,
    default_ports: JSON.stringify([
      { label: 'MGT', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 },
      ...Array.from({ length: 4 }, (_, i) => ({ label: `RJ45 ${i + 1}`, port_number: i + 2, port_type: 'rj45', speed: '10g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 12 }, (_, i) => ({ label: `SFP28 ${i + 1}`, port_number: i + 6, port_type: 'sfp_plus', speed: '25g', is_uplink: 0 })),
      ...Array.from({ length: 4 }, (_, i) => ({ label: `QSFP28 ${i + 1}`, port_number: i + 18, port_type: 'qsfp', speed: '100g', is_uplink: 0 })),
    ]),
  },

  // ── QNAP NAS ────────────────────────────────────────────────────────────────
  {
    make: 'QNAP', model: 'TS-264', sku: 'TS-264', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `2.5GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'QNAP', model: 'TS-464', sku: 'TS-464', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `2.5GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'QNAP', model: 'TS-673A', sku: 'TS-673A', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `2.5GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'QNAP', model: 'TS-873A', sku: 'TS-873A', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `2.5GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'QNAP', model: 'TVS-h674', sku: 'TVS-H674', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `2.5GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'QNAP', model: 'TS-873AU (Rack)', sku: 'TS-873AU', device_type: 'nas', rack_unit_height: 2,
    default_ports: JSON.stringify([
      ...Array.from({ length: 2 }, (_, i) => ({ label: `2.5GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `10GbE SFP+ ${i + 1}`, port_number: i + 3, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },
  {
    make: 'QNAP', model: 'TS-1273AU-RP (Rack)', sku: 'TS-1273AU-RP', device_type: 'nas', rack_unit_height: 2,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `2.5GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },

  // ── TrueNAS / iXsystems ─────────────────────────────────────────────────────
  {
    make: 'TrueNAS', model: 'Mini X+', sku: 'TRUENAS-MINI-X-PLUS', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 4 }, (_, i) => ({ label: `1GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'TrueNAS', model: 'Mini R (1U)', sku: 'TRUENAS-MINI-R', device_type: 'nas', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 2 }, (_, i) => ({ label: `10GbE SFP+ ${i + 1}`, port_number: i + 1, port_type: 'sfp_plus', speed: '10g', is_uplink: i === 0 ? 1 : 0 })),
      { label: 'IPMI', port_number: 3, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'TrueNAS', model: 'R20 (2U)', sku: 'TRUENAS-R20', device_type: 'nas', rack_unit_height: 2,
    default_ports: JSON.stringify([
      ...Array.from({ length: 4 }, (_, i) => ({ label: `10GbE SFP+ ${i + 1}`, port_number: i + 1, port_type: 'sfp_plus', speed: '10g', is_uplink: i === 0 ? 1 : 0 })),
      { label: 'IPMI', port_number: 5, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },
  {
    make: 'TrueNAS', model: 'R50 (4U)', sku: 'TRUENAS-R50', device_type: 'nas', rack_unit_height: 4,
    default_ports: JSON.stringify([
      ...Array.from({ length: 2 }, (_, i) => ({ label: `25GbE SFP28 ${i + 1}`, port_number: i + 1, port_type: 'sfp_plus', speed: '25g', is_uplink: i === 0 ? 1 : 0 })),
      { label: 'IPMI', port_number: 3, port_type: 'rj45', speed: '1g', is_uplink: 0 },
    ]),
  },

  // ── Asustor ─────────────────────────────────────────────────────────────────
  {
    make: 'Asustor', model: 'Drivestor 4 Pro (AS3304T)', sku: 'AS3304T', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: '2.5GbE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'Asustor', model: 'Lockerstor 4 (AS6704T)', sku: 'AS6704T', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `2.5GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Asustor', model: 'Lockerstor 6 (AS6706T)', sku: 'AS6706T', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `2.5GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Asustor', model: 'Lockerstor 4RD (AS6504RD, 1U)', sku: 'AS6504RD', device_type: 'nas', rack_unit_height: 1,
    default_ports: JSON.stringify([
      ...Array.from({ length: 2 }, (_, i) => ({ label: `2.5GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 })),
      ...Array.from({ length: 2 }, (_, i) => ({ label: `10GbE SFP+ ${i + 1}`, port_number: i + 3, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 })),
    ]),
  },

  // ── UGREEN NASync ─────────────────────────────────────────────────────────────
  {
    make: 'UGREEN', model: 'NASync DXP2800', sku: 'DXP2800', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: '2.5GbE', port_number: 1, port_type: 'rj45', speed: '2_5g', is_uplink: 1 }]),
  },
  {
    make: 'UGREEN', model: 'NASync DXP4800', sku: 'DXP4800', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `2.5GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '2_5g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'UGREEN', model: 'NASync DXP4800 Plus', sku: 'DXP4800-PLUS', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: '10GbE', port_number: 1, port_type: 'rj45', speed: '10g', is_uplink: 1 },
      { label: '2.5GbE', port_number: 2, port_type: 'rj45', speed: '2_5g', is_uplink: 0 },
    ]),
  },
  {
    make: 'UGREEN', model: 'NASync DXP6800 Pro', sku: 'DXP6800-PRO', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `10GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '10g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'UGREEN', model: 'NASync DXP8800 Plus', sku: 'DXP8800-PLUS', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `10GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '10g', is_uplink: i === 0 ? 1 : 0 }))),
  },

  // ── Drobo (legacy) + custom NAS ─────────────────────────────────────────────
  {
    make: 'Drobo', model: '5N2', sku: 'DROBO-5N2', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `1GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Drobo', model: '5N', sku: 'DROBO-5N', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: '1GbE', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 }]),
  },
  {
    make: 'Drobo', model: 'B810n', sku: 'DROBO-B810N', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 3 }, (_, i) => ({ label: `1GbE ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Custom', model: 'Custom NAS (4-bay)', sku: 'CUSTOM-NAS-4BAY', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ label: `NIC ${i + 1}`, port_number: i + 1, port_type: 'rj45', speed: '1g', is_uplink: i === 0 ? 1 : 0 }))),
  },
  {
    make: 'Custom', model: 'Custom NAS (4-bay, 10G)', sku: 'CUSTOM-NAS-4BAY-10G', device_type: 'nas', rack_unit_height: null,
    default_ports: JSON.stringify([
      { label: 'NIC 1 (1G)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 1 },
      { label: 'NIC 2 (10G)', port_number: 2, port_type: 'sfp_plus', speed: '10g', is_uplink: 0 },
    ]),
  },

  // ── APC UPS (rackmount) ─────────────────────────────────────────────────────
  {
    make: 'APC', model: 'Smart-UPS SMT750RM2U (750VA)', sku: 'APC-SMT750RM2U', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (AP9631)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(6, 'nema_5_15'),
  },
  {
    make: 'APC', model: 'Smart-UPS SMT1000RM2U (1000VA)', sku: 'APC-SMT1000RM2U', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (AP9631)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(6, 'nema_5_15'),
  },
  {
    make: 'APC', model: 'Smart-UPS SMT1500RM2U (1500VA)', sku: 'APC-SMT1500RM2U', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (AP9631)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'nema_5_15'),
  },
  {
    make: 'APC', model: 'Smart-UPS SMT2200RM2U (2200VA)', sku: 'APC-SMT2200RM2U', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (AP9631)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'nema_5_15'),
  },
  {
    make: 'APC', model: 'Smart-UPS SMX1500RM2U (1440VA)', sku: 'APC-SMX1500RM2U', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (AP9631)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'nema_5_15'),
  },
  // ── APC UPS (tower / desktop) ───────────────────────────────────────────────
  {
    make: 'APC', model: 'Smart-UPS SMT750 (Tower, 750VA)', sku: 'APC-SMT750', device_type: 'ups', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (AP9631)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(6, 'nema_5_15'),
  },
  {
    make: 'APC', model: 'Smart-UPS SMT1500 (Tower, 1500VA)', sku: 'APC-SMT1500', device_type: 'ups', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (AP9631)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'nema_5_15'),
  },
  {
    make: 'APC', model: 'Smart-UPS C SMC1500 (Tower, 1500VA)', sku: 'APC-SMC1500', device_type: 'ups', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (slot)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'nema_5_15'),
  },
  {
    make: 'APC', model: 'Back-UPS Pro BR1500MS (Tower, 1500VA)', sku: 'APC-BR1500MS', device_type: 'ups', rack_unit_height: null,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(10, 'nema_5_15'),
  },
  {
    make: 'APC', model: 'Back-UPS BX1500M (Tower, 1500VA)', sku: 'APC-BX1500M', device_type: 'ups', rack_unit_height: null,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(10, 'nema_5_15'),
  },

  // ── CyberPower UPS (rackmount) ──────────────────────────────────────────────
  {
    make: 'CyberPower', model: 'OR700LCDRM1U (700VA)', sku: 'CP-OR700LCDRM1U', device_type: 'ups', rack_unit_height: 1,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (RMCARD)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(6, 'nema_5_15'),
  },
  {
    make: 'CyberPower', model: 'OR1000LCDRM1U (1000VA)', sku: 'CP-OR1000LCDRM1U', device_type: 'ups', rack_unit_height: 1,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (RMCARD)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(6, 'nema_5_15'),
  },
  {
    make: 'CyberPower', model: 'OR1500LCDRM1U (1500VA)', sku: 'CP-OR1500LCDRM1U', device_type: 'ups', rack_unit_height: 1,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (RMCARD)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'nema_5_15'),
  },
  {
    make: 'CyberPower', model: 'PR1500RT2U (1500VA)', sku: 'CP-PR1500RT2U', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (RMCARD)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'nema_5_15'),
  },
  {
    make: 'CyberPower', model: 'PR2200LCDRT2U (2200VA)', sku: 'CP-PR2200LCDRT2U', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (RMCARD)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'nema_5_15'),
  },
  // ── CyberPower UPS (tower / desktop) ────────────────────────────────────────
  {
    make: 'CyberPower', model: 'CP1500PFCLCD (Tower, 1500VA)', sku: 'CP-CP1500PFCLCD', device_type: 'ups', rack_unit_height: null,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(12, 'nema_5_15'),
  },
  {
    make: 'CyberPower', model: 'CP1350PFCLCD (Tower, 1350VA)', sku: 'CP-CP1350PFCLCD', device_type: 'ups', rack_unit_height: null,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(10, 'nema_5_15'),
  },

  // ── Eaton UPS (rackmount, IEC C13 outlets) ──────────────────────────────────
  {
    make: 'Eaton', model: '5P 1550R (1U, 1550VA)', sku: 'EATON-5P1550R', device_type: 'ups', rack_unit_height: 1,
    default_ports: JSON.stringify([{ label: 'Network-M2', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'c13'),
  },
  {
    make: 'Eaton', model: '5PX 1500RT (2U, 1500VA)', sku: 'EATON-5PX1500RT', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network-M2', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'c13'),
  },
  {
    make: 'Eaton', model: '5PX 2200RT (2U, 2200VA)', sku: 'EATON-5PX2200RT', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network-M2', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Outlet ${i + 1}`, outlet_type: 'c13', max_watts: null })),
      { label: 'Outlet 9 (C19)', outlet_type: 'c19', max_watts: null },
    ]),
  },
  {
    make: 'Eaton', model: '9PX 1500RT (2U, 1500VA)', sku: 'EATON-9PX1500RT', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network-M2', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'c13'),
  },
  {
    make: 'Eaton', model: '9PX 3000RT (2U, 3000VA)', sku: 'EATON-9PX3000RT', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network-M2', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: JSON.stringify([
      ...Array.from({ length: 8 }, (_, i) => ({ label: `Outlet ${i + 1}`, outlet_type: 'c13', max_watts: null })),
      { label: 'Outlet 9 (C19)', outlet_type: 'c19', max_watts: null },
      { label: 'Outlet 10 (C19)', outlet_type: 'c19', max_watts: null },
    ]),
  },
  // ── Eaton UPS (tower / desktop) ─────────────────────────────────────────────
  {
    make: 'Eaton', model: '5S 1500 (Tower, 1500VA)', sku: 'EATON-5S1500', device_type: 'ups', rack_unit_height: null,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(10, 'nema_5_15'),
  },
  {
    make: 'Eaton', model: '5SC 1500 (Tower, 1500VA)', sku: 'EATON-5SC1500', device_type: 'ups', rack_unit_height: null,
    default_ports: JSON.stringify([{ label: 'Network slot', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'nema_5_15'),
  },

  // ── Tripp Lite UPS ──────────────────────────────────────────────────────────
  {
    make: 'Tripp Lite', model: 'SmartPro SMART1000RM1U (1U, 1000VA)', sku: 'TRIPP-SMART1000RM1U', device_type: 'ups', rack_unit_height: 1,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (WEBCARDLX)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(6, 'nema_5_15'),
  },
  {
    make: 'Tripp Lite', model: 'SmartPro SMART1500RMXL2U (2U, 1500VA)', sku: 'TRIPP-SMART1500RMXL2U', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network Mgmt (WEBCARDLX)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(6, 'nema_5_15'),
  },
  {
    make: 'Tripp Lite', model: 'SmartPro SMART1500LCD (Tower, 1500VA)', sku: 'TRIPP-SMART1500LCD', device_type: 'ups', rack_unit_height: null,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(8, 'nema_5_15'),
  },
  {
    make: 'Tripp Lite', model: 'OmniVS OMNI1500LCDT (Tower, 1500VA)', sku: 'TRIPP-OMNI1500LCDT', device_type: 'ups', rack_unit_height: null,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(8, 'nema_5_15'),
  },

  // ── Vertiv (Liebert) UPS ────────────────────────────────────────────────────
  {
    make: 'Vertiv', model: 'Liebert GXT5 1500RT120 (2U, 1500VA)', sku: 'VERTIV-GXT5-1500RT120', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network (RDU101)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(6, 'nema_5_15'),
  },
  {
    make: 'Vertiv', model: 'Liebert GXT5 3000RT120 (2U, 3000VA)', sku: 'VERTIV-GXT5-3000RT120', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network (RDU101)', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(6, 'nema_5_15'),
  },
  {
    make: 'Vertiv', model: 'Liebert PSI5 1500RT120 (2U, 1500VA)', sku: 'VERTIV-PSI5-1500RT120', device_type: 'ups', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network slot', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(8, 'nema_5_15'),
  },

  // ── Rack PDUs (basic / metered) ─────────────────────────────────────────────
  {
    make: 'APC', model: 'Rack PDU Basic AP9559 (1U)', sku: 'APC-AP9559', device_type: 'pdu', rack_unit_height: 1,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(12, 'nema_5_15'),
  },
  {
    make: 'APC', model: 'Rack PDU Metered AP8861 (0U/2U)', sku: 'APC-AP8861', device_type: 'pdu', rack_unit_height: 2,
    default_ports: JSON.stringify([{ label: 'Network', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(24, 'c13'),
  },
  {
    make: 'CyberPower', model: 'PDU15M10AT Metered (1U)', sku: 'CP-PDU15M10AT', device_type: 'pdu', rack_unit_height: 1,
    default_ports: JSON.stringify([{ label: 'Network', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(10, 'nema_5_15'),
  },
  {
    make: 'CyberPower', model: 'PDU15B2F12R Basic (1U)', sku: 'CP-PDU15B2F12R', device_type: 'pdu', rack_unit_height: 1,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(14, 'nema_5_15'),
  },
  {
    make: 'Tripp Lite', model: 'PDUMH15 Metered (1U)', sku: 'TRIPP-PDUMH15', device_type: 'pdu', rack_unit_height: 1,
    default_ports: JSON.stringify([{ label: 'Network', port_number: 1, port_type: 'rj45', speed: '1g', is_uplink: 0 }]),
    default_outlets: outlets(14, 'nema_5_15'),
  },
  {
    make: 'Eaton', model: 'ePDU EMAB03 Basic (1U)', sku: 'EATON-EMAB03', device_type: 'pdu', rack_unit_height: 1,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(12, 'c13'),
  },
  {
    make: 'Generic', model: 'Vertical PDU 0U (24× C13)', sku: 'GEN-PDU-0U-24', device_type: 'pdu', rack_unit_height: null,
    default_ports: JSON.stringify([]),
    default_outlets: outlets(24, 'c13'),
  },
];

module.exports = { seedLocations, seedVlans, seedTemplates };
