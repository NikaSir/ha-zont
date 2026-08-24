# Architecture

## Objective

`ha-zont` is the single repository for the ZONT Home Assistant project: the current dashboard and the future local integration.

## Phase 1 — Dashboard

The existing controller remains a temporary source of Home Assistant entities. The dashboard is developed independently from the transport implementation so that replacing the controller does not require redesigning the UI from scratch.

## Phase 2 — Controller research

When the new ZONT controller is installed:

1. Inventory all locally reachable services and interfaces.
2. Identify the supported local protocol/API and authentication mechanism.
3. Capture read-only telemetry first.
4. Define stable Home Assistant entity semantics.
5. Verify write operations individually on real hardware.
6. Add local control only after safe behavior is confirmed.

## Phase 3 — Home Assistant integration

The future integration lives in `custom_components/zont/`.

Expected layers:

- transport/client;
- coordinator/data model;
- config flow;
- device and entity mapping;
- sensor/binary_sensor/climate/switch/select/number entities as justified by the verified protocol;
- diagnostics;
- services only where entity platforms are insufficient.

## Safety rules

Heating control is a safety-relevant function. The integration must not invent state, silently substitute unavailable telemetry, or issue unverified commands. Loss of communication must remain distinguishable from a normal controller state.
