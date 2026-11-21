---
slug: basics
title: "The basic toolbox: how a model learns"
collection: cme295
lecture: 1
lang: en
description: "14 fundamentals, each with a worked example you can recompute by hand (intermediate values and shape checks included), through one forward pass, backward pass and update."
order: 20
kind: lesson
status: published
tags: ["Forward pass", "Gradient", "Loss"]
---

<section id="basics" class="switch">
<div class="tag">Basic toolbox · supplementary, not a slide chapter; every concept comes with an example you can work through by hand, including intermediate values and shape checks</div>

<p>Every section follows the same pattern: a <strong>definition</strong>, then <strong>why it is needed</strong>, then the <strong>numbers of this example</strong> worked through step by step with intermediate values and shapes. All examples share one task: a 4-word vocabulary (cute, soft, reading, is), the network compresses “teddy bear” into h = [0.5, −0.3], and it must predict the next word, whose correct answer is “cute”.</p>
<p>How to read it: <strong>every example can be recomputed with paper and pencil</strong>. If a step does not match, check the shapes first (concept 1) and whether you missed the ReLU (concept 5); those are the most common hand-calculation slips.</p>
<div class="flow"><span class="chip">h = [0.5, −0.3]</span><span class="arrow">→ linear layer →</span><span class="chip">4 scores z</span><span class="arrow">→ softmax →</span><span class="chip">4 probabilities p</span><span class="arrow">→ cross-entropy →</span><span class="chip">loss L</span><span class="arrow">→ backward →</span><span class="chip">gradients</span><span class="arrow">→ update →</span><span class="chip">new W</span></div>

<h2 id="part-2">Concept 1: tensors, vectors, matrices and shapes</h2>
<p class="def"><strong>Definition:</strong> a scalar is one number, a vector a list of numbers, a matrix a 2-D table of numbers, and a tensor their higher-dimensional generalisation. A <strong>shape</strong> says how many numbers each dimension holds, written (rows, columns). Matrix multiplication requires the left matrix’s column count to equal the right matrix’s row count.</p>
<p><strong>Why it is needed:</strong> every operation in a neural network is a multiplication between such shapes. Only by tracking shapes can you tell what a step actually computes and how large its result should be.</p>
<div class="math">The shape chain here: h (1, 2) → W (2, 4) → z (1, 4) → p (1, 4)<br>Rule: the left matrix’s <strong>2 columns</strong> must equal the right matrix’s <strong>2 rows</strong>; the result is (left rows, right columns) = (1, 4)</div>
<div class="table-wrap"><table><thead><tr><th>Object</th><th>Shape</th><th>Reading</th></tr></thead><tbody><tr><th scope="row">learning rate η = 2</th><td>()</td><td>a scalar, no dimensions</td></tr><tr><th scope="row">hidden state h</th><td>(2)</td><td>a length-2 vector; as (1, 2) it means “1 row, 2 columns”</td></tr><tr><th scope="row">weights W</th><td>(2, 4)</td><td>2 rows and 4 columns, one column per word</td></tr><tr><th scope="row">a batch of 32 inputs</th><td>(32, 2)</td><td>dimension 0 is the sample, dimension 1 the features</td></tr></tbody></table></div>
<div class="math">The same rule in attention: Q (4, 8) × Kᵀ (8, 4) → (4, 4), i.e. “a score for each of 4 positions against each of 4 positions”; then × V (4, 8) → (4, 8), turning scores back into 8-dim representations.<br>With batch=32 every dimension gains a leading 32: (32, 4, 8) × (32, 8, 4) → (32, 4, 4)</div>
<p><strong>The easiest trap:</strong> if W is written as (3, 4), then (1, 2) × (3, 4) is undefined — left columns 2 ≠ right rows 3. An error saying “shapes (1,2) and (3,4) cannot be multiplied” means exactly this, not “the data is wrong”.</p>

