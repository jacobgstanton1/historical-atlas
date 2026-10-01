# Phase 2 Research Batch 03 — German and Habsburg families

Repository membership authority: manifest.phase2Batches (political-batch-03), 17 raw IDs; title retained as Central Europe and German/Italian source families. This batch has 16 political candidates and one political naming review. No classifications, denominator or memberships changed.

Baseline: f2c974e07465c7088302e9c160724a52ff73da22. Visible version remains v0.6.1; metadata cache query advances to b03.

## Outcomes and coverage

19 new partial historical entities; no existing entity fields changed; the Nazi-period reference dossier is reused. 21 new dated mappings and 28 new source records. All 17 assigned labels have partial resolver coverage; no new core-complete assertion.

Political coverage: 43/401 (10.72%) → 58/401 (14.46%). 343 remain uncovered. 70 curated entities, 234 sources, 72 unresolved classifications. Explicit mapping-review IDs: entity-austrian-netherlands, entity-soviet-union, entity-tibet. Zero broken mappings or orphan metadata. Coverage measures resolver availability somewhere in defensible intervals, not comprehensive historical knowledge.

## Assigned identities and dated decisions

| Raw identity | Curated entity / interval | Outcome |
|---|---|---|
| entity-austria | austria-first-republic-framework [1918-11-12 → 1933-03]; austria-authoritarian-framework [1933-03 → 1938-03]; austria-second-republic-framework [1945-04-27 → 1961-01-01] | Partial / needs research |
| entity-austria-hungary | austria-hungary-dual-framework [1867 → 1918-01-01] | Partial / needs research |
| entity-austrian-empire | austria-imperial-framework [1804-08-11 → 1867] | Partial / needs research |
| entity-austro-hungarian-empire | austria-hungary-dual-framework [1867 → 1918-01-01] | Partial / needs research |
| entity-bosnia-herzegovina | bosnia-habsburg-administration [1878 → 1918-01-01] | Partial / needs research |
| entity-hungary | hungary-horthy-framework [1920 → 1944-03-19]; hungary-post1956-framework [1957-11-08 → 1961-01-01] | Partial / needs research |
| entity-east-germany | germany-democratic-1949-framework [1949-10-07 → 1961-01-01] | Partial / needs research |
| entity-east-prussia | east-prussia-provincial-framework [1920-01-01 → 1931-01-01] | Partial / needs research |
| entity-german-empire | germany-imperial-framework [1871 → 1918-11-09] | Partial / needs research |
| entity-germany | germany-nazi-period [1933-01-30 → 1945-04-30]; germany-imperial-framework [1871 → 1918-11-09]; germany-weimar-framework [1919-08-14 → 1933-01-30] | Partial / needs research |
| entity-germany-france | germany-france-occupation [1945-08-02 → 1949-01-01] | Partial / needs research |
| entity-germany-soviet | germany-soviet-occupation [1945-08-02 → 1949-01-01] | Partial / needs research |
| entity-germany-uk | germany-british-occupation [1945-08-02 → 1949-01-01] | Partial / needs research |
| entity-germany-usa | germany-american-occupation [1945-08-02 → 1949-01-01] | Partial / needs research |
| entity-prussia | prussia-monarchy-early-framework [1800-01-01 → 1816-01-01] | Partial / needs research |
| entity-saar-protectorate | saar-french-occupation-1945 [1945-07-10 → 1946-01-01] | Partial / needs research |
| entity-west-germany | germany-federal-1949-framework [1949-05-24 → 1961-01-01] | Partial / needs research |

Exact end dates are exclusive. Year/month endpoints preserve precision uncertainty and can overlap within a selected calendar year. Dates chosen simply to delimit researched coverage are explicitly not asserted founding/dissolution dates.

## Historical decisions and limitations

- All new profiles are partial; no full 1800–1960 or core-complete claim.
- Austrian Empire is not mapped in 1800: pre-1804 dynastic scope remains a research gap.
- Austria-Hungary naming variants consolidate only inside the sourced dual-monarchy interval; 1918 dissolution remains uncurated.
- Bosnia 1878/1908 and Austria 1933/1938 retain year/month precision; date precision is not invented.
- German November 1918–August 1919 provisional institutions remain a gap. Weimar and Nazi frameworks remain separate without asserting that the constitution was formally repealed in January 1933.
- German occupation coverage starts at the end of Potsdam and stops before 1949 state formation; these are curated bounds, not full occupation lifetimes.
- Generic Germany is not mapped to either simultaneous post-1949 German state. Specific East/West source IDs resolve independently.
- Saar 1945 is French military occupation, not a retroactive protectorate. Later protectorate institutions remain uncurated.
- Hungary 1944–1957 institutional changes remain gaps; party leadership is not mislabelled as prime minister.
- No new flags, population, GDP, area or inferred successor links. Currency and missing office/seat chronologies remain explicit omissions.

