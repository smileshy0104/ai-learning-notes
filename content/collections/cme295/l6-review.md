---
slug: l6-review
title: 第六讲复习：信息、行动与控制分层检查
collection: cme295
lecture: 6
description: 以端到端流程和带解析自测回顾RAG、工具、协议、Harness、记忆与协作的不同责任。
order: 130
kind: lesson
status: published
tags: [复习, AI Agents, Evaluation]
---

## 1. 一张流程图回顾

<div class="flow"><span class="chip">用户目标与约束</span><span class="arrow">→</span><span class="chip">检索／澄清</span><span class="arrow">→</span><span class="chip">模型提议动作</span><span class="arrow">→ 授权执行 →</span><span class="chip">观察、验证与停止</span></div>

贯穿全讲的关键不是“模型会调用函数”这一点，而是信息从哪里来、动作由谁批准、结果由谁验证、状态怎样保留。

## 2. 各层分别验收

| 层 | 应检查 | 不能只用什么代替 |
| --- | --- | --- |
| 候选检索 | 相关证据覆盖与权限 | 生成回答看起来流畅 |
| 重排 | 前列相关性与指标 | 余弦分数很高 |
| 生成 | 证据忠实、引用与未知边界 | RAG命中一个chunk |
| 工具 | 名称、参数、权限、错误与副作用 | JSON能解析 |
| Harness | 预算、停止、确认、审计与隔离 | 模型说自己会安全 |
| 记忆 | 来源、时效、范围、可更正／删除 | 口头说“我记住了” |
| 多Agent | 分工、独立证据、写入隔离 | 数量多／多数票 |

## 3. 数字与概念自测

<details><summary>R=3，top3相关性[0,1,1]，Precision、Recall、RR是多少？</summary><p>Precision=2/3，Recall=2/3，RR=1/2。IDCG使用三个真相关项，NDCG约0.53072。</p></details>
<details><summary>重排成[1,1,0]后，哪个指标变化？</summary><p>Precision与Recall仍2/3；RR变1，NDCG约0.76536。相关项前移，但没找全第三个。</p></details>
<details><summary>HyDE生成的内容能否用作来源证据？</summary><p>不能，它是检索桥梁，后续要用真实资料确认。</p></details>
<details><summary>工具名、参数、schema都正确，为什么仍可能拒绝？</summary><p>用户或当前任务可能没有该操作权限，或尚未满足确认、安全范围和预算等条件。</p></details>
<details><summary>MCP Client、Server与Host谁直接提供用户界面？</summary><p>通常Host面向用户并管理连接，Client在Host内与Server通信；Server暴露能力，不一定是自主Agent。</p></details>
<details><summary>动态时间在固定工具之前，会怎样影响前缀缓存？</summary><p>如果时间发生变化，共同前缀在变化点停止，后面的相同工具定义不自动命中。</p></details>
<details><summary>70°F减65°F是多少摄氏温差？</summary><p>5×5/9≈2.778°C；不能再减32。设定值变更也不代表实际空气立刻达到目标。</p></details>
<details><summary>滑窗丢了早期“禁止购买”，限制就消失了吗？</summary><p>没有。这是上下文管理失败，不是用户撤回限制，执行侧应独立保持授权边界。</p></details>
<details><summary>AGENTS.md、SKILL.md、A2A AgentSkill是同一概念吗？</summary><p>不是。分别侧重项目规则、任务流程资源包、Agent协议能力描述；具体格式与加载语义依实现。</p></details>

## 4. 字幕和口头简化

| 表述 | 正确理解 |
| --- | --- |
| built／build谈账单 | billed，计费 |
| time to leave | time to live，TTL |
| tension relationships | attention relationships |
| 知识只到截止日 | 参数知识有限且不完整，提示可提供新资料 |
| RAG只能静态、工具才实时 | 是课程例子，实际检索也能接实时源 |
| 编码器越大／维度越大越好 | 需要匹配任务评估，不保证单调改善 |
| 温度0保证确定与正确 | 两者都不保证，歧义仍可能稳定解释错 |
| 所有审批已由小模型完成 | 是课件实践描述，不是所有系统现状 |
| Code执行不算tool | 可作为工具接口，抽象层不同不改变风险 |
| 子Agent没有通信 | 课件图的子Agent间无直连，不是普遍定义 |

## 5. 来源与下一步

课件主线包括RAG（Lewis等，2020）、Sentence-BERT（2019）、HyDE、Contextual Retrieval、Cross-encoder、ReAct、MCP、A2A及编程Agent架构实例。文中额外数字与权限设计明确作为教学／工程补充。

本讲不安装真实MCP服务、不操控账户或设备、不复现攻击步骤。课程截图里的模型、价格、软件能力与新闻保留为时点材料，不能当实时事实或部署指南。学习理解仍需由自测与讨论确认，不因完成笔记就自动标记掌握。
