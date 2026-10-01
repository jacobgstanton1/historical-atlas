import {readFileSync} from 'node:fs';
import {digest as hash, categories, dateRange as commonDateRange, periodBounds, readContext, readJSON, isCLI, root} from './research-common.mjs';

const schema = JSON.parse(readFileSync(new URL('../research/schemas/research-package.schema.json', import.meta.url), 'utf8'));
const plain = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const canonical = v => Array.isArray(v) ? v.map(canonical) : plain(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const config = JSON.parse(readFileSync(new URL('../research/config.json', import.meta.url), 'utf8'));
const records = (v, key) => Array.isArray(v) ? v : Array.isArray(v?.[key]) ? v[key] : plain(v?.[key]) ? Object.values(v[key]) : plain(v) ? Object.values(v).filter(plain) : [];

// Check the subset of JSON Schema used by our checked-in contract, without executing worker code.
function checkSchema(value, rule, path, errors) {
  if (rule.$ref) return checkSchema(value, schema.$defs[rule.$ref.split('/').at(-1)], path, errors);
  if (rule.oneOf) {
    const matches = rule.oneOf.filter(r => { const e=[]; checkSchema(value,r,path,e); return !e.length; });
    if (matches.length !== 1) errors.push(`${path}: must match exactly one schema variant`);
    return;
  }
  const type = rule.type;
  const hasType=t=>t==='null'?value===null:t==='object'?plain(value):t==='array'?Array.isArray(value):t==='integer'?Number.isInteger(value):typeof value===t;
  if (type && !(Array.isArray(type)?type.some(hasType):hasType(type))) { errors.push(`${path}: expected ${type}`); return; }
  if (typeof value==='number'&&!Number.isFinite(value)) errors.push(`${path}: non-finite number`);
  if (rule.const !== undefined && value !== rule.const) errors.push(`${path}: invalid constant`);
  if (rule.enum && !rule.enum.includes(value)) errors.push(`${path}: unsupported value`);
  if (typeof value==='string') {
    if (rule.minLength && value.trim().length < rule.minLength) errors.push(`${path}: empty or too short`);
    if (rule.pattern && !new RegExp(rule.pattern).test(value)) errors.push(`${path}: invalid format`);
  }
  if (Array.isArray(value)) {
    if (rule.minItems && value.length < rule.minItems) errors.push(`${path}: too few items`);
    if (rule.uniqueItems && new Set(value.map(x=>JSON.stringify(canonical(x)))).size!==value.length) errors.push(`${path}: duplicate items`);
    value.forEach((v,i)=>checkSchema(v,rule.items||{},`${path}[${i}]`,errors));
  }
  if (plain(value)) {
    if (rule.minProperties && Object.keys(value).length < rule.minProperties) errors.push(`${path}: empty object`);
    for (const k of rule.required||[]) if (!Object.hasOwn(value,k)) errors.push(`${path}.${k}: required`);
    for (const [k,v] of Object.entries(value)) {
      if (rule.properties?.[k]) checkSchema(v,rule.properties[k],`${path}.${k}`,errors);
      else if (rule.additionalProperties===false) errors.push(`${path}.${k}: unexpected property`);
    }
  }
}

// Reduced precision denotes a whole calendar unit, never a guessed first day.
function dateRange(value) {
  try { const [lo,hi]=commonDateRange(value);return {lo,hi,precision:value.split('-').length}; } catch {return null;}
}
function bounds(from,until) { const a=dateRange(from),b=dateRange(until);if(!a||!b)return null;const [lo,hi]=periodBounds({from,until});return lo<hi?{lo,hi}:null; }
const overlaps=(a,b)=>a.lo<b.hi&&b.lo<a.hi;
const unsupported=/\b(?:geometry[- ]inferred|inferred from (?:geometry|map|boundaries)|modern fallback|assumed (?:sovereignty|succession)|estimated without (?:a )?source)\b/i;
const categoryFields={'political-institutional':'governments',capital:'capitals',leadership:'leaders','population-statistics':'population',economy:'economy','area-statistics':'area',currency:'currencies','events-context':'events',relationships:'relationships','important-figures':'importantFigures'};

export function validatePackage(pkg, job, context={}) {
  const errors=[],review=[];
  let packageHash=null;
  try { packageHash=hash(pkg); } catch { errors.push('Package cannot be canonicalised'); }
  checkSchema(pkg,schema,'package',errors);
  if (errors.length) return {valid:false,errors,review,status:'validation-failed',packageHash};
  if (!plain(job)) errors.push('Missing coordinator job');
  const fingerprint=context.productionFingerprint;
  if (typeof fingerprint!=='string'||!fingerprint || pkg.productionFingerprint!==fingerprint || job?.productionFingerprint!==fingerprint) errors.push('Production fingerprint mismatch or unavailable');
  for (const key of ['jobId','entityId','category']) if (pkg[key] !== job?.[key==='jobId'?'id':key]) errors.push(`Job ${key} mismatch`);
  if (JSON.stringify([...pkg.mapIds].sort())!==JSON.stringify([...(job?.mapIds||[])].sort())) errors.push('Job mapIds mismatch');
  if (JSON.stringify(canonical(pkg.period))!==JSON.stringify(canonical(job?.period))) errors.push('Job period mismatch');
  const period=bounds(pkg.period.from,pkg.period.until);
  if (!period) errors.push('Invalid or reversed package period');
  if(period&&(period.lo<Date.UTC(config.timeline.from,0,1)||period.hi>Date.UTC(config.timeline.until+1,0,1)))errors.push('Assigned historical period extends outside the configured atlas timeline');
  const entities=records(context.db,'entities'), entity=entities.find(x=>x.id===pkg.entityId);
  if(new Set(entities.map(x=>x.id)).size!==entities.length)errors.push('Corrupt production context: duplicate entity IDs');
  const reviewOnly=pkg.entityId===null&&['resolver','identity-review','mapping-review'].includes(pkg.category);
  if (!entity&&!reviewOnly) errors.push('Unknown production entity');
  if(!pkg.claims.length&&(!reviewOnly||!pkg.absenceOfEvidence.length)) errors.push('No claims or documented review-only absence of evidence');
  const mappings=records(context.db,'mappings');
  if(new Set(mappings.map(x=>hash(x))).size!==mappings.length)errors.push('Corrupt production context: duplicate exact mappings');
  const manifestIds=new Set();
  function collectIds(v){if(Array.isArray(v))v.forEach(collectIds);else if(plain(v)){for(const k of ['mapId','stableMapId'])if(typeof v[k]==='string')manifestIds.add(v[k]);Object.values(v).forEach(collectIds);}}
  collectIds(context.manifest);
  for (const id of pkg.mapIds) if (reviewOnly?!manifestIds.has(id):!mappings.some(m=>m.mapId===id&&m.entityId===pkg.entityId)) errors.push(`Unknown entity/map identity relationship: ${id}`);
  if(reviewOnly) review.push('REVIEW-ONLY: Unmapped identity research cannot create or integrate an entity automatically');
  if (!categories.includes(pkg.category)) errors.push('Unknown category');
  if (!config.specialists[pkg.worker.specialism]?.includes(pkg.category)) errors.push('Worker specialism unsuitable for assigned category');
  const existingSources=records(context.registry,'sources'), sourceMap=new Map(existingSources.map(s=>[s.id,s]));
  if(new Set(existingSources.map(x=>x.id)).size!==existingSources.length)errors.push('Corrupt production context: duplicate source IDs');
  const ids=new Set(),urls=new Set();
  for (const s of pkg.sources) {
    if (ids.has(s.id)||(sourceMap.has(s.id)&&sourceMap.get(s.id).url!==s.url)) errors.push(`Duplicate or overwritten source: ${s.id}`);
    ids.add(s.id);
    if (urls.has(s.url)) errors.push(`Duplicate source URL: ${s.url}`);
    const reused=existingSources.find(old=>old.url===s.url);
    if (reused) review.push(`SOURCE-ALIAS: ${s.id} reuses existing source ${reused.id}; production source must be preserved`);
    urls.add(s.url);sourceMap.set(s.id,s);
    try { const u=new URL(s.url);if (!['https:','http:'].includes(u.protocol)||u.username||u.password) errors.push(`Unsafe source URL: ${s.id}`); } catch { errors.push(`Invalid source URL: ${s.id}`); }
    if (!dateRange(s.accessed)||s.accessed.length!==10) errors.push(`Invalid source access date: ${s.id}`);
    if (/geometry|modern[- ]fallback|snippet|unsupported/i.test(s.kind)) errors.push(`Unacceptable source kind: ${s.id}`);
    if (!/body|full.text|document|primary|page|section|passage/i.test(s.usage)) review.push(`Source ${s.id}: confirm full body reading and claim support`);
  }
  const claimIds=new Set(),seen=new Set(),claims=[];
  if(pkg.claims.length)for(const s of pkg.sources)if(!pkg.claims.some(c=>c.sourceIds.includes(s.id)))errors.push(`Orphan package source: ${s.id}`);
  for (const c of pkg.claims) {
    if (claimIds.has(c.id)) errors.push(`Duplicate claim id: ${c.id}`);claimIds.add(c.id);
    if (c.entityId!==pkg.entityId) errors.push(`Claim ${c.id}: entity mismatch`);
    if (c.category!==pkg.category) errors.push(`Claim ${c.id}: category mismatch`);
    const range=c.temporal.kind==='observation'?dateRange(c.temporal.observationDate):bounds(c.temporal.from,c.temporal.until);
    if (!range) errors.push(`Claim ${c.id}: invalid calendar date or interval`);
    if (range&&period&&(range.lo<period.lo||range.hi>period.hi)) errors.push(`Claim ${c.id}: outside assigned period`);
    const existence=entity?.existence&&bounds(entity.existence.validFrom,entity.existence.validUntil);
    if (range&&existence&&(range.lo<existence.lo||range.hi>existence.hi)) errors.push(`Claim ${c.id}: outside entity existence (temporal leakage)`);
    if (range&&!existence&&entity) {
      const known=[...mappings.filter(m=>m.entityId===entity.id),...Object.values(entity).filter(Array.isArray).flat()].map(f=>bounds(f?.validFrom,f?.validUntil)).filter(Boolean);
      if (!known.some(r=>r.lo<=range.lo&&r.hi>=range.hi)) review.push(`Claim ${c.id}: legacy entity has no lifetime; assigned interval requires historical verification against dated facts/maps`);
    }
    if (range) for (const id of pkg.mapIds) {
      const dated=mappings.filter(m=>m.mapId===id&&(m.validFrom||m.validUntil));
      for (const m of dated) {
        const r=bounds(m.validFrom,m.validUntil);
        if (r&&overlaps(r,range)&&(m.entityId!==pkg.entityId||r.lo>range.lo||r.hi<range.hi)) review.push(`Claim ${c.id}: map ${id} crosses a dated identity transition`);
      }
    }
    if (['population-statistics','area-statistics'].includes(c.category)&&c.temporal.kind!=='observation') errors.push(`Claim ${c.id}: quantitative statistic requires observation date, not interpolated interval`);
    if(['political-institutional','leadership','capital','currency'].includes(c.category)&&c.temporal.kind!=='interval') errors.push(`Claim ${c.id}: institutional/office fact requires dated interval`);
    if(c.category==='economy'&&c.temporal.kind!=='observation') errors.push(`Claim ${c.id}: economy fact requires observation date`);
    if (c.category==='important-figures'&&!c.figure) errors.push(`Claim ${c.id}: important figure requires sourced lifespan, relevance and contribution`);
    if (c.geographicScope.relationship!=='same') review.push(`Claim ${c.id}: ${c.geographicScope.relationship} geographic scope needs historical review`);
    if (c.reviewStatus!=='clear') review.push(`Claim ${c.id}: worker marked ${c.reviewStatus}`);
    if (c.cautions.length) review.push(`Claim ${c.id}: historical cautions require review`);
    if (unsupported.test(JSON.stringify(c.value))) errors.push(`Claim ${c.id}: unsupported historical assumption`);
    for(const risk of c.riskFlags||[]) {
      if(['geometry-succession','subjecto-succession','modern-nationality','unsupported-precision'].includes(risk)) errors.push(`Claim ${c.id}: prohibited inference ${risk}`);
      else {
        review.push(`Claim ${c.id}: ${risk} requires explicit historical resolution`);
        if(c.reviewStatus==='clear') errors.push(`Claim ${c.id}: unresolved ${risk} cannot be marked clear`);
      }
    }
    const dates=c.temporal.kind==='observation'?[c.temporal.observationDate]:[c.temporal.from,c.temporal.until];
    if(c.figure) dates.push(c.figure.lifespan.from,c.figure.lifespan.until,c.figure.relevance.from,c.figure.relevance.until);
    for (const sid of c.sourceIds) {
      if (!sourceMap.has(sid)) errors.push(`Claim ${c.id}: unknown source ${sid}`);
      else {
        const source=sourceMap.get(sid);
        for(const field of ['title','institution','url','accessed','usage']) if(typeof source[field]!=='string'||!source[field].trim()) errors.push(`Claim ${c.id}: source ${sid} missing ${field}`);
        if(!dateRange(source.accessed)||source.accessed?.length!==10) errors.push(`Claim ${c.id}: source ${sid} invalid access date`);
        try {const u=new URL(source.url);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)errors.push(`Claim ${c.id}: source ${sid} unsafe URL`);}catch{errors.push(`Claim ${c.id}: source ${sid} invalid URL`);}
      }
      const e=c.evidence.filter(e=>e.sourceId===sid&&e.supportsClaim===true);
      if (!e.length) errors.push(`Claim ${c.id}: no supporting body evidence for ${sid}`);
    }
    for (const e of c.evidence) {
      if (!c.sourceIds.includes(e.sourceId)) errors.push(`Claim ${c.id}: evidence source not linked`);
      if (!e.supportsClaim) errors.push(`Claim ${c.id}: evidence does not support claim`);
      if(e.observationDate) {
        const observed=dateRange(e.observationDate);
        if(!observed) errors.push(`Claim ${c.id}: invalid evidence observation date`);
        else if(c.temporal.kind!=='observation'||!range||range.lo<observed.lo||range.hi>observed.hi) errors.push(`Claim ${c.id}: observation does not match source observation date`);
      }
      if(e.from||e.until) {
        const supportedRange=bounds(e.from,e.until);
        if(!supportedRange) errors.push(`Claim ${c.id}: invalid or incomplete evidence period`);
        else if(range&&(range.lo<supportedRange.lo||range.hi>supportedRange.hi)) errors.push(`Claim ${c.id}: exceeds source-supported historical period`);
      }
      if(e.roleValidFrom) {
        const role=dateRange(e.roleValidFrom);
        if(!role) errors.push(`Claim ${c.id}: invalid role validity date`);
        else if(range&&range.lo<role.lo) errors.push(`Claim ${c.id}: premature office/title before source-supported role`);
      }
    }
    const supported=Math.max(0,...c.evidence.filter(e=>e.supportsClaim).map(e=>({year:1,month:2,day:3})[e.supportedPrecision]||0));
    if (dates.some(d=>(dateRange(d)?.precision||0)>supported)) errors.push(`Claim ${c.id}: date precision exceeds supporting evidence`);
    if (c.figure) {
      const life=bounds(c.figure.lifespan.from,c.figure.lifespan.until),rel=bounds(c.figure.relevance.from,c.figure.relevance.until);
      if (!life||!rel) errors.push(`Claim ${c.id}: invalid figure lifespan/relevance`);
      if (life&&rel&&(rel.lo<life.lo||rel.hi>life.hi)) errors.push(`Claim ${c.id}: figure relevance outside lifespan`);
      if (rel&&range&&(rel.lo>range.lo||rel.hi<range.hi)) errors.push(`Claim ${c.id}: figure relevance does not cover claim`);
    }
    const signature=hash({category:c.category,value:c.value,temporal:c.temporal,role:c.role,metric:c.metric});
    if (seen.has(signature)) errors.push(`Claim ${c.id}: duplicate claim`);seen.add(signature);
    if (range) claims.push({c,range});
    if(c.category==='political-institutional'&&!['government','politicalStatus','description'].includes(c.metric)) errors.push(`Claim ${c.id}: political-institutional requires explicit government, politicalStatus or description metric`);
    const field=c.category==='political-institutional'?({government:'governments',politicalStatus:'politicalStatus',description:'descriptions'}[c.metric]):categoryFields[c.category]||c.category;
    for (const f of entity?.[field]||[]) {
      const oldRange=bounds(f.validFrom,f.validUntil);
      if (oldRange&&range&&overlaps(oldRange,range)&&hash(f.value)!==hash(c.value)) review.push(`Claim ${c.id}: conflicts with existing ${field} fact; explicit historical review required`);
    }
  }
  for (let i=0;i<claims.length;i++) for(let j=i+1;j<claims.length;j++) {
    const a=claims[i],b=claims[j];
    if (a.c.category===b.c.category&&(a.c.role||'')===(b.c.role||'')&&(a.c.metric||'')===(b.c.metric||'')&&overlaps(a.range,b.range)&&hash(a.c.value)!==hash(b.c.value)) review.push(`Overlapping contradictory claims: ${a.c.id}, ${b.c.id}`);
  }
  if (job?.cautions?.length) review.push('Coordinator job cautions require historical review');
  if (pkg.absenceOfEvidence.length) review.push('Absence of evidence is not evidence of absence; review omissions');
  // Research is never accepted for production automatically, including worker-labelled clear claims.
  if (!errors.length) review.push('INDEPENDENT-REVIEW: Independent historical review required before any production integration');
  return {valid:errors.length===0,errors:[...new Set(errors)],review:[...new Set(review)],status:errors.length?'validation-failed':'historical-review',packageHash};
}

if(isCLI(import.meta.url)) {
  try {
    const [packagePath,jobPath,...options]=process.argv.slice(2);
    if(!packagePath||!jobPath||(options.length&&!(options.length===2&&options[0]==='--root'))) throw new Error('Usage: node scripts/research-validator.mjs package.json job.json [--root path]');
    const result=validatePackage(readJSON(packagePath),readJSON(jobPath),readContext(options[1]||root));
    console.log(JSON.stringify(result,null,2));
    process.exitCode=result.valid?0:1;
  } catch(error) {
    console.log(JSON.stringify({valid:false,errors:[error.message],review:[],status:'validation-failed',packageHash:null},null,2));
    process.exitCode=1;
  }
}
