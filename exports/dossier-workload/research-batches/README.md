# Lean external-research batches

These files partition the existing MISSING/PARTIAL export by category and existing priority A/B/C. Each CSV is below 2 MiB. index.json records row counts, byte sizes, statuses and SHA-256 hashes. No facts or coverage statuses were recomputed.

CSV uses UTF-8 and RFC 4180 quoting. Structured fields are JSON; empty arrays mean no existing values. known_aliases_identifiers preserves known historical names with validity intervals: names from another period do not establish identity at the selected snapshot. notes preserves existing qualifications and applicability intervals. No source catalogue or full evidence objects are embedded. Consult the original workload export when needed.

Keep every baseline column unchanged and add proposed claims to the blank proposals_json column. Multiple proposals use a JSON array. Preserve actual observation dates, validity, scope, sources, provenance, researcher and uncertainty. Return completed files with source/evidence attachments. Follow ../README.md for safe validation, independent review and serial integration; proposals never directly overwrite accepted production evidence. The production_fingerprint identifies the original export baseline, not a newly scanned dataset.
