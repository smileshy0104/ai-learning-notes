---
slug: l5-zero
title: "Data parallelism and ZeRO: sharding data and redundant state"
collection: cme295
lecture: 5
lang: en
description: "Understand DP's gradient synchronisation and the three ZeRO stages, and use an auditable per-GPU state budget to separate ideal storage from peak memory."
order: 50
kind: lesson
status: published
tags: [Data parallelism, ZeRO, Sharding]
---

## 1. What does DP separate?

PDF pages 71–74. Data Parallelism splits a batch into sub-batches; each GPU runs forward and backward. Naive synchronous DP keeps a full model on every GPU, then synchronises gradients so the updated replicas stay identical.

It is not “each GPU trains a different model and the answers are stitched together at the end”. Communication reductions and consistent optimiser updates are required.

Teaching example: two GPUs each process the same number of valid samples with local mean gradients [2,4] and [4,0], giving global mean [3,2]. If the valid token counts differ and the objective averages per token, you cannot always average the two GPU means again unconditionally; weighting must be correct.

## 2. Why is ZeRO still sharded data parallelism?

ZeRO = Zero Redundancy Optimizer. Every GPU still runs the full model path over its own data, but training state is not replicated and kept on all GPUs at all times; parameters are gathered when needed, and gradients and state are spread over the owning GPUs.

Where TP splits a single layer’s matrix operations across GPUs, ZeRO mainly manages **redundancy and the lifetime of model state**. Implementations can combine both.

## 3. How are the three stages split?

Keep the assumptions from the previous page: parameters 2P, gradients 2P and optimiser-related state 12P bytes, with FP32 master weights plus m and v counted in the last item. Let D be the number of GPUs in one DP group.

| Scheme | Per-GPU long-lived state, idealised |
| --- | --- |
| plain DP | 2P+2P+12P |
| ZeRO-1 | 2P+2P+12P/D |
| ZeRO-2 | 2P+(2P+12P)/D |
| ZeRO-3 | (2P+2P+12P)/D |

<!-- lab:l5-zero -->

With P=1 billion and D=4 the per-GPU figures are 16, 7, 5.5 and 4 GB. Do not misread that as “the whole cluster needs only 4 GB”: the ideal total for ZeRO-3 is still 16 GB, simply no longer replicated per GPU.

## 4. Why are those numbers not the peak?

Activations, communication buckets, prefetching, temporarily gathered full layers and operator workspace are still needed. ZeRO-3 all-gathers parameters when required and applies reduce-scatter or equivalent synchronisation to gradients.

So it is not “this GPU only ever touches a quarter of the parameters”, nor “memory falls without limit as D grows”. Shard granularity, prefetching and retention policies decide the real peak and how communication overlaps.

## 5. What does the memory saving cost?

More communication, synchronisation and scheduling; with slow interconnects, throughput can suffer. But when the model simply does not fit, being able to run at all is the first goal.

DP, ZeRO, TP and PP are not four mutually exclusive buttons. Real systems place them in different communication groups, and the combination depends on the model, cluster topology and measured budget.

## Check your understanding

<details><summary>Does ZeRO-1 also shard the parameters per GPU?</summary><p>No. ZeRO-1 mainly shards optimiser state; sharding gradients is stage 2, and permanently sharding parameters is stage 3.</p></details>
<details><summary>If stage 3 computes 4 GB, is a 4 GB GPU enough for that training example?</summary><p>No. That is only the ideal long-lived state, excluding activations, temporary gathers and workspace that contribute to the peak.</p></details>

Source: PDF pages 71–74 and the classroom Q&amp;A on ZeRO; the state budget and gradient vectors are teaching constructions.
