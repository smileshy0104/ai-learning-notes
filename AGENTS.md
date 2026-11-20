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
- CME295 articles carry a positive integer `lecture` field (legacy missing values default to 1). Group collection directories by lecture and scope article siblings to the same lecture.
- Lecture 2 content lives in `content/collections/cme295/l2-*.md`; regenerate its combined Markdown with `npm run notes:lecture2` after edits. Keep source materials under `materials/cme295/lecture-02/` out of the published build.
- Lecture 3 lives in `content/collections/cme295/l3-*.md`; regenerate its combined notes with `npm run notes:lecture3`. Shared note export is in `tools/export-lecture-notes.mjs`; preserve relative links and keep material hashes current.
- Lecture 4 lives in `content/collections/cme295/l4-*.md`; regenerate its combined notes with `npm run notes:lecture4`. Static experiments use `site/lib/lecture4-examples.mjs` and `site/assets/lecture4.css`; preserve the distinction between current, old, and reference policies.
- Lecture 5 lives in `content/collections/cme295/l5-*.md`; regenerate notes with `npm run notes:lecture5`. Teaching calculations and static experiments live in `site/lib/lecture5-examples.mjs` and `site/assets/lecture5.css`. State memory/throughput assumptions and distinguish exact attention from architecture changes and distribution-preserving sampling.
- Lecture 6 lives in `content/collections/cme295/l6-*.md`; regenerate notes with `npm run notes:lecture6`. Static labs and synthetic calculations live in `site/lib/lecture6-examples.mjs` and `site/assets/lecture6.css`. Distinguish retrieval quality from answer truth, and tool proposals from execution authorization; demos must not call real accounts or devices.
- The original HTML and `demos/` are reference archives, not the current publishing source. Do not rerun `tools/import-lecture.mjs` over edited content files.
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
