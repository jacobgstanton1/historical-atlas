// Supplied-source validation only; no acquisition or identity changes.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {readContext,readJSON,saveJSON,digest} from './research-common.mjs';
import {fields,fingerprint,validateDossier,acceptDossier,integrateDossier,temporalBounds} from './research-comprehensive.mjs';
import {parseCSV} from './integrate-external-capital-a-v2.mjs';
const out='research/external-capital-interval-wave-01', root=process.cwd();
const supplied=readJSON(out+'/supplied-package.json'), reviews=readJSON(out+'/claim-source-review.json');
const apply=process.argv.includes('--apply');
const baseline=readContext(root), before=readJSON('data/comprehensive-dossiers.json');
assert.equal(baseline.productionFingerprint,supplied.metadata.requiredProductionFingerprint,'Production drift: rerun requires a fresh reviewed baseline');
const rows=parseCSV(fs.readFileSync('exports/dossier-workload/MASTER.csv','utf8')).rows;
const cells=new Map(rows.map(r=>[r.cell_id,r])), seen=new Set(), dispositions=[], results=[];
const bounds={ 'capint-001':['1800','1897'], 'capint-002':['1899','1960'], 'capint-012':['1901','1960'], 'capint-017':['1878','1916'], 'capint-020':['1911','1938'], 'capint-028':['1878','1900'], 'capint-029':['1834','1929'] };
for(const p of supplied.claims){
 assert.equal(p.productionFingerprint,supplied.metadata.requiredProductionFingerprint);assert.equal(p.category,'capital');
 assert.deepEqual(p.applicableCellIds,p.applicableSnapshotIds.map(id=>id+'/capital'));
 const reasons=[], cellDecisions=[];
 const originalBounds=p.temporal.until?temporalBounds(p.temporal):null;
 for(const id of p.applicableCellIds){assert.ok(!seen.has(id),'Duplicate cell');seen.add(id);const b=cells.get(id);assert.ok(b,'Unknown cell '+id);assert.equal(b.atlas_entity_id,p.atlasEntityId);assert.equal(b.production_fingerprint,supplied.metadata.requiredProductionFingerprint);
  const year=String(b.snapshot_year), y=temporalBounds({kind:'interval',from:year,until:year});
  const mapped=baseline.db.mappings.some(m=>{if(m.mapId!==b.occurrence_id.split('@')[0]||m.entityId!==p.atlasEntityId)return false;try{const mb=temporalBounds({kind:'interval',from:m.validFrom||year,until:m.validUntil||year});return mb.lo<=y.lo&&mb.hi>=y.hi;}catch{return false;}});
  const cellReasons=[];if(!mapped||b.identity_review_required==='true')cellReasons.push('Existing snapshot mapping is unresolved or does not cover the complete selected year.');
  if(originalBounds&&(y.lo<originalBounds.lo||y.hi>originalBounds.hi))cellReasons.push('Listed snapshot lies outside the supplied interval.');
  if(p.claimId==='capint-029'&&year==='1930')cellReasons.push('Existing legacy capital Galle Face, Colombo (legislative building) begins 1930-01-29; literal capital conflict guard prevents automatic integration for 1930.');
  cellDecisions.push({cellId:id,before:b.current_status,mappingValid:mapped,status:'held',reasons:cellReasons});
 }
 const sourceReview=reviews[p.claimId];assert.ok(sourceReview);
 if(!sourceReview.sourceApproved)reasons.push(sourceReview.rationale);
 if(p.temporal.certainty!=='exact')reasons.push('Supplied certainty '+p.temporal.certainty+' does not satisfy automatic exact-chronology acceptance; certainty was not rewritten.');
 if(!p.temporal.until&&!sourceReview.sourceApproved)reasons.push('Open-ended applicability is not established by the supplied source body; no continuity/end date invented.');
 let converted=null;
 if(!reasons.length){
  const [from,until]=bounds[p.claimId], period={from,until}, target=cellDecisions.filter(c=>!c.reasons.length);
  const ctx=readContext(root), fp=fingerprint(root), id='external-capital-interval-wave-01-'+p.claimId;
  const job={id:id+'-job',entityId:p.atlasEntityId,period,mapIds:[...new Set(target.map(c=>cells.get(c.cellId).occurrence_id.split('@')[0]))],productionFingerprint:fp};
  const store=readJSON('data/comprehensive-dossiers.json'), known=[...ctx.registry.sources,...store.packages.flatMap(x=>x.sources)];
  const byURL=new Map(known.map(s=>[s.url,s])), remap=new Map(), sources=[];
  for(const s of p.sources){const source=byURL.get(s.url)||{id:s.id,title:s.title,institution:s.institution,url:s.url,accessed:'2026-10-04',kind:'external-research-return',usage:'Supplied interval wave; independent original-source-body review, no source discovery.'};remap.set(s.id,source.id);sources.push(source);}
  const temporal={kind:'interval',from,until,certainty:'exact'};
  const qualifications=[p.evidenceNote,sourceReview.rationale,p.mappingRationale,'Original supplied temporal contract: '+JSON.stringify(p.temporal),'Bounded research subset '+from+'–'+until+'; these are coverage bounds, not asserted historical capital-change dates. Original full interval retained in supplied-package.json.',...p.sources.map(s=>'Original source identifier/version: '+s.id+' / '+s.version)];
  if(p.claimId==='capint-028')qualifications.push('Official Palmerston naming is distinguished from contemporary colloquial Port Darwin usage documented in the supplied place-name record; modern Palmerston is not the historical capital site.');
  const claim={id,category:'capital',value:p.value,entityId:p.atlasEntityId,temporal,scope:{id:p.atlasEntityId+'-external-capital-scope',description:'Central capital/administrative seat of the existing mapped historical administration; no polygon-derived sovereignty or statistical scope inference.',relationship:'same'},sourceIds:p.sourceIds.map(s=>remap.get(s)),evidence:p.sourceIds.map(s=>({sourceId:remap.get(s),locator:p.sources.find(x=>x.id===s).url,note:sourceReview.rationale,precision:p.temporal.evidencePrecision,temporal:sourceReview.sourceEvidenceTemporal,interpretation:'direct'})),status:'supported',risks:[],qualifications,origin:{kind:'preserved-package',reference:out+'/supplied-package.json',sourceIdentifier:p.claimId,temporalBasis:'bounded-research-subset'}};
  const pkg={schemaVersion:2,id,jobId:job.id,entityId:job.entityId,mapIds:job.mapIds,worker:{id:p.researcher,assignmentType:'comprehensive-entity-period'},productionFingerprint:fp,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period,claims:[claim],sources,investigation:fields.map(category=>({category,status:category==='capital'?'partial':'unresolved',rationale:category==='capital'?'Supplied historical capital interval only; exact original-source review recorded.':'Outside supplied assignment; no historical research performed.',consultedSourceIds:category==='capital'?sources.map(s=>s.id):[],gaps:[]})),conflicts:[],provenance:{createdAt:'2026-10-04',method:'Independent review of supplied URLs only; one interval per original proposal, bounded to validated existing framework and non-conflicting period.',preservedPackageHashes:[digest(supplied),digest(reviews)]}};
  const validation=validateDossier(pkg,job,ctx);reasons.push(...validation.errors.map(x=>'Validator: '+x));
  if(target.some(c=>!c.mappingValid))reasons.push('Unresolved target mapping');
  let review={reviewer:'Codex interval-wave independent source-body reviewer',packageHash:digest(pkg),bodyReviewed:true,rationale:sourceReview.rationale+' Exact converted package reviewed against supplied original source bodies; source-review.json and claim-source-review.json preserve review. No identity changes or replacement research.',reviewedIssues:validation.review,decisions:{[id]:reasons.length?'held':'accepted'}}, receipt=null,integration=null;
  if(validation.valid){try{receipt=acceptDossier(pkg,job,ctx,review);if(!reasons.length){integrateDossier(pkg,job,ctx,receipt,{apply:false});if(apply)integration=integrateDossier(pkg,job,ctx,receipt,{apply:true});for(const c of target)c.status=apply?'integrated':'accepted';}}catch(e){reasons.push('Acceptance/integration guard: '+e.message);review.decisions[id]='held';receipt=acceptDossier(pkg,job,ctx,review);}}
  converted={job,package:pkg,validation,review,receipt,integration:integration?{applied:integration.applied,acceptedClaims:integration.acceptedClaims}:null};results.push(converted);
 }
 for(const c of cellDecisions)if(c.status==='held')c.reasons.push(...reasons);
 const integrated=cellDecisions.filter(c=>c.status==='integrated').length;
 dispositions.push({claimId:p.claimId,status:integrated?(integrated===cellDecisions.length?'integrated':'partially-integrated'):'held',reasons,sourceReview,originalTemporal:p.temporal,cells:cellDecisions});
 saveJSON(out+'/validation.json',{requiredProductionFingerprint:supplied.metadata.requiredProductionFingerprint,originalInputHash:digest(supplied),applied:apply,baselineStatuses:Object.fromEntries([...seen].map(id=>[id,cells.get(id).current_status])),dispositions,results});
 console.log(JSON.stringify({claimId:p.claimId,status:dispositions.at(-1).status,integratedCells:integrated,reasons}));
}
assert.equal(seen.size,140);assert.equal(dispositions.length,29);
const after=readJSON('data/comprehensive-dossiers.json');for(const p of before.packages)assert.deepEqual(after.packages.find(x=>x.id===p.id),p,'Existing accepted package mutated');
console.log(JSON.stringify({newIntervalClaims:after.packages.flatMap(p=>p.claims).length-before.packages.flatMap(p=>p.claims).length,integratedCells:dispositions.flatMap(d=>d.cells).filter(c=>c.status==='integrated').length,heldCells:dispositions.flatMap(d=>d.cells).filter(c=>c.status==='held').length}));
