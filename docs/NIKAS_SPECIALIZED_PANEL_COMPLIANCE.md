# ZONT compliance with NikaS rules 1.17

**Runtime:** `zont_local` 0.9.2 / ZONT UI 0.9.2 (`b022`)

**Authority:** `NIKAS_SPECIALIZED_PANEL_UI_STANDARD.md` v1.9 and `NIKAS_PANEL_NAVIGATION_CONTRACT.md` v1.1

**Primary viewport:** iPhone Pro Max portrait

## Ownership and delivery

- PASS — `ha-zont` alone registers `/dashboard-zont`, serves the frontend bundle and owns its local assets.
- PASS — the panel uses the unique custom element `zont-local-panel`; there is no runtime import or dependency on Contract Generated UI.
- PASS — updates use traceable commits and pull requests without GitHub Releases or automatic release tags.
- PASS — deterministic frontend cache key `b022` and asset version `0.9.2` are packaged with the integration.

## Fixed shell and navigation

- PASS — Header, exactly one work viewport and the Bottom Tab Bar are stable siblings in a height-locked shell.
- PASS — the left 44 px plaque dispatches `hass-toggle-menu`; the right matching plaque refreshes the registry.
- PASS — the centered semantic title plaque shows `ZONT` and the version-only line `UI v0.9.2`.
- PASS — source-aware return normalizes only the three canonical v11 base entries, requires the route/timestamp pair, rejects invalid, stale and future timestamps, then navigates explicitly with `pushState` plus `location-changed`.
- PASS — the five equal Bottom Tab destinations use `ha-icon`, 28 px glyphs, 12 px labels and stay above the iOS Home Indicator.

## Work viewport and zoom

- PASS — 100% normalizes translation to origin, disables transform pan, blocks horizontal scroll and keeps native vertical scrolling.
- PASS — pinch is focal, limited to 75–200%, and snaps 97–103% to 100%.
- PASS — one-finger transform pan is enabled only above 100% and independently clamped on both axes.
- PASS — two-finger double tap resets zoom, translation and native scroll and displays `Масштаб 100%`.
- PASS — scale and position persist locally; tab changes return to the view start and re-clamp bounds.
- PASS — no permanent zoom buttons and no nested zoom viewports exist.

## Rendering, semantics and visual contract

- PASS — the shell mounts once; visited tab views are cached; telemetry morphs the active view instead of replacing `shadowRoot`.
- PASS — the approved boilers, DHW, light hydraulic separator, circuit topology and packaged equipment art are retained as live layered UI.
- PASS — meaningful mobile text is recomposed to the 12–25 px envelope; the layout scrolls instead of shrinking operational labels.
- PASS — the requested ZONT connection plaque uses `Локально / Нет связи / Нет данных` independently from `Данные актуальны / Данные устарели / Нет данных`.
- PASS — all entity/device facts come from Home Assistant registries and live states; installation-specific entity IDs and static controller samples are absent.
- PASS — missing, unavailable, stale and active-error states remain explicit; only discovered ZONT mode buttons are actionable, require confirmation, block duplicates and expose command errors without optimistic success.
- PASS — entity-backed surfaces use stationary hold-to-more-info and gesture movement cancels the hold.
- PASS — packaged `brand/icon.png` exists and is checked by the UI guard.

## Acceptance remaining on hardware

- GAP — final iPhone Companion App visual and gesture acceptance requires installation on the user's Home Assistant instance.
- GAP — ten consecutive real-device tab switches and live loss/recovery must be confirmed after HACS update and cold restart.
