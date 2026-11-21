---
slug: beyond-lecture
title: "From this lecture to modern models"
collection: cme295
lecture: 1
lang: en
description: "How three architectures connect to training and applications."
order: 120
kind: lesson
status: published
tags: ["Architecture", "Pretraining"]
---

<section id="beyond-lecture">
<div class="tag">Outlook · reference sections 1.5 and 2.3; where to go next</div>

<div class="table-wrap"><table><thead><tr><th>Architecture</th><th>Main information path</th><th>Typical uses and examples</th></tr></thead><tbody><tr><th>Encoder-only</th><td>Input positions interact in both directions</td><td>BERT-like: representation learning, classification, retrieval</td></tr><tr><th>Decoder-only</th><td>Reads the preceding text, predicts later tokens causally</td><td>GPT-like: continuation, chat, and understanding tasks expressed as generation</td></tr><tr><th>Encoder–Decoder</th><td>Encodes the source; the decoder reads it through cross-attention</td><td>T5 and the original Transformer: translation, summarisation, other sequence-to-sequence tasks</td></tr></tbody></table></div>
<p>These are structures and common usage patterns. Architecture alone does not rank models by capability. Decoder-only models also process and understand input; a standard BERT does not use GPT-style autoregressive generation, but “no encoder can ever generate” is equally too absolute.</p>
<div class="flow"><span class="chip">architecture design</span><span class="arrow">+</span><span class="chip">data and training</span><span class="arrow">→</span><span class="chip">pretrained base</span><span class="arrow">→</span><span class="chip">task adaptation / instruction training</span><span class="arrow">→</span><span class="chip">applications and tool systems</span></div>
<p>This lecture covers “how the network computes”. Pretraining, instruction training, preference optimisation, KV Cache, RoPE, GQA and agent engineering are left for later topics; here we only connect them to lecture 1.</p>
<p class="source">Supplementary material: the original copy of <a href="https://github.com/datawhalechina/hello-agents">LLM Foundations — Large Model Technology and Development</a>. This page follows its explanation style and corrects some over-simplifications and inconsistencies; it is not CME295 slide text.</p>
</section>
