# Changelog

All notable changes to CableMap are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

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

[0.1.0]: https://github.com/breed007/CableMap/releases/tag/v0.1.0
