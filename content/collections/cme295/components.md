---
slug: components
title: "Transformer 的核心组件"
collection: cme295
description: "位置、多头、FFN、残差、归一化、Dropout 与标签平滑。"
order: 80
kind: lesson
status: published
tags: ["FFN","LayerNorm","Dropout"]
---

<section id="components">
<div class="tag">Transformer architecture · 课件第 68–78、100–104 页；补充推导参考文档 2.2、2.5 节</div>

<h3 id="part-2">1. 位置信息：同样的词，顺序可能不同</h3>
<p>“孩子抱着熊”和“熊抱着孩子”使用相同的词，却有不同的关系。基础全连接自注意力对重排具有置换等变性：重排输入会相应重排输出，它本身没有指定“谁在第几个位置”。</p>
<div class="flow"><span class="chip">token embedding<br>[0.4, −0.2, 0.7, 0.1]</span><span class="arrow">＋</span><span class="chip">该位置的编码<br>[0.0, 1.0, 0.0, 1.0]</span><span class="arrow">＝</span><span class="chip">送入网络的向量<br>[0.4, 0.8, 0.7, 1.1]</span></div>
<p>原始 Transformer 用不同频率的正弦与余弦给位置编码，向量与 token embedding 同维，因此可以逐项相加。</p>
<div class="math">PE(pos, 2i) = sin(pos / 10000^(2i/d_model))<br>PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))</div>
<div class="table-wrap"><table><thead><tr><th>方式</th><th>做法</th><th>优点</th><th>代价</th></tr></thead><tbody><tr><th>固定（正弦／余弦）</th><td>按公式直接算出，不参与训练</td><td>不增加参数；新位置也能算出编码</td><td>可塑性差，外推能力有限</td></tr><tr><th>可学习</th><td>每个位置一个可训练向量</td><td>灵活，能适配数据</td><td>受限于训练时见过的最大长度</td></tr></tbody></table></div>
<p>现代模型多用相对位置方案：RoPE 把位置信息“旋转”进 Q、K，ALiBi 给远距离位置加负偏置。它们改善的是长文本表现，而不是取消位置建模的必要性。</p>
<p>pos 是位置编号；i 是频率组编号。类比时钟：秒针、分针、时针变化速度不同，组合起来能区分更长时间范围。数学上可计算新位置的编码，<strong>不保证模型能可靠理解任意长度文本</strong>；编码差也不只由相对距离决定。</p>
<h3 id="part-3">2. 多头注意力：并行使用多组投影</h3>
<div class="flow"><span class="chip">同一输入 X</span><span class="arrow">→</span><span class="chip">头 1：Q₁/K₁/V₁ → Z₁<br>头 2：Q₂/K₂/V₂ → Z₂<br>… 各自计算注意力</span><span class="arrow">→</span><span class="chip">拼接各头输出</span><span class="arrow">→</span><span class="chip">乘 W_O<br>回到 d_model</span></div>
<p class="small muted">类比：卷积层同时用多个卷积核，从不同角度提取特征；多头注意力同时用多组投影，从不同角度读取上下文。差别是注意力不预设“核”的作用范围，权重来自数据。</p>
<p>不同头的投影可以学习不同的信息交互模式，但没有预先指定“这个头负责语法、那个头负责指代”。单个头也可以表达多种关系。若 h=8、d_model=512、每头 d_v=64，拼接后是 8×64=512 维。</p>
<p class="small muted">常见取值：h = 8 或 16，每头维度 d_k = d_v = d_model / h。也有模型让各头维度之和不等于 d_model，但输出仍会投影回 d_model 才能接下一层。</p>
<h3 id="part-4">3. FFN：先升维，再做非线性加工</h3>
<p>注意力让不同位置交换信息；FFN 对每个位置自己的向量进行加工。<strong>各位置共享同一套 FFN 权重</strong>，也可以同时批量计算。</p>
<div class="flow"><span class="chip">一个位置：d_model</span><span class="arrow">→ 线性变换 →</span><span class="chip">d_ff<br>例如 4×d_model</span><span class="arrow">→ ReLU →</span><span class="chip">再线性变换<br>回到 d_model</span></div>
<div class="math">FFN(x) = ReLU(xW₁ + b₁)W₂ + b₂<br>示例：d_model=2，d_ff=4<br>x=[1, −1]<br>W₁=[[1,0,1,−1],[0,1,1,1]]<br>xW₁=[1,−1,0,−2] → ReLU → [1,0,0,0]<br>W₂=[[1,2],[0,1],[1,0],[−1,1]]<br>输出=[1,2]（本例偏置都取 0）</div>
<p>如果去掉中间的非线性，两次线性变换可以合并成一次，表达能力就失去了这一步带来的扩展。</p>
<details><summary>为什么说 FFN 占很多参数？</summary><p>对于标准多头注意力与两层 FFN，假设 d_ff=4d、Q/K/V 总投影宽度为 d，忽略偏置和归一化：注意力约 4d²（四个投影），FFN 约 8d²（d→4d→d），所以 FFN 占这两部分的约 2/3。这个比例不是所有模型总参数的定律：交叉注意力、嵌入表、GQA、门控 FFN 与 MoE 都会改变统计。</p></details>
<h3 id="part-5">4. 残差：原信息与新信息都有通道</h3>
<svg viewBox="0 0 700 225" role="img" aria-label="残差连接：输入一条通路经过子层，另一条跳过子层，在加法节点相加" style="width:100%;max-width:700px;display:block;margin:auto">
<defs><marker id="res-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#2166cd"/></marker></defs>
<g fill="none" stroke="#2166cd" stroke-width="2" marker-end="url(#res-arrow)"><path d="M70 105 H210"/><path d="M350 105 H485"/><path d="M125 105 V35 H505 V84"/><path d="M525 105 H640"/></g>
<rect x="210" y="75" width="140" height="60" rx="10" fill="#edf4ff" stroke="#2166cd"/><circle cx="505" cy="105" r="20" fill="#fff6e6" stroke="#db8b16"/>
<g text-anchor="middle" fill="#193049" font-size="17"><text x="45" y="111">x</text><text x="280" y="111">子层 f(x)</text><text x="505" y="111">＋</text><text x="640" y="148">x + f(x)</text><text x="325" y="24">保留输入的通路</text></g>
<text x="350" y="190" text-anchor="middle" fill="#53677b" font-size="14">例如 x=[1,−1]，f(x)=[1,2]，相加得到 [2,1]</text>
</svg>
<p>深层网络通过这条额外路径更容易传递信息与梯度。它帮助优化，但不能保证任何训练配置下都不发生梯度问题。</p>
<h3 id="part-6">5. LayerNorm：沿每个位置的特征维归一化</h3>
<div class="math">x=[1,3] → 均值 2，方差 1<br>(x−均值)/√(方差+ε) ≈ [−1,1]<br>再乘可学习缩放 γ，加可学习偏移 β</div>
<p>它对每个位置的特征进行处理，不是把所有句子混在一起算均值。由于 ε 和可学习的 γ、β，最终输出不必严格均值为 0、方差为 1。</p>
<div class="table-wrap"><table><thead><tr><th>排列</th><th>公式（省略 Dropout）</th><th>理解</th></tr></thead><tbody><tr><th>原始 Post-Norm</th><td>LayerNorm(x + f(x))</td><td>先相加，再归一化</td></tr><tr><th>常见 Pre-Norm</th><td>x + f(LayerNorm(x))</td><td>先归一化，再送入子层</td></tr></tbody></table></div>
<h3 id="part-7">6. 参数量：这些零件各占多少？</h3>
<p>设 d_model = d，忽略偏置，标准配置下（Q/K/V 合计宽度 d，FFN 中间层 4d）：</p>
<div class="table-wrap"><table><thead><tr><th>组件</th><th>构成</th><th>参数量</th></tr></thead><tbody><tr><th>自注意力</th><td>W_Q、W_K、W_V、W_O</td><td>4d²</td></tr><tr><th>FFN</th><td>d → 4d → d</td><td>8d²</td></tr><tr><th>合计</th><td>单个 Transformer 块</td><td>约 12d²</td></tr></tbody></table></div>
<p>用 GPT-3 的公开配置粗略验证（d = 12288，96 层，词表 50257）：</p>
<div class="math">每层 ≈ 12 × 12288² ≈ 1.81B<br>96 层 ≈ 173.9B<br>词嵌入 ≈ 50257 × 12288 ≈ 0.62B<br>合计 ≈ 174.6B ≈ 175B</div>
<p>这也解释了为什么“把模型加宽”比“加注意力头”更能增加容量：d 一变，FFN 的 8d² 同步变大。注意这个 12d² 只适用于这一套配置；交叉注意力、GQA/MQA、门控 FFN 与 MoE 都会改变比例。</p>
<h3 id="part-8">7. Dropout：训练时随机“关掉”一部分单元</h3>
<p class="def"><strong>定义：</strong>训练时按概率 p 把一部分激活值（或连接）临时置 0，并把保留下来的值放大 1/(1−p) 倍；<strong>推理时完全不丢弃</strong>，也不放大。</p>
<p><strong>为什么需要：</strong>模型参数远多于数据时，神经元容易“互相依赖”——某个特征总由固定的几个单元一起凑出来，换一份数据就崩。随机丢弃逼着每个单元都能独立派上用场，相当于每次训练一个略有不同的子网络，推理时近似把这些子网络平均起来。</p>
<p><strong>例子（p = 0.5）：</strong>某一层的激活值 x = [1.2, −0.5, 0.8, 2.0]</p>
<div class="table-wrap"><table><thead><tr><th>单元</th><th>原始激活</th><th>随机掩码</th><th>置 0 后</th><th>放大 1/(1−0.5)</th></tr></thead><tbody>
<tr><th>1</th><td>1.2</td><td>保留</td><td>1.2</td><td>2.4</td></tr>
<tr><th>2</th><td>−0.5</td><td>丢弃</td><td>0</td><td>0</td></tr>
<tr><th>3</th><td>0.8</td><td>保留</td><td>0.8</td><td>1.6</td></tr>
<tr><th>4</th><td>2.0</td><td>丢弃</td><td>0</td><td>0</td></tr>
</tbody></table></div>
<div class="math">为什么放大：每个单元的期望输出 = p×0 + (1−p) × x/(1−p) = x<br>所以训练时“平均幅度”和推理时一致，不必等推理再去补偿</div>
<p>放大这一步叫 <strong>inverted dropout</strong>，是现代实现的常见做法。另一种写法是训练时不放大、推理时统一乘 (1−p)，数学上等价。</p>
<div class="note"><strong>三个常见坑：</strong>① 推理时忘记切到 eval 模式，结果会随机抖动；② Dropout 只在训练启用，评估/上线必须关闭；③ p 不是越大越好，0.1～0.5 之间常见，现代大模型往往只用很小的 p，或只在部分位置使用。</div>
<p class="small muted">相似的正则化还有标签平滑（软化目标分布）与权重衰减（惩罚过大的参数），它们作用于不同环节：Dropout 改的是激活，标签平滑改的是目标，权重衰减改的是参数更新。</p>
<h3 id="part-9">8. 标签平滑：不让目标“非 1 即 0”</h3>
<p class="def"><strong>定义：</strong>把 one-hot 的硬目标改成软目标：正确类拿 1−ε，其余 K−1 个类平分 ε。例如 K = 4、ε = 0.1 时，目标从 [1, 0, 0, 0] 变成 [0.9, 0.0333, 0.0333, 0.0333]。</p>
<p><strong>为什么需要：</strong>语言里同一句话常常有多种合理续写，“正确答案唯一”这个假设并不总成立。硬目标会驱使模型把 logit 越推越大，追求 100% 自信，容易过拟合、也让概率校准变差。软化目标相当于告诉模型“别那么绝对”。</p>
<p><strong>例子（沿用第 0 节的四个词）</strong>：当前预测 p = [0.3125, 0.3489, 0.1433, 0.1953]，正确词是第 1 个。</p>
<div class="table-wrap"><table><thead><tr><th>目标类型</th><th>目标向量</th><th>交叉熵损失</th></tr></thead><tbody>
<tr><th>硬目标（one-hot）</th><td>[1, 0, 0, 0]</td><td>1.163</td></tr>
<tr><th>软目标（ε = 0.1）</th><td>[0.9, 0.0333, 0.0333, 0.0333]</td><td>1.201</td></tr>
</tbody></table></div>
<p>同一组预测下，软目标的损失<strong>更高</strong>——因为它还要求模型给其他词留下一点概率。这正是目的：损失不会再被“把正确词推到 1”这一件事主导。</p>
<p><strong>从梯度看更清楚</strong>：softmax + 交叉熵的梯度是 p − 目标。</p>
<div class="table-wrap"><table><thead><tr><th>词</th><th>预测 p</th><th>硬目标</th><th>梯度（硬）</th><th>软目标</th><th>梯度（软）</th></tr></thead><tbody>
<tr><th>可爱（正确）</th><td>0.3125</td><td>1</td><td>−0.6875</td><td>0.9000</td><td>−0.5875</td></tr>
<tr><th>柔软</th><td>0.3489</td><td>0</td><td>0.3489</td><td>0.0333</td><td>0.3156</td></tr>
<tr><th>阅读</th><td>0.1433</td><td>0</td><td>0.1433</td><td>0.0333</td><td>0.1100</td></tr>
<tr><th>是</th><td>0.1953</td><td>0</td><td>0.1953</td><td>0.0333</td><td>0.1620</td></tr>
</tbody></table></div>
<p>硬目标下，只有当 p(可爱) 逼近 1、其他逼近 0 时梯度才归零；软目标下，最优解是 <strong>p ≈ 软目标</strong>（此时损失约 0.435，而不是 0）。所以模型学到的是“比较有把握”，而不是“绝对确定”。</p>
<div class="note"><strong>要注意的边界：</strong>均匀平滑会把概率平均分给所有其他词，它并不知道“柔软”和“阅读”谁更合理；对语言建模这种“下一个词常常确实唯一”的任务，ε 通常取得很小（如 0.1），或只在特定训练阶段使用。它与蒸馏中的“软标签”不是一回事——后者的软标签来自教师模型的分布。</div>
<p class="small muted">原始 Transformer 论文在机器翻译任务上报告过标签平滑带来的 BLEU 提升；它属于“训练目标层面”的正则化，与 Dropout（作用于激活）、权重衰减（作用于参数）分工不同。</p>
<p class="source">Pre-Norm 与现代架构仅作补充。理解第一讲时，优先跟踪原始模型的计算顺序。</p>
</section>
