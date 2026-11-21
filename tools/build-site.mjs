import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../site/lib/content.mjs';
import { buildPages } from '../site/lib/build-pages.mjs';
import { layout } from '../site/lib/layout.mjs';
import { LANGS, langPrefix } from '../site/lib/i18n.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const data = await loadContent(root);
const pages = buildPages(data);

// Preserve addresses used in the first preview without maintaining parallel themes.
for (const [alias, target] of [['course.html', 'courses.html'], ['docs.html', 'library.html'], ['basics.html', 'topics/cme295/basics.html']]) {
  pages.set(alias, layout({title:'页面入口已整理',description:'继续访问统一学习站。',url:alias,body:`<div class="page-heading"><h1>学习内容有了新的位置</h1><p>继续访问统一风格的课程与知识页。</p><div class="hero-actions"><a class="btn primary" href="${target}">继续阅读 →</a></div></div>`}));
}

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
for (const [url, html] of pages) {
  const file = path.join(output, url);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, html);
}
await fs.cp(path.join(root, 'site/assets'), path.join(output, 'assets'), { recursive: true });

// Each language gets its own search index; site.js resolves the filename from <html data-search-index>.
for (const lang of LANGS) {
  const index = data.articles.filter(a => a.lang === lang).map(a => ({
    url: path.posix.relative(path.posix.dirname(`${langPrefix(lang)}library.html`), a.url) || a.url,
    title: a.title,
    text: [a.title, a.description, ...a.tags, a.text].join(' ').toLocaleLowerCase(),
  }));
  await fs.writeFile(path.join(output, 'assets', lang === 'zh' ? 'search.json' : `search.${lang}.json`), JSON.stringify(index));
}
await fs.writeFile(path.join(output, 'site-manifest.json'), JSON.stringify({
  pages: [...pages.keys()],
  articles: data.articles.map(a => ({ url: a.url, collection: a.collection, slug: a.slug, lang: a.lang })),
}, null, 2));
console.log(`Built bilingual learning site: ${pages.size} pages, ${data.collections.length} collections, ${data.articles.length} articles (${data.articles.filter(a => a.lang === 'en').length} in English).`);
