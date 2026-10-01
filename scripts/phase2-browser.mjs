
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
const root=process.cwd();
const batch=String(Number(process.argv[2])).padStart(2,'0');if(!/^\d{2}$/.test(batch)||Number(batch)<8||Number(batch)>21)throw Error('Usage: node scripts/phase2-browser.mjs 08');
const out=path.join(os.tmpdir(),'historical-atlas-b'+batch+'-validation');
fs.mkdirSync(out,{recursive:true});
const {chromium}=await import(process.env.ATLAS_PLAYWRIGHT_MODULE || new URL('file:///'+path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').replaceAll('\\','/')).href);
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try {
 let content=fs.readFileSync(target);
 if(target.endsWith('app.js'))content=Buffer.from(content.toString()+'\nglobalThis.__atlas = { map, get features() { return currentFeatures; }, get requestedYear() { return requestedYear; }, get currentIndex() { return currentIndex; }, resetView, setSnapshot, goToRequestedYear, selectFeature, stopPlay, get metadata(){return metadata;}, snapshots: SNAPSHOTS, loadSnapshotData };');
 const type=target.endsWith('.html')?'text/html':target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':target.endsWith('.svg')?'image/svg+xml':'application/json';
 res.writeHead(200,{'Content-Type':type});res.end(content);
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(8765,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900},ignoreHTTPSErrors:true});
const errors=[];
page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});
page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE ERROR',m.text())});

