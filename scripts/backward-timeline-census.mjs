// Source metadata census only. No identities, dossier claims or classifications
// are accepted by this tool. Exact names are recurrence candidates, not merges.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {readSnapshotConfig} from './research-snapshot-scan.mjs';
import {formatSnapshotYear} from '../snapshot-years.js';
export const upstreamCommit='da7a4b735ecef70aebdc9c73e409d8a2500d50f3';
export function provisionalType(p){
 const n=String(p.NAME??'');
 if(/\b(culture|archaeological)\b/i.test(n))return 'archaeological-culture';
 if(/\b(peoples?|tribe|tribal|hunter[- ]gatherers?|farmers?|pastoralists?|nomads?|aboriginal|first nation)\b/i.test(n))return 'people-or-cultural-region';
 if(/\b(colony|colonial|protectorate|dependency|mandate|viceroyalty)\b/i.test(n))return 'dependent-polity';
 if(/\b(kingdom|empire|republic|sultanate|khanate|caliphate|duchy|principality|confederacy|confederation|emirate|city[- ]state)\b/i.test(n))return 'polity';
 return 'unknown';
}
export function censusSnapshot(s,raw){
 if(raw.type!=='FeatureCollection'||!raw.features?.length)throw Error('Invalid or empty '+s.file);
 return raw.features.map((f,i)=>{const p=f.properties||{},classification=provisionalType(p);
  return {occurrence_id:`basemaps-${upstreamCommit}-${s.year}-${i}`,snapshot_year:s.year,display_year:formatSnapshotYear(s.year),source_file:s.file,source_commit:upstreamCommit,source_feature_index:i,source_feature_id:f.id??null,raw_NAME:p.NAME??null,raw_SUBJECTO:p.SUBJECTO??null,raw_PARTOF:p.PARTOF??null,BORDERPRECISION:p.BORDERPRECISION??null,geometry_type:f.geometry?.type??null,feature_count:1,polygon_count:f.geometry?.type==='Polygon'?1:f.geometry?.type==='MultiPolygon'?f.geometry.coordinates.length:0,provisional_classification:classification,classification_basis:classification==='unknown'?'No explicit name-semantic rule matched':'Explicit raw NAME semantics; triage only',accepted_historical_evidence:false};
 });
}
export function summarize(rows){
 const names=new Map(),snapshots=new Map(),classificationTotals={polity:0,'dependent-polity':0,'people-or-cultural-region':0,'archaeological-culture':0,unknown:0};
 for(const r of rows){classificationTotals[r.provisional_classification]++;const s=snapshots.get(r.snapshot_year)||{year:r.snapshot_year,displayYear:r.display_year,file:r.source_file,occurrences:0,polygonCount:0,names:new Set()};s.occurrences++;s.polygonCount+=r.polygon_count;if(r.raw_NAME!==null)s.names.add(r.raw_NAME);snapshots.set(r.snapshot_year,s);if(r.raw_NAME===null||r.raw_NAME==='')continue;const n=names.get(r.raw_NAME)||{rawName:r.raw_NAME,occurrences:0,snapshotYears:new Set()};n.occurrences++;n.snapshotYears.add(r.snapshot_year);names.set(r.raw_NAME,n);}
 const recurrence=[...names.values()].map(n=>({...n,snapshotYears:[...n.snapshotYears].sort((a,b)=>a-b),snapshotCount:n.snapshotYears.size})).sort((a,b)=>b.snapshotCount-a.snapshotCount||(a.rawName<b.rawName?-1:a.rawName>b.rawName?1:0));
 const distribution={};for(const n of recurrence)distribution[n.snapshotCount]=(distribution[n.snapshotCount]||0)+1;
 return {sourceCommit:upstreamCommit,totalOccurrences:rows.length,uniqueRawNames:names.size,classificationTotals,recurrenceDistribution:distribution,singleSnapshotNames:recurrence.filter(n=>n.snapshotCount===1).length,multipleSnapshotNames:recurrence.filter(n=>n.snapshotCount>1).length,bySnapshot:[...snapshots.values()].sort((a,b)=>a.year-b.year).map(({names,...s})=>({...s,uniqueRawNames:names.size})),recurrence};
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename)){
 const out='exports/backward-timeline-census',cache=path.join(os.tmpdir(),'atlas-pinned-'+upstreamCommit);fs.mkdirSync(out,{recursive:true});fs.mkdirSync(cache,{recursive:true});
 const snapshots=readSnapshotConfig().filter(s=>s.year<1800),rows=[],sources=[];
 for(const s of snapshots){const url=`https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@${upstreamCommit}/geojson/${s.file}`,file=path.join(cache,s.file);let bytes;if(fs.existsSync(file))bytes=fs.readFileSync(file);else{const r=await fetch(url,{signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error(url+' HTTP '+r.status);bytes=Buffer.from(await r.arrayBuffer());fs.writeFileSync(file,bytes);}rows.push(...censusSnapshot(s,JSON.parse(bytes)));sources.push({...s,url,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
 const summary=summarize(rows),write=(name,v)=>fs.writeFileSync(out+'/'+name,JSON.stringify(v,null,2)+'\n');
 const archived=JSON.parse(fs.readFileSync('development/backward-timeline/source-files.json')).snapshots.find(s=>s.year===1492);
 write('deferred-snapshots.json',[{year:1492,file:archived.file,sourceCommit:upstreamCommit,sha256:archived.sha256,status:'temporarily-excluded',reason:'Anomalous source layer; requires cleanup before restoration. User-directed exclusion, not a historical classification.',previousVerification:'development/backward-timeline/source-files.json'}]);
 write('occurrences.json',rows);write('summary.json',summary);write('sources.json',sources);write('names-single-snapshot.json',summary.recurrence.filter(n=>n.snapshotCount===1));write('names-multiple-snapshots.json',summary.recurrence.filter(n=>n.snapshotCount>1));write('candidate-long-running-entities.json',summary.recurrence.filter(n=>n.snapshotCount>1));
 const columns=Object.keys(rows[0]),csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';fs.writeFileSync(out+'/occurrences.csv',[columns,...rows.map(r=>columns.map(c=>r[c]))].map(r=>r.map(csv).join(',')).join('\r\n')+'\r\n');
 fs.writeFileSync(out+'/README.md',`# Backward timeline source census\n\nRead-only raw feature census for the 35 selectable pre-1800 snapshots, pinned to ${upstreamCommit}. 1492 is temporarily excluded; its filename and previous verification remain preserved in development/backward-timeline/source-files.json. No original source has been deleted.\n\noccurrences.json and occurrences.csv contain every raw source feature, including features filtered by the existing map renderer (for example Antarctica). Counts are source occurrences, not sovereign states, accepted entities or researched dossiers. MultiPolygon parts are counted separately in polygon_count; feature_count is always one. Missing properties are null in JSON and blank in CSV. occurrence_id combines source commit, signed snapshot year and zero-based source feature index. It is deterministic for these pinned bytes.\n\nsummary.json contains per-snapshot counts, exact-name recurrence and classification totals. The single/multiple-name files partition names by distinct snapshot count. candidate-long-running-entities.json ranks recurring exact names by snapshot count; it does NOT establish historical continuity or merge entities. Exact names retain source case and spelling.\n\nProvisional classifications use explicit raw NAME semantics only. Unrecognised names remain unknown. These are workload triage, never accepted historical evidence; they do not imply dossier eligibility, sovereignty, capitals, leadership or currency. No source metadata is changed. sources.json records URLs and hashes.\n\nRegenerate with node scripts/backward-timeline-census.mjs. Source caches are outside the repository; production historical files are read-only.\n`);
 console.log(JSON.stringify({...summary,recurrence:undefined},null,2));
}
