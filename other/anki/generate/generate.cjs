const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const Mustache = require('mustache');
const { chromium } = require('playwright');
const sharp = require('sharp');
const samples = require('./samples.json');

async function generate() {
    if (!process.argv[2]) {
        throw new Error('Usage: node generate.cjs /path/to/anki-decks');
    }
    const source = path.resolve(process.argv[2], 'decks');
    const output = path.resolve(__dirname, '../previews');
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'anki-previews-'));
    let browser;
    try {
        await fs.mkdir(output, { recursive: true });
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ deviceScaleFactor: 1 });
        const manifest = {};
        for (const [slug, sample] of Object.entries(samples)) {
            const dir = path.join(source, slug);
            const data = JSON.parse(await fs.readFile(path.join(dir, 'data.json'), 'utf8'));
            const note = data.notes.find(note => note.fields[sample.field] === sample.value);
            if (!note) throw new Error(`Missing sample for ${slug}: ${sample.field} = ${sample.value}`);
            const model = data.models.find(model => model.id === note.model_id);
            const css = await fs.readFile(path.join(dir, model.css), 'utf8');
            manifest[slug] = [];

            for (const [index, template] of model.tmpls.entries()) {
                await page.setViewportSize(slug === 'alphabet' || (slug === 'periodic-table' && index < 2)
                    ? { width: 600, height: 390 } : { width: 1200, height: 780 });
                const stem = `${slug}-${index + 1}`;
                manifest[slug].push({
                    name: slug === 'alphabet' && index === 0 ? 'Position to Letter' : template.name,
                    front: `previews/${stem}-front.webp`,
                    back: `previews/${stem}-back.webp`,
                });
                // Anki fields may contain HTML, so preserve their markup.
                const render = text => Mustache.render(text, note.fields, {}, { escape: value => value });
                const front = render(await fs.readFile(path.join(dir, template.qfmt), 'utf8'));
                for (const [side, file] of [['front', template.qfmt], ['back', template.afmt]]) {
                    const content = Mustache.render(await fs.readFile(path.join(dir, file), 'utf8'),
                        { ...note.fields, FrontSide: front }, {}, { escape: value => value });
                    const base = pathToFileURL(path.join(dir, 'assets') + path.sep).href;
                    const html = `<!doctype html><html><head><meta charset="utf-8"><base href="${base}"><style>${css}</style></head><body class="card"><div id="qa">${content}</div></body></html>`;
                    const htmlPath = path.join(temp, 'card.html');
                    await fs.writeFile(htmlPath, html);
                    await page.goto(pathToFileURL(htmlPath).href);
                    await page.evaluate(async () => {
                        await document.fonts.ready;
                        await Promise.all([...document.images].map(img => img.decode()));
                    });
                    const screenshot = await page.screenshot({ animations: 'disabled', fullPage: true });
                    await sharp(screenshot).resize({ width: 1200 }).webp({ quality: 88 })
                        .toFile(path.join(output, `${stem}-${side}.webp`));
                    console.log(`${stem} ${side}`);
                }
            }
        }
        await fs.writeFile(path.resolve(output, '../previews.json'), JSON.stringify(manifest, null, 2) + '\n');
    } finally {
        if (browser) await browser.close();
        await fs.rm(temp, { recursive: true, force: true });
    }
}

generate().catch(error => { console.error(error.message); process.exitCode = 1; });
