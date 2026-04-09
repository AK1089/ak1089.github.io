// ============================================================================
// NBS -> MSC converter (browser port of original.py)
// ============================================================================

const CHUNK_SIZE = 1000;

const INSTRUMENT_NAMES = [
    "harp", "bass", "basedrum", "snare", "hat", "guitar", "flute", "bell",
    "chime", "xylophone", "iron_xylophone", "cow_bell", "didgeridoo",
    "bit", "banjo", "pling",
];

// ---------------------------------------------------------------------------
// NBS binary parser
// ---------------------------------------------------------------------------

function readNbs(buffer) {
    const view = new DataView(buffer);
    let offset = 0;

    const readShort  = () => { const v = view.getInt16(offset, true);  offset += 2; return v; };
    const readInt    = () => { const v = view.getInt32(offset, true);  offset += 4; return v; };
    const readByte   = () => { const v = view.getUint8(offset);        offset += 1; return v; };
    const readSByte  = () => { const v = view.getInt8(offset);         offset += 1; return v; };
    const readString = () => { const len = readInt(); offset += len; return new TextDecoder().decode(new Uint8Array(buffer, offset - len, len)); };

    // Header
    const firstShort = readShort();
    let nbsVersion = 0;

    if (firstShort === 0) {
        nbsVersion = readByte();
        readByte(); // vanilla instrument count
        readShort(); // song length
    }

    readShort(); // layer count
    readString(); // song name
    readString(); // author
    readString(); // original author
    readString(); // description
    const tempo = readShort(); // tempo * 100
    readByte(); readByte(); readByte(); // auto-save settings, time sig
    readInt(); readInt(); readInt(); readInt(); readInt(); // stats
    readString(); // import name

    if (nbsVersion >= 4) {
        readByte(); readByte(); readShort(); // loop settings
    }

    // Note blocks
    const notes = [];
    let currentTick = -1;

    while (true) {
        const tickJump = readShort();
        if (tickJump === 0) break;
        currentTick += tickJump;

        let currentLayer = -1;
        while (true) {
            const layerJump = readShort();
            if (layerJump === 0) break;
            currentLayer += layerJump;

            const instrument = readByte();
            const key = readByte();
            let velocity = 100, panning = 100;

            if (nbsVersion >= 4) {
                velocity = readByte();
                panning = readByte();
                readSByte(); readByte(); // fine pitch (unused)
            }

            notes.push({ tick: currentTick, instrument, key, velocity, panning });
        }
    }

    const lastTick = notes.length > 0 ? notes[notes.length - 1].tick : 0;
    const tps = tempo / 100;
    const durationSecs = tps > 0 ? lastTick / tps : 0;

    return { notes, durationSecs };
}

// ---------------------------------------------------------------------------
// Build entries (mirrors original.py)
// ---------------------------------------------------------------------------

function buildEntries(notes, panningEnabled) {
    const tickMap = new Map();
    for (const note of notes) {
        if (!tickMap.has(note.tick)) tickMap.set(note.tick, []);
        tickMap.get(note.tick).push(note);
    }
    const ticks = [...tickMap.keys()].sort((a, b) => a - b);

    const entries = [];
    let noteCount = 0, restCount = 0, previousTick = null;

    for (const tick of ticks) {
        if (previousTick !== null) {
            const gap = tick - previousTick;
            if (gap > 0) { entries.push([gap, 0.0, 0.0, 0.0]); restCount++; }
        }
        for (const note of tickMap.get(tick)) {
            if (note.velocity === 0) continue;
            const instrument = (note.instrument >= 0 && note.instrument < INSTRUMENT_NAMES.length) ? note.instrument : 0;
            const volume = note.velocity / 100.0;
            const pitch = Math.pow(2, (note.key - 33 - 12) / 12);
            const panning = panningEnabled ? (note.panning / 100.0) * 2.0 : 0.0;
            entries.push([instrument, volume, pitch, panning]);
            noteCount++;
        }
        previousTick = tick;
    }

    return { entries, noteCount, restCount };
}

// ---------------------------------------------------------------------------
// MSC generation
// ---------------------------------------------------------------------------

function fmtNum(v) {
    let s = v.toFixed(3).replace(/0+$/, "");
    if (s.endsWith(".")) s += "0";
    if (!s || s === "-" || s === ".0" || s === "-.0") s = "0.0";
    return s;
}

