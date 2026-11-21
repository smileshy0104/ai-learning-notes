// Teaching data, independent of any real model output.
export const softmax = scores => {
  const max = Math.max(...scores);
  const exps = scores.map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sum);
};
export const temperatureScores = [2, 1, 0, -1];
export const temperatures = [0.5, 1, 2];
export const temperatureDistribution = t => {
  if (!(t > 0)) throw new Error('Temperature must be positive');
  return softmax(temperatureScores.map(x => x / t));
};
export const candidates = [0.40, 0.25, 0.20, 0.10, 0.05];
export function nucleus(probabilities, threshold) {
  const selected = [];
  let mass = 0;
  for (const [index, p] of [...probabilities.entries()].sort((a,b) => b[1]-a[1])) {
    selected.push(index); mass += p;
    if (mass >= threshold - 1e-12) break;
  }
  return { selected, mass, probabilities: selected.map(i => probabilities[i] / mass) };
}
export function rotate(vector, angle) {
  const [x,y] = vector;
  return [Math.cos(angle)*x-Math.sin(angle)*y,Math.sin(angle)*x+Math.cos(angle)*y];
}
export const dot = (a,b) => a.reduce((sum,x,i) => sum+x*b[i],0);
export const kvBytes = ({batch=1,length=4096,layers=32,heads=8,dimension=128,bytes=2}={}) => 2*batch*length*layers*heads*dimension*bytes;
export const auxiliaryLoss = (fractions,probabilities,alpha=0.01) => alpha*fractions.length*dot(fractions,probabilities);
export const rmsNorm = vector => {
  const scale = Math.sqrt(vector.reduce((sum,x)=>sum+x*x,0)/vector.length);
  return vector.map(x=>x/scale);
};
const percent = x => (x*100).toFixed(2)+'%';
// 实验面板文案；中文必须与既有输出逐字一致，英文为对应翻译。
const labStrings = {
  zh: {
    temperatureTitle: '实验：同样的 logits [2,1,0,−1]，只改变温度',
    candidates: ['阅读', '睡觉', '奔跑', '游泳'],
    temperatureHead: ['候选', 'logit / T', '概率'],
    sharper: '分布更尖，但仍不等于确定性取最大值。',
    plain: '这是常规 softmax。',
    flatter: '分布更平，更容易选到原本较低分的候选。',
    sumNote: (t, sum) => `T=${t}，概率和为 ${sum}。`,
    routingTitle: '实验：Dense、Top-1 与 Top-2 路由',
    routingOptions: ['Dense：四位专家', 'Top-1', 'Top-2'],
    routingHead: ['专家', '原始路由概率', '本例实际权重', '输出'],
    notExecuted: '（不执行）',
    routingNote: (value, count) => `输出约为 <strong>[${value}]</strong>，执行 ${count} 位专家。本例对被选权重重新归一化；真实实现的缩放约定可能不同。`,
    windowTitle: '实验：每层只能读自己和左侧 2 个位置',
    windowOption: n => `${n} 层后`,
    position: i => `位置 ${i + 1}`,
    windowNote: (n, reach) => `第 6 个位置经过 ${n} 层，理论上可接收到最近 ${reach} 个输入位置的信息；绿色表示可能有信息路径，灰色表示还没有。可达并不保证信息被完整保留。`,
  },
  en: {
    temperatureTitle: 'Lab: same logits [2,1,0,−1], only the temperature changes',
    candidates: ['reading', 'sleeping', 'running', 'swimming'],
    temperatureHead: ['candidate', 'logit / T', 'probability'],
    sharper: 'Sharper, but still not the same as always taking the argmax.',
    plain: 'This is plain softmax.',
    flatter: 'Flatter: lower-scoring candidates become more likely.',
    sumNote: (t, sum) => `T=${t}; the probabilities sum to ${sum}.`,
    routingTitle: 'Lab: Dense, Top-1 and Top-2 routing',
    routingOptions: ['Dense: all four experts', 'Top-1', 'Top-2'],
    routingHead: ['expert', 'raw routing probability', 'weight here', 'output'],
    notExecuted: ' (not executed)',
    routingNote: (value, count) => `Output ≈ <strong>[${value}]</strong>, running ${count} experts. This example renormalises the selected weights; real implementations may scale them differently.`,
    windowTitle: 'Lab: each layer reads only itself and 2 positions to its left',
    windowOption: n => `after ${n} layers`,
    position: i => `pos ${i + 1}`,
    windowNote: (n, reach) => `After ${n} layers the 6th position can in theory reach the nearest ${reach} input positions; green marks a possible information path, grey means not yet. Reachability does not guarantee that information survives intact.`,
  },
};


