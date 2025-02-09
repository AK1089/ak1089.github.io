---
title: The Number Zoo
date: 2025-02-08
---

This is an article that aims to step through the history of constructing the real numbers. If you're not a mathematician, real numbers are a set which might well encompass all the numbers you have ever heard of. Zero is a real number, as are $`1089`$, $`-62`$, $`0.5`$, $`\pi`$, and so on.

We're going to start from the numbers that *everyone* knows (yes, [even newborn babies](https://www.youtube.com/watch?v=h4Amu5OsRUM)) and build up to the really abstract ones which are totally unknown outside mathematical circles. Along the way, we'll see the motivation between new constructions and sets, and show how we might define them formally.

This explainer is intended to be fairly accessible to people without a formal background in maths, though some of the terms or notation might be unfamiliar.

## The Natural Numbers

The natural numbers are the numbers we use to count things. They start at $`0`$ (or $`1`$, depending on who you ask), and they just keep going up: $`0`$, $`1`$, $`2`$, $`3`$, and so on forever.

We will denote this by $`\mathbb{N}_0`$: the subscript makes it clear that we are including zero. Formally, $`\mathbb{N}_0`$ is a *set* of numbers: an infinite collection of all of them. We say that a number is *in* the set by writing something like $`5 \in \mathbb{N}_0`$.

You might think that it would be hard to define this set formally, since you'd need to say infinitely many things about it. In fact, we can define it with only two simple rules (called axioms)!

1. $`0 \in \mathbb{N}_0`$: there is a natural number zero.
2. $`n \in \mathbb{N}_0 \implies (n+1) \in \mathbb{N}_0`$: the arrow means "implies", so this is saying that if we have any natural number, we can add one to get another natural number.

