# Official officeholder tables

Run `node research/bulk-01/worker-tables/extract-officeholders.mjs` to regenerate structured rows from retained original bytes. No network is required. Each row carries the source and cache hash, literal source date range, proposed existing historical entity, existing tenure matches, and separately measured configured-snapshot contribution.

These are untrusted acquisition rows, not accepted dossier claims. The coordinator must independently review mapping, temporal endpoint semantics, year-precision transitions, and duplicates before serialized integration. The House table dates presidents and joint administrations; numbered vice-president death/resignation footnotes override the longer presidential term. Vacancies are preserved, not filled. Source service dates for Tyler/Taylor/Arthur remain explicitly held for accession/oath interpretation. France1848–1851 gallery range is not silently changed to1852.

France and Portugal duplicate controls demonstrate source reuse; they are excluded from novel-throughput counts. Between-snapshot supported tenures can remain useful even when novelSnapshotYears is empty. Source caches are internal provenance; no portrait or site asset acquisition.
