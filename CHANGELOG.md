# Changelog

All notable changes to CableMap are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

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

[0.2.0]: https://github.com/breed007/CableMap/releases/tag/v0.2.0
[0.1.0]: https://github.com/breed007/CableMap/releases/tag/v0.1.0
