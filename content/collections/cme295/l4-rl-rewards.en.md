---
slug: l4-rl-rewards
title: "RL and reward: how does a token become an action?"
collection: cme295
lecture: 4
lang: en
description: "Start from the definitions of state, action, policy and return, map them onto LLM tokens and complete answers, and separate RLHF from RLVR."
order: 20
kind: lesson
status: published
tags: [RL, Policy, RLHF, RLVR]
---

## 1. What is reinforcement learning?

PDF pages 12–23. An agent observes the current state, uses a policy to choose an action, interacts with the environment and receives reward, learning to raise long-run return.

Here “agent” is the acting subject in RL, not specifically today’s “AI agent product with file tools and an execution loop”. The two senses can combine, but their definitions must not be mixed.

| RL concept | Definition | Corresponding idea in an LLM |
| --- | --- | --- |
| State s | what the current decision can see | prompt plus the generated prefix |
| Action a | the current choice | the next token |
| Policy πθ(a∣s) | action distribution given the state | the network’s conditional token probabilities |
| Transition | how the state changes after an action | appending the token to the prefix |
| Reward r | current or final evaluation | rules, tests, reward-model scores |
| Return R | accumulated reward, possibly discounted | in simplified settings, the score at the end of the answer |

One sequence of states, actions and rewards from a start state to a terminal state is a trajectory τ. In general the return is `R(τ)=Σ_t γ^t r_t` with γ∈[0,1] a discount factor; the simple LLM examples here usually reward only at the end, taking γ=1. A terminal score and a discounted cumulative return are different settings, not two symbols to mix without saying so.

### The shape of policy outputs

With batch size B, T scored positions and vocabulary V, the network’s logits are usually B×T×V, and softmax over the last dimension gives conditional probabilities of the same shape. Taking the log-probability of each actually chosen answer token gives B×T; masking and summing yields B sequence log-probabilities. The reward is usually B scalars, not a B×T×V table of per-word labels.

## 2. The whole answer can also be the action

If you score only after the complete answer, it is convenient to write:

```text
x ~ D: sample a prompt
y ~ πθ(·|x): sample a complete answer
R(x,y): score it
```

The answer probability is the product of conditional token probabilities, and its log is the sum of the per-position log-probabilities. It is not the product of each position’s top probability — you use the probability of the tokens actually chosen in this answer.

Teaching example: three chosen token probabilities 0.5, 0.8 and 0.25 give a complete-answer probability of 0.1 and a log-probability of about −2.3026. Real long answers can have extremely small probabilities, hence computing in log space.

## 3. Two sources of reward

### RLHF: learn a reward from preference data

Humans compare two answers to the same prompt, a reward model is trained with [Bradley–Terry](l3-rlhf.html), and that RM then scores new samples. Policy training usually does not need a human scoring every answer in real time.

Preferences include tone and helpfulness, not only purely subjective things; equally, an RM can learn facts or preferences wrongly.

### RLVR: verifiable rewards

RL with Verifiable Rewards. Answer checks, program tests and similar rules decide whether the task was completed. For example, with the fixed box conditions, outputting “the kitchen” in the required format gets reward 1, otherwise 0.

Verifiers still have coverage and parsing problems. A correct final answer does not mean the intermediate explanation is correct, and passing tests does not prove every behaviour is safe.

## 4. How does reward enter training?

<div class="flow"><span class="chip">the model samples answers</span><span class="arrow">→ frozen RM or verification rules →</span><span class="chip">scalar reward</span><span class="arrow">→ policy-gradient objective →</span><span class="chip">optimiser updates the policy</span></div>

Sampling a discrete token cannot be differentiated pathwise like a continuous matrix layer. We need the log-probability trick derived later, which raises the probability of answers that earn high reward.

“Frozen reward” means this policy update takes no gradient with respect to the reward model’s parameters; it does not mean the score is independent of the answer.

## 5. Conditions a reward design must state

- Which inputs the score depends on, and whether it secretly reads training targets or external state.
- Whether the reward is per token, per step or per sequence.
- Whether it includes extra terms for length, format or tool calls.
- Whether the RM and the rules were independently validated, and what loopholes are easy to exploit.
- How outcome and preference rewards combine, and whether KL is penalised twice.

The simple derivations later assume the reward does not explicitly depend on θ and that the prompt distribution is fixed, so extra derivatives do not muddy the main line.

## Check your understanding

<details><summary>Without a human scoring every step, is it still RLHF?</summary><p>Classic two-stage RLHF trains an RM from human preferences, then freezes it to score samples. HF describes where the feedback came from; it does not require a human inside every update.</p></details>
<details><summary>Why does “RLVR uses deterministic verification” not mean “the reward is absolutely correct”?</summary><p>A buggy program can deterministically produce wrong scores. Determinism describes repeatable execution, not whether the verification rules are complete.</p></details>

Source: PDF pages 12–26; the three-token probability example is a teaching construction.
