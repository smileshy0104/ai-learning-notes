---
slug: deep-dive
title: "Supplement: scale, training and modern architecture"
collection: cme295
lecture: 1
lang: en
description: "Fine-tuning, prompting, scaling lessons and how modern components changed."
order: 130
kind: lesson
status: published
tags: ["Scaling", "MoE", "GQA"]
---

<section id="deep-dive">
<div class="tag">Deeper supplement · reference sections 2.7, 5.1, 1.7, 12.x; not part of the lecture</div>

<p>Lecture 1 explains “how the network computes”. The panels below stay folded until you need them. They explain many of the “why” questions that lecture 1 leaves implicit.</p>

<p class="small muted">Training loops, loss functions, backpropagation and vanishing gradients are covered in detail earlier, in <a href="../../../topics/cme295/basics.html#basics">⓿ the basic toolbox</a>, and are not repeated here.</p>

<details><summary>3. Three generations: pretraining, fine-tuning, prompting</summary>
<div class="table-wrap"><table><thead><tr><th>Stage</th><th>What you do</th><th>Data needed</th><th>Switching tasks</th></tr></thead><tbody><tr><th>Pretraining</th><td>Self-supervised objective on massive unlabelled text (e.g. predict the next token)</td><td>Very large, usually no manual labels</td><td>Not involved; you get a base model first</td></tr><tr><th>Fine-tuning</th><td>Update (some) parameters with a small labelled set</td><td>Thousands to tens of thousands of examples</td><td>Retrain and store another copy of the weights</td></tr><tr><th>Prompting</th><td>Leave parameters untouched and put the task in context</td><td>0 to a few examples</td><td>Change a few lines of text</td></tr></tbody></table></div>
<p>The point is that the three do not replace each other: fine-tuning remains an important adaptation tool, and prompting lowers the cost of lightweight adaptation. Chat products usually add post-training steps such as instruction tuning, turning “able to continue text” into “willing to follow instructions”.</p>
</details>

<details><summary>4. Scale, scaling laws and “emergence”</summary>
<p>Empirical work gives power-law relationships: loss falls as parameters N, data D and compute C grow, with diminishing returns (exponents around 0.07–0.1).</p>
<p>Chinchilla (2022) concluded that under a fixed compute budget, model and data should grow together, with a common rule of thumb of about <strong>20 tokens per parameter</strong>. For example, 70B parameters with about 1.4T tokens.</p>
<div class="note">“Emergent abilities” (in-context learning, chain-of-thought and similar appearing suddenly past some scale) is a popular claim, but other work argues the jump can be an artefact of discontinuous evaluation metrics. <strong>Treat it as planning guidance, not a law of physics.</strong></div>
</details>

<details><summary>5. Which parts today’s models changed</summary>
<div class="table-wrap"><table><thead><tr><th>Component</th><th>Original Transformer (2017)</th><th>Common today</th><th>Why it changed</th></tr></thead><tbody><tr><th>Overall structure</th><td>Encoder + decoder</td><td>Mostly decoder-only</td><td>Uniform task format, simpler structure</td></tr><tr><th>Normalisation placement</th><td>Post-Norm</td><td>Pre-Norm</td><td>More stable deep training</td></tr><tr><th>Normalisation method</th><td>LayerNorm</td><td>RMSNorm and similar</td><td>Skips the mean, faster</td></tr><tr><th>Positional encoding</th><td>Sine/cosine</td><td>Relative schemes such as RoPE</td><td>Better long-text behaviour</td></tr><tr><th>Activation</th><td>ReLU</td><td>Gated forms such as SwiGLU</td><td>Better quality per unit of compute</td></tr><tr><th>Attention</th><td>Standard multi-head</td><td>GQA / MQA</td><td>Lower inference cache cost</td></tr><tr><th>FFN</th><td>Dense</td><td>MoE (mixture of experts)</td><td>Many parameters, only some active per token</td></tr></tbody></table></div>
<p>Generation also uses a KV Cache: store the K and V already computed and only compute the increment for each new token. It does not change the model’s mathematical output, only how compute and memory are spent. These details belong to later lectures and specialised material.</p>
</details>

<details><summary>6. Layers of capability: which come from the model, which from outside systems</summary>
<div class="table-wrap"><table><thead><tr><th>Layer</th><th>Examples</th><th>Where it comes from</th></tr></thead><tbody><tr><th>Base capability</th><td>Comprehension, world knowledge, multilingual, code</td><td>Acquired during pretraining</td></tr><tr><th>Emergent / instruction capability</th><td>In-context learning, step-by-step reasoning, instruction following</td><td>Scale plus post-training</td></tr><tr><th>Augmented capability</th><td>Task decomposition, tool calling, self-checking</td><td>External systems: tools, retrieval, loops</td></tr></tbody></table></div>
<p>This also explains why the same base model “looks smarter” once wrapped in tools and an execution loop: it crossed into the third layer. The model itself did not change.</p>
</details>
<p class="source">Every formula, number and conclusion on this page has been recomputed and checked; the training example and parameter estimates are teaching data. Content references <code>references/llm-foundations.md</code> in this repository (not published with the site) and extends beyond lecture 1.</p>
</section>