export function renderLecture2Lab(name, lang = 'zh') {
  const S = labStrings[lang] ?? labStrings.zh;
  if (name === 'temperature') {
    return `<div class="l2-lab"><p class="l2-lab-title">${S.temperatureTitle}</p>${temperatures.map((t,i)=>`<input class="l2-radio" type="radio" name="temperature" id="temp-${i}" ${i===1?'checked':''}>`).join('')}<div class="l2-choices">${temperatures.map((t,i)=>`<label for="temp-${i}">T = ${t}</label>`).join('')}</div>${temperatures.map((t,i)=>{const p=temperatureDistribution(t);return `<div class="l2-panel temp-panel-${i}"><table><thead><tr><th>${S.temperatureHead[0]}</th><th>${S.temperatureHead[1]}</th><th>${S.temperatureHead[2]}</th></tr></thead><tbody>${p.map((v,j)=>`<tr><th>${S.candidates[j]}</th><td>${(temperatureScores[j]/t).toFixed(2)}</td><td>${percent(v)}</td></tr>`).join('')}</tbody></table><div class="l2-bars">${p.map((v,j)=>`<div class="l2-bar"><span>${S.candidates[j]}</span><div><i style="width:${100*v}%"></i></div><span>${percent(v)}</span></div>`).join('')}</div><p>${S.sumNote(t, p.reduce((a,b)=>a+b,0).toFixed(3))}${t<1?S.sharper:t===1?S.plain:S.flatter}</p></div>`;}).join('')}</div>`;
  }
  if (name === 'routing') {
    const probs=[0.55,0.25,0.15,0.05];
    const vectors=[[2,0],[0,4],[1,1],[-1,2]];
    return `<div class="l2-lab"><p class="l2-lab-title">${S.routingTitle}</p>${[0,1,2].map(i=>`<input class="l2-radio" type="radio" name="routing" id="route-${i}" ${i===2?'checked':''}>`).join('')}<div class="l2-choices">${S.routingOptions.map((label,i)=>`<label for="route-${i}">${label}</label>`).join('')}</div>${[4,1,2].map((count,i)=>{
      const mass=probs.slice(0,count).reduce((a,b)=>a+b,0);
      const weights=probs.map((p,j)=>j<count?p/mass:0);
      const result=[0,1].map(d=>weights.reduce((sum,w,j)=>sum+w*vectors[j][d],0));
      return `<div class="l2-panel route-panel-${i}"><table><thead><tr><th>${S.routingHead[0]}</th><th>${S.routingHead[1]}</th><th>${S.routingHead[2]}</th><th>${S.routingHead[3]}</th></tr></thead><tbody>${probs.map((p,j)=>`<tr><th>E${j+1}</th><td>${percent(p)}</td><td>${percent(weights[j])}${j>=count?S.notExecuted:''}</td><td>[${vectors[j]}]</td></tr>`).join('')}</tbody></table><p>${S.routingNote(result.map(x=>x.toFixed(4)).join(', '), count)}</p></div>`;
    }).join('')}</div>`;
  }
  if (name === 'window') {
    const labels=['A','cute','teddy','bear','is','reading'];
    return `<div class="l2-lab"><p class="l2-lab-title">${S.windowTitle}</p>${[1,2,3].map(n=>`<input class="l2-radio" type="radio" name="window" id="window-${n}" ${n===1?'checked':''}>`).join('')}<div class="l2-choices">${[1,2,3].map(n=>`<label for="window-${n}">${S.windowOption(n)}</label>`).join('')}</div>${[1,2,3].map(n=>`<div class="l2-panel window-panel-${n}"><div class="l2-tokens">${labels.map((t,i)=>`<span class="${5-i<=2*n?'reachable':'outside'}">${t}<small>${S.position(i)}</small></span>`).join('')}</div><p>${S.windowNote(n, Math.min(6,2*n+1))}</p></div>`).join('')}</div>`;
  }
  throw new Error(`Unknown lecture 2 lab: ${name}`);
}
