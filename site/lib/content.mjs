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

const renderLab = name => name.startsWith('l6-') ? renderLecture6Lab(name.slice(3)) : name.startsWith('l5-') ? renderLecture5Lab(name.slice(3)) : name.startsWith('l4-') ? renderLecture4Lab(name.slice(3)) : name.startsWith('l3-') ? renderLecture3Lab(name.slice(3)) : renderLecture2Lab(name);

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
    if(data.status==='draft') continue;
    const url=`topics/${data.collection}/${data.slug}.html`;
    if(urls.has(url)) throw new Error(`${file}: duplicate article URL`);
    urls.add(url);
    const lecture = data.lecture ?? (data.collection === 'cme295' ? 1 : undefined);
    if (lecture !== undefined && (!Number.isInteger(lecture) || lecture < 1)) throw new Error(`${file}: invalid lecture`);
    const expanded = content.replace(/<!-- lab:([a-z0-9-]+) -->/g, (_, name) => renderLab(name));
    const processed=decorate(marked.parse(expanded));
    articles.push({...data,lecture,...processed,url,file});
  }
  articles.sort((a,b)=>a.collection.localeCompare(b.collection)||(a.lecture??0)-(b.lecture??0)||a.order-b.order||a.slug.localeCompare(b.slug));
  for(const chapter of catalog.chapters) if(!articles.some(a=>a.collection==='cme295' && a.slug===chapter.slug)) throw new Error('Missing lecture chapter: '+chapter.slug);
  for (const lecture of catalog.lectures ?? []) {
    if (!collections.has(lecture.collection)) throw new Error('Unknown lecture collection');
    for (const slug of lecture.chapters) if (!articles.some(a => a.collection === lecture.collection && a.lecture === lecture.number && a.slug === slug)) throw new Error(`Missing lecture ${lecture.number} chapter: ${slug}`);
  }
  return {...catalog,articles};
}
