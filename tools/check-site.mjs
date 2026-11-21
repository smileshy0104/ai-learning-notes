import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { parse } from 'parse5';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
const manifest=JSON.parse(await fs.readFile(path.join(root,'site-manifest.json'),'utf8'));
const documents=new Map();
for(const file of manifest.pages) {
 const source=await fs.readFile(path.join(root,file),'utf8');
 const document=parse(source);
 const ids=new Set(),refs=[];
 let nav=[],githubLinks=[];
 function walk(node,inNav=false) {
  const attrs=Object.fromEntries((node.attrs??[]).map(a=>[a.name,a.value]));
  if(attrs.id) {assert(!ids.has(attrs.id),`${file}: duplicate ID ${attrs.id}`);ids.add(attrs.id);}
  if(node.tagName==='a' && attrs.href) {
   refs.push(attrs.href);
   if(attrs.target==='_blank') assert(/noopener/.test(attrs.rel??''),`${file}: target=_blank 缺少 rel=noopener → ${attrs.href}`);
   if(attrs.class==='icon-link') githubLinks.push(attrs.href);
  }
  if(node.tagName==='script' && attrs.src) refs.push(attrs.src);
  if(node.tagName==='link' && attrs.href) refs.push(attrs.href);
  const mainNav=inNav || (node.tagName==='nav'&&attrs['aria-label']==='主导航');
  if(mainNav && node.tagName==='a') nav.push(path.posix.basename(attrs.href));
  node.childNodes?.forEach(n=>walk(n,mainNav));
 }
 walk(document);
 assert.deepEqual(nav,['index.html','courses.html','library.html','labs.html','map.html'],`${file}: inconsistent navigation`);
 assert.equal(githubLinks.length,1,`${file}: expected exactly one GitHub entry`);
 assert(/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(githubLinks[0]),`${file}: unexpected GitHub entry ${githubLinks[0]}`);
 documents.set(file,{source,ids,refs});
}
for(const [file,{refs}] of documents) for(const ref of refs) {
 if(/^(https?:|mailto:|tel:)/.test(ref))continue;
 const url=new URL(ref,'https://local.test/'+file);
 assert(url.origin==='https://local.test',`${file}: unexpected reference ${ref}`);
 const target=decodeURIComponent(url.pathname.slice(1));
 assert((await fs.stat(path.join(root,target))).isFile(),`${file}: missing ${ref}`);
 if(url.hash) assert(documents.get(target)?.ids.has(decodeURIComponent(url.hash.slice(1))),`${file}: missing fragment ${ref}`);
}
const search=JSON.parse(await fs.readFile(path.join(root,'assets/search.json'),'utf8'));
assert.equal(search.length,manifest.articles.length);
assert(search.some(a=>a.text.includes('梯度消失')));
assert(!manifest.pages.some(file=>file.endsWith('.pdf')));
console.log(`Site checks passed: ${documents.size} pages; navigation, files, fragments and search index valid.`);
