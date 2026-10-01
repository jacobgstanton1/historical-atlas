# Phase 3 Stage 1 — controlled pilot and completion report

Stage 1 is complete. Stop before Stage 2. No production historical data or frontend files were changed; the site remains v0.6.1 with 362/401 resolver availability, 617 entities and 689 registered sources.

## Recovery

The interrupted run had pushed contracts/catalogue (`24f6e52`), validator/tests (`18c9174`) and orchestration/reporting/integration (`680377b`). Four packages and their evidence ledgers were intact. France 1848, France 1957 and Germany 1920 had been submitted; Japan 1946 had been saved but not submitted. The full browser run had completed successfully with 754 checks. Germany 1925 population and Iran 1935 ownership were recovered after explicit worker usage-limit errors, retaining existing research. Taiwan 1935 was queued. No completed package was researched again.

Recovery is recorded in `recovery.json` and queue action history. All seven jobs now have durable outcomes: six accepted, one historical-review. There are no queued, researching, submitted or validation-failed pilot jobs. No packages are rejected or integrated.

## Architecture and boundaries

The offline system has a deterministic entity/year/category scanner, bounded generator, reusable source catalogue, formal JSON package schema, six specialist classes, fail-closed validator, independent evidence review, locked recoverable queue, coordinator CLI/API, serial append-only integrator, integration journal/rollback, and JSON/Markdown completeness reports. Worker restrictions are a protocol, not an OS sandbox. Source truth is independently reviewed; structural validity never grants acceptance.

Jobs include source/context/mapping/identity cautions and prohibited assumptions. Stable scope IDs prevent duplicate research across context revisions. Retained packages are reconciled before dispatch. Observation dates differ from validity intervals. Conservative year/month boundaries remain gaps rather than invented complete years; France 1958 is an explicit regression. Boundary snapshots do not establish historical chronology or sovereignty.

## Pilot outcomes

Seven bounded jobs cover five entity families. Three research agents operated concurrently. Five specialist classes were exercised: political/institutional, leadership, population/statistics, events/context and Important Figures/culture. Economy/currency is configured and validated through the schema/tests but was not researched in this pilot.

| Entity / selected period | Category | Outcome |
| --- | --- | --- |
| France 1848 | Political/institutional | Accepted; four partial intervals preserve the regime transition and explicit gaps |
| France 1957 | Important Figures | Accepted; Camus activity is dated and colonial/residential association qualified |
| Germany / Weimar 1920 | Leadership | Accepted; requested-year clip within independently sourced continuous office tenure |
| Germany / Weimar 1925 | Population | Historical-review; month observation and rounding retained, territorial comparability unresolved |
| Japan / initial occupation 1946 | Events/context | Accepted; two dated events, with later enforcement excluded |
| Iran / Pahlavi framework 1935 | Events/context | Accepted; historical naming at year precision, without a founding/succession claim |
| Taiwan / Japanese administration 1935 | Leadership | Accepted; colonial office and date precision retained |

There are 11 substantive claims, 10 in accepted packages and one held for geographic review. Thirteen source proposals remain outside the production registry; four distinct existing source IDs were reused. Worker evidence ledgers and coordinator review records preserve source bodies consulted, precision, identity and scope decisions. France's disputed November publication details and seat totals were omitted; incomplete executive chronology remains explicit. The statistical scope issue was not resolved merely to improve completeness.

Five accepted packages passed actual production integration previews, all with `applied:false`. Important Figures correctly refused a production adapter, and the statistical package remained held for review. The actual filesystem integrator was exercised through disposable synthetic registries, including source reuse, serial locking, hard process exit, rollback, post-write verification and unsafe overwrite refusal. No historical production integration was necessary.

## Scanner and completeness

The scanner examined 617 entities over 11,872 entity/year pairs within editorial research envelopes, plus source-present raw resolver years. It identifies 103,157 category/year research opportunities. These are not 103,157 jobs, distinct states, errors or obligations to invent annual statistics. Only seven pilot jobs were generated/claimed. No global queue was dispatched.

