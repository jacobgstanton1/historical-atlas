import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'..');
const {chromium}=await import(pathToFileURL(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
const live=process.argv.includes('--live');let server;
if(!live){server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{const bytes=fs.readFileSync(p);res.writeHead(200,{'Content-Type':p.endsWith('.html')?'text/html':p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.svg')?'image/svg+xml':'application/json'}).end(bytes);}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));}
const url=live?'https://jacobgstanton1.github.io/historical-atlas/':'http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900},ignoreHTTPSErrors:true}),errors=[],checks=[];
page.on('response',r=>{if(r.status()>=400)console.log('RESOURCE '+r.status()+' '+r.url());});
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/\/data\/world_\d+\.geojson(?:\?|$)/.test(m.location().url))errors.push(m.text()+' '+m.location().url);});
const check=(name,value)=>{assert.ok(value,name);checks.push(name);console.log('PASS '+name);};
const ready=()=>page.waitForFunction(()=>document.querySelector('#loading-indicator').hidden&&document.querySelector('#status').textContent.includes('territories'),null,{timeout:90000});
const year=async y=>{await page.locator('#year-jump').fill(String(y));await page.locator('#year-form button').click();await ready();assert.ok((await page.locator('#year-label').innerText()).startsWith(String(y)));};
async function select(name){await page.locator('#search').fill(name);await page.locator('.search-result:not([disabled])').filter({has:page.locator('strong').filter({hasText:new RegExp('^'+name+'$','i')})}).first().click();await page.waitForSelector('.territory-dossier');await page.waitForTimeout(500);}
const sections=['Identity Header','Overview','Government & Politics','Leadership','Population & Territory','Economy','Major Events','Important Figures','Historical Relationships','Historical Context & Status','Sources & Methodology'];
try{
 await page.goto(url,{waitUntil:'domcontentloaded'});await ready();
 check('desktop unified command bar and no test-range wording',!(await page.locator('body').innerText()).includes('test range')&&await page.locator('.topbar').evaluate(e=>getComputedStyle(e).backgroundColor!=='rgba(0, 0, 0, 0)'));
 await page.locator('#labels-toggle').click();assert.equal(await page.locator('#labels-toggle').getAttribute('aria-pressed'),'false');await page.locator('#labels-toggle').click();check('Labels toggle retains pressed state',await page.locator('#labels-toggle').getAttribute('aria-pressed')==='true');
 await page.locator('#previous-year').click();await ready();assert.ok((await page.locator('#year-label').innerText()).includes('1930'));await page.locator('#next-year').click();await ready();check('previous and next snapshots', (await page.locator('#year-label').innerText()).includes('1938'));
 await page.locator('#play').click();assert.equal(await page.locator('#play').getAttribute('aria-label'),'Pause timeline');await page.waitForTimeout(2100);await ready();await page.locator('#play').click();check('play advances and pauses with accessible SVG state',await page.locator('#play').getAttribute('aria-label')==='Play timeline'&&await page.locator('#play svg').count()===1);
 await year(1939);check('year jump preserves requested vs boundary year',(await page.locator('#snapshot-note').innerText()).includes('1938'));
 await page.locator('#timeline').focus();await page.keyboard.press('ArrowLeft');await page.waitForTimeout(300);await ready();check('keyboard slider remains usable',(await page.locator('#year-label').innerText()).startsWith('1938'));
 await year(1960);await select('France');assert.deepEqual(await page.locator('.territory-dossier > [data-section]').evaluateAll(n=>n.map(e=>e.dataset.section)),sections);check('search opens rich dossier with unchanged canonical order',true);
 const references=page.locator('.dossier-header h1 .citation-group summary');assert.ok(!await references.innerText().then(t=>t.includes('Sources')));await references.click();assert.ok(await page.locator('.dossier-header h1 .citation-links a').count()>1);await page.locator('.dossier-header h1 .citation-links a').first().click();assert.notEqual(await page.locator('[data-section="Sources & Methodology"]').getAttribute('open'),null);await page.locator('[data-section="Sources & Methodology"] > summary').click();await page.locator('#dossier-content').evaluate(e=>e.scrollTop=0);await references.click();
 check('opaque reading surface, larger flag and compact timeline',await page.locator('#inspector').evaluate(e=>getComputedStyle(e).backgroundColor==='rgb(249, 250, 248)')&&await page.locator('.dossier-flags img').first().boundingBox().then(b=>b.width>=100)&&await page.locator('.timeline-shell').boundingBox().then(b=>b.height<120));
 check('historical header and currency stay sourced',(await page.locator('.dossier-header').innerText()).includes('New franc')&&await page.locator('.dossier-header .fact-source').count()>0);
 check('exchange component and collapsed methodology retained',await page.locator('.dossier-exchange').count()===1&&await page.locator('[data-section="Sources & Methodology"]').getAttribute('open')===null);
 await page.screenshot({path:path.join(os.tmpdir(),'atlas-polish-desktop.png')});
 await page.locator('#close-inspector').click();check('desktop close restores inert panel',await page.locator('#inspector').getAttribute('aria-hidden')==='true');
 await page.locator('#reset-view').click();await page.waitForTimeout(800);
 // Real territory hit-testing after resetting the global map; several fixed world-map points avoid ocean misses.
 for(const [x,y]of [[720,360],[760,420],[640,300],[800,340]]){await page.mouse.move(x,y);await page.mouse.click(x,y);await page.waitForTimeout(350);if(await page.locator('#inspector').getAttribute('aria-hidden')==='false')break;}
 check('Reset and real map click open a territory',await page.locator('#inspector').getAttribute('aria-hidden')==='false');
 await page.setViewportSize({width:390,height:844});await year(1800);await select('Russian Empire');
 assert.deepEqual(await page.locator('.territory-dossier > [data-section]').evaluateAll(n=>n.map(e=>e.dataset.section)),sections);
 const scroller=page.locator('#dossier-content');await scroller.evaluate(e=>e.scrollTop=0);const before=await page.locator('#close-inspector').boundingBox();await scroller.evaluate(e=>e.scrollTop=e.scrollHeight);const after=await page.locator('#close-inspector').boundingBox();check('mobile scroll preserves close and compact sparse sections',Math.abs(before.y-after.y)<2&&await page.locator('.dossier-section.is-empty').first().boundingBox().then(b=>b.height<70));
 await scroller.evaluate(e=>e.scrollTop=0);check('mobile has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&await scroller.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
 check('mobile touch controls have accessible names',await page.locator('#labels-toggle').getAttribute('aria-label')==='Toggle map labels'&&await page.locator('#reset-view').boundingBox().then(b=>b.width>=44&&b.height>=44));
 await page.screenshot({path:path.join(os.tmpdir(),'atlas-polish-mobile.png')});
 await year(1960);await select('France');check('mobile rich dossier and quotation expansion',await page.locator('.dossier-exchange').count()===1);await page.locator('.exchange-additional summary').first().click();check('additional dated quotations remain accessible',await page.locator('.exchange-additional').first().getAttribute('open')!==null);
 await page.screenshot({path:path.join(os.tmpdir(),'atlas-polish-mobile-rich.png')});
 await page.setViewportSize({width:768,height:1024});check('tablet panel and controls stay within viewport',await page.locator('.topbar').boundingBox().then(b=>b.x>=0&&b.x+b.width<=768)&&await page.locator('.timeline-shell').boundingBox().then(b=>b.x>=0&&b.x+b.width<=768));
 await page.emulateMedia({reducedMotion:'reduce'});check('reduced motion disables panel and control transitions',await page.locator('#inspector').evaluate(e=>getComputedStyle(e).transitionDuration==='0s'));
 console.log(JSON.stringify({errors}));check('no runtime or console errors',errors.length===0);console.log(JSON.stringify({url,checks:checks.length,errors,screenshots:os.tmpdir()}));
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
