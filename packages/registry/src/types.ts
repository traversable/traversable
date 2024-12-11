export type { newtype } from "any-ts"
import type { newtype } from "any-ts"

export type inline<T> = T
export type _ = {} | null | undefined

type Parameter<T> = T extends (_: infer I) => unknown ? I : never
type Returns<T> = T extends (_: never) => infer O ? O : never
interface Covariant<T extends (_: never) => unknown> { (_: never): Returns<T> }
interface Invariant<T extends (_: never) => unknown> { (_: Parameter<T>): Returns<T> }
interface Contravariant<T extends (_: never) => unknown> { (_: Parameter<T>): void }
interface Bivariant<T extends { (_: never): unknown }> extends newtype<{ _(_: Parameter<T>): Returns<T> }> {}

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
export interface Kind<in$ = unknown, out$ = unknown> extends newtype<{ ["~0"]: in$; ["~1"]: out$ }> {}
export type apply<F extends Kind, T extends F["~0"]> = (F & { ["~0"]: T })["~1"]

export declare namespace Kind {
  export { apply }
  export interface satisfies<F extends Kind> extends newtype<F["~0"] & {}> {}
  export type unapply<F extends Kind> = F extends Kind & infer T ? T : never
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

// export interface Denumerable<T = unknown> {}
