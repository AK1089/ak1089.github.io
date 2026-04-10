# CLAUDE.md

This file provides guidance to coding agents when working with code in this repository.

## Project Overview

Personal portfolio website for Avish Kumar (ak1089.github.io). Fully custom-built with vanilla HTML, CSS, and JavaScript, no static site generator frameworks. Uses a Python-based Markdown build system with custom extensions.

## Build System Architecture

**VSCode**: Ctrl+Shift+B runs build on current file (configured in `.vscode/tasks.json`).

**Dependencies**: Python packages (`markdown`, `PyYAML`, `markdown-katex`) in `venv/`. Node package `prettier` for formatting.

The build pipeline (`builder/build.py`) works as follows:

1. Discovers `.md` files recursively (skips `node_modules/`, `venv/`)
2. Parses YAML frontmatter for metadata (title, date, updated, address_bar_title)
3. Converts Markdown to HTML using standard extensions plus custom ones
4. Injects content into `assets/templates/base.html` at placeholder comments

**Build skip logic**: HTML files newer than their MD source are skipped (allows manual HTML edits). Files with `manual_html: true` in frontmatter are always skipped.

### Custom Markdown Extensions (`builder/extensions/`)

| Extension | Syntax | Output |
|-----------|--------|--------|
| `code.py` | Fenced code blocks | Adds copy button, wraps lines in `<span>` |
| `image.py` | `![alt](src)` | `<figure>` with caption |
| `downloads.py` | `<download filename>` | Styled download link |
| `blockquote.py` | ` ```quote-info `, `quote-quote`, `quote-success`, `quote-warning` | Themed blockquotes with icons |
| `spoiler.py` | `\|\|hidden text\|\|` | `<span class="spoiler">` |

### Frontmatter Fields

```yaml
---
title: Page Title           # Required
date: 2024-01-15            # Required (YYYY-MM-DD)
updated: 2024-02-20         # Optional (YYYY-MM-DD)
address_bar_title: Custom   # Optional (defaults to title)
manual_html: true           # Optional (use if building would break)
---
```

## Directory Structure

- `assets/` - Fonts, icons (SVG spritesheet at `icons/sprite.svg`), images (AVIF format), base template
- `builder/` - Python build system and custom Markdown extensions
- `styles/` - CSS (`base.css` is the main stylesheet)
- `map/` - Interactive site map with `generate.py` for sitemap JSON and `tree.py` for visual tree
- Content directories (blog, puzzles, maths, projects, tech, etc.) - Each contains `index.md` → `index.html`

## Key Conventions

- **Edit `.md` files, not `.html`**: To modify page content, edit the source `.md` file. Never edit the generated `.html` directly (except for pages with `manual_html: true` in frontmatter).
- Icons are accessed via SVG spritesheet using `<use>` tag
- Use the generator and map building scripts to build. Do not add entries yourself.
- Activate the venv when running Python scripts.
