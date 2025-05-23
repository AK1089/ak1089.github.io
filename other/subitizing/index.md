---
title: Subitizing Trainer
date: 2024-06-03
updated: 2025-05-23
---

<div id="game-area">
    <div id="session-controls">
        <label for="min-dots">Min Dots:</label>
        <input type="number" id="min-dots" min="1" max="99" value="1">
        <label for="max-dots">Max Dots:</label>
        <input type="number" id="max-dots" min="2" max="100" value="20">
        <label for="trial-count">Trials per number:</label>
        <input type="number" id="trial-count" min="1" max="10" value="3">
    </div>
    <div id="dot-container"></div>
</div>
<div id="buttons-area">
    <div id="message">Press Start to begin.</div>
    <button id="start-button">Start</button>
    <button id="stats-button">Show Stats</button>
    <button id="export-button">Export Statistics</button>
    <div id="progress-container">
        <div id="progress-bar"></div>
    </div>
</div>

## Background and Instructions

When you see 8–10 objects, you usually do not know how many there are without counting them. While you can use tricks to count them quickly, you are never as fast as when you see 2–4 objects and know the number exactly. This process of counting without counting was termed subitizing by Swiss child psychologist Jean Piaget, and is often trained for small numbers as a [classroom activity](https://earlymathcounts.org/subitize-this/).

I wanted to see if I could also get better at this with deliberate practice, including on bigger numbers (up to 20). I also thought it would be cool to be able to look at a group of objects, and immediately declare "16", while others are stuck counting them explicitly.

The game is simple: set the range of numbers with which you want to practice and the number of trials desired for each number, then click **Start**. The screen will repeatedly display some number of dots within your chosen range. You must intuit how many there are as quickly as possible.

__You only press the last digit of the number of dots.__ If you see 8 dots, you press 8. If you see 12 dots, you press 2. The game will be generous, and assume you mistook 18 dots for 17 (not 7).