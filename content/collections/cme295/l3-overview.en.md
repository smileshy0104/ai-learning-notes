---
slug: l3-overview
title: "Lecture 3 overview: how does an LLM get trained?"
collection: cme295
lecture: 3
lang: en
description: "Follow the course order from pretraining through supervised fine-tuning, preference optimisation, reasoning training and distillation, making the data and the updated object explicit at every step."
order: 10
kind: lesson
status: published
tags: [Lecture 3, LLM training, Learning path]
---

## The core question of this lecture

The first two lectures covered how the network computes and how it generates. Lecture 3 asks: **how do these parameters get learned from data, and how does a text-continuation model become an assistant that meets task goals?**

Not every training name is a separate new architecture. Many stages keep the same Transformer backbone; what changes is the data, the objective, where supervision lands and how samples are produced.

<div class="training-stages"><div><strong>Learn general regularities</strong>Pretraining: learn the next-token distribution from large text and code.</div><div><strong>Adapt to tasks and behaviour</strong>SFT: demonstrate the desired answers; preference optimisation: compare different answers.</div><div><strong>Improve problem solving</strong>Verifiable rewards, policy optimisation and distillation: keep training with sampling, evaluation and teacher signals.</div></div>

## What you need from lectures 1 and 2

- [Forward pass, gradients and parameter updates](basics.html): the forward pass produces predictions, the backward pass computes gradients, and only then does the optimiser update.
- [Decoder-only and causal prediction](l2-model-families.html): training computes all positions at once, while inference usually generates step by step.
- [Scale and training budgets](l2-scaling.html): parameters, data and compute must match; empirical ratios are not universal laws.
- [Context and generation](l2-context-reasoning.html): prompts, model parameters and decoding settings are different layers.

The examples here explain mechanisms; they do not call real APIs or train on GPUs. A hand-computed toy model is not the same as a real fine-tuning run.

## Following the PDF outline

Page numbers are physical pages, including the cover. Consecutive pages are often one diagram unfolding.

| Slide part | PDF pages | Content on this site |
| --- | --- | --- |
| Recap, outline, training paradigms | 1–10 | This page |
| Pretraining: next-token objective, teacher forcing, CE, BPB | 11–22 | [Pretraining objective](l3-pretraining.html) |
| Data, mid-training, long context and limits | 23–40 | [Data and long context](l3-data.html) |
| Supervised finetuning | 41–52 | [SFT](l3-sft.html) |
| Parameter-efficient fine-tuning | 53–56 | [LoRA](l3-lora.html) |
| Preference tuning: data and collection | 57–69 | [Preference data](l3-preferences.html) |
| Reward modelling and RLHF | 70–86 | [Reward models and RLHF](l3-rlhf.html) |
| DPO and method comparison | 87–90 | [DPO](l3-dpo.html) |
| Reasoning: verification, within-group comparison, GRPO intuition | 91–124 | [Reasoning training](../../../topics/cme295/l3-reasoning.html) |
| Distillation: on-policy and variants | 125–131 | [Distillation](../../../topics/cme295/l3-distillation.html) |
| Discussion: a full training case and risks | 132–164 | [End-to-end training case](../../../topics/cme295/l3-end-to-end.html) |
| Wrap-up and self-test | 165 | [Review and terminology](../../../topics/cme295/l3-review.html) |

## One question runs through the lecture: can the teddy bear be machine washed?

The slides use answers at different training stages to show behaviour changing:

1. The base model may simply continue with a description of the material.
2. After SFT it looks more like a direct answer to the question.
3. After preference optimisation it may better match the expected tone and level of help.
4. Reasoning training handles multi-condition tasks, such as which bear can be washed and dried within a given time.

**Do not treat a classroom example as a general rule about life.** Some soft toys are machine washable and some are not; judge from the actual material, the care label and the components. “Always say no to machine washing” is not a criterion for correct training.

The unified teaching task later fixes the conditions: Brown may only be hand-washed, Panda may be machine washed but not tumble dried, and Polar allows both. That makes answers independently verifiable instead of judged by tone.

## Reading notes

The material is organised from the lecture 3 slides and the English transcript, with teaching additions. Model specifications and product examples are as of the slide date. The full mathematical derivation of reinforcement learning is left to lecture 4; this lecture focuses on the training pipeline, intuition and small examples.

## Four questions to keep asking

- **Where does the data come from?** A fixed corpus, human demonstrations, samples from the current model, or teacher predictions?
- **What is being updated?** The main model, the reward model, LoRA parameters, or only the current context?
- **Where does the signal land?** Per token, on the answer span, on the whole sequence, or on a preference pair?
- **How is it verified?** Training loss, an independent validation set, task tests and fact checking are all different.

Running every stage through these four questions is more useful than memorising the acronyms Pretrain, SFT, RLHF and GRPO.
