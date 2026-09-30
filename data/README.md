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
are curated factual paraphrases, not runtime generation. Population data are a
single public-domain US federal census observation. Economic figures, density,
urban population, currencies, most capitals, comprehensive leadership lists
and flags for the other examples are intentionally unpopulated.

The initial records demonstrate US, UK, Germany under Nazi rule, Soviet Union,
imperial Japan, post-war Japan and British Raj. They are partial profiles, not
complete biographies. Germany’s occupied zones and modern German successor
states are not silently equated to its pre-war map identity. British Raj
succession is a sourced administrative/partition relationship, not polygon
overlap. The upstream 1945 map already contains India and Pakistan; this does not
move the independently sourced partition date from 1947.

The local US flag SVGs are unmodified Commons downloads. Registry entries record
their public-domain basis, original asset URLs and attribution. Smithsonian
flag-history information establishes date applicability. There is no modern
flag fallback. The app’s supported range currently ends in 1960.

Run node --test tests/dossiers.test.mjs after curation or resolver changes.
