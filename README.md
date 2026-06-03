# CableMap

**Physical network documentation for home labs and small offices.** Map your devices, ports, cable runs, patch panels, and racks — then keep a visual, searchable record of what's plugged into what, backed up with real photos of your gear.

CableMap is a self-hosted, single-binary-ish web app (Node + SQLite) with a dark, keyboard-friendly UI. It's built for the person who has traced one cable too many and wants to write it down once.

[![License: MIT](https://img.shields.io/badge/License-MIT-06B6D4.svg)](LICENSE)
![Node](https://img.shields.io/badge/Node-20%2B-22C55E.svg)
![Status](https://img.shields.io/badge/release-v0.2.0-3B82F6.svg)

---

## Why

Home labs grow organically. You add a switch, a NAS, an AP, a UPS — and six months later you can't remember whether port 14 on the core switch goes to the office wall jack or the garage. CableMap is a focused record-keeping tool for exactly that:

- **Write down the trace** — port A → patch panel → port B, with cable type, color, length, and VLAN.
- **Prove it with a photo** — attach pictures of the actual cable run, the device, or the whole rack.
- **See it two ways** — a fast searchable table for daily lookups, and a visual canvas + rack elevation for planning and documentation.

---

## Features

- **Devices, ports & connections** — full CRUD with a port-conflict-aware connection model (a port can only hold one active connection at a time).
- **Patch panel support** — front/back port pairs are modeled as linked ports, so a cable trace follows through the panel automatically.
- **Port trace algorithm** — `GET /api/ports/:id/trace` walks the physical path hop-by-hop (including patch-panel pass-through and cycle detection).
- **Rack elevation view** — a real front-of-rack "U" diagram driven by each device's rack position. Click a slot to jump to the device; passive occupants (UPS, shelves, blank panels) take up space too.
- **Canvas view** — a [React Flow](https://reactflow.com/) topology map with device nodes, color-coded cable edges, draggable layout, and VLAN/location filtering.
- **Power mapping** — model UPS/PDU outlets and which device each one feeds (with receptacle types and estimated draw). Device detail shows an outlet map for power sources and a "powered by" panel for everything else.
- **Change history** — an append-only timeline of every device, connection, and power change, with a global History page and a per-device view.
- **Photos & documents** — attach images (cable traces, device shots, rack photos) with auto-generated thumbnails, plus PDF spec sheets and Visio stencils. There's also a free-form photo gallery.
- **Full backup & restore** — one-click ZIP of all data + uploaded files, and a guarded restore.
- **344 built-in device templates** across 25+ vendors — pick a model and the device form auto-fills make, type, rack height, ports, and (for UPS/PDU) outlets.
- **Custom templates** — create your own gear (manufacturer, model, OS/firmware, form factor, ports, photo, spec sheet, product URLs). Built-ins are read-only; your custom ones are fully editable down to individual ports.
- **VLAN manager, full-text search, CSV import/export, and PDF port-map export.**
- **Single-user session auth**, dark-mode-only UI, mobile-friendly list/search views.

### Built-in template library

344 templates spanning networking, security, NAS, and power gear, including:

- **Ubiquiti** — the UniFi lineup (gateways, switches, access points, aggregation)
- **Firewalls / NGFW** — Fortinet (FortiGate/FortiSwitch/FortiAP, D/E/F gens), Palo Alto Networks (PA-200 → PA-5400), Cisco (ASA, Firepower, Secure Firewall), Cisco Meraki MX, Netgate/pfSense, OPNsense, Sophos XGS, SonicWall TZ, Protectli
- **Switches / APs** — Cisco Catalyst (1200/1300, 2960-X, 3850, 9200/9300) & Meraki MS/MR, TP-Link Omada, MikroTik, Netgear, Aruba Instant On
- **NAS** — Synology, QNAP, TrueNAS/iXsystems, Asustor, UGREEN, Drobo, plus custom DIY builds
- **UPS / power** — APC, CyberPower, Eaton, Tripp Lite, Vertiv (rackmount + tower/desktop), plus rack PDUs — all with outlet definitions
- **Generic** — patch panels, rackmount servers, UPS, shelves/drawers, blank rackspace, DIY

> ⚠️ Template port layouts are **best-effort reference data** to save you typing — not a guaranteed spec sheet. Every value is editable after you add a device, and you can create your own custom templates. Corrections via PR are welcome.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS, bundled with Vite |
| Canvas | React Flow (`reactflow`) |
| Charts | Chart.js |
| Backend | Node.js + Express |
| Database | SQLite via `better-sqlite3` |
| Auth | `express-session` + `bcrypt` (single user) |
| Images | `sharp` (server-side thumbnails) |
| Export | CSV + PDF (`pdfkit`) |

---

## Quick start (local)

**Prerequisites:** Node.js 20+ and npm.

```bash
git clone https://github.com/breed007/CableMap.git
cd CableMap

# Install root, client, and server dependencies
npm run install:all

# Configure environment (change the secrets!)
cp .env.example .env
#   edit .env → set SESSION_SECRET and ADMIN_PASSWORD

# Initialize the database (creates tables, seeds locations, VLANs, templates)
npm run db:init

# Run client (Vite) + server (Express) together
npm run dev
```

- Frontend dev server: **http://localhost:5173**
- API: **http://localhost:3000**

Log in with the `ADMIN_USERNAME` / `ADMIN_PASSWORD` from your `.env`.

### Production build

```bash
npm run build     # builds the React app into server/public/
npm start         # serves the app + API from Express on PORT (default 3000)
```

---

## Docker

```bash
cp .env.example .env   # edit secrets
docker compose up -d
```

The app runs on port 3000 and stores everything (database, sessions, uploaded photos) in a named volume mounted at `/data`. See [`docs/deployment-docker.md`](docs/deployment-docker.md) for update, backup, and reset instructions.

---

## Configuration

All configuration is via environment variables (see `.env.example`):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `SESSION_SECRET` | `changeme` | Session signing secret — **change this** |
| `ADMIN_USERNAME` | `admin` | Login username |
| `ADMIN_PASSWORD` | `changeme` | Login password (plaintext, or a `bcrypt` hash) — **change this** |
| `DATA_DIR` | `./data` | Directory for the DB, sessions, and uploads |
| `DB_PATH` | `./data/cablemap.db` | SQLite database path |

To use a hashed admin password instead of plaintext:

```bash
node -e "require('bcrypt').hash('your-password', 10).then(h => console.log(h))"
# paste the $2b$... output as ADMIN_PASSWORD
```

---

## Deployment

- **Linux (PM2 + Nginx/Apache):** [`docs/deployment-linux.md`](docs/deployment-linux.md)
- **Docker:** [`docs/deployment-docker.md`](docs/deployment-docker.md)

---

## Project structure

```
CableMap/
├── client/          React + Vite frontend
│   └── src/
│       ├── pages/        Dashboard, Devices, Connections, Canvas, Racks, Templates, …
│       ├── components/   Sidebar, Modal, PhotoUploader, DocumentUploader, icons
│       └── utils/        API client, color/label maps
├── server/          Express backend
│   ├── db/               schema, seeds (templates), init/migrations
│   ├── routes/           devices, ports, connections, vlans, attachments, templates, …
│   └── utils/            tracePath (port-trace algorithm)
├── docs/            Deployment guides
└── data/            SQLite DB + uploads (gitignored)
```

---

## API overview

All routes are under `/api/` and require an authenticated session.

```
GET|POST        /api/locations              GET /api/locations/:id   (rack elevation)
GET|POST        /api/devices                PUT /api/devices/:id/position
POST            /api/devices/:id/ports/bulk-create
GET|PUT|DELETE  /api/ports/:id              GET /api/ports/:id/trace
GET|POST        /api/connections
GET|POST        /api/vlans
GET|POST|PUT|DELETE /api/device-templates   (custom templates editable; built-ins read-only)
GET|POST|PUT|DELETE /api/attachments        (images + PDF/Visio docs)
GET|POST|PUT|DELETE /api/power/outlets      POST /api/power/outlets/bulk-create
GET|POST|PUT|DELETE /api/power/connections  (outlet → device power mapping)
GET             /api/history                GET /api/history/device/:id
GET             /api/backup/export          POST /api/backup/import
GET             /api/search?q=              GET /api/summary
POST            /api/import/connections     GET /api/export/connections
GET             /api/export/device/:id/pdf
```

---

## Contributing

Contributions are welcome — especially **device template corrections and additions**. To add or fix templates, edit `server/db/seeds.js` (the `seedTemplates` array) and open a PR. Each template lists its make, model, SKU, device type, rack height, and a `default_ports` array.

1. Fork and create a branch.
2. Make your change; run `npm run build` to confirm the client compiles.
3. For schema changes, keep `server/db/init.js` migrations additive and idempotent.
4. Open a pull request.

---

## License

[MIT](LICENSE) © 2026 breed007

---

> CableMap was designed for documenting your own network. It is single-user and intended to run on a trusted LAN or behind a reverse proxy with HTTPS — not exposed directly to the public internet.
