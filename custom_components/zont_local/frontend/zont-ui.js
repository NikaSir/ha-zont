// ZONT UI v0.8.16 — HACS-managed application layer.
// The generated panel owns the base element. This module waits for that element
// instead of importing its implementation through a second, fragile URL.

const ELEMENT_NAME = "nikas-generated-zont";
const UI_VERSION = "0.8.16";
const ASSET_VERSION = "0.8.16";
const ASSET_ROOT = "/zont_local_panel/assets";
const BOILER_CASING_IMAGE = `${ASSET_ROOT}/zont-boiler-casing-v0813.webp?v=${ASSET_VERSION}`;
const DHW_SHELL_IMAGE = `${ASSET_ROOT}/zont-dhw-shell-v0813.webp?v=${ASSET_VERSION}`;
const STALE_AFTER_MS = 15 * 60 * 1000;
const CANVAS_STORAGE_KEY = "nikas.zont.canvasZoom.v2";
const LEGACY_ZOOM_STORAGE_KEY = "nikas.panel.zont.zoom.v1";
const CANVAS_MIN_SCALE = 0.75;
const CANVAS_MAX_SCALE = 2;
const CANVAS_SNAP_MIN = 0.97;
const CANVAS_SNAP_MAX = 1.03;
const CANVAS_PAN_THRESHOLD_PX = 5;
const CANVAS_GESTURE_GUARD_MS = 700;
const CANVAS_DOUBLE_TAP_DELAY_MS = 360;
const CANVAS_TAP_DURATION_MS = 280;
const CANVAS_TAP_MOVE_PX = 14;
const ENTITY_BINDINGS = Object.freeze({
  online: ["binary_sensor.nikas_h2000_pro_online"],
  controllerPower: ["sensor.nikas_h2000_pro_pitanie"],
  supplyVoltage: ["sensor.nikas_h2000_pro_napriazhenie_pitaniia_3"],
  batteryVoltage: ["sensor.nikas_h2000_pro_napriazhenie_batarei_2"],
  mainState: ["binary_sensor.nikas_h2000_pro_osnovnoi_sostoianie"],
  mainCurrent: ["sensor.nikas_h2000_pro_osnovnoi_aktualnaia_temperatura"],
  mainTarget: ["sensor.nikas_h2000_pro_osnovnoi_tselevaia_temperatura"],
  mainError: ["sensor.nikas_h2000_pro_osnovnoi_oshibka"],
  mainReturn: ["sensor.kontroller_otopleniia_nikas_h2000_pro_nikas_h2000_pro_ebus_osnovnoi_no2_tdeg_obratnogo_potoka"],
  mainModulation: ["sensor.kontroller_otopleniia_nikas_h2000_pro_nikas_h2000_pro_ebus_osnovnoi_no2_moduliatsiia"],
  mainPressure: ["sensor.kontroller_otopleniia_nikas_h2000_pro_nikas_h2000_pro_ebus_osnovnoi_no2_davlenie_tn"],
  reserveState: ["binary_sensor.nikas_h2000_pro_rezervnyi_sostoianie"],
  reserveCurrent: ["sensor.nikas_h2000_pro_rezervnyi_aktualnaia_temperatura"],
  reserveTarget: ["sensor.nikas_h2000_pro_rezervnyi_tselevaia_temperatura"],
  reserveError: ["sensor.nikas_h2000_pro_rezervnyi_oshibka"],
  dhwTemperature: ["sensor.kontroller_otopleniia_nikas_h2000_pro_nikas_h2000_pro_ebus_osnovnoi_no2_tdeg_gvs"],
  coldWaterPressure: ["sensor.nikas_h2000_pro_pitevaia_voda"],
  systemPressure: ["sensor.nikas_h2000_pro_teplonositel_2"],
  hydraulicTemperature: ["sensor.nikas_h2000_pro_tn_gidrostrelka_2"],
  radiatorsState: ["binary_sensor.nikas_h2000_pro_radiatory"],
  radiatorsSupply: ["sensor.nikas_h2000_pro_tn_radiatory_3"],
  radiatorsReturn: ["sensor.nikas_h2000_pro_tn_radiatory_4"],
  floorState: ["binary_sensor.nikas_h2000_pro_teplyi_pol"],
  floorSupply: ["sensor.nikas_h2000_pro_tn_teplyi_pol_3"],
  floorReturn: ["sensor.nikas_h2000_pro_tn_teplyi_pol_4"],
  circulationState: ["binary_sensor.nikas_h2000_pro_tsirkuliatsiia"],
  circulationTemperature: ["sensor.nikas_h2000_pro_gv_tsirkuliatsiia_2"],
  mixerOpening: ["binary_sensor.nikas_h2000_pro_otkrytie"],
  mixerClosing: ["binary_sensor.nikas_h2000_pro_zakrytie"],
  indoorTemperature: ["sensor.nikas_h2000_pro_gostinaia_tdeg_2", "sensor.nikas_h2000_pro_gostinaia"],
  outdoorTemperature: [
    "sensor.nikas_h2000_pro_ulichnyi_datchik_2",
    "sensor.nikas_h2000_pro_ebus_osnovnoi_tdeg_vne_doma",
    "sensor.nikas_h2000_pro_pogoda_iz_interneta_2",
  ],
});
const clearErrorStates = new Set([
  "", "0", "0.0", "off", "false", "ok", "normal", "none", "clear", "idle", "no error", "no errors",
  "нет", "нет ошибки", "нет ошибок", "ошибок нет", "отсутствует", "отсутствуют", "—", "-",
]);
const onlineStates = new Set(["on", "online", "connected", "подключен", "подключено", "в сети", "true", "1"]);
const offlineStates = new Set(["off", "offline", "disconnected", "отключен", "отключено", "нет связи", "false", "0"]);
const esc = (value) => String(value ?? "—")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const includesAny = (text, words) => {
  const source = String(text || "").toLocaleLowerCase();
  return words.some((word) => source.includes(String(word).toLocaleLowerCase()));
};
const clampCanvasScale = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.min(CANVAS_MAX_SCALE, Math.max(CANVAS_MIN_SCALE, numeric));
};
const touchDistance = (first, second) => Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
const touchMidpoint = (first, second, viewport = null) => {
  const point = { x: (first.clientX + second.clientX) / 2, y: (first.clientY + second.clientY) / 2 };
  if (!viewport) return point;
  const rect = viewport.getBoundingClientRect();
  return { x: point.x - rect.left, y: point.y - rect.top };
};
const pointDistance = (first, second) => Math.hypot(second.x - first.x, second.y - first.y);
const deepElementFromPoint = (root, x, y) => {
  let element = root?.elementFromPoint?.(x, y) || document.elementFromPoint(x, y);
  const visited = new Set();
  while (element?.shadowRoot?.elementFromPoint && !visited.has(element)) {
    visited.add(element);
    const inner = element.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === element) break;
    element = inner;
  }
  return element;
};
const cancelEntityHold = (target) => {
  if (!target?.dispatchEvent) return;
  const event = typeof PointerEvent === "function"
    ? new PointerEvent("pointercancel", { bubbles: true, composed: true })
    : new Event("pointercancel", { bubbles: true, composed: true });
  target.dispatchEvent(event);
};

