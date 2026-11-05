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
console.log('Daily overview: zones and read-only checks passed');
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
