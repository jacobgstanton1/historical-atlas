// V2-only intake and serial integration. No source discovery or schema relaxation.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {readContext,readJSON,saveJSON,digest} from './research-common.mjs';
import {fields,fingerprint,validateDossier,acceptDossier,integrateDossier,temporalBounds} from './research-comprehensive.mjs';
const root=process.cwd(),out='research/external-capital-a-v2-2026-10-03';
const expected='851acb012ccfa2a4bfa05ea83ec2694b3f773a7a6fee8703e87969c9225e6997';
export function parseCSV(text){let quoted=false,row=[],value='',rows=[];for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(value);value='';}else if(c==='\n'&&!quoted){row.push(value.replace(/\r$/,''));rows.push(row);row=[];value='';}else value+=c;}if(value||row.length){row.push(value);rows.push(row);}assert.ok(!quoted);const header=rows.shift();header[0]=header[0].replace(/^\uFEFF/,'');return{header,rows:rows.map(r=>{assert.equal(r.length,header.length);return Object.fromEntries(header.map((k,i)=>[k,r[i]]));})};}
export function csv(table){return [table.header,...table.rows.map(r=>table.header.map(k=>r[k]))].map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename)){
const apply=process.argv.includes('--apply'),attachments='C:/Users/jacob/Downloads';
const files={metadata:'capital-A-chatgpt-2026-10-03-package-v2.json',sidecar:'capital-A-chatgpt-2026-10-03-proposals-v2.csv',instructions:'capital-A-chatgpt-2026-10-03-INTEGRATION-v2.txt'};
const supplied=readJSON(path.join(attachments,files.metadata)),sidecar=parseCSV(fs.readFileSync(path.join(attachments,files.sidecar),'utf8'));
const basePath='exports/dossier-workload/research-batches/capital-A.csv',baseBytes=fs.readFileSync(basePath),base=parseCSV(baseBytes.toString('utf8'));
const pristine=parseCSV(fs.readFileSync('research/external-capital-a-2026-10-03/baseline-before.csv','utf8'));
assert.equal(readContext(root).productionFingerprint,expected);assert.equal(supplied.productionFingerprint,expected);assert.equal(base.rows.length,160);
for(let i=0;i<base.rows.length;i++)for(const key of base.header)if(key!=='proposals_json')assert.equal(base.rows[i][key],pristine.rows[i][key],'Immutable baseline '+key);
const byCell=new Map(base.rows.map(r=>[r.cell_id,r])),proposalIndex=new Map(supplied.proposalRows.map(r=>[r.cell_id,r.proposals])),seen=new Set();
for(const row of sidecar.rows){assert.ok(byCell.has(row.cell_id));assert.ok(!seen.has(row.cell_id));seen.add(row.cell_id);assert.equal(row.production_fingerprint,expected);assert.deepEqual(JSON.parse(row.proposals_json),proposalIndex.get(row.cell_id));const b=byCell.get(row.cell_id);assert.equal(b.identity_review_required,'false');for(const p of proposalIndex.get(row.cell_id)){assert.equal(p.atlasEntityId,b.atlas_entity_id);assert.equal(p.category,'capital');assert.deepEqual(p.applicableSnapshotIds,[b.occurrence_id]);assert.equal(p.temporal.certainty,'exact');}b.proposals_json=row.proposals_json;}
assert.equal(sidecar.rows.length,102);assert.equal(seen.size,proposalIndex.size);
for(const id of supplied.identityBlockedRowsLeftUntouched)assert.equal(byCell.get(id).proposals_json,'');for(const row of supplied.mappedEdgeCasesLeftBlank)assert.equal(byCell.get(row.cell_id).proposals_json,'');
fs.writeFileSync(out+'/baseline-before-v2.csv',baseBytes);fs.writeFileSync(out+'/baseline-merged-v2.csv',csv(base));
for(const [key,file]of Object.entries(files))fs.copyFileSync(path.join(attachments,file),out+'/'+({metadata:'supplied-package-v2.json',sidecar:'supplied-proposals-v2.csv',instructions:'INTEGRATION-v2.txt'}[key]));
const reviews=readJSON(out+'/source-review.json'),sourceReviews=new Map(reviews.map(r=>[r.url,r])),dispositions=[],results=[];
const before=readJSON('data/comprehensive-dossiers.json');saveJSON(out+'/before-summary.json',readJSON('exports/dossier-workload/summary.json'));
const baselineStatuses=Object.fromEntries(base.rows.map(r=>[r.cell_id,r.current_status]));
for(const row of supplied.proposalRows){
 const context=readContext(root),completeFP=fingerprint(root),b=byCell.get(row.cell_id),id='external-capital-a-v2-'+digest(row.cell_id).slice(0,16);
 const period={from:row.proposals[0].temporal.from,until:row.proposals.at(-1).temporal.until};
 const job={id:id+'-job',entityId:b.atlas_entity_id,period,mapIds:[b.occurrence_id.split('@')[0]],productionFingerprint:completeFP};
 const store=readJSON('data/comprehensive-dossiers.json'),allSources=[...context.registry.sources,...store.packages.flatMap(p=>p.sources)],urls=new Map(allSources.map(s=>[s.url,s]));
 const packageSources=new Map();
 const claims=row.proposals.map((p,i)=>{
  const remap=new Map();for(const s of p.sources){const source=urls.get(s.url)||{id:s.id,title:s.title,institution:s.institution,url:s.url,accessed:supplied.researchDate,kind:'external-research-return',usage:'Supplied Capital-A V2 research; independent source review retained with acceptance receipt.'};remap.set(s.id,source.id);packageSources.set(source.id,source);}
  return{id:id+'-'+i,category:'capital',value:p.value,entityId:p.atlasEntityId,temporal:structuredClone(p.temporal),scope:{id:p.atlasEntityId+'-external-capital-scope',description:p.geographicScope.description+' Classification: '+p.geographicScope.classification,relationship:p.geographicScope.classification==='direct historical match'?'same':'uncertain'},sourceIds:p.sourceIds.map(s=>remap.get(s)),evidence:p.sourceIds.map(s=>({sourceId:remap.get(s),locator:p.sources.find(x=>x.id===s).url,note:p.evidenceNote,precision:p.evidencePrecision,temporal:structuredClone(p.temporal),interpretation:'direct'})),status:'supported',risks:[],qualifications:[p.evidenceNote,p.mappingRationale,p.reviewNotes,'Evidence precision: '+p.evidencePrecision,'Original endpoint contract: '+p.endpointContract,...p.sources.map(s=>'Source version/identifier: '+s.id+' / '+s.version+' / '+(s.originalIdentifier??'not supplied'))],origin:{kind:'preserved-package',reference:out+'/supplied-package-v2.json',sourceIdentifier:row.cell_id,temporalBasis:'bounded-research-subset'}};
 });
 const pkg={schemaVersion:2,id,jobId:job.id,entityId:job.entityId,mapIds:job.mapIds,worker:{id:supplied.researcher,assignmentType:'comprehensive-entity-period'},productionFingerprint:completeFP,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period,claims,sources:[...packageSources.values()],investigation:fields.map(category=>({category,status:category==='capital'?'partial':'unresolved',rationale:category==='capital'?'Bounded external Capital-A V2 proposals; exact source-body dispositions retained.':'Outside supplied assignment; no new research performed.',consultedSourceIds:category==='capital'?[...packageSources.keys()]:[],gaps:[]})),conflicts:[],provenance:{createdAt:supplied.researchDate,method:'Exact V2 cell_id join; original dates retained; independent review of supplied URLs only.',preservedPackageHashes:[digest(supplied),digest(reviews)]}};
 const validation=validateDossier(pkg,job,context),decisions={};
 const items=claims.map((claim,i)=>{
  const p=row.proposals[i],reasons=[];const sourceChecks=p.sources.map(s=>({url:s.url,review:sourceReviews.get(s.url)}));
  for(const {url,review}of sourceChecks)if(!review?.bodyReviewed||!review.supportedCellIds.includes(row.cell_id))reasons.push('Source-body support insufficient: '+url+' — '+(review?.rationale||'No review'));
  const bounds=temporalBounds(claim.temporal);const mapping=context.db.mappings.some(m=>{if(m.mapId!==job.mapIds[0]||m.entityId!==job.entityId)return false;try{const mb=temporalBounds({kind:'interval',from:m.validFrom||period.from,until:m.validUntil||period.until});return mb.lo<=bounds.lo&&mb.hi>=bounds.hi;}catch{return false;}});
  if(!mapping)reasons.push('Snapshot/date-specific mapping does not cover the complete supplied claim interval.');
  if(claim.scope.relationship!=='same')reasons.push('Qualified partial control/scope requires unresolved historical review.');
  for(const e of validation.errors)reasons.push('Validator: '+e);
  const conflicts=validation.review.filter(x=>x.startsWith('Conflicting')&&x.includes(claim.id));reasons.push(...conflicts);
  for(const old of store.packages.flatMap(p=>p.claims).filter(c=>c.entityId===claim.entityId&&c.category==='capital')){const ob=temporalBounds(old.temporal);if(bounds.lo<ob.hi&&ob.lo<bounds.hi&&digest(old.value)!==digest(claim.value))reasons.push('Existing sourced capital overlaps with a different value: '+old.id);}
  const status=reasons.length?'held':'accepted';decisions[claim.id]=status;return{cell_id:row.cell_id,claimId:claim.id,status,reasons,mappingValid:mapping,conflicts:reasons.filter(r=>/Conflicting|different value/.test(r)),sourceUrls:p.sources.map(s=>s.url)};
 });
 const review={reviewer:'Codex Capital-A V2 independent source-body reviewer',packageHash:digest(pkg),bodyReviewed:true,rationale:'Independently reviewed this exact converted V2 package against the supplied original source bodies. Each claim has an explicit disposition; inaccessible, chronology-insufficient, scope, mapping and conflict cases remain held. Source review manifest '+digest(reviews)+'. No discovery or new historical sources.',reviewedIssues:validation.review,decisions};
 let receipt=null,integration=null;
 if(validation.valid){receipt=acceptDossier(pkg,job,context,review);if(receipt.acceptedClaimIds.length){try{integration=integrateDossier(pkg,job,context,receipt,{apply:false});}catch(error){for(const item of items.filter(x=>x.status==='accepted')){item.status='held';item.reasons.push('Integrator: '+error.message);decisions[item.claimId]='held';}receipt=acceptDossier(pkg,job,context,review);integration=null;}if(apply&&integration){integration=integrateDossier(pkg,job,context,receipt,{apply:true});console.log(JSON.stringify({cell:row.cell_id,integrated:integration.acceptedClaims}));}}}
 dispositions.push(...items);results.push({job,package:pkg,validation,review,receipt,integration:integration?{applied:integration.applied,acceptedClaims:integration.acceptedClaims}:null});
 saveJSON(out+'/validation.json',{baselineFingerprint:expected,suppliedRows:102,suppliedClaims:103,immutableFieldsUnchanged:true,baselineStatuses,dispositions,results,applied:apply});
}
assert.equal(dispositions.length,103);
const after=readJSON('data/comprehensive-dossiers.json');for(const p of before.packages)assert.deepEqual(after.packages.find(x=>x.id===p.id),p,'Existing accepted package changed');
const counts=Object.fromEntries(['accepted','held','rejected'].map(k=>[k,dispositions.filter(d=>d.status===k).length]));
console.log(JSON.stringify({suppliedRows:102,suppliedClaims:103,...counts,mappingFailures:dispositions.filter(d=>!d.mappingValid).length,conflicts:dispositions.filter(d=>d.conflicts.length).length,productionClaimsBefore:before.packages.flatMap(p=>p.claims).length,productionClaimsAfter:after.packages.flatMap(p=>p.claims).length,apply}));
}
