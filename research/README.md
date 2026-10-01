# Operating the Historical Atlas Research Pipeline

This is development tooling, not a live UI feature. Run commands from the repository root with Node 24 or later. No npm installation or model-specific service is required. Stage 1 authorises infrastructure and a five-entity pilot only; a global Deep Dossier campaign requires subsequent authorisation.

## Lifecycle and responsibilities

1. The coordinator verifies clean, synchronized `main` and the production fingerprint in `research/baseline.json`. Read the production resolver, classification plan and existing catalogue before choosing jobs.
2. Scan entity/year/category gaps. Generate a bounded selection, not an unbounded campaign. Raw political candidates without an accepted identity receive review-only jobs; communities/people do not become political dossiers automatically.
3. The coordinator claims independent jobs for named specialist workers, within configured concurrency. Each worker owns one job and writes an isolated JSON package. Workers must not edit production, queue approvals, integration receipts or Git state.
4. Submit the immutable package to the queue; run deterministic validation against the current production fingerprint. Schema-invalid or historically impossible data fails; ambiguity routes to historical review. A valid package is never automatically accepted.
5. The coordinator reads the cited source bodies and reviews every claim's wording, chronology, entity, scope, precision and uncertainty. Write a rationale. Required/unresolved issues remain in review; amend and revalidate a package when evidence justifies a resolution. Do not approve completeness for its own sake.
6. Acceptance binds the job, canonical package hash, production fingerprint, coordinator and rationale. Accepted research can remain outside production. Acceptance is not integration.
7. Preview serial integration. Only explicit application may change existing production facts. Use an exclusive integration lock, write-ahead journal and append-only plan. Unsupported categories, conflicts and stale receipts fail closed. Test and regenerate existing coverage after any authorised production integration; commit and push it separately.
8. Record verified integration in the queue. Produce separate research-completeness and job-state reports. Preserve accepted, rejected and reviewed packages with provenance for recovery.

Queue actors are protocol identities, not authenticated accounts. Agents share filesystem permissions. Fingerprints, receipts, locks and tests guard the workflow; they do not constitute a security boundary against an intentionally hostile local process. Deployments should use separate OS permissions if stronger isolation is required.

## Tool entry points

```powershell
node scripts/research-sources.mjs
node scripts/research-scan.mjs --from 1939 --until 1939 --entities germany-nazi-period
node scripts/research-generate.mjs --limit 5 --from 1939 --until 1939 --entities germany-nazi-period --categories leadership,population-statistics
node scripts/research-report.mjs
node scripts/research-report.mjs --queue research/pilot/queue.json
node scripts/research-audit.mjs
node --test tests/*.test.mjs
```

The scanner's full output can be large. Its CLI writes `research/reports/scan.json`; regenerate on demand rather than committing a global job queue. The generator requires a positive explicit CLI limit (maximum 100). It creates suggestions, not active research. Generated jobs include existing evidence, mappings, cautions, schema path, priority and deterministic provenance. New timestamps belong to queue actions and worker provenance, not deterministic IDs.

The generator and report CLI load `research/jobs/queue.json` when present, otherwise the saved pilot queue; `--queue PATH` selects explicitly. Regeneration subtracts retained research scopes, including accepted research outside production. `scopeId` identifies the stable entity/raw-ID/period/category unit; job IDs bind its evidence-context revision. Queue claims also reject concurrent equivalent scopes with different IDs. Retry a retained failed job explicitly rather than silently redispatching the same scope. Reports include accepted research claims separately from production coverage, so the pilot's accepted figure does not imply a production figure is displayed.

Use the exported queue APIs (`createQueue`, `initializeQueue`, `transitionQueue`, `updateQueue`, `readQueue`) for coordinator operations. They are ordinary Node functions and work with any orchestration host. `updateQueue` locks the queue and atomically saves each transition. Claims prevent duplicate active assignments and enforce concurrency. The `submit` action requires the owning worker and package. `validate` requires the validator and fresh context. `accept` requires coordinator identity, fingerprint, explicit review resolution and rationale. Rejected/failed packages can be retried with a reason; preserved source packages are never overwritten by recovery.

