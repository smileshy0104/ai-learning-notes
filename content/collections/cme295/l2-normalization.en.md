---
slug: l2-normalization
title: "Normalisation: Pre-Norm and RMSNorm"
collection: cme295
lecture: 2
lang: en
description: "Separate 'where normalisation sits' from 'which formula it uses', then hand-calculate LayerNorm and RMSNorm on [1,3]."
order: 70
kind: lesson
status: published
tags: [Pre-Norm, Post-Norm, LayerNorm, RMSNorm, Beginner]
---

## 1. Two independent questions

Pages 84–88 of the PDF. Beginners read "Pre-Norm" and "RMSNorm" as two names for one thing, but they answer completely different questions:

| Question | Options | Concern |
| --- | --- | --- |
| Which side of the sublayer does normalisation sit on? | Post-Norm / Pre-Norm | whether gradients flow back smoothly |
| Which formula performs the normalisation? | LayerNorm / RMSNorm | centering, and how many learned parameters |

The two combine freely. Today's models commonly use Pre-Norm with RMSNorm, but that is a convention, not the claim that "Pre-Norm is RMSNorm".

## 2. Residual connections first

To understand "which side", you need the shape of a sublayer.

A Transformer sublayer (attention or FFN) takes x and produces f(x). A residual connection does:

```text
output = x + f(x)
```

Why add plainly? Because x is a direct path: gradients travel back along it without passing through all of f. That matters enormously for tens or hundreds of layers.

The placement question then asks: does the Norm wrap the sum, or sit inside the branch?

## 3. Post-Norm and Pre-Norm

```text
Post-Norm: y = Norm(x + f(x))      ← add first, then normalise
Pre-Norm:  y = x + f(Norm(x))      ← normalise first, then enter the sublayer
```

(Dropout is omitted; it does not change the argument.)

<div class="flow"><span class="chip">Post: x → f → add x → Norm</span><span class="chip">Pre: x → Norm → f → add x</span></div>

The difference in one line each:

- <strong>Post-Norm</strong>: the residual highway is rewritten by Norm after every sublayer.
- <strong>Pre-Norm</strong>: the highway stays exactly `x`; Norm acts only inside the branch.

The original paper used Post-Norm. Later models moved to Pre-Norm because deep Post-Norm stacks are harder to train: the highway is repeatedly normalised, gradients passing back are constrained, and training often needs carefully tuned learning-rate warmup.

Pre-Norm keeps the highway clean, so gradients reach shallow layers more easily and training is more stable.

<strong>Without overpromising</strong>: Pre-Norm does not guarantee that any depth trains. It improves conditioning; initialisation, optimiser, numeric precision and depth still matter. Also, Pre-Norm leaves the output unnormalised, so magnitudes can grow with depth — some implementations append a final Norm for that reason.

## 4. LayerNorm: subtract the mean, then scale by standard deviation

Now the formula. For a d-dimensional token representation x:

```text
μ = mean(x)
σ² = mean((x − μ)²)
LN(x) = γ ⊙ (x − μ) / √(σ² + ε) + β
```

Term by term:

- `μ`: the average of this list of numbers.
- `x − μ`: subtract the mean, called <strong>centering</strong>, so the result has mean zero.
- `σ²`: variance, how spread out the numbers are.
- `(x − μ)/√(σ² + ε)`: divide by the standard deviation so the result has variance near one, called <strong>scaling</strong>.
- `ε`: a tiny constant preventing division by zero.
- `γ`, `β`: learnable scale and shift, letting the model restore some magnitude and offset.
- `⊙`: element-wise multiplication.

Direction matters: statistics are computed <strong>along the feature dimension</strong>, over one token's own numbers, not across tokens.

### Calculate [1, 3]

Take γ=[1,1], β=[0,0] and ignore ε for readability:

```text
μ = (1 + 3) / 2 = 2
x − μ = [1−2, 3−2] = [−1, 1]
σ² = ((−1)² + 1²) / 2 = 1
σ = 1
LN([1,3]) = [−1, 1]
```

Mean zero, variance one — LayerNorm's target.

## 5. RMSNorm: skip the mean, scale by the root mean square

```text
RMS(x) = √(mean(x²))
RMSNorm(x) = γ ⊙ x / √(mean(x²) + ε)
```

