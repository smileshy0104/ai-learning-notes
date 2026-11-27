---
slug: l2-context-reasoning
title: "Context, prompting and reasoning: what to give, and how"
collection: cme295
lecture: 2
lang: en
description: "Separate the context window from the output budget, then use one age problem to work through zero-shot, few-shot, CoT and self-consistency — including how each fails."
order: 90
kind: lesson
status: published
tags: [Context, ICL, Few-shot, CoT, Self-consistency, Beginner]
---

## 1. What context actually is

Pages 124–137 of the PDF.

The previous section noted that every chosen token is appended to the input before predicting the next. That means <strong>the input the model sees keeps growing</strong>.

Writing this on paper makes it vivid. Start with:

```text
A cute teddy bear is
```

The model picks `reading`, and you write it at the end of the same line:

```text
A cute teddy bear is reading
```

Now cover `reading` with your hand: the next round has lost an important clue. What you covered is exactly what the next round must see — <strong>the token just produced is both this round's output and next round's input.</strong>

That is the <strong>context window</strong>: the maximum length the model handles at once, including system instructions, chat history, the user question, tool results and tokens already generated.

A common beginner error is thinking the context window equals what you typed. It does not; it is the combined volume of input plus output.

| Concept | Meaning | Common misreading |
| --- | --- | --- |
| context window | total length the model handles at once | counted as user input only |
| max output | cap on this generation | assumed equal to the window |
| input tokens | the prompt side | forgetting system prompt, examples, history |
| output tokens | the generated side | forgetting generated text also occupies the window |

Counting of input, output, cached and reasoning tokens differs by API; check the current documentation.

## 2. Work out a budget

Teaching assumption: total window 8192 tokens, all output counts against it, separate output cap 2048.

```text
system and templates   500
history and documents 3500
user question         1000
input total           5000

window left = 8192 − 5000 = 3192
allowed output = min(3192, 2048) = 2048
```

It is not "the user's text is under 8192, so 8192 can be generated". If the history is long, the input eats most of the budget and output space shrinks, possibly to nothing usable.

<strong>Tool descriptions, system prompts and boilerplate all occupy space.</strong> Beginners most often forget these.

## 3. Tokens and pages: rough only

Pages 129–130 give English rules of thumb:

- 1 token ≈ 0.75 English words
- one page ≈ 400 words ≈ 533 tokens, rounded to 500 in class

This depends on font, layout, language and tokeniser. Chinese text, code and tables have no fixed "one character, one token" conversion. Estimate cost and length with the target model's own tokeniser.

The product specifications on pages 126–128 are a snapshot from the material's date, not a statement about every model today.

## 4. Why a longer context can be worse

Intuitively more information is better. In practice there is <strong>context rot</strong>: as the input grows, key facts are diluted by irrelevant text and become harder to use.

The evaluation is <strong>Needle in a Haystack</strong>: hide one key fact at various positions in a long context and check retrieval.

```text
task: how old is bear A this year?
key fact: bear A is 4 this year
noise: hundreds of pages of unrelated toy records
```

The lesson: <strong>"can accept this many tokens" is a capacity property, not "can reliably use every passage".</strong>

Do not overgeneralise to "any long input is worse either". Results vary with task, model and position. Practical steps:

1. decide which information the task needs;
2. retrieve and include only relevant material;
3. drop duplication and noise;
4. summarise first if necessary;
5. verify afterwards that the task can still be answered.

Compression also loses information, so verify after compressing.

## 5. ICL: adapt through context without touching weights

<strong>In-context learning (ICL)</strong> means the model adapts to the task from instructions or examples in the current input, <strong>without updating any parameter</strong>.

That is the essential difference from fine-tuning:

| Method | Changes parameters? | Data needed | Scope |
| --- | --- | --- | --- |
| prompting (zero-shot) | no | an instruction | this request |
| few-shot | no | a handful of examples | this request |
| fine-tuning | yes | hundreds or thousands of labelled samples | all later requests |

### Zero-shot: task and facts only

```text
Known: bear A is 4 years old in 2024.
Question: how old is bear A in 2025?
Requirement: output only the age.
```

Expected output 5. Zero-shot means <strong>no task demonstrations</strong>, not "no background information". Facts still belong in the prompt.

### Few-shot: a few input–output examples

