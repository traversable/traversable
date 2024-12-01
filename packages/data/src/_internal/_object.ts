import type { Universal, inline, mutable as mut, newtype, nonempty, some } from "any-ts"

// type-level dependencies
import type * as array from "../array.js"
import type { entry } from "../entry.js"
import type { object } from "../exports.js"
import type { any } from "./_any.js"
import type { prop, props } from "./_prop.js"
import type { to } from "./_to.js"
import type { jsdoc } from "./_unicode.js"

import { Invariant, URI, symbol } from "@traversable/registry"
// dependencies IRL
import * as fn from "./_function.js"
import { key, type keys } from "./_key.js"
import { map } from "./_map.js"
import { 
  escape, 
  isQuoted, 
  isValidIdentifier, 
  toString,
} from "./_string.js"

type mutable<T> = never | { -readonly [K in keyof T]: T[K] }
/** @internal */
type keyOf<T> = never | ((T extends array.any ? number : keyof T) & keyof T)
/** @internal */
type valueOf<T> = never | T[keyOf<T>]
/** @internal */
type autocomplete<T> = T | (string & {})
/** @internal */
type getOrUnknown<T> = [T] extends [never] ? unknown : T
/** @internal */
type evaluate<T> = never | { [K in keyof T]: T[K] }
/** @internal */
type parseInt<T> = [T] extends [`${infer N extends number}`] ? N : T;
/** @internal */
type literal<T extends any.primitive> 
  = string extends T ? never
  : number extends T ? never
  : boolean extends T ? never
  : T

/** @internal - makes lookup a one-time cost */
const Object_keys = globalThis.Object.keys
/** @internal - makes lookup a one-time cost */
const Object_values = globalThis.Object.values
/** @internal - makes lookup a one-time cost */
const Object_entries = globalThis.Object.entries
/** @internal - makes lookup a one-time cost */
const Object_create = globalThis.Object.create
/** @internal - makes lookup a one-time cost */
const Object_getPrototypeOf = globalThis.Object.getPrototypeOf
/** @internal - makes lookup a one-time cost */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal - makes lookup a one-time cost */
const Object_getOwnPropertySymbols = globalThis.Object.getOwnPropertySymbols
/** @internal - makes lookup a one-time cost */
// const Object_prototype_hasOwnProperty = globalThis.Object.prototype.hasOwnProperty
/** @internal */
const Object_hasOwnProperty 
  : (object: {}, property: keyof any) => boolean
  = globalThis.Function.call.bind(globalThis.Object.prototype.hasOwnProperty) as never
/** @internal - makes lookup a one-time cost */
const Object_hasOwn
  : <K extends key.any>(u: unknown, k: key.any) => u is { [P in K]: unknown }
  = (u, k): u is never => object_isComposite(u) && Object_hasOwnProperty(u, k)

/** @internal */
const isArray: (u: unknown) => u is array.any = globalThis.Array.isArray
/** @internal */
/** @internal */
const isSymbol = (u: unknown): u is symbol => 
  typeof u === "symbol"
/** @internal */
const isBigInt = (u: unknown): u is bigint => 
  typeof u === "bigint"
/** @internal */
const isFunction = (u: unknown): u is fn.any => 
  typeof u === "function"
/** @internal */
function getEmpty<T extends {}>(_: T): any.indexedBy<keyof T | number>
function getEmpty(_: {}) { return isArray(_) ? [] : {} }

/**
 * ## {@link object_symbols `object.symbols`}
 * ### ｛ {@link jsdoc.destructor ` ️⛓️‍💥️‍ `} ｝
 * 
 * Returns an array of all of an object's own (non-inherited) symbol properties.
 * 
 * {@link object_symbols `object.symbols`} is like {@link object_keys `object.keys`},
 * but for symbols.
 * 
 * See also:
 * - {@link object_keys `object.keys`}
 * - {@link globalThis.Object.getOwnPropertySymbols `globalThis.Object.getOwnPropertySymbols`}
 * - the [MDN docs on `Object.getOwnPropertySymbols`](
 *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols)
 */
export const object_symbols: {
  <T extends object.any>(object: T): object_symbols<T>[]
  (object: object.any): symbol[]
} = Object_getOwnPropertySymbols


export type object_symbols<
  T, 
  K extends 
  | keyof T & symbol 
  = keyof T & symbol
> = [K] extends [never] ? symbol : K

export function object_isEmpty<T extends {}>(object: T): boolean {
  for (const k in object) if (Object_hasOwn(object, k)) return false
  return true
}

/**
 * ## {@link object_mapKeys `object.mapKeys`} 
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * Because it does not preserve any type information, {@link object_mapKeys `object.mapKeys`} is best 
 * used as an intermediate function, as you build up the value (and type) that you actually want at
 * the end.
 */
export function object_mapKeys(fn: (k: key.any) => key.any): (object: { [x: number]: unknown }) => { [x: number]: unknown }
export function object_mapKeys(fn: (k: key.any) => key.any) {
  return (object: { [x: number]: unknown }) => {
    if (isArray(object)) return object
    else {
      let out: { [x: number | string]: unknown } = {}
      for (const k in object) out[fn(k) as never] = object[k]
      return out
    }
  }
}

/**
 * ### {@link object_has `object.has`}
 * 
 * See also:
 * - {@link object_fromPath `object.fromPath`}
 */
export function object_has<const KS extends keys.any>
  (...path: KS): (u: unknown) => u is object_has<[...KS]>
export function object_has<const KS extends props.any, V>
  (leaf: (u: unknown) => u is V, ...path: KS): 
  (u: unknown) => u is object_has<[...KS], V>
/// impl.
export function object_has(...[head, ...tail]: object_has.allArgs) {
  const path = typeof head === "function" ? tail : [head, ...tail]
  const guard = typeof head === "function" ? head : object_has.defaults.guard
  return (u: unknown): u is typeof u => {
    let out: unknown = u
    let k: prop.any | undefined
    while (k = path.shift()) {
      if (!object_isComposite(out)) return false
      out = out[k]
    }
    return guard(out)
  }
}

export type object_has<KS extends keys.any, V = unknown>
  = KS extends [...infer Todo extends props.any, infer Next extends prop.any]
  ? object_has.loop<Next, Todo, V>
  : V
export declare namespace object_has {
  type allArgs = [head: prop.any | ((u: unknown) => u is typeof u), ...tail: props.any]
  type loop<
    K extends key.any, 
    KS extends props.any, 
    V
  > = object_has<KS, { [P in K]: V }>
}
export namespace object_has {
  export const defaults = { guard: (_: unknown): _ is typeof _ => true }
}

/** 
 * ## {@link object_fromPath `object.fromPath`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * Similar to {@link object_fromPaths `object.fromPath`}, but only supports
 * creating an object from a single path.
 * 
 * See also:
 * - {@link object_fromPaths `object.fromPaths`}
 */
export function object_fromPath<const V, const KS extends props.any>
  (leaf: V, ...keys: KS): object_has<KS, V> 
/// impl.
export function object_fromPath(leaf: unknown, ...keys: prop.any[]) {
  let 
    out: unknown = leaf,
    k: prop.any | undefined
  while 
    ((k = keys.pop()) !== undefined) 
    void (out = { [k]: out })
  return out
}

/** ### {@link object_knownPart `object.knownPart`} */
export type object_knownPart<T> = never | 
  { [k in keyof T as literal<k>]: T[k] }

/** ### {@link object_optionalKeys `object.optionalKeys`} */
export type object_optionalKeys<T, K = keyof T> = 
  K extends keyof T ? {} extends globalThis.Pick<T, K> ? K : never : never
/** ### {@link object_requiredKeys `object.requiredKeys`} */
export type object_requiredKeys<T, K = keyof T> = 
  K extends keyof T ? {} extends globalThis.Pick<T, K> ? never : K : never
/** ### {@link object_required `object.required`} */
export type object_required<T> = never | 
  object_pick<T, object_requiredKeys<T>>
/** ### {@link object_optional `object.optional`} */
export type object_optional<T> = never | 
  object_pick<T, object_optionalKeys<T>>
/** ### {@link object_omitLax `object.omitLax`} */
export type object_omitLax<T, K extends key.any> = never | 
  object_pick<T, globalThis.Exclude<keyof T, K>>
/** ### {@link object_invertible `object.invertible`} */
export type object_invertible<
  T extends 
  | { [x: key.any]: key.any } 
  = { [x: key.any]: key.any }
> = T

/** 
 * ## {@link object_pick.defer `object.defer.defer`} 
 * ### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } , {@link jsdoc.preserves_reference ` 🧩‍ ` } ｝
 * 
 * Term-level equivalent of {@link globalThis.Pick `globalThis.Pick`}.
 * 
 * Variant of {@link object_pick `object.pick`} that supports partial application.
 * 
 * See also:
 * - {@link object_pick `object.pick`}
 * - {@link object_omit.defer `object.omit.defer`}
 */
