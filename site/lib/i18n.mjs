// 界面文案（非正文）。正文的英文版是 content/ 下同名的 *.en.md 文件。
// 约定：中文文案必须与既有站点输出逐字一致，英文只做翻译，不改变信息量。
export const LANGS = ['zh', 'en'];
export const DEFAULT_LANG = 'zh';

const zh = {
  htmlLang: 'zh-CN',
  switchLabel: 'EN',
  switchTitle: 'Switch to English',
  themeLabels: ['跟随系统', '浅色', '深色'],
  themeAria: '配色：{state}。点击切换',
  attnNames: ['泰迪熊', '可爱', '阅读'],
  copied: '链接已复制',
  copyFailed: '请复制浏览器地址栏中的链接',
  navLabel: '主导航',
  nav: { home: '首页', courses: '课程与专题', library: '知识库', labs: '实验室', map: '知识地图' },
  skip: '跳到正文',
  footerBrand: 'AI Learning Notes · 一起把 AI 学明白',
  footerPaths: '学习路线',
  footerIndex: '知识索引',
  footerNote: '个人整理 · 非官方课程站',
  cards: { articles: '{n} 篇|{n} 篇', read: '阅读 →', start: '开始阅读 →', framework: ' · 已有导读，教程持续补充', course: ' · 按讲次持续整理' },
  home: {
    title: '把 AI 的每一步都学明白',
    eyebrow: '原理 · 框架 · 实践',
    h1: '把 AI 的每一步，<br>都学明白。',
    intro: '从基础概念到 Transformer，从 LangChain、LangGraph 到 Eino。用清晰的解释、具体的例子和可操作的图解，连接知识与实践。',
    start: '从基础开始 →',
    browse: '浏览课程与专题',
    meta: '公开阅读 · 中文讲解 · 保留英文术语',
    artEyebrow: '知识怎样连接起来',
    artRows: ['基础概念', '模型原理', '框架与工具', 'AI 应用'],
    artCore: '理解 · 验证 · 实践',
    artLink: '探索知识地图 ↗',
    sectionTitle: '选择你的学习方向',
    sectionNote: '课程提供顺序，专题深入工具，知识页可以独立阅读。',
    sectionLink: '全部方向 →',
    bannerTitle: '先用一个例子，看懂注意力。',
    bannerNote: '从 Q 与 K 的匹配，到对 V 的加权求和。调整查询，观察结果。',
    bannerLink: '进入交互实验 →',
    startTitle: '不确定先学什么？',
    firstLecture: 'CME295 · 第一讲',
  },
  courses: {
    title: '课程与专题',
    description: '从公开课程到 AI 开发框架，选择适合的学习方向。',
    heading: '把课程、框架与后续实践放在同一套知识结构里。每个专题都可以独立新增内容。',
    filter: '按内容类型浏览',
    all: '全部',
    kindCourse: '课程',
    kindFramework: '框架专题',
    note: 'CME295 按讲次组织已整理的章节。框架专题目前提供概念导读，具体 API 与实战文章将随学习逐步添加。',
  },
  collection: {
    published: '{n} 篇已发布',
    frameworkNote: '概念导读已发布 · API 教程待整理',
    pdfPages: 'PDF {n} 页',
    emptyEn: '',
    readZh: '',
  },
  library: {
    title: '知识库',
    description: '按概念查阅机器学习、Transformer 与框架知识。',
    heading: '每个知识页都有稳定链接。你可以跟随课程阅读，也可以直接查一个概念。',
    placeholder: '搜索标题、术语或正文，例如 前向传播、attention、State…',
    label: '搜索知识',
    noscript: '当前显示全部文章，可用浏览器的查找功能定位内容。',
    empty: '没有找到相关内容，试试“注意力”“前向传播”或“状态”。',
  },
  article: {
    lecture: 'Lecture {n}',
    gettingStarted: 'Getting started',
    toc: '本页目录',
    sidebarLabel: '专题目录',
    pagerLabel: '前后篇',
    copyLink: '复制页面链接 ↗',
    previous: '上一篇',
    next: '下一篇',
    collectionIndex: '← 专题目录',
    explore: '探索更多知识 →',
  },
  labs: {
    title: '实验室',
    description: '通过可操作的教学示例理解 AI 模型。',
    heading: '先读懂概念，再亲手改变一个输入，观察计算过程和结果。所有数值为教学示例。',
    eyebrow: '01 / Attention',
    demoTitle: '改变 Q，会读取哪些信息？',
    demoLink: '阅读完整解释 ↗',
    demoWords: ['泰迪熊', '可爱', '阅读'],
    demoNote: '固定 K=[[1,0],[0,1],[1,1]]，V=[[1,0],[0,2],[1,1]]，dₖ=2。用 softmax(QKᵀ/√2)V 计算，展示值四舍五入。',
    all: '全部实验',
    allTitle: '{n} 个交互组件，按讲次排列',
    allNote: '第一讲是随早期笔记整理的图解，其余按正文中的实验标记自动收集，新增实验后无需再改配置。',
    courseIndex: '课程目录 →',
    groupCount: '{n} 个实验|{n} 个实验',
    cardNote: '位于《{title}》正文中。所有数值均为教学示例。',
    empty: '交互实验目前只有中文版。英文章节会随翻译逐步加入。',
    emptyLink: '查看中文实验室 →',
    baseCards: [['basics', '实验：一次参数更新后，概率与损失怎么变？'], ['tokens', '实验：分词粒度不同，符号怎样逐步合并？'], ['mask', '实验：每个位置能读到哪些 token？'], ['attention', '实验：改变查询向量，注意力权重怎样重新分配？']],
  },
  map: {
    title: '知识地图',
    description: '从基础到应用，看清建议的知识依赖。',
    heading: '把学习内容连接起来。下方表示建议的阅读路径，不要求每个人都按唯一顺序学习。',
    nodes: [
      ['向量与模型训练', '先理解输入、参数、损失与更新。'],
      ['分词与词元表示', '从文字变成模型可以处理的向量。'],
      ['注意力与核心组件', '理解上下文读取与信息变换。'],
      ['Transformer 架构', '把组件连接成编码器与解码器。'],
      ['框架与编排', '从模型调用走向状态与执行流程。'],
    ],
    sectionTitle: '从基础走向三个框架',
    sectionNote: '工具调用、消息和状态等通用概念相互联系，各框架的 API 需要分别学习。',
    note: '英文章节正在逐篇补充；完整的课程正文目前为中文版。',
  },
  notFound: {
    title: '页面不存在',
    description: '请从知识库或课程目录继续。',
    heading: '这里还没有内容',
    note: '页面可能已经调整，可以从课程目录或知识库继续阅读。',
    courses: '课程与专题 →',
  },
};

