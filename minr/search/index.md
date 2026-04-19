---
title: Making a Search Map
date: 2026-04-20
address_bar_title: Search Maps
---

I've created a `search` namespace that makes search maps easy to set up without writing any complicated scripts. The library handles counting, per-player progress, messages, sounds, hints, and completion. All you do is list the findables and customise what happens when one is found.

This guide walks through a complete example of a map where the player hunts for gems.

### Prerequisites

Before you start, ask an admin to run these two commands for your map's namespace:

```msc
/namespace define treasure
/variable define treasure search::SearchTemplate gemSearchTemplate
```

The rest of this guide uses these names illustratively. You should replace `treasure` with your namespace, and `gemSearchTemplate` with whatever you want to call the template.

### Creating the Template

All the setup happens in a single script. Start with:

```msc
@var treasure::gemSearchTemplate = search::SearchTemplate("treasure::gemSearch")
```

This creates the template. The string `"treasure::gemSearch"` tells the library where to store each player's progress: `treasure` is the namespace, and `gemSearch` is the variable name you'll use later to refer to a specific player's search.

### Adding Findables

A *findable* is either a block (specified by coordinates) or an entity (specified by UUID). Copy the coordinates of a block by pressing `F3+i` while looking at it, or look at an armour stand and run `/minr uuid`. Then add each one:

```msc
@var treasure::gemSearchTemplate.add("6523 64 -802 Theta")
@var treasure::gemSearchTemplate.add("6535 70 -795 Theta")
@var treasure::gemSearchTemplate.add("6518 72 -811 Theta")
@var treasure::gemSearchTemplate.add("19d0a63b-5956-4486-9c70-6956d09fbcf1")
```

Coordinate strings must include the world name at the end. Block findables become interact scripts; entity findables become entity scripts. Both are triggered upon a right click.

### Customising Messages

Every time a player finds something, a message is shown in chat. There are three different events you can customise:

- `ON_FINDABLE_FOUND_NEW`: the player just found this for the first time
- `ON_FINDABLE_FOUND_OLD`: the player has already found this one before
- `ON_FINDABLE_FOUND_ALL`: the player just found the last one

Set each one like this:

```msc
@var treasure::gemSearchTemplate.message_ON_FINDABLE_FOUND_NEW = "&aYou found a gem! &e${found}&7/&e${total}"
@var treasure::gemSearchTemplate.message_ON_FINDABLE_FOUND_OLD = "&7You already found this gem. &e${found}&7/&e${total}"
@var treasure::gemSearchTemplate.message_ON_FINDABLE_FOUND_ALL = "&6&lAll ${total:w} gems found!"
```

Inside any message you can use these placeholders, which are filled in automatically:

| Placeholder | Meaning |
|---|---|
| `${found}` | how many the player has found |
| `${total}` | how many there are in total |
| `${remaining}` | how many are left to find |
| `${found:w}` | the same, but as a word (eg. `ten`) |
| `${total:w}` | same |
| `${remaining:w}` | same |
| `${percentage}` | percent found, as an integer |
| `${percentage:1}` | percent found, to 1 decimal place |
| `${percentage:2}` | percent found, to 2 decimal places |

You can keep going up to `${percentage:5}` if you really want.

### Customising Sounds

Exactly the same three events, but for sounds that play alongside the message:

```msc
@var treasure::gemSearchTemplate.sound_ON_FINDABLE_FOUND_NEW = "minecraft:block.note_block.chime"
@var treasure::gemSearchTemplate.sound_ON_FINDABLE_FOUND_OLD = "minecraft:block.note_block.bass"
@var treasure::gemSearchTemplate.sound_ON_FINDABLE_FOUND_ALL = "minecraft:entity.player.levelup"
```

Use any Minecraft sound name — you can look them up on the [Minecraft Wiki](https://minecraft.wiki/w/Sounds.json#java_edition_values).

### Per-Findable Overrides

If you want one specific findable to show a unique message or play a unique sound, you can override the default just for that one:

```msc
@var treasure::gemSearchTemplate.addCustomMessage("1523 64 -802 Theta", "&b&lThe rare sapphire! &e${found}&7/&e${total}", "ON_FINDABLE_FOUND_NEW")
@var treasure::gemSearchTemplate.addCustomSound("1523 64 -802 Theta", "minecraft:entity.ender_dragon.growl", "ON_FINDABLE_FOUND_NEW")
```

The first argument is the findable (the same string you passed to `add`), the second is the message or sound, and the third is which event to override.

### Teleport on Completion

If you want the player to be teleported somewhere automatically when they find the last gem, set `finishTeleport`:

```msc
@var treasure::gemSearchTemplate.finishTeleport = Position(1500, 80, -850, "Theta")
```

### Finalising

At the very end of the setup script, run:

```msc
@var treasure::gemSearchTemplate.import()
```

This automatically generates all the interact and entity scripts on your findables — you don't need to create any by hand. After running the setup script once, you're done with setup, and can delete it.

### Starting a Search for a Player

On the script that starts your map, add this script line:

```msc
@var treasure::gemSearch = treasure::gemSearchTemplate.start(player)
```

This creates a fresh search for that player. From now on, every time they click a findable block or hit a findable entity, their progress updates and the right message and sound play.

### Full Example

Putting it all together, here's a full setup script which uses every feature covered above.

<download gem-search.msc>

That's it! You now have a fully working search map. If you have any problems with this or want to request more features, let me know.

The source code for the `search` namespace lives on [GitHub](https://github.com/AK1089/minr-search-template).