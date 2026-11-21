import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { parse } from 'parse5';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
const htmlElFor=document=>document.childNodes.find(n=>n.tagName==='html');
const manifest=JSON.parse(await fs.readFile(path.join(root,'site-manifest.json'),'utf8'));
const documents=new Map();
for(const file of manifest.pages) {
 const source=await fs.readFile(path.join(root,file),'utf8');
 const document=parse(source);
 const ids=new Set(),refs=[];
 let nav=[],githubLinks=[],iconLinks=[],touchIcons=[],langSwitches=[];
 function walk(node,inNav=false) {
  const attrs=Object.fromEntries((node.attrs??[]).map(a=>[a.name,a.value]));
  if(attrs.id) {assert(!ids.has(attrs.id),`${file}: duplicate ID ${attrs.id}`);ids.add(attrs.id);}
  if(node.tagName==='a' && attrs.href) {
   refs.push(attrs.href);
   if(attrs.target==='_blank') assert(/noopener/.test(attrs.rel??''),`${file}: target=_blank 缺少 rel=noopener → ${attrs.href}`);
   if(attrs.class==='icon-link') githubLinks.push(attrs.href);
   if((attrs.class??'').split(/\s+/).includes('lang-switch')) langSwitches.push(attrs);
  }
  if(node.tagName==='script' && attrs.src) refs.push(attrs.src);
  if(node.tagName==='link' && attrs.href) {
   refs.push(attrs.href);
   if(attrs.rel==='icon') iconLinks.push(attrs.href);
   if(attrs.rel==='apple-touch-icon') touchIcons.push(attrs.href);
  }
  const mainNav=inNav || (node.tagName==='nav'&&(attrs.class??'').split(/\s+/).includes('topnav'));
  if(mainNav && node.tagName==='a') nav.push(path.posix.basename(attrs.href));
  node.childNodes?.forEach(n=>walk(n,mainNav));
 }
 walk(document);
 assert.deepEqual(nav,['index.html','courses.html','library.html','labs.html','map.html'],`${file}: inconsistent navigation`);
 // 语言：路径前缀决定 <html lang>；英文页必须能切回中文，中文页只在有译文时出现切换。
 const lang=file.startsWith('en/')?'en':'zh';
 const htmlAttrs=Object.fromEntries((htmlElFor(document)?.attrs??[]).map(a=>[a.name,a.value]));
 assert.equal(htmlAttrs.lang,lang==='en'?'en':'zh-CN',`${file}: <html lang> 与路径不符`);
 assert.equal(htmlAttrs['data-lang'],lang,`${file}: data-lang 与路径不符`);
 assert(htmlAttrs['data-search-index'],`${file}: 缺少 data-search-index`);
 if(lang==='en') {
  assert.equal(langSwitches.length,1,`${file}: 英文页必须有一个语言切换链接`);
  assert.equal(langSwitches[0].hreflang,'zh-CN',`${file}: 切换链接 hreflang 应为 zh-CN`);
 }else assert(langSwitches.length<=1,`${file}: 中文页最多一个语言切换链接`);
 if(langSwitches.length) assert(langSwitches[0].hreflang===(lang==='en'?'zh-CN':'en'),`${file}: 切换链接 hreflang 错误`);
 // 所有内容都必须在 .wrap 里；多余的闭合标签会把 main / 后续小节挤到 body 下。
 const bodyEl=htmlElFor(document)?.childNodes.find(n=>n.tagName==='body');
 const bodyChildren=(bodyEl?.childNodes??[]).filter(n=>n.tagName).map(n=>n.tagName+'.'+((n.attrs??[]).find(a=>a.name==='class')?.value??''));
 assert.deepEqual(bodyChildren,['a.skip','div.wrap'],`${file}: body 直接子元素异常，内容可能跑到了 .wrap 之外`);
 assert.equal(iconLinks.length,2,`${file}: expected an SVG icon and a 32px PNG fallback`);
 assert(iconLinks.some(href=>href.endsWith('icon.svg')),`${file}: missing SVG icon`);
 assert(iconLinks.some(href=>href.endsWith('icon-32.png')),`${file}: missing PNG icon fallback`);
 assert.equal(touchIcons.length,1,`${file}: expected exactly one apple-touch-icon`);
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
for(const [file,lang] of [['assets/search.json','zh'],['assets/search.en.json','en']]) {
 const index=JSON.parse(await fs.readFile(path.join(root,file),'utf8'));
 assert.equal(index.length,manifest.articles.filter(a=>a.lang===lang).length,`${file}: 条数与文章数不符`);
 assert(index.every(a=>a.url&&a.title),`${file}: 条目缺少字段`);
}
assert(JSON.parse(await fs.readFile(path.join(root,'assets/search.json'),'utf8')).some(a=>a.text.includes('梯度消失')));
assert(!manifest.pages.some(file=>file.endsWith('.pdf')));
console.log(`Site checks passed: ${documents.size} pages; navigation, files, fragments and search index valid.`);
