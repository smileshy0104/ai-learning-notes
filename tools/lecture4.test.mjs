import test from 'node:test';
import assert from 'node:assert/strict';
import { registerLectureContract } from './lecture-contract.mjs';
import {sigmoid,bernoulliGradient,importanceExpectation,clippedSurrogate,kl,nonnegativeKlSample,normalizationWeights,gae,renderLecture4Lab} from '../site/lib/lecture4-examples.mjs';
const near=(a,b,tolerance=1e-9)=>assert(Math.abs(a-b)<tolerance,`${a} != ${b}`);

test('REINFORCE matches the exact finite policy derivative and one sampled ascent step',()=>{
 const r=bernoulliGradient(0,[1,0]);near(r.mean,.25);near(sigmoid(.2*r.samples[0]),.52497918747894);
 near(.5*.8*.25,.1);near(Math.log(.1),-2.302585092994046);
 const h=1e-5;const finite=(sigmoid(h)-sigmoid(-h))/(2*h);near(r.mean,finite,1e-8);
});
test('action-independent baseline preserves the mean and reduces toy variance to zero',()=>{
 const a=bernoulliGradient(0,[101,100]),b=bernoulliGradient(0,[101,100],100.5);
 assert.deepEqual(a.samples,[50.5,-50]);near(a.variance,2525.0625);
 assert.deepEqual(b.samples,[.25,.25]);near(a.mean,b.mean);near(b.variance,0);
});
test('importance sampling reproduces current expected rewards and requires support',()=>{
 near(importanceExpectation([.5,.5],[.8,.2],[1,0]),.8);
 assert.throws(()=>importanceExpectation([1,0],[.8,.2],[1,0]));
 near(1.2*.9,1.08);
});
test('PPO clipping saturates only the correct positive and negative branches',()=>{
 near(clippedSurrogate(1.5,1).value,1.2);
 near(clippedSurrogate(.5,-1).value,-.8);
 near(clippedSurrogate(1.5,-1).value,-1.5);
 near(clippedSurrogate(.5,1).value,.5);
 const first=[1.1,1.3].map(r=>clippedSurrogate(r,1).value);
 const second=[.9,.7].map(r=>clippedSurrogate(r,-1).value);
 near((first.reduce((a,b)=>a+b,0)+second.reduce((a,b)=>a+b,0))/4,.15);
 near(.15-.1*.02,.148);
});
test('GAE includes future residuals and respects lambda endpoints in the example',()=>{
 const one=gae([0,1],[.6,.8,0],1,1),zero=gae([0,1],[.6,.8,0],1,0);
 near(one[0],.4);near(one[1],.2);near(zero[0],.2);near(zero[1],.2);
 near(.95-.7,.25);
});
test('KL directions and sampled nonnegative estimator match exact expectation',()=>{
 const p=[.8,.2],q=[.5,.5];near(kl(p,q),.19274475702175747);near(kl(q,p),.22314355131420976);
 near(p.reduce((sum,v,i)=>sum+v*nonnegativeKlSample(v,q[i]),0),kl(p,q));
 near(kl([.5,.5],[.9,.1]),.5108256237659907);
 assert.equal(kl([1,0],[0,1]),Infinity);
});
test('length normalization changes token and completion weights without inventing total length penalties',()=>{
 const w=normalizationWeights([2,6]);near(w.sequence[0],.25);near(w.sequence[1],1/12);near(w.token[0],.125);
 near(w.sequence[0]*2,.5);near(w.sequence[1]*6,.5);near(w.token[0]*2,.25);near(w.token[1]*6,.75);
 near(Math.sqrt(.25*.75),.4330127018922193);near((1-.25)/Math.sqrt(.25*.75),Math.sqrt(3));
 near(.001*1.2,.0012);near(.001*1.5,.0015);
});
test('reverse KL fixed-prefix gradient agrees with finite differences',()=>{
 const theta=.4,teacher=[.8,.2],p=sigmoid(theta),student=[p,1-p];
 const scores=[1-p,-p];
 const analytic=student.reduce((sum,v,i)=>sum+v*(Math.log(v/teacher[i])+1)*scores[i],0);
 const objective=t=>{const q=sigmoid(t);return kl([q,1-q],teacher);};
 const h=1e-5;near(analytic,(objective(theta+h)-objective(theta-h))/(2*h),1e-8);
});
test('static lecture four labs render complete presets and valid default choices',()=>{
 for(const [name,count] of [['baseline',2],['ppo-clip',2],['length-weight',2],['kl-direction',3]]){
  const html=renderLecture4Lab(name);
  assert.equal((html.match(/ checked/g)??[]).length,1);
  assert.equal((html.match(/class="l4-panel /g)??[]).length,count);
 }
 assert.throws(()=>renderLecture4Lab('unknown'));
});
registerLectureContract({number:4, labs:4});
