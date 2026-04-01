---
title: Coupon Collecting
date: 2026-04-01
address_bar_title: Coupon Collecting
---

The original [coupon collector's problem](https://en.wikipedia.org/wiki/Coupon_collector%27s_problem) poses the question:

```quote-question
If each cereal box contains a random coupon uniformly drawn from $`n`$ varieties, what is the probability that $`t`$ boxes must be bought in order to collect each coupon?
```

A subtly different question arises when considering the case that one does not know the total number of coupons. How many boxes must be bought before you know you have all of them?

Of course, you can never be absolutely certain. But say you buy one billion boxes, and get $`333{,}495{,}391`$ blue, $`333{,}284{,}381`$ red, and $`333{,}220{,}228`$ green coupons. I would be fairly confident that in fact there are three varieties of coupon! Here, you can test that intuition.

<link rel="stylesheet" href="styles.css">

<div class="cc-game">
  <div class="cc-stats">
    <div class="cc-stat">
      <div class="cc-stat-label">Samples drawn</div>
      <div class="cc-stat-val" id="cc-n-drawn">0</div>
    </div>
    <div class="cc-stat">
      <div class="cc-stat-label">Distinct colours</div>
      <div class="cc-stat-val" id="cc-k-seen">0</div>
    </div>
    <div class="cc-stat">
      <div class="cc-stat-label">Since last new</div>
      <div class="cc-stat-val" id="cc-since-new">&mdash;</div>
    </div>
  </div>
  <div class="cc-section-label">Colour counts</div>
  <div class="cc-pills" id="cc-colour-counts"></div>
  <div class="cc-btns">
    <button class="cc-btn" id="cc-btn-draw1">Draw 1</button>
    <button class="cc-btn" id="cc-btn-draw10">Draw 10</button>
    <button class="cc-btn" id="cc-btn-draw100">Draw 100</button>
    <button class="cc-btn cc-btn-guess" id="cc-btn-guess">I think that's all</button>
    <button class="cc-btn" id="cc-btn-replay" style="display:none">Play again</button>
  </div>
  <div id="cc-result-msg"></div>
</div>

<div id="cc-history-wrap" style="display:none">
<h2>Your history</h2>
<div id="cc-stats-summary" class="cc-stats-summary"></div>
<div class="cc-scatter-wrap">
  <div class="cc-axis-label-y">Boxes opened</div>
  <div id="cc-scatter" class="cc-scatter"></div>
</div>
<div class="cc-axis-label-x">Number of colours</div>
<div class="cc-legend">
  <span class="cc-legend-item"><span class="cc-legend-dot cc-dot-win"></span> Correct</span>
  <span class="cc-legend-item"><span class="cc-legend-dot cc-dot-lose"></span> Wrong</span>
</div>
<button class="cc-btn cc-btn-clear" id="cc-btn-export">Export CSV</button>
<button class="cc-btn cc-btn-clear" id="cc-btn-clear">Clear history</button>
</div>

<script src="script.js" defer></script>

