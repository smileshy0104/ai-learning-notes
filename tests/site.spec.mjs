import { test, expect } from '@playwright/test';
import fs from 'node:fs';
const manifest=JSON.parse(fs.readFileSync(new URL('../dist/site-manifest.json',import.meta.url),'utf8'));
for(const javaScriptEnabled of [true,false]) for(const width of [1440,390]) {
 test(`site works at ${width}px with scripts ${javaScriptEnabled?'enabled':'disabled'}`,async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled,viewport:{width,height:1000}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  for(const url of ['index.html','courses.html','library.html','map.html','labs.html',...manifest.articles.map(a=>a.url)]) {
   await page.goto(`http://127.0.0.1:18766/${url}`);
   await expect(page.getByRole('navigation',{name:'主导航'})).toBeVisible();
   await expect(page.locator('main h1')).toHaveCount(1);
   const sizes=await page.evaluate(()=>({full:document.documentElement.scrollWidth,view:innerWidth}));
   expect(sizes.full,`${url}: document overflow`).toBeLessThanOrEqual(sizes.view+1);
  }
  await page.goto('http://127.0.0.1:18766/topics/cme295/basics.html');
  await page.locator('label[for=upd-after]').click();
  await expect(page.locator('.panel-upd-after')).toBeVisible();
  await expect(page.locator('.panel-upd-before')).toBeHidden();
  await page.goto('http://127.0.0.1:18766/topics/cme295/attention.html');
  await page.locator('label[for=qpreset-2]').click();
  await expect(page.locator('.panel-p2')).toBeVisible();
  await expect(page.locator('.panel-p2')).toContainText('0.955, 0.277');
  if(javaScriptEnabled) {
   await expect(page.locator('#slider-demo')).toBeVisible();
   await page.locator('#q1').fill('0');
   await page.locator('#q2').fill('0');
   await expect(page.locator('#attention-result')).toContainText('0.667, 1.000');
  }else await expect(page.locator('#slider-demo')).toBeHidden();
  await page.goto('http://127.0.0.1:18766/topics/cme295/tokens.html');
  await page.locator('label[for=bpe-4]').click();
  await expect(page.locator('.panel-bpe4')).toBeVisible();
  await page.goto('http://127.0.0.1:18766/topics/cme295/architecture.html');
  await page.locator('label[for=gen-3]').click();
  await expect(page.locator('.panel-gen3')).toBeVisible();
  await page.goto('http://127.0.0.1:18766/collections/cme295.html');
  await expect(page.locator('#lecture-1 .reading-row')).toHaveCount(13);
  await expect(page.locator('#lecture-2 .reading-row')).toHaveCount(10);
  await page.goto('http://127.0.0.1:18766/topics/cme295/l2-moe.html');
  await expect(page.locator('.article-heading .eyebrow')).toContainText('Lecture 2');
  await page.locator('label[for=route-1]').click();
  await expect(page.locator('.route-panel-1')).toBeVisible();
  await page.locator('label[for=route-2]').click();
  await expect(page.locator('.route-panel-2')).toContainText('1.3750, 1.2500');
  await page.goto('http://127.0.0.1:18766/topics/cme295/l2-attention-cache.html');
  await page.locator('label[for=window-3]').click();
  await expect(page.locator('.window-panel-3 .reachable')).toHaveCount(6);
  await page.goto('http://127.0.0.1:18766/topics/cme295/l2-decoding.html');
  await page.locator('label[for=temp-0]').click();
  await expect(page.locator('.temp-panel-0')).toBeVisible();
  await expect(page.locator('.temp-panel-0')).toContainText('86.50%');
  await page.goto('http://127.0.0.1:18766/labs.html');
  await page.locator('label[for=lab-c]').click();
  await expect(page.locator('.panel-c')).toBeVisible();
  await expect(page.locator('.panel-c')).toContainText('0.667, 1.000');
  if(javaScriptEnabled) {
   await page.goto('http://127.0.0.1:18766/courses.html');
   await page.getByRole('button',{name:'框架专题',exact:true}).click();
   await expect(page.locator('[data-category]:visible')).toHaveCount(3);
   await page.goto('http://127.0.0.1:18766/library.html');
   await page.locator('#knowledge-query').fill('LangGraph');
   await expect(page.locator('.article-card:visible')).toContainText(['Eino','LangChain','LangGraph']);
   await page.locator('#knowledge-query').fill('遗忘门');
   await expect.poll(()=>page.locator('.article-card:visible').count()).toBeGreaterThan(0);
   await page.locator('#knowledge-query').fill('does-not-exist-anywhere-1234');
   await expect(page.locator('[data-empty]')).toBeVisible();
  }
  expect(errors).toEqual([]);
  await context.close();
 });
}
