# AI Learning Notes 网站原型

> 此目录为三套历史设计 Demo，保留用于对照，不再参与当前发布。现在 `npm run build` 构建的是统一站点（`content/` + `site/`），最新运行方式见 [项目 README](../README.md)。下文的 Demo 构建说明为历史记录。

这里提供三套可部署的静态网站原型，使用同一批 AI 学习内容，但信息结构不同：

- `index.html`：方案选择页
- `course.html`：**循序 / 课程学习站**，适合从头跟着路线学习
- `docs.html`：**知页 / 知识文档站**，适合独立阅读、搜索和分享具体概念
- `map.html`：**星图 / 知识地图站**，适合探索概念依赖关系
- `basics.html`：课程站中的详细阅读内页示例
- `assets/`：共享样式和交互脚本

## 本地查看

在本目录运行：

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

打开：<http://127.0.0.1:8000/>。

直接用 `file://` 打开也可查看大部分内容；推荐通过 HTTP 静态服务器访问，因为真实部署也会使用 HTTP。

## 设计方向

### 方案一：循序 · 课程学习站

核心问题是“我应该从哪里开始”。

- 有清晰的课程与章节路线。
- 每个学习单元都按照定义、动机、例子、易错点组织。
- 适合课程材料和连续学习。
- 后续可以增加学习进度、收藏、练习和讲次更新。

### 方案二：知页 · 知识文档站

核心问题是“这个概念到底是什么”。

- 每个主题有独立锚点和可分享 URL。
- 左侧目录、正文、右侧页内目录适合详细阅读。
- 适合公式、表格、代码、实验和引用。
- 后续可以接静态 Markdown/MDX 内容源、全文搜索和版本历史。

### 方案三：星图 · 知识地图站

核心问题是“这些知识怎样连接”。

- 节点表示概念，箭头表示建议的学习依赖。
- 点击节点查看描述、前置知识和阅读入口。
- 适合复习、探索缺口和跨课程导航。
- 后续可以从内容元数据自动生成关系图，而不是手动画图。

## 推荐的正式架构

建议正式网站采用三者组合，而不是三选一：

```text
首页 / Course hub
  ├── 课程路线：适合第一次学习
  ├── 知识库：每个概念一个稳定页面
  ├── 交互实验：独立、可复用、可分享
  └── 知识地图：展示前置关系与后续方向
```

内容不要继续全部写进一份 HTML。建议拆成：

```text
content/
  courses/cme295/lecture-01.md
  concepts/forward-propagation.md
  concepts/self-attention.md
  concepts/encoder-decoder.md
  labs/attention-experiment.md
  graph/relations.yaml
```

再由静态站点构建器生成页面。适合的技术路线包括：Astro、Docusaurus、VitePress 或 Next.js 静态导出。当前原型使用原生 HTML/CSS/JavaScript，是为了先比较信息结构，不绑定框架。

## 构建与容器预览

在仓库根目录运行：

```bash
npm run build
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

构建脚本仅复制 Demo 页面和资源，不发布原始 PDF、字幕或参考资料。

也可以使用仓库根目录的 Dockerfile：

```bash
docker build -t ai-learning-notes:demo .
docker run --rm -p 8080:80 ai-learning-notes:demo
```

容器预览地址为 <http://127.0.0.1:8080/>。本次环境的 Docker daemon 未运行，镜像构建与容器验收尚未执行；浏览器验证使用本地 HTTP 静态服务完成。

## 部署建议

这是纯静态内容，初期不需要后端：

- Cloudflare Pages
- GitHub Pages
- Netlify
- Vercel Static Export
- 自己的 Nginx + CDN

Nginx 最小配置示意：

```nginx
server {
    listen 80;
    server_name learn.example.com;
    root /srv/ai-learning-notes/demos;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }
}
```

后续需要账号、同步进度、评论、投稿或后台编辑时，再增加 API 和数据库；不要一开始就让学习内容依赖登录。

## 原型限制

- 目前使用少量代表性内容，不是完整课程迁移。
- 搜索是示例级定位，不是完整全文搜索。
- 知识地图关系是手写示例，正式版本应从内容元数据生成。
- 没有伪造用户、学习人数、完成率或社区动态。
- 已在 Chrome 1440px 与 390px 视口中检查布局；还需要在真实移动设备、目标域名与 Nginx/CDN 环境最终验收。
- 当前页面是多页原型。正式版将把知识拆成 Markdown/MDX 内容文件，由统一模板生成，避免继续手工维护大型 HTML。
