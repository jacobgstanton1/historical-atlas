import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.11.2/dist/maplibre-gl.mjs';
import { geoCentroid } from 'https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm';
import {
  prepareCollection,
  applyReviewedNames,
  buildLabelCollection,
  buildPresenceIndex,
  presenceSummary,
  clean,
} from './data-pipeline.js?v=qa01';
import { loadMetadata, reviewedMapName } from './historical-metadata.js?v=qa01';
import { renderDossier } from './dossier.js?v=visual-cleanup2';
import { loadRichDossiers } from './rich-dossier.js?v=canonical-cleanup1';
import {readAtlasState,atlasUrl,createAtlasHistory} from './atlas-state.js?v=product1';
import { createBoundaryHistory } from './boundary-history.js?v=0.6.1';

const SNAPSHOTS = [
  { year: 1800, file: 'world_1800.geojson' },
  { year: 1815, file: 'world_1815.geojson' },
  { year: 1878, file: 'world_1878.geojson' },
  { year: 1880, file: 'world_1880.geojson' },
  { year: 1900, file: 'world_1900.geojson' },
  { year: 1914, file: 'world_1914.geojson' },
  { year: 1920, file: 'world_1920.geojson' },
  { year: 1930, file: 'world_1930.geojson' },
  { year: 1938, file: 'world_1938.geojson' },
  { year: 1945, file: 'world_1945.geojson' },
  { year: 1960, file: 'world_1960.geojson' },
];

const TEST_MIN_YEAR = SNAPSHOTS[0].year;
const TEST_MAX_YEAR = SNAPSHOTS[SNAPSHOTS.length - 1].year;
const INITIAL_YEAR = readAtlasState(window.location.href).year;
const WORLD_BOUNDS = [[-179, -56], [179, 74]];
const HISTORICAL_BASE = 'https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/';
const INDEX_URL = 'https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/index.json';
const LAND_URL = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@ca96624a/geojson/ne_50m_land.geojson';

const els = {
  status: document.querySelector('#status'),
  search: document.querySelector('#search'),
  searchResults: document.querySelector('#search-results'),
  labelsToggle: document.querySelector('#labels-toggle'),
  resetView: document.querySelector('#reset-view'),
  loading: document.querySelector('#loading-indicator'),
  loadingText: document.querySelector('#loading-text'),
  inspector: document.querySelector('#inspector'),
  closeInspector: document.querySelector('#close-inspector'),
  previous: document.querySelector('#previous-year'),
  next: document.querySelector('#next-year'),
  play: document.querySelector('#play'),
  timeline: document.querySelector('#timeline'),
  snapshotMarks: document.querySelector('#snapshot-marks'),
  yearLabel: document.querySelector('#year-label'),
  snapshotNote: document.querySelector('#snapshot-note'),
  yearForm: document.querySelector('#year-form'),
  yearJump: document.querySelector('#year-jump'),
  yearGo: document.querySelector('#year-form button'),
};

let currentIndex = nearestSnapshotIndex(INITIAL_YEAR);
let requestedYear = INITIAL_YEAR;
let currentFeatures = [];
let activeAbort = null;
let loadSerial = 0;
let selectedStableId = null;
let hoveredFeatureId = null;
let labelsVisible = true;
let playTimer = null;
let presenceRegistry = new Map();
let presenceReady = false;
let lastLabelZoom = null;
let worldViewActive = true;
const snapshotCache = new Map();
let metadata = null;
let metadataError = false;
let rich = null;
let richError = false;
let selectedName = '';
let renderedDossierId = null;
let displayedIndex = currentIndex;
let boundaryLoadFailed = false;
let mapReady = false;
let restoreSerial = 0;
let shareFeedbackTimer;
const atlasHistory = createAtlasHistory(window, () => { if(mapReady)restoreLocation(); });
const findBoundaries = createBoundaryHistory(SNAPSHOTS, snapshot => loadSnapshotData(snapshot));
loadMetadata().then(value => {
  metadata = value;
  refreshIdentityNames();
  if (selectedStableId) renderInspector(selectedStableId);
  updateSearchResults();
}).catch(error => {
  metadataError = true;
  console.warn('Historical metadata unavailable', error);
  if (selectedStableId) renderInspector(selectedStableId);
});
loadRichDossiers().then(value => {
  rich = value;
  if (selectedStableId) renderInspector(selectedStableId);
}).catch(error => {
  richError = true;
  console.warn('Additional historical dossier data unavailable', error);
  if (selectedStableId) renderInspector(selectedStableId);
});

