import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadContent } from '../site/lib/content.mjs';
import { articlePage, collectionPage } from '../site/lib/pages.mjs';

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
test('duplicate article addresses fail before publishing',()=>fixture(async(root,dir)=>{
 await fs.writeFile(path.join(dir,'one.md'),article('same'));
 await fs.writeFile(path.join(dir,'two.md'),article('same'));
 await assert.rejects(loadContent(root),/duplicate article URL/);
}));
