import type { newtype } from "any-ts"
import type { URI } from "./symbol.js"

export type { newtype } from "any-ts"

export type inline<T> = T
export type _ = {} | null | undefined
export type defined<T> = never | globalThis.Exclude<T, undefined>

export type Produces<T> = T extends (_: infer I) => unknown ? I : never
export type Consumes<T> = T extends (_: never) => infer O ? O : never
export type Partial<T> = never | { -readonly [K in keyof T]+?: T[K] }
export type Required<T> = never | { -readonly [K in keyof T]-?: T[K] }
export type KeepFirst<S, T> = never | KeepLast<T, S>
export type KeepLast<S, T> = never | Force<Omit<S, keyof (S | T)> & T>
export type Mutable<T> = never | { -readonly [K in keyof T]: T[K] }

interface Covariant<T extends (_: never) => unknown> {
  (_: never): Consumes<T>
}
interface Contravariant<T extends (_: never) => unknown> {
  (_: Produces<T>): void
}
interface Invariant<T extends (_: never) => unknown> {
  (_: Produces<T>): Consumes<T>
}

interface Bivariant<T extends { (_: never): unknown }> extends newtype<{ _(_: Consumes<T>): Produces<T> }> {}

export declare namespace Position {
  type covariant<T> = never | Covariant<{ (_: never): T }>
  type invariant<T> = never | Invariant<{ (_: T): T }>
  type contra<T> = never | Contravariant<{ (_: T): void }>
  /**
   * ## {@link bivariant `Position.bivariant`}
   *
   * When TypeScript checks a _function_ for assignability, the normal rules
   * are totally reversed: in that context, the _wider_ function is the one
   * that _depends_ on "less" (assuming return types are the same).
   *
   * This is not TypeScript being weird -- this is true in other languages
   * as well: Java, Haskell, TypeScript all take a type parameter's _variance_
   * into account like this.
   *
   * But what _is_ weird about TypeScript is the escape hatch they created:
   * expecting JavaScript developers to be confused about this counter-intuitive
   * behavior, they made an exception to the rule:
   *
   * When it comes to _methods_, the rules don't apply.
   *
   * To be more precise, when the compiler checks a method's type for assignability,
   * it puts the arguments in _bivariant_ position.
   *
   * It seems like the compiler does the same when comparing a function's implementation
   * to its overloads, so my guess is that the same mechanism is responsible for both
   * behaviors.
   *
   * Once you've put your type in bivariant position, the type is available under
   * the `_` (underscore) prop.
   *
   * @example
   * import type { Position } from "@traversable/registry"
   *
   * declare const bivariant: Position.bivariant<number>
   * //            ^? const bivariant: Bivariant<(_: number) => number>
   *
   * type ok_01 = typeof bivariant extends { _(_: unknown): unknown } ? true : false
   * //   ^? type ok_01 = true
   * type ok_02 = typeof bivariant["_"] extends { _(_: unknown): unknown }["_"] ? true : false
   * //   ^? type ok_02 = true
   *
   * type ko_03 = typeof bivariant extends { _: (_: unknown) => unknown } ? true : false
   * //   ^? type ko_03 = false
   * type ko_04 = typeof bivariant["_"] extends (_: unknown) => unknown ? true : false
   * //   ^? type ko_04 = false
   */
  type bivariant<T> = never | Bivariant<(_: T) => T>
}

/**
 * A neat (as in tidy), extensible implementation of HKTs in TypeScript.
 *
 * Clocking in at only 2 lines of code, this presentation is
 * __short__ and __direct__.
 *
 * Explicit design goals:
 *
 * - **Nothing _fancy_**
 *
 *   Optimize for legibility. No big abstractions, no heavy machinery.
 *
 *   This topic can seem intimidating, especially for newcomers, so let's
 *   not add to the confusion. If it seems too complicated, it's
 *   probably too complicated. Toss it or stash it, and move on.
 *
 * - **Optimize for the call site**
 *
 *   This implementation accepts 2 optional type paramters:
 *
 *   - `in$`
 *   - `out$`
 *
 *   They both serve 2 purposes:
 *
 *   1. as initializers, or seed values
 *   2. as constraints, to define a kind's upper and/or lower bounds
 *
 *   When you declare a kind, the goal is to eventually _override_ the
 *   default behavior. To support this, this implementation exposes
 *   two "slots":
 *
 *   - `~0` (corresponds to `in$`)
 *   - `~1` (corresponds to `out$`)
 *
 *   - These names are intentionally
 *   [out-of-band](https://en.wikipedia.org/wiki/Out-of-band)
 *
 *   - {@link globalThis.Symbol `Symbols`} intentionally avoided
 *   to keep API surface area small, and to keep the API "spec-able"
 *
 *   - Tildes (`~`) are used because for its low precedence compared
 *   to alphanumeric characters.
 *
 *   - By default most IDEs put names that start with (for example)
 *   `_` or `$` at the _top_ of of auto-completion lists. Using a tilde
 *   pushes the name _down_ the list, which makes sure that the _user's_
 *   API is what gets seen first (rather than ours).
 */
