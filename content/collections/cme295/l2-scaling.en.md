---
slug: l2-scaling
title: "Scaling laws: parameters, data and compute budget"
collection: cme295
lecture: 2
lang: en
description: "Separate sample efficiency from compute efficiency, and use a fixed-budget example to see where Chinchilla and “bigger is better” stop."
order: 30
kind: lesson
status: published
tags: [Scaling laws, Chinchilla, FLOPs, Compute]
---

## 1. What is a scaling law?

Pages 22–34 of the PDF. A scaling law is an empirical regularity: under a given model, data and training setup, how does test loss change with parameters N, training tokens D and compute C?

A common intuition is `L ≈ irreducible loss + A/N^α + B/D^β`. That is a teaching summary, not a single formula this course claims holds for every model. Exponents and constants must be fitted from specific experiments.

**Why it matters**: training large models is expensive, so you cannot try every scale in full. Small-scale experiments inform planning at large scale.

## 2. What do more parameters and more data each solve?

| Factor | Intuition | What does not follow |
| --- | --- | --- |
| Parameters N | More learnable capacity | Every task gets better |
| Data D | More training signal and coverage | Low-quality data equals high-quality data |
| Compute C | Room for more or larger steps | Equal FLOPs implies equal results |

Slide 24 stresses that larger models were more **token-efficient** in those experiments: fewer training tokens to reach a given loss. But each token costs more compute, so this does not mean less compute or energy.

Example: a small model needs 1000 examples and a large model needs 600 to hit the target. If the large model costs 3× per example, the totals are 1800 versus 1000: fewer samples, more compute. The numbers only illustrate the idea.

## 3. FLOPs versus FLOP/s: one time unit apart

- FLOPs: total floating-point operations, like distance.
- FLOP/s (also written FLOPS): operations per second, like speed.
- Ideal time estimate: total operations ÷ operations per second.

```text
total compute = 1.2×10¹⁸ FLOPs
effective rate = 2×10¹⁴ FLOP/s
ideal time = 6000 seconds ≈ 1.67 hours
```

The effective rate is not the GPU’s advertised peak. Data loading, communication, memory and utilisation all affect real time. The subtitle’s “number of training failures” is a mistranslation of FLOPs.

## 4. Under a fixed budget, N and D cannot both grow without bound

**Supplementary approximation**: the main training compute of a dense Transformer is sometimes estimated as `C ≈ 6ND`. It ignores part of attention, embeddings and system costs; long sequences or unusual structures make the error larger.

For example, with `C = 1.2×10²⁰ FLOPs`:

| Parameters N | D from C≈6ND |
| --- | --- |
| 1×10⁹ (1B) | 2×10¹⁰ (20B tokens) |
| 2×10⁹ (2B) | 1×10¹⁰ (10B tokens) |
| 4×10⁹ (4B) | 5×10⁹ (5B tokens) |

All three spend roughly the same budget, but the larger model sees less data. The true optimum needs loss experiments, not picking the largest N from a multiplication table.

## 5. Chinchilla: model and data must match

Slides 27–28 introduce Hoffmann et al. (2022) on compute-optimal training, with the well-known order-of-magnitude rule: **about 20 training tokens per parameter**.

```text
D ≈ 20N
70B parameters × 20 ≈ 1.4T training tokens
```

Training tokens count what is processed during training, including repetition; that is not necessarily the deduplicated size of an independent corpus.

The slides compare the smaller, data-rich Chinchilla with the larger, data-poor Gopher, noting that many models of that era were “too large and undertrained” for their training budget.

**Boundary**: 20:1 is an empirical result from a particular research setting, not a hard rule for every model. When serving many requests for a long time, a deployer may prefer a smaller, better-trained model to cut long-run inference cost.

## 6. What counts as a “large language model”?

A language model assigns probabilities to token sequences. The course introduces LLMs through models with large parameters, data and compute, focused on the decoder-only Transformer.

“Large” has no single precise parameter threshold; LLM and decoder-only are not logical synonyms. MoE total parameters and activated parameters are also different things; see [expert routing](l2-moe.html).

## Check your understanding

<details><summary>If model A reaches the same loss with fewer training tokens, is it necessarily cheaper?</summary><p>Not necessarily. You also need the per-token compute cost, hardware utilisation and inference cost. Sample efficiency, compute efficiency and serving cost are different metrics.</p></details>
<details><summary>Why can’t the 20:1 ratio be applied unchanged to every MoE model?</summary><p>When architecture, routing, activated computation and data change, the fitted relationship can change too. The course Q&amp;A suggests starting from small-scale experiments.</p></details>

Source: PDF pages 23–34, Kaplan et al. 2020, Hoffmann et al. 2022; the 6ND estimate and budget table are teaching additions.
