import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createMetadataIndex, validInYear, intervalBounds, dateBounds} from '../historical-metadata.js';

const definitions = [
  ['political-institutional', ['politicalStatus', 'governments', 'descriptions'], 90],
  ['leadership', ['leaders'], 75], ['capital', ['capitals'], 70],
  ['population-statistics', ['population'], 30], ['area-statistics', ['area'], 25],
  ['currency', ['currencies'], 45], ['economy', ['economy'], 25],
  ['events-context', ['events'], 35], ['relationships', ['relationships'], 40],
  ['important-figures', ['importantFigures'], 20],
];
const unique = x => [...new Set(x)].sort();
const reference = r => ({value:r.value, validFrom:r.validFrom, validUntil:r.validUntil,
  asOf:r.asOf, date:r.date, relevance:r.relevance||r.figure?.relevance, sourceIds:r.sourceIds || [], confidence:r.confidence});
const weak = (r, sources) => !r.sourceIds?.length || r.sourceIds.some(id => {
  const s = sources.get(id); return !s || !s.url || !s.title || !s.institution;
}) || ['uncertain', 'speculative', 'inferred', 'low'].includes(r.confidence);
function covers(records, year) {
  let cursor = Date.UTC(year,0,1); const end = Date.UTC(year+1,0,1);
  for (const [a,b] of records.map(intervalBounds).sort((a,b)=>a[0]-b[0])) {
    if (a > cursor) return false; cursor = Math.max(cursor,b); if (cursor >= end) return true;
  }
  return false;
}
function observed(r, year) {
  const d = r.asOf || r.date; return !!d && Number(String(d).slice(0,4)) === year;
}
function contextual(r,year) {
  const relevance=r.relevance||r.figure?.relevance;
  if(relevance)return validInYear({validFrom:relevance.validFrom||relevance.from,validUntil:relevance.validUntil||relevance.until},year);
  if(r.validFrom||r.validUntil)return validInYear(r,year);
  return observed(r,year);
}

