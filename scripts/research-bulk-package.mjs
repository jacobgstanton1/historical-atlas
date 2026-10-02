// Controlled integration of independently reviewed non-table supplements.
import fs from 'node:fs';
import path from 'node:path';
import {readJSON,readContext,saveJSON,digest,root,isCLI} from './research-common.mjs';
import {bytesHash} from './research-bulk.mjs';
import {validateDossier,acceptDossier,integrateDossier} from './research-comprehensive.mjs';
import {prepareReviewedIntegration} from './research-scale.mjs';
import {inspectFlagAsset} from './research-flags.mjs';
import {auditRichProduction} from './research-scale-audit.mjs';
export function checkSupplement(pkg,job,review){
 if(review.packageHash!==digest(pkg)||review.reviewer===pkg.worker.id||!review.bodyReviewed||!review.rationale||!Object.keys(review.sourceBodyHashes||{}).length||job.id!==pkg.jobId)throw Error('Independent exact-package review required');
 for(const [file,hash]of Object.entries(review.sourceBodyHashes||{})){if(!path.resolve(file).startsWith(path.resolve(root,'research')+path.sep)||bytesHash(file)!==hash)throw Error('Original source/review bytes changed:'+file);}
 for(const a of review.assets||[]){if(bytesHash(a.stagedPath)!==a.sha256||!pkg.claims.some(c=>c.flag?.asset===a.asset&&c.flag.sha256===a.sha256))throw Error('Unbound staged asset');if(!/^\.\/assets\/flags\/[a-z0-9-]+\.svg$/.test(a.asset))throw Error('Unsafe asset destination');}
 for(const c of pkg.claims.filter(c=>c.flag))if(!(review.assets||[]).some(a=>a.asset===c.flag.asset&&a.sha256===c.flag.sha256))throw Error('Flag is not independently asset-bound');
 return true;
}
export function integrateSupplement(name,{apply=false}={}){
 if(!/^[a-z0-9-]+$/.test(name))throw Error('Unsafe supplement ID');
 const base='research/bulk-02/figures-flags/',pkg=readJSON(base+'packages/'+name+'.json'),job=readJSON(base+'jobs/'+name+'.json'),review=readJSON(base+'review/'+name+'.json');checkSupplement(pkg,job,review);
 const output='research/bulk-02/integrated/'+name+'.json',context=readContext(),store=readJSON('data/comprehensive-dossiers.json');
 if(store.packages.some(p=>p.id===name)){const saved=readJSON(output);if(saved.originalPackageHash!==digest(pkg))throw Error('Integrated supplement changed');return saved;}
 const before=auditRichProduction(context);
 if(!apply)return{preview:true,claims:pkg.claims.length,sourceBound:true,productionFingerprint:context.productionFingerprint,assetInstallationPending:(review.assets||[]).map(a=>a.asset)};
 saveJSON(output,{state:'prepared',originalPackageHash:digest(pkg),reviewHash:digest(review),before,assets:review.assets||[]});
 for(const a of review.assets||[]){const dest=path.resolve(root,a.asset);if(fs.existsSync(dest)&&bytesHash(dest)!==a.sha256)throw Error('Refuse existing asset overwrite');fs.mkdirSync(path.dirname(dest),{recursive:true});if(!fs.existsSync(dest))fs.copyFileSync(a.stagedPath,dest);if(inspectFlagAsset(a.asset,root,a.sha256).length)throw Error('Installed asset validation failed');}
 const fresh=readContext(),prepared=prepareReviewedIntegration(pkg,job,review,fresh);
 const validation=validateDossier(prepared.pkg,prepared.job,fresh);if(!validation.valid)throw Error(validation.errors.join('; '));
 const receipt=acceptDossier(prepared.pkg,prepared.job,fresh,{...prepared.receipt.review,packageHash:digest(prepared.pkg),reviewedIssues:validation.review});
 const integrated=integrateDossier(prepared.pkg,prepared.job,fresh,receipt,{apply:true});
 const after=auditRichProduction(readContext());if(!after.valid)throw Error(after.errors.join('; '));
 const result={state:'integrated',originalPackageHash:digest(pkg),reviewHash:digest(review),before,after,newClaims:after.claims-before.claims,assets:review.assets||[],sourceAliases:prepared.contextChange.sourceAliases,validation,integrated,browserChecks:0};saveJSON(output,result);return result;
}
if(isCLI(import.meta.url)){const result=integrateSupplement(process.argv[2],{apply:process.argv.includes('--apply')});console.log(JSON.stringify({state:result.state,preview:result.preview,newClaims:result.newClaims,claims:result.claims,checks:result.after?.checks}));}
