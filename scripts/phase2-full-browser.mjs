
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
const root=process.cwd(); // Development-only browser instrumentation, never served to production.
const out=path.join(os.tmpdir(),'historical-atlas-phase2-full-validation');
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
const select=async id=>{await page.evaluate(id=>window.__atlas.selectFeature(id),id);await page.waitForSelector('#inspector.is-open');};
const year=async value=>{
 await page.evaluate(value=>window.__atlas.goToRequestedYear(value),value);
 await page.waitForFunction(value=>window.__atlas.requestedYear===value && document.querySelector('#loading-indicator').hidden,value,{timeout:90000});
 await page.waitForFunction(()=>Array.from(document.querySelectorAll('.dossier-flag img')).every(i=>i.complete&&i.naturalWidth>0),{},{timeout:10000});
};
try {
 await page.goto('http://127.0.0.1:8765');
 await page.waitForFunction(()=>window.__atlas?.features.length && window.__atlas.metadata && document.querySelector('#loading-indicator').hidden,{},{timeout:90000});
 await page.waitForTimeout(1500);
 for(const [id,name,needle] of [
  ['entity-united-states','US sovereign example','1930 census'],
  ['entity-united-kingdom','UK leadership','Neville Chamberlain'],
  ['entity-germany','Germany regime','Nazi one-party dictatorship'],
  ['entity-soviet-union','USSR political leadership','Party-state leadership'],
  ['entity-empire-of-japan','Imperial Japan','Meiji constitutional framework'],
  ['entity-british-raj','Dependent British Raj','British imperial rule']]){
    await select(id);check(name,(await text()).includes(needle));
 }

 await page.screenshot({path:path.join(out,'desktop-curated.png')});
 const sources=await page.locator('.dossier-sources a').evaluateAll(links=>links.every(a=>a.target==='_blank'&&a.rel.includes('noopener')&&a.rel.includes('noreferrer')&&a.href.startsWith('https://')));
 check('Safe relevant external sources',sources);
 const marker=page.locator('.fact-source').first();
 await marker.click();
 check('Fact marker targets a source',await page.evaluate(()=>!!document.querySelector(location.hash)));
 const closeRect=await page.locator('#close-inspector').boundingBox();
 const panelRect=await page.locator('#inspector').boundingBox();
 check('Close remains available when dossier scrolled',closeRect.y>=panelRect.y && closeRect.y<panelRect.y+panelRect.height);
 await page.locator('#inspector').evaluate(e=>e.scrollTop=0);
 await page.locator('.relationship-row button').filter({hasText:'United Kingdom'}).first().click();
 check('Relationship link selects UK and keeps year',(await text()).includes('George VI')&&await page.evaluate(()=>window.__atlas.requestedYear===1938));
 await select('entity-british-raj');
 await page.getByRole('button',{name:'India',exact:true}).click();
 check('Explicit successor selects actual map identity without a year jump',(await text()).includes('entity-india')&&await page.evaluate(()=>window.__atlas.requestedYear===1938));
 await select('entity-british-raj');
 check('Unmapped predecessor/successor is clearly unavailable',(await text()).includes('Not represented as this identity'));
 await page.getByRole('button',{name:'View in 1947',exact:true}).click();
 await page.waitForFunction(()=>window.__atlas.requestedYear===1947&&document.querySelector('#loading-indicator').hidden,{},{timeout:90000});
 check('Entity event changes requested year deliberately',(await text()).includes('1947 CE'));
 check('Absent entity remains selected with notice',(await text()).includes('entity-british-raj')&&(await text()).includes('not present in the 1945 boundary snapshot'));
 check('Nearest snapshot and curated history remain independent',(await text()).includes('1947-08')&&(await text()).includes('1945 · nearest'));
 await year(1938);
 await select('entity-united-states');
 await page.waitForSelector('.boundary-navigation button',{timeout:90000});
 const previous=page.locator('.boundary-navigation button').filter({hasText:'Previous mapped change'}).first();
 const previousYear=Number((await previous.innerText()).split('·').at(-1).trim());
 await previous.click();
 await page.waitForFunction(y=>window.__atlas.requestedYear===y&&document.querySelector('#loading-indicator').hidden,previousYear,{timeout:90000});
 check('Previous mapped-change navigation retains entity',(await text()).includes('entity-united-states'));
 await page.waitForSelector('.boundary-navigation button',{timeout:90000});
 const next=page.locator('.boundary-navigation button').filter({hasText:'Next mapped change'}).first();
 const nextYear=Number((await next.innerText()).split('·').at(-1).trim());
 await next.click();
 await page.waitForFunction(y=>window.__atlas.requestedYear===y&&document.querySelector('#loading-indicator').hidden,nextYear,{timeout:90000});
 check('Next mapped-change navigation',await page.evaluate(()=>window.__atlas.requestedYear===window.__atlas.features[0].properties._year));
 await year(1938);
 await select('entity-germany'); await year(1934);
 check('Within-year leadership transition shows both dated roles',(await text()).includes('Chancellor')&&(await text()).includes('Führer and Reich chancellor')&&(await text()).includes('1934-08-02'));
 await year(1945);
 check('Germany absence does not become an occupied zone',(await text()).includes('not present')&&(await text()).includes('entity-germany'));
 await year(1938);const fallbackId=await page.evaluate(()=>window.__atlas.features.find(f=>{const r=window.__atlas.metadata.resolve(f.properties._stableId,1938);return !r.entity&&!r.identityPeriods?.length;}).properties._stableId);await select(fallbackId);
 check('Uncurated fallback',(await text()).includes('not yet been curated')&&(await text()).includes('SUBJECTO'));
 await year(1937);
 check('Same snapshot recomputes requested-year dossier',(await text()).includes('1937 CE')&&(await text()).includes('1938 · nearest'));
 await select('entity-united-states'); await year(1959);
 check('1959 transition shows dated 48- and 49-star flags',await page.locator('.dossier-flag img').count()===2);
 await year(1960);
 check('1960 transition shows dated 49- and 50-star flags',await page.locator('.dossier-flag img').evaluateAll(imgs=>imgs.length===2&&imgs.every(img=>img.complete&&img.naturalWidth>0)));
 check('No Roosevelt leadership silently carried into 1960',!(await text()).includes('President\nFranklin'));
 await select('entity-japan');
 check('Post-war Japan uses a distinct profile',(await text()).includes('popular sovereignty')&&await page.evaluate(()=>window.__atlas.metadata.resolve('entity-japan',1960).governments.every(f=>!f.value.includes('Meiji'))));
 await year(1938);
 await page.locator('#search').fill('British India');
 await page.locator('#search-results button').filter({hasText:'British Raj'}).click();
 check('Curated alias search resolves real entity',(await text()).includes('entity-british-raj'));
 await page.locator('#close-inspector').click();
 check('Keyboard-accessible close hides inert panel',await page.locator('#inspector').evaluate(e=>e.inert&&e.getAttribute('aria-hidden')==='true'));
 await page.locator('#reset-view').click(); await page.waitForTimeout(900);
 const p=await page.evaluate(()=>window.__atlas.map.project([-100,38]));
 await page.mouse.click(p.x,p.y);
 check('Real map click opens US dossier',(await text()).includes('entity-united-states'));
 await page.locator('#labels-toggle').click();
 check('Labels off',await page.evaluate(()=>window.__atlas.map.getLayoutProperty('territory-labels','visibility')==='none'));
 await page.locator('#labels-toggle').click();
 check('Labels on',await page.locator('#labels-toggle').getAttribute('aria-pressed')==='true');
 await page.evaluate(()=>window.__atlas.map.jumpTo({center:[80,30],zoom:6}));
 await page.locator('#reset-view').click(); await page.waitForTimeout(700);
 check('Reset restores world fit',await page.evaluate(()=>window.__atlas.map.getZoom()<2));
 await page.locator('#timeline').fill('1936'); await page.locator('#timeline').dispatchEvent('input');
 await page.waitForFunction(()=>window.__atlas.requestedYear===1936,{},{timeout:90000});
 check('Slider preserves selected dossier',(await text()).includes('1936 CE'));
 await page.locator('#year-jump').fill('1938'); await page.locator('#year-form button').click();
 await page.waitForFunction(()=>window.__atlas.requestedYear===1938&&document.querySelector('#loading-indicator').hidden,{},{timeout:90000});
 check('Typed year exact snapshot',(await text()).includes('1938 · exact'));
 await page.locator('#previous-year').click(); await page.waitForFunction(()=>window.__atlas.requestedYear===1930&&document.querySelector('#loading-indicator').hidden,{},{timeout:90000});
 check('Previous timeline control',(await text()).includes('1930 CE'));
 await page.locator('#next-year').click(); await page.waitForFunction(()=>window.__atlas.requestedYear===1938&&document.querySelector('#loading-indicator').hidden,{},{timeout:90000});
 check('Next timeline control',(await text()).includes('1938 CE'));
 await page.locator('#play').click(); await page.waitForFunction(()=>window.__atlas.requestedYear!==1938,{},{timeout:90000});
 await page.evaluate(()=>window.__atlas.stopPlay());
 await page.waitForFunction(()=>document.querySelector('#loading-indicator').hidden,{},{timeout:90000});
 check('Playback retains dossier',await page.locator('#inspector').evaluate(e=>e.classList.contains('is-open')));
 await year(1938);
 const labelReport=await page.evaluate(async()=>{
 const {buildLabelCollection}=await import('/data-pipeline.js?v=0.6.1');
 const fs=window.__atlas.features,labels=buildLabelCollection({features:fs}).features;
 return {unique:new Set(labels.map(f=>f.properties._stableId)).size===labels.length,
 dependent:labels.some(f=>f.properties._presentationRole==='dependent'),
 antarctica:fs.some(f=>/antarctica/i.test(f.properties._name)),
 max:window.__atlas.map.getMaxZoom(),compare:!!document.querySelector('[id*="compare"]')};
 });
 check('v0.5 one-label hierarchy, Antarctica exclusion, max zoom and no Compare Dates',
 labelReport.unique&&labelReport.dependent&&!labelReport.antarctica&&labelReport.max===18&&!labelReport.compare);
 // Exercise the renderer’s mixed-piece precision without modifying the actual map.
 const mixed=await page.evaluate(async()=>{
 const {renderDossier}=await import('/dossier.js?v=0.6.1');
 const detached=document.createElement('div');
 const fs=window.__atlas.features.filter(f=>f.properties._stableId==='entity-united-states').slice(0,1);
 const two=[fs[0],{...fs[0],properties:{...fs[0].properties,_confidenceLabel:'Approximate — source precision class 1; frontier uncertain'}}];
 renderDossier(detached,{stableId:'entity-united-states',savedName:'United States',features:two,allFeatures:fs,
 year:1938,snapshotYear:1938,metadata:window.__atlas.metadata,presence:'Test',selectRelated:()=>{},goYear:()=>{},
 findBoundaries:async()=>({}),boundaryIndex:8,currentMapIds:new Set(['entity-united-states']),minYear:1800,maxYear:1960});
 return detached.textContent.includes('Mixed:')&&!detached.textContent.includes('undefined')&&!detached.textContent.includes('null');
 });
 check('Mixed source precision and no missing-value placeholders',mixed);
 await select('entity-united-states');
 await page.locator('.dossier-flag img').first().evaluate(img=>img.dispatchEvent(new Event('error')));
 check('Failed flag image removed cleanly',await page.locator('.dossier-flag').count()===0);
 await year(1937);await year(1938);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);
 await page.screenshot({path:path.join(out,'mobile-final.png')});
 const layout=await page.evaluate(()=>{
  const r=document.querySelector('#inspector').getBoundingClientRect();
  return {inside:r.x>=0&&r.right<=innerWidth,visibleMap:r.y>150,scroll:document.body.scrollHeight===innerHeight};
 });
 check('Responsive mobile sheet preserves map and app height',layout.inside&&layout.visibleMap&&layout.scroll);
 await page.locator('#close-inspector').focus();await page.keyboard.press('Space');
 check('Space activates close, not playback',await page.locator('#inspector').evaluate(e=>e.inert));
 await page.setViewportSize({width:1440,height:900});await select('entity-united-states');
 await page.screenshot({path:path.join(out,'desktop-final.png')});


 const independent=await page.evaluate(async()=>{
  const ids=new Set(),counts=[];
  for(const s of window.__atlas.snapshots){const prepared=await window.__atlas.loadSnapshotData(s);const selected=new Set(prepared.features.map(f=>f.properties._stableId));for(const id of selected)ids.add(id);counts.push({year:s.year,count:selected.size});}
  return {ids:[...ids].sort(),counts};
 });
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'development/coverage/manifest.json')));
 check('All eleven browser snapshot identity totals match the Node audit',JSON.stringify(independent.counts)===JSON.stringify(manifest.bySnapshot.map(s=>({year:s.year,count:s.selectableIdentities}))));
 check('Every browser selectable ID matches the canonical inventory',JSON.stringify(independent.ids)===JSON.stringify(manifest.identities.map(r=>r.stableMapId).sort()));


 const batchCases=[
 [1800,'entity-united-kingdom','great-britain-1707'],[1800,'entity-kingdom-of-ireland','kingdom-of-ireland'],
 [1800,'entity-denmark-norway','denmark-norway-monarchy'],[1800,'entity-sweden','sweden-kingdom'],
 [1800,'entity-france','france-political-frameworks'],[1800,'entity-batavian-republic','batavian-republic'],
 [1800,'entity-helvetic-republic','helvetic-republic'],
 [1815,'entity-sweden-norway','sweden-norway-union'],[1815,'entity-switzerland','swiss-confederation-1815'],
 [1815,'entity-portugal','portugal-political-frameworks'],[1815,'entity-luxembourg','luxembourg-grand-duchy'],
 [1815,'entity-san-marino','san-marino-republic'],
 [1878,'entity-denmark','denmark-post-kiel'],[1878,'entity-belgium','belgium-kingdom'],
 [1878,'entity-netherlands','netherlands-kingdom'],[1878,'entity-malta','malta-british-administration'],
 [1878,'entity-iceland','iceland-danish-administration'],
 [1914,'entity-finland','finland-grand-duchy'],[1914,'entity-norway','norway-constitutional-kingdom'],
 [1920,'entity-finland','finland-independent'],[1920,'entity-iceland','iceland-sovereign'],
 [1938,'entity-ireland','ireland-independent'],[1938,'entity-andorra','andorra-historic-coprincipality'],
 [1960,'entity-switzerland','swiss-federal-state'],[1960,'entity-spain','spain-political-frameworks']];
 for(const [y,id,entity]of batchCases){await year(y);await select(id);
 const resolved=await page.evaluate(({id,y})=>window.__atlas.metadata.resolve(id,y).entity?.id,{id,y});
 check('Batch 01 browser entity '+entity+' @ '+y,resolved===entity&&(await text()).includes(String(y))&&(await page.locator('.dossier-sources a').count())>0);
 check('Batch 01 source links '+entity,await page.locator('.dossier-sources a').evaluateAll(a=>a.length>0&&a.every(a=>a.href.startsWith('https://')&&a.target==='_blank'&&a.rel.includes('noopener'))));
 }
 for(const [id,y,entity]of [['entity-united-kingdom',1801,'united-kingdom'],['entity-sweden-norway',1905,'sweden-norway-union'],['entity-united-kingdom-of-great-britain-and-ireland',1927,'united-kingdom'],['entity-ireland',1937,'ireland-independent'],['entity-ireland',1949,'ireland-independent']]){
 await year(y);await select(id);const r=await page.evaluate(({id,y})=>({entity:window.__atlas.metadata.resolve(id,y).entity?.id,snapshot:window.__atlas.snapshots[window.__atlas.currentIndex].year}),{id,y});
 check('Between-snapshot historical dossier '+id+' '+y,r.entity===entity&&r.snapshot!==y&&(await text()).includes(String(y)));
 }
 for(const [id,y]of [['entity-finland',1917],['entity-iceland',1918],['entity-switzerland',1848]]){
 await year(y);await select(id);check('Ambiguous identity transition '+id+' '+y,await page.evaluate(({id,y})=>window.__atlas.metadata.resolve(id,y).ambiguous,{id,y}));}
 await year(1930);
 await page.locator('#search').fill('Northern Ireland');await page.waitForTimeout(400);
 check('New dated UK formal name search',await page.locator('#search-results').innerText().then(t=>/United Kingdom/i.test(t)));
 await year(1938);await select('entity-united-states');


 const transitionCases=[
 ['entity-france',1815,'partial-framework'],['entity-france',1900,'ordinary'],
 ['entity-denmark-norway',1800,'ordinary'],['entity-sweden-norway',1900,'ordinary'],
 ['entity-sweden-norway',1905,'partial-framework'],['entity-finland',1917,'identity-transition'],
 ['entity-iceland',1918,'identity-transition'],['entity-ireland',1922,'partial-framework'],
 ['entity-denmark-norway',1814,'partial-framework'],['entity-norway',1814,'partial-framework'],
 ['entity-united-kingdom',1801,'ordinary'],['entity-united-kingdom',1936,'ordinary'],
 ['entity-united-states',1945,'ordinary'],['entity-finland',1919,'framework-transition'],
 ['entity-iceland',1944,'framework-transition'],['entity-ireland',1937,'framework-transition'],
 ['entity-ireland',1949,'framework-transition'],['entity-denmark',1849,'framework-transition'],
 ['entity-sweden',1809,'framework-transition'],['entity-france',1940,'framework-transition'],
 ['entity-france',1944,'framework-transition'],['entity-france',1946,'framework-transition'],
 ['entity-france',1958,'partial-framework'],['entity-switzerland',1848,'identity-transition']];
 for(const [id,y,kind]of transitionCases){
  const seed=manifest.identities.find(r=>r.stableMapId===id).snapshotYears[0];
  await year(seed);await select(id);await year(y);
  const r=await page.evaluate(({id,y})=>window.__atlas.metadata.resolve(id,y),{id,y});
  const header=await page.locator('.dossier-year').innerText();
  check('Transition consistency '+id+' '+y,r.calendarYear.kind===kind && (kind==='ordinary'?!header.includes('Transition'):header.includes('Transition')));
  const body=await text();
  const perspectives=r.identityPeriods?.length?r.identityPeriods:[r];
  check('All dated status/government/leader records retained '+id+' '+y,perspectives.every(p=>['politicalStatus','governments','leaders'].every(f=>(p[f]||[]).every(v=>body.includes(v.value)))));
  if(r.ambiguous)check('Separate sourced identity sections '+id+' '+y,await page.locator('.dossier-section h3').count()===2 && !body.includes('more precise date can be selected'));
  if(id==='entity-france'&&y===1815){
   check('France restoration is not the whole-year header',!header.includes('Restored monarchy')&&body.includes('1815-08-17')&&body.includes('needs research'));
   await page.screenshot({path:path.join(out,'france-1815-transition.png')});
  }
  if(id==='entity-france'&&y===1900)await page.screenshot({path:path.join(out,'france-1900-ordinary.png')});
  if(id==='entity-finland'&&y===1917)await page.screenshot({path:path.join(out,'finland-1917-identities.png')});
 }
 await page.locator('.fact-source').first().click();
 check('Transition citation marker navigation',await page.evaluate(()=>!!document.querySelector(location.hash)));
 await year(1938);await select('entity-united-states');

 check('Visible v0.6 credit',await page.locator('.source-credit').innerText().then(t=>t.includes('v0.6')));
 check('No browser runtime errors',errors.length===0);
 check('Only expected local-snapshot and favicon HTTP misses',httpErrors.every(e=>e.status===404&&(e.url.includes('/data/world_')||e.url.includes('/favicon.ico'))));
 // Enrichment failures must leave the core map and fallback dossier usable.
 const fallback=await browser.newPage({viewport:{width:1200,height:850},ignoreHTTPSErrors:true});
 fallback.on('pageerror',e=>errors.push(e.message));
 await fallback.route('**/historical-entities.json*',route=>route.fulfill({status:503,body:'Unavailable'}));
 await fallback.goto('http://127.0.0.1:8765');
 await fallback.waitForFunction(()=>window.__atlas?.features.length&&document.querySelector('#loading-indicator').hidden,{},{timeout:90000});
 await fallback.evaluate(()=>window.__atlas.selectFeature('entity-united-states'));
 check('Metadata failure retains map-derived dossier',(await fallback.locator('#dossier-content').innerText()).includes('Historical metadata could not be loaded'));
 await fallback.route('**/world_1800.geojson*',route=>route.fulfill({status:503,body:'Unavailable'}));
 await fallback.evaluate(()=>window.__atlas.goToRequestedYear(1800));
 await fallback.waitForFunction(()=>document.querySelector('#snapshot-note').textContent==='Boundary file unavailable',{},{timeout:90000});
 check('Snapshot failure identifies retained geometry and updates requested-year dossier',
  (await fallback.locator('#dossier-content').innerText()).includes('1800 CE')&&
  (await fallback.locator('#dossier-content').innerText()).includes('1938 · retained snapshot'));
 await fallback.close();
 check('No runtime errors including failure paths',errors.length===0);
 fs.writeFileSync(path.join(out,'validation-report.json'),JSON.stringify({checks,errors,labelReport,layout},null,2));
 console.log('RESULT',JSON.stringify({passed:checks.length,errors,output:out}));
} finally {await browser.close();await new Promise(r=>server.close(r));}
