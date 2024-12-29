import type { newtype } from "any-ts"
import type { URI } from "./symbol.js"

export type { newtype } from "any-ts"

export type inline<T> = T
export type _ = {} | null | undefined
export type defined<T> = never | globalThis.Exclude<T, undefined>

export type Showable = null | undefined | boolean | number | bigint | string
export type Primitive = null | undefined | boolean | number | bigint | string | symbol
export type Entry<T> = readonly [k: string, v: T]
export type Entries<T> = readonly Entry<T>[]
export interface Array<T = unknown> extends newtype<readonly T[]> {}

export type Consumes<T> = T extends (_: infer I) => unknown ? I : never
export type Produces<T> = T extends (_: never) => infer O ? O : never
export type Returns<T> = T extends (..._: any) => infer O ? O : never
export type Partial<T> = never | { -readonly [K in keyof T]+?: T[K] }
export type Required<T> = never | { -readonly [K in keyof T]-?: T[K] }
export type KeepFirst<S, T> = never | KeepLast<T, S>
export type KeepLast<S, T> = never | Force<Omit<S, keyof (S | T)> & T>
export type Mutable<T> = never | { -readonly [K in keyof T]: T[K] }
export type Target<S> = S extends Guard<infer T> ? T : S extends Predicate<infer T> ? T : never
export type Source<T> = T extends (_: infer S) => any ? S : never
export type AllOf<T> = Intersect<{ [K in keyof T]: Target<T[K]> }, unknown>
export type AnyOf<T> = Target<T[number & keyof T]>
export type Intersect<S, O = unknown> = S extends readonly [infer H, ...infer T] ? Intersect<T, O & H> : O
export type Join<T extends readonly string[], Delimiter extends string = ""> = Join.loop<"", T, Delimiter>
export declare namespace Join {
  type loop<Out extends string, S extends readonly unknown[], Delimiter extends string> = S extends readonly [
    infer H extends string,
    ...infer T,
  ]
    ? loop<`${Out}${Out extends "" ? "" : Delimiter}${H}`, T, Delimiter>
    : Out
}

interface Covariant<T extends (_: never) => unknown> {
  (_: never): Produces<T>
}
interface Contravariant<T extends (_: never) => unknown> {
  (_: Consumes<T>): void
}
interface Invariant<T extends (_: never) => unknown> {
  (_: Consumes<T>): Produces<T>
}
interface Bivariant<T extends { (_: never): unknown }> extends newtype<{ _(_: Consumes<T>): Produces<T> }> {}

