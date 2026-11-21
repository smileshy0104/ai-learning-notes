import test from 'node:test';
import assert from 'node:assert/strict';
import { registerLectureContract } from './lecture-contract.mjs';
import {onlineAttention,zeroBytes,roofline,pagedSlots,speculativeMass,kvBytes,expectedSpeculativeTokens,renderLecture5Lab} from '../site/lib/lecture5-examples.mjs';
const near=(actual,expected,tolerance=1e-9)=>assert(Math.abs(actual-expected)<tolerance,`${actual} != ${expected}`);

test('online attention equals dense softmax and is invariant to a large common offset',()=>{
 const scores=[0,Math.log(2),Math.log(4)],values=[2,4,8];
 const rows=onlineAttention(scores,values);
 near(rows[0].output,2);near(rows[1].denominator,1.5);near(rows[1].numerator,5);
 near(rows[2].denominator,1.75);near(rows[2].numerator,10.5);near(rows[2].output,6);
 near(onlineAttention(scores.map(s=>s+1000),values).at(-1).output,6);
 for(const s of [[1,-3,2,5],[-1000,-999,-1001,0]]) {
  const v=[-2,4,1,3],m=Math.max(...s),e=s.map(x=>Math.exp(x-m));
  const dense=e.reduce((a,x,i)=>a+x*v[i],0)/e.reduce((a,b)=>a+b,0);
  near(onlineAttention(s,v).at(-1).output,dense);
 }
 assert.throws(()=>onlineAttention([],[]));assert.throws(()=>onlineAttention([Infinity],[1]));
});
test('memory and FLOP units reproduce teaching examples without confusing GB with GiB',()=>{
 near(100e9*2/2**30,186.2645149230957);assert.equal(4*(3+2),20);assert.equal(2*2*3*2,24);
 assert.equal(4096**2*2/2**20,32);assert.equal(32768**2*2/2**30,2);
 assert.equal(2*4096*4096*2/2**20,64);assert.equal(2*4*2,16);
 near(41.7/7.3,5.712328767123288);
 assert.equal(2+2+4+8,16);assert.equal(100e9*16/1e12,1.6);
});
test('ZeRO stages shard only the specified persistent training state',()=>{
 assert.deepEqual([0,1,2,3].map(stage=>zeroBytes(1e9,4,stage)/1e9),[16,7,5.5,4]);
 for(const stage of [0,1,2,3])assert.equal(zeroBytes(1e9,1,stage),16e9);
 assert.throws(()=>zeroBytes(1e9,0,3));assert.throws(()=>zeroBytes(1e9,4,4));
});
test('parallel and latency examples retain their declared assumptions',()=>{
 assert.deepEqual([1+6,2+8],[7,10]);assert.deepEqual([(2+4)/2,(4+0)/2],[3,2]);
 near(1/(1+4-1),.25);near(4/(4+4-1)*100,57.14285714285714);near(16/(16+4-1)*100,84.21052631578947);
 assert.equal(2*2*2,8);near(.1+.4+(11-1)*.03,.8);near(.1+.4+(101-1)*.03,3.5);
});
test('roofline uses bandwidth times intensity and limits it by compute peak',()=>{
 const low=roofline(100e12,1e12,10),high=roofline(100e12,1e12,200);
 assert.equal(low.ridge,100);assert.equal(low.throughput,10e12);assert.equal(low.bound,'memory');
 assert.equal(high.throughput,100e12);assert.equal(high.bound,'compute');
});
test('KV size follows KV heads, not query heads, under equal other dimensions',()=>{
 const base=kvBytes(32,1,4096,8,128,2);assert.equal(base/2**20,512);
 assert.equal(kvBytes(32,4,4096,8,128,2)/2**30,2);
 assert.equal(kvBytes(32,1,4096,32,128,2)/2**30,2);
 assert.equal(kvBytes(32,1,4096,1,128,2)/2**20,64);near((1-2/24)*100,91.66666666666666);
 const latent=1+2;assert.deepEqual([latent,2*latent],[3,6]);assert.deepEqual([2*latent,-latent],[6,-3]);
});
test('paged allocations preserve all tokens and expose block-tail waste',()=>{
 assert.deepEqual(pagedSlots([5,9,13],4),{blocks:[2,3,4],used:27,allocated:36,wasted:9});
 const b=pagedSlots([5,9,13],8);assert.equal(b.allocated,40);assert.equal(b.wasted,13);
 assert.equal(pagedSlots([5,9,13],16).wasted,21);assert.throws(()=>pagedSlots([1],0));
});
test('speculative residual sampling reconstructs target including support boundaries',()=>{
 const r=speculativeMass([.6,.3,.1],[.3,.4,.3]);
 assert.deepEqual(r.rates,[.5,1,1]);near(r.rejected,.3);
 [.3,.4,.3].forEach((v,i)=>near(r.output[i],v));near(r.residual[1],1/3);near(r.residual[2],2/3);
 [.39,.42,.19].forEach((v,i)=>near(r.accepted[i]+r.rejected*[.3,.4,.3][i],v));
 const same=speculativeMass([.5,.5],[.5,.5]);assert.equal(same.rejected,0);assert.deepEqual(same.output,[.5,.5]);
 const disjoint=speculativeMass([1,0],[0,1]);assert.equal(disjoint.rates[1],null);assert.deepEqual(disjoint.output,[0,1]);
 assert.throws(()=>speculativeMass([.5,.2],[.5,.5]));
 for(let k=1;k<=20;k++) {
  const d=[k,21-k,3].map(v=>v/24),t=[3,k,21-k].map(v=>v/24),out=speculativeMass(d,t);
  t.forEach((v,i)=>near(out.output[i],v));
 }
});
test('speculative throughput estimate and distillation arithmetic match text',()=>{
 near(expectedSpeculativeTokens(.8,3),2.952);near(expectedSpeculativeTokens(1,3),4);
 near(expectedSpeculativeTokens(0,3),1);near(2.952*20/(3*2+20),2.270769230769231);
 const teacher=[.75,.25],draft=[.5,.5];
 near(-teacher.reduce((sum,v,i)=>sum+v*Math.log(draft[i]),0),.6931471805599453);
 near(teacher.reduce((sum,v,i)=>sum+v*Math.log(v/draft[i]),0),.13081203594113697);
 near(speculativeMass(draft,teacher).accepted.reduce((a,b)=>a+b,0),.75);
});
test('all lecture five static labs have one default and every named preset',()=>{
 for(const [name,count] of [['online',2],['zero',4],['roofline',3],['paging',3],['speculative',2]]){
  const html=renderLecture5Lab(name);assert.equal((html.match(/ checked/g)??[]).length,1);
  assert.equal((html.match(/class="l5-panel /g)??[]).length,count);
 }
 assert.throws(()=>renderLecture5Lab('unknown'));
});
registerLectureContract({number:5, labs:5});
