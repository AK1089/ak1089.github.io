---
title: The 12 Coin Problem
date: 2025-01-29
---

This is a very popular puzzle, originating from at least as early as 1945, along with some closely related but less popular extension questions.

## The Problem

You have twelve coins. You know that one (and only one) is a forgery, and is of a different weight to the other eleven coins. You have a balance allowing you to determine which of two sets of coins is heavier (but no other information).

Prove that you can always determine the forged coin *and* whether it is lighter or heavier within three uses of the balance.

### Bonus Question 1

Prove that you cannot do this if there are more than $`13`$ coins.

### Bonus Question 2

Can you do this if there are exactly $`13`$ coins?

### Bonus Question 3

What happens if a forgery is not guaranteed to exist? Can you always tell within three uses of the balance whether it does (and if so, determine which coin is the forgery and its relative weight?)

```quote-warning
Solutions below! Do not scroll down until you have attempted all the problems.
```

---

# Solutions

In fact, ||the answer to the final bonus question is "yes"! This means the original problem must also be possible using the same strategy: there will simply be one state which doesn't arise.||

## Bonus 1: More Than 13 Coins

Suppose there are $`m \geqslant 14`$ coins. Then in total there are $`2m \geqslant 28`$ states to distinguish between, in $`\set{1 \dots m} \times \set{\texttt{heavy}, \, \texttt{light}}`$, which corresponds to at least $`\log_2 28 > 3\log_2 3`$ bits of uncertainty.

Each weighing has three outcomes (left heavier, right heavier, or balance) and thus can provide at most $`\log_2 3`$ bits of information.

Therefore 3 weighings provide at most $`3 \log_2 3 < \log_2 2m`$ bits of information, which cannot possibly be enough to consistently distinguish all states.

## Bonus 2: Exactly 13 Coins

Suppose $`m = 13`$. There are 26 possible states to distinguish between, which naively should be possible. However, consider the first weighing, WLOG between coins $`\set{1 \dots r}`$ and $`\set{r+1 \dots s}`$.

Obviously, we want $`s = 2r`$, otherwise the weighings are unbalanced, and anything could happen. Precisely, suppose the side with more coins is heavier. We have gained literally zero information: every state is still possible.

Since there are still $`26`$ possible states, and we can obtain at most $`2 \log_2 3 < \log_2 26`$ bits of information with our two further weighings, clearly we cannot always detect the forgery and its nature. Thus it cannot be possible to guarantee detection in three weighings if the first weighing is unbalanced.

From now on, we therefore weigh the first $`r`$ coins against the next $`r`$ coins.

Now, suppose $`r \leqslant 4`$. If the coins balance, then there are still $`2(m - 2r) \geqslant 10`$ remaining states, given by the remaining $m-2r$ coins. This requires at least $`\log_2 10 > 2 \log_2 3`$ bits of information to distinguish, and therefore we cannot guarantee a solution in two further weighings.

Conversely, suppose $`r \geqslant 5`$. If the coins do not balance, there are still $`2r \geqslant 10`$ remaining states, which again for the same reasons means we cannot guarantee a solution in two further weighings.

Therefore no matter what arrangement we pick for the first weighing, there is some situation in which we have insufficient further information to distinguish betwen the remaining possibilities with our two remaining weighings. This means we cannot guarantee discovery of the forgery within three weighings, even when $`m = 13`$.

## Bonus 3: Without A Guaranteed forgery

Label the $`12`$ coins $`1 \dots 12`$. There are $`25`$ total cases: label them by $`1^+ \dots 12^+`$ for each coin being a heavy forgery, $`1^- \dots 12^-`$ for each coin being a light forgery, and `X` for the coins all being real.

When I say "weigh some set $`L`$ against some set $`R`$", these refer to the left and right hand sides.

First, weigh coins $`\set{1, 2, 3, 4}`$ against $`\set{5, 6, 7, 8}`$. If they balance, then we have the nine possible cases $`9^+ \dots 12^+, 9^- \dots 12^-`$ and `X`. For the second weighing, weigh $`\set{9, 10}`$ against $`\set{11, 1}`$.

1. Suppose they again balance. Then $`12`$ must be the forgery, if one exists. Weigh $`12`$ against $`1`$. If $`12`$ is heavier or lighter the weighing confirms this, and if they balance there is no forgery.
2. Suppose instead that the right hand side is heavier. Then we have $`9^-`$, $`10^-`$, or $`11^+`$. Weigh $`\set{9}`$ against $`\set{10}`$ --- the lighter coin is the forgery and is lighter than the real coins, or if they balance 11 is the forgery and is heavier than the real coins.
3. Suppose instead that the left hand side is heavier. Then we have $`9^+`$, $`10^+`$, or $`11^-`$. Weigh $`\set{9}`$ against $`\set{10}`$ --- the heavier coin is the forgery and is heavier than the real coins, or if they balance $`11`$ is the forgery and is lighter than the real coins.

Otherwise, suppose without loss of generality that the right hand side is heavier. (If the left hand side is heavier, we may just relabel the coins).

We therefore have $`1^- \dots 4^-`$ or $`5^+ \dots 8^+`$, which is $`8`$ total cases to distinguish with the two remaining weighings. Weigh $`\set{1, 2, 5}`$ against $`\set{3, 4, 6}`$.

1. Suppose the right hand side $`\set{3, 4, 6}`$ is again heavier. Then we have one of $`1^-`$, $`2^-`$, or $`6^+`$. Weigh $`\set{1}`$ against $`\set{2}`$ --- the lighter coin is the forgery and is lighter than the real coins, or if they balance then $`6`$ is the forgery and is heavier than the real coins.
2. Suppose the left hand side $`\set{1, 2, 5}`$ is now heavier. Then we have one of $`1^+`$, $`2^+`$, or $`6^-`$. Weigh $`\set{1}`$ against $`\set{2}`$ --- the lighter coin is the forgery and is lighter than the real coins, or if they balance then $`6`$ is the forgery and is heavier than the real coins.
3. Finally, suppose they balance. Then either $`7`$ or $`8`$ is the forgery --- weigh them against each other to identify the forgery, which is heavier than the real coins.

Therefore, three weighings is sufficient to identify whether there is a forgery, and if so which coin and whether it is heavier or lighter than the other eleven coins.