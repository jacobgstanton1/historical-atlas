import {reportMarkdown} from './coverage-model.mjs';

const unique=values=>[...new Set(values)].sort();
const percent=(n,d)=>d?Number((100*n/d).toFixed(2)):0;
export const CATEGORIES=['political-polity','dependent-administration','community-people','geographic-or-composite','name-variant-or-duplicate','unresolved'];
const eligible=c=>['political-polity','dependent-administration'].includes(c);
export function classifyCoverage(m,config,rawPlan){
 const rows=m.identities,byId=new Map(rows.map(r=>[r.stableMapId,r]));
 const ids=Object.keys(config.decisions);
 if(!Number.isInteger(config.phase2.limit)||config.phase2.limit<15||config.phase2.limit>30)throw Error('Phase 2 target size must be 15–30.');
 if(new Set(config.phase2.regionOrder).size!==config.phase2.regionOrder.length)throw Error('Duplicate Phase 2 regions.');
 if(ids.length!==rows.length||ids.some(id=>!byId.has(id)))throw Error('Classification decisions must match the complete raw inventory exactly.');
 for(const r of rows){
  delete r.phase2BatchId;
  const d=config.decisions[r.stableMapId];
  if(!d||!CATEGORIES.includes(d.classification)||!['high','medium','low'].includes(d.confidence)||!['provisional-source-classification','classification-review-required'].includes(d.status)||typeof d.historicalReviewRequired!=='boolean'||!d.rationale||!d.evidence?.length||d.evidence.some(e=>!config.evidenceRegistry[e]))throw Error('Invalid classification decision: '+r.stableMapId);
  if(d.candidateCanonicalIdentity?.mapId&&!byId.has(d.candidateCanonicalIdentity.mapId))throw Error('Unknown canonical candidate: '+r.stableMapId);
  if(d.classification==='name-variant-or-duplicate'&&!d.candidateCanonicalIdentity)throw Error('Variant requires canonical candidate: '+r.stableMapId);
  if(d.candidateCanonicalIdentity&&(!d.candidateCanonicalIdentity.label||d.candidateCanonicalIdentity.status!=='requires-evidence'))throw Error('Canonical candidate must retain a label and evidence-review status: '+r.stableMapId);
  if(d.candidateCanonicalIdentity?.mapId===r.stableMapId)throw Error('Canonical candidate cannot be itself: '+r.stableMapId);
  r.classification={...d};
  r.dossierEligibility=eligible(d.classification)?'political-candidate':d.classification==='community-people'?'specialised-profile-deferred':d.classification==='geographic-or-composite'?'not-currently-eligible':'review-required';
  r.classificationQuestion=(['unresolved','name-variant-or-duplicate'].includes(d.classification)||d.candidateCanonicalIdentity)?{id:'classification-'+r.stableMapId,state:'unresolved',scope:'identity-specific',question:d.classification==='unresolved'?'What historical referent does this source label represent, and does the political template fit?':'Does the proposed canonical label/identity have supported temporal and administrative equivalence?',reason:d.rationale}:null;
 }
 const totals=present=>Object.fromEntries(CATEGORIES.map(c=>[c,present.filter(r=>r.classification.classification===c).length]));
 const coverage=present=>{
  const candidates=present.filter(r=>eligible(r.classification.classification));
  const covered=candidates.filter(r=>r.currentlyResolvesToDossier).length;
  return {candidates:candidates.length,covered,uncovered:candidates.length-covered,percentage:percent(covered,candidates.length)};
 };
 const overall=coverage(rows);
 const bySnapshot=m.bySnapshot.map(raw=>{
  const present=rows.filter(r=>r.snapshotYears.includes(raw.year));
  const candidates=present.filter(r=>eligible(r.classification.classification));
  const covered=candidates.filter(r=>r.snapshotCoverage.find(c=>c.year===raw.year)?.receivesCuratedDossier).length;
  return {year:raw.year,rawIdentities:present.length,classifications:totals(present),politicalCandidates:candidates.length,politicalCovered:covered,politicalUncovered:candidates.length-covered,politicalPercentage:percent(covered,candidates.length)};
 });
 // Preserve all Phase 1 question records, but distinguish their evidential scope.
 const scopes={};
 for(const q of m.questions){
  q.reviewScope=q.type==='candidate-family'?'family-level-review':['continuity-validation','normalization-review','community-scope'].includes(q.type)?'source-wide-caution':['source-presence-gap','authority-grouping'].includes(q.type)?'identity-attached-source-caution':'identity-specific-review';
  q.evidenceStatus=q.type==='mapping-date-review'?'observed-runtime-date-mismatch':'heuristic-or-scope-review';
  (scopes[q.reviewScope]??=[]).push(q.id);
 }
 const classificationQuestions=rows.filter(r=>r.classificationQuestion).map(r=>({...r.classificationQuestion,mapIds:[r.stableMapId]}));
 const specificMapIds=unique([...classificationQuestions.flatMap(q=>q.mapIds),...m.questions.filter(q=>q.type==='mapping-date-review').flatMap(q=>q.mapIds)]);
 const reviews=rows.filter(r=>r.dossierEligibility==='review-required');
 const variantPolitical=r=>{
  if(r.classification.classification!=='name-variant-or-duplicate')return false;
  const target=byId.get(r.classification.candidateCanonicalIdentity.mapId);
  return !target||eligible(target.classification.classification);
 };
 const selected=rows.filter(r=>eligible(r.classification.classification)||variantPolitical(r));
 const selectedIds=new Set(selected.map(r=>r.stableMapId));
 // Family components are indivisible; union overlapping family/canonical links before batching.
 const parent=new Map(selected.map(r=>[r.stableMapId,r.stableMapId]));
 const find=id=>{let p=parent.get(id);if(p!==id){p=find(p);parent.set(id,p);}return p;};
 const join=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent.set(b,a);};
 for(const q of m.questions.filter(q=>q.type==='candidate-family')){
  const members=q.mapIds.filter(id=>selectedIds.has(id));for(const id of members.slice(1))join(members[0],id);
 }
 for(const r of selected){const target=r.classification.candidateCanonicalIdentity?.mapId;if(selectedIds.has(target))join(r.stableMapId,target);}
 const components=new Map();
 for(const r of selected){const key=find(r.stableMapId);(components.get(key)||components.set(key,[]).get(key)).push(r);}
 const score=group=>group.reduce((n,r)=>n+r.snapshotYears.length+(config.phase2.priorityMapIds.includes(r.stableMapId)?30:0),0);
 const orderedRegions=config.phase2.regionOrder;
 const regionFor=group=>{
  const override=group.map(r=>config.phase2.regionOverrides[r.stableMapId]).find(Boolean);
  return override||group.slice().sort((a,b)=>b.snapshotYears.length-a.snapshotYears.length||a.stableMapId.localeCompare(b.stableMapId))[0].planningRegion;
 };
 for(const id of Object.keys(config.phase2.regionOverrides))if(!byId.has(id)||!orderedRegions.includes(config.phase2.regionOverrides[id]))throw Error('Invalid Phase 2 regional override: '+id);
 for(const id of config.phase2.priorityMapIds)if(!byId.has(id))throw Error('Invalid priority identity: '+id);
 const batches=[];
 for(const regionId of orderedRegions){
  const region=rawPlan.regions.find(r=>r.id===regionId);if(!region)throw Error('Unknown phase2 region: '+regionId);
  const groups=[...components.values()].filter(g=>regionFor(g)===regionId).sort((a,b)=>score(b)-score(a)||a[0].stableMapId.localeCompare(b[0].stableMapId));
  const chunks=[];let current=[];
  for(const g of groups){
   if(g.length>30)throw Error('Oversized continuity family requires an explicit linked review plan.');
   if(current.length&&current.length+g.length>config.phase2.limit){chunks.push(current);current=[];}current.push(...g);
  }
  if(current.length)chunks.push(current);
  // Rebalance a small tail by moving whole components only; never split a family.
  if(chunks.length>1&&chunks.at(-1).length<15){
   const last=chunks.at(-1),prev=chunks.at(-2);
   if(last.length+prev.length<=30){prev.push(...last);chunks.pop();}
   else{
    const roots=unique(prev.map(r=>find(r.stableMapId)));
    for(const root of roots.reverse()){
     const g=prev.filter(r=>find(r.stableMapId)===root);
     if(last.length>=15)break;
     if(prev.length-g.length>=15&&last.length+g.length<=30){last.unshift(...g);for(const r of g)prev.splice(prev.indexOf(r),1);}
    }
   }
  }
  for(const members of chunks){
   const ids=members.map(r=>r.stableMapId);
   const b={id:'political-batch-'+String(batches.length+1).padStart(2,'0'),order:batches.length+1,region:regionId,title:region.name,mapIds:ids,totalIdentities:ids.length,politicalCandidates:members.filter(r=>eligible(r.classification.classification)).length,nameReviews:members.filter(variantPolitical).length,uncoveredPoliticalCandidates:members.filter(r=>eligible(r.classification.classification)&&!r.currentlyResolvesToDossier).length,coveredPoliticalCandidates:members.filter(r=>eligible(r.classification.classification)&&r.currentlyResolvesToDossier).length,sourceStrategy:region.sources,priorityRationale:config.phase2.priorityRationale,highValueMapIds:members.filter(r=>config.phase2.priorityMapIds.includes(r.stableMapId)||r.snapshotYears.length>=9).map(r=>r.stableMapId),familyQuestionIds:m.questions.filter(q=>q.type==='candidate-family'&&q.mapIds.some(id=>ids.includes(id))).map(q=>q.id),classificationPrerequisites:unique(m.questions.filter(q=>q.type==='candidate-family'&&q.mapIds.some(id=>ids.includes(id))).flatMap(q=>q.mapIds.filter(id=>byId.get(id).classification.classification==='unresolved'))),difficultCases:m.questions.filter(q=>['candidate-family','mapping-date-review'].includes(q.type)&&q.mapIds.some(id=>ids.includes(id))).map(q=>({id:q.id,question:q.question})),state:'proposed-not-authorised'};
   batches.push(b);for(const r of members)r.phase2BatchId=b.id;
  }
 }
 if(unique(batches.flatMap(b=>b.mapIds)).length!==selected.length)throw Error('Some political candidates/reviews have no Phase 2 batch.');
 const unresolved=rows.filter(r=>r.classification.classification==='unresolved');
 const reviewQueue=reviews.map(r=>({mapId:r.stableMapId,sourceNames:r.sourceNames,classification:r.classification.classification,candidateCanonicalIdentity:r.classification.candidateCanonicalIdentity||null,planningRegion:config.phase2.regionOverrides[r.stableMapId]||r.planningRegion,familyQuestionIds:m.questions.filter(q=>q.type==='candidate-family'&&q.mapIds.includes(r.stableMapId)).map(q=>q.id),phase2BatchId:r.phase2BatchId||null,route:r.classification.classification==='unresolved'?'classification-gate-before-political-research':variantPolitical(r)?'political-name-review':'specialised-community-name-review'}));
 m.schemaVersion=2;m.purpose='v0.7 Phase 1.5 development-only classification overlay; original raw inventory and Phase 1 batch audit preserved.';
 m.classification={methodology:config.methodology,evidenceRegistry:config.evidenceRegistry,totals:totals(rows),politicalCoverage:overall,nonStateTemplateIdentities:rows.filter(r=>['community-people','geographic-or-composite'].includes(r.classification.classification)).length,bySnapshot,questionAudit:{legacyRecords:m.questions.length,legacyAffectedMapIds:m.summary.identitiesWithQuestions,scopes:Object.fromEntries(Object.entries(scopes).map(([scope,ids])=>[scope,{records:ids.length,questionIds:ids}])),classificationUnresolvedIdentities:unresolved.length,variantReviewIdentities:rows.filter(r=>r.classification.classification==='name-variant-or-duplicate').length,occupationLabelRepairReviews:rows.filter(r=>r.classification.candidateCanonicalIdentity&&r.classification.classification!=='name-variant-or-duplicate').length,classificationQuestions,specificUnresolvedMapIds:specificMapIds,specificUnresolvedIdentityCount:specificMapIds.length,definition:'Specific unresolved cases are unresolved/variant classification decisions, explicit occupation-label repairs and the observed runtime existence-date mismatch, deduplicated by raw ID. These are bounded review tasks, not proven historical mysteries. Gap/authority/repeated-name warnings do not independently establish classification uncertainty.'},reviewQueue,deferredCommunityMapIds:rows.filter(r=>r.classification.classification==='community-people').map(r=>r.stableMapId),australianCommunityMapIds:rows.filter(r=>r.classification.cohort==='australian-source-communities').map(r=>r.stableMapId)};
 m.planningStatus={batches:'archived-phase1-raw-audit-not-the-political-research-plan',phase2Batches:'current-proposed-political-plan-not-authorised',reviewQueue:'classification-and-mapping-gates-not-historical-fact-research'};
 m.phase2Batches=batches;
 return m;
}
export function classificationReport(m){
 const c=m.classification,p=c.politicalCoverage,lookup=new Map(m.identities.map(r=>[r.stableMapId,r]));
 const names=ids=>ids.map(id=>lookup.get(id).displayName+' ('+id+')').join('; ');
 let t='# v0.7 Phase 1.5 — political dossier eligibility\n\nDevelopment-only classification overlay. Visible site remains v0.6.1. No Phase 2 research is performed or authorised.\n\n## Two denominators\n\n';
 t+='Raw selectable identities: **'+m.summary.totalIdentities+'**; raw IDs receiving a curated dossier in at least one present snapshot: **'+m.summary.coveredIdentities+' ('+m.summary.percentage+'%)**; raw fallback-only IDs: **'+m.summary.uncoveredIdentities+'**. The original identity/source/presence/mapping inventory remains intact.\n\n';
 t+='Political dossier candidates: **'+p.candidates+'**; currently covered: **'+p.covered+' ('+p.percentage+'%)**; uncovered political candidates: **'+p.uncovered+'**. Existing curated metadata entities: **'+m.summary.curatedMetadataEntities+'**. Coverage is resolver availability, not completeness throughout 1800–1960. This is a provisional template-eligibility denominator of distinct raw IDs, not a deduplicated count of historical states. It may change after classification/mapping review; no claim of complete political coverage is possible while unresolved cases remain.\n\n';
 t+='| Classification | Raw IDs |\n| --- | ---: |\n';for(const category of CATEGORIES)t+='| '+category+' | '+c.totals[category]+' |\n';
 t+='\n'+c.nonStateTemplateIdentities+' community/geographic IDs are outside automatic political templates. Name reviews and unresolved IDs are not silently counted as missing political dossiers. All decisions remain revisable.\n\n## Classification methodology and limits\n\n'+c.methodology+'\n\nA classification applies to the inventory identity, not every historical period. A political-polity candidate may have colonial/occupation periods; a dependent-administration candidate may later become a polity. Eligibility means the template can be useful, not that sovereignty, constitutions, capitals or other facts are established. Source authority fields are evidence requiring interpretation, never sovereignty findings. No historical institutions or facts are inferred from geometry. Explicit source-label decisions live in classification-plan.json, with confidence, rationale, evidence references and canonical candidates. Generated manifest fields also include unresolved classification questions and current dated mappings.\n\n';
 t+='The [upstream documentation](https://github.com/aourednik/historical-basemaps) describes both countries and cultural regions and cultural PARTOF groupings. [AIATSIS methodology](https://aiatsis.gov.au/explore/map-indigenous-australia) explains language/social/nation labels, approximate boundaries and spelling variation; this is methodological context, not proof that this dataset derives from its map. Accessed 2026-10-01. No mass entity research was needed or performed.\n\n';
 t+='## Classification and political coverage by snapshot\n\n| Year | Raw | Polity | Dependent | Community | Geographic/composite | Variant | Unresolved | Political candidates | Covered | Uncovered | Coverage |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n';
 for(const r of c.bySnapshot)t+='| '+[r.year,r.rawIdentities,...CATEGORIES.map(k=>r.classifications[k]),r.politicalCandidates,r.politicalCovered,r.politicalUncovered,r.politicalPercentage+'%'].join(' | ')+' |\n';
 const australian=m.identities.filter(r=>r.classification.cohort==='australian-source-communities');
 t+='\nThe 1800 denominator is explained by its classification table, not modern-country assumptions. Of the '+australian.length+' explicitly recorded Australian community cohort IDs, '+australian.filter(r=>r.snapshotYears.includes(1800)).length+' appear in 1800. None is counted as an uncovered political dossier or assigned a political research batch. All remain selectable in production. They are deferred to a separately designed, community-appropriate profile project; this says nothing about political significance or organisation.\n\n';
 t+='## What the Phase 1 questions actually mean\n\nThe original **'+c.questionAudit.legacyRecords+' records / '+c.questionAudit.legacyAffectedMapIds+' affected IDs** remain traceable; they do not represent that many independently discovered historical mysteries.\n\n| Review scope | Legacy records |\n| --- | ---: |\n';
 for(const [scope,v]of Object.entries(c.questionAudit.scopes))t+='| '+scope+' | '+v.records+' |\n';
 t+='\nIdentity-attached source cautions are automated gaps/authority-field observations. Source-wide cautions cover repeated names, normalization and the community cohort. Family questions are shared continuity tasks; identity-specific legacy scope flags are also review prompts, not proven classification failures.\n\nThere are **'+c.questionAudit.classificationUnresolvedIdentities+' unresolved classifications**, **'+c.questionAudit.variantReviewIdentities+' variant reviews**, **'+c.questionAudit.occupationLabelRepairReviews+' occupation-label spelling reviews**, and the existing runtime mapping-date mismatch. After deduplicating raw IDs, **'+c.questionAudit.specificUnresolvedIdentityCount+' identity-specific unresolved review cases** remain. '+c.questionAudit.definition+'\n\n';
 t+='## Canonical-name candidates (no merges)\n\n| Source label | Classification | Candidate | Status/reason |\n| --- | --- | --- | --- |\n';
 for(const r of m.identities.filter(r=>r.classification.candidateCanonicalIdentity)){const d=r.classification,k=d.candidateCanonicalIdentity;t+='| '+r.displayName+' | '+d.classification+' | '+k.label+(k.mapId?' ('+k.mapId+')':' (no canonical raw ID)')+' | '+k.status+'; '+d.rationale+' |\n';}
 t+='\nMāori source aliases already normalized by production remain in sourceNames; M?ori remains its own raw ID and a community-name review. It is not equivalent to New Zealand. Occupation labels (Germany France/Soviet/UK/USA; Japan USA; Korea USA/USSR) are dependent-administration candidates. Libyan spelling repairs retain distinct occupation administrations and are not merged into earlier regions or later states. Renamed/regime labels such as Germany, Imperial Japan and Empire of Japan remain separate political candidates with family review, not presumed duplicates.\n\n## Unresolved classification gate\n\nThese cases must establish their referent/template fit before political research eligibility is accepted. They are kept in a separate review queue, not silently discarded or populated with modern facts.\n\n';
 for(const r of m.identities.filter(r=>r.classification.classification==='unresolved'))t+='- '+r.displayName+' ('+r.stableMapId+'), snapshots '+r.snapshotYears.join(', ')+': '+r.classification.rationale+'\n';
 t+='\n## Proposed Phase 2 political research batches (not started)\n\n'+m.phase2Batches.length+' batches partition all '+p.candidates+' political candidates plus '+m.phase2Batches.reduce((n,b)=>n+b.nameReviews,0)+' necessary political naming reviews exactly once. A community encoding review is routed separately. Unresolved family members appear as classification prerequisites; resolve eligibility before collecting dossier facts. The original Phase 1 '+m.batches.length+'-batch raw audit remains in the appendix/manifest.batches for provenance, and is superseded as a political research plan.\n\n'+(m.phase2Batches[0]?.priorityRationale||'No political candidates currently qualify for batching.')+'\n\nFamilies and candidate canonical pairs are indivisible. Batch sizes aim for 15–30; small regional groups remain smaller rather than inventing identities. Snapshot persistence contributes to within-region ordering. Institutional source discovery can be shared, but each dated fact requires its own entity-specific evidence. Source availability expectations are not researched findings.\n\n| Order | Group | IDs incl. reviews | Political candidates | Uncovered | Name reviews |\n| --- | --- | ---: | ---: | ---: | ---: |\n';
 for(const b of m.phase2Batches)t+='| '+[b.order,b.title,b.totalIdentities,b.politicalCandidates,b.uncoveredPoliticalCandidates,b.nameReviews].join(' | ')+' |\n';
 for(const b of m.phase2Batches){
 t+='\n### '+b.id+' — '+b.title+'\n\nIncluded: '+names(b.mapIds)+'.\n\nHigh-value continuing/source-family candidates: '+(b.highValueMapIds.length?names(b.highValueMapIds):'Regional administrations and linked continuity reviews')+'.\n\nShared source discovery: '+b.sourceStrategy+'\n\n';
 if(b.difficultCases.length)t+='Difficult continuity cases: '+b.difficultCases.map(d=>d.question).join(' ')+'\n\n';
 if(b.classificationPrerequisites.length)t+='Classification prerequisites (excluded from this batch denominator): '+names(b.classificationPrerequisites)+'.\n\n';
 }
 t+='## Architecture, maintenance and verification\n\nProduction files, seven profiles, flags, UI and requested-year/geometry model are unchanged. Classification is a development-only overlay; edit classification-plan.json for reviewed eligibility decisions, research-plan.json for existing family/tier review decisions. Neither is fetched by production. Raw inventory generation and input locks remain the same. Core/enriched completion still requires reviewed source-backed intervals, not template eligibility.\n\nRun **node scripts/coverage.mjs** to regenerate the manifest and combined report; **node scripts/coverage.mjs --check** recalculates both classification and raw outputs and rejects drift. Classification inputs and module hashes are recorded. Unknown IDs, missing/invalid decisions, missing evidence and broken canonical references fail rather than falling back to assumed country eligibility. New raw IDs require explicit decisions before regeneration succeeds.\n\nLimitations: provisional source-label classifications do not validate historical identities/status periods, prove duplicates or establish source availability. Sparse snapshots and uncertain/anachronistic names remain. The denominator is not a final deduplicated historical entity count. Future classification decisions may enlarge or reduce it; no mass historical facts or research batches have been added.\n\n---\n\n';
 return t;
}


export function combinedReport(m,lock){
 return classificationReport(m)+reportMarkdown(m,lock).replace(/# v0.7 Phase 1 — dossier coverage inventory/,'# Appendix: preserved Phase 1 raw-map audit').replace(/## Recommended research batches \(not performed\)/,'## Archived Phase 1 raw audit batches — superseded for political research');
}
