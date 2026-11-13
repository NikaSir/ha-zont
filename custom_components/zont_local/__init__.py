"""ZONT Local & UI integration."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ZONT Local & UI from a config entry."""
    from homeassistant.components import frontend, panel_custom
    from homeassistant.components.http import StaticPathConfig

    from .const import (
        DOMAIN,
        FRONTEND_DIRECTORY,
        FRONTEND_FILENAME,
        FRONTEND_MODULE_URL,
        FRONTEND_PUBLIC_STATIC_PATH,
        FRONTEND_STATIC_PATH,
        FRONTEND_STATIC_REGISTERED,
        PANEL_ICON,
        PANEL_REGISTERED,
        PANEL_TITLE,
        PANEL_URL_PATH,
        PANEL_WEB_COMPONENT_NAME,
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
                ),
                StaticPathConfig(
                    FRONTEND_PUBLIC_STATIC_PATH,
                    str(frontend_root),
                    True,
                ),
            ]
        )
        domain_data[FRONTEND_STATIC_REGISTERED] = True

    # ZONT owns its route and frontend module. Removing a pre-existing panel is
    # deliberate: it also replaces the retired previous owner on
    # the first restart after migration.
    if frontend.async_panel_exists(hass, PANEL_URL_PATH):
        frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)

    await panel_custom.async_register_panel(
        hass=hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_WEB_COMPONENT_NAME,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=FRONTEND_MODULE_URL,
        embed_iframe=False,
        require_admin=False,
        handle_safe_area=True,
        config={
            "id": "zont",
            "title": PANEL_TITLE,
            "subtitle": "Отопление и ГВС",
            "parent": {
                "id": "home",
                "title": "Отопление и ГВС",
                "path": "/home/overview",
            },
            "source": {
                "kind": "entity_registry",
                "platforms": ["zont", "zont_ha"],
                "include_disabled": False,
                "transport": {
                    "kind": "unknown",
                    "confirmed": False,
                    "evidence": "upstream_entities_do_not_expose_transport",
                },
            },
            # Temperature thresholds verified against enabled HA automations.
            "heating_outlets": [
                {"entity_id": "switch.socket_wf4", "label": "Тамбур · WF4", "on_below": 8, "off_above": 10},
                {"entity_id": "switch.socket_wf2", "label": "Веранда · WF2", "on_below": 8, "off_above": 10},
                {"entity_id": "switch.socket_wf3", "label": "Веранда · WF3", "on_below": 8, "off_above": 10},
            ],
            "zone_sensors": [
                {"entity_id": "sensor.sensor_th_zb_13_temperature", "label": "Тамбур"},
            ],
            "zone_entities": [
                "climate.thermostat_zb_sn_02",
                "climate.thermostat_zb_sn_03",
                "climate.thermostat_zb_08",
                "climate.thermostat_zb_11_1",
                "climate.thermostat_zb_11_2",
                "climate.thermostat_zb_15_1",
                "climate.thermostat_zb_15_2",
                "climate.thermostat_zb_15_3",
            ],
            "zone_room_sources": {
                "climate.thermostat_zb_sn_02": {
                    "temperature": "sensor.sensor_th_zb_02_temperature",
                    "selector": "select.thermostat_zb_sn_02_temperature_sensor_select",
                },
                "climate.thermostat_zb_sn_03": {
                    "temperature": "sensor.sensor_th_zb_03_temperature",
                    "selector": "select.thermostat_zb_sn_03_temperature_sensor_select",
                },
            },
            "zone_labels": {
                "climate.thermostat_zb_sn_02": "Спальня",
                "climate.thermostat_zb_sn_03": "Гардероб",
                "climate.thermostat_zb_08": "Холл",
                "climate.thermostat_zb_11_1": "Гостиная · радиатор 1",
                "climate.thermostat_zb_11_2": "Гостиная · радиатор 2",
                "climate.thermostat_zb_15_1": "Гараж · радиатор 1",
                "climate.thermostat_zb_15_2": "Гараж · радиатор 2",
                "climate.thermostat_zb_15_3": "Гараж · радиатор 3",
            },
            "tabs": [
                {"id": "overview", "label": "Обзор", "icon": "mdi:home-outline"},
                {"id": "zones", "label": "Зоны", "icon": "mdi:home-thermometer-outline"},
                {"id": "equipment", "label": "Оборуд.", "icon": "mdi:water-boiler"},
                {
                    "id": "history",
                    "label": "История",
                    "icon": "mdi:chart-line",
                },
                {
                    "id": "service",
                    "label": "Сервис",
                    "icon": "mdi:tools",
                },
            ],
        },
    )
    domain_data[PANEL_REGISTERED] = True
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload ZONT Local & UI."""
    from homeassistant.components import frontend

    from .const import DOMAIN, PANEL_REGISTERED, PANEL_URL_PATH

    domain_data = hass.data.get(DOMAIN, {})
    if domain_data.pop(PANEL_REGISTERED, False) and frontend.async_panel_exists(
        hass, PANEL_URL_PATH
    ):
        frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
    return True
