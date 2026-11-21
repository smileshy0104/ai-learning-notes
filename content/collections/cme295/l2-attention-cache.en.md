---
slug: l2-attention-cache
title: "Attention efficiency: sliding windows, KV Cache and GQA"
collection: cme295
lecture: 2
lang: en
description: "Use reachable ranges and cache bytes to separate reading fewer positions, reusing history, and sharing key/value heads."
order: 60
kind: lesson
status: published
tags: [SWA, KV Cache, GQA, MQA, MHA]
---

## 1. Keep the three optimisations apart

Pages 75–83 of the PDF, plus the transcript’s detailed explanation of KV Cache.

| Optimisation | What it changes | Main benefit |
| --- | --- | --- |
| Sliding window (SWA) | The set of positions one query can read | Less compute on distant connections |
| KV Cache | Whether history keys and values are recomputed during generation | Reuse what was already computed |
| GQA / MQA | How many query heads share one K/V group | Lower cache and key/value projection cost |

They combine, but one does not automatically imply the others.

## 2. Sliding window: each layer looks only nearby

SWA = Sliding Window Attention. For example each position may read only itself and 2 positions to its left.

```text
position: 1 2 3 4 5 6
query 6 : × × × ✓ ✓ ✓
query 5 : × × ✓ ✓ ✓ × (future invisible)
```

**Why can information still travel farther?** At this layer, position 6 reads position 4, and at the previous layer position 4 had already read even earlier input. Stacking layers widens the receptive field indirectly.

<!-- lab:l2-window -->

If every layer reads r extra positions to the left, then after L layers the theoretical reach is Lr positions to the left, about Lr+1 including itself. Here r=2, so after 1, 2 and 3 layers position 6 is covered by 3, 5 and 6 input positions respectively.

**Boundary**: an information path existing is not the same as every distant detail being preserved. A fixed window changes the computation structure, so it needs matching training or adaptation; truncating an arbitrary global model’s window does not guarantee unchanged quality.

The slides first present Longformer’s sparse patterns, then local/global layer mixtures and Mistral’s window example. Longformer’s global tokens plus local windows are one design; it is not true that every local-attention model has global tokens.

## 3. How does the complexity change?

Full attention has roughly n×n scores; with a fixed window width w only about n×w connections remain. So the scoring part drops from O(n²) to O(nw).

This comparison omits the feature dimension, and it does not mean the whole model costs only O(nw): the FFN, projections and layer count still exist.

## 4. KV Cache: remember the K/V already computed

In a standard causal decoder-only model, old positions cannot see new ones. So with fixed weights, a fixed position rule and an unchanged prefix, generating a new token does not change the position representations of the old prefix.

```text
Prefill: process every position of the prompt, store K/V for each layer
Decode : compute Q, K, V for the new position
         append the new K/V to the cache, use the new Q against historical K/V
         output the distribution for the next token
```

For example with “A teddy bear” in the prefix the model predicts is; when processing the new input is, only that position needs fresh Q/K/V for the current layer, while the K/V for A, teddy and bear are reused.

Q is normally not reused for later tokens’ attention after its own query, so all historical Q is usually not cached. The cache still has to be stored **for every layer separately**.

### Is that the same as the model’s “long-term memory”?

No. KV Cache holds intermediate numerical state during inference; it differs from saving a chat summary, retrieving a knowledge base or updating model parameters. If the prefix changes or the weights update, the old cache may become invalid.

The KV Cache discussion targets token-by-token inference; training usually processes a known sequence in parallel and does not use the same decoding cache flow.

## 5. MHA, GQA, MQA: keep the Q heads, cut the K/V heads

With h_q=8 query heads:

| Variant | K/V heads h_kv | Sharing |
| --- | --- | --- |
| MHA | 8 | Every query head has its own K/V |
| GQA | 2 | Each 4 query heads share one K/V group |
| MQA | 1 | All 8 query heads share one K/V group |

<div class="flow"><span class="chip">Q₁ Q₂ Q₃ Q₄ → K₁ / V₁</span><span class="chip">Q₅ Q₆ Q₇ Q₈ → K₂ / V₂</span></div>

GQA is the middle ground; MHA and MQA are the two ends of the sharing count. Fewer K/V heads does not mean all Q heads produce the same output — each Q still carries different content.

## 6. Compute one cache footprint

Simplified estimate for a conventional, unquantised K/V cache:

```text
bytes = 2 × B × n × L × h_kv × d_head × bytes_per_value
        ↑K and V  batch  length  layers  KV heads  head dim  bytes per value
```

With B=1, n=4096, L=32, d_head=128 and 2 bytes per value:

| Mode | h_kv | bytes | binary unit |
| --- | --- | --- | --- |
| MHA | 8 | 536,870,912 | 512 MiB |
| GQA | 2 | 134,217,728 | 128 MiB |
| MQA | 1 | 67,108,864 | 64 MiB |

Changing only the K/V head count takes the cache from 512 MiB to 128 MiB, a 4× reduction. This counts K/V only, excluding weights, workspace, allocator overhead and paging fragmentation. More requests or longer context keep increasing it.

## Check your understanding

<details><summary>With KV Cache, does each step still read history?</summary><p>Usually yes: the new Q is still compared with the visible historical K, and historical V is still aggregated. The cache saves recomputing historical K/V, not all history reads.</p></details>
<details><summary>Does GQA guarantee 4× end-to-end throughput?</summary><p>No. The cache reduction factor follows from the formula, but real speed depends on other kernels, bandwidth, batch size, hardware and implementation.</p></details>

Source: PDF pages 75–83 and the transcript’s KV Cache explanation. The cache formula, memory example and sliding-window reach figure are teaching additions; page 82 was visually checked.
