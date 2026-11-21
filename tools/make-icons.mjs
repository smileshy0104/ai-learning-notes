// 由 site/assets/icon.svg 生成位图图标，保证 PNG 与 SVG 同源、可复现。
// 用法：npm run icons   （需要本机 Chrome，或 PLAYWRIGHT_CHANNEL=chromium）
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = await fs.readFile(path.join(root, 'site/assets/icon.svg'), 'utf8');
const glyph = source.slice(source.indexOf('<g fill="none"'));

const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>${source.match(/<defs>[\s\S]*?<\/defs>/)[0].replace(/<\/?defs>/g, '')}</defs>
  <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#tile)"/>
  <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="13.25" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="1.5"/>
  <g transform="translate(32 32) scale(0.92) translate(-32 -32)">${glyph}</g>
</svg>`;

// iOS 会自行裁圆角，且要求不透明：整块铺满，图形留出安全边距。
const square = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>${source.match(/<defs>[\s\S]*?<\/defs>/)[0].replace(/<\/?defs>/g, '')}</defs>
  <rect width="64" height="64" fill="url(#tile)"/>
  <g transform="translate(32 32) scale(0.8) translate(-32 -32)">${glyph}</g>
</svg>`;

const targets = [
  { file: 'site/assets/icon-32.png', size: 32, svg: rounded, transparent: true },
  { file: 'site/assets/icon-180.png', size: 180, svg: square, transparent: false },
];

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHANNEL === 'chromium' ? {} : { channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 200, height: 200 }, deviceScaleFactor: 1 });
for (const { file, size, svg, transparent } of targets) {
  await page.setContent(`<body style="margin:0;background:transparent"><div id="icon" style="width:${size}px;height:${size}px">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</div></body>`);
  await page.locator('#icon').screenshot({ path: path.join(root, file), omitBackground: transparent });
  const { size: bytes } = await fs.stat(path.join(root, file));
  console.log(`${file}: ${size}×${size}, ${bytes} B`);
}
await browser.close();
