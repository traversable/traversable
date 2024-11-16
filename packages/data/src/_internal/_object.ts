import type { Universal, mutable as mut, newtype, nonempty, some } from "any-ts"

// hard dependencies
import * as fn from "./_function.js"
import { key } from "./_key.js"
import { map } from "./_map.js"
import { escape, isQuoted, isValidIdentifier, toString } from "./_string.js"

import type * as array from "../array.js"
import type { entries } from "../entry.js"
// type-level dependencies
import type { object } from "../exports.js"
import type { any } from "./_any.js"
import type { prop, props } from "./_prop.js"
import type { to } from "./_to.js"
import type { jsdoc } from "./_unicode.js"

export namespace URI {
  export const Leaf = "@traversable/data/object/fromPaths::Leaf"
  export type Leaf = typeof Leaf
}
export namespace symbol {
  export const Leaf = Symbol.for(URI.Leaf)
  export type Leaf = typeof symbol.Leaf
}

type Mutable<T> = never | { -readonly [K in keyof T]: T[K] }
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
type finiteArray<T> = globalThis.Extract<
  T extends array.any ? number extends T["length"] ? never : T : never, 
  array.any
>
/** @internal */
type parseInt<T> = [T] extends [`${infer N extends number}`] ? N : T;
/** @internal */
type literal<T extends any.primitive> 
  = string extends T ? never
  : number extends T ? never
  : boolean extends T ? never
  : T
/** @internal */
const isArray
  : (u: unknown) => u is array.any
  = globalThis.Array.isArray
/** @internal */
const isString = (u: unknown): u is string =>
  typeof u === "string"
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
const isFlat = (u: unknown): u is object.of<any.showable> => 
  object_is(u) && object_values(u).every(isShowable)
/** @internal */
const isShowable = (u: unknown): u is any.showable => 
  u == null || ["boolean", "number", "bigint", "string"].includes(typeof u)
/** @internal */
const isPrimitive = (u: unknown): u is any.primitive => 
  u == null || ["boolean", "number", "bigint", "string", "symbol"].includes(typeof u)
/** @internal */
const isProp = (u: unknown): u is prop.any => ["number", "string"].includes(typeof u)
/** @internal */
const isProps = (u: unknown): u is props.any => isArray(u) && u.every(isProp)
/** @internal */
function getEmpty<T extends {}>(_: T): any.indexedBy<keyof T | number>
function getEmpty(_: {}) { return globalThis.Array.isArray(_) ? [] : {} }


/**
 * ### {@link symbols `object.symbols`}
 * #### ｛ {@link jsdoc.destructor ` ️⛓️‍💥️‍ `} ｝
 * 
 * Returns an array of all of an object's own (non-inherited) symbol properties.
 * 
 * {@link symbols `object.symbols`} is like {@link keys `object.keys`},
 * but for symbols.
 * 
 * See also:
 * - {@link keys `object.keys`}
 * - {@link globalThis.Object.getOwnPropertySymbols `globalThis.Object.getOwnPropertySymbols`}
 * - [MDN docs on `Object.getOwnPropertySymbols`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols)
 */
export const symbols: {
  <T extends object.any>(object: T): symbols<T>[]
  (object: object.any): symbol[]
} = globalThis.Object.getOwnPropertySymbols

export type symbols<T, K extends keyof T & symbol = keyof T & symbol> 
  = [K] extends [never] ? symbol : K

export function isEmpty<T extends {}>(object: T): boolean {
  for (const k in object) if (globalThis.Object.hasOwn(object, k)) return false
  return true
}

/**
 * ### {@link object_mapKeys `object.mapKeys`} 
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * Because it does not preserve any type information, {@link object_mapKeys `object.mapKeys`} is best 
 * used as an intermediate function, as you build up the value (and type) that you actually want at
 * the end.
 */
export function object_mapKeys(fn: (k: key.any) => key.any): (object: { [x: number]: unknown }) => { [x: number]: unknown }
export function object_mapKeys(fn: (k: key.any) => key.any) {
  return (object: { [x: number]: unknown }) => {
    if (globalThis.Array.isArray(object)) return object
    else {
      let out: { [x: number | string]: unknown } = {}
      for (const k in object) out[fn(k) as never] = object[k]
      return out
    }
  }
}

/**
 * ### {@link has `object.has`}
 * 
 * See also:
 * - {@link fromPath `object.fromPath`}
 */
export function has<const KS extends prop.any[]>(...path: KS): (u: unknown) => u is has<[...KS]>
export function has<const KS extends prop.any[], V>(leaf: (u: unknown) => u is V, ...path: KS): (u: unknown) => u is has<[...KS], V>
export function has(...[head, ...tail]: has.allArgs) {
  const path = typeof head === "function" ? tail : [head, ...tail]
  const guard = typeof head === "function" ? head : has.defaults.guard
  return (u: unknown): u is typeof u => {
    let out: unknown = u
    let k: prop.any | undefined
    while (k = path.shift()) {
      if (!isNonPrimitiveObject(out)) return false
      out = out[k]
    }
    return guard(out)
  }
}

export type has<KS extends prop.any[], V = unknown>
  = KS extends [...infer Todo extends prop.any[], infer Next extends prop.any]
  ? has.loop<Next, Todo, V>
  : V
export declare namespace has {
  type allArgs = [head: prop.any | ((u: unknown) => u is typeof u), ...tail: prop.any[]]
  type loop<
    K extends key.any, 
    KS extends prop.any[], 
    V
  > = has<KS, { [P in K]: V }>
}
export namespace has {
  export const defaults = { guard: (_: unknown): _ is typeof _ => true }
}

/** 
 * ### {@link fromPath `object.fromPath`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * Similar to {@link fromPaths `object.fromPath`}, but only supports
 * creating an object from a single path.
 * 
 * See also:
 * - {@link fromPaths `object.fromPaths`}
 */
export function fromPath<const V, const KS extends prop.any[]>(leaf: V, ...keys: KS): has<KS, V> 
export function fromPath(leaf: unknown, ...keys: prop.any[]) {
  let out: unknown = leaf
  let k: prop.any | undefined
  while (k = keys.pop()) 
    out = { [k]: out }
  return out
}

/** ### {@link object_knownPart `object.knownPart`} */
export type object_knownPart<T> = never | { [k in keyof T as literal<k>]: T[k] }
/** ### {@link object_optionalKeys `object.optionalKeys`} */
export type object_optionalKeys<T, K = keyof T> = K extends keyof T ? {} extends globalThis.Pick<T, K> ? K : never : never
/** ### {@link object_requiredKeys `object.requiredKeys`} */
export type object_requiredKeys<T, K = keyof T> = K extends keyof T ? {} extends globalThis.Pick<T, K> ? never : K : never
/** ### {@link object_required `object.required`} */
export type object_required<T> = never | object_pick<T, object_requiredKeys<T>>
/** ### {@link object_optional `object.optional`} */
export type object_optional<T> = never | object_pick<T, object_optionalKeys<T>>
/** ### {@link object_invertible `object.invertible`} */
export type object_invertible<T extends { [x: key.any]: key.any } = { [x: key.any]: key.any }> = T
/** ### {@link object_omitLax `object.omitLax`} */
export type object_omitLax<T, K extends key.any> = never | object_pick<T, globalThis.Exclude<keyof T, K>>


/** @internal exported as a property on {@link object_pick `object.pick`} */
const object_pick_defer: {
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
} = (...key: nonempty.arrayOf<prop.any>) => 
    (object: object.any) => 
      object_pick(object, ...key)

/** 
 * ### {@link object_pick.defer `object.defer.defer`} 
 * #### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } , {@link jsdoc.preserves_reference ` 🧩‍ ` } ｝
 * 
 * Term-level equivalent of {@link globalThis.Pick `Pick`}.
 * 
 * Curried variant of {@link object_pick `object.pick`}
 * 
 * See also:
 * - {@link object_pick.defer `object.pick.defer`}
 * - {@link object_omit `object.omit`}
 */
object_pick.defer = object_pick_defer

export type object_pick<T, K extends keyof T> = never | { -readonly [P in K]: T[P] }

/** 
 * ### {@link object_pick `object.pick`}
 * #### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } , {@link jsdoc.preserves_reference ` 🧩‍ ` } ｝
 * 
 * Term-level equivalent of {@link globalThis.Pick `Pick`}.
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
  if (globalThis.Object.keys(object).every((k) => keep.has(k))) return object
  else {
    let out: { [x: keyof any]: unknown } = {}
    for (let ix = 0; ix < key.length; ix++) {
      const k = key[ix]
      if (k in object) out[k] = object[k]
    }
    return out
  }
}

/** @internal exported as a property on {@link object_omit `object.omit`} */
const object_omit_defer: {
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
} /// impl.
  = (...k: props.any) => 
      (object: object.any) => 
        object_omit(object, ...k as [])

/** 
 * ### {@link object_omit.defer `object.omit.defer`} 
 * #### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } , {@link jsdoc.preserves_reference ` 🧩‍ ` } ｝
 * 
 * Term-level equivalent of {@link globalThis.Omit `Omit`}.
 * 
 * Curried variant of {@link object_omit `object.omit`}.
 * 
 * See also:
 * - {@link object_omit `object.omit`}
 * - {@link object_pick `object.pick`}
 */
object_omit.defer = object_omit_defer

export type object_omit<T, K extends keyof T> = never | object_pick<T, globalThis.Exclude<keyof T, K>>

/**
 * ### {@link object_omit `object.omit`}
 * #### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } , {@link jsdoc.preserves_reference ` 🧩‍ ` } ｝
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
export function object_omit<const T extends object.any>(object: T, ...key: key.any[]): 
  globalThis.Partial<object.any>

/// impl.
export function object_omit(object: object.any, ...key: key.any[]): unknown {
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
 * ### {@link object_isKeyOf `object.isKeyOf`} 
 * #### ｛ {@link jsdoc.guard ` 🦺 ` } ｝
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
    return key in object
  }
}
export type object_isKeyOf<T, K extends key.any> = never | (K & keyof T)

/** 
 * ### {@link object_isNonEmpty `object.isNonEmpty`} 
 * #### ｛ {@link jsdoc.empty ` 🕳️‍ ` } , {@link jsdoc.guard ` 🦺 ` } ｝
 */
