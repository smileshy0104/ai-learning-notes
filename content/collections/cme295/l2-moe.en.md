---
slug: l2-moe
title: "MoE: which experts does each token use?"
collection: cme295
lecture: 2
lang: en
description: "Start from 'no need to consult everyone', hand-calculate Top-2 routing, separate total from activated parameters, then cover routing collapse, shared and fine-grained experts."
order: 40
kind: lesson
status: published
tags: [MoE, Router, Top-k, Load balancing, Beginner]
---

## 1. Where the problem comes from

Pages 35–50 of the PDF.

The previous section left a tension: bigger models perform better, but bigger models also cost more compute per forward pass. If I am answering a simple question, must every parameter run?

The lecture's analogy works well: a room holds people with mathematics, physics and biology backgrounds. You have a maths question. Do you ask everyone? Obviously you ask the maths experts.

Mixture of Experts (MoE) turns this into architecture: <strong>prepare many sub-networks (experts) and send each token through only a few of them.</strong>

Hold on to this sentence: <strong>total parameters can be large while the per-token compute is set by the few selected experts.</strong>

## 2. Experts, router, selection

Three parts, one job each:

| Part | Role | Analogy |
| --- | --- | --- |
| expert | an independent small network, usually a feed-forward network | one specialist |
| router (gate) | scores the input and decides who works | triage desk |
| weighted sum | combines the selected outputs by weight | synthesising several opinions |

One common misreading: the experts <strong>are not human-assigned subject roles</strong>. They are learned numeric sub-networks with no "maths expert" or "grammar expert" label; what each specialises in emerges from training.

## 3. Where MoE sits in the Transformer

Recall lecture 1: each block has attention and a feed-forward network (FFN). Attention exchanges information between positions; the FFN processes features position by position.

The usual MoE move is to <strong>replace the FFN in some blocks with a set of FFN experts plus a router.</strong> Attention layers normally stay as they are.

```text
token representation x
  → attention (exchange information between positions)
  → router scores every expert
  → keep Top-k experts
  → each selected expert processes x
  → weighted sum
  → next layer
```

Two per-token consequences:

- Different tokens in the same sentence may go to different experts.
- The same token may choose differently at different layers.

So it is wrong to say "this request used one fixed model": routing happens per token and per layer.

## 4. Reading the formulas

```text
router scores: g(x) = softmax(W x)
selected set:  S(x) = TopK(g(x))
output:        y = Σ_{i∈S} wᵢ(x) · Eᵢ(x)
```

Line by line:

- `W x`: a matrix turns the current representation into one score per expert.
- `softmax`: turns scores into probabilities, i.e. budget shares per expert.
- `TopK`: keeps only the highest k; the rest do not run.
- `Eᵢ(x)`: expert i maps the same x to a new vector.
- `Σ`: adds the selected outputs with their weights.

<strong>Dense versus sparse turns on that TopK step:</strong>

| Type | Which experts compute | Benefit | Cost |
| --- | --- | --- | --- |
| Dense MoE | all experts, with different weights | smooth combination | compute grows with expert count, so little gain |
| Sparse MoE | only the Top-k | many parameters, compute proportional to k | routing, communication and balancing get harder |

The lecture stresses that sparse MoE is the useful form.

## 5. Hand-calculating a Top-2 route

Suppose the router produces four probabilities:

```text
g(x) = [0.55, 0.25, 0.15, 0.05]
```

Top-2 selects expert 1 and expert 2. This teaching example renormalises over the selected pair:

```text
retained mass = 0.55 + 0.25 = 0.8
weights = [0.55/0.8, 0.25/0.8] = [0.6875, 0.3125]
```

Take two-dimensional expert outputs:

```text
E₁(x) = [2, 0]
E₂(x) = [0, 4]
```

Add coordinate by coordinate:

```text
dim 1: 0.6875 × 2 + 0.3125 × 0 = 1.375
dim 2: 0.6875 × 0 + 0.3125 × 4 = 1.25
y = [1.375, 1.25]
```

That vector is what the layer hands on. Note that <strong>routing probabilities only allocate work; the values entering the next layer come from expert computation.</strong>

Now switch to Top-1. Expert 1 still ranks first, receives all the weight, and the output becomes `[2, 0]`. Same token, same scores, different k, entirely different result. That is why k is a tuned hyperparameter.

<!-- lab:l2-routing -->

## 6. Total versus activated parameters

This is the easiest number to misread on an MoE spec sheet. Suppose:

