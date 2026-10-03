// Mechanical external-return intake only. Never acquires evidence or infers certainty.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {readContext,readJSON,saveJSON,digest} from './research-common.mjs';
import {fields,fingerprint,validateDossier,temporalBounds,dateBounds} from './research-comprehensive.mjs';
const expected='851acb012ccfa2a4bfa05ea83ec2694b3f773a7a6fee8703e87969c9225e6997';
const directory=process.cwd(),attachments=process.argv[2];
assert.ok(attachments,'Attachment directory required');
const out='research/external-capital-a-2026-10-03';
fs.mkdirSync(out,{recursive:true});
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function parse(text){const rows=[];let row=[],start=0,quoted=false;const field=end=>{let v=text.slice(start,end);return v.startsWith('"')&&v.endsWith('"')?v.slice(1,-1).replaceAll('""','"'):v;};for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"')i++;else quoted=!quoted;}else if(c===','&&!quoted){row.push(field(i));start=i+1;}else if(c==='\n'&&!quoted){row.push(field(text[i-1]==='\r'?i-1:i));rows.push(row);row=[];start=i+1;}}if(start<text.length){row.push(field(text.length));rows.push(row);}assert.equal(quoted,false);const header=rows.shift();header[0]=header[0].replace(/^\uFEFF/,'');return{header,rows:rows.map(r=>{assert.equal(r.length,header.length);return Object.fromEntries(header.map((k,i)=>[k,r[i]]));})};}
const encode=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const serialize=table=>[table.header,...table.rows.map(r=>table.header.map(k=>r[k]))].map(r=>r.map(encode).join(',')).join('\r\n')+'\r\n';
const files={instructions:'1-capital-A-chatgpt-2026-10-03-INTEGRATION.txt',sidecar:'2-capital-A-chatgpt-2026-10-03-proposals.csv',metadata:'3-capital-A-chatgpt-2026-10-03-package.json'};
const supplied=readJSON(path.join(attachments,files.metadata)),sidecar=parse(fs.readFileSync(path.join(attachments,files.sidecar),'utf8'));
const baselinePath='exports/dossier-workload/research-batches/capital-A.csv',beforeBytes=fs.readFileSync(baselinePath),baseline=parse(beforeBytes.toString('utf8'));
const context=readContext(directory),productionBefore=sha('data/comprehensive-dossiers.json');
assert.equal(context.productionFingerprint,expected,'Stale production fingerprint');assert.equal(supplied.productionFingerprint,expected);
assert.equal(baseline.rows.length,supplied.batchRowCount);for(const r of baseline.rows)assert.equal(r.production_fingerprint,expected);
const index=new Map(baseline.rows.map(r=>[r.cell_id,r]));assert.equal(index.size,baseline.rows.length);
const seen=new Set(),proposalIndex=new Map(supplied.proposalRows.map(r=>[r.cell_id,r.proposals]));
for(const row of sidecar.rows){assert.ok(index.has(row.cell_id),'Unknown immutable cell ID');assert.ok(!seen.has(row.cell_id),'Duplicate sidecar cell');seen.add(row.cell_id);assert.equal(row.production_fingerprint,expected);const proposals=JSON.parse(row.proposals_json);assert.deepEqual(proposals,proposalIndex.get(row.cell_id));const target=index.get(row.cell_id);assert.equal(target.proposals_json,'');assert.equal(target.identity_review_required,'false');for(const p of proposals){assert.equal(p.atlasEntityId,target.atlas_entity_id);assert.equal(p.category,'capital');assert.deepEqual(p.applicableSnapshotIds,[target.occurrence_id]);}target.proposals_json=row.proposals_json;}
assert.equal(sidecar.rows.length,supplied.proposalRowCount);assert.equal(seen.size,proposalIndex.size);
for(const id of supplied.identityBlockedRowsLeftUntouched)assert.equal(index.get(id)?.proposals_json,'');for(const r of supplied.mappedEdgeCasesLeftBlank)assert.equal(index.get(r.cell_id)?.proposals_json,'');
const original=parse(beforeBytes.toString('utf8'));for(let i=0;i<baseline.rows.length;i++)for(const k of baseline.header)if(k!=='proposals_json')assert.equal(baseline.rows[i][k],original.rows[i][k]);
const store=readJSON('data/comprehensive-dossiers.json'),sources=new Map([...context.registry.sources,...store.packages.flatMap(p=>p.sources)].map(s=>[s.id,s])),urlIndex=new Map([...sources.values()].map(s=>[s.url,s]));
const currentCompleteFingerprint=fingerprint(directory);
const packages=[],dispositions=[];
for(const row of supplied.proposalRows){const target=index.get(row.cell_id),year=target.snapshot_year,period={from:year+'-01-01',until:String(Number(year)+1)+'-01-01'};
 const id='external-capital-a-'+digest(row.cell_id).slice(0,16),job={id:id+'-job',entityId:target.atlas_entity_id,period,mapIds:[target.occurrence_id.split('@')[0]],productionFingerprint:currentCompleteFingerprint};
 const packageSources=new Map();
 const claims=row.proposals.map((p,i)=>{
  const sourceRemap=new Map();for(const s of p.sources){const reused=sources.get(s.id)||urlIndex.get(s.url);const normalized=reused||{id:s.id,title:s.title,institution:s.institution,url:s.url,accessed:supplied.researchDate,kind:'external-research-return',usage:'Unreviewed external source attribution; supplied research, not independently certified.'};sourceRemap.set(s.id,normalized.id);packageSources.set(normalized.id,normalized);}
  return{id:id+'-'+i,category:p.category,value:p.value,entityId:p.atlasEntityId,temporal:structuredClone(p.temporal),scope:{id:p.atlasEntityId+'-external-capital-scope',description:p.geographicScope.description+' Classification: '+p.geographicScope.classification,relationship:p.geographicScope.classification==='direct historical match'?'same':'uncertain'},sourceIds:p.sourceIds.map(s=>sourceRemap.get(s)),evidence:p.sourceIds.map(s=>({sourceId:sourceRemap.get(s),locator:p.sources.find(x=>x.id===s).url,note:p.evidenceNote,precision:p.temporal.certainty==='year-precision'?'year':'day',temporal:structuredClone(p.temporal),interpretation:'direct'})),status:'unresolved',risks:['independent-source-review-missing'],qualifications:[p.evidenceNote,p.mappingRationale,p.reviewNotes,'Original temporal precision: '+p.temporal.certainty],origin:{kind:'preserved-package',reference:out+'/supplied-package.json',sourceIdentifier:row.cell_id}};
 });
 const pkg={schemaVersion:2,id,jobId:job.id,entityId:target.atlas_entity_id,mapIds:job.mapIds,worker:{id:supplied.researcher,assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period,claims,sources:[...packageSources.values()],investigation:fields.map(category=>({category,status:category==='capital'?'partial':'unresolved',rationale:category==='capital'?'External proposed capital; schema and independent review pending.':'Outside supplied Capital-A assignment; not researched.',consultedSourceIds:[],gaps:[]})),conflicts:[],provenance:{createdAt:supplied.researchDate,method:'Exact cell_id mechanical intake; no historical research; precision labels retained unchanged.',preservedPackageHashes:[digest(supplied)]}};
 const validation=validateDossier(pkg,job,context);
 // Schema failure does not exempt candidates from the remaining mechanical audits.
 for(let i=0;i<claims.length;i++){
  const claim=claims[i],proposal=row.proposals[i],reasons=['No independent exact-package/original-source body review certificate supplied.','Supplied '+proposal.temporal.certainty+' is precision, not an allowed certainty enum; no certainty inferred.'];
  const checks={sourceProvenance:proposal.sources.every(s=>s.id&&s.title&&s.institution&&/^https:\/\//.test(s.url))&&proposal.sourceIds.every(id=>proposal.sources.some(s=>s.id===id)),immutableEntity:proposal.atlasEntityId===target.atlas_entity_id,knownEntity:context.db.entities.some(e=>e.id===proposal.atlasEntityId),schemaValid:validation.valid,independentReview:false};
  try{const b=temporalBounds(proposal.temporal),research=temporalBounds({...period,kind:'interval'});checks.chronology=b.lo>=research.lo&&b.hi<=research.hi;checks.snapshotMapping=context.db.mappings.some(m=>m.mapId===job.mapIds[0]&&m.entityId===job.entityId&&temporalBounds({kind:'interval',from:m.validFrom||period.from,until:m.validUntil||period.until}).lo<=b.lo&&temporalBounds({kind:'interval',from:m.validFrom||period.from,until:m.validUntil||period.until}).hi>=b.hi);const rank={year:1,month:2,day:3};checks.sourcePrecision=Math.max(rank[dateBounds(proposal.temporal.from).precision],rank[dateBounds(proposal.temporal.until).precision])<=(proposal.temporal.certainty==='year-precision'?1:3);if(!checks.sourcePrecision)reasons.push('Year-precision evidence supplied with day-precision interval endpoints.');
   const existing=[...store.packages.filter(p=>p.entityId===job.entityId).flatMap(p=>p.claims.filter(c=>c.category==='capital')),...(context.db.entities.find(e=>e.id===job.entityId)?.capitals||[]).map(c=>({...c,temporal:{kind:'interval',from:c.validFrom,until:c.validUntil}}))];
   checks.conflicts=[];for(const old of existing)try{const oldBounds=temporalBounds(old.temporal);if(b.lo<oldBounds.hi&&oldBounds.lo<b.hi&&digest(old.value)!==digest(claim.value))checks.conflicts.push(old.id||'legacy-capital');}catch{}
   if(checks.conflicts.length)reasons.push('Overlapping existing capital values differ; conflicts not automatically reconciled.');
  }catch(error){checks.chronology=false;reasons.push(error.message);}
  if(proposal.geographicScope.classification!=='direct historical match')reasons.push('Qualified partial political/territorial control requires explicit scope review.');
  reasons.push('Supplied day endpoints have no explicit inclusive/exclusive contract; repository day until is exclusive. Dates preserved, not extended.');
  for(const [label,value]of Object.entries(checks))if(value===false&&!['schemaValid','independentReview','sourcePrecision'].includes(label))reasons.push('Failed '+label);
  dispositions.push({cell_id:row.cell_id,claimId:claim.id,status:'held',checks,reasons,originalProposal:proposal});
 }
 packages.push({job,package:pkg,validation});
}
assert.equal(dispositions.length,supplied.proposalObjectCount);assert.equal(dispositions.filter(c=>c.status==='accepted').length,0);
saveJSON(out+'/validation.json',{baselineFingerprint:expected,currentProductionFingerprint:context.productionFingerprint,baselineRows:baseline.rows.length,suppliedRows:sidecar.rows.length,suppliedClaims:dispositions.length,acceptedClaims:0,heldClaims:dispositions.length,immutableFieldsUnchanged:true,intentionallyUntouched:{identityBlocked:supplied.identityBlockedRowsLeftUntouched.length,mappedEdge:supplied.mappedEdgeCasesLeftBlank.length},dispositions,packages});
fs.writeFileSync(out+'/baseline-before.csv',beforeBytes);fs.writeFileSync(baselinePath,serialize(baseline));
for(const [k,name]of Object.entries(files))fs.copyFileSync(path.join(attachments,name),out+'/'+({instructions:'INTEGRATION.txt',sidecar:'supplied-proposals.csv',metadata:'supplied-package.json'}[k]));
const batchIndex=readJSON('exports/dossier-workload/research-batches/index.json'),entry=batchIndex.files.find(f=>f.file==='capital-A.csv');entry.sha256=sha(baselinePath);entry.file_size_bytes=fs.statSync(baselinePath).size;saveJSON('exports/dossier-workload/research-batches/index.json',batchIndex);
assert.equal(sha('data/comprehensive-dossiers.json'),productionBefore,'Production mutated');assert.equal(readContext(directory).productionFingerprint,expected);
console.log(JSON.stringify({suppliedRows:sidecar.rows.length,suppliedClaims:dispositions.length,accepted:0,held:dispositions.length,immutableFieldsUnchanged:true,productionUnchanged:true}));
