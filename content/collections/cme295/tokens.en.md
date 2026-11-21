---
slug: tokens
title: "Tokenisation, vocabularies and special tokens"
collection: cme295
lecture: 1
lang: en
description: "Granularity choices, BPE, BOS, EOS and padding."
order: 40
kind: lesson
status: published
tags: ["Tokenizer", "BPE"]
---

<section id="tokens" class="switch">
<div class="tag">Lecture outline · Tokenization（slides 24–31）</div>

<p>A model cannot multiply a paragraph of text directly. The first step is to split text into <strong>tokens</strong> and give each token an ID. A token can be a whole word, part of a word, or a punctuation mark.</p>
<div class="math">原文：A cute teddy bear is reading.</div>
<input type="radio" name="tok" id="tok-word" checked>
<input type="radio" name="tok" id="tok-sub">
<input type="radio" name="tok" id="tok-char">
<div class="controls" role="group" aria-label="Tokenisation granularity"><label for="tok-word">by word</label><label for="tok-sub">by subword</label><label for="tok-char">by character</label></div>
<div class="panel panel-word">
<div class="flow"><span class="chip">A</span><span class="chip">cute</span><span class="chip">teddy</span><span class="chip">bear</span><span class="chip">is</span><span class="chip">reading</span><span class="chip">.</span></div>
<p>Sequence length: <strong>7 tokens</strong>. Each whole word is one token and punctuation is handled separately. A real word-level system also has to define case, digits and unknown words.</p>
</div>
<div class="panel panel-sub">
<div class="flow"><span class="chip">A</span><span class="chip">cute</span><span class="chip">ted</span><span class="chip">dy</span><span class="chip">bear</span><span class="chip">is</span><span class="chip">read</span><span class="chip">ing</span><span class="chip">.</span></div>
<p>Sequence length: <strong>9 tokens</strong>. Illustratively, teddy splits into ted + dy and reading into read + ing. The same pieces are reused across words, so the vocabulary does not have to list every word.</p>
</div>
<div class="panel panel-char">
<div class="flow"><span class="chip">A</span><span class="chip">␠</span><span class="chip">c</span><span class="chip">u</span><span class="chip">t</span><span class="chip">e</span><span class="chip">␠</span><span class="chip">t</span><span class="chip">e</span><span class="chip">d</span><span class="chip">d</span><span class="chip">y</span><span class="chip">␠</span><span class="chip">b</span><span class="chip">e</span><span class="chip">a</span><span class="chip">r</span><span class="chip">␠</span><span class="chip">i</span><span class="chip">s</span><span class="chip">␠</span><span class="chip">r</span><span class="chip">e</span><span class="chip">a</span><span class="chip">d</span><span class="chip">i</span><span class="chip">n</span><span class="chip">g</span><span class="chip">.</span></div>
<p>Sequence length: <strong>29 tokens</strong>. ␠ marks a space. The base alphabet is tiny and any sentence can be spelled out, but the same sentence occupies many more positions, so compute rises with it.</p>
</div>
<div class="note">Watch two quantities: <strong>vocabulary size</strong> is “how many reusable pieces exist in total”; <strong>sequence length</strong> is “how many pieces this sentence used”. What you can see here directly is the latter.</div>
<p class="small muted">The three splits are only for comparison. Real BPE segmentation comes from its vocabulary and merge rules, and spaces have their own encoding; “by subword” here does not run BPE training.</p>
<details><summary>Think about it: why not treat every sentence as one token?</summary><p>There are far too many possible sentences for a finite vocabulary to list. Splitting text into reusable pieces lets a finite vocabulary compose a huge number of expressions. At the other extreme, splitting very finely makes sequences long and compute larger.</p></details>
<h2 id="part-2">Special tokens: not ordinary text, but fixed roles</h2>
<p>Besides ordinary text pieces, the vocabulary reserves <strong>special tokens</strong> with fixed meanings. They act like function markers in a sentence: telling the model where a passage starts and ends, or that a position holds no real content.</p>
<div class="table-wrap"><table><thead><tr><th>Special token</th><th>Name</th><th>Role</th><th>Example</th></tr></thead><tbody><tr><td>[UNK]</td><td>Unknown</td><td>Marks a piece absent from the vocabulary</td><td>A misspelled word is replaced with [UNK]</td></tr><tr><td>[BOS]</td><td>Beginning of sequence</td><td>Tells the model “start here”</td><td>Generation begins by feeding [BOS]</td></tr><tr><td>[EOS]</td><td>End of sequence</td><td>Tells the model “it ends here”</td><td>Stop when the model emits [EOS]</td></tr><tr><td>[PAD]</td><td>Padding</td><td>Pads short sentences to a common length; its positions carry no real content</td><td>Pad a 4-token sentence to 8</td></tr></tbody></table></div>
<h3 id="part-3">Example 1: a word missing from the vocabulary</h3>
<p>Suppose the vocabulary has only four tokens: <code>teddy bear</code>, <code>cute bear</code>, <code>bear</code>, <code>[UNK]</code>. The input is typed as <code>tedi bear</code> (one d short), so the first character combination is not in the vocabulary:</p>
<div class="flow"><span class="chip">tedi</span><span class="arrow">→ not found →</span><span class="chip">[UNK]</span><span class="arrow">+</span><span class="chip">bear</span></div>
<p>Now the model at least knows “something is here that I do not recognise” instead of silently dropping it. Modern byte-level subword tokenizers keep common character sequences in the vocabulary, so ordinary typos usually need no [UNK].</p>
<h3 id="part-4">Example 2: start and end</h3>
<p>When generating text, the model needs to be told where to start and needs to tell us when to stop:</p>
<div class="flow"><span class="chip">[BOS]</span><span class="chip">What</span><span class="chip">a</span><span class="chip">cute</span><span class="chip">teddy bear</span><span class="chip">!</span><span class="chip">[EOS]</span></div>
<p>[BOS] is the <strong>input</strong>’s first position, used to start generation; [EOS] is the stop signal the model should <strong>output</strong>. They are not the same thing.</p>
<h3 id="part-5">Example 3: why padding is needed</h3>
<p>Sentences in one batch have different lengths. Hardware likes rectangular matrices, so short sentences are often padded to a common length. Toggle below:</p>
<input type="radio" name="pad" id="pad-off" checked>
<input type="radio" name="pad" id="pad-on">
<div class="controls" role="group" aria-label="Padding"><label for="pad-off">original lengths</label><label for="pad-on">pad to 8 positions</label></div>
<div class="panel panel-padoff">
<div class="flow"><span class="chip">[BOS]</span><span class="chip">What</span><span class="chip">a</span><span class="chip">cute</span><span class="chip">teddy bear</span><span class="chip">!</span><span class="chip">[EOS]</span></div>
<p>Sentence A: 7 positions; sentence B: 4 positions. Different lengths cannot be stacked into one neat matrix.</p>
</div>
<div class="panel panel-padon">
<p>Sentence A (7):</p>
<div class="flow"><span class="chip">[BOS]</span><span class="chip">What</span><span class="chip">a</span><span class="chip">cute</span><span class="chip">teddy bear</span><span class="chip">!</span><span class="chip">[EOS]</span><span class="chip muted-chip">[PAD]</span></div>
<p>Sentence B (4):</p>
<div class="flow"><span class="chip">[BOS]</span><span class="chip">Good</span><span class="chip">night</span><span class="chip">[EOS]</span><span class="chip muted-chip">[PAD]</span><span class="chip muted-chip">[PAD]</span><span class="chip muted-chip">[PAD]</span><span class="chip muted-chip">[PAD]</span></div>
<p>Both rows now have 8 positions and can be stacked into a matrix. Padded positions are not real content: attention usually has to ignore them during training, otherwise they disturb the computation and the loss.</p>
</div>
<div class="note"><strong>The names are not fixed.</strong> Different models use <code>&lt;s&gt;</code>, <code>&lt;|endoftext|&gt;</code>, <code>&lt;|start_header_id|&gt;</code> and so on; chat models may also carry role tokens marking who is speaking (user, assistant). When using a model, read its own tokenizer documentation instead of assuming these names.</div>
<details><summary>Check your understanding: who produces [BOS] and [EOS]?</summary><p>[BOS] is usually added by the user when building the input, as the generation start (input side); [EOS] is usually predicted by the model at the output layer, as the stop signal (output side). In the original Transformer translation example the decoder input starts with [BOS] and the training target ends with [EOS].</p></details>
<h2 id="part-6">Tokenizers and vocabulary size</h2>
<p>A <strong>tokenizer</strong> is a component separate from the neural network, responsible for converting text ⇄ IDs:</p>
<div class="flow"><span class="chip">training: collect a vocabulary and merge rules from a corpus</span><span class="arrow">→</span><span class="chip">use: encode text → IDs</span><span class="arrow">→</span><span class="chip">model computation</span><span class="arrow">→</span><span class="chip">decode IDs → text</span></div>
<p>The vocabulary size V is “how many usable symbols are prepared in total”. It trades off against sequence length n: finer splits mean a smaller vocabulary but more positions for the same sentence; coarser splits shorten the sequence but grow the vocabulary.</p>
<div class="table-wrap"><table><thead><tr><th>Granularity</th><th>Rough vocabulary size</th><th>Sequence length for the same sentence</th><th>Main cost</th></tr></thead><tbody><tr><td>character</td><td>tens to hundreds</td><td>longest</td><td>more positions, heavier compute and long-range dependencies</td></tr><tr><td>subword (mainstream)</td><td>about 30 thousand to 200 thousand</td><td>medium</td><td>depends on training corpus and language coverage</td></tr><tr><td>word</td><td>hundreds of thousands or more</td><td>shortest</td><td>out-of-vocabulary words and morphology inflate the vocabulary</td></tr></tbody></table></div>
<p class="small muted">These ranges are common magnitudes from public models, for intuition only; exact numbers come from each model’s tokenizer documentation.</p>
<h3 id="part-7">What does BPE actually do?</h3>
<p>The lecture uses BPE (Byte Pair Encoding): start from base symbols and repeatedly merge <strong>the most frequent adjacent symbol pair</strong> in the corpus into a new symbol, until the vocabulary reaches its target size. Here is a tiny corpus through four steps:</p>
<input type="radio" name="bpe" id="bpe-1" checked>
<input type="radio" name="bpe" id="bpe-2">
<input type="radio" name="bpe" id="bpe-3">
<input type="radio" name="bpe" id="bpe-4">
<div class="controls" role="group" aria-label="BPE merge steps"><span>Merge step:</span><label for="bpe-1">step 0: letters only</label><label for="bpe-2">step 1: merge a+d</label><label for="bpe-3">step 2: merge e+ad</label><label for="bpe-4">step 3: merge r+ead</label></div>
<div class="panel panel-bpe1">
<div class="table-wrap"><table><caption>Step 0: letters only</caption><thead><tr><th>Word in corpus</th><th>Current split</th><th>tokens</th></tr></thead><tbody><tr><th scope="row">read ×4</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">a</span><span class="chip">d</span></div></td><td>4</td></tr><tr><th scope="row">reader ×2</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">a</span><span class="chip">d</span><span class="chip">e</span><span class="chip">r</span></div></td><td>6</td></tr><tr><th scope="row">reading ×3</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">a</span><span class="chip">d</span><span class="chip">i</span><span class="chip">n</span><span class="chip">g</span></div></td><td>7</td></tr></tbody></table></div>
<p><strong>Vocabulary:</strong> the letters r e a d i n g (7 symbols)</p>
<p>The initial vocabulary holds single characters only. read, reader and reading are all split finely, so sequences are long.</p>
</div>
<div class="panel panel-bpe2">
<div class="table-wrap"><table><caption>Step 1: merge a+d (a + d → ad)</caption><thead><tr><th>Word in corpus</th><th>Current split</th><th>tokens</th></tr></thead><tbody><tr><th scope="row">read ×4</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">ad</span></div></td><td>3</td></tr><tr><th scope="row">reader ×2</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">ad</span><span class="chip">e</span><span class="chip">r</span></div></td><td>5</td></tr><tr><th scope="row">reading ×3</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">e</span><span class="chip">ad</span><span class="chip">i</span><span class="chip">n</span><span class="chip">g</span></div></td><td>6</td></tr></tbody></table></div>
<p><strong>Vocabulary:</strong> 7 + 1 = 8 symbols (ad added)</p>
<p>Counting adjacent pairs across the corpus: (r,e), (e,a) and (a,d) each occur 9 times; here a+d is merged first, breaking the tie alphabetically.</p>
</div>
<div class="panel panel-bpe3">
<div class="table-wrap"><table><caption>Step 2: merge e+ad (e + ad → ead)</caption><thead><tr><th>Word in corpus</th><th>Current split</th><th>tokens</th></tr></thead><tbody><tr><th scope="row">read ×4</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">ead</span></div></td><td>2</td></tr><tr><th scope="row">reader ×2</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">ead</span><span class="chip">e</span><span class="chip">r</span></div></td><td>4</td></tr><tr><th scope="row">reading ×3</th><td><div class="flow" style="margin:6px 0"><span class="chip">r</span><span class="chip">ead</span><span class="chip">i</span><span class="chip">n</span><span class="chip">g</span></div></td><td>5</td></tr></tbody></table></div>
<p><strong>Vocabulary:</strong> 8 + 1 = 9 symbols (ead added)</p>
<p>Now (e,ad) occurs 9 times, one of the most frequent adjacent pairs. read becomes r + ead.</p>
</div>
<div class="panel panel-bpe4">
<div class="table-wrap"><table><caption>Step 3: merge r+ead (r + ead → read)</caption><thead><tr><th>Word in corpus</th><th>Current split</th><th>tokens</th></tr></thead><tbody><tr><th scope="row">read ×4</th><td><div class="flow" style="margin:6px 0"><span class="chip">read</span></div></td><td>1</td></tr><tr><th scope="row">reader ×2</th><td><div class="flow" style="margin:6px 0"><span class="chip">read</span><span class="chip">e</span><span class="chip">r</span></div></td><td>3</td></tr><tr><th scope="row">reading ×3</th><td><div class="flow" style="margin:6px 0"><span class="chip">read</span><span class="chip">i</span><span class="chip">n</span><span class="chip">g</span></div></td><td>4</td></tr></tbody></table></div>
<p><strong>Vocabulary:</strong> 9 + 1 = 10 symbols (read added)</p>
<p>The frequent word read becomes one symbol; reader and reading keep reusable pieces, so they still share the read stem.</p>
</div>
<div class="note">Real BPE usually starts from bytes and counts adjacent pairs inside word boundaries; this letter-level demo omits those details to show the core mechanism: frequent adjacent pairs merge one at a time, the vocabulary grows and sequences shorten.</div>
<h3 id="part-8">How vocabulary size affects parameter count</h3>
<p>The input embedding table is <code>V × d_model</code>. With d_model = 4096:</p>
<div class="table-wrap"><table><thead><tr><th>Vocabulary V</th><th>Embedding parameters V × 4096</th><th>Intuition</th></tr></thead><tbody><tr><td>32,000</td><td>about 131 million</td><td>smaller vocabulary, longer sequences</td></tr><tr><td>50,257</td><td>about 206 million</td><td>a common English-heavy magnitude</td></tr><tr><td>200,000</td><td>about 819 million</td><td>large vocabulary; this single layer dominates</td></tr></tbody></table></div>
<p>A larger vocabulary has a side effect: each symbol appears fewer times in training, so vectors for rare symbols are hard to learn. Vocabulary size is a trade-off between efficiency, coverage and learning quality, not simply “bigger is better”. Total compute also depends on sequence length: the attention score matrix is n × n.</p>
<h3 id="part-9">What to watch for in multilingual work</h3>
<p>The lecture Q&amp;A notes that if a tokenizer is trained on a mixed multilingual corpus, the vocabulary is shared among languages. If you care about only one language, sequences can get longer; but cross-language shared symbols (such as common abbreviations) can also help. So for multilingual work, confirm that the tokenizer was actually trained on the languages you care about.</p>
<p class="source">Slide map: pages 24 and 27 cover vocabulary and sequence length; pages 28–31 cover special tokens. The BPE steps, parameter counts and size ranges are teaching additions, and the vocabulary magnitudes follow the lecture Q&amp;A.</p>
</section>
