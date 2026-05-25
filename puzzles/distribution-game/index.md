---
title: The Distribution Game
date: 2026-12-24
---

This puzzle concerns a two-player game, which we set up as follows.

```quote-question
Two players choose a probability distribution over $`[0, \, \infty)`$ with mean $`\mu = 1`$. Then, each player independently draws a number from their distribution. The player with the highest number wins (in the event of a tie, the game is replayed). What is the Nash equilibrium?
```

**Spoiler wall!** Read past here when you want to know the answer.

---

## Solution

In fact, the equilibrium is for both players to select ||the uniform distribution on $`[0, \, 2]`$||.

It's easy to show that this strategy cannot be beaten. Suppose the first player chooses this strategy, and the second player chooses the distribution $`f(x)`$. Then the probability that they win is

```math
p(x) \coloneqq \mathbb{P}[\text{win} \mid x] = \begin{cases}
    \tfrac{1}{2} x & \text{if } x \leqslant 2 \\
    1 & \text{otherwise}
\end{cases}
```

which is at most $`\tfrac{1}{2} x`$ in either case. We can then find the overall probability of winning as:

```math
\mathbb{P}[\text{win}] =
\int_0^\infty p(x) \cdot f(x) \ dx
\leqslant
\int_0^\infty \frac{1}{2} x \cdot f(x) \ dx
=
\frac{1}{2}
```

since the latter integral is half the mean of the second player's distribution, which is $`1`$.

So whatever they choose, the second player cannot win more than half the time. Of course, they draw with probability zero, so this strategy is unbeatable.

```quote-question
Now, consider the same game, but with a distribution over the non-negative integers $`\mathbb{N}_0`$. What is the equilibrium?
```

Suppose the optimal strategy assigned a probability $`p_0`$ to $`0`$, $`p_1`$ to $`1`$, $`p_2`$ to $`2`$, and $`p_+`$ to numbers greater than $`2`$ in aggregate. Then $`p_1 + 2p_2 + 3p_+ \leqslant \mu = 1`$.

If $`p_+ > 0`$, then $`2(p_2 + p_+) \leqslant 1 - p_1 - p_+ < 1`$, so $`p_2 + p_+ < \frac{1}{2}`$, and then $`p_0 + p_1 > \frac{1}{2}`$. But this means the admissible distribution which chooses $`0`$ or $`2`$ with equal probability wins more than half the time, so the other distribution is not optimal! Therefore $`p_+ = 0`$.

Any optimal distribution therefore assigns probability $`p_0`$ to $`0`$, $`p_1`$ to $`1`$, $`p_2`$ to $`2`$, and zero probability to any other outcome. Since $`\mu = p_1 + 2p_2 = 1`$ and $`p_0 + p_1 + p_2 = 1`$, these distributions are characterised by:

```math
f_a(n) = \begin{cases}
    a    & n = 0 \\
    1-2a & n = 1 \\
    a    & n = 2
\end{cases}
```

for some $`0 \leqslant a \leqslant \tfrac{1}{2}`$, with zero probability assigned to other outcomes.

