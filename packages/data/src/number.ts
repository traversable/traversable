export { Equal_number as equals } from "./_internal/_equal.js"

import type { newtype } from "any-ts";
import type { jsdoc, math } from "./_internal/_unicode.js"

export {
  /**
   * ### {@link number_any `number.any`}
   * Greatest lower bound of the {@link number `number`} namespace
   */
  type number_any as any,
}

type number_any<T extends number = number> = T

/**
 * ### {@link finite `number.finite`}
 * 
 * {@link finite `number.finite`} constrains a type parameter to be a _literal_ 
 * number (e.g., `1` or `-1.1`, but not `number`).
 * 
 * **Note:** For this to work, you need to apply {@link nonfinite `number.finite`}
 * to the type parameter you're _currently_ declaring, see example below.
 * 
 * See also:
 * - {@link nonfinite `number.nonfinite`}
 * 
 * @example
 *  import type { number } from "@traversable/data"
 *  
 *  function onlyLiteralsAllowed<T extends number.finite<T>>(number: T) { return -number }
 * 
 *  onlyLiteralsAllowed(1)             // ✅
 *  onlyLiteralsAllowed(-1.1)          // ✅
 *  onlyLiteralsAllowed(Math.random()) // 🚫
 */
export type finite<T> = number extends T ? never : [T] extends [number] ? number : never

/**
 * ### {@link nonfinite `number.nonfinite`}
 * 
 * {@link nonfinite `number.nonfinite`} constrains a type parameter to be a _literal_ 
 * number (`number`, but not `1` or `-1.1`).
 * 
 * **Note:** For this to work, you need to apply {@link nonfinite `number.nonfinite`}
 * to the type parameter you're _currently_ declaring, see example below.
 * 
 * See also:
 * - {@link finite `number.finite`}
 * 
 * @example
 *  import type { number } from "@traversable/data"
 *  
 *  function onlyNonLiteralsAllowed<T extends number.nonfinite<T>>(number: T) { return -number }
 * 
 *  onlyNonLiteralsAllowed(Math.random())        // ✅
 *  onlyNonLiteralsAllowed(new Date().getTime()) // ✅
 *  onlyNonLiteralsAllowed(1)                    // 🚫
 */
export type nonfinite<T> = number extends T ? number : never

/**
 * ### {@link numeric `number.numeric`}
 * 
 * A type representing a number, or a string numeric (string containing a number). 
 * Includes `bigint` (e.g. `1n` and `"1n"`).
 * 
 */
export type numeric<
  T extends 
  | number | bigint | `${number}` | `${bigint}` 
  = number | bigint | `${number}` | `${bigint}`
> = T

/**
 * ### {@link from `number.from`}
 *
 * Extract from {@link T `T`} those members that are assignable to {@link number.any `number`}
 *
 * @example
 * type From = number.from<"a" | [1, 2, 3] | 1 | 10>
 * //   ^? type From = 1 | 10
 */
export type from<T, N extends T extends number ? T : never = T extends number ? T : never> = N

/**
 * ### {@link and `number.and`}
 *
 * Intersects {@link T `T`} with {@link number.any `number`}
 *
 * @example
 * type And = number.and<1 | [1, 2, 3] | 10>
 * //   ^? type And = 1 | 10
 */
export type and<T, N extends number & T = number & T> = N

/**
 * ### {@link is `number.is`}
 * #### ｛ {@link jsdoc.guard ` ️🦺‍ ` } ｝
 *
 * Narrows its argument from `unknown` to {@link number_any `number`}
 */
export const is = (u: unknown): u is number => typeof u === "number"

/**
 * ### {@link MIN `number.MIN`}
 * `-(2⁵³ - 1)` or `-(Math.pow(2, 53) - 1)`
 * [greatest lower bound](https://en.wikipedia.org/wiki/Infimum_and_supremum) 
 * of the set of all finite numbers in JavaScript.
 */
export const MIN = globalThis.Number.MIN_SAFE_INTEGER

