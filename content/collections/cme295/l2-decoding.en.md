---
slug: l2-decoding
title: "Decoding: greedy, beam, temperature and constrained generation"
collection: cme295
lecture: 2
lang: en
description: "Use one line segment and two draws to pin down greedy, beam, Top-k, Top-p, temperature, and why requiring JSON is not the same as being correct."
order: 80
kind: lesson
status: published
tags: [Decoding, Temperature, Top-p, Beam search, JSON, Beginner]
---

## 1. The model gives probabilities; text is chosen

Pages 89–123 of the PDF.

Pick up where the last section left off: the model emits a score (logit) for each vocabulary entry, and softmax turns scores into probabilities. With just two candidates:

```text
reading  : 0.6
sleeping : 0.4
```

This whole section answers one question: <strong>given those probabilities, how does one token actually get produced?</strong>

```text
context → network → logits → probabilities → 【selection】→ token → append → repeat
```

Change what is inside the brackets and the model itself is untouched. That is the most important sentence here, and it explains a common confusion: two different answers to one question often mean a randomised selection strategy, not a changed model.

## 2. Greedy: take the current maximum every step

<strong>Greedy decoding</strong> is minimal: `argmax`, the highest probability.

For the distribution above, it always takes `reading`.

<strong>Benefits</strong>: simple, deterministic, fast.

<strong>Cost</strong>: a locally best step is not a globally best sequence. Here is a complete two-step counterexample. Step one gives A with 0.6 and B with 0.4; the conditional step two is:

| Chosen prefix | Next is X | Next is Y | Joint probability of two steps |
| --- | --- | --- | --- |
| A | 0.51 | 0.49 | P(AX)=0.6×0.51=0.306 |
| B | 0.99 | 0.01 | P(BX)=0.4×0.99=0.396 |

Greedy takes A first, then X after it, producing AX at 0.306. But BX has 0.396, higher.

The reason is clear: greedy discarded the whole B path at step one, even though B is nearly certain to be followed by X. <strong>Keeping several prefixes avoids this loss</strong> — exactly the idea of beam search.

## 3. Beam search: hold k paths at once

<strong>Beam search</strong> does not throw away second-best options; it keeps the k best prefixes at each step (k is the beam width).

With k=2 and the probabilities above:

```text
step one keeps: A(0.6), B(0.4)
step two expands:
  AX = 0.6 × 0.51 = 0.306
  AY = 0.6 × 0.49 = 0.294
  BX = 0.4 × 0.99 = 0.396
  BY = 0.4 × 0.01 = 0.004
keep the top two: BX(0.396), AX(0.306)
```

It recovers the BX that greedy missed.

In practice log-probabilities are summed instead of multiplying probabilities, because long products underflow to zero:

```text
log P = Σ log pᵢ
```

<strong>Boundaries</strong>: beam search is a restricted search, not a global optimum; sequences of different lengths are not directly comparable without length normalisation; a wider beam is slower; and "highest probability" is not "most useful, most truthful or most creative".

## 4. Sampling: draw from the distribution

Back to `[0.6, 0.4]`. <strong>Sampling</strong> draws once according to probability.

Simulate it on paper: draw a unit segment, `reading` occupying the left 0.6 and `sleeping` the right 0.4. A uniform random number decides:

- 0.3 → left segment → `reading`
- 0.7 → right segment → `sleeping`

Averaged over many draws, `reading` appears about 60% of the time, but any single draw may pick any non-zero candidate.

<strong>Why does this matter?</strong> Greedy is deterministic: the same prompt always gives the same answer. The slides note that if you and a friend both type "hello" and receive identical replies, the bot feels mechanical. Humans vary their wording for similar questions.

<strong>Randomness is not always good.</strong> The slides also note when determinism is wanted:

- reproducible experiments and evaluations;
- tasks such as summarisation where stable output is desirable;
- using a model as a judge, where scores should be consistent.

So this is a tunable parameter, not a binary choice.

## 5. Top-k and Top-p: prune, then sample

Sampling from the full vocabulary is risky: with tens or hundreds of thousands of entries, absurd long-tail tokens can be drawn. Two pruning methods:

### Top-k: keep the first k

With k=2, keep the top two, whose mass is 0.65, and renormalise:

```text
[0.40, 0.25] / 0.65 ≈ [0.6154, 0.3846]
```

Then draw from those two.

Note: Top-k is not "force a different word every k steps", nor "join the top k words into a sentence"; it only restricts the candidate set.

### Top-p (nucleus sampling): keep a probability mass

Sort by probability, accumulate, and take the smallest prefix whose cumulative mass <strong>first reaches or exceeds p</strong>.

For `[0.40, 0.25, 0.20, 0.10, 0.05]`:

| p threshold | Kept | Original mass | After renormalisation |
| --- | --- | --- | --- |
| 0.60 | [0.40, 0.25] | 0.65 | [0.6154, 0.3846] |
| 0.80 | [0.40, 0.25, 0.20] | 0.85 | [0.4706, 0.2941, 0.2353] |
| 0.90 | [0.40, 0.25, 0.20, 0.10] | 0.95 | [0.4211, 0.2632, 0.2105, 0.1053] |