export interface Kind<I = unknown, O = unknown> extends newtype<{ ["~0"]?: I; ["~1"]?: O }> {}
export type bind<F extends Kind, T = never> = never | [T] extends [never]
  ? [F] extends [Kind]
    ? F
    : Kind<F>
  : Kind.apply<F, T>
export type apply<F extends Kind, T extends F["~0"]> = never | (F & { ["~0"]: T })["~1"]
export type apply$<F, T> = never | (F & { ["~0"]: T; ["~1"]: unknown })["~1"]

export declare function apply$<F>(F: F): <T>(t: T) => Kind.apply$<F, T>

export declare namespace Kind {
  export { apply, apply$ }
  export interface satisfies<F extends Kind> extends newtype<F["~0"] & {}> {}
  export type unapply<F extends Kind> = F extends Kind & infer T ? T : never
}

/**
 * ## {@link Fix `Fix`}
 *
 * @example
 *  import { Kind, Fix } from "@traversable/registry"
 */
export interface Fix<F> extends Kind<F, Fix<F>> {}
// export interface Fix<F> extends Kind<Fix<F>> { ["~1"]: this, unfix: Kind<F, Fix<F>>["~0"] }
// export interface Fix<F> extends Kind<Fix<F>>, newtype<{ unfix: Kind<F, Fix<F>> }> {}

/**
 * ## {@link Countable `Countable`}
 *
 * Greatest-lower bound of the set of "indexable" values.
 *
 * @example
 *  import type { Countable } from "@traversable/registry"
 *
 *  declare const ex_01: Countable<"a" | "b" | "c">
 *
 *  const ex_02 = ex_01[Math.floor(Math.random() * 100)]
 *  //     ^? const ex_02: "a" | "b" | "c" | undefined
 */
export interface Countable<T = unknown> {
  [x: number]: T
}

/**
 * ## {@link Indexable `Indexable`}
 */
export interface Indexable<T = unknown> {
  [x: symbol | string]: T
}

/**
 * ## {@link Spreadable `Spreadable`}
 *
 * Greatest-lower bound of the set of "spreadable" values.
 *
 * @example
 *  import type { Spreadable } from "@traversable/registry"
 *
 *  declare const ex_01: Spreadable<1 | 2 | 3>
 *
 *  // ex_01 can be spread
 *  const ex_02 = [...ex_01]
 *  //     ^? const ex_02: (1 | 2 | 3)[]
 */
export interface Spreadable<T = unknown> {
  [Symbol.iterator](): globalThis.Iterator<T>
}

/**
 * ## {@link Enumerable `Enumerable`}
 */
export interface Enumerable<T = unknown> extends Spreadable<T> {
  [x: number]: T
  length: number
}

/**
 * ## {@link Functor `Functor`}
 */
export interface Functor<F extends Kind = Kind, _F = any> {
  _F?: 1 extends _F & 0 ? F : _F
  map<S, T>(f: (s: S) => T): (F: Kind.apply<F, S>) => Kind.apply<F, T>
}

export declare namespace Functor {
  type map<F extends Kind> =
    | never
    | {
        <S, T>(f: (s: S) => T): { (F: Kind.apply<F, S>): Kind.apply<F, T> }
        <S, T>(F: Kind.apply<F, S>, f: (s: S) => T): Kind.apply<F, T>
      }
  type Algebra<F extends Kind, T> = never | { (term: Kind.apply<F, T>): T }
  type Coalgebra<F extends Kind, T> = never | { (expr: T): Kind.apply<F, T> }
  type RAlgebra<F extends Kind, T> = never | { (term: Kind.apply<F, [F, T]>): T }
  type RCoalgebra<F extends Kind, T> = never | { (expr: T): Kind.apply<F, Either<F, T>> }
  type infer<T> = T extends Functor<any, infer F> ? Exclude<F, undefined> : never
}

