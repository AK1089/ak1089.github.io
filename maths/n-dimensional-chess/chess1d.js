(function () {
    "use strict";

    const PIECES = {
        king: {
            symbol: "\u265A",
            name: "King",
            validate: (dx) => Math.abs(dx) === 1,
        },
        rook: {
            symbol: "\u265C",
            name: "Rook",
            validate: (dx) => dx !== 0,
        },
        bishop: {
            symbol: "\u265D",
            name: "Bishop",
            validate: () => false,
        },
        queen: {
            symbol: "\u265B",
            name: "Queen",
            validate: (dx) => dx !== 0,
        },
        knight: {
            symbol: "\u265E",
            name: "Knight",
            validate: () => false,
        },
        "bishop-2": {
            symbol: "\u265D",
            name: "2-Bishop",
            validate: () => false,
        },
        "bishop-n": {
            symbol: "\u265D",
            name: "N-Bishop",
            validate: () => false,
        },
        "bishop-s": {
            symbol: "\u265D",
            name: "S-Bishop",
            validate: () => false,
        },
        "queen-2": {
            symbol: "\u265B",
            name: "2-Queen",
            validate: (dx) => dx !== 0,
        },
        "queen-n": {
            symbol: "\u265B",
            name: "N-Queen",
            validate: (dx) => dx !== 0,
        },
        "queen-s": {
            symbol: "\u265B",
            name: "S-Queen",
            validate: (dx) => dx !== 0,
        },
    };

    class ChessBoard1D {
        constructor(container, piece) {
            this.container = container;
            this.size = parseInt(container.dataset.boardSize) || 8;
            this.piece = piece;
            this.piecePos = null;
            this.cells = [];
            this.build();
        }

        build() {
            const board = document.createElement("div");
            board.className = "chess1d";
            board.style.setProperty("--board-size", this.size);

            for (let i = 0; i < this.size; i++) {
                const cell = document.createElement("button");
                const isLight = i % 2 === 0;
                cell.className =
                    "chess1d-cell " +
                    (isLight ? "chess1d-cell--light" : "chess1d-cell--dark");
                cell.type = "button";
                cell.addEventListener("click", () => this.handleClick(i));
                board.appendChild(cell);
                this.cells.push(cell);
            }

            const caption = document.createElement("p");
            caption.className = "chess1d-caption";
            caption.textContent = "Click any square to place the piece.";
            this.captionEl = caption;

            this.container.append(board, caption);
            this.handleClick(Math.floor(this.size / 2));
        }

        setPiece(piece) {
            this.piece = piece;
            if (this.piecePos !== null) {
                const x = this.piecePos;
                this.piecePos = null;
                this.handleClick(x, { silent: true });
            }
        }

        handleClick(x, options = {}) {
            if (this.piecePos === x) return;
            this.clear();
            this.piecePos = x;

            const cell = this.cells[x];
            cell.classList.add("chess1d-cell--piece");
            cell.textContent = this.piece.symbol;

            let count = 0;
            for (let i = 0; i < this.size; i++) {
                const dx = i - x;
                if (dx !== 0 && this.piece.validate(dx)) {
                    this.cells[i].classList.add("chess1d-cell--move");
                    count++;
                }
            }

            this.captionEl.textContent =
                count + " move" + (count !== 1 ? "s" : "") + " available from this space.";

            if (!options.silent && typeof this.onMove === "function") {
                this.onMove({ x });
            }
        }

        clear() {
            this.piecePos = null;
            for (const cell of this.cells) {
                cell.classList.remove("chess1d-cell--piece", "chess1d-cell--move");
                cell.textContent = "";
            }
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll("[data-chess1d]").forEach(function (el) {
            const key = el.dataset.chess1d;
            const piece = PIECES[key];
            if (!piece) return;
            const board = new ChessBoard1D(el, piece);
            el._chess1d = board;
        });
    });

    window.ChessBoard1D = ChessBoard1D;
    window.CHESS_PIECES_1D = PIECES;
})();