/**
 * ### {@link MAX `number.MAX`}
 * 
 * `2⁵³ - 1` or `Math.pow(2, 53) - 1` is the 
 * [least upper bound](https://en.wikipedia.org/wiki/Infimum_and_supremum) 
 * of the set of all finite numbers in JavaScript.
 */
export const MAX = globalThis.Number.MAX_SAFE_INTEGER

/**
 * ### {@link TOP `number.TOP`}
 * 
 * `+Infinity` is the [top type](https://en.wikipedia.org/wiki/Top_type)
 * and [least upper bound](https://en.wikipedia.org/wiki/Infimum_and_supremum) 
 * of the set of all finite & non-finite numbers in JavaScript.
 */
export const TOP = globalThis.Number.POSITIVE_INFINITY

/**
 * ### {@link BOTTOM `number.BOTTOM`}
 * 
 * `-Infinity` is the [bottom type](https://en.wikipedia.org/wiki/Bottom_type)
 * and [greatest lower bound](https://en.wikipedia.org/wiki/Infimum_and_supremum) 
 * of the set of all finite & non-finite numbers in JavaScript.
 */
export const BOTTOM = globalThis.Number.NEGATIVE_INFINITY

/** 
 * ### {@link float `number.float`} 
 * #### ｛ {@link math.real `ℝ`}  ｝
 * -----
 * 1. {@link float `float`} is a [newtype](https://doc.rust-lang.org/rust-by-example/generics/new_types.html)
 * that inherits from {@link globalThis.Number.prototype `Number.prototype`} and represents a number with an
 * exponent.
 * 
 * 2. The {@link float `float`} function constructs a {@link float `float`} (or 
 * "floating point" or "real" number) from an arbitrary JavaScript number.
 *
 * In most contexts, a {@link float `float`} and a regular number can be used
 * interchangably, but sometimes you'll need to "unwrap" a {@link float `float`}
 * to explicitly "forget" that -- see the example below.
 *
 * - [Reference](https://en.wikipedia.org/wiki/Floating-point_arithmetic)
 * - See also, {@link integer `number.integer`}
 */
export interface float extends newtype<number> {}
export function float(x: number): float
export function float(x: number) { return x }

export {
  /** 
   * ### {@link isNaN `number.isNaN`}
   * 
   * Check if a value is {@link globalThis.Number.NaN `NaN`}.
   * 
   * The use case for {@link isNaN `number.isNaN`} is to prevent the implicit 
   * coersion that comes with {@link globalThis.isNaN `globalThis.isNaN`}.
   */
  number_isNaN as isNaN,
}
const number_isNaN 
  : (x: unknown) => boolean
  = globalThis.Number.isNaN

/** 
 * ### {@link isNotNaN `number.isNotNaN`}
 * 
 * Check if a value is a number, and is not {@link globalThis.Number.NaN `NaN`}.
 */
export const isNotNaN 
  : (x: unknown) => boolean
  = (x: unknown) => is(x) && x === x

/**
 * ### {@link parse `number.parse`}
 * A runtime-safe version of {@link parseFloat `parseFloat`}
 */
export const parse
  : (numeric: string) => float
  = globalThis.Number.parseFloat

type Bounded<Min extends number = number, Max extends number = number> = never | [min: Min, max: Max]
type Meet<Max extends number = number> = never | [max: Max]
type Join<Min extends number = number> = never | [min: Min]

export declare namespace Bounded {
  interface integer<_ extends Join | Meet | Bounded = Bounded> extends newtype<number> {}
}

/** 
 * ### {@link isNegativeZero `number.isNegativeZero`}
 * 
 * Returns true [iff](https://en.wikipedia.org/wiki/If_and_only_if) its argument is exactly `-0`.
 * 
 * Checking for `-0` requires a bit of cleverness, because the JS runtime goes to great lengths
 * to hide when its internal representation of a number is `-0` by convering it to `0` in most
 * cases.
 * 
 * Usually that isn't a problem, but if you're serializing / deserializing data, you'll end up
 * with roundtrip/hydration failures if you don't handle this case.
 */
export const isNegativeZero 
  : (u: unknown) => boolean
  = (u) => typeof u === "number" 
    && u === 0 
    && (1 / u) === globalThis.Number.NEGATIVE_INFINITY

