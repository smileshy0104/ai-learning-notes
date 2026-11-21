import { escape as e } from './content.mjs';
import { layout, heading, collectionCard, articleCard, relative } from './layout.mjs';
import { t, pick, langPrefix, fill, counterpart, countOf } from './i18n.mjs';

const published = (data, lang) => data.articles.filter(a => a.lang === lang);

export function home(data, lang = 'zh') {
 const s = t(lang), prefix = langPrefix(lang);
 const first = 'basics';
 const cards = ['basics', 'tokens', 'attention'];
 const url = prefix + 'index.html', link = target => relative(url, target);
 const body = `<section class="hero"><div><div class="eyebrow">${e(s.home.eyebrow)}</div><h1>${s.home.h1}</h1><p>${e(s.home.intro)}</p><div class="hero-actions"><a class="btn primary" href="${link(prefix + `topics/cme295/${first}.html`)}">${e(s.home.start)}</a><a class="btn" href="${link(prefix + 'courses.html')}">${e(s.home.browse)}</a></div><div class="meta">${e(s.home.meta)}</div></div><div class="hero-art"><span class="eyebrow">${e(s.home.artEyebrow)}</span><div class="diagram-path"><div class="row"><span>${e(s.home.artRows[0])}</span><span>${e(s.home.artRows[1])}</span></div><i>↓</i><span class="core">${e(s.home.artCore)}</span><i>↓</i><div class="row"><span>${e(s.home.artRows[2])}</span><span>${e(s.home.artRows[3])}</span></div></div><a class="text-link" href="${link(prefix + 'map.html')}">${e(s.home.artLink)}</a></div></section><section class="section-space"><div class="section-top"><div><div class="eyebrow">Learning collections</div><h2>${e(s.home.sectionTitle)}</h2><p>${e(s.home.sectionNote)}</p></div><a class="text-link" href="${link(prefix + 'courses.html')}">${e(s.home.sectionLink)}</a></div><div class="grid2">${data.collections.map(c => collectionCard(c, data.articles, prefix + 'index.html', lang)).join('')}</div></section><section class="banner"><div><h2>${e(s.home.bannerTitle)}</h2><p>${e(s.home.bannerNote)}</p></div><a class="btn primary" href="${link(prefix + 'labs.html')}">${e(s.home.bannerLink)}</a></section><section class="section-space"><div class="section-top"><div><div class="eyebrow">Start here</div><h2>${e(s.home.startTitle)}</h2></div></div><div class="grid3">${cards.map(slug => articleCard(published(data, lang).find(a => a.collection === 'cme295' && a.slug === slug), prefix + 'index.html', s.home.firstLecture)).join('')}</div></section>`;
 return layout({ lang, title: s.home.title, description: pick(data.site, 'description', lang), url, alternate: counterpart(prefix + 'index.html'), body });
}

export function courses(data, lang = 'zh') {
 const s = t(lang), prefix = langPrefix(lang);
 const body = heading('Learning collections', s.courses.title, s.courses.heading) + `<div class="filter-bar" data-filter-group><span>${e(s.courses.filter)}</span><div class="choice-tabs"><button data-filter="all" aria-pressed="true">${e(s.courses.all)}</button><button data-filter="course" aria-pressed="false">${e(s.courses.kindCourse)}</button><button data-filter="framework" aria-pressed="false">${e(s.courses.kindFramework)}</button></div></div><div class="grid2">${data.collections.map(c => collectionCard(c, data.articles, prefix + 'courses.html', lang)).join('')}</div><p class="note">${e(s.courses.note)}</p>`;
 return layout({ lang, title: s.courses.title, description: s.courses.description, current: 'courses', url: prefix + 'courses.html', alternate: counterpart(prefix + 'courses.html'), body });
}

