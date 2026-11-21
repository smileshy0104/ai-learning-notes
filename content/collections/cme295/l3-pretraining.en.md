---
slug: l3-pretraining
title: "Pretraining: teacher forcing, cross-entropy and BPB"
collection: cme295
lecture: 3
lang: en
description: "Derive mean next-token loss from sequence likelihood, explain parallel training through the shifted input–target pair, and convert to bits per byte."
order: 20
kind: lesson
status: published
tags: [Pretraining, Teacher forcing, Cross-entropy, BPB]
---

## 1. What does pretraining actually learn?

PDF pages 8–22. Pretraining builds a reusable language model from large amounts of text and code, instead of training a fresh set of parameters for every task.

**Next-token prediction** asks the model to give the true next token a high probability given the existing prefix. Grammar, common sense and code patterns may be picked up while doing this, but that is not the same as the model acquiring a knowledge base guaranteed to be true and complete.

## 2. What is teacher forcing?

**Definition:** during training, use the real previous token from the data as the input for the next prediction. Even if the model just predicted something wrong, that wrong prediction is not fed back.

```text
原始数据：[BOS] A teddy bear [EOS]
网络输入：[BOS] A teddy bear
训练目标：  A  teddy bear [EOS]
```

For example, after A the model may prefer cute, but the training text says teddy. Later positions still receive the real teddy, teaching the model to predict bear from that true prefix.

<div class="flow"><span class="chip">true prefix</span><span class="arrow">→ forward pass with frozen parameters →</span><span class="chip">vocabulary probabilities per position</span><span class="arrow">→ compare with the next token →</span><span class="chip">loss, backward, update</span></div>

“Forcing” does not mean skipping learning or writing the correct answer into the weights. The model still computes gradients from the loss.

## 3. The whole sentence is fed in — why no peeking?

The causal mask ensures position t can only read positions ≤t, and that representation is then used to predict position t+1. So the whole training sequence can be fed at once and several positions scored in parallel.

| Current input position | May read | Predicted target |
| --- | --- | --- |
| [BOS] | [BOS] | A |
| A | [BOS], A | teddy |
| teddy | [BOS], A, teddy | bear |
| bear | [BOS], A, teddy, bear | [EOS] |

**Training vs inference:** inference feeds the model’s own choice back as input; training mostly uses true prefixes. This distribution gap is often discussed as exposure bias. Training that samples from the model can reduce some mismatches, but it does not automatically remove every error.

## 4. Where does cross-entropy come from?

Let the sequence be x₁,…,x_T and the parameters θ.

```text
sequence probability: Pθ(x₁,…,x_T)=∏ₜ Pθ(xₜ | x_<t)
maximise probability ↔ maximise Σₜ ln Pθ(xₜ | x_<t)
training minimises: L_CE=−(1/T) Σₜ ln Pθ(xₜ | x_<t)
```

The logarithm turns a product into a sum, avoiding underflow from multiplying many small probabilities; the minus sign switches maximising into minimising; dividing by the number of active tokens controls the scale.

Real implementations use a stable log-softmax or an equivalent, not an actual product of the whole sentence that might underflow before taking the log.

### One sequence by hand

Suppose the conditional probabilities of four true target tokens are `[0.5,0.25,0.8,0.5]`:

```text
sequence probability = 0.5×0.25×0.8×0.5 = 0.05
total negative log-likelihood = −ln(0.05) ≈ 2.9957 nats
mean loss = 2.9957/4 ≈ 0.7489 nats/token
```

These numbers are target terms under different prefixes; they are not required to sum to 1. Only each position’s full vocabulary distribution is normalised.

## 5. Bits per byte: a different denominator for comparison

Different tokenizers split the same text into different numbers of tokens, so comparing nats/token directly is misleading.

```text
BPB = L_CE × T / B / ln(2)
T: number of scored tokens; B: bytes of the corresponding original text
```

If the example above covers 10 bytes: `BPB≈0.7489×4/10/ln2≈0.4322 bits/byte`.

If another tokenizer represents the same text with 2 tokens and the total negative log-likelihood happens to be the same 2.9957, its mean token loss is 1.4979, yet its BPB is still about 0.4322. The total likelihood was deliberately held fixed to isolate the effect of normalisation.

**Boundary:** BPB unifies the unit of measure; it does not automatically make model distributions, corpus preprocessing, UTF-8 byte conventions or evaluation boundaries identical. Nor is it a direct measurement of how many storage bits each token actually occupies.

## 6. Which positions are scored?

Padding positions are usually excluded from the objective, and the mean is taken over the valid scored count. Whether document boundaries, BOS/EOS and cross-document attention are isolated depends on the training setup.

The next section discusses how corpora are concatenated or packed; SFT further defines the loss mask over the answer span, covered in [SFT](l3-sft.html).

## Check your understanding

<details><summary>If the whole sentence is in the training input, can every position see the future?</summary><p>No. The causal mask restricts what each position may read, and the target is built by shifting one position. What runs in parallel is the computation at different positions, not the removal of the causal condition.</p></details>
<details><summary>Why does a lower CE/token for model A not mean it compresses the same text better?</summary><p>Different tokenizer granularity changes the denominator. Fix the data and the scoring convention, then compare total negative log-likelihood or a byte-normalised metric.</p></details>

Source: PDF pages 8–22; the formulas on pages 21 and 22 were visually checked. The probability, byte and tokenizer comparisons are teaching constructions, not measurements of a real model.
