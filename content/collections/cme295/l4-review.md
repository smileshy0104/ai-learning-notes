---
slug: l4-review
title: 第四讲复习：读懂一次RL更新
collection: cme295
lecture: 4
description: 用完整训练时序、算法对照与带解析自测，回顾策略梯度、裁剪、KL、组内比较和蒸馏。
order: 110
kind: lesson
status: published
tags: [复习, RL, PPO, GRPO, OPD]
---

## 1. 从一批提示到下一批

1. 固定reference，建立本轮采样old。
2. old对提示生成回答，记录采样token与旧log概率。
3. RM或验证规则评分。
4. PPO用value估计优势；结果监督GRPO用同提示组内奖励。
5. 当前policy对已知回答并行评分，得到current log概率与ρ。
6. 计算裁剪代理项及选定的KL约束，反向与优化器更新。
7. 批内小步复用几次，监测reward、KL、clip、长度与独立任务。
8. 刷新采样策略，生成新批次，而不是永久复用同批。

这是一种常见训练骨架，不是所有RL实现共享完全相同细节。OPD分支将教师分布引入学生前缀，不一定使用同一套序列奖励或value模型。

## 2. 三个问题与不同解决思路

| 问题 | 方法 | 仍有的限制 |
| --- | --- | --- |
| 梯度噪声 | 合适基线、value、组内比较 | 有限样本与基线误差 |
| 局部信用不足 | token优势估计、过程监督、教师分布 | 不保证真实因果归因 |
| 过度策略漂移 | 裁剪、KL、学习率与监测 | 不是硬约束和安全证明 |
| 维护value成本 | GRPO用组内奖励 | 仍需多个rollout |
| 教师覆盖不足 | 多教师、特权信息、独立验证 | 教师成本与偏差仍在 |

## 3. 快速算题

<details><summary>题1：θ=0时good概率0.5、bad概率0.5，奖励101/100，减100.5基线后两种梯度分别多少？</summary><p>log概率梯度分别+0.5和−0.5，相对奖励+0.5和−0.5，所以两者都+0.25，期望不变，玩具例子方差为0。</p></details>
<details><summary>题2：old=[0.5,0.5]，current=[0.8,0.2]，奖励=[1,0]，重加权期望？</summary><p>比率[1.6,0.4]，旧分布期望0.5×1.6×1+0.5×0.4×0=0.8。</p></details>
<details><summary>题3：ε=0.2、A=−1、ρ=1.5，裁剪代理项是多少？</summary><p>min(−1.5,−1.2)=−1.5。方向错误地增加坏动作概率时，惩罚不被平掉。</p></details>
<details><summary>题4：裁剪范围[0.8,1.2]，能否保证ρ永远在范围里？</summary><p>不能。它截断部分目标激励，不是对参数或概率硬投影；其他样本、loss和共享参数也能移动该概率。</p></details>
<details><summary>题5：reference是否每轮与old一起刷新？</summary><p>通常不。old记录当前batch来源，reference保持长期基准；要看具体算法约定。</p></details>
<details><summary>题6：同一回答每token共享优势，是否每token参数梯度相同？</summary><p>不是。共享的是优势标量，条件概率、裁剪状态和log概率梯度都可以不同。</p></details>
<details><summary>题7：KL(S∥T)每个求和项是否都非负？</summary><p>不是，单项可负，完整归一化分布上的KL非负。别把样本log比误当完整KL。</p></details>
<details><summary>题8：OPD不用RM，是否没有错误信号的风险？</summary><p>仍可能复制教师偏差或不完整局部预测，需要独立评价。没有RM不等于没有代理目标局限。</p></details>

## 4. 自动字幕里的术语

| 字幕表现 | 正确理解 |
| --- | --- |
| CMI295 | CME295 |
| row | ρ，rho，概率比率 |
| collapse / class用于讲座掌声例子 | claps，说明奖励代理与真实目标可能不一致 |
| GRPU | 按上下文为GRPO |
| scale divergence | KL divergence |
| distribution / distillation交替 | 按上下文区分概率分布与蒸馏训练 |
| 0.95 − 7 | 课件为0.95−0.70=0.25 |

还有一些口头简化需要校正：value增加不是严格因果贡献，clip不是所有超界梯度归零，OPD效果不构成绝对教师上界，长度激励也不是只看一个分母就能证明全部现象。

## 5. 下一步读论文时先检查什么？

- 哪个目标最大化，哪个loss最小化。
- r指reward还是ratio，epsilon是clip还是数值稳定常量。
- current、old、reference分别何时更新。
- token和序列概率是否被混用。
- 优势、奖励、KL估计是否detach，实际采样分布是谁。
- 按token、回答还是整个batch归一化。
- reward上升是否伴随长度膨胀、KL上升或旧任务退化。

## 参考来源

本讲引用线索包括REINFORCE（Williams，1992）、PPO（Schulman等，2017）、DPO（2023）、DeepSeekMath/GRPO（2024）、DAPO与Dr.GRPO相关工作（2025）、On-policy distillation（2023及后续实践）等。具体模型效果与后续论文示例以课件日期为背景，不在此维护实时榜单。