configureTimeline();
setControlsDisabled(true);

const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {},
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#bcd9e6' } }],
  },
  center: [0, 12],
  zoom: 0.5,
  minZoom: -1,
  maxZoom: 18,
  // Fixed maxBounds forces a covering zoom, cropping short or narrow screens.
  // Fit the inhabited world to the unobscured UI instead.
  renderWorldCopies: false,
  // Permit a single world to be smaller than the canvas; retain bounded panning.
  transformConstrain: (center, zoom) => ({
    center: new maplibregl.LngLat(
      Math.max(-179.9, Math.min(179.9, center.lng)),
      Math.max(-58.5, Math.min(84, center.lat)),
    ),
    zoom: Math.max(-1, Math.min(18, zoom)),
  }),
  attributionControl: false,
  dragRotate: false,
  pitchWithRotate: false,
  touchPitch: false,
  cooperativeGestures: false,
});

map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

map.on('load', async () => {
  mapReady = true;
  installMapLayers();
  wireMapInteractions();
  resetView({ duration: 0 });
  setControlsDisabled(false);
  showLoading('Loading map data…');

  const initialTasks = [
    loadLandMask(),
    loadPresenceRegistry(),
    restoreLocation(),
  ];
  await Promise.allSettled(initialTasks);
  hideLoading();
});

function installMapLayers() {
  map.addSource('land', { type: 'geojson', data: emptyCollection() });
  map.addLayer({
    id: 'land-fill',
    type: 'fill',
    source: 'land',
    paint: { 'fill-color': '#e3e3dc', 'fill-opacity': 1 },
  });
  map.addLayer({
    id: 'coastline',
    type: 'line',
    source: 'land',
    paint: { 'line-color': '#50565a', 'line-width': 0.7, 'line-opacity': 0.72 },
  });

  map.addSource('historical', {
    type: 'geojson',
    data: emptyCollection(),
    promoteId: '_featureId',
  });

  // Labels live in a separate, polity-level source. The historical source can
  // contain many polygons for one polity; this source deliberately contains
  // exactly one point per polity so names never repeat across disconnected land.
  map.addSource('historical-labels', {
    type: 'geojson',
    data: emptyCollection(),
  });

  map.addLayer({
    id: 'territories-fill',
    type: 'fill',
    source: 'historical',
    paint: {
      'fill-color': ['get', '_color'],
      'fill-opacity': ['case', ['==', ['get', '_stableId'], ''], 0.82, 0.93],
    },
  });

  map.addLayer({
    id: 'territories-line',
    type: 'line',
    source: 'historical',
    paint: {
      'line-color': '#1b2024',
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.62, 6, 1.05, 10, 1.28, 14, 1.45, 18, 1.55],
      'line-opacity': 0.9,
    },
  });

  map.addLayer({
    id: 'hover-outline',
    type: 'line',
    source: 'historical',
    filter: ['==', ['get', '_featureId'], '__none__'],
    paint: {
      'line-color': '#293d47',
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 1, 8, 1.5, 14, 1.8, 18, 2],
      'line-opacity': 0.9,
    },
  });

  map.addLayer({
    id: 'selected-outline',
    type: 'line',
    source: 'historical',
    filter: ['==', ['get', '_stableId'], '__none__'],
    paint: {
      'line-color': '#050607',
      'line-width': ['interpolate', ['linear'], ['zoom'], 1, 2, 8, 2.6, 14, 3, 18, 3.2],
    },
  });

  // v0.5 political hierarchy: one label per polity, collision-aware, with
  // progressively smaller entities revealed as the user zooms in.
  map.addLayer({
    id: 'territory-labels',
    type: 'symbol',
    source: 'historical-labels',
    filter: ['<=', ['get', '_labelMinZoom'], map.getZoom()],
    layout: {
      'text-field': ['get', '_labelShort'],
      'text-size': [
        'interpolate', ['linear'], ['zoom'],
        1, ['*', 11.2, ['get', '_labelScale']],
        3, ['*', 12.4, ['get', '_labelScale']],
        6, ['*', 14.8, ['get', '_labelScale']],
        10, ['*', 18.2, ['get', '_labelScale']],
        14, ['*', 21.5, ['get', '_labelScale']],
        18, ['*', 24, ['get', '_labelScale']],
      ],
      'text-font': ['Open Sans Regular'],
      'text-letter-spacing': ['get', '_letterSpacing'],
      'text-rotate': ['get', '_labelAngle'],
      'text-rotation-alignment': 'map',
      'text-pitch-alignment': 'map',
      'text-max-width': 100, // Fit metadata assumes a single horizontal line.
      'text-line-height': 1,
      'text-anchor': 'center',
      'text-justify': 'center',
      'text-padding': [
        'interpolate', ['linear'], ['zoom'],
        1, 8,
        4, 6,
        8, 4,
      ],
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      'text-optional': true,
      'symbol-sort-key': ['get', '_sortKey'],
      'symbol-z-order': 'source',
    },
    paint: {
      'text-color': '#111416',
      'text-opacity': ['get', '_labelOpacity'],
    },
  });

  updateLabelZoomFilter();
}

