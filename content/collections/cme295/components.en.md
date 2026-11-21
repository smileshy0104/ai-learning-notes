---
slug: components
title: "Core Transformer components"
collection: cme295
lecture: 1
lang: en
description: "Position, multi-head attention, FFN, residuals, normalisation, dropout and label smoothing."
order: 80
kind: lesson
status: published
tags: ["FFN", "LayerNorm", "Dropout"]
---

<section id="components">
<div class="tag">Transformer architecture · slides 68–78 and 100–104; derivations follow reference sections 2.2 and 2.5</div>

<h2 id="part-2">1. Position: the same words in a different order</h2>
<p>“The child holds the bear” and “the bear holds the child” use the same words with different relations. Plain fully-connected self-attention is permutation-equivariant to reordering: permute the input and the output permutes accordingly; it does not by itself specify who is in which position.</p>
<div class="flow"><span class="chip">token embedding<br>[0.4, −0.2, 0.7, 0.1]</span><span class="arrow">+</span><span class="chip">encoding for that position<br>[0.0, 1.0, 0.0, 1.0]</span><span class="arrow">=</span><span class="chip">vector into the network<br>[0.4, 0.8, 0.7, 1.1]</span></div>
<p>The original Transformer encodes position with sines and cosines at different frequencies; the vector has the same dimensions as the token embedding, so the two can be added elementwise.</p>
<div class="math">PE(pos, 2i) = sin(pos / 10000^(2i/d_model))<br>PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))</div>
<div class="table-wrap"><table><thead><tr><th>Approach</th><th>How it works</th><th>Advantage</th><th>Cost</th></tr></thead><tbody><tr><th>Fixed (sine/cosine)</th><td>Computed from the formula; not trained</td><td>No extra parameters; encodings exist for new positions</td><td>Less adaptable; limited extrapolation</td></tr><tr><th>Learnable</th><td>One trainable vector per position</td><td>Flexible; fits the data</td><td>Limited to the longest length seen in training</td></tr></tbody></table></div>
<p>Modern models mostly use relative schemes: RoPE rotates position information into Q and K, while ALiBi adds a negative bias to distant positions. They improve long-text behaviour; they do not remove the need to model position.</p>
<p>pos is the position index; i is the frequency-group index. Think of a clock: the second, minute and hour hands move at different rates, and together they distinguish a longer span of time. Mathematically the encoding of a new position can be computed, but <strong>that does not guarantee the model understands arbitrarily long text reliably</strong>; and the encoding difference is not determined by relative distance alone.</p>
<h2 id="part-3">2. Multi-head attention: several projection sets in parallel</h2>
<div class="flow"><span class="chip">same input X</span><span class="arrow">→</span><span class="chip">head 1: Q₁/K₁/V₁ → Z₁<br>head 2: Q₂/K₂/V₂ → Z₂<br>… each computes attention</span><span class="arrow">→</span><span class="chip">concatenate the heads</span><span class="arrow">→</span><span class="chip">multiply by W_O<br>back to d_model</span></div>
<p class="small muted">Analogy: a convolution layer uses several kernels to extract features from different angles; multi-head attention uses several projection sets to read context from different angles. The difference is that attention does not preset a kernel’s receptive field; the weights come from data.</p>
<p>Different heads can learn different patterns of information exchange, but nothing assigns “this head handles syntax, that head handles coreference”. A single head can express several relations too. With h=8, d_model=512 and d_v=64 per head, the concatenation is 8×64=512 dimensions.</p>
<p class="small muted">Common values: h = 8 or 16, with per-head dimensions d_k = d_v = d_model / h. Some models let the head dimensions sum to something other than d_model, but the output is still projected back to d_model before the next layer.</p>
<h2 id="part-4">3. FFN: expand, then apply a non-linearity</h2>
<p>Attention moves information between positions; the FFN processes each position’s own vector. <strong>All positions share one set of FFN weights</strong>, so the computation can be batched.</p>
<div class="flow"><span class="chip">one position: d_model</span><span class="arrow">→ linear →</span><span class="chip">d_ff<br>e.g. 4×d_model</span><span class="arrow">→ ReLU →</span><span class="chip">linear again<br>back to d_model</span></div>
<div class="math">FFN(x) = ReLU(xW₁ + b₁)W₂ + b₂<br>example: d_model=2, d_ff=4<br>x=[1, −1]<br>W₁=[[1,0,1,−1],[0,1,1,1]]<br>xW₁=[1,−1,0,−2] → ReLU → [1,0,0,0]<br>W₂=[[1,2],[0,1],[1,0],[−1,1]]<br>output=[1,2] (all biases are 0 here)</div>
<p>Without the non-linearity in between, the two linear maps collapse into one, and the extra capacity this step provides disappears.</p>
<details><summary>Why is the FFN said to hold many parameters?</summary><p>For standard multi-head attention and a two-layer FFN, assuming d_ff=4d and a total Q/K/V projection width of d, ignoring biases and normalisation: attention is about 4d² (four projections) and the FFN about 8d² (d→4d→d), so the FFN is roughly 2/3 of these two parts. That ratio is not a law for every model’s total: cross-attention, embedding tables, GQA, gated FFNs and MoE all change the accounting.</p></details>
<h2 id="part-5">4. Residuals: a channel for both old and new information</h2>
<svg viewBox="0 0 700 225" role="img" aria-label="Residual connection: one path through the sublayer, another bypassing it, added at a sum node" style="width:100%;max-width:700px;display:block;margin:auto">
<defs><marker id="res-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#2166cd"/></marker></defs>
<g fill="none" stroke="#2166cd" stroke-width="2" marker-end="url(#res-arrow)"><path d="M70 105 H210"/><path d="M350 105 H485"/><path d="M125 105 V35 H505 V84"/><path d="M525 105 H640"/></g>
<rect x="210" y="75" width="140" height="60" rx="10" fill="#edf4ff" stroke="#2166cd"/><circle cx="505" cy="105" r="20" fill="#fff6e6" stroke="#db8b16"/>
<g text-anchor="middle" fill="#193049" font-size="17"><text x="45" y="111">x</text><text x="280" y="111">sublayer f(x)</text><text x="505" y="111">+</text><text x="640" y="148">x + f(x)</text><text x="325" y="24">path that keeps the input</text></g>
<text x="350" y="190" text-anchor="middle" fill="#53677b" font-size="14">e.g. x=[1,−1], f(x)=[1,2], summed to [2,1]</text>
</svg>
<p>This extra path makes it easier for deep networks to carry information and gradients. It helps optimisation, but it does not guarantee that no gradient problem can occur under any training configuration.</p>
<h2 id="part-6">5. LayerNorm: normalise along each position’s feature dimension</h2>
<div class="math">x=[1,3] → mean 2, variance 1<br>(x−mean)/√(variance+ε) ≈ [−1,1]<br>then multiply by a learnable scale γ and add a learnable shift β</div>
<p>It processes the features of each position, not the mean across all sentences. Because of ε and the learnable γ, β, the final output need not have mean exactly 0 and variance exactly 1.</p>
<div class="table-wrap"><table><thead><tr><th>Arrangement</th><th>Formula (dropout omitted)</th><th>Reading</th></tr></thead><tbody><tr><th>Original Post-Norm</th><td>LayerNorm(x + f(x))</td><td>Add first, then normalise</td></tr><tr><th>Common Pre-Norm</th><td>x + f(LayerNorm(x))</td><td>Normalise first, then enter the sublayer</td></tr></tbody></table></div>
<h2 id="part-7">6. Parameters: how much does each part take?</h2>
<p>Let d_model = d, ignore biases, and take the standard configuration (Q/K/V total width d, FFN inner layer 4d):</p>
<div class="table-wrap"><table><thead><tr><th>Component</th><th>Made of</th><th>Parameters</th></tr></thead><tbody><tr><th>Self-attention</th><td>W_Q, W_K, W_V, W_O</td><td>4d²</td></tr><tr><th>FFN</th><td>d → 4d → d</td><td>8d²</td></tr><tr><th>Total</th><td>one Transformer block</td><td>about 12d²</td></tr></tbody></table></div>
<p>A rough check against GPT-3’s public configuration (d = 12288, 96 layers, vocabulary 50257):</p>
<div class="math">per layer ≈ 12 × 12288² ≈ 1.81B<br>96 layers ≈ 173.9B<br>word embeddings ≈ 50257 × 12288 ≈ 0.62B<br>total ≈ 174.6B ≈ 175B</div>
<p>This also explains why “widening the model” adds more capacity than “adding attention heads”: change d and the FFN’s 8d² grows with it. Note that 12d² applies to this configuration only; cross-attention, GQA/MQA, gated FFNs and MoE all change the ratio.</p>
<h2 id="part-8">7. Dropout: randomly switch off some units during training</h2>
<p class="def"><strong>Definition:</strong> during training, set a fraction p of activations (or connections) to 0 temporarily, and scale the surviving values by 1/(1−p); <strong>at inference nothing is dropped</strong> and nothing is scaled.</p>
<p><strong>Why it is needed:</strong> when there are far more parameters than data, units start to rely on each other — a feature is always assembled by the same few units and collapses on a different dataset. Random dropping forces each unit to be useful on its own; it is roughly like training a slightly different subnetwork each step and averaging them at inference.</p>
<p><strong>Example (p = 0.5):</strong> a layer’s activations are x = [1.2, −0.5, 0.8, 2.0]</p>
<div class="table-wrap"><table><thead><tr><th>Unit</th><th>raw activation</th><th>random mask</th><th>after zeroing</th><th>scale by 1/(1−0.5)</th></tr></thead><tbody>
<tr><th>1</th><td>1.2</td><td>keep</td><td>1.2</td><td>2.4</td></tr>
<tr><th>2</th><td>−0.5</td><td>drop</td><td>0</td><td>0</td></tr>
<tr><th>3</th><td>0.8</td><td>keep</td><td>0.8</td><td>1.6</td></tr>
<tr><th>4</th><td>2.0</td><td>drop</td><td>0</td><td>0</td></tr>
</tbody></table></div>
<div class="math">why scale: expected output per unit = p×0 + (1−p) × x/(1−p) = x<br>so the training-time average magnitude matches inference, and no correction is needed later</div>
<p>This scaling step is called <strong>inverted dropout</strong> and is the common modern form. The other convention scales nothing in training and multiplies by (1−p) at inference; it is mathematically equivalent.</p>
<div class="note"><strong>Three common traps:</strong> ① forgetting to switch to eval mode at inference, so outputs jitter randomly; ② Dropout is training-only and must be off for evaluation and serving; ③ a larger p is not better — 0.1–0.5 is common, and large modern models often use small p or apply it only in some places.</div>
<p class="small muted">Related regularisers include label smoothing (softening the target distribution) and weight decay (penalising large parameters). They act at different stages: dropout changes activations, label smoothing changes targets, weight decay changes parameter updates.</p>
<h2 id="part-9">8. Label smoothing: targets are not strictly 1 or 0</h2>
<p class="def"><strong>Definition:</strong> replace the hard one-hot target with a soft one: the correct class gets 1−ε and the other K−1 classes share ε. For example with K = 4 and ε = 0.1 the target goes from [1, 0, 0, 0] to [0.9, 0.0333, 0.0333, 0.0333].</p>
<p><strong>Why it is needed:</strong> in language, one sentence often has several reasonable continuations, so “exactly one correct answer” is not always true. A hard target pushes logits ever higher in search of 100% confidence, which encourages overfitting and worsens calibration. A soft target tells the model: do not be so absolute.</p>
<p><strong>Example (the four words from section 0)</strong>: current predictions p = [0.3125, 0.3489, 0.1433, 0.1953], correct word first.</p>
<div class="table-wrap"><table><thead><tr><th>Target type</th><th>Target vector</th><th>Cross-entropy loss</th></tr></thead><tbody>
<tr><th>Hard target (one-hot)</th><td>[1, 0, 0, 0]</td><td>1.163</td></tr>
<tr><th>Soft target (ε = 0.1)</th><td>[0.9, 0.0333, 0.0333, 0.0333]</td><td>1.201</td></tr>
</tbody></table></div>
<p>With the same predictions the soft target gives a <strong>higher</strong> loss, because it also asks the model to leave some probability for the other words. That is the point: the loss is no longer dominated by pushing the correct word to 1.</p>
<p><strong>The gradient makes this clearer</strong>: for softmax plus cross-entropy the gradient is p − target.</p>
<div class="table-wrap"><table><thead><tr><th>Word</th><th>prediction p</th><th>hard target</th><th>gradient (hard)</th><th>soft target</th><th>gradient (soft)</th></tr></thead><tbody>
<tr><th>cute (correct)</th><td>0.3125</td><td>1</td><td>−0.6875</td><td>0.9000</td><td>−0.5875</td></tr>
<tr><th>soft</th><td>0.3489</td><td>0</td><td>0.3489</td><td>0.0333</td><td>0.3156</td></tr>
<tr><th>reading</th><td>0.1433</td><td>0</td><td>0.1433</td><td>0.0333</td><td>0.1100</td></tr>
<tr><th>is</th><td>0.1953</td><td>0</td><td>0.1953</td><td>0.0333</td><td>0.1620</td></tr>
</tbody></table></div>
<p>With a hard target the gradient only vanishes once p(cute) approaches 1 and the others approach 0; with a soft target the optimum is <strong>p ≈ the soft target</strong> (where the loss is about 0.435, not 0). So the model learns to be fairly confident, not absolutely certain.</p>
<div class="note"><strong>Boundaries to keep in mind:</strong> uniform smoothing spreads probability evenly over all other words; it does not know whether “soft” or “reading” is more plausible. For language modelling, where the next word often really is unique, ε is usually small (such as 0.1) or applied only in some training stages. This is not the same as distillation’s “soft labels”, which come from a teacher model’s distribution.</div>
<p class="small muted">The original Transformer paper reported BLEU gains from label smoothing on machine translation. It is regularisation at the target level, distinct from dropout (activations) and weight decay (parameters).</p>
<p class="source">Pre-Norm and modern architecture are supplementary here. When understanding lecture 1, follow the original model’s computation order first.</p>
</section>
