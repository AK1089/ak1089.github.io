---
title: RYgamer's Note Block Studio Converter
date: 2026-04-10
address_bar_title: Note Block Script
---

This tool allows you to convert [Note Block Studio files](https://noteblock.studio/nbs) to Minr Script Code. Notes must be within Minecraft's limits, and use basic instruments (resource packs are not supported).

Ported to the web from RYgamer's original Python tool.

<link rel="stylesheet" href="style.css">

<div class="converter">
    <div class="nbs-dropzone" id="nbs-dropzone">
        <div class="drop-icon">🎵</div>
        <div class="drop-label">Drag & drop an <strong>.nbs</strong> file here</div>
        <div class="drop-hint">or click to browse</div>
        <input type="file" id="nbs-file-input" accept=".nbs" multiple>
    </div>

    <div class="mode-toggle">
        <button class="mode-btn active" data-mode="stereo">Stereo</button>
        <button class="mode-btn" data-mode="mono">Mono</button>
    </div>

    <div class="output" id="output"></div>
</div>

<script src="script.js"></script>
