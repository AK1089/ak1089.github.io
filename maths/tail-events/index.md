---
title: Chebyshev's Inequality and 25SD Events
date: 2025-02-08
---

In 1867, Russian mathematician Pafnuty Chebyshev proved a general property of random variables governing their spread, building on earlier work by his friend and colleague Irénée-Jules Bienaymé. Later, his student Andrey Markov (of Markov chain fame) would expand upon his study.

This inequality has come to be known as *Chebyshev's inequality*, though this name is also often used to refer to *Markov's inequality*. Here, I prove both. The statements of the inequalities are as follows:


## Statement of Markov's Inequality

For any non-negative integrable random variable $`X`$ and any $`a \in \mathbb{R}`$, we have:

```math
a \times \mathbb{P}[X \geqslant a] \leqslant \mathbb{E}[X].
```

## Statement of Chebyshev's Inequality

For any random variable $`X`$ with finite nonzero variance $`\sigma^2`$ and finite mean $`\mu`$, and any $`k > 0`$, we have:

```math
\mathbb{P}[|X - \mu| \geqslant k \sigma] \leqslant 1/k^2.
```

## Proof of Markov's Inequality

Consider the indicator random variable $`\mathbf{1}_{\{ X \geqslant a \}}`$, defined by

```math
\mathbf{1}_{\{ X \geqslant a \}} = \begin{cases}
1 & X \geqslant a \\
0 & \text{otherwise}
\end{cases}
```

Notice that $`X \geqslant a \times \mathbf{1}_{\{ X \geqslant a \}}`$ no matter its value. Taking expectations yields

```math
\mathbb{E}[X] \geqslant a \times \mathbb{E}[\mathbf{1}_{\{ X \geqslant a \}}] = a \times \mathbb{P}[X \geqslant a]
```

which proves the inequality.

## Proof of Chebyshev's Inequality

Since $`k`$ and $`\sigma`$ are positive, we can square the inequality inside the brackets of the left hand side to obtain the equivalent condition (and hence equivalent probability):

```math
\mathbb{P}[(X - \mu)^2 \geqslant k^2 \sigma^2]
```

Now, apply Markov's inequality to the non-negative random variable $`(X - \mu)^2`$ with $`a = k^2 \sigma^2`$:

```math
k^2 \sigma^2 \times \mathbb{P}[(X - \mu)^2 \geqslant k^2 \sigma^2] \leqslant \mathbb{E}[(X - \mu)^2]
```

The right hand side is, by definition, the variance of $`X`$, which is $`\sigma^2`$. Recall that $`k^2 \sigma^2 > 0`$, so we can divide through to obtain the inequality

```math
\mathbb{P}[(X - \mu)^2 \geqslant k^2 \sigma^2] \leqslant 1/k^2
```

exactly as required.

## Black Swans

When people talk about highly unexpected events (*black swans*, per Nassim Nicholas Taleb), they often refer to events which are some extreme number of standard deviations "out of distribution". David Viniar, the CFO of Goldman Sachs during the 2008 financial crisis, [famously remarked](https://www.reuters.com/article/breakingviews/goldmans-mr-25-standard-deviation-hard-to-follow-idUS1668058685/) that the firm's analysts "were seeing things that were 25-standard deviation events, several days in a row".

Of course, most financial models are based on an approximately [normal](/maths/probability-distributions#normal) (or perhaps [log-normal](/maths/probability-distributions#lognormal)) distribution. Here, the probability of an event more than 25 standard deviations from the mean is less than one part in $`1.6 \times 10^{137}`$. For context, if each atom in the universe generated a trillion normally distributed random variables every picosecond since the start of the universe, the chance that we would have seen a 25SD event since the universe began is less than one in a quadrillion!

## Chebyshev's Looseness

What Chebyshev's inequality shows us is that a 25SD event isn't always quite as rare as the normal distribution would have you believe. One in 625 is still moderately rare (0.16%), but certainly not as extreme as one in $`1.6 \times 10^{137}`$. However, how rare actually *are* 25SD events? That is, is the Chebyshev bound at all tight? We consider a few other distributions.

For the [exponential distribution](/maths/probability-distributions#exponential), we have $`\mu = \sigma = 1/\lambda`$, and so (since the distribution is non-negative) we only look at the right tail. Here, we seek the probability that $`X > 26/\lambda`$, which is given by $`\exp(-26)`$, equal to roughly one part in 200 billion ($`1.95 \times 10^{12}`$).

Meanwhile, consider a famously fat-tailed distribution, like [Student's t-distribution](/maths/probability-distributions#students) with 3 degrees of freedom (the minimum to ensure finite variance). This $`t_3`$ distribution has $`\sigma = \sqrt{3}`$. Its survival function decays like a power law (inverse-cubically); the probability of our 25SD event is just under one in 100 thousand.

For an even sillier example, the [uniform distribution](/maths/probability-distributions#uniform) on an interval $`[a, b]`$ has standard deviation equal to $`\ell/\sqrt{12}`$, where $`\ell = b-a`$ is the length of the interval. But in fact this distribution has bounded support, so $`X`$ can only differ from the mean by at most half the length of the interval $`\ell/2`$. This means we cannot possibly have even a 2SD event, let alone a 25SD event!

So even for fairly fat-tailed distributions, Chebyshev's inequality is really quite a loose bound on the improbability of tail events. However, it is still cool that we have any sort of nontrivial bound whatsoever that is totally independent of the shape of the distribution!