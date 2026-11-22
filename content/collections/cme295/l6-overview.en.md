---
slug: l6-overview
title: "Lecture 6 overview: from answering questions to completing tasks"
collection: cme295
lecture: 6
lang: en
description: "Follow the slides through RAG, tools, harnesses, context, coding agents and multi-agent collaboration."
order: 10
kind: lesson
status: published
tags: [Lecture 6, AI Agents, Overview]
---

## Two limits that shape the lecture

PDF pages 1–8 motivate the lecture with the evolution of programming tools: copying code, IDE completion, whole tasks, then execution loops with feedback. The years and product screenshots are course narrative, not a claim that each stage first appeared in a particular year.

A base model that answers only from its parameters has two clear limits: it does not know private or new material that was never supplied, and text output alone cannot really send an email, check live inventory or modify a file.

<div class="flow"><span class="chip">missing information → retrieval</span><span class="arrow">→</span><span class="chip">needs an action → tools</span><span class="arrow">→</span><span class="chip">needs ongoing feedback → harness and loop</span></div>

A knowledge cutoff does not mean every earlier fact is known, nor that the model cannot use material supplied later in the prompt. An agent is still model predictions; an external system interprets some of those outputs as executable requests.

## Reading order following the slides

Page numbers are physical PDF pages, with the cover as page 1. Consecutive pages are often one diagram unfolding.

| Thread | Pages | Reading |
| --- | --- | --- |
| Introduction and motivation | 1–8 | This page |
| RAG and knowledge bases | 9–25 | [Retrieval augmentation](l6-rag.html) |
| Candidate retrieval, augmentation and reranking | 26–40 | [Retrieval pipeline](l6-retrieval.html) |
| Retrieval evaluation, code search | 41–49 | [Hand-computed metrics](l6-metrics.html) |
| Tool calling, demonstrations and prompting | 50–71 | [Tool lifecycle](l6-tools.html) |
| Conflicts and tool choice | 72–86 | [Routing and ambiguity](l6-selection.html) |
| MCP | 87–90 | [The standardisation boundary](l6-mcp.html) |
| Tool context and caching | 91–101 | [Stable prefixes](l6-caching.html) |
| Harness, ReAct, A2A | 102–127 | [The execution loop](l6-harness.html) |
| Compaction and memory | 128–136 | [Context management](l6-memory.html) |
| Coding agents and computer use | 137–146 | [Coding agents](l6-coding.html) |
| Collaboration, progress and risk | 147–152 | [Orchestration](l6-orchestration.html), [review](l6-review.html) |

## Four concepts that are often confused

| Concept | What it is | What it is not |
| --- | --- | --- |
| RAG | look material up and put it into the generation context | an automatic guarantee of factual truth |
| Tool calling | the model proposes a structured operation request | the model holding backend permissions itself |
| Harness | the execution, state, context and permission machinery around the model | another set of model weights |
| Agent | a system that chooses actions towards a goal and takes feedback | something that must have several models or unlimited autonomy |

Retrieval can also enter an agent loop as a tool; one-off static RAG and repeated lookups are not opposing camps. Not every application needs an agent — when a fixed pipeline is easier to control, a workflow may fit better.

## Prerequisites and reading notes

You may want [training and SFT](l3-sft.html) and [lecture 5’s caching](l5-kv-paging.html) first. The lecture content follows the original order; formulas, synthetic cases and safety design additions are marked. The interactive panels do not touch real accounts or perform external actions.

Understand products, model specifications, API prices, news and protocol code as of the slide date; this page explains concepts and is not a promise of current SDK compatibility. Text returned by a web page or tool is external data even when it reads like a command, and gains no system permission from that tone.
