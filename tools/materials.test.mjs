// Archive integrity is checked once for every lecture, including lecture 1,
// whose notes are maintained by hand and have no generated export.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const materials = fileURLToPath(new URL('../materials/', import.meta.url));
const manifest = JSON.parse(await fs.readFile(path.join(materials, 'manifest.json'), 'utf8'));

test('every archived material matches its recorded size and SHA-256', async () => {
  assert(manifest.files.length > 0);
  for (const item of manifest.files) {
    const bytes = await fs.readFile(path.join(materials, item.path));
    assert.equal(bytes.length, item.bytes, item.path);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.sha256, item.path);
  }
});

test('every archived lecture has one PDF and one transcript named in its README', async () => {
  const lectures = new Map();
  for (const item of manifest.files) {
    const group = lectures.get(item.lecture) ?? [];
    group.push(item);
    lectures.set(item.lecture, group);
  }
  for (const [number, items] of lectures) {
    assert.equal(items.filter(i => i.path.endsWith('.pdf')).length, 1, `lecture ${number}: expected one PDF`);
    assert(items.find(i => i.path.endsWith('.pdf')).pages > 0, `lecture ${number}: PDF page count missing`);
    assert.equal(items.filter(i => /transcript.*\.txt$/.test(i.path)).length, 1, `lecture ${number}: expected one transcript`);
    const directory = path.posix.dirname(items[0].path);
    for (const item of items) assert.equal(path.posix.dirname(item.path), directory, `lecture ${number}: files must share a directory`);
    const readme = await fs.readFile(path.join(materials, directory, 'README.md'), 'utf8');
    for (const item of items) assert(readme.includes(path.posix.basename(item.path)), `${directory}/README.md must name ${path.posix.basename(item.path)}`);
  }
});
