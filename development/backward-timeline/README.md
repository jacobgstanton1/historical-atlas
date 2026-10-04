# Backward timeline expansion

Historical verification record for commit 56ba291. Current selectable catalogue has 46 snapshots: 1492 is temporarily deferred, and Historical Basemaps is pinned to da7a4b735ecef70aebdc9c73e409d8a2500d50f3. See exports/backward-timeline-census for the current read-only census. The original verification records below are preserved.

The 47 configured snapshots use real Historical Basemaps GeoJSON. 1960 remains the hard maximum. No placeholder maps or historical dossier claims were added.

## Model and loading

The canonical catalogue remains in app.js, consumed by the existing map loader and offline catalogue parser. Negative magnitude denotes BCE (-1 = 1 BCE); there is no year zero. Snapshot formatting is separate from the evidence registry's astronomical chronology, which remains unchanged.

The slider steps through catalogue indices, with progressive ticks, existing previous/next/play controls and year entry (negative numbers for BCE). Earlier unsupported year entry selects an actual configured date. Existing 1800–1960 requested-year versus boundary-snapshot behaviour remains intact. Every configured date loads its exact filename using the unchanged local-file then HISTORICAL_BASE CDN fallback. No neighbouring GeoJSON is substituted.

prepareCollection, reviewed map-name application, buildLabelCollection, map layers, colours, borders and zoom pipeline remain in use. The eleven original catalogue entries, data files, mappings, claims and flag assets are unchanged. The old research inventory and exports remain scoped to 1800–1960; no research/eligibility classification was fabricated for the added maps.

## Ordered catalogue and exact source files

| Snapshot | File | Added |
| --- | --- | --- |
| 4000 BCE | world_bc4000.geojson | Yes |
| 3000 BCE | world_bc3000.geojson | Yes |
| 2000 BCE | world_bc2000.geojson | Yes |
| 1500 BCE | world_bc1500.geojson | Yes |
| 1000 BCE | world_bc1000.geojson | Yes |
| 700 BCE | world_bc700.geojson | Yes |
| 500 BCE | world_bc500.geojson | Yes |
| 400 BCE | world_bc400.geojson | Yes |
| 323 BCE | world_bc323.geojson | Yes |
| 300 BCE | world_bc300.geojson | Yes |
| 200 BCE | world_bc200.geojson | Yes |
| 100 BCE | world_bc100.geojson | Yes |
| 1 BCE | world_bc1.geojson | Yes |
| 100 | world_100.geojson | Yes |
| 200 | world_200.geojson | Yes |
| 300 | world_300.geojson | Yes |
| 400 | world_400.geojson | Yes |
| 500 | world_500.geojson | Yes |
| 600 | world_600.geojson | Yes |
| 700 | world_700.geojson | Yes |
| 800 | world_800.geojson | Yes |
| 900 | world_900.geojson | Yes |
| 1000 | world_1000.geojson | Yes |
| 1100 | world_1100.geojson | Yes |
| 1200 | world_1200.geojson | Yes |
| 1279 | world_1279.geojson | Yes |
| 1300 | world_1300.geojson | Yes |
| 1400 | world_1400.geojson | Yes |
| 1492 | world_1492.geojson | Yes |
| 1500 | world_1500.geojson | Yes |
| 1530 | world_1530.geojson | Yes |
| 1600 | world_1600.geojson | Yes |
| 1650 | world_1650.geojson | Yes |
| 1700 | world_1700.geojson | Yes |
| 1715 | world_1715.geojson | Yes |
| 1783 | world_1783.geojson | Yes |
| 1800 | world_1800.geojson | Existing |
| 1815 | world_1815.geojson | Existing |
| 1878 | world_1878.geojson | Existing |
| 1880 | world_1880.geojson | Existing |
| 1900 | world_1900.geojson | Existing |
| 1914 | world_1914.geojson | Existing |
| 1920 | world_1920.geojson | Existing |
| 1930 | world_1930.geojson | Existing |
| 1938 | world_1938.geojson | Existing |
| 1945 | world_1945.geojson | Existing |
| 1960 | world_1960.geojson | Existing |

## Verification

All 36 earlier source files were downloaded and checked for non-empty polygon collections (source-files.json contains exact URLs and hashes). All 36 passed the actual browser-loaded prepareCollection and territory-label generator (prepared-maps.json). Cached source bytes used for local testing were kept outside the repository.

Browser inspections confirmed rendered polygons, borders and territory labels at 1783, 1600, 1492, 1000, 500, 1 BCE, 500 BCE, 1500 BCE and 4000 BCE. Existing 1800, 1938 and 1960 maps also passed. Mobile 500 BCE rendering and map-derived dossier date passed. Test probes are injected only into test browser responses and are not part of the deployed application.

The full test suite ran: 615 tests, 601 passed, 14 failed. All 14 failures were independently reproduced against the reverted baseline; they are existing historical fixture/certificate or frozen-frontend assertions. No new failures remain. All 28 focused tests pass, including the five new backward-snapshot tests. tests.json records the baseline failure comparison. Historical validation and certificate rules were not changed. Legacy integration/export immutability tests now protect historical data rather than prohibiting this authorised timeline UI change; the new tests directly compare historical data against the reverted baseline.

Run browser verification with node scripts/backward-timeline-browser.mjs (local) or --live. --prepare-all checks every added source through the existing geometry/label preparation; --mobile-only checks mobile BCE map/dossier presentation.
