---
slug: background
title: "Motivation: from counting to learned representations"
collection: cme295
lecture: 1
lang: en
description: "N-grams, neural language models and vector similarity."
order: 30
kind: lesson
status: published
tags: ["N-gram", "NNLM"]
---

<section id="background">
<div class="tag">Supplementary reading · reference sections 1.1–1.3; not a standalone slide chapter</div>

<p>One basic task of a language model: <strong>given the preceding text, assign probabilities to the next token.</strong> The most direct approach is to count what has followed the same prefix before.</p>
<div class="math">Small training corpus (2 sentences, counted separately, no connection across sentences):<br>[BOS] agent learns [EOS]<br>[BOS] agent works [EOS]</div>
<div class="flow"><span class="chip">prefix: agent</span><span class="arrow">→ count successors →</span><span class="chip">learns: 1 time → 1/2</span><span class="chip">works: 1 time → 1/2</span></div>
<p>This is a Bigram: it only looks at the previous word. In general an N-gram looks at the previous n−1 words, approximating the full history with a local one. Here n is the N-gram order, a different context from the n used later for sequence length.</p>
<div class="math">P(next word | current word) = count of the two words adjacent / count of the current word as prefix<br>P(agent | [BOS]) = 2/2 = 1<br>P(learns | agent) = 1/2<br>P([EOS] | learns) = 1/1 = 1<br>P(agent learns [EOS] | [BOS]) = 1 × 1/2 × 1 = 1/2</div>
<div class="grid"><div class="layer"><strong>Problem 1: what about combinations never seen?</strong><br>If robot never appears in the training corpus, the denominator count is 0 and no probability estimate is available directly; even if robot appeared, a new combination robot learns may still count 0. Smoothing and backoff help, but need extra rules.</div><div class="layer"><strong>Problem 2: similar words cannot share knowledge naturally</strong><br>Having seen agent learns does not mean the count table knows robot learns is also plausible. Neural models get more chances to generalise by learning representations and sharing parameters.</div></div>
<p>The motivation for learned vectors is therefore concrete: map discrete symbols into a space where statistics can be computed and shared. It does not guarantee that every new combination is sensible, but it avoids relying on independent phrase counts alone.</p>
<h2 id="part-2">From “learning representations” to “computing similarity with representations”</h2>
<p>The 2003 neural language model (NNLM) combined two things: give every word a dense vector table, then use a feed-forward network to predict the next word from the previous few. The payoff is direct: <strong>an unseen combination still gets a plausible probability</strong>, because similar words share similar parameters.</p>
<div class="flow"><span class="chip">discrete word → look up a dense vector</span><span class="arrow">→</span><span class="chip">concatenate the previous n−1 vectors</span><span class="arrow">→</span><span class="chip">feed-forward network</span><span class="arrow">→</span><span class="chip">probability over the vocabulary</span></div>
<p>Once words are vectors, “close in meaning” becomes a number. The usual measure is <strong>cosine similarity</strong>, which looks only at direction, not length:</p>
<div class="math">cos(a, b) = (a · b) / (|a| × |b|)<br>1 → same direction; 0 → orthogonal; −1 → opposite direction</div>
<p>Using the example embedding table from section ② on this page (these numbers are teaching examples, not real model outputs):</p>
<div class="table-wrap"><table><thead><tr><th>Word pair</th><th>Cosine similarity</th><th>How to read it</th></tr></thead><tbody><tr><th>teddy bear · cute</th><td>0.981</td><td>Nearly the same direction: close in meaning</td></tr><tr><th>reading · book</th><td>0.985</td><td>Both in a “reading” context</td></tr><tr><th>teddy bear · reading</th><td>−0.333</td><td>Directions lean apart; weakly related</td></tr><tr><th>cute · “.”</th><td>−0.784</td><td>A punctuation token is far from a content word</td></tr></tbody></table></div>
<div class="note">Cosine looks only at direction. Scaling a vector by 2 leaves its cosine similarity to other words unchanged while its Euclidean distance changes. That is why similarity often prefers cosine.</div>
<details><summary>How this connects to lecture 1</summary><p>The course starts from word representations and RNNs. This page supplies the motivation that precedes them: count-based models share knowledge poorly → learn vector representations; static vectors have no current context → sequence models; long recurrent paths → attention reading the relevant positions directly.</p></details>
</section>
