import type { NonFiniteBoolean, NonFiniteIndex, NonFiniteNumber, NonFiniteString } from "./error.js"

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
 * //   ^?  type ex_02 = number
 * //                    ^^^^^^ this is `number` instead of `1` because `Finite`
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
 *   0.00000008e+8, *   0.0000000000013e+13,
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
    ? NonFiniteBoolean
    : boolean
  : [S] extends [number]
    ? [number] extends [S]
      ? NonFiniteNumber
      : number
    : [S] extends [string]
      ? [string] extends [S]
        ? NonFiniteString
        : string
      : [S] extends [{ [x: number]: any }]
        ? [string] extends [keyof S]
          ? NonFiniteIndex<S>
          : { [K in keyof S]: Finite<S[K]> }
        : unknown

/**
 * ## {@link finite `finite`}
 *
 * An **inductive constraint** that recursively checks to make sure its argument
 * is entirely finite.
 *
 * For additional docs/usage examples, see {@link Finite `Finite`}.
 */
export function finite<S extends Finite<S>>(s: S): S
export function finite<S extends Finite<S>>(s: S) {
  return s
}
