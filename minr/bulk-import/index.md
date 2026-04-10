---
title: Bulk Importing Dialogue Scripts
date: 2023-01-17
updated: 2026-04-10
address_bar_title: Bulk Import Dialogue Scripts
---

If you have a lot of armour stands that each need their own dialogue script, you can set them all up at once using a single bulk import script. Here's how.

### Write Your Dialogue Scripts

Go to [paste.minr.org](https://paste.minr.org) and write a dialogue script for each armour stand. Save each one and keep a note of all the script links.

### Get Each Armour Stand's UUID

Look at an armour stand and type `/minr uuid` in chat. This will display the armour stand's UUID, which looks something like `069a79f4-44e9-4726-a5be-fca90e38aaf5`. Click on it to copy it to your clipboard.

Repeat this for every armour stand which requires a script.

### Build the Import Script

Open [paste.minr.org](https://paste.minr.org) again and start a new script. For each armour stand, add a line in this format:

```msc
@bypass /script import entity <uuid> <script-link>
```

where `<uuid>` is the armour stand's UUID and `<script-link>` is the corresponding dialogue script URL. For example, a finished script might look like:

```msc
@bypass /script import entity 1067b74a-f7a8-4c63-aa48-035f7d8dcbc0 https://paste.minr.org/yalegeyivi
@bypass /script import entity 8cb3347f-3c4b-4aa6-9eff-cd9302227cab https://paste.minr.org/ozexiravad
@bypass /script import entity 692cafee-cde5-41ef-9ea5-9e9440eb79c6 https://paste.minr.org/epolebiqoc
```

with one line per armour stand.

### Run It

Save this script and give the link to an admin, asking them to **run it once and then remove it**. This will assign all the dialogue scripts to their respective armour stands in one go.
