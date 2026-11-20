---
slug: l4-overview
title: 第四讲导读：从奖励走到策略更新
collection: cme295
lecture: 4
description: 建立RL、策略梯度、PPO、GRPO和On-policy蒸馏的学习路线，先统一符号再理解推导。
order: 10
kind: lesson
status: published
tags: [Lecture 4, RL, PPO, GRPO]
---

## 这一讲解决什么问题？

第三讲知道可以“给回答评分，再更新模型”。第四讲解释**为什么离散生成也能学习、怎样计算梯度、怎样复用昂贵的采样、怎样约束更新**。

整条主线并非背五个互不相干的算法：

<div class="flow"><span class="chip">最大化期望奖励</span><span class="arrow">→ 策略梯度</span><span class="chip">减基线，降低噪声</span><span class="arrow">→ PPO</span><span class="chip">组内比较替代价值模型</span><span class="arrow">→ GRPO</span><span class="chip">寻找更密集反馈 → 蒸馏</span></div>

## 先回顾第三讲

- 预训练匹配广泛文本中的下一词分布。
- SFT在提示条件下学习示范回答。
- 偏好优化与推理训练需要评价“模型生成的回答好不好”。
- 奖励可以来自人类偏好模型，也可以来自可验证规则。

如果概率、梯度和目标函数仍不熟，可先读[基础工具箱](basics.html)、[第三讲RLHF](l3-rlhf.html)。本讲的手算是理解机制，不是真实GPU训练结果。

## 本讲统一使用的符号

| 记号 | 含义 | 容易混淆的地方 |
| --- | --- | --- |
| x、y | 提示、完整回答 | token级时用前缀s和动作a |
| R或r | 奖励 | 不用它表示概率比 |
| πθ | 当前待更新的策略 | 输出分布，不是奖励模型 |
| π_old | 生成当前批样本的旧策略 | 每轮新采样后刷新，批内固定 |
| π_ref | 冻结的参考策略 | 通常跨多个批次保持不变 |
| ρ | 当前概率／旧概率的比率 | 不是奖励 |
| A | 优势 | 相对于基线的好坏，而非原始分数 |
| J | 最大化目标 | 优化器若最小化loss，常写L=−J |

课件第8–10页专门提醒：论文可能用L表示最大化目标，用r表示ratio。看到字母先看定义与优化方向，不能凭名字猜。

## 课件顺序与阅读目录

页码为PDF物理页码，包含封面；很多连续页是同一幅图逐步展开。

| 主线 | PDF页码 | 阅读 |
| --- | --- | --- |
| 回顾与约定 | 1–11 | 本页 |
| Reinforcement learning与奖励 | 12–23 | [RL与奖励](l4-rl-rewards.html) |
| Policy gradients与REINFORCE | 24–33 | [策略梯度推导](l4-policy-gradient.html) |
| 三个问题与基线 | 34–40 | [基线与信用分配](l4-baselines.html) |
| PPO：价值、采样复用、裁剪 | 41–58 | [重要性采样](l4-importance.html)、[PPO](l4-ppo.html) |
| KL与参考策略、DPO联系 | 59–66 | [KL与三种策略](l4-kl-policies.html) |
| GRPO及对照 | 67–94 | [GRPO](l4-grpo.html) |
| 长度、难度与探索改进 | 95–110 | [归一化与改进](l4-grpo-refinements.html) |
| On-policy distillation | 111–134 | [信用分配与反向KL](l4-opd.html) |
| 结束与自测 | 135 | [总复习](l4-review.html) |

## 贯穿全讲的任务：密封盒子中的Teddy

题目：Teddy在密封盒子里，盒子被搬到厨房，Teddy在哪里？假设过程中盒子没打开，答案是“厨房”。

两个候选都写出“厨房”，却可能有不同过程：

- 正确说明：Teddy一直在盒子中，盒子到厨房，因此Teddy也到厨房。
- 错误说明：Teddy爬出盒子，自己走到厨房。

只检查最后位置，两者都得分；但后者违反题目条件。这个例子贯穿结果奖励、token信用分配与教师反馈。

## 阅读说明

内容依据第四讲课件与英文自动字幕整理，加入教学计算和易错点。本文采用离散求和推导；课件以轨迹积分形式介绍时，核心恒等式相同。GAE作为补充说明，不要求先掌握完整强化学习课程。

建议每个公式都问：**谁采样？哪个量固定？对谁求导？是最大化还是最小化？**
