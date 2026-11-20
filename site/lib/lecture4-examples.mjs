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
function lab(name,title,options,panels,checked=0) {
 return `<div class="l4-lab"><p class="l4-lab-title">${title}</p>${options.map((_,i)=>`<input class="l4-radio" type="radio" name="${name}" id="${name}-${i}" ${i===checked?'checked':''}>`).join('')}<div class="l4-choices">${options.map((label,i)=>`<label for="${name}-${i}">${label}</label>`).join('')}</div>${panels.map((html,i)=>`<div class="l4-panel ${name}-panel-${i}">${html}</div>`).join('')}</div>`;
}
export function renderLecture4Lab(name) {
 if(name==='baseline')return lab('baseline','实验：101与100的奖励，减去基线后梯度怎样变化？',['不减基线','基线 b=100.5'],[0,100.5].map(b=>{
  const r=bernoulliGradient(0,[101,100],b);
  return `<table><thead><tr><th>采样结果</th><th>概率</th><th>R−b</th><th>∂lnπ/∂θ</th><th>单样本梯度估计</th></tr></thead><tbody><tr><th>好回答</th><td>0.5</td><td>${f(101-b)}</td><td>0.5</td><td>${f(r.samples[0])}</td></tr><tr><th>差回答</th><td>0.5</td><td>${f(100-b)}</td><td>−0.5</td><td>${f(r.samples[1])}</td></tr></tbody></table><p>梯度估计期望 <strong>${f(r.mean)}</strong>，方差 <strong>${f(r.variance)}</strong>。本例在θ=0处，这个基线恰好消掉方差；不代表所有任务都能找到零方差基线。</p>`;
 }));
 if(name==='ppo-clip')return lab('ppo-clip','实验：同样的比率，优势正负决定裁剪在哪边',['A=+1','A=−1'],[1,-1].map(a=>`<table><thead><tr><th>ρ</th><th>ρA</th><th>clip(ρ)A</th><th>min，两者较小值</th></tr></thead><tbody>${[.5,.8,1,1.2,1.5].map(r=>{const s=clippedSurrogate(r,a);return `<tr><th>${r.toFixed(1)}</th><td>${f(s.raw)}</td><td>${f(s.clipped)}</td><td>${f(s.value)}</td></tr>`;}).join('')}</tbody></table><p>${a>0?'A>0：ρ超过1.2后，该样本的裁剪项不再奖励继续上推。ρ过低时仍有纠正方向的梯度。':'A<0：ρ低于0.8后，该样本项不再奖励继续下压。ρ过高时不会替错误方向截断惩罚。'}这里是最大化目标，不能把min换成max，也不等于把实际概率硬锁在区间内。</p>`));
 if(name==='length-weight') {
  const lengths=[2,6],w=normalizationWeights(lengths);
  return lab('length-weight','实验：两条回答长度2与6，每个token拿到多大权重？',['逐序列平均','全批token平均'],['sequence','token'].map(key=>`<table><thead><tr><th>回答</th><th>长度</th><th>每token外部系数</th><th>该回答总系数</th></tr></thead><tbody>${lengths.map((n,i)=>`<tr><th>${i+1}</th><td>${n}</td><td>${f(w[key][i])}</td><td>${f(n*w[key][i])}</td></tr>`).join('')}</tbody></table><p>${key==='sequence'?'每条回答总权重相同，但短回答中单token权重较大。':'每token系数相同，因此长回答累积的总权重更大。'}只改平均方式，就改变了样本与token之间的权重；不等于自动修复所有长度偏差。</p>`));
 }
 if(name==='kl-direction') {
  const teacher=[.49,.02,.49];
  const students=[[.49,.02,.49],[.89,.02,.09],[.3,.4,.3]];
  return lab('kl-direction','实验：教师支持两端、反对中间时，学生放错概率会怎样？',['匹配教师','偏向一个模式','把质量放到低概率区域'],students.map(s=>`<table><thead><tr><th>候选</th><th>教师T</th><th>学生S</th><th>Sᵢ ln(Sᵢ/Tᵢ)</th></tr></thead><tbody>${s.map((v,i)=>`<tr><th>${['模式A','不合理续写','模式B'][i]}</th><td>${teacher[i]}</td><td>${v}</td><td>${f(v*Math.log(v/teacher[i]))}</td></tr>`).join('')}</tbody></table><p>KL(S∥T)=<strong>${f(kl(s,teacher))}</strong>，KL(T∥S)=<strong>${f(kl(teacher,s))}</strong>。单项可为负，完整KL才非负；“mode seeking”是受约束拟合中的倾向，不是任何参数空间下的定理。</p>`));
 }
 throw new Error(`Unknown lecture 4 lab: ${name}`);
}
