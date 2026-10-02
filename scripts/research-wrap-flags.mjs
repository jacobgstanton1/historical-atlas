import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {digest,readJSON,saveJSON,readContext,root,isCLI} from './research-common.mjs';
import {fields,generateDossierJob,validateDossier,temporalBounds} from './research-comprehensive.mjs';
import {reuseCatalogue} from './research-scale.mjs';
const requireValue=(ok,message)=>{if(!ok)throw Error(message);};
const bytesHash=x=>crypto.createHash('sha256').update(x).digest('hex');
export function verifyFlagBundle(bundle,review,directory){
 requireValue(review.bodyReviewed&&review.assetReviewed&&review.reviewer!==bundle.worker.id,'Independent original body/asset review required');
 requireValue(review.bundleHash===digest(bundle)&&review.packageHash===digest(bundle),'Original flag bundle changed since independent review');
 for(const c of bundle.claims){
  requireValue(c.category==='historical-flag'&&['accepted','held','rejected'].includes(review.decisions?.[c.id]),'Explicit original flag decision required');
  requireValue(/^\.\/assets\/flags\/[a-zA-Z0-9_-]+\.svg$/.test(c.flag?.asset),'Safe original flag asset path required');
  const file=path.join(directory,'staged-assets',path.basename(c.flag.asset));
  requireValue(bytesHash(fs.readFileSync(file))===c.flag.sha256&&review.assetHash===c.flag.sha256,'Reviewed staged SVG changed');
 }
 requireValue(Object.keys(review.sourceBodyHashes||{}).length>0,'Original source body hash provenance required');
 for(const [relative,hash]of Object.entries(review.sourceBodyHashes)){
  requireValue(/^cache\/[a-zA-Z0-9_.-]+$/.test(relative),'Unsafe source body cache path');
  requireValue(bytesHash(fs.readFileSync(path.join(directory,relative)))===hash,'Reviewed source body cache changed: '+relative);
 }
 for(const relative of bundle.sourceBodyPaths||[])if(!/^https:\/\//.test(relative)){
  requireValue(/^cache\/[a-zA-Z0-9_.-]+$/.test(relative),'Unsafe optional source body cache path');
  if(fs.existsSync(path.join(directory,relative)))requireValue(review.sourceBodyHashes[relative],'Existing local source body is not review-hash-bound: '+relative);
 }
 return true;
}
export function wrapFlagBundle(bundle,originalReview,context,directory){
 verifyFlagBundle(bundle,originalReview,directory);
 const catalogue=reuseCatalogue(context),byURL=new Map(catalogue.sources.map(s=>[s.url,s])),byID=new Map(catalogue.sources.map(s=>[s.id,s])),aliases={};
 for(const s of bundle.sources){if(byID.has(s.id))requireValue(byID.get(s.id).url===s.url,'Source ID collision: '+s.id);if(byURL.has(s.url))aliases[s.id]=byURL.get(s.url).id;}
 const resolve=id=>aliases[id]||id;
 const sourceKeys=['id','title','institution','url','accessed','usage','kind','license','attribution','assetUrl','licenseUrl'];
 const sources=bundle.sources.filter(s=>!byURL.has(s.url)).map(s=>Object.fromEntries(sourceKeys.filter(k=>s[k]!==undefined).map(k=>[k,s[k]])));
 const allSources=new Map([...catalogue.sources,...sources].map(s=>[s.id,s]));
 const claims=bundle.claims.map(c=>{
  const scope=c.scope||{id:bundle.entityId+'-flag-design',description:c.geographicScope?.description,relationship:c.geographicScope?.relationship};
  const result={id:c.id,category:c.category,value:structuredClone(c.value),entityId:bundle.entityId,temporal:structuredClone(c.temporal),scope:structuredClone(scope),sourceIds:[...new Set(c.sourceIds.map(resolve))],
   evidence:c.evidence.map(e=>({sourceId:resolve(e.sourceId),locator:e.locator||allSources.get(resolve(e.sourceId))?.title||'Reviewed flag design/history',note:e.note,precision:e.precision||e.supportedPrecision,temporal:structuredClone(e.temporal),interpretation:e.interpretation||'direct'})),
   status:c.status,risks:structuredClone(c.risks||[]),qualifications:structuredClone(c.qualifications||[]),origin:structuredClone(c.origin),flag:{...structuredClone(c.flag),assetSourceIds:[...new Set(c.flag.assetSourceIds.map(resolve))]}};
  requireValue(digest([result.value,result.temporal,result.flag.type,result.flag.license,result.flag.sha256])===digest([c.value,c.temporal,c.flag.type,c.flag.license,c.flag.sha256]),'Wrapper changed historical flag meaning');
  return result;
 });
 const sorted=[...claims].sort((a,b)=>temporalBounds(a.temporal).lo-temporalBounds(b.temporal).lo),latest=[...claims].sort((a,b)=>temporalBounds(b.temporal).hi-temporalBounds(a.temporal).hi);
 const job=generateDossierJob(bundle.entityId,{from:sorted[0].temporal.from,until:latest[0].temporal.until},context);
 const pkg={schemaVersion:2,id:'scale-flag-'+bundle.entityId,jobId:job.id,entityId:bundle.entityId,mapIds:job.mapIds,worker:{id:'deterministic-reviewed-flag-wrapper',assignmentType:'comprehensive-entity-period'},productionFingerprint:job.productionFingerprint,chronology:{calendar:'proleptic-gregorian',yearConvention:'astronomical'},period:job.period,claims,sources,
  investigation:fields.map(category=>({category,status:category==='historical-flag'?'partial':'unresolved',rationale:category==='historical-flag'?'Bounded independently reviewed flag supplement; excluded periods remain gaps.':'This technical flag wrapper supplies no new evidence for this category; existing dossiers and independent research remain separate.',consultedSourceIds:category==='historical-flag'?[...new Set(claims.flatMap(c=>c.sourceIds))]:[],gaps:[category==='historical-flag'?'Unreviewed flag periods/types remain unfilled.':'Not investigated by this bounded flag acquisition.']})),conflicts:[],provenance:{createdAt:'2026-10-02',method:'Deterministic schema normalization of independently reviewed isolated flag bundle; no historical value/date/type/license/hash changes.',preservedPackageHashes:[digest(bundle)]}};
 const validation=validateDossier(pkg,job,context);
 requireValue(validation.errors.every(e=>e==='Flag asset missing or unreadable'),'Invalid technical flag envelope: '+validation.errors.join('; '));
 const uncachedSourceBodies=(bundle.sourceBodyPaths||[]).filter(p=>!/^https:\/\//.test(p)&&!fs.existsSync(path.join(directory,p)));
 const review={reviewer:originalReview.reviewer,packageHash:digest(pkg),bodyReviewed:true,reviewedIssues:validation.review,decisions:structuredClone(originalReview.decisions),originalBundleReview:structuredClone(originalReview),sourceAliases:aliases,uncachedSourceBodies,
  rationale:'Inherited exact-bundle independent review; deterministic technical envelope and source-ID normalization only. '+(uncachedSourceBodies.length?'Historical bodies were independently read through original web source routes; absent optional local cache files have no invented hash. ':'')+originalReview.rationale};
 return {pkg,job,review,validation,stagedAssets:[...new Set(claims.map(c=>c.flag.asset))].map(asset=>({asset,file:path.join(directory,'staged-assets',path.basename(asset))})),originalBundleHash:digest(bundle)};
}
if(isCLI(import.meta.url)){
 const directory=path.join(root,'research/scale-01/flags'),context=readContext(),results=[];
 for(const file of fs.readdirSync(path.join(directory,'bundles')).sort()){
  const x=wrapFlagBundle(readJSON(path.join(directory,'bundles',file)),readJSON(path.join(directory,'reviews',file)),context,directory);
  for(const [folder,value]of [['packages',x.pkg],['jobs',x.job],['reviews',x.review]])saveJSON(path.join(directory,'envelopes',folder,file),value);
  results.push({entityId:x.pkg.entityId,claims:x.pkg.claims.length,originalBundleHash:x.originalBundleHash,packageHash:digest(x.pkg),assetInstallationPending:x.validation.errors.length>0,stagedAssets:x.stagedAssets});
 }
 saveJSON(path.join(directory,'envelopes/manifest.json'),{schemaVersion:1,productionMutation:false,results});console.log(JSON.stringify({entities:results.length,claims:results.reduce((n,x)=>n+x.claims,0),productionMutation:false}));
}
