---
slug: l3-end-to-end
title: "End-to-end case: joining the training stages into one line"
collection: cme295
lecture: 3
lang: en
description: "Follow the case discussed in the slides through data mixture, packing, SFT masks, RL feedback and cross-stage distillation, separating model collapse from forgetting."
order: 110
kind: lesson
status: published
tags: [End-to-end, Packing, Model collapse, Forgetting]
---

## 1. How is the case used?

PDF pages 132–164 discuss real recipes through the training pipelines in technical reports. The slides use GLM-5, other model reports and product snapshots as examples.

This page summarises the **stage logic**. It does not treat unverified model parameters, leaderboards, vendor allegations or current maths news as facts reported by this site. Open weights also do not automatically mean fully open training code, data and licence.

To make it concrete, we construct a “laundry-care question-answering assistant” project and state the data and evaluation goal of each stage. It is a teaching plan, not a large-model training run that actually happened.

## 2. Stage one: broad pretraining

The task is to learn language and code regularities from web pages, knowledge documents, code and maths material, with cleaning, deduplication, source classification, quality scoring and mixing.

For a laundry assistant, the base model may know what fabric, washing and time expressions are, without yet giving reliable advice in the requested form.

### Concatenate and chunk

Slide 139 concatenates several documents into one token stream and cuts it into fixed-length chunks for efficiency. Documents can be split, and a chunk does not necessarily start at BOS.

Teaching example: documents A, B and C already include boundary markers and contain 5, 4 and 3 tokens — 12 in total; chunk length 8, so the first chunk holds 8 and the second holds 4 plus 4 PAD tokens: 16 slots, 75% utilisation.

```text
document stream: AAAAA BBBB CCC
chunk 1: AAAAA BBB
chunk 2: B CCC PAD PAD PAD PAD
```

The symbols A/B/C stand for tokens from different documents; no single letter is a real character. Whether attention may cross documents, and whether positions reset or special boundaries are used, must be stated by the implementation.

## 3. Stage two: mid-training and long context

The data shifts towards longer material closer to the target: product manuals, code changes spanning several files, documents with many constraints. The objective is usually still next-token prediction, but it must genuinely cover long-range dependencies.

### What is best-fit packing?

Slide 149 tries to fit whole documents into the context without cutting them, padding the remainder when necessary.

**Teaching-specific algorithm: best-fit decreasing.** Sort documents from longest to shortest, place each in the existing bin where the remaining space after insertion is smallest, otherwise open a new bin. This is a bin-packing heuristic: it does not guarantee a global optimum, and the report need not use exactly this implementation.

```text
lengths [6,5,3,2], bin capacity 8
sorted [6,5,3,2]
6 → bin 1 [6]
5 → bin 2 [5]
3 → bin 2 [5,3] (exactly full)
2 → bin 1 [6,2] (exactly full)
two bins, total length 16, total slots 16, utilisation 100%
```

“Fewer PAD tokens” alone does not prove better training: document integrity, boundaries, the loss mask, position rules and batch composition all matter.

## 4. Stage three: SFT teaches the desired answer behaviour

Build an input: “Given the labels below, which bear can be machine washed and tumble dried?” plus a correct, short, grounded output.

- The prompt contains the necessary facts, such as materials or labels.
- The demonstrated answer satisfies the task format and conditions.
- The usual response-only loss scores only the answer, not the user’s question.
- Multi-turn data must mark which assistant turns are supervised; tool-call fields also follow the training template.

The role, `think` and answer token diagram on slide 153 shows where the targets land; it is not a requirement that every product expose a complete internal chain of thought. A short verifiable explanation plus a final answer is enough for teaching.

## 5. Stage four: RL improves measurable task outcomes

Give the model chances to answer on its own, then verify: did it choose Polar? Did it violate “no tumble drying”? Is the output parseable?

The slides split this into reasoning RL, agentic RL and general RL:

| Category | Example signal | What to watch |
| --- | --- | --- |
| Reasoning RL | success on maths/code tasks | verifier loopholes and problem leakage |
| Agentic RL | completing tasks in a tool environment | tool side effects, reproducible environments, timeouts |
| General RL | instruction quality, helpfulness | human/model judge bias |

These organise training in the case; they do not mean every model is trained three times in exactly this order. Nor does a higher task reward mean the model handles every real-world situation.

## 6. After many stages, are old abilities still there?

**Catastrophic forgetting** can occur: a new task improves while old ones regress, for example after optimising code feedback, concise Chinese answers or some domain QA get worse.

Slides 157–161 use earlier SFT and reasoning-RL checkpoints as teachers, giving the current student cross-stage distillation signals.

<div class="training-stages"><div><strong>Early SFT checkpoint</strong>teacher signal that retains instruction behaviour.</div><div><strong>Earlier reasoning checkpoint</strong>keeps task abilities already learned.</div><div><strong>Current student</strong>trains on the new objective together with retention signals, then is verified with multi-dimensional evaluation.</div></div>

The teachers are not several models permanently serving answers alongside it. Retention objectives during training also cost something and can conflict; abilities are not guaranteed to only increase stage by stage.

## 7. Another risk: model collapse

Slides 140–143 stress the loss of long tails and distribution shift in recursively generated data. The first generation’s samples miss rare expressions, the next generation learns only those outputs, and diversity and knowledge can gradually erode.

**Do not read this as “all synthetic data is harmful”.** Synthetic data that is filtered, verified and sensibly mixed with real material can be useful; source diversity, real-task evaluation and quality control are the key.

“Most of the internet is now AI-generated” is a motivating claim in the slides; this page offers no unquantified ratio as fact.

## 8. How do you accept a training plan?

- Evaluate factual correctness, constraint satisfaction, format, refusal behaviour and language quality on unseen samples.
- Compare the same task suite across stages to see gains and forgetting.
- Fix inference settings, templates, checkpoints and the tool environment.
- Record data sources, deduplication and validation isolation to avoid training–evaluation contamination.
- Track time, memory, tokens and labelling cost, not a single score.

The slides end by noting that stronger models may reduce some harness complexity, but applications still need tool boundaries, permissions, verification and error recovery; it does not follow that frameworks and engineering stop mattering.

## Check your understanding

<details><summary>Are model collapse and catastrophic forgetting the same thing?</summary><p>No. The first concerns how recursive training data degrades distributions and long tails; the second concerns old abilities dropping after training on a new objective. They can co-occur, but the causes and detection differ.</p></details>
<details><summary>If all training stages form one pipeline, must every application run them all?</summary><p>No. Applications often start from an existing model and choose the prompting, retrieval or adaptation they need. The full recipe explains model training; it is not a default requirement to pretrain from scratch.</p></details>

Source: PDF pages 132–164 and the transcript; pages 139, 149, 153, 156, 160 and 161 were visually checked. The laundry-assistant and packing numbers are teaching examples, not the actual data configuration of any technical report.