Compared with LayerNorm it drops two things: no centering, and usually no shift β. Only scaling.

Again with [1,3], γ=[1,1], ignoring ε:

```text
mean(x²) = (1² + 3²) / 2 = (1+9)/2 = 5
RMS = √5 ≈ 2.236
RMSNorm([1,3]) = [1/2.236, 3/2.236] ≈ [0.4472, 1.3416]
```

Side by side:

| Aspect | LayerNorm | RMSNorm |
| --- | --- | --- |
| Subtracts the mean? | yes | no |
| Scale basis | standard deviation | root mean square |
| Output mean always zero? | after centering, yes; not with β | never required |
| Learned parameters | γ and β | usually only γ |
| Result for [1,3] | [−1, 1] | [0.4472, 1.3416] |

<strong>Why is RMSNorm's output not zero-mean?</strong> It keeps the overall offset and only adjusts scale. Its goal is controllable magnitude, not symmetry.

<strong>Why is it cheaper?</strong> One fewer mean, one fewer parameter group, one fewer subtraction — meaningful when accumulated across a large model. Empirically it performs comparably, which is why many current models use it.

## 6. Verify what centering removes

Add 2 to both inputs, turning [1,3] into [3,5]. Which operator changes?

<strong>LayerNorm</strong>:

```text
μ = (3+5)/2 = 4
x − μ = [−1, 1]
σ² = 1
LN([3,5]) = [−1, 1]
```

Identical to the [1,3] result: the overall shift is removed by centering.

<strong>RMSNorm</strong>:

```text
mean(x²) = (9+25)/2 = 17
RMS = √17 ≈ 4.123
RMSNorm([3,5]) = [3/4.123, 5/4.123] ≈ [0.7276, 1.2127]
```

The result changes: RMSNorm keeps the shift and compresses magnitude only.

That is the deepest difference: <strong>LayerNorm is invariant to a shared shift; RMSNorm is not.</strong> Which is better depends on the task and training dynamics; there is no universal answer.

## 7. Do not confuse placement with formula

Using the teaching sublayer `f(u) = 2u`, x=[1,3], same γ and β:

```text
Post-LN: LN(x + f(x)) = LN([1,3] + [2,6]) = LN([3,9])
       = [−1, 1]

Pre-LN:  x + f(LN(x)) = [1,3] + 2×[−1,1]
       = [1,3] + [−2,2]
       = [−1, 5]
```

Different results. This is not arithmetic trivia: <strong>both placement and formula change the numbers, and neither substitutes for the other.</strong>

Real sublayers are not such simple linear maps, so moving a layer around does not preserve the original model.

## 8. Common combinations in modern models

| Era | Common combination | Reason |
| --- | --- | --- |
| original paper | Post-Norm + LayerNorm | the standard at the time |
| later deep models | Pre-Norm + LayerNorm | deep stacks train more easily |
| current mainstream | Pre-Norm + RMSNorm | stable training, less computation |

The subtitle's "pre-surgery / post-surgery normalisation" and similar renderings are mistranslations of Pre/Post-Norm; read the English terms.

## 9. Check your understanding

<details><summary>Does RMSNorm turn every number into 1?</summary><p>No. It divides by a single scale, preserving ratios between components. [1,3] becomes about [0.4472, 1.3416], still 1:3.</p></details>
<details><summary>Are Pre-Norm and the residual connection redundant?</summary><p>No. The residual provides a direct path for x; Pre-Norm decides where normalisation sits in the branch. They cooperate on optimisation but do different jobs.</p></details>
<details><summary>Why do deep models prefer Pre-Norm?</summary><p>It leaves the residual highway unnormalised, so gradients travel back more easily and training is more stable. This does not mean Post-Norm cannot train; it usually needs more careful hyperparameters.</p></details>

## 10. Commonly confused points

- Pre/Post is about <strong>placement</strong>; Layer/RMS is about <strong>formula</strong>.
- RMSNorm is not "LayerNorm without the square root"; it is normalisation without centering.
- Normalisation runs along the feature dimension, not across tokens.
- ε only prevents division by zero and does not affect the concept.
- Because γ and β are learnable, the full formula does not guarantee zero-mean output.

Source: PDF pages 84–88 and the transcript; pages 85–87 were visually checked. Numeric examples omit ε and fix γ, β as teaching additions.