object_pick.defer = (
  function object_pick_defer(...key: nonempty.arrayOf<prop.any>) 
    { return (object: object.any) => object_pick(object, ...key) }
) as {
  <
    const T extends object.any, 
    A extends keyof T,
    B extends globalThis.Exclude<keyof T, A>,
    C extends globalThis.Exclude<keyof T, A | B>,
    D extends globalThis.Exclude<keyof T, A | B | C>,
    E extends globalThis.Exclude<keyof T, A | B | C | D>,
    F extends globalThis.Exclude<keyof T, A | B | C | D | E>,
    G extends globalThis.Exclude<keyof T, A | B | C | D | E | F>,
    H extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G>,
    I extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H>,
    J extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H | I>,
    K extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H | I | J>
  >(...keys: [A, B, C, D, E, F, G, H, I, J, K]): (object: T) => object_pick<T, A | B | C | D | E | F | G | H | I | J | K>;
  <
    const T extends object.any, 
    B extends keyof T,
    C extends globalThis.Exclude<keyof T, B>,
    D extends globalThis.Exclude<keyof T, B | C>,
    E extends globalThis.Exclude<keyof T, B | C | D>,
    F extends globalThis.Exclude<keyof T, B | C | D | E>,
    G extends globalThis.Exclude<keyof T, B | C | D | E | F>,
    H extends globalThis.Exclude<keyof T, B | C | D | E | F | G>,
    I extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H>,
    J extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H | I>,
    K extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H | I | J>
  >(...keys: [B, C, D, E, F, G, H, I, J, K]): (object: T) => object_pick<T, B | C | D | E | F | G | H | I | J | K>;
  <
    const T extends object.any, 
    C extends keyof T,
    D extends globalThis.Exclude<keyof T, C>,
    E extends globalThis.Exclude<keyof T, C | D>,
    F extends globalThis.Exclude<keyof T, C | D | E>,
    G extends globalThis.Exclude<keyof T, C | D | E | F>,
    H extends globalThis.Exclude<keyof T, C | D | E | F | G>,
    I extends globalThis.Exclude<keyof T, C | D | E | F | G | H>,
    J extends globalThis.Exclude<keyof T, C | D | E | F | G | H | I>,
    K extends globalThis.Exclude<keyof T, C | D | E | F | G | H | I | J>
  >(...keys: [C, D, E, F, G, H, I, J, K]): (object: T) => object_pick<T, C | D | E | F | G | H | I | J | K>;
  <
    const T extends object.any, 
    D extends keyof T,
    E extends globalThis.Exclude<keyof T, D>,
    F extends globalThis.Exclude<keyof T, D | E>,
    G extends globalThis.Exclude<keyof T, D | E | F>,
    H extends globalThis.Exclude<keyof T, D | E | F | G>,
    I extends globalThis.Exclude<keyof T, D | E | F | G | H>,
    J extends globalThis.Exclude<keyof T, D | E | F | G | H | I>,
    K extends globalThis.Exclude<keyof T, D | E | F | G | H | I | J>
  >(...keys: [D, E, F, G, H, I, J, K]): (object: T) => object_pick<T, D | E | F | G | H | I | J | K>;
  <
    const T extends object.any, 
    E extends keyof T,
    F extends globalThis.Exclude<keyof T, E>,
    G extends globalThis.Exclude<keyof T, E | F>,
    H extends globalThis.Exclude<keyof T, E | F | G>,
    I extends globalThis.Exclude<keyof T, E | F | G | H>,
    J extends globalThis.Exclude<keyof T, E | F | G | H | I>,
    K extends globalThis.Exclude<keyof T, E | F | G | H | I | J>
  >(...keys: [E, F, G, H, I, J, K]): (object: T) => object_pick<T, E | F | G | H | I | J | K>;
  <
    const T extends object.any, 
    F extends keyof T,
    G extends globalThis.Exclude<keyof T, F>,
    H extends globalThis.Exclude<keyof T, F | G>,
    I extends globalThis.Exclude<keyof T, F | G | H>,
    J extends globalThis.Exclude<keyof T, F | G | H | I>,
    K extends globalThis.Exclude<keyof T, F | G | H | I | J>
  >(...keys: [F, G, H, I, J, K]): (object: T) => object_pick<T, F | G | H | I | J | K>;
  <
    const T extends object.any, 
    G extends keyof T,
    H extends globalThis.Exclude<keyof T, G>,
    I extends globalThis.Exclude<keyof T, G | H>,
    J extends globalThis.Exclude<keyof T, G | H | I>,
    K extends globalThis.Exclude<keyof T, G | H | I | J>
  >(...keys: [G, H, I, J, K]): (object: T) => object_pick<T, G | H | I | J | K>;
  <
    const T extends object.any,
    H extends keyof T,
    I extends globalThis.Exclude<keyof T, H>,
    J extends globalThis.Exclude<keyof T, H | I>,
    K extends globalThis.Exclude<keyof T, H | I | J>
  >(...keys: [H, I, J, K]): (object: T) => object_pick<T, H | I | J | K>;
  <
    const T extends object.any,
    I extends keyof T,
    J extends globalThis.Exclude<keyof T, I>,
    K extends globalThis.Exclude<keyof T, I | J>
  >(...keys: [I, J, K]): (object: T) => object_pick<T, I | J | K>;
  <
    const T extends object.any,
    J extends keyof T,
    K extends globalThis.Exclude<keyof T, J>
  >(...keys: [J, K]): (object: T) => object_pick<T, J | K>;
  <
    const T extends object.any,
    K extends keyof T
  >(...keys: [K, ...K[]]): (object: T) => object_pick<T, K>;
}

export type object_pick<T, K extends keyof T> = never | { -readonly [P in K]: T[P] }

/** 
 * ## {@link object_pick `object.pick`}
 * ### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } , {@link jsdoc.preserves_reference ` 🧩‍ ` } ｝
 * 
 * Term-level equivalent of {@link globalThis.Pick `globalThis.Pick`}.
 * 
 * **Note:** This variant has been optimized for autocompletion of property names.
 * 
 * Its behavior is modeled after how autocompletion for imports works, in that
 * picking a key is the same as removing it from the keys available. This is done 
 * so users are able to `tab + space` their way through the list of keys, by making
 * sure that `autocompletion[0]` always maps to a key that has not yet been picked.
 * 
 * See also:
 * - {@link object_pick.defer `object.pick.defer`}
 * - {@link object_omit `object.omit.defer`}
 */
export function object_pick<
  const T extends object.any,
  A extends keyof T,
  B extends globalThis.Exclude<keyof T, A>,
  C extends globalThis.Exclude<keyof T, A | B>,
  D extends globalThis.Exclude<keyof T, A | B | C>,
  E extends globalThis.Exclude<keyof T, A | B | C | D>,
  F extends globalThis.Exclude<keyof T, A | B | C | D | E>,
  G extends globalThis.Exclude<keyof T, A | B | C | D | E | F>,
  H extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G>,
  I extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H>,
  J extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H | I>,
  K extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H | I | J>
>(object: T, ...keys: [A, B, C, D, E, F, G, H, I, J, K]): object_pick<T, A | B | C | D | E | F | G | H | I | J | K>;
export function object_pick<
  const T extends object.any,
  B extends keyof T,
  C extends globalThis.Exclude<keyof T, B>,
  D extends globalThis.Exclude<keyof T, B | C>,
  E extends globalThis.Exclude<keyof T, B | C | D>,
  F extends globalThis.Exclude<keyof T, B | C | D | E>,
  G extends globalThis.Exclude<keyof T, B | C | D | E | F>,
  H extends globalThis.Exclude<keyof T, B | C | D | E | F | G>,
  I extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H>,
  J extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H | I>,
  K extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H | I | J>
>(object: T, ...keys: [B, C, D, E, F, G, H, I, J, K]): object_pick<T, B | C | D | E | F | G | H | I | J | K>;
export function object_pick<
  const T extends object.any,
  C extends keyof T,
  D extends globalThis.Exclude<keyof T, C>,
  E extends globalThis.Exclude<keyof T, C | D>,
  F extends globalThis.Exclude<keyof T, C | D | E>,
  G extends globalThis.Exclude<keyof T, C | D | E | F>,
  H extends globalThis.Exclude<keyof T, C | D | E | F | G>,
  I extends globalThis.Exclude<keyof T, C | D | E | F | G | H>,
  J extends globalThis.Exclude<keyof T, C | D | E | F | G | H | I>,
  K extends globalThis.Exclude<keyof T, C | D | E | F | G | H | I | J>
>(object: T, ...keys: [C, D, E, F, G, H, I, J, K]): object_pick<T, C | D | E | F | G | H | I | J | K>;
export function object_pick<
  const T extends object.any,
  D extends keyof T,
  E extends globalThis.Exclude<keyof T, D>,
  F extends globalThis.Exclude<keyof T, D | E>,
  G extends globalThis.Exclude<keyof T, D | E | F>,
  H extends globalThis.Exclude<keyof T, D | E | F | G>,
  I extends globalThis.Exclude<keyof T, D | E | F | G | H>,
  J extends globalThis.Exclude<keyof T, D | E | F | G | H | I>,
  K extends globalThis.Exclude<keyof T, D | E | F | G | H | I | J>
>(object: T, ...keys: [D, E, F, G, H, I, J, K]): object_pick<T, D | E | F | G | H | I | J | K>;
export function object_pick<
  const T extends object.any,
  E extends keyof T,
  F extends globalThis.Exclude<keyof T, E>,
  G extends globalThis.Exclude<keyof T, E | F>,
  H extends globalThis.Exclude<keyof T, E | F | G>,
  I extends globalThis.Exclude<keyof T, E | F | G | H>,
  J extends globalThis.Exclude<keyof T, E | F | G | H | I>,
  K extends globalThis.Exclude<keyof T, E | F | G | H | I | J>
>(object: T, ...keys: [E, F, G, H, I, J, K]): object_pick<T, E | F | G | H | I | J | K>;
export function object_pick<
  const T extends object.any,
  F extends keyof T,
  G extends globalThis.Exclude<keyof T, F>,
  H extends globalThis.Exclude<keyof T, F | G>,
  I extends globalThis.Exclude<keyof T, F | G | H>,
  J extends globalThis.Exclude<keyof T, F | G | H | I>,
  K extends globalThis.Exclude<keyof T, F | G | H | I | J>
>(object: T, ...keys: [F, G, H, I, J, K]): object_pick<T, F | G | H | I | J | K>;
export function object_pick<
  const T extends object.any,
  G extends keyof T,
  H extends globalThis.Exclude<keyof T, G>,
  I extends globalThis.Exclude<keyof T, G | H>,
  J extends globalThis.Exclude<keyof T, G | H | I>,
  K extends globalThis.Exclude<keyof T, G | H | I | J>
>(object: T, ...keys: [G, H, I, J, K]): object_pick<T, G | H | I | J | K>;
export function object_pick<
  const T extends object.any,
  H extends keyof T,
  I extends globalThis.Exclude<keyof T, H>,
  J extends globalThis.Exclude<keyof T, H | I>,
  K extends globalThis.Exclude<keyof T, H | I | J>
>(object: T, ...keys: [H, I, J, K]): object_pick<T, H | I | J | K>;
export function object_pick<
  const T extends object.any,
  I extends keyof T,
  J extends globalThis.Exclude<keyof T, I>,
  K extends globalThis.Exclude<keyof T, I | J>
>(object: T, ...keys: [I, J, K]): object_pick<T, I | J | K>;
export function object_pick<
  const T extends object.any,
  J extends keyof T,
  K extends globalThis.Exclude<keyof T, J>
>(object: T, ...keys: [J, K]): object_pick<T, J | K>;
export function object_pick<
  const T extends object.any,
  K extends keyof T
>(object: T, ...keys: [K, ...K[]]): object_pick<T, K>;

export function object_pick<const T extends object.any>(object: T, ...key: (keyof any)[]): 
  globalThis.Partial<object.any>
/// impl.
export function object_pick(object: { [x: keyof any]: unknown }, ...key: (keyof any)[]) {
  const keep = new globalThis.Set(key)
  /** 
   * **Optimization:** If the user picked _all the keys_, don't create a new object.
   * Return `object` to preserve the reference and keep our memory footprint small.
   */
  if (Object_keys(object).every((k) => keep.has(k))) return object
  else {
    let out: { [x: keyof any]: unknown } = {}
    for (let ix = 0; ix < key.length; ix++) {
      const k = key[ix]
      if (k in object) out[k] = object[k]
    }
    return out
  }
}

/** 
 * ## {@link object_omit.defer `object.omit.defer`} 
 * ### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } , {@link jsdoc.preserves_reference ` 🧩‍ ` } ｝
 * 
 * Term-level equivalent of {@link globalThis.Omit `globalThis.Omit`}.
 * 
 * Curried variant of {@link object_omit `object.omit`}.
 * 
 * See also:
 * - {@link object_omit `object.omit`}
 * - {@link object_pick.defer `object.pick.defer`}
 */
