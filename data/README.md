# Historical metadata — schema version 1

The map geometry remains Historical Basemaps. The dossier files do not add facts
to GeoJSON, alter map identities, or infer sovereignty or succession.

- historical-entities.json contains explicit map-ID mappings and independent
  historical records. Mappings may have validity intervals. An ambiguous
  calendar-year mapping deliberately falls back to map data.
- historical-sources.json is the reusable provenance registry. Every historical
  fact, name, alias, event, relationship, overview and asset cites sourceIds.
- historical-metadata.js caches and indexes these records separately from map
  features. dossier.js renders the currently resolved information.
- boundary-history.js compares actual prepared geometry in the eleven available
  snapshots. Ring order, direction, starting vertex, source-feature order,
  duplicate identical polygons and sub-metre numeric noise are ignored. Absence
  is not a border change. Different polygon partitions or additional redundant
  collinear vertices can still produce a mapped difference; the UI deliberately
  says “mapped change”, never the historical date of a real border change.

## Dates and coverage

Dates retain source precision: YYYY, YYYY-MM or YYYY-MM-DD. A selected year is a
whole calendar-year window, not an assumed January 1 observation. Facts that
overlap that window are shown together with their periods. Exact validUntil is
exclusive. An imprecise end date may end during that month/year and therefore
overlaps it. Use YYYY-01-01 for an exact end at the start of a year. Some records
have deliberately limited editorial coverage; their notes distinguish that
coverage from the actual inception of an institution. Missing end dates mean
“end not curated”, not evidence that a historical condition lasted forever.

Statistics need asOf, observationType, scope and sources. The resolver shows the
latest observation on or before the selected year separately for each metric and
scope. It does not interpolate, aggregate incompatible observations or use future
observations. The date and scope remain visible even when old.

Supported arrays: names (kind: primary/formal/alternate), aliases, flags,
politicalStatus, capitals, governments, leaders (role, party, dynasty,
legislature), population, economy (metric/unit), area, currencies, relationships
(type and explicit mapIds), predecessors, successors, events and descriptions.
An existence object records a sourced period. Dated records use value,
validFrom/validUntil, sourceIds, confidence and note as appropriate. Events and
transitions use date. Flags additionally require asset, alt, licence and
attribution. Multiple flags can apply within a transition year.

## Curation and expansion

Add a registry source before adding a fact. Record the institution, exact title,
URL, access date, known publication/date/version and applicable reuse terms.
Do not invent unknown publication dates or licences. Validate evidence and
periods manually; schema validation cannot establish historical truth. Narratives
are curated factual paraphrases, not runtime generation. The v0.6.1 reference profiles include historical capitals, currencies, leadership, flags and scoped population observations. Coverage remains limited to researched periods; area, density and GDP are deliberately absent. See ../README.md for exact coverage and licensing.

The initial records demonstrate US, UK, Germany under Nazi rule, Soviet Union,
imperial Japan, post-war Japan and British Raj. They are partial profiles, not
complete biographies. Germany’s occupied zones and modern German successor
states are not silently equated to its pre-war map identity. British Raj
succession is a sourced administrative/partition relationship, not polygon
overlap. The upstream 1945 map already contains India and Pakistan; this does not
move the independently sourced partition date from 1947.

The local flag SVGs are unmodified Commons downloads. Registry entries record their reuse terms, original asset URLs, attribution and applicability sources. The Soviet 1955 asset is CC BY-SA 3.0; other added assets have public-domain bases. The British Raj asset is an office standard, not a national flag. There is no modern
flag fallback. The app’s supported range currently ends in 1960.

Run node --test tests/dossiers.test.mjs after curation or resolver changes.


## v0.7 Phase 1 development checklist

Batch 01 adds researched production records while preserving the existing knowledge architecture. Run **node scripts/coverage.mjs** from the repository root to regenerate the development-only manifest/report from every locked snapshot using the actual production pipeline. Run **node scripts/coverage.mjs --check** to verify reproducibility. See [the coverage report](../development/coverage/REPORT.md) and [planning decisions](../development/coverage/research-plan.json). These files are not production imports. Core/enriched completion requires explicit source-backed reviewed intervals, not nonempty fields or names.

Phase 1.5 adds explicit per-ID template eligibility in [classification-plan.json](../development/coverage/classification-plan.json). The generator preserves the raw map inventory and reports a separate provisional political-polity/dependent-administration denominator. Community labels are deferred from political research; naming and unclear identities require evidence-based review. The current proposed plan is manifest.phase2Batches; manifest.batches preserves the superseded Phase 1 raw audit. Neither classification nor eligibility establishes sovereignty, historical dates, continuity or core completeness. Phase 2 Batch 01 is researched with partial temporal coverage; all other batches remain unstarted. See [Batch 01 review](../development/coverage/BATCH-01.md).

The [transition-year review](../development/coverage/TRANSITION-REVIEW.md) documents year-based framework warnings, separate ambiguous identity records, and frameworkContinuity equivalents. Equivalent values require source-backed review; they do not suppress genuine historical changes.
