---
slug: l2-decoding
title: "Decoding strategies: greedy, beam, temperature and constrained generation"
collection: cme295
lecture: 2
lang: en
description: "A probability distribution is not the final answer. Use worked examples to understand sequence search, top-k, top-p, temperature and structured output."
order: 80
kind: lesson
status: published
tags: [Decoding, Temperature, Top-p, Beam search, JSON]
---

## 1. One more step from prediction to choice

Pages 89–123 of the PDF. The model projects its hidden representation to vocabulary logits and applies softmax to get probabilities; **the decoding strategy decides how those probabilities turn into the next token**.

```text
context → network → logits z → probabilities p → choose a token → append to context → repeat
```

This differs from training, which minimises cross-entropy: at inference nothing is back-propagated into the next-token label; a choice is made under a fixed model.

## 2. Greedy: take the highest probability each time

Greedy decoding picks `argmax p`. It is simple; its weakness is that the best single step is not the highest-probability whole sequence.

### A complete two-step counterexample

In the first step A has probability 0.6 and B has 0.4. Conditional distributions for the second step:

| Prefix | next X | next Y | highest two-step joint probability |
| --- | --- | --- | --- |
| A | 0.51 | 0.49 | P(AX)=0.6×0.51=0.306 |
| B | 0.99 | 0.01 | P(BX)=0.4×0.99=0.396 |

Greedy takes A, then X, producing AX; but BX is more likely. Each row’s probabilities sum to 1. The example fixes the length at two steps and does not compare different lengths.

## 3. Beam search: keep several prefixes

With beam width 2, keep A and B first, then expand four candidates:

```text
AX: 0.306    AY: 0.294
BX: 0.396    BY: 0.004
keep BX and AX
```

Log-probabilities are usually added instead of multiplying probabilities, to avoid underflow on long sequences. Real search also handles `[EOS]`, length penalties and stopping conditions.

Beam search is a restricted search and does not guarantee the global optimum; probabilities of different lengths cannot be compared naively either. A larger beam can be slower, and maximum likelihood is not the same as the most useful, most truthful or most creative answer.

## 4. Sampling: draw by probability instead of always taking first place

With candidate distribution `[0.40,0.25,0.20,0.10,0.05]`, the top candidate is chosen about 40% of the time on average — not every time. A single real draw can pick any non-zero candidate.

Randomness suits tasks that need diversity; reproducible extraction and evaluation can prefer deterministic strategies. There is no rule that “random is always better in every setting”.

## 5. Top-k and top-p

### Top-k: keep a fixed number

With k=2, keep the top two, whose total probability is 0.65, and renormalise:

```text
[0.40/0.65, 0.25/0.65] ≈ [0.6154,0.3846]
```

Then sample from these two. Top-k does not force a new word every k steps.

### Top-p: keep a fixed probability mass

Sort probabilities from largest to smallest, take the smallest prefix whose cumulative probability **first reaches or exceeds** the threshold, then renormalise.

| p threshold | kept raw probabilities | raw mass | new distribution |
| --- | --- | --- | --- |
| 0.60 | [0.40,0.25] | 0.65 | [0.6154,0.3846] |
| 0.80 | [0.40,0.25,0.20] | 0.85 | [0.4706,0.2941,0.2353] |
| 0.90 | [0.40,0.25,0.20,0.10] | 0.95 | [0.4211,0.2632,0.2105,0.1053] |

p=0.8 does not mean “keep tokens whose raw probability is below 0.8”, and it does not guarantee a fixed count. When top-k and top-p are both used, check the specific service for order and conventions.

## 6. Temperature: shaping the distribution

```text
pᵢ(T) = exp(zᵢ/T) / Σⱼ exp(zⱼ/T)，T>0
```

- Low T: sharper, favouring high-scoring candidates.
- T=1: the original softmax.
- High T: flatter, so lower-scoring candidates appear more often.

<!-- lab:l2-temperature -->

<strong>Important:</strong> at any finite positive temperature, sampling is not strict greedy decoding. At T=0 the formula divides by zero and is undefined; an API’s `temperature=0` is usually a convention that switches to greedy or near-deterministic mode. As T→0⁺ the mass concentrates on the maximum when it is unique; ties depend on the tie-break rule.

Temperature changes relative probabilities; top-k / top-p truncate candidates. They change the output, they do not retrain the weights, and a lower temperature does not guarantee a more truthful answer.

## 7. Why can temperature zero still fail to reproduce exactly?

Pages 115–116 discuss non-determinism in serving. Fixed weights, input and theoretical operations do not mean every hardware and batch configuration follows the same floating-point path.

```text
(10¹⁶ + (−10¹⁶)) + 1 = 1
10¹⁶ + ((−10¹⁶) + 1) = 0  (under common IEEE 754 double precision)
```

Floating-point addition is not strictly associative. Small differences in kernels, batching, reduction order and numeric precision can flip the argmax when candidate scores are very close. You also need a fixed model version, prompt template, tool results, seed and runtime; setting T=0 alone does not prove exact reproduction.

## 8. Guided decoding: restrict which next tokens are legal

**Definition**: during generation, check the current prefix against a grammar or schema and allow only legal continuations. Illegal candidates can be scored −∞, then the legal set is renormalised and sampled.

For example, the target is `{"age":33}`:

```text
current prefix: {"age":
if the schema requires an integer for age, the next step cannot continue with a normal object key
the legal continuation must form an integer, then close the object
```

These are character-level intuitions. Real tokens may span several characters, so a constrained implementation has to map tokens to grammar states; one token can never be assumed to be one character.

<div class="flow"><span class="chip">model logits</span><span class="arrow">+ grammar state →</span><span class="chip">mask illegal candidates</span><span class="arrow">→ choose →</span><span class="chip">update grammar state</span></div>

**Legal format is not factual correctness**. A schema-valid age can still be invented; field validation, source checks and business verification are still needed. Truncation, refusal and service limits can also cause generation to fail, so no one can promise 100% success in every case.

## Check your understanding

<details><summary>With top-p=0.8, why can the kept mass be 0.85?</summary><p>Because a candidate token cannot be split into “half a candidate”. Adding the third item jumps the cumulative mass from 0.65 to 0.85; we stop at the first threshold reached and renormalise the kept set.</p></details>
<details><summary>Does lowering the temperature change the ranking of the most likely token?</summary><p>Dividing the same finite logits by a positive T does not change their order, but it changes probability gaps. Sampling, other processors, rounding and ties can still affect the actual output.</p></details>

Source: PDF pages 89–123; pages 108 and 112 were visually checked. The beam counterexample, sampling distributions and floating-point example are teaching additions.