object_omit.defer = (
  function object_omit_defer(...k: props.any) 
    { return (object: object.any) => object_omit(object, ...k as []) }
) as {
  <
    const T extends object.any, 
    A extends keyof T,
    B extends globalThis.Exclude<keyof T, A>,
    C extends globalThis.Exclude<keyof T, A | B>,
    D extends globalThis.Exclude<keyof T, A | B | C>,
    E extends globalThis.Exclude<keyof T, A | B | C | D>,
    F extends globalThis.Exclude<keyof T, A | B | C | D | E>,
    G extends globalThis.Exclude<keyof T, A | B | C | D | E | F>,
    H extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G>,
    I extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H>,
    J extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H | I>,
    K extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H | I | J>
  >(...keys: [A, B, C, D, E, F, G, H, I, J, K]): (object: T) => object_omit<T, A | B | C | D | E | F | G | H | I | J | K>;
  <
    const T extends object.any, 
    B extends keyof T,
    C extends globalThis.Exclude<keyof T, B>,
    D extends globalThis.Exclude<keyof T, B | C>,
    E extends globalThis.Exclude<keyof T, B | C | D>,
    F extends globalThis.Exclude<keyof T, B | C | D | E>,
    G extends globalThis.Exclude<keyof T, B | C | D | E | F>,
    H extends globalThis.Exclude<keyof T, B | C | D | E | F | G>,
    I extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H>,
    J extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H | I>,
    K extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H | I | J>
  >(...keys: [B, C, D, E, F, G, H, I, J, K]): (object: T) => object_omit<T, B | C | D | E | F | G | H | I | J | K>;
  <
    const T extends object.any, 
    C extends keyof T,
    D extends globalThis.Exclude<keyof T, C>,
    E extends globalThis.Exclude<keyof T, C | D>,
    F extends globalThis.Exclude<keyof T, C | D | E>,
    G extends globalThis.Exclude<keyof T, C | D | E | F>,
    H extends globalThis.Exclude<keyof T, C | D | E | F | G>,
    I extends globalThis.Exclude<keyof T, C | D | E | F | G | H>,
    J extends globalThis.Exclude<keyof T, C | D | E | F | G | H | I>,
    K extends globalThis.Exclude<keyof T, C | D | E | F | G | H | I | J>
  >(...keys: [C, D, E, F, G, H, I, J, K]): (object: T) => object_omit<T, C | D | E | F | G | H | I | J | K>;
  <
    const T extends object.any, 
    D extends keyof T,
    E extends globalThis.Exclude<keyof T, D>,
    F extends globalThis.Exclude<keyof T, D | E>,
    G extends globalThis.Exclude<keyof T, D | E | F>,
    H extends globalThis.Exclude<keyof T, D | E | F | G>,
    I extends globalThis.Exclude<keyof T, D | E | F | G | H>,
    J extends globalThis.Exclude<keyof T, D | E | F | G | H | I>,
    K extends globalThis.Exclude<keyof T, D | E | F | G | H | I | J>
  >(...keys: [D, E, F, G, H, I, J, K]): (object: T) => object_omit<T, D | E | F | G | H | I | J | K>;
  <
    const T extends object.any, 
    E extends keyof T,
    F extends globalThis.Exclude<keyof T, E>,
    G extends globalThis.Exclude<keyof T, E | F>,
    H extends globalThis.Exclude<keyof T, E | F | G>,
    I extends globalThis.Exclude<keyof T, E | F | G | H>,
    J extends globalThis.Exclude<keyof T, E | F | G | H | I>,
    K extends globalThis.Exclude<keyof T, E | F | G | H | I | J>
  >(...keys: [E, F, G, H, I, J, K]): (object: T) => object_omit<T, E | F | G | H | I | J | K>;
  <
    const T extends object.any, 
    F extends keyof T,
    G extends globalThis.Exclude<keyof T, F>,
    H extends globalThis.Exclude<keyof T, F | G>,
    I extends globalThis.Exclude<keyof T, F | G | H>,
    J extends globalThis.Exclude<keyof T, F | G | H | I>,
    K extends globalThis.Exclude<keyof T, F | G | H | I | J>
  >(...keys: [F, G, H, I, J, K]): (object: T) => object_omit<T, F | G | H | I | J | K>;
  <
    const T extends object.any,
    G extends keyof T,
    H extends globalThis.Exclude<keyof T, G>,
    I extends globalThis.Exclude<keyof T, G | H>,
    J extends globalThis.Exclude<keyof T, G | H | I>,
    K extends globalThis.Exclude<keyof T, G | H | I | J>
  >(...keys: [G, H, I, J, K]): (object: T) => object_omit<T, G | H | I | J | K>;
  <
    const T extends object.any,
    H extends keyof T,
    I extends globalThis.Exclude<keyof T, H>,
    J extends globalThis.Exclude<keyof T, H | I>,
    K extends globalThis.Exclude<keyof T, H | I | J>
  >(...keys: [H, I, J, K]): (object: T) => object_omit<T, H | I | J | K>;
  <
    const T extends object.any, 
    I extends keyof T,
    J extends globalThis.Exclude<keyof T, I>,
    K extends globalThis.Exclude<keyof T, I | J>
  >(...keys: [I, J, K]): (object: T) => object_omit<T, I | J | K>;
  <
    const T extends object.any, 
    J extends keyof T,
    K extends globalThis.Exclude<J, keyof T>
  >(...keys: [J, K]): (object: T) => object_omit<T, J | K>;
  <
    const T extends object.any, 
    K extends keyof T
  >(k: K): (object: T) => object_omit<T, K>;
  <
    const T extends object.any,
    K extends keyof T
  >(...keys: [g?: K, h?: K, i?: K, j?: K, k?: K]): (object: T) => object_omit<T, K>;
}

export type object_omit<T, K extends keyof T> = never | object_pick<T, globalThis.Exclude<keyof T, K>>

/**
 * ## {@link object_omit `object.omit`}
 * ### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } , {@link jsdoc.preserves_reference ` 🧩‍ ` } ｝
 * 
 * **Note:** This variant has been optimized for autocompletion of property names.
 * 
 * Its behavior is modeled after how autocompletion for imports works, in that
 * picking a key is the same as removing it from the keys available. This is done 
 * so users are able to `tab + space` their way through the list of keys, by making
 * sure that `autocompletion[0]` always maps to a key that has not yet been marked
 * for omission.
 * 
 * See also:
 * - {@link object_omit.defer `object.omit.defer`}
 * - {@link object_pick `object.pick`}
 */
export function object_omit<
  const T extends object.any,
  B extends keyof T,
  C extends globalThis.Exclude<keyof T, B>,
  D extends globalThis.Exclude<keyof T, B | C>,
  E extends globalThis.Exclude<keyof T, B | C | D>,
  F extends globalThis.Exclude<keyof T, B | C | D | E>,
  G extends globalThis.Exclude<keyof T, B | C | D | E | F>,
  H extends globalThis.Exclude<keyof T, B | C | D | E | F | G>,
  I extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H>,
  J extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H | I>,
  K extends globalThis.Exclude<keyof T, B | C | D | E | F | G | H | I | J>
>(object: T, ...k: [B, C, D, E, F, G, H, I, J, K]): object_omit<T, B | C | D | E | F | G | H | I | J | K>;
export function object_omit<
  const T extends object.any,
  C extends keyof T,
  D extends globalThis.Exclude<keyof T, C>,
  E extends globalThis.Exclude<keyof T, C | D>,
  F extends globalThis.Exclude<keyof T, C | D | E>,
  G extends globalThis.Exclude<keyof T, C | D | E | F>,
  H extends globalThis.Exclude<keyof T, C | D | E | F | G>,
  I extends globalThis.Exclude<keyof T, C | D | E | F | G | H>,
  J extends globalThis.Exclude<keyof T, C | D | E | F | G | H | I>,
  K extends globalThis.Exclude<keyof T, C | D | E | F | G | H | I | J>
>(object: T, ...k: [C, D, E, F, G, H, I, J, K]): object_omit<T, C | D | E | F | G | H | I | J | K>;
export function object_omit<
  const T extends object.any,
  D extends keyof T,
  E extends globalThis.Exclude<keyof T, D>,
  F extends globalThis.Exclude<keyof T, D | E>,
  G extends globalThis.Exclude<keyof T, D | E | F>,
  H extends globalThis.Exclude<keyof T, D | E | F | G>,
  I extends globalThis.Exclude<keyof T, D | E | F | G | H>,
  J extends globalThis.Exclude<keyof T, D | E | F | G | H | I>,
  K extends globalThis.Exclude<keyof T, D | E | F | G | H | I | J>
>(object: T, ...k: [D, E, F, G, H, I, J, K]): object_omit<T, D | E | F | G | H | I | J | K>;
export function object_omit<
  const T extends object.any,
  E extends keyof T,
  F extends globalThis.Exclude<keyof T, E>,
  G extends globalThis.Exclude<keyof T, E | F>,
  H extends globalThis.Exclude<keyof T, E | F | G>,
  I extends globalThis.Exclude<keyof T, E | F | G | H>,
  J extends globalThis.Exclude<keyof T, E | F | G | H | I>,
  K extends globalThis.Exclude<keyof T, E | F | G | H | I | J>
>(object: T, ...k: [E, F, G, H, I, J, K]): object_omit<T, E | F | G | H | I | J | K>;
export function object_omit<
  const T extends object.any,
  F extends keyof T,
  G extends globalThis.Exclude<keyof T, F>,
  H extends globalThis.Exclude<keyof T, F | G>,
  I extends globalThis.Exclude<keyof T, F | G | H>,
  J extends globalThis.Exclude<keyof T, F | G | H | I>,
  K extends globalThis.Exclude<keyof T, F | G | H | I | J>
>(object: T, ...k: [F, G, H, I, J, K]): object_omit<T, F | G | H | I | J | K>;
export function object_omit<
  const T extends object.any,
  G extends keyof T,
  H extends globalThis.Exclude<keyof T, G>,
  I extends globalThis.Exclude<keyof T, G | H>,
  J extends globalThis.Exclude<keyof T, G | H | I>,
  K extends globalThis.Exclude<keyof T, G | H | I | J>
>(object: T, ...k: [G, H, I, J, K]): object_omit<T, G | H | I | J | K>;
export function object_omit<
  const T extends object.any,
  H extends keyof T,
  I extends globalThis.Exclude<keyof T, H>,
  J extends globalThis.Exclude<keyof T, H | I>,
  K extends globalThis.Exclude<keyof T, H | I | J>
>(object: T, ...k: [H, I, J, K]): object_omit<T, H | I | J | K>;
export function object_omit<
  const T extends object.any, 
  I extends keyof T,
  J extends globalThis.Exclude<keyof T, I>,
  K extends globalThis.Exclude<keyof T, I | J>
