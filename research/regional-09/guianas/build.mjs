// Candidate intake only. Production integration requires independent certification.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readContext} from '../../../scripts/research-common.mjs';
const root='research/regional-09/guianas';
const known=[...readContext().registry.sources,...JSON.parse(fs.readFileSync('data/comprehensive-dossiers.json')).packages.flatMap(p=>p.sources)];
const url='https://www.cbvs.sr/over-cbvs/oprichting-cbvs';
const source=known.find(s=>s.url===url)||{id:'r09-guianas-cbvs-history',title:'Oprichting van de CBvS',institution:'Centrale Bank van Suriname',url,kind:'official-institutional',accessed:'2026-10-03',usage:'Dated monetary history paragraphs; modern dollar references and apparent liquidation-date error excluded. Individual factual paraphrases only.'};
const claims=[];
function add(entityId,category,value,temporal,locator,qualifications=[]){
 claims.push({id:'r09-guianas-'+crypto.createHash('sha256').update(JSON.stringify([entityId,category,value,temporal])).digest('hex').slice(0,20),entityId,category,value,temporal,scope:{id:entityId+'-monetary-history',description:'Suriname monetary jurisdiction; does not assert compatibility of statistical geography with atlas geometry.',relationship:'same'},sourceIds:[source.id],evidence:[{sourceId:source.id,locator,note:'Original central-bank historical body inspected. Interior research bounds clip the documented monetary era to the existing entity framework; not new historical commencement or termination dates.',precision:temporal.kind==='event'?'day':'year',temporal,interpretation:'direct'}],status:'supported',risks:[],qualifications,origin:{kind:'new-research',reference:source.id}});
}
add('suriname-koloniale-staten-framework','currency','Guilder-denominated money within the Dutch monetary system',{kind:'interval',from:'1868',until:'1935',certainty:'exact'},'Historical monetary paragraphs: connection to Dutch monetary system 1827–1940; Dutch coins and notes; De Surinaamsche Bank from 1865; guilder decoupling in 1940.',['Dutch monetary connection; local banknotes also circulated. Does not imply exclusively metropolitan notes.']);
add('suriname-kingdom-autonomy-framework','currency','Surinamese guilder',{kind:'interval',from:'1956',until:'1960',certainty:'exact'},'Historical paragraph: Surinamese guilder detached from Dutch guilder and linked to US dollar in 1940; monetary autonomy thereafter.',['Contemporary guilder retained; modern Surinamese dollar is not projected backwards.']);
add('suriname-kingdom-autonomy-framework','events-context','The Centrale Bank van Suriname began operations.',{kind:'event',date:'1957-04-01',certainty:'exact'},'Opening paragraph explicitly dates commencement to 1 April 1957.');
fs.mkdirSync(root,{recursive:true});
fs.writeFileSync(root+'/cohort.json',JSON.stringify({id:'regional09-guianas-monetary-frameworks',worker:'regional09-root-guianas-researcher',sources:[source],claims},null,2)+'\n');
console.log(JSON.stringify({claims:claims.length,sources:1}));
