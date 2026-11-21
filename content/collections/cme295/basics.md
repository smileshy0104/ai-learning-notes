---
slug: basics
title: "基础工具箱：模型怎样学习"
collection: cme295
lecture: 1
description: "14 个基础概念，各配一个可逐步手算的例子（含中间值与形状校验），走完一次前向、反向与更新。"
order: 20
kind: lesson
status: published
tags: ["前向传播","梯度","损失"]
---

<section id="basics" class="switch">
<div class="tag">基础工具箱 · 补充，不属于课件章节；每个概念都配一个能逐步手算、并给出中间值与形状校验的例子</div>

<p>这一节按同一套格式组织：先给<strong>定义</strong>，再说<strong>为什么需要</strong>，最后用<strong>本例数字</strong>逐步算一遍，并写出中间值和形状。所有例子都来自同一个任务：词表 4 个词（可爱、柔软、阅读、是），网络把“泰迪熊”压成 h = [0.5, −0.3]，要预测下一个词，正确答案是“可爱”。</p>
<p>阅读方式：<strong>每个例子都能只用纸笔复算</strong>。若某一步的数字对不上，先检查形状（概念 1）和是否漏了 ReLU（概念 5），这两处是最常见的手算出错点。</p>
<div class="flow"><span class="chip">h = [0.5, −0.3]</span><span class="arrow">→ 线性层 →</span><span class="chip">4 个分数 z</span><span class="arrow">→ softmax →</span><span class="chip">4 个概率 p</span><span class="arrow">→ 交叉熵 →</span><span class="chip">损失 L</span><span class="arrow">→ 反向 →</span><span class="chip">梯度</span><span class="arrow">→ 更新 →</span><span class="chip">新的 W</span></div>

<h2 id="part-2">概念 1：张量、向量、矩阵与形状</h2>
<p class="def"><strong>定义：</strong>标量是一个数，向量是一串数，矩阵是数的二维表格，张量是它们的高维推广。<strong>形状</strong>就是每一维有多少个数，写作 (行, 列)。矩阵乘法要求左矩阵的列数等于右矩阵的行数。</p>
<p><strong>为什么需要：</strong>神经网络的所有运算都是这些形状之间的乘法。看懂形状，才能判断“这一步到底算了什么、结果应该多大”。</p>
<div class="math">本例的形状链条：h (1, 2) → W (2, 4) → z (1, 4) → p (1, 4)<br>规则：左矩阵的<strong>列数 2</strong> 必须等于右矩阵的<strong>行数 2</strong>；结果形状是（左行数, 右列数）= (1, 4)</div>
<div class="table-wrap"><table><thead><tr><th>对象</th><th>形状</th><th>读法</th></tr></thead><tbody><tr><th scope="row">学习率 η = 2</th><td>()</td><td>标量，没有维度</td></tr><tr><th scope="row">隐藏状态 h</th><td>(2)</td><td>长度 2 的向量；写成 (1, 2) 就是“1 行 2 列”</td></tr><tr><th scope="row">权重 W</th><td>(2, 4)</td><td>2 行 4 列，每列对应一个词</td></tr><tr><th scope="row">一批 32 条输入</th><td>(32, 2)</td><td>第 0 维是样本，第 1 维是特征</td></tr></tbody></table></div>
<div class="math">同一套规则用在注意力上：Q (4, 8) × Kᵀ (8, 4) → (4, 4)，即“4 个位置各自对 4 个位置的分数”；再乘 V (4, 8) → (4, 8)，把分数换回 8 维表示。<br>加 batch=32 就是每个维度前面多一个 32：(32, 4, 8) × (32, 8, 4) → (32, 4, 4)</div>
<p><strong>最容易踩的坑：</strong>若 W 写成 (3, 4)，(1, 2) × (3, 4) 直接无定义——左列数 2 ≠ 右行数 3。报错里的 “shapes (1,2) and (3,4) cannot be multiplied” 说的是这件事，不是“数据算错了”。</p>

