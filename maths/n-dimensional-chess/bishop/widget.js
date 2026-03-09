(function (global) {
    "use strict";

    const BOARD_SIDE = 8;
    const MIN_DIMENSIONS = 3;
    const MAX_DIMENSIONS = 100;
    const PATTERNS = [
        [4, 2, 1],
        [4, 1, 3],
        [1, 2, 4],
        [3, 1, 4],
    ];

    const moveCache = new Map();

    function clampDimension(value) {
        return Math.max(MIN_DIMENSIONS, Math.min(MAX_DIMENSIONS, value));
    }

    function pointKey(point) {
        return point.join(",");
    }

    function parseCoordinateText(text) {
        const normalized = text.replace(/[\[\](){}]/g, " ").trim();
        if (!normalized) {
            return { ok: false, reason: "Please enter some coordinates." };
        }

        const parts = normalized.split(/[\s,;|/]+/).filter(Boolean);
        if (parts.length === 0) {
            return { ok: false, reason: "Please enter some coordinates." };
        }

        const values = [];
        for (const part of parts) {
            if (!/^-?\d+$/.test(part)) {
                return {
                    ok: false,
                    reason: "Use only integers between 0 and 7, separated by commas or spaces.",
                };
            }

            const value = Number(part);
            if (value < 0 || value >= BOARD_SIDE) {
                return {
                    ok: false,
                    reason: "Every coordinate must lie between 0 and 7.",
                };
            }

            values.push(value);
        }

        if (values.length < MIN_DIMENSIONS) {
            return {
                ok: false,
                reason: "The theorem starts in dimension 3, so please give at least three coordinates.",
            };
        }

        if (values.length > MAX_DIMENSIONS) {
            return {
                ok: false,
                reason: `This widget supports up to ${MAX_DIMENSIONS} dimensions so the output stays readable.`,
            };
        }

        return { ok: true, values: values };
    }

    function formatVector(values, options = {}) {
        const showPlus = Boolean(options.showPlus);
        return `(${values
            .map((value) => (showPlus && value > 0 ? `+${value}` : `${value}`))
            .join(", ")})`;
    }

    function applyMoves(start, moves) {
        const positions = [start.slice()];
        const current = start.slice();

        for (const move of moves) {
            for (let axis = 0; axis < move.length; axis += 1) {
                current[axis] += move[axis];
            }
            positions.push(current.slice());
        }

        return positions;
    }

    function cappedCounts(counts, triple) {
        return counts.map((count, index) =>
            Math.min(2, count + (triple[index] !== 0 ? 1 : 0)),
        );
    }

    function coordinateOptions(start, end, pattern) {
        const [length1, length2, length3] = pattern;
        const options = [];

        for (const delta1 of [0, length1, -length1]) {
            const after1 = start + delta1;
            if (after1 < 0 || after1 >= BOARD_SIDE) {
                continue;
            }

            for (const delta2 of [0, length2, -length2]) {
                const after2 = after1 + delta2;
                if (after2 < 0 || after2 >= BOARD_SIDE) {
                    continue;
                }

                const delta3 = end - start - delta1 - delta2;
                if (delta3 !== 0 && Math.abs(delta3) !== length3) {
                    continue;
                }

                const after3 = after2 + delta3;
                if (after3 < 0 || after3 >= BOARD_SIDE) {
                    continue;
                }

                options.push([delta1, delta2, delta3]);
            }
        }

        return options;
    }

    function findPathForPattern(start, end, pattern) {
        if (start.length !== end.length || start.length < 4) {
            return null;
        }

        const optionsByAxis = start.map((value, axis) =>
            coordinateOptions(value, end[axis], pattern),
        );
        if (optionsByAxis.some((options) => options.length === 0)) {
            return null;
        }

        const order = Array.from(start.keys()).sort(
            (left, right) => optionsByAxis[left].length - optionsByAxis[right].length,
        );
        const memo = new Map();

        function search(offset, counts) {
            const key = `${offset}|${counts.join(",")}`;
            if (memo.has(key)) {
                return memo.get(key);
            }

            if (offset === order.length) {
                const done = counts.every((count) => count >= 2) ? [] : null;
                memo.set(key, done);
                return done;
            }

            const axis = order[offset];
            for (const choice of optionsByAxis[axis]) {
                const result = search(offset + 1, cappedCounts(counts, choice));
                if (result !== null) {
                    const solved = [{ axis: axis, choice: choice }].concat(result);
                    memo.set(key, solved);
                    return solved;
                }
            }

            memo.set(key, null);
            return null;
        }

        const choices = search(0, [0, 0, 0]);
        if (choices === null) {
            return null;
        }

        const byAxis = Array.from({ length: start.length }, function () {
            return [0, 0, 0];
        });
        for (const item of choices) {
            byAxis[item.axis] = item.choice;
        }

        return [0, 1, 2].map((moveIndex) =>
            byAxis.map((choice) => choice[moveIndex]),
        );
    }

    function findHighDimensionalPath(start, end) {
        for (const pattern of PATTERNS) {
            const moves = findPathForPattern(start, end, pattern);
            if (moves !== null) {
                return { pattern: pattern, moves: moves };
            }
        }

        return null;
    }

    function combinations(size, count) {
        const results = [];

        function build(nextStart, current) {
            if (current.length === count) {
                results.push(current.slice());
                return;
            }

            for (let index = nextStart; index < size; index += 1) {
                current.push(index);
                build(index + 1, current);
                current.pop();
            }
        }

        build(0, []);
        return results;
    }

    function productOfSignChoices(signChoices) {
        const results = [];

        function build(offset, current) {
            if (offset === signChoices.length) {
                results.push(current.slice());
                return;
            }

            for (const sign of signChoices[offset]) {
                current.push(sign);
                build(offset + 1, current);
                current.pop();
            }
        }

        build(0, []);
        return results;
    }

    function legalSBishopMoves(position) {
        const key = pointKey(position);
        if (moveCache.has(key)) {
            return moveCache.get(key);
        }

        const destinations = new Map();
        for (let length = 1; length < BOARD_SIDE; length += 1) {
            for (let activeAxes = 2; activeAxes <= position.length; activeAxes += 1) {
                for (const axes of combinations(position.length, activeAxes)) {
                    const signsByAxis = [];
                    let legal = true;

                    for (const axis of axes) {
                        const signs = [];
                        if (position[axis] + length < BOARD_SIDE) {
                            signs.push(1);
                        }
                        if (position[axis] - length >= 0) {
                            signs.push(-1);
                        }
                        if (signs.length === 0) {
                            legal = false;
                            break;
                        }
                        signsByAxis.push(signs);
                    }

                    if (!legal) {
                        continue;
                    }

                    for (const signs of productOfSignChoices(signsByAxis)) {
                        const next = position.slice();
                        for (let index = 0; index < axes.length; index += 1) {
                            next[axes[index]] += signs[index] * length;
                        }
                        destinations.set(pointKey(next), next);
                    }
                }
            }
        }

        const moves = Array.from(destinations.values());
        moveCache.set(key, moves);
        return moves;
    }

    function shortestPath3D(start, end) {
        const targetKey = pointKey(end);
        if (pointKey(start) === targetKey) {
            return [];
        }

        const queue = [start.slice()];
        const parents = new Map([[pointKey(start), null]]);
        let index = 0;

        while (index < queue.length) {
            const current = queue[index];
            index += 1;

            if (pointKey(current) === targetKey) {
                break;
            }

            for (const next of legalSBishopMoves(current)) {
                const nextKey = pointKey(next);
                if (parents.has(nextKey)) {
                    continue;
                }
                parents.set(nextKey, current);
                queue.push(next);
            }
        }

        if (!parents.has(targetKey)) {
            return null;
        }

        const positions = [end.slice()];
        let cursor = end.slice();

        while (parents.get(pointKey(cursor)) !== null) {
            cursor = parents.get(pointKey(cursor)).slice();
            positions.push(cursor);
        }

        positions.reverse();
        return positions.slice(1).map((position, offset) =>
            position.map((value, axis) => value - positions[offset][axis]),
        );
    }

    function solvePath(start, end) {
        if (start.length !== end.length) {
            return { ok: false, reason: "Start and end squares must have the same dimension." };
        }

        if (start.length === 3) {
            const moves = shortestPath3D(start, end);
            if (moves === null) {
                return { ok: false, reason: "No 3D path found." };
            }
            return {
                ok: true,
                dimension: 3,
                moveType: "shortest",
                moves: moves,
                positions: applyMoves(start, moves),
            };
        }

        const witness = findHighDimensionalPath(start, end);
        if (witness === null) {
            return { ok: false, reason: "No template path found." };
        }

        return {
            ok: true,
            dimension: start.length,
            moveType: "template",
            pattern: witness.pattern,
            moves: witness.moves,
            positions: applyMoves(start, witness.moves),
        };
    }

    function moveLength(move) {
        const nonZero = move.find((value) => value !== 0);
        return nonZero === undefined ? 0 : Math.abs(nonZero);
    }

    function activeAxes(move) {
        return move.filter((value) => value !== 0).length;
    }

    class SBishopWidget {
        constructor(root) {
            this.root = root;
            this.dimensionInput = root.querySelector("[data-sbishop-dimensions]");
            this.startInput = root.querySelector("[data-sbishop-start]");
            this.endInput = root.querySelector("[data-sbishop-end]");
            this.status = root.querySelector("[data-sbishop-status]");
            this.result = root.querySelector("[data-sbishop-result]");

            this.dimension = clampDimension(Number(this.dimensionInput.value) || 5);
            this.start = [0, 0, 0, 0, 0].slice(0, this.dimension);
            this.end = [7, 1, 6, 3, 5].slice(0, this.dimension);

            this.dimensionInput.value = String(this.dimension);
            this.updateTextInputs();
            this.bindEvents();
            this.solve();
        }

        bindEvents() {
            this.dimensionInput.addEventListener("change", () => {
                this.setDimension(Number(this.dimensionInput.value));
                this.solve();
            });

            this.root.querySelector("[data-sbishop-action='solve']").addEventListener("click", () => {
                this.solveFromTextInputs();
            });

            this.root.querySelector("[data-sbishop-action='swap']").addEventListener("click", () => {
                const oldStart = this.start.slice();
                this.start = this.end.slice();
                this.end = oldStart;
                this.updateTextInputs();
                this.solve();
            });

            this.root.querySelector("[data-sbishop-action='random']").addEventListener("click", () => {
                this.start = this.randomPoint(this.dimension);
                this.end = this.randomPoint(this.dimension);
                while (pointKey(this.start) === pointKey(this.end)) {
                    this.end = this.randomPoint(this.dimension);
                }
                this.updateTextInputs();
                this.solve();
            });

            for (const input of [this.startInput, this.endInput]) {
                input.addEventListener("keydown", (event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        this.solveFromTextInputs();
                    }
                });

                input.addEventListener("blur", () => {
                    this.maybeSyncSingleInput(input === this.startInput ? "start" : "end");
                });
            }
        }

        setDimension(nextDimension) {
            const dimension = clampDimension(Number(nextDimension) || this.dimension);
            this.dimension = dimension;
            this.dimensionInput.value = String(dimension);
            this.start = this.resizeVector(this.start, dimension);
            this.end = this.resizeVector(this.end, dimension);
            this.updateTextInputs();
        }

        resizeVector(vector, dimension) {
            const resized = vector.slice(0, dimension);
            while (resized.length < dimension) {
                resized.push(0);
            }
            return resized;
        }

        randomPoint(dimension) {
            return Array.from({ length: dimension }, () =>
                Math.floor(Math.random() * BOARD_SIDE),
            );
        }

        updateTextInputs() {
            this.startInput.value = formatVector(this.start);
            this.endInput.value = formatVector(this.end);
        }

        maybeSyncSingleInput(which) {
            const parsed = parseCoordinateText(which === "start" ? this.startInput.value : this.endInput.value);
            if (!parsed.ok) {
                return false;
            }

            this.setDimension(parsed.values.length);
            this[which] = parsed.values.slice();
            this.updateTextInputs();
            return true;
        }

        solveFromTextInputs() {
            const startParsed = parseCoordinateText(this.startInput.value);
            if (!startParsed.ok) {
                this.renderError(startParsed.reason);
                return;
            }

            const endParsed = parseCoordinateText(this.endInput.value);
            if (!endParsed.ok) {
                this.renderError(endParsed.reason);
                return;
            }

            if (startParsed.values.length !== endParsed.values.length) {
                this.renderError("Start and end squares must have the same number of coordinates.");
                return;
            }

            this.setDimension(startParsed.values.length);
            this.start = startParsed.values.slice();
            this.end = endParsed.values.slice();
            this.updateTextInputs();
            this.solve();
        }

        solve() {
            const solution = solvePath(this.start, this.end);
            if (!solution.ok) {
                this.renderError(solution.reason);
                return;
            }

            this.status.classList.remove("is-error");
            if (solution.moveType === "template") {
                this.status.textContent =
                    "A three-move template from the proof has been found.";
            } else if (solution.moves.length === 0) {
                this.status.textContent = "You are already on the target square.";
            } else {
                this.status.textContent = `A shortest 3D path of length ${solution.moves.length} has been found.`;
            }

            this.renderSolution(solution);
        }

        renderError(message) {
            this.status.classList.add("is-error");
            this.status.textContent = message;
            this.result.innerHTML = "";
        }

        renderSolution(solution) {
            const summaryPills = [
                `<span class="sbishop-widget__pill">${solution.dimension} dimensions</span>`,
                `<span class="sbishop-widget__pill">${solution.moves.length} move${solution.moves.length === 1 ? "" : "s"}</span>`,
            ];

            if (solution.pattern) {
                summaryPills.push(
                    `<span class="sbishop-widget__pill">pattern ${formatVector(solution.pattern)}</span>`,
                );
            }

            const moveCards = solution.moves
                .map((move, index) => {
                    const destination = solution.positions[index + 1];
                    return `
                        <article class="sbishop-widget__move">
                            <div class="sbishop-widget__move-head">
                                <span class="sbishop-widget__move-label">Move ${index + 1}</span>
                                <span class="sbishop-widget__meta">length ${moveLength(move)} · ${activeAxes(move)} active axes</span>
                            </div>
                            <div class="sbishop-widget__line">
                                <span class="sbishop-widget__term">Increment</span>
                                <code class="sbishop-widget__vector">${formatVector(move, { showPlus: true })}</code>
                            </div>
                            <div class="sbishop-widget__line">
                                <span class="sbishop-widget__term">New position</span>
                                <code class="sbishop-widget__vector">${formatVector(destination)}</code>
                            </div>
                        </article>
                    `;
                })
                .join("");

            this.result.innerHTML = `
                <div class="sbishop-widget__summary">${summaryPills.join("")}</div>
                <div class="sbishop-widget__journey">
                    <article class="sbishop-widget__start">
                        <div class="sbishop-widget__line">
                            <span class="sbishop-widget__term">Start</span>
                            <code class="sbishop-widget__vector">${formatVector(solution.positions[0])}</code>
                        </div>
                    </article>
                    ${moveCards}
                </div>
            `;
        }
    }

    function initialiseWidgets() {
        if (!document.querySelector("link[data-sbishop-widget-style]")) {
            const stylesheet = document.createElement("link");
            stylesheet.rel = "stylesheet";
            stylesheet.href = "widget.css";
            stylesheet.dataset.sbishopWidgetStyle = "true";
            document.head.appendChild(stylesheet);
        }

        document.querySelectorAll("[data-sbishop-widget]").forEach((element) => {
            if (!element._sbishopWidget) {
                element._sbishopWidget = new SBishopWidget(element);
            }
        });
    }

    if (typeof document !== "undefined") {
        document.addEventListener("DOMContentLoaded", initialiseWidgets);
    }

    global.SBishopMoveFinder = {
        solvePath: solvePath,
        parseCoordinateText: parseCoordinateText,
        findPathForPattern: findPathForPattern,
        shortestPath3D: shortestPath3D,
    };
})(typeof window !== "undefined" ? window : globalThis);
