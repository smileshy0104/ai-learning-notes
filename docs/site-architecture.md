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

原“学习地图”是导航页，没有重复成为文章。`catalog.chapters` 是供 `tools/import-lecture.mjs` 使用的旧清单，构建会断言它与 `catalog.lectures` 中第一讲完全一致，因此两份清单不会漂移；文章内容、顺序和标题以 Markdown 元数据为准。

构建还会检查：每篇文章都必须在所属讲次的 `catalog.lectures[].chapters` 注册（未注册的文章不会出现在课程目录里，所以直接报错而不是静默隐藏），`lecture` 字段必须显式写出，不得依赖默认值。

## 交互实验清单

实验在正文中写成 `<!-- lab:l6-metrics -->`，讲次前缀必填。`loadContent` 渲染实验、读取其标题段（`.l<N>-title` 或 `.l<N>-lab-title`），把结果收集到 `data.labs`；`labs.html` 由这份注册表按讲次生成，新增实验不需要改页面代码。每页只加载本讲 `lecture<N>.css`，第一讲继续使用 `lesson.css`。

实验模板必须单行输出：标记会在 Markdown 解析前被替换，模板里出现空行会让 `marked` 把解说当正文重新解析，构建会直接拒绝含换行的实验输出。新增实验的解说文字应写在 Markdown 正文里，渲染模块只负责计算数值和填充面板。

各讲共用的不变量放在 `tools/lecture-contract.mjs`：已发布章节数、未渲染的 Markdown 强调、无证据的掌握声明、实验注册与 `labs.html` 收录、生成笔记的相对链接、原始资料的页数与 SHA-256。章节数、页数和笔记文件名都从 `catalog.lectures` 的 `chapters`、`pages`、`note` 读取，因此新增讲次只需调用 `registerLectureContract({number, labs})`，并在 catalog 登记该讲。第一讲没有 `note` 字段，合并笔记仍由人工维护，导出脚本会明确报错而不是覆盖它。

`tools/materials.test.mjs` 跨讲检查全部归档：每个文件的字节数与 SHA-256、每讲一个 PDF 与一个文字稿、README 必须列出文件名。

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

## 第四讲内容与实验

第四讲正文为 `l4-*.md`，带 `lecture: 4`，11篇文章在 `catalog.lectures` 注册。`site/lib/lecture4-examples.mjs` 计算有限动作策略梯度、基线方差、重要性采样、PPO裁剪、GAE、KL与长度权重。四个实验标记为 `<!-- lab:l4-baseline -->`、`<!-- lab:l4-ppo-clip -->`、`<!-- lab:l4-length-weight -->`、`<!-- lab:l4-kl-direction -->`；对应样式为 `site/assets/lecture4.css`，不依赖JavaScript。

运行 `npm run notes:lecture4` 导出完整Markdown。数值、内容与导出链接由 `tools/lecture4.test.mjs` 检查，浏览器测试在桌面／手机、有／无脚本下切换实验。资料归档在 `materials/cme295/lecture-04/`，维护记录不放入公开正文。

## 第五讲内容与实验

第五讲为12篇 `l5-*.md`，使用 `lecture: 5` 与 `catalog.lectures` 覆盖清单。`site/lib/lecture5-examples.mjs` 提供在线注意力递推、ZeRO预算、Roofline、分页槽位、KV大小和推测采样质量恢复的教学计算。

五个标记为 `<!-- lab:l5-online -->`、`<!-- lab:l5-zero -->`、`<!-- lab:l5-roofline -->`、`<!-- lab:l5-paging -->`、`<!-- lab:l5-speculative -->`，由 `site/assets/lecture5.css` 提供无脚本切换。数值、源资料哈希、导出链接和章节渲染在 `tools/lecture5.test.mjs` 检查；浏览器测试覆盖桌面／手机、有／无JavaScript。

运行 `npm run notes:lecture5` 导出同源完整笔记，资料放在 `materials/cme295/lecture-05/`，不公开原稿。架构变更（GQA／MLA／MTP）、等价算子重排和保持分布的采样校正，在正文中分别说明，不能统称无损替换。

## 第六讲内容与实验

第六讲为13篇 `l6-*.md`，使用 `lecture: 6` 和 `catalog.lectures`。`site/lib/lecture6-examples.mjs` 提供二值检索指标、切块、余弦、前缀匹配、缓存成本与合成工具权限决策。

五个标记为 `<!-- lab:l6-metrics -->`、`<!-- lab:l6-tool-gate -->`、`<!-- lab:l6-prefix -->`、`<!-- lab:l6-react -->`、`<!-- lab:l6-compaction -->`，由 `site/assets/lecture6.css` 提供无脚本切换。工具与状态演示不执行网络或设备操作；合成执行门不是生产授权库。

`npm run notes:lecture6` 导出同源笔记；`tools/lecture6.test.mjs` 检查数值、边界、章节、笔记链接与材料哈希，浏览器测试覆盖全部预设。原稿在 `materials/cme295/lecture-06/`，不进入公开构建。

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
- 课程现在支持 `lecture` 元数据与 `catalog.lectures` 覆盖清单；目录按讲次分组，文章侧栏与前后篇限于同一讲。第一讲13篇、第二讲10篇、第三讲12篇、第四讲11篇、第五讲12篇、第六讲13篇均由元数据生成。后续讲次沿用相同结构。
- 同一个概念若要归属多门课，后续可增加独立 concepts 集合与课程引用列表；本次没有复制多套正文。
- 暂无持久化用户进度、账号或评论服务。
