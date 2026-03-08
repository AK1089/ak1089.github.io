---
title: N-Dimensional Chess
date: 2026-03-01
---

<link rel="stylesheet" href="chess1d.css">
<link rel="stylesheet" href="chess2d.css">
<link rel="stylesheet" href="chess3d.css">

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

The rook slides any distance along a single axis. Its direction vector has exactly one nonzero component, so $`S(\mathbf{v}) = 1`$: the displacement takes the form $`\delta = k\mathbf{e}_j`$ for some basis vector $`\mathbf{e}_j`$ and nonzero integer $`k`$. We can also characterise this by $`\|\delta\|_\infty = \|\delta\|_1` \neq 0`$.

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

## III. Metrics

How powerful is a piece? In two-dimensional chess, the consensus ranks queen first, then the rook, followed by the bishop and knight (with the king omitted). In $`N`$ dimensions, we need to be more precise about what "powerful" even means.

A natural starting point is **power**: how many squares can a piece reach in one move? This is position-dependent: a rook on an $`N`$-board can always reach exactly $`7N`$ squares from any starting position, but a bishop's reach varies enormously (larger near the board's centre and smaller near corners). We could resolve this using best-case power (maximised over all positions), worst-case power (minimised), or average-case power (averaged uniformly over all squares). Each has drawbacks: best-case power flatters pieces like the bishop which only achieve their peak in a narrow region, worst-case power penalises every piece equally for corner effects, and average-case power is complicated by the [geometry of high-dimensional cubes](https://www.youtube.com/watch?v=fsLh-NYhOoU), where almost all of the volume is concentrated near the boundary.

A second natural metric is **speed**: across all pairs of reachable squares, how many moves does it take to travel between them? Again we can take the worst case or the average. Speed captures something different from power: a piece might threaten many squares locally but be slow to traverse the board, or vice versa. Since lower values are better, speed is really a *diameter* the length of the shortest path between two (randomly chosen or maximally distant) squares.

Finally, for bishops in particular, we should note that they have limited **reach** and cannot necessarily access all squares: in two dimensions, each bishop is confined to either the light or dark squares. How does this translate to higher dimensions?

### King

**Power.** From a position $`\mathbf{x}`$, the King threatens every square in $`\{\mathbf{x} + \delta : \|\delta\|_\infty = 1\}`$ that lies within the board. At a central square (any of the $`6^N`$ squares not touching any edge), each of the $`N`$ components of $`\delta`$ ranges freely over $`\{-1, 0, +1\}`$, giving $`3^N - 1`$ moves (with the $`-1`$ since the King cannot stay put): this is the best case. At each of the $`2^N`$ corners, each component has only $`2`$ choices, giving $`2^N - 1`$: this is the worst case.

In higher dimensions, note that $`\lim_{N \to \infty} \frac{6^N + 2^N}{8^N} = \lim_{N \to \infty} (3/4)^N + (1/4)^N = 0`$, and so asymptotically no squares fall into these best or worst-case scenarios. More representative is the average case. Ignore the restriction on staying put for now. For a random square, each component of the displacement vector has three options unless the King is at the edge of the board along the corresponding axis. This yields three options in $`6/8`$ of cases, and two options otherwise, for an average of $`11/4`$ options for each component. These restrictions are independent, so there are $`(11/4)^N`$ squares within a distance of 1. Subtracting the start square, we find that the King's average-case power is $`(11/4)^N-1`$.

**Speed.** The King's distance from $`\mathbf{x}`$ to $`\mathbf{y}`$ is exactly $`\|\mathbf{x} - \mathbf{y}\|_\infty = \max_i |x_i - y_i|`$. To see this, consider the following strategy: at each step, set $`\delta_i = \operatorname{sgn}(y_i - x_i)`$ for each coordinate. This is a valid King move ($`\|\delta\|_\infty = 1`$ whenever $`\mathbf{x} \neq \mathbf{y}`$), and each coordinate closes its gap by one per step, so every coordinate has converged after $`\|\mathbf{x} - \mathbf{y}\|_\infty`$ steps. This is optimal: no single move can change any coordinate by more than $`1`$, so a gap of $`d`$ in any coordinate requires at least $`d`$ moves.

The worst case is $`7`$ (for opposite corners, say). Notably, this is independent of $`N`$, because it makes progress along all axes simultaneously. What about the average case? This is equivalent to asking for the expected maximum of $`N`$ independent random variables, each distributed as the difference of two independent random variables uniform on $`\{0, \ldots, 7\}^N`$. We can calculate this to be:

```math
7-32^{-N}\cdot\left(4^{N}+11^{N}+17^{N}+22^{N}+26^{N}+29^{N}+31^{N}\right)
```

The $`k^{\text{th}}`$ term in the brackets comes from the probability of the distance being at least $`k`$ in a coordinate. Note that this tends to $`7`$ as $`N`$ grows large: in each coordinate there is a $`1/32`$ chance that the start and target squares lie on opposite ends of that axis, and if this happens in *any* of $`N`$ coordinates the entire journey must take $`7`$ moves regardless. For $`N = 100`$, this gives a $`1-(31/32)^{100} \approx 95.8\%`$ chance of two randomly chosen squares requiring all $`7`$ moves to traverse.

### Knight

**Power.** Each Knight move activates exactly two of the $`N`$ axes, displacing one by $`\pm 2`$ and the other by $`\pm 1`$. From a central square, we choose an axis which gets the $`2`$ ($`N`$ ways) and which gets the $`1`$ ($`N-1`$ ways), and pick signs ($`4`$ ways), giving $`4N(N-1)`$ moves. From a corner, only one sign combination keeps both coordinates on the board, leaving $`N(N-1)`$ moves.

For the average case, each potential move requires the $`\pm 2`$ step to land on the board (probability $`3/4`$) and the $`\pm 1`$ step likewise (probability $`7/8`$). By linearity of expectation, the average power is $`4N(N-1) \cdot \tfrac{21}{32} = \tfrac{21N(N-1)}{8}`$, which is quadratic in $`N`$.

**Speed.** Each Knight move contributes at most $`3`$ to the $`\ell_1`$ displacement, so the distance between any two squares is at least $`\lceil \|\mathbf{x} - \mathbf{y}\|_1 / 3 \rceil`$. For the worst case (opposite corners, $`\ell_1`$ displacement $`7N`$), this gives $`\lceil 7N/3 \rceil`$ moves, and this bound is approximately tight. To see why: if each move contributes $`+2`$ to one coordinate and $`+1`$ to another, and each coordinate $`i`$ receives $`a_i`$ contributions of $`2`$ and $`b_i = 7 - 2a_i`$ contributions of $`1`$, then the total number of moves is $`m = \sum a_i = \sum b_i`$, which yields $`3m = 7N`$. (When $`3 \nmid 7N`$, or parity forces an adjustment, one or two additional corrective moves suffice.)

### Rook

**Power.** The Rook can always reach exactly $`7N`$ squares: along each of the $`N`$ axes, there are $`7`$ other values to slide to, regardless of the Rook's current position. This makes the Rook unique among the pieces, as its power is completely position-independent with no distinction between best, worst, and average case.

This power grows linearly with $`N`$, in contrast to the King's exponential $`3^N - 1`$. In two dimensions, the Rook's $`14`$ squares comfortably exceed the King's best-case $`8`$. But by $`N = 3`$ the King's best case ($`26`$) has already overtaken the Rook ($`21`$), and by $`N = 10`$ the comparison is absurd: $`59,048`$ vs $`70`$.

**Speed.** Each Rook move changes exactly one coordinate, so the distance from $`\mathbf{x}`$ to $`\mathbf{y}`$ is the number of coordinates that differ: $`\#\{i : x_i \neq y_i\}`$. The worst case is $`N`$ (when all coordinates differ).

