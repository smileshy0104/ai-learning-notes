---
slug: l2-attention-cache
title: "Attention efficiency: sliding windows, KV Cache and GQA"
collection: cme295
lecture: 2
lang: en
description: "Using a 'who talks to whom' intuition, separate three jobs: look at less, reuse history, share keys and values — and compute the cache size yourself."
order: 60
kind: lesson
status: published
tags: [SWA, KV Cache, GQA, MQA, MHA, Beginner]
---

## 1. Attention is expensive — where exactly

Pages 75–83 of the PDF.

Recall what attention does. Each position emits a query (Q) and dots it against the keys (K) of all visible positions to get match strength; those strengths weight a sum of the corresponding values (V).

With sequence length n:

```text
every position compares against n positions → n × n scores
```

Double n and scores quadruple; multiply n by 10 and scores grow a hundredfold. That is the quadratic growth of attention in sequence length, and the root cause of expensive long contexts.

This section presents three optimisations in different directions. Beginners conflate them, so state the division of labour first:

| Optimisation | Changes | Saves |
| --- | --- | --- |
| Sliding window (SWA) | which positions a position <strong>may look at</strong> | compute (fewer distant links) |
| KV Cache | whether historical keys and values are <strong>recomputed</strong> | duplicate work |
| GQA / MQA | how many key/value groups query heads <strong>share</strong> | cache memory and K/V projections |

They compose, but none implies another. Each is unpacked below.

## 2. Sliding window: each layer looks only nearby

SWA = Sliding Window Attention. A position may only look at the w positions to its left (w is the window size).

With a left window of 2:

```text
position: 1 2 3 4 5 6
query 6:  × × × ✓ ✓ ✓
query 5:  × × ✓ ✓ ✓ ×
```

Query 6 sees 4, 5 and 6, not 1, 2, 3. Scores drop from n×n to n×w, growing linearly rather than quadratically in n.

<strong>Information does not stop there</strong>, because layers stack:

- Layer 1: position 6 reads position 4.
- Layer 2: position 4's representation already contains position 2, so 6 indirectly knows 2.
- Layer 3: another ring outward.

If each layer reaches r extra positions, L layers reach roughly L×r + 1. With r=2, layers 1, 2 and 3 cover 3, 5 and 6 positions respectively at position 6.

This is structurally identical to the <strong>receptive field</strong> of a convolutional network: a small kernel reads locally, but stacking covers a wide range.

<!-- lab:l2-window -->

The slides first present Longformer's sparse pattern, then local/global layer mixtures and Mistral's window. One distinction matters: Longformer keeps a few <strong>global tokens</strong> that see everything, a design not every local-attention model shares.

<strong>Boundary</strong>: having a path is not the same as preserving information. A window changes the computation and normally needs matching training or adaptation; truncating the window of a trained global model does not guarantee unchanged quality.

## 3. KV Cache: stop recomputing the prefix

This is the most important — and most misunderstood — inference optimisation. Start from a concrete scene.

Suppose the prefix is `A teddy bear`, the model has just predicted `is`, and now predicts the next word. Recall autoregressive generation: append the new token, run again.

<strong>Without a cache</strong>: every generated token re-runs the entire sequence (`A`, `teddy`, `bear`, `is`) through all layers. Those earlier positions produce exactly the same values as last time, at full cost.

<strong>With a cache</strong>: during the first pass over the prefix, store each layer's K and V. Each subsequent token computes only its own Q, K and V, then:

- matches the new Q against cached historical K plus the new K;
- weights cached historical V plus the new V.

Two named phases:

| Phase | Work | Character |
| --- | --- | --- |
| Prefill | process the whole prompt at once, writing the cache | highly parallel, compute-bound |
| Decode | process one new position per step | serial, memory-bandwidth-bound |

<strong>Why is recomputation unnecessary?</strong> Causal attention means old positions never see new ones, and the weights are fixed, so earlier K and V cannot change when later tokens arrive. That is the mathematical precondition.

A common question: <strong>cache Q too?</strong> No. Q is "what this position wants to ask", used once at this step and never again. What gets reread repeatedly is historical K and V.

### KV Cache is not "model memory"

Keep them apart:

- The cache holds intermediate numbers, valid only for the current conversation and current weights.
- It is not a saved chat summary, not a retrieval index, and it does not change parameters.
- Change the prefix or update the weights and the old cache is stale.

## 4. Multi-head attention: why there are many K and V

"Multi-head" means several projection sets run in parallel in one layer, each called a head, each attending to different patterns. Let the number of query heads be h_q.

