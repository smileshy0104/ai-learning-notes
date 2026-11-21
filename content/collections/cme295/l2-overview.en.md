---
slug: l2-overview
title: "Lecture 2 overview: from Transformer to LLM"
collection: cme295
lecture: 2
lang: en
description: "Recap lecture 1, then build the full route through model families, scaling, MoE, architecture optimisations, decoding and prompting."
order: 10
kind: lesson
status: published
tags: [Lecture 2, LLM, Learning path]
---

## What does this lecture actually answer?

Lecture 1 explained how the original Transformer translates. Lecture 2 asks: **how do you turn that architecture into a large language model that scales, generates text and can actually be deployed?**

Split the question into three layers: how the network is designed; how training resources are allocated; how tokens are selected at output time. Between the model’s probabilities and the final text there is a whole set of decoding strategies.

## Lecture 1 in one sentence

Text is split into tokens, which are looked up and turned into vectors. Attention lets positions exchange information, the FFN processes features position by position, and residuals plus normalisation make deep training work. The original translation model has an encoder and a decoder.

```text
文字 → token ID → embedding + 位置
     → 注意力 + FFN + 残差/归一化（重复多层）
     → 上下文表示 → 词表分数 → 概率
```

If “why are scores not probabilities yet” or “how is a gradient different from a parameter update” is still unclear, read [lecture 1’s basic toolbox](basics.html) first.

## Six threads and PDF pages

Page numbers are physical PDF pages, with the cover as page 1. Consecutive pages are often one diagram unfolding.

| Content | PDF pages | Question it answers | Reading |
| --- | --- | --- | --- |
| Recap and outline | 1–5 | How does lecture 1 connect to today? | This page |
| Transformer model families | 6–21 | What happens if you keep only the encoder or only the decoder? | [BERT and GPT](l2-model-families.html) |
| Scaling laws | 22–34 | How should parameters, data and compute be balanced? | [Scaling laws](l2-scaling.html) |
| Expert routing | 35–50 | Must every parameter run for every computation? | [MoE](l2-moe.html) |
| Architecture optimisations | 51–88 | How do position, attention and normalisation improve? | [Position](l2-position.html), [attention and cache](l2-attention-cache.html), [normalisation](l2-normalization.html) |
| Decoding strategies | 89–123 | Given probabilities, how is a token chosen? | [Decoding](l2-decoding.html) |
| Prompting and reasoning | 124–137 | How should context and examples be organised? | [Context, prompting and reasoning](l2-context-reasoning.html) |
| Wrap-up and review | 138 | Can the concepts be reconnected? | [Review](l2-review.html) |

## One example runs through the lecture

Still the sentence “A cute teddy bear is reading.”:

- BERT: mask cute and predict it from both sides; or use the whole-sentence representation to classify sentiment.
- GPT: given “A cute teddy bear is”, assign probabilities to the next token.
- MoE: each token enters a different small set of FFN experts in one layer.
- RoPE: make query–key matching carry relative position.
- KV Cache: reuse previous keys and values when generating the next word.
- Decoding: choose among candidates such as reading and sleeping using temperature and a sampling rule.
- Prompting: make output follow a required format and use stated facts, rather than blindly filling the context.

These examples show what each component is responsible for. They do not claim a real model routes a token to a “grammar expert” or a “maths expert” in any human sense.

## Reading notes

The material is organised from the lecture 2 slides and transcript, with teaching additions. Leaderboards and product specifications are as of the slide date; terminology corrections are in the [review](l2-review.html).

## What should you be able to do afterwards?

Explain the attention range of the three architecture families; compute a top-k routing or a temperature softmax; separate total from activated parameters and FLOPs from FLOP/s; explain why GQA saves KV cache; and understand that format constraints and factual correctness are different guarantees.