export const object_isNonEmpty
  : some.predicate<object> 
  = (object) => globalThis.Object.keys(object).length > 0

/** 
 * ### {@link object_invert `object.invert`} 
 * #### ｛ {@link jsdoc.mapping ` 🌈‍ `} ｝
 */
export function object_invert<const T extends { [x: number]: key.any }>(object: T): object_invert<T>
/// impl.
export function object_invert<const T extends object_invertible>(object: T) {
  let out: { [x: key.nonnumber]: string } = {}
  for (const k of globalThis.Object.keys(object)) out[object[k]] = k
  return out
}

export type object_invert<T extends object_invertible> 
  = T extends readonly key.any[] 
  ? never | { -readonly [K in Extract<keyof T, `${number}`> as T[K]]: K }
  : never | { -readonly [K in keyof T as T[K]]: K }
  ;


/** 
 * ### {@link isNonPrimitiveObject `object.isNonPrimitiveObject`} 
 * #### ｛ {@link jsdoc.guard ` 🦺 ` } ｝
 * 
 * Targets any non-primitive JavaScript object
 * 
 * See also:
 * - {@link isRecord `object.isRecord`}
 */
export const isNonPrimitiveObject = (u: unknown): u is { [x: prop.any]: unknown } => 
  typeof u === "object" && u !== null

/** 
 * ### {@link isRecord `object.isRecord`} 
 * #### ｛ {@link jsdoc.guard ` 🦺 ` } ｝
 *
 * Targets any non-array, non-primitive JavaScript object
 * 
 * See also:
 * - {@link isNonPrimitiveObject `object.isNonPrimitiveObject`}
 */
export const isRecord = (u: unknown): u is { [x: string]: unknown } => 
  typeof u === "object" && u !== null && !globalThis.Array.isArray(u)

/** 
 * ### {@link object_is `object.is`} 
 * #### ｛ {@link jsdoc.guard ` 🦺 ` } ｝
 */
export const object_is
  : (u: unknown) => u is object
  = isRecord

/** 
 * ### {@link object_let `object.let`} 
 * #### ｛ {@link jsdoc.constructor ` 🏗 `} ｝
 */
export function object_let<const T extends object>(object: T): mut<T>
/// impl.
export function object_let<const T extends object>(object: T) { return object }

/** 
 * ### {@link object_const `object.const`} 
 * #### ｛ {@link jsdoc.constructor ` 🏗 `} ｝
 */
export const object_const
  : <const T extends object>(object: T) => T
  = fn.identity


/** 
 * ### {@link object_fromKeys `object.fromKeys`} 
 * #### ｛ {@link jsdoc.constructor ` 🏗 `} ｝
 */
export function object_fromKeys<const KS extends readonly prop.any[]>(keys: KS): object_fromKeys<KS>
export function object_fromKeys<const KS extends readonly prop.any[]>(...keys: KS): object_fromKeys<KS>
export function object_fromKeys<const KS extends readonly key.any[]>(keys: KS): object_fromKeys<KS>
export function object_fromKeys<const KS extends readonly key.any[]>(...keys: KS): object_fromKeys<KS>
/// impl.
export function object_fromKeys<const KS extends props.any>(...args: (KS) | [KS]) { 
  return args.flat(1).reduce((acc, key) => (acc[key] = key, acc), {} as object.any) 
}
export type object_fromKeys<KS extends readonly (key.any)[]> = never | { [K in [...KS][number]]: K }

/** 
 * ### {@link object_fromArray `object.fromArray`} 
 * #### ｛ {@link jsdoc.constructor ` 🏗 `} ｝
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
 * ### {@link object_find `object.find`} 
 * #### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } ｝
 */
export function object_find<S, T extends S>(guard: (src: S) => src is T): (object: object.of<S>) => T | undefined
export function object_find<T>(pred: some.predicate<T>): (object: object.of<T>) => T | undefined
/// impl.
export function object_find<T>(pred: some.predicate<T>) { return (object: object.of<T>) => globalThis.Object.values(object).find(pred) }

/** 
 * ### {@link object_includes `object.includes`} 
 * #### ｛ {@link jsdoc.combining ` 🪢 `} ｝
 */
export function object_includes<S>(match: S): <T extends object.any>(object: T) => boolean
export function object_includes<S>(match: S) { 
  return <T extends object.any>(object: T) => globalThis.Object.values(object).includes(match) 
}

export declare namespace object_filter {
  export type cast<T, Invariant> 
    = globalThis.Extract<T, Invariant> extends infer U 
      ? [U] extends [never] ? Invariant 
      : U : never
  export type allSatisfy<T, Bound> 
    = (Bound extends Bound ? (T extends T & Bound ? T : never) extends infer Out ? Out : never : never) extends 
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
 * ### {@link object_filter `object.filter`}
 * #### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } , {@link jsdoc.preserves_reference ` 🧩‍ ` } ｝
 * 
 * If you pass the global {@link globalThis.BooleanConstructor `Boolean`} constructor,
 * {@link object_filter `object.filter`} will do the right thing™️ and filter `null`
 * and `undefined` from the array _without_ the coercive bullshit that happens if you
 * were to pass `Boolean` to (for example) {@link Array.prototype.filter `Array.prototype.filter`}.
 * 
 * It also does a pretty decent job inferring the type of the resulting object.
 * 
 * See also: 
 * - {@link object_filter.defer `object.filter.defer`}
 */
export function object_filter<A, B extends A, const T extends { [x: string]: A }>(object: T, guard: (a: A) => a is B): object_filter<T, B>
export function object_filter<A extends valueOf<T>, const T extends { [x: number]: any }>(object: T, predicate: (a: A) => boolean): object_filter<T, A>
/// impl.
export function object_filter<A extends valueOf<T>, const T extends {}>(
  object: T, predicate: some.predicate<A>
) {
  const keep = globalThis.Object.entries(object).filter(([, v]) => 
    predicate === globalThis.Boolean 
    ? v != null
    : predicate(v as never)
  )
  /**
   * **Optimization:**
   * If applying the filter did not remove any keys, return the original object to
   * 🌈 preserve the reference ✨
   */
  if (globalThis.Object.keys(object).length === keep.length) return object
  else return globalThis.Object.fromEntries(keep)
}

void (object_filter.defer = object_filter_defer);

/** 
 * ### {@link object_filter_defer `object.filter.defer`} 
 * #### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } ｝
 * 
 * Curried variant of {@link object_filter `object.filter`}
 * 
 * See also: 
 * - {@link object_filter `object.filter`}
 */
function object_filter_defer(nullish: globalThis.BooleanConstructor): <const T extends object.any>(object: T) => { -readonly [K in keyof T]-?: globalThis.NonNullable<T[K]> }
function object_filter_defer<T, U extends T>(guard: { (v: T): v is U; (v: any): v is U }): <const S extends object.any>(object: S) => object_filter<S, U>
function object_filter_defer<const T extends object.any>(predicate: (s: T[keyof T]) => boolean): (object: T) => { -readonly [K in keyof T]: T[K] }
function object_filter_defer(predicate: some.predicate<any>) {
  return (object: object.any) => {
    if(predicate === undefined) {
      console.log("undefined predicate, object: ", object)
    }
    return object_filter(object, predicate)
  }
}

/** 
 * ### {@link object_empty `object.empty`} 
 * #### [ [` 🕳️ `](https://todo-link-to-jsdoc-legend.com) ]
 */
export const object_empty = {}

/** 
 * ### {@link object_emptyOf `object.emptyOf`} 
 * #### ｛ {@link jsdoc.constructor ` 🏗 `} , {@link jsdoc.empty ` 🕳‍ `} ｝
 */
export const object_emptyOf
  : <T extends object = never>() => T 
  = () => globalThis.Object.create(globalThis.Object.getPrototypeOf(object_empty))


/**
 * ### {@link object_complement `object.complement`}
 * #### ｛ {@link jsdoc.mapping ` 🌈‍ `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 */
export function object_complement<const T extends object.any>(object: T): 
  <const Part extends { [k in keyof T]?: unknown }>(part: Part) => object_complement<T, Part>
/// impl.
export function object_complement(object: { [x: string]: unknown }) {
  return (part: { [x: string]: unknown }) => {
    const keys = globalThis.Object.keys(part)
    return object_omit.defer(...keys)(object)
  }
}
export type object_complement<T, Negative> = object_omitLax<T, Negative extends Negative ? keyof Negative : never>

/** 
 * ### {@link object_values `object.values`}
 * #### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 */
export const object_values
  : <const T extends object.any>(object: T) => array.of<T[keyof T]> 
  = globalThis.Object.values
// export type object_values<T> = never | T[keyof T]

object_values({ a: 1, b: 2 })

/** 
 * ### {@link object_toUpper `object.toUpper`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export type object_toUpper<T> = never | { -readonly [K in keyof T as key.toUpper<K>]: T[K] }
export function object_toUpper<const T extends object.any>(object: T): { -readonly [K in keyof T as key.toUpper<K>]: T[K] }
export function object_toUpper<const T extends object.any>(object: T) { return object_mapKeys(key.toUpper)(object) }

/** 
 * ### {@link object_uppercaseValues `object.uppercaseValues`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_uppercaseValues<const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.toUpper<T[K]> }
export function object_uppercaseValues<const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.toUpper<number & T[K]> }
export function object_uppercaseValues<const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.toUpper<T[K]> }
/// impl.
export function object_uppercaseValues(object: { [x: key.any]: key.any }) { return map(object, key.toUpper) }
export type object_uppercaseValues<T extends { [x: key.any]: key.any }> = never | { -readonly [K in keyof T]: key.toUpper<T[K]> }

/** 
 * ### {@link object_toLower `object.toLower`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_toLower<const T extends { [x: number]: unknown }>(object: T): object_toLower<T>
export function object_toLower<const T extends { [x: string]: unknown }>(object: T): object_toLower<T>
export function object_toLower<const T extends { [x: key.any]: unknown }>(object: T): object_toLower<T>
/// impl.
export function object_toLower(object: { [x: key.any]: unknown }) { return object_mapKeys(key.toLower)(object) }
export type object_toLower<T> = never | ([T] extends [readonly unknown[]] ? T : { -readonly [K in keyof T as key.toLower<K>]: T[K] })

/** 
 * ### {@link object_lowercaseValues `object.lowercaseValues`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_lowercaseValues<const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.toLower<T[K]> }
export function object_lowercaseValues<const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.toLower<number & T[K]> }
export function object_lowercaseValues<const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.toLower<T[K]> }
/// impl.
export function object_lowercaseValues(object: { [x: key.any]: key.any }) { return map(object, key.toLower) }
export type object_lowercaseValues<T extends { [x: key.any]: key.any }> = never | { -readonly [K in keyof T]: key.toLower<T[K]> }

/** 
 * ### {@link object_capitalize `object.capitalize`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_capitalize<const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T as key.capitalize<K>]: T[K] }
export function object_capitalize<const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T as key.capitalize<K>]: T[K] }
export function object_capitalize<const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T as key.capitalize<K>]: T[K] }
/// impl.
export function object_capitalize(object: object.any) { return object_mapKeys(key.capitalize)(object) }
export type object_capitalize<T> = never | { -readonly [K in keyof T as key.capitalize<K>]: T[K] }

/**
 * ### {@link object_capitalizeValues `object.capitalizeValues`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * @example
 * const ex_01 = object.capitalizeValues({ abc: "abc", def: "def", ghi: "ghi" })
 * //       ^? const ex_01: { abc: "Abc", def: "Def", ghi: "Ghi" }
 * console.log(ex_01) // => { abc: "Abc", def: "Def", ghi: "Ghi" }
 *
 * const ex_02 = object.capitalizeValues(["abc", "def", "ghi"])
 * //       ^? const ex_02: ["Abc", "Def", "Ghi"]
 * console.log(ex_02) // => ["Abc", "Def", "Ghi"]
 */
export function object_capitalizeValues<const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.capitalize<T[K]> }
export function object_capitalizeValues<const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.capitalize<number & T[K]> }
export function object_capitalizeValues<const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.capitalize<number & T[K]> }
/// impl.
export function object_capitalizeValues(object: { [x: key.any]: key.any }) { return map(object, key.capitalize) }
export type object_capitalizeValues<T extends { [x: key.any]: key.any }> = never | { -readonly [K in keyof T]: key.capitalize<T[K]> }

