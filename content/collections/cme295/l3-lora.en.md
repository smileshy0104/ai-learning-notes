---
slug: l3-lora
title: "LoRA: learning weight increments with small matrices"
collection: cme295
lecture: 3
lang: en
description: "Understand low-rank adaptation through matrix shapes, parameter counts and one small forward pass, separating frozen base weights from escaping all training cost."
order: 50
kind: lesson
status: published
tags: [LoRA, PEFT, Low rank]
---

## 1. Why update every parameter every time?

PDF pages 53–56. A base model already carries a lot of representational ability; adapting to a task does not necessarily require changing the whole weight matrix arbitrarily. LoRA restricts the **learned weight increment** to a low-rank structure.

**One simplification to correct:** it is not “compress the trained W₀ into two small matrices and throw it away”. The usual approach keeps and freezes W₀ and trains new A and B.

## 2. Matrix conventions first

This page uses column-vector inputs so it matches the slides’ `W=W₀+BA`:

```text
x ∈ R^(d_in)
W₀ ∈ R^(d_out × d_in)
A ∈ R^(r × d_in)
B ∈ R^(d_out × r)
ΔW = s BA, commonly s = α/r
output y = W₀x + s B(Ax)
```

r is the rank cap, usually much smaller than d_in and d_out. α/r is a common scaling convention rather than the only variant; the hand calculation here takes s=1.

<div class="flow"><span class="chip">x</span><span class="arrow">→ frozen W₀ →</span><span class="chip">base output</span><span class="arrow">+</span><span class="chip">x → small A → B → incremental output</span></div>

## 3. How many parameters does this actually save?

A single 4096×4096 matrix with r=8:

```text
full matrix: 4096²=16,777,216
LoRA: 8×4096+4096×8=65,536
ratio: 65,536/16,777,216=0.390625%
```

For this matrix the trainable parameter count is about 1/256 of the original. **That does not mean the whole model’s memory drops to 1/256**: base weights are still stored, forward and backward activations can still be large, and other layers, precision and optimiser state all count.

## 4. One LoRA forward pass by hand

Take d_in=d_out=2, r=1:

```text
W₀=[[1,0],[0,1]]，A=[[1,−1]]，B=[[0.2],[0.4]]
BA=[[0.2,−0.2],[0.4,−0.4]]
x=[2,1]ᵀ
W₀x=[2,1]ᵀ
Ax=1，B(Ax)=[0.2,0.4]ᵀ
y=[2.2,1.4]ᵀ
```

The base matrix is unchanged; the incremental branch changes the final output.

### A detail that is easy to miss

In this 2×2 toy example the full matrix has 4 parameters and A plus B also has 4, so **no parameters are saved**. It is only convenient for hand arithmetic; real savings depend on r being far smaller than the dimensions. A small example cannot prove a large model’s ratio.

## 5. Initialisation, merging and switching tasks

**Implementation intuition:** common initialisation sets one factor to zero and the other to random values, so the initial increment is zero while training can start; if both factors were exactly zero, the gradient of the product branch could be zero at the start as well.

Under compatible conditions the trained sBA can be merged into W₀ for inference; without merging you can share the base weights and load a different adapter per task. Not every quantised, dynamically routed or served configuration can be merged unconditionally.

“Switching LoRA” requires knowing which adapter belongs to the user’s task; a model does not infer which stored A/B pair to load.

## 6. Which layers should carry LoRA?

The slides first mention the original paper’s experiments on attention projections, then discuss including FFN and other linear layers. The adapted positions, r, data scale and learning rate all affect the result.

“Only changing Q/V is always best” and “LoRA always matches full fine-tuning” are not conclusions. Fewer parameters means a stronger constraint; whether that is enough must be evaluated on a task validation set.

## Check your understanding

<details><summary>Does LoRA remove the need for backpropagation?</summary><p>No — backpropagation is still needed to compute adapter gradients. Freezing the base weights only stops them being updated; it does not remove the forward pass or the necessary gradient computation.</p></details>
<details><summary>Is LoRA a training stage or another objective function?</summary><p>It is mainly a parameterisation and update scheme. It can be combined with objectives such as SFT; it is not mutually exclusive with supervised fine-tuning.</p></details>

Source: PDF pages 53–56; the matrix relationships on page 53 were visually checked. The dimensions, parameter ratios and forward-pass example are teaching additions and do not depend on any framework API.
