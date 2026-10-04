// Offline, read-only cohort projection. Never invokes acquisition or integration.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {csv,productionHashes} from './export-dossier-workload.mjs';
import {productionFingerprint} from './research-common.mjs';
import {createMetadataIndex} from '../historical-metadata.js';
import {createRichDossierIndex} from '../rich-dossier.js';
import {resolveDossierRecords} from '../dossier.js';
import {fullYear} from './research-snapshot-scan.mjs';

export const cohort={
 Portugal:[1200,1279,1300,1400,1500,1530,1600,1650,1700,1715,1783],
 France:[1279,1300,1400,1500,1530,1600,1650,1700,1715,1783],
 Venice:[1000,1100,1200,1279,1300,1400,1500,1530,1600,1650,1700,1715],
 'Papal States':[800,1100,1200,1279,1300,1400,1500,1530,1600,1650,1700,1715,1783],
 Scotland:[1000,1100,1200,1279,1300,1400,1500,1530,1600,1650,1700],
 Sweden:[1000,1100,1200,1279,1300,1530,1600,1650,1700,1715,1783],
 'Đại Việt':[1100,1200,1279,1300,1400,1500,1530,1600,1650,1700,1715,1783],
 'Holy Roman Empire':[1000,1100,1200,1279,1300,1400,1500,1530,1600,1650,1700,1715]
};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const unique=a=>[...new Set(a)].sort();
const counts=(rows,key)=>Object.fromEntries(unique(rows.map(r=>r[key])).map(k=>[k,rows.filter(r=>r[key]===k).length]));
export function runtimeIdentity(root){
 const code=fs.readFileSync(path.join(root,'data-pipeline.js'),'utf8');
 const aliases=code.match(/const NAME_ALIASES = new Map\(\[[\s\S]*?\]\);/)?.[0];
 const functions=code.slice(code.indexOf('export function stableEntityId('),code.indexOf('export function boundaryConfidence(')).replaceAll('export ','');
 const clean=code.match(/export function clean\(value\) \{[\s\S]*?\n\}/)?.[0].replace('export ','');
 if(!aliases||!clean||!functions)throw Error('Runtime identity implementation not found');
 return vm.runInNewContext(aliases+'\n'+clean+'\n'+functions+'\nstableEntityId');
}
export function buildBackwardExport(root=process.cwd(),cache=path.join(os.tmpdir(),'atlas-pinned-da7a4b735ecef70aebdc9c73e409d8a2500d50f3')){
 const before=productionHashes(root),readRepo=p=>read(path.join(root,p));
 const census=readRepo('exports/backward-timeline-census/occurrences.json');
 const sources=readRepo('exports/backward-timeline-census/sources.json');
 const categories=readRepo('exports/dossier-workload/summary.json').categories;
 if(categories.length!==15||!categories.includes('religion')||categories.includes('density'))throw Error('Canonical 15-category contract changed');
 const stableId=runtimeIdentity(root),loaded=new Map(),groups=new Map();
 for(const name of Object.keys(cohort)){
  const years=unique(census.filter(r=>r.raw_NAME===name).map(r=>r.snapshot_year)).sort((a,b)=>a-b);
  if(JSON.stringify(years)!==JSON.stringify(cohort[name]))throw Error('Unexpected snapshot selection: '+name);
 }
 for(const r of census.filter(r=>Object.hasOwn(cohort,r.raw_NAME))){
  const source=sources.find(s=>s.year===r.snapshot_year&&s.file===r.source_file);
  if(!source)throw Error('Missing pinned source');
  if(!loaded.has(source.file)){
   const bytes=fs.readFileSync(path.join(cache,source.file));
   if(hash(bytes)!==source.sha256)throw Error('Cached geometry fingerprint mismatch: '+source.file);
   loaded.set(source.file,JSON.parse(bytes));
  }
  const raw=loaded.get(source.file).features[r.source_feature_index]?.properties;
  if(!raw||raw.NAME!==r.raw_NAME)throw Error('Census/source feature mismatch');
  const display=String(raw.display_name??raw.NAME??raw.name??raw.SUBJECTO??'').trim();
  const id=String(raw.stable_id??'').trim()||stableId(display);
  const key=id+'/'+r.snapshot_year;
  if(groups.has(key)&&groups.get(key).raw_map_name!==r.raw_NAME)throw Error('Cohort map identity collision');
  if(!groups.has(key))groups.set(key,{occurrence_id:'backward-cohort-01/'+key,snapshot_year:r.snapshot_year,display_year:r.display_year,raw_map_name:r.raw_NAME,map_display_name:display,map_stable_id:id,source_geojson:r.source_file,source_commit:r.source_commit,source_sha256:source.sha256,raw_SUBJECTO:[],raw_PARTOF:[],source_feature_indices:[],census_occurrence_ids:[],polygon_count:0});
  const g=groups.get(key);g.raw_SUBJECTO.push(r.raw_SUBJECTO);g.raw_PARTOF.push(r.raw_PARTOF);g.source_feature_indices.push(r.source_feature_index);g.census_occurrence_ids.push(r.occurrence_id);g.polygon_count+=r.polygon_count;
 }
 const occurrences=[...groups.values()].sort((a,b)=>a.raw_map_name.localeCompare(b.raw_map_name,'en')||a.snapshot_year-b.snapshot_year);
 if(occurrences.length!==92)throw Error('Expected 92 unique map occurrences');
 const metadata=createMetadataIndex(readRepo('data/historical-entities.json'),readRepo('data/historical-sources.json'));
 const rich=createRichDossierIndex(readRepo('data/comprehensive-dossiers.json'));
 const registry=new Map([...metadata.registry,...rich.registry]);
 const fingerprint=productionFingerprint(root),rows=[];
 for(const o of occurrences){
  o.raw_SUBJECTO=unique(o.raw_SUBJECTO);o.raw_PARTOF=unique(o.raw_PARTOF);o.feature_count=o.source_feature_indices.length;
  const resolved=metadata.resolve(o.map_stable_id,o.snapshot_year);
  const records=resolved.entity?resolveDossierRecords(resolved,rich,o.snapshot_year,registry,{mappings:resolved.mappings||[]}):[];
  o.atlas_entity_id=resolved.entity?.id||'';o.mapping_status=resolved.ambiguous?'ambiguous':resolved.entity?'dated-mapping':'no-accepted-dated-mapping';
  for(const category of categories){
   const evidence=records.filter(r=>category==='religion'?r.category==='religion'||r.metric==='religion'||r.metric==='religious-institutional-framework':category==='historical-context-status'?r.legacyField==='politicalStatus':r.category===category);
   for(const r of evidence)if((r.sourceIds||[]).some(id=>!registry.has(id)))throw Error('Unresolved evidence source');
   const status=resolved.ambiguous?'HELD':evidence.length?(evidence.some(r=>fullYear(r,o.snapshot_year))?'SUPPORTED':'PARTIAL'):'MISSING';
   rows.push({...o,cell_id:o.occurrence_id+'/'+category,dossier_category:category,current_status:status,current_evidence:evidence,source_ids:unique(evidence.flatMap(r=>r.sourceIds||[])),research_priority:'A',identity_review_required:!resolved.entity,eligibility_classification:'user-selected-polity-review-cohort',notes:'Raw map identity is a research target, not accepted historical identity. Preserve snapshot-specific territory and source precision; no continuity or succession inferred.',production_fingerprint:fingerprint,proposals_json:''});
  }
 }
 if(JSON.stringify(before)!==JSON.stringify(productionHashes(root)))throw Error('Production mutation detected');
 const summary={schemaVersion:1,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),production_fingerprint:fingerprint,occurrences:occurrences.length,cells:rows.length,categories,statuses:counts(rows,'current_status'),cells_by_category:counts(rows,'dossier_category'),cells_by_polity:counts(rows,'raw_map_name'),occurrences_by_polity:counts(occurrences,'raw_map_name'),occurrences_by_snapshot:counts(occurrences,'snapshot_year'),cells_by_snapshot:counts(rows,'snapshot_year'),production_hashes:before,census_sha256:hash(fs.readFileSync(path.join(root,'exports/backward-timeline-census/occurrences.json')))};
 return {summary,occurrences,rows};
}
export function writeBackwardExport(root=process.cwd(),cache){
 const before=productionHashes(root),old=hash(fs.readFileSync(path.join(root,'exports/dossier-workload/MASTER.csv')));
 const result=buildBackwardExport(root,cache),out=path.join(root,'exports/backward-dossier-workload/cohort-01');fs.mkdirSync(out,{recursive:true});
 const save=(file,obj)=>fs.writeFileSync(path.join(out,file),JSON.stringify(obj,null,2)+'\n','utf8');
 save('MASTER.json',{metadata:result.summary,cells:result.rows});save('summary.json',result.summary);save('entity-snapshot-index.json',result.occurrences);
 const columns=Object.keys(result.rows[0]);fs.writeFileSync(path.join(out,'MASTER.csv'),csv(result.rows,columns),'utf8');fs.writeFileSync(path.join(out,'MISSING-ONLY.csv'),csv(result.rows.filter(r=>['MISSING','PARTIAL'].includes(r.current_status)),columns),'utf8');
 fs.writeFileSync(path.join(out,'README.md'),`# Backward dossier research cohort 01\n\nThis is an offline projection of eight explicitly selected raw map names, 92 unique map-identity × snapshot occurrences and 15 existing canonical categories. Multiple source features share one occurrence. Raw names, SUBJECTO, PARTOF and recurrence are not accepted historical evidence. No new identity mappings or facts were created.\n\nMASTER.json is the lossless matrix; MASTER.csv is the same matrix; MISSING-ONLY.csv selects MISSING/PARTIAL; entity-snapshot-index.json preserves the grouped source features; summary.json records counts, provenance and production hashes; validation.json records read-only checks.\n\n## Columns\n${columns.map(c=>'- '+c).join('\n')}\n\ncell_id is the immutable occurrence/category key; occurrence_id preserves map stable ID and snapshot; atlas_entity_id is blank unless an accepted dated mapping exists. Map IDs use the actual runtime identity implementation, including its Unicode slug behaviour. source_feature_indices and census_occurrence_ids preserve all constituent features; polygon_count and feature_count describe grouping. raw_SUBJECTO/raw_PARTOF are distinct raw source values, not inferred relationships. current_evidence contains only runtime-resolved accepted records for this year; source_ids reference existing provenance. production_fingerprint guards against stale integration. All priorities are A because this cohort was explicitly selected; this is not a new historical ranking.\n\n## Status and return contract\nSUPPORTED means dated accepted evidence covers the category operationally, not exhaustive research. PARTIAL means applicable evidence does not establish full-year coverage. MISSING means no applicable accepted evidence; it does not establish uncertainty or non-applicability. HELD means unresolved mapping/evidence. NOT_APPLICABLE requires evidence and explicit review and is never inferred from missing data.\n\nReturn the CSV with all columns unchanged except proposals_json (a JSON array). Preserve cell IDs, map IDs, source feature metadata, dates and fingerprints. Proposals must identify category, value or evidence-backed resolution, actual observation date or sourced validity interval, precision/certainty, territorial scope, source title/provider/URL/identifier, evidence note, mapping rationale and researcher provenance. Preserve concurrent capitals/currencies and office roles. A result may explicitly propose not-applicable or structurally-inappropriate, with documentary rationale: no permanent capital, no separate head of government, or incompatible statistical scope must not be replaced by invented values. Source metadata alone is not proof.\n\nA blank atlas_entity_id is intentional: external research must establish the snapshot identity before integration. Do not copy modern mappings backwards. Returned proposals remain untrusted and require existing schema, chronology, mapping, scope, conflict, fingerprint and independent-source-review validation, followed by serial integration. Changing current_status does not accept a claim. This export does not authorize automatic production writes.\n\n## Reproduction\nRun node scripts/export-backward-dossier-workload.mjs with the existing pinned GeoJSON cache in the system temporary directory. No network request is made. Cached bytes must match census source SHA-256 hashes. The old 1800–1960 workload and all production data remain unchanged.\n`,'utf8');
 if(JSON.stringify(before)!==JSON.stringify(productionHashes(root))||old!==hash(fs.readFileSync(path.join(root,'exports/dossier-workload/MASTER.csv'))))throw Error('Protected files changed');
 save('validation.json',{passed:true,uniqueOccurrences:92,uniqueCells:new Set(result.rows.map(r=>r.cell_id)).size,exactRequestedSnapshotCoverage:true,pinnedSourceHashesVerified:true,runtimeStableIdsVerified:true,productionUnchanged:true,oldWorkloadUnchanged:true,noResearch:true});
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')))console.log(JSON.stringify(writeBackwardExport().summary,null,2));
