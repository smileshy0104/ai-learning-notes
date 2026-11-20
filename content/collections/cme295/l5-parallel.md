---
slug: l5-parallel
title: 模型并行：TP、PP、CP与EP分别切哪里？
collection: cme295
lecture: 5
description: 用矩阵维度、流水线气泡、上下文块和专家路由，理解五维并行的分工及通信代价。
order: 60
kind: lesson
status: published
tags: [TP, PP, CP, EP, Distributed training]
---

## 1. 先用一句话区分

PDF第75–88页：DP分数据；TP分张量计算；PP分层／阶段；CP分上下文位置；EP分专家。它们是在不同轴上组织工作，不是算法优劣排名。

## 2. Tensor Parallelism：一层内部拆开算

看FFN：X为T×d，A为d×f，B为f×d：

```text
Y=GELU(XA)，Z=YB
A=[A₁ A₂]：沿列拆，各d×(f/2)
B=[B₁; B₂]：沿行拆，各(f/2)×d
Z=GELU(XA₁)B₁+GELU(XA₂)B₂
```

每卡算一部分隐藏通道，最后求和。GELU在各分块独立应用，不能随便把非线性越过矩阵求和。

教学简例：X=[1,2]，A=单位矩阵，B=[[1,2],[3,4]]，暂以恒等激活替代GELU。两卡输出[1,2]与[6,8]，相加[7,10]，与直接XB一致。这里仅验证分块代数，不是完整FFN模型结果。

多头注意力也可把不同头分配到多卡，再进行输出投影与通信。每层都有通信成本，互联质量很重要。

## 3. Pipeline Parallelism：把层串成生产线

前几层在GPU 0，中间层在GPU 1，后几层在GPU 2。激活向后传，反向梯度向前传。

如果只送一个microbatch，后面卡等待前面，前面卡又等反向，这些空闲区叫bubble。引入多个microbatch和合适前后向调度能减少空闲，但要管理激活与负载均衡。

补充理想模型：p个等时阶段，m个microbatch，仅前向流水需要m+p−1个时间槽，利用率 `m/(m+p−1)`。p=4时m=1为25%，m=4约57.14%，m=16约84.21%。这是简化前向模型，不是任意训练调度的精确效率公式。

## 4. Context Parallelism：同一长序列分位置

每卡负责一部分query位置，K/V块按通信策略交换，使每个query最终看到所有应见的key。

两个块时：卡A先处理Q_A与K_A/V_A，卡B处理Q_B与K_B/V_B；交换K/V后再处理另一块。各块结果要用在线Softmax的统计正确合并，**不能对各块独立Softmax后直接平均**。

因果mask仍需保留：早位置不能因跨卡交流而偷看未来。CP不是把长文切成互不通信的独立样本，也不消除密集注意力总算术成本。

## 5. Expert Parallelism：Token去找专家

在MoE中，专家FFN放到不同GPU；router决定token发往哪些专家，all-to-all dispatch后计算，再combine回原逻辑位置。

共享注意力部分可以采用其他并行；专家负载不平衡、热点、容量策略与通信可能成为瓶颈。只看总参数数，无法推断每步激活参数和实际吞吐。

## 6. 怎么组合？

教学组网：DP=2、TP=2、PP=2，三轴独立时总计8张GPU，不是2+2+2=6。EP／CP若复用某些通信组，不能机械把所有数再乘一遍，需看实际布局。

更多GPU可能带来更大容量和吞吐，也可能因每卡工作太小、流水线失衡、通信等待而降低利用率。成本要按完成任务的总GPU时间计算，不只看单步墙钟时间。

## 理解检查

<details><summary>把不同head放不同GPU，与把不同层放不同GPU有何区别？</summary><p>前者是层内部张量并行，后者是阶段式流水并行，通信内容与调度不同。</p></details>
<details><summary>CP各块输出能否直接平均？</summary><p>不可以。各块Softmax分母不同，需合并最大值、归一化和分子统计才能恢复全局注意力。</p></details>

来源：PDF第75–88页；矩阵手算、理想流水公式和组网数量为教学补充。
