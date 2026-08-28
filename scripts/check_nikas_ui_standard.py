"""Static release guard for the ZONT implementation of NikaS rules 1.17."""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "custom_components/zont_local/frontend/zont-ui.js"
BRAND = ROOT / "custom_components/zont_local/brand/icon.png"
COMPLIANCE = ROOT / "docs/NIKAS_SPECIALIZED_PANEL_COMPLIANCE.md"


def require(source: str, token: str, message: str) -> None:
    if token not in source:
        raise AssertionError(message)


def main() -> None:
    source = FRONTEND.read_text(encoding="utf-8")
    require(source, 'className = "work-viewport native-scroll"', "one work viewport is required")
    if source.count('className = "work-viewport native-scroll"') != 1:
        raise AssertionError("exactly one work viewport constructor is allowed")
    require(source, 'new Event("hass-toggle-menu"', "native HA menu action is required")
    require(source, 'icon", "mdi:menu"', "menu rail must use mdi:menu")
    require(source, 'className = "heading title-plaque"', "source-aware title plaque is required")
    require(source, '<span>UI v${UI_VERSION}</span>', "Header version line must be version-only")
    require(source, 'nikas.specialized.source_route.v1', "shared source hand-off is required")
    require(source, 'state.scale > 1', "transform pan must be gated above 100 percent")
    require(source, 'touch-action:pan-y', "native 100 percent scrolling is required")
    require(source, 'Масштаб 100%', "two-finger reset confirmation is required")
    require(source, '.tab ha-icon{--mdc-icon-size:28px', "Bottom Tab icons must be 28px")
    require(source, '.tab span{font-size:12px', "Bottom Tab labels must be 12px")
    require(source, 'morph(view, fresh)', "state-only DOM patching is required")
    require(source, 'new CustomEvent("hass-more-info"', "stationary hold-to-more-info is required")
    for prohibited in ('history.back(', 'data-zoom', 'scale-controls', 'add_extra_js_url'):
        if prohibited in source:
            raise AssertionError(f"prohibited frontend pattern: {prohibited}")
    if not BRAND.exists() or BRAND.stat().st_size == 0:
        raise AssertionError("packaged brand/icon.png is required")
    if not COMPLIANCE.exists():
        raise AssertionError("rules 1.17 compliance record is required")
    print("NikaS rules 1.17 static guard passed")


if __name__ == "__main__":
    main()
