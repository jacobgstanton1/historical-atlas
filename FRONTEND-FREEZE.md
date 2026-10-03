# Frontend freeze

The approved visual design and this productisation checkpoint establish the frontend as stable/frozen.

Future work should focus on historical data acquisition. Change the frontend only for a demonstrable UI bug, a required historical-data capability that the existing presentation cannot display, or an explicit user request. Preserve the map, palette, labels, dossier semantics, canonical section order and configured snapshots. No Compare Dates or What Changed features are authorized by this checkpoint.

## Navigation contract

Deep links use `?year=1938&territory=entity-france`. The territory is the existing stable map identity; the historical resolver still determines its dated entity/framework. It is not an assertion of modern national continuity.

Years remain requested historical years. The nearest configured boundary snapshot is identified separately. Valid years are 1800–1960; missing/malformed/out-of-range values use the normal 1938 landing year. A malformed, unknown or absent territory does not select a modern substitute. Unrelated query parameters are retained. Internal dossier-source fragments are removed when generating a new atlas navigation/share URL; citation navigation itself remains available.

Meaningful year changes, selection and deselection create history entries. Slider drags and playback use one evolving entry, replaced during subsequent updates; Back restores the earlier meaningful state. Back/Forward restore year and selection without creating extra entries. Source-anchor history does not rerender/close the current dossier. A boundary-load failure retains a requested deep link for retry.

## Sharing and information

Share uses the native Web Share API when available; cancellation is quiet. Otherwise it copies the canonical current year/territory URL. Clipboard denial offers a selectable link in the panel. Feedback is visible on the control and announced through a polite live region. No external service, analytics or social toolbar is introduced.

About uses a native modal dialog with focus containment, Escape, close control and focus return. It explains selected year, boundary snapshot, fact applicability, observation dates, scope and uncertainty in user-facing terms. Per-dossier Sources & Methodology remains the detailed provenance interface.

Static site metadata describes the atlas without completeness claims. Open Graph/Twitter summary metadata and canonical site URL describe the general site; this static Pages implementation does not generate territory-specific server-side preview cards. The existing lightweight inline site icon is retained. No decorative social image or dependencies were added.

## Focused verification

Run `node --test tests/atlas-state.test.mjs tests/dossier-canonical.test.mjs tests/dossier-cleanup.test.mjs tests/territory-v2.test.mjs`.

Run `node scripts/frontend-polish-browser.mjs --product` locally and add `--live` after deploying. The browser helper distinguishes existing optional local-boundary 404 requests (followed by successful remote fallback) from actual runtime errors. Native share paths are tested with a deterministic stub, without opening an OS share destination; clipboard and manual fallback are exercised separately.

Verify exact GitHub Pages commit success and deployed file equality, then verify main is clean and synchronized. Do not acquire or modify historical data during frontend checks.
