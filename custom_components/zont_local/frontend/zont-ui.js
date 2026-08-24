// ZONT UI v0.8.1 — HACS-managed application layer.
// Base renderer is provided by Contract Generated UI.
import "/contract_generated_ui/frontend/nikas-generated-zont.js";

const ELEMENT_NAME = "nikas-generated-zont";
const esc = (v) => String(v ?? "—")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

function installV081() {
  const C = customElements.get(ELEMENT_NAME);
  if (!C || C.prototype.__zontV081) return false;
  const originalRender = C.prototype._render;
  if (typeof originalRender !== "function") return false;

  C.prototype._systemOverviewV081 = function(items) {
    const main = this._boilerSet(items, false);
    const radiators = this._findState(items, ["радиатор"], ["температур", "t°", ">>>", "<<<", "датчик"]);
    const floor = this._findState(items, ["тёпл", "тепл", "floor"], ["температур", "t°", ">>>", "<<<", "датчик"]);
    const circulation = this._findState(items, ["циркуляц"], ["температур", "t°", "гвс"]);
    const reserve = this._findState(items, ["резерв", "reserve"], ["температур", "t°", "котел", "котёл", "ошиб"]);
    const dhw = this._find(items, ["гвс", "dhw", "горяч"], ["циркуляц", "режим", "кнопк", "button"]);
    const outdoor = this._find(items, ["улиц", "outdoor", "вне дома", "weather"], ["влаж", "humidity"]);
    const indoor = this._find(items, ["гостиная", "комнат", "в доме", "indoor"], ["влаж", "humidity", "целев", "target"]);
    const online = this._find(items, ["online", "подключ", "controller online"]);
    const errors = items.filter((i) => this._role(i) === "error" && !this._isInactive(i));
    const problems = items.filter((i) => this._isProblem(i) && !["rssi", "battery"].includes(this._role(i)));
    const attention = errors.length > 0 || problems.length > 0;
    const mode = this._currentMode(items);
    const onlineText = online ? (this._isProblem(online) ? "Нет данных" : "Онлайн") : "Онлайн";
    const val = (item, fallback = "—") => item ? this._value(item) : fallback;
    const state = (item, fallback = "Нет данных") => item ? this._stateText(item) : fallback;
    const active = (item) => !!item && this._isActive(item);

    const modes = this._modeButtons(items);
    const modeButtons = modes.length ? modes.slice(0,4).map((item, idx) => {
      const labels = ["Отопление", "Эконом", "Лето (ГВС)", "Выключено"];
      const icons = ["mdi:home-thermometer-outline", "mdi:leaf", "mdi:water-outline", "mdi:power"];
      const label = this._modeLabel(item) || labels[idx] || "Режим";
      return `<button class="z81-mode ${this._modeActive(item, mode) ? "selected" : ""}" data-mode-entity="${esc(item.entry.entity_id)}" data-mode-label="${esc(label)}" ${this._busyMode === item.entry.entity_id ? "disabled" : ""}>
        <ha-icon icon="${icons[idx] || "mdi:radiator"}"></ha-icon><strong>${esc(label)}</strong><span>${this._modeActive(item, mode) ? "Сейчас активен" : "Доступен"}</span>
      </button>`;
    }).join("") : `<div class="empty">Режимы ZONT не найдены.</div>`;

    const statusCard = (label, item, icon, note = "") => `<div class="z81-status ${active(item) ? "on" : ""} ${item && this._isProblem(item) ? "problem" : ""}">
      <strong>${esc(label)}</strong><ha-icon icon="${icon}"></ha-icon><b>${esc(state(item))}</b>${note ? `<span>${esc(note)}</span>` : ""}
    </div>`;

    return `<div class="z81-card ${attention ? "attention" : ""}">
      <div class="z81-head">
        <div><span class="z81-eyebrow">СОСТОЯНИЕ СИСТЕМЫ</span><h1>${attention ? "Требует внимания" : "Система работает"}</h1><p>${attention ? "Есть ошибка или недоступный источник" : "Отопление и ГВС в норме"}</p></div>
        <div class="z81-online"><i></i><strong>${esc(onlineText)}</strong><small>Данные актуальны</small></div>
      </div>
      <div class="z81-plant">
        <div class="z81-pipe hot h1"></div><div class="z81-pipe hot h2"></div><div class="z81-pipe hot h3"></div>
        <div class="z81-pipe cold c1"></div><div class="z81-pipe cold c2"></div><div class="z81-pipe cold c3"></div>
        <div class="z81-unit boiler"><span>Котёл</span><div class="z81-boiler-art"><i></i><b>●</b></div><strong>${esc(val(main.current || main.supply))}</strong><small>${esc(state(main.state, "Нагрев"))}</small></div>
        <div class="z81-circuits"><div class="z81-circuits-title"><span>Контуры отопления</span><strong>${[radiators,floor].filter(Boolean).length || "—"}</strong><small>Активно</small></div>
          <div class="z81-circuit"><span>Контур 1 · Радиаторы</span><strong>${esc(val(main.supply))}</strong><i><b style="width:${active(radiators) ? 72 : 12}%"></b></i></div>
          <div class="z81-circuit"><span>Контур 2 · Тёплый пол</span><strong>${esc(val(main.ret))}</strong><i><b style="width:${active(floor) ? 58 : 12}%"></b></i></div>
        </div>
        <div class="z81-unit dhw"><span>ГВС</span><div class="z81-tank-art"><i></i></div><strong>${esc(val(dhw))}</strong><small>${esc(state(dhw, "Готов"))}</small></div>
        <div class="z81-pump"><ha-icon icon="mdi:pump"></ha-icon><strong>Циркуляция</strong><span>${esc(state(circulation))}</span></div>
      </div>
      <div class="z81-metrics">
        <div><ha-icon icon="mdi:home-thermometer-outline"></ha-icon><span>Режим</span><strong>${esc(mode)}</strong><small>${attention ? "Проверить" : "Активен"}</small></div>
        <div><ha-icon icon="mdi:thermometer"></ha-icon><span>Температура в доме</span><strong>${esc(val(indoor))}</strong><small>Норма</small></div>
        <div><ha-icon icon="mdi:weather-partly-cloudy"></ha-icon><span>Уличная температура</span><strong>${esc(val(outdoor))}</strong></div>
        <div><ha-icon icon="mdi:gauge"></ha-icon><span>Давление системы</span><strong>${esc(val(main.pressure))}</strong><small>Норма</small></div>
      </div>
    </div>
    <section class="z81-section"><span class="z81-eyebrow">ОСНОВНЫЕ УЗЛЫ</span><div class="z81-statuses">${statusCard("Радиаторы", radiators, "mdi:radiator")}${statusCard("Тёплый пол", floor, "mdi:heating-coil")}${statusCard("Циркуляция", circulation, "mdi:pump")}${statusCard("Резерв", reserve, "mdi:water-boiler-off", "Резервный котёл")}</div></section>
    <section class="z81-section"><span class="z81-eyebrow">ТЕКУЩИЙ РЕЖИМ</span><div class="z81-modes">${modeButtons}</div></section>`;
  };

  C.prototype._states = function(items) { return this._systemOverviewV081(items); };
  C.prototype._render = function(...args) {
    const result = originalRender.apply(this, args);
    const root = this.shadowRoot;
    if (!root) return result;
    if (!root.getElementById("zont-v081-style")) {
      const style = document.createElement("style");
      style.id = "zont-v081-style";
      style.textContent = `
      .header{grid-template-columns:64px 1fr 64px!important;min-height:92px!important;padding:max(10px,env(safe-area-inset-top,0px)) 20px 10px!important;border-bottom:1px solid var(--divider-color,#e5e5e5)!important;box-shadow:none!important}.rail{width:52px!important;height:52px!important;border-radius:16px!important;background:var(--card-background-color,#fff)!important;box-shadow:0 6px 20px rgba(0,0,0,.06)!important}.rail ha-icon{--mdc-icon-size:31px!important}#back{justify-self:start}#refresh{justify-self:end;color:var(--primary-color,#009fc2)!important}.heading strong{font-size:24px!important;font-weight:760!important}.heading span{margin-top:5px!important;font-size:14px!important;color:var(--secondary-text-color,#666)!important}
      .z81-card,.z81-section{background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#ddd);border-radius:22px;padding:16px;margin-bottom:16px}.z81-card.attention{border-color:var(--warning-color,#ff9800)}.z81-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.z81-eyebrow{font-size:10.5px;font-weight:760;letter-spacing:.14em;color:var(--secondary-text-color,#666)}.z81-head h1{font-size:29px;line-height:1.04;margin:7px 0 4px}.z81-head p{margin:0;color:var(--secondary-text-color,#666);font-size:14px}.z81-online{min-width:112px;display:grid;grid-template-columns:9px auto;gap:2px 7px;align-items:center;padding:10px 12px;border-radius:999px;background:color-mix(in srgb,var(--success-color,#43a047) 10%,#fff);color:var(--success-color,#43a047)}.z81-online i{width:8px;height:8px;border-radius:50%;background:currentColor}.z81-online strong{font-size:12px}.z81-online small{grid-column:1/3;text-align:center;font-size:8.5px;color:var(--secondary-text-color,#777)}
      .z81-plant{position:relative;display:grid;grid-template-columns:1fr 1.35fr 1fr;gap:10px;align-items:center;min-height:310px;margin-top:16px;padding:16px 8px 46px;border:1px solid var(--divider-color,#ddd);border-radius:20px;background:color-mix(in srgb,var(--secondary-background-color,#f3f3f3) 52%,#fff);overflow:hidden}.z81-unit,.z81-circuits{position:relative;z-index:3}.z81-unit{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px}.z81-unit>span,.z81-circuits-title>span{font-size:11px;font-weight:650}.z81-unit>strong{font-size:17px}.z81-unit>small{font-size:10px;color:var(--secondary-text-color,#777)}
      .z81-boiler-art{width:74px;height:118px;border-radius:7px;background:linear-gradient(#fff,#ececec);border:1px solid #d8d8d8;box-shadow:0 8px 15px rgba(0,0,0,.08);position:relative;margin:8px 0}.z81-boiler-art:before{content:"";position:absolute;width:24px;height:7px;top:-7px;left:25px;border-radius:4px 4px 0 0;background:#777}.z81-boiler-art i{position:absolute;left:21px;right:21px;bottom:22px;height:15px;border-radius:3px;background:#283b3a}.z81-boiler-art b{position:absolute;right:-8px;bottom:24px;width:22px;height:22px;border-radius:50%;background:var(--success-color,#43a047);color:#fff;font-size:9px;display:grid;place-items:center}.z81-tank-art{width:66px;height:120px;border-radius:30px 30px 14px 14px;background:linear-gradient(90deg,#eee,#fff 35%,#ddd);border:1px solid #ccc;position:relative;margin:8px 0;overflow:hidden}.z81-tank-art:before{content:"";position:absolute;left:8px;right:8px;bottom:8px;height:58%;border-radius:0 0 11px 11px;background:linear-gradient(#8bd1ee,#2196d2)}.z81-tank-art i{position:absolute;left:5px;right:5px;top:7px;height:9px;border-radius:50%;background:#555}
      .z81-circuits{display:flex;flex-direction:column;gap:10px}.z81-circuits-title{text-align:center}.z81-circuits-title strong{display:block;font-size:21px;margin-top:3px}.z81-circuits-title small{font-size:9px;color:var(--secondary-text-color,#777)}.z81-circuit{padding:10px;border:1px solid var(--divider-color,#ddd);border-radius:14px;background:var(--card-background-color,#fff);display:grid;grid-template-columns:1fr auto;gap:6px}.z81-circuit span{font-size:9px}.z81-circuit strong{font-size:14px}.z81-circuit i{grid-column:1/3;height:5px;border-radius:5px;background:#e5e5e5;overflow:hidden}.z81-circuit i b{display:block;height:100%;background:#f39c12;border-radius:5px}
      .z81-pipe{position:absolute;z-index:1;border-radius:8px}.z81-pipe.hot{height:5px;background:#e64b47}.z81-pipe.cold{height:5px;background:#2d91c7}.z81-pipe.h1{left:16%;right:51%;top:54%}.z81-pipe.h2{left:48%;right:17%;top:54%}.z81-pipe.h3{width:5px;height:22%;right:17%;top:54%}.z81-pipe.c1{left:16%;right:51%;bottom:18%}.z81-pipe.c2{left:48%;right:17%;bottom:18%}.z81-pipe.c3{width:5px;height:18%;left:16%;bottom:18%}.z81-pump{position:absolute;z-index:4;left:50%;bottom:10px;transform:translateX(-50%);display:grid;grid-template-columns:28px auto;gap:0 6px;align-items:center;padding:7px 11px;border-radius:12px;background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#ddd)}.z81-pump ha-icon{grid-row:1/3;color:var(--success-color,#43a047)}.z81-pump strong{font-size:10.5px}.z81-pump span{font-size:9px;color:var(--secondary-text-color,#777)}
      .z81-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.z81-metrics>div{min-height:88px;border:1px solid var(--divider-color,#ddd);border-radius:15px;padding:9px;display:grid;grid-template-columns:25px 1fr;align-content:center;gap:2px 6px}.z81-metrics ha-icon{grid-row:1/4;align-self:center;color:var(--secondary-text-color,#666)}.z81-metrics span{font-size:9px;color:var(--secondary-text-color,#777)}.z81-metrics strong{font-size:13px;line-height:1.12}.z81-metrics small{font-size:8.5px;color:var(--success-color,#43a047)}
      .z81-statuses,.z81-modes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.z81-status{min-height:126px;border:1px solid var(--divider-color,#ddd);border-radius:16px;padding:11px 6px;display:flex;flex-direction:column;align-items:center;text-align:center}.z81-status>strong{font-size:10.5px}.z81-status ha-icon{--mdc-icon-size:34px;margin:10px 0 7px;color:var(--secondary-text-color,#666)}.z81-status b{font-size:10px;font-weight:650;color:var(--secondary-text-color,#666)}.z81-status span{font-size:8.5px;color:var(--secondary-text-color,#777);margin-top:6px}.z81-status.on ha-icon,.z81-status.on b{color:var(--success-color,#43a047)}.z81-status.problem{border-color:var(--warning-color,#ff9800)}.z81-mode{min-height:118px;border:1px solid var(--divider-color,#ddd);border-radius:16px;background:var(--card-background-color,#fff);color:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:8px}.z81-mode ha-icon{--mdc-icon-size:32px;color:var(--secondary-text-color,#666)}.z81-mode strong{font-size:10.5px}.z81-mode span{font-size:8.5px;color:var(--secondary-text-color,#777)}.z81-mode.selected{border-color:var(--primary-color,#009fc2);background:color-mix(in srgb,var(--primary-color,#009fc2) 7%,#fff)}.z81-mode.selected ha-icon,.z81-mode.selected span{color:var(--primary-color,#009fc2)}
      @media(max-width:420px){main{padding-top:12px!important}.header{grid-template-columns:58px 1fr 58px!important;min-height:86px!important;padding-left:12px!important;padding-right:12px!important}.rail{width:48px!important;height:48px!important}.heading strong{font-size:22px!important}.heading span{font-size:12.5px!important}.z81-card,.z81-section{padding:13px;border-radius:19px}.z81-head h1{font-size:25px}.z81-online{min-width:94px;padding:8px 9px}.z81-plant{min-height:292px;padding-left:5px;padding-right:5px;gap:5px}.z81-boiler-art{width:62px;height:104px}.z81-tank-art{width:57px;height:105px}.z81-circuit{padding:8px}.z81-metrics{grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}.z81-metrics>div{padding:6px;grid-template-columns:19px 1fr}.z81-metrics ha-icon{--mdc-icon-size:20px}.z81-metrics span{font-size:7.8px}.z81-metrics strong{font-size:11px}.z81-statuses,.z81-modes{gap:5px}.z81-status,.z81-mode{min-height:108px;padding:7px 3px}.z81-status ha-icon,.z81-mode ha-icon{--mdc-icon-size:29px}.z81-status>strong,.z81-mode strong{font-size:9.5px}}
      `;
      root.appendChild(style);
    }
    const menu = root.getElementById("back");
    if (menu) {
      const icon = menu.querySelector("ha-icon");
      if (icon) icon.setAttribute("icon", "mdi:menu");
      menu.querySelector(".back-label")?.remove();
      menu.setAttribute("aria-label", "Меню Home Assistant");
      menu.onclick = () => this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }));
    }
    const heading = root.querySelector(".heading span");
    if (heading) {
      const base = String(heading.textContent || "Отопление и ГВС").replace(/\s*·\s*UI\s*v?[0-9.]+\s*$/i, "");
      heading.textContent = `${base} · UI v0.8.1`;
    }
    return result;
  };
  C.prototype.__zontV081 = true;
  return true;
}
if (!installV081()) customElements.whenDefined(ELEMENT_NAME).then(() => installV081());
