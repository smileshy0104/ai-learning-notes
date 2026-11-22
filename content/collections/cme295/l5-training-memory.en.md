---
slug: l5-training-memory
title: "Training memory: what is stored besides the weights?"
collection: cme295
lecture: 5
lang: en
description: "Budget memory across initialisation, forward, backward and update, and explain the training budget with a mixed-precision Adam example under stated assumptions."
order: 40
kind: lesson
status: published
tags: [Training memory, Adam, Activations]
---

## 1. Walk one training loop

PDF pages 64–70. A model cannot simply put its weights in GPU memory and start training:

| Stage | Main storage | What its size depends on |
| --- | --- | --- |
| initialisation | weights | parameter count, data type |
| forward | activations and what the loss needs | layers, hidden size, batch, length |
| backward | gradients, temporary intermediates | parameter scale, computation graph, kernel implementation |
| update | optimiser state | algorithm and state precision |

FlashAttention reduces the large attention intermediates; it does not automatically remove every FFN activation or the optimiser state.

## 2. Why does Adam need extra arrays?

Every parameter keeps first- and second-order moving statistics of its gradient:

```text
m_t=β₁m_{t−1}+(1−β₁)g_t
v_t=β₂v_{t−1}+(1−β₂)g_t²
θ←θ−η m̂_t/(sqrt(v̂_t)+ε)
```

m, v and θ have the same shape; if θ is flattened to P dimensions, so are the other two. m̂ and v̂ are bias-corrected statistics that the slide diagram may omit. AdamW also involves decoupled weight decay, so this shorthand is not a complete trainer.

## 3. A budget with explicit assumptions

Teaching assumptions: BF16 weights 2 bytes, BF16 gradients 2 bytes, FP32 master weights 4 bytes, FP32 m and v together 8 bytes.

```text
per parameter: 2+2+4+8=16 bytes
P=1×10^9 → 16 GB of state
P=100×10^9 → 1600 GB = 1.6 TB of state
```

This counts only “model training state”, excluding activations and temporary space. A real implementation may not keep FP32 master weights, and gradients may be FP32, so **16 bytes is not a universal constant for every training run**.

## 4. Why do activations depend on batch and length?

A B×T×d BF16 hidden state needs 2BTd bytes. With B=2, T=4096 and d=4096, one such tensor is 64 MiB.

A real model may keep several tensors per layer; multiplying by the layer count does not give an exact peak. Recomputation, fusion, lifetimes and parallelism all change what is resident at once.

Smaller micro-batches, activation recomputation, sharding and parallelism each reduce some kind of memory, but may cost compute, communication or throughput.

## 5. What is gradient accumulation?

If one step can only handle 2 samples, do 4 micro-batch forward/backward passes and then one update, accumulating the gradient contribution of 8 samples (with consistent loss scaling). With 2 data-parallel replicas the global batch is 2×4×2=16.

Accumulation does not remove weights, gradients or optimiser state; it mainly lowers the size of a single activation set, and it is not guaranteed to match a true large batch bit for bit in randomness or numerics.

## Check your understanding

<details><summary>Are m and v just two scalars?</summary><p>No. Every parameter has its own statistics, so both are arrays the size of the parameter set.</p></details>
<details><summary>Can activation checkpointing remove the Adam state directly?</summary><p>No. It targets forward intermediates; optimiser state needs other measures such as sharding, precision or a different algorithm.</p></details>

Source: PDF pages 63–70. The 16-byte mixed-precision budget, the hidden-state and the accumulation examples are teaching additions, not measured memory of a specific framework.
