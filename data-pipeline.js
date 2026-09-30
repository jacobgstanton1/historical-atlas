import { geoArea, geoCentroid } from 'https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm';

const NAME_ALIASES = new Map([
  ['united states of america', 'united states'],
  ['u.s.a.', 'united states'],
  ['usa', 'united states'],
  ['union of soviet socialist republics', 'soviet union'],
  ['u.s.s.r.', 'soviet union'],
  ['ussr', 'soviet union'],
  ['great britain', 'united kingdom'],
  ['uk', 'united kingdom'],
]);

const LABEL_OVERRIDES = new Map([
  ['united kingdom', { full: 'UNITED KINGDOM', short: 'UK' }],
  ['united states', { full: 'UNITED STATES', short: 'USA' }],
  ['soviet union', { full: 'SOVIET UNION', short: 'USSR' }],
  ['holy roman empire', { full: 'HOLY ROMAN EMPIRE', short: 'HRE' }],
]);

export function prepareCollection(collection, snapshotYear) {
  const rawFeatures = Array.isArray(collection?.features) ? collection.features : [];
  const features = [];
  let instance = 0;

  for (const sourceFeature of rawFeatures) {
    if (!sourceFeature?.geometry) continue;

    const geometry = repairGeometry(sourceFeature.geometry);
    const candidate = { ...sourceFeature, geometry };
    if (isAntarctic(candidate)) continue;

    const raw = sourceFeature.properties || {};
    const name = clean(raw.display_name ?? raw.NAME ?? raw.name ?? raw.SUBJECTO) || 'Unnamed territory';
    const authority = clean(raw.authority ?? raw.SUBJECTO) || name;
    const partOf = clean(raw.part_of ?? raw.PARTOF);
    const precision = normalizePrecision(raw.border_precision ?? raw.BORDERPRECISION);
    const area = safeArea(candidate);
    const stableId = clean(raw.stable_id) || stableEntityId(name);
    const label = labelData(name, area);
    const featureId = `${stableId}--${snapshotYear}--${instance++}`;

    features.push({
      type: 'Feature',
      id: featureId,
      geometry,
      properties: {
        ...raw,
        _featureId: featureId,
        _stableId: stableId,
        _name: name,
        _authority: authority,
        _partOf: partOf,
        _borderPrecision: precision,
        _confidenceLabel: boundaryConfidence(precision),
        _year: snapshotYear,
        _color: clean(raw.color) || colorFor(authority),
        _area: area,
        _priority: Math.max(1, Math.round(area * 1_000_000)),
        _sortKey: -Math.max(1, Math.round(area * 1_000_000)),
        _labelFull: label.full,
        _labelShort: label.short,
        _label: label.display,
        _labelScale: label.scale,
        _labelClass: label.kind,
      },
    });
  }

  // Large entities come first. MapLibre will also use _sortKey for collision priority.
  features.sort((a, b) => (b.properties._priority || 0) - (a.properties._priority || 0));
  return { type: 'FeatureCollection', features };
}

export function stableEntityId(name) {
  const canonical = canonicalEntityName(name);
  const slug = canonical
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unnamed';
  return `entity-${slug}`;
}

export function canonicalEntityName(name) {
  const cleaned = clean(name).replace(/\s+/g, ' ');
  const alias = NAME_ALIASES.get(cleaned.toLowerCase());
  return alias || cleaned;
}

export function boundaryConfidence(value) {
  switch (Number(value)) {
    case 3: return 'High — legally defined / well documented';
    case 2: return 'Moderate — reconstructed with reasonable precision';
    case 1: return 'Approximate — frontier should be treated as uncertain';
    default: return 'Unspecified in source data';
  }
}

