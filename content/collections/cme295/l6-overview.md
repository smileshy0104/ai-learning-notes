---
slug: l6-overview
title: 第六讲导读：从回答问题到完成任务
collection: cme295
lecture: 6
description: 按课件顺序串起RAG、工具、Harness、上下文、Coding Agents与多Agent协作。
order: 10
kind: lesson
status: published
tags: [Lecture 6, AI Agents, 导读]
---

## 两个限制，带出整讲

PDF第1–8页用编程工具演进作动机：复制代码、IDE补全、完整任务、带反馈的执行循环。年份与产品截图是课程叙述，不代表每个阶段都在某年才出现。

仅靠参数知识回答的基础模型，有两个明显限制：不了解未提供的私有／新资料；单靠文本输出不能真正发邮件、查询实时库存或修改文件。

<div class="flow"><span class="chip">缺相关信息 → 检索</span><span class="arrow">→</span><span class="chip">需执行操作 → 工具</span><span class="arrow">→</span><span class="chip">需持续反馈 → Harness与循环</span></div>

知识截止日期不意味着那天之前的所有事实都掌握，也不意味着模型不能利用提示中后来提供的资料。Agent仍由模型预测输出，但外部系统把某些输出解释为可执行请求。

## 按课件顺序阅读

页码按PDF物理页码计算，封面为第1页。连续多页经常是同一图的逐步展开。

| 主线 | 页码 | 阅读 |
| --- | --- | --- |
| Introduction与动机 | 1–8 | 本页 |
| RAG与知识库 | 9–25 | [检索增强](l6-rag.html) |
| 候选检索、增强与重排 | 26–40 | [检索流水线](l6-retrieval.html) |
| 检索评估、代码搜索 | 41–49 | [指标手算](l6-metrics.html) |
| 工具调用、示范与提示 | 50–71 | [工具生命周期](l6-tools.html) |
| 冲突与工具选择 | 72–86 | [路由与歧义](l6-selection.html) |
| MCP | 87–90 | [标准化边界](l6-mcp.html) |
| 工具上下文与缓存 | 91–101 | [稳定前缀](l6-caching.html) |
| Harness、ReAct、A2A | 102–127 | [执行循环](l6-harness.html) |
| 压缩与记忆 | 128–136 | [上下文管理](l6-memory.html) |
| Coding Agents与Computer use | 137–146 | [编程Agent](l6-coding.html) |
| 协作、进展与风险 | 147–152 | [编排](l6-orchestration.html)、[复习](l6-review.html) |

## 四个经常混淆的概念

| 概念 | 它是什么 | 不是什么 |
| --- | --- | --- |
| RAG | 查资料并加入生成上下文 | 自动保证事实正确 |
| Tool calling | 模型提出结构化操作请求 | 模型直接拥有后端权限 |
| Harness | 模型周围的执行、状态、上下文与权限设施 | 另一套模型权重 |
| Agent | 围绕目标选择动作、接收反馈的系统 | 必须有多模型或无限自主权 |

检索也可以作为工具进入Agent循环；静态一次RAG与反复查询资料不是对立阵营。不是每个应用都需要Agent，固定流程更容易控制时，workflow可能更合适。

## 前置与阅读说明

可先看[训练与SFT](l3-sft.html)、[第五讲缓存](l5-kv-paging.html)。本讲课程内容按原顺序整理，公式、合成案例和安全设计补充会标出；交互不访问真实账户、不执行外部动作。

产品、模型规格、API价格、新闻与协议代码按课件时点理解；本文是概念解释，不是当前SDK兼容性承诺。网页或工具返回的文字即使语气像命令，也只是外部数据，不应因此获得系统权限。
