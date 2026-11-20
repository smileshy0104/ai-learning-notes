---
slug: l5-latency-roofline
title: 推理瓶颈：Prefill、Decode与Roofline
collection: cme295
lecture: 5
description: 区分TTFT、TPOT与TTLT，用Roofline上界和算术强度解释输入并行处理与逐Token生成。
order: 70
kind: lesson
status: published
tags: [Prefill, Decode, TTFT, Roofline]
---

## 1. 输入和输出Token不是同样的工作

PDF第89–96页对比：10,000 token输入、10 token输出，与10 token输入、10,000 token输出。

Prefill已知全部输入，可并行处理多个位置并构建KV；Decode要等待前一个采样结果才能继续，串行轮数多。通常长输出请求更受串行生成拖累，但长度本身不足以保证任何部署中谁必定更快：排队、上下文注意力、batch、硬件也影响结果。

Prefill并行不等于能看到未来；对decoder仍保持因果mask。

## 2. 延迟怎样拆？

课件约定Prefill包含产生首个token所需的初始计算：

```text
TTFT = T_queue + T_prefill
TTLT ≈ TTFT + (O−1) × TPOT
```

O为输出token数，TPOT在此是首token后各间隔的平均。O=1时没有后续间隔，不能再除O−1求TPOT。

教学例子：排队0.10s、prefill 0.40s，O=11，TPOT=0.03s：TTFT=0.50s，TTLT=0.80s。保持其他项不变，输出101个时TTLT=3.50s；真实TPOT未必恒定。

不同平台可能把首次decode另列，还会包含网络、流式缓冲、隐藏推理与用户可见输出边界，要先统一测量口径。用户感知的首字不总等于模型内部首token。

## 3. 吞吐与延迟不同

请求并发多时，batch可增加设备每秒总token数，却可能让某条请求排队更久。报告系统吞吐、单请求TTFT、TPOT及尾延迟，比单看“tokens/s”更完整。

价格截图说明课件时点常见输入／输出／缓存输入价差，不给出固定5倍或10倍的物理定律。计费还受产品策略影响，不能由价格直接反推FLOPs。

## 4. Roofline的三个量

PDF第97–102页：

```text
F：执行FLOPs
M：在所分析内存层次搬运的bytes
I=F/M：算术强度，FLOPs/byte
C：峰值计算吞吐，FLOP/s
W：内存带宽，bytes/s
可达吞吐上界 ≤ min(C, W×I)
理想耗时下界 ≥ max(F/C, M/W)
```

这是乐观模型，假定可有效重叠等，不计所有调度、网络和同步；预测上界不是实测保证。

<!-- lab:l5-roofline -->

教学硬件C=100 TFLOP/s、W=1 TB/s，ridge point为C/W=100 FLOPs/byte。I=10时带宽上限10 TFLOP/s，I=200时计算上限100 TFLOP/s。

图中斜线是W×I，水平线是C；没有把容量GB直接乘强度。带宽与容量不能混为一谈。

## 5. 为什么Decode常Memory-bound？

简化权重主导的线性层，P个权重、每权重2 bytes，每个序列一步约2P FLOPs。如果一个batch内b个序列共享这次权重读取：

```text
F≈2Pb，M_weights≈2P → I_weights≈b FLOPs/byte
```

小batch复用少，常受权重搬运限制；batch增大可提高复用和吞吐。但真实长上下文还要读KV、有其他算子，不能把I=b当精确全模型公式。

Prefill有很多位置一起运算，通常复用更多，优化得当更可能compute-bound。大batch decode或长上下文会改变瓶颈，所以不是“decode永远带宽受限、prefill永远算力受限”。

## 理解检查

<details><summary>Roofline算出10TFLOP/s，是否实测一定达到？</summary><p>不是。它是给定模型下的乐观上界，执行效率、同步和额外开销可能降低表现。</p></details>
<details><summary>把输入从1000增到10000，Prefill完全免费吗？</summary><p>不是，计算与KV存储都会增长；并行只说明不必像自回归输出那样逐个等待采样。</p></details>

来源：PDF第89–102页；延迟数字与简化Roofline例子为教学补充。
