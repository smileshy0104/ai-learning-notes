---
slug: l2-normalization
title: 归一化：Pre-Norm 与 RMSNorm
collection: cme295
lecture: 2
description: 分开理解归一化放在哪里、采用什么公式，并用向量 [1,3] 手算 LayerNorm 与 RMSNorm。
order: 70
kind: lesson
status: published
tags: [Pre-Norm, Post-Norm, LayerNorm, RMSNorm]
---

## 1. 先分开两个问题

PDF 第 84–88 页讨论两条彼此独立的变化：

1. **位置**：归一化在残差相加之前还是之后？Pre-Norm / Post-Norm。
2. **公式**：减均值再缩放，还是只按均方根缩放？LayerNorm / RMSNorm。

“Pre-Norm 就是 RMSNorm”是错误的。一个讨论放置顺序，一个讨论具体算子。

## 2. Post-Norm 与 Pre-Norm

f 是注意力或 FFN 子层，省略 Dropout：

```text
Post-Norm：y = Norm(x + f(x))
Pre-Norm： y = x + f(Norm(x))
```

<div class="flow"><span class="chip">Post：x → f → 与 x 相加 → Norm</span><span class="chip">Pre：x → Norm → f → 与 x 相加</span></div>

**为什么 Pre-Norm 经常用于深层模型**？它让残差主通路上的 x 不必在每个子层后穿过归一化，能改善梯度传递与训练稳定性。

但“梯度永远无损”“从此不需要 warmup”都不是保证。初始化、优化器、训练精度、深度以及其他结构仍影响训练。

## 3. LayerNorm：减均值，再按标准差缩放

对一个 token 的 d 维表示 x：

```text
μ = mean(x)
σ² = mean((x−μ)²)
LN(x) = γ ⊙ (x−μ)/sqrt(σ²+ε) + β
```

γ、β 通常是 d 维可学习向量；⊙ 表示逐项相乘。这里沿特征维计算，不把不同句子的所有位置混在一起。

### 用 [1,3] 算一遍

为了手算先省略很小的 ε，取 γ=[1,1]、β=[0,0]：

```text
μ=(1+3)/2=2
σ²=[(1−2)²+(3−2)²]/2=1
LN([1,3])=[−1,1]
```

注意力在各位置之间混合信息，归一化是在每个位置自己的特征中控制尺度，职责不同。

## 4. RMSNorm：不减均值，按均方根缩放

```text
RMS(x) = sqrt(mean(x²))
RMSNorm(x) = γ ⊙ x / sqrt(mean(x²)+ε)
```

常见 RMSNorm 不包含与 LayerNorm 相同的均值中心化与 β 偏置，但具体实现可能有细节差异。

同样令 γ=[1,1]，暂略 ε：

```text
RMS([1,3])=sqrt((1²+3²)/2)=sqrt(5)≈2.2361
RMSNorm([1,3])≈[0.4472,1.3416]
```

| 对比 | LayerNorm | RMSNorm |
| --- | --- | --- |
| 减均值？ | 是 | 否 |
| 归一化尺度 | 标准差 | 均方根 |
| 示例输出 | [−1,1] | [0.4472,1.3416] |
| 输出均值必为 0？ | 加可学习仿射后不保证 | 本来就不要求 |

RMSNorm 保留非零均值也没关系，它不是为了让所有值正负对称，而是采用更简化的缩放机制。是否更快要结合内核和硬件，不能只看公式就保证速度倍数。

## 5. 小心残差相加的位置

用 x=[1,3]、f(u)=2u 这个**纯教学子层**：

- Post-LN：`LN(x+2x)=LN([3,9])=[−1,1]`。
- Pre-LN：`x+2LN(x)=[1,3]+[−2,2]=[−1,5]`。

两个结果不同，归一化和子层一般不能任意交换顺序。真实子层更复杂，不是把一层搬动一下就保持原模型输出。

## 理解检查

<details><summary>RMSNorm 是否把 token 的每个数都变成 1？</summary><p>不是。它统一除以一个尺度，保留分量之间的比例，再使用可学习 γ。示例 [1,3] 的结果仍保持 1:3 的比例。</p></details>
<details><summary>Pre-Norm 与残差是不是重复功能？</summary><p>不是。残差提供 x 的直接通路，Pre-Norm 规定归一化在子层支路中何处执行。两者协同影响优化。</p></details>

来源：PDF 第 84–88 页及字幕，已视觉核对 85–87 页。数值例子省略 ε 的影响并明确固定 γ、β，为教学补充。
