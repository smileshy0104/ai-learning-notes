---
slug: l2-overview
title: "Lecture 2 overview: from Transformer to LLM"
collection: cme295
lecture: 2
lang: en
description: "Written for a first encounter with large language models: watch one sentence being continued, pick up the minimum background, then enter the six topics."
order: 10
kind: lesson
status: published
tags: [Lecture 2, LLM, Beginner, Learning path]
---

## Who this page is for

If this is your first contact with large language models (LLMs), the usual reaction to the slides is: "I recognise every word and still cannot follow the sentence." That is not your fault. The slides assume background. Across 138 pages they use token, embedding, attention, router, cache and logits without stopping to define them.

This page does three things: it walks one sentence through the whole pipeline, it supplies the four pieces of background you actually need, and it tells you what question to carry into each section and what you can skip on a first pass.

You do not need calculus, linear algebra or model-training experience. Multiplying with pen and paper, and accepting "a list of numbers can be treated as one object", is enough to start.

## The full journey of one sentence

Imagine typing only this, then letting the model continue:

```text
A cute teddy bear is
```

The six steps below are how a large language model answers anything. Each step answers one question: <strong>what form is the data in now?</strong>

1. <strong>Split</strong>: text is cut into tokens. In this teaching example assume every English word is exactly one token, so there are five. Real tokenisers produce subwords; the simplification is deliberate.
2. <strong>Look up numbers</strong>: each token has an ID, and the model fetches a row of numbers from a large table. That row is the embedding. From here on, everything operates on numbers.
3. <strong>Add order</strong>: numbers alone do not say who came first. A position mechanism such as rotary position embedding (RoPE) encodes "which index am I" into those numbers.
4. <strong>Let positions look at each other</strong>: self-attention lets the last position read information from `teddy`, `bear` and the rest; a feed-forward network (FFN) then processes each position. This block repeats over many layers, so deeper representations know more context.
5. <strong>Score</strong>: the last layer projects the result onto one score per vocabulary entry. The score is a logit, and softmax turns scores into probabilities summing to one, for example 0.6 for `reading` and 0.4 for `sleeping`.
6. <strong>Choose and append</strong>: a decoding strategy picks one token, say `reading`. Appending it makes the next input `A cute teddy bear is reading`, and steps 1–6 repeat until an end token appears.

Pick one, append it, pick again: that is autoregressive generation. It is not an exotic design, just the natural consequence of step 6 — the model's input and output are the same kind of token sequence.

| Terms you will meet constantly | In plain words | Where this lecture expands it |
| --- | --- | --- |
| token | the smallest unit the model reads and writes | lecture 1 recap |
| embedding | turning one token into a list of numbers | lecture 1 recap |
| attention | letting one position fetch information from others | position and attention efficiency |
| logit | a raw score before it becomes a probability | decoding |
| softmax | squashing scores into probabilities | decoding |
| parameter | the numbers adjusted during training | scaling laws |

The key split: steps 1–5 are <strong>computed by the model</strong>, step 6 is <strong>selected by a strategy</strong>. The model's 0.6/0.4 distribution does not change when you switch decoding strategy; what changes is which token you take from it. Much beginner confusion — "why does the same question give a different answer?" — lives in step 6.

## Four small tools you need first

Every later section uses these. Each comes with something you can calculate by hand. Understand what it does; you do not need to memorise the formula.

### Tool 1: a vector is just a list of numbers

`[0.2, -0.5, 0.9]` is a three-dimensional vector, that is, three numbers in a row. A token's embedding may have thousands of dimensions; the idea is identical, there are simply more numbers.

Every intermediate result — each token's state at each layer — is such a vector. "Send x through a layer" means "apply a function to this list of numbers".

### Tool 2: the dot product measures similarity

Multiply matching positions, then add, and you have the dot product:

```text
[1, 2, 3] · [0, 1, 0] = 1×0 + 2×1 + 3×0 = 2
```

Attention's match score is a dot product. The more aligned two vectors are, the larger the product, meaning that position offers information closer to what the current position seeks. Position encodings, caches and normalisation all use it.

### Tool 3: softmax turns scores into probabilities

Given scores 2.0 and 1.0, exponentiate each, then divide by the total:

```text
exp(2.0) ≈ 7.389, exp(1.0) ≈ 2.718
total ≈ 10.107
probabilities ≈ [0.731, 0.269]
```

