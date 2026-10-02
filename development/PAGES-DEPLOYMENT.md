# Pages deployment boundary and text encoding

GitHub Pages builds this repository's main branch with Jekyll. The static app needs root HTML/JavaScript/CSS, production `data/` JSON, and licensed `assets/`. `_config.yml` excludes research, development, scripts, tests and dependency/build material from conversion and deployment. Keep these exclusions when adding internal tooling. Do not add `.nojekyll` alongside this configuration: bypassing Jekyll would also bypass its exclusions and publish internal material unnecessarily.

The October2026 build failures were caused by one Windows-1252 en dash byte (`0x96`) in `research/scale-01/README.md`. It was converted with a Windows-1252 decoder to UTF-8, preserving the complete text. The historical downloaded Mexico currency HTML explicitly declares ISO-8859-1 and retains its original evidence bytes; it is not an authored UTF-8 document and is never Pages input.

Author text in UTF-8: Node `fs.writeFileSync(..., 'utf8')`/the existing UTF-8 JSON writer, or PowerShell with explicit UTF-8 encoding. Do not use an ANSI/default-codepage writer for authored Markdown. `.editorconfig` declares UTF-8 with explicit exceptions for immutable downloaded evidence. `node scripts/pages-safety.mjs` performs strict decoding of tracked authored Markdown, JavaScript, JSON, CSS, YAML, SVG and website HTML. The lightweight Authored text encoding workflow runs this check on push and pull request. It does not rewrite historical evidence or silently replace invalid characters.

After a deployment change, verify the actual `pages build and deployment` run for the pushed SHA, then check the live page and production JSON. A local check alone does not establish deployment success.
