# External dossier research workload

Production commit: 9a056993c05a5606e0ae86b529df80b66a6013eb. Confirmed eligible occurrences: 1588; cells: 23820; missing/partial: 15434.
Pending eligibility (179) and protected exclusions (585) are outside this export.

## Files
MASTER.csv is the complete matrix. MISSING-ONLY.csv contains only MISSING/PARTIAL. workload.json is the lossless baseline, source catalogue, original rich claims and formal held ledger. summary.json contains counts and input hashes. CSV is UTF-8, RFC 4180 quoted; structured cells contain JSON.

## Status semantics
SUPPORTED: existing vetted evidence supports this category for this calendar year. This is operational coverage, not proof of exhaustive historical completeness. PARTIAL: useful evidence exists but full-year/category requirements are not met. MISSING: no adequate current evidence; not a claim of historical unknowability. HELD: unresolved evidence/mapping/conflict. NOT_APPLICABLE: existing evidence-backed assessment only. UNCERTAIN, KNOWN_UNAVAILABLE and TERRITORIALLY_INCOMPATIBLE remain distinct if present; none are inferred from missing data.

Religion uses accepted political-institutional claims explicitly tagged by metric religion/religious-institutional-framework or dedicated -religion claim IDs, plus native religion claims. Incidental prose mentioning religion is not automatically credited. Density evidence is not relabelled. Calendar-year transitions and actual observation dates retain scanner safeguards.

## Columns
- **cell_id**: Immutable map-identity/snapshot/category key.
- **occurrence_id**: Selectable map identity plus year; never merged across snapshots.
- **atlas_entity_id**: Resolved historical entity ID; blank when unresolved.
- **atlas_display_name**: Current dated canonical/display name.
- **map_identity_id**: Stable raw selectable map identity.
- **raw_basemap_names**: Upstream names, not independent historical authority.
- **snapshot_year**: Requested atlas calendar year.
- **dossier_category**: One of the 15 categories; Religion replaces Density.
- **current_status**: Current deterministic assessment; see states below.
- **original_status**: Unmodified scanner state.
- **current_values**: All currently applicable values, including partial-year evidence.
- **current_claim_ids**: Evidence references; rich originals are indexed in workload.json.
- **current_evidence**: Complete scanner records: value, actual temporal information, scope, citations, qualifications.
- **observation_dates**: Actual point-observation dates, never rewritten to snapshot year.
- **applicability_intervals**: Existing fact validity intervals, preserving date precision.
- **territorial_scopes**: Original historical/statistical scope qualifications.
- **source_ids**: Keys into workload.json sourceIndex, with titles/publishers/URLs.
- **mapping_status**: Current occurrence-level dossier/mapping assessment.
- **identity_review_required**: True when canonical identity is unresolved.
- **eligibility_classification**: Certified/provisional political, dependent or composite classification.
- **boundary_snapshot**: Geometry file; not a historical observation date.
- **existing_mappings**: Existing dated mappings, identifiers, qualifications and source links; some belong to other years.
- **existing_sources**: Full citation metadata for supporting sources, included directly in CSV.
- **held_reasons**: Current slot-level scanner issues; no deferred case is researched or resolved.
- **resolution_id**: Existing certified assessment identifier, if present.
- **held_evidence_ids**: Existing formal held evidence references.
- **research_priority**: A essential/high visibility; B regional/large; C remaining confirmed eligible. Existing flagship policy only.
- **priority_reason**: Existing documented tier rationale.
- **priority_score**: Existing within-tier scheduling heuristic, not historical importance measurement.
- **notes**: Guardrails and category/identity qualifications.
- **production_fingerprint**: Immutable baseline for stale-return detection.
- **proposals_json**: Blank researcher return column: JSON array of proposed claims; never overwrite baseline columns.
- **known_entity_metadata**: Existing identifiers/aliases and lifetime metadata; full entity records are in JSON entityIndex.
- **raw_identity_metadata**: Existing raw identity classification/research decision; full records are in JSON rawIdentityIndex.

## Returning completed research safely
Keep all baseline columns and cell IDs unchanged. Add proposals only in proposals_json; multiple facts can be one JSON array. Return the completed UTF-8 CSV together with any evidence attachments and this baseline JSON/summary. Do not simply change MISSING to SUPPORTED. A proposal should include value, category, atlasEntityId, temporal {kind: interval|observation|event, from/until or date, certainty}, geographic/historical scope, source records {id,title,institution,url,version,originalIdentifier}, sourceIds, evidenceNote, researcher, mappingRationale, uncertainty/review notes and applicable snapshot IDs. Retain actual observation date and source precision. A non-applicability/unavailable/uncertain proposal requires documentary evidence and rationale. Composite regions must not receive fabricated single rulers/capitals.

Return files are untrusted proposals. Codex must verify immutable keys/fingerprint, current production drift, source provenance, chronology, scope, mapping and conflicts; convert proposals to the existing research-package schema; run existing deterministic validators and required independent review; then integrate accepted packages serially. This export does not provide an automatic CSV importer or authorize research/integration. Existing accepted facts cannot be silently overwritten.

## Reproduction and safety
Run node scripts/export-dossier-workload.mjs from the repository. It invokes pure scanner functions only, creates files under exports/dossier-workload, and checks all production data/runtime byte hashes before/after. No acquisition, acceptance, research, frontend mutation or production integration occurs.
