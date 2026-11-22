---
slug: l4-ppo
title: "PPO: value, advantage and the two sides of clipping"
collection: cme295
lecture: 4
lang: en
description: "Understand advantage from the definitions of V and Q, add local feedback with TD and GAE, and hand-compute the PPO clipped surrogate instead of memorising the formula."
order: 60
kind: lesson
status: published
tags: [PPO, Value function, Advantage, GAE, Clipping]
---

## 1. What is PPO trying to improve?

PDF pages 41–58. PPO = Proximal Policy Optimization; it commonly uses value estimates to reduce feedback noise and a surrogate objective to limit how far one batch can reward certain directions.

The original PPO paper has several forms, and KL and value implementations in LLMs follow different conventions. This page covers the most common clipped surrogate and does not equate one RLHF recipe with all of PPO.

## 2. Define V, Q and A separately

```text
Vπ(s)=E[future return | current state s, then act by π]
Qπ(s,a)=E[future return | current s, take a first, then act by π]
Aπ(s,a)=Qπ(s,a)−Vπ(s)
```

V asks “what usually happens”, A asks “how much better than usual is this action”. “Value” here is an estimate of task return, not a moral or factual score.

An LM state can be the prompt plus part of the answer, and the action is the next token. A value model estimates the final outcome from each prefix, while an RM usually scores a complete answer; they must not be merged into one model.

## 3. How should the slides’ box example be read?

Generating “In the box.”, the value estimates for successive prefixes are 0.6, 0.7, 0.95 and 1.0. Writing “box” raises the estimate by 0.25 over what came before, a local-contribution intuition.

But a strict advantage is not an arbitrary difference of two V values. Immediate reward and future value must be included, or an estimate such as return minus baseline must be used.

```text
TD residual δ_t = r_t + γ V(s_{t+1}) − V(s_t)
```

If that step has r=0, γ=1 and the two values 0.70 and 0.95, then δ=0.25. It is a learned estimate; it does not prove the token “box” had exactly 0.25 of causal effect.

## 4. GAE as supplementary intuition

The slides leave GAE as optional reading. To avoid the misconception “advantage is just two V values subtracted”, here is the common structure:

```text
Â_t = Σ_l (γλ)^l δ_{t+l}
```

It distributes information from several future TD residuals back to the current step, trading bias against variance.

Two-step teaching example: rewards [0,1], state values [0.6,0.8,0], γ=1. Then δ=[0.2,0.2]. With λ=1, GAE=[0.4,0.2]; with λ=0, [0.2,0.2].

The terminal state has V=0, and masking, truncation and bootstrapping must be handled correctly. In policy optimisation Â is usually not a target the policy loss may freely modify.

## 5. The PPO clipped objective

```text
ρ_t = πθ(a_t|s_t)/π_old(a_t|s_t)
J_clip = E_old[min(ρ_t Â_t, clip(ρ_t,1−ε,1+ε) Â_t)]
```

- ρ=1: this action’s probability at this state is unchanged — not that the whole policy is identical everywhere.
- Â>0: we want this action’s probability to rise.
- Â<0: we want it to fall.
- min chooses the conservative term, and J is **maximised**.

<!-- lab:l4-ppo-clip -->

### Why not flatten both directions?

With ε=0.2:

- A=+1, ρ=1.5: raw=1.5, clipped=1.2, take 1.2, so further increases stop being rewarded.
- A=−1, ρ=0.5: raw=−0.5, clipped=−0.8, take −0.8, so further decreases stop being rewarded.
- A=−1, ρ=1.5: take −1.5 rather than −1.2, so wrongly raising a bad action’s probability is still penalised.
- A=+1, ρ=0.5: take 0.5, so wrongly lowering a good action’s probability can still be corrected.

So “all gradients are zero outside the range” is wrong; only **that sample’s term** on the saturated branch stops rewarding further movement in the same direction.

## 6. What clipping is not

- It is not gradient clipping; one changes the objective, the other limits gradient magnitude.
- It does not project the real πθ or ρ back into the interval.
- It does not guarantee KL stays under a bound after arbitrarily many steps.
- It does not stop other samples, shared parameters or other losses from moving that action’s probability.

PPO also needs learning-rate control, update counts, KL monitoring and sample refresh; one clip does not guarantee stability.

## 7. The cost of a value model

Usually the policy objective and a value regression loss are optimised together, possibly with entropy or other terms. Value and policy may share part of the backbone or be separate models; the implementation must say, and it is not necessarily two fully independent parameter sets.

The RM and reference are often frozen, while the value model follows policy data. An extra value estimate brings memory, training and error-management cost — the part GRPO tries to simplify.

## Check your understanding

<details><summary>Why still take min when A is negative?</summary><p>Multiplying by a negative flips the ordering. Once ρ drops below the lower bound, min selects the more negative constant term, cutting the reward for further decreases; when ρ is too high the negative penalty remains.</p></details>
<details><summary>If the value model outputs 0.95, is that “95% certain the logic is correct”?</summary><p>Only approximately, under specific interpretations of the reward and calibration. Generally it is an estimate under the training return definition, not the truth of each reasoning step.</p></details>

Source: PDF pages 42–58. The two-step GAE example is supplementary; a full implementation must handle termination and sampling details.
