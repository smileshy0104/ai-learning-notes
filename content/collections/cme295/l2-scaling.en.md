---
slug: l2-scaling
title: "Scaling laws: parameters, data and compute budget"
collection: cme295
lecture: 2
lang: en
description: "Use a training-budget metaphor to separate parameter count, data volume and compute, hand-calculate an allocation at fixed budget, and read Chinchilla's 20:1."
order: 30
kind: lesson
status: published
tags: [Scaling laws, Chinchilla, FLOPs, Compute, Beginner]
---

## 1. The practical decision behind this section

Pages 22–34 of the PDF.

Suppose you have a fixed training budget: a known number of GPUs for a known number of days. You must choose:

- a 70,000,000,000 (70 billion) parameter model trained on 1,000,000,000,000 tokens, or
- a 20,000,000,000 (20 billion) parameter model trained on 10,000,000,000,000 tokens?

The compute is roughly comparable, but the results may differ a lot. Scaling laws are empirical regularities that let you estimate which is the better use of the budget before spending it.

Pages 23–26 show the 2020 Kaplan et al. observation: bigger models, more tokens and more compute lower test loss, following remarkably smooth curves. Pages 27–28 show the 2022 Chinchilla correction: <strong>not simply bigger, but parameters and data kept in proportion.</strong>

## 2. Three quantities, not one word "big"

Beginners collapse three different things into "model size". They differ, and they trade off.

| Name | Symbol | What it is | Metaphor |
| --- | --- | --- | --- |
| Parameter count | N | how many learnable numbers the model has | the size of a student's brain |
| Training tokens | D | how many tokens are read during training | how many exercises were done |
| Compute | C | how many floating-point operations training performed | total study hours |

"Bigger models perform better" must be completed: <strong>on what data, at what budget, measured by what evaluation.</strong> Otherwise it is not actionable.

One unit detail matters:

- <strong>FLOPs</strong>: total floating-point operations, like distance, counted in operations.
- <strong>FLOP/s</strong>: operations per second, like speed, describing hardware.

The subtitle's "training failures" is a mis-transcription of FLOPs. Large model training sits around 10²⁵ FLOPs, while one GPU may be rated 10¹⁴ to 10¹⁵ FLOP/s. Mixing the two produces the absurd result that a single machine finishes in seconds.

## 3. Why more parameters and more data both lower loss

### More parameters, more capacity

Parameters are the adjustable knobs inside the model. More knobs mean more complex patterns can be represented. But knobs without data cannot be set correctly, like owning professional paints without ever seeing a painting.

### More data, more patterns seen

More tokens mean more linguistic phenomena, more collocations, more long-tail cases. But data without capacity hits a bottleneck: the model cannot take it all in.

### The two constrain each other

This is the core picture: loss decreases with N and with D, with diminishing returns per doubling. Page 24 adds a widely missed point: <strong>at the same target loss, larger models need fewer tokens</strong> — higher token efficiency. That does not mean cheaper overall, because each token costs more to process.

A teaching calculation:

```text
small model: 1000 examples at cost 1 each → 1000 units
large model:  600 examples at cost 3 each → 1800 units
```

Fewer samples, more compute. That is why "larger models are more efficient" is only half a sentence.

## 4. Hand calculation at a fixed budget

A rough estimate for dense Transformer training:

```text
C ≈ 6 × N × D
```

Why 6? Roughly, the forward pass costs about 2 operations per parameter (multiply and add) and the backward pass about 4, totalling about 6. The formula ignores attention growth with sequence length, embeddings and communication, so treat it as an order-of-magnitude tool.

Given `C = 1.2×10²⁰ FLOPs`, how much data fits at different N?

| Parameters N | D solved from C≈6ND | Intuition |
| --- | --- | --- |
| 1×10⁹ (1B) | 2×10¹⁰ (20B tokens) | small model, reads a lot |
| 2×10⁹ (2B) | 1×10¹⁰ (10B tokens) | double parameters, halve data |
| 4×10⁹ (4B) | 5×10⁹ (5B tokens) | double again, halve again |

