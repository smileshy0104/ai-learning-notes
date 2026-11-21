---
slug: l3-data
title: "Data, mid-training and long context"
collection: cme295
lecture: 3
lang: en
description: "From corpus filtering and mixing to repeated training, RoPE extension and long-range supervision, separating data volume, quality and task coverage."
order: 30
kind: lesson
status: published
tags: [Data mixture, Mid-training, Long context, YaRN]
---

## 1. Same objective, so why does data still decide the outcome?

PDF pages 23–40. The next-token loss only tells the model to match the training distribution; if the corpus itself is repetitive, wrong, or missing a language or code, a correct formula will not fill those gaps by itself.

The slides list web pages, knowledge text, code, mathematics and scientific data, stressing that filtering and mixture ratios are a major part of real training work.

<div class="flow"><span class="chip">raw web pages / code / documents</span><span class="arrow">→ clean, deduplicate, filter for quality →</span><span class="chip">mix by source and task</span><span class="arrow">→ tokenise, pack →</span><span class="chip">training and independent evaluation</span></div>

Filtering, data rights, handling sensitive information and contamination control are data-pipeline problems. This site does not treat “there is a lot of it on the internet” as permission to collect or publish content freely.

## 2. How do mixture ratios affect training?

Suppose the total budget is 1 million tokens and the teaching mix is 50% web, 30% code and 20% maths: that is 500 thousand, 300 thousand and 200 thousand tokens. These are tokens, not file counts.

If a code document is on average twice as long as a web page, “30% of files are code” does not mean “30% of tokens are code”. A mixture ratio must state its denominator.

The slides mention RegMix: train small models at different ratios and use the results to predict a better large-scale mixture; and DataComp-LM, which tries to control architecture variables when comparing training data. They show that experiments are needed; they do not provide one fixed ratio that fits every model.

## 3. Is repeated data always useless?

The slides cite data-constrained research suggesting that limited repetition can still help. Read that as a result under a particular research setup, **not as “four passes over any corpus is always best”**.

- Repeating high-quality material a few times may keep providing training signal.
- Seeing the same data again is not the same as adding independent knowledge, and can overfit.
- The validation set must be independent; repeated training material cannot be used to prove generalisation.
- Total tokens processed, distinct tokens and number of epochs are different quantities.

## 4. What is mid-training?

**Definition:** a stage after large-scale pretraining that continues training on data aimed at particular capabilities. The slides use it to describe strengthening high-quality maths, code and long-context ability, usually still with a next-token objective.

There is no single industry-wide precise definition. Do not assume “mid-training data never contains instructions” or “every model has a separate mid-training stage” as requirements.

| Stage | Focus | Teaching example |
| --- | --- | --- |
| Pretraining | broad language and code patterns | text from many sources |
| Mid-training | strengthening a capability or length | long code edits, maths material |
| SFT | imitating desired input–output behaviour | given a user question, output the specified answer |

## 5. Why does long context still need training?

Lecture 2 noted that RoPE can compute angles for new positions, but a model trained on short sequences has not seen every long-range pattern. **A formula being computable is not the same as the model using it reliably.**

The slides describe RoPE extension (for example YaRN) and staged length training: 4K→32K→128K→1M. This is an illustration of methods and magnitudes, not a claim that every model is trained at exactly these lengths.

Methods such as YaRN adjust position frequencies or scaling rules together with appropriate training. They have specific design details and cannot be reduced to “divide all angles by some number and everything is equivalent”. Inference must use the position settings consistent with training or adaptation.

## 6. “Long” is not effective supervision by itself

If the end of a long file does not depend on facts at the beginning, it may not teach long-range retrieval at all.

**Teaching sample:** the first paragraph states clearly that “Polar’s care label allows tumble drying”, and much later the text asks “which toy can be tumble dried?”. Add other distinguishable labels, and verify that the answer must use the earlier fact.

Position, multi-hop relations, distractors and data authenticity all need to be controlled, so a repeated keyword cannot be enough to guess the answer.

### Why is the computation more expensive?

If pure full-attention length grows from 4096 to 32768, that is 8× the length and 64× the number of score connections. From 4096 to 131072 is 32× the length and roughly 1024× the connections.

This compares attention connections only; it does not mean end-to-end training cost grows proportionally, since memory algorithms, sparsity patterns, parallelism and other operators all matter.

## 7. Knowledge cutoffs and knowledge editing

The slides discuss cost, knowledge freshness, difficulty of modification and the risk of reproducing text. A knowledge cutoff usually reflects the time range of training material and product documentation; it does not guarantee that every earlier fact is known, nor that later information can never be reached through prompting or retrieval.

External retrieval adds current material; it does not mean the weights have been updated. SFT or continued pretraining can change behaviour and knowledge performance, but that is not the same as precisely editing one database record.

## Check your understanding

<details><summary>Is raising the max_context parameter the same as long-context training?</summary><p>No. Position mechanisms, genuine long dependencies in the training data, compute and memory support, and task evaluation all have to be considered.</p></details>
<details><summary>Why can “everything comes from high-quality sites” still be insufficient?</summary><p>Domain and language coverage may still be missing, duplication and evaluation contamination may exist, and the mixture may not fit the target task. Source reputation does not replace checks at the data level.</p></details>

Source: PDF pages 23–40 and the transcript; the mixture arithmetic and the squared-length calculation are teaching additions. Specific product names and training scales in the slides should be read as of the original material’s date.
