// Read-only daily views. The shared shell remains the only viewport owner.
(() => {
  const Panel = customElements.get("zont-local-panel");
  const p = Panel.prototype;
  const escape = (v) => String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const number = (v) => v !== null && v !== undefined && String(v).trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null;
  const unavailable = (s) => !s || ["unknown", "unavailable"].includes(s.state);
  const tabs = [
    {id:"overview", label:"Обзор", icon:"mdi:home-outline"},
    {id:"climate", label:"Климат", icon:"mdi:thermometer"},
    {id:"zones", label:"Зоны", icon:"mdi:home-thermometer-outline"},
    {id:"equipment", label:"Оборуд.", icon:"mdi:water-boiler"},
    {id:"history", label:"История", icon:"mdi:chart-line"},
  ];
  p._tabs = () => tabs;
  const load = p._load;
  p._load = function(force = false) {
    if (force) this._overviewReportRequest = null;
    if (force && !this.__dailyHistoryLoading) this.__dailyHistory = null;
    return load.call(this, force);
  };
  p._pressMode = async () => {}; // No command path in the read-only product.
  p._bindWorkActionsV095 = () => {}; // Native HA more-info may expose commands.
  p._dailyZones = function() {
    const config = this._config();
    const states = this._hass?.states;
    return (config.zone_entities || []).map((id) => {
      const state = states?.[id];
      const a = state?.attributes || {};
      const missing = unavailable(state);
      const roomSource = config.zone_room_sources?.[id];
      const sourceStatus = states?.[roomSource?.selector]?.state;
      const sourceWarning = sourceStatus === "remote_source_offline" || sourceStatus === "local_temperature";
      const sourceNote = !roomSource ? "" : {
        remote_source_offline: "Внешний датчик: термоголовка не получает данные",
        local_temperature: "Внешний датчик: термоголовка использует встроенный датчик",
      }[sourceStatus] || "Внешний датчик";
      const current = roomSource ? number(states?.[roomSource.temperature]?.state)
        : missing ? null : number(a.current_temperature);
      const target = missing ? null : number(a.temperature);
      const action = missing ? null : a.hvac_action;
      return {id, name:a.friendly_name || id, current, target, missing, sourceNote, sourceWarning,
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
    .overview{max-width:660px;margin:auto}.overview-hero{padding:14px;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:18px;margin-bottom:12px}.overview-eyebrow{font-size:12px;color:var(--secondary-text-color);margin:0 0 6px}.overview-hero h1{font-size:22px;margin:0;line-height:1.2}.overview-hero small{font-size:12px;line-height:1.4}
    .overview-heading,.overview-lamps,.overview-status{display:flex;align-items:center;gap:7px}
    .overview-heading{flex-wrap:wrap}.overview-lamp{position:relative;display:inline-flex;color:var(--secondary-text-color)}
    .overview-lamp ha-icon{--mdc-icon-size:20px}
    .overview-lamp-question{position:absolute;inset-inline-end:-2px;bottom:-1px;width:11px;height:11px;display:grid;place-items:center;border-radius:50%;background:var(--card-background-color);font-size:10px;font-weight:700;line-height:1}
    .overview-lamp.online,.overview-lamp.current{color:var(--success-color,#43a047)}
    .overview-lamp.offline,.overview-lamp.stale{color:var(--warning-color,#ff9800)}
    .overview-hero:has(>.overview-diagnostics:not([open])){padding-bottom:4px}
    .daily .overview-diagnostics{border-top:1px solid var(--divider-color);margin:10px 0 0}
    .overview-diagnostics > summary{min-height:44px;padding:0;align-content:center;font-size:13px}
    .overview-diagnostics small{overflow-wrap:anywhere}.overview-status{font-size:13px;margin-bottom:6px}
    .overview-floors,.overview-metrics{display:grid;gap:8px}
    .overview-floors{grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:8px}
    .overview-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}
    .daily button.overview-floor{display:block;text-align:start;width:100%;border:1px solid var(--divider-color);border-radius:16px;color:var(--primary-text-color);padding:14px}.overview-floor small{overflow-wrap:anywhere}
    .overview-metrics .overview-value{font-size:21px}.overview-metrics .overview-value span{font-size:13px}.overview-metric{min-width:0;padding:14px;border-radius:16px;border:1px solid var(--divider-color);background:var(--card-background-color)}.overview-label{display:flex;align-items:center;gap:7px;color:var(--secondary-text-color);font-size:13px}.overview-label ha-icon{--mdc-icon-size:18px;color:var(--primary-color)}.overview-value{display:flex;align-items:baseline;flex-wrap:wrap;gap:5px;font-size:27px;font-weight:600;margin:8px 0 5px;font-variant-numeric:tabular-nums}.overview-value span{font-size:17px;font-weight:400;white-space:nowrap}.overview-metric small{font-size:12px;line-height:1.3;overflow-wrap:anywhere}.overview-section-title{display:flex;align-items:center;justify-content:space-between;margin:18px 2px 8px}.overview-section-title h2{font-size:16px;margin:0}.overview-nodes{overflow:hidden;border:1px solid var(--divider-color);border-radius:16px;background:var(--card-background-color)}.overview-node{display:grid;grid-template-columns:26px minmax(0,1fr) auto;align-items:center;gap:10px;padding:13px;border-bottom:1px solid var(--divider-color);min-height:54px}.overview-node:last-child{border:0}.overview-node > ha-icon{--mdc-icon-size:22px;color:var(--node-color,var(--primary-color))}.overview-node strong{font-size:14px;font-weight:500}.overview-node > span{font-size:12px;color:var(--node-color,var(--secondary-text-color))}.overview-empty{padding:14px;color:var(--secondary-text-color);font-size:13px}
    .overview-node.is-on{--node-color:color-mix(in srgb,#ec7b2f 60%,var(--primary-text-color))}
    .overview-node.is-off{--node-color:color-mix(in srgb,var(--primary-color,#03a9cf) 60%,var(--primary-text-color))}
    .overview-node.is-unavailable{--node-color:var(--secondary-text-color)}
    .overview-node.has-reading{grid-template-columns:var(--overview-node-icon-width,26px) minmax(0,1fr) minmax(62px,17%) minmax(74px,21%);gap:4px 8px}
    .overview-node.has-reading > small{grid-column:2 / -1;margin-top:0}
    .overview-node-status{text-align:end}
    .overview-node-pump{display:grid;place-items:center;justify-self:center;width:25px;height:25px;border:1px solid currentColor;border-radius:50%}
    .overview-node-pump ha-icon{display:block;--mdc-icon-size:19px;transform-origin:center}
    @keyframes overview-pump-spin{to{transform:rotate(1turn)}}
    @media (prefers-reduced-motion:no-preference){.overview-node.is-on .overview-node-pump ha-icon{animation:overview-pump-spin 1.4s linear infinite}}
    .overview-node > .overview-node-power{color:var(--primary-text-color);text-align:center;font-variant-numeric:tabular-nums}
    .overview-node > .overview-node-power.is-missing{color:var(--secondary-text-color)}
    @container nikas-panel (max-width:400px){.daily{padding:10px}.daily-row{padding:12px;gap:8px}.daily-row strong{font-size:14px}.overview-hero{padding:12px}.overview-metrics{gap:5px}.overview-metrics .overview-metric{padding:8px}.overview-metrics .overview-label{gap:3px;font-size:11px}.overview-metrics .overview-label ha-icon{--mdc-icon-size:15px}.overview-hero h1{font-size:21px}.overview-metric{padding:12px}.overview-value{font-size:25px}}
    @container nikas-panel (max-width:400px){.overview-node.has-reading{--overview-node-icon-width:22px;column-gap:6px;padding-inline:9px}}
  </style>`;
  p._dailyZoneRow = function(z) {
    const value = z.current === null ? "Нет данных" : `${z.current.toLocaleString("ru")} °C`;
    const goal = z.target === null ? "цель неизвестна" : `цель ${z.target.toLocaleString("ru")} °C`;
    const delta = z.delta === null ? "" : ` · Δ ${z.delta > 0 ? "+" : ""}${z.delta.toLocaleString("ru")} °C`;
    return row(z.name, value, z.missing ? "Источник недоступен" : `${goal}${delta} · ${z.action}`);
  };
  const controllerConnectivity = (items) => {
    const signals = items.filter(i => i.entry.entity_id.startsWith("binary_sensor.") && i.state?.attributes?.device_class === "connectivity");
    return signals.length === 1 ? signals[0] : null;
  };
  p._dailyOverviewModel = function(items) {
    // Match the measured quantity using entity metadata, never controller/device names.
    const text = i => [i.entry.name,i.entry.original_name,i.state?.attributes?.friendly_name].filter(Boolean).join(" ").toLocaleLowerCase();
    const isTemp = i => i.entry.entity_id.startsWith("sensor.") && (i.state?.attributes?.device_class === "temperature" || ["°C","°F","K"].includes(i.state?.attributes?.unit_of_measurement));
    const unique = pool => pool.length === 1 ? pool[0] : null;
    const temperatures = items.filter(isTemp);
    const measured = temperatures.filter(i=>!/целев|уставк|target/.test(text(i)));
    const living = unique(measured.filter(i=>/гостиная/.test(text(i))));
    const namedChild = measured.filter(i=>/детск[а-яё]*[ _-]+ильи/.test(text(i)));
    const child = unique(namedChild.length ? namedChild : measured.filter(i=>/детск[а-яё]*[ _-]+2(?:[^\d]|$)/.test(text(i))));
    const outdoor = unique(temperatures.filter(i=>/уличн.*датчик|outdoor.*sensor/.test(text(i)))) || unique(temperatures.filter(i=>/улиц|outdoor/.test(text(i)) && !/интернет|internet|целев|target/.test(text(i))));
    const dhw = unique(temperatures.filter(i=>/гвс|dhw|горяч/.test(text(i)) && !/целев|уставк|target|циркуляц|обрат|return|расч[её]т/.test(text(i))));
    const pressure = unique(items.filter(i=>(i.state?.attributes?.device_class === "pressure" || ["bar","бар","kPa"].includes(i.state?.attributes?.unit_of_measurement)) && /теплонос|систем|system/.test(text(i)) && !/хвс|питьев|полив/.test(text(i))));
    const metric = (label, item, icon, note) => ({label,item,icon,note,value:!unavailable(item?.state) ? number(item.state.state?.replace?.(",",".") ?? item.state.state) : null});
    const floors = [
      {...metric("1 этаж",living,"mdi:thermometer","Гостиная · ZONT"),room:"living"},
      {...metric("2 этаж",child,"mdi:thermometer","Детская Ильи · ZONT"),room:"ilya"},
    ];
    const metrics = [metric("На улице",outdoor,"mdi:weather-partly-cloudy","Уличный датчик"),metric("ГВС",dhw,"mdi:water-thermometer-outline","Температура воды"),metric("Давление",pressure,"mdi:gauge","Теплоноситель")];
    const nodes = [];
    const controllerOffline = controllerConnectivity(items)?.state?.state === "off";
    const operatingSignals = items.filter(item => {
      const entry = item.entry;
      const deviceClass = item.state?.attributes?.device_class || entry.device_class || entry.original_device_class;
      return entry.entity_id.startsWith("binary_sensor.") &&
        (!deviceClass || ["running", "power", "heat"].includes(deviceClass)) &&
        !/разреш|enable|ошиб|авари|неисправ|перегрев|блокир|error|fault|alarm|problem|overheat|lockout/.test(`${text(item)} ${entry.entity_id}`);
    });
    for (const [name,pattern,icon] of [["Основной котёл",/горелк|burner/,"mdi:fire"],["Радиаторы",/радиатор|radiator/,"mdi:radiator"],["Тёплый пол",/т[её]пл.*пол|floor/,"mdi:heating-coil"],["Циркуляция",/циркуляц|circulation/,"mdi:pump"]]) {
      const signal = unique(operatingSignals.filter(item => pattern.test(text(item))));
      if (!signal) continue;
      const pump = name !== "Основной котёл";
      const state = pump && controllerOffline ? "unavailable" : signal.state?.state;
      if (["on","active","running","heating"].includes(state)) {
        nodes.push({name,icon,pump,tone:"is-on",label:pump ? "Включено" : "Горелка активна"});
      } else if (state === "off") {
        nodes.push({name,icon,pump,tone:"is-off",label:pump ? "Выключено" : "Горелка неактивна"});
      } else {
        nodes.push({name,icon,pump,tone:"is-unavailable",label:pump ? "Недоступно" : "Данные горелки недоступны"});
      }
    }
    return {floors,metrics,nodes};
  };
  const freshnessLimit = 15 * 60 * 1000;
  const reportPollInterval = 60 * 1000;
  p._refreshOverviewReports = function(readings) {
    if(!this._hass?.callApi || readings.some(m=>m.value===null))return;
    const ids=readings.filter(m=>!Number.isFinite(Date.parse(m.item.state.last_reported)))
      .map(m=>m.item.entry.entity_id);
    if(!ids.length)return;
    const key=ids.join(',');
    const last=this._overviewReportRequest;
    if(last?.key===key && (last.pending || Date.now()-last.started<reportPollInterval))return;
    const request={key,started:Date.now(),pending:true};
    this._overviewReportRequest=request;
    Promise.allSettled(ids.map(id=>Promise.resolve().then(()=>this._hass.callApi('GET','states/'+encodeURIComponent(id)))))
      .then(results=>{
        if(this._overviewReportRequest!==request)return;
        request.pending=false;
        this._overviewReports=new Map(results.flatMap((result,index)=>
          result.status==='fulfilled' && Number.isFinite(Date.parse(result.value?.last_reported))
            ? [[ids[index],result.value.last_reported]] : []));
        if(this.__zontShellV095?.active==='overview')this._queue();
      });
  };
  const lamp = (icon, tone, label, kind) => '<span class="overview-lamp '+tone+'"'+
    (kind ? ' role="img" aria-label="'+escape(kind+' · '+label)+'" title="'+escape(label)+'"' : ' aria-hidden="true"')+
    '><ha-icon icon="'+icon+'" aria-hidden="true"></ha-icon>'+
    (icon === "mdi:clock-outline" ? '<span class="overview-lamp-question" aria-hidden="true">?</span>' : '')+'</span>';
  p._overviewStatus = function(items, readings) {
    const online = controllerConnectivity(items);
    const state = online?.state?.state;
    const connection = state==="on" ? ["mdi:cloud","online","ZONT на связи"]
      : state==="off" ? ["mdi:cloud-off-outline","offline","Нет связи с ZONT"]
      : ["mdi:cloud-question-outline","unknown","Нет данных о связи"];
    const transport = state==="on" ? this._connectionStatusV096(items,online) : null;
    this._refreshOverviewReports(readings);
    // The compressed frontend stream may only include last_updated, which
    // does not advance when an unchanged measurement is reported again.
    const reports = readings.map(m=>m.value===null ? NaN : Date.parse(m.item.state.last_reported ||
      this._overviewReports?.get(m.item.entry.entity_id)));
    const age = reports.every(Number.isFinite) ? Date.now()-Math.min(...reports) : NaN;
    const freshness = !Number.isFinite(age) || age<0
      ? ["mdi:clock-outline","unknown","Нет данных о свежести"]
      : age>freshnessLimit ? ["mdi:clock-alert-outline","stale","Данные в HA устарели"]
      : ["mdi:check-circle-outline","current","Данные в HA актуальны"];
    const detail = status => '<div class="overview-status">'+lamp(...status)+escape(status[2])+'</div>';
    const suffix = Number.isFinite(age) && age>=0 ? ' · до '+Math.floor(age/60000)+' мин назад' : '';
    return {
      lamps: lamp(...connection,"Связь")+lamp(...freshness,"Свежесть"),
      diagnostics: '<details class="overview-diagnostics" data-detail="zont-diagnostics"><summary>Диагностика ZONT</summary>'+
        detail(connection)+detail(freshness)+'<small>Канал к контроллеру · '+escape(transport && !transport.unknown ? transport.text : "Не подтверждён")+
        '</small><small>Отметка получения показаний в Home Assistant'+suffix+'</small>'+
        readings.map(m=>'<small>'+escape(m.label)+' · '+escape(m.item?.entry.entity_id || "Источник не определён")+'</small>').join('')+'</details>',
    };
  };
  const pumpLabels = {
    "is-on": "Насос · Включён по данным ZONT",
    "is-off": "Насос · Выключен по данным ZONT",
    "is-unavailable": "Насос · Нет данных",
  };
  const outletPowerWatts = (registry, states, entityId) => {
    const deviceId = registry.find(entry => entry.entity_id === entityId && !entry.disabled_by)?.device_id;
    if (!deviceId) return null;
    const candidates = registry.filter(entry => entry.device_id === deviceId && !entry.disabled_by &&
      entry.entity_id.startsWith("sensor.") &&
      (states[entry.entity_id]?.attributes?.device_class || entry.device_class || entry.original_device_class) === "power");
    if (candidates.length !== 1) return null;
    const reading = states[candidates[0].entity_id];
    const value = number(reading?.state);
    if (value === null) return null;
    const unit = reading.attributes?.unit_of_measurement;
    if (unit === "W") return value;
    return unit === "kW" ? number(value * 1000) : null;
  };
  p._dailyOverview = function(items, zones) {
    const {floors,metrics,nodes} = this._dailyOverviewModel(items);
    const readings = [...floors,...metrics];
    const missing = readings.filter(m=>m.value===null).length;
    const unavailableZones = zones.filter(z=>z.missing).length;
    const incompleteZones = zones.filter(z=>!z.missing && z.uncertain).length;
    const errors = items.filter(i=>this._role(i)==="error" && this._isActiveErrorV089(i)).length;
    const hasIssue = missing || unavailableZones || errors;
    const title = errors ? "Требует внимания" : hasIssue ? "Есть замечания" : "Показания получены";
    const notes = [errors ? `Ошибок оборудования: ${errors}` : "",unavailableZones ? `Зон без связи: ${unavailableZones}` : "",missing ? `Нет показаний: ${missing}` : "",incompleteZones ? `Активность неизвестна: ${incompleteZones}` : ""].filter(Boolean);
    const status = this._overviewStatus(items,readings);
    const renderMetric = m => {
      const value = m.value===null ? "Нет данных" : escape(m.value.toLocaleString("ru",{maximumFractionDigits:2}))+
        '<span>'+escape(m.item.state.attributes?.unit_of_measurement || '')+'</span>';
      const body = '<span class="overview-label"><ha-icon icon="'+m.icon+'" aria-hidden="true"></ha-icon>'+m.label+
        '</span><span class="overview-value">'+value+'</span><small>'+escape(m.value===null && !m.room ? "Источник отсутствует или неоднозначен" : m.note)+'</small>';
      return m.room ? '<button type="button" data-climate-room="'+m.room+'" class="overview-floor">'+body+'</button>'
        : '<div class="overview-metric">'+body+'</div>';
    };
    const nodeRows = nodes.map(n => {
      const pumpLabel = pumpLabels[n.tone];
      const pump = n.pump ? `<span class="overview-node-pump" role="img" aria-label="${pumpLabel}" title="${pumpLabel}"><ha-icon icon="mdi:fan" aria-hidden="true"></ha-icon></span>` : "";
      return `<div class="overview-node ${n.tone}${n.pump ? " has-reading" : ""}"><ha-icon icon="${n.icon}" aria-hidden="true"></ha-icon><strong>${n.name}</strong>${pump}<span class="overview-node-status">${n.label}</span></div>`;
    }).join("");
    const states = this._hass?.states || {};
    const outlets = (this._config().heating_outlets || []).map(outlet => {
      const state = states[outlet.entity_id]?.state;
      const tone = state === "on" ? "is-on" : state === "off" ? "is-off" : "is-unavailable";
      const status = state === "on" ? "Включена" : state === "off" ? "Выключена" : state === "unavailable" ? "Нет связи" : "Нет данных";
      const power = outletPowerWatts(this._registry || [], states, outlet.entity_id);
      const reading = power === null ? '<span class="overview-node-power is-missing" title="Нет данных о мощности">—</span>'
        : `<span class="overview-node-power" title="Потребляемая мощность">${power.toLocaleString("ru", {maximumFractionDigits:1})}\u00a0Вт</span>`;
      const range = Number.isFinite(outlet.on_below) && Number.isFinite(outlet.off_above)
        ? `<small>Вкл. ниже ${outlet.on_below.toLocaleString("ru")} °C · Выкл. выше ${outlet.off_above.toLocaleString("ru")} °C</small>`
        : "";
      return `<div class="overview-node ${tone} has-reading"><ha-icon icon="mdi:power-socket-eu" aria-hidden="true"></ha-icon><strong>${escape(outlet.label)}</strong>${reading}<span class="overview-node-status">${status}</span>${range}</div>`;
    }).join("");
    const heating = outlets ? `<div class="overview-section-title"><h2>Электрообогрев</h2></div><div class="overview-nodes">${outlets}</div>` : "";
    return '<div class="overview"><div class="overview-hero"><div class="overview-heading"><h1>Состояние дома</h1><div class="overview-lamps">'+
      status.lamps+'</div></div><small>'+escape((hasIssue?title+' · ':'')+(notes.join(" · ") || "Температуры и давление доступны"))+'</small>'+
      status.diagnostics+'</div><div class="overview-floors">'+floors.map(renderMetric).join('')+'</div><div class="overview-metrics">'+metrics.map(renderMetric).join('')+
      '</div><div class="overview-section-title"><h2>Отопление и циркуляция</h2><small>'+nodes.length+' узл.</small></div><div class="overview-nodes">'+
      (nodeRows || '<div class="overview-empty">Источники состояния узлов не найдены</div>')+'</div>'+heating+'</div>';
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
    else if (active.id === "equipment") {
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
