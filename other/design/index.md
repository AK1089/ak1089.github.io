---
title: This Website's Design
date: 2024-12-22
---

**All the code for this website is available [here](https://github.com/AK1089/ak1089.github.io).**

I first developed this website in April of 2024, with close to zero web-development experience. Having created around 40 pages from then until September before taking a break from new content, I became unhappy with the design of the site. The aesthetics seemed underdeveloped compared to the beauty of many other sites, while the "framework" I was using was sloppy and built on hacks. For example, I'd written a basic Markdown-like parser from scratch Python myself rather than using the existing one, which led to things like code comments being given a `<h1>` tag due to the `#` present.

In December, I decided to rewrite the website from scratch. The new version of the site has sidebars, a new colour scheme, faster load times, and my own icons. What it doesn't have it deliberate errors thrown to make development easier or broken and mismatched tags from botched automatic generation.

![The old version of my site, as it appeared shortly before this total redesign](old-site.avif)

I was heavily inspired by Alex Turner (TurnTrout)'s website [The Pond](https://turntrout.com/launch). Alex is an alignment researcher who has written extensively about power-seeking AI and impact measures, and I highly recommend checking out his work. He is also a fantastic web designer, and many of the choices he details in his [design post](https://turntrout.com/design) are echoed here. I am also a fan of [gwern.net](https://gwern.net/), run by writer and polymath Gwern Branwen.

## Typography

This site uses the font [EB Garamond](https://fonts.google.com/specimen/EB+Garamond), an open-source web font based on Claude Garamond's original design of the 1592 Egenolff–Berner specimen. The sans-serif typeface is <span style="font-family: var(--text-sans); font-size: 0.9rem;">Lucida Sans</span>, which is used for the header and various other components, while the monospace typeface is `Cascadia Code`, a pretty "nerd font" originally designed for Windows.

I use the *major third* scale for resizing other fonts, which scales each successive header by a factor of 1.25. Garamond typically sets smaller than other typefaces at the same nominal font size, which means other fonts are scaled to compensate.

## Colours

The primary palette used on this site is based on [Catppuccin Latte](https://catppuccin.com/palette). I prefer warmer tones on websites, so I changed the hue of the base background colours to have a yellower rather than bluer tint. I varied many of the other colours to clash less with my changes and to fit into specific aesthetic requirements, then added others to fill in the gaps (like a <span style="color: var(--lime)">lighter green</span>).

## Components and Icons

I've made several individual components for this website to display things I need frequently. For example, I write a lot of code, and it helps to be able to display this neatly in code blocks:

```python
# Let's do a code block!
def function(x: int):
    return x + 5
```

For hosting files on here, I like having pretty download links. `<​download example.pdf>` expands to:

<download example.pdf>

Here, this will be a blank download, but in general it will download the specified file.

I also started using SVG icons, built off a single spritesheet. These are all stored in a single place at `/assets/icons/sprite.svg`, and accessed when needed with the `<​use>` tag. This is extremely efficient thanks to modern browsers caching SVGs aggressively.

## Folder Structure

A lot of personal websites place each page at the root directory of the site, often with pithy identifiers. Paul Graham's website is a fantastic example of this: the link to almost every essay looks something like [www.paulgraham.com/best.html](https://www.paulgraham.com/best.html). While this style works for some, I'm not a huge fan of it myself: I prefer deep nested organisation. All the link paths on my website reflect the actual directory structure of [my repository](https://github.com/AK1089/ak1089.github.io), which I keep organised in the way I find most intuitive.

The folders on the left the only ones with content. The other directories in the repository are for development purposes. `assets` holds content which needs to be loaded from all across the site, like fonts and icons. `builder` stores my build scripts, including my custom Markdown extensions. Finally, `scripts` and `styles` hold all the basic JavaScript and CSS used hroughout the site.

![A graphical hierarchical view of the folder structure of this website](folder-viewer.avif)

(This view is from my `folder-graph-viewer` [repository](https://github.com/AK1089/folder-graph-viewer), which I absolutely love. It shows all of your files and subfiles dynamically, spread out with control over the display and which folders are active.)

## Build Process

While static site generators like [Quartz](https://quartz.jzhao.xyz/) and [Hugo](https://gohugo.io/) are cool, I find they add too much bloat to a project which I want to be simple. I prefer having full control over everything in my project, and thorough understanding of every single file in my repository (plus, it feels nice having created everything myself!)

The `builder` directory in my repository is the home of the Markdown parser. I use Python's `markdown` package, and traverse the project tree. Each Markdown file is built into an HTML file with the same name in the same location. To avoid overwriting manual edits, the traversal skips processing Markdown files which were last edited before their HTML counterparts. I use the `fenced_code`, `tables`, `nl2br`, `sane_lists`, and `smarty` plugins, as well as a few plugins I composed myself to deal with my custom HTML (like my own image syntax, for example).

The HTML generated by this build script is then injected into a template document, which holds the sidebars and inline scripts. This makes the sidebar content consistent across pages while still editable in one place.

To make development easier, I added a keyboard shortcut in VSCode that force-builds the currently focused Markdown file into HTML. This meant I don't have to run the site-wide build process every time I want to see my changes.

## Performance

I have tried to maximise performance on this site, which mainly comes in the form of minimising the number and size of files loaded. Additionally, I have tried to reduce the JavaScript immensely, especially considered to the original version of this site (which used massive amounts of JavaScript upon every page load). The only code which is regularly used is the `Copy to Clipboard` button in the top right of code blocks: this is added inline in the HTML template.

```demo
# Hover over me to see the copy button appear!
```

When a page is loaded, only the HTML, CSS, and icon sheet are loaded. The CSS triggers only the correct subset of fonts to be requested. Font and icon caching are usually extremely efficient on modern browsers, which means only two significant files are loaded. To minimise file sizes, I use AVIF files to store images, which are surprisingly well-compressed (typically a 90% space saving over PNG).

## Other

This site is still a work in progress, and there are many things which I want to edit. I'll update this page as I make more changes and improvements!