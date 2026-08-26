# ZONT specialized-panel compliance

Audit target: `main` at the parent commit of this document. Runtime was inspected but intentionally not changed.

| Requirement | Status | Evidence / required follow-up |
|---|---|---|
| Integration-owned route and stable frontend entry | PASS | `custom_components/zont_local/__init__.py` registers `/dashboard-zont`; `const.py` selects `frontend/zont-ui.js`. |
| One zoom viewport, 75–200% focal pinch, persistence, reset/snap | GAP | `frontend/zont-ui.js` has no zoom viewport or pinch/transform engine. Add one idempotent work viewport without wrapping Header or `.bottom`. |
| 100% native vertical scroll; `x=y=0`; no one-finger pan/horizontal scroll | GAP | There is no explicit scale-state contract or viewport overflow guard in `frontend/zont-ui.js`. Current page scrolling is incidental, not the required mode switch. |
| Pan only above 100%, only on overflowing axes, real-edge clamp | GAP | No axis-aware bounds/pan implementation exists in `frontend/zont-ui.js`. |
| Re-clamp after resize/rerender; tab reset to top | GAP | `_selectTab()` changes hash and queues render but does not reset native scroll or validate canvas bounds (`frontend/zont-ui.js:67`). |
| Menu is the permanent left action and emits `hass-toggle-menu` | PASS | The production override changes `#back` to `mdi:menu` and emits a bubbling/composed event (`frontend/zont-ui.js`, `installV0812`). |
| Header UPS geometry and two matching plaques | GAP | Final cascade uses 50/46px rails, 72/68px Header, 44/42px buttons, radius 14, icons 27, mobile title 20/subtitle 11; button border is absent. Required: 52 (48 narrow), 62/60, 44, radius 16, icons 25, 21/12 and matching bordered card plaques. File: `frontend/zont-ui.js`. |
| Refresh on the matching right plaque | PARTIAL | `#refresh` exists and is primary-colored; final CSS gives it a card background/shadow, but geometry, border, radius and icon size differ from standard. |
| Fixed full-width safe-area Bottom Tab Bar using `ha-icon` | PASS | `.bottom` is fixed edge-to-edge, accounts for bottom safe area, and tabs use `ha-icon` (`frontend/zont-ui.js`). |
| Bottom target/icon/label/active geometry | GAP | Final phone cascade is 50px target, 21px icon, 8.8px/600 label and 10% active fill. Required: ≥52px, 28px, 12px/700 and ~11%. File: `frontend/zont-ui.js`. |
| Packaged integration icon | PASS | Approved local asset exists at `custom_components/zont_local/brand/icon.png` (256×256 PNG); domain/install path is `zont_local` and README documents `/config/custom_components/zont_local`. |
| README/repository visual identity | GAP | README names the integration consistently but does not display the packaged icon. Add the approved asset to the README. GitHub avatar/social preview is not represented in the checkout and needs a manual repository-settings check. |
| Optional logo/light/dark variants | GAP (non-blocking) | Only `brand/icon.png` exists. Add variants only from an approved ZONT source if contrast testing proves they are needed; do not generate replacements. |

## Runtime conflicts requiring a later implementation PR

1. The panel has no compliant zoom engine; implementing it must preserve the current domain layout and actions.
2. Header contains multiple historical CSS overrides whose final cascade contradicts UPS geometry.
3. Bottom navigation is structurally correct but deliberately shrunk below the new icon and label standard.
4. Tab switching does not explicitly restore the native work scroll to the top.

These gaps are documentation findings, not claims of runtime conformance.
