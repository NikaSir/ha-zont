# Changelog

## 0.9.5

- Migrates the panel to NikaS Specialized Panel UI Standard v2.2 and Navigation Contract v1.2 using the exact vendored shell kit v2.1.
- Replaces browser-window fixed positioning with a host-bound three-row shell, canonical Header, one guarded work viewport and the 64 px Bottom Tab Bar.
- Keeps `Котёл 1`, `Котёл 2` and the DHW tank in one top equipment row on phones as well as wider screens.
- Brings the local/freshness indicator to the stable S8 OMNI two-line geometry and fail-closed state colors.
- Adds deterministic build-time concatenation, pins the shell hash and raises frontend cache busting to `b024`.
- Preserves the approved hydraulic topology, registry discovery, non-destructive refresh and guarded ZONT mode commands.

## 0.9.4

- Prefixes the Home Assistant and HACS integration name with `NikaS`.
- Republishes the approved local ZONT brand icon through a versioned HACS update.
- Keeps the approved panel title `Отопление`.
- Synchronizes the production bundle with the NikaS UI version contract.

## 0.9.3

- Renamed the user-facing panel and Home Assistant menu entry to the approved application name `Отопление`; the integration identity remains `ZONT Local & UI`.
- Locked the panel host and application grid to the client viewport so the Header and Bottom Tab Bar cannot be dragged with Home Assistant's outer page.
- Disabled native scroll anchoring inside the work viewport to prevent telemetry patches from nudging the active page.
- Made Refresh non-destructive: the last accepted telemetry remains visible while the registry is reloaded or a refresh fails, and repeated refresh requests no longer start parallel loads.
- Raised the frontend cache key to `b023` and extended regression checks for title, viewport locking and non-blanking refresh behavior.

## 0.9.2

- Requires a complete source-route/timestamp pair and rejects missing, invalid, stale and future hand-offs before the centered Header plaque captures its return route.
- Adopts NikaS Specialized Panel UI Standard v1.9, Navigation Contract v1.1, explicit unavailable-state behavior and autonomous production-entrypoint guards.
- Raises the integration/UI version to `0.9.2` and the frontend cache key to `b022` while preserving the approved ZONT application shell.

## 0.9.1

- Rebuilt ZONT as one integration-owned panel conforming to NikaS rules 1.17 while retaining the approved boilers, DHW, light hydraulic separator, heating circuits and local equipment art.
- Added one height-locked shell with fixed Header and Bottom Tab Bar, a source-aware version-only title plaque and the native Home Assistant menu action.
- Added one focal 75–200% work viewport with native 100% vertical scrolling, axis-aware enlarged panning, persisted state, 97–103% snap and two-finger double-tap reset.
- Replaced routine full-panel redraws with a one-time shell mount, lazy view caching and in-place DOM morphing for telemetry updates.
- Re-composed the phone layout to keep operational text within the 12–25 px envelope instead of shrinking live labels into unreadable one-screen typography.
- Standardized the requested connection plaque as `Локально / Нет связи / Нет данных` plus independent freshness text.
- Added source-aware return routing, hold-to-more-info on entity-backed surfaces, a packaged compliance record and automated rules 1.17 guards.
- Increased the integration/UI version to `0.9.1` and the frontend cache key to `b021`.

## 0.9.0

- Implemented the NikaS v1.5 panel shell: native vertical scrolling and fixed origin at 100%, axis-aware pan only above 100%, focal 75–200% pinch, resize clamping, snap and two-finger reset.
- Matched the UPS Header plaques and fixed Bottom Tab Bar geometry, typography, colors and iPhone safe areas.
- Preserved the approved ZONT hydraulic/domain layout and packaged brand icon; surfaced the approved icon in README.

## 0.8.18

