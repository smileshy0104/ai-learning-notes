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
  await expect(page.locator('#lecture-3 .reading-row')).toHaveCount(12);
  await expect(page.locator('#lecture-4 .reading-row')).toHaveCount(11);
  await expect(page.locator('#lecture-5 .reading-row')).toHaveCount(12);
  await expect(page.locator('#lecture-6 .reading-row')).toHaveCount(13);
  for(const [slug,name,presets] of [
   ['l6-metrics','retrieval-metrics',['0.53072','0.76536','1.00000']],
   ['l6-tools','tool-gate',['允许进入执行','暂停等待确认','允许进入执行','参数缺失或越界','权限不允许']],
   ['l6-caching','prefix',['0个块','1个块','0个块']],
   ['l6-harness','agent-loop',['传感器读到65°F','只有计划','不能说实际室温已经70°F']],
   ['l6-memory','compaction',['不要购买，只比较','未发生交易']]
  ]) {
   await page.goto(`http://127.0.0.1:18766/topics/cme295/${slug}.html`);
   await expect(page.locator('.article-heading .eyebrow')).toContainText('Lecture 6');
   for(const [i,text] of presets.entries()) {
    await page.locator(`label[for=${name}-${i}]`).click();
    await expect(page.locator(`.${name}-panel-${i}`)).toContainText(text);
    await expect(page.locator(`.${name}-panel-${i}`)).toBeVisible();
    await expect(page.locator('.l6-panel:visible')).toHaveCount(1);
   }
  }
  for(const [slug,name,presets] of [
   ['l5-flash','online',['6.0000','1001.3863']],
   ['l5-zero','zero',['16.0000','7.0000','5.5000','4.0000']],
   ['l5-latency-roofline','roofline',['10 TFLOP/s','ridge point','100 TFLOP/s']],
   ['l5-kv-paging','paging',['36','40','48']],
   ['l5-speculative','speculative',['0.4000','0.3900']]
  ]) {
   await page.goto(`http://127.0.0.1:18766/topics/cme295/${slug}.html`);
   await expect(page.locator('.article-heading .eyebrow')).toContainText('Lecture 5');
   for(const [i,text] of presets.entries()) {
    await page.locator(`label[for=${name}-${i}]`).click();
    await expect(page.locator(`.${name}-panel-${i}`)).toBeVisible();
    await expect(page.locator(`.${name}-panel-${i}`)).toContainText(text);
    await expect(page.locator('.l5-panel:visible')).toHaveCount(1);
   }
   if(width===390 && name==='speculative') {
    await expect(page.locator('.l5-scroll-hint')).toBeVisible();
    const scrolled=await page.locator('.l5-lab').evaluate(el=>{el.scrollLeft=el.scrollWidth;return el.scrollLeft;});
    expect(scrolled).toBeGreaterThan(0);
   }
  }
  await page.goto('http://127.0.0.1:18766/topics/cme295/l4-baselines.html');
  await expect(page.locator('.article-heading .eyebrow')).toContainText('Lecture 4');
  await page.locator('label[for=baseline-1]').click();
  await expect(page.locator('.baseline-panel-1')).toContainText('0.0000');
  await expect(page.locator('.baseline-panel-0')).toBeHidden();
  await page.locator('label[for=baseline-0]').click();
  await expect(page.locator('.baseline-panel-0')).toContainText('2525.0625');
  await page.goto('http://127.0.0.1:18766/topics/cme295/l4-ppo.html');
  await page.locator('label[for=ppo-clip-1]').click();
  await expect(page.locator('.ppo-clip-panel-1')).toContainText('-1.5000');
  await expect(page.locator('.ppo-clip-panel-0')).toBeHidden();
  await page.goto('http://127.0.0.1:18766/topics/cme295/l4-grpo-refinements.html');
  await page.locator('label[for=length-weight-1]').click();
  await expect(page.locator('.length-weight-panel-1')).toContainText('0.1250');
  await expect(page.locator('.length-weight-panel-0')).toBeHidden();
  await page.goto('http://127.0.0.1:18766/topics/cme295/l4-opd.html');
  for(const preset of [1,2,0]) {
   await page.locator(`label[for=kl-direction-${preset}]`).click();
   await expect(page.locator(`.kl-direction-panel-${preset}`)).toBeVisible();
  }
  await expect(page.locator('.kl-direction-panel-0')).toContainText('0.0000');
  await page.goto('http://127.0.0.1:18766/topics/cme295/l3-sft.html');
  await expect(page.locator('.article-heading .eyebrow')).toContainText('Lecture 3');
  await page.locator('label[for=loss-mask-0]').click();
  await expect(page.locator('.loss-mask-panel-0')).toContainText('1.0533');
  await page.locator('label[for=loss-mask-1]').click();
  await expect(page.locator('.loss-mask-panel-1')).toContainText('0.3406');
  await page.goto('http://127.0.0.1:18766/topics/cme295/l3-rlhf.html');
  await page.locator('label[for=preference-gap-2]').click();
  await expect(page.locator('.preference-gap-panel-2')).toContainText('0.8808');
  await page.goto('http://127.0.0.1:18766/topics/cme295/l3-reasoning.html');
  await page.locator('label[for=group-advantage-1]').click();
  await expect(page.locator('.group-advantage-panel-1')).toContainText('组内没有差异');
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
   await page.goto('http://127.0.0.1:18766/index.html');
   const github=page.locator('a.icon-link');
   await expect(github).toBeVisible();
   await expect(github).toHaveAttribute('href','https://github.com/smileshy0104/ai-learning-notes');
   await expect(github).toHaveAttribute('target','_blank');
   await expect(github).toHaveAttribute('rel',/noopener/);
   await expect(github).toHaveAttribute('aria-label',/GitHub/);
   const themeToggle=page.locator('[data-theme-toggle]');
   await expect(themeToggle).toBeVisible();
   await themeToggle.click();
   await expect(page.locator('html')).toHaveAttribute('data-theme','light');
   await themeToggle.click();
   await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
   await expect(page.locator('body')).toHaveCSS('background-color','rgb(14, 19, 16)');
   const darkSizes=await page.evaluate(()=>({full:document.documentElement.scrollWidth,view:innerWidth}));
   expect(darkSizes.full,`${width}px dark: document overflow`).toBeLessThanOrEqual(darkSizes.view+1);
   await page.goto('http://127.0.0.1:18766/topics/cme295/attention.html');
   await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
   await expect(page.locator('body')).toHaveCSS('background-color','rgb(14, 19, 16)');
   await page.locator('label[for=qpreset-2]').click();
   await expect(page.locator('.panel-p2')).toBeVisible();
   await expect(page.locator('.panel-p2')).toContainText('0.955, 0.277');
   await page.locator('[data-theme-toggle]').click();
   await expect(page.locator('html')).not.toHaveAttribute('data-theme',/.*/);
  }else{
   await expect(page.locator('[data-theme-toggle]')).toBeHidden();
  }
  expect(errors).toEqual([]);
  await context.close();
 });
}

test('system dark preference is readable without scripts',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,colorScheme:'dark',viewport:{width:390,height:900}});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:18766/index.html');
 await expect(page.locator('[data-theme-toggle]')).toBeHidden();
 await expect(page.locator('a.icon-link')).toBeVisible();
 await expect(page.locator('body')).toHaveCSS('background-color','rgb(14, 19, 16)');
 await expect(page.locator('.article-card').first()).toHaveCSS('background-color','rgb(22, 29, 24)');
 await expect(page.getByRole('navigation',{name:'主导航'})).toBeVisible();
 await page.goto('http://127.0.0.1:18766/topics/cme295/basics.html');
 await page.locator('label[for=upd-after]').click();
 await expect(page.locator('.panel-upd-after')).toBeVisible();
 await context.close();
});
