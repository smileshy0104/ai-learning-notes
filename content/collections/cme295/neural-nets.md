---
slug: neural-nets
title: "Word2Vec、RNN 与 LSTM"
collection: cme295
lecture: 1
description: "从浅层网络到序列建模，理解早期注意力的动机。"
order: 60
kind: lesson
status: published
tags: ["RNN","LSTM","Word2Vec"]
---

<section id="neural-nets" class="switch">
<div class="tag">Pre-Transformer · Word2vec / RNN / LSTM / 早期注意力（课件第 34–55 页）</div>

<p>前面把 token 变成了向量、把位置换成了上下文表示，但还没有看到<strong>神经网络本身</strong>。课件用三张图串起这条历史：Word2vec 学词向量 → RNN 处理顺序 → 注意力解决长距离依赖。</p>

<h2 id="part-2">1. Word2vec：一个很窄的神经网络</h2>
<p>课件第 35 页的结构只有三层：输入大小 V，隐藏层大小 d，输出大小 V。中间那层就是我们要的词向量。</p>
<svg viewBox="0 0 800 290" role="img" aria-label="Word2vec 神经网络结构：输入 V 维 one-hot，隐藏层 d 维，输出 V 维概率" style="width:100%;height:auto;max-width:720px;display:block;margin:14px auto">
<text x="150" y="14" font-size="13" text-anchor="middle" fill="#53677b">输入 one-hot（V=6）</text>
<text x="390" y="14" font-size="13" text-anchor="middle" fill="#53677b">隐藏层（d=2）</text>
<text x="630" y="14" font-size="13" text-anchor="middle" fill="#53677b">输出 softmax（V=6）</text>
<line x1="166" y1="30" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="30" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="64" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="64" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="98" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="98" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="132" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="132" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="166" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="166" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="200" x2="374" y2="95" stroke="#c9d8ea" stroke-width="1"/><line x1="166" y1="200" x2="374" y2="165" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="30" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="64" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="98" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="132" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="166" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="95" x2="614" y2="200" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="30" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="64" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="98" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="132" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="166" stroke="#c9d8ea" stroke-width="1"/><line x1="406" y1="165" x2="614" y2="200" stroke="#c9d8ea" stroke-width="1"/>
<circle cx="150" cy="30" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="150" cy="64" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="150" cy="98" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="150" cy="132" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="150" cy="166" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="150" cy="200" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/>
<circle cx="390" cy="95" r="16" fill="#fff6e6" stroke="#db8b16" stroke-width="1.5"/><circle cx="390" cy="165" r="16" fill="#fff6e6" stroke="#db8b16" stroke-width="1.5"/>
<circle cx="630" cy="30" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="630" cy="64" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="630" cy="98" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="630" cy="132" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="630" cy="166" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><circle cx="630" cy="200" r="16" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/>
<text x="124" y="35" font-size="13" text-anchor="end" fill="#193049">A</text><text x="124" y="69" font-size="13" text-anchor="end" fill="#193049">cute</text><text x="124" y="103" font-size="13" text-anchor="end" fill="#193049">teddy bear</text><text x="124" y="137" font-size="13" text-anchor="end" fill="#193049">is</text><text x="124" y="171" font-size="13" text-anchor="end" fill="#193049">reading</text><text x="124" y="205" font-size="13" text-anchor="end" fill="#193049">.</text><text x="656" y="35" font-size="13" fill="#193049">A</text><text x="656" y="69" font-size="13" fill="#193049">cute</text><text x="656" y="103" font-size="13" fill="#193049">teddy bear</text><text x="656" y="137" font-size="13" fill="#193049">is</text><text x="656" y="171" font-size="13" fill="#193049">reading</text><text x="656" y="205" font-size="13" fill="#193049">.</text>
<text x="270" y="258" font-size="12" text-anchor="middle" fill="#53677b">权重 W₁：V×d</text>
<text x="510" y="258" font-size="12" text-anchor="middle" fill="#53677b">权重 W₂：d×V</text>
</svg>
<p>训练时并不是在做“翻译”或“分类”这种真正的目标，而是在做一个<strong>代理任务</strong>：给一个词，预测它周围的词或下一个词。这个预测任务本身不重要，重要的是训练完之后，隐藏层那组数字变得有意义了。</p>
<p>课件第 36–41 页用一句话演示：用 “A” 预测 “cute”。下面切换两个阶段看数字怎样变化（数字为教学示例，用于说明变化方向）：</p>
<input type="radio" name="w2v" id="w2v-1" checked>
<input type="radio" name="w2v" id="w2v-2">
<div class="controls" role="group" aria-label="Word2vec 训练前后"><span>阶段：</span><label for="w2v-1">训练前（初始权重）</label><label for="w2v-2">训练后（若干次更新）</label></div>
<div class="panel panel-w2v1">
<div class="grid"><div><h3 id="part-3">输出层：下一个 token 的概率</h3><div class="bars"><div class="barrow"><span>A</span><div class="track"><div class="fill" style="width:15%"></div></div><span>15%</span></div><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:40%"></div></div><span>40%</span></div><div class="barrow"><span>teddy bear</span><div class="track"><div class="fill" style="width:15%"></div></div><span>15%</span></div><div class="barrow"><span>is</span><div class="track"><div class="fill" style="width:10%"></div></div><span>10%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:10%"></div></div><span>10%</span></div><div class="barrow"><span>.</span><div class="track"><div class="fill" style="width:10%"></div></div><span>10%</span></div></div></div>
<div><h3 id="part-4">与目标比较</h3>
<div class="table-wrap"><table><thead><tr><th>项目</th><th>值</th></tr></thead><tbody>
<tr><th scope="row">输入</th><td>“A” → [1,0,0,0,0,0]</td></tr>
<tr><th scope="row">隐藏层 d=2</th><td>可学习向量</td></tr>
<tr><th scope="row">目标</th><td>“cute” → [0,1,0,0,0,0]</td></tr>
<tr><th scope="row">cute 的概率</th><td>40%</td></tr>
<tr><th scope="row">交叉熵损失</th><td>−ln(0.4) ≈ 0.916</td></tr>
</tbody></table></div>
<p>模型把“cute”的概率只给到 0.40，与目标 [0,1,0,0,0,0] 差距大，交叉熵损失较高。</p>
</div></div>
</div>
<div class="panel panel-w2v2">
<div class="grid"><div><h3 id="part-5">输出层：下一个 token 的概率</h3><div class="bars"><div class="barrow"><span>A</span><div class="track"><div class="fill" style="width:5%"></div></div><span>5%</span></div><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:76%"></div></div><span>76%</span></div><div class="barrow"><span>teddy bear</span><div class="track"><div class="fill" style="width:5%"></div></div><span>5%</span></div><div class="barrow"><span>is</span><div class="track"><div class="fill" style="width:6%"></div></div><span>6%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:4%"></div></div><span>4%</span></div><div class="barrow"><span>.</span><div class="track"><div class="fill" style="width:4%"></div></div><span>4%</span></div></div></div>
<div><h3 id="part-6">与目标比较</h3>
<div class="table-wrap"><table><thead><tr><th>项目</th><th>值</th></tr></thead><tbody>
<tr><th scope="row">输入</th><td>“A” → [1,0,0,0,0,0]</td></tr>
<tr><th scope="row">隐藏层 d=2</th><td>可学习向量</td></tr>
<tr><th scope="row">目标</th><td>“cute” → [0,1,0,0,0,0]</td></tr>
<tr><th scope="row">cute 的概率</th><td>76%</td></tr>
<tr><th scope="row">交叉熵损失</th><td>−ln(0.76) ≈ 0.274</td></tr>
</tbody></table></div>
<p>同样的输入“A”，模型把“cute”的概率提高到 0.76，损失下降。隐藏层向量也随之改变。</p>
</div></div>
</div>
<div class="note">为什么这样能学到语义？因为经常出现在相似上下文里的词，会被同一套权重推向相似的隐藏向量。课件举的例子是“泰迪熊之于柔软”和“巴黎之于法国，柏林之于德国”——这种关系不是人工标注的，而是训练中浮现的。</div>
<details><summary>交叉熵损失在这里到底在做什么？</summary><p>目标是 “cute” 的 one-hot 向量，模型给出的是 6 个概率。交叉熵只关心目标那一项的概率多大：越接近 1 损失越小。梯度回传后，W₁ 和 W₂ 都会调整，使下次遇到同样的输入时，“cute” 的概率更高。</p><p>课件里隐藏层写作 [0.2, 0.9] 这类二维向量。真实模型 d 通常是几百到几千维。</p></details>

