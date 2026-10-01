# Phase 2 Research Batch 08 — North America

Exact scope: political-batch-08, all 10 assigned IDs. Coordinator baseline a4ef17a716f57060b7f9c75d08ae35e4718e8077. Research performed independently in an isolated worker directory, integrated serially with source-ID reconciliation and existing validation. Visible version remains v0.6.1; data cache b08. No geometry-derived sovereignty, automatic succession or modern fallback.

## Outcomes

12 new partial historical entities; 0 extended; 12 dated mappings; 15 new source records. Reused entities: united-states. No historical-completeness claim.

Political dossier availability: 127/401 (31.67%) → 133/401 (33.17%). Registry: 201 entities, 349 sources; 72 unresolved classifications, 17 mapping-review IDs, 0 broken mappings, 0 orphan entities. Availability means resolver support in at least one present snapshot, not complete historical knowledge.

## Every assigned identity

| Raw ID | Decision, researched intervals and omissions |
| --- | --- |
| entity-united-states | existing-enriched; united-states [1800-01-01 → 1961-01-01]. No new facts, mappings or duplicate source entries; prior temporal/core data preserved. |
| entity-canada | mapping-review; canada-1867-federal-framework [1867-07-01 → 1931-12-11]; canada-westminster-federal-framework [1931-12-11 → 1961-01-01]. 1867 onward has defensible federal mappings; 1815 raw Canada does not identify a single established federal administration. |
| entity-mexico | needs-research; mexico-porfirian-framework [1878-01-01 → 1910-01-01]; mexico-1917-constitutional-framework [1918-01-01 → 1961-01-01]. Partial editorial intervals only; no complete lifetime or exhaustive history claim. |
| entity-greenland | needs-research; greenland-late-colonial-framework [1878-01-01 → 1901-01-01]; greenland-post-1953-integration-framework [1954-01-01 → 1961-01-01]. Partial editorial intervals only; no complete lifetime or exhaustive history claim. |
| entity-dominion-of-newfoundland | needs-research; newfoundland-responsible-dominion-framework [1908-01-01 → 1934-02-16]; newfoundland-commission-framework [1934-02-16 → 1949-03-31]. Partial editorial intervals only; no complete lifetime or exhaustive history claim. |
| entity-viceroyalty-of-new-spain | needs-research; new-spain-pre-crisis-framework [1800-01-01 → 1808-01-01]; new-spain-1815-royalist-framework [1815-01-01 → 1816-01-01]. Partial editorial intervals only; no complete lifetime or exhaustive history claim. |
| entity-acadian-peninsula-uk | mapping-review; review only [1800-01-01 → 1801-01-01]. Maritime colonies had separate British governors, councils and elected assemblies; Acadian Peninsula is a geographical label rather than a securely identified whole colonial government. |
| entity-luisiana | needs-research; louisiana-pre-retrocession-framework [1800-01-01 → 1800-10-01]. Partial editorial intervals only; no complete lifetime or exhaustive history claim. |
| entity-quebec | mapping-review; review only [1800-01-01 → 1801-01-01]. Province of Quebec split into Upper and Lower Canada in 1791; 1800 Quebec could mean Lower Canada, its city or an outdated composite. |
| entity-rupert-s-land | needs-research; ruperts-land-chartered-framework [1800-01-01 → 1801-01-01]. Partial editorial intervals only; no complete lifetime or exhaustive history claim. |

## New entity cores

| Entity | Researched bounds | Core fields |
| --- | --- | --- |
| canada-1867-federal-framework | 1867-07-01 → 1931-12-11 | names, politicalStatus, governments, capitals, descriptions |
| canada-westminster-federal-framework | 1931-12-11 → 1961-01-01 | names, politicalStatus, governments, capitals, descriptions |
| newfoundland-responsible-dominion-framework | 1908-01-01 → 1934-02-16 | names, politicalStatus, governments, descriptions |
| newfoundland-commission-framework | 1934-02-16 → 1949-03-31 | names, politicalStatus, governments, descriptions |
| greenland-late-colonial-framework | 1878-01-01 → 1901-01-01 | names, politicalStatus, descriptions |
| greenland-post-1953-integration-framework | 1954-01-01 → 1961-01-01 | names, politicalStatus, descriptions |
| mexico-porfirian-framework | 1878-01-01 → 1910-01-01 | names, politicalStatus, governments, leaders, descriptions |
| mexico-1917-constitutional-framework | 1918-01-01 → 1961-01-01 | names, politicalStatus, governments, capitals, descriptions |
| new-spain-pre-crisis-framework | 1800-01-01 → 1808-01-01 | names, politicalStatus, governments, descriptions |
| new-spain-1815-royalist-framework | 1815-01-01 → 1816-01-01 | names, politicalStatus, governments, leaders, descriptions |
| ruperts-land-chartered-framework | 1800-01-01 → 1801-01-01 | names, politicalStatus, governments, descriptions |
| louisiana-pre-retrocession-framework | 1800-01-01 → 1800-10-01 | names, politicalStatus, governments, descriptions |

