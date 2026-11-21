import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

const root = fileURLToPath(new URL('../', import.meta.url));
const input = await fs.readFile(path.join(root, 'study-notes/cme295-fall2026/lecture-01-visual.html'), 'utf8');
const catalog = JSON.parse(await fs.readFile(path.join(root, 'content/catalog.json'), 'utf8'));
const document = parse(input, { sourceCodeLocationInfo: true });
const nodes = [];
function walk(node) { nodes.push(node); node.childNodes?.forEach(walk); }
walk(document);
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
const ids = new Map();
const replacements = [];
for (const chapter of catalog.chapters) {
  const section = nodes.find(node => node.tagName === 'section' && attr(node, 'id') === chapter.slug);
  if (!section) throw new Error(`Missing source section: ${chapter.slug}`);
  const loc = section.sourceCodeLocation;
  const headings = nodes.filter(n => /^h[234]$/.test(n.tagName ?? '') && n.sourceCodeLocation?.startOffset > loc.startOffset && n.sourceCodeLocation.endOffset < loc.endOffset);
  headings.forEach((node, i) => {
    let id = attr(node, 'id');
    if (!id) {
      id = `part-${i + 1}`;
      replacements.push({ start: node.sourceCodeLocation.startTag.endOffset - 1, end: node.sourceCodeLocation.startTag.endOffset - 1, value: ` id="${id}"` });
    }
  });
  for (const n of nodes) {
    const l = n.sourceCodeLocation;
    if (l && l.startOffset >= loc.startOffset && l.endOffset <= loc.endOffset && attr(n, 'id')) ids.set(attr(n, 'id'), chapter.slug);
  }
}
for (const chapter of catalog.chapters) {
  const section = nodes.find(n => n.tagName === 'section' && attr(n, 'id') === chapter.slug);
  const loc = section.sourceCodeLocation;
  let content = input.slice(loc.startOffset, loc.endOffset);
  const local = replacements.filter(r => r.start > loc.startOffset && r.end < loc.endOffset).sort((a,b) => b.start - a.start);
  for (const r of local) content = content.slice(0, r.start-loc.startOffset) + r.value + content.slice(r.end-loc.startOffset);
  content = content.replace(/href="#([^"]+)"/g, (_, id) => {
    const target = ids.get(id);
    return `href="${target && target !== chapter.slug ? `${target}.html` : ''}#${id}"`;
  });
  content = content.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/, '');
  content = content.replace(/href="\.\.\/\.\.\/references\/llm-foundations.md"/g, 'href="https://github.com/datawhalechina/hello-agents"');
  content = content.replace(/class="source"/g, 'class="source"');
  const frontmatter = `---\nslug: ${chapter.slug}\ntitle: ${JSON.stringify(chapter.title)}\ncollection: cme295\nlecture: 1\ndescription: ${JSON.stringify(chapter.description)}\norder: ${chapter.order}\nkind: lesson\nstatus: published\ntags: ${JSON.stringify(chapter.tags)}\n---\n\n`;
  const dest = path.join(root, `content/collections/cme295/${chapter.slug}.md`);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, frontmatter + content + '\n');
}
const style = input.match(/<style>([\s\S]*?)<\/style>/)[1];
const css = postcss.parse(style);
css.walkRules(rule => {
  rule.selector = selectorParser(selectors => {
    selectors.each(selector => {
      const first = selector.nodes[0];
      if (first?.type === 'pseudo' && first.value === ':root') { selector.remove(); return; }
      if (first?.type === 'tag' && ['html','body','main','nav','header','footer'].includes(first.value)) { selector.remove(); return; }
      selector.prepend(selectorParser.combinator({ value: ' ' }));
      selector.prepend(selectorParser.className({ value: 'lesson-content' }));
    });
  }).processSync(rule.selector);
  if (!rule.selector.trim()) rule.remove();
});
await fs.mkdir(path.join(root,'site/assets'), {recursive:true});
await fs.writeFile(path.join(root,'site/assets/lesson.css'), css.toString());
await fs.writeFile(path.join(root,'site/assets/lesson.js'), input.match(/<script>([\s\S]*?)<\/script>/)[1].replace("['q1','q2'].forEach", "['q1','q2'].forEach").replace("'use strict';", "'use strict';\nif (document.getElementById('slider-demo')) {") + '\n}\n');
console.log(`Imported ${catalog.chapters.length} full lecture sections into editable content files.`);
