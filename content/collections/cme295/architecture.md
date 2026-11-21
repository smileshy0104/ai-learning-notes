---
slug: architecture
title: "编码器与解码器"
collection: cme295
lecture: 1
description: "谁读源句、谁写译文，以及两种注意力如何配合。"
order: 90
kind: lesson
status: published
tags: ["Encoder","Decoder"]
---

<section id="architecture" class="switch">
<div class="tag">Lecture outline · Transformer architecture（课件第 64–78、102–115 页）</div>

<p>2017 年的原始 Transformer 是为机器翻译设计的。它把任务拆成两半：<strong>读懂源句</strong>和<strong>写出译文</strong>，分别交给编码器和解码器。二者都是“把同样几个子层堆 N 次”，区别在于读取范围和是否访问另一方。</p>

<h2 id="part-2">概念 1：编码器（Encoder）</h2>
<p class="def"><strong>定义：</strong>把源语言序列的每个位置转成<strong>同时包含整句上下文</strong>的表示。它对每个位置都用双向自注意力，不加因果掩码——第 1 个词也能看到最后一个词。</p>
<p><strong>为什么需要：</strong>翻译时，理解一句话需要前后文互证。例如判断“苹果”是水果还是公司，得看后面的“发布了新产品”。</p>
<div class="flow"><span class="chip">源句 token</span><span class="arrow">→ embedding + 位置编码 →</span><span class="chip">自注意力（双向）</span><span class="arrow">→</span><span class="chip">FFN</span><span class="arrow">→ 重复 N 层 →</span><span class="chip">每个源位置一个上下文表示</span></div>
<p><strong>一个常见误解：</strong>编码器不是“把整句压成一个向量”。它输出的是<strong>与源句等长的一组向量</strong>（每个位置一个），后续交叉注意力正是按需读取其中某几个位置。</p>

<h2 id="part-3">概念 2：解码器（Decoder）</h2>
<p class="def"><strong>定义：</strong>根据<strong>已经生成的目标词</strong>与<strong>编码器对源句的表示</strong>，逐步预测下一个目标 token。</p>
<p><strong>为什么需要：</strong>生成是自回归的：第 t 个词取决于前 t−1 个已生成的词。它必须同时满足两个约束——只能看左边（不能偷看答案），又能读原文。</p>
<p>这两件事由两个不同的注意力子层完成：</p>
<div class="table-wrap"><table><thead><tr><th>子层</th><th>Q 来自</th><th>K、V 来自</th><th>作用</th></tr></thead><tbody><tr><th>掩码自注意力</th><td>解码器当前表示</td><td>解码器当前表示（屏蔽未来）</td><td>“我已经写了什么”</td></tr><tr><th>交叉注意力</th><td>解码器当前表示</td><td>编码器输出</td><td>“原文里哪一部分对当前这个词有用”</td></tr></tbody></table></div>
<p class="small muted">为什么交叉注意力的 K、V 来自编码器而不是解码器：解码器是在“查询”原文——它提出问题（Q），编码器提供可被匹配的特征（K）与内容（V）。</p>

