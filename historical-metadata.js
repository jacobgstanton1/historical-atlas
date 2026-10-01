// Metadata never changes map identity or geometry. All intervals are half-open.
// Partial dates retain their precision; resolution intersects the whole selected
// calendar year, so an intra-year transition can show more than one record.
export function dateBounds(date) {
  if (!date) return [-Infinity, Infinity];
  const parts = String(date).split('-').map(Number);
  const [y, m = 1, d = 1] = parts;
  const start = Date.UTC(y, m - 1, d);
  const end = parts.length === 1 ? Date.UTC(y + 1, 0, 1)
    : parts.length === 2 ? Date.UTC(y, m, 1) : start + 86400000;
  return [start, end];
}
export function validInYear(fact, year) {
  const start = Date.UTC(year, 0, 1), end = Date.UTC(year + 1, 0, 1);
  // An imprecise end may overlap part of its final month/year.
  const from = fact.validFrom ? dateBounds(fact.validFrom)[0] : -Infinity;
  const until = fact.validUntil ? (fact.validUntil.length === 10
    ? dateBounds(fact.validUntil)[0] : dateBounds(fact.validUntil)[1]) : Infinity;
  return from < end && until > start;
}
export function observationsForYear(records = [], year) {
  const eligible = records.filter(f => f.asOf && dateBounds(f.asOf)[0] < Date.UTC(year + 1, 0, 1));
  const groups = new Map();
  for (const f of eligible) {
    const key = (f.metric || 'Population') + '|' + (f.scope || '');
    const previous = groups.get(key);
    if (!previous || dateBounds(f.asOf)[0] > dateBounds(previous.asOf)[0]) groups.set(key, f);
  }
  return [...groups.values()];
}

// The input is a calendar year, never an implied point-in-time selection.
export function intervalBounds(record) {
  return [
    record.validFrom ? dateBounds(record.validFrom)[0] : -Infinity,
    record.validUntil ? (record.validUntil.length === 10
      ? dateBounds(record.validUntil)[0] : dateBounds(record.validUntil)[1]) : Infinity,
  ];
}
const frameworkFields = ['politicalStatus', 'governments'];
function fieldYearReview(records, year, equivalents = []) {
  const start = Date.UTC(year, 0, 1), end = Date.UTC(year + 1, 0, 1);
  const groups = new Map();
  for (const record of records) {
    const equivalence = equivalents.find(group => group.values.includes(record.value));
    const key = equivalence ? JSON.stringify(equivalence.values) : String(record.value);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  const coversYear = values => {
    let cursor = start;
    for (const [from, until] of values.map(intervalBounds).sort((a,b)=>a[0]-b[0])) {
      if (from > cursor) return false;
      cursor = Math.max(cursor, until);
      if (cursor >= end) return true;
    }
    return false;
  };
  if (groups.size === 1 && equivalents.some(g=>records.every(r=>g.values.includes(r.value))) && coversYear(records))
    return {changed:false,incomplete:false};
  // Different simultaneous institutions are not automatically incompatible.
  const changed = groups.size > 1 && ([...groups.values()].some(values => !coversYear(values)) ||
    records.some(r=>[r.validFrom,r.validUntil].some(d=>d && Number(d.slice(0,4)) === year)));
  const incomplete = records.length > 0 && !coversYear(records);
  // A year/month endpoint retains uncertainty rather than becoming 31 December.
  const uncertainEndpoint = records.some(r => r.validUntil?.length < 10 &&
    Number(r.validUntil.slice(0,4)) === year);
  const uncertainStart = records.some(r => r.validFrom?.length < 10 &&
    Number(r.validFrom.slice(0,4)) === year && !records.some(other =>
      other !== r && intervalBounds(other)[0] < start));
  return {changed, incomplete: incomplete || uncertainEndpoint || uncertainStart};
}
export function reviewCalendarYear(entity, records, matches, year) {
  const fields = frameworkFields.map(field => ({field, ...fieldYearReview(
    records[field] || [], year, (entity.frameworkContinuity || []).filter(g => g.field === field))}));
  const mapping = fieldYearReview(matches.map(m => ({...m,value:entity.id})), year);
  const changed = fields.some(f=>f.changed);
  const partial = fields.some(f=>f.incomplete) || mapping.incomplete;
  return {year, isTransition: changed || partial,
    kind: changed ? 'framework-transition' : partial ? 'partial-framework' : 'ordinary',
    needsResearch: partial, fields: fields.filter(f=>f.changed || f.incomplete)};
}

export function createMetadataIndex(database, sources) {
  const entities = new Map(database.entities.map(e => [e.id, e]));
  const registry = new Map(sources.sources.map(s => [s.id, s]));
  const mappings = new Map();
  for (const m of database.mappings) {
    if (!mappings.has(m.mapId)) mappings.set(m.mapId, []);
    mappings.get(m.mapId).push(m);
  }
  const resolveEntity = (entity, year) => {
    const result = { entity };
    for (const field of ['names', 'flags', 'politicalStatus', 'capitals', 'governments',
      'leaders', 'currencies', 'relationships', 'descriptions', 'area'])
      result[field] = (entity[field] || []).filter(f => validInYear(f, year));
    result.population = observationsForYear(entity.population, year);
    result.economy = observationsForYear(entity.economy, year);
    result.events = entity.events || [];
    result.predecessors = entity.predecessors || [];
    result.successors = entity.successors || [];
    return result;
  };
  return {
    registry,
    resolve(mapId, year) {
      const matches = (mappings.get(mapId) || []).filter(m => validInYear(m, year));
      const ids = [...new Set(matches.map(m => m.entityId))];
      // Never choose an arbitrary identity when a year spans an identity transition.
      if (ids.length !== 1) return { entity: null, ambiguous: ids.length > 1,
        calendarYear: {year, isTransition: ids.length > 1, kind: 'identity-transition', needsResearch: true},
        identityPeriods: ids.flatMap(id => {
          const entity = entities.get(id);
          return entity ? [{...resolveEntity(entity,year), mappings:matches.filter(m=>m.entityId===id)}] : [];
        }) };
      const entity = entities.get(ids[0]);
      if (!entity) return { entity: null };
      const result = resolveEntity(entity, year);
      result.calendarYear = reviewCalendarYear(entity,result,matches,year);
      return result;
    },
    searchTerms(mapId, year) {
      const {entity, names = []} = this.resolve(mapId, year);
      return [...names.map(f => f.value), ...(entity?.aliases || []).filter(f => validInYear(f, year)).map(f => f.value)];
    }
  };
}
let pending;
export function loadMetadata() {
  return pending ||= Promise.all(['./data/historical-entities.json?v=0.6.1&data=b21',
    './data/historical-sources.json?v=0.6.1&data=b21'].map(async url => {
      const r = await fetch(url); if (!r.ok) throw new Error('Metadata HTTP ' + r.status); return r.json();
    })).then(([db, sources]) => createMetadataIndex(db, sources));
}
