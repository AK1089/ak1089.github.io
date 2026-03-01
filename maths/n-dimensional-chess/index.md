---
title: N-Dimensional Chess
date: 2026-03-01
---

<link rel="stylesheet" href="chess2d.css">
<link rel="stylesheet" href="chess3d.css">

## I. Displacement Vectors

What is the nicest generalisation of each standard chess piece's move rules into some other number of dimensions $`N`$? We seek a definition which is as natural as possible within the space of descriptions and which matches regular chess behaviour in two dimensions without privileging this case.

The most natural descriptions are in terms of *displacement vectors*: a piece may move from some space $`\mathbf{x}`$ to another space $`\mathbf{x} + \delta`$ if and only if the displacement vector $`\delta`$ lies within its move set (and, of course, if this lies within the board).

Write $`\delta = (\delta_1, \delta_2, \dots, \delta_N)`$ for the components of this displacement vector. What conditions should we place on this vector for each piece?

For most pieces, we can decompose $`\delta = k\mathbf{v}`$ where $`\mathbf{v} \in \{-1, 0, +1\}^N \setminus \{\mathbf{0}\}`$ is a *direction vector* and $`k \geqslant 1`$ is an integer scalar. Non-sliding pieces (king, knight) fix $`k = 1`$; sliding pieces (rook, bishop, queen) allow any $`k`$. We classify directions by how many axes they involve: let $`S(\mathbf{v}) = \#\{i : v_i \neq 0\}`$ denote the number of *active axes*.

## II. The Pieces

### King

The king moves one step in any direction: horizontally, vertically, or diagonally. In terms of the displacement vector, every component satisfies $`|\delta_i| \leqslant 1`$, and at least one is nonzero. We can write this nicely in terms of the supremum norm: the condition is $`\|\delta\|_\infty = 1`$.

<div class="chess-pair">
<div data-chess2d="king"></div>
<div data-chess3d="king"></div>
</div>

### Knight

The knight also does not fit the sliding framework. Its displacement $`\delta`$ is a permutation of $`(\pm 2, \pm 1, 0, \ldots, 0)`$: "move two units in some direction, then one unit in some other direction". We can characterise this neatly with two norm conditions: $`\|\delta\|_1 = 3`$ and $`\|\delta\|_\infty = 2`$. Together these uniquely pick out the $`\{2, 1\}`$ pattern, up to signs and axis choices.

<div class="chess-pair">
<div data-chess2d="knight"></div>
<div data-chess3d="knight"></div>
</div>

### Rook

The rook slides any distance along a single axis. Its direction vector has exactly one nonzero component, so $`S(\mathbf{v}) = 1`$: the displacement takes the form $`\delta = k\mathbf{e}_j`$ for some basis vector $`\mathbf{e}_j`$ and nonzero integer $`k`$. We can characterise this by $`\|\delta\|_\infty = \|\delta\|_1`$.

<div class="chess-pair">
<div data-chess2d="rook"></div>
<div data-chess3d="rook"></div>
</div>

### Bishop

In two dimensions, the bishop slides diagonally, moving along both axes simultaneously: $`S(\mathbf{v}) = 2`$. When we enter $`N > 2`$ dimensions, it is unclear whether to generalise this rule as $`S(\mathbf{v}) = 2`$ or $`S(\mathbf{v}) = N`$ (or even $`2 \leqslant S(\mathbf{v}) \leqslant N`$).

These three interpretations give rise to three types of bishop, which I shall term the $`2`$-bishop, the $`N`$-bishop, and the $`S`$-bishop. In two dimensions, these are equivalent, but in higher dimensions this breaks down.

<div class="chess-pair">
<div data-chess2d="bishop"></div>
<div data-chess3d="bishop"></div>
</div>

### Queen

In two dimensions, the queen can slide any distance along a rank, file, or diagonal. There are two natural ways to phrase this:

- **Rook $`\cup`$ Bishop**: the queen can make any move that either a rook or a bishop could make.
- **Unrestricted-range King**: the queen can move in any direction the king can, but for any distance $`k \geqslant 1`$ rather than just $`k = 1`$.

