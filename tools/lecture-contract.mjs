// Shared invariants for every CME295 lecture: chapter coverage, lab registration,
// generated-note links and archived source hashes. Lecture tests supply only their data;
// chapter counts, page counts and note file names come from content/catalog.json.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../site/lib/content.mjs';
import { labs as labsPage } from '../site/lib/pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

export function registerLectureContract({ number, labs }) {
  test(`lecture ${number} publishes every registered chapter and lab`, async () => {
    const data = await loadContent(root);
    const lecture = data.lectures.find(l => l.collection === 'cme295' && l.number === number);
    assert(lecture, `lecture ${number} is not registered in content/catalog.json`);
    const published = data.articles.filter(a => a.collection === 'cme295' && a.lecture === number);
    assert.equal(published.length, lecture.chapters.length, `lecture ${number} published ${published.length} chapters but catalog lists ${lecture.chapters.length}`);
    for (const article of published) {
      assert(!article.text.includes('**'), `${article.slug}: unrendered emphasis`);
      // HTML 块内的 Markdown 不会被解析：页面上会直接显示 [文字](地址)。
      assert(!article.text.includes(']('), `${article.slug}: unrendered Markdown link`);
      // 出处说明里的「已视觉核对第 N 页」是合法内容；这里只拦无证据的掌握声明。
      assert(!/已读完|已掌握/.test(article.text), `${article.slug}: unverified mastery claim leaked into the article`);
    }
    const listed = data.labs.filter(lab => lab.collection === 'cme295' && lab.lecture === number);
    assert.equal(listed.length, labs, `lecture ${number} lab count changed; update the contract or the content`);
    const page = labsPage(data);
    for (const lab of listed) {
      assert(/^l\d-/.test(lab.name), `${lab.name}: lab name must start with its lecture prefix`);
      assert(lab.title.length > 0, `${lab.name}: lab title paragraph is empty`);
      assert(page.includes(`href="${lab.url}"`), `labs.html does not list ${lab.name}`);
      assert(page.includes(lab.title), `labs.html does not show the title of ${lab.name}`);
    }
  });

  test(`lecture ${number} generated notes and archived materials stay consistent`, async () => {
    const catalog = JSON.parse(await fs.readFile(new URL('../content/catalog.json', import.meta.url), 'utf8'));
    const lecture = catalog.lectures.find(l => l.collection === 'cme295' && l.number === number);
    assert(lecture?.note, `lecture ${number} has no catalog "note" file`);
    const noteUrl = new URL(`../study-notes/cme295-fall2026/${lecture.note}`, import.meta.url);
    const notes = await fs.readFile(noteUrl, 'utf8');
    assert(!/127\.0\.0\.1|http:\/\/localhost/.test(notes), 'notes must not link to a local preview');
    for (const [, link] of notes.matchAll(/\]\(([^)]+)\)/g)) {
      if (!/^(https?:|#)/.test(link)) await fs.access(new URL(link.split('#')[0], noteUrl));
    }
    const manifest = JSON.parse(await fs.readFile(new URL('../materials/manifest.json', import.meta.url), 'utf8'));
    const materials = manifest.files.filter(item => item.lecture === number);
    assert.equal(materials.filter(item => item.path.endsWith('.pdf')).length, 1, `lecture ${number} must archive one PDF`);
    assert(materials.find(item => item.path.endsWith('.pdf')).pages === lecture.pages, `lecture ${number}: catalog pages must match the archived PDF`);
    assert.equal(materials.filter(item => /transcript.*\.txt$/.test(item.path)).length, 1, `lecture ${number} must archive one transcript`);
    for (const item of materials) {
      const bytes = await fs.readFile(new URL(`../materials/${item.path}`, import.meta.url));
      assert.equal(bytes.length, item.bytes, item.path);
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.sha256, item.path);
    }
  });
}