For the average case, each coordinate independently agrees with probability $`1/8`$ and differs with probability $`7/8`$, so the distance follows a $`\operatorname{Bin}(N, 7/8)`$ distribution with mean $`7N/8`$. For large $`N`$, this becomes close to a Normal distribution with $`\mu = 7N/8`$ and $`\sigma=\sqrt{7N}/8`$: with $`N=1000`$, there is a $`99\%`$ chance that the distance between two randomly selected squares is between $`847`$ and 900.

### Bishop

**Reach.** In two dimensions, the bishop is confined to squares of one colour. How does this constraint generalise?

The $`2`$-bishop preserves the parity of the coordinate sum $`\sum x_i`$: each move changes two coordinates by $`\pm k`$, altering the sum by $`(\pm k) + (\pm k)`$, which is always even. So the $`2`$-bishop is confined to exactly half the board — the same light-square / dark-square restriction as in two dimensions.

The $`N`$-bishop is more constrained. Each move changes all $`N`$ coordinates by $`\pm k`$, so any two moves that differ in the sign of a single coordinate produce a net displacement of $`2k`$ in that coordinate and $`0`$ in all others. This means the $`N`$-bishop can shift individual coordinates, but only by even amounts. The reachable squares are those where every coordinate shares the same parity: either all coordinates are even or all are odd. On the $`8`$-board, each parity class contains $`4^N`$ squares, so the $`N`$-bishop can reach $`2 \cdot 4^N`$ squares out of $`8^N`$ — a fraction $`2^{1-N}`$ of the board. For $`N = 2`$ this gives $`1/2`$ (recovering the familiar result), but for $`N = 10`$ it is less than $`0.2\%`$. The $`N`$-bishop becomes increasingly trapped in higher dimensions.

