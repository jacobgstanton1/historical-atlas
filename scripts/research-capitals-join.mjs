// ICOW stays private. Production facts come exclusively from original CC0 Wikidata statements.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {readJSON,readContext,saveJSON,digest,isCLI} from './research-common.mjs';
export const base='research/completion-03/capitals';
export const normalize=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function conservativeDate(value,start){
 if(!value||value.before||value.after||value.calendarmodel!=='http://www.wikidata.org/entity/Q1985727')return null;
 const m=/^\+(\d{4})-(\d{2})-(\d{2})T/.exec(value.time);if(!m)return null;
 const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]);
 if(value.precision===11)return `${m[1]}-${m[2]}-${m[3]}`;
 if(value.precision===9)return String(y+(start?1:0))+'-01-01';
 if(value.precision===10&&mo){const t=new Date(Date.UTC(y,mo-1+(start?1:0),1));return t.toISOString().slice(0,10);}
 return null; // Decade/century precision and non-Gregorian dating require review.
}
export function capitalPeriod(statement){
 const q=statement.qualifiers||{},starts=q.P580||[],ends=q.P582||[];
 if(statement.rank==='deprecated'||starts.length!==1||ends.length>1||Object.keys(q).some(k=>!['P580','P582'].includes(k)))return null;
 const from=conservativeDate(starts[0].datavalue?.value,true),until=ends.length?conservativeDate(ends[0].datavalue?.value,false):'1961-01-01';
 return from&&until&&from<until?{from,until}:null;
}
export function completeYear(period,year){return period&&period.from<=year+'-01-01'&&period.until>=String(year+1)+'-01-01';}
function envelope(e){const x=e.existence;if(!x?.validFrom)return null;return {from:x.validFrom.length===4?String(Number(x.validFrom)+1)+'-01-01':x.validFrom,until:x.validUntil||'1961-01-01'};}
function icowContradiction(text,capital,year){
 // Explicitly dated alternative capitals override an undated current-name suggestion.
 const ranges=[...text.matchAll(/([^(),;]+?)\s+(?:from\s+)?(\d{4})\s*[-â€“]\s*(\d{4})/g)];
 return ranges.some(m=>year>Number(m[2])&&year<Number(m[3])&&!normalize(m[1]).includes(normalize(capital)));
}
export function assessCapitals(){
 const privateSource=readJSON(path.join(os.tmpdir(),'historical-atlas-icow-20261002','parsed.json')),context=readContext(),matrix=readJSON('research/completion-01/reports/completion.json'),query=readJSON(base+'/wikidata-capitals-response.json').results.bindings,original=readJSON(base+'/wikidata-qualified-entities.json').entities;
 const labels=new Map(query.map(r=>[r.capital.value.split('/').at(-1),r.capitalLabel.value])),queryByEntity=new Map();for(const r of query){let q=r.entity.value.split('/').at(-1),a=queryByEntity.get(q)||[];a.push(r);queryByEntity.set(q,a);}
 const safe=[],held=[],skipped=[],potential=[],seen=new Set();
 for(const m of privateSource.matches){
  const e=context.db.entities.find(e=>e.id===m.entityId),slots=matrix.rows.filter(r=>r.entityId===m.entityId),n=normalize(m.source.name);
  const wdEntities=[...queryByEntity].filter(([q,rs])=>normalize(rs[0].entityLabel.value)===n);
  if(m.confidence!=='EXACT-NAME-CANDIDATE'||wdEntities.length!==1){for(const s of slots.filter(s=>s.categories.capital.status!=='supported'))held.push({entityId:e.id,year:s.snapshotYear,reason:'Alias/related-entity or nonunique external identity requires review'});continue;}
  const [qid]=wdEntities[0],wd=original[qid];
  if(!wd){for(const s of slots.filter(s=>s.categories.capital.status!=='supported'))held.push({entityId:e.id,year:s.snapshotYear,reason:'No dated original capital statements; current capital is not back-projected'});continue;}
  const statements=(wd.claims.P36||[]).filter(s=>s.rank!=='deprecated'),bounds=envelope(e);
  for(const slot of slots){
   if(slot.categories.capital.status==='supported'){skipped.push({entityId:e.id,year:slot.snapshotYear});continue;}
   const year=slot.snapshotYear,candidates=statements.map(s=>({statement:s,capitalId:s.mainsnak.datavalue?.value?.id,period:capitalPeriod(s)})).filter(x=>completeYear(x.period,year));
   const competitors=statements.filter(s=>{const p=capitalPeriod(s);return p&&completeYear(p,year);});
   for(const x of candidates){const name=labels.get(x.capitalId);if(name)potential.push({entityId:e.id,year,qid,capitalId:x.capitalId,capital:name});}
   const candidate=candidates.length===1?candidates[0]:null,name=candidate&&labels.get(candidate.capitalId);
   if(!candidate||competitors.length!==1||!name||slot.mappingPartial||!completeYear(bounds,year)||!normalize(m.source.capitals).includes(normalize(name))||/another major city|sometimes used by writers/i.test(m.source.capitals)||icowContradiction(m.source.capitals,name,year)){
    held.push({entityId:e.id,year,reason:'No unique fully dated, role-unambiguous, ICOW-agreeing capital inside the historical framework; chronology/role exceptions held'});continue;
   }
   // Qualifier-rich alternative statements are not flattened into a single state capital.
   const qualifiedCompetitor=statements.some(s=>s.id!==candidate.statement.id&&Object.keys(s.qualifiers||{}).some(k=>!['P580','P582'].includes(k))&&s.qualifiers?.P580&&s.qualifiers?.P582&&completeYear({from:conservativeDate(s.qualifiers.P580[0].datavalue?.value,true)||'0000',until:conservativeDate(s.qualifiers.P582[0].datavalue?.value,false)||'9999'},year));
   if(qualifiedCompetitor){held.push({entityId:e.id,year,reason:'Competing historical seat/role or exile statement requires review'});continue;}
   const period={from:[candidate.period.from,bounds.from,'1800-01-01'].sort().at(-1),until:[candidate.period.until,bounds.until,'1961-01-01'].sort()[0]},key=e.id+'|'+candidate.statement.id;
   let accepted=safe.find(x=>x.key===key);if(!accepted){accepted={key,entityId:e.id,qid,capitalId:candidate.capitalId,capital:name,statement:candidate.statement,period,snapshotYears:[]};safe.push(accepted);}accepted.snapshotYears.push(year);seen.add(e.id+'|'+year);
  }
 }
 const uniqueHeld=[...new Map(held.map(h=>[h.entityId+'|'+h.year,h])).values()].filter(h=>!seen.has(h.entityId+'|'+h.year));
 const result={icowSourceRows:privateSource.rows.length,wikidataQueryRows:query.length,originalDatedEntities:Object.keys(original).length,potentialSlots:potential.length,safeNewSlots:seen.size,safeUniqueClaims:safe.length,safe,held:uniqueHeld,alreadySupportedMatchedSlots:new Set(skipped.map(s=>s.entityId+'|'+s.year)).size,policy:'ICOW full source stays private; public candidates/claims originate in CC0 Wikidata. Current undated capital, alias-only identity, non-Gregorian/decade precision, institutional/applies-to-part/exile qualifiers and competing capital intervals fail closed.'};
 saveJSON(base+'/safe-yield.json',{...result,safe:safe.map(x=>({...x,statement:undefined}))});return result;
}
export function buildCapitalCohort(){
 const r=assessCapitals(),source={id:'wikidata-historical-capital-statements-20261002',title:'Wikidata historical capital (P36) statements with original temporal qualifiers, extracted 2 October 2026',institution:'Wikidata contributors / Wikimedia Foundation',url:'https://www.wikidata.org/',accessed:'2026-10-02',kind:'open-structured-historical-capital-evidence',license:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',usage:'One source-wide SPARQL extraction and one original-statement verification batch. Original item/statement IDs, rank, qualifier precision and dates retained. Only explicit temporal applicability; current undated capitals are not historical fallback. ICOW used privately for candidate reconciliation, not republished.'};
 const claims=r.safe.map(x=>{let temporal={kind:'interval',...x.period,certainty:'exact'};return {id:'dated-capital-'+digest([x.entityId,x.statement.id,x.period]).slice(0,24),entityId:x.entityId,category:'capital',value:x.capital,temporal,scope:{id:x.entityId+'-dated-national-capital',description:'Explicitly dated capital relationship for the existing historical political framework; does not infer territorial control or an exclusive constitutional seat.',relationship:'same'},sourceIds:[source.id],evidence:[{sourceId:source.id,locator:`https://www.wikidata.org/wiki/${x.qid}#${x.statement.id}; P36=${x.capitalId}; original qualifiers ${JSON.stringify(x.statement.qualifiers)}`,note:'Literal original capital statement, original date precision and rank verified. Conservative complete precision interiors and existing historical-framework clipping; original dates retained, no current-capital back-projection. Private independent candidate reconciliation agreed on the city, without republishing its dataset.',precision:'day',temporal,interpretation:'direct'}],status:'supported',risks:[],qualifications:['Sourced dated capital relationship, not proof of exclusive seat, uniform territorial control or a fabricated government institution.','Original temporal precision is retained in evidence; clipping only narrows the supported interval within the atlas historical framework.'],origin:{kind:'bulk-candidate',reference:'Wikidata P36 original statement '+x.statement.id+'; original qualifier JSON and dated-capital source-wide query; mapping exact named historical-country framework',sourceIdentifier:x.qid+':'+x.statement.id}};});
 const cohort={id:'completion03-open-dated-capitals',worker:'wikidata-original-capital-interval-join',sources:[source],claims};
 saveJSON(base+'/intake/cohort.json',cohort);saveJSON(base+'/baseline.json',{metrics:readJSON('research/completion-01/reports/completion.json').metrics,rows:readJSON('research/completion-01/reports/completion.json').rows.map(r=>({entityId:r.entityId,snapshotYear:r.snapshotYear,capital:r.categories.capital.status}))});
 const bindings=['scripts/research-capitals-join.mjs',base+'/wikidata-capitals-response.json',base+'/wikidata-qualified-entities.json',base+'/wikidata-capitals-query.sparql'];
 saveJSON(base+'/intake/certificate.json',{cohortHash:digest(cohort),reviewer:'/root complete original statement and deterministic historical-framework review',bodyReviewed:true,acceptedClaimIds:claims.map(c=>c.id),inputBindings:bindings.map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')})),rationale:r.policy+' Exact-name country/framework joins bounded by existing entity existence. Original source qualifiers and all alternatives inspected computationally. ICOW raw material remains outside Git; it is not production provenance or a replacement bulk table. Public original evidence is Wikidata CC0. Only source-agreeing unique fully dated capital relations accepted; all role-qualified, competing, ambiguous/related and undated cases held. Existing accepted capital facts left untouched.'});
 return {claims:claims.length,newSlots:r.safeNewSlots,held:r.held.length};
}
if(isCLI(import.meta.url))console.log(JSON.stringify(process.argv.includes('--build')?buildCapitalCohort():assessCapitals()).slice(0,2200));
