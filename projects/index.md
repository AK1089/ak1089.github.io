---
title: Projects
date: 2024-12-24
address_bar_title: Projects | AK1089's Site
---

This is a home for projects of mine of which I am particularly proud. I've tried to keep things fairly mixed between software, engineering, and creative endeavours. Also check out my [GitHub](https://github.com/ak1089/) account, which has many smaller creations of mine.

----------

## Digital Cassettes

I listen to a lot of music on Spotify (you can see my Last.FM account [here](https://www.last.fm/user/AK1089-/library)), but I don't own much physical media. This is partly because I grew up well after the era in which vinyl (and even CDs) were dominant, but also online digital media and streaming services are genuinely a much better alternative: they're orders of magnitude cheaper and easier to carry around.

With that said, there's something pleasant about the tactile sensations and aesthetics of putting a cassette tape into a player and hearing music come out. Of course, I could buy a cassette player, but I wanted something to get the best out of both worlds.

I designed and 3D printed a cassette player and programmed an NFC reader on a Raspberry Pi inside to scan "cassettes" and use the Spotify API to play the corresponding album or playlist. The cassettes are also designed and 3D printed by me in the exact dimensions and shape of a traditional cassette, and have a small slot to insert a tiny NFC sticker in position for the reader. When a new cassette is inserted, the chip inside is bound to the currently playing album or playlist.

You can view [the repository](https://github.com/AK1089/digital-cassettes).

----------

## Register Machines

An alternative formulation of the familiar Turing Machines (with a single infinite tape) are register machines, which have a number of "stacks" holding sequences of bits which they can manipulate using push and pop operations. These are instructive in the study of finite automata and formal languages, which is the object of a fascinating course I studied in my third year of university.

Register machines have a somewhat limited instruction set, enabling them to be simulated step-by-step without too much trouble. I built a tool which simulates them visually, allowing you to define all of their states and add content to their memory at any point then watch them work.

You can view [the interactive simulator](/register-machines) or [the repository](https://github.com/AK1089/register-machines).

----------

## Folder Graph Viewer

The default folder view on most operating systems isn't the best: you can often only see one layer at a time, and have to recursively click into and out of them to see all your nested folders and files. The tree view provided in the terminal is slightly nicer, though the plain text format means that it's sometimes hard to keep track of where you are and there are no visual aids.

To combat these problems, I made a script that generates a graph view of a root folder and opens it up for display using HTML and JS. Files and folders are represented by circles, which get smaller as they get more deeply nested, and are coloured based on their file type. Folders can be open and closed to collapse everything inside them, the colours can be customised.

You can view [the repository](https://github.com/AK1089/folder-graph-viewer).