---
slug: overview
title: "Eino: organising AI components in Go"
description: "Start from component inputs and outputs to understand orchestration and execution in a Go AI application."
collection: eino
lang: en
order: 10
kind: guide
status: published
tags: [Eino, Go, Orchestration, Components]
---

## What to look at before learning this framework

Eino is an AI application framework in the Go ecosystem. Begin with how data passes between components, then move on to the orchestration API, streaming and tool integration.

This is a conceptual overview that pins no versions. Later code examples must state the Go version, module versions and execution results, so a conceptual note is never mistaken for runnable code.

## One concrete example: ticket classification and summary

The system receives a ticket: “Login fails after the upgrade, the page says the session has expired.”

1. A preprocessing step tidies the input text.
2. A model step decides the category and produces a summary.
3. A validation step checks that fields are complete and the category is allowed.
4. Depending on the category, choose the follow-up, such as entering the account-issue flow.

Model calls, validation and branch selection should be steps with clear boundaries. Go’s types help express input and output relationships, but semantic correctness still needs verification.

## Corresponding concepts

| Concept | Meaning | In this example |
| --- | --- | --- |
| Component | a capability with a clear responsibility and inputs/outputs | calling a model or reading a ticket |
| Orchestration | connecting components into an execution flow | preprocess → model → validate |
| Streaming | producing and consuming results in parts | the summary streams back to the interface |
| Branching | choosing the next step from state | different categories enter different flows |

## A suggested learning order

- Get a minimal model call running and understand messages and output types.
- Chain two or three components and check each step’s inputs and outputs.
- Add validation and error handling.
- Then learn streaming, graph orchestration and tool calling.

The collection currently contains only this overview; the full tutorial will be added later. Read it against [LangGraph’s graph concepts](../langgraph/overview.html); the two frameworks’ APIs and execution semantics must be checked separately.

## Sources

- [Eino repository and documentation](https://github.com/cloudwego/eino)
