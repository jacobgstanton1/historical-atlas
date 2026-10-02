import fs from 'node:fs';
import {readJSON,saveJSON} from './research-common.mjs';
const matrix=readJSON(process.argv[2]||'research/completion-01/reports/completion.json');
const output=process.argv[3]||'research/regional-01';
fs.mkdirSync(output,{recursive:true});
const batches=[];
for(let n=1;n<=21;n++){
 const tag=String(n).padStart(2,'0'), old=readJSON(`development/coverage/research-batch-${tag}.json`);
 const ids=new Set(old.rawMapIdentities||[]), rows=matrix.rows.filter(r=>r.mapIds.some(id=>ids.has(id)));
 const states={},categories={},sourceEntities=new Map();
 for(const row of rows)for(const [category,cell]of Object.entries(row.categories)){
  states[cell.status]=(states[cell.status]||0)+1;
  categories[category]??={};categories[category][cell.status]=(categories[category][cell.status]||0)+1;
  for(const recordId of cell.records||[])for(const sourceId of matrix.records?.[recordId]?.sourceIds||[]){
   if(sourceId==='basemaps'||category==='area-statistics')continue; // Geometry is not independent historical evidence.
   const entities=sourceEntities.get(sourceId)||new Set();entities.add(row.entityId);sourceEntities.set(sourceId,entities);
  }
 }
 const title=fs.readFileSync(`development/coverage/BATCH-${tag}.md`,'utf8').split('\n')[0].replace(/^#\s*/, '').trim();
 const unresolved=rows.reduce((sum,r)=>sum+Object.values(r.categories).filter(c=>['missing','partial','held'].includes(c.status)).length,0);
 batches.push({batch:tag,title,entities:[...new Set(rows.map(r=>r.entityId))],dossiers:rows.length,unresolved,states,categories,criticallySparse:rows.filter(r=>r.criticallySparse).length,
  sourceReuseOpportunity:{existingSources:sourceEntities.size,sharedEntitySources:[...sourceEntities].filter(([,entities])=>entities.size>1).map(([sourceId,entities])=>({sourceId,entities:[...entities].sort()})),interpretation:'Existing citations identify source-packet reuse opportunities, not guaranteed new evidence. Future yield/credit cost remains unmeasured until source review.'},
  needs:rows.map(r=>({entityId:r.entityId,name:r.name,snapshot:r.snapshotYear,mapIds:r.mapIds,categories:Object.fromEntries(Object.entries(r.categories).filter(([,c])=>['missing','partial','held'].includes(c.status)).map(([k,c])=>[k,c.status]))}))});
}
// Deterministic opportunity proxy, not a claim of measured future research yield.
batches.sort((a,b)=>b.unresolved-a.unresolved||b.sourceReuseOpportunity.sharedEntitySources.length-a.sourceReuseOpportunity.sharedEntitySources.length||a.entities.length-b.entities.length||a.batch.localeCompare(b.batch));
const membership=new Map();for(const batch of batches)for(const row of batch.needs){const key=row.entityId+'|'+row.snapshot;membership.set(key,[...(membership.get(key)||[]),batch.batch]);}
saveJSON(output+'/workload.json',{baseline:matrix.productionFingerprint,metrics:matrix.metrics,rankingPolicy:'Unresolved volume first; shared-source reuse then entity-review burden break ties. Source review must confirm expected yield; no fabricated credit estimates.',cohortOverlap:{uniqueAssignedDossiers:membership.size,multipleCohortDossiers:[...membership].filter(([,ids])=>ids.length>1).map(([dossier,batches])=>({dossier,batches})),unassignedDossiers:matrix.rows.filter(r=>!membership.has(r.entityId+'|'+r.snapshotYear)).map(r=>({entityId:r.entityId,snapshot:r.snapshotYear}))},batches});
fs.writeFileSync(output+'/WORKLOAD.md','# Regional completion workload\n\nCurrent gaps only; supported categories excluded. Ranking is an unresolved-volume proxy, subject to source reuse and effort review.\n\n| Batch | Cohort | Entities | Dossiers | Unresolved | Partial | Held | Sparse |\n|---|---|---:|---:|---:|---:|---:|---:|\n'+batches.map(b=>`| ${b.batch} | ${b.title} | ${b.entities.length} | ${b.dossiers} | ${b.unresolved} | ${b.states.partial||0} | ${b.states.held||0} | ${b.criticallySparse} |`).join('\n')+'\n');
console.log(JSON.stringify(batches.map(({batch,title,entities,dossiers,unresolved,sourceReuseOpportunity})=>({batch,title,entities:entities.length,dossiers,unresolved,sharedSources:sourceReuseOpportunity.sharedEntitySources.length})),null,2));
