---
title: On the Divergence of the Sum of Prime Reciprocals
date: 2026-04-05
address_bar_title: Prime Reciprocals
---

It is a [well-known result](https://en.wikipedia.org/wiki/Harmonic_series_(mathematics)#Definition_and_divergence) that the sum of $`1/n`$ over integers $`n \in \mathbb{N}`$ diverges, as one can write:

```math
\begin{align*}
&1+ \frac{1}{2} + \frac{1}{3} + \frac{1}{4} + \frac{1}{5} + \frac{1}{6} + \frac{1}{7} + \frac{1}{8} + \frac{1}{9} + \frac{1}{10}  + \cdots \\
\geqslant \ &1+ \underbrace{\frac{1}{2}}_{1/2} + \underbrace{\frac{1}{\mathbf{4}} + \frac{1}{4}}_{1/2} + \underbrace{\frac{1}{\mathbf{8}} + \frac{1}{\mathbf{8}} + \frac{1}{\mathbf{8}} + \frac{1}{8}}_{1/2} + \underbrace{\frac{1}{\mathbf{16}} + \frac{1}{16} + \cdots}_{1/2} + \cdots = \infty
\end{align*}
```

which is at least one plus infinitely many halves, and therefore infinite. It is less well-known that the same series but with only prime denominators *also* diverges; that is:

```math
\frac{1}{2} + \frac{1}{3} + \frac{1}{5} + \frac{1}{7} + \frac{1}{11} + \frac{1}{13} + \cdots = \infty.
```

Here, I prove this, and end with a surprising fact about the speed of this divergence.

## Part 1: Using the FTA

Consider the infinite product

```math
\prod_{p \text{ prime}} (1 + p^{-1} + p^{-2} + p^{-3} + \cdots).
```

When we expand it out, each term in the expansion is the product of $`p^{k_p}`$ for each prime $`p`$. By the [Fundamental Theorem of Arithmetic](https://en.wikipedia.org/wiki/Fundamental_theorem_of_arithmetic), every integer $`n`$ can be represented in this form in precisely one way. So expanding this out, we have:

```math
A_N = \prod_{p \text{ prime } \leqslant N} (1 + p^{-1} + p^{-2} + p^{-3} + \cdots) = \sum_{n \in P_N} \frac{1}{n} \geqslant \sum_{n = 1}^N \frac{1}{n}
```

where $`P_N`$ is the set of integers $`n`$ whose prime factors are all at most $`N`$, which in particular includes every integer up to $`N`$. Taking the limit as $`N \to \infty`$ on both sides shows that $`A_N \to \infty`$.

## Part 2: A Smaller Product

Now, we want to show that a similar product, with each factor being truncated after two terms rather than involving the whole series, also diverges:

```math
B_N = \prod_{p \text{ prime } \leqslant N} (1 + 1/p) \to \infty.
```

We can do this using the divergence of the above series: we compute the ratio of each factor. In particular, for each $`p`$, consider:

```math
\frac{1 + 1/p + 1/p^2 + 1/p^3 + \cdots}{1 + 1/p} = 1 + 1/p^2 + 1/p^4 + 1/p^6 + \cdots = \frac{1}{1-1/p^2}.
```

using regular division for the first equality, and the geometric series formula for the second. So the truncated partial products have the following ratio:

```math
\frac{A_N}{B_N} = \left[ \prod_{p \text{ prime } \leqslant N} (1 + 1/p + 1/p^2 + \cdots) \right] \div 
\left[ \prod_{p \text{ prime } \leqslant N} (1 + 1/p) \right] = \prod_{p \text{ prime } \leqslant N} \frac{1}{1-1/p^2}.
```

Now, we use the bound $`1/(1-x) \leqslant e^{2x}`$ for $`0 \leqslant x \leqslant \frac{1}{2}`$. This yields:

```math
\prod_{p \text{ prime}} \frac{1}{1-1/p^2}
\leqslant \prod_{p \text{ prime}} e^{2/p^2}
= \exp\left(2\sum_{p \text{ prime}} 1/p^2\right) 
\leqslant \exp\left(2\sum_{n=1}^{\infty} 1/n^2\right)
= \exp(\pi^2/3).
```

This is finite (indeed, it is approximately $`26.84`$). So the ratio between $`A_N`$ and $`B_N`$ is bounded above by some finite constant uniformly in $`N`$, and so $`B_N`$ must also diverge.

## Part 3: Logarithmic Bound

Now, we are almost there! We can take the logarithm of this divergent product, and apply the result that $`\log(1 + 1/p) \leqslant 1/p`$:

```math
\log(B_N)
= \log \left( \prod_{p \text{ prime } \leqslant N} (1 + 1/p) \right)
= \sum_{p \text{ prime } \leqslant N} \log(1 + 1/p)
\leqslant \sum_{p \text{ prime } \leqslant N} 1/p
= S_N.
```

But $`B_N \to \infty`$, and therefore $`\log(B_N) \to \infty`$, which means $`S_N \to \infty`$ as desired. $`\square`$

---

Now, what about real life? We know that this sum of prime reciprocals diverges to infinity, so it gets arbitrarily large, crossing any finite number you can think of. But in fact, the sum of $`1/p`$ over *known* primes $`p`$ is... less than 4.

This beautiful result follows from the [second theorem](https://en.wikipedia.org/wiki/Mertens%27_theorems#Second_theorem) of Franz Mertens, which states that:

```math
\lim_{n \to \infty} \left( \sum_{p \text{ prime } \leqslant n} 1/p - \log \log n \right) = M \approx 0.261497.
```

In particular, the deviation from this limit is at most

```math
\delta_n = \frac{4}{\log(n+1)} + \frac{2}{n \log n}.
```

Now, choose $`N = 10^{15}`$, and generously assume we know every prime up to this level. We see that:

```math
\begin{align*}
    \sum_{p \text{ prime } \leqslant 10^{15}} 1/p &= \log \log 10^{15} + M + \frac{4}{\log(10^{15}+1)} + \frac{2}{10^{15} \log 10^{15}} \\
    &\leqslant 3.542 + 0.262 + 0.116 + 0.001 = 3.921
\end{align*}
```

Now, what about the known primes above this? Well,

```math
\sum_{p \text{ known prime } > 10^{15}} 1/p
\leqslant \sum_{p \text{ known prime } > 10^{15}} 1/10^{15}
\leqslant \text{number of known primes above this threshold} \times 1/10^{15}.
```

We certainly know far far fewer than a trillion of these, so let us use this bound, yielding a contribution of only $`10^{12}/10^{15} = 0.001`$.

The total contribution, using the *extremely* generous assumption that we know every prime up to $`10^{15}`$ and a trillion beyond, is thus at most $`3.922`$. Summing up just the first fifty terms yields

```math
\frac{1}{2} + \frac{1}{3} + \frac{1}{5} + \frac{1}{7} + \cdots + \frac{1}{229} = 1.9670,
```

which is already most of the way there!
