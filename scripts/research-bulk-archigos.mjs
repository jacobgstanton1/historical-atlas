// Academic effective-ruler coding is deliberately distinct from formal offices.
import {readJSON,saveJSON,readContext,digest,isCLI} from './research-common.mjs';
import {bytesHash,runTranche} from './research-bulk.mjs';
const base='research/bulk-01/';
const file=base+'cache/archigos-extracted.json';
export function archigosIntake(cohort=1){
 const reviewed=readJSON(base+'archigos-review/mapping-contracts.json'),cert=readJSON(base+'archigos-review/parser-certification.json'),raw=readJSON(file),context=readContext();
 for(const [key,p]of [['dta',base+'cache/Archigos_4.1_stata14.dta'],['pdf',base+'cache/Archigos_4.1.pdf'],['extracted',file]])if(bytesHash(p)!==reviewed.source.hashes[key])throw Error('Reviewed academic source changed: '+key);
 if(cert.mismatches.length||cert.rows!==raw.length||cert.originalDtaSha256!==reviewed.source.hashes.dta||cert.extractedSha256!==reviewed.source.hashes.extracted)throw Error('Independent original-DTA extraction proof mismatch');
 const ids=new Set();for(const r of raw){if(ids.has(r.obsid))throw Error('Duplicate original row '+r.obsid);ids.add(r.obsid);}
 const allCodes=[...new Set(reviewed.contracts.map(c=>c.sourceCountryCode))].sort();
 // Country-based cohorts keep all intervals/contracts for a country together.
 const cohorts=[allCodes.slice(0,15),allCodes.slice(15,29),allCodes.slice(29)];
 if(!cohorts[cohort-1])throw Error('Cohort must be 1–3');
 const codes=cohorts[cohort-1];
 const source={id:'bulk01-archigos-v41',url:'https://www.rochester.edu/college/faculty/hgoemans/Archigos_4.1_stata14.dta',title:reviewed.source.title,institution:'H. E. Goemans, Kristian Skrede Gleditsch and Giacomo Chiozza; University of Rochester / University of Essex',cachePath:base+'cache/Archigos_4.1_stata14.dta',sha256:reviewed.source.hashes.dta,parser:'Archigos Stata14→pandas core fields / independent 20454-field comparison',accessed:'2026-10-02',kind:'academic-historical-leadership-dataset'};
 const mappings=reviewed.contracts.filter(c=>codes.includes(c.sourceCountryCode)).map(c=>{
  const e=context.db.entities.find(e=>e.id===c.entityId),ex=e.existence||e,n=e.names.find(n=>n.kind==='primary')||e.names[0],begin=ex.validFrom||n.validFrom;
  let from=c.from;
  if(begin?.length===4)from=[from,String(Number(begin)+1)+'-01-01'].sort().at(-1);
  if(begin?.length===7){let y=Number(begin.slice(0,4)),m=Number(begin.slice(5))+1;if(m===13){y++;m=1;}from=[from,String(y)+'-'+String(m).padStart(2,'0')+'-01'].sort().at(-1);}
  return{sourceId:source.id,entityId:c.entityId,from,until:c.until,sourceCountryCode:c.sourceCountryCode,role:c.role,scope:'Entity-associated effective central political leadership according to Archigos, within '+c.existingIdentity.name+'; country coding does not establish polygon-wide authority.',rationale:c.rationale+' '+c.sourceCountryLocator,qualification:c.qualifications.join(' ')+' Literal dataset leader label retained, without an invented name expansion. Uncertain framework-start years/months are excluded from research coverage.'};
 });
 const holds=new Map([...reviewed.held.rows,...reviewed.held.encoding].map(x=>[x.obsid,x.reason]));
 const rows=raw.filter(r=>codes.includes(r.idacr)&&r.startdate<'1961-01-01'&&r.enddate>'1875-01-01').map(r=>{
  const evidenceCautions=[];if(holds.has(r.obsid))evidenceCautions.push(holds.get(r.obsid));if(/[^\x20-\x7e]/.test(r.leader))evidenceCautions.push('Non-ASCII source label requires original-byte/name verification after decoder fallback.');if(r.startdate>=r.enddate)evidenceCautions.push('Same-day or reversed coded interval requires review.');if(!r.leader?.trim())evidenceCautions.push('Missing coded leader label.');
  return{name:r.leader,officeTitle:'Effective political leader (Archigos coding)',from:r.startdate,until:r.enddate,precision:'day',sourceId:source.id,locator:'Archigos v4.1 original DTA row '+r.obsid+'; leadid '+r.leadid+'; idacr '+r.idacr+'; STARTDATE/ENDDATE',originalTerm:r.startdate+' to '+r.enddate,originalRow:JSON.stringify({obsid:r.obsid,leadid:r.leadid,idacr:r.idacr,leader:r.leader,startdate:r.startdate,enddate:r.enddate}),entityIdsSuggested:mappings.filter(c=>c.sourceCountryCode===r.idacr&&r.startdate<c.until&&r.enddate>c.from).map(c=>c.entityId),evidenceCautions};
 });
 const manifest={schemaVersion:1,worker:'archigos-core-field-normalizer',sources:[source],rows,originalExtractionHash:reviewed.source.hashes.extracted,independentComparisonCertificateHash:digest(cert),countryCodes:codes};
 const parserPath='scripts/research-bulk-archigos.mjs',mappingParser='research/bulk-01/archigos-review/contracts.mjs';
 const contract={schemaVersion:1,id:'archigos-officeholders-0'+cohort,adapter:'dated-academic-effective-leader/v1',tier:'B — independently reviewed academic coding and existing historical frameworks',reviewer:reviewed.reviewer+' / coordinator-normalized-core-field-review',manifestHash:digest(manifest),parserPath,parserSha256:bytesHash(parserPath),parserBindings:[{path:mappingParser,sha256:bytesHash(mappingParser)}],mappings,endpointNote:reviewed.datePolicy.integrationRule,rationale:'Independent source review binds original codebook definition, exact DTA hash, all 20454 direct core-field comparisons and bounded country/entity contracts. Coordinator normalization retains literal six core fields, source spelling and dates; formal offices, nationality, succession and polygon sovereignty are not inferred. Conflicting and non-ASCII rows are held. Mapping start-year uncertainty is excluded, not rewritten.',reviewCertificateHash:digest(reviewed),parserCertificateHash:digest(cert)};
 saveJSON(base+contract.id+'-manifest.json',manifest);saveJSON(base+contract.id+'-contract.json',contract);return{manifest,contract};
}
if(isCLI(import.meta.url)){const cohort=Number(process.argv[2]||1),{contract}=archigosIntake(cohort);console.log(JSON.stringify(runTranche(base+contract.id+'-manifest.json',base+contract.id+'-contract.json',{apply:process.argv.includes('--apply')}).metrics,null,2));}
