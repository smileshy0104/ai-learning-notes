---
slug: l4-policy-gradient
title: 策略梯度：为什么是奖励乘Log概率梯度？
collection: cme295
lecture: 4
description: 从有限动作期望逐步推导score-function恒等式，再用两种回答的Bernoulli策略手算一次更新。
order: 30
kind: lesson
status: published
tags: [Policy gradient, REINFORCE, Log derivative]
---

## 1. 最大化什么？

PDF第24–33页。对于固定提示x，模型希望采样回答的期望奖励更高：

```text
J(θ)=Σ_y πθ(y|x) R(x,y)
全体提示：再对 x~D 取期望
```

不是挑出这一次最高奖励回答就结束；训练目的是改变参数，让未来整体采样分布更好。

### 梯度的维度是什么？

把所有可训练权重展平，θ∈ℝᴾ，其中P是参数总数；J和R是标量，∇θJ与∇θlnπ都是P维向量。奖励乘梯度是标量乘向量，不是把一个奖励数字直接加到每个权重。θ为标量的Bernoulli算例只是P=1的特例。

## 2. 奖励不能直接求导，怎么办？

假设奖励固定、不显式依赖θ，并允许交换求导与求和：

```text
∇θ J = Σ_y R(x,y) ∇θ πθ(y|x)
```

用对数求导恒等式：

```text
∇θ lnπ = (∇θπ)/π
所以 ∇θπ = π ∇θlnπ
```

代回得到：

```text
∇θ J = Σ_y πθ(y|x) R(x,y) ∇θ lnπθ(y|x)
     = E_y~πθ [R(x,y) ∇θlnπθ(y|x)]
```

在π>0的支持上使用这个恒等式，并满足可积等条件。LLM有限logits的softmax给出正概率，数值计算仍需稳定的log概率实现。

<div class="flow"><span class="chip">奖励不求导</span><span class="arrow">×</span><span class="chip">采样回答的log概率梯度</span><span class="arrow">→</span><span class="chip">期望意义上改善生成分布</span></div>

## 3. REINFORCE：用样本近似期望

1. 给定提示，按policy采样回答。
2. 对完整回答评分。
3. 计算 `g=R∇lnπθ(y|x)`。
4. 执行梯度上升 `θ←θ+ηg`。

若优化器按最小化loss工作，可用 `L=−stopgrad(R) lnπθ(y|x)` 的采样形式；不沿奖励或离散采样过程回传普通路径梯度。

“Monte Carlo”表示用随机样本估计期望，不要求枚举全部回答。单次更新未必提高验证集奖励，需要多次采样和稳定优化。

## 4. 两种回答的完整算例

固定“好回答”和“差回答”，把其概率参数化为：

```text
πθ(good)=σ(θ)，πθ(bad)=1−σ(θ)
奖励：good=1，bad=0
初始θ=0 → 两者概率均0.5
```

sigmoid的导数是p(1−p)，因此：

```text
∂lnπ(good)/∂θ=1−p=0.5
∂lnπ(bad)/∂θ=−p=−0.5
```

单样本梯度：采到good为1×0.5=0.5；采到bad为0×(−0.5)=0。

```text
E[g]=0.5×0.5+0.5×0=0.25
直接求导J(θ)=σ(θ)，在θ=0处也为0.25
```

这证明此有限例子中估计的期望等于真实梯度，而不是对离散答案文本求导。

若采到good、学习率0.2，一步θ=0.1，good概率约0.52498；若采到bad，这个无基线例子梯度为0。不要把“bad没有单样本下降”误解为从不降低其相对概率，softmax／sigmoid的归一化耦合也在作用。

## 5. 完整回答如何回到token？

```text
lnπθ(y|x)=Σ_t lnπθ(y_t | x,y_<t)
∇lnπθ(y|x)=Σ_t ∇lnπθ(y_t | x,y_<t)
```

终局奖励乘整条log概率时，各token都接收到同一个序列评价的权重，但它们的实际梯度并不相同。没有逐token的真值信用标签，这是后面要解决的问题。

## 理解检查

<details><summary>为什么不是直接对R求梯度？</summary><p>奖励可能是测试通过与否或冻结RM的标量，离散生成路径不可直接按普通连续网络反传。策略梯度改为对采样概率求导。</p></details>
<details><summary>J要最大化，参数更新为什么是加号？</summary><p>梯度给出局部最陡上升方向。若使用最小化的L=−J，更新L的负梯度会得到等价方向。</p></details>

来源：PDF第27–33页及黑板推导；Bernoulli数字为教学计算。
