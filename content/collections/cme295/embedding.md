---
slug: embedding
title: "词元表示 · Token representation"
collection: cme295
description: "从离散编号到可学习向量，区分初始嵌入与上下文表示。"
order: 50
kind: lesson
status: published
tags: ["Embedding","One-hot"]
---

<section id="embedding" class="switch">
<div class="tag">Lecture outline · Word representation / Token representations（课件第 33–44 页）</div>

<p>可以把 token ID 想成图书馆的索书号：它帮助找到对应记录，但编号本身不表示语义。<strong>Embedding（嵌入）</strong>就是根据编号，查出一组可学习的数字。</p>
<p>选择一个 token，看看它查到什么：</p>
<input type="radio" name="emb" id="emb-a" checked>
<input type="radio" name="emb" id="emb-b">
<input type="radio" name="emb" id="emb-c">
<div class="controls" role="group" aria-label="选择 token"><label for="emb-a">泰迪熊</label><label for="emb-b">可爱</label><label for="emb-c">阅读</label></div>
<div class="panel panel-a"><div class="flow"><span class="chip">token：泰迪熊</span><span class="arrow">→</span><span class="chip">示例 ID：42</span><span class="arrow">→ 查表 →</span><span class="chip">示例向量：[1, 0]</span></div></div>
<div class="panel panel-b"><div class="flow"><span class="chip">token：可爱</span><span class="arrow">→</span><span class="chip">示例 ID：7</span><span class="arrow">→ 查表 →</span><span class="chip">示例向量：[0, 2]</span></div></div>
<div class="panel panel-c"><div class="flow"><span class="chip">token：阅读</span><span class="arrow">→</span><span class="chip">示例 ID：105</span><span class="arrow">→ 查表 →</span><span class="chip">示例向量：[1, 1]</span></div></div>
<h3 id="part-2">两种表示方式：one-hot 与可学习嵌入</h3>
<p>课件第 33 页把 token 表示分成两类：朴素写法（one-hot）与学出来的向量（learned embedding）。先用一个 5 个词的小词表看差别：</p>
<div class="grid">
<div><h4 id="part-3">One-hot：每个 token 一根独热轴</h4>
<div class="table-wrap"><table><caption>长度 = 词表大小 V = 5</caption><thead><tr><th>token</th><th>向量</th></tr></thead><tbody><tr><th scope="row">泰迪熊</th><td>[1, 0, 0, 0, 0]</td></tr><tr><th scope="row">可爱</th><td>[0, 1, 0, 0, 0]</td></tr><tr><th scope="row">阅读</th><td>[0, 0, 1, 0, 0]</td></tr><tr><th scope="row">书</th><td>[0, 0, 0, 1, 0]</td></tr><tr><th scope="row">.</th><td>[0, 0, 0, 0, 1]</td></tr></tbody></table></div>
<p>one-hot 本身表达的是“是哪一个符号”，不表达意思远近：任意两个不同 token 的点积都是 0，“泰迪熊”和“可爱”、“泰迪熊”和“书”看起来同样疏远。注意这不等于网络永远学不到关系——后续线性层可以为每个位置学到不同的方向与权重（后文的嵌入表就是这个思路）。它的问题在于<strong>没有现成的紧凑维度来描述相似性</strong>，所以稠密嵌入更直接。</p>
</div>
<div><h4 id="part-4">Learned embedding：每个 token 一行可学习数字</h4>
<div class="table-wrap"><table><caption>嵌入表 V × d，d = 3（数字为示例）</caption><thead><tr><th>token</th><th>第 1 维</th><th>第 2 维</th><th>第 3 维</th></tr></thead><tbody><tr><th scope="row">泰迪熊</th><td>0.9</td><td>0.8</td><td>−0.2</td></tr><tr><th scope="row">可爱</th><td>0.7</td><td>0.9</td><td>−0.1</td></tr><tr><th scope="row">阅读</th><td>−0.3</td><td>0.1</td><td>0.8</td></tr><tr><th scope="row">书</th><td>−0.2</td><td>0.2</td><td>0.7</td></tr><tr><th scope="row">.</th><td>0.0</td><td>−0.4</td><td>0.1</td></tr></tbody></table></div>
<p>泰迪熊与可爱的向量接近，阅读与书的向量接近。相似度已经写进数字里，可以直接用点积或余弦相似度衡量。</p>
</div>
</div>
<div class="note"><strong>两者的关系：</strong>“用 one-hot 去乘嵌入矩阵”在数学上等价于“直接按 ID 取某一行”，但实际实现通常直接查表，因为乘一个几乎全是 0 的向量很浪费。one-hot 的长度等于词表大小 V，嵌入向量的长度是另一个可选的超参数 d，通常 d 远小于 V。</div>
<p>课件用 Word2Vec（第 34–44 页）说明这种向量可以<strong>学出来</strong>：用一个代理任务（预测上下文词，或由上下文预测中心词）训练一个简单网络，取中间层学到的表示作为词向量。这里补一句课件没有强调的对比——</p>
<div class="table-wrap"><table><thead><tr><th>对比项</th><th>One-hot</th><th>Learned embedding</th></tr></thead><tbody><tr><td>长度</td><td>V（词表大小）</td><td>d（可选超参数）</td></tr><tr><td>是否可学习</td><td>否，写死</td><td>是，训练中更新</td></tr><tr><td>相似度</td><td>one-hot 空间里任意两个不同 token 都正交</td><td>可以直接用点积／余弦比较远近</td></tr><tr><td>参数量</td><td>0（只是下标）</td><td>V × d</td></tr></tbody></table></div>
<h3 id="part-5">还要分清两种“表示”</h3>
<p>下面两项区别很重要：</p>
<ul><li><strong>初始 token embedding：</strong>同一个 token 通常查到相同的初始向量。</li><li><strong>上下文表示：</strong>经过后续层后，会根据句子中的其他内容发生变化。例如同一个 <code>bank</code>，可以在不同上下文中表示“银行”或“河岸”。</li></ul>
<div class="note">这里用二维向量方便计算。真实模型的向量通常有更多维度，每个维度通常也没有预先指定的人类含义。</div>
<p class="source">课件定位：第 33–44 页；上下文表示见第 104 页。</p>
</section>