>(object: T, ...k: [I, J, K]): object_omit<T, I | J | K>;
export function object_omit<
  const T extends object.any, 
  J extends keyof T,
  K extends globalThis.Exclude<keyof T, J>
>(object: T, ...k: [J, K]): object_omit<T, J | K>;
export function object_omit<
  const T extends object.any,
  K extends keyof T
>(object: T, ...k: [K]): object_omit<T, K>;
export function object_omit<
  const T extends object.any,
>(object: T, ...k: []): object_omit<T, never>
export function object_omit<
  const T extends object.any,
  A extends keyof T,
  B extends globalThis.Exclude<keyof T, A>,
  C extends globalThis.Exclude<keyof T, A | B>,
  D extends globalThis.Exclude<keyof T, A | B | C>,
  E extends globalThis.Exclude<keyof T, A | B | C | D>,
  F extends globalThis.Exclude<keyof T, A | B | C | D | E>,
  G extends globalThis.Exclude<keyof T, A | B | C | D | E | F>,
  H extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G>,
  I extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H>,
  J extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H | I>,
  K extends globalThis.Exclude<keyof T, A | B | C | D | E | F | G | H | I | J>
>(object: T, ...keys: [A, B, C, D, E, F, G, H, I, J, K]): object_omit<T, A | B | C | D | E | F | G | H | I | J | K>;
export function object_omit<const T extends object.any>(object: T, ...key: key.any[]): globalThis.Partial<object.any>
/// impl.
export function object_omit(object: object.any, ...key: key.any[]) {
  /** 
   * **Optimization:** If the user picked _zero keys_, don't create a new object.
   * Return `object` to preserve the reference and keep our memory footprint small.
   */
  if (key.length === 0) return object
  else {
    let out: { [x: string]: unknown } = {}
    const discard = new globalThis.Set(key)
    for (const k in object)
      if (discard.has(k)) continue
      else out[k] = object[k]
    return out
  }
}

/**
 * ## {@link object_isKeyOf `object.isKeyOf`} 
 * ### ｛ {@link jsdoc.guard ` 🦺 ` } ｝
 */
export function object_isKeyOf<K extends key.any, const T extends object>(key: K, object: T): key is object_isKeyOf<T, K>
export function object_isKeyOf<const T extends object, K extends key.any>(object: T): (key: K) => key is object_isKeyOf<T, K>
/// impl.
export function object_isKeyOf(
  ...args: 
    | [key: key.any, object: object]
    | [object: object]
) {
  if(args.length === 1) return (key: key.any) => key in args[0]
  else {
    const [key, object] = args
    return  key in object
  }
}

export type object_isKeyOf<T, K extends key.any> = never | (K & keyof T)

/** 
 * ## {@link object_isNonEmpty `object.isNonEmpty`} 
 * ### ｛ {@link jsdoc.empty ` 🕳️‍ ` } , {@link jsdoc.guard ` 🦺 ` } ｝
 */
export const object_isNonEmpty
  : some.predicate<object> 
  = (object) => Object_keys(object).length > 0

/** 
 * ## {@link object_invert `object.invert`} 
 * ### ｛ {@link jsdoc.mapping ` 🌈‍ `} ｝
 */
export function object_invert<const T extends { [x: number]: key.any }>(object: T): object_invert<T>
/// impl.
export function object_invert<const T extends object_invertible>(object: T) {
  let out: { [x: key.nonnumber]: string } = {}
  for (const k of Object_keys(object)) out[object[k]] = k
  return out
}

export type object_invert<T extends object_invertible> 
  = T extends readonly key.any[] 
  ? never | { -readonly [K in Extract<keyof T, `${number}`> as T[K]]: K }
  : never | { -readonly [K in keyof T as T[K]]: K }
  ;

/** 
 * ## {@link object_isComposite `object.isComposite`} 
 * ### ｛ {@link jsdoc.guard ` 🦺 ` } ｝
 * 
 * Targets any non-primitive JavaScript object
 * 
 * See also:
 * - {@link object_is `object.is`}
 * - {@link object_isRecord `object.isRecord`}
 */
export function object_isComposite<T>(u: unknown): u is { [x: string]: T } 
  { return typeof u === "object" && u !== null }

/**
 * ## {@link object_isRecord `object.isRecord`} 
 * ### ｛ {@link jsdoc.guard ` 🦺 ` } ｝
 *
 * Targets any non-array, non-primitive JavaScript object
 * 
 * See also:
 * - {@link object_is `object.is`}
 * - {@link object_isComposite `object.isComposite`}
 */
export function object_isRecord(u: unknown): u is { [x: string]: unknown } 
  { return object_isComposite(u) && !isArray(u) }

/** 
 * ## {@link object_is `object.is`} 
 * ### ｛ {@link jsdoc.guard ` 🦺 ` } ｝
 * 
 * See also:
 * - {@link object_isComposite `object.isComposite`}
 * - {@link object_isRecord `object.isRecord`}
 */
export const object_is
  : (u: unknown) => u is object
  = object_isRecord

/** 
 * ## {@link object_let `object.let`} 
 * ### ｛ {@link jsdoc.constructor ` 🏗 `} ｝
 */
export const object_let
  : <const T extends object>(object: T) => { -readonly [K in keyof T]: T[K] }
  = fn.identity

/** 
 * ## {@link object_const `object.const`} 
 * ### ｛ {@link jsdoc.constructor ` 🏗 `} ｝
 */
export const object_const
  : <const T extends object>(object: T) => T
  = fn.identity

/** 
 * ## {@link object_fromKeys `object.fromKeys`} 
 * ### ｛ {@link jsdoc.constructor ` 🏗 `} ｝
 */
export function object_fromKeys<const KS extends readonly prop.any[]>(keys: KS): object_fromKeys<KS>
export function object_fromKeys<const KS extends readonly prop.any[]>(...keys: KS): object_fromKeys<KS>
export function object_fromKeys<const KS extends readonly key.any[]>(keys: KS): object_fromKeys<KS>
export function object_fromKeys<const KS extends readonly key.any[]>(...keys: KS): object_fromKeys<KS>
export function object_fromKeys<const KS extends props.any>(...args: (KS) | [KS]) 
  /// impl.
  { return args.flat(1).reduce((acc, key) => (acc[key] = key, acc), {} as object.any) }

export type object_fromKeys<KS extends readonly (key.any)[]> = never | { [K in [...KS][number]]: K }

/** 
 * ## {@link object_fromArray `object.fromArray`} 
 * ### ｛ {@link jsdoc.constructor ` 🏗 `} ｝
 */
export function object_fromArray<const T extends array.any>(xs: T): object_fromArray<T>
/// impl.
export function object_fromArray<const T extends array.any>(xs: T) {
  const out: any.enumerable = {}
  for (const [ix, v] of xs.entries()) out[ix] = v
  return out
}
export type object_fromArray<T extends array.any> = never | to.vector<T>

/** 
 * ## {@link object_find `object.find`} 
 * ### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } ｝
 */
export function object_find<S, T extends S>(guard: (src: S) => src is T): 
  (object: object.of<S>) => T | undefined
export function object_find<T>(pred: some.predicate<T>): 
  (object: object.of<T>) => T | undefined
export function object_find<T>(pred: some.predicate<T>) 
  /// impl.
  { return (object: object.of<T>) => Object_values(object).find(pred) }

/** 
 * ## {@link object_includes `object.includes`} 
 * ### ｛ {@link jsdoc.combining ` 🪢 `} ｝
 */
export function object_includes<S>(match: S): 
  <T extends object.any>(object: T) => boolean
export function object_includes<S>(match: S) 
  /// impl.
  { return <T extends object.any>(object: T) => Object_values(object).includes(match) }

export declare namespace object_filter {
  export type cast<T, Invariant> 
    = globalThis.Extract<T, Invariant> extends infer U 
      ? [U] extends [never] ? Invariant 
      : U : never
  export type allSatisfy<T, Bound> = (
    Bound extends Bound ? 
    (T extends T & Bound ? T : never) extends infer Out ? Out : never : never) extends 
    infer Out ? [T, Out] extends [Out, T] ? true : false 
    : never
  export type onlySomeSatisfy<T, Bound> 
    = allSatisfy<T, Bound> extends true ? false
    : [Bound extends Bound ? (T extends Bound ? true : never) : never] extends [never] ? false 
    : true
  export type mightSatisfy<T, Bound> 
    = [T] extends [Bound] ? never 
    : [T extends T ? (Bound extends T ? true : never) : never] extends [never] ? false 
    : true
  export type keys<T, Bound> = never | 
    { [K in Universal.key<keyof T> as K extends Bound ? K : never]: Universal.get<T, K> }
  export type valuesSatisfy<T, Bound> = never | 
    { -readonly [K in keyof T as allSatisfy<T[K], Bound> extends true ? K : never]: T[K] }
  export type valuesPartiallySatisfy<T, Bound> = never |
    { -readonly [K in keyof T as onlySomeSatisfy<T[K], Bound> extends true ? K : never]+?: T[K] }
  export type valuesMightSatisfy<T, Bound> = never |
    { -readonly [K in keyof T as mightSatisfy<T[K], Bound> extends true ? K : never]+? : cast<T[K], Bound> }
}

export type object_filter<t, match> = evaluate<
  & object_filter.valuesSatisfy<t, match>
  & object_filter.valuesPartiallySatisfy<t, match>
  & object_filter.valuesMightSatisfy<t, match>
>

/**
 * ## {@link object_filter `object.filter`}
 * ### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } , {@link jsdoc.preserves_reference ` 🧩‍ ` } ｝
 * 
 * If you pass the global {@link BooleanConstructor `Boolean`} constructor,
 * {@link object_filter `object.filter`} will do the right thing™️ and filter `null`
 * and `undefined` from the array _without_ the coercive bullshit that happens if you
 * were to pass `Boolean` to (for example) {@link Array.prototype.filter `Array.prototype.filter`}.
 * 
 * It also does a pretty decent job inferring the type of the resulting object.
 * 
 * See also: 
 * - {@link object_filter.defer `object.filter.defer`}
 */
export function object_filter<A, B extends A, const T extends { [x: string]: A }>
  (object: T, guard: (a: A) => a is B): object_filter<T, B>
export function object_filter<A extends valueOf<T>, const T extends { [x: number]: any }>
  (object: T, predicate: (a: A) => boolean): object_filter<T, A>
/// impl.
export function object_filter<A extends valueOf<T>, const T extends {}>(
  object: T, predicate: some.predicate<A>
) {
  const keep = Object_entries(object).filter(([, v]) => 
    predicate === globalThis.Boolean 
    ? v != null
    : predicate(v as never)
  )
  /**
   * **Optimization:**
   * If applying the filter did not remove any keys, return the original object to
   * 🌈 preserve the reference ✨
   */
  if (Object_keys(object).length === keep.length) return object
  else return Object_fromEntries(keep)
}