- Moved `/dashboard-zont` registration into `zont_local`; ZONT no longer depends on another integration to create its Home Assistant panel.
- Replaced global JavaScript injection with one integration-owned `panel_custom` registration and a dedicated `zont-local-panel` custom element.
- Kept the approved UI 0.8.17 bundle and v0.8.12 system layout unchanged while eliminating the startup-order race that could expose the old actuator page or a blank panel.
- Returned publication to direct `main` updates. This repository uses no release branches, Git tags or GitHub Releases.
- Increased the frontend cache-busting build to `b019`.

## 0.8.17

- Restored the exact approved UI 0.8.12 system overview: boilers, DHW, white hydraulic separator, heating circuits and live metrics.
- Rebuilt the panel as one autonomous JavaScript bundle by embedding the generic renderer before the approved ZONT application layer.
- Removed all runtime module imports so Home Assistant cannot register only the sidebar item while leaving the panel blank.
- Rolled back the unsuccessful 0.8.15–0.8.16 zoom/loading changes; stable scaling will be reintroduced separately after the baseline is confirmed.
- Restored the original v0.8.12 equipment artwork and increased cache busting to `b018`.


## 0.8.16

- Restored the approved system-overview edition on the `Состояние` tab instead of the generic actuator page.
- Removed the fragile second URL import of the generated ZONT renderer; the application layer now waits for the panel element already registered by Home Assistant.
- Added deep discovery and immediate refresh of an already-open ZONT panel so the approved UI is applied without waiting for the next telemetry update.
- Preserved the transform-owned canvas, focal pinch, panning and saved `{scale,x,y}` state from UI 0.8.15.
- Increased the frontend cache-busting build to `b017`.

## 0.8.15

- Rebuilt the work area as exactly one transform-owned canvas using `translate3d(x,y,0) scale(s)`.
- Removed the intermediate permanent zoom dock and all native scroll/CSS zoom state from the work viewport.
- Added focal two-finger pinch, one-finger canvas pan, 75–200% bounds, 97–103% snap and a two-finger double-tap reset.
- Persisted the complete `{scale,x,y}` state per ZONT panel client and restored it before the next rendered frame.
- Added pointer-cancel and post-gesture click guards so pan/pinch cannot accidentally open entity details.
- Kept the Home Assistant menu header and full-width bottom navigation outside the transformed canvas.
- Increased the frontend cache-busting build to `b016`.

## 0.8.14

- Added panel-local pinch-to-zoom on phones and tablets, anchored to the midpoint between both touches.
- Added persistent `− / % / +` controls; tapping the percentage restores 100%.
- Kept the panel header and bottom navigation outside the scaled workspace and enabled panning while enlarged.
- Preserved the existing responsive mobile and desktop layouts before applying visual scale.
- Increased the frontend cache-busting build to `b015`.

## 0.8.13

- Removed transparent padding from the packaged boiler and DHW artwork so the equipment is larger without expanding the overview grid.
- Tightened the compact DHW schematic, reduced the circulation-pump marker and kept it physically mounted on the return loop.
- Balanced the two heating-circuit cards with an explicit direct-circuit topology row opposite the live mixer state.
- Increased the frontend cache-busting build to `b014`.

## 0.8.12

- Added transparent local WebP artwork for the boiler casing and DHW tank shell under the integration's packaged `frontend/assets` directory.
- Registered `/zont_local_panel/` as a Home Assistant static route and versioned every asset URL for deterministic cache invalidation.
- Kept water level, hydraulic lines, pumps, temperatures, pressures and state indicators as live entity-driven layers above the artwork.
- Added a panel asset manifest and CI checks that reject missing or unreferenced resources.
- Increased the frontend cache-busting build to `b013`.

## 0.8.11

- Returned the DHW circulation pump to the purple circulation line as a dedicated physical node.
- Replaced the misleading heating-coil glyphs in circuit status rows with industrial pump symbols.
- Isolated the DHW and cold-water callout text from the coloured pipes so values no longer acquire line-like dashes.
- Increased the frontend cache-busting build to `b012` so Home Assistant loads the updated module after restart.

## 0.8.10

