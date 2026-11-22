// Finite synthetic teaching calculations, not measured GPU benchmarks.
export function onlineAttention(scores,values) {
 if(!scores.length||scores.length!==values.length||scores.some(x=>!Number.isFinite(x)))throw new Error('Finite nonempty matching inputs required');
 let m=-Infinity,denominator=0,numerator=0;
 return scores.map((s,i)=>{
  const next=Math.max(m,s),scale=Math.exp(m-next),weight=Math.exp(s-next);
  denominator=scale*denominator+weight;numerator=scale*numerator+weight*values[i];m=next;
  return {max:m,scale,denominator,numerator,output:numerator/denominator};
 });
}
export function zeroBytes(parameters,devices,stage) {
 if(!Number.isInteger(devices)||devices<1||![0,1,2,3].includes(stage))throw new Error('Invalid ZeRO setup');
 return parameters*([16,4+12/devices,2+14/devices,16/devices][stage]);
}
export function roofline(peakFlops,bandwidth,intensity) {
 return {ridge:peakFlops/bandwidth,throughput:Math.min(peakFlops,bandwidth*intensity),bound:intensity<peakFlops/bandwidth?'memory':'compute'};
}
export function pagedSlots(lengths,blockSize) {
 if(!Number.isInteger(blockSize)||blockSize<1||lengths.some(n=>!Number.isInteger(n)||n<0))throw new Error('Invalid paging inputs');
 const blocks=lengths.map(n=>Math.ceil(n/blockSize));
 const used=lengths.reduce((a,b)=>a+b,0),allocated=blocks.reduce((a,b)=>a+b,0)*blockSize;
 return {blocks,used,allocated,wasted:allocated-used};
}
export function speculativeMass(draft,target) {
 if(draft.length!==target.length||!draft.length||[draft,target].some(p=>p.some(x=>x<0||!Number.isFinite(x))||Math.abs(p.reduce((a,b)=>a+b,0)-1)>1e-9))throw new Error('Normalized matching distributions required');
 const accepted=draft.map((d,i)=>Math.min(d,target[i]));
 const residual=target.map((t,i)=>Math.max(t-draft[i],0));
 const rejected=residual.reduce((a,b)=>a+b,0);
 return {rates:draft.map((d,i)=>d?Math.min(1,target[i]/d):null),accepted,rejected,residual:residual.map(r=>rejected?r/rejected:0),output:accepted.map((a,i)=>a+residual[i])};
}
export const kvBytes=(layers,batch,length,heads,dimension,bytes)=>2*layers*batch*length*heads*dimension*bytes;
export const expectedSpeculativeTokens=(acceptance,count)=>Array.from({length:count+1},(_,i)=>acceptance**i).reduce((a,b)=>a+b,0);
const f=n=>n.toFixed(4);
// 五个实验的面板文案；中文保持既有输出，英文为对应翻译。
const labStrings = {
  zh: {
    scrollHint: '表格较宽，可左右滑动查看全部列。',
    onlineTitle: '实验：只保留当前刻度与累积值',
    onlineOptions: ['原得分', '得分整体加1000'],
    onlineHead: ['步', 'm', 'α', 'ℓ', 'u', 'u/ℓ'],
    onlineNote: '最终输出均为6。m增大时，旧分子与分母一起换刻度；这里第一步α=0，表示从空累积初始化。',
    zeroTitle: '实验：1B参数、4卡，每卡长期训练状态',
    zeroHead: '每卡理想状态：',
    zeroStages: ['权重、梯度与优化器相关状态都完整复制。', '优化器相关状态分4份；权重与梯度仍复制。', '优化器相关状态与梯度分4份。', '权重、梯度与优化器相关状态都分4份。'],
    zeroNote: '假设每参数2字节权重、2字节梯度、12字节优化器相关状态。此数不含激活、通信bucket、临时完整层和工作区，不是显存峰值。',
    rooflineTitle: '实验：100 TFLOP/s算力、1 TB/s带宽',
    rooflineOptions: ['I=10', 'I=100', 'I=200'],
    rooflineNote: (i, throughput, bound) => `强度 <strong>${i} FLOPs/byte</strong>，带宽线给出${i} TFLOP/s，计算上限100 TFLOP/s。`,
    rooflineResult: (throughput, label) => `取较小值：<strong>${throughput} TFLOP/s</strong>，${label}。这是理想上界，不是实测吞吐。`,
    ridge: '位于ridge point',
    memoryBound: '受带宽限制',
    computeBound: '受计算限制',
    pagingTitle: '实验：有效长度5、9、13，换块大小会怎样？',
    pagingOptions: ['块长4', '块长8', '块长16'],
    pagingHead: ['请求', '有效Token', '块数', '分配槽位'],
    pagingNote: (used, allocated, wasted) => `有效${used}槽，分配<strong>${allocated}</strong>槽，块尾浪费<strong>${wasted}</strong>槽。块更小也意味着块表和地址处理开销增大，不是只需最小化浪费。`,
    specTitle: '实验：拒绝以后从哪里重采？',
    specOptions: ['正确：正残差', '错误：直接从Target重采'],
    specHead: ['候选', 'D', 'T', '接受质量', '拒绝后分布', '最终质量'],
    specNote: (correct) => `拒绝概率0.3。${correct ? '正残差只补尚未覆盖的目标质量，最终恢复Target。' : '直接重采会重复分配已接受分支覆盖的质量，最终不是Target。'}所有概率均为教学构造。`,
  },
  en: {
    scrollHint: 'The table is wide; scroll sideways to see every column.',
    onlineTitle: 'Lab: keep only the running scale and accumulated values',
    onlineOptions: ['original scores', 'all scores +1000'],
    onlineHead: ['step', 'm', 'α', 'ℓ', 'u', 'u/ℓ'],
    onlineNote: 'The final output is 6 either way. As m grows, the old numerator and denominator are rescaled together; α=0 on the first step means accumulation starts empty.',
    zeroTitle: 'Lab: 1B parameters on 4 GPUs — long-lived training state per GPU',
    zeroHead: 'ideal state per GPU:',
    zeroStages: ['weights, gradients and optimiser state are all fully replicated.', 'optimiser state is sharded 4 ways; weights and gradients stay replicated.', 'optimiser state and gradients are sharded 4 ways.', 'weights, gradients and optimiser state are all sharded 4 ways.'],
    zeroNote: 'Assumes 2 bytes of weights, 2 bytes of gradients and 12 bytes of optimiser state per parameter. This excludes activations, communication buckets, temporary full layers and workspace, and is not a memory peak.',
    rooflineTitle: 'Lab: 100 TFLOP/s of compute and 1 TB/s of bandwidth',
    rooflineOptions: ['I=10', 'I=100', 'I=200'],
    rooflineNote: (i, throughput, bound) => `Intensity <strong>${i} FLOPs/byte</strong>; the bandwidth line gives ${i} TFLOP/s, and the compute ceiling is 100 TFLOP/s.`,
    rooflineResult: (throughput, label) => `Take the smaller value: <strong>${throughput} TFLOP/s</strong>, ${label}. This is an ideal upper bound, not measured throughput.`,
    ridge: 'at the ridge point',
    memoryBound: 'bandwidth-bound',
    computeBound: 'compute-bound',
    pagingTitle: 'Lab: effective lengths 5, 9 and 13 — what changes with block size?',
    pagingOptions: ['block size 4', 'block size 8', 'block size 16'],
    pagingHead: ['request', 'effective tokens', 'blocks', 'allocated slots'],
    pagingNote: (used, allocated, wasted) => `${used} slots used, <strong>${allocated}</strong> allocated, <strong>${wasted}</strong> wasted at block tails. Smaller blocks also increase block-table and address-handling overhead; minimising waste is not the only goal.`,
    specTitle: 'Lab: after a rejection, where do you resample from?',
    specOptions: ['correct: the positive residual', 'wrong: resample straight from the target'],
    specHead: ['candidate', 'D', 'T', 'accepted mass', 'post-rejection distribution', 'final mass'],
    specNote: (correct) => `Rejection probability 0.3. ${correct ? 'The positive residual only fills the target mass not yet covered, so the target is restored.' : 'Resampling directly reassigns mass already covered by the accepted branch, so the final distribution is not the target.'} All probabilities are teaching constructions.`,
  },
};

