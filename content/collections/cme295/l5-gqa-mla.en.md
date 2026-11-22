---
slug: l5-gqa-mla
title: "GQA and MLA: fewer KV vectors, and shorter ones"
collection: cme295
lecture: 5
lang: en
description: "Separate head sharing from latent-representation compression, give the GQA cache ratio and simplified MLA projection shapes, and note the boundaries of architectural change."
order: 90
kind: lesson
status: published
tags: [GQA, MQA, MLA, Low rank]
---

## 1. Paging only arranges data — can we store less of it?

PDF pages 121–137 move from “place it better” to “store fewer vectors” and “store smaller representations”. These are not three switches that stack unconditionally: GQA and MLA each have their own architecture design, and the specific model must be checked.

## 2. GQA: several query groups share K/V

With H_q query heads and H_kv key/value groups, H_q is usually divisible by H_kv:

| Architecture | H_kv | Relationship |
| --- | --- | --- |
| MHA | H_q | one KV set per query head |
| GQA | between 1 and H_q | each group of queries shares KV |
| MQA | 1 | all queries share one KV |

The query heads are not deleted down to H_kv. Each query still has its own query representation; it simply reads shared K/V.

With the same layers, length, head dimension and precision, the KV cache ratio is H_kv/H_q. In the slides H_q=24 and H_kv=2, keeping 1/12 and saving 91.6667%. That is not a 91.6667% saving in total model memory or total inference time.

For the previous page’s configuration with H_q=32: MHA needs 2 GiB of KV, H_kv=8 gives 512 MiB and MQA gives 64 MiB. Every figure counts KV only, without paging slack.

## 3. Can heads be merged in a pretrained model?

Do not assume it is lossless. Sharing K/V changes expressive capacity and usually needs matching training, conversion or retraining. MQA is not universally “unusable” or necessarily worse; the outcome depends on the task and training, and it is a trade among quality, speed and capacity.

## 4. MLA: share one small latent

MLA stands for Multi-head Latent Attention; the slides and speech may drop “head”. It builds a shared low-dimensional KV latent per token, avoiding a cache of each head’s fully expanded K/V.

Below is a **simplified content branch** in column-vector convention:

```text
h_t: d_model×1
W_down: d_c×d_model
c_t=W_down h_t: d_c×1
W_upK: (H_q d_k)×d_c
W_upV: (H_q d_v)×d_c
k_t=W_upK c_t，v_t=W_upV c_t
```

Each head can have its own up-projection; what is shared is c_t, not identical K/V for every head. After caching c_t you can rebuild on demand, or absorb matrices so that fully expanded KV is not written back every step.

## 5. Low-dimensional hand calculation

Take h=[1,2]ᵀ and W_down=[1,1], giving c=3. With W_upK=[1,2]ᵀ and W_upV=[2,−1]ᵀ, the expansions are k=[3,6]ᵀ and v=[6,−3]ᵀ.

This only shows “one latent generating different K/V”; it does not prove that any original k/v can be compressed losslessly into one dimension. A low-dimensional representation is a trained architectural constraint, not general lossless file compression.

Ignoring the position branch, conventional content caching costs about H_q(d_k+d_v) elements per token, while the latent costs d_c elements. Real MLA also involves decoupled positional encoding and extra caches, so d_c alone is not the whole model formula.

## 6. Why can RoPE not be ignored?

For a simple unrotated content term you can write `qᵀ(W_upK c)=(W_upKᵀq)ᵀc`, letting a transformed query interact directly with the latent.

But a position-dependent rotation inserted into the computation limits simple matrix absorption. DeepSeek-style MLA uses designs such as decoupled position handling; the diagram in this lecture conveys the sharing-and-compression intuition and must not be read as “two linear layers and done”.

MLA and [LoRA](l3-lora.html) both involve low-rank projections, but LoRA is mainly a parameterisation of weight increments while MLA is an attention architecture and cache representation — different purposes and different objects.

## Check your understanding

<details><summary>Does a 92% GQA saving mean the weights shrink by 92%?</summary><p>No. That ratio applies specifically to the KV cache under the same-dimension assumption, excluding queries, the FFN, other weights and state.</p></details>
<details><summary>Does the shared latent in MLA make every head identical?</summary><p>No. Each head can have its own up-projection; sharing the encoding is not sharing every expanded representation.</p></details>

Source: PDF pages 121–137; capacity conversions, projection shapes and numbers are teaching additions. Specific model specifications are understood as of the slide snapshot.
