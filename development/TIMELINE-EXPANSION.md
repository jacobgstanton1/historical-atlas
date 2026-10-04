# Timeline expansion — infrastructure only

Baseline: `07672212b3be3783ea20f9eb768c463b2dc40fd2`. No historical research or acquisition was performed. Production claims, entity/source registries, all eleven existing boundary files and their historical mappings are preserved. Visible atlas version remains unchanged.

## Canonical model

`snapshots.js` is the shared catalogue. Each record carries numeric `year`, independent `displayLabel`, `era`, `availability` and an exact boundary `file` or null. Astronomical numbering is used: 4000 BCE = -3999, 1 BCE = 0, 1 CE = 1. Sorting uses the integer year, never the label. Labels can later include circa qualifiers without changing order. URLs use the same signed chronological integer.

The default remains 1938. All configured snapshots select exactly their catalogue record. The existing requested-year versus boundary-year handling within 1800–1960 remains intact; no new target borrows a neighbouring boundary or dossier. Unconfigured dates outside that legacy range also remain empty rather than selecting neighbouring geometry.

## Navigation and empty state

The slider navigates snapshot indices with even spacing, preventing modern snapshots from collapsing into the end of a 6000-year linear scale. An era-grouped picker exposes every target. Progressive ticks show at most ten marks and retain the current selection. Previous/next, playback, keyboard navigation, deep links and browser history use the shared model.

All 30 new targets are explicitly unpopulated. Their loader returns a fresh empty FeatureCollection without requesting a boundary file. Selection clears the current dossier and political geometry/labels are hidden immediately, including during asynchronous source updates and load failures. The existing neutral land/coastline backdrop remains a navigation underlay; it asserts no new political territory. Empty status reads “No territory data for this snapshot”. Search cannot select stale territories. The labels toggle cannot expose hidden political layers on an empty date.

The research scanner consumes only populated catalogue records by default, preserving the existing occurrence workload and all accepted claims. `readSnapshotConfig(root, {populatedOnly:false})` exposes the full catalogue when needed. Existing external workload exports remain preserved historical checkpoints; their old fingerprints are not silently refreshed or used to bypass drift checks.

## Ordered catalogue

| Display label | Internal year | Boundary availability |
|---|---:|---|
| 4000 BCE | -3999 | Empty — no territory data |
| 3000 BCE | -2999 | Empty — no territory data |
| 2000 BCE | -1999 | Empty — no territory data |
| 1500 BCE | -1499 | Empty — no territory data |
| 1000 BCE | -999 | Empty — no territory data |
| 500 BCE | -499 | Empty — no territory data |
| 200 BCE | -199 | Empty — no territory data |
| 1 CE | 1 | Empty — no territory data |
| 200 CE | 200 | Empty — no territory data |
| 400 CE | 400 | Empty — no territory data |
| 476 CE | 476 | Empty — no territory data |
| 600 CE | 600 | Empty — no territory data |
| 800 CE | 800 | Empty — no territory data |
| 1000 CE | 1000 | Empty — no territory data |
| 1100 CE | 1100 | Empty — no territory data |
| 1200 CE | 1200 | Empty — no territory data |
| 1300 CE | 1300 | Empty — no territory data |
| 1400 CE | 1400 | Empty — no territory data |
| 1453 CE | 1453 | Empty — no territory data |
| 1500 CE | 1500 | Empty — no territory data |
| 1600 CE | 1600 | Empty — no territory data |
| 1648 CE | 1648 | Empty — no territory data |
| 1700 CE | 1700 | Empty — no territory data |
| 1750 CE | 1750 | Empty — no territory data |
| 1800 CE | 1800 | world_1800.geojson |
| 1815 CE | 1815 | world_1815.geojson |
| 1878 CE | 1878 | world_1878.geojson |
| 1880 CE | 1880 | world_1880.geojson |
| 1900 CE | 1900 | world_1900.geojson |
| 1914 CE | 1914 | world_1914.geojson |
| 1920 CE | 1920 | world_1920.geojson |
| 1930 CE | 1930 | world_1930.geojson |
| 1938 CE | 1938 | world_1938.geojson |
| 1945 CE | 1945 | world_1945.geojson |
| 1960 CE | 1960 | world_1960.geojson |
| 1970 CE | 1970 | Empty — no territory data |
| 1980 CE | 1980 | Empty — no territory data |
| 1991 CE | 1991 | Empty — no territory data |
| 2000 CE | 2000 | Empty — no territory data |
| 2010 CE | 2010 | Empty — no territory data |
| 2026 CE | 2026 | Empty — no territory data |

## Validation

See `development/timeline-expansion-validation.json` for full-suite results, baseline comparison and exact known failure locations. Nine new automated tests cover BCE ordering/formatting, all-target selection and URL round trips, preservation of existing snapshots, empty loading, no neighbouring fallback, bounded ticks and production immutability. Together with URL and preserved-workload/integration checks, 29 focused checks pass. Twenty-four local browser assertions cover desktop/mobile, an existing 1938 dossier, empty BCE and modern targets, rendered geometry absence, no guessed data requests and return to 1960. Screenshots were visually reviewed.

A read-only baseline comparison replayed the failing test files with pre-expansion frontend bytes. Fourteen existing failures reproduce; they concern old historical checkpoint assumptions, archived certificates/counts or previously frozen product hashes. These are documented rather than repaired by modifying historical claims or weakening certificates. Two historical-data tests were updated only to remove the superseded frontend freeze assumption; their accepted-package and source/mapping invariants remain. No integration validator was changed.

## Future population

Do not enable a target by borrowing another date’s geometry. Supply independently approved exact-date geometry and mappings before changing that target’s availability/file. New evidence remains subject to the existing source, temporal, identity, scope and fingerprint review controls. This task does not populate any new target.

Final full suite: **619 checks; 605 passed; 14 reproduced pre-existing failures; zero new failures**. Read-only baseline subset: 207 checks, 193 passed, the same 14 failed. Focused suite:29/29. Local browser:24/24. Pages/live verification follows the pushed checkpoint.
