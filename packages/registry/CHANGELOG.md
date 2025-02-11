# @traversable/registry

## 0.0.1

### Patch Changes

- [#28](https://github.com/traversable/traversable/pull/28) [`18ad718`](https://github.com/traversable/traversable/commit/18ad718682bd2f3d7bf100737605bb7c328a9e6d) Thanks [@ahrjarrett](https://github.com/ahrjarrett)! - ❲🌳❳ ‹‹‹ ❲release v0.1.0❳

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
    still in pre-alpha, **the API is subject to change** in the coming month as we prepare
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

- [#28](https://github.com/traversable/traversable/pull/28) [`8e8c41f`](https://github.com/traversable/traversable/commit/8e8c41f9a922e6451b82fa47be5e8fc6efca1f57) Thanks [@ahrjarrett](https://github.com/ahrjarrett)! - ✨(registry): adds type utilities: `Partial`, `Required`, `Require`, `KeepFirst`, `KeepLast`, `Force`, `Mutable`, `Part`

- [#17](https://github.com/traversable/traversable/pull/17) [`7faac8d`](https://github.com/traversable/traversable/commit/7faac8d9f7d2a8f45cbdf58726b702ce4b2c474c) Thanks [@ahrjarrett](https://github.com/ahrjarrett)! - ### new features:

  ✨(registry): implements global known-symbol registry

- [#26](https://github.com/traversable/traversable/pull/26) [`9b70cbc`](https://github.com/traversable/traversable/commit/9b70cbc748f72dd2e3af91184bbcf8437747e75c) Thanks [@ahrjarrett](https://github.com/ahrjarrett)! - ### fixes

  - 🐛 fixes an assignability bug with `data.Compare`. Assignability should work in all cases now
    0f46a5c \* origin/@ahrjarrett/api 🐛(data): fixes `data.Compare` assig… Andrew Jarrett 2 minutes
