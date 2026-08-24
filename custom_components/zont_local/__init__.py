"""ZONT Local & UI integration."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ZONT Local & UI from a config entry."""
    from homeassistant.components.frontend import add_extra_js_url
    from homeassistant.components.http import StaticPathConfig

    from .const import (
        DOMAIN,
        FRONTEND_DIRECTORY,
        FRONTEND_FILENAME,
        FRONTEND_MODULE_URL,
        FRONTEND_STATIC_PATH,
        FRONTEND_STATIC_REGISTERED,
    )

    domain_data = hass.data.setdefault(DOMAIN, {})
    if not domain_data.get(FRONTEND_STATIC_REGISTERED):
        frontend_root = Path(__file__).parent / FRONTEND_DIRECTORY
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    FRONTEND_STATIC_PATH,
                    str(frontend_root / FRONTEND_FILENAME),
                    False,
                )
            ]
        )
        domain_data[FRONTEND_STATIC_REGISTERED] = True

    add_extra_js_url(hass, FRONTEND_MODULE_URL)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload ZONT Local & UI."""
    from homeassistant.components.frontend import remove_extra_js_url

    from .const import FRONTEND_MODULE_URL

    try:
        remove_extra_js_url(hass, FRONTEND_MODULE_URL)
    except KeyError:
        pass
    return True
