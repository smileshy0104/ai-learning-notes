---
slug: l2-position
title: "Position: sinusoidal encoding, ALiBi and RoPE"
collection: cme295
lecture: 2
lang: en
description: "Start from why position is needed, hand-calculate sinusoidal encodings and rotation matrices, and follow RoPE to relative position in one path."
order: 50
kind: lesson
status: published
tags: [RoPE, ALiBi, Positional encoding, Rotation matrix, Beginner]
---

## 1. Why position cannot be omitted

Pages 51–74 of the PDF.

Try a small experiment. Hand a pure-attention model two sentences:

```text
the bear holds the child
the child holds the bear
```

It sees the same set of tokens in a different order. Without position information, attention mixes whatever tokens appear and never learns which came first, so both sentences end up with nearly the same representation.

This property is <strong>permutation equivariance</strong>: reorder the input and the output simply reorders, with relationships inside unchanged. Distinguishing order therefore requires injecting position explicitly.

That is the starting point on pages 52–54. The next question: how should position be represented so it is both accurate and general?

## 2. Option one: learnable absolute positions

The most direct approach: number positions 0, 1, 2… and give each a learnable vector, added to the token vector.

```text
input = token embedding + position embedding
xₘ = e(token) + p(m)
```

<strong>Benefit</strong>: simple, and the model learns how to distinguish positions.

<strong>Problem</strong>: the table has a fixed length. Training covered 0 to 511, so position 1000 has no vector at all. This is the inability to extrapolate.

Engineering workarounds exist — extend the table, interpolate, continue training — but they are patches, not something this method gives for free.

## 3. Option two: sinusoidal encoding, positions as fast and slow clock hands

The 2017 paper proposed a scheme needing no learning: compute each position's vector from a fixed formula.

Start with an analogy. Look at a watch: the hour hand moves slowly, the minute hand faster, the second hand fastest. The combination of readings pins down the time precisely. <strong>A single hand is ambiguous; several hands at different frequencies are unique.</strong>

Sinusoidal encoding gives a position a set of hands at different frequencies.

```text
ωᵢ = 10000^(−2i/d)
PE(m, 2i)   = sin(m · ωᵢ)
PE(m, 2i+1) = cos(m · ωᵢ)
```

- `m`: position index.
- `i`: pair index; each pair occupies two dimensions.
- `d`: total dimension.
- `ωᵢ`: frequency of that pair.

Small i (early dimensions) gives higher frequency and faster change; large i gives lower frequency and slower change. That is the slide's chart: early dimensions oscillate rapidly with position, later ones drift slowly.

### A hand calculation with d=4

With d=4 there are two pairs, i=0 and i=1:

```text
ω₀ = 10000^(−0/4) = 1
ω₁ = 10000^(−2/4) = 10000^(−0.5) = 0.01
```

So position m encodes as `[sin(m), cos(m), sin(0.01m), cos(0.01m)]`.

| Position m | PE(m), approximate |
| --- | --- |
| 0 | [0, 1, 0, 1] |
| 1 | [0.8415, 0.5403, 0.0100, 1.0000] |
| 2 | [0.9093, −0.4161, 0.0200, 0.9998] |

The first pair changes fast (0 → 0.84 → 0.91), the second barely moves (0 → 0.01 → 0.02). Mixing fast and slow lets the code separate nearby positions while staying smooth over long distances.

## 4. Why the dot product reveals relative distance

What matters is that the dot product of two position encodings depends only on their separation.

Recall one identity:

```text
cos(a − b) = cos a · cos b + sin a · sin b
```

For each pair i:

```text
sin(mωᵢ)sin(nωᵢ) + cos(mωᵢ)cos(nωᵢ) = cos((m − n)ωᵢ)
```

Summing over pairs:

```text
PE(m) · PE(n) = Σᵢ cos((m − n)ωᵢ)
```

Only `m − n` survives on the right, which is the distance. That is the property behind pages 58–65.

<strong>Compute the dot product for positions 0 and 1</strong> using unrounded values:

```text
first pair:  0×0.8415 + 1×0.5403 = 0.5403
second pair: 0×0.0100 + 1×0.99995 ≈ 0.99995
total ≈ 1.5403
```

Positions 10 and 11 give about 1.5403 as well, because the distance is also 1. Shifting both positions leaves the dot product unchanged.

Three boundaries:

- The property concerns <strong>the position encodings themselves</strong>, not full attention scores, which also depend on token content and projections.
- Cosine is periodic, so greater distance does not always mean less similarity; it can bounce back.
- The formula evaluates any new position, but "can be computed" is not "the model handles arbitrary lengths reliably".

## 5. Putting position into the attention score

Sinusoidal encoding is added at the input and then flows through the network. Another approach modifies the attention match directly:

```text
score(m, n) = qₘ · kₙ / √dₖ + b(m, n)
```

The slides list several ways to add `b`:

| Method | How position enters | Character |
| --- | --- | --- |
| T5 relative bias | bucket relative distance, learn one bias per head | distance is discretised, not learned per exact gap |
| ALiBi | linear penalty for more distant past positions | no position table; strength per head |
| RoPE | rotate queries and keys | position enters the match itself |

<strong>ALiBi in teaching form</strong>: for n ≤ m, `b(m,n) = −sₕ · (m − n)`, with a per-head slope `sₕ`. If `sₕ=0.5`, the current and three previous positions get 0, −0.5, −1, −1.5.

The intuition: farther is less relevant, so it is penalised; content scores can still overcome the penalty, so it is a soft preference rather than a hard block.

