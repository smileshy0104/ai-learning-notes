---
slug: l4-kl-policies
title: KL与三种策略：Current、Old、Reference
collection: cme295
lecture: 4
description: 通过更新时序区分三种策略角色，手算KL并连接DPO，解释局部裁剪和参考约束的不同目的。
order: 70
kind: lesson
status: published
tags: [KL divergence, Reference policy, Old policy, DPO]
---

## 1. 三个π不是同一个东西

PDF第59–66页。它们可能初始权重相同，但训练中的角色与刷新时机不同。

| 对象 | 何时变化 | 用在哪里 |
| --- | --- | --- |
| πθ current | 每次优化器更新 | 分子、待学习输出分布 |
| π_old | 采样当前批次时固定 | 记录旧log概率，构造ρ |
| π_ref | 通常长期冻结 | 限制相对起点的分布偏移 |

```text
起点：current = old = ref
old生成批次1 → current更新几次，old和ref不变
刷新old为新的采样策略 → 生成批次2 → 再更新current
ref仍保持原参考
```

old不必另外保存一个永久大模型副本，有的实现主要保存采样时log概率；reference可能需要独立计算或其他实现，不能仅凭角色数量断言显存中一定有三整套副本。

## 2. 为什么裁剪old还不够？

每次只小步偏离old，很多批次累积仍可能远离ref。局部更新约束与长期参考约束解决不同尺度的问题。

反过来，仅有reference KL也不直接约束单批更新的概率比。所以一些LLM训练配方同时使用两者，具体放入reward、advantage还是显式loss项有所不同。

## 3. KL是什么？

对离散分布：

```text
KL(P∥Q)=Σ_i P_i ln(P_i/Q_i)
```

含义是在P采样的世界里，用Q近似P有多少信息差异。约定0ln(0/q)=0；若P某项为正而Q该项为0，该方向KL为无穷。

KL不是对称距离，也不直接度量模型参数矩阵差多少。

### 算一次

```text
P=[0.8,0.2]，Q=[0.5,0.5]
KL(P∥Q)=0.8ln1.6+0.2ln0.4≈0.1927
KL(Q∥P)=0.5ln0.625+0.5ln2.5≈0.2231
```

第二项可能为负，但总KL非负。在归一化分布上，不要把“每个token的log比都非负”当作KL的性质。

## 4. 在目标中加哪个方向？

课件使用当前policy相对reference的惩罚直觉：

```text
最大化 J ≈ J_clip − β E_states KL(πθ(·|s)∥π_ref(·|s))
```

准确期望要明确states从哪里来。实际RLHF有把KL加入逐token奖励、再算优势的配方；GRPO也有显式KL项。重复在多处添加同一惩罚可能改变目标，不能照抄符号就当等价。

## 5. 全词表KL与采样估计

完整词表求和有成本。假设token a从当前学生分布P采样，令u=Q(a)/P(a)，可用非负单样本形式：

```text
k(a)=u−1−lnu
E_a~P[k(a)]=KL(P∥Q)
```

这个等式需要归一化分布与适当支持，因为E_P[Q/P−1]=0。若样本实际上来自old而不是current，或训练中是否对u求导不同，不能直接声称仍是相同无偏梯度。

以P=[0.8,0.2]、Q=[0.5,0.5]为例，两候选u分别0.625、2.5，k约0.0950、0.5837，按P加权约0.1927。

**无偏标量估计不等于任何detach方式都给无偏梯度**。这是阅读GRPO实现时要特别注意的层次区别。

## 6. 与第三讲DPO怎样连接？

[DPO](l3-dpo.html)把奖励与 `β ln(πθ(y|x)/π_ref(y|x))` 联系起来。reference仍是基准，不是生成当前batch的old。

在给定奖励的理想KL正则最优策略里，β越大通常越约束偏离参考。但不能由此推出任何有限数据DPO训练中，单纯把β加大就保证所有分布变化更小；梯度尺度、数据、优化与实现也有影响。

## 理解检查

<details><summary>ρ=1是否表示current完全等同reference？</summary><p>不表示。ρ只比较某个状态动作的current与old；它没比较reference，也没比较所有动作。</p></details>
<details><summary>sample logprob差是负数，是否代码算出“负KL”？</summary><p>单样本log比可以为负。完整分布KL或合适期望非负；有限样本平均也有噪声，要先查计算的到底是什么量。</p></details>

来源：PDF第59–64页及相关问答。二分类KL与估计量例子为教学补充。