In standard multi-head attention (MHA), each head has its own K and V, so cache size scales with head count.

Here is the tension: <strong>Q is used once, K and V are kept forever.</strong> More heads means a bigger cache. That motivates GQA.

| Scheme | KV heads | Sharing | Relative cache |
| --- | --- | --- | --- |
| MHA | 8 | each query head has its own K/V | 100% |
| GQA | 2 | every 4 query heads share one K/V | 25% |
| MQA | 1 | all 8 query heads share one K/V | 12.5% |

(The table assumes h_q = 8.)

```text
MHA:  Q₁→K₁V₁  Q₂→K₂V₂  Q₃→K₃V₃  … Q₈→K₈V₈
GQA:  Q₁Q₂Q₃Q₄→K₁V₁      Q₅Q₆Q₇Q₈→K₂V₂
MQA:  Q₁…Q₈→K₁V₁
```

GQA sits between: cheaper than MHA, more expressive than MQA. MHA and MQA are the two extremes of "how many sharing groups".

<strong>Note</strong>: sharing K/V does not make query outputs identical. Each Q still has its own content; they simply read the same keys and values.

## 5. Compute the cache size yourself

The formula (unquantised, K and V only):

```text
bytes = 2 × B × n × L × h_kv × d_head × bytes_per_value
         ↑K,V ↑batch ↑length ↑layers ↑KV heads ↑head dim ↑bytes per value
```

Term by term:

- `2`: one K and one V.
- `B`: concurrent requests (batch size).
- `n`: sequence length.
- `L`: layers, each stored separately.
- `h_kv`: key/value heads, the variable GQA changes.
- `d_head`: dimension per head.
- `bytes_per_value`: 2 for FP16.

### Build up from the smallest unit

One layer, one position, one head:

```text
2 (K and V) × 128 (dim) × 2 (bytes) = 512 bytes
```

Eight KV heads:

```text
512 × 8 = 4096 bytes per position per layer
```

4096 positions:

```text
4096 × 4096 = 16,777,216 bytes = 16 MiB per layer
```

32 layers:

```text
16 MiB × 32 = 512 MiB
```

That is full MHA with B=1, n=4096, L=32, d_head=128, FP16.

With GQA (h_kv=2) every step divides by 4:

| Scheme | h_kv | Bytes | Readable |
| --- | --- | --- | --- |
| MHA | 8 | 536,870,912 | 512 MiB |
| GQA | 2 | 134,217,728 | 128 MiB |
| MQA | 1 | 67,108,864 | 64 MiB |

Note 1 MiB = 1,048,576 bytes, not 1,000,000.

<strong>These numbers cover K/V only.</strong> Weights, activations, workspace, fragmentation and concurrent requests are extra, so real memory is larger.

<strong>Try another</strong>: if batch goes from 1 to 4 with everything else fixed, the cache quadruples, because each request stores its own copy.

## 6. How the three fit together

They address different layers of the problem and stack:

```text
sliding window → fewer K/V to compare per step (n becomes w)
KV Cache       → no recomputation of historical K/V
GQA            → fewer K/V copies stored per position
```

A model with GQA and a 4096 window on long text needs all three: the window limits work per step, the cache avoids re-running the prefix, and shared KV heads keep memory affordable.

## 7. Check your understanding

<details><summary>With a KV Cache, is history still read each step?</summary><p>Yes. The new Q still matches visible historical K and sums historical V. The cache removes regeneration of historical K/V, not all reads.</p></details>
<details><summary>Does GQA make end-to-end speed 4× faster?</summary><p>Not guaranteed. Cache capacity does shrink 4×, but speed also depends on bandwidth, other operators, batch size and kernel implementation. A smaller cache mainly improves how long a context fits and how many requests run concurrently.</p></details>
<details><summary>Does a sliding window lose distant information?</summary><p>Per layer, yes; stacked layers propagate it indirectly, like a receptive field. The cost is that exact distant detail may be compressed or lost, so it is not lossless.</p></details>

## 8. Commonly confused points

- KV Cache stores K and V, not Q, and not "the semantics of the conversation".
- Prefill is parallel prompt processing; decode is token-by-token generation; their time profiles differ.
- GQA reduces KV heads, not query heads.
- Sliding windows and GQA both cut cost, but one cuts positions and the other cuts copies; neither replaces the other.
- MiB and MB differ by about 4.8%, which matters at large sizes.

Source: PDF pages 75–83 and the transcript's KV Cache explanation. The cache formula, byte calculations and window reach analysis are teaching additions; page 82 was visually checked.
