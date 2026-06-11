const { execFile } = require('child_process');
const net = require('net');
const http = require('http');
const https = require('https');

const TIMEOUT_MS = 3000;

// Resolve the host to check: explicit monitor_target, else management_ip.
function targetHost(device) {
  const t = (device.monitor_target && device.monitor_target.trim()) || device.management_ip;
  return t ? String(t).trim() : null;
}

// ICMP ping via the system `ping` binary (no raw sockets / root needed).
// Linux/macOS only; on Windows or when ping is missing, returns 'unknown'.
function pingHost(host) {
  return new Promise((resolve) => {
    // `-W` is seconds on Linux but milliseconds on macOS; `-w`/`-n` on Windows.
    let args;
    if (process.platform === 'win32') args = ['-n', '1', '-w', String(TIMEOUT_MS), host];
    else if (process.platform === 'darwin') args = ['-c', '1', '-W', String(TIMEOUT_MS), host];
    else args = ['-c', '1', '-W', '3', host]; // Linux: 3-second reply timeout
    const start = Date.now();
    execFile('ping', args, { timeout: TIMEOUT_MS + 500 }, (err, stdout) => {
      const elapsed = Date.now() - start;
      if (err && err.code === 'ENOENT') return resolve({ status: 'unknown', latency_ms: null });
      if (err) return resolve({ status: 'offline', latency_ms: null });
      // Try to parse "time=12.3 ms" for a more accurate latency
      const m = /time[=<]\s*([\d.]+)\s*ms/i.exec(stdout || '');
      const latency = m ? Math.round(parseFloat(m[1])) : elapsed;
      resolve({ status: 'online', latency_ms: latency });
    });
  });
}

function tcpCheck(host, port) {
  return new Promise((resolve) => {
    if (!port) return resolve({ status: 'unknown', latency_ms: null });
    const start = Date.now();
    const socket = new net.Socket();
    let done = false;
    const finish = (status) => { if (done) return; done = true; socket.destroy(); resolve({ status, latency_ms: status === 'online' ? Date.now() - start : null }); };
    socket.setTimeout(TIMEOUT_MS);
    socket.once('connect', () => finish('online'));
    socket.once('timeout', () => finish('offline'));
    socket.once('error', () => finish('offline'));
    socket.connect(port, host);
  });
}

function httpCheck(host, scheme, port) {
  return new Promise((resolve) => {
    const lib = scheme === 'https' ? https : http;
    const defaultPort = scheme === 'https' ? 443 : 80;
    const start = Date.now();
    const req = lib.request(
      { host, port: port || defaultPort, method: 'HEAD', path: '/', timeout: TIMEOUT_MS, rejectUnauthorized: false },
      (res) => { res.resume(); resolve({ status: 'online', latency_ms: Date.now() - start }); }
    );
    req.on('timeout', () => { req.destroy(); resolve({ status: 'offline', latency_ms: null }); });
    req.on('error', () => resolve({ status: 'offline', latency_ms: null }));
    req.end();
  });
}

// Run the configured check for a device. Returns { status, latency_ms }.
async function checkDevice(device) {
  const host = targetHost(device);
  if (!host) return { status: 'unknown', latency_ms: null };
  const method = device.monitor_method || 'ping';
  try {
    if (method === 'tcp') return await tcpCheck(host, device.monitor_port);
    if (method === 'http') return await httpCheck(host, 'http', device.monitor_port);
    if (method === 'https') return await httpCheck(host, 'https', device.monitor_port);
    return await pingHost(host);
  } catch {
    return { status: 'unknown', latency_ms: null };
  }
}

module.exports = { checkDevice, targetHost };
