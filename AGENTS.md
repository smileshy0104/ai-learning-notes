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
- Keep the first lecture's 13 content sections present. `catalog.chapters` is its coverage manifest.
- The original HTML and `demos/` are reference archives, not the current publishing source. Do not rerun `tools/import-lecture.mjs` over edited content files.
- Use `npm run build`, `npm run check`, and `npm test` for website delivery. Tests use Chrome by default or `PLAYWRIGHT_CHANNEL=chromium` with an installed Playwright browser.
- Run previews with `npm start` (or `npm run preview` after building). Output is static `dist/`; never hand-edit generated pages.
- Framework API guides must declare the tested dependency versions. Current LangChain/LangGraph/Eino overview pages are conceptual introductions, not tested API tutorials.

## Editing and verification

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
