import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../site/lib/content.mjs';
import { layout, relative } from '../site/lib/layout.mjs';
import { home, courses, library, collectionPage, articlePage, labs, mapPage } from '../site/lib/pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const data = await loadContent(root);
const pages = new Map([
 ['index.html',home(data)],['courses.html',courses(data)],['library.html',library(data)],
 ['labs.html',labs()],['map.html',mapPage(data)],
]);
for (const c of data.collections) pages.set(`collections/${c.slug}.html`,collectionPage(data,c));
for (const a of data.articles) pages.set(a.url,articlePage(data,a));
pages.set('404.html',layout({title:'页面不存在',description:'请从知识库或课程目录继续。',url:'404.html',body:'<div class="page-heading"><h1>这里还没有内容</h1><p>页面可能已经调整，可以从课程目录或知识库继续阅读。</p><div class="hero-actions"><a class="btn primary" href="courses.html">课程与专题 →</a><a class="btn" href="library.html">知识库</a></div></div>'}));
// Preserve addresses used in the first preview without maintaining parallel themes.
for (const [alias,target] of [['course.html','courses.html'],['docs.html','library.html'],['basics.html','topics/cme295/basics.html']]) {
 pages.set(alias,layout({title:'页面入口已整理',description:'继续访问统一学习站。',url:alias,body:`<div class="page-heading"><h1>学习内容有了新的位置</h1><p>继续访问统一风格的课程与知识页。</p><div class="hero-actions"><a class="btn primary" href="${relative(alias,target)}">继续阅读 →</a></div></div>`}));
}
await fs.rm(output,{recursive:true,force:true});
await fs.mkdir(output,{recursive:true});
for(const [url,html] of pages) {
 const file=path.join(output,url);
 await fs.mkdir(path.dirname(file),{recursive:true});
 await fs.writeFile(file,html);
}
await fs.cp(path.join(root,'site/assets'),path.join(output,'assets'),{recursive:true});
await fs.writeFile(path.join(output,'assets/search.json'),JSON.stringify(data.articles.map(a=>({url:a.url,title:a.title,text:[a.title,a.description,...a.tags,a.text].join(' ').toLocaleLowerCase()}))));
await fs.writeFile(path.join(output,'site-manifest.json'),JSON.stringify({pages:[...pages.keys()],articles:data.articles.map(a=>({url:a.url,collection:a.collection,slug:a.slug}))},null,2));
console.log(`Built unified learning site: ${pages.size} pages, ${data.collections.length} collections, ${data.articles.length} articles.`);
