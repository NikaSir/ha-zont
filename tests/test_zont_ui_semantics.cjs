const assert = require("node:assert");
const fs = require("node:fs");
const vm = require("node:vm");

const fullSource = fs.readFileSync("custom_components/zont_local/frontend/zont-ui.js", "utf8");
assert.match(fullSource, /Standalone semantic ZONT panel/, "standalone bundle must embed the generic renderer");
assert.match(fullSource, /const ELEMENT_NAME = "zont-local-panel"/, "ZONT must use its integration-owned custom element");
assert.doesNotMatch(fullSource, /nikas-generated-zont/, "ZONT must not reuse the retired shared custom element");
assert.doesNotMatch(fullSource, /^import\s+/m, "standalone bundle must not use runtime imports");
const appMarker = "// ZONT UI v0.9.1";
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
assert.equal(panelManifest.ui_version, "0.9.1");
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

assert.match(fullSource, /className = "work-viewport"/, "one work viewport must be installed");
assert.match(fullSource, /className = "work-canvas"/, "one work canvas must be installed");
assert.match(fullSource, /if \(scale <= 1\) return \{ minX: 0, maxX: 0, minY: 0, maxY: 0 \}/);
assert.match(fullSource, /gesture\.startState\.scale > 1/, "one-finger pan must require enlargement");
assert.match(fullSource, /overflow-x:hidden;overflow-y:auto/);
assert.match(fullSource, /work-viewport\.canvas-zoomed\{overflow:hidden/);
assert.match(fullSource, /ZONT_ZOOM_MIN = 0\.75/);
assert.match(fullSource, /ZONT_ZOOM_MAX = 2/);
assert.match(fullSource, /ZONT_ZOOM_SNAP_MIN = 0\.97/);
assert.match(fullSource, /ZONT_ZOOM_SNAP_MAX = 1\.03/);
assert.match(fullSource, /Масштаб 100%/);
assert.match(fullSource, /grid-template-columns:52px minmax\(0,1fr\) 52px/);
assert.match(fullSource, /border-radius:16px!important/);
assert.match(fullSource, /--mdc-icon-size:25px!important/);
assert.match(fullSource, /\.tab ha-icon\{--mdc-icon-size:28px!important/);
assert.match(fullSource, /\.tab span\{font-size:12px!important;font-weight:700!important/);
assert.match(fullSource, /zontMorphChildren\(mountedMain, template\.content\)/, "telemetry and tabs must patch the mounted work content");
assert.match(fullSource, /if \(!mountedMain\)/, "the full renderer must run only for initial mount");
assert.match(fullSource, /\.heading strong\{font-size:23px!important;font-weight:800!important/);
assert.match(fullSource, /\.heading span\{font-size:14px!important;font-weight:560!important/);
assert.match(fullSource, /font-size:21px!important\}\.heading span\{font-size:13px!important/);
assert.match(fullSource, /: connectionUnknown \? "Нет данных" : "Локально"/);
assert.match(fullSource, /stale \? "Данные устарели" : "Данные актуальны"/);
assert.equal(panelManifest.shell.stable_dom, true);
assert.equal(panelManifest.typography.meaningful_min_px, 12);
assert.equal(panelManifest.typography.meaningful_max_px, 25);
assert.equal(panelManifest.connection_freshness_indicator.enabled, true);

console.log("ZONT frontend semantic scenarios passed");
