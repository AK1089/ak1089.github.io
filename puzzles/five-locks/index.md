---
title: "Five Locks: Easy and Hard Steps"
date: 2025-01-12
address_bar_title: Five Locks
---

*All questions here should be answered using estimation (rather than explicit calculation) to test your probabilistic intuition.*

# The Setup

You have to crack five combination locks, which you do not have the combinations to. The locks have 1/2/3/4/5 dials, and each dial has all ten digits. The combination for each dial is a random 1/2/3/4/5 digit number.

It takes you one second to try each incorrect combination, no matter the size of the lock, plus an extra half-second for the correct combination. This means that on average the first lock takes 5 seconds to crack, the next 50 seconds, the next 500 (~8 minutes), the next 5000 (~83 minutes), and the last 50000 (~14 hours).

Let's call locks 1--3 the "easy" locks. No matter howa unlucky you are, you can always finish all three of them within twenty minutes: it only takes $`10 + 100 + 1000 = 1110`$ seconds to try every combination on all three.

By contrast, let's call locks 4 and 5 the "hard" locks. Since you're guessing at random, you probably can't crack either of them within an hour.

# The Puzzle

## Part 1

On average, it takes 555 seconds (a little over nine minutes) to crack the easy locks, and 55000 seconds (a little over 15 hours) to crack the hard locks. The average total time to crack all five locks is simply the sum of these two durations: over 15 hours.

**Question 1**: What is the probability you can crack all five locks within half an hour?

**Answer**: Your chance of success is ||exactly $`0.08146118\%`$, or slightly under 1 in 1,200.||

This can be found using a dynamic programming method, like the below.

```python
import numpy as np
from functools import cache

@cache
def possibilities(number_of_attempts: int, lock_index: int) -> int:
    
    # case of first three locks in place
    if lock_index == 4:
        return max(0, number_of_attempts - 1)
    
    # sum over the subcases depending on how long this lock takes
    return sum(
        possibilities(number_of_attempts - solve_time, lock_index + 1)
        for solve_time in range(10 ** lock_index)
    )

print(sum(
    possibilities(number_of_attempts = time_allowed, lock_index = 1)
    for time_allowed in range(1798)
))
```

This gives the result that there are ||$`814611750000`$ (815 billion)|| orderings to try the numbers which result in a solution taking less than half an hour, out of a total of one quadrillion orderings.

## Part 2

Now, someone comes up to you, saying they've cracked all five locks. You don't know how long they spent on it --- they simply worked at the locks until they got through all five.

**Question 2**: How long do you estimate they spent cracking each lock?

**Answer**: ||Of course, the locks are independent, so the estimated time for each is simply 5, 50, etc. seconds as specified earlier.||

**Question 3**: What proportion of their time do you think they spent on the hard locks?

**Answer**: ||Be careful! In general, the expected value of a ratio is *not* the ratio of the expected values. In this case, it ends up being somewhere between 98% and 99% of the time.||

## Part 3

In fact, the person informs you that (by some miracle) they indeed managed to crack all five locks within half an hour! Now, you can use this information to update your estimates.

**Question 4**: Now, how long do you estimate they spent cracking each lock?

**Answer**: This is the crux of the puzzle. This is very hard to calculate directly, but by running simulations ||(here, running 200 million trials and filtering to the 162767 successful cases), one can estimate that the average time spent on each lock is around 4.97, 48.73, 371.67, 456.77, and 459.64 seconds respectively.||

This means that conditional on success, ||the easy steps take more or less the same time as they did without the constraint, while the hard steps all take approximately the same amount of time as each other! Even though the fifth lock should take ten times as long as the fourth lock to crack, in the worlds where you crack all the locks within half an hour the two locks take within 1% of the time of each other.||

This is because ||whether the first lock takes half a second or 9.5 seconds has very little bearing on the overall success probability, so the times for the first lock are essentially the same as without the success constraint. On the other hand, a success *requires* the fourth and fifth locks to go unusually well, so the cases are filtered heavily to rare outcomes with low times.||