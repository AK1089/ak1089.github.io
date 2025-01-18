---
title: A Guide to Continuous Probability Distributions
date: 2025-01-17
address_bar_title: Probability Distributions
---

A continuous probability distribution is a function $`F_X: \mathbb{R} \to [0, 1]`$ which describes a random variable $`X`$. When a sample of $`X`$ is taken, the probability of $`X`$ lying below a given value is governed by the distribution, according to the law $`\mathbb{P}[X \leqslant x] = F_X(x)`$.

Specifically, this means that $`F_X`$ satisfies:

- Non-decreasing: $`a \leqslant b \implies F_X(a) \leqslant F_X(b)`$.
- Continuous: $`\lim_{x \to x_0} F_X(x) = F_X(x_0)`$ for all $`x_0`$.
- Limits at infinity: $`\lim_{x \to -\infty} F_X(x) = 0`$ while $`\lim_{x \to +\infty} F_X(x) = 1`$.

This $`F_X`$ is called the *cumulative distribution function*, or CDF. When its derivative $`F'_X`$ exists, it is given the label $`f_X`$ and called the *probability density function*, or PDF.

On this page, I catalogue every probability density function which is important or famous enough to deserve a name, and provide a set of summary statistics and properties.

----------

<h2 id="uniform">The Uniform Distribution</h2>

The uniform distribution is extremely simple: heuristically, every same-sized subinterval within a finite support interval has an equal probability of occurring. It was first named by James Victor Uspensky in his 1937 book *Introduction to Mathematical Probability*, though it has been used for centuries beforehand.
```math
    \begin{align*}
    \text{PDF}: f(x) &=
        \begin{cases}
        \frac{1}{b-a} & a \leqslant x \leqslant b \\
        0 & \text{otherwise}
        \end{cases} \\
    \text{CDF}: F(x) &=
        \begin{cases}
        0 & x \leqslant a \\
        \frac{x-a}{b-a} & a \leqslant x \leqslant b \\
        1 & b \leqslant x
        \end{cases} \\
    \end{align*}
```

The distribution is parameterised by two real numbers:

- $`a \in \mathbb{R}`$ is the *start*. It controls the lower bound of the distribution.
- $`b > a`$ is the *end*. It controls the upper bound of the distribution.

A standard uniform distribution (usually implemented as the basic "random" function on computers) takes $`a = 0`$ and $`b = 1`$.

The moments of the uniform distribution are:

```math
    \begin{align*}
    \text{Mean} &= \frac{1}{2}(a+b) \\
    \text{Variance} &= \frac{1}{12}(b-a)^2 \\
    \text{Skewness} &= 0 \\
    \text{Kurtosis} &= 1.8 \\
    \mathbb{E}\left[ \left( \frac{X-\mu}{\sigma} \right)^n \, \right] &=
        \begin{cases}
            \frac{\sqrt{3}^{n}}{n+1} & n \text{ even} \\
            0 & n \text{ odd} \\
        \end{cases} \\
    \end{align*}
```

with the quantiles given by

```math
    \begin{align*}
        Q(p) = F^{-1}(p) &= a + p(b-a) \\
        \text{Median} &= Q(1/2) = \frac{1}{2}(a + b) \\
        \text{Mode} &= \text{any value in } [a, \, b] \\
        \text{Support} &= [a, \, b]
    \end{align*}
```

The uniform distribution has a few basic properties:

- **Uniformity**: the PDF is constant across the support, so any subinterval $`I = [x, \, x+l] \subseteq [a, \, b]`$ of length $`l`$ has probability $`\mathbb{P}[X \in I] = \frac{l}{b-a}`$.
- **Symmetry**: as a result, the PDF is symmetrical about the mean of the distribution.
- **Coincident Averages**: the mean and median of the distribution coincide: this value is also modal (as is every value within the support).
- **Linearity**: the CDF of the uniform distribution is linear on the entire support. In fact, this is the *only* distribution with this property.
- **Invariances**: if $`X`$ is uniformly distributed, so is $`\lambda X + c`$ for any $`\lambda \neq 0`$.

Suppose $`X_1, X_2, X_3, \ldots `$ is an iid. sequence of standard uniform random variables. Then

