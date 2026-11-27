---
slug: l2-model-families
title: "Model families: BERT, GPT and three architectures"
collection: cme295
lecture: 2
lang: en
description: "Start from what one position can see, use one sentence for a fill-in and a continuation task, then work through MLM, NSP, pretraining and fine-tuning."
order: 20
kind: lesson
status: published
tags: [BERT, GPT, MLM, NSP, Pretraining, Beginner]
---

## 1. Drop the name-memorising

Many beginners meet BERT and GPT and immediately try to memorise names and years. This section asks only one question:

<strong>If you delete part of the Transformer, what can the remainder still do?</strong>

Recall lecture 1: the original Transformer was built for translation, with an encoder reading the source sentence and a decoder writing the translation. Page 6 puts those two roles back on the table, then asks: if I only need to *read* a sentence, do I still need the half that writes? If I only need to *continue writing*, do I still need a dedicated reading half?

Two questions, two deletions — and the answers are BERT and GPT.

## 2. What encoders and decoders actually do

In one line each:

- An <strong>encoder</strong> turns the input into representations: every position may look at every other, and each ends up with a vector that has absorbed the whole sentence.
- A <strong>decoder</strong> writes one step at a time: position t may see itself and everything already written before it, and uses that to predict position t+1.

The difference is not parameter count but <strong>which positions a given position is allowed to see</strong>. That permitted set is implemented by an attention mask.

| Family | What one position can see | Typical output | Example |
| --- | --- | --- | --- |
| Encoder-only | left and right (bidirectional) | a contextual vector per position, feeding a task head | BERT |
| Decoder-only | itself and the left (causal) | probability of the next token | GPT-like |
| Encoder–decoder | encoder bidirectional; decoder causal, and reads the encoder output | a target sequence generated step by step | original Transformer, T5 |

Note the last two columns. They are not a ranking of intelligence: generative models can classify, and standard BERT can be adapted to generate. What really differs is the training objective, the visible range and the interface.

## 3. One sentence, two questions

Write this on paper:

```text
A cute teddy bear is reading
```

### Question one: fill in the blank

Cover a middle word:

```text
A [MASK] teddy bear is reading
```

Filling `cute` uses the `A` on the left and also `teddy` and `bear` on the right. BERT trains exactly like this: corrupt some positions and let the model restore them from both sides. That is what <strong>bidirectional</strong> means here.

### Question two: continue the sentence

Keep only the prefix:

```text
A cute teddy bear is
```

Now guess the next word. When training GPT, even though `reading` appears in the original text, the model must not see it — otherwise it copies the answer. This "left side only" rule is the <strong>causal mask</strong>.

Here is what the mask looks like for four positions `[BOS] A cute teddy`. Rows are who is looking, columns who is visible, ✓ means allowed:

| Query position | BOS | A | cute | teddy |
| --- | --- | --- | --- | --- |
| BOS | ✓ | ✗ | ✗ | ✗ |
| A | ✓ | ✓ | ✗ | ✗ |
| cute | ✓ | ✓ | ✓ | ✗ |
| teddy | ✓ | ✓ | ✓ | ✓ |

That lower-triangular shape is the core constraint of decoder-only models. It lets training compute every position's prediction in parallel while guaranteeing that no position draws information from the future.

## 4. BERT: understand language first, adapt later

BERT = Bidirectional Encoder Representations from Transformers, from the 2018 paper, introduced on pages 7–12.

It keeps the encoder, drops the decoder, and every position reads both directions. To give the sentence one position usable for classification, a special `[CLS]` is prepended, and `[SEP]` separates segments.

<strong>Why bidirectional?</strong> Take "bank": in "river bank" it is a riverbank, in "bank account" it is a financial institution. Looking only left leaves much ambiguity; bidirectional encoding lets every position absorb the full context.

A classification pipeline:

```text
[CLS] this bear is cute [SEP]
   → encoder (bidirectional attention)
   → one contextual vector per position
   → take the [CLS] vector into a classifier
   → positive / negative
```

`[CLS]` has nothing magical about it. It can stand for the sentence because training forces its vector to predict something (whether the next sentence follows, for instance), which in turn forces it to aggregate sentence information. Sequence-labelling tasks need not use `[CLS]`; they use each position's vector directly.

## 5. How BERT is trained: two proxy tasks

Training happens in two stages. The first is pretraining: huge amounts of unlabelled text plus "proxy tasks" that teach language regularities. The second is fine-tuning: a small labelled dataset adapts the model to a concrete task.

A proxy task is not the real goal; it is a stand-in that forces the model to learn useful representations.

### Proxy task one: masked language modelling (MLM)

Pick some positions at random, corrupt them, and ask the model to restore the originals.

```text
original: [CLS] A cute teddy bear is reading [SEP]
input:    [CLS] A [MASK] teddy bear is [MASK] [SEP]
target:             cute                   reading
```

Loss is computed only at the corrupted positions. With probability 0.6 for `cute` and 0.5 for `reading`:

