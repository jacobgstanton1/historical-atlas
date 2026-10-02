# Regional dossier completion handoff

First Western/Northern Europe checkpoint adds 42 claims / 65 supported slots across 13 entities. Production: 3,769 claims, 7,124/15,840 supported slots, 44.974747% Evidence Coverage and Research Resolution, 8,716 unresolved slots. See `research/regional-01/REPORT.md` and `checkpoint-delta.json`.

Preserve all accepted production data. The latest committed checkpoint containing this handoff is authoritative; verify main/origin before continuing. Zero frontend/browser work. No renewed global dataset discovery or deferred bulk exceptions.

Original 21 batches recovered in `research/regional-01/workload.json`. Baseline is preserved in `baseline-completion.json`; regenerate current needs with `node scripts/research-regional-workload.mjs` when starting the next tranche. Ranking uses unresolved volume, shared historical sources and entity-review burden, with overlap explicitly tracked. Generated source reuse is a candidate guide, not evidence for new claims.

Next action: begin Batch 15 West Africa as coherent historical administrative/source families, using its latest unresolved/partial/held needs. Do not repeat the completed Nordic, Low Countries, Western figures or treaty intakes. Batch 01 remains partially researched, not complete; move on because its cheap reviewed packet yielded less than a hundred full slots.

Preserved holds: conflicting Spain/Portugal capitals; Zeeman chronology pending original-source verification; qualitative Economy schema-incompatible evidence; transition/exile and territorial exceptions. Do not force them. Keep earlier bulk queues deferred.

Final reviewed cohort/certificate pairs: `western`, `western/figures-only-*`, `lowcountries`, `nordic`, `treaties`. All accepted packages integrated. Construction builders must not overwrite final certified inputs. Serial intake and recovery journal remain in the existing pipeline. Focused tests: 23; final integrity checks: 53,898; browser checks: zero.

## Superseding checkpoint — Batch 15 West Africa

Batch 15's safe source-family tranche is integrated: 54 accepted claims, 56 newly supported slots, 3823 production claims, 7180/15840 supported/resolved slots (45.328283%), 8660 unresolved globally. See research/regional-15/REPORT.md and checkpoint-delta.json. All three certified cohorts are integrated; 29 focused tests and 54714 final integrity checks passed; zero browser checks. The commit containing this update is authoritative.

Preserve regional-01 baseline/workload and certified files. Generate future current workloads into a NEW directory with: node scripts/research-regional-workload.mjs research/completion-01/reports/completion.json research/regional-NN. The optional output directory prevents overwriting earlier checkpoint evidence.

Do not revisit Western holds or Batch 15 difficult residue now. The next unworked high-volume reconstructed cohort is Batch 09 South America (44 entities, 83 dossiers, 641 unresolved slots); recover its current source-family needs before research. Batch 15 remains incomplete, with 597 unresolved slots and two critically sparse dossiers; this checkpoint does not assert exhaustive regional completion. Preserve local ignored source caches and all held packages. No renewed bulk discovery or frontend changes.
