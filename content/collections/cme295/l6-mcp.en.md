---
slug: l6-mcp
title: "MCP: one connection standard, not your authorisation"
collection: cme295
lecture: 6
lang: en
description: "Use a book service to explain Host, Client, Server and Tools, Resources, Prompts, separating protocol compatibility from trust."
order: 70
kind: lesson
status: published
tags: [MCP, Protocol, Tools, Resources]
---

## 1. Why standardise?

PDF pages 87–90. If one set of backend capabilities must serve several applications, writing connectors pairwise repeats work. MCP = Model Context Protocol, a shared interaction convention for tools and data.

Teaching analogy: 3 applications connecting to 4 service groups would need up to 12 pairwise connections; a shared standard lets both sides adapt once, conceptually 3+4=7 adaptation points. Reality still involves authentication, feature differences, versions and deployment, so total effort is not guaranteed to fall strictly from 12 to 7.

## 2. Three roles

| Role | Responsibility |
| --- | --- |
| Host | the user-facing application, managing the model, connections, context and permission policy |
| Client | the protocol component inside the host that talks to one server |
| Server | exposes tools, resources, prompts and similar capabilities, possibly calling its own backend |

It is not the model weights opening a network connection directly; usually the host/client communicates on their behalf. Several servers are also not several autonomous agents.

## 3. Tools, resources and prompts

Take a poetry service:

- Tools: callable interfaces such as searching titles or recommending books.
- Resources: data such as the user’s authorised library, which the host can read to supply context.
- Prompts: reusable interaction templates or workflow entry points, such as recommending by preference.

A resource is not a synonym for “another tool with side effects”, and a prompt template gains no higher instruction authority just because a server supplied it. The concrete control and usage are set by the client and the protocol version.

## 4. What does standardising not solve?

MCP does not automatically make tool descriptions correct, services trustworthy, requests authorised or execution safe. Authentication, least privilege, reviewing connection sources, input and output validation, and audit are still required.

Backend secrets must not be handed to the model or stuffed into ordinary tool results. Content returned by a remote service must be treated as external data; send only the necessary information within the scope the user authorised.

This page only explains protocol roles: no real server was installed, no account was accessed, and the SDK snippets in the slides are not claimed to run on current versions.

## 5. MCP versus ordinary function calling

Function calling usually describes the interface by which a model emits a structured request; MCP describes how an application connects to capability providers. A host can translate MCP tools into tool definitions the model understands, and the two layers combine.

It is not “supporting MCP removes the need for tool prompts and evaluation”, nor does MCP replace backend business logic. A2A, the delegation of tasks between agents, is discussed in the [harness page](l6-harness.html); the two address different layers.

## Check your understanding

<details><summary>Is an MCP server necessarily an autonomous agent?</summary><p>No. It may simply be a service exposing queries and data, with no autonomous loop.</p></details>
<details><summary>If the protocol conforms to the standard, is it trustworthy?</summary><p>No. Compatibility and trustworthiness are different; connection and permission reviews are still needed.</p></details>

Source: PDF pages 87–90; the connection counts and trust boundary are teaching additions.
