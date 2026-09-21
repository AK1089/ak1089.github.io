---
title: Pie Chart Totals
date: 2026-09-21
address_bar_title: Pie Chart Totals | AK1089's Site
---

Suppose a pie chart shows rounded whole-number percentages, but the slices came from integer counts. Which totals could have produced it?

A possible total $`N`$ is valid when every entered percentage could be $`\operatorname{round}(100k/N)`$ for some positive integer $`k`$.

<link rel="stylesheet" href="styles.css">

<div class="pct-tool">
  <form class="pct-entry" id="pct-entry">
    <label for="pct-input">Rounded percentage</label>
    <div class="pct-input-row">
      <div class="pct-input-wrap">
        <input id="pct-input" type="number" min="1" max="100" step="1" inputmode="numeric" placeholder="e.g. 12" aria-describedby="pct-error">
        <span aria-hidden="true">%</span>
      </div>
      <button type="submit" class="pct-button pct-button-primary">Add</button>
      <button type="button" class="pct-button" id="pct-clear">Clear</button>
    </div>
    <div class="pct-error" id="pct-error" role="alert"></div>
  </form>

  <div class="pct-label">Samples <span class="pct-hint">(click one to remove it)</span></div>
  <div class="pct-samples" id="pct-samples"></div>

  <div class="pct-result" aria-live="polite">
    <div class="pct-result-number" id="pct-result-number"></div>
    <div class="pct-result-copy" id="pct-result-copy"></div>
  </div>

  <div class="pct-grid-heading">
    <span>Totals below 100</span>
    <span class="pct-legend"><i></i> possible</span>
  </div>
  <div class="pct-grid" id="pct-grid" aria-label="Possible and ruled-out totals from 1 to 99"></div>
  <p class="pct-footnote">Every total of 100 or more is possible from these individual rounding observations alone.</p>
</div>

<script src="script.js" defer></script>