export function collectionPage(data, collection, lang = 'zh') {
 const s = t(lang), prefix = langPrefix(lang);
 const url = `${prefix}collections/${collection.slug}.html`;
 const items = published(data, lang).filter(a => a.collection === collection.slug);
 const lectures = (data.lectures ?? []).filter(l => l.collection === collection.slug);
 const row = (a, i) => `<a class="reading-row" href="${relative(url, a.url)}"><span class="row-number">${String(i + 1).padStart(2, '0')}</span><div><h2>${e(a.title)}</h2><p>${e(a.description)}</p></div><span class="row-arrow">→</span></a>`;
 const groups = lectures
  .map(l => ({ lecture: l, items: items.filter(a => a.lecture === l.number) }))
  .filter(group => group.items.length > 0)
  .map(group => `<section class="lecture-group" id="lecture-${group.lecture.number}"><div class="section-top"><div><div class="eyebrow">Lecture ${group.lecture.number}</div><h2>${e(pick(group.lecture, 'title', lang))}</h2><p>${e(pick(group.lecture, 'description', lang))}</p></div><span class="pill">${fill(s.collection.pdfPages, { n: group.lecture.pages })}</span></div><div class="reading-list">${group.items.map(row).join('')}</div></section>`)
  .join('');
 const listing = lectures.length ? groups : `<div class="reading-list">${items.map(row).join('')}</div>`;
 const empty = lang !== 'zh' && !items.length
  ? `<p class="note">${e(s.collection.emptyEn)} <a class="text-link" href="${relative(url, `collections/${collection.slug}.html`)}">${e(s.collection.readZh)}</a></p>`
  : '';
 const edition = pick(collection, 'edition', lang);
 return layout({ lang, title: pick(collection, 'title', lang), description: pick(collection, 'description', lang), current: 'courses', url, alternate: counterpart(url), body: `<div class="breadcrumb"><a href="${relative(url, prefix + 'courses.html')}">${e(s.courses.title)}</a><span>/</span><span>${e(pick(collection, 'title', lang))}</span></div>` + heading(pick(collection, 'label', lang), pick(collection, 'title', lang), pick(collection, 'description', lang)) + `<div class="collection-meta"><span class="pill">${fill(s.collection.published, { n: items.length })}</span>${edition ? `<span>${e(edition)}</span>` : `<span>${e(s.collection.frameworkNote)}</span>`}</div>${empty}${listing}` });
}

export function library(data, lang = 'zh') {
 const s = t(lang), prefix = langPrefix(lang);
 const items = published(data, lang);
 const names = new Map(data.collections.map(c => [c.slug, pick(c, 'title', lang)]));
 return layout({ lang, title: s.library.title, description: s.library.description, current: 'library', url: prefix + 'library.html', alternate: counterpart(prefix + 'library.html'), body: heading('Knowledge library', s.library.title, s.library.heading) + `<form class="search" role="search" data-library-search><label for="knowledge-query">⌕ <span class="sr-only">${e(s.library.label)}</span></label><input id="knowledge-query" type="search" placeholder="${e(s.library.placeholder)}" autocomplete="off"><span class="search-count" role="status">${countOf(s.cards.articles, items.length)}</span></form><noscript><p class="note">${e(s.library.noscript)}</p></noscript><div class="grid3 library-grid">${items.map(a => articleCard(a, prefix + 'library.html', names.get(a.collection))).join('')}</div><p class="empty" hidden data-empty>${e(s.library.empty)}</p>` });
}

