# Phase 2 research handoff pipeline

Native research agents write separate packages under the system temporary directory `historical-atlas-phase2-144aeb5/political-batch-XX`. Workers receive one authoritative `manifest.phase2Batches` definition at a time. Their contract forbids repository, production metadata and Git writes. This is role isolation with separate output directories, not an operating-system security boundary: all native agents share tool capabilities. Only the coordinator runs integration or Git mutations.

The environment has four agent slots including the coordinator; the initial limit is three research workers. No fourteen-worker shared registry editing is permitted. Queue state and complete research packages persist outside the Git checkout, keeping clean production checkpoints independent of unfinished research.

## Coordinator commands

Run from this repository with Node:

```
node scripts/phase2-pipeline.mjs init
node scripts/phase2-pipeline.mjs claim political-batch-08 worker-A
node scripts/phase2-pipeline.mjs validate political-batch-08
node scripts/phase2-pipeline.mjs ready political-batch-08
node scripts/phase2-pipeline.mjs apply political-batch-08
```

After applying, regenerate coverage, run metadata/automated/browser checks, document every identity in `BATCH-XX.md`, mark the batch audit validation passed, commit that batch, push, verify synchronization, then run:

```
node scripts/phase2-pipeline.mjs checkpoint political-batch-08
node scripts/phase2-pipeline.mjs status
```

`apply` requires clean, synchronized main, a ready package and all earlier queue jobs integrated. Complete write sets are planned and validated in memory first. The package and pre-integration backup remain in the worker directory; authoritative audit JSON retains the complete normalized handoff. The CLI never commits or pushes. Git checkpoints remain the coordinator's responsibility.

## Handoff and reconciliation

The validator requires exact assigned/researched IDs, every per-ID decision, all prerequisites, proposed entities/extensions/mappings/sources, browser cases for every new entity, period/leadership/event/relationship collections, partial/unresolved/review lists, exclusions, cautions, required files and worker validation. Historical claims require source-body reading recorded in source usage and worker notes; deterministic validation verifies structure and references, not historical truth. Coordinator historical review remains mandatory.

Sources are deduplicated by exact URL with all nested source references remapped. Source-ID collisions and duplicate entity IDs fail. Fact extensions are append-only and require a hash of the current entity. Explicit sourced existence expansions may widen editorial coverage bounds while retaining earlier existence sources; they cannot shrink coverage or rewrite earlier facts. Appended facts and existence extensions receive the same date/reference checks as new entities. Overlapping different identities are returned as review warnings and require explicit historical cautions; the coordinator must inspect them before accepting. Classification changes require separate evidenced coordinator review. No worker can make automatic classification or sovereignty deductions through this tool.

Queue claims reject duplicate assignments, occupied workers and capacity overflow. A failed validation remains research work and is not applied. Correct the isolated package and retry; preserve useful output. A stopped integration is recoverable from its backup and Git diff, but it must never be checkpointed until tests, commit and push pass. A pending worker does not block independent research; integration remains numerical. On restart inspect queue, packages, Git and batch audit validation together rather than trusting queue status alone. Never discard unintegrated research merely to clean a worker directory.

## Initial architecture verification

Two native workers independently consumed Batches 08 and 09, wrote separate isolation probes, returned exact membership and hashes, and made no production changes. Synthetic tests demonstrate serial combination, source deduplication, immutable input preservation, rejected collisions/stale extensions/incomplete handoffs and queue limits. Existing deterministic historical tests run afterward. Synthetic records are never applied or committed to the production registry.

The production resolver and UI are unchanged. Full regression checkpoints remain 09, 13, 17 and 21. Visible version stays v0.6.1. This layer provides reusable handoffs and reconciliation, not a generalized Deep Dossier platform or autonomous historical acceptance.