/** 
 * ### {@link isFinite `number.isFinite`}
 * 
 * Returns `true` [iff](https://en.wikipedia.org/wiki/If_and_only_if) its argument 
 * is a number that is not one of:
 * 
 * - {@link globalThis.NaN `NaN`}
 * - {@link globalThis.Number.NEGATIVE_INFINITY `-Infinity`}
 * - {@link globalThis.Number.POSITIVE_INFINITY `+Infinity`}
 * 
 * Note that unlike {@link globalThis.isFinite `isFinite`}, 
 * {@link isFinite `number.isFinite`} does not perform implicit coersion of 
 * its argument before performing its check.
 */
export const isFinite 
  : (number: unknown) => boolean
  = globalThis.Number.isFinite

export const isNonFinite 
  : (number: unknown) => boolean
  = (number) => typeof number === "number" && !globalThis.Number.isFinite(number)

/** 
 * ### {@link add `number.add`}
 * #### ｛ {@link jsdoc.folding ` 🪭 ` } ｝
 * 
 * Folds an array of numbers by adding them. 
 * 
 * Uses `0` as the initial value, since `0` is the
 * additive identity for numbers.
 * 
 * @example
 *  import { number } from "@traversable/number"
 *  
 *  const ex_01 = number.add()         //  =>  0
 *  const ex_02 = number.add(1)        //  =>  1
 *  const ex_03 = number.add(1, 2)     //  =>  2
 *  const ex_03 = number.add(1, 2, 3)  //  =>  6
 *  const ex_03 = number.add(1, 2, -3) //  =>  0
 */
export function add(): 0
export function add(...xs: number[]): number
export function add(xs: readonly number[]): number
export function add(...xs: number[] | [xs: readonly number[]]): number
export function add(...xs: number[] | [xs: readonly number[]]): number {
  return xs.flat(1).reduce((out, x) => out + x, 0)
}

/**
 * ### {@link multiply `number.multiply`}
 * #### ｛ {@link jsdoc.folding ` 🪭 ` } ｝
 *
 * Folds an array of numbers by multiplying them. 
 * 
 * Uses `1` as the initial value, since `1` is the identity element
 *  multiplicative identity for numbers.
 * 
 * @example
 *  import { number } from "@traversable/number"
 *  
 *  const ex_01 = number.multiply()         //  =>  1
 *  const ex_02 = number.multiply(1)        //  =>  1
 *  const ex_03 = number.multiply(1, 2)     //  =>  2
 *  const ex_03 = number.multiply(1, 2, 3)  //  =>  6
 *  const ex_03 = number.multiply(1, 2, -3) //  => -6
 */
export function multiply(): 1
export function multiply(...xs: number[]): number
export function multiply(xs: readonly number[]): number
export function multiply(...xs: number[] | [xs: readonly number[]]): number
export function multiply(...xs: number[] | [xs: readonly number[]]): number {
  return xs.flat(1).reduce((out, x) => out + x, 0)
}

/** 
 * ### {@link clampInteger `number.clampInteger`}
 * - If `x` is less than {@link min `min`}, returns {@link min `min`}
 * - Else if `x` is greater than {@link max `max`}, returns {@link max `max`}
 */
export function clampInteger<Max extends number, Min extends number>(bounds: { max: Max, min: Min }): (x: number) => Bounded.integer<Bounded<Min, Max>>
export function clampInteger<Min extends number>(bounds: { min: Min }): (x: number) => Bounded.integer<Join<Min>>
export function clampInteger<Max extends number>(bounds: { max: Max }): (x: number) => Bounded.integer<Meet<Max>>
export function clampInteger({ min = 0, max = globalThis.Number.MAX_SAFE_INTEGER }: { min?: number, max?: number }) { 
  return (x: number) => x < min ? min : x > max ? max : globalThis.Number.isNaN(x) ? min : x
}

