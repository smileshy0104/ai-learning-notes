import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
 // 第一讲的 4 个图解在 labs() 里静态登记，因此这里也要提供它们所属的文章。
 const demo=['basics','tokens','mask','attention'];
 catalog.lectures=[{collection:'cme295',number:6,title:'Sixth',pages:1,chapters:['metrics']},
  {collection:'cme295',number:1,title:'First',pages:1,chapters:demo}];
 await fs.writeFile(catalogFile,JSON.stringify(catalog));
 const courseDir=path.join(root,'content/collections/cme295');
 await fs.mkdir(courseDir,{recursive:true});
 await fs.writeFile(path.join(courseDir,'metrics.md'),article('metrics').replace('collection: new-course','collection: cme295\nlecture: 6').replace('## Example','<!-- lab:l6-metrics -->\n\n## Example'));
 for(const slug of demo) await fs.writeFile(path.join(courseDir,`${slug}.md`),article(slug).replace('collection: new-course','collection: cme295\nlecture: 1'));
 await fs.rm(dir,{recursive:true,force:true});
 const data=await loadContent(root);
 assert.equal(data.labs.length,1);
 assert.equal(data.labs[0].name,'l6-metrics');
 assert(data.labs[0].title.startsWith('实验：'),data.labs[0].title);
 const page=labsPage(data);
 assert(page.includes(`href="${data.labs[0].url}"`));
 assert(page.includes('First'),'第一讲分组未使用 catalog 标题');
 assert(page.includes('4 个实验'),'第一讲分组计数未渲染');
 for(const slug of demo) assert(page.includes(`href="topics/cme295/${slug}.html"`),`图解卡片缺少 ${slug}`);
}));
test('a lab marker without its lecture prefix fails instead of falling back',()=>fixture(async(root,dir)=>{
 await fs.writeFile(path.join(dir,'lab.md'),article('lab').replace('## Example','<!-- lab:metrics -->\n\n## Example'));
 await assert.rejects(loadContent(root),/Unknown lab: metrics/);
}));
test('cme295 articles must declare their lecture and register in catalog.lectures',()=>fixture(async(root,dir)=>{
 const catalogFile=path.join(root,'content/catalog.json');
 const catalog=JSON.parse(await fs.readFile(catalogFile,'utf8'));
 catalog.collections[0].slug='cme295';
 catalog.collections[0].lectures=true;
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
test('an article without section headings renders no empty table of contents',()=>fixture(async(root,dir)=>{
 await fs.writeFile(path.join(dir,'flat.md'),article('flat').replace('## Motivation\n\nA complete explanation.\n\n## Example\n\nA worked example.','Only one flat paragraph.'));
 const data=await loadContent(root);
 assert.equal(data.articles[0].headings.length,0);
 const html=articlePage(data,data.articles[0]);
 assert(!html.includes('本页目录'),'empty table of contents rendered');
 assert(html.includes('Only one flat paragraph.'));
}));
test('every lecture overview links to each chapter of its lecture',async()=>{
 const data=await loadContent(fileURLToPath(new URL('../',import.meta.url)));
 for(const lecture of data.lectures){
  const overview=data.articles.find(a=>a.lang==='zh'&&a.collection===lecture.collection&&a.lecture===lecture.number&&(a.slug===`l${lecture.number}-overview`||a.slug==='introduction'));
  assert(overview,`lecture ${lecture.number} has no overview page`);
  for(const slug of lecture.chapters){
   if(slug===overview.slug)continue;
   assert(overview.html.includes(`href="${slug}.html"`),`${overview.slug} does not link to ${slug}`);
  }
 }
});

const bilingual = (root, collection = 'cme295') => `---
slug: intro
title: "导读"
collection: ${collection}
lecture: 1
description: "中文简介"
order: 10
kind: lesson
status: published
tags: [Intro]
---

<section><h2 id="part-2">一</h2><p>中文正文。</p></section>
`;
const english = (overrides = '') => `---
slug: intro
title: "Introduction"
collection: cme295
lecture: 1
lang: en
description: "English description"
order: 10
kind: lesson
status: published
tags: [Intro]
${overrides}---

<section><h2 id="part-2">One</h2><p>English body.</p></section>
`;
async function bilingualRoot(run) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bilingual-'));
  try {
    const dir = path.join(root, 'content/collections/cme295');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(root, 'content/catalog.json'), JSON.stringify({
      site: {}, chapters: [],
      collections: [{ slug: 'cme295', title: 'Course', kind: 'course', label: 'Course', description: 'd', icon: '+', lectures: true }],
      lectures: [{ collection: 'cme295', number: 1, title: 'First', pages: 10, chapters: ['intro'] }],
    }));
    await fs.writeFile(path.join(dir, 'intro.md'), bilingual(root));
    await run(root, dir);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
}

test('english articles mirror the chinese original and live under /en/', () => bilingualRoot(async (root, dir) => {
  await fs.writeFile(path.join(dir, 'intro.en.md'), english());
  const data = await loadContent(root);
  const zh = data.articles.find(a => a.lang === 'zh');
  const en = data.articles.find(a => a.lang === 'en');
  assert.equal(zh.url, 'topics/cme295/intro.html');
  assert.equal(en.url, 'en/topics/cme295/intro.html');
  assert.equal(en.alternate, zh.url);
  assert.equal(zh.alternate, en.url);
  assert.equal(labsPage(data, 'en').includes('lang-switch'), true);
  assert(collectionPage(data, data.collections[0], 'en').includes('1 published'));
}));

test('an english article without its chinese original fails', () => bilingualRoot(async (root, dir) => {
  await fs.writeFile(path.join(dir, 'intro.en.md'), english());
  await fs.unlink(path.join(dir, 'intro.md'));
  await assert.rejects(loadContent(root), /English article has no Chinese original/);
}));

test('english metadata must match the chinese original and use a known language', () => bilingualRoot(async (root, dir) => {
  await fs.writeFile(path.join(dir, 'intro.en.md'), english().replace('order: 10', 'order: 99'));
  await assert.rejects(loadContent(root), /order must match the Chinese original/);
  await fs.writeFile(path.join(dir, 'intro.en.md'), english().replace('lecture: 1', 'lecture: 2'));
  await assert.rejects(loadContent(root), /lecture must match the Chinese original/);
  await fs.writeFile(path.join(dir, 'intro.en.md'), english().replace('lang: en', 'lang: fr'));
  await assert.rejects(loadContent(root), /unsupported lang fr/);
}));

test('a new chinese chapter without an english version is blocked by the backlog', async () => {
  await bilingualRoot(async (root) => {
    const backlog = path.join(root, 'content/translations.json');
    await fs.writeFile(backlog, JSON.stringify({ pending: [] }));
    await assert.rejects(loadContent(root), /必须同时提供英文版/);
    await fs.writeFile(backlog, JSON.stringify({ pending: ['cme295/intro'] }));
    await loadContent(root);
    await fs.writeFile(path.join(root, 'content/collections/cme295/intro.en.md'), english());
    await assert.rejects(loadContent(root), /已有英文版，请删除该条目/);
  });
});

test('the real repository keeps its translation backlog in sync', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const backlog = JSON.parse(await fs.readFile(path.join(root, 'content/translations.json'), 'utf8'));
  assert(Array.isArray(backlog.pending), 'translations.json 必须包含 pending 数组');
  assert.deepEqual(backlog.pending, [...backlog.pending].sort(), 'pending 必须按字母序排列');
  const data = await loadContent(root);
  const pending = data.articles
    .filter(a => a.lang === 'zh' && !a.alternate)
    .map(a => `${a.collection}/${a.slug}`)
    .sort();
  assert.deepEqual(backlog.pending, pending, 'translations.json 与实际的待译集合不一致');
});

// 译文完整性：结构、锚点、数字必须与中文原文一一对应，避免"翻了但漏了"。
const shape = article => {
  const text = article.html.replace(/<[^>]+>/g, ' ');
  const headings = [...article.html.matchAll(/<h[2-4] id="([^"]+)"/g)].map(m => m[1]);
  const links = [...article.html.matchAll(/href="([^"#][^"]*)"/g)]
    .map(m => m[1]).filter(href => !/^(https?:|mailto:|tel:)/.test(href)).map(href => href.split('/').pop()).sort();
  const anchors = [...article.html.matchAll(/href="#([^"]+)"/g)].map(m => m[1]).sort();
  // 数字按「值」比较：6500 万与 65 million 视为同一个量。
  const scale = { 万: 1e4, 亿: 1e8, thousand: 1e3, million: 1e6, billion: 1e9 };
  const numbers = [...new Set([...text.replace(/[−–—]/g, '-').matchAll(/(\d+(?:\.\d+)?)\s*(万|亿|thousand|million|billion)?/g)]
    .map(m => (Number(m[1]) * (scale[m[2]] ?? 1)).toPrecision(12).replace(/0+$/, '').replace(/\.$/, '')))].sort();
  return {
    headings,
    tables: (article.html.match(/<table/g) ?? []).length,
    details: (article.html.match(/<details/g) ?? []).length,
    labs: article.labs.map(l => l.name).sort(),
    links, anchors, numbers,
  };
};

test('every translation mirrors the chinese structure, links and numbers', async () => {
  const data = await loadContent(fileURLToPath(new URL('../', import.meta.url)));
  const pairs = data.articles.filter(a => a.lang === 'zh' && a.alternate);
  for (const zh of pairs) {
    const en = data.articles.find(a => a.url === zh.alternate);
    const a = shape(zh), b = shape(en);
    assert.deepEqual(b.headings, a.headings, `${en.slug}: 标题 id 与中文版不一致`);
    assert.equal(b.tables, a.tables, `${en.slug}: 表格数量不一致`);
    assert.equal(b.details, a.details, `${en.slug}: 折叠块数量不一致`);
    assert.deepEqual(b.labs, a.labs, `${en.slug}: 实验标记不一致`);
    assert.deepEqual(b.links, a.links, `${en.slug}: 站内链接目标不一致`);
    assert.deepEqual(b.anchors, a.anchors, `${en.slug}: 页内锚点不一致`);
    const missing = a.numbers.filter(n => !b.numbers.includes(n));
    assert.deepEqual(missing, [], `${en.slug}: 译文缺少这些数字 ${missing.join(', ')}`);
    assert(!en.text.includes('**'), `${en.slug}: 未渲染的 Markdown 强调`);
    assert(!en.text.includes(']('), `${en.slug}: 未渲染的 Markdown 链接`);
  }
  assert(pairs.length > 0, '没有找到任何译文对照');
});

test('a blank line inside an svg block is rejected', async () => {
  await bilingualRoot(async (root, dir) => {
    const withSvg = `---
slug: intro
title: "导读"
collection: cme295
lecture: 1
description: "d"
order: 10
kind: lesson
status: published
tags: [Intro]
---

<section><h2 id="part-2">一</h2>
<svg viewBox="0 0 10 10"><rect width="10" height="10"/>

<circle cx="5" cy="5" r="2"/></svg>
</section>
`;
    await fs.writeFile(path.join(dir, 'intro.md'), withSvg);
    await assert.rejects(loadContent(root), /<svg> 块内出现空行/);
  });
});

test('lecture-1 base diagrams exist in both languages and appear on the labs page', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const data = await loadContent(root);
  const { labs: labsPage } = await import('../site/lib/pages.mjs');
  for (const lang of ['zh', 'en']) {
    const page = labsPage(data, lang);
    for (const slug of ['basics', 'tokens', 'mask', 'attention']) {
      const article = data.articles.find(a => a.collection === 'cme295' && a.slug === slug && a.lang === lang);
      assert(article, `${lang}: 缺少第一讲图解文章 ${slug}`);
      assert(page.includes(slug + '.html'), `${lang} 实验室页缺少 ${slug} 卡片`);
    }
  }
});
