---
slug: l5-review
title: 第五讲复习：先找瓶颈，再选优化
collection: cme295
lecture: 5
description: 用方法对照、部署诊断顺序与带解析自测，回顾FlashAttention、分布式训练和推理系统。
order: 120
kind: lesson
status: published
tags: [复习, LLM Systems, Bottleneck]
---

## 1. 回答开场的两个问题

PDF第152–156页。

| 方法 | 怎么放得下？ | 怎么跑得快？ | 主要边界 |
| --- | --- | --- | --- |
| FlashAttention | 不物化完整大注意力表 | 减少HBM搬运 | 不消除密集n²计算 |
| ZeRO | 分片长期训练状态 | 有时支持更大有效训练规模 | 通信与临时峰值 |
| DP／TP／PP／CP／EP | 不同轴分摊状态或激活 | 并行执行更多工作 | 互联、负载、气泡 |
| KV Cache | 需要额外KV空间 | 不重复计算旧前缀 | 长上下文读写仍有成本 |
| PagedAttention | 少预留浪费与外部碎片 | 更有效使用缓存、承载并发 | 块表开销与内部碎片 |
| GQA／MLA | 减少KV头或缓存表示大小 | 可能减少读写 | 架构与训练配套 |
| Speculative decoding／MTP | 不以节省所有缓存为主要目的 | 一轮target验证产出多个token | 草稿、接受率与校正成本 |

并不是所有方法都直接降低TTFT，有些主要改善decode吞吐或容量。服务质量还涉及排队与尾延迟。

## 2. 收到“模型很慢”，先问什么？

1. 是训练还是服务？单请求还是高并发？
2. 是放不下、TTFT高、TPOT高，还是整体吞吐低？
3. 输入／输出长度、有效batch、精度、模型结构是多少？
4. 显存分别被权重、训练状态、激活还是KV占用？
5. 计算、HBM带宽、跨卡通信中谁在等待？
6. 优化前后是否在同等质量、相同采样配置与负载下比较？

如果只是排队太久，加速attention不必然消除全部等待；如果是权重与Adam状态超容量，分页KV也不是对症方案。

## 3. 手算自测

<details><summary>100 billion参数、2bytes/参数，只算权重是多少？</summary><p>200GB，约186.2645GiB；不含训练或服务额外状态。</p></details>
<details><summary>s=[0,ln2,ln4]，v=[2,4,8]，注意力输出？</summary><p>指数比例1:2:4，输出42/7=6。得分整体加1000后不变，稳定在线算法仍可算。</p></details>
<details><summary>FlashAttention是否减少所有query-key配对？</summary><p>不是。它主要减少物化与IO，对标准密集注意力仍计算所需配对；因果mask依然生效。</p></details>
<details><summary>假设每参数状态16bytes、P=1B、4卡，ZeRO-1与3每卡多少？</summary><p>在本文2P参数、2P梯度、12P优化器相关状态假设下，stage 1为7GB，stage 3为4GB，均非完整峰值。</p></details>
<details><summary>TTFT=0.5s、输出11token、TPOT=0.03s，TTLT？</summary><p>0.5+(11−1)×0.03=0.8s。不是再加11个完整间隔。</p></details>
<details><summary>C=100TFLOP/s、W=1TB/s、I=10FLOPs/byte，Roofline上界？</summary><p>min(100,1×10)=10TFLOP/s，属于带宽受限区域，实测可能更低。</p></details>
<details><summary>GQA把24套KV改成2套，是否总显存省91.67%？</summary><p>只是在相同其他条件下KV数据减少91.67%，不能推广为总显存或总时间。</p></details>
<details><summary>Draft拒绝后直接从Target重采是否正确？</summary><p>一般不正确。已接受分支已有质量，应该从归一化正残差max(T−D,0)采样补齐。</p></details>
<details><summary>为什么多Token head不自动等价普通自回归模型？</summary><p>多个head可能条件在同一前缀，未来头未条件在实际已采出的前一个token，需要校正或明确定义另一种生成分布。</p></details>

## 4. 字幕与口头简化校正

| 字幕或口头表述 | 阅读时应理解为 |
| --- | --- |
| 0／0 redundancy optimizer | ZeRO／Zero Redundancy Optimizer |
| image A／multi-attention | 按上下文为MHA／MQA |
| Laura | LoRA |
| multi-latent attention | 标准缩写MLA为Multi-head Latent Attention |
| 不用读写HBM | 减少中间量HBM读写，Q/K/V与输出仍需搬运 |
| causal mask乘三角矩阵 | 用mask排除未来logit，不能简单把logit乘0当−∞ |
| 下溢直接置0完全没问题 | 可能有有限精度误差，避免溢出并不保证逐位相同 |
| next token for free | 全接受后可复用验证前向的额外分布，非零成本承诺 |

## 5. 参考线索与范围

课程涉及FlashAttention（Dao等，2022）、ZeRO（Rajbhandari等，2019）、Megatron-LM、GPipe、Ring Attention、GShard、PagedAttention（Kwon等，2023）、DeepSeek-V2的MLA、Speculative Sampling（Chen等，2023）、DistillSpec、多token预测（Gloeckle等，2024）等。

这是一份系统原理学习笔记，不是CUDA kernel实现、可直接运行的多机训练配置或服务容量承诺。课件硬件和价格快照不代表实时事实；实际部署需要测量和正确性回归，而不是只抄一个加速倍数。
