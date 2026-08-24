# ZONT Dashboard

This directory contains the Home Assistant UI layer for ZONT.

## Current role

The dashboard is the active part of the project while the existing ZONT controller remains in service. It may use entities exposed by the current Home Assistant setup, but those entities are considered temporary implementation details.

## UI contract

The dashboard should follow the project-wide Home Assistant layout principles:

- Status → Control → Diagnostics.
- Unknown/unavailable states are shown explicitly and are not treated as normal.
- Long press opens more-info where applicable.
- Operational information is prioritized over engineering telemetry.
- Control elements must not imply local control until a verified local integration exists.

Future dashboard files and generated Lovelace assets should be stored below this directory.
