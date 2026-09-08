const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

// Load the real element and every application override. Only the browser's
// custom-element registration and unused shadow root need a stub for rendering
// the overview markup; discovery and all state interpretation remain real.
const elements = new Map();
class HTMLElementStub {
  attachShadow() {
    this.shadowRoot = {};
    return this.shadowRoot;
  }
}
const sourcePath = path.join(__dirname, "../custom_components/zont_local/frontend/zont-app.js");
vm.runInNewContext(fs.readFileSync(sourcePath, "utf8"), {
  HTMLElement: HTMLElementStub,
  customElements: {
    get: (name) => elements.get(name),
    define: (name, element) => elements.set(name, element),
    whenDefined: (name) => Promise.resolve(elements.get(name)),
  },
  console,
}, { filename: sourcePath });
const Panel = elements.get("zont-local-panel");
assert.equal(typeof Panel, "function", "the actual standalone panel must register");

function entity(entityId, friendlyName, state, attributes = {}) {
  return {
    entry: {
      entity_id: entityId,
      platform: "zont",
      unique_id: `test_${entityId}`,
      device_id: "zont_test_controller",
      original_name: friendlyName,
      disabled_by: null,
    },
    state: {
      entity_id: entityId,
      state,
      attributes: { friendly_name: friendlyName, ...attributes },
      last_changed: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    },
  };
}

function dhwCard(items) {
  const panel = new Panel();
  panel._registry = items.map((item) => item.entry);
  panel._hass = { states: Object.fromEntries(items.map((item) => [item.entry.entity_id, item.state])) };
  const discovered = panel._entries();
  assert.equal(discovered.length, items.length, "fixtures must pass the real ZONT entity discovery");
  const html = panel._systemOverviewV089(discovered);
  const card = html.match(/<article\b[^>]*class="[^"]*\bz82-dhw-card\b[^"]*"[^>]*>[\s\S]*?<\/article>/);
  assert.ok(card, "the actual overview must render its DHW card");
  return card[0];
}

function dhwStatus(items) {
  const status = dhwCard(items).match(/<div class="z82-dhw-temperature">[\s\S]*?<small>([^<]*)<\/small>/);
  assert.ok(status, "the DHW card must expose its operation status beside its temperature");
  return status[1];
}

function dhwTemperature(items) {
  const temperature = dhwCard(items).match(/<div class="z82-dhw-temperature">[\s\S]*?<strong>([^<]*)<\/strong>/);
  assert.ok(temperature, "the DHW card must expose a separate temperature value");
  return temperature[1];
}

test("missing DHW data does not report heating or readiness", () => {
  assert.equal(dhwStatus([]), "Нет данных");
  assert.equal(dhwStatus([
    entity("binary_sensor.boiler_heating", "Котёл нагрев", "on"),
    entity("sensor.room_temperature", "Комнатная температура", "22", { device_class: "temperature", unit_of_measurement: "°C" }),
  ]), "Нет данных", "heating elsewhere must not become DHW activity");
});

for (const temperature of ["0", "44", "60"]) {
  test(`DHW temperature ${temperature} °C alone does not imply operation`, () => {
    const items = [entity("sensor.gvs_temperature", "ГВС температура", temperature, {
      device_class: "temperature", unit_of_measurement: "°C",
    })];
    assert.equal(dhwStatus(items), "Нет данных");
    assert.ok(dhwCard(items).includes(`<strong>${temperature} °C</strong>`), "explicit temperature must remain visible independently");
  });
}

for (const [entityId, name, current, expected] of [
  ["binary_sensor.gvs_ready", "ГВС готов", "on", "Готово"],
  ["binary_sensor.gvs_ready", "ГВС готов", "off", "Не готово"],
  ["switch.gvs_enabled", "ГВС включено", "on", "Разрешено"],
  ["switch.gvs_enabled", "ГВС включено", "off", "Отключено"],
  ["switch.gvs_heating", "ГВС нагрев", "on", "Разрешено"],
  ["binary_sensor.gvs_heating_enabled", "ГВС нагрев разрешён", "on", "Разрешено"],
  ["binary_sensor.gvs_heating", "ГВС нагрев", "on", "Нагрев"],
  ["binary_sensor.gvs_heating", "ГВС нагрев", "off", "Не нагревается"],
  ["sensor.gvs_status", "ГВС состояние", "heating", "Нагрев"],
  ["sensor.gvs_status", "ГВС состояние", "ready", "Готово"],
  ["sensor.gvs_status", "ГВС состояние", "unknown", "Нет данных"],
  ["sensor.gvs_status", "ГВС состояние", "unavailable", "Нет данных"],
]) {
  test(`${entityId} ${current} renders ${expected}`, () => {
    assert.equal(dhwStatus([entity(entityId, name, current)]), expected);
  });
}

