---
title: Yeroc% Patch Guide
date: 2024-12-24
updated: 2025-01-07
---

TL;DR: look at the example script and copy paste the important lines into your own script.

## What is a Yeroc% Skip?

Sometimes in scripts for maps, you want to teleport the player, or give them items, or set variables which allow them to progress further. Sometimes, this happens *after a delay*: commonly, a back-and-forth dialogue script concludes with the player being teleported away to a new room.

However, this enables an exploit, usually known as a "yeroc%" run (after Mouthwest, formerly known as Yeroc424, who popularised it). During the execution of a dialogue script, the player can `/kill` to reset their timer, and when the script concludes they will be teleported, essentially beginning halfway through the map with a zero second timer.

While this is against the rules, it's usually good for mapmakers to guard against this anyway. I thought I'd make it even easier, with a namespace appropriately named `yerocpatch`. Everything has guards and checks in place, so you don't have to worry about messing up players if they join another map mid-execution.

## Example Script

This is how you would use it in your own scripts.

```msc
# put this at the start of your script, just below things like cooldowns
@define Int yeroc_check = yerocpatch::setup(player)
 
# most of your script goes here, for example some dialogue
@player NPC: Hi! I'm a placeholder NPC created for dialogue demonstration purposes.
@delay 80
@player NPC: And that was a four second delay during which you could have reset your timer!
 
# add this section before you do anything with the player: it checks if the player's run is still valid
@var yeroc_check = yerocpatch::verify(player, yeroc_check, "default")
 
# terminates the script if the run is invalid (verification codes 0, 1, 2, 3), so the teleport doesn't run
@if yeroc_check < 4
    @return
@fi
 
# do the possibly skip-enabling thing, like a teleport
@bypass /execute in minecraft:theta run teleport @s 1234 56 789
```

## Verification Codes

You may have noticed a reference to verification code `4` in the conditional statement. The full list of codes is as follows:

- code **6**: the checker referenced was not found, and there is an error in your setup.
- code **5**: the map has no timer attached (for example, when the map is on Board).
- code **4**: the player has done everything right and the check is valid.
- code **3**: the player has left the map since the script started running.
- code **2**: the player's timer has already been invalidated.
- code **1**: the player has reset their timer since the script started running.
- code **0**: the checker was manually invalidated using `yerocpatch::terminate` or `invalidate`.

## Advanced Usage

At any point in your script before verification, you can use the line `@var yerocpatch::invalidate(player, yeroc_check)` to make sure the verification fails. This is useful in conditional branches, to terminate scripts (eg. if the player walks back into an area they shouldn't, even if this doesn't reset their timer).

You may also use `@var yerocpatch::terminate(player, "your-map-code-here")` in any *other* script to invalidate *every* ongoing check in your map.

In the verification stage, you may replace "default" with any string. The flags inside will determine the verification behaviour.

- Strings containing "nullify" will nullify the player's timer, so that they can complete the map but not attain a time. 
- Strings containing "invalidate" will invalidate the player's completion altogether.
- Strings containing "kill" will kill the player and reset them to their checkpoint.

The namespace will only work on maps which have timers attached: this does not generally include maps on Board. It will *not* throw errors if you use the scripts, but simply not invalidate timers or kill players. If you want to test the behaviour of your scripts, ask an admin to move your map to another area which has timers (like the Valley).
