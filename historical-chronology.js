// Astronomical years (0 = 1 BCE). Exact interval end dates are exclusive.
export function historicalDate(value) {
  const m=String(value).match(/^([+-]?\d{4,6})(?:-(\d{2})(?:-(\d{2}))?)?$/);
  if(!m)throw Error('Invalid historical date');
  const year=Number(m[1]),month=Number(m[2]||1),day=Number(m[3]||1),precision=m[3]?'day':m[2]?'month':'year';
  const days=[31,year%4===0&&(year%100!==0||year%400===0)?29:28,31,30,31,30,31,31,30,31,30,31];
  if(month<1||month>12||day<1||day>days[month-1])throw Error('Impossible historical date');
  const ordinal=(y,mo,d)=>y*372+(mo-1)*31+d-1,lo=ordinal(year,month,day);
  return {year,month,day,precision,lo,hi:precision==='year'?ordinal(year+1,1,1):precision==='month'?ordinal(year,month+1,1):lo+1};
}
export const yearString=year=>year<0?'-'+String(-year).padStart(6,'0'):year>9999?'+'+String(year).padStart(6,'0'):String(year).padStart(4,'0');
export function historicalInterval(t) {
  if(t.kind==='observation'||t.kind==='event')return historicalDate(t.observationDate||t.date);
  const from=t.from?historicalDate(t.from):null,until=t.until?historicalDate(t.until):null;
  const lo=from?.lo??-Infinity,hi=until?(until.precision==='day'?until.lo:until.hi):Infinity;
  if(lo>=hi)throw Error('Reversed historical interval');return {lo,hi};
}
export const intersects=(a,b)=>a.lo<b.hi&&b.lo<a.hi;
export const historicalYear=year=>year<=0?`${1-year} BCE`:String(year);
export function formatHistoricalDate(value) {
  const d=historicalDate(value),months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return [d.precision==='day'?d.day:'',d.precision!=='year'?months[d.month-1]:'',historicalYear(d.year)].filter(Boolean).join(' ');
}
export function formatHistoricalPeriod(t) {
  if(t.kind==='observation')return formatHistoricalDate(t.observationDate)+' observation';
  if(t.kind==='event')return formatHistoricalDate(t.date);
  if(t.from&&t.until)return t.from===t.until?formatHistoricalDate(t.from):formatHistoricalDate(t.from)+' – '+formatHistoricalDate(t.until);
  return t.from?'From '+formatHistoricalDate(t.from):t.until?'Until '+formatHistoricalDate(t.until):'';
}