## 6. RoPE: rotating vectors

RoPE = Rotary Position Embeddings, from RoFormer (2021), covered on pages 68–74. The subtitle's "rope" is a literal mistranslation of the acronym.

### Two-dimensional rotation first

A 2-D vector can be written as length plus angle:

```text
[x, y] = [r·cosθ, r·sinθ]
```

Multiplying by a rotation matrix adds φ to the angle:

```text
R(φ) = [[cosφ, −sinφ],
        [sinφ,  cosφ]]
```

Check it:

```text
x' = r cosθ cosφ − r sinθ sinφ = r cos(θ+φ)
y' = r cosθ sinφ + r sinθ cosφ = r sin(θ+φ)
```

That is the angle-sum identity. <strong>Multiplying by the rotation matrix turns the vector by φ and preserves its length.</strong>

Example: `[1, 0]` rotated 90° becomes `[0, 1]`, still length 1. Degrees are used here only for readability; real computation uses radians.

<svg viewBox="0 0 520 220" role="img" aria-label="2-D vector rotation: pointing right, rotated ninety degrees to point up" style="width:100%;max-width:520px"><defs><marker id="rope-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#326947"/></marker></defs><g stroke="#a4b6a3"><path d="M80 175H435M110 195V20"/></g><g stroke="#326947" stroke-width="3" marker-end="url(#rope-arrow)"><path d="M110 175H280"/><path d="M110 175V55"/></g><path d="M180 175A70 70 0 0 0 110 105" fill="none" stroke="#b98836" stroke-dasharray="5 3"/><g fill="#24382d" font-size="15"><text x="290" y="180">[1,0], original</text><text x="125" y="55">[0,1], rotated</text><text x="170" y="115">90°</text></g></svg>

### What RoPE does

Instead of adding a position vector, rotate the query and key by position. Position m rotates its query by mθ, position n rotates its key by nθ:

```text
q̃ₘ = R(mθ) qₘ
k̃ₙ = R(nθ) kₙ
```

Then take the usual dot product:

```text
q̃ₘᵀ k̃ₙ = qₘᵀ R(mθ)ᵀ R(nθ) kₙ
        = qₘᵀ R((n − m)θ) kₙ
```

The middle step uses two facts: a rotation transpose is the reverse rotation, `R(φ)ᵀ = R(−φ)`; and `R(−mθ)R(nθ) = R((n−m)θ)`.

Only `n − m` survives. <strong>The two absolute angles cancel, leaving the relative angle</strong>, exactly what is wanted.

### A hand calculation

Take θ=30°, m=1, n=3, and q=k=[1,0]:

```text
q̃ = rotate 30° → [cos30°, sin30°] ≈ [0.8660, 0.5]
k̃ = rotate 90° → [cos90°, sin90°] = [0, 1]
dot = 0.8660×0 + 0.5×1 = 0.5
```

And `cos((3−1)×30°) = cos60° = 0.5`, matching.

Now test the shift: add 5 to both m and n, giving 6 and 8. The distance is still 2 and the dot product is still 0.5. Position affects the result only through relative distance.

Again the caveat: q and k were frozen so only the position term varies. Real models also change the content vectors by position, so two words two steps apart do not always receive the same score.

## 7. Higher dimensions and long distances

High-dimensional RoPE groups coordinates in pairs — `[x₀,x₁]`, `[x₂,x₃]` — rotating each pair at a different frequency. This keeps multiple scales and makes the computation blockwise and cheap.

Usually only Q and K are rotated; V is not, because position only needs to affect *matching*, not the *content being retrieved*.

Page 74 discusses a relative bound at long distances. The point: <strong>a theoretical bound exists, but that does not mean actual attention weights decrease monotonically with distance.</strong> Multiple frequencies, content directions and softmax competition all matter.

## 8. Why almost every current model uses RoPE

Putting the options side by side:

| Method | Where position enters | Extends to longer contexts | Status |
| --- | --- | --- | --- |
| Learnable absolute | added at input | no, limited by table length | early models |
| Sinusoidal | added at input | computable, but unseen positions are unfamiliar | original paper, now rare |
| ALiBi | added to attention scores | linear penalty on distance, fairly flexible | some models |
| RoPE | rotates Q and K | relative position built in; scales with interpolation | mainstream |

Three reasons RoPE won:

1. <strong>Relative position appears automatically</strong>, with no extra bias design.
2. <strong>No added parameters</strong>, just a coordinate transform.
3. <strong>It touches only attention</strong>, leaving layers that do not care about order untouched — exactly the motivation on pages 66–67: position should affect *who attends to whom*, not contaminate every layer's features.

## 9. Check your understanding

<details><summary>Does RoPE add a position vector to the token embedding?</summary><p>No. Classic RoPE rotates queries and keys inside attention so the dot product reflects a relative angle. That differs from adding a position vector at the input.</p></details>
<details><summary>No learnable table means unlimited context, right?</summary><p>No. The formula evaluates any position, but whether the model trained at that length, whether the frequencies suit it, whether memory suffices and whether the task stays reliable are all separate questions.</p></details>
<details><summary>Why rotate Q and K but not V?</summary><p>Position needs to affect how much two positions attend to each other, which the Q–K match decides. V carries the content being retrieved and needs no position offset.</p></details>

Source: PDF pages 51–74 and the matching transcript; RoFormer (2021), ALiBi (2021). Numeric examples and the rotation diagram are teaching additions; formulas on pages 58, 71 and 73 were checked against the slides.
