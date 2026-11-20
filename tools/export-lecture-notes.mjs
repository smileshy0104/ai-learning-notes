import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const root=fileURLToPath(new URL('../',import.meta.url));
export async function exportLectureNotes(number) {
  const catalog=JSON.parse(await fs.readFile(path.join(root,'content/catalog.json'),'utf8'));
  const lecture=catalog.lectures.find(l=>l.collection==='cme295'&&l.number===number);
  if(!lecture || ![2,3,4,5,6].includes(number)) throw new Error('Supported combined notes: lecture 2 through 6');
  const padded=String(number).padStart(2,'0');
  const name=({2:'large-language-models',3:'llm-training',4:'reinforcement-learning',5:'llm-systems',6:'ai-agents'})[number];
  const transcript=number>=3?'transcript.en.txt':'transcript.zh-Hant.txt';
  const parts=[`# Lecture ${number}：${lecture.title}\n\n本笔记由网站相同的 Markdown 内容生成。请编辑 \`content/collections/cme295/l${number}-*.md\` 后运行 \`npm run notes:lecture${number}\`，不要独立修改此生成笔记。\n\n原始资料：[PDF](../../materials/cme295/lecture-${padded}/fall26-cme295-lecture${number}.pdf)、[文字稿](../../materials/cme295/lecture-${padded}/${transcript})。\n\n内容入口：[本讲导读](../../content/collections/cme295/l${number}-overview.md)。启动网站后可访问 \`topics/cme295/l${number}-overview.html\`。`];
  for(const slug of lecture.chapters) {
    const {data,content}=matter(await fs.readFile(path.join(root,`content/collections/cme295/${slug}.md`),'utf8'));
    const remapped=content.replace(/\]\(([a-z0-9-]+)\.html(#[^)]*)?\)/g,'](../../content/collections/cme295/$1.md$2)')
      .replace(/<!-- lab:([a-z0-9-]+) -->/g,(_,lab)=>`\n交互图解（${lab}）见[对应章节源文档](../../content/collections/cme295/${slug}.md)，构建网站后可在该章节操作。\n`)
      .replace(/^(#{2,5}) /gm,'#$1 ');
    parts.push(`\n\n## ${data.title}\n\n${remapped.trim()}`);
  }
  const target=path.join(root,`study-notes/cme295-fall2026/lecture-${padded}-${name}.md`);
  await fs.writeFile(target,parts.join('\n')+'\n');
  console.log(`Generated Lecture ${number} notes from ${lecture.chapters.length} source chapters.`);
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  await exportLectureNotes(Number(process.argv[2]));
}
