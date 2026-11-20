---
slug: l5-overview
title: 第五讲导读：放得下，也跑得快
collection: cme295
lecture: 5
description: 按课件顺序理解LLM系统：GPU、FlashAttention、分布式训练与推理优化。
order: 10
kind: lesson
status: published
tags: [Lecture 5, LLM Systems, 导读]
---

## 这一讲为什么重要？

前四讲解释模型怎么算、怎样训练。本讲追问：当参数和数据增长到真实规模，这些计算怎样在有限硬件上运行？

有两条贯穿全讲的问题：**How do we make it fit?**（放得下）和 **How do we make it fast?**（跑得快）。

<div class="flow"><span class="chip">单GPU：减少搬运</span><span class="arrow">→</span><span class="chip">多GPU：分摊存储与计算</span><span class="arrow">→</span><span class="chip">推理：缓存、压缩与并行验证</span></div>

更多算术运算不一定更慢，更少参数也不一定能降低用户看到的延迟。系统优化要同时看计算、内存、通信、排队和任务输出长度。

## 按课件顺序阅读

所有页码均为PDF物理页码，封面计为第1页。连续页常是同一幅动画图的展开。

| 主线 | 页码 | 文章 |
| --- | --- | --- |
| Introduction／动机与GPU | 1–12 | 本页、[硬件与单位](l5-hardware.html) |
| FlashAttention | 13–62 | [在线Softmax与分块](l5-flash.html) |
| 训练内存 | 63–70 | [训练为什么不只存权重](l5-training-memory.html) |
| Data Parallelism与ZeRO | 71–74 | [数据并行与分片](l5-zero.html) |
| TP／PP／CP／EP与讨论 | 75–88 | [模型并行](l5-parallel.html) |
| 推理延迟、成本与Roofline | 89–102 | [Prefill、Decode与瓶颈](l5-latency-roofline.html) |
| KV Cache、分页 | 103–120 | [缓存与PagedAttention](l5-kv-paging.html) |
| KV头共享与低维表示 | 121–137 | [GQA与MLA](l5-gqa-mla.html) |
| Speculative decoding | 138–147 | [推测解码及分布证明](l5-speculative.html) |
| 蒸馏、MTP | 148–151 | [多Token预测](l5-mtp.html) |
| Discussion／总结 | 152–156 | [复习与自测](l5-review.html) |

## 先区分四种“优化”

| 类型 | 例子 | 是否改变模型定义或分布？ |
| --- | --- | --- |
| 等价计算重排 | FlashAttention | 数学上同一注意力，有限精度有舍入差异 |
| 存储／执行调度 | ZeRO、PagedAttention | 目标通常不变，但并行归约可改变舍入顺序 |
| 架构或表示改变 | GQA、MLA、MTP | 需要相应设计与训练，不是随便替换现有权重 |
| 有校正的采样加速 | 推测解码 | 满足算法条件时保持目标采样分布 |

不能因为都叫“加速”，就把它们说成完全同一种无损技术。

## 必要前置知识

- [自注意力](attention.html)：Q、K、V及加权求和。
- [第二讲注意力与缓存](l2-attention-cache.html)：GQA与KV大小的初步概念。
- [第三讲训练流程](l3-overview.html)：前向、反向和参数更新。
- [第四讲蒸馏](l4-opd.html)：对照本讲蒸馏时注意KL方向不同。

## 阅读说明

内容依据第五讲PDF与英文字幕整理；额外的数值、维度、Roofline估算和推测解码例子均为教学构造，不是真实GPU跑分或真实模型输出。课件中的硬件、价格、模型和FlashAttention版本信息按资料日期理解，不作为当前产品清单。