/** 
 * ### {@link object_uncapitalize `object.uncapitalize`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export type object_uncapitalize<T> = never | { -readonly [K in keyof T as key.uncapitalize<K>]: T[K] }
export function object_uncapitalize<const T extends object.any>(object: T): { -readonly [K in keyof T as key.uncapitalize<K>]: T[K] }
/// impl.
export function object_uncapitalize<const T extends object.any>(object: T) { return object_mapKeys(key.uncapitalize)(object) }

/** 
 * ### {@link object_uncapitalizeValues `object.uncapitalizeValues`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * @example
 * const ex_01 = object.uncapitalizeValues({ abc: "Abc", def: "Def", ghi: "Ghi" })
 * //       ^? const ex_01: { abc: "abc", def: "def", ghi: "ghi" }
 * console.log(ex_01) // => { abc: "abc", def: "def", ghi: "ghi" }
 *
 * const ex_02 = object.uncapitalizeValues(["Abc", "Def", "Ghi"])
 * //       ^? const ex_02: ["abc", "def", "ghi"]
 * console.log(ex_02) // => ["abc", "def", "ghi"]
 */
export function object_uncapitalizeValues<const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.uncapitalize<T[K]> }
export function object_uncapitalizeValues<const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.uncapitalize<number & T[K]> }
export function object_uncapitalizeValues<const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.uncapitalize<T[K]> }
/// impl.
export function object_uncapitalizeValues(object: { [x: key.any]: key.any }) { return map(object, key.uncapitalize) }

/** 
 * ### {@link camel `object.camel`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * Converts an object's __keys__ to camel-case.
 * 
 * If you need to convert the object's __values__ to camel-case, use
 * {@link camel.values `object.camel.values`}.
 */
export function camel<const T extends object.any, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T as key.camel<K, _>]: T[K] }
export function camel<const T extends object.any>(object: T): { -readonly [K in keyof T as key.camel<K>]: T[K] }
/// impl.
export function camel(object: object.any, _ = "_") { return object_mapKeys((k) => key.camel(k, _))(object) }
export type camel<T, _ extends string = "_"> = never | { -readonly [K in keyof T as key.camel<K, _>]: T[K] }

/** 
 * ### {@link camel.values `object.camelValues`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __values__ to camel-case.
 * 
 * If you need to convert the object's __keys__ to camel-case, use
 * {@link camel `object.camel`}.
 */
camel.values = (
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
 * ### {@link pascal `object.pascal`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __keys__ to Pascal-case.
 * 
 * If you need to convert the object's __values__ to Pascal-case, use
 * {@link pascal.values `object.pascal.values`}.
 */
export function pascal<const T extends object.any, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T as key.pascal<K, _>]: T[K] }
export function pascal<const T extends object.any>(object: T): { -readonly [K in keyof T as key.pascal<K>]: T[K] }
export function pascal<const T extends object.any, _ extends string>(object: T, delimiter?: _): { -readonly [K in keyof T as key.pascal<K>]: T[K] }
/// impl.
export function pascal(object: object.any, _ = "_") { return object_mapKeys((k) => key.pascal(k, _))(object) }
export type pascal<T, _ extends string = "_"> = never | { -readonly [K in keyof T as key.pascal<K, _>]: T[K] }

/** 
 * ### {@link pascal.values `object.pascal.values`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __values__ to Pascal-case.
 * 
 * If you need to convert the object's __keys__ to Pascal-case, use
 * {@link pascal `object.pascal`}.
 */
pascal.values = (
  function(object: { [x: string]: key.any }, _ = "_") { return map(object, (v) => key.pascal(v, _)) }
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
 * ### {@link snake `object.snake`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __keys__ to snake-case.
 * 
 * If you need to convert the object's __values__ to snake-case, use
 * {@link snake.values `object.snake.values`}.
 */
export function snake<const T extends object.any, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T as key.snake<K, _>]: T[K] }
/// impl.
export function snake<const T extends object.any>(object: T): { -readonly [K in keyof T as key.snake<K>]: T[K] }
export function snake<const T extends object.any, _ extends string>(object: T, delimiter?: _): { -readonly [K in keyof T as key.snake<K, _>]: T[K] }
export function snake(object: object.any, _ = "_") { return object_mapKeys((k) => key.snake(k, _))(object) }
export type snake<T, _ extends string = "_"> = never | { -readonly [K in keyof T as key.snake<K, _>]: T[K] }


/** 
 * ### {@link snake.values `object.snake.values`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __values__ to snake-case.
 * 
 * If you need to convert the object's __keys__ to snake-case, use
 * {@link snake `object.snake`}.
 */
snake.values = (
  function(object: { [x: string]: key.any }, _ = "_") { return map(object, (v) => key.snake(v, _)) }
) as {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.snake<T[K]> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.snake<T[K] & number> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.snake<T[K]> }
  <const T extends { [x: string]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.snake<T[K], _> }
  <const T extends { [x: number]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.snake<T[K] & number, _> }
  <const T extends { [x: key.any]: key.any }, _ extends string>(object: T, delimiter: _): { -readonly [K in keyof T]: key.snake<T[K], _> }
}
export declare namespace snake {
  export type values<T extends { [x: key.any]: key.any }, _ extends string = "_"> = never | { -readonly [K in keyof T]: key.snake<T[K], _> }
}

/** 
 * ### {@link kebab `object.kebab`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __keys__ to kebab-case.
 * 
 * If you need to convert the object's __values__ to kebab-case, use
 * {@link kebab.values `object.kebab.values`}.
 */
export function kebab<const T extends object.any>(object: T): { -readonly [K in keyof T as key.kebab<K>]: T[K] }
/// impl.
export function kebab<const T extends object.any>(object: T) { return object_mapKeys(key.kebab)(object) }
export type kebab<T> = never | { -readonly [K in keyof T as key.kebab<K>]: T[K] }

/** 
 * ### {@link kebab.values `object.kebab.values`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __values__ to kebab-case.
 * 
 * If you need to convert the object's __keys__ to kebab-case, use
 * {@link kebab `object.kebab`}.
 */
kebab.values = (
  function(object: { [x: string]: key.any }) { return map(object, key.kebab) }
) as {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.kebab<T[K]> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.kebab<T[K] & number> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.kebab<T[K]> }
}
export declare namespace kebab {
  type values<T extends { [x: key.any]: key.any }> = never | { -readonly [K in keyof T]: key.kebab<T[K]> }
}

/** 
 * ### {@link titlecase `object.titlecase`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __keys__ to title-case.
 * 
 * If you need to convert the object's __values__ to title-case, use
 * {@link titlecase.values `object.titlecase.values`}.
 */
export function titlecase<const T extends object.any>(object: T): { -readonly [K in keyof T as key.titlecase<K>]: T[K] }
export function titlecase<
  const T extends object.any, 
  Del extends string, 
  Sep extends string
>(
  object: T, 
  options: key.titlecase.Options<Del, Sep>
): { -readonly [K in keyof T as key.titlecase<K, Del, Sep>]: T[K] }
export function titlecase<
  const T extends object.any, 
  Del extends string, 
  Sep extends string
