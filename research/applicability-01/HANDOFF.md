# Overnight audit complete — stop before research

Production baseline is the live controlled-compatibility checkpoint `98ee34b7524e1982996c3c2ccdc8834257b12fe7`: 3,916 accepted rich claims, 7,257 supported slots, 45.81% raw/applicable coverage and resolution. Its Pages workflow 37092685048 succeeded and all five checked live files matched committed hashes. Nine claims added 14 slots before this audit; do not duplicate or rerun their certified intake.

Run `node scripts/research-applicability.mjs` to reproduce the internal reports against the current completion matrix. It refuses a stale production fingerprint, validates evidence-backed resolution states, writes only internal reports and checks production immutability. Focused verification: `node --test tests/research-applicability.test.mjs tests/research-completion.test.mjs`.

Read METHODOLOGY.md before interpreting the percentages. The applicable denominator is provisionally 15,840 because no legitimate N/A resolutions are recorded. A conditional/optional field does not automatically mean N/A. Core is explicitly the existing four-category profile; the extended seven-category reference profile is separate. The verified fully missing core workload is 1,161 slots; 253 further core slots are partial/held. Global unresolved remains 8,583.

Recommended next action: review the corrected core/enrichment distinction and provisional applicability policy with the user. If a new research campaign is authorised, the deterministic workload proxy currently puts Batch 10 (Caribbean/Central America) first, then 17 and 18. Confirm source-system yield before selecting a campaign; do not treat the ranking as guaranteed production yield. Central Africa is explicitly prohibited tonight and remains paused with its candidate packets intact.

No new acquisition campaign is authorised by completion of this audit. Do not research missing facts, chase held cases, expand the timeline or alter the frontend automatically. Stop after the audit checkpoint is pushed and main is clean/synchronized.

Usage observation during finalisation: included primary 71% used, weekly 27% used, credit balance 39.8774625 unchanged from the earlier observation. No paid-credit continuation is intended. If a future continuation exhausts included allowance, preserve coherent work and stop under the overnight guardrail.
