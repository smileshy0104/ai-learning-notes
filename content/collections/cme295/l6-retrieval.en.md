---
slug: l6-retrieval
title: "Retrieval and reranking: find broadly first, compare carefully after"
collection: cme295
lecture: 6
lang: en
description: "Compare the roles of bi-encoders, BM25, hybrid retrieval, HyDE, contextual retrieval and cross-encoders."
order: 30
kind: lesson
status: published
tags: [Retrieval, BM25, HyDE, Reranking]
---

## 1. Why two stages?

PDF pages 26–40. Candidate retrieval faces a large number of chunks and prioritises speed and recall; reranking faces a small set and can afford finer relevance computation. If genuinely relevant documents are missed early, a later ranker usually cannot recover them from nothing.

“Recall first, precision later” is a design goal; it does not mean the first stage has no ranking, nor that the second must leave recall metrics unchanged.

## 2. Bi-encoders and semantic similarity

Query and document are encoded separately, so document vectors can be cached in advance and only the question is encoded online. The two towers may share weights or be compatible models; they need not be two entirely separate networks.

```text
cos(q,d)=qᵀd/(||q|| ||d||)
q=[1,0]，d₁=[0.8,0.6] → cos=0.8
d₂=[0,1] → cos=0
```

These are hand-made two-dimensional vectors, not real model embeddings. The cosine of a zero vector is undefined and must be handled explicitly.

Semantic closeness is not answer relevance: asking where Cuddly is may wrongly favour Huggy, or “where is Paris”, through entity confusion or a similar question shape. Approximate nearest-neighbour search adds its own approximation, which needs separate evaluation.

## 3. BM25 and hybrid retrieval

BM25 does not merely count matching words; it combines term-frequency saturation, inverse document frequency and length normalisation, and suits entity names, terminology and exact words.

A common term form (supplementary; IDF conventions differ):

```text
IDF(t) × tf(t,d)(k₁+1)
       / [tf(t,d)+k₁(1−b+b|d|/avgdl)]
```

tf is term frequency, |d| the document length and avgdl the average length. With k₁=1.2, b=0.75, length equal to average, tf=2 and IDF=1 the term is 1.375. It is not a probability and cannot be added to a raw cosine score without calibration.

Hybrid retrieval can merge rankings, for example with the supplementary RRF: `score(d)=Σ_j 1/(c+rank_j(d))`. c is a smoothing constant and ranks start at 1; a missing document contributes nothing. Fusion methods still need measurement and do not always beat a single retriever.

## 4. HyDE and query rewriting

HyDE = Hypothetical Document Embeddings: generate a hypothetical document that might answer the question, then search the real corpus with its vector. It can bridge the gap between question and statement phrasing, and it can also carry a wrong assumption into retrieval.

**A hypothetical document is not evidence.** The final answer must rest on the real material retrieved afterwards. Complex questions can be split into sub-queries, but rewriting must not silently change the user’s intent.

## 5. Contextual retrieval

A cut-out chunk reading “he moved here” lacks entity and time. Add a short context from the full document, such as “this text describes Cuddly moving house in spring”, to help the index locate it.

Generated context must be checked, since a wrong entity also pollutes the index. Keep the original text and the generated context distinguishable; when processing many chunks of one document, a stable document prefix may be cacheable, though the caching rules depend on the backend.

## 6. How does a cross-encoder rerank?

Encode query and chunk together as one separated sequence so their tokens interact, producing a relevance scalar. For example, “red scarf blue socks” and “blue scarf red socks” relate differently, which a joint comparison can separate more easily.

With length L and hidden dimension d, the output H is L×d; taking the CLS representation gives an h of d dimensions, and a linear head w of d dimensions gives `s=wᵀh+b`, a scalar. A sigmoid maps it to 0–1 but does not necessarily calibrate it as a probability.

The joint representation depends on the query, so it cannot be cached in advance for all future questions the way independent document vectors can. BERT-style reranking is the course example; LLM rerankers also exist.

## Check your understanding

<details><summary>Can reranking fix a candidate set with no correct document at all?</summary><p>Usually not. Check recall, query expansion or a fallback instead of only swapping in a stronger ranker.</p></details>
<details><summary>If HyDE generates “Cuddly is in the kitchen”, can that be cited as a fact?</summary><p>No. It is a retrieval hypothesis and needs confirmation from real material.</p></details>

Source: PDF pages 26–40; the cosine, BM25, RRF and reranking dimensions are teaching expansions, not a tested retrieval service.