/**
 * ## {@link Predicate `Predicate`}
 *
 * A predicate is a unary function that returns a boolean.
 *
 * Whereas the {@link boolean `boolean`} module is concerned with
 * `true` or `false`, a lot of interesting things happen when we promote
 * a boolean to a predicate -- namely, we gain _portability_ and
 * _composability_.
 *
 * A predicate forms the basis of first-order logic, which allows us
 * to make logical statements about non-logical objects.
 *
 * See also:
 * - the Wikipedia page on
 * [first-order logic](https://en.wikipedia.org/wiki/First-order_logic)
 */
export type Predicate<in T = any> = (value: T) => boolean

/**
 * ## {@link Predicate `Predicate`}
 */
export type Equal<in T> = (left: T, right: T) => boolean

/**
 * ## {@link Compare `Compare`}
 *
 * Describes a binary operation that compares 2 elements of type {@link T `T`},
 * and returns a number summarizing their "order":
 *
 * - `-1` means {@link left `left`} is _less-than_ {@link right `right`}
 * - `+1` means {@link left `left`} is _greater-than_ {@link right `right`}
 * - `0` means {@link  left `left`} and {@link right `right`} are _equal_
 *
 * See also:
 * - {@link Equal `Equal`}
 * - the Wikipedia page for [total orders](https://en.wikipedia.org/wiki/Total_order)
 */
export interface Compare<in T> {
  (left: T, right: T): -1 | 0 | 1
  (left: T, right: T): number
}

export declare namespace Compare {
  export { Compare_any as any, Compare_object as object, Compare_infer as infer }
}
export declare namespace Compare {
  type Compare_any = Compare<any>
  type Compare_object<T> = never | Compare<{ -readonly [K in keyof T]: Compare.infer<T[K]> }>
  type Compare_infer<T> = [T] extends [Compare<infer U>] ? U : never
}

/**
 * ## {@link Pick `Pick`}
 *
 * Similar to the built-in {@link globalThis.Pick `Pick`} utility, but eagerly
 * evaluates its target.
 *
 * Like the built-in utility, this implementation is homomorphic
 * (structure-preserving)
 */
export type Pick<T, K extends keyof T> = never | { -readonly [P in K]: T[P] }

/**
 * ## {@link Omit `Omit`}
 *
 * Similar to the built-in {@link globalThis.Omit `Omit`} utility, but eagerly
 * evaluates its target.
 *
 * Like the built-in utility, this implementation is homomorphic
 * (structure-preserving)
 */
export type Omit<T, K extends keyof any> = never | Pick<T, Exclude<keyof T, K>>

/**
 * ### {@link Force `Force`}
 *
 * There are a few use cases for the {@link Force `Force`} operation:
 *
 * - forcing evaluation
 * - "forgetting" the differences between intersections, by merging them into a single type
 * - to break an interface open so you can see the properties it contains
 */
export type Force<T> = never | { -readonly [K in keyof T]: T[K] }

/**
 * ### {@link Spread `Spread`}
 *
 * Preserves JSDoc annotations. If a property is has JSDoc annotations in both
 * {@link T `T`} and {@link U `U`}, the docs for the property in {@link U `U`}
 * are concatenated onto the end of the docs for the property in {@link T `T`}.
 */
export type Spread<T, U, _K extends keyof (T | U) = keyof (T | U)> =
  | never
  | (Pick<T | U, _K> & Omit<T, _K> & Omit<U, _K>)

/**
 * ### {@link Merge `Merge`}
 *
 * Preserves JSDoc annotations. If a property is has JSDoc annotations in both
 * {@link T `T`} and {@link U `U`}, the docs for the property in {@link U `U`}
 * are concatenated onto the end of the docs for the property in {@link T `T`}.
 */
export type Merge<T, U> = never | Force<Spread<T, U>>

export type Part<T, K extends keyof T = never> = [K] extends [never]
  ? never | Partial<T>
  : KeepLast<T, { -readonly [P in K]+?: T[P] }>

// export type Part<T, K extends keyof T = never> = [K] extends [never]
// 	? Optional<T>
// 	: Force<Omit<T, K> & Optional<T, K>>

export type Require<T, K extends keyof T = never> = [K] extends [never]
  ? never | Required<T>
  : KeepLast<T, { -readonly [P in K]-?: T[P] }>

export type Optional<T, K extends keyof T = keyof T> = never | { [P in K]+?: T[P] }

/**
 * ## {@link Sort `Sort`}
 *
 * If {@link Compare `Compare`} describes the relationship between
 * two members of a total order, then a sort operation is simply the
 * application of the comparison to `n` number of elements.
 *
 * See also:
 * - {@link Compare `Compare`}
 */
