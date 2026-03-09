---
title: Evaluating N-Dimensional Chess Pieces
date: 2026-03-09
---

This page analyses the strength of the pieces defined [previously](..). I will use three notions throughout.

- **Power**: how many squares can be reached in one move.
- **Speed**: how many moves are needed to travel between two squares.
- **Reach**: whether every square of the board is accessible at all (for bishops).

Power is often position-dependent, so we may speak of best-case, worst-case, or average-case power: a rook can always move to exactly $`7N`$ squares, but a bishop varies enormously. This is also complicated by the [geometry of high-dimensional cubes](https://www.youtube.com/watch?v=fsLh-NYhOoU) where almost all of the volume is concentrated near the boundary: 

Since lower values for speed are preferable, this really represents a *diameter*: precisely, the diameter of the graph induced by this chess piece's adjacency rules.

## King

**Power.** From a position $`\mathbf{x}`$, the King threatens every square in $`\{\mathbf{x} + \delta : \|\delta\|_\infty = 1\}`$ that lies within the board. At a central square (any of the $`6^N`$ squares not touching any edge), each of the $`N`$ components of $`\delta`$ ranges freely over $`\{-1, 0, +1\}`$, giving $`3^N - 1`$ moves (with the $`-1`$ since the King cannot stay put): this is the best case. At each of the $`2^N`$ corners, each component has only $`2`$ choices, giving $`2^N - 1`$: this is the worst case.

In higher dimensions, note that $`\lim_{N \to \infty} \frac{6^N + 2^N}{8^N} = \lim_{N \to \infty} (3/4)^N + (1/4)^N = 0`$, and so asymptotically no squares fall into these best or worst-case scenarios. More representative is the average case. Ignore the restriction on staying put for now. For a random square, each component of the displacement vector has three options unless the King is at the edge of the board along the corresponding axis. This yields three options in $`6/8`$ of cases, and two options otherwise, for an average of $`11/4`$ options for each component. These restrictions are independent, so there are $`(11/4)^N`$ squares within a distance of 1. Subtracting the start square, we find that the King's average-case power is $`(11/4)^N-1`$.

**Speed.** The King's distance from $`\mathbf{x}`$ to $`\mathbf{y}`$ is exactly $`\|\mathbf{x} - \mathbf{y}\|_\infty = \max_i |x_i - y_i|`$. To see this, consider the following strategy: at each step, set $`\delta_i = \operatorname{sgn}(y_i - x_i)`$ for each coordinate. This is a valid King move ($`\|\delta\|_\infty = 1`$ whenever $`\mathbf{x} \neq \mathbf{y}`$), and each coordinate closes its gap by one per step, so every coordinate has converged after $`\|\mathbf{x} - \mathbf{y}\|_\infty`$ steps. This is optimal: no single move can change any coordinate by more than $`1`$, so a gap of $`d`$ in any coordinate requires at least $`d`$ moves.

The worst case is $`7`$ (for opposite corners, say). Notably, this is independent of $`N`$, because it makes progress along all axes simultaneously. What about the average case? This is equivalent to asking for the expected maximum of $`N`$ independent random variables, each distributed as the difference of two independent random variables uniform on $`\{0, \ldots, 7\}^N`$. We can calculate this to be:

```math
7-32^{-N}\cdot\left(4^{N}+11^{N}+17^{N}+22^{N}+26^{N}+29^{N}+31^{N}\right)
```

The $`k^{\text{th}}`$ term in the brackets comes from the probability of the distance being at least $`k`$ in a coordinate. Note that this tends to $`7`$ as $`N`$ grows large: in each coordinate there is a $`1/32`$ chance that the start and target squares lie on opposite ends of that axis, and if this happens in *any* of $`N`$ coordinates the entire journey must take $`7`$ moves regardless. For $`N = 100`$, this gives a $`1-(31/32)^{100} \approx 95.8\%`$ chance of two randomly chosen squares requiring all $`7`$ moves to traverse.

## Knight

**Power.** Each Knight move activates exactly two of the $`N`$ axes, displacing one by $`\pm 2`$ and the other by $`\pm 1`$. From a central square, we choose an axis which gets the $`2`$ ($`N`$ ways) and which gets the $`1`$ ($`N-1`$ ways), and pick signs ($`4`$ ways), giving $`4N(N-1)`$ moves. From a corner, only one sign combination keeps both coordinates on the board, leaving $`N(N-1)`$ moves.

For the average case, each potential move requires the $`\pm 2`$ step to land on the board (probability $`3/4`$) and the $`\pm 1`$ step likewise (probability $`7/8`$). By linearity of expectation, the average power is $`4N(N-1) \cdot \frac{21}{32} = \frac{21}{8}N(N-1)`$, which is quadratic in $`N`$.

**Speed.** Write $`d_i = |x_i-y_i|`$ and $`D = \sum_i d_i`$ for the total coordinate gap. Each Knight move changes one coordinate by $`2`$ and another by $`1`$, so it can reduce $`D`$ by at most $`3`$. Hence every journey needs at least $`D/3`$ moves.

Conversely, if we decompose each gap as $`d_i = 2a_i + b_i`$ with $`a_i,b_i \geqslant 0`$, then $`a_i`$ counts how often coordinate $`i`$ receives the $`2`$-part of a move and $`b_i`$ how often it receives the $`1`$-part. A path of length $`M`$ exists whenever we can arrange $`\sum a_i = \sum b_i = M`$. Because every $`d_i \leqslant 7`$, once $`M`$ is linear in $`N`$ the distinct-axis pairing issue contributes only a bounded error. For opposite corners $`d_i = 7`$ this gives $`M = \frac{7N}{3} + O(1)`$, and for random pairs it also succeeds with high probability because $`\mathbb E[\lfloor d_i/2 \rfloor] = 17/16 > \mathbb E[d_i]/3 = 7/8`$. Thus the Knight distance is $`D/3 + O(1)`$.

Since $`\mathbb E[D] = N \cdot \mathbb E|X-Y| = 21N/8`$, the average Knight speed is $`7N/8 + O(1)`$. The worst case comes from opposite corners, giving $`7N/3 + O(1)`$.

## Rook

**Power.** The Rook can always reach exactly $`7N`$ squares: along each of the $`N`$ axes, there are $`7`$ other values to slide to, regardless of the Rook's current position. This makes the Rook unique among the pieces, as its power is completely position-independent with no distinction between best, worst, and average case.

This power grows linearly with $`N`$, in contrast to the King's exponential $`3^N - 1`$. In two dimensions, the Rook's $`14`$ squares comfortably exceed the King's best-case $`8`$. But by $`N = 3`$ the King's best case of $`26`$ has already overtaken the Rook's $`21`$, and by $`N = 10`$ the comparison is absurd: $`59,048`$ vs $`70`$.

**Speed.** Each Rook move changes exactly one coordinate, so the distance from $`\mathbf{x}`$ to $`\mathbf{y}`$ is the number of coordinates that differ: $`\#\{i : x_i \neq y_i\}`$. The worst case is $`N`$ (when all coordinates differ).

For the average case, each coordinate independently agrees with probability $`1/8`$ and differs with probability $`7/8`$, so the distance follows a $`\operatorname{Bin}(N, 7/8)`$ distribution with mean $`7N/8`$. For large $`N`$, this becomes close to a Normal distribution with $`\mu = 7N/8`$ and $`\sigma=\sqrt{7N}/8`$: with $`N=1000`$, there is a $`99\%`$ chance that the distance between two randomly selected squares is between $`847`$ and 900.

## Bishop

**Reach.** In two dimensions, the bishop is confined to squares of one colour. How does this constraint generalise? For the $`2`$-bishop, the constraint is identical: each move preserves the parity of the coordinate sum $`\sum x_i`$ by changing two coordinates by $`\pm k`$, altering the sum by the even $`(\pm k) + (\pm k)`$. So the $`2`$-bishop is confined to exactly half the board, via the same light/dark restriction as in two dimensions.

The $`N`$-bishop is even more constrained. Each move changes all $`N`$ coordinates by $`\pm k`$, so any two moves that differ in the sign of a single coordinate produce a net displacement of $`2k`$ in that coordinate and $`0`$ in all others. This means the $`N`$-bishop can shift differences between individual coordinates, but only by even amounts. The reachable squares are those where every coordinate shares the same parity: either all coordinates are even or all are odd. On the $`8`$-board, each parity class contains $`4^N`$ squares, so the $`N`$-bishop can reach $`2 \cdot 4^N`$ squares out of $`8^N`$ (a fraction $`2^{1-N}`$ of the board). For $`N = 2`$ this gives $`1/2`$, but for $`N = 10`$ it is less than $`0.2\%`$.

Conversely, the $`S`$-bishop breaks free entirely for $`N \geqslant 3`$. It includes both $`S = 3`$ moves like $`\mathbf{e}_1 + \mathbf{e}_2 + \mathbf{e}_3`$ and $`S = 2`$ moves like $`-\mathbf{e}_2 -\mathbf{e}_3`$. Composing these gives a net displacement of $`\mathbf{e}_1`$, which suffices to generate every square.

**Power.** Let a $`k`$-bishop have the ability to move along precisely $`k`$ out of $`N`$ axes. At a corner, every axis only has one sign available, so a $`k`$-bishop has $`7 \binom{N}{k}`$ moves available at each of the $`2^N`$ corners. At a central square, for $`d=1,2,3`$ every axis has two sign choices, for $`d=4`$ every axis has one, and otherwise none. So from the central $`2^N`$ squares, a $`k`$-bishop may make 

```math
3\cdot 2^k\binom Nk+\binom Nk =(3\cdot 2^k+1)\binom Nk
```

total moves. Averaging over all squares, for a fixed distance $`d`$ to the edge, a random coordinate allows $`+d`$ from $`8-d`$ positions and $`-d`$ from $`8-d`$ positions, so taking the expected number of legal signs on one axis to be $`\frac{8-d}{4}`$ and leveraging independence across coordinates yields:

```math
\mathbb E[R_k]
=\binom Nk \sum_{d=1}^7 \left( \frac{8-d}{4} \right)^k
=\binom Nk \frac1{4^k}\sum_{r=1}^7 r^k
```

For $`k = 2`$, the worst case is $`\frac{7}{2} N(N-1)`$ and the best case $`\frac{13}{2} N(N-1)`$, with an average of $`\frac{35}{8} N(N-1)`$.

For $`k = N`$, the situation is a lot more variable. The worst case is $`7`$ and the best case $`3\cdot 2^N+1`$, with an average of $`4^{-N}(1^N+2^N+3^N+4^N+5^N+6^N+7^N)`$.

For the $`S`$-bishop, we sum over all $`k = 2`$ to $`N`$, since the moves are disjoint. This yields a worst case of $`7(2^N-N-1)`$ and a best case of $`3^{N+1}+2^N-7N-4`$, with an average of

```math
\sum_{r=1}^7 \left[\left(1+\frac r4\right)^N-1-\frac{Nr}{4}\right] = 4^{-N}\left(5^N+6^N+7^N+8^N+9^N+10^N+11^N\right)-7-7N
```

**Speed.** Of course, the $`2`$-bishop and $`N`$-bishop cannot reach the whole board, so their worst-case and average traversal time between squares is infinite. What about the $`S`$-bishop (for $`N \geqslant 3`$)? Not only can it reach the entire board, but it can do so in just *three moves*! A proof of this astounding fact can be found [here](../bishop/).

## Queen

**Power.** Since the rook directions $`S(\mathbf{v}) = 1`$ are disjoint from the bishop directions $`S(\mathbf{v}) \geqslant 2`$, the power of a queen is simply the power of the corresponding bishop plus the rook's constant $`7N`$ moves.

For the $`2`$-queen, this gives a worst case of $`\frac{7}{2}N(N+1)`$ and a best case of $`\frac{1}{2}(13N^2+N)`$, with an average of $`\frac{1}{8}(35N^2+21N)`$.

For the $`N`$-queen, the worst case is $`7(N+1)`$ and the best case $`3 \cdot 2^N + 7N + 1`$, with an average of $`7N + 4^{-N}(1^N+2^N+3^N+4^N+5^N+6^N+7^N)`$.

For the $`S`$-queen, we may equivalently sum over all $`k = 1`$ to $`N`$. This yields a worst case of $`7(2^N-1)`$ and a best case of $`3^{N+1}+2^N-4`$, with an average of

```math
\sum_{r=1}^7 \left[\left(1+\frac r4\right)^N-1\right] = 4^{-N}\left(5^N+6^N+7^N+8^N+9^N+10^N+11^N\right)-7
```

**Speed.** Again the rook component removes the infinite-distance pathology.

For the $`2`$-queen, the gap sizes decouple. If $`n_k = \#\{i : |x_i-y_i| = k\}`$, then a rook move fixes one coordinate from class $`k`$, while a $`2`$-bishop move of length $`k`$ fixes two such coordinates at once. Different $`k`$ never interact, so

```math
d_{2Q}(\mathbf{x},\mathbf{y}) = \sum_{k=1}^7 \left\lceil \frac{n_k}{2} \right\rceil
```

exactly. This gives a worst case of $`N/2 + O(1)`$ (indeed $`\lfloor (N+7)/2 \rfloor`$ once $`N \geqslant 7`$), and an average distance of $`7N/16 + O(1)`$.

For the $`N`$-queen, parity is the key obstruction. After any sequence of $`N`$-bishop moves, every coordinate has changed by an amount with the same parity $`p = \sum k_j \pmod 2`$, so every coordinate whose target gap has the opposite parity still requires a rook move. If $`o`$ and $`e`$ denote the numbers of odd and even gaps, this gives the lower bound $`d_{NQ}(\mathbf{x},\mathbf{y}) \geqslant \min(o,e)`$.

This is sharp up to an additive constant. Four $`N`$-bishop moves of lengths $`1,1,2,2`$ can realise every even gap, while $`1,1,2,3`$ can realise every odd gap, with all intermediate positions staying on the $`8`$-board. Choosing the better of these two templates yields

```math
d_{NQ}(\mathbf{x},\mathbf{y}) = \min(o,e) + O(1)
```

So the worst case is $`N/2 + O(1)`$. For random squares, $`o \sim \operatorname{Bin}(N,1/2)`$, whence the average distance is $`N/2 - \sqrt{N/(2\pi)} + O(1)`$, and in particular $`N/2 + O(\sqrt N)`$.

The $`S`$-queen is much faster than this. Because it contains the $`S`$-bishop, the same three-move construction applies unchanged: for $`N \geqslant 3`$, any square can be reached from any other in at most three moves. In two dimensions, of course, this collapses to the familiar diameter $`2`$.
