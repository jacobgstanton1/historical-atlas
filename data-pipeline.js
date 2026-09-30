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

// These are presentation overrides only. They do not alter borders or historical data.
// They ensure globally important polities remain legible at the world view even when
// the source geometry is split into several pieces.
const WORLD_LABEL_NAMES = new Set([
  'russian empire', 'qing empire', 'ottoman empire', 'austrian empire',
  'united states', 'soviet union', 'united kingdom', 'french empire',
  'france', 'spanish empire', 'spain', 'portuguese empire', 'portugal',
  'viceroyalty of new spain', 'viceroyalty of brazil', 'empire of brazil',
  'brazil', 'persia', 'japan', 'german empire', 'germany', 'italy',
  'austria-hungary', 'austro-hungarian empire', 'prussia',
]);

const JUNK_LABEL_PATTERNS = [
  /^unnamed(?: territory)?$/i,
  /^unknown(?: territory)?$/i,
  /^unlabelled$/i,
  /^unlabeled$/i,
  /^no name$/i,
  /^n\/?a$/i,
  /^none$/i,
  /^null$/i,
  /^\?+$/,
  /^-+$/,
];

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
    const featureId = `${stableId}--${snapshotYear}--${instance++}`;
    const colorKey = partOf || authority || name;

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
        _color: clean(raw.color) || colorFor(colorKey),
        _area: area,
      },
    });
  }

  // Aggregate by polity. This is the key distinction between source polygons and
  // atlas entities: one polity may contain many disconnected polygons, but it gets
  // one visual priority and one label.
  const groups = groupByStableId(features);
  for (const group of groups.values()) {
    const entityArea = group.features.reduce((sum, feature) => sum + Number(feature.properties?._area || 0), 0);
    const label = labelData(group.name, entityArea);
    const priority = Math.max(1, Math.round(entityArea * 1_000_000));

    for (const feature of group.features) {
      Object.assign(feature.properties, {
        _entityArea: entityArea,
        _priority: priority,
        _sortKey: -priority,
        _labelFull: label.full,
        _labelShort: label.short,
        _label: label.display,
        _labelScale: label.scale,
        _labelClass: label.kind,
        _labelMinZoom: label.minZoom,
      });
    }
  }

  features.sort((a, b) => (b.properties._priority || 0) - (a.properties._priority || 0));
  return { type: 'FeatureCollection', features };
}