These are independently sourced partial research intervals. Editorial bounds do not claim full lifetimes. Exact dates are exclusive at the end; month/year endpoints retain uncertainty. Full mapping/fact/source references and the structured worker handoff are retained in research-batch-08.json.

## Cautions, reviews and exclusions

- All proposed dossiers are partial editorial cores. Missing demographic/economic/flag fields deliberately remain empty.
- Pre-confederation Canada, Quebec and Acadian Peninsula raw referents need source-label investigation.
- Important transition years include Canada 1931 and Newfoundland 1934; Greenland 1953 and Mexico 1917 are transparent researched gaps, not fabricated exact framework dates.
- Canada 1815 and Quebec 1800 cannot be assigned to the 1867 federal state or a guessed single earlier colony.
- The Canadian parliamentary chronology overgeneralises Westminster applicability to Newfoundland; original statute section 10 is followed.
- Charters and colonial incorporation do not establish Indigenous consent or extinguish Indigenous sovereignty.
- Greenland 1953 integration is not a claim of independence or unanimous consent; modern self-government omitted.
- Formal Mexican constitutional institutions do not establish competitive democracy; 1914 competing authorities remain uncurated.
- Louisiana treaty title and physical possession differed by locality; no uniform 1800 French-government fallback.
- New Spain 1815 reflects contested royalist administration, not exclusive control of the mapped polygon.

Classification proposals: 0; changes are not automatically accepted. Partial IDs: entity-canada, entity-mexico, entity-greenland, entity-dominion-of-newfoundland, entity-viceroyalty-of-new-spain, entity-luisiana, entity-rupert-s-land. Unresolved: see decisions above. Mapping review: entity-canada, entity-acadian-peninsula-uk, entity-quebec.

## Source evidence