/** 
 * ## {@link object_filter.defer `object.filter.defer`} 
 * ### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } ｝
 * 
 * Curried variant of {@link object_filter `object.filter`}
 * 
 * See also: 
 * - {@link object_filter `object.filter`}
 */
object_filter.defer = (
  function object_filter_defer(predicate: (u: any) => boolean) 
    { return (object: object.any) => object_filter(object, predicate) }
) as {
  (nullish: BooleanConstructor): <const T extends object.any>(object: T) => { -readonly [K in keyof T]-?: globalThis.NonNullable<T[K]> }
  <T, U extends T>(guard: { (v: T): v is U; (v: any): v is U }): <const S extends object.any>(object: S) => object_filter<S, U>
  <const T extends object.any>(predicate: (s: T[keyof T]) => boolean): (object: T) => { -readonly [K in keyof T]: T[K] }
}

/** 
 * ## {@link object_emptyOf `object.emptyOf`} 
 * ### ｛ {@link jsdoc.constructor ` 🏗 `} , {@link jsdoc.empty ` 🕳‍ `} ｝
 */
export const object_emptyOf
  : <T extends object = never>() => T 
  = () => Object_create(Object_getPrototypeOf({}))


/**
 * ## {@link object_complement `object.complement`}
 * ### ｛ {@link jsdoc.mapping ` 🌈‍ `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 */
export function object_complement<const T extends object.any>(object: T): 
  <const Part extends { [k in keyof T]?: unknown }>(part: Part) => object_complement<T, Part>
export function object_complement(object: { [x: string]: unknown }) /// impl.
  { return (part: { [x: string]: unknown }) => object_omit(object, ...Object_keys(part)) }

export type object_complement<T, Negative> 
  = object_omitLax<T, Negative extends Negative ? keyof Negative : never>

/** 
 * ## {@link object_values `object.values`}
 * ### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 */
export const object_values
  : <const T extends object.any>(object: T) => array.of<T[keyof T]> 
  = Object_values

/** 
 * ## {@link object_uppercase `object.uppercase`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_uppercase<const T extends object.any>(object: T): 
  { -readonly [K in keyof T as key.toUpper<K>]: T[K] }
export function object_uppercase<const T extends object.any>(object: T) 
  /// impl.
  { return object_mapKeys(key.toUpper)(object) }

/** 
 * ## {@link object_uppercase.values `object.uppercase.values`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
object_uppercase.values = (
  function object_uppercaseValues(object: { [x: key.any]: key.any }) { return map(object, key.toUpper) }
) as {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.toUpper<T[K]> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.toUpper<number & T[K]> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.toUpper<T[K]> }
}

export type object_uppercase<T> = never | { -readonly [K in keyof T as key.toUpper<K>]: T[K] }
export declare namespace object_uppercase {
  type values<T extends { [x: key.any]: key.any }> = never | { -readonly [K in keyof T]: key.toUpper<T[K]> }
}

/** 
 * ## {@link object_lowercase `object.lowercase`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_lowercase<const T extends { [x: number]: unknown }>(object: T): object_lowercase<T>
export function object_lowercase<const T extends { [x: string]: unknown }>(object: T): object_lowercase<T>
export function object_lowercase<const T extends { [x: key.any]: unknown }>(object: T): object_lowercase<T>
export function object_lowercase(object: { [x: key.any]: unknown }) 
  /// impl.
  { return object_mapKeys(key.toLower)(object) }

/** 
 * ## {@link object_lowercase.values `object.lowercase.values`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
object_lowercase.values = (
  function object_lowercase_values(object: { [x: key.any]: key.any }) { return map(object, key.toLower) }
) as {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.toLower<T[K]> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.toLower<number & T[K]> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.toLower<T[K]> }
}

export type object_lowercase<T> = never | ([T] extends [readonly unknown[]] ? T : 
  { -readonly [K in keyof T as key.toLower<K>]: T[K] })
export declare namespace object_lowercase {
  type values<T extends { [x: key.any]: key.any }> = never | { -readonly [K in keyof T]: key.toLower<T[K]> }
}

/** 
 * ## {@link object_capitalize `object.capitalize`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_capitalize<const T extends { [x: string]: key.any }>(object: T): 
  { -readonly [K in keyof T as key.capitalize<K>]: T[K] }
export function object_capitalize<const T extends { [x: number]: key.any }>(object: T): 
  { -readonly [K in keyof T as key.capitalize<K>]: T[K] }
export function object_capitalize<const T extends { [x: key.any]: key.any }>(object: T): 
  { -readonly [K in keyof T as key.capitalize<K>]: T[K] }
export function object_capitalize(object: object.any) 
  /// impl.
  { return object_mapKeys(key.capitalize)(object) }

/**
 * ## {@link object_capitalize.values `object.capitalize.values`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * @example
 * const ex_01 = object.capitalize.values({ abc: "abc", def: "def", ghi: "ghi" })
 * //       ^? const ex_01: { abc: "Abc", def: "Def", ghi: "Ghi" }
 * console.log(ex_01) // => { abc: "Abc", def: "Def", ghi: "Ghi" }
 *
 * const ex_02 = object.capitalize.values(["abc", "def", "ghi"])
 * //       ^? const ex_02: ["Abc", "Def", "Ghi"]
 * console.log(ex_02) // => ["Abc", "Def", "Ghi"]
 */
object_capitalize.values = (
  function object_capitalize_values(object: { [x: key.any]: key.any }) { return map(object, key.capitalize) }
) as {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.capitalize<T[K]> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.capitalize<number & T[K]> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.capitalize<number & T[K]> }
}

export type object_capitalize<T> = never | { -readonly [K in keyof T as key.capitalize<K>]: T[K] }
export declare namespace object_capitalize {
  type values<T extends { [x: key.any]: key.any }> = never | { -readonly [K in keyof T]: key.capitalize<T[K]> }
}

/** 
 * ## {@link object_uncapitalize `object.uncapitalize`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * @example
 *  import { object } from "@traversable/data"
 * 
 *  const ex_01 = object.uncapitalize({ Abc: "abc", DEF: "def", ghi: "ghi" })
 *  //       ^? const ex_01: { abc: "abc", dEF: "def", ghi: "ghi" }
 *  console.log(ex_01) // => { abc: "abc", dEF: "def", ghi: "ghi" }
 */
export function object_uncapitalize<const T extends object.any>(object: T): 
  { -readonly [K in keyof T as key.uncapitalize<K>]: T[K] }
export function object_uncapitalize<const T extends object.any>(object: T) 
  /// impl.
  { return object_mapKeys(key.uncapitalize)(object) }

/** 
 * ## {@link object_uncapitalize.values `object.uncapitalize.values`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * @example
 *   const ex_01 = object.uncapitalize.values({ abc: "Abc", def: "Def", ghi: "Ghi" })
 *   //       ^? const ex_01: { abc: "abc", def: "def", ghi: "ghi" }
 *   console.log(ex_01) // => { abc: "abc", def: "def", ghi: "ghi" }
 *
 *   const ex_02 = object.uncapitalize.values(["Abc", "Def", "Ghi"])
 *   //       ^? const ex_02: ["abc", "def", "ghi"]
 *   console.log(ex_02) // => ["abc", "def", "ghi"]
 */
object_uncapitalize.values = (
  function object_uncapitalize_values(object: { [x: key.any]: key.any }) 
    /// impl.
    { return map(object, key.uncapitalize) }
) as {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.uncapitalize<T[K]> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.uncapitalize<number & T[K]> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.uncapitalize<T[K]> }
}

export type object_uncapitalize<T> = never | { -readonly [K in keyof T as key.uncapitalize<K>]: T[K] }
export declare namespace object_uncapitalize {
  type values<T extends { [x: key.any]: key.any }> = never | { -readonly [K in keyof T]: key.uncapitalize<T[K]> }
}

/** 
 * ## {@link object_camel `object.camel`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * Converts an object's __keys__ to camel-case.
 * 
 * If you need to convert the object's __values__ to camel-case, use
 * {@link camel.values `object.camel.values`}.
 */
export function object_camel<const T extends object.any, _ extends string>(object: T, delimiter: _): 
  { -readonly [K in keyof T as key.camel<K, _>]: T[K] }
export function object_camel<const T extends object.any>(object: T): 
  { -readonly [K in keyof T as key.camel<K>]: T[K] }
export function object_camel(object: object.any, _ = "_") 
  /// impl.
  { return object_mapKeys((k) => key.camel(k, _))(object) }
export type object_camel<T, _ extends string = "_"> = never | { -readonly [K in keyof T as key.camel<K, _>]: T[K] }

/** 
 * ## {@link object_camel.values `object.camelValues`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __values__ to camel-case.
 * 
 * If you need to convert the object's __keys__ to camel-case, use
 * {@link object_camel `object.camel`}.
 */
object_camel.values = (
  function(object: { [x: string]: key.any }, _ = "_") { return map(object, (v) => key.camel(v, _)) }
) as {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.camel<T[K]> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.camel<T[K] & number> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.camel<T[K]> }
  <const T extends { [x: string]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.camel<T[K], _> }
  <const T extends { [x: number]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.camel<T[K] & number, _> }
  <const T extends { [x: key.any]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.camel<T[K], _> }
  <const T extends { [x: key.any]: key.any }, _ extends string>(object: T, delimiter?: _): { -readonly [K in keyof T]: key.camel<T[K], _> }
}

/**
 * ## {@link object_pascal `object.pascal`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __keys__ to Pascal-case.
 * 
 * If you need to convert the object's __values__ to Pascal-case, use
 * {@link object_pascal.values `object.pascal.values`}.
 */
export function object_pascal
  <const T extends object.any, _ extends string>(object: T, delimiter: _): 
  { -readonly [K in keyof T as key.pascal<K, _>]: T[K] }
export function object_pascal
  <const T extends object.any>(object: T): 
  { -readonly [K in keyof T as key.pascal<K>]: T[K] }
export function object_pascal
  <const T extends object.any, _ extends string>(object: T, delimiter?: _): 
  { -readonly [K in keyof T as key.pascal<K>]: T[K] }
export function object_pascal(object: object.any, _ = "_") 
  /// impl.
  { return object_mapKeys((k) => key.pascal(k, _))(object) }

export type object_pascal<T, _ extends string = "_"> = never | { -readonly [K in keyof T as key.pascal<K, _>]: T[K] }

/** 
 * ## {@link object_pascal.values `object.pascal.values`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __values__ to Pascal-case.
 * 
 * If you need to convert the object's __keys__ to Pascal-case, use
 * {@link object_pascal `object.pascal`}.
 */
object_pascal.values = (
  function(object: { [x: string]: key.any }, _ = "_") 
    { return map(object, (v) => key.pascal(v, _)) }
) as {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.pascal<T[K]> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.pascal<T[K] & number> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.pascal<T[K]> }
  <const T extends { [x: string]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.pascal<T[K], _> }
  <const T extends { [x: number]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.pascal<T[K] & number, _> }
  <const T extends { [x: key.any]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.pascal<T[K], _> }
  <const T extends { [x: key.any]: key.any }, _ extends string>(object: T, delimiter?: _): { -readonly [K in keyof T]: key.pascal<T[K], _> }
}

