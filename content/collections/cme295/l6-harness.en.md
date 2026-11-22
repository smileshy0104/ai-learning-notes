---
slug: l6-harness
title: "Harness and ReAct: putting actions into a controlled feedback loop"
collection: cme295
lecture: 6
lang: en
description: "Use the thermostat case to explain observation, planning, execution, verification and stopping, and separate model ability, system control and the A2A protocol."
order: 90
kind: lesson
status: published
tags: [Harness, ReAct, Agent loop, A2A]
---

## 1. What does the harness wrap around the model?

PDF pages 103–106: tools, action ordering, prompts, state, compaction, memory and guardrails. The model is like an engine and the harness like the surrounding control and transmission; together they determine the outcome.

This is an engineering summary, not “a strong model plus any loop is reliable”, nor a rule that every harness must have identical modules.

## 2. The core of ReAct is feedback

PDF pages 107–123. ReAct = Reason + Act: observe the current information, plan the next step, execute an action, receive the result, and continue when needed.

<div class="flow"><span class="chip">input goal</span><span class="arrow">→ observe → plan →</span><span class="chip">proposal and authorisation</span><span class="arrow">→ execute →</span><span class="chip">result and verification → continue or stop</span></div>

It does not require showing the user a complete hidden reasoning trace; the interface can show a short plan, tool log and verifiable results. Nor is it guaranteed that every model learns this loop from the same SFT recipe.

## 3. The thermostat case: setpoint versus actual room temperature

The slides start at 65°F and want 70°F. Supplementary conversion: 65°F is about 18.333°C, 70°F about 21.111°C, and a 5°F difference is about 2.778°C; do not subtract 32 again when converting a difference.

A sound state flow: read current data → propose the target 70°F → confirm according to permission → set it → read the device setpoint back to verify. A successful write does not mean the room air is instantly 70°F; thermal response takes time.

<!-- lab:l6-react -->

The experiment uses synthetic state with no real device. The slides’ “increase by 5°F” incremental action can add twice if retried; engineering practice uses absolute setpoints, operation IDs and read-back to reduce ambiguity, still within device safety limits and user authorisation.

## 4. Stopping cannot rely on “the model feels satisfied”

Set evidence of task success, maximum rounds, time and cost budgets, consecutive-error limits, tool unavailability and user cancellation. When external side effects are involved, cancellation may not undo what already happened, so report the true state.

A fluent plan is not successful action. Verify the source of observations and handle tool errors truthfully instead of looping until a success story is invented.

## 5. Choosing between a workflow and an agent

Fixed thermostat rules can be a plain program with no LLM. An LLM suits natural-language goals, fuzzy conditions and cross-tool choices; involving it does not mean handing every safety control to its judgement.

The harness can reject a model proposal. Permissions, sandboxes, scope limits and human confirmation need their own enforcement points; “please be careful” is not a control system.

## 6. A2A and cross-agent tasks

PDF pages 124–127 introduce Agent2Agent: an AgentCard describes the address, capabilities and skills, and tasks are coordinated through execution and cancellation interfaces. The AgentSkill in the diagram is a capability description, not the SKILL.md directory of a coding agent.

MCP mainly connects tool and data capabilities while A2A mainly organises task communication between agents; they coexist, and specific protocol fields must be checked against the implementation version. Standard messages do not make a remote party trustworthy, nor do they widen the caller’s authorisation.

## Check your understanding

<details><summary>If the device reports “setpoint 70°F”, has the room reached 70°F?</summary><p>No. Setpoint and measured sensor value are different states; the latter needs time and measurement.</p></details>
<details><summary>Must the loop show every step of internal reasoning?</summary><p>No. A concise plan, tool calls, evidence and conclusions can be logged without exposing a hidden reasoning chain.</p></details>

Source: PDF pages 102–127; the temperature-difference conversion, authorisation and stopping conditions are teaching and engineering additions.
