---
slug: l3-review
title: "Lecture 3 review: data, objectives and what gets updated"
collection: cme295
lecture: 3
lang: en
description: "Tie the training stages together with comparison tables, plus terminology corrections, worked self-test answers and notes on checking the material."
order: 120
kind: lesson
status: published
tags: [Review, Training, Terminology]
---

## 1. The six lecture threads

| Part | What you learn | Supervision signal | What is updated |
| --- | --- | --- | --- |
| Pretraining | broad language and code patterns | the true next token in the text | base model parameters |
| SFT | desired answers and instruction behaviour | demonstrated answers under a prompt | all parameters or an adapter |
| Preference tuning | which answer is preferred for the same prompt | preference pairs; an RM, or a direct DPO objective | RM / policy, depending on the stage |
| Reasoning | verifiable problem-solving performance | outcomes, tests or other rewards | policy |
| Distillation | matching teacher behaviour or distributions | text, logits or token distributions | student |
| Discussion | organising the above and controlling degradation | multi-task evaluation and retention objectives | determined by the stage |

LoRA is a parameter-update scheme, not another training task parallel to and exclusive with SFT. Mid-training is a stage arrangement; its single objective cannot be inferred from the name alone.

## 2. One training recipe, four questions

When you read a training recipe, write down first:

1. What is the input, and what is the target?
2. Is the data produced by a fixed corpus, the current model, or a teacher?
3. Does the loss sit on tokens, on the answer, or on the sequence?
4. Which parameters update and which stay frozen?

For example, “freeze the RM to score policy samples” differs from “train the RM”, which differs again from “run DPO on fixed preference pairs”. Much confusion comes from collapsing these steps into one phrase, “fine-tune with feedback”.

## 3. Quick self-test

<details><summary>Q1: If SFT sets the prompt loss mask to 0, does the prompt stop participating in the computation?</summary><p>No. The prompt still shapes the answer representation and can produce gradients through the answer loss. The loss mask and the attention mask control different things.</p></details>
<details><summary>Q2: A 4096×4096 matrix with r=8 LoRA trains how many new parameters?</summary><p>A and B together are 8×4096+4096×8=65,536, which is 0.390625% of 16,777,216. It does not mean all memory shrinks proportionally.</p></details>
<details><summary>Q3: If the RM gives the winner 102 and the loser 100, is it more confident than 2 and 0?</summary><p>In the Bradley–Terry gap model they are identical: both gaps are 2, and the preference probability is about 0.8808.</p></details>
<details><summary>Q4: Does standard DPO treat the winner as an SFT sample and discard the loser?</summary><p>No. It uses the log-probability gap of both answers relative to the reference; discarding the loser changes the objective.</p></details>
<details><summary>Q5: If every reward in a group is 1, can we say the policy needs no further training?</summary><p>No. It only means this group carries no discriminating signal under this relative-advantage construction; other problems, objectives and abilities may still need improvement.</p></details>
<details><summary>Q6: If the student’s KL to the teacher is small, is factual correctness proven?</summary><p>No. Teachers can be wrong; distillation needs independent task evaluation, not just distribution closeness.</p></details>
<details><summary>Q7: Why can knowledge cutoffs and hallucination persist after SFT?</summary><p>Behaviour adaptation is not the same as obtaining a current, complete, precise knowledge base. Prompting, retrieval, data updates and fact checking each still have a role.</p></details>

## 4. Misrecognitions in the automatic English subtitles

This lecture’s transcript is auto-generated English, without the Chinese machine translation of lectures 1 and 2, but it still has misrecognitions:

| Subtitle form / wording | How this page treats it |
| --- | --- |
| open white / open-source | usually open-weight in context; open weights are not full open source |
| masked text / masks where data mixing is discussed | context suggests math; no claim of MLM training is inferred from the misrecognition |
| Olmol 3 | written OLMo 3 as in the slides |
| decoding / generation used interchangeably in speech | teacher-forced computation is distinguished from an actual rollout |
| unclear fragments around bill and epoch | only meanings explicit in the slides are accepted; no specific values are guessed |
| policy / reference / old model conflated | the trainable policy, the frozen reference and the sampling old policy are named separately |

Some slides label a loss term “maximize rewards” while using L notation; this page writes “maximise J” or “minimise L” explicitly so a missing minus sign cannot slip through.

## 5. Boundaries worth remembering

- Pretraining does not guarantee that knowledge is true; more repeated data does not guarantee continuing gains.
- Teacher forcing makes training parallel; it does not make inference generate a whole sentence at once.
- SFT need not update all weights; LoRA still requires gradient computation.
- Human/AI preference labels and verifiable correctness are different sources.
- An RM score is not final truth, and a KL constraint does not guarantee immunity to reward hacking.
- The DPO objective is not “each step, one answer’s probability must rise and the other’s must fall”.
- GRPO’s within-group advantage is only part of the full objective.
- Closeness to a distillation target is not the same as better independent task ability.
- Model collapse and catastrophic forgetting must be detected separately.

## 6. Sources and where to continue

The slides cite, among others: data-constrained scaling (2023), DataComp-LM and RegMix (2024), LoRA (2021), InstructGPT/RLHF (2022), DPO (2023), DeepSeekMath/GRPO (2024) and DeepSeek-R1 (2025). Product examples and news are as of the material’s date.

Lecture 4 is the place to focus on why policy gradients use log-probabilities, the clipping and reference constraints of PPO/GRPO, and the KL direction and sampling estimators in OPD.
