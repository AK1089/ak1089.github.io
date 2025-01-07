---
title: Functions in MSC
date: 2024-05-17
updated: 2025-01-07
---

## What are functions?

Like any language, functions in Minr Script Code are *reusable pieces of code* which perform a specific task. They allow you to encapsulate a set of instructions and give it a name, making your code more organized, readable, and maintainable. Functions can take input arguments, perform operations, and return a value if needed.

In this guide, we're going to make a function which takes in a **player** and a **set of block coordinates** and determines how far away the player is from the coordinates.

## Why are functions useful?

- **Code reuse**: Functions allow you to write a piece of code once and use it multiple times throughout your script. This saves time and effort, as you don't have to repeat the same code in different places. It also helps a lot if you need to change how your function works: you can change it in just one place.
- **Modularity**: By breaking down your script into smaller, self-contained functions, you can make your code more modular and easier to understand. Each function focuses on a specific task, making your script more structured and less cluttered.
- **Abstraction**: Functions provide a level of abstraction by hiding the complexity of a task behind a simple function call. This makes your main script more readable and allows you to focus on the high-level logic without getting bogged down in the details.

## How do you create a function?

To create a new function in MSC, you use the following syntax:
```minecraft
/function define <namespace> <returnType> <functionName>(<type_1> <argument_1>, ...)
```

- `<namespace>`: The namespace your function will be defined in. This is just a place to keep all the variables and functions for a project organised, so multiple people can use the same names for things without worrying about overlaps. Here, we'll use the `function_demo` namespace.
- `<returnType>`: The type of value the function will return: is it going to be a word, a number, a list, or something else? Here, since we're calculating a distance, we're going to be returning a `Double`. This is short for a double-precision floating point number, which is a decimal like $`3.141592`$.
- `<functionName>`: This is the name of the function, which you'll use to call it later. Let's call our function `getDistance`. Function names should be clean and descriptive: it should be obvious what they do from the name alone.
- `<type_1> <argument_1>, ...`: This is list of input arguments the function accepts, specified as pairs of Type and argument name. Arguments, or parameters, are things which a function uses to do its job. The output of a function depends on the arguments. Here, the function needs to know which player we're checking, and the coordinates we want to get the distance to. The argument name doesn't matter except within the function, so name your arguments things which are helpful and easy to remember. Here, we'll call our arguments `player` and `coordinates`, which are of type `Player` and `Int[]` respectively.

We're now ready to create our command!

```minecraft
/function define function_demo Double getDistance(Player player, Int[] coordinates)
```
This creates a function named `getDistance` in the `function_demo` namespace, which takes the two arguments we discussed. Great! But now we need our function to actually *do* something, and for that we'll need to write the script.

## Writing a function script

Writing the script for a function body is very similar to writing an interact script, except the variables that you have access to are slightly different by default. Recall that in an interact script, you can access

- `Player player`: the player who triggered your script
- `Block block`: the block they clicked on to trigger it

These variables are part of the *local namespace*: they are pre-populated, accessible variables which you can access without needing an `@using` line or a `namespace::` and which are unique to the script being run. This is also where variables created using `@define` are located.

In a function, the local namespace is instead populated with the *arguments* you defined earlier. Here, that means we have access to

- `Player player`: the player that we input into the function (this does *not* have to be the player triggering the script)
- `Int[] coordinates`: the list of coordinates that we input into the function

Now, let's write our script:
```msc
# The difference between the player's X/Y/Z ordinate and the provided one
@define Double deltaX = player.getX() - coordinates[0]
@define Double deltaY = player.getY() - coordinates[1]
@define Double deltaZ = player.getZ() - coordinates[2]
 
# Calculate the distance based on these components
@define Double distance = (deltaX^2 + deltaY^2 + deltaZ^2)^0.5
@return distance
```
Here, the distance is calculated as $`\sqrt{x^2 + y^2 + z^2}`$, by Pythagoras' Theorem. On the last line, we use the `@return` keyword. You might recognise this from normal scripts as ending the execution of a program. It still does this in functions, but it has a more important purpose: it *returns* the value of the distance as the function's *output*. We'll see what this means when we use the function.

## Importing functions

We can *import* this function using the command
```minecraft
/script import function function_demo getDistance https://paste.minr.org/ababababab
```
or alternatively add it line-by-line:
```minecraft
/script create function function_demo getDistance @define Double deltaX = player.getX() - coordinates[0]
...
```
This is similar to the process of importing any other script. For short, you can use
```minecraft
/s i f namespace functionName https://paste.minr.org/dedededede
```

## Calling functions

Okay, we have a function which calculates the distance between a player and a point. So what? How do we even use it?

The process of using a function is known as *calling* it. In MSC, this uses the `@var` keyword.
```msc
@define Double dist
@var dist = function_demo::getDistance(player, Int[123, 45, 678])
@player You are {{dist}} metres away from the point (123, 45, 678)!
```
The `function_demo::` denotes our namespace. Alternatively, if we'd used `@using function_demo` at the start of this script, we could have omitted it.

