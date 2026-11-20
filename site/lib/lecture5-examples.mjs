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
function lab(name,title,labels,panels) {
 return `<div class="l5-lab"><p class="l5-title">${title}</p>${['online','speculative'].includes(name)?'<p class="l5-scroll-hint">表格较宽，可左右滑动查看全部列。</p>':''}${labels.map((_,i)=>`<input class="l5-radio" type="radio" name="${name}" id="${name}-${i}"${i===0?' checked':''}>`).join('')}<div class="l5-choices">${labels.map((label,i)=>`<label for="${name}-${i}">${label}</label>`).join('')}</div>${panels.map((html,i)=>`<div class="l5-panel ${name}-panel-${i}">${html}</div>`).join('')}</div>`;
}
export function renderLecture5Lab(name) {
 if(name==='online')return lab('online','实验：只保留当前刻度与累积值',['原得分','得分整体加1000'],[0,1000].map(offset=>{
  const rows=onlineAttention([0,Math.log(2),Math.log(4)].map(x=>x+offset),[2,4,8]);
  return `<table><thead><tr><th>步</th><th>m</th><th>α</th><th>ℓ</th><th>u</th><th>u/ℓ</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><th>${i+1}</th><td>${f(r.max)}</td><td>${f(r.scale)}</td><td>${f(r.denominator)}</td><td>${f(r.numerator)}</td><td>${f(r.output)}</td></tr>`).join('')}</tbody></table><p>最终输出均为6。m增大时，旧分子与分母一起换刻度；这里第一步α=0，表示从空累积初始化。</p>`;
 }));
 if(name==='zero')return lab('zero','实验：1B参数、4卡，每卡长期训练状态',['DP','ZeRO-1','ZeRO-2','ZeRO-3'],[0,1,2,3].map(stage=>`<p>每卡理想状态：<strong>${f(zeroBytes(1e9,4,stage)/1e9)} GB</strong></p><p>${['权重、梯度与优化器相关状态都完整复制。','优化器相关状态分4份；权重与梯度仍复制。','优化器相关状态与梯度分4份。','权重、梯度与优化器相关状态都分4份。'][stage]}</p><p>假设每参数2字节权重、2字节梯度、12字节优化器相关状态。此数不含激活、通信bucket、临时完整层和工作区，不是显存峰值。</p>`));
 if(name==='roofline')return lab('roofline','实验：100 TFLOP/s算力、1 TB/s带宽',['I=10','I=100','I=200'],[10,100,200].map(i=>{
  const r=roofline(100e12,1e12,i);
  return `<p>强度 <strong>${i} FLOPs/byte</strong>，带宽线给出${i} TFLOP/s，计算上限100 TFLOP/s。</p><p>取较小值：<strong>${r.throughput/1e12} TFLOP/s</strong>，${i===100?'位于ridge point':r.bound==='memory'?'受带宽限制':'受计算限制'}。这是理想上界，不是实测吞吐。</p>`;
 }));
 if(name==='paging')return lab('paging','实验：有效长度5、9、13，换块大小会怎样？',['块长4','块长8','块长16'],[4,8,16].map(size=>{
  const r=pagedSlots([5,9,13],size);
  return `<table><thead><tr><th>请求</th><th>有效Token</th><th>块数</th><th>分配槽位</th></tr></thead><tbody>${[5,9,13].map((n,i)=>`<tr><th>${i+1}</th><td>${n}</td><td>${r.blocks[i]}</td><td>${r.blocks[i]*size}</td></tr>`).join('')}</tbody></table><p>有效${r.used}槽，分配<strong>${r.allocated}</strong>槽，块尾浪费<strong>${r.wasted}</strong>槽。块更小也意味着块表和地址处理开销增大，不是只需最小化浪费。</p>`;
 }));
 if(name==='speculative')return lab('speculative','实验：拒绝以后从哪里重采？',['正确：正残差','错误：直接从Target重采'],[true,false].map(correct=>{
  const d=[.6,.3,.1],t=[.3,.4,.3],r=speculativeMass(d,t),resample=correct?r.residual:t;
  return `<table><thead><tr><th>候选</th><th>D</th><th>T</th><th>接受质量</th><th>拒绝后分布</th><th>最终质量</th></tr></thead><tbody>${d.map((v,i)=>`<tr><th>${['A','B','C'][i]}</th><td>${f(v)}</td><td>${f(t[i])}</td><td>${f(r.accepted[i])}</td><td>${f(resample[i])}</td><td>${f(r.accepted[i]+r.rejected*resample[i])}</td></tr>`).join('')}</tbody></table><p>拒绝概率0.3。${correct?'正残差只补尚未覆盖的目标质量，最终恢复Target。':'直接重采会重复分配已接受分支覆盖的质量，最终不是Target。'}所有概率均为教学构造。</p>`;
 }));
 throw new Error(`Unknown lecture 5 lab: ${name}`);
}
