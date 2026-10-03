import fs from 'node:fs';
import {readContext,readJSON,digest} from '../../../scripts/research-common.mjs';
import {fields,generateDossierJob,validateDossier} from '../../../scripts/research-comprehensive.mjs';
const cohort=JSON.parse(fs.readFileSync(new URL('./cohort.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
const context=readContext(),store=readJSON('data/comprehensive-dossiers.json');
const claims=structuredClone(cohort.claims);for(const c of claims)if(c.flag)c.flag.asset='./assets/flags/fr-1794.svg';
const period={from:'1800',until:'1960'},job=generateDossierJob(claims[0].entityId,period,context),known=[...context.registry.sources,...store.packages.flatMap(p=>p.sources)],ids=[...new Set(claims.flatMap(c=>c.sourceIds))];
const pkg={schemaVersion:2,id:cohort.id+'-selfcheck',jobId:job.id,entityId:claims[0].entityId,mapIds:job.mapIds,worker:{id:cohort.worker,assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period,claims,sources:cohort.sources.filter(s=>!known.some(k=>k.id===s.id)),investigation:fields.map(category=>({category,status:'partial',rationale:'Isolated bounded research; remaining fields held.',consultedSourceIds:ids,gaps:['Uncovered fields remain open.']})),conflicts:[],provenance:{createdAt:'2026-10-03',method:'Worker self-check; independent source review remains required.',preservedPackageHashes:[digest(cohort)]}};
const result=validateDossier(pkg,job,context);fs.writeFileSync(new URL('./validation.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify({valid:result.valid,errors:result.errors,review:result.review}));