Austria-Hungary and Austro-Hungarian Empire labels consolidate into the independently documented dual monarchy; Bosnia, later Austrian frameworks, Prussia, East Prussia, all four German occupation administrations and the two later German republics remain distinct. No predecessor/successor chain was inferred from polygons or source hierarchy.

## New dossiers and accepted fields

- **austria-imperial-framework** — 1804-08-11 → 1867; sourced name and overview; politicalStatus. Sources: b03-austria-1804, b03-compromise.
- **austria-hungary-dual-framework** — 1867 → 1918-01-01; sourced name and overview; politicalStatus, capitals, governments, leaders. Sources: b03-compromise, b03-dual-institutions, b03-franz-joseph.
- **bosnia-habsburg-administration** — 1878 → 1918-01-01; sourced name and overview; politicalStatus, governments. Sources: b03-bosnia.
- **austria-first-republic-framework** — 1918-11-12 → 1933-03; sourced name and overview; politicalStatus, governments. Sources: b03-austrian-republic-birth, b03-first-republic, b03-bvg-1920, b03-austria-constitution.
- **austria-authoritarian-framework** — 1933-03 → 1938-03; sourced name and overview; politicalStatus, governments. Sources: b03-first-republic.
- **austria-second-republic-framework** — 1945-04-27 → 1961-01-01; sourced name and overview; politicalStatus, governments. Sources: b03-austria-postwar, b03-austria-constitution.
- **germany-imperial-framework** — 1871 → 1918-11-09; sourced name and overview; politicalStatus, governments. Sources: b03-german-imperial.
- **germany-weimar-framework** — 1919-08-14 → 1933-01-30; sourced name and overview; politicalStatus, governments. Sources: b03-weimar-commencement, b03-weimar-framework, reichstag.
- **germany-france-occupation** — 1945-08-02 → 1949-01-01; sourced name and overview; politicalStatus, governments. Sources: b03-potsdam, b03-allied-declaration.
- **germany-soviet-occupation** — 1945-08-02 → 1949-01-01; sourced name and overview; politicalStatus, governments. Sources: b03-potsdam, b03-allied-declaration.
- **germany-british-occupation** — 1945-08-02 → 1949-01-01; sourced name and overview; politicalStatus, governments. Sources: b03-potsdam, b03-allied-declaration.
- **germany-american-occupation** — 1945-08-02 → 1949-01-01; sourced name and overview; politicalStatus, governments. Sources: b03-potsdam, b03-allied-declaration.
- **germany-federal-1949-framework** — 1949-05-24 → 1961-01-01; sourced name and overview; politicalStatus, capitals, governments, leaders. Sources: b03-basic-law, b03-allied-reserved-rights, b03-divided-germany.
- **germany-democratic-1949-framework** — 1949-10-07 → 1961-01-01; sourced name and overview; politicalStatus, governments, leaders. Sources: b03-germany-diplomatic, b03-divided-germany, b03-grotewohl, b03-pieck.
- **prussia-monarchy-early-framework** — 1800-01-01 → 1816-01-01; sourced name and overview; politicalStatus, capitals, governments, leaders. Sources: b03-prussian-monarch.
- **east-prussia-provincial-framework** — 1920-01-01 → 1931-01-01; sourced name and overview; politicalStatus, capitals, governments. Sources: b03-east-prussian-administration.
- **hungary-horthy-framework** — 1920 → 1944-03-19; sourced name and overview; politicalStatus, governments, leaders. Sources: b03-hungary-horthy.
- **hungary-post1956-framework** — 1957-11-08 → 1961-01-01; sourced name and overview; politicalStatus, governments, leaders. Sources: b03-hungary-1957, b03-hungary-1960, b03-hungary-offices.
- **saar-french-occupation-1945** — 1945-07-10 → 1946-01-01; sourced name and overview; politicalStatus, governments. Sources: b03-saar-occupation.

Every absent field remains uncurated. No flags, statistics, currencies or named office-holders were supplied from modern fallback information. Capital/seat records use parliamentary, royal or provincial labels. Gros­tewohl is prime minister, Pieck president only until his death, and Kádár party first secretary rather than a projected prime minister in 1960.

## Source register additions

