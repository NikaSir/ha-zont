const assert = require("node:assert");
const fs = require("node:fs");
const vm = require("node:vm");

const fullSource = fs.readFileSync("custom_components/zont_local/frontend/zont-ui.js", "utf8");
assert.match(fullSource, /Standalone semantic ZONT panel/, "standalone bundle must embed the generic renderer");
assert.match(fullSource, /const ELEMENT_NAME = "zont-local-panel"/, "ZONT must use its integration-owned custom element");
assert.doesNotMatch(fullSource, /nikas-generated-zont/, "ZONT must not reuse the retired shared custom element");
assert.doesNotMatch(fullSource, /^import\s+/m, "standalone bundle must not use runtime imports");
assert.doesNotMatch(fullSource, /["'](?:sensor|binary_sensor)\.nikas_h2000_pro_/, "frontend must not bind installation-specific entity IDs");
assert.doesNotMatch(fullSource, /const CONTROLLER_FACTS/, "controller facts must come from the HA device registry");
const appMarker = "// ZONT UI v0.9.4";
const appOffset = fullSource.indexOf(appMarker);
assert.ok(appOffset >= 0, "standalone bundle must contain the approved ZONT application layer");
let source = fullSource.slice(appOffset);

class FakeElement {}

FakeElement.prototype._render = function render() {};
FakeElement.prototype._role = function role(item) { return item.role || "other"; };
FakeElement.prototype._meterScale = function meterScale() { return [5, 75]; };
FakeElement.prototype._boilerSet = function boilerSet() { return {}; };
FakeElement.prototype._text = function text(item) { return item.text || ""; };
FakeElement.prototype._isProblem = function isProblem(item) {
  return ["unknown", "unavailable"].includes(String(item?.state?.state));
};
FakeElement.prototype._isInactive = function isInactive(item) {
  return ["off", "0", "false"].includes(String(item?.state?.state).toLowerCase());
};
FakeElement.prototype._isActive = function isActive(item) {
  return ["on", "1", "true"].includes(String(item?.state?.state).toLowerCase());
};

vm.runInNewContext(source, {
  customElements: {
    get: () => FakeElement,
    whenDefined: async () => FakeElement,
  },
  console,
});

const panel = new FakeElement();
const item = (state, role = "error", text = "") => ({ role, text, state: { state } });

for (const clear of ["0", "0.0", "0,0", "off", "Нет ошибок", "no errors"]) {
  assert.equal(panel._isActiveErrorV089(item(clear)), false, `clear error state: ${clear}`);
}
assert.equal(panel._isActiveErrorV089(item("12")), true);
assert.equal(panel._isActiveErrorV089(item("unavailable")), false);

assert.equal(panel._mixerState(item("off"), item("off")), "Неподвижен");
assert.equal(panel._mixerState(item("on"), item("off")), "Открывается");
assert.equal(panel._mixerState(item("off"), item("on")), "Закрывается");
assert.equal(panel._mixerState(item("on"), item("on")), "Ошибка сигналов");
assert.equal(panel._mixerState(item("unavailable"), item("off")), "Нет данных");

assert.deepEqual(panel._meterScale(item("2.6", "pressure_dhw")), [0, 6]);
assert.deepEqual(panel._meterScale(item("1.7", "pressure_system")), [0, 3]);
assert.deepEqual(panel._meterScale(item("25", "temperature", "тёплый пол")), [0, 45]);

assert.match(source, /class="z82-loop-pump/, "DHW circulation pump must be a physical line node");
assert.match(source, /z82-pump-art[\s\S]{0,160}<ha-icon icon="mdi:pump"/, "heating circuit status rows must use a pump symbol");

const panelManifest = JSON.parse(fs.readFileSync("custom_components/zont_local/frontend/panel_manifest.json", "utf8"));
assert.equal(panelManifest.ui_version, "0.9.4");
assert.equal(panelManifest.title, "Отопление");
assert.equal(panelManifest.path, "/dashboard-zont");
assert.equal(panelManifest.owner, "zont_local");
assert.equal(panelManifest.safe_return_route, "/dashboard-house-v11/home");
for (const asset of panelManifest.assets) {
  const path = `custom_components/zont_local/frontend/${asset.path}`;
  assert.ok(fs.existsSync(path), `declared panel asset must exist: ${path}`);
  assert.match(source, new RegExp(asset.path.split("/").at(-1).replaceAll(".", "\\.")), `frontend must reference ${asset.path}`);
}

const integrationSource = fs.readFileSync("custom_components/zont_local/__init__.py", "utf8");
const constantsSource = fs.readFileSync("custom_components/zont_local/const.py", "utf8");
assert.match(integrationSource, /panel_custom\.async_register_panel/, "zont_local must register its own HA panel");
assert.match(integrationSource, /module_url=FRONTEND_MODULE_URL/, "panel registration must load the local bundle");
assert.doesNotMatch(integrationSource, /add_extra_js_url/, "ZONT must not be injected globally into Home Assistant");
assert.match(constantsSource, /PANEL_URL_PATH = "dashboard-zont"/, "the existing public route must remain stable");
assert.match(constantsSource, /PANEL_WEB_COMPONENT_NAME = "zont-local-panel"/, "the panel element must be ZONT-owned");
assert.match(constantsSource, /PANEL_TITLE = "Отопление"/, "the HA menu must use the approved panel name");

assert.match(fullSource, /hass-toggle-menu/, "left Header rail must open the native HA menu");
assert.match(fullSource, /className = "heading title-plaque"/, "Header title must be one source-aware plaque");
assert.match(fullSource, /nikas\.specialized\.source_route\.v1/, "panel must consume the shared source hand-off");
assert.match(fullSource, /nikas\.specialized\.source_route_at\.v1/, "panel must validate the shared hand-off timestamp");
assert.match(fullSource, /handedOffRaw !== null/);
assert.match(fullSource, /handedOffAtRaw !== null/);
assert.match(fullSource, /handedOffAge >= 0/);
assert.match(fullSource, /\/dashboard-house-v11\/home/, "House return must use the canonical v11 entry");
assert.match(fullSource, /\/dashboard-actions\/home/, "Actions return must use its canonical entry");
assert.match(fullSource, /\/dashboard-infrastructure\/overview/, "Infrastructure return must use its canonical entry");
assert.match(fullSource, /<span>UI v\$\{UI_VERSION\}<\/span>/, "Header second line must contain version only");
assert.doesNotMatch(fullSource, /history\.back\s*\(/, "browser history is not a navigation contract");
assert.doesNotMatch(fullSource, /mdi:arrow-left/, "the permanent Header must not retain a legacy Back arrow");
assert.doesNotMatch(fullSource, /["']\/dashboard-house["']/, "legacy House root must not be a return route");
assert.match(fullSource, /work-viewport native-scroll/, "panel must mount exactly one standard work viewport");
assert.match(fullSource, /SCALE_MIN = \.75/, "zoom minimum must be 75 percent");
assert.match(fullSource, /SCALE_MAX = 2/, "zoom maximum must be 200 percent");
assert.match(fullSource, /SNAP_MIN = \.97/, "near-100 pinch must snap to origin");
assert.match(fullSource, /touch-action:pan-y/, "100 percent must retain native vertical scrolling");
assert.match(fullSource, /state\.scale > 1/, "one-finger transform pan must be gated above 100 percent");
assert.match(fullSource, /Масштаб 100%/, "two-finger reset must provide confirmation");
assert.doesNotMatch(fullSource, /zoom-(?:in|out)|data-zoom|scale-controls/, "permanent zoom controls are prohibited");
assert.match(fullSource, /views:new Map/, "work views must be cached instead of rebuilding the shell");
assert.match(fullSource, /morph\(view, fresh\)/, "telemetry must patch the active cached view");
assert.match(fullSource, /:host\{position:fixed!important;inset:0!important/, "the application shell must be locked to the viewport");
assert.match(fullSource, /overflow-anchor:none/, "telemetry must not move the native scroll anchor");
assert.match(fullSource, /refresh\.onclick = \(\) => this\._load\(true\)/, "refresh must preserve the last accepted telemetry while polling");
assert.doesNotMatch(fullSource, /refresh\.onclick = \(\) => \{ this\._registry = null/, "refresh must not blank the work view");
assert.match(fullSource, /if \(!Array\.isArray\(this\._registry\)\) \{[\s\S]{0,180}this\._registry = \[\]/, "initial registry failure must stay explicit");
assert.match(fullSource, /Показаны последние принятые данные/, "refresh failure must retain and label the previous registry snapshot");
assert.match(fullSource, /\.tab ha-icon\{--mdc-icon-size:28px/, "Bottom Tab Bar must use canonical MDI size");
assert.match(fullSource, /\.tab span\{font-size:12px/, "Bottom Tab labels must remain readable");
assert.match(fullSource, /"Локально"/, "connection indicator must identify the local transport");
assert.match(fullSource, /"Данные актуальны"/, "connection indicator must report freshness independently");
assert.match(fullSource, /device\.sw_version/, "device facts must be registry-backed");
assert.match(fullSource, /this\._busyMode \|\| this\._isProblem\(item\)/, "mode commands must reject duplicate and unavailable targets");
assert.match(fullSource, /this\._commandError = error instanceof Error/, "mode command failures must remain visible");

const brand = "custom_components/zont_local/brand/icon.png";
assert.ok(fs.existsSync(brand) && fs.statSync(brand).size > 0, "packaged HACS brand icon must exist");

console.log("ZONT frontend semantic scenarios passed");