/** 
 * ## {@link object_snake `object.snake`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __keys__ to snake-case.
 * 
 * If you need to convert the object's __values__ to snake-case, use
 * {@link object_snake.values `object.snake.values`}.
 */
export function object_snake
  <const T extends object.any, _ extends string>(object: T, delimiter: _): 
  { -readonly [K in keyof T as key.snake<K, _>]: T[K] }
export function object_snake
  <const T extends object.any>(object: T): 
  { -readonly [K in keyof T as key.snake<K>]: T[K] }
export function object_snake
  <const T extends object.any, _ extends string>(object: T, delimiter?: _): 
  { -readonly [K in keyof T as key.snake<K, _>]: T[K] }
// impl.
export function object_snake(object: object.any, _ = "_") 
  { return object_mapKeys((k) => key.snake(k, _))(object) }

export type object_snake<T, _ extends string = "_"> = never | 
  { -readonly [K in keyof T as key.snake<K, _>]: T[K] }


/** 
 * ## {@link object_snake.values `object.snake.values`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __values__ to snake-case.
 * 
 * If you need to convert the object's __keys__ to snake-case, use
 * {@link object_snake `object.snake`}.
 */
object_snake.values = (
  function(object: { [x: string]: key.any }, _ = "_") 
    { return map(object, (v) => key.snake(v, _)) }
) as {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.snake<T[K]> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.snake<T[K] & number> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.snake<T[K]> }
  <const T extends { [x: string]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.snake<T[K], _> }
  <const T extends { [x: number]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.snake<T[K] & number, _> }
  <const T extends { [x: key.any]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.snake<T[K], _> }
}
export declare namespace object_snake {
  export type values<T extends { [x: key.any]: key.any }, _ extends string = "_"> = never | { -readonly [K in keyof T]: key.snake<T[K], _> }
}

/** 
 * ## {@link object_kebab `object.kebab`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __keys__ to kebab-case.
 * 
 * If you need to convert the object's __values__ to kebab-case, use
 * {@link object_kebab.values `object.kebab.values`}.
 */
export function object_kebab<const T extends object.any>(object: T): { -readonly [K in keyof T as key.kebab<K>]: T[K] }
/// impl.
export function object_kebab<const T extends object.any>(object: T) 
  { return object_mapKeys(key.kebab)(object) }
export type object_kebab<T> = never | { -readonly [K in keyof T as key.kebab<K>]: T[K] }

/** 
 * ## {@link object_kebab.values `object.kebab.values`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __values__ to kebab-case.
 * 
 * If you need to convert the object's __keys__ to kebab-case, use
 * {@link object_kebab `object.kebab`}.
 */
object_kebab.values = (
  function(object: { [x: string]: key.any }) 
    { return map(object, key.kebab) }
) as {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.kebab<T[K]> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.kebab<T[K] & number> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.kebab<T[K]> }
}
export declare namespace object_kebab {
  type values<T extends { [x: key.any]: key.any }> = never | { -readonly [K in keyof T]: key.kebab<T[K]> }
}

/** 
 * ## {@link object_titlecase `object.titlecase`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __keys__ to title-case.
 * 
 * If you need to convert the object's __values__ to title-case, use
 * {@link object_titlecase.values `object.titlecase.values`}.
 */
export function object_titlecase<const T extends object.any>(object: T): { -readonly [K in keyof T as key.titlecase<K>]: T[K] }
export function object_titlecase<
  const T extends object.any, 
  Del extends string, 
  Sep extends string
>(
  object: T, 
  options: key.titlecase.Options<Del, Sep>
): { -readonly [K in keyof T as key.titlecase<K, Del, Sep>]: T[K] }
export function object_titlecase<
  const T extends object.any, 
  Del extends string, 
  Sep extends string
>(
  object: T, 
  options?: key.titlecase.Options<Del, Sep>
): { -readonly [K in keyof T as key.titlecase<K, Del, Sep>]: T[K] }
export function object_titlecase
  (object: object.any, options: key.titlecase.Options = key.titlecase.defaults) 
  /// impl.
  { return object_mapKeys((k) => key.titlecase(k, options))(object) }

export type object_titlecase<
  T, 
  Del extends string = " ", 
  Sep extends string = " "
> = never | { -readonly [K in keyof T as key.titlecase<K, Del, Sep>]: T[K] }

/** 
 * ## {@link object_titlecase.values `object.titlecase.values`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __values__ to title-case.
 * 
 * If you need to convert the object's __keys__ to title-case, use
 * {@link object_titlecase `object.titlecase`}.
 */
object_titlecase.values = (
  function object_titlecase_values
    (object: { [x: string]: key.any }, options: key.titlecase.Options = key.titlecase.defaults) 
    /// impl.
    { return map(object, (v) => key.titlecase(v, options)) }
) as 
{
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.titlecase<T[K]> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.titlecase<T[K] & number> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.titlecase<T[K]> }
  <
    const T extends { [x: string]: key.any }, 
    Del extends string,
    Sep extends string,
  >(
    object: T, 
    options: key.titlecase.Options<Del, Sep>
  ): { -readonly [K in keyof T]: key.titlecase<T[K], Del, Sep> }
  <
    const T extends { [x: number]: key.any }, 
    Del extends string,
    Sep extends string,
  >(
    object: T, 
    options: key.titlecase.Options<Del, Sep>
  ): { -readonly [K in keyof T]: key.titlecase<T[K] & number, Del, Sep> }
  <
    const T extends { [x: key.any]: key.any }, 
    const Del extends string,
    const Sep extends string,
  >(
    object: T, 
    options: key.titlecase.Options<Del, Sep>
  ): { -readonly [K in keyof T]: key.titlecase<T[K], Del, Sep> }
}

export declare namespace object_titlecase {
  type values<
    T extends { [x: key.any]: key.any },
    Delimiter extends string = never,
    Separator extends string = never
  > = never | { 
    -readonly [K in keyof T]
    : key.titlecase<
        T[K], 
        [Delimiter] extends [never] ? " " : Delimiter,
        [Separator] extends [never] ? " " : Separator
      > 
  }
}

/** 
 * ## {@link object_prefix `object.prefix`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_prefix<P extends prop.any>(add: P): 
  <const T extends object.any>(object: T) 
    => { -readonly [K in keyof T as key.prefix<K, P>]: T[K] }
/// impl.
export function object_prefix(add: prop.any) 
  { return (object: object.any) => object_mapKeys(key.prefix(add))(object) }

/** 
 * ## {@link object_prefix.values `object.prefix.values`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
object_prefix.values = (
  function object_prefix_values(add: prop.any) 
    { return (object: { [x: key.any]: key.any }) => map(object, key.prefix(add)) }
) as never as {
  <P extends prop.any>(add: P): {
    <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.prefix<T[K], P> }
    <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.prefix<number & T[K], P> }
    <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.prefix<T[K], P> }
  }
}

export type object_prefix<T, P extends prop.any> = never | { -readonly [K in keyof T as key.prefix<K, P>]: T[K] }
export declare namespace object_prefix {
  type values<T extends { [x: key.any]: key.any }, P extends prop.any> = never | { -readonly [K in keyof T]: key.prefix<T[K], P> }
}

/** 
 * ## {@link object_postfix `object.postfix`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * See also:
 * - {@link object_postfix.values `object.postfix.values`}
 */
export function object_postfix<P extends prop.any>(add: P): 
  <const T extends object.any>(object: T) 
    => { -readonly [K in keyof T as key.postfix<K, P>]: T[K] }
export function object_postfix(add: prop.any) 
  /// impl.
  { return (object: object.any) => object_mapKeys(key.postfix(add))(object) }

/** 
 * ## {@link object_postfix.values `object.postfixValues`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * See also:
 * - {@link object_postfix `object.postfix`}
 */
object_postfix.values = (
  function object_postfix_values(add: prop.any) 
    /// impl
    { return (object: { [x: key.any]: key.any }) => map(object, key.postfix(add)) }
) as {
  <P extends prop.any>(add: P): {
    <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.postfix<T[K], P> }
     <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.postfix<number & T[K], P> }
     <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.postfix<T[K], P> }
  }
}

export type object_postfix<T, P extends prop.any> = never | { -readonly [K in keyof T as key.postfix<K, P>]: T[K] }
export declare namespace object_postfix {
  type values<T extends { [x: key.any]: key.any }, P extends prop.any> = never | { -readonly [K in keyof T]: key.postfix<T[K], P> }
}

/** 
 * ## {@link object_unprefix `object.unprefix`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_unprefix<Rm extends prop.any>(rm: Rm): 
  <const T extends object.any>(object: T) 
    => { -readonly [K in keyof T as key.unprefix<K, Rm>]: T[K] }
export function object_unprefix(rm: prop.any) /// impl.
  { return (object: object.any) => object_mapKeys(key.unprefix(rm))(object) }

/**
 * ## {@link object_unprefix.values `object.unprefix.values`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
object_unprefix.values = (
  function object_unprefix_values(add: prop.any) 
    { return (object: { [x: key.any]: key.any }) => map(object, key.unprefix(add)) }
) as {
  <P extends prop.any>(add: P): {
    <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.unprefix<T[K], P> }
    <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.unprefix<number & T[K], P> }
    <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.unprefix<T[K], P> }
  }
}

export type object_unprefix<T, Rm extends prop.any> = never | { -readonly [K in keyof T as key.unprefix<K, Rm>]: T[K] }
export declare namespace object_unprefix {
  type values<T extends { [x: key.any]: key.any }, P extends prop.any> = never | { -readonly [K in keyof T]: key.unprefix<T[K], P> }
}

/** 
 * ## {@link object_unpostfix `object.unpostfix`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_unpostfix<Rm extends prop.any>(rm: Rm): 
  <const T extends object.any>(object: T) 
    => { -readonly [K in keyof T as key.unpostfix<K, Rm>]: T[K] }
/// impl.
export function object_unpostfix(rm: prop.any) 
  { return (object: object.any) => object_mapKeys(key.unpostfix(rm))(object) }

/** 
 * ## {@link object_unpostfixValues `object.unpostfixValues`}
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
object_unpostfix.values = (
  function object_unpostfix_values(add: prop.any) /// impl.
    { return (object: { [x: key.any]: key.any }) => map(object, key.unpostfix(add)) }
) as {
  <P extends prop.any>(add: P): {
    <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.unpostfix<T[K], P> }
    <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.unpostfix<number & T[K], P> }
    <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.unpostfix<T[K], P> }
  }
}

export type object_unpostfix<T, Rm extends prop.any> = never | 
  { -readonly [K in keyof T as key.unpostfix<K, Rm>]: T[K] }

export declare namespace object_unpostfix {
  type values<T extends { [x: key.any]: key.any }, P extends prop.any> = never | 
    { -readonly [K in keyof T]: key.unpostfix<T[K], P> }
}

/** 
 * ## {@link object_stringifyValues `object.stringifyValues`}
 * ### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 */