const {default:assert}=await import('node:assert/strict');
const checks=[];
const httpErrors=[];page.on('response',r=>{if(r.status()>=400)httpErrors.push({url:r.url(),status:r.status()});});
const check=(name,result=true)=>{assert.ok(result,name);checks.push(name);console.log('PASS',name);};
const text=()=>page.locator('#dossier-content').textContent();
const select=async id=>{if(!await page.evaluate(id=>window.__atlas.features.some(f=>f.properties._stableId===id),id))throw Error('Unselectable boundary feature '+id);await page.evaluate(id=>window.__atlas.selectFeature(id),id);await page.waitForSelector('#inspector.is-open');};
const year=async value=>{
 await page.evaluate(value=>window.__atlas.goToRequestedYear(value),value);
 await page.waitForFunction(value=>window.__atlas.requestedYear===value && document.querySelector('#loading-indicator').hidden,value,{timeout:90000});
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('.dossier-flag img')).every(i=>i.complete&&i.naturalWidth>0),{},{timeout:10000});
};
try {
 await page.goto('http://127.0.0.1:8765');await page.waitForFunction(()=>window.__atlas?.features.length&&window.__atlas.metadata&&document.querySelector('#loading-indicator').hidden,{},{timeout:90000});
 const audit=JSON.parse(fs.readFileSync('development/coverage/research-batch-'+batch+'.json'));
 for(const c of audit.browserCases){await year(c.seedYear);await select(c.mapId);await year(c.year);const body=await text();check('Selected dossier '+c.entityId,await page.evaluate(c=>document.querySelector('#dossier-content').textContent.includes((window.__atlas.metadata.resolve(c.mapId,c.year).entity?window.__atlas.metadata.resolve(c.mapId,c.year):window.__atlas.metadata.resolve(c.mapId,c.year).identityPeriods.find(p=>p.entity?.id===c.entityId)).names.find(n=>n.kind==='primary').value),c));check('Dossier '+c.entityId+' at '+c.year,await page.evaluate(c=>window.__atlas.metadata.resolve(c.mapId,c.year).entity?.id===c.entityId||window.__atlas.metadata.resolve(c.mapId,c.year).identityPeriods?.some(p=>p.entity?.id===c.entityId),c));check('Rendered sourced dossier '+c.entityId,body.includes(String(c.year))&&await page.locator('.fact-source').count()>0);}

 for(const c of audit.transitionCases||[]){await year(c.seedYear);await select(c.mapId);await year(c.year);check('Transition notice '+c.mapId+' '+c.year,(await text()).toLowerCase().includes('transition')||(await text()).toLowerCase().includes('partial'));}
 for(const c of audit.reviewCases||[]){await year(c.seedYear);await select(c.mapId);await year(c.year);check('Review fails closed '+c.mapId+' '+c.year,await page.evaluate(c=>!window.__atlas.metadata.resolve(c.mapId,c.year).entity&&!window.__atlas.metadata.resolve(c.mapId,c.year).identityPeriods?.length,c));}
 for(const y of [1920,1921]){await year(1920);await select('entity-soviet-union');await year(y);check('Premature Soviet label fails closed '+y,await page.evaluate(y=>!window.__atlas.metadata.resolve('entity-soviet-union',y).entity,y));}
 for(const y of [1938,1945,1960]){await year(y);await select('entity-soviet-union');check('Existing enriched Soviet profile preserved '+y,(await text()).includes('Soviet'));}
 await year(1920);await select('entity-ukraine');check('Unresolved Ukraine remains unassigned',await page.evaluate(()=>!window.__atlas.metadata.resolve('entity-ukraine',1920).entity));
 await year(1920);await select('entity-germany');await year(1925);check('Between-snapshot requested year',(await text()).includes('1925 CE')&&(await text()).includes('1920 · nearest'));
 await page.locator('#search').fill('Weimar');await page.waitForTimeout(400);check('Historical name search',/Germany/.test(await page.locator('#search-results').innerText()));await page.locator('#search-results button').filter({hasText:'Germany'}).first().click();check('Search selects dated identity',(await text()).includes('Weimar'));
 await page.locator('.fact-source').first().click();check('Citation marker resolves source',await page.evaluate(()=>!!document.querySelector(location.hash)));check('Source URLs are safe',await page.locator('.dossier-sources a').evaluateAll(a=>a.length>0&&a.every(l=>l.href.startsWith('https://')&&l.target==='_blank'&&l.rel.includes('noopener'))));
 await page.evaluate(()=>window.__atlas.map.jumpTo({center:[80,30],zoom:6}));await page.locator('#reset-view').click();await page.waitForTimeout(700);check('Map reset',await page.evaluate(()=>window.__atlas.map.getZoom()<2));
 await page.locator('#timeline').fill('1936');await page.locator('#timeline').dispatchEvent('input');await page.waitForFunction(()=>window.__atlas.requestedYear===1936&&document.querySelector('#loading-indicator').hidden,{},{timeout:90000});check('Timeline requested year',(await text()).includes('1936 CE'));
 await page.locator('#year-jump').fill('1938');await page.locator('#year-form button').click();await page.waitForFunction(()=>window.__atlas.requestedYear===1938&&document.querySelector('#loading-indicator').hidden,{},{timeout:90000});check('Typed exact year',(await text()).includes('1938 · exact'));
 const labels=await page.evaluate(async()=>{const {buildLabelCollection}=await import('/data-pipeline.js');const f=window.__atlas.features,l=buildLabelCollection({features:f}).features;return{unique:new Set(l.map(f=>f.properties._stableId)).size===l.length,antarctica:f.some(f=>/antarctica/i.test(f.properties._name)),max:window.__atlas.map.getMaxZoom(),compare:!!document.querySelector('[id*="compare"]')};});check('Map labels, Antarctica exclusion, zoom and no Compare Dates',labels.unique&&!labels.antarctica&&labels.max===18&&!labels.compare);
 check('No browser runtime errors',errors.length===0);check('Only expected local boundary and favicon misses',httpErrors.every(e=>e.status===404&&(e.url.includes('/data/world_')||e.url.includes('/favicon.ico'))));await page.screenshot({path:path.join(out,'batch'+batch+'.png')});fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checks,errors,httpErrors,newEntitiesCovered:new Set(audit.browserCases.filter(c=>audit.historicalEntitiesCreated.includes(c.entityId)).map(c=>c.entityId)).size},null,2));console.log('TOTAL',checks.length);
}finally{await browser.close();await new Promise(r=>server.close(r));}
