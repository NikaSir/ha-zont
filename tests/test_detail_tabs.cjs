const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
class Panel {}
for(const path of ['daily-overview.js','heating-detail-tabs.js'])vm.runInNewContext(fs.readFileSync('custom_components/zont_local/frontend/'+path,'utf8'),{customElements:{get:()=>Panel}});
const p=new Panel();p._config=()=>({zone_entities:[],zone_labels:{'climate.a':'Гардероб'}});p._hass={states:{}};p._queue=()=>{};
const item=(id,name,state,unit='°C')=>({entry:{entity_id:id,original_name:name},state:{state,attributes:{unit_of_measurement:unit}}});
const a=item('sensor.main','eBUS Основной подача','45'),b=item('sensor.ret','eBUS Основной обратка','38'),c=item('sensor.reserve','Резерв температура','24');
assert.equal(p._htEquipmentModel([a,b,c]).supply,a);
assert.equal(p._htEquipmentModel([a,b,c]).reserve,c);
assert.equal(p._htEquipmentModel([a,b]).reserve,null,'reserve cannot borrow main telemetry');
assert.equal(p._htEquipmentModel([a,item('sensor.duplicate','Основной подача','46')]).supply,null,'ambiguous boiler source is missing');
// Reproduce the ZONT registry names that made both boiler readings disappear.
const flow=item('sensor.ebus_tdeg_tn','еBUS Основной №2 t° ТН','49');
const actual=item('sensor.boiler_actual','Основной_актуальная_температура','49');
const outside=item('sensor.ebus_outside','еBUS Основной №2 t° вне дома','4.5');
const reserveActual=item('sensor.reserve_actual','Резервный_актуальная_температура','27.8');
const reserveFlow=item('sensor.reserve_flow','ТН Резервный ->>>','27.8');
const reserveReturn=item('sensor.reserve_return','ТН Резервный <<<-','27.7');
const active=item('binary_sensor.boiler_state','Основной_состояние','on','');
active.entry.platform='zont_ha';
active.state.attributes.device_class='heat';
const modulation=item('sensor.ebus_modulation','еBUS Основной №2 Модуляция','17','%');
const online=item('binary_sensor.controller_online','Controller_online','on','');
online.state.attributes.device_class='connectivity';
const entries=[outside,actual,b,reserveReturn,reserveFlow,reserveActual,active,online,modulation,flow];
const model=p._htEquipmentModel(entries);
assert.equal(model.supply,flow);
assert.equal(model.ret,b);
assert.equal(model.reserve,reserveActual);
assert.equal(model.boilerActivity,active);
assert.equal(model.burner,null);
assert.equal(model.online,online);
assert.equal(p._htEquipmentModel([outside,actual]).supply,actual);
assert.equal(p._htEquipmentModel([outside]).supply,null);
assert.equal(p._htEquipmentModel([reserveReturn,reserveFlow]).reserve,reserveFlow);
assert.equal(p._htEquipmentModel([reserveReturn]).reserve,null);
assert.equal(p._htEquipmentModel(entries.filter(i=>i!==online)).online,null);
assert.equal(p._htEquipmentModel([item('binary_sensor.permission','Основной_состояние','on','')]).boilerActivity,null);
flow.state.state='unavailable';
assert.equal(p._htEquipmentModel(entries).supply,flow,'known unavailable eBUS source must not be silently replaced');
flow.state.state='49';
p._systemOverviewV089=()=>'';
p._dhwStateV096=()=>null;
p._dhwStatusV096=()=> 'Нет данных';
const equipment=p._htEquipment(entries);
assert.match(equipment,/Подача.*49 °C/);
assert.match(equipment,/Температура.*27.8 °C/);
assert.match(equipment,/Работа котла.*Включено/);
assert.match(equipment,/Модуляция.*17 %/);
assert.doesNotMatch(equipment,/Горелка|Готовность/);
p._connectionStatusV096=()=>({unknown:true});
p._role=()=>'';
p._systemOverviewV089=()=>'';
assert.match(equipment,/data-detail="boiler".*Диагностика/);
assert.match(equipment,/data-detail="reserve-diagnostics"/);
assert.match(equipment,/data-detail="dhw-diagnostics"/);
assert.deepEqual(Array.from(p._tabs(),t=>t.id),['overview','climate','zones','equipment','history']);
p._areas=new Map([['living',{area_id:'living',name:'11.2 - Гостиная'}],['child',{area_id:'child',name:'05 - Детская Ильи'}]]);
p._devices=new Map([
 ['tagged',{id:'tagged',area_id:'living',labels:['datchik_klimata_pomeshcheniia'],name:'Zigbee <датчик>'}],
 ['untagged',{id:'untagged',area_id:'living',labels:[]}],
 ['child',{id:'child',area_id:'child',labels:['datchik_klimata_pomeshcheniia'],name:'Zigbee Илья'}],
]);
p._registry=[
 ['sensor.room_temp','tagged','temperature','24','°C'],
 ['sensor.room_humidity','tagged','humidity','47','%'],
 ['sensor.zont_temp','untagged','temperature','22','°C'],
 ['sensor.child_temp','child','temperature','unavailable','°C'],
].map(([entity_id,device_id,device_class,state,unit_of_measurement])=>{
  p._hass.states[entity_id]={state,attributes:{device_class,unit_of_measurement}};
  return {entity_id,device_id,original_device_class:device_class};
});
let climate=p._content({id:'climate'},[]);
assert.match(climate,/Гостиная.*24,0 °C.*47,0 %/);
assert.match(climate,/Детская Ильи.*Нет данных/);
assert.match(climate,/Zigbee &lt;датчик&gt;/);
assert.doesNotMatch(climate,/22,0 °C/);
p._devices.get('untagged').labels.push('datchik_klimata_pomeshcheniia');
climate=p._content({id:'climate'},[]);
assert.match(climate,/Несколько.*датчик/);
assert.doesNotMatch(climate,/24,0 °C|22,0 °C/);
const zone={id:'climate.a',name:'technical device name',current:0,target:22,delta:-22,active:true,uncertain:false,missing:false,action:'Нагрев'};
assert.ok(p._htZoneCard(zone).includes('Гардероб'));
assert.ok(!p._htZoneCard(zone).includes('technical device name'));
assert.ok(p._htZoneCard(zone).includes('0,0'));
assert.ok(p._htZones([{...zone,active:false,missing:true,current:null}]).includes('Нет связи'));
assert.match(p._htZones([{...zone,active:false,missing:true,current:24.1}]),/24,1 °C · датчик комнаты/);
assert.match(p._htZoneCard({...zone,sourceNote:'Внешний датчик: термоголовка не получает данные',sourceWarning:true}), /Внешний датчик: термоголовка не получает данные/);
const idle = {...zone,active:false,action:'Не нагревается',current:25,target:22,delta:3};
const idleZones = p._htZones([idle,{...idle,id:'climate.b',current:21,delta:-1}]);
assert.match(idleZones,/data-detail="rest"><summary>Не нагреваются · 2<\/summary>/);
assert.doesNotMatch(idleZones,/Требуют проверки/);
const warningZones = p._htZones([idle,{...idle,id:'climate.b',sourceWarning:true},{...idle,id:'climate.c',uncertain:true}]);
assert.match(warningZones,/Требуют проверки<\/h3><div class="ht-card" data-zone="climate.b"/);
assert.match(warningZones,/data-zone="climate.c".*data-detail="rest"><summary>Не нагреваются · 1/);
// Use room contacts, including HA's window override on door-class hardware.
p._devices.set('valve',{area_id:'garage'});
p._devices.set('contact',{area_id:'garage'});
p._registry.push(
 {entity_id:'climate.a',device_id:'valve'},
 {entity_id:'binary_sensor.valve_window',device_id:'valve',original_device_class:'window'},
 {entity_id:'binary_sensor.room_window',device_id:'contact',device_class:'window',original_device_class:'door'},
 {entity_id:'binary_sensor.garage_door',area_id:'garage',device_class:'garage_door'},
 {entity_id:'binary_sensor.other_window',device_id:'contact',area_id:'living',device_class:'window'},
 {entity_id:'binary_sensor.disabled_window',area_id:'garage',device_class:'window',disabled_by:'user'},
);
Object.assign(p._hass.states,{
 'binary_sensor.valve_window':{state:'on'},
 'binary_sensor.room_window':{state:'off'},
 'binary_sensor.garage_door':{state:'on'},
 'binary_sensor.other_window':{state:'on'},
 'binary_sensor.disabled_window':{state:'on'},
});
assert.match(p._htZones([zone]),/aria-label="Окно закрыто"[^>]*><ha-icon icon="mdi:window-closed"/);
p._hass.states['binary_sensor.room_window'].state='on';
assert.match(p._htZones([zone]),/aria-label="Окно открыто"[^>]*><ha-icon icon="mdi:window-open"/);
p._hass.states['binary_sensor.room_window'].state='unavailable';
assert.match(p._htZones([zone]),/aria-label="Нет данных об окне"/);
assert.doesNotMatch(p._htZones([{...zone,id:'climate.no_room'}]),/class="ht-window /);
p._registry.push({entity_id:'binary_sensor.second_window',area_id:'garage',device_class:'window'});
p._hass.states['binary_sensor.second_window']={state:'on'};
assert.match(p._htZones([zone]),/aria-label="Есть открытое окно"/);
p._hass.states['binary_sensor.second_window'].state='off';
assert.match(p._htZones([zone]),/aria-label="Нет данных об окнах"/);
// A measured room temperature has neither a thermostat setpoint nor an HVAC action.
p._config=()=>({zone_sensors:[{entity_id:'sensor.hall_temperature',label:'Тамбур'}]});
p._hass.states['sensor.hall_temperature']={state:'13.2',attributes:{unit_of_measurement:'°C'}};
const roomCard=p._htZones([]);
assert.match(roomCard,/Тамбур.*13,2 °C/);
assert.doesNotMatch(roomCard,/Уставка|Активность неизвестна|Термостаты не настроены/);
p._hass.states['sensor.hall_temperature'].state='unavailable';
assert.match(p._htZones([]),/Тамбур.*Нет связи/);
const range={start:100000,end:200000};
const samples=[{state:'20',last_changed:new Date(100000).toISOString()},{state:'unavailable',last_changed:new Date(150000).toISOString()},{state:'21',last_changed:new Date(190000).toISOString()}];
const chart=p._htChart(samples,range,'°C');
const path=chart.match(/<path d="([^"]*)"/)[1];assert.equal((path.match(/M/g)||[]).length,2);
assert.equal((path.match(/L/g)||[]).length,0);
assert.ok(p._htActivity([],range).includes('Нет истории'));
assert.ok(!p._htActivity(samples,range).includes('<i style'));
(async()=>{
 const pending=[];p._hass.callApi=()=>new Promise(resolve=>pending.push(resolve));
 const items=[item('sensor.room','Гостиная','23')];
 p._htHistoryData(items);await Promise.resolve();
 p.__htPeriod=7;p._htHistoryData(items);await Promise.resolve();
 pending[1]([['new']]);await new Promise(r=>setTimeout(r,0));
 pending[0]([['old']]);await new Promise(r=>setTimeout(r,0));
 assert.equal(p.__htHistory.data[0][0],'new','late old-period response must not replace new period');
 console.log('Detail tabs: zone cards, boiler isolation, history gaps and request race passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