<h2 id="part-7">2. RNN：把顺序信息带进来</h2>
<p>词向量本身不知道词序：“孩子抱着泰迪熊”和“泰迪熊抱着孩子”会得到同样的向量集合。RNN 通过一个<strong>隐藏状态</strong>把“已经读过什么”传递下去：</p>
<div class="math">h_t = f(h_{t-1}, x_t)</div>
<svg viewBox="0 0 800 200" role="img" aria-label="RNN 按时间展开：每个时刻接收当前 token 与上一时刻的隐藏状态，输出新的隐藏状态" style="width:100%;height:auto;max-width:720px;display:block;margin:14px auto">
<defs>
<marker id="rnn-in" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#53677b"/></marker>
<marker id="rnn-h" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#db8b16"/></marker>
</defs>
<text x="400" y="18" font-size="12" text-anchor="middle" fill="#53677b">橙色箭头＝隐藏状态 h 的传递；灰色箭头＝当前输入 token</text>
<rect x="36" y="80" width="88" height="52" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><text x="80" y="112" font-size="15" text-anchor="middle" fill="#193049">RNN</text><line x1="80" y1="150" x2="80" y2="134" stroke="#53677b" stroke-width="1.4" marker-end="url(#rnn-in)"/><text x="80" y="170" font-size="14" text-anchor="middle" fill="#193049">A</text><text x="80" y="46" font-size="12" text-anchor="middle" fill="#db8b16">h1</text><line x1="80" y1="80" x2="80" y2="60" stroke="#db8b16" stroke-width="1.4" marker-end="url(#rnn-h)"/><line x1="124" y1="106" x2="181" y2="106" stroke="#db8b16" stroke-width="1.6" marker-end="url(#rnn-h)"/><rect x="181" y="80" width="88" height="52" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><text x="225" y="112" font-size="15" text-anchor="middle" fill="#193049">RNN</text><line x1="225" y1="150" x2="225" y2="134" stroke="#53677b" stroke-width="1.4" marker-end="url(#rnn-in)"/><text x="225" y="170" font-size="14" text-anchor="middle" fill="#193049">cute</text><text x="225" y="46" font-size="12" text-anchor="middle" fill="#db8b16">h2</text><line x1="225" y1="80" x2="225" y2="60" stroke="#db8b16" stroke-width="1.4" marker-end="url(#rnn-h)"/><line x1="269" y1="106" x2="326" y2="106" stroke="#db8b16" stroke-width="1.6" marker-end="url(#rnn-h)"/><rect x="326" y="80" width="88" height="52" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><text x="370" y="112" font-size="15" text-anchor="middle" fill="#193049">RNN</text><line x1="370" y1="150" x2="370" y2="134" stroke="#53677b" stroke-width="1.4" marker-end="url(#rnn-in)"/><text x="370" y="170" font-size="14" text-anchor="middle" fill="#193049">teddy bear</text><text x="370" y="46" font-size="12" text-anchor="middle" fill="#db8b16">h3</text><line x1="370" y1="80" x2="370" y2="60" stroke="#db8b16" stroke-width="1.4" marker-end="url(#rnn-h)"/><line x1="414" y1="106" x2="471" y2="106" stroke="#db8b16" stroke-width="1.6" marker-end="url(#rnn-h)"/><rect x="471" y="80" width="88" height="52" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><text x="515" y="112" font-size="15" text-anchor="middle" fill="#193049">RNN</text><line x1="515" y1="150" x2="515" y2="134" stroke="#53677b" stroke-width="1.4" marker-end="url(#rnn-in)"/><text x="515" y="170" font-size="14" text-anchor="middle" fill="#193049">is</text><text x="515" y="46" font-size="12" text-anchor="middle" fill="#db8b16">h4</text><line x1="515" y1="80" x2="515" y2="60" stroke="#db8b16" stroke-width="1.4" marker-end="url(#rnn-h)"/><line x1="559" y1="106" x2="616" y2="106" stroke="#db8b16" stroke-width="1.6" marker-end="url(#rnn-h)"/><rect x="616" y="80" width="88" height="52" rx="10" fill="#edf4ff" stroke="#2166cd" stroke-width="1.5"/><text x="660" y="112" font-size="15" text-anchor="middle" fill="#193049">RNN</text><line x1="660" y1="150" x2="660" y2="134" stroke="#53677b" stroke-width="1.4" marker-end="url(#rnn-in)"/><text x="660" y="170" font-size="14" text-anchor="middle" fill="#193049">reading</text><text x="660" y="46" font-size="12" text-anchor="middle" fill="#db8b16">h5</text><line x1="660" y1="80" x2="660" y2="60" stroke="#db8b16" stroke-width="1.4" marker-end="url(#rnn-h)"/>
<text x="400" y="194" font-size="12" text-anchor="middle" fill="#53677b">✘ 必须逐个时间步计算　✘ 早期信息要经过多次传递</text>
</svg>
<p>课件第 51 页展示了 RNN 能承担的几类任务：生成（输入文本 → 输出文本）、分类（输入文本 → 一个类别）、多分类（每个位置一个标签，如词性）、情感分析、翻译、命名实体识别。</p>
<details><summary>RNN 的两个硬伤</summary><p><strong>长距离依赖：</strong>所有历史都被压进一个固定长度的向量里，反复改写后早期信息容易丢失。比如先说“我的泰迪熊有 3 英尺高”，隔了很多词之后再说“它”，此时“它”指谁已经很难从当前隐藏状态里读出来。</p><p><strong>无法并行：</strong>h_t 依赖 h_{t-1}，必须一个接一个算，训练慢。这两点正是 Transformer 想要解决的问题。</p></details>