- b03-austria-1804: [Foundation of the Empire of Austria, 1804](https://www.habsburger.net/en/events/foundation-empire-austria-1804) — Schönbrunn Group — The World of the Habsburgs / First World War scholarly collection. Patent of 11 August 1804 and distinction from the Holy Roman Empire.
- b03-compromise: [An empire in two halves: the Compromise with Hungary](https://www.habsburger.net/en/chapter/empire-two-halves-compromise-hungary) — Schönbrunn Group — The World of the Habsburgs / First World War scholarly collection. 1867 dual monarchy; shared foreign affairs, military and associated finance; separate domestic institutions.
- b03-dual-institutions: [The Dual Monarchy: two states in a single empire](https://ww1.habsburger.net/en/chapters/dual-monarchy-two-states-single-empire/1000) — Schönbrunn Group — The World of the Habsburgs / First World War scholarly collection. Constituent institutions and parliamentary seats; Bosnia belonged to neither half.
- b03-franz-joseph: [Franz Joseph I](https://www.habsburger.net/en/persons/habsburg-emperor/franz-joseph-i) — Schönbrunn Group — The World of the Habsburgs / First World War scholarly collection. Monarchical offices and death on 21 November 1916.
- b03-bosnia: [The Bosnians in the Habsburg Monarchy](https://ww1.habsburger.net/en/chapters/bosnians-habsburg-monarchy) — Schönbrunn Group — The World of the Habsburgs / First World War scholarly collection. 1878 occupation with Ottoman legal sovereignty, 1908 annexation, 1910 local parliament.
- b03-first-republic: [Die Erste Republik — Parlament Österreich](https://www.parlament.gv.at/verstehen/historisches/1918-1945) — Austrian Parliament. 1933 destruction of parliamentary democracy and March 1938 annexation.
- b03-austrian-republic-birth: [Die Geburt der Republik](https://www.parlament.gv.at/verstehen/historisches/1918-1945/geburt-der-republik) — Austrian Parliament. Republic proclaimed on 12 November 1918.
- b03-bvg-1920: [100 Jahre Nationalrat und Bundesrat](https://www.parlament.gv.at/fachinfos/rlw/100-Jahre-Nationalrat-und-Bundesrat) — Austrian Parliament. B-VG came into force on 10 November 1920.
- b03-austria-constitution: [Die österreichische Bundesverfassung](https://www.parlament.gv.at/verstehen/politisches-system/bundesverfassung/verfassung) — Austrian Parliament. 1929 amendments, 1933 interruption, 1945 restoration of the amended B-VG.
- b03-austria-postwar: [Kriegsende, Staatsvertrag und EU-Beitritt](https://www.parlament.gv.at/kriegsende-staatsvertrag-eu-beitritt/index.html) — Austrian Parliament. 27 April 1945 re-establishment; treaty signature versus entry into force on 27 July 1955; neutrality law.
- b03-german-imperial: [Kaiserreich (1871–1918)](https://www.bundestag.de/parlament/geschichte/parlamentarismus/kaiserreich) — German Bundestag. Imperial institutions and parliamentary monarchy from 28 October to 9 November 1918.
- b03-weimar-commencement: [Unterzeichnung der Weimarer Verfassung](https://weimar.bundesarchiv.de/WEIMAR/DE/Content/Dokumente-zur-Zeitgeschichte/1919-08-11_Verfassung.html) — German Federal Archives. Distinguishes 11 August signature from 14 August 1919 commencement.
- b03-weimar-framework: [Die Weimarer Reichsverfassung](https://www.dhm.de/lemo/kapitel/weimarer-republik/innenpolitik/verfassung) — German Historical Museum. Democratic institutions, presidential cabinets after March 1930 and continuing formal constitution after 1933.
- b03-allied-declaration: [Declaration regarding Germany, 5 June 1945](https://avalon.law.yale.edu/wwii/ger01.asp) — Yale Law Library — Avalon; United States treaty collection. Four governments assumed supreme authority; this did not itself annex Germany.
- b03-potsdam: [Potsdam Conference, July 17–August 2, 1945](https://avalon.law.yale.edu/20th_century/decade17.asp) — Yale Law Library — Avalon; United States Department of State. Commanders exercised authority separately in four zones and jointly through the Control Council.
- b03-basic-law: [23. Mai 1949: Parlamentarischer Rat verkündet das Grundgesetz](https://www.bundestag.de/dokumente/textarchiv/1949-05-23-grundgesetz-641776) — German Bundestag. Promulgation on 23 May; commencement at the end of that day; federal constitutional order.
- b03-allied-reserved-rights: [Die Vier Mächte in Deutschland von 1945 bis 1990](https://www.bundesregierung.de/breg-de/schwerpunkte/deutsche-einheit/die-vier-maechte-in-deutschland-von-1945-bis-1990-480498) — German Federal Government. Occupation Statute ended 5 May 1955; rights over Berlin and Germany as a whole remained.
- b03-divided-germany: [Geteiltes Deutschland und Wiedervereinigung](https://www.dhm.de/ausstellungen/dauerausstellung/geteiltes-deutschland-und-wiedervereinigung/) — German Historical Museum. Contrasting federal democratic and SED systems; Bonn parliament and Adenauer chancellorship.
- b03-germany-diplomatic: [Germany — Guide to Recognition and Diplomatic Relations](https://history.state.gov/countries/germany) — United States Department of State, Office of the Historian. Four occupation zones and GDR creation on 7 October 1949. Its September FRG date is not used as constitutional commencement.
- b03-grotewohl: [Otto Grotewohl](https://www.hdg.de/lemo/biografie/otto-grotewohl.html) — Haus der Geschichte. Prime minister 1949–1964; declining practical activity from November 1960.
- b03-pieck: [Wilhelm Pieck](https://www.dhm.de/lemo/biografie/wilhelm-pieck) — German Historical Museum. President elected 11 October 1949; died 7 September 1960.
- b03-prussian-monarch: [Friedrich Wilhelm III. von Preußen](https://www.preussenchronik.de/person_jsp/key=person_friedrich%2Bwilhelm%2Biii._preu%25dfen.html) — rbb — Preußen-Chronik. King from 1797 to 1840; Berlin residence and flight to Königsberg in 1806.
- b03-east-prussian-administration: [Oberpräsident der Provinz Ostpreußen — Einleitung](https://archivdatenbank.gsta.spk-berlin.de/midosasearch-gsta/MidosaSEARCH/xx_ha_rep_2/xml/inhalt/b4736171-d7f1-4c49-9fdd-52a510d24194.htm) — Geheimes Staatsarchiv Preußischer Kulturbesitz. Provincial administration, Königsberg seat, 1878 separation and later 1934 restructuring.
- b03-hungary-horthy: [The Holocaust in Hungary](https://encyclopedia.ushmm.org/content/en/article/the-holocaust-in-hungary) — United States Holocaust Memorial Museum. Horthy authoritarian government from 1920, persecution and German occupation on 19 March 1944.
- b03-hungary-1957: [Memorandum, 8 November 1957 — Hungary](https://history.state.gov/historicaldocuments/frus1955-57v25/d275) — United States Department of State, Foreign Relations of the United States. Contemporary assessment of the post-1956 Communist government and Soviet forces.
- b03-hungary-1960: [Political report from the Legation in Hungary, 1960](https://history.state.gov/historicaldocuments/frus1958-60v10p1/d27) — United States Department of State, Foreign Relations of the United States. Continued Communist government and Soviet troop presence; attributed contemporary diplomatic assessment.
- b03-hungary-offices: [Persons — Foreign Relations, 1958–1960, volume X part 1](https://history.state.gov/historicaldocuments/frus1958-60v10p1/persons) — United States Department of State. Kádár was party first secretary; prime minister tenure ended in January 1958.
- b03-saar-occupation: [Universität des Saarlandes — Stätten grenzüberschreitender Erinnerung](https://www.memotransfront.uni-saarland.de/uni_saarland.shtml) — Saarland University. French forces replaced US forces on 10 July 1945; French military government in autumn 1945.

## Validation

54 automated tests passed, including global date/source/mapping validation, earlier dossier preservation and four Batch 03 historical regression tests. JavaScript syntax checks, coverage generation, reproducibility (--check) and git diff --check passed. Targeted browser run passed 86 checks, rendering all 19/19 new entities with explicit name assertions and no runtime errors. German/Habsburg identity and framework transitions, between-snapshot 1925, Weimar search, source anchors/links, map reset, timeline, exact year, labels, Antarctica exclusion, maximum zoom and absence of Compare Dates were checked. Expected local missing boundary files use the existing remote fallback.

The first browser run exposed an incorrect test seed, not a production defect: raw Germany was absent from the 1914 snapshot. The corrected 1930 seed and stronger dossier-name assertions passed. Broader browser regression is scheduled after Batch 05; resolver/runtime architecture unchanged.

Next: political-batch-04, using regenerated manifest membership, after this checkpoint is committed, pushed and synchronized.
