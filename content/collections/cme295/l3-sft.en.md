---
slug: l3-sft
title: "SFT: teaching the model how to answer, and where the loss lands"
collection: cme295
lecture: 3
lang: en
description: "Clarify how SFT relates to instruction tuning, compare it with pretraining through the answer loss mask, and explain why ignoring the prompt loss still learns to use the prompt."
order: 40
kind: lesson
status: published
tags: [SFT, Instruction tuning, Loss mask]
---

## 1. What is SFT?

SFT = Supervised Fine-Tuning, PDF pages 41–52.

**Definition:** show the model “what the input is and what output is expected”, then update weights through supervised training so behaviour matches the goal better. Using instruction-and-answer data for SFT is often called instruction tuning.

**Why it is needed:** pretraining is good at continuing a text distribution, but users usually want a direct answer to a request rather than another article on an adjacent topic.

Example: given “explain gradient in one sentence”, the target is a concise explanation — not more encyclopedia paragraphs that merely contain the word “gradient”.

## 2. What SFT shares with pretraining, and what differs

It still usually uses teacher forcing and next-token cross-entropy. What differs is the conditioning and where the score is taken:

```text
L_SFT = −(1/T_answer) Σₜ ln Pθ(yₜ | x, y_<t)
x: the full prompt; y: the expected answer
```

Usually the prompt and answer are concatenated and fed together, **with the loss taken on the answer positions**. The slides discuss response-only loss here; other recipes may also score different roles or parts of the prompt, and each must state its convention.

## 3. One continuous teaching example

Conceptually split the prompt into “explain / bear / ’s age” and the answer into “5 / years / [EOS]”. To focus on where the loss lands, the conditional probabilities of the true targets are given directly:

| Target token | Probability | Prompt or answer |
| --- | --- | --- |
| explain | 0.10 | prompt |
| bear | 0.20 | prompt |
| ’s age | 0.25 | prompt |
| 5 | 0.50 | answer |
| years | 0.80 | answer |
| [EOS] | 0.90 | answer |

This is a hand-made split and set of probabilities, not real tokenizer output; the targets come from different prediction positions, so the column need not sum to 1.

<!-- lab:l3-loss-mask -->

Answer-only: `[−ln0.5−ln0.8−ln0.9]/3≈0.3406`. If all six positions count, it is about 1.0533. **The two losses average over different target sets and denominators, so a smaller number does not mean a stronger model.**

## 4. Two masks that must not be confused

| mask | What it restricts | Can the prompt still be read? |
| --- | --- | --- |
| causal attention mask | each position cannot see the future | the answer can read the prompt already given |
| loss mask | which target terms enter the loss | does not change what attention can see |

Setting the prompt’s loss mask to 0 does not delete the prompt and does not block gradients along the prompt path. Answer predictions depend on the prompt’s representation, so backpropagation can still update the shared parameters that process it.

**Nor does the optimiser update only the rows that emit the answer.** With full-parameter SFT every trainable weight involved in the computation may receive a gradient; with LoRA only the designated incremental parameters are trainable.

## 5. What makes high-quality SFT data?

The slides list human conversations, synthetic instructions, maths/code and safety alignment. Volume ranges from a small number of samples to very large instruction sets; more is not automatically better.

Check: answer correctness, factual grounding, style consistency, task coverage, prompt distribution, isolation of training from validation, and balance between refusals and answerable tasks.

If most samples start with “cannot”, the model may learn to over-refuse. If every demonstration is a very long explanation, tasks needing short output may suffer. Look at the data first when behaviour is wrong; do not assume another training stage will fix it.

## 6. SFT versus prompt engineering and RAG

- Changing the system prompt: weights unchanged, the current condition changes.
- RAG: retrieved material is placed in context, weights usually unchanged.
- SFT: updates weights or adapters, changing the model’s tendency for input–output patterns.
- Mid-training: leans towards continuing to learn a target domain or longer sequences; the name and boundaries depend on the recipe.

Which method a task needs depends on evaluation, cost and maintenance; not every application has to be fine-tuned.

## Check your understanding

<details><summary>If prompt tokens do not count in the loss, does that mean their embeddings never update?</summary><p>No. Answer positions can depend on the prompt representation through attention, and gradients may flow back along that path. Any trainable parameter involved can update.</p></details>
<details><summary>Why is ranking full-text CE against answer CE unreasonable?</summary><p>They average over different target terms and denominators, and the prompt itself may be harder or easier. Comparing models requires a fixed scoring set and data.</p></details>

Source: PDF pages 42–52 and the related Q&amp;A; the formula on page 46 was visually checked. The loss-mask experiment is a teaching construction.
