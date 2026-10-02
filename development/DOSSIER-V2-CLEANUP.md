# Territory Page v2 bounded cleanup

Presentation-only cleanup; production registries, accepted claims, snapshot resolution, research handoff and map design are preserved. No historical acquisition was performed.

`dossier-presentation.js` supplies deterministic title/date/text rules. Accepted identity records are considered first, then applicable formal/primary names, canonical entity names and mapped fallback. A framework suffix is removed from the displayed state name, retaining the original sourced record in production. Italy 1960 is now Italian Republic; the UK 1914 formal name remains dated and historically appropriate.

Recognised coverage and ingestion sentences move to cited Coverage & interpretation notes inside Sources & Methodology. Unknown qualifications, historical geography and genuine uncertainty remain alongside facts. This conservative classifier does not create replacement historical prose. Overview narrative is retained verbatim. Important Figure cards retain contributions, lifespan, dated award activity, historical affiliation and citations, while award-ingestion qualifications move below. Award-year context does not become ongoing employment or nationality.

Full-month dates distinguish observation/census dates, event dates and applicability. Explicitly documented atlas cutoffs show From rather than a fabricated historical end. An arbitrary 1961 endpoint without cutoff evidence stays bounded. Recorded research-clipped windows are labelled as recorded coverage rather than tenure. Stored dates are unchanged. Flag captions are compact; applicability evidence, visual qualifications and attribution remain cited below.

The headline political status is not repeated as an identical Government & Politics row. Specific supported roles/metrics have natural labels, and distinct institutional claims remain visible. Sparse dossiers retain one concise message and boundary/source sections. Minor typography improves citations and figure-card separation. Exact mapped-name search matches now rank ahead of dependencies that merely mention the authority, fixing reliable selection of the requested UK case.

Validation: 27 focused automated tests passed (11 cleanup and 16 existing V2 resolver/immutability tests); syntax, UTF-8 and diff checks passed. Fifteen focused local browser checks passed for France 1960, Italy 1960, UK 1914, Russian Empire 1800, Germany across two snapshots, a Japanese census, citations and mobile scrolling. The Italy desktop screenshot was inspected. Actual Pages deployment and the same bounded live cases must pass before acceptance; detailed JSON reports are stored in this excluded development directory.

After successful live verification, stop and wait for the user's inspection. Do not resume research acquisition automatically. The previous research handoff is preserved unchanged.
