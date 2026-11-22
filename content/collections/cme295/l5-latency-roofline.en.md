---
slug: l5-latency-roofline
title: "Inference bottlenecks: prefill, decode and the roofline"
collection: cme295
lecture: 5
lang: en
description: "Separate TTFT, TPOT and TTLT, and use the roofline bound and arithmetic intensity to explain parallel input processing versus token-by-token generation."
order: 70
kind: lesson
status: published
tags: [Prefill, Decode, TTFT, Roofline]
---

## 1. Input and output tokens are not the same work

PDF pages 89–96 contrast 10,000 input tokens with 10 output tokens against 10 input tokens with 10,000 output tokens.

Prefill knows the whole input and can process several positions in parallel to build the KV; decode must wait for the previous sampled result before continuing, so it has many serial rounds. Long-output requests are usually dragged down by serial generation, but length alone cannot guarantee which is faster in any deployment: queueing, context attention, batch size and hardware all matter.

Prefill parallelism does not let it see the future; a decoder still applies the causal mask.

## 2. How is latency broken down?

The slides define prefill as including the initial computation needed to produce the first token:

```text
TTFT = T_queue + T_prefill
TTLT ≈ TTFT + (O−1) × TPOT
```

O is the number of output tokens, and TPOT here is the average interval after the first token. With O=1 there are no later intervals, and dividing by O−1 is meaningless.

Teaching example: queue 0.10 s, prefill 0.40 s, O=11, TPOT=0.03 s gives TTFT=0.50 s and TTLT=0.80 s. With everything else fixed, 101 output tokens give TTLT=3.50 s; real TPOT is not constant.

Platforms may report the first decode separately, and may include network, streaming buffers, hidden inference and the boundary of what the user sees. Unify the measurement convention first; the first visible character is not always the model’s internal first token.

## 3. Throughput is not latency

With many concurrent requests, a larger batch can raise the total tokens per second while making an individual request wait longer. Reporting system throughput, per-request TTFT, TPOT and tail latency together is more complete than a single “tokens/s”.

The price screenshots illustrate the input/output/cached-input price gaps common at the slide date; they do not establish a fixed 5× or 10× law of physics. Billing also depends on product policy, so prices cannot be inverted into FLOPs.

## 4. The three quantities of a roofline

PDF pages 97–102:

```text
F：执行FLOPs
M：在所分析内存层次搬运的bytes
I=F/M：算术强度，FLOPs/byte
C：峰值计算吞吐，FLOP/s
W：内存带宽，bytes/s
reachable throughput ≤ min(C, W×I)
ideal time ≥ max(F/C, M/W)
```

This is an optimistic model assuming effective overlap and ignoring scheduling, network and synchronisation; a predicted bound is not a measured guarantee.

<!-- lab:l5-roofline -->

Teaching hardware: C=100 TFLOP/s and W=1 TB/s, so the ridge point is C/W=100 FLOPs/byte. At I=10 the bandwidth ceiling is 10 TFLOP/s; at I=200 the compute ceiling is 100 TFLOP/s.

The slanted line is W×I and the horizontal line is C; capacity in GB is never multiplied by intensity. Bandwidth and capacity must not be conflated.

## 5. Why is decode often memory-bound?

For a simplified weight-dominated linear layer with P weights at 2 bytes each, one step for one sequence is about 2P FLOPs. If b sequences in a batch share that weight read:

```text
F≈2Pb，M_weights≈2P → I_weights≈b FLOPs/byte
```

Small batches reuse little and are often limited by moving weights; larger batches raise reuse and throughput. But real long contexts also read KV and run other operators, so I=b is not an exact whole-model formula.

Prefill computes over many positions at once, usually reusing more, and with good optimisation is more likely compute-bound. Large-batch decode or long contexts move the bottleneck, so “decode is always bandwidth-bound and prefill always compute-bound” is false.

## Check your understanding

<details><summary>If the roofline predicts 10 TFLOP/s, is that what you will measure?</summary><p>No. It is an optimistic bound for the given model; execution efficiency, synchronisation and extra overheads can lower the result.</p></details>
<details><summary>Going from 1000 to 10000 input tokens — is prefill free?</summary><p>No, both computation and KV storage grow; parallelism only means it does not have to wait for sampled tokens one by one as autoregressive output does.</p></details>

Source: PDF pages 89–102; the latency numbers and simplified roofline example are teaching additions.
