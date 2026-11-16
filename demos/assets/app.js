'use strict';

// Keep default links usable when scripts are disabled.
const filterButtons = document.querySelectorAll('[data-filter]');
filterButtons.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let visible = 0;
  document.querySelectorAll('[data-topic]').forEach(card => {
    card.hidden = filter !== 'all' && card.dataset.topic !== filter;
    if (!card.hidden) visible += 1;
  });
  const empty = document.getElementById('filter-empty');
  if (empty) empty.hidden = visible > 0;
}));

const searchEntries = [
  { terms: ['token', 'embedding', '表示', '向量', '词元', '词表'], target: '#representation' },
  { terms: ['attention', '注意力', 'qkv', 'softmax'], target: '#attention' },
  { terms: ['encoder', 'decoder', '编码', '解码', '架构'], target: '#architecture' },
  { terms: ['train', '训练', '推理', '梯度', '前向', '反向'], target: '#training' },
];
const searchForm = document.querySelector('[data-search-form]');
const searchInput = document.querySelector('[data-search-input]');
if (searchForm && searchInput) {
  const status = document.createElement('p');
  status.id = 'search-status';
  status.setAttribute('role', 'status');
  status.className = 'search-status';
  status.hidden = true;
  searchForm.append(status);
  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;
    const match = searchEntries.find(entry => entry.terms.some(term => query.includes(term)));
    if (match) {
      const section = document.querySelector(match.target);
      location.hash = match.target;
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
      status.textContent = '已定位到：' + section.querySelector('h2').textContent;
    } else {
      status.textContent = '示例站暂未收录此关键词，可试试“注意力”“词元”或“训练”。';
    }
    status.hidden = false;
  });
  searchInput.addEventListener('input', () => { status.hidden = true; });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === 'Escape') status.hidden = true;
  });
}

const lab = document.querySelector('#experiment');
if (lab) {
  const names = ['泰迪熊', '可爱', '阅读'];
  const keys = [[1, 0], [0, 1], [1, 1]];
  const values = [[1, 0], [0, 2], [1, 1]];
  const queries = { a: [1, 0], b: [2, -2], c: [0, 0], d: [2, 2] };
  const calculate = query => {
    const scores = keys.map(key => (query[0] * key[0] + query[1] * key[1]) / Math.sqrt(2));
    const max = Math.max(...scores);
    const exps = scores.map(score => Math.exp(score - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    const weights = exps.map(value => value / sum);
    const result = [0, 1].map(dimension => weights.reduce((total, w, i) => total + w * values[i][dimension], 0));
    return { weights, result };
  };
  const render = () => {
    const query = queries[lab.querySelector('input:checked').value];
    const { weights, result } = calculate(query);
    const bars = names.map((name, i) => {
      const row = document.createElement('div');
      row.className = 'lab-bar';
      const text = document.createElement('span');
      text.textContent = name;
      const track = document.createElement('div');
      track.className = 'lab-track';
      const fill = document.createElement('div');
      fill.className = 'lab-fill';
      fill.style.width = `${weights[i] * 100}%`;
      track.append(fill);
      const number = document.createElement('span');
      number.textContent = `${(weights[i] * 100).toFixed(1)}%`;
      row.append(text, track, number);
      return row;
    });
    lab.querySelector('[data-lab-bars]').replaceChildren(...bars);
    lab.querySelector('[data-lab-result]').textContent = '输出向量 ≈ [' + result.map(x => x.toFixed(3)).join(', ') + ']';
  };
  lab.querySelectorAll('input').forEach(input => input.addEventListener('change', render));
  render();
  lab.querySelector('.lab-presets').hidden = true;
  lab.querySelector('.dynamic-lab').hidden = false;
}

const nodes = {
  vectors: { title: '向量与矩阵', category: '基础数学 / FOUNDATION', description: '向量是一组数字，矩阵是一张数字表格。跟踪形状，能帮助你读懂神经网络里每一步在计算什么。', prerequisite: '前置：四则运算', href: 'basics.html' },
  embedding: { title: '词元表示', category: '输入表示 / REPRESENTATION', description: 'token ID 帮助查表；embedding 把离散符号映射到可学习向量，后续网络再结合上下文更新表示。', prerequisite: '前置：向量与矩阵、分词', href: 'docs.html#representation' },
  rnn: { title: '序列与上下文', category: '序列建模 / SEQUENCE', description: 'RNN 通过隐藏状态传递历史信息，LSTM 用门控改善长期信息保留。注意力进一步缩短位置之间的信息路径。', prerequisite: '前置：词元表示、网络训练', href: 'docs.html#context' },
  training: { title: '损失与梯度', category: '基础概念 / TRAINING', description: '损失衡量预测与目标的差异；反向传播计算梯度，优化器根据梯度更新参数。', prerequisite: '前置：函数、前向传播', href: 'basics.html#loss' },
  attention: { title: '自注意力', category: '模型架构 / CONCEPT', description: '一个位置怎样从其他位置读取信息？用 Q 与 K 匹配，按权重汇总 V，得到包含上下文的新表示。', prerequisite: '前置：词元表示、矩阵乘法', href: 'docs.html#attention' },
  ffn: { title: '位置 / FFN / 残差', category: '模型组件 / BUILDING BLOCKS', description: '位置机制提供顺序信息；FFN 对各位置进行非线性加工；残差为信息和梯度提供额外通路。', prerequisite: '前置：线性层、激活函数', href: 'docs.html#components' },
  transformer: { title: 'Transformer', category: '模型架构 / ARCHITECTURE', description: '把注意力、FFN、残差与归一化组合成层，再堆叠成编码器和解码器。模型结构与训练方式共同影响能力。', prerequisite: '前置：自注意力、位置编码、FFN', href: 'docs.html#architecture' },
  inference: { title: '推理与缓存', category: '后续专题 / INFERENCE', description: '自回归推理通常逐 token 进行。KV Cache 复用历史键和值，减少重复计算，同时占用额外显存。', prerequisite: '前置：因果注意力、逐 token 生成', href: 'docs.html#training' },
  agents: { title: '应用与 Agent', category: '后续专题 / APPLICATION', description: '模型提出下一步，外部系统执行工具并返回结果。工具、上下文和执行循环共同组成代理系统。', prerequisite: '前置：模型推理、工具接口', href: 'docs.html#agents' },
};
const detailTitle = document.querySelector('[data-map-title]');
if (detailTitle) {
  document.querySelectorAll('[data-node]').forEach(link => link.addEventListener('click', event => {
    const data = nodes[link.dataset.node];
    if (!data) return;
    event.preventDefault();
    document.querySelector('[data-map-category]').textContent = data.category;
    detailTitle.textContent = data.title;
    document.querySelector('[data-map-description]').textContent = data.description;
    document.querySelector('[data-map-prerequisites]').textContent = data.prerequisite;
    const target = document.querySelector('[data-map-link]');
    target.href = data.href;
    target.textContent = '阅读这个概念 →';
    document.querySelectorAll('[data-node]').forEach(item => item.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'true');
    if (window.matchMedia('(max-width:850px)').matches) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.querySelector('.map-detail').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    }
  }));
}
