---
slug: l5-overview
title: "Lecture 5 overview: make it fit, make it fast"
collection: cme295
lecture: 5
lang: en
description: "Follow the slides through LLM systems: GPUs, FlashAttention, distributed training and inference optimisation."
order: 10
kind: lesson
status: published
tags: [Lecture 5, LLM Systems, Overview]
---

## Why does this lecture matter?

The first four lectures explained how a model computes and how it is trained. This one asks: once parameters and data reach real scale, how do those computations actually run on finite hardware?

Two questions run through the whole lecture: **How do we make it fit?** and **How do we make it fast?**

<div class="flow"><span class="chip">single GPU: move less data</span><span class="arrow">→</span><span class="chip">many GPUs: share storage and compute</span><span class="arrow">→</span><span class="chip">inference: cache, compress, verify in parallel</span></div>

More arithmetic is not necessarily slower, and fewer parameters do not necessarily reduce the latency a user sees. Systems work has to consider compute, memory, communication, queueing and the length of the generated answer together.

## Reading order following the slides

All page numbers are physical PDF pages, with the cover as page 1. Consecutive pages are often one animated diagram unfolding.

| Thread | Pages | Articles |
| --- | --- | --- |
| Introduction / motivation and GPUs | 1–12 | This page, [hardware and units](l5-hardware.html) |
| FlashAttention | 13–62 | [Online softmax and tiling](l5-flash.html) |
| Training memory | 63–70 | [Why training stores more than weights](l5-training-memory.html) |
| Data parallelism and ZeRO | 71–74 | [Data parallel and sharding](l5-zero.html) |
| TP / PP / CP / EP and discussion | 75–88 | [Model parallelism](l5-parallel.html) |
| Inference latency, cost and roofline | 89–102 | [Prefill, decode and bottlenecks](l5-latency-roofline.html) |
| KV Cache and paging | 103–120 | [Cache and PagedAttention](l5-kv-paging.html) |
| Shared KV heads and low-rank representations | 121–137 | [GQA and MLA](l5-gqa-mla.html) |
| Speculative decoding | 138–147 | [Speculative decoding and its distribution proof](l5-speculative.html) |
| Distillation, MTP | 148–151 | [Multi-token prediction](l5-mtp.html) |
| Discussion / summary | 152–156 | [Review and self-test](l5-review.html) |

## Four kinds of “optimisation”

| Kind | Example | Does it change the model definition or distribution? |
| --- | --- | --- |
| Equivalent rearrangement of computation | FlashAttention | Mathematically the same attention; finite precision gives rounding differences |
| Storage / execution scheduling | ZeRO, PagedAttention | The target is usually unchanged, though parallel reductions can change summation order |
| Architecture or representation change | GQA, MLA, MTP | Needs matching design and training; not a drop-in swap for existing weights |
| Sampling acceleration with correction | Speculative decoding | Preserves the target sampling distribution when the algorithm’s conditions hold |

Calling them all “acceleration” does not make them the same kind of lossless technique.

## Prerequisites

- [Self-attention](attention.html): Q, K, V and the weighted sum.
- [Lecture 2 on attention and cache](l2-attention-cache.html): first notions of GQA and KV size.
- [Lecture 3 on the training loop](l3-overview.html): forward, backward and parameter updates.
- [Lecture 4 on distillation](l4-opd.html): note the different KL direction when comparing with this lecture’s distillation.

## Reading notes

The material follows the lecture 5 PDF and the English transcript; additional numbers, dimensions, roofline estimates and speculative-decoding examples are teaching constructions, not real GPU benchmarks or real model output. Hardware, prices, models and FlashAttention version details in the slides are as of the material’s date and are not a current product list.
