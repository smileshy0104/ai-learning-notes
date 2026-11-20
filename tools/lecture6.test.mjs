import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {loadContent} from '../site/lib/content.mjs';
import {retrievalMetrics,chunkRanges,cosine,sharedPrefixLength,cachedInputCost,toolDecision,fahrenheitToCelsius,renderLecture6Lab} from '../site/lib/lecture6-examples.mjs';
const near=(a,b,tolerance=1e-9)=>assert(Math.abs(a-b)<tolerance,`${a} != ${b}`);

test('binary retrieval metrics distinguish counts from ranking position and use full truth for IDCG',()=>{
 const a=retrievalMetrics([0,1,1,1],3,3),b=retrievalMetrics([1,1,0,1],3,3);
 near(a.precision,2/3);near(a.recall,2/3);near(a.rr,.5);near(b.rr,1);
 near(a.dcg,1/Math.log2(3)+.5);near(a.ideal,1+1/Math.log2(3)+.5);
 near(a.ndcg,.5307212739772434);near(b.ndcg,.7653606369886217);
 near(a.precision,b.precision);near(a.recall,b.recall);
 assert.equal(retrievalMetrics([1,1,1,0],3,3).ndcg,1);
});
test('retrieval metrics define empty truth and no hit rather than dividing by zero',()=>{
 assert.deepEqual(retrievalMetrics([0,0,0],0,3),{precision:0,recall:0,rr:0,dcg:0,ideal:0,ndcg:0});
 assert.equal(retrievalMetrics([0,0,1],1,2).rr,0);
 assert.throws(()=>retrievalMetrics([1,1],1,2));assert.throws(()=>retrievalMetrics([0],0,0));
 assert.throws(()=>retrievalMetrics([2],2,1));
});
test('overlap chunk ranges stop once the end is covered and account for duplicate storage',()=>{
 const overlap=chunkRanges(1000,400,100);assert.deepEqual(overlap,[[0,400],[300,700],[600,1000]]);
 assert.equal(overlap.reduce((s,[a,b])=>s+b-a,0),1200);
 assert.equal(chunkRanges(1000,400,0).reduce((s,[a,b])=>s+b-a,0),1000);
 assert.deepEqual(chunkRanges(0,400,100),[]);assert.deepEqual(chunkRanges(5,400,100),[[0,5]]);
 assert.throws(()=>chunkRanges(1000,400,400));
 assert.equal(10000*768*4,30720000);near(30720000/2**20,29.296875);
});
test('cosine and BM25 teaching arithmetic are explicit about their score spaces',()=>{
 near(cosine([1,0],[.8,.6]),.8);near(cosine([1,0],[0,1]),0);
 assert.throws(()=>cosine([0,0],[1,0]));assert.throws(()=>cosine([1],[1,2]));
 near(2*(1.2+1)/(2+1.2*(1-.75+.75*1)),1.375);
});
test('prefix matching stops at the first change even when later blocks match',()=>{
 assert.equal(sharedPrefixLength(['U1','T','C1'],['U2','T','C2']),0);
 assert.equal(sharedPrefixLength(['T','C1','U1'],['T','C2','U2']),1);
 assert.equal(sharedPrefixLength(['C1','T','U1'],['C2','T','U2']),0);
 assert.equal(sharedPrefixLength([],[]),0);
 const cost=cachedInputCost(10,800,200,2,.2);near(cost.uncached,.02);near(cost.cached,.00704);
 near((1-cost.cached/cost.uncached)*100,64.8);
});
test('synthetic tool gate separates permission, parameter validation and confirmation',()=>{
 assert.equal(toolDecision({tool:'read_temperature',authorized:true}),'execute');
 assert.equal(toolDecision({tool:'set_temperature',authorized:true,targetF:70}),'confirm');
 assert.equal(toolDecision({tool:'set_temperature',authorized:true,targetF:70,confirmed:true}),'execute');
 assert.equal(toolDecision({tool:'set_temperature',authorized:true,confirmed:true}),'invalid');
 assert.equal(toolDecision({tool:'set_temperature',authorized:true,targetF:100,confirmed:true}),'invalid');
 assert.equal(toolDecision({tool:'set_temperature',authorized:false,targetF:70,confirmed:true}),'deny');
 assert.equal(toolDecision({tool:'unknown',authorized:true,confirmed:true}),'deny');
});
test('temperature, budget and orchestration examples do not conflate state or parallel work',()=>{
 near(fahrenheitToCelsius(65),18.333333333333332);near(fahrenheitToCelsius(70),21.11111111111111);
 near(fahrenheitToCelsius(70)-fahrenheitToCelsius(65),5*5/9);
 assert.equal(10000-2000-1000-1000,6000);
 assert.equal(4+6+1,11);assert.equal(Math.max(4,6)+1,7);assert.equal((1+3)*1000,4000);
 assert.equal(3*4,12);assert.equal(3+4,7);
});
test('lecture six labs have all presets and a single checked default without network scripts',()=>{
 for(const [name,count] of [['metrics',3],['tool-gate',5],['prefix',3],['react',3],['compaction',2]]){
  const html=renderLecture6Lab(name);assert.equal((html.match(/ checked/g)??[]).length,1);
  assert.equal((html.match(/class="l6-panel /g)??[]).length,count);assert(!html.includes('<script'));
 }
 assert.throws(()=>renderLecture6Lab('unknown'));
});
test('lecture six coverage, rendering, note links and archived bytes are consistent',async()=>{
 const data=await loadContent(fileURLToPath(new URL('../',import.meta.url)));
 const articles=data.articles.filter(a=>a.collection==='cme295'&&a.lecture===6);assert.equal(articles.length,13);
 for(const a of articles){assert(!a.text.includes('**'),`${a.slug}: unrendered emphasis`);assert(!/视觉核对|已读完/.test(a.text),a.slug);}
 const note=new URL('../study-notes/cme295-fall2026/lecture-06-ai-agents.md',import.meta.url);
 const text=await fs.readFile(note,'utf8');assert(!/127\.0\.0\.1|http:\/\/localhost/.test(text));
 for(const [,link] of text.matchAll(/\]\(([^)]+)\)/g))if(!/^(https?:|#)/.test(link))await fs.access(new URL(link.split('#')[0],note));
 const manifest=JSON.parse(await fs.readFile(new URL('../materials/manifest.json',import.meta.url),'utf8'));
 const materials=manifest.files.filter(item=>item.lecture===6);assert.equal(materials.length,2);
 assert.equal(materials.find(item=>item.path.endsWith('.pdf')).pages,152);
 for(const item of materials){const bytes=await fs.readFile(new URL('../materials/'+item.path,import.meta.url));assert.equal(bytes.length,item.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);}
});