The $`S`$-bishop breaks free entirely for $`N \geqslant 3`$. It includes both $`S = 3`$ moves (say $`(+k, +k, +k, 0, \ldots)`$) and $`S = 2`$ moves (say $`(-k, -k, 0, \ldots)`$). Composing these gives a net displacement of $`(0, 0, +k, 0, \ldots)`$: effectively a rook move. Since it can simulate rook-like displacements along any axis, the $`S`$-bishop can reach every square on the board.

**Power.** The $`2`$-bishop has $`13 \binom{N}{2}`$ moves from a central square ($`13`$ diagonal moves in each of the $`\binom{N}{2}`$ coordinate planes): quadratic growth. The $`N`$-bishop has $`3 \cdot 2^N + 1`$ from the centre ($`3`$ moves along each of $`2^N - 1`$ space diagonals plus $`4`$ along the remaining one) but only $`7`$ from a corner, where a single space diagonal reaches inward. The $`S`$-bishop inherits both move sets, with power dominated by its $`2`$-bishop component for small $`N`$ and its higher-$`S`$ components for large $`N`$.

### Queen

All three queens include the Rook's move set and therefore have full reach. Their differences lie in power and speed.

**Power.** Each queen's power is the sum of the Rook's $`7N`$ and its corresponding bishop's contribution. The $`2`$-queen adds $`13\binom{N}{2}`$; the $`N`$-queen adds $`3 \cdot 2^N + 1`$; the $`S`$-queen adds all bishop moves with $`S \geqslant 2`$. From a central square, the $`S`$-queen can reach every square within Chebyshev distance $`3`$, for a best-case power of $`7^N - 1`$ — an enormous number.

**Speed.** The $`S`$-queen can reach any square from any other in at most $`3`$ moves, using a binary decomposition. Write $`d_i = y_i - x_i`$ for each coordinate. Since $`|d_i| \leqslant 7`$, we can decompose $`d_i = 4s_i^{(1)} + 2s_i^{(2)} + s_i^{(3)}`$ where each $`s_i^{(j)} \in \{-1, 0, +1\}`$, and make three $`S`$-queen moves with $`k = 4, 2, 1`$ respectively, each coordinate independently choosing its sign. The intermediate positions stay on the board: at the $`k = 4`$ step, coordinates in $`\{0, \ldots, 3\}`$ can step up or stay, while those in $`\{4, \ldots, 7\}`$ can step down or stay, and similarly at each finer scale.

This bound is tight: with only two moves (any $`k_1, k_2`$), each coordinate takes at most $`9`$ values ($`k_1 s_1 + k_2 s_2`$ for $`s_i \in \{-1, 0, +1\}`$), which cannot cover all $`15`$ values in $`\{-7, \ldots, 7\}`$.

The $`2`$-queen and $`N`$-queen lack this trick, as their restricted directions prevent independent per-coordinate sign choices. Their worst-case distance is $`N`$, matching the Rook, though diagonal moves can sometimes cover two coordinates at once (reducing the distance to as low as $`\lceil N/2 \rceil`$ when multiple coordinates need the same displacement).


<script src="chess1d.js"></script>
<script src="chess2d.js"></script>
<script type="importmap">
{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.166.0/build/three.module.js", "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.166.0/examples/jsm/" } }
</script>
<script type="module" src="chess3d.js"></script>
