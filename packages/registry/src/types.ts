export type { newtype } from "any-ts"
import type { newtype } from "any-ts"

export type inline<T> = T
export type _ = {} | null | undefined

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
export interface Kind<in$ = _, out$ = _> extends newtype<{ ["~0"]: in$; ["~1"]: out$ }> {}
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
