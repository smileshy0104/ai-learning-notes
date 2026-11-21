---
slug: l3-dpo
title: "DPO: training a language model directly on preference pairs"
collection: cme295
lecture: 3
lang: en
description: "Understand the DPO objective through probability ratios against a reference model, and how it differs from SFT, reward modelling and online policy optimisation."
order: 80
kind: lesson
status: published
tags: [DPO, Reference model, Preference optimization]
---

## 1. Why was DPO introduced?

PDF pages 87–90. Classic RLHF often trains an RM and then optimises a policy, which is heavy in engineering and tuning. DPO (Direct Preference Optimization) re-expresses the preference objective so a language model can be optimised directly on preference pairs, without fitting an explicit reward model separately.

**That does not remove the reference model**: standard DPO still uses the frozen reference model’s answer probabilities as its baseline. Nor does “no reward model” mean “no preference labels”.

## 2. The objects in the formula

- x: the prompt.
- y_w, y_l: the better and worse answers to the same prompt.
- πθ(y|x): the conditional probability the policy assigns to a complete answer.
- π_ref(y|x): the same quantity for the frozen reference model.
- β>0: a hyperparameter controlling the objective scale and how strongly the reference constrains the model.

```text
m = β [ln(πθ(y_w|x)/π_ref(y_w|x))
       −ln(πθ(y_l|x)/π_ref(y_l|x))]
L_DPO = −E ln σ(m)
```

The slides read `β ln(πθ/π_ref)` as a kind of implicit reward, which is why the pairwise structure matches Bradley–Terry.

## 3. A probability example you can compute by hand

Teaching assumption for the distribution over complete answers:

| Model | winner probability | loser probability | all other answers |
| --- | --- | --- | --- |
| reference | 0.2 | 0.2 | 0.6 |
| policy, initially identical to reference | 0.2 | 0.2 | 0.6 |
| policy, hypothetical state after an update | 0.4 | 0.1 | 0.5 |

With β=0.5, initially m=0 and the loss is ln2≈0.6931.

```text
new winner ratio=0.4/0.2=2
new loser ratio=0.1/0.2=0.5
m=0.5[ln2−ln0.5]=ln2≈0.6931
σ(m)=2/3
new loss=−ln(2/3)≈0.4055
```

What is constructed here is “a possible state after an update”; it does not claim that one optimiser step lands exactly on these probabilities.

## 4. What change is actually encouraged?

The objective encourages the winner’s log-probability to rise relative to the reference by more than the loser’s does.

**The accurate statement is that the relative gap widens**, not that “the winner’s absolute probability always rises and the loser’s always falls”. Shared parameters and normalisation can make the actual movement more complicated.

A complete answer probability is usually the product of per-token conditional probabilities; implementations sum log-probabilities. You cannot substitute one position’s top softmax value for the whole answer’s probability, nor quietly switch to a per-token average variant without saying so.

## 5. Compared with the other methods

| Method | Training data | Main objective | Extra objects |
| --- | --- | --- | --- |
| SFT | desired answers | raise the likelihood of target tokens | no reference needed |
| Reward modelling | preference pairs | learn to rank answers by score | one RM |
| Standard offline DPO | fixed preference pairs | widen the preference log-probability gap relative to reference | reference |
| Classic PPO-RLHF | policy samples + rewards | optimise constrained expected reward | RM, reference, often a value model |

DPO is often trained on fixed offline answers, so it can also suffer a mismatch with the distribution the model actually samples. Iterative or online preference-collection variants exist; not every method with DPO in its name is the same pipeline.

## 6. Is one always better?

Slide 88 stresses that results depend on task and implementation; there is no absolute consensus. Simpler does not guarantee stronger, and the more complex reinforcement-learning route does not guarantee superiority either.

When evaluating, fix data quality, initialisation, compute budget and target task; check length bias, refusal behaviour and regressions in other abilities; do not compare training-loss numbers alone.

## Check your understanding

<details><summary>Are DPO’s winner and loser regenerated during training?</summary><p>Standard offline DPO uses fixed preference pairs; online or iterative variants can collect fresh data, and which one is used must be stated.</p></details>
<details><summary>Why can the reference probability not simply be dropped?</summary><p>The standard objective compares probability changes relative to the reference. Dropping it changes the objective and the meaning of the constraint, so it is no longer the recipe described here.</p></details>

Source: PDF pages 87–90; the formula on page 87 was visually checked; the probability example is a teaching construction. The full equivalence derivation belongs to later theory.