export function buildLabelCollection(collection) {
  const groups = groupByStableId(collection?.features || []);
  const labels = [];

  for (const group of groups.values()) {
    const name = clean(group.name);
    if (shouldSuppressLabel(name)) continue;

    const entityArea = group.features.reduce((sum, feature) => sum + Number(feature.properties?._area || 0), 0);
    if (!(entityArea > 0)) continue;

    const label = labelData(name, entityArea);
    const anchorFeature = largestLabelPiece(group.features);
    if (!anchorFeature) continue;

    const anchor = interiorPoint(anchorFeature);
    if (!anchor || !Number.isFinite(anchor[0]) || !Number.isFinite(anchor[1])) continue;

    const angle = labelAngle(anchorFeature);
    const stableId = clean(group.stableId);
    const priority = Math.max(1, Math.round(entityArea * 1_000_000));

    labels.push({
      type: 'Feature',
      id: `label-${stableId}`,
      geometry: { type: 'Point', coordinates: anchor },
      properties: {
        _stableId: stableId,
        _name: name,
        _labelFull: label.full,
        _labelShort: label.short,
        _labelScale: label.scale,
        _labelClass: label.kind,
        _labelMinZoom: label.minZoom,
        _letterSpacing: label.letterSpacing,
        _labelAngle: angle,
        _entityArea: entityArea,
        _priority: priority,
        _sortKey: -priority,
      },
    });
  }

  labels.sort((a, b) => Number(b.properties._priority || 0) - Number(a.properties._priority || 0));
  return { type: 'FeatureCollection', features: labels };
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

function groupByStableId(features) {
  const groups = new Map();
  for (const feature of features || []) {
    const p = feature?.properties || {};
    const stableId = clean(p._stableId);
    if (!stableId) continue;
    const item = groups.get(stableId) || {
      stableId,
      name: clean(p._name) || 'Unnamed territory',
      features: [],
    };
    item.features.push(feature);
    groups.set(stableId, item);
  }
  return groups;
}

function normalizePrecision(value) {
  const n = Number(value);
  return n === 1 || n === 2 || n === 3 ? n : 0;
}

function labelData(name, area) {
  const canonical = canonicalEntityName(name).toLowerCase();
  const override = LABEL_OVERRIDES.get(canonical);
  const full = (override?.full || canonicalEntityName(name)).toUpperCase();
  const short = override?.short || acronym(name);
  const forcedWorld = WORLD_LABEL_NAMES.has(canonical);

  if (forcedWorld || area >= 0.07) {
    return { full, short: full, display: full, scale: area >= 0.18 ? 1.34 : 1.22, kind: 'major', minZoom: 1, letterSpacing: area >= 0.18 ? 0.16 : 0.11 };
  }
  if (area >= 0.012) {
    return { full, short: full, display: full, scale: 1.08, kind: 'regional', minZoom: 1.15, letterSpacing: 0.075 };
  }
  if (area >= 0.004) {
    return { full, short: full.length <= 15 ? full : short, display: full.length <= 15 ? full : short, scale: 0.98, kind: 'medium', minZoom: 2.15, letterSpacing: 0.045 };
  }
  if (area >= 0.001) {
    return { full, short, display: short, scale: 0.90, kind: 'small', minZoom: 3.35, letterSpacing: 0.025 };
  }
  return { full, short, display: short, scale: 0.82, kind: 'local', minZoom: 5.25, letterSpacing: 0.015 };
}

function shouldSuppressLabel(name) {
  const value = clean(name);
  if (!value) return true;
  if (JUNK_LABEL_PATTERNS.some(pattern => pattern.test(value))) return true;
  const compact = value.replace(/[^A-Za-z0-9]/g, '');
  return compact.length < 2;
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
  return word.length <= 7 ? word : word.slice(0, 4);
}

function colorFor(text) {
  let h = 2166136261;
  for (const char of clean(text).toLowerCase()) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 43% 64%)`;
}

function largestLabelPiece(features) {
  let best = null;
  let bestArea = -1;
  for (const feature of features || []) {
    const geometry = feature?.geometry;
    if (!geometry) continue;

    if (geometry.type === 'Polygon') {
      const area = safeArea(feature);
      if (area > bestArea) { best = feature; bestArea = area; }
      continue;
    }

    if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates || []) {
        const candidate = { type: 'Feature', properties: feature.properties || {}, geometry: { type: 'Polygon', coordinates: polygon } };
        const area = safeArea(candidate);
        if (area > bestArea) { best = candidate; bestArea = area; }
      }
    }
  }
  return best;
}

function interiorPoint(feature) {
  const polygon = largestPolygonCoordinates(feature?.geometry);
  if (!polygon?.[0]?.length) return safeCentroid(feature);

  const outer = polygon[0];
  const bbox = ringBounds(outer);
  if (!bbox) return safeCentroid(feature);

  const candidates = [];
  const centroid = safeCentroid({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: polygon } });
  if (centroid) candidates.push(centroid);
  candidates.push([(bbox.minX + bbox.maxX) / 2, (bbox.minY + bbox.maxY) / 2]);

  // A small deterministic grid gives us a robust point inside concave countries
  // without adding another runtime dependency. We choose the point furthest from
  // the polygon edge, which behaves much like a simplified pole-of-inaccessibility.
  const steps = 10;
  for (let y = 0; y < steps; y += 1) {
    for (let x = 0; x < steps; x += 1) {
      candidates.push([
        bbox.minX + ((x + 0.5) / steps) * (bbox.maxX - bbox.minX),
        bbox.minY + ((y + 0.5) / steps) * (bbox.maxY - bbox.minY),
      ]);
    }
  }

  let best = null;
  let bestScore = -Infinity;
  for (const point of candidates) {
    if (!pointInPolygon(point, polygon)) continue;
    const edgeDistance = distanceToRing(point, outer);
    const centerPenalty = centroid ? planarDistance(point, centroid) * 0.025 : 0;
    const score = edgeDistance - centerPenalty;
    if (score > bestScore) { best = point; bestScore = score; }
  }

  return best || centroid || outer[0] || null;
}

function labelAngle(feature) {
  const polygon = largestPolygonCoordinates(feature?.geometry);
  const ring = polygon?.[0];
  if (!ring || ring.length < 4) return 0;

  const bbox = ringBounds(ring);
  if (!bbox) return 0;
  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  if (width <= 0 || height <= 0) return 0;

  // Keep broad east-west countries horizontal. Only elongated shapes receive a
  // modest rotation; near-vertical labels are deliberately avoided for readability.
  const elongation = Math.max(width / height, height / width);
  if (elongation < 1.65 || width / height > 2.2) return 0;

  const meanLat = ring.reduce((sum, p) => sum + Number(p?.[1] || 0), 0) / ring.length;
  const xScale = Math.max(0.25, Math.cos(meanLat * Math.PI / 180));
  let meanX = 0;
  let meanY = 0;
  let count = 0;
  for (const point of ring) {
    if (!Number.isFinite(point?.[0]) || !Number.isFinite(point?.[1])) continue;
    meanX += point[0] * xScale;
    meanY += point[1];
    count += 1;
  }
  if (!count) return 0;
  meanX /= count;
  meanY /= count;

  let xx = 0;
  let yy = 0;
  let xy = 0;
  for (const point of ring) {
    if (!Number.isFinite(point?.[0]) || !Number.isFinite(point?.[1])) continue;
    const dx = point[0] * xScale - meanX;
    const dy = point[1] - meanY;
    xx += dx * dx;
    yy += dy * dy;
    xy += dx * dy;
  }

  let degrees = 0.5 * Math.atan2(2 * xy, xx - yy) * 180 / Math.PI;
  while (degrees > 90) degrees -= 180;
  while (degrees < -90) degrees += 180;
  if (Math.abs(degrees) > 42) degrees = Math.sign(degrees) * 42;
  if (Math.abs(degrees) < 7) degrees = 0;
  return Math.round(degrees * 10) / 10;
}

function largestPolygonCoordinates(geometry) {
  if (!geometry) return null;
  if (geometry.type === 'Polygon') return geometry.coordinates;
  if (geometry.type !== 'MultiPolygon') return null;

  let best = null;
  let bestArea = -1;
  for (const polygon of geometry.coordinates || []) {
    const area = safeArea({ type: 'Polygon', coordinates: polygon });
    if (area > bestArea) { best = polygon; bestArea = area; }
  }
  return best;
}

function ringBounds(ring) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of ring || []) {
    const x = Number(point?.[0]);
    const y = Number(point?.[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
}

function pointInPolygon(point, polygon) {
  if (!pointInRing(point, polygon?.[0])) return false;
  for (let i = 1; i < (polygon?.length || 0); i += 1) {
    if (pointInRing(point, polygon[i])) return false;
  }
  return true;
}

function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = (ring?.length || 0) - 1; i < (ring?.length || 0); j = i++) {
    const xi = Number(ring[i]?.[0]);
    const yi = Number(ring[i]?.[1]);
    const xj = Number(ring[j]?.[0]);
    const yj = Number(ring[j]?.[1]);
    if (![xi, yi, xj, yj].every(Number.isFinite)) continue;
    const intersects = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function distanceToRing(point, ring) {
  let best = Infinity;
  for (let i = 1; i < (ring?.length || 0); i += 1) {
    best = Math.min(best, pointSegmentDistance(point, ring[i - 1], ring[i]));
  }
  return best;
}

function pointSegmentDistance(point, a, b) {
  const latScale = Math.max(0.25, Math.cos(point[1] * Math.PI / 180));
  const px = point[0] * latScale;
  const py = point[1];
  const ax = Number(a?.[0]) * latScale;
  const ay = Number(a?.[1]);
  const bx = Number(b?.[0]) * latScale;
  const by = Number(b?.[1]);
  if (![px, py, ax, ay, bx, by].every(Number.isFinite)) return Infinity;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function planarDistance(a, b) {
  const latScale = Math.max(0.25, Math.cos(((a[1] + b[1]) / 2) * Math.PI / 180));
  return Math.hypot((a[0] - b[0]) * latScale, a[1] - b[1]);
}

function safeCentroid(feature) {
  try {
    const centroid = geoCentroid(feature);
    return Number.isFinite(centroid?.[0]) && Number.isFinite(centroid?.[1]) ? centroid : null;
  } catch {
    return null;
  }
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
