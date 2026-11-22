---
slug: l6-metrics
title: "Retrieval evaluation: Precision, Recall, RR and NDCG"
collection: cme295
lecture: 6
lang: en
description: "Hand-compute four families of metrics on a binary-relevance ranking, and separate single-query from cross-query averages, candidate recall from answer correctness."
order: 40
kind: lesson
status: published
tags: [Precision, Recall, RR, NDCG]
---

## 1. Ground truth first, scores second

PDF pages 41–48. You need labels saying which chunks are relevant for a query before you can evaluate a ranking. Relevance is not the same as a correct final answer; a document can be relevant yet insufficient, and incomplete labels distort the score.

Let there be R relevant documents in total, take the top k, and let relevance relᵢ∈{0,1} with i starting at 1. This page uses binary gain, as the slides do.

## 2. Precision and recall

```text
Precision@k = relevant items in the top k / k
Recall@k = relevant items in the top k / all relevant items R
```

The first asks “how much of what came back is useful”, the second “how much of what should have been found was found”. Raising k usually raises recall, but precision need not rise.

## 3. RR and MRR

RR@k is the reciprocal rank of the first relevant document in the top k, and 0 if there is no hit. Averaging over several queries gives MRR@k; a single query’s RR cannot be called MRR over all queries.

A relevant first result gives RR=1 even if much is missed later, so multi-evidence tasks cannot rely on it alone.

## 4. DCG and NDCG

```text
DCG@k=Σ_{i=1}^k rel_i / log₂(i+1)
IDCG@k = the ideal DCG with the truly relevant documents placed first
NDCG@k=DCG@k / IDCG@k
```

The first position has discount 1, the second about 0.63093, the third 0.5. IDCG takes its relevant count from the ground truth, not from re-sorting only the items already retrieved, which would hide misses.

Graded relevance often uses gains such as `2^rel−1`, which must not be mixed with this page’s binary formula. With no relevant ground truth, the recall and NDCG denominators are 0; the system must state whether it skips or records 0. The experiment here records 0 rather than treating it as full marks.

<!-- lab:l6-metrics -->

## 5. Two rankings with the same P/R but different position scores

Total R=3, k=3:

- Ranking A, top-3 relevance [0,1,1]: P=2/3, R=2/3, RR=1/2; DCG=0.63093+0.5=1.13093, IDCG=2.13093, NDCG about 0.53072.
- Ranking B, top-3 [1,1,0]: P/R still 2/3, RR=1; DCG=1.63093, NDCG about 0.76536.

Reranking improved early positions without bringing the third relevant document into the top 3. Report several metrics to see the difference.

## 6. Layers of evaluation

Measure candidate recall, final ranking, generation faithfulness and citation accuracy, end-to-end task success, cost and latency separately. Use a fixed test set instead of repeatedly tuning the prompt on the same examples and presenting that as generalisation evidence.

For code retrieval, function names, error codes and paths often suit grep or symbol search. But “code only needs grep” is too strong: call graphs, ASTs, dependency graphs and semantic retrieval can complement each other. Finding one definition is not the same as understanding every call site’s impact.

## Check your understanding

<details><summary>Does RR=1 prove all evidence was found?</summary><p>No. It only says the first result is relevant; other necessary documents may still be missing.</p></details>
<details><summary>Why is it wrong to take the two relevant items currently in the top 3 as the IDCG?</summary><p>If the corpus has 3 relevant items, an ideal top 3 should be fully relevant. Using only what was retrieved hides the miss.</p></details>

Source: PDF pages 41–49; the binary ranking hand calculations and the empty-ground-truth convention are teaching additions.
