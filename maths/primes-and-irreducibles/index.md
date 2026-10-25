---
title: Primes and Irreducibles in Rings
date: 2024-05-29
updated: 2026-10-25
---

In school, you were likely taught that a *prime number* is a number with precisely two positive factors (itself and $`1`$). You were likely also taught a useful property of primes: if $`p \mid ab`$, that is if a prime $`p`$ is a factor of some product of two numbers, then it is a factor of one of those numbers. If $`a \times b = 8645`$, then either $`a`$ or $`b`$ is a multiple of $`5`$. This is generally not true for composite numbers: $`4 \mid 60 = 6 \times 10`$, even though $`4`$ is a factor of neither $`6`$ nor $`10`$.

Unfortunately, this definition is backwards! The latter property is in fact the true essence of a prime number—the former actually describes an *irreducible* number. These coincide among the integers we are familiar with, but they are subtly different. Let's explore these two definitions and see where they come apart.

---

An element $`r`$ in an integral domain (a ring with no nontrivial *zero divisors*: $`a \cdot b = 0_R`$ implies $`a = 0_R`$ or $`b = 0_R`$) $`R`$ is called irreducible if $`r \neq 0_R`$, $`r`$ is not a unit (that is, $`\forall a \in R, a \cdot r \neq 1_R`$), and if $`r = xy`$ then either $`x`$ or $`y`$ is a unit.

Similarly, an element $`r`$ is called prime if $`r \neq 0_R`$, $`r`$ is not a unit, and if $`r \mid xy`$ then either $`r \mid x`$ or $`r \mid y`$. In a ring, an element $`d`$ *divides* an element $`a`$, written $`d \mid a`$, if there exists some element $`r \in R`$ such that $`d \cdot r = a`$.

In the ring of integers $`\mathbb{Z}`$, the primes are in fact exactly the irreducibles. This is not generally true, as we will see in the main example. However, we do have the following result.

## Primes Are Always Irreducible

1. Suppose $`r \in R`$ is a prime, and $`r = a \cdot b`$ for two non-unit elements $`a`$ and $`b`$.
2. Since $`r = 1_R \cdot r`$, we have $`r \mid r = a \cdot b`$. Then, as $`r`$ is prime, $`r \mid a`$ or $`r \mid b`$.
3. Without loss of generality (we're only considering commutative rings here), suppose $`r \mid a`$, ie. $`r \cdot d = a`$ for some $`d \in R`$.
4. Then, $`r = a \cdot b = (r \cdot d) \cdot b = r \cdot (d \cdot b)`$.
5. Then, as we are in an integral domain, $`d \cdot b = 1_R`$, which means $`b`$ is a unit.
6. Thus $`r`$ is irreducible.

## But Not Vice Versa

Now, we look at the ring $`R = \mathbb{Z}[\sqrt{-5}] = \{a + b \sqrt{-5} : a, b \in \mathbb{Z}\} \leq \mathbb{C}`$. As this is a subring of a field (a ring in which every nonzero element is a unit, like $`\mathbb{C}`$), it is an integral domain.

Consider the *norm* function given by

```math
N: R \to \mathbb{N}_0, a + b \sqrt{-5} \mapsto a^2 + 5b^2.
```

Note that this maps $`z \in \mathbb{C}`$ to $`|z|^2`$, and satisfies $`N(z \cdot w) = N(z) \cdot N(w)`$.

This is a really useful property! If $`r \cdot s = 1`$, then

```math
N(r \cdot s) = N(r) \cdot N(s) = N(1) = 1 \implies N(r) = N(s) = 1.
```

So any unit $`a + b \sqrt{-5}`$ has to satisfy $`N(a + b \sqrt{-5}) = a^2 + 5b^2 = 1 \implies a = \pm 1, b = 0`$.

Thus the only *possible* units are $`1`$ and $`-1`$, which are obviously both units (as $`1 \cdot 1 = -1 \cdot -1 = 1`$), so they are precisely the two units of $`R`$.

Note that there are clearly no elements of norm $`2`$ or $`3`$: any such element $`r`$ would be nonzero and require

```math
5b^2 \leq N(r) < 5 \implies b < 1 \implies b = 0, \quad \text{and} \quad N(r) < 4 \implies |a| < 2 \implies a = \pm 1
```

but then these are just the units again, so there are no such elements.

With this in mind, we claim that $`2 \in R`$ is irreducible. Suppose $`2 = a \cdot b`$. Then

```math
N(a) \cdot N(b) = N(2) = 4 \implies N(a) = 1, \; N(b) = 4 \quad \text{ (in some order).}
```

Thus $`a`$ or $`b`$ has norm $`1`$ and so is a unit, hence $`2`$ is irreducible as required.

In the same way, we can demonstrate that the elements $`3, 1 + \sqrt{-5},`$ and $`1 - \sqrt{-5}`$ are irreducible too.

Importantly, $`2`$ does not divide either of $`1 \pm \sqrt{-5}`$. Suppose $`2 \cdot r = 1 \pm \sqrt{-5}`$. Then we would have $`4 \cdot N(r) = 6 \implies N(r) = 1.5`$, which is not possible, as the norm function $`N`$ maps to $`\mathbb{N}_0`$.

Now, note that

```math
(1 + \sqrt{-5}) \cdot (1 - \sqrt{-5}) = 6 = 2 \cdot 3
```

So $`2 \mid 6 = (1 + \sqrt{-5}) \cdot (1 - \sqrt{-5})`$, but neither $`2 \mid (1 + \sqrt{-5})`$ nor $`2 \mid (1 - \sqrt{-5})`$. Thus by definition, $`2`$ cannot be prime in $`R`$.

So in general, irreducible elements in integral domains are *not* necessarily prime.

(Also, factorisation of ring elements into irreducibles is *not* necessarily unique. The rings in which this property holds are called *unique factorisation domains*.)
