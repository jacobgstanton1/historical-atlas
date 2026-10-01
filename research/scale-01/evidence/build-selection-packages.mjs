import {create,I,E,O} from './selection-build.mjs';

{
 const p=create('japan-postwar-framework','1948-01-01','1961-01-01');
 for(const [f,c] of [['names','identity'],['governments','political-institutional'],['leaders','leadership'],['capitals','capital'],['currencies','currency'],['descriptions','overview']])p.reuse(f,c);
 const s=p.source('japan-constitution','The Constitution of Japan','National Diet Library','https://www.ndl.go.jp/constitution/e/etc/c01.html','Original constitutional text, not a contemporary description of practice.');
 const items=[
 ['rights','Articles 11–24','Constitutional guarantees covered equality, electoral rights, religion, expression, academic freedom and marriage equality.'],
 ['social-rights','Articles 25–29','Social guarantees included minimum living standards, compulsory free education and collective labour rights.'],
 ['due-process','Articles 31–40','Criminal safeguards included legal procedure, warrants, counsel, protection against torture and double jeopardy.'],
 ['legislative-terms','Articles 45–46','Representatives had four-year terms subject to dissolution; councillors six-year terms with half elected every three years.'],
 ['dissolution','Article 54','Dissolution required elections within forty days and Diet convocation within thirty days of election.'],
 ['legislative-priority','Articles 59–61','The lower house could override legislative disagreement by two-thirds and had priority on budgets and treaties.'],
 ['cabinet-accountability','Articles 65–69','The civilian cabinet was collectively responsible to the Diet; no confidence required resignation or dissolution within ten days.'],
 ['judiciary','Articles 76–82','An independent judiciary included Supreme Court constitutional review and voter review of Supreme Court appointments.'],
 ['finance','Articles 83–91','Taxation and expenditure required Diet authority; annual accounts underwent Board of Audit examination.'],
 ['local-autonomy','Articles 92–95','Local assemblies and chief executives were directly elected; locality-specific legislation required local referendum consent.'],
 ['amendment','Article 96','Constitutional amendment required two-thirds in each house and popular majority ratification.']
 ];
 for(const [key,loc,value]of items)p.claim(key,'political-institutional',value,I('1948-01-01','1961-01-01'),s,loc,'Formal constitutional provisions; bounded to the research period, without asserting identical enforcement.',{metric:key,qualifications:['Constitutional text describes the legal framework, not an assessment of practical enforcement.']});
 const occ=p.source('japan-occupation','Occupation and Reconstruction of Japan, 1945–52','US Department of State, Office of the Historian','https://history.state.gov/milestones/1945-1952/japan-reconstruction','Retrospective occupation chronology.');
 p.claim('reverse-course','overview','Occupation policy shifted toward economic rehabilitation during 1948–1950.',I('1948','1950'),occ,'Reverse course paragraphs','Article explicitly bounds the policy phase to late 1947/early 1948 through 1950.',{qualifications:['Historical policy phase; not a quantified economic series.']});
 p.claim('korean-war-supply','events-context','The Korean War made Japan a principal supply depot for UN forces.',E('1950'),occ,'Korean War paragraph','Event is attributed to the 1950 outbreak, not generalized to all later years.');
 p.claim('peace-conference','events-context','Forty-nine states signed the peace treaty at the San Francisco conference.',E('1951-09'),occ,'Final peace treaty paragraph','Source gives September 1951, without day precision.');
 p.notes.push({sourceId:s,bodyReviewed:true,route:'Web full original text, chapters III–IX, articles 11–96',finding:'Eleven coherent constitutional bundles; no modern amended constitution or geometry inference.'},{sourceId:occ,bodyReviewed:true,route:'Web full article, reverse-course and treaty paragraphs',finding:'Economic policy narrative and dated events; no GDP fabricated.'});
 p.save({'historical-flag':['Flag acquisition is assigned separately; existing merchant-flag qualification is not silently generalized.'],'population-statistics':['Existing census observations have prefectural/excluded-territory qualifications; no new interchangeable polygon statistic accepted.'],'important-figures':['Nobel biography endpoint returned 403; no biographical claim accepted from snippets.'],'area-statistics':['No same-geography dated area observation established.'],density:['No compatible population/area pair.'],economy:['Narrative policy acquired under overview; no defensible GDP series.']});
}

