import { LANGS, langPrefix, counterpart } from './i18n.mjs';
import { home, courses, collectionPage, library, articlePage, labs, mapPage } from './pages.mjs';
import { layout } from './layout.mjs';
import { t } from './i18n.mjs';

// 两种语言共用同一批模板；中文在根目录，英文在 /en/ 之下。
export function buildPages(data) {
  const pages = new Map();
  for (const lang of LANGS) {
    const s = t(lang), prefix = langPrefix(lang);
    const add = (file, html) => { if (pages.has(file)) throw new Error(`Duplicate page ${file}`); pages.set(file, html); };
    add(`${prefix}index.html`, home(data, lang));
    add(`${prefix}courses.html`, courses(data, lang));
    add(`${prefix}library.html`, library(data, lang));
    add(`${prefix}labs.html`, labs(data, lang));
    add(`${prefix}map.html`, mapPage(data, lang));
    for (const c of data.collections) add(`${prefix}collections/${c.slug}.html`, collectionPage(data, c, lang));
    for (const a of data.articles.filter(a => a.lang === lang)) add(a.url, articlePage(data, a));
    add(`${prefix}404.html`, layout({ lang, title: s.notFound.title, description: s.notFound.description, url: `${prefix}404.html`, alternate: counterpart(`${prefix}404.html`), body: `<div class="page-heading"><h1>${s.notFound.heading}</h1><p>${s.notFound.note}</p><div class="hero-actions"><a class="btn primary" href="${prefix ? 'courses.html' : 'courses.html'}">${s.notFound.courses}</a><a class="btn" href="library.html">${s.library.title}</a></div></div>` }));
  }
  return pages;
}
