const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
async function assertFits(locator,label) {
 const layout=await locator.evaluate(root=>{
  const bounds=root.getBoundingClientRect();
  const elements=[...root.querySelectorAll('*')];
  const position=(node)=>{
   const range=document.createRange();
   range.selectNodeContents(node);
   const r=node.nodeType===Node.TEXT_NODE?range.getBoundingClientRect():node.getBoundingClientRect();
   return [Math.round(r.left),Math.round(r.right)];
  };
  const overflow=elements.flatMap(el=>[el,...[...el.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE)])
   .map(node=>({tag:node.parentElement?.tagName,name:node.className||node.textContent?.trim().slice(0,90),edges:position(node)}))
   .filter(({edges:[left,right]})=>right>bounds.right+1 || (right>left && left<bounds.left-1)).slice(-12);
  return {width:root.clientWidth,scroll:root.scrollWidth,viewport:innerWidth,overflow};
 });
 assert.ok(layout.scroll<=layout.width+1,label+': '+JSON.stringify(layout));
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
 for(const width of [320,390,430,768]) {
  const page=await browser.newPage({viewport:{width,height:932}});
  const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR:',e.message);});
  // HA navigation uses same-origin history. about:blank has no usable pathname.
  await page.route('http://zont.test/**',route=>route.fulfill({contentType:'text/html',body:'<html><body></body></html>'}));
  await page.goto('http://zont.test/');
  const light=width===320 || width===430;
  await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;--primary-text-color:${light?'#141414':'#eee'};--secondary-text-color:${light?'#5f5f5f':'#aaa'};--card-background-color:${light?'#fdfdfd':'#202020'};--primary-background-color:${light?'#f7f7f7':'#111'};--secondary-background-color:${light?'#efefef':'#282828'};--divider-color:${light?'#ddd':'#444'};--primary-color:#03a9cf}zont-local-panel{display:block;width:100%;height:100%}</style>`);
  await page.addScriptTag({path:'custom_components/zont_local/frontend/zont-ui.js'});
  await page.evaluate(()=>{
   // Home Assistant supplies this element in production. Give the fixture
   // the same icon footprint so visibility and layout assertions are meaningful.
   customElements.define('ha-icon',class extends HTMLElement {
    constructor(){
     super();
     // The panel patches host attributes on updates. Keep size inside the
     // custom element, like the Home Assistant implementation does.
     const root=this.attachShadow({mode:'open'});
     root.innerHTML='<style>:host{display:inline-block;width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px)}</style>';
    }
   });
   const panel=document.createElement('zont-local-panel');
   const data=[['sensor.room','Гостиная (t°)','23.2','°C'],['sensor.child','Детская 2 (t°)','22.6','°C'],['sensor.out','Уличный датчик','4.5','°C'],['sensor.kontroller_otopleniia_sample_h2000_pro_ebus_osnovnoi_no2_tdeg_gvs','t° ГВС','45','°C'],['sensor.p','Теплоноситель','1.9','bar'],['binary_sensor.floor','Тёплый пол','on',''],
    ['binary_sensor.radiators','Радиаторы','off',''],['binary_sensor.circulation','Циркуляция','unavailable',''],
    ['binary_sensor.online','Controller online','on','']];
   panel._registry=data.map(([entity_id,name])=>({entity_id,original_name:name,platform:'zont'}));
   panel._hass={states:Object.fromEntries(data.map(([entity_id,friendly_name,state,unit_of_measurement])=>[entity_id,{entity_id,state,attributes:{friendly_name,unit_of_measurement},last_updated:new Date().toISOString()}]))};
   panel._hass.states['binary_sensor.online'].attributes.device_class='connectivity';
   panel._areas=new Map([['child',{area_id:'child',name:'05 - Детская Ильи'}]]);
   panel._devices=new Map([['child',{id:'child',area_id:'child',labels:['datchik_klimata_pomeshcheniia'],name:'Zigbee Илья'}]]);
   panel._registry.push({entity_id:'sensor.child_ha',device_id:'child',original_device_class:'temperature',platform:'mqtt'});
   panel._registry.push({entity_id:'climate.a',area_id:'room'},{entity_id:'binary_sensor.room_window',area_id:'room',device_class:'window'});
   panel._hass.states['binary_sensor.room_window']={state:'off',attributes:{device_class:'window'}};
   panel._hass.states['sensor.child_ha']={state:'24.4',attributes:{device_class:'temperature',unit_of_measurement:'°C'}};
   panel._hass.states['climate.a']={state:'auto',attributes:{friendly_name:'ТГ Гардероб',current_temperature:20,temperature:22,hvac_action:'heating'}};
   panel._hass.states['climate.b']={state:'unavailable',attributes:{friendly_name:'Гараж'}};
   panel._hass.states['sensor.hall_temperature']={state:'13.2',attributes:{unit_of_measurement:'°C'}};
   panel._hass.states['switch.socket_wf4']={state:'on',attributes:{}};
   panel._hass.states['switch.socket_wf2']={state:'off',attributes:{}};
   panel._hass.states['switch.socket_wf3']={state:'unavailable',attributes:{}};
   for(const [socket,state] of [['wf4','1187.5'],['wf2','0.0'],['wf3','unavailable']]){
    const sensor=`sensor.${socket}_power`;
    panel._registry.push({entity_id:`switch.socket_${socket}`,device_id:socket},{entity_id:sensor,device_id:socket});
    panel._hass.states[sensor]={state,attributes:{device_class:'power',unit_of_measurement:'W'}};
   }
   panel._hass.callApi=async(method,path)=>{
    if(method==='GET' && path.startsWith('states/')){
     return {last_reported:new Date().toISOString()};
    }
    return [[{entity_id:'sensor.room',state:'22',last_changed:new Date(Date.now()-3600000).toISOString()},{entity_id:'sensor.room',state:'23',last_changed:new Date().toISOString()}]];
   };
   panel._panel={config:{source:{platforms:['zont']},zone_entities:['climate.a','climate.b'],zone_sensors:[{entity_id:'sensor.hall_temperature',label:'Тамбур'}],heating_outlets:[{entity_id:'switch.socket_wf4',label:'Тамбур · WF4',on_below:8,off_above:10},{entity_id:'switch.socket_wf2',label:'Веранда · WF2',on_below:8,off_above:10},{entity_id:'switch.socket_wf3',label:'Веранда · WF3',on_below:8,off_above:10}]}};
   document.body.append(panel);
   window.testPanel=panel;
  });
  await page.locator('zont-local-panel .overview-metric').first().waitFor();
  await page.locator('zont-local-panel .overview-lamps .current').waitFor();
  const title=page.locator('zont-local-panel #zont-title');
  await page.emulateMedia({colorScheme:light?'dark':'light'});
  await page.evaluate(darkMode=>{
   const panel=window.testPanel;
   panel.hass={...panel.hass,themes:{darkMode}};
   panel.panel={...panel.panel,config:{...panel.panel.config,integration_version:'1.9.11-beta007'}};
  },!light);
  await title.getByText('UI v0.11.0-beta013 / 1.9.11-beta007',{exact:true}).waitFor({timeout:3000});
  const heading=await title.evaluate(el=>{
   const rail=el.parentElement.getBoundingClientRect(), box=el.getBoundingClientRect();
   const version=el.querySelector('small'), style=getComputedStyle(version);
   const button=el.parentElement.querySelector('#zont-refresh');
   const rgb=getComputedStyle(button).backgroundColor.match(/[0-9.]+/g).map(Number);
   const linear=v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;
   const lightness=rgb.slice(0,3).map(v=>linear(v>1?v/255:v))
     .reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i],0);
   return {center:Math.abs(box.left+box.width/2-rail.left-rail.width/2),
     overflow:version.scrollWidth-version.clientWidth,wrap:style.whiteSpace,
     weight:getComputedStyle(el.querySelector('strong')).fontWeight,
     arrow:getComputedStyle(button.querySelector('ha-icon')).color,
     background:getComputedStyle(button).backgroundColor,contrast:1.05/(lightness+.05)};
  });
  assert.ok(heading.center<1&&heading.overflow<=1);
  assert.equal(heading.wrap,'nowrap');
  assert.equal(heading.weight,'700');
  assert.equal(heading.arrow,light?'rgb(0, 0, 0)':'rgb(255, 255, 255)');
  if(light)assert.equal(heading.background,'rgb(255, 255, 255)');
  else assert.ok(heading.contrast>=3);
  if(width===430){
   const refresh=page.locator('zont-local-panel #zont-refresh');
   const before=await refresh.elementHandle();
   for(const darkMode of [true,false]){
    await page.evaluate(mode=>{
     const panel=window.testPanel;
     panel.hass={...panel.hass,themes:{darkMode:mode}};
    },darkMode);
    await page.waitForFunction(({button,mode})=>
     getComputedStyle(button.querySelector('ha-icon')).color===(mode?'rgb(255, 255, 255)':'rgb(0, 0, 0)'),
    {button:before,mode:darkMode});
    assert.ok(await refresh.evaluate((button,old)=>button===old,before));
   }
   await before.dispose();
  }
  const overview=page.locator('zont-local-panel .overview');
  const indicatorColor=el=>el.evaluate(node=>getComputedStyle(node).color);
  for(const [equipment, equipmentStatus, outlet, outletStatus, expectedTone, watts] of [
   ['Тёплый пол','Включено','Тамбур · WF4','Включена','orange',/^1\s?187,5\sВт$/],
   ['Радиаторы','Выключено','Веранда · WF2','Выключена','blue',/^0\sВт$/],
   ['Циркуляция','Недоступно','Веранда · WF3','Нет связи','gray',/^—$/],
  ]){
   const equipmentRow=overview.locator('.overview-node').filter({has:page.getByText(equipment,{exact:true})});
   const outletRow=overview.locator('.overview-node').filter({has:page.getByText(outlet,{exact:true})});
   const color=await indicatorColor(equipmentRow.getByText(equipmentStatus,{exact:true}));
   assert.equal(await indicatorColor(equipmentRow.locator(':scope > ha-icon')),color);
   assert.equal(await indicatorColor(outletRow.locator('ha-icon')),color);
   assert.equal(await indicatorColor(outletRow.getByText(outletStatus,{exact:true})),color);
   const rotor=equipmentRow.getByRole('img',{name:/^Насос/}).locator('ha-icon');
   assert.equal(await rotor.evaluate(el=>getComputedStyle(el).animationName),equipmentStatus==='Включено'?'overview-pump-spin':'none');
   const rotorPosition=await rotor.evaluate(el=>{
    const pump=el.parentElement.getBoundingClientRect();
    const row=el.closest('.overview-node').getBoundingClientRect();
    return (pump.left+pump.width/2-row.left)/row.width;
   });
   assert.ok(rotorPosition>=0.5 && rotorPosition<=0.73,`rotor stays in the middle column at ${width}px`);
   const power=outletRow.locator('.overview-node-power');
   assert.match(await power.textContent(),watts);
   const powerFits=await power.evaluate(el=>el.scrollWidth<=el.clientWidth+1 && el.getBoundingClientRect().right<el.nextElementSibling.getBoundingClientRect().left);
   assert.ok(powerFits,`power stays left of ${outletStatus} at ${width}px`);
   const {tone,contrast}=await equipmentRow.getByText(equipmentStatus,{exact:true}).evaluate(node=>{
    const context=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
    const rgb=value=>{
     context.fillStyle=value;
     context.fillRect(0,0,1,1);
     return [...context.getImageData(0,0,1,1).data].slice(0,3);
    };
    const luminance=values=>values.map(value=>value/255)
     .map(value=>value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4)
     .reduce((sum,value,index)=>sum+value*[0.2126,0.7152,0.0722][index],0);
    const foreground=rgb(getComputedStyle(node).color);
    const background=rgb(getComputedStyle(node.closest('.overview-nodes')).backgroundColor);
    const [r,g,b]=foreground;
    const tone=r>g&&g>b?'orange':b>g&&g>r?'blue':r===g&&g===b?'gray':'other';
    const levels=[luminance(foreground),luminance(background)];
    return {tone,contrast:(Math.max(...levels)+0.05)/(Math.min(...levels)+0.05)};
   });
   assert.equal(tone,expectedTone);
   assert.ok(contrast>=4.5,`${equipmentStatus} on ${light?'light':'dark'} theme: ${contrast.toFixed(2)}:1`);
  }
  const lamps=overview.locator('.overview-lamps');
  const connection=lamps.getByRole('img',{name:/^Связь/});
  const freshness=lamps.getByRole('img',{name:/^Свежесть/});
  assert.equal(await indicatorColor(connection),'rgb(67, 160, 71)');
  assert.equal(await indicatorColor(freshness),'rgb(67, 160, 71)');
  if(width===390){
   const rotor=overview.locator('.overview-node').filter({has:page.getByText('Тёплый пол',{exact:true})}).locator('.overview-node-pump ha-icon');
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await rotor.evaluate(el=>getComputedStyle(el).animationName),'none');
   await page.emulateMedia({reducedMotion:'no-preference'});
   const rotorBefore=await rotor.elementHandle();
   await page.evaluate(()=>{
    const panel=window.testPanel;
    const states=panel.hass.states;
    panel.hass={...panel.hass,states:{...states,
     'sensor.room':{...states['sensor.room'],last_reported:new Date(Date.now()-16*60000).toISOString()},
     'sensor.wf4_power':{...states['sensor.wf4_power'],state:'924'},
    }};
   });
   await lamps.getByRole('img',{name:'Свежесть · Данные в HA устарели'}).waitFor();
   assert.equal(await indicatorColor(connection),'rgb(67, 160, 71)');
   assert.equal(await indicatorColor(freshness),'rgb(255, 152, 0)');
   assert.equal(await freshness.locator('ha-icon').getAttribute('icon'),'mdi:clock-alert-outline');
   assert.ok(await rotor.evaluate((el,previous)=>el===previous,rotorBefore),'a new reading keeps the running rotor mounted');
   await overview.getByText('924 Вт',{exact:true}).waitFor();
   await page.evaluate(()=>{
    const panel=window.testPanel, states=panel.hass.states;
    panel.hass={...panel.hass,states:{...states,
     'binary_sensor.online':{...states['binary_sensor.online'],state:'off'},
     'sensor.room':{...states['sensor.room'],state:'unavailable'},
    }};
   });
   await lamps.getByRole('img',{name:'Свежесть · Нет данных о свежести'}).waitFor();
   assert.equal(await indicatorColor(connection),'rgb(255, 152, 0)');
   assert.equal(await indicatorColor(freshness),'rgb(170, 170, 170)');
   assert.equal(await freshness.locator('ha-icon').getAttribute('icon'),'mdi:clock-outline');
   assert.equal(await freshness.locator('.overview-lamp-question').textContent(),'?');
   assert.equal(await rotor.evaluate(el=>getComputedStyle(el).animationName),'none');
   await rotorBefore.dispose();
   await page.evaluate(()=>{
    const panel=window.testPanel, states=panel.hass.states;
    panel.hass={...panel.hass,states:{...states,'sensor.room':{...states['sensor.room'],state:'23.2',last_reported:new Date().toISOString()}}};
   });
  }
  assert.ok((await overview.innerText()).includes('Веранда · WF3'));
  assert.ok((await page.locator('zont-local-panel .overview').innerText()).includes('Нет связи'));
  assert.equal(await page.getByText('Вкл. ниже 8 °C · Выкл. выше 10 °C',{exact:true}).count(),3);
  const floors=await page.locator('zont-local-panel .overview-floor').all();
  const cards=await page.locator('zont-local-panel .overview-metric').all();
  assert.equal(floors.length,2);
  assert.equal(cards.length,3);
  const floorBoxes=await Promise.all(floors.map(c=>c.boundingBox()));
  const boxes=await Promise.all(cards.map(c=>c.boundingBox()));
  assert.ok(Math.abs(floorBoxes[0].y-floorBoxes[1].y)<2,'floor pair shares a row');
  assert.ok(boxes[0].y>floorBoxes[0].y && boxes.every(box=>Math.abs(box.y-boxes[0].y)<2),'three secondary measurements share a row');
  const overviewDiagnostics=page.locator('zont-local-panel details[data-detail="zont-diagnostics"] > summary');
  const collapsedLayout=await overviewDiagnostics.evaluate(summary=>{
   const bounds=summary.getBoundingClientRect();
   return {height:bounds.height,bottomGap:summary.closest('.overview-hero').getBoundingClientRect().bottom-bounds.bottom};
  });
  assert.ok(collapsedLayout.height>=44,'collapsed diagnostics keeps its touch target');
  assert.ok(collapsedLayout.bottomGap<=5,'collapsed diagnostics leaves no extra bottom space: '+JSON.stringify(collapsedLayout));
  await overviewDiagnostics.click();
  await page.evaluate(()=>window.testPanel._render());
  assert.ok(await page.locator('zont-local-panel details[data-detail="zont-diagnostics"]').evaluate(el=>el.open));
  if(width===390){
   const refresh=page.locator('zont-local-panel #zont-refresh');
   await page.evaluate(()=>{
    const panel=window.testPanel;
    const registry=panel._registry.map(entry=>entry.platform==='zont'
     ? {...entry,platform:'zont_ha',config_entry_id:'zont-test-entry'} : entry);
    panel._panel.config.source.platforms.push('zont_ha');
    panel._registry=registry;
    window.refreshButton=panel.shadowRoot.querySelector('#zont-refresh');
    window.refreshCalls=[];
    window.refreshReply=new Promise(resolve=>{window.finishRefresh=resolve;});
    panel.hass={...panel.hass,services:{homeassistant:{update_entity:{}}},callService:(...args)=>{
     window.refreshCalls.push(args);
     return window.refreshReply;
    },callWS:({type})=>Promise.resolve({
     'config/entity_registry/list':registry,
     'config/device_registry/list':[...panel._devices.values()],
     'config/area_registry/list':[...panel._areas.values()],
    }[type])};
   });
   await refresh.click();
   assert.equal(await refresh.getAttribute('aria-busy'),'true');
   assert.ok(await refresh.isDisabled());
   assert.equal(await refresh.locator('ha-icon').evaluate(el=>getComputedStyle(el).animationDuration),'0.9s');
   assert.deepEqual(await page.evaluate(()=>window.refreshCalls),[['homeassistant','update_entity',{entity_id:['sensor.room']}]]);
   await page.evaluate(()=>{
    const panel=window.testPanel;
    window.refreshButton.click();
    panel.hass={...panel.hass};
   });
   await page.waitForTimeout(950);
   assert.ok(await refresh.isDisabled(),'slow request remains busy beyond the minimum');
   assert.equal(await page.evaluate(()=>window.refreshCalls.length),1);
   await page.evaluate(()=>window.finishRefresh({}));
   const success=page.getByRole('button',{name:'Запрос обновления выполнен'});
   await success.waitFor();
   assert.equal(await refresh.locator('ha-icon').getAttribute('icon'),'mdi:check');
   assert.ok(await page.evaluate(()=>window.refreshButton===window.testPanel.shadowRoot.querySelector('#zont-refresh')));
   assert.ok(await page.locator('zont-local-panel details[data-detail="zont-diagnostics"]').evaluate(el=>el.open));
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.evaluate(()=>{window.refreshReply=Promise.resolve(false);});
   await success.press('Enter');
   assert.equal(await refresh.getAttribute('aria-busy'),'true');
   assert.equal(await refresh.locator('ha-icon').evaluate(el=>getComputedStyle(el).animationName),'none');
   const failure=page.getByRole('button',{name:'Не удалось обновить данные'});
   await failure.waitFor();
   assert.equal(await refresh.locator('ha-icon').getAttribute('icon'),'mdi:alert-circle-outline');
   await page.getByRole('status').filter({hasText:'Не удалось обновить данные'}).waitFor();
   assert.ok(await refresh.isEnabled());
   await page.getByRole('button',{name:'Обновить',exact:true}).waitFor();
   await page.evaluate(()=>{const panel=window.testPanel;panel.hass={...panel.hass,services:{}};});
   await refresh.click();
   await failure.waitFor();
   assert.equal(await page.evaluate(()=>window.refreshCalls.length),2,'missing service dispatches no request');
  }
  await floors[1].click();
  const child=page.locator('zont-local-panel details[data-climate-room="ilya"]');
  await child.waitFor();
  assert.match(await child.innerText(),/24,4 °C/);
  assert.ok(await child.evaluate(el=>el.open));
  await page.locator('zont-local-panel #zont-tabs button[data-tab="overview"]').click();
  await page.evaluate(()=>{window.shellBefore=window.testPanel.shadowRoot.querySelector('.nikas-shell');window.testPanel._render();});
  assert.ok(await page.evaluate(()=>window.shellBefore===window.testPanel.shadowRoot.querySelector('.nikas-shell')),'telemetry retains shell');
  await assertFits(page.locator('zont-local-panel .overview'),'overview');
  for(const tab of ['climate','zones','equipment','history']) {
   await page.locator(`zont-local-panel #zont-tabs button[data-tab="${tab}"]`).click();
   const view=page.locator(`zont-local-panel .zont-work-view[data-view="${tab}"]:not([hidden])`);
   await view.locator('.ht-title').waitFor();
   await assertFits(view,tab);
   if(tab==='zones'){
    await page.evaluate(()=>{
     window.zoneTargets=[];
     window.addEventListener('hass-more-info',event=>window.zoneTargets.push(event.detail.entityId));
    });
    const count=view.locator('.ht-count');
    const heating=count.getByText('1 нагревает',{exact:true});
    const offline=count.getByText('1 без связи',{exact:true});
    const incomplete=count.getByText('0 с неполными данными',{exact:true});
    assert.notEqual(await heating.evaluate(el=>getComputedStyle(el).color),await offline.evaluate(el=>getComputedStyle(el).color));
    assert.equal(await incomplete.evaluate(el=>getComputedStyle(el).color),await count.evaluate(el=>getComputedStyle(el).color));
    const card=view.locator('[data-zone="climate.a"]');
    const windowIcon=card.locator('.ht-zone-foot .ht-window');
    assert.equal(await windowIcon.getAttribute('aria-label'),'Окно закрыто');
    assert.equal(await windowIcon.evaluate(el=>getComputedStyle(el).color),'rgb(3, 169, 207)');
    await card.locator('summary').click();
    await page.evaluate(()=>{
     const panel=window.testPanel;
     window.zoneBefore=panel.shadowRoot.querySelector('[data-zone="climate.a"]');
     panel.hass={...panel.hass,states:{...panel.hass.states,'binary_sensor.room_window':{state:'on',attributes:{device_class:'window'}}}};
    });
    await card.getByRole('img',{name:'Окно открыто'}).waitFor();
    assert.equal(await windowIcon.evaluate(el=>getComputedStyle(el).color),'rgb(255, 193, 7)');
    assert.ok(await card.locator('details').evaluate(el=>el.open&&el.parentElement===window.zoneBefore));
    assert.equal(await view.getByText('Тамбур',{exact:true}).count(),0);
    assert.equal(await view.getByText('Датчики температуры',{exact:true}).count(),0);
    assert.deepEqual(await page.evaluate(()=>window.zoneTargets),[],'diagnostics and telemetry do not open entity details');
    const zoneTitle=card.getByRole('button',{name:'Гардероб',exact:true});
    await zoneTitle.click();
    await zoneTitle.press('Enter');
    assert.deepEqual(await page.evaluate(()=>window.zoneTargets),['climate.a','climate.a']);
    await view.locator('details[data-detail="absent"] > summary').click();
    await page.evaluate(()=>window.testPanel._render());
    assert.ok(await view.locator('details[data-detail="absent"]').evaluate(el=>el.open),'telemetry preserves expanded details');
   }
   if(tab==='history'){
    await view.locator('[data-ht-period="7"]').click();
    await page.waitForFunction(()=>window.testPanel.__htPeriod===7 && window.testPanel.__htHistory?.key.startsWith('7:') && window.testPanel.__htHistory?.loading===false);
    assert.equal(await view.locator('[data-ht-period="7"]').getAttribute('aria-pressed'),'true');
    await view.locator('[data-ht-metric="floor2"]').click();
    await view.locator('[data-ht-metric="floor2"][aria-pressed="true"]').waitFor();
    assert.match(await view.innerText(),/Детская Ильи · ZONT/);
    await view.locator('[data-ht-metric="dhw"]').click();
    await page.waitForFunction(()=>window.testPanel.__htMetric==='dhw' && window.testPanel.shadowRoot.querySelector('.zont-work-view:not([hidden]) [data-ht-metric="dhw"]')?.getAttribute('aria-pressed')==='true');
    assert.equal(await view.locator('[data-ht-metric="dhw"]').getAttribute('aria-pressed'),'true');
    if(width===390){
     await view.locator('[data-ht-metric="floor1"]').click();
     await view.locator('.ht-chart').waitFor();
     await page.evaluate(()=>{
      const panel=window.testPanel;
      const previousApi=panel.hass.callApi;
      const historyReply=new Promise(resolve=>{window.finishHistory=resolve;});
      panel.hass={...panel.hass,services:{homeassistant:{update_entity:{}}},
       callApi:(method,path)=>path.startsWith('history/')?historyReply:previousApi(method,path),
       callService:()=>Promise.resolve({})};
     });
     await page.locator('zont-local-panel #zont-refresh').click();
     await page.waitForFunction(()=>window.testPanel.__htHistory?.loading===true);
     assert.ok(await view.locator('.ht-chart').isVisible(),'manual refresh keeps the accepted graph while Recorder is loading');
     await page.evaluate(()=>{
      window.finishHistory([[{entity_id:'sensor.room',state:'22',last_changed:new Date(Date.now()-3600000).toISOString()},
       {entity_id:'sensor.room',state:'23',last_changed:new Date().toISOString()}]]);
     });
     await page.waitForFunction(()=>window.testPanel.__htHistory?.loading===false);
    }
   }
  }
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('Browser overview: 320/390/430/768px, floor & climate data, 2+3 cards, no overflow, stable shell passed');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