/** 
 * ### {@link max `number.max`} 
 * #### ｛ {@link jsdoc.folding ` 🪭 ` } ｝
 * 
 * Folds an array of numbers by comparing them 2 at a time, always 
 * taking the maximum.
 * 
 * Uses `-Infinity` as the initial value, since `-Infinity` is the 
 * identity element for the "maximum" operation over numbers.
 * 
 * {@link max `number.max`} can be used as a binary comparator. 
 * 
 * Useful when working with enums, for example, and will preserve
 * as much type information as possible when used with (for example)
 * {@link globalThis.Array.prototype.sort `Array.prototype.sort`} or
 * {@link globalThis.Array.prototype.reduce `Array.prototype.reduce`}.
 * 
 * See also:
 * - {@link min `number.min`}
 * 
 * @example
 *  import { number } from "@traversable/data"
 * 
 *  export type NodeWeight = typeof NodeWeight[keyof typeof NodeWeight]
 *  //           ^? type NodeWeight: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
 *  export const NodeWeight = {
 *    null: 0,
 *    boolean: 1,
 *    integer: 2,
 *    number: 3,
 *    string: 4,
 *    oneOf: 5,
 *    anyOf: 6,
 *    allOf: 7,
 *    object: 8,
 *    array: 9,
 *  } as const
 *
 *  const defineWeights
 *    : (...weights: NodeWeight[]) => NodeWeight[]
 *    = (...weights) => weights
 * 
 *  const weights = defineWeights(NodeWeight.null, NodeWeight.object, NodeWeight.oneOf)
 *  //    ^? const weights: NodeWeight[]
 *
 *  const nativeHelpersAreLossy = weights.reduce((acc, cur) => globalThis.Number.min(acc, curr))
 *  //    ^? const nativeHelpersAreLossy: number[] 😔
 *  
 *  const leastUpperBound = weights.reduce(number.max)
 *  //    ^? const leastUpperBound: NodeWeight 😌
 */
export function max<N extends number>(...xs: N[]): N
export function max<N extends number>(xs: readonly N[]): N
export function max<N extends number>(...xs: N[] | [xs: readonly N[]]): N
export function max(...xs: number[] | [xs: readonly number[]]): number { 
  return globalThis.Math.max(...xs.flat(1)) 
}

/** 
 * ### {@link min `number.min`} 
 * #### ｛ {@link jsdoc.folding ` 🪭 ` } ｝
 * 
 * Reduces or [folds](https://en.wikipedia.org/wiki/Fold_(higher-order_function)) 
 * an array of numbers by comparing them 2 at a time, always taking the minimum.
 * 
 * {@link min `number.min`} can be used as a binary comparator. Useful when working with enums, for example, and will preserve
 * as much type information as possible when used in `Array.prototype.sort` or `Array.prototype.reduce`,
 * for example.
 * 
 * Uses `-Infinity` as the initial value, since `-Infinity` is the 
 * identity element for the "maximum" operation over numbers.
 * 
 * 
 * See also {@link max `number.max`}
 * 
 * @example
*  import { number } from "@traversable/data"
* 
*  export type NodeWeight = typeof NodeWeight[keyof typeof NodeWeight]
*  //           ^? type NodeWeight: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
*  export const NodeWeight = {
*    null: 0,
*    boolean: 1,
*    integer: 2,
*    number: 3,
*    string: 4,
*    oneOf: 5,
*    anyOf: 6,
*    allOf: 7,
*    object: 8,
*    array: 9,
*  } as const
*
*  const defineWeights
*    : (...weights: NodeWeight[]) => NodeWeight[]
*    = (...weights) => weights
* 
*  const weights = defineWeights(NodeWeight.null, NodeWeight.object, NodeWeight.oneOf)
*  //    ^? const weights: NodeWeight[]
*
*  const nativeHelpersAreLossy = weights.reduce((acc, cur) => globalThis.Number.min(acc, curr))
*  //    ^? const nativeHelpersAreLossy: number[] 😔
*  
*  const greatestLowerBound = weights.reduce(number.min)
*  //    ^? const greatestLowerBound: NodeWeight 😌
*/
export function min<N extends number>(...xs: N[]): N
export function min<N extends number>(xs: readonly N[]): N
export function min(...xs: number[] | [xs: readonly number[]]): number { 
  return globalThis.Math.min(...xs.flat(1)) 
}
