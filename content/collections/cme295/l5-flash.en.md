---
slug: l5-flash
title: "FlashAttention: why online softmax needs no full score table"
collection: cme295
lecture: 5
lang: en
description: "Derive the numerator/denominator accumulation, add numerically stable rescaling, hand-compute the core of FlashAttention, and explain tiling and backward recomputation."
order: 30
kind: lesson
status: published
tags: [FlashAttention, Online softmax, Tiling, Recompute]
---

## 1. Where does the big matrix live?

PDF pages 14–29. Look at one attention head first:

```text
Q,K: n×d_k，V: n×d_v
S=QKᵀ/√d_k: n×n
P=softmax(S+mask): n×n
O=PV: n×d_v
```

A standard separation of operators may write S to HBM, read it back to compute P, write P, then read it again to multiply V. Real implementations may already fuse locally; the slides use a naive baseline for contrast.

With n=4096 an n×n matrix has 16,777,216 entries, which is 32 MiB at 2 bytes each; with n=32768 one such table is 2 GiB. This is one head and one table, before multiplying by batch and head count.

## 2. Softmax does not have to store a whole row first

PDF pages 30–39. For one query, take scores s₁,…,sₙ and value vectors vᵢ:

```text
O = [Σ_i exp(s_i) v_i] / [Σ_i exp(s_i)]
```

The numerator is a d_v-dimensional vector and the denominator is a scalar. They can be accumulated one item at a time and divided at the end. Every allowed key is still processed; you just do not hold all scores and weights simultaneously.

For example s=[0,ln2,ln4], v=[2,4,8], with unscaled exponential weights [1,2,4]:

```text
O=(1×2+2×4+4×8)/(1+2+4)=42/7=6
```

## 3. Why keep a running maximum?

PDF pages 40–47. Computing exp(1000) directly overflows. The stable form keeps a running maximum m, a rescaled denominator ℓ and numerator u over what has been read:

```text
m_t = max(s₁,…,s_t)
ℓ_t = Σ_{i≤t} exp(s_i−m_t)
u_t = Σ_{i≤t} exp(s_i−m_t) v_i
O_t = u_t/ℓ_t
```

When a new score arrives:

```text
m_new=max(m_old,s_new)
α=exp(m_old−m_new)
ℓ_new=αℓ_old+exp(s_new−m_new)
u_new=αu_old+exp(s_new−m_new)v_new
```

α rescales the old accumulation from the old scale to the new one. Scaling only the new term and not the old values mixes numbers with different scales.

<!-- lab:l5-online -->

The three steps above give (m,ℓ,u)=(0,1,2), (ln2,1.5,5), (ln4,1.75,10.5), ending at 6. Add 1000 to every score and the weights and result are unchanged — and the stable algorithm never has to compute exp(1000).

The first item can initialise m=s₁, ℓ=1, u=v₁ directly. A fully masked row needs its own convention; computing −∞−(−∞) directly is invalid, and real kernels must handle boundaries.

## 4. From one element to GPU tiling

Real FlashAttention loads blocks of Q, K and V into on-chip memory, computes local scores, merges the per-row maximum and normalisation statistics block by block, and finally writes O back. Within a block there are also local maxima and numerator/denominator, merged with the same rescaling.

<div class="flow"><span class="chip">read a small block from HBM</span><span class="arrow">→</span><span class="chip">on-chip scores and accumulation</span><span class="arrow">→ next block →</span><span class="chip">write the final output</span></div>

It reduces HBM traffic; it does not eliminate HBM, nor does it move the entire n×n matrix into SRAM. Block size is constrained by on-chip resources, thread scheduling and data type.

## 5. Why can recomputation make the backward pass faster?

PDF pages 58–60. The backward pass needs quantities from attention. Instead of storing all of S and P and reading them back from HBM, you can store the necessary small statistics and rebuild blocks during the backward pass.

Extra FLOPs buy less memory movement, which can be faster overall; this is a trade for specific large intermediate matrices, not “recomputation is always better for any computation”. General activation checkpointing makes a similar time/space trade, though its scope and implementation differ.

One historical configuration in the slides moved 66.6→75.2 GFLOPs, HBM traffic 40.3→4.4 GB and time 41.7→7.3 ms, about a 5.71× speed-up. That is not a promise for every length, precision and GPU.

## 6. What does “exact” mean here?

The original attention is not replaced by a sparse or low-rank approximation, so the real-valued result is identical; finite precision and summation order can still cause rounding differences, and bitwise identity is not guaranteed.

Standard dense attention still costs O(n²) in n; FlashAttention mainly removes the large intermediate tables and reduces IO, rather than turning all long-context arithmetic into linear complexity. Later versions also involve scheduling and hardware adaptation; this lecture focuses on the shared core.

## Check your understanding

<details><summary>When m grows, why multiply both numerator and denominator by α?</summary><p>They were on an exp(−m_old) scale and must move to exp(−m_new). Changing only one side, or only the new term, changes the result.</p></details>
<details><summary>Without storing a weight table, are some keys ignored?</summary><p>No. Every unmasked key still participates; the difference is accumulating block by block instead of materialising the whole table.</p></details>

Source: PDF pages 13–62; the three-element numbers and memory conversions are teaching additions.
