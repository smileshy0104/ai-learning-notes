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
  const article = data.articles.find(a => a.collection === 'cme295' && a.slug === 'basics');
  assert(article, 'basics 未发布');
  for (const value of ['0.5847', '0.4239', '1.1562', '1.6875', '0.4640', '0.768', '0.1633', '0.604', '0.442', '2.959', '2.222', '0.0467', '11.39']) {
    assert(article.html.includes(value), `正文缺少 ${value}`);
  }
  assert(!article.text.includes('**'), '存在未渲染的 Markdown 强调');
  assert(!article.text.includes(']('), '存在未渲染的 Markdown 链接');
  assert.equal(article.headings.length, 18, '小节数量变化时请同步检查本节结构');
});
