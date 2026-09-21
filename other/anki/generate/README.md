# Anki gallery previews

Generates front/back WebP screenshots and `../previews.json` from a local
checkout of [anki-decks](https://github.com/AK1089/anki-decks). The checkout
must include its Git LFS media (`git lfs pull` in that repository).

Run these commands from this directory:

```sh
npm install
npx playwright install chromium
npm run generate -- /path/to/anki-decks
```

Add a deck to `samples.json`, choosing a field and value that identify a sample
note. The generator captures every card type belonging to that note's model.
Add the deck's gallery entry and copy to `../index.md` separately.

The screenshots use the original HTML, CSS, scripts, and media, with Mustache
field substitution. This is a browser preview, not a complete Anki runtime:
Anki-specific filters or APIs may need additional support in future templates.

Generated images and the manifest are saved directly in the page directory.
Existing images are not deleted. Rebuild `index.md` with the site's normal
builder after editing the page; regenerating screenshots alone needs no build.
