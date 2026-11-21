// 复核 basics 一节的所有数字：用同一组常数重算，并确认正文里写的是这些值。
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../site/lib/content.mjs';

const near = (a, b, tolerance = 5e-5) => assert(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const softmax = z => {
  const max = Math.max(...z);
  const exp = z.map(value => Math.exp(value - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return { exp, sum, p: exp.map(value => value / sum) };
};

const h = [0.5, -0.3];
const W = [[1.0, 0.5, -0.5, 0.0], [0.2, -1.0, 0.3, 0.1]];
const target = 0;
const words = 4;
const z = W[0].map((_, j) => dot(h, W.map(row => row[j])));
const { p } = softmax(z);
const L = -Math.log(p[target]);

test('the worked chain in basics reproduces logits, probabilities and loss', () => {
  z.forEach((value, i) => near(value, [0.44, 0.55, -0.34, -0.03][i]));
  p.forEach((value, i) => near(value, [0.3125, 0.3489, 0.1433, 0.1953][i]));
  near(L, 1.1631, 1e-4);
  // 手算校验：第 2 列与第 4 列
  near(0.5 * 0.5 + -0.3 * -1.0, 0.55);
  near(0.5 * 0.0 + -0.3 * 0.1, -0.03);
});

const articleOf = (data, lang) => data.articles.find(a => a.collection === 'cme295' && a.slug === 'basics' && a.lang === lang);

test('concept 1 ships hand-computable examples, not just shape talk', async () => {
  // 逐元素：每个 z 都是 h 的两个数与 W 某一列的两个数一配一
  const elementwise = W[0].map((_, j) => h[0] * W[0][j] + h[1] * W[1][j]);
  elementwise.forEach((value, i) => near(value, z[i]));

  // batch=2 的两行都算得出来，且行与行互不影响
  const h2 = [1.0, 0.2];
  const row2 = W[0].map((_, j) => h2[0] * W[0][j] + h2[1] * W[1][j]);
  row2.forEach((value, i) => near(value, [1.04, 0.3, -0.44, 0.02][i]));
  assert.equal(2 * 4 * 2, 16, 'batch=2 的乘法次数');
  assert.equal(2 * 4, 8, 'batch=2 的加法次数');

  // batch 只在最前面加一维：形状相乘就是运算次数，参数量不变
  const batch = 32;
  assert.equal(batch * z.length * h.length, 256, '乘法次数应为 32 × 4 × 2');
  assert.equal(batch * z.length, 128, '加法次数应为 32 × 4');
  assert.equal(W.length * W[0].length, 8, 'batch 不增加参数');

  // 元素个数 = 各维相乘
  const count = shape => shape.reduce((a, b) => a * b, 1);
  assert.equal(count([]), 1);
  assert.equal(count([2]), 2);
  assert.equal(count([2, 4]), 8);
  assert.equal(count([32, 2]), 64);
  assert.equal(count([32, 4]), 128);
  assert.equal(count([32, 4, 4]), 512);
  assert.equal(count([32, 4, 8]), 1024);
  assert.equal(batch * 4 * 4 * 8, 4096, '批量注意力的乘法次数');

  // 同一组数：(1,4)×(4,1) 是内积，(4,1)×(1,4) 是 16 个数的外积
  const inner = z.reduce((sum, value) => sum + value * value, 0);
  near(inner, 0.6126, 1e-4);
  const outer = z.map(a => z.map(b => a * b));
  assert.equal(outer.length * outer[0].length, 16, '外积应为 4 × 4');
  near(outer[0][0], 0.1936, 1e-4);
  near(outer[0][1], 0.2420, 1e-4);
  near(outer.reduce((sum, row, i) => sum + row[i], 0), inner, 1e-12);

  const data = await loadContent(fileURLToPath(new URL('../', import.meta.url)));
  const zh = articleOf(data, 'zh').html;
  const concept1 = zh.split('概念 1：张量、向量、矩阵与形状')[1].split('概念 2：参数与超参数')[0];
  for (const fragment of ['0.5 × 1.0', '0.500 − 0.060 = 0.440', '形状校验', '256 次', '128 次', '8 个',
    '1.040', '0.440', '0.6126', '0.1936', '0.2420', '1024', '512', '4096', '外积',
    // 每个乘数都要标出取自 W 的哪一列、哪一行
    '第 1 行（与 h 的 0.5 相乘）', '第 2 行（与 h 的 −0.3 相乘）', '可爱（第 1 列）',
    '第 1 列：上行 1.0、下行 0.2', '第 4 列：上行 0.0、下行 0.1']) {
    assert(concept1.includes(fragment), `概念 1 缺少「${fragment}」`);
  }
  assert(!concept1.includes('**'), '概念 1 存在未渲染的 Markdown 强调');

  // 英文版必须同样给出算式，不能只有形状描述，也不能重复插入
  const en = articleOf(data, 'en').html.split('Concept 1: tensors, vectors, matrices and shapes')[1]
    .split('Concept 2: parameters and hyperparameters')[0];
  for (const fragment of ['0.5 × 1.0', '0.500 − 0.060 = 0.440', 'Shape check', '= 256', '= 128',
    '1.040', '0.6126', '0.1936', '1024', '4096', 'outer product',
    'row 1 (multiplied by 0.5 of h)', 'cute (col 1)', 'col 1: top 1.0, bottom 0.2']) {
    assert(en.includes(fragment), `英文版概念 1 缺少「${fragment}」`);
  }
  assert.equal(en.split('Shape check').length - 1, 1, '英文版概念 1 的算式块不应重复');
});

test('sample indices and vector components never share a symbol', async () => {
  // h⁽¹⁾/h⁽²⁾ 是样本，h₁/h₂ 只能是 h 的分量；两者含义不同，不能同名
  const data = await loadContent(fileURLToPath(new URL('../', import.meta.url)));
  for (const lang of ['zh', 'en']) {
    const html = articleOf(data, lang).html;
    assert(html.includes('h⁽¹⁾') && html.includes('h⁽²⁾'), `${lang}: 样本应用上标括号编号`);
    // h₁/h₂ 只能出现在讲分量/梯度的位置（概念 8~9），不得出现在概念 1 的 batch 例子中
    const concept1 = lang === 'zh'
      ? html.split('概念 1：张量、向量、矩阵与形状')[1].split('概念 2：参数与超参数')[0]
      : html.split('Concept 1: tensors, vectors, matrices and shapes')[1].split('Concept 2: parameters and hyperparameters')[0];
    // h₁/h₂ 可以提到（作为反例提醒），但不得再被赋值为样本，也不得用作样本名
    for (const symbol of ['h₁', 'h₂']) {
      assert(!concept1.includes(`${symbol} = [`), `${lang}: 概念 1 不得用 ${symbol} 表示样本`);
    }
  }
});

test('concept 4 explains why the multiplication is there, not just how to do it', async () => {
  const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
  const norm = v => Math.hypot(...v);
  const columns = W[0].map((_, j) => [W[0][j], W[1][j]]);

  // 加法分不出“同样和、不同分布”的两组输入，乘法能分出来
  const hAlt = [0.1, 0.1];
  near(h[0] + h[1], hAlt[0] + hAlt[1]); // 两组和都是 0.2
  const bias = [0.3, 0.1, 0, 0.1];
  const byAddition = bias.map(value => h[0] + h[1] + value);
  const byAdditionAlt = bias.map(value => hAlt[0] + hAlt[1] + value);
  byAddition.forEach((value, i) => near(value, byAdditionAlt[i]));
  [0.5, 0.3, 0.2, 0.3].forEach((value, i) => near(byAddition[i], value, 1e-9));

  const zAlt = columns.map(column => dot(hAlt, column));
  [0.12, -0.05, -0.02, 0.01].forEach((value, i) => near(zAlt[i], value, 1e-9));
  const topOf = scores => scores.indexOf(Math.max(...scores));
  assert.equal(topOf(z), 1, '原 h 的第一名是柔软');
  assert.equal(topOf(zAlt), 0, '换成 h′ 后第一名变成可爱');

  // 几何视角：cos θ = 点积 / (|h||w|)，阅读那一列正好是 −h
  const cosines = columns.map(column => dot(h, column) / (norm(h) * norm(column)));
  near(norm(h), 0.5831, 1e-4);
  near(cosines[0], 0.7399, 1e-4);
  near(cosines[1], 0.8437, 1e-4);
  near(cosines[2], -1, 1e-12);
  near(cosines[3], -0.5145, 1e-4);
  // 浮点误差可能让 cos 略小于 −1，acos 前先截断到 [−1, 1]
  const clamp = value => Math.max(-1, Math.min(1, value));
  near(Math.acos(clamp(cosines[2])) * 180 / Math.PI, 180, 1e-9);

  const data = await loadContent(fileURLToPath(new URL('../', import.meta.url)));
  const cut = (html, from, to) => html.split(from)[1].split(to)[0];
  const zh4 = cut(articleOf(data, 'zh').html, '概念 4：线性层（全连接层）', '概念 5：激活函数');
  for (const fragment of ['为什么是相乘', '0.120', '−0.050', '0.7399', '0.8437', '−0.5145', '180.0°', '0.5831', '匹配度']) {
    assert(zh4.includes(fragment), `概念 4 缺少「${fragment}」`);
  }
  const en4 = cut(articleOf(data, 'en').html, 'Concept 4: the linear layer', 'Concept 5: activation functions');
  for (const fragment of ['Why multiply rather than add', '0.120', '−0.050', '0.7399', '0.8437', '−0.5145', '180.0°', 'match quality']) {
    assert(en4.includes(fragment), `英文版概念 4 缺少「${fragment}」`);
  }
});

test('softmax shift, overflow guard and temperature examples match the text', () => {
  const shifted = softmax([2, 1]);
  near(shifted.exp[0] / shifted.sum, 0.7311, 1e-4);
  near(shifted.exp[1] / shifted.sum, 0.2689, 1e-4);
  assert.equal(Math.exp(1000), Infinity, '溢出例子需要 exp(1000) 为 Infinity');
  near(softmax([0, 0]).p[0], 0.5);
  const sharp = softmax(z.map(v => v / 0.5)).p;
  const flat = softmax(z.map(v => v / 2)).p;
  const nearFlat = softmax(z.map(v => v / 8)).p;
  near(sharp[1], 0.4377, 1e-4);
  near(flat[1], 0.2998, 1e-4);
  near(nearFlat[1], 0.2624, 1e-4);
  assert(sharp[1] > p[1] && p[1] > flat[1] && flat[1] > nearFlat[1], '温度应单调地改变尖锐程度');
  near(sharp.reduce((a, b) => a + b), 1);
});

test('gradients, the finite-difference check and one update step agree', () => {
  const grad = p.map((value, i) => value - (i === target ? 1 : 0));
  near(grad[0], -0.6875, 1e-4);
  const dW = W.map((row, i) => row.map((_, j) => h[i] * grad[j]));
  near(dW[0][0], -0.3437, 1e-4);
  near(dW[1][0], 0.2062, 1e-4);
  const dh = [0, 1].map(i => grad.reduce((sum, g, j) => sum + g * W[i][j], 0));
  near(dh[0], -0.5847, 1e-4);
  near(dh[1], -0.4239, 1e-4);

  // 有限差分：+0.01 后损失的实测变化应与梯度×步长一致
  const bumped = z.slice();
  bumped[0] += 0.01;
  const L2 = -Math.log(softmax(bumped).p[target]);
  near(L2, 1.1562, 1e-4);
  near(L2 - L, grad[0] * 0.01, 1e-4);

  const eta = 2;
  const updated = W.map((row, i) => row.map((value, j) => value - eta * dW[i][j]));
  near(updated[0][0], 1.6875);
  const z2 = updated[0].map((_, j) => dot(h, updated.map(row => row[j])));
  const p2 = softmax(z2).p;
  near(p2[0], 0.464, 1e-4);
  near(-Math.log(p2[0]), 0.768, 1e-3);
  near((L - -Math.log(p2[0])) / L, 0.34, 5e-3);
});

test('MSE, per-token averaging, label smoothing and dropout examples are consistent', () => {
  const mse = p.map((value, i) => (value - (i === target ? 1 : 0)) ** 2).reduce((a, b) => a + b) / words;
  near(mse, 0.1633, 1e-4);
  const perToken = [0.31, 0.62, 0.85].map(value => -Math.log(value));
  near(perToken.reduce((a, b) => a + b) / 3, 0.6039, 1e-4);

  const epsilon = 0.1;
  const smoothed = (probabilities, index) => -probabilities
    .map((value, i) => (i === index ? 1 - epsilon + epsilon / words : epsilon / words) * Math.log(value))
    .reduce((a, b) => a + b);
  near(smoothed([0.99, 0.005, 0.003, 0.002], 0), 0.4423, 1e-4);
  near(smoothed([0.05, 0.9, 0.03, 0.02], 0), 2.9592, 1e-4);

  const activation = [2.0, 0.5, 1.2, 3.0];
  const mask = [1, 0, 1, 1];
  const dropped = activation.map((value, i) => (mask[i] ? value / 0.9 : 0));
  near(dropped[0], 2.2222, 1e-4);
  near(dropped[2], 1.3333, 1e-4);
  near(dropped[0] * 0.9, activation[0], 1e-9);
});

test('the basics article publishes these values and stays inside the section', async () => {
  const data = await loadContent(fileURLToPath(new URL('../', import.meta.url)));
  const article = articleOf(data, 'zh');
  assert(article, 'basics 未发布');
  for (const value of ['0.5847', '0.4239', '1.1562', '1.6875', '0.4640', '0.768', '0.1633', '0.604', '0.442', '2.959', '2.222', '0.0467', '11.39']) {
    assert(article.html.includes(value), `正文缺少 ${value}`);
  }
  assert(!article.text.includes('**'), '存在未渲染的 Markdown 强调');
  assert(!article.text.includes(']('), '存在未渲染的 Markdown 链接');
  assert.equal(article.headings.length, 18, '小节数量变化时请同步检查本节结构');
});
