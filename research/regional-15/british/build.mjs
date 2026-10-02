// Worker-only intake. This never writes production data or creates review acceptance.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readContext} from '../../../scripts/research-common.mjs';
const root='research/regional-15/british',ctx=readContext();
const store=JSON.parse(fs.readFileSync('data/comprehensive-dossiers.json'));
const known=[...ctx.registry.sources,...store.packages.flatMap(p=>p.sources||[])];
const sources=[],claims=[];
function source(id,title,institution,url,kind='official-institutional'){
 const old=known.find(s=>s.url===url);const s=old||{id,title,institution,url,accessed:'2026-10-02',kind,usage:'Individual dated factual paraphrases, preserving original scope and limitations; no source images or wholesale copyrighted text redistributed.'};
 if(!sources.some(x=>x.id===s.id))sources.push(s);return s.id;
}
const cbn=source('r15-british-cbn','History of Nigerian Currency','Central Bank of Nigeria','https://www.cbn.gov.ng/Currency/historycur.html');
const cbg=source('r15-british-cbg','Evolution of Currency in The Gambia','Central Bank of The Gambia','https://www.cbg.gm/evolution-of-currency-in-the-gambia');
const bathurst=source('r15-british-bathurst-history','How Bathurst renamed Banjul 8 years after independence','The Point; historian Hassoum Ceesay interviewed','https://thepoint.gm/africa/gambia/headlines/how-bathurst-renamed-banjul-8-years-after-independence','historian-interview');
const ny=source('r15-british-nigeria-yearbook1966','Nigeria Year Book 1966','Daily Times of Nigeria / Times Press Limited; preserved by National Library of Nigeria','https://nigeriareposit.nln.gov.ng/server/api/core/bitstreams/87de79b0-9d98-4f27-81ec-e78ec57e4f00/content','contemporary-reference-yearbook');
const annual={};for(const y of [1900,1914,1920,1930])annual[y]=source('r15-british-gambia-'+y,'Colonial Reports—Annual: Gambia, report for '+y,'Colonial Government / His Majesty’s Stationery Office; University of Illinois digital preservation',`https://libsysdigi.library.illinois.edu/ilharvest/Africana/Books2011-05/466568/466568_${y}/466568_${y}_opt.pdf`,'contemporary-official-report');
function add(entityId,category,value,temporal,sourceIds,locator,extra={}){
 const id='r15-british-'+crypto.createHash('sha256').update(JSON.stringify([entityId,category,value,temporal])).digest('hex').slice(0,20);
 const precision=temporal.date?.length===10||temporal.from?.length===10?'day':temporal.date?.length===7?'month':'year';
 claims.push({id,entityId,category,value,temporal,scope:{id:entityId+'-british-'+category,description:'Named colonial administration. Currency and administrative office statements do not assert uniform sovereignty or polygon-compatible statistical territory.',relationship:'same'},sourceIds,evidence:sourceIds.map(sourceId=>({sourceId,locator,note:'Read original source body. Research bounds are conservative scope cutoffs, not new historical founding, accession or dissolution dates.',precision,temporal,interpretation:'direct'})),status:'supported',risks:[],qualifications:[],origin:{kind:'new-research',reference:sourceIds[0]},...extra});
}
const interval=(from,until)=>({kind:'interval',from,until,certainty:'exact'});
const obs=y=>({kind:'observation',observationDate:String(y),certainty:'exact'});
// Shared currency system, bounded to registry windows. No early note-issue date is asserted.
for(const [id,from,until]of [
 ['sierra-leone-colony-protectorate-core','1913','1950'],
 ['gold-coast-pre1925-councils-core','1913','1924'],
 ['gold-coast-1930-chiefly-framework-core','1928','1934'],
 ['gold-coast-post1935-authorities-core','1936','1945'],
 ['nigeria-1914-amalgamation-core','1914','1915'],
 ['nigeria-1920-consultative-core','1917','1921']])add(id,'currency','West African Currency Board pound',interval(from,until),[cbn],'Historical currency paragraph: WACB issued pound-denominated money in Nigeria, Ghana/Gold Coast, Sierra Leone and The Gambia during the regional currency-board era. Conservative interior research window; no claim that notes existed from the first establishment year.');
// Gambia chronology is more specific than CBN’s compressed regional summary.
for(const [id,from,until]of [
 ['gambia-colony-protectorate-core','1918','1944'],['gambia-1945-governor-core','1945','1945'],['gambia-1960-governor-core','1960','1960']])add(id,'currency','West African Currency Board pound',interval(from,until),[cbg],'Currency history: pound-denominated WACB notes circulated from late 1917; new Gambia Currency Board notes appeared in October 1964 and WACB coins were replaced in November 1966.');
