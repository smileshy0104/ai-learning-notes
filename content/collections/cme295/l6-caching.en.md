---
slug: l6-caching
title: "Caching and cost: keep stable prefixes first"
collection: cme295
lecture: 6
lang: en
description: "Compare the ordering of tool definitions, dynamic time and the user request, and state prefix hits, TTL and billing assumptions explicitly."
order: 80
kind: lesson
status: published
tags: [Prompt caching, Prefix, Cost]
---

## 1. Tool definitions also occupy context

PDF pages 91–101. The model must read tool descriptions, schemas and other guidance; these can be long, but if consecutive requests share a stable prefix the computation can be reused.

This is an application of [lecture 5’s prefix KV cache](l5-kv-paging.html), not a cache of the whole answer; a new request still has to generate output.

## 2. Why does order matter?

Prefix caching usually requires the leading tokens and related configuration to match. Put the changing user question first and later identical tool definitions may not hit that part.

```text
usually unfavourable: dynamic question → fixed tools → dynamic time
more favourable: fixed tools / fixed guidance → dynamic time and context → user question
```

This arranges stable content while keeping message roles and semantics correct; you cannot pass user content off as a system instruction to save money. Different APIs serialise tool definitions and define cache boundaries differently, so roles should not be reordered casually.

<!-- lab:l6-prefix -->

Teaching blocks: T is the identical tool block, C the changing time context and U the changing question. With T first the T block is shared; if C or U changes first, later identical T does not form a common prefix.

## 3. How much is saved needs stated conditions

Assume each request has a fixed prefix of 800 tokens and 200 dynamic tokens across 10 requests; normal input costs 2 currency units per million tokens and a hit costs 0.2; the first prefix is billed at the normal rate and no separate cache-write fee applies:

```text
no cache: 10×1000×2/10^6=0.02000
cached:   800×2/10^6 + 9×800×0.2/10^6 + 10×200×2/10^6
          =0.00704
saving 64.8%
```

This counts input only, excluding output, tool services, retrieval, model routing, storage and cache-write fees. The 10–40× price gap in the slides is a snapshot condition, not a promise that every request’s total bill falls 10–40×.

## 4. TTL, writes and invalidation

TTL means time to live, not the subtitle’s time to leave. Expiry, replaced tool definitions, and model or configuration changes can all cause a miss; some services charge for writes or set a minimum prefix length, so read the actual product contract.

When dynamic tool selection changes the prefix, grouping requests with the same tool set is reasonable, but never inject irrelevant or over-privileged tools merely to raise the hit rate. Hit optimisation is subordinate to correctness and data isolation.

## 5. A cache is not long-term memory

Caching is about reusing computation for the same prefix; long-term memory is about what information is retained across sessions. Even if the underlying KV still exists, a request that does not reference it does not mean the model “remembers”; conversely, long-term memory can be rebuilt from text or a database without depending on one KV instance surviving.

## Check your understanding

<details><summary>With fixed tools placed after the dynamic question, do identical tool texts always hit?</summary><p>Not necessarily. Ordinary prefix caching requires the leading part to match; an identical middle segment is not the same common prefix.</p></details>
<details><summary>If reads are 10× cheaper, is the total cost necessarily 10× lower?</summary><p>No. The first input, dynamic parts, output and other charges need not share the same discount.</p></details>

Source: PDF pages 91–101; the token blocks and cost figures are teaching calculations under explicit assumptions, not live API prices.
