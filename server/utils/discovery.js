const { execFile } = require('child_process');
const fs = require('fs');
const dns = require('dns').promises;
const { vendorForMac } = require('./oui');

// Expand an IPv4 CIDR (/24../30) into a list of host addresses. Capped at /24.
function expandCidr(cidr) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/.exec((cidr || '').trim());
  if (!m) throw new Error('Invalid CIDR (use e.g. 192.168.1.0/24)');
  const octets = [m[1], m[2], m[3], m[4]].map(Number);
  const bits = Number(m[5]);
  if (octets.some(o => o > 255) || bits < 24 || bits > 30) {
    throw new Error('Range must be between /24 and /30');
  }
  const base = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  const network = (base & mask) >>> 0;
  const hostCount = 2 ** (32 - bits);
  const hosts = [];
  for (let i = 1; i < hostCount - 1; i++) {
    const addr = (network + i) >>> 0;
    hosts.push([(addr >>> 24) & 255, (addr >>> 16) & 255, (addr >>> 8) & 255, addr & 255].join('.'));
  }
  return hosts;
}

// Single-shot ping; resolves true if the host replies.
function pingOnce(host) {
  return new Promise((resolve) => {
    let args;
    if (process.platform === 'win32') args = ['-n', '1', '-w', '1000', host];
    else if (process.platform === 'darwin') args = ['-c', '1', '-W', '1000', host];
    else args = ['-c', '1', '-W', '1', host];
    execFile('ping', args, { timeout: 2000 }, (err) => resolve(!err));
  });
}

// Read the OS ARP cache into an { ip: mac } map.
function arpTable() {
  return new Promise((resolve) => {
    if (process.platform === 'linux') {
      try {
        const text = fs.readFileSync('/proc/net/arp', 'utf-8');
        const map = {};
        text.split('\n').slice(1).forEach(line => {
          const cols = line.trim().split(/\s+/);
          if (cols.length >= 4 && cols[3] && cols[3] !== '00:00:00:00:00:00') map[cols[0]] = cols[3].toLowerCase();
        });
        return resolve(map);
      } catch { return resolve({}); }
    }
    // macOS / BSD: parse `arp -a`
    execFile('arp', ['-a'], { timeout: 4000 }, (err, stdout) => {
      if (err) return resolve({});
      const map = {};
      (stdout || '').split('\n').forEach(line => {
        const m = /\(([\d.]+)\) at ([0-9a-fA-F:]+)/.exec(line);
        if (m && m[2] !== 'ff:ff:ff:ff:ff:ff') map[m[1]] = m[2].toLowerCase();
      });
      resolve(map);
    });
  });
}

// Sweep a CIDR. Returns [{ ip, mac, hostname, vendor }] for responding hosts.
async function scanSubnet(cidr, batchSize = 32) {
  const hosts = expandCidr(cidr);
  const alive = [];
  for (let i = 0; i < hosts.length; i += batchSize) {
    const batch = hosts.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(async h => ({ ip: h, up: await pingOnce(h) })));
    results.forEach(r => { if (r.up) alive.push(r.ip); });
  }
  const arp = await arpTable();
  const out = [];
  for (const ip of alive) {
    let hostname = null;
    try { const names = await dns.reverse(ip); hostname = names[0] || null; } catch { /* no PTR */ }
    const mac = arp[ip] || null;
    out.push({ ip, mac, hostname, vendor: vendorForMac(mac) });
  }
  return out;
}

module.exports = { scanSubnet, expandCidr };
