---
slug: l3-review
title: 第三讲复习：数据、目标与更新对象
collection: cme295
lecture: 3
description: 用对照表串起训练阶段，提供术语校正、自测解析与材料核对说明。
order: 120
kind: lesson
status: published
tags: [复习, Training, 术语]
---

## 1. 六部分课程主线

| 部分 | 学什么 | 监督信号 | 更新对象 |
| --- | --- | --- | --- |
| Pretraining | 广泛语言与代码模式 | 文本中的真实下一 token | 基础模型参数 |
| SFT | 期望回答与指令行为 | 提示条件下的示范回答 | 全参数或适配器 |
| Preference tuning | 同提示下谁更受偏好 | 偏好对；RM 或直接 DPO 目标 | RM／policy，各阶段不同 |
| Reasoning | 可验证的问题解决表现 | 结果、测试或其他奖励 | policy |
| Distillation | 匹配教师行为／分布 | 文本、logits 或 token 分布 | student |
| Discussion | 组织以上环节并控制退化 | 多任务评价与保留目标 | 由训练阶段决定 |

LoRA 是参数更新方式，不是另一个与 SFT 平行互斥的训练任务。Mid-training 是阶段组织，不能只凭名字推断其唯一目标。

## 2. 一条训练数据，四个问题

读到一个训练方案时，先写清：

1. 输入是什么、目标是什么？
2. 数据由固定语料、当前模型还是教师产生？
3. 损失在 token、回答还是序列上？
4. 哪组参数更新，哪组冻结？

例如“冻结 RM 评价 policy 的样本”不同于“训练 RM”，又不同于“在固定偏好对上做 DPO”。很多混淆来自把这些步骤合成一句“用反馈微调”。

## 3. 快速自测

<details><summary>题1：SFT 的提示 loss mask=0，是不是提示不参与计算？</summary><p>不是。提示仍影响回答表示，可通过回答损失产生梯度。loss mask 和 attention mask 控制不同对象。</p></details>
<details><summary>题2：4096×4096矩阵用r=8的LoRA，训练多少新增参数？</summary><p>A与B合计8×4096+4096×8=65,536，为16,777,216的0.390625%。不意味着全部显存同比减少。</p></details>
<details><summary>题3：RM给winner 102分、loser 100分，是否比2分、0分更有偏好把握？</summary><p>在Bradley–Terry分差模型里相同，两者差都是2，偏好概率约0.8808。</p></details>
<details><summary>题4：标准DPO是不是把winner当SFT样本、丢掉loser？</summary><p>不是。它同时利用两个回答相对reference的log概率差，丢掉loser会改变目标。</p></details>
<details><summary>题5：一组奖励全为1，能直接说policy不需要再训练吗？</summary><p>不能。只能说本组在这种相对优势构造下缺少区分信号，其他题、监督目标和能力仍可能需要改进。</p></details>
<details><summary>题6：学生KL接近教师，是否已经证明事实正确？</summary><p>没有。教师也会错，蒸馏需要独立任务评价，不能只看分布接近。</p></details>
<details><summary>题7：SFT以后为什么还可能有知识截止与幻觉问题？</summary><p>行为适配不等于得到实时、完整、精确的知识库。提示、检索、数据更新和事实核对仍各有作用。</p></details>

## 4. 英文自动字幕中的误识别

本讲字幕是英文自动生成，没有第一、第二讲那种中文机器翻译，但仍有误识别：

| 字幕词形／说法 | 本文处理 |
| --- | --- |
| open white / open-source | 按语境多指 open-weight；开放权重不等于全部开源 |
| masked text / masks 出现在数据混合处 | 对照前后文可能在说 math；不据误识别推断改成MLM训练 |
| Olmol 3 | 按课件写 OLMo 3 |
| decoding / generation 在训练口语中交替 | 区分teacher-forced计算和实际rollout |
| bill、epoch相关不清片段 | 仅采纳课件明确写出的含义，不猜具体数值 |
| policy / reference / old model混用 | 明确可训练策略、冻结参考与采样旧策略角色 |

课件某些图把损失项称作“maximize rewards”却使用L记号，本文显式写“最大化J”或“最小化L”，避免漏负号。

## 5. 重要边界回顾

- 预训练不保证知识真实；更多重复数据不保证持续收益。
- Teacher forcing让训练并行，不把推理变成一次生成整句。
- SFT不必更新全部权重；LoRA也仍需要梯度计算。
- 人类／AI偏好标签与可验证正确性是不同来源。
- RM分数不是最终真理，KL约束也不保证免疫reward hacking。
- DPO目标不是“每一步两条答案绝对概率必然一升一降”。
- GRPO的组内优势只是完整目标的一部分。
- 蒸馏目标接近不等于独立任务能力提高。
- 模型塌缩与灾难性遗忘需要分开检测。

## 6. 来源、核对与后续学习

原资料：第三讲PDF 165页，英文自动字幕3118行，完整保存在 `materials/cme295/lecture-03/`。已阅读全部提取文字和字幕，视觉核对20张重点页，尚未逐页核对全部图表。

数值与交互由 `site/lib/lecture3-examples.mjs` 生成，测试见 `tools/lecture3.test.mjs`。公式用文本与小图表示，可离线阅读；更完整的强化学习推导按课件安排留到第四讲。

课件引用线索包括：数据受限缩放（2023）、DataComp-LM与RegMix（2024）、LoRA（2021）、InstructGPT/RLHF（2022）、DPO（2023）、DeepSeekMath/GRPO（2024）、DeepSeek-R1（2025）等。更新的模型报告、产品界面、论文与新闻按资料日期快照理解，本文未独立验证所有现行外部状态。

后续重点：策略梯度为什么出现log概率；PPO／GRPO的裁剪和reference约束；OPD不同KL方向与采样估计。读者理解程度仍需讨论和自测确认，尚未标成已掌握。
