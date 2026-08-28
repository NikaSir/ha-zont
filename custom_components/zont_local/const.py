"""Constants for ZONT Local & UI."""

DOMAIN = "zont_local"
NAME = "ZONT Local & UI"
VERSION = "0.9.2"

FRONTEND_DIRECTORY = "frontend"
FRONTEND_FILENAME = "zont-ui.js"
FRONTEND_STATIC_PATH = f"/{DOMAIN}/frontend/{FRONTEND_FILENAME}"
FRONTEND_BUILD = "b022"
FRONTEND_MODULE_URL = f"{FRONTEND_STATIC_PATH}?build={FRONTEND_BUILD}"
FRONTEND_PUBLIC_STATIC_PATH = "/zont_local_panel"
FRONTEND_STATIC_REGISTERED = "frontend_static_registered"

PANEL_URL_PATH = "dashboard-zont"
PANEL_WEB_COMPONENT_NAME = "zont-local-panel"
PANEL_TITLE = "ZONT"
PANEL_ICON = "mdi:pump"
PANEL_REGISTERED = "panel_registered"
