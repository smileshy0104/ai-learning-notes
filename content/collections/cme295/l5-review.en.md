---
slug: l5-review
title: "Lecture 5 review: find the bottleneck, then pick the optimisation"
collection: cme295
lecture: 5
lang: en
description: "Recap FlashAttention, distributed training and inference systems through a method comparison, a deployment diagnosis order and worked self-test answers."
order: 120
kind: lesson
status: published
tags: [Review, LLM Systems, Bottleneck]
---

## 1. Answering the two opening questions

PDF pages 152–156.

| Method | How does it fit? | How does it run faster? | Main boundary |
| --- | --- | --- | --- |
| FlashAttention | never materialises the full attention table | less HBM traffic | does not remove dense n² computation |
| ZeRO | shards long-lived training state | sometimes enables a larger effective training scale | communication and temporary peaks |
| DP / TP / PP / CP / EP | share state or activations along different axes | execute more work in parallel | interconnect, load balance, bubbles |
| KV Cache | needs extra KV space | no recomputation of the old prefix | long-context reads and writes still cost |
| PagedAttention | less reservation waste and external fragmentation | uses the cache more efficiently, supports concurrency | block-table overhead and internal fragmentation |
| GQA / MLA | fewer KV heads or a smaller cached representation | possibly fewer reads and writes | needs matching architecture and training |
| Speculative decoding / MTP | not mainly about saving cache | one target verification yields several tokens | draft, acceptance rate and correction cost |

Not every method lowers TTFT directly; some mainly improve decode throughput or capacity. Service quality also involves queueing and tail latency.

## 2. On hearing “the model is slow”, ask first

1. Training or serving? A single request or high concurrency?
2. Does it not fit, is TTFT high, is TPOT high, or is overall throughput low?
3. What are the input/output lengths, effective batch, precision and model structure?
4. How much memory goes to weights, training state, activations or KV?
5. Among compute, HBM bandwidth and inter-GPU communication, who is waiting?
6. Before and after, are you comparing at equal quality, the same sampling settings and the same load?

If the problem is only queueing, faster attention will not necessarily remove the wait; if weights plus Adam state exceed capacity, paging the KV cache is not the matching remedy.

## 3. Hand-calculation self-test

<details><summary>100 billion parameters at 2 bytes each — how much do the weights alone take?</summary><p>200 GB, about 186.2645 GiB; training or serving extra state excluded.</p></details>
<details><summary>s=[0,ln2,ln4], v=[2,4,8] — what is the attention output?</summary><p>The exponential ratios are 1:2:4, so the output is 42/7=6. Adding 1000 to every score changes nothing, and the stable online algorithm still computes it.</p></details>
<details><summary>Does FlashAttention reduce every query–key pair?</summary><p>No. It mainly removes materialisation and IO; standard dense attention still computes the required pairs, and the causal mask still applies.</p></details>
<details><summary>With 16 bytes of state per parameter, P=1B and 4 GPUs, what do ZeRO-1 and ZeRO-3 give per GPU?</summary><p>Under this page’s 2P parameters, 2P gradients and 12P optimiser state, stage 1 is 7 GB and stage 3 is 4 GB, neither a full peak.</p></details>
<details><summary>TTFT=0.5 s, 11 output tokens, TPOT=0.03 s — what is TTLT?</summary><p>0.5+(11−1)×0.03=0.8 s, not 11 more full intervals.</p></details>
<details><summary>C=100 TFLOP/s, W=1 TB/s, I=10 FLOPs/byte — what is the roofline bound?</summary><p>min(100,1×10)=10 TFLOP/s, in the bandwidth-bound region; a measurement may be lower.</p></details>
<details><summary>Going from 24 KV sets to 2 with GQA — is total memory saved by 91.67%?</summary><p>Only the KV data falls by 91.67% under otherwise equal conditions; it does not generalise to total memory or total time.</p></details>
<details><summary>After a draft rejection, is resampling straight from the target correct?</summary><p>Generally not. The accepted branch already holds mass; the correction should be sampled from the normalised positive residual max(T−D,0).</p></details>
<details><summary>Why is a multi-token head not automatically equivalent to the ordinary autoregressive model?</summary><p>Several heads may condition on the same prefix, so future heads are not conditioned on the actually sampled previous token; correction or an explicitly different generation distribution is required.</p></details>

## 4. Subtitle and verbal simplifications

| Subtitle or spoken form | How to read it |
| --- | --- |
| 0/0 redundancy optimizer | ZeRO / Zero Redundancy Optimizer |
| image A / multi-attention | MHA / MQA depending on context |
| Laura | LoRA |
| multi-latent attention | the standard abbreviation MLA is Multi-head Latent Attention |
| “no HBM reads or writes” | fewer HBM reads and writes for intermediates; Q/K/V and the output still move |
| “causal mask multiplies by a triangular matrix” | the mask excludes future logits; multiplying logits by 0 is not the same as −∞ |
| “underflow set to 0 is completely fine” | finite-precision error is possible; avoiding overflow does not guarantee bitwise identity |
| “next token for free” | after all drafts are accepted, an extra distribution from the verified forward pass is reused; it is not a zero-cost promise |

## 5. Reference leads and scope

The course touches FlashAttention (Dao et al., 2022), ZeRO (Rajbhandari et al., 2019), Megatron-LM, GPipe, Ring Attention, GShard, PagedAttention (Kwon et al., 2023), DeepSeek-V2’s MLA, speculative sampling (Chen et al., 2023), DistillSpec and multi-token prediction (Gloeckle et al., 2024).

This is a study note about system principles, not CUDA kernel implementations, a runnable multi-node training configuration, or a service capacity promise. The hardware and price snapshots in the slides are not live facts; real deployment needs measurement and correctness regression, not a copied speed-up number.
