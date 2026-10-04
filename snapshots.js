// Astronomical year numbering: 1 CE = 1, 1 BCE = 0, 4000 BCE = -3999.
// Display labels are independent of sorting and may later include circa qualifiers.
export function formatYear(year) {
  if (!Number.isInteger(year)) throw new TypeError('Integer chronological year required');
  return year <= 0 ? `${1 - year} BCE` : `${year} CE`;
}
export const LEGACY_SNAPSHOTS = Object.freeze([1800,1815,1878,1880,1900,1914,1920,1930,1938,1945,1960].map(year => Object.freeze({year,file:`world_${year}.geojson`,displayLabel:formatYear(year),era:'1800–1960',availability:'populated'})));
const targets = [-3999,-2999,-1999,-1499,-999,-499,-199,1,200,400,476,600,800,1000,1100,1200,1300,1400,1453,1500,1600,1648,1700,1750,1970,1980,1991,2000,2010,2026];
export const SNAPSHOTS = Object.freeze([...LEGACY_SNAPSHOTS,...targets.map(year => Object.freeze({year,displayLabel:formatYear(year),era:year<=0?'BCE':year<1800?'1–1750 CE':'1970–2026',availability:'unpopulated',file:null}))].sort((a,b)=>a.year-b.year));
export const MIN_YEAR=SNAPSHOTS[0].year, MAX_YEAR=SNAPSHOTS.at(-1).year;
export function nearestSnapshotIndex(year, snapshots=SNAPSHOTS) {
  return snapshots.reduce((best,s,i)=>Math.abs(s.year-year)<Math.abs(snapshots[best].year-year)?i:best,0);
}
export function snapshotForYear(year) {
  const exact=SNAPSHOTS.find(s=>s.year===year);
  if(exact)return exact;
  // Preserve the established requested-year/boundary-year behaviour ONLY in the old range.
  if(year>=1800&&year<=1960)return LEGACY_SNAPSHOTS[nearestSnapshotIndex(year,LEGACY_SNAPSHOTS)];
  return {year,displayLabel:formatYear(year),era:'Unconfigured',availability:'unpopulated',file:null};
}
export function emptySnapshotCollection(){return {type:'FeatureCollection',features:[]};}
export async function loadExactSnapshot(snapshot,loadPopulated) {
  // Never fetch guessed files or borrow neighbouring boundaries for an empty target.
  if(snapshot.availability==='unpopulated')return emptySnapshotCollection();
  return loadPopulated(snapshot);
}
export function visibleSnapshotTicks(index,count=SNAPSHOTS.length,maxTicks=9) {
  const stride=Math.max(1,Math.ceil((count-1)/(maxTicks-1)));
  return [...new Set([0,count-1,index,...Array.from({length:count},(_,i)=>i).filter(i=>i%stride===0)])].sort((a,b)=>a-b);
}
