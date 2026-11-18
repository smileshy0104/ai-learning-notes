# 内容维护与代码结构

## 当前方案

统一站采用 Node.js 静态内容构建：Markdown/frontmatter 为内容源，共用页面模板和主题，生成可直接部署到 Nginx 的静态文件。当前没有引入账户、数据库或运行时应用框架。

初期设计中的 Astro/MDX 保留为未来选项。本次直接把现有笔记和图解拆分，避免为统一风格重新实现所有实验。现有动态内容仍可离线使用，核心阅读不依赖 JavaScript。

## 职责边界

| 路径 | 职责 | 新增文章时是否修改 |
| --- | --- | --- |
| `content/collections/` | 正文与文章元数据 | 是 |
| `content/catalog.json` | 专题定义，第一讲章节覆盖清单 | 新专题时修改 |
| `site/lib/content.mjs` | 解析校验、Markdown 转换、提取目录 | 一般不需要 |
| `site/lib/layout.mjs` | 统一导航、头尾、资源引用 | 一般不需要 |
| `site/lib/pages.mjs` | 首页、目录、知识库、文章等模板 | 一般不需要 |
| `site/assets/site.css` | 统一设计变量和响应式布局 | 一般不需要 |
| `site/assets/lesson.css` | 原第一讲图解的作用域样式 | 仅维护旧图解 |
| `site/assets/site.js` | 正文搜索、分类、复制链接 | 一般不需要 |
| `tools/` | 构建、预览、新建、验证 | 一般不需要 |

`lesson.css` 先载入，统一的 `site.css` 后载入，因此图解可保留原有交互，同时使用统一配色与排版。现有 SVG 中含语义颜色（例如红色交叉注意力箭头），保留这些区分。

## 一篇文章的元数据

```yaml
---
slug: checkpoints
title: 检查点与恢复
collection: langgraph
description: 解释执行状态如何保存，以及恢复时需要注意什么。
order: 20
kind: guide
status: published
tags: [LangGraph, Checkpoint, 持久化]
---
```

- `slug` 与 `collection` 共同生成稳定地址；修改标题不改变地址。
- `order` 决定专题中的阅读顺序，建议使用 10、20、30，便于插入。
- `status: draft` 不发布、不进搜索；改成 `published` 才显示。
- `tags` 和正文加入搜索索引。
- Markdown 的二、三级标题自动生成页内目录；带自定义 id 的 HTML 标题保留原锚点。
- 新增内容优先 Markdown；需要图解或预设切换时可嵌入 HTML。仓库内容视为受信任的作者内容，未设计面向任意用户的 HTML 投稿功能。

## 新增专题

在 `content/catalog.json` 的 `collections` 增加定义：

```json
{
  "slug": "rag",
  "title": "RAG 与检索增强",
  "kind": "framework",
  "label": "工程专题",
  "description": "从文档处理、检索到答案验证。",
  "icon": "↗"
}
```

然后：

```bash
npm run new:article -- rag introduction "RAG 入门"
```

完成文章并发布后，无需手工修改首页、专题列表、知识库或搜索。`kind` 当前使用 `course` / `framework` 两个分类；后续需要单独的 `practice` 分类时，再同步增加筛选按钮。

## 第一讲迁移

原 HTML 的 13 个正式内容区块均迁移为单独文章：Introduction、基础工具箱、N-gram、Tokenization、词元表示、神经网络、自注意力、核心组件、Encoder/Decoder、Mask、端到端示例、展望、深入补充。

原“学习地图”是导航页，没有重复成为文章。`catalog.chapters` 保留每个章节的 slug，构建发现缺章会直接报错；文章内容、顺序和标题以 Markdown 元数据为准。

`tools/import-lecture.mjs` 为一次性迁移脚本：

1. 按 section ID 从原始 HTML 提取完整区块。
2. 把跨区块锚点改写为不同文章之间的链接。
3. 提取作用域 CSS 和有条件执行的注意力脚本。
4. 写入带元数据的 Markdown。

**不要在正常编辑流程重复运行这个迁移脚本**，因为它会从旧 HTML 重新覆盖文章。后续发布以 `content/` 为内容源。

## 第二讲内容与实验

第二讲正文在 `content/collections/cme295/l2-*.md`，带有 `lecture: 2`。正文可写 `<!-- lab:temperature -->`、`<!-- lab:routing -->` 或 `<!-- lab:window -->`，构建时由 `site/lib/lecture2-examples.mjs` 生成离线 CSS 交互。`tools/lecture2.test.mjs` 验证温度分布、Top-p、旋转关系、缓存字节数和辅助损失等数值。

`npm run notes:lecture2` 将这些同源正文合并成可独立阅读的 Markdown 笔记，不再手工维护两套第二讲正文。原始 PDF 与字幕在 `materials/` 保留，构建只取 `content/` 和 `site/assets/`，不会自动公开资料。

## 第三讲内容与实验

第三讲正文为 `l3-*.md`，带 `lecture: 3`，覆盖清单在 `catalog.lectures`。三个交互标记为 `<!-- lab:l3-loss-mask -->`、`<!-- lab:l3-preference-gap -->`、`<!-- lab:l3-group-advantage -->`，由 `site/lib/lecture3-examples.mjs` 构建静态预设，不依赖浏览器脚本。

`tools/lecture3.test.mjs` 检查 CE/BPB、SFT掩码、LoRA矩阵与参数量、Bradley–Terry、DPO、KL、组内优势、装箱与全部原材料哈希。它们是教学计算，不是 GPU 训练结果。

`npm run notes:lecture3` 从相同内容生成完整笔记。第二讲旧命令保持兼容，底层已共用 `tools/export-lecture-notes.mjs`；第三讲增加时无需复制另一套导出逻辑。

## 发布与检查

构建流程：

```text
内容文件 → frontmatter 校验 → Markdown 转换 → 目录提取
        → 统一页面模板 → dist HTML + CSS/JS + 正文搜索索引
```

构建检查重复 slug、未知专题、缺字段、未发布状态和第一讲覆盖。`npm run check` 再校验所有发布页面的主导航、重复 ID、文件链接、锚点和搜索索引。

`npm test` 运行构建、链接检查与 Playwright：桌面 1440px、手机 390px，脚本开启和禁用共四种配置。覆盖全部内容页、文档溢出、参数更新、BPE、注意力、生成步骤、实验室预设、筛选与全文搜索。

## 仍然保留的技术边界

- 第一讲内容中仍含原 HTML 图解，这属于渐进迁移。后续可把通用实验抽成组件函数或独立内容块，避免在新文档里复制图解。
- 知识地图现在是精简的建议路线，并非自动生成的复杂依赖图。
- 搜索索引在客户端加载，适合当前规模；规模明显增长后可换分片索引或 Pagefind。
- 课程现在支持 `lecture` 元数据与 `catalog.lectures` 覆盖清单；目录按讲次分组，文章侧栏与前后篇限于同一讲。第一讲13篇、第二讲10篇、第三讲12篇均由元数据生成。后续讲次沿用相同结构。
- 同一个概念若要归属多门课，后续可增加独立 concepts 集合与课程引用列表；本次没有复制多套正文。
- 暂无持久化用户进度、账号或评论服务。
