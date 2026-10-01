# Campaign 2 coordinator protocol

Run approximately60 bounded entity/period assignments in five checkpoints of roughly12. Research bundles leadership, capital, currency, genuine political/institutional gaps and historical-flag. Unsupported fields stay explicit. Source-body review is independent of the worker. Historical flags retain type, temporal interval, licensing, attribution, sources and asset hash; no modern fallback or guessed continuity.

## Isolated campaign configuration

All coordinator tools default to Campaign1 for backwards compatibility. Campaign2 calls must pass `--directory research/campaign-02`; the directory's config.json defines campaign, idPrefix, maxAssignments, expectedAssignments, fields, baselineCommit, checkpointSize, checkpointCount and smokeMaxChecks. Baseline commit is the accepted post-Campaign1 checkpoint, not a moving HEAD. Use60 maximum/expected assignments,12 per checkpoint,5 checkpoints and20 maximum smoke checks. Optional `--config path` supports an explicitly supplied configuration. Initialization refuses existing queue state.

Commands:

- `node scripts/research-campaign.mjs init --directory research/campaign-02`
- `node scripts/research-campaign-run.mjs submit entity-id --directory research/campaign-02`
- `node scripts/research-campaign-run.mjs apply entity-id --directory research/campaign-02`
- `node scripts/research-campaign-audit.mjs --checkpoint --directory research/campaign-02`
- `node scripts/campaign-browser-smoke.mjs 1 --directory research/campaign-02`
- `node scripts/research-campaign-report.mjs --directory research/campaign-02`

Workers write only packages and evidence. The coordinator serially integrates exact independently reviewed packages, revalidating after each production fingerprint change. Original evidence and reviews remain archived. Never rewrite worker claims when recontextualizing. Unsupported assignments may finish in historical-review/rejected rather than fabricating facts. Every added source must be used by an integrated fact.

## Efficient validation and recovery

Deterministic audit remains exhaustive over sources, entity/mapping identity, unchanged historical fact prefixes, exact provenance, and every claim/map/year1800–1960. Browser smoke selects category-diverse representative claims, about18checks with the20checkbudget; complete boundary coverage belongs to the deterministic audit. A data-only final smoke uses at most40checks: `node scripts/campaign-browser-smoke.mjs --final --directory research/campaign-02`. No automatic754checkglobal browser run. Shared runtime changes require focused component tests and an explicitly justified broader scope.

After each coherent checkpoint save queue/integration receipts, audit and smoke evidence, reports, then commit/push and verify clean synchronized main. Resume from those records and Git, retaining accepted research. Do not begin another large cohort under constrained usage. Source reuse and supported field/year gains are reported separately from resolver availability. Counts are data metrics, not estimated usage. Stop after Campaign2; no Campaign3 authorization.