async function loadLandMask() {
  try {
    const response = await fetch(LAND_URL);
    if (!response.ok) throw new Error(`Land HTTP ${response.status}`);
    const collection = await response.json();
    map.getSource('land').setData(removeAntarcticaFromLand(collection));
  } catch (error) {
    console.warn('Base land layer failed to load', error);
  }
}

async function loadPresenceRegistry() {
  try {
    const response = await fetch(INDEX_URL);
    if (!response.ok) throw new Error(`Index HTTP ${response.status}`);
    const indexJson = await response.json();
    indexJson.years = (indexJson.years || []).filter(item => SNAPSHOTS.some(s => s.year === Number(item.year)));
    presenceRegistry = buildPresenceIndex(indexJson, TEST_MIN_YEAR, TEST_MAX_YEAR);
    presenceReady = true;
    if (selectedStableId) renderInspector(selectedStableId);
  } catch (error) {
    presenceReady = false;
    console.warn('Continuity index failed to load', error);
  }
}

function removeAntarcticaFromLand(collection) {
  const cleaned = [];
  for (const feature of collection?.features || []) {
    const geometry = feature?.geometry;
    if (!geometry) continue;

    if (geometry.type === 'Polygon') {
      if (!polygonIsAntarctic(geometry.coordinates)) cleaned.push(feature);
      continue;
    }

    if (geometry.type === 'MultiPolygon') {
      const coordinates = geometry.coordinates.filter(poly => !polygonIsAntarctic(poly));
      if (coordinates.length) cleaned.push({ ...feature, geometry: { ...geometry, coordinates } });
      continue;
    }

    cleaned.push(feature);
  }
  return { type: 'FeatureCollection', features: cleaned };
}

function polygonIsAntarctic(coordinates) {
  try {
    const feature = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates } };
    const centroid = geoCentroid(feature);
    return Number.isFinite(centroid?.[1]) && centroid[1] < -62;
  } catch {
    return false;
  }
}

function wireMapInteractions() {
  map.on('mousemove', 'territories-fill', event => {
    const feature = chooseMostSpecificFeature(event.features || []);
    const id = clean(feature?.properties?._featureId);
    map.getCanvas().style.cursor = feature ? 'pointer' : '';
    if (id === hoveredFeatureId) return;
    hoveredFeatureId = id || null;
    map.setFilter('hover-outline', ['==', ['get', '_featureId'], hoveredFeatureId || '__none__']);
  });

  map.on('mouseleave', 'territories-fill', () => {
    hoveredFeatureId = null;
    map.getCanvas().style.cursor = '';
    map.setFilter('hover-outline', ['==', ['get', '_featureId'], '__none__']);
  });

  map.on('click', 'territories-fill', event => {
    // Query a small screen-space box so narrow countries are easier to tap on mobile.
    const pad = window.matchMedia('(pointer: coarse)').matches ? 8 : 3;
    const box = [
      [event.point.x - pad, event.point.y - pad],
      [event.point.x + pad, event.point.y + pad],
    ];
    const hits = map.queryRenderedFeatures(box, { layers: ['territories-fill'] });
    const feature = chooseMostSpecificFeature(hits);
    if (feature) selectFeature(clean(feature.properties?._stableId));
  });

  map.on('click', event => {
    const hits = map.queryRenderedFeatures(event.point, { layers: ['territories-fill'] });
    if (!hits.length && selectedStableId) clearSelection();
  });
}

