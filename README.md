# ha-zont

ZONT dashboard and future local integration for Home Assistant.

## Project status

**Phase 1 — Dashboard / UI**

The repository currently hosts the ZONT user interface layer for Home Assistant. The existing controller is treated as a temporary data source and is not the architectural foundation of the project.

**Phase 2 — Local integration**

After migration to a new ZONT controller, this repository will also host a native Home Assistant integration focused on local telemetry and local control where the controller/protocol permits it.

## Architecture

```text
ha-zont/
├── dashboard/              # Current ZONT Lovelace/UI assets
├── docs/                   # Architecture, controller and protocol notes
└── custom_components/
    └── zont/               # Reserved for the future HA integration
```

The intended evolution is:

`Dashboard → new controller → local protocol research → read-only integration → local control → production integration`

## Design principles

- Local-first communication for the future integration.
- Cloud access is optional and must not be the only control path where local access is available.
- Read-only telemetry is implemented before write/control operations.
- UI is separated from the transport/API layer.
- Controller-specific limitations are documented explicitly.
- No write operation is enabled until its behavior is verified on real hardware.

## Current scope

The current repository scope is the ZONT dashboard/menu for the Home Assistant NikaS project. The existing controller may provide temporary entities to the dashboard, but compatibility with that controller does not define the future integration API.

## License

MIT License. See [LICENSE](LICENSE).