The key point: <strong>p=0.8 does not mean "keep words with probability below 0.8"</strong>, and it does not fix the number of words. Adding the third item jumps the total from 0.65 to 0.85, already past 0.8, so it stops there.

When Top-k and Top-p are used together, the order and conventions depend on the serving stack.

## 6. Temperature: controlling the steepness

Temperature T acts inside softmax:

```text
pᵢ(T) = exp(zᵢ / T) / Σⱼ exp(zⱼ / T)
```

- T < 1: a <strong>sharper</strong> distribution, favouring high scores.
- T = 1: unchanged.
- T > 1: a <strong>flatter</strong> distribution, giving low scores more chance.

### Simulate again on the unit segment

Original `[0.6, 0.4]`, now move T from 1 to 0.5. Dividing scores by 0.5 multiplies them by 2, which after exponentiation squares the original probabilities before renormalising:

```text
0.6² = 0.36, 0.4² = 0.16
renormalise: 0.36/(0.36+0.16) = 0.36/0.52 ≈ 0.6923
new distribution ≈ [0.6923, 0.3077]
```

The left segment stretches from 0.6 to 0.6923. A draw of 0.7 <strong>lands right of the boundary before and after</strong>, still `sleeping`. But a draw of 0.65:

- original: 0.65 > 0.6 → `sleeping`
- new: 0.65 < 0.6923 → `reading`

Same random number, different temperature, different result.

<strong>Two frequent misreadings:</strong>

1. Temperature does not reorder candidates. Dividing by a positive number preserves order; it changes probability gaps.
2. Temperature is a continuous dial, not an on/off switch.

<!-- lab:l2-temperature -->

### What T=0 means

Mathematically T=0 divides by zero and is undefined. An API's `temperature=0` is a convention meaning greedy or near-deterministic mode.

"T→0⁺ concentrates on the top item" also assumes the maximum is unique. With ties, tie-breaking rules decide.

## 7. Why T=0 still does not guarantee reproduction

Pages 115–116 address this. Intuitively, fixed weights, fixed input and fixed arithmetic should give a fixed result. One factor is easily overlooked: <strong>batching</strong>.

The inference engine packs your request with others into one batch. Floating-point addition is not associative:

```text
(10¹⁶ + (−10¹⁶)) + 1 = 1
10¹⁶ + ((−10¹⁶) + 1) = 0
```

(under IEEE 754 double precision)

A different summation order changes the result slightly. When two candidates are nearly tied, that tiny difference flips the argmax.

The phenomenon is called the absence of batch invariance. The slides recommend Horace He's post on the topic.

<strong>True reproduction needs more than temperature</strong>: model version, prompt template, tool outputs, random seed, runtime and batching configuration must all be controlled.

## 8. Constrained decoding: only legal continuations

Industrial use often needs structured output such as JSON. Malformed output breaks downstream parsing.

<strong>Approach one</strong>: just ask. "Return JSON." Most current models comply, but not 100%.

<strong>Approach two</strong>: <strong>guided (constrained) decoding</strong>, which restricts legal next tokens by grammar:

```text
model logits → grammar state check → set illegal candidates to −∞
→ renormalise over the legal set → choose
```

For a target `{"age": 33}`, once the prefix is `{"age":`, the grammar state knows an integer must begin, so tokens that cannot start a number are masked.

<div class="flow"><span class="chip">model logits</span><span class="arrow">+ grammar state →</span><span class="chip">mask illegal candidates</span><span class="arrow">→ choose →</span><span class="chip">update state</span></div>

<strong>A boundary worth stating clearly</strong>: characters and tokens are not one-to-one. A token may contain several characters, so an implementation must map tokens to grammar states rather than treat each token as one character.

<strong>The more important boundary</strong>: <strong>syntactically valid is not factually correct.</strong> A schema-conforming `age: 33` may be invented. Correctness requires field validation, source checks and business verification.

## 9. One table to remember the strategies

| Strategy | Random? | Main benefit | Main risk |
| --- | --- | --- | --- |
| Greedy | no | simple, reproducible | local-optimum traps |
| Beam search | no | several prefixes considered | slow; top probability ≠ best output |
| Pure sampling | yes | diverse, natural | absurd tokens possible |
| Top-k | yes | trims the tail | fixed k ignores distribution shape |
| Top-p | yes | adapts to the distribution | threshold needs tuning |
| Temperature | yes (with sampling) | continuous control of diversity | high T drifts off topic |
| Constrained decoding | depends | format guarantees | does not guarantee content |

## 10. Check your understanding

<details><summary>Why can Top-p=0.8 keep a cumulative mass of 0.85?</summary><p>Because candidates cannot be split in half. Adding the third item jumps the total from 0.65 to 0.85, first crossing the threshold, and the kept set is renormalised.</p></details>
<details><summary>Does lowering temperature change the ranking of the most likely token?</summary><p>No. Dividing by a positive temperature preserves logit order and only changes probability gaps. Actual output may still differ through sampling, rounding and tie-breaking.</p></details>
<details><summary>Does constrained decoding guarantee a correct answer?</summary><p>No. It guarantees syntactic or structural validity only; truth still depends on data validation and factual checks.</p></details>

Source: PDF pages 89–123 and the transcript; pages 108 and 112 were visually checked. The beam counterexample, segment sampling simulation, temperature calculation and floating-point example are teaching additions.
