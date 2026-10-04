// Bounded real-map verification. No historical research or production writes.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'..'), live=process.argv.includes('--live'), mobileOnly=process.argv.includes('--mobile-only'), prepareAll=process.argv.includes('--prepare-all');
const {chromium}=await import(pathToFileURL(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
let server;
if(!live){server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 try{const bytes=fs.readFileSync(file);res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/json'}).end(bytes);}catch{res.writeHead(404).end();}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));}
const url=live?'https://jacobgstanton1.github.io/historical-atlas/':'http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:900},ignoreHTTPSErrors:true});
const errors=[],results=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(r.url().includes('/geojson/world_'))requests.push(r.url());});
// Read-only map probes exist solely in the browser test response.
await page.route('**/app.js?*',async route=>{const r=await route.fetch();await route.fulfill({response:r,body:await r.text()+'\n;globalThis.__atlasProbe={map,features:()=>currentFeatures,labels:()=>buildLabelCollection({features:currentFeatures}),year:()=>requestedYear,collection:()=>snapshotCache.get(SNAPSHOTS[displayedIndex].year)};'});});
if(!live)await page.route('https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@da7a4b735ecef70aebdc9c73e409d8a2500d50f3/geojson/*',async route=>{
 const file=path.join(os.tmpdir(),'atlas-pinned-da7a4b735ecef70aebdc9c73e409d8a2500d50f3',new URL(route.request().url()).pathname.split('/').pop());
 if(fs.existsSync(file))await route.fulfill({path:file,contentType:'application/json'});else await route.continue();
});
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>globalThis.__atlasProbe&&document.querySelector('#loading-indicator').hidden&&globalThis.__atlasProbe.features().length>0,null,{timeout:120000});
 assert.equal(await page.locator('.snapshot-mark[title="1492"]').count(),0);
 await page.locator('#year-jump').fill('1492');await page.locator('#year-form button').click();
 await page.waitForFunction(()=>globalThis.__atlasProbe.year()===1500&&document.querySelector('#loading-indicator').hidden,null,{timeout:120000});
 assert.equal(await page.locator('#year-label').innerText(),'1500');
 if(prepareAll){
  const sources=JSON.parse(fs.readFileSync(path.join(root,'exports/backward-timeline-census/sources.json')));
  const proof=await page.evaluate(async sources=>{
   const {prepareCollection,buildLabelCollection}=await import('./data-pipeline.js?v=qa01'),out=[];
   for(const s of sources){const r=await fetch(s.url);if(!r.ok)throw Error(s.file+' HTTP '+r.status);const prepared=prepareCollection(await r.json(),s.year),labels=buildLabelCollection(prepared);if(!prepared.features.length||!labels.features.length)throw Error('Empty prepared map '+s.file);out.push({year:s.year,file:s.file,features:prepared.features.length,labels:labels.features.length});}
   return out;
  },sources);
  fs.writeFileSync(path.join(root,'exports/backward-timeline-census/prepared-maps.json'),JSON.stringify(proof,null,2)+'\n');
  console.log('PASS all '+proof.length+' source maps through prepareCollection and territory-label generation');
 }else{
 for(const year of mobileOnly?[]:[1400,1500,1600,1783,1800,1938,1960,-500,-4000]){
  await page.locator('#year-jump').fill(String(year));await page.locator('#year-form button').click();
  await page.waitForFunction(y=>globalThis.__atlasProbe.year()===y&&document.querySelector('#loading-indicator').hidden&&document.querySelector('#status').textContent.includes('territories'),year,{timeout:120000});
  await page.waitForFunction(y=>{const m=globalThis.__atlasProbe.map;return m.isSourceLoaded('historical')&&m.isSourceLoaded('historical-labels')&&m.queryRenderedFeatures({layers:['territories-fill']}).some(f=>f.properties._year===y);},year,{timeout:30000});
  // Focus an actual generated label to check rendering even for small ancient regions.
  await page.evaluate(()=>{const p=globalThis.__atlasProbe,labels=p.labels().features;const label=labels.find(f=>f.properties._name)||labels[0];if(!label)throw Error('No generated territory labels');p.map.jumpTo({center:label.geometry.coordinates,zoom:4});});
  await page.waitForFunction(y=>{const p=globalThis.__atlasProbe,m=p.map,names=new Set(p.labels().features.map(f=>f.properties._name));return m.isSourceLoaded('historical')&&m.isSourceLoaded('historical-labels')&&m.queryRenderedFeatures({layers:['territories-fill']}).some(f=>f.properties._year===y)&&m.queryRenderedFeatures({layers:['territories-line']}).some(f=>f.properties._year===y)&&m.queryRenderedFeatures({layers:['territory-labels']}).some(f=>names.has(f.properties._name));},year,{timeout:30000});
  const proof=await page.evaluate(()=>{const p=globalThis.__atlasProbe,m=p.map;return {year:p.year(),features:p.features().length,polygons:m.queryRenderedFeatures({layers:['territories-fill']}).length,borders:m.queryRenderedFeatures({layers:['territories-line']}).length,labels:m.queryRenderedFeatures({layers:['territory-labels']}).map(f=>f.properties._name),label:document.querySelector('#year-label').textContent};});
  assert.equal(proof.label,year<0?`${-year} BCE`:String(year));
  await page.screenshot({path:path.join(os.tmpdir(),`atlas-backward-${live?'live':'local'}-${year}.png`)});
  results.push(proof);console.log('PASS '+JSON.stringify(proof));
 }
 // Mobile controls and BCE map labels retain the same rendering pipeline.
 await page.setViewportSize({width:390,height:844});await page.locator('#year-jump').fill('-500');await page.locator('#year-form button').click();
 await page.waitForFunction(()=>globalThis.__atlasProbe.year()===-500&&document.querySelector('#loading-indicator').hidden,null,{timeout:120000});
 await page.waitForFunction(()=>{const m=globalThis.__atlasProbe.map;return m.isSourceLoaded('historical')&&m.isSourceLoaded('historical-labels')&&m.queryRenderedFeatures({layers:['territories-fill']}).some(f=>f.properties._year===-500);},null,{timeout:30000});
 assert.equal(await page.locator('#year-label').innerText(),'500 BCE');
 assert.equal(await page.locator('#year-jump').getAttribute('max'),'1960');
 await page.evaluate(()=>{const p=globalThis.__atlasProbe;p.map.jumpTo({center:p.labels().features[0].geometry.coordinates,zoom:4});});
 await page.waitForFunction(()=>globalThis.__atlasProbe.map.queryRenderedFeatures({layers:['territory-labels']}).some(f=>globalThis.__atlasProbe.labels().features.some(l=>l.properties._name===f.properties._name)),null,{timeout:30000});
 await page.screenshot({path:path.join(os.tmpdir(),`atlas-backward-${live?'live':'local'}-mobile.png`)});
 await page.mouse.click(195,422);await page.waitForSelector('#dossier-content .dossier-snapshot');
 assert.equal(await page.locator('#dossier-content .dossier-snapshot').innerText(),'500 BCE');
 assert.deepEqual(errors,[]);
 const report={url,results,mobile:true,errors,exactSourceRequests:[...new Set(requests)]};
 fs.writeFileSync(live?path.join(os.tmpdir(),'atlas-backward-live.json'):path.join(root,'exports/backward-timeline-census/'+(mobileOnly?'browser-mobile.json':'browser.json')),JSON.stringify(report,null,2)+'\n');
 }
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