>(
  object: T, 
  options?: key.titlecase.Options<Del, Sep>
): { -readonly [K in keyof T as key.titlecase<K, Del, Sep>]: T[K] }
/// impl.
export function titlecase(
  object: object.any, 
  options: key.titlecase.Options = key.titlecase.defaults
) {
  return object_mapKeys((k) => key.titlecase(k, options))(object) 
}
export type titlecase<T, Del extends string = " ", Sep extends string = " "> = never | { -readonly [K in keyof T as key.titlecase<K, Del, Sep>]: T[K] }

/** 
 * ### {@link titlecase.values `object.titlecase.values`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 *
 * Converts an object's __values__ to title-case.
 * 
 * If you need to convert the object's __keys__ to title-case, use
 * {@link titlecase `object.titlecase`}.
 */
titlecase.values = (
  function(object: { [x: string]: key.any }, options: key.titlecase.Options = key.titlecase.defaults) { return map(object, (v) => key.titlecase(v, options)) }
) as {
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

export type object_titlecaseValues<
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

/** 
 * ### {@link object_prefix `object.prefix`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_prefix<P extends prop.any>(add: P): <const T extends object.any>(object: T) => { -readonly [K in keyof T as key.prefix<K, P>]: T[K] }
/// impl.
export function object_prefix(add: prop.any) { return (object: object.any) => object_mapKeys(key.prefix(add))(object) }
export type object_prefix<T, P extends prop.any> = never | { -readonly [K in keyof T as key.prefix<K, P>]: T[K] }

/** 
 * ### {@link object_prefixValues `object.prefixValues`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_prefixValues<P extends prop.any>(add: P): {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.prefix<T[K], P> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.prefix<number & T[K], P> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.prefix<T[K], P> }
}
/// impl.
export function object_prefixValues(add: prop.any) { 
  return (object: { [x: key.any]: key.any }) => map(object, key.prefix(add)) 
}
export type object_prefixValues<T extends { [x: key.any]: key.any }, P extends prop.any> = never | { -readonly [K in keyof T]: key.prefix<T[K], P> }

/** 
 * ### {@link object_postfix `object.postfix`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_postfix<P extends prop.any>(add: P): <const T extends object.any>(object: T) => { -readonly [K in keyof T as key.postfix<K, P>]: T[K] }
/// impl.
export function object_postfix(add: prop.any) { return (object: object.any) => object_mapKeys(key.postfix(add))(object) }
export type object_postfix<T, P extends prop.any> = never | { -readonly [K in keyof T as key.postfix<K, P>]: T[K] }

/** 
 * ### {@link object_postfixValues `object.postfixValues`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_postfixValues<P extends prop.any>(add: P): {
 <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.postfix<T[K], P> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.postfix<number & T[K], P> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.postfix<T[K], P> }
}
/// impl.
export function object_postfixValues(add: prop.any) {
  return (object: { [x: key.any]: key.any }) => map(object, key.postfix(add))
}
export type object_postfixValues<T extends { [x: key.any]: key.any }, P extends prop.any> = never | { -readonly [K in keyof T]: key.postfix<T[K], P> }

/** 
 * ### {@link object_unprefix `object.unprefix`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_unprefix<Rm extends prop.any>(rm: Rm): <const T extends object.any>(object: T) => { -readonly [K in keyof T as key.unprefix<K, Rm>]: T[K] }
/// impl.
export function object_unprefix(rm: prop.any) { return (object: object.any) => object_mapKeys(key.unprefix(rm))(object) }
export type object_unprefix<T, Rm extends prop.any> = never | { -readonly [K in keyof T as key.unprefix<K, Rm>]: T[K] }

/** 
 * ### {@link object_unprefixValues `object.unprefixValues`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_unprefixValues<P extends prop.any>(add: P): {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.unprefix<T[K], P> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.unprefix<number & T[K], P> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.unprefix<T[K], P> }
}
/// impl.
export function object_unprefixValues(add: prop.any) {
  return (object: { [x: key.any]: key.any }) => map(object, key.unprefix(add))
}
export type object_unprefixValues<T extends { [x: key.any]: key.any }, P extends prop.any> = never | { -readonly [K in keyof T]: key.unprefix<T[K], P> }

/** 
 * ### {@link object_unpostfix `object.unpostfix`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_unpostfix<Rm extends prop.any>(rm: Rm): <const T extends object.any>(object: T) => { -readonly [K in keyof T as key.unpostfix<K, Rm>]: T[K] }
/// impl.
export function object_unpostfix(rm: prop.any) { return (object: object.any) => object_mapKeys(key.unpostfix(rm))(object) }
export type object_unpostfix<T, Rm extends prop.any> = never | { -readonly [K in keyof T as key.unpostfix<K, Rm>]: T[K] }

/** 
 * ### {@link object_unpostfixValues `object.unpostfixValues`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 */
export function object_unpostfixValues<P extends prop.any>(add: P): {
  <const T extends { [x: string]: key.any }>(object: T): { -readonly [K in keyof T]: key.unpostfix<T[K], P> }
  <const T extends { [x: number]: key.any }>(object: T): { -readonly [K in keyof T]: key.unpostfix<number & T[K], P> }
  <const T extends { [x: key.any]: key.any }>(object: T): { -readonly [K in keyof T]: key.unpostfix<T[K], P> }
}
/// impl.
export function object_unpostfixValues(add: prop.any) {
  return (object: { [x: key.any]: key.any }) => map(object, key.unpostfix(add))
}
export type object_unpostfixValues<T extends { [x: key.any]: key.any }, P extends prop.any> = never | { -readonly [K in keyof T]: key.unpostfix<T[K], P> }

/** 
 * ### {@link object_stringifyValues `object.stringifyValues`}
 * #### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 */
export function object_stringifyValues<const T extends object.of<any.showable>>(object: T): { -readonly [K in keyof T]: string }
/// impl.
export function object_stringifyValues<const T extends object.of<any.showable>>(object: T) { return map(toString)(object) }

/** @internal */
const object_intersect_defer
  : <const S extends object.any>(second: S) => <const F extends object.any>(first: F) => F & S
  = (second) => (first) => object_intersect(first, second)

/** 
 * ### {@link object_intersect `object.intersect`} 
 * #### ｛ {@link jsdoc.combining ` 🪢 `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 * 
 * Spread two objects together. The output type is the intersection of the objects.
 * 
 * See also:
 * - {@link object_intersect.defer `object.intersect.defer`}
 */
export function object_intersect<const L extends object.any, const R extends object.any>(left: L, right: R): Mutable<L> & Mutable<R> {
  return { ...left, ...right }
}
/** 
 * ### {@link object_intersect_defer `object.intersect.defer`} 
 * #### ｛ {@link jsdoc.combining ` 🪢 `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 * 
 * Curried variant of {@link object_intersect `object.intersect`}
 * 
 * See also:
 * - {@link object_intersect `object.intersect`}
 */
object_intersect.defer = object_intersect_defer

  
/**  
 * ### {@link object_fromEntries `object.fromEntries`}
 * #### ｛ {@link jsdoc.constructor ` 🏗️ `} ｝
 */
export const object_fromEntries: {
  <const T extends readonly [string, unknown]>(entries: readonly T[]): { [E in T as E[0]]: E[1] }
} = globalThis.Object.fromEntries

// export declare function object_fromEntries<const T extends readonly [string, unknown]>(entries: readonly T[]): { [E in T as E[0]]: E[1] }
// export function object_fromEntries<V, const T extends readonly (readonly [number, V])[]>(entries: T): object_fromEntries<T>
// export function object_fromEntries<V, const T extends readonly (readonly [number, V])[]>(entries: T) { return globalThis.Object.entries(entries) }
  // <const T extends readonly entry.any[]>(entries: T): object_fromEntries<T>
// } = globalThis.Object.fromEntries

export type object_fromEntries<T extends entries.any> = never | { [E in T[number] as E[0]]: E[1] }

type ofe = object_fromEntries<[flag: string, value: boolean][]>

/**  
 * ### {@link object_lookup `object.lookup`}
 * #### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 */
export const object_lookup
  : <const T extends object.any, K extends keyof T>(object: T) => (key: K) => T[K] 
  = (object) => (key) => object[key]

/**  
 * ### {@link object_fromPairs `object.fromPairs`}
 * #### ｛ {@link jsdoc.constructor ` 🏗 `} , {@link jsdoc.mapping ` 🌈‍ `} ｝
 */
export const object_fromPairs = fn.untupled(object_fromEntries)

/** 
 * ### {@link bind `object.bind`} 
 * #### ｛ {@link jsdoc.constructor ` 🏗 `} , {@link jsdoc.mapping ` 🌈‍ `} ｝
 */
export function bind<K extends keyof any>(key: K): <const V>(value: V) => K extends K ? { [k in K]: V } : never
/// impl.
export function bind<K extends key.any>(key: K) {
  return <const V>(value: V) => ({ [key]: value })
    // const object = globalThis.Object.create(null)
    // globalThis.Object.assign(
    //   {},
    //   { [key]: value },
    // )
}

/** 
 * ### {@link object_createLookup `object.createLookup`} 
 * #### ｛ {@link jsdoc.constructor ` 🏗 `} ｝
 */
export const object_createLookup
  : <const T extends object.any>(object: T) => <K extends keyof T>(key: K) => T[K] 
  = (object) => (key) => object[key]

/** 
 * ### {@link object_parseKey `object.parseKey`} 
 * #### ｛ {@link jsdoc.mapping ` 🌈‍ `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 */
export function object_parseKey<const T extends keyof any>(key: T): Universal.key<T>
export function object_parseKey(key: keyof any) {
  return (
    isSymbol(key) ? globalThis.String(key) 
    : isQuoted(key) ? escape(`${key}`)
    : isValidIdentifier(key) ? escape(`${key}`) : `"` + escape(`${key}`) + `"`
  )
}

/** 
 * ### {@link object_parseEntry `object.parseEntry`} 
 * #### ｛ {@link jsdoc.mapping ` 🌈‍ `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 */
export function object_parseEntry<const T extends readonly [key.any, any.primitive]>([k, v]: T): `${string}: ${string}`
export function object_parseEntry<const T extends readonly [prop.any, any.showable]>([k, v]: T): `${string}: ${string}`
export function object_parseEntry<const T extends readonly [prop.any, any.showable]>([k, v]: T) {
  return `${object_parseKey(k)}: ${globalThis.String(v)}`
}

/** @internal exported as a property on {@link object_get `object.get`} */
const object_get_defer
  : <const T extends object.any, K extends autocomplete<keyof T>>(key: K) => (object: T) => T[K]
  = (key) => (object) => object_get(object, key)

/** 
 * ### {@link object_get_defer `object.get.defer`} 
 * #### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 * 
 * Curried variant of {@link object_get `object.get`}
 * 
 * See also:
 * - {@link object_get `object.get`}
 */
object_get.defer = object_get_defer

/** 
 * ### {@link object_get `object.get`} 
 * #### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
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
 * ### {@link object_pluck_defer `object.pluck.defer`}
 * #### ｛ {@link jsdoc.destructor ` ⛓️‍💥 ` } , {@link jsdoc.mapping ` 🌈‍ `} ｝
 * 
 * Curried variant of {@link object_pluck `object.pluck`}.
 * 
 * See also:
 * - {@link object_pluck `object.pluck`}
 */
const object_pluck_defer
  : <const T extends { [x: number]: object.any }, K extends autocomplete<keyof T[keyOf<T>]>>(key: K) => (object: T) => object_pluck<T, K>
  = (key) => (object) => object_pluck(object, key)

void (object_pluck.defer = object_pluck_defer)

/**
 * ### {@link object_pluck `object.pluck`} 
 * #### ｛ {@link jsdoc.destructor ` ⛓️‍💥 ` } , {@link jsdoc.mapping ` 🌈‍ `} ｝
 * 
 * {@link object_pluck `object.pluck`} takes a key, and an object *or* an array
 * containing objects (or arrays) that are all indexed by that key, and 
 * "plucks" the value at that key in every child.
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
export function object_pluck<const T extends { [x: number]: object.any }, K extends autocomplete<keyof T[keyOf<T>]>>
  (object: T, key: K): object_pluck<T, K>
/// impl.
export function object_pluck<K extends autocomplete<keyof T[keyof T]>, const T extends object.of<object.any>>
  (object: T, key: K) { return map(object, (v) => v[key]) }

export type object_pluck<T, K extends keyof any> = never | { -readonly [ix in keyof T]: getOrUnknown<T[ix][K & keyof T[ix]]> }

/** 
 * ### {@link keys `object.keys`} 
 * #### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 * 
 * Like {@link globalThis.Object.keys `globalThis.Object.keys`} with better types.
 * 
 * By default {@link keys `object.keys`} does not return an object's symbol
 * properties. If you need to get the symbols from an object, pass 
 * `{ symbols: "keep" }` as the second argument.
 * 
 * See also: 
 * - {@link globalThis.Object.keys `globalThis.Object.keys`}
 * - {@link object_values `object.values`}
 * - {@link object_fromKeys `object.fromKeys`}
 * - {@link object_entries `object.entries`}
 */
export function keys<K extends prop.any>(object: { [P in K]: unknown }): (K & prop.any)[]
export function keys<const T extends { [x: number]: any }>(object: T, options?: keys.Options): (keyof T)[]
/// impl.
export function keys<const T extends object.any>(object: T, options: keys.Options = keys.defaults) {
  return options.symbols === "forget" ? globalThis.Object.keys(object) : keys.impl(object)
}

export type keys<T> 
  = [T] extends [finiteArray<T>]
  ? { -readonly [K in keyof T]: parseInt<K> } extends 
  infer KS extends any.keysOf<T> ? KS : never
  : (keyof T)[]


export declare namespace keys {
  interface Options extends globalThis.Partial<{
    symbols: "keep" | "forget"
  }> {}

  interface Config extends globalThis.Required<Options> {}
}
export namespace keys {
  export const defaults = {
    symbols: "forget",
  } satisfies Config
  export const impl = (object: { [x: number]: unknown }): key.nonnumber[] => {
    let out: (string | symbol)[] = globalThis.Object.keys(object) 
    const sym = symbols(object)
    for (let ix = 0; ix < symbols.length; ix++) out.push(sym[ix])
    return out
  }
}

/** 
 * ### {@link object_transform.defer `object.transform.defer`} 
 * #### ｛ {@link jsdoc.mapping ` 🌈‍ `} ｝
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
 * ### {@link object_transform `object.transform`}
 * #### ｛ {@link jsdoc.mapping ` 🌈‍ `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
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
    if (globalThis.Object.keys(transformers).length === 0) return object
    let out = getEmpty(object)
    for (const ix of keys(object, { symbols: "keep" }))
      out[ix] = object_isKeyOf(ix, transformers) ? transformers[ix](object[ix]) : object[ix]

    return out
  }

/** 
 * ### {@link object_entries `object.entries`} 
 * #### ｛ {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 * 
 * See also: 
 * - {@link globalThis.Object.entries `globalThis.Object.entries`}
 * - {@link object_keys `object.keys`}
 * - {@link object_values `object.values`}
 */
export function object_entries<const T>(object: T): object_entries<T>
/// impl.
export function object_entries<const T extends {}>(object: T) {
  const entries = globalThis.Object.entries(object)
  return globalThis.Array.isArray(object)
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

export declare namespace object_entries {
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
 * ### {@link object_some `object.some`} 
 * #### ｛ {@link jsdoc.combining ` 🪢 `} ｝
 */
export function object_some<V>(predicate: (value: V) => boolean): 
  <T extends { [x: string]: V } | { [x: number]: V }>(object: T) => boolean
/// impl.
export function object_some<V>(predicate: (value: V) => boolean) {
  return (object: { [x: prop.any]: V }) => {
    const keys = globalThis.Object.keys(object)
    for (let ix = 0; keys.length > ix; ix++) {
      const k = keys[ix]
      if (predicate(object[k])) return true
    }
    return false
  }
}

export type fromPaths<T extends fromPaths.Path> = fromPaths.loop<T>

export declare namespace fromPaths {
  interface Leaf<V = unknown> { readonly [symbol.Leaf]: URI.Leaf, value: V }
  type Path<V = unknown> = [prop.any[], V]
  type Paths<V = unknown> = Path<V>[]
  type Node = 
    | Leaf 
    | [prop.any[], Leaf][]

  type Nodes = { [x: string]: Node }

  type nextFrom<
    T extends fromPaths.Path, 
    U extends T 
    | T extends [nonempty.mut.path<any, infer V>, infer W] ? [V, W] : never
    = T extends [nonempty.mut.path<any, infer V>, infer W] ? [V, W] : never
  > = U

  type loop<T extends fromPaths.Path> 
    = never | [T] extends [[[], any]] ? T[1]
    : { -readonly [E in T as E[0][0]]: fromPaths.loop<fromPaths.nextFrom<E>> }

  type roundtrip<T extends [prop.any[], unknown]> 
    = never | [T] extends [[[], any]] ? Leaf<T[1]>
    : { -readonly [E in T as E[0][0]]: fromPaths.roundtrip<fromPaths.nextFrom<E>> }
}

/** 
 * ### {@link fromPaths `object.fromPaths`}
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * Dual of {@link toPaths `object.toPaths`}
 * See also:
 * - {@link toPaths `object.toPaths`}
 * - {@link fromPath `object.fromPath`}
 */

export function fromPaths<const T extends [path: prop.any[], leaf: unknown]>(paths: T[]): fromPaths<T> 
export function fromPaths<const T extends [path: prop.any[], leaf: unknown]>(paths: T[], opts: fromPaths.Options<{ roundtrip: true }>): fromPaths.roundtrip<T> 
export function fromPaths<const T extends [path: prop.any[], leaf: unknown]>(paths: T[], opts?: fromPaths.Options): fromPaths<T> 
export function fromPaths<const T extends [path: prop.any[], leaf: unknown]>(paths: T[], opts: fromPaths.Options = fromPaths.defaults) {
  const loop = fromPaths.loop(fromPaths.configFromOptions(opts))
  const marked = fromPaths.markAll(paths)
  return loop(marked)
}

export namespace fromPaths {
  type Partial<T> = never | { [K in keyof T]+?: T[K] }
  export interface Options<T extends Partial<Config> = Partial<Config>> extends newtype<T> {}
  export interface Config { roundtrip: boolean }
  export const defaults = { roundtrip: false } as const satisfies Config
  export function configFromOptions (opts: fromPaths.Options): fromPaths.Config
  export function configFromOptions (opts: fromPaths.Options) {
    return {
      ...fromPaths.defaults,
      ...opts,
    }
  }
  /**
   * ### {@link group `fromPaths.group`}
   * 
   * @example
   *  import * as vi from "vitest"
   *  import { object } from "@traversable/data"
   *  const { leaf } = object.fromPaths
   * 
   *  vi.assert.deepEqual(
   *    object.fromPaths.group([
   *      [ [ 'a', 0 ], leaf(null) ],
   *      [ [ 'b', 0, 0 ], leaf(100) ],
   *      [ [ 'b', 1 ], leaf(200) ],
   *      [ [ 'c', 'h', 0, 0, 0 ], leaf(300) ],
   *      [ [ 'c', 'h', 1, 0, 1 ], leaf(400) ],
   *      [ [ 'c', 'h', 2, 1, 'i' ], leaf(500) ],
   *      [ [ 'd' ], leaf([]) ],
   *      [ [ 'e' ], leaf({}) ],
   *      [ [ 'f' ], leaf(null) ],
   *      [ [ 'g' ], leaf(undefined) ]
   *    ]),
   *    {
   *      a: [ 
   *        [ [ 0 ], leaf(null) ],
   *      ],
   *      b: [ 
   *        [ [ 0, 0 ], leaf(100) ], 
   *        [ [ 1 ], leaf(200) ],
   *      ],
   *      c: [
   *        [ [ "h", 0, 0, 0 ], leaf(300) ],
   *        [ [ "h", 1, 0, 1 ], leaf(400) ],
   *        [ [ "h", 2, 1, "i" ], leaf(500) ],
   *      ],
   *      d: leaf([]),
   *      e: leaf({}),
   *      f: leaf(null),
   *      g: leaf(undefined),
   *    }
   *  )
   */
  // export function group(paths: [props.any, Leaf][]): Nodes
  // export function group(paths: [props.any, Leaf][])

  export function group(paths: [prop.any[], Leaf][]): Leaf[] | Nodes //Leaf[] | [(string | number)[], Leaf][][]
  export function group(paths: [prop.any[], Leaf][]) {
    function reducer(prev: { [x: keyof any]: unknown }, [path, leaf]: [prop.any[], Leaf]) {
      switch (true) {
        case path.length === 0: return prev
        case path.length === 1: return (prev[path[0]] = leaf, prev)
        default: {
          const [k, ...ks] = path
          const v = prev[k]
          if (globalThis.Array.isArray(v)) return (v.push([ks, leaf]), prev)
          else return (prev[k] = [[ks, leaf]], prev)
        }
      }
    }
    return paths.reduce(
      reducer,
      (isGroupedArray(paths) ? [] : {}) as { [x: number]: unknown }
    )
  }
  group.init = (): { [x: string]: unknown } => ({})

  /**
   * ### {@link isLeaf `fromPaths.isLeaf`}
   */
  export const isLeaf = <T>(u: unknown): u is Leaf<T> => 
    isRecord(u) && symbol.Leaf in u && u[symbol.Leaf] === URI.Leaf

  const pathsAllHaveNumericKeys
    : (pairs: [(keyof any)[], unknown][]) => pairs is [[number, ...prop.any[]], unknown][]
    = (pairs): pairs is never => pairs.every(([k]) => k && typeof k[0] === "number")

  /** 
   * ### {@link isContiguous `object.fromPaths.isContiguous`}
   * @example
   *  const inputs = {
   *    PASS: [ 
   *      //   🡳🡳 this column determines contiguity
   *      [ [ [ 0 ],       "" ],   // ✅ 0, 1, 2 is contiguous 
   *        [ [ 1, "a" ],  "" ],   // becomes `[ "", { a: "" }, { b: { c: "" } } ]`
   *        [ [ 2, "b" ],  "" ] ], 
   *      [ [ [ 0, 0 ],    "" ],   // ✅ 0, 0, 1 is contiguous
   *        [ [ 0, 1 ],    "" ],   // becomes `[ [ "", "" ], "" ]`
   *        [ [ 1, 0 ],    "" ] ],
   *      [ [ [ 0, 0 ],    "" ],   // ✅ 0, 1, 2, 3 is contiguous
   *        [ [ 1, 0 ],    "" ],   // becomes `[ [ "" ], [ [ "", [ "" ] ] ], [ "" ] ]`
   *        [ [ 2, 0, 0 ], "" ],
   *        [ [ 3, 1, 0 ], "" ] ],
   *    ],
   *    FAIL: [
   *      [ [ [ 0 ],       "" ],    // 🚫 0, 2, 3 is not contiguous
   *        [ [ 2 ],       "" ],    // becomes `{ 0: "", 2: "", 3: "" }`
   *        [ [ 3 ],       "" ] ],
   *      [ [ [ 0 ],       "" ],    // 🚫 0, 1, "a" is not contiguous
   *        [ [ 1 ],       "" ],    // becomes `{ 0: "", 1: "", a: "" }`
   *        [ ["a"],       "" ] ], *    ] *  } *
   *  vi.assert.isTrue(inputs.PASS.every(object.fromPaths.isContiguous))
   *  vi.assert.isFalse(inputs.FAIL.every(object.fromPaths.isContiguous))
   */
  export const isContiguous 
    : (pairs: [(keyof any)[], unknown][]) => boolean
    = (pairs) => 
      pathsAllHaveNumericKeys(pairs) 
      && checkContiguous(...pairs.map(getZeroZero))
    
  const getZeroZero 
    : <T>(xss: readonly [[T, ...any], ...any]) => T
    = (xss) => xss[0][0]

  const ascending = (x: number, y: number) => x > y ? 1 : y > x ? -1 : 0
  export const checkContiguous 
    : (...unsorted: number[]) => boolean
    = (...unsorted) => {
      const todo = unsorted.sort(ascending)
      let prev = 0
      let next: number | undefined
      while ((next = todo.shift()) !== undefined) {
        if (next === prev || next === ++prev) continue
        else return false
      }
      return true
    }

  export const isPathArray = <K extends (keyof any)[], V>(u: unknown): u is [K, V][] => 
    isArray(u)
    && u.every(isArray) 

  export const isGroupedArray = (u: unknown): u is [path: prop.any[], leaf: unknown][] =>
    isPathArray(u) 
    && isContiguous(u)

  /**
   * ### {@link wrap `fromPaths.wrap`}
   * Dual of {@link unwrap `fromPaths.unwrap`}
   */
  export const wrap
    : <const T>(value: T) => Leaf<T>
    = (value) => ({ [symbol.Leaf]: URI.Leaf, value })
  /**
   * ### {@link unwrap `fromPaths.unwrap`}
   * Dual of {@link wrap `fromPaths.wrap`}
   */
  export const unwrap 
    : <T>(leaf: Leaf<T>) => T
    = (leaf) => leaf.value
  /**
   * ### {@link markOne `fromPaths.markOne`}
   * Dual of {@link unmarkOne `fromPaths.unmarkOne`}
   */
  export const markOne
    : <V>(pair: [prop.any[], V]) => [prop.any[], Leaf<V>]
    = (pair) => [pair[0], wrap(pair[1])] as const
  export type markOne<T extends [prop.any[], unknown]> = never | [Mutable<T[0]>, Leaf<T[1]>]
  /**
   * ### {@link unmarkOne `fromPaths.unmarkOne`}
   * Dual of {@link markOne `fromPaths.markOne`}
   */
  export const unmarkOne
    : <V>(pair: [prop.any[], Leaf<V>]) => [prop.any[], V]
    = (pair) => [pair[0], unwrap(pair[1])]
  export type unmarkOne<T extends [prop.any[], Leaf]> = never | [T[0], T[1]["value"]]
  /**
   * ### {@link markAll `fromPaths.markAll`}
   * Dual of {@link unmarkAll `fromPaths.unmarkAll`}
   */
  export function markAll<const T extends [prop.any[], unknown][]>(pairs: T): fromPaths.markAll<T>
  export function markAll(pairs: [prop.any[], unknown][]) { return pairs.map(markOne) }
  export type markAll<T extends [prop.any[], unknown][]> = never | { -readonly [x in keyof T]: fromPaths.markOne<T[x]> }
  /**
   * ### {@link unmarkAll `fromPaths.unmarkAll`}
   * Dual of {@link markAll `fromPaths.markAll`}
   */
  export function unmarkAll<const T extends [prop.any[], Leaf][]>(pairs: T): fromPaths.unmarkAll<T>
  export function unmarkAll(pairs: [prop.any[], Leaf][]) { return pairs.map(unmarkOne) }
  export type unmarkAll<T extends [prop.any[], Leaf][]> = never | { -readonly [x in keyof T]: fromPaths.unmarkOne<T[x]> }

  /**
   * ### {@link loop `object.fromPaths.loop`}
   * 
   * Where recursion happens.
   * 
   * {@link loop `object.fromPaths.loop`} is responsible for 
   * {@link group `grouping`} the {@link markAll `marked`}
   * paths together, then, mapping over the record's values.
   * If it encounters a {@link Leaf `Leaf`}, it returns the leaf's
   * value, otherwise it recurses.
   * 
   * The real trick to getting {@link fromPaths `object.fromPaths`}
   * to work was to handle the basecase _inside_ the mapping function.
   * 
   * My intuition tells me that there's probably a more elegant 
   * breadth-first solution, but I'm satisfied with this algorithm
   * as-is for now.
   */
  export const loop = (opts: fromPaths.Config) => {
    return fn.loop<
      [prop.any[], Leaf][], // [prop.any[], Leaf][],
       unknown[] | object.any
    >((paths, loop) => {
      return fn.pipe(
        paths,
        fromPaths.group,
        map((v) => isLeaf(v) ? opts.roundtrip ? v : v.value : loop(v as never))
      )
    })
  }
}

/** 
 * ### {@link toPaths `object.toPaths`}
 * #### {@link jsdoc.mapping ` 🌈 ` } ｝
 * 
 * Dual of {@link fromPaths `object.fromPaths`}
 * See also:
 * - {@link fromPaths `object.fromPaths`}
 */
export function toPaths<const T extends any.json>(json: T): [path: prop.any[], leaf: unknown][] 
export function toPaths<const T>(json: T, opts: toPaths.Options & { roundtrip: true }): [path: prop.any[], leaf: unknown][] 
export function toPaths<const T extends any.json>(json: T, opts?: toPaths.Options): [path: prop.any[], leaf: unknown][] 
export function toPaths<const T extends any.json>(json: T, opts: toPaths.Options = toPaths.defaults) { 
  const config = toPaths.configFromOptions(opts)

  return toPaths.isBaseCase(json, config) 
    ? toPaths.done(json, config) 
    : toPaths.go(config)(json)
}

export declare namespace toPaths {
  type Path<T = any.json> = readonly [path: prop.any[], leaf: T]
  type Paths<T = any.json> = readonly Path<T>[]
  type Stream<T = any.json> = { prev: props.any, next: T }
  type BaseCase = undefined | null | any.json.scalar | []
}
export namespace toPaths {
  export interface Options { roundtrip?: boolean }
  export interface Config extends globalThis.Required<Options> {}
  export const defaults = { roundtrip: false } satisfies toPaths.Config
  export const configFromOptions 
    : (opts: toPaths.Options) => toPaths.Config
    = (opts) => ({ ...toPaths.defaults, ...opts })

  export function done<T extends any.json>(json: T, config: toPaths.Config & { roundtrip: true }): [path: props.any, leaf: T][]
  export function done<T extends any.json>(json: T, config: toPaths.Config): [path: props.any, leaf: T][]
  export function done<T extends any.json>(json: T, config: toPaths.Config) { return config.roundtrip ? json : [[[], json]] }

  export const isLeaf = (u: any.json, config: toPaths.Config) =>
    config.roundtrip 
    ? fromPaths.isLeaf(u) 
    : isPrimitive(u)

  export const isEmpty = (u: any.json) =>
    isNonPrimitiveObject(u) 
    && globalThis.Object.values(u).length === 0

  export const isBaseCase = (u: any.json, config: toPaths.Config): u is toPaths.BaseCase => 
    toPaths.isLeaf(u, config)
    || toPaths.isEmpty(u)

  export const isPath = (u: any.json): u is toPaths.Path => isArray(u) && u.length === 2 && isProps(u[0])
  export const isPaths = (u: any.json): u is toPaths.Paths => isArray(u) && u.every(isPath)

  export const loop = (config: toPaths.Config) => fn.loop<toPaths.Stream, toPaths.Stream | toPaths.Stream[]>
    (({ prev, next }, loop) => {
      switch (true) {
        case toPaths.isBaseCase(next, config): return { prev, next }
        case isArray(next): return next.flatMap(
          fn.flow(
            (x, ix) => ({ prev: [...prev, ix], next: x }),
            loop,
          )
        )
        case isRecord(next): return globalThis.Object.keys(next).flatMap(
          fn.flow(
            (k) => ({ prev: [...prev, k], next: next[k] }),
            loop,
          )
        )
        default: throw fn.exhaustive<never>(next)
      }
    })

  /** 
   * ### {@link impl `object.toPaths.go`} 
   * 
   * {@link impl `object.toPaths.go`} is responsible for wiring up the recursive
   * call ({@link loop `object.toPaths.loop`}), and destructing the intermediate
   * representation into the final output type.
   */
  export function go(config: toPaths.Config): <const T extends any.json>(json: T) => [path: props.any, leaf: T][]
  export function go(config: toPaths.Config) {
    return <const T extends any.json>(json: T) => fn.pipe(
      json,
      empty,
      toPaths.loop(config),
      (xs) => isArray(xs) ? xs.map(destruct(config)) : destruct(config)(xs),
    )
  }

  /** 
   * ### {@link construct `object.toPaths.construct`} 
   * Dual of {@link destruct `object.toPaths.destruct`}
   */
  export const construct = <T extends any.json>([prev, next]: [props.any, next: T]) => ({ prev, next })
  /** 
   * ### {@link destruct `object.toPaths.destruct`} 
   * Dual of {@link construct `object.toPaths.construct`}
   */
  export function destruct(config: toPaths.Config & { roundTrip: true }): <V>(stream: toPaths.Stream<fromPaths.Leaf<V>>) => [props.any, V]
  export function destruct(config: toPaths.Config & { roundTrip: false }): <V>(stream: toPaths.Stream<V>) => readonly [props.any, V]
  export function destruct(config: toPaths.Config): <V>(stream: toPaths.Stream<V | fromPaths.Leaf<V>>) => readonly [props.any, V]
  export function destruct(config: toPaths.Config) { 
    return <V>({ prev, next }: toPaths.Stream<V | fromPaths.Leaf<V>>) => {
      return [
        prev, 
        fromPaths.isLeaf(next) 
          ? config.roundtrip ? fromPaths.unwrap(next) 
          : next
        : next
      ] as [props.any, V]
    }
  }

  /** 
   * ### {@link empty `object.toPaths.empty`} 
   * Greatest lower bound of {@link construct `object.toPaths`}
   */
  export const empty = <T extends any.json>(init: T) => construct([[], init])
}

// declare function get<const KS extends props.any>(...path: [...KS]): <const T extends has<[...KS]>>(object: T) => get<T, [...KS]>
// declare function get<const T extends [string] extends [T] ? never : [number] extends [T] ? never : unknown>(object: T): {
//   (...path: []): T
//   <K0 extends keyof T>(...path: [K0]): T[K0]
//   <
//     K0 extends keyof T, 
//     K1 extends keyof T[K0]
//   >(...[k_0, k_1]: [K0, K1]): T[K0][K1]
//   <
//     K0 extends keyof T, 
//     K1 extends keyof T[K0], 
//     K2 extends keyof T[K0][K1],
//   >(...[k_0, k_1, k_2]: [K0, K1, K2]): 
//     T[K0][K1][K2]
//   <
//     K0 extends keyof T, 
//     K1 extends keyof T[K0], 
//     K2 extends keyof T[K0][K1],
//     K3 extends keyof T[K0][K1][K2],
//   >(...[k_0, k_1, k_2, k_3]: [K0, K1, K2, K3]): 
//     T[K0][K1][K2][K3]
//   <
//     K0 extends keyof T, 
//     K1 extends keyof T[K0], 
//     K2 extends keyof T[K0][K1],
//     K3 extends keyof T[K0][K1][K2],
//     K4 extends keyof T[K0][K1][K2][K3],
//   >(...[k_0, k_1, k_2, k_3, k_4]: [K0, K1, K2, K3, K4]): 
//     T[K0][K1][K2][K3][K4]
//   <
//     K0 extends keyof T, 
//     K1 extends keyof T[K0], 
//     K2 extends keyof T[K0][K1],
//     K3 extends keyof T[K0][K1][K2],
//     K4 extends keyof T[K0][K1][K2][K3],
//     K5 extends keyof T[K0][K1][K2][K3][K4],
//   >(...[k_0, k_1, k_2, k_3, k_4, k_5]: [K0, K1, K2, K3, K4, K5]): 
//     T[K0][K1][K2][K3][K4][K5]
//   <
//     K0 extends keyof T, 
//     K1 extends keyof T[K0], 
//     K2 extends keyof T[K0][K1],
//     K3 extends keyof T[K0][K1][K2],
//     K4 extends keyof T[K0][K1][K2][K3],
//     K5 extends keyof T[K0][K1][K2][K3][K4],
//     K6 extends keyof T[K0][K1][K2][K3][K4][K5],
//   >(...[k_0, k_1, k_2, k_3, k_4, k_5, k_6]: [K0, K1, K2, K3, K4, K5, K6]): 
//     T[K0][K1][K2][K3][K4][K5][K6]
//   <
//     K0 extends keyof T, 
//     K1 extends keyof T[K0], 
//     K2 extends keyof T[K0][K1],
//     K3 extends keyof T[K0][K1][K2],
//     K4 extends keyof T[K0][K1][K2][K3],
//     K5 extends keyof T[K0][K1][K2][K3][K4],
//     K6 extends keyof T[K0][K1][K2][K3][K4][K5],
//     K7 extends keyof T[K0][K1][K2][K3][K4][K5][K6],
//   >(...[k_0, k_1, k_2, k_3, k_4, k_5, k_6, k_7]: [K0, K1, K2, K3, K4, K5, K6, K7]): 
//     T[K0][K1][K2][K3][K4][K5][K6][K7]
//   <
//     K0 extends keyof T, 
//     K1 extends keyof T[K0], 
//     K2 extends keyof T[K0][K1],
//     K3 extends keyof T[K0][K1][K2],
//     K4 extends keyof T[K0][K1][K2][K3],
//     K5 extends keyof T[K0][K1][K2][K3][K4],
//     K6 extends keyof T[K0][K1][K2][K3][K4][K5],
//     K7 extends keyof T[K0][K1][K2][K3][K4][K5][K6],
//     K8 extends keyof T[K0][K1][K2][K3][K4][K5][K6][K7],
//   >(...[k_0, k_1, k_2, k_3, k_4, k_5, k_6, k_7, k_8]: [K0, K1, K2, K3, K4, K5, K6, K7, K8]): 
//     T[K0][K1][K2][K3][K4][K5][K6][K7][K8]
//   <
//     K0 extends keyof T, 
//     K1 extends keyof T[K0], 
//     K2 extends keyof T[K0][K1],
//     K3 extends keyof T[K0][K1][K2],
//     K4 extends keyof T[K0][K1][K2][K3],
//     K5 extends keyof T[K0][K1][K2][K3][K4],
//     K6 extends keyof T[K0][K1][K2][K3][K4][K5],
//     K7 extends keyof T[K0][K1][K2][K3][K4][K5][K6],
//     K8 extends keyof T[K0][K1][K2][K3][K4][K5][K6][K7],
//     K9 extends keyof T[K0][K1][K2][K3][K4][K5][K6][K7][K8],
//   >(...[k_0, k_1, k_2, k_3, k_4, k_5, k_6, k_7, k_8, k_9]: [K0, K1, K2, K3, K4, K5, K6, K7, K8, K9]): 
//     T[K0][K1][K2][K3][K4][K5][K6][K7][K8][K9]
// }


// type get<T, KS extends (prop.any)[]>
//   = [KS] extends [nonempty.array<infer K extends keyof T, infer Todo extends prop.any[]>] ? get<T[K], Todo> : T


// const nxt = get({ a: { b: [1] }, c: 1, d: { e: { f: 3, g: 4 }} })

// const ex_01 = nxt("a")
// const ex_02 = nxt("d", "e", "f")
// const ex_03 = get("a", "b")
// const ex_04 = get("a")
// type ex_04 = has<["a"]>

// nxt("c")

// type 
  // = T extends nonempty.pathLeft<infer Todo, infer Last>
  // ? GO<[Todo, 
  // ;



// class PathCodec {
//   static toPaths<const T extends object.any>(object: T): toPaths<T> {
//     return toPaths(object)
//   }
// }

/** 
 * ### {@link object_flatten `object.flatten`} 
 * #### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * @example
 *  import { object } from "@traversable/data"
 *  import * as vi from "vitest"
 * 
 *  const ex_01 = object.flatten({ 
 *    a: 1, 
 *    b: { 
 *      c: [{ d: 2, e: 3 }, { f: 4 }], 
 *      g: 5 
 *    }, 
 *    h: [6], 
 *    i: { j: { k: 7 } } 
 *  })
 *
 *  vi.assert.deepEqual(
 *    ex_01,
 *    {
 *      "a": 1,
 *      "b.c.0.d": 2,
 *      "b.c.0.e": 3,
 *      "b.c.1.f": 4,
 *      "b.g": 5,
 *      "h.0": 6,
 *      "i.j.k": 7,
 *    }
 *  )
 */
export function object_flatten<const T extends object.any>(object: T) {
  const loop = fn.loop<object_flatten.entry, object_flatten.entries>(
    ([path, value], loop) => {
      if (isPrimitive(value)) return [path, value] as const
      else if (value !== null && typeof value === "object" )
        return object_entries(value).flatMap(([k, next]) => loop([`${path}.${k}`, next] as const))
      else throw [`\`object.flatten\` encountered a value it didn't know how to parse at path ${path}, got:`, value]
    }
  )
  return globalThis.Object.fromEntries(globalThis.Object.entries(object).map(loop))
}

export type object_flatten<T> = object_flatten.loop<T, "">
export declare namespace object_flatten {
  type entry = readonly [key: string, value: unknown]
  type entries = readonly [path: string, leaf: any.primitive] | readonly (readonly [path: string, leaf: any.primitive])[]
  type loop<T, P extends string>
    = T extends any.primitive ? [path: P, leaf: T]
    : T extends array.any 
    ? (
      globalThis.Exclude<keyof T & string, "length"> extends infer K 
      ? K extends keyof T & string
      ? `${P extends "" ? "" : `${P}.`}${K}` extends infer Q 
      ? [Q] extends [string] ? object_flatten.loop<T[K], Q> : never : never
      : never
      : never
    )
    : (keyof T & string) extends infer K 
    ? K extends (keyof T & string)
    ? `${P extends "" ? "" : `${P}.`}${K}` extends infer Q 
    ? [Q] extends [string] ? object_flatten.loop<T[K], Q> : never : never
    : never
    : never
    ;
}

/**
 * ### {@link object_serialize `object.serialize`} 
 * #### ｛ {@link jsdoc.destructor ` ⛓️‍💥 `} ｝
 */
export function object_serialize<const T extends object.any>(
  object: T, 
  options?: object_serialize.options
): string { 
  return isFlat(object)
    ? object_serialize.flat(object, object_serialize.configFromOptions(options))
    : object_serialize.recursive(object, object_serialize.configFromOptions(options)) 
}

export namespace object_serialize {
  export type options = 
    | { mode: "pretty" | "minify", indentBy?: number, delimiter?: string }
    | { indentBy?: number, delimiter?: string, mode?: never }
  export type config = {
    indentBy: number
    delimiter: string
    mode: undefined | "minify"
  }

  /** @internal */
  const pretty = { indentBy: 2, delimiter: "\n", mode: undefined } as const
  /** @internal */
  const minify = { indentBy: 0, delimiter: "", mode: "minify" } as const

  export const configFromOptions 
    : (options?: object_serialize.options) => object_serialize.config
    = (options) => options === undefined ? pretty
      : "mode" in options
        ? options.mode === "pretty" ? pretty
        : minify
      : { indentBy: options.indentBy ?? 2, delimiter: options.delimiter ?? "\n", mode: undefined }

  /** @internal */
  const pad 
    : (indent: number, fill?: string) => string
    = (indent, fill = " ") => {
      if(indent <= 0) return ""
      let todo = indent
      let out = ""
      while((todo--) > 0) out = out.concat(fill)
      return out
    }

  export const show 
    : (value: any.showable) => string
    = (value) => typeof value === "string" ? `"${value}"` : `${value}`

  export const flat = (value: object.of<any.showable>, { delimiter, indentBy, mode }: object_serialize.config) => {
    const keys = globalThis.Object.keys(value)
    const __ = mode === "minify" ? "" : " "
    return fn.pipe(
      keys.reduce(
        (acc, k) => `${acc.length === 0 ? "" : `${acc},${__}`}${object_parseKey(k)}:${__}${show(value[k as never])}`, 
        ``,
      ),
      (s) => `{${delimiter}${pad(indentBy)}${s}${pad(indentBy)}${delimiter}}`
    )
  }

  export const recursive = (object: any.json, { indentBy, delimiter, mode }: object_serialize.config): string => {
    let seen = new globalThis.WeakSet()
    const __ = mode === "minify" ? "" : " "

    const go = fn.loop<[node: any.json | fn.any, indent: number], string>(
      ([next, indent], loop) => {
        if(object_is(next)) {
          if(seen.has(next)) return `[Circular ${typeof next}]`
          else seen.add(next)
        }

        switch(true) {
          case isSymbol(next): return globalThis.String(next)
          case isString(next): return `"${next}"`
          case isBigInt(next): return `${next}n`
          case isShowable(next): return `${next}`
          case isFunction(next): return `[Function ${next.name === '' ? '(anonymous)' : next.name}]`
          case isArray(next): return fn.pipe(
            next,
            map((x) => loop([x, indent + indentBy])),
            (xs) => xs.length === 0 ? "[]" : xs.join(`,${delimiter}${pad(indent)}`),
            (s) => `[${delimiter}${pad(indent)}${s}${delimiter}${pad(indent - indentBy)}]`
          )
          case object_is(next): return fn.pipe(
            next,
            map((x) => loop([x, indent + indentBy])),
            globalThis.Object.entries,
            (xs) => xs.length === 0 ? "{}" : fn.pipe(
              xs,
              map(([k, v]) => `${object_parseKey(k)}:${__}${globalThis.String(v)}`),
              (xs) => xs.join(`,${delimiter}${pad(indent)}`),
              (x) => `{${delimiter}${pad(indent)}${x}${delimiter}${pad(indent - indentBy)}}`,
            ),
          )
          default: return fn.exhaustive(next)
        }
      })

    return go([object, indentBy])
  }
}

/** 
 * ### {@link filterKeys `object.filterKeys`}
 * #### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } ｝
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
export function filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: string) => k is K & typeof k): object_pick<T, keyof T & K>
export function filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: number) => k is K & typeof k): object_pick<T, keyof T & K>
export function filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: symbol) => k is K & typeof k): object_pick<T, keyof T & K>
export function filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: key.nonsymbol) => k is K & typeof k): object_pick<T, keyof T & K>
export function filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: key.nonnumber) => k is K & typeof k): object_pick<T, keyof T & K>
export function filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: key.nonstring) => k is K & typeof k): object_pick<T, keyof T & K>
export function filterKeys<const T extends object.any, K extends key.any>(object: T, guard: (k: key.any) => k is K): object_pick<T, keyof T & K>
export function filterKeys<const T extends object.any>(object: T, predicate: some.predicate<string>): { -readonly [K in keyof T]+?: T[K] }
export function filterKeys<const T extends object.any>(object: T, predicate: some.predicate<number>): { -readonly [K in keyof T]+?: T[K] }
export function filterKeys<const T extends object.any>(object: T, predicate: some.predicate<symbol>): { -readonly [K in keyof T]+?: T[K] }
export function filterKeys<const T extends object.any>(object: T, predicate: some.predicate<key.nonsymbol>): { -readonly [K in keyof T]+?: T[K] }
export function filterKeys<const T extends object.any>(object: T, predicate: some.predicate<key.nonnumber>): { -readonly [K in keyof T]+?: T[K] }
export function filterKeys<const T extends object.any>(object: T, predicate: some.predicate<key.nonstring>): { -readonly [K in keyof T]+?: T[K] }
export function filterKeys<const T extends object.any>(object: T, predicate: some.predicate<key.any>): { -readonly [K in keyof T]+?: T[K] }
/// impl.
export function filterKeys(
  object: object.any, predicate: (key: any) => boolean
) {
  const total = globalThis.Object.keys(object).length
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

void (filterKeys.defer = filterKeys_defer);

/** 
 * ### {@link filterKeys_defer `object.filterKeys.defer`}
 * #### ｛ {@link jsdoc.filtering ` ️⏳‍ ` } ｝
 * 
 * Curried variant of {@link filterKeys `object.filterKeys`}
 * 
 * See also:
 * - {@link filterKeys `object.filterKeys`}
 */
function filterKeys_defer<const T extends object.any, K extends key.any> (guard: (k: key.any) => k is K): (object: T) => object_pick<T, keyof T & K>
function filterKeys_defer<const T extends object.any, K extends key.any> (guard: (k: string) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
function filterKeys_defer<const T extends object.any, K extends key.any> (guard: (k: number) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
function filterKeys_defer<const T extends object.any, K extends key.any> (guard: (k: symbol) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
function filterKeys_defer<const T extends object.any, K extends key.any> (guard: (k: key.nonsymbol) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
function filterKeys_defer<const T extends object.any, K extends key.any> (guard: (k: key.nonnumber) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
function filterKeys_defer<const T extends object.any, K extends key.any> (guard: (k: key.nonstring) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
function filterKeys_defer<const T extends object.any, K extends key.any> (guard: (k: key.any) => k is K & typeof k): (object: T) => object_pick<T, keyof T & K>
function filterKeys_defer<const T extends object.any> (predicate: some.predicate<string>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
function filterKeys_defer<const T extends object.any> (predicate: some.predicate<number>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
function filterKeys_defer<const T extends object.any> (predicate: some.predicate<symbol>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
function filterKeys_defer<const T extends object.any> (predicate: some.predicate<key.nonsymbol>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
function filterKeys_defer<const T extends object.any> (predicate: some.predicate<key.nonnumber>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
function filterKeys_defer<const T extends object.any> (predicate: some.predicate<key.nonstring>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
function filterKeys_defer<const T extends object.any> (predicate: some.predicate<keyof any>): (object: T) => { -readonly [K in keyof T]+?: T[K] }
/// impl.
function filterKeys_defer(predicate: some.predicate<any>) {
  return (object: object.any) => filterKeys(object, predicate)
}
