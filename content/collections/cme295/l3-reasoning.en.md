---
slug: l3-reasoning
title: "Reasoning training: verifiable rewards and GRPO intuition"
collection: cme295
lecture: 3
lang: en
description: "Use care constraints and within-group rewards to understand reasoning training, separating checkable results, explanatory text, advantage and a full policy update."
order: 90
kind: lesson
status: published
tags: [Reasoning, GRPO, Verifiable rewards, Advantage]
---

## 1. What does “reasoning” mean in this course?

PDF pages 91–124 use an operational definition: solving problems that need computation or combining conditions. That differs from merely recalling “what is the course code”, though real tasks often require both knowledge and reasoning.

Lecture 2’s CoT prompting tried to improve results by demonstrating step-by-step output; this lecture discusses training to improve such tasks, rather than writing “please think” in the prompt every time.

## 2. Start with a verifiable task

Fixed rules: Brown may only be hand-washed; Panda may be machine washed but not tumble dried; Polar allows both. Machine wash takes 15 minutes, tumble drying 15 minutes, and the owner leaves in 30 minutes. Ignore handling time and require **machine wash plus tumble dry**.

| Toy | Machine washable | Tumble dry allowed | Satisfies the request within 30 minutes? |
| --- | --- | --- | --- |
| Brown | no | not stated | no |
| Panda | yes | no | no |
| Polar | yes | yes | yes, 15+15=30 |

A short checkable explanation: “only Polar satisfies both equipment conditions, and the total time is 30 minutes”. The classroom example is a logic-constraint puzzle, not general laundry advice.

## 3. What is a verifiable reward?

**Definition:** feedback on a candidate output that can be re-checked through explicit rules, answer comparison or program tests. For example:

- an age calculation compared against fixed years.
- code passing hidden tests.
- output satisfying the conditions stated in the problem.

**Verification has limits too:** thin test coverage, a wrong answer parser, or a program exploiting a test loophole can all produce high reward with wrong behaviour. Using a program does not remove the need to check the reward.

The slides list HumanEval, CodeForces, SWE-bench, AIME and GSM8K, representing different tasks; a single benchmark is not the whole of real-world reasoning ability.

## 4. Keep explanations, internal computation and billing apart

A model may emit intermediate tokens used for computation, while a product may show only a summary. A visible explanation is not necessarily a faithful record of the internal causal process, and fluency does not prove the reasoning is correct.

The slides show `<think>…</think>` as one format example; not every API uses the same tokens, and demanding specific tags is no guarantee of a genuine internal trace. In practice, ask for conclusions, short justifications, citations and independent verification.

Whether reasoning tokens count towards budget, context and billing depends on the specific service version. Product screenshots and their years are only a snapshot of the slides.

## 5. What does GRPO do?

GRPO = Group Relative Policy Optimization. Slides 110–122 give the intuitive pipeline:

<div class="flow"><span class="chip">one problem q</span><span class="arrow">→ policy samples G answers →</span><span class="chip">rules or a reward model score them</span><span class="arrow">→ compare within the group →</span><span class="chip">advantage signal + policy constraint → update</span></div>

**Advantage** says how much better a candidate is than a baseline. A common teaching normalisation is `Aᵢ=(rᵢ−group mean)/(group std+ε)`. Variants differ in whether they standardise, and in sequence-level versus token-level treatment.

This demo uses the population standard deviation, ignores the tiny ε for non-zero groups, and sets the advantage to 0 when the variance is 0:

<!-- lab:l3-group-advantage -->

Rewards [1,1,0,0] give mean 0.5, standard deviation 0.5 and advantages [1,1,−1,−1]. The first two answers are relatively better within this group; **this does not label every word of an answer as right or wrong**.

## 6. It is not the complete GRPO formula

Real training also handles probability ratios between the sampling policy_old and the updating policy, clipping, token aggregation and possibly a reference KL. **The old policy and the reference are not necessarily the same role**: one records the sampling policy, the other limits drift relative to a baseline.

The slide diagram uses a generic “Reward Model” box, but verifiable tasks can be scored directly by rules or tests without training a human-preference RM. Do not conclude from the diagram that every reasoning RL setup trains a separate reward model.

Lecture 3 builds intuition only; the full objective derivation continues in lecture 4. “Higher advantage is encouraged more” here is not a runnable update algorithm.

## 7. The difficulty of sparse rewards

A whole answer being right or wrong often gives one reward, which cannot say which step went wrong. If the whole group is correct or all wrong, the within-group signal may also be insufficient.

It is not true that “reasoning training can only use a final reward”: process supervision, tool feedback, other dense signals and mixed objectives are all options. What is described here is the outcome-reward, within-group comparison approach the slides focus on.

Longer outputs may appear in particular experiments, but **longer is not more correct**. Watch accuracy, token cost, stability and generalisation to new tasks together.

## Check your understanding

<details><summary>Why are all advantages 0 in the demo when the whole group is correct?</summary><p>Every reward equals the mean, so within-group comparison has no variation. This demo handles zero standard deviation safely; real training may skip the group, resample or use another objective, and must state its convention.</p></details>
<details><summary>With a final-answer reward, can independent testing be dropped?</summary><p>No. The training reward itself can have loopholes, and models adapt to them. Unseen problems, hidden tests and human review are still needed.</p></details>

Source: PDF pages 91–124; pages 100, 110 and 118–120 were visually checked. No operation to extract hidden chains of thought was reproduced. The numeric advantages are teaching additions.
