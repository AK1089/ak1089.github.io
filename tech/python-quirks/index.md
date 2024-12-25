---
title: Python Quirks
date: 2024-12-24
---

Here's a catalogue of some fun "unintuitive" behaviour in Python.

### Integer Memory Preallocation

```python
256 is int("256")
257 is int("257")
```

This is because Python ||preallocates the integers from -5 to 256 at initialisation, meaning they are always at the same address in memory, while integers beyond this range can have multiple different references.||

### Floating Point Weirdness

```python
int((3.0 * 0.1 - 0.3) ** (-0.1))
```

This maps to an integer, despite the fact that $`(3 \times 0.1 - 0.3)^{-0.1} = 0^{-0.1}`$ is undefined. Can you guess the integer?

In fact, it is ||forty-two (42). This is because `0.3` is not representable exactly in binary.||

### Lambda Arguments Are Captured at Definition Time

```python
funcs = [(lambda: i) for i in range(3)]
[f() for f in funcs]
# [2, 2, 2] rather than [0, 1, 2]
```

The `i` in the lambda definition references the variable, rather than its value at that point in time!

### Default Arguments Can Be Mutated

```python
def append_to_list(item, my_list=[]):
    my_list.append(item)
    return my_list
# now run the function twice
append_to_list(1)  # [1] as expected
append_to_list(2)  # [1, 2] rather than [2]
```

The list `my_list=[]` in the function definition defines an empty list. Since lists are mutable, the first time we call the function, `1` is appended to this default list, and remains there indefinitely.

### Attributes Have Their Name Mangled

```python
class MyClass:
    def __init__(self):
        self.__private = 42
# create a member of the class
obj = MyClass()
obj.__private
# AttributeError: 'MyClass' object has no attribute '__private'
obj._MyClass__private  # 42
```

When beginning attribute names with a double underscore, their names are mangled to mark them as private.

### And / Or

```python
'a' and 'b'  # 'b'
'a' or 'b'   # 'a'
```

In Python, `left and right` is actually equivalent to `right if left else left`: it returns the first false-like argument or the last true argument. Conversely, `left or right` is equivalent to `left if left else right`.

### String Interning

```python
a = "hello"
b = "hello"
a is b  # True
a = "hello world"
b = "hello world"
a is b  # False
```

As an optimisation technique, Python stores single words and other short strings in a string intern pool to re-use their addresses in memory.

### Bonus Quirk: JavaScript

```javascript
['0'].map(parseInt)
['1', '0'].map(parseInt)
['2', '1', '0'].map(parseInt)
['3', '2', '1', '0'].map(parseInt)
['4', '3', '2', '1', '0'].map(parseInt)
['5', '4', '3', '2', '1', '0'].map(parseInt)
['6', '5', '4', '3', '2', '1', '0'].map(parseInt)
['7', '6', '5', '4', '3', '2', '1', '0'].map(parseInt)
```

Try these in turn, trying to predict each before you do it. You can look at the previous results before guessing. They map to:

||`[0]`|| for just 0
||`[1, NaN]`|| for 1 down to 0
||`[2, NaN, 0]`|| for 2 down to 0
||`[3, NaN, 1, 0]`|| for 3 down to 0
||`[4, NaN, NaN, 1, 0]`|| for 4 down to 0
||`[5, NaN, NaN, 2, 1, 0]`|| for 5 down to 0
||`[6, NaN, NaN, NaN, 2, 1, 0]`|| for 6 down to 0
||`[7, NaN, NaN, NaN, 3, 2, 1, 0]`|| for 7 down to 0

This is because `parseInt` ||takes a second argument for the radix (base): by default the list index.||