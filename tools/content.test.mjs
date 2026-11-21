import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadContent } from '../site/lib/content.mjs';
import { articlePage, collectionPage, labs as labsPage } from '../site/lib/pages.mjs';

const article=(slug,status='published')=>`---
slug: ${slug}
title: New topic ${slug}
collection: new-course
description: Example description
order: 20
kind: lesson
status: ${status}
tags: [Example]
---
## Motivation

A complete explanation.

## Example

A worked example.
`;
async function fixture(run) {
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'learning-content-'));
 try {
  const dir=path.join(root,'content/collections/new-course');
  await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(root,'content/catalog.json'),JSON.stringify({site:{},chapters:[],collections:[{slug:'new-course',title:'New course',kind:'course',label:'Course',description:'A new collection',icon:'+'}]}));
  await run(root,dir);
 }finally {await fs.rm(root,{recursive:true,force:true});}
}

test('new collection and article generate navigation and headings without template changes',()=>fixture(async(root,dir)=>{
 await fs.writeFile(path.join(dir,'lesson.md'),article('lesson'));
 const data=await loadContent(root);
 assert.equal(data.articles.length,1);
 assert.equal(data.articles[0].url,'topics/new-course/lesson.html');
 assert.deepEqual(data.articles[0].headings.map(h=>h.title),['Motivation','Example']);
 assert(collectionPage(data,data.collections[0]).includes('../topics/new-course/lesson.html'));
 assert(articlePage(data,data.articles[0]).includes('href="#topic-1"'));
}));
test('draft articles stay out of published content',()=>fixture(async(root,dir)=>{
 await fs.writeFile(path.join(dir,'draft.md'),article('draft','draft'));
 assert.equal((await loadContent(root)).articles.length,0);
}));
test('missing metadata fails before publishing',()=>fixture(async(root,dir)=>{
 await fs.writeFile(path.join(dir,'broken.md'),article('broken').replace('description: Example description\n',''));
 await assert.rejects(loadContent(root),/missing description/);
}));
test('lecture metadata groups pages and labels lecture two correctly',()=>fixture(async(root,dir)=>{
 await fs.writeFile(path.join(dir,'one.md'),article('one').replace('kind: lesson','lecture: 1\nkind: lesson'));
 await fs.writeFile(path.join(dir,'two.md'),article('two').replace('kind: lesson','lecture: 2\nkind: lesson'));
 const catalogFile=path.join(root,'content/catalog.json');
 const catalog=JSON.parse(await fs.readFile(catalogFile,'utf8'));
 catalog.lectures=[{collection:'new-course',number:1,title:'First',pages:10,chapters:['one']},{collection:'new-course',number:2,title:'Second',pages:20,chapters:['two']}];
 await fs.writeFile(catalogFile,JSON.stringify(catalog));
 const data=await loadContent(root);
 assert(collectionPage(data,data.collections[0]).includes('id="lecture-2"'));
 const html=articlePage(data,data.articles.find(a=>a.slug==='two'));
 assert(html.includes('Lecture 2'));
 assert(!html.includes('>New topic one</a>'));
 await fs.unlink(path.join(dir,'two.md'));
 await assert.rejects(loadContent(root),/Missing lecture 2 chapter/);
}));
test('duplicate article addresses fail before publishing',()=>fixture(async(root,dir)=>{
 await fs.writeFile(path.join(dir,'one.md'),article('same'));
 await fs.writeFile(path.join(dir,'two.md'),article('same'));
 await assert.rejects(loadContent(root),/duplicate article URL/);
}));
test('labs are registered with a title and published on the labs page',()=>fixture(async(root,dir)=>{
 const catalogFile=path.join(root,'content/catalog.json');
 const catalog=JSON.parse(await fs.readFile(catalogFile,'utf8'));
 catalog.collections[0].slug='cme295';
 catalog.lectures=[{collection:'cme295',number:6,title:'Sixth',pages:1,chapters:['metrics']}];
 await fs.writeFile(catalogFile,JSON.stringify(catalog));
 await fs.mkdir(path.join(root,'content/collections/cme295'),{recursive:true});
 await fs.writeFile(path.join(root,'content/collections/cme295/metrics.md'),article('metrics').replace('collection: new-course','collection: cme295\nlecture: 6').replace('## Example','<!-- lab:l6-metrics -->\n\n## Example'));
 await fs.rm(dir,{recursive:true,force:true});
 const data=await loadContent(root);
 assert.equal(data.labs.length,1);
 assert.equal(data.labs[0].name,'l6-metrics');
 assert(data.labs[0].title.startsWith('实验：'),data.labs[0].title);
 assert(labsPage(data).includes(`href="${data.labs[0].url}"`));
}));
test('a lab marker without its lecture prefix fails instead of falling back',()=>fixture(async(root,dir)=>{
 await fs.writeFile(path.join(dir,'lab.md'),article('lab').replace('## Example','<!-- lab:metrics -->\n\n## Example'));
 await assert.rejects(loadContent(root),/Unknown lab: metrics/);
}));
test('cme295 articles must declare their lecture and register in catalog.lectures',()=>fixture(async(root,dir)=>{
 const catalogFile=path.join(root,'content/catalog.json');
 const catalog=JSON.parse(await fs.readFile(catalogFile,'utf8'));
 catalog.collections[0].slug='cme295';
 await fs.writeFile(catalogFile,JSON.stringify(catalog));
 await fs.mkdir(path.join(root,'content/collections/cme295'),{recursive:true});
 await fs.rm(dir,{recursive:true,force:true});
 const target=path.join(root,'content/collections/cme295/lesson.md');
 await fs.writeFile(target,article('lesson').replace('collection: new-course','collection: cme295'));
 await assert.rejects(loadContent(root),/missing lecture/);
 await fs.writeFile(target,article('lesson').replace('collection: new-course','collection: cme295\nlecture: 6'));
 await assert.rejects(loadContent(root),/lecture 6 is not registered in catalog\.lectures/);
 catalog.lectures=[{collection:'cme295',number:6,title:'Sixth',pages:1,chapters:['other']}];
 await fs.writeFile(catalogFile,JSON.stringify(catalog));
 await assert.rejects(loadContent(root),/Missing lecture 6 chapter: other/);
 catalog.lectures=[{collection:'cme295',number:6,title:'Sixth',pages:1,chapters:[]}];
 await fs.writeFile(catalogFile,JSON.stringify(catalog));
 await assert.rejects(loadContent(root),/chapter not registered in catalog: lesson/);
}));
test('frontmatter cannot set the reserved lab metadata field',()=>fixture(async(root,dir)=>{
 await fs.writeFile(path.join(dir,'reserved.md'),article('reserved').replace('tags: [Example]','tags: [Example]\nlabs: [fake]'));
 await assert.rejects(loadContent(root),/reserved for rendered experiment metadata/);
}));
