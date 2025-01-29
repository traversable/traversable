import type { newtype } from "any-ts"
import type { integer } from "./newtypes.js"
import type { URI, symbol } from "./symbol.js"

export type { newtype } from "any-ts"

export type inline<T> = T
export type _ = unknown
export type defined<T> = never | globalThis.Exclude<T, undefined>

export type Showable = null | undefined | boolean | number | bigint | string
export type Primitive = null | undefined | boolean | number | bigint | string | symbol
export type Entry<T> = readonly [k: string, v: T]
export type Entries<T> = readonly Entry<T>[]

export interface Array<T = unknown, Length extends number = number> extends newtype<readonly T[]> {
  length: Length
}
export interface Dict<T = unknown, K extends keyof any = string> extends newtype<{ [P in K]: T }> {}

export type Consumes<T> = T extends (_: infer I) => unknown ? I : never
export type Produces<T> = T extends (_: never) => infer O ? O : never
export type Returns<T> = T extends (..._: any) => infer O ? O : T
export type Partial<T> = never | { [K in keyof T]+?: T[K] }

export type WidenPrimitive<T> = T extends { valueOf(): infer W } ? W : T
export type WidenObject<T> = { [K in keyof T]: WidenPrimitive<T[K]> }
/**
 * ## {@link Widen `Widen`}
 *
 * If {@link T `T`} is a primitive literal, {@link Widen `Widen`} will "forget"
 * the literal and return its non-literal form. If `T` is a branded type that
 * was created with {@link newtype `newtype`} (such as {@link integer `integer`}),
 * the brand will also be stripped.
 *
 * If {@link T `T`} is an object, {@link Widen `Widen`} performs a shallow map of
 * the object, "forgetting" any literals or branded types that it encounters
 * among its properties.
 */
export type Widen<T> = T extends Primitive ? WidenPrimitive<T> : WidenObject<T>

export type isNonUnion<T, U = T, S = U extends U ? ([T] extends [U] ? true : false) : never> = [S] extends [
  true,
]
  ? true
  : false
export type isSingleton<T> = [T] extends [never] ? false : isNonUnion<T>
export type isUnion<T> = [isNonUnion<T>] extends [true] ? false : true

// export type Partial<T, Depth extends keyof Partial.depth = never>
//   = Depth extends 1 ? Partial1<T>
//   : Depth extends 2 ? Partial2<T>
//
//   : PartialRec<T, [], Partial.depth[Depth]>
/** @internal */
// type PartialRec<T, Depth extends 1[], MaxDepth extends unknown[]>
//   = [Depth["length"]] extends [MaxDepth["length"]] ? T
//   : { [K in keyof T]: PartialRec<T[K], [...Depth, 1], MaxDepth> }
//   ;
// type Partial1<T> = never | { [K in keyof T]+?: T[K] }
// type Partial2<T> = { [K in keyof T]+?: Partial1<T[K]> }
// export declare namespace Partial {
//   interface depth {
//     [0]: [],
//     [1]: [1],
//     [2]: [1, 1],
//     [3]: [1, 1, 1],
//     [4]: [1, 1, 1, 1],
//     [5]: [1, 1, 1, 1, 1],
//     [6]: [1, 1, 1, 1, 1, 1],
//     [7]: [1, 1, 1, 1, 1, 1, 1],
//     [8]: [1, 1, 1, 1, 1, 1, 1, 1],
//     [9]: [1, 1, 1, 1, 1, 1, 1, 1, 1],
//   }
// }

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

interface Bivariant<T extends { (_: never): unknown }> extends newtype<{ _(_: Consumes<T>): Produces<T> }> {}

