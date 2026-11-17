---
slug: l2-model-families
title: 模型家族：BERT、GPT 与三类架构
collection: cme295
lecture: 2
description: 先解释编码器与解码器的使用目标，再通过 MLM、NSP 和下一词预测理解训练区别。
order: 20
kind: lesson
status: published
tags: [BERT, GPT, MLM, NSP, 预训练]
---

## 1. 为什么先讲架构家族？

对应 PDF 第 6–21 页。原始 Transformer 面向“源句 → 译文”。如果只想分类，是否还需要生成器？如果想自由续写，是否还需要独立编码器？这两个问题分别引出 encoder-only 与 decoder-only。

| 家族 | 输入位置的信息范围 | 输出方式 | 例子 |
| --- | --- | --- | --- |
| Encoder-only | 通常双向读取有效输入 | 上下文向量，接任务输出层 | BERT |
| Decoder-only | 标准因果掩码，当前位置读自身及之前 | 预测后续 token | GPT 类 |
| Encoder–Decoder | 编码器双向；解码器因果并读取编码器 | 目标序列逐步生成 | 原始 Transformer、T5 |

它们不是“理解、生成能力”的绝对排名。生成式模型也能做分类；标准 BERT 的训练与接口不直接采用 GPT 式逐 token 生成，但不能因此断言任何 encoder-only 结构都不能生成。

## 2. BERT：先学上下文表示，再适配任务

BERT = Bidirectional Encoder Representations from Transformers，课件介绍 2018 年论文。

**定义：**利用 Transformer 编码器，让一个位置同时参考左右文，得到上下文表示。句首常加入 `[CLS]`，句子边界使用 `[SEP]`。

**为什么需要：**“bank”在河岸和银行语境下需要不同表示。仅查固定词向量表不能直接区分当前含义；编码器使用整段上下文更新表示。

<div class="flow"><span class="chip">[CLS] 这只熊 很 可爱 [SEP]</span><span class="arrow">→ 编码器 →</span><span class="chip">各位置的上下文向量</span><span class="arrow">→ [CLS] 接分类层 →</span><span class="chip">正面 / 负面</span></div>

`[CLS]` 不是天然已经包含准确摘要的魔法符号，它的用途来自训练与下游任务设计。序列标注可以使用每个 token 的向量，不必都挤进 `[CLS]`。

## 3. MLM：遮住一部分，再预测原词

MLM = Masked Language Modeling。它是预训练代理任务：目标不是最终情感分类，而是通过恢复被破坏的词学习语言统计与上下文。

```text
原句：[CLS] A cute teddy bear is reading [SEP]
输入：[CLS] A [MASK] teddy bear is [MASK] [SEP]
目标：          cute                   reading
```

只在被选中用于 MLM 的位置计算恢复目标的损失。例如给 cute 的概率 0.6、reading 的概率 0.5：

```text
L = [−ln(0.6) − ln(0.5)] / 2 ≈ 0.602
```

**补充原论文细节：**经典 BERT 选择约 15% 的 token 作为预测位置，其中约 80% 换 `[MASK]`、10% 换随机 token、10% 保持原样。不是所有被选位置都显示 `[MASK]`，这是缓解训练与实际输入差异的一部分。课件只概括了破坏与恢复过程。

## 4. NSP：两个句子原本相邻吗？

NSP = Next Sentence Prediction。经典 BERT 使用句对输入，让 `[CLS]` 对应表示预测两句是否为文档中的连续句子。

| 输入句对 | 目标（教学构造） |
| --- | --- |
| A：我拿出一本书。B：然后开始阅读。 | 连续 |
| A：我拿出一本书。B：火星是太阳系行星。 | 随机配对 |

注意任务的“连续”标签来自构造数据，不是简单判断两句话看起来是否语义通顺。它也不是预测第二句的每个 token。后续 BERT 变体可能不用 NSP，不能把它当作所有编码器的必要组件。

## 5. 预训练与微调分别改变什么？

- 预训练：用大量文本建立可复用表示，监督信号从文本构造。
- 微调：用任务数据训练输出层，并通常更新全部或部分编码器参数。
- 特征提取：也可冻结编码器，仅训练任务层，这是补充的使用方式。

例子：预训练已学会文本规律；再输入带“正面／负面”标签的评论，学习“哪些表示对应哪一类”。预训练成本与任务微调成本不同，且不保证任何任务只需极少数据。

## 6. GPT：把任务写成下一 token 预测

GPT = Generative Pre-trained Transformer。现代标准 decoder-only 主干没有独立编码器，也移除了原始解码器中的编码器—解码器交叉注意力。

```text
输入：[BOS] A cute teddy bear is
预测：reading / sleeping / ... 的概率
选出 reading 后追加，再预测下一个 token
```

训练通常将目标错开一位：

| 输入位置 | 对应预测目标 |
| --- | --- |
| [BOS] | A |
| A | cute |
| cute | teddy |
| … | … |

模型输出的序列概率可用链式法则写成：

```text
P(x₁,…,xₙ) = ∏ₜ P(xₜ | x₁,…,xₜ₋₁)
```

把分类写成生成任务：`判断情感：这只熊真可爱。情感是：` → 输出“正面”。**不需要每次换任务都重新训练**是使用上的优势，不等于所有 GPT 历史版本都无需微调，也不保证未经指令训练的基座能可靠遵守任何请求。

## 7. 为什么两个能生成的家族仍有区别？

Encoder–Decoder 将输入完整编码，再用另一套因果栈生成输出；Decoder-only 把输入提示与输出接在一条序列中。后者在标准因果注意力下，提示中较早位置看不到后面的提示 token；但生成位置可以读取整个已提供提示。

选择架构还取决于任务、数据与部署，不能把 decoder-only 的普及推成“其他家族已经消失”。

## 理解检查

<details><summary>MLM 与因果下一词预测有什么不同？</summary><p>MLM 从被破坏的输入恢复被选中的位置，常用左右上下文；因果语言模型从左侧上下文预测后续 token。差别包括可见范围、输入构造和损失位置。</p></details>
<details><summary>去掉编码器，交叉注意力应该怎么办？</summary><p>标准 decoder-only 也去掉读取编码器输出的交叉注意力。仅保留因果自注意力、FFN 和相关残差归一化组件，不是把缺失的编码器输出设为零。</p></details>

来源：PDF 第 6–21、29–34 页及对应字幕；MLM 的 15%/80-10-10 为原论文背景补充，数值损失为教学示例。
