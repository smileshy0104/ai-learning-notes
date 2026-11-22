---
slug: overview
title: "LangChain: understanding an application through its components"
description: "Build the overall picture of messages, models, tools and retrieval before diving into specific APIs."
collection: langchain
lang: en
order: 10
kind: guide
status: published
tags: [LangChain, Messages, Tools, RAG]
---

## What problem does this collection solve?

When an application needs to call a model, assemble messages, read external material and execute tools, component interfaces can organise those steps. LangChain provides a set of components and integrations around model applications.

This is a conceptual overview; **no version-pinned API tutorial is provided yet**. Later code articles will state the language, package versions, runtime environment and verification results.

## One concrete task: answer from a product manual

Suppose the user asks: “How do I factory-reset this product?”

1. The application receives the question.
2. A retrieval component finds relevant passages in the manual.
3. The application arranges question and passages into messages for the model.
4. The model generates an answer from the supplied material.
5. The application checks whether the answer cites sources and presents it.

Model generation, material retrieval and message assembly are different responsibilities. Adopting a framework does not automatically give reliable answers; retrieval quality and output verification still need separate evaluation.

## Four concepts to separate first

| Concept | Responsibility | In this example |
| --- | --- | --- |
| Message | expresses role and content | user question, system requirements, retrieved material |
| Model | produces output from messages | generates the reset instructions |
| Retriever | finds material for a query | finds the relevant manual passages |
| Tool | provides a callable external operation | looks up the product model or ticket status |

A retriever is not the model’s own memory, and tool calling is not the model executing a program directly; the actual execution is done by an external system.

## Suggested next steps

- Nail down the inputs and outputs of messages and model calls.
- Build a repeatable retrieval QA example on fixed material.
- Add one verifiable tool to the model.
- Add streaming, error handling and a small evaluation set.

These are planned contents, not yet written as a full tutorial. For state and execution loops, continue with the [LangGraph overview](../langgraph/overview.html).

## Sources

- [LangChain documentation](https://docs.langchain.com/)
