# @traversable/data

## 0.0.3

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

- [#28](https://github.com/traversable/traversable/pull/28) [`1288884`](https://github.com/traversable/traversable/commit/1288884689fbf43bb4c38e3f49064bbf942c5d0f) Thanks [@ahrjarrett](https://github.com/ahrjarrett)! - ✨(data): adds `data.record.of` utility

- [#17](https://github.com/traversable/traversable/pull/17) [`7eb32eb`](https://github.com/traversable/traversable/commit/7eb32eb5574e242ca79ebd19b076fff4a65d2f9f) Thanks [@ahrjarrett](https://github.com/ahrjarrett)! - ✨(data): adds `object.finite`, `object.nonfinite`, `Option.fromArray`, `Option.toArray`

- [#26](https://github.com/traversable/traversable/pull/26) [`9b70cbc`](https://github.com/traversable/traversable/commit/9b70cbc748f72dd2e3af91184bbcf8437747e75c) Thanks [@ahrjarrett](https://github.com/ahrjarrett)! - ### fixes

  - 🐛 fixes an assignability bug with `data.Compare`. Assignability should work in all cases now
    0f46a5c \* origin/@ahrjarrett/api 🐛(data): fixes `data.Compare` assig… Andrew Jarrett 2 minutes

- Updated dependencies [[`18ad718`](https://github.com/traversable/traversable/commit/18ad718682bd2f3d7bf100737605bb7c328a9e6d), [`8e8c41f`](https://github.com/traversable/traversable/commit/8e8c41f9a922e6451b82fa47be5e8fc6efca1f57), [`7faac8d`](https://github.com/traversable/traversable/commit/7faac8d9f7d2a8f45cbdf58726b702ce4b2c474c), [`9b70cbc`](https://github.com/traversable/traversable/commit/9b70cbc748f72dd2e3af91184bbcf8437747e75c)]:
  - @traversable/registry@0.0.1

## 0.0.2

### Patch Changes

- [#11](https://github.com/traversable/traversable/pull/11) [`6a7cdd1`](https://github.com/traversable/traversable/commit/6a7cdd1815eefdb47b6faf27cd27e7c060339d24) Thanks [@ahrjarrett](https://github.com/ahrjarrett)! - ### breaking changes

  - `data.object`: renames `object.isNonPrimitiveObject` to `object.isComposite`
  - `data.string`: changes the RegExp used to determine whether a string is an identifier or not

    - this change was made to ensure that we're covering the [full spectrum](https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5Cp%7BID_Start%7D) of valid identifiers
    - we don't expect this change to break your code unless you depend on identifier names / properties that are uncommon

  ### new features

  - `data.key.fromString`
  - `data.key.fromNumber`
  - `data.key.fromSymbol`
  - `data.key.as`
  - `data.key.asAccessor`
  - `data.string.unescape`
  - `data.prop.isPoisonable`: detects whether a property name is subject to prototype poisoning

  ### performance improvements

  - `data.string`: makes `string.escape` faster by using charCodes

  ### testing

  Adds property tests for:

  - `data.key.as`
  - `data.string.escape`
  - `data.string.unescape`

## 0.0.1

### Patch Changes

- [#1](https://github.com/traversable/traversable/pull/1) [`b2bcc9c`](https://github.com/traversable/traversable/commit/b2bcc9c676d775e4189c5c0fdd7e152e45d18bf8) Thanks [@ahrjarrett](https://github.com/ahrjarrett)! - ### new packages

  :tada: first release for the following packages:

  - bench
  - core
  - data
  - http
  - openapi