<h2 id="part-3">概念 2：参数与超参数</h2>
<p class="def"><strong>定义：</strong><strong>参数</strong>是训练过程中会被自动更新的数字（权重、偏置）。<strong>超参数</strong>是由人预先选定的配置，训练不会改变它。</p>
<p><strong>为什么需要：</strong>分不清这两者，就不知道“该调什么”和“模型会自己学什么”。</p>
<div class="table-wrap"><table><thead><tr><th>类别</th><th>本例中</th><th>真实模型中</th><th>谁决定</th></tr></thead><tbody><tr><th>参数</th><td>W 的 8 个数</td><td>所有权重矩阵，可达上千亿个</td><td>训练自动更新</td></tr><tr><th>超参数</th><td>学习率 η = 2、隐藏维度 2、词表大小 4</td><td>层数、d_model、头数、学习率</td><td>人事先选定</td></tr></tbody></table></div>
<div class="math">数一数本例的参数：W 是 (2, 4) → 2×4 = 8 个；若再加偏置 b (4) → 4 个；合计 12 个<br>超参数只有 3 个：学习率 η = 2、隐藏维度 2、词表大小 4</div>
<div class="math">换成一个稍大的网络：输入 2 维 → 隐藏 4 维 → 输出 4 维<br>(2→4)：2×4 + 4 = 12 个　(4→4)：4×4 + 4 = 20 个　合计 32 个<br>再把输出层换成 d_model = 512、词表 32000：512 × 32000 ≈ 1.64×10⁷，即 16.4 M —— 仅这一层就比整个上例多六个数量级</div>
<p><strong>判断方法：</strong>会被优化器改写的张量都是参数；写在配置文件、命令行或论文里的数字（层数、学习率、batch 大小）都是超参数。</p>

<h2 id="part-4">概念 3：前向传播</h2>
<p class="def"><strong>定义：</strong>把输入按网络顺序<strong>逐层算一遍</strong>、一直算到输出（预测值）的过程。前向<strong>不修改任何参数</strong>——参数只在反向与更新时才改变。</p>
<p><strong>为什么需要：</strong>它定义了“模型此刻给出什么预测”，损失与梯度都基于这一次前向的结果；推理时更是<strong>只做前向</strong>。</p>
<p><strong>例 1（多层怎么连起来）：</strong>一个两层小网络，输入 x = [1.0, 2.0]，隐藏层权重 W₁ = [0.5, 0.3]，输出权重 W₂ = 2.0：</p>
<div class="math">第 1 层：z = 1.0×0.5 + 2.0×0.3 = 1.1<br>激活：h = ReLU(1.1) = 1.1<br>第 2 层：y = 1.1 × 2.0 = 2.2　← 前向的终点：一个预测值<br>（若目标是 3.0，损失 = (2.2−3.0)²/2 = 0.32，见概念 7）</div>
<div class="table-wrap"><table><thead><tr><th>输入 x</th><th>z = x·[0.5, 0.3]</th><th>h = ReLU(z)</th><th>y = 2h</th><th>MSE（目标 3.0）</th></tr></thead><tbody><tr><th scope="row">[1.0, 2.0]</th><td>1.1</td><td>1.1</td><td>2.20</td><td>0.320</td></tr><tr><th scope="row">[0.0, 1.0]</th><td>0.3</td><td>0.3</td><td>0.60</td><td>2.880</td></tr><tr><th scope="row">[1.0, −2.0]</th><td>−0.1</td><td>0（被截断）</td><td>0.00</td><td>4.500</td></tr></tbody></table></div>
<p>三行的流程完全相同，只有输入不同——这就是“前向是一个固定函数”。第三行还顺带演示 ReLU：负的 z 被压成 0，输出因此也是 0，损失一下变到 4.5。</p>
<p><strong>例 2（本节的例子）：</strong>h = [0.5, −0.3] 经线性层得到 z = [0.440, 0.550, −0.340, −0.030]，再经 softmax 得到 p = [0.3125, 0.3489, 0.1433, 0.1953]。这两步合起来就是一次前向，终点是 4 个概率。</p>
<div class="flow"><span class="chip">h</span><span class="arrow">→ 线性层（概念 4）</span><span class="arrow">→</span><span class="chip">z</span><span class="arrow">→ softmax（概念 6）</span><span class="arrow">→</span><span class="chip">p</span><span class="arrow">→ 取 p(可爱) →</span><span class="chip">损失（概念 7）</span></div>
<p><strong>易错点：</strong>前向里也会“算”，但算出的中间结果（z、p）不是训练要学的东西；要学的是参数 W。换成另一条输入，前向流程完全一样，只是 h 不同、输出不同。</p>