export declare namespace Position {
  type covariant<T> = never | { (_: never): T }
  type contravariant<T> = never | { (_: T): void }
  type invariant<T> = never | { (_: T): T }
  /**
   * ## {@link bivariant `Position.bivariant`}
   *
   * When TypeScript checks a _function_ type, you get the type-level
   * equivalent of [Opposite Day](https://www.youtube.com/watch?v=pod4NRWn_Ak).
   *
   * Essentially, all the normal rules of assignability work _exactly_ backwards:
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
export type Kind<F extends HKT, T extends F[0] = F[0]> = (F & { [0]: T })[-1]
export declare namespace Kind {
  export { bind as new }
  export type of<F extends HKT> = [F] extends [infer T extends F] ? T : never
}

/**
 * ## {@link define `define`}
 *
 * Given a "kind template", {@link define `define`} returns a function that accepts
 * a function as input, and returns a function that applies the template to its argument.
 *
 * @example
 * import { define } from "@traversable/registry"
 *
 * interface Duplicate { [0]: unknown, [-1]: [this[0], this[0]] }
 * const dup1 = define<Duplicate>()((x) => [x, x])
 *
 * const good_01 = dup1(1)
 * //    ^? const good_01: [1, 1]
 *
 * declare const Duplicate: Duplicate
 * const dup2 = define(Duplicate)((x) => [x, x])
 *
 * const good_02 = dup2(1)
 * //    ^? const good_02: [1, 1]
 *
 * // The implementation is type-checked, so it won't drift if `Duplicate` changes:
 * const typeError = define(Duplicate)((x) => [x])
 * //                                          ^ 🚫 Type '[unknown]' is not assignable to type '[unknown, unknown]'
 */
export const define: <F extends { [0]: unknown; [-1]: unknown }>(
  F?: F,
) => (fn: (i: F[0]) => F[-1]) => <const I extends F[0]>(i: I) => Kind<F, I> = () => (fn) => fn

export declare function apply$<F>(F: F): <T>(t: T) => HKT.apply$<F, T>
export type bind<F extends HKT, T = unknown> = F & { [0]: T }
/** @deprecated use {@link Kind `Kind`} instead */
export type apply<F extends HKT, T extends F[0]> = Kind<F, T>
export type apply$<F, T> = never | (F & { [0]: T; [-1]: unknown })[-1]
export type apply_<F extends HKT, T> = never | (F & { [0]: T })[-1]
// export type forall<F extends HKT> = Kind<F, unknown>
export declare namespace HKT {
  export { apply, apply$, apply_ }

  export type unapply<F extends HKT> = [F] extends [infer T extends F] ? T : never

  export type product<F extends HKT, T> = Kind<F, [source: Kind<F, T>, target: T]>
  export type sum<F extends HKT, T> = Kind<F, Either<F, T>>
  export interface ap<T> extends HKT<HKT> {
    [-1]: apply_<this[0], T>
  }
  export interface Function<F extends { [0]: unknown; [-1]: unknown }> extends HKT<F[0], F[-1]> {
    <T extends this[0]>(x: T): Kind<F, T>
    [-1]: Kind<F, this[0]>
  }
}

/**
 * @example
 * // Haskell:
 * newtype Fix f = Fix { unFix :: f (Fix f) }
 */
// export interface Fix<F extends HKT = HKT> {
//   unFix: Kind<F, Kind<F>>
// }
// export type Unfix<F extends Fix> = F["unFix"]

export interface Typeclass<F extends HKT, _F = any> {
  readonly [symbol.typeclass]?: 1 extends _F & 0 ? F : Extract<_F, HKT>
}

/**
 * ## {@link Functor `Functor`}
 */
export interface Functor<F extends HKT = HKT, _F = any> extends Typeclass<F, _> {
  map<S, T>(f: (s: S) => T): (F: Kind<F, S>) => Kind<F, T>
}

export interface IndexedFunctor<Ix, F extends HKT = HKT, _F = any> extends Functor<F, _F> {
  mapWithIndex<S, T>(f: (ix: Ix, s: S) => T): (ix: Ix, F: Kind<F, S>) => Kind<F, T>
}

/**
 * ## {@link Attr `Attr`}
 * Annotates a recursive type-level operation by introducing an intermediate
 * structure between recursive calls.
 *
 * **Note:** This is more powerful than it might seem at first blush.
 *
 * By simply "decorating" successive applications of {@link F `F`} with
 * {@link attribute `attribute`}, we've created a data structure that is
 * __isomorphic__ to the call stack.
 *
 * In other words, by adding a thin layer of indirection,
 * we've created a lightweight, type-level data structure
 * that __automatically preserves the full history of recursion__.
 *
 * I've often played with idea of putting some scaffolding on top of
 * {@link Attr `Attr`} to give users a way to debug things when they're
 * creating recursive types, but I'll leave that to someone with a more
 * motivating use case.
 *
 * If you do, I'd love to see what you come up with! You can reach me at:
 *
 * > _ahrjarrett at gmail dot com_
 *
 * Prior art:
 * - Patrick Thomson's
 * [excellent series](https://blog.sumtypeofway.com/posts/recursion-schemes-part-4.html)
 * on recursion schemes
 *
 * @example
 * import type { Attr } from "@traversable/registry"
 *
 * interface Null extends HKT { [-1]: undefined }
 * interface Cons<T> extends HKT { [-1]: [T, this[0]] }
 * type List<T> = Null | Cons<T>
 *
 * declare const debug: Attr<List<number>, "my favorite node">
 * //            ^? const debug: Attr<List<number>, "my favorite node">
 *
 * debug.hole
 * //     ^? (property) hole: [number, Attr<List<number>, "my favorite node">] | undefined
 *
 * debug.attribute
 * //     ^? (property) attribute: [number, Attr<List<number>, string>] | undefined
 *
 * debug.hole?.[1].hole?.[1].hole?.[1].hole /// ...
 * // loop through successive applications by repeated access of `hole`
 */
interface Attr<F extends HKT, T> {
  attribute: T
  hole: Kind<F, Attr<F, T>>
}

type Algebra<F extends HKT, T> = never | { (term: Kind<F, T>): T }
type Coalgebra<F extends HKT, T> = never | { (expr: T): Kind<F, T> }
type RAlgebra<F extends HKT, T> = never | { (term: HKT.product<F, T>): T }
type RCoalgebra<F extends HKT, T> = never | { (expr: T): HKT.sum<F, T> }
type CVAlgebra<F extends HKT, T> = (F: Kind<F, Attr<F, T>>) => T
type IxAlgebra<Ix, F extends HKT, T> = never | { (ix: Ix, term: Kind<F, T>): T }

export declare namespace Functor {
  export { Algebra, Coalgebra, RAlgebra, RCoalgebra, CVAlgebra, IxAlgebra }
  export type infer<T> = T extends Functor<any, infer F> ? Exclude<F, undefined> : never
}
export declare namespace Functor {
  type map<F extends HKT> =
    | never
    | {
        <S, T>(F: Kind<F, S>, f: (s: S) => T): Kind<F, T>
        <S, T>(f: (s: S) => T): { (F: Kind<F, S>): Kind<F, T> }
      }