function updateLabelZoomFilter() {
  if (!map.getLayer('territory-labels')) return;
  // Conservative buckets avoid changing layout for every animation tick.
  const zoom = Math.floor(map.getZoom() * 20) / 20;
  if (zoom === lastLabelZoom) return;
  lastLabelZoom = zoom;
  map.setFilter('territory-labels', ['<=', ['get', '_labelMinZoom'], zoom]);
  map.setLayoutProperty('territory-labels', 'text-field', [
    'case', ['<=', ['get', '_labelFullZoom'], zoom],
    ['get', '_labelFull'], ['get', '_labelShort'],
  ]);
}

map.on('zoom', updateLabelZoomFilter);
map.on('movestart', event => {
  if (event.originalEvent) worldViewActive = false;
});
map.on('resize', () => {
  if (worldViewActive) resetView({ duration: 0 });
});

function chooseMostSpecificFeature(features) {
  return [...features]
    .filter(feature => feature?.properties?._stableId)
    .sort((a, b) => Number(a.properties?._area || Infinity) - Number(b.properties?._area || Infinity))[0] || null;
}

async function setSnapshot(index, { resetSelection = false, requested = null, historyMode = 'push' } = {}) {
  index = clamp(index, 0, SNAPSHOTS.length - 1);
  const snapshot = SNAPSHOTS[index];
  if (!snapshot) return;

  currentIndex = index;
  requestedYear = requested !== null && Number.isFinite(Number(requested))
    ? clamp(Math.round(Number(requested)), TEST_MIN_YEAR, TEST_MAX_YEAR)
    : snapshot.year;
  const serial = ++loadSerial;

  if (activeAbort) activeAbort.abort();
  activeAbort = new AbortController();

  updateTimelineUi(snapshot, requestedYear);
  syncUrl(historyMode);
  els.status.textContent = `Loading ${snapshot.year}…`;
  showLoading(`Loading ${snapshot.year} boundaries…`);
  closeSearchResults();

  try {
    const boundaries = await loadSnapshotData(snapshot, activeAbort.signal);
    if (serial !== loadSerial) return;
    const prepared = applyReviewedNames(boundaries, (id, fallback) => reviewedMapName(metadata, id, requestedYear, fallback, snapshot.year));

    currentFeatures = prepared.features;
    displayedIndex = index;
    boundaryLoadFailed = false;
    map.getSource('historical').setData(prepared);
    map.getSource('historical-labels').setData(buildLabelCollection(prepared));
    lastLabelZoom = null;
    updateLabelZoomFilter();

    if (resetSelection) clearSelection();
    else if (selectedStableId) renderInspector(selectedStableId);

    updateMapStatus();
    hideLoading();
    updateSearchResults();
    updateSnapshotMarks();
    prefetchNeighbours(index);
  } catch (error) {
    if (error.name === 'AbortError' || serial !== loadSerial) return;
    console.error(error);
    els.status.textContent = `Could not load ${snapshot.year}`;
    els.snapshotNote.textContent = 'Boundary file unavailable';
    boundaryLoadFailed = true;
    hideLoading();
    if (selectedStableId) renderInspector(selectedStableId);
  }
}

async function loadSnapshotData(snapshot, signal) {
  if (snapshotCache.has(snapshot.year)) return snapshotCache.get(snapshot.year);

  const localUrl = `./data/${snapshot.file}`;
  let raw = null;

  try {
    const local = await fetch(localUrl, { signal, cache: 'force-cache' });
    if (local.ok) raw = await local.json();
  } catch (error) {
    if (error.name === 'AbortError') throw error;
  }

  if (!raw) {
    const remote = await fetch(`${HISTORICAL_BASE}${snapshot.file}`, { signal, cache: 'force-cache' });
    if (!remote.ok) throw new Error(`Historical data HTTP ${remote.status}`);
    raw = await remote.json();
  }

  const prepared = prepareCollection(raw, snapshot.year);
  snapshotCache.set(snapshot.year, prepared);
  return prepared;
}