add('gambia-1878-british-settlement-core','currency','French five-franc silver coins principally circulated',interval('1880','1880'),[cbg],'By 1880 silver coins, mainly French five-franc pieces, were in general use.',{qualifications:['Describes circulation, not an exclusive legal-tender system. Other payment media are not excluded.']});
add('gambia-colony-protectorate-core','currency','West African coinage alongside English coins and French five-franc pieces',interval('1914','1914'),[annual[1914]],'Report 1914, printed page 5, paragraph 11: West African coinage introduced in 1913 was current; English coins and five-franc pieces also circulated.',{qualifications:['Contemporary mixed circulation; not an assertion of exclusive pound notes or exclusive legal tender.']});
// Bathurst remains a local administrative seat in the West African Settlements period.
for(const [id,from,until]of [
 ['gambia-1878-british-settlement-core','1878','1880'],['gambia-colony-protectorate-core','1900','1944'],['gambia-1945-governor-core','1945','1945'],['gambia-1960-governor-core','1960','1960']])add(id,'capital','Bathurst',interval(from,until),[bathurst,annual[1930]],'Historian interview explicitly dates the capital name Bathurst from 1816 to 1973; 1930 contemporary report History and Geography identifies Bathurst as seat of government and dates establishment to 1816.',{qualifications:['Local seat of the Gambian administration; does not substitute Bathurst for the superior West African Settlements administration at Freetown.']});
// Nigeria contemporary reference yearbook lists accession years. Omit ambiguous boundary years.
for(const [id,name,role,from,until,locator]of [
 ['nigeria-1920-consultative-core','Sir H. C. Clifford','Governor','1920','1921','Governor Clifford 1919; successor Thompson 1925.'],
 ['nigeria-clifford-framework-core','Sir B. H. Bourdillon','Governor','1936','1942','Governor Bourdillon 1935; successor A. F. Richards 1943.'],
 ['nigeria-clifford-framework-core','Sir A. F. Richards','Governor','1944','1945','Governor Richards 1943; next table entry 1948–54.']])add(id,'leadership',name,interval(from,until),[ny],'Nigeria Year Book 1966, printed page 19 / PDF page 21, Governors and Presidents: '+locator,{role,qualifications:['Source provides accession years. Complete interior years only; bounds are research cutoffs, not asserted exact office-entry or exit dates.','Name retained as printed in the contemporary reference yearbook, avoiding unsupported expansion of initials.']});
add('nigeria-1914-amalgamation-core','events-context','Northern and Southern Nigerian administrations were amalgamated as the Colony and Protectorate of Nigeria.',{kind:'event',date:'1914',certainty:'exact'},[ny],'Nigeria Year Book 1966, printed page 19: amalgamation of the two administrations in 1914.');
add('gambia-colony-protectorate-core','events-context','Governor Sir Edward J. Cameron retired in July. Governor-designate Captain C. H. Armitage had not arrived by the end of the year.',{kind:'event',date:'1920-07',certainty:'exact'},[annual[1920]],'Report 1920, printed page 2, General paragraph: July retirement; designated successor not arrived by year-end.',{qualifications:['Armitage is not represented as holding the Gambian governorship during 1920.']});
add('gambia-colony-protectorate-core','events-context','Mr. H. R. Palmer arrived and assumed administration of the Colony and Protectorate.',{kind:'event',date:'1930-09-11',certainty:'exact'},[annual[1930]],'Report 1930, printed page 7, General: administration assumed 11 September.');
add('gambia-colony-protectorate-core','events-context','War disrupted trade from August, causing imports to fall through the remainder of the year.',{kind:'event',date:'1914-08',certainty:'exact'},[annual[1914]],'Report 1914, printed page 6, Trade paragraph 17: August hostilities and subsequent import decline.',{qualifications:['Contemporary report’s economic-war context, not a claim of fighting inside The Gambia.']});
// Numeric economic observations; never GDP and never interpolated into other years.
for(const [y,value,metric,locator,qual]of [
 [1900,49160,'government-revenue','Report 1900, printed page 4, Financial A: revenue for 1900 £49,160.','Colonial public revenue, not national income or GDP.'],
 [1914,926127,'exports-value','Report 1914, printed page 7, paragraph 23: total exports £926,127; includes specie £232,469.','Total exports including specie; nominal contemporary pounds, not GDP.'],
 [1920,268788,'government-revenue','Report 1920, printed page 2, Government Finance table: 1920 revenue £268,788.','Colonial public revenue, not national income or GDP.'],
 [1930,139927,'customs-revenue','Report 1930, printed page 8, Customs: receipts in 1930 £139,927.','Customs receipts only, not total government revenue, income or GDP.']])add('gambia-colony-protectorate-core','economy',value,obs(y),[annual[y]],locator,{metric,unit:'GBP',qualifications:[qual,'Actual observation year retained; no extension as an interval.']});
const cohort={id:'regional15-british-currency-administration-finance',worker:'regional-british-research-worker',sources,claims};
fs.writeFileSync(root+'/cohort.json',JSON.stringify(cohort,null,2)+'\n','utf8');
console.log(JSON.stringify({claims:claims.length,sources:sources.length,entities:new Set(claims.map(c=>c.entityId)).size,categories:Object.fromEntries([...new Set(claims.map(c=>c.category))].map(k=>[k,claims.filter(c=>c.category===k).length]))}));