export function articlePage(data, article) {
 const lang = article.lang, s = t(lang), prefix = langPrefix(lang);
 const url = article.url;
 const c = data.collections.find(c => c.slug === article.collection);
 const siblings = published(data, lang).filter(a => a.collection === article.collection && a.lecture === article.lecture);
 const lectureLabel = article.lecture ? fill(s.article.lecture, { n: article.lecture }) : s.article.gettingStarted;
 const index = siblings.indexOf(article);
 const prev = siblings[index - 1], next = siblings[index + 1];
 const collectionUrl = `${prefix}collections/${c.slug}.html`;
 const sidebar = `<aside class="sidebar"><a class="sidebar-back" href="${relative(url, collectionUrl)}">← ${e(pick(c, 'title', lang))}</a><nav aria-label="${e(s.article.sidebarLabel)}">${siblings.map(a => `<a href="${relative(url, a.url)}" ${a === article ? 'aria-current="page"' : ''}>${e(a.title)}</a>`).join('')}</nav></aside>`;
 // 没有二三级标题时不要渲染空目录盒；桌面栅格列宽固定，省略后正文宽度不变。
 const toc = article.headings.length ? `<aside class="toc"><strong>${e(s.article.toc)}</strong><nav aria-label="${e(s.article.toc)}">${article.headings.map(h => `<a href="#${e(h.id)}" class="toc-level-${h.level}">${e(h.title)}</a>`).join('')}</nav></aside>` : '';
 const body = `<div class="breadcrumb"><a href="${relative(url, prefix + 'courses.html')}">${e(s.courses.title)}</a><span>/</span><a href="${relative(url, collectionUrl)}">${e(pick(c, 'title', lang))}</a></div><div class="reading-layout">${sidebar}<article class="article"><header class="article-heading"><div class="eyebrow">${e(pick(c, 'label', lang))} / ${e(lectureLabel)}</div><h1>${e(article.title)}</h1><p>${e(article.description)}</p><div class="meta">${article.tags.map(tag => `<span>${e(tag)}</span>`).join('')}<button class="copy-link" data-copy-link type="button">${e(s.article.copyLink)}</button><span role="status" data-copy-status></span></div></header><div class="lesson-content">${article.html}</div><nav class="pager" aria-label="${e(s.article.pagerLabel)}">${prev ? `<a href="${relative(url, prev.url)}"><small>${e(s.article.previous)}</small>${e(prev.title)} ←</a>` : `<a href="${relative(url, collectionUrl)}">${e(s.article.collectionIndex)}</a>`}${next ? `<a href="${relative(url, next.url)}"><small>${e(s.article.next)}</small>${e(next.title)} →</a>` : `<a href="${relative(url, prefix + 'library.html')}">${e(s.article.explore)}</a>`}</nav></article>${toc}</div>`;
 return layout({ lang, title: article.title, description: article.description, current: 'library', url, article: true, lecture: article.lecture, alternate: article.alternate, body });
}

export function labs(data, lang = 'zh') {
 const s = t(lang), prefix = langPrefix(lang);
 const url = prefix + 'labs.html', link = target => relative(url, target);
 const owned = (data.labs ?? []).filter(lab => lab.lang === lang);
 const demo = [['a', [40.11, 19.78, 40.11], '0.802, 0.797'], ['b', [76.79, 4.54, 18.67], '0.955, 0.277'], ['c', [33.33, 33.33, 33.33], '0.667, 1.000']]
  .map(([id, weights, result]) => `<div class="lab-panel panel-${id}"><div class="lab-bars">${weights.map((w, i) => `<div class="bar-row"><span>${e(s.labs.demoWords[i])}</span><div class="track"><div class="fill" style="width:${w}%"></div></div><span>${w}%</span></div>`).join('')}</div><div class="lab-output">${lang === 'zh' ? '输出向量 ≈' : 'Output vector ≈'} [${result}]</div></div>`).join('');
 // 英文版尚无 attention 章节时，"阅读完整解释"指向中文原文。
 const explanation = data.articles.find(a => a.collection === 'cme295' && a.slug === 'attention' && a.lang === lang) ?? data.articles.find(a => a.collection === 'cme295' && a.slug === 'attention' && a.lang === 'zh');
 const demoHref = link(explanation ? explanation.url : prefix + 'collections/cme295.html');
 const demoSection = `<section class="lab"><div class="lab-header"><div><span class="eyebrow">${e(s.labs.eyebrow)}</span><h2>${e(s.labs.demoTitle)}</h2></div><a class="text-link" href="${demoHref}">${e(s.labs.demoLink)}</a></div><div class="switch attention-lab"><input id="lab-a" type="radio" name="lab-q" checked><input id="lab-b" type="radio" name="lab-q"><input id="lab-c" type="radio" name="lab-q"><div class="controls"><label for="lab-a">Q = [1,0]</label><label for="lab-b">Q = [2,−2]</label><label for="lab-c">Q = [0,0]</label></div>${demo}<p>${e(s.labs.demoNote)}</p></div></section>`;
 const groups = (data.lectures ?? []).map(l => {
  const items = owned.filter(lab => lab.collection === l.collection && lab.lecture === l.number);
  if (!items.length) return '';
  return `<section class="section-space"><div class="section-top"><div><div class="eyebrow">Lecture ${l.number}</div><h2>${e(pick(l, 'title', lang))}</h2><p>${e(pick(l, 'description', lang))}</p></div><span class="pill">${countOf(s.labs.groupCount, items.length)}</span></div><div class="grid3">${items.map(lab => `<a class="card" href="${relative(prefix + 'labs.html', lab.url)}"><h2>${e(lab.title)}</h2><p>${e(fill(s.labs.cardNote, { title: lab.articleTitle }))}</p></a>`).join('')}</div></section>`;
 }).join('');
 const total = owned.length + s.labs.baseCards.length;
 const headingBlock = total
  ? `<section class="section-space"><div class="section-top"><div><div class="eyebrow">${e(s.labs.all)}</div><h2>${fill(s.labs.allTitle, { n: total })}</h2><p>${e(s.labs.allNote)}</p></div><a class="text-link" href="${link(prefix + 'collections/cme295.html')}">${e(s.labs.courseIndex)}</a></div></section>`
  : `<section class="section-space"><div class="section-top"><div><div class="eyebrow">${e(s.labs.all)}</div><h2>${e(s.labs.title)}</h2><p>${e(s.labs.empty)} <a class="text-link" href="${link('labs.html')}">${e(s.labs.emptyLink)}</a></p></div></div></section>`;
 return layout({ lang, title: s.labs.title, description: s.labs.description, current: 'labs', url, alternate: counterpart(prefix + 'labs.html'), body: heading('Interactive learning', s.labs.title, s.labs.heading) + demoSection + headingBlock + firstLectureGroup(data, s, lang) + groups });
}