The coordinator CLI adapter exposes the same protocol:

```powershell
node scripts/research-orchestrate.mjs init research/jobs/queue.json research/reports/generated-jobs.json
node scripts/research-orchestrate.mjs claim research/jobs/queue.json JOB_ID WORKER_ID
node scripts/research-orchestrate.mjs submit research/jobs/queue.json JOB_ID research/results/PACKAGE.json
node scripts/research-orchestrate.mjs validate research/jobs/queue.json JOB_ID
node scripts/research-orchestrate.mjs accept research/jobs/queue.json JOB_ID research/review/REVIEW.json
```

An acceptance argument contains `rationale`, `reviewResolved:true` and `reviewedIssues` binding every exact validator review issue; unresolved or required claims still cannot be accepted. Rejection/retry arguments contain a reason. Recovery additionally requires `interrupted:true`. Inspect a lock with `node scripts/research-queue.mjs inspect-lock QUEUE_PATH`; stale-lock removal requires the explicit coordinator recovery API, evidence that the owner is dead and a reason. Never delete a live lock. Integration uses the analogous shared integration lock. The `integrated` transition requires the API's verification callback and actual current production fingerprint; the CLI cannot assert integration merely from a worker's report.

```javascript
import {readContext} from './scripts/research-common.mjs';
import {validatePackage} from './scripts/research-validator.mjs';
import {updateQueue} from './scripts/research-queue.mjs';
const context = readContext();
updateQueue('research/jobs/queue.json', 'validate',
  {jobId, actor:{id:'coordinator',role:'coordinator'}},
  {context, validatePackage});
```

Integration defaults to preview:

```powershell
node scripts/research-integrate.mjs package.json job.json receipt.json
node scripts/research-integrate.mjs package.json job.json receipt.json --apply
node scripts/research-integrate.mjs --recover
node scripts/research-integrate.mjs --recover --apply
```

Do not apply production integrations merely to test the infrastructure: tests run the actual filesystem integrator against disposable synthetic registries. Integration is deliberately conservative. It cannot create historical entities or mappings, resolve identities, edit classification, overwrite facts, or integrate Important Figures into the current atlas consumer. Area observations also remain unintegrated because the current area consumer expects validity intervals: an observation must never be converted to an invented interval. Distinct simultaneous institutions may require a separately reviewed production amendment rather than an automatic append.

## Historical and evidence standards

The selected/requested calendar year is authoritative. Boundary snapshot years remain map inputs and never provide sovereignty, succession or factual chronology. Exact-day validity endpoints are exclusive. Imprecise year/month endpoints retain uncertainty, including transition overlap. A nearby statistic retains its observation date, metric and geographic scope; no interpolation or relabelling is allowed. Year precision must not become invented day/month precision.

Every claim links source IDs to evidence notes. Existing source IDs and exact URLs are reused. `research/sources/catalogue.json` preserves all Phase 2 bibliography, but does not automatically promote an institution to a trustworthy source for every claim. Read full documents/pages, not search snippets. Prefer contemporary primary documents, archives, official statistical institutions, parliamentary/government records, academic work and universities; reputable secondary sources can be appropriate. Census geography may differ from the selected administration or map polygon. Record that difference and require review.

Absence of evidence is an explicit package outcome, not proof of historical absence. Source conflicts, partial support, disputed sovereignty, chronology, ambiguous identities, competing frameworks and scope mismatch must remain visible. Deterministic checks cannot verify that a source body actually says what a worker claims: independent historical review is mandatory even when every automated check passes.

## Specialist protocol

Configuration defines six model-independent specialist classes: political/institutional; leadership; population/statistics; economy/currency; events/context; Important Figures/culture. Assign a bounded period and one category per job. Political research includes names, constitutional institutions, dated status, capitals and relationships. Leaders require dated offices. Statistics require observation dates, methodology and territorial scope. Economy research must not fabricate modern-equivalent GDP or combine incompatible series. Events must matter to this entity and period.