<h2 id="part-4">概念 3：两个堆叠怎么连接</h2>
<svg viewBox="0 0 820 470" role="img" aria-label="编码器与解码器结构：编码器多层自注意力与前馈网络，解码器为掩码自注意力、交叉注意力与前馈网络" style="width:100%;max-width:820px;display:block;margin:16px auto">
<defs>
<marker id="a-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#2166cd"/></marker>
<marker id="a-arrow2" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#c0392b"/></marker>
</defs>
<text x="150" y="22" text-anchor="middle" font-size="15" fill="#193049" font-weight="600">编码器（读源句）</text>
<text x="640" y="22" text-anchor="middle" font-size="15" fill="#193049" font-weight="600">解码器（写译文）</text>
<rect x="55" y="40" width="190" height="42" rx="8" fill="#f6f9fd" stroke="#2166cd"/><text x="150" y="67" text-anchor="middle" font-size="13" fill="#193049">源句 embedding ＋ 位置编码</text>
<rect x="55" y="100" width="190" height="118" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-dasharray="4 3"/>
<text x="150" y="120" text-anchor="middle" font-size="12" fill="#53677b">× N 层</text>
<rect x="70" y="130" width="160" height="32" rx="6" fill="#fff" stroke="#2166cd"/><text x="150" y="151" text-anchor="middle" font-size="13" fill="#193049">自注意力（双向）</text>
<rect x="70" y="172" width="160" height="32" rx="6" fill="#fff" stroke="#2166cd"/><text x="150" y="193" text-anchor="middle" font-size="13" fill="#193049">前馈网络 FFN</text>
<text x="150" y="238" text-anchor="middle" font-size="11" fill="#53677b">每层都含残差连接＋归一化</text>
<rect x="55" y="252" width="190" height="44" rx="8" fill="#eff8f0" stroke="#2e7d32"/>
<text x="150" y="271" text-anchor="middle" font-size="12" fill="#193049">编码器输出：每个源位置</text>
<text x="150" y="287" text-anchor="middle" font-size="12" fill="#193049">都有一个上下文表示</text>
<rect x="545" y="40" width="190" height="42" rx="8" fill="#fff8ec" stroke="#db8b16"/><text x="640" y="60" text-anchor="middle" font-size="13" fill="#193049">已生成的目标 token</text>
<text x="640" y="75" text-anchor="middle" font-size="11" fill="#53677b">＋ 位置编码</text>
<rect x="545" y="100" width="190" height="198" rx="10" fill="#fff6e6" stroke="#db8b16" stroke-dasharray="4 3"/>
<text x="640" y="120" text-anchor="middle" font-size="12" fill="#53677b">× N 层</text>
<rect x="560" y="132" width="160" height="34" rx="6" fill="#fff" stroke="#db8b16"/><text x="640" y="154" text-anchor="middle" font-size="12" fill="#193049">掩码自注意力（只看左边）</text>
<rect x="560" y="176" width="160" height="34" rx="6" fill="#fff" stroke="#c0392b"/><text x="640" y="198" text-anchor="middle" font-size="12" fill="#193049">交叉注意力（读编码器）</text>
<rect x="560" y="220" width="160" height="34" rx="6" fill="#fff" stroke="#db8b16"/><text x="640" y="242" text-anchor="middle" font-size="12" fill="#193049">前馈网络 FFN</text>
<text x="640" y="280" text-anchor="middle" font-size="11" fill="#53677b">每层都含残差连接＋归一化</text>
<rect x="545" y="316" width="190" height="40" rx="8" fill="#f6f9fd" stroke="#2166cd"/><text x="640" y="341" text-anchor="middle" font-size="12" fill="#193049">线性层 → softmax → 下一个 token</text>
<path d="M150 82 V100" fill="none" stroke="#2166cd" stroke-width="2" marker-end="url(#a-arrow)"/>
<path d="M150 218 V252" fill="none" stroke="#2166cd" stroke-width="2" marker-end="url(#a-arrow)"/>
<path d="M640 82 V100" fill="none" stroke="#db8b16" stroke-width="2" marker-end="url(#a-arrow)"/>
<path d="M640 298 V316" fill="none" stroke="#db8b16" stroke-width="2" marker-end="url(#a-arrow)"/>
<path d="M245 274 C 330 274 480 236 560 196" fill="none" stroke="#c0392b" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#a-arrow2)"/>
<text x="404" y="330" text-anchor="middle" font-size="12" fill="#c0392b">红线：Q 来自解码器，K、V 来自编码器输出</text>
<text x="404" y="348" text-anchor="middle" font-size="11" fill="#53677b">即“解码器提问，编码器提供可匹配的特征与内容”</text>
<text x="410" y="440" text-anchor="middle" font-size="12" fill="#53677b">左半部分负责“读原文”；右半部分在“写译文”时反复运行</text>
</svg>
<p>三个容易忽略的细节：</p>
<ul><li><strong>编码器的输出会被每一层解码器重复读取</strong>，不是只传给第一层。</li><li><strong>解码器每层都有三块</strong>：掩码自注意力 → 交叉注意力 → FFN，每块后面都接残差与归一化。</li><li><strong>编码器和解码器的层数可以相同</strong>（论文 base 用 N = 6），但参数不共享。</li></ul>
<p>论文 base 配置：N = 6、d_model = 512、h = 8、d_ff = 2048、d_k = d_v = 64，参数量约 6.5×10⁷。</p>

<h2 id="part-5">概念 4：一次完整翻译的数据流</h2>
<div class="table-wrap"><table><thead><tr><th>步骤</th><th>做什么</th><th>形状（base 配置，源长 m、目标长 n）</th></tr></thead><tbody>
<tr><td>①</td><td>源句分词 → embedding ＋ 位置编码</td><td>m × 512</td></tr>
<tr><td>②</td><td>编码器 N 层：自注意力 → FFN</td><td>m × 512</td></tr>
<tr><td>③</td><td>编码器输出（每个源位置一个表示）</td><td>m × 512</td></tr>
<tr><td>④</td><td>解码器输入：<code>[BOS]</code> ＋ 已生成词，加位置编码</td><td>n × 512</td></tr>
<tr><td>⑤</td><td>掩码自注意力（只看左侧）</td><td>n × 512</td></tr>
<tr><td>⑥</td><td>交叉注意力：Q 来自 ⑤，K/V 来自 ③</td><td>n × 512</td></tr>
<tr><td>⑦</td><td>FFN；重复 N 层</td><td>n × 512</td></tr>
<tr><td>⑧</td><td>线性投影到词表 V → softmax → 下一个 token 的概率</td><td>n × V</td></tr>
</tbody></table></div>
<p>注意上表第 ⑥ 步的矩阵形状：Q 是 n × d_k，K 是 m × d_k，所以分数矩阵是 <strong>n × m</strong>——行是“正在写的词”，列是“原文的每个位置”。这也解释了长原文为什么会增加解码开销。</p>