// 第一讲的 4 个图解来自早期课程笔记，正文里没有 <!-- lab --> 标记，因此在这里静态登记。
// 卡片标题与说明沿用注册实验的句式，出处文章标题取自 frontmatter，避免两处维护。
function firstLectureGroup(data, s, lang) {
 const base = s.labs.baseCards;
 // 语言没有对应译文时回退到中文原文；两处都没有才跳过（真实仓库由测试保证四篇都存在）。
 const cards = base.map(([slug, title]) => {
  const article = data.articles.find(a => a.collection === 'cme295' && a.slug === slug && a.lang === lang)
   ?? data.articles.find(a => a.collection === 'cme295' && a.slug === slug && a.lang === 'zh');
  if (!article) return '';
  return `<a class="card" href="${relative(langPrefix(lang) + 'labs.html', article.url)}"><h2>${e(title)}</h2><p>${e(fill(s.labs.cardNote, { title: article.title }))}</p></a>`;
 }).join('');
 const first = (data.lectures ?? []).find(l => l.collection === 'cme295' && l.number === 1);
 if (!first) throw new Error('labs.html: catalog.lectures 缺少第一讲');
 return `<section class="section-space"><div class="section-top"><div><div class="eyebrow">Lecture 1</div><h2>${e(pick(first, 'title', lang))}</h2><p>${e(pick(first, 'description', lang))}</p></div><span class="pill">${countOf(s.labs.groupCount, base.length)}</span></div><div class="grid3">${cards}</div></section>`;
}

export function mapPage(data, lang = 'zh') {
 const s = t(lang), prefix = langPrefix(lang);
 const url = prefix + 'map.html', link = target => relative(url, target);
 const targets = ['topics/cme295/basics.html', 'topics/cme295/embedding.html', 'topics/cme295/attention.html', 'topics/cme295/architecture.html', 'collections/langgraph.html'];
 const body = heading('Connected knowledge', s.map.title, s.map.heading) + `<div class="knowledge-path">${s.map.nodes.map(([title, desc], i) => `<a class="path-node" href="${link(targets[i])}"><span class="path-index">${String(i + 1).padStart(2, '0')}</span><div><h2>${e(title)}</h2><p>${e(desc)}</p></div><span>↗</span></a>${i < s.map.nodes.length - 1 ? '<span class="path-arrow" aria-hidden="true">↓</span>' : ''}`).join('')}</div>${lang === 'zh' ? '' : `<p class="note">${e(s.map.note)}</p>`}<section class="section-space"><div class="section-top"><div><h2>${e(s.map.sectionTitle)}</h2><p>${e(s.map.sectionNote)}</p></div></div><div class="grid3">${data.collections.filter(c => c.kind === 'framework').map(c => collectionCard(c, data.articles, prefix + 'map.html', lang)).join('')}</div></section>`;
 return layout({ lang, title: s.map.title, description: s.map.description, current: 'map', url, alternate: counterpart(prefix + 'map.html'), body });
}
