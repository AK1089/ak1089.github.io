---
title: The S-Bishop in Three Moves
date: 2026-03-08
address_bar_title: The S-Bishop in Three Moves
---

The most surprising piece in this family is the $`S`$-bishop, which may move the same distance along any set of axes of size two or greater. Although it is defined purely in terms of diagonal motion, for $`N \geqslant 3`$ it can access the entire board. This is easy to see via the pair of moves $`\mathbf{e}_i + \mathbf{e}_j + \mathbf{e}_k`$ followed by $`-\mathbf{e}_j-\mathbf{e}_k`$, which combine to form the unit displacement $`\mathbf{e}_i`$. More surprising than this reach is just how fast it can travel.

**Theorem.** For $`N \geqslant 3`$, the $`S`$-bishop can access any square from any starting square in at most three moves.

<!-- If you wish to test this yourself... -->

---

In dimensions $`N \geqslant 4`$, we prove the stronger claim that we may access any square in *precisely* three moves, where also the lengths of these moves follow one of four very specific patterns: the length sequences $`(4, 2, 1)`$, $`(4, 1, 3)`$, and their reverses $`(1, 2, 4)`$ and $`(3, 1, 4)`$.

**Proposition 1.** For any pair of start and end squares on the $`N = 4`$ board, there exists a sequence of three valid moves from the start square to the end square whose lengths follow one of these four patterns.

*Proof.*

Fix a pattern $`(\ell_1,\ell_2,\ell_3)`$. For a single coordinate, say from $`a`$ to $`b`$, call a triple

```math
(\delta_1,\delta_2,\delta_3)\in\{0,\pm\ell_1\}\times\{0,\pm\ell_2\}\times\{0,\pm\ell_3\}
```

*admissible* if the intermediate moves

```math
a+\delta_1,\qquad a+\delta_1+\delta_2,\qquad a+\delta_1+\delta_2+\delta_3=b
```

all lie in $`\{0,\dots,7\}`$. Choosing such a triple independently for each of the four coordinates produces three displacement vectors

```math
\mathbf{m}_j=(\delta_{1,j},\delta_{2,j},\delta_{3,j},\delta_{4,j}) \qquad (j=1,2,3),
```

and conversely every three-move path of this pattern determines four such one-dimensional triples. Thus the whole problem factorises by coordinate, except for one global condition: each move must be a genuine bishop move, so it must be active on at least two coordinates.

To track this, for an admissible triple we record only its *support mask*

```math
(\mathbf{1}_{\delta_1\neq 0},\mathbf{1}_{\delta_2\neq 0},\mathbf{1}_{\delta_3\neq 0})\in\{0,1\}^3.
```

If each coordinate is admissible as above, a valid $`4`$-dimensional path exists exactly when we may choose one support mask for each coordinate so that, in each of the three positions, at least two of the four masks contain a $`1`$. No other interaction between the coordinates remains.

There are only $`8^2=64`$ possible ordered pairs $`(a,b)`$ in one coordinate. Since the four coordinates may be permuted, it suffices to check multisets of four such coordinate-pairs rather than all $`8^8`$ start/end pairs.

The explicit enumeration of all $`\binom{64+4-1}{4}=766{,}480`$ cases in `verify.py` proves the proposition. $`\square`$

---

Having shown the argument for $`N = 4`$, we lift the valid move sequences to higher-dimensional boards.

**Proposition 2.** For $`N > 4`$, we may construct this sequence of three moves on the first four dimensions, and then selectively add the other dimensions to a subset of these moves in order to travel the correct distance in them too, without breaking validity of any move.

*Proof.*

Take start and end points $`\mathbf{x}=(x_1,\dots,x_N),\qquad \mathbf{y}=(y_1,\dots,y_N)`$, and apply Proposition 1 to the first four coordinates. This gives three moves of some fixed pattern $`(\ell_1,\ell_2,\ell_3)`$ which travel $`(x_1,x_2,x_3,x_4)\mapsto(y_1,y_2,y_3,y_4)`$. Now fix any extra coordinate $`r\geqslant 5`$. We seek increments

```math
(\varepsilon_{r,1},\varepsilon_{r,2},\varepsilon_{r,3})
\in
\{0,\pm\ell_1\}\times\{0,\pm\ell_2\}\times\{0,\pm\ell_3\}
```

such that

```math
x_r+\varepsilon_{r,1},\qquad
x_r+\varepsilon_{r,1}+\varepsilon_{r,2},\qquad
x_r+\varepsilon_{r,1}+\varepsilon_{r,2}+\varepsilon_{r,3}=y_r
```

all remain on the board. This is now a one-dimensional problem, and again there are only four patterns and $`64`$ ordered pairs $`(x_r,y_r)`$. It is easy to check directly that in each of the $`4 \times 64`$ cases, at least one such triple exists.

So for every extra coordinate $`r`$ we choose one admissible triple and append $`\varepsilon_{r,j}`$ to the $`j^{\text{th}}`$ move. Every intermediate point still lies in $`\{0,\dots,7\}^N`$. As the first four coordinates already made each move active on at least two axes, adding extra coordinates cannot turn a legal move into an illegal one. Hence the $`4`$-dimensional construction lifts unchanged to all dimensions $`N>4`$. $`\square`$

---

Propositions 1 and 2 prove the precise three-move claim for all $`N \geqslant 4`$, and therefore prove the theorem in these dimensions. The strong claim does not hold for the case $`N = 3`$, but fortunately we may find other sequences of at most three moves by brute force.

**Proposition 3.** On the $`N = 3`$ board, every pair of squares is joined by an $`S`$-bishop path of length at most three.

*Proof.*

At $`N=3`$, the entire board is small enough to work with directly: among the $`(8^3)^2 = 262{,}144`$ ordered pairs of squares, $`19{,}712`$ lie at distance $`1`$, $`181{,}824`$ at distance $`2`$, and $`60{,}096`$ at distance $`3`$.

Thus the theorem also holds for $`N=3`$. $`\square`$

---

Combining the three propositions proves the theorem for every $`N \geqslant 3`$.