<h2 id="part-8">3. LSTM：加一条更长的“记忆通道”</h2>
<p>课件第 52 页提到 LSTM（1997）保留了隐藏状态，但额外引入<strong>细胞状态</strong>，并用门来控制“写入多少、保留多少、输出多少”。这里给出简化示意，不展开公式：</p>
<div class="grid">
<div class="layer"><strong>遗忘门</strong><br>决定旧记忆保留多少</div>
<div class="layer"><strong>输入门</strong><br>决定新信息写入多少</div>
<div class="layer"><strong>输出门</strong><br>决定当前输出取多少</div>
<div class="layer"><strong>细胞状态</strong><br>一条贯穿时间步的通道，<br>比隐藏状态更容易长期保存信息</div>
</div>
<p>它缓解了长距离依赖，但仍然是<strong>顺序计算</strong>，也没有彻底解决信息在长序列中被稀释的问题。这是注意力机制出现的直接动机。</p>

<h2 id="part-9">4. 早期注意力：翻译时“回头看原文”</h2>
<p>课件第 54–55 页介绍 2014 年 Bahdanau 等人的工作。翻译长句时，seq2seq 模型原本只能靠编码器最后那个隐藏状态记住整句，注意力允许解码器在生成每个词时<strong>直接读取源句的相关位置</strong>：</p>
<svg viewBox="0 0 800 215" role="img" aria-label="序列到序列翻译中，生成 lit 时通过注意力直接读取源句的 reading" style="width:100%;height:auto;max-width:720px;display:block;margin:14px auto">
<text x="12" y="24" font-size="12" fill="#53677b">源句（编码器）</text>
<text x="12" y="120" font-size="12" fill="#53677b">译文（解码器，逐步生成）</text>
<rect x="40" y="34" width="100" height="38" rx="8" fill="#edf4ff" stroke="#2166cd" stroke-width="1.4"/><text x="90" y="59" font-size="13" text-anchor="middle" fill="#193049">A</text><rect x="185" y="34" width="100" height="38" rx="8" fill="#edf4ff" stroke="#2166cd" stroke-width="1.4"/><text x="235" y="59" font-size="13" text-anchor="middle" fill="#193049">cute</text><rect x="330" y="34" width="100" height="38" rx="8" fill="#edf4ff" stroke="#2166cd" stroke-width="1.4"/><text x="380" y="59" font-size="13" text-anchor="middle" fill="#193049">teddy bear</text><rect x="475" y="34" width="100" height="38" rx="8" fill="#edf4ff" stroke="#2166cd" stroke-width="1.4"/><text x="525" y="59" font-size="13" text-anchor="middle" fill="#193049">is</text><rect x="620" y="34" width="100" height="38" rx="8" fill="#edf4ff" stroke="#2166cd" stroke-width="1.4"/><text x="670" y="59" font-size="13" text-anchor="middle" fill="#193049">reading</text><rect x="43" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="85" y="149" font-size="13" text-anchor="middle" fill="#193049">Un</text><rect x="165" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="207" y="149" font-size="13" text-anchor="middle" fill="#193049">ours</text><rect x="287" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="329" y="149" font-size="13" text-anchor="middle" fill="#193049">en</text><rect x="409" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="451" y="149" font-size="13" text-anchor="middle" fill="#193049">peluche</text><rect x="531" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="573" y="149" font-size="13" text-anchor="middle" fill="#193049">mignon</text><rect x="653" y="126" width="84" height="34" rx="8" fill="#fff6e6" stroke="#db8b16" stroke-width="1.4"/><text x="695" y="149" font-size="13" text-anchor="middle" fill="#193049">lit</text>
<line x1="695" y1="126" x2="670" y2="74" stroke="#c0392b" stroke-width="2.2" stroke-dasharray="6 4" marker-end="url(#attnarrow)"/>
<defs><marker id="attnarrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#c0392b"/></marker></defs>
<text x="400" y="200" font-size="12" text-anchor="middle" fill="#c0392b">红色虚线：要生成 lit 时，注意力直接指向源句的 reading</text>
<text x="400" y="184" font-size="12" text-anchor="middle" fill="#53677b">不必只依赖一个被反复改写的隐藏状态</text>
</svg>
<p>要生成法语 “lit”（读）时，模型可以直接把注意力放到源句的 “reading” 上，而不必依赖一个被反复压缩的状态向量。这就是后来 Transformer 里 self-attention 的思想来源。</p>
<div class="note">注意区别：这里的注意力连接的是<strong>解码器和编码器</strong>（cross-attention 的前身，2014 年）；Transformer 的核心创新是把注意力用在<strong>同一序列内部</strong>（self-attention），并几乎不再依赖循环结构。</div>
<h2 id="part-10">训练完只留一张表，网络本身会丢掉</h2>
<p>Word2vec 的隐藏层没有激活函数，本质就是“按 ID 取一行向量”。训练结束后，中间那个嵌入矩阵才是产品，其余权重可以丢弃。这解释了为什么它常被叫作“词向量算法”，而不是“语言模型”。</p>
<h2 id="part-11">词频太高或太低都不好算：负采样</h2>
<p>原始做法要对整个词表做 softmax。词表十万级时，每预测一个词都要算十万个分数。负采样把它改造成一组二分类：</p>
<div class="flow"><span class="chip">正样本：真实相邻的词对<br>(agent, learns) → 1</span><span class="chip">负样本：随机抽 5～15 个不相关的词<br>(agent, apple) → 0</span><span class="arrow">→</span><span class="chip">判断“这两个词是否相邻”</span></div>
<p>这样就不必遍历整个词表，训练速度大幅提升。代价是它优化的是近似目标，而不是完整的 softmax 概率。</p>
<details><summary>顺带认识另两个词向量方法</summary>
<div class="table-wrap"><table><thead><tr><th>方法</th><th>核心做法</th><th>主要优势</th><th>主要局限</th></tr></thead><tbody>
<tr><th>Word2Vec（2013）</th><td>用浅层网络做预测任务：CBOW 由上下文猜中心词，Skip-gram 由中心词猜上下文</td><td>简单、训练快，词向量成为独立产品</td><td>静态；只利用局部窗口</td></tr>
<tr><th>GloVe（2014）</th><td>统计全局共现矩阵，再分解，使两个词向量的点积接近共现次数的对数</td><td>利用全局统计信息</td><td>静态；仍需预先统计共现</td></tr>
<tr><th>FastText（2016）</th><td>把词拆成字符 n-gram，词向量为这些子词向量之和</td><td>能拼出未见过的词，对拼写变体更稳</td><td>存储开销大</td></tr>
</tbody></table></div>
<p>三者的共同边界仍然是：一个词只有一个向量，与它出现在哪个句子无关。这正是 ELMo、BERT、GPT 要解决的问题——把向量从“查出来”变成“算出来”。</p></details>
<p class="source">课件定位：第 34–44 页（Word2vec）、45–52 页（RNN、LSTM）、53 页（方法对比表）、54–55 页（早期注意力）。网络结构图为按课件重绘的简化示意，概率与损失数值为教学示例。</p>
</section>
