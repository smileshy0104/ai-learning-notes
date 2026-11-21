---
slug: embedding
title: "Token representation"
collection: cme295
lecture: 1
lang: en
description: "From discrete ids to learnable vectors; initial embeddings versus contextual representations."
order: 50
kind: lesson
status: published
tags: ["Embedding", "One-hot"]
---

<section id="embedding" class="switch">
<div class="tag">Lecture outline · Word representation / Token representations（slides 33–44）</div>

<p>Think of a token ID as a library call number: it helps you find the right record, but the number itself carries no meaning. An <strong>embedding</strong> is the lookup that turns that ID into a set of learnable numbers.</p>
<p>Pick a token and see what it looks up:</p>
<input type="radio" name="emb" id="emb-a" checked>
<input type="radio" name="emb" id="emb-b">
<input type="radio" name="emb" id="emb-c">
<div class="controls" role="group" aria-label="Pick a token"><label for="emb-a">teddy bear</label><label for="emb-b">cute</label><label for="emb-c">reading</label></div>
<div class="panel panel-a"><div class="flow"><span class="chip">token: teddy bear</span><span class="arrow">→</span><span class="chip">example ID: 42</span><span class="arrow">→ look up →</span><span class="chip">example vector: [1, 0]</span></div></div>
<div class="panel panel-b"><div class="flow"><span class="chip">token: cute</span><span class="arrow">→</span><span class="chip">example ID: 7</span><span class="arrow">→ look up →</span><span class="chip">example vector: [0, 2]</span></div></div>
<div class="panel panel-c"><div class="flow"><span class="chip">token: reading</span><span class="arrow">→</span><span class="chip">example ID: 105</span><span class="arrow">→ look up →</span><span class="chip">example vector: [1, 1]</span></div></div>
<h2 id="part-2">Two ways to represent a token: one-hot and learned embeddings</h2>
<p>Slide 33 splits token representation into two families: the naive form (one-hot) and learned vectors (learned embedding). Start with a tiny 5-word vocabulary to see the difference:</p>
<div class="grid">
<div><h3 id="part-3">One-hot: one dedicated axis per token</h3>
<div class="table-wrap"><table><caption>Length = vocabulary size V = 5</caption><thead><tr><th>token</th><th>vector</th></tr></thead><tbody><tr><th scope="row">teddy bear</th><td>[1, 0, 0, 0, 0]</td></tr><tr><th scope="row">cute</th><td>[0, 1, 0, 0, 0]</td></tr><tr><th scope="row">reading</th><td>[0, 0, 1, 0, 0]</td></tr><tr><th scope="row">book</th><td>[0, 0, 0, 1, 0]</td></tr><tr><th scope="row">.</th><td>[0, 0, 0, 0, 1]</td></tr></tbody></table></div>
<p>A one-hot vector says “which symbol this is”; it says nothing about how close meanings are. The dot product of any two different tokens is 0, so “teddy bear” and “cute” look exactly as distant as “teddy bear” and “book”. That does not mean a network can never learn relations — later linear layers can learn a different direction and weight for every position (the embedding table below is that idea). The problem is that one-hot <strong>has no ready-made compact dimensions for similarity</strong>, which is why dense embeddings are more direct.</p>
</div>
<div><h3 id="part-4">Learned embedding: one learnable row per token</h3>
<div class="table-wrap"><table><caption>Embedding table V × d with d = 3（numbers are examples）</caption><thead><tr><th>token</th><th>dim 1</th><th>dim 2</th><th>dim 3</th></tr></thead><tbody><tr><th scope="row">teddy bear</th><td>0.9</td><td>0.8</td><td>−0.2</td></tr><tr><th scope="row">cute</th><td>0.7</td><td>0.9</td><td>−0.1</td></tr><tr><th scope="row">reading</th><td>−0.3</td><td>0.1</td><td>0.8</td></tr><tr><th scope="row">book</th><td>−0.2</td><td>0.2</td><td>0.7</td></tr><tr><th scope="row">.</th><td>0.0</td><td>−0.4</td><td>0.1</td></tr></tbody></table></div>
<p>The vectors for teddy bear and cute are close, and so are reading and book. Similarity is written into the numbers, so a dot product or cosine similarity measures it directly.</p>
</div>
</div>
<div class="note"><strong>How the two relate:</strong> “multiply a one-hot vector by the embedding matrix” is mathematically the same as “take the row for that ID”, but real implementations usually look the row up directly, because multiplying by an almost all-zero vector wastes work. A one-hot vector has length V (vocabulary size); an embedding vector has length d, a separate hyperparameter usually far smaller than V.</div>
<p>Slides 34–44 use Word2Vec to show that such vectors can be <strong>learned</strong>: train a simple network on a proxy task (predict context words, or predict the centre word from context) and take the middle-layer representation as the word vector. One contrast the slides do not stress —</p>
<div class="table-wrap"><table><thead><tr><th>Aspect</th><th>One-hot</th><th>Learned embedding</th></tr></thead><tbody><tr><td>Length</td><td>V (vocabulary size)</td><td>d (chosen hyperparameter)</td></tr><tr><td>Learnable</td><td>No, fixed</td><td>Yes, updated during training</td></tr><tr><td>Similarity</td><td>Any two different tokens are orthogonal in one-hot space</td><td>Dot product / cosine compares distance directly</td></tr><tr><td>Parameters</td><td>0 (just an index)</td><td>V × d</td></tr></tbody></table></div>
<h2 id="part-5">Two more “representations” to keep apart</h2>
<p>This distinction matters:</p>
<ul><li><strong>Initial token embedding:</strong> the same token usually looks up the same initial vector.</li><li><strong>Contextual representation:</strong> after later layers it changes with the rest of the sentence. The same <code>bank</code> can mean a financial institution or a river bank depending on context.</li></ul>
<div class="note">Two-dimensional vectors are used here for easy arithmetic. Real models use many more dimensions, and individual dimensions usually have no pre-assigned human meaning.</div>
<p class="source">Slide map: pages 33–44; contextual representations appear on page 104.</p>
</section>