export function scan(context, {from=1800, until=1960, entityIds}={}) {
  if (!Number.isInteger(from) || !Number.isInteger(until) || from > until || from < 1800 || until > 1960)
    throw Error('Research range must be inclusive integer years within1800–1960.');
  const {db,registry,manifest,plan} = context, selected = entityIds && new Set(entityIds);
  if (selected && [...selected].some(id=>!db.entities.some(e=>e.id===id))) throw Error('Unknown entity selection.');
  const sources = new Map(registry.sources.map(s=>[s.id,s])), index=createMetadataIndex(db,registry);
  const gaps=[], metrics={entitiesScanned:0,entityYearsScanned:0,rawIdentities:manifest.identities.length,
    politicalDenominator:0,unresolvedClassifications:0,mappingReviewIdentities:0,
    rawResolverYearsScanned:0,exactObservedYears:0,nearbyDatedEvidenceGaps:0,weakSourceGaps:0,
    transitionYearGaps:0,entityMappingReviewYears:0,politicalCandidatesInvestigated:0,
    resolverAvailability:structuredClone(manifest.classification?.politicalCoverage||{}),fieldCoverage:{},byCategory:{}};
  function add(g) {gaps.push(g); metrics.byCategory[g.category]=(metrics.byCategory[g.category]||0)+1;}
  for (const e of [...db.entities].sort((a,b)=>a.id.localeCompare(b.id))) {
    if (selected && !selected.has(e.id)) continue; metrics.entitiesScanned++;
    const allMappings=db.mappings.filter(m=>m.entityId===e.id), name=e.names?.[0]?.value || e.id;
    const dated=e.existence?[e.existence]:[...allMappings,...Object.values(e).filter(Array.isArray).flat()].filter(r=>r.validFrom||r.validUntil);
    const bounds=dated.map(intervalBounds), envelope=bounds.length?[Math.min(...bounds.map(x=>x[0])),Math.max(...bounds.map(x=>x[1]))]:null;
    for (let year=from;year<=until;year++) {
      if (!envelope || envelope[0]>=Date.UTC(year+1,0,1) || envelope[1]<=Date.UTC(year,0,1)) continue; metrics.entityYearsScanned++;
      const mappings=allMappings.filter(m=>validInYear(m,year)), mapIds=unique(mappings.map(m=>m.mapId));
      if(!covers(mappings,year)){
        metrics.entityMappingReviewYears++;
        add({entityId:e.id,mapIds:unique(allMappings.map(m=>m.mapId)),name,period:{from:String(year),until:String(year)},category:'mapping-review',
          reason:mappings.length?'Accepted entity mappings cover only part of this requested calendar year.':'No accepted entity mapping covers this year within the editorial research envelope.',priority:97,
          cautions:['Entity-year research envelope is not proof that any raw polygon is present in this year.','Do not extend political lifetime or sovereignty from geometry.','Preserve mapping gaps and requested-year versus snapshot separation.'],
          existingFacts:[],sourceIds:unique(allMappings.flatMap(m=>m.sourceIds||[])),mappings});
      }
      for (const [category,fields,priority] of definitions) {
        const statistics=['population-statistics','area-statistics','economy'].includes(category);
        const timeline=['events-context','important-figures'].includes(category);
        const coverage=metrics.fieldCoverage[category]||={entityYearsEligible:0,fullySupportedYears:0,partialYears:0,observationYears:0,missingYears:0};coverage.entityYearsEligible++;
        const applies=r=>statistics?observed(r,year):timeline?contextual(r,year):validInYear(r,year);
        const existing=fields.flatMap(f=>e[f]||[]), eligible=existing.filter(applies);
        const healthy=eligible.filter(r=>!weak(r,sources));
        const absent=fields.filter(f=>!(e[f]||[]).some(r=>applies(r)&&!weak(r,sources)));
        const partial=!statistics&&!timeline&&fields.some(f=>!covers((e[f]||[]).filter(r=>validInYear(r,year)&&!weak(r,sources)),year));
        if (!absent.length && !partial) {coverage.fullySupportedYears++;if(statistics){metrics.exactObservedYears++;coverage.observationYears++;}continue;}
        if(partial&&healthy.length)coverage.partialYears++;else coverage.missingYears++;
        const nearby=statistics?existing.filter(r=>(r.asOf||r.date)&&!observed(r,year)):[];
        if(nearby.length)metrics.nearbyDatedEvidenceGaps++; if(eligible.some(r=>weak(r,sources)))metrics.weakSourceGaps++;
        const reason=eligible.length&&!healthy.length?'Existing evidence has missing or weak source provenance.':absent.length?
          (statistics?'No adequately sourced observation for the requested year.':'No adequately sourced '+absent.join(', ')+' record for the requested year.'):
          'Sourced records cover only part of the requested calendar year.';
        const cautions=['Partial research bounds are not a full historical lifetime.','No geometry-inferred sovereignty or succession.'];
        if(!e.existence)cautions.push('Research envelope derived from existing dated mappings/facts; it does not establish a sourced full lifetime.');
        if(!mappings.length)cautions.push('Entity exists within an editorial envelope but has no accepted mapping in this year; resolve identity before adding facts.');
        if(statistics)cautions.push('Nearby observations are evidence leads only: no interpolation, modern fallback or automatic carry-forward coverage.');
        if(partial)cautions.push('Preserve intra-year transitions and research gaps; do not fill a year merely because one dated record exists.');
        add({entityId:e.id,mapIds,name,period:{from:String(year),until:String(year)},category,reason,priority,cautions,
          existingFacts:unique([...eligible,...nearby].map(r=>JSON.stringify(reference(r)))).map(x=>JSON.parse(x)),
          sourceIds:unique([...eligible,...nearby].flatMap(r=>r.sourceIds||[])),mappings});
      }
    }
  }
  for (const r of [...manifest.identities].sort((a,b)=>a.stableMapId.localeCompare(b.stableMapId))) {
    const category=r.classification?.classification, review=plan.reviews?.[r.stableMapId];
    const political=['political-polity','dependent-administration'].includes(category);
    if(political)metrics.politicalDenominator++;
    if(political&&review)metrics.politicalCandidatesInvestigated++;
    if(category==='unresolved')metrics.unresolvedClassifications++;
    if(review?.status==='mapping-review')metrics.mappingReviewIdentities++;
    if(selected)continue;
    if(!political&&category!=='unresolved'&&category!=='name-variant-or-duplicate'&&review?.status!=='mapping-review')continue;
    for(const year of r.snapshotYears.filter(y=>y>=from&&y<=until)){
      metrics.rawResolverYearsScanned++; const resolved=index.resolve(r.stableMapId,year), ids=resolved.entity?[resolved.entity.id]:(resolved.identityPeriods||[]).map(p=>p.entity.id);
      const transition=!!resolved.calendarYear?.needsResearch&&!!ids.length;
      const c=review?.status==='mapping-review'||category==='name-variant-or-duplicate'?'mapping-review':category==='unresolved'?'identity-review':!ids.length||transition?'resolver':null;
      if(!c)continue;
      if(c==='resolver'&&transition)metrics.transitionYearGaps++;
      add({entityId:null,mapIds:[r.stableMapId],name:r.displayName||r.stableMapId,period:{from:String(year),until:String(year)},category:c,
        reason:c==='resolver'?(transition?'Calendar-year resolution contains an identity transition or partial framework requiring review.':'No accepted dated political identity resolves for this source-present year.'):c==='mapping-review'?'Dated mapping or canonical identity requires explicit historical review.':'Political eligibility and historical referent remain unresolved.',
        priority:c==='resolver'?(transition?98:100):95,cautions:['Source snapshot presence is not sovereignty or political lifetime.','Community/people identities remain outside automatic political dossiers.','Preserve requested-year and boundary-snapshot separation.'],
        existingFacts:review?.intervals||[],sourceIds:unique(review?.sourceIds||[]),mappings:db.mappings.filter(m=>m.mapId===r.stableMapId)});
    }
  }
  gaps.sort((a,b)=>b.priority-a.priority||(a.entityId||a.mapIds[0]).localeCompare(b.entityId||b.mapIds[0])||a.category.localeCompare(b.category)||a.period.from.localeCompare(b.period.from));
  metrics.totalGaps=gaps.length; return {schemaVersion:1,productionFingerprint:context.productionFingerprint,range:{from,until},gaps,metrics};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const {readContext}=await import('./research-common.mjs');const args=process.argv.slice(2), value=k=>args[args.indexOf(k)+1];
  const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))), options={};
  if(args.includes('--from'))options.from=Number(value('--from'));if(args.includes('--until'))options.until=Number(value('--until'));
  if(args.includes('--entities'))options.entityIds=value('--entities').split(',');
  const result=scan(await readContext(root),options),dir=path.join(root,'research/reports');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'scan.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result.metrics));
}