function refreshIdentityNames() {
  const cached = snapshotCache.get(SNAPSHOTS[displayedIndex].year);
  if (!cached || !mapReady || boundaryLoadFailed) return;
  const prepared = applyReviewedNames(cached, (id, fallback) => reviewedMapName(metadata, id, requestedYear, fallback, SNAPSHOTS[displayedIndex].year));
  currentFeatures = prepared.features;
  map.getSource('historical')?.setData(prepared);
  map.getSource('historical-labels')?.setData(buildLabelCollection(prepared));
  lastLabelZoom = null;
  updateLabelZoomFilter();
}
function prefetchNeighbours(index) {
  const neighbours = [index - 1, index + 1]
    .filter(i => i >= 0 && i < SNAPSHOTS.length)
    .map(i => SNAPSHOTS[i])
    .filter(snapshot => !snapshotCache.has(snapshot.year));

  for (const snapshot of neighbours) {
    // Do not use the active AbortController: prefetching should never interfere with navigation.
    loadSnapshotData(snapshot, undefined).catch(() => {});
  }
}

function selectFeature(stableId, { zoomTo = false, historyMode = 'push' } = {}) {
  if (!stableId) return;
  const matches = currentFeatures.filter(item => item.properties?._stableId === stableId);
  if (!matches.length) return;

  const newlyOpened = !selectedStableId;
  selectedStableId = stableId;
  selectedName = clean(matches[0].properties?._name);
  syncUrl(historyMode);
  if (newlyOpened) requestAnimationFrame(() => els.closeInspector.focus({ preventScroll: true }));
  map.setFilter('selected-outline', ['==', ['get', '_stableId'], stableId]);
  renderInspector(stableId);

  if (zoomTo) {
    worldViewActive = false;
    const bounds = featuresBounds(matches);
    if (bounds) map.fitBounds(bounds, { padding: responsiveFitPadding(), maxZoom: 7.8, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200 });
  }
}

function renderInspector(stableId) {
  const matches = currentFeatures.filter(item => item.properties?._stableId === stableId);
  if (matches.length) selectedName = clean(matches[0].properties._name);
  const body = document.querySelector('#dossier-content');
  const scroll = renderedDossierId === stableId ? body.scrollTop : 0;
  renderedDossierId = stableId;
  renderDossier(body, {
    stableId, savedName: selectedName, features: matches, allFeatures: currentFeatures,
    year: requestedYear, snapshotYear: SNAPSHOTS[displayedIndex].year,
    metadata, metadataError, rich, richError, boundaryLoadFailed, minYear: TEST_MIN_YEAR, maxYear: TEST_MAX_YEAR,
    presence: presenceReady ? presenceSummary(presenceRegistry, stableId, SNAPSHOTS.length) : 'Presence index loading…',
    currentMapIds: new Set(currentFeatures.map(f => f.properties._stableId)),
    selectRelated: id => selectFeature(id, { zoomTo: true }),
    goYear: goToRequestedYear, findBoundaries, boundaryIndex: displayedIndex,
  });
  els.inspector.classList.add('is-open');
  els.inspector.setAttribute('aria-hidden', 'false');
  els.inspector.inert = false;
  body.scrollTop = scroll;
}

function clearSelection({historyMode = 'push'} = {}) {
  selectedStableId = null;
  syncUrl(historyMode);
  document.querySelector('#share-fallback').hidden = true;
  renderedDossierId = null;
  if (map.getLayer('selected-outline')) {
    map.setFilter('selected-outline', ['==', ['get', '_stableId'], '__none__']);
  }
  els.inspector.classList.remove('is-open');
  els.inspector.setAttribute('aria-hidden', 'true');
  els.inspector.inert = true;
  if (els.inspector.contains(document.activeElement)) map.getCanvas().focus({ preventScroll: true });
}

function featuresBounds(features) {
  const bounds = new maplibregl.LngLatBounds();
  let hasPoint = false;

  for (const feature of features) {
    walkCoordinates(feature.geometry?.coordinates, point => {
      if (!Array.isArray(point) || point.length < 2) return;
      const [lng, lat] = point;
      if (!Number.isFinite(lng) || !Number.isFinite(lat) || lat < -65) return;
      bounds.extend([lng, lat]);
      hasPoint = true;
    });
  }
  return hasPoint ? bounds : null;
}

function walkCoordinates(value, visit) {
  if (!Array.isArray(value)) return;
  if (typeof value[0] === 'number') {
    visit(value);
    return;
  }
  value.forEach(item => walkCoordinates(item, visit));
}

