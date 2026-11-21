// Synthetic teaching examples; no probabilities come from a deployed model.
export const sigmoid = x => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
export function meanNll(probabilities, mask = probabilities.map(() => 1)) {
  if (probabilities.length !== mask.length) throw new Error('Mask length mismatch');
  const selected = probabilities.filter((_, i) => mask[i]);
  if (!selected.length || selected.some(p => !(p > 0 && p <= 1))) throw new Error('Invalid active probabilities');
  return -selected.reduce((sum, p) => sum + Math.log(p), 0) / selected.length;
}
export function bitsPerByte(loss, tokens, bytes) {
  if (!(tokens > 0 && bytes > 0)) throw new Error('Positive token and byte counts required');
  return loss * tokens / bytes / Math.log(2);
}
export function matmul(a, b) {
  if (!a.length || !b.length || a.some(row => row.length !== b.length) || b.some(row => row.length !== b[0].length)) throw new Error('Matrix shape mismatch');
  return a.map(row => b[0].map((_, j) => row.reduce((sum, x, k) => sum + x * b[k][j], 0)));
}
export const rewardPair = (winner, loser) => ({ probability: sigmoid(winner - loser), loss: Math.log1p(Math.exp(-(winner - loser))) });
export function dpoPair(policy, reference, beta = 0.5) {
  if ([...policy, ...reference].some(p => !(p > 0 && p <= 1))) throw new Error('Invalid response probability');
  const margin = beta * (Math.log(policy[0] / reference[0]) - Math.log(policy[1] / reference[1]));
  return { margin, loss: Math.log1p(Math.exp(-margin)) };
}
export function groupAdvantages(rewards) {
  const mean = rewards.reduce((a,b) => a+b,0) / rewards.length;
  const std = Math.sqrt(rewards.reduce((sum,r) => sum+(r-mean)**2,0) / rewards.length);
  return { mean, std, values: rewards.map(r => std ? (r-mean)/std : 0) };
}
export function klDivergence(p, q) {
  if (p.length !== q.length || p.some(v => v < 0) || q.some(v => v <= 0)) throw new Error('Invalid KL distributions');
  return p.reduce((sum, v, i) => sum + (v ? v*Math.log(v/q[i]) : 0),0);
}
export function softCrossEntropy(teacher, student) {
  return -teacher.reduce((sum,p,i) => sum+(p ? p*Math.log(student[i]) : 0),0);
}
export function bestFitDecreasing(lengths, capacity) {
  if (lengths.some(n => !Number.isInteger(n) || n <= 0 || n > capacity)) throw new Error('Invalid document length');
  const bins=[];
  for (const length of [...lengths].sort((a,b)=>b-a)) {
    let index=-1, remaining=Infinity;
    bins.forEach((bin,i)=>{const free=capacity-bin.reduce((a,b)=>a+b,0)-length;if(free>=0&&free<remaining){index=i;remaining=free;}});
    if(index<0)bins.push([length]);else bins[index].push(length);
  }
  return bins;
}
export const lossExample = { tokens: ['解释','熊','的年龄','5','岁','[EOS]'], probabilities: [.1,.2,.25,.5,.8,.9], responseMask: [0,0,0,1,1,1] };
const f = x => x.toFixed(4);
// 三个实验的面板文案；中文保持既有输出，英文为对应翻译。
const labStrings = {
  zh: {
    lossTokens: ['解释','熊','的年龄','5','岁','[EOS]'],
    lossTitle: '实验：同样的前向概率，哪些位置参与损失？',
    lossOptions: ['全文下一词损失', '只算回答损失'],
    lossHead: ['目标 token', '给定前缀的目标概率', 'loss mask', '本项 −ln p'],
    excluded: '不参与平均',
    lossNote: (count, value) => `活动位置 ${count} 个，平均损失 <strong>${value}</strong>。概率来自同一次假设前向；改变 loss mask 不会让提示从注意力输入中消失。`,
    gapTitle: '实验：奖励分差怎样影响成对偏好概率？',
    gapOptions: ['分差 −1', '分差 0', '分差 2'],
    gapNote: value => `若人类标签是 w 优于 l，成对负对数损失 <strong>${value}</strong>。分差越符合这个标签，损失越低；绝对分数平移不改变概率。`,
    groupTitle: '实验：同一道题，一组回答的相对表现',
    groupOptions: ['有对有错', '全部正确', '全部错误'],
    groupHead: ['回答', '可验证奖励', '标准化组内优势（教学约定）'],
    answer: i => `回答 ${i + 1}`,
    groupNote: (mean, std, hasStd) => `组均值 ${mean}，总体标准差 ${std}。${hasStd ? '正确回答相对更好，错误回答相对更差。' : '组内没有差异，本演示将优势置 0，不能靠组内比较分出优劣。'}真实算法还包括概率比、裁剪与可能的 KL 项；这不是完整 GRPO 更新公式。`,
  },
  en: {
    lossTokens: ['explain',"bear","'s age",'5','years','[EOS]'],
    lossTitle: 'Lab: with identical forward probabilities, which positions enter the loss?',
    lossOptions: ['next-token loss over everything', 'answer tokens only'],
    lossHead: ['target token', 'probability given the prefix', 'loss mask', 'term −ln p'],
    excluded: 'not averaged',
    lossNote: (count, value) => `${count} active positions, mean loss <strong>${value}</strong>. The probabilities come from one hypothetical forward pass; changing the loss mask does not remove the prompt from the attention input.`,
    gapTitle: 'Lab: how does a reward gap change the pairwise preference probability?',
    gapOptions: ['gap −1', 'gap 0', 'gap 2'],
    gapNote: value => `If the human label says w is better than l, the pairwise negative log-loss is <strong>${value}</strong>. The better the gap matches the label, the lower the loss; shifting both scores leaves the probability unchanged.`,
    groupTitle: 'Lab: one problem, the relative performance of a group of answers',
    groupOptions: ['some right, some wrong', 'all correct', 'all wrong'],
    groupHead: ['answer', 'verifiable reward', 'standardised within-group advantage (teaching convention)'],
    answer: i => `answer ${i + 1}`,
    groupNote: (mean, std, hasStd) => `group mean ${mean}, population standard deviation ${std}. ${hasStd ? 'Correct answers rank relatively better and wrong ones relatively worse.' : 'There is no variation inside the group, so this demo sets the advantage to 0; within-group comparison cannot separate them.'} A real algorithm also includes probability ratios, clipping and possibly a KL term; this is not the full GRPO update.`,
  },
};

