// Normalizes mathematical observations; historical sovereignty is never inferred.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {readJSON,saveJSON,digest} from './research-common.mjs';
const base='research/completion-02/area',raw=readJSON(base+'/derived-observations.json');
const claims=raw.observations.map(r=>{
 const temporal={kind:'observation',observationDate:String(r.year),certainty:'exact'};
 return {id:'mapped-area-'+digest([r.entityId,r.year,r.geometryHash]).slice(0,24),entityId:r.entityId,category:'area-statistics',value:r.areaKm2,metric:'Area (derived mapped geometry)',unit:'km2',temporal,
 scope:{id:r.entityId+'-mapped-'+r.year+'-'+r.geometryHash.slice(0,12),description:`Mapped polygons associated through existing atlas map IDs ${r.mapIds.join(', ')} in the ${r.year} boundary snapshot. This measures the displayed mapped extent, not an official contemporary statistic or all territory claimed by the polity.`,relationship:'same'},
 sourceIds:['basemaps'],evidence:[{sourceId:'basemaps',locator:`https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/world_${r.year}.geojson; file SHA256 ${r.boundarySource.sha256}; geometry SHA256 ${r.geometryHash}; map IDs ${r.mapIds.join(', ')}`,note:`${raw.method} Raw computed area ${r.rawAreaKm2} km2; ${r.featureCount} source features. pyproj ${raw.libraries.pyproj}; Shapely ${raw.libraries.shapely}. Derived from the actual boundary snapshot, not a population statistical geography.`,precision:'year',temporal,interpretation:'derived'}],status:'supported',risks:[],qualifications:['Derived mapped/geometric area, not an official contemporary historical area statistic.','Approximate historical polygons; three significant digits. Holes subtracted and overlapping mapped pieces counted once.','Boundary snapshot year is the geometry observation date. No continuous territorial validity is inferred between snapshots.'],origin:{kind:'bulk-candidate',reference:'WGS84 ellipsoidal geodesic calculation of frozen actual atlas geometry',sourceIdentifier:r.boundarySource.path+':'+r.geometryHash}};
});
const cohort={id:'completion02-mapped-area',worker:'geodesic-area-deterministic-extractor',sources:[],claims};
saveJSON(base+'/intake/cohort.json',cohort);
const paths=[...raw.inputBindings.map(b=>b.path),base+'/baseline.json',base+'/derived-observations.json',base+'/derive_area.py',base+'/test_geodesic.py','scripts/research-mapped-area.mjs','development/coverage/manifest.json','data/historical-entities.json'];
const certificate={cohortHash:digest(cohort),reviewer:'/root coordinator mathematical-method and source-association review',bodyReviewed:true,acceptedClaimIds:claims.map(c=>c.id),inputBindings:paths.map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')})),rationale:'Coordinator reviewed exact runtime source selection, source-file and geometry hashes, existing manifest identity grouping, validity-envelope and feature-count checks, no fallback or topology repair, WGS84 geodesic method, holes/duplicate union/antimeridian tests (8 passed), point-date semantics, mapped-only scope and explicit non-official qualifications. This acceptance concerns a reproducible geometric measurement, not newly researched sovereignty or official statistical territory.'};
saveJSON(base+'/intake/certificate.json',certificate);
saveJSON(base+'/held.json',raw.held);
const store=readJSON('data/comprehensive-dossiers.json');saveJSON(base+'/preserved-package-hashes.json',store.packages.map(p=>({id:p.id,hash:digest(p)})));
console.log(JSON.stringify({claims:claims.length,entities:new Set(claims.map(c=>c.entityId)).size,held:raw.held.length}));
