---
slug: l4-grpo
title: "GRPO: replacing the value model with within-group comparison"
collection: cme295
lecture: 4
lang: en
description: "Take the GRPO objective apart term by term, making the group reward, token probability ratio, clipping, reference KL and the difference from PPO explicit."
order: 80
kind: lesson
status: published
tags: [GRPO, Group advantage, PPO comparison]
---

## 1. What does GRPO remove?

PDF pages 67–94. Group Relative Policy Optimization no longer trains a PPO-style value model to supply the baseline; instead it samples several answers to **the same prompt** and compares them using the rewards of that group.

It does not remove evaluation: an RM can be used, and so can verification rules. No value model does not mean no reference, no sampling cost and no bias.

## 2. How is the within-group advantage computed?

Given prompt x, sample G answers o₁,…,o_G with rewards rᵢ:

```text
μ=mean(r₁,…,r_G)
Â_i=(r_i−μ)/(std(r₁,…,r_G)+ε_num)
```

Here ε_num is a numerical-stability constant, not PPO’s clipping width ε_clip. The hand calculation here uses the population standard deviation and sets the advantage to 0 when all rewards are equal.

Example with G=4 and rewards [1,1,0,0]: μ=0.5, std=0.5, advantages [1,1,−1,−1]. When all are correct or all wrong there is no within-group variation; the group can be skipped, resampled or combined with other objectives — never divided by zero.

You can revisit these cases in [lecture 3’s group-advantage experiment](l3-reasoning.html).

## 3. Which positions does one advantage apply to?

In common outcome supervision, every valid output token of answer i uses the same Â_i, but the per-position ρ and log-probability gradients differ.

```text
ρ_i,t = πθ(o_i,t | x,o_i,<t) / π_old(o_i,t | x,o_i,<t)
f_i,t = min(ρ_i,t Â_i, clip(ρ_i,t,1−ε,1+ε) Â_i)
```

So “the same advantage” is not “every token has an identical gradient vector”, nor “every step is judged correct”.

## 4. The slide objective, term by term

A structure matching the slides (average over tokens first, then over answers):

```text
J_GRPO = E_x, o_i~π_old [
  (1/G) Σ_i (1/T_i) Σ_t (f_i,t − β K_i,t)
]
```

- G: number of answers to the same prompt.
- T_i: number of valid output tokens in answer i.
- f: the PPO-style locally clipped surrogate term.
- K: a KL term, or an estimate of it, between the current policy and the reference.
- Samples, old log-probabilities, rewards and advantages are fixed within the batch; current log-probabilities are trainable.

Where the KL is inserted, how it is estimated and what is detached must be stated explicitly; this skeleton does not replace trainer code.

### A small worked case

G=2, each answer has 2 tokens; advantages +1 and −1; current/old ratios are [1.1,1.3] and [0.9,0.7]; ε=0.2, KL omitted.

```text
first clipped terms: [1.1,1.2] → mean 1.15
second clipped terms: [−0.9,−0.8] → mean −0.85
mean over the two answers: (1.15−0.85)/2=0.15
```

This is not “15% accuracy”; it is the surrogate objective under this batch’s hypothetical values. If both mean KLs were 0.02 and β=0.1, the objective would be 0.148.

## 5. PPO versus GRPO

| Part | Common PPO recipe for LLMs | Outcome-supervised GRPO |
| --- | --- | --- |
| baseline | value estimate | within-group reward for the same prompt |
| advantage granularity | often token-level estimates | often one answer-level advantage shared by tokens |
| trains a value model | usually yes | no |
| current/old ratio | yes | yes |
| clipping | common | common |
| reference KL | common in RLHF, inserted in various places | often explicit, or a different implementation |
| RM | usually needed for human-preference recipes | unnecessary when rewards are verifiable |

The blue boxes in the slide diagram mark frozen model roles and yellow marks the policy; the value model in PPO still has to be trained. Real systems can share resources, so the diagram does not prove a fixed number of memory copies.

## 6. Limits of GRPO

Relative comparison within a group does not guarantee lower variance for every problem; small reward standard deviation, the number of samples, temperature and problem difficulty all affect the signal.

More importantly, an answer that ends correctly while claiming “climbed out of the sealed box” can still receive a positive advantage. GRPO drops the value model but does not conjure up true token attribution.

The next page discusses recipe details such as length, standard deviation and exploration; after that, teacher per-token signals lead into OPD.

## Check your understanding

<details><summary>Why can answers to different prompts not be pooled into one baseline group?</summary><p>Their reward scales and difficulty can differ. Here the group is defined as several answers to the same prompt; mixing them changes what the baseline means.</p></details>
<details><summary>GRPO has a token subscript — does that make it token-level ground-truth supervision?</summary><p>No. The subscript means the probability ratio and objective are computed per position; with outcome rewards Â_i is usually shared by the whole answer and provides no independent per-token good/bad label.</p></details>

Source: PDF pages 68–94. The small worked case is a teaching construction.
