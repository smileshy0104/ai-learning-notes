# Learning Repository Guide

## Purpose

This repository stores personal study materials for Stanford CME295 Transformers & LLMs. The supplied course materials identify the edition as Fall 2026.

## Learning preferences

- Write learner-facing explanations in Simplified Chinese, retaining standard English technical terms when useful.
- Explain thoroughly in accessible language. Introduce motivation and intuition before formulas, and define unfamiliar terms.
- Show worked numerical examples and matrix dimensions for mathematical concepts.
- Use standalone, offline HTML visualizations when they make concepts easier to understand. Prefer interactive controls for cause-and-effect explanations.
- Preserve the lecture sequence, including Introduction. Do not silently omit sections when describing a full lecture.
- Keep Markdown notes and HTML explanations consistent, and distinguish course content from supplementary explanations.
- Cite physical PDF page numbers, counting the cover as page 1.
- Label synthetic tokenization, vectors, and outputs as teaching examples rather than real model results.
- Do not mark topics as mastered without evidence from the learner.

## Website architecture

- Publish from `content/collections/**/*.md` through shared templates in `site/lib/`; keep navigation and visual design in the shared layout and theme.
- Register new collections in `content/catalog.json`; new articles should be discoverable without hard-coded page edits.
- Keep the first lecture's 13 content sections present. `catalog.chapters` is its legacy coverage manifest; `catalog.lectures` records the required chapter slugs per lecture.
- **Every new chapter ships Chinese and English together.** A newly published Chinese article must have its `<slug>.en.md` sibling; build fails otherwise. The only exception is the pre-existing backlog listed in `content/translations.json`, which may only shrink — remove an entry as soon as the translation lands, and never add a new article to it without deciding that the translation is genuinely deferred. `npm run i18n:status` lists what is left.
- `npm run new:article` scaffolds both the Chinese and the English draft, so a new chapter cannot start as Chinese-only.
- The site is bilingual: Chinese lives at the root, English under `/en/`. An English article is a sibling file `content/collections/<collection>/<slug>.en.md` with `lang: en`, the same `slug`, `collection`, `lecture` and `order` as its Chinese original; build fails on a missing original or mismatched metadata. English pages exist only when a translation exists, and the language switcher appears only when the counterpart page exists.
- UI copy lives in `site/lib/i18n.mjs` (never hard-code Chinese in `pages.mjs`/`layout.mjs`); scripts receive their strings through `<html data-*>` attributes. Add an English translation by copying the Chinese article, translating frontmatter `title`/`description`/`tags`, and setting `lang: en`.
- A lecture-based collection sets `"lectures": true` in `catalog.collections`; every article in it then declares an explicit positive integer `lecture` (no default) and must appear in that lecture's `catalog.lectures[].chapters`. Build fails on a missing or unregistered chapter. Group collection directories by lecture and scope article siblings to the same lecture.
- Add a lecture by writing its `l<N>-*.md` files and registering one `catalog.lectures` entry (`number`, `title`, `description`, `pages`, `note`, `chapters`) plus one `registerLectureContract({number, labs})` call. Export its combined notes with `npm run notes:lecture -- <n>`; no code or npm script changes are required.
- Interactive experiments are written as `<!-- lab:l<lecture>-<name> -->`; the lecture prefix is required and the name is dispatched by lecture (no fallback). `loadContent` collects each lab's title, and `labs.html` is generated from that registry, so a new lab needs no page edit. Lecture 1's four early diagrams predate lab markers and stay statically listed in `labs()`, but their group heading, description and count still come from `catalog.lectures`; keep every group in ascending lecture order and identical in structure.
- Write a new experiment's explanatory copy in the Markdown article; the renderer only computes numbers and fills panel templates. Never let the module become the only place the explanation exists. Lab templates must render on a single line: the markup is injected before `marked.parse`, so a blank line would let Markdown re-read the copy, and the build rejects any lab output containing a newline.
- Lecture note file names, PDF page counts and chapter lists belong in `catalog.lectures` (`note`, `pages`, `chapters`); export and test code must read them from there instead of hard-coding lecture numbers or file names.
- `catalog.chapters` is the legacy lecture-1 manifest kept only for `tools/import-lecture.mjs`; build asserts it matches `catalog.lectures` lecture 1 exactly.
- Lecture 1 has no catalog `note`; its combined notes stay hand-maintained and the exporter refuses to overwrite them.
- Lecture 2 content lives in `content/collections/cme295/l2-*.md`; regenerate its combined Markdown with `npm run notes:lecture2` after edits. Keep source materials under `materials/cme295/lecture-02/` out of the published build.
- Lecture 3 lives in `content/collections/cme295/l3-*.md`; regenerate its combined notes with `npm run notes:lecture3`. Shared note export is in `tools/export-lecture-notes.mjs`; preserve relative links and keep material hashes current.
- Lecture 4 lives in `content/collections/cme295/l4-*.md`; regenerate its combined notes with `npm run notes:lecture4`. Static experiments use `site/lib/lecture4-examples.mjs` and `site/assets/lecture4.css`; preserve the distinction between current, old, and reference policies.
- Lecture 5 lives in `content/collections/cme295/l5-*.md`; regenerate notes with `npm run notes:lecture5`. Teaching calculations and static experiments live in `site/lib/lecture5-examples.mjs` and `site/assets/lecture5.css`. State memory/throughput assumptions and distinguish exact attention from architecture changes and distribution-preserving sampling.
- Lecture 6 lives in `content/collections/cme295/l6-*.md`; regenerate notes with `npm run notes:lecture6`. Static labs and synthetic calculations live in `site/lib/lecture6-examples.mjs` and `site/assets/lecture6.css`. Distinguish retrieval quality from answer truth, and tool proposals from execution authorization; demos must not call real accounts or devices.
- The original HTML and `demos/` are reference archives, not the current publishing source. Do not rerun `tools/import-lecture.mjs` over edited content files.
- Shared per-lecture invariants (chapter coverage, lab registration, note links, archived hashes) live in `tools/lecture-contract.mjs`; add a lecture by calling `registerLectureContract` with its data instead of copying a test file.
- Colour comes from `light-dark()` design tokens driven by `color-scheme`. Light values must stay exactly as they are; every colour token added to `:root` needs a dark value in the `@supports` palette, and `tools/theme.test.mjs` fails the build otherwise. `site/assets/lesson.css` is generated, so dark overrides for its semantic colours live in `site.css`.
- The site icon lives in `site/assets/icon.svg` (rounded tile + `a.` monogram). `site/assets/icon-32.png` and `icon-180.png` are generated from that SVG by `npm run icons`; regenerate them instead of editing binaries, and keep the full-bleed 180px variant opaque for iOS. Every page must declare the SVG icon, the 32px PNG fallback and one apple-touch-icon.
- `deploy/nginx.conf` must keep `include /etc/nginx/mime.types` (with `X-Content-Type-Options: nosniff`, a wrong type blocks CSS and JS entirely), and `tools/serve-site.mjs` must map the same extensions.
- The repository entry in the top bar lives in `layout.mjs` as `REPO_URL`, which mirrors `git remote get-url origin`; every page must carry exactly one `a.icon-link` linking to GitHub. External `target="_blank"` links must keep `rel="noopener"`.
- The theme toggle is progressive enhancement: the button ships `hidden`, `site/assets/theme.js` reveals it and persists an explicit choice in `localStorage`, and the site still follows the operating system when scripts are blocked. CSP is `script-src 'self'`, so no inline scripts — the early theme script must stay an external file loaded before the stylesheets.
- Use `npm run build`, `npm run check`, and `npm test` for website delivery. Tests use Chrome by default or `PLAYWRIGHT_CHANNEL=chromium` with an installed Playwright browser.
- Run previews with `npm start` (or `npm run preview` after building). Output is static `dist/`; never hand-edit generated pages.
- Framework API guides must declare the tested dependency versions. Current LangChain/LangGraph/Eino overview pages are conceptual introductions, not tested API tutorials.

