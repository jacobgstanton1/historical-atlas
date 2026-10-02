import fs from 'node:fs';
import {readContext,digest} from '../../../scripts/research-common.mjs';
import {generateDossierJob,validateDossier,fields,temporalBounds} from '../../../scripts/research-comprehensive.mjs';
const root='research/regional-15/british',ctx=readContext(),c=JSON.parse(fs.readFileSync(root+'/cohort.json')),out=[];
for(const [eid,claims] of Map.groupBy(c.claims,x=>x.entityId)){
 const sorted=claims.toSorted((a,b)=>temporalBounds(a.temporal).lo-temporalBounds(b.temporal).lo),ends=claims.toSorted((a,b)=>temporalBounds(a.temporal).hi-temporalBounds(b.temporal).hi);
 const first=sorted[0].temporal,last=ends.at(-1).temporal,period={from:first.from||first.observationDate||first.date,until:last.until||(last.observationDate||last.date).slice(0,4)},job=generateDossierJob(eid,period,ctx);
 const pkg={schemaVersion:2,id:'test-'+eid,jobId:job.id,entityId:eid,mapIds:job.mapIds,worker:{id:c.worker,assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period,claims,sources:c.sources,investigation:fields.map(category=>({category,status:claims.some(x=>x.category===category)?'partial':'unresolved',rationale:'Bounded intake; not exhaustive.',consultedSourceIds:[],gaps:['Uncovered periods remain open.']})),conflicts:[],provenance:{createdAt:'2026-10-02',method:'Original source body review; awaiting independent review',preservedPackageHashes:[digest(c)]}};
 out.push({entityId:eid,...validateDossier(pkg,job,ctx)});
}
fs.writeFileSync(root+'/validation.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out.map(x=>({entityId:x.entityId,valid:x.valid,errors:x.errors,review:x.review}))));