<h2 id="part-5">概念 4：线性层（全连接层）</h2>
<p class="def"><strong>定义：</strong>把输入向量乘一个权重矩阵（再加偏置），得到输出向量：y = x·W + b。每个输出元素都是“输入与某一列的点积”。</p>
<p><strong>为什么需要：</strong>它是网络里唯一“带可学习参数”的基本运算，注意力的 Q/K/V 投影、FFN 的两个线性层，本质都是它。</p>
<div class="math">例子（算“可爱”这一列）：0.5×1.0 + (−0.3)×0.2 = 0.500 − 0.060 = 0.440<br>四个词一起算，就是 h 乘整个 W：z = [0.440, 0.550, −0.340, −0.030]</div>
<div class="table-wrap"><table><thead><tr><th>词</th><th>W 第 1 行</th><th>W 第 2 行</th><th>0.5 × 第 1 行</th><th>(−0.3) × 第 2 行</th><th>分数 z</th></tr></thead><tbody><tr><th scope="row">可爱</th><td>1.0</td><td>0.2</td><td>0.500</td><td>-0.060</td><td>0.440</td></tr><tr><th scope="row">柔软</th><td>0.5</td><td>-1.0</td><td>0.250</td><td>0.300</td><td>0.550</td></tr><tr><th scope="row">阅读</th><td>-0.5</td><td>0.3</td><td>-0.250</td><td>-0.090</td><td>-0.340</td></tr><tr><th scope="row">是</th><td>0.0</td><td>0.1</td><td>0.000</td><td>-0.030</td><td>-0.030</td></tr></tbody></table></div>
<div class="math">再手算两列核对：第 2 列（柔软）0.5×0.5 + (−0.3)×(−1.0) = 0.250 + 0.300 = 0.550<br>第 4 列（是）0.5×0.0 + (−0.3)×0.1 = 0.000 − 0.030 = −0.030<br>顺序很重要：0.5 乘的是第 1 行，−0.3 乘的是第 2 行，不能对调</div>
<p>如果再加偏置 b = [0.1, 0, −0.2, 0]（每个词一个，与 h 无关），分数整体平移：</p>
<div class="math">z = [0.440, 0.550, −0.340, −0.030] + b = [0.540, 0.550, −0.540, −0.030]<br>softmax 后 p = [0.3430, 0.3465, 0.1165, 0.1940]——“可爱”被抬高，但仍排第二<br>本节之后统一取 b = 0 让手算简洁；真实线性层几乎都带偏置</div>

<h2 id="part-6">概念 5：激活函数（以 ReLU 为例）</h2>
<p class="def"><strong>定义：</strong>紧接在线性层后面的非线性函数。ReLU(x) = max(0, x)：负数变 0，正数不变。</p>
<p><strong>为什么需要：</strong>如果只有线性层，多层叠加仍是线性变换（两次矩阵乘法可以合并成一次），网络再深也表达不了复杂关系。非线性才让“加深”有意义。</p>
<div class="math">例子：ReLU(1.1) = 1.1　ReLU(−0.7) = 0　ReLU(0) = 0<br>本例中 z 的负值（−0.340、−0.030）如果经过 ReLU 就会变成 0；但输出层前通常不用 ReLU，因为分数需要允许负数</div>
<div class="table-wrap"><table><thead><tr><th>输入</th><th>ReLU</th><th>LeakyReLU(0.01)</th><th>sigmoid</th></tr></thead><tbody><tr><th scope="row">−1.1</th><td>0</td><td>−0.0110</td><td>0.2497</td></tr><tr><th scope="row">−0.34</th><td>0</td><td>−0.0034</td><td>0.4158</td></tr><tr><th scope="row">0</th><td>0</td><td>0</td><td>0.5000</td></tr><tr><th scope="row">1.1</th><td>1.1</td><td>1.1</td><td>0.7503</td></tr></tbody></table></div>
<p>四种取值并列看：ReLU 把负半轴全部压成 0（因此可能有“神经元不再更新”的问题）；LeakyReLU 留一条很小的负斜率；sigmoid 把任意实数压到 (0, 1)，但两端梯度很小。</p>
<p><strong>为什么必须有非线性：</strong>两层线性且不加激活时，y = (x·W₁)·W₂ = x·(W₁W₂)。标量情形 W₁ = 2、W₂ = 3，等价于单层 W = 6；叠多少层都还是一个线性变换，表达能力没有增加。</p>

