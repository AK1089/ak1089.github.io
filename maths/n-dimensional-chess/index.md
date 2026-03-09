---
title: N-Dimensional Chess
date: 2026-03-01
updated: 2026-03-09
---

## I. Displacement Vectors

What is the nicest generalisation of each standard chess piece into an arbitrary $`N`$-dimensional board $`\{0, \ldots, 7\}^N`$? We seek a definition which is as natural and simple as possible and which matches the piece's behaviour in two dimensions without privileging this case.

The most natural descriptions are in terms of *displacement vectors*: a piece may move from some space $`\mathbf{x}`$ to another space $`\mathbf{x} + \delta`$ if and only if the displacement vector $`\delta`$ lies within its move set (and, of course, if this lies within the board).

Write $`\delta = (\delta_1, \delta_2, \dots, \delta_N)`$ for the components of this displacement vector. For most pieces, we can decompose $`\delta = k\mathbf{v}`$ where $`\mathbf{v} \in \{-1, 0, +1\}^N \setminus \{\mathbf{0}\}`$ is a *direction vector* and $`k \geqslant 1`$ is an integer scalar. Non-sliding pieces (king, knight) fix $`k = 1`$; sliding pieces (rook, bishop, queen) allow any $`k`$. We classify directions by how many axes they involve: let $`S(\mathbf{v}) = \#\{ 1 \leqslant i \leqslant N : v_i \neq 0\}`$ denote the number of *active axes*.

## II. The Pieces

### King

The king moves one step in any direction: horizontally, vertically, or diagonally. In terms of the displacement vector, every component satisfies $`|\delta_i| \leqslant 1`$, and at least one is nonzero. We can write this nicely in terms of the supremum norm: the condition is $`\|\delta\|_\infty = 1`$.

<div class="chess-pair">
<div data-chess1d="king"></div>
<div data-chess2d="king"></div>
<div data-chess3d="king"></div>
</div>

### Knight

The knight also does not fit the sliding framework. Its displacement $`\delta`$ is a permutation of $`(\pm 2, \pm 1, 0, \ldots, 0)`$: "move two units in some direction, then one unit in some other direction". We can characterise this neatly with two norm conditions: $`\|\delta\|_1 = 3`$ and $`\|\delta\|_\infty = 2`$. Together these uniquely pick out the $`\{2, 1\}`$ pattern, up to signs and axis choices.

<div class="chess-pair">
<div data-chess1d="knight"></div>
<div data-chess2d="knight"></div>
<div data-chess3d="knight"></div>
</div>

### Rook

The rook slides any distance along a single axis. Its direction vector has exactly one nonzero component, so $`S(\mathbf{v}) = 1`$: the displacement takes the form $`\delta = k\mathbf{e}_j`$ for some basis vector $`\mathbf{e}_j`$ and nonzero integer $`k`$. We can also characterise this by $`\|\delta\|_\infty = \|\delta\|_1 \neq 0`$.

<div class="chess-pair">
<div data-chess1d="rook"></div>
<div data-chess2d="rook"></div>
<div data-chess3d="rook"></div>
</div>

### Bishop

In two dimensions, the bishop slides diagonally, moving along both axes simultaneously: $`S(\mathbf{v}) = 2`$. When we enter $`N > 2`$ dimensions, it is unclear whether to generalise this rule as $`S(\mathbf{v}) = 2`$ or $`S(\mathbf{v}) = N`$ (or even $`2 \leqslant S(\mathbf{v}) \leqslant N`$).

These three interpretations give rise to three types of bishop, which I shall term the $`2`$-bishop, the $`N`$-bishop, and the $`S`$-bishop. In two dimensions, these are equivalent, but in higher dimensions this breaks down.

<div class="chess-pair">
<div data-chess1d="bishop"></div>
<div data-chess2d="bishop"></div>
<div data-chess3d="bishop"></div>
</div>

### Queen

In two dimensions, the queen can slide any distance along a rank, file, or diagonal. There are two natural ways to phrase this:

- **Rook $`\cup`$ Bishop**: the queen can make any move that either a rook or a bishop could make.
- **Unrestricted-range King**: the queen can move in any direction the king can, but for any distance $`k \geqslant 1`$ rather than just $`k = 1`$.

In two dimensions these coincide, but in higher dimensions we get three queen variants from combining the rook with our three bishop variants.

