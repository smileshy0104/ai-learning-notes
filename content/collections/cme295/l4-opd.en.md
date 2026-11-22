---
slug: l4-opd
title: "On-policy distillation: reverse KL and per-token feedback"
collection: cme295
lecture: 4
lang: en
description: "Start from insufficient credit for the final answer, separate KL direction, the student's sampling distribution and the true gradient, then discuss teacher conditions, self-distillation and multiple teachers."
order: 100
kind: lesson
status: published
tags: [On-policy distillation, Reverse KL, Credit assignment]
---

## 1. Why discuss distillation after GRPO?

PDF pages 111–134 return to the sealed-box case: among four candidates, some answers are right but the steps are wrong. Outcome supervision usually hands the same answer-level advantage to every token, so it cannot mark where “climbs” starts violating the condition.

Process supervision can score each step, but needs labels or a dedicated evaluator, and individual steps can still be ambiguous. The course proposes keeping the student’s own samples and using an existing teacher to supply finer-grained distribution signals.

This does not require a product to expose a full internal chain of thought; what is discussed here is next-token prediction on a given teaching prefix.

## 2. What does the KL direction change?

Let T be the teacher and S the student, on **the same fixed prefix**:

```text
Forward KL：KL(T∥S)=Σ_i T_i ln(T_i/S_i)
Reverse KL：KL(S∥T)=Σ_i S_i ln(S_i/T_i)
```

“Forward/reverse” is a naming habit relative to the teacher target; when reading, always check which distribution is first and which one does the weighting.

- KL(T∥S): where the teacher has mass and the student assigns too little, the penalty is larger.
- KL(S∥T): where the student puts mass the teacher strongly disfavours, the penalty is larger.

<!-- lab:l4-kl-direction -->

The teacher [0.49,0.02,0.49] has two main candidates. The student [0.89,0.02,0.09] leans towards one end; the student [0.3,0.4,0.3] puts a lot of mass in the middle that the teacher does not support.

“Mode seeking” is a common tendency when the student is constrained and the target is multi-modal; it is not a mathematical guarantee that reverse KL always discards half the modes. If the student can match T freely, both directions have the same optimum S=T.

## 3. Individual terms can be negative; only the total is non-negative

If S_i<T_i, the term `S_i ln(S_i/T_i)` can be negative. Do not treat every per-token log ratio as a naturally non-negative error score.

If the teacher gives exactly 0 to some item while the student is positive, reverse KL diverges in that direction; real finite logits from softmax are usually non-zero, but numerical stability and truncated support still need care.

## 4. The student generates first; how does the teacher see it?

<div class="flow"><span class="chip">student rollout produces an answer</span><span class="arrow">→ freeze those prefixes →</span><span class="chip">teacher and student score them separately</span><span class="arrow">→ compare token distributions →</span><span class="chip">update the student</span></div>

Example: after the prefix “Teddy”, the teacher gives 0.9 to stays and 0.1 to climbs; the student gives 0.5 to each. The local KL(S∥T) is about 0.5108.

If the student chose climbs, the teacher also treats it as given context for the next position. So “out of the box” may become locally unsurprising — which does not mean the teacher has guaranteed the global logic is correct.

**Key point:** on-policy describes where the prefix comes from; the KL direction describes whose distribution does the weighting on the same prefix. They are related but distinct choices, and it is not true that every on-policy distillation method must use reverse KL.

## 5. Sampled log ratios — what else matters for the gradient?

With a fixed prefix and a frozen teacher:

```text
KL(Sθ∥T)=E_a~Sθ[lnSθ(a)−lnT(a)]
∇KL=E_a~Sθ[(lnSθ(a)−lnT(a)+1) ∇lnSθ(a)]
```

Because the score has zero expectation, under suitable conditions the constant 1 can be dropped without changing the expected gradient. Naively differentiating only “lnS−lnT of the sampled token” on detached samples misses the part where the sampling distribution changes with θ, and is not automatically the full reverse-KL gradient.

Real OPD also involves the student’s prefix distribution, availability of full-vocabulary or partial logits, estimator choices and stop-gradient rules. This page explains the principle, not the single loss of every implementation.

## 6. No RM, but teachers still cost compute and carry bias

Teacher predictions still have to be computed, and student rollouts still have to be generated. Without a separately learned RM, the student can still inherit teacher errors, local inconsistencies, data bias or uncovered domains.

“Target performance is strictly bounded by the teacher” is too strong: pure target matching is influenced by the teacher, but data, model inductive bias, external training and evaluation distributions all change final performance. Teacher capability and coverage are important constraints, not a universal upper-bound theorem.

## 7. Self-distillation and multiple teachers

- Self-distillation: the teacher branch may be the same model with extra prompts, answers or better conditions. The teacher target usually needs isolation such as freezing or detaching, so two branches do not chase each other without a defined target.
- Multiple teachers: pick teachers per domain or combine supervision sensibly to reduce any single teacher’s coverage gaps.
- Old-checkpoint teachers: retain earlier abilities and mitigate forgetting caused by training on a new objective.

Giving the teacher extra answers is privileged information supplied during training and must not leak answers into independent test questions. Teacher feedback only changes later updates; it does not retroactively rewrite a wrong prefix already sampled.

## Check your understanding

<details><summary>If the teacher continues sensibly after a wrong prefix, does that make the prefix correct?</summary><p>No. Conditional prediction can stay fluent on a false premise; local feedback is not a global logic audit.</p></details>
<details><summary>Is taking student-generated text and running SFT the same as reverse-KL distillation?</summary><p>No. The teacher target, distribution direction, sampling and differentiation still have to be defined. Imitating text and matching distributions are different objectives.</p></details>

Source: PDF pages 111–134. The fixed-prefix gradient explanation and the two-class KL are teaching additions.