<h2 id="part-7">概念 6：logits 与 softmax</h2>
<p class="def"><strong>定义：</strong>模型直接输出的原始分数叫 <strong>logits</strong>，可以是任意实数。<strong>softmax</strong> 把它们变成非负、总和为 1 的概率：先取指数（放大差距、消掉负号），再除以总和。</p>
<p><strong>为什么需要：</strong>只有变成概率，才能解释成“下一个词是它的可能性”，也才能和交叉熵配合。</p>
<div class="table-wrap"><table><thead><tr><th>输入 logits</th><th>softmax 输出</th><th>说明</th></tr></thead><tbody><tr><td>[0, 0]</td><td>[0.500, 0.500]</td><td>完全一样，各占一半</td></tr><tr><td>[2, 1]</td><td>[0.731, 0.269]</td><td>差 1，领先明显</td></tr><tr><td>[4, 1]</td><td>[0.953, 0.047]</td><td>差 3，几乎一边倒</td></tr></tbody></table></div>
<p>差距被指数放大：logit 只差 1，概率就能差近 3 倍。</p>
<div class="math">以 [2, 1] 逐步算：先减最大值 2 防止溢出<br>exp = [e⁰, e⁻¹] = [1.000, 0.368]，总和 1.368<br>p = [1.000/1.368, 0.368/1.368] = [0.731, 0.269]——与不减最大值的结果相同<br>若不平移，exp(1000) 会直接变成 Infinity，所以数值实现一定要减最大值</div>
<div class="math">本例：先全体减最大值 0.550，再取指数<br>exp = [0.896, 1.000, 0.411, 0.560]，总和 2.866<br>p = [0.3125, 0.3489, 0.1433, 0.1953]</div>
<div class="table-wrap"><table><thead><tr><th>词</th><th>z</th><th>z − 0.550</th><th>exp</th><th>概率 p</th></tr></thead><tbody><tr class="selected"><th scope="row">可爱（目标）</th><td>0.440</td><td>-0.110</td><td>0.896</td><td>0.3125</td></tr><tr><th scope="row">柔软</th><td>0.550</td><td>0.000</td><td>1.000</td><td>0.3489</td></tr><tr><th scope="row">阅读</th><td>-0.340</td><td>-0.890</td><td>0.411</td><td>0.1433</td></tr><tr><th scope="row">是</th><td>-0.030</td><td>-0.580</td><td>0.560</td><td>0.1953</td></tr></tbody></table></div>
<p>模型此时更倾向“柔软”（34.9%），正确答案只有 31.3%——它答错了。</p>
<div class="math">温度：把 z 除以系数 T 再 softmax（相当于缩放 logits）<br>T = 0.5 → [0.3513, 0.4377, 0.0738, 0.1372]　分布更尖，最高项从 34.9% 升到 43.8%<br>T = 2　 → [0.2838, 0.2998, 0.1921, 0.2243]　更平<br>T = 8　 → [0.2588, 0.2624, 0.2348, 0.2440]　几乎均匀（约 25%）</div>
<p>这解释了后面解码章节的“温度”参数：T 小更确定，T 大更随机，但 T 不会改变哪个词分数最高。</p>

<h2 id="part-8">概念 7：损失函数</h2>
<p class="def"><strong>定义：</strong>把“预测与目标的差距”压缩成一个标量，训练才知道往哪改。回归常用均方误差 MSE = (y − t)² / 2；分类与语言模型常用交叉熵 L = −ln p(正确类别)。</p>
<p><strong>为什么需要：</strong>没有标量损失就没有统一方向；不同损失对应不同任务，选错了模型会优化错误的目标。</p>
<div class="math">本例的交叉熵：L = −ln p(可爱) = −ln 0.3125 = 1.1632 ≈ 1.163<br>读法：模型给正确答案 31.25% 的把握，损失就是“−ln 把握”；p = 1 时损失 0，p → 0 时损失 → +∞</div>
<div class="math">一个序列通常有多个位置要预测。若三个位置的概率分别是 0.31、0.62、0.85：<br>各自损失 −ln = 1.171、0.478、0.163<br>平均 = (1.171 + 0.478 + 0.163) / 3 = 0.604 —— 训练按有效位置求<strong>平均</strong>，不是求和</div>
<div class="table-wrap"><table><thead><tr><th>正确词的概率</th><th>交叉熵 L</th><th>含义</th></tr></thead><tbody><tr><td>0.99</td><td>0.010</td><td>几乎确定，几乎不罚</td></tr><tr><td>0.70</td><td>0.357</td><td>不错</td></tr><tr><td>0.31（本例）</td><td>1.163</td><td>明显不对</td></tr><tr><td>0.01</td><td>4.605</td><td>自信地答错，重罚</td></tr></tbody></table></div>
<details><summary>本例如果改用 MSE 会怎样？</summary><p>把目标看成 one-hot [1, 0, 0, 0]，逐项平方误差 = 0.6875² + 0.3489² + 0.1433² + 0.1953² = 0.4727 + 0.1217 + 0.0205 + 0.0381 = 0.6530，再除以 4 得 0.1633。数值更小，但它衡量的是“数差多少”，对“正确词概率偏低”不敏感，梯度也小，学习更慢。交叉熵直接盯着正确词的概率，配合 softmax 还有极简的梯度形式（见概念 9）。</p></details>