Here, since our function returns a value, we probably want to use that value. That's why we set our variable to the output of `function_demo::getDistance`. If we weren't using a value (eg. if our function was `Void`), we'd use `@var function_demo::getDistance(...)` without any `dist = ` or such. 

Note that the `player` in the function does not have to be the same as the `player` in the local namespace of the calling script. For example,
```msc
@define Double dist
@var dist = function_demo::getDistance(Player("AK1089"), Int[123, 45, 678])
@player AK1089 is {{dist}} metres away from the point (123, 45, 678)!
```
does the same thing no matter who runs it.

## More complex examples

Here's a example from real code I've written for a map:
```msc
# FUNCTION | getBookPages(Item book) -> String[]
@define String bookString = book.string()
 
# extract the pages from the book string
@define Int startIndex = bookString.indexOf("pages=[") + 7
@define String pagesString = bookString.substring(startIndex, bookString.length() - 3)
 
# split the pages string by ", " to get individual pages
@define String[] rawPages = pagesString.split(", ")
 
# process each raw page to remove leading "# file <filename>" and trailing "\\n"
@define String[] pages = String[]
@for Int i in list::range(0, rawPages.length())
    @define String rawPage = rawPages[i]
    @define Int newlineIndex = rawPage.indexOf("\\n")
    @if newlineIndex != -1
        @var pages[i] = rawPage.substring(newlineIndex + 2, rawPage.length() - 2)
    @else
        @var pages[i] = rawPage
    @fi
@done
 
@return pages
```
This function allowed me to get the pages of a written book the player was holding based on the `Item` object corresponding to it. This saved a lot of time, as in other scripts I could simply use
```msc
@define String[] bookPages = akrobots::getBookPages(player.getItemInMainHand())
# do stuff with the pages ...
```
rather than rewriting the code to extract the book pages every time. Also, say later I want to change the format of the book, and use a `§§` instead of a `#`. If I hadn't used a function, I would have had to change *every single* occurence across hundreds of scripts, but now I can just change one number in line 17 of this script.

## list::range

You've probably encountered at least one function before, possibly without realising it! The `range` function in the `list` namespace is a function, which we could recreate (if we had a `forever` keyword) as follows:

```msc
# /function define list Int[] range(Int start, Int end)
@define Int[] numbers = Int[]
@define Int x = start
 
# This doesn't really exist, but pretend it does! 
@forever
    # If we reach the end of the specified range, we can stop and feed back our generated list
    @if x >= end
        @return numbers
    @fi
    
    # Otherwise, add our current number to the list and increase it by 1 for the next round
    @var numbers.append(x)
    @var x = x + 1
@done
```
This creates a list of numbers, starting from the first argument (the `start`) and finishing when we hit the second argument (the `end`).

## Shortcuts

Let's take our previous script, which tells the player how far from a point they are.
```msc
@define Double dist
@var dist = function_demo::getDistance(player, Int[123, 45, 678])
@player You are {{dist}} metres away from the point (123, 45, 678)!
```
We can shorten this to:
```msc
@player You are {{function_demo::getDistance(player, Int[123, 45, 678])}} metres away from the point (123, 45, 678)!
```
`{{•}}` is the *evaluation operator*: it automatically evaluates everything you put inside it. Here, it's evaluating the expression `function_demo::getDistance(player, Int[123, 45, 678])`, which is equal to the distance from the player to $`(123, 45, 678)`$.

## Test yourself

How would you *define* a function in the `function_demo` namespace which:

- Chooses a random player from a provided list? ||`/function define function_demo Player chooseRandomPlayer(Player[] players)`||
- Takes a list of integers and returns the sum of the biggest two? ||`/function define function_demo Int getBiggestTwoSum(Int[] numbers)`||
- Gives everyone online a mangrove propagule?  ||`/function define function_demo Void givePropagules()`||

How would you *call* the following functions in the `function_demo` namespace from an interact script?

- `giveIngot(Player p)`, to give the player a gold ingot? ||`@var giveIngot(player)`||
- `Int maximum(Int[] numbers)`, to create the variable `x` and set it to be equal to the largest of $`-4, 10, 17`$, and $`2`$? ||`@define Int x = maximum(Int[-4, 10, 17, 2])`||


## More advanced notes and quirks

- In MSC, functions can't be overloaded (unlike constructors). This also means you can't have optional parameters.
- Functions are not [first-class](https://en.wikipedia.org/wiki/First-class_citizen) in MSC. This means you can't have lambda functions, nor can you pass functions as arguments to other functions.
- *Methods* are essentially functions which are bound to a specific Type! They are called in the same way.


## Documentation

The full MSC documentation is available at [ReadTheDocs](https://msc-documentation.readthedocs.io/en/latest/index.html). If there are any errors here, please let me know on Discord!