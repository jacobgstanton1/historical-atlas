# Dated flag automation

Source: the user-specified Commons `Data:FlagsData.tab`, a CC0 table derived from Wikidata P41. It has 717 rows, 244 potentially relevant dated rows and 266 rows with no start date. Undated current flags never become historical fallback data.

The computational name join generates **review candidates**, not accepted entity mappings. It found 182 candidate dossier slots. `research-dated-flags.mjs` requires matching original P41 start/end qualifiers, non-deprecated statements, Gregorian chronology and at least year precision. It intersects conservative complete-year applicability with existing entity validity, holding adoption/retirement years, missing entity envelopes and competing flag files. It preserves year precision instead of treating zero-filled Wikidata dates as exact January 1 dates.

The first preparation produced 83 interval candidates across 71 entities and 66 distinct SVG assets; these are not production gains. All file licenses were checked through batched Commons metadata. Only supported Public domain / CC0 / CC BY-SA 3.0 / CC BY-SA 4.0 assets can proceed. Original artist, credit, license and download provenance are retained. SVG validation rejects scripts, nonlocal references, embedded resources, broken fragments and oversized files.

Acquisition initially encountered HTTP 429. The downloader now paces requests and stops on the first rate limit, persisting its `Retry-After` and earliest permitted retry time. Six initially downloaded files remain cached; pending assets and source/mapping exceptions are recoverable. Do not evade source throttling or retry during cooldown. Technical acquisition does not constitute historical acceptance.

Only a reviewed source/entity-period certificate, strict dossier validation and the existing serial integrator may create production flag claims. Flag usage type must follow evidence; no unsupported claim that every symbol is a national flag. Preserve accepted existing flags and hold disagreements. Zero atlas browser checks for data-only intake.

Six focused date/qualifier tests passed. Final real gains, if integrated, must be recorded separately from these candidate counts. Until an integration report and exact checkpoint proof exist, no production flag gain is claimed here.
