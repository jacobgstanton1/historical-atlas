// Source-bound bulk intake. Research is parallel; this entry point integrates serially.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {readJSON,saveJSON,readContext,digest,root,isCLI} from './research-common.mjs';
import {fields,temporalBounds,schemaCheck,generateDossierJob,validateDossier,acceptDossier,integrateDossier,recoverDossierIntegration} from './research-comprehensive.mjs';
import {readSnapshotConfig} from './research-snapshot-scan.mjs';
import {auditRichProduction} from './research-scale-audit.mjs';
export const bytesHash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const requireThat=(v,m)=>{if(!v)throw Error(m);};
const stores=new WeakMap();
const storeFor=context=>{if(!stores.has(context))stores.set(context,readJSON(path.join(context.directory,'data/comprehensive-dossiers.json')));return stores.get(context);};
export const overlaps=(a,b)=>a.lo<b.hi&&b.lo<a.hi;
export const normalizeName=v=>String(v).normalize('NFKD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/\b(sir|the rt hon|rt hon|hon)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim();
export function normalizedRole(value){
 if(/effective political leader/i.test(value))return 'Effective political leader (Archigos coding)';
 if(/vice[ -]?president/i.test(value))return 'Vice President';
 if(/prime minister/i.test(value))return 'Prime minister';
 if(/president.*legislative council/i.test(value))return 'President of the Legislative Council';
 if(/speaker.*legislative assembly/i.test(value))return 'Speaker of the Legislative Assembly';
 if(/premier/i.test(value))return 'Premier';
 if(/monarch|queen|king/i.test(value))return 'Monarch';
 if(/president/i.test(value))return 'President';
 return value;
}
export function verifySource(source){
 requireThat(source.url?.startsWith('https://')&&source.cachePath&&source.sha256&&source.parser,'Incomplete original-source provenance');
 const file=path.resolve(root,source.cachePath);
 requireThat(file.startsWith(path.resolve(root,'research')+path.sep),'Cache must be internal research evidence');
 requireThat(bytesHash(file)===source.sha256,'Original source body hash changed: '+source.id);
 return file;
}
export function verifyContract(contract,manifest){
 requireThat(contract.schemaVersion===1&&contract.reviewer&&contract.rationale&&contract.manifestHash===digest(manifest),'Missing independent exact-manifest review');
 requireThat(contract.parserPath&&bytesHash(path.resolve(root,contract.parserPath))===contract.parserSha256,'Reviewed parser changed');
 for(const p of contract.parserBindings||[])requireThat(bytesHash(path.resolve(root,p.path))===p.sha256,'Reviewed source-specific parser changed');
 requireThat(contract.reviewer!==manifest.worker,'Extractor cannot certify its own intake');
 for(const s of manifest.sources)verifySource(s);
 for(const mapping of contract.mappings){requireThat(mapping.entityId&&mapping.sourceId&&mapping.from&&mapping.until&&mapping.rationale,'Unbounded mapping contract');temporalBounds({kind:'interval',from:mapping.from,until:mapping.until});}
 return true;
}
export function reconcile(c,context,pending=[]){
 const e=context.db.entities.find(e=>e.id===c.entityId);requireThat(e,'Unknown entity');
 const store=storeFor(context);
 const old=[...(e.leaders||[]).map(r=>({category:'leadership',value:r.value,role:r.role,temporal:{kind:'interval',from:r.validFrom||'1800',until:r.validUntil||'1961-01-01'}})),...store.packages.flatMap(p=>p.claims.filter(r=>r.entityId===c.entityId)),...pending];
 const cb=temporalBounds(c.temporal);
 if(c.role==='Effective political leader (Archigos coding)'){
  const last=normalizeName(c.value).split(' ').at(-1);
  const matching=old.filter(r=>r.category==='leadership'&&r.temporal.kind==='interval'&&normalizeName(r.value).split(' ').at(-1)===last&&overlaps(temporalBounds(r.temporal),cb));
  // A literal surname match only suppresses redundant coverage. It does not
  // expand names, identify figures, change offices or accept a new assertion.
  if(matching.some(r=>{const b=temporalBounds(r.temporal);return b.lo<=cb.lo&&b.hi>=cb.hi;}))return{status:'duplicate',reason:'Source-coded surname/tenure already covered by a sourced named officeholder; no duplicate effective-role claim added'};
  if(matching.length)return{status:'historical-review',reason:'Partly overlapping coded surname/officeholder interval: identity/endpoints need reconciliation'};
 }
 for(const r of old){if(r.category!==c.category||normalizedRole(r.role||'')!==normalizedRole(c.role||'')||!overlaps(temporalBounds(r.temporal),cb))continue;
  const rb=temporalBounds(r.temporal);
  if(normalizeName(r.value)===normalizeName(c.value)&&rb.lo<=cb.lo&&rb.hi>=cb.hi)return {status:'duplicate',reason:'Existing sourced office/person interval already covers this candidate'};
  return {status:'historical-review',reason:'Overlapping existing office interval requires name/date reconciliation; no automatic overwrite'};
 }
 return {status:'accepted-candidate',reason:'Source-bound dated row with reviewed existing-entity mapping; no overlapping office record'};
}
const sourcesIn=context=>[...context.registry.sources,...storeFor(context).packages.flatMap(p=>p.sources)];
export function sourceRecord(s,context){
 const existing=sourcesIn(context).find(old=>old.url===s.url);
 return existing?structuredClone(existing):{id:s.id,title:s.title,institution:s.institution,url:s.url,accessed:s.accessed||s.retrievedAt,usage:'Dated officeholder evidence; original row and scope retained in bulk acquisition provenance.',kind:s.kind||'official-officeholder-table'};
}
export function prepareCandidates(manifest,contract,context){
 verifyContract(contract,manifest);
 const candidates=[],pending=[],snapshots=readSnapshotConfig(context.directory).map(s=>s.year);
 for(const r of manifest.rows){
  const source=manifest.sources.find(s=>s.id===r.sourceId);requireThat(source,'Orphan row source');
  const envelope={schemaVersion:1,id:'bulk-'+digest({source:source.url,locator:r.locator,row:r}).slice(0,24),adapter:contract.adapter,manifestHash:contract.manifestHash,sourceId:source.id,sourceUrl:source.url,bodySha256:source.sha256,locator:r.locator,originalRow:structuredClone(r),reviewTier:contract.tier,acquisitionLayer:'source-first-bulk',statisticalComparability:'not-a-statistic',targetSnapshots:[],status:'historical-review',reason:'No approved historical mapping',claims:[]};
  const unresolved=(r.evidenceCautions||[]).filter(c=>!(contract.resolvedCautions||[]).includes(c));
  if(unresolved.length||r.disposition==='historical-review'){envelope.reason='Preserved source/date caution: '+unresolved.join('; ');candidates.push(envelope);continue;}
  const mappings=contract.mappings.filter(m=>m.sourceId===source.id&&(r.entityIdsSuggested||[]).includes(m.entityId));
  for(const m of mappings){
   let from=r.from,until=r.until;
   // Partial precision cannot be made more exact. Transition months/years are held.
   if(r.precision!=='day'){envelope.reason='Partial-date transition requires separate conservative-interior adapter';continue;}
   const original={kind:'interval',from,until,certainty:'exact'};temporalBounds(original);
   from=[from,m.from,'1800-01-01'].sort().at(-1);until=[until,m.until,'1961-01-01'].sort()[0];
   if(from>=until)continue;
   const s=sourceRecord(source,context);
   const qualifications=[`Source tenure: ${r.originalTerm||r.from+' to '+r.until}.`,`Research clipping to the reviewed historical framework and atlas limit; these bounds are not asserted accession/departure dates. ${contract.endpointNote}`,m.scope];
   if(m.qualification)qualifications.push(m.qualification);
   const claim={id:envelope.id+'-'+digest(m.entityId).slice(0,10),category:'leadership',value:r.name,role:m.role||normalizedRole(r.officeTitle),entityId:m.entityId,temporal:{kind:'interval',from,until,certainty:'exact'},scope:{id:m.entityId+'-central-office',description:m.scope,relationship:'same'},sourceIds:[s.id],evidence:[{sourceId:s.id,locator:r.locator,note:`Original-source parser ${source.parser}; body SHA256 ${source.sha256}; ${r.originalRow||r.originalTerm}; ${contract.rationale}`,precision:r.precision,temporal:original,interpretation:'direct'}],status:'supported',risks:[],qualifications,origin:{kind:'bulk-candidate',reference:envelope.id,sourceIdentifier:r.locator}};
   const result=reconcile(claim,context,pending.filter(p=>p.entityId===m.entityId));
   envelope.claims.push({claim,source:s,...result});
   if(result.status==='accepted-candidate')pending.push(claim);
  }
  if(envelope.claims.length){envelope.status=envelope.claims.some(c=>c.status==='accepted-candidate')?'accepted-candidate':envelope.claims.every(c=>c.status==='duplicate')?'duplicate':'historical-review';envelope.reason=envelope.claims.map(c=>c.reason).join('; ');}
  envelope.targetSnapshots=snapshots.filter(year=>envelope.claims.some(p=>overlaps(temporalBounds(p.claim.temporal),{lo:year*372,hi:(year+1)*372})));
  candidates.push(envelope);
 }
 const schema=readJSON('research/bulk-01/schemas/acquisition.schema.json');
 for(const c of candidates)requireThat(!schemaCheck(c,schema,schema).length,'Invalid acquisition envelope');
 return candidates;
}
export const needsResume=(saved,packages,id)=>!!saved&&(saved.integrations.some(i=>i.applied)||packages.some(p=>p.id.startsWith(id+'-')));
export function runTranche(manifestPath,contractPath,{apply=false}={}){
 const manifest=readJSON(manifestPath),contract=readJSON(contractPath),context=readContext();
 const output='research/bulk-01/'+contract.id;
 const ledgerPath=output+'/integration-ledger.json';
 verifyContract(contract,manifest);
 const saved=fs.existsSync(path.resolve(root,ledgerPath))?readJSON(ledgerPath):null;
 const resume=needsResume(saved,readJSON('data/comprehensive-dossiers.json').packages,contract.id);
 if(resume)requireThat(saved.manifestHash===digest(manifest)&&saved.contractHash===digest(contract),'Interrupted tranche evidence changed');
 const journal='research/comprehensive/integration-journal.json';
 if(apply&&fs.existsSync(journal)&&readJSON(journal).status==='prepared')recoverDossierIntegration();
 const candidates=resume?readJSON(output+'/candidates.json'):prepareCandidates(manifest,contract,context);if(!resume)saveJSON(output+'/candidates.json',candidates);
 const groups=new Map();for(const row of candidates)for(const part of row.claims.filter(c=>c.status==='accepted-candidate')){let group=groups.get(part.claim.entityId)||[];group.push(part);groups.set(part.claim.entityId,group);}
 const ledger=resume?saved:{schemaVersion:1,manifestHash:digest(manifest),contractHash:digest(contract),before:auditRichProduction(context),integrations:[],browserChecks:0};
 saveJSON(ledgerPath,ledger);
 for(const [entityId,parts]of groups){
  const existing=readJSON('data/comprehensive-dossiers.json').packages.find(p=>p.id===contract.id+'-'+entityId);
  if(existing){requireThat(digest(existing.claims)===digest(parts.map(p=>p.claim))&&existing.provenance.preservedPackageHashes.includes(digest(contract)),'Existing package disagrees with preserved intake');if(!ledger.integrations.some(i=>i.packageId===existing.id&&i.applied)){ledger.integrations.push({entityId,packageId:existing.id,packageHash:existing.acceptance.packageHash,claims:existing.claims.length,applied:true,recovered:true});saveJSON(ledgerPath,ledger);}continue;}
  const fresh=readContext(),claims=parts.map(p=>p.claim),period={from:claims.map(c=>c.temporal.from).sort()[0],until:claims.map(c=>c.temporal.until).sort().at(-1)},job=generateDossierJob(entityId,period,fresh);
  const consulted=[...new Map(parts.map(p=>[p.source.id,p.source])).values()];
  // Existing registry sources are referenced by ID, never redefined to fit a
  // different schema. Preserve their original metadata exactly.
  const sources=consulted.filter(s=>!sourcesIn(fresh).some(old=>old.id===s.id));
  const pkg={schemaVersion:2,id:contract.id+'-'+entityId,jobId:job.id,entityId,mapIds:job.mapIds,worker:{id:'bulk-parser/'+contract.adapter,assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period,claims,sources,investigation:fields.map(category=>({category,status:category==='leadership'?'partial':'unresolved',rationale:category==='leadership'?'Source-first dated officeholder tranche; other offices and unsourced dates remain gaps.':'This bounded source-first tranche does not investigate this category.',consultedSourceIds:category==='leadership'?consulted.map(s=>s.id):[],gaps:[category==='leadership'?'Offices/dates not covered by this source remain unresolved.':'Outside this tranche.']})),conflicts:[],provenance:{createdAt:new Date().toISOString(),method:'Certified source-bound bulk adapter; independent coordinator review; serial existing integrator.',preservedPackageHashes:[digest(manifest),digest(contract)]}};
  const validation=validateDossier(pkg,job,fresh);saveJSON(output+'/packages/'+entityId+'.validation.json',validation);
  requireThat(validation.valid,JSON.stringify(validation.errors));
  requireThat(validation.review.every(issue=>issue==='Candidate claims require independent original-source review'),'Unexpected historical conflict: '+validation.review.join('; '));
  // Honest machine receipt: original-body semantics/mapping were independently reviewed
  // in the hash-bound contract. This is not a fabricated per-row human review.
  const review={reviewer:'bulk-source-bound-deterministic/v1',packageHash:digest(pkg),bodyReviewed:true,rationale:`Original bodies, extraction and historical mappings independently reviewed by ${contract.reviewer}; contract ${digest(contract)}; adapter ${contract.adapter}. All source hashes verified; ambiguous rows held outside this package.`,reviewedIssues:validation.review,decisions:Object.fromEntries(claims.map(c=>[c.id,'accepted']))};
  const receipt=acceptDossier(pkg,job,fresh,review);
  saveJSON(output+'/packages/'+entityId+'.json',{job,package:pkg,receipt});
  const result=integrateDossier(pkg,job,fresh,receipt,{apply});
  ledger.integrations.push({entityId,packageId:pkg.id,packageHash:digest(pkg),claims:claims.length,applied:result.applied,afterFingerprint:result.afterFingerprint||null});saveJSON(ledgerPath,ledger);
 }
 ledger.after=auditRichProduction(readContext());requireThat(ledger.after.valid,ledger.after.errors.join('; '));
 ledger.metrics={rows:candidates.length,acceptedCandidates:candidates.filter(c=>c.status==='accepted-candidate').length,duplicates:candidates.filter(c=>c.status==='duplicate').length,held:candidates.filter(c=>c.status==='historical-review').length,newClaims:apply||resume?ledger.after.claims-ledger.before.claims:0,packages:ledger.integrations.length,sourceDatasetsUsed:manifest.sources.length,sourceReuse:saved?.metrics?.sourceReuse??manifest.sources.filter(s=>sourcesIn(context).some(old=>old.url===s.url)).length};
 saveJSON(ledgerPath,ledger);return ledger;
}
if(isCLI(import.meta.url)){const [manifest,contract,flag]=process.argv.slice(2);requireThat(manifest&&contract,'Usage: node scripts/research-bulk.mjs manifest.json contract.json [--apply]');console.log(JSON.stringify(runTranche(manifest,contract,{apply:flag==='--apply'}).metrics,null,2));}
