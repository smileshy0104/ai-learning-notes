---
slug: beyond-lecture
title: "从这一讲到现代大模型"
collection: cme295
lecture: 1
description: "三种架构与模型训练、应用之间的连接。"
order: 120
kind: lesson
status: published
tags: ["架构","预训练"]
---

<section id="beyond-lecture">
<div class="tag">补充展望 · 参考文档 1.5、2.3 节；后续学习入口</div>

<div class="table-wrap"><table><thead><tr><th>架构</th><th>主要信息路径</th><th>常见用途与例子</th></tr></thead><tbody><tr><th>Encoder-only</th><td>输入位置可双向交互</td><td>BERT 类：表示学习、分类、检索等</td></tr><tr><th>Decoder-only</th><td>读取前文，因果预测后续 token</td><td>GPT 类：续写、对话，也能通过生成回答理解类任务</td></tr><tr><th>Encoder–Decoder</th><td>编码源输入；解码器用交叉注意力读取它</td><td>T5、原始 Transformer：翻译、摘要等序列转换</td></tr></tbody></table></div>
<p>这些是结构与常见使用方式，不能仅凭架构就给模型排能力高低。Decoder-only 也会处理和理解输入；标准 BERT 不直接采用 GPT 式自回归生成，但“任何编码器都绝不可能用于生成”同样过于绝对。</p>
<div class="flow"><span class="chip">架构设计</span><span class="arrow">＋</span><span class="chip">数据与训练</span><span class="arrow">→</span><span class="chip">预训练基座</span><span class="arrow">→</span><span class="chip">任务适配／指令训练等</span><span class="arrow">→</span><span class="chip">应用与工具系统</span></div>
<p>本讲解决“网络怎样计算”。预训练、指令训练、偏好优化、KV Cache、RoPE、GQA 与 Agent 工程，留作后续专题；这里先建立它们与第一讲的连接。</p>
<p class="source">补充资料：<a href="https://github.com/datawhalechina/hello-agents">《大语言模型基础 - 大模型技术与发展》原文副本</a>。本页沿用其讲解思路，并校正了部分过度简化或不一致的说法；它不是 CME295 讲义原文。</p>
</section>
