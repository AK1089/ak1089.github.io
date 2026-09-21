# Working on This Site

Avish Kumar's personal website, served as static files from this repository.
It uses vanilla HTML, CSS, and JavaScript with a custom Python Markdown builder.
Keep changes small and follow neighbouring pages. Do not introduce a framework,
run unrelated formatting, or repeatedly check a simple change.

## Sources and Layout

- Page content normally lives in `<section>/<page>/index.md`. Edit the Markdown
  and build its sibling `index.html`; generated HTML is tracked and should be
  included with the source change.
- `manual_html: true` in frontmatter marks hand-maintained HTML. Edit that HTML
  directly when needed; the builder always skips it, including forced builds.
  Do not remove the flag to make a build work. `map/index.html` is one example.
- `assets/templates/base.html` supplies the shared page shell;
  `styles/base.css` supplies shared styling. Keep page-specific CSS, JavaScript,
  and media beside the page where practical.
- Use existing icons through `<svg><use href="/assets/icons/sprite.svg#name"></use></svg>`.
- `builder/extensions/` implements the custom Markdown syntax. Copy a nearby
  example before inventing new markup. Supported features include tables,
  `markdown="1"` in HTML blocks, KaTeX math, captioned images, `<download filename>`,
  `||spoilers||`, `quote-*` fences, and theorem/proof-style fences in
  `environments.py`. AVIF is common, but other image formats are also used.

## Build and Preview

Run commands from the repository root. Activate the existing virtualenv first:

```sh
source venv/bin/activate
python builder/build.py other/anki/index.md
```

The builder accepts multiple Markdown paths. Explicit paths force those pages
to rebuild regardless of timestamps, while still respecting `manual_html`.
Without arguments it scans for pages but skips HTML newer than its Markdown.
It does not track template or extension dependencies: after changing shared
generation code, rebuild the affected pages explicitly, or use
`python builder/build.py --force-all` when all generated pages are affected.
Review the resulting diff for unintended changes.

Page frontmatter uses unquoted YAML dates:

```yaml
---
title: Page Title
date: 2026-09-22
updated: 2026-09-23
address_bar_title: Custom Browser Title
---
```

`date` is required for generation; documents without it are skipped. Set a
meaningful `title` (the code otherwise falls back to the filename).
`updated` and `address_bar_title` are optional; the browser title defaults to
`title`. Root-level Markdown other than `index.md` is not built.

The builder needs Python's `markdown`, `PyYAML`, and `markdown-katex`, plus Node
and its `katex` package for math. There is no root dependency manifest; use the
existing `venv/` and `node_modules/` rather than assuming `npm install` at the
root is a complete setup.

- `./dev.sh` builds, watches, and serves with BrowserSync on port 8000. It also
  requires `watchdog` in the virtualenv and `npx`. Its shared-file watcher uses
  the timestamp-based build, so force affected pages yourself after template
  or extension edits.
- For a simple preview without watchers, use
  `python -m http.server 8000 --bind 127.0.0.1` from the root. Choose another
  port if occupied. Use HTTP, since assets and navigation use root-relative URLs.
- `./prettify.sh path/to/index.html` formats selected HTML with Prettier.
  Do not format the whole site for a local edit.

## Adding or Publishing a Page

1. Build the new page first, and add its link to the relevant parent `index.md`.
   Rebuild the parent too. A new directory does not add a navigation link.
2. Run `python map/generate.py`. It discovers existing `index.html` files and
   updates both `map/map.json` and the tree in `map/index.md`. Do not hand-add
   generated entries or tree lines.
3. Check the new map entry. The generator preserves existing metadata, so if
   needed adjust its generated `name`, `parent`, or `display` in `map/map.json`,
   then rerun the generator to sync the tree. Match sibling entries; `#section`
   parents are organisational branches, and `display: false` hides a node.
4. The interactive map reads the JSON directly. Its `manual_html: true` page
   does not need rebuilding for map-data changes.

For preview-only scaffolding, navigation and map updates can wait until requested.
Commit, push, or publish only within the user's requested scope.
