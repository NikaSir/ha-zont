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
  const detail = (key,title,html) => `<details class="ht-card" data-detail="${key}"><summary>${esc(title)}</summary><div class="ht-detail">${html}</div></details>`;
  const title = text => `<h2 class="ht-title">${text}</h2>`;
  const warning = text => `<div class="ht-warning">${esc(text)}</div>`;
  const styles = `<style>
    .ht{max-width:660px;margin:0 auto;color:var(--primary-text-color)}.ht-title{font-size:24px!important;margin:0 0 16px!important}.ht h3{font-size:14px;font-weight:500;color:var(--secondary-text-color);margin:17px 0 9px}.ht-card{background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:16px;overflow:hidden;margin:0 0 10px}.ht-pad{padding:15px}.ht-head{display:flex;justify-content:space-between;align-items:start;gap:10px;font-size:16px;font-weight:500}.ht small{font-size:12px;line-height:1.45;color:var(--secondary-text-color)}.ht-status{font-size:12px;color:var(--secondary-text-color);font-weight:400}.ht-heating{color:var(--warning-color,#d78c35)}.ht-values{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}.ht-values>div+div{border-left:1px solid var(--divider-color);padding-left:14px}.ht-values strong{font-size:27px;display:block;margin-top:4px;font-weight:500;font-variant-numeric:tabular-nums}.ht-values em{font-style:normal;font-size:15px}.ht-foot{border-top:1px solid var(--divider-color);padding-top:10px;margin-top:12px;font-size:12px;color:var(--secondary-text-color)}.ht-line{display:flex;justify-content:space-between;gap:14px;align-items:center;min-height:40px;padding:8px 0;border-bottom:1px solid var(--divider-color);font-size:13px;overflow-wrap:anywhere}.ht-line:last-child{border:0}.ht-line span{color:var(--secondary-text-color)}.ht-line strong{font-size:13px;font-weight:500;text-align:right;min-width:0}.ht summary{list-style:none;padding:13px 15px;min-height:48px;font-size:14px;display:flex;justify-content:space-between;gap:10px;align-items:center}.ht summary::-webkit-details-marker{display:none}.ht summary:after{content:'⌄';color:var(--secondary-text-color)}.ht details[open]>summary:after{content:'⌃'}.ht-detail{padding:0 15px 14px}.ht-warning{padding:12px 14px;border-radius:14px;background:color-mix(in srgb,var(--warning-color,#d78c35) 12%,var(--card-background-color));font-size:13px;margin-bottom:12px}.ht-count{font-size:13px;color:var(--secondary-text-color);margin-bottom:15px}.ht-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ht-pills{display:flex;gap:4px;padding:4px;border-radius:12px;background:var(--secondary-background-color);margin-bottom:12px}.ht .ht-pills button{flex:1;min-width:0;border:0;background:transparent;color:var(--secondary-text-color);font-size:13px;padding:7px 5px;min-height:40px}.ht .ht-pills button[aria-pressed=true]{background:var(--card-background-color);color:var(--primary-color)}.ht-chart{display:block;width:100%;height:auto}.ht-chart text{fill:var(--secondary-text-color);font-size:12px}.ht-range{font-size:12px;color:var(--secondary-text-color);padding:8px 0}.ht-band{height:12px;background:var(--secondary-background-color);border-radius:4px;position:relative;overflow:hidden;margin:8px 0 14px}.ht-band i{position:absolute;top:0;height:100%;background:var(--primary-color);border-radius:2px}.ht-source-id{font-size:11px;overflow-wrap:anywhere;display:block;color:var(--secondary-text-color)}
    @container nikas-panel (max-width:359px){.ht-pad{padding:12px}.ht-head{font-size:15px}.ht-values strong{font-size:24px}.ht-title{font-size:22px!important}}
  </style>`;
  const baseContent = p._content;
  const bind = p._bindWorkActionsV095;
  p._bindWorkActionsV095 = function(view) {
    bind.call(this,view);
    if(view.__htBound)return;
    view.__htBound=true;
    view.addEventListener('click',event=>{
      const button=event.target.closest?.('button[data-ht-metric],button[data-ht-period]');
      if(!button || !view.contains(button))return;
      if(button.dataset.htMetric)this.__htMetric=button.dataset.htMetric;
      if(button.dataset.htPeriod)this.__htPeriod=Number(button.dataset.htPeriod);
      this._queue();
    });
  };
  const originalLoad=p._load;
  p._load=function(force=false){if(force){this.__htRequest=(this.__htRequest||0)+1;this.__htHistory=null;}return originalLoad.call(this,force);};
  p._htZoneName=function(zone){
    return this._config().zone_labels?.[zone.id] || zone.name.replace(/^🌡️\s*/,'').replace(/^ТГ\s*\d*\s*/,'').replace(/^Пол\s+/,'').trim() || 'Зона';
  };
  p._htZoneCard=function(zone){
    const delta=zone.delta===null?'Отклонение неизвестно':zone.delta===0?'Температура у цели':`${zone.delta<0?'Ниже':'Выше'} цели на ${fmt(Math.abs(zone.delta))} °C`;
    return `<div class="ht-card ht-pad" data-zone="${esc(zone.id)}"><div class="ht-head"><span>${esc(this._htZoneName(zone))}</span><span class="ht-status ${zone.active?'ht-heating':''}">${esc(zone.action)}</span></div><div class="ht-values"><div><small>Сейчас</small><strong>${fmt(zone.current)}${zone.current===null?'':' <em>°C</em>'}</strong></div><div><small>Цель</small><strong>${fmt(zone.target)}${zone.target===null?'':' <em>°C</em>'}</strong></div></div><div class="ht-foot">${esc(zone.uncertain?'Часть данных не передаётся · '+delta:delta)}</div></div>`;
  };
  p._htZones=function(zones){
    const active=zones.filter(z=>z.active&&!z.missing), absent=zones.filter(z=>z.missing), check=zones.filter(z=>!z.missing&&!z.active&&(z.uncertain||(z.delta!==null&&z.delta!==0))), rest=zones.filter(z=>!active.includes(z)&&!absent.includes(z)&&!check.includes(z));
    return title('Зоны')+`<div class="ht-count">${active.length} нагревает · ${absent.length} без связи · ${zones.filter(z=>!z.missing&&z.uncertain).length} с неполными данными</div>`+
      (active.length?'<h3>Сейчас нагревается</h3>'+active.map(z=>this._htZoneCard(z)).join(''):'')+
      (check.length?'<h3>Требуют проверки</h3>'+check.map(z=>this._htZoneCard(z)).join(''):'')+
      (absent.length?detail('absent',`Нет связи · ${absent.length} термостата`,absent.map(z=>line(this._htZoneName(z),'Нет данных')).join('')):'')+
      (rest.length?detail('rest',`Остальные зоны · ${rest.length}`,rest.map(z=>this._htZoneCard(z)).join('')):'')+
      (!zones.length?warning('Термостаты не настроены'):'')+'<small>Отклонение от уставки не означает аварию. Режим auto не подтверждает нагрев.</small>';
  };
  p._htEquipmentModel=function(items){
    const pick=(pool,re)=>unique(pool.filter(i=>re.test(ownText(i))));
    const primary=items.filter(i=>/ebus|основн|main/.test(ownText(i))&&!/резерв|reserve/.test(ownText(i)));
    const reserve=items.filter(i=>/резерв|reserve/.test(ownText(i)));
    const temps=pool=>pool.filter(temperature);
    const mainTemp=temps(primary).filter(i=>!/гвс|dhw|обрат|return|целев|устав|расч[её]т|target/.test(ownText(i)));
    const reserveTemp=temps(reserve).filter(i=>!/целев|устав|расч[её]т|target|обрат|return|гвс/.test(ownText(i)));
    const signal=re=>pick(items.filter(i=>i.entry.entity_id.startsWith('binary_sensor.')&&!/разреш|enable/.test(ownText(i))),re);
    return {supply:pick(mainTemp,/подач|supply|>>>/) || unique(mainTemp),ret:pick(temps(primary),/обрат|return|<<</),reserve:unique(reserveTemp),modulation:pick(primary,/модуляц|modulation/),burner:signal(/горелк|burner/),radiators:signal(/радиатор|radiator/),floor:signal(/т[её]пл.*пол|floor/),circulation:signal(/циркуляц|circulation/),dhw:this._dailyOverviewModel(items).metrics[2].item};
  };
  const signalValue=item=>missing(item?.state)?'Нет данных':['on','heating','active','running'].includes(item.state.state)?'Включено':['off','idle','standby'].includes(item.state.state)?'Выключено':'Состояние неизвестно';
  p._htEquipment=function(items){
    const m=this._htEquipmentModel(items);
    const pair=(a,b)=>`<div class="ht-values"><div><small>Подача</small><strong>${value(a)}</strong></div><div><small>Обратка</small><strong>${value(b)}</strong></div></div>`;
    return title('Оборудование')+`<div class="ht-card"><div class="ht-pad"><div class="ht-head"><span>Котёл 1</span><span class="ht-status">Основной</span></div><small>Отопление и ГВС</small>${pair(m.supply,m.ret)}</div>`+
      `<details data-detail="boiler"><summary>Подробности</summary><div class="ht-detail">${line('Горелка',signalValue(m.burner))}${line('Модуляция',value(m.modulation))}</div></details></div>`+
      `<div class="ht-card ht-pad"><div class="ht-head"><span>Котёл 2</span><span class="ht-status">Резерв</span></div>${line('Температура',value(m.reserve))}<small>Резервная роль — не признак работы</small></div>`+
      `<div class="ht-grid">${[['Радиаторы',m.radiators],['Тёплый пол',m.floor]].map(([name,item])=>`<div class="ht-card ht-pad"><div class="ht-head">${name}</div><div class="ht-foot">${signalValue(item)}</div></div>`).join('')}</div>`+
      `<div class="ht-card ht-pad"><div class="ht-head"><span>Горячая вода</span><span>${value(m.dhw)}</span></div>${line('Циркуляция',signalValue(m.circulation))}<small>Готовность: ${esc(this._dhwStatusV096(this._dhwStateV096(items.filter(i=>/гвс|dhw/.test(ownText(i))))))}</small></div>`;
  };
  p._htHistoryData=function(items){
    const days=this.__htPeriod===7?7:1,m=this._htEquipmentModel(items),metrics=this._dailyOverviewModel(items).metrics;
    const ids=[...new Set([metrics[0].item,metrics[1].item,m.dhw,m.radiators,m.floor].filter(Boolean).map(i=>i.entry.entity_id))];
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
    const selected=['home','dhw','outside'].includes(this.__htMetric)?this.__htMetric:'home',days=this.__htPeriod===7?7:1;
    const button=(key,name,attr,on)=>`<button type="button" ${attr}="${key}" aria-pressed="${on}">${name}</button>`;
    const controls=`<div class="ht-pills">${[['home','В доме'],['dhw','ГВС'],['outside','На улице']].map(([key,name])=>button(key,name,'data-ht-metric',selected===key)).join('')}</div><div class="ht-pills">${button(1,'24 ч','data-ht-period',days===1)}${button(7,'7 дн','data-ht-period',days===7)}</div>`;
    const history=this._htHistoryData(items),m=this._htEquipmentModel(items),metrics=this._dailyOverviewModel(items).metrics;
    if(history.loading)return title('История')+controls+warning('Загружаю историю…');
    if(history.error)return title('История')+controls+warning('История недоступна: '+history.error);
    const item=selected==='home'?metrics[0].item:selected==='outside'?metrics[1].item:m.dhw;
    const series=id=>history.data.find(s=>s[0]?.entity_id===id)||[];
    const name=selected==='home'?'Гостиная':selected==='dhw'?'Горячая вода':'Уличный датчик';
    return title('История')+controls+`<div class="ht-card ht-pad"><div class="ht-head"><span>${name}</span><span>${value(item)}</span></div>${this._htChart(series(item?.entry.entity_id),history,item?.state?.attributes?.unit_of_measurement||'°C')}</div><h3>Активность контуров</h3><div class="ht-card ht-pad">`+
      [['Радиаторы',m.radiators],['Тёплый пол',m.floor]].map(([name,item])=>`<small>${name}</small>${this._htActivity(series(item?.entry.entity_id),history)}`).join('')+'</div>'+line('Циклы котла','Нет подтверждённого источника')+'<small>Полосы означают включение контура. Пропуски не считаются нормальной работой.</small>';
  };
  p._htService=function(items,zones){
    const absent=zones.filter(z=>z.missing),m=this._htEquipmentModel(items);
    const online=unique(items.filter(i=>/online|подключ/.test(ownText(i))));
    const channel=this._connectionStatusV096(items,online);
    const dates=items.map(i=>Date.parse(i.state?.last_reported||i.state?.last_updated)).filter(Number.isFinite);
    const age=dates.length?Math.max(0,Math.floor((Date.now()-Math.max(...dates))/60000)):null;
    const errors=items.filter(i=>this._role(i)==='error');
    return title('Сервис')+(absent.length?warning(`${absent.length} термостата недоступны`):'')+
      `<div class="ht-card ht-pad"><div class="ht-head">ZONT → Home Assistant</div>${line('Получение данных HA',this._error?'Ошибка реестра':items.length?'Есть':'Нет данных')}${line('Канал к контроллеру',channel.unknown?'Не подтверждён':esc(channel.text))}${line('Обновление в HA',age===null?'Нет отметки времени':age===0?'Менее минуты назад':age+' мин назад')}<small>Время получения HA не подтверждает свежесть измерения контроллера.</small></div><h3>Замечания и неполные данные</h3>`+
      (absent.length?detail('lost','Недоступные термостаты',absent.map(z=>line(this._htZoneName(z),'Нет данных')).join('')):'')+
      zones.filter(z=>!z.missing&&z.uncertain).map(z=>detail('zone-'+z.id,this._htZoneName(z)+' · неполные данные','<small>Проверьте наличие температуры, уставки и hvac_action у источника. Auto не означает нагрев.</small>')).join('')+
      (m.burner?'':detail('burner','Горелка · нет источника','<small>Активность и циклы не рассчитываются по температуре.</small>'))+
      detail('errors','Ошибки оборудования',errors.length?errors.map(i=>line(this._semanticName(i),value(i))).join(''):'<small>Источники состояния ошибок не найдены.</small>')+
      '<h3>Технические сведения</h3>'+detail('sources','Источники показаний',this._dailyOverviewModel(items).metrics.map(metric=>line(metric.label,metric.item?`<span class="ht-source-id">${esc(metric.item.entry.entity_id)}</span>`:'Не определён')).join(''))+
      detail('scheme','Схема системы',items.length?this._systemOverviewV089(items):'<small>Телеметрия ZONT не получена.</small>');
  };
  p._content=function(active,items){
    if(active.id==='overview')return baseContent.call(this,active,items);
    const zones=this._dailyZones();
    const html=active.id==='zones'?this._htZones(zones):active.id==='equipment'?this._htEquipment(items):active.id==='history'?this._htHistory(items):this._htService(items,zones);
    return `${styles}<div class="ht" style="padding:14px">${html}</div>`;
  };
})();
