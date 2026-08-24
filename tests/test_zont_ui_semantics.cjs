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

console.log("ZONT frontend semantic scenarios passed");
