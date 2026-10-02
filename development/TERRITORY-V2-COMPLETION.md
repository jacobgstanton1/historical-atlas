# Deployment recovery and Territory Page v2 completion

## Verified production checkpoints

- Deployment repair: `339040097d36406b059c38f8a87ada89c3fd6488`.
- Actual successful repair Pages run: https://github.com/jacobgstanton1/historical-atlas/actions/runs/36946946155
- Territory Page v2 implementation: `e6d21c70ab5b0637a342a9db4e9f1173884d8ae6`.
- Actual successful Territory Page v2 Pages run: https://github.com/jacobgstanton1/historical-atlas/actions/runs/36948724143
- UTF-8 workflow for the implementation also succeeded: https://github.com/jacobgstanton1/historical-atlas/actions/runs/36948724675
- Live site: https://jacobgstanton1.github.io/historical-atlas/

The repair preserved the Windows-1252 README's useful text while normalizing its en dash to UTF-8. The sole remaining non-UTF-8 tracked research text is an original ISO-8859-1 source HTML, preserved unchanged. Internal research, evidence, development reports, tests, tooling and caches are excluded from Jekyll and deployment. The repaired research README returned HTTP404 publicly; required production data/assets remain available. Authored UTF-8 validation runs on push and pull request.

## Focused results

- 31 automated tests passed: 16 Territory Page v2 checks, 12 existing transition/preservation checks, three Pages/encoding checks.
- All four changed/new presentation JavaScript modules passed syntax checks; staged diff checks passed.
- 17 local real-app browser checks passed, including rich-data and historical-metadata failure paths.
- 15 actual live-site checks passed, using real year/search controls without app hooks: rich and sparse dossiers, multiple Germany/Japan snapshots, political and leadership transitions, census dates/geography, licensed flags, figures, chronological events, curated relationships, citations, nearest boundary snapshot, mobile scrolling, unchanged visible version and no runtime errors.
- Live rich JSON returned HTTP200 and matched the preserved production file exactly after newline normalization: 67 packages, 514 accepted claims.
- Screenshots were inspected for the actual desktop/mobile layout; detailed results are in `territory-v2-local-checks.json` and `territory-v2-live-checks.json`.

The renderer consumes existing production records directly and automatically presents future accepted records by category and applicable date. It does not introduce a second historical dataset. Production historical registries, accepted claims and flag assets were not modified during the deployment repair or frontend milestone. Research and snapshot-centric checkpoints were preserved. The visible site version remains v0.6.1; no map redesign or timeline expansion was performed.

## Research handoff

All safely accepted worker outputs have already been integrated and pushed. Preserve the original packages, independent reviews, held claims, downloaded evidence and integration ledger. Current scale totals remain 514 rich claims, 51 enriched entities, 31 comprehensive dossier passes, 857 distinct sources, 199 figure claims/198 people and 13 flag claims/nine licensed assets. Resolver availability remains separately 362/401 (90.27%). Missing statistical/relationship fields and explicit historical review cases remain genuine gaps.

The available credit balance was approximately 30 after the live checks, with ordinary usage unavailable. In accordance with the finite-budget stop rule, do not start a fresh research cohort in this final checkpoint. No research was restarted or discarded.

Exact next action when sufficient execution budget is available: refresh the read-only configured-snapshot gap/report context with `node scripts/research-scan.mjs` and `node scripts/research-report.mjs`, recover the existing job/package ledger, then select the next bounded source-first comprehensive dossier assignments from genuine uncovered snapshot/category opportunities. Frontend changes intentionally alter the production context fingerprint; use the existing explicit reviewed-rebase mechanism for preserved packages rather than weakening validation or repeating accepted research. Parallel research may resume, with independent evidence review and serial integration. New data-only integrations normally need zero browser checks because the permanent renderer is now deployed and verified.

Continue the authorised historical production programme only within that budget/recovery policy. No new campaign, timeline expansion or unsourced completeness filling is required.
