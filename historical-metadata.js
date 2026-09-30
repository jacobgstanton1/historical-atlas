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
export function createMetadataIndex(database, sources) {
  const entities = new Map(database.entities.map(e => [e.id, e]));
  const registry = new Map(sources.sources.map(s => [s.id, s]));
  const mappings = new Map();
  for (const m of database.mappings) {
    if (!mappings.has(m.mapId)) mappings.set(m.mapId, []);
    mappings.get(m.mapId).push(m);
  }
  return {
    registry,
    resolve(mapId, year) {
      const matches = (mappings.get(mapId) || []).filter(m => validInYear(m, year));
      const ids = [...new Set(matches.map(m => m.entityId))];
      // Never choose an arbitrary identity when a year spans an identity transition.
      if (ids.length !== 1) return { entity: null, ambiguous: ids.length > 1 };
      const entity = entities.get(ids[0]);
      if (!entity) return { entity: null };
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
    },
    searchTerms(mapId, year) {
      const {entity, names = []} = this.resolve(mapId, year);
      return [...names.map(f => f.value), ...(entity?.aliases || []).filter(f => validInYear(f, year)).map(f => f.value)];
    }
  };
}
let pending;
export function loadMetadata() {
  return pending ||= Promise.all(['./data/historical-entities.json?v=0.6.1',
    './data/historical-sources.json?v=0.6.1'].map(async url => {
      const r = await fetch(url); if (!r.ok) throw new Error('Metadata HTTP ' + r.status); return r.json();
    })).then(([db, sources]) => createMetadataIndex(db, sources));
}
