---
title: Convergence of Markov Chains
date: 2024-05-20
updated: 2026-10-25
---

Many Markov chains forget where they started: run them for long enough, and they seem to not depend on the initial state. This is what makes long-run averages of a chain meaningful, and also makes sampling methods like Markov Chain Monte Carlo viable.

This is a neat little proof of the requisite proposition: an irreducible aperiodic Markov Chain with an invariant distribution $`\pi`$ converges in distribution to $`\pi`$.

Suppose a transition matrix $`P`$ on a countable state space $`I`$ is irreducible and aperiodic, and moreover that it admits an invariant distribution $`\pi`$. Then for a Markov Chain $`(X_n) \sim \mathrm{Markov}(\lambda, P)`$ for any starting distribution $`\lambda`$, we have

```math
\mathbb{P}\left[ X_n = i \right] \to \pi_i \text{ as } n \to \infty
```

This proof uses a technique called *coupling*. Define a new Markov Chain $`(Y_n) \sim \mathrm{Markov}(\pi, P)`$, and take the coupled $`W_n = (X_n, Y_n)`$. This is a Markov Chain on the state space $`I \times I`$, with transition matrix $`\tilde{P}`$ defined by $`\tilde{p}_{(i,k)(j,l)} = p_{ij}p_{kl}`$ and initial distribution $`\tilde{\lambda}_{(i,k)} = \lambda_i \pi_k`$.

Since $`P`$ is irreducible and aperiodic, $`p_{ij}^{(n)} > 0`$ for all sufficiently large $`n`$. The same therefore holds for $`\tilde{P}`$: it must be irreducible. Moreover, $`\tilde{\pi}_{(i,k)} = \pi_i \pi_k`$ is an invariant distribution for $`\tilde{P}`$, and an irreducible chain with an invariant distribution is positive recurrent, so $`\tilde{P}`$ is positive recurrent.

For an arbitrary reference state $`b`$, define the first passage time of $`W`$ to $`(b, b)`$ to be

```math
T = \inf \{ n \in \mathbb{N} : X_n = Y_n = b \}
```

As $`\tilde{P}`$ is irreducible and recurrent, $`T < \infty`$ with probability 1.

Define a new process $`Z_n`$ which follows $`X_n`$ until time $`T`$ and $`Y_n`$ afterwards. Since both chains are at $`b`$ at time $`T`$, the strong Markov property means $`(Z_n) \sim \mathrm{Markov}(\lambda, P)`$ too, so $`\mathbb{P}[X_n = i] = \mathbb{P}[Z_n = i]`$. Now, note that

```math
\begin{align*}
\mathbb{P} \left[ Z_n = i \right] &= \mathbb{P} \left[ Z_n = i, n < T \right] + \mathbb{P} \left[ Z_n = i, n \geq T \right] \\
&= \mathbb{P} \left[ Z_n = i, n < T \right] + \mathbb{P} \left[ Y_n = i, n \geq T \right] \\
&= \mathbb{P} \left[ Z_n = i, n < T \right] + \pi_i - \mathbb{P} \left[ Y_n = i, n < T \right]
\end{align*}
```

because $`Z_n = Y_n`$ for $`n \geq T`$. Therefore

```math
| \mathbb{P} \left[ X_n = i \right] - \pi_i | = | \mathbb{P} \left[ Z_n = i, n < T \right] - \mathbb{P} \left[ Y_n = i, n < T \right] |
```

The right hand side of this is bounded by $`\mathbb{P} \left[ n < T \right]`$, since both terms lie between $`0`$ and $`\mathbb{P} \left[ n < T \right]`$. This bound tends to $`0`$ as $`n`$ grows to infinity, as $`T`$ is finite with unit probability. Thus the left hand side, which is non-negative, must also tend to $`0`$. Therefore

```math
\mathbb{P}\left[ X_n = i \right] \to \pi_i \text{ as } n \to \infty
```

exactly as required.
