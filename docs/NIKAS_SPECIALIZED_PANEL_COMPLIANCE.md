# ZONT specialized-panel compliance

Audit target: UI 0.9.1, NikaS UI Standard v1.8 and navigation contract v1.0. Runtime conformance is covered by static/semantic tests; final iPhone field acceptance remains required.

| Requirement | Status | Evidence / required follow-up |
|---|---|---|
| Integration-owned route and stable frontend entry | PASS | `custom_components/zont_local/__init__.py` registers `/dashboard-zont`; `const.py` selects `frontend/zont-ui.js`. |
| One zoom viewport, 75–200% focal pinch, persistence, reset/snap | PASS | UI 0.9.1 installs exactly one `.work-viewport`/`.work-canvas`, persists state and implements focal pinch, snap, two-finger reset and toast in `frontend/zont-ui.js`. |
| 100% native vertical scroll; `x=y=0`; no one-finger pan/horizontal scroll | PASS | `zontApplyZoomState()` forces origin through 100%; `.work-viewport` uses native `overflow-y:auto`, `overflow-x:hidden` and `touch-action:pan-y`. |
| Pan only above 100%, only on overflowing axes, real-edge clamp | PASS | Pan starts only for `scale > 1`; `zontZoomBounds()` locks each fitting axis to zero and clamps overflowing axes. |
| Re-clamp after resize/rerender; tab reset to top | PASS | `ResizeObserver` reapplies bounds, every render restores/clamps before paint, and `_selectTab()` resets offsets/native scroll. |
| Menu is the permanent left action and emits `hass-toggle-menu` | PASS | The production override changes `#back` to `mdi:menu` and emits a bubbling/composed event (`frontend/zont-ui.js`, `installV0812`). |
| Header UPS geometry and two matching plaques | PASS | Final UI 0.9.1 cascade sets 52/48 rails, 62/60 height, 44px bordered card plaques, radius 16, icons 25 and 23/14 title typography (21/13 narrow). |
| Refresh on the matching right plaque | PASS | `#refresh` uses the same plaque as menu and `var(--primary-color)`. |
| Fixed full-width safe-area Bottom Tab Bar using `ha-icon` | PASS | `.bottom` is fixed edge-to-edge, accounts for bottom safe area, and tabs use `ha-icon` (`frontend/zont-ui.js`). |
| Bottom target/icon/label/active geometry | PASS | Final cascade enforces 52px targets, 28px `ha-icon`, 12px/700 labels and 11% active fill. |
| Packaged integration icon | PASS | Approved local asset exists at `custom_components/zont_local/brand/icon.png` (256×256 PNG); domain/install path is `zont_local` and README documents `/config/custom_components/zont_local`. |
| README/repository visual identity | PASS / MANUAL | README displays the approved packaged icon and names the integration consistently. GitHub avatar/social preview still needs a manual repository-settings check. |
| Optional logo/light/dark variants | GAP (non-blocking) | Only `brand/icon.png` exists. Add variants only from an approved ZONT source if contrast testing proves they are needed; do not generate replacements. |
| Stable shell and poll/tab rendering | PASS | UI 0.9.1 mounts the shell once and morphs only `<main>`; Header, viewport, canvas and Bottom Tab Bar keep identity, listeners and native scroll during polling. |
| Form typography | PASS | Final cascade keeps meaningful labels/values in the 12–25px range and reserves 9px for redundant hydraulic scale annotations. |
| Existing connection/freshness indicator | PASS | The pre-existing ZONT indicator uses `Локально`/`Нет связи`/`Нет данных`, unified freshness labels, status-colored lamp/text/tint/border and 16/13px typography. It was retained rather than newly introduced. |

## Remaining field checks

1. Confirm long Diagnostics native scrolling at 100% in the iPhone Companion App.
2. Confirm focal pinch and axis locking at 125%, 150% and 200%.
3. Confirm stationary long press, `more-info`, two-finger reset and safe areas on device.
4. Confirm that polling and repeated scrolling do not flash equipment artwork, Header or Bottom Tab Bar, and that tab changes retain the shell while returning only the work area to the top.
