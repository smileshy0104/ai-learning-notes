# 原始学习资料

`materials/` 统一存放每门课程对应的 PDF、文字稿与来源说明；正文解释在 `content/`，学习笔记在 `study-notes/`。

| 课程 | 讲次 | PDF | 文字稿 | 页数 |
| --- | --- | --- | --- | --- |
| CME295 | Lecture 1 · Transformers | [课件](cme295/lecture-01/fall26-cme295-lecture1.pdf) | [繁体中文字幕稿](cme295/lecture-01/transcript.zh-Hant.txt) | 118 |
| CME295 | Lecture 2 · Large Language Models | [课件](cme295/lecture-02/fall26-cme295-lecture2.pdf) | [繁体中文字幕稿](cme295/lecture-02/transcript.zh-Hant.txt) | 138 |
| CME295 | Lecture 3 · LLM training | [课件](cme295/lecture-03/fall26-cme295-lecture3.pdf) | [英文自动字幕](cme295/lecture-03/transcript.en.txt) | 165 |
| CME295 | Lecture 4 · Reinforcement Learning with LLMs | [课件](cme295/lecture-04/fall26-cme295-lecture4.pdf) | [英文自动字幕](cme295/lecture-04/transcript.en.txt) | 135 |
| CME295 | Lecture 5 · LLM Systems | [课件](cme295/lecture-05/fall26-cme295-lecture5.pdf) | [英文字幕](cme295/lecture-05/transcript.en.txt) | 156 |

```text
materials/
├── README.md
├── manifest.json
└── cme295/
    ├── lecture-01/
    │   ├── README.md
    │   ├── fall26-cme295-lecture1.pdf
    │   └── transcript.zh-Hant.txt
    ├── lecture-02/
    │   ├── README.md
    │   ├── fall26-cme295-lecture2.pdf
    │   └── transcript.zh-Hant.txt
    ├── lecture-03/
    │   ├── README.md
    │   ├── fall26-cme295-lecture3.pdf
    │   └── transcript.en.txt
    ├── lecture-04/
    │   ├── README.md
    │   ├── fall26-cme295-lecture4.pdf
    │   └── transcript.en.txt
    └── lecture-05/
        ├── README.md
        ├── fall26-cme295-lecture5.pdf
        └── transcript.en.txt
```

## 归档约定

- 每讲归档对应 PDF 与文字稿，保留文件原始字节，不在原材料里改错别字或机器翻译。
- 课件保留原文件名主体（可去掉重复下载的` (1)`后缀并在README登记）；文字稿按语言命名，如 `transcript.zh-Hant.txt`、`transcript.en.txt`，原始名称记录在各讲 README。
- `manifest.json` 记录原材料相对路径、大小和 SHA-256，用于检查漏文件或误修改。后续加入资料时同步更新。
- 原文件入库与网站公开是两件事。当前静态构建与 Docker 不复制 `materials/`；公开资料需要单独确认分发范围。
- 本地新文件未提交、或提交后未推送时，远程 GitHub 目录不会显示。本目录不能仅靠 Markdown 索引代替实际文件。
