# Source-bound officeholder tables, bulk tranche 01

`officeholder-manifest.json` contains 223 original-source day-precision tenure rows from five cached official sources, 113 with explicit suggestions referencing actual production entity IDs. Suggested mappings are not acceptance decisions. The remainder are retained outside curated entity scope. No claims were integrated by this worker.

Reproduce with `node research/bulk-01/worker-officeholders/extract.mjs`; verify source hashes, row integrity and actual mapping IDs with `node research/bulk-01/worker-officeholders/verify.mjs`. The verifier produces `source-bound-review.json`, including parser hash, original-body semantics, evidence hashes and dispositions. All downloaded bytes are retained. Cache bodies have not been transcoded.

Sources:

- Registered `japan-cabinets`: 59 cabinets beginning before 1961. Original source uses exact dated terms and sometimes nonstandard English name spellings. Many adjacent same-person terms are already covered by existing continuous tenure records. Deduplicate meaningful tenure coverage before counting gains. Original Japanese full-list body is also cached for reconciliation, though the manifest parser consumes the English body.
- Registered `c01-canada-ministry-tenures`: 18 ministries, exact dates. Current fourth edition used for production source ID. Second edition also preserved in cache as downloaded comparative evidence. The introductory statement explicitly defines ministry duration by prime minister tenure. Gaps and footnotes are preserved.
- Parliament of Victoria: 60 historical premier terms, 12 overlapping curated colonial entity coverage. Six-column table parser uses Assumed office and Left office. Blank party cells stay blank. No post-federation state mapping is inferred.
- Queensland Government: 36 historical premier terms, 12 overlapping curated colonial entity coverage. Full official name/date list parsed. Discovery found parliamentary Herbert tenure begins 1860-05-22 whereas government list starts 1859-12-10; early unmapped row remains held.
- NSW Government: 50 historical terms, 12 overlapping curated colony coverage. Endpoint semantics sometimes differ from successor accession by one day and sometimes coincide. These rows should remain held pending end-semantics adjudication. One unmapped Fuller term is genuinely same-day; this does not authorize manufacturing an interval.

`victoria-chairs-manifest.json` is a separate supplementary manifest: 35 Council President and Assembly Speaker terms, 10 overlapping mapped colony coverage, using the same official Victoria cached body. Dates preserve only month precision as YYYY-MM. Reproduce with `extract-victoria-chairs.mjs`. Chair roles are institutionally distinct from Premier or sovereign. The supplement does not replace or alter the 223-row intake manifest.

Australian national museum and NZ History national PM endpoints encountered challenge pages via command fetch; no challenge response was cached as evidence and no facts were extracted from blocked responses. South Australian premier source discovery remains unfinished. Zero browser UI checks used.
