# Backward timeline source census

Read-only raw feature census for the 35 selectable pre-1800 snapshots, pinned to da7a4b735ecef70aebdc9c73e409d8a2500d50f3. 1492 is temporarily excluded; its filename and previous verification remain preserved in development/backward-timeline/source-files.json. No original source has been deleted.

occurrences.json and occurrences.csv contain every raw source feature, including features filtered by the existing map renderer (for example Antarctica). Counts are source occurrences, not sovereign states, accepted entities or researched dossiers. MultiPolygon parts are counted separately in polygon_count; feature_count is always one. Missing properties are null in JSON and blank in CSV. occurrence_id combines source commit, signed snapshot year and zero-based source feature index. It is deterministic for these pinned bytes.

summary.json contains per-snapshot counts, exact-name recurrence and classification totals. The single/multiple-name files partition names by distinct snapshot count. candidate-long-running-entities.json ranks recurring exact names by snapshot count; it does NOT establish historical continuity or merge entities. Exact names retain source case and spelling.

Provisional classifications use explicit raw NAME semantics only. Unrecognised names remain unknown. These are workload triage, never accepted historical evidence; they do not imply dossier eligibility, sovereignty, capitals, leadership or currency. No source metadata is changed. sources.json records URLs and hashes.

Regenerate with node scripts/backward-timeline-census.mjs. Source caches are outside the repository; production historical files are read-only.
