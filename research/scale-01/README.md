# High-throughput production campaign 01

Authorized production scope: existing entities and1800–1960. Parallel acquisition/research; independent evidence review; serial integration. The frontend/timeline/version remain unchanged.

First checkpoint:60previously unpublished rich claims across8existing entities,54new-research and6reused-evidence claims. Existing production facts were excluded. The rich production source catalogue has804distinct source IDs (769legacy +35rich). The initial39focused tests passed; production audit passed2168deterministic checks. No browser checks.

## Default source reuse path

`scripts/research-scale.mjs` exposes `reuseCatalogue`: production facts, registered sources (including rich data), accepted evidence, cached candidates, then new research. `prepareReviewedIntegration` binds original independently reviewed evidence, preserves the original review/hash, canonicalizes source references only by exact URL, rechecks current context and excludes duplicates. It cannot expand independent acceptance. Historical values/dates/qualifications remain unchanged. Context transformations and skipped duplicate reasons are recorded.

`integrateReviewedFiles(package, job, review)` serially writes accepted claims through the existing locked atomic integrator, saves receipts and an integration ledger, and can recover a durable write interrupted before the ledger save. Consulted source metadata is retained so deliberate gap-investigation citations do not become orphaned. `scripts/research-scale-audit.mjs` validates installed schemas, citations, mappings, accepted subsets, dates and selected-year behavior. Source totals count distinct IDs across legacy registry and the rich production store.

The original comprehensive pilot and Campaign2artifacts remain untouched. Rich data is in `data/comprehensive-dossiers.json`, available for Territory Page v2; present UI behavior remains unchanged. Actual production publication and prior research origins are counted separately.

## Recovery

Inspect main/origin/main and the integration ledger before work. Do not replay a completed original package hash. On prepared integration journals use existing `recoverDossierIntegration`; reject external edits. For newly reviewed packages pass original package/job/review paths to the serial coordinator. Immutable source-body review can be reused across fingerprint changes only through the recorded technical rebase, never after historical content edits. Raw third-party research caches stay local; commit source metadata, hashes, normalized factual records, accepted/held reviews and licensed flag assets.

Next in progress: structured Nobel historical affiliations acquisition,17additional comprehensive dossier passes, and parallel dated/licensed flag acquisition. No global/BCE production expansion.
