---
slug: l4-kl-policies
title: "KL and three policies: current, old and reference"
collection: cme295
lecture: 4
lang: en
description: "Separate the three policy roles by when they update, hand-compute KL, connect it to DPO, and explain why local clipping and the reference constraint serve different purposes."
order: 70
kind: lesson
status: published
tags: [KL divergence, Reference policy, Old policy, DPO]
---

## 1. Three π values are not the same thing

PDF pages 59–66. They may start from identical weights, but their roles and refresh times during training differ.

| Object | When it changes | Where it is used |
| --- | --- | --- |
| πθ current | on every optimiser update | numerator, the output distribution being learned |
| π_old | fixed when the current batch was sampled | records old log-probabilities to build ρ |
| π_ref | usually frozen for a long time | limits distribution drift from the starting point |

```text
起点：current = old = ref
old生成批次1 → current更新几次，old和ref不变
刷新old为新的采样策略 → 生成批次2 → 再更新current
ref仍保持原参考
```

old does not have to be a separate permanent copy of a large model; some implementations mainly store the log-probabilities recorded at sampling time. The reference may need its own computation or another arrangement, so the number of roles does not prove that three complete copies sit in memory.

## 2. Why is clipping to old not enough?

Each step drifts only slightly from old, but many batches can still accumulate a large distance from ref. Local update constraints and the long-run reference constraint operate at different scales.

Conversely, a reference KL alone does not directly constrain the probability ratio within one batch. Some LLM recipes therefore use both, though whether it enters the reward, the advantage or an explicit loss term varies.

## 3. What is KL?

For discrete distributions:

```text
KL(P∥Q)=Σ_i P_i ln(P_i/Q_i)
```

It measures the information difference of approximating P by Q, from the point of view of samples from P. By convention 0ln(0/q)=0; if some P_i is positive while Q_i is 0, KL is infinite in that direction.

KL is not a symmetric distance, and it does not directly measure how far apart two weight matrices are.

### One calculation

```text
P=[0.8,0.2]，Q=[0.5,0.5]
KL(P∥Q)=0.8ln1.6+0.2ln0.4≈0.1927
KL(Q∥P)=0.5ln0.625+0.5ln2.5≈0.2231
```

Individual terms can be negative, but the total KL is non-negative. On normalised distributions, do not treat “every per-token log ratio is non-negative” as a property of KL.

## 4. Which direction enters the objective?

The slides use the intuition of penalising the current policy relative to the reference:

```text
最大化 J ≈ J_clip − β E_states KL(πθ(·|s)∥π_ref(·|s))
```

The exact expectation must state where the states come from. Real RLHF recipes may add KL to the per-token reward and then compute an advantage; GRPO also has an explicit KL term. Adding the same penalty in several places changes the objective, and copying the sign does not make them equivalent.

## 5. Full-vocabulary KL versus a sampled estimate

Summing over the whole vocabulary is expensive. Suppose token a is sampled from the current student distribution P and let u=Q(a)/P(a); a non-negative single-sample form is:

```text
k(a)=u−1−lnu
E_a~P[k(a)]=KL(P∥Q)
```

This identity needs normalised distributions and suitable support, because E_P[Q/P−1]=0. If the samples actually come from old rather than current, or if differentiating with respect to u differs between implementations, the same unbiased gradient cannot be claimed automatically.

With P=[0.8,0.2] and Q=[0.5,0.5], the two candidates give u=0.625 and 2.5, k≈0.0950 and 0.5837, and the P-weighted average ≈0.1927.

**An unbiased scalar estimate is not the same as an unbiased gradient under any detach scheme.** This distinction matters when reading GRPO implementations.

## 6. How does this connect to lecture 3’s DPO?

[DPO](l3-dpo.html) relates reward to `β ln(πθ(y|x)/π_ref(y|x))`. The reference is still the baseline, not the old policy that generated this batch.

For the ideal KL-regularised optimum under a given reward, a larger β usually constrains drift more. But that does not imply that in any finite-data DPO run, simply raising β guarantees smaller distribution change; gradient scale, data, optimisation and implementation all matter.

## Check your understanding

<details><summary>Does ρ=1 mean current equals the reference exactly?</summary><p>No. ρ only compares current and old for one state–action; it does not compare the reference, nor all actions.</p></details>
<details><summary>If a sampled log-probability difference is negative, has the code computed a “negative KL”?</summary><p>A single-sample log ratio can be negative. The complete KL, or a suitable expectation, is non-negative; finite-sample averages are noisy, so first check which quantity is being computed.</p></details>

Source: PDF pages 59–64 and the related Q&amp;A. The two-class KL and estimator examples are teaching additions.
