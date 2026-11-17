import test from 'node:test';
import assert from 'node:assert/strict';
import { temperatureDistribution, temperatures, candidates, nucleus, rotate, dot, kvBytes, auxiliaryLoss, rmsNorm, renderLecture2Lab } from '../site/lib/lecture2-examples.mjs';
const near=(a,b,tolerance=1e-10)=>assert(Math.abs(a-b)<tolerance,`${a} != ${b}`);

test('temperature presets preserve normalization and become flatter as T rises',()=>{
 const distributions=temperatures.map(temperatureDistribution);
 for(const p of distributions) near(p.reduce((a,b)=>a+b,0),1);
 assert(distributions[0][0]>distributions[1][0]);
 assert(distributions[1][0]>distributions[2][0]);
 assert.throws(()=>temperatureDistribution(0));
});
test('top-p includes the crossing token and renormalizes exactly',()=>{
 for(const [threshold,count,mass] of [[0.6,2,0.65],[0.8,3,0.85],[0.9,4,0.95]]){
  const result=nucleus(candidates,threshold);
  assert.equal(result.selected.length,count); near(result.mass,mass);
  near(result.probabilities.reduce((a,b)=>a+b,0),1);
 }
});
test('RoPE relative rotation and sine/cosine PE dot product survive a shared shift',()=>{
 const theta=Math.PI/6,q=[1,0],k=[1,0];
 near(dot(rotate(q,theta),rotate(k,3*theta)),0.5);
 near(dot(rotate(q,6*theta),rotate(k,8*theta)),0.5);
 const pe=m=>[Math.sin(m),Math.cos(m),Math.sin(m*.01),Math.cos(m*.01)];
 near(dot(pe(0),pe(1)),dot(pe(10),pe(11)));
 near(dot(pe(0),pe(1)),Math.cos(1)+Math.cos(.01));
});
test('MoE selected normalization, auxiliary loss and cache memory examples are correct',()=>{
 near(.55/.8*2,1.375);near(.25/.8*4,1.25);
 near(auxiliaryLoss([.25,.25,.25,.25],[.25,.25,.25,.25]),.01);
 near(auxiliaryLoss([.75,.25,0,0],[.7,.2,.05,.05]),.023);
 assert.equal(kvBytes(),536870912);
 assert.equal(kvBytes({heads:2}),134217728);
 assert.equal(kvBytes({heads:1}),67108864);
});
test('normalization, MLM loss, compute budget, beam and context examples are consistent',()=>{
 const rms=rmsNorm([1,3]);near(rms[0],1/Math.sqrt(5));near(rms[1],3/Math.sqrt(5));
 near((-Math.log(.6)-Math.log(.5))/2,0.6019864021629681);
 near(1.2e18/2e14,6000);
 near(1.2e20/(6*1e9),20e9);
 assert(.4*.99>.6*.51);
 assert.equal(Math.min(8192-5000,2048),2048);
 assert.equal((1e16 + -1e16)+1,1);assert.equal(1e16+(-1e16+1),0);
});
test('static labs have default selected state and all named panels',()=>{
 for(const name of ['temperature','routing','window']){
  const html=renderLecture2Lab(name);
  assert(html.includes('checked'));
  assert.equal((html.match(/class="l2-panel /g)??[]).length,3);
 }
 assert.throws(()=>renderLecture2Lab('not-a-lab'));
});