const en = {
  htmlLang: 'en',
  switchLabel: '中文',
  switchTitle: '切换到中文',
  themeLabels: ['System', 'Light', 'Dark'],
  themeAria: 'Colour: {state}. Click to change',
  attnNames: ['teddy bear', 'cute', 'reading'],
  copied: 'Link copied',
  copyFailed: 'Copy the URL from your address bar',
  navLabel: 'Primary navigation',
  nav: { home: 'Home', courses: 'Courses', library: 'Library', labs: 'Labs', map: 'Knowledge map' },
  skip: 'Skip to content',
  footerBrand: 'AI Learning Notes · Learn AI, step by step',
  footerPaths: 'Learning paths',
  footerIndex: 'Library index',
  footerNote: 'Personal notes · unofficial course site',
  cards: { articles: '{n} article|{n} articles', read: 'Read →', start: 'Start reading →', framework: ' · overview published, tutorials pending', course: ' · organised by lecture' },
  home: {
    title: 'Understand every step of AI',
    eyebrow: 'Concepts · Frameworks · Practice',
    h1: 'Understand every step<br>of AI.',
    intro: 'From fundamentals to Transformers, from LangChain and LangGraph to Eino. Clear explanations, concrete examples and hands-on diagrams that connect knowledge with practice.',
    start: 'Start with the basics →',
    browse: 'Browse courses',
    meta: 'Free to read · bilingual · English terms kept',
    artEyebrow: 'How knowledge connects',
    artRows: ['Fundamentals', 'Model internals', 'Frameworks & tools', 'AI applications'],
    artCore: 'Understand · Verify · Practise',
    artLink: 'Explore the knowledge map ↗',
    sectionTitle: 'Choose a learning path',
    sectionNote: 'Courses give an order, topic pages go deeper into tools, and knowledge pages stand on their own.',
    sectionLink: 'All paths →',
    bannerTitle: 'See attention with one worked example.',
    bannerNote: 'From matching Q against K to weighting V. Change the query and watch the result.',
    bannerLink: 'Open the interactive lab →',
    startTitle: 'Not sure where to start?',
    firstLecture: 'CME295 · Lecture 1',
  },
  courses: {
    title: 'Courses',
    description: 'From a public course to AI engineering frameworks: choose the path that fits you.',
    heading: 'Courses, frameworks and practice in one knowledge structure. Every collection can grow independently.',
    filter: 'Filter by type',
    all: 'All',
    kindCourse: 'Course',
    kindFramework: 'Framework',
    note: 'CME295 groups finished chapters by lecture. Framework collections currently offer conceptual overviews; API walkthroughs will follow as the course progresses.',
  },
  collection: {
    published: '{n} published',
    frameworkNote: 'Overview published · API tutorials pending',
    pdfPages: '{n} PDF pages',
    emptyEn: 'No English chapters in this collection yet.',
    readZh: 'Read the Chinese edition →',
  },
  library: {
    title: 'Library',
    description: 'Look up machine-learning, Transformer and framework concepts.',
    heading: 'Every knowledge page has a stable link. Follow a course in order or jump straight to a concept.',
    placeholder: 'Search titles, terms or full text, e.g. attention, gradient, State…',
    label: 'Search knowledge',
    noscript: 'All articles are listed; use your browser’s find-in-page to locate content.',
    empty: 'Nothing matched. Try “attention”, “forward pass” or “state”.',
  },
  article: {
    lecture: 'Lecture {n}',
    gettingStarted: 'Getting started',
    toc: 'On this page',
    sidebarLabel: 'Collection chapters',
    pagerLabel: 'Pagination',
    copyLink: 'Copy page link ↗',
    previous: 'Previous',
    next: 'Next',
    collectionIndex: '← Collection',
    explore: 'Explore more →',
  },
  labs: {
    title: 'Labs',
    description: 'Understand AI models through hands-on teaching examples.',
    heading: 'Read the concept first, then change one input by hand and watch the computation. All numbers are teaching examples.',
    eyebrow: '01 / Attention',
    demoTitle: 'Change Q: which inputs does it read?',
    demoLink: 'Read the full explanation ↗',
    demoWords: ['teddy bear', 'cute', 'reading'],
    demoNote: 'Fixed K=[[1,0],[0,1],[1,1]], V=[[1,0],[0,2],[1,1]], dₖ=2. Computed as softmax(QKᵀ/√2)V; values rounded.',
    all: 'All experiments',
    allTitle: '{n} interactive components by lecture',
    allNote: 'Lecture 1 holds the early diagrams; the rest are collected from lab markers in the text, so new labs need no page edits.',
    courseIndex: 'Course index →',
    groupCount: '{n} lab|{n} labs',
    cardNote: 'Inside “{title}”. All numbers are teaching examples.',
    empty: 'Interactive labs are currently published in Chinese only; English chapters will be added as translation proceeds.',
    emptyLink: 'Open the Chinese labs page →',
    baseCards: [['basics', 'Lab: after one parameter update, how do the probabilities and loss change?'], ['tokens', 'Lab: how do symbols merge at different tokenisation granularities?'], ['mask', 'Lab: which tokens can each position read?'], ['attention', 'Lab: change the query vector — how do the attention weights shift?']],
  },
  map: {
    title: 'Knowledge map',
    description: 'See the suggested dependencies from fundamentals to applications.',
    heading: 'Connecting the material. The path below is a suggestion, not the only order you can learn in.',
    nodes: [
      ['Vectors and training', 'Start with inputs, parameters, loss and updates.'],
      ['Tokens and representations', 'Turning text into vectors a model can use.'],
      ['Attention and components', 'How context is read and transformed.'],
      ['Transformer architecture', 'Assembling components into encoder and decoder.'],
      ['Frameworks and orchestration', 'From model calls to state and execution flows.'],
    ],
    sectionTitle: 'From fundamentals to three frameworks',
    sectionNote: 'Tool calling, messages and state are shared concepts; each framework’s API still needs its own study.',
    note: 'English chapters are being added one at a time; the complete course text is currently Chinese.',
  },
  notFound: {
    title: 'Page not found',
    description: 'Continue from the library or the course index.',
    heading: 'Nothing here yet',
    note: 'The page may have moved. Continue from the course index or the library.',
    courses: 'Courses →',
  },
};

