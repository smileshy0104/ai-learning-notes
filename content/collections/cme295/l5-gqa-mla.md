---
slug: l5-gqa-mla
title: GQA与MLA：KV向量更少，也更短
collection: cme295
lecture: 5
description: 区分头共享与潜在表示压缩，给出GQA缓存比例和简化MLA投影维度，说明架构改动边界。
order: 90
kind: lesson
status: published
tags: [GQA, MQA, MLA, Low rank]
---

## 1. 分页只管摆放，还能减少数据吗？

PDF第121–137页从“摆放更好”走向“向量更少”和“表示更小”。这些方法并非无条件叠加的三个开关：GQA和MLA有各自架构设计，需看具体模型。

## 2. GQA：多组Query共享K/V

H_q个query头，H_kv组key/value头，通常H_q可被H_kv整除：

| 架构 | H_kv | 关系 |
| --- | --- | --- |
| MHA | H_q | 每query头一套KV |
| GQA | 介于1和H_q | 每组query共享KV |
| MQA | 1 | 全部query共用KV |

不是把query头也删成H_kv个。每个query仍有自己的查询表示，只是去访问共享K/V。

相同层数、长度、head维度与精度下，KV缓存比例为H_kv/H_q。课件H_q=24、H_kv=2，保留1/12，节省91.6667%。这不是总模型显存或总推理时间节省91.6667%。

对前一篇配置，若H_q=32：MHA的KV为2 GiB，H_kv=8为512 MiB，MQA为64 MiB。每个数字只算KV，且不含分页余量。

## 3. 能直接合并预训练模型的头吗？

不能假定无损。共享K/V改变表达能力，通常需匹配训练或转换再训练。MQA并非普遍“不能用”或一定质量差；效果取决于任务和训练，是质量、速度、容量间的选择。

## 4. MLA：共享一个小潜变量

MLA标准术语为Multi-head Latent Attention，课件和口语可能省略head。它为每token构造共享低维KV潜变量，避免缓存各头完全展开的K/V。

下面是列向量约定下的**简化内容分支**：

```text
h_t: d_model×1
W_down: d_c×d_model
c_t=W_down h_t: d_c×1
W_upK: (H_q d_k)×d_c
W_upV: (H_q d_v)×d_c
k_t=W_upK c_t，v_t=W_upV c_t
```

各头可以有不同上投影，共享的是c_t，不是所有头得到完全相同的K/V。缓存c_t后，可以在需要时重建，或通过矩阵吸收避免每步把全部展开KV写回缓存。

## 5. 低维的教学手算

取h=[1,2]ᵀ，W_down=[1,1]，得到c=3。令W_upK=[1,2]ᵀ、W_upV=[2,−1]ᵀ，则展开k=[3,6]ᵀ、v=[6,−3]ᵀ。

这只是说明“一份潜变量生成不同K/V”；没有证明任意原始k/v都能无损压成一维。低维表达是训练出来的架构约束，不是通用无损文件压缩。

忽略位置分支时，传统内容缓存每token约H_q(d_k+d_v)元素，潜变量为d_c元素。实际MLA还涉及解耦位置编码与额外缓存，不能仅用d_c就当完整模型公式。

## 6. 为什么RoPE不能忽略？

简单非旋转内容项可以写：`qᵀ(W_upK c)=(W_upKᵀq)ᵀc`，这让查询变换后直接与潜变量交互。

但位置相关旋转插入计算，会限制简单矩阵吸收。DeepSeek式MLA使用解耦位置处理等设计；本讲图只讲共享压缩直觉，不应把完整实现描述成两层线性就结束。

MLA与[LoRA](l3-lora.html)都有低秩投影的联系，但LoRA主要是权重增量参数化，MLA是注意力架构与缓存表示，目的和对象不同。

## 理解检查

<details><summary>GQA节省92%是否表示权重也节省92%？</summary><p>不是，这个比例特指同维度假设下的KV缓存，不包含query、FFN、其他权重与状态。</p></details>
<details><summary>MLA里的共享潜变量会让所有头完全相同吗？</summary><p>不会，各头上投影可不同。共享编码不等于共享全部展开表示。</p></details>

来源：PDF第121–137页；容量换算、投影形状与数字为教学补充。具体模型规格仅按课件快照理解。
