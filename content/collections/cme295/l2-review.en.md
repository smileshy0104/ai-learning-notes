---
slug: l2-review
title: "Lecture 2 review: one diagram that ties the LLM together"
collection: cme295
lecture: 2
lang: en
description: "Follow one request through every component, then use the six-thread table, terminology corrections and self-test questions to reassemble lecture 2."
order: 100
kind: lesson
status: published
tags: [Review, Terminology, Lecture 2]
---

## 1. One request through every component

The best revision is a timeline through the whole lecture. Take the prompt:

```text
Bear A was 4 years old in 2024. Output the age in 2025 as JSON.
```

1. <strong>Tokenise and check the budget</strong>: split the prompt into tokens and confirm the input and output budgets ([context](l2-context-reasoning.html)).
2. <strong>Enter the network</strong>: tokens become embeddings, and a position mechanism such as RoPE carries ordering ([position](l2-position.html)).
3. <strong>Process layer by layer</strong>: attention reads the visible context; the FFN or MoE processes each position; Pre-Norm and RMSNorm keep values in range ([model families](l2-model-families.html), [MoE](l2-moe.html), [normalisation](l2-normalization.html)).
4. <strong>Reuse the cache</strong>: earlier keys and values already sit in the KV Cache, so the new token computes only its own part ([attention and cache](l2-attention-cache.html)).
5. <strong>Produce a distribution</strong>: the hidden state is projected to logits; temperature reshapes it; Top-k/Top-p prune it ([decoding](l2-decoding.html)).
6. <strong>Constrain and choose</strong>: with guided decoding enabled, continuations that break JSON grammar are masked before one token is selected.
7. <strong>Append</strong>: the chosen token joins the context and step 1 repeats until an end token.
8. <strong>Verify</strong>: check that the JSON parses, then check that age really equals 5.

That last step is often forgotten: <strong>valid syntax, correct arithmetic and accurate facts are three different things.</strong>

This is a teaching composition; it does not claim every model uses MoE, GQA and the same normalisation.

## 2. The six threads in one table

| Chapter | Hold on to this sentence | Typical misconception |
| --- | --- | --- |
| Model families | the difference is what one position may see | "decoder-only cannot understand input" |
| Scaling laws | parameters, data, training and inference budgets jointly decide | "a bigger model is always cheaper" |
| Expert routing | each token runs only a few experts | "total parameters equal activated parameters" |
| Architecture optimisations | position, visible range, cache, shared heads, normalisation each do a job | "GQA is just a shorter window" |
| Decoding | the model gives probabilities; the strategy chooses | "Top-p=0.8 keeps 80% of the words" |
| Prompting and reasoning | organise context, examples and sampling without touching weights | "fluent explanation proves faithful, correct reasoning" |

## 3. Warm-up

For the prefix `A cute teddy bear is`, the model scores `reading` highest, yet sampling selects `sleeping`. Which token goes back into the model, and which earlier computation can be reused?

<details><summary>Open to check</summary><p>The selected token, `sleeping`, is appended. The new position computes its own query, key and value, then reads the visible positions with that query. Prefix keys and values already sit per layer in the KV Cache and can be reused. For the first part, revisit greedy decoding versus sampling; for the second, revisit Prefill and Decode in attention efficiency.</p></details>

## 4. Self-test by topic

<details><summary>Q1: why may BERT's MLM look to the right?</summary><p>Selected input positions are masked or corrupted, and the task restores them from surrounding context. It is not copying from an unmasked target position; the implementation still specifies which positions are predicted and how the loss is built.</p></details>
<details><summary>Q2: Top-2 routing probabilities [0.55,0.25,0.15,0.05]; after renormalising, what are the first two weights?</summary><p>Retained mass 0.55+0.25=0.8, so the weights are 0.6875 and 0.3125. State whether a given model uses this convention; some do not renormalise.</p></details>
<details><summary>Q3: KV heads drop from 8 to 2 with everything else fixed — how much does the cache shrink?</summary><p>The simplified byte formula is proportional to h_kv, so the cache becomes one quarter; end-to-end speed is not guaranteed to improve 4×.</p></details>
<details><summary>Q4: logit order is unchanged, so why does temperature change the output?</summary><p>Dividing by a positive temperature preserves order but changes the softmax probability gaps; when sampling, the chance of drawing each candidate changes.</p></details>
<details><summary>Q5: the sinusoidal dot product depends only on m−n; does all attention therefore depend only on distance?</summary><p>No. That property describes the position encoding itself; real attention also depends on token content, projections and later layers. The RoPE derivation keeps the content vectors and a relative rotation term rather than erasing content.</p></details>
<details><summary>Q6: does majority voting over 5 generations guarantee a more correct answer?</summary><p>No. Several samples may share one misconception. You need genuine diversity plus independent verification, and the cost usually rises.</p></details>

## 5. Debugging exercise

A user says: "I put a long toy catalogue in the prompt. The model returned valid JSON, but bear A's age is wrong." Write down your first comparison, then open the answer.

<details><summary>How do you separate retrieval, arithmetic and format problems?</summary><p>With the original prompt, ask the model to quote bear A's year and age, and compare against the catalogue. If the quote is wrong, long-context retrieval may be involved; retry with only the relevant record. If the quote is right, independently compute the year difference and check the integer. Parsing the JSON only tests syntax. The quote, the calculation and the parse result are three separate pieces of evidence pointing at the failing step.</p></details>

## 6. Subtitle terminology corrections

| Subtitle rendering | Correct term | Meaning |
| --- | --- | --- |
| "law master's degree" | LLM | large language model |
| "transformer" (as an electrical device) | Transformer | the neural architecture |
| recursive, auto-response, auto-increment | Autoregressive | conditional generation one token at a time |
| training failures, flops failures | FLOPs | total floating-point operations |
| molecular orbital, ministry of education, emo | MoE | mixture of experts |
| rope, ROP | RoPE | rotary position embedding |
| alibi as "absence" | ALiBi | attention with linear biases |
| secret key | Key | the attention key, not a cryptographic key |
| responsible person, head | Head | attention head |
| pre-surgery / post-surgery normalisation | Pre-Norm / Post-Norm | order of normalisation; badly mistranslated |
| needle in the hash stack | Needle in a Haystack | long-context retrieval evaluation |
| "LLM course" rendered as MoE | LLM course | unrelated to mixture of experts; do not confuse |

## 7. Which claims need boundaries

- Being able to compute any position does not mean reliable extrapolation to any length.
- Higher token efficiency does not mean lower per-token compute or serving cost.
- Expert names are sub-networks, not guaranteed human-like subject specialisation.
- RMSNorm does not require zero-centred output; Pre-Norm is not a normalisation formula.
- Zero temperature does not mean absolute reproducibility in a serving environment.
- Constrained decoding limits form, not factual or business correctness.
- More context, more examples and more samples all need measured benefit and cost.

## 8. Sources

Paper leads come from the slides: BERT (2018), GPT (2018), Kaplan scaling (2020), Chinchilla (2022), sparse MoE (2017), Switch Transformer (2021), DeepSeekMoE (2024), RoFormer (2021), Longformer (2020), LayerNorm (2016), RMSNorm (2019), few-shot (2020), CoT and self-consistency (2022). Years follow the slides and common citation practice, not every date in the transcript.

Leaderboards and product specifications are as of the material date; every numeric example is a teaching construction, recomputed by script.
