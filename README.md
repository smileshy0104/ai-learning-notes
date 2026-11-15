# AI Learning Notes · AI 学习笔记

用于持续整理 AI 相关课程与知识，包括原始学习资料、详细中文笔记与可交互 HTML 图解。

当前学习课程为 Stanford CME295 Transformers & LLMs（所提供材料标记为 2026 年秋季）。

## 开始学习

- [课程目录与学习进度](study-notes/cme295-fall2026/README.md)
- [第一讲：Transformers 详细笔记](study-notes/cme295-fall2026/lecture-01-transformers.md)
- [第一讲：交互图解](study-notes/cme295-fall2026/lecture-01-visual.html)，从 Introduction 开始，使用浏览器打开。
- [第一讲原始课件](fall26-cme295-lecture1.pdf)

## 目录组织

```text
.
├── README.md
├── AGENTS.md
├── fall26-cme295-lecture1.pdf
├── [Chinese Traditional] ... [DownSub.com].txt
└── study-notes/
    └── cme295-fall2026/
        ├── README.md
        ├── lecture-01-transformers.md
        └── lecture-01-visual.html
```

课件及字幕保留来源内容；笔记和图解用于个人学习。原始资料的权利归相应权利人所有。公开分发资料之前，应核实其授权条件。

## 查看 HTML

页面无需构建、安装依赖或联网。直接用浏览器打开 HTML 文件即可。

如果需要通过本地服务器查看，可在本仓库目录运行：

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

然后访问 <http://127.0.0.1:8000/study-notes/cme295-fall2026/lecture-01-visual.html>。按 `Ctrl+C` 停止服务。

## 维护原则

先用通俗语言解释问题，再提供例子、公式、推导和理解检查。课程内容需关联 PDF 页码；补充解释和教学数据需要明确标注。学习中的疑问与澄清持续更新到对应讲次，未经确认不标记为已经掌握。