<h2 id="part-3">Concept 2: parameters and hyperparameters</h2>
<p class="def"><strong>Definition:</strong> <strong>parameters</strong> are the numbers training updates automatically (weights, biases). <strong>Hyperparameters</strong> are chosen in advance by a person; training does not change them.</p>
<p><strong>Why it is needed:</strong> without the distinction you cannot tell what to tune yourself and what the model will learn.</p>
<div class="table-wrap"><table><thead><tr><th>Kind</th><th>In this example</th><th>In a real model</th><th>Decided by</th></tr></thead><tbody><tr><th>parameters</th><td>the 8 numbers of W</td><td>all weight matrices, up to hundreds of billions</td><td>updated by training</td></tr><tr><th>hyperparameters</th><td>learning rate η = 2, hidden size 2, vocabulary 4</td><td>layers, d_model, heads, learning rate</td><td>chosen in advance</td></tr></tbody></table></div>
<div class="math">Count the parameters here: W is (2, 4) → 2×4 = 8; adding a bias b (4) → 4 more; 12 in total<br>There are only 3 hyperparameters: learning rate η = 2, hidden size 2, vocabulary 4</div>
<div class="math">A slightly larger network: 2 inputs → 4 hidden → 4 outputs<br>(2→4): 2×4 + 4 = 12　(4→4): 4×4 + 4 = 20　32 in total<br>Replace the output layer with d_model = 512 and a vocabulary of 32000: 512 × 32000 ≈ 1.64×10⁷, i.e. 16.4 M — that single layer is six orders of magnitude larger than the whole example</div>
<p><strong>How to tell them apart:</strong> any tensor the optimiser rewrites is a parameter; any number written in a config file, on the command line or in a paper (layers, learning rate, batch size) is a hyperparameter.</p>

<h2 id="part-4">Concept 3: the forward pass</h2>
<p class="def"><strong>Definition:</strong> feed the input through the network <strong>layer by layer</strong> up to the output (the prediction). A forward pass <strong>changes no parameters</strong> — parameters only change in the backward pass and the update.</p>
<p><strong>Why it is needed:</strong> it defines what the model predicts right now, and both the loss and the gradients are based on this pass; at inference you do <strong>only</strong> a forward pass.</p>
<p><strong>Example 1 (how layers connect):</strong> a two-layer network with input x = [1.0, 2.0], hidden weights W₁ = [0.5, 0.3] and output weight W₂ = 2.0:</p>
<div class="math">layer 1: z = 1.0×0.5 + 2.0×0.3 = 1.1<br>activation: h = ReLU(1.1) = 1.1<br>layer 2: y = 1.1 × 2.0 = 2.2　← the end of the forward pass: one prediction<br>(if the target is 3.0, loss = (2.2−3.0)²/2 = 0.32, see concept 7)</div>
<div class="table-wrap"><table><thead><tr><th>input x</th><th>z = x·[0.5, 0.3]</th><th>h = ReLU(z)</th><th>y = 2h</th><th>MSE (target 3.0)</th></tr></thead><tbody><tr><th scope="row">[1.0, 2.0]</th><td>1.1</td><td>1.1</td><td>2.20</td><td>0.320</td></tr><tr><th scope="row">[0.0, 1.0]</th><td>0.3</td><td>0.3</td><td>0.60</td><td>2.880</td></tr><tr><th scope="row">[1.0, −2.0]</th><td>−0.1</td><td>0 (clipped)</td><td>0.00</td><td>4.500</td></tr></tbody></table></div>
<p>All three rows follow the same flow with different inputs — that is what “the forward pass is a fixed function” means. The third row also shows ReLU: the negative z is clipped to 0, so the output is 0 and the loss jumps to 4.5.</p>
<p><strong>Example 2 (this section’s example):</strong> h = [0.5, −0.3] through the linear layer gives z = [0.440, 0.550, −0.340, −0.030], and softmax gives p = [0.3125, 0.3489, 0.1433, 0.1953]. Those two steps together are one forward pass, ending in 4 probabilities.</p>
<div class="flow"><span class="chip">h</span><span class="arrow">→ linear layer (concept 4)</span><span class="arrow">→</span><span class="chip">z</span><span class="arrow">→ softmax (concept 6)</span><span class="arrow">→</span><span class="chip">p</span><span class="arrow">→ take p(cute) →</span><span class="chip">loss (concept 7)</span></div>
<p><strong>Common mistake:</strong> the forward pass does compute things, but its intermediate results (z, p) are not what training learns; W is. With a different input the flow is identical, only h and the output differ.</p>

