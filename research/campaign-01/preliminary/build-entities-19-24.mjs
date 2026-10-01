// Isolated worker packages only. Original context is retained for coordinator revalidation.
import {readJSON,saveJSON,readContext} from '../../../scripts/research-common.mjs';
import {validatePackage} from '../../../scripts/research-validator.mjs';
const jobs=readJSON('research/campaign-01/jobs.json').jobs;
const worker={id:'campaign-design',specialism:'entity-core'};
const source=(id,title,institution,url,usage)=>({id,title,institution,url,accessed:'2026-10-01',kind:'official-institutional',usage});
const fiji=source('c01-fiji-levuka-unesco','Levuka Historical Port Town — Outstanding Universal Value','UNESCO World Heritage Centre','https://whc.unesco.org/en/list/1399/','Read full Outstanding Universal Value body: colonial capital at Levuka following 1874 cession and removal to Suva in 1882. Colonial descriptions are not evidence of consensual indigenous sovereignty.');
const nzCapital=source('c01-nz-wellington-history','Wellington City','Manatū Taonga — Ministry for Culture and Heritage, NZHistory','https://nzhistory.govt.nz/keyword/wellington','Read body: ever since 1865 Wellington identified as seat of central government, with historical capital selection and parliamentary relocation narrative. Supports bounded 1914–1946 administrative capital.');
const nzLeader=source('c01-nz-massey-tenure','William Massey — prime minister tenure','Manatū Taonga — Ministry for Culture and Heritage, NZHistory','https://nzhistory.govt.nz/keyword/william-massey','Read body and tenure table: prime minister 10 July 1912–10 May 1925. Formal tenure does not claim uninterrupted physical presence or exclude acting ministers during absences.');
const taiwanCapital=source('c01-taiwan-governor-seat','History of the Presidential Office Building','Office of the President, Republic of China (Taiwan)','https://english.president.gov.tw/Page/45','Read historical body: governor-general moved government seat to Taipei 14 June 1895; old office fire 1905; new Taipei building completed and offices moved 1919; continued governor office activities 1936. Building change is not capital-city change.');
const taiwanLeader=source('c01-taiwan-kodama-ncl','Kodama Gentarō — historical biographical entry','National Central Library, Taiwan Memory','https://tm.ncl.edu.tw/article?lang=chn&u=016_002_0000293684','Read full Chinese descriptive body: Taiwan governor tenure begins February 1898 and ends 11 April 1906. Biographical dates outside the office claim are not copied or used; no portrait reproduced.');
const finCurrency=source('c01-finland-rouble-history','Money and the Monetary System — Case Finland, 1811–2030','Bank of Finland','https://www.suomenpankki.fi/fi/ajankohtaista/puheet-ja-haastattelut/2025/money-and-the-monetary-system--case-finland-18112030/','Read historical currency-arrangement section: roubles and Swedish riksdalers circulated in first decades after 1809; rouble dominance later and instability 1853–1856; markka introduced 1860. Does not assert exclusive currency.');
const austriaLeader=source('c01-austria-presidents-history','Kennen Sie die bisherigen Amtsinhaber? — First Republic','Austrian Presidential Chancellery','https://www.bundespraesident.at/aktuelles/detail/bisherige-amtsinhaber','Read First Republic body: Seitz head of state through 9 December 1920; Hainisch president 9 December 1920–10 December 1928; Miklas 10 December 1928–13 March 1938. Different institutional titles preserved.');
const austriaCurrency=source('c01-austria-oenb-schilling-history','OeNB history — First Republic currency and crisis management','Oesterreichische Nationalbank','https://www.oenb.at/en/die-oenb/geschichte-der-oenb/unternehmensgeschichte.html','Read currency reform and crisis-management body: schilling replaced crown in 1925 and remained stable up to 1938. Conflicting official January/March 1925 commencement dates omitted by starting safely in 1926.');
function claim(job,id,category,value,ids,note,period=job.period,extra={}){
 return {id,category,value,temporal:{kind:'interval',...period},entityId:job.entityId,
 geographicScope:{description:job.name+'; institutional office or administrative seat, not a claim of uniform sovereignty or direct control over all polygon territory.',relationship:'same'},
 sourceIds:ids,evidence:ids.map(sourceId=>({sourceId,note,supportedPrecision:extra.precision||'year',supportsClaim:true,...period})),reviewStatus:'clear',cautions:[],...(extra.role?{role:extra.role}:{})};
}
const specs=[
 {entity:'fiji-british-colonial-core',sources:[fiji],claims:j=>[
 claim(j,'c01-fiji-levuka-capital','capital','Levuka',[fiji.id],'UNESCO body identifies Levuka colonial capital and transfer to Suva in 1882. Claim stops before the transfer year.',{from:'1878',until:'1881'}),
 claim(j,'c01-fiji-suva-capital','capital','Suva',[fiji.id],'UNESCO body dates removal of capital to Suva in 1882; claim begins after that year without inventing its day.',{from:'1883',until:'1900'})],
 omissions:['1882 capital transfer retains a gap because a precise transfer date is not established.','Governor chronology and currency were not sufficiently researched; existing colonial institutions remain sourced and unchanged.']},
 {entity:'new-zealand-preadoption-dominion-core',sources:[nzCapital,nzLeader],claims:j=>[
 claim(j,'c01-nz-wellington-capital','capital','Wellington',[nzCapital.id],'Official historical body identifies Wellington as central-government seat ever since 1865. Bounded Dominion interval 1914–1946 does not back-project later constitutional independence.'),
 claim(j,'c01-nz-massey-pm','leadership','William Ferguson Massey',[nzLeader.id],'Official tenure table dates Massey prime minister 10 July 1912–10 May 1925. Claim begins at assigned 1914 boundary and ends at death; office tenure does not imply sole or continuously present executive authority.',{from:'1914',until:'1925-05-10'},{role:'Prime Minister',precision:'day'})],
 omissions:['Later prime ministers and currency remain gaps; existing Dominion institutions preserved.']},
 {entity:'taiwan-japanese-administration',sources:[taiwanCapital,taiwanLeader],claims:j=>[
 claim(j,'c01-taiwan-taipei-seat','capital','Taipei (colonial administrative seat)',[taiwanCapital.id],'Official building history locates government seat in Taipei from 1895 and narrates old/new office continuity through 1936; 1905 fire and 1919 building move did not change city. Claim bounded to 1900–1930.'),
 claim(j,'c01-taiwan-kodama-governor','leadership','Kodama Gentarō',[taiwanLeader.id],'NCL Chinese body dates governor tenure from 1898 through 11 April 1906. Claim clipped to 1900; colonial office is not an independent Taiwanese national head of state.',{from:'1900',until:'1906-04-11'},{role:'Governor-General',precision:'day'})],
 omissions:['Later governor chronology and colonial currency remain gaps. The accepted Stage 1 Nakagawa package was not duplicated or retrospectively integrated.']},
 {entity:'british-raj',sources:[],claims:j=>[
 claim(j,'c01-raj-calcutta-capital','capital','Calcutta (central colonial administrative capital)',['raj-capital'],'NDMC historical body explicitly describes the 1911 decision to shift capital from Calcutta to Delhi. Claim covers pre-transfer 1859–1910; it does not assert uniform direct administration of princely states.')],
 omissions:['The complete viceroy chronology and pre-1935 currency validity need dedicated evidence; existing later-year facts are preserved.']},
 {entity:'finland-grand-duchy',sources:[finCurrency],claims:j=>[
 claim(j,'c01-finland-rouble-currency','currency','Russian rouble (not necessarily the only circulating currency)',[finCurrency.id],'Bank of Finland body identifies Russian roubles in circulation after 1809, initially with Swedish riksdalers, before the 1860 markka. The assigned 1820–1859 claim is about rouble circulation, not exclusive legal tender or a single monetary standard.',{from:'1820',until:'1859'})],
 omissions:['Helsinki and markka already have sourced coverage and are not duplicated. Imperial leadership chronology was not sufficiently established for acceptance.']},
 {entity:'austria-first-republic-framework',sources:[austriaLeader,austriaCurrency],claims:j=>[
 claim(j,'c01-austria-seitz-head','leadership','Karl Seitz',[austriaLeader.id],'Presidential Chancellery describes Seitz as head of state through 9 December 1920; he is not called federal president. Claim begins in assigned 1919.',{from:'1919',until:'1920-12-09'},{role:'Head of state',precision:'day'}),
 claim(j,'c01-austria-hainisch-president','leadership','Michael Hainisch',[austriaLeader.id],'Official body gives two successive presidential terms from 9 December 1920 through 10 December 1928.',{from:'1920-12-09',until:'1928-12-10'},{role:'Federal President',precision:'day'}),
 claim(j,'c01-austria-miklas-president','leadership','Wilhelm Miklas',[austriaLeader.id],'Official body dates Miklas presidency from 10 December 1928 to March 1938; claim stops at assigned 1932 bound and does not merge later authoritarian framework.',{from:'1928-12-10',until:'1932'},{role:'Federal President',precision:'day'}),
 claim(j,'c01-austria-schilling-currency','currency','Austrian schilling',[austriaCurrency.id],'OeNB body states schilling replaced crown in 1925 and remained currency through 1938. Claim begins in 1926 to exclude conflicting January/March 1925 legal/operational commencement accounts.',{from:'1926',until:'1932'})],
 omissions:['1925 currency commencement details require review: official OeNB history says January; anniversary releases say March. No precise contested transition claim integrated.','Capital interval not researched adequately; existing constitutional facts are preserved.']}
];
// Validate against the immutable original campaign fingerprint, while allowing the coordinator
// to integrate independent completed packages serially during this research assignment.
const context=readContext();context.productionFingerprint=jobs[0].productionFingerprint;
for(const spec of specs){
 const job=jobs.find(j=>j.entityId===spec.entity);if(!job)throw Error('Missing assigned job');
 const pkg={schemaVersion:1,id:'package-'+job.id,jobId:job.id,worker,productionFingerprint:job.productionFingerprint,entityId:job.entityId,mapIds:job.mapIds,period:job.period,category:'core-state',categories:job.categories,claims:spec.claims(job),sources:spec.sources,absenceOfEvidence:spec.omissions,reviewNotes:['Independent body evidence reviewed. Package uses original assigned context; coordinator must revalidate against current production before integration.']};
 const validation=validatePackage(pkg,job,context);if(!validation.valid)throw Error(JSON.stringify(validation));
 saveJSON('research/campaign-01/packages/'+spec.entity+'.json',pkg);
 saveJSON('research/campaign-01/evidence/'+spec.entity+'.json',{worker,jobId:job.id,entityId:job.entityId,period:job.period,independentBodyReview:true,claims:pkg.claims.map(c=>({claimId:c.id,sourceIds:c.sourceIds,evidenceNote:c.evidence[0].note})),omissions:spec.omissions,validation});
 console.log(spec.entity+': '+pkg.claims.length+' claims; validation '+validation.status);
}
