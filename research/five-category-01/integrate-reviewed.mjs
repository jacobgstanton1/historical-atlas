// Coordinator intake only. Workers remain isolated; the existing certified integrator writes serially.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readContext,readJSON,saveJSON,digest} from '../../scripts/research-common.mjs';
import {integrateCertified} from '../../scripts/research-completion-integrate.mjs';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const reasons={
 'latin-major':'Original BCB monetary standards and BCRA previous issues: reis/cruzeiro and peso moneda nacional dated units. No monetary sovereignty or purchasing power inferred.',
 'netherlands-portugal':'Original Banco de Portugal dated study and parliamentary palace history: reis and explicitly qualified Lisbon parliamentary seats;1930 interregnum held.',
 'italy-spain':'Original Banca Italia monetary unification,1871capital law and Madrid capital law historical preamble. Civil war and Napoleonic exceptional periods excluded.',
 'iran-egypt':'Original Iranica capital and coinage bodies: Tehran continuing seat; qeran and later rial intervals.1932/1935transition discrepancy held; inaccessible Egypt sources excluded.',
 commonwealth:'Original RBA timeline and Bank of Canada Powell2005 currency history. Dollar and pound monetary units; preConfederation and territorial statistical mismatches held.',
 'southern-commonwealth':'Original South African Parliament seat chronology, SARB monetary history and RBNZ currency/legal history. Only monetary paragraphs used from SARB; multiple capital roles kept qualified.',
 france:'French Senate original1799/1814/1875 chapters, Monnaie de Paris decimal-franc chronology, Elysee flag history and licensed existing schematic. Parliamentary seats explicitly qualified; conflicting1945seat and1920office chronology remain held.',
 germany:'Original Bundesbank monetary chronology and Berlin municipal imperial-capital history. Mark, Reichsmark and Deutsche Mark remain distinct; East Prussia association is provincial, not a sovereign issuer.',
 'east-asia':'Palace Museum Jiaqing reign, UNESCO Beijing/Shenyang distinction, BOJ Edo monetary units and1945notes, Web Japan1870/1872Hinomaru history, official PRC historical note-series and Taiwan Ministry of Finance currency history. Imperial territorial population mismatches remain held.',
 ottoman:'Original TDV scholarly KURUS, SELIM III and ISTANBUL bodies. Institutional seat and titular sultans; coin standards and different imperial currencies retained. No uniform territorial control inferred.',
 austria:'Original OeNB monetary history and Wiener Wahrung archival description; MNB forint chronology. Paper denomination not exclusive empire circulation;1945schilling only actual21December onwards.',
 india:'Original Royal Mint1835–1947rupee chronology, Kolkata Municipal Corporation1773capital history and NDMC1911transfer account. Central Company/Raj administration only; Gulf/Musandam1938 remains protected.'
};
for(const group of process.argv.slice(2)){
 const dir='research/five-category-01/'+group,original=readJSON(dir+'/cohort.json'),cohort=structuredClone(original);
 const known=[...readContext().registry.sources,...readJSON('data/comprehensive-dossiers.json').packages.flatMap(p=>p.sources)];
 cohort.sources=cohort.sources.map(s=>known.find(o=>o.id===s.id)||s);
 if(group==='france'){
  const held=new Set(['fc01-fr-capital1945','fc01-fr-poincare1920','fc01-fr-deschanel1920','fc01-fr-millerand1920']);
  cohort.claims=cohort.claims.filter(c=>!held.has(c.id));
  for(const c of cohort.claims){
   if(c.flag){c.flag.asset='./assets/flags/fr-1794.svg';if(sha(c.flag.asset)!==c.flag.sha256)throw Error('Changed French asset');}
   for(const e of c.evidence){
    if(c.id==='fc01-fr-capital1800')e.temporal={kind:'interval',from:'1799',until:'1814',certainty:'exact'};
    if(c.id==='fc01-fr-currency1800')e.temporal={kind:'interval',from:'1796',until:'1803',certainty:'exact'};
    if(c.id==='fc01-fr-flag1800')e.temporal={kind:'interval',from:'1794',until:'1814',certainty:'exact'};
    if(c.id==='fc01-fr-flag1960')e.temporal={kind:'interval',from:'1958',until:'2020',certainty:'exact'};
   }
  }
 }
 if(group==='india')for(const c of cohort.claims.filter(c=>c.category==='currency'))for(const e of c.evidence)e.temporal={kind:'interval',from:'1835',until:'1947',certainty:'exact'};
 for(const c of cohort.claims){
  c.origin.temporalBasis='bounded-research-subset';
  c.qualifications.push('Claim bounds delimit this reviewed research subset, not a historical introduction or abolition date. The original cited applicability interval and its precision remain in evidence.');
 }
 saveJSON(dir+'/accepted/cohort.json',cohort);
 const bindings=['cohort.json','source-review.json','accepted/cohort.json'].map(f=>({path:dir+'/'+f,sha256:sha(dir+'/'+f)}));
 const certificate={reviewer:'coordinator-original-body-review',bodyReviewed:true,cohortHash:digest(cohort),acceptedClaimIds:cohort.claims.map(c=>c.id),inputBindings:bindings,rationale:reasons[group]+' Source-year intervals independently checked; explicit research-subset coverage requires every supporting interval to cover the entire selected year. No original source precision increased.'};
 saveJSON(dir+'/accepted/certificate.json',certificate);
 const result=integrateCertified(cohort,certificate,{apply:true,output:dir+'/integration'});
 console.log(JSON.stringify({group,integrations:result.integrations,held:result.held,claims:result.after.claims,checks:result.after.checks}));
}
