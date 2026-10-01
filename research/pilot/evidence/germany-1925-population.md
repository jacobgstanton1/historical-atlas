# Germany 1925 population pilot

Job: research-bc257e72a34ebbf2ec1dac3e

Worker: pilot-statistics; specialism: population-statistics.

## Source body and provenance

Read the actual official Destatis PDF body on 1 October 2026: [Statistisches Jahrbuch 2019](https://www.destatis.de/DE/Themen/Querschnitt/Jahrbuch/statistisches-jahrbuch-2019-dl.pdf?__blob=publicationFile), printed page 26, table 2.1.2, Bevölkerungsentwicklung Deutschlands. Reuse catalogue source **destatis-historical** at this exact URL. No new source record or duplicate URL is introduced. Windows Invoke-WebRequest retrieved the document into memory; pypdf extracted PDF page index 25. No PDF was saved. Earlier web opens returned 403; direct Windows retrieval succeeded and supplied the actual table body, not a search snippet.

The table's population column is measured in thousands. The 1925 census row gives 62,411 thousand, converted to **62,411,000 persons**. Footnote 1 marks the result as a census observation. The chronology text dates the 1925 observation to **June**, so the package uses **1925-06**. It supplies no exact day; none is invented. The density column (133) is not a second population value and is not used to infer area.

## Territorial interpretation

The table identifies 1871–1939 as Reichsgebiet. Its separate 31 December 1937 territorial footnote is attached through footnote 2 only to the **1939** row. The 1925 row has footnote 1 only. Therefore, the package does not claim that the 1925 number was recalculated to 1937 borders. This corrects an initial evidence lead rather than converting that lead into a fact.

The published census statistical territory has not been compared documentarily with the entity-germany atlas geometry. The record's geographic relationship remains **uncertain**, with **reviewStatus required**. Nothing is inferred from polygon area, a boundary snapshot or the current German state. The source is a retrospective official historical census series, not a modern population fallback.

## Limits and review

The conversion retains the original thousand-person rounding; it does not create exact headcount precision. June 1925 is a dated observation, not population for every day of 1925 or a basis for filling other years. Neither the 1933 nor the 1939 value is interpolated. No demographic, territorial-control or succession claim is added. Independent coordinator review is mandatory, particularly for statistical-scope presentation.

## Read-only validation

validatePackage against the exact coordinator job and current readContext passed without errors; status historical-review. Review flags intentionally retain uncertain scope, required review, historical cautions and omissions. Package hash: d5c5c15f3120daf0c44d00e29af0b60a640f25f428d8d326d691bfd07ba99f4b. Only the two assigned handoff files were written. Production files, queue state and Git were not changed by this worker.
