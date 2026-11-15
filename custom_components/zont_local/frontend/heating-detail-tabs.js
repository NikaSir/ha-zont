// Approved detail-tab presentation. Values are always HA telemetry, never mock data.
(() => {
  const p = customElements.get('zont-local-panel').prototype;
  const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const num = value => value !== null && value !== undefined && String(value).trim() && Number.isFinite(Number(value)) ? Number(value) : null;
  const missing = state => !state || ['unknown','unavailable'].includes(state.state);
  const ownText = item => [item?.entry?.original_name,item?.entry?.name,item?.state?.attributes?.friendly_name].filter(Boolean).join(' ').toLowerCase();
  const unique = values => values.length === 1 ? values[0] : null;
  const temperature = item => item?.entry?.entity_id.startsWith('sensor.') && (item.state?.attributes?.device_class === 'temperature' || ['°C','°F','K'].includes(item.state?.attributes?.unit_of_measurement));
  const fmt = value => value === null ? 'Нет данных' : Number(value).toLocaleString('ru',{maximumFractionDigits:1,minimumFractionDigits:1});
  const value = item => missing(item?.state) ? 'Нет данных' : `${esc(item.state.state)} ${esc(item.state.attributes?.unit_of_measurement || '')}`;
  const line = (name,v) => `<div class="ht-line"><span>${esc(name)}</span><strong>${v}</strong></div>`;
  const detail = (key,title,html) => `<details class="ht-card" data-detail="${esc(key)}"><summary>${esc(title)}</summary><div class="ht-detail">${html}</div></details>`;
  const inlineDetail = (key, html) => '<details class="ht-inline-diagnostics" data-detail="'+esc(key)+
    '"><summary>Диагностика</summary><div class="ht-detail">'+html+'</div></details>';
  const title = text => `<h2 class="ht-title">${text}</h2>`;
  const warning = text => `<div class="ht-warning">${esc(text)}</div>`;
  const styles = `<style>
    .ht{max-width:660px;margin:0 auto;color:var(--primary-text-color)}.ht-title{font-size:24px!important;margin:0 0 16px!important}.ht h3{font-size:14px;font-weight:500;color:var(--secondary-text-color);margin:17px 0 9px}.ht-card{background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:16px;overflow:hidden;margin:0 0 10px}.ht-pad{padding:15px}.ht-head{display:flex;justify-content:space-between;align-items:start;gap:10px;font-size:16px;font-weight:500}.ht small{font-size:12px;line-height:1.45;color:var(--secondary-text-color)}.ht-status{font-size:12px;color:var(--secondary-text-color);font-weight:400}.ht-heating{color:var(--warning-color,#d78c35)}.ht-values{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}.ht-values>div+div{border-left:1px solid var(--divider-color);padding-left:14px}.ht-values strong{font-size:27px;display:block;margin-top:4px;font-weight:500;font-variant-numeric:tabular-nums}.ht-values em{font-style:normal;font-size:15px}.ht-foot{border-top:1px solid var(--divider-color);padding-top:10px;margin-top:12px;font-size:12px;color:var(--secondary-text-color)}.ht-line{display:flex;justify-content:space-between;gap:14px;align-items:center;min-height:40px;padding:8px 0;border-bottom:1px solid var(--divider-color);font-size:13px;overflow-wrap:anywhere}.ht-line:last-child{border:0}.ht-line span{color:var(--secondary-text-color)}.ht-line strong{font-size:13px;font-weight:500;text-align:right;min-width:0}.ht summary{list-style:none;padding:13px 15px;min-height:48px;font-size:14px;display:flex;justify-content:space-between;gap:10px;align-items:center}.ht summary::-webkit-details-marker{display:none}.ht summary:after{content:'⌄';color:var(--secondary-text-color)}.ht details[open]>summary:after{content:'⌃'}.ht-detail{padding:0 15px 14px}.ht-warning{padding:12px 14px;border-radius:14px;background:color-mix(in srgb,var(--warning-color,#d78c35) 12%,var(--card-background-color));font-size:13px;margin-bottom:12px}.ht-count{font-size:13px;color:var(--secondary-text-color);margin-bottom:15px}.ht-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ht-pills{display:flex;gap:4px;padding:4px;border-radius:12px;background:var(--secondary-background-color);margin-bottom:12px}.ht .ht-pills button{flex:1;min-width:0;border:0;background:transparent;color:var(--secondary-text-color);font-size:13px;padding:7px 5px;min-height:40px}.ht .ht-pills button[aria-pressed=true]{background:var(--card-background-color);color:var(--primary-color)}.ht-chart{display:block;width:100%;height:auto}.ht-chart text{fill:var(--secondary-text-color);font-size:12px}.ht-range{font-size:12px;color:var(--secondary-text-color);padding:8px 0}.ht-band{height:12px;background:var(--secondary-background-color);border-radius:4px;position:relative;overflow:hidden;margin:8px 0 14px}.ht-band i{position:absolute;top:0;height:100%;background:var(--primary-color);border-radius:2px}.ht-source-id{font-size:11px;overflow-wrap:anywhere;display:block;color:var(--secondary-text-color)}
    .ht-inline-diagnostics{border-top:1px solid var(--divider-color)}.ht > .ht-card,.ht-grid > .ht-card{min-width:0}
    .ht-count .ht-offline{color:var(--error-color,#d64545)}
    .ht-zone-foot{display:flex;justify-content:space-between;align-items:center;gap:8px}
    .ht-window{display:inline-flex;flex:none}.ht-window ha-icon{--mdc-icon-size:20px}
    .ht-window-open{color:var(--yellow-color,#ffc107)}.ht-window-closed{color:var(--primary-color,#03a9cf)}
    .ht-climate-head,.ht .ht-climate-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(57px,75px) minmax(49px,64px) 12px;align-items:center;gap:7px}
    .ht-climate-head{padding:6px 15px;color:var(--secondary-text-color);font-size:12px}
    .ht-climate-head span:not(:first-child),.ht-climate-row .ht-reading{text-align:end}
    .ht-climate-row strong{font-weight:550;overflow-wrap:anywhere}
    .ht-climate-row .ht-reading{font-variant-numeric:tabular-nums;font-weight:500;font-size:13px}
    .ht-climate>details+details{border-top:1px solid var(--divider-color)}
    @container nikas-panel (max-width:359px){.ht-pad{padding:12px}.ht-head{font-size:15px}.ht-values strong{font-size:24px}.ht-title{font-size:22px!important}}
  </style>`;
  const baseContent = p._content;
  const bind = p._bindWorkActionsV095;
  p._bindWorkActionsV095 = function(view) {
    bind.call(this,view);
    if(view.__htBound)return;
    view.__htBound=true;
    view.addEventListener('click',event=>{
      const button=event.target.closest?.('button[data-ht-metric],button[data-ht-period],button[data-climate-room]');
      if(!button || !view.contains(button))return;
      if(button.dataset.climateRoom){
        this._climateTarget=button.dataset.climateRoom;
        this._selectTab('climate');
        return;
      }
      if(button.dataset.htMetric)this.__htMetric=button.dataset.htMetric;
      if(button.dataset.htPeriod)this.__htPeriod=Number(button.dataset.htPeriod);
      this._queue();
    });
  };
  const originalLoad=p._load;
  p._load=function(force=false){if(force){this.__htRequest=(this.__htRequest||0)+1;this.__htHistory=null;}return originalLoad.call(this,force);};
  const render = p._render;
  p._render = function() {
    render.call(this);
    const shell=this.__zontShellV095;
    if(shell?.active==='overview' && !this._overviewReportTimer){
      this._overviewReportTimer=setTimeout(()=>{
        this._overviewReportTimer=null;
        if(this.isConnected && this.__zontShellV095?.active==='overview')this._queue();
      },60*1000);
    }else if(shell?.active!=='overview' && this._overviewReportTimer){
      clearTimeout(this._overviewReportTimer);
      this._overviewReportTimer=null;
    }
    if(!this._climateTarget || shell?.active!=='climate' || this._loading)return;
    const room=shell.views.get('climate')?.querySelector('details[data-climate-room="'+this._climateTarget+'"]');
    this._climateTarget=null;
    if(!room)return;
    room.open=true;
    room.querySelector('summary').focus({preventScroll:true});
    const offset=room.getBoundingClientRect().top-shell.viewport.getBoundingClientRect().top;
    if(!shell.viewport.classList.contains('zoomed'))shell.viewport.scrollTop+=offset-8;
  };

  const disconnect = p.disconnectedCallback;
  p.disconnectedCallback = function() {
    clearTimeout(this._overviewReportTimer);
    this._overviewReportTimer=null;
    return disconnect.call(this);
  };

  const climateLabel = 'datchik_klimata_pomeshcheniia';
  const climateKinds = ['temperature','humidity','battery'];
  const roomName = name => name.replace(/^\s*\d+(?:\.\d+)?\.?\s*[-–—]\s*/,'');
  p._htClimate = function() {
    const intro=title('Температура и влажность')+'<small>Home Assistant · ярлык «Датчик климата помещения»</small>';
    if(this._loading&&!this._areas)return intro+warning('Загружаю реестр помещений…');
    if(!this._areas||!this._registry)return intro+warning('Реестр помещений недоступен');
    const rooms=new Map();
    const devices=[...this._devices.values()].filter(device=>device.labels?.includes(climateLabel));
    const taggedIds=new Set(devices.map(device=>device.id));
    const entriesByDevice=new Map();
    for(const entry of this._registry){
      if(entry.disabled_by||!entry.entity_id.startsWith('sensor.')||!taggedIds.has(entry.device_id))continue;
      if(!entriesByDevice.has(entry.device_id))entriesByDevice.set(entry.device_id,[]);
      entriesByDevice.get(entry.device_id).push(entry);
    }
    for(const device of devices){
      const entries=entriesByDevice.get(device.id)||[];
      const assigned=new Set(entries.map(e=>e.area_id).filter(Boolean));
      const areaId=device.area_id || (assigned.size===1 ? assigned.values().next().value : null);
      const area=this._areas.get(areaId);
      if(!area)continue;
      const states={temperature:[],humidity:[],battery:[]};
      for(const entry of entries){
        const state=this._hass?.states?.[entry.entity_id];
        const kind=entry.device_class || entry.original_device_class || state?.attributes?.device_class;
        if(climateKinds.includes(kind))states[kind].push(state);
      }
      if(!rooms.has(areaId))rooms.set(areaId,{area,sources:[]});
      rooms.get(areaId).sources.push({device,states});
    }
    if(!rooms.size)return intro+warning('Нет помещений с основным датчиком');
    const asReading = state => {
      const reading=num(state?.state);
      return reading===null ? 'Нет данных' : fmt(reading)+' '+esc(state.attributes?.unit_of_measurement || '');
    };
    const timestamp = state => {
      const time=Date.parse(state?.last_updated);
      return Number.isFinite(time) ? esc(new Date(time).toLocaleString('ru',{dateStyle:'short',timeStyle:'short',
        timeZone:this._hass?.config?.time_zone})) : 'Нет данных';
    };
    const cards=[...rooms.values()].sort((a,b)=>a.area.name.localeCompare(b.area.name,'ru',{numeric:true})).map(({area,sources})=>{
      const name=roomName(area.name);
      const target=name.toLowerCase()==='гостиная'?'living':/^детск[а-яё]*\s+ильи$/i.test(name)?'ilya':'';
      const source=unique(sources);
      const temp=unique(source?.states.temperature||[]);
      const humidity=unique(source?.states.humidity||[]);
      const battery=unique(source?.states.battery||[]);
      const note = source ? line('Основной датчик',esc(source.device.name_by_user || source.device.name || 'Датчик климата'))+
        line('Температура обновлена в HA',timestamp(temp))+line('Влажность обновлена в HA',timestamp(humidity))+
        (battery ? line('Батарея датчика',asReading(battery)) : '')+
        (source.states.temperature.length>1||source.states.humidity.length>1 ? '<small>Несколько показаний одного типа. Проверьте сущности устройства.</small>' : '')
        : '<small>Несколько устройств с ярлыком. Оставьте один основной датчик для помещения.</small>';
      return '<details data-detail="room-'+esc(area.area_id)+'"'+(target?' data-climate-room="'+target+'"':'')+
        '><summary class="ht-climate-row"><strong>'+esc(name)+'</strong><span class="ht-reading">'+asReading(temp)+
        '</span><span class="ht-reading">'+asReading(humidity)+'</span></summary><div class="ht-detail">'+note+'</div></details>';
    }).join('');
    return intro+'<div class="ht-climate-head"><span>Помещение</span><span>Темп.</span><span>Влажн.</span></div><div class="ht-card ht-climate">'+cards+'</div>';
  };
  p._htZoneName=function(zone){
    return this._config().zone_labels?.[zone.id] || zone.name.replace(/^🌡️\s*/,'').replace(/^ТГ\s*\d*\s*/,'').replace(/^Пол\s+/,'').trim() || 'Зона';
  };
  p._htZoneWindows=function(){
    const entries=this._registry || [];
    const areaOf=entry=>entry.area_id || this._devices.get(entry.device_id)?.area_id;
    const climates=entries.filter(entry=>entry.entity_id.startsWith('climate.'));
    const climateDevices=new Set(climates.map(entry=>entry.device_id).filter(Boolean));
    const windowsByArea=new Map();
    for(const entry of entries){
      if(entry.disabled_by||!entry.entity_id.startsWith('binary_sensor.')||climateDevices.has(entry.device_id))continue;
      const state=this._hass?.states?.[entry.entity_id];
      const kind=entry.device_class || state?.attributes?.device_class || entry.original_device_class;
      const area=areaOf(entry);
      if(kind!=='window'||!area)continue;
      if(!windowsByArea.has(area))windowsByArea.set(area,[]);
      windowsByArea.get(area).push(state?.state);
    }
    return new Map(climates.map(entry=>[entry.entity_id,windowsByArea.get(areaOf(entry))]));
  };
  const windowIcon=states=>{
    if(!states?.length)return '';
    const multiple=states.length>1;
    const [status,label,icon]=states.includes('on') ? ['open',multiple?'Есть открытое окно':'Окно открыто','mdi:window-open']
      : states.every(state=>state==='off') ? ['closed',multiple?'Окна закрыты':'Окно закрыто','mdi:window-closed']
      : ['unknown',multiple?'Нет данных об окнах':'Нет данных об окне','mdi:help-circle-outline'];
    return `<span class="ht-window ht-window-${status}" role="img" aria-label="${label}" title="${label}"><ha-icon icon="${icon}" aria-hidden="true"></ha-icon></span>`;
  };
  p._htZoneCard=function(zone,windowStates){
    const delta=zone.delta===null?'Отклонение неизвестно':zone.delta===0?'Температура у цели':`${zone.delta<0?'Ниже':'Выше'} цели на ${fmt(Math.abs(zone.delta))} °C`;
    const source=zone.sourceNote?`<small${zone.sourceWarning?' class="ht-heating"':''}>${esc(zone.sourceNote)}</small>`:'';
    const diagnostic=line('Статус термоголовки',esc(zone.missing?'Нет связи':zone.action))+
      line('Источник температуры',esc(zone.sourceNote||'Термоголовка'))+line('Сущность',esc(zone.id));
    return '<div class="ht-card" data-zone="'+esc(zone.id)+'"><div class="ht-pad"><div class="ht-head"><span>'+esc(this._htZoneName(zone))+
      '</span><span class="ht-status '+(zone.active?'ht-heating':'')+'">'+esc(zone.action)+'</span></div><div class="ht-values"><div><small>Сейчас</small><strong>'+
      fmt(zone.current)+(zone.current===null?'':' <em>°C</em>')+'</strong>'+source+'</div><div><small>Цель</small><strong>'+
      fmt(zone.target)+(zone.target===null?'':' <em>°C</em>')+'</strong></div></div><div class="ht-foot ht-zone-foot"><span>'+
      esc(zone.uncertain?'Часть данных не передаётся · '+delta:delta)+'</span>'+windowIcon(windowStates)+'</div></div>'+inlineDetail('zone-'+zone.id,diagnostic)+'</div>';
  };
  p._htZones=function(zones){
    const active=zones.filter(z=>z.active&&!z.missing);
    const absent=zones.filter(z=>z.missing);
    const idle=zones.filter(z=>!z.missing&&!z.active);
    const check=idle.filter(z=>z.sourceWarning||z.uncertain);
    const rest=idle.filter(z=>!z.sourceWarning&&!z.uncertain);
    const windows=this._htZoneWindows();
    const card=zone=>this._htZoneCard(zone,windows.get(zone.id));
    const incomplete=zones.filter(z=>!z.missing&&z.uncertain).length;
    const count=(total,label,tone)=>`<span${total ? ` class="${tone}"` : ''}>${total} ${label}</span>`;
    const summary=[count(active.length,'нагревает','ht-heating'),count(absent.length,'без связи','ht-offline'),
      count(incomplete,'с неполными данными','ht-heating')].join(' · ');
    const roomSensors=(this._config().zone_sensors||[]).map(sensor=>{
      const state=this._hass?.states?.[sensor.entity_id];
      const current=num(state?.state);
      const reading=state?.state==='unavailable'?'Нет связи':current===null?'Нет данных':`${fmt(current)} ${esc(state.attributes?.unit_of_measurement||'°C')}`;
      return line(sensor.label,reading);
    }).join('');
    return title('Зоны')+(zones.length?`<div class="ht-count">${summary}</div>`:'')+
      (active.length?'<h3>Сейчас нагревается</h3>'+active.map(card).join(''):'')+
      (check.length?'<h3>Требуют проверки</h3>'+check.map(card).join(''):'')+
      (absent.length?detail('absent',`Нет связи · ${absent.length} термостата`,absent.map(z=>line(this._htZoneName(z),z.current===null?'Нет данных':`${fmt(z.current)} °C · датчик комнаты`)+inlineDetail('zone-'+z.id,line('Статус термоголовки','Недоступна')+line('Сущность',esc(z.id)))).join('')):'')+
      (rest.length?detail('rest',`Не нагреваются · ${rest.length}`,rest.map(card).join('')):'')+
      (roomSensors?`<h3>Датчики температуры</h3><div class="ht-card ht-pad">${roomSensors}</div>`:'')+
      (!zones.length&&!roomSensors?warning('Термостаты не настроены'):'')+
      (zones.length?'<small>Отклонение от уставки не означает аварию. Режим auto не подтверждает нагрев.</small>':'');
  };
  p._htEquipmentModel=function(items){
    const pick=(pool,re)=>unique(pool.filter(i=>re.test(ownText(i))));
    const preferred=(pool,...patterns)=>{
      for(const pattern of patterns){
        const matches=pool.filter(i=>pattern.test(ownText(i)));
        if(matches.length)return unique(matches);
      }
      return unique(pool);
    };
    const primary=items.filter(i=>/[eе]bus|основн|main/.test(ownText(i))&&!/резерв|reserve/.test(ownText(i)));
    const reserve=items.filter(i=>/резерв|reserve/.test(ownText(i)));
    const temps=pool=>pool.filter(temperature);
    const excluded=/гвс|dhw|обрат|return|<<<|целев|устав|расч[её]т|target|вне дома|улиц|наруж|outdoor|outside/;
    const mainTemp=temps(primary).filter(i=>!excluded.test(ownText(i)));
    const reserveTemp=temps(reserve).filter(i=>!excluded.test(ownText(i)));
    const signal=re=>pick(items.filter(i=>i.entry.entity_id.startsWith('binary_sensor.')&&!/разреш|enable/.test(ownText(i))),re);
    const boilerActivity=pool=>unique(pool.filter(i=>i.entry.entity_id.startsWith('binary_sensor.')&&
      i.entry.platform==='zont_ha'&&i.state?.attributes?.device_class==='heat'&&/состояние|status/.test(ownText(i))));
    return {
      supply:preferred(mainTemp, /[eе]bus.*t°\s*тн/, /подач|supply|>>>/, /актуальн[а-яё]*[ _]+температур|actual[ _]+temp/),
      ret:pick(temps(primary),/обрат|return|<<</),
      reserve:preferred(reserveTemp,/актуальн[а-яё]*[ _]+температур|actual[ _]+temp/,/подач|supply|>>>/),
      boilerActivity:boilerActivity(primary),
      reserveActivity:boilerActivity(reserve),
      modulation:pick(primary,/модуляц|modulation/),
      burner:signal(/горелк|burner|пламя|flame/),
      online:unique(items.filter(i=>i.entry.entity_id.startsWith('binary_sensor.')&&i.state?.attributes?.device_class==='connectivity')),
      radiators:signal(/радиатор|radiator/),
      floor:signal(/т[её]пл.*пол|floor/),
      circulation:signal(/циркуляц|circulation/),
      dhw:this._dailyOverviewModel(items).metrics[1].item,
    };
  };
  const signalValue=item=>missing(item?.state)?'Нет данных':['on','heating','active','running'].includes(item.state.state)?'Включено':['off','idle','standby'].includes(item.state.state)?'Выключено':'Состояние неизвестно';
  p._htEquipment=function(items){
    const m=this._htEquipmentModel(items);
    const dhwStatus=this._dhwStateV096(items.filter(i=>/гвс|dhw/.test(ownText(i))));
    const pair=(a,b)=>'<div class="ht-values"><div><small>Подача</small><strong>'+value(a)+
      '</strong></div><div><small>Обратка</small><strong>'+value(b)+'</strong></div></div>';
    const errors=pattern=>{
      const sources=items.filter(i=>pattern.test(ownText(i))&&/ошиб|error|fault/.test(ownText(i)));
      return sources.length?sources.map(i=>line('Ошибки',value(i))).join(''):line('Ошибки','Нет данных');
    };
    const source=(label,item)=>line(label,esc(item?.entry.entity_id || 'Источник не определён'));
    const card=(key,header,body,diagnostics)=>'<div class="ht-card"><div class="ht-pad"><div class="ht-head">'+header+
      '</div>'+body+'</div>'+inlineDetail(key,diagnostics)+'</div>';
    const main=card('boiler','<span>Котёл 1</span><span class="ht-status">Основной</span>',
      '<small>Отопление и ГВС</small>'+pair(m.supply,m.ret),
      (m.boilerActivity?line('Работа котла',signalValue(m.boilerActivity)):'')+
      (m.burner?line('Горелка',signalValue(m.burner)):'')+line('Модуляция',value(m.modulation))+
      errors(/основн|main|[eе]bus/)+source('Источник подачи',m.supply)+source('Источник обратки',m.ret));
    const reserve=card('reserve-diagnostics','<span>Котёл 2</span><span class="ht-status">Резерв</span>',
      line('Температура',value(m.reserve)),(m.reserveActivity?line('Работа котла',signalValue(m.reserveActivity)):'')+
      errors(/резерв|reserve/)+source('Источник температуры',m.reserve));
    const circuits=[['radiators','Радиаторы',m.radiators],['floor','Тёплый пол',m.floor]].map(([key,name,item])=>
      card(key+'-diagnostics',name,'<div class="ht-foot">'+signalValue(item)+'</div>',source('Источник состояния',item))).join('');
    const water=card('dhw-diagnostics','<span>Горячая вода</span><span>'+value(m.dhw)+'</span>',
      line('Циркуляция',signalValue(m.circulation))+(dhwStatus?line(this._dhwSignalV096(dhwStatus)==='readiness'?'Готовность':'Состояние ГВС',esc(this._dhwStatusV096(dhwStatus))):''),
      source('Источник температуры ГВС',m.dhw)+source('Источник циркуляции',m.circulation));
    const scheme=items.length?detail('scheme','Гидравлическая схема',this._systemOverviewV089(items)):'';
    return title('Оборудование')+main+reserve+'<div class="ht-grid">'+circuits+'</div>'+water+scheme;
  };
  p._htHistoryData=function(items){
    const days=this.__htPeriod===7?7:1, m=this._htEquipmentModel(items), {floors,metrics}=this._dailyOverviewModel(items);
    const ids=[...new Set([...floors.map(floor=>floor.item),metrics[0].item,m.dhw,m.radiators,m.floor].filter(Boolean).map(i=>i.entry.entity_id))];
    const key=days+':'+ids.join(',');
    if(this.__htHistory?.key!==key){
      const request=(this.__htRequest||0)+1;this.__htRequest=request;
      const end=Date.now(),start=end-days*86400000;this.__htHistory={key,start,end,loading:true,data:[],error:null};
      if(!ids.length){this.__htHistory.loading=false;return this.__htHistory;}
      Promise.resolve().then(()=>this._hass.callApi('GET',`history/period/${new Date(start).toISOString()}?filter_entity_id=${encodeURIComponent(ids.join(','))}&end_time=${encodeURIComponent(new Date(end).toISOString())}`))
        .then(data=>{if(this.__htRequest===request)this.__htHistory={key,start,end,loading:false,data:Array.isArray(data)?data:[],error:null};})
        .catch(error=>{if(this.__htRequest===request)this.__htHistory={key,start,end,loading:false,data:[],error:String(error?.message||error)};})
        .finally(()=>{if(this.__htRequest===request)this._queue();});
    }
    return this.__htHistory;
  };
  p._htChart=function(samples,range,unit){
    const points=samples.map(s=>({t:Date.parse(s.last_updated||s.last_changed),v:missing(s)?null:num(s.state)})).filter(s=>Number.isFinite(s.t)).sort((a,b)=>a.t-b.t);
    const values=points.filter(s=>s.t>=range.start&&s.t<=range.end&&s.v!==null).map(s=>s.v);
    if(!values.length)return warning('Нет измерений за выбранный период');
    const [min,max]=values.reduce((r,v)=>[Math.min(r[0],v),Math.max(r[1],v)],[Infinity,-Infinity]);
    const pad=Math.max(.5,(max-min)*.15),lo=min-pad,hi=max+pad;
    let d='',pen=false;
    for(const s of points){if(s.t<range.start||s.t>range.end||s.v===null){pen=false;continue;}d+=`${pen?'L':'M'}${(44+(s.t-range.start)/(range.end-range.start)*280).toFixed(1)},${(116-(s.v-lo)/(hi-lo)*96).toFixed(1)} `;pen=true;}
    return `<svg class="ht-chart" viewBox="0 0 348 158" role="img" aria-label="Температура, ${esc(unit)}"><title>История измерений</title><rect x="44" y="20" width="280" height="96" fill="none" stroke="var(--divider-color)"/><text x="2" y="24">${hi.toFixed(1)}</text><text x="2" y="116">${lo.toFixed(1)}</text><text x="44" y="147">${range.end-range.start>86400000?'7 дн':'24 ч'} назад</text><text x="324" y="147" text-anchor="end">Сейчас</text><path d="${d}" fill="none" stroke="var(--primary-color)" stroke-width="2"/></svg><div class="ht-range">${fmt(min)}–${fmt(max)} ${esc(unit)} · диапазон измерений</div>`;
  };
  p._htActivity=function(samples,range){
    const ordered=samples.map(s=>({...s,t:Date.parse(s.last_updated||s.last_changed)})).filter(s=>Number.isFinite(s.t)).sort((a,b)=>a.t-b.t);
    if(!ordered.length)return '<small>Нет истории сигнала</small>';
    const segments=ordered.map((s,i)=>{const start=Math.max(range.start,s.t),end=Math.min(range.end,ordered[i+1]?.t||range.end);if(missing(s)||!['on','active','running','heating'].includes(s.state)||end<=start)return '';return `<i style="left:${(start-range.start)/(range.end-range.start)*100}%;width:${(end-start)/(range.end-range.start)*100}%"></i>`;}).join('');
    return `<div class="ht-band" role="img" aria-label="Подтверждённые интервалы включения">${segments}</div>`;
  };
  p._htHistory=function(items){
    const selected=['floor1','floor2','dhw','outside'].includes(this.__htMetric)?this.__htMetric:'floor1',days=this.__htPeriod===7?7:1;
    const button=(key,name,attr,on)=>`<button type="button" ${attr}="${key}" aria-pressed="${on}">${name}</button>`;
    const controls=`<div class="ht-pills">${[['floor1','1 этаж'],['floor2','2 этаж'],['outside','На улице'],['dhw','ГВС']].map(([key,name])=>button(key,name,'data-ht-metric',selected===key)).join('')}</div><div class="ht-pills">${button(1,'24 ч','data-ht-period',days===1)}${button(7,'7 дн','data-ht-period',days===7)}</div>`;
    const history=this._htHistoryData(items),m=this._htEquipmentModel(items),{floors,metrics}=this._dailyOverviewModel(items);
    if(history.loading)return title('История')+controls+warning('Загружаю историю…');
    if(history.error)return title('История')+controls+warning('История недоступна: '+history.error);
    const item={floor1:floors[0].item,floor2:floors[1].item,outside:metrics[0].item,dhw:m.dhw}[selected];
    const series=id=>history.data.find(s=>s[0]?.entity_id===id)||[];
    const name={floor1:floors[0].note,floor2:floors[1].note,outside:'Уличный датчик',dhw:'Горячая вода'}[selected];
    return title('История')+controls+`<div class="ht-card ht-pad"><div class="ht-head"><span>${name}</span><span>${value(item)}</span></div>${this._htChart(series(item?.entry.entity_id),history,item?.state?.attributes?.unit_of_measurement||'°C')}</div><h3>Активность контуров</h3><div class="ht-card ht-pad">`+
      [['Радиаторы',m.radiators],['Тёплый пол',m.floor]].map(([name,item])=>`<small>${name}</small>${this._htActivity(series(item?.entry.entity_id),history)}`).join('')+'</div>'+line('Циклы котла','Нет подтверждённого источника')+'<small>Полосы означают включение контура. Пропуски не считаются нормальной работой.</small>';
  };
  p._content=function(active,items){
    if(active.id==='overview')return baseContent.call(this,active,items);
    const zones=this._dailyZones();
    const html=active.id==='zones'?this._htZones(zones):active.id==='equipment'?this._htEquipment(items):active.id==='history'?this._htHistory(items):this._htClimate();
    return `${styles}<div class="ht" style="padding:14px">${html}</div>`;
  };
})();