```text
L = [−ln(0.6) − ln(0.5)] / 2
  ≈ [0.5108 + 0.6931] / 2
  ≈ 0.602
```

A smaller loss means the model assigns more probability to the right token. The value has no absolute meaning; it exists to give training something to optimise.

Details from the original paper that the slides only summarise: about 15% of positions are selected for prediction; of those, roughly 80% become `[MASK]`, 10% become a random token and 10% stay unchanged. Why not use `[MASK]` everywhere? Because real usage never contains `[MASK]`, and using it exclusively would open a gap between training and inference.

### Proxy task two: next sentence prediction (NSP)

Give the model two sentences and ask whether the second immediately follows the first in the document.

| Input pair | Target |
| --- | --- |
| A: I took out a book. B: Then I started reading. | adjacent |
| A: I took out a book. B: Mars is a planet. | random pairing |

The aim is document-level coherence, not sentence-internal fluency. The label comes from how the data was built, not from a judgement about whether the pair reads smoothly. Many later BERT variants drop NSP, so it is not a required component of encoders.

## 6. What pretraining and fine-tuning each change

| Stage | Data | What changes | Cost |
| --- | --- | --- | --- |
| Pretraining | huge unlabelled text | nearly all parameters | high, usually done once |
| Fine-tuning | task data (say, labelled reviews) | the output head, often encoder parameters too | much lower, once per task |
| Feature extraction | task data | only the output head; the encoder is frozen | lowest, but the representations may not fit the task |

One common misreading: "fine-tuning usually needs little data" is relative to pretraining. It does not mean a few hundred examples are always enough. Data quality, task difficulty and distance from the pretraining distribution all matter.

## 7. GPT: write every task as guessing the next token

GPT = Generative Pre-trained Transformer, also 2018, introduced on pages 13–21.

It keeps only the decoder and also removes the cross-attention that used to read the encoder, leaving a clean backbone: causal self-attention plus feed-forward layers, stacked.

Training is plain next-token prediction, with targets shifted by one:

| Input position | Predicted target |
| --- | --- |
| [BOS] | A |
| A | cute |
| cute | teddy |
| teddy | bear |
| bear | is |
| is | reading |

The whole-sequence probability follows the chain rule:

```text
P(A, cute, teddy, bear, is, reading)
= P(A|[BOS]) × P(cute|A) × … × P(reading|A cute teddy bear is)
```

The great benefit: one model can do everything, because classification can be written as generation.

```text
Classify sentiment: this bear is cute. The sentiment is:
→ model continues: positive
```

An important boundary: <strong>"no retraining per task" is a convenience, not proof that every GPT model follows instructions out of the box.</strong> Early base models needed prompt engineering or fine-tuning to be reliable; the prompting section returns to this.

## 8. If both can write, why did decoder-only win

Both families generate text; the difference is how input is handled:

| Question | Encoder–decoder | Decoder-only |
| --- | --- | --- |
| How does input enter | encoded into vectors, then read by cross-attention | concatenated with the output in one sequence |
| Attention inside the input | bidirectional, any two positions see each other | causal, only self and left |
| Separate processing for input | yes | no, everything treated alike |
| Suited to | tasks with a clear input/output split, e.g. translation | open-ended generation, chat, one text interface |
| Main cost | more structure, an extra encoding pass | the prompt is itself causally constrained; long prompts cost more |

The lecture's conclusion: both paradigms were tried, and most people ended up with decoder-only — not because it is more accurate on every task, but because it is simpler. There is no separate path for input; any task is "give some text and keep writing".

## 9. You should now be able to answer

<details><summary>If the encoder is gone, what happens to cross-attention?</summary><p>Standard decoder-only removes it entirely, keeping causal self-attention and the feed-forward layers. It does not set encoder outputs to zero; that input path simply does not exist.</p></details>
<details><summary>What is the deepest difference between MLM and next-token prediction?</summary><p>What the predicting position may see. MLM positions see both sides; causal language-model positions see only the left. Input construction and where the loss is computed follow from that.</p></details>
<details><summary>Why does BERT need [CLS]?</summary><p>To give sentence-level tasks one fixed aggregation position. Its ability to aggregate comes from training, not from the symbol itself.</p></details>

## 10. Commonly confused points

- <strong>BERT is not "classification only"</strong>: it emits a contextual vector per position, usable for many tasks.
- <strong>GPT is not "generation only"</strong>: classification can be phrased as generation.
- <strong>NSP is not mandatory</strong>: it is one training objective of classic BERT.
- <strong>decoder-only popularity does not erase other families</strong>: T5 and encoder-based retrieval models remain widely used.
- <strong>`[MASK]` appears only in training</strong>: inference never contains it, an inherent gap in MLM.

Source: PDF pages 6–21 and the matching transcript. The 15% and 80/10/10 figures are background from the original paper; the loss value, causal-mask table and sentiment example are teaching constructions.
