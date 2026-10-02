# Mapped-area completion tranche

This measures the **actual historical boundary snapshot polygons displayed by the atlas**. It does not supply official contemporary area, claimed sovereign territory, population statistical geography, or a new historical interpretation.

## Frozen inputs and method

All 11 configured 1800–1960 snapshot files are copied from the exact Historical Basemaps CDN paths used by the app. The importer refuses to run if a preferred local snapshot exists without explicit intake. Existing reviewed map IDs and manifest feature counts associate polygons with the already-resolved political dossiers; no `SUBJECTO`, `PARTOF`, geometry overlap or modern-country fallback establishes political ownership or succession.

`derive_area.py` uses pyproj 3.7.2 / Shapely 2.1.2: WGS84 ellipsoidal geodesic polygon area, holes subtracted, duplicate/overlapping pieces unioned, and antimeridian longitudes unwrapped. Invalid source topology is held without repair. Output is rounded to three significant digits. Identical geometry hashes reuse computation, while different snapshot observations retain their own actual boundary dates. No continuous interval is inferred between observations.

Upstream Historical Basemaps is GPL-3.0; its frozen license is in `cache/LICENSE`. Boundary files and mapped derivations retain attribution to the existing `basemaps` source. Production values explicitly identify mapped/geometric area and its limitations. These measurements do not authorize automatic population density without separately established matching territorial scope and observation dates.

## Controlled production path

The extraction has 972 candidates and 71 held slots. The existing source-certified cohort validator and **serial** comprehensive-dossier integrator accept individual entity packages. The coordinator's certificate binds exact source bytes, extractor, baseline and reviewed identity inputs. Every package receives its own immutable acceptance receipt and recoverable integration journal transaction.

`preserved-package-hashes.json` freezes all 703 pre-tranche accepted packages. No frontend, legacy historical fact, historical source record or accepted population observation is rewritten.

## Focused validation and continuation

Eight numerical geometry tests, five intake/immutability tests and four data-applicability tests passed. Mapped area requires its actual boundary year in both reader and scanner; nearby census/official statistical observations remain unchanged. No atlas browser checks are needed for this data-only operation. See `category-report.json` for **actual** completed gains, full deterministic audit and prior-package preservation, and `deployment-proof.json` for the successful exact GitHub Pages checkpoint and live committed-data hash check when published.

The category matrix and operation ranking are in `../AUTOMATION-PRIORITY.md`. Density's strict automatic join currently has zero explicit scope/date matches. Dated Commons flag candidates are preserved separately; name matches, unlicensed assets, missing qualifiers and conflicting flags cannot become production merely to fill slots. Government/Politics is deferred rather than following the old fixed wave order.

Run geometry work with Python and the pinned libraries. The current isolated native-library runtime is in the system temporary directory; install those pinned versions into another isolated runtime if it expires. Do not rerun a completed intake to recreate historical evidence. The cohort integrator can resume exact already-integrated packages and refuses changed inputs.
