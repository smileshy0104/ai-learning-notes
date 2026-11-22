---
slug: l5-parallel
title: "Model parallelism: what do TP, PP, CP and EP each split?"
collection: cme295
lecture: 5
lang: en
description: "Understand the five parallel axes through matrix dimensions, pipeline bubbles, context blocks and expert routing, and the communication each costs."
order: 60
kind: lesson
status: published
tags: [TP, PP, CP, EP, Distributed training]
---

## 1. One sentence each

PDF pages 75–88: DP splits data; TP splits tensor computation; PP splits layers/stages; CP splits context positions; EP splits experts. They organise work along different axes, not a ranking of algorithms.

## 2. Tensor parallelism: split inside one layer

Look at an FFN: X is T×d, A is d×f, B is f×d:

```text
Y=GELU(XA)，Z=YB
A=[A₁ A₂]：沿列拆，各d×(f/2)
B=[B₁; B₂]：沿行拆，各(f/2)×d
Z=GELU(XA₁)B₁+GELU(XA₂)B₂
```

Each GPU computes part of the hidden channels and the results are summed. GELU applies independently per block, so the non-linearity cannot simply move across the matrix sum.

Small teaching example: X=[1,2], A the identity, B=[[1,2],[3,4]], using the identity instead of GELU. The two GPUs give [1,2] and [6,8], summing to [7,10], matching XB directly. This only checks the block algebra, not a full FFN result.

Multi-head attention can also place different heads on different GPUs, followed by an output projection and communication. Every layer carries communication cost, so interconnect quality matters.

## 3. Pipeline parallelism: layers as an assembly line

The first layers on GPU 0, middle layers on GPU 1, last layers on GPU 2. Activations flow forward, gradients flow backward.

Sending one micro-batch makes later GPUs wait for earlier ones, and earlier ones then wait for the backward pass; those idle gaps are bubbles. Several micro-batches and a suitable forward/backward schedule reduce the gaps, at the cost of managing activations and load balance.

Supplementary ideal model: p equal-time stages and m micro-batches; a forward-only pipeline needs m+p−1 time slots, giving utilisation `m/(m+p−1)`. With p=4, m=1 gives 25%, m=4 about 57.14% and m=16 about 84.21%. This is a simplified forward model, not an exact efficiency formula for any schedule.

## 4. Context parallelism: split positions of one long sequence

Each GPU owns part of the query positions, and K/V blocks are exchanged according to the communication strategy so that every query eventually sees all keys it should.

With two blocks: GPU A first processes Q_A with K_A/V_A while GPU B processes Q_B with K_B/V_B; after exchanging K/V each handles the other block. Results must be merged with the online-softmax statistics — **you cannot softmax each block independently and average**.

The causal mask must survive: earlier positions may not peek at the future just because blocks were exchanged. CP does not turn a long document into independent non-communicating samples, nor does it remove the total dense-attention arithmetic.

## 5. Expert parallelism: tokens travel to experts

In an MoE, expert FFNs live on different GPUs; the router decides which experts receive each token, an all-to-all dispatch is computed, and results are combined back to the original logical positions.

Shared attention can use other parallel axes; unbalanced expert load, hotspots, capacity policies and communication can become bottlenecks. Looking only at total parameter count cannot tell you activated parameters per step or real throughput.

## 6. How do they combine?

Teaching topology: DP=2, TP=2, PP=2 along independent axes gives 8 GPUs in total, not 2+2+2=6. If EP or CP reuses some communication groups, you cannot mechanically multiply every number again; check the actual layout.

More GPUs can bring more capacity and throughput, but also lower utilisation through too little work per GPU, pipeline imbalance or communication waits. Cost should be measured in total GPU time per completed task, not only per-step wall-clock time.

## Check your understanding

<details><summary>What is the difference between putting different heads on different GPUs and different layers on different GPUs?</summary><p>The first is tensor parallelism inside a layer; the second is stage-wise pipeline parallelism. Their communication content and scheduling differ.</p></details>
<details><summary>Can CP block outputs simply be averaged?</summary><p>No. Each block has a different softmax denominator, so maxima, normalisation and numerator statistics must be merged to recover global attention.</p></details>

Source: PDF pages 75–88; the matrix hand calculation, ideal pipeline formula and GPU counts are teaching additions.
