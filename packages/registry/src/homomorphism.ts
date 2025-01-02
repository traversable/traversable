import type { HKT } from "@traversable/registry"

/** @internal */
const Array_isArray = globalThis.Array.isArray
/** @internal */
const Object_keys = globalThis.Object.keys

/** @internal */
export interface MapTo<S> extends HKT {
  [-1]: [this[0]] extends [MapTo<S>[0] & infer T] ? { [K in keyof T]: S } : never
}
/** @internal */
export type Record<T, In> = [T] extends [{ [x: string]: In }] ? { [x: string]: In } : { [K in keyof T]: In }

/**
 * ## {@link homomorphism `homomorphism`}
 *
 * Given an arbitrary function `f` that maps from `S` to `T`,
 * _lifts_ `f` so that it can be applied to any arbitrary JavaScript
 * shape.
 *
 * A homomorphism is a _structure preserving_ mapping operation.
 *
 * The docs for {@link homomorphism `homomorphism`} mostly contain examples.
 *
 * For a more in-depth write-up, see {@link Homomorphism `Homomorphism`}
 *
 * @example
 * declare const indexSignature: { [x: `on${string}`]: `${number}` }
 *
 * const mapParseInt = homomorphism(Number.parseInt)
 * //    ^? const mapParseInt: Homomorphism<string, number>
 *
 * const example_01 = mapParseInt(indexSignature)
 * //        ^? const ex_01: { [x: `on${string}`]: number }
 *
 * declare const tupleLabels: [$0: `${number}`, $1: `${number}`, $2: `${number}`]
 * const example_02 = mapParseInt(tupleLabels)
 * //        ^? const example_02: [$0: number, $1: number, $2: number]
 *
 * declare const jsDocs: {
 *   /\** \@deprecated *\/
 *   readonly hoverMe?: string
 * }
 * const example_03 = mapParseInt(jsDocs)
 * //        ^? const example_03: { readonly ex_03?: number }
 *
 * // JSDocs transfer to the output object:
 * example_03.hoverMe
 * //          ^^^^  /\** \@deprecated *\/
 * //                (property) hoverMe: number | undefined
 */

export function homomorphism<S, T>(f: (s: S) => T): Homomorphism<S, T>
export function homomorphism<S, T>(f: (s: S) => T) {
  return (xs: { [x: string]: S }) => {
    let out = (Array_isArray(xs) ? [] : {}) as { [x: string]: T }
    let ks = Object_keys(xs)
    let k: string | undefined
    while ((k = ks.shift()) !== undefined) out[k] = f(xs[k])
    return out
  }
}

/**
 * ## {@link Homomorphism `Homomorphism`}
 *
 * These docs include a short write-up about why you might want to use
 * {@link homomorphism `homomorphism`}.
 *
 * To see a few examples of the utility being used, see
 * {@link homomorphism `homomorphism`}.
 *
 * A homomorphism is a _structure-preserving_ mapping between two
 * functors.
 *
 * Any arbitrary unary function can become homomorphisc.
 *
 * A functin's homomorphic form comes with a few benefits:
 *
 * 1. we can write a single function that is "data-type" generic,
 * without (necessarily) resorting to ad hoc polymorphism
 *
 * 2. promoting a function to work with a composite becomes a
 * _lossless operation_, with respect to its container, since by
 * definition a {@link homomorphism `homomorphism`} _preserves structure_.
 *
 * 3. a type returned by {@link homomorphism `homomorphism`} has the
 * benefit of being _entirely derived_, which has some interesting
 * knock-on effects.
 *
 * For example:
 *
 * - `optional properties` are preserved without the need to "rebuild" the structure
 * - `readonly properties` are preserved without the need to "rebuild" the structure
 * - `JSDoc annotations` and other LSP artifacts are preserved, AFAIK cannot be recovered
 * - `"Compiler state"` _flows through_ function application
 *
 * See also:
 * - {@link homomorphism `homomorphism`}
 */
interface Homomorphism<In = any, Out = unknown> extends MapTo<Out> {
  <const T extends Record<T, In>>(x: T): HKT.apply_<this, T>
  <const T extends Partial<readonly In[]>>(x: T): HKT.apply_<this, T>
}

/**
 * - [ ] TODO: add functor overload to {@link Homomorphism}, e.g.:
 *
 * @example
 * interface Homomorphism<In = any, Out = unknown> extends Homo<Out> {
 *   <F extends HKT>(F: Functor<F>, x: HKT.product<F, I>): HKT.apply_<F, O>
 *   //                 ^^^^^^^ --- here
 *   <const T extends Record<T, In>>(x: T): HKT.apply_<this, T>
 *   <const T extends Partial<readonly In[]>>(x: T): HKT.apply_<this, T>
 * }
 *
 * // interface Homomorphism<I = any, O = unknown> extends HKT<{ [x: number]: O }> {
 * //   <const T extends [T] extends [Record<string, I>] ? Record<string, I> : { [K in keyof T]: I }>(x: T): HKT.apply_<this, T>
 * //   <const T extends [T] extends [Partial<readonly I[]>] ? unknown : I[]>(x: T): HKT.apply_<this, T>
 * //   [-1]: [this[0]] extends [Homomorphism<I, O>[0] & infer S] ? { -readonly [K in keyof S]: O } : never
 * // }
 */
