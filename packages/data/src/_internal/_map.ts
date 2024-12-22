import type { key, keys, unicode } from "@traversable/data"
import type { Indexable as S } from "@traversable/registry"
import type { some } from "any-ts"

/** @internal */
const Array_isArray = globalThis.Array.isArray
/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const Object_defineProperty = globalThis.Object.defineProperty
/** @internal */
const Object_getOwnPropertySymbols = globalThis.Object.getOwnPropertySymbols

// TODO: use `Object.assign` w/ `Object.create(null)` to replace this, if you can
/** @internal */
const poisonable = [
  "__proto__",
  "toString",
] as const satisfies string[]

/** @internal */
function bind<T, K extends key.any, V>(object: T, key: K, value: V): { [P in K]: V } & T
/// impl.
function bind(src: S, k: key.any, v: unknown) {
  return (poisonable as keys.any).includes(k) 
    ? (Object_defineProperty(src, k, { value: v, configurable: true, enumerable: true, writable: true }), src)
    : (src[k] = v, src)
}

/** 
 * ### {@link mapfn `mapfn`}  
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export interface mapfn<S, T = unknown> 
  { (value: S[some.keyof<S>], key: some.keyof<S>, src: S): T }

/** 
 * ## {@link map `map`}
 * #### ｛ {@link unicode.jsdoc.mapping ` 🌈 `} ｝〔{@link map `1/2`}〕
 * 
 * - [TypeScript playground](https://tsplay.dev/weA2Yw)
 * 
 * {@link map `map`} takes two arguments:
 * 1. a mapping function ({@link mapfn `mapfn`})
 * 2. a composite data structure that contains one or more targets to apply the function to
 * 
 * A unique feature of this implementation is polymorphism: it doesn't care whether the
 * composite data structure is an array, or whether it's an object. It will apply the argument
 * to each of the children, and will __preserve__ the __structure__ of the original shape.
 * 
 * **Trade-off:** the data-last overload of {@link map `map`} is optimized for function composition. 
 * It works best when used inside a call to {@link fn.pipe `fn.pipe`} or {@link fn.flow `fn.flow`}.
 * It comes with greater potential for code re-use, at the cost of slightly slower performance.
 * 
 * **Ergonomics:** if you'd prefer to provide both arguments at the same time, see overload #2.
 * 
 * See also:
 * - [Functor](https://en.wikipedia.org/wiki/Functor)
 * - {@link mapfn `mapfn`}
 */

export function map<const S, T>
  (mapfn: mapfn<S, T>): (src: S) => { -readonly [K in keyof S]: T }

/**
 * ## {@link map `map`}
 * #### ｛ {@link unicode.jsdoc.mapping ` 🌈 `} ｝〔{@link map `2/2`}〕
 * 
 * - [TypeScript playground](https://tsplay.dev/weA2Yw)
 *
 * {@link map `map`} takes two arguments:
 * 1. a mapping function ({@link mapfn `mapfn`})
 * 2. a composite data structure that contains one or more targets to apply the function to
 * 
 * {@link map `map`} is a polymorphic function that accepts a function and a data structure (such 
 * as an array or object) to apply the function to.
 * 
 * A unique feature of this implementation is its polymorphism: it doesn't care whether the
 * data structure is an array, or whether it's an object. It will apply the argument
 * to each of the children, and will __preserve__ the __structure__ of the original shape.
 * 
 * **Trade-off:** the data-first overload of {@link map `map`} evaluates eagerly. It comes with 
 * slightly better performance than the data-last overload, but is not reusable.
 * 
 * **Ergonomics:** if you'd prefer to use {@link map `map`} in a pipeline, see overload #1.
 * 
 * See also:
 * - [Functor](https://en.wikipedia.org/wiki/Functor)
 * - {@link mapfn `mapfn`}
 */
export function map<const S, T>
  (src: S, mapfn: mapfn<S, T>): { -readonly [K in keyof S]: T }

// impl.
export function map(
  ...args:
    | [f: mapfn<S>]
    | [src: S, f: mapfn<S>]
) {
  if (args.length === 1) return (src: S) => map(src, ...args) 
  else {
    const [src, f] = args
    if (Array_isArray(src)) return src.map(f as never)
    else {
      let out: S = {}
      for (const ix in src) void bind(out, ix, f(src[ix], ix, src))
      return out
    }
  }
}

export function mapPreserveSymbols<const S, T>
  (mapfn: mapfn<S, T>): (src: S) => { -readonly [K in keyof S]: T }

export function mapPreserveSymbols<const S, T>
  (src: S, mapfn: mapfn<S, T>): { -readonly [K in keyof S]: T }
// impl.
export function mapPreserveSymbols(
  ...args:
    | [f: mapfn<S>]
    | [src: S, f: mapfn<S>]
) {
  if(args.length === 1) 
    return (src: S) => mapPreserveSymbols(src, args[0]) 
  else {
    const [src, f] = args
    if(Array_isArray(src)) return src.map(f as never)
    else {
      const syms = Object_getOwnPropertySymbols(src)
      const ks = Object_keys(src)
      let out: S= {}
      for (let ix = 0, len = ks.length; ix < len; ix++) {
        const k = ks[ix]
        const x = src[k]
        out[k] = f(x, k, src)
      }
      for (let ix = 0, len = syms.length; ix < len; ix++) {
        const sym = syms[ix]
        out[sym] = src[sym]
      }
      return out
    }
  }
}

/** 
 * ## {@link forEach `forEach`}
 * ### ｛ {@link jsdoc.empty ` ️🕳️‍ ` } ｝
 * 
 * Close cousin of {@link globalThis.Array.prototype.forEach `Array.prototype.forEach`}.
 * 
 * See also:
 * - {@link globalThis.Array.prototype.forEach `Array.prototype.forEach`}
 */
export function forEach<const S>(effect: mapfn<S, void>): (object: S) => void
export function forEach<const S>(src: S, effect: mapfn<S, void>): void
export function forEach
  (...args: [eff: mapfn<S, void>] | [object: S, eff: mapfn<S, void>]): 
    void | ((object: S) => void) /// impl.
  { return args.length === 1 ? map(...args) : void map(...args) }

// function unsafeBind<T extends {}, K extends keyof any, V>(
//   object: T, 
//   key: K, 
//   value: V
// ) {
//   return (
//     void Object_defineProperty(object, key, { 
//       value, configurable: true, 
//       enumerable: true, 
//       writable: true 
//     }), 
//     object
//   )
// }
