import { URI } from "@traversable/registry"
import type { integer, number } from "@traversable/registry"
import type { None, Option, Some } from "./exports.js"
import type { numeric } from "./number.js"

/** @internal */
const none = (): None => ({ _tag: URI.None })
/** @internal */
const some = <T>(value: T): Some<T> => ({ _tag: URI.Some, value })

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

namespace integer_ {
  /**
   * ### {@link is `integer.is`}
   *
   * A type guard that narrows its argument from `unknown` to {@link integer `integer`}
   */
  export const is = (u: unknown): u is integer => typeof u === "number" && (+u.toFixed(0) === u)

  /** 
   * -----------
   * #### {@link parse `number.parse`} `(type)`
   * 
   * If {@link T `T`} is not parsable as an integer, returns `never`.
   */
  export type parseInt<T, Distributive = never> 
    = [Distributive] extends [never] 
    ? [T] extends [`${infer N extends number}.${string}$`] ? N
    : [T] extends [`${infer N extends number}`] ? N 
    : from<T>
    : T extends T ? parseInt<T, never> : never

  /** 
   * ### {@link parse `number.parse`}
   * 
   * -----------
   * #### {@link parse `number.parse`} `(term)`
   * 
   * If the 2nd argument (`safeParse`) is provided and {@link numeric `numeric`} 
   * parses as one of the following, returns {@link None `None`}:
   * 
   * - {@link globalThis.NaN `NaN`}
   * - {@link globalThis.Number.NEGATIVE_INFINITY `-Infinity`}
   * - {@link globalThis.Number.POSITIVE_INFINITY `Infinity`}
   * 
   * @example
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

  export function isOdd(x: integer): boolean { return (+x & 1) === 1 }
  export function isEven(x: integer): boolean { return (+x & 1) === 0 }
}
