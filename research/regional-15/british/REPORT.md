# Batch 15 British West African administrations: bounded original-source cohort

Worker intake only. Production files are untouched. Independent coordinator review and certification are required before serial integration.

## Scope and result

The assigned cluster contains 17 editorial historical frameworks and 32 entity/snapshot dossiers. The frozen cohort supplies **26 claims across 11 frameworks and eight sources**: currency 11, capital 4, leadership 3, events 4, and numeric Economy 4. This is smaller than the aspirational claim target because unsupported chronology and source-name errors were held rather than forced. Claims reuse intervals across snapshots; no completed coverage gain is asserted before integration.

Shared currency-board evidence covers Sierra Leone, Gold Coast and Nigeria; Gambia's own central-bank history supplies its distinct chronology. Contemporary Gambian annual reports add mixed currency circulation in 1914, selected-year public finance, trade disruption and governor-transition events. Bathurst capital intervals combine a local historian's explicitly bounded 1816–1973 history with the colonial government's 1930 statement that it was the seat of government. During West African Settlements membership the value means the local Gambian administrative seat, not the superior administration at Freetown.

## Original sources and locators

- Central Bank of Nigeria, History of Nigerian Currency: regional WACB pound-denominated currency; exact existing source ID `c01-nigeria-cbn-currency-history` reused. The compressed regional first-issue account is not used to claim that Gambian banknotes circulated before 1917. Its unrelated republican-status chronology is not imported.
- Central Bank of The Gambia, Evolution of Currency: five-franc circulation by 1880; 1913 coins; late-1917 notes; October 1964 replacement notes and November 1966 replacement coinage.
- The Point, 28 February 2023 interview with historian Hassoum Ceesay: Bathurst named capital 1816–1973. Retrospective evidence is corroborated by the 1930 colonial report's seat-of-government statement; no current-name fallback.
- Nigeria Year Book 1966, printed page 19 / PDF page 21, Governors and Presidents. **Published by Daily Times of Nigeria / Times Press Limited, not by the Nigerian government.** National Library of Nigeria is the digital custodian. The provenance was corrected after inspection of the publication preliminaries. Only complete interior years of Clifford, Bourdillon and Richards are proposed. Initials are retained, not expanded from memory.
- Gambia report 1900, printed page 4, Financial A: colonial revenue £49,160.
- Gambia report 1914, printed page 5 paragraph 11: mixed coin circulation; printed pages 6–7 paragraphs 17/23: August trade disruption and total exports £926,127, including specie.
- Gambia report 1920, printed page 2: July Cameron retirement and Armitage not arrived by year-end; finance table revenue £268,788 for 1920.
- Gambia report 1930, printed pages 3/7/8: Bathurst seat, Palmer administration on 11 September and customs receipts £139,927 for 1930.

The original PDFs and HTML bodies are preserved in the local `cache/` for coordinator review. The 1900/1914/1920/1930 reports are old official publications; the 1966 private yearbook and modern HTML bodies should not be staged as wholesale public copies. Short factual paraphrases with original URLs and locators are proposed. `review-template.json` binds the source files by SHA-256 and remains unsigned.

## Temporal and statistical discipline

All interval claims use year precision only. Complete-year restrictions are research cutoffs, not invented historical transition dates. Governor accession-year boundaries are excluded; year-only Lugard 1914 is held because the only assigned snapshot is the accession year. The yearbook's "G. Thompson" spelling is held for reconciliation rather than silently changed to Thomson. Gambia transition events preserve actual month/day precision but do not fill whole-year leadership with invented acting governors.

Numeric Economy values are contemporary colonial public revenue, customs revenue or export values in nominal pounds. They are not GDP or national income. Exports explicitly include specie. Observation years remain point observations; no interpolation, polygon scope assumption or density derivation is introduced. Four point observations support only their four named snapshot years.

## Deferred evidence

`held.json` preserves nine grouped residual issues: early or 1960 currency chronology; governor/acting arrangements; Sierra Leone/Lagos capital intervals; garbled 1930 finance OCR; population observations already supported; and figures lacking significance/activity evidence. No British sovereign spell is substituted for actual colonial administrator coverage. No ordinary governor is promoted into Important Figures.

## Reproducibility and checks

`build.mjs` generates the worker cohort; `check.mjs` invokes existing deterministic dossier validation without integration. Validation results are in `validation.json`. All 11 grouped packages pass the existing validator; this establishes technical compatibility, not historical acceptance. No runtime/frontend files changed and zero browser checks were used.
