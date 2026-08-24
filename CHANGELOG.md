# Changelog

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
