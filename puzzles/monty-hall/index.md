---
title: Monty Hall
date: 2025-01-29
---

In 1990, Marilyn vos Savant published a solution to the original Monty Hall problem in her magazine column *Ask Marilyn*. The statement of the problem was as follows:

```quote-quote
Suppose you're on a game show, and you're given the choice of three doors. Behind one door is a car, behind the others, goats. You pick a door, say #1, and the host, who knows what's behind the doors, opens another door, say #3, which has a goat. He says to you, "Do you want to pick door #2?" Should you switch to door #2 or stick with door #1?
```

The problem was named after the host Monty Hall of popular TV show *Let's Make A Deal*. In the face of thousands of readers and mathematicians yelling at her and incorrectly insisting that switching offers no advantage, Marilyn correctly stated that switching doors gives you a $`2/3`$ chance of winning the car.

When you pick a door to begin with, there is a $`1/3`$ chance the car is behind it: in this case, switching loses you the game. However, if you originally picked a goat (which has a $`2/3`$ chance), the other goat has its door opened, and therefore the only remaining door is the car, winning you the game if you switch.

Here, I present some variants of the original problem, with slightly more difficult solutions.

---

## Many-Door Monty Hall

Suppose you're on a game show, and you're given the choice of one thousand doors. Behind one door is a car, behind the others, goats. You pick a door, say #1, and the host, who knows what's behind the doors, opens every other door except yours and #376. He says to you, "Do you want to pick door #376?" Should you take his offer to switch, or stick with door #1?

Answer: ||Of course, you should switch, to give yourself a $`99.9\%`$ chance of winning the car. This formulation is equivalent to the original $`N=3`$ case, but it is a lot more intuitively obvious why switching is a good strategy.||

## Many-Round Monty Hall

This is the same problem as the original, but now there are $`N`$ doors, still with only one car and $`N-1`$ goats. You pick a door, and the host opens another door to reveal a goat. He offers you the chance to switch to any of the $`N-2`$ remaining closed doors, or stick with your door. Once you make your decision, another goat is revealed, and you once again have the chance to switch to any of the $`N-3`$ remaining closed doors, or stick with your current selection.

This process continues until the end, where there are only two doors left to pick, and you may choose to stick with your current selection or to switch. What is the optimal strategy, and what win probability does it achieve?

Answer: ||You should *not* switch until the very last opportunity, at which point you *should* switch. This gives you a $`1-1/N`$ chance of winning. You want to maximise the probability of the other door at the final stage having the car, which means at each stage you are minimising the probability that your currently selected door conceals the car. Switching at any earlier point increases the probability of you having the car, so you should avoid it.||

## Drunk-Host Monty Hall

This is the same problem as the original, but now the host is visibly drunk --- he clearly does not know what is going on, he has no clue what is behind the doors, and he has thrown open a door entirely at random. It still has a goat behind it, as in the original problem. Does switching doors still proffer an advantage?

Answer: ||No, switching now does not make a difference. The crucial piece of information in the original problem was that the host knew the contents of the doors, and would not have revealed a car.||

## Golden-Goat Monty Hall

This is the same problem as the original, but you know that one of the goats is the lost pet of a billionaire offering a massive reward, eclipsing the value of the car. You desperately want to turn the pet goat in for the reward, and don't much care about the car. The host is totally unaware of this fact. You pick a door, and the host reveals a goat behind another door --- it is *not* the pet goat. He offers you the chance to switch doors. Should you?

Answer: ||No, don't switch. You have a $`2/3`$ chance of winning the car if you switch, so you must have a $`2/3`$ chance of winning the pet goat if you do!||

## Hungry-Tiger Monty Hall

Now, the "prizes" behind the doors are a goat, a car, and a hungry tiger who will eat you. The host is a nice person: he is hoping you win and certainly hoping you don't get eaten alive on live TV, but cannot communicate with you beyond his choice of door.

You choose a door, and the host reveals... something. Based on what the host reveals, should you switch or stay?

Answer: ||The host will never reveal the car, as this would make picking the car impossible. If you pick the goat or car, then the host will certainly reveal the tiger, to avoid you getting eaten. But if you pick the tiger, then this is impossible, so he will have to reveal the goat. Therefore if he reveals the goat, you have the tiger, and should switch. If he reveals the tiger, then you have the goat or car, and so it does not matter what you do.||