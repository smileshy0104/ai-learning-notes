import path from 'node:path';
import { escape as e } from './content.mjs';
import { t, htmlLang, otherLang, langPrefix, pack, pick, countOf } from './i18n.mjs';

// 与 `git remote get-url origin` 对应；换仓库或换用户名时只改这里。
export const REPO_URL = 'https://github.com/smileshy0104/ai-learning-notes';

export const relative = (from,target) => path.posix.relative(path.posix.dirname(from),target) || path.posix.basename(target);
export function layout({title,description,body,current='home',url='index.html',article=false,lecture,lang='zh',alternate=null}) {
 const s=t(lang);
 const link=target=>relative(url,target);
 const prefix=langPrefix(lang);
 const home=prefix+'index.html',courses=prefix+'courses.html',library=prefix+'library.html',labs=prefix+'labs.html',map=prefix+'map.html';
 const nav=[['home',home,s.nav.home],['courses',courses,s.nav.courses],['library',library,s.nav.library],['labs',labs,s.nav.labs],['map',map,s.nav.map]];
 // Only the article's own lecture stylesheet ships; lecture 1 keeps the original lesson.css components.
 const ownLecture=Number.isInteger(lecture)&&lecture>=2?[link(`assets/lecture${lecture}.css`)]:[];
 const styles=[...(article?[link('assets/lesson.css')]:[]),link('assets/site.css'),...ownLecture];
 const scripts=[...(article?[link('assets/lesson.js')]:[]),link('assets/site.js')];
 // 语言切换只在与本文对应的另一语言版本存在时出现（英文页总能回到中文原文）。
 const switchLink=alternate
  ?`<a class="lang-switch" href="${link(alternate)}" hreflang="${htmlLang(otherLang(lang))}" lang="${htmlLang(otherLang(lang))}" title="${e(s.switchTitle)}">${e(s.switchLabel)}</a>`
  :'';
 const ui=[`data-lang="${lang}"`,`data-search-index="search${lang==='en'?'.en':''}.json"`,`data-theme-labels="${e(pack(s.themeLabels))}"`,`data-theme-aria="${e(s.themeAria)}"`,`data-i18n-copied="${e(s.copied)}"`,`data-i18n-copy-failed="${e(s.copyFailed)}"`,`data-i18n-count="${e(s.cards.articles)}"`,`data-i18n-empty="${e(s.library.empty)}"`,`data-attn-names="${e(pack(s.attnNames))}"`].join(' ');
 return `<!doctype html><html lang="${htmlLang(lang)}" ${ui}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${e(description)}"><meta name="theme-color" content="#326947" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#0e1310" media="(prefers-color-scheme: dark)"><link rel="icon" type="image/svg+xml" href="${link('assets/icon.svg')}"><link rel="icon" type="image/png" sizes="32x32" href="${link('assets/icon-32.png')}"><link rel="apple-touch-icon" href="${link('assets/icon-180.png')}"><script src="${link('assets/theme.js')}"></script><meta property="og:title" content="${e(title)} · AI Learning Notes"><meta property="og:description" content="${e(description)}"><title>${e(title)} · AI Learning Notes</title>${styles.map(href=>`<link rel="stylesheet" href="${href}">`).join('')}${scripts.map(src=>`<script defer src="${src}"></script>`).join('')}</head><body><a class="skip" href="#main">${e(s.skip)}</a><div class="wrap"><header class="topbar"><a class="brand" href="${link(home)}"><span class="brand-mark">a.</span><span>AI Learning Notes</span></a><div class="topbar-tools"><nav class="topnav" aria-label="${e(s.navLabel)}">${nav.map(([key,target,label])=>`<a ${key===current?'aria-current="page"':''} href="${link(target)}">${e(label)}</a>`).join('')}</nav>${switchLink}<button class="theme-toggle" type="button" data-theme-toggle hidden><span aria-hidden="true" data-theme-icon>◐</span><span class="theme-label" data-theme-label>${e(s.themeLabels[0])}</span></button><a class="icon-link" href="${REPO_URL}" target="_blank" rel="noopener noreferrer" aria-label="${lang==='en'?'View this repository on GitHub':'在 GitHub 上查看本仓库源码'}" title="${lang==='en'?'GitHub repository':'GitHub 仓库'}"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" fill="currentColor"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/></svg></a></div></header><main id="main">${body}</main><footer class="footer"><span>${e(s.footerBrand)}</span><div><a href="${link(courses)}">${e(s.footerPaths)}</a><a href="${link(library)}">${e(s.footerIndex)}</a><span>${e(s.footerNote)}</span></div></footer></div></body></html>`;
}
export const heading=(eyebrow,title,description)=>`<div class="page-heading"><div class="eyebrow">${e(eyebrow)}</div><h1>${e(title)}</h1><p>${e(description)}</p></div>`;
export function collectionCard(collection,articles,from,lang='zh') {
 const s=t(lang),prefix=langPrefix(lang);
 const count=articles.filter(a=>a.collection===collection.slug&&a.lang===lang).length;
 const target=prefix+`collections/${collection.slug}.html`;
 const tail=collection.kind==='framework'?s.cards.framework:s.cards.course;
 const label=lang==='zh'?collection.label:collection.labelEn??collection.label;
 return `<article class="card" data-category="${e(collection.kind)}"><div class="card-top"><span class="iconbox">${e(collection.icon)}</span><span class="pill">${e(label)}</span></div><h2><a href="${relative(from,target)}">${e(pick(collection,'title',lang))}</a></h2><p>${e(pick(collection,'description',lang))}</p><div class="card-bottom"><span>${countOf(s.cards.articles,count)}${tail}</span><a class="text-link" href="${relative(from,target)}">${e(s.cards.start)}</a></div></article>`;
}
export function articleCard(article,from,collectionTitle='') {
 const s=t(article.lang);
 return `<article class="card article-card" data-search="${e([article.title,article.description,...article.tags,collectionTitle].join(' ').toLowerCase())}"><div class="eyebrow">${e(collectionTitle)}</div><h2><a href="${relative(from,article.url)}">${e(article.title)}</a></h2><p>${e(article.description)}</p><div class="card-bottom"><span>${article.tags.slice(0,2).map(t=>`<span class="tag">${e(t)}</span>`).join(' ')}</span><a class="text-link" href="${relative(from,article.url)}">${e(s.cards.read)}</a></div></article>`;
}
