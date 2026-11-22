---
slug: l4-importance
title: "Importance sampling: why a current/old policy probability ratio appears"
collection: cme295
lecture: 4
lang: en
description: "Understand sample reuse through the finite-distribution change-of-measure identity, and separate the whole-answer probability ratio from PPO's per-token surrogate objective."
order: 50
kind: lesson
status: published
tags: [Importance sampling, Old policy, Rollout]
---

## 1. Why not regenerate on every update?

Board derivation plus PDF pages 33 and 51–55. Generating an answer requires sampling token by token, an expensive rollout; once the complete answer is known, the log-probability of each token can be computed in parallel with teacher forcing.

“Parallel scoring is more convenient” does not make scoring free, and it does not mean generation cannot be parallel across requests or samples.

The aim is to generate one batch of answers from a frozen old policy, then take several updates on that batch with the current policy.

## 2. Why is reweighting necessary?

The samples came from the old policy, whose proportions are not the ones the current policy wants to optimise. Correct with the importance ratio:

```text
E_y~πθ[f(y)]
= Σ_y πθ(y)f(y)
= Σ_y π_old(y) [πθ(y)/π_old(y)] f(y)
= E_y~π_old[ρ(y) f(y)]
```

This requires that wherever the current policy has non-zero probability, the old sampling policy also has support, plus suitable integrability. It is an exact identity in expectation; it does not remove variance problems with finite samples.

## 3. Hand calculation with two answers

Old distribution [0.5,0.5], current distribution [0.8,0.2], rewards [1,0]:

```text
ρ_good=0.8/0.5=1.6
ρ_bad=0.2/0.5=0.4
weighted expectation under the old distribution=0.5×1.6×1+0.5×0.4×0=0.8
computed directly with the current distribution=0.8×1+0.2×0=0.8
```

Without reweighting, the old samples still estimate the occurrence of good at 0.5, giving 0.5 instead of 0.8.

The old probability must be recorded or computed with a frozen old model. Silently replacing it with the current probability after updating makes the ratio always 1 and destroys the point.

## 4. Whole-answer ratio versus token ratios

```text
ρ_sequence = πθ(y|x)/π_old(y|x)
lnρ_sequence = Σ_t [lnπθ(y_t|s_t)−lnπ_old(y_t|s_t)]
ρ_t = πθ(y_t|s_t)/π_old(y_t|s_t)
```

The first is the product ratio used for a change of measure over whole sequences; PPO usually uses the second to build a **local surrogate objective** on old state/action samples. “The whole-sequence identity holds exactly” cannot be turned directly into “the token-clipped objective equals the original expected reward”.

Example: with per-position ratios 1.2 and 0.9 the sequence ratio is 1.08, not 1.05 (their arithmetic mean).

## 5. Why reuse only a few times instead of forever?

When the current and old distributions diverge, importance weights can become extreme and finite-sample estimates unstable. Coverage of old states also degrades.

So the usual loop is:

```text
π_old samples a batch → record log-probabilities and rewards
→ take several small updates of πθ on that batch
→ refresh π_old and sample a new batch
```

PPO clipping is one way to stabilise surrogate optimisation, but it introduces bias; you cannot simultaneously claim the unclipped exact unbiased property.

## 6. Data sources and what gets differentiated

Inside a batch: prompts, answer tokens, old log-probabilities, rewards and precomputed advantages are usually held fixed; current log-probabilities vary with θ.

If you minimise `−ρA` by gradient descent, you differentiate the current log-probability; the old policy and the reference are not updated by this loss. Fixed samples still need a fresh current forward pass — the first log-probability cannot be reused as the current value.

## Check your understanding

<details><summary>If πθ still has to be computed, what does importance sampling save?</summary><p>It saves resampling the whole answer token by token for every update. Current log-probabilities of known answers can be scored in parallel, but forward and backward passes still cost time.</p></details>
<details><summary>With clipping on the ratio, is the change-of-measure identity still exact?</summary><p>No. The exact identity uses the raw probability ratio; clipped PPO is a surrogate objective, and the approximation and bias must be acknowledged.</p></details>

Source: the board derivation of importance sampling in the English transcript, and PDF pages 51–55. The finite-distribution example is a teaching addition.
