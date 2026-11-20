---
slug: l5-flash
title: FlashAttention：在线Softmax为何不用存整张表？
collection: cme295
lecture: 5
description: 从分子分母递推到数值稳定重缩放，手算FlashAttention的核心并解释分块与反向重计算。
order: 30
kind: lesson
status: published
tags: [FlashAttention, Online softmax, Tiling, Recompute]
---

## 1. 大矩阵在哪里？

PDF第14–29页。先只看一个注意力头：

```text
Q,K: n×d_k，V: n×d_v
S=QKᵀ/√d_k: n×n
P=softmax(S+mask): n×n
O=PV: n×d_v
```

标准分离算子可能把S写入HBM、再读出算P、再写P、再读出乘V。实际实现可以已有局部融合，课件是用于对比的朴素基线。

n=4096时，一张n×n矩阵有16,777,216项，假设2 bytes每项是32 MiB；n=32768时单张为2 GiB。这里只算一个头的一张表，还没乘batch与头数。

## 2. Softmax不是必须先保存整行

PDF第30–39页。对某个query，得到得分s₁,…,sₙ和value向量vᵢ：

```text
O = [Σ_i exp(s_i) v_i] / [Σ_i exp(s_i)]
```

分子是d_v维向量，分母是标量。可以逐个累加，最后相除。仍然要处理全部允许的key，只是不需要同时保存所有得分和权重。

例如s=[0,ln2,ln4]，v=[2,4,8]，未缩放指数权重为[1,2,4]：

```text
O=(1×2+2×4+4×8)/(1+2+4)=42/7=6
```

## 3. 为什么还要维护最大值？

PDF第40–47页。直接算exp(1000)会溢出。稳定做法是对已读部分维护最大值m、缩放后的分母ℓ和分子u：

```text
m_t = max(s₁,…,s_t)
ℓ_t = Σ_{i≤t} exp(s_i−m_t)
u_t = Σ_{i≤t} exp(s_i−m_t) v_i
O_t = u_t/ℓ_t
```

新得分到来时：

```text
m_new=max(m_old,s_new)
α=exp(m_old−m_new)
ℓ_new=αℓ_old+exp(s_new−m_new)
u_new=αu_old+exp(s_new−m_new)v_new
```

α把旧累积值从旧刻度换到新刻度。只缩放新项、不缩放旧项，会把不同比例尺的数混加。

<!-- lab:l5-online -->

上例三步为：(m,ℓ,u)=(0,1,2)、(ln2,1.5,5)、(ln4,1.75,10.5)，最终6。整体得分加1000，权重与结果都不变，稳定算法也不必计算exp(1000)。

第一项可直接初始化m=s₁、ℓ=1、u=v₁。完全被mask掉的行须单独约定，不能直接计算−∞−(−∞)；真实kernel需处理边界。

## 4. 从单个元素到GPU分块

实际FlashAttention按块读Q、K、V到片上资源，计算局部得分，逐行合并最大值与归一化统计，最终写回O。块内也有最大值与分子分母，再用同样的重缩放合并。

<div class="flow"><span class="chip">HBM读小块</span><span class="arrow">→</span><span class="chip">片上得分与累积</span><span class="arrow">→ 下一个块 →</span><span class="chip">写最终输出</span></div>

它减少HBM读写，不是完全不用HBM，也不是把整个n×n矩阵挪到SRAM。块大小受片上资源、线程调度和数据类型约束。

## 5. 反向为什么可能重算反而更快？

PDF第58–60页。反向需要注意力中的相关量。与其保存整个S、P再从HBM读回来，可以保存必要小统计并在反向分块重建。

额外FLOPs换更少内存搬运，整体可能更快；这是对特定大中间矩阵的取舍，不是“任何计算都重算更好”。通用activation checkpointing也有类似时间／空间权衡，但范围与实现不完全相同。

课件表的一个历史配置里，运算量66.6→75.2 GFLOPs、HBM读写40.3→4.4 GB、时间41.7→7.3 ms，约5.71倍加速。不是对所有长度、精度和GPU的承诺。

## 6. Exact具体指什么？

没有用稀疏或低秩近似替代原注意力，实数数学上结果相同；有限精度与求和顺序仍可能带来舍入差异，不保证bitwise identical。

标准密集注意力的计算仍随n²增长，FlashAttention主要消除大中间表和降低IO，不是将所有长上下文算术复杂度降为线性。版本演进还涉及调度和硬件适配，本讲聚焦共同核心。

## 理解检查

<details><summary>m变大时，为何分子分母都乘α？</summary><p>它们原来都用exp(−m_old)刻度，现在要统一改成exp(−m_new)。只改一边或只改新项会改变结果。</p></details>
<details><summary>不保存权重表，是否就不关注某些key？</summary><p>不是。所有未被mask的key仍参与计算，区别是按块累积而非保存整张表。</p></details>

来源：PDF第13–62页；三元素数值与内存换算为教学补充。
