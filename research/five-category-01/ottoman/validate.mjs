import fs from 'node:fs';
import {readJSON,readContext} from '../../../scripts/research-common.mjs';
import {fields,temporalBounds,generateDossierJob,validateDossier} from '../../../scripts/research-comprehensive.mjs';
const out='research/five-category-01/ottoman',cohort=readJSON(out+'/cohort.json'),context=readContext();const groups=new Map();for(const c of cohort.claims)groups.set(c.entityId,[...(groups.get(c.entityId)||[]),c]);
const results=[];
for(const[entityId,claims]of groups){const order=claims.toSorted((a,b)=>temporalBounds(a.temporal).lo-temporalBounds(b.temporal).lo),ends=claims.toSorted((a,b)=>temporalBounds(a.temporal).hi-temporalBounds(b.temporal).hi),period={from:order[0].temporal.from,until:ends.at(-1).temporal.until},job=generateDossierJob(entityId,period,context),refs=[...new Set(claims.flatMap(c=>c.sourceIds))],categories=new Set(claims.map(c=>c.category));
 const pkg={schemaVersion:2,id:cohort.id+'-'+entityId,jobId:job.id,entityId,mapIds:job.mapIds,worker:{id:cohort.worker,assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period,claims,sources:cohort.sources.filter(s=>refs.includes(s.id)&&![...context.registry.sources,...readJSON('data/comprehensive-dossiers.json').packages.flatMap(p=>p.sources||[])].some(old=>old.id===s.id)),investigation:fields.map(category=>({category,status:categories.has(category)?'partial':'unresolved',rationale:'Bounded five-category official-source proposals; unverified fields held.',consultedSourceIds:categories.has(category)?refs:[],gaps:['Unsupported cells held separately.']})),conflicts:[],provenance:{createdAt:'2026-10-03',method:'Bounded official-source body review; coordinator acceptance pending.',preservedPackageHashes:[]}};
 const result=validateDossier(pkg,job,context);results.push({entityId,...result});
}
fs.writeFileSync(out+'/validation.json',JSON.stringify(results,null,2)+'\n');console.log(results.map(r=>({entityId:r.entityId,valid:r.valid,errors:r.errors,review:r.review})));if(results.some(r=>!r.valid))process.exitCode=1;


