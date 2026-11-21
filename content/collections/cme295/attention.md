---
slug: attention
title: "自注意力 · Self-attention"
collection: cme295
lecture: 1
description: "Q/K/V、矩阵维度、手算过程与可交互的权重实验。"
order: 70
kind: lesson
status: published
tags: ["Attention","QKV"]
---

<section id="attention" class="switch">
<div class="tag">Lecture outline · Self-attention mechanism（课件第 57–62 页）</div>

<h2 id="part-2">注意力到底在做什么：一个通用框架</h2>
<p>先不谈 Transformer。人在读句子时会<strong>有选择地分配注意力</strong>——“小明把书放在桌上，然后他去吃饭，因为他饿了”里的“他”显然指小明，而不是句子里的每个字都同等重要。注意力机制就是把这件事数学化：给每个位置算一个权重，权重高的信息保留得多。</p>
<p>所有注意力都可以写成同一个框架：<strong>用 Query 去查 Key，取回 Value</strong>。</p>
<div class="table-wrap"><table><thead><tr><th>角色</th><th>图书馆类比</th><th>含义</th></tr></thead><tbody><tr><th>Query（Q）</th><td>你的检索需求</td><td>我现在想找什么信息？</td></tr><tr><th>Key（K）</th><td>每本书的标签／索引</td><td>我能提供什么特征，供你匹配？</td></tr><tr><th>Value（V）</th><td>书里的实际内容</td><td>匹配上了，我实际给你什么信息？</td></tr></tbody></table></div>
<div class="math">① Q 与所有 K 做点积 → 匹配分数<br>② 分数过 softmax → 权重（非负、和为 1）<br>③ 用权重加权求和 V → 本次的输出</div>
<p class="small muted">记住这个框架，后面的多模态、检索增强（RAG）本质上都是同一套“查询—检索—汇总”。</p>
<p>先把视线固定在“泰迪熊”这个位置。我们给它一个查询向量 <strong>Q</strong>，用 Q 与各位置的 <strong>K</strong> 计算匹配分数，再按权重汇总各位置的 <strong>V</strong>。</p>
<div class="flow"><span class="chip">Q：用来匹配的信息需求</span><span class="chip">K：供匹配的特征</span><span class="chip">V：实际读取的信息</span></div>
<p>点击不同的 Q，查看同一组 K 和 V 会得到什么结果。这一步先允许读取全部三个位置。Q 是查询，K 提供匹配特征，V 是被读取的信息。</p>
<input type="radio" name="qpreset" id="qpreset-1" checked>
<input type="radio" name="qpreset" id="qpreset-2">
<input type="radio" name="qpreset" id="qpreset-3">
<input type="radio" name="qpreset" id="qpreset-4">
<input type="radio" name="qpreset" id="qpreset-5">
<div class="controls" role="group" aria-label="选择查询向量"><span>选择 Q：</span><label for="qpreset-1">Q=[1,0]</label><label for="qpreset-2">Q=[2,−2]</label><label for="qpreset-3">Q=[0,0]</label><label for="qpreset-4">Q=[2,2]</label><label for="qpreset-5">Q=[−2,2]</label></div>
<div class="panel panel-p1">
<div class="table-wrap"><table><caption>单个查询的完整计算：Q = [1, 0]，d_k = 2</caption><thead><tr><th>位置</th><th>K</th><th>V</th><th>Q · K</th><th>除以 √2 后</th><th>softmax 权重</th></tr></thead><tbody><tr><th scope="row">泰迪熊</th><td>[1,0]</td><td>[1,0]</td><td>1.000</td><td>0.707</td><td>40.11%</td></tr><tr><th scope="row">可爱</th><td>[0,1]</td><td>[0,2]</td><td>0.000</td><td>0.000</td><td>19.78%</td></tr><tr><th scope="row">阅读</th><td>[1,1]</td><td>[1,1]</td><td>1.000</td><td>0.707</td><td>40.11%</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-3">读取比例</h3><div class="bars"><div class="barrow"><span>泰迪熊</span><div class="track"><div class="fill" style="width:40.11%"></div></div><span>40.1%</span></div><div class="barrow"><span>可爱</span><div class="track"><div class="fill" style="width:19.78%"></div></div><span>19.8%</span></div><div class="barrow"><span>阅读</span><div class="track"><div class="fill" style="width:40.11%"></div></div><span>40.1%</span></div></div></div><div><h3 id="part-4">汇总后的输出向量</h3><div class="math">0.401 × [1,0] + 0.198 × [0,2] + 0.401 × [1,1] ≈ [0.802, 0.797]</div><p class="small muted">每个维度都用相同权重求和。这里只展示一个头、一个查询位置。</p></div></div>
</div>
<div class="panel panel-p2">
<div class="table-wrap"><table><caption>单个查询的完整计算：Q = [2, −2]，d_k = 2</caption><thead><tr><th>位置</th><th>K</th><th>V</th><th>Q · K</th><th>除以 √2 后</th><th>softmax 权重</th></tr></thead><tbody><tr><th scope="row">泰迪熊</th><td>[1,0]</td><td>[1,0]</td><td>2.000</td><td>1.414</td><td>76.79%</td></tr><tr><th scope="row">可爱</th><td>[0,1]</td><td>[0,2]</td><td>-2.000</td><td>-1.414</td><td>4.54%</td></tr><tr><th scope="row">阅读</th><td>[1,1]</td><td>[1,1]</td><td>0.000</td><td>0.000</td><td>18.67%</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-5">读取比例</h3><div class="bars"><div class="barrow"><span>泰迪熊</span><div class="track"><div class="fill" style="width:76.79%"></div></div><span>76.8%</span></div><div class="barrow"><span>可爱</span><div class="track"><div class="fill" style="width:4.54%"></div></div><span>4.5%</span></div><div class="barrow"><span>阅读</span><div class="track"><div class="fill" style="width:18.67%"></div></div><span>18.7%</span></div></div></div><div><h3 id="part-6">汇总后的输出向量</h3><div class="math">0.768 × [1,0] + 0.045 × [0,2] + 0.187 × [1,1] ≈ [0.955, 0.277]</div><p class="small muted">每个维度都用相同权重求和。这里只展示一个头、一个查询位置。</p></div></div>
</div>
<div class="panel panel-p3">
<div class="table-wrap"><table><caption>单个查询的完整计算：Q = [0, 0]，d_k = 2</caption><thead><tr><th>位置</th><th>K</th><th>V</th><th>Q · K</th><th>除以 √2 后</th><th>softmax 权重</th></tr></thead><tbody><tr><th scope="row">泰迪熊</th><td>[1,0]</td><td>[1,0]</td><td>0.000</td><td>0.000</td><td>33.33%</td></tr><tr><th scope="row">可爱</th><td>[0,1]</td><td>[0,2]</td><td>0.000</td><td>0.000</td><td>33.33%</td></tr><tr><th scope="row">阅读</th><td>[1,1]</td><td>[1,1]</td><td>0.000</td><td>0.000</td><td>33.33%</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-7">读取比例</h3><div class="bars"><div class="barrow"><span>泰迪熊</span><div class="track"><div class="fill" style="width:33.33%"></div></div><span>33.3%</span></div><div class="barrow"><span>可爱</span><div class="track"><div class="fill" style="width:33.33%"></div></div><span>33.3%</span></div><div class="barrow"><span>阅读</span><div class="track"><div class="fill" style="width:33.33%"></div></div><span>33.3%</span></div></div></div><div><h3 id="part-8">汇总后的输出向量</h3><div class="math">0.333 × [1,0] + 0.333 × [0,2] + 0.333 × [1,1] ≈ [0.667, 1.000]</div><p class="small muted">每个维度都用相同权重求和。这里只展示一个头、一个查询位置。</p></div></div>
</div>
<div class="panel panel-p4">
<div class="table-wrap"><table><caption>单个查询的完整计算：Q = [2, 2]，d_k = 2</caption><thead><tr><th>位置</th><th>K</th><th>V</th><th>Q · K</th><th>除以 √2 后</th><th>softmax 权重</th></tr></thead><tbody><tr><th scope="row">泰迪熊</th><td>[1,0]</td><td>[1,0]</td><td>2.000</td><td>1.414</td><td>16.36%</td></tr><tr><th scope="row">可爱</th><td>[0,1]</td><td>[0,2]</td><td>2.000</td><td>1.414</td><td>16.36%</td></tr><tr><th scope="row">阅读</th><td>[1,1]</td><td>[1,1]</td><td>4.000</td><td>2.828</td><td>67.28%</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-9">读取比例</h3><div class="bars"><div class="barrow"><span>泰迪熊</span><div class="track"><div class="fill" style="width:16.36%"></div></div><span>16.4%</span></div><div class="barrow"><span>可爱</span><div class="track"><div class="fill" style="width:16.36%"></div></div><span>16.4%</span></div><div class="barrow"><span>阅读</span><div class="track"><div class="fill" style="width:67.28%"></div></div><span>67.3%</span></div></div></div><div><h3 id="part-10">汇总后的输出向量</h3><div class="math">0.164 × [1,0] + 0.164 × [0,2] + 0.673 × [1,1] ≈ [0.836, 1.000]</div><p class="small muted">每个维度都用相同权重求和。这里只展示一个头、一个查询位置。</p></div></div>
</div>
<div class="panel panel-p5">
<div class="table-wrap"><table><caption>单个查询的完整计算：Q = [-2, 2]，d_k = 2</caption><thead><tr><th>位置</th><th>K</th><th>V</th><th>Q · K</th><th>除以 √2 后</th><th>softmax 权重</th></tr></thead><tbody><tr><th scope="row">泰迪熊</th><td>[1,0]</td><td>[1,0]</td><td>-2.000</td><td>-1.414</td><td>4.54%</td></tr><tr><th scope="row">可爱</th><td>[0,1]</td><td>[0,2]</td><td>2.000</td><td>1.414</td><td>76.79%</td></tr><tr><th scope="row">阅读</th><td>[1,1]</td><td>[1,1]</td><td>0.000</td><td>0.000</td><td>18.67%</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-11">读取比例</h3><div class="bars"><div class="barrow"><span>泰迪熊</span><div class="track"><div class="fill" style="width:4.54%"></div></div><span>4.5%</span></div><div class="barrow"><span>可爱</span><div class="track"><div class="fill" style="width:76.79%"></div></div><span>76.8%</span></div><div class="barrow"><span>阅读</span><div class="track"><div class="fill" style="width:18.67%"></div></div><span>18.7%</span></div></div></div><div><h3 id="part-12">汇总后的输出向量</h3><div class="math">0.045 × [1,0] + 0.768 × [0,2] + 0.187 × [1,1] ≈ [0.232, 1.723]</div><p class="small muted">每个维度都用相同权重求和。这里只展示一个头、一个查询位置。</p></div></div>
</div>
<div class="note small">在支持脚本的浏览器中，本页还会额外显示一组滑块，可以连续调出预设以外的 Q。当前窗口若禁用了脚本，预设按钮仍然完全可用。</div>
<div id="slider-demo" hidden>
<h2 id="part-13">连续调节 Q（需要脚本）</h2>
<div class="controls"><label for="q1">Q 的第 1 维：<output id="q1-value">1.0</output></label><input id="q1" type="range" min="-2" max="2" step="0.1" value="1"><label for="q2">第 2 维：<output id="q2-value">0.0</output></label><input id="q2" type="range" min="-2" max="2" step="0.1" value="0"><button id="reset" type="button">重置</button></div>
<div class="table-wrap"><table><caption>滑块结果：d_k = 2</caption><thead><tr><th>位置</th><th>K</th><th>V</th><th>Q · K</th><th>除以 √2 后</th><th>softmax 权重</th></tr></thead><tbody id="attention-table"></tbody></table></div>
<div class="grid"><div><h3 id="part-14">读取比例</h3><div id="attention-bars" class="bars"></div></div><div><h3 id="part-15">汇总后的输出向量</h3><div id="attention-result" class="math" aria-live="polite"></div></div></div>
</div>
<h2 id="part-16">自注意力的六个步骤（带形状）</h2>
<p>设序列长度 n、模型维度 d_model、每个头的键维度 d_k。“自”是指 Q、K、V 都来自同一批输入。</p>
<div class="table-wrap"><table><thead><tr><th>步骤</th><th>做什么</th><th>形状</th></tr></thead><tbody>
<tr><td>①</td><td>输入 X 分别乘三个可学习矩阵，得到 Q、K、V</td><td>X: n×d_model → Q,K: n×d_k；V: n×d_v</td></tr>
<tr><td>②</td><td>Q 与 K 转置相乘，得到每个查询对每个键的分数</td><td>QKᵀ: n×n</td></tr>
<tr><td>③</td><td>除以 √d_k 控制数值尺度（维度过大时点积会很大，softmax 会过尖）</td><td>n×n</td></tr>
<tr><td>④</td><td>按行做 softmax，每行和为 1</td><td>n×n 权重矩阵 A</td></tr>
<tr><td>⑤</td><td>A 乘 V，按权重汇总信息</td><td>n×d_v</td></tr>
<tr><td>⑥</td><td>多头时把各头结果拼接，再乘 W_O 回到 d_model</td><td>n×d_model</td></tr>
</tbody></table></div>
<p class="small muted">第 ② 步的 n×n 就是注意力开销随序列长度平方增长的原因；第 ③ 步的缩放不影响表达力，只影响优化是否稳定。</p>
<details><summary>展开公式：为什么要做这几步？</summary><div class="math">分数 s_j = (q · k_j) / √d_k<br>权重 a_j = exp(s_j) / Σ exp(s_l)<br>输出 z = Σ a_j v_j</div><p>点积衡量经过学习的查询与键的匹配程度。缩放用来控制分数尺度；softmax 把分数变成非负且总和为 1 的权重。最后按权重混合 V。</p><p>把所有位置的查询一起计算，就是：</p><div class="math">Attention(Q,K,V) = softmax(QKᵀ / √d_k) V</div><p>如果共有 n 个位置，Q 与 K 都是 n × d_k，QKᵀ 就是 n × n。每一行对应一个查询，每一列对应一个被读取的位置。softmax 对每一行分别计算。</p></details>
<details><summary>Q、K、V 从哪里来？</summary><p>真实模型通过不同的可学习矩阵对输入 X 做投影：Q = XW_Q，K = XW_K，V = XW_V。这里直接给定 K、V 并调整 Q，是为了隔离并看清匹配与汇总的过程。滑块不表示真实模型会让人手动设置查询。</p></details>
<details><summary>试一试：把 Q 的两维都调成 0，会怎样？</summary><p>所有点积都等于 0，所以三个位置的权重均为 1/3。即使各个 V 不同，读取比例也相同。你可以再把 Q 改为 [2, −2]，观察它与 [1, 0]、[0, 1]、[1, 1] 三个键的匹配差异。</p></details>
<details><summary>更完整的手算：5 个位置，d_k = 3</summary>
<p>固定第 5 个位置“现在分词”作为查询，q = [1, 0, 1]。为了专注机制，这里直接给定 K 与 V；真实模型中它们由输入乘 W_K、W_V 得到。下表中权重之和为 1.000。</p>
<div class="table-wrap"><table><caption>点积 → 缩放 → 减最大值 → exp → 归一化</caption><thead><tr><th>位置</th><th>K</th><th>V</th><th>q · k</th><th>÷√3</th><th>− 最大值</th><th>exp</th><th>权重</th></tr></thead><tbody><tr><th scope="row">泰迪熊</th><td>[1, 1, 0]</td><td>[0.6, 0.2, 0.1]</td><td>1.000</td><td>0.577</td><td>-0.577</td><td>0.561</td><td>0.152</td></tr><tr><th scope="row">可爱</th><td>[1, 0, 1]</td><td>[0.5, 0.1, 0.3]</td><td>2.000</td><td>1.155</td><td>0.000</td><td>1.000</td><td>0.271</td></tr><tr><th scope="row">阅读</th><td>[0, 1, 1]</td><td>[0.1, 0.7, 0.4]</td><td>1.000</td><td>0.577</td><td>-0.577</td><td>0.561</td><td>0.152</td></tr><tr><th scope="row">是</th><td>[1, 1, 1]</td><td>[0.2, 0.2, 0.2]</td><td>2.000</td><td>1.155</td><td>0.000</td><td>1.000</td><td>0.271</td></tr><tr><th scope="row">现在分词</th><td>[0, 0, 1]</td><td>[0.1, 0.3, 0.8]</td><td>1.000</td><td>0.577</td><td>-0.577</td><td>0.561</td><td>0.152</td></tr></tbody></table></div>
<div class="grid"><div><h3 id="part-17">读取比例</h3><div class="bars"><div class="barrow"><span>泰迪熊</span><div class="track"><div class="fill" style="width:15.2%"></div></div><span>15.2%</span></div><div class="barrow"><span>可爱</span><div class="track"><div class="fill" style="width:27.1%"></div></div><span>27.1%</span></div><div class="barrow"><span>阅读</span><div class="track"><div class="fill" style="width:15.2%"></div></div><span>15.2%</span></div><div class="barrow"><span>是</span><div class="track"><div class="fill" style="width:27.1%"></div></div><span>27.1%</span></div><div class="barrow"><span>现在分词</span><div class="track"><div class="fill" style="width:15.2%"></div></div><span>15.2%</span></div></div></div><div><h3 id="part-18">加权求和</h3><div class="math">0.152 × [0.6, 0.2, 0.1] + 0.271 × [0.5, 0.1, 0.3] + 0.152 × [0.1, 0.7, 0.4] + 0.271 × [0.2, 0.2, 0.2] + 0.152 × [0.1, 0.3, 0.8]<br>≈ [0.312, 0.264, 0.334]</div><p class="small muted">“现在分词”自己的 V 是 [0.1, 0.3, 0.8]，输出却被整句信息混合成了另一组数字。</p></div></div>
<p class="small muted">这个例子的局限：分数只有两档，所以权重只有两种取值；真实模型的分数常为负数，分布可能非常悬殊。q 也是直接给定的，真实模型会现场计算。</p>
</details>
<h2 id="part-19">注意力权重长什么样</h2>
<p>把整句一次算完，得到的是一个 n×n 矩阵：<strong>行是“谁在看”，列是“被看的是谁”，每行加起来等于 1</strong>。以 “The cat sat on the mat” 为例（示意数值，不是真实模型输出）：</p>
<div class="table-wrap"><table><thead><tr><th>查询 ↓ / 被看 →</th><th>The</th><th>cat</th><th>sat</th><th>on</th><th>the</th><th>mat</th><th>行和</th></tr></thead><tbody>
<tr><th>The</th><td>0.85</td><td>0.10</td><td>0.00</td><td>0.00</td><td>0.05</td><td>0.00</td><td>1.00</td></tr>
<tr><th>cat</th><td>0.15</td><td>0.45</td><td>0.25</td><td>0.05</td><td>0.05</td><td>0.05</td><td>1.00</td></tr>
<tr><th>sat</th><td>0.05</td><td>0.50</td><td>0.20</td><td>0.15</td><td>0.05</td><td>0.05</td><td>1.00</td></tr>
<tr><th>on</th><td>0.00</td><td>0.05</td><td>0.55</td><td>0.15</td><td>0.05</td><td>0.20</td><td>1.00</td></tr>
<tr><th>the</th><td>0.05</td><td>0.00</td><td>0.00</td><td>0.15</td><td>0.70</td><td>0.10</td><td>1.00</td></tr>
<tr><th>mat</th><td>0.00</td><td>0.05</td><td>0.05</td><td>0.30</td><td>0.45</td><td>0.15</td><td>1.00</td></tr>
</tbody></table></div>
<p>怎么读：“sat”那一行在 “cat” 列权重最高（0.50），对应“sat 的主语是 cat”；“on” 行在 “sat” 列最高（0.55），对应“介词接前面的动词”。这些只是示意，真实模型的模式由训练决定，不同层、不同头差别很大。</p>
<div class="note"><strong>两个提醒：</strong>① 权重高只说明信息流向，不等于因果解释；② 真实模型每层有多个头，叠起来远比一张表复杂。</div>
<h2 id="part-20">一个更接近真实任务的直觉：代词到底指谁</h2>
<p>经典例子：“The animal didn't cross the street because it was too tired.” 处理到 it 时，模型需要判断它指 animal 还是 street。注意力给出的权重分布可能是这样的（示意图，不是真实模型输出）：</p>
<div class="table-wrap"><table><thead><tr><th>被读取的位置</th><th>分数（示意）</th><th>权重</th></tr></thead><tbody><tr><th>animal</th><td>8.2</td><td>0.982</td></tr><tr><th>tired</th><td>3.8</td><td>0.012</td></tr><tr><th>it</th><td>2.1</td><td>0.002</td></tr><tr><th>其他位置</th><td>0.2 ~ 0.9</td><td>合计约 0.004</td></tr></tbody></table></div>
<p>这些权重是训练出来的，不是人工规则。但要注意：<strong>权重高不等于“因为看了这里才这样输出”</strong>，它描述的是信息路由，不能直接当作因果解释。</p>
<h2 id="part-21">同一个公式，三种用法</h2>
<p>Q、K、V 的来源不同，就得到三种注意力。区别只在“谁查谁”和“能不能看未来”：</p>
<div class="table-wrap"><table><thead><tr><th>类型</th><th>Q 来自</th><th>K、V 来自</th><th>用在哪</th></tr></thead><tbody><tr><th>自注意力</th><td>本序列</td><td>本序列</td><td>编码器、解码器内部</td></tr><tr><th>掩码自注意力</th><td>本序列</td><td>本序列（屏蔽未来）</td><td>解码器、GPT 类模型</td></tr><tr><th>交叉注意力</th><td>解码器</td><td>编码器输出</td><td>原始 Transformer、T5 等</td></tr></tbody></table></div>
<p class="source">课件定位：第 58–62、93–101 页。权重不等同于模型完整的推理解释。</p>
</section>
