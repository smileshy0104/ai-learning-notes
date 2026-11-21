---
slug: l3-rlhf
title: "RLHF: learn a reward first, then optimise the answer policy"
collection: cme295
lecture: 3
lang: en
description: "Understand the reward model through the Bradley–Terry pairwise loss, then separate policy, reference model, KL constraint and reward hacking."
order: 70
kind: lesson
status: published
tags: [RLHF, Reward model, Bradley-Terry, KL]
---

## 1. What are the two steps of RLHF?

PDF pages 70–86. RLHF = Reinforcement Learning from Human Feedback. The classic recipe first fits human preferences into a reward model, then optimises the generation policy with that reward signal.

<div class="flow"><span class="chip">human preference pairs</span><span class="arrow">→ train →</span><span class="chip">reward model RM</span><span class="arrow">→ freeze, score samples →</span><span class="chip">update the generation policy</span></div>

**The reward model and the generation model play different roles.** The RM outputs a score; the policy outputs token probabilities. They may share a similar backbone, but their objectives and usage differ.

## 2. Inputs and outputs of the reward model

```text
input: (prompt x, complete candidate answer y)
output: one real number rφ(x,y)
```

It can take the hidden representation at some position of a language model and attach a scalar head, or use an encoder-style backbone. This score is not “the probability of being factually correct”; it need not lie in 0 to 1, and it is not a vocabulary distribution.

## 3. Bradley–Terry: turning a score gap into a preference probability

```text
σ(z)=1/(1+exp(−z))
P(y_w ≻ y_l | x)=σ(rφ(x,y_w)−rφ(x,y_l))
L_RM=−E[ln σ(r_w−r_l)]
```

**Intuition:** the higher the winner’s score relative to the loser’s, the more the model believes that preference label, and the lower the pairwise negative log-loss.

Example: r_w=2, r_l=0, gap 2, preference probability about 0.8808 and loss about 0.1269. If they tie, the probability is 0.5 and the loss about 0.6931.

<!-- lab:l3-preference-gap -->

The expectation E averages over many preference pairs in the data. Adding 100 to every reward leaves the gaps unchanged, so the preference probabilities are unchanged; without extra constraints the absolute zero of the reward is not determined by pairwise data.

## 4. Why can the reward not be treated as truth?

The RM only learns the pattern of human judgement from limited labels; it may pick up shortcuts such as “longer answers are better” or “certain polite words score higher”.

If the labels are themselves disputed or coverage is thin, the RM may judge new tasks wrongly. The validation set should check ranking quality and various failure modes, rather than treating a small training loss as having captured every value judgement.

## 5. Step two: optimising the policy

The policy πθ is usually initialised from the SFT model. Give it prompts, let it sample answers, and score them with the frozen reward model.

The usual intuition (maximisation form):

```text
J(θ)=E_x E_y~πθ [rφ(x,y)] − β E_x KL(πθ(·|x) || π_ref(·|x))
```

β controls the cost of drifting from the reference distribution. This is a conceptual “high reward without drifting too far” objective, not complete PPO update code. The real thing also involves sampling, probability ratios, advantage estimation, clipping and possibly a value model, covered further in lecture 4.

| Object | Updated at this stage? | Role |
| --- | --- | --- |
| Policy πθ | yes | produce answers closer to the goal |
| Reward model rφ | frozen in the classic two-stage recipe | score sampled answers |
| Reference π_ref | usually frozen | provides the distribution constraint baseline |
| Value model | depends on the algorithm | estimates return or a baseline; not every method has one |

**Important:** a discrete generated string is not made unconditionally differentiable by passing it through the RM, so you cannot do ordinary supervised backpropagation on generated tokens that way. Policy gradients build the learning signal from log-probabilities and similar quantities; “just score it and backpropagate” skips the part that matters.

## 6. What does KL penalise?

KL measures the difference between two probability distributions; it is not directly a Euclidean distance between weight matrices. “Do not change the weights too much” is a loose verbal intuition.

A two-choice teaching example: reference=[0.5,0.5], policy=[0.8,0.2]:

```text
KL=0.8 ln(0.8/0.5)+0.2 ln(0.2/0.5)≈0.1927 nats
```

If the two answers score [1,0], the policy’s expected reward is 0.8; with β=0.5 the simplified objective is `0.8−0.5×0.1927≈0.7036`. Gaining reward must be traded against drift cost; staying as close as possible to the reference is not always better.

## 7. Reward hacking: a high score is not a good answer

A model may find the form the reward model prefers while bypassing the real task, for example producing long repetition that scores highly without answering the question. KL constraints suppress some drifting, **but they do not guarantee that reward loopholes disappear**.

Combine independent task evaluation, human spot checks, reward-data maintenance and constraint checks. The better a model is at optimising a wrong proxy objective, the more visible the problem can become.

## Check your understanding

<details><summary>Do reward-model training and policy optimisation update the same parameters?</summary><p>No. Step one trains the RM; step two usually freezes the RM and the reference and updates the policy. Some algorithms also train a value model.</p></details>
<details><summary>If r_w and r_l both increase by 10, does the pairwise preference change?</summary><p>No, because the Bradley–Terry probability depends only on their difference. That is also why absolute scores cannot be used directly as a universal quality scale.</p></details>

Source: PDF pages 70–86; pages 76, 77 and 85 were visually checked. The small KL example is a teaching addition; the full reinforcement-learning derivation is left to lecture 4.
