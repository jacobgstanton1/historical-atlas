// Monthly quotations are observations, never continuous legal-currency or GDP facts.
import {readJSON,saveJSON,digest,isCLI} from './research-common.mjs';
import {bytesHash,runTranche} from './research-bulk.mjs';
export function frb1960Intake(){
 const base='research/bulk-01/',raw=readJSON(base+'worker-currency/frb1960-extracted.json'),review=readJSON(base+'frb-review/mapping-source-review1960.json');
 if(review.extractionHash!==digest(raw)||review.pdfSha256!==bytesHash(raw.source.cachePath)||review.imageSha256!==bytesHash(base+'worker-currency/frb-1960-p1427.png')||!review.visualReviewed||!review.sourceBodyReviewed)throw Error('Independent original-facsimile review mismatch');
 const source={...raw.source,parser:raw.parser,accessed:'2026-10-02'};
 const rows=[...raw.currencyObservations,...raw.exchangeObservations].map(r=>{
  const decision=review.decisions.find(d=>d.id===r.id);if(!decision)throw Error('No independent source decision '+r.id);
  if(decision.observationDate!==r.observationDate||digest(decision.value)!==digest(r.value)||decision.category!==r.category||((decision.market||'')!==(r.market||'')))throw Error('Reviewed observation changed '+r.id);
  const rawRow=raw.headerRows.find(row=>r.id.startsWith(row.rowId+'-'));
  if(!rawRow)throw Error('Orphan original table row');
  const accepted=decision.decision==='accepted-source-and-mapping';
  const methods=review.sourceSemantics.method;
  const unit=r.rawMonetaryUnit||r.value; const market=r.market?(' ['+r.market+']'):'';
  const qualifications=r.category==='currency'?[...r.qualifications,'Monetary unit recorded in the contemporary quotation table at the stated observation month, not an assertion of sole legal tender.']:[...(r.qualifications||[]),methods,'U.S. cents per '+unit+'; monthly average quotation, not par value, GDP, a purchasing-power conversion or a territory-wide statistic.','Publication: December 1960; observation: '+r.observationDate+'. Column label: '+r.columnMonth+'; applicable source footnotes: '+(r.footnotes?.join(', ')||'none')+'.'];
  const originalRow=JSON.stringify({rawCountry:r.rawCountry,rawUnit:unit,rawValue:r.rawValue??r.value,value:r.value,market:r.market||null,columnMonth:r.columnMonth||null,actualObservationMonth:r.observationDate,footnoteIds:r.footnotes||[],rowId:rawRow.rowId});
  return{id:r.id,category:r.category,value:r.value,temporal:{kind:'observation',observationDate:r.observationDate,certainty:'exact'},precision:'month',sourceId:source.id,locator:r.locator,originalRow,qualifications,...(r.category==='economy'?{metric:'Foreign exchange quotation — '+unit+market+' (monthly New York average)',unit:'US cents per '+unit}:{}),entityIdsSuggested:accepted?review.contracts.filter(c=>c.rawCountry===r.rawCountry).map(c=>c.entityId):[],evidenceCautions:accepted?[]:[decision.rationale],disposition:accepted?'candidate':'historical-review'};
 });
 const manifest={schemaVersion:1,worker:'frb-coordinate-normalizer',sources:[source],rows,originalExtractionHash:digest(raw),independentReviewHash:digest(review)};
 const mappings=review.contracts.map(c=>({sourceId:source.id,entityId:c.entityId,from:c.from,until:c.until,scope:c.scope.description,scopeId:c.scope.id,statisticalComparability:'historically-matching',rationale:c.rationale,qualification:c.qualifications.join(' ')}));
 const parserPath=base+'worker-currency/extract-frb1960.py';
 const contract={schemaVersion:1,id:'frb-observations-1960',adapter:'dated-official-monetary-quotation/v1',tier:review.sourceTier,reviewer:review.reviewer+' / coordinator-facsimile-and-observation-rendering-review',manifestHash:digest(manifest),parserPath,parserSha256:bytesHash(parserPath),parserBindings:[{path:'scripts/research-bulk-frb1960.mjs',sha256:bytesHash('scripts/research-bulk-frb1960.mjs')}],mappings,endpointNote:'Observation dates are actual source months; no inferred validity interval.',rationale:'Independent original facsimile review and coordinate parser bind literal cells, quoted instruments, numeric values, all footnotes and historical frameworks. Coordinator inspected full page and existing dated presentation path: actual observation month is displayed unchanged. Nominal, reform, source-glyph, uncertain-date and geographic mapping cases stay held. Contemporary monetary quotation is not sole legal tender or national GDP.',independentReviewHash:digest(review)};
 saveJSON(base+contract.id+'-manifest.json',manifest);saveJSON(base+contract.id+'-contract.json',contract);return{manifest,contract};
}
if(isCLI(import.meta.url)){const {contract}=frb1960Intake();console.log(JSON.stringify(runTranche('research/bulk-01/'+contract.id+'-manifest.json','research/bulk-01/'+contract.id+'-contract.json',{apply:process.argv.includes('--apply')}).metrics,null,2));}
