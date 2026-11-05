const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
 for(const width of [320,390,430,768]) {
  const page=await browser.newPage({viewport:{width,height:932}});
  const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR:',e.message);});
  // HA navigation uses same-origin history. about:blank has no usable pathname.
  await page.route('http://zont.test/**',route=>route.fulfill({contentType:'text/html',body:'<html><body></body></html>'}));
  await page.goto('http://zont.test/');
  await page.setContent(`<style>html,body{margin:0;width:100%;height:100%;--primary-text-color:#eee;--secondary-text-color:#aaa;--card-background-color:#202020;--primary-background-color:#111;--secondary-background-color:#282828;--divider-color:#444;--primary-color:#03a9cf}zont-local-panel{display:block;width:100%;height:100%}</style>`);
  await page.addScriptTag({path:'custom_components/zont_local/frontend/zont-ui.js'});
  await page.evaluate(()=>{
   const panel=document.createElement('zont-local-panel');
   const data=[['sensor.room','Гостиная (t°)','23.2','°C'],['sensor.out','Уличный датчик','4.5','°C'],['sensor.dhw','t° ГВС','45','°C'],['sensor.p','Теплоноситель','1.9','bar'],['binary_sensor.floor','Тёплый пол','on','']];
   panel._registry=data.map(([entity_id,name])=>({entity_id,original_name:name,platform:'zont'}));
   panel._hass={states:Object.fromEntries(data.map(([entity_id,friendly_name,state,unit_of_measurement])=>[entity_id,{entity_id,state,attributes:{friendly_name,unit_of_measurement},last_updated:new Date().toISOString()}]))};
   panel._hass.states['climate.a']={state:'auto',attributes:{friendly_name:'ТГ Гардероб',current_temperature:20,temperature:22,hvac_action:'heating'}};
   panel._hass.states['climate.b']={state:'unavailable',attributes:{friendly_name:'Гараж'}};
   panel._hass.callApi=async()=>[[{entity_id:'sensor.room',state:'22',last_changed:new Date(Date.now()-3600000).toISOString()},{entity_id:'sensor.room',state:'23',last_changed:new Date().toISOString()}]];
   panel._panel={config:{source:{platforms:['zont']},zone_entities:['climate.a','climate.b']}};
   document.body.append(panel);
   window.testPanel=panel;
  });
  await page.locator('zont-local-panel .overview-metric').first().waitFor();
  const cards=await page.locator('zont-local-panel .overview-metric').all();
  assert.equal(cards.length,4);
  const boxes=await Promise.all(cards.map(c=>c.boundingBox()));
  assert.ok(Math.abs(boxes[0].y-boxes[1].y)<2,'first pair shares a row');
  assert.ok(boxes[2].y>boxes[0].y && Math.abs(boxes[2].y-boxes[3].y)<2,'second pair shares a row');
  const old=await page.evaluate(()=>window.testPanel.shadowRoot.querySelector('.nikas-shell'));
  await page.evaluate(()=>{window.shellBefore=window.testPanel.shadowRoot.querySelector('.nikas-shell');window.testPanel._render();});
  assert.ok(await page.evaluate(()=>window.shellBefore===window.testPanel.shadowRoot.querySelector('.nikas-shell')),'telemetry retains shell');
  assert.ok(await page.locator('zont-local-panel .overview').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'overview has no horizontal overflow');
  for(const tab of ['zones','equipment','history','service']) {
   await page.locator(`zont-local-panel #zont-tabs button[data-tab="${tab}"]`).click();
   const view=page.locator('zont-local-panel .zont-work-view:not([hidden])');
   await view.locator('.ht-title').waitFor();
   assert.ok(await view.evaluate(el=>el.scrollWidth<=el.clientWidth+1),tab+' must fit');
   if(tab==='zones'){
    await view.locator('details[data-detail="absent"] summary').click();
    await page.evaluate(()=>window.testPanel._render());
    assert.ok(await view.locator('details[data-detail="absent"]').evaluate(el=>el.open),'telemetry preserves expanded details');
   }
   if(tab==='history'){
    await view.locator('[data-ht-period="7"]').click();
    await page.waitForFunction(()=>window.testPanel.__htPeriod===7 && window.testPanel.__htHistory?.key.startsWith('7:') && window.testPanel.__htHistory?.loading===false);
    assert.equal(await view.locator('[data-ht-period="7"]').getAttribute('aria-pressed'),'true');
    await view.locator('[data-ht-metric="dhw"]').click();
    await page.waitForFunction(()=>window.testPanel.__htMetric==='dhw' && window.testPanel.shadowRoot.querySelector('.zont-work-view:not([hidden]) [data-ht-metric="dhw"]')?.getAttribute('aria-pressed')==='true');
    assert.equal(await view.locator('[data-ht-metric="dhw"]').getAttribute('aria-pressed'),'true');
   }
  }
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('Browser overview: 320/390/430/768px, 2x2 cards, no overflow, stable shell passed');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