<h2 id="part-5">Concept 4: the linear layer (fully connected layer)</h2>
<p class="def"><strong>Definition:</strong> multiply the input vector by a weight matrix (and add a bias) to get an output vector: y = x·W + b. Each output element is a dot product of the input with one column.</p>
<p><strong>Why it is needed:</strong> it is the only basic operation carrying learnable parameters; attention’s Q/K/V projections and the FFN’s two linear layers are all the same thing.</p>
<div class="math">Example (the “cute” column): 0.5×1.0 + (−0.3)×0.2 = 0.500 − 0.060 = 0.440<br>All four words at once is h times the whole W: z = [0.440, 0.550, −0.340, −0.030]</div>
<div class="table-wrap"><table><thead><tr><th>word</th><th>W row 1</th><th>W row 2</th><th>0.5 × row 1</th><th>(−0.3) × row 2</th><th>score z</th></tr></thead><tbody><tr><th scope="row">cute</th><td>1.0</td><td>0.2</td><td>0.500</td><td>-0.060</td><td>0.440</td></tr><tr><th scope="row">soft</th><td>0.5</td><td>-1.0</td><td>0.250</td><td>0.300</td><td>0.550</td></tr><tr><th scope="row">reading</th><td>-0.5</td><td>0.3</td><td>-0.250</td><td>-0.090</td><td>-0.340</td></tr><tr><th scope="row">is</th><td>0.0</td><td>0.1</td><td>0.000</td><td>-0.030</td><td>-0.030</td></tr></tbody></table></div>
<div class="math">Two more columns by hand as a check: column 2 (soft) 0.5×0.5 + (−0.3)×(−1.0) = 0.250 + 0.300 = 0.550<br>column 4 (is) 0.5×0.0 + (−0.3)×0.1 = 0.000 − 0.030 = −0.030<br>Order matters: 0.5 multiplies row 1 and −0.3 multiplies row 2; they cannot be swapped</div>
<p>Add a bias b = [0.1, 0, −0.2, 0] (one per word, independent of h) and the scores shift as a whole:</p>
<div class="math">z = [0.440, 0.550, −0.340, −0.030] + b = [0.540, 0.550, −0.540, −0.030]<br>after softmax p = [0.3430, 0.3465, 0.1165, 0.1940] — “cute” is lifted but still second<br>From here on b = 0 to keep hand arithmetic simple; real linear layers almost always carry a bias</div>

<h2 id="part-6">Concept 5: activation functions (ReLU here)</h2>
<p class="def"><strong>Definition:</strong> the non-linear function right after a linear layer. ReLU(x) = max(0, x): negatives become 0, positives are unchanged.</p>
<p><strong>Why it is needed:</strong> with only linear layers, stacking still composes to a linear map (two matrix multiplications collapse into one), so depth adds no expressive power. Non-linearity is what makes “deeper” meaningful.</p>
<div class="math">Example: ReLU(1.1) = 1.1　ReLU(−0.7) = 0　ReLU(0) = 0<br>The negative z values here (−0.340, −0.030) would become 0 through ReLU; but output layers usually skip ReLU because scores must be allowed to go negative</div>
<div class="table-wrap"><table><thead><tr><th>input</th><th>ReLU</th><th>LeakyReLU(0.01)</th><th>sigmoid</th></tr></thead><tbody><tr><th scope="row">−1.1</th><td>0</td><td>−0.0110</td><td>0.2497</td></tr><tr><th scope="row">−0.34</th><td>0</td><td>−0.0034</td><td>0.4158</td></tr><tr><th scope="row">0</th><td>0</td><td>0</td><td>0.5000</td></tr><tr><th scope="row">1.1</th><td>1.1</td><td>1.1</td><td>0.7503</td></tr></tbody></table></div>
<p>Reading the four rows together: ReLU flattens the whole negative half to 0 (hence the “dead unit” problem); LeakyReLU keeps a tiny negative slope; sigmoid squeezes any real number into (0, 1) but has small gradients at both ends.</p>
<p><strong>Why non-linearity is mandatory:</strong> with two linear layers and no activation, y = (x·W₁)·W₂ = x·(W₁W₂). In the scalar case W₁ = 2, W₂ = 3, equivalent to a single W = 6; no matter how many layers you stack it is still one linear map, with no added capacity.</p>

