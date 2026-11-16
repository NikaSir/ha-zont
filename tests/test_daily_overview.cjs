const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
class Panel {}
vm.runInNewContext(fs.readFileSync('custom_components/zont_local/frontend/daily-overview.js','utf8'), {customElements:{get:()=>Panel}});
const p = new Panel();
p._config = () => ({zone_entities:['climate.a','climate.b','climate.c','climate.d']});
p._hass = {states:{
 'climate.a':{state:'auto',attributes:{current_temperature:0,temperature:0,hvac_action:'idle'}},
 'climate.b':{state:'auto',attributes:{current_temperature:20,temperature:22,hvac_action:'heating'}},
 'climate.c':{state:'unavailable',attributes:{current_temperature:99,temperature:99,hvac_action:'heating'}},
 'climate.d':{state:'auto',attributes:{current_temperature:21,temperature:16}},
}};
const zones = p._dailyZones();
const find = id => zones.find(z=>z.id===`climate.${id}`);
assert.equal(find('a').current,0);
assert.equal(find('a').uncertain,false);
assert.equal(find('b').active,true);
assert.equal(find('c').current,null);
assert.equal(find('c').active,false);
assert.equal(find('d').active,false,'auto without hvac_action is not heating');
assert.equal(find('d').uncertain,true);
let commands = 0;
p._hass.callService=()=>commands++;
p._pressMode('button.test');
p._bindWorkActionsV095({});
assert.equal(commands,0);
assert.deepEqual(Array.from(p._tabs(),t=>t.id),['overview','climate','zones','equipment','history']);
p._config = () => ({
 zone_entities:['climate.b'],
 zone_room_sources:{'climate.b':{temperature:'sensor.b_room',selector:'select.b_source'}},
});
p._hass.states['sensor.b_room']={state:'19.5'};
p._hass.states['select.b_source']={state:'remote_source_offline'};
let [roomZone]=p._dailyZones();
assert.equal(roomZone.current,19.5);
assert.equal(roomZone.target,22);
assert.equal(roomZone.active,true);
assert.equal(roomZone.delta,-2.5);
assert.equal(roomZone.sourceNote,'Внешний датчик: термоголовка не получает данные');
p._hass.states['select.b_source'].state='remote_temperature';
p._hass.states['sensor.b_room'].state='unavailable';
[roomZone]=p._dailyZones();
assert.equal(roomZone.current,null,'missing room sensor must not fall back to valve temperature');
assert.equal(roomZone.uncertain,true);
assert.equal(roomZone.sourceNote,'Внешний датчик');
console.log('Daily overview: zones and read-only checks passed');
const measured = (id,name,value,unit='°C') => ({entry:{entity_id:id,original_name:name},state:{state:value,attributes:{friendly_name:name,unit_of_measurement:unit}}});
const fixture = [measured('sensor.internet','Погода из интернета','4'),measured('sensor.street','Уличный датчик','4.5'),measured('sensor.room','Гостиная (t°)','23.2'),measured('sensor.child','Детская 1','22.9'),measured('sensor.water','eBUS Основной №2 t° ГВС','45'),measured('sensor.pressure','Теплоноситель','1.9','bar'),measured('binary_sensor.floor','Тёплый пол','on','')];
fixture.push(measured('sensor.zont_child2','Детская 2 (t°)','22.6'));
const model=p._dailyOverviewModel(fixture);
assert.deepEqual(Array.from(model.floors,m=>m.label),['1 этаж','2 этаж']);
assert.deepEqual(Array.from(model.floors,m=>m.value),[23.2,22.6]);
assert.deepEqual(Array.from(model.metrics,m=>m.value),[4.5,45,1.9]);
assert.deepEqual(Array.from(p._dailyOverviewModel([...fixture].reverse()).floors,m=>m.value),[23.2,22.6]);
assert.equal(p._dailyOverviewModel([...fixture,measured('sensor.room2','Гостиная','24')]).floors[0].value,null);
assert.equal(p._dailyOverviewModel(fixture.filter(i=>i.entry.entity_id!=='sensor.zont_child2')).floors[1].value,null);
p._role=()=>'';
p._isActiveErrorV089=()=>false;
p._connectionStatusV096=()=>({unknown:true});
const signal=measured('binary_sensor.online','Controller online','on','');
signal.state.attributes.device_class='connectivity';
for(const metric of fixture) metric.state.last_reported=new Date().toISOString();
fixture.push(
 measured('binary_sensor.radiators','Радиаторы','off',''),
 measured('binary_sensor.circulation','Циркуляция','unavailable',''),
);
const overview=p._dailyOverview([...fixture,signal],[]);
assert.match(overview,/<h2>Отопление и циркуляция<\/h2><small>3 узл\.<\/small>/);
const nodeRow = (html, name) => html.split('<div class="overview-node ').find(row => row.includes(`<strong>${name}</strong>`)) || '';
for(const [name,tone,status,pump] of [
 ['Тёплый пол','is-on','Включено','Насос · Включён по данным ZONT'],
 ['Радиаторы','is-off','Выключено','Насос · Выключен по данным ZONT'],
 ['Циркуляция','is-unavailable','Недоступно','Насос · Нет данных'],
]){
 const row=nodeRow(overview,name);
 assert.ok(row.startsWith(tone));
 assert.ok(row.includes(`aria-label="${pump}"`));
 assert.match(row,/<ha-icon icon="mdi:fan"/);
 assert.ok(row.includes(`>${status}</span>`));
}
const radiatorFault=measured('binary_sensor.radiator_pump_fault','Ошибка насоса Радиаторы','on','');
radiatorFault.state.attributes.device_class='problem';
assert.equal(p._dailyOverviewModel([radiatorFault]).nodes.length,0,'a pump fault does not indicate operation');
assert.ok(nodeRow(p._dailyOverview([...fixture,signal,radiatorFault],[]),'Радиаторы').startsWith('is-off'),'a fault does not obscure the circuit signal');
assert.equal((overview.match(/class="overview-metric"/g)||[]).length,3);
assert.equal((overview.match(/data-climate-room=/g)||[]).length,2);
assert.match(overview,/overview-lamp online[^>]*aria-label="Связь · ZONT на связи"[^]*?<ha-icon icon="mdi:cloud"/);
assert.match(overview,/overview-lamp current[^>]*aria-label="Свежесть · Данные в HA актуальны"[^]*?<ha-icon icon="mdi:check-circle-outline"/);
assert.match(overview,/Канал к контроллеру.*Не подтверждён/);
signal.state.state='off';
const offline=p._dailyOverview([...fixture,signal],[]);
assert.match(offline,/overview-lamp offline[^>]*aria-label="Связь · Нет связи с ZONT"[^]*?<ha-icon icon="mdi:cloud-off-outline"/);
assert.match(offline,/overview-lamp current[^>]*aria-label="Свежесть · Данные в HA актуальны"[^]*?<ha-icon icon="mdi:check-circle-outline"/);
assert.ok(nodeRow(offline,'Тёплый пол').startsWith('is-unavailable'),'connection loss invalidates the last retained pump state');
fixture.find(i=>i.entry.entity_id==="sensor.room").state.last_reported=new Date(Date.now()-16*60000).toISOString();
signal.state.state='on';
const stale=p._dailyOverview([...fixture,signal],[]);
assert.match(stale,/overview-lamp online/);
assert.match(stale,/overview-lamp stale[^>]*aria-label="Свежесть · Данные в HA устарели"[^>]*><ha-icon icon="mdi:clock-alert-outline"/);
const unknownFreshness = /overview-lamp unknown[^>]*aria-label="Свежесть · Нет данных о свежести"[^>]*><ha-icon icon="mdi:clock-outline"[^>]*><\/ha-icon><span [^>]*aria-hidden="true">\?<\/span>/;
signal.state.state='unknown';
assert.match(p._dailyOverview([...fixture,signal],[]),/mdi:cloud-question-outline/);
assert.match(p._dailyOverview(fixture.filter(i=>i.entry.entity_id!=='sensor.zont_child2'),[]),unknownFreshness);
const burner=measured('binary_sensor.burner','Горелка основного котла','off','');
const overviewWithBurner=()=>p._dailyOverview([...fixture,burner],[]);
assert.match(nodeRow(overviewWithBurner(),'Основной котёл'),/^is-off"[^]*><span class="overview-node-status">Горелка неактивна<\/span>/);
burner.state.state='unavailable';
assert.match(nodeRow(overviewWithBurner(),'Основной котёл'),/^is-unavailable"[^]*><span class="overview-node-status">Данные горелки недоступны<\/span>/);
assert.ok(!overview.includes('Погода из интернета'));
assert.ok(overview.includes('Тёплый пол'));
console.log('Overview: ZONT floor sources and independent status lamps passed');
// A state can be reported unchanged. Frontend last_updated is not a receipt.
const stable=fixture.find(i=>i.entry.entity_id==='sensor.room');
stable.state.last_updated=stable.state.last_reported;
delete stable.state.last_reported;
assert.match(p._dailyOverview([...fixture,signal],[]),unknownFreshness);
stable.state.last_reported=new Date().toISOString();
const now = Date.now();
const sample = (v, offset) => ({entity_id:'sensor.temperature',state:v,last_changed:new Date(now+offset).toISOString(),attributes:{}});
const chart = p._dailyTemperatureChart([sample('20',-60000),sample('unavailable',-30000),sample('21',-10000)], 'sensor.temperature', '<script>');
assert.ok(chart.includes('&lt;script&gt;'));
assert.ok(!chart.includes('<script>'));
const path = chart.match(/<path d="([^"]*)"/)[1];
assert.equal((path.match(/M/g)||[]).length,2,'unavailable must break the temperature line');
assert.equal((path.match(/L/g)||[]).length,0);
assert.equal(p._dailyTemperatureChart([sample('unknown',-1000)],'sensor.temperature','X'),'');
(async () => {
 p._queue=()=>{};
 p._hass.callApi=async()=>{throw new Error('<access denied>');};
 p._dailyHistory([]);
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.ok(p._dailyHistory([]).includes('&lt;access denied&gt;'));
 p.__dailyHistory={data:[],error:null};
 assert.ok(p._dailyHistory([]).includes('нет записей'));
 console.log('Daily history: gaps, empty data, API error and escaping passed');
})().catch(error=>{console.error(error);process.exitCode=1;});

(async () => {
 const panel=new Panel();
 panel._config=()=>({});
 panel._connectionStatusV096=()=>({unknown:true});
 const calls=[];
 const items=structuredClone([...fixture,signal]);
 for(const item of items){
   delete item.state.last_reported;
   item.state.last_updated=new Date(Date.now()-3600000).toISOString();
 }
 panel._hass={callApi:async(method,path)=>{
   calls.push([method,path]);
   return {last_reported:new Date().toISOString()};
 }};
 const {floors,metrics}=panel._dailyOverviewModel(items);
 const readings=[...floors,...metrics];
 assert.match(panel._overviewStatus(items,readings).lamps,unknownFreshness);
 panel._overviewStatus(items,readings);
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.match(panel._overviewStatus(items,readings).lamps,/overview-lamp current[^>]*aria-label="Свежесть · Данные в HA актуальны"/);
 assert.deepEqual(calls,[
   ['GET','states/sensor.room'],['GET','states/sensor.zont_child2'],
   ['GET','states/sensor.street'],['GET','states/sensor.water'],['GET','states/sensor.pressure'],
 ]);
 console.log('Overview REST receipt timestamps: stable state stays fresh and requests are throttled');
})().catch(error=>{console.error(error);process.exitCode=1;});

// Heating outlets are independent of the ZONT registry and remain visible while off.
p._config = () => ({heating_outlets:[{entity_id:'switch.socket_wf4',label:'Тамбур · WF4',on_below:8,off_above:10},{entity_id:'switch.socket_wf2',label:'Веранда · WF2',on_below:8,off_above:10},{entity_id:'switch.socket_wf3',label:'Веранда · WF3',on_below:8,off_above:10}]});
p._hass.states['switch.socket_wf4']={state:'on',attributes:{}};
p._hass.states['switch.socket_wf2']={state:'off',attributes:{}};
p._hass.states['switch.socket_wf3']={state:'unavailable',attributes:{}};
p._registry = [
 {entity_id:'sensor.other_power',device_id:'other'},
 {entity_id:'switch.socket_wf4',device_id:'wf4'},
 {entity_id:'sensor.wf4_power',device_id:'wf4'},
 {entity_id:'sensor.wf4_voltage',device_id:'wf4'},
 {entity_id:'switch.socket_wf2',device_id:'wf2'},
 {entity_id:'sensor.wf2_power',device_id:'wf2'},
 {entity_id:'switch.socket_wf3',device_id:'wf3'},
 {entity_id:'sensor.wf3_power',device_id:'wf3',original_device_class:'power'},
];
p._hass.states['sensor.other_power']={state:'123',attributes:{device_class:'power',unit_of_measurement:'W'}};
p._hass.states['sensor.wf4_power']={state:'1.1875',attributes:{device_class:'power',unit_of_measurement:'kW'}};
p._hass.states['sensor.wf4_voltage']={state:'230',attributes:{device_class:'voltage',unit_of_measurement:'V'}};
p._hass.states['sensor.wf2_power']={state:'0.0',attributes:{device_class:'power',unit_of_measurement:'W'}};
p._hass.states['sensor.wf3_power']={state:'unavailable',attributes:{}};
let outlets=p._dailyOverview(fixture,[]);
assert.ok(outlets.includes('Электрообогрев'));
assert.ok(outlets.includes('Тамбур · WF4'));
assert.ok(outlets.includes('Веранда · WF2'));
assert.ok(outlets.includes('Веранда · WF3'));
assert.ok(outlets.includes('Включена'));
assert.ok(outlets.includes('Выключена'));
assert.ok(outlets.includes('Нет связи'));
assert.equal((outlets.match(/Вкл\. ниже 8 °C · Выкл\. выше 10 °C/g)||[]).length,3);
assert.match(nodeRow(outlets,'Тамбур · WF4'),/overview-node-power[^>]*>1\s?187,5\sВт</);
assert.match(nodeRow(outlets,'Веранда · WF2'),/overview-node-power[^>]*>0\sВт</);
assert.match(nodeRow(outlets,'Веранда · WF3'),/overview-node-power[^>]*>—</);
p._registry.push({entity_id:'sensor.wf2_other_power',device_id:'wf2'});
p._hass.states['sensor.wf2_other_power']={state:'5',attributes:{device_class:'power',unit_of_measurement:'W'}};
assert.match(nodeRow(p._dailyOverview(fixture,[]),'Веранда · WF2'),/overview-node-power[^>]*>—</,'ambiguous readings must not be assigned to a socket');
delete p._hass.states['switch.socket_wf3'];
outlets=p._dailyOverview(fixture,[]);
assert.ok(outlets.includes('Нет данных'));
assert.ok(!/data-entity=|data-service=/.test(outlets),'outlets expose no command or more-info path');
console.log('Overview heating outlets: on, off, unavailable, missing and read-only passed');
