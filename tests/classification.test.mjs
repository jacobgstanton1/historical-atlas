
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {classifyCoverage,CATEGORIES,combinedReport} from '../scripts/classification.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const m=read('development/coverage/manifest.json'),config=read('development/coverage/classification-plan.json'),plan=read('development/coverage/research-plan.json');
const political=r=>['political-polity','dependent-administration'].includes(r.classification.classification);
const row=id=>m.identities.find(r=>r.stableMapId===id);
test('every raw identity has exactly one auditable classification and classification totals reconcile',()=>{
 assert.equal(m.identities.length,880);assert.equal(new Set(m.identities.map(r=>r.stableMapId)).size,880);
 assert.deepEqual(Object.keys(config.decisions).sort(),m.identities.map(r=>r.stableMapId).sort());
 assert.equal(Object.values(m.classification.totals).reduce((a,b)=>a+b,0),880);
 for(const r of m.identities){
  assert.ok(CATEGORIES.includes(r.classification.classification));assert.ok(r.classification.rationale);
  assert.ok(r.classification.status);assert.ok(r.classification.evidence.every(id=>config.evidenceRegistry[id]));
  assert.equal(r.dossierEligibility==='political-candidate',political(r));
  assert.ok(!('capitals' in r.classification)&&!('sovereignty' in r.classification)&&!('leaders' in r.classification));
 }
});
test('all snapshot classification partitions and political coverage use dated resolver results',()=>{
 assert.equal(m.classification.bySnapshot.length,11);
 for(const s of m.classification.bySnapshot){
  const present=m.identities.filter(r=>r.snapshotYears.includes(s.year));
  assert.equal(Object.values(s.classifications).reduce((a,b)=>a+b,0),present.length);
  assert.equal(s.rawIdentities,m.bySnapshot.find(r=>r.year===s.year).selectableIdentities);
  assert.equal(s.politicalCandidates,s.classifications['political-polity']+s.classifications['dependent-administration']);
  assert.equal(s.politicalCovered,present.filter(r=>political(r)&&r.snapshotCoverage.find(c=>c.year===s.year).receivesCuratedDossier).length);
  assert.equal(s.politicalUncovered+s.politicalCovered,s.politicalCandidates);
 }
 const p=m.classification.politicalCoverage;
 assert.equal(p.candidates,m.identities.filter(political).length);assert.equal(p.covered,7);
 assert.equal(p.covered,m.identities.filter(r=>political(r)&&r.currentlyResolvesToDossier).length);
});
test('Australian and other community labels remain outside missing-country counts and political batches',()=>{
 const ids=m.classification.australianCommunityMapIds;assert.equal(ids.length,377);
 const selected=new Set(m.phase2Batches.flatMap(b=>b.mapIds));
 for(const id of ids){const r=row(id);assert.equal(r.classification.classification,'community-people');assert.ok(r.snapshotYears.includes(1800));assert.ok(!selected.has(id));assert.ok(!r.phase2BatchId);}
 for(const r of m.identities.filter(r=>['community-people','geographic-or-composite'].includes(r.classification.classification)))assert.ok(!selected.has(r.stableMapId));
 assert.equal(row('entity-maori').dossierEligibility,'specialised-profile-deferred');
});
test('political batch plan includes every eligible ID once and counts only permitted political naming reviews',()=>{
 const ids=m.phase2Batches.flatMap(b=>b.mapIds);assert.equal(ids.length,new Set(ids).size);
 const allEligible=m.identities.filter(political).map(r=>r.stableMapId);
 assert.deepEqual(ids.filter(id=>political(row(id))).sort(),allEligible.sort());
 assert.equal(m.phase2Batches.reduce((n,b)=>n+b.politicalCandidates,0),m.classification.politicalCoverage.candidates);
 assert.equal(m.phase2Batches.reduce((n,b)=>n+b.uncoveredPoliticalCandidates,0),m.classification.politicalCoverage.uncovered);
 for(const b of m.phase2Batches){
  assert.ok(b.totalIdentities<=30);assert.equal(b.totalIdentities,b.politicalCandidates+b.nameReviews);
  assert.equal(b.state,'proposed-not-authorised');
  for(const id of b.mapIds){assert.equal(row(id).phase2BatchId,b.id);assert.ok(political(row(id))||row(id).classification.classification==='name-variant-or-duplicate');}
 }
 for(const r of m.identities.filter(r=>r.classification.classification==='unresolved'))assert.ok(!ids.includes(r.stableMapId));
});
test('continuity families and proposed canonical pairs stay together without changing raw identities',()=>{
 const selected=new Set(m.phase2Batches.flatMap(b=>b.mapIds));
 for(const q of m.questions.filter(q=>q.type==='candidate-family')){
  const ids=q.mapIds.filter(id=>selected.has(id));assert.ok(new Set(ids.map(id=>row(id).phase2BatchId)).size<=1);
 }
 for(const r of m.identities){const id=r.classification.candidateCanonicalIdentity?.mapId;
  if(selected.has(id)&&selected.has(r.stableMapId))assert.equal(r.phase2BatchId,row(id).phase2BatchId);
  if(id)assert.notEqual(id,r.stableMapId);
 }
 const corrupt=m.identities.find(r=>r.displayName==='M?ori');
 assert.ok(corrupt);assert.equal(corrupt.classification.classification,'name-variant-or-duplicate');
 assert.equal(corrupt.classification.candidateCanonicalIdentity.mapId,'entity-maori');assert.ok(!selected.has(corrupt.stableMapId));
 assert.ok(m.classification.reviewQueue.some(r=>r.mapId===corrupt.stableMapId&&r.route==='specialised-community-name-review'));
});
test('occupation zones are administrative candidates with no automatic later-state mapping',()=>{
 for(const name of ['Germany (France)','Germany (Soviet)','Germany (UK)','Germany (USA)','Japan (USA)','Korea (USA)','Korea (USSR)']){
  const r=m.identities.find(r=>r.displayName===name);assert.equal(r.classification.classification,'dependent-administration');
  assert.equal(r.dossierEligibility,'political-candidate');assert.equal(r.mappings.length,0);
 }
 const raj=m.identities.find(r=>r.displayName==='British Raj');assert.equal(raj.classification.classification,'dependent-administration');assert.ok(raj.currentlyResolvesToDossier);
});
test('heuristic warnings and explicit classification review cases have distinct auditable meanings',()=>{
 const a=m.classification.questionAudit;
 assert.equal(a.legacyRecords,261);assert.equal(a.legacyAffectedMapIds,818);
 assert.equal(Object.values(a.scopes).reduce((n,s)=>n+s.records,0),m.questions.length);
 const cases=new Set([...m.identities.filter(r=>['unresolved','name-variant-or-duplicate'].includes(r.classification.classification)||r.classification.candidateCanonicalIdentity).map(r=>r.stableMapId),...m.questions.filter(q=>q.type==='mapping-date-review').flatMap(q=>q.mapIds)]);
 assert.deepEqual([...cases].sort(),a.specificUnresolvedMapIds);
 assert.equal(a.specificUnresolvedIdentityCount,cases.size);assert.ok(cases.size<a.legacyAffectedMapIds);
 assert.ok(m.questions.filter(q=>['source-presence-gap','authority-grouping'].includes(q.type)).every(q=>q.reviewScope==='identity-attached-source-caution'));
});
test('missing, extra, invalid and unsupported classification decisions fail closed',()=>{
 const attempt=change=>{const c=structuredClone(config);change(c);return()=>classifyCoverage(structuredClone(m),c,plan);};
 const id=m.identities[0].stableMapId;
 assert.throws(attempt(c=>delete c.decisions[id]),/complete raw inventory/);
 assert.throws(attempt(c=>c.decisions.extra=c.decisions[id]),/complete raw inventory/);
 assert.throws(attempt(c=>c.decisions[id].classification='country'),/Invalid classification/);
 assert.throws(attempt(c=>c.decisions[id].evidence=['invented']),/Invalid classification/);
 assert.throws(attempt(c=>c.decisions[id].candidateCanonicalIdentity={mapId:'nonexistent'}),/Unknown canonical/);
 assert.throws(attempt(c=>c.phase2.limit=100),/target size/);
});
test('reclassification is deterministic and raw inventory fields are not changed',()=>{
 const regenerated=classifyCoverage(structuredClone(m),config,plan);
 assert.deepEqual(regenerated,m);
 const report=fs.readFileSync(new URL('../development/coverage/REPORT.md',import.meta.url),'utf8').replace(/\r\n/g,'\n');
 assert.equal(combinedReport(m,read('development/coverage/inputs.lock.json')),report);
 for(const r of m.identities){const result=regenerated.identities.find(x=>x.stableMapId===r.stableMapId);
  for(const key of ['stableMapId','sourceNames','snapshotYears','mappings','snapshotCoverage','continuity'])assert.deepEqual(result[key],r[key]);}
});
test('development classification/report files are not imported or fetched by production',()=>{
 for(const name of ['app.js','data-pipeline.js','historical-metadata.js','dossier.js','boundary-history.js','index.html']){
  const text=fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
  assert.ok(!/development\/coverage|classification-plan|classification\.mjs|manifest\.json/.test(text),name);
 }
 const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');assert.match(app,/v=0\.6\.1/);
});
