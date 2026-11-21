---
slug: mask
title: "因果掩码 · Causal masking"
collection: cme295
lecture: 1
description: "预测未来时为什么不能偷看答案，训练为何能并行。"
order: 100
kind: lesson
status: published
tags: ["Mask","Causal"]
---

<section id="mask" class="switch">
<div class="tag">Transformer architecture · Masking / causal self-attention（课件第 75 页）</div>

<p>训练时我们已经拥有完整句子，但仍然要模拟生成条件。例如输入位置“喜欢”的输出负责预测“熊”，它可以读取“我”和“喜欢”，不能直接读取后面的“熊”。</p>
<input type="radio" name="mask-pos" id="mask-1">
<input type="radio" name="mask-pos" id="mask-2" checked>
<input type="radio" name="mask-pos" id="mask-3">
<input type="radio" name="mask-pos" id="mask-4">
<div class="controls" role="group" aria-label="查看输入位置"><span>查看输入位置：</span><label for="mask-1">1 · 我</label><label for="mask-2">2 · 喜欢</label><label for="mask-3">3 · 熊</label><label for="mask-4">4 · 。</label></div>
<div class="table-wrap"><table class="mask"><caption>行 = 发起查询的位置；列 = 可被读取的位置</caption><thead><tr><th scope="col">查询 ↓ / 读取 →</th><th scope="col">我</th><th scope="col">喜欢</th><th scope="col">熊</th><th scope="col">。</th></tr></thead><tbody><tr><th scope="row">我</th><td class="allowed">可读</td><td class="blocked">屏蔽</td><td class="blocked">屏蔽</td><td class="blocked">屏蔽</td></tr><tr><th scope="row">喜欢</th><td class="allowed">可读</td><td class="allowed">可读</td><td class="blocked">屏蔽</td><td class="blocked">屏蔽</td></tr><tr><th scope="row">熊</th><td class="allowed">可读</td><td class="allowed">可读</td><td class="allowed">可读</td><td class="blocked">屏蔽</td></tr><tr><th scope="row">。</th><td class="allowed">可读</td><td class="allowed">可读</td><td class="allowed">可读</td><td class="allowed">可读</td></tr></tbody></table></div>
<p class="mask-desc desc-1">位置 1“我”可读取：我。这个位置的输出用于预测下一个 token“喜欢”。</p>
<p class="mask-desc desc-2">位置 2“喜欢”可读取：我、喜欢。这个位置的输出用于预测下一个 token“熊”。</p>
<p class="mask-desc desc-3">位置 3“熊”可读取：我、喜欢、熊。这个位置的输出用于预测下一个 token“。”。</p>
<p class="mask-desc desc-4">位置 4“。”可读取全部四个位置。这个位置的输出用于预测后续 token，例如结束标记。</p>
<div class="note">允许读取的分数保持原值；禁止读取的分数在 softmax 前设为 −∞，于是对应权重为 0。图中的下三角形来自“只看当前及之前位置”的规则。</div>
<details><summary>训练能并行，为什么生成还要逐个进行？</summary><p>训练文本已知，可以同时提供各输入位置，再通过掩码阻断未来信息，计算各位置的预测损失。自回归生成时，下一 token 还没选出来，后续位置的输入尚不存在，所以通常需要逐个生成。</p></details>
<p class="source">课件定位：第 75 页及课堂末尾问答。这里展示因果掩码，实际训练还可能需要屏蔽填充位置。</p>
</section>
