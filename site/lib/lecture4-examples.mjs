// Exact finite teaching examples; these are not results of training a real LLM.
export const sigmoid = x => 1 / (1 + Math.exp(-x));
export function bernoulliGradient(theta, rewards=[1,0], baseline=0) {
  const p=sigmoid(theta);
  const samples=[(rewards[0]-baseline)*(1-p),(rewards[1]-baseline)*(-p)];
  const mean=p*samples[0]+(1-p)*samples[1];
  const variance=p*(samples[0]-mean)**2+(1-p)*(samples[1]-mean)**2;
  return {p,samples,mean,variance};
}
export function importanceExpectation(oldPolicy,currentPolicy,rewards) {
  if(oldPolicy.length!==currentPolicy.length||rewards.length!==oldPolicy.length)throw new Error('Distribution length mismatch');
  if(oldPolicy.some((p,i)=>p<=0&&currentPolicy[i]>0))throw new Error('Old policy does not cover current support');
  return oldPolicy.reduce((sum,p,i)=>sum+(p? p*(currentPolicy[i]/p)*rewards[i]:0),0);
}
export function clippedSurrogate(ratio,advantage,epsilon=.2) {
  const clipped=Math.max(1-epsilon,Math.min(1+epsilon,ratio));
  return {raw:ratio*advantage,clipped:clipped*advantage,value:Math.min(ratio*advantage,clipped*advantage)};
}
export function kl(p,q) {
  if(p.length!==q.length)throw new Error('KL shape mismatch');
  return p.reduce((sum,v,i)=>sum+(v===0?0:q[i]===0?Infinity:v*Math.log(v/q[i])),0);
}
export const nonnegativeKlSample = (studentProbability,teacherProbability) => {
  const ratio=teacherProbability/studentProbability;
  return ratio-1-Math.log(ratio);
};
export function normalizationWeights(lengths) {
  return {sequence:lengths.map(n=>1/(lengths.length*n)),token:lengths.map(()=>1/lengths.reduce((a,b)=>a+b,0))};
}
export function gae(rewards,values,gamma=1,lambda=1) {
  if(values.length!==rewards.length+1)throw new Error('GAE needs terminal value');
  let carry=0;
  const output=Array(rewards.length);
  for(let t=rewards.length-1;t>=0;t--){carry=rewards[t]+gamma*values[t+1]-values[t]+gamma*lambda*carry;output[t]=carry;}
  return output;
}
const f=n=>n.toFixed(4);
// 四个实验的面板文案；中文保持既有输出，英文为对应翻译。
const labStrings = {
 zh: {
    baselineTitle: '实验：101与100的奖励，减去基线后梯度怎样变化？',
    baselineOptions: ['不减基线', '基线 b=100.5'],
    baselineHead: ['采样结果', '概率', 'R−b', '∂lnπ/∂θ', '单样本梯度估计'],
    good: '好回答', bad: '差回答',
    baselineNote: (mean, variance) => `梯度估计期望 <strong>${mean}</strong>，方差 <strong>${variance}</strong>。本例在θ=0处，这个基线恰好消掉方差；不代表所有任务都能找到零方差基线。`,
    ppoTitle: '实验：同样的比率，优势正负决定裁剪在哪边',
    ppoOptions: ['A=+1', 'A=−1'],
    ppoHead: ['ρ', 'ρA', 'clip(ρ)A', 'min，两者较小值'],
    ppoPositive: 'A>0：ρ超过1.2后，该样本的裁剪项不再奖励继续上推。ρ过低时仍有纠正方向的梯度。',
    ppoNegative: 'A<0：ρ低于0.8后，该样本项不再奖励继续下压。ρ过高时不会替错误方向截断惩罚。',
    ppoNote: '这里是最大化目标，不能把min换成max，也不等于把实际概率硬锁在区间内。',
    lengthTitle: '实验：两条回答长度2与6，每个token拿到多大权重？',
    lengthOptions: ['逐序列平均', '全批token平均'],
    lengthHead: ['回答', '长度', '每token外部系数', '该回答总系数'],
    lengthSequence: '每条回答总权重相同，但短回答中单token权重较大。',
    lengthToken: '每token系数相同，因此长回答累积的总权重更大。',
    lengthNote: '只改平均方式，就改变了样本与token之间的权重；不等于自动修复所有长度偏差。',
    klTitle: '实验：教师支持两端、反对中间时，学生放错概率会怎样？',
    klOptions: ['匹配教师', '偏向一个模式', '把质量放到低概率区域'],
    klHead: ['候选', '教师T', '学生S', 'Sᵢ ln(Sᵢ/Tᵢ)'],
    klCandidates: ['模式A', '不合理续写', '模式B'],
    klNote: (forward, reverse) => `KL(S∥T)=<strong>${forward}</strong>，KL(T∥S)=<strong>${reverse}</strong>。单项可为负，完整KL才非负；“mode seeking”是受约束拟合中的倾向，不是任何参数空间下的定理。`,
  },
  en: {
    baselineTitle: 'Lab: rewards of 101 and 100 — how does subtracting a baseline change the gradient?',
    baselineOptions: ['no baseline', 'baseline b=100.5'],
    baselineHead: ['sample', 'probability', 'R−b', '∂lnπ/∂θ', 'single-sample gradient estimate'],
    good: 'good answer', bad: 'bad answer',
    baselineNote: (mean, variance) => `Gradient estimate mean <strong>${mean}</strong>, variance <strong>${variance}</strong>. At θ=0 in this example the baseline happens to remove the variance; that does not mean every task admits a zero-variance baseline.`,
    ppoTitle: 'Lab: same ratio — the sign of the advantage decides which side gets clipped',
    ppoOptions: ['A=+1', 'A=−1'],
    ppoHead: ['ρ', 'ρA', 'clip(ρ)A', 'min (the smaller value)'],
    ppoPositive: 'A>0: once ρ exceeds 1.2 the clipped term stops rewarding further increases. When ρ is too low there is still a gradient correcting the direction.',
    ppoNegative: 'A<0: once ρ drops below 0.8 the term stops rewarding further decreases. When ρ is too high it does not truncate the penalty for a wrong direction.',
    ppoNote: 'This is a maximisation objective: min cannot be replaced by max, and it is not the same as hard-clamping the actual probability into the interval.',
    lengthTitle: 'Lab: answers of length 2 and 6 — how much weight does each token get?',
    lengthOptions: ['average per sequence', 'average over all tokens in the batch'],
    lengthHead: ['answer', 'length', 'external per-token coefficient', 'total coefficient for this answer'],
    lengthSequence: 'Every answer has the same total weight, but tokens in the short answer carry a larger individual weight.',
    lengthToken: 'Every token has the same coefficient, so the longer answer accumulates more total weight.',
    lengthNote: 'Changing only the averaging scheme already changes the balance between samples and tokens; it does not automatically fix every length bias.',
    klTitle: 'Lab: the teacher supports both modes and rejects the middle — what happens when the student puts mass in the wrong place?',
    klOptions: ['match the teacher', 'favour one mode', 'put mass in the low-probability region'],
    klHead: ['candidate', 'teacher T', 'student S', 'Sᵢ ln(Sᵢ/Tᵢ)'],
    klCandidates: ['mode A', 'implausible continuation', 'mode B'],
    klNote: (forward, reverse) => `KL(S∥T)=<strong>${forward}</strong>, KL(T∥S)=<strong>${reverse}</strong>. Individual terms can be negative; only the complete KL is non-negative. “Mode seeking” is a tendency in constrained fitting, not a theorem for every parameter space.`,
  },
};

