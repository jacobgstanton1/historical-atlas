// Dated structured flag candidates. Name joins alone never produce production claims.
import fs from 'node:fs';
import path from 'node:path';
import {readJSON,saveJSON,digest,isCLI} from './research-common.mjs';
import {assetHash,inspectFlagAsset} from './research-flags.mjs';
export const normalizedFile=s=>s.replace(/^File:/,'').replaceAll('_',' ').normalize('NFC');
export function filenamePeriodConflict(file,period){
 const ranges=[...file.matchAll(/(\d{4})[–-](\d{4})/g)].map(m=>[Number(m[1]),Number(m[2])]);
 if(ranges.length)return !ranges.some(([from,until])=>Number(period.from)>=from&&Number(period.until)<=until);
 const single=file.match(/\((\d{4})\)/);
 return single?Number(period.from)!==Number(single[1])||Number(period.until)!==Number(single[1]):false;
}
export function qualifiedStatement(entity,row){
 const statements=entity?.claims?.P41||[];
 return statements.find(s=>normalizedFile(s.mainsnak?.datavalue?.value||'')===normalizedFile(row[1])&&s.rank!=='deprecated'&&['P580','P582'].every((p,i)=>{
  const expected=row[i+2],dates=(s.qualifiers?.[p]||[]).map(q=>{
   const v=q.datavalue?.value;
   if(!v||v.precision<9||v.before||v.after||v.calendarmodel!=='http://www.wikidata.org/entity/Q1985727')return null;
   const date=v.time.replace(/^\+/,'').slice(0,10);
   return v.precision===9?date.slice(0,4)+'-01-01':v.precision===10?date.slice(0,7)+'-01':date;
  });
  return expected?dates.includes(expected):!dates.length;
 }));
}
export function completeYears(row,existence){
 if(!row[2]||!existence?.validFrom)return null;
 // Conservative complete years avoid inventing day/month precision or treating a
 // year-only Wikidata qualifier rendered as Jan 1 as an exact adoption date.
 const from=Math.max(1800,Number(row[2].slice(0,4))+1,Number(existence.validFrom.slice(0,4))+(existence.validFrom.endsWith('-01-01')?0:1));
 const until=Math.min(1960,row[3]?Number(row[3].slice(0,4))-1:1960,existence.validUntil?Number(existence.validUntil.slice(0,4))-1:1960);
 return from<=until?{from:String(from),until:String(until)}:null;
}
export function prepareFlags(){
 const base='research/completion-02/flags',candidates=readJSON(base+'/candidate-crosswalk.json'),entities=readJSON('data/historical-entities.json').entities,q=readJSON(base+'/cache/wikidata-entities.json').entities,metadata=readJSON(base+'/cache/commons-image-metadata.json').pages;
 const mappings=[],held=[],records=[],seen=new Set();
 for(const c of candidates.candidates){
  const entity=entities.find(e=>e.id===c.entityId),rowKey=c.entityId+':'+c.year;
  const safe=c.records.filter(r=>qualifiedStatement(q[c.qid],r)).map(r=>({row:r,period:completeYears(r,entity.existence)})).filter(x=>x.period&&Number(x.period.from)<=c.year&&Number(x.period.until)>=c.year);
  if(safe.length!==1){held.push({entityId:c.entityId,year:c.year,qid:c.qid,reason:safe.length?'Competing qualified flag files or country identifiers require review.':'No single original-qualified flag interval covers the complete year within an explicit entity envelope.'});continue;}
  const {row,period}=safe[0],key=digest([c.entityId,row,period]);
  if(filenamePeriodConflict(row[1],period)){held.push({entityId:c.entityId,year:c.year,qid:c.qid,reason:'Structured dates conflict with the flag asset\'s named historical period; no automatic repair or interpretation.'});continue;}
  if(seen.has(key))continue;seen.add(key);
  const page=metadata.find(p=>normalizedFile(p.title)===normalizedFile(row[1])),info=page?.imageinfo?.[0],em=info?.extmetadata;
  if(!info?.url||!em?.LicenseShortName?.value||!new URL(info.url).pathname.endsWith('.svg')){held.push({entityId:c.entityId,year:c.year,reason:'Missing licensed SVG original asset metadata'});continue;}
  const license=em.LicenseShortName.value,allowed=['Public domain','CC0','CC BY-SA 3.0','CC BY-SA 4.0'];
  if(!allowed.includes(license)){held.push({entityId:c.entityId,year:c.year,reason:'Unsupported redistribution license'});continue;}
  const assetId='commons-'+digest(normalizedFile(row[1])).slice(0,24),staged=base+'/cache/assets/'+assetId+'.svg';
  records.push({key,entityId:c.entityId,qid:c.qid,rawNames:c.rawNames,row,period,assetId,staged,info,license,artist:em.Artist?.value||'Commons contributors',credit:em.Credit?.value||'',licenseUrl:em.LicenseUrl?.value||null});
  mappings.push({atlasEntityId:c.entityId,externalQid:c.qid,originalEntityLabel:c.label,applicability:period,status:'REVIEW',rationale:'Existing political-entity/raw-name association plus original P41 start/end qualifiers. Coordinator must accept the entity-period association before normalization into production.'});
 }
 saveJSON(base+'/prepared-records.json',{records,mappings,held,sourceRows:candidates.sourceRows,candidateSlots:candidates.candidateSlots});
 console.log(JSON.stringify({records:records.length,entities:new Set(records.map(r=>r.entityId)).size,assets:new Set(records.map(r=>r.assetId)).size,held:held.length}));
}
if(isCLI(import.meta.url))prepareFlags();
