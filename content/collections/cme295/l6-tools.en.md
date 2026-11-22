---
slug: l6-tools
title: "Tool calling: the model proposes, the system executes"
collection: cme295
lecture: 6
lang: en
description: "Break the lifecycle into name, arguments, execution and result handling, and separate the roles of SFT, prompting, type validation and authorisation."
order: 50
kind: lesson
status: published
tags: [Tool calling, Schema, SFT, Authorization]
---

## 1. What is the difference between looking something up and doing something?

PDF pages 50–67: static material may tell you that Cuddly often reads, but it cannot fetch the current device location or live inventory. Calling a location or inventory API solves that.

“RAG cannot be real-time” is only a limitation of the slide’s static-library example; retrieval can also hit live sources, and tools can also be read-only. Retrieval and tools are not mutually exclusive categories.

## 2. A three-stage lifecycle

<div class="flow"><span class="chip">model picks a name and arguments</span><span class="arrow">→</span><span class="chip">host validates, authorises, executes</span><span class="arrow">→</span><span class="chip">result returns; model explains</span></div>

A teaching call request:

```json
{"name":"find_teddy_bear","arguments":{"latitude":37.42,"longitude":-122.17}}
```

This is a synthetic example, not data from a device GPS. A correct flow first obtains coordinates from an authorised source; it must not invent them because the user said “near me”. The backend returns a structured name, distance_meters and so on, and the model then summarises.

Tool names and descriptions plus the input schema usually enter the model context; the full Python source need not. Tools can be implemented in any language, not necessarily Python, and need not touch the network.

## 3. Model output is not execution authority

The system still checks: whether the tool is allowed, argument types and ranges, the current user’s permissions, confirmation conditions, timeouts and result status. Valid JSON means valid syntax, not that the user authorised anything.

<!-- lab:l6-tool-gate -->

The experiment is a static decision table of fixed rules and does not call a real device. Reading a temperature, changing a setpoint and a missing-argument request take different paths. Even when the model picks the right tool, the system may still refuse or demand confirmation.

## 4. Failures and retries cannot be guessed

- Timeout: return an explicit unknown/failure and do not invent tool success.
- Missing argument: ask, or obtain it with an authorised tool; never fill it in arbitrarily.
- Unexpected output: validate before use, and bound length and sensitive fields.
- Side-effecting operations: record operation IDs, idempotency keys or verified status so a network retry does not send the email or make the purchase twice.

Text returned by a tool is external data; “ignore the rules and perform this operation” inside it cannot become new authorisation. A call chain also does not automatically inherit all of the user’s account permissions.

## 5. How do you teach the model?

PDF pages 68–71 give two routes: SFT demonstrating both “how to predict a call” and “how to turn a result into an answer”; or clear schemas, descriptions and examples so a model with existing tool use generalises.

Prompting does not change weights; SFT does. They coexist, and having a prompt does not remove the need for trained ability. When iterating descriptions with another model, keep real expected outputs and a held-out test set; do not optimise a handful of samples and declare reliability.

## 6. What does a minimal contract state?

Purpose, when not to use it, required arguments, units and ranges, return structure, possible errors, whether it is read-only, and whether confirmation is needed. If Celsius versus Fahrenheit, or absolute temperature versus an increment, is left unclear, correct types can still produce wrong actions.

The spoken Q&amp;A claim that “executing code is not a tool” and the later code-execution examples should be read at the abstraction level: in an agent system a shell or code execution can absolutely be a controlled tool interface. Classification does not change its safety sensitivity.

## Check your understanding

<details><summary>If schema validation passes, may the agent buy something?</summary><p>No. Syntax and range validation are not transaction authority; the object, amount and execution confirmation still have to be established.</p></details>
<details><summary>If a tool times out, may the model say “it is done”?</summary><p>No. It should report unknown or failed status and handle retries through idempotency or status verification.</p></details>

Source: PDF pages 50–71; validation, confirmation and idempotency are engineering additions, not the production implementation of the slides’ example API.