export function object_stringifyValues<const T extends object.of<any.showable>>(object: T): { -readonly [K in keyof T]: string }
/// impl.
export function object_stringifyValues<const T extends object.of<any.showable>>(object: T) { return map(toString)(object) }

/** 
 * ## {@link object_intersect `object.intersect`} 
 * ### ｛ {@link jsdoc.combining ` 🪢 `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 * 
 * Spread two objects together. The output type is the intersection of the objects.
 * 
 * See also:
 * - {@link object_intersect.defer `object.intersect.defer`}
 */
export function object_intersect
  <const L extends object.any, const R extends object.any>
  (left: L, right: R): mutable<L> & mutable<R> 
export function object_intersect
  <const L extends object.any, const R extends object.any>
  (left: L, right: R): L & R 
  { return { ...left, ...right } }

/** 
 * ## {@link object_intersect.defer `object.intersect.defer`} 
 * ### ｛ {@link jsdoc.combining ` 🪢 `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 * 
 * Curried variant of {@link object_intersect `object.intersect`}
 * 
 * See also:
 * - {@link object_intersect `object.intersect`}
 */
object_intersect.defer = 
  <const S extends object.any>(snd: S) => 
  <const F extends object.any>(fst: F) => object_intersect(fst, snd)

  
/**  
 * ## {@link object_fromEntries `object.fromEntries`}
 * ### ｛ {@link jsdoc.constructor ` 🏗️ `} ｝
 */
export const object_fromEntries: {
  <const T extends readonly [string, unknown]>(entries: readonly T[]): object_fromEntries<T>
} = Object_fromEntries
// export declare function object_fromEntries<const T extends readonly [string, unknown]>(entries: readonly T[]): { [E in T as E[0]]: E[1] }
// export function object_fromEntries<V, const T extends readonly (readonly [number, V])[]>(entries: T): object_fromEntries<T>
// export function object_fromEntries<V, const T extends readonly (readonly [number, V])[]>(entries: T) { return Object_entries(entries) }
  // <const T extends readonly entry.any[]>(entries: T): object_fromEntries<T>
// } = Object_fromEntries

export type object_fromEntries<T extends entry.any> = never | { [E in T as E[0]]: E[1] }

/**  
 * ## {@link object_lookup `object.lookup`}
 * ### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 */
export const object_lookup
  : <const T extends object.any, K extends keyof T>(object: T) => (key: K) => T[K] 
  = (object) => (key) => object[key]

/**  
 * ## {@link object_fromPairs `object.fromPairs`}
 * ### ｛ {@link jsdoc.constructor ` 🏗 `} , {@link jsdoc.mapping ` 🌈‍ `} ｝
 */
export const object_fromPairs = fn.untupled(object_fromEntries)

/** 
 * ## {@link object_bind `object.bind`} 
 * ### ｛ {@link jsdoc.constructor ` 🏗 `} , {@link jsdoc.mapping ` 🌈‍ `} ｝
 */
export function object_bind<K extends keyof any>(key: K): <const V>(value: V) => K extends K ? { [k in K]: V } : never
/// impl.
export function object_bind<K extends key.any>(key: K) {
  return <const V>(value: V) => ({ [key]: value })
    // const object = Object_create(null)
    // Object_assign(
    //   {},
    //   { [key]: value },
    // )
}

/** 
 * ## {@link object_createLookup `object.createLookup`} 
 * ### ｛ {@link jsdoc.constructor ` 🏗 `} ｝
 */
export const object_createLookup
  : <const T extends object.any>(object: T) => <K extends keyof T>(key: K) => T[K] 
  = (object) => (key) => object[key]

/** 
 * ## {@link object_parseKey `object.parseKey`} 
 * ### ｛ {@link jsdoc.mapping ` 🌈‍ `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 */
export function object_parseKey<const T extends keyof any>(key: T): Universal.key<T>
export function object_parseKey(k: keyof any, _ = globalThis.String(k)) {
  return (
    typeof k === "symbol" ? _ 
    : isQuoted(k) ? escape(_)
    : isValidIdentifier(k) ? escape(_) : `"` + escape(_) + `"`
  )
}

/** 
 * ## {@link object_parseEntry `object.parseEntry`} 
 * ### ｛ {@link jsdoc.mapping ` 🌈‍ `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 */
export function object_parseEntry<const T extends readonly [key.any, any.primitive]>([k, v]: T): `${string}: ${string}`
export function object_parseEntry<const T extends readonly [prop.any, any.showable]>([k, v]: T): `${string}: ${string}`
export function object_parseEntry<const T extends readonly [prop.any, any.showable]>([k, v]: T) {
  return `${object_parseKey(k)}: ${globalThis.String(v)}`
}

/** 
 * ## {@link object_get.defer `object.get.defer`} 
 * ### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 * 
 * Curried variant of {@link object_get `object.get`}
 * 
 * See also:
 * - {@link object_get `object.get`}
 */
object_get.defer = <
  const T extends object.any, 
  K extends autocomplete<keyof T>
> (key: K) => 
  (object: T) => 
    object_get(object, key)

/** 
 * ## {@link object_get `object.get`} 
 * ### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 * 
 * Get a property from an object. Good support for autocompletion of property names.
 * 
 * See also:
 * - {@link object_get.defer `object.get.defer`}
 */
export function object_get<const T extends object.any, K extends autocomplete<keyof T>>
  (object: T, key: K): T[K]
/// impl.
export function object_get<const T extends object.any, K extends keyof T>
  (object: T, key: K) { return object == null ? undefined : object[key] }

/**
 * ## {@link object_pluck.defer `object.pluck.defer`}
 * ### ｛ {@link jsdoc.destructor ` ⛓️‍💥 ` } , {@link jsdoc.mapping ` 🌈‍ `} ｝
 * 
 * Curried variant of {@link object_pluck `object.pluck`}.
 * 
 * See also:
 * - {@link object_pluck `object.pluck`}
 */
object_pluck.defer = (
  /// impl.
  function object_pluck_defer(key: key.any) { return (object: object.any) => object_pluck(object, key) }
) as <const T extends { [x: number]: object.any }, K extends autocomplete<keyof T[keyOf<T>]>>(key: K) => (object: T) => object_pluck<T, K>

/**
 * ## {@link object_pluck `object.pluck`} 
 * ### ｛ {@link jsdoc.destructor ` ⛓️‍💥 ` } , {@link jsdoc.mapping ` 🌈‍ `} ｝
 * 
 * {@link object_pluck `object.pluck`} takes a key, and an object *or* 
 * an array containing objects (or arrays) that are all indexed by that 
 * key, and "plucks" the value at that key in every child.
 * 
 * Preserves the structure of the outer container at both the term- and 
 * type-level.
 * 
 * Will autocomplete any shared keys it finds, but will also let you pluck
 * an arbitrary property without complaining; if it doesn't find a value for 
 * the corresponding key, that entry's type will fallback to:
 * 
 * - `unknown` (if the parent is an object); or,
 * - `undefined` (if the parent is an array)
 * 
 * See also:
 * - {@link object_pluck.defer `object.pluck.defer`}
 * 
 * @example
 *  import { object } from "@traversable/data"
 * 
 *  const ex_01 = object.pluck(
 *    [{ abc: [1] }, { abc: [2, 2] }, { abc: [3, 3, 3] }], 
 *    "abc",
 *  )
 *
 *  console.log("const ex_01:", ex_01) 
 *  // => const ex_01: [[1], [2, 2], [3, 3, 3]]
 *  ex_01
 *  // ^? const ex_01: [[1], [2, 2], [3, 3, 3]]
 *
 * 
 *  const ex_02 = object.pluck({
 *    x: { abc: [1, 2, 3], c: 9000 },
 *    y: { abc: { color: "#000", margin: 0 }, d: false },
 *    u: { lmn: "op" },
 *    z: { abc: new Date(), e: "hey" },
 *  }, "abc")
 *
 *  console.log("const ex_02:", ex_02)
 *  // => const ex_02: { x: [1, 2, 3], y: { color: "#000", margin: 0 }, u: undefined, z: Sat Jul 27 2024... }
 *  ex_02
 *  // ^? const ex_02: { x: [1, 2, 3], y: { color: "#000", margin: 0 }, u: unknown, z: Date }
 * 
 * 
 *  const ex_03 = fn.pipe(
 *    [["a", "b"], ["c", "d", "e"], ["f", "g", "h", "i"]],
 *    object.pluck(2),
 *  )
 *
 *  console.log("const ex_03:", ex_03)
 *  // => const ex_03: [undefined, "e", "h"]
 *  ex_03
 *  // ^? const ex_03: [undefined, "e", "h"]
 */
export function object_pluck
  <const T extends { [x: number]: object.any }, K extends autocomplete<keyof T[keyOf<T>]>>
  (object: T, key: K): object_pluck<T, K>
export function object_pluck
  <K extends autocomplete<keyof T[keyof T]>, const T extends object.of<object.any>>(object: T, key: K)
  /// impl.
  { return map(object, (v) => v[key]) }

export type object_pluck<T, K extends keyof any> = never | 
  { -readonly [ix in keyof T]: getOrUnknown<T[ix][K & keyof T[ix]]> }

/** 
 * ## {@link object_keys `object.keys`} 
 * ### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 * 
 * Like {@link globalThis.Object.keys `globalThis.Object.keys`} with better types.
 * 
 * By default {@link object_keys `object.keys`} does not return an object's symbol
 * properties. If you need to get the symbols from an object, pass 
 * `{ symbols: "keep" }` as the second argument.
 * 
 * See also: 
 * - {@link globalThis.Object.keys `globalThis.Object.keys`}
 * - {@link object_values `object.values`}
 * - {@link object_fromKeys `object.fromKeys`}
 * - {@link object_entries `object.entries`}
 */
export function object_keys<K extends prop.any>(object: { [P in K]: unknown }): (K & prop.any)[]
export function object_keys<const T extends { [x: number]: any }>(object: T, options?: object_keys.Options): (keyof T)[]
export function object_keys<const T extends object.any>
  (object: T, options: object_keys.Options = object_keys.defaults) 
  { return options.symbols === object_keys.defaults.symbols ? Object_keys(object) : object_keys.impl(object) }

export type object_keys<T> 
  = [T] extends [array.finite<T>]
  ? { -readonly [K in keyof T]: parseInt<K> } extends 
  infer KS extends any.keysOf<T> ? KS : never
  : (keyof T)[]

export declare namespace object_keys {
  interface Options extends globalThis.Partial<{ symbols: "keep" | "forget" }> {}
}
export namespace object_keys {
  export const defaults = {
    symbols: "forget",
  } satisfies globalThis.Required<Options>
  /// impl.
  export const impl = (object: { [x: number]: unknown }): key.nonnumber[] => {
    let out: (string | symbol)[] = Object_keys(object) 
    const sym = object_symbols(object)
    for (let ix = 0; ix < object_symbols.length; ix++) out.push(sym[ix])
    return out
  }
}

