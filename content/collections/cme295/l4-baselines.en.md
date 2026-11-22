---
slug: l4-baselines
title: "Baselines and credit assignment: a high reward is not automatically better"
collection: cme295
lecture: 4
lang: en
description: "Hand-compute the variance in the slides' 101/100 reward example, prove that an action-independent baseline leaves the expectation unchanged, and explain the credit problem of terminal rewards."
order: 40
kind: lesson
status: published
tags: [Baseline, Variance, Credit assignment]
---

## 1. What are the three problems of REINFORCE?

PDF pages 34–40: the gradient estimate is noisy; there are no explicit token-level credit labels; and the update may drift too far from the previous policy.

Handle the first one here: the raw reward says “how good” an answer is, but training often needs “how much better than usual”.

## 2. What is a baseline?

**Definition:** subtract from the return a comparison quantity b(s) that does not depend on the action just sampled, giving a relative signal.

```text
g = (R−b(s)) ∇lnπ(a|s)
```

b may depend on the prompt or prefix, but must not vary with the current action. When training the policy, the computed advantage or baseline is usually treated as a fixed target quantity, and the policy loss is not allowed to modify it as a side effect.

### Why does the expected gradient stay the same?

For a given state:

```text
E_a~π[b(s)∇lnπ(a|s)]
= b(s) Σ_a ∇π(a|s)
= b(s) ∇Σ_a π(a|s)
= b(s)∇1 = 0
```

So a suitable baseline can reduce variance without adding bias to this expectation. Not every baseline reduces variance, and action-dependent or badly estimated baselines may need extra correction.

## 3. 101 versus 100: same true gradient, completely different noise

Keep the two-answer Bernoulli policy: at θ=0 both probabilities are 0.5 and the log-probability gradients are +0.5 and −0.5. Change the rewards to good=101, bad=100.

<!-- lab:l4-baseline -->

Without a baseline: g_good=50.5, g_bad=−50, expectation 0.25, variance 2525.0625.

With b=100.5: relative rewards +0.5 and −0.5, giving a gradient of **+0.25 for both**, and zero variance.

Why is the bad answer’s gradient also positive? Because `(−0.5)×(−0.5)=+0.25`, and increasing θ lowers the probability of bad. A negative advantage does not mean every gradient component is negative.

This is a carefully constructed two-action example; in real tasks a “mean-value baseline” is not necessarily the variance-optimal baseline, and certainly does not guarantee zero variance.

## 4. A terminal reward does not say which step was reasonable

Problem: Teddy is in a sealed box, and the box is carried to the kitchen.

| Candidate | Intermediate explanation | Final answer | Reward that only checks the final answer |
| --- | --- | --- | --- |
| A | stayed in the box, the box was moved | kitchen | 1 |
| B | climbed out of the sealed box and walked over | kitchen | 1 |

The rewards are identical, but B violates the problem. Applying the whole R to every token’s log-probability also reinforces implausible pieces such as “climbed out”.

That does not mean the model can never learn good steps over time; it means **a single sample lacks explicit local attribution** and must rely on statistical relations across other data.

## 5. Which measure solves which problem?

- Baseline / value function: makes feedback relative and reduces some estimation noise.
- Token-level advantage, process feedback, teacher distributions: give finer-grained learning signals, but can also be misestimated.
- Clipping / KL: suppress updates that go too far in some directions.

No single measure automatically proves that the intermediate reasoning is causally correct. [PPO](l4-ppo.html) later uses value estimates, [GRPO](l4-grpo.html) switches to within-group rewards, and [OPD](l4-opd.html) uses teacher predictions for finer-grained feedback.

## Check your understanding

<details><summary>Does subtracting 100 from the reward change what the task optimises?</summary><p>For a given state, an action-independent baseline term has zero expected gradient. It can change single-sample gradients and variance but not this theoretical expectation; a practical estimator must still satisfy the conditions.</p></details>
<details><summary>If the final answer is right, are all explanation tokens good?</summary><p>No. In the box example both answers end the same but the intermediate content differs; the coverage of outcome verification must be stated.</p></details>

Source: PDF pages 34–40; the variance and unbiasedness identity are teaching expansions.
