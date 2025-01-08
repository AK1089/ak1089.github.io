---
title: The Circular Train
date: 2025-01-08
---

## Puzzle

You are on a train with some finite but unknown number of perfectly identical carriages. Each carriage has a light, which is either on or off, and a switch allowing you to toggle the state of the lights. At the start, all the lights are in some random (and possibly adversarial) configuration.

You may explore the train and use the switches freely, but you cannot make any other marks. How do you determine *with certainty* the total number of carriages in the train?

![A diagram explaining your situation. The start carriage is highlighted, but in reality it looks no different from any other carriage.](explanation.png)

## Common Wrong Answers and Hints

This problem is not as simple as it seems. For example, ||any solution along the lines of "...and when you get back to the start carriage, you can..." is destined to fail. You do not generally know when you've gotten back to the start!||

Another common pitfall is deciding to ||"go around until you find..." when the train could stretch on for billions of carriages, all of which could have their lights on!|| For example, one strategy frequently suggested is to ||create a pattern and find it again by walking around the train. However, it is impossible to guarantee that you have seen the same pattern, as it may have occurred naturally.||

More generally, most solutions are vulnerable to adversarial starting configurations. Can you think of a ||starting arrangement of lights that would make your strategy fail?|| Would your strategy still work even if ||there were a trillion carriages?||

Here are some hints: don't hover over these until you've given the problem a go yourself.

1. ||You need to recognise when you've been in the same carriage twice on different laps of the train.||
2. ||No matter how far forwards you go, you can't be sure you've returned to the start. Why?||
3. ||This means you need to go *backwards* as well as forwards around the train.||
4. ||Suppose the train had more than one carriage. How would you prove this? If this were not true, how would this proof fail?||
5. ||If you prove this, can you prove that there are more than *two* carriages? Three?||
6. ||If you change the light in one carriage, and it changes the light in the carriage 5 doors down...||

## Solution

```quote-warning
Do not read past this point unless you think you have a solution!
```

The solution takes the form of first supposing that the train has one carriage and attempting to disprove that hypothesis, then supposing that the train has two carriages and attempting to disprove that hypothesis, and so on. Eventually, we will fail to disprove one of these hypotheses, because it will be true.

Suppose we think the train might only have one carriage, and want to check this. Right now, we are in the start carriage `c0`. We turn the light <span style="color: var(--yellow)">on</span>, and go forward one carriage to `c1`.

If the light in `c1` is <span style="color: var(--darkblue)">off</span>, then clearly `c0` and `c1` are different carriages, since their lights are in different states. Hypothesis disproven! Move back to `c0` and continue with the next hypothesis.

If the light in `c1` is <span style="color: var(--yellow)">on</span>, then switch it <span style="color: var(--darkblue)">off</span>. Now, we go *back* to `c0`. If the light here has mysteriously switched <span style="color: var(--darkblue)">off</span>, then clearly `c1` is the same as `c0`, since the light switch in `c1` affected the light in `c0`! We can thus conclude that there is one carriage. Otherwise, we have disproven the hypothesis, and can return to `c0`.

Now, we repeat this procedure, conjecturing that there are $`n`$ carriages:

1. Turn the light in `c0` <span style="color: var(--yellow)">on</span>.
2. Go $`n`$ steps forward to `cn`.
3. If the light in `cn` is <span style="color: var(--darkblue)">off</span>, then go back to `c0`, and return to step 1, setting $`n = n+1`$.
4. If the light in `cn` is <span style="color: var(--yellow)">on</span>, turn it <span style="color: var(--darkblue)">off</span> and go back to `c0`.
5. If the light in `c0` is <span style="color: var(--darkblue)">off</span>, then there are precisely $`n`$ carriages!
6. If the ligth in `c0` is <span style="color: var(--yellow)">on</span>, then return to step 1, setting $`n = n+1`$.

This always terminates on iteration $`n`$, where $`n`$ is the number of carriages. Iteration $`i`$ of the algorithm takes at most $`2i`$ steps, so this procedure will always find the correct number within $`n^2 + n`$ moves!