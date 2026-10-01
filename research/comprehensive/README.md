# Comprehensive dossier scaling — architecture and bounded pilot

This workflow replaces the retired narrow-field campaign model. Do not resume Campaign2 or start a global programme. Production remains1800–1960 and v0.6.1. Read the strategic stop and current Git state first. Existing registries and all preserved packages remain authoritative evidence archives, not blanket acceptance of new claims.

## Unit of work

One existing historical entity plus one coherent bounded period. `generateDossierJob` generates a stable ID independent of worker/model. Every package records investigations of14 categories: identity, institutions, leadership, capitals, currency, historical symbols, population, area, density, economy, events, relationships, overview and Important Figures. A category can be supported, partial, unresolved or not applicable, with reasons, consulted source IDs and explicit gaps. Optional historical fields do not impose modern-state requirements on ancient polities.

`schemas/dossier.schema.json` is the strict v2 handoff contract. Claims carry independent source IDs, source locations, interpretation, temporal evidence, scope ID, methodological/other qualifications and origin. Origins distinguish new research, previous production, preserved packages and bulk candidates. Preserved evidence is never relabelled as newly researched throughput. Do not split a paragraph into several claims merely to improve metrics.

## Chronology and selected year

Research dates use proleptic Gregorian calendar labels and explicit astronomical year numbering:0000 means1BCE and-003999 means4000BCE. These are chronology conventions, not a claim that an ancient source used that calendar. Dates retain year/month/day precision; approximate/disputed intervals route to historical review. Exact-day interval ends are exclusive; year/month ends include the imprecise calendar unit. No unsupported precision is invented. Production integration remains restricted to1800–1960; ancient research support is a prototype, not new ancient production data.

Intervals describe validity; observations retain actual observation dates. Events carry actual event dates. `selectForYear` returns requested year separately from original temporal metadata. Nearby observations are disabled by default; explicit opt-in always returns actual dates and requires contextual display. It never interpolates or relabels a statistic. Boundary geometry/snapshot dates are not consulted as historical evidence.

Density requires population and area claims with identical observation dates and scope IDs, compatible units, positive area and exact checked arithmetic. Both dependencies must be independently accepted. Statistical claims require explicit metric/methodology, unit and qualifications. Important Figures require lifespan, period relevance, explicit relationship/activity/contribution; nationality and geometry-based association are prohibited. Portrait metadata is optional; no portraits are downloaded by tooling.

## Source reuse and bulk candidates

Build a source index once for a production fingerprint using `node scripts/research-comprehensive-queue.mjs source-index research/comprehensive/source-index.json`. It includes current registered sources and preserved package hashes/source links. Search with `source-search index.json "query"`; a stale index refuses reuse. No global coverage scan is needed to perform source lookup.

`ingest bundle.json candidates.json` accepts normalized structured rows, an explicit provider ID/URL/license/retrieval date, source identifier, retrieved value, chronology, scope and mapping. It handles batches without model calls. Candidates always remain untrusted. Unmapped identities remain null/review instead of borrowing a modern identity. Duplicate provider IDs fail. External providers need dedicated reviewed normalization adapters; this prototype ingests local JSON exports and never executes worker URLs or fetches arbitrary data. Wikidata values or other candidate metadata do not establish source truth. Original-source review is required before candidate claims can be accepted.

## Validation and review

`validateDossier` checks strict schema, job/period/fingerprint, source and map references, category investigation, date ordering, entity envelopes, evidence precision, observations, statistical methods, duplicate claims, conflicting slots, derived dependencies, figures and flag assets. Flags reuse the existing SVG safety/license/provenance validator. Known prohibited inferences fail; ambiguity and source conflicts remain review. Numeric/schema correctness does not prove historical truth.

Independent review must bind the exact package hash, actual body review, rationale, every validator issue and a disposition for every claim: accepted, held or rejected. Worker and reviewer IDs must differ. Unresolved, disputed, mismatched-scope, flagged and contradictory claims cannot be automatically accepted. Original claims and rejected/held dispositions are retained. Source IDs reuse existing registry records; duplicate URLs under new IDs fail rather than creating redundant source records.

## Queue and integration

`research-comprehensive-queue.mjs` exports an explicit durable state machine: queued → researching → submitted → validated/historical-review/validation-failed → accepted/rejected → integrated. Research concurrency defaults to2 (pilot maximum3); production integration concurrency is1. Assignment ownership and duplicate IDs are checked. Recovery requires explicit interruption evidence. Fresh-context revisions archive previous package/acceptance and require fresh validation/review without changing historical meaning.

Use `initializeDossierQueue`, `updateDossierQueue` and `integrateQueuedDossier` APIs from the coordinator. Workers write packages/evidence only. Queue mutation uses exclusive locks and atomic writes. The integrator shares the legacy production integration lock and binds complete fingerprints. It appends only accepted claims to `data/comprehensive-dossiers.json`, a rich reviewed store for the future territory reader. It does not silently squeeze new categories into incompatible legacy arrays or modify existing registries, mappings or frontend. The present app does not render this new store; integration into it must be reported separately from visible dossier improvements.

A prepared journal records exact before/after content before writing. Recover a prepared operation with `recoverDossierIntegration`; it completes an already written exact payload or records not-applied, refusing external changes. The queue can reconcile a completed journal if interrupted before its receipt was saved. A stale acceptance refuses writes. No accepted receipt grants authority to change mappings or overwrite old facts. Existing legacy and new comprehensive fingerprints include the rich store when present; new flags are additionally hashed by the comprehensive fingerprint.

## Pilot and efficiency policy

The proposed eight-entity pilot is recorded in `pilot-selection.json`. Begin research only after architecture tests pass. Reuse earlier evidence first. Investigate all applicable categories systematically, without forcing facts or treating unsupported categories as bugs. Preserve claims outside production until independently reviewed. Integrating pilot data is a distinct coordinator action; accepted packages may remain unintegrated where production installation is unnecessary.

Reports must separate produced, independently accepted, held, rejected and actually integrated claims. Record new meaningful claims per assignment alongside imported prior evidence, source reuse/new sources, candidate dispositions, category counts, deterministic checks and actual browser checks. Compare new independently verified claims consistently with Campaign1's80/30 and Campaign2 checkpoint1's37/12 (its three flags are included in37, not added again). A throughput target is not permission to fabricate or artificially split facts.

Only run focused deterministic tests for changed architecture. Browser tests primarily follow application/runtime changes. This stage does not rerun the222 prior full-suite checks or754 browser regression merely because research resumes. Do not estimate model usage when unmeasured. Commit/push coherent checkpoints; stop at the bounded pilot, or save a precise recovery note if resources cannot safely finish it. Never automatically launch global research.

## Current limitations

Ancient chronology is an explicit research convention, not a conversion engine for regnal/non-Gregorian dates. Approximate/disputed claims remain held; future reviewed uncertainty-display adapters are needed. Source conflicts currently hold the whole package conservatively. Bulk ingestion requires normalized inputs; provider-specific APIs, large-stream ingestion and entity reconciliation are not implemented. The rich store has no frontend reader yet. Source body truth still needs historical judgment; provenance alone does not verify it. This is an architecture prototype pending a measured, independently reviewed pilot, not evidence of orders-of-magnitude throughput improvement.
