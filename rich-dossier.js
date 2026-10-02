import {historicalDate,historicalInterval,intersects,yearString} from './historical-chronology.js';
export const dossierCategories=['identity','political-institutional','leadership','capital','currency','historical-flag','population-statistics','area-statistics','density','economy','events-context','relationships','overview','important-figures'];
const statistics=new Set(['population-statistics','area-statistics','density','economy']);
export function createRichDossierIndex(store) {
  if(store?.schemaVersion!==2||!Array.isArray(store.packages))throw Error('Unsupported rich dossier store');
  const registry=new Map(),entities=new Map(),ids=new Set();
  for(const p of store.packages)for(const s of p.sources||[]){if(!s.id||!s.title||!s.institution||!/^https:\/\//.test(s.url||''))throw Error('Invalid rich source');const old=registry.get(s.id);if(old&&old.url!==s.url)throw Error('Conflicting rich source');registry.set(s.id,s);}
  for(const p of store.packages){
    if(p.acceptance?.status!=='accepted'||!p.acceptance.review?.bodyReviewed)throw Error('Unaccepted production package');
    if(!entities.has(p.entityId))entities.set(p.entityId,[]);
    for(const c of p.claims){
      if(ids.has(c.id)||c.entityId!==p.entityId||!dossierCategories.includes(c.category)||!p.acceptance.acceptedClaimIds.includes(c.id)||p.acceptance.review.decisions[c.id]!=='accepted'||c.status!=='supported')throw Error('Invalid accepted rich claim');
      historicalInterval(c.temporal);ids.add(c.id);entities.get(p.entityId).push(c);
    }
  }
  return {registry,resolve(entityId,year,{registry:allSources=registry,mappings=[],observationWindow=10,contextWindow=5,figureContextWindow=5}={}){
    const selected=historicalDate(yearString(year)),records=[];
    for(const c of entities.get(entityId)||[]){
      if(!c.sourceIds?.length||c.sourceIds.some(id=>!allSources.has(id))||c.risks?.length)continue;
      const t=c.temporal,b=historicalInterval(t),anchor=t.from||t.observationDate||t.date,distance=anchor?year-historicalDate(anchor).year:Infinity;
      let mode='applicable';
      if(!intersects(selected,b)){
        if(distance<0)continue;
        if(t.kind==='observation'&&distance<=observationWindow&&c.scope?.relationship==='same')mode='nearby-observation';
        else if(t.kind==='event'&&distance<=contextWindow&&c.scope?.relationship==='same')mode='dated-context';
        else if(c.category==='important-figures'&&t.kind==='interval'&&t.from===t.until&&distance<=figureContextWindow&&c.scope?.relationship==='same')mode='dated-figure-context';
        else continue;
      }
      // Nearby context cannot cross an ambiguous or partial-year identity mapping.
      if(mappings.length){const windows=mappings.map(m=>historicalInterval({kind:'interval',from:m.validFrom,until:m.validUntil}));if(mode==='applicable'? !windows.some(w=>intersects(w,b)&&intersects(w,selected)):!windows.some(w=>w.lo<=b.lo&&w.hi>=selected.hi))continue;}
      if(statistics.has(c.category)&&t.kind!=='observation')continue;
      if(c.category==='important-figures'){
        if(!c.figure?.relationship||!c.figure.activity||!c.figure.contribution)continue;
        const life=historicalInterval({...c.figure.lifespan,kind:'interval'});if(b.lo<life.lo||b.hi>life.hi)continue;
      }
      records.push({...c,mode,actualTemporal:t,requestedYear:year});
    }
    return records.sort((a,b)=>historicalInterval(a.temporal).lo-historicalInterval(b.temporal).lo||a.id.localeCompare(b.id));
  }};
}
let pending;
export function loadRichDossiers(){return pending ||= fetch('./data/comprehensive-dossiers.json?v=territory2-1').then(r=>{if(!r.ok)throw Error('Rich dossier HTTP '+r.status);return r.json();}).then(createRichDossierIndex);}
