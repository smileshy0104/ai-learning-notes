---
slug: l5-kv-paging
title: "KV cache and paging: no recomputation, no wasted space"
collection: cme295
lecture: 5
lang: en
description: "Explain why a causal model may cache past K/V, the difference between within-request and cross-request caching, and how PagedAttention reduces reservation waste and fragmentation."
order: 80
kind: lesson
status: published
tags: [KV Cache, PagedAttention, Prefix caching]
---

## 1. Why can past K and V be reused?

PDF pages 104–109. In a causal decoder, the representations of already-computed positions are not affected by later tokens. So while the model, positions and prefix stay fixed, each layer’s past K/V can be stored.

A new token computes only its own Q/K/V, then uses the current Q to attend to the allowed historical KV. The whole prefix does not have to be projected again, but the relevant historical KV still has to be read and processed, so longer context is never free.

Why is old Q usually not stored? Future positions query past K/V with their own new Q; a past query is not needed as input for future attention. The outputs at old positions are already computed.

## 2. How much is stored?

For a simplified model with an equal-length batch and identical K/V dimensions:

```text
KV bytes = 2 × L × B × T × H_kv × d_h × b_elem
```

2 stands for K and V, L for layers, B for active sequences, T for cached length, H_kv for KV heads (not query heads), and b_elem for bytes per element. With unequal lengths, sum the effective T over sequences instead.

With L=32, B=1, T=4096, H_kv=8, d_h=128 and b_elem=2 the result is 512 MiB. With B=4 it is 2 GiB; paging slack, metadata and other model state are not yet counted.

## 3. Three kinds of “cache” to keep apart

| Name | What is stored | Purpose |
| --- | --- | --- |
| within-request KV cache | K/V of the prefix already computed for this generation | avoid recomputing at every decode step |
| cross-request / turn prefix cache | KV blocks for an exactly matching prefix | less prefill for later requests |
| answer cache | the complete response | a hit may skip running the model at all |

The slides’ cached-input pricing example mainly refers to the second kind; it does not mean every within-request KV reuse is billed separately as cached input.

Prefix reuse must match tokens, positions, model version and any configuration that affects results; synonymous text does not imply identical KV. Services must also consider tenant isolation, cache invalidation and privacy, so cross-user sharing cannot leak content.

## 4. The waste of naive contiguous reservation

If every request reserves the maximum input-plus-output space up front, a short answer leaves the rest occupied; after requests finish and free memory, holes that are hard to grow into can remain.

Held-but-unused space is reservation waste, non-contiguous holes are external fragmentation, and an unfilled block tail is internal fragmentation. They are related but distinct.

## 5. PagedAttention’s block table

PDF pages 111–120. Split logical token positions into fixed-size blocks; each request keeps a logical-to-physical block map, and physical blocks need not be contiguous; the attention kernel reads through the block table.

```text
one request: logical blocks 0, 1, 2 → physical blocks 7, 2, 9
after physical block 2 is freed it can be reallocated to another request
```

This does not make model attention sparse: every logically allowed historical token is still attended to; only the physical address management is more flexible.

<!-- lab:l5-paging -->

Teaching requests of length [5,9,13] use 27 effective tokens; with block size 4 the allocation is [8,12,16] — 36 slots with 9 wasted at tails; with block size 8 it is [8,16,16] — 40 slots with 13 wasted. A token slot contains that token’s per-layer K/V information, not one scalar byte.

## 6. Are smaller blocks always better?

Smaller blocks usually reduce tail waste but increase block-table and address-handling cost and may hurt kernel efficiency; larger blocks do the reverse. The slides use 16 as an order-of-magnitude example, not a fixed optimum for every backend.

Finished requests can return blocks and running ones append on demand; the scheduler still has to consider total capacity, concurrency, eviction and recomputation. Paging does not create infinite memory, nor does it compress the KV data into fewer vectors.

## Check your understanding

<details><summary>Does a KV cache mean attention is no longer computed?</summary><p>No. What is saved is repeated projection of the old prefix; the new Q still reads the relevant K/V and computes attention.</p></details>
<details><summary>Does paging automatically drop distant tokens?</summary><p>No. It changes physical management; the logical attention range is still decided by the model and the mask.</p></details>

Source: PDF pages 103–120; the cache capacities, block tables and fragmentation numbers are teaching constructions.
