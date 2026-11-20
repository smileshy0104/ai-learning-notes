---
slug: l3-overview
title: 第三讲导读：LLM 是怎样训练出来的？
collection: cme295
lecture: 3
description: 按课程顺序连接预训练、监督微调、偏好优化、推理训练与蒸馏，并明确每一步的数据和更新对象。
order: 10
kind: lesson
status: published
tags: [Lecture 3, LLM training, 学习路线]
---

## 这一讲的核心问题

前两讲讲“网络怎样计算、怎样生成”。第三讲追问：**这些参数怎么从数据学来，又怎样把续写模型变成符合任务目标的助手？**

不必把所有训练名称看成互不相干的新架构。很多阶段仍然使用同一个 Transformer 主干，变的是数据、目标函数、监督位置与采样方式。

<div class="training-stages"><div><strong>学习基础规律</strong>预训练：从大规模文本、代码中学习下一 token 分布。</div><div><strong>适配任务与行为</strong>SFT：示范期望回答；偏好优化：比较不同回答。</div><div><strong>提高解决问题的表现</strong>可验证奖励、策略优化与蒸馏：利用采样、评价和教师信号继续训练。</div></div>

## 第一、第二讲需要带来的知识

- [前向、梯度与参数更新](basics.html)：前向得到预测，反向计算梯度，优化器才执行更新。
- [decoder-only 与因果预测](l2-model-families.html)：训练可以同时计算各位置，推理通常逐步生成。
- [规模与训练预算](l2-scaling.html)：参数、数据、算力需要配套，经验比率不是普遍定律。
- [上下文与生成](l2-context-reasoning.html)：提示、模型参数和解码设置属于不同层面。

本讲的例子是机制说明，不使用真实 API 或 GPU 训练；不能把手算玩具模型的效果等同于一次真实微调实验。

## 按 PDF 大纲学习

物理页码包含封面。连续页面往往是同一幅图的逐步展开。

| 课件部分 | PDF 页码 | 本站对应内容 |
| --- | --- | --- |
| 回顾、目录、训练范式 | 1–10 | 本页 |
| Pretraining：下一词目标、Teacher forcing、CE、BPB | 11–22 | [预训练目标](l3-pretraining.html) |
| 数据、Mid-training、长上下文与限制 | 23–40 | [数据与长上下文](l3-data.html) |
| Supervised finetuning | 41–52 | [SFT](l3-sft.html) |
| 参数高效微调 | 53–56 | [LoRA](l3-lora.html) |
| Preference tuning：数据与采集 | 57–69 | [偏好数据](l3-preferences.html) |
| Reward modeling 与 RLHF | 70–86 | [奖励模型与 RLHF](l3-rlhf.html) |
| DPO 与方法比较 | 87–90 | [DPO](l3-dpo.html) |
| Reasoning：验证、组内比较、GRPO 直觉 | 91–124 | [推理训练](l3-reasoning.html) |
| Distillation：On-policy 与变体 | 125–131 | [蒸馏](l3-distillation.html) |
| Discussion：完整训练案例与风险 | 132–164 | [端到端训练案例](l3-end-to-end.html) |
| 结束与自测 | 165 | [复习与术语校正](l3-review.html) |

## 用“泰迪熊能机洗吗”贯穿全讲

课件用不同训练阶段的回答说明行为变化：

1. 基座可能只是续写一段关于材料的描述。
2. SFT 后更像直接回答问题。
3. 偏好优化后可能更符合期待的语气与帮助方式。
4. 推理训练用于处理多条件任务，例如哪只熊可在指定时间完成清洗与烘干。

**别把课堂示例当作生活通则。** 有的玩偶可机洗，有的不可；应依据真实材质、洗护标签和组件判断。“永远说不能机洗”不是训练正确性的标准。

后面的统一教学任务会固定条件：Brown 只允许手洗、Panda 可机洗但不能烘干、Polar 两者都允许。这样可独立验证答案，而不是凭语气好坏判断。

## 阅读说明

内容根据第三讲课件与英文字幕整理，包含教学补充。模型规格与产品示例以课件日期为准。强化学习的完整数学推导留到第四讲，本讲重点是训练流程、直觉与小例子。

## 学习时持续追问四件事

- **数据从哪来？** 固定语料、人类示范、当前模型采样还是教师预测？
- **什么被更新？** 主模型、奖励模型、LoRA 参数，还是仅仅当前上下文？
- **信号落在哪？** 每个 token、回答部分、整条序列，还是偏好对？
- **如何验证？** 训练损失、独立验证集、任务测试、事实核对各不相同。

用这四问对照每个阶段，比只记 Pretrain、SFT、RLHF、GRPO 的缩写更有用。