function lab(name,title,labels,panels,hint=labStrings.zh.scrollHint) {
 return `<div class="l5-lab"><p class="l5-title">${title}</p>${['online','speculative'].includes(name)?`<p class="l5-scroll-hint">${hint}</p>`:''}${labels.map((_,i)=>`<input class="l5-radio" type="radio" name="${name}" id="${name}-${i}"${i===0?' checked':''}>`).join('')}<div class="l5-choices">${labels.map((label,i)=>`<label for="${name}-${i}">${label}</label>`).join('')}</div>${panels.map((html,i)=>`<div class="l5-panel ${name}-panel-${i}">${html}</div>`).join('')}</div>`;
}
export function renderLecture5Lab(name, lang = 'zh') {
 const S = labStrings[lang] ?? labStrings.zh;
 if(name==='online')return lab('online',S.onlineTitle,S.onlineOptions,[0,1000].map(offset=>{
  const rows=onlineAttention([0,Math.log(2),Math.log(4)].map(x=>x+offset),[2,4,8]);
  return `<table><thead><tr>${S.onlineHead.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr><th>${i+1}</th><td>${f(r.max)}</td><td>${f(r.scale)}</td><td>${f(r.denominator)}</td><td>${f(r.numerator)}</td><td>${f(r.output)}</td></tr>`).join('')}</tbody></table><p>${S.onlineNote}</p>`;
 }), S.scrollHint);
 if(name==='zero')return lab('zero',S.zeroTitle,['DP','ZeRO-1','ZeRO-2','ZeRO-3'],[0,1,2,3].map(stage=>`<p>${S.zeroHead}<strong>${f(zeroBytes(1e9,4,stage)/1e9)} GB</strong></p><p>${S.zeroStages[stage]}</p><p>${S.zeroNote}</p>`));
 if(name==='roofline')return lab('roofline',S.rooflineTitle,S.rooflineOptions,[10,100,200].map(i=>{
  const r=roofline(100e12,1e12,i);
  const label=i===100?S.ridge:r.bound==='memory'?S.memoryBound:S.computeBound;
  return `<p>${S.rooflineNote(i)}</p><p>${S.rooflineResult(r.throughput/1e12, label)}</p>`;
 }));
 if(name==='paging')return lab('paging',S.pagingTitle,S.pagingOptions,[4,8,16].map(size=>{
  const r=pagedSlots([5,9,13],size);
  return `<table><thead><tr>${S.pagingHead.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${[5,9,13].map((n,i)=>`<tr><th>${i+1}</th><td>${n}</td><td>${r.blocks[i]}</td><td>${r.blocks[i]*size}</td></tr>`).join('')}</tbody></table><p>${S.pagingNote(r.used, r.allocated, r.wasted)}</p>`;
 }));
 if(name==='speculative')return lab('speculative',S.specTitle,S.specOptions,[true,false].map(correct=>{
  const d=[.6,.3,.1],t=[.3,.4,.3],r=speculativeMass(d,t),resample=correct?r.residual:t;
  return `<table><thead><tr>${S.specHead.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${d.map((v,i)=>`<tr><th>${['A','B','C'][i]}</th><td>${f(v)}</td><td>${f(t[i])}</td><td>${f(r.accepted[i])}</td><td>${f(resample[i])}</td><td>${f(r.accepted[i]+r.rejected*resample[i])}</td></tr>`).join('')}</tbody></table><p>${S.specNote(correct)}</p>`;
 }), S.scrollHint);
 throw new Error(`Unknown lecture 5 lab: ${name}`);
}