test("a generic DHW binary status does not establish heating", () => {
  assert.notEqual(dhwStatus([entity("binary_sensor.gvs_status", "ГВС состояние", "on")]), "Нагрев");
});

test("a DHW climate heat mode does not establish actual heating", () => {
  assert.notEqual(dhwStatus([entity("climate.gvs", "ГВС нагрев", "heat", {
    hvac_modes: ["off", "heat"], temperature: 55, current_temperature: 44,
  })]), "Нагрев", "a selected heating mode is not evidence of current activity");
});

test("numeric readiness is not a DHW temperature", () => {
  const items = [entity("sensor.gvs_ready", "ГВС готов", "1")];
  assert.equal(dhwStatus(items), "Готово");
  assert.doesNotMatch(dhwTemperature(items), /^1(?:\s|$)/, "a readiness bit must not populate the temperature field");
});

test("a generic water-heater status is not actual DHW heating", () => {
  assert.notEqual(dhwStatus([
    entity("binary_sensor.gvs_water_heater_status", "ГВС водонагреватель статус", "on"),
  ]), "Нагрев", "the equipment name must not establish an activity signal");
});

test("zero heating duration is neither inactive DHW nor a temperature", () => {
  const items = [entity("sensor.gvs_heating_time", "ГВС время нагрева", "0", { unit_of_measurement: "min" })];
  assert.notEqual(dhwStatus(items), "Не нагревается", "a duration is not an activity bit");
  assert.equal(dhwTemperature(items), "—");
});

for (const [entityId, name, current, unit] of [
  ["sensor.gvs_pump_speed", "ГВС насос обороты", "1500", "rpm"],
  ["sensor.gvs_energy", "ГВС энергия", "10", "kWh"],
]) {
  test(`${entityId} cannot populate DHW temperature`, () => {
    assert.equal(dhwTemperature([entity(entityId, name, current, { unit_of_measurement: unit })]), "—");
  });
}

test("the temperature unit identifies a DHW measurement without a temperature name or device class", () => {
  const items = [entity("sensor.gvs_water", "ГВС вода", "42", { unit_of_measurement: "°C" })];
  assert.equal(dhwTemperature(items), "42 °C");
  assert.equal(dhwStatus(items), "Нет данных");
});

for (const missing of [undefined, null, "", "   ", "unknown", "unavailable"]) {
  test(`missing DHW temperature ${JSON.stringify(missing)} remains unknown instead of zero`, () => {
    const items = [entity("sensor.gvs_temperature", "ГВС температура", missing, {
      device_class: "temperature", unit_of_measurement: "°C",
    })];
    assert.equal(dhwStatus(items), "Нет данных");
    assert.equal(dhwTemperature(items), "Нет данных");
  });
}

function permutations(items) {
  if (!items.length) return [[]];
  return items.flatMap((item, index) => permutations(items.filter((_, other) => other !== index))
    .map((rest) => [item, ...rest]));
}

for (const [activity, expected] of [["on", "Нагрев"], ["off", "Не нагревается"]]) {
  test(`actual DHW activity ${activity} wins over readiness and permission in every registry order`, () => {
    const items = [
      entity("binary_sensor.gvs_ready", "ГВС готов", activity === "on" ? "off" : "on"),
      entity("switch.gvs_enabled", "ГВС включено", "on"),
      entity("binary_sensor.gvs_heating", "ГВС нагрев", activity),
    ];
    for (const ordered of permutations(items)) {
      assert.equal(dhwStatus(ordered), expected,
        `registry order: ${ordered.map((item) => item.entry.entity_id).join(", ")}`);
    }
  });
}

test("unavailable DHW activity stays unknown despite an available readiness signal", () => {
  const items = [
    entity("binary_sensor.gvs_heating", "ГВС нагрев", "unavailable"),
    entity("binary_sensor.gvs_ready", "ГВС готов", "on"),
  ];
  for (const ordered of permutations(items)) {
    assert.equal(dhwStatus(ordered), "Нет данных",
      `registry order: ${ordered.map((item) => item.entry.entity_id).join(", ")}`);
  }
});
