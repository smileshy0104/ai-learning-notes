---
slug: attention
title: "Self-attention"
collection: cme295
lecture: 1
lang: en
description: "Q/K/V, matrix dimensions, a hand-computed example and an interactive weight experiment."
order: 70
kind: lesson
status: published
tags: ["Attention", "QKV"]
---

<section id="attention" class="switch">
<div class="tag">Lecture outline · Self-attention mechanism（slides 57–62）</div>

<h2 id="part-2">What attention actually does: one general frame</h2>
<p>Set the Transformer aside for a moment. People reading a sentence <strong>allocate attention selectively</strong> — in “Xiaoming put the book on the table, then he went to eat because he was hungry”, “he” clearly means Xiaoming; not every character matters equally. Attention turns that into mathematics: compute a weight for every position, and information with a higher weight survives more.</p>
<p>Every form of attention fits one frame: <strong>use a Query to look up Keys and retrieve Values</strong>.</p>
<div class="table-wrap"><table><thead><tr><th>Role</th><th>Library analogy</th><th>Meaning</th></tr></thead><tbody><tr><th>Query (Q)</th><td>Your search request</td><td>What information do I want now?</td></tr><tr><th>Key (K)</th><td>Each book’s label / index</td><td>What features can I offer for matching?</td></tr><tr><th>Value (V)</th><td>The actual content of the book</td><td>If we match, what information do I give you?</td></tr></tbody></table></div>
<div class="math">① dot-product Q with every K → match scores<br>② pass the scores through softmax → weights (non-negative, sum to 1)<br>③ weighted sum of V → this step’s output</div>
<p class="small muted">Keep this frame: later multimodal work and retrieval-augmented generation (RAG) are the same “query — retrieve — aggregate” pattern.</p>
<p>Fix your eyes on the position “teddy bear”. Give it a query vector <strong>Q</strong>, compute match scores against each position’s <strong>K</strong>, then aggregate each position’s <strong>V</strong> by those weights.</p>
<div class="flow"><span class="chip">Q: the information need used for matching</span><span class="chip">K: features offered for matching</span><span class="chip">V: the information actually read</span></div>
<p>Click different Q values and see what the same K and V produce. This step allows reading all three positions. Q is the query, K supplies matching features, V is the information read.</p>
<input type="radio" name="qpreset" id="qpreset-1" checked>
<input type="radio" name="qpreset" id="qpreset-2">
<input type="radio" name="qpreset" id="qpreset-3">
<input type="radio" name="qpreset" id="qpreset-4">
<input type="radio" name="qpreset" id="qpreset-5">
<div class="controls" role="group" aria-label="Choose the query vector"><span>Choose Q:</span><label for="qpreset-1">Q=[1,0]</label><label for="qpreset-2">Q=[2,−2]</label><label for="qpreset-3">Q=[0,0]</label><label for="qpreset-4">Q=[2,2]</label><label for="qpreset-5">Q=[−2,2]</label></div>
<div class="panel panel-p1">
<div class="table-wrap"><table><caption>The full computation for one query: Q = [1, 0], d_k = 2</caption><thead><tr><th>position</th><th>K</th><th>V</th><th>Q · K</th><th>after ÷ √2</th><th>softmax weight</th></tr></thead><tbody><tr><th scope="row">teddy bear</th><td>[1,0]</td><td>[1,0]</td><td>1.000</td><td>0.707</td><td>40.11%</td></tr><tr><th scope="row">cute</th><td>[0,1]</td><td>[0,2]</td><td>0.000</td><td>0.000</td><td>19.78%</td></tr><tr><th scope="row">reading</th><td>[1,1]</td><td>[1,1]</td><td>1.000</td><td>0.707</td><td>40.11%</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-3">Share read</h3><div class="bars"><div class="barrow"><span>teddy bear</span><div class="track"><div class="fill" style="width:40.11%"></div></div><span>40.1%</span></div><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:19.78%"></div></div><span>19.8%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:40.11%"></div></div><span>40.1%</span></div></div></div><div><h3 id="part-4">Aggregated output vector</h3><div class="math">0.401 × [1,0] + 0.198 × [0,2] + 0.401 × [1,1] ≈ [0.802, 0.797]</div><p class="small muted">Every dimension is summed with the same weights. Only one head and one query position are shown.</p></div></div>
</div>
<div class="panel panel-p2">
<div class="table-wrap"><table><caption>The full computation for one query: Q = [2, −2], d_k = 2</caption><thead><tr><th>position</th><th>K</th><th>V</th><th>Q · K</th><th>after ÷ √2</th><th>softmax weight</th></tr></thead><tbody><tr><th scope="row">teddy bear</th><td>[1,0]</td><td>[1,0]</td><td>2.000</td><td>1.414</td><td>76.79%</td></tr><tr><th scope="row">cute</th><td>[0,1]</td><td>[0,2]</td><td>-2.000</td><td>-1.414</td><td>4.54%</td></tr><tr><th scope="row">reading</th><td>[1,1]</td><td>[1,1]</td><td>0.000</td><td>0.000</td><td>18.67%</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-5">Share read</h3><div class="bars"><div class="barrow"><span>teddy bear</span><div class="track"><div class="fill" style="width:76.79%"></div></div><span>76.8%</span></div><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:4.54%"></div></div><span>4.5%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:18.67%"></div></div><span>18.7%</span></div></div></div><div><h3 id="part-6">Aggregated output vector</h3><div class="math">0.768 × [1,0] + 0.045 × [0,2] + 0.187 × [1,1] ≈ [0.955, 0.277]</div><p class="small muted">Every dimension is summed with the same weights. Only one head and one query position are shown.</p></div></div>
</div>
<div class="panel panel-p3">
<div class="table-wrap"><table><caption>The full computation for one query: Q = [0, 0], d_k = 2</caption><thead><tr><th>position</th><th>K</th><th>V</th><th>Q · K</th><th>after ÷ √2</th><th>softmax weight</th></tr></thead><tbody><tr><th scope="row">teddy bear</th><td>[1,0]</td><td>[1,0]</td><td>0.000</td><td>0.000</td><td>33.33%</td></tr><tr><th scope="row">cute</th><td>[0,1]</td><td>[0,2]</td><td>0.000</td><td>0.000</td><td>33.33%</td></tr><tr><th scope="row">reading</th><td>[1,1]</td><td>[1,1]</td><td>0.000</td><td>0.000</td><td>33.33%</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-7">Share read</h3><div class="bars"><div class="barrow"><span>teddy bear</span><div class="track"><div class="fill" style="width:33.33%"></div></div><span>33.3%</span></div><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:33.33%"></div></div><span>33.3%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:33.33%"></div></div><span>33.3%</span></div></div></div><div><h3 id="part-8">Aggregated output vector</h3><div class="math">0.333 × [1,0] + 0.333 × [0,2] + 0.333 × [1,1] ≈ [0.667, 1.000]</div><p class="small muted">Every dimension is summed with the same weights. Only one head and one query position are shown.</p></div></div>
</div>
<div class="panel panel-p4">
<div class="table-wrap"><table><caption>The full computation for one query: Q = [2, 2], d_k = 2</caption><thead><tr><th>position</th><th>K</th><th>V</th><th>Q · K</th><th>after ÷ √2</th><th>softmax weight</th></tr></thead><tbody><tr><th scope="row">teddy bear</th><td>[1,0]</td><td>[1,0]</td><td>2.000</td><td>1.414</td><td>16.36%</td></tr><tr><th scope="row">cute</th><td>[0,1]</td><td>[0,2]</td><td>2.000</td><td>1.414</td><td>16.36%</td></tr><tr><th scope="row">reading</th><td>[1,1]</td><td>[1,1]</td><td>4.000</td><td>2.828</td><td>67.28%</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-9">Share read</h3><div class="bars"><div class="barrow"><span>teddy bear</span><div class="track"><div class="fill" style="width:16.36%"></div></div><span>16.4%</span></div><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:16.36%"></div></div><span>16.4%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:67.28%"></div></div><span>67.3%</span></div></div></div><div><h3 id="part-10">Aggregated output vector</h3><div class="math">0.164 × [1,0] + 0.164 × [0,2] + 0.673 × [1,1] ≈ [0.836, 1.000]</div><p class="small muted">Every dimension is summed with the same weights. Only one head and one query position are shown.</p></div></div>
</div>
<div class="panel panel-p5">
<div class="table-wrap"><table><caption>The full computation for one query: Q = [-2, 2], d_k = 2</caption><thead><tr><th>position</th><th>K</th><th>V</th><th>Q · K</th><th>after ÷ √2</th><th>softmax weight</th></tr></thead><tbody><tr><th scope="row">teddy bear</th><td>[1,0]</td><td>[1,0]</td><td>-2.000</td><td>-1.414</td><td>4.54%</td></tr><tr><th scope="row">cute</th><td>[0,1]</td><td>[0,2]</td><td>2.000</td><td>1.414</td><td>76.79%</td></tr><tr><th scope="row">reading</th><td>[1,1]</td><td>[1,1]</td><td>0.000</td><td>0.000</td><td>18.67%</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-11">Share read</h3><div class="bars"><div class="barrow"><span>teddy bear</span><div class="track"><div class="fill" style="width:4.54%"></div></div><span>4.5%</span></div><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:76.79%"></div></div><span>76.8%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:18.67%"></div></div><span>18.7%</span></div></div></div><div><h3 id="part-12">Aggregated output vector</h3><div class="math">0.045 × [1,0] + 0.768 × [0,2] + 0.187 × [1,1] ≈ [0.232, 1.723]</div><p class="small muted">Every dimension is summed with the same weights. Only one head and one query position are shown.</p></div></div>
</div>
<div class="note small">In a browser with scripts enabled, this page also shows sliders that sweep Q beyond the presets. If scripts are disabled here, the preset buttons still work completely.</div>
<div id="slider-demo" hidden>
<h2 id="part-13">Sweeping Q continuously (needs scripts)</h2>
<div class="controls"><label for="q1">Q dimension 1: <output id="q1-value">1.0</output></label><input id="q1" type="range" min="-2" max="2" step="0.1" value="1"><label for="q2">dimension 2: <output id="q2-value">0.0</output></label><input id="q2" type="range" min="-2" max="2" step="0.1" value="0"><button id="reset" type="button">reset</button></div>
<div class="table-wrap"><table><caption>Slider result: d_k = 2</caption><thead><tr><th>position</th><th>K</th><th>V</th><th>Q · K</th><th>after ÷ √2</th><th>softmax weight</th></tr></thead><tbody id="attention-table"></tbody></table></div>
<div class="grid"><div><h3 id="part-14">Share read</h3><div id="attention-bars" class="bars"></div></div><div><h3 id="part-15">Aggregated output vector</h3><div id="attention-result" class="math" aria-live="polite"></div></div></div>
</div>
<h2 id="part-16">Self-attention in six steps (with shapes)</h2>
<p>Let n be sequence length, d_model the model dimension and d_k the key dimension per head. “Self” means Q, K and V all come from the same inputs.</p>
<div class="table-wrap"><table><thead><tr><th>Step</th><th>What happens</th><th>Shape</th></tr></thead><tbody>
<tr><td>①</td><td>Multiply the input X by three learnable matrices to get Q, K, V</td><td>X: n×d_model → Q,K: n×d_k；V: n×d_v</td></tr>
<tr><td>②</td><td>Multiply Q by transposed K to get a score for every query–key pair</td><td>QKᵀ: n×n</td></tr>
<tr><td>③</td><td>Divide by √d_k to control scale (with large dimensions dot products grow and softmax becomes too sharp)</td><td>n×n</td></tr>
<tr><td>④</td><td>Softmax each row so every row sums to 1</td><td>n×n weight matrix A</td></tr>
<tr><td>⑤</td><td>Multiply A by V to aggregate information by weight</td><td>n×d_v</td></tr>
<tr><td>⑥</td><td>With multiple heads, concatenate the heads and multiply by W_O to return to d_model</td><td>n×d_model</td></tr>
</tbody></table></div>
<p class="small muted">The n×n in step ② is why attention cost grows with the square of sequence length; the scaling in step ③ does not change expressiveness, only optimisation stability.</p>
<details><summary>Expand the formulas: why these steps?</summary><div class="math">score s_j = (q · k_j) / √d_k<br>weight a_j = exp(s_j) / Σ exp(s_l)<br>output z = Σ a_j v_j</div><p>The dot product measures how well the learned query matches each key. Scaling controls the magnitude of the scores; softmax turns them into non-negative weights summing to 1. Finally V is mixed by those weights.</p><p>Doing this for all query positions at once gives:</p><div class="math">Attention(Q,K,V) = softmax(QKᵀ / √d_k) V</div><p>With n positions, Q and K are both n × d_k, so QKᵀ is n × n. Each row is one query, each column one position being read. Softmax is computed per row.</p></details>
<details><summary>Where do Q, K and V come from?</summary><p>A real model projects the input X with different learnable matrices: Q = XW_Q, K = XW_K, V = XW_V. Here K and V are given directly and only Q is adjusted, to isolate the matching and aggregation steps. The sliders are not how a real model sets its query by hand.</p></details>
<details><summary>Try it: set both dimensions of Q to 0 — what happens?</summary><p>Every dot product is 0, so all three positions get weight 1/3. Even though the V vectors differ, the share read is identical. You can then set Q to [2, −2] and watch how differently it matches the keys [1, 0], [0, 1] and [1, 1].</p></details>
<details><summary>A fuller hand calculation: 5 positions, d_k = 3</summary>
<p>Fix position 5, “now tokenising”, as the query with q = [1, 0, 1]. To focus on the mechanism, K and V are given directly here; in a real model they come from the input multiplied by W_K and W_V. The weights below sum to 1.000.</p>
<div class="table-wrap"><table><caption>dot product → scale → subtract max → exp → normalise</caption><thead><tr><th>position</th><th>K</th><th>V</th><th>q · k</th><th>÷√3</th><th>− max</th><th>exp</th><th>weight</th></tr></thead><tbody><tr><th scope="row">teddy bear</th><td>[1, 1, 0]</td><td>[0.6, 0.2, 0.1]</td><td>1.000</td><td>0.577</td><td>-0.577</td><td>0.561</td><td>0.152</td></tr><tr><th scope="row">cute</th><td>[1, 0, 1]</td><td>[0.5, 0.1, 0.3]</td><td>2.000</td><td>1.155</td><td>0.000</td><td>1.000</td><td>0.271</td></tr><tr><th scope="row">reading</th><td>[0, 1, 1]</td><td>[0.1, 0.7, 0.4]</td><td>1.000</td><td>0.577</td><td>-0.577</td><td>0.561</td><td>0.152</td></tr><tr><th scope="row">is</th><td>[1, 1, 1]</td><td>[0.2, 0.2, 0.2]</td><td>2.000</td><td>1.155</td><td>0.000</td><td>1.000</td><td>0.271</td></tr><tr><th scope="row">now tokenising</th><td>[0, 0, 1]</td><td>[0.1, 0.3, 0.8]</td><td>1.000</td><td>0.577</td><td>-0.577</td><td>0.561</td><td>0.152</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-17">Share read</h3><div class="bars"><div class="barrow"><span>teddy bear</span><div class="track"><div class="fill" style="width:15.2%"></div></div><span>15.2%</span></div><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:27.1%"></div></div><span>27.1%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:15.2%"></div></div><span>15.2%</span></div><div class="barrow"><span>is</span><div class="track"><div class="fill" style="width:27.1%"></div></div><span>27.1%</span></div><div class="barrow"><span>now tokenising</span><div class="track"><div class="fill" style="width:15.2%"></div></div><span>15.2%</span></div></div></div><div><h3 id="part-18">Weighted sum</h3><div class="math">0.152 × [0.6, 0.2, 0.1] + 0.271 × [0.5, 0.1, 0.3] + 0.152 × [0.1, 0.7, 0.4] + 0.271 × [0.2, 0.2, 0.2] + 0.152 × [0.1, 0.3, 0.8]<br>≈ [0.312, 0.264, 0.334]</div><p class="small muted">“now tokenising” has its own V of [0.1, 0.3, 0.8], yet the output is a different set of numbers blended from the whole sentence.</p></div></div>
<p class="small muted">Limits of this example: the scores take only two values, so the weights take only two values; real scores are often negative and the distribution can be far more skewed. q is given directly here, whereas a real model computes it.</p>
</details>
<h2 id="part-19">What an attention weight matrix looks like</h2>
<p>Computing a whole sentence at once gives an n×n matrix: <strong>rows are “who is looking”, columns are “who is looked at”, and each row sums to 1</strong>. Take “The cat sat on the mat” (illustrative numbers, not real model output):</p>
<div class="table-wrap"><table><thead><tr><th>query ↓ / looked at →</th><th>The</th><th>cat</th><th>sat</th><th>on</th><th>the</th><th>mat</th><th>row sum</th></tr></thead><tbody>
<tr><th>The</th><td>0.85</td><td>0.10</td><td>0.00</td><td>0.00</td><td>0.05</td><td>0.00</td><td>1.00</td></tr>
<tr><th>cat</th><td>0.15</td><td>0.45</td><td>0.25</td><td>0.05</td><td>0.05</td><td>0.05</td><td>1.00</td></tr>
<tr><th>sat</th><td>0.05</td><td>0.50</td><td>0.20</td><td>0.15</td><td>0.05</td><td>0.05</td><td>1.00</td></tr>
<tr><th>on</th><td>0.00</td><td>0.05</td><td>0.55</td><td>0.15</td><td>0.05</td><td>0.20</td><td>1.00</td></tr>
<tr><th>the</th><td>0.05</td><td>0.00</td><td>0.00</td><td>0.15</td><td>0.70</td><td>0.10</td><td>1.00</td></tr>
<tr><th>mat</th><td>0.00</td><td>0.05</td><td>0.05</td><td>0.30</td><td>0.45</td><td>0.15</td><td>1.00</td></tr>
</tbody></table></div>
<p>How to read it: the “sat” row has its highest weight in the “cat” column (0.50), matching “the subject of sat is cat”; the “on” row peaks at “sat” (0.55), matching “the preposition attaches to the verb before it”. These are only illustrations; real patterns come from training and differ a lot across layers and heads.</p>
<div class="note"><strong>Two caveats:</strong> ① a high weight only shows where information flows, not a causal explanation; ② a real model has multiple heads per layer, and stacked together they are far more complex than one table.</div>
<h2 id="part-20">An intuition closer to a real task: which noun does a pronoun mean?</h2>
<p>The classic example: “The animal didn't cross the street because it was too tired.” At it, the model must decide whether it means animal or street. The attention distribution might look like this (illustrative, not real model output):</p>
<div class="table-wrap"><table><thead><tr><th>Position read</th><th>Score (illustrative)</th><th>Weight</th></tr></thead><tbody><tr><th>animal</th><td>8.2</td><td>0.982</td></tr><tr><th>tired</th><td>3.8</td><td>0.012</td></tr><tr><th>it</th><td>2.1</td><td>0.002</td></tr><tr><th>other positions</th><td>0.2 ~ 0.9</td><td>about 0.004 in total</td></tr></tbody></table></div>
<p>These weights are learned, not hand-written rules. Note though: <strong>a high weight is not “the output happened because it looked here”</strong>; it describes information routing, not a causal explanation.</p>
<h2 id="part-21">One formula, three uses</h2>
<p>Different sources of Q, K and V give three kinds of attention. They differ only in “who queries whom” and “can the future be seen”:</p>
<div class="table-wrap"><table><thead><tr><th>Type</th><th>Q comes from</th><th>K, V come from</th><th>Used in</th></tr></thead><tbody><tr><th>Self-attention</th><td>this sequence</td><td>this sequence</td><td>inside encoder and decoder</td></tr><tr><th>Masked self-attention</th><td>this sequence</td><td>this sequence (future masked)</td><td>decoder, GPT-like models</td></tr><tr><th>Cross-attention</th><td>decoder</td><td>encoder output</td><td>original Transformer, T5 and others</td></tr></tbody></table></div>
<p class="source">Slide map: pages 58–62 and 93–101. Weights are not the same thing as a full explanation of the model’s reasoning.</p>
</section>
