---
title: Laplace's Rule of Succession
date: 2024-06-25
updated: 2024-12-24
---

Suppose you're handed a (possibly biased) coin, and you flip it three times. It comes up **tails**, then **heads**, then **heads** again. What's (your best guess for) the probability it comes up heads on the fourth toss? Most people instinctively say two in three, but according to Laplace's Rule of Succession, it's actually *three in five*, or 60%. What?

Firstly, an intuition pump to disprove the notion that it should be two in three. Suppose instead that the first toss was also heads. Then, would you really say that the coin's chance of landing heads a fourth time was three in three? That would be 100% certainty, which is clearly incorrect. So two in three is wrong too.


## Priors and Posteriors

We're assuming here that the coin has some fixed (but unknown) real probability $`p`$ of landing heads independently on each toss (and thus lands tails with probability $`1-p`$). The insistence on independence does preclude "trick coins", such as one which lands alternately on heads and tails, or lands on heads only prime-numbered tosses. But this goes beyond what we consider a *coin* per se.

Before you see the coin tossed, you have absolutely no information about $`p`$: it can be any real number in the interval $`[0, 1]`$. Your *prior* probability distribution over $`p`$ is thus the *uniform* prior, which distributes your credence equally across this interval.

Now, as you may have guessed, we can use Bayes' rule to update our distribution function after seeing a sequence of tosses, and pick $`p`$ out from there. Under the assumption $`p = p_0`$, the likelihoods of heads and tails are (by definition) $`p_0`$ and $`1 - p_0`$. So if we toss the coin $`n`$ times and get $`r`$ heads, the total likelihood is
```math
L(p_0) = \mathbb{P}(r \text{ heads}, \; n-r \text{ tails} \mid p = p_0) = p_0^r \cdot (1-p_0)^{n-r} \cdot \binom{n}{r}
```
(In fact, the evidence we observed was a particular ordered sequence, though this does not affect any final calculations since we normalise the likelihood anyway when calculating the posterior.)

Since our prior was uniform, the posterior distribution of our beliefs over $`p`$ will be directly proportional to the likelihood. The normalisation constant is given by the reciprocal of the integral of $`L(p)`$ from zero to one.
```math
\begin{align*}
    \int_0^1 L(p) \, \text{d}p &= \int_0^1 p_0^r \cdot (1-p_0)^{n-r} \cdot \binom{n}{r} \, \text{d}p \\
    &= \frac{n!}{r! \cdot (n-r)!} \; \int_0^1 p_0^r \cdot (1-p_0)^{n-r}  \, \text{d}p \\
    &= \frac{n!}{r! \cdot (n-r)!} \cdot \frac{r!\cdot(n-r)!}{\left(n+1\right)!} = \frac{1}{n+1}
\end{align*}
```
So to obtain our final posterior distribution, we multiply the likelihood $`L(p)`$ by $`n+1`$.

## Estimating and Predicting

We are now tasked with finding predicting the coin, which we can do by finding the maximum likelihood estimator (maximising $`f`$). This can be done by finding where the derivative $`\frac{df}{dp} = 0`$.
```math
\begin{align*}
    \frac{df}{dp} &= \frac{d}{dp} \left( p^{r}\cdot\left(1-p\right)^{n-r} \right) \\
    &= rp^{r-1}\cdot\left(1-p\right)^{n-r}-p^{r}\cdot\left(n-r\right)\left(1-p\right)^{n-r-1} \\
    &= \left(p^{r-1}\cdot\left(1-p\right)^{n-r-1}\right)\left(r\left(1-p\right)-p\left(n-r\right)\right) = 0
\end{align*}
```
The first term is only zero at the endpoints $`p = 0`$ and $`p = 1`$. At these points, $`f(p) = 0`$ too. Since $`f`$ integrates to 1 along $`[0,1]`$, it cannot be identically 0, and in particular it cannot have maximum 0. So we seek the second bracket being zero. This happens when
```math
\left(r\left(1-p\right)-p\left(n-r\right)\right) = r-pr-pn+pr = r - pn = 0  \implies p = \frac{r}{n}
```
Wait, what? This was one of our originally intuitive answers, which we determined was clearly wrong! What mistake have we made?

In fact, the mistake was searching for the maximum likelihood estimator in the first place. This is the *best point estimate* for $`p`$, but it is **not** the best guess for the probability of the coin landing heads. This is a subtle difference, but it turns out to be important.

When guessing the best point estimate, we want the modal value of $`p`$ (to maximise our chance of getting our *guess* right). But when we're guessing the probability of the coin coming up heads, this is a meaningless quantity! What we instead want is the *expected value* of $`p`$:
```math
\begin{align*}
    \mathbb{P}[\text{heads}] &= \mathbb{E}[p] = \int_0^1 p \cdot f(p) \, \text{d}p = \int_0^1 p \cdot (n+1) \cdot p^r \cdot (1-p)^{n-r} \cdot \binom{n}{r} \, \text{d}p \\
    &= \frac{\left(n+1\right)!}{r!\cdot\left(n-r\right)!}\int_{0}^{1}p^{r+1}\cdot\left(1-p\right)^{n-r} \, \text{d}p = \boxed{\frac{r+1}{n+2}}
\end{align*}
```
In the original example of `THH`, we have $`n = 3`$ and $`r = 2`$. This rule gives us $`3/5`$, exactly as I claimed.

## Historical Context

This is a fairly neat result! It was first popularised by French mathematician Pierre-Simon Laplace.

![An excerpt from Essai philosophique sur les probabilités, written by Laplace in 1840.](laplace-essay.avif)

He writes:
```quote-quote
On trouve ainsi qu'un évènement étant arrivé de suite un nombre quelconque de fois, la probabilité qu'il arrivera encore la fois suivante est égale à ce nombre augmenté de l'unité, divisé par le même nombre augmenté de deux unités.
```
which translates from the original French into
```quote-quote
We thus find that when an event has occurred in succession any number of times, the probability that it will occur again the next time is equal to this number increased by one, divided by the same number increased by two units.
```
This is the special case where $`n = r`$! In fact, he applied this to the original problem of being appropriately confident that the sun will rise again tomorrow morning, having seen it observe some large number of times.

## [Interactive Model](interactive)

Here's an interactive version to play around with! Use the sliders to control the values of $`n`$ and $`r`$. Notice how the credence function $`f`$ peaks at $`r/n`$, but the skew of the curve puts the expectation closer to the middle.