## Editing and verification

- Store original course PDFs and transcripts together under `materials/<course>/lecture-XX/`, including a README that records original names. Maintain `materials/manifest.json` with sizes and SHA-256 hashes.
- Preserve original PDFs and transcripts; do not rewrite source materials to correct errors.
- Correct subtitle mistranslations in the notes, with the original term where useful.
- Keep links relative so the repository works after moving or cloning.
- Verify changed internal links, JavaScript syntax, and relevant interactive calculations. Report whether actual browser rendering was checked.
- Prefer interactions that still work when JavaScript is disabled: encode toggles as hidden radio inputs with CSS panels, and put any script-only control in a `hidden` element that the script reveals. Preview windows in Finder, editors, and chat apps commonly block scripts.
- Verify HTML changes in both JavaScript-enabled and JavaScript-disabled browser contexts.
- Recompute every numeric example (probabilities, weights, sums, parameter counts) with a script before finalizing; do not copy numbers from reference documents without checking them.
- Treat files under `references/` as source material to cite, not as authoritative text. Quote them sparingly and correct simplifications in the learner-facing explanations.
- Keep source identifiers and code comments in English.
- Do not commit credentials, local runtime logs, caches, or OS metadata.
- Do not create commits, push, or publish materials unless the user authorizes those actions.
