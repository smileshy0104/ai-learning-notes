---
slug: introduction
title: "导读 · Introduction"
collection: cme295
lecture: 1
description: "课程目标、模型发展与本讲学习顺序。"
order: 10
kind: lesson
status: published
tags: ["导读","发展脉络"]
---

<section id="introduction">
<div class="tag">Lecture outline · Introduction（课件第 1–22 页）</div>

<p>先把计算细节放一放。这部分帮助我们回答三个问题：这门课准备讲什么？今天的语言模型从哪里来？Transformer 在其中处于什么位置？</p>
<h2 id="part-2">1. 这门课的目标：理解原理，也理解使用方式</h2>
<p>课件提出两个目标：理解 Transformer 怎样工作、与大语言模型有什么关系；理解大语言模型怎样训练，以及怎样用于不同应用。可以把课程理解成从“模型内部怎样计算”，逐步走到“怎样把模型用在实际系统中”。</p>
<div class="flow" aria-label="课程学习路线"><span class="chip">架构：信息怎样流动</span><span class="arrow">→</span><span class="chip">训练：参数怎样学到</span><span class="arrow">→</span><span class="chip">应用：怎样完成任务</span></div>
<p>例如，一个助手回答问题时，我们可以分别追问：它怎样读取输入？这些能力怎样通过训练获得？它什么时候需要搜索或调用工具？这些分别涉及架构、训练和应用。本讲主要打下架构基础。</p>
<h2 id="part-3">2. 哪些基础会用到？</h2>
<p>课件面向研究与职业发展、个人项目，以及希望了解 AI 的学习者，列出的前提是机器学习基础和线性代数。学习时可以按需补上：</p>
<div class="grid"><div class="layer"><strong>线性代数</strong><br>向量：一组数字<br>矩阵：按行列排列的数字<br>点积：两个向量逐项相乘后求和<br>矩阵乘法：同时计算多组组合</div><div class="layer"><strong>机器学习</strong><br>参数：训练时调整的数字<br>预测：模型根据输入给出结果<br>损失：衡量预测与目标的差距<br>训练：根据损失调整参数</div></div>
<p class="small muted">上面是帮助入门的简述。遇到具体计算时，我们再给出定义和例子；目前无需记住所有缩写。</p>
<h2 id="part-4">3. 四个阶段：从专门的 NLP 模型到代理系统</h2>
<p>NLP 是 Natural Language Processing，即自然语言处理，研究怎样让计算机处理人类语言。点击各阶段，查看它解决了什么问题。时间轴对应课件的组织方式，阶段之间存在重叠。</p>
<div class="flow" aria-label="课程中的发展时间轴"><a class="chip" href="#era-task">2010 年代 · 专门任务</a><span class="arrow">→</span><a class="chip" href="#era-transformer">2017 · Transformer</a><span class="arrow">→</span><a class="chip" href="#era-chat">2022 · 对话</a><span class="arrow">→</span><a class="chip" href="#era-agent">课件所述当下 · 代理</a></div>
<details id="era-task" open><summary>2010 年代：不同任务，常常使用不同模型</summary><p>早期常见的做法，是为每种任务训练或适配专门的模型。例如：</p><ul><li><strong>情感分析：</strong>输入“这家餐厅很好吃”，输出“正面”。</li><li><strong>机器翻译：</strong>输入一句英文，输出对应法文。</li><li><strong>命名实体识别：</strong>在“张三住在北京”中标出人名“张三”和地名“北京”。</li></ul><div class="flow"><span class="chip">评论 → 情感模型 → 类别</span><span class="chip">英文 → 翻译模型 → 法文</span><span class="chip">句子 → 实体模型 → 标注</span></div><p>当时 RNN 是重要的序列建模方法之一。后文会介绍它怎样通过隐藏状态传递信息，以及为什么长距离依赖和顺序计算会带来困难。这里是发展主线的简化，并不意味着当时只有 RNN。</p></details>
<details id="era-transformer" open><summary>2017 年：Transformer 提供可扩展的架构基础</summary><p>《Attention Is All You Need》提出 Transformer。原始任务是机器翻译，架构由编码器和解码器组成，关键机制是自注意力：每个位置可以直接从允许访问的其他位置汇总信息。</p><p>“可扩展”可以先理解为：在合适的训练方案下，增加数据、模型参数与计算投入，可以继续改善能力。Transformer 的矩阵计算形式也适合训练中的并行处理。更多投入并不保证每项能力都自动提高，数据质量与训练设计同样重要。</p><div class="note"><strong>Transformer 是架构；LLM 是大语言模型。</strong>可以把架构理解为“计算模块怎样连接的设计”。训练把参数学出来。现代大语言模型通常采用 Transformer 的变体，但只给出架构图，还没有得到一个能聊天的模型。</div></details>
<details id="era-chat" open><summary>2022 年：ChatGPT 让对话式交互走向大众</summary><p>课件把 ChatGPT 的发布作为产品与交互方式上的转折点。用户可以直接用自然语言提问、补充条件、要求改写，在同一对话中完成多种任务。</p><div class="flow"><span class="chip">总结这段文字</span><span class="chip">把它翻译成英文</span><span class="chip">解释其中的代码</span><span class="arrow">→</span><span class="chip">通过对话提出不同任务</span></div><p>多种任务可以通过同一个语言模型接口表达。这依赖模型规模、训练数据与训练方法等多方面发展；对话产品也可能连接额外的模型和工具。Transformer 架构本身并不能单独解释全部对话能力。</p></details>
<details id="era-agent" open><summary>代理阶段：从给出建议，到调用工具并根据结果继续工作</summary><p>以“修复一个报错”为例：对话助手可以解释错误、给出修改建议；具备相应工具和权限的代理系统，还可以读取文件、修改代码、运行检查，再根据报错继续调整。</p><div class="flow" aria-label="代理系统的简化循环"><span class="chip">接收目标</span><span class="arrow">→</span><span class="chip">模型选择下一步</span><span class="arrow">→</span><span class="chip">系统执行工具</span><span class="arrow">→</span><span class="chip">结果返回模型，继续或结束</span></div><p>这里的 Agent 可以先理解成“模型与工具、状态管理、执行循环等组成的系统”。工具由外部程序执行，模型根据获得的结果决定后续动作。能调用工具不等于一定能正确完成任务，实际能力还取决于工具、上下文、权限与验证。</p><p class="small muted">代理循环是帮助理解课件概念的补充示意，本讲并未详细展开代理实现。</p></details>
<h2 id="part-5">4. 再把几个经常混淆的名字分开</h2>
<div class="table-wrap"><table><thead><tr><th>名称</th><th>指什么</th><th>通俗理解</th></tr></thead><tbody><tr><td>Transformer</td><td>神经网络架构</td><td>内部计算模块的设计</td></tr><tr><td>LLM</td><td>大语言模型</td><td>经过训练、能够处理与生成语言的模型</td></tr><tr><td>ChatGPT</td><td>对话式产品</td><td>用户与模型及相关功能交互的入口</td></tr><tr><td>AI Agent</td><td>围绕目标执行步骤的系统</td><td>模型结合工具、状态与执行循环完成工作</td></tr></tbody></table></div>
<p>这些概念分别描述架构、模型、产品与系统。理解它们之间的联系，可以避免把“学会注意力公式”误认为已经解释了一个完整 AI 助手的全部工作方式。</p>
<h2 id="part-6">5. 本讲接下来怎样走？</h2>
<div class="flow"><span class="chip">文字怎样切分？<br>Tokenization</span><span class="arrow">→</span><span class="chip">词元怎样表示？<br>Word representation</span><span class="arrow">→</span><span class="chip">上下文怎样交互？<br>Self-attention</span><span class="arrow">→</span><span class="chip">组件怎样连接？<br>Transformer architecture</span><span class="arrow">→</span><span class="chip">完整翻译过程<br>End-to-end example</span></div>
<p>本讲共 13 个章节，下面按阅读顺序列出其余 12 章。每章都可以独立阅读，但从上到下更连贯。</p>
<div class="table-wrap"><table><thead><tr><th>章节</th><th>这一章讲什么</th></tr></thead><tbody><tr><td><a href="basics.html">基础工具箱：模型怎样学习</a></td><td>14 个基础概念，各配一个例子，走完一次前向、反向与更新。</td></tr><tr><td><a href="background.html">前置动机：从计数到学习表示</a></td><td>N-gram、神经语言模型与向量相似度。</td></tr><tr><td><a href="tokens.html">分词、词表与特殊 Token</a></td><td>粒度选择、BPE、BOS、EOS 与填充。</td></tr><tr><td><a href="embedding.html">词元表示 · Token representation</a></td><td>从离散编号到可学习向量，区分初始嵌入与上下文表示。</td></tr><tr><td><a href="neural-nets.html">Word2Vec、RNN 与 LSTM</a></td><td>从浅层网络到序列建模，理解早期注意力的动机。</td></tr><tr><td><a href="attention.html">自注意力 · Self-attention</a></td><td>Q/K/V、矩阵维度、手算过程与可交互的权重实验。</td></tr><tr><td><a href="components.html">Transformer 的核心组件</a></td><td>位置、多头、FFN、残差、归一化、Dropout 与标签平滑。</td></tr><tr><td><a href="architecture.html">编码器与解码器</a></td><td>谁读源句、谁写译文，以及两种注意力如何配合。</td></tr><tr><td><a href="mask.html">因果掩码 · Causal masking</a></td><td>预测未来时为什么不能偷看答案，训练为何能并行。</td></tr><tr><td><a href="end-to-end.html">端到端翻译示例</a></td><td>从一句英文开始，跟踪分词、嵌入、编码与逐步生成。</td></tr><tr><td><a href="beyond-lecture.html">从这一讲到现代大模型</a></td><td>三种架构与模型训练、应用之间的连接。</td></tr><tr><td><a href="deep-dive.html">补充：规模、训练与现代架构</a></td><td>微调、提示、缩放经验与现代模型的组件变化。</td></tr></tbody></table></div>
<details><summary>理解检查：ChatGPT、Transformer、Agent 是同一个东西吗？</summary><p>它们描述不同层面。Transformer 描述模型的架构；ChatGPT 是对话产品；Agent 描述围绕目标执行步骤的系统形式。一个产品可以使用 Transformer 架构的模型，也可以提供使用工具的代理功能。</p></details>
<details><summary>理解检查：为什么第一讲先讲 2017 年的翻译架构？</summary><p>它提供了一个清晰的完整例子：源句进入编码器，解码器结合源句与已有输出生成译文。先理解嵌入、注意力和前馈网络怎样配合，后续再学习现代模型保留、修改或移除了哪些组件。</p></details>
<p class="source">课件定位：第 1–16 页为课程开场；第 17–22 页为 Introduction 的发展脉络。例句、概念对照与代理循环为教学补充。课件还介绍后训练、AI Agents 和 Diffusion LLMs 等后续主题，本讲无需提前掌握。课程安排和考试信息以课程官方发布为准。</p>
</section>