function updateSearchResults() {
  const query = els.search.value.trim().toLowerCase();
  if (!query) {
    closeSearchResults();
    return;
  }

  const seen = new Set();
  const matches = currentFeatures
    .filter(feature => {
      const p = feature.properties || {};
      const stableId = clean(p._stableId);
      if (!stableId || seen.has(stableId)) return false;
      const haystack = [p._name, p._authority, p._partOf, ...(metadata?.searchTerms(stableId, requestedYear) || [])]
        .map(clean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
      seen.add(stableId);
      return true;
    })
    .sort((a, b) => Number(clean(b.properties?._name).toLowerCase() === query) - Number(clean(a.properties?._name).toLowerCase() === query)
      || Number(b.properties?._priority || 0) - Number(a.properties?._priority || 0))
    .slice(0, 8);

  els.searchResults.innerHTML = '';
  if (!matches.length) {
    els.searchResults.innerHTML = '<button class="search-result" type="button" disabled>No match in this snapshot</button>';
    els.searchResults.hidden = false;
    return;
  }

  for (const feature of matches) {
    const p = feature.properties || {};
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search-result';
    const subtitle = clean(p._partOf) || (clean(p._authority) !== clean(p._name) ? clean(p._authority) : '');
    button.innerHTML = `<strong>${escapeHtml(clean(p._name))}</strong>${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ''}`;
    button.addEventListener('click', () => {
      selectFeature(clean(p._stableId), { zoomTo: true });
      els.search.value = '';
      closeSearchResults();
    });
    els.searchResults.appendChild(button);
  }
  els.searchResults.hidden = false;
}

function closeSearchResults() {
  els.searchResults.hidden = true;
  els.searchResults.innerHTML = '';
}

function configureTimeline() {
  els.timeline.min = String(TEST_MIN_YEAR);
  els.timeline.max = String(TEST_MAX_YEAR);
  els.timeline.step = '1';
  els.timeline.value = String(INITIAL_YEAR);
  els.yearJump.min = String(TEST_MIN_YEAR);
  els.yearJump.max = String(TEST_MAX_YEAR);
  els.yearJump.value = String(INITIAL_YEAR);

  els.snapshotMarks.innerHTML = SNAPSHOTS.map((snapshot, index) => {
    const percent = ((snapshot.year - TEST_MIN_YEAR) / (TEST_MAX_YEAR - TEST_MIN_YEAR)) * 100;
    return `<button class="snapshot-mark" type="button" data-index="${index}" style="left:${percent}%" title="${snapshot.year}" aria-label="Go to ${snapshot.year} boundary snapshot"></button>`;
  }).join('');
  for (const mark of els.snapshotMarks.querySelectorAll('.snapshot-mark')) {
    mark.addEventListener('click', () => {
      const index = Number(mark.dataset.index);
      if (!Number.isInteger(index) || !SNAPSHOTS[index]) return;
      stopPlay();
      setSnapshot(index, { resetSelection: false, requested: SNAPSHOTS[index].year });
    });
  }
  updateSnapshotMarks();
}

function updateTimelineUi(snapshot, requested) {
  els.timeline.value = String(clamp(requested, TEST_MIN_YEAR, TEST_MAX_YEAR));
  els.yearJump.value = String(clamp(requested, TEST_MIN_YEAR, TEST_MAX_YEAR));
  els.yearLabel.textContent = requested + ' CE';
  els.snapshotNote.textContent = requested === snapshot.year
    ? 'Exact boundary snapshot'
    : 'Boundary data: nearest available snapshot — ' + snapshot.year;
  els.previous.disabled = currentIndex <= 0;
  els.next.disabled = currentIndex >= SNAPSHOTS.length - 1;
  updateSnapshotMarks();
}

function updateSnapshotMarks() {
  for (const mark of els.snapshotMarks.querySelectorAll('.snapshot-mark')) {
    mark.classList.toggle('is-current', Number(mark.dataset.index) === currentIndex);
  }
}

function nearestSnapshotIndex(year) {
  const target = Number(year);
  let bestIndex = 0;
  let bestDistance = Infinity;
  SNAPSHOTS.forEach((snapshot, index) => {
    const distance = Math.abs(snapshot.year - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function goToRequestedYear(year, {historyMode = 'push'} = {}) {
  const clampedYear = clamp(Math.round(Number(year)), TEST_MIN_YEAR, TEST_MAX_YEAR);
  if (!Number.isFinite(clampedYear)) return;
  if(playTimer)stopPlay();
  const index = nearestSnapshotIndex(clampedYear);
  if (index === currentIndex && displayedIndex === index && snapshotCache.has(SNAPSHOTS[index].year)) {
    requestedYear = clampedYear;
    refreshIdentityNames();
    syncUrl(historyMode);
    updateTimelineUi(SNAPSHOTS[index], requestedYear);
    if (els.loading.hidden) updateMapStatus();
    if (selectedStableId) renderInspector(selectedStableId);
    updateSearchResults();
    return;
  }
  setSnapshot(index, { resetSelection: false, requested: clampedYear, historyMode });
}

function worldPadding() {
  const height = map.getContainer().clientHeight;
  const topbar = document.querySelector('.topbar').getBoundingClientRect();
  const timeline = document.querySelector('.timeline-shell').getBoundingClientRect();
  return {
    top: Math.min(height * 0.22, topbar.bottom + 12),
    bottom: Math.min(height * 0.35, height - timeline.top + 18),
    left: 18, right: 18,
  };
}

function resetView({ duration = 200 } = {}) {
  worldViewActive = true;
  map.fitBounds(WORLD_BOUNDS, {
    padding: worldPadding(), maxZoom: 1.35, bearing: 0, pitch: 0,
    duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration, retainPadding: false,
  });
}

function updateMapStatus() {
  const snapshotYear = SNAPSHOTS[currentIndex].year;
  els.status.textContent = requestedYear === snapshotYear
    ? requestedYear + ' CE · ' + currentFeatures.length + ' territories'
    : requestedYear + ' CE · boundary data ' + snapshotYear + ' · ' + currentFeatures.length + ' territories';
}

function step(delta) {
  const index = clamp(currentIndex + delta, 0, SNAPSHOTS.length - 1);
  setSnapshot(index, { resetSelection: false, requested: SNAPSHOTS[index].year });
}

function togglePlay() {
  if (playTimer) {
    stopPlay();
    return;
  }
  if (currentIndex >= SNAPSHOTS.length - 1) {
    setSnapshot(0, { resetSelection: false, requested: SNAPSHOTS[0].year });
  }
  els.play.dataset.playing = 'true';
  els.play.setAttribute('aria-label', 'Pause timeline');
  els.play.title = 'Pause timeline';
  playTimer = window.setInterval(() => {
    if (currentIndex >= SNAPSHOTS.length - 1) {
      stopPlay();
      return;
    }
    const nextIndex = currentIndex + 1;
    setSnapshot(nextIndex, { resetSelection: false, requested: SNAPSHOTS[nextIndex].year, historyMode: 'transient' });
  }, 1700);
}

function stopPlay() {
  if (playTimer) window.clearInterval(playTimer);
  playTimer = null;
  if(mapReady)syncUrl('commit');
  els.play.dataset.playing = 'false';
  els.play.setAttribute('aria-label', 'Play timeline');
  els.play.title = 'Play timeline';
}

function showLoading(message) {
  els.loadingText.textContent = message;
  els.loading.hidden = false;
}
function hideLoading() { els.loading.hidden = true; }
function setControlsDisabled(disabled) {
  [els.timeline, els.previous, els.next, els.play, els.yearJump, els.yearGo].forEach(control => { control.disabled = disabled; });
}
function responsiveFitPadding() {
  return window.innerWidth <= 760
    ? { top: 80, bottom: Math.min(window.innerHeight * .56 + 166, window.innerHeight * .7), left: 30, right: 30 }
    : { top: 90, bottom: 145, left: 70, right: Math.min(480, window.innerWidth * .45) };
}
function emptyCollection() { return { type: 'FeatureCollection', features: [] }; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function escapeHtml(value) {
  return clean(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}
function isEditableTarget(target) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
}

els.timeline.addEventListener('input', event => {
  goToRequestedYear(Number(event.target.value), {historyMode: 'transient'});
});

els.timeline.addEventListener('change', event => {
  goToRequestedYear(Number(event.target.value), {historyMode: 'commit'});
});
els.yearForm.addEventListener('submit', event => {
  event.preventDefault();
  goToRequestedYear(Number(els.yearJump.value));
});
els.previous.addEventListener('click', () => { stopPlay(); step(-1); });
els.next.addEventListener('click', () => { stopPlay(); step(1); });
els.play.addEventListener('click', togglePlay);
els.search.addEventListener('input', updateSearchResults);
els.search.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    els.search.value = '';
    closeSearchResults();
    els.search.blur();
  }
});
els.labelsToggle.addEventListener('click', () => {
  labelsVisible = !labelsVisible;
  els.labelsToggle.setAttribute('aria-pressed', String(labelsVisible));
  if (map.getLayer('territory-labels')) {
    map.setLayoutProperty('territory-labels', 'visibility', labelsVisible ? 'visible' : 'none');
  }
});
els.resetView.addEventListener('click', resetView);
els.closeInspector.addEventListener('click', clearSelection);

document.addEventListener('pointerdown', event => {
  if (!els.searchResults.hidden && !event.target.closest('.search-wrap')) closeSearchResults();
});

document.addEventListener('keydown', event => {
  if (document.querySelector('#about-dialog').open || isEditableTarget(event.target)) return;
  if (event.key !== 'Escape' && event.target.closest?.('button, a, #inspector')) return;
  if (event.key === 'ArrowLeft') {
    event.preventDefault(); stopPlay(); step(-1);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault(); stopPlay(); step(1);
  } else if (event.key === 'Home') {
    event.preventDefault(); stopPlay(); setSnapshot(0, { resetSelection: false, requested: SNAPSHOTS[0].year });
  } else if (event.key === 'End') {
    event.preventDefault(); stopPlay(); const i = SNAPSHOTS.length - 1; setSnapshot(i, { resetSelection: false, requested: SNAPSHOTS[i].year });
  } else if (event.key === ' ' && !event.repeat) {
    event.preventDefault(); togglePlay();
  } else if (event.key === 'Escape') {
    clearSelection(); closeSearchResults();
  }
});

function syncUrl(mode='push') {
  if(mode==='none')return;
  ++restoreSerial;
  atlasHistory.navigate({year:requestedYear,territory:selectedStableId},mode);
}
async function restoreLocation() {
  const serial=++restoreSerial,state=readAtlasState(window.location.href);
  // Restoration must not create another navigation entry or finalize a slider/play transaction.
  if(playTimer){window.clearInterval(playTimer);playTimer=null;els.play.dataset.playing='false';els.play.setAttribute('aria-label','Play timeline');els.play.title='Play timeline';}
  clearSelection({historyMode:'none'});
  await setSnapshot(nearestSnapshotIndex(state.year),{requested:state.year,historyMode:'none'});
  if(serial!==restoreSerial)return;
  if(boundaryLoadFailed){atlasHistory.navigate(state,'replace');return;}
  if(state.territory)selectFeature(state.territory,{zoomTo:true,historyMode:'none'});
  syncUrl('replace');
}
const aboutDialog=document.querySelector('#about-dialog');
document.querySelector('#about-toggle').addEventListener('click',()=>aboutDialog.showModal());
document.querySelector('#about-close').addEventListener('click',()=>aboutDialog.close());
aboutDialog.addEventListener('click',event=>{if(event.target===aboutDialog){const b=aboutDialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)aboutDialog.close();}});
const shareButton=document.querySelector('#share-territory'),shareLabel=document.querySelector('#share-label'),shareStatus=document.querySelector('#share-status');
function shareFeedback(message) {
  clearTimeout(shareFeedbackTimer);shareLabel.textContent=message;shareStatus.textContent=message;
  shareFeedbackTimer=setTimeout(()=>{shareLabel.textContent='Share';},3500);
}
shareButton.addEventListener('click',async()=>{
  if(!selectedStableId)return;
  const url=atlasUrl(window.location.href,{year:requestedYear,territory:selectedStableId});
  clearTimeout(shareFeedbackTimer);shareLabel.textContent='Share';shareStatus.textContent='';
  shareButton.disabled=true;document.querySelector('#share-fallback').hidden=true;
  try {
    if(navigator.share){try{await navigator.share({title:'Historical Atlas — '+selectedName,text:selectedName+' · '+requestedYear,url});shareFeedback('Link shared');return;}catch(error){if(error.name==='AbortError')return;}}
    if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
    await navigator.clipboard.writeText(url);shareFeedback('Link copied');
  } catch {
    const input=document.querySelector('#share-url');input.value=url;document.querySelector('#share-fallback').hidden=false;input.focus();input.select();shareFeedback('Copy link below');
  } finally {shareButton.disabled=false;}
});