const rawState = (item) => String(item?.state?.state ?? "").trim().toLocaleLowerCase();
const updateTimestamp = (item) => {
  const raw = item?.state?.last_reported || item?.state?.last_updated || item?.state?.last_changed;
  const timestamp = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(timestamp) ? timestamp : null;
};
const ageLabel = (ageMs) => {
  if (!Number.isFinite(ageMs) || ageMs < 0) return "Свежесть неизвестна";
  const minutes = Math.floor(ageMs / 60000);
  if (minutes < 1) return "Обновлено сейчас";
  if (minutes < 60) return `Обновлено ${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  return `Обновлено ${hours} ч назад`;
};

const livePanels = (root = document) => {
  const found = [];
  const visit = (node) => {
    if (!node?.querySelectorAll) return;
    found.push(...node.querySelectorAll(ELEMENT_NAME));
    node.querySelectorAll("*").forEach((element) => {
      if (element.shadowRoot) visit(element.shadowRoot);
    });
  };
  visit(root);
  return found;
};

const refreshLivePanels = () => {
  if (typeof document === "undefined") return;
  requestAnimationFrame(() => {
  livePanels().forEach((panel) => {
    panel._active = panel._tabFromLocation?.() || panel._active;
    if (typeof panel._queue === "function") panel._queue();
    else if (typeof panel._render === "function") panel._render();
  });
  });
};

function installV0816() {
  const ElementClass = customElements.get(ELEMENT_NAME);
  if (!ElementClass) return false;
  if (ElementClass.prototype.__zontV0816) {
    refreshLivePanels();
    return true;
  }

  const originalRender = ElementClass.prototype._render;
  if (typeof originalRender !== "function") return false;

  const originalRole = ElementClass.prototype._role;
  const originalMeterScale = ElementClass.prototype._meterScale;
  const originalBoilerSet = ElementClass.prototype._boilerSet;
  const bound = (items, key) => {
    const ids = ENTITY_BINDINGS[key] || [];
    for (const entityId of ids) {
      const item = items.find((candidate) => candidate?.entry?.entity_id === entityId);
      if (item) return item;
    }
    return null;
  };

  ElementClass.prototype._boundV089 = function boundV089(items, key, fallback = null) {
    return bound(items, key) || (typeof fallback === "function" ? fallback() : fallback);
  };

  ElementClass.prototype._isActiveErrorV089 = function isActiveErrorV089(item) {
    if (!item || this._isProblem(item)) return false;
    const state = rawState(item);
    if (clearErrorStates.has(state) || /^0(?:[.,]0+)?(?:\s|$)/.test(state) || this._isInactive(item)) return false;
    const numeric = Number(state.replace(",", "."));
    if (Number.isFinite(numeric)) return numeric !== 0;
    return true;
  };

  ElementClass.prototype._role = function roleV089(item) {
    const text = this._text(item);
    if (includesAny(text, ["циркуляц", "circulation"])) return "circulation";
    return originalRole.call(this, item);
  };

  ElementClass.prototype._meterScale = function meterScaleV089(item) {
    const role = this._role(item);
    const text = this._text(item);
    if (["pressure_dhw", "pressure_irrigation"].includes(role)) return [0, 6];
    if (["pressure_system", "pressure_boiler"].includes(role)) return [0, 3];
    if (includesAny(text, ["тёпл", "тепл", "warm floor", "floor heating"])) return [0, 45];
    if (includesAny(text, ["радиатор", "котел", "котёл", "boiler", "гидрострел"])) return [0, 75];
    return originalMeterScale.call(this, item);
  };

  ElementClass.prototype._mixerState = function mixerStateV089(opening, closing) {
    const openingValid = !!opening && !this._isProblem(opening);
    const closingValid = !!closing && !this._isProblem(closing);
    if (!openingValid || !closingValid) return "Нет данных";
    const openingActive = this._isActive(opening);
    const closingActive = this._isActive(closing);
    if (openingActive && closingActive) return "Ошибка сигналов";
    if (openingActive) return "Открывается";
    if (closingActive) return "Закрывается";
    return "Неподвижен";
  };

  ElementClass.prototype._boilerSet = function boilerSetV089(items, reserve = false) {
    const fallback = originalBoilerSet.call(this, items, reserve);
    if (reserve) {
      return {
        ...fallback,
        state: this._boundV089(items, "reserveState", fallback.state),
        current: this._boundV089(items, "reserveCurrent", fallback.current),
        supply: this._boundV089(items, "reserveCurrent", fallback.supply || fallback.current),
        target: this._boundV089(items, "reserveTarget", fallback.target),
        error: this._boundV089(items, "reserveError", fallback.error),
      };
    }
    return {
      ...fallback,
      state: this._boundV089(items, "mainState", fallback.state),
      current: this._boundV089(items, "mainCurrent", fallback.current),
      supply: this._boundV089(items, "mainCurrent", fallback.supply || fallback.current),
      target: this._boundV089(items, "mainTarget", fallback.target),
      ret: this._boundV089(items, "mainReturn", fallback.ret),
      modulation: this._boundV089(items, "mainModulation", fallback.modulation),
      pressure: this._boundV089(items, "mainPressure", fallback.pressure),
      error: this._boundV089(items, "mainError", fallback.error),
    };
  };

  ElementClass.prototype._diagnostics = function diagnosticsV089(items) {
    const controllerItems = this._unique([
      this._boundV089(items, "online", () => this._find(items, ["online", "controller online", "подключ"])),
      this._boundV089(items, "controllerPower", () => this._find(items, ["питан", "power"])),
      this._boundV089(items, "supplyVoltage", () => this._find(items, ["напряжение питан", "supply voltage"])),
      this._boundV089(items, "batteryVoltage", () => this._find(items, ["напряжение батар", "battery voltage"])),
    ]);
    const errorSources = this._unique(items.filter((item) => this._role(item) === "error"));
    const activeErrors = errorSources.filter((item) => this._isActiveErrorV089(item));
    const unavailableErrors = errorSources.filter((item) => this._isProblem(item));
    const actualProblems = this._unique(items.filter((item) =>
      this._isProblem(item) && !["rssi", "battery", "error"].includes(this._role(item)))).slice(0, 12);
    const eBus = this._unique(items.filter((item) =>
      includesAny(this._text(item), ["ebus"])
      && ["modulation", "pressure_boiler", "temperature", "dhw", "return", "supply"].includes(this._role(item))))
      .slice(0, 10);
    const controllerHtml = controllerItems.length
      ? controllerItems.map((item) => this._compactCard(item)).join("")
      : '<div class="empty problem">Телеметрия контроллера не найдена.</div>';
    const errorHtml = activeErrors.length
      ? activeErrors.slice(0, 8).map((item) => this._compactCard(item)).join("")
      : unavailableErrors.length
        ? '<div class="empty problem">Состояние ошибок недоступно.</div>'
        : '<div class="ok-card"><ha-icon icon="mdi:check-circle-outline"></ha-icon><span>Активных ошибок нет</span></div>';
    const problemsHtml = actualProblems.length
      ? actualProblems.map((item) => this._compactCard(item)).join("") : "";
    const eBusHtml = eBus.length
      ? eBus.map((item) => this._compactCard(item)).join("")
      : '<div class="empty">Данные eBUS не найдены.</div>';
    return `${this._section("Контроллер H2000+ Pro", this._grid(controllerHtml))}`
      + `${this._section("Активные ошибки", this._grid(errorHtml))}`
      + `${problemsHtml ? this._section("Проблемы доступности", this._grid(problemsHtml)) : ""}`
      + `${this._section("eBUS", this._grid(eBusHtml))}`;
  };

  ElementClass.prototype._systemOverviewV089 = function systemOverviewV089(items) {
    const mainFallback = this._boilerSet(items, false);
    const reserveFallback = this._boilerSet(items, true);
    const main = {
      ...mainFallback,
      state: this._boundV089(items, "mainState", mainFallback.state),
      current: this._boundV089(items, "mainCurrent", mainFallback.current),
      supply: this._boundV089(items, "mainCurrent", mainFallback.supply || mainFallback.current),
      target: this._boundV089(items, "mainTarget", mainFallback.target),
      ret: this._boundV089(items, "mainReturn", mainFallback.ret),
      modulation: this._boundV089(items, "mainModulation", mainFallback.modulation),
      pressure: this._boundV089(items, "mainPressure", mainFallback.pressure),
      error: this._boundV089(items, "mainError", mainFallback.error),
    };
    const reserveBoiler = {
      ...reserveFallback,
      state: this._boundV089(items, "reserveState", reserveFallback.state),
      current: this._boundV089(items, "reserveCurrent", reserveFallback.current),
      supply: this._boundV089(items, "reserveCurrent", reserveFallback.supply || reserveFallback.current),
      target: this._boundV089(items, "reserveTarget", reserveFallback.target),
      error: this._boundV089(items, "reserveError", reserveFallback.error),
    };
    const value = (item, fallback = "—") => {
      if (!item) return fallback;
      return this._isProblem(item) ? "Нет данных" : this._value(item, fallback);
    };
    const state = (item, fallback = "Нет данных") => {
      if (!item || this._isProblem(item)) return fallback;
      return this._stateText(item);
    };
    const valid = (item) => !!item && !this._isProblem(item);
    const active = (item) => !!item && this._isActive(item);
    const scope = (words) => items.filter((item) => includesAny(this._text(item), words));
    const numericIn = (pool, include = [], exclude = []) => pool.find((item) =>
      this._number(item) != null
      && (!include.length || includesAny(this._text(item), include))
      && (!exclude.length || !includesAny(this._text(item), exclude)));

    const radiatorItems = scope(["радиатор", "radiator"]);
    const floorItems = scope(["тёпл", "тепл", "warm floor", "floor heating"]);
    const dhwItems = scope(["гвс", "dhw", "горяч"]);
    const circulationItems = scope(["циркуляц", "circulation"]);

    const circuit = (pool) => {
      const pump = pool.find((item) => this._isStateLike(item)
        && includesAny(this._text(item), ["насос", "pump"])
        && !includesAny(this._text(item), ["температур", "датчик"]));
      const enabled = pool.find((item) => this._isStateLike(item)
        && !includesAny(this._text(item), ["насос", "pump", "температур", "датчик", "открытие", "закрытие"]));
      return {
        supply: this._find(pool, ["подач", "supply", ">>>"]),
        ret: this._find(pool, ["обрат", "return", "<<<"]),
        current: numericIn(pool, ["температур", "temperature", "t°"], ["целев", "target", "уставк"]),
        target: this._find(pool, ["целев", "target", "расчёт", "расчет", "уставк"]),
        pump,
        enabled,
      };
    };
    const radiators = circuit(radiatorItems);
    const floor = circuit(floorItems);
    radiators.supply = this._boundV089(items, "radiatorsSupply", radiators.supply);
    radiators.ret = this._boundV089(items, "radiatorsReturn", radiators.ret);
    radiators.enabled = this._boundV089(items, "radiatorsState", radiators.enabled);
    floor.supply = this._boundV089(items, "floorSupply", floor.supply);
    floor.ret = this._boundV089(items, "floorReturn", floor.ret);
    floor.enabled = this._boundV089(items, "floorState", floor.enabled);
    radiators.pump ||= items.find((item) => this._isStateLike(item)
      && includesAny(this._text(item), ["радиатор", "radiator"])
      && includesAny(this._text(item), ["насос", "pump"]));
    floor.pump ||= items.find((item) => this._isStateLike(item)
      && includesAny(this._text(item), ["тёпл", "тепл", "floor"])
      && includesAny(this._text(item), ["насос", "pump"]));

    const circulationState = this._boundV089(items, "circulationState", () =>
      circulationItems.find((item) => this._isStateLike(item)
        && includesAny(this._text(item), ["насос", "pump"]))
      || this._findState(circulationItems, ["включ", "active", "состояни", "status"])
      || this._findState(items, ["циркуляц"], ["температур", "t°"]));
    const circulationTemperature = this._boundV089(items, "circulationTemperature", () =>
      numericIn(circulationItems, ["температур", "temperature", "t°"])
      || numericIn(circulationItems));
    const dhwTemperature = this._boundV089(items, "dhwTemperature", () =>
      numericIn(dhwItems, ["температур", "temperature", "t°"], ["циркуляц", "хвс", "давлен"])
      || numericIn(dhwItems, [], ["циркуляц", "хвс", "давлен"]));
    const dhwState = this._findState(dhwItems, ["готов", "нагрев", "состояни", "status", "active", "включ"], ["циркуляц"]);
    const coldWaterPressure = this._boundV089(items, "coldWaterPressure", () => items.find((item) => {
      const text = this._text(item);
      return includesAny(text, ["давлен", "pressure"])
        && includesAny(text, ["хвс", "питьев", "cold water"])
        && !includesAny(text, ["полив"]);
    }));
    const systemPressure = this._boundV089(items, "systemPressure", () =>
      this._find(items, ["давлен", "pressure"], ["хвс", "питьев", "полив", "cold water"])
      || main.pressure);
    const hydraulicTemperature = this._boundV089(items, "hydraulicTemperature", () =>
      numericIn(scope(["гидрострел", "hydraulic"]), ["температур", "temperature", "t°"])
      || numericIn(scope(["гидрострел", "hydraulic"])));
    const indoor = this._boundV089(items, "indoorTemperature", () =>
      this._find(items, ["гостиная", "комнат", "в доме", "indoor"], ["влаж", "humidity", "целев", "target"]));
    const outdoor = this._boundV089(items, "outdoorTemperature", () =>
      this._find(items, ["улиц", "outdoor", "вне дома", "weather"], ["влаж", "humidity"]));
    const online = this._boundV089(items, "online", () =>
      this._find(items, ["online", "подключ", "controller online"]));
    const reserveState = this._boundV089(items, "reserveState", () =>
      this._findState(items, ["резерв", "reserve"], ["температур", "t°", "ошиб"])
      || reserveBoiler.state);
    const mixerItems = scope(["смесител", "mixing", "кран", "valve"]);
    const mixerOpening = this._boundV089(items, "mixerOpening", () =>
      this._findState(mixerItems, ["открытие", "opening"]));
    const mixerClosing = this._boundV089(items, "mixerClosing", () =>
      this._findState(mixerItems, ["закрытие", "closing"]));
    const mixerOpeningActive = active(mixerOpening);
    const mixerClosingActive = active(mixerClosing);
    const mixerConflict = mixerOpeningActive && mixerClosingActive;
    const mixerText = this._mixerState(mixerOpening, mixerClosing);
    const mixerSignalItem = mixerOpeningActive ? mixerOpening
      : mixerClosingActive ? mixerClosing : mixerOpening || mixerClosing;
    const mixerDot = () => mixerConflict
      ? '<i class="z82-dot problem" title="Одновременно включены открытие и закрытие"></i>'
      : statusDot(mixerSignalItem);

    const errorSources = items.filter((item) => this._role(item) === "error");
    const errors = errorSources.filter((item) => this._isActiveErrorV089(item));
    const errorDataProblems = errorSources.filter((item) => this._isProblem(item));
    const essentials = [
      main.current || main.supply, main.ret, reserveBoiler.current || reserveBoiler.supply,
      dhwTemperature, systemPressure, indoor, outdoor,
    ];
    const essentialProblems = essentials.filter((item) => !item || this._isProblem(item));
    const usableCount = items.filter((item) => !this._isProblem(item)).length;
    const onlineState = rawState(online);
    const onlineActive = !!online && !this._isProblem(online)
      && (this._isActive(online) || onlineStates.has(onlineState));
    const onlineInactive = !!online && !this._isProblem(online)
      && (this._isInactive(online) || offlineStates.has(onlineState));
    const offline = usableCount === 0 || onlineInactive;
    const connectionUnknown = !offline && (!online || this._isProblem(online) || !onlineActive);
    const timestamps = items.map(updateTimestamp).filter((timestamp) => timestamp != null);
    const latestTimestamp = timestamps.length ? Math.max(...timestamps) : null;
    const dataAge = latestTimestamp == null ? null : Math.max(0, Date.now() - latestTimestamp);
    const stale = dataAge != null && dataAge > STALE_AFTER_MS;
    const freshnessUnknown = dataAge == null;
    const actuatorProblem = mixerConflict;
    const attention = offline || connectionUnknown || stale || freshnessUnknown
      || errors.length > 0 || errorDataProblems.length > 0 || essentialProblems.length > 0 || actuatorProblem;
    const title = offline ? "Нет связи" : errors.length || actuatorProblem ? "Требует внимания"
      : connectionUnknown || stale || freshnessUnknown || errorDataProblems.length || essentialProblems.length ? "Ограниченные данные"
        : "Система работает";
    const subtitle = offline ? "Телеметрия ZONT недоступна"
      : errors.length ? "Проверьте сообщения контроллера"
        : actuatorProblem ? "Проверьте сигналы смесительного крана"
          : connectionUnknown ? "Состояние связи с контроллером неизвестно"
            : stale ? "Показания давно не обновлялись"
              : freshnessUnknown ? "Время обновления данных неизвестно"
                : errorDataProblems.length ? "Состояние ошибок контроллера недоступно"
                  : essentialProblems.length ? "Часть показаний временно недоступна" : "Отопление и ГВС в норме";
    const onlineText = offline ? "Нет связи"
      : connectionUnknown ? "Нет данных" : "Онлайн";
    const onlineTone = offline ? "offline" : connectionUnknown ? "unknown" : "online";
    const freshness = offline ? "Источник недоступен"
      : freshnessUnknown ? "Свежесть неизвестна" : ageLabel(dataAge);
    const mode = this._currentMode(items);

    const statusClass = (item) => active(item) ? "on"
      : item && this._isInactive(item) ? "off" : valid(item) ? "ready" : "problem";
    const nodeStatusClass = (item) => statusClass(item);
    const statusDot = (item) => `<i class="z82-dot ${statusClass(item)}" title="${esc(state(item))}"></i>`;
    const lineRow = (label, item, tone = "", fallback = "—") => `
      <div class="z82-row"><span class="${tone}">${esc(label)}</span><strong>${esc(value(item, fallback))}</strong></div>`;

    const boilerCard = (number, subtitleText, set, reserve = false) => {
      const statusItem = set.state;
      const visualItem = set.current || set.supply;
      const boilerActive = active(statusItem);
      return `<article class="z82-equipment z82-boiler-card ${reserve ? "reserve" : ""}">
        <header><h3>Котёл ${number}</h3><span>${esc(subtitleText)}</span></header>
        <div class="z82-boiler-visual">
          <ha-icon class="z82-flame ${boilerActive ? "on" : ""}" icon="mdi:fire"></ha-icon>
          <div class="z82-boiler-art"><i></i><b>${esc(value(visualItem))}</b>${!reserve ? '<span class="z82-mini-tank"></span>' : ""}</div>
          ${statusDot(statusItem || visualItem)}
        </div>
        <div class="z82-rows">
          ${lineRow("Подача", set.supply || set.current, "hot")}
          ${lineRow("Обратка", set.ret, "cold")}
          ${!reserve ? lineRow("ГВС (бойлер)", dhwTemperature, "cold") : ""}
          <div class="z82-row"><span>Статус</span><strong class="z82-state ${boilerActive ? "on" : ""}">${esc(state(statusItem, valid(visualItem) ? "Данные доступны" : "Нет данных"))}</strong></div>
        </div>
      </article>`;
    };

    const dhwNumber = this._number(dhwTemperature);
    const fill = dhwNumber == null ? 0 : Math.max(8, Math.min(92, (dhwNumber / 70) * 100));
    const shellWaterFill = fill * 0.59;
    const dhwStatusText = dhwState ? state(dhwState)
      : dhwNumber == null ? "Нет данных" : dhwNumber >= 45 ? "Готово" : "Нагрев";
    const dhwCard = `<article class="z82-equipment z82-dhw-card">
      <header><h3>ГВС <span>(бойлер Котла 1)</span></h3></header>
      <div class="z82-dhw-schematic">
        <div class="z82-tank">
          <i class="z82-water" style="height:${shellWaterFill.toFixed(1)}%"></i>
          <span class="z82-port hot"></span><span class="z82-port loop"></span><span class="z82-port cold"></span>
        </div>
        <div class="z82-dhw-temperature"><ha-icon icon="mdi:thermometer"></ha-icon><strong>${esc(value(dhwTemperature))}</strong><small>${esc(dhwStatusText)}</small>${statusDot(dhwState || dhwTemperature)}</div>
        <i class="z82-pipe z82-hot-pipe"></i><i class="z82-flow-arrow hot"></i>
        <i class="z82-pipe z82-loop-branch"></i><i class="z82-pipe z82-loop-return"></i><i class="z82-pipe z82-loop-vertical"></i><i class="z82-flow-arrow loop"></i>
        <span class="z82-loop-pump ${statusClass(circulationState)}" title="Насос циркуляции: ${esc(state(circulationState))}"><ha-icon icon="mdi:pump"></ha-icon></span>
        <i class="z82-pipe z82-cold-pipe"></i><i class="z82-flow-arrow cold"></i>
        <div class="z82-hot-water"><ha-icon icon="mdi:faucet"></ha-icon><span>Выход ГВС</span><strong>${esc(value(dhwTemperature))}</strong></div>
        <div class="z82-circulation-loop"><span>Циркуляция</span><strong>${esc(value(circulationTemperature))}</strong><small>${esc(state(circulationState))}</small></div>
        <div class="z82-cold-water"><ha-icon icon="mdi:gauge"></ha-icon><span>Вход ХВС</span><strong>${esc(value(coldWaterPressure))}</strong></div>
      </div>
    </article>`;

    const connection = (tone, direction, position) =>
      `<i class="z82-connection ${tone} ${direction}" style="left:${position}%"><b></b></i>`;

    const circuitCard = (titleText, icon, set, mixed = false) => {
      const pump = set.pump;
      const circuitState = pump || set.enabled;
      const circuitLabel = pump ? "Насос контура" : "Состояние контура";
      return `<article class="z82-circuit-card">
        <header><div><h3>${esc(titleText)}</h3></div><ha-icon class="z82-circuit-icon" icon="${icon}"></ha-icon></header>
        <div class="z82-circuit-device">
          <div class="z82-pump-art ${statusClass(circuitState)}"><ha-icon icon="mdi:pump"></ha-icon></div>
          <div><span>${esc(circuitLabel)}</span><strong>${esc(state(circuitState))}</strong></div>
          ${statusDot(circuitState)}
        </div>
        ${mixed
          ? `<div class="z82-mixer"><ha-icon icon="mdi:valve"></ha-icon><div><span>Смесительный кран</span><strong>${esc(mixerText)}</strong></div>${mixerDot()}</div>`
          : `<div class="z82-circuit-type"><ha-icon icon="mdi:pipe-valve"></ha-icon><div><span>Тип контура</span><strong>Прямой</strong></div></div>`}
        <div class="z82-circuit-values">
          <div><span>Подача</span><i class="hot"></i><strong>${esc(value(set.supply || set.current))}</strong></div>
          <div><span>Обратка</span><i class="cold"></i><strong>${esc(value(set.ret))}</strong></div>
        </div>
      </article>`;
    };

    const metricCard = (label, item, icon, fallback = "—", forcedValue = null, noteOverride = null) => {
      const display = forcedValue ?? value(item, fallback);
      const note = noteOverride ?? (!item && forcedValue == null ? "Нет данных" : item && this._isProblem(item) ? "Источник недоступен" : "Норма");
      return `<div class="z82-metric ${item && this._isProblem(item) ? "problem" : ""}">
        <ha-icon icon="${icon}"></ha-icon><span>${esc(label)}</span><strong>${esc(display)}</strong><small>${esc(note)}</small>
      </div>`;
    };

    const nodeCard = (label, item, icon, note = "") => `<div class="z82-node ${nodeStatusClass(item)}">
      <strong>${esc(label)}</strong><ha-icon icon="${icon}"></ha-icon><span>${esc(state(item))}</span>${note ? `<small>${esc(note)}</small>` : ""}
    </div>`;

    const modeVisual = (label) => {
      const text = String(label).toLocaleLowerCase();
      if (includesAny(text, ["выключ", "отключ"])) return ["mdi:power", "Выключено"];
      if (includesAny(text, ["лето", "гвс"])) return ["mdi:water-outline", label];
      if (includesAny(text, ["эконом", "эко"])) return ["mdi:leaf", label];
      return ["mdi:home-thermometer-outline", label];
    };
    const modes = this._modeButtons(items);
    const modeButtons = modes.length ? modes.slice(0, 4).map((item) => {
      const label = this._modeLabel(item) || "Режим";
      const [icon, visibleLabel] = modeVisual(label);
      const selected = this._modeActive(item, mode);
      return `<button class="z82-mode ${selected ? "selected" : ""}" data-mode-entity="${esc(item.entry.entity_id)}" data-mode-label="${esc(label)}" ${this._busyMode === item.entry.entity_id ? "disabled" : ""}>
        <ha-icon icon="${icon}"></ha-icon><strong>${esc(visibleLabel)}</strong><span>${selected ? "Сейчас активен" : "Доступен"}</span>
      </button>`;
    }).join("") : `<div class="z82-empty">Кнопки режимов ZONT в Home Assistant не найдены.</div>`;

    const nodeNote = (set) => set.enabled && set.pump ? `Насос: ${state(set.pump).toLocaleLowerCase()}` : "";

    const issueLabel = errors.length > 1 ? `Ошибок: ${errors.length}`
      : errors.length === 1 ? "Ошибка контроллера"
        : actuatorProblem ? "Ошибка крана"
          : errorDataProblems.length ? "Ошибки: нет данных"
            : essentialProblems.length ? `Нет данных: ${essentialProblems.length}`
            : stale ? "Данные устарели"
              : connectionUnknown ? "Связь: нет данных"
                : freshnessUnknown ? "Свежесть: нет данных" : "";

    return `<div class="z82-system ${attention ? "attention" : ""} ${offline ? "offline" : ""}">
      <div class="z82-head">
        <div><span class="z82-eyebrow">СОСТОЯНИЕ СИСТЕМЫ</span><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>
        <div class="z82-statuses">
          <div class="z82-online ${onlineTone}"><i></i><strong>${esc(onlineText)}</strong><small>${esc(freshness)}</small></div>
          ${attention && !offline ? `<button type="button" class="z82-notice" data-open-diagnostics><i></i><span>${esc(issueLabel)}</span></button>` : ""}
        </div>
      </div>

      <div class="z82-equipment-grid">
        ${boilerCard(1, "основной + ГВС", main, false)}
        ${boilerCard(2, "резервный", reserveBoiler, true)}
        ${dhwCard}
      </div>

      <div class="z82-hydro-stage" aria-label="Гидравлическая схема отопления">
        ${connection("hot", "down", 12)}${connection("cold", "up", 21)}
        ${connection("hot", "down", 34)}${connection("cold", "up", 43)}
        <div class="z82-air-vent"></div>
        <div class="z82-hydro"><strong>ГИДРОСТРЕЛКА</strong><div class="z82-hydro-values"><span><ha-icon icon="mdi:thermometer"></ha-icon>${esc(value(hydraulicTemperature))}</span><span><ha-icon icon="mdi:gauge"></ha-icon>${esc(value(systemPressure))}</span></div></div>
        ${connection("hot", "down-bottom", 24)}${connection("cold", "up-bottom", 33)}
        ${connection("hot", "down-bottom", 71)}${connection("cold", "up-bottom", 80)}
      </div>

      <div class="z82-circuits-grid">
        ${circuitCard("Контур 1 · Радиаторы", "mdi:radiator", radiators)}
        ${circuitCard("Контур 2 · Тёплый пол", "mdi:heating-coil", floor, true)}
      </div>

      <div class="z82-legend"><span><i class="hot"></i>Подача</span><span><i class="cold"></i>Обратка</span><span><i class="loop"></i>Циркуляция ГВС</span><span><b class="on"></b>Работает</span><span><b class="off"></b>Выключено</span><span><b class="problem"></b>Нет данных</span></div>
      <div class="z82-metrics">
        ${metricCard("Режим", null, "mdi:home-thermometer-outline", "Определяется ZONT", mode, mode === "Определяется ZONT" ? "Проверить" : "Активен")}
        ${metricCard("Температура в доме", indoor, "mdi:thermometer")}
        ${metricCard("Уличная температура", outdoor, "mdi:weather-partly-cloudy")}
        ${metricCard("Давление системы", systemPressure, "mdi:gauge")}
      </div>
    </div>

    <section class="z82-section"><span class="z82-eyebrow">ОСНОВНЫЕ УЗЛЫ</span><div class="z82-nodes">
      ${nodeCard("Радиаторы", radiators.enabled || radiators.pump, "mdi:radiator", nodeNote(radiators))}
      ${nodeCard("Тёплый пол", floor.enabled || floor.pump, "mdi:heating-coil", nodeNote(floor))}
      ${nodeCard("Циркуляция ГВС", circulationState, "mdi:pump", active(circulationState) ? "Насос работает" : "Насос остановлен")}
      ${nodeCard("Резерв", reserveState, "mdi:water-boiler-off", "Резервный котёл")}
    </div></section>

    <section class="z82-section"><span class="z82-eyebrow">ТЕКУЩИЙ РЕЖИМ</span><div class="z82-modes">${modeButtons}</div></section>`;
  };

  ElementClass.prototype._states = function statesV089(items) {
    return this._systemOverviewV089(items);
  };

  ElementClass.prototype._loadCanvasStateV0815 = function loadCanvasStateV0815() {
    if (this._zontCanvasStateV0815) return this._zontCanvasStateV0815;
    let state = { scale: 1, x: 0, y: 0 };
    try {
      const stored = JSON.parse(localStorage.getItem(CANVAS_STORAGE_KEY) || "null");
      if (stored && typeof stored === "object") {
        state = {
          scale: clampCanvasScale(stored.scale),
          x: Number.isFinite(stored.x) ? stored.x : 0,
          y: Number.isFinite(stored.y) ? stored.y : 0,
        };
      } else {
        state.scale = clampCanvasScale(localStorage.getItem(LEGACY_ZOOM_STORAGE_KEY) || 1);
      }
    } catch (_error) { /* storage is optional */ }
    this._zontCanvasStateV0815 = state;
    return state;
  };

  ElementClass.prototype._persistCanvasStateV0815 = function persistCanvasStateV0815() {
    try { localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(this._loadCanvasStateV0815())); } catch (_error) { /* storage is optional */ }
  };

  ElementClass.prototype._reconcileCanvasV0815 = function reconcileCanvasV0815(root) {
    const viewport = root.querySelector("main");
    if (!viewport) return null;
    root.querySelectorAll(".z14-zoom-controls").forEach((element) => element.remove());
    viewport.classList.add("z15-canvas-viewport");
    let stage = viewport.querySelector(":scope > #zont-canvas-stage");
    let surface = stage?.querySelector(":scope > #zont-canvas-surface");
    const structuralChildren = Array.from(viewport.children).filter((element) => !element.classList.contains("z15-canvas-toast"));
    if (!stage || !surface || structuralChildren.length !== 1) {
      const nodes = Array.from(viewport.childNodes).filter((node) => !node.classList?.contains("z15-canvas-toast"));
      const toast = viewport.querySelector(":scope > .z15-canvas-toast");
      stage = document.createElement("div");
      stage.id = "zont-canvas-stage";
      surface = document.createElement("div");
      surface.id = "zont-canvas-surface";
      nodes.forEach((node) => surface.appendChild(node));
      stage.appendChild(surface);
      viewport.replaceChildren(stage);
      if (toast) viewport.appendChild(toast);
    }
    this._zontCanvasViewportV0815 = viewport;
    this._zontCanvasStageV0815 = stage;
    this._zontCanvasSurfaceV0815 = surface;
    return viewport;
  };

  ElementClass.prototype._measureCanvasV0815 = function measureCanvasV0815() {
    const viewport = this._zontCanvasViewportV0815;
    const surface = this._zontCanvasSurfaceV0815;
    const root = this.shadowRoot;
    if (!viewport || !surface || viewport.clientWidth <= 0) return false;
    const bottom = root?.querySelector(".bottom");
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const availableHeight = Math.floor(viewportHeight - viewport.getBoundingClientRect().top - (bottom?.getBoundingClientRect().height || 0));
    if (availableHeight > 220) viewport.style.height = `${availableHeight}px`;
    const state = this._loadCanvasStateV0815();
    this._zontCanvasBaseWidthV0815 = Math.max(1, viewport.clientWidth);
    surface.style.width = `${this._zontCanvasBaseWidthV0815}px`;
    const renderedHeight = surface.getBoundingClientRect().height / Math.max(state.scale, 0.01);
    this._zontCanvasBaseHeightV0815 = Math.max(1, viewport.clientHeight, surface.scrollHeight, Number.isFinite(renderedHeight) ? renderedHeight : 0);
    return true;
  };

  ElementClass.prototype._applyCanvasV0815 = function applyCanvasV0815(remeasure = false, persist = false) {
    const viewport = this._zontCanvasViewportV0815;
    const stage = this._zontCanvasStageV0815;
    const surface = this._zontCanvasSurfaceV0815;
    if (!viewport || !stage || !surface) return;
    if (remeasure || !this._zontCanvasBaseWidthV0815) if (!this._measureCanvasV0815()) return;
    const state = this._loadCanvasStateV0815();
    state.scale = clampCanvasScale(state.scale);
    const scaledWidth = this._zontCanvasBaseWidthV0815 * state.scale;
    const scaledHeight = this._zontCanvasBaseHeightV0815 * state.scale;
    state.x = scaledWidth <= viewport.clientWidth
      ? (viewport.clientWidth - scaledWidth) / 2
      : Math.min(0, Math.max(viewport.clientWidth - scaledWidth, state.x));
    state.y = scaledHeight <= viewport.clientHeight
      ? 0
      : Math.min(0, Math.max(viewport.clientHeight - scaledHeight, state.y));
    stage.style.width = `${Math.max(1, viewport.clientWidth)}px`;
    stage.style.height = `${Math.max(1, viewport.clientHeight)}px`;
    surface.style.transform = `translate3d(${state.x}px,${state.y}px,0) scale(${state.scale})`;
    if (persist) this._persistCanvasStateV0815();
  };

  ElementClass.prototype._showCanvasResetV0815 = function showCanvasResetV0815() {
    const viewport = this._zontCanvasViewportV0815;
    if (!viewport) return;
    let toast = viewport.querySelector(":scope > .z15-canvas-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "z15-canvas-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.textContent = "Масштаб 100%";
      viewport.appendChild(toast);
    }
    clearTimeout(this._zontCanvasToastTimerV0815);
    requestAnimationFrame(() => toast.classList.add("visible"));
    this._zontCanvasToastTimerV0815 = setTimeout(() => toast.classList.remove("visible"), 1250);
  };

  ElementClass.prototype._resetCanvasV0815 = function resetCanvasV0815(notify = true) {
    Object.assign(this._loadCanvasStateV0815(), { scale: 1, x: 0, y: 0 });
    this._applyCanvasV0815(false, true);
    if (notify) this._showCanvasResetV0815();
  };

  ElementClass.prototype._installCanvasV0815 = function installCanvasV0815(root) {
    const viewport = this._reconcileCanvasV0815(root);
    if (!viewport) return;
    const state = this._loadCanvasStateV0815();
    let pan = null;
    let pinch = null;
    let tapGesture = null;
    let multiTouchActive = false;
    let gestureGuardUntil = 0;

    viewport.addEventListener("touchstart", (event) => {
      if (event.touches.length >= 2) {
        const [first, second] = event.touches;
        const point = touchMidpoint(first, second, viewport);
        multiTouchActive = true;
        pan = null;
        pinch = {
          distance: Math.max(1, touchDistance(first, second)),
          scale: state.scale,
          contentX: (point.x - state.x) / state.scale,
          contentY: (point.y - state.y) / state.scale,
        };
        tapGesture = { startedAt: performance.now(), midpoint: touchMidpoint(first, second), distance: touchDistance(first, second), moved: false };
        gestureGuardUntil = Number.POSITIVE_INFINITY;
        Array.from(event.touches).forEach((touch) => cancelEntityHold(deepElementFromPoint(root, touch.clientX, touch.clientY)));
        event.preventDefault();
        return;
      }
      if (event.touches.length === 1 && !multiTouchActive) {
        const touch = event.touches[0];
        pan = { clientX: touch.clientX, clientY: touch.clientY, x: state.x, y: state.y, target: deepElementFromPoint(root, touch.clientX, touch.clientY) || event.target, moved: false };
      }
    }, { passive: false });

    viewport.addEventListener("touchmove", (event) => {
      if (event.touches.length >= 2 && pinch) {
        const [first, second] = event.touches;
        const point = touchMidpoint(first, second, viewport);
        const currentDistance = touchDistance(first, second);
        state.scale = clampCanvasScale(pinch.scale * currentDistance / pinch.distance);
        state.x = point.x - pinch.contentX * state.scale;
        state.y = point.y - pinch.contentY * state.scale;
        this._applyCanvasV0815();
        if (tapGesture && (pointDistance(tapGesture.midpoint, touchMidpoint(first, second)) > CANVAS_TAP_MOVE_PX || Math.abs(currentDistance - tapGesture.distance) > CANVAS_TAP_MOVE_PX)) tapGesture.moved = true;
        event.preventDefault();
        return;
      }
      if (!pan || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const dx = touch.clientX - pan.clientX;
      const dy = touch.clientY - pan.clientY;
      if (!pan.moved && Math.hypot(dx, dy) < CANVAS_PAN_THRESHOLD_PX) return;
      if (!pan.moved) {
        pan.moved = true;
        gestureGuardUntil = Number.POSITIVE_INFINITY;
        cancelEntityHold(pan.target);
      }
      state.x = pan.x + dx;
      state.y = pan.y + dy;
      this._applyCanvasV0815();
      event.preventDefault();
    }, { passive: false });

    viewport.addEventListener("touchend", (event) => {
      if (multiTouchActive && event.touches.length === 1) {
        pinch = null;
        const touch = event.touches[0];
        pan = { clientX: touch.clientX, clientY: touch.clientY, x: state.x, y: state.y, target: event.target, moved: false };
        return;
      }
      if (event.touches.length !== 0) return;
      const completedTap = tapGesture;
      const wasMultiTouch = multiTouchActive;
      const panMoved = Boolean(pan?.moved);
      multiTouchActive = false;
      pinch = null;
      tapGesture = null;
      pan = null;
      if (state.scale >= CANVAS_SNAP_MIN && state.scale <= CANVAS_SNAP_MAX && state.scale !== 1) this._resetCanvasV0815(true);
      else this._applyCanvasV0815(false, true);
      const now = performance.now();
      if (wasMultiTouch) {
        gestureGuardUntil = now + CANVAS_GESTURE_GUARD_MS;
        const isTap = completedTap && !completedTap.moved && now - completedTap.startedAt <= CANVAS_TAP_DURATION_MS;
        if (isTap) {
          const previous = this._zontLastTwoFingerTapV0815;
          if (previous && now - previous.at <= CANVAS_DOUBLE_TAP_DELAY_MS && pointDistance(previous.midpoint, completedTap.midpoint) <= 48) {
            this._zontLastTwoFingerTapV0815 = null;
            this._resetCanvasV0815(true);
          } else this._zontLastTwoFingerTapV0815 = { at: now, midpoint: completedTap.midpoint };
        } else this._zontLastTwoFingerTapV0815 = null;
      } else if (panMoved) gestureGuardUntil = now + CANVAS_GESTURE_GUARD_MS;
    }, { passive: true });

    viewport.addEventListener("touchcancel", () => {
      multiTouchActive = false;
      pinch = null;
      tapGesture = null;
      pan = null;
      this._applyCanvasV0815(false, true);
      gestureGuardUntil = performance.now() + CANVAS_GESTURE_GUARD_MS;
    }, { passive: true });
    viewport.addEventListener("click", (event) => {
      if (gestureGuardUntil === Number.POSITIVE_INFINITY || performance.now() < gestureGuardUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, { capture: true });

    this._zontCanvasResizeObserverV0815?.disconnect();
    this._zontCanvasResizeCleanupV0815?.();
    if (typeof ResizeObserver === "function") {
      this._zontCanvasResizeObserverV0815 = new ResizeObserver(() => this._applyCanvasV0815(true));
      this._zontCanvasResizeObserverV0815.observe(this._zontCanvasSurfaceV0815);
    }
    const resize = () => this._applyCanvasV0815(true);
    window.addEventListener("resize", resize, { passive: true });
    window.visualViewport?.addEventListener("resize", resize, { passive: true });
    this._zontCanvasResizeCleanupV0815 = () => {
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
    };
    this._measureCanvasV0815();
    this._applyCanvasV0815();
    requestAnimationFrame(() => this._applyCanvasV0815(true));
  };

  ElementClass.prototype._render = function patchedRenderV089(...args) {
    const result = originalRender.apply(this, args);
    const root = this.shadowRoot;
    if (!root) return result;

    root.getElementById("zont-v080-style")?.remove();
    root.getElementById("zont-v081-style")?.remove();

    root.getElementById("zont-v082-style")?.remove();

    root.getElementById("zont-v083-style")?.remove();

    root.getElementById("zont-v084-style")?.remove();

    root.getElementById("zont-v085-style")?.remove();

    root.getElementById("zont-v086-style")?.remove();

    root.getElementById("zont-v087-style")?.remove();

    root.getElementById("zont-v088-style")?.remove();

    root.getElementById("zont-v089-style")?.remove();

    root.getElementById("zont-v0810-style")?.remove();

    root.getElementById("zont-v0811-style")?.remove();

    root.getElementById("zont-v0812-style")?.remove();
    root.getElementById("zont-v0813-style")?.remove();
    root.getElementById("zont-v0814-style")?.remove();
    if (!root.getElementById("zont-v0815-style")) {
      const style = document.createElement("style");
      style.id = "zont-v0815-style";
      style.textContent = `
      .header{grid-template-columns:64px 1fr 64px!important;min-height:92px!important;padding:max(10px,env(safe-area-inset-top,0px)) 20px 10px!important;border-bottom:1px solid var(--divider-color,#e5e5e5)!important;box-shadow:none!important}.rail{width:52px!important;height:52px!important;border-radius:16px!important;background:var(--card-background-color,#fff)!important;box-shadow:0 6px 20px rgba(0,0,0,.06)!important}.rail ha-icon{--mdc-icon-size:31px!important}#back{justify-self:start}#refresh{justify-self:end;color:var(--primary-color,#087de0)!important}.heading strong{font-size:24px!important;font-weight:760!important}.heading span{margin-top:5px!important;font-size:14px!important;color:var(--secondary-text-color,#666)!important}
      main{width:min(100%,980px)!important}.z82-system,.z82-section{background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#ddd);border-radius:22px;padding:16px;margin-bottom:16px}.z82-system.attention{border-color:var(--warning-color,#ff9800)}.z82-system.offline{border-color:var(--error-color,#db4437)}.z82-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.z82-eyebrow{font-size:10.5px;font-weight:760;letter-spacing:.14em;color:var(--secondary-text-color,#666)}.z82-head h1{font-size:29px;line-height:1.04;margin:7px 0 4px}.z82-head p{margin:0;color:var(--secondary-text-color,#666);font-size:14px}.z82-online{min-width:112px;display:grid;grid-template-columns:9px auto;gap:2px 7px;align-items:center;padding:10px 12px;border-radius:999px;background:color-mix(in srgb,var(--success-color,#43a047) 10%,var(--card-background-color,#fff));color:var(--success-color,#43a047)}.z82-online i{width:8px;height:8px;border-radius:50%;background:currentColor}.z82-online strong{font-size:12px}.z82-online small{grid-column:1/3;text-align:center;font-size:8.5px;color:var(--secondary-text-color,#777)}.z82-system.attention .z82-online{color:var(--warning-color,#ff9800);background:color-mix(in srgb,var(--warning-color,#ff9800) 10%,var(--card-background-color,#fff))}.z82-system.offline .z82-online{color:var(--error-color,#db4437)}
      .z82-equipment-grid{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,.92fr) minmax(0,1.55fr);gap:10px;margin-top:16px}.z82-equipment{min-width:0;border:1px solid var(--divider-color,#ddd);border-radius:18px;padding:12px;background:var(--card-background-color,#fff)}.z82-equipment header{text-align:center;min-height:38px}.z82-equipment h3{font-size:14px;margin:0;line-height:1.15}.z82-equipment header>span,.z82-equipment h3 span{display:block;margin-top:4px;font-size:9.5px;font-weight:550;color:var(--secondary-text-color,#666)}.z82-boiler-visual{height:130px;display:flex;align-items:center;justify-content:center;gap:5px;position:relative}.z82-flame{align-self:flex-start;margin-top:25px;color:var(--secondary-text-color,#aaa);--mdc-icon-size:25px}.z82-flame.on{color:#f0442d}.z82-boiler-art{width:70px;height:108px;position:relative;border:1px solid #c9c9c9;border-radius:7px;background:linear-gradient(115deg,#ececec 0,#fff 44%,#dedede);box-shadow:0 6px 13px rgba(0,0,0,.08)}.z82-boiler-art:before{content:"";position:absolute;left:25px;top:-8px;width:20px;height:8px;border-radius:4px 4px 0 0;background:#171717}.z82-boiler-art i{position:absolute;left:9px;bottom:13px;width:28px;height:9px;border-radius:2px;background:#17312d;box-shadow:inset 0 0 0 2px #0a1715}.z82-boiler-art b{position:absolute;left:11px;bottom:13px;width:24px;color:#3dd35a;font:700 6.5px/9px monospace;text-align:center}.z82-mini-tank{position:absolute;right:5px;bottom:9px;width:19px;height:47px;border:1px solid #aaa;border-radius:8px;background:linear-gradient(to top,#238ed2 0 54%,#f7f7f7 55%)}.z82-dot{width:16px;height:16px;border-radius:50%;display:inline-grid;place-items:center;background:var(--secondary-text-color,#aaa);box-shadow:inset 0 0 0 4px #fff;flex:none}.z82-dot.on,.z82-dot.ready{background:var(--success-color,#24a148)}.z82-dot.problem{background:var(--warning-color,#ff9800)}.z82-rows{display:grid;gap:6px}.z82-row{display:flex;align-items:baseline;justify-content:space-between;gap:5px;font-size:9.5px}.z82-row span:before{content:"";display:inline-block;width:5px;height:5px;margin-right:5px;border:1.5px solid currentColor;border-radius:50%;vertical-align:1px}.z82-row span.hot{color:#ed342d}.z82-row span.cold{color:#117ed8}.z82-row strong{font-size:10.5px;text-align:right}.z82-state.on{color:var(--success-color,#24a148)}
      .z82-dhw-body{display:grid;grid-template-columns:76px minmax(0,1fr);grid-template-rows:150px auto;position:relative;min-height:210px}.z82-tank{align-self:center;justify-self:center;position:relative;width:54px;height:126px;border:1px solid #bbb;border-radius:25px 25px 14px 14px;background:linear-gradient(90deg,#e4e4e4,#fff 38%,#d4d4d4);overflow:hidden;box-shadow:0 7px 13px rgba(0,0,0,.07)}.z82-tank:before{content:"";position:absolute;left:5px;right:5px;top:6px;height:9px;border-radius:50%;background:#171717;z-index:3}.z82-water{position:absolute;left:7px;right:7px;bottom:7px;max-height:88%;background:linear-gradient(#7bc8ec,#178bd4);border-radius:2px 2px 9px 9px}.z82-port{position:absolute!important;right:-6px!important;width:8px!important;height:7px!important;border:1px solid #666!important;background:#ccc!important;z-index:4}.z82-port.hot{top:16px}.z82-port.loop{top:66px}.z82-port.cold{bottom:5px}.z82-dhw-temperature{align-self:center;display:grid;grid-template-columns:18px auto 18px;gap:2px 5px;align-items:center}.z82-dhw-temperature ha-icon{grid-row:1/3;--mdc-icon-size:16px}.z82-dhw-temperature strong{font-size:14px}.z82-dhw-temperature small{grid-column:2;font-size:9px;font-weight:650}.z82-dhw-temperature .z82-dot{grid-column:3;grid-row:1/3;width:14px;height:14px}
      .z82-water-lines{grid-column:1/3;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;border-top:1px solid var(--divider-color,#eee);padding-top:8px}.z82-water-lines>div{position:relative;min-width:0;padding-top:16px;text-align:center}.z82-water-lines>div>i:not(.branch):not(.return){position:absolute;left:8%;right:8%;top:7px;height:3px;border-radius:3px}.z82-hot-water>i{background:#ed342d}.z82-cold-water>i{background:#117ed8}.z82-circulation-loop>i.branch{position:absolute;left:10%;right:10%;top:7px;height:3px;background:#842197}.z82-water-lines ha-icon{--mdc-icon-size:18px}.z82-hot-water ha-icon{color:#ed342d}.z82-circulation-loop ha-icon{color:#842197}.z82-cold-water ha-icon{color:#117ed8}.z82-water-lines span,.z82-water-lines strong,.z82-water-lines small{display:block;overflow:hidden;text-overflow:ellipsis}.z82-water-lines span{font-size:7.7px;color:var(--secondary-text-color,#666);white-space:nowrap}.z82-water-lines strong{font-size:9.5px;margin-top:2px;white-space:nowrap}.z82-water-lines small{font-size:7.3px;color:var(--secondary-text-color,#777);white-space:nowrap}
      .z82-hydro-stage{position:relative;height:46px;margin:48px 5% 54px}.z82-hydro{position:absolute;inset:0;border-radius:7px;background:linear-gradient(#3a3d40,#16191c 50%,#313438);box-shadow:0 5px 10px rgba(0,0,0,.16);color:#fff;display:flex;align-items:center;justify-content:center;gap:9px}.z82-hydro ha-icon{--mdc-icon-size:17px}.z82-hydro strong{font-size:13px;letter-spacing:.02em}.z82-hydro span{font-size:12px}.z82-hydro:before,.z82-hydro:after{content:"";position:absolute;top:13px;width:13px;height:20px;background:#25292d;border:1px solid #111}.z82-hydro:before{left:-11px;border-radius:7px 0 0 7px}.z82-hydro:after{right:-11px;border-radius:0 7px 7px 0}.z82-air-vent{position:absolute;left:50%;top:-25px;width:11px;height:25px;z-index:4;background:linear-gradient(90deg,#b06c13,#eda742,#8c510d);border-radius:3px 3px 0 0}.z82-connection{position:absolute;z-index:3;width:4px;height:42px;border-radius:3px}.z82-connection.hot{background:#ed342d}.z82-connection.cold{background:#117ed8}.z82-connection.down,.z82-connection.up{bottom:100%}.z82-connection.down-bottom,.z82-connection.up-bottom{top:100%}.z82-connection b{position:absolute;left:-4px;width:12px;height:12px;border-radius:3px;background:linear-gradient(90deg,#8b4d08,#e49a25,#6e3904);border:1px solid #6b3a05}.z82-connection.down b,.z82-connection.up b{bottom:-6px}.z82-connection.down-bottom b,.z82-connection.up-bottom b{top:-6px}.z82-connection:after{content:"";position:absolute;left:-4px;border-left:6px solid transparent;border-right:6px solid transparent}.z82-connection.down:after,.z82-connection.down-bottom:after{border-top:8px solid #ed342d;bottom:13px}.z82-connection.up:after,.z82-connection.up-bottom:after{border-bottom:8px solid #117ed8;top:13px}
      .z82-circuits-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.z82-circuit-card{border:1px solid var(--divider-color,#ddd);border-radius:18px;padding:14px}.z82-circuit-card header{display:flex;align-items:center;justify-content:space-between;gap:8px}.z82-circuit-card h3{font-size:14px;line-height:1.2;margin:0}.z82-circuit-icon{color:#ef3e2f;--mdc-icon-size:31px}.z82-circuit-device,.z82-mixer{display:flex;align-items:center;gap:8px;margin-top:16px}.z82-pump-art{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#171717;color:#777;flex:none}.z82-pump-art.on{color:#26b34b;box-shadow:0 0 0 2px color-mix(in srgb,#26b34b 25%,transparent)}.z82-pump-art ha-icon{--mdc-icon-size:22px}.z82-circuit-device>div:nth-child(2),.z82-mixer>div{min-width:0;flex:1}.z82-circuit-device span,.z82-circuit-device strong,.z82-mixer span,.z82-mixer strong{display:block;font-size:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.z82-circuit-device strong,.z82-mixer strong{font-size:10px;margin-top:2px}.z82-circuit-device .z82-dot,.z82-mixer .z82-dot{width:13px;height:13px}.z82-mixer>ha-icon{color:#a56612;--mdc-icon-size:34px}.z82-circuit-values{margin-top:18px;display:grid;gap:9px}.z82-circuit-values>div{display:grid;grid-template-columns:1fr auto;gap:3px 8px;align-items:end}.z82-circuit-values span{font-size:8px}.z82-circuit-values strong{font-size:11px}.z82-circuit-values i{grid-row:2;height:3px;border-radius:3px}.z82-circuit-values i.hot{background:#ed342d}.z82-circuit-values i.cold{background:#117ed8}
      .z82-legend{margin:12px 0 0;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px 18px;padding:9px 10px;border:1px solid var(--divider-color,#ddd);border-radius:14px}.z82-legend span{display:flex;align-items:center;gap:6px;font-size:8.5px}.z82-legend i{width:25px;height:3px;border-radius:3px}.z82-legend i.hot{background:#ed342d}.z82-legend i.cold{background:#117ed8}.z82-legend i.loop{background:#842197}.z82-legend b{width:12px;height:12px;border-radius:50%;background:var(--success-color,#24a148);box-shadow:inset 0 0 0 3px #fff}
      .z82-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.z82-metric{min-height:88px;border:1px solid var(--divider-color,#ddd);border-radius:15px;padding:9px;display:grid;grid-template-columns:25px 1fr;align-content:center;gap:2px 6px}.z82-metric ha-icon{grid-row:1/4;align-self:center;color:var(--secondary-text-color,#666)}.z82-metric span{font-size:8.5px;color:var(--secondary-text-color,#777)}.z82-metric strong{font-size:12px;line-height:1.12}.z82-metric small{font-size:8px;color:var(--success-color,#43a047)}.z82-metric.problem{border-color:var(--warning-color,#ff9800)}.z82-metric.problem small{color:var(--warning-color,#ff9800)}
      .z82-nodes,.z82-modes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.z82-node{min-height:118px;border:1px solid var(--divider-color,#ddd);border-radius:16px;padding:11px 6px;display:flex;flex-direction:column;align-items:center;text-align:center}.z82-node>strong{font-size:10.5px}.z82-node ha-icon{--mdc-icon-size:34px;margin:10px 0 7px;color:var(--secondary-text-color,#666)}.z82-node span{font-size:9.5px;font-weight:650;color:var(--secondary-text-color,#666)}.z82-node small{font-size:8px;color:var(--secondary-text-color,#777);margin-top:5px}.z82-node.on ha-icon,.z82-node.on span{color:var(--success-color,#43a047)}.z82-node.problem{border-color:var(--warning-color,#ff9800)}
      .z82-mode{min-height:112px;border:1px solid var(--divider-color,#ddd);border-radius:16px;background:var(--card-background-color,#fff);color:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:8px}.z82-mode ha-icon{--mdc-icon-size:32px;color:var(--secondary-text-color,#666)}.z82-mode strong{font-size:10.5px}.z82-mode span{font-size:8.5px;color:var(--secondary-text-color,#777)}.z82-mode.selected{border-color:var(--primary-color,#087de0);background:color-mix(in srgb,var(--primary-color,#087de0) 7%,var(--card-background-color,#fff))}.z82-mode.selected ha-icon,.z82-mode.selected span{color:var(--primary-color,#087de0)}.z82-mode:disabled{opacity:.55}.z82-empty{grid-column:1/-1;padding:18px;border:1px solid var(--divider-color,#ddd);border-radius:14px;color:var(--secondary-text-color,#777);font-size:12px}
      @media(max-width:520px){main{padding-top:12px!important;padding-left:8px!important;padding-right:8px!important}.header{grid-template-columns:58px 1fr 58px!important;min-height:86px!important;padding-left:10px!important;padding-right:10px!important}.rail{width:48px!important;height:48px!important}.heading strong{font-size:22px!important}.heading span{font-size:12.5px!important}.z82-system,.z82-section{padding:11px;border-radius:18px}.z82-head h1{font-size:24px}.z82-head p{font-size:11px}.z82-online{min-width:90px;padding:7px 8px}.z82-online strong{font-size:10px}.z82-online small{font-size:7.3px}.z82-equipment-grid{gap:5px}.z82-equipment{padding:7px;border-radius:14px}.z82-equipment h3{font-size:11px}.z82-equipment header>span,.z82-equipment h3 span{font-size:7.3px}.z82-boiler-visual{height:112px}.z82-boiler-art{width:55px;height:91px}.z82-boiler-art:before{left:19px}.z82-flame{--mdc-icon-size:18px}.z82-row{font-size:7.4px}.z82-row strong{font-size:8px}.z82-dhw-body{grid-template-columns:55px minmax(0,1fr);grid-template-rows:125px auto;min-height:184px}.z82-tank{width:43px;height:105px}.z82-dhw-temperature{grid-template-columns:13px auto 12px;gap:1px 3px}.z82-dhw-temperature ha-icon{--mdc-icon-size:13px}.z82-dhw-temperature strong{font-size:10px}.z82-dhw-temperature small{font-size:7px}.z82-water-lines{gap:2px}.z82-water-lines span{font-size:5.8px}.z82-water-lines strong{font-size:7px}.z82-water-lines small{font-size:5.5px}.z82-water-lines ha-icon{--mdc-icon-size:14px}.z82-hydro-stage{margin-left:4%;margin-right:4%;height:40px}.z82-hydro strong{font-size:10px}.z82-hydro span{font-size:9px}.z82-circuits-grid{gap:6px}.z82-circuit-card{padding:9px}.z82-circuit-card h3{font-size:10.5px}.z82-circuit-device,.z82-mixer{gap:5px;margin-top:12px}.z82-circuit-values{margin-top:13px}.z82-metrics,.z82-nodes,.z82-modes{gap:5px}.z82-metric{min-height:82px;padding:6px;grid-template-columns:19px 1fr}.z82-metric ha-icon{--mdc-icon-size:20px}.z82-metric span{font-size:6.8px}.z82-metric strong{font-size:9px}.z82-metric small{font-size:6.4px}.z82-node,.z82-mode{min-height:100px;padding:6px 2px}.z82-node ha-icon,.z82-mode ha-icon{--mdc-icon-size:28px}.z82-node>strong,.z82-mode strong{font-size:8.5px}.z82-node span,.z82-mode span{font-size:7.3px}.z82-legend{gap:6px 10px}.z82-legend span{font-size:6.8px}}
      /* v0.8.3 mobile hierarchy and hydraulic-scheme corrections */
      .app{padding-bottom:calc(72px + env(safe-area-inset-bottom,0px))!important}
      .header{grid-template-columns:50px 1fr 50px!important;min-height:72px!important;padding:max(6px,env(safe-area-inset-top,0px)) 12px 6px!important}
      .rail{width:44px!important;height:44px!important;border-radius:14px!important;box-shadow:0 3px 12px rgba(0,0,0,.05)!important}
      .rail ha-icon{--mdc-icon-size:27px!important}.heading strong{font-size:21px!important}.heading span{margin-top:3px!important;font-size:12px!important}
      .bottom{padding:4px 7px calc(4px + env(safe-area-inset-bottom,0px))!important}.tab{min-height:54px!important;border-radius:12px!important;gap:3px!important;padding:3px 2px!important}.tab ha-icon{--mdc-icon-size:22px!important}.tab span{font-size:9.5px!important}
      .z82-system.attention{border-color:var(--divider-color,#ddd)}.z82-system.offline{border-color:var(--error-color,#db4437)}
      .z82-statuses{display:flex;flex-direction:column;align-items:flex-end;gap:6px}.z82-system.attention:not(.offline) .z82-online{color:var(--success-color,#43a047)!important;background:color-mix(in srgb,var(--success-color,#43a047) 10%,var(--card-background-color,#fff))!important}
      .z82-notice{display:flex;align-items:center;gap:5px;padding:5px 9px;border-radius:999px;background:color-mix(in srgb,var(--warning-color,#ff9800) 10%,var(--card-background-color,#fff));color:var(--warning-color,#ff9800);font-size:8px;font-weight:700;white-space:nowrap}.z82-notice i{width:6px;height:6px;border-radius:50%;background:currentColor}
      .z82-dot.on{background:var(--success-color,#24a148)}.z82-dot.off{background:var(--secondary-text-color,#aaa)}.z82-dot.ready{background:var(--primary-color,#087de0)}.z82-dot.problem{background:var(--warning-color,#ff9800)}
      .z82-row strong{white-space:nowrap}.z82-state:not(.on){color:var(--secondary-text-color,#666)}

      .z82-dhw-schematic{position:relative;height:220px;min-height:220px;overflow:hidden}.z82-dhw-schematic .z82-tank{position:absolute;left:13px;top:35px;width:58px;height:142px;overflow:visible}.z82-dhw-schematic .z82-water{max-height:86%}.z82-dhw-schematic .z82-port.hot{top:15px}.z82-dhw-schematic .z82-port.loop{top:84px}.z82-dhw-schematic .z82-port.cold{left:24px!important;right:auto!important;bottom:-6px}
      .z82-dhw-temperature{position:absolute;left:84px;top:87px;display:grid;grid-template-columns:16px auto 14px;gap:2px 4px;align-items:center;z-index:4}.z82-dhw-temperature ha-icon{grid-row:1/3;--mdc-icon-size:15px}.z82-dhw-temperature strong{font-size:13px;white-space:nowrap}.z82-dhw-temperature small{grid-column:2;font-size:8.5px;font-weight:650;white-space:nowrap}.z82-dhw-temperature .z82-dot{grid-column:3;grid-row:1/3;width:13px;height:13px}
      .z82-pipe{position:absolute;display:block;z-index:1;border-radius:3px}.z82-hot-pipe{left:70px;right:54px;top:50px;height:3px;background:#ed342d}.z82-loop-branch{left:67%;top:50px;width:3px;height:37px;background:#842197}.z82-loop-vertical{left:67%;top:87px;width:3px;height:47px;background:#842197}.z82-loop-return{left:70px;right:33%;top:131px;height:3px;background:#842197}.z82-cold-pipe{left:42px;right:54px;top:190px;height:3px;background:#117ed8}.z82-cold-pipe:before{content:"";position:absolute;left:0;bottom:0;width:3px;height:15px;background:#117ed8}
      .z82-flow-arrow{position:absolute;z-index:2;width:0;height:0}.z82-flow-arrow.hot{right:50px;top:46px;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:8px solid #ed342d}.z82-flow-arrow.loop{left:72px;top:127px;border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:8px solid #842197}.z82-flow-arrow.cold{left:46px;top:186px;border-top:5px solid transparent;border-bottom:5px solid transparent;border-right:8px solid #117ed8}
      .z82-hot-water,.z82-circulation-loop,.z82-cold-water{position:absolute;right:0;width:126px;z-index:3;display:grid;grid-template-columns:23px minmax(0,1fr);column-gap:5px;align-items:center}.z82-hot-water{top:9px;color:#ed342d}.z82-circulation-loop{top:77px;color:#842197}.z82-cold-water{bottom:0;color:#117ed8}.z82-hot-water ha-icon,.z82-circulation-loop ha-icon,.z82-cold-water ha-icon{grid-row:1/4;--mdc-icon-size:21px}.z82-hot-water span,.z82-circulation-loop span,.z82-cold-water span{font-size:7.5px;color:var(--secondary-text-color,#666);white-space:nowrap}.z82-hot-water strong,.z82-circulation-loop strong,.z82-cold-water strong{font-size:9.5px;color:var(--primary-text-color,#202124);white-space:nowrap}.z82-circulation-loop small{font-size:7.2px;color:var(--secondary-text-color,#777);white-space:nowrap}

      .z82-hydro-stage{height:30px;margin:36px 6% 40px}.z82-hydro{border-radius:9px;background:linear-gradient(#62686d,#454b50);box-shadow:0 2px 5px rgba(0,0,0,.12);gap:0}.z82-hydro strong{position:absolute;left:50%;transform:translateX(-50%);font-size:10.5px;letter-spacing:.035em;white-space:nowrap}.z82-hydro-values{position:absolute;right:9px;display:flex;align-items:center;gap:7px}.z82-hydro-values span{display:flex;align-items:center;gap:2px;font-size:8.5px;white-space:nowrap}.z82-hydro-values ha-icon{--mdc-icon-size:11px}.z82-hydro:before,.z82-hydro:after{top:8px;width:9px;height:14px;background:#4a5055;border-color:#34383c}.z82-hydro:before{left:-8px}.z82-hydro:after{right:-8px}.z82-air-vent{top:-16px;width:7px;height:16px;border-radius:2px 2px 0 0}.z82-connection{width:3px;height:29px}.z82-connection b{left:-3px;width:9px;height:9px}.z82-connection.down b,.z82-connection.up b{bottom:-4px}.z82-connection.down-bottom b,.z82-connection.up-bottom b{top:-4px}.z82-connection:after{left:-3px;border-left-width:4px;border-right-width:4px}.z82-connection.down:after,.z82-connection.down-bottom:after{border-top-width:6px;bottom:9px}.z82-connection.up:after,.z82-connection.up-bottom:after{border-bottom-width:6px;top:9px}

      .z82-legend{gap:7px 13px}.z82-legend b{width:11px;height:11px}.z82-legend b.on{background:var(--success-color,#24a148)}.z82-legend b.off{background:var(--secondary-text-color,#aaa)}.z82-legend b.problem{background:var(--warning-color,#ff9800)}
      .z82-node{min-height:88px;padding:9px 6px}.z82-node ha-icon{--mdc-icon-size:27px;margin:6px 0 4px}.z82-node.ready ha-icon,.z82-node.ready span{color:var(--primary-color,#087de0)}.z82-node.off ha-icon,.z82-node.off span{color:var(--secondary-text-color,#777)}.z82-node.problem{border-color:var(--warning-color,#ff9800)}

      @media(max-width:640px){.z82-equipment-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.z82-dhw-card{grid-column:1/-1}.z82-dhw-card header{min-height:32px}.z82-dhw-schematic{height:218px;min-height:218px}.z82-boiler-card{padding:10px}.z82-boiler-card h3{font-size:13px}.z82-row{font-size:9px}.z82-row strong{font-size:10px}}
      @media(max-width:520px){main{padding-top:9px!important}.header{grid-template-columns:46px 1fr 46px!important;min-height:68px!important;padding-left:9px!important;padding-right:9px!important}.rail{width:42px!important;height:42px!important}.heading strong{font-size:20px!important}.heading span{font-size:11px!important}.z82-system,.z82-section{padding:11px;border-radius:18px}.z82-head{gap:8px}.z82-head h1{font-size:23px}.z82-head p{font-size:10.5px}.z82-statuses{gap:4px}.z82-online{min-width:88px;padding:7px 8px}.z82-online strong{font-size:10px}.z82-online small{font-size:7px}.z82-notice{font-size:6.8px;padding:4px 7px}.z82-equipment{padding:9px;border-radius:15px}.z82-equipment h3{font-size:12px}.z82-equipment header>span,.z82-equipment h3 span{font-size:8px}.z82-boiler-visual{height:108px}.z82-boiler-art{width:59px;height:93px}.z82-boiler-art:before{left:20px}.z82-flame{--mdc-icon-size:19px}.z82-row{font-size:8.2px}.z82-row strong{font-size:9px}.z82-hydro-stage{height:27px;margin:32px 5% 35px}.z82-hydro strong{font-size:8.5px}.z82-hydro-values{right:6px;gap:4px}.z82-hydro-values span{font-size:6.7px}.z82-hydro-values ha-icon{--mdc-icon-size:9px}.z82-circuits-grid{gap:7px}.z82-circuit-card{padding:10px}.z82-circuit-card h3{font-size:10.5px}.z82-metrics,.z82-nodes,.z82-modes{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.z82-metric{min-height:72px;padding:8px;grid-template-columns:22px 1fr}.z82-metric span{font-size:8px}.z82-metric strong{font-size:11px}.z82-metric small{font-size:7.5px}.z82-node{min-height:80px}.z82-mode{min-height:88px;padding:7px}.z82-mode strong{font-size:9.5px}.z82-mode span{font-size:7.8px}.z82-legend{gap:5px 9px}.z82-legend span{font-size:6.8px}.tab{min-height:50px!important}.tab ha-icon{--mdc-icon-size:21px!important}.tab span{font-size:8.8px!important}}
      @media(max-width:380px){.z82-circuits-grid{grid-template-columns:1fr}.z82-hot-water,.z82-circulation-loop,.z82-cold-water{width:112px}.z82-dhw-temperature{left:79px}.z82-hydro strong{left:40%}}

      /* v0.8.4 — one-screen mobile system overview */
      .z82-notice{border:0;font:inherit;cursor:pointer}
      @media(max-width:640px){
        .z82-equipment-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
        .z82-dhw-card{grid-column:auto}
      }
      @media(max-width:520px){
        main{padding:6px 7px 18px!important}
        .z82-system{padding:8px;border-radius:16px;margin-bottom:11px}
        .z82-head{gap:5px}.z82-eyebrow{font-size:8px}.z82-head h1{font-size:20px;margin:4px 0 2px}.z82-head p{font-size:8.5px}
        .z82-statuses{gap:3px}.z82-online{min-width:77px;padding:5px 6px;grid-template-columns:7px auto;gap:1px 4px}.z82-online i{width:6px;height:6px}.z82-online strong{font-size:8.5px}.z82-online small{font-size:5.8px}.z82-notice{font-size:5.8px;padding:3px 6px}

        .z82-equipment-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin-top:9px}
        .z82-equipment{padding:5px;border-radius:11px}.z82-equipment header{min-height:27px}.z82-equipment h3{font-size:9.5px}.z82-equipment header>span,.z82-equipment h3 span{margin-top:2px;font-size:6.1px}
        .z82-boiler-visual{height:66px;gap:2px}.z82-boiler-art{width:39px;height:58px;border-radius:5px}.z82-boiler-art:before{left:14px;top:-5px;width:12px;height:5px}.z82-boiler-art i{left:5px;bottom:7px;width:18px;height:6px}.z82-boiler-art b{left:6px;bottom:7px;width:16px;font-size:4.3px;line-height:6px}.z82-mini-tank{right:3px;bottom:5px;width:12px;height:29px;border-radius:5px}.z82-flame{margin-top:15px;--mdc-icon-size:13px}.z82-boiler-visual .z82-dot{width:10px;height:10px;box-shadow:inset 0 0 0 3px #fff}
        .z82-rows{gap:2px}.z82-row{gap:2px;font-size:6.8px;line-height:1.05}.z82-row span:before{width:3px;height:3px;margin-right:2px;border-width:1px}.z82-row strong{font-size:7.6px}.z82-state{max-width:58%;overflow:hidden;text-overflow:ellipsis}

        .z82-dhw-card{grid-column:auto}.z82-dhw-card header{min-height:27px}.z82-dhw-schematic{height:133px;min-height:133px;overflow:hidden}
        .z82-dhw-schematic .z82-tank{left:2px;top:27px;width:35px;height:88px;border-radius:17px 17px 9px 9px}.z82-dhw-schematic .z82-tank:before{left:3px;right:3px;top:4px;height:6px}.z82-dhw-schematic .z82-water{left:4px;right:4px;bottom:4px}.z82-dhw-schematic .z82-port{right:-4px!important;width:6px!important;height:5px!important}.z82-dhw-schematic .z82-port.hot{top:8px}.z82-dhw-schematic .z82-port.loop{top:59px}.z82-dhw-schematic .z82-port.cold{left:14px!important;bottom:-4px}
        .z82-dhw-temperature{left:1px;right:1px;top:0;display:grid;grid-template-columns:10px minmax(0,1fr) 9px;gap:0 2px}.z82-dhw-temperature ha-icon{grid-row:1/3;--mdc-icon-size:9px}.z82-dhw-temperature strong{font-size:7.4px}.z82-dhw-temperature small{font-size:5.6px}.z82-dhw-temperature .z82-dot{width:8px;height:8px;box-shadow:inset 0 0 0 2px #fff}
        .z82-hot-pipe{left:37px;right:22px;top:35px;height:2px}.z82-loop-branch{left:64%;top:35px;width:2px;height:30px}.z82-loop-vertical{left:64%;top:65px;width:2px;height:27px}.z82-loop-return{left:37px;right:36%;top:90px;height:2px}.z82-cold-pipe{left:18px;right:22px;top:124px;height:2px}.z82-cold-pipe:before{width:2px;height:10px}
        .z82-flow-arrow.hot{right:18px;top:32px;border-top-width:4px;border-bottom-width:4px;border-left-width:6px}.z82-flow-arrow.loop{left:38px;top:87px;border-top-width:4px;border-bottom-width:4px;border-right-width:6px}.z82-flow-arrow.cold{left:20px;top:121px;border-top-width:4px;border-bottom-width:4px;border-right-width:6px}
        .z82-hot-water,.z82-circulation-loop,.z82-cold-water{right:-2px;width:52px;grid-template-columns:12px minmax(0,1fr);column-gap:1px}.z82-hot-water{top:24px}.z82-circulation-loop{top:59px}.z82-cold-water{bottom:-1px}.z82-hot-water ha-icon,.z82-circulation-loop ha-icon,.z82-cold-water ha-icon{--mdc-icon-size:11px}.z82-hot-water span,.z82-circulation-loop span,.z82-cold-water span{font-size:5.6px}.z82-hot-water strong,.z82-circulation-loop strong,.z82-cold-water strong{font-size:6.7px}.z82-circulation-loop small{font-size:5.1px;overflow:hidden;text-overflow:ellipsis}

        .z82-hydro-stage{height:23px;margin:25px 4% 29px}.z82-hydro{border-radius:7px}.z82-hydro strong{font-size:8px}.z82-hydro-values{right:4px;gap:3px}.z82-hydro-values span{font-size:5.6px}.z82-hydro-values ha-icon{--mdc-icon-size:7px}.z82-hydro:before,.z82-hydro:after{top:6px;width:7px;height:11px}.z82-hydro:before{left:-6px}.z82-hydro:after{right:-6px}.z82-air-vent{top:-12px;width:5px;height:12px}.z82-connection{width:2px;height:22px}.z82-connection b{left:-3px;width:7px;height:7px}.z82-connection.down b,.z82-connection.up b{bottom:-3px}.z82-connection.down-bottom b,.z82-connection.up-bottom b{top:-3px}.z82-connection:after{left:-3px;border-left-width:4px;border-right-width:4px}.z82-connection.down:after,.z82-connection.down-bottom:after{border-top-width:5px;bottom:7px}.z82-connection.up:after,.z82-connection.up-bottom:after{border-bottom-width:5px;top:7px}

        .z82-circuits-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.z82-circuit-card{padding:7px;border-radius:13px;display:flex;flex-direction:column}.z82-circuit-card h3{font-size:9px}.z82-circuit-icon{--mdc-icon-size:22px}.z82-circuit-device,.z82-mixer{gap:4px;margin-top:6px}.z82-pump-art{width:27px;height:27px}.z82-pump-art ha-icon{--mdc-icon-size:17px}.z82-circuit-device span,.z82-mixer span{font-size:6.4px}.z82-circuit-device strong,.z82-mixer strong{font-size:7.4px;margin-top:1px}.z82-mixer strong{white-space:normal;line-height:1.05;overflow:visible}.z82-mixer>ha-icon{--mdc-icon-size:25px}.z82-circuit-device .z82-dot,.z82-mixer .z82-dot{width:9px;height:9px;box-shadow:inset 0 0 0 2px #fff}.z82-circuit-values{margin-top:auto;padding-top:7px;gap:4px}.z82-circuit-values>div{gap:1px 5px}.z82-circuit-values span{font-size:6.2px}.z82-circuit-values strong{font-size:8.5px}.z82-circuit-values i{height:2px}

        .z82-legend{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px 5px;margin-top:7px;padding:5px 4px;border-radius:10px}.z82-legend span{justify-content:center;gap:3px;font-size:5.7px;white-space:nowrap}.z82-legend i{width:16px;height:2px}.z82-legend b{width:8px;height:8px;box-shadow:inset 0 0 0 2px #fff}
        .z82-metrics{grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin-top:7px}.z82-metric{min-height:56px;padding:4px;grid-template-columns:14px minmax(0,1fr);gap:1px 3px;border-radius:10px}.z82-metric ha-icon{--mdc-icon-size:15px}.z82-metric span{font-size:5.7px;line-height:1.05}.z82-metric strong{font-size:7.7px}.z82-metric small{font-size:5.5px}
        .z82-section{padding:9px;border-radius:16px}.z82-nodes,.z82-modes{gap:5px}.z82-node{min-height:68px}.z82-mode{min-height:76px}
      }
      @media(max-width:380px){
        .z82-equipment-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.z82-circuits-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.z82-hydro strong{left:39%}.z82-hot-water,.z82-circulation-loop,.z82-cold-water{width:47px}.z82-hot-water span,.z82-circulation-loop span,.z82-cold-water span{font-size:4.6px}.z82-hot-water strong,.z82-circulation-loop strong,.z82-cold-water strong{font-size:5.8px}
      }

      /* v0.8.5 — readability pass while retaining the one-screen topology */
      @media(max-width:520px){
        .z82-online{min-width:82px;padding:6px 7px}.z82-online strong{font-size:9.8px}.z82-online small{font-size:6.6px}.z82-notice{font-size:7px;padding:4px 7px}

        .z82-equipment{padding:7px}.z82-equipment header{min-height:31px}.z82-equipment h3{font-size:11px}.z82-equipment header>span,.z82-equipment h3 span{font-size:7.3px}
        .z82-boiler-visual{height:74px}.z82-boiler-art{width:44px;height:66px}.z82-boiler-art:before{left:15px;top:-6px;width:14px;height:6px}.z82-boiler-art i{left:6px;bottom:8px;width:20px;height:7px}.z82-boiler-art b{left:7px;bottom:8px;width:18px;font-size:4.8px;line-height:7px}.z82-mini-tank{width:14px;height:34px}.z82-flame{--mdc-icon-size:15px}.z82-boiler-visual .z82-dot{width:12px;height:12px}
        .z82-rows{gap:3px}.z82-row{font-size:7.8px;line-height:1.12}.z82-row span:before{width:4px;height:4px;margin-right:3px}.z82-row strong{font-size:8.9px}

        .z82-dhw-schematic{height:148px;min-height:148px}.z82-dhw-schematic .z82-tank{left:2px;top:30px;width:40px;height:100px}.z82-dhw-schematic .z82-port.hot{top:9px}.z82-dhw-schematic .z82-port.loop{top:67px}.z82-dhw-schematic .z82-port.cold{left:16px!important}
        .z82-dhw-temperature{top:1px;grid-template-columns:12px minmax(0,1fr) 10px;gap:0 3px}.z82-dhw-temperature ha-icon{--mdc-icon-size:11px}.z82-dhw-temperature strong{font-size:9.2px}.z82-dhw-temperature small{font-size:6.7px}.z82-dhw-temperature .z82-dot{width:9px;height:9px}
        .z82-hot-pipe{left:42px;right:24px;top:39px}.z82-loop-branch{left:64%;top:39px;height:35px}.z82-loop-vertical{left:64%;top:74px;height:27px}.z82-loop-return{left:42px;right:36%;top:99px}.z82-cold-pipe{left:21px;right:24px;top:140px}.z82-cold-pipe:before{height:11px}
        .z82-flow-arrow.hot{right:20px;top:36px}.z82-flow-arrow.loop{left:43px;top:96px}.z82-flow-arrow.cold{left:23px;top:137px}
        .z82-hot-water,.z82-circulation-loop,.z82-cold-water{right:-2px;width:56px;grid-template-columns:14px minmax(0,1fr);column-gap:2px}.z82-hot-water{top:27px}.z82-circulation-loop{top:67px}.z82-cold-water{bottom:0}.z82-hot-water ha-icon,.z82-circulation-loop ha-icon,.z82-cold-water ha-icon{--mdc-icon-size:13px}.z82-hot-water span,.z82-circulation-loop span,.z82-cold-water span{font-size:6.2px}.z82-hot-water strong,.z82-circulation-loop strong,.z82-cold-water strong{font-size:7.8px}.z82-circulation-loop small{font-size:6.3px}

        .z82-hydro-stage{height:25px;margin-top:27px;margin-bottom:31px}.z82-hydro strong{font-size:9.3px}.z82-hydro-values{gap:5px}.z82-hydro-values span{font-size:7px}.z82-hydro-values ha-icon{--mdc-icon-size:9px}

        .z82-circuit-card{padding:9px}.z82-circuit-card h3{font-size:10.5px}.z82-circuit-icon{--mdc-icon-size:26px}.z82-circuit-device,.z82-mixer{gap:6px;margin-top:8px}.z82-pump-art{width:32px;height:32px}.z82-pump-art ha-icon{--mdc-icon-size:20px}.z82-circuit-device span,.z82-mixer span{font-size:7.6px}.z82-circuit-device strong,.z82-mixer strong{font-size:9px}.z82-mixer strong{font-size:9.2px;line-height:1.12}.z82-mixer>ha-icon{--mdc-icon-size:29px}.z82-circuit-device .z82-dot,.z82-mixer .z82-dot{width:11px;height:11px}.z82-circuit-values{padding-top:9px;gap:6px}.z82-circuit-values span{font-size:7.5px}.z82-circuit-values strong{font-size:10.5px}.z82-circuit-values i{height:3px}

        .z82-legend{gap:6px 7px;padding:7px 5px}.z82-legend span{gap:4px;font-size:7.1px}.z82-legend i{width:20px;height:3px}.z82-legend b{width:10px;height:10px}
        .z82-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px}.z82-metric{min-height:62px;padding:7px;grid-template-columns:20px minmax(0,1fr);gap:1px 5px;border-radius:12px}.z82-metric ha-icon{--mdc-icon-size:20px}.z82-metric span{font-size:8px;line-height:1.1}.z82-metric strong{font-size:11px}.z82-metric small{font-size:7.4px}
      }
      @media(max-width:380px){
        .z82-equipment h3{font-size:10px}.z82-row{font-size:7.1px}.z82-row strong{font-size:8px}.z82-hot-water,.z82-circulation-loop,.z82-cold-water{width:50px}.z82-hot-water span,.z82-circulation-loop span,.z82-cold-water span{font-size:5.5px}.z82-hot-water strong,.z82-circulation-loop strong,.z82-cold-water strong{font-size:7px}.z82-circulation-loop small{font-size:5.6px}
      }

      /* v0.8.6 — light hydraulic separator and fuller use of vertical space */
      .z82-hydro{box-sizing:border-box;border:1px solid #c9c9c9;background:linear-gradient(115deg,#ececec 0,#fff 44%,#dedede);box-shadow:0 4px 10px rgba(0,0,0,.09);color:var(--primary-text-color,#202124)}
      .z82-hydro-values{color:var(--secondary-text-color,#666)}
      .z82-hydro:before,.z82-hydro:after{box-sizing:border-box;border-color:#b8b8b8;background:linear-gradient(115deg,#e6e6e6,#fff 48%,#d7d7d7)}
      @media(max-width:520px){
        .z82-boiler-visual{height:84px}.z82-boiler-art{width:47px;height:73px}.z82-boiler-art:before{left:16px;top:-6px;width:15px;height:6px}.z82-boiler-art i{left:6px;bottom:9px;width:21px;height:7px}.z82-boiler-art b{left:7px;bottom:9px;width:19px}.z82-mini-tank{right:4px;bottom:7px;width:15px;height:38px}.z82-flame{margin-top:18px;--mdc-icon-size:17px}
        .z82-dhw-schematic .z82-tank{top:26px;height:106px}.z82-dhw-schematic .z82-port.loop{top:71px}.z82-hot-pipe{top:35px}.z82-loop-branch{top:35px;height:38px}.z82-loop-vertical{top:73px;height:31px}.z82-loop-return{top:102px}.z82-cold-pipe{top:142px}.z82-flow-arrow.hot{top:32px}.z82-flow-arrow.loop{top:99px}.z82-flow-arrow.cold{top:139px}.z82-hot-water{top:23px}.z82-circulation-loop{top:67px}
        .z82-hydro-stage{height:29px;margin-top:27px;margin-bottom:31px}.z82-hydro{border-radius:8px}.z82-hydro:before,.z82-hydro:after{top:7px;height:15px}.z82-hydro strong{font-size:9.5px}.z82-hydro-values span{font-size:7.2px}
      }

      /* v0.8.7 — readable operational typography on wide screens */
      @media(min-width:521px){
        .z82-equipment header{min-height:44px}.z82-equipment h3{font-size:17px}.z82-equipment header>span,.z82-equipment h3 span{font-size:12px}.z82-row{font-size:12px}.z82-row strong{font-size:13.5px}.z82-rows{gap:8px}
        .z82-dhw-temperature{grid-template-columns:21px auto 19px;gap:2px 7px}.z82-dhw-temperature ha-icon{--mdc-icon-size:19px}.z82-dhw-temperature strong{font-size:18px}.z82-dhw-temperature small{font-size:11.5px}.z82-dhw-temperature .z82-dot{width:16px;height:16px}
        .z82-hot-water,.z82-circulation-loop,.z82-cold-water{width:144px;grid-template-columns:25px minmax(0,1fr);column-gap:7px}.z82-hot-water ha-icon,.z82-circulation-loop ha-icon,.z82-cold-water ha-icon{--mdc-icon-size:23px}.z82-hot-water span,.z82-circulation-loop span,.z82-cold-water span{font-size:10px}.z82-hot-water strong,.z82-circulation-loop strong,.z82-cold-water strong{font-size:12.5px}.z82-circulation-loop small{font-size:9.5px}
        .z82-hydro strong{font-size:14px}.z82-hydro-values{right:14px;gap:11px}.z82-hydro-values span{font-size:11px}.z82-hydro-values ha-icon{--mdc-icon-size:13px}
        .z82-circuit-card h3{font-size:17px}.z82-circuit-icon{--mdc-icon-size:35px}.z82-circuit-device span,.z82-mixer span{font-size:11.5px}.z82-circuit-device strong,.z82-mixer strong{font-size:13.5px}.z82-circuit-device .z82-dot,.z82-mixer .z82-dot{width:15px;height:15px}.z82-circuit-values span{font-size:11px}.z82-circuit-values strong{font-size:14px}
        .z82-legend span{font-size:10.5px}.z82-metric span{font-size:10.5px}.z82-metric strong{font-size:14px}.z82-metric small{font-size:10px}
      }
      /* v0.8.9 — connection state must not inherit the general warning colour */
      .z82-online.online{color:var(--success-color,#43a047)!important;background:color-mix(in srgb,var(--success-color,#43a047) 10%,var(--card-background-color,#fff))!important}
      .z82-online.unknown{color:var(--warning-color,#ff9800)!important;background:color-mix(in srgb,var(--warning-color,#ff9800) 10%,var(--card-background-color,#fff))!important}
      .z82-online.offline{color:var(--error-color,#db4437)!important;background:color-mix(in srgb,var(--error-color,#db4437) 10%,var(--card-background-color,#fff))!important}

      /* v0.8.10 — readable mobile hydroseparator and a stable DHW schematic */
      @media(max-width:520px){
        .z82-equipment-grid{grid-template-columns:minmax(0,.92fr) minmax(0,.92fr) minmax(0,1.16fr)}
        .z82-boiler-card{padding-left:6px;padding-right:6px}.z82-dhw-card{padding-left:6px;padding-right:6px}

        .z82-dhw-schematic{height:154px;min-height:154px}.z82-dhw-schematic .z82-tank{left:1px;top:27px;width:38px;height:110px}.z82-dhw-schematic .z82-port.hot{top:9px}.z82-dhw-schematic .z82-port.loop{top:73px}.z82-dhw-schematic .z82-port.cold{left:15px!important}
        .z82-dhw-temperature{left:1px;right:1px;top:0;grid-template-columns:12px minmax(0,1fr) 10px;gap:0 3px}.z82-dhw-temperature ha-icon{--mdc-icon-size:11px}.z82-dhw-temperature strong{font-size:9.6px}.z82-dhw-temperature small{font-size:7px}.z82-dhw-temperature .z82-dot{width:9px;height:9px}
        .z82-hot-pipe{left:39px;right:7px;top:38px;height:2px}.z82-loop-branch{left:46%;top:38px;width:2px;height:39px}.z82-loop-vertical{left:46%;top:77px;width:2px;height:31px}.z82-loop-return{left:39px;right:54%;top:106px;height:2px}.z82-cold-pipe{left:18px;right:7px;top:147px;height:2px}.z82-cold-pipe:before{width:2px;height:12px}
        .z82-flow-arrow.hot{right:3px;top:35px}.z82-flow-arrow.loop{left:40px;top:103px}.z82-flow-arrow.cold{left:20px;top:144px}
        .z82-hot-water,.z82-circulation-loop,.z82-cold-water{right:-1px;width:61px;grid-template-columns:14px minmax(0,1fr);column-gap:3px;z-index:5}.z82-hot-water{top:27px}.z82-circulation-loop{top:68px}.z82-cold-water{bottom:-1px}.z82-hot-water ha-icon,.z82-circulation-loop ha-icon,.z82-cold-water ha-icon{position:relative;z-index:2;--mdc-icon-size:14px;background:var(--card-background-color,#fff);border-radius:50%}.z82-hot-water span,.z82-circulation-loop span,.z82-cold-water span,.z82-hot-water strong,.z82-circulation-loop strong,.z82-cold-water strong,.z82-circulation-loop small{position:relative;z-index:2;background:var(--card-background-color,#fff);line-height:1.05}.z82-hot-water span,.z82-circulation-loop span,.z82-cold-water span{font-size:6.8px}.z82-hot-water strong,.z82-circulation-loop strong,.z82-cold-water strong{font-size:8.5px}.z82-circulation-loop small{font-size:6.6px}

        .z82-hydro-stage{height:32px;margin-top:29px;margin-bottom:34px}.z82-hydro{border-radius:9px}.z82-hydro strong{left:42%;font-size:11px;font-weight:800;letter-spacing:.025em}.z82-hydro-values{right:7px;gap:5px;color:#40464b;font-weight:650}.z82-hydro-values span{font-size:9.2px;gap:2px}.z82-hydro-values ha-icon{--mdc-icon-size:11px}.z82-hydro:before,.z82-hydro:after{top:8px;height:16px}
      }

      /* v0.8.11 — physical pump symbols and clean DHW callouts */
      .z82-loop-pump{position:absolute;left:67%;top:105px;z-index:7;width:28px;height:28px;box-sizing:border-box;transform:translate(-50%,-50%);display:grid;place-items:center;border:2px solid currentColor;border-radius:50%;background:#171717;color:#842197;box-shadow:0 0 0 2px var(--card-background-color,#fff)}.z82-loop-pump ha-icon{--mdc-icon-size:18px}.z82-loop-pump.off{color:var(--secondary-text-color,#888)}.z82-loop-pump.ready{color:var(--primary-color,#087de0)}.z82-loop-pump.problem{color:var(--warning-color,#ff9800)}
      .z82-pump-art.off{color:var(--secondary-text-color,#777)}.z82-pump-art.ready{color:var(--primary-color,#087de0)}.z82-pump-art.problem{color:var(--warning-color,#ff9800)}
      .z82-circulation-loop{box-sizing:border-box;grid-template-columns:minmax(0,1fr);padding-left:35px}
      .z82-hot-water:before,.z82-circulation-loop:before,.z82-cold-water:before{content:"";position:absolute;top:-2px;right:-2px;bottom:-2px;z-index:1;border-radius:4px;background:var(--card-background-color,#fff);pointer-events:none}.z82-hot-water:before,.z82-cold-water:before{left:26px}.z82-circulation-loop:before{left:33px}.z82-hot-water>*,.z82-circulation-loop>*,.z82-cold-water>*{position:relative;z-index:2}
      @media(max-width:520px){
        .z82-loop-pump{left:46%;top:92px;width:20px;height:20px;border-width:1.5px;box-shadow:0 0 0 1.5px var(--card-background-color,#fff)}.z82-loop-pump ha-icon{--mdc-icon-size:13px}
        .z82-circulation-loop{grid-template-columns:minmax(0,1fr);padding-left:20px}.z82-hot-water:before,.z82-cold-water:before{left:16px}.z82-circulation-loop:before{left:18px}
      }

      /* v0.8.12 — HACS-packaged equipment artwork with live overlays */
      .z82-boiler-art{border:0;background:transparent url("${BOILER_CASING_IMAGE}") center/100% 100% no-repeat;box-shadow:0 6px 13px rgba(0,0,0,.08)}
      .z82-boiler-art:before{display:none}
      .z82-dhw-schematic .z82-tank{border:0;background:transparent;box-shadow:none}
      .z82-dhw-schematic .z82-tank:before{content:"";display:block;position:absolute;inset:0;width:auto;height:auto;border-radius:0;background:transparent url("${DHW_SHELL_IMAGE}") center/100% 100% no-repeat;z-index:3;pointer-events:none}
      .z82-dhw-schematic .z82-water{left:24%;right:24%;bottom:16%;max-height:59%;z-index:1;border-radius:3px 3px 8px 8px}

      /* v0.8.13 — tighter equipment crop, calmer DHW loop and balanced circuit cards */
      .z82-circuit-type{display:flex;align-items:center;gap:8px;margin-top:16px;color:var(--secondary-text-color,#666)}
      .z82-circuit-type>ha-icon{--mdc-icon-size:34px}.z82-circuit-type>div{min-width:0;flex:1}.z82-circuit-type span,.z82-circuit-type strong{display:block;font-size:9px}.z82-circuit-type strong{font-size:10px;margin-top:2px;color:var(--primary-text-color,#222)}
      @media(max-width:520px){
        .z82-boiler-visual{height:91px}.z82-boiler-art{width:54px;height:82px}.z82-flame{margin-top:20px;--mdc-icon-size:18px}.z82-mini-tank{right:5px;bottom:8px;width:17px;height:42px}.z82-boiler-art i{left:8px;bottom:10px;width:24px}.z82-boiler-art b{left:9px;bottom:10px;width:22px}
        .z82-dhw-schematic{height:158px;min-height:158px}.z82-dhw-schematic .z82-tank{left:0;top:25px;width:44px;height:116px}.z82-dhw-schematic .z82-port.hot{top:10px}.z82-dhw-schematic .z82-port.loop{top:76px}.z82-dhw-schematic .z82-port.cold{left:18px!important}
        .z82-hot-pipe{left:45px;top:38px}.z82-loop-branch{left:52%;top:38px;height:42px}.z82-loop-vertical{left:52%;top:80px;height:32px}.z82-loop-return{left:45px;right:48%;top:110px}.z82-cold-pipe{left:21px;top:152px}.z82-flow-arrow.loop{left:46px;top:107px}.z82-flow-arrow.cold{left:23px;top:149px}
        .z82-loop-pump{left:52%;top:94px;width:17px;height:17px;border-width:1.5px}.z82-loop-pump ha-icon{--mdc-icon-size:11px}.z82-hot-water{top:26px}.z82-circulation-loop{top:70px}.z82-cold-water{bottom:-1px}
        .z82-circuit-type{gap:6px;margin-top:8px}.z82-circuit-type>ha-icon{--mdc-icon-size:29px}.z82-circuit-type span{font-size:7.6px}.z82-circuit-type strong{font-size:9.2px;margin-top:1px}
      }

      /* v0.8.15 — one transform-owned canvas; browser scroll/zoom is never gesture state */
      .app{height:100dvh;min-height:0!important;overflow:hidden;padding-bottom:0!important}.z15-canvas-viewport{position:relative;padding:0!important;overflow:hidden!important;overscroll-behavior:none!important;overflow-anchor:none!important;touch-action:none!important;-webkit-overflow-scrolling:auto!important}.z15-canvas-viewport>#zont-canvas-stage{position:relative;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;overflow:hidden!important}.z15-canvas-viewport #zont-canvas-surface{position:absolute;top:0;left:0;box-sizing:border-box;padding:14px 16px 28px;transform-origin:0 0!important;will-change:transform;overflow-anchor:none!important}
      .z15-canvas-toast{position:absolute;z-index:30;left:50%;top:14px;transform:translate(-50%,-8px);opacity:0;pointer-events:none;white-space:nowrap;padding:8px 12px;border-radius:999px;color:var(--primary-text-color,#202124);background:color-mix(in srgb,var(--card-background-color,#fff) 94%,transparent);border:1px solid color-mix(in srgb,var(--primary-text-color,#202124) 12%,transparent);box-shadow:0 6px 20px rgba(0,0,0,.16);backdrop-filter:blur(14px);font:700 12px/1 system-ui;transition:opacity .16s ease,transform .16s ease}.z15-canvas-toast.visible{opacity:1;transform:translate(-50%,0)}
      @media(max-width:520px){.z15-canvas-viewport #zont-canvas-surface{padding:9px 8px 24px}}@media(prefers-reduced-motion:reduce){.z15-canvas-toast{transition:none}}
      `;
      root.appendChild(style);
    }

    const menu = root.getElementById("back");
    if (menu) {
      const icon = menu.querySelector("ha-icon");
      if (icon) icon.setAttribute("icon", "mdi:menu");
      menu.setAttribute("aria-label", "Меню Home Assistant");
      menu.onclick = () => this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }));
    }

    const diagnostics = root.querySelector("[data-open-diagnostics]");
    if (diagnostics) diagnostics.onclick = () => this._selectTab("diagnostics");

    const heading = root.querySelector(".heading span");
    if (heading) {
      const base = String(heading.textContent || "Отопление и ГВС").replace(/\s*·\s*UI\s*v?[0-9.]+\s*$/i, "");
      heading.textContent = `${base} · UI v${UI_VERSION}`;
    }
    const statesLabel = root.querySelector('button[data-tab="states"] span');
    if (statesLabel) statesLabel.textContent = "Состояние";
    this._installCanvasV0815(root);
    return result;
  };

  ElementClass.prototype.__zontV0816 = true;
  refreshLivePanels();
  return true;
}

if (!installV0816()) customElements.whenDefined(ELEMENT_NAME).then(() => installV0816());