Writing the exponents in decimal makes the scale concrete: `2×10¹⁰` is about 20 billion tokens and `5×10⁹` is about 5 billion.

Anchor the magnitudes to everyday lengths: one page of course text is about 500 tokens, 2000 tokens is roughly four pages, and 100 thousand tokens approaches a short book. Numbers such as 5 billion and 10 billion belong to training scale, not to one reading.

<strong>Do the first row yourself</strong>:

```text
C = 1.2×10²⁰
D = C / (6N) = 1.2×10²⁰ / (6 × 1×10⁹)
  = 1.2×10²⁰ / 6×10⁹
  = 2×10¹⁰
```

So at fixed budget, doubling parameters requires halving data or overspending. <strong>But this table only says how the budget can be spent, not which spend is better.</strong> Which row wins requires loss measurements from smaller runs — exactly what Chinchilla addresses.

## 5. Chinchilla: about 20 tokens per parameter

Pages 27–28 cover Hoffmann et al., 2022. Fitting many (N, D) combinations produced a widely quoted rule of thumb:

<strong>About 20 training tokens per parameter.</strong>

```text
70B parameters × 20 ≈ 1.4T training tokens
```

It is famous because it overturned prior practice. At equal compute, the slides compare a larger model with less data (Gopher-like) against a smaller model with more data (Chinchilla); the latter reached lower loss. The conclusion was that many large models of the time were *undertrained*: too many parameters for the tokens they read.

Boundaries worth stating:

- 20:1 is fitted to their experimental setting, not a law of physics.
- Training tokens count tokens processed, including repeated passes; that is not the same as a deduplicated corpus size.
- Inference cost is separate. Serving enormous request volumes may favour a smaller, better-trained model, since inference is paid per request.

The transcript mentions a 70B versus 200B+ comparison; parameter counts should follow the slides. Only the order-of-magnitude relationship is asserted here.

## 6. Three bills to consider in practice

| Bill | Driven by | When it dominates |
| --- | --- | --- |
| Training compute | C ≈ 6ND | one-off, usually the largest |
| Training memory and communication | parameters, parallelism, batch size | determines whether you can train at all |
| Inference cost | model size × requests × sequence length | paid continuously after launch |

Chinchilla optimises the effect of the first bill at fixed budget. Real engineering also weighs the other two: a training-optimal model may be too expensive per request to be the commercial optimum.

## 7. What "large language model" means

A language model assigns probability to a token sequence, that is, it predicts the next token. "Large" usually refers to parameters, training data and compute all being big, and today it almost always means a decoder-only Transformer.

Two cautions:

- "Large" has no universal threshold; the bar moves over time.
- LLM is not a synonym for decoder-only. For MoE models, keep total and activated parameters separate — see [expert routing](l2-moe.html).

## 8. Check your understanding

<details><summary>Using C≈6ND: if N goes from 1B to 3B at fixed budget, what happens to D?</summary><p>D = C/(6N), so tripling N leaves one third of the data. This is a direct consequence of the same estimate, not evidence that either option performs better.</p></details>
<details><summary>Does "larger models are more token-efficient" imply "cheaper to train"?</summary><p>No. Token efficiency means fewer tokens for the same loss; cost also depends on per-token compute. In the example, samples drop from 1000 to 600 while unit cost rises from 1 to 3, so the total rises.</p></details>
<details><summary>Why can't 20:1 be applied to every model?</summary><p>It depends on architecture, data distribution and training setup. Changing to MoE, other sequence lengths or different data quality changes the fit. The lecture Q&amp;A also recommends a small-scale check for your own setting.</p></details>

Source: PDF pages 22–34 and the matching transcript; Kaplan et al. 2020, Hoffmann et al. 2022. The 6ND estimate, budget table and cost example are teaching additions, with numbers recomputed by script.
