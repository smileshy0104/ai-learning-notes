---
slug: architecture
title: "Encoder and decoder"
collection: cme295
lecture: 1
lang: en
description: "Who reads the source, who writes the translation, and how the two attentions cooperate."
order: 90
kind: lesson
status: published
tags: ["Encoder", "Decoder"]
---

<section id="architecture" class="switch">
<div class="tag">Lecture outline · Transformer architecture（slides 64–78 and 102–115）</div>

<p>The 2017 Transformer was designed for machine translation. It splits the task in two: <strong>read the source sentence</strong> and <strong>write the translation</strong>, handled by an encoder and a decoder. Both are “the same few sublayers stacked N times”; the difference is what they may read and whether they access the other side.</p>

<h2 id="part-2">Concept 1: the encoder</h2>
<p class="def"><strong>Definition:</strong> turn every position of the source sequence into a representation that <strong>contains the context of the whole sentence</strong>. It uses bidirectional self-attention at every position with no causal mask — the first word can see the last.</p>
<p><strong>Why it is needed:</strong> understanding a sentence needs both directions to confirm each other. For example, deciding whether “apple” is a fruit or a company depends on the following “released a new product”.</p>
<div class="flow"><span class="chip">source tokens</span><span class="arrow">→ embedding + positional encoding →</span><span class="chip">self-attention (bidirectional)</span><span class="arrow">→</span><span class="chip">FFN</span><span class="arrow">→ repeat N layers →</span><span class="chip">one contextual representation per source position</span></div>
<p><strong>A common misunderstanding:</strong> the encoder does not “squeeze the sentence into one vector”. It outputs <strong>a set of vectors as long as the source</strong> (one per position), and cross-attention later reads whichever positions it needs.</p>

<h2 id="part-3">Concept 2: the decoder</h2>
<p class="def"><strong>Definition:</strong> from <strong>the target words generated so far</strong> and <strong>the encoder’s representation of the source</strong>, predict the next target token step by step.</p>
<p><strong>Why it is needed:</strong> generation is autoregressive: the t-th word depends on the t−1 words already produced. It has to satisfy two constraints at once — only look left (no peeking at the answer) and still read the original.</p>
<p>Two different attention sublayers do these jobs:</p>
<div class="table-wrap"><table><thead><tr><th>Sublayer</th><th>Q comes from</th><th>K, V come from</th><th>Purpose</th></tr></thead><tbody><tr><th>Masked self-attention</th><td>current decoder representation</td><td>current decoder representation (future masked)</td><td>“what have I written”</td></tr><tr><th>Cross-attention</th><td>current decoder representation</td><td>encoder output</td><td>“which part of the source matters for this word”</td></tr></tbody></table></div>
<p class="small muted">Why cross-attention takes K and V from the encoder rather than the decoder: the decoder is querying the original text — it asks the question (Q) and the encoder supplies matchable features (K) and content (V).</p>

