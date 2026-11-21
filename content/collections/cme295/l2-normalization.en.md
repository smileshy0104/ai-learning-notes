---
slug: l2-normalization
title: "Normalisation: Pre-Norm and RMSNorm"
collection: cme295
lecture: 2
lang: en
description: "Separate where normalisation goes from what formula it uses, then hand-compute LayerNorm and RMSNorm on the vector [1,3]."
order: 70
kind: lesson
status: published
tags: [Pre-Norm, Post-Norm, LayerNorm, RMSNorm]
---

## 1. Two separate questions

Pages 84–88 of the PDF discuss two independent changes:

1. **Placement**: does normalisation come before or after the residual addition? Pre-Norm / Post-Norm.
2. **Formula**: subtract the mean and scale, or scale by the root mean square only? LayerNorm / RMSNorm.

“Pre-Norm is RMSNorm” is wrong. One is about order, the other about the operator itself.

## 2. Post-Norm and Pre-Norm

Let f be an attention or FFN sublayer, with dropout omitted:

```text
Post-Norm：y = Norm(x + f(x))
Pre-Norm： y = x + f(Norm(x))
```

<div class="flow"><span class="chip">Post: x → f → add x → Norm</span><span class="chip">Pre: x → Norm → f → add x</span></div>

**Why Pre-Norm is common in deep models**: it keeps x on the residual highway from passing through a normalisation after every sublayer, which improves gradient flow and training stability.

But “gradients are never attenuated” and “warmup is no longer needed” are not guarantees. Initialisation, optimiser, training precision, depth and other structural choices still matter.

## 3. LayerNorm: subtract the mean, then scale by the standard deviation

For the d-dimensional representation x of one token:

```text
μ = mean(x)
σ² = mean((x−μ)²)
LN(x) = γ ⊙ (x−μ)/sqrt(σ²+ε)
```

γ and β are usually learnable d-dimensional vectors; ⊙ is elementwise multiplication. The statistics are computed along the feature dimension, not across positions or sentences.

### Hand-computing with [1,3]

For hand arithmetic drop the tiny ε and set γ=[1,1], β=[0,0]:

```text
μ=(1+3)/2=2
σ²=[(1−2)²+(3−2)²]/2=1
LN([1,3])=[−1,1]
```

Attention mixes information across positions; normalisation controls the scale inside each position’s own features. Different jobs.

## 4. RMSNorm: no mean subtraction, scale by the root mean square

```text
RMS(x) = sqrt(mean(x²))
RMSNorm(x) = γ ⊙ x / sqrt(mean(x²)+ε)
```

The common RMSNorm omits LayerNorm’s mean centring and the β bias, though implementations may differ in detail.

Again with γ=[1,1] and ε omitted:

```text
RMS([1,3])=sqrt((1²+3²)/2)=sqrt(5)≈2.2361
RMSNorm([1,3])≈[0.4472,1.3416]
```

| Aspect | LayerNorm | RMSNorm |
| --- | --- | --- |
| Subtract the mean? | Yes | No |
| Scale | standard deviation | root mean square |
| Example output | [−1,1] | [0.4472,1.3416] |
| Output mean always 0? | Not after the learnable affine | Never required |

RMSNorm is fine with a non-zero mean: it is not trying to make values symmetric, it uses a simpler scaling mechanism. Whether it is faster depends on kernels and hardware; the formula alone does not guarantee a speed-up.

## 5. Mind where the residual is added

Take x=[1,3] and the **purely teaching** sublayer f(u)=2u:

- Post-LN: `LN(x+2x)=LN([3,9])=[−1,1]`.
- Pre-LN: `x+2LN(x)=[1,3]+[−2,2]=[−1,5]`.

The results differ, so normalisation and sublayer order cannot be swapped freely. Real sublayers are more complex; moving one layer around does not preserve the original model’s output.

## Check your understanding

<details><summary>Does RMSNorm turn every number in a token into 1?</summary><p>No. It divides by a single scale, keeping the ratios between components, then applies the learnable γ. The example [1,3] still keeps the 1:3 ratio.</p></details>
<details><summary>Do Pre-Norm and the residual connection do the same job?</summary><p>No. The residual provides a direct path for x; Pre-Norm decides where inside the sublayer branch normalisation runs. They work together on optimisation.</p></details>

Source: PDF pages 84–88 and the transcript; pages 85–87 were visually checked. The numeric example omits ε and fixes γ, β for clarity; it is a teaching addition.