- Rebalanced the mobile equipment row so the DHW schematic has enough width while remaining beside both boilers.
- Rebuilt the compact DHW labels as stable callouts and kept the hot, circulation and cold-water lines clear of their text.
- Increased the hydraulic-separator label, temperature and pressure typography with stronger contrast.
- Increased the frontend cache-busting build to `b011` so Home Assistant loads the updated module after restart.

## 0.8.9

- Bound the current H2000 overview to the verified Home Assistant entity IDs, while retaining semantic discovery as a controller-migration fallback.
- Counted only active non-zero controller errors; clear values such as `0`, `0.0`, `off` and `no errors` no longer trigger the warning badge.
- Made controller connectivity and data freshness independent, explicit three-state signals instead of assuming that missing telemetry is online and current.
- Removed invented static controller facts from Diagnostics and replaced them with live online, power and voltage entities.
- Corrected meter ranges for heating pressure, DHW/irrigation pressure, underfloor heating and boiler/radiator temperatures.
- Applied the same five-result mixer model throughout the panel: stationary, opening, closing, signal conflict or unavailable.
- Increased the frontend cache-busting build to `b010` so Home Assistant loads the updated module after restart.

## 0.8.8

- Replaced the incorrect mixer-valve position message with the real three-state movement model: opening, closing or stationary.
- Reported unavailable actuator signals as missing data instead of a normal stationary state.
- Added an explicit conflict warning for the impossible case where opening and closing are active simultaneously.

## 0.8.7

- Increased wide-screen equipment labels and live values by roughly 20–30 percent without changing the approved hydraulic topology.
- Enlarged DHW, hydroseparator, circuit, legend and metric typography for comfortable desktop and wall-panel viewing.
- Kept the compact mobile typography and one-screen phone layout unchanged.

## 0.8.6

- Restyled the hydraulic separator with the same light body treatment as the boiler casings, including a subtle grey outline and shadow.
- Used the remaining vertical room to enlarge the boiler bodies and DHW tank without breaking the three-card equipment row.
- Increased the hydraulic-separator height and readings slightly while retaining the complete mobile system overview.

## 0.8.5

- Increased mobile typography, status marks and equipment graphics while preserving the three-card top row.
- Enlarged the connected DHW schematic and shortened the circulation-pump status to avoid truncation.
- Increased hydroseparator readings, circuit controls and temperatures for comfortable phone viewing.
- Changed the four key metrics from a tiny single row to a readable 2-by-2 grid while retaining the complete system overview within one mobile viewport.

## 0.8.4

- Returned the DHW boiler to the common equipment row with both heating boilers on mobile.
- Rebuilt the state page as a compact one-screen hydraulic overview: equipment, hydroseparator, circuits, legend and four key metrics.
- Preserved the approved connected DHW topology in a scaled mobile schematic.
- Used the circuit state as a truthful fallback when no dedicated pump entity exists, instead of reporting a false data-loss alarm.
- Made mixer status wrap without truncation, fixed the legend to a stable 3-by-2 grid and linked the warning badge to Diagnostics.

## 0.8.3

- Reduced the hydraulic separator to a neutral connective element.
- Added compact hydraulic-separator temperature and system-pressure readings on the right.
- Restored the connected DHW topology: hot-water outlet and faucet, recirculation loop and pump, cold-water inlet and pressure gauge.
- Reflowed the mobile equipment area to two boiler cards plus a full-width DHW card.
- Separated online availability from warnings and clarified active, off and unavailable states.
- Distinguished circuit enable state from the current pump state where both entities are available.
- Compacted the header, bottom navigation, node cards and mobile metric/mode grids.

## 0.8.2

- Rebuilt the State view around the approved live hydraulic topology.
- Added separate main and reserve boiler cards.
- Added the DHW tank with hot-water outlet, recirculation return and cold-water pressure.
- Added the hydraulic separator and explicit supply/return connections.
- Added radiator and underfloor-heating circuit cards with pump and mixer state.
- Preserved safe ZONT mode buttons; pumps and mixer remain monitoring-only.
- Kept missing, unknown and unavailable telemetry explicit.
- Added frontend syntax and release-version checks to CI.
