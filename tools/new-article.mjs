import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const [collection,slug,title]=process.argv.slice(2);
if(!collection||!/^[a-z0-9-]+$/.test(slug??'')||!title)throw new Error('Usage: npm run new:article -- <collection> <slug> "Title"');
const catalog=JSON.parse(await fs.readFile(path.join(root,'content/catalog.json'),'utf8'));
if(!catalog.collections.some(c=>c.slug===collection))throw new Error('Unknown collection. Register it in content/catalog.json first.');
const file=path.join(root,'content/collections',collection,slug+'.md');
await fs.mkdir(path.dirname(file),{recursive:true});
await fs.writeFile(file,`---
slug: ${slug}
title: ${JSON.stringify(title)}
collection: ${collection}
description: "填写文章简介"
order: 1000
kind: guide
status: draft
tags: []
---

## 是什么

先给清晰定义，再解释它解决什么问题。

## 为什么需要

说明前一种方法的限制。

## 一个具体例子

给出输入、计算过程和输出。数值必须用脚本核对。

## 容易混淆的地方

补充边界和限制。

## 参考来源

标注原始来源与版本。框架 API 示例需要注明依赖版本和运行环境。
`,{flag:'wx'});
console.log(`Created draft: ${path.relative(root,file)}. Set status: published when ready.`);
