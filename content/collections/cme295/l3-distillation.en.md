---
slug: l3-distillation
title: "Distillation: the student samples, the teacher gives per-token signals"
collection: cme295
lecture: 3
lang: en
description: "Separate the source of data from the density of supervision, and use teacher–student distribution examples to understand on-policy distillation, self-distillation and cross-stage retention."
order: 100
kind: lesson
status: published
tags: [Distillation, On-policy, Teacher, Student, KL]
---

## 1. Split it into two dimensions first

PDF pages 125–131. The slides contrast dense supervision on fixed demonstrations with sequence-level reward on the model’s own samples, and propose wanting both advantages.

| Dimension | Question | Examples |
| --- | --- | --- |
| Source of the data distribution | who produced the prefix / answer? | a dataset, the current student, an older policy |
| Density of the signal | a target at every position, or one score for the whole span? | token distributions, a final reward |

The slides use SFT as an intuition for “off-policy”; in strict RL, off-policy also involves the relationship between behaviour policy and target policy. Not every “text written externally” should be treated as a complete RL definition.

## 2. What is distillation?

**Definition:** use a teacher model’s outputs or predictive distributions as the student’s learning target, transferring some behaviour or capability. The teacher need not always be larger; it may be stronger on a specific task, better informed by context, or an earlier checkpoint that retained some ability.

- Text distillation: the teacher generates demonstrations and the student does supervised learning on them.
- Distribution distillation: the teacher provides vocabulary distributions or logits and the student matches them at every position.
- On-policy distillation: teacher signals are obtained on prefixes the student itself sampled.

## 3. Why let the student write first?

Fixed teacher demonstrations are clean but may not cover the erroneous prefixes the student actually reaches. After a student rollout, the teacher can guide the next step on exactly those prefixes, targeting the student’s real distribution more directly.

<div class="flow"><span class="chip">prompt x</span><span class="arrow">→ student samples →</span><span class="chip">the student’s own prefix</span><span class="arrow">→ teacher predicts the next-token distribution →</span><span class="chip">compare per position → update the student</span></div>

Compared with a sequence-level reward, a teacher distribution gives finer-grained signal. Finer is not automatically truer, though: it can still copy the teacher’s biases.

## 4. A local distribution comparison

On the same prefix, the vocabulary has only two candidates, “5 years” and “6 years”. Teaching setup: teacher p=[0.8,0.2], student q=[0.5,0.5].

```text
soft-target cross-entropy H(p,q)=−Σ pᵢ ln qᵢ≈0.6931
teacher entropy H(p)=−Σ pᵢ ln pᵢ≈0.5004
KL(p||q)=H(p,q)−H(p)≈0.1927
```

If the student moves to q=[0.7,0.3]: soft-target cross-entropy about 0.5261 and KL about 0.0257. “Better” here means closer to the given teacher, not proven more factually correct.

**Formula boundaries:** this is a forward-KL / soft cross-entropy illustration on a given prefix, not the single objective of every OPD method. Real methods may use reverse KL, a different sampling distribution, temperature, truncation or a gradient estimator; the on-policy prefix distribution itself depends on the student, and the full derivation is left to lecture 4.

## 5. Must the teacher provide the whole vocabulary?

An API that returns only text cannot directly support full logit distillation; partial logprobs are not equivalent to a full distribution. Access, cost and data licensing all affect whether a method can be used in practice.

Nor should “I can see a reasoning summary” be read as “I obtained the raw internal reasoning sequence”. This course’s conceptual summary offers no method for bypassing service limits to extract hidden information.

## 6. Self-distillation and multiple teachers

- **On-policy self-distillation:** a teacher branch of the same model gets extra answers or more favourable conditions and supervises the student’s prefixes. “Self” does not mean the teacher needs no freezing or target isolation; avoiding a degenerate learning target takes concrete design.
- **Multiple teachers:** teachers with different strengths provide signal, possibly selected, weighted or combined. A plain average of conflicting opinions does not guarantee additive capability.
- **Cross-stage distillation:** use an earlier SFT or RL checkpoint as teacher to help the current model retain old abilities; the end-to-end case later connects this again.

This is transfer during training, not a requirement to run several teachers simultaneously at deployment.

## 7. Two “collapse / forgetting” ideas that must not be merged

- Model collapse: repeatedly replacing original data with model-generated data can degrade tails or the distribution across generations.
- Catastrophic forgetting: continuing to optimise a new task or objective lowers older abilities.

Distillation can help retain abilities but does not guarantee that all forgetting is solved; unfiltered self-generated data can equally cause degradation.

## Check your understanding

<details><summary>If the teacher guides on a student’s wrong prefix, are the earlier sampled tokens rewritten?</summary><p>Tokens already produced in this rollout are not rewritten directly; training changes future sampling tendencies through parameter updates. Corrective data can also be generated separately, but that is an additional pipeline.</p></details>
<details><summary>Does lower KL necessarily mean a higher factual accuracy?</summary><p>It only means being closer to the teacher distribution. Teachers can be wrong too, so effectiveness must be evaluated on independent tasks.</p></details>

Source: PDF pages 125–131; the diagram on page 129 was visually checked. The KL-direction comparison and numeric examples are teaching additions. Papers mentioned later in the slides are citation leads in the material, not evidence that every frontier model already adopts them.
