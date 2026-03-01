(function () {
    "use strict";

    // Piece definitions: each has a symbol, display name, and a move validator.
    // The validator takes (dr, dc) — the row and column displacement — and
    // returns true if the piece can make that move (on an otherwise empty board).
    const PIECES = {
        king: {
            symbol: "\u265A",
            name: "King",
            validate: (dr, dc) => Math.max(Math.abs(dr), Math.abs(dc)) === 1,
        },
        rook: {
            symbol: "\u265C",
            name: "Rook",
            validate: (dr, dc) => (dr === 0) !== (dc === 0),
        },
        bishop: {
            symbol: "\u265D",
            name: "Bishop",
            validate: (dr, dc) => dr !== 0 && Math.abs(dr) === Math.abs(dc),
        },
        queen: {
            symbol: "\u265B",
            name: "Queen",
            validate: (dr, dc) =>
                (dr !== 0 || dc !== 0) &&
                (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)),
        },
        knight: {
            symbol: "\u265E",
            name: "Knight",
            validate: (dr, dc) => {
                const a = Math.abs(dr),
                    b = Math.abs(dc);
                return (a === 1 && b === 2) || (a === 2 && b === 1);
            },
        },
    };

    class ChessBoard2D {
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
            board.className = "chess2d";
            board.style.setProperty("--board-size", this.size);

            for (let row = 0; row < this.size; row++) {
                this.cells[row] = [];
                for (let col = 0; col < this.size; col++) {
                    const cell = document.createElement("div");
                    const isLight = (row + col) % 2 === 0;
                    cell.className =
                        "chess2d-cell " +
                        (isLight ? "chess2d-cell--light" : "chess2d-cell--dark");
                    cell.addEventListener("click", () => this.handleClick(row, col));
                    board.appendChild(cell);
                    this.cells[row][col] = cell;
                }
            }

            const caption = document.createElement("p");
            caption.className = "chess2d-caption";
            caption.textContent = "Click any square to place the piece.";
            this.captionEl = caption;

            this.container.appendChild(board);
            this.container.appendChild(caption);

            // Place piece at center by default
            var initRow = Math.floor(this.size / 2);
            var initCol = Math.floor(this.size / 2);
            this.handleClick(initRow, initCol);
        }

        handleClick(row, col) {
            if (
                this.piecePos &&
                this.piecePos.row === row &&
                this.piecePos.col === col
            ) {
                return;
            }

            this.clear();
            this.piecePos = { row: row, col: col };

            // Place the piece
            const cell = this.cells[row][col];
            cell.classList.add("chess2d-cell--piece");
            cell.textContent = this.piece.symbol;

            // Highlight valid moves
            let count = 0;
            for (let r = 0; r < this.size; r++) {
                for (let c = 0; c < this.size; c++) {
                    const dr = r - row;
                    const dc = c - col;
                    if ((dr !== 0 || dc !== 0) && this.piece.validate(dr, dc)) {
                        this.cells[r][c].classList.add("chess2d-cell--move");
                        count++;
                    }
                }
            }

            this.captionEl.textContent =
                count + " move" + (count !== 1 ? "s" : "") + " available from this space.";
        }

        clear() {
            this.piecePos = null;
            for (let r = 0; r < this.size; r++) {
                for (let c = 0; c < this.size; c++) {
                    const cell = this.cells[r][c];
                    cell.classList.remove("chess2d-cell--piece", "chess2d-cell--move");
                    cell.textContent = "";
                }
            }
        }
    }

    // Auto-initialise: any element with data-chess2d="piece" becomes a board
    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll("[data-chess2d]").forEach(function (el) {
            var key = el.dataset.chess2d;
            var piece = PIECES[key];
            if (piece) {
                var board = new ChessBoard2D(el, piece);
                el._chess2d = board;
            }
        });
    });

    window.ChessBoard2D = ChessBoard2D;
    window.CHESS_PIECES_2D = PIECES;
})();