<h2 id="part-7">Concept 6: logits and softmax</h2>
<p class="def"><strong>Definition:</strong> the raw scores a model outputs are <strong>logits</strong>, any real numbers. <strong>Softmax</strong> turns them into non-negative probabilities summing to 1: exponentiate first (amplifying gaps and removing signs), then divide by the total.</p>
<p><strong>Why it is needed:</strong> only probabilities read as “how likely is this the next word”, and only they pair with cross-entropy.</p>
<div class="table-wrap"><table><thead><tr><th>input logits</th><th>softmax output</th><th>Note</th></tr></thead><tbody><tr><td>[0, 0]</td><td>[0.500, 0.500]</td><td>identical, half each</td></tr><tr><td>[2, 1]</td><td>[0.731, 0.269]</td><td>gap 1, a clear lead</td></tr><tr><td>[4, 1]</td><td>[0.953, 0.047]</td><td>gap 3, almost one-sided</td></tr></tbody></table></div>
<p>The gap is amplified by the exponential: a logit difference of 1 makes the probability differ by nearly 3×.</p>
<div class="math">Step by step for [2, 1]: subtract the max 2 to avoid overflow<br>exp = [e⁰, e⁻¹] = [1.000, 0.368], total 1.368<br>p = [1.000/1.368, 0.368/1.368] = [0.731, 0.269] — the same as without the shift<br>Without shifting, exp(1000) turns into Infinity, so implementations always subtract the max</div>
<div class="math">This example: subtract the max 0.550 from every score, then exponentiate<br>exp = [0.896, 1.000, 0.411, 0.560], total 2.866<br>p = [0.3125, 0.3489, 0.1433, 0.1953]</div>
<div class="table-wrap"><table><thead><tr><th>word</th><th>z</th><th>z − 0.550</th><th>exp</th><th>probability p</th></tr></thead><tbody><tr class="selected"><th scope="row">cute (target)</th><td>0.440</td><td>-0.110</td><td>0.896</td><td>0.3125</td></tr><tr><th scope="row">soft</th><td>0.550</td><td>0.000</td><td>1.000</td><td>0.3489</td></tr><tr><th scope="row">reading</th><td>-0.340</td><td>-0.890</td><td>0.411</td><td>0.1433</td></tr><tr><th scope="row">is</th><td>-0.030</td><td>-0.580</td><td>0.560</td><td>0.1953</td></tr></tbody></table></div>
<p>The model currently prefers “soft” (34.9%) and gives the correct answer only 31.3% — it is wrong.</p>
<div class="math">Temperature: divide z by T before softmax (equivalent to scaling the logits)<br>T = 0.5 → [0.3513, 0.4377, 0.0738, 0.1372]　sharper; the top item goes from 34.9% to 43.8%<br>T = 2　 → [0.2838, 0.2998, 0.1921, 0.2243]　flatter<br>T = 8　 → [0.2588, 0.2624, 0.2348, 0.2440]　almost uniform (about 25%)</div>
<p>This explains the “temperature” knob in later decoding chapters: small T is more determinate, large T more random, but T never changes which word scores highest.</p>

<h2 id="part-8">Concept 7: the loss function</h2>
<p class="def"><strong>Definition:</strong> compress “how far the prediction is from the target” into one scalar so training knows which way to move. Regression uses mean squared error MSE = (y − t)² / 2; classification and language models usually use cross-entropy L = −ln p(correct class).</p>
<p><strong>Why it is needed:</strong> without a scalar loss there is no single direction; different losses match different tasks, and the wrong one optimises the wrong objective.</p>
<div class="math">Cross-entropy here: L = −ln p(cute) = −ln 0.3125 = 1.1632 ≈ 1.163<br>Reading: the model is 31.25% sure of the right answer, so the loss is “−ln confidence”; p = 1 gives 0, p → 0 gives +∞</div>
<div class="math">A sequence usually has several positions to predict. If three positions have probabilities 0.31, 0.62, 0.85:<br>their losses −ln = 1.171, 0.478, 0.163<br>average = (1.171 + 0.478 + 0.163) / 3 = 0.604 — training takes the <strong>mean</strong> over valid positions, not the sum</div>
<div class="table-wrap"><table><thead><tr><th>probability of the correct word</th><th>cross-entropy L</th><th>Meaning</th></tr></thead><tbody><tr><td>0.99</td><td>0.010</td><td>almost certain, almost no penalty</td></tr><tr><td>0.70</td><td>0.357</td><td>decent</td></tr><tr><td>0.31 (this example)</td><td>1.163</td><td>clearly wrong</td></tr><tr><td>0.01</td><td>4.605</td><td>confidently wrong, heavy penalty</td></tr></tbody></table></div>
<details><summary>What if this example used MSE instead?</summary><p>Treat the target as one-hot [1, 0, 0, 0]: term-by-term squared error = 0.6875² + 0.3489² + 0.1433² + 0.1953² = 0.4727 + 0.1217 + 0.0205 + 0.0381 = 0.6530, divided by 4 gives 0.1633. The number is smaller, but it measures “how far the numbers are”, which is insensitive to “the correct word has low probability”, and its gradient is small, so learning is slower. Cross-entropy looks straight at the correct word’s probability and, with softmax, has an extremely simple gradient (see concept 9).</p></details>

