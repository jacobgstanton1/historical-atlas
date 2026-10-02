// One source-wide query, no per-country requests. Wikidata structured data are CC0.
import fs from 'node:fs';
import {readJSON,saveJSON,digest} from './research-common.mjs';
const base='research/completion-03/capitals';
const flags=readJSON('research/completion-02/flags/cache/FlagsData.tab.json'),cached=readJSON('research/completion-02/flags/cache/wikidata-entities.json');
const qids=[...new Set([...flags.data.map(r=>r[0]),...Object.keys(cached.entities)])].filter(q=>/^Q\d+$/.test(q)).sort();
const query=`SELECT ?entity ?entityLabel ?capital ?capitalLabel ?statement ?start ?end ?startPrecision ?endPrecision ?role ?part ?referenceURL WHERE {
 VALUES ?entity { ${qids.map(q=>'wd:'+q).join(' ')} }
 ?entity p:P36 ?statement. ?statement ps:P36 ?capital; wikibase:rank ?rank.
 FILTER(?rank != wikibase:DeprecatedRank)
 OPTIONAL { ?statement pq:P580 ?start; pqv:P580 ?sv. ?sv wikibase:timePrecision ?startPrecision. }
 OPTIONAL { ?statement pq:P582 ?end; pqv:P582 ?ev. ?ev wikibase:timePrecision ?endPrecision. }
 OPTIONAL { ?statement pq:P3831 ?role. } OPTIONAL { ?statement pq:P518 ?part. }
 OPTIONAL { ?statement prov:wasDerivedFrom ?ref. ?ref pr:P854 ?referenceURL. }
 FILTER(!BOUND(?start) || ?start < "1961-01-01T00:00:00Z"^^xsd:dateTime)
 FILTER(!BOUND(?end) || ?end > "1799-12-31T00:00:00Z"^^xsd:dateTime)
 SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`;
fs.mkdirSync(base,{recursive:true});fs.writeFileSync(base+'/wikidata-capitals-query.sparql',query+'\n');
const attempt={endpoint:'https://query.wikidata.org/sparql',queryHash:digest(query),entityQIDs:qids.length,attempts:1,scope:'Political-entity QIDs from the existing CC0 FlagsData/cached entity catalogue, reused as a candidate identifier universe only; no flag acquisition or back-projected modern identity.'};
try{
 const r=await fetch(attempt.endpoint+'?query='+encodeURIComponent(query)+'&format=json',{headers:{Accept:'application/sparql-results+json','User-Agent':'HistoricalAtlas/1.0 source-wide historical-capital research'},signal:AbortSignal.timeout(65000)});
 if(!r.ok)throw Error('HTTP '+r.status);
 const text=await r.text(),data=JSON.parse(text);if(!Array.isArray(data.results?.bindings))throw Error('Not a SPARQL results table');
 fs.writeFileSync(base+'/wikidata-capitals-response.json',text+'\n');attempt.status='success';attempt.rows=data.results.bindings.length;
}catch(e){attempt.status='failed';attempt.error=String(e);attempt.fallback='Existing original Wikidata entity cache only; no small follow-up queries.';}
saveJSON(base+'/wikidata-extraction.json',attempt);console.log(JSON.stringify(attempt));
