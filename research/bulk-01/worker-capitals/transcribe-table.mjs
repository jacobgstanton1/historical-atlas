import fs from 'node:fs';
import crypto from 'node:crypto';
const base='research/bulk-01/worker-capitals';
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
// Literal nonblank capital cells transcribed from original printed p367 image.
// Dash means no reviewed entity mapping, never a modern-country inference.
const transcription=`China|Peking|qing-imperial-framework
British Empire|London|-
Russian Empire|St. Petersburg|-
United States|Washington|united-states
United States and Colonies|Washington|-
Philippines|Manila|-
Porto Rico|San Juan|-
Hawaii|Honolulu|-
France and Colonies|Paris|-
France|Paris|france-political-frameworks
Algeria|Algiers|algeria-french-colonial-framework
Senegal|St. Louis|senegal-1900-colonial-core
Tunis|Tunis|tunisia-french-protectorate-framework
Cayenne|Cayenne|french-guiana-colonial-framework
Cambodia|Saigon|-
Tonquin|Hanoi|b13-tonkin-protectorate
New Caledonia|Noumea|-
Madagascar|Antananarivo|b20-madagascar-french-colony
German Empire|Berlin|germany-imperial-framework
Prussia|Berlin|-
Bavaria|Munich|-
Saxony|Dresden|-
Wurtemberg|Stuttgart|-
Baden|Karlsruhe|-
Alsace-Lorraine|Strasburg|-
Hesse|Darmstadt|-
Mecklenburg-Schwerin|Schwerin|-
Brunswick|Brunswick|-
Oldenburg|Oldenburg|-
Saxe-Weimar|Weimar|-
Anhalt|Dessau|-
Saxe-Meiningen|Meiningen|-
Saxe-Coburg-Gotha|Gotha|-
Saxe-Altenburg|Altenburg|-
Lippe|Detmold|-
Reuss (Younger line)|Gera|-
Mecklenburg-Strelitz|Neu Strelitz|-
Schwarzburg-Rudolstadt|Rudolstadt|-
Schwarzburg-Sond's'n|S'ndershausen|-
Waldeck|Arolsen|-
Reuss (Elder line)|Greiz|-
Schaumburg-Lippe|Buckeburg|-
Austro-Hungarian Empire|Vienna|austria-hungary-dual-framework
Japan|Tokio|japan-meiji-framework
Netherlands|The Hague|netherlands-kingdom
Netherlands and Colonies|The Hague|-
Java|Batavia|-
Moluccas|Amboyna|-
Surinam|Paramaribo|suriname-koloniale-staten-framework
Turkish Empire|Constantin'ple|ottoman-abdulhamid-adjourned-framework
Tripoli|Tripoli|-
Bulgaria|Sofia|-
Egypt|Cairo|egypt-british-occupied-khedivate-framework
Italy|Rome|italy-liberal-monarchy-framework
Italy and Colonies|Rome|-
Spain|Madrid|spain-political-frameworks
Brazil|Rio Janeiro|brazil-early-federal-republic-framework
Mexico|City of Mexico|mexico-porfirian-framework
Korea|Seoul|korea-imperial-framework
Persia|Teheran|qajar-preconstitutional-framework
Portugal|Lisbon|portugal-political-frameworks
Portugal and Colonies|Lisbon|-
Sweden|Stockholm|sweden-kingdom
Norway|Kristiania|norway-constitutional-kingdom
Morocco|Fez|-
Belgium|Brussels|belgium-kingdom
Siam|Bangkok|b13-siam-absolute
Roumania|Bucarest|-
Argentine Republic|Buenos Ayres|argentina-pre-1930-federal-framework
Colombia|Bogota|colombia-thousand-days-framework
Afghanistan|Cabul|afghan-abd-al-rahman-framework
Chile|Santiago|chile-parliamentary-practice-framework
Peru|Lima|peru-later-1860-framework
Switzerland|Berne|swiss-federal-state
Bolivia|La Paz|bolivia-late-1880-constitutional-framework
Greece|Athens|greek-1864-crowned-framework
Denmark|Copenhagen|denmark-post-kiel
Denmark and Colonies|Copenhagen|-
Iceland|Rejkjavik|iceland-danish-administration
Greenland|Godthaab|greenland-late-colonial-framework
Venezuela|Caracas|venezuela-castro-framework
Servia|Belgrade|-
Nepaul|Khatmandu|nepal-rana-framework
Cuba|Havana|-
Oman|Muscat|oman-late-nineteenth-coastal-core
Guatemala|New Guatemala|-
Ecuador|Quito|-
Liberia|Monrovia|liberia-presidential-constitutional-core
Hayti|Port au Prince|-
Transvaal|Pretoria|-
Salvador|San Salvador|-
Uruguay|Montevideo|uruguay-late-1830-framework
Khiva|Khiva|-
Paraguay|Asuncion|paraguay-1870-constitutional-framework
Honduras|Tegucigalpa|-
Nicaragua|Managua|-
Dominican Republic|San Domingo|-
Montenegro|Cettinje|-
Costa Rica|San Jose|-
Orange Free State|Bloemfontein|-`;
const entities=new Set(JSON.parse(fs.readFileSync('data/historical-entities.json')).entities.map(e=>e.id));
const rows=transcription.split('\n').map((line,index)=>{const[country,value,id]=line.split('|');if(id!=='-'&&!entities.has(id))throw Error(id);return {sourceId:'bulk01-world-almanac-1900-capitals',sourceCountryLabel:country,value,originalRow:`${country} | ${value}`,locator:`Printed p367: Statistics of the Countries of the World; country row ${country}; Capitals column`,transcriptionIndex:index+1,editionYear:1900,observedAt:null,validFrom:null,validUntil:null,targetSnapshotCandidate:1900,entityIdsSuggested:id==='-'?[]:[id],scope:'Contemporary reference-table capital cell; source may group empire, colonies or administrative divisions. This cell does not prove sovereignty, uniform control or modern-border scope.',disposition:'historical-review',evidenceCautions:['Table supplies no common capital observation date. Publication/edition year is not full-year validity or January1 observation. Do not borrow adjacent table December1,1899 date.',...(id==='-'?['Country/admin label or existing dated mapping unresolved. Hold.']:[]),...(country==='Cambodia'?['Source prints Saigon for Cambodia. This conflicts with obvious protectorate/Union distinction; preserve literal cell for review, never auto-accept.']:[]),...(country==='Bolivia'?['Source lists La Paz only. Do not infer sole or constitutional capital; split-seat qualification requires corroboration.']:[])]};});
const files=['cache/world1900-metadata.json','cache/world1900-djvu.txt','cache/world1900-scandata.xml','cache/world1900-page367-original.jpg'];
const source={id:'bulk01-world-almanac-1900-capitals',title:'The World Almanac and Encyclopedia, 1900 — Statistics of the Countries of the World',institution:'Press Publishing Company (The New York World); digitised Boston Public Library copy',url:'https://archive.org/details/worldalmanacency1900newy/page/n404/mode/1up',editionYear:1900,observationDate:null,cachePath:`${base}/cache/world1900-page367-original.jpg`,sha256:sha(`${base}/cache/world1900-page367-original.jpg`),parser:'manual-literal-original-scan-transcription-v1',parserPath:`${base}/transcribe-table.mjs`,originalFiles:files.map(f=>({path:`${base}/${f}`,sha256:sha(`${base}/${f}`)})),sourceType:'contemporary-reference',temporalEligibility:'held: edition year only; US-population-only footnote dates Jan1,1900, cannot attach to capitals',reviewNotes:'Original p367 image inspected. Body headings Capitals and Countries explicit. No capital observation date. Adjacent p368 ministry table has Dec1,1899; not transferable. Table omits capitals for many rows (dotted cells), which were not filled from general knowledge.'};
fs.writeFileSync(`${base}/capital-table-manifest.json`,JSON.stringify({schemaVersion:1,sources:[source],rows,metrics:{literalNonblankCapitalCells:rows.length,explicitExistingEntitySuggestions:rows.filter(r=>r.entityIdsSuggested.length).length,accepted:0,held:rows.length}},null,2)+'\n');
console.log({rows:rows.length,mapped:rows.filter(r=>r.entityIdsSuggested.length).length,accepted:0});