export declare namespace Position {
  type covariant<T> = never | Covariant<{ (_: never): T }>
  type invariant<T> = never | Invariant<{ (_: T): T }>
  type contra<T> = never | Contravariant<{ (_: T): void }>
  /**
   * ## {@link bivariant `Position.bivariant`}
   *
   * When TypeScript checks a _function_ type, what you get is something like the
   * type-level equivalent of [Opposite Day](https://www.youtube.com/watch?v=pod4NRWn_Ak).
   *
   * Essentially, the normal rules of assignment work _exactly_ backwards:
   *
   * ```typescript
   * type Producer<T> = (_: any) => T
   * type Consumer<T> = (_: T) => any
   *
   * type Ex01 = Producer<3> extends Producer<number> ? true : false
   * //   ^? type Ex01 = true
   * type Ex02 = Consumer<3> extends Consumer<number> ? true : false
   * //   ^? type Ex02 = false
   *
   * type Ex03 = Producer<number> extends Producer<3> ? true : false
   * //   ^? type Ex03 = false
   * type Ex04 = Consumer<number> extends Consumer<3> ? true : false
   * //   ^? type Ex04 = true
   * ```
   *
   *
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
   * See also:
   * - [TypeScript 2.4 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-4.html#strict-contravariance-for-callback-parameters)
   * - [TypeScript 2.8 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#conditional-types)
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
 *   -  `0` (corresponds to `I`)
 *   - `-1` (corresponds to `O`)
 *
 *   **Note:**
 *   The `-1` slot is intentionally [out-of-band](https://en.wikipedia.org/wiki/Out-of-band)
 *   so that this type can support users extending it to add additional "arguments".
 *   If `1` was the "output" channel, then this encoding can't be exploited to take advantage
 *   of the [natural adjunction](https://en.wikipedia.org/wiki/Tensor-hom_adjunction) that
 *   exists between an arguments position in a curried function and its index in the same
 *   function's uncurried form.
 *
 *   - {@link globalThis.Symbol `Symbols`} intentionally avoided
 *   to keep API surface area small, and to keep the API "spec-able"
 */

export interface HKT<I = unknown, O = unknown> extends newtype<{ [0]: I; [-1]: O }> {}
export type apply<F extends HKT, T extends F[0]> = never | (F & { [0]: T })[-1]
export type apply$<F, T> = never | (F & { [0]: T; [-1]: unknown })[-1]
export type forall<F extends HKT> = HKT.apply<F, unknown>

export declare function apply$<F>(F: F): <T>(t: T) => HKT.apply$<F, T>

type HKT_const<T> = HKT<unknown, T>
export declare namespace HKT {
  export { apply, apply$, forall, HKT_const as const }
  export interface satisfies<F extends HKT> extends newtype<F[0] & {}> {}
  export type unapply<F extends HKT> = F extends HKT & infer T ? T : never
  export type product<F extends HKT, T> = HKT.apply<F, [F, T]>
  export type sum<F extends HKT, T> = HKT.apply<F, Either<F, T>>
}

// export interface Fix_<F> extends HKT<F, Fix_<F>> {}

/**
 * ## {@link Fix `Fix`}
 *
 * @example
 *  import { HKT, Fix } from "@traversable/registry"
 */
export interface Fix<F> {
  get fix(): Fix<this>
  get unfix(): F
}
export type Unfix<F extends Fix<any>> = F["unfix"]

// export interface Fix<F> extends HKT<F, Fix<F>> {}
// export interface Fix<F> extends HKT<Fix<F>> { [-1]: this, unfix: HKT<F, Fix<F>>[0] }
// export interface Fix<F> extends HKT<Fix<F>>, newtype<{ unfix: HKT<F, Fix<F>> }> {}

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
export interface Functor<F extends HKT = HKT, _F = any> {
  _F?: 1 extends _F & 0 ? F : Extract<_F, HKT>
  map<S, T>(f: (s: S) => T): (F: HKT.apply<F, S>) => HKT.apply<F, T>
}

export declare namespace Functor {
  type map<F extends HKT> =
    | never
    | {
        <S, T>(st: (s: S) => T): { (F: HKT.apply<F, S>): HKT.apply<F, T> }
        <S, T>(F: HKT.apply<F, S>, st: (s: S) => T): HKT.apply<F, T>
      }
  // type AlgebraFromFunctor<F extends Functor, T> = never | { (term: HKT.apply<F["_F"] & {}, T>): T }
  type Algebra<F extends HKT, T> = never | { (term: HKT.apply<F, T>): T }
  type Coalgebra<F extends HKT, T> = never | { (expr: T): HKT.apply<F, T> }
  type RAlgebra<F extends HKT, T> = never | { (term: HKT.product<F, T>): T }
  type RCoalgebra<F extends HKT, T> = never | { (expr: T): HKT.sum<F, T> }
  type infer<T> = T extends Functor<any, infer F> ? Exclude<F, undefined> : never
}

/**
 * ## {@link Guard `Guard`}
 *
 * Just a plain old TypeScript type-guard.
 */
export interface Guard<T = unknown> {
  (u: any): u is T
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
export interface Predicate<in T = any> {
  (value: T): boolean
}

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

/**
 * ## {@link Open `Open`}
 *
 * > I've never come across anything like this one in the wild.
 * > If you have, I'd love to hear about it: <ahrjarrett@gmail.com>
 *
 * For a type that's even more extensible, see {@link Open.HKT `Open.HKT`}.
 *
 * {@link Open `Open`} constructs a record that is open
 *
 * See also:
 * - {@link Open.HKT `Open.HKT`}
 * - {@link OpenRecord `OpenRecord`}
 *
 * @example
 *  import type { Open } from "@traversable/registry"
 *
 *  type Options = {
 *    newlineChar: string
 *    indentation: string
 *  }
 *
 *  declare const defaults: Options
 *
 *  function configure<const T extends {}>(overrides: T & Partial<Options>): Open<T, Options>
 *  function configure<const T extends {}>(overrides: T & Partial<Options>)
 *    { return { ...defaults, ...overrides } }
 *
 *  const ex_01 = configure({ newlineChar: "\n", custom: 123 })
 *  //    ^? OpenRecord<{ newlineChar: "\n", indentation: string, custom: 123 }>
 *
 *  // Check: existing properties are preserved
 *  ex_01.indentation
 *  //     ^? (property) indentation: string ✅
 *
 *  // Check: overrides have been applied
 *  ex_01.newlineChar
 *  //     ^? (property) newlineChar: "\n" ✅
 *
 *  // Check: supports adding new fields
 *  ex_01.custom
 *  //     ^? (property) custom: 123 😌
 */
export type Open<
  T extends {},
  Base,
  _ extends Force<T & Required<Omit<Base, keyof T>>> = Force<T & Required<Omit<Base, keyof T>>>,
> = never | OpenRecord<_>

export interface OpenRecord<T extends {}> extends newtype<T> {}

export declare namespace Open {
  /**
   * ### {@link HKT `Open.Kind`}
   *
   * Partially apply an {@link OpenRecord}. Gives users an
   * extension point where they can apply their own semantics
   * to a type, and have that type "stick".
   *
   * @example
   * import type { Open, newtype } from "@traversable/registry"
   *
   * type Options = { newline: string, indentation: string }
   * interface YourSemantics<T extends {}> extends newtype<T> {}
   *
   * // `@traverable/registry` will target `Wrapper[0]`:
   * //                       🠛
   * interface Wrapper { [0]: {}, [-1]: YourSemantics<this[0]>  }
   * // updates to `Wrapper[0]` will be observed here 🠙🠙🠙
   *
   * declare function configure<const T extends {}>(overrides: T & Partial<Options>):
   *   Open.Kind<T, Options, Wrapper>
   *   //                    ^^ pass the wrapper to `Open.Kind`
   *
   * // Note that `ex_01` is wrapped with `YourSemantics`
   * const ex_01 = configure({ indentation: "\t", CUSTOM: "hey", })
   * //     ?^ const ex_01: YourSemantics<{ indentation: "\t"; CUSTOM: "hey"; newline: string; }>
   *
   * // Properties flow through:
   *
   * ex_01.indentation
   * //     ^? (property) indentation: "\t"
   * ex_01.CUSTOM
   * //     ^? (property) CUSTOM: "hey"
   * ex_01.newline
   * //     ^? (property) newline: string
   */
  type lambda<
    T extends {},
    Base,
    Kind extends HKT,
    _ extends Force<T & Required<Omit<Base, keyof T>>> = Force<T & Required<Omit<Base, keyof T>>>,
  > = HKT.apply<Kind, _>
  interface Record<T extends {}> extends newtype<T> {}
}

// type __ = HKT.apply<Capture, (x: number) => string>
// interface Capture extends HKT<(_: any) => unknown> {
//   [-1]: <T extends Parameters<this[0] & {}>[0]>(_: T) => ReturnType<this[0] & {}>
// }
