import fs from 'node:fs';
import crypto from 'node:crypto';
import {digest} from '../../../scripts/research-common.mjs';
const base='research/completion-01/population', old='research/bulk-02/population/cache';
const inputPath=`${base}/source-verifiable-cohort.json`;
const input=JSON.parse(fs.readFileSync(inputPath)), registry=JSON.parse(fs.readFileSync('data/historical-entities.json'));
if(digest(input)!=='5f4a49d57672fc350fc99a4b1b9a4c728252528cb4e532256145ea7e20d82ccc')throw Error('Frozen input changed');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const bind=p=>({path:p,sha256:sha(p)});
const corrections={Bolivia:3462000,Haiti:3505000,Paraguay:1768000};
const scopes={
 'Malta and Gozo':'Malta and Gozo total; footnote113 excludes non-Maltese armed forces stationed in the area and, beginning1957, includes civilian nationals temporarily outside country. Footnote118 does not apply to Malta.',
 Colombia:'Contemporary Colombian total; footnote53 explicitly dates estimates5July. Amerindian exclusion in footnote52 belongs to British Guiana, not Colombia.',
 Paraguay:'Contemporary Paraguay total, printed1768thousand; original300dpi facsimile corrects intake1703thousand.',
 Bolivia:'Contemporary Bolivia total, printed3462thousand; footnote50 gives5September. Original300dpi facsimile corrects intake3460thousand.',
 Haiti:'Contemporary Haiti total, printed3505thousand; footnote44 gives7August. Original300dpi facsimile corrects intake3506thousand.',
 'Spanish Equatorial region':'Spanish Equatorial region territorial total: footnote26 explicitly comprises African Provinces of Fernando Poo and Rio Muni, formerly Spanish Guinea; excludes separately tabulated Spanish North African possessions.',
 Brunei:'Contemporary Brunei census male43676 and female40201, same10August1960 row. Derived sex-component sum83877; not an independently printed both-sex total.',
 Poland:'Contemporary postwar Polish6December1960 census. Footnote148 first series1923–1937 borders do not apply to this second-series1960 census. Existing Polish People’s Republic1952 framework has editorial1953–1961 coverage.'
};
const rows=input.observations.map(o=>{
 const e=registry.entities.find(e=>e.id===o.entityIdSuggested); if(!e)throw Error('Missing entity');
 const fields={entityId:e.id,category:'population',value:corrections[o.countryLabel]??o.value,unit:'persons',observationDate:o.countryLabel==='Colombia'?'1960-07-05':o.observationDate,observationPrecision:o.countryLabel==='Colombia'?'day':o.observationPrecision,observationType:o.observationType,statisticalComparability:o.scopeClassification,scope:scopes[o.countryLabel]??o.scope,provisional:o.provisional??false,questionableReliability:['Paraguay','Chile','Spanish Equatorial region'].includes(o.countryLabel)?true:(o.questionableReliability??false),sourceId:o.sourceId,locator:o.locator,sourceBodyHash:o.sourceBodyHash};
 fields.qualifications=[o.table===4?'Published rounded to thousands; an estimate, not exact census headcount.':'Census enumeration on explicitly printed day; no persistence interval inferred.',fields.observationPrecision==='year'?'Conservative observation year1960; Table4 default1July or mean of end-year estimates does not establish exact day or whole-year validity.':'Explicit printed census day or country-specific estimate footnote.',fields.scope];
 if(fields.provisional)fields.qualifications.push('Printed star: provisional.');
 if(fields.questionableReliability)fields.qualifications.push('Printed italic: estimate of questionable reliability.');
 if(o.countryLabel==='Brunei')fields.qualifications.push('Derived sum43676+40201=83877; Table6 definition warns sex-component sum can differ from subsequently final total.');
 const held=['Brazil','Ecuador'].includes(o.countryLabel);
 const originalComparable={...o,entityId:o.entityIdSuggested,statisticalComparability:o.scopeClassification};
 const overrideKeys=['value','observationDate','observationPrecision','scope','questionableReliability'];
 const reviewOverrides=overrideKeys.filter(k=>fields[k]!==originalComparable[k]).map(k=>({field:k,original:originalComparable[k]??null,approved:fields[k],reason:'Independent original PDF facsimile/printed row/footnote inspection; frozen intake preserved.'}));
 const date=fields.observationDate.length===4?`${fields.observationDate}-07-01`:fields.observationDate;
 if(e.existence?.validFrom && e.existence.validFrom>date)throw Error('Entity starts after observation '+e.id);
 if(e.existence?.validUntil && e.existence.validUntil<=date)throw Error('Entity ends before observation '+e.id);
 return {observationId:o.id,originalObservationDigest:digest(o),sourceValueDateVerified:true,decision:held?'held':'source-and-mapping-approved',reason:held?'Published estimate explicitly excludes jungle Indian population. Approximate scope remains held; not accepted as entire historical polity population.':'Literal contemporary country/territory row, source date/type/quality and existing bounded historical framework independently reviewed. Approved overrides remain explicit; no modern-border fallback.',approvedMappedFields:held?null:fields,verifiedSourceFields:fields,reviewOverrides,statisticalComparability:fields.statisticalComparability,mappingReceipt:{entityId:e.id,entityRecordDigest:digest(e),names:e.names,existingBounds:e.existence,confidence:'literal source identity against existing named historical framework',scopeRationale:o.countryLabel==='Netherlands'?'Metropolitan Netherlands country row; expressly qualified core scope, not overseas Kingdom aggregate.':fields.scope,reason:'No geometry, overlap, modern-country fallback, empire aggregation or status succession used.'},renderBinding:bind(o.renderPath),originalPdfBinding:bind(`${old}/un-dyb1960.pdf`),sourceLocator:o.locator};
});
const extra=['page-47.txt','page-34.txt','independent-definition-48.txt','independent-definition-49.txt','page-146.txt','page-152.txt','page-161.txt','page-164.txt'].map(p=>`${old}/${p}`);
const reviewImages=fs.readdirSync(base).filter(p=>/^review-(page.*300dpi|crop-(bolivia|haiti-hi|paraguay-hi)|quality-.*)\.png$/.test(p)).map(p=>`${base}/${p}`);
const paths=[inputPath,`${base}/build-cohort.mjs`,`${base}/build-independent-review.mjs`,`${old}/un-dyb1960.pdf`,...extra,...input.sourceBindings.map(b=>b.path),...reviewImages];
const result={schemaVersion:1,reviewer:'officeholder_sources independent reviewer; extractor campaign2_selection',reviewMethod:'All22 rows independently checked against retained original UN1960 PDF facsimiles and Table4/6 definitions. Fresh300dpi PDF renders resolve three intake value errors, two scope/footnote errors, exact Colombia date, and omitted italic markers. Original input untouched. Source publication1961/edition1960 is not substituted for observation date.',source:input.source,inputCanonicalDigest:digest(input),inputFileSha256:sha(inputPath),entityRegistryCanonicalDigest:digest(registry),entityRegistryFileSha256:sha('data/historical-entities.json'),sourceBindings:[...new Set(paths)].map(bind),schemaContract:{rows:'One receipt for each of22 frozen observations, keyed by observationId and originalObservationDigest.',approvedMappedFields:'Only explicit source-and-mapping-approved fields may be integrated; null means held.',reviewOverrides:'Original intake field and approved source-grounded value preserved side by side; never silently rewrite frozen input.',mapping:'entityRecordDigest binds exact existing entity; statisticalComparability and scope qualification mandatory.',temporal:'Observation precision preserved except explicit footnote53 supplies Colombia5July1960; never validFrom/validUntil persistence.'},metrics:{reviewed:rows.length,approved:rows.filter(r=>r.decision==='source-and-mapping-approved').length,held:rows.filter(r=>r.decision==='held').length,valueOverrides:rows.filter(r=>r.reviewOverrides.some(v=>v.field==='value')).length},rows};
fs.writeFileSync(`${base}/independent-review.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({reviewDigest:digest(result),fileSha256:sha(`${base}/independent-review.json`),metrics:result.metrics}));
