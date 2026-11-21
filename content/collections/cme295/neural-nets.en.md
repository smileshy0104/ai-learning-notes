---
slug: neural-nets
title: "Word2Vec, RNN and LSTM"
collection: cme295
lecture: 1
lang: en
description: "From shallow networks to sequence modelling, and the motivation for early attention."
order: 60
kind: lesson
status: published
tags: ["RNN", "LSTM", "Word2Vec"]
---

<section id="neural-nets" class="switch">
<div class="tag">Pre-Transformer · Word2vec / RNN / LSTM / early attention（slides 34–55）</div>

<p>So far text became tokens, then vectors, and positions turned into contextual representations — but the <strong>neural network itself</strong> has not appeared yet. The slides use three pictures to trace this history: Word2vec learns word vectors → RNN handles order → attention solves long-range dependencies.</p>

<h2 id="part-2">1. Word2vec: a very narrow neural network</h2>
<p>Slide 35 shows only three layers: input size V, hidden size d, output size V. That middle layer is the word vector we want.</p>
<svg viewBox="0 0 800 290" role="img" aria-label="Word2vec network: V-dimensional one-hot input, d-dimensional hidden layer, V-dimensional output probabilities" style="width:100%;height:auto;max-width:720px;display:block;margin:14px auto">
<text x="150" y="14" font-size="13" text-anchor="middle" fill="#53677b">input one-hot (V=6)</text>
<text x="390" y="14" font-size="13" text-anchor="middle" fill="#53677b">hidden (d=2)</text>
<text x="630" y="14" font-size="13" text-anchor="middle" fill="#53677b">output softmax (V=6)</text>
<line x1="166" y1="30" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="30" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="64" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="64" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="98" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="98" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="132" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="132" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="166" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="166" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="200" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="200" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="30" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="64" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="98" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="132" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="166" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="200" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="30" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="64" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="98" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="132" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="166" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="200" stroke="#c9d8ea" stroke-width="1"/>
<circle cx="150" cy="30" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="150" cy="64" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="150" cy="98" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="150" cy="132" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="150" cy="166" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="150" cy="200" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/>
<circle cx="390" cy="95" r="16" fill="#fff6e6" stroke="#db8b16" stroke-width="1.5"/><circle cx="390" cy="165" r="16" fill="#fff6e6" stroke="#db8b16" stroke-width="1.5"/>
<circle cx="630" cy="30" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="630" cy="64" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="630" cy="98" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="630" cy="132" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="630" cy="166" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="630" cy="200" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/>
<text x="124" y="35" font-size="13" text-anchor="end" fill="#193049">A</text><text x="124" y="69" font-size="13" text-anchor="end" fill="#193049">cute</text><text x="124" y="103" font-size="13" text-anchor="end" fill="#193049">teddy bear</text><text x="124" y="137" font-size="13" text-anchor="end" fill="#193049">is</text><text x="124" y="171" font-size="13" text-anchor="end" fill="#193049">reading</text><text x="124" y="205" font-size="13" text-anchor="end" fill="#193049">.</text><text x="656" y="35" font-size="13" fill="#193049">A</text><text x="656" y="69" font-size="13" fill="#193049">cute</text><text x="656" y="103" font-size="13" fill="#193049">teddy bear</text><text x="656" y="137" font-size="13" fill="#193049">is</text><text x="656" y="171" font-size="13" fill="#193049">reading</text><text x="656" y="205" font-size="13" fill="#193049">.</text>
<text x="270" y="258" font-size="12" text-anchor="middle" fill="#53677b">weights W₁: V×d</text>
<text x="510" y="258" font-size="12" text-anchor="middle" fill="#53677b">weights W₂: d×V</text>
</svg>
<p>Training is not doing a real task such as “translation” or “classification” but a <strong>proxy task</strong>: given a word, predict its neighbours or the next word. The prediction itself does not matter; what matters is that afterwards the hidden-layer numbers become meaningful.</p>
<p>Slides 36–41 demo one sentence: use “A” to predict “cute”. Toggle the two stages to see how the numbers change (teaching numbers, used to show the direction of change):</p>
<input type="radio" name="w2v" id="w2v-1" checked>
<input type="radio" name="w2v" id="w2v-2">
<div class="controls" role="group" aria-label="Word2vec before and after training"><span>Stage:</span><label for="w2v-1">before training (initial weights)</label><label for="w2v-2">after training (several updates)</label></div>
<div class="panel panel-w2v1">
<div class="grid"><div><h3 id="part-3">Output layer: probability of the next token</h3><div class="bars"><div class="barrow"><span>A</span><div class="track"><div class="fill" style="width:15%"></div></div><span>15%</span></div><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:40%"></div></div><span>40%</span></div><div class="barrow"><span>teddy bear</span><div class="track"><div class="fill" style="width:15%"></div></div><span>15%</span></div><div class="barrow"><span>is</span><div class="track"><div class="fill" style="width:10%"></div></div><span>10%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:10%"></div></div><span>10%</span></div><div class="barrow"><span>.</span><div class="track"><div class="fill" style="width:10%"></div></div><span>10%</span></div></div></div>
<div><h3 id="part-4">Compare with the target</h3>
<div class="table-wrap"><table><thead><tr><th>Item</th><th>Value</th></tr></thead><tbody>
<tr><th scope="row">input</th><td>“A” → [1,0,0,0,0,0]</td></tr>
<tr><th scope="row">hidden layer d=2</th><td>a learnable vector</td></tr>
<tr><th scope="row">target</th><td>“cute” → [0,1,0,0,0,0]</td></tr>
<tr><th scope="row">probability of cute</th><td>40%</td></tr>
<tr><th scope="row">cross-entropy loss</th><td>−ln(0.4) ≈ 0.916</td></tr>
</tbody></table></div>
<p>The model gives “cute” only 0.40, far from the target [0,1,0,0,0,0], so the cross-entropy loss is high.</p>
</div></div>
</div>
<div class="panel panel-w2v2">
<div class="grid"><div><h3 id="part-5">Output layer: probability of the next token</h3><div class="bars"><div class="barrow"><span>A</span><div class="track"><div class="fill" style="width:5%"></div></div><span>5%</span></div><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:76%"></div></div><span>76%</span></div><div class="barrow"><span>teddy bear</span><div class="track"><div class="fill" style="width:5%"></div></div><span>5%</span></div><div class="barrow"><span>is</span><div class="track"><div class="fill" style="width:6%"></div></div><span>6%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:4%"></div></div><span>4%</span></div><div class="barrow"><span>.</span><div class="track"><div class="fill" style="width:4%"></div></div><span>4%</span></div></div></div>
<div><h3 id="part-6">Compare with the target</h3>
<div class="table-wrap"><table><thead><tr><th>Item</th><th>Value</th></tr></thead><tbody>
<tr><th scope="row">input</th><td>“A” → [1,0,0,0,0,0]</td></tr>
<tr><th scope="row">hidden layer d=2</th><td>a learnable vector</td></tr>
<tr><th scope="row">target</th><td>“cute” → [0,1,0,0,0,0]</td></tr>
<tr><th scope="row">probability of cute</th><td>76%</td></tr>
<tr><th scope="row">cross-entropy loss</th><td>−ln(0.76) ≈ 0.274</td></tr>
</tbody></table></div>
<p>With the same input “A”, the model now gives “cute” 0.76 and the loss falls. The hidden vector changes with it.</p>
</div></div>
</div>
<div class="note">Why does this learn meaning? Because words that often appear in similar contexts get pushed towards similar hidden vectors by the same weights. The lecture’s example is “teddy bear is to soft” and “Paris is to France, Berlin is to Germany” — relations that are not hand-labelled but emerge during training.</div>
<details><summary>What is the cross-entropy loss doing here?</summary><p>The target is the one-hot vector for “cute”; the model outputs 6 probabilities. Cross-entropy only cares how much probability the target gets: closer to 1 means a smaller loss. After backpropagation both W₁ and W₂ change so that next time the same input gives “cute” a higher probability.</p><p>The slides write the hidden layer as a 2-D vector such as [0.2, 0.9]. Real models use d from several hundred to several thousand.</p></details>

