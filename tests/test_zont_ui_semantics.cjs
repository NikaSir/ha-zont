const assert = require("node:assert");
const fs = require("node:fs");
const vm = require("node:vm");

let source = fs.readFileSync("custom_components/zont_local/frontend/zont-ui.js", "utf8");
source = source.replace(/^import .*;\n/m, "");

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
assert.match(source, /Тип контура<\/span><strong>Прямой/, "direct radiator topology should balance the circuit cards");
assert.match(source, /event\.touches\.length >= 2/, "panel must support two-finger pinch zoom");
assert.match(source, /contentX: \(point\.x - state\.x\) \/ state\.scale/, "pinch must preserve its focal point");
assert.match(source, /translate3d\(\$\{state\.x\}px,\$\{state\.y\}px,0\) scale\(\$\{state\.scale\}\)/, "pan and zoom must use one transform-owned canvas");
assert.match(source, /new PointerEvent\("pointercancel"/, "gestures must cancel pending entity holds");
assert.match(source, /event\.stopImmediatePropagation\(\)/, "post-gesture clicks must be guarded");
assert.match(source, /Масштаб 100%/, "reset and snap must provide feedback");
assert.match(source, /localStorage\.setItem\(CANVAS_STORAGE_KEY/, "full canvas state must persist per client");
assert.match(source, /CANVAS_MIN_SCALE = 0\.75/, "minimum canvas scale must be 75%");
assert.match(source, /CANVAS_MAX_SCALE = 2/, "maximum canvas scale must be 200%");
assert.match(source, /CANVAS_SNAP_MIN = 0\.97/, "near-100% pinch must snap from 97%");
assert.match(source, /CANVAS_SNAP_MAX = 1\.03/, "near-100% pinch must snap through 103%");
assert.match(source, /CANVAS_DOUBLE_TAP_DELAY_MS = 360/, "two-finger double tap must reset the canvas");
assert.match(source, /viewport\.querySelector\(":scope > #zont-canvas-stage"\)/, "canvas reconciliation must reuse one direct stage");
assert.match(source, /stage\?\.querySelector\(":scope > #zont-canvas-surface"\)/, "canvas reconciliation must reuse one direct surface");
assert.match(source, /viewport\.replaceChildren\(stage\)/, "invalid canvas structures must be replaced, not nested");
assert.doesNotMatch(source, /scrollLeft\s*=/, "native horizontal scroll must not own canvas state");
assert.doesNotMatch(source, /scrollTop\s*=/, "native vertical scroll must not own canvas state");
assert.doesNotMatch(source, /\.scrollTo\(/, "native scrolling must not own canvas state");
assert.doesNotMatch(source, /style\.zoom/, "CSS zoom must not be used");

const panelManifest = JSON.parse(fs.readFileSync("custom_components/zont_local/frontend/panel_manifest.json", "utf8"));
assert.equal(panelManifest.ui_version, "0.8.15");
assert.equal(panelManifest.zoom_policy.engine, "transform_owned_canvas");
assert.equal(panelManifest.zoom_policy.permanent_controls, false);
assert.equal(panelManifest.zoom_policy.reset_gesture, "two_finger_double_tap");
assert.deepEqual(panelManifest.ha_menu_event, { type: "hass-toggle-menu", bubbles: true, composed: true });
for (const asset of panelManifest.assets) {
  const path = `custom_components/zont_local/frontend/${asset.path}`;
  assert.ok(fs.existsSync(path), `declared panel asset must exist: ${path}`);
  assert.match(source, new RegExp(asset.path.split("/").at(-1).replaceAll(".", "\\.")), `frontend must reference ${asset.path}`);
}

console.log("ZONT frontend semantic scenarios passed");
