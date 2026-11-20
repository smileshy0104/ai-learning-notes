# Stanford CME295：Transformers & LLMs 学习记录

本目录用于记录课程学习、讨论和复习。课程版本按所提供材料标记为 2026 年秋季；目前已收到第一至第四讲 PDF，以及对应的繁体中文字幕或英文自动字幕。

## 学习资料

| 讲次 | 主题 | 资料 | 笔记 |
| --- | --- | --- | --- |
| Lecture 1 | Transformers | [PDF](../../materials/cme295/lecture-01/fall26-cme295-lecture1.pdf)、[字幕](../../materials/cme295/lecture-01/transcript.zh-Hant.txt) | [第一讲笔记](lecture-01-transformers.md) |
| Lecture 2 | Large Language Models | [PDF](../../materials/cme295/lecture-02/fall26-cme295-lecture2.pdf)、[字幕](../../materials/cme295/lecture-02/transcript.zh-Hant.txt) | [第二讲完整笔记](lecture-02-large-language-models.md) |
| Lecture 3 | LLM training | [PDF](../../materials/cme295/lecture-03/fall26-cme295-lecture3.pdf)、[英文字幕](../../materials/cme295/lecture-03/transcript.en.txt) | [第三讲完整笔记](lecture-03-llm-training.md) |
| Lecture 4 | Reinforcement Learning with LLMs | [PDF](../../materials/cme295/lecture-04/fall26-cme295-lecture4.pdf)、[英文字幕](../../materials/cme295/lecture-04/transcript.en.txt) | [第四讲完整笔记](lecture-04-reinforcement-learning.md) |

PDF 是概念、术语及页码定位的主要依据；字幕补充课堂解释和问答。字幕存在机器翻译错误，需要结合英文课件校正。笔记中的页码均指 PDF 的物理页码，从封面第 1 页起计数。

## 第四讲：强化学习与LLM

从 [第四讲导读](../../content/collections/cme295/l4-overview.md) 开始；网站入口为 `topics/cme295/l4-overview.html`，分讲目录锚点为 `#lecture-4`。

11篇同源文章按课件顺序覆盖RL与奖励、策略梯度、REINFORCE、基线与信用分配、重要性采样、PPO、参考KL、GRPO、长度／难度／探索改进、On-policy蒸馏与复习。四个无脚本实验对照基线方差、正负优势裁剪、长度归一化和KL方向。

修改正文后运行 `npm run notes:lecture4`，不要单独编辑导出的完整笔记。资料核对范围和原始名称见 [第四讲资料说明](../../materials/cme295/lecture-04/README.md)。

## 第三讲：训练流程

从 [第三讲内容导读](../../content/collections/cme295/l3-overview.md) 开始，或启动网站后访问 `topics/cme295/l3-overview.html`，课程目录的 `#lecture-3` 是第三讲入口。

12篇内容覆盖课件全部六条主线：预训练、SFT、偏好优化、推理、蒸馏、讨论。额外分开 LoRA、RLHF、DPO，保留端到端训练案例、模型塌缩与灾难性遗忘。每节包含定义、动机、例子、页码和理解检查。

三个无脚本交互演示：loss mask、奖励分差、组内优势。完整笔记从相同内容文件生成，修改后运行 `npm run notes:lecture3`。已阅读165页PDF提取文字和3118行英文字幕，视觉核对20张重点页；其余图示尚未逐页核对。

## 第二讲网站与笔记

启动站点后访问 [第二讲导读](http://127.0.0.1:8000/topics/cme295/l2-overview.html) 或 [课程分讲目录](http://127.0.0.1:8000/collections/cme295.html#lecture-2)。第二讲包含 10 篇内容：导读、模型家族、缩放法则、MoE、位置机制、注意力与缓存、归一化、解码、上下文与推理、总复习。

新增三个无需 JavaScript 的交互：Dense／Top-k 专家路由、滑动窗口多层可达范围、温度分布。数值测试覆盖归一化、Top-p、MoE 辅助损失、RoPE 与 KV Cache 字节估算。

第二讲笔记从网站同一内容源导出，修改 `content/collections/cme295/l2-*.md` 后运行 `npm run notes:lecture2`。已读 138 页 PDF 提取文字与完整字幕，视觉核对 12 张重点页；其余图表尚未逐页核对。

## 可视化学习

打开 [第一讲交互图解](lecture-01-visual.html)，用浏览器直接查看。页面不依赖网络或构建工具，目前包含：

| 区块 | 内容 |
| --- | --- |
| 学习地图 | 六个“为什么”串起第一讲主线 |
| ⓿ 基础概念（补充） | 14 个概念各配一个例子：形状、参数/超参数、前向传播、线性层、ReLU、logits/softmax、损失、梯度、反向、梯度下降、batch/epoch、训练/推理、梯度消失、过拟合 |
| 前置动机（补充） | N-gram 计数、稀疏问题与学习表示的动机 |
| Introduction | 课程目标、发展时间轴、概念对照 |
| ① Tokenization | 分词切换、特殊 token、填充、词表规模、BPE 四步合并 |
| ② Word representation | one-hot 与嵌入表对比、ID 与向量的区别 |
| ②′ 神经网络 | Word2vec 结构图与训练前后概率、RNN 展开图、LSTM 门控、早期注意力 |
| ③ Self-attention | 5 组 Q 预设的完整计算、5 个位置的手算示例 |
| ③′ 其他组件 | 位置编码、多头、FFN 数值示例、残差图、LayerNorm 与 Pre/Post-Norm |
| ⑤ 因果掩码 | 逐位置可读范围 |
| ④ 编码器与解码器 | 两者定义、子层分工、结构图、含形状的 8 步数据流、逐步生成演示、三种架构对照 |
| ⑥ 端到端示例 | 「A cute teddy bear is reading.」六步翻译全流程：分词、嵌入+位置、编码器、解码器首轮、逐轮生成、训练 vs 推理 |
| ⑧ 深入补充 | 训练循环手算、交叉熵、三代范式、缩放法则、现代架构改动（默认折叠） |

参考读物《大语言模型基础 - 大模型技术与发展》的副本位于 [references/llm-foundations.md](../../references/llm-foundations.md)，用于补充动机与后续背景；页面已标注哪些是补充内容。

后续讲解默认尽量详细且通俗，先解释问题与直觉，再配合数字示例、公式和可交互 HTML。可视化中的教学数据需要明确标注，避免与真实模型输出混淆。

## 后续如何一起学习

每次可以从一个概念、一页课件或一个具体问题开始：

1. 对照课件确认问题及必要的前置知识。
2. 先解释直觉，再用小例子、公式或矩阵维度验证。
3. 通过简短问题检查理解；有需要时补充可运行示例。
4. 把讨论结果、容易混淆的地方和未解决问题更新到对应讲次笔记。

笔记区分课程内容、补充解释和学习进度。讨论中出现的问题不自动视为已经掌握；需要复习的内容继续保留。

## 当前进度

- 已收到并阅读第一讲字幕稿。
- 已提取并阅读第一讲 PDF 的文字内容，共 118 页。
- 已建立第一讲内容索引和初始笔记。
- 已结合参考读物补充前置动机（N-gram）、注意力手算示例与其他组件图解，并校正若干过度简化的表述。
- 已把参考读物副本纳入仓库，便于对照原文。
- PDF 中以图形呈现的公式、箭头及矩阵细节尚未逐页视觉核对。
- 尚未逐项确认学习者的前置知识和掌握程度。
