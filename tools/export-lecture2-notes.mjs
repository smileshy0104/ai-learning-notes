import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root=fileURLToPath(new URL('../',import.meta.url));
const catalog=JSON.parse(await fs.readFile(path.join(root,'content/catalog.json'),'utf8'));
const lecture=catalog.lectures.find(l=>l.collection==='cme295'&&l.number===2);
const parts=['# Lecture 2：Large Language Models\n\n本笔记由网站同一份 Markdown 内容生成。修改内容请编辑 `content/collections/cme295/l2-*.md`，再运行 `npm run notes:lecture2`。\n\n原始资料：[第二讲 PDF](../../materials/cme295/lecture-02/fall26-cme295-lecture2.pdf)、[字幕](../../materials/cme295/lecture-02/transcript.zh-Hant.txt)。\n\n内容入口：[第二讲导读源文档](../../content/collections/cme295/l2-overview.md)。交互网站请按项目 README 构建与启动，再访问 `topics/cme295/l2-overview.html`。'];
for(const slug of lecture.chapters){
 const {data,content}=matter(await fs.readFile(path.join(root,`content/collections/cme295/${slug}.md`),'utf8'));
 const remapped=content.replace(/\]\((l2-[a-z-]+)\.html\)/g,'](../../content/collections/cme295/$1.md)')
   .replace(/\]\(basics\.html\)/g,'](../../content/collections/cme295/basics.md)')
   .replace(/<!-- lab:([a-z-]+) -->/g,(_,name)=>`\n交互图解（${name}）对应 [章节源文档](../../content/collections/cme295/${slug}.md)。构建网站后可在该章节页面操作。\n`)
   .replace(/^(#{2,5}) /gm,'#$1 ');
 parts.push(`\n\n## ${data.title}\n\n${remapped.trim()}`);
}
await fs.writeFile(path.join(root,'study-notes/cme295-fall2026/lecture-02-large-language-models.md'),parts.join('\n')+'\n');
console.log('Generated Lecture 2 Markdown notes from the same source as the website.');