<h2 id="part-4">Concept 3: how the two stacks connect</h2>
<svg viewBox="0 0 860 470" role="img" aria-label="Encoder and decoder structure: encoder layers of self-attention and feed-forward, decoder layers of masked self-attention, cross-attention and feed-forward" style="width:100%;max-width:860px;display:block;margin:16px auto">
<defs>
<marker id="a-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#2166cd"/></marker>
<marker id="a-arrow2" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#c0392b"/></marker>
</defs>
<text x="160" y="22" text-anchor="middle" font-size="14" fill="#193049" font-weight="600">encoder (reads source)</text>
<text x="700" y="22" text-anchor="middle" font-size="14" fill="#193049" font-weight="600">decoder (writes target)</text>
<rect x="50" y="40" width="220" height="42" rx="8" fill="#f6f9fd" stroke="#2166cd"/><text x="160" y="66" text-anchor="middle" font-size="12" fill="#193049">source embedding + position</text>
<rect x="50" y="100" width="220" height="118" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-dasharray="4 3"/>
<text x="160" y="120" text-anchor="middle" font-size="11" fill="#53677b">× N layers</text>
<rect x="65" y="130" width="190" height="32" rx="6" fill="#fff" stroke="#2166cd"/><text x="160" y="150" text-anchor="middle" font-size="12" fill="#193049">self-attention (both ways)</text>
<rect x="65" y="172" width="190" height="32" rx="6" fill="#fff" stroke="#2166cd"/><text x="160" y="192" text-anchor="middle" font-size="12" fill="#193049">feed-forward network</text>
<text x="160" y="238" text-anchor="middle" font-size="11" fill="#53677b">each layer: residual + norm</text>
<rect x="50" y="252" width="220" height="44" rx="8" fill="#eff8f0" stroke="#2e7d32"/>
<text x="160" y="270" text-anchor="middle" font-size="11" fill="#193049">encoder output:</text>
<text x="160" y="286" text-anchor="middle" font-size="11" fill="#193049">one vector per source position</text>
<rect x="590" y="40" width="220" height="42" rx="8" fill="#fff8ec" stroke="#db8b16"/><text x="700" y="59" text-anchor="middle" font-size="12" fill="#193049">target tokens so far</text>
<text x="700" y="74" text-anchor="middle" font-size="11" fill="#53677b">+ position encoding</text>
<rect x="590" y="100" width="220" height="198" rx="10" fill="#fff6e6" stroke="#db8b16" stroke-dasharray="4 3"/>
<text x="700" y="120" text-anchor="middle" font-size="11" fill="#53677b">× N layers</text>
<rect x="605" y="132" width="190" height="34" rx="6" fill="#fff" stroke="#db8b16"/><text x="700" y="153" text-anchor="middle" font-size="11" fill="#193049">masked self-attn (left only)</text>
<rect x="605" y="176" width="190" height="34" rx="6" fill="#fff" stroke="#c0392b"/><text x="700" y="197" text-anchor="middle" font-size="11" fill="#193049">cross-attn (reads encoder)</text>
<rect x="605" y="220" width="190" height="34" rx="6" fill="#fff" stroke="#db8b16"/><text x="700" y="241" text-anchor="middle" font-size="11" fill="#193049">feed-forward network</text>
<text x="700" y="280" text-anchor="middle" font-size="11" fill="#53677b">each layer: residual + norm</text>
<rect x="590" y="316" width="220" height="40" rx="8" fill="#f6f9fd" stroke="#2166cd"/><text x="700" y="341" text-anchor="middle" font-size="11" fill="#193049">linear → softmax → next token</text>
<path d="M160 82 V100" fill="none" stroke="#2166cd" stroke-width="2" marker-end="url(#a-arrow)"/>
<path d="M160 218 V252" fill="none" stroke="#2166cd" stroke-width="2" marker-end="url(#a-arrow)"/>
<path d="M700 82 V100" fill="none" stroke="#db8b16" stroke-width="2" marker-end="url(#a-arrow)"/>
<path d="M700 298 V316" fill="none" stroke="#db8b16" stroke-width="2" marker-end="url(#a-arrow)"/>
<path d="M270 274 C 380 274 480 240 605 198" fill="none" stroke="#c0392b" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#a-arrow2)"/>
<text x="430" y="330" text-anchor="middle" font-size="11" fill="#c0392b">red: Q from decoder, K/V from encoder</text>
<text x="430" y="350" text-anchor="middle" font-size="10" fill="#53677b">the decoder asks; the encoder supplies features and content</text>
<text x="430" y="430" text-anchor="middle" font-size="11" fill="#53677b">left half reads the source; right half runs while writing</text>
</svg>
<p>Three details that are easy to miss:</p>
<ul><li><strong>Every decoder layer reads the encoder output again</strong>, not only the first layer.</li><li><strong>Each decoder layer has three blocks</strong>: masked self-attention → cross-attention → FFN, each followed by residual and normalisation.</li><li><strong>Encoder and decoder can have the same depth</strong> (the paper’s base model uses N = 6), but they do not share parameters.</li></ul>
<p>Paper base configuration: N = 6, d_model = 512, h = 8, d_ff = 2048, d_k = d_v = 64, about 6.5×10⁷ parameters.</p>

