import {formatHistoricalDate,formatHistoricalPeriod} from './historical-chronology.js';

// Conservative presentation rules: unknown qualifications remain beside the fact.
const methodology=/^(?:Schematic licensed SVG|Conservative bounded interval|Curated (?:facts|coverage)|Office-holder coverage|These bounds|Bounds delimit|This dossier covers|This partial interval|This interval ends|This overview ends|Dates retain the precision|The leadership records preserve|Presidential terms are retained|Award-year context only|Multiple institutions|Official API|Geographic scope: Entity-level|Interior\d|.*\b(?:research clipping|research boundary|ingestion|dataset limit|atlas[’']?s? (?:supported )?limit|no geometry-based)\b)/i;
export function splitPresentation(text='') {
  const publicText=[],notes=[];
  for(const sentence of String(text).split(/(?<=[.!?])\s+/)){
    if(methodology.test(sentence))notes.push(sentence);
    else {const parts=sentence.split(/;\s*(?=detailed ministry and transition gaps)/i);publicText.push(parts[0]);if(parts[1])notes.push(parts[1]);}
  }
  return {text:publicText.filter(Boolean).join(' '),notes};
}
export function entityTitle(resolved,records=[],fallback='Selected territory') {
  const names=records.filter(r=>r.category==='identity'&&typeof r.value==='string'&&r.sourceIds?.length);
  const candidates=[...names.filter(r=>!r.legacyField),...(resolved.names||[]).filter(r=>r.sourceIds?.length).sort((a,b)=>({formal:0,primary:1,alternate:2}[a.kind]??3)-({formal:0,primary:1,alternate:2}[b.kind]??3))];
  for(const r of candidates){const title=String(r.value).replace(/\s+—\s+[^—]*\bframework\b.*$/i,'').trim();if(title)return {text:title,sourceIds:r.sourceIds};}
  return {text:resolved.entity?.canonicalName||resolved.entity?.name||fallback,sourceIds:[]};
}
export function presentationPeriod(record,entity) {
  const t=record.temporal;if(!t)return '';
  const longDate=v=>formatHistoricalDate(v).replace(/\b(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g,m=>({Jan:'January',Feb:'February',Mar:'March',Apr:'April',Jun:'June',Jul:'July',Aug:'August',Sep:'September',Oct:'October',Nov:'November',Dec:'December'}[m]));
  if(t.kind==='observation')return longDate(t.observationDate)+' '+(record.observationType||'observation');
  if(t.kind==='event')return longDate(t.date);
  const notes=[...(record.qualifications||[]),entity?.existence?.note||''].join(' ');
  const cutoff=t.until===entity?.existence?.validUntil&&/coverage|researched|atlas.*limit/i.test(entity?.existence?.note||'')||/^1961(?:-01-01)?$/.test(t.until||'')&&/atlas.*limit|coverage.*ends|bounds.*cover|not.*(?:end|lifetime)/i.test(notes);
  const clipping=/research (?:clipping|boundary)|bounds are research|interior.*(?:excludes|unsupported)/i.test(notes);
  if(clipping)return 'Recorded for '+(t.from===t.until?longDate(t.from):[t.from,t.until].filter(Boolean).map(longDate).join(' – '));
  if(cutoff)return t.from?'From '+longDate(t.from):'';
  if(t.from&&t.until)return t.from===t.until?longDate(t.from):longDate(t.from)+' – '+longDate(t.until);
  return t.from?'From '+longDate(t.from):t.until?'Until '+longDate(t.until):'';
}
export function factLabel(record){
  if(record.role)return record.role;
  if(record.legacyField==='politicalStatus')return 'Political system';
  if(record.legacyField==='governments')return 'Government';
  const labels={'constitutional-legislature':'Legislature','constitutional-executive':'Executive powers','constitutional-rights':'Constitutional rights',government:'Government',politicalStatus:'Political system'};
  return labels[record.metric]||record.metric?.replaceAll('-',' ')||'Constitutional framework';
}
export function publicFigure(figure,value){
  return {...figure,activity:value?.prizeYear&&value?.prizeCategory?'Nobel Prize in '+value.prizeCategory+', '+value.prizeYear:figure.activity.replace(/; status recorded as \w+\.?$/i,''),relationship:figure.relationship.replace(/; official affiliation at award time\.?$/i,' · '+(value?.prizeYear?'Affiliation in '+value.prizeYear:'Affiliation at the time of the award'))};
}
