---
title: ScriptedEntity Pool
date: 2026-04-23
---

TL;DR: look at the setup and usage examples, copy-paste into your own code, and change the arguments.

## What is a ScriptedEntity?

Entity scripts used to be added at runtime with something like `@bypass /script create entity <uuid> @var mymap::interact(player, entity)`. Convenient, but also an arbitrary-command-execution opportunity, so `@bypass /script` was disabled plugin-side. That broke every pattern that needed to dynamically create script-bearing entities.

The workaround is a pool: pre-summon a bunch of entities when the map is installed (when admins can still use `@command /script create`), hang on to their UUIDs, and reuse them at runtime. The `scriptentity` namespace wraps this pattern into a reusable class called `ScriptedEntity`.

## Setup

First, get an admin to declare a `ScriptedEntity` variable in your namespace:

```minecraft
/variable define mymap scriptentity::ScriptedEntity my_pool
```

Then run this script *once* to create and initialise the pool:

```msc
# construct the pool, passing the entity type, interact function, park location, and pool size
@var mymap::my_pool = scriptentity::ScriptedEntity("villager", "mymap::interact", Position(100.5D, 50.0D, 200.5D, 0.0, 0.0, "Theta"), 20)
 
# summon the entities and attach the interact script to each
@var mymap::my_pool.init()
```

The interact function must take `(Player, Entity)`, since it'll be called with the built-in `player` and `entity` context variables. The park location is where idle entities sit when they're not in use; anywhere loaded and out of sight works, such as under the map.

If you need entities of various types, you need to create separate pools. Pay attention to your pool size: you only get that many entities to work with at a given time. If you exceed 24, they may kill each other via entity cramming in the pool!

## Usage

You can use this as follows:

```msc
# acquire an entity from the pool
@define Entity e = mymap::my_pool.summon()
 
# customise the entity however you like — name, appearance, position, etc.
@bypass /data merge entity {{e.getUniqueId()}} {CustomName:"&bBob"}
@bypass /execute in minecraft:theta run teleport {{e.getUniqueId()}} 100 64 200
 
# ... whatever it was you wanted the entity to do ...
 
# return the entity to the pool when you're done with it
@var mymap::my_pool.release(e)
```

`summon()` pops an entity from the free list (or returns null if the pool's empty). This replaces using `@bypass /summon` to create a new entity, and comes preloaded with your script.

`release()` teleports it back home, re-disables AI, and makes it available again. You should clean up any held items, tags, or other state that might persist across uses. This is so we can re-use the entity next time you need one with a script.

## Notes

- The park location must be in a loaded chunk, as entity UUIDs don't resolve in unloaded chunks. Anywhere near where players typically are works fine, such as in a hole under the map area.
- NBT you set on an entity persists after release. When you next summon an entity from the pool, you should set its NBT as desired.
- `init()` uses admin-only commands, so it has to be run by an admin. Once done, `summon()` and `release()` are safe for any script to call.
- Each pool gets a random 12-character `poolId` at construction time, and every pooled entity is tagged `scriptentity-pool-<poolId>` — useful with `@e[tag=...]` for admin cleanup.