The higher score gets more probability, but the lower one never becomes zero. That is why a model can always "say something else", and why temperature can reshape the output.

### Tool 4: stacked layers and residuals

One layer hands its result to the next. To keep deep networks trainable, each layer also adds its input straight to its output; this shortcut is the residual connection. Normalisation keeps the numbers in a workable range.

So "what layer 12 sees" differs from "what layer 1 sees". That intuition matters later for sliding windows and receptive fields.

## Three questions beginners always ask

Almost everyone asks these once. Reading the answers now makes the corresponding chapters easier.

<details><summary>"Is the model understanding language, or just computing probabilities?"</summary><p>It performs conditional probability prediction: given the preceding tokens, assign probabilities to the next one. Why that produces what looks like understanding is still an open research question. For this lecture, take the operational definition, and do not equate "high probability" with "correct".</p></details>

<details><summary>"Who changes what among parameters, training and inference?"</summary><p>Parameters are the numbers inside the model. Training adjusts them with data; inference uses the frozen model to answer. Everyday chat use is almost always inference: a conversation does not change the parameters. This is also the basis for separating in-context learning, fine-tuning and prompting later.</p></details>

<details><summary>"Why do the formulas look so much harder than the explanation?"</summary><p>A formula is usually one sentence of prose compressed into symbols. The attention score, for instance, is "dot the query with the key, then scale"; every symbol maps to a clause. Each chapter here gives the sentence first and the formula second. On a first pass, read the sentence and skip the matrix.</p></details>

## Six threads and PDF pages

Page numbers are physical PDF pages with the cover as page 1. Consecutive pages are usually one diagram unfolding, so there is no need to grind through each one.

| Content | PDF pages | Question it answers | Reading |
| --- | --- | --- | --- |
| Recap and outline | 1–5 | How does lecture 1 connect to today? | This page |
| Model families | 6–21 | What if you keep only the encoder, or only the decoder? | [BERT and GPT](l2-model-families.html) |
| Scaling laws | 22–34 | How should parameters, data and compute be allocated? | [Scaling laws](l2-scaling.html) |
| Expert routing | 35–50 | Must every computation use every parameter? | [MoE](l2-moe.html) |
| Architecture optimisations | 51–88 | What do position, attention and normalisation each change? | [Position](l2-position.html), [attention and cache](l2-attention-cache.html), [normalisation](l2-normalization.html) |
| Decoding strategies | 89–123 | Given probabilities, how is one token chosen? | [Decoding](l2-decoding.html) |
| Prompting and reasoning | 124–137 | How should context and examples be organised? | [Context, prompting and reasoning](l2-context-reasoning.html) |
| Wrap-up and review | 138 | How do the parts fit together again? | [Review](l2-review.html) |

## How to read it the first time

Follow the table's order, but <strong>the first pass is not about calculating everything — it is about knowing which problem each section solves</strong>:

- Model families: cover the sentence ending to feel continuation, then mask a middle word to feel filling a blank. Build the "what can be seen" intuition before memorising BERT and GPT.
- Scaling and MoE: being able to say "at fixed compute a bigger model reads fewer tokens" and "one token may pass through only some experts" is enough. Leave the arithmetic for a second pass.
- Position and attention: look at the rotation diagram, then hold on to three actions — limiting visible positions, reusing old keys and values, sharing keys and values across query heads.
- Normalisation: just follow `x` along the residual path; leave formulas and hand calculations for later.
- Decoding and prompting: keep asking whether a change alters the text the model sees, or the rule for choosing among candidates.

If a paragraph leaves you unsure what problem it solves, jump to that section's check-your-understanding question, see what it tests, then reread. That usually beats grinding through formulas.

## What you can do afterwards

- Explain which step of a generation is computed by the model and which is selected by a strategy.
- Describe how the three architecture families (encoder-only, decoder-only, encoder–decoder) differ in what they can see.
- Separate parameter count, training tokens and compute, and explain why they trade off.
- Explain why "total parameters" and "parameters activated per token" differ in MoE.
- Explain why RoPE lets attention sense relative position.
- Explain why GQA saves cache, and exactly what is saved.
- Distinguish "syntactically valid" from "arithmetically correct" from "retrieved the right fact".

Feeling that these are still abstract is normal: they become familiar across several lectures. The goal here is to recognise them and know what each part is responsible for, not to memorise them in one sitting.
