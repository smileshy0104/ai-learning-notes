---
slug: l2-review
title: "Lecture 2 review: one comparison table for the whole lecture"
collection: cme295
lecture: 2
lang: en
description: "A recap of the six lecture threads, subtitle terminology corrections, worked self-test answers and sources."
order: 100
kind: lesson
status: published
tags: [Review, Terminology, Lecture 2]
---

## 1. How does one request pass through this lecture’s components?

Suppose a decoder-only model is prompted: “Bear A is 4 years old in 2024; output the 2025 age as JSON.”

1. Tokenise the prompt and template; check the input and output budget.
2. Tokens enter the model; layers build position-aware matches with a position mechanism such as RoPE.
3. Attention reads the context within the allowed range; the FFN or MoE processes each position.
4. Components such as Pre-Norm and RMSNorm are fixed by the architecture, not switches flipped at inference.
5. The output hidden representation projects to logits; temperature and candidate rules shape the choice.
6. If constrained decoding is supported, continuations that violate the JSON/schema are masked.
7. The new token is appended to the context; KV Cache reuses earlier results.
8. Stop at the end condition, then check that age equals 5 — not merely that the JSON parses.

This is a teaching combination; it does not mean every model uses MoE, GQA or the same normalisation.

## 2. The six threads in one table

| Slide chapter | What to remember | Common mistake |
| --- | --- | --- |
| Model families | Encode a representation or predict causally; the visible input range differs | “decoder-only does not understand its input” |
| Scaling laws | Parameters, data, training and inference budgets jointly shape the plan | “a bigger model is always cheaper to serve” |
| Expert routing | Each token may execute only a few experts | “total parameters equal activated parameters” |
| Architecture optimisation | Position, access range, cache, shared heads and normalisation each have a job | “GQA is just a shorter window” |
| Decoding | After logits there is still a choice to make | “Top-p=0.8 keeps 80% of the words” |
| Prompting and reasoning | Organise context, examples and sample aggregation without touching weights | “a fluent explanation proves the internal reasoning is real and correct” |

## 3. Self-test with answers

<details><summary>Q1: Why may BERT’s MLM look to the right?</summary><p>The selected input positions are masked or corrupted, and the task is to restore the original words using the surrounding context. It is not copying the answer from an unmasked target position; the implementation still has to respect which positions are predicted and how the loss is built.</p></details>
<details><summary>Q2: With Top-2 routing probabilities [0.55,0.25,0.15,0.05], what are the first two weights after renormalisation?</summary><p>Retained mass 0.8, so the weights are 0.6875 and 0.3125. State explicitly whether a given model uses this normalisation convention.</p></details>
<details><summary>Q3: If the KV heads drop from 8 to 2 with everything else fixed, how much does the cache shrink?</summary><p>The simplified byte formula is proportional to h_kv, so the cache becomes 1/4 of the original; end-to-end speed is not guaranteed to improve 4×.</p></details>
<details><summary>Q4: Logit ordering is unchanged — why does temperature still change the output?</summary><p>Dividing by a positive temperature keeps the order but changes the softmax probability gaps; when sampling from that distribution, the chance of drawing each candidate changes.</p></details>
<details><summary>Q5: The sinusoidal dot product depends only on m−n; does that mean all attention depends only on distance?</summary><p>No. That property is first about the PE dot product itself; actual token content, projections and later layers still affect the score. The RoPE derivation keeps the content vectors and a relative rotation term; it does not erase content.</p></details>
<details><summary>Q6: Does majority voting over 5 generations guarantee a more correct answer?</summary><p>No guarantee. Several answers may share the same misunderstanding, so you need meaningful diversity plus independent verification; the cost usually rises too.</p></details>

## 4. Subtitle terminology corrections

| Subtitle artefact | Correct term | Meaning |
| --- | --- | --- |
| 法学硕士 (literally “master of laws”) | LLM | large language model |
| 变压器 (literally “transformer device”) | Transformer | the neural-network architecture |
| 递归、自動回應、自動遞增 | Autoregressive | generating token by token, conditioned on the prefix |
| 训练失败次数、flops 失败 | FLOPs | total floating-point operations |
| 分子轨道、教育部、emo | MoE | mixture of experts |
| 繩子、ROP | RoPE | rotary position embedding |
| 不在場證明 (literally “alibi”) | ALiBi | attention with linear biases |
| 密钥 (literally “crypto key”) | Key | the attention key, not a cryptographic key |
| 负責人、头部 | Head | attention head |
| 术前／术后正常化、色情内容 | Pre-Norm / Post-Norm | normalisation placement; a serious subtitle mistranslation |
| 哈希堆叠中的针 | Needle in a Haystack | a long-context retrieval evaluation idea |

## 5. Which claims need boundaries?

- Being able to compute encodings for longer positions is not the same as reliably extrapolating to unbounded context.
- Better token efficiency is not lower cost per token or per request.
- Expert names are subnetworks; they do not guarantee human-like subject specialisation after training.
- RMSNorm does not require a centred output, and Pre-Norm is not a normalisation formula.
- Temperature zero is not an absolute reproducibility promise in a serving environment.
- Constrained decoding restricts form; it does not prove factual or business correctness.
- More context, more examples and more sampling all need measured benefit against cost.

## 6. Sources

The main paper leads come from the slides: BERT (2018), GPT (2018), Kaplan scaling work (2020), Chinchilla (2022), sparse MoE (2017), Switch Transformer (2021), DeepSeekMoE (2024), RoFormer (2021), Longformer (2020), LayerNorm (2016), RMSNorm (2019), few-shot prompting (2020), CoT and self-consistency (2022). Years follow the slides and common citation practice rather than every subtitle date.

Product leaderboards and specifications in the slides are as of the material’s date; numeric examples here are teaching constructions.
