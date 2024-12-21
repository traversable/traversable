# @traversable/algebra

`@traversable/algebra` contains a bunch of schema interpreters called _F-algebras_ or simply __algebras__.

**Disclaimer:** Algebras are pretty math-y, and I'd be lying to you if I said I fully grok the category theory 
behind them.

Algebras give us a way to write __recursion schemes__.

Recursion schemes are what you get when you take a recursive operation, abstract away the recursive parts, 
and then fully invert control.

The parts you'll probably find most useful:

1. The [concrete interpreters TODO - link to dir](TODO), which take an arbitrary JSON Schema, and generate
arbitrary (but lawful) code


 
## Resources:
 
- Zainab Ali's has a nice, friendly talk called
   [Introduction to Recursion Schemes](https://www.youtube.com/watch?v=XZ9nPZbaYfE) 
   that makes very few assumptions about her audience's familiarity with category theory
 
- Bartosz's has a detailed [blogpost](https://bartoszmilewski.com/2017/02/28/f-algebras/) covering F-algebras
 
- Patrick Thomson's [series on recursion schemes](https://blog.sumtypeofway.com/posts/introduction-to-recursion-schemes.html) is a good middleground

## Intro to recursion schemes

Let's talk through an example.

Let's say we want to write a function that works like `JSON.stringify`. This version won't accept any arguments besides the raw JSON 
we want to stringify.

How would we go about writing this function?

Here's a short implementation that will work for most cases -- this one won't escape any strings and will throw if any of its keys are 
wrapped in quotation marks, but let's say that's OK for our use case.

```javascript
const is = {
  null: (u) => u == null,
  boolean: (u) => u == typeof u === "boolean",
  integer: Number.isInteger,
  number: (u) => typeof u === "number",
  string: (u) => typeof u === "string",
  array: Array.isArray,
  object: (u) => u !== null && typeof u === "object" && !Array.isArray(u),
}

function LOOP(_) {
  switch (true) {
    case is.null(_): return 'null'
    case is.boolean(_): return _ ? 'true' : 'false'
    case is.integer(_): return _ + ''
    case is.number(_): return _ + ''
    case is.string(_): return '"' + _ + '"'
    case is.array(_): return '[' + _.map(LOOP).join(",") + ']'
    case is.object(_): return '' +
      '{' + Object.entries(_).map(([k, v]) => `"${k}":` + LOOP(v)).join(",") + '}'
    default: throw Error("illegal state", JSON.stringify(_))
  }
}
```