  interface Invariant<F extends HKT = HKT> {
    imap<A, B>(F: Kind<F, A>, to: (a: A) => B, from: (b: B) => A): Kind<F, B>
    imap<A, B>(to: (a: A) => B, from: (b: B) => A): (F: Kind<F, A>) => Kind<F, B>
  }

  interface Covariant<F extends HKT = HKT> {
    // map<A, B>(f: (a: A) => B): (F: Kind<F, A>) => Kind<F, B>
    map<A, B>(F: Kind<F, A>, f: (a: A) => B): Kind<F, B>
  }
}

export interface Product<F extends HKT = HKT> {
  product<A, B>(left: Kind<F, A>, right: Kind<F, B>): Kind<F, [A, B]>
  sequence<A>(xs: Iterable<Kind<F, A>>): Kind<F, A[]>
  pair<A>(F: A, xs: Iterable<A>): [A, ...A[]]
}

export interface Applicative<F extends HKT>
  extends Typeclass<F>,
    Functor.Covariant<F>,
    Functor.Invariant<F>,
    Product<F> {
  of<A>(a: A): Kind<F, A>
}

export function makeAp<F extends HKT>(
  F: Applicative<F>,
): <A>(fa: Kind<F, A>) => <B>(fab: Kind<F, (a: A) => B>) => Kind<F, B> {
  return (fa) => (fab) => F.map(fa, (a) => F.map(fab, (f) => F.of(f(a))))
}

export interface Traversable<T extends HKT> extends Typeclass<T> {
  traverse<F extends HKT>(
    F: Applicative<F>,
  ): {
    <A, B>(f: (a: A) => Kind<F, B>): (traversable: Kind<T, A>) => Kind<F, Kind<T, B>>
    <A, B>(traversable: Kind<T, A>, f: (a: A) => Kind<F, B>): Kind<F, Kind<T, B>>
  }
}
export declare namespace Traversable {
  type traverse<T extends HKT, F extends HKT, B> = never | Kind<F, Kind<T, B>>
}

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

export interface Invertible<K extends keyof any = keyof any> extends newtype<{ [P in K]: P }> {}

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
 * ## {@link Fix `Fix`}
 *
 * Like _functions_ in math, _**F**unctors_ (sometimes capitalized to avoid
 * confusion with the term "function") can (and often do) have "fix points".
 *
 * I'm a visual learner, so I like to think of a Functor's fixpoint like a
 * [vanishing point](https://en.wikipedia.org/wiki/Vanishing_point).
 *
 * Mathematicians might take issue with the comparison, but I personally
 * found it useful for building an intuition.
 *
 * When you're modeling recursive data types in the type system, it can
 * sometimes get really tricky. TypeScript does _an amazing_ job of hiding
 * some of that complexity.
 *
 * To see what I mean, let's model JSON as a type. Here's one way we could
 * do that:
 *
 * ```typescript
 * type Scalar = null | boolean | number | string
 * type Json =
 *   | Scalar
 *   | Json[]
 *   | { [x: string]: Json }
 * ```
 *
 * If you've worked with TypeScript for a while, the fact that you can refer to
 * `Json` inside the definition might seem totally normal. But the fact that
 * TypeScript pulls this off is actually really impressive.
 *
 * So what's the problem?
 *
 * The problem is that this is ✨magical✨ -- in both senses.
 *
 * If you try using the `Json` type we created, pretty soon you'll run into a
 * problem: `undefined`.
 *
 * Or more precisely: `Json` doesn't support with _optional properties_, because
 * optional properties unify a property with `undefined`.
 *
 * A naive attempt to fix this problem might look like this:
 *
 * ```typescript
 * type Json2 = undefined | Json
 * ```
 *
 * But that won't work either, since `Json2` can only express `undefined` at the
 * root level -- `{ x: number, y: number, name?: number }` for example won't work,
 * because the `undefined` is nested in the tree.
 *
 * Okay, you might say: so update `Json` type to include `undefined` first-class.
 *
 * And that would work as a partial solution. But it also might not work, since
 * it could introduce bugs elsewhere in the system where we don't want `undefined`
 * leaking into our data structures at any level.
 *
 * Really, the problem is that we're trying to use a single type to model different
 * things, and we don't have a good way to express what we want without copy/pasting
 * the implementations.
 *
 * These 2 types are _related_, but slightly different, and we
 * don't have a good way to express that relationship.
 *
 * Which in this case is probably okay -- it's not everyday that
 * we need to incorporate upstream changes to the JSON spec (fortunately), so its
 * unlikely that the two will "drift" over time.
 *
 * But what if we needed more flexibility? What if we expect the recursive data structure
 * we're modeling will change, or even worse, what if we needed to allow users to
 * extend it arbitrarily?
 *
 * And that's not even the start of the problem. What about operations that take
 * `Json` as input and reduce it down to something else? Even if you found a nice
 * pattern for doing that, as soon as you turn to a new recursive domain, you have
 * to resolve all of those problems, and there's no way to re-use anything from
 * the `Json` domain, since with recursion, the problems are _almost always_ unique to
 * the use case.
 *
 * I've got some good news and some bad news.
 *
 * The good news is that it is possible to represent recursive data types, and
 * operations over recursive data types, in a way that is reusable.
 *
 * The bad news is that the solution, although actually pretty elegant if you take
 * the time to work through it, looks pretty damn scary.
 *
 * The nice thing about using a library for this kind of thing is that you don't
 * actually need to grok {@link Fix `Fix`} or {@link Unfix `Unfix`} to be able to
 * use some of the abstractions that fall out of its use.
 *
 * One tidbit that I found interesting is the relationship between a Functor's
 * fixpoint and the Y-combinator. In fact, depending on your level of abstraction,
 * you _could_ almost say [they're "the same"](https://en.wikipedia.org/wiki/Isomorphism).
 *
 * See also:
 * - {@link Functor `Functor`}
 * - I found
 *   [this explanation](https://stackoverflow.com/questions/45916299/understanding-the-fix-datatype-in-haskell/45916939#45916939)
 *   pretty helpful, but YMMV
 */

interface Fix<F extends HKT> {
  fix(): Fix<F>
}
class Fix<F extends HKT> {
  constructor(public readonly unfix: Kind.new<F, Fix<F>>) {}
  static in<F extends HKT>(ff: Kind.new<F, Fix<F>>): Fix<F> {
    return new Fix(ff)
  }
  static out<F extends HKT>(f: Fix<F>): Kind<F, Fix<F>> {
    return f.unfix
  }
}

export interface Pointed<F extends HKT> {
  of<T>(t: T): Kind<F, T>
}

export interface Fold<F extends HKT, T, S> {
  (fixed: Fix<F>): T
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
export type Eq<in T> = (left: T, right: T) => boolean

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
 * ## {@link Filter `Filter`}
 *
 * Similar to {@link Pick `Pick`}, but filters entries by value rather than by key.
 * Like {@link Pick `Pick`}, {@link Filter `Filter`}'s implementation is homomorphic
 * (structure-preserving).
 */
export type Filter<T, Q, _ extends keyof T = keyof T> = Pick<
  T,
  _ extends _ ? ([T[_] & {}] extends [Q] ? _ : never) : never
>

/**
 * ## {@link Omit `Omit`}
 *
 * Similar to the built-in {@link globalThis.Omit `Omit`} utility, but eagerly
 * evaluates its target.
 *
 * Like the built-in utility, this implementation is homomorphic
 * (structure-preserving)
 */
export type Omit<T, K extends keyof T> = never | Pick<T, Exclude<keyof T, K>>

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
 * Preserves JSDoc annotations. If a property has JSDoc annotations in both
 * {@link S `S`} and {@link T `T`}, the docs for the property in {@link T `T`}
 * are concatenated onto the end of the docs for the property in {@link S `S`}.
 */
export type Spread<S, T, _ extends keyof (S | T) = keyof (S | T)> =
  | never
  | (Pick<S | T, _> & Omit<S, _> & Omit<T, _>)

/**
 * ### {@link Merge `Merge`}
 *
 * Preserves JSDoc annotations. If a property is has JSDoc annotations in both
 * {@link S `S`} and {@link T `T`}, the docs for the property in {@link T `T`}
 * are concatenated onto the end of the docs for the property in {@link S `S`}.
 */
export type Merge<S, T> = never | Force<Spread<S, T>>

/**
 * ### {@link Part `Part`}
 *
 * Dual of {@link Keep `Keep`}
 */
export type Part<T, K extends keyof T = keyof T> = Force<
  { [P in K]+?: T[P] } & { [P in keyof T as Exclude<P, K>]-?: T[P] }
>

// export type Part<T, K extends keyof T = never> = [K] extends [never]
// 	? Optional<T>
// 	: Force<Omit<T, K> & Optional<T, K>>

export type Require<T, K extends keyof T = never> = [K] extends [never]
  ? never | Required<T>
  : KeepLast<T, { -readonly [P in K]-?: T[P] }>

export type RequireN<T, Depth extends 1[] = [1, 1]> = never | RequireN.loop<[], T, Depth["length"]>
export declare namespace RequireN {
  type loop<Depth extends 1[], T, Max extends number> = Depth["length"] extends Max
    ? T
    : { [K in keyof T]-?: RequireN.loop<[...Depth, 1], T[K], Max> }
}

/**
 * ### {@link Requiring `Requiring`}
 *
 * Dual of {@link Part `Part`}. Makes the keys in {@link K `K`}
 * required, and makes all other keys in {@link T `T`} optional.
 *
 * Mapping is homomorphic, so this operation is structure-preserving
 * in every other respect.
 *
 * @example
 * import type { Requiring } from "@traversable/registry"
 *
 * declare const ex_01: {
 *   /\** # {@link _.a `_.a`} *\/
 *   a: 1,
 *   /\** # {@link _.b `_.b`} *\/
 *   b?: 2,
 *   /\** # {@link _.c `_.c`} *\/
 *   c?: 3 | undefined,
 *   /\** # {@link _.d `_.d`} *\/
 *   d: undefined,
 *   /\** # {@link _.e `_.e`} *\/
 *   e: 4 | undefined
 * }
 *
 * declare const ex_02: Requiring<typeof ex_01, "a" | "b" | "d" | "e">
 *
 * ex_02.b
 * //    ^? hover to see JSDocs for `ex_02.b`
 *
 * ex_02.c
 * //    ^? hover to see JSDocs for `ex_02.c`
 */
export type Requiring<T, K extends keyof T> = Force<
  { [P in K]-?: T[P] } & { [P in keyof T as Exclude<P, K>]+?: T[P] }
>

/**
 * ## {@link RequiredProps `RequiredProp`}
 *
 * Homomorphic (structure-preserving) select that picks
 * only the non-optional fields from an object.
 */
export type RequiredProps<T> = never | { [K in keyof T as {} extends { [P in K]: T[P] } ? never : K]: T[K] }

/**
 * ## {@link RequiredProps `RequiredProp`}
 *
 * Homomorphic (structure-preserving) select that omits
 * all object fields that might be undefined.
 */
export type DefinedProps<T> = never | { [K in keyof T as undefined extends T[K] ? never : K]: T[K] }

export type Optional<T, K extends keyof T = keyof T> = never | { [P in K]+?: T[P] }

export type Capitalize<T> = globalThis.Capitalize<`${T & Showable}`>

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
  _ extends Force<T & Required<globalThis.Omit<Base, keyof T>>> = Force<
    T & Required<globalThis.Omit<Base, keyof T>>
  >,
> = never | OpenRecord<_>

export interface OpenRecord<T extends {}> extends newtype<T> {}

export declare namespace Open {
  /**
   * ### {@link lambda `Open.lambda`}
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
   *   Open.lambda<T, Options, Wrapper>
   *   //                     ^^ pass the wrapper to `Open.lamda`
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
    F extends HKT,
    _ extends Force<T & Required<globalThis.Omit<Base, keyof T>>> = Force<
      T & Required<globalThis.Omit<Base, keyof T>>
    >,
  > = Kind<F, _>
  interface Record<T extends {}> extends newtype<T> {}
}

// type __ = Kind<Capture, (x: number) => string>
// interface Capture extends HKT<(_: any) => unknown> {
//   [-1]: <T extends Parameters<this[0] & {}>[0]>(_: T) => ReturnType<this[0] & {}>
// }

export interface Recursive<T extends HKT, F extends HKT, A, _ = any> extends Typeclass<T> {
  readonly F: Functor<F, _>
  project(T: Kind<T, A>): Kind<F, Kind<T, A>>
}

export interface Corecursive<T extends HKT, F extends HKT, A, _ = any> extends Typeclass<T> {
  readonly F: Functor<F, _>
  embed(f: Kind<F, Kind<T, A>>): Kind<T, A>
}

/**
 * Type-level predicate that asserts that two types are "equal".
 *
 * If you're looking for a type that describes
 * the binary relation between two values, see {@link Equal `Equal`}.
 *
 * The semantics of _equality_ are somewhat ambiguous, since
 * equality is, on some level, "in the eye of the beholder" ❲*❳.
 *
 * ❲*❳ By "in the eye of the beholder", I mean _not portable_:
 * that equality is about our ability to perceive (or, in this case,
 * our inability) to perceive difference.
 *
 * My first draft had "irrevocably bound to some context", but
 * it sounded a bit stiff.
 *
 * > [Edit]: Probably just cut this comment out altogether.
 */
export type Equals<S, T> = (<F>() => F extends S ? true : false) extends <F>() => F extends T ? true : false
  ? true
  : false

export type autocomplete<T> = T | (string & {})

export type Union<T, _ = T> = (_ extends _ ? ([T] extends [_] ? never : unknown) : never) extends infer U
  ? U
  : never

export type NonUnion<T, _ = T> = (_ extends _ ? ([T] extends [_] ? unknown : never) : never) extends infer U
  ? U
  : never

export declare namespace Union {
  type toIntersection<
    T,
    U = (T extends T ? (_: T) => void : never) extends (_: infer U) => void ? U : never,
  > = U
  /**
   * ## {@link enumerate `Union.enumerate`}
   *
   * You'll sometimes see this type called "UnionToTuple".
   */
  type enumerate<U, _ = Union.toThunk<U> extends () => infer X ? X : never> = Union.enumerate.loop<[], U, _>
  type is<T, U = T> = (U extends U ? ([T] extends [U] ? false : true) : never) extends infer S
    ? boolean extends S
      ? true
      : S
    : never
  namespace enumerate {
    type loop<Todo extends readonly unknown[], U, _ = Union.toThunk<U> extends () => infer X ? X : never> = [
      U,
    ] extends [never]
      ? Todo
      : Union.enumerate.loop<[_, ...Todo], Exclude<U, _>>
  }
  type toThunk<U> = (U extends U ? (_: () => U) => void : never) extends (_: infer _) => void ? _ : never
}
