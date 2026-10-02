# Important Figures full-source safe-yield test

## Result: no automatic production tranche justified

The full cross-verified dataset was acquired from its official Sciences Po Dataverse, DOI 10.21410/7E4/RDAG3O, file 4432 (261,545,417 compressed bytes). All **2,291,817 records** were examined computationally. The original compressed source stays locally cached and ignored by Git. Pantheon 1.0's full 11,341-person biography table was acquired from Harvard Dataverse, DOI 10.7910/DVN/28201, file 2717642. Source metadata, licences and byte hashes are preserved.

The conservative screening found:

- 1,302,990 cleanly decoded people with lifespan overlap in 1800–1960;
- 579,060 of those with at least two Wikipedia editions;
- 5,444 matched independently to Pantheon by page identifier AND normalized name;
- 3,897 after excluding generic political officeholding and sports as automatic significance routes;
- 3,371 candidate person/entity/snapshot associations through exact geographic-attachment/name matching and alive-adult snapshot screening;
- 103 distinct candidate atlas slots, including two already supported and 101 unresolved;
- **zero exact/high-confidence dated historical associations established by these dataset fields alone; zero safe automatic new slots**.

The 333 records containing undecodable UTF-8 bytes were separately held without repairing names or changing original bytes. Candidate counts exclude these records. The window test permits earlier-born people alive after 1800; it is not a birth-year-only selection. Adults alive in a snapshot are only candidates, never automatically asserted to be active or significant in that snapshot. A missing death date does not supply an invented lifespan endpoint for snapshot association.

The source has useful occupation, lifetime, notability and undated geographic attachment/citizenship fields. Pantheon supplies independently curated significance, occupation and birthplace. Neither supplies the dated activity/contribution and historical entity association required by the production schema. Birthplace, country attachment or modern citizenship are not substituted for these missing facts. Even famous names can be emigrants, exiles or active elsewhere. These unresolved questions remain held; no individual biography research or agent workload was launched.

This is a safe-yield result for the specified full sources and conservative automatic joins, **not** a finding that these people lack historical relevance or that future source-wide corroboration cannot succeed. Exact name joins are candidate reconciliation, not adjudicated historical identities. Unmatched and alias-dependent associations also require evidence. The 101 potential unresolved slots must not be reported as completed gains.

## Preservation and next decision

Production remains exactly at checkpoint 4006074d8e12765d09a0239deb3f0b74d21e443c: 3,725 accepted claims; 7,058 supported/resolved slots; Evidence Coverage and Research Resolution 44.55808%; 8,782 unresolved. No new claims, frontend edits, Population/Density work or browser checks. No production integration or new deployment is needed for this result.

The bounded held queue retains the three strongest Pantheon-HPI candidates per matched slot, with source identity, lifespan, occupation and geographic attachment explicitly labelled candidate-only. Do not integrate it without independently supported dated association, activity and contribution. Do not restart the full download/scan. Given the current lack of automatic historical-association evidence, stop this source operation rather than launching expensive individual review. A future source-wide dataset with dated residence/activity/contribution or appropriately historical citizenship could unlock this pool; do not manufacture those intervals from lifespan.

## Attribution and reuse

Cross-verified dataset and its selected candidate excerpts: © Laouenan, Bhargava, Eyméoud, Gergaud, Plique and Wasmer; **CC BY-SA 4.0**, https://creativecommons.org/licenses/by-sa/4.0/. Source: https://doi.org/10.21410/7E4/RDAG3O. Descriptor: https://doi.org/10.1038/s41597-022-01369-4. Selected records were filtered, normalized for candidate matching and ranked; no historical meaning was changed. Candidate excerpts/derived screening reports retain this attribution and share-alike licence.

Pantheon 1.0 dataset: Yu, Ronen, Hu, Lu and Hidalgo; official Dataverse metadata specifies **CC0 1.0**, https://doi.org/10.7910/DVN/28201. Descriptor: https://doi.org/10.1038/sdata.2015.75. General global-notability and geographic biases remain relevant; these are not exhaustive balanced lists of historically important people.
