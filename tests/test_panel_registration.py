"""Standalone regression check for ZONT panel ownership."""

from __future__ import annotations

import asyncio
import sys
import types
from pathlib import Path


def main() -> None:
    """Exercise setup and unload without importing Home Assistant."""
    sys.path.insert(0, str(Path(__file__).parents[1] / "custom_components"))

    homeassistant = types.ModuleType("homeassistant")
    components = types.ModuleType("homeassistant.components")
    frontend = types.ModuleType("homeassistant.components.frontend")
    panel_custom = types.ModuleType("homeassistant.components.panel_custom")
    http = types.ModuleType("homeassistant.components.http")

    panels = {"dashboard-zont"}
    removed: list[str] = []
    registered: list[dict] = []

    frontend.async_panel_exists = lambda _hass, path: path in panels

    def remove_panel(_hass, path: str, warn_if_unknown: bool = False) -> None:
        del warn_if_unknown
        removed.append(path)
        panels.discard(path)

    async def register_panel(**kwargs) -> None:
        registered.append(kwargs)
        panels.add(kwargs["frontend_url_path"])

    frontend.async_remove_panel = remove_panel
    panel_custom.async_register_panel = register_panel

    class StaticPathConfig:
        def __init__(self, *args) -> None:
            self.args = args

    http.StaticPathConfig = StaticPathConfig
    components.frontend = frontend
    components.panel_custom = panel_custom
    homeassistant.components = components
    sys.modules.update(
        {
            "homeassistant": homeassistant,
            "homeassistant.components": components,
            "homeassistant.components.frontend": frontend,
            "homeassistant.components.panel_custom": panel_custom,
            "homeassistant.components.http": http,
        }
    )

    import zont_local

    class Http:
        async def async_register_static_paths(self, paths) -> None:
            self.paths = paths

    class Hass:
        def __init__(self) -> None:
            self.data: dict = {}
            self.http = Http()

    hass = Hass()
    asyncio.run(zont_local.async_setup_entry(hass, object()))
    panel = registered[0]
    assert removed == ["dashboard-zont"]
    assert panel["frontend_url_path"] == "dashboard-zont"
    assert panel["webcomponent_name"] == "zont-local-panel"
    assert panel["module_url"].endswith("?v=0.9.4&build=b023")
    assert panel["sidebar_title"] == "Отопление"
    assert panel["config"]["title"] == "Отопление"
    assert len(panel["config"]["tabs"]) == 5

    asyncio.run(zont_local.async_unload_entry(hass, object()))
    assert removed == ["dashboard-zont", "dashboard-zont"]
    print("ZONT panel registration lifecycle passed")


if __name__ == "__main__":
    main()
