---
slug: l6-orchestration
title: "Multi-agent orchestration: division of labour is not a free capability multiplier"
collection: cme295
lecture: 6
lang: en
description: "Compare supervisor-to-subtask dispatch and teammate messaging, and explain context cost, parallel dependencies, conflict isolation, risk and independent acceptance."
order: 120
kind: lesson
status: published
tags: [Subagents, Agent teams, Orchestration, Safety]
---

## 1. Two pictures from the course

PDF pages 147–149: a main agent dispatches independent tasks and sub-agents report back; or several teammates communicate around a shared task list.

The slides’ “subagents do not communicate” means the sub-agents in that diagram have no direct channel, not that every implementation forbids messages. An agent team also does not mean bypassing the controller, permissions or budget.

## 2. Which tasks suit splitting?

Retrieval, testing and analysis with clear boundaries, independent acceptance and explicit inputs and outputs. Whether a task needs strong reasoning and whether it can be delegated are separate dimensions; sub-tasks are not all “simple work”.

Dependent steps pass in order; only independent tasks run in parallel. Several writers in one workspace easily overwrite each other, so use isolated workspaces or branches, one clear write owner, and controlled merges.

## 3. Latency and cost are computed separately

Teaching example: two independent tasks of 4 s and 6 s with 1 s of scheduling and aggregation, about 11 s serially and an ideal 7 s in parallel. The work itself still exists, and duplicated background, communication and retries can raise total tokens.

If the main task and 3 sub-tasks each repeat 1000 tokens of background, those copies alone are 4000 tokens of metered input; it is not one shared “free context”. Caching and actual billing may change the cost again.

When tasks are not independent, the model is queueing, or devices contend for resources, the ideal max-time formula fails. Faster in parallel does not mean cheaper or more correct.

## 4. How are results merged?

Require sources, operation logs, actual tests, unresolved issues and explicit artifacts; the controller verifies and then merges. If several agents use the same model and the same wrong material, their errors can be highly correlated, so “three votes agree” is not independent factual evidence.

Tool returns, sub-agent reports and shared messages are all data to be checked; none of it automatically becomes authorisation. After a cancellation, confirm the state of in-flight execution and artifacts.

## 5. How to read progress and vulnerability claims

PDF pages 150–151 show research progress and safety-incident leads. News cases are not general capability evaluations, and vulnerability demos should be checked for environment, permissions and reproduction conditions; unverified dates or product incidents are not written here as current facts.

Defensive priorities are least privilege, network and file isolation, treating external content as untrusted, confirmation for sensitive actions, audit and stopping. “Agents cooperating” must not let any member obtain another’s credentials or let external messages trigger arbitrary commands.

## 6. A minimal system is often better

First check whether a single agent with clear tools suffices, then consider splitting. If a fixed pipeline can complete the task, prefer fewer states and less communication. Adding members should bring measurable benefit; the count itself is not a quality metric.

## Check your understanding

<details><summary>If two agents edit the same file simultaneously, is it necessarily faster?</summary><p>It can cause overwrites, conflicts and duplicated rework; isolation or a single clear owner is usually needed.</p></details>
<details><summary>Can three consistent reports replace citation checking?</summary><p>No. They may share a wrong source or model bias, so independent evidence and checks are needed.</p></details>

Source: PDF pages 147–152; latency, context duplication and collaboration control are teaching additions. No real sub-agent was started and no remote operation was performed.