<h2 id="part-9">概念 8：梯度</h2>
<p class="def"><strong>定义：</strong>损失对某个参数的<strong>偏导数</strong>，表示“这个参数增大一点点，损失会怎么变”。梯度是所有这些偏导组成的向量。正梯度→该参数增大会让损失变大；负梯度→增大会让损失变小。</p>
<p><strong>为什么需要：</strong>它是唯一告诉你“往哪个方向改、改多少”的量。没有梯度，训练就只能是瞎猜。</p>
<div class="math">单变量例子：f(w) = w²，在 w = 3 处的梯度 = 2w = 6<br>意思是：w 稍微增大，f 会以约 6 倍的速率上升<br>本例中：dL/dz(可爱) = −0.6875，负数 → 增大这个分数能降低损失</div>
<div class="math">用本例验证这个斜率：把 z(可爱) 从 0.440 调到 0.450（+0.01），重新算 softmax<br>L 从 1.1631 → 1.1562，实际变化 −0.0069<br>梯度预测的变化 = −0.6875 × 0.01 = −0.0069 —— 两者一致</div>
<p><strong>注意：</strong>梯度只是“一小步内”的线性近似；步子越大误差越大。这是学习率不能太大的原因之一（见概念 10）。</p>

<h2 id="part-10">概念 9：反向传播</h2>
<p class="def"><strong>定义：</strong>用链式法则，从损失出发、逆着网络方向逐层求梯度的算法。因为要先知道输出层怎么调，才能推出上一层怎么调。</p>
<p><strong>为什么需要：</strong>参数成千上万，不可能逐个试。<strong>一次反向传播就能同时得到所有参数的梯度</strong>，这是训练可行的关键。</p>
<p><strong>本例最值得记住的结论：</strong>softmax 与交叉熵组合后，对 logits 的梯度恰好是“预测概率 − 目标”（推导从略，先记住这个形状）：</p>
<div class="table-wrap"><table><thead><tr><th>词</th><th>预测 p</th><th>目标</th><th>梯度 dL/dz</th></tr></thead><tbody><tr><th scope="row">可爱</th><td>0.3125</td><td>1</td><td>-0.6875</td></tr><tr><th scope="row">柔软</th><td>0.3489</td><td>0</td><td>0.3489</td></tr><tr><th scope="row">阅读</th><td>0.1433</td><td>0</td><td>0.1433</td></tr><tr><th scope="row">是</th><td>0.1953</td><td>0</td><td>0.1953</td></tr></tbody></table></div>
<p>再往前一层，参数梯度 = 输入 × 上层梯度：</p>
<div class="table-wrap"><table><thead><tr><th>词</th><th>W 第 1 行梯度（h₁ = 0.5）</th><th>W 第 2 行梯度（h₂ = −0.3）</th></tr></thead><tbody><tr><th scope="row">可爱</th><td>0.5 × -0.6875 = -0.3437</td><td>−0.3 × -0.6875 = 0.2062</td></tr><tr><th scope="row">柔软</th><td>0.5 × 0.3489 = 0.1744</td><td>−0.3 × 0.3489 = -0.1047</td></tr><tr><th scope="row">阅读</th><td>0.5 × 0.1433 = 0.0716</td><td>−0.3 × 0.1433 = -0.0430</td></tr><tr><th scope="row">是</th><td>0.5 × 0.1953 = 0.0977</td><td>−0.3 × 0.1953 = -0.0586</td></tr></tbody></table></div>
<p class="small muted">h₂ 是负数，所以第 2 行的梯度符号与第 1 行相反——同一个词的两行参数会朝不同方向调整。</p>
<p>继续往前退一层：h 的两个分量各自融合了全部 4 个词的梯度，权重正好是 W 的两行。</p>
<div class="table-wrap"><table><thead><tr><th>中间量</th><th>逐项相加</th><th>结果</th></tr></thead><tbody><tr><th scope="row">dL/dh₁</th><td>(−0.6875×1.0) + (0.3489×0.5) + (0.1433×−0.5) + (0.1953×0)</td><td>−0.5847</td></tr><tr><th scope="row">dL/dh₂</th><td>(−0.6875×0.2) + (0.3489×−1.0) + (0.1433×0.3) + (0.1953×0.1)</td><td>−0.4239</td></tr></tbody></table></div>
<p>这就是“乘以上层权重的转置”：W 是 (2, 4)，Wᵀ 是 (4, 2)，乘 (4) 维梯度得 (2) 维。反向传播每退一层，形状就还原一层。</p>

