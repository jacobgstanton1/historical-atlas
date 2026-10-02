// Concrete source-specific parsers live beside immutable evidence; this adapter
// consolidates continuous cabinet spells and binds independently reviewed mappings.
import {readJSON,saveJSON,readContext,digest,isCLI} from './research-common.mjs';
import {bytesHash,runTranche} from './research-bulk.mjs';
export function officialIntake(){
 const a=readJSON('research/bulk-01/worker-officeholders/officeholder-manifest.json'),b=readJSON('research/bulk-01/worker-tables/officeholders.json');
 const rows=[];
 for(const source of a.sources){const items=a.rows.filter(r=>r.sourceId===source.id).sort((x,y)=>x.from.localeCompare(y.from));for(const r of items){let old=rows.at(-1);if(source.id==='japan-cabinets'&&old?.sourceId===r.sourceId&&old.name===r.name&&old.until===r.from){old.until=r.until;old.locator+='; '+r.locator;old.originalRow+='; '+r.originalRow;old.originalTerm=old.from+' to '+r.until+' (consecutive cabinet rows)';old.entityIdsSuggested=[...new Set([...old.entityIdsSuggested,...r.entityIdsSuggested])];}else rows.push(structuredClone(r));}}
 rows.push(...b.rows);
 const manifest={schemaVersion:1,worker:'official-table-extractors',sources:[...a.sources,...b.sources],rows,originalManifestHashes:[digest(a),digest(b)]};
 const db=readContext().db;
 const definitions=[
  ['japan-cabinets','japan-restoration-framework','1868-01-03','1890-11-29','Prime minister'],
  ['japan-cabinets','japan-meiji-framework','1890-11-29','1945-01-01','Prime minister'],
  ['japan-cabinets','japan-initial-allied-occupation','1945-09-02','1947-05-03','Prime minister'],
  ['japan-cabinets','japan-postwar-framework','1947-05-03','1961-01-01','Prime minister'],
  ['c01-canada-ministry-tenures','canada-1867-federal-framework','1867-07-01','1931-12-11','Prime Minister'],
  ['c01-canada-ministry-tenures','canada-westminster-federal-framework','1931-12-11','1961-01-01','Prime Minister'],
  ['bulk01-victoria-premiers','victoria-bicameral-colonial-core','1878-01-01','1901-01-01','Premier'],
  ['bulk01-queensland-premiers','queensland-selfgoverning-colonial-core','1878-01-01','1901-01-01','Premier'],
  ['bulk01-nsw-premiers','nsw-responsible-colonial-core','1878-01-01','1901-01-01','Premier'],
  ['bulk01-us-presidents-congress','united-states','1789-03-04','1961-01-01',null],
  ['bulk01-france-presidents','france-political-frameworks','1799-12-13','1961-01-01',null],
  ['bulk01-portugal-presidents','portugal-political-frameworks','1808-01-01','1961-01-01',null],
  ['bulk01-netherlands-monarchs','netherlands-kingdom','1815-03-16','1961-01-01',null]
 ];
 const mappings=definitions.map(([sourceId,entityId,from,until,role])=>{const e=db.entities.find(e=>e.id===entityId);if(!e)throw Error(entityId);return{sourceId,entityId,from,until,...(role?{role}:{}),scope:'Central named office of '+e.names[0].value+' within the reviewed historical framework; no claim of polygon-wide sovereignty.',rationale:'Coordinator inspected existing sourced entity names, curated existence and dated mapping bounds, and literal institutional table/office semantics. This associates an office with an existing framework; it does not infer succession.',identityReferences:[...new Set([...(e.existence?.sourceIds||[]),...e.names.flatMap(n=>n.sourceIds||[])])]};});
 const bindings=['research/bulk-01/worker-officeholders/extract.mjs','research/bulk-01/worker-tables/extract-officeholders.mjs'].map(path=>({path,sha256:bytesHash(path)}));
 const resolvedCautions=[...new Set(a.rows.flatMap(r=>r.evidenceCautions||[]).filter(c=>/curated (?:colonial entity|colony)|Full tenure retained|Source tenure spans retained|Source states SERVED AS PREMIER endpoints/i.test(c)))];
 const contract={schemaVersion:1,id:'official-officeholders-01',adapter:'dated-official-officeholder-tables/v1',tier:'A — official structured tables with coordinator-reviewed mappings; cautions retained',reviewer:'coordinator-original-source-and-framework-review',manifestHash:digest(manifest),parserPath:bindings[0].path,parserSha256:bindings[0].sha256,parserBindings:bindings,mappings,resolvedCautions,endpointNote:'Original end date is a conservative exclusive cutoff; the final listed service day is omitted where source endpoint semantics differ. No successor date or missing transfer day is invented.',rationale:'Coordinator independently inspected literal date/name columns, cabinet reappointments, source-bound sourceSemantics, House footnote parsing and existing sourced entity/framework bounds. Worker accession/oath cautions remain held; partial precision stays held; overlapping sourced intervals are never replaced. Machine acceptance binds exact original body and parser hashes, row locators and this review, rather than inventing a human review for each row.'};
 saveJSON('research/bulk-01/official-officeholders-manifest.json',manifest);saveJSON('research/bulk-01/official-officeholders-contract.json',contract);return{manifest,contract};
}
if(isCLI(import.meta.url)){officialIntake();console.log(JSON.stringify(runTranche('research/bulk-01/official-officeholders-manifest.json','research/bulk-01/official-officeholders-contract.json',{apply:process.argv.includes('--apply')}).metrics,null,2));}