<h2 id="part-6">概念 5：生成是循环，不是一次吐出一整句</h2>
<p>训练时目标文本已知，可以把整句喂进去、用因果掩码并行算损失；<strong>推理时没有答案</strong>，只能一步一步来：</p>
<input type="radio" name="gen" id="gen-1" checked>
<input type="radio" name="gen" id="gen-2">
<input type="radio" name="gen" id="gen-3">
<input type="radio" name="gen" id="gen-4">
<div class="controls" role="group" aria-label="生成步骤"><span>第几步：</span><label for="gen-1">第 1 步</label><label for="gen-2">第 2 步</label><label for="gen-3">第 3 步</label><label for="gen-4">第 4 步</label></div>
<div class="panel panel-gen1">
<div class="flow"><span class="chip">[BOS]</span><span class="chip muted-chip">？</span></div>
<p>解码器读完这 1 个位置后，输出层给整个词表打分，概率最高的是 <strong>Un</strong>。</p>
<p class="small muted">第一步只有起始标记作为输入，模型给出第一个词。</p>
</div>
<div class="panel panel-gen2">
<div class="flow"><span class="chip">[BOS]</span><span class="chip">Un</span><span class="chip muted-chip">？</span></div>
<p>解码器读完这 2 个位置后，输出层给整个词表打分，概率最高的是 <strong>ours</strong>。</p>
<p class="small muted">把刚生成的 Un 接到输入末尾，再预测下一个词。</p>
</div>
<div class="panel panel-gen3">
<div class="flow"><span class="chip">[BOS]</span><span class="chip">Un</span><span class="chip">ours</span><span class="chip muted-chip">？</span></div>
<p>解码器读完这 3 个位置后，输出层给整个词表打分，概率最高的是 <strong>en</strong>。</p>
<p class="small muted">每多一个词，解码器的输入就长一格。</p>
</div>
<div class="panel panel-gen4">
<div class="flow"><span class="chip">[BOS]</span><span class="chip">Un</span><span class="chip">ours</span><span class="chip">en</span><span class="chip muted-chip">？</span></div>
<p>解码器读完这 4 个位置后，输出层给整个词表打分，概率最高的是 <strong>peluche</strong>。</p>
<p class="small muted">注意：之前生成的词可以被反复读取，因为它们都在左侧。</p>
</div>
<p>直到模型输出 <code>[EOS]</code>（或达到长度上限）才停止。这也是“训练能并行、生成要串行”的原因。</p>

<h2 id="part-7">概念 6：三种架构 = 保留了这个结构的哪几块</h2>
<div class="table-wrap"><table><thead><tr><th>架构</th><th>保留的部分</th><th>典型模型</th><th>擅长</th></tr></thead><tbody><tr><th>Encoder–Decoder</th><td>①～⑧ 全部</td><td>原始 Transformer、T5、BART</td><td>翻译、摘要等“输入→输出”转换</td></tr><tr><th>Encoder-only</th><td>①～③，双向读取</td><td>BERT</td><td>分类、抽取、检索等理解任务</td></tr><tr><th>Decoder-only</th><td>④～⑧，去掉交叉注意力</td><td>GPT、LLaMA、Qwen</td><td>续写、对话，也能用生成方式做理解任务</td></tr></tbody></table></div>
<p>第一讲讲的是第一行。今天的主流模型多是第三行：<strong>没有独立编码器，输入直接作为序列的一部分参与自注意力</strong>。</p>

<div class="note"><strong>两处 softmax，两个用途：</strong>注意力里的 softmax 在“可读取的位置”上归一化，决定读多少；输出层的 softmax 在“整个词表”上归一化，决定下一个词是哪个。</div>
<p class="source">课件定位：第 64–78、102–115 页。结构图按课件重绘；base 配置数字与形状推导为补充说明。三种架构的对比在后面的“补充展望”中也有对应表格。</p>
</section>
