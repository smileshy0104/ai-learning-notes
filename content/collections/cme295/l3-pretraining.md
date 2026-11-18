---
slug: l3-pretraining
title: 预训练：Teacher forcing、交叉熵与 BPB
collection: cme295
lecture: 3
description: 从序列似然推导平均下一词损失，通过输入目标错位解释并行训练，并换算 bits per byte。
order: 20
kind: lesson
status: published
tags: [Pretraining, Teacher forcing, Cross-entropy, BPB]
---

## 1. 预训练究竟学什么？

PDF 第 8–22 页。预训练用大量文本和代码建立可复用的语言模型，而不是为每个任务都从头训练一套参数。

**下一 token 预测**要求：给定已有前缀，给真实的下一 token 分配高概率。语法、常识、代码模式等可能在完成这个任务时被学到，但不等于模型获取了一套可保证真实、完整的知识库。

## 2. Teacher forcing 是什么？

**定义：** 训练时使用数据中真实的前一个 token 作为后续预测的输入，即使模型刚才预测错了，也不把那个错误预测接回去。

```text
原始数据：[BOS] A teddy bear [EOS]
网络输入：[BOS] A teddy bear
训练目标：  A  teddy bear [EOS]
```

例如 A 后模型更偏向 cute，但训练文本是 teddy。后续位置仍输入真实的 teddy，教模型在这个真实前缀上预测 bear。

<div class="flow"><span class="chip">真实前缀</span><span class="arrow">→ 固定本次参数前向 →</span><span class="chip">各位置的词表概率</span><span class="arrow">→ 对照下一 token →</span><span class="chip">损失、反向、更新</span></div>

“forcing”不表示跳过学习或直接把正确答案写入权重，模型仍然要根据损失算梯度。

## 3. 全句已经给进去了，为什么没偷看答案？

因果掩码确保位置 t 的表示只能读取位置 ≤t，再用它预测位置 t+1。因此可以一次输入整条训练序列、并行计算多个位置的损失。

| 当前输入位置 | 可读取 | 预测目标 |
| --- | --- | --- |
| [BOS] | [BOS] | A |
| A | [BOS], A | teddy |
| teddy | [BOS], A, teddy | bear |
| bear | [BOS], A, teddy, bear | [EOS] |

**训练／推理差异：** 推理把模型自己选出的 token 接回输入，训练主要使用真实前缀。这个分布差异常称为 exposure bias 的相关问题，后续基于模型采样的训练试图减少某些失配，但并不自动消除所有误差。

## 4. 交叉熵从哪里来？

设序列为 x₁,…,x_T，模型参数为 θ。

```text
序列概率：Pθ(x₁,…,x_T)=∏ₜ Pθ(xₜ | x_<t)
最大化概率 ↔ 最大化 Σₜ ln Pθ(xₜ | x_<t)
训练常用最小化：L_CE=−(1/T) Σₜ ln Pθ(xₜ | x_<t)
```

对数把连乘变连加，避免长串小概率连乘下溢；加负号是从最大化转成最小化；除以活动 token 数控制规模。

实际计算用稳定的 log-softmax 或等价实现，不是先真的算出可能下溢的整句乘积再取 log。

### 手算一个序列

假设给四个真实目标 token 的条件概率是 `[0.5,0.25,0.8,0.5]`：

```text
序列概率=0.5×0.25×0.8×0.5=0.05
负对数似然总量=−ln(0.05)≈2.9957 nats
平均损失=2.9957/4≈0.7489 nats/token
```

这些数字来自不同前缀下的目标项，不要求它们彼此相加为 1；每个位置自己的完整词表分布才应归一化。

## 5. Bits Per Byte：换一个分母比较

不同 tokenizer 把同一段文本切成不同数量的 token，直接比较 nats/token 容易混淆。

```text
BPB = L_CE × T / B / ln(2)
T：计分 token 数；B：对应原始文本的 byte 数
```

若上例覆盖 10 bytes：`BPB≈0.7489×4/10/ln2≈0.4322 bits/byte`。

若另一个 tokenizer 用 2 个 token 表示同样文本，且整段负对数似然恰好也是 2.9957：它的平均 token 损失是 1.4979，但 BPB 仍约 0.4322。这里特意固定整段似然，只展示归一化差异。

**边界：** BPB 统一计量单位，不让模型分布、语料预处理、UTF-8 字节口径或评测边界自动相同。它也不是“每个 token 真正占多少存储位”的直接实测。

## 6. 什么时候算哪些位置？

padding 等位置通常不参与训练目标，平均分母是有效计分数。文档边界、BOS/EOS 和跨文档注意力是否隔离，取决于训练设置。

下一节会讨论语料怎样拼接或装箱；SFT 则进一步规定回答部分的 loss mask，详见 [SFT](l3-sft.html)。

## 理解检查

<details><summary>把整句放进训练输入，是不是每个位置都能看到未来？</summary><p>不是。因果掩码限制每个位置的可见范围，目标通过错开一位构造。并行的是不同位置的计算，不是取消因果条件。</p></details>
<details><summary>为什么模型 A 的 CE/token 更低，不一定更会压缩同一文本？</summary><p>tokenizer 的粒度不同会改变分母。应控制数据与评分口径，再看整段负对数似然或按字节归一化指标。</p></details>

来源：PDF 第 8–22 页；第 21、22 页公式已视觉核对。概率、字节与分词对比为教学构造，不是真实模型测量。
