<h1 align="center">
<pre>
 @traversable/data
</pre>
</h1>

A small standard library for TypeScript, organized by data structure.

## goals

### cohesion

- modules are organized is grouped by "target" datatype/data structure
  first
  - for example, `object`, `array`, `key`

- cross-cutting operations live with the data type they describe

  - this includes type-classes / trait-like features

    - for example, set membership: 

      - `integer.is`
      - `array.is`
      - `object.is`

    - for example, equality/equivalence: `integer.equal`, `array.equal`, `object.equal`

- in general, the `@traversable/data` package tries to make as few assumptions about how
  or where it will be used as possible. 

  - to that end, most `@traversable` packages are downstream of `@traversable/data`.

    - all notable exceptions to this rule are situated upstream for testing purposes only,
      and so must be added a dev dependencies to avoid introducing a dependency cycle.

### non-goals

- because `@traversable/data` draws its module boundaries at the boundaries between datatypes, 
  it tends to be less suitable for things like:

  - domain-specific languages
  - EDSLs
  - combinators / combinatory logic
  
  For that sort of thing, try `@traversable.core`.
  