function lab(name, labels, panels, selected = 0) {
  return `<div class="l3-lab"><p class="l3-lab-title">${labels.title}</p>${labels.options.map((_,i)=>`<input class="l3-radio" type="radio" name="${name}" id="${name}-${i}" ${i===selected?'checked':''}>`).join('')}<div class="l3-choices">${labels.options.map((label,i)=>`<label for="${name}-${i}">${label}</label>`).join('')}</div>${panels.map((html,i)=>`<div class="l3-panel ${name}-panel-${i}">${html}</div>`).join('')}</div>`;
}
export function renderLecture3Lab(name, lang = 'zh') {
  const S = labStrings[lang] ?? labStrings.zh;
  if (name==='loss-mask') {
    const {probabilities,responseMask}=lossExample;
    const tokens=S.lossTokens;
    return lab('loss-mask',{title:S.lossTitle,options:S.lossOptions},[probabilities.map(()=>1),responseMask].map(mask=>`<table><thead><tr><th>${S.lossHead[0]}</th><th>${S.lossHead[1]}</th><th>${S.lossHead[2]}</th><th>${S.lossHead[3]}</th></tr></thead><tbody>${tokens.map((token,i)=>`<tr><th>${token}</th><td>${probabilities[i]}</td><td>${mask[i]}</td><td>${mask[i]?f(-Math.log(probabilities[i])):S.excluded}</td></tr>`).join('')}</tbody></table><p>${S.lossNote(mask.reduce((a,b)=>a+b,0), f(meanNll(probabilities,mask)))}</p>`),1);
  }
  if (name==='preference-gap') {
    return lab('preference-gap',{title:S.gapTitle,options:S.gapOptions},[-1,0,2].map(gap=>{const r=rewardPair(gap,0);return `<div class="flow"><span class="chip">r_w−r_l = ${gap}</span><span class="arrow">→ sigmoid →</span><span class="chip">P(w≻l) = ${f(r.probability)}</span></div><p>${S.gapNote(f(r.loss))}</p>`;}),1);
  }
  if (name==='group-advantage') {
    return lab('group-advantage',{title:S.groupTitle,options:S.groupOptions},[[1,1,0,0],[1,1,1,1],[0,0,0,0]].map(rewards=>{
      const a=groupAdvantages(rewards);
      return `<table><thead><tr><th>${S.groupHead[0]}</th><th>${S.groupHead[1]}</th><th>${S.groupHead[2]}</th></tr></thead><tbody>${rewards.map((r,i)=>`<tr><th>${S.answer(i)}</th><td>${r}</td><td>${f(a.values[i])}</td></tr>`).join('')}</tbody></table><p>${S.groupNote(f(a.mean), f(a.std), Boolean(a.std))}</p>`;
    }));
  }
  throw new Error(`Unknown lecture 3 lab: ${name}`);
}
