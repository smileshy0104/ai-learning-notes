
'use strict';
if (document.getElementById('slider-demo')) {
const names=['泰迪熊','可爱','阅读'];
const keys=[[1,0],[0,1],[1,1]];
const values=[[1,0],[0,2],[1,1]];
function calculateAttention(q){
  const dots=keys.map(k=>q[0]*k[0]+q[1]*k[1]);
  const scores=dots.map(x=>x/Math.sqrt(2));
  const max=Math.max(...scores);
  const exps=scores.map(x=>Math.exp(x-max));
  const sum=exps.reduce((a,b)=>a+b,0);
  const weights=exps.map(x=>x/sum);
  const result=[0,1].map(d=>weights.reduce((acc,w,i)=>acc+w*values[i][d],0));
  return {dots,scores,weights,result};
}
function renderAttention(){
  const q=[Number(document.getElementById('q1').value),Number(document.getElementById('q2').value)];
  document.getElementById('q1-value').textContent=q[0].toFixed(1);
  document.getElementById('q2-value').textContent=q[1].toFixed(1);
  const {dots,scores,weights,result}=calculateAttention(q);
  document.getElementById('attention-table').innerHTML=names.map((n,i)=>`<tr><th scope="row">${n}</th><td>[${keys[i]}]</td><td>[${values[i]}]</td><td>${dots[i].toFixed(3)}</td><td>${scores[i].toFixed(3)}</td><td>${(weights[i]*100).toFixed(2)}%</td></tr>`).join('');
  document.getElementById('attention-bars').innerHTML=names.map((n,i)=>`<div class="barrow"><span>${n}</span><div class="track"><div class="fill" style="width:${weights[i]*100}%"></div></div><span>${(weights[i]*100).toFixed(1)}%</span></div>`).join('');
  const out=document.getElementById('attention-result');
  out.textContent=weights.map((w,i)=>`${w.toFixed(3)} × [${values[i]}]`).join(' +\n')+`\n≈ [${result.map(x=>x.toFixed(3)).join(', ')}]`;
  out.style.whiteSpace='pre-wrap';
}
const sliderDemo=document.getElementById('slider-demo');
sliderDemo.hidden=false;
['q1','q2'].forEach(id=>document.getElementById(id).addEventListener('input',renderAttention));
document.getElementById('reset').addEventListener('click',()=>{
  document.getElementById('q1').value='1';
  document.getElementById('q2').value='0';
  renderAttention();
});
renderAttention();

}
