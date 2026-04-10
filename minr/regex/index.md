---
title: Regex Basics
date: 2026-04-10
---

When checking player inputs, you often want to accept a range of reasonable answers rather than requiring one exact string. Regex (short for "regular expressions") lets you describe a *pattern* that a string can match, rather than listing every possible correct answer.

### How To Use It

In MSC, you can check whether a player's input matches a pattern using:

```msc
@player What colour is an elephant?

@define String playerInput
@prompt 600 playerInput Too slow!

@if playerInput.matches("(?i)gr[ae]y")
    @player &aCorrect!
@else
    @player &cIncorrect!
@fi
```

This returns `true` if the **entire string** matches the pattern, and `false` otherwise. Here, any of `grey`, `gray`, `Gray`, `gREy`, and so on will work, since `(?i)` enables *case-insensitivity* and `[ae]` allows the third letter to be either.

Regex lets you handle typos, extra whitespace, and variant spellings gracefully.

### Common Patterns

| Syntax | Meaning |
|--------|---------|
| `.`              | Any single character |
| `*`              | Zero or more of the previous thing |
| `+`              | One or more of the previous thing |
| `?`              | Zero or one of the previous thing (optional) |
| `{3,8}`          | Between 3 and 8 of the previous thing |
| `[abc]`          | Any one of `a`, `b`, or `c` |
| `[a-z]`          | Any lowercase letter |
| `(one\|other)`   | Either `a` or `b` |
| `\s`             | Any whitespace character |
| `\d`             | Any digit |
| `(?i)`           | Make the pattern case-insensitive |
| `\w`             | Word character (letter, number, or underscore) |

To escape a special character like a square bracket, use `\` before it to match it exactly.

### Further Reading

For a much more thorough explanation, [regexone.com](https://regexone.com/) has an excellent interactive tutorial that walks you through the syntax. You can also test patterns live at [regex101.com](https://regex101.com/).