In two dimensions these coincide, but in higher dimensions the ambiguity propagates. We get three queen variants from combining the rook with our three bishop variants, one of which coincides with the latter definition of a queen as a long-range king. So we are left with three distinct queens:

| Queen variant | | Directions allowed | Norm characterisation |
|---|---|---|---|
| $`2`$-Queen | | $`S(\mathbf{v}) \in \{1, 2\}`$ | $`\|\delta\|_\infty = \|\delta\|_1`$ or $`\|\delta\|_\infty = \tfrac{1}{2}\|\delta\|_1`$ |
| $`N`$-Queen | | $`S(\mathbf{v}) \in \{1, N\}`$ | $`\|\delta\|_\infty = \|\delta\|_1`$ or $`\|\delta\|_\infty = \tfrac{1}{N}\|\delta\|_1`$ |
| $`S`$-Queen | | $`S(\mathbf{v}) \geqslant 1`$ | $`\delta = k \mathbf{v}: \|\mathbf{v}\|_\infty = 1, k \geqslant 1`$ |

The $`S`$-queen is the most permissive, with its move set simply containing every displacement of the form $`k\mathbf{v}`$ for $`\mathbf{v} \in \{-1, 0, +1\}^N \setminus \{\mathbf{0}\}`$. The $`2`$-queen is the most restrictive, only ever moving along one or two axes at a time.

The three queen variants are distinct for $`N > 2`$. The $`S`$-queen is a strict superpiece of both others, since its move set includes all directions with $`S(\mathbf{v}) \geqslant 1`$. The $`2`$-queen and $`N`$-queen, however, are incomparable: the $`2`$-queen can move along $`(k, k, 0, \ldots, 0)`$, activating exactly two axes, which the $`N`$-queen cannot; and the $`N`$-queen can move along $`(k, k, \ldots, k)`$, activating all axes simultaneously, which the $2$-queen cannot.

<div class="chess-pair">
<div data-chess2d="queen"></div>
<div data-chess3d="queen"></div>
</div>

### Pawn

I'm going to omit the pawn from this analysis: its movement is inherently stateful (having moved or not determines whether it can advance two squares), directional (its movement cannot be characterised by symmetric displacement constraints), and generally peculiar (it captures and advances differently, and en passant exists). All of these make pawns resist clean generalisation into higher dimensions.

## III. Metrics

How powerful is a piece? In two-dimensional chess, the consensus on piece value ranks queen the highest, then the rook, followed by the bishop and knight. In $`N`$ dimensions, we need to be more precise about what "powerful" means.

A natural starting point is **power**: how many squares can a piece reach in a single move? But this is position-dependent: A rook on an $`N`$-board can always reach exactly $`7N`$ squares regardless of where it sits, but a bishop's reach varies enormously (larger near the board's centre and smaller near corners). We could resolve this in three ways: best-case power (maximised over all positions), worst-case power (minimised), or average-case power (averaged uniformly over all squares). Each has drawbacks. Best-case power flatters pieces like the bishop which only achieve their peak in a narrow region. Worst-case power penalises every piece equally for corner effects. And average-case power is complicated by the [geometry of high-dimensional cubes](https://www.youtube.com/watch?v=fsLh-NYhOoU), where almost all of the volume is concentrated near the boundary.

A second natural metric is **speed**: across all pairs of reachable squares, how many moves does it take to travel between them? Again we can take the worst case or the average. Speed captures something different from power: a piece might threaten many squares locally but be slow to traverse the board, or vice versa. Since lower values are better, speed is really a *diameter* the length of the shortest path between two (randomly chosen or maximally distant) spaces.

Finally, we should note **reachability** as a binary prerequisite: can a piece reach every square on the board at all? In two dimensions, the bishop famously cannot: it is confined to squares of one colour, reaching only half the board. In higher dimensions, different bishop variants have very different reachability properties, and this qualitative distinction matters more than any quantitative metric.

## IV. Asymptotics

<script src="chess2d.js"></script>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.166.0/build/three.module.js", "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.166.0/examples/jsm/" } }
</script>
<script type="module" src="chess3d.js"></script>
