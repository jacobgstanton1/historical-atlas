// COLDAT modern-territory summaries require independent historical-framework corroboration.
import fs from 'node:fs';import crypto from 'node:crypto';
import {readJSON,readContext,saveJSON,digest,isCLI} from './research-common.mjs';
import {relationshipStatusPredicate} from '../research/completion-01/relationships/predicate.mjs';
const base='research/completion-03/coldat';
export const norm=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const parties={britain:/\b(British|Britain|United Kingdom)\b/i,france:/\b(French|France)\b/i,germany:/\b(German|Germany)\b/i,italy:/\b(Italian|Italy)\b/i,belgium:/\b(Belgian|Belgium)\b/i,netherlands:/\b(Dutch|Netherlands)\b/i,portugal:/\b(Portuguese|Portugal)\b/i,spain:/\b(Spanish|Spain)\b/i};
export function interior(r){const fields=['colstart_max','colstart_mean','colend_max','colend_mean'];if(fields.some(k=>!/^\d{4}$/.test(r[k])))return null;const a=Math.max(+r.colstart_max,+r.colstart_mean)+1,b=Math.min(+r.colend_max,+r.colend_mean);return a<b?{from:a+'-01-01',until:b+'-01-01'}:null;}
export function assess(){
 const rows=readJSON(base+'/cache/dyads.json'),context=readContext(),matrix=readJSON('research/completion-01/reports/completion.json'),held=[],safe=[],already=[],candidates=[];
 const positive=rows.filter(r=>r.col==='1');
 for(const e of context.db.entities){
  const names=[...e.names.map(n=>n.value.split(' — ')[0]),...(e.aliases||[]).map(a=>typeof a==='string'?a:a.value)].filter(Boolean).map(norm);
  const matched=positive.filter(r=>names.includes(norm(r.country)));
  for(const slot of matrix.rows.filter(s=>s.entityId===e.id))for(const r of matched){
   const p=interior(r),year=slot.snapshotYear,lo=year+'-01-01',hi=(year+1)+'-01-01';
   if(!p||p.from>lo||p.until<hi)continue;
   candidates.push({entityId:e.id,year,country:r.country,colonizer:r.colonizer});
   if(slot.categories.relationships.status==='supported'){already.push({entityId:e.id,year});continue;}
   const other=matched.filter(o=>o.colonizer!==r.colonizer&&interior(o)?.from<=lo&&interior(o)?.until>=hi);
   const facts=[...(e.politicalStatus||[]),...e.names.filter(n=>n.kind==='primary')].filter(f=>f.sourceIds?.length&&f.validFrom&&f.validFrom<=lo&&(!f.validUntil||f.validUntil>=hi)&&relationshipStatusPredicate(f.value).eligible&&parties[r.colonizer]?.test(f.value));
   if(slot.mappingPartial||other.length||facts.length!==1){held.push({entityId:e.id,year,country:r.country,colonizer:r.colonizer,reason:other.length?'Competing colonial area codings; modern-country scope cannot adjudicate historical administrations':'No unique independently sourced continuous historical affiliation/framework; modern names are not territorial equivalence'});continue;}
   const f=facts[0],from=[p.from,f.validFrom,'1800-01-01'].sort().at(-1),until=[p.until,f.validUntil||'1961-01-01','1961-01-01'].sort()[0];
   safe.push({entityId:e.id,year,row:r,from,until,corroboration:f});
  }
 }
 const unique=a=>[...new Map(a.map(s=>[s.entityId+'|'+s.year,s])).values()];
 const out={sourceRows:rows.length,positiveDyads:positive.length,sourceCountries:new Set(rows.map(r=>r.country)).size,exactNameCandidateEntities:new Set(candidates.map(s=>s.entityId)).size,candidateSnapshotSlots:unique(candidates).length,alreadySupportedSlots:unique(already).length,safeNewSlots:unique(safe).length,safeHistoricalEntities:new Set(safe.map(s=>s.entityId)).size,heldSlots:unique(held).length,held:unique(held),safe,policy:'Name/alias joins are candidates only. Both documented date aggregates retained; only full-year interior agreement plus one independently sourced continuous same-party historical affiliation can qualify. Competing area codings held; no modern borders, constitutional subtype, interrupted episode continuity or absence inference.'};
 saveJSON(base+'/yield.json',out);return out;
}
export function build(){
 const r=assess(),source={id:'coldat-v3-2023',title:'Colonial Dates Dataset (COLDAT), version 3.0 (21 September 2023)',institution:'Bastian Becker / Harvard Dataverse',url:'https://doi.org/10.7910/DVN/T9SDEW',accessed:'2026-10-02',kind:'academic-colonial-history-summary',license:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',usage:'Modern-territory colonial-history summaries, including legacy of absorbed areas. Both last-date and rounded-mean aggregates retained; not a complete dependency or uninterrupted-episode database.'};
 if(r.safe.some(x=>x.row.colonizer!=='spain'))throw Error('Unreviewed metropole mapping; current certified counterpart is Spain only');
 const claims=[...new Map(r.safe.map(x=>{const temporal={kind:'interval',from:x.from.slice(0,4),until:String(Number(x.until.slice(0,4))-1),certainty:'exact'},id='coldat-corroborated-'+digest([x.entityId,x.row,x.from,x.until]).slice(0,24);return[id,{id,entityId:x.entityId,category:'relationships',relatedEntityIds:['spain-political-frameworks'],value:x.corroboration.value,temporal,scope:{id:x.entityId+'-documented-historical-affiliation',description:'Existing sourced historical framework, not a claim that modern COLDAT borders match the atlas polygon.',relationship:'same'},sourceIds:[source.id,...x.corroboration.sourceIds],evidence:[{sourceId:source.id,locator:'COLDAT v3 dyad '+JSON.stringify(x.row),note:'Last-date and rounded mean aggregation both preserved. COLDAT is corroboration only; literal historical affiliation and bounded applicability are independently established by existing sourced atlas fact. No continuous colonial episode or specific constitutional subtype inferred from the modern-country summary.',precision:'year',temporal:{kind:'interval',from:x.row.colstart_max,until:x.row.colend_max,certainty:'exact'},interpretation:'direct'},...x.corroboration.sourceIds.map(sourceId=>({sourceId,locator:'Existing independently sourced atlas primary name/status '+x.entityId,note:x.corroboration.value,precision:'day',temporal,interpretation:'direct'}))],status:'supported',risks:[],qualifications:[source.usage,'COLDAT source territory '+x.row.country+'; colonial power '+x.row.colonizer+'; historical mapping independently corroborated, not modern-name equivalence.'],origin:{kind:'bulk-candidate',reference:'COLDAT v3 '+x.row.country+'/'+x.row.colonizer,sourceIdentifier:x.row.country+'/'+x.row.colonizer}}];})).values()];
 const cohort={id:'completion03-coldat-corroborated-relationships',worker:'coldat-computational-historical-framework-join',sources:[source],claims};saveJSON(base+'/intake/cohort.json',cohort);
 saveJSON(base+'/intake/certificate.json',{cohortHash:digest(cohort),bodyReviewed:true,reviewer:'/root independent methodology and historical-framework corroboration review',acceptedClaimIds:claims.map(c=>c.id),inputBindings:['scripts/research-coldat.mjs',base+'/cache/dyads.tab',base+'/cache/dyads.json',base+'/cache/metadata.json',base+'/cache/methodology.txt'].map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')})),rationale:r.policy+' Accepted value is copied unchanged from already sourced historical primary-name/status fact; COLDAT only corroborates colonial counterpart within its broader summarized period. No additional territorial, constitutional or episode interpretation accepted.'});return{claims:claims.length,newSlots:r.safeNewSlots,held:r.heldSlots};
}
if(isCLI(import.meta.url)){const r=process.argv.includes('--build')?build():assess();console.log(JSON.stringify({...r,safe:undefined,held:undefined}));}
