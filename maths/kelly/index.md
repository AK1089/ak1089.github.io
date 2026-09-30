---
title: The Kelly Criterion
date: 2026-09-30
---

In 1956, John Larry Kelly Jr. was working at Bell Labs, and published *[A New Interpretation of Information Rate](https://www.princeton.edu/~wbialek/rome/refs/kelly_56.pdf)*, a paper which applied the lessons of optimal transmission over noisy channels to the problem of gambling.

A game proceeds as follows. Every day at noon, you may make a bet for any amount $`\$ K`$ of your choice (up to your total capital). A biased coin is tossed; if it lands on heads (which it does with probability $`p`$) you get $`\$ K \times u`$ back, and otherwise if it lands on tails you lose your stake.

The question is: what is the optimal strategy? Clearly, this depends on the win probability $`p`$ and the proportional payout $`u`$.

- Of course, if $`p u < 1`$, the expected value of this game is $`Kpu-K < 0`$, so the game is negative in expectation and you should not play.
- Similarly, if $`p u = 1`$, the game is a zero-expected-value martingale, so any sort of risk aversion means you should not play.
- But if $`p u > 1`$, should you go all in? If so, you'll go broke with probability $`1-p^n`$ within $`n`$ days, which tends to $`1`$ exponentially quickly!

---

Now suppose our fortune after $`n`$ days is $`Z_n`$, where $`Z_0 = 1`$ is our initial capital. Each day, we bet a proportion $`w`$ of our wealth. Then:

```math
Z_{n+1} = Z_n \times Y_{n+1} \ \text{where} \
Y_{n+1} = \begin{cases}
	uw + (1-w) & \text{if the $(n+1)^\text{th}$ toss is a head} \\
	(1-w) & \text{if the $(n+1)^\text{st}$ toss is a tail} \\
\end{cases}
```

Notice that $`Z_n = Y_1 \times Y_2 \times \dots \times Y_n`$. Take the sequence of independent and identically distributed random variables $`\log Y_i`$, and apply the weak law of large numbers to get

```math
\mathbb{P}\left[  \left| \tfrac{1}{n} \log Z_n - \mathbb{E}[\log Y_1] \right| > \varepsilon \right] \to 0.
```

So to maximise $`Z_n`$ (and hence $`\tfrac{1}{n} \log Z_n`$) in the long run, with probability tending to $`1`$, we maximise

```math
\begin{align*}
    f(w) &= \mathbb{E}[ \log Y_1 ] = p \log (uw + 1-w) + (1-p) \log (1-w) \\
    f'(w) &= \frac{(pu-1)-(u-1)w}{((u-1)w+1)(1-w)}
\end{align*}
```

Of course, if $`pu \leqslant 1`$, then $`f(w)`$ is decreasing for all positive fractions $`w \geqslant 0`$, so we do not bet. But if $`pu > 1`$, we take the maximum at $`w = \frac{pu-1}{u-1}`$. Equivalently, $`w = p - \frac{q}{b}`$, with net odds $`b = u-1`$ and $`q = 1-p`$.

This is therefore the proportion of our wealth we should bet! In the special case of "even odds", where $`u = 2`$, we bet money if and only if $`p > 1/2`$, when the game is biased in our favour, and bet a fraction $`2p-1`$ of our wealth.

So the answer to "should we go all in" is in fact never unless $`p = 1`$ (when you are literally guaranteed to win).

---

It's interesting to note that economists often assume [[Kahneman & Deaton (2010)](https://www.princeton.edu/~deaton/downloads/deaton_kahneman_high_income_improves_evaluation_August2010.pdf) and [Killingsworth (2021)](https://wpa.wharton.upenn.edu/wp-content/uploads/2021/01/Experienced-Well-Being-Rises-with-Income-January-2021.pdf)] that people have utility functions which grow with the logarithm of income. This assumption traces back to Bernoulli's [1738 attempt](https://econ.ucsb.edu/~tedb/Courses/GraduateTheoryUCSB/Bernoulli.pdf) to resolve the [St. Petersburg paradox](https://en.wikipedia.org/wiki/St._Petersburg_paradox).

Under this framework, utility maximisation is indeed log-wealth maximisation. But the Kelly criterion is *totally independent* of this! Kelly himself wrote as much in his original paper.

```quote-quote
The reason has nothing to do with the value function which he attached to his money, but merely with the fact that it is the logarithm which is additive in repeated bets and to which the law of large numbers applies.
```

His criterion maximises the long-run median (typical) case, rather than going all in on positive bets, which amasses enormous expected wealth but concentrated in an exponentially unlikely single possible world. No other strategy can beat Kelly with probability greater than 50% in the long run, that is in the typical case [[Bell & Cover (1980)](https://pubsonline.informs.org/doi/10.1287/moor.5.2.161)]. And in fact, every strategy which is essentially different to Kelly has a vanishingly small fraction of Kelly's almost surely [[Breiman (1961)](https://projecteuclid.org/proceedings/berkeley-symposium-on-mathematical-statistics-and-probability/Proceedings-of-the-Fourth-Berkeley-Symposium-on-Mathematical-Statistics-and/Chapter/Optimal-Gambling-Systems-for-Favorable-Games/bsmsp/1200512159)]!
