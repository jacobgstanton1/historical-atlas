import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readJSON,readContext,digest} from '../scripts/research-common.mjs';
import {buildOccurrenceMatrix,occurrenceSummary,occurrenceEligibility} from '../scripts/research-occurrence-completion.mjs';
import {datedMappingReviewAllows} from '../scripts/research-snapshot-scan.mjs';
import {createMetadataIndex,reviewedMapName} from '../historical-metadata.js';
import {productionPipeline} from '../scripts/coverage-inputs.mjs';
const {pipeline:{applyReviewedNames}}=await productionPipeline();
const context=readContext(),report=readJSON('research/completion-01/reports/occurrence-completion.json');
const row=(map,year)=>report.rows.find(r=>r.mapId===map&&r.snapshotYear===year);
test('every selectable occurrence is retained, including empty eligible dossiers',()=>{
 assert.equal(report.rows.length,context.manifest.identities.reduce((n,r)=>n+r.snapshotYears.length,0));
 assert.ok(report.rows.some(r=>r.eligibility.eligible&&r.entityId===null&&r.substantiveSupported===0));
 assert.equal(report.metrics.totalSlots,report.metrics.dossiers*15);
 assert.equal(report.metrics.states['not-applicable'],0);
});
test('one supported year never discharges another empty year',()=>{
 const rows=[{eligibility:{eligible:true},coreSupported:4,substantiveSupported:4,categories:{identity:{status:'supported'}}},{eligibility:{eligible:true},coreSupported:0,substantiveSupported:0,categories:{identity:{status:'missing'}}}];
 const m=occurrenceSummary(rows,['identity']);assert.equal(m.dossiers,2);assert.equal(m.completelyEmpty,1);assert.equal(m.supported,1);assert.equal(m.coreDistribution[0],1);
});
test('identity-only, one-core and sparse flagship triggers remain distinct',()=>{
 assert.ok(report.flags.some(r=>r.flagship&&r.coreSupported<4));
 assert.ok(report.flags.some(r=>r.reason==='zero-substantive-evidence'));
 assert.equal(Object.values(report.metrics.coreDistribution).reduce((a,b)=>a+b,0),report.metrics.dossiers);
 assert.ok(report.discontinuous.length>0);
});
test('communities and geographical features stay protected; unresolved is assessment only',()=>{
 for(const classification of ['community-people','geographic-or-composite'])assert.equal(occurrenceEligibility({stableMapId:'x',classification:{classification}},1800,context).eligible,false);
 const unresolved=occurrenceEligibility({stableMapId:'x',classification:{classification:'unresolved'}},1800,context);assert.ok(unresolved.eligible&&unresolved.pending);
});
test('uncertified eligibility fails closed',()=>{
 assert.throws(()=>occurrenceEligibility({stableMapId:'x'},1800,context,{occurrences:[{mapId:'x',snapshotYear:1800}]}),/Uncertified/);
});
test('mapping review is restricted to explicitly accepted dated entity intervals',()=>{
 const review={status:'mapping-review',intervals:[{entityId:'canada',validFrom:'1867-07-01',validUntil:'1931-01-01',sourceIds:['source']}]},m=[{entityId:'canada',sourceIds:['source']}],s=new Map([['source',{}]]);
 assert.equal(datedMappingReviewAllows(review,m,['canada'],1815,s),false);
 assert.equal(datedMappingReviewAllows(review,m,['canada'],1880,s),true);
 assert.equal(datedMappingReviewAllows(review,m,['other'],1880,s),false);
 assert.equal(datedMappingReviewAllows(review,m,['canada'],1880,new Map()),false);
 assert.equal(datedMappingReviewAllows(review,m,['canada','other'],1880,s),false);
 assert.equal(datedMappingReviewAllows({...review,intervals:[{...review.intervals[0],entityId:undefined}]},m,['canada'],1880,s),false);
});
test('all six Russian Empire snapshots have independently measured four-core coverage',()=>{
 for(const y of [1800,1815,1878,1880,1900,1914]){const r=row('entity-russian-empire',y);assert.equal(r.coreSupported,4,String(y));assert.equal(r.categories.overview.status,'supported',String(y));}
 assert.notEqual(row('entity-russian-empire',1800).entityId,row('entity-russian-empire',1914).entityId);
});
test('Russia1920 is not the USSR;1930 receives dated Union identity',()=>{
 const metadata=createMetadataIndex(context.db,context.registry);
 assert.match(reviewedMapName(metadata,'entity-soviet-union',1920,'USSR'),/RSFSR/);
 assert.equal(reviewedMapName(metadata,'entity-white-russia',1930,'White Russia'),'Soviet Union');
 assert.equal(row('entity-white-russia',1930).coreSupported,4);
 assert.match(reviewedMapName(metadata,'entity-soviet-union',1921,'USSR',1920),/unresolved for 1921/);
});
test('Chinese composites receive qualifications, not invented offices',()=>{
 for(const y of [1920,1930]){const r=row('entity-chinese-warlords',y);assert.equal(r.categories.overview.status,'supported');assert.notEqual(r.categories.leadership.status,'supported');assert.notEqual(r.categories.capital.status,'supported');}
 assert.equal(row('entity-chinese-warlords',1938).categories.overview.status,'missing');
 assert.match(row('entity-manchu-empire',1914).name,/Republic of China/);
});
test('reviewed title transform preserves geometry, raw source, stable IDs and colours',()=>{
 const original={type:'FeatureCollection',features:[{type:'Feature',geometry:{type:'Polygon',coordinates:[]},properties:{_stableId:'x',_name:'White Russia',NAME:'White Russia',_area:1,_entityArea:1,_color:'#123456'}}]};
 const result=applyReviewedNames(original,()=> 'Soviet Union');
 assert.equal(result.features[0].geometry,original.features[0].geometry);
 for(const key of ['_stableId','NAME','_area','_color'])assert.equal(result.features[0].properties[key],original.features[0].properties[key]);
 assert.equal(original.features[0].properties._name,'White Russia');assert.equal(result.features[0].properties._name,'Soviet Union');
 assert.equal(reviewedMapName(null,'x',1930,'Original'),'Original');
});
test('all previously accepted entities, sources, mappings and rich packages remain unchanged',()=>{
 const old=f=>JSON.parse(execFileSync('git',['show','841e6164:'+f],{encoding:'utf8',maxBuffer:100*1024*1024}));
 const before=old('data/historical-entities.json');
 for(const key of ['entities','mappings'])for(const item of before[key])assert.ok(context.db[key].some(x=>digest(x)===digest(item)),key+' preserved');
 for(const source of old('data/historical-sources.json').sources)assert.ok(context.registry.sources.some(x=>digest(x)===digest(source)));
 const current=readJSON('data/comprehensive-dossiers.json');for(const p of old('data/comprehensive-dossiers.json').packages)assert.ok(current.packages.some(x=>x.id===p.id&&digest(x)===digest(p)),p.id);
});
test('occurrence calculation is deterministic',()=>{
 const legacy=readJSON('research/completion-01/reports/completion.json');const records=legacy.records;
 legacy.rows=legacy.rows.map(r=>({...r,categories:Object.fromEntries(Object.entries(r.categories).map(([c,s])=>[c,{...s,records:s.records.map(id=>records[id])}]))}));
 const options={overlay:readJSON('research/completion/occurrence-eligibility.json'),visibility:readJSON('research/snapshot-qa-01/baseline.json').occurrences};
 assert.equal(digest(buildOccurrenceMatrix(context,legacy,options)),digest(buildOccurrenceMatrix(context,legacy,options)));
});