<h2 id="part-9">Concept 8: gradients</h2>
<p class="def"><strong>Definition:</strong> the <strong>partial derivative</strong> of the loss with respect to a parameter — “if this parameter grows a little, what happens to the loss”. The gradient collects all these partials into a vector. A positive gradient means growing the parameter raises the loss; a negative one means it lowers the loss.</p>
<p><strong>Why it is needed:</strong> it is the only quantity telling you which direction to move and how much. Without gradients, training would be guesswork.</p>
<div class="math">Single-variable example: f(w) = w², the gradient at w = 3 is 2w = 6<br>Meaning: a small increase in w raises f at roughly 6× that rate<br>Here: dL/dz(cute) = −0.6875, negative → increasing this score lowers the loss</div>
<div class="math">Verify that slope with this example: raise z(cute) from 0.440 to 0.450 (+0.01) and recompute softmax<br>L goes from 1.1631 → 1.1562, an actual change of −0.0069<br>gradient prediction = −0.6875 × 0.01 = −0.0069 — they agree</div>
<p><strong>Careful:</strong> a gradient is only a linear approximation over a small step; larger steps bring larger error. That is one reason the learning rate cannot be too big (see concept 10).</p>

<h2 id="part-10">Concept 9: backpropagation</h2>
<p class="def"><strong>Definition:</strong> compute gradients layer by layer backwards from the loss using the chain rule. You must know how to adjust the output layer before you can derive how to adjust the layer below it.</p>
<p><strong>Why it is needed:</strong> with thousands or billions of parameters you cannot try them one by one. <strong>One backward pass yields the gradients of all parameters at once</strong>, which is what makes training feasible.</p>
<p><strong>The conclusion worth remembering here:</strong> after combining softmax with cross-entropy, the gradient with respect to the logits is exactly “predicted probability − target” (derivation omitted; remember the shape first):</p>
<div class="table-wrap"><table><thead><tr><th>word</th><th>prediction p</th><th>target</th><th>gradient dL/dz</th></tr></thead><tbody><tr><th scope="row">cute</th><td>0.3125</td><td>1</td><td>-0.6875</td></tr><tr><th scope="row">soft</th><td>0.3489</td><td>0</td><td>0.3489</td></tr><tr><th scope="row">reading</th><td>0.1433</td><td>0</td><td>0.1433</td></tr><tr><th scope="row">is</th><td>0.1953</td><td>0</td><td>0.1953</td></tr></tbody></table></div>
<p>One layer further back, the parameter gradient = input × the gradient above:</p>
<div class="table-wrap"><table><thead><tr><th>word</th><th>W row 1 gradient (h₁ = 0.5)</th><th>W row 2 gradient (h₂ = −0.3)</th></tr></thead><tbody><tr><th scope="row">cute</th><td>0.5 × -0.6875 = -0.3437</td><td>−0.3 × -0.6875 = 0.2062</td></tr><tr><th scope="row">soft</th><td>0.5 × 0.3489 = 0.1744</td><td>−0.3 × 0.3489 = -0.1047</td></tr><tr><th scope="row">reading</th><td>0.5 × 0.1433 = 0.0716</td><td>−0.3 × 0.1433 = -0.0430</td></tr><tr><th scope="row">is</th><td>0.5 × 0.1953 = 0.0977</td><td>−0.3 × 0.1953 = -0.0586</td></tr></tbody></table></div>
<p class="small muted">h₂ is negative, so row 2’s gradients have the opposite sign to row 1 — the two rows for the same word move in different directions.</p>
<p>One more layer back: h’s two components each mix the gradients of all 4 words, weighted exactly by the two rows of W.</p>
<div class="table-wrap"><table><thead><tr><th>Quantity</th><th>Term by term</th><th>Result</th></tr></thead><tbody><tr><th scope="row">dL/dh₁</th><td>(−0.6875×1.0) + (0.3489×0.5) + (0.1433×−0.5) + (0.1953×0)</td><td>−0.5847</td></tr><tr><th scope="row">dL/dh₂</th><td>(−0.6875×0.2) + (0.3489×−1.0) + (0.1433×0.3) + (0.1953×0.1)</td><td>−0.4239</td></tr></tbody></table></div>
<p>This is “multiply by the transpose of the weights above”: W is (2, 4), Wᵀ is (4, 2), and multiplying the (4)-dimensional gradient gives (2). Every backward layer restores one shape.</p>

