import fs from 'node:fs';
import {readContext,readJSON,saveJSON,digest} from '../../../../scripts/research-common.mjs';
import {fields,generateDossierJob,validateDossier} from '../../../../scripts/research-comprehensive.mjs';
export const context=readContext();
export const interval=(from,until)=>({kind:'interval',from,until,certainty:'exact'});
export const event=date=>({kind:'event',date,certainty:'exact'});
export const observation=observationDate=>({kind:'observation',observationDate,certainty:'exact'});
export function create(sequence){
 const selected=readJSON('research/comprehensive/pilot-selection.json').assignments.find(a=>a.sequence===sequence);
 const job=generateDossierJob(selected.entityId,selected.period,context);
 const preserved=readJSON('research/campaign-02/packages/'+selected.entityId+'.json');
 const pkg={schemaVersion:2,id:'comprehensive-pilot-'+selected.entityId,jobId:job.id,entityId:job.entityId,mapIds:job.mapIds,worker:{id:'campaign-design',assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period:job.period,claims:[],sources:[],investigation:[],conflicts:[],provenance:{createdAt:'2026-10-01',method:'Single bounded entity/period pass: production and preserved evidence reuse first; institutional full-source-body research; no automatic candidate acceptance.',preservedPackageHashes:[digest(preserved)]}};
 const notes=[];
 const source=(id,title,institution,url,usage,kind='institutional-historical')=>{
  const existing=context.registry.sources.find(s=>s.url===url||s.id===id);
  if(existing)return existing.id;
  if(!pkg.sources.some(s=>s.id===id))pkg.sources.push({id,title,institution,url,accessed:'2026-10-01',usage,kind});return id;
 };
 const claim=(key,category,value,temporal,sourceId,locator,note,extra={})=>{
  const precision=temporal.kind==='interval'?(temporal.from.length===10||temporal.until.length===10?'day':temporal.from.length===7||temporal.until.length===7?'month':'year'):(temporal.observationDate||temporal.date).length===10?'day':(temporal.observationDate||temporal.date).length===7?'month':'year';
  const c={id:'cp-'+selected.entityId+'-'+key,category,value,entityId:pkg.entityId,temporal,scope:{id:pkg.entityId+'-institutional',description:'Historical entity institutions and associated activity; no polygon-derived territorial claims.',relationship:'same'},sourceIds:[sourceId],evidence:[{sourceId,locator,note,precision,temporal:structuredClone(temporal),interpretation:'direct'}],status:'supported',risks:[],qualifications:[],origin:{kind:'new-research',reference:sourceId},...extra};pkg.claims.push(c);return c;
 };
 const reuse=(old,temporal,origin='preserved-package')=>{
  for(const s of preserved.sources.filter(s=>old.sourceIds.includes(s.id)))source(s.id,s.title,s.institution,s.url,s.usage,s.kind);
  return claim('reuse-'+old.id,old.category,old.value,temporal,old.sourceIds[0],old.evidence[0].locator||'Preserved full-body evidence ledger',old.evidence[0].note,{sourceIds:[...old.sourceIds],evidence:old.evidence.map(e=>({sourceId:e.sourceId,locator:e.locator||'Preserved full-body evidence ledger',note:e.note,precision:e.precision||'year',temporal:structuredClone(temporal),interpretation:'direct'})),origin:{kind:origin,reference:origin==='production-reuse'?'data/historical-entities.json#'+pkg.entityId:'research/campaign-02/packages/'+pkg.entityId+'.json'},qualifications:['Evidence retained from earlier work; excluded from new-information throughput.'],...(old.role?{role:old.role}:{}),...(old.metric?{metric:old.metric}:{}),...(old.flag?{flag:old.flag}:{})});
 };
 const investigate=(category,status,rationale,consultedSourceIds,gaps=[])=>pkg.investigation.push({category,status,rationale,consultedSourceIds:[...new Set(consultedSourceIds)],gaps});
 const save=()=>{
  if(pkg.investigation.length!==fields.length)throw Error('All14 category dispositions required');
  saveJSON('research/comprehensive/pilot/jobs/'+pkg.entityId+'.json',job);
  saveJSON('research/comprehensive/pilot/packages/'+pkg.entityId+'.json',pkg);
  const validation=validateDossier(pkg,job,context);saveJSON('research/comprehensive/pilot/evidence/'+pkg.entityId+'-validation.json',validation);
  saveJSON('research/comprehensive/pilot/evidence/'+pkg.entityId+'.json',{schemaVersion:1,entityId:pkg.entityId,packageHash:digest(pkg),sourceBodyNotes:notes,categoryInvestigation:pkg.investigation,researchPasses:1,externalResearchScope:'Bounded four-entity pilot; no global campaign',productionEdited:false});
  console.log(JSON.stringify({entityId:pkg.entityId,claims:pkg.claims.length,newClaims:pkg.claims.filter(c=>c.origin.kind==='new-research').length,valid:validation.valid,errors:validation.errors,review:validation.review}));
 };return{pkg,job,preserved,notes,source,claim,reuse,investigate,save};
}
