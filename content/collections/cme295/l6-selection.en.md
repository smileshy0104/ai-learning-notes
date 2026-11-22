---
slug: l6-selection
title: "Tool selection: more tools is not better"
collection: cme295
lecture: 6
lang: en
description: "Use the ambiguity between finding a teddy bear and finding a photo to explain tool routing, clarification, context bloat and permission filtering."
order: 60
kind: lesson
status: published
tags: [Tool selection, Routing, Ambiguity]
---

## 1. One request can be two tasks

PDF pages 72–86. “Help me find my bear” can mean finding a photo file or locating the physical toy. list_files and find_teddy_bear may both match, but they are not the same task.

When get_doc and get_drive can both return the same document, the slides call it benign overlap; even with similar results, permissions, provenance, cost and audit paths can still differ, so it cannot be ignored entirely.

## 2. What does a router do?

From the current request, conversation, user settings and available permissions, select a small subset of the tool library; the model then decides the concrete call among those interfaces.

<div class="flow"><span class="chip">the set of allowed tools</span><span class="arrow">→ filter by task →</span><span class="chip">a few tool definitions</span><span class="arrow">→</span><span class="chip">the model proposes a call</span></div>

Authorisation filtering is a boundary; semantic routing is a relevance optimisation. A router saying “very relevant” cannot activate a tool the user switched off, nor let an unauthorised operation run.

## 3. When should the system ask?

If the user was just organising photos, favour files; if they were just discussing objects in a room, consider locating. But past preference is not an irrevocable current authorisation, especially for location or sensitive data.

With insufficient context, asking “do you mean the photo file or the physical teddy bear?” beats silently choosing a riskier interpretation. State the chosen scope when needed, rather than blaming the user for not being explicit.

## 4. Fewer tools also cost something

It shortens the definitions and reduces conflicts, but may omit a tool the task needs. A fallback that retrieves more tools when the task cannot be completed is possible, still subject to permission and budget limits.

The router can be lightweight, or rules, a classifier or retrieval; “a small router model” is not one universal architecture. Setting temperature to 0 does not remove ambiguity, let alone guarantee bitwise determinism across hardware and versions; consistently producing a wrong interpretation is still wrong.

## 5. How do you evaluate tool selection?

Look at correct-tool recall, the share of irrelevant tools, argument accuracy, whether it stays put when no call is warranted, clarification quality, permission boundaries, end-to-end task success and latency. Tool-name accuracy alone hides argument and side-effect errors.

Test with synonymous requests, similar tools, missing permissions, unavailable tools and adversarial returns. The slides’ diagram of context bloat from many tools is motivation, not proof that each added tool necessarily lowers quality.

## Check your understanding

<details><summary>If the router picks a tool the user has not enabled, what should happen?</summary><p>It must not be silently enabled and executed; ask for enabling permission according to product rules, or state that the capability is unavailable.</p></details>
<details><summary>If two tools return identical text, are they fully equivalent?</summary><p>Not necessarily. Permissions, freshness, provenance and side effects can differ; the interface semantics must be explicit.</p></details>

Source: PDF pages 72–86; permission filtering and clarification testing are engineering additions.