<h2 id="part-11">概念 10：梯度下降与学习率</h2>
<p class="def"><strong>定义：</strong>按“负梯度方向”更新参数：W ← W − η × 梯度。<strong>学习率 η</strong> 决定每步走多远。</p>
<p><strong>为什么需要：</strong>梯度只给方向，η 给步长。步长太大越过最优点，太小几乎不动。</p>
<div class="math">单变量例子（f(w) = w²，η = 0.1）：<br>w = 3 → 梯度 6 → w = 3 − 0.6 = 2.40（f 从 9 降到 5.76）<br>再一步：梯度 4.8 → w = 1.92（f 降到 3.69）</div>
<p>用本例的 8 个参数做一次真实更新（η = 2.0，为方便观察取了较大值）：</p>
<div class="table-wrap"><table><thead><tr><th>词</th><th>W 第 1 行（旧 → 新）</th><th>W 第 2 行（旧 → 新）</th></tr></thead><tbody><tr><th scope="row">可爱</th><td>1.0000 → 1.6875</td><td>0.2000 → -0.2125</td></tr><tr><th scope="row">柔软</th><td>0.5000 → 0.1511</td><td>-1.0000 → -0.7907</td></tr><tr><th scope="row">阅读</th><td>-0.5000 → -0.6433</td><td>0.3000 → 0.3860</td></tr><tr><th scope="row">是</th><td>0.0000 → -0.1953</td><td>0.1000 → 0.2172</td></tr></tbody></table></div>
<div class="math">挑一个参数手算（η = 2）：W(可爱, 第 1 行) = 1.0 − 2 × (−0.3437) = 1.0 + 0.6875 = 1.6875<br>梯度为负 → 减负数 → 参数变大 → 下次这个分数更高，正是我们想要的方向</div>
<p>8 个参数全部更新后，重新做一次前向，就得到“下一次迭代”的起点：</p>
<div class="math">z = [0.907, 0.313, −0.437, −0.163]<br>p = [0.4640, 0.2560, 0.1209, 0.1591]，正确答案从 31.3% 升到 46.4%<br>L = −ln 0.4640 = 0.768，比 1.163 下降 34.0%</div>

<h2 id="part-12">概念 11：batch、epoch 与迭代</h2>
<p class="def"><strong>定义：</strong><strong>batch</strong> 是一次前向+反向所用的样本数；<strong>迭代</strong>（step）是更新一次参数；<strong>epoch</strong> 是把整个训练集完整过一遍。</p>
<p><strong>为什么需要：</strong>一次用全部数据太慢且占显存，一次只用一条又太抖。batch 是在速度与稳定之间的折中。</p>
<div class="math">例子：训练集有 4 条样本，batch = 2<br>→ 每个 epoch 有 2 次迭代（2 次参数更新）<br>本例的“更新一次”就等于 1 次迭代；batch = 4 时，一个 epoch 只更新 1 次</div>
<div class="math">换个规模：训练集 1000 条，batch = 32<br>→ 每个 epoch 需要 ⌈1000 / 32⌉ = 32 步（31 个满 batch + 1 个只有 8 条）<br>→ 训练 10 个 epoch = 320 次参数更新<br>batch = 1000（全量）时，每个 epoch 只有 1 步，但每步都更慢、更占显存</div>

