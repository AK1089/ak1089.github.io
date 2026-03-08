import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ── Piece validators for N = 3 ──────────────────────────────── */

function sliding(sOk) {
    return (dx, dy, dz) => {
        const a = [Math.abs(dx), Math.abs(dy), Math.abs(dz)];
        const nz = a.filter((v) => v > 0);
        // All nonzero components equal ⇔ δ = kv with v ∈ {-1,0,+1}³
        return nz.length > 0 && nz.every((v) => v === nz[0]) && sOk(nz.length);
    };
}

const PIECES = {
    king: {
        name: "King",
        validate: (dx, dy, dz) =>
            Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) === 1,
    },
    knight: {
        name: "Knight",
        validate: (dx, dy, dz) => {
            const s = [Math.abs(dx), Math.abs(dy), Math.abs(dz)].sort(
                (a, b) => a - b,
            );
            return s[0] === 0 && s[1] === 1 && s[2] === 2;
        },
    },
    rook: { name: "Rook", validate: sliding((s) => s === 1) },
    "bishop-2": { name: "2-Bishop", validate: sliding((s) => s === 2) },
    "bishop-n": { name: "N-Bishop", validate: sliding((s) => s === 3) },
    "bishop-s": { name: "S-Bishop", validate: sliding((s) => s >= 2) },
    "queen-2": { name: "2-Queen", validate: sliding((s) => s <= 2) },
    "queen-n": { name: "N-Queen", validate: sliding((s) => s === 1 || s === 3) },
    "queen-s": { name: "S-Queen", validate: sliding(() => true) },
};

/* ── Colours (matching 2-D boards) ───────────────────────────── */

const C = {
    light: 0xf0d9b5,
    dark: 0xb58863,
    moveL: 0xc5e3de,
    moveD: 0x88b8b0,
    piece: 0x1a1a2e,
    edge: 0x8b7355,
};

/* ── Layout constants ────────────────────────────────────────── */

const GAP = 1.2; // vertical space between layers
const SZ = 1.0; // cell side length (cells touching)
const TH = 0.18; // cell thickness
const CANVAS_H = 350; // canvas height in px

/* ── 3-D Board ───────────────────────────────────────────────── */

class Board3D {
    constructor(container, keys) {
        this.el = container;
        this.n = parseInt(container.dataset.boardSize) || 8;
        this.totalSpaces = this.n ** 3;
        this.keys = keys;
        this.key = keys[0];
        this.pos = null;
        this.cells = new Map();
        this.lit = [];
        this.sphere = null;
        this.sphereGeo = new THREE.SphereGeometry(0.28, 24, 24);
        this.sphereMat = new THREE.MeshPhongMaterial({
            color: C.piece,
            shininess: 40,
            transparent: true,
            opacity: 1,
        });
        this.focusedLayer = null;
        this.edgeMats = [];
        this.scanTimer = null;
        this.scanIndex = 0;
        this.build();
    }

    get piece() {
        return PIECES[this.key];
    }

    /* ── DOM scaffold ────────────────────────────────────────── */

