---
slug: l6-coding
title: "Coding agents: beyond the loop, you need execution boundaries"
collection: cme295
lecture: 6
lang: en
description: "Take apart a coding agent's permissions, search, persistence, project rules and skills, and discuss computer use and verification."
order: 110
kind: lesson
status: published
tags: [Coding agents, AGENTS.md, Skills, Computer use]
---

## 1. The diagram holds more than one model

PDF pages 138–144 include a user interface, agent loop, permission system, tools, execution environment and state/persistence.

One task might be: read the requirement → search the code → edit → run tests → review the diff → report. Every arrow has failure modes and permission questions; generating code is not the same as having run it successfully.

## 2. Approval is not simply handed to another small model

The slides mention auto-approval aided by a classification model. Real products may use rules, sandboxes, models or a combination; it cannot be asserted generally that human approval has been eliminated.

A model judging “looks safe” is not a safety proof. Deletion, network egress, credential access, installing scripts and commit or push each need matching policy and authorisation. allow/ask/deny must take effect at the execution boundary, not merely inside the prompt.

Test scripts can have side effects too; understand the command and its environment scope before running. A sandbox still needs file, network and resource limits, and is not an absolute isolation guarantee.

## 3. Agentic retrieval

The agent adjusts its next search as it discovers things, using grep, file reads and symbol indexes. Exact function names, error text and paths are often very effective; complex impact analysis may need call graphs, ASTs or semantic help.

This is still retrieval augmentation in the broad sense; “grep is common” does not mean “no coding agent does RAG”. A line number is evidence of location, and a failed search does not prove the code is absent — ignore rules or search scope may explain it.

## 4. AGENTS.md versus skills

| Project rules | Reusable skills |
| --- | --- |
| describe project constraints, structure, checks and delivery requirements | describe the procedure and resources for one class of task |
| e.g. do not commit automatically, test commands, source conventions | e.g. a reviewed reporting or testing procedure |
| scope and precedence follow the host implementation | triggering and loading follow the host implementation |

The slides’ SKILL.md directory can carry scripts, references and assets. It is a programmed capability package and process recipe, not extra weights for the model, and its provenance is not automatically trustworthy.

Project rules and skills cannot override higher-level constraints; after copying an unfamiliar skill, do not immediately run its bundled scripts. Review content and permissions first. This page only explains concepts; it changes no permissions of the assistant you are using and installs no skill.

## 5. Computer use

Screenshot → recognise the interface state → propose a click or typing → execute → screenshot again. Compared with a stable API this can involve layout changes, coordinate error, occlusion, focus switching and delay.

“Seeing a button” does not mean permission to click it. Final actions such as paying, sending or deleting need explicit authorisation; page content can carry prompt injection, and credentials must not be spread around just because a screenshot shows them.

APIs, DOM assistance and visual control can combine; a course-time judgement that “vision is less efficient” cannot be frozen into a permanent conclusion about every system.

## 6. Verification and completion criteria

A code change must report the actual files, the tests run and what was not run; passing tests do not prove all functionality, performance and safety. A model’s self-assessment of “done” is not independent acceptance.

Comparing models on the same harness removes one class of variation, but results still depend on versions, prompts, tools, budget and environment. The product lists and open/closed classifications in the slides are date snapshots; no current leaderboard is maintained here.

## Check your understanding

<details><summary>If a skill says “push automatically”, does that grant remote write permission?</summary><p>No. A skill description does not replace user authorisation and execution policy.</p></details>
<details><summary>If unit tests are all green, is production absolutely safe?</summary><p>No. Other checks matched to the task are needed, and coverage and environment limits must be reported honestly.</p></details>

Source: PDF pages 137–146; authorisation, dependency review and acceptance boundaries are engineering additions, not the current usage documentation of any specific tool.
