# Changelog

All notable changes to CableMap are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

## [0.4.0] — 2026-06-04

### Added

- **Reachability monitoring** — opt-in, lightweight live status for any device with a management IP. Choose a method (ICMP ping, HTTP, HTTPS, or TCP-port), and CableMap shows **online / offline / unknown** dots in the device list, on device detail (with latency and a "Check now" button), and as an "online / total" stat on the dashboard. A background sweep runs on a configurable interval (`MONITOR_INTERVAL_SECONDS`, default 60; set 0 to disable), and status transitions are logged to history. This is a documentation aid, not a full monitoring system — no metrics or alerting.
- **Canvas upgrades** — device nodes now reflect live status (colored border + dot), plus three canvas **themes** (Dark, Midnight, Blueprint), an uplink-aware **auto-layout** that arranges the topology left-to-right from your routers/firewalls, and **PNG export** (in addition to SVG).
- **Network discovery** — sweep a subnet (`/24`–`/30`) to find live hosts and bootstrap your inventory. CableMap pings each host, reads MAC from the ARP cache (best-effort vendor lookup) and hostname via reverse DNS, and drops findings into a **pending-devices queue** you approve or ignore. A documentation aid — it pings, it doesn't port-scan.
- **Read-only share links** — create revocable, no-login "live view" links (device status, structure, and connections) for a wall display or a colleague. Photos and editing are never exposed.
- **Interop** — a clean **JSON topology export** (also available per share link at `/api/public/<token>/topology.json`) for feeding other home-lab tools, plus an optional **MCP server** (`npm run mcp`) that exposes the physical record as read-only tools for AI assistants.

### Changed

- Add/Edit Device forms include a monitoring section (enable, method, target override, port).
- The Export page now manages read-only share links and offers a topology JSON download; the Devices page has a "Discover" action.

## [0.3.0] — 2026-06-04

### Added

- **Bulk patching** — a new tool to patch a range of ports between two devices in one shot (e.g. switch ports 1–24 → patch-panel ports 1–24). Pick a port range on each side, choose cable type/VLAN/status once, see a row-by-row preview, and create them all — with per-row conflict validation (including conflicts within the same batch) and an option to skip ports already in use.
- **Power capacity & load budgeting** — give a UPS/PDU a rated capacity (watts / VA / breaker amps) and see a live load bar: connected draw vs. capacity, % load, and an overload warning. Built-in UPS/PDU templates ship with their rated capacity, so picking a model pre-fills it.
- **Health check** — a new page that audits your documentation for consistency and completeness: ports in multiple active connections, devices overlapping in the same rack U, power sources over capacity, powered devices not mapped to a UPS/PDU, active devices with no ports, and planned connections never activated.
- **Firewalla device templates** — Gold, Gold SE, Gold Plus, Gold Pro, Purple, Purple SE, and Blue Plus (351 templates total).

### Changed

- Device detail now shows a power load bar for UPS/PDU sources, and the Add/Edit Device forms include capacity fields for power gear.

## [0.2.0] — 2026-05-31

### Added

- **Change history / audit timeline** — every device, connection, and power change is logged. New **History** page with a global activity feed and filters, plus a per-device history section on the device detail page.
- **Power mapping** — model UPS/PDU outlets and which device each one feeds. Outlets carry a receptacle type (NEMA 5-15/5-20, IEC C13/C19); device detail shows an outlet map (used/total + total watts) for power sources and a "Power Source" panel for everything else. One device per outlet is enforced at the database level.
- **Full backup & restore** — one-click ZIP export of everything (all tables + uploaded photos/documents) from the Export page, and a guarded restore on the Import page. Restores are version-safe: custom-template IDs are remapped on import so they never collide with the built-in library.
- **Expanded UPS/PDU library** — built-in UPS/PDU templates now include outlet definitions, and the catalog adds rackmount **and** tower/desktop SOHO/SMB models from APC (Smart-UPS, Back-UPS), CyberPower, Eaton, Tripp Lite, and Vertiv, plus rack PDUs. Now **344 templates**.

### Fixed

- Backup restore no longer fails with a primary-key collision when a custom template's ID overlapped a built-in template's ID.

## [0.1.0] — 2026-05-31

Initial public release.

### Added

- **Core model:** devices, ports, connections, locations, and VLANs with single-user session auth.
- **Patch panel support:** front/back linked port pairs.
- **Port trace algorithm:** hop-by-hop physical path tracing through patch panels, with cycle detection.
- **Rack elevation view:** front-of-rack "U" diagram with device placement and passive occupants (UPS, shelves, blank panels).
- **Canvas view:** React Flow topology map with color-coded cable edges, draggable layout, and filtering.
- **Photos & documents:** image attachments with `sharp` thumbnails, plus PDF spec sheets and Visio stencils; free-form photo gallery.
- **325 built-in device templates** across 28 vendors (Ubiquiti, Fortinet, Palo Alto, Cisco/Meraki, TP-Link Omada, MikroTik, Netgear, Aruba, Synology, QNAP, TrueNAS, APC, CyberPower, Eaton, and more).
- **Custom templates:** create/edit/delete your own gear with manufacturer, OS/firmware, form factor, individually editable ports, photos, spec sheets, and product URLs.
- **VLAN manager, full-text search, CSV import/export, PDF port-map export.**
- **Deployment:** Docker (compose + named volume) and Linux (PM2 + Nginx/Apache) guides.

[0.4.0]: https://github.com/breed007/CableMap/releases/tag/v0.4.0
[0.3.0]: https://github.com/breed007/CableMap/releases/tag/v0.3.0
[0.2.0]: https://github.com/breed007/CableMap/releases/tag/v0.2.0
[0.1.0]: https://github.com/breed007/CableMap/releases/tag/v0.1.0
