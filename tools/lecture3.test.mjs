import test from 'node:test';
import assert from 'node:assert/strict';
import { registerLectureContract } from './lecture-contract.mjs';
import { meanNll,bitsPerByte,matmul,rewardPair,dpoPair,groupAdvantages,klDivergence,softCrossEntropy,bestFitDecreasing,lossExample,renderLecture3Lab } from '../site/lib/lecture3-examples.mjs';
const near=(actual,expected,tolerance=1e-10)=>assert(Math.abs(actual-expected)<tolerance,`${actual} != ${expected}`);

test('teacher-forced CE and byte conversion retain the total sequence likelihood',()=>{
 const p=[.5,.25,.8,.5];
 near(p.reduce((a,b)=>a*b,1),.05);
 const loss=meanNll(p);
 near(loss,.7489330683884977);
 near(bitsPerByte(loss,4,10),.43219280948873623);
 near(bitsPerByte(loss*2,2,10),bitsPerByte(loss,4,10));
 assert.throws(()=>bitsPerByte(loss,4,0));
});
test('SFT uses only active answer targets and normalizes by their count',()=>{
 near(meanNll(lossExample.probabilities),1.0533281023466696);
 near(meanNll(lossExample.probabilities,lossExample.responseMask),.34055041584399376);
 assert.throws(()=>meanNll([.5],[0]));
 assert.throws(()=>meanNll([.5],[1,0]));
});
test('LoRA matrix increment, trainable ratio and output are correct',()=>{
 const delta=matmul([[.2],[.4]],[[1,-1]]);
 assert.deepEqual(delta,[[.2,-.2],[.4,-.4]]);
 const residual=matmul(delta,[[2],[1]]);
 near(2+residual[0][0],2.2);near(1+residual[1][0],1.4);
 assert.equal(4096**2,16777216);assert.equal(2*4096*8,65536);
 near(65536/16777216*100,.390625);
});
test('pairwise reward depends on score gaps and DPO uses relative log probability margins',()=>{
 const pair=rewardPair(2,0);
 near(pair.probability,.8807970779778823);near(pair.loss,.1269280110429725);
 near(rewardPair(102,100).probability,pair.probability);
 near(rewardPair(0,0).loss,Math.log(2));
 near(dpoPair([.2,.2],[.2,.2]).loss,Math.log(2));
 near(dpoPair([.4,.1],[.2,.2]).margin,Math.log(2));
 near(dpoPair([.4,.1],[.2,.2]).loss,.4054651081081644);
});
test('group advantage handles mixed rewards and zero variance groups',()=>{
 const mixed=groupAdvantages([1,1,0,0]);
 near(mixed.mean,.5);near(mixed.std,.5);assert.deepEqual(mixed.values,[1,1,-1,-1]);
 assert.deepEqual(groupAdvantages([1,1,1,1]).values,[0,0,0,0]);
 assert.deepEqual(groupAdvantages([0,0,0,0]).values,[0,0,0,0]);
});
test('KL, soft distillation targets, packing and length-budget examples match text',()=>{
 near(klDivergence([.8,.2],[.5,.5]),.19274475702175747);
 near(.8-.5*klDivergence([.8,.2],[.5,.5]),.7036276214891213);
 near(softCrossEntropy([.8,.2],[.7,.3]),.5261345160161732);
 near(klDivergence([.8,.2],[.7,.3]),.025732092477985358);
 assert.deepEqual(bestFitDecreasing([6,5,3,2],8),[[6,2],[5,3]]);
 assert.throws(()=>bestFitDecreasing([9],8));
 near((5+4+3)/(2*8),.75);assert.equal((32768/4096)**2,64);assert.equal((131072/4096)**2,1024);
 near(meanNll([.6,.5]),.6019864021629681);
});
test('lecture three interactive components have a default and all preset panels',()=>{
 for(const [name,count] of [['loss-mask',2],['preference-gap',3],['group-advantage',3]]){
  const html=renderLecture3Lab(name);
  assert.equal((html.match(/ checked/g)??[]).length,1);
  assert.equal((html.match(/class="l3-panel /g)??[]).length,count);
 }
 assert.throws(()=>renderLecture3Lab('unknown'));
});
registerLectureContract({number:3, labs:3});
