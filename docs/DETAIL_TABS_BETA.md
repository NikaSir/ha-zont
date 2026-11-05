# 0.11.0-beta001: approved detail tabs

User-approved card renders from 6 November 2026 define the content hierarchy. The existing NikaS shell remains authoritative for Header, navigation, scrolling and gestures. The user explicitly requested a beta; full X.Y.Z-betaNNN version strings are used consistently, including the Header and cache key. The local guard now accepts this form; pinned central documents are not rewritten.

Zones use the eight previously approved entities and explicit short labels. Active, incomplete and unavailable groups remain separate; nonzero target deviation is displayed without claiming an alarm threshold. Resting complete zones can be expanded.

Equipment uses unique quantity candidates within main/reserve scopes. The reserve never borrows main-boiler measurements. Ambiguity produces missing data. Readiness, permission and measured heating retain the existing DHW semantics.

History uses GET Recorder only, a per-period/source key and request generation counter. Late responses cannot replace a newer period or refresh. Unknown/unavailable temperature samples break chart paths. Missing response series display no data. Circuit lanes depict binary-signal intervals, not burner cycles; no cycle count is invented. Sparse Recorder series alone do not prove sampling continuity.

Service separates HA receipt timestamps, source availability and confirmed controller transport. Technical IDs are confined to expandable source details; no native command dialog or equipment service calls are added.

Unit tests cover missing/zero values, source isolation, ambiguity, history gaps and async request races. Browser tests cover all five tabs, 320/390/430/768px widths, overflow, expanded-details retention, metric/period switching and persistent shell. Live iPhone/hardware acceptance is a separate step after installation.
