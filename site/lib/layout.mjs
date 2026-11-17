import path from 'node:path';
import { escape as e } from './content.mjs';

export const relative = (from,target) => path.posix.relative(path.posix.dirname(from),target) || path.posix.basename(target);
export function layout({title,description,body,current='home',url='index.html',article=false}) {
 const link=target=>relative(url,target);
 const nav=[['home','index.html','首页'],['courses','courses.html','课程与专题'],['library','library.html','知识库'],['labs','labs.html','实验室'],['map','map.html','知识地图']];
 return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${e(description)}"><meta name="theme-color" content="#326947"><meta property="og:title" content="${e(title)} · AI Learning Notes"><meta property="og:description" content="${e(description)}"><title>${e(title)} · AI Learning Notes</title>${article?`<link rel="stylesheet" href="${link('assets/lesson.css')}"><script defer src="${link('assets/lesson.js')}"></script>`:''}<link rel="stylesheet" href="${link('assets/site.css')}"><link rel="stylesheet" href="${link('assets/lecture2.css')}"><script defer src="${link('assets/site.js')}"></script></head><body><a class="skip" href="#main">跳到正文</a><div class="wrap"><header class="topbar"><a class="brand" href="${link('index.html')}"><span class="brand-mark">a.</span><span>AI Learning Notes</span></a><nav class="topnav" aria-label="主导航">${nav.map(([key,target,label])=>`<a ${key===current?'aria-current="page"':''} href="${link(target)}">${label}</a>`).join('')}</nav></header><main id="main">${body}</main><footer class="footer"><span>AI Learning Notes · 一起把 AI 学明白</span><div><a href="${link('courses.html')}">学习路线</a><a href="${link('library.html')}">知识索引</a><span>个人整理 · 非官方课程站</span></div></footer></div></body></html>`;
}
export const heading=(eyebrow,title,description)=>`<div class="page-heading"><div class="eyebrow">${e(eyebrow)}</div><h1>${e(title)}</h1><p>${e(description)}</p></div>`;
export function collectionCard(collection,articles,from) {
 const count=articles.filter(a=>a.collection===collection.slug).length;
 return `<article class="card" data-category="${e(collection.kind)}"><div class="card-top"><span class="iconbox">${e(collection.icon)}</span><span class="pill">${e(collection.label)}</span></div><h2><a href="${relative(from,`collections/${collection.slug}.html`)}">${e(collection.title)}</a></h2><p>${e(collection.description)}</p><div class="card-bottom"><span>${count} 篇${collection.kind==='framework'?' · 已有导读，教程持续补充':' · 按讲次持续整理'}</span><a class="text-link" href="${relative(from,`collections/${collection.slug}.html`)}">开始阅读 →</a></div></article>`;
}
export function articleCard(article,from,collectionTitle='') {
 return `<article class="card article-card" data-search="${e([article.title,article.description,...article.tags,collectionTitle].join(' ').toLowerCase())}"><div class="eyebrow">${e(collectionTitle)}</div><h2><a href="${relative(from,article.url)}">${e(article.title)}</a></h2><p>${e(article.description)}</p><div class="card-bottom"><span>${article.tags.slice(0,2).map(t=>`<span class="tag">${e(t)}</span>`).join(' ')}</span><a class="text-link" href="${relative(from,article.url)}">阅读 →</a></div></article>`;
}