export type Sort<in out T> = (array: readonly T[]) => readonly T[]
export declare namespace Sort {
  export type infer<T> = [T] extends [Sort<infer U>] ? U : never
  export type { Sort_any as any }
  export type Sort_any<T extends Sort<any> = Sort<any>> = T
}

/**
 * ## {@link MapSort `MapSort`}
 *
 * Given a function that maps to elements of a total order, and
 * a sequence of `n` elements from the function's codomain,
 * applies to the function to each element, then, orders the
 * sequence.
 *
 * This operation is similar to a "selector" function, and is
 * useful primarily as a composition primitive, since it allows
 * a small set of sorting function to be applied to any arbitrary
 * input, given a function between them.
 *
 * See also:
 * - {@link Sort `Sort`}
 * - the Wikipedia page on
 *   [contravariant functors](https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science))
 *
 */
export type MapSort<in T> = <S>(fn: (s: S) => T) => Sort<S>
export declare namespace MapSort {
  /**
   * ### {@link infer `MapSort.infer`}
   * Type-level utility that extracts
   */
  export type infer<T> = [T] extends [MapSort<infer U>] ? U : never
  export type { MapSort_any as any }
  export type MapSort_any<T extends MapSort<any> = MapSort<any>> = T
}

/**
 * ## {@link Option `Option`}
 *
 * Usually the first algebraic data type (ADT) that people encounter.
 * It has numerous names/encodings: Haskell's `Maybe`, Scala's
 * `Optional`.
 *
 * A simple, but useful primitive. These two use cases come to mind, but there
 * are others:
 *
 * - {@link Option `Option`} can be used as a kind of "type-safe null pointer"
 * - {@link Option `Option`} can be used as a control-flow primitive
 *
 * See also:
 * - {@link Result `Result`}
 * - the Wikipedia page for the
 * [option type](https://en.wikipedia.org/wiki/Option_type)
 */
export type Option<T> = None | Some<T>
export interface None {
  _tag: URI.None
}
export interface Some<T> {
  _tag: URI.Some
  value: T
}

/**
 * ## {@link Result `Result`}
 *
 * Like {@link Option `Option`}, {@link Result `Result`} is often
 * used to describe an operation that can fail.
 *
 * Unlike {@link Option `Option`}, {@link Result `Result`}
 * comes with an extra "slot" that's most commonly used to encode the
 * _reason_ why an operation failed.
 *
 * Like all ADTs, there are good reasons to use it, and good reasons to not
 * use it. Depends entirely on the use case.
 *
 * See also:
 *
 * - {@link Option `Option`}
 * - Rust's docs on [`Result`](https://doc.rust-lang.org/std/result/)
 */
export type Result<T = unknown, E = never> = Ok<T> | Err<E>
export interface Ok<T> {
  _tag: URI.Ok
  ok: T
}
export interface Err<T> {
  _tag: URI.Err
  err: T
}

/**
 * ## {@link Either `Either`}
 *
 * Isomorphic to {@link Result `Result`}, just comes with a slightly different
 * semantics.
 *
 * Whereas {@link Result `Result`} has an "error" channel, {@link Either `Either`}'s
 * corresponding channel is just called a "left".
 *
 * See also:
 * - {@link Left `Left`}
 * - {@link Right `Right`}
 * - {@link Result `Result`}
 */
export type Either<E = never, T = unknown> = Left<E> | Right<T>

/**
 * ## {@link Left `Left`}
 *
 * Member of the {@link Either `Either`} sum type, along with {@link Right `Right`}.
 *
 * See also:
 * - {@link Either `Either`}
 * - {@link Right `Right`}
 */
export interface Left<E> {
  _tag: URI.Left
  left: E
}

/**
 * ## {@link Right `Right`}
 *
 * Member of the {@link Either `Either`} sum type, along with {@link Left `Left`}.
 *
 * See also:
 * - {@link Either `Either`}
 * - {@link Left `Left`}
 */
export interface Right<T> {
  _tag: URI.Right
  right: T
}

/**
 * ## {@link Semigroup `Semigroup`}
 *
 * See also:
 * - {@link Monoid `Monoid`}
 * - [Wikipedia page](https://en.wikipedia.org/wiki/Semigroup)
 */
export interface Semigroup<in out T> {
  concat(left: T, right: T): T
}

/**
 * ## {@link Monoid `Monoid`}
 *
 * See also:
 * - {@link Semigroup `Semigroup`}
 * - [Wikipedia page](https://en.wikipedia.org/wiki/Monoid)
 */
export interface Monoid<in out T> extends Semigroup<T> {
  empty: T
}
