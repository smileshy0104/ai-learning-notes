---
slug: l2-context-reasoning
title: "Context, prompting and reasoning: what to give, and how"
collection: cme295
lecture: 2
lang: en
description: "Separate the context window from the output budget, and use one bear-age example to understand zero-shot, few-shot, CoT and self-consistency."
order: 90
kind: lesson
status: published
tags: [Context, ICL, Few-shot, CoT, Self-consistency]
---

## 1. Context is more than the sentence you typed

Pages 124–137 of the PDF. After every prediction the newly generated token is appended to the sequence and used for the next prediction. So the usable context usually contains: system instructions, message history, the user’s question, tool results, and what has already been generated.

The **context window** is the length limit the service or model accepts; the **maximum output** is the generation cap set by this request or the product. Specific APIs may count input, output, cached and reasoning tokens differently; check the version documentation.

### Compute a budget once

Teaching assumptions: total window 8192 tokens, every output token counts against that total, and a separate output cap of 2048:

```text
system and template 500
history and sources 3500
user question       1000
input total         5000
window left         8192−5000=3192
actual output ≤ min(3192,2048)=2048
```

It is not “the user text is under 8192, so 8192 more must be available”. Tool descriptions, templates or service overhead may also take space.

## 2. Tokens and pages can only be estimated roughly

Slides 129–130 use an English rule of thumb: 1 token ≈ 0.75 English words, a page ≈ 400 words, so about 533 tokens, rounded in class to roughly 500.

That estimate depends on font, language, layout and tokenizer. Chinese text, code and tables have no fixed “one character is one token” conversion. Cost, window and output length should be measured with the target model’s tokenizer.

The product specifications on slides 126–128 are a snapshot dated by the material and do not mean every model shares the same window or output limit.

## 3. Why can a longer context be harder?

“Context rot” names the phenomenon where, as input grows and relevant information is diluted by noise, model performance can drop. A needle-in-a-haystack test places a target fact at different positions in a long context and checks whether it can be retrieved.

```text
task: find bear A’s age
relevant fact: bear A is 4 years old this year
noise: hundreds of pages of unrelated toy records
```

“The model can accept this many tokens” is a capacity constraint, not “it reliably uses every passage”. Performance differs across tasks and models, so no long input should be declared automatically worse.

Practical approach: define the task, retrieve relevant material, remove irrelevant repetition, keep the key constraints, and summarise when needed. Compression also loses information, so check afterwards that the task is still answerable.

## 4. ICL: adapt to a task through examples in context

ICL = In-Context Learning. The model adjusts its answer from instructions or examples in the current input, **without updating weights**, unlike fine-tuning.

### Zero-shot: give the task and the necessary facts

```text
known: bear A is 4 years old in 2024.
question: how old is bear A in 2025?
requirement: output only the age number.
```

Expected output 5. Facts are still required; zero-shot means no task demonstrations, not “no background at all”.

### Few-shot: demonstrate inputs and outputs

```text
example: bear B is 3 years old in 2024 → 4 years old in 2025.
example: bear C is 6 years old in 2024 → 7 years old in 2025.
known: bear A is 4 years old in 2024 → in 2025 is ?
```

The examples show the “add one year” rule and the answer format. Using examples that leak an answer too close to the query does not make a meaningful evaluation.

| Approach | Changes parameters? | Main cost | Risk |
| --- | --- | --- | --- |
| Zero-shot | No | prompt and generation | under-specified instructions |
| Few-shot | No | extra example tokens | example bias, format overfitting |
| Fine-tuning | Yes | training and weight upkeep | data and training bias |

More examples are not always better, and modern reasoning models do not never need examples. Compare on a fixed evaluation set.

## 5. CoT: step demonstrations and intermediate computation

CoT = Chain-of-Thought. The slides introduce the historical idea of improving multi-step tasks with step-by-step examples. Here a **verifiable short calculation** demonstrates the process:

```text
question: 4 years old in 2024, how old in 2025?
year gap: 2025−2024=1
answer: 4+1=5 years old
```

The original subtitle and slides mix “now”, “next year” and different years, which is easy to misread. Fixing 2024→2025 avoids mixing facts that change with the calendar into the computation.

Such intermediate computation helps checking, but the explanation a model produces may not faithfully reflect its internal causal process, and it is not a proof of correctness. In practice, ask reasoning models for a short justification, citations and result verification rather than demanding a full internal chain.

## 6. Self-consistency: sample several times, aggregate answers

**Definition**: generate several candidate solutions and aggregate the final answers, for example by majority vote. It spends more inference compute to gain performance; it does not train new parameters.

Teaching samples: `[5,5,4,5,4]` — answer 5 gets 3/5 votes, so 5 is chosen.

<div class="flow"><span class="chip">same question</span><span class="arrow">→ sample several times →</span><span class="chip">5 / 5 / 4 / 5 / 4</span><span class="arrow">→ aggregate →</span><span class="chip">majority answer: 5</span></div>

**A vote share is not a calibrated probability of being correct.** If samples are highly correlated or the model has a systematic misunderstanding, the majority can be wrong too. Normalise answer formats, handle ties, and combine with independent computation or fact checking.

## 7. Keep prompting, decoding and training apart

- Prompting: change the context the model sees.
- Temperature and sampling: change how a token is chosen from the current distribution.
- Fine-tuning: change model parameters.
- Self-consistency: increase the number of samples and aggregate.
- Guided decoding: restrict the legal output form.

For example, “add two examples to the age question” is not fine-tuning; “ask for JSON” is not by itself a strict grammar constraint. Tools from different layers combine, but their effect and cost must be verified separately.

## Check your understanding

<details><summary>Why does few-shot increase latency and cost?</summary><p>Examples add input tokens, which can increase prefill computation and storage. Cache hits, service billing and generation length also affect the real cost, so you cannot infer a fixed multiple from the example count.</p></details>
<details><summary>If self-consistency gives 5 in 60% of samples, is the answer 60% likely to be correct?</summary><p>No. That is only the frequency within this sample set; sample independence, model bias and decoding strategy all affect it, so separate calibration or verification is needed.</p></details>

Source: PDF pages 124–137 and the transcript; pages 125 and 137 were visually checked. The window budget and fixed-year example are teaching additions.
