---
slug: l4-policy-gradient
title: "Policy gradient: why reward times the log-probability gradient?"
collection: cme295
lecture: 4
lang: en
description: "Derive the score-function identity step by step from a finite-action expectation, then hand-compute one update for a Bernoulli policy over two answers."
order: 30
kind: lesson
status: published
tags: [Policy gradient, REINFORCE, Log derivative]
---

## 1. What is being maximised?

PDF pages 24–33. For a fixed prompt x, the model wants the expected reward of sampled answers to be higher:

```text
J(θ)=Σ_y πθ(y|x) R(x,y)
all prompts: take the expectation over x~D as well
```

It is not “find the single highest-reward answer once and stop”; training changes parameters so the whole future sampling distribution is better.

### What shape is the gradient?

Flatten every trainable weight into θ∈ℝᴾ, where P is the total parameter count; J and R are scalars, and ∇θJ and ∇θlnπ are P-dimensional vectors. Reward times gradient is a scalar times a vector, not a reward number added directly to every weight. The scalar Bernoulli example with θ is just the special case P=1.

## 2. Reward cannot be differentiated directly — so what?

Assume the reward is fixed, does not explicitly depend on θ, and that differentiation and summation may be swapped:

```text
∇θ J = Σ_y R(x,y) ∇θ πθ(y|x)
```

Use the log-derivative identity:

```text
∇θ lnπ = (∇θπ)/π
hence ∇θπ = π ∇θlnπ
```

Substituting back:

```text
∇θ J = Σ_y πθ(y|x) R(x,y) ∇θ lnπθ(y|x)
     = E_y~πθ [R(x,y) ∇θlnπθ(y|x)]
```

The identity holds on the support where π>0, subject to integrability conditions. A softmax over finite LLM logits gives positive probabilities, but numerics still need a stable log-probability implementation.

<div class="flow"><span class="chip">reward, not differentiated</span><span class="arrow">×</span><span class="chip">gradient of the sampled answer’s log-probability</span><span class="arrow">→</span><span class="chip">improves the generation distribution in expectation</span></div>

## 3. REINFORCE: approximate the expectation with samples

1. Given a prompt, sample answers from the policy.
2. Score the complete answer.
3. Compute `g=R∇lnπθ(y|x)`.
4. Take a gradient ascent step `θ←θ+ηg`.

If the optimiser minimises a loss, use the sampled form `L=−stopgrad(R) lnπθ(y|x)`; no ordinary pathwise gradient is sent through the reward or the discrete sampling step.

“Monte Carlo” means estimating the expectation from random samples instead of enumerating every answer. A single update does not necessarily raise validation reward; many samples and stable optimisation are needed.

## 4. A complete worked example with two answers

Fix “good answer” and “bad answer” and parameterise their probabilities:

```text
πθ(good)=σ(θ), πθ(bad)=1−σ(θ)
reward: good=1, bad=0
initially θ=0 → both probabilities are 0.5
```

The sigmoid derivative is p(1−p), so:

```text
∂lnπ(good)/∂θ=1−p=0.5
∂lnπ(bad)/∂θ=−p=−0.5
```

Single-sample gradient: if good is sampled, 1×0.5=0.5; if bad is sampled, 0×(−0.5)=0.

```text
E[g]=0.5×0.5+0.5×0=0.25
directly differentiating J(θ)=σ(θ) at θ=0 also gives 0.25
```

This shows that the estimator’s expectation equals the true gradient in this finite example — it is not differentiation with respect to the answer text.

Sampling good with learning rate 0.2 gives θ=0.1 in one step and a good probability of about 0.52498; sampling bad gives zero gradient in this no-baseline example. Do not read “bad gets no single-sample decrease” as “its relative probability never drops” — the normalisation coupling in softmax/sigmoid also acts.

## 5. How does a complete answer get back to tokens?

```text
lnπθ(y|x)=Σ_t lnπθ(y_t | x,y_<t)
∇lnπθ(y|x)=Σ_t ∇lnπθ(y_t | x,y_<t)
```

When a terminal reward multiplies the whole log-probability, every token receives the same sequence-level weight, yet their actual gradients differ. There are no per-token ground-truth credit labels; that is the problem addressed next.

## Check your understanding

<details><summary>Why not differentiate R directly?</summary><p>The reward may be “did the tests pass” or a frozen RM’s scalar, and the discrete generation path cannot be backpropagated like an ordinary continuous network. Policy gradients differentiate the sampling probability instead.</p></details>
<details><summary>J is maximised, so why is the update a plus sign?</summary><p>The gradient points uphill locally. If you minimise L=−J instead, the negative gradient of L gives the same direction.</p></details>

Source: PDF pages 27–33 and the board derivation; the Bernoulli numbers are teaching calculations.
