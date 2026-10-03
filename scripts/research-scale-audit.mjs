import fs from 'node:fs';
import {readJSON,readContext,digest,saveJSON,isCLI,root} from './research-common.mjs';
import {fingerprint,schemaCheck,temporalBounds,selectForYear} from './research-comprehensive.mjs';
import {validateLiteralRelationshipReuse} from './research-completion-reuse.mjs';
import {assessCompatibility} from './research-crosswalk.mjs';
export function auditRichProduction(context){
 const store=readJSON(context.directory+'/data/comprehensive-dossiers.json'),schema=readJSON(root+'research/comprehensive/schemas/dossier.schema.json'),errors=[],ids=new Set(),sources=new Map(),urls=new Map();let checks=0;
 const check=(ok,label)=>{checks++;if(!ok)errors.push(label);};
 for(const s of [...context.registry.sources,...store.packages.flatMap(p=>p.sources)]){check(!sources.has(s.id)||digest(sources.get(s.id))===digest(s),'Conflicting source '+s.id);check(!urls.has(s.url)||urls.get(s.url)===s.id,'Source URL alias '+s.url);sources.set(s.id,s);urls.set(s.url,s.id);}
 for(const p of store.packages){check(!ids.has(p.id),'Duplicate package '+p.id);ids.add(p.id);const {acceptance,...content}=p;check(schemaCheck(content,schema,schema).length===0,'Production schema '+p.id);check(!!context.db.entities.find(e=>e.id===p.entityId),'Missing entity '+p.id);check(p.mapIds.every(id=>context.db.mappings.some(m=>m.mapId===id&&m.entityId===p.entityId)),'Mapping '+p.id);check(digest(p.claims.map(c=>c.id))===digest(acceptance.acceptedClaimIds),'Accepted subset '+p.id);
  for(const i of p.investigation)check(i.consultedSourceIds.every(id=>sources.has(id)),'Consulted citation '+p.id+'/'+i.category);
  for(const c of p.claims.filter(c=>c.relatedParty))check(validateLiteralRelationshipReuse(c,context,temporalBounds),'Literal relationship provenance '+c.id);
  for(const c of p.claims.filter(c=>c.compatibility)){
   check(assessCompatibility(c.compatibility,c).accepted,'Historical compatibility '+c.id);
   check(c.compatibility.evidence.every(e=>sources.has(e.sourceId)&&c.sourceIds.includes(e.sourceId)),'Compatibility evidence '+c.id);
  }
  for(const c of p.claims){check(!ids.has(c.id),'Duplicate claim '+c.id);ids.add(c.id);check(c.entityId===p.entityId,'Entity scope '+c.id);check(c.sourceIds.every(id=>sources.has(id))&&c.evidence.every(e=>c.sourceIds.includes(e.sourceId)),'Citation '+c.id);const b=temporalBounds(c.temporal),r=temporalBounds({...p.period,kind:'interval'});check(b.lo>=r.lo&&b.hi<=r.hi&&b.lo>=1800*372&&b.hi<=1961*372,'Temporal envelope '+c.id);const from=c.temporal.from||c.temporal.date||c.temporal.observationDate,year=Number(from.slice(0,4));check(selectForYear([c],year-1).length===0,'Selected-year earlier leakage '+c.id);if(c.temporal.kind!=='interval'){check(selectForYear([c],year+1).length===0,'Observation/event later leakage '+c.id);check(selectForYear([c],year)[0]?.actualTemporal.observationDate===c.temporal.observationDate,'Observation identity '+c.id);}check(acceptance.review.decisions[c.id]==='accepted'&&c.status==='supported','Acceptance '+c.id);}
 }
 return {valid:!errors.length,errors,checks,packages:store.packages.length,entities:new Set(store.packages.map(p=>p.entityId)).size,claims:store.packages.reduce((n,p)=>n+p.claims.length,0),registeredSources:sources.size,productionFingerprint:fingerprint(context.directory)};
}
if(isCLI(import.meta.url)){const r=auditRichProduction(readContext());saveJSON('research/scale-01/production-audit.json',r);console.log(JSON.stringify(r,null,2));if(!r.valid)process.exitCode=1;}
