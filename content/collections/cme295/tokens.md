---
slug: tokens
title: "分词、词表与特殊 Token"
collection: cme295
lecture: 1
description: "粒度选择、BPE、BOS、EOS 与填充。"
order: 40
kind: lesson
status: published
tags: ["Tokenizer","BPE"]
---

<section id="tokens" class="switch">
<div class="tag">Lecture outline · Tokenization（课件第 24–31 页）</div>

<p>模型不能直接把一段文字拿去做矩阵乘法。第一步是把文字切成 <strong>token（词元）</strong>，然后给每个 token 一个编号。token 可以是完整单词、单词的一部分或标点。</p>
<div class="math">原文：A cute teddy bear is reading.</div>
<input type="radio" name="tok" id="tok-word" checked>
<input type="radio" name="tok" id="tok-sub">
<input type="radio" name="tok" id="tok-char">
<div class="controls" role="group" aria-label="分词方式"><label for="tok-word">按词</label><label for="tok-sub">按子词</label><label for="tok-char">按字符</label></div>
<div class="panel panel-word">
<div class="flow"><span class="chip">A</span><span class="chip">cute</span><span class="chip">teddy</span><span class="chip">bear</span><span class="chip">is</span><span class="chip">reading</span><span class="chip">.</span></div>
<p>序列长度：<strong>7 个 token</strong>。完整单词各占一个 token，标点单独处理。实际词级系统还要规定大小写、数字和未知词的处理方式。</p>
</div>
<div class="panel panel-sub">
<div class="flow"><span class="chip">A</span><span class="chip">cute</span><span class="chip">ted</span><span class="chip">dy</span><span class="chip">bear</span><span class="chip">is</span><span class="chip">read</span><span class="chip">ing</span><span class="chip">.</span></div>
<p>序列长度：<strong>9 个 token</strong>。示意：teddy 拆成 ted + dy，reading 拆成 read + ing。同一小块会在不同单词之间复用，于是词表不必列出所有完整单词。</p>
</div>
<div class="panel panel-char">
<div class="flow"><span class="chip">A</span><span class="chip">␠</span><span class="chip">c</span><span class="chip">u</span><span class="chip">t</span><span class="chip">e</span><span class="chip">␠</span><span class="chip">t</span><span class="chip">e</span><span class="chip">d</span><span class="chip">d</span><span class="chip">y</span><span class="chip">␠</span><span class="chip">b</span><span class="chip">e</span><span class="chip">a</span><span class="chip">r</span><span class="chip">␠</span><span class="chip">i</span><span class="chip">s</span><span class="chip">␠</span><span class="chip">r</span><span class="chip">e</span><span class="chip">a</span><span class="chip">d</span><span class="chip">i</span><span class="chip">n</span><span class="chip">g</span><span class="chip">.</span></div>
<p>序列长度：<strong>29 个 token</strong>。␠ 表示空格。基础符号很少，任何句子都能拼出来，但同一句话占用的位置变多，计算也随之增加。</p>
</div>
<div class="note">观察两个量：<strong>词表大小</strong>是“总共有多少种可用的小块”；<strong>序列长度</strong>是“这句话用了多少个小块”。这里能直接看到的是后者。</div>
<p class="small muted">三种切法仅用于比较。真实 BPE 的切分由词表与合并规则决定，空格也有具体的编码方式；这里的“按子词”不执行 BPE 训练。</p>
<details><summary>想一想：为什么不把每个句子都当成一个 token？</summary><p>可能出现的句子太多，有限词表无法列举。把文本切成可重复使用的小块，能用有限词表组合出大量表达。另一端，如果切得非常细，序列会变长，计算也会增加。</p></details>
<h2 id="part-2">特殊 token：不是普通文字，却有固定作用</h2>
<p>词表里除了普通文字块，还预留了一些带固定含义的<strong>特殊 token（special token）</strong>。它们像句子里的“功能标记”，告诉模型这段内容从哪里开始、到哪里结束，或者某个位置其实没有内容。</p>
<div class="table-wrap"><table><thead><tr><th>特殊 token</th><th>名称</th><th>作用</th><th>例子</th></tr></thead><tbody><tr><td>[UNK]</td><td>Unknown，未知词</td><td>表示词表里没有这个片段</td><td>拼错的词被替换为 [UNK]</td></tr><tr><td>[BOS]</td><td>Beginning of sequence，序列开始</td><td>告诉模型“从这里开始”</td><td>生成时先输入 [BOS]</td></tr><tr><td>[EOS]</td><td>End of sequence，序列结束</td><td>告诉模型“这里结束了”</td><td>模型输出 [EOS] 时停止生成</td></tr><tr><td>[PAD]</td><td>Padding，填充</td><td>把短句补到统一起见长度，其位置不参与实际内容</td><td>把 4 个 token 的句子补齐到 8 个</td></tr></tbody></table></div>
<h3 id="part-3">例 1：词表里没有的词</h3>
<p>假设词表只有四个 token：<code>teddy bear</code>、<code>cute bear</code>、<code>bear</code>、<code>[UNK]</code>。输入写成了 <code>tedi bear</code>（少了一个 d），前两个字符组合不在词表里，于是：</p>
<div class="flow"><span class="chip">tedi</span><span class="arrow">→ 词表里找不到 →</span><span class="chip">[UNK]</span><span class="arrow">+</span><span class="chip">bear</span></div>
<p>这样模型至少知道“这里有个东西，但我不认识”，而不是直接丢弃。现代使用字节级子词的分词器能让常见文字片段都落在词表内，所以遇到普通拼写错误时往往不需要 [UNK]。</p>
<h3 id="part-4">例 2：开始与结束</h3>
<p>生成文本时，需要告诉模型从哪里开始，也需要模型告诉我们何时停下：</p>
<div class="flow"><span class="chip">[BOS]</span><span class="chip">What</span><span class="chip">a</span><span class="chip">cute</span><span class="chip">teddy bear</span><span class="chip">!</span><span class="chip">[EOS]</span></div>
<p>[BOS] 是<strong>输入</strong>的第一个位置，用来启动生成；[EOS] 是模型应当<strong>输出</strong>的结束信号。两者不是同一件事。</p>
<h3 id="part-5">例 3：为什么需要填充</h3>
<p>同一批数据里句子长短不一。硬件喜欢整齐的矩阵，所以常把短句补齐到相同长度。下面切换看一下：</p>
<input type="radio" name="pad" id="pad-off" checked>
<input type="radio" name="pad" id="pad-on">
<div class="controls" role="group" aria-label="是否填充"><label for="pad-off">原始长度</label><label for="pad-on">补齐到 8 个位置</label></div>
<div class="panel panel-padoff">
<div class="flow"><span class="chip">[BOS]</span><span class="chip">What</span><span class="chip">a</span><span class="chip">cute</span><span class="chip">teddy bear</span><span class="chip">!</span><span class="chip">[EOS]</span></div>
<p>句子 A：7 个位置；句子 B：4 个位置。长度不同，无法直接堆成一个整齐矩阵。</p>
</div>
<div class="panel panel-padon">
<p>句子 A（7 个）：</p>
<div class="flow"><span class="chip">[BOS]</span><span class="chip">What</span><span class="chip">a</span><span class="chip">cute</span><span class="chip">teddy bear</span><span class="chip">!</span><span class="chip">[EOS]</span><span class="chip muted-chip">[PAD]</span></div>
<p>句子 B（4 个）：</p>
<div class="flow"><span class="chip">[BOS]</span><span class="chip">Good</span><span class="chip">night</span><span class="chip">[EOS]</span><span class="chip muted-chip">[PAD]</span><span class="chip muted-chip">[PAD]</span><span class="chip muted-chip">[PAD]</span><span class="chip muted-chip">[PAD]</span></div>
<p>两行现在都是 8 个位置，可以堆成一个整齐的矩阵。填充位置不是真实内容，训练时通常需要让注意力忽略它们，否则会干扰计算与损失。</p>
</div>
<div class="note"><strong>名字不是固定的。</strong>不同模型使用不同写法，例如 <code>&lt;s&gt;</code>、<code>&lt;|endoftext|&gt;</code>、<code>&lt;|start_header_id|&gt;</code> 等；对话模型还可能出现标记“谁在说话”的角色 token（如 user、assistant）。使用一个模型时，应当查它自己的分词器说明，而不是套用这里的名字。</div>
<details><summary>理解检查：[BOS] 与 [EOS] 分别由谁产生？</summary><p>[BOS] 通常由使用者在构造输入时加上，作为生成起点（输入侧）；[EOS] 通常由模型在输出层预测得到，作为停止信号（输出侧）。原始 Transformer 翻译示例里，解码器输入以 [BOS] 开头，训练目标末尾则是 [EOS]。</p></details>
<h2 id="part-6">分词器与词表规模</h2>
<p><strong>分词器（tokenizer）</strong>是一个独立于神经网络的组件，负责“文字 ⇄ 编号”的转换：</p>
<div class="flow"><span class="chip">训练阶段：从语料统计出词表与合并规则</span><span class="arrow">→</span><span class="chip">使用阶段：encode 文字→ID</span><span class="arrow">→</span><span class="chip">模型计算</span><span class="arrow">→</span><span class="chip">decode 生成 ID→文字</span></div>
<p>词表大小 V 就是“总共准备多少个可用符号”。它和序列长度 n 是一对相互牵制的量：切得越细，词表越小，但同样的句子需要更多位置；切得越粗，序列变短，但词表膨胀。</p>
<div class="table-wrap"><table><thead><tr><th>粒度</th><th>大致词表规模</th><th>同一句的序列长度</th><th>主要代价</th></tr></thead><tbody><tr><td>字符级</td><td>几十到几百</td><td>最长</td><td>位置多，计算与长距离依赖更重</td></tr><tr><td>子词级（主流）</td><td>约 3 万到 20 万</td><td>中等</td><td>依赖训练语料与语言覆盖</td></tr><tr><td>词级</td><td>可达数十万以上</td><td>最短</td><td>未登录词、形态变化导致词表膨胀</td></tr></tbody></table></div>
<p class="small muted">区间为公开模型的常见量级，用于建立直觉；具体数值以各模型的分词器说明为准。</p>
<h3 id="part-7">BPE 到底在做什么？</h3>
<p>课堂以 BPE（Byte Pair Encoding，字节对编码）为例：从基础符号出发，反复把<strong>语料中最常见的相邻符号对</strong>合并成一个新符号，直到词表达到目标大小。下面用一个很小的语料走四步：</p>
<input type="radio" name="bpe" id="bpe-1" checked>
<input type="radio" name="bpe" id="bpe-2">
<input type="radio" name="bpe" id="bpe-3">
<input type="radio" name="bpe" id="bpe-4">
<div class="controls" role="group" aria-label="BPE 合并步骤"><span>合并步骤：</span><label for="bpe-1">第 0 步：只有字母</label><label for="bpe-2">第 1 步：合并 a+d</label><label for="bpe-3">第 2 步：合并 e+ad</label><label for="bpe-4">第 3 步：合并 r+ead</label></div>
<div class="panel panel-bpe1">
<div class="table-wrap"><table><caption>第 0 步：只有字母</caption><thead><tr><th>语料中的词</th><th>当前切分</th><th>token 数</th></tr></thead><tbody><tr><th scope="row">read ×4</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">a</span><span class="chip">d</span></div></td><td>4</td></tr><tr><th scope="row">reader ×2</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">a</span><span class="chip">d</span><span class="chip">e</span><span class="chip">r</span></div></td><td>6</td></tr><tr><th scope="row">reading ×3</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">a</span><span class="chip">d</span><span class="chip">i</span><span class="chip">n</span><span class="chip">g</span></div></td><td>7</td></tr></tbody></table></div>
<p><strong>词表：</strong>字母表 r e a d i n g（7 个符号）</p>
<p>初始词表只放单个字符。此时 read、reader、reading 都拆得很碎，句子会变长。</p>
</div>
<div class="panel panel-bpe2">
<div class="table-wrap"><table><caption>第 1 步：合并 a+d（a + d → ad）</caption><thead><tr><th>语料中的词</th><th>当前切分</th><th>token 数</th></tr></thead><tbody><tr><th scope="row">read ×4</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">ad</span></div></td><td>3</td></tr><tr><th scope="row">reader ×2</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">ad</span><span class="chip">e</span><span class="chip">r</span></div></td><td>5</td></tr><tr><th scope="row">reading ×3</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">ad</span><span class="chip">i</span><span class="chip">n</span><span class="chip">g</span></div></td><td>6</td></tr></tbody></table></div>
<p><strong>词表：</strong>7 + 1 = 8 个符号（新增 ad）</p>
<p>统计全语料中相邻符号对：(r,e)、(e,a)、(a,d) 各出现 9 次，此处按字母顺序取 a+d 合并。</p>
</div>
<div class="panel panel-bpe3">
<div class="table-wrap"><table><caption>第 2 步：合并 e+ad（e + ad → ead）</caption><thead><tr><th>语料中的词</th><th>当前切分</th><th>token 数</th></tr></thead><tbody><tr><th scope="row">read ×4</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">ead</span></div></td><td>2</td></tr><tr><th scope="row">reader ×2</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">ead</span><span class="chip">e</span><span class="chip">r</span></div></td><td>4</td></tr><tr><th scope="row">reading ×3</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">ead</span><span class="chip">i</span><span class="chip">n</span><span class="chip">g</span></div></td><td>5</td></tr></tbody></table></div>
<p><strong>词表：</strong>8 + 1 = 9 个符号（新增 ead）</p>
<p>此时 (e,ad) 出现 9 次，是最频繁的相邻对之一。read 变成 r + ead。</p>
</div>
<div class="panel panel-bpe4">
<div class="table-wrap"><table><caption>第 3 步：合并 r+ead（r + ead → read）</caption><thead><tr><th>语料中的词</th><th>当前切分</th><th>token 数</th></tr></thead><tbody><tr><th scope="row">read ×4</th><td><div class="flow" style="margin:6px 0"><span class="chip">read</span></div></td><td>1</td></tr><tr><th scope="row">reader ×2</th><td><div class="flow" style="margin:6px 0"><span class="chip">read</span><span class="chip">e</span><span class="chip">r</span></div></td><td>3</td></tr><tr><th scope="row">reading ×3</th><td><div class="flow" style="margin:6px 0"><span class="chip">read</span><span class="chip">i</span><span class="chip">n</span><span class="chip">g</span></div></td><td>4</td></tr></tbody></table></div>
<p><strong>词表：</strong>9 + 1 = 10 个符号（新增 read）</p>
<p>高频词 read 合并成一个符号；reader、reading 仍然保留复用的部分，因此它们和 read 共享词根表示。</p>
</div>
<div class="note">真实 BPE 往往从字节开始，并在“词边界”内统计相邻对；这里的字母级演示省略了这些细节，只展示“高频相邻对逐次合并、词表逐步变大、序列逐步变短”这个核心机制。</div>
<h3 id="part-8">词表大小怎样影响参数量</h3>
<p>输入嵌入表的大小是 <code>V × d_model</code>。以 d_model = 4096 为例：</p>
<div class="table-wrap"><table><thead><tr><th>词表大小 V</th><th>嵌入表参数量 V × 4096</th><th>直观理解</th></tr></thead><tbody><tr><td>32,000</td><td>约 1.31 亿</td><td>词表较小，序列更长</td></tr><tr><td>50,257</td><td>约 2.06 亿</td><td>常见英文为主的量级</td></tr><tr><td>200,000</td><td>约 8.19 亿</td><td>词表很大，单这一层就很占参数</td></tr></tbody></table></div>
<p>词表变大还会带来一个副作用：每个符号在训练中出现的次数变少，低频符号的向量不容易学好。所以词表规模是效率、覆盖率与学习效果的折中，并非越大越好。总计算量还与序列长度有关：注意力分数矩阵是 n × n。</p>
<h3 id="part-9">多语言时要注意什么？</h3>
<p>课堂问答提到：如果分词器在多语言混合语料上训练，词表会被多种语言瓜分。如果你只关心其中一种语言，序列可能变长；但跨语言共享的符号（比如通用缩写）也可能带来帮助。因此做多语言工作时，应确认分词器确实在你关心的语言上训练过。</p>
<p class="source">课件定位：第 24、27 页提到词表与序列长度；第 28–31 页为特殊 token；BPE 步骤、参数量与规模区间为教学补充，词表量级参考课堂问答。</p>
</section>
