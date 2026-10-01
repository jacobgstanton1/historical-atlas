import {createMetadataIndex,validInYear} from '../historical-metadata.js';
const pct=(n,d)=>d?Number((100*n/d).toFixed(2)):0;
const unique=values=>[...new Set(values)].sort();
const core=['names','politicalStatus','capitals','governments','leaders','currencies','descriptions'];
export function buildCoverage(snapshots,database,sources,plan){
 const metadata=createMetadataIndex(database,sources),rows=new Map(),questions=[];
 const years=snapshots.map(s=>s.year);
 const knownEntities=new Set(database.entities.map(e=>e.id));
 const question=(id,type,ids,text,evidence={})=>{ids=unique(ids.filter(x=>rows.has(x)));if(ids.length)questions.push({id,type,state:'unresolved',mapIds:ids,question:text,evidence});};
 for(const snapshot of snapshots)for(const f of snapshot.features){
  const p=f.properties,id=p._stableId;if(!id)throw Error('Prepared feature without a stable ID');
  let row=rows.get(id);
  if(!row){row={stableMapId:id,displayName:p._name,sourceNames:[],snapshotYears:[],sourceRelations:[],occurrences:[],planningPoints:[]};rows.set(id,row);}
  row.sourceNames.push(p._name);row.snapshotYears.push(snapshot.year);
  let occurrence=row.occurrences.find(x=>x.year===snapshot.year);
  if(!occurrence){occurrence={year:snapshot.year,featureCount:0,names:[],sourceRelations:[],largestArea:-1,planningPoint:null};row.occurrences.push(occurrence);}
  occurrence.featureCount++;occurrence.names.push(p._name);
  if(Number(p._area)>occurrence.largestArea){occurrence.largestArea=Number(p._area);occurrence.planningPoint=snapshot.centroids?.get(f.id)||null;}
  for(const field of ['SUBJECTO','PARTOF','authority','part_of'])if(p[field]){
   const r={field,value:String(p[field]),year:snapshot.year};row.sourceRelations.push(r);occurrence.sourceRelations.push(r);
  }
 }
 for(const row of rows.values()){
  row.sourceNames=unique(row.sourceNames);row.alternativeSourceNames=row.sourceNames.filter(x=>x!==row.displayName);row.snapshotYears=unique(row.snapshotYears).map(Number).sort((a,b)=>a-b);
  row.firstAvailableSnapshot=row.snapshotYears[0];row.lastAvailableSnapshot=row.snapshotYears.at(-1);
  row.sourceRelations=[...new Map(row.sourceRelations.map(r=>[JSON.stringify(r),r])).values()];
  row.mappings=database.mappings.filter(m=>m.mapId===row.stableMapId);
  row.curatedEntityIds=unique(row.mappings.filter(m=>knownEntities.has(m.entityId)).map(m=>m.entityId));
  row.snapshotCoverage=row.snapshotYears.map(year=>{
   const r=metadata.resolve(row.stableMapId,year);
   return {year,receivesCuratedDossier:!!r.entity,ambiguous:!!r.ambiguous,entityId:r.entity?.id||null,availableFields:r.entity?core.filter(k=>r[k]?.length):[],missingCoreFields:r.entity?core.filter(k=>!r[k]?.length):core};
  });
  row.currentlyResolvesToDossier=row.snapshotCoverage.some(c=>c.receivesCuratedDossier);
  row.researchStatus=row.curatedEntityIds.length?'existing-enriched':'needs-research';
  row.coverageTier=row.curatedEntityIds.length?'existing-enriched':'none';
  row.researchDecision=plan.reviews?.[row.stableMapId]||null;
  if(row.researchDecision){const r=row.researchDecision;if(!plan.statuses.includes(r.status)||!r.reviewerNote||!r.intervals?.length)throw Error('Incomplete reviewed coverage decision: '+row.stableMapId);
   for(const i of r.intervals)if(!i.sourceIds?.length||i.sourceIds.some(id=>!metadata.registry.has(id)))throw Error('Review interval source missing: '+row.stableMapId);
   if(!Object.hasOwn(plan.tiers,r.tier)||['core-complete','enriched'].includes(r.status)&&(!row.curatedEntityIds.length||r.tier!==(r.status==='core-complete'?'core':'enriched')))throw Error('Accepted tier requires a mapped curated entity and consistent tier: '+row.stableMapId);
   if(r.intervals.some(i=>!i.validFrom||!/^\d{4}(-\d{2})?(-\d{2})?$/.test(i.validFrom)))throw Error('Reviewed interval requires a precise-as-sourced start: '+row.stableMapId);
   row.researchStatus=r.status;row.coverageTier=r.tier;
  }
  row.occurrences=row.occurrences.map(o=>({year:o.year,featureCount:o.featureCount,names:unique(o.names),planningPoint:o.planningPoint}));
 }
 const nameLookup=new Map();for(const r of rows.values())for(const name of r.sourceNames)nameLookup.set(name,r.stableMapId);
 for(const family of plan.families){const ids=unique(family.names.map(n=>nameLookup.get(n)).filter(Boolean));question('family-'+family.id,'candidate-family',ids,family.question,{sourceNames:family.names.filter(n=>nameLookup.has(n))});
  for(const id of ids){const r=rows.get(id);r.planningFamily=family.id;r.planningRegion=family.region;}
 }
 const gaps=[],multipleNames=[],authority=[],repeated=[],indigenous=[];
 for(const r of rows.values()){
  if(r.sourceNames.length>1)multipleNames.push(r.stableMapId);
  if(r.snapshotYears.length>1)repeated.push(r.stableMapId);
  const between=years.filter(y=>y>=r.firstAvailableSnapshot&&y<=r.lastAvailableSnapshot);
  if(between.some(y=>!r.snapshotYears.includes(y))){gaps.push(r.stableMapId);question('gap-'+r.stableMapId,'source-presence-gap',[r.stableMapId],'Does this source gap reflect naming, omission, administrative scope or a historical transition? Absence is not dissolution.',{present:r.snapshotYears,missing:between.filter(y=>!r.snapshotYears.includes(y))});}
  const external=r.sourceRelations.filter(s=>s.value.toLowerCase()!==r.displayName.toLowerCase()&&!r.sourceNames.some(n=>n.toLowerCase()===s.value.toLowerCase()));
  if(external.length){authority.push(r.stableMapId);question('authority-'+r.stableMapId,'authority-grouping',[r.stableMapId],'Determine the historical meaning of the source authority/grouping fields. They do not establish sovereignty, subordination or a constitution.',{sourceRelations:external});}
  for(const c of r.snapshotCoverage){
   const e=database.entities.find(e=>e.id===c.entityId);if(e?.existence&&!validInYear(e.existence,c.year))question('existence-'+r.stableMapId+'-'+c.year,'mapping-date-review',[r.stableMapId],'Runtime mapping resolves outside the sourced existence interval. Review the source label and mapping before extending facts.',{snapshot:c.year,entityId:e.id,existence:e.existence});
  }
  const point=r.occurrences.at(-1).planningPoint;let region=r.planningRegion;
  if(!region&&point){const [x,y]=point;
   region=x<-25?(x>-90&&y<25&&y>5?'caribbean':y<12?'south-america':'north-america'):
    x>110&&y<-10?'australian-communities':
    x>145||x<-140&&y<30?'pacific':
    x>95?(y>25?'east-asia':'southeast-asia'):
    x>65?'south-central-asia':
    y>35?(x<0?'west-north-europe':x<19?'central-europe':'east-europe'):
    x>38&&y>12?'middle-east':
    y>20?'north-africa':
    y<-15?'southern-africa':x<10?'west-africa':x<30?'central-africa':'east-africa';
  }
  // These are scheduling hints only, never identity, sovereignty or succession.
  r.planningRegion=plan.overrides?.[r.stableMapId]||region||'identity-triage';
  if(!plan.regions.some(region=>region.id===r.planningRegion))throw Error('Unknown planning region: '+r.stableMapId);
  if(r.planningRegion==='australian-communities'&&r.firstAvailableSnapshot>1815)r.planningRegion='pacific';
  if(r.planningRegion==='australian-communities')indigenous.push(r.stableMapId);
  if(/unnamed|^Africa$|hunter-gatherers|cultures|shellfish|warlords|khanates|protectorate$/i.test(r.displayName))question('scope-'+r.stableMapId,'identity-scope',[r.stableMapId],'Does this source label represent one political entity, several communities, an administrative area or merely a cartographic grouping? Establish scope before assigning national institutions.',{sourceNames:r.sourceNames});
 }
 question('repeated-name-continuity','continuity-validation',repeated,'A repeated normalized map ID is a source-name key, not evidence of uninterrupted historical political continuity. Research temporal identity before adding intervals.');
 question('source-name-normalization','normalization-review',multipleNames,'Verify whether alternate source spellings/aliases merged into one ID are appropriate. Normalization is not historical identity proof.');
 question('australian-community-scope','community-scope',indigenous,'Establish each source-defined community’s scope and appropriate community-authorised evidence. Do not force national-state offices, currencies, flags or succession chains onto language/people/land labels.');
 const brokenMappings=database.mappings.filter(m=>!rows.has(m.mapId)||!knownEntities.has(m.entityId));
 const orphanEntities=database.entities.filter(e=>!database.mappings.some(m=>m.entityId===e.id&&rows.has(m.mapId))).map(e=>e.id);
 const ambiguousMappings=[];
 for(const r of rows.values())for(let year=years[0];year<=years.at(-1);year++)if(metadata.resolve(r.stableMapId,year).ambiguous)ambiguousMappings.push({mapId:r.stableMapId,requestedYear:year});
 for(const r of rows.values()){
  r.questionIds=questions.filter(q=>q.mapIds.includes(r.stableMapId)).map(q=>q.id);
  r.continuity={state:'unresolved',candidateMapIds:unique(questions.filter(q=>q.type==='candidate-family'&&q.mapIds.includes(r.stableMapId)).flatMap(q=>q.mapIds).filter(id=>id!==r.stableMapId)),note:'Planning candidates only; no continuation or succession has been established by this audit.'};
  if(r.researchDecision)r.continuity={...r.continuity,state:'reviewed-with-dated-decisions',note:r.researchDecision.identityResolution,intervals:r.researchDecision.intervals,omissions:r.researchDecision.omissions};
  if(!r.researchDecision&&r.questionIds.length)r.researchStatus=r.questionIds.some(id=>id.startsWith('existence-'))?'mapping-review':r.curatedEntityIds.length?'existing-enriched':'identity-review';
 }
 const bySnapshot=years.map(year=>{
  const present=[...rows.values()].filter(r=>r.snapshotYears.includes(year)),covered=present.filter(r=>r.snapshotCoverage.find(c=>c.year===year).receivesCuratedDossier).length;
  return {year,selectableIdentities:present.length,covered,uncovered:present.length-covered,percentage:pct(covered,present.length)};
 });
 const identities=[...rows.values()].sort((a,b)=>a.stableMapId.localeCompare(b.stableMapId));
 const batches=[];
 for(const region of plan.regions){
  const group=identities.filter(r=>r.planningRegion===region.id).sort((a,b)=>(a.planningFamily||'zzz').localeCompare(b.planningFamily||'zzz')||((a.occurrences.at(-1).planningPoint?.[1]||0)-(b.occurrences.at(-1).planningPoint?.[1]||0))||a.stableMapId.localeCompare(b.stableMapId));
  const chunkCount=Math.ceil(group.length/region.limit);const chunks=[];
  let offset=0;for(let i=0;i<chunkCount;i++){const size=Math.ceil((group.length-offset)/(chunkCount-i));chunks.push(group.slice(offset,offset+size));offset+=size;}
  for(const members of chunks){
   const ids=members.map(r=>r.stableMapId),needs=members.filter(r=>r.curatedEntityIds.length===0).length;
   const q=questions.filter(q=>q.mapIds.some(id=>ids.includes(id)));
   const b={id:'batch-'+String(batches.length+1).padStart(2,'0'),order:batches.length+1,title:region.name+' · '+(chunks.indexOf(members)+1)+'/'+chunks.length,mapIds:ids,totalIdentities:ids.length,uncuratedIdentities:needs,existingProfilesToReview:ids.length-needs,requiresHistoricalResearch:ids.length,sourceStrategy:region.sources,questionIds:q.map(q=>q.id),difficultCases:q.filter(x=>x.type==='candidate-family'||x.type==='mapping-date-review'||x.type==='identity-scope').map(x=>({id:x.id,question:x.question})),continuityPolicy:'Keep candidate families together across linked batches; share institutional discovery, never unsupported facts. Phase 2 approval required.'};batches.push(b);
   for(const row of members)row.batchId=b.id;
  }
 }
 for(const q of questions)q.linkedBatchIds=unique(q.mapIds.map(id=>rows.get(id).batchId));
 const covered=identities.filter(r=>r.currentlyResolvesToDossier).length;
 return {schemaVersion:1,purpose:'v0.7 Phase 1 development-only inventory; no historical facts or production mappings are generated.',coverageDefinition:'Covered means the existing production resolver returns a curated entity in at least one snapshot where this map ID is selectable. It does not mean core completeness or coverage throughout 1800–1960. All other IDs still have map-derived fallback panels.',summary:{totalIdentities:identities.length,curatedMetadataEntities:database.entities.length,mappedIdentities:identities.filter(r=>r.curatedEntityIds.length).length,coveredIdentities:covered,uncoveredIdentities:identities.length-covered,percentage:pct(covered,identities.length),multipleSnapshotIdentities:repeated.length,singleSnapshotIdentities:identities.length-repeated.length,unresolvedQuestions:questions.length,identitiesWithQuestions:identities.filter(r=>r.questionIds.length).length,brokenMappings:brokenMappings.length,orphanMetadataEntities:orphanEntities.length,ambiguousMappingYearPairs:ambiguousMappings.length},bySnapshot,brokenMappings,orphanMetadataEntities:orphanEntities,ambiguousMappings,questions,batches,identities};
}
export function reportMarkdown(m,lock){
 const s=m.summary;let text='# v0.7 Phase 1 — dossier coverage inventory\n\nGenerated by node scripts/coverage.mjs. Development audit only; visible site remains v0.6.1. Reviewed batches and their states are listed in the current Phase 2 plan.\n\n'+m.coverageDefinition+'\n\n';
 text+='## Totals\n\n| Measure | Count |\n| --- | ---: |\n';
 for(const [key,value]of Object.entries(s))text+='| '+key+' | '+value+' |\n';
 text+='\nThe denominator includes selectable unlabeled/composite/community identities, not just countries or visible labels. “First/last snapshot” are observations of source presence, never existence dates. Source geometry, metadata and requested-year resolution remain separate.\n\n## Every configured snapshot\n\n| Snapshot | Selectable IDs | Curated dossier | Fallback only | Coverage |\n| --- | ---: | ---: | ---: | ---: |\n';
 for(const r of m.bySnapshot)text+='| '+[r.year,r.selectableIdentities,r.covered,r.uncovered,r.percentage+'%'].join(' | ')+' |\n';
 text+='\n## Persistent and briefly represented identities\n\n“Briefly” means one available snapshot, not a short-lived historical entity.\n\n';
 text+='- Most frequent: '+m.identities.filter(r=>r.snapshotYears.length>=9).map(r=>r.displayName+' ('+r.snapshotYears.length+')').join('; ')+'.\n';
 text+='- '+s.singleSnapshotIdentities+' singleton IDs and '+s.multipleSnapshotIdentities+' IDs in multiple snapshots. Full names/years are in manifest.json.\n';
 text+='\n<details><summary>All '+s.singleSnapshotIdentities+' single-snapshot identities</summary>\n\n';
 for(const r of m.identities.filter(r=>r.snapshotYears.length===1))text+='- '+r.displayName+' — '+r.snapshotYears[0]+' ('+r.stableMapId+').\n';
 text+='\n</details>\n';
 text+='\n## Unresolved identity and mapping questions\n\n'+s.unresolvedQuestions+' explicitly unresolved question records affect '+s.identitiesWithQuestions+' identities. Shared methodological questions may cover many IDs; this is a tracked checklist count, not a count of proven historical errors. Automated flags are discovery cues, not historical conclusions.\n\n';
 for(const q of m.questions.filter(q=>q.type==='candidate-family'||q.type==='mapping-date-review'||q.type==='identity-scope'))text+='- **'+q.id+'**: '+q.question+' Source IDs: '+q.mapIds.join(', ')+'. Linked batches: '+q.linkedBatchIds.join(', ')+'.\n';
 text+='\nOther questions track source-presence gaps, changing authority/grouping, normalization and repeated-name continuity. Legacy heuristic questions retain state=unresolved for audit traceability; sourced identity decisions and omissions are separately attached to reviewed rows. SUBJECTO/PARTOF are preserved as source evidence and never converted into sovereignty. See manifest.json for the complete question list and per-ID evidence.\n\n';
 text+='## Recommended research batches (not performed)\n\nBatches partition all '+s.totalIdentities+' IDs once. Uncurated counts sum to '+s.uncoveredIdentities+'; existing profiles may still require additional periods/identity review. Counts measure map IDs, not a claim that each is one state. A compound label may require several historical records. Geography is a planning hint from the largest prepared feature; manual overrides/candidate families improve it, but it is not historical evidence. Australian community batches are smaller and have a distinct institutional review approach.\n\n';
 for(const b of m.batches){
 text+='### '+b.id+' — '+b.title+'\n\n'+b.totalIdentities+' identities; '+b.uncuratedIdentities+' uncurated; '+b.existingProfilesToReview+' already mapped. '+b.requiresHistoricalResearch+' require some research/review before acceptance.\n\n'+b.sourceStrategy+'\n\n';
 text+='Included: '+b.mapIds.map(id=>m.identities.find(r=>r.stableMapId===id).displayName+' ('+id+')').join('; ')+'.\n\n';
 if(b.difficultCases.length)text+='Difficult cases: '+unique(b.difficultCases.map(c=>c.question)).join(' ')+'\n\n';
 text+='Continuity: '+b.continuityPolicy+' '+b.questionIds.length+' tracked questions touch this batch; complete links are in manifest.json.\n\n';
 }
 text+='## Coverage architecture and acceptance\n\nKeep the existing schema-1 knowledge files and cached production index. The reviewed dataset retains the two-file static architecture; Batch 01 data and audit are documented in BATCH-01.md. Add records in reviewed batches; keep source IDs globally unique, explicit dated mappings and separate map geometry. If file size/merge conflicts become measurable problems later, author regional files and compile the same two static production JSON files; do not fetch hundreds of files on clicks or introduce a backend.\n\nCore acceptance requires documented historical identity/name, existence/status, capital, government, appropriate leadership, currency, dated overview and provenance where evidence exists. Enrichment can add dated/scoped population, licensed flags/standards, legislature, party/dynasty, explicit transitions, further overviews and events. Evidence-based omissions are acceptable. A nonempty name is not completion. research-plan.json defines statuses, review decisions and acceptance categories; explicit reviewer notes and dated source-backed intervals are required to accept a tier. The seven existing-enriched references remain temporally partial, not globally complete.\n\nPreserve observation dates/scopes, no interpolation/future statistics, actual offices, source date precision, no modern substitutions, unsupported GDP/area or geometric sovereignty/succession, and historical asset licensing. An office standard is not a national flag.\n\nRequested year selects historical facts; exact/nearest snapshot selects geometry. The 1939/1938 case remains unchanged. Snapshot coverage above uses each snapshot’s own year; it does not imply continuous requested-year coverage between snapshots.\n\n## Inputs and reproducibility\n\nUpstream revision: '+lock.upstreamRevision+'. Every locked GeoJSON has an origin, pinned URL and SHA-256; current production CDN responses were compared when pinning. Original geometry is cached outside the repository, not copied into the public knowledge layer. Recalculation uses actual prepareCollection/stableEntityId logic from data-pipeline.js and actual createMetadataIndex/validInYear from historical-metadata.js. Production dependencies are imported from their pinned versions into the Node audit.\n\nRun **node scripts/coverage.mjs** to regenerate lock-backed manifest.json and this report. Run **node scripts/coverage.mjs --check** to recalculate and fail on stale generated output. **--refresh-inputs** explicitly repins mutable upstream inputs; review the resulting diff. Network is needed only on a cache miss/refresh. Failed or hash-mismatched inputs abort without partial report writes.\n\nThe development manifest is generated: edit research-plan.json for planning/review decisions, not generated totals. Future reviewed batches update the curated metadata, then regenerate. No production code imports the audit files.\n\nLimitations: snapshot dates are sparse, source names may be anachronistic or corrupt, largest-piece geography can mislead for empires/disconnected pieces, and automatic flags cannot establish historical truth. Historical research applies only to reviewed batches and their documented intervals. Reviewed decisions apply only to their documented intervals; remaining candidates are unresearched.\n';
 return text;
}