<h2 id="part-7">2. RNN: bringing order information in</h2>
<p>Word vectors alone do not know word order: “the child holds the teddy bear” and “the teddy bear holds the child” produce the same set of vectors. An RNN passes along “what has been read” through a <strong>hidden state</strong>:</p>
<div class="math">h_t = f(h_{t-1}, x_t)</div>
<svg viewBox="0 0 800 200" role="img" aria-label="RNN unrolled over time: each step takes the current token and the previous hidden state, and outputs a new hidden state" style="width:100%;height:auto;max-width:720px;display:block;margin:14px auto">
<defs>
<marker id="rnn-in" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#53677b"/></marker>
<marker id="rnn-h" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#db8b16"/></marker>
</defs>
<text x="400" y="18" font-size="12" text-anchor="middle" fill="#53677b">orange arrows = hidden state h; grey arrows = current input token</text>
<rect x="36" y="80" width="88" height="52" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><text x="80" y="112" font-size="15" text-anchor="middle" fill="#193049">RNN</text><line x1="80" y1="150" x2="80" y2="134" stroke="#53677b" stroke-width="1.4" marker-end="url(#rnn-in)"/><text x="80" y="170" font-size="14" text-anchor="middle" fill="#193049">A</text><text x="80" y="46" font-size="12" text-anchor="middle" fill="#db8b16">h1</text><line x1="80" y1="80" x2="80" y2="60" stroke="#db8b16" stroke-width="1.4" marker-end="url(#rnn-h)"/><line x1="124" y1="106" x2="181" y2="106" stroke="#db8b16" stroke-width="1.6" marker-end="url(#rnn-h)"/><rect x="181" y="80" width="88" height="52" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><text x="225" y="112" font-size="15" text-anchor="middle" fill="#193049">RNN</text><line x1="225" y1="150" x2="225" y2="134" stroke="#53677b" stroke-width="1.4" marker-end="url(#rnn-in)"/><text x="225" y="170" font-size="14" text-anchor="middle" fill="#193049">cute</text><text x="225" y="46" font-size="12" text-anchor="middle" fill="#db8b16">h2</text><line x1="225" y1="80" x2="225" y2="60" stroke="#db8b16" stroke-width="1.4" marker-end="url(#rnn-h)"/><line x1="269" y1="106" x2="326" y2="106" stroke="#db8b16" stroke-width="1.6" marker-end="url(#rnn-h)"/><rect x="326" y="80" width="88" height="52" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><text x="370" y="112" font-size="15" text-anchor="middle" fill="#193049">RNN</text><line x1="370" y1="150" x2="370" y2="134" stroke="#53677b" stroke-width="1.4" marker-end="url(#rnn-in)"/><text x="370" y="170" font-size="14" text-anchor="middle" fill="#193049">teddy bear</text><text x="370" y="46" font-size="12" text-anchor="middle" fill="#db8b16">h3</text><line x1="370" y1="80" x2="370" y2="60" stroke="#db8b16" stroke-width="1.4" marker-end="url(#rnn-h)"/><line x1="414" y1="106" x2="471" y2="106" stroke="#db8b16" stroke-width="1.6" marker-end="url(#rnn-h)"/><rect x="471" y="80" width="88" height="52" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><text x="515" y="112" font-size="15" text-anchor="middle" fill="#193049">RNN</text><line x1="515" y1="150" x2="515" y2="134" stroke="#53677b" stroke-width="1.4" marker-end="url(#rnn-in)"/><text x="515" y="170" font-size="14" text-anchor="middle" fill="#193049">is</text><text x="515" y="46" font-size="12" text-anchor="middle" fill="#db8b16">h4</text><line x1="515" y1="80" x2="515" y2="60" stroke="#db8b16" stroke-width="1.4" marker-end="url(#rnn-h)"/><line x1="559" y1="106" x2="616" y2="106" stroke="#db8b16" stroke-width="1.6" marker-end="url(#rnn-h)"/><rect x="616" y="80" width="88" height="52" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><text x="660" y="112" font-size="15" text-anchor="middle" fill="#193049">RNN</text><line x1="660" y1="150" x2="660" y2="134" stroke="#53677b" stroke-width="1.4" marker-end="url(#rnn-in)"/><text x="660" y="170" font-size="14" text-anchor="middle" fill="#193049">reading</text><text x="660" y="46" font-size="12" text-anchor="middle" fill="#db8b16">h5</text><line x1="660" y1="80" x2="660" y2="60" stroke="#db8b16" stroke-width="1.4" marker-end="url(#rnn-h)"/>
<text x="400" y="194" font-size="12" text-anchor="middle" fill="#53677b">✘ must run step by step　✘ early information passes through many steps</text>
</svg>
<p>Slide 51 lists the tasks an RNN can handle: generation (text in → text out), classification (text in → one class), multi-class tagging (a label per position, such as part of speech), sentiment analysis, translation and named-entity recognition.</p>
<details><summary>Two hard limitations of RNNs</summary><p><strong>Long-range dependencies:</strong> all history is compressed into one fixed-length vector, and early information is easily lost after repeated rewriting. If someone says “my teddy bear is 3 feet tall” and then, many words later, “it”, working out what “it” refers to from the current hidden state is hard.</p><p><strong>No parallelism:</strong> h_t depends on h_{t-1}, so steps run one after another and training is slow. These two points are exactly what the Transformer set out to solve.</p></details>

