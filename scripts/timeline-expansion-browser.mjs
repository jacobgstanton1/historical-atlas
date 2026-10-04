// Small runtime check; exact existing geometry caches only, no historical acquisition.
import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import os from 'node:os';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const root=process.cwd(),live=process.argv.includes('--live');
const {chromium}=await import(pathToFileURL(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
let server;if(!live){server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html':p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':'application/json'}).end(fs.readFileSync(p));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));}
const url=live?'https://jacobgstanton1.github.io/historical-atlas/':'http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let checks=0;const check=(name,value)=>{assert.ok(value,name);checks++;console.log('PASS '+name);};
try{for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
 const page=await browser.newPage({viewport,ignoreHTTPSErrors:true}),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/world_.*geojson/.test(r.url()))requests.push(r.url());});
 await page.route('**/app.js?v=timeline1', async route => { const response = await route.fetch(); await route.fulfill({response, body:(await response.text())+'\n;globalThis.__timelineMap=map;'}); });
 if(!live)await page.route('**/world_*.geojson',async route=>{const file=path.join(root,'research/completion-02/area/cache',new URL(route.request().url()).pathname.split('/').pop());if(fs.existsSync(file))await route.fulfill({path:file,contentType:'application/json'});else await route.continue();});
 await page.goto(url+'?year=1938',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#loading-indicator').hidden&&document.querySelector('#status').textContent.includes('territories'),null,{timeout:90000});
 check('existing 1938 map populated '+viewport.width,await page.locator('#status').innerText().then(s=>!/0 territories/.test(s)));
 check('all 41 snapshot options '+viewport.width,await page.locator('#year-jump option').count()===41);
 await page.locator('#search').fill('France');await page.locator('.search-result:not([disabled])').first().click();await page.waitForSelector('.territory-dossier');check('existing dossier renders '+viewport.width,await page.locator('#dossier-content').innerText().then(s=>s.includes('Government')));
 await page.locator('#year-jump').selectOption('-3999');await page.locator('#year-form button').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('4000 BCE · No territory data'));
 const requestsBefore=requests.length;await page.waitForTimeout(400);
 check('no political geometry rendered '+viewport.width,await page.evaluate(()=>__timelineMap.queryRenderedFeatures({layers:['territories-fill','territories-line','territory-labels']}).length===0));
 check('BCE empty status '+viewport.width,await page.locator('#year-label').innerText()==='4000 BCE');check('empty selection closes old dossier '+viewport.width,await page.locator('#inspector').getAttribute('aria-hidden')==='true');
 check('no BCE or guessed boundary request '+viewport.width,requests.every(s=>!s.includes('null')&&!s.includes('-3999'))&&requests.length===requestsBefore);
 check('timeline remains within viewport '+viewport.width,await page.locator('.timeline-shell').boundingBox().then(b=>b.x>=0&&b.x+b.width<=viewport.width+1));
 check('progressive ticks bounded '+viewport.width,await page.locator('.snapshot-mark:visible').count()<=10);
 if(!live)await page.screenshot({path:path.join(os.tmpdir(),'atlas-timeline-'+viewport.width+'.png')});
 await page.locator('#year-jump').selectOption('2026');await page.locator('#year-form button').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('2026 CE · No territory data'));check('modern target empty '+viewport.width,await page.locator('#year-label').innerText()==='2026 CE');
 await page.locator('#year-jump').selectOption('1960');await page.locator('#year-form button').click();await page.waitForFunction(()=>document.querySelector('#loading-indicator').hidden&&document.querySelector('#status').textContent.includes('1960 CE')&&document.querySelector('#status').textContent.includes('territories'),null,{timeout:90000});check('return to existing 1960 '+viewport.width,!/0 territories/.test(await page.locator('#status').innerText()));check('no page errors '+viewport.width,errors.length===0);await page.close();
}console.log(JSON.stringify({browserChecks:checks,live}));}finally{await browser.close();server?.close();}
