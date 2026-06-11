#!/usr/bin/env node
// CableMap MCP server — exposes the physical-layer record (devices, ports,
// connections, topology) as read-only tools for AI assistants over stdio.
//
// Optional / experimental. Requires the MCP SDK:
//   cd server && npm install @modelcontextprotocol/sdk
// Run:
//   DB_PATH=../data/cablemap.db node mcp.mjs
//
// It reads the SQLite database directly (read-only intent) using Node's built-in
// node:sqlite driver, so it does not need the web server to be running.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import topo from './utils/topology.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../data/cablemap.db');
const db = new DatabaseSync(DB_PATH);

function getDevice(idOrName) {
  const byId = /^\d+$/.test(String(idOrName))
    ? db.prepare('SELECT * FROM devices WHERE id = ?').get(Number(idOrName)) : null;
  const dev = byId || db.prepare('SELECT * FROM devices WHERE name = ? COLLATE NOCASE').get(String(idOrName));
  if (!dev) return null;
  dev.ports = db.prepare('SELECT id, label, port_type, speed, panel_side FROM ports WHERE device_id = ? ORDER BY port_number, label').all(dev.id);
  return dev;
}

function search(q) {
  const like = `%${q}%`;
  return {
    devices: db.prepare('SELECT id, name, device_type, management_ip FROM devices WHERE name LIKE ? OR management_ip LIKE ? OR make LIKE ? OR model LIKE ? LIMIT 25').all(like, like, like, like),
    ports: db.prepare('SELECT p.id, p.label, d.name AS device FROM ports p JOIN devices d ON p.device_id = d.id WHERE p.label LIKE ? LIMIT 25').all(like),
  };
}

const TOOLS = [
  { name: 'cablemap_list_devices', description: 'List all devices with type, management IP, and live status.', inputSchema: { type: 'object', properties: {} } },
  { name: 'cablemap_get_device', description: 'Get one device (by numeric id or exact name) including its ports.', inputSchema: { type: 'object', properties: { device: { type: 'string', description: 'Device id or name' } }, required: ['device'] } },
  { name: 'cablemap_list_connections', description: 'List all cable connections (which device/port connects to which).', inputSchema: { type: 'object', properties: {} } },
  { name: 'cablemap_search', description: 'Search devices and ports by free text.', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'cablemap_topology', description: 'Return the full topology document (devices + connections + locations + VLANs).', inputSchema: { type: 'object', properties: {} } },
];

const server = new Server({ name: 'cablemap', version: '0.4.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  let result;
  switch (name) {
    case 'cablemap_list_devices': result = topo.listDevices(db); break;
    case 'cablemap_get_device': {
      result = getDevice(args.device);
      if (!result) result = { error: `No device matching "${args.device}"` };
      break;
    }
    case 'cablemap_list_connections': result = topo.listConnections(db); break;
    case 'cablemap_search': result = search(args.query || ''); break;
    case 'cablemap_topology': result = topo.buildTopology(db); break;
    default: result = { error: `Unknown tool: ${name}` };
  }
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`CableMap MCP server ready (db: ${DB_PATH})`);
