import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const [collection,slug,title]=process.argv.slice(2);
if(!collection||!/^[a-z0-9-]+$/.test(slug??'')||!title)throw new Error('Usage: npm run new:article -- <collection> <slug> "Title"');
const catalog=JSON.parse(await fs.readFile(path.join(root,'content/catalog.json'),'utf8'));
const definition=catalog.collections.find(c=>c.slug===collection);
if(!definition)throw new Error('Unknown collection. Register it in content/catalog.json first.');

// 译文章节必须声明讲次；先放占位，发布前改成实际讲次。
const lectureLine=definition.lectures===true?'lecture: 1  # TODO: 改成实际讲次\n':'';
const body=`
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
`;
const englishBody=`
## What it is

Start with a clear definition, then explain the problem it solves.

## Why it is needed

Describe the limitation of the previous approach.

## A worked example

Give the input, the computation and the output. Verify every number with a script.

## Common confusions

Add boundaries and limitations.

## Sources

Cite the original source and version. Framework API examples must state the tested versions.
`;
const files={
 [`${slug}.md`]:`---
slug: ${slug}
title: ${JSON.stringify(title)}
collection: ${collection}
${lectureLine}description: "填写文章简介"
order: 1000
kind: guide
status: draft
tags: []
---
${body}`,
 // 新章节必须同时提供英文版：这里直接生成占位文件，避免发布时缺译文。
 [`${slug}.en.md`]:`---
slug: ${slug}
title: ${JSON.stringify(`${title} (English)`)}
collection: ${collection}
${lectureLine}lang: en
description: "Write a one-line English summary"
order: 1000
kind: guide
status: draft
tags: []
---
${englishBody}`,
};

for(const [name,content] of Object.entries(files)){
 const file=path.join(root,'content/collections',collection,name);
 await fs.mkdir(path.dirname(file),{recursive:true});
 await fs.writeFile(file,content,{flag:'wx'});
 console.log(`Created draft: ${path.relative(root,file)}`);
}
console.log('New chapters ship Chinese and English together: fill both files, then set status: published in each.');
console.log('If the Chinese version goes live before the translation, register it in content/translations.json instead.');
