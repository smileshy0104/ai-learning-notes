---
slug: l2-moe
title: "MoE: which experts does each token choose?"
collection: cme295
lecture: 2
lang: en
description: "Dense versus sparse MoE, top-k routing, load balancing, shared experts, and the difference between total and activated parameters."
order: 40
kind: lesson
status: published
tags: [MoE, Router, Top-k, Load balancing]
---

## 1. What is a mixture of experts?

MoE = Mixture of Experts, PDF pages 35–50.

**Definition**: several learnable subnetworks act as experts, and a router decides each expert’s contribution from the input. A sparse MoE runs only a small subset of experts per call.

**Why it matters**: total parameters can grow without per-token compute growing with the expert count. Note this is computational sparsity: it does not mean the memory, communication, bandwidth or training cost of storing every expert disappears.

The analogy “ask a few specialists about a maths problem” helps as an introduction, but real experts are trained numerical subnetworks: **no subject is assigned in advance, and they do not necessarily end up specialised by subject**.

## 2. Where does MoE usually sit?

Modern Transformers often replace one FFN in some layers with “a router + several FFN experts”; attention still handles interaction across positions.

<div class="flow"><span class="chip">post-attention token representation xₜ</span><span class="arrow">→ Router</span><span class="chip">pick top-k experts</span><span class="arrow">→ expert FFNs</span><span class="chip">weighted sum → next layer</span></div>

Different tokens in one sentence can enter different experts; the same token can choose different experts in different layers. This is not “one model per request, forever”.

## 3. Dense versus sparse

```text
routing probabilities g(x) = softmax(W_router x)
sparse selection S(x) = TopK(g(x))
y = Σᵢ∈S wᵢ(x) Eᵢ(x)
```

Dense sums over all experts; sparse computes only those in S. Whether the selected weights are renormalised and how the output is scaled depends on the implementation.

### Hand-computing a Top-2

Routing probabilities `[0.55,0.25,0.15,0.05]`; the first two are selected. **This teaching example renormalises**:

```text
retained probability mass = 0.55 + 0.25 = 0.8
weights = [0.6875, 0.3125, 0, 0]
E₁(x)=[2,0]，E₂(x)=[0,4]
y=0.6875×[2,0]+0.3125×[0,4]=[1.375,1.25]
```

<!-- lab:l2-routing -->

## 4. Total parameters versus activated parameters

Suppose the shared part has 1B parameters, four experts have 0.5B each, every token picks only 2, and the router is ignored:

- Total parameters: `1 + 4×0.5 = 3B`.
- Simplified activated parameters per token: `1 + 2×0.5 = 2B`.
- If two tokens route differently, a whole batch may touch every expert.

Activated parameters are not a full FLOPs formula; storage still has to hold the total, or manage it through distributed placement and offloading.

## 5. Router collapse: why does the rich get richer?

One expert is slightly better early → selected more often → more updates → better. The others are rarely used, compute is unbalanced, and capacity goes unused.

Slide 45 uses the Switch Transformer auxiliary loss to explain the mitigation:

```text
L_aux = α N Σᵢ fᵢ Pᵢ
fᵢ：fraction of tokens routed to expert i
Pᵢ：mean routing probability for expert i over the batch
```

**Top-1 teaching example**: N=4, α=0.01.

| Case | f | P | auxiliary loss |
| --- | --- | --- | --- |
| balanced | [0.25,0.25,0.25,0.25] | [0.25,0.25,0.25,0.25] | 0.0100 |
| skewed to one | [0.75,0.25,0,0] | [0.7,0.2,0.05,0.05] | 0.0230 |

The auxiliary term is added to the main task loss to trade load balance against task quality. It does not force every token through every expert.

### Top-k is not differentiable — how does the router learn?

The hard selection index is not a smooth function. Common training treats the realised assignment statistics f as a quantity that receives no gradient, and computes gradients along the routing probabilities, the selected outputs and the auxiliary objective. Details differ between routing algorithms; “top-k itself is directly differentiable” is not a safe claim.

## 6. Shared experts and fine-grained experts

- **Shared experts**: run for every token, learning common transformations; routed experts handle the remaining differences.
- **Fine-grained experts**: more, smaller experts; pick several and combine, widening the combination space.
- **Engineering cost**: inter-expert communication, capacity limits, overflow and hardware balance all have to be solved; a smaller k does not guarantee end-to-end latency falls proportionally.

The model sizes listed on pages 49–50 are examples dated by the slides; do not treat them as a permanent leaderboard, and do not read “expert” as a human-named role.

## Check your understanding

<details><summary>Does Top-2 mean the whole model uses only two sets of parameters?</summary><p>No. Typical designs keep shared attention, embeddings and normalisation; Top-2 only means the relevant MoE layer picks two routed experts, and shared experts may also run.</p></details>
<details><summary>Is MoE the same as multi-head attention?</summary><p>No. Multi-head attention runs several projection heads in parallel; MoE routing picks a few of several FFN subnetworks to execute. Having multiple branches does not make them equivalent.</p></details>

Source: PDF pages 35–50 and the related Q&amp;A; numbers are teaching additions, and the auxiliary formula was checked against the diagram on page 45.
