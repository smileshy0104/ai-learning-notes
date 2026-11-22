---
slug: l4-overview
title: "Lecture 4 overview: from reward to policy update"
collection: cme295
lecture: 4
lang: en
description: "Build the route through RL, policy gradients, PPO, GRPO and on-policy distillation, fixing notation first and derivations second."
order: 10
kind: lesson
status: published
tags: [Lecture 4, RL, PPO, GRPO]
---

## What does this lecture solve?

Lecture 3 established that you can “score an answer, then update the model”. Lecture 4 explains **why discrete generation can still be learned, how to compute the gradient, how to reuse expensive sampling, and how to constrain the update**.

The whole thread is not five unrelated algorithms to memorise:

<div class="flow"><span class="chip">maximise expected reward</span><span class="arrow">→ policy gradient</span><span class="chip">subtract a baseline, cut noise</span><span class="arrow">→ PPO</span><span class="chip">compare within a group instead of a value model</span><span class="arrow">→ GRPO</span><span class="chip">look for denser feedback → distillation</span></div>

## Recap of lecture 3

- Pretraining matches the next-token distribution of broad text.
- SFT learns demonstrated answers under a prompt condition.
- Preference optimisation and reasoning training need to judge “how good is an answer the model generated”.
- The reward can come from a human-preference model or from verifiable rules.

If probabilities, gradients and objective functions are still shaky, read [the basic toolbox](basics.html) and [lecture 3’s RLHF](l3-rlhf.html) first. The hand calculations here explain mechanisms; they are not results of real GPU training.

## Notation used throughout

| Symbol | Meaning | Easy to confuse with |
| --- | --- | --- |
| x, y | prompt, complete answer | at token level, prefix s and action a |
| R or r | reward | not used for probability ratios |
| πθ | the policy being updated | an output distribution, not a reward model |
| π_old | the older policy that generated this batch | refreshed after each resampling, fixed within a batch |
| π_ref | frozen reference policy | usually unchanged across many batches |
| ρ | ratio of current to old probability | not a reward |
| A | advantage | goodness relative to a baseline, not a raw score |
| J | maximisation objective | if the optimiser minimises, people write L=−J |

Slides 8–10 warn specifically that papers may use L for a maximisation objective and r for a ratio. Look at the definition and optimisation direction before trusting a letter.

## Slide order and reading map

Page numbers are physical PDF pages including the cover; many consecutive pages unfold one diagram.

| Thread | PDF pages | Reading |
| --- | --- | --- |
| Recap and conventions | 1–11 | This page |
| Reinforcement learning and reward | 12–23 | [RL and reward](l4-rl-rewards.html) |
| Policy gradients and REINFORCE | 24–33 | [Policy gradient derivation](l4-policy-gradient.html) |
| Three questions and baselines | 34–40 | [Baselines and credit assignment](l4-baselines.html) |
| PPO: value, sample reuse, clipping | 41–58 | [Importance sampling](l4-importance.html), [PPO](l4-ppo.html) |
| KL, reference policy, the DPO link | 59–66 | [KL and three policies](l4-kl-policies.html) |
| GRPO and comparisons | 67–94 | [GRPO](l4-grpo.html) |
| Length, difficulty and exploration | 95–110 | [Normalisation and refinements](l4-grpo-refinements.html) |
| On-policy distillation | 111–134 | [Credit assignment and reverse KL](l4-opd.html) |
| Wrap-up and self-test | 135 | [Review](l4-review.html) |

## One task runs through the lecture: Teddy in a sealed box

Problem: Teddy is in a sealed box, the box is carried to the kitchen — where is Teddy? Assuming the box was never opened during the move, the answer is “the kitchen”.

Both candidates write “the kitchen” but may use different reasoning:

- Correct: Teddy stayed in the box, the box went to the kitchen, so Teddy is in the kitchen.
- Wrong: Teddy climbed out of the box and walked to the kitchen himself.

Checking only the final location gives both full marks, yet the second violates the stated condition. This example runs through outcome rewards, token-level credit assignment and teacher feedback.

## Reading notes

The material follows the lecture 4 slides and the automatic English transcript, with teaching calculations and common pitfalls added. Derivations here use discrete sums; where the slides present trajectory integrals the core identity is the same. GAE is supplementary and does not require a full RL course first.

For every formula, ask: **who samples? which quantity is fixed? what is differentiated with respect to? is it maximise or minimise?**
