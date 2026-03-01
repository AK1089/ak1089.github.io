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

<div data-chess2d="king"></div>

<div data-chess3d="king"></div>

### Knight

The knight also does not fit the sliding framework. Its displacement $`\delta`$ is a permutation of $`(\pm 2, \pm 1, 0, \ldots, 0)`$: "move two units in some direction, then one unit in some other direction". We can characterise this neatly with two norm conditions: $`\|\delta\|_1 = 3`$ and $`\|\delta\|_\infty = 2`$. Together these uniquely pick out the $`\{2, 1\}`$ pattern, up to signs and axis choices.

<div data-chess2d="knight"></div>

<div data-chess3d="knight"></div>

### Rook

The rook slides any distance along a single axis. Its direction vector has exactly one nonzero component, so $`S(\mathbf{v}) = 1`$: the displacement takes the form $`\delta = k\mathbf{e}_j`$ for some basis vector $`\mathbf{e}_j`$ and nonzero integer $`k`$. We can characterise this by $`\|\delta\|_\infty = \|\delta\|_1`$.

<div data-chess2d="rook"></div>

<div data-chess3d="rook"></div>

### Bishop

In two dimensions, the bishop slides diagonally, moving along both axes simultaneously: $`S(\mathbf{v}) = 2`$. When we enter $`N > 2`$ dimensions, it is unclear whether to generalise this rule as $`S(\mathbf{v}) = 2`$ or $`S(\mathbf{v}) = N`$ (or even $`2 \leqslant S(\mathbf{v}) \leqslant N`$).

These three interpretations give rise to three types of bishop, which I shall term the $`2`$-bishop, the $`N`$-bishop, and the $`S`$-bishop. In two dimensions, these are equivalent, but in higher dimensions this breaks down

<div data-chess2d="bishop"></div>

<div data-chess3d="bishop"></div>

### Queen

In two dimensions, the queen can slide any distance along a rank, file, or diagonal. There are two natural ways to phrase this:

- **Rook $`\cup`$ Bishop**: the queen can make any move that either a rook or a bishop could make.
- **Unrestricted-range King**: the queen can move in any direction the king can, but for any distance $`k \geqslant 1`$ rather than just $`k = 1`$.

In two dimensions these coincide, but in higher dimensions the ambiguity propagates. We get three queen variants from combining the rook with our three bishop variants, one of which coincides with the latter definition of a queen as a long-range king. So we are left with three distinct queens:

| Queen variant | Directions allowed | Norm characterisation |
|---|---|---|
| $`2`$-Queen (Rook $`\cup`$ $`2`$-Bishop) | $`S(\mathbf{v}) \in \{1, 2\}`$ | $`\|\delta\|_\infty = \|\delta\|_1`$ or $`\|\delta\|_\infty = \tfrac{1}{2}\|\delta\|_1`$ |
| $`N`$-Queen (Rook $`\cup`$ $`N`$-Bishop) | $`S(\mathbf{v}) \in \{1, N\}`$ | $`\|\delta\|_\infty = \|\delta\|_1`$ or $`\|\delta\|_\infty = \tfrac{1}{N}\|\delta\|_1`$ |
| $`S`$-Queen (= unrestricted-range King) | $`S(\mathbf{v}) \geqslant 1`$ | $`\delta = k \varepsilon: \|\varepsilon\|_\infty = 1`$ |

The $`S`$-queen is the most permissive: its move set is simply every displacement of the form $`k\mathbf{v}`$. The $`2`$-queen is the most restrictive, only ever moving along one or two axes at a time.

<div data-chess2d="queen"></div>

<div data-chess3d="queen"></div>

### Pawn

I'm going to omit the pawn from this analysis: its movement is inherently stateful (having moved or not determines whether it can advance two squares),directional (its movement cannot be characterised by symmetric displacement constraints), and generally peculiar (it captures and advances differently, and en passant exists). All of these make pawns resist clean generalisation into higher dimensions.

## III. Metrics

## IV. Asymptotics

<script src="chess2d.js"></script>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.166.0/build/three.module.js", "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.166.0/examples/jsm/" } }
</script>
<script type="module" src="chess3d.js"></script>
