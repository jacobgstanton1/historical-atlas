import { geoArea, geoCentroid, geoContains } from 'https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm';

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

// Display aliases only: never change source names, IDs or relationships.
const PRESENTATION_ALIASES = new Map([
  ['russian empire', 'RUSSIA'],
  ['qing empire', 'QING'],
  ['ottoman empire', 'OTTOMAN'],
  ['austrian empire', 'AUSTRIA'],
  ['german empire', 'GERMANY'],
  ['empire of brazil', 'BRAZIL'],
  ['viceroyalty of brazil', 'BRAZIL'],
  ['dutch east indies', 'EAST INDIES'],
  ['empire of japan', 'JAPAN'],
  ['republic of china', 'CHINA'],
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
    const parent = sourceParent(name, partOf, authority);

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
        _presentationRole: parent ? 'dependent' : 'primary',
        _presentationParent: parent,
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
    const dependent = group.features.every(feature => feature.properties._presentationRole === 'dependent');
    const label = labelData(group.name, entityArea, dependent);
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

// Correct reviewed titles only. Geometry, stable IDs, source authority and colours
// stay exactly as prepared; the cached boundary collection remains immutable.
export function applyReviewedNames(collection, displayNameFor) {
  const features = collection.features.map(f => ({...f, properties: {...f.properties,
    _name: clean(displayNameFor(f.properties._stableId, f.properties._name)) || f.properties._name}}));
  for (const group of groupByStableId(features).values()) {
    const p = group.features[0].properties;
    const label = labelData(group.name, p._entityArea, group.features.every(f => f.properties._presentationRole === 'dependent'));
    for (const f of group.features) Object.assign(f.properties, {_labelFull:label.full,
      _labelShort:label.short, _label:label.display, _labelScale:label.scale,
      _labelClass:label.kind, _labelMinZoom:label.minZoom});
  }
  return {...collection, features};
}
export function buildLabelCollection(collection) {
  const groups = groupByStableId(collection?.features || []);
  const labels = [];

  for (const group of groups.values()) {
    const name = clean(group.name);
    if (shouldSuppressLabel(name)) continue;

    const entityArea = group.features.reduce((sum, feature) => sum + Number(feature.properties?._area || 0), 0);
    if (!(entityArea > 0)) continue;

    const dependent = group.features.every(feature => feature.properties._presentationRole === 'dependent');
    const label = labelData(name, entityArea, dependent);
    const anchorFeature = largestLabelPiece(group.features);
    if (!anchorFeature) continue;

    const placement = labelPlacement(anchorFeature);
    const anchor = placement?.anchor;
    if (!anchor || !Number.isFinite(anchor[0]) || !Number.isFinite(anchor[1])) continue;

    const stableId = clean(group.stableId);
    const priority = Math.max(1, Math.round(entityArea * 1_000_000));
    const fit = {
      _labelScale: label.scale,
      _letterSpacing: label.letterSpacing,
      _labelRoomWidth: placement.width,
      _labelRoomHeight: placement.height,
    };
    const minZoom = Math.max(label.minZoom, fitZoom(fit, label.short));
    const fullZoom = Math.max(minZoom, fitZoom(fit, label.full));

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
        _labelMinZoom: minZoom,
        _labelFullZoom: fullZoom,
        _letterSpacing: label.letterSpacing,
        // Horizontal labels keep the fit estimate honest and avoid diagonal clutter.
        _labelAngle: 0,
        _labelRoomWidth: placement.width,
        _labelRoomHeight: placement.height,
        _presentationRole: dependent ? 'dependent' : 'primary',
        _labelOpacity: dependent ? 0.78 : 0.96,
        _entityArea: entityArea,
        _priority: priority,
        // All primary labels precede dependents; area orders each tier.
        _sortKey: (dependent ? 100_000_000 : 0) - priority,
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
    case 3: return 'High — source precision class 3';
    case 2: return 'Moderate — source precision class 2';
    case 1: return 'Approximate — source precision class 1; frontier uncertain';
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

function sourceParent(name, partOf, authority) {
  const own = canonicalEntityName(name).toLowerCase();
  for (const candidate of [partOf, authority]) {
    if (!shouldSuppressLabel(candidate) && canonicalEntityName(candidate).toLowerCase() !== own) {
      return clean(candidate);
    }
  }
  // This is a presentation tier, not an assertion of sovereignty or independence.
  return '';
}

function labelData(name, area, dependent = false) {
  const canonical = canonicalEntityName(name);
  const key = canonical.toLowerCase();
  const override = LABEL_OVERRIDES.get(key);
  const full = (override?.full || canonical).toUpperCase();
  // Keep unknown names readable: no automatic initialisms or truncated words.
  const short = override?.short || PRESENTATION_ALIASES.get(key) || full;
  let scale, kind, minZoom, letterSpacing;
  if (area >= 0.07) {
    scale = area >= 0.18 ? 1.16 : 1.10;
    kind = 'major'; minZoom = -1; letterSpacing = 0.06;
  } else if (area >= 0.012) {
    scale = 1.06; kind = 'regional'; minZoom = 1.6; letterSpacing = 0.055;
  } else if (area >= 0.004) {
    scale = 0.98; kind = 'medium'; minZoom = 2.4; letterSpacing = 0.035;
  } else if (area >= 0.001) {
    scale = 0.90; kind = 'small'; minZoom = 3.5; letterSpacing = 0.02;
  } else {
    scale = 0.82; kind = 'local'; minZoom = 5; letterSpacing = 0.01;
  }
  return {
    full, short, display: short, kind,
    scale: scale * (dependent ? 0.86 : 1),
    minZoom: minZoom + (dependent ? 1.25 : 0),
    letterSpacing: letterSpacing * (dependent ? 0.45 : 1),
  };
}

// Match the MapLibre text-size stops. Fit includes conservative glyph advances,
// letter spacing, line height and a small margin, measured in CSS pixels.
export function labelFontSize(zoom, scale = 1) {
  const stops = [[0, 11.2], [1, 11.2], [3, 12.4], [6, 14.8], [10, 18.2], [14, 21.5], [18, 24]];
  for (let i = 1; i < stops.length; i += 1) {
    const [z, size] = stops[i];
    const [previousZ, previousSize] = stops[i - 1];
    if (zoom <= z) return (previousSize + (size - previousSize) * Math.max(0, (zoom - previousZ) / (z - previousZ))) * scale;
  }
  return 24 * scale;
}

function textFits(properties, text, zoom) {
  const size = labelFontSize(zoom, properties._labelScale);
  let advance = 0;
  for (const char of text) {
    advance += /[MW@]/.test(char) ? 0.95 : /[I1 .,'-]/.test(char) ? 0.34 : 0.68;
  }
  const width = size * (advance + Math.max(0, text.length - 1) * properties._letterSpacing) + 8;
  const height = size * 1.35 + 6;
  const magnification = 2 ** zoom;
  return width <= properties._labelRoomWidth * magnification &&
    height <= properties._labelRoomHeight * magnification;
}

function fitZoom(properties, text) {
  // An impossible label remains hidden even at the maximum navigation zoom.
  if (!textFits(properties, text, 18)) return 19;
  let low = -1, high = 18;
  for (let i = 0; i < 12; i += 1) {
    const middle = (low + high) / 2;
    if (textFits(properties, text, middle)) high = middle;
    else low = middle;
  }
  return Math.ceil(high * 20) / 20;
}

export function labelTextAtZoom(properties, zoom) {
  if (zoom < properties._labelMinZoom) return '';
  return zoom >= properties._labelFullZoom ? properties._labelFull : properties._labelShort;
}

function shouldSuppressLabel(name) {
  const value = clean(name);
  if (!value) return true;
  if (JUNK_LABEL_PATTERNS.some(pattern => pattern.test(value))) return true;
  const compact = value.replace(/[^A-Za-z0-9]/g, '');
  return compact.length < 2;
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

function mercatorPoint(point) {
  const latitude = Math.max(-85, Math.min(85, point[1])) * Math.PI / 180;
  return [512 * (point[0] + 180) / 360,
    256 * (1 - Math.log(Math.tan(Math.PI / 4 + latitude / 2)) / Math.PI)];
}

function geographicPoint(point) {
  const longitude = point[0] / 512 * 360 - 180;
  return [((longitude + 180) % 360 + 360) % 360 - 180,
    Math.atan(Math.sinh(Math.PI * (1 - point[1] / 256))) * 180 / Math.PI];
}

function projectedPolygon(polygon) {
  const reference = polygon[0][0][0];
  return polygon.map(ring => {
    let previous = reference;
    return ring.map(point => {
      let longitude = point[0];
      while (longitude - previous > 180) longitude -= 360;
      while (longitude - previous < -180) longitude += 360;
      previous = longitude;
      return mercatorPoint([longitude, point[1]]);
    });
  });
}

// Distance to both sides of the containing scanline interval; using all rings
// includes holes. This rejects attractive centroids that sit in water or outside.
function horizontalRoom(point, polygon) {
  const crossings = [];
  for (const ring of polygon) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[j], b = ring[i];
      if ((a[1] > point[1]) === (b[1] > point[1])) continue;
      crossings.push(a[0] + (point[1] - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
    }
  }
  crossings.sort((a, b) => a - b);
  for (let i = 0; i + 1 < crossings.length; i += 2) {
    if (point[0] >= crossings[i] && point[0] <= crossings[i + 1]) {
      return 2 * Math.min(point[0] - crossings[i], crossings[i + 1] - point[0]);
    }
  }
  return 0;
}

function labelPlacement(feature) {
  const geographic = largestPolygonCoordinates(feature?.geometry);
  if (!geographic?.[0]?.length) return null;
  const polygon = projectedPolygon(geographic);
  const bbox = ringBounds(polygon[0]);
  if (!bbox) return null;
  const candidates = [[(bbox.minX + bbox.maxX) / 2, (bbox.minY + bbox.maxY) / 2]];
  const centroid = safeCentroid(feature);
  if (centroid) {
    while (centroid[0] - geographic[0][0][0] > 180) centroid[0] -= 360;
    while (centroid[0] - geographic[0][0][0] < -180) centroid[0] += 360;
    candidates.push(mercatorPoint(centroid));
  }
  const steps = 14;
  for (let y = 0; y < steps; y += 1) {
    for (let x = 0; x < steps; x += 1) {
      candidates.push([
        bbox.minX + (x + 0.5) / steps * (bbox.maxX - bbox.minX),
        bbox.minY + (y + 0.5) / steps * (bbox.maxY - bbox.minY),
      ]);
    }
  }
  let best = null, bestScore = -Infinity;
  for (const point of candidates) {
    if (!pointInPolygon(point, polygon)) continue;
    // Also respect the spherical source edges used by d3's area/containment.
    if (!geoContains(feature, geographicPoint(point))) continue;
    let edge = Infinity;
    for (const ring of polygon) {
      for (let i = 1; i < ring.length; i += 1) {
        edge = Math.min(edge, segmentDistance(point, ring[i - 1], ring[i]));
      }
    }
    if (!(edge > 0)) continue;
    // Test above and below the baseline too: a long slit should not host a label.
    const offset = edge * 0.45;
    const width = Math.min(
      horizontalRoom(point, polygon),
      horizontalRoom([point[0], point[1] - offset], polygon),
      horizontalRoom([point[0], point[1] + offset], polygon),
    ) * 0.85;
    const height = edge * 1.5;
    const score = Math.sqrt(width * height) + Math.min(width, height * 6) * 0.18;
    if (width > 0 && score > bestScore) {
      bestScore = score;
      best = { anchor: geographicPoint(point), width, height };
    }
  }
  // For very thin/degenerate shapes, omit the label instead of placing it outside.
  return best;
}

function segmentDistance(point, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const length = dx * dx + dy * dy;
  const t = length ? Math.max(0, Math.min(1,
    ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / length)) : 0;
  return Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy);
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