/** 
 * ## {@link object_transform.defer `object.transform.defer`} 
 * ### ｛ {@link jsdoc.mapping ` 🌈‍ `} ｝
 * 
 * Curried variant of {@link object_transform `object.transform`}
 * 
 * See also:
 * - {@link object_transform `object.transform`}
 */
function object_transform_defer<const T extends any.indexedBy<keyof XF>, const XF>(
  transformers: { [K in keyof XF]: (x: T[K]) => XF[K] }
) { return (object: T) => object_transform(object, transformers) }

void (object_transform.defer = object_transform_defer);

/** 
 * ## {@link object_transform `object.transform`}
 * ### ｛ {@link jsdoc.mapping ` 🌈‍ `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 * 
 * See also:
 * - {@link object_transform.defer `object.transform.defer`}
 */
export function object_transform<const T extends any.indexedBy<keyof XF>, const XF>(
  object: T,
  transformers: { [K in keyof XF]: (x: T[K]) => XF[K] }
): { -readonly [K in keyof T]: K extends keyof XF ? XF[K] : T[K] }
/// impl.
export function object_transform<T extends any.indexedBy<keyof XF>, XF>
  (object: T, transformers: { [K in keyof XF]: (x: T[K]) => XF[K] }) {
    if (Object_keys(transformers).length === 0) return object
    let out = getEmpty(object)
    for (const ix of object_keys(object, { symbols: "keep" }))
      out[ix] = object_isKeyOf(ix, transformers) ? transformers[ix](object[ix]) : object[ix]
    return out
  }

/** 
 * ## {@link object_entries `object.entries`} 
 * ### ｛ {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 * 
 * See also: 
 * - {@link globalThis.Object.entries `globalThis.Object.entries`}
 * - {@link object_keys `object.keys`}
 * - {@link object_values `object.values`}
 */
export function object_entries<const T>(object: T): object_entries<T>
/// impl.
export function object_entries<const T extends {}>(object: T) {
  const entries = Object_entries(object)
  return isArray(object)
    ? entries.map(([k, v]) => [globalThis.Number.parseInt(k, 10), v])
    : entries
}

export type object_entries<T> 
    = never | T extends T 
    ? [keyof T] extends [never] 
    ? [key: string, value: unknown][]
    : object_entries.apply<
      T extends readonly unknown[] 
      ? number extends T["length"] 
      ? object_entries.array : object_entries.tuple 
      : string extends keyof T ? object_entries.record
      : number extends keyof T ? object_entries.record
      : symbol extends keyof T ? object_entries.record
      : object_entries.object,
      T
    >
  : never

export declare namespace object_entries { // nothing to see here 👀
  export interface kind<I = unknown, O = unknown> extends newtype<{ [0]: I, [-1]: O }> {}
  export type apply<K extends object_entries.kind, Arg extends K[0]> = (K & { 0: Arg })[-1]
  export interface array extends object_entries.kind { [-1]: mut.array<[indices: `${number}`, values: this[0][number & keyof this[0]]]> }
  export interface record extends object_entries.kind { [-1]: mut.array<[keys: keyof this[0], values: this[0][keyof this[0]]]> }
  export interface tuple extends object_entries.kind { [-1]: this[0] extends infer T ? { [K in keyof T]: [index: K, value: T[K]] } : never }
  export { map_object as object }
  export interface map_object extends object_entries.kind {
    [-1]: [keyof this[0]] extends [infer K extends keyof this[0]]
    ? mut.array<K extends K ? [key: K, value: this[0][K]] : never> : never
  }
}

/** 
 * ## {@link object_some `object.some`} 
 * ### ｛ {@link jsdoc.combining ` 🪢 `} ｝
 */
export function object_some<V>(predicate: (value: V) => boolean): 
  <T extends { [x: string]: V } | { [x: number]: V }>(object: T) => boolean
/// impl.
export function object_some<V>(predicate: (value: V) => boolean) {
  return (object: { [x: prop.any]: V }) => {
    const keys = Object_keys(object)
    for (let ix = 0; keys.length > ix; ix++) {
      const k = keys[ix]
      if (predicate(object[k])) return true
    }
    return false
  }
}

/** 
 * ## {@link filterKeys `object.filterKeys`}
 * ### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } ｝
 * 
 * - Like `Array.prototype.filter`, but with better type inference.
 * - See also: {@link filter `object.filter`}
 * - Positions: supports both data-first and data-last (see `fn.pipe`, `fn.flow`)
 * 
 * @example
 *  import { object } from "@traversable/data"
 *  import * as vi from "vitest"
 *
 *  vi.assert.equal(
 *    object.filterKeys(
 *      { GobBluth: "Magician", TobiasFünke: "Analyst-therapist", LindsayBluth: "Lobbyist" }, 
 *      (k) => k.includes("ü")
 *    ), 
 *    { TobiasFünke: "Analyst-therapist", MaybeFünke: "Con Artist" }
 *  )
 *  vi.assertType
 *    // given a predicate (a function returning true or false), 
 *    // `object.filterKeys` makes all the keys optional, because 
 *    // it doesn't have enough information to narrow the types further:
 *    <{ GobBluth?: "Magician", TobiasFünke?: "Analyst-therapist", LindsayBluth?: "Lobbyist" }>(
 *    object.filterKeys(
 *      { GobBluth: "Magician", TobiasFünke: "Analyst-therapist", LindsayBluth: "Lobbyist" }, 
 *      (k) => k.includes("ü")
 *    )
 *  )
 * 
 *  // For better type inference, pass 
 *  // `object.filterKeys` a type guard:
 *  import { string } from "@traversable/data"
 * 
 *  vi.assert.equal(
 *    object.filterKeys(
 *      { GobBluth: "Magician", TobiasFünke: "Analyst-therapist", LindsayBluth: "Lobbyist" },
 *      string.endsWith("Bluth")
 *    ), 
 *    { GobBluth: "Magician", LindsayBluth: "Lobbyist" }
 *  )
 *  vi.assertType
 *    // given a type guard, `object.filterKeys` is able to infer 
 *    // which keys the output object will have:
 *    <{ GobBluth: "Magician", LindsayBluth: "Lobbyist" }>(
 *    object.filterKeys(
 *      { GobBluth: "Magician", TobiasFünke: "Analyst-therapist", LindsayBluth: "Lobbyist" },
 *      string.endsWith("Bluth")
 *    )
 *  )
 * 
 *  vi.assert.equal(
 *    object.filterKeys(
 *      { GobBluth: "Magician", TobiasFünke: "Analyst-therapist", LindsayBluth: "Lobbyist" }, 
 *      string.includes("ü")
 *    ), 
 *    { TobiasFünke: "Analyst-therapist" }
 *  )
 *  vi.assertType
 *    <{ GobBluth?: "Magician", TobiasFünke?: "Analyst-therapist", LindsayBluth?: "Lobbyist" }>(
 *    object.filterKeys(
 *      { TobiasFünke: "Analyst-therapist" }, 
 *      string.includes("ü")
 *    )
 *  )
 */
export function object_filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: string) => k is K & typeof k): object_pick<T, keyof T & K>
export function object_filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: number) => k is K & typeof k): object_pick<T, keyof T & K>
export function object_filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: symbol) => k is K & typeof k): object_pick<T, keyof T & K>
export function object_filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: key.nonsymbol) => k is K & typeof k): object_pick<T, keyof T & K>
export function object_filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: key.nonnumber) => k is K & typeof k): object_pick<T, keyof T & K>
export function object_filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: key.nonstring) => k is K & typeof k): object_pick<T, keyof T & K>
export function object_filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: key.any) => k is K): object_pick<T, keyof T & K>
export function object_filterKeys<const T extends object.any>(object: T, predicate: some.predicate<string>): { -readonly [K in keyof T]+?: T[K] }
export function object_filterKeys<const T extends object.any>(object: T, predicate: some.predicate<number>): { -readonly [K in keyof T]+?: T[K] }
export function object_filterKeys<const T extends object.any>(object: T, predicate: some.predicate<symbol>): { -readonly [K in keyof T]+?: T[K] }
export function object_filterKeys<const T extends object.any>(object: T, predicate: some.predicate<key.nonsymbol>): { -readonly [K in keyof T]+?: T[K] }
export function object_filterKeys<const T extends object.any>(object: T, predicate: some.predicate<key.nonnumber>): { -readonly [K in keyof T]+?: T[K] }
export function object_filterKeys<const T extends object.any>(object: T, predicate: some.predicate<key.nonstring>): { -readonly [K in keyof T]+?: T[K] }
export function object_filterKeys<const T extends object.any>(object: T, predicate: some.predicate<key.any>): { -readonly [K in keyof T]+?: T[K] }
/// impl.
export function object_filterKeys(object: object.any, predicate: (key: any) => boolean) {
  const total = Object_keys(object).length
  let count = 0
  const out: object.any = {}
  for(const k in object)
    if(predicate(k)) {
      void (out[k] = object[k])
      void (count = count + 1)
    }
  /** 
   * **Optimization:** If all keys satisfy the predicate, just 
   * return the original object, to 🌈 preserve the reference ✨
   */
  if(total === count) return object
  else return out
}

/** 
 * ## {@link object_filterKeys.defer `object.filterKeys.defer`}
 * ### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } ｝
 * 
 * Curried variant of {@link object_filterKeys `object.filterKeys`}
 * 
 * See also:
 * - {@link object_filterKeys `object.filterKeys`}
 */
object_filterKeys.defer = (
  function object_filterKeys_defer(predicate: some.predicate<any>)
  /// impl.
  { return (object: object.any) => object_filterKeys(object, predicate) }
) as {
  <const T extends object.any, K extends key.any> (guard: (k: key.any) => k is K): (object: T) => object_pick<T, keyof T & K>
  <const T extends object.any, K extends key.any> (guard: (k: string) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
  <const T extends object.any, K extends key.any> (guard: (k: number) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
  <const T extends object.any, K extends key.any> (guard: (k: symbol) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
  <const T extends object.any, K extends key.any> (guard: (k: key.nonsymbol) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
  <const T extends object.any, K extends key.any> (guard: (k: key.nonnumber) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
  <const T extends object.any, K extends key.any> (guard: (k: key.nonstring) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
  <const T extends object.any, K extends key.any> (guard: (k: key.any) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
  <const T extends object.any> (predicate: some.predicate<string>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
  <const T extends object.any> (predicate: some.predicate<number>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
  <const T extends object.any> (predicate: some.predicate<symbol>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
  <const T extends object.any> (predicate: some.predicate<key.nonsymbol>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
  <const T extends object.any> (predicate: some.predicate<key.nonnumber>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
  <const T extends object.any> (predicate: some.predicate<key.nonstring>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
  <const T extends object.any> (predicate: some.predicate<keyof any>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
}

