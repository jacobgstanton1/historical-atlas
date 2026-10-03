// Snapshot identity/flagship QA. Geometry measures visibility, never sovereignty.
import fs from 'node:fs';
import {productionPipeline} from './coverage-inputs.mjs';
import {readJSON,saveJSON,isCLI,digest} from './research-common.mjs';
import {readSnapshotConfig} from './research-snapshot-scan.mjs';
import {createMetadataIndex,validInYear} from '../historical-metadata.js';
import {createRichDossierIndex} from '../rich-dossier.js';
import {resolveDossierRecords} from '../dossier.js';
import {entityTitle} from '../dossier-presentation.js';

export const flagshipCore=['identity','political-institutional','leadership','capital','currency','relationships-or-status','overview'];
const basicCore=['identity','political-institutional','leadership','capital'];
const family=/russia|soviet|ussr|united kingdom|great britain|france|united states|qing|china|chinese|ottoman|turkey|austria|habsburg|prussia|germany|german empire|italy|spain|portugal|japan|british india|east india|maratha|mughal|sikh|persia|iran|brazil|mexico/i;
const generic=/warlord|unclaimed|unoccupied|unknown|unnamed|tribes|aboriginal|indigenous|native peoples|sphere of influence/i;
export function sparsity(row){
 const cells=row.categories;
 const supported=c=>cells[c]?.status==='supported';
 const core=basicCore.filter(supported).length;
 const substantive=Object.entries(cells).filter(([c,s])=>s.status==='supported'&&!['identity','area-statistics'].includes(c)).length;
 return{coreSupported:core,substantiveSupported:substantive,zeroSubstantive:substantive===0,onlyIdentity:core===1&&supported('identity')&&substantive===0};
}
export function minimumMissing(records){
 const fields=new Set(records.map(r=>r.category));
 const status=records.some(r=>r.category==='political-institutional'&&(r.legacyField==='politicalStatus'||['political-status','historical-status','occupation-status','recognition-status'].includes(r.metric)));
 return flagshipCore.filter(c=>c==='relationships-or-status'?!fields.has('relationships')&&!status:!fields.has(c));
}
export async function snapshotQA({output='research/snapshot-qa-01',name='baseline'}={}){
 const db=readJSON('data/historical-entities.json'),sources=readJSON('data/historical-sources.json'),store=readJSON('data/comprehensive-dossiers.json'),matrix=readJSON('research/completion-01/reports/completion.json'),manifest=readJSON('development/coverage/manifest.json');
 const metadata=createMetadataIndex(db,sources),rich=createRichDossierIndex(store),registry=new Map([...metadata.registry,...rich.registry]);
 const classes=new Map(manifest.identities.map(i=>[i.stableMapId,i.classification?.classification]));
 const {pipeline}=await productionPipeline(),occurrences=[];
 for(const s of readSnapshotConfig()){
  const file=`research/completion-02/area/cache/${s.file}`,raw=readJSON(file),prepared=pipeline.prepareCollection(raw,s.year),groups=new Map();
  for(const f of prepared.features){const id=f.properties._stableId,g=groups.get(id)||{id,features:[],area:0};g.features.push(f);g.area+=f.properties._area;groups.set(id,g);}
  const ranked=[...groups.values()].filter(g=>!['community-people','geographic-or-composite'].includes(classes.get(g.id))).sort((a,b)=>b.area-a.area),top=new Set(ranked.slice(0,10).map(g=>g.id));
  for(const g of groups.values()){
   const rawNames=[...new Set(g.features.map(f=>f.properties.NAME||f.properties.name||f.properties.display_name))],p=g.features[0].properties,r=metadata.resolve(g.id,s.year),records=r.entity?resolveDossierRecords(r,rich,s.year,registry,{mappings:r.mappings||[]}):[],canonical=entityTitle(r,records,p._name).text;
   const supplied=(r.mappings||[]).find(m=>m.displayName&&m.sourceIds?.length)?.displayName;
   const display=supplied||p._name,issues=[];
   if(r.entity&&!validInYear(r.entity.existence||{},s.year))issues.push({type:'outside-existence',severity:'blocking'});
   if(!r.entity&&!['community-people','geographic-or-composite'].includes(classes.get(g.id)))issues.push({type:'canonical-identity-unresolved',severity:top.has(g.id)||family.test(rawNames.join(' '))?'high':'review'});
   if(generic.test(rawNames.join(' '))&&!['community-people','geographic-or-composite'].includes(classes.get(g.id))&&!supplied)issues.push({type:'generic-source-label-exposed',severity:'high'});
   if(r.entity&&display!==canonical&&!supplied)issues.push({type:'map-dossier-title-divergence',severity:'review'});
   if(!r.entity&&!r.ambiguous){const candidates=db.mappings.filter(m=>m.mapId===g.id).map(m=>db.entities.find(e=>e.id===m.entityId)).filter(Boolean);if(candidates.some(e=>e.existence?.validFrom&&Number(e.existence.validFrom.slice(0,4))>s.year))issues.push({type:'outside-curated-mapping-interval',severity:'review'});}
   const flagship=!['community-people','geographic-or-composite'].includes(classes.get(g.id))&&(top.has(g.id)||family.test(rawNames.join(' '))),missing=minimumMissing(records);
   occurrences.push({snapshotYear:s.year,stableMapId:g.id,rawNames,displayName:display,canonicalTitle:canonical,canonicalEntityId:r.entity?.id||null,dossierEntityId:r.entity?.id||null,entityExistence:r.entity?.existence||null,mappingIntervals:r.mappings||[],classification:classes.get(g.id)||'unresolved',mappedAreaSteradians:g.area,visibilityRank:ranked.findIndex(x=>x.id===g.id)+1,flagship,flagshipMinimumMissing:missing,issues,sourceFile:file,sourceHash:digest(raw),recordCount:records.length,coreCategoriesPresent:basicCore.filter(c=>records.some(r=>r.category===c)).length});
  }
 }
 const distributions={zeroSubstantive:0,onlyIdentity:0,core0:0,core1:0,core2:0,core3:0,core4plus:0};for(const row of matrix.rows){const s=sparsity(row);distributions.zeroSubstantive+=s.zeroSubstantive;distributions.onlyIdentity+=s.onlyIdentity;distributions[s.coreSupported>=4?'core4plus':'core'+s.coreSupported]++;}
 const matrixSparse=matrix.rows.map(r=>({...sparsity(r),entityId:r.entityId,snapshotYear:r.snapshotYear,name:r.name}));
 const worst=occurrences.filter(o=>o.flagship&&o.flagshipMinimumMissing.length).sort((a,b)=>a.coreCategoriesPresent-b.coreCategoriesPresent||b.mappedAreaSteradians-a.mappedAreaSteradians||a.snapshotYear-b.snapshotYear);
 const anomalyTypes=Object.fromEntries([...new Set(occurrences.flatMap(o=>o.issues.map(i=>i.type)))].map(t=>[t,occurrences.filter(o=>o.issues.some(i=>i.type===t)).length]));
 const result={schemaVersion:1,stage:name,scope:'All selectable raw identities at all11 snapshots, plus resolved matrix sparsity. Review signals are not all confirmed historical errors.',policy:{flagship:'Top10 mapped-area identities per snapshot excluding community identities, plus explicit major historical families; internal QA only.',minimum:flagshipCore,empty:'No supported substantive historical category; identity and derived mapped area do not prevent an empty flag.',nearEmpty:'At most one of four basic core categories supported; not every signal is a confirmed defect.',geometry:'Area/rank are prioritisation only, never evidence of polity identity, control or succession.'},metrics:{selectableOccurrences:occurrences.length,identityAnomalyOccurrences:occurrences.filter(o=>o.issues.length).length,anomalyTypes,flagshipOccurrences:occurrences.filter(o=>o.flagship).length,flagshipBelowMinimum:worst.length,matrixDossiers:matrix.rows.length,sparsity:distributions,nearEmptyMatrixDossiers:distributions.core0+distributions.core1,unresolvedRawFlagships:worst.filter(o=>!o.canonicalEntityId).length},matrixSparse,worstFlagships:worst,occurrences};
 saveJSON(output+'/'+name+'.json',result);return result;
}
if(isCLI(import.meta.url)){const r=await snapshotQA({name:process.argv[2]||'baseline'});console.log(JSON.stringify(r.metrics));console.log(JSON.stringify(r.worstFlagships.slice(0,12).map(o=>({name:o.displayName,year:o.snapshotYear,core:o.coreCategoriesPresent,missing:o.flagshipMinimumMissing}))));}
