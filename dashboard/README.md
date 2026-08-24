# ZONT Dashboard

This directory contains the Home Assistant UI layer for ZONT.

## Current canonical source

The current panel definition is:

- `manifest/zont.yaml` — canonical Contract Generated UI panel manifest, currently v0.8.7.

The concrete Lovelace dashboard is intentionally generated inside Home Assistant from the public manifest plus the private verified entity inventory. Real Home Assistant bindings are therefore not duplicated in this public repository.

## Baseline reference

- `zont_dashboard.yaml` — protected static heating baseline retained as a migration/reference artifact. It contains the historical real entity IDs and must not be treated as the canonical generated ZONT panel.

## Current role

The dashboard is the active part of the project while the existing ZONT controller remains in service. Entities exposed by the current Home Assistant setup are temporary implementation details and do not define the future local-integration API.

## UI contract

The dashboard follows the project-wide Home Assistant principles:

- Status → Control → Diagnostics.
- Unknown/unavailable states are explicit and are not treated as normal.
- Long press opens more-info where applicable.
- Operational information is prioritized over engineering telemetry.
- Control elements must not imply verified local control until the future local integration provides it.
- The State view is a live semantic topology, not a static image: boilers, DHW,
  hydraulic separator, circuits and pumps are populated from the entity registry.

## Ownership boundary

`ha-zont` owns the ZONT-specific dashboard source and, later, the native local ZONT integration. `ha-contract-generated-ui` remains the shared renderer/generator platform used to build the dashboard from the manifest and verified inventory.
