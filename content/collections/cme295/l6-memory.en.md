---
slug: l6-memory
title: "Compaction and memory: freeing space is not remembering forever"
collection: cme295
lecture: 6
lang: en
description: "Compare deletion, sliding windows, summaries and persistent retrieval, and explain the context budget, summary fidelity and memory update or forgetting."
order: 100
kind: lesson
status: published
tags: [Compaction, Context, Memory]
---

## 1. Manage the window before it is full

PDF pages 128–136. A loop keeps adding tool definitions, requests, returns and answers, so total length grows. Room must also be reserved for the next tool result and the generated output, rather than waiting until the input exactly fills the window.

Teaching window 10000 tokens, reserving 2000 for output, 1000 for potential tool results and 1000 for fixed guidance, leaves at most 6000 for history and other input. It is a budget, not a fixed model specification; real counting depends on the tokenizer and API rules.

## 2. Three kinds of compaction

| Strategy | How | Main risk |
| --- | --- | --- |
| deletion | remove verbose or now-useless content | deleting evidence still needed later |
| sliding window | keep only the most recent passages | early constraints and goals disappear |
| summarisation | generate a shorter structured record | omitted information, changed meaning, assumptions written as facts |

They combine, and newer is not automatically more important. System constraints, user prohibitions, unfinished work and key evidence usually cannot be dropped purely by age.

<!-- lab:l6-compaction -->

In the synthetic scenario the user first says “compare only, do not buy”, then three candidates are retrieved. Keeping only recent search results can lose the prohibition; a structured summary should keep the goal, constraints, confirmed facts, pending work and references.

## 3. How are summaries made safer?

- The current goal and scope, and which actions are explicitly unauthorised.
- Completed operations and their evidence, separating plans from actual execution.
- Remaining tasks, errors and decisions still pending.
- Location information that can be re-read: source IDs, file positions, times.

A summary is not a lossless compression of the original record. Important conclusions must be able to return to the original evidence, and a malicious instruction inside some web page must not be summarised as “the user requires”. Keep the necessary tool call/result pairing and protocol structure.

## 4. Short-term and long-term

Short-term memory usually means the currently available context. Long-term memory is external persistent storage that carries facts, preferences or progress across sessions and is retrieved into context when needed; it does not mean the model weights update immediately.

Two course approaches: retrieve past conversations; or use an explicit memory tool to write a curated record. A record should at least carry source, time and scope or subject, and separate stable preferences from temporary state.

“Once considered buying a bear” is not “wants to buy a bear every time”, and a past address is not the current location. Stale, conflicting or privacy-sensitive records must be correctable, expirable or deletable.

## 5. Memory can be poisoned too

An external document cannot by itself demand that a high-privilege permanent rule be written. Before saving, confirm that it concerns the user and lies within the allowed scope, and avoid unnecessarily retaining passwords, location traces or other people’s data.

A retrieved memory is evidence with provenance, not a new command that skips current authorisation. Permissions and the current task scope are still enforced by the host.

## Check your understanding

<details><summary>If the model says “noted” in text, has it necessarily written persistent storage?</summary><p>Not necessarily; a real write mechanism and a successful result are needed, otherwise it may exist only in the current conversation.</p></details>
<details><summary>If the compacted summary omits “do not buy”, is the constraint cancelled?</summary><p>No, that is a summary omission, not a user retraction. Key constraints should be preserved and independently checked at the execution end.</p></details>

Source: PDF pages 128–136. The budget and fidelity checks are teaching additions; the summary fields cited in the slides are general examples and do not represent the current full specification of any software.
