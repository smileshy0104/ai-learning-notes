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

export function renderLecture2Lab(name) {
  if (name === 'temperature') {
    return `<div class="l2-lab"><p class="l2-lab-title">实验：同样的 logits [2,1,0,−1]，只改变温度</p>${temperatures.map((t,i)=>`<input class="l2-radio" type="radio" name="temperature" id="temp-${i}" ${i===1?'checked':''}>`).join('')}<div class="l2-choices">${temperatures.map((t,i)=>`<label for="temp-${i}">T = ${t}</label>`).join('')}</div>${temperatures.map((t,i)=>{const p=temperatureDistribution(t);return `<div class="l2-panel temp-panel-${i}"><table><thead><tr><th>候选</th><th>logit / T</th><th>概率</th></tr></thead><tbody>${p.map((v,j)=>`<tr><th>${['阅读','睡觉','奔跑','游泳'][j]}</th><td>${(temperatureScores[j]/t).toFixed(2)}</td><td>${percent(v)}</td></tr>`).join('')}</tbody></table><div class="l2-bars">${p.map((v,j)=>`<div class="l2-bar"><span>${['阅读','睡觉','奔跑','游泳'][j]}</span><div><i style="width:${100*v}%"></i></div><span>${percent(v)}</span></div>`).join('')}</div><p>T=${t}，概率和为 ${p.reduce((a,b)=>a+b,0).toFixed(3)}。${t<1?'分布更尖，但仍不等于确定性取最大值。':t===1?'这是常规 softmax。':'分布更平，更容易选到原本较低分的候选。'}</p></div>`;}).join('')}</div>`;
  }
  if (name === 'routing') {
    const probs=[0.55,0.25,0.15,0.05];
    const vectors=[[2,0],[0,4],[1,1],[-1,2]];
    return `<div class="l2-lab"><p class="l2-lab-title">实验：Dense、Top-1 与 Top-2 路由</p>${[0,1,2].map(i=>`<input class="l2-radio" type="radio" name="routing" id="route-${i}" ${i===2?'checked':''}>`).join('')}<div class="l2-choices"><label for="route-0">Dense：四位专家</label><label for="route-1">Top-1</label><label for="route-2">Top-2</label></div>${[4,1,2].map((count,i)=>{
      const mass=probs.slice(0,count).reduce((a,b)=>a+b,0);
      const weights=probs.map((p,j)=>j<count?p/mass:0);
      const result=[0,1].map(d=>weights.reduce((sum,w,j)=>sum+w*vectors[j][d],0));
      return `<div class="l2-panel route-panel-${i}"><table><thead><tr><th>专家</th><th>原始路由概率</th><th>本例实际权重</th><th>输出</th></tr></thead><tbody>${probs.map((p,j)=>`<tr><th>E${j+1}</th><td>${percent(p)}</td><td>${percent(weights[j])}${j>=count?'（不执行）':''}</td><td>[${vectors[j]}]</td></tr>`).join('')}</tbody></table><p>输出约为 <strong>[${result.map(x=>x.toFixed(4)).join(', ')}]</strong>，执行 ${count} 位专家。本例对被选权重重新归一化；真实实现的缩放约定可能不同。</p></div>`;
    }).join('')}</div>`;
  }
  if (name === 'window') {
    const labels=['A','cute','teddy','bear','is','reading'];
    return `<div class="l2-lab"><p class="l2-lab-title">实验：每层只能读自己和左侧 2 个位置</p>${[1,2,3].map(n=>`<input class="l2-radio" type="radio" name="window" id="window-${n}" ${n===1?'checked':''}>`).join('')}<div class="l2-choices">${[1,2,3].map(n=>`<label for="window-${n}">${n} 层后</label>`).join('')}</div>${[1,2,3].map(n=>`<div class="l2-panel window-panel-${n}"><div class="l2-tokens">${labels.map((t,i)=>`<span class="${5-i<=2*n?'reachable':'outside'}">${t}<small>位置 ${i+1}</small></span>`).join('')}</div><p>第 6 个位置经过 ${n} 层，理论上可接收到最近 ${Math.min(6,2*n+1)} 个输入位置的信息；绿色表示可能有信息路径，灰色表示还没有。可达并不保证信息被完整保留。</p></div>`).join('')}</div>`;
  }
  throw new Error(`Unknown lecture 2 lab: ${name}`);
}