Important Figures require a stable person ID, actual categories, lifespan, relevance interval, relationship to the entity/territory, selected-period activity/contribution and sources. Exile, migration, colonial subjects, changing citizenship, occupation and imperial contexts must be explicit. Modern nationality must never be back-projected. A national famous-people list does not establish relevance to a selected year. Portraits remain optional future metadata; this stage downloads none.

## Package contract and review

The formal JSON Schema is `schemas/research-package.schema.json`. `fixtures/valid-package.json` is synthetic test evidence and must never be treated as history. A package binds `id`, `jobId`, `worker`, `productionFingerprint`, `entityId`, `mapIds`, `period`, `category`, `claims`, `sources`, `absenceOfEvidence`, and `reviewNotes`.

Each claim has its own ID, value, category, entity scope, temporal form, geographic scope, source IDs, evidence and review state. `temporal.kind=interval` uses `from/until`; `temporal.kind=observation` uses `observationDate`. These are mutually exclusive. Evidence precision is explicit. Package periods must exactly match the job; claims stay within the period and accepted entity bounds. Political claims explicitly select a government, political status or description metric. Review-only null-entity packages do not create entities.

The validator checks the checked-in schema subset directly without evaluating worker code or fetching worker-supplied URLs. Unknown fields fail rather than silently disappearing. Calendar validation, reference resolution, duplicate detection, scope and temporal checks run before review. Rejections and review notes are returned as structured output. Safe source-ID aliasing preserves existing production provenance; historical ambiguity is never silently normalised.

Optional evidence dates constrain claimed intervals, observation dates and title establishment. Explicit risk flags distinguish prohibited inferences from review-worthy conflicts. Sources supporting different aspects of a compound claim require coordinator review of their combined support; no automated test can establish source truth from a worker's assertion. Source-kind aliases normalize `primary` to `primary-document`; unrecognized institutional labels remain unclassified with the original label retained. A source category is not a quality verdict.

## Recovery and completeness

Read persisted state first after interruption. Preserve completed worker packages. Recover only a demonstrably interrupted research claim; do not steal an active job or remove a live lock. Retrying requires a coordinator reason. An integration journal records before/after content and hashes before writing. Inspect it, recover an incomplete write set by rollback, and revalidate against the restored fingerprint. External edits cause recovery to refuse an overwrite. A completed integration must be validated, committed and pushed before subsequent integration.

Accepted receipts bind the whole production fingerprint. An unrelated production integration can therefore make remaining receipts stale. Preserve the original research and acceptance history, create an explicit fresh job/package revision, and revalidate/review against the changed baseline; never silently rewrite a worker's historical meaning or reuse a stale receipt. Automatic campaign rebasing and permission-isolated workers are not implemented in Stage 1. Applied facts retain job/worker/claim/package provenance. Distinct same-day events may coexist; duplicate event identity or conflicting offices are refused.

Pilot replay tests read the preserved Phase 2 Git checkpoint, retaining Stage 1 evidence without freezing production against all future authorised additions. Keep that Git object available (a complete clone or explicit baseline fetch). The live `research-audit` command instead validates against current production and will intentionally flag old receipts after a later production change. Immutability tests compare production before/after research operations; the completion artifact separately certifies Stage 1's unchanged audited baseline.

Reports distinguish resolver availability, entity/year research scope, full/partial field evidence, exact-year statistical observations, transition gaps, classifications/reviews and queue states. Lack of an annual census is a research opportunity, not a database error or an obligation to manufacture a number. Editorial existence envelopes do not establish a state's entire lifetime. There is no combined percentage claiming that historical knowledge is complete.

Future sessions should read this document, the architecture, configuration, baseline, latest reports, queue and pilot report before acting. Stage 2 should begin with a reviewed bounded campaign plan and stronger source-body/claim review tooling, not an automatic attempt to complete all entities.