```text
Example: bear B is 3 in 2024 → 4 in 2025.
Example: bear C is 6 in 2024 → 7 in 2025.
Known: bear A is 4 in 2024 → in 2025?
```

The examples convey both the rule (add one year) and the output format (digits only).

One trap: <strong>if an example is too similar to the query, it leaks the answer</strong>, which is neither a valid demo nor a valid evaluation.

## 6. How to tune the examples

Suppose the model outputs "bear A is 5 years old" and your program wants an integer. Diagnose step by step:

1. <strong>Add a format requirement</strong>: append "output only the integer" and retry the same question.
2. <strong>Change the test item</strong>: alter both years and age to see whether the requirement transfers.
3. <strong>For JSON</strong>: constrain decoding to the schema, then validate the field values in code.

If the output really is a single integer but the value is wrong — say it copied bear B's age from an example — where do you look?

Try <strong>removing bear B's example</strong>, keeping only A's facts, and ask again; then restore the example with everything else unchanged. Comparing the two outputs tells you whether the example interfered.

To judge whether a prompt is more reliable overall, track two metrics separately on held-out questions:

- format compliance (does it parse?);
- answer accuracy (is the value right?).

<strong>They measure different things and must not be merged.</strong>

## 7. CoT: writing the intermediate steps

<strong>Chain-of-Thought (CoT)</strong> shows reasoning steps instead of jumping to the answer.

The historical method in the slides uses a few "problem plus worked steps" demonstrations so the model imitates the reasoning path; the authors found multi-step task performance improved.

Show it with a <strong>verifiable short calculation</strong>:

```text
Problem: 4 years old in 2024, how old in 2025?
Step: 2025 − 2024 = 1
Answer: 4 + 1 = 5 years old
```

Fixing 2024→2025 avoids mixing in facts that change with today's date (the transcript drifts between "now" and "next year", which becomes ambiguous).

<strong>Three boundaries:</strong>

1. The written steps need not faithfully reflect the model's internal computation; they may be post-hoc rationalisation.
2. Plausible steps do not guarantee a correct answer.
3. CoT is not the only route. Reasoning models trained with reasoning tokens work differently, covered in a later lecture.

Practical advice: ask for a brief justification, citations and a verification step rather than a full "inner monologue".

## 8. Self-consistency: sample several times, then vote

<strong>Self-consistency</strong> generates several answers to one problem and aggregates them.

```text
samples: [5, 5, 4, 5, 4]
answer 5 gets 3 votes → choose 5
```

<div class="flow"><span class="chip">one problem</span><span class="arrow">→ several samples →</span><span class="chip">5 / 5 / 4 / 5 / 4</span><span class="arrow">→ aggregate →</span><span class="chip">majority: 5</span></div>

It trades <strong>extra inference compute for accuracy</strong>; it does not train a new model.

<strong>Key warning: the vote share is not a calibrated probability.</strong> If five samples are highly correlated (the same misconception), the majority is wrong too. For it to help:

- sampling must be genuinely diverse (temperature not too low);
- answer formats must be unified or aggregation fails;
- ties need handling;
- combine it with independent computation or factual checks.

## 9. Keep the four layers apart

Beginners merge these four, yet each changes something different:

| Layer | What changes | Example |
| --- | --- | --- |
| prompting | the context the model sees | add two examples |
| decoding | how a token is picked from the distribution | lower the temperature |
| parameters | the model itself | fine-tuning |
| inference compute | how many samples and how they are aggregated | self-consistency voting |

"Add two examples to the age problem" is not fine-tuning; "require JSON" is not strict grammar constraint by itself. They combine, but validate effect and cost separately.

## 10. Check your understanding

<details><summary>Why does few-shot add latency and cost?</summary><p>Examples add input tokens, increasing prefill work and possibly cache usage. Cache hits, billing and output length also matter, so the multiple cannot be inferred from the example count alone.</p></details>
<details><summary>Self-consistency gives 5 a 60% vote share. Is the answer 60% likely to be correct?</summary><p>No. That is a frequency within this sample set; sample independence and model bias affect it, so calibration or verification is still required.</p></details>
<details><summary>Is a longer context always better?</summary><p>No. Capacity for longer input does not imply reliable use of it. Keywords can be diluted, so retrieval, pruning and checking all matter.</p></details>

Source: PDF pages 124–137 and the transcript; pages 125 and 137 were visually checked. The window budget, fixed-year example and diagnostic flow are teaching additions.
