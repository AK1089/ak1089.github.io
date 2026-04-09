---
title: A Few Small Scripting Polish Things
date: 2024-09-17
updated: 2026-04-06
address_bar_title: Scripting Polish
---

Here's a list of simple things you can do with scripts which have a really high return on effort in terms of making feel polished and complete.

### Use The Right Teleports

When teleporting players with scripts, make sure to use the correct teleport:

```
# This displays a message in chat like [Minr] Teleported AK1089 to 123, 45, 678, Theta.
@bypass /tp 123 45 678
# This always runs in the right world, is silent, supports relative teleports, and gets the rotation right!
@bypass /execute in minecraft:theta run teleport @s 123 45 678 0 0
```

### Reset Lecterns

Make your lecterns automatically flip back to page 1, so that a new player coming to read instructions doesn't have to flip all the way back.

```msc
@global_cooldown 30s
@bypass /data modify block {{block.getX()}} {{block.getY()}} {{block.getZ()}} Page set value 0
```

### Strip Item Names

When working with player heads you are placing in item frames (for example as direction indicators), strip their name so that they don't shop up when you hover.

### Use Player Rank Colours

You can use the following method to colourise the player's name according to their rank:

```msc
# returns eg. "&6AK1089", since 6 is the code for orange/gold
@player {{player.getDisplayName()}}
```

### Reset Formatting Correctly

Make sure you put formatting reset tokens in the right place! In the first example, the colon will also be red and bolded. In the second example, the colon will look like the rest of the text, and only the name will be emphasised.

```msc
# this is bad, because the colon will also be red and bolded which isn't ideal
@player &c&lJohn: &7hi this is some dialogue
# this looks much cleaner
@player &c&lJohn&7: hi this is some dialogue
```

### Control Inventory Slots

You can use `/item replace` for extra control over player inventories compared to `/give`.

```msc
# latter goes directly into their current hand, rather than just slot 1
@bypass /give @s apple 1
@bypass /item replace entity @s weapon.mainhand with apple 1
```

Be careful when using this with multiple items, as you could replace something the player is holding and thereby erase it!

### Pluralise Quantities

I have made a custom function which pluralises words after numbers according to the number you put in. Use it like this:

```msc
# this is bad and looks ugly
@player You have completed {{tasks_completed}} task(s)!
# this is much nicer and not that hard to use
@player You have completed {{dialogue::plural("{{tasks_completed}} task")}}!
```

Note that this method is clever enough to handle non-standard plurals correctly, including `fox`, `man`, `fly`, `domino`, and so on. If you wish to be particularly cautious, you may use `dialogue::plural("{{tasks_completed}} singular/plural")`, which will use your custom singular and plural. You may also use `dialogue::plural("{{tasks_completed}}w task")` to render the number as a word ("three" rather than 3, say). This works for all integers.

### Use Cooldowns Correctly

Think about your cooldowns correctly! As a rule of thumb, most scripts should have a cooldown equal to their shortest possible execution time, so that a player is never left waiting for a script's cooldown without good reason.
