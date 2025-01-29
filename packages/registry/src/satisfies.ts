import type * as Error from "./error.js"
import type {
  Array,
  Dict,
  Equals,
  NonUnion,
  Omit,
  Primitive,
  Union,
  _,
  isNonUnion,
  isSingleton,
  isUnion,
} from "./types.js"

/**
 * ## {@link Finite `Finite`}
 *
 * An **inductive constraint** that recursively checks to make sure its argument
 * is entirely finite.
 *
 * Because {@link Finite `Finite`} appears in the opposite position, its
 * constraints seem to be applied to the _leaves first_. That's the only way I
 * can explain its performance, which scales pretty well w/r/t input size.
 *
 * Also has __very localized error messages__, which I haven't been able to pull off
 * using any other approach.
 *
 * _meant to be applied to the type parameter as it's being declared_.
 *
 * See also: {@link finite `finite`}
 *
 * @example
 * import { Finite, finite } from "@traversable/registry"
 *
 * type CheckFinite<T extends Finite<T>> = T
 * //                                ^ -- note where `Finite` appears in relation to `T`
 *
 * const ex_01 = finite([1, [2, [3]]])
 * //    ^?const ex_01: [1, [2, [3]]]
 *
 * type ex_02 = CheckFinite<1>
 * //    ^?  type ex_02 = number
 * //                     ^^^^^^ this is `number` instead of `1` because `Finite`
 * //                           only _constraints_ its argument
 *
 * const ex_02 = finite([1, [2, { a: Math.random() }]])
 * //                             ^? (property) a: 🚫 TypeError<"Unexpected non finite type:", number>
 *
 * const ex_55 = finite([
 *   //  ^?
 *   0.e+0,
 *   0.1e+1,
 *   0.1e+1,
 *   0.02e+2,
 *   0.003e+3,
 *   0.00005e+5,
 *   0.00000008e+8,
 *   0.0000000000013e+13,
 *   0.000000000000000000021e+21,
 *   0.0000000000000000000000000000000034e+34,
 *   0.0000000000000000000000000000000000000000000000000000055e+55,
 *   0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000089e+89,
 * ])
 *
 * const ex_56 = finite([
 *   //  ^?
 *   0.e-0,
 *   10.e-1,
 *   10.e-1,
 *   200.e-2,
 *   3000.e-3,
 *   500000.e-5,
 *   800000000.e-8,
 *   130000000000000.e-13,
 *   21000000000000000000000.e-21,
 *   340000000000000000000000000000000000.e-34,
 *   550000000000000000000000000000000000000000000000000000000.e-55,
 *   8900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000.e-89,
 * ])
 */
export type Finite<S> = [S] extends [boolean]
  ? [boolean] extends [S]
    ? Error.NonFiniteBoolean
    : boolean
  : [S] extends [number]
    ? [number] extends [S]
      ? Error.NonFiniteNumber
      : number
    : [S] extends [string]
      ? [string] extends [S]
        ? Error.NonFiniteString
        : string
      : [S] extends [{ [x: number]: any }]
        ? [string] extends [keyof S]
          ? Error.NonFiniteIndex<S>
          : { -readonly [K in keyof S]: Finite<S[K]> }
        : void

export type EmptyObject<T> = { [K in keyof T]: never }

/**
 * ## {@link finite `finite`}
 *
 * An **inductive constraint** that recursively unfolds a type from a seed,
 * and dies if any part of itself cannot be represented as finite.
 *
 * **Note:** this is a type-level utility function; at runtime,
 * {@link finite `finite`} is equivalent to `identity`.
 *
 * For additional docs/usage examples, see {@link Finite `Finite`}.
 */
export function finite<S extends Finite<S>>(s: S): S
export function finite<S extends Finite<S>>(s: S) {
  return s
}

// declare function emptyObject<const T extends EmptyObject<T>>(x: T): T
// type NonEmpty<T> = [T] extends [readonly [any, ...any]] ? readonly [unknown, ...unknown[]] : never
// type OneOrMoreProperties<T, K extends keyof T = keyof T> = [K] extends [never] ? never : Record<K, T[K]>
// type TwoOrMoreProperties<T> = T

const identity: <T>(x: T) => T = (x) => x

export const nonunion: <T extends NonUnion<T>>(x: T) => T = identity
export const union: <T extends Union<T>>(x: T) => T = identity

export type Singleton<T> = [isSingleton<T>] extends [true] ? unknown : never
export const singleton: <T extends Singleton<T>>(x: T) => T = identity

export type Char<T> = [T] extends [`${string}${infer _}`] ? ([_] extends [""] ? string : never) : never
export function char<T extends Char<T>>(x: T): T {
  return x
}

export type Equal<S, T> = [Equals<S, T>] extends [true] ? unknown : never
export function equal<const S>(_: S): <const T extends Equal<S, T>>(t: T) => T {
  return (t) => t
}

// declare function assertType<Expected, const Actual = Expected>(term: Actual): void
