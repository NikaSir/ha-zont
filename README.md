# ha-zont

ZONT Local & UI for Home Assistant.

## Project status

**Phase 1 — HACS-managed ZONT UI**

The repository now ships a Home Assistant custom integration with domain `zont_local`. HACS installs it to:

```text
/config/custom_components/zont_local
```

The integration itself registers `/dashboard-zont`, serves its frontend package and owns the complete panel lifecycle. Updates are delivered through HACS from the latest `main` commit and require a Home Assistant restart when requested.

The current controller remains a temporary data source and is not the protocol baseline for future local control.

**Phase 2 — Local controller integration**

After migration to a new ZONT controller, the same `zont_local` integration will gain local discovery, telemetry, diagnostics and verified local control. Existing `zont` / `zont_ha` domains are intentionally not reused, avoiding conflicts during migration.

## HACS installation

Add this repository to HACS as a **Custom repository** with category **Integration**:

```text
https://github.com/NikaSir/ha-zont
```

Then download **ZONT Local & UI**, restart Home Assistant and add the integration once from **Settings → Devices & services → Add integration**. The first configuration entry only enables the HACS-managed UI host; controller settings will be introduced later when the local protocol is implemented.

## Architecture

```text
ha-zont/
├── custom_components/
│   └── zont_local/
│       ├── __init__.py
│       ├── config_flow.py
│       ├── const.py
│       ├── manifest.json
│       ├── strings.json
│       ├── translations/
│       └── frontend/
│           └── zont-ui.js
├── dashboard/              # Local panel manifest and protected baseline
├── docs/                   # Architecture, controller and protocol notes
├── hacs.json
└── LICENSE
```

Current runtime path:

`zont_local panel registration → local ZONT bundle/assets → Home Assistant entities`

`ha-zont` has no runtime, installation or publication dependency on another repository.

The intended evolution is:

`HACS-managed UI → new controller → local protocol research → read-only integration → local control → production integration`

## Design principles

- Local-first communication for the future controller integration.
- No collision with existing `zont` or `zont_ha` integrations during migration.
- Read-only telemetry is implemented before write/control operations.
- UI is separated from the transport/API layer.
- Controller-specific limitations are documented explicitly.
- No write operation is enabled until its behavior is verified on real hardware.
- The repository is the canonical owner of ZONT-specific UI and future local integration code.

## Publication

Updates are committed directly to `main` and validated there. The project does not use release branches, Git tags or GitHub Releases; HACS installs the current integration version from this repository.

## Current UI

Current integration: **0.8.18**. Frontend: **ZONT UI v0.8.17** (approved v0.8.12 layout, standalone bundle).

The State view now follows the real hydraulic topology: main and reserve
boilers, the DHW tank with cold-water pressure and recirculation, hydraulic
separator, radiator and underfloor-heating circuits, pumps, mixer, summary
metrics and heating modes. Verified H2000 entity IDs are preferred for the
current controller, with semantic discovery retained as a migration fallback.
Only active non-zero controller errors raise the warning badge; communication
and data freshness are reported independently. Missing, stale and unavailable
sources stay explicit. The upper-left
button opens the native Home Assistant menu via `hass-toggle-menu`.

Equipment casing artwork is stored locally under
`custom_components/zont_local/frontend/assets/` and served by Home Assistant
from `/zont_local_panel/`. The boiler and DHW casing images are presentation
layers only; water level, hydraulic lines, pumps, states, temperatures and
pressures remain live UI elements backed by Home Assistant entities. Versioned
asset URLs provide deterministic browser cache invalidation.

## License

MIT License. See [LICENSE](LICENSE).
