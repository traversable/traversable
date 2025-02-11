import type * as Error from "./error.js"
import type { _ } from "./types.js"

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
export type Finite<T> 
  = [T] extends [boolean] 
    ? [boolean] extends [T] ? Error.NonFiniteBoolean 
    : boolean
  : [T] extends [number] 
    ? [number] extends [T] ? Error.NonFiniteNumber 
    : number
  : [T] extends [string] 
    ? [string] extends [T] ? Error.NonFiniteString 
    : string
  : [T] extends [{ [x: number]: any }] 
    ? [string] extends [keyof T] ? Error.NonFiniteIndex<T> 
    : { -readonly [K in keyof T]: Finite<T[K]> }
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
export function finite<S extends Finite<S>>(s: S) { return s }

// declare function emptyObject<const T extends EmptyObject<T>>(x: T): T
// type NonEmpty<T> = [T] extends [readonly [any, ...any]] ? readonly [unknown, ...unknown[]] : never
// type OneOrMoreProperties<T, K extends keyof T = keyof T> = [K] extends [never] ? never : Record<K, T[K]>
// type TwoOrMoreProperties<T> = T

const identity: <T>(x: T) => T = (x) => x

export type Singleton<T> = [isSingleton<T>] extends [true] ? unknown : never
export const singleton: <T extends Singleton<T>>(x: T) => T = identity

export type Char<T> = [T] extends [`${string}${infer _}`] ? ([_] extends [""] ? string : never) : never
export function char<T extends Char<T>>(x: T): T { return x }

export type Equal<S, T> = [Equals<S, T>] extends [true] ? unknown : never
export function equal<const S>(_: S): <const T extends Equal<S, T>>(t: T) => T { return (t) => t }

export type Union<T, _ = T> = (_ extends _ ? ([T] extends [_] ? never : unknown) : never) extends infer U ? U : never
export const union: <T extends Union<T>>(x: T) => T = identity

export declare namespace Union {
  type is<T, U = T> 
    = (U extends U ? ([T] extends [U] ? false : true) : never) extends infer S
    ? boolean extends S ? true 
    : S 
    : never
    ;
  type toIntersection<
    T,
    U = (T extends T ? (contra: T) => void : never) extends (contra: infer U) => void ? U : never,
  > = U
  /**
   * ## {@link enumerate `Union.enumerate`}
   *
   * You'll sometimes see this type called "UnionToTuple".
   */
  type enumerate<U, _ = Union.toThunk<U> extends () => infer X ? X : never> = Union.enumerate.loop<[], U, _>
  namespace enumerate {
    type loop<Todo extends readonly unknown[], U, _ = Union.toThunk<U> extends () => infer X ? X : never> = [
      U,
    ] extends [never]
      ? Todo
      : Union.enumerate.loop<[_, ...Todo], Exclude<U, _>>
  }
  type toThunk<U> = (U extends U ? (_: () => U) => void : never) extends (_: infer _) => void ? _ : never
}

export type NonUnion<T, _ = T> = (_ extends _ ? ([T] extends [_] ? unknown : never) : never) extends infer U ? U : never
export const nonunion: <T extends NonUnion<T>>(x: T) => T = identity

export type isUnion<T> = [isNonUnion<T>] extends [true] ? false : true
export type isNonUnion<T, U = T, S = U extends U ? ([T] extends [U] ? true : false) : never> = [S] extends [true] ? true : false
export type isSingleton<T> = [T] extends [never] ? false : isNonUnion<T>
export type CharOrNonFinite<T> = [T] extends [infer U] ? (string extends U ? string : Char<T>) : never

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
export type Equals<S, T> = 
  (<F>() => F extends S ? true : false) extends 
  (<F>() => F extends T ? true : false)
  ? true
  : false
