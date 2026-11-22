---
slug: l4-grpo-refinements
title: "GRPO refinements: length, difficulty and exploration bias"
collection: cme295
lecture: 4
lang: en
description: "See the weight difference between per-answer and per-token averaging, and read DAPO, Dr.GRPO and asymmetric clipping carefully."
order: 90
kind: lesson
status: published
tags: [DAPO, Dr.GRPO, Length bias, Exploration]
---

## 1. Longer outputs — does the model reason better?

PDF pages 95–110 observe that in some RL training the accuracy plateaus while mean answer length keeps growing. Longer may come from more useful computation, or from objective weights, stopping behaviour, reward design or other factors.

One length curve cannot establish “there is only one cause for every increase in length”, nor that more thinking tokens are necessarily more correct.

## 2. Why does the averaging scheme matter?

The common GRPO structure averages tokens within each answer, then averages over the G answers. The external coefficient of every token in answer i is `1/(G T_i)`.

Two answers in one group, of lengths 2 and 6:

<!-- lab:l4-length-weight -->

With per-sequence averaging the per-token coefficients are 0.25 and 0.0833, while the total weight of each answer is 0.5. With whole-batch token averaging every token gets 0.125, so the answer totals become 0.25 and 0.75.

The table compares external normalisation only; the real objective also multiplies by ρ, the advantage, clipping and gradients, so the coefficients alone cannot predict the training outcome.

## 3. Why is a long answer with a negative advantage a warning sign?

When tokens contribute equally and the advantage is negative, a long answer gives each token a smaller negative weight, so the local suppression can be weaker. That is the slides’ intuition about length incentives.

**But one necessary correction:** if every token of an answer counts and every term is identical, the total contribution after per-answer averaging is independent of length. It is wrong to write “the longer it is, the closer the whole negative objective is to 0”. Length bias involves token-level gradients, shared parameters, EOS, rewards and sampling interacting.

## 4. What do DAPO and Dr.GRPO change?

The slides focus on the following directions rather than reproducing every algorithm in full:

- DAPO-style token averaging: `Σ_i Σ_t f_i,t / Σ_i T_i`, giving every valid token in the batch the same external coefficient.
- Dr.GRPO-style changes: do not use each answer’s actual length as its own denominator; use a global fixed normalisation, and study the difficulty bias introduced by the reward standard deviation.

The slide diagram omits some fixed factors for Dr.GRPO. Real implementations may include constants such as a fixed maximum length; check the specific version instead of deleting an entire normalisation without saying so.

Changing these coefficients changes the relative weight of samples of different lengths; token averaging also raises the total weight of long answers, so it is not a free universal fix.

## 5. Reward standard deviation and difficulty

For a binary reward with within-group proportion q, the population standard deviation is `sqrt(q(1−q))`. When q is near 0 or 1 the deviation is small, and after normalisation a few outcomes can get a large magnitude.

Teaching example with G=4:

| Reward group | Mean | Population std | Normalised advantage |
| --- | --- | --- | --- |
| [1,1,0,0] | 0.5 | 0.5 | [1,1,−1,−1] |
| [1,0,0,0] | 0.25 | about 0.4330 | [1.7321,−0.5774,−0.5774,−0.5774] |

Whether the standard deviation is kept, how scaling works across problems and how all-equal rewards are handled all change the weight per problem. “Remove the standard deviation” is not “remove the within-group mean”; keep the two separate.

## 6. Asymmetric clipping and exploration

```text
clip(ρ, 1−ε_low, 1+ε_high)
```

For a candidate whose original probability is 0.001, an upper ε=0.2 corresponds to a ratio of 1.2, i.e. probability 0.0012; an upper ε=0.5 corresponds to 0.0015.

This is the threshold where the surrogate term saturates, not a hard clamp on the candidate’s probability. Widening the upper threshold preserves more upward incentive, but it does not make an unsampled rare candidate appear; sensible sampling and exploration are still required.

## 7. What to watch when choosing a recipe

Record task reward, accuracy on unseen problems, valid token count, answer length, clip fraction, KL and failure samples together. Reporting only mean reward can hide length inflation, over-refusal or regressions in older abilities.

DAPO and Dr.GRPO are refinement leads, not a fixed ranking where “the newer algorithm always wins”. Outcomes also depend on data, verifiers, budget and system implementation.

## Check your understanding

<details><summary>Does whole-token averaging also give every answer the same total weight?</summary><p>No. It gives every valid token the same coefficient; a long answer has more tokens, so its accumulated total coefficient is larger.</p></details>
<details><summary>With two negative-advantage answers, one long and one short, is the long answer’s total objective necessarily smaller?</summary><p>That cannot be inferred. Per-token weights differ, but so does the token count, and the per-term values and gradients matter too. The slides describe a local weighting incentive, not a simple total-quantity theorem.</p></details>

Source: PDF pages 95–110. The binary groups, length coefficients and rare-action thresholds are teaching expansions.