<h2 id="part-8">3. LSTM: adding a longer “memory channel”</h2>
<p>Slide 52 introduces LSTM (1997), which keeps the hidden state but adds a <strong>cell state</strong> and gates that control “how much to write, how much to keep, how much to output”. A simplified sketch, without the formulas:</p>
<div class="grid">
<div class="layer"><strong>Forget gate</strong><br>decides how much old memory survives</div>
<div class="layer"><strong>Input gate</strong><br>decides how much new information is written</div>
<div class="layer"><strong>Output gate</strong><br>decides how much of the state is emitted</div>
<div class="layer"><strong>Cell state</strong><br>a channel running across time steps,<br>easier to preserve information than a hidden state</div>
</div>
<p>It eases long-range dependencies but is still <strong>sequential</strong>, and it does not fully solve information being diluted over long sequences. That is the direct motivation for attention.</p>

<h2 id="part-9">4. Early attention: “look back at the source” while translating</h2>
<p>Slides 54–55 cover Bahdanau et al. 2014. When translating long sentences, a seq2seq model originally had only the encoder’s final hidden state to remember the whole sentence; attention lets the decoder <strong>read relevant source positions directly</strong> while generating each word:</p>
<svg viewBox="0 0 800 215" role="img" aria-label="In sequence-to-sequence translation, generating lit reads the source word reading directly through attention" style="width:100%;height:auto;max-width:720px;display:block;margin:14px auto">
<text x="12" y="24" font-size="12" fill="#53677b">source (encoder)</text>
<text x="12" y="120" font-size="12" fill="#53677b">translation (decoder, step by step)</text>
<rect x="40" y="34" width="100" height="38" rx="8" fill="#edf4ff" stroke="#2166cd" stroke-width="1.4"/><text x="90" y="59" font-size="13" text-anchor="middle" fill="#193049">A</text><rect x="185" y="34" width="100" height="38" rx="8" fill="#edf4ff" stroke="#2166cd" stroke-width="1.4"/><text x="235" y="59" font-size="13" text-anchor="middle" fill="#193049">cute</text><rect x="330" y="34" width="100" height="38" rx="8" fill="#edf4ff" stroke="#2166cd" stroke-width="1.4"/><text x="380" y="59" font-size="13" text-anchor="middle" fill="#193049">teddy bear</text><rect x="475" y="34" width="100" height="38" rx="8" fill="#edf4ff" stroke="#2166cd" stroke-width="1.4"/><text x="525" y="59" font-size="13" text-anchor="middle" fill="#193049">is</text><rect x="620" y="34" width="100" height="38" rx="8" fill="#edf4ff" stroke="#2166cd" stroke-width="1.4"/><text x="670" y="59" font-size="13" text-anchor="middle" fill="#193049">reading</text><rect x="43" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="85" y="149" font-size="13" text-anchor="middle" fill="#193049">Un</text><rect x="165" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="207" y="149" font-size="13" text-anchor="middle" fill="#193049">ours</text><rect x="287" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="329" y="149" font-size="13" text-anchor="middle" fill="#193049">en</text><rect x="409" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="451" y="149" font-size="13" text-anchor="middle" fill="#193049">peluche</text><rect x="531" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="573" y="149" font-size="13" text-anchor="middle" fill="#193049">mignon</text><rect x="653" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="695" y="149" font-size="13" text-anchor="middle" fill="#193049">lit</text>
<line x1="695" y1="126" x2="670" y2="74" stroke="#c0392b" stroke-width="2.2" stroke-dasharray="6 4" marker-end="url(#attnarrow)"/>
<defs><marker id="attnarrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#c0392b"/></marker></defs>
<text x="400" y="200" font-size="12" text-anchor="middle" fill="#c0392b">red dashed line: to generate lit, attention points straight at reading</text>
<text x="400" y="184" font-size="12" text-anchor="middle" fill="#53677b">no need to rely on one repeatedly rewritten hidden state</text>
</svg>
<p>To generate the French “lit” (reads), the model can put attention directly on “reading” in the source instead of depending on one repeatedly compressed state vector. This is where the Transformer’s self-attention idea came from.</p>
<div class="note">Note the difference: this attention connects <strong>decoder and encoder</strong> (the ancestor of cross-attention, 2014); the Transformer’s core innovation is applying attention <strong>inside one sequence</strong> (self-attention) and barely relying on recurrence at all.</div>
<h2 id="part-10">After training, only one table survives</h2>
<p>Word2vec’s hidden layer has no activation and is really “take one vector row by ID”. After training the embedding matrix is the product; the other weights can be thrown away. That is why it is often called a “word-vector algorithm” rather than a language model.</p>
<h2 id="part-11">Full softmax is expensive: negative sampling</h2>
<p>The original method applies softmax over the whole vocabulary. With a vocabulary of hundreds of thousands, predicting one word means computing hundreds of thousands of scores. Negative sampling turns it into a set of binary decisions:</p>
<div class="flow"><span class="chip">positive sample: a real adjacent pair<br>(agent, learns) → 1</span><span class="chip">negative samples: 5–15 random unrelated words<br>(agent, apple) → 0</span><span class="arrow">→</span><span class="chip">decide “are these two words adjacent?”</span></div>
<p>Now the whole vocabulary does not have to be traversed and training is much faster. The cost is that it optimises an approximate objective rather than full softmax probabilities.</p>
<details><summary>Two other word-vector methods, for orientation</summary>
<div class="table-wrap"><table><thead><tr><th>Method</th><th>Core idea</th><th>Main advantage</th><th>Main limit</th></tr></thead><tbody>
<tr><th>Word2Vec (2013)</th><td>A shallow prediction task: CBOW predicts the centre word from context, Skip-gram predicts context from the centre word</td><td>Simple, fast to train; word vectors became a standalone product</td><td>Static; only a local window is used</td></tr>
<tr><th>GloVe (2014)</th><td>Build the global co-occurrence matrix, then factorise it so the dot product of two vectors approaches the log co-occurrence</td><td>Uses global statistics</td><td>Static; co-occurrence must be counted first</td></tr>
<tr><th>FastText (2016)</th><td>Split words into character n-grams; the word vector is the sum of those subword vectors</td><td>Can build unseen words and is more robust to spelling variants</td><td>Larger storage cost</td></tr>
</tbody></table></div>
<p>All three share the same boundary: one word has one vector, regardless of the sentence it appears in. That is exactly what ELMo, BERT and GPT set out to fix — turning vectors from “looked up” into “computed”.</p></details>
<p class="source">Slide map: pages 34–44 (Word2vec), 45–52 (RNN, LSTM), 53 (method comparison), 54–55 (early attention). The network diagrams are simplified redrawings of the slides; the probabilities and loss values are teaching examples.</p>
</section>