<h2 id="part-13">概念 12：训练与推理</h2>
<p class="def"><strong>定义：</strong><strong>训练</strong>要前向、算损失、反向、更新，并保存梯度与优化器状态；<strong>推理</strong>只做前向，参数冻结。</p>
<p><strong>为什么需要：</strong>两者开销差好几倍，部署时要按推理算显存和延迟；一些层（Dropout）只在训练时生效。</p>
<div class="table-wrap"><table><thead><tr><th>项目</th><th>训练</th><th>推理</th></tr></thead><tbody><tr><th>参数</th><td>1×</td><td>1×</td></tr><tr><th>梯度</th><td>1×</td><td>不需要</td></tr><tr><th>Adam 一阶/二阶动量</th><td>各 1×</td><td>不需要</td></tr><tr><th>合计显存</th><td>约 4×（混合精度约 3×）</td><td>约 1×</td></tr><tr><th>Dropout</th><td>开启</td><td>关闭</td></tr></tbody></table></div>
<div class="math">按 10⁹ 个参数、每个数占几字节估一下：<br>推理 fp16：2 B × 10⁹ = 2 GB<br>训练（fp32 参数 + 梯度 + Adam 一阶、二阶）：(4 + 4 + 4 + 4) B × 10⁹ = 16 GB<br>混合精度（参数与梯度 fp16，优化器状态 fp32）：(2 + 2 + 4 + 4) B = 12 GB</div>
<p>表格里的“约 4×”是相对 fp32 推理（4 B/参数）而言；相对 fp16 推理（2 B）则是 8×。这里只算参数相关部分，激活值、临时缓冲和显存碎片另算（第五讲会展开）。</p>

<h2 id="part-14">概念 13：梯度消失与梯度爆炸</h2>
<p class="def"><strong>定义：</strong>反向传播是逐层<strong>连乘</strong>。若每层因子略小于 1，乘积随层数指数衰减（消失）；略大于 1 则指数增长（爆炸）。</p>
<p><strong>为什么需要：</strong>它解释了“为什么加深层数反而变差”“为什么 RNN 记不住早期信息”，也解释了残差与归一化为什么必须存在。</p>
<div class="math">每层因子 0.5，10 层：0.5¹⁰ ≈ 9.8×10⁻⁴　→ 底层几乎收不到梯度<br>每层因子 2.0，10 层：2¹⁰ = 1024　→ 参数被推飞<br>接近 1 也危险：0.9¹⁰ ≈ 0.349，1.1¹⁰ ≈ 2.594</div>
<div class="table-wrap"><table><thead><tr><th>每层因子</th><th>1 层</th><th>5 层</th><th>10 层</th></tr></thead><tbody><tr><th scope="row">0.5</th><td>0.500</td><td>0.031</td><td>0.0010</td></tr><tr><th scope="row">0.9</th><td>0.900</td><td>0.590</td><td>0.349</td></tr><tr><th scope="row">1.1</th><td>1.100</td><td>1.611</td><td>2.594</td></tr><tr><th scope="row">2.0</th><td>2</td><td>32</td><td>1024</td></tr></tbody></table></div>
<p>再看两个具体的 6 层网络：每层 0.6 → 0.6⁶ = 0.0467，梯度只剩 4.7%；每层 1.5 → 1.5⁶ = 11.39，放大十倍以上。注意 0.9 看着“很接近 1”，10 层后也只剩三分之一。</p>
<div class="grid"><div class="layer"><strong>梯度消失</strong><br>越靠近输入的层越学不动；表现为“加深反而变差”。</div><div class="layer"><strong>梯度爆炸</strong><br>损失变 NaN、数值爆掉；常用梯度裁剪。</div></div>
<p>Transformer 的三处应对（都能在后面章节对上）：残差的 1 + f′(x) 提供直通路径；LayerNorm 稳定每层尺度；注意力把任意两位置的距离变成常数级。</p>

