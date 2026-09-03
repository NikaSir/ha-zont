# NikaS specialized-panel compliance — ZONT

**Audit date:** 2026-09-03

**Standard:** NikaS Specialized Panel UI Standard v2.2 + NikaS Panel Navigation and Return Contract v1.2

**Canonical snapshots:** UI `3b6cc750…`; navigation `d495eca8…`; shell kit `c7171560…`

**Audited production path:** `custom_components/zont_local/__init__.py` → autonomous `zont-ui.js` → `zont-local-panel`

**Release candidate:** UI/integration 0.9.5-b024

| Area | Result | Evidence |
|---|---|---|
| Home Assistant host boundary | PASS (code) | The shell uses `inline-size`/`block-size: 100%` inside the `ha-panel` host; fixed positioning and viewport units are absent. |
| Canonical shell rows | PASS (code) | Header, work viewport and Bottom Tab Bar occupy the exact 60 px / flexible / 64 px rows with safe-area additions owned once by the shell. |
| Canonical content frame | PASS (code) | The work canvas is centred at max 1280 px and uses the required 12/16/24 px responsive gutters. |
| Native HA menu | PASS (code) | The permanent left `mdi:menu` button dispatches bubbling/composed `hass-toggle-menu`. |
| Header return | PASS (code) | The center semantic button captures once, consumes a complete hand-off pair within 30 seconds, recognizes House v13, Rooms v11, Actions and Infrastructure, and never uses browser-history back. |
| One work/zoom viewport | PASS (code) | `#zont-work` is the only scrolling/gesture viewport and `#zont-stage` is the only transformed work canvas. |
| iOS scroll boundary | PASS (code) | The canonical capture-phase, non-passive host guard passes multi-touch zoom through and is removed on disconnect. |
| Bottom Tab Bar | PASS (code) | Five equal tabs use 26 px MDI glyphs, 12/14 px labels and the canonical active treatment. |
| Scale and gesture safety | PASS (code) | The retained 75–200% focal pinch, bounded pan, 97–103% snap, two-finger reset, hold cancellation and click suppression operate inside the canonical viewport. |
| Stable runtime | PASS (code) | The shell mounts once, visited tab views are cached and live telemetry morphs the active view without replacing the shell. |
| Connection plaque | PASS (code) | The stable two-line plaque independently exposes transport (`Локально / Нет связи / Нет данных`) and freshness (`Данные актуальны / Данные устарели / Нет данных`) with fail-closed colours. |
| Top equipment row | PASS (code) | `Котёл 1`, `Котёл 2` and `Бойлер ГВС` retain that exact order in one three-column row at every supported width; DHW cannot span or wrap below the boilers. |
| Domain UI preservation | PASS (code) | Boilers, DHW, hydraulic separator, circuits, modes and packaged equipment artwork remain live layered UI. |
| Data truth | PASS (code) | Entity and device facts come from the ZONT integration and Home Assistant registries; unavailable, unknown, stale and active-error states remain explicit. |
| Command safety | PASS (code) | Only discovered ZONT mode buttons are actionable, require confirmation, reject duplicate sends and expose service-call errors without optimistic success. |
| Version coherence | PASS (code) | Visible UI, runtime/cache key, panel manifest, dashboard metadata and integration metadata agree on 0.9.5-b024. |
| Deterministic delivery | PASS (code) | The generated production bundle is autonomous, import-free and reproducible from the declared local sources, including the hash-pinned shell kit. |

## Device verification still required

Validate 430×932, 932×430, 768×1024, 1024×768 and 1440×900 in Home Assistant. On the target iPhone/Companion App also verify that the three equipment cards stay in one top row, the artwork does not drift within its cards, no empty spacer appears around the work view, Header/Bottom Tab Bar stay fixed to the panel boundary, and all five tabs, gestures, more-info holds, refresh states and source-aware Header return remain operational.
