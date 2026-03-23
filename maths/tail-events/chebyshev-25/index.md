---
title: Chebyshev on a Sample Mean
date: 2026-03-23
---

*Inspired by [this tweet](https://x.com/sauers_/status/2036121179702940090).*

Take a random variable $`X`$ with mean $`\mu`$ and finite variance $`\sigma^2 < \infty`$. Without loss of generality, let $`\mu = 0`$ and $`\sigma = 1`$. Then for $`M\coloneqq\frac1{25}\sum_{i=1}^{25}X_i`$, we have mean zero and variance $`1/25`$.

Consider $`p\coloneqq\mathbb{P}(|M|\leqslant 2)`$. We know from Chebyshev that $`p \geqslant 0.99`$. Can we do better?

**Claim.** There exists $`p^* > 0.99`$ such that $`p \geqslant p^*`$.

**Proof.** Let $`q\coloneqq 1-p = \mathbb{P}(|M|>2)`$. Then $`q\leqslant 0.01`$, and

```math
\frac{1}{25} = \mathbb{E}[M^2] = \mathbb{E}[M^2; |M|\leqslant 2] + \mathbb{E}[M^2; |M|>2] \geqslant 4 \cdot \mathbb{P}(|M|>2) = 4q.
```

Suppose by way of contradiction that $`0.99`$ were sharp. Take a sequence of random variables with $`q_n\to 0.01`$. Here:

```math
\begin{align*}
    \frac1{25}-4q_n &= \mathbb{E}[M_n^2;|M_n|\leqslant 2] + \mathbb{E}[M_n^2;|M_n|>2] - 4 \cdot \mathbb{P}(|M_n|>2) \\
    &= \mathbb{E}[M_n^2;|M_n|\leqslant 2] + \mathbb{E}[(M_n^2-4);|M_n|>2] \to 0.
\end{align*}
```

Both terms are non-negative and so must both approach zero. Since the events $`|M_n| \leqslant 2`$ and $`|M_n| > 2`$ both occur with a probability of at least $`0.005`$ uniformly for sufficiently large $`n`$, we have:

```math
\begin{align*}
    \mathbb{E}[M_n^2;|M_n|\leqslant 2] &\geqslant 0.005 \cdot \mathbb{E}[M_n^2 - 4 \mid |M_n|\leqslant 2] \to 0 \\
    \mathbb{E}[M_n^2;|M_n| > 2] &\geqslant 0.005 \cdot \mathbb{E}[M_n^2 - 4 \mid |M_n| > 2] \to 0;
\end{align*}
```

that is, the conditional expectations approach zero too. Thus the sequence of $`M_n`$ converges in distribution to the three-point distribution where $`M \in \set{-2, 0, +2}`$ almost surely. To fix the mean and variance, we must have:

```math
M_\infty = \begin{cases}
    -2 & \text{with probability 0.005} \\
    0 & \text{with probability 0.99} \\
    +2 & \text{with probability 0.005}
\end{cases}
```

But that is impossible. Clearly, $`X`$ cannot be degenerate (otherwise $`p = 1 > 0.99`$). Thus the support of $`X`$ contains at least two distinct points $`a < b`$, and so the support of $`M`$ contains at least twenty-six distinct points $`(a + \frac{k}{25}(b-a))_{k=0}^{25}`$.

---

Above, we used the fact that while Chebyshev is tight, not every distribution (and indeed no distribution which saturates Chebyshev) can be attained by averaging 25 independent copies of a random variable. How close can we get?

Let $`X_a`$ be the random variable taking on values:

```math
X_a=
\begin{cases}
-a& \text{with probability } \dfrac{1}{2a^2} \\
0&  \text{with probability } 1-\dfrac{1}{a^2} \\
+a& \text{with probability } \dfrac{1}{2a^2}
\end{cases}
```

for values of $`a > 50`$. Note that each $`X_a`$ has zero mean and variance $`\mathbb{E}[X_a^2] = a^2 \cdot 1/a^2 = 1`$. Among the 25 samples, let $`N^+`$ and $`N^-`$ be the count of $`+a`$ and $`-a`$ respectively. Then $`M_a = \frac{1}{25} a(N^+ - N^-)`$.

The critical event is $`|M_a| = \frac{1}{25} a|N^+ - N^-| \leqslant 2`$, so $`a|N^+ - N^-| \leqslant 50`$. Since $`a > 50`$ and the $`N^\pm`$ are integers, this is equivalent to the event $`N^+ = - N^-`$: write $`p(a) = \mathbb{P}(N^+ = - N^-)`$.

```math
p(a)
=
\sum_{k=0}^{12}
\frac{25!}{k!\,k!\,(25-2k)!}
\left(\frac{1}{2a^2}\right)^{2k}
\left(1-\frac1{a^2}\right)^{25-2k}.
```

This is continuous and increasing in $`a`$, and as $`a \to 50`$, $`p(a) \to p(50) \approx 0.99007163`$. We can get arbitrarily close to this number, which means it is the best bound we can hope to achieve. Thus there exists some infimum satisfying $`0.99 < p^* \leqslant 0.99007163`$.

**Conjecture.** The upper bound here is tight: $`p^* = 0.99007163`$.