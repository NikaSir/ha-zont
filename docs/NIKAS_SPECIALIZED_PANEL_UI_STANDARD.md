# NikaS Specialized Panel UI Standard v1.2

**Status:** REQUIRED  
**Canonical source:** `NikaSir/ha-contract-generated-ui`  
**Canonical standards:** Shell v1.2 · Zoom v1.2 · Integration UI v1.3 · Frontend Delivery v1.0

This repository owns domain UI and integration behavior. The canonical NikaS standard owns shell behavior. Do not refactor domain UI during shell-only migration.

## Shell

- Safe-area inset has exactly one effective owner; do not add the same inset twice.
- Permanent left Header control is always the Home Assistant main-system menu (`☰`), never Back and never an integration-specific drawer.
- Title is geometrically centered; one global action may occupy the right rail.
- Header and Bottom Tab Bar remain at native scale.
- Primary 3–5 sections use one fixed, full-width, edge-attached, safe-area-aware Bottom Tab Bar.
- A persistent peer-device selector, when applicable, stays native-scale, fixed-order and selected-device-only.

## Zoom

- Two-finger focal-point pinch is mandatory on touch clients.
- Enlarged content pans/scrolls to all regions.
- Default range is 75–200%, default 100%.
- Exactly one zoomable work viewport may exist per panel instance.
- Shell reconciliation is idempotent across Home Assistant rerenders: no nested wrappers, duplicate controls or progressive shrinking.
- On-screen `− / percentage / +` controls are optional shell presentation. When enabled they exist exactly once outside the scaled viewport, use 10% steps and percentage tap resets to 100%.
- Gesture-only mobile zoom is conforming when declared and field-accepted.
- Persistence is per panel/client; multi-peer panels may persist per panel/peer/client.
- Responsive composition is selected before zoom.

## State and visuals

- Normal measurements are visually neutral; semantic colors are reserved for confirmed health/warning/fault state.
- `unknown`, `unavailable`, stale or untrusted source never appear healthy.
- Frontend consumes validated backend semantic states instead of duplicating thresholds when the backend already exposes them.
- Do not invent unsupported values.
- Panel-critical artwork is local; no CDN/Base64 dependency when normal assets are suitable.
- Decorative background art contains no live HA values; device art, SVG paths, labels and measurements remain separate runtime layers.

## Frontend delivery

- One stable production frontend entry module.
- Historical/versioned source modules may remain build-time history but are not a runtime import chain.
- Use release/build cache busting.
- Panel registration and machine-readable manifest agree on route, UI version, entry module and assets.
- Declared assets exist in the shipped package.
- CI validates JavaScript and deterministic bundle parity when applicable, plus HACS/Hassfest/repository checks.

## Field acceptance

Acceptance starts in Home Assistant Companion App on iPhone Pro Max portrait. Verify safe-area ownership, HA menu, Header geometry, selector fit, first useful operating state, Bottom Tab clearance, pinch/pan/persistence, no shell duplication after repeated HA updates, explicit unreliable states, and expected more-info/global-action behavior.

> Canonical policy remains in `ha-contract-generated-ui`; newer canonical standards override this synchronized snapshot.
