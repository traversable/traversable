import { URI } from "@traversable/registry"
import type { integer, newtype, number } from "@traversable/registry"
import type { None, Option, Some } from "./exports.js"
import type { numeric } from "./number.js"

/** @internal */
const none = (): None => ({ _tag: URI.None })
/** @internal */
const some = <T>(value: T): Some<T> => ({ _tag: URI.Some, value })

////////////////
/// newtypes ///
export interface NaN<_Min extends number = number, _Max extends number = number> extends newtype<number> {}
export interface min<_ extends number = number> extends newtype<number> {}
export interface max<_ extends number = number> extends newtype<number> {}
export interface btwn<_Min extends number = number, _Max extends number = number> extends newtype<number> {}
/// newtypes ///
////////////////

/**
 * ### {@link from `integer.from`}
 *
 * Extract from {@link T `T`} those members that are assignable to {@link integer.any `integer`}
 *
 * @example
 * const myInteger = integer.parse("1")
 * type From = integer.from<"a" | [1, 2, 3] | 1 | typeof myInteger>
 * //   ^? type From = typeof myInteger
 */
export type from<T, N extends T extends number.integer ? T : never = T extends integer ? T : never> = N

/**
 * ### {@link and `integer.and`}
 *
 * Intersects {@link T `T`} with {@link integer `integer.any`}
 *
 * @example
 * const myInteger = integer.parse("1")
 * type And = integer.and<1 | [1, 2, 3] | 10 | typeof myInteger>
 * //   ^? type And = typeof myInteger
 */
export type and<T, N extends number & T = number & T> = N


export { integer_ as integer }
function integer_(x: number): integer
function integer_(x: number) { return globalThis.Math.round(x) }

/**
 * ### {@link is `integer.is`}
 *
 * A type guard that narrows its argument from `unknown` to {@link integer `integer`}
 */
export const is = (u: unknown): u is integer => typeof u === "number" && (+u.toFixed(0) === u)

namespace integer_ {
  /** 
   * ### {@link parse `integer.parse`} `[term]`
   * ---
   * 
   * If the 2nd argument (`safeParse`) is provided and {@link numeric `numeric`} 
   * parses as one of the following, returns {@link None `None`}:
   * 
   * - {@link globalThis.NaN `NaN`}
   * - {@link globalThis.Number.NEGATIVE_INFINITY `-Infinity`}
   * - {@link globalThis.Number.POSITIVE_INFINITY `Infinity`}
   * 
   * @example
   *  /// [term]
   *  import { integer } from "@traversable/data"
   * 
   *  console.log(integer.parse("1"))   // 1
   *  console.log(integer.parse(1.1))   // 1
   *  console.log(integer.parse(1 / 0)) // Infinity
   *  console.log(integer.parse(1 / 0), "safe") // { tag: "None" }
   *  console.log(integer.parse(1 / 1), "safe") // { tag: "Some", value: 1 }
   */
  export function parse(numeric: string): number
  export function parse(numeric: numeric, safeParse: {}): Option<number>
  export function parse(numeric: string | number | bigint, safeParse?: any) {
    const parsed = globalThis.Number.parseInt(globalThis.String(numeric))
    return safeParse === undefined 
      ? parsed 
      : globalThis.Number.isFinite(parsed) ? some(parsed) : none()
  }

  /** 
   * ### {@link parse `integer.parse`} `[type]`
   * ---
   * If {@link T `T`} is not parsable as an integer, returns `never`.
   * 
   * @example
   *  /// [type]
   *  import type { integer } from "@traversable/data"
   * 
   *  ///  example usage with numbers
   *  type ex_01 = integer.parse<1>
   *  //       ^?   type ex_01 = 1
   *  type ex_02 = integer.parse<-2>
   *  //       ^?   type ex_02 = -2
   *  type ex_03 = integer.parse<3n>
   *  //       ^?   type ex_03 = 3
   *  type ex_04 = integer.parse<-4.4>
   *  //       ^?   type ex_04 = -4
   * 
   *  ///  example usage with strings
   *  type ex_11 = integer.parse<"11">
   *  //       ^?    type ex_05 = 11
   *  type ex_12 = integer.parse<"-12">
   *  //       ^?    type ex_12 = -12
   *  type ex_13 = integer.parse<"13n">
   *  //       ^?    type ex_13 = 13
   *  type ex_14 = integer.parse<"-14.14">
   *  //       ^?    type ex_14 = -14
   */
  export type parse<T, U extends `${T & (string | number | bigint)}`= `${T & (string | number | bigint)}`>
    = `${U}` extends `${infer N extends number}.${string}` ? N
    : `${U}` extends `${infer N extends number}n` ? N
    : `${U}` extends `${infer N extends number}` ? N
    : from<T>
    ;


    /////////////////
    ///  numbers  ///
    type ex_01 = integer_.parse<1>
    //   ^? type ex_01 = 1
    type ex_02 = integer_.parse<-2>
    //   ^? type ex_02 = -2
    type ex_03 = integer_.parse<3n>
    //   ^? type ex_03 = 3
    type ex_04 = integer_.parse<-4.4>
    //   ^? type ex_04 = -4
    /////////////////
    ///  strings  ///
    type ex_11 = integer_.parse<"11">
    //   ^? type ex_05 = 11
    type ex_12 = integer_.parse<"-12">
    //   ^? type ex_12 = -12
    type ex_13 = integer_.parse<"13n">
    //   ^? type ex_13 = 13
    type ex_14 = integer_.parse<"-14.14">
    //   ^? type ex_14 = -14



  export function isOdd(x: integer): boolean { return (+x & 1) === 1 }
  export function isEven(x: integer): boolean { return (+x & 1) === 0 }
}
