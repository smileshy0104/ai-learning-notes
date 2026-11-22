---
slug: overview
title: "LangGraph: state, nodes and edges"
description: "Use one question-answering task with retrieval and verification steps to understand the basics of graph execution."
collection: langgraph
lang: en
order: 10
kind: guide
status: published
tags: [LangGraph, State, Node, Edge]
---

## Why a graph at all?

A simple application can run linearly: receive the question, call the model, return the answer. Once a task needs conditional branches, returning to an earlier step, or preserving execution state, “what happens next” has to be made explicit.

LangGraph organises execution steps with state and a graph structure. This is a conceptual overview, not usage instructions for a current API version; code examples will be verified separately once dependency versions are fixed.

## Definitions first, then an example

| Concept | Definition | Example in a QA task |
| --- | --- | --- |
| State | data passed along and updated during execution | question, material, answer, check result |
| Node | a processing step that reads state and produces an update | retrieve material, generate an answer, check citations |
| Edge | specifies the follow-on relationship between steps | after retrieval, go to generation |
| Conditional branch | chooses the next step from the result | insufficient citations, retrieve again; otherwise finish |

Not every node has to call a model. Steps such as checking whether material is empty or enforcing a retry limit can be ordinary code.

## A concrete flow

```text
receive question → retrieve → generate → verify
                    ↑           │
                    └ insufficient ┘
                                │
                             pass → end
```

If the first retrieval does not find “factory reset”, the verification node can request different keywords and retrieve again. The system needs a retry limit so the loop cannot run forever.

## What must be learned separately?

- How state fields are defined and how updates are merged.
- How conditional branches and loops are controlled.
- How checkpoints and resumption are handled.
- How human intervention pauses and resumes execution.
- How resumption avoids repeating side effects from external tools.

These are contents of later topics; only the conceptual overview is finished here. A graph expresses control flow, not the correctness of each node’s result, so input validation, output verification and real evaluation are still required.

## Sources

- [LangGraph documentation](https://docs.langchain.com/oss/python/langgraph/overview)
