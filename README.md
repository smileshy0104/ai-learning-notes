# AI Learning Notes · AI 学习笔记

一个统一风格、可部署的 AI 学习站。内容覆盖课程、模型原理和开发框架，保留“概念 → 为什么 → 具体例子 → 易错点”的讲解方式。

当前内容：CME295 第一讲13个章节、第二讲10篇、第三讲12篇详细讲解，以及 LangChain、LangGraph、Eino 三篇概念导读。框架 API 教程和实战尚待整理。

## 运行

需要 Node.js 20 或以上版本：

```bash
npm ci
npm start
```

打开 <http://127.0.0.1:8000/>。`npm start` 会构建一次再启动预览；修改内容后运行 `npm run build` 并刷新页面。第二、第三讲完整 Markdown 笔记可分别用 `npm run notes:lecture2`、`npm run notes:lecture3` 从相同内容源导出。预览端口可用 `PORT=8080 npm start` 指定。

页面入口：

- `/index.html`：统一首页
- `/courses.html`：课程与框架专题
- `/library.html`：知识库与正文搜索
- `/labs.html`：可交互实验
- `/map.html`：建议的学习路径
- `/collections/cme295.html`：按第一至第三讲分组的课程目录
- `/topics/cme295/l2-overview.html`：第二讲导读与页码索引
- `/topics/cme295/l3-overview.html`：第三讲训练流程与页码索引
- `/topics/cme295/basics.html`：完整基础概念内页

早期 Demo 的 `course.html`、`docs.html`、`basics.html` 地址保留过渡入口。`demos/` 仅保留旧设计参考，不再是发布目录。

## 原始资料

PDF 和文字稿统一存放在 [materials/ 资料索引](materials/README.md)，按课程和讲次分目录。第一至第三讲都已归档 PDF 与相应语言字幕；每个文件的 SHA-256 与大小记录在 `materials/manifest.json`。这些原材料不包含在网站公开构建中。

## 新增内容

已有专题里新增一篇文章：

```bash
npm run new:article -- langgraph checkpoints "检查点与恢复"
```

它生成 `content/collections/langgraph/checkpoints.md` 草稿。填写正文和简介、设置 `order`，完成核对后改为 `status: published`。构建时自动加入：

- 专题目录
- 知识库
- 搜索索引
- 文章目录与前后篇
- 站点链接检查

新专题只需在 `content/catalog.json` 的 `collections` 中登记，再添加内容。详细说明见 [内容维护与代码结构](docs/site-architecture.md)。

## 代码结构

```text
content/
  catalog.json                  # 站点信息、专题与第一讲覆盖清单
  collections/<topic>/*.md       # 带元数据的内容文件
site/
  lib/content.mjs               # 解析、校验、Markdown 转换与目录提取
  lib/layout.mjs                # 所有页面共享的头部、导航与页脚
  lib/pages.mjs                 # 首页、列表、阅读页、实验室等模板
  assets/site.css               # 全站统一主题与响应式布局
  assets/site.js                # 分类、搜索、复制链接
  assets/lesson.css              # 第一讲已有图解组件的作用域样式
  assets/lesson.js               # 已有注意力滑块
 tools/
  build-site.mjs                # 静态构建
  serve-site.mjs                # 本地预览
  check-site.mjs                # 页面、导航、文件、锚点与索引检查
  new-article.mjs               # 新建草稿
 tests/site.spec.mjs            # 桌面/手机、有/无脚本验收
 deploy/nginx.conf              # 静态服务配置
```

原始 PDF、字幕、参考材料、旧第一讲 HTML 与笔记均保留。当前发布直接读取拆分后的 `content/`，不要求每次从旧 HTML 重新提取。`tools/import-lecture.mjs` 是一次性迁移工具，勿对已编辑的内容反复运行。

## 验证

```bash
npm run build
npm run check
npm test
```

浏览器检查默认使用本机 Chrome。没有 Chrome 时可运行 `npx playwright install chromium`，然后 `PLAYWRIGHT_CHANNEL=chromium npm test`。检查覆盖第一讲所有页面、框架导读、断链、重复 ID、手机横向溢出、分类、正文搜索和已有实验；禁用脚本仍能阅读和切换主要预设。

## 部署

```bash
npm run build
```

把 `dist/` 上传到 Nginx 或静态托管服务。也可：

```bash
docker build -t ai-learning-notes .
docker run --rm -p 8080:80 ai-learning-notes
```

Docker 运行层仅使用 Nginx，访问 <http://127.0.0.1:8080/>。当前环境 Docker daemon 未启动，因此镜像构建与容器运行未验收；本地 HTTP 预览及浏览器检查已通过。远程服务器尚未发布。

## 内容边界

课程原意、补充说明、教学数据和参考来源需要区分。原始 PDF、字幕与参考文档没有自动包含到公开构建；原始资料权利归相应权利人所有。框架导读提供概念介绍，后续 API 示例需注明实际测试的版本。

旧资料入口：[课程笔记](study-notes/cme295-fall2026/README.md)、[原第一讲 HTML](study-notes/cme295-fall2026/lecture-01-visual.html)、[参考读物副本](references/llm-foundations.md)。
