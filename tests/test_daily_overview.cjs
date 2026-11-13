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
assert.deepEqual(Array.from(p._tabs(),t=>t.id),['overview','zones','equipment','history','service']);
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
const model=p._dailyOverviewModel(fixture);
assert.deepEqual(Array.from(model.metrics,m=>m.label),['В доме','На улице','ГВС','Давление']);
assert.equal(model.metrics[1].item.entry.entity_id,'sensor.street');
assert.deepEqual(Array.from(model.metrics,m=>m.value),[23.2,4.5,45,1.9]);
assert.deepEqual(Array.from(p._dailyOverviewModel([...fixture].reverse()).metrics,m=>m.value),[23.2,4.5,45,1.9]);
assert.equal(p._dailyOverviewModel([...fixture,measured('sensor.room2','Гостиная','24')]).metrics[0].value,null,'ambiguous indoor sources must not be arbitrarily selected');
p._role=()=>'';
p._isActiveErrorV089=()=>false;
p._connectionStatusV096=()=>({text:'Нет данных'});
const overview=p._dailyOverview(fixture,[]);
assert.equal((overview.match(/class="overview-metric"/g)||[]).length,4);
assert.ok(!overview.includes('eBUS'));
assert.ok(!overview.includes('Погода из интернета'));
assert.ok(overview.includes('Тёплый пол'));
console.log('Approved overview: four cards, deterministic sources and concise labels passed');
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

// Heating outlets are independent of the ZONT registry and remain visible while off.
p._config = () => ({heating_outlets:[{entity_id:'switch.socket_wf4',label:'Тамбур · WF4',on_below:8,off_above:10},{entity_id:'switch.socket_wf2',label:'Веранда · WF2',on_below:8,off_above:10},{entity_id:'switch.socket_wf3',label:'Веранда · WF3',on_below:8,off_above:10}]});
p._hass.states['switch.socket_wf4']={state:'on',attributes:{}};
p._hass.states['switch.socket_wf2']={state:'off',attributes:{}};
p._hass.states['switch.socket_wf3']={state:'unavailable',attributes:{}};
let outlets=p._dailyOverview(fixture,[]);
assert.ok(outlets.includes('Электрообогрев'));
assert.ok(outlets.includes('Тамбур · WF4'));
assert.ok(outlets.includes('Веранда · WF2'));
assert.ok(outlets.includes('Веранда · WF3'));
assert.ok(outlets.includes('Включена'));
assert.ok(outlets.includes('Выключена'));
assert.ok(outlets.includes('Нет связи'));
assert.equal((outlets.match(/Вкл\. ниже 8 °C · Выкл\. выше 10 °C/g)||[]).length,3);
delete p._hass.states['switch.socket_wf3'];
outlets=p._dailyOverview(fixture,[]);
assert.ok(outlets.includes('Нет данных'));
assert.ok(!/<button|data-entity=/.test(outlets),'outlets expose no command or more-info path');
console.log('Overview heating outlets: on, off, unavailable, missing and read-only passed');
