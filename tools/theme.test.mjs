// 主题系统的静态约束：两套调色板必须成对、light-dark() 必须双值、
// 讲次样式表里的浅色值不得脱离 light-dark()，并检查正文对比度。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';

const read = name => fs.readFile(new URL(`../site/assets/${name}`, import.meta.url), 'utf8');
const css = await read('site.css');
const root = postcss.parse(css);

const tokensIn = container => {
  const found = new Map();
  for (const rule of container.nodes ?? []) {
    if (rule.type !== 'rule' || rule.selector !== ':root') continue;
    rule.walkDecls(decl => { if (decl.prop.startsWith('--')) found.set(decl.prop, decl.value); });
  }
  return found;
};
const darkSupport = root.nodes.find(node => node.type === 'atrule' && node.name === 'supports' && node.params.includes('light-dark'));
assert(darkSupport, 'site.css 缺少 light-dark() 的 @supports 调色板');
const light = tokensIn(root);
const dark = tokensIn(darkSupport);

test('every design token has a dark counterpart inside the @supports palette', () => {
  assert(dark.size > 0, '没有解析到暗色调色板');
  const isColor = value => /^#[0-9a-f]{3,8}$/i.test(value.trim()) || value.includes('light-dark(');
  const colorTokens = [...light.entries()].filter(([, value]) => isColor(value)).map(([prop]) => prop);
  assert(colorTokens.length > 10, '颜色令牌太少，解析可能出错');
  const missing = colorTokens.filter(prop => !dark.has(prop));
  assert.deepEqual(missing, [], `缺少暗色值: ${missing.join(', ')}`);
  assert.deepEqual([...dark.keys()].filter(prop => !light.has(prop)), [], '暗色调色板定义了基础调色板没有的令牌');
});

test('every light-dark() call carries exactly one top-level comma', () => {
  const files = ['site.css', 'lesson.css', 'lecture2.css', 'lecture3.css', 'lecture4.css', 'lecture5.css', 'lecture6.css'];
  let checked = 0;
  for (const file of files) {
    const parsed = file === 'site.css' ? root : postcss.parse(readFileSync(new URL(`../site/assets/${file}`, import.meta.url), 'utf8'));
    parsed.walkDecls(decl => {
      for (const match of decl.value.matchAll(/light-dark\(/g)) {
        let depth = 1, commas = 0, index = match.index + match[0].length;
        for (; index < decl.value.length && depth > 0; index++) {
          const char = decl.value[index];
          if (char === '(') depth++;
          else if (char === ')') depth--;
          else if (char === ',' && depth === 1) commas++;
        }
        assert.equal(depth, 0, `${file}: light-dark() 括号未闭合 → ${decl.value}`);
        assert.equal(commas, 1, `${file}: light-dark() 必须是浅色,深色 两个值 → ${decl.value}`);
        checked++;
      }
    });
  }
  assert(checked > 0, '没有找到任何 light-dark() 声明');
});

test('lecture stylesheets keep a light fallback for every light-dark() colour', async () => {
  for (const file of ['lecture2.css', 'lecture3.css', 'lecture4.css', 'lecture5.css', 'lecture6.css']) {
    const parsed = postcss.parse(await read(file));
    parsed.walkDecls(decl => {
      if (!/#[0-9a-fA-F]{3,6}/.test(decl.value) || decl.value.includes('light-dark(')) return;
      const next = decl.next();
      assert(next, `${file}: ${decl.prop}:${decl.value} 后面没有 light-dark() 版本`);
      assert.equal(next.prop, decl.prop, `${file}: ${decl.prop} 的后继声明属性不一致`);
      assert(next.value.includes('light-dark('), `${file}: ${decl.prop}:${decl.value} 没有对应的暗色值`);
    });
  }
});

const hex = value => {
  let digits = value.trim().replace('#', '');
  assert(/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(digits), `令牌必须是十六进制颜色: ${value}`);
  if (digits.length === 3) digits = [...digits].map(c => c + c).join('');
  return [0, 2, 4].map(i => parseInt(digits.slice(i, i + 2), 16));
};
const luminance = rgb => {
  const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(hex(a)), luminance(hex(b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('body text keeps strong contrast in both palettes', () => {
  const lightInk = light.get('--ink'), lightBg = light.get('--bg'), lightCard = light.get('--card');
  assert(contrast(lightInk, lightBg) >= 7, `light: 正文与页面底色对比度仅 ${contrast(lightInk, lightBg).toFixed(2)}`);
  assert(contrast(lightInk, lightCard) >= 7, `light: 正文与卡片底色对比度仅 ${contrast(lightInk, lightCard).toFixed(2)}`);
  const pair = value => {
    const match = /light-dark\(([^,]+),(.+)\)/.exec(value);
    return match[2].trim();
  };
  const darkInk = pair(dark.get('--ink')), darkBg = pair(dark.get('--bg')), darkCard = pair(dark.get('--card'));
  assert(contrast(darkInk, darkBg) >= 7, `dark: 正文与页面底色对比度仅 ${contrast(darkInk, darkBg).toFixed(2)}`);
  assert(contrast(darkInk, darkCard) >= 7, `dark: 正文与卡片底色对比度仅 ${contrast(darkInk, darkCard).toFixed(2)}`);
  assert(contrast(pair(dark.get('--muted')), darkBg) >= 4.5, 'dark: 弱化文字低于 AA');
});