<h2 id="part-11">Concept 10: gradient descent and the learning rate</h2>
<p class="def"><strong>Definition:</strong> update parameters along the negative gradient: W ← W − η × gradient. The <strong>learning rate η</strong> sets how far each step goes.</p>
<p><strong>Why it is needed:</strong> the gradient gives direction, η gives step size. Too large overshoots the optimum, too small barely moves.</p>
<div class="math">Single-variable example (f(w) = w², η = 0.1):<br>w = 3 → gradient 6 → w = 3 − 0.6 = 2.40 (f drops from 9 to 5.76)<br>next step: gradient 4.8 → w = 1.92 (f drops to 3.69)</div>
<p>One real update of all 8 parameters here (η = 2.0, a large value chosen for visibility):</p>
<div class="table-wrap"><table><thead><tr><th>word</th><th>W row 1 (old → new)</th><th>W row 2 (old → new)</th></tr></thead><tbody><tr><th scope="row">cute</th><td>1.0000 → 1.6875</td><td>0.2000 → -0.2125</td></tr><tr><th scope="row">soft</th><td>0.5000 → 0.1511</td><td>-1.0000 → -0.7907</td></tr><tr><th scope="row">reading</th><td>-0.5000 → -0.6433</td><td>0.3000 → 0.3860</td></tr><tr><th scope="row">is</th><td>0.0000 → -0.1953</td><td>0.1000 → 0.2172</td></tr></tbody></table></div>
<div class="math">One parameter by hand (η = 2): W(cute, row 1) = 1.0 − 2 × (−0.3437) = 1.0 + 0.6875 = 1.6875<br>a negative gradient → subtract a negative → the parameter grows → that score gets higher next time, exactly the direction we want</div>
<p>After all 8 parameters move, one more forward pass gives the starting point of the “next iteration”:</p>
<div class="math">z = [0.907, 0.313, −0.437, −0.163]<br>p = [0.4640, 0.2560, 0.1209, 0.1591]; the correct answer rises from 31.3% to 46.4%<br>L = −ln 0.4640 = 0.768, down 34.0% from 1.163</div>

<h2 id="part-12">Concept 11: batch, epoch and iteration</h2>
<p class="def"><strong>Definition:</strong> a <strong>batch</strong> is the number of samples in one forward+backward pass; an <strong>iteration</strong> (step) is one parameter update; an <strong>epoch</strong> is one complete pass over the training set.</p>
<p><strong>Why it is needed:</strong> using all data at once is slow and memory-hungry, while using one sample at a time is too noisy. Batch size trades speed against stability.</p>
<div class="math">Example: 4 training samples with batch = 2<br>→ 2 iterations per epoch (2 parameter updates)<br>“One update” in this section is 1 iteration; with batch = 4 an epoch has only 1 update</div>
<div class="math">At another scale: 1000 samples with batch = 32<br>→ each epoch needs ⌈1000 / 32⌉ = 32 steps (31 full batches + 1 with only 8 samples)<br>→ 10 epochs of training = 320 parameter updates<br>with batch = 1000 (full batch) an epoch has just 1 step, but each step is slower and uses more memory</div>

