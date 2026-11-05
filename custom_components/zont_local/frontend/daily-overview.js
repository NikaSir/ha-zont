// Read-only daily views. The shared shell remains the only viewport owner.
(() => {
  const Panel = customElements.get("zont-local-panel");
  const p = Panel.prototype;
  const escape = (v) => String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const number = (v) => v !== null && v !== undefined && String(v).trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null;
  const unavailable = (s) => !s || ["unknown", "unavailable"].includes(s.state);
  const tabs = [
    {id:"overview", label:"Обзор", icon:"mdi:home-outline"},
    {id:"zones", label:"Зоны", icon:"mdi:home-thermometer-outline"},
    {id:"equipment", label:"Оборуд.", icon:"mdi:water-boiler"},
    {id:"history", label:"История", icon:"mdi:chart-line"},
    {id:"service", label:"Сервис", icon:"mdi:tools"},
  ];
  p._tabs = () => tabs;
  const load = p._load;
  p._load = function(force = false) {
    if (force && !this.__dailyHistoryLoading) this.__dailyHistory = null;
    return load.call(this, force);
  };
  p._pressMode = async () => {}; // No command path in the read-only product.
  p._bindWorkActionsV095 = () => {}; // Native HA more-info may expose commands.
  p._dailyZones = function() {
    return (this._config().zone_entities || []).map((id) => {
      const state = this._hass?.states?.[id];
      const a = state?.attributes || {};
      const missing = unavailable(state);
      const current = missing ? null : number(a.current_temperature);
      const target = missing ? null : number(a.temperature);
      const action = missing ? null : a.hvac_action;
      return {id, name:a.friendly_name || id, current, target, missing,
        active: action === "heating", uncertain:missing || current === null || target === null || !["heating", "idle", "off"].includes(action),
        delta:current !== null && target !== null ? current - target : null,
        action:action === "heating" ? "Нагрев" : ["idle", "off"].includes(action) ? "Не нагревается" : "Активность неизвестна"};
    }).sort((a,b) => Number(b.missing) - Number(a.missing) || Number(b.active) - Number(a.active) || a.name.localeCompare(b.name, "ru"));
  };
  const row = (name, value, note = "") => `<div class="daily-row"><strong>${escape(name)}</strong><div>${escape(value)}<small>${escape(note)}</small></div></div>`;
  const section = (title, body) => `<section class="daily-section"><h2>${escape(title)}</h2>${body}</section>`;
  const style = `<style>
    .daily{color:var(--primary-text-color);padding:14px;max-width:900px;margin:auto}
    .daily h1{font-size:24px;margin:0 0 8px}.daily h2{font-size:17px;margin:0 0 10px}
    .daily-section{margin:0 0 16px}.daily-chart{display:block;width:100%;max-width:600px;background:var(--card-background-color)}.daily-chart text{fill:var(--secondary-text-color);font-size:12px}.daily-row{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:14px;background:var(--card-background-color);border-bottom:1px solid var(--divider-color);min-height:54px}
    .daily-row strong{font-size:15px;font-weight:500;overflow-wrap:anywhere}.daily-row div{text-align:right;font-size:16px;font-variant-numeric:tabular-nums}
    .daily small{display:block;font-size:12px;color:var(--secondary-text-color);margin-top:4px}.daily details{margin:12px 0}.daily summary{padding:14px;min-height:44px}.daily-note{padding:14px;background:var(--secondary-background-color);margin-bottom:14px;border-radius:12px}
    .daily button{min-height:44px;padding:8px 16px;color:var(--primary-color);background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:10px}
    .overview{max-width:660px;margin:auto}.overview-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:16px;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:18px;margin-bottom:12px}.overview-eyebrow{font-size:12px;color:var(--secondary-text-color);margin:0 0 6px}.overview-hero h1{font-size:22px;margin:0;line-height:1.2}.overview-hero small{font-size:12px;line-height:1.4}.overview-connection{text-align:right;max-width:155px}.overview-connection strong{font-size:13px;color:var(--secondary-text-color)}
    .overview-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.overview-metric{min-width:0;padding:14px;border-radius:16px;border:1px solid var(--divider-color);background:var(--card-background-color)}.overview-label{display:flex;align-items:center;gap:7px;color:var(--secondary-text-color);font-size:13px}.overview-label ha-icon{--mdc-icon-size:18px;color:var(--primary-color)}.overview-value{display:flex;align-items:baseline;flex-wrap:wrap;gap:5px;font-size:27px;font-weight:600;margin:8px 0 5px;font-variant-numeric:tabular-nums}.overview-value span{font-size:17px;font-weight:400;white-space:nowrap}.overview-metric small{font-size:12px;line-height:1.3}.overview-section-title{display:flex;align-items:center;justify-content:space-between;margin:18px 2px 8px}.overview-section-title h2{font-size:16px;margin:0}.overview-nodes{overflow:hidden;border:1px solid var(--divider-color);border-radius:16px;background:var(--card-background-color)}.overview-node{display:grid;grid-template-columns:26px minmax(0,1fr) auto;align-items:center;gap:10px;padding:13px;border-bottom:1px solid var(--divider-color);min-height:54px}.overview-node:last-child{border:0}.overview-node ha-icon{--mdc-icon-size:22px;color:var(--primary-color)}.overview-node strong{font-size:14px;font-weight:500}.overview-node span{font-size:12px;color:var(--secondary-text-color)}.overview-empty{padding:14px;color:var(--secondary-text-color);font-size:13px}
    @container nikas-panel (max-width:400px){.daily{padding:10px}.daily-row{padding:12px;gap:8px}.daily-row strong{font-size:14px}.overview-hero{padding:12px;gap:8px;grid-template-columns:minmax(0,1fr)}.overview-connection{text-align:left;max-width:none;display:flex;justify-content:space-between;gap:8px;align-items:baseline}.overview-hero h1{font-size:21px}.overview-metric{padding:12px}.overview-value{font-size:25px}}
  </style>`;
  p._dailyZoneRow = function(z) {
    const value = z.current === null ? "Нет данных" : `${z.current.toLocaleString("ru")} °C`;
    const goal = z.target === null ? "цель неизвестна" : `цель ${z.target.toLocaleString("ru")} °C`;
    const delta = z.delta === null ? "" : ` · Δ ${z.delta > 0 ? "+" : ""}${z.delta.toLocaleString("ru")} °C`;
    return row(z.name, value, z.missing ? "Источник недоступен" : `${goal}${delta} · ${z.action}`);
  };
  p._dailyOverviewModel = function(items) {
    // Match the measured quantity using entity metadata, never controller/device names.
    const text = i => [i.entry.name,i.entry.original_name,i.state?.attributes?.friendly_name].filter(Boolean).join(" ").toLocaleLowerCase();
    const isTemp = i => i.entry.entity_id.startsWith("sensor.") && (i.state?.attributes?.device_class === "temperature" || ["°C","°F","K"].includes(i.state?.attributes?.unit_of_measurement));
    const unique = pool => pool.length === 1 ? pool[0] : null;
    const temperatures = items.filter(isTemp);
    const indoor = unique(temperatures.filter(i=>/гостиная|indoor|в доме/.test(text(i)) && !/целев|уставк|target/.test(text(i))));
    const outdoor = unique(temperatures.filter(i=>/уличн.*датчик|outdoor.*sensor/.test(text(i)))) || unique(temperatures.filter(i=>/улиц|outdoor/.test(text(i)) && !/интернет|internet|целев|target/.test(text(i))));
    const dhw = unique(temperatures.filter(i=>/гвс|dhw|горяч/.test(text(i)) && !/целев|уставк|target|циркуляц|обрат|return|расч[её]т/.test(text(i))));
    const pressure = unique(items.filter(i=>(i.state?.attributes?.device_class === "pressure" || ["bar","бар","kPa"].includes(i.state?.attributes?.unit_of_measurement)) && /теплонос|систем|system/.test(text(i)) && !/хвс|питьев|полив/.test(text(i))));
    const metric = (label, item, icon, note) => ({label,item,icon,note,value:!unavailable(item?.state) ? number(item.state.state?.replace?.(",",".") ?? item.state.state) : null});
    const metrics = [metric("В доме",indoor,"mdi:home-thermometer-outline","Гостиная · датчик"),metric("На улице",outdoor,"mdi:weather-partly-cloudy","Уличный датчик"),metric("ГВС",dhw,"mdi:water-thermometer-outline","Температура воды"),metric("Давление",pressure,"mdi:gauge","Теплоноситель")];
    const active = [];
    for (const [name,pattern,icon] of [["Основной котёл",/горелк|burner/,"mdi:fire"],["Радиаторы",/радиатор|radiator/,"mdi:radiator"],["Тёплый пол",/т[её]пл.*пол|floor/,"mdi:heating-coil"],["Циркуляция",/циркуляц|circulation/,"mdi:pump"]]) {
      const signal = unique(items.filter(i=>i.entry.entity_id.startsWith("binary_sensor.") && pattern.test(text(i)) && !/разреш|enable/.test(text(i))));
      if(signal && ["on","active","running","heating"].includes(signal.state?.state))active.push({name,icon,state:name === "Основной котёл" ? "Горелка активна" : "Включено"});
    }
    return {metrics,active};
  };
  p._dailyOverview = function(items, zones) {
    const {metrics,active} = this._dailyOverviewModel(items);
    const missing = metrics.filter(m=>m.value===null).length;
    const unavailableZones = zones.filter(z=>z.missing).length;
    const incompleteZones = zones.filter(z=>!z.missing && z.uncertain).length;
    const errors = items.filter(i=>this._role(i)==="error" && this._isActiveErrorV089(i)).length;
    const hasIssue = missing || unavailableZones || errors;
    const title = errors ? "Требует внимания" : hasIssue ? "Есть замечания" : "Показания получены";
    const notes = [errors ? `Ошибок оборудования: ${errors}` : "",unavailableZones ? `Зон без связи: ${unavailableZones}` : "",missing ? `Нет показаний: ${missing}` : "",incompleteZones ? `Активность неизвестна: ${incompleteZones}` : ""].filter(Boolean);
    const online = items.find(i=>/online|подключ/.test([i.entry.original_name,i.entry.name,i.state?.attributes?.friendly_name].filter(Boolean).join(" ").toLowerCase()));
    const connection = this._connectionStatusV096(items,online);
    const ages = metrics.filter(m=>m.value!==null).map(m=>Date.parse(m.item.state.last_reported || m.item.state.last_updated)).filter(Number.isFinite);
    const age = ages.length ? Math.max(0,Math.floor((Date.now()-Math.min(...ages))/60000)) : null;
    const freshness = age===null ? "Время данных неизвестно" : age===0 ? "HA: менее минуты назад" : `HA: до ${age} мин назад`;
    const cards = metrics.map(m=>`<div class="overview-metric"><div class="overview-label"><ha-icon icon="${m.icon}"></ha-icon>${m.label}</div><div class="overview-value">${m.value===null ? "Нет данных" : `${escape(m.value.toLocaleString("ru",{maximumFractionDigits:2}))}<span>${escape(m.item.state.attributes?.unit_of_measurement || "")}</span>`}</div><small>${m.value===null ? "Источник отсутствует или неоднозначен" : m.note}</small></div>`).join("");
    const nodes = active.map(n=>`<div class="overview-node"><ha-icon icon="${n.icon}"></ha-icon><strong>${n.name}</strong><span>${n.state}</span></div>`).join("");
    return `<div class="overview"><div class="overview-hero"><div><p class="overview-eyebrow">Состояние дома</p><h1>${title}</h1><small>${escape(notes.join(" · ") || "Температуры и давление доступны")}</small></div><div class="overview-connection"><strong>${escape(connection.text)}</strong><small>${escape(freshness)}</small></div></div><div class="overview-metrics">${cards}</div><div class="overview-section-title"><h2>Работает сейчас</h2><small>${active.length} узл.</small></div><div class="overview-nodes">${nodes || '<div class="overview-empty">Нет подтверждённых активных узлов</div>'}</div></div>`;
  };
  p._dailyHistory = function(items) {
    if (!this.__dailyHistory && !this.__dailyHistoryLoading) {
      const ids = [...new Set([...this._dailyZones().map(z=>z.id), ...items.filter(i=>i.state?.attributes?.device_class === "temperature").slice(0,6).map(i=>i.entry.entity_id)])];
      if (!ids.length) return '<div class="daily-note">Нет источников для истории.</div>';
      this.__dailyHistoryLoading = true;
      const start = new Date(Date.now()-86400000).toISOString();
      const end = new Date().toISOString();
      Promise.resolve().then(() => this._hass.callApi("GET", `history/period/${start}?filter_entity_id=${encodeURIComponent(ids.join(","))}&end_time=${encodeURIComponent(end)}`))
        .then(data => { this.__dailyHistory = {data:Array.isArray(data)?data:[], error:null}; })
        .catch(error => { this.__dailyHistory = {data:[], error:String(error?.message || error)}; })
        .finally(() => {this.__dailyHistoryLoading=false; this._queue();});
    }
    if (!this.__dailyHistory) return '<div class="daily-note">Загружаю историю за последние 24 часа…</div>';
    if (this.__dailyHistory.error) return `<div class="daily-note">История недоступна: ${escape(this.__dailyHistory.error)}</div>`;
    const series = this.__dailyHistory.data;
    if (!series.length) return '<div class="daily-note">В Recorder нет записей за выбранные сутки.</div>';
    return section("Последние 24 часа", series.map(samples => {
      if (!samples.length) return "";
      const last = samples[samples.length-1];
      const name = this._hass.states[last.entity_id]?.attributes?.friendly_name || last.entity_id;
      const readings = samples.filter(s=>!unavailable(s)).map(s=>number(last.entity_id.startsWith("climate.")?s.attributes?.current_temperature:s.state)).filter(v=>v!==null);
      const range = readings.reduce((r,v)=>[Math.min(r[0],v),Math.max(r[1],v)],[Infinity,-Infinity]);
      const trend = this._dailyTemperatureChart(samples, last.entity_id, name);
      return row(name, readings.length ? `${range[0].toLocaleString("ru")} … ${range[1].toLocaleString("ru")} °C` : "Нет измерений", `${samples.length} записей · диапазон доступных значений`) + trend;
    }).join("")) + '<small>Пробелы Recorder не считаются нормальной работой. Циклы горелки не рассчитываются без подтверждённого сигнала.</small>';
  };
  p._dailyTemperatureChart = function(samples, id, name) {
    const end = Date.now(), start = end - 86400000;
    const points = samples.map(s=>({t:Date.parse(s.last_updated || s.last_changed),v:unavailable(s)?null:number(id.startsWith("climate.")?s.attributes?.current_temperature:s.state)})).filter(p=>Number.isFinite(p.t)).sort((a,b)=>a.t-b.t);
    const values = points.filter(p=>p.v!==null && p.t>=start && p.t<=end).map(p=>p.v);
    if (!values.length) return "";
    const [min,max] = values.reduce((r,v)=>[Math.min(r[0],v),Math.max(r[1],v)],[Infinity,-Infinity]);
    const padding = Math.max(.5,(max-min)*.1), low = min-padding, high = max+padding;
    let path="", pen=false;
    for (const point of points) {
      if(point.v===null || point.t<start || point.t>end){pen=false;continue;}
      const x=48+(point.t-start)/86400000*290, y=112-(point.v-low)/(high-low)*88;
      path += `${pen?"L":"M"}${x.toFixed(1)},${y.toFixed(1)} `; pen=true;
    }
    return `<svg class="daily-chart" viewBox="0 0 360 150" role="img" aria-label="${escape(name)}: температура за 24 часа"><title>${escape(name)} · °C</title><rect x="48" y="24" width="290" height="88" fill="none" stroke="var(--divider-color)"/><text x="4" y="28">${high.toFixed(1)}°</text><text x="4" y="112">${low.toFixed(1)}°</text><text x="48" y="137">24 ч назад</text><text x="338" y="137" text-anchor="end">Сейчас</text><path d="${path}" fill="none" stroke="var(--primary-color)" stroke-width="2"/></svg>`;
  };
  p._content = function(active, items) {
    const zones = this._dailyZones();
    let html = "";
    if (active.id === "zones") {
      const priority = zones.filter(z=>z.active || z.uncertain || (z.delta !== null && z.delta !== 0));
      const rest = zones.filter(z=>!priority.includes(z));
      html = section("Активные и требующие внимания", priority.map(z=>this._dailyZoneRow(z)).join("") || '<div class="daily-note">Нет активных зон и замечаний.</div>');
      if (rest.length) html += `<details><summary>Остальные зоны · ${rest.length}</summary>${rest.map(z=>this._dailyZoneRow(z)).join("")}</details>`;
      html += '<small>Δ — фактическое отличие от уставки, не аварийный порог. Режим auto не означает нагрев.</small>';
    } else if (active.id === "history") html = this._dailyHistory(items);
    else if (active.id === "service") {
      html = section("Состояние источников", row("Реестр ZONT", this._error ? "Ошибка чтения" : Array.isArray(this._registry) ? "Прочитан" : "Загрузка", this._error || "Транспорт и свежесть проверяются отдельно"));
      html += section("Недоступные термостаты", zones.filter(z=>z.missing).map(z=>this._dailyZoneRow(z)).join("") || row("Термостаты", "Нет недоступных источников"));
      html += this._diagnostics(items);
      if (items.length) html += `<details><summary>Техническая схема системы</summary>${this._systemOverviewV089(items)}</details>`;
    } else if (active.id === "equipment") {
      const measurements = items.filter(i=>!["button","select","number"].includes(i.entry.entity_id.split(".")[0]));
      const groups = [["Основной котёл", /ebus|основн/i], ["Резервный котёл", /резерв|reserve/i], ["Радиаторы", /радиатор/i], ["Тёплый пол", /т[её]пл.*пол|floor/i], ["ГВС и циркуляция", /гвс|dhw|циркуляц/i]];
      html = groups.map(([title, pattern]) => {
        const group = measurements.filter(i=>pattern.test([i.entry.original_name,i.entry.name,i.state?.attributes?.friendly_name].filter(Boolean).join(" ")));
        return section(title, group.map(i=>row(this._rawName(i),this._value(i),this._isProblem(i)?"Источник недоступен":"")).join("") || row(title,"Нет подтверждённых источников"));
      }).join("");
    } else {
      html = this._dailyOverview(items, zones);
    }
    return `${style}<div class="daily">${html}</div>`;
  };
})();
