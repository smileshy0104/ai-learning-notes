---
slug: deep-dive
title: "补充：规模、训练与现代架构"
collection: cme295
lecture: 1
description: "微调、提示、缩放经验与现代模型的组件变化。"
order: 130
kind: lesson
status: published
tags: ["Scaling","MoE","GQA"]
---

<section id="deep-dive">
<div class="tag">深入补充 · 参考文档 2.7、5.1、1.7、12.x 节；不属于第一讲课件</div>

<p>第一讲讲的是“网络怎样计算”。下面几块用折叠面板收起来，需要时再展开。它们解释了很多第一讲里没说透的“为什么”。</p>

<p class="small muted">训练循环、损失函数、反向传播与梯度消失已在前面 <a href="basics.html#basics">⓿ 基础概念</a> 中详细展开，这里不再重复。</p>

<details><summary>3. 三代范式：预训练、微调、提示</summary>
<div class="table-wrap"><table><thead><tr><th>阶段</th><th>做法</th><th>需要的数据</th><th>换任务时</th></tr></thead><tbody><tr><th>预训练</th><td>在海量无标注文本上做自监督目标（如预测下一个 token）</td><td>极大，通常不需要人工标注</td><td>不涉及，先得到基座</td></tr><tr><th>微调</th><td>用少量标注数据更新（部分）参数</td><td>几千到几万条</td><td>要重新训练、另存一份权重</td></tr><tr><th>提示</th><td>不改参数，把任务写进上下文</td><td>0 到几个示例</td><td>改几行文字即可</td></tr></tbody></table></div>
<p>关键是三者不是互相取代：微调仍是重要的适配手段，提示降低了轻量适配的成本。对话产品通常还包含指令微调等后训练步骤，把“会续写”调成“愿意按指令回答”。</p>
</details>

<details><summary>4. 规模、缩放法则与“涌现”</summary>
<p>经验研究给出幂律关系：损失随参数量 N、数据量 D、计算量 C 增加而下降，但收益递减（指数约 0.07～0.1 量级）。</p>
<p>Chinchilla（2022）的实践结论是：给定计算预算时，模型与数据要一起放大，常见经验比例约为 <strong>每个参数配 20 个 token</strong>。例如 70B 参数配约 1.4T token。</p>
<div class="note">“涌现能力”（上下文学习、思维链等在某个规模后突然出现）是一个流行说法，但也有研究认为它可能是评测指标不连续造成的错觉。<strong>把它当作规划参考，而不是物理定律</strong>更稳妥。</div>
</details>

<details><summary>5. 今天的模型改了哪些零件</summary>
<div class="table-wrap"><table><thead><tr><th>部件</th><th>原始 Transformer（2017）</th><th>现代常见做法</th><th>改动目的</th></tr></thead><tbody><tr><th>整体结构</th><td>编码器 + 解码器</td><td>多为 decoder-only</td><td>任务形式统一，结构更简单</td></tr><tr><th>归一化位置</th><td>Post-Norm</td><td>Pre-Norm</td><td>深层训练更稳</td></tr><tr><th>归一化方法</th><td>LayerNorm</td><td>RMSNorm 等</td><td>少算均值，速度更快</td></tr><tr><th>位置编码</th><td>正弦／余弦</td><td>RoPE 等相对位置方案</td><td>改善长文本表现</td></tr><tr><th>激活函数</th><td>ReLU</td><td>SwiGLU 等门控形式</td><td>效果与效率更好</td></tr><tr><th>注意力</th><td>标准多头</td><td>GQA／MQA</td><td>减少推理时缓存开销</td></tr><tr><th>FFN</th><td>稠密</td><td>MoE 混合专家</td><td>参数多但每次只激活一部分</td></tr></tbody></table></div>
<p>生成时还会用到 KV Cache：把已算过的 K、V 存起来，新 token 只算增量。它不改变模型数学上的输出，只改变计算与显存的开销方式。这些细节属于后续讲次与专门资料。</p>
</details>

<details><summary>6. 能力分层：哪些靠模型，哪些靠外部系统</summary>
<div class="table-wrap"><table><thead><tr><th>层次</th><th>例子</th><th>来源</th></tr></thead><tbody><tr><th>基础能力</th><td>理解、世界知识、多语言、代码</td><td>预训练自然获得</td></tr><tr><th>涌现／指令能力</th><td>上下文学习、分步推理、指令遵循</td><td>规模 + 后训练</td></tr><tr><th>增强能力</th><td>任务分解、工具调用、自我检查</td><td>外部系统：工具、检索、循环</td></tr></tbody></table></div>
<p>这也解释了为什么同一个基座模型，套上工具与执行循环后“看起来更聪明”：它跨到了第三层。模型本身没有因此改变。</p>
</details>
<p class="source">本节的公式、数字与结论均已逐项计算核对；训练示例与参数量估算为教学数据。内容参考仓库内的 <code>references/llm-foundations.md</code>（不随网站发布），属于第一讲之外的延伸。</p>
</section>