<h2 id="part-13">Concept 12: training versus inference</h2>
<p class="def"><strong>Definition:</strong> <strong>training</strong> does forward, loss, backward and update, and keeps gradients and optimiser state; <strong>inference</strong> does only the forward pass with frozen parameters.</p>
<p><strong>Why it is needed:</strong> their costs differ several-fold, so deployment budgets memory and latency from inference; some layers (dropout) only act during training.</p>
<div class="table-wrap"><table><thead><tr><th>Item</th><th>Training</th><th>Inference</th></tr></thead><tbody><tr><th>parameters</th><td>1×</td><td>1×</td></tr><tr><th>gradients</th><td>1×</td><td>not needed</td></tr><tr><th>Adam first/second moments</th><td>1× each</td><td>not needed</td></tr><tr><th>total memory</th><td>about 4× (about 3× with mixed precision)</td><td>about 1×</td></tr><tr><th>dropout</th><td>on</td><td>off</td></tr></tbody></table></div>
<div class="math">Estimate with 10⁹ parameters and a few bytes per number:<br>inference fp16: 2 B × 10⁹ = 2 GB<br>training (fp32 parameters + gradients + Adam first and second moments): (4 + 4 + 4 + 4) B × 10⁹ = 16 GB<br>mixed precision (parameters and gradients fp16, optimiser state fp32): (2 + 2 + 4 + 4) B = 12 GB</div>
<p>The table’s “about 4×” is relative to fp32 inference (4 B per parameter); against fp16 inference (2 B) it is 8×. Only parameter-related memory is counted; activations, temporary buffers and fragmentation are extra (covered in lecture 5).</p>

<h2 id="part-14">Concept 13: vanishing and exploding gradients</h2>
<p class="def"><strong>Definition:</strong> backpropagation <strong>multiplies</strong> layer by layer. If each layer’s factor is slightly below 1 the product decays exponentially with depth (vanishing); slightly above 1 it grows exponentially (exploding).</p>
<p><strong>Why it is needed:</strong> it explains “why going deeper can make things worse” and “why RNNs forget early information”, and it explains why residuals and normalisation must exist.</p>
<div class="math">factor 0.5 per layer, 10 layers: 0.5¹⁰ ≈ 9.8×10⁻⁴　→ the lowest layers get almost no gradient<br>factor 2.0 per layer, 10 layers: 2¹⁰ = 1024　→ parameters are thrown off<br>close to 1 is also risky: 0.9¹⁰ ≈ 0.349, 1.1¹⁰ ≈ 2.594</div>
<div class="table-wrap"><table><thead><tr><th>factor per layer</th><th>1 layer</th><th>5 layers</th><th>10 layers</th></tr></thead><tbody><tr><th scope="row">0.5</th><td>0.500</td><td>0.031</td><td>0.0010</td></tr><tr><th scope="row">0.9</th><td>0.900</td><td>0.590</td><td>0.349</td></tr><tr><th scope="row">1.1</th><td>1.100</td><td>1.611</td><td>2.594</td></tr><tr><th scope="row">2.0</th><td>2</td><td>32</td><td>1024</td></tr></tbody></table></div>
<p>Two concrete 6-layer networks: 0.6 per layer → 0.6⁶ = 0.0467, only 4.7% of the gradient survives; 1.5 per layer → 1.5⁶ = 11.39, amplified more than tenfold. Note that 0.9 looks “very close to 1” yet after 10 layers only a third remains.</p>
<div class="grid"><div class="layer"><strong>Vanishing gradients</strong><br>layers near the input stop learning; the symptom is “deeper is worse”.</div><div class="layer"><strong>Exploding gradients</strong><br>the loss turns into NaN and numbers blow up; gradient clipping is the usual remedy.</div></div>
<p>The Transformer’s three answers (all revisited later): the residual’s 1 + f′(x) provides a direct path; LayerNorm stabilises each layer’s scale; attention makes the distance between any two positions constant.</p>