function lab(name,title,options,panels,checked=0) {
 return `<div class="l4-lab"><p class="l4-lab-title">${title}</p>${options.map((_,i)=>`<input class="l4-radio" type="radio" name="${name}" id="${name}-${i}" ${i===checked?'checked':''}>`).join('')}<div class="l4-choices">${options.map((label,i)=>`<label for="${name}-${i}">${label}</label>`).join('')}</div>${panels.map((html,i)=>`<div class="l4-panel ${name}-panel-${i}">${html}</div>`).join('')}</div>`;
}
export function renderLecture4Lab(name, lang = 'zh') {
 const S = labStrings[lang] ?? labStrings.zh;
 if(name==='baseline')return lab('baseline',S.baselineTitle,S.baselineOptions,[0,100.5].map(b=>{
  const r=bernoulliGradient(0,[101,100],b);
  return `<table><thead><tr><th>${S.baselineHead[0]}</th><th>${S.baselineHead[1]}</th><th>${S.baselineHead[2]}</th><th>${S.baselineHead[3]}</th><th>${S.baselineHead[4]}</th></tr></thead><tbody><tr><th>${S.good}</th><td>0.5</td><td>${f(101-b)}</td><td>0.5</td><td>${f(r.samples[0])}</td></tr><tr><th>${S.bad}</th><td>0.5</td><td>${f(100-b)}</td><td>−0.5</td><td>${f(r.samples[1])}</td></tr></tbody></table><p>${S.baselineNote(f(r.mean), f(r.variance))}</p>`;
 }));
 if(name==='ppo-clip')return lab('ppo-clip',S.ppoTitle,S.ppoOptions,[1,-1].map(a=>`<table><thead><tr><th>${S.ppoHead[0]}</th><th>${S.ppoHead[1]}</th><th>${S.ppoHead[2]}</th><th>${S.ppoHead[3]}</th></tr></thead><tbody>${[.5,.8,1,1.2,1.5].map(r=>{const s=clippedSurrogate(r,a);return `<tr><th>${r.toFixed(1)}</th><td>${f(s.raw)}</td><td>${f(s.clipped)}</td><td>${f(s.value)}</td></tr>`;}).join('')}</tbody></table><p>${a>0?S.ppoPositive:S.ppoNegative}${S.ppoNote}</p>`));
 if(name==='length-weight') {
  const lengths=[2,6],w=normalizationWeights(lengths);
  return lab('length-weight',S.lengthTitle,S.lengthOptions,['sequence','token'].map(key=>`<table><thead><tr><th>${S.lengthHead[0]}</th><th>${S.lengthHead[1]}</th><th>${S.lengthHead[2]}</th><th>${S.lengthHead[3]}</th></tr></thead><tbody>${lengths.map((n,i)=>`<tr><th>${i+1}</th><td>${n}</td><td>${f(w[key][i])}</td><td>${f(n*w[key][i])}</td></tr>`).join('')}</tbody></table><p>${key==='sequence'?S.lengthSequence:S.lengthToken}${S.lengthNote}</p>`));
 }
 if(name==='kl-direction') {
  const teacher=[.49,.02,.49];
  const students=[[.49,.02,.49],[.89,.02,.09],[.3,.4,.3]];
  return lab('kl-direction',S.klTitle,S.klOptions,students.map(s=>`<table><thead><tr><th>${S.klHead[0]}</th><th>${S.klHead[1]}</th><th>${S.klHead[2]}</th><th>${S.klHead[3]}</th></tr></thead><tbody>${s.map((v,i)=>`<tr><th>${S.klCandidates[i]}</th><td>${teacher[i]}</td><td>${v}</td><td>${f(v*Math.log(v/teacher[i]))}</td></tr>`).join('')}</tbody></table><p>${S.klNote(f(kl(s,teacher)), f(kl(teacher,s)))}</p>`));
 }
 throw new Error(`Unknown lecture 4 lab: ${name}`);
}
