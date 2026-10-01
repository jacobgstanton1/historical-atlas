# Comprehensive dossier architecture + pilot

Eight existing historical entities/periods; two parallel workers and independent cross-review. Production remains unchanged.

| Entity | Period | Produced | Accepted new | Accepted reused | Held | Rejected | Gaps |
|---|---|---:|---:|---:|---:|---:|---:|
| germany-weimar-framework | 1920–1932 | 16 | 10 | 6 | 0 | 0 | 7 |
| russian-imperial-fundamental-laws-framework | 1908–1914 | 14 | 10 | 2 | 2 | 0 | 9 |
| korea-republic-1948 | 1949–1959 | 16 | 11 | 4 | 1 | 0 | 8 |
| brazil-early-federal-republic-framework | 1893–1910 | 13 | 7 | 5 | 1 | 0 | 7 |
| liberia-presidential-constitutional-core | 1931–1951 | 12 | 6 | 6 | 0 | 0 | 14 |
| ceylon-state-council-framework | 1933–1946 | 10 | 5 | 3 | 2 | 0 | 14 |
| bhutan-punakha-treaty-framework | 1912–1946 | 7 | 2 | 5 | 0 | 0 | 14 |
| netherlands-kingdom | 1840–1855 | 10 | 3 | 5 | 2 | 0 | 14 |

98 claims produced; 90 independently accepted (54 new, 36 reused); 8 held; 0 rejected. 28 registered claim-cited sources reused, plus 5 already-researched unregistered source IDs reused; 28 newly researched claim-cited source IDs. 35 proposed source records include sources consulted for gaps; none registered in production. All 14 categories received a scoped investigation disposition for every entity.

| Category | Produced | Accepted |
|---|---:|---:|
| identity | 8 | 8 |
| political-institutional | 17 | 17 |
| leadership | 16 | 15 |
| capital | 7 | 6 |
| currency | 9 | 8 |
| historical-flag | 1 | 1 |
| population-statistics | 3 | 1 |
| area-statistics | 0 | 0 |
| density | 0 | 0 |
| economy | 4 | 3 |
| events-context | 21 | 20 |
| relationships | 0 | 0 |
| overview | 3 | 3 |
| important-figures | 9 | 8 |

New accepted claims per assignment: 6.75. Total accepted claims per assignment: 11.25. Old integrated-fact baselines: Campaign 1 2.67, Campaign 2 3.08 (three flags included in 37). Accepted-but-unintegrated pilot claims do not establish equivalent production throughput or an orders-of-magnitude improvement. Workload/cost was not metered.

Bulk prototype: 38 preserved candidates from 24 packages ingested with 0 model calls / 0 external requests;0% accepted, 0% rejected, 100% pending fresh candidate review. Pilot packages independently reused evidence; candidate records themselves remain untrusted.

Validation: 37 focused automated tests passed; 1347 reported package checks;0 browser checks. Additional queue/acceptance/integrator-preview guards passed. Existing expensive suites were not rerun. Selected-year/observation-date/BCE tests, conflicts, Important Figures lifespan/association, source reuse, duplicate prevention, queue interruption and serial integration are covered.

Production: 617 entities, 769 registered sources; 0 pilot facts or sources integrated. Accepted receipts and queue are preserved for review. Real integration preview passed for each accepted package; synthetic integration/recovery tests exercised writes without touching atlas data. Current frontend does not yet consume the rich sidecar store.

Production fingerprint: `4a2f3bf005d7adf08bdddcd8432c85cb313f715bb88a20c45f0880deb4a15367`. Research-comprehensive fingerprint: `149c86638581c481d54707c35232c24b07cc01882311aa2c6bcfcf9c4247725b`. Visible version v0.6.1; map 1800–1960 unchanged. Preserved Campaign 2 packages unchanged.

## Limits and next decision

Unresolved category gaps and exact per-claim held reasons remain in packages/reviews and completion-report.json. Geographic mismatches, uncertain activity and conflicting legacy text are held. Exact-text capital/currency reconciliation is conservative and may hold compatible formulations pending a reviewed semantic adapter. Flags require separately licensed/date-supported assets; no easy flag quota was forced. Statistical and economic sources need scope and methodology review. Ancient chronology is supported for research only; approximate chronology remains held pending a reviewed reader. Provider-specific bulk adapters/streaming and source-content verification are still required. Rich data needs a future reader and legacy reconciliation before visible publication.

Inspect these accepted packages and metrics before authorizing a larger bounded comprehensive campaign. Improve bulk adapters and reviewed uncertainty/scope handling first. No global campaign, Campaign 2 resumption or frontend redesign began.