function generateMsc(entries, panningEnabled) {
    const L = [];
    L.push("@using Harha", "@fast", "");

    const instrLookup = INSTRUMENT_NAMES.map(n => `"${n}"`).join(",");
    L.push(`@define String[] instrumentNames = String[${instrLookup}]`, "");

    let chunkCount = 0;
    for (let start = 0; start < entries.length; start += CHUNK_SIZE) {
        chunkCount++;
        const chunk = entries.slice(start, start + CHUNK_SIZE);
        const idx = chunkCount;
        const n = chunk.length;

        L.push(`# === Chunk ${idx} (${n} entries) ===`);
        L.push(`@define Int[] instrument${idx} = Int[${chunk.map(e => e[0]).join(",")}]`);
        L.push(`@define Float[] volume${idx} = Float[${chunk.map(e => fmtNum(e[1]) + "F").join(",")}]`);
        L.push(`@define Double[] pitch${idx} = Double[${chunk.map(e => fmtNum(e[2]) + "D").join(",")}]`);
        L.push(`@define Double[] panning${idx} = Double[${chunk.map(e => fmtNum(e[3]) + "D").join(",")}]`);
        L.push("");
        L.push(`@for Int i in list::range(0, ${n})`);
        L.push(`    @if volume${idx}[i] == 0.0F`);
        L.push(`        @var Harha::delay(instrument${idx}[i])`);
        L.push(`    @else`);
        L.push(`        @if panning${idx}[i] == 0.0D`);
        L.push(
            `            @bypass /execute as {{player}} at @s run playsound block.note_block.{{instrumentNames[instrument${idx}[i]]}}`
            + ` master @p ~ ~ ~ {{volume${idx}[i]}} {{pitch${idx}[i]}}`
        );
        L.push(`        @else`);
        L.push(
            `            @bypass /execute as {{player}} at @s run playsound block.note_block.{{instrumentNames[instrument${idx}[i]]}}`
            + ` master @p`
            + ` ~{{ panning${idx}[i] * math::cos(Double(player.getYaw() + 180)) }}`
            + ` ~`
            + ` ~{{ panning${idx}[i] * math::sin(Double(player.getYaw() + 180)) }}`
            + ` {{volume${idx}[i]}} {{pitch${idx}[i]}}`
        );
        L.push(`        @fi`);
        L.push(`    @fi`);
        L.push("@done");
        L.push("");
    }

    return { text: L.join("\n"), chunkCount };
}

// ---------------------------------------------------------------------------
// Convert & produce download
// ---------------------------------------------------------------------------

const loadedFiles = [];

function convertAll() {
    const outputEl = document.getElementById("output");
    outputEl.innerHTML = "";
    for (const file of loadedFiles) {
        const placeholder = document.createElement("div");
        outputEl.appendChild(placeholder);
        convert(file, placeholder);
    }
}

function convert(file, placeholder) {
    const panningEnabled = document.querySelector(".mode-btn.active").dataset.mode === "stereo";

    file.arrayBuffer().then(buffer => {
        const { notes, durationSecs } = readNbs(buffer);
        const { entries, noteCount, restCount } = buildEntries(notes, panningEnabled);
        const { text, chunkCount } = generateMsc(entries, panningEnabled);

        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const outName = file.name.replace(/\.nbs$/, ".msc");
        const sizeKB = (blob.size / 1024).toFixed(1);

        const mins = Math.floor(durationSecs / 60);
        const secs = Math.round(durationSecs % 60);
        const duration = `${mins}:${String(secs).padStart(2, "0")}`;
        const mode = panningEnabled ? "Stereo" : "Mono";

        const pl = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

        placeholder.className = "output-card";
        placeholder.innerHTML =
            `<div class="output-info">`
            + `<div class="output-filename">${outName}</div>`
            + `<div class="output-stats">${duration} &bull; ${pl(noteCount, "note")}, ${pl(restCount, "rest")}, ${pl(chunkCount, "chunk")} &bull; ${sizeKB} KB &bull; ${mode}</div>`
            + `</div>`
            + `<a class="download-btn" href="${url}" download="${outName}" title="Download"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M8 17.5H6a4 4 0 0 1-.85-7.91A5.5 5.5 0 0 1 16.5 6 5 5 0 0 1 20 15.5h-2"/><path d="M12 12v7"/><path d="m15 17-3 3-3-3"/></svg></a>`;
    }).catch(err => {
        placeholder.className = "output-error";
        placeholder.textContent = `Failed to convert ${file.name}: ${err.message}`;
    });
}

// ---------------------------------------------------------------------------
// UI wiring
// ---------------------------------------------------------------------------

document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".mode-btn.active").classList.remove("active");
        btn.classList.add("active");
        if (loadedFiles.length > 0) convertAll();
    });
});

const dropzone  = document.getElementById("nbs-dropzone");
const fileInput = document.getElementById("nbs-file-input");

dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.classList.add("drag-over"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));

dropzone.addEventListener("drop", e => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener("change", () => handleFiles(fileInput.files));

function handleFiles(fileList) {
    const files = [...fileList].filter(f => f.name.endsWith(".nbs"));
    if (files.length === 0) return;
    dropzone.querySelector(".drop-hint").textContent = "drop more files to convert";
    const outputEl = document.getElementById("output");
    for (const file of files) {
        loadedFiles.push(file);
        const placeholder = document.createElement("div");
        outputEl.appendChild(placeholder);
        convert(file, placeholder);
    }
}