<h2 id="part-5">Concept 4: the data flow of one complete translation</h2>
<div class="table-wrap"><table><thead><tr><th>Step</th><th>What happens</th><th>Shape (base configuration, source length m, target length n)</th></tr></thead><tbody>
<tr><td>①</td><td>Tokenise the source → embedding + positional encoding</td><td>m × 512</td></tr>
<tr><td>②</td><td>N encoder layers: self-attention → FFN</td><td>m × 512</td></tr>
<tr><td>③</td><td>Encoder output (one representation per source position)</td><td>m × 512</td></tr>
<tr><td>④</td><td>Decoder input: <code>[BOS]</code> + generated words, plus positional encoding</td><td>n × 512</td></tr>
<tr><td>⑤</td><td>Masked self-attention (left side only)</td><td>n × 512</td></tr>
<tr><td>⑥</td><td>Cross-attention: Q from ⑤, K/V from ③</td><td>n × 512</td></tr>
<tr><td>⑦</td><td>FFN; repeat N layers</td><td>n × 512</td></tr>
<tr><td>⑧</td><td>Linear projection to the vocabulary V → softmax → probability of the next token</td><td>n × V</td></tr>
</tbody></table></div>
<p>Note the shape at step ⑥: Q is n × d_k and K is m × d_k, so the score matrix is <strong>n × m</strong> — rows are the word being written, columns are source positions. That also explains why a long source increases decoding cost.</p>

<h2 id="part-6">Concept 5: generation is a loop, not one sentence at a time</h2>
<p>In training the target text is known, so the whole sentence can be fed in and the loss computed in parallel with the causal mask; <strong>at inference there is no answer</strong>, so it goes one step at a time:</p>
<input type="radio" name="gen" id="gen-1" checked>
<input type="radio" name="gen" id="gen-2">
<input type="radio" name="gen" id="gen-3">
<input type="radio" name="gen" id="gen-4">
<div class="controls" role="group" aria-label="Generation step"><span>Step:</span><label for="gen-1">step 1</label><label for="gen-2">step 2</label><label for="gen-3">step 3</label><label for="gen-4">step 4</label></div>
<div class="panel panel-gen1">
<div class="flow"><span class="chip">[BOS]</span><span class="chip muted-chip">?</span></div>
<p>After reading this single position, the output layer scores the whole vocabulary; the highest probability is <strong>Un</strong>.</p>
<p class="small muted">In the first step only the start marker is available, and the model produces the first word.</p>
</div>
<div class="panel panel-gen2">
<div class="flow"><span class="chip">[BOS]</span><span class="chip">Un</span><span class="chip muted-chip">?</span></div>
<p>After reading these two positions, the output layer scores the whole vocabulary; the highest probability is <strong>ours</strong>.</p>
<p class="small muted">Append the word just generated and predict the next one.</p>
</div>
<div class="panel panel-gen3">
<div class="flow"><span class="chip">[BOS]</span><span class="chip">Un</span><span class="chip">ours</span><span class="chip muted-chip">?</span></div>
<p>After reading these three positions, the highest probability over the vocabulary is <strong>en</strong>.</p>
<p class="small muted">Each extra word lengthens the decoder input by one.</p>
</div>
<div class="panel panel-gen4">
<div class="flow"><span class="chip">[BOS]</span><span class="chip">Un</span><span class="chip">ours</span><span class="chip">en</span><span class="chip muted-chip">?</span></div>
<p>After reading these four positions, the highest probability is <strong>peluche</strong>.</p>
<p class="small muted">Note that earlier words can be read again: they all sit to the left.</p>
</div>
<p>It stops when the model emits <code>[EOS]</code> (or hits a length limit). That is also why training can be parallel while generation must be serial.</p>

<h2 id="part-7">Concept 6: three architectures = which parts of this structure survive</h2>
<div class="table-wrap"><table><thead><tr><th>Architecture</th><th>Kept</th><th>Typical models</th><th>Good at</th></tr></thead><tbody><tr><th>Encoder–Decoder</th><td>①–⑧ in full</td><td>original Transformer, T5, BART</td><td>translation, summarisation: input → output transforms</td></tr><tr><th>Encoder-only</th><td>①–③, bidirectional</td><td>BERT</td><td>understanding tasks: classification, extraction, retrieval</td></tr><tr><th>Decoder-only</th><td>④–⑧ without cross-attention</td><td>GPT, LLaMA, Qwen</td><td>continuation and chat; understanding expressed as generation</td></tr></tbody></table></div>
<p>Lecture 1 covers the first row. Today’s mainstream models are mostly the third row: <strong>no separate encoder, and the input joins self-attention as part of the sequence</strong>.</p>

<div class="note"><strong>Two softmaxes, two jobs:</strong> the softmax inside attention normalises over “positions that may be read”, deciding how much to read; the softmax at the output layer normalises over “the whole vocabulary”, deciding which word comes next.</div>
<p class="source">Slide map: pages 64–78 and 102–115. The structure diagram is redrawn from the slides; the base configuration numbers and shape derivations are supplementary. The three-architecture comparison also appears in the outlook section.</p>
</section>