const table = { zh, en };

export function t(lang) {
  const value = table[lang];
  if (!value) throw new Error(`Unknown language: ${lang}`);
  return value;
}
export const htmlLang = lang => t(lang).htmlLang;
export const isLang = lang => Object.hasOwn(table, lang);
export const otherLang = lang => (lang === 'en' ? 'zh' : 'en');
// 路径前缀：中文在根目录，英文在 /en/ 之下。
export const langPrefix = lang => (lang === 'zh' ? '' : `${lang}/`);
export const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
// JS 无法读取模块，脚本所需文案通过 <html data-*> 传递；用 | 分隔多段。
export const pack = values => values.join('|');
// 目录项（collections/lectures）的英文版字段形如 titleEn/descriptionEn；缺失时回退到中文。
export const pick = (item, field, lang) => (lang === 'zh' ? item[field] : item[`${field}En`] ?? item[field]);
// 站点页（首页/列表/实验室等）两种语言各有一份，路径互为镜像。
export const counterpart = url => (url.startsWith('en/') ? url.slice(3) : `en/${url}`);

// 单复数：模板用 | 分隔「一个 / 多个」两种写法。
export const countOf = (template, n) => {
  const [one, many] = template.split('|');
  return (n === 1 ? one ?? many : many ?? one).replace('{n}', n);
};
