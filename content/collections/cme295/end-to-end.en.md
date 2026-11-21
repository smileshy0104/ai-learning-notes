---
slug: end-to-end
title: "End-to-end translation example"
collection: cme295
lecture: 1
lang: en
description: "Start from one English sentence and follow tokenisation, embedding, encoding and step-by-step generation."
order: 110
kind: lesson
status: published
tags: ["Translation", "End-to-end"]
---

<section id="end-to-end">
<div class="tag">Lecture outline · End-to-end example（slides 79–115）</div>

<p>From here the slides stop covering parts separately and walk through one complete run. To keep the shapes visible, the embedding dimension below is d = 4 (real models often use 512–4096) and the vocabulary is deliberately tiny. The numbers are teaching examples; the flow matches the slides.</p>

<h2 id="part-2">Step 1: tokenise and add boundary markers</h2>
<div class="flow"><span class="chip">[BOS]</span><span class="chip">A</span><span class="chip">cute</span><span class="chip">teddy bear</span><span class="chip">is</span><span class="chip">reading</span><span class="chip">.</span><span class="chip">[EOS]</span></div>
<p>The source sentence becomes 7 tokens (including punctuation and <code>[EOS]</code>, but not <code>[BOS]</code>, which is only a boundary marker); sequence length m = 7.</p>

<h2 id="part-3">Step 2: look up embeddings and add positional encodings</h2>
<div class="table-wrap"><table><caption>An embedding is “take the row for that ID”; positional encodings are added position by position (positions start at 0; only the first 5 are listed)</caption><thead><tr><th>Position (from 0)</th><th>token</th><th>example ID</th><th>embedding (d = 4)</th><th>positional encoding</th><th>sum</th></tr></thead><tbody>
<tr><th>0</th><td>A</td><td>31</td><td>[0.2, −0.1, 0.4, 0.0]</td><td>[0.00, 1.00, 0.00, 1.00]</td><td>[0.2, 0.9, 0.4, 1.0]</td></tr>
<tr><th>1</th><td>cute</td><td>7</td><td>[0.5, 0.3, −0.2, 0.1]</td><td>[0.84, 0.54, 0.01, 1.00]</td><td>[1.34, 0.84, −0.19, 1.10]</td></tr>
<tr><th>2</th><td>teddy bear</td><td>412</td><td>[0.6, 0.2, 0.1, −0.3]</td><td>[0.91, −0.42, 0.02, 1.00]</td><td>[1.51, −0.22, 0.12, 0.70]</td></tr>
<tr><th>3</th><td>is</td><td>9</td><td>[0.1, 0.4, 0.3, 0.2]</td><td>[0.14, −0.99, 0.03, 1.00]</td><td>[0.24, −0.59, 0.33, 1.20]</td></tr>
<tr><th>4</th><td>reading</td><td>88</td><td>[0.3, −0.2, 0.6, 0.4]</td><td>[−0.76, −0.65, 0.04, 1.00]</td><td>[−0.46, −0.85, 0.64, 1.40]</td></tr>
</tbody></table></div>
<p class="small muted">The positional encodings come from the sine/cosine formulas (the first dimensions when d = 4); they only illustrate “add dimensions of the same index”. Real implementations handle the whole matrix at once.</p>

<h2 id="part-4">Step 3: the encoder turns every source position into a contextual representation</h2>
<div class="flow"><span class="chip">7 × 4 matrix</span><span class="arrow">→ self-attention (7×7 weights) →</span><span class="chip">residual + norm</span><span class="arrow">→</span><span class="chip">FFN</span><span class="arrow">→ ×N layers →</span><span class="chip">7 × 4 contextual representations</span></div>
<p>The key point: the output is still <strong>7 vectors</strong> — one per source position — not “one vector per sentence”. After this step, each position already mixes information from the whole sentence.</p>

<h2 id="part-5">Step 4: the decoder starts generating; the first input is only [BOS]</h2>
<div class="flow"><span class="chip">[BOS]</span><span class="arrow">→ masked self-attention (sees only itself) →</span><span class="chip">cross-attention (reads all 7 encoder positions)</span><span class="arrow">→ FFN →</span><span class="chip">linear → softmax</span><span class="arrow">→ pick</span><span class="chip">Un</span></div>
<p>In the cross-attention step the decoder uses its current state as a query into the 7 source positions to find the most relevant information. You can read it as asking: “to start translating this sentence, where should I look first?”</p>

<h2 id="part-6">Step 5: append the new word and repeat until [EOS]</h2>
<div class="table-wrap"><table><caption>Each round appends the freshly generated French word to the decoder input</caption><thead><tr><th>Round</th><th>decoder input</th><th>output</th><th>most-attended source word (illustrative)</th></tr></thead><tbody>
<tr><th>1</th><td>[BOS]</td><td>Un</td><td>A</td></tr>
<tr><th>2</th><td>[BOS] Un</td><td>ours</td><td>teddy bear</td></tr>
<tr><th>3</th><td>[BOS] Un ours</td><td>en</td><td>teddy bear</td></tr>
<tr><th>4</th><td>[BOS] Un ours en</td><td>peluche</td><td>teddy bear</td></tr>
<tr><th>5</th><td>[BOS] Un ours en peluche</td><td>mignon</td><td>cute</td></tr>
<tr><th>6</th><td>… peluche mignon</td><td>lit</td><td>is / reading</td></tr>
<tr><th>7</th><td>… lit</td><td>[EOS]</td><td>—</td></tr>
</tbody></table></div>
<p>The result is <strong>Un ours en peluche mignon lit.</strong> Note the different word order: French puts the modifier after the noun, so the model is not aligning word by word — it re-decides where to look at every generated word.</p>

<h2 id="part-7">Step 6: training versus inference</h2>
<div class="table-wrap"><table><thead><tr><th>Aspect</th><th>During training</th><th>During inference</th></tr></thead><tbody><tr><th>decoder input</th><td>The complete target sentence (shifted right by one)</td><td>Only what has been generated</td></tr><tr><th>Parallel?</th><td>Yes — causal masking blocks the future</td><td>No — one word at a time</td></tr><tr><th>Loss</th><td>Cross-entropy at every position, then averaged</td><td>No loss</td></tr><tr><th>Stop condition</th><td>Decided by the data; [EOS] is already present</td><td>The model emits [EOS] or hits a length limit</td></tr></tbody></table></div>
<div class="note"><strong>One sentence for this section:</strong> the encoder turns the source sentence into “7 vectors that understand context”; the decoder carries the translation written so far, pulls information from those vectors round after round, and emits one word per round until it is done.</div>
<p class="source">Slide map: pages 79–115. The embedding and positional-encoding values are teaching examples, and the French alignment is illustrative; the data flow corresponds to the diagrams the slides unfold step by step, and to the ①–⑧ steps in supplementary reading 2.4.</p>
</section>