<h2 id="part-15">概念 14：过拟合与正则化</h2>
<p class="def"><strong>定义：</strong><strong>过拟合</strong>指模型在训练数据上表现很好、在新数据上变差；<strong>正则化</strong>是限制模型“死记”的手段，例如 Dropout、标签平滑、权重衰减。</p>
<p><strong>为什么需要：</strong>语言模型参数量远大于样本量，不加以约束很容易记住训练文本的细节。</p>
<div class="math">例子：训练损失从 2.0 一路降到 0.3，验证损失却从 2.1 升到 2.6 → 典型过拟合</div>
<div class="math">Dropout p = 0.1 的具体算法（训练时）：<br>激活 a = [2.0, 0.5, 1.2, 3.0]，抽到的掩码 [1, 0, 1, 1]<br>被保留的值除以 (1 − p) = 0.9：a′ = [2.222, 0, 1.333, 3.333]<br>推理时一个都不丢、也不乘系数；因为 2.222 × 0.9 = 2.0，期望保持一致</div>
<div class="math">标签平滑 ε = 0.1、K = 4：正确类目标 0.925，其余各 0.025<br>模型很自信且答对（p(正确) = 0.99）：交叉熵从 0.010 升到 0.442 —— 平滑故意压低“满分”奖励，防止过度自信<br>答错时（p(正确) = 0.05）：从 2.996 微降到 2.959</div>

<h2 id="part-16">把 14 个概念串起来：一次完整的更新</h2>
<p>顺序是固定的：前向（概念 3～6）→ 损失（7）→ 反向（8、9）→ 更新（10）→ 进入下一个 batch（11）。下面切换看同一次前向在更新前后的差别：</p>
<input type="radio" name="upd" id="upd-before" checked>
<input type="radio" name="upd" id="upd-after">
<div class="controls" role="group" aria-label="更新前后对比"><span>查看：</span><label for="upd-before">更新前</label><label for="upd-after">更新后</label></div>
<div class="panel panel-upd-before">
<h3 id="part-17">更新前：正确答案“可爱”只有 31.3%</h3>
<div class="bars"><div class="barrow"><span>可爱</span><div class="track"><div class="fill" style="width:31.3%"></div></div><span>31.3%</span></div><div class="barrow"><span>柔软</span><div class="track"><div class="fill" style="width:34.9%"></div></div><span>34.9%</span></div><div class="barrow"><span>阅读</span><div class="track"><div class="fill" style="width:14.3%"></div></div><span>14.3%</span></div><div class="barrow"><span>是</span><div class="track"><div class="fill" style="width:19.5%"></div></div><span>19.5%</span></div></div>
<p>交叉熵 L = 1.163；模型更倾向“柔软”，答错了。</p>
</div>
<div class="panel panel-upd-after">
<h3 id="part-18">更新一次后：正确答案升到 46.4%</h3>
<div class="bars"><div class="barrow"><span>可爱</span><div class="track"><div class="fill" style="width:46.4%"></div></div><span>46.4%</span></div><div class="barrow"><span>柔软</span><div class="track"><div class="fill" style="width:25.6%"></div></div><span>25.6%</span></div><div class="barrow"><span>阅读</span><div class="track"><div class="fill" style="width:12.1%"></div></div><span>12.1%</span></div><div class="barrow"><span>是</span><div class="track"><div class="fill" style="width:15.9%"></div></div><span>15.9%</span></div></div>
<p>交叉熵 L = 0.768，下降 34.0%。只是 8 个参数各动了一下。</p>
</div>

<h2 id="part-19">这套流程和 Transformer 是什么关系</h2>
<div class="table-wrap"><table><thead><tr><th>本例</th><th>真实 Transformer</th></tr></thead><tbody><tr><td>h = [0.5, −0.3]（2 维）</td><td>最后一个位置的隐藏表示（如 4096 维），由注意力 + FFN 算出</td></tr><tr><td>W 是 2×4</td><td>输出投影 d_model × V，V 可达十几万</td></tr><tr><td>4 个词的 softmax</td><td>整个词表的 softmax</td></tr><tr><td>目标“可爱”</td><td>训练数据中真实的下一个 token</td></tr><tr><td>−ln p</td><td>同样的交叉熵，对所有位置求平均</td></tr></tbody></table></div>
<p>第一讲后面那些结构（多头、位置编码、残差、LayerNorm）都在解决一件事：<strong>怎样把 h 算得更好</strong>。而从 h 到概率、到损失、到更新，就是本节这套流程，一字不改。</p>
<p class="source">本节为通用机器学习基础，不是课件内容。所有数字已用脚本计算核对；学习率取了便于观察的较大值，真实训练常用 1e−4 量级并配合 warmup 与衰减。</p>
</section>
