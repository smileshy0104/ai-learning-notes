---
slug: l5-mtp
title: "Distillation and MTP: cheaper drafts that stay close to the target"
collection: cme295
lecture: 5
lang: en
description: "Connect speculative decoding with knowledge distillation, and explain multi-token prediction heads, verification, and why they do not directly sample the joint distribution."
order: 110
kind: lesson
status: published
tags: [Distillation, MTP, Multi-token prediction]
---

## 1. A draft is judged on more than being small

PDF pages 147–149. A cheap draft that is often rejected can slow the system down. Besides speed, the draft distribution should be close to the target to reduce wasted proposals.

The course connects the two through knowledge distillation: the teacher supplies the next-token soft distribution and the student learns it. On a fixed prefix the common form is:

```text
KL(T∥D)=Σ_i T_i ln(T_i/D_i)
```

With a frozen teacher its entropy is a constant with respect to the student’s parameters, so minimising this KL is equivalent to minimising the teacher soft-label cross-entropy.

Note that this is the opposite direction to the reverse KL discussed in [lecture 4’s OPD](l4-opd.html). Distillation does not have a single fixed KL direction, and seeing the word “distillation” is not enough to know whose prefixes are sampled.

## 2. A soft-distribution teaching example

T=[0.75,0.25], D=[0.5,0.5]: cross-entropy about 0.693147 and KL about 0.130812; when D matches T the KL is 0.

In this example the acceptance rate is min(0.75,0.5)+min(0.25,0.5)=0.75, and 1 after matching. It illustrates the motive for better distribution matching; it does not prove that any single training-loss step makes acceptance rise monotonically at every prefix.

Temperature, coverage of training prefixes, draft architecture and hardware efficiency matter just as much. A teacher being close does not mean the task is absolutely correct; this “quality” first means closeness to the target being accelerated.

## 3. What is MTP?

PDF pages 150–151. Multi-Token Prediction designs several prediction heads on a shared backbone, each learning to predict the following 1st, 2nd, … token. The slide shows a parallel-head concept; real models may use sequential modules or other conditioning structures.

If the shared hidden state H is B×T×d and the j-th linear head W_j is d×V, then logits_j is B×T×V and the label shifts j positions ahead.

```text
a supplementary training structure: L=Σ_j λ_j CE(logits_j, shifted_target_j)
```

Heads may have different weights and valid-position masks. Where there is no future label at a boundary the loss cannot simply be computed, and future ground-truth tokens must not be slipped into the inference input.

## 4. Multiple heads are not correct joint sampling

Predicting t+1 and t+2 from the same prefix does not condition the second prediction on the t+1 that is actually sampled. So sampling each head independently is not automatically the autoregressive joint distribution:

```text
P(y₁,y₂|x)=P(y₁|x)P(y₂|x,y₁)
```

The slides use the extra heads for drafting and the main head/target path for verification. Preserving the target distribution still needs a correction algorithm whose conditions hold; concatenating several heads’ argmax does not give lossless acceleration.

## 5. How does it differ from a separate draft model?

A shared backbone avoids maintaining a second model and some duplicated computation, but adds training heads and inference management, and the benefit still has to be measured. MTP training can also be an objective that improves representations, not merely a serving acceleration switch.

“Same draft and target model” here means the model drafts and verifies internally; it does not mean a multi-step prediction distribution is naturally identical to the ordinary next-token objective.

## Check your understanding

<details><summary>If a second head predicts two steps ahead, can the conditional dependency be skipped?</summary><p>You can define such a generator, but it does not automatically preserve the original autoregressive model’s distribution; keeping the target requires verification and correction.</p></details>
<details><summary>If the distillation KL is tiny, can the draft’s runtime cost be ignored?</summary><p>No. Real acceleration needs a cheap draft, a high enough acceptance rate, and reasonable verification and cache cost together.</p></details>

Source: PDF pages 147–151; the cross-entropy figures, tensor shapes and training loss are teaching additions, not a reproduction of any particular MTP implementation.
