---
slug: l6-review
title: "Lecture 6 review: checking information, action and control in layers"
collection: cme295
lecture: 6
lang: en
description: "Recap the distinct responsibilities of RAG, tools, protocols, harnesses, memory and collaboration through an end-to-end flow and worked self-test answers."
order: 130
kind: lesson
status: published
tags: [Review, AI Agents, Evaluation]
---

## 1. The lesson in one flow

<div class="flow"><span class="chip">user goal and constraints</span><span class="arrow">→</span><span class="chip">retrieve or clarify</span><span class="arrow">→</span><span class="chip">model proposes an action</span><span class="arrow">→ authorised execution →</span><span class="chip">observe, verify and stop</span></div>

What runs through the lecture is not “the model can call a function”, but where information comes from, who approves the action, who verifies the result and how state is retained.

## 2. Accept each layer separately

| Layer | What to check | What cannot substitute for it |
| --- | --- | --- |
| candidate retrieval | relevant evidence coverage and permissions | a fluent-looking generated answer |
| reranking | top-rank relevance and metrics | a high cosine score |
| generation | faithfulness, citations and stated unknowns | one RAG chunk being hit |
| tools | name, arguments, permission, errors and side effects | valid JSON |
| harness | budget, stopping, confirmation, audit and isolation | the model saying it is safe |
| memory | source, freshness, scope, correctable and deletable | a verbal “I noted it” |
| multiple agents | division of work, independent evidence, write isolation | more agents, or a majority vote |

## 3. Numbers and concepts self-test

<details><summary>R=3, top-3 relevance [0,1,1] — what are Precision, Recall and RR?</summary><p>Precision=2/3, Recall=2/3, RR=1/2. IDCG uses all three truly relevant items, and NDCG is about 0.53072.</p></details>
<details><summary>After reranking to [1,1,0], which metrics change?</summary><p>Precision and Recall remain 2/3; RR becomes 1 and NDCG about 0.76536. Relevant items moved up, but the third was not found.</p></details>
<details><summary>Can HyDE-generated content be used as source evidence?</summary><p>No. It is a retrieval bridge; real material must confirm the answer afterwards.</p></details>
<details><summary>If the tool name, arguments and schema are all correct, why can a call still be refused?</summary><p>The user or the current task may lack permission for that operation, or confirmation, safety scope and budget conditions may not be satisfied.</p></details>
<details><summary>Among MCP client, server and host, which provides the user interface?</summary><p>Usually the host faces the user and manages connections, the client talks to the server inside the host, and the server exposes capabilities — not necessarily an autonomous agent.</p></details>
<details><summary>What happens to prefix caching if dynamic time comes before fixed tools?</summary><p>When the time changes, the common prefix stops at the change point, and identical tool definitions after it do not automatically hit.</p></details>
<details><summary>What is the Celsius difference between 70°F and 65°F?</summary><p>5×5/9≈2.778°C; do not subtract 32 again. A setpoint change also does not mean the air instantly reaches the target.</p></details>
<details><summary>If a sliding window drops an early “do not buy”, is the constraint gone?</summary><p>No. That is a context-management failure, not a user retraction; the execution side should keep the authorisation boundary independently.</p></details>
<details><summary>Are AGENTS.md, SKILL.md and an A2A AgentSkill the same concept?</summary><p>No. They focus on project rules, a task-procedure resource bundle and a protocol capability description respectively; formats and loading semantics depend on the implementation.</p></details>

## 4. Subtitle and verbal simplifications

| Wording | Correct reading |
| --- | --- |
| built / build about bills | billed |
| time to leave | time to live, TTL |
| tension relationships | attention relationships |
| “knowledge only up to the cutoff date” | parameter knowledge is limited and incomplete; a prompt can supply new material |
| “RAG is static, only tools are real-time” | that is the course example; real retrieval can also hit live sources |
| “bigger encoders / more dimensions are better” | evaluate against the task; monotonic improvement is not guaranteed |
| “temperature 0 guarantees determinism and correctness” | neither is guaranteed; ambiguity can still be interpreted wrongly consistently |
| “all approvals are already done by small models” | that describes practice in the slides, not every system today |
| “code execution is not a tool” | it can be a tool interface; a different abstraction layer does not change the risk |
| “sub-agents do not communicate” | the diagram’s sub-agents have no direct link, not a universal definition |

## 5. Sources and next steps

The lecture thread includes RAG (Lewis et al., 2020), Sentence-BERT (2019), HyDE, contextual retrieval, cross-encoders, ReAct, MCP, A2A and coding-agent architecture examples. Extra numbers and permission designs in this note are explicitly teaching or engineering additions.

This lecture installs no real MCP service, operates no account or device, and reproduces no attack steps. Models, prices, software capabilities and news in the screenshots remain point-in-time material and are not live facts or a deployment guide. Understanding still needs confirmation through self-test and discussion; finishing the notes does not by itself mark a topic as mastered.