{
 const p=create('ethiopia-1931-constitutional-core','1932-01-01','1935-01-01');
 p.reuse('names','identity');p.reuse('governments','political-institutional');p.reuse('descriptions','overview');
 const s=p.source('b18-ethiopia-prewar','Haile Selassie: The Prewar Period, 1930–36','Library of Congress Federal Research Division','https://countrystudies.us/ethiopia/17.htm','Country Study historical chapter.');
 p.claim('haile','leadership','Haile Selassie I',I('1932-01-01','1935-01-01'),s,'Opening paragraph and prewar reform account','Crowned in November 1930 and emperor throughout the bounded prewar interval.',{role:'Emperor'});
 p.claim('succession','political-institutional','The 1931 constitution reserved imperial succession to Haile Selassie’s line.',I('1932-01-01','1935-01-01'),s,'July 1931 constitution paragraph','Prior enactment explicitly contextualized to the subsequent constitutional interval.',{metric:'dynastic-succession'});
 p.claim('gojam-revolt','events-context','Ras Hailu’s Gojam revolt supporting Lij Iyasu was suppressed; a new governor replaced him.',E('1932'),s,'Gojam revolt paragraph','Source supports year only.');
 p.claim('centralisation','overview','By 1934 loyal provincial rulers covered several core and southern provinces, while Tigray and other regions limited central control.',I('1934','1934'),s,'Provincial rulers paragraph','This is qualified administrative reach, not atlas-polygon sovereignty.',{qualifications:['Uneven control is explicit; no sovereignty inferred from geography.']});
 p.claim('land-tenure','overview','Centralisation did not directly abolish the established highland gult and southern land-allocation systems.',I('1932-01-01','1935-01-01'),s,'Land tenure paragraph','Prewar policy description bounded within the chapter period.');
 p.notes.push({sourceId:s,bodyReviewed:true,route:'Web full seven-paragraph chapter',finding:'1932 revolt, 1934 reach and imperial leadership established; general school/student counts lack an observation date and are omitted.'});
 p.save({'population-statistics':['No dated territorial census acquired; approximate student count is not national population.'],currency:['Bank founded 1931 issued currency, but this source does not establish a denomination/date series; omitted.'],'events-context':['1935 invasion is outside the assignment and entity envelope.'],'important-figures':['Haile Selassie is represented as a dated office holder; no unsupported culture list.'],economy:['Land-tenure narrative retained, no observation-dated national accounts.']});
}

{
 const p=create('egypt-kingdom-treaty-framework','1937-01-01','1939-01-01');
 p.reuse('names','identity');p.reuse('governments','political-institutional');p.reuse('descriptions','overview');
 const s=p.source('b14-egypt-kingdom','The Era of Liberal Constitutionalism and Party Politics','Library of Congress Federal Research Division','https://countrystudies.us/egypt/29.htm','Country Study account of constitutional politics and treaty.');
 p.claim('faruk','leadership','Faruk',I('1937-01-01','1939-01-01'),s,'Fuad succession and treaty paragraphs','Succession in April 1936 precedes selected period; chapter covers the reign during 1937–38.',{role:'King'});
 p.claim('crown-powers','political-institutional','The king could appoint the prime minister, dismiss cabinets and dissolve Parliament.',I('1937-01-01','1939-01-01'),s,'Opening constitutional powers paragraphs','Legal powers contextualized to the constitutional political framework.',{metric:'royal-prerogatives'});
 p.claim('canal-garrison','political-institutional','The 1936 treaty permitted a British garrison of 10,000 in the Suez Canal Zone.',I('1937-01-01','1939-01-01'),s,'Treaty military and defense alliance paragraph','Permitted garrison strength is a treaty term, not an observation of actual deployed personnel.',{metric:'treaty-garrison',qualifications:['Treaty authorization; not a population or military census.']});
 p.claim('sudan','overview','British practical control in Sudan coexisted with continuing Egyptian nationalist demands; joint condominium language did not establish equal control.',I('1937-01-01','1939-01-01'),s,'Condominium and Wafd demands paragraphs','Explicit contested political context; no geometry-derived sovereignty.',{qualifications:['No claim of Egyptian exclusive sovereignty or automatic succession.']});
 p.claim('treaty-limits','overview','Treaty changes redesigned British representation as an embassy and phased out mixed courts, but left major independence limitations.',I('1937-01-01','1939-01-01'),s,'Treaty advances and limitations paragraph','Phasing-out is not represented as immediate complete abolition.');
 p.claim('saadists','events-context','Dissident Wafd members formed the Saadist Party.',E('1938'),s,'1938 party reorganization paragraph','Year precision only; no invented exact date.');
 p.claim('party-merger','events-context','Ismail Sidqi’s Shaab Party merged with the Ittihad Party.',E('1938'),s,'1938 party reorganization paragraph','Distinct dated party merger.');
 p.notes.push({sourceId:s,bodyReviewed:true,route:'Web full historical chapter, opening constitutional account and paragraphs on 1936 treaty/1938 parties',finding:'Treaty limits and Sudan distinctions preserved; unrelated 1924 facts and retrospective generic socioeconomics not projected into 1937.'});
 p.save({'population-statistics':['No official 1937 census body acquired; no remembered or inferred population used.'],capital:['Chapter incidental Cairo mention concerns 1924 and is not treated as 1937 capital evidence.'],currency:['No denomination evidence in this political source.'],'important-figures':['Party context sourced, but full personal activity/lifespan evidence was not acquired.'],'relationships':['Sudan context deliberately remains overview; no mapping or sovereignty changes.']});
}
