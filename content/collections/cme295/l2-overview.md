---
slug: l2-overview
title: 第二讲导读：从 Transformer 到 LLM
collection: cme295
lecture: 2
description: 回顾第一讲，建立模型家族、规模、MoE、架构优化、解码与提示的完整路线。
order: 10
kind: lesson
status: published
tags: [Lecture 2, LLM, 学习路线]
---

## 这一讲究竟回答什么？

第一讲解释了原始 Transformer 怎样完成翻译。第二讲追问：**怎样把这种架构变成一个可扩展、能生成文本、能够实际部署的大语言模型？**

学习时可以把问题拆成三层：网络如何设计；训练资源怎样分配；输出时怎样选择 token。模型生成的概率与最终选出的文字之间，还有一整套解码策略。

## 先用一句话回顾第一讲

文字被分成 token，再查表变成向量。注意力让不同位置交换信息，FFN 逐位置加工特征，残差与归一化帮助深层训练。原始翻译模型包含编码器和解码器。

```text
文字 → token ID → embedding + 位置
     → 注意力 + FFN + 残差/归一化（重复多层）
     → 上下文表示 → 词表分数 → 概率
```

如果“分数为什么还不是概率”“梯度和参数更新有什么区别”仍不清楚，先读 [第一讲基础工具箱](basics.html)。

## 六条主线与 PDF 页码

页码指 PDF 物理页码，封面算第 1 页。连续页常是同一张图的逐步展开。

| 内容 | PDF 页码 | 要回答的问题 | 对应阅读 |
| --- | --- | --- | --- |
| 回顾与目录 | 1–5 | 第一讲怎样连接到今天？ | 本页 |
| Transformer model families | 6–21 | 只保留编码器或解码器会怎样？ | [BERT 与 GPT](l2-model-families.html) |
| Scaling laws | 22–34 | 参数、数据与算力怎样平衡？ | [缩放法则](l2-scaling.html) |
| Expert routing | 35–50 | 每次计算必须执行所有参数吗？ | [MoE](l2-moe.html) |
| Architecture optimizations | 51–88 | 位置、注意力和归一化怎样改进？ | [位置机制](l2-position.html)、[注意力与缓存](l2-attention-cache.html)、[归一化](l2-normalization.html) |
| Decoding strategies | 89–123 | 有了概率后怎么选 token？ | [解码策略](l2-decoding.html) |
| Prompting and reasoning | 124–137 | 怎样组织上下文与示例？ | [上下文、提示与推理](l2-context-reasoning.html) |
| 结束与复习 | 138 | 能否把概念重新串起来？ | [总复习](l2-review.html) |

## 用同一个例子贯穿这一讲

仍然围绕 “A cute teddy bear is reading.”：

- BERT：遮住 cute，根据两侧词预测被遮内容；或者用整句表示判断情感。
- GPT：给 “A cute teddy bear is”，为下一个 token 分配概率。
- MoE：每个 token 在某一层进入不同的少数 FFN 专家。
- RoPE：让查询和键的匹配包含相对位置。
- KV Cache：生成下一个词时复用前文的键和值。
- 解码：在 reading、sleeping 等候选中，根据温度和采样规则选择。
- 提示：让输出满足指定格式、参考明确事实，而不是盲目塞满上下文。

这些例子说明组件职责，不声称真实模型必然按照人类语义把某个 token 路由到“语法专家”或“数学专家”。

## 阅读说明

内容根据第二讲课件与字幕整理，包含教学补充。模型榜单与产品规格以课件日期为准，术语校正见[总复习](l2-review.html)。

## 读完后应该能做什么？

能解释三类架构的注意力范围；算清一个 top-k 路由或温度 softmax；区分总参数与激活参数、FLOPs 与 FLOP/s；说明 GQA 为什么能节省 KV 缓存；理解格式约束和事实正确是不同的保证。
