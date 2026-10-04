# Backward dossier research cohort 01

This is an offline projection of eight explicitly selected raw map names, 92 unique map-identity × snapshot occurrences and 15 existing canonical categories. Multiple source features share one occurrence. Raw names, SUBJECTO, PARTOF and recurrence are not accepted historical evidence. No new identity mappings or facts were created.

MASTER.json is the lossless matrix; MASTER.csv is the same matrix; MISSING-ONLY.csv selects MISSING/PARTIAL; entity-snapshot-index.json preserves the grouped source features; summary.json records counts, provenance and production hashes; validation.json records read-only checks.

## Columns
- occurrence_id
- snapshot_year
- display_year
- raw_map_name
- map_display_name
- map_stable_id
- source_geojson
- source_commit
- source_sha256
- raw_SUBJECTO
- raw_PARTOF
- source_feature_indices
- census_occurrence_ids
- polygon_count
- feature_count
- atlas_entity_id
- mapping_status
- cell_id
- dossier_category
- current_status
- current_evidence
- source_ids
- research_priority
- identity_review_required
- eligibility_classification
- notes
- production_fingerprint
- proposals_json

cell_id is the immutable occurrence/category key; occurrence_id preserves map stable ID and snapshot; atlas_entity_id is blank unless an accepted dated mapping exists. Map IDs use the actual runtime identity implementation, including its Unicode slug behaviour. source_feature_indices and census_occurrence_ids preserve all constituent features; polygon_count and feature_count describe grouping. raw_SUBJECTO/raw_PARTOF are distinct raw source values, not inferred relationships. current_evidence contains only runtime-resolved accepted records for this year; source_ids reference existing provenance. production_fingerprint guards against stale integration. All priorities are A because this cohort was explicitly selected; this is not a new historical ranking.

## Status and return contract
SUPPORTED means dated accepted evidence covers the category operationally, not exhaustive research. PARTIAL means applicable evidence does not establish full-year coverage. MISSING means no applicable accepted evidence; it does not establish uncertainty or non-applicability. HELD means unresolved mapping/evidence. NOT_APPLICABLE requires evidence and explicit review and is never inferred from missing data.

Return the CSV with all columns unchanged except proposals_json (a JSON array). Preserve cell IDs, map IDs, source feature metadata, dates and fingerprints. Proposals must identify category, value or evidence-backed resolution, actual observation date or sourced validity interval, precision/certainty, territorial scope, source title/provider/URL/identifier, evidence note, mapping rationale and researcher provenance. Preserve concurrent capitals/currencies and office roles. A result may explicitly propose not-applicable or structurally-inappropriate, with documentary rationale: no permanent capital, no separate head of government, or incompatible statistical scope must not be replaced by invented values. Source metadata alone is not proof.

A blank atlas_entity_id is intentional: external research must establish the snapshot identity before integration. Do not copy modern mappings backwards. Returned proposals remain untrusted and require existing schema, chronology, mapping, scope, conflict, fingerprint and independent-source-review validation, followed by serial integration. Changing current_status does not accept a claim. This export does not authorize automatic production writes.

## Reproduction
Run node scripts/export-backward-dossier-workload.mjs with the existing pinned GeoJSON cache in the system temporary directory. No network request is made. Cached bytes must match census source SHA-256 hashes. The old 1800–1960 workload and all production data remain unchanged.