export function buildPresenceIndex(indexJson, minYear = 1800, maxYear = 1960) {
  const registry = new Map();
  const years = Array.isArray(indexJson?.years) ? indexJson.years : [];

  for (const snapshot of years) {
    const year = Number(snapshot.year);
    if (!Number.isFinite(year) || year < minYear || year > maxYear) continue;
    for (const rawName of snapshot.countries || []) {
      const name = clean(rawName);
      if (!name) continue;
      const stableId = stableEntityId(name);
      const item = registry.get(stableId) || { stableId, names: new Set(), years: [] };
      item.names.add(name);
      item.years.push(year);
      registry.set(stableId, item);
    }
  }

  for (const item of registry.values()) {
    item.years = [...new Set(item.years)].sort((a, b) => a - b);
    item.names = [...item.names].sort();
  }
  return registry;
}

export function presenceSummary(registry, stableId, totalSnapshots) {
  const item = registry?.get(stableId);
  if (!item?.years?.length) return 'Not yet indexed';
  const first = item.years[0];
  const last = item.years[item.years.length - 1];
  const span = first === last ? `${first}` : `${first}–${last}`;
  return `${span} · ${item.years.length}/${totalSnapshots} available snapshots`;
}

export function clean(value) {
  return String(value ?? '').trim();
}

function normalizePrecision(value) {
  const n = Number(value);
  return n === 1 || n === 2 || n === 3 ? n : 0;
}

function labelData(name, area) {
  const canonical = canonicalEntityName(name).toLowerCase();
  const override = LABEL_OVERRIDES.get(canonical);
  const full = (override?.full || name).toUpperCase();
  const short = override?.short || acronym(name);

  if (area > 0.035 && full.length <= 26) return { full, short, display: full, scale: 1.28, kind: 'major' };
  if (area > 0.012 && full.length <= 17) return { full, short, display: full, scale: 1.13, kind: 'medium' };
  if (area > 0.0045 && full.length <= 10) return { full, short, display: full, scale: 1.02, kind: 'small' };
  if (area > 0.0015) return { full, short, display: short, scale: 0.94, kind: 'abbrev' };
  return { full, short, display: short, scale: 0.82, kind: 'tiny' };
}

function acronym(name) {
  const ignored = new Set(['OF', 'THE', 'AND', 'DE', 'DA', 'DEL', 'LA', 'LE', 'AL', 'DU']);
  const words = clean(name)
    .toUpperCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^A-ZÀ-Ÿ0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(word => !ignored.has(word));

  if (words.length > 1) return words.slice(0, 4).map(word => word[0]).join('');
  const word = words[0] || clean(name).toUpperCase();
  return word.length <= 6 ? word : word.slice(0, 4);
}

function colorFor(text) {
  let h = 2166136261;
  for (const char of clean(text)) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 46% 62%)`;
}

function safeArea(feature) {
  try { return geoArea(feature); } catch { return 0; }
}

function repairGeometry(geometry) {
  if (!geometry) return geometry;
  if (geometry.type === 'Polygon') {
    const probe = { type: 'Polygon', coordinates: geometry.coordinates };
    if (safeArea(probe) > 2 * Math.PI) {
      return { ...geometry, coordinates: geometry.coordinates.map(ring => [...ring].reverse()) };
    }
    return geometry;
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map(polygon => {
        const probe = { type: 'Polygon', coordinates: polygon };
        return safeArea(probe) > 2 * Math.PI
          ? polygon.map(ring => [...ring].reverse())
          : polygon;
      }),
    };
  }
  if (geometry.type === 'GeometryCollection') {
    return { ...geometry, geometries: (geometry.geometries || []).map(repairGeometry) };
  }
  return geometry;
}

function isAntarctic(feature) {
  const p = feature.properties || {};
  const text = [p.NAME, p.name, p.display_name, p.SUBJECTO, p.PARTOF]
    .map(clean)
    .join(' ')
    .toLowerCase();
  if (text.includes('antarct')) return true;

  try {
    const centroid = geoCentroid(feature);
    return Number.isFinite(centroid?.[1]) && centroid[1] < -65;
  } catch {
    return false;
  }
}