<h2 id="part-15">Concept 14: overfitting and regularisation</h2>
<p class="def"><strong>Definition:</strong> <strong>overfitting</strong> means a model does very well on training data and worse on new data; <strong>regularisation</strong> limits rote memorisation, for example dropout, label smoothing and weight decay.</p>
<p><strong>Why it is needed:</strong> language models have far more parameters than samples, so without constraints they easily memorise details of the training text.</p>
<div class="math">Example: training loss falls from 2.0 to 0.3 while validation loss rises from 2.1 to 2.6 → classic overfitting</div>
<div class="math">Dropout with p = 0.1, concretely (during training):<br>activations a = [2.0, 0.5, 1.2, 3.0], drawn mask [1, 0, 1, 1]<br>kept values divided by (1 − p) = 0.9: a′ = [2.222, 0, 1.333, 3.333]<br>at inference nothing is dropped and nothing is scaled, because 2.222 × 0.9 = 2.0 keeps the expectation</div>
<div class="math">Label smoothing ε = 0.1, K = 4: the correct class targets 0.925 and the rest 0.025 each<br>a confident correct prediction (p(correct) = 0.99): cross-entropy rises from 0.010 to 0.442 — smoothing deliberately lowers the “full marks” reward to prevent overconfidence<br>when wrong (p(correct) = 0.05): it falls slightly from 2.996 to 2.959</div>

<h2 id="part-16">Stringing the 14 concepts together: one complete update</h2>
<p>The order is fixed: forward (concepts 3–6) → loss (7) → backward (8, 9) → update (10) → next batch (11). Toggle below to compare the same forward pass before and after the update:</p>
<input type="radio" name="upd" id="upd-before" checked>
<input type="radio" name="upd" id="upd-after">
<div class="controls" role="group" aria-label="Before and after the update"><span>View:</span><label for="upd-before">before update</label><label for="upd-after">after update</label></div>
<div class="panel panel-upd-before">
<h3 id="part-17">Before: the correct answer “cute” has only 31.3%</h3>
<div class="bars"><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:31.3%"></div></div><span>31.3%</span></div><div class="barrow"><span>soft</span><div class="track"><div class="fill" style="width:34.9%"></div></div><span>34.9%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:14.3%"></div></div><span>14.3%</span></div><div class="barrow"><span>is</span><div class="track"><div class="fill" style="width:19.5%"></div></div><span>19.5%</span></div></div>
<p>Cross-entropy L = 1.163; the model prefers “soft”, so it is wrong.</p>
</div>
<div class="panel panel-upd-after">
<h3 id="part-18">After one update: the correct answer rises to 46.4%</h3>
<div class="bars"><div class="barrow"><span>cute</span><div class="track"><div class="fill" style="width:46.4%"></div></div><span>46.4%</span></div><div class="barrow"><span>soft</span><div class="track"><div class="fill" style="width:25.6%"></div></div><span>25.6%</span></div><div class="barrow"><span>reading</span><div class="track"><div class="fill" style="width:12.1%"></div></div><span>12.1%</span></div><div class="barrow"><span>is</span><div class="track"><div class="fill" style="width:15.9%"></div></div><span>15.9%</span></div></div>
<p>Cross-entropy L = 0.768, a drop of 34.0%. All that from nudging 8 parameters once.</p>
</div>

<h2 id="part-19">How this relates to the Transformer</h2>
<div class="table-wrap"><table><thead><tr><th>Here</th><th>A real Transformer</th></tr></thead><tbody><tr><td>h = [0.5, −0.3] (2 dimensions)</td><td>the hidden representation at the last position (e.g. 4096 dimensions), produced by attention + FFN</td></tr><tr><td>W is 2×4</td><td>the output projection d_model × V, where V can exceed a hundred thousand</td></tr><tr><td>softmax over 4 words</td><td>softmax over the whole vocabulary</td></tr><tr><td>target “cute”</td><td>the real next token in the training data</td></tr><tr><td>−ln p</td><td>the same cross-entropy, averaged over all positions</td></tr></tbody></table></div>
<p>All the structures later in lecture 1 (multi-head, positional encoding, residuals, LayerNorm) solve one problem: <strong>how to compute h better</strong>. Going from h to probabilities, to loss, to an update is exactly this section’s flow, unchanged.</p>
<p class="source">This section is general machine-learning background, not slide content. Every number was recomputed and checked with a script; the learning rate is a large value chosen for visibility, whereas real training often uses something around 1e−4 with warmup and decay.</p>
</section>
