// Small curated OUI → vendor map for common home-lab / SMB network gear.
// Keyed by the first three octets of the MAC, uppercase, no separators.
// This is intentionally a best-effort subset, not the full IEEE registry.
const OUI = {
  // Ubiquiti
  '24A43C': 'Ubiquiti', '687251': 'Ubiquiti', '802AA8': 'Ubiquiti', 'B4FBE4': 'Ubiquiti',
  'DC9FDB': 'Ubiquiti', 'F09FC2': 'Ubiquiti', 'FCECDA': 'Ubiquiti', '74ACB9': 'Ubiquiti',
  '78451D': 'Ubiquiti', '944A09': 'Ubiquiti', 'E063DA': 'Ubiquiti', '0418D6': 'Ubiquiti',
  // Synology
  '0011D8': 'Synology', '0011BE': 'Synology', '90094E': 'Synology', '001132': 'Synology',
  // QNAP
  '00089F': 'QNAP', '245EBE': 'QNAP', '24181D': 'QNAP',
  // Fortinet
  '000FE5': 'Fortinet', '085B0E': 'Fortinet', '90F652': 'Fortinet', '70E3AC': 'Fortinet',
  // Palo Alto Networks
  '000119': 'Palo Alto Networks', 'B4F0AB': 'Palo Alto Networks',
  // Cisco / Meraki
  '00000C': 'Cisco', '001A2F': 'Cisco', '380E4D': 'Cisco', 'E80462': 'Cisco',
  '0018BB': 'Cisco Meraki', '88153C': 'Cisco Meraki', 'E0CB4E': 'Cisco Meraki', 'AC17C8': 'Cisco Meraki',
  // TP-Link
  '50C7BF': 'TP-Link', 'AC84C6': 'TP-Link', '003192': 'TP-Link', '5C628B': 'TP-Link', '9C5322': 'TP-Link',
  // MikroTik
  '4C5E0C': 'MikroTik', '6C3B6B': 'MikroTik', 'CC2DE0': 'MikroTik', '08555D': 'MikroTik', '2CC81B': 'MikroTik',
  // Netgear
  '000FB5': 'Netgear', '20E52A': 'Netgear', '9CD36D': 'Netgear', 'A040A0': 'Netgear', 'CC40D0': 'Netgear',
  // HPE / Aruba
  '000B86': 'Aruba', '186472': 'Aruba', '94B40F': 'Aruba', '6CF37F': 'Aruba',
  '001185': 'HP', '3C52A1': 'HP', '9C8E99': 'HP',
  // Dell
  '00188B': 'Dell', '14FEB5': 'Dell', 'B8CA3A': 'Dell', 'F8BC12': 'Dell',
  // APC
  '00C0B7': 'APC',
  // Firewalla (built on common SBC OUIs; best-effort)
  // Raspberry Pi
  'B827EB': 'Raspberry Pi', 'DCA632': 'Raspberry Pi', 'E45F01': 'Raspberry Pi', '2CCF67': 'Raspberry Pi',
  // Intel NUC / generic Intel NICs
  '94C691': 'Intel', '8CC681': 'Intel', '001B21': 'Intel', '00A0C9': 'Intel',
  // VMware (virtual machines)
  '000569': 'VMware', '000C29': 'VMware', '005056': 'VMware', '001C14': 'VMware',
  // Apple
  '001451': 'Apple', '3C0754': 'Apple', 'F0DBF8': 'Apple', 'A4D1D2': 'Apple',
};

function vendorForMac(mac) {
  if (!mac) return null;
  const prefix = mac.replace(/[^a-fA-F0-9]/g, '').slice(0, 6).toUpperCase();
  return OUI[prefix] || null;
}

module.exports = { vendorForMac };
