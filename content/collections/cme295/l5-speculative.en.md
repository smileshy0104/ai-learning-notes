---
slug: l5-speculative
title: "Speculative decoding: draft first, then keep the target distribution"
collection: cme295
lecture: 5
lang: en
description: "Derive the acceptance rate and residual distribution step by step, hand-compute three tokens to prove the target is recovered, and explain serial drafting with parallel verification."
order: 100
kind: lesson
status: published
tags: [Speculative decoding, Rejection sampling, Exact sampling]
---

## 1. Why a draft model?

PDF pages 138–147. The large target model generates slowly step by step, but once a string of candidates is known, each position’s conditional probability can be computed in parallel. Let a cheap draft propose k tokens, then have the target verify them in one forward pass.

The draft itself is usually still autoregressive, just cheaper; target verification is not judging whether the sentence is logically correct but accepting and correcting by probability. The causal mask still applies, and each position conditions on the draft tokens before it.

## 2. The rule at one position

Under the same accepted prefix, with draft distribution D and target distribution T, first sample x~D:

```text
acceptance probability a(x)=min(1,T(x)/D(x))
```

- T(x)≥D(x): always accept.
- T(x)<D(x): accept with that ratio, otherwise reject.
- After rejection, resample a corrected token from r(x)∝max(T(x)−D(x),0).

The ratio is evaluated only for candidates D can produce; a token with D=0 is never proposed by the draft but can still be output through the residual branch. When T=D the rejection rate is 0 and there is no all-zero residual to normalise.

## 3. Why not resample straight from T after a rejection?

The accepted branch has already contributed part of the probability mass. Sampling from T again would double-count it, so the correction must come from the residual not yet covered by the accepted branch.

<!-- lab:l5-speculative -->

Three teaching candidates: D=[0.6,0.3,0.1], T=[0.3,0.4,0.3].

```text
acceptance rates: [0.5,1,1]
unconditional mass of each accepted branch = min(D,T) = [0.3,0.3,0.1]
total acceptance probability = 0.7, rejection probability = 0.3
positive residual = [0,0.1,0.2], normalised = [0,1/3,2/3]
final mass = [0.3,0.3,0.1]+0.3×[0,1/3,2/3] = T
```

Resampling wrongly from T gives [0.39,0.42,0.19], which is not the target.

## 4. Proving it with formulas

The total rejection probability Z is:

```text
Z=1−Σ_x min(D(x),T(x))
 =Σ_x max(T(x)−D(x),0)
```

For any candidate x:

```text
P(output=x)
= D(x)×min(1,T(x)/D(x)) + Z×r(x)
= min(D(x),T(x)) + max(T(x)−D(x),0)
= T(x)
```

This also explains how the acceptance rate relates to the overlapping mass. It can be shown equal to one minus the total variation distance, though this lecture does not require extra distance theory.

## 5. From one position to a whole draft

Check the draft tokens in order, keeping the accepted prefix; on the first rejection, output one residual-sampled token and discard the drafts after it, because the conditioning prefix has changed.

If all k are accepted, the target already has the next-token distribution at the final position, so one bonus token can be sampled. That is not “any verification always yields one extra token for free”; the bonus still involves an output head, sampling and scheduling, it just usually saves one full target forward pass.

The cache must roll back the positions of discarded drafts, or later conditioning is wrong. EOS, stopping conditions and length limits must be handled consistently too.

## 6. When is “preserving the distribution” actually claimed?

D and T must refer to the same token space and the actually normalised sampling distributions under the same prefix; temperature, top-p and similar processing must match the proved target, and you cannot sample from a truncated distribution while computing acceptance with untruncated probabilities.

Identical mathematical distributions do not mean identical token sequences for the same random seed; finite precision, implementation and sampling strategy still need verification. Matching under greedy decoding is a different setup and cannot casually borrow this stochastic proof.

## 7. How much faster?

The draft must be clearly cheaper and overlap enough with the target. The earlier a rejection happens, the more of the draft is wasted; a large k also raises verification and KV cost.

As a teaching approximation with a constant independent acceptance rate α and k drafts per round, counting both the post-rejection correction and the all-accepted bonus as 1 token, the expected number of outputs is:

```text
E[N]=1+α+α²+…+α^k
```

With α=0.8 and k=3 this is 2.952; with α=1 it is 4. This approximation assumes equal, independent acceptance at each position, which real sequences need not satisfy.

If drafting costs 2 ms per step and target verification 20 ms, the round costs about 26 ms; assuming a normal target step is also 20 ms, the speed-up is about 2.27×. Other overheads are excluded, so this is not a real benchmark or a guarantee.

## Check your understanding

<details><summary>Why can a token be accepted outright when the target gives it higher probability?</summary><p>The mass the draft proposes does not exceed the mass the target wants, so accepting it in full cannot over-allocate; the remaining mass is filled by the residual.</p></details>
<details><summary>After one rejection, why can the later drafts not be reused?</summary><p>Those drafts were generated with the rejected token as prefix. After correction the conditioning changes, so you must restart or use another algorithm whose correctness is proved.</p></details>

Source: PDF pages 138–147 and the full-probability proof in the transcript; the three-candidate example, acceptance expectation and timing example are teaching constructions.
