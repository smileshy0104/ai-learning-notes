---
slug: background
title: "前置动机：从计数到学习表示"
collection: cme295
lecture: 1
description: "N-gram、神经语言模型与向量相似度。"
order: 30
kind: lesson
status: published
tags: ["N-gram","NNLM"]
---

<section id="background">
<div class="tag">补充阅读 · 参考文档 1.1–1.3 节；不是第一讲独立课件章节</div>

<p>语言模型的一个基本任务是：<strong>给定前文，为下一个 token 分配概率。</strong>最直接的办法，就是统计同样的前文后面出现过什么。</p>
<div class="math">训练小语料（两句话，分别统计，不跨句连接）：<br>[BOS] agent learns [EOS]<br>[BOS] agent works [EOS]</div>
<div class="flow"><span class="chip">前文：agent</span><span class="arrow">→ 数后继词 →</span><span class="chip">learns：1 次 → 1/2</span><span class="chip">works：1 次 → 1/2</span></div>
<p>这叫 Bigram：只看前一个词。一般 N-gram 只看前 n−1 个词，用局部历史近似完整历史。这里的 n 是 N-gram 阶数，与后文表示序列长度的 n 属于不同语境。</p>
<div class="math">P(下一个词 | 当前词) = 两词相邻出现次数 / 当前词作为前文的次数<br>P(agent | [BOS]) = 2/2 = 1<br>P(learns | agent) = 1/2<br>P([EOS] | learns) = 1/1 = 1<br>P(agent learns [EOS] | [BOS]) = 1 × 1/2 × 1 = 1/2</div>
<div class="grid"><div class="layer"><strong>问题一：没见过的组合怎么办？</strong><br>若 robot 在训练语料里没出现，分母计数为 0，无法直接给出概率估计；即使见过 robot，新组合 robot learns 也可能计数为 0。平滑与回退能缓解，但需要额外规则。</div><div class="layer"><strong>问题二：相似词不能自然共享知识</strong><br>agent learns 出现过，不等于计数表就知道 robot learns 也合理。神经模型通过学习表示与共享参数，获得更多泛化机会。</div></div>
<p>学习向量的动机因此很具体：把离散符号映射到能计算、能共享统计规律的空间。它不保证每个新组合都合理，但能避免只靠独立的词组计数。</p>
<h2 id="part-2">从“学表示”到“用表示计算相似”</h2>
<p>2003 年的神经语言模型（NNLM）把两件事合在一起：先给每个词一张稠密向量表，再用前馈网络根据前几个词预测下一个词。收益很直接：<strong>没见过的组合也能得到一个合理的概率</strong>，因为相似词共享相近的参数。</p>
<div class="flow"><span class="chip">离散词 → 查表得到稠密向量</span><span class="arrow">→</span><span class="chip">拼接前 n−1 个词的向量</span><span class="arrow">→</span><span class="chip">前馈网络</span><span class="arrow">→</span><span class="chip">词表上的概率</span></div>
<p>一旦词变成了向量，“意思接近”就能用数字衡量。常用<strong>余弦相似度</strong>，它只看方向、不看长度：</p>
<div class="math">cos(a, b) = (a · b) / (|a| × |b|)<br>1 → 方向相同；0 → 正交；−1 → 方向相反</div>
<p>用本页第 ② 节的示例嵌入表算一下（这些数字是教学示例，不是真实模型输出）：</p>
<div class="table-wrap"><table><thead><tr><th>词对</th><th>余弦相似度</th><th>怎么读</th></tr></thead><tbody><tr><th>泰迪熊 · 可爱</th><td>0.981</td><td>方向几乎一致，意思接近</td></tr><tr><th>阅读 · 书</th><td>0.985</td><td>同为“阅读类”语境</td></tr><tr><th>泰迪熊 · 阅读</th><td>−0.333</td><td>方向偏反，关系疏远</td></tr><tr><th>可爱 · “.”</th><td>−0.784</td><td>符号类 token 与语义词差距大</td></tr></tbody></table></div>
<div class="note">余弦只看方向。若把某个向量整体放大两倍，它与别的词的余弦相似度不变，但欧氏距离会变。这也是为什么相似度常优先用余弦。</div>
<details><summary>与第一讲的联系</summary><p>课程从词表示与 RNN 讲起。这里补上它们之前的动机：计数模型难以充分共享知识 → 学习向量表示；静态向量没有当前语境 → 序列模型；循环传递路径很长 → 注意力直接读取相关位置。</p></details>
</section>
