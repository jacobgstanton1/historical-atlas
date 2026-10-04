// Historical Basemaps convention: negative magnitude = BCE; no year zero.
// This is separate from the evidence registry's astronomical date convention.
export function formatSnapshotYear(year) {
  if (!Number.isInteger(year) || year === 0) throw new Error('Invalid snapshot year');
  return year < 0 ? `${-year} BCE` : String(year);
}
export function selectableYear(value, snapshots) {
  const year = Math.round(Number(value));
  if (!Number.isFinite(year) || year === 0) return NaN;
  const bounded = Math.max(snapshots[0].year, Math.min(snapshots.at(-1).year, year));
  // Preserve existing requested-year/boundary separation in the legacy range.
  if (bounded >= 1800) return bounded;
  // Earlier navigation selects actual available maps, never a fabricated date.
  return snapshots.reduce((best, s) => Math.abs(s.year - bounded) < Math.abs(best.year - bounded) ? s : best).year;
}
