# Territory Page v2

The permanent dossier renderer uses the existing `historical-entities.json` resolver and the independently accepted schema-v2 `comprehensive-dossiers.json` store. There is no manual presentation dataset. New integrated claims in a supported category appear automatically after deployment; unsupported, unaccepted, unresolved-source or risk-bearing records do not enter the presentation index.

The existing map, search, timeline and visible v0.6.1 credit remain unchanged. The panel adds a dated header and licensed flags, compact at-a-glance facts, overview, political institutions, leadership, population/territory, economy, chronological events, figure cards, curated relationships, and expandable sources/methodology. Empty sections are hidden. Citation numbers retain record/source associations. Statistical scope and uncertainty remain visible. Research provenance is not dumped into the public panel.

`historical-chronology.js` handles exact dates, month/year precision and astronomical BCE notation without extending the visible timeline. Exact interval ends are exclusive; partial ends retain their uncertainty. `rich-dossier.js` resolves accepted records against the requested calendar year and the curated entity mapping, independently of the boundary snapshot. Transition years retain separate identities/frameworks. Geometry and raw SUBJECTO/PARTOF never establish historical relationships.

Nearby context has explicit limits: past measurements within ten years retain their observation date and scope; rich nearby measurements require the same entity scope. Legacy qualified census observations retain their explicit statistical geography. Past events within five years retain their actual date. One-year Important Figure achievements within five years appear only as explicitly dated recent achievement context, never as continued citizenship/employment or a generic nationality list. Figure activity, association and lifespan must support the actual recorded period. Future records and nearby context crossing partial identity mappings are excluded. These windows describe presentation context, not newly asserted factual validity or completeness.

Rich data loads independently; its failure leaves sourced legacy dossiers operational. Historical metadata failure leaves the map selection and an explicit notice. Boundary context loads lazily. Images require an accepted local flag asset and attribution/licensing; unavailable flags are removed without a modern replacement.

## Focused validation

`node --test tests/territory-v2.test.mjs tests/transitions.test.mjs tests/pages-safety.test.mjs` covers 31 checks, including production acceptance, future automatic claims, selected-year leakage, observation geography/date, lifespan relevance, transition masks, distinct relationships, historical flags, date precision, immutable research data, and existing resolver transitions.

`node scripts/territory-v2-browser.mjs` uses the actual year/search controls for a bounded set of representative dossiers, responsive layout, citations and explicit failure paths. `--live` uses the actual GitHub Pages site without app hooks or a mocked production registry. JSON results and desktop/mobile screenshots are stored in this excluded development directory. Ordinary later data-only integrations should not repeat this frontend browser suite.

Production historical registries and accepted claims were not altered by this frontend checkpoint: 67 packages, 514 accepted rich claims, 51 enriched entities and 31 comprehensive research passes remain preserved. Resolver availability remains a separate 362/401 metric. Missing statistics and relationships are retained as genuine research gaps rather than filled by the interface.

## Deployment and continuation

First verify the actual Pages workflow for the pushed implementation SHA, then run the live browser checks and compare the deployed production store with committed data. The encoding/deployment boundary is documented in PAGES-DEPLOYMENT.md. Preserve excluded research and evidence files in Git.

After verified deployment, resume source-first snapshot research through the existing independent-review and serial integration protocol when sufficient execution budget remains. Do not start a new cohort when the remaining budget is too low to finish it safely. Recover all existing packages rather than restarting research. No timeline expansion, Compare Dates or What Changed is included.