- b08-canada-institutions: [Canadian Parliamentary Institutions — historical development](https://www.ourcommons.ca/procedure/procedure-and-practice-3/ch_01_2-e.html) — House of Commons of Canada; Read historical body and chronology, especially 1791 separate Upper/Lower Canada, maritime colonies, 1867 union effective 1 July, and 1934 Newfoundland suspension. The broad chronology oversimplifies Newfoundland’s 1931 statute applicability; original section 10 controls instead. Modern officeholder rules and representation counts excluded.
- b08-canada-1867-act: [Constitution Act, 1867 — Union, executive and Parliament](https://laws.justice.gc.ca/eng/const/page-1.html) — Department of Justice Canada; Read sections 3, 5, 9–17 and historical notes. Supports Dominion, executive Crown/Governor General/Privy Council, Ottawa and Senate/Commons. Current amended chamber sizes, modern province list and 1982 rights not projected backwards.
- b08-westminster-1931: [Statute of Westminster 1931 — original enacted text](https://www.legislation.gov.uk/ukpga/Geo5/22-23/4/enacted) — UK legislation.gov.uk; Read full original body by public HTTP download: dated 11 December 1931, sections 2–4 remove repugnancy restriction and require request/consent for UK legislation; section 7 preserves British North America Acts amendment exception. Section 10 excludes Newfoundland from automatic adoption of sections 2–6.
- b08-newfoundland-responsible: [Responsible Government, 1855–1933](https://www.heritage.nf.ca/articles/politics/responsible-government-1855-to-1933.php) — Memorial University of Newfoundland; Read complete body in isolated downloaded HTML. Responsible government in domestic matters, imperial external affairs, Assembly and Executive Council; war/postwar politics. Specific officeholder term precision not used.
- b08-newfoundland-commission: [The Commission of Government, 1934–1949](https://www.heritage.nf.ca/articles/politics/commission-government.php) — Memorial University of Newfoundland / Jeff A. Webb; Read complete downloaded body: sworn 16 February 1934, governor chairs six appointed commissioners, no election or legislature, major policies/budget require Dominions Office permission; Dominion in name. Confederation official 31 March 1949.
- b08-dominion-1907: [Becoming a dominion](https://nzhistory.govt.nz/page/becoming-dominion) — Manatū Taonga — New Zealand Ministry for Culture and Heritage; Read body stating Dominion became distinguishing label for Newfoundland and other self-governing administrations in 1907. The precise New Zealand 26 September proclamation is not incorrectly transferred to Newfoundland.
- b08-greenland-history: [Greenland — History and culture](https://um.dk/japan/en/about-denmark/greenland/history-and-culture/) — Danish Ministry of Foreign Affairs / Royal Danish Embassy Japan; Read historical paragraphs: Danish colonial period until 1953, constitutional county status in 1953, home rule only 1979; wartime communications suspended. Modern 2009 autonomy and current capital/status omitted. Colonial coverage restricted to 1878–1900, before wartime complication.
- b08-greenland-un-history: [Greenland and the UN: Colony or not a colony](https://unric.org/en/greenland-and-the-un-colony-or-not-a-colony-that-was-the-question/) — United Nations Regional Information Centre; Read historical body: 1953 integration into Denmark, elected regional assemblies consulted but constitution not put to direct Greenland vote, contested decolonisation interpretation and 1954 UN declaration. County integration does not establish independence or unanimous popular consent.
- b08-mexico-loc-study: [Mexico: A Country Study (1996) — historical setting and constitutional history](https://tile.loc.gov/storage-services/master/frd/frdcstdy/me/mexicocountrystu00merr_0/mexicocountrystu00merr_0.pdf) — Library of Congress Federal Research Division; Downloaded and extracted full PDF; read printed pp. 11–19, 31–41, 232–236 (PDF 67–75, 87–97, 300–304): colonial viceroy/audiencia and limited distant authority; 1810–21 civil war/1815 royalists; Díaz direct/indirect personalist rule under 1857 formal institutions; 1917 constitutional separation and early-1940s dominant-party presidency. Date errors and insulting period rhetoric excluded; modern 1990s membership counts/economic facts not projected.
- b08-mexico-porfiriato: [México bajo Porfirio Díaz, 1876–1911](https://www.loc.gov/exhibits/mexican-revolution-and-the-united-states/porfiriato-sp.html) — Library of Congress; Read full Spanish exhibition body, Porfirio Díaz en 1867 section: explicit first presidency ending 30 November 1880; inclusive end represented by exclusive 1 December 1880. Later body records 1884 return; editorial leader starts 1885 and ends before 1910 revolutionary period. Repeated reelections and suppression of dissent documented. González interval is not assigned to Díaz.
- b08-mexico-1917-exhibit: [The Constitution of 1917](https://www.loc.gov/exhibits/mexican-revolution-and-the-united-states/constitution-of-1917.html?loclr=bloglaw) — Library of Congress; Read exhibition body with original constitutional provenance: proclaimed 5 February 1917, government and Mexico City capital, Church/state separation and social rights. Editorial dossier starts 1918 to avoid conflating proclamation with implementation; amendments and practical authority remain explicitly partial.
- b08-new-spain-1815-bando: [Bando of Viceroy Félix María Calleja, 22 September 1815](https://bandosmexico.inah.gob.mx/todos/1815_09_22.html) — Instituto Nacional de Antropología e Historia / Archivo General de la Nación; Read full primary transcription including official titulature, palace of Mexico date and archival references AGN bandos vol. 28 exp.67 f.145. Documents viceroy/governor/captain-general and Real Audiencia presidency on that day; office tenure is not inferred beyond attestation.
- b08-ruperts-charter: [Federal legislation and Canadian territories — Rupert’s Land charter and admission](https://justice.canada.ca/eng/rp-pr/csj-sjc/harmonization/gaudr/territories/p1.html) — Department of Justice Canada; Read historical body including 1670 charter extracts, Crown-reserved allegiance/dominion, HBC proprietary/trading authority and 1870 admission. Crown/company grants are represented as colonial claims, not proof that Indigenous nations surrendered sovereignty or territory.
- b08-louisiana-primary-treaty: [Louisiana Purchase Treaty (1803)](https://www.archives.gov/milestone-documents/louisiana-purchase-treaty) — U.S. National Archives; Read primary transcript and introduction: Article I recalls Spanish retrocession agreement at San Ildefonso on 1 October 1800, then French cession to US; transfer clauses distinguish title/treaty and possession. Profile stops at 1 October 1800 rather than guessing post-treaty legal or actual administration.
- b08-louisiana-transfer: [Louisiana Territory Officially Transferred](https://www.nps.gov/articles/000/louisiana-territory-officially-transferred.htm) — U.S. National Park Service; Read article body: New Orleans Spanish/French Cabildo and Spanish transfer 30 November 1803, Upper Louisiana retained Spanish control to March 1804. The article’s inconsistent sentence on US possession ten days after 20 December is excluded, and no uniform post-1800 transfer mapping accepted.

Only read source bodies support accepted facts. Worker body-reading cautions and source provenance remain in the isolated research notes; deterministic validation checks references and structure, while historical acceptance is coordinator-reviewed. Statistics, flags and exhaustive enrichment remain outside this breadth phase.

## Validation

81 automated tests passed. Syntax, metadata/source references, dated mappings, all earlier immutable checkpoints, regenerated coverage, reproducibility --check and git diff --check passed. Browser 69 checks; 12/12 new entities opened, zero runtime errors. Includes 5 transition/partial-year cases and 5 fail-closed cases, requested-year/geometry separation, searches, citations, map controls, Antarctica exclusion and no Compare Dates.

No full regression is scheduled at this batch; next scheduled checkpoints remain 09, 13, 17 and 21.

Next authorised batch: political-batch-09. Push and clean-main verification precede further integration.