- The exponentiation $`X_1^n`$ follows a [Beta distribution](#beta) with shape $`\alpha = 1/n`$ and $`\beta = 1`$.
- In fact, the uniformly distributed $`X_1`$ is a special case of the Beta distribution with shape and scale $`1`$.
- The average $`\frac{1}{n} \sum_{k=1}^n X_k`$ follows a standard [Bates distribution](#bates).
- The sum $`X_1 + X_2`$ follows a [triangular distribution](#triangular) with start $`0`$, end $`2`$, and mode $`1`$.
- The absolute difference $`|X_1 - X_2|`$ follows another triangular distribution with start $`0`$, end $`1`$, and mode $`0`$.
- The scaling $`l X_1 + a`$ for $`l > 0`$ is itself uniformly distributed with start $`a`$ and end $`a + l`$.

The uniform distribution frequently arises in situations where there's no bias towards any particular value. For example, in a well-mixed thermal bath, the starting phase of oscillating particles is uniformly distributed in the interval $`[0, \, 2\pi]`$.

----------

<h2 id="exponential">The Exponential Distribution</h2>

The exponential distribution models the time between independent events occurring at a constant average rate. It was first derived by Agner Krarup Erlang in 1909 while studying telephone call arrivals, though similar work appeared earlier in kinetic theory. The distribution is characterized by the memoryless property: knowing an exponential process has lasted time $`t`$ doesn't change the distribution of the remaining time.

```math
    \begin{align*}
    \text{PDF}: f(x) &=
        \begin{cases}
        \lambda e^{-\lambda x} & x \geqslant 0 \\
        0 & x < 0
        \end{cases} \\
    \text{CDF}: F(x) &=
        \begin{cases}
        1 - e^{-\lambda x} & x \geqslant 0 \\
        0 & x < 0
        \end{cases} \\
    \end{align*}
```

The distribution is parameterised by a single positive real number:

- $`\lambda > 0`$ is the *rate* parameter. It controls how quickly the exponential decay occurs.

Sometimes the distribution is instead parameterised by $`\beta = \frac{1}{\lambda}`$, called the *scale* parameter. The standard exponential distribution takes $`\lambda = 1`$.

The moments of the exponential distribution are:

```math
    \begin{align*}
    \text{Mean} &= 1/\lambda \\
    \text{Variance} &= 1/\lambda^2 \\
    \text{Skewness} &= 2 \\
    \text{Kurtosis} &= 9 \\
    \mathbb{E}[X^n] &= n!/\lambda^n \\
    \end{align*}
```

with the quantiles given by

```math
    \begin{align*}
        Q(p) = F^{-1}(p) &= -\frac{\ln(1-p)}{\lambda} \\
        \text{Median} &= \frac{\ln(2)}{\lambda} \\
        \text{Mode} &= 0 \\
        \text{Support} &= [0, \, \infty)
    \end{align*}
```

The exponential distribution has several important properties:

- **Memorylessness**: for any $`s, t \geqslant 0`$, $`\mathbb{P}[X > s+t \mid X > s] = \mathbb{P}[X > t]`$.
- **Constant Hazard Rate**: the hazard function $`h(x) = \frac{f(x)}{1-F(x)} = \lambda`$ is constant.
- **Maximum Entropy**: among all continuous distributions with support $`[0,\infty)`$ and mean $`\mu`$, the $`\mathrm{Exponential}(1/\mu)`$ distribution has maximum entropy.
- **Scaling**: if $`X`$ is exponential with rate $`\lambda`$, then $`cX`$ is exponential with rate $`\lambda/c`$ for $`c > 0`$.

Suppose $`X_1, X_2, X_3, \ldots`$ is an iid. sequence of exponential random variables with rate $`\lambda`$. Then:

- The sum $`\sum_{k=1}^n X_k`$ follows a [Gamma distribution](#gamma) with shape $`n`$ and rate $`\lambda`$.
- The minimum $`\min(X_1,\ldots,X_n)`$ is exponential with rate $`n\lambda`$.
- The maximum $`\max(X_1,\ldots,X_n)`$ follows a [transformed Weibull distribution](#weibull).
- If $`Y`$ is [Poisson](#poisson) with rate $`\lambda t`$, then $`\mathbb{P}[X_1 > t] = \mathbb{P}[Y = 0]`$.
- $`X_1`$ is a special case of the [Gamma distribution](#gamma) with shape parameter $`1`$.
- $`\lambda X_1`$ follows the standard exponential distribution with rate $`1`$.

The exponential distribution models many real-world phenomena:

- Time between arrivals in a [Poisson process](#poisson), such as radioactive decay events
- Time until failure of electronic components, given a constant failure rate
- Length of telephone calls in a call center

----------

<h2 id="poisson">The Poisson Distribution</h2>

The Poisson distribution models the number of events occurring in a fixed interval when these events happen at a constant average rate and independently of each other. It was introduced by Siméon Denis Poisson in 1838 in his work "Research on the Probability of Judgments in Criminal and Civil Matters".

Note that the Poisson distribution is *discrete*: it takes only integer values. This means it has a probability *mass* function, rather than a density.

```math
    \begin{align*}
    \text{PMF}: f(k) &= \frac{\lambda^k e^{-\lambda}}{k!}, \quad k \in \mathbb{N}_0 \\
    \text{CDF}: F(k) &= e^{-\lambda} \sum_{i=0}^{\lfloor k \rfloor} \frac{\lambda^i}{i!} = \frac{\gamma(\lfloor k \rfloor + 1, \lambda)}{\lfloor k \rfloor!} \\
    \end{align*}
```

The distribution is parameterised by a single positive real number:

- $`\lambda > 0`$ is the *rate* parameter. It represents both the expected number of events and the variance.

A standard Poisson distribution takes $`\lambda = 1`$.

The moments of the Poisson distribution are:

```math
    \begin{align*}
    \text{Mean} &= \lambda \\
    \text{Variance} &= \lambda \\
    \text{Skewness} &= 1/\sqrt{\lambda} \\
    \text{Kurtosis} &= 1/\lambda + 3 \\
    \mathbb{E}[X^n] &= \sum_{k=0}^{\infty} k^n \frac{\lambda^k e^{-\lambda}}{k!} = B_n(\lambda) \\
    \end{align*}
```
where $`B_n(\lambda)`$ is the $`n^{\mathrm{th}}`$ Bell polynomial evaluated at $`\lambda`$.

with the quantiles given by

```math
    \begin{align*}
        Q(p) &= F^{-1}(p) \text{ has no closed form} \\
        \text{Median} &= \lfloor \lambda + 1/3 - 0.02/\lambda \rfloor \text{ (approximation)} \\
        \text{Mode} &= \lfloor \lambda \rfloor \\
        \text{Support} &= \mathbb{N}_0 = \{0,1,2,\ldots\}
    \end{align*}
```

The Poisson distribution has several important properties:

- **Additivity**: if $`X_1 \sim \text{Pois}(\lambda_1)`$ and $`X_2 \sim \text{Pois}(\lambda_2)`$ are independent, then $`X_1 + X_2 \sim \text{Pois}(\lambda_1 + \lambda_2)`$.
- **Infinite Divisibility**: for any $`n`$, a Poisson($`\lambda`$) random variable can be represented as the sum of $`n`$ independent Poisson($`\lambda/n`$) random variables.
- **Law of Small Numbers**: the limit of Binomial($`n,p`$) as $`n \to \infty`$ and $`p \to 0`$ with $`np = \lambda`$ fixed is Poisson($`\lambda`$).
- **Maximum Entropy**: among all discrete distributions on $`\mathbb{N}_0`$ with fixed mean, the Poisson has maximum entropy.
- **Memorylessness**: the number of events in disjoint intervals are independent.

Suppose we have a Poisson process with rate $`\lambda`$. Then:

- The number of events in time $`t`$ follows Poisson($`\lambda t`$).
- The time between events follows an [Exponential distribution](#exponential) with rate $`\lambda`$.
- Given $`n`$ events occurred in time $`t`$, their occurrence times follow a [Uniform order statistic](#uniform).
- The sum of $`n`$ independent Poisson($`\lambda_i`$) variables is Poisson($`\sum \lambda_i`$).
- If $`N \sim \text{Pois}(\lambda)`$ and each event has probability $`p`$, the successes follow Poisson($`\lambda p`$).
- The waiting time until the $`n`$th event follows a [Gamma distribution](#gamma) with shape $`n`$ and rate $`\lambda`$.

The Poisson distribution models many real-world phenomena:

- Number of radioactive decay events in a fixed time interval
- Number of mutations in a DNA sequence of fixed length
- Number of typing errors per page in a manuscript
- Number of cosmic rays hitting a detector in a fixed time

----------

<h2 id="normal">The Normal Distribution</h2>

The normal (or Gaussian) distribution is arguably the most important probability distribution in statistics. It was first introduced by Abraham de Moivre in 1733, and later popularised by Carl Friedrich Gauss in the early 1800s while studying astronomical measurement errors. The distribution's ubiquity is explained by the Central Limit Theorem: the sum of many independent random variables almost always tends towards normality.

```math
    \begin{align*}
    \text{PDF}: f(x) &= \frac{1}{\sigma\sqrt{2\pi}} \exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right), \quad x \in \mathbb{R} \\
    \text{CDF}: F(x) &= \frac{1}{2}\left[1 + \text{erf}\left(\frac{x-\mu}{\sigma\sqrt{2}}\right)\right] \\
    \end{align*}
```

The distribution is parameterised by two real numbers:

- $`\mu \in \mathbb{R}`$ is the *mean* parameter. It controls the location of the distribution's peak.
- $`\sigma > 0`$ is the *standard deviation* parameter. It controls the spread of the distribution.

The standard normal distribution takes $`\mu = 0`$ and $`\sigma = 1`$, denoted $`\mathcal{N}(0,1)`$.

The moments of the normal distribution are:

```math
    \begin{align*}
    \text{Mean} &= \mu \\
    \text{Variance} &= \sigma^2 \\
    \text{Skewness} &= 0 \\
    \text{Kurtosis} &= 3 \\
    \mathbb{E}\left[ \left( \frac{X-\mu}{\sigma} \right)^n \right] &=
        \begin{cases}
        \frac{n!}{(n/2)!2^{n/2}} = n!! & n \text{ even} \\
        0 & n \text{ odd}
        \end{cases} \\
    \end{align*}
```

(note the [double factorial](https://en.wikipedia.org/wiki/Double_factorial)) with the quantiles given by

```math
    \begin{align*}
        Q(p) = F^{-1}(p) &= \mu + \sigma\sqrt{2}\,\text{erf}^{-1}(2p-1) \\
        \text{Median} &= \mu \\
        \text{Mode} &= \mu \\
        \text{Support} &= \mathbb{R}
    \end{align*}
```

The normal distribution has several important properties:

- **Symmetry**: the distribution is symmetric about its mean.
- **Unimodality**: it has a single peak at $`x = \mu`$.
- **Maximum Entropy**: among all distributions with given mean and variance, the normal has maximum entropy.
- **68-95-99.7 Rule**: approximately 68% of values lie within $`1\sigma`$ of $`\mu`$, 95% within $`2\sigma`$, and 99.7% within $`3\sigma`$.
- **Stability**: linear combinations of independent normal variables are also normal.
- **Reproductive Property**: if $`X \sim \mathcal{N}(\mu_1, \sigma_1^2)`$ and $`Y \sim \mathcal{N}(\mu_2, \sigma_2^2)`$ are independent, then $`X + Y \sim \mathcal{N}(\mu_1 + \mu_2, \sigma_1^2 + \sigma_2^2)`$.
- **Ubiquity**: by the [Central Limit Theorem](https://en.wikipedia.org/wiki/Central_limit_theorem), for any sequence of iid. random variables with finite mean and variance, the value of $`\sqrt{n}(\bar X_n - \mu)`$ converges in distribution to a standard normal random variable.

Suppose $`X_1, X_2, X_3, \ldots`$ are iid. normal random variables. Then:

- The sample mean $`\bar{X}`$ follows $`\mathcal{N}(\mu, \sigma^2/n)`$.
- The sum $`\sum_{k=1}^n X_k`$ follows $`\mathcal{N}(n\mu, n\sigma^2)`$.
- If these are standard normal random variables, the sum $`\sum_{k=1}^n X_k^2`$ follows a [Chi-squared distribution](#chi-squared) with $`n`$ degrees of freedom.
- The ratio of two standard normals follows a [Cauchy distribution](#cauchy).
- The maximum of normal variables follows a [Gumbel distribution](#gumbel) asymptotically.

The normal distribution appears frequently in the real world:

- Heights and weights in populations
- Measurement errors in scientific experiments
- IQ scores (by design)
- Manufacturing variations in industrial processes
- Noise in electronic systems

----------

----------

----------

----------

----------

----------

----------

----------