| Queen variant | | Directions allowed | Norm characterisation |
|---|---|---|---|
| $`2`$-Queen | | $`S(\mathbf{v}) \in \{1, 2\}`$ | $`\|\delta\|_\infty = \|\delta\|_1`$ or $`\|\delta\|_\infty = \tfrac{1}{2}\|\delta\|_1`$ |
| $`N`$-Queen | | $`S(\mathbf{v}) \in \{1, N\}`$ | $`\|\delta\|_\infty = \|\delta\|_1`$ or $`\|\delta\|_\infty = \tfrac{1}{N}\|\delta\|_1`$ |
| $`S`$-Queen | | $`S(\mathbf{v}) \geqslant 1`$ | $`\delta = k \mathbf{v}: \|\mathbf{v}\|_\infty = 1, k \geqslant 1`$ |

The $`S`$-queen is the most permissive, with its move set simply containing every displacement of the form $`k\mathbf{v}`$ for $`\mathbf{v} \in \{-1, 0, +1\}^N \setminus \{\mathbf{0}\}`$. In fact, this is identical to the ruleset of the King without the distance restriction. The $`2`$-queen is the most restrictive, only ever moving along one or two axes at a time.

The three queen variants are distinct for $`N > 2`$. The $`S`$-queen is a strict superpiece of both others. The $`2`$-queen and $`N`$-queen, however, are incomparable: only the $`2`$-queen can move by $`\delta_2 = (k, k, 0, \ldots, 0)`$, while only the $`N`$-queen can move by $`\delta_N = (k, k, \ldots, k)`$. You can see these in the three-dimensional case below.

<div class="chess-pair">
<div data-chess1d="queen"></div>
<div data-chess2d="queen"></div>
<div data-chess3d="queen"></div>
</div>

### Pawn

I'm going to omit the pawn from this analysis: its movement is inherently stateful (having moved or not determines whether it can advance two squares), directional (its movement cannot be characterised by symmetric displacement constraints), and generally peculiar (it captures and advances differently, and en passant exists). All of these make pawns resist clean generalisation into higher dimensions.

## III. Summary Metrics

The definitions above tell us what each piece *can* do, but not how strong it is. For that we need to look at questions like:

- how many squares a piece can threaten in one move,
- how quickly it can traverse the board,
- whether it can even reach every square at all.

The full calculations get quite involved, especially in higher dimensions, so here is a compact summary.

| Piece | Worst-case speed | Average speed (large $`N`$) | Average power growth |
|---|---|---|---|
| King | $`=7`$ | $`\to 7`$ | $`= (11/4)^N - 1`$ |
| Knight | $`\approx 7N/3`$ | $`\to 7N/8`$ | $`= (21/8)N(N-1)`$ |
| Rook | $`=N`$ | $`= 7N/8`$ | $`= 7N`$ |
| $`2`$-Bishop | $`=\infty`$ | $`=\infty`$ | $`= \frac{35}{8}N(N-1)`$ |
| $`N`$-Bishop | $`=\infty`$ | $`=\infty`$ | $`\approx (7/4)^N`$ |
| $`S`$-Bishop | $`=3`$ | $`\to 3`$ | $`\approx (11/4)^N`$ |
| $`2`$-Queen | $`\approx N/2`$ | $`\to 7N/16`$ | $`= \frac{1}{8}(35N^2+21N)`$ |
| $`N`$-Queen | $`\approx N/2`$ | $`\to N/2`$ | $`\approx (7/4)^N`$ |
| $`S`$-Queen | $`=3`$ | $`\to 3`$ | $`\approx (11/4)^N`$ |

Two facts stand out especially strongly:

- The rook, so dominant in ordinary chess, becomes relatively tame in high dimensions because its power grows only linearly in $`N`$.
- The $`S`$-bishop is startlingly strong: for $`N \geqslant 3`$, it can reach *any* square in at most three moves. The proof of this brilliant fact deserves [its own page](bishop).

For exact formulas, derivations, and average-case calculations, see the [full metrics writeup](metrics).

<link rel="stylesheet" href="chess1d.css">
<link rel="stylesheet" href="chess2d.css">
<link rel="stylesheet" href="chess3d.css">

<script src="chess1d.js"></script>
<script src="chess2d.js"></script>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.166.0/build/three.module.js", "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.166.0/examples/jsm/" } }
</script>
<script type="module" src="chess3d.js"></script>
