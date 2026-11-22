---
slug: l5-hardware
title: "GPUs and units: fast arithmetic is not fast data movement"
collection: cme295
lecture: 5
lang: en
description: "Separate FLOPs, FLOP/s, capacity and bandwidth, and build hardware intuition from a matrix product and the size of the weights."
order: 20
kind: lesson
status: published
tags: [GPU, FLOPs, HBM, SRAM]
---

## 1. Why use a GPU?

PDF pages 3–12. Transformers lean heavily on matrix multiplication, whose output elements can be computed in parallel; GPU parallel execution and dedicated matrix units suit that. But a model also contains normalisation, data movement, communication and sampling — not only matrix multiplication.

Supplementary example: A is 2×3, B is 3×2 and C=AB is 2×2. Each element of C needs a dot product of length 3. Exactly counting, 4×(3 multiplications + 2 additions) = 20 scalar operations; performance estimates often quote about 2mnk = 24 FLOPs, ignoring boundary terms. An FMA usually counts as 2 FLOPs (multiply plus add), and which convention is used should be stated.

## 2. Do not mix four metrics

| Metric | Unit | Question it answers |
| --- | --- | --- |
| Amount of work | FLOPs | how much work in total |
| Compute throughput | FLOP/s | how much work per second, peak or achieved |
| Memory capacity | bytes, GB, GiB | how much data can be held at once |
| Bandwidth | bytes/s, GB/s, TB/s | how much data moves per second |

Lowercase-s FLOPs and uppercase-S FLOPS are easy to confuse; FLOP/s is the clearest form. Hardware peaks depend on precision, sparsity conditions and more; a single TFLOP/s figure cannot be treated as the real speed of every operator.

## 3. How large are the weights at minimum?

```text
weight bytes = parameter count P × bytes per parameter
100 billion = 100×10^9
FP16 or BF16 uses 2 bytes per element
total 200×10^9 bytes = 200 GB ≈ 186.2645 GiB
```

GB uses 10^9 and GiB uses 2^30. This example counts weights only, excluding gradients, optimiser state, activations, KV Cache, workspace and runtime overhead.

So “the GPU has more capacity than the weights” is only one necessary consideration; it does not mean training or serving will necessarily run.

## 4. The roles of HBM and SRAM

- HBM (High Bandwidth Memory): larger capacity, relatively slower than on-chip storage, holding weights and large intermediate state.
- SRAM: small, fast on-chip storage. Real hardware also distinguishes registers, shared memory and caches; the aggregated capacity of a GPU is not something every thread block can own exclusively.
- Compute units: the units doing arithmetic; if data cannot be supplied in time, even a high peak can sit idle.

Teaching analogy: HBM is a large warehouse and on-chip storage is the workbench. You do not fit the warehouse onto the bench; you fetch reasonable batches and avoid repeated trips.

## 5. “Not fast enough” can mean different things

For the same model computation, sometimes compute is short, sometimes memory bandwidth, sometimes inter-GPU link bandwidth, and sometimes it is simply queueing. Measure the bottleneck first, then decide whether to change kernels, raise the batch size, shard, or reduce the number of generation rounds.

The slides cite GPU specifications as order-of-magnitude illustrations; it does not follow that every GPU has the same capacity or bandwidth. This note does not promote the versions in those slides into current market facts.

## Check your understanding

<details><summary>If capacity doubles, does per-token generation speed necessarily double?</summary><p>No. Capacity decides how much fits; if the bottleneck is compute or bandwidth, more capacity alone does not raise throughput.</p></details>
<details><summary>With 200 GB of BF16 weights, can a 200 GB GPU train the full model directly?</summary><p>Usually not. Training also stores or recomputes activations, gradients, optimiser state and temporary communication workspace.</p></details>

Source: PDF pages 3–12; the matrix operation count and the GB/GiB conversion are teaching additions.
