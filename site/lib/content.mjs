import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { parseFragment, serialize } from 'parse5';
import { renderLecture2Lab } from './lecture2-examples.mjs';
import { renderLecture3Lab } from './lecture3-examples.mjs';
import { renderLecture4Lab } from './lecture4-examples.mjs';
import { renderLecture5Lab } from './lecture5-examples.mjs';
import { renderLecture6Lab } from './lecture6-examples.mjs';

const labRenderers = new Map([[2,renderLecture2Lab],[3,renderLecture3Lab],[4,renderLecture4Lab],[5,renderLecture5Lab],[6,renderLecture6Lab]]);
const LAB_PATTERN = /<!-- lab:([a-z0-9-]+) -->/g;

function renderLab(name) {
  const match = /^l([2-6])-([a-z0-9-]+)$/.exec(name);
  if (!match) throw new Error(`Unknown lab: ${name} (expected l2-… through l6-…); no lecture file was rendered`);
  const html = labRenderers.get(Number(match[1]))(match[2]);
  // Lab markup is inserted into the Markdown source before parsing: a blank line would end the HTML block
  // and let marked re-read the copy as Markdown. Keep template output on one line.
  if (/[\r\n]/.test(html)) throw new Error(`Lab ${name} renders across multiple lines; keep the template output on one line so marked cannot re-parse it`);
  return html;
}
// Each lecture's lab template opens with its own title paragraph; keep one extraction contract for all of them.
function labTitle(html) {
  const match = /<p class="l[2-6]-(?:lab-)?title">([\s\S]*?)<\/p>/.exec(html);
  if (!match) throw new Error('Lab markup has no title paragraph; add class="l<N>-title" or "l<N>-lab-title"');
  return match[1].replace(/<[^>]+>/g, '').trim();
}
// Shared with tools/export-lecture-notes.mjs so standalone notes can name the experiment they omit.
export function labSummary(name) {
  return {name, title: labTitle(renderLab(name))};
}

export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function decorate(html) {
  const fragment = parseFragment(html);
  const headings = [];
  const ids = new Set();
  let count = 0;
  function text(node) { return node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join(' '); }
  function walk(node) {
    if (['h2','h3'].includes(node.tagName)) {
      let id = node.attrs.find(a => a.name === 'id')?.value;
      if (!id) { id = `topic-${++count}`; node.attrs.push({name:'id',value:id}); }
      if (ids.has(id)) throw new Error(`Duplicate heading id: ${id}`);
      ids.add(id);
      headings.push({id, title:text(node).trim(), level:Number(node.tagName[1])});
    }
    node.childNodes?.forEach(walk);
  }
  walk(fragment);
  return { html:serialize(fragment), headings, text:text(fragment).replace(/\s+/g,' ').trim() };
}

async function files(directory) {
  const result=[];
  for (const entry of await fs.readdir(directory,{withFileTypes:true})) {
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()) result.push(...await files(file));
    else if(entry.name.endsWith('.md')) result.push(file);
  }
  return result;
}

export async function loadContent(root) {
  const catalog=JSON.parse(await fs.readFile(path.join(root,'content/catalog.json'),'utf8'));
  const collections = new Map();
  for (const collection of catalog.collections) {
    if (!/^[a-z0-9-]+$/.test(collection.slug) || collections.has(collection.slug)) throw new Error('Invalid or duplicate collection slug');
    collections.set(collection.slug,collection);
  }
  const articles=[];
  const urls=new Set();
  for(const file of await files(path.join(root,'content/collections'))) {
    const {data,content}=matter(await fs.readFile(file,'utf8'));
    for(const field of ['slug','title','collection','description','order','kind','status','tags']) if(data[field]===undefined) throw new Error(`${file}: missing ${field}`);
    if(!collections.has(data.collection)) throw new Error(`${file}: unknown collection`);
    if(!/^[a-z0-9-]+$/.test(data.slug)) throw new Error(`${file}: invalid slug`);
    if(!['published','draft'].includes(data.status)) throw new Error(`${file}: invalid status`);
    if(!Number.isFinite(data.order) || !Array.isArray(data.tags)) throw new Error(`${file}: invalid order/tags`);
    if(data.labs !== undefined) throw new Error(`${file}: "labs" is reserved for rendered experiment metadata and cannot be set in frontmatter`);
    if(data.status==='draft') continue;
    const url=`topics/${data.collection}/${data.slug}.html`;
    if(urls.has(url)) throw new Error(`${file}: duplicate article URL`);
    urls.add(url);
    const lecture = data.lecture;
    if (lecture !== undefined && (!Number.isInteger(lecture) || lecture < 1)) throw new Error(`${file}: invalid lecture`);
    if (data.collection === 'cme295' && lecture === undefined) throw new Error(`${file}: missing lecture`);
    const labs = [];
    const expanded = content.replace(LAB_PATTERN, (_, name) => {
      const html = renderLab(name);
      labs.push({name,title:labTitle(html)});
      return html;
    });
    const processed=decorate(marked.parse(expanded));
    articles.push({...data,lecture,...processed,url,file,labs});
  }
  articles.sort((a,b)=>a.collection.localeCompare(b.collection)||(a.lecture??0)-(b.lecture??0)||a.order-b.order||a.slug.localeCompare(b.slug));
  const lectures = catalog.lectures ?? [];
  // catalog.chapters is the legacy lecture-1 manifest kept for tools/import-lecture.mjs; it must never drift from lectures[0].
  const primary = lectures.find(l => l.collection === 'cme295' && l.number === 1);
  if (catalog.chapters?.length) {
    const legacy = catalog.chapters.map(c => c.slug).join();
    if (!primary) throw new Error('catalog.chapters requires a cme295 lecture 1 entry in catalog.lectures');
    if (primary.chapters.join() !== legacy) throw new Error('catalog.chapters must list the same chapters, in the same order, as cme295 lecture 1 in catalog.lectures');
  }
  for (const lecture of lectures) {
    if (!collections.has(lecture.collection)) throw new Error('Unknown lecture collection');
    const registered = new Set(lecture.chapters);
    for (const slug of lecture.chapters) if (!articles.some(a => a.collection === lecture.collection && a.lecture === lecture.number && a.slug === slug)) throw new Error(`Missing lecture ${lecture.number} chapter: ${slug}`);
    for (const a of articles) if (a.collection === lecture.collection && a.lecture === lecture.number && !registered.has(a.slug)) throw new Error(`${a.file}: lecture ${lecture.number} chapter not registered in catalog: ${a.slug}`);
  }
  for (const a of articles) if (a.lecture !== undefined && !lectures.some(l => l.collection === a.collection && l.number === a.lecture)) throw new Error(`${a.file}: lecture ${a.lecture} is not registered in catalog.lectures`);
  const labs = [];
  for (const article of articles) for (const lab of article.labs) {
    if (labs.some(l => l.name === lab.name)) throw new Error(`Duplicate lab name: ${lab.name}`);
    labs.push({...lab,url:article.url,articleTitle:article.title,collection:article.collection,lecture:article.lecture});
  }
  return {...catalog,articles,labs};
}
