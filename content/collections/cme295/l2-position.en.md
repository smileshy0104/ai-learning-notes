---
slug: l2-position
title: "Position: sinusoidal encodings, ALiBi and RoPE"
collection: cme295
lecture: 2
lang: en
description: "From absolute position vectors to relative position inside attention, deriving the rotation-matrix and dot-product relationship."
order: 50
kind: lesson
status: published
tags: [RoPE, ALiBi, Positional encoding, Rotation matrix]
---

## 1. Why position cannot be omitted

Pages 51–74 of the PDF. Plain fully-connected self-attention has no explicit ordering label on its input. Swap the input order and the result swaps accordingly; the network does not automatically know “who is first”. This is permutation equivariance.

“The bear holds the child” and “the child holds the bear” need different relational representations. So the network needs position information. The causal mask itself also limits visibility; the mechanisms below are explicit position modelling.

## 2. Learnable absolute positions

Each position index maps to a learnable vector: `input xₘ = token_embedding + position_embedding(m)`.

Example: the same word at position 0 and at position 20 looks up the same token embedding, but after adding different position vectors the representation entering the network differs.

The price is a fixed table range. If training only defined positions 0–511, row 1000 cannot be looked up. Extending the table, interpolating or continuing training are engineering options — it is not that the length can never change.

## 3. Sinusoidal encodings: pointers that tick at different rates

Pages 55–65 use a clock analogy: high-frequency components change quickly, low-frequency ones slowly.

```text
ωᵢ = 10000^(−2i/d)
PE(m,2i) = sin(mωᵢ)
PE(m,2i+1) = cos(mωᵢ)
```

m is the position, i the index of the 2-dimensional block, d an even dimension. With d=4 the two frequency groups are 1 and 0.01.

| m | PE(m) (approximate) |
| --- | --- |
| 0 | [0, 1, 0, 1] |
| 1 | [0.8415, 0.5403, 0.0100, 1.0000] |
| 2 | [0.9093, −0.4161, 0.0200, 0.9998] |

### Why does the dot product involve relative distance?

Using `sin a sin b + cos a cos b = cos(a−b)`:

```text
PE(m) · PE(n) = Σᵢ cos((m−n)ωᵢ)
```

Comparing position encodings on their own, the dot product is a function of the relative offset. **This does not mean the attention score after arbitrary projections of token+position is determined by distance alone**; token content and cross terms still matter.

A useful intuition: with d=4, PE(0)·PE(1)≈1.5403, and so is PE(10)·PE(11). Shifting both positions leaves the dot product of that pair unchanged.

“Farther apart is always less similar” is too strong — cosine is periodic and can bounce back. The formula can be evaluated for any new position, but that does not guarantee reliable extrapolation to arbitrarily long text.

## 4. Putting position into the attention score

The additive encoding above flows through the whole network. Another idea modifies the matching score inside attention directly:

```text
score(m,n) = qₘ·kₙ / √dₖ + b(m,n)
```

| Mechanism | How position enters | Key difference |
| --- | --- | --- |
| T5 relative position bias | Learns a bias per head and per relative-distance bucket | It does not learn one term per arbitrary distance |
| ALiBi | Adds a linear distance penalty to causal past positions | Slopes are designed per head; no trained absolute table |
| RoPE | Rotates Q/K by position, then takes the dot product | Position becomes a relative rotation |

ALiBi’s causal teaching form: `b(m,n)=−sₕ(m−n)` with n≤m, sₕ>0. With slope 0.5, the bias for the current position and the 3 previous ones is 0, −0.5, −1, −1.5. Content scores can still overcome the distance penalty.

## 5. RoPE: understand the 2-D rotation first

RoPE = Rotary Position Embeddings. The subtitle’s “rope” was translated literally instead of being kept as a name.

```text
R(φ) = [[cosφ, −sinφ],
        [sinφ,  cosφ]]
R(φ) [x,y]ᵀ = [x cosφ−y sinφ, x sinφ+y cosφ]ᵀ
```

**Example**: rotating the vector [1,0] by 90° gives [0,1]; its length is still 1. Real position angles are usually in radians; degrees are used here only to make the geometry easier to read.

<svg viewBox="0 0 520 220" role="img" aria-label="2-D vector rotation: the original vector points right; after a 90-degree rotation it points up" style="width:100%;max-width:520px"><defs><marker id="rope-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#326947"/></marker></defs><g stroke="#a4b6a3"><path d="M80 175H435M110 195V20"/></g><g stroke="#326947" stroke-width="3" marker-end="url(#rope-arrow)"><path d="M110 175H280"/><path d="M110 175V55"/></g><path d="M180 175A70 70 0 0 0 110 105" fill="none" stroke="#b98836" stroke-dasharray="5 3"/><g fill="#24382d" font-size="15"><text x="290" y="180">[1,0], original</text><text x="125" y="55">[0,1], rotated</text><text x="170" y="115">90°</text></g></svg>

## 6. Why do two rotations leave only the relative position?

The convention below uses **column vectors**; the slide diagram may write row vectors, which is a transpose of the same argument:

```text
q̃ₘ = R(mθ) qₘ
k̃ₙ = R(nθ) kₙ
q̃ₘᵀ k̃ₙ = qₘᵀ R(mθ)ᵀ R(nθ) kₙ
          = qₘᵀ R((n−m)θ) kₙ
```

Because transposing a rotation rotates backwards, the two absolute angles cancel and only the relative angle remains.

**Hand calculation**: θ=30°, m=1, n=3, q=k=[1,0].

```text
q̃=[cos30°,sin30°]≈[0.8660,0.5]
k̃=[cos90°,sin90°]≈[0,1]
dot product≈0.5=cos60°
adding 5 to both m and n leaves the dot product≈0.5
```

Here q and k are frozen so only the position terms are visible. Real content vectors differ by position, so it does not follow that every pair two positions apart scores identically.

## 7. The high-dimensional version and long-distance limits

High-dimensional RoPE splits even-dimensional vectors into 2-D blocks, each rotated at a different frequency, e.g. [x₀,x₁], [x₂,x₃]. Usually Q and K are rotated; V is not rotated the same way.

Slide 74 discusses a relative upper bound on long-term decay. Do not misread it as “actual attention weights for every head and every pair decrease monotonically with distance”. Multiple frequencies, content direction and softmax competition all matter.

## Check your understanding

<details><summary>Does RoPE add another vector to the token embedding?</summary><p>Classic RoPE rotates queries and keys by position so the matching carries a relative offset; that differs from adding a position vector at the network entrance.</p></details>
<details><summary>Without a learnable position table, can the context grow indefinitely?</summary><p>No. The formula being evaluable and the model extrapolating reliably are different things; training length, frequency settings, inference memory and task performance all constrain it.</p></details>

Source: PDF pages 52–74; formulas on pages 58, 71 and 73 were visually checked. The numeric and ALiBi mini-examples are teaching additions.
