---
slug: mask
title: "Causal masking"
collection: cme295
lecture: 1
lang: en
description: "Why prediction cannot peek at the answer, and why training can still be parallel."
order: 100
kind: lesson
status: published
tags: ["Mask", "Causal"]
---

<section id="mask" class="switch">
<div class="tag">Transformer architecture · Masking / causal self-attention（slide 75）</div>

<p>During training we already have the whole sentence, but we still have to imitate the generation condition. For example, the output at the input position “like” predicts “bears”: it may read “I” and “like”, but not the “bears” that comes after.</p>
<input type="radio" name="mask-pos" id="mask-1">
<input type="radio" name="mask-pos" id="mask-2" checked>
<input type="radio" name="mask-pos" id="mask-3">
<input type="radio" name="mask-pos" id="mask-4">
<div class="controls" role="group" aria-label="Pick an input position"><span>Pick an input position:</span><label for="mask-1">1 · I</label><label for="mask-2">2 · like</label><label for="mask-3">3 · bears</label><label for="mask-4">4 · .</label></div>
<div class="table-wrap"><table class="mask"><caption>Rows = the querying position; columns = positions it may read</caption><thead><tr><th scope="col">Query ↓ / Read →</th><th scope="col">I</th><th scope="col">like</th><th scope="col">bears</th><th scope="col">.</th></tr></thead><tbody><tr><th scope="row">I</th><td class="allowed">readable</td><td class="blocked">masked</td><td class="blocked">masked</td><td class="blocked">masked</td></tr><tr><th scope="row">like</th><td class="allowed">readable</td><td class="allowed">readable</td><td class="blocked">masked</td><td class="blocked">masked</td></tr><tr><th scope="row">bears</th><td class="allowed">readable</td><td class="allowed">readable</td><td class="allowed">readable</td><td class="blocked">masked</td></tr><tr><th scope="row">.</th><td class="allowed">readable</td><td class="allowed">readable</td><td class="allowed">readable</td><td class="allowed">readable</td></tr></tbody></table></div>
<p class="mask-desc desc-1">Position 1 “I” can read: I. Its output predicts the next token, “like”.</p>
<p class="mask-desc desc-2">Position 2 “like” can read: I, like. Its output predicts the next token, “bears”.</p>
<p class="mask-desc desc-3">Position 3 “bears” can read: I, like, bears. Its output predicts the next token, “.”.</p>
<p class="mask-desc desc-4">Position 4 “.” can read all 4 positions. Its output predicts later tokens, for example the end marker.</p>
<div class="note">Scores that may be read keep their value; scores that may not be read are set to −∞ before softmax, so their weights become 0. The lower-triangular shape in the table comes from the rule “only the current and earlier positions”.</div>
<details><summary>If training can be parallel, why is generation still one token at a time?</summary><p>Training text is known, so every input position can be supplied at once and masking blocks future information; the loss at each position is computed together. In autoregressive generation the next token has not been chosen yet, so inputs for later positions do not exist and generation usually proceeds token by token.</p></details>
<p class="source">Slide reference: page 75 and the end-of-class Q&amp;A. This page shows the causal mask; real training may also mask padding positions.</p>
</section>
