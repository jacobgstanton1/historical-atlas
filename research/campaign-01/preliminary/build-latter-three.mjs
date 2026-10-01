// Reproducible isolated worker handoff; no production, queue or Git writes.
import {readJSON,saveJSON,readContext} from '../../../scripts/research-common.mjs';
import {validatePackage} from '../../../scripts/research-validator.mjs';
const jobs=readJSON('research/campaign-01/jobs.json');
const selected=Array.isArray(jobs)?jobs:jobs.jobs;
const worker={id:'campaign-design',specialism:'entity-core'};
const source=(id,title,institution,url,usage)=>({id,title,institution,url,accessed:'2026-10-01',kind:'academic-institutional',usage});
const iranSource=source('c01-iran-capital-cities','Capital Cities — Under the Qajars and Pahlavis','Encyclopaedia Iranica; C. E. Bosworth','https://www.iranicaonline.org/articles/capital-cities/','Read full body of Islamic-period section, especially Under the Qajars and Pahlavis: Tehran capital adoption 1786 and continued twentieth-century role. Supports only capital; no modern identity fallback or regime continuity inference.');
const ottomanLeaderSource=source('c01-ottoman-abdulhamid-ii','Abdülhamid II','TDV İslâm Araştırmaları Merkezi; Cevdet Küçük','https://islamansiklopedisi.org.tr/abdulhamid-ii','Read full scholarly article body including 31 August 1876 accession and 1876–1909 reign. Extract only dated office tenure; evaluative political rhetoric excluded.');
const ottomanCapitalSource=source('c01-ottoman-istanbul-capital','İstanbul — Turkish period and administration','TDV İslâm Araştırmaları Merkezi; İstanbul historical article contributors','https://islamansiklopedisi.org.tr/istanbul','Read Turkish-period and administrative history body: capital after conquest with administrative status through imperial dissolution; loss of capital role under Republic. Bounded 1879–1907 claim does not rely on modern naming.');
function claim(job,id,category,value,sourceIds,note,extra={}){
 return {id,category,value,temporal:{kind:'interval',...job.period},entityId:job.entityId,
 geographicScope:{description:job.name+' within its existing editorial historical interval; office/capital is an institution of that entity, not evidence about every mapped polygon.',relationship:'same'},
 sourceIds,evidence:sourceIds.map(sourceId=>({sourceId,note,supportedPrecision:'year',supportsClaim:true,...job.period})),reviewStatus:'clear',cautions:[],...extra};
}
const specs=[
 {entity:'iran-early-pahlavi-framework',sources:[iranSource],claims:j=>[
 claim(j,'c01-iran-early-pahlavi-tehran','capital','Tehran',[iranSource.id],'Iranica explicitly discusses Tehran as capital under the Qajars and Pahlavis, including twentieth-century continuity. Claim is clipped to 1926–1932, not an accession or founding date.')],
 omissions:['Existing Reza Shah leadership, political status and government framework already cover this assignment and are preserved.','Currency transition was not researched sufficiently for acceptance; no continuity assumed.']},
 {entity:'ethiopia-zawditu-regency-core',sources:[],claims:j=>[
 claim(j,'c01-ethiopia-zawditu-empress','leadership','Zawditu',['b18-ethiopia-interregnum','b18-ethiopia-prewar'],'LOC body describes Zawditu as empress after Iyasu deposition and dates her death to April 1930. The 1917–1929 bounded interval excludes accession/death uncertainty and makes no claim about sole effective authority.',{role:'Empress'}),
 claim(j,'c01-ethiopia-tafari-regent','leadership','Tafari Mekonnen',['b18-ethiopia-interregnum'],'LOC body identifies Tafari as regent and heir, distinct from the empress; discusses continuing regency, influence of Habte Giorgis until 1926, and the 1928 negus title. Emperor Haile Selassie title is not projected before 1930.',{role:'Regent and heir'})],
 omissions:['Institutional framework already sourced and retained. Capital and currency intervals require dedicated evidence; neither is inferred from modern Ethiopia.']},
 {entity:'ottoman-abdulhamid-adjourned-framework',sources:[ottomanLeaderSource,ottomanCapitalSource],claims:j=>[
 claim(j,'c01-ottoman-abdulhamid-sultan','leadership','Abdülhamid II',[ottomanLeaderSource.id],'TDV scholarly body identifies Ottoman sultan reign 1876–1909; the assigned 1879–1907 interval is internal to that sourced tenure. Conflicting February 1878 parliamentary adjournment dates remain untouched.',{role:'Sultan'}),
 claim(j,'c01-ottoman-istanbul-capital','capital','Istanbul (Constantinople)',[ottomanCapitalSource.id],'TDV historical body describes Istanbul as the Ottoman capital after conquest with special administrative status until imperial dissolution, and subsequent loss of capital role under the Republic. Bounded 1879–1907 interval lies within the explicitly described Ottoman period; alternate historical city name is retained.')],
 omissions:['Existing parliamentary-adjournment framework remains unchanged; February 1878 exact-date dispute is not resolved. Currency requires independent denomination/continuity evidence and remains a gap.']}
];
for(const spec of specs){
 const job=selected.find(j=>j.entityId===spec.entity);if(!job)throw Error('Missing assigned job '+spec.entity);
 const pkg={schemaVersion:1,id:'package-'+job.id,jobId:job.id,worker,productionFingerprint:job.productionFingerprint,entityId:job.entityId,mapIds:job.mapIds,period:job.period,category:'core-state',categories:job.categories,
 claims:spec.claims(job),sources:spec.sources,absenceOfEvidence:spec.omissions,reviewNotes:['Full source bodies read independently from the preliminary candidate ledger. Every claim remains subject to coordinator evidence review before integration.']};
 const validation=validatePackage(pkg,job,readContext());if(!validation.valid)throw Error(JSON.stringify(validation));
 saveJSON('research/campaign-01/packages/'+spec.entity+'.json',pkg);
 saveJSON('research/campaign-01/evidence/'+spec.entity+'.json',{worker,jobId:job.id,entityId:job.entityId,period:job.period,independentBodyReview:true,claims:pkg.claims.map(c=>({claimId:c.id,sourceIds:c.sourceIds,evidenceNote:c.evidence[0].note})),omissions:spec.omissions,validation});
 console.log(spec.entity+': '+pkg.claims.length+' claims; structurally valid, historical review required');
}
