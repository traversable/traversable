---
"@traversable/registry": minor
"@traversable/algebra": minor
"@traversable/openapi": minor
"@traversable/bench": minor
"@traversable/core": minor
"@traversable/data": minor
"@traversable/http": minor
"@traversable/client": minor
---

❲🌳❳ ‹‹‹ ❲release v0.1.0❳

This release is an MPV, and although it does not include all of the targets
originally planned, the targets that it does currently support are looking
pretty solid / complete.

Supported targets:

- `zod` schemas
- `arktype` schemas
- `typebox` schemas
- `fast-check` arbitraries

In addition to those, there are a handful of lower-level primitives
that we built that we will be using to implement other features in the
future, that we believe other library authors might find useful:

- `OpenAPI.map`: a type-safe, structure preserving _map_ operation that 
  recursively applies a mapping function to every "hole" (schema or ref) 
  in an OpenAPI document
- `OpenAPI.fold`: a type-safe, lawful _fold_ that recursively applies a
  reduce-like operation to an OpenAPI document, powered by `OpenAPI.map`
- `OpenAPI.generate`: a `fast-check` arbitrary capable of generating
  arbitrary OpenAPI documents -- some very interesting things become
  possible when you have a way to generate the specification itself

- `zod.map`: if you have a zod schema, `zod.map` recusively applies a
  function to every node in the tree, which makes "schema rewrites"
  trivial to implement

- `typebox.map`: if you have a zod schema, `zod.map` recusively applies a
  function to every node in the tree, which makes "schema rewrites"
  trivial to implement


Notable features:
- JSDocs
  - [TODO]
- Testing strategy
  - [TODO]
- Recursion schemes
  - [TODO]

Caveats:

- Currently the API's surface area is currently _way too big_, and since the library is 
still in pre-alpha, __the API is subject to change__ in the coming month as we prepare 
for an alpha release.

Prior art:

- [`io-ts`](https://github.com/gcanti/io-ts)`, TypeScript's original schema library

- [`zod`](https://github.com/colinhacks/zod), the most popular schema library on
the market today, paved the way for others like it

- [`arktype`](https://github.com/arktypeio/arktype), the up-and-coming schema library
that doesn't get enough credit

- [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)

- Bartosz Milewski's [category theory lectures](https://youtu.be/I8LbkfSSR58?si=Q-CwMWndEZK4V5d4) 
(most of them went over my head, but his talks on Functors, and recursion schemes in particular,
had a tremendous impact on the abstractions we built)