- shared parts (attention, embeddings, normalisation) total 1B parameters;
- 4 experts, 0.5B each;
- each token selects 2 experts.

Then:

```text
total parameters = 1 + 4 × 0.5 = 3B
per-token activated parameters (simplified) = 1 + 2 × 0.5 = 2B
```

So a "3B parameter" MoE model uses about 2B per token in the forward pass. That is how MoE buys capacity at relatively low compute.

Three cautions:

- <strong>Memory must still hold the total parameters</strong>, or manage them through distributed placement and offloading.
- <strong>Different tokens in a batch route differently</strong>, so together they may touch every expert.
- <strong>Activated parameters are not FLOPs</strong>: they describe participating parameter scale, while real compute also depends on sequence length and batch size.

## 7. Routing collapse: the rich get richer

Early in training, one expert happens to do slightly better, so more tokens go to it; it receives more updates and improves; so it attracts even more tokens. The others barely learn.

This is <strong>routing collapse</strong>. Its harm: you think you have N experts, but only a few are effective, so capacity is wasted.

Page 45 explains the remedy with Switch Transformer's auxiliary loss:

```text
L_aux = α · N · Σᵢ fᵢ · Pᵢ
```

- `fᵢ`: fraction of tokens actually routed to expert i (real assignment).
- `Pᵢ`: mean router probability for expert i (model preference).
- `N`: number of experts.
- `α`: weight of the auxiliary term.

The product is smallest when both distributions are uniform; if one expert is both preferred and actually used, the product grows, loss rises, and training is pushed back towards balance.

<strong>Hand calculation for Top-1</strong>: N=4, α=0.01.

| Situation | f | P | L_aux |
| --- | --- | --- | --- |
| fully balanced | [0.25, 0.25, 0.25, 0.25] | [0.25, 0.25, 0.25, 0.25] | 0.0100 |
| leaning on one | [0.75, 0.25, 0, 0] | [0.7, 0.2, 0.05, 0.05] | 0.0230 |

Check the first row: `0.01 × 4 × (0.25×0.25 × 4) = 0.01 × 4 × 0.25 = 0.01`. The skewed case more than doubles the loss, so the term really does penalise imbalance.

### Hard selection is not differentiable — so how does the router learn

`TopK` is a hard decision and not differentiable. The common approach: gradients flow through routing probabilities and the selected experts' outputs, while the assignment fractions `fᵢ` are treated as statistics that carry no gradient. Details differ between papers, but they share the principle of <strong>not pushing gradients through the hard index choice</strong>.

## 8. Current practice: shared and fine-grained experts

Pages 49–50 describe two recent trends.

<strong>Shared experts</strong>: some experts always run regardless of routing, because certain general computation is needed by every token and there is no point letting each routed expert relearn it.

<strong>Fine-grained experts</strong>: instead of 8 or 16 large experts, use tens to hundreds of small ones and activate several each time. Experts become narrower and more specialised, and the combination space grows. The slide's chart shows better results with more experts at similar activated size.

<strong>Engineering cost</strong>: more experts mean more cross-device communication, capacity limits and token overflow (dropping or forwarding when an expert is full). Shrinking k therefore does not automatically reduce end-to-end latency; the gain depends on the implementation.

The model specifications on pages 49–50 are a dated snapshot, useful for orders of magnitude, not a permanent ranking.

## 9. Check your understanding

<details><summary>Does Top-2 mean only two sets of parameters run in the whole model?</summary><p>No. Routing only happens in the layers converted to MoE; attention, embeddings and normalisation run as usual. Even inside those layers, shared experts may also participate.</p></details>
<details><summary>Is MoE the same as multi-head attention?</summary><p>No. Multi-head attention runs several projection sets in parallel inside one layer; MoE chooses a few of many FFN sub-networks. Both have branches, but the division of labour differs completely.</p></details>
<details><summary>Why does MoE save compute but not memory?</summary><p>Total parameters must still be stored; they simply do not all participate in each forward pass. Saving compute raises throughput, but memory and communication costs do not vanish.</p></details>

## 10. Commonly confused points

- Experts are learned sub-networks, not assigned subjects.
- Routing happens per token and per layer, not once per request.
- Activated parameters are fewer than total, but memory does not shrink accordingly.
- The auxiliary loss is added to the main loss, not a replacement.
- Sparse means few experts run per step, not that the model as a whole is simple.

Source: PDF pages 35–50 and the matching Q&amp;A. The Top-2 values, auxiliary-loss calculation and parameter split are teaching additions; the formula was checked against page 45.
