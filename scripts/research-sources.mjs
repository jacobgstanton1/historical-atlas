import {digest,readContext,saveJSON,root,isCLI} from './research-common.mjs';
import path from 'node:path';
// Quality is assessed for a claim, never inferred from a URL or modern state identity.
export const sourceKinds = ['primary-document','archive','official-statistics','government-history','academic','research-institution','secondary','unclassified'];
export const preferences = {
  'political-institutional':['primary-document','archive','government-history','academic','research-institution','secondary'],
  leadership:['archive','government-history','primary-document','academic','secondary'],
  'population-statistics':['official-statistics','primary-document','archive','academic'],
  'area-statistics':['official-statistics','primary-document','archive','academic'],
  currency:['primary-document','government-history','archive','academic'],
  economy:['official-statistics','academic','research-institution','primary-document'],
  'events-context':['primary-document','archive','academic','research-institution','secondary'],
  'important-figures':['archive','academic','research-institution','primary-document','secondary']
};
export function sourceCatalogue(context) {
  return {schemaVersion:1,registryDigest:digest(context.registry),productionFingerprint:context.productionFingerprint,
    policy:'Reuse IDs and exact URLs. Unclassified legacy entries require claim-specific review; institution alone does not establish evidence quality.',
    preferences,sources:context.registry.sources.map(s=>({...s,kind:s.kind==='primary'?'primary-document':sourceKinds.includes(s.kind)?s.kind:'unclassified',
      classificationBasis:s.kind==='primary'||sourceKinds.includes(s.kind)?'Existing explicit classification':'Legacy provenance retained; no automatic quality classification',
      ...(s.kind&&!sourceKinds.includes(s.kind)&&s.kind!=='primary'?{originalKind:s.kind}:{})})).sort((a,b)=>a.id.localeCompare(b.id))};
}
if(isCLI(import.meta.url)) {const report=sourceCatalogue(readContext());saveJSON(path.join(root,'research/sources/catalogue.json'),report);console.log('Reused '+report.sources.length+' registered sources; no production changes.');}