Resolver availability remains **362/401 (90.27%)**. Investigated political candidates: 401; unresolved classifications: 72; mapping-review identities: 62. Source-present transition-year opportunities: 91; entity/year mapping-review opportunities: 848. These count different units and must not be summed as unique unresolved identities.

| Production field evidence | Supported entity/years | Partial entity/years |
| --- | ---: | ---: |
| Political/institutional core | 9,584 | 1,577 |
| Leadership | 2,559 | 205 |
| Capital/seat | 2,507 | 81 |
| Currency | 1,982 | 49 |
| Relationships | 460 | 12 |
| Dated event/context relevance | 91 | 0 |
| Population observation years | 15 | 0 |
| Area observations / economy observations / Important Figures | 0 each | 0 |

Each field's eligible denominator here is 11,872 researched-envelope entity/years, not every theoretical entity/year across 1800–1960. Supported event or figure relevance does not mean exhaustive annual history. Accepted research outside production is reported separately: the Camus package does not turn production Important Figures coverage from zero to one. Missing annual census evidence remains an explicit research opportunity, never interpolation.

## Pilot questions and validation

| Question | Result |
| --- | --- |
| Real temporal/field gaps? | Yes: dated field checks, requested years, uncertain boundaries and missing descriptions/scope |
| Appropriately bounded jobs? | Yes: seven single-year category jobs with existing evidence and cautions |
| Independent parallel workers? | Yes: three concurrent owners, disjoint packages, no production edits |
| Schema-valid evidence packages? | All seven; source references and date/scope declarations resolve |
| Weak/conflicting evidence found? | Yes: population scope held; disputed French details omitted; explicit risk/conflict routing tested |
| Invalid historical data caught? | Nine reusable adversarial fixtures plus validator cases fail or require review |
| Selected-year leakage prevented? | Tested: out-of-period facts and premature titles fail; Japan's later enforcement is excluded |
| Observation dates handled? | Tested: census misdating/interpolation fail; selected observation month stays explicit |
| Figure relevance validated? | Lifespan, dated activity, precision and territorial relationship tested; no national famous-person list |
| Serial integration? | Exclusive locks, duplicate/conflict refusal, real filesystem apply and hard-crash recovery tested |
| Production unchanged before integration? | Byte fingerprint, immutable registry tests, empty production Git diff and read-only pilot previews prove it |
| Interrupted jobs recoverable? | Actual usage interruption recovery and dead-owner lock/journal recovery tests pass |
| Reporting improves availability metric? | Separate field/year, observation, transition, scope and queue/research-evidence metrics; no combined completeness percentage |

Final validation: **195 automated tests passed (100 existing atlas + 95 pipeline)**, including all nine adversarial fixtures; **754 full browser checks passed**; **31 deployed checks passed**; **72 pilot consistency checks passed**. Coverage regeneration is reproducible (`coverage.mjs --check`); source references, hashes, queue receipts and durable outcomes are consistent; `git diff --check` passes. Deployed registries and frontend code match the unchanged local production baseline. Machine evidence is in `research/reports/stage1-validation.json`, `pilot-audit.json` and `pilot-integration-previews.json`.

## Remaining limitations and next action

Deterministic checks rely on declared evidence: they cannot independently prove historical truth or interpret every contradictory source. Manual source-body review remains mandatory. Legacy catalogue quality is unclassified where not explicitly documented. Editorial envelopes do not establish complete historical lifetimes; scanner totals therefore cannot represent universal global completeness. No benchmark claims parallel speedup.

Stage 1 refuses new entity/mapping/classification creation, disputed identity resolutions, structured-value adapters, Important Figures production integration and area-observation integration where the existing consumer expects intervals. Simultaneous institutional interpretations can require a separately reviewed amendment. Fingerprint-bound receipts become stale after production changes and require explicit fresh context revisions/review; automatic campaign rebasing and OS permission isolation remain future work. No portraits, UI redesign, timeline expansion or version bump occurred.

Next action: inspect the operating documentation, saved packages/reviews, adversarial fixtures and reports; then authorise a bounded Stage 2 campaign and any required production adapters separately. Do not automatically generate or dispatch global Deep Dossier research.
