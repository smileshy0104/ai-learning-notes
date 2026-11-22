---
slug: l4-review
title: "Lecture 4 review: reading one RL update"
collection: cme295
lecture: 4
lang: en
description: "Recap policy gradients, clipping, KL, within-group comparison and distillation through a full training timeline, an algorithm comparison and worked self-test answers."
order: 110
kind: lesson
status: published
tags: [Review, RL, PPO, GRPO, OPD]
---

## 1. From one batch of prompts to the next

1. Fix the reference and establish the `old` policy for this round of sampling.
2. `old` generates answers to the prompts; record the sampled tokens and old log-probabilities.
3. The RM or verification rules score them.
4. PPO estimates advantages with a value model; outcome-supervised GRPO uses within-group rewards for the same prompt.
5. The current policy scores the known answers in parallel, giving current log-probabilities and ρ.
6. Compute the clipped surrogate and the chosen KL constraint, then backpropagate and update.
7. Reuse the batch for a few small steps while monitoring reward, KL, clip fraction, length and independent tasks.
8. Refresh the sampling policy and generate a new batch, rather than reusing one batch forever.

This is a common training skeleton, not a set of details every RL implementation shares. The OPD branch brings teacher distributions onto student prefixes and need not use the same sequence reward or value model.

## 2. Three problems and the different responses

| Problem | Method | Remaining limit |
| --- | --- | --- |
| gradient noise | suitable baseline, value, within-group comparison | finite samples and baseline error |
| insufficient local credit | token-advantage estimates, process supervision, teacher distributions | no guarantee of true causal attribution |
| excessive policy drift | clipping, KL, learning rate and monitoring | not a hard constraint or a safety proof |
| cost of maintaining a value model | GRPO uses within-group rewards | still needs several rollouts |
| insufficient teacher coverage | multiple teachers, privileged information, independent verification | teacher cost and bias remain |

## 3. Quick calculations

<details><summary>Q1: At θ=0 good and bad each have probability 0.5, rewards are 101/100 and the baseline is 100.5 — what are the two gradients?</summary><p>The log-probability gradients are +0.5 and −0.5, and the relative rewards are +0.5 and −0.5, so both give +0.25; the expectation is unchanged and this toy example has zero variance.</p></details>
<details><summary>Q2: old=[0.5,0.5], current=[0.8,0.2], rewards=[1,0] — what is the reweighted expectation?</summary><p>Ratios [1.6,0.4]; under the old distribution the expectation is 0.5×1.6×1+0.5×0.4×0=0.8.</p></details>
<details><summary>Q3: With ε=0.2, A=−1 and ρ=1.5, what is the clipped surrogate term?</summary><p>min(−1.5,−1.2)=−1.5. When the direction wrongly raises a bad action’s probability, the penalty is not flattened.</p></details>
<details><summary>Q4: With a clipping range of [0.8,1.2], is ρ guaranteed to stay inside?</summary><p>No. It truncates part of the objective’s incentive, not a hard projection of parameters or probabilities; other samples, losses and shared parameters can still move that probability.</p></details>
<details><summary>Q5: Is the reference refreshed together with old each round?</summary><p>Usually not. old records the source of the current batch; the reference stays a long-run baseline. Check the specific algorithm’s convention.</p></details>
<details><summary>Q6: If every token of an answer shares one advantage, are the per-token parameter gradients identical?</summary><p>No. What is shared is the scalar advantage; conditional probabilities, clipping states and log-probability gradients can all differ.</p></details>
<details><summary>Q7: Is every summation term of KL(S∥T) non-negative?</summary><p>No — individual terms can be negative, while KL over complete normalised distributions is non-negative. Do not mistake a sampled log ratio for the full KL.</p></details>
<details><summary>Q8: Without an RM, does OPD avoid the risk of wrong signals?</summary><p>It can still copy teacher bias or incomplete local predictions and needs independent evaluation. No RM does not mean no surrogate-objective limits.</p></details>

## 4. Terminology in the automatic subtitles

| Subtitle shows | Correct reading |
| --- | --- |
| CMI295 | CME295 |
| row | ρ, rho, the probability ratio |
| collapse / class in the applause example | claps, illustrating that a reward proxy can diverge from the real goal |
| GRPU | GRPO, depending on context |
| scale divergence | KL divergence |
| distribution / distillation used interchangeably | distinguish probability distributions from distillation training by context |
| 0.95 − 7 | the slides mean 0.95−0.70=0.25 |

Some verbal simplifications also need correcting: a higher value is not strict causal contribution, clipping does not zero every out-of-range gradient, OPD performance is not an absolute teacher upper bound, and the length incentive cannot be explained by one denominator alone.

## 5. What to check first when reading the papers

- Which objective is maximised and which loss is minimised.
- Whether r means reward or ratio, and whether epsilon is a clip width or a numerical constant.
- When current, old and reference each update.
- Whether token and sequence probabilities are being mixed.
- Whether advantage, reward and KL estimates are detached, and who actually samples.
- Whether normalisation is per token, per answer or over the whole batch.
- Whether rising reward comes with length inflation, rising KL or regressions on older tasks.

## Sources

Citation leads in this lecture include REINFORCE (Williams, 1992), PPO (Schulman et al., 2017), DPO (2023), DeepSeekMath/GRPO (2024), DAPO and Dr.GRPO related work (2025), and on-policy distillation (2023 and later practice). Specific model results and later paper examples are framed as of the slide date; no live leaderboard is maintained here.
