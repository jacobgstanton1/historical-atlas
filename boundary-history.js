// Coordinate rounding (about a metre at the equator) removes numeric noise.
// Ring winding, starting vertex, holes, polygons and feature order are ignored.
// Interior/exterior roles are retained; this compares mapped geometry, not dates
// of historical border changes, and never infers political succession.
function ringKey(ring) {
  let points = ring.map(p => p.slice(0, 2).map(v => Math.round(v * 1e5)).join(','));
  points = points.filter((p, i) => !i || p !== points[i - 1]);
  if (points.length > 1 && points[0] === points.at(-1)) points.pop();
  if (!points.length) return '';
  const rotate = a => {
    // Booth's minimum rotation: linear time even for a highly detailed frontier.
    const n = a.length; let i = 0, j = 1, k = 0;
    while (i < n && j < n && k < n) {
      const x = a[(i + k) % n], y = a[(j + k) % n];
      if (x === y) { k++; continue; }
      if (x > y) { i += k + 1; if (i <= j) i = j + 1; }
      else { j += k + 1; if (j <= i) j = i + 1; }
      k = 0;
    }
    const start = Math.min(i, j);
    return a.slice(start).concat(a.slice(0, start)).join(';');
  };
  return [rotate(points), rotate([...points].reverse())].sort()[0];
}
export function geometryFingerprint(features) {
  const polygons = [];
  for (const feature of features) {
    const geometry = feature.geometry;
    const pieces = geometry?.type === 'Polygon' ? [geometry.coordinates]
      : geometry?.type === 'MultiPolygon' ? geometry.coordinates : [];
    for (const polygon of pieces) polygons.push(ringKey(polygon[0] || []) + '|' +
      polygon.slice(1).map(ringKey).sort().join('|'));
  }
  // Partition into independent source features is immaterial.
  return [...new Set(polygons)].sort().join('||');
}
export function createBoundaryHistory(snapshots, load) {
  const signatures = new Map(), pending = new Map();
  async function signature(index, id) {
    const key = snapshots[index].year + ':' + id;
    if (signatures.has(key)) return signatures.get(key);
    const year = snapshots[index].year;
    if (!pending.has(year)) pending.set(year, load(snapshots[index]).finally(() => pending.delete(year)));
    const collection = await pending.get(year);
    const features = collection.features.filter(f => f.properties?._stableId === id);
    const value = features.length ? geometryFingerprint(features) : null;
    signatures.set(key, value);
    return value;
  }
  return async (id, index) => {
    const base = await signature(index, id);
    if (base === null) return { absent: true };
    const scan = async direction => {
      for (let i = index + direction; i >= 0 && i < snapshots.length; i += direction) {
        const value = await signature(i, id);
        // Absence is shown separately, not labelled a mapped boundary change.
        if (value !== null && value !== base) return {year: snapshots[i].year, index: i};
      }
      return null;
    };
    const [previous, next] = await Promise.allSettled([scan(-1), scan(1)]);
    return {
      previous: previous.status === 'fulfilled' ? previous.value : null,
      next: next.status === 'fulfilled' ? next.value : null,
      incomplete: previous.status === 'rejected' || next.status === 'rejected'
    };
  };
}
