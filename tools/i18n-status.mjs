// 列出翻译进度：已译 / 待译，以及接下来最该翻的几篇。
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../site/lib/content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const limit = Number(process.argv[2] ?? 10);
const focusLecture = process.argv[3] ? Number(process.argv[3]) : null; // 可选：只列某一讲的待译清单
const data = await loadContent(root);
const zh = data.articles.filter(a => a.lang === 'zh');
const done = zh.filter(a => a.alternate);
const pending = zh.filter(a => !a.alternate);
const pct = zh.length ? Math.round(done.length / zh.length * 100) : 100;
console.log(`中文文章 ${zh.length} 篇：已译 ${done.length} 篇，待译 ${pending.length} 篇（${pct}% 已译）`);
if (!pending.length) { console.log('全部章节都有英文版。'); process.exit(0); }
// 按讲次完整化：优先补齐已译最多的那一讲。
const byLecture = new Map();
for (const a of zh) {
  const key = a.lecture ? `${a.collection} L${a.lecture}` : a.collection;
  const bucket = byLecture.get(key) ?? { done: 0, total: 0, number: a.lecture ?? 0 };
  bucket.total++;
  if (a.alternate) bucket.done++;
  byLecture.set(key, bucket);
}
console.log('\n各专题进度：');
for (const [key, bucket] of [...byLecture].sort((a, b) => a[1].number - b[1].number || a[0].localeCompare(b[0]))) {
  const bar = '█'.repeat(Math.round(bucket.done / bucket.total * 10)).padEnd(10, '·');
  console.log(`  ${key.padEnd(12)} ${bar} ${bucket.done}/${bucket.total}`);
}
// 默认推荐"剩余最少"的在译讲次（把一讲做完再做下一讲）；也可用第三个参数指定讲次。
const inProgress = [...byLecture.entries()]
  .filter(([, b]) => b.done > 0 && b.done < b.total)
  .sort((a, b) => (a[1].total - a[1].done) - (b[1].total - b[1].done) || a[1].number - b[1].number)[0];
const focusKey = focusLecture ? `cme295 L${focusLecture}` : inProgress ? inProgress[0] : null;
const focus = focusKey ? pending.filter(a => (a.lecture ? `${a.collection} L${a.lecture}` : a.collection) === focusKey) : pending;
console.log(`\n建议下一步（把「${focusKey ?? '新专题'}」补齐，前 ${limit} 篇）：`);
for (const a of focus.slice(0, limit)) {
  console.log(`  ${a.lecture ? `L${a.lecture}` : '-'}  ${a.collection}/${a.slug}  ${a.title}`);
}
console.log('\n完成一篇后：新建同目录 <slug>.en.md（lang: en），并从 content/translations.json 删除该条目。');
