import fs from 'node:fs';
import {readContext,digest} from '../../../../scripts/research-common.mjs';
import {generateDossierJob,validateDossier,fields,temporalBounds} from '../../../../scripts/research-comprehensive.mjs';
const root='research/regional-09/resume-02/colombia',ctx=readContext(),c=JSON.parse(fs.readFileSync(root+'/cohort.json')),out=[];
const known=[...ctx.registry.sources,...JSON.parse(fs.readFileSync('data/comprehensive-dossiers.json')).packages.flatMap(p=>p.sources||[])];
const freshSources=c.sources.filter(s=>!known.some(k=>k.id===s.id));
for(const s of c.sources){const old=known.find(k=>k.id===s.id);if(old&&digest(old)!==digest(s))throw Error('Unsafe source overwrite '+s.id);}
for(const [eid,claims]of Map.groupBy(c.claims,x=>x.entityId)){
 const first=claims.toSorted((a,b)=>temporalBounds(a.temporal).lo-temporalBounds(b.temporal).lo)[0].temporal,last=claims.toSorted((a,b)=>temporalBounds(a.temporal).hi-temporalBounds(b.temporal).hi).at(-1).temporal;
 const period={from:first.from||first.observationDate||first.date,until:last.until||(last.observationDate||last.date).slice(0,4)},job=generateDossierJob(eid,period,ctx);
 const pkg={schemaVersion:2,id:'candidate-'+eid,jobId:job.id,entityId:eid,mapIds:job.mapIds,worker:{id:c.worker,assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period,claims,sources:freshSources,investigation:fields.map(category=>({category,status:claims.some(c=>c.category===category)?'partial':'unresolved',rationale:'Bounded historical source-family packet; candidate only.',consultedSourceIds:[],gaps:['Uncovered facts remain open.']})),conflicts:[],provenance:{createdAt:'2026-10-03',method:'Source-body research; independent review still required.',preservedPackageHashes:[digest(c)]}};
 out.push({entityId:eid,...validateDossier(pkg,job,ctx)});
}
fs.writeFileSync(root+'/validation.json',JSON.stringify({cohortHash:digest(c),validationOnly:true,acceptance:false,integration:false,results:out},null,2)+'\n');
console.log(JSON.stringify(out.map(x=>({entityId:x.entityId,valid:x.valid,errors:x.errors,review:x.review}))));