These two rules, part of the so-called [Peano axioms](https://en.wikipedia.org/wiki/Peano_axioms) (though I'm simplifying them a bit), are enough to generate all the natural numbers. We have $`0`$ by the first axiom, and then we have $`1`$ by the second axiom, and have $`2`$ by the second axiom again, and so on.

The natural numbers are entirely intuitive, and they represent actual collections of things in the real world. For example, the natural numbers can describe the number of sheep in your field. You can also do addition and multiplication with them: if you have $`12`$ sheep and get $`26`$ more sheep, then you end up with $`38`$ sheep!

You can even do subtraction! If you have $`7`$ sheep and lose $`3`$ of them, then you end up with $`4`$ sheep. But if you want to give away $`5`$, you end up with an impossibility!

We've now reached something that the natural numbers are not always capable of: subtracting two numbers. For this to always be possible, we have to start including more numbers: the *negative numbers*...

## The Integers

To handle subtraction properly, we need to introduce negative numbers. The resulting number system is called the integers, written $`\mathbb{Z}`$ (from the German word "Zahlen", meaning numbers).

How can we construct these negative numbers? Well, we can think about a bank account. If you have $`100`$ dollars and spend $`120`$, you end up owing the bank $`20`$ dollars. We write this as $`-20`$. The minus sign indicates a debt: a quantity that would need to be added to get back to zero.

Formally, we can construct $`\mathbb{Z}`$ from $`\mathbb{N}_0`$ by considering pairs of natural numbers $`(a,b)`$, where we think of this pair as representing the result of "$`a-b`$". For example:

- $`(5,2)`$ represents $`5-2=3`$
- $`(2,5)`$ represents $`2-5=-3`$
- $`(3,3)`$ represents $`3-3=0`$

Of course, many different pairs represent the same integer: $`(5,2)`$ and $`(8,5)`$ both represent $`3`$, since $`5-2=8-5=3`$. We say that two pairs are *equivalent* if they represent the same integer.

Then, the integers $`\mathbb{Z}`$ are defined to be the set of pairs in $`\mathbb{N}_0 \times \mathbb{N}_0`$, where pairs $`(a,b)`$ and $`(c,d)`$ are considered to be "the same" if they are equivalent: that is, if $`a+d=b+c`$.

The integers give us a complete system for addition, subtraction, and multiplication. If you have a debt of $`3`$ dollars and get another debt of $`4`$ dollars, your total debt is $`7`$ dollars. We can write this equation as $`(-3)+(-4)=(-7)`$. If you multiply a debt of $`2`$ by $`3`$, you get a debt of $`6`$: we write this equation as $`3 \times (-2)=(-6)`$.

But what about division? Well, if you split a debt of $`6`$ dollars equally between $`2`$ people, each person owes $`3`$ dollars: $`(-6) \div 2 = (-3)`$. But what if you try to split $`7`$ dollars between $`2`$ people? Or split a debt of $`1`$ dollar between $`3`$ people? For this, we need to introduce *fractions*...

## The Rational Numbers

The rational numbers, written $`\mathbb{Q}`$, are what we get when we allow division. A rational number is any number that can be written as a fraction $`\frac{p}{q}`$ (or $`p/q`$) where $`p`$ and $`q`$ are integers and $`q \neq 0`$.

Note: if we allowed $`q=0`$, we'd be trying to divide by zero, which doesn't make sense!

Just like we saw with the pairs of natural numbers that represented integers, many different fractions can represent the same rational number. For example, $`1/2`$ and $`2/4`$ and $`3/6`$ all represent the same number. We say these fractions are *equivalent* if they represent the same number. More precisely, $`a/b`$ and $`c/d`$ are equivalent if $`ad=bc`$.

The rational numbers give us a complete system for addition, subtraction, multiplication, and division (by anything apart from zero). They let us precisely represent any number that can be expressed as a ratio of integers. This includes:

- All integers (for example, $`3 = 3/1`$)
- Simple fractions like $`0.5 = 1/2`$ or $`0.75 = 3/4`$
- Repeating decimals like $`0.333333\ldots = 1/3`$ or $`0.142857142857\ldots = 1/7`$

But what about numbers like $`\sqrt{2}`$? This is the number which, when multiplied by itself, gives $`2`$. We can approximate it with rational numbers: $`1.4142135623\ldots`$. But no matter how many decimal places we write down, we'll never get it exactly right. In fact, we can prove that $`\sqrt{2}`$ cannot be written as a fraction of integers at all!

||Suppose $`\sqrt{2} = p/q`$, where this fraction is *in lowest terms*: we cannot reduce it. Then $`p^2 = 2q^2`$. But then $`p^2`$ must be an even number, since $`2q^2`$ is obviously even. This means $`p`$ is even, since an odd number squared is odd. But then $`p^2 = 2q^2`$ divides by 4, so $`q^2`$ divides by 2, so then $`q`$ is also even. But then both $`p`$ and $`q`$ are even: we could have halve them both to reduce the fraction! So the fraction couldn't have been in lowest terms, and so $`\sqrt{2} \neq p/q`$.||

To handle numbers like $`\sqrt{2}`$, we need to introduce the *algebraic numbers*...

## The Algebraic Numbers

The algebraic numbers, written $`\mathbb{A}`$, are what we get when we allow solutions to *polynomial equations*. A polynomial equation looks like this:

```math
a_nx^n + a_{n-1}x^{n-1} + \cdots + a_1x + a_0 = 0
```

where all the $`a_i`$ are integers. An algebraic number is any solution to such an equation.

For example:
- $`\sqrt{2}`$ is algebraic because it satisfies $`x^2 - 2 = 0`$
- $`\sqrt[3]{5}`$ is algebraic because it satisfies $`x^3 - 5 = 0`$
- The golden ratio $`\varphi = 1.618034...`$ is algebraic because it satisfies $`x^2 - x - 1 = 0`$
- Every rational number $`p/q`$ is algebraic because it satisfies $`qx - p = 0`$

Some of these numbers can be constructed with a ruler and compass (like $`\sqrt{2}`$), and some cannot (like $`\sqrt[3]{5}`$). The ones that can be constructed with ruler and compass are called *constructible numbers*, which are a special subset of the algebraic numbers.

Unlike the rational numbers, which you can always write as a decimal that either terminates or repeats, algebraic numbers can have decimal expansions that go on forever without repeating. For example, $`\sqrt{2} = 1.4142135623730950488...`$ goes on forever, without ever falling into a nice periodic pattern.

Now, surely we have every number? In fact, we still don't. In fact, not only are we still missing some numbers, we're missing *almost every* number. What could this possibly mean? To truly understand this, we're going to have to learn about something called *countability*.

## Countability

What do we mean when we say a set of numbers is "countable"? Loosely, a set is [countable](https://en.wikipedia.org/wiki/Countable_set) if we can list all of its elements. It's fine if the list goes on forever, but the list really does have to eventually hit every number in the set.

For example, the natural numbers are countable. We can list them as:

```math
0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, ...
```

Obviously, the list will never end, but that's fine: for any number you can think of, the list will eventually get there! Even one trillion will appear in our list at some point.

Interestingly, the integers are also countable! We can list them by alternating positive and negative:

```math
0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, ...
```

This list will also hit every integer! This means the set of integers is countable. An interesting corollary of this is that the set of integers, far from being "twice as big" as the set of natural numbers, is actually *the same size*! How can this be? Well, our notion of things in the finite world being the same size is when we can pair up elements. For example, the sets:

```math
\{ 1, 6, 8, 13 \} \text{ and } \{ 5, 6, 7, 22 \}
```

are the same size, because we can pair $`1`$ with $`5`$, $`6`$ with itself, $`8`$ with $`7`$, and $`13`$ with $`22`$. This works in the infinite case too! "Listing" numbers in a set is a special case of pairing them with the elements in $`\mathbb{N}_0`$: the first element in the list is paired with $`0`$, the second element is paired with $`1`$, and so on.

Saying a set is *countable*, then, is saying it has the same size as the natural numbers: the elements in the set can be paired with the numbers $`0`$, $`1`$, $`2`$, and so on.

Even the rational numbers are countable, though proving this requires a clever trick. We can arrange all fractions in an infinite grid:
```math
(1/1), \ (2/1), \ (3/1), \ (4/1), ...\\
(1/2), \ (2/2), \ (3/2), \ (4/2), ...\\
(1/3), \ (2/3), \ (3/3), \ (4/3), ...\\
...
```
and then zigzag through this grid to list them all (skipping duplicates like $`2/2`$ which equals $`1/1`$). This list eventually hits all the rational numbers, so the set of rationals $`\mathbb{Q}`$ must be countable!

Less obviously, the set of algebraic numbers is also countable. But in fact, we can prove that the set of real numbers is *not* countable, which means that we must have missed some.

## The Real Numbers

Real numbers are just numbers with any decimal expansion whatsoever. There does not need to be any pattern, or repetition, or any other structure. How can we formally construct these real numbers? [Richard Dedekind](https://en.wikipedia.org/wiki/Richard_Dedekind)'s approach was to define them using *cuts* in the rational numbers. The idea is that every real number divides the rational numbers into two pieces: those that are less than it, and those that are greater than it.

For example, consider $`\sqrt{2}`$. We can't write this as a ratio of integers, but we can describe it perfectly by defining it to be the unique number that divides the rational numbers into:

- positive rational numbers whose square is greater than $`2`$ (like $`1.5`$ or $`1.415`$)"
- other rational numbers, like negative ones or those whose square is less than $`2`$ (like $`-5`$, $`1.4`$ or $`1.414`$)

This division of the rational numbers is called a *Dedekind cut*. Every real number corresponds to such a cut, and every such cut corresponds to a real number! We can even do arithmetic with these cuts in a natural way.

This construction might seem abstract, but it gives us a precise way to handle any real number, even ones with decimal expansions that go on forever without any pattern at all.

### Uncountability of the Reals

[Georg Cantor](https://en.wikipedia.org/wiki/Georg_Cantor) proved that the set of real numbers $`\mathbb{R}`$ was uncountable in 1891, using a famous *diagonal argument*.

Suppose that the set of real numbers was countable. Then, we can list them all. Let's try to list all the real numbers between $`0`$ and $`1`$ (if we can't even list these, we certainly can't list all real numbers!). Our list might start:

```math
0.134159265358979323846...\\
0.367892145678901234567...\\
0.249578013245678901234...\\
0.918273645627384950284...\\
0.314159265358979323846...\\
0.348573849001743483850...\\
...
```

Now here's the clever part: we're going to construct a new number that isn't on our list! We'll do this by looking at the diagonal (hence "diagonal argument"): the first digit of the first number, the second digit of the second number, and so on. In this case, that's $`1,6,9,2,5,3...`$

```math
0.\underline{\mathbf{1}}34159265358979323846...\\
0.3\underline{\mathbf{6}}7892145678901234567...\\
0.24\underline{\mathbf{9}}578013245678901234...\\
0.918\underline{\mathbf{2}}73645627384950284...\\
0.3141\underline{\mathbf{5}}9265358979323846...\\
0.34857\underline{\mathbf{3}}849001743483850...\\
...
```

We'll make our new number by changing each of these digits. Let's say we change each digit by adding $`1`$ (and if we hit $`9`$, we wrap around to $`0`$). So our new number starts $`0.270364`$ and goes on forever.

This new number *must* be different from every number in our list:

- It differs from the first number in the first decimal place
- It differs from the second number in the second decimal place
- It differs from the third number in the third decimal place

and so on forever. Thus the number cannot possibly be in any position on our list. But this number is definitely a real number between $`0`$ and $`1`$! So our list wasn't complete after all. In fact, no matter what list we try to make, we can always use this diagonal trick to find a number that's not on it.

This proves that the real numbers are *uncountable* - they cannot be put in a one-to-one correspondence with the natural numbers. The set $`\mathbb{R}`$ is fundamentally larger than $`\mathbb{N}_0`$, $`\mathbb{Z}`$, $`\mathbb{Q}`$, or even $`\mathbb{A}`$!

In fact, since the algebraic numbers $`\mathbb{A}`$ are countable and the reals $`\mathbb{R}`$ are not, the former has *measure zero* in the latter. That is, "[almost all](https://en.wikipedia.org/wiki/Almost_all)" real numbers are *not* algebraic. Numbers that aren't algebraic are called *transcendental* numbers: these cannot be the solution to *any* polynomial equation with integer coefficients, no matter how complicated. The most famous examples are $`\pi`$ and $`e`$.

However, despite almost all numbers being transcendental, we know very few of them (few enough to fit on a [single Wikipedia page](https://en.wikipedia.org/wiki/Transcendental_number)) and proving that a given number is transcendental is typically very difficult. Even more surprisingly, most of these known transcendental numbers fall inside the countable set of *computable* numbers -- meaning we can calculate them to any desired precision. For example, there is a simple algorithm to calculate $`\pi`$ to $`n`$ decimal places, a property which does not hold for most real numbers!

## Putting It Together: The Number Zoo

This means we can put together our hierarchy of numbers! Each successive level includes all the levels above, as well as some new numbers.

1. The *natural numbers* $`\mathbb{N}_0`$, like $`0`$, $`1`$, $`2`$, and $`1089`$.
2. The *integers* $`\mathbb{Z}`$, including negative numbers like $`-56`$.
3. The *rational numbers* $`\mathbb{Q}`$, including fractions like $`1/6`$ and $`-238/33`$.
4. The *constructible numbers*, including certain irrational numbers like $`\sqrt{2}`$.
5. The *algebraic numbers* $`\mathbb{A}`$, including many more irrational numbers like $`\sqrt[3]{5}`$ and $`\varphi`$.
6. The *computable numbers*, including most famous non-algebraic numbers like $`\pi`$ and $`e`$.
7. The *real numbers* $`\mathbb{R}`$, including all the other numbers, even [Chaitin's constant](https://en.wikipedia.org/wiki/Chaitin%27s_constant).
