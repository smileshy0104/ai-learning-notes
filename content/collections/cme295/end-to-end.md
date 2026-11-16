---
slug: end-to-end
title: "端到端翻译示例"
collection: cme295
description: "从一句英文开始，跟踪分词、嵌入、编码与逐步生成。"
order: 110
kind: lesson
status: published
tags: ["翻译","End-to-end"]
---

<section id="end-to-end">
<div class="tag">Lecture outline · End-to-end example（课件第 79–115 页）</div>

<p>课件从这里开始不再讲零件，而是走一遍完整流程。为了看清形状，下面的嵌入维度取 d = 4（真实模型常是 512～4096），词表也故意很小。数字是教学示例，流程与课件一致。</p>

<h3 id="part-2">第 1 步：分词并加上边界标记</h3>
<div class="flow"><span class="chip">[BOS]</span><span class="chip">A</span><span class="chip">cute</span><span class="chip">teddy bear</span><span class="chip">is</span><span class="chip">reading</span><span class="chip">.</span><span class="chip">[EOS]</span></div>
<p>源句被切成 7 个 token（含标点）；<code>[BOS]</code>/<code>[EOS]</code> 标出序列边界。序列长度 m = 7。</p>

<h3 id="part-3">第 2 步：查表得到嵌入，再加上位置编码</h3>
<div class="table-wrap"><table><caption>嵌入只是“按 ID 取一行”，位置编码按位置相加（位置编号从 0 起）</caption><thead><tr><th>位置（从 0 计）</th><th>token</th><th>示例 ID</th><th>embedding（d = 4）</th><th>位置编码</th><th>相加后</th></tr></thead><tbody>
<tr><th>1</th><td>A</td><td>31</td><td>[0.2, −0.1, 0.4, 0.0]</td><td>[0.00, 1.00, 0.00, 1.00]</td><td>[0.2, 0.9, 0.4, 1.0]</td></tr>
<tr><th>2</th><td>cute</td><td>7</td><td>[0.5, 0.3, −0.2, 0.1]</td><td>[0.84, 0.54, 0.01, 1.00]</td><td>[1.34, 0.84, −0.19, 1.10]</td></tr>
<tr><th>3</th><td>teddy bear</td><td>412</td><td>[0.6, 0.2, 0.1, −0.3]</td><td>[0.91, −0.42, 0.02, 1.00]</td><td>[1.51, −0.22, 0.12, 0.70]</td></tr>
<tr><th>4</th><td>is</td><td>9</td><td>[0.1, 0.4, 0.3, 0.2]</td><td>[0.14, −0.99, 0.03, 1.00]</td><td>[0.24, −0.59, 0.33, 1.20]</td></tr>
<tr><th>5</th><td>reading</td><td>88</td><td>[0.3, −0.2, 0.6, 0.4]</td><td>[−0.76, −0.65, 0.04, 1.00]</td><td>[−0.46, −0.85, 0.64, 1.40]</td></tr>
</tbody></table></div>
<p class="small muted">表中位置编码取自正弦／余弦公式（d = 4 时的前几维），仅示意“同维相加”。真实实现通常一次处理整个矩阵。</p>

<h3 id="part-4">第 3 步：编码器把每个源位置变成上下文表示</h3>
<div class="flow"><span class="chip">7 × 4 矩阵</span><span class="arrow">→ 自注意力（7×7 权重）→</span><span class="chip">残差＋归一化</span><span class="arrow">→</span><span class="chip">FFN</span><span class="arrow">→ ×N 层 →</span><span class="chip">7 × 4 的上下文表示</span></div>
<p>关键点：输出仍是 <strong>7 个向量</strong>（每个源位置一个），不是“一句话一个向量”。这一步之后，每个位置的表示都已经混合了整句信息。</p>

<h3 id="part-5">第 4 步：解码器开始生成，第一次输入只有 [BOS]</h3>
<div class="flow"><span class="chip">[BOS]</span><span class="arrow">→ 掩码自注意力（只能看自己）→</span><span class="chip">交叉注意力（看编码器 7 个位置）</span><span class="arrow">→ FFN →</span><span class="chip">线性 → softmax</span><span class="arrow">→ 选</span><span class="chip">Un</span></div>
<p>交叉注意力这一步，解码器用当前状态作查询，去源句的 7 个位置里找最相关的信息。可以理解为它在问：“要开始翻译这句话，我该先看哪儿？”</p>

<h3 id="part-6">第 5 步：把新词接回输入，重复直到 [EOS]</h3>
<div class="table-wrap"><table><caption>每轮把刚生成的法语词追加到解码器输入末尾</caption><thead><tr><th>轮次</th><th>解码器输入</th><th>输出</th><th>最关注的源词（示意）</th></tr></thead><tbody>
<tr><th>1</th><td>[BOS]</td><td>Un</td><td>A</td></tr>
<tr><th>2</th><td>[BOS] Un</td><td>ours</td><td>teddy bear</td></tr>
<tr><th>3</th><td>[BOS] Un ours</td><td>en</td><td>teddy bear</td></tr>
<tr><th>4</th><td>[BOS] Un ours en</td><td>peluche</td><td>teddy bear</td></tr>
<tr><th>5</th><td>[BOS] Un ours en peluche</td><td>mignon</td><td>cute</td></tr>
<tr><th>6</th><td>… peluche mignon</td><td>lit</td><td>is / reading</td></tr>
<tr><th>7</th><td>… lit</td><td>[EOS]</td><td>—</td></tr>
</tbody></table></div>
<p>最终得到 <strong>Un ours en peluche mignon lit.</strong> 注意“语序不同”：法语把修饰语放在后面，所以模型不是逐词对齐翻译，而是在生成每个词时重新决定看哪儿。</p>

<h3 id="part-7">第 6 步：训练与推理，差别在哪</h3>
<div class="table-wrap"><table><thead><tr><th>环节</th><th>训练时</th><th>推理时</th></tr></thead><tbody><tr><th>解码器输入</th><td>完整的目标句（右移一位）</td><td>只有已生成的部分</td></tr><tr><th>能否并行</th><td>能，靠因果掩码挡住未来</td><td>不能，必须逐词</td></tr><tr><th>损失</th><td>对每个位置算交叉熵，再平均</td><td>不算损失</td></tr><tr><th>停止条件</th><td>由数据决定，训练时已含 [EOS]</td><td>模型输出 [EOS] 或达长度上限</td></tr></tbody></table></div>
<div class="note"><strong>一句话总结这一节：</strong>编码器把源句变成“7 个懂上下文的向量”；解码器带着已写的译文，一轮一轮去这些向量里取信息，每轮吐一个词，直到写完。</div>
<p class="source">课件定位：第 79–115 页。嵌入与位置编码数值为教学示例，法语对齐为示意；数据流结构对应课件逐步展开的图示，也对应补充阅读 2.4 节的 ①～⑧ 步骤。</p>
</section>
