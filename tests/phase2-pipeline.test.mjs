import test from 'node:test';
import assert from 'node:assert/strict';
import {claim,context,hash,planIntegration} from '../scripts/phase2-pipeline.mjs';
const baseline=context();
function fixture(order){
 const scope=baseline.manifest.phase2Batches.find(b=>b.order===order),source={id:'probe-source-'+order,title:'Isolated synthetic test only',institution:'Test fixture',accessed:'2026-10-01',url:'https://example.org/phase2-fixture',usage:'Synthetic record never written to production.'};
 const fact=value=>({value,validFrom:'1900-01-01',validUntil:'1901-01-01',sourceIds:[source.id]});
 const raw=scope.mapIds[0],entity={id:'synthetic-'+order,names:[{...fact('Test'),kind:'primary'}],politicalStatus:[fact('Test framework')],descriptions:[fact('Test only')],existence:{...fact('Test')}};
 const seed=baseline.manifest.identities.find(r=>r.stableMapId===raw).snapshotYears[0];
 return {schemaVersion:1,batchId:scope.id,assignedRawIdentities:scope.mapIds,researchedIdentities:scope.mapIds,entities:[entity],extensions:[],mappings:[{mapId:raw,entityId:entity.id,...fact('Test')}],sources:[source],decisions:Object.fromEntries(scope.mapIds.map(id=>[id,{status:'mapping-review',tier:'none',reviewerNote:'Synthetic only',identityResolution:'Test',sourceIds:[source.id],intervals:[fact('Test')]}])),browserCases:[{mapId:raw,entityId:entity.id,year:1900,seedYear:seed}],classificationPrerequisites:scope.classificationPrerequisites.map(mapId=>({mapId,decision:'Test only',sourceIds:[source.id]})),classificationChanges:[],existingEntitiesReused:[],limitations:[],partialIdentities:[],unresolvedIdentities:[],mappingReviewIdentities:[],exclusions:[],historicalCautions:['Synthetic overlap test; never production evidence'],overviewPeriods:[],leadershipRecords:[],eventsRelationships:[],filesRequired:[],workerValidation:{state:'passed'}};
}
test('queue rejects duplicate assignments, busy workers and capacity overflow',()=>{
 const s={concurrency:2,jobs:[8,9,10].map(n=>({batchId:'b'+n,status:'queued'}))};claim(s,'b8','A');claim(s,'b9','B');assert.throws(()=>claim(s,'b8','C'));assert.throws(()=>claim(s,'b10','A'));assert.throws(()=>claim(s,'b10','C'));
});
test('two isolated research packages integrate serially without mutating their inputs or production',()=>{
 const before=hash(baseline),a=fixture(8),b=fixture(9),originalA=hash(a),originalB=hash(b);
 // A fixture must not compete with the real, already mapped United States.
 a.mappings[0].mapId=a.assignedRawIdentities[1];a.browserCases[0].mapId=a.assignedRawIdentities[1];a.browserCases[0].seedYear=1815;
 const aHash=hash(a),first=planIntegration(a,baseline),second=planIntegration(b,{...baseline,db:first.db,registry:first.registry,plan:first.plan});
 assert.equal(hash(baseline),before);assert.equal(hash(a),aHash);assert.equal(hash(b),originalB);assert.notEqual(originalA,aHash);
 assert.equal(second.db.entities.length,baseline.db.entities.length+2);assert.equal(second.registry.sources.length,baseline.registry.sources.length+1);assert.equal(second.sourceAliases['probe-source-9'],'probe-source-8');
 assert.ok(second.db.entities.find(e=>e.id==='synthetic-9').names[0].sourceIds.includes('probe-source-8'));assert.deepEqual(second.db.entities.slice(0,baseline.db.entities.length),baseline.db.entities);
});
test('incomplete scope, missing bodies/provenance and unresolvable cases fail before writes',()=>{
 let p=fixture(8);p.researchedIdentities=[];assert.throws(()=>planIntegration(p,baseline));p=fixture(8);p.sources[0].usage='';assert.throws(()=>planIntegration(p,baseline));p=fixture(8);p.browserCases[0].year=1960;assert.throws(()=>planIntegration(p,baseline));
});
test('source-ID conflicts, entity collisions and stale extensions cannot silently overwrite checkpoints',()=>{
 let p=fixture(8);p.sources[0].id=baseline.registry.sources[0].id;assert.throws(()=>planIntegration(p,baseline));p=fixture(8);p.entities[0].id=baseline.db.entities[0].id;assert.throws(()=>planIntegration(p,baseline));p=fixture(8);p.extensions=[{entityId:baseline.db.entities[0].id,expectedHash:'stale',append:{names:[]}}];assert.throws(()=>planIntegration(p,baseline));
});