    build() {
        const wrap = document.createElement("div");
        wrap.className = "chess3d-wrap";

        // Shared controls
        const pair = this.el.closest(".chess-pair");
        const bar = document.createElement("div");
        bar.className = "chess3d-bar";
        const oneDContainer = pair?.querySelector("[data-chess1d]");

        if (this.keys.length > 1) {
            for (const k of this.keys) {
                const b = document.createElement("button");
                b.className = "chess3d-btn" + (k === this.key ? " active" : "");
                b.textContent = PIECES[k].name;
                b.addEventListener("click", () => {
                    bar.querySelectorAll(".chess3d-btn").forEach((x) =>
                        x.classList.remove("active"),
                    );
                    b.classList.add("active");
                    this.key = k;
                    if (this.pos) this.highlight();
                    this.syncCompanionBoards(k);
                });
                bar.appendChild(b);
            }
        }

        this.playBtn = document.createElement("button");
        this.playBtn.className = "chess3d-btn chess3d-btn--play chess1d-play-btn";
        this.playBtn.type = "button";
        this.playBtn.textContent = "Play";
        this.playBtn.addEventListener("click", () => this.toggleScan());

        if (oneDContainer) {
            oneDContainer.appendChild(this.playBtn);
        } else {
            bar.appendChild(this.playBtn);
        }

        if (this.keys.length > 1) {
            if (pair) {
                pair.prepend(bar);
            } else {
                wrap.appendChild(bar);
            }
        }

        this.cv = Object.assign(document.createElement("div"), {
            className: "chess3d-cv",
        });
        this.cap = Object.assign(document.createElement("p"), {
            className: "chess3d-cap",
        });
        wrap.append(this.cv, this.cap);
        this.el.appendChild(wrap);

        this.initGL();
        this.buildLayerPicker();
        this.layBoard();
        this.listen();
        this.run();

        // Place piece at centre
        const m = (this.n - 1) >> 1;
        this.place(m, m, m);
        this.bindCompanionInteractions();

        // Sync 2D board name with initial variant
        if (this.keys.length > 1) this.syncCompanionBoards(this.key);
    }

    syncCompanionBoards(key) {
        const name = PIECES[key].name;
        const pair = this.el.closest(".chess-pair");
        if (!pair) return;

        const board1D = pair.querySelector("[data-chess1d]")?._chess1d;
        const piece1D = window.CHESS_PIECES_1D?.[key];
        if (board1D && piece1D) board1D.setPiece(piece1D);

        const board = pair.querySelector("[data-chess2d]")?._chess2d;
        if (!board?.piecePos) return;
        board.piece = { ...board.piece, name };
        const { row, col } = board.piecePos;
        board.piecePos = null;
        board.handleClick(row, col);
    }

    syncCompanionPosition(x, y, z) {
        const pair = this.el.closest(".chess-pair");
        if (!pair) return;

        const board1D = pair.querySelector("[data-chess1d]")?._chess1d;
        if (board1D && board1D.piecePos !== x) board1D.handleClick(x, { silent: true });

        const board2D = pair.querySelector("[data-chess2d]")?._chess2d;
        if (
            board2D &&
            (!board2D.piecePos ||
                board2D.piecePos.row !== y ||
                board2D.piecePos.col !== x)
        ) {
            board2D.handleClick(y, x, { silent: true });
        }
    }

    bindCompanionInteractions() {
        const pair = this.el.closest(".chess-pair");
        if (!pair) return;
        const board1D = pair.querySelector("[data-chess1d]")?._chess1d;
        const board2D = pair.querySelector("[data-chess2d]")?._chess2d;
        if (board1D) {
            board1D.onMove = ({ x }) => {
                if (!this.pos) return;
                this.place(x, this.pos.y, this.pos.z);
            };
        }
        if (board2D) {
            board2D.onMove = ({ row, col }) => {
                if (!this.pos) return;
                // 2D is (slow, medium) = (x, y); preserve fast axis (z).
                this.place(col, row, this.pos.z);
            };
        }
    }

    indexToPosition(i) {
        const n2 = this.n * this.n;
        const x = Math.floor(i / n2);
        const y = Math.floor((i % n2) / this.n);
        const z = i % this.n;
        return { x, y, z };
    }

    toggleScan() {
        if (this.scanTimer) {
            this.stopScan();
            return;
        }

        if (this.scanIndex >= this.totalSpaces) this.scanIndex = 0;
        this.scanStep();
        if (this.scanIndex >= this.totalSpaces) return;

        this.scanTimer = setInterval(() => this.scanStep(), 90);
        this.playBtn.classList.add("playing");
        this.playBtn.textContent = "Pause";
    }

    stopScan() {
        if (this.scanTimer) {
            clearInterval(this.scanTimer);
            this.scanTimer = null;
        }
        this.playBtn.classList.remove("playing");
        this.playBtn.textContent = this.scanIndex >= this.totalSpaces ? "Replay" : "Play";
    }

