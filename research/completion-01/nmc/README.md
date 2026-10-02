# NMC7 source-first annual population assessment

The coordinator acquired the official original NMC7 archive once. This worker read its original83-page codebook's population/general-scope sections, extracted only real supplementary CSV members inside the nested ZIPs, and made no network calls. __MACOSX members are excluded from all parser outputs; source archives remain untouched.

## Result and limits

17,121 supplementary population values exactly match abridged values numerically. 521 source state-year rows coincide with requested atlas snapshots1878/1880/1900/1914/1920/1930/1938/1945/1960. Existing bounded historical identity contracts give186 currently missing slots, but168 are held for weak/truncated bibliography or notes, inferred-series quality, anomalies, encoding, numerical conflicts or territorial-scope ambiguity. Eighteen observations across11 existing entities survive conservative source-quality screening. They remain UNACCEPTED and require independent historical/statistical territorial review. A source code never proves polygon equality.

The potential18 slots are US1878/1880/1900/1914/1920/1938/1945/1960; Turkey1938; Iceland1960; and Australia/Belgium/Ceylon/Chile/Colombia/Denmark/Mexico/Netherlands1960. The UnitedStates source is identified HistoricalStatistics Part1Page8; exact coverage of Alaska/outlying territories cannot be guessed from the title and needs review. Denmark excludes Faroes/Greenland; Netherlands includes registered residents abroad; US1960 is de-jure excluding absent military/civilians; Australia's original statistical note excludes an Indigenous population category. These restrictions must accompany any displayed value. Ceylon explicitly says UN estimate. Turkey's bibliography title is preserved with the source's spelling; no publisher is invented. Turkey1930/1945 competing numerical notes and Iceland1945's pages-only bibliography are deliberately held.

## Source standards

Printed31–35/PDF35–39 define yearly civilian/home population in thousands and a mixture of census/register/source observations, interpolation, regression and extrapolation. QualityA means an identified source, NOT automatically a census. B/C are interpolation, D/E regression, F/G extrapolation, Mmissing. Anomaly flags are separate. Supplemental source/note/quality/anomaly fields are retained literally; neither dataset estimation nor territorial exclusions may be hidden.

Printed33/PDF37 warns UN historical series can backcast modern boundaries; COW attempted historical adjustments but does not certify every row. Printed4/PDF8 similarly warns national territory definitions may differ from underlying sources. Thus even the18 source-quality candidates require territorial certification. Scope is source-coded state civilian/home population with explicit historical/statistical caveats, not map-polygon population. No scope match, modern border, dependency inclusion or census geography is inferred.

Numbers preserve original source thousands and a transparent multiplication by1000, without claiming extra precision. Observation date stays YEAR, not January1, selected-year estimate or fabricated census date. The entire source year must fit the existing identity interval: transition-year frameworks are not assigned an invented observation day. No interpolation is performed by this worker. Publisher-estimated rows remain recoverable but held pending separate justified review.

## Byte/parser provenance

population-extracted.json retains original full selected CSV rows, logical row IDs, physical CSV line endpoint, original record-byteSHA256, raw thousands, year, source text and metadata. Both nested ZIP/member hashes and codebook hash are recorded. All17,121 tpop values were independently compared against the other abridged member. UTF8 decoding failed; the parser uses reversible ISO8859-1 byte decoding with no transliteration or silent repair, and selected nonASCII provenance is held for review. New Python/Node parsers use LF; original archives/codebook bytes remain unchanged.

Reproduce extract-population.py, build-population-tranche.mjs, validate-population.mjs. validation.json records2320 technical checks, deterministic generation, source-input hash preservation, exact original claims/notes, whole-year interval discipline, and false historical/territorial acceptance. These do not establish historical/statistical truth.

## Coordinator continuation

Independently review the original population codebook and source-quality candidates, especially statistical geography and underlying source locators. Bind the actual original download URL from coordinator provenance rather than inventing an archive path. Resolve or hold each territorial match, preserve sources/observation year/rounded units/exclusions, and use controlled serial integration only after explicit acceptance. Do not automatically promote any of the168 held candidates or broaden modern-country mappings. No production/Git/UI edits occurred here.
