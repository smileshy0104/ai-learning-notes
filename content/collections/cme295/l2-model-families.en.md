---
slug: l2-model-families
title: "Model families: BERT, GPT and three architectures"
collection: cme295
lecture: 2
lang: en
description: "Start from what encoders and decoders are for, then use MLM, NSP and next-token prediction to see how their training differs."
order: 20
kind: lesson
status: published
tags: [BERT, GPT, MLM, NSP, Pretraining]
---

## 1. Why start with architecture families?

Pages 6–21 of the PDF. The original Transformer targets “source sentence → translation”. If you only want classification, do you still need a generator? If you want free continuation, do you still need a separate encoder? Those two questions lead to encoder-only and decoder-only.

| Family | Information range per input position | Output form | Examples |
| --- | --- | --- | --- |
| Encoder-only | Usually reads the valid input bidirectionally | Context vectors into a task head | BERT |
| Decoder-only | Standard causal mask: a position reads itself and earlier | Predicts later tokens | GPT-like |
| Encoder–Decoder | Encoder bidirectional; decoder causal and reads the encoder | Target sequence generated step by step | Original Transformer, T5 |

These are not an absolute ranking of “understanding versus generation”. Generative models can classify too; standard BERT’s training and interface do not use GPT-style token-by-token generation, but that does not prove no encoder-only structure can ever generate.

## 2. BERT: learn contextual representations first, adapt later

BERT = Bidirectional Encoder Representations from Transformers, introduced in the 2018 paper.

**Definition**: use the Transformer encoder so a position sees text on both sides and obtains a contextual representation. `[CLS]` is often prepended and `[SEP]` marks segment boundaries.

**Why it matters**: “bank” needs a different representation in a river context and a finance context. A fixed word-vector table cannot tell the current meaning; the encoder updates representations using the whole context.

<div class="flow"><span class="chip">[CLS] this bear is cute [SEP]</span><span class="arrow">→ encoder →</span><span class="chip">contextual vector per position</span><span class="arrow">→ [CLS] into a classifier →</span><span class="chip">positive / negative</span></div>

`[CLS]` is not a magic symbol that already holds an accurate summary; its role comes from training and from the downstream task design. Sequence labelling can use each token’s vector instead of squeezing everything into `[CLS]`.

## 3. MLM: mask part of the input, then predict the original words

MLM = Masked Language Modeling. It is a pretraining proxy task: the goal is not the final sentiment label but learning language statistics and context by restoring corrupted words.

```text
original: [CLS] A cute teddy bear is reading [SEP]
input:    [CLS] A [MASK] teddy bear is [MASK] [SEP]
target:              cute                   reading
```

Loss is computed only at positions selected for MLM. For example with probability 0.6 for cute and 0.5 for reading:

```text
L = [−ln(0.6) − ln(0.5)] / 2 ≈ 0.602
```

**Detail from the original paper**: classic BERT selects about 15% of tokens as prediction positions; among them about 80% become `[MASK]`, 10% become a random token and 10% stay unchanged. Not every selected position shows `[MASK]`; that mixture reduces the mismatch between training and real input. The slides only summarise the corrupt-and-restore process.

## 4. NSP: were the two sentences adjacent?

NSP = Next Sentence Prediction. Classic BERT takes sentence pairs and uses the `[CLS]` representation to predict whether the second sentence follows the first in the document.

| Input pair | Target (teaching construction) |
| --- | --- |
| A: I took out a book. B: Then I started reading. | adjacent |
| A: I took out a book. B: Mars is a planet in the Solar System. | random pairing |

Note that the “adjacent” label comes from how the data was built, not from judging whether two sentences read smoothly. It also does not predict every token of the second sentence. Later BERT variants may drop NSP, so it is not a required component of every encoder.

## 5. What do pretraining and fine-tuning each change?

- Pretraining: build reusable representations from large text, with supervision constructed from the text itself.
- Fine-tuning: train the output head on task data, and usually update all or some encoder parameters.
- Feature extraction: alternatively freeze the encoder and train only the task layer; this is a supplementary usage.

Example: pretraining has already learned regularities in text; then labelled reviews (“positive/negative”) teach which representations map to which class. Pretraining cost and fine-tuning cost differ, and nothing guarantees that every task needs only a handful of examples.

## 6. GPT: write the task as next-token prediction

GPT = Generative Pre-trained Transformer. The modern standard decoder-only backbone has no separate encoder, and removes the encoder–decoder cross-attention of the original decoder.

```text
input:  [BOS] A cute teddy bear is
predict: probability of reading / sleeping / ...
after picking reading, append it and predict the next token
```

Training usually shifts the target by one position:

| Input position | Predicted target |
| --- | --- |
| [BOS] | A |
| A | cute |
| cute | teddy |
| … | … |

The sequence probability factorises by the chain rule:

```text
P(x₁,…,xₙ) = ∏ₜ P(xₜ | x₁,…,xₜ₋₁)
```

Write classification as generation: `判断情感：这只熊真可爱。情感是：` → output “正面”. **Not retraining for every new task** is a usage advantage; it does not mean every historical GPT version needed no fine-tuning, nor that an instruction-untrained base model reliably follows any request.

## 7. Why do the two generating families still differ?

Encoder–Decoder encodes the input completely, then generates output with a separate causal stack; decoder-only places prompt and output in one sequence. With standard causal attention, earlier prompt positions cannot see later prompt tokens, but generating positions can read the whole prompt provided so far.

Architecture choice also depends on task, data and deployment; the popularity of decoder-only does not mean the other families disappeared.

## Check your understanding

<details><summary>How does MLM differ from causal next-token prediction?</summary><p>MLM restores selected positions from a corrupted input, usually using both sides of context; a causal language model predicts later tokens from left context. The differences include visibility, how the input is constructed and where the loss is computed.</p></details>
<details><summary>If you remove the encoder, what happens to cross-attention?</summary><p>Standard decoder-only also drops the cross-attention that reads encoder outputs. It keeps causal self-attention, the FFN and the related residual and normalisation components; it does not set a missing encoder output to zero.</p></details>

Source: PDF pages 6–21 and 29–34 with the matching transcript; the 15% / 80-10-10 split is background from the original paper, and the loss figure is a teaching example.