    scanStep() {
        if (this.scanIndex >= this.totalSpaces) {
            this.stopScan();
            return;
        }
        const { x, y, z } = this.indexToPosition(this.scanIndex);
        this.place(x, y, z);
        this.scanIndex++;
        if (this.scanIndex >= this.totalSpaces) this.stopScan();
    }

    /* ── Three.js setup ──────────────────────────────────────── */

    initGL() {
        const w = this.cv.clientWidth || 500;
        const mid = (this.n - 1) / 2;
        const midY = mid * GAP;

        this.scene = new THREE.Scene();
        this.cam = new THREE.PerspectiveCamera(40, w / CANVAS_H, 0.1, 200);
        this.cam.position.set(
            mid + this.n * 1.5,
            midY + this.n * 1.1,
            mid + this.n * 1.5,
        );

        this.ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.ren.setSize(w, CANVAS_H);
        this.ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.cv.appendChild(this.ren.domElement);

        this.orb = new OrbitControls(this.cam, this.ren.domElement);
        this.orb.target.set(mid, midY, mid);
        this.orb.enableDamping = true;
        this.orb.dampingFactor = 0.1;
        this.orb.enablePan = false;
        this.orb.minDistance = 3;
        this.orb.maxDistance = this.n * 5;
        this.orb.update();

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.75));
        const dl = new THREE.DirectionalLight(0xffffff, 0.45);
        dl.position.set(8, 12, 8);
        this.scene.add(dl);

        // Pause rendering when off-screen
        this.vis = true;
        new IntersectionObserver(
            ([e]) => {
                this.vis = e.isIntersecting;
            },
            { threshold: 0 },
        ).observe(this.cv);

        // Responsive resize
        new ResizeObserver(() => {
            const nw = this.cv.clientWidth;
            if (!nw) return;
            this.cam.aspect = nw / CANVAS_H;
            this.cam.updateProjectionMatrix();
            this.ren.setSize(nw, CANVAS_H);
        }).observe(this.cv);
    }

    /* ── Layer picker ─────────────────────────────────────────── */

    buildLayerPicker() {
        const el = document.createElement("div");
        el.className = "chess3d-layers";
        this.layerBars = [];
        this.selectedLayer = null;
        this.selectedAccessible = false;
        this.hoveringAccessible = false;
        this.accessibleControl = document.createElement("div");
        this.accessibleControl.className =
            "chess3d-layer-bar chess3d-layer-bar--moves";
        this.accessibleControl.title = "Focus accessible squares";
        this.accessibleControl.addEventListener("mouseenter", () => {
            this.hoveringAccessible = true;
            if (!this.hasSelection()) this.focusAccessible();
        });
        this.accessibleControl.addEventListener("mouseleave", () => {
            this.hoveringAccessible = false;
            if (!this.hasSelection()) this.unfocusLayer();
        });
        this.accessibleControl.addEventListener("click", () =>
            this.toggleAccessibleSelection(),
        );
        el.appendChild(this.accessibleControl);
        for (let y = this.n - 1; y >= 0; y--) {
            const bar = document.createElement("div");
            bar.className = "chess3d-layer-bar";
            bar.addEventListener("mouseenter", () => {
                if (!this.hasSelection()) this.focusLayer(y);
            });
            bar.addEventListener("click", () => this.toggleLayerSelection(y));
            el.appendChild(bar);
            this.layerBars[y] = bar;
        }
        // Piece indicator triangle
        this.layerIndicator = document.createElement("div");
        this.layerIndicator.className = "chess3d-layer-indicator";
        el.appendChild(this.layerIndicator);
        el.addEventListener("mouseleave", () => {
            if (!this.hasSelection()) this.unfocusLayer();
        });
        this.cv.appendChild(el);
    }

    hasSelection() {
        return this.selectedLayer !== null || this.selectedAccessible;
    }

    toggleLayerSelection(y) {
        if (this.selectedAccessible) {
            this.selectedAccessible = false;
            this.accessibleControl?.classList.remove("active");
        }
        if (this.selectedLayer === y) {
            this.selectedLayer = null;
            this.layerBars[y]?.classList.remove("active");
            this.unfocusLayer();
            return;
        }

        if (this.selectedLayer !== null) {
            this.layerBars[this.selectedLayer]?.classList.remove("active");
        }
        this.selectedLayer = y;
        this.layerBars[y]?.classList.add("active");
        this.focusLayer(y);
    }

    toggleAccessibleSelection() {
        if (this.selectedAccessible) {
            this.selectedAccessible = false;
            this.accessibleControl?.classList.remove("active");
            this.unfocusLayer();
            return;
        }

        if (this.selectedLayer !== null) {
            this.layerBars[this.selectedLayer]?.classList.remove("active");
            this.selectedLayer = null;
        }
        this.selectedAccessible = true;
        this.accessibleControl?.classList.add("active");
        this.focusAccessible();
    }

    updateIndicator() {
        if (!this.pos || !this.layerIndicator) return;
        const bar = this.layerBars[this.pos.y];
        if (!bar) return;
        const parent = bar.parentElement;
        const barRect = bar.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        this.layerIndicator.style.top =
            barRect.top - parentRect.top + barRect.height / 2 + "px";
    }

    focusLayer(y) {
        this.focusedLayer = y;
        for (const [k, c] of this.cells) {
            const onLayer = c.mesh.userData.y === y;
            const isLit = this.lit.includes(k);
            c.mesh.material.opacity = onLayer ? (isLit ? 0.92 : 0.82) : 0.08;
        }
        for (let ly = 0; ly < this.n; ly++)
            this.edgeMats[ly].opacity = ly === y ? 0.35 : 0.03;
        if (this.sphere)
            this.sphereMat.opacity = this.pos.y === y ? 1.0 : 0.08;
    }

    unfocusLayer() {
        this.focusedLayer = null;
        for (const [k, c] of this.cells) {
            const isLit = this.lit.includes(k);
            c.mesh.material.opacity = isLit ? 0.92 : 0.82;
        }
        for (const m of this.edgeMats) m.opacity = 0.35;
        if (this.sphere) this.sphereMat.opacity = 1.0;
    }

    focusAccessible() {
        if (!this.pos) return;
        const pieceKey = `${this.pos.x},${this.pos.y},${this.pos.z}`;
        for (const [k, c] of this.cells) {
            const isAccessible = this.lit.includes(k) || k === pieceKey;
            c.mesh.material.opacity = isAccessible ? 0.9 : 0.08;
        }
        for (const m of this.edgeMats) m.opacity = 0.08;
        if (this.sphere) this.sphereMat.opacity = 1.0;
    }

    /* ── Board geometry ──────────────────────────────────────── */

    layBoard() {
        const geo = new THREE.BoxGeometry(SZ, TH, SZ);
        const edgeGeo = new THREE.EdgesGeometry(geo);
        this.edgeMats = Array.from({ length: this.n }, () =>
            new THREE.LineBasicMaterial({
                color: C.edge,
                transparent: true,
                opacity: 0.35,
            }),
        );

        for (let y = 0; y < this.n; y++)
            for (let x = 0; x < this.n; x++)
                for (let z = 0; z < this.n; z++) {
                    const light = (x + y + z) % 2 === 0;
                    const base = light ? C.light : C.dark;
                    const mat = new THREE.MeshLambertMaterial({
                        color: base,
                        transparent: true,
                        opacity: 0.82,
                    });
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.set(x, y * GAP, z);
                    mesh.userData = { x, y, z };
                    this.scene.add(mesh);
                    this.cells.set(`${x},${y},${z}`, { mesh, base, light });

                    // Wireframe edges on each cell (material shared per layer)
                    const edges = new THREE.LineSegments(
                        edgeGeo,
                        this.edgeMats[y],
                    );
                    edges.position.set(x, y * GAP, z);
                    this.scene.add(edges);
                }

    }

    /* ── Interaction ─────────────────────────────────────────── */

    listen() {
        this.ray = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.downAt = null;
        const meshes = [...this.cells.values()].map((c) => c.mesh);
        const activeLayerHit = (hits) =>
            hits.find(
                (h) =>
                    this.selectedLayer === null ||
                    h.object.userData.y === this.selectedLayer,
            );

        this.ren.domElement.addEventListener("pointerdown", (e) => {
            this.downAt = { x: e.clientX, y: e.clientY };
        });

        this.ren.domElement.addEventListener("click", (e) => {
            // Suppress click if the pointer moved (i.e. this was a drag)
            if (this.downAt) {
                const dx = e.clientX - this.downAt.x;
                const dy = e.clientY - this.downAt.y;
                if (dx * dx + dy * dy > 9) return;
            }
            this.setMouse(e);
            this.ray.setFromCamera(this.mouse, this.cam);
            const hits = this.ray.intersectObjects(meshes);
            const hit = activeLayerHit(hits);
            if (hit) {
                const { x, y, z } = hit.object.userData;
                this.place(x, y, z);
            }
        });

        this.ren.domElement.addEventListener("pointermove", (e) => {
            this.setMouse(e);
            this.ray.setFromCamera(this.mouse, this.cam);
            const hits = this.ray.intersectObjects(meshes);
            const hit = activeLayerHit(hits);
            this.ren.domElement.style.cursor = hit ? "pointer" : "grab";
        });
    }

    setMouse(e) {
        const r = this.ren.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        this.mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    }

    /* ── Piece placement & move highlighting ─────────────────── */

    place(x, y, z) {
        if (this.pos?.x === x && this.pos?.y === y && this.pos?.z === z) return;
        this.pos = { x, y, z };

        if (this.sphere) this.scene.remove(this.sphere);
        this.sphere = new THREE.Mesh(this.sphereGeo, this.sphereMat);
        this.sphere.position.set(x, y * GAP + TH / 2 + 0.28, z);
        this.scene.add(this.sphere);

        this.highlight();
        this.updateIndicator();
        this.syncCompanionPosition(x, y, z);
    }

    highlight() {
        // Normalize base appearance before applying fresh move highlights.
        for (const c of this.cells.values()) {
            c.mesh.material.color.setHex(c.base);
            c.mesh.material.opacity = 0.82;
        }
        this.lit = [];

        const { x: px, y: py, z: pz } = this.pos;
        let count = 0;

        for (let y = 0; y < this.n; y++)
            for (let x = 0; x < this.n; x++)
                for (let z = 0; z < this.n; z++) {
                    if (x === px && y === py && z === pz) continue;
                    if (!this.piece.validate(x - px, y - py, z - pz)) continue;
                    const k = `${x},${y},${z}`;
                    const c = this.cells.get(k);
                    c.mesh.material.color.setHex(c.light ? C.moveL : C.moveD);
                    c.mesh.material.opacity = 0.92;
                    this.lit.push(k);
                    count++;
                }

        this.cap.textContent =
            count + " move" + (count !== 1 ? "s" : "") + " available from this space.";

        // Re-apply layer isolation if active
        if (this.focusedLayer !== null) this.focusLayer(this.focusedLayer);
        if (this.selectedAccessible || this.hoveringAccessible) this.focusAccessible();
    }

    /* ── Render loop ─────────────────────────────────────────── */

    run() {
        requestAnimationFrame(() => this.run());
        if (!this.vis) return;
        this.orb.update();
        this.ren.render(this.scene, this.cam);
    }
}

/* ── Auto-init ───────────────────────────────────────────────── */

const VARIANTS = {
    bishop: ["bishop-2", "bishop-n", "bishop-s"],
    queen: ["queen-2", "queen-n", "queen-s"],
};

document.addEventListener("DOMContentLoaded", () => {
    for (const el of document.querySelectorAll("[data-chess3d]")) {
        const v = el.dataset.chess3d;
        const keys = VARIANTS[v] || (PIECES[v] ? [v] : null);
        if (keys) new Board3D(el, keys);
    }
});
