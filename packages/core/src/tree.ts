import type { inline, newtype, some } from "any-ts";

import type { any, array, key, nonempty, prop, unicode } from "@traversable/data"
import { Option, fn, keys, map, object, props } from "@traversable/data"

import { Invariant, URI, _, symbol,   } from "@traversable/registry";
import type { Force, Omit } from "@traversable/registry"
import type { Json } from "./json.js"

declare namespace Predicate {
  export { Any as any }
  export type Any = never | { (u: any): u is unknown }
}

/** @internal */
declare namespace Inductive {
  type stringIndex<T> = T | { [x: string]: Inductive.stringIndex<T> }
}
/** @internal */
const isComposite = object.isComposite
/** @internal */
const Object_values = globalThis.Object.values
/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const nonNullable 
  : <T>(u: T) => u is globalThis.Exclude<T, null | undefined>
  = (u): u is never => !u == null
/** @internal */
const Array_isArray 
  : (u: unknown) => u is any[]
  = globalThis.Array.isArray
const isJsonArray
  : (u: unknown) => u is readonly Json[]
  = globalThis.Array.isArray
const isJsonObject
  : (u: unknown) => u is Json.object
  = object.isComposite
/** @internal */
const isPrimitive = (u: unknown): u is null | undefined | boolean | number | string | bigint | symbol => 
  u == null 
  || typeof u === "boolean"
  || typeof u === "number"
  || typeof u === "string"
  || typeof u === "bigint"
  || typeof u === "symbol"

/** 
 * @internal 
 * 
 * This is the runtime implementation for accessing a
 * deeply nested property. It is optimized for performance
 * (although there's still a bit of juice we could squeeze
 * out of it).
 * 
 * It is used internally by:
 * 
 * - {@link get `tree.get`}
 * - {@link get_defer `tree.get.defer`}
 * - {@link has `tree.has`}
 * - {@link mutate `tree.mutate`} (as a transitive dependency)
 * - {@link set `tree.set`} (alias for `tree.mutate`)
 */
function get_(x: unknown, ks: [...keys.any]) {
  let out = x
  let k: key.any | undefined
  while ((k = ks.shift()) !== undefined) {
    if (hasOwn(out, k)) void (out = out[k])
    else if (k === "") continue
    else return symbol.not_found
  }
  return out
}

/** 
 * ## {@link hasOwn `tree.hasOwn`}
 * 
 * This predicate polyfills 
 * {@link globalThis.Object.hasOwn `Object.hasOwn`}. 
 * 
 * Also acts as a type-guard, which means that if 
 * {@link hasOwn `tree.hasOwn`} returns true, the type system
 * will now track that information.
 */
export function hasOwn<K extends key.any>(u: unknown, key: K): 
  // TODO: see if you can get distribution of K to work again
  // u is K extends K ? { [P in K]: unknown } : never
  u is { [P in K]: unknown }
/// impl.
export function hasOwn(
  u: unknown, 
  key: key.any
): u is { [x: string]: unknown } {
  return typeof key === "symbol" 
    ? isComposite(u) && key in u 
    : Object.hasOwn(u ?? {}, key)
}

/** 
 * ## {@link get `tree.get`}
 * 
 * Get a deeply nested value from a data structure.
 * 
 * When your use case requires accessing arbitrarily nested
 * properties _programmatically_, {@link get `tree.get`}
 * is a great fit.
 * 
 * For a variant that is data-last (supports partial application),
 * use {@link get_defer `tree.get.defer`}.
 * 
 * See also:
 * - {@link get_defer `tree.get.defer`}
 */
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<T[K0]>,
  K2 extends some.keyof<T[K0][K1]>,
  K3 extends some.keyof<T[K0][K1][K2]>,
  K4 extends some.keyof<T[K0][K1][K2][K3]>,
  K5 extends some.keyof<T[K0][K1][K2][K3][K4]>,
  K6 extends some.keyof<T[K0][K1][K2][K3][K4][K5]>,
  K7 extends some.keyof<T[K0][K1][K2][K3][K4][K5][K6]>,
  K8 extends some.keyof<T[K0][K1][K2][K3][K4][K5][K6][K7]>,
>(shape: T, ...keys: [K0, K1, K2, K3, K4, K5, K6, K7, K8]): T[K0][K1][K2][K3][K4][K5][K6][K7][K8]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<T[K0]>,
  K2 extends some.keyof<T[K0][K1]>,
  K3 extends some.keyof<T[K0][K1][K2]>,
  K4 extends some.keyof<T[K0][K1][K2][K3]>,
  K5 extends some.keyof<T[K0][K1][K2][K3][K4]>,
  K6 extends some.keyof<T[K0][K1][K2][K3][K4][K5]>,
  K7 extends some.keyof<T[K0][K1][K2][K3][K4][K5][K6]>,
>(shape: T, ...keys: [K0, K1, K2, K3, K4, K5, K6, K7]): T[K0][K1][K2][K3][K4][K5][K6][K7]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<T[K0]>,
  K2 extends some.keyof<T[K0][K1]>,
  K3 extends some.keyof<T[K0][K1][K2]>,
  K4 extends some.keyof<T[K0][K1][K2][K3]>,
  K5 extends some.keyof<T[K0][K1][K2][K3][K4]>,
  K6 extends some.keyof<T[K0][K1][K2][K3][K4][K5]>,
>(shape: T, ...keys: [K0, K1, K2, K3, K4, K5, K6]): T[K0][K1][K2][K3][K4][K5][K6]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<T[K0]>,
  K2 extends some.keyof<T[K0][K1]>,
  K3 extends some.keyof<T[K0][K1][K2]>,
  K4 extends some.keyof<T[K0][K1][K2][K3]>,
  K5 extends some.keyof<T[K0][K1][K2][K3][K4]>,
>(shape: T, ...keys: [K0, K1, K2, K3, K4, K5]): T[K0][K1][K2][K3][K4][K5]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<T[K0]>,
  K2 extends some.keyof<T[K0][K1]>,
  K3 extends some.keyof<T[K0][K1][K2]>,
  K4 extends some.keyof<T[K0][K1][K2][K3]>,
>(shape: T, ...keys: [K0, K1, K2, K3, K4]): T[K0][K1][K2][K3][K4]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<T[K0]>,
  K2 extends some.keyof<T[K0][K1]>,
  K3 extends some.keyof<T[K0][K1][K2]>,
>(shape: T, ...keys: [K0, K1, K2, K3]): T[K0][K1][K2][K3]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<T[K0]>,
  K2 extends some.keyof<T[K0][K1]>,
>(shape: T, ...keys: [K0, K1, K2]): T[K0][K1][K2]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<T[K0]>,
>(shape: T, ...keys: [K0, K1]): T[K0][K1]
export function get<
  const T extends {},
  K extends some.keyof<T>,
>(shape: T, ...keys: [K]): T[K]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<(T[K0] & {})>,
  K2 extends some.keyof<((T[K0] & {})[K1] & {})>,
  K3 extends some.keyof<(((T[K0] & {})[K1] & {})[K2] & {})>,
  K4 extends some.keyof<((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})>,
  K5 extends some.keyof<(((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})>,
  K6 extends some.keyof<((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})>,
  K7 extends some.keyof<(((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})[K6] & {})>,
  K8 extends some.keyof<((((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})[K6] & {})[K7] & {})>,
  K9 extends some.keyof<(((((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})[K6] & {})[K7] & {})[K8] & {})>,
>(shape: T, ...keys: [K0, K1, K2, K3, K4, K5, K6, K7, K8, K9]): 
  undefined | (((((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})[K6] & {})[K7] & {})[K8] & {})[K9]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<(T[K0] & {})>,
  K2 extends some.keyof<((T[K0] & {})[K1] & {})>,
  K3 extends some.keyof<(((T[K0] & {})[K1] & {})[K2] & {})>,
  K4 extends some.keyof<((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})>,
  K5 extends some.keyof<(((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})>,
  K6 extends some.keyof<((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})>,
  K7 extends some.keyof<(((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})[K6] & {})>,
  K8 extends some.keyof<((((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})[K6] & {})[K7] & {})>,
>(shape: T, ...keys: [K0, K1, K2, K3, K4, K5, K6, K7, K8]): 
  undefined | ((((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})[K6] & {})[K7] & {})[K8]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<(T[K0] & {})>,
  K2 extends some.keyof<((T[K0] & {})[K1] & {})>,
  K3 extends some.keyof<(((T[K0] & {})[K1] & {})[K2] & {})>,
  K4 extends some.keyof<((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})>,
  K5 extends some.keyof<(((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})>,
  K6 extends some.keyof<((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})>,
  K7 extends some.keyof<(((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})[K6] & {})>,
>(shape: T, ...keys: [K0, K1, K2, K3, K4, K5, K6, K7]): 
  undefined | (((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})[K6] & {})[K7]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<(T[K0] & {})>,
  K2 extends some.keyof<((T[K0] & {})[K1] & {})>,
  K3 extends some.keyof<(((T[K0] & {})[K1] & {})[K2] & {})>,
  K4 extends some.keyof<((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})>,
  K5 extends some.keyof<(((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})>,
  K6 extends some.keyof<((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})>,
>(shape: T, ...keys: [K0, K1, K2, K3, K4, K5, K6]): 
  undefined | ((((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5] & {})[K6]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<(T[K0] & {})>,
  K2 extends some.keyof<((T[K0] & {})[K1] & {})>,
  K3 extends some.keyof<(((T[K0] & {})[K1] & {})[K2] & {})>,
  K4 extends some.keyof<((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})>,
  K5 extends some.keyof<(((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})>,
>(shape: T, ...keys: [K0, K1, K2, K3, K4, K5]): 
  undefined | (((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4] & {})[K5]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<(T[K0] & {})>,
  K2 extends some.keyof<((T[K0] & {})[K1] & {})>,
  K3 extends some.keyof<(((T[K0] & {})[K1] & {})[K2] & {})>,
  K4 extends some.keyof<((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})>,
>(shape: T, ...keys: [K0, K1, K2, K3, K4]): undefined | ((((T[K0] & {})[K1] & {})[K2] & {})[K3] & {})[K4]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<(T[K0] & {})>,
  K2 extends some.keyof<((T[K0] & {})[K1] & {})>,
  K3 extends some.keyof<(((T[K0] & {})[K1] & {})[K2] & {})>,
>(shape: T, ...keys: [K0, K1, K2, K3]): undefined | (((T[K0] & {})[K1] & {})[K2] & {})[K3]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<(T[K0] & {})>,
  K2 extends some.keyof<((T[K0] & {})[K1] & {})>,
>(shape: T, ...keys: [K0, K1, K2]): undefined | ((T[K0] & {})[K1] & {})[K2]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
  K1 extends some.keyof<(T[K0] & {})>,
>(shape: T, ...keys: [K0, K1]): undefined | (T[K0] & {})[K1]
export function get<
  const T extends {},
  K0 extends some.keyof<T>,
>(shape: T, ...keys: [K0]): undefined | T[K0]
export function get<const T extends {}>(shape: T, ...keys: []): T
export function get<T>(shape: Inductive.stringIndex<T>, ...keys: [...keys.any]): T | undefined
export function get(t: {}, ...k: [...keys.any]) 
  /// impl.
  { return get_(t, k) }

export type get<T, KS extends keys.any> = get.loop<KS, T>;
export declare namespace get {
  type loop<KS extends keys.any, T, optionals extends "try" = never>
    = T extends null | undefined ? [optionals] extends ["try"] ? maybe<KS, T> : T 
    : KS extends readonly [infer K extends keyof T, ...infer Todo extends props.any]
    ? get.loop<Todo, T[K]>
    : KS extends readonly [] ? T
    : unknown

  type maybe<KS extends keys.any, T, _ = Exclude<T, undefined>>
    = KS extends readonly [infer K extends keyof _, ...infer Todo extends props.any]
    ? get.maybe<Todo, _[K]>
    : KS extends readonly [] ? undefined | T
    : unknown
}


void (get.defer = get_defer)
/** 
 * ## {@link get_defer `tree.get.defer`}
 * 
 * Get a deeply nested value from a data structure.
 * 
 * In many cases, {@link get_defer `tree.get.defer`} is overkill.
 * 
 * When your use case requires accessing arbitrarily nested
 * properties _programmatically_, {@link get_defer `tree.get.defer`}
 * is a great fit.
 * 
 * For a variant that is data-first and eargerly applies its
 * arguments, use {@link get `tree.get`}.
 * 
 * See also:
 * - {@link get `tree.get`}
 */
export function get_defer<KS extends props.any>(...path: [...KS]): 
  <const T extends has_maybe<KS>>(shape: T) => get.loop<KS, T, "try">
/// impl.
export function get_defer(
  ...args:
    | [...path: props.any]
    | [path: [...props.any], fallback: unknown]
) {
  return (shape: {}) => {
    const got = get_(shape, props.is(args) ? args : args[0])
    return got === symbol.not_found ? props.is(args) ? void 0 : args[1] : got
  }
}

/** 
 * ## {@link has `tree.has`}
 * 
 * The {@link has `tree.has`} utility accepts a path
 * into a tree, and optionally a type-guard, and returns 
 * a predicate function that returns true if its argument
 * "has" a non-nullable value at that address in the
 * argument.
 * 
 * If the optional type-guard is provided, {@link has `tree.has`}
 * will also apply the type-guard to the value it finds at
 * the provided path. If provided, the target of the type-guard
 * will be applied at the target node of the tree.
 */
export function has<KS extends keys.any>
  (...params: [...KS]): (u: unknown) => u is has.path<KS>
export function has<const KS extends keys.any, T>
  (...params: [...KS, (u: unknown) => u is T]): (u: unknown) => u is has_path<KS, T>
/// impl.
export function has
  (...params: [...keys.any] | [...keys.any, (u: any) => u is any]) {
    return (u: unknown) => {
      const [path, check] = separatePath(params)
      const got = get_(u, path)
      return got !== symbol.not_found && check(got)
    }
  }

function separatePath(xs: [...keys.any] | [...keys.any, Predicate.any]): 
  [path: key.any[], check: (u: any) => u is any]
function separatePath(xs: [...keys.any] | [...keys.any, Predicate.any]) { 
  return keys.is(xs) 
    ? [xs, has.defaults.guard] 
    : [xs.slice(0, -1), xs[xs.length - 1]] 
}

has.defaults = {
  guard: ((_?: any): _ is any => true) satisfies Predicate.any,
}

export declare namespace has {
  export { 
    has_maybe as maybe, 
    has_path as path,
  }
}

type has_path<KS extends keys.any, T = {}> 
  = KS extends nonempty.propsLeft<infer Todo, infer K>
  ? has.path<Todo, { [P in K]: T }>
  : T extends infer U extends {} ? U : never 

type has_maybe<KS extends keys.any, T = {}>
  = KS extends nonempty.propsLeft<infer Todo, infer K>
  ? has_maybe<Todo, { [P in K]+?: T }>
  : T extends infer U extends {} ? tentatively<U> : never

export interface tentatively<T extends {}> extends newtype<T> {}

/** 
 * ## {@link set `tree.set`}
 * 
 * @alias {@link mutate `tree.mutate`}
 * 
 * Write to a deeply nested value anywhere inside a tree.
 * 
 * **Note:** {@link set `tree.set`} trades performance for
 * purity, which means that by default, the accessor that 
 * it creates will _mutate_ its argument.
 * 
 * This behavior is
 * configurable, see {@link set.Options `set.Options`}.
 * 
 * **Note:** currently, `set` doesn't use any type-level tricks
 * to make sure you don't shoot yourself in the foot. 
 * 
 * That will change in the future, just haven't had time
 */
export const set = mutate

export function mutate
  <KS extends keys.any>(...path: [...KS]): 
    <const T extends has.path<KS>>(tree: T) => {
      <V extends get<T, KS>>(v: V): unknown
      <V>(v: V): unknown
    }

export function mutate
  <KS extends keys.any>(path: [...KS], options?: mutate.Options): 
    <const T extends has.path<KS>>(tree: T) => {
      <V extends get<T, KS>>(v: V): unknown
      <V>(v: V): unknown
    }

/// impl.
export function mutate(
  ...args:
    | [...path: props.any]
    | [path: [...props.any], options?: mutate.Options]
) {
  const [path, options] = keys.is(args) ? [args, set.defaults] : args
  const config = set.configFromOptions(options)
  return (_: {}) => {
    const tree 
      = config.clone === true ? structuredClone(_) 
      : config.clone === false ? _ 
      : config.clone(_)
    let cursor: unknown = tree
    let k: prop.any | undefined
    let prev: unknown
    let last: prop.any
    while((k = path.shift()) !== undefined) {
      void (last = k)
      void (prev = cursor)
      if (has(k, isComposite)(cursor))
        void (cursor = cursor[k])
    }
    return <V>(next: V) => {
      // TODO: fix types so you can remove this type assertion
      void ((prev as { [x: string]: typeof next })[last] = next)
      return tree
    }
  }
}


export type modify<KS extends readonly unknown[], T, V>
  = KS extends readonly [infer K extends keyof T] ? Force<Omit<T, K> & { [P in K]: V }>
  : KS extends nonempty.props<infer K, infer Todo>
  ? K extends keyof T ? Force<Omit<T, K> & { [P in K]: modify<Todo, T[K], V> }>
  : T
  : T
  ;

// export function modify_defer<KS extends props.any>(...path: [...KS]): <
//   A extends get<Q, KS>, 
//   B,
//   Q extends has.path<KS>, 
//   R extends has.path<KS, A>, 
// >(modifyFn: (prev: A) => B) => 
//   <S>(tree: R & S) => modify<KS, S, B>

// export function modify_defer(...path: keys.any) {
//   return (modifyFn: (_: {} | undefined) => {}) => (tree: {}) => 
//     !path.length ? tree 
//     : fn.pipe(
//       get(tree, ...path),
//       modifyFn,
//       set(...path)(tree)
//     )
// }
  
// export function modify<
//   KS extends props.any, 
//   R extends has.path<KS>
// >(...path: [...KS]): 
//   <const S extends R, T extends get<S, KS>, B>(
//     tree: S, 
//     modifyFn: <A extends T>(a: A) => B
//   ) => modify<KS, S, B>

// export function modify(...path: keys.any) {
//   return (tree: {}, g: (a: {} | null | undefined) => {}) => !path.length ? tree 
//   : fn.pipe(
//     get(tree, ...path),
//     g,
//     set(...path)(tree),
//   )
// }


export function modify<
  const S extends {},
  A extends S[K1][K2][K3][K4][K5][K6][K7][K8][K9],
  K9 extends keyof S[K1][K2][K3][K4][K5][K6][K7][K8],
  K8 extends keyof S[K1][K2][K3][K4][K5][K6][K7],
  K7 extends keyof S[K1][K2][K3][K4][K5][K6],
  K6 extends keyof S[K1][K2][K3][K4][K5],
  K5 extends keyof S[K1][K2][K3][K4],
  K4 extends keyof S[K1][K2][K3],
  K3 extends keyof S[K1][K2],
  K2 extends keyof S[K1],
  K1 extends keyof S,
  B
>(
  tree: S, 
  path: readonly [K1, K2, K3, K4, K5, K6, K7, K8, K9], 
  modifyFn: (a: A) => B
): 
  [A, B] extends [B, A] ? S : modify<[K1, K2, K3, K4, K5, K6, K7, K8, K9], S, B>

export function modify<
  const S extends {},
  A extends S[K1][K2][K3][K4][K5][K6][K7][K8],
  K8 extends keyof S[K1][K2][K3][K4][K5][K6][K7],
  K7 extends keyof S[K1][K2][K3][K4][K5][K6],
  K6 extends keyof S[K1][K2][K3][K4][K5],
  K5 extends keyof S[K1][K2][K3][K4],
  K4 extends keyof S[K1][K2][K3],
  K3 extends keyof S[K1][K2],
  K2 extends keyof S[K1],
  K1 extends keyof S,
  B
>(
  tree: S, 
  path: readonly [K1, K2, K3, K4, K5, K6, K7, K8], 
  modifyFn: (a: A) => B
): 
  [A, B] extends [B, A] ? S : modify<[K1, K2, K3, K4, K5, K6, K7, K8], S, B>

export function modify<
  const S extends {},
  A extends S[K1][K2][K3][K4][K5][K6][K7],
  K7 extends keyof S[K1][K2][K3][K4][K5][K6],
  K6 extends keyof S[K1][K2][K3][K4][K5],
  K5 extends keyof S[K1][K2][K3][K4],
  K4 extends keyof S[K1][K2][K3],
  K3 extends keyof S[K1][K2],
  K2 extends keyof S[K1],
  K1 extends keyof S,
  B
>(
  tree: S, 
  path: readonly [K1, K2, K3, K4, K5, K6, K7], 
  modifyFn: (a: A) => B
): 
  [A, B] extends [B, A] ? S : modify<[K1, K2, K3, K4, K5, K6, K7], S, B>

export function modify<
  const S extends {},
  A extends S[K1][K2][K3][K4][K5][K6],
  K6 extends keyof S[K1][K2][K3][K4][K5],
  K5 extends keyof S[K1][K2][K3][K4],
  K4 extends keyof S[K1][K2][K3],
  K3 extends keyof S[K1][K2],
  K2 extends keyof S[K1],
  K1 extends keyof S,
  B
>(
  tree: S, 
  path: readonly [K1, K2, K3, K4, K5, K6], 
  modifyFn: (a: A) => B
): 
  [A, B] extends [B, A] ? S : modify<[K1, K2, K3, K4, K5, K6], S, B>

export function modify<
  const S extends {},
  A extends S[K1][K2][K3][K4][K5],
  K5 extends keyof S[K1][K2][K3][K4],
  K4 extends keyof S[K1][K2][K3],
  K3 extends keyof S[K1][K2],
  K2 extends keyof S[K1],
  K1 extends keyof S,
  B
>(
  tree: S, 
  path: readonly [K1, K2, K3, K4, K5], 
  modifyFn: (a: A) => B
): 
  [A, B] extends [B, A] ? S : modify<[K1, K2, K3, K4, K5], S, B>


export function modify<
  const S extends {},
  A extends S[K1][K2][K3][K4],
  K4 extends keyof S[K1][K2][K3],
  K3 extends keyof S[K1][K2],
  K2 extends keyof S[K1],
  K1 extends keyof S,
  B
>(
  tree: S, 
  path: readonly [K1, K2, K3, K4], 
  modifyFn: (a: A) => B
): 
  [A, B] extends [B, A] ? S : modify<[K1, K2, K3, K4], S, B>

export function modify<
  const S extends {},
  A extends S[K1][K2][K3],
  K3 extends keyof S[K1][K2],
  K2 extends keyof S[K1],
  K1 extends keyof S,
  B
>(
  tree: S, 
  path: readonly [K1, K2, K3], 
  modifyFn: (a: A) => B
): 
  [A, B] extends [B, A] ? S : modify<[K1, K2, K3], S, B>

export function modify<
  const S extends {},
  A extends S[K1][K2],
  K2 extends keyof S[K1],
  K1 extends keyof S,
  B
>(
  tree: S, 
  path: readonly [K1, K2], 
  modifyFn: (a: A) => B
): 
  [A, B] extends [B, A] ? S : modify<[K1, K2], S, B>

export function modify<
  const S extends {},
  K1 extends keyof S,
  A extends S[K1],
  B
>(
  tree: S, 
  path: readonly [K1], 
  modifyFn: (a: A) => B
): 
  [A, B] extends [B, A] ? S : modify<[K1], S, B>

export function modify<
  const S extends {},
  A extends S,
  B
>(
  tree: S, 
  path: readonly [], 
  modifyFn: (a: A) => B
): 
  [A, B] extends [B, A] ? S : modify<[], S, B>

export function modify(
  tree: {}, 
  path: readonly [...keys.any],
  modifyFn: (a: {} | null | undefined) => {}
): unknown {
  return !path.length ? tree 
  : fn.pipe(
    get(tree, ...path),
    modifyFn,
    set(...path)(tree),
  )
}

// export function modify<KS extends props.any, V>(...args: [...KS, (u: unknown) => u is V]):
//   <T extends has.path<KS, V>, S extends get<T, KS>>(modifyFn: (prev: V) => S) => <U extends T>(tree: U) => U
// {
//   <T extends has.path<KS>, S extends get<T, KS>, V>(
//     modifyFn: (prev: NoInfer<V>) => S,
//     guard: (u: unknown) => u is V, 
//   ): (tree: T) => T
//   <T extends has.path<KS>, S extends get<T, KS>>(modifyFn: (prev: S) => S): (tree: T) => T
//   <T extends has.path<KS>, S extends get<T, KS>, V>(
//     modifyFn: (prev: S) => S,
//     guard?: (u: unknown) => u is V, 
//   ): (tree: T) => T
// }

// export function modify(
//   ...args: 
//     | [...keys.any]
//     | [...keys.any, (u: any) => u is unknown]
// ) {
//   const [path, guard] = separatePath(args)
//   return (mod: (prev: unknown) => unknown) => (tree: {}) =>  {
//     return !path.length ? tree : fn.pipe(
//       get(tree, ...path),
//       Option.guard(guard),
//       Option.map(
//         fn.flow(
//           mod,
//           set(...path)(tree),
//         )
//       ),
//       Option.getOrElse(() => tree)
//     )
//   }
// }


//   const [path, guard] = separatePath(args)
//   console.log("path", get({ a: { b: { c: 123 } } }, "a", "b", "c"))
//   return (modifyFn: (prev: _) => _) => (tree: {}) => {
//     // console.log("tree.components", Object.keys(tree.components.schemas).length)
//     // console.log("get(tree, ...path)", Object.keys(get(tree, ...path)).length)

//     // console.log("get(tree, ...path), path: ", path, "GO:", get(tree, ...path))

//     return path.length === 0 ? tree : fn.pipe(
//       get(tree, ...path),
//       modifyFn,
//       set(...path)(path),
//       // Option.fromPredicate(guard),
//       // Option.map(
//       //   fn.flow(
//       //     modifyFn, 
//       //     set(...path)(path)
//       //   )
//       // ),
//       // fn.tap("after"),
//       // Option.getOrElse(() => tree),
//     )
//   }
// }

// export function modify(...path: [...props.any]) {
//   return (tree: {}) =>  (mod: (prev: unknown) => unknown) => {
//     return !path.length ? tree : fn.pipe(
//       get(tree, ...path),
//       mod,
//       set(...path)(tree),
//     )
//   }
// }

type pathToString<KS extends props.any, Out extends string> 
  = KS extends nonempty.props<infer H, infer T> 
  ? pathToString<T, `${Out extends "" ? "" : `${Out}.`}${H}`> 
  : Out
  ;

export interface TypeError<Msg extends string, Got> extends newtype<never> {}

// export type accessor<KS extends props.any, T extends has.path<KS>> = get<T, KS>
export interface accessor<KS extends props.any, T extends has.path<KS>> extends newtype<get<T, KS> & {}> {}

export function accessor<const KS extends props.any>(...path: [...KS]): {
  <T extends has.path<KS, { [x: number]: string }>>(tree: T): accessor<KS, T>
  <T extends has.path<KS, any.primitive>>(tree: T): TypeError<
    `Accessors must point to an object, but path '${pathToString<KS, "">}' points to type:`,
    get<T, KS>
  >
}
/// impl.
export function accessor(...path: prop.any[]) {
  return (tree: {}) => {
    let cursor: unknown = tree
    let k: prop.any | undefined
    while((k = path.shift()) !== undefined) {
      if (has(k, isComposite)(cursor))
        void (cursor = cursor[k])
    }
    return cursor
  }
}

export declare namespace mutate {
  interface Options {
    clone?: boolean | (<T>(tree: T) => T)
  }
  interface Config extends Required<Options> {}
}
export namespace mutate {
  export const defaults = {
    clone: false,
  } satisfies mutate.Config
  export function configFromOptions(options?: mutate.Options): mutate.Config {
    return !options ? mutate.defaults : {
      clone: options?.clone ?? mutate.defaults.clone,
    } 
  }
}

/** 
 * ## {@link fromPath `tree.fromPath`}
 * 
 * Given a path, constructs a tree from the bottom-up.
 *
 * If the {@link leaf `leaf`} argument is provided,
 * {@link fromPath `tree.fromPath`} will use that
 * value as its starting point.
 * 
 * @example
 *  import { tree } from "@traversable/core"
 * 
 *  tree.fromPath("")
 */
export function fromPath<const KS extends props.any, T>(...path: [...KS]): fromPath<KS>
export function fromPath<const KS extends props.any, T>(path: [...KS], leaf?: T): fromPath<KS, T>
/// impl.
export function fromPath(
  ...args:
    | [...props.any]
    | [path: [...props.any], leaf: unknown]
) {
  const [path, leaf] = props.is(args) 
    ? [args, {}] as const 
    : [args[0], {}] as const
  let out: unknown = leaf
  let key: string | number | undefined
  while ((key = path.pop()) !== undefined) {
    let struct
      : { [x: string]: unknown } 
      = typeof key === "number" ? [] as never : {}
    void (struct[key] = out)
    void (out = struct)
  }
  return out
}

export type fromPath<KS extends keys.any, T = {}>
  = KS extends nonempty.propsLeft<infer Todo, infer K>
  ? fromPath<Todo, { [P in K]: T }> : T

export type fromPaths<T extends fromPaths.Path> = fromPaths.loop<[...T]>
export declare namespace fromPaths {
  interface Leaf<V = unknown> { readonly [symbol.leaf]: URI.leaf, value: V }
  type Path<V = unknown> = readonly [props.any, V]
  type Paths<V = unknown> = readonly Path<V>[]
  type Nodes = { [x: string]: Node }
  type Node = 
    | Leaf 
    | readonly [props.any, Leaf][]
    ;
  type nextFrom<
    T extends fromPaths.Path, 
    U extends T 
    | T extends readonly [nonempty.props<any, infer V>, infer W] ? readonly [V, W] : never
    = T extends readonly [nonempty.props<any, infer V>, infer W] ? readonly [V, W] : never
  > = U
  type loop<T extends fromPaths.Path> = never
    | [T] extends [readonly [readonly [], any]] ? T[1]
    : { -readonly [E in T as E[0][0]]: fromPaths.loop<fromPaths.nextFrom<E>> }
  type roundtrip<T extends readonly [props.any, unknown]> = never
    | [T] extends [readonly [readonly [], any]] ? T[1] //Leaf<T[1]>
    : { -readonly [E in T as E[0][0]]: roundtrip<fromPaths.nextFrom<E>> }
}

/** 
 * ### {@link fromPaths `tree.fromPaths`}
 * #### ｛ {@link unicode.jsdoc.mapping ` 🌈 `} ｝
 * 
 * Dual of {@link toPaths `tree.toPaths`}
 * See also:
 * - {@link toPaths `tree.toPaths`}
 * - {@link fromPath `tree.fromPath`}
 */

export function fromPaths<const T extends readonly [path: props.any, leaf: unknown]>
  (paths: readonly T[]): fromPaths<T> 
export function fromPaths<const T extends readonly [path: props.any, leaf: unknown]>
  (paths: readonly T[], opts: fromPaths.Options<{ roundtrip: true }>): fromPaths.roundtrip<T> 
export function fromPaths<const T extends readonly [path: props.any, leaf: unknown]>
  (paths: readonly T[], opts?: fromPaths.Options): fromPaths<T> 
/// impl.
export function fromPaths<const T extends [path: props.any, leaf: unknown]>
  (paths: readonly T[], opts: fromPaths.Options = fromPaths.defaults) {
    const loop = fromPaths.loop(fromPaths.configFromOptions(opts))
    const marked = fromPaths.markAll(paths)
    return loop(marked)
  }

/**
 * ### {@link loop `tree.fromPaths.loop`}
 * 
 * {@link loop `tree.fromPaths.loop`} is responsible for 
 * {@link group `grouping`} the {@link markAll `marked`}
 * paths together, then, mapping over the record's values.
 * If it encounters a {@link Leaf `Leaf`}, it returns the leaf's
 * value, otherwise it recurses.
 * 
 * The real trick to getting {@link fromPaths `tree.fromPaths`}
 * to work was to handle the basecase _inside_ the mapping function.
 * 
 * My intuition tells me that there's probably a more elegant 
 * breadth-first solution, but I'm satisfied with this algorithm
 * as-is for now.
 */
fromPaths.loop = (opts: fromPaths.Config) => {
  return fn.loop<
    readonly [props.any, fromPaths.Leaf][], // [prop.any[], Leaf][],
    readonly unknown[] | object.any
  >((paths, loop) => {
    return fn.pipe(
      paths,
      fromPaths.group,
      map((v) => fromPaths.isLeaf(v) ? opts.roundtrip ? v : v.value : loop(v as never))
    )
  })
}

export namespace fromPaths {
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
  /** @internal */
  const ascending = (x: number, y: number) => x > y ? 1 : y > x ? -1 : 0
  /** @internal */
  const pathsAllHaveNumericKeys
    : (pairs: readonly [keys.any, unknown][]) => pairs is readonly [readonly [number, ...props.any], unknown][]
    = (pairs): pairs is never => pairs.every(([k]) => k && typeof k[0] === "number")
  /** @internal */
  const getZeroZero 
    : <T>(xss: readonly [readonly [T, ...any], ...any]) => T
    = (xss) => xss[0][0]
  /**
   * ### {@link group `fromPaths.group`}
   * 
   * @example
   *  import * as vi from "vitest"
   *  import { object } from "@traversable/data"
   *  const { leaf } = tree.fromPaths
   * 
   *  vi.assert.deepEqual(
   *    tree.fromPaths.group([
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
  export function group(paths: readonly [props.any, Leaf][]): readonly Leaf[] | Nodes
  export function group(paths: readonly [props.any, Leaf][]) {
    function reducer(prev: { [x: keyof any]: unknown }, [path, leaf]: readonly [props.any, Leaf]) {
      switch (true) {
        case path.length === 0: return prev
        case path.length === 1: return (prev[path[0]] = leaf, prev)
        default: {
          const [k, ...ks] = path
          const v = prev[k]
          if (Array_isArray(v)) return (v.push([ks, leaf]), prev)
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
  export const isLeaf
    : <T>(u: unknown) => u is Leaf<T> 
    = has(symbol.leaf, (v): v is URI.leaf => v === URI.leaf) as never

  /** 
   * ### {@link isContiguous `tree.fromPaths.isContiguous`}
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
   *        [ ["a"],       "" ] ], 
   *      ] 
   *  }
   *  vi.assert.isTrue(inputs.PASS.every(tree.fromPaths.isContiguous))
   *  vi.assert.isFalse(inputs.FAIL.every(tree.fromPaths.isContiguous))
   */
  export const isContiguous 
    : (pairs: readonly [keys.any, unknown][]) => boolean
    = (pairs) => 
      pathsAllHaveNumericKeys(pairs) 
      && checkContiguous(...pairs.map(getZeroZero))
  export const checkContiguous 
    : (...unsorted: [...readonly number[]]) => boolean
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
  export const isPathArray 
    : <K extends keys.any, V>(u: unknown) => u is readonly [K, V][]
    = (u): u is never => Array_isArray(u) && u.every(Array_isArray)
  export const isGroupedArray = (u: unknown): u is readonly [path: props.any, leaf: unknown][] => 
    isPathArray(u) && isContiguous(u)

  /**
   * ### {@link wrap `fromPaths.wrap`}
   * Dual of {@link unwrap `fromPaths.unwrap`}
   */
  export const wrap
    : <const T>(value: T) => Leaf<T>
    = (value) => ({ [symbol.leaf]: URI.leaf, value })
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
    : <V>(pair: readonly [props.any, V]) => readonly [props.any, Leaf<V>]
    = (pair) => [pair[0], wrap(pair[1])] as const
  export type markOne<T extends readonly [props.any, unknown]> = never | [T[0], Leaf<T[1]>]
  /**
   * ### {@link unmarkOne `fromPaths.unmarkOne`}
   * Dual of {@link markOne `fromPaths.markOne`}
   */
  export const unmarkOne
    : <V>(pair: readonly [props.any, Leaf<V>]) => readonly [props.any, V]
    = (pair) => [pair[0], unwrap(pair[1])]
  export type unmarkOne<T extends readonly [props.any, Leaf]> = never | readonly [T[0], T[1]["value"]]
  /**
   * ### {@link markAll `fromPaths.markAll`}
   * Dual of {@link unmarkAll `fromPaths.unmarkAll`}
   */
  export function markAll<const T extends readonly [props.any, unknown][]>(pairs: T): fromPaths.markAll<T>
  export function markAll(pairs: readonly [props.any, unknown][]) { return pairs.map(markOne) }
  export type markAll<T extends readonly [props.any, unknown][]> = never | { -readonly [x in keyof T]: fromPaths.markOne<T[x]> }
  /**
   * ### {@link unmarkAll `fromPaths.unmarkAll`}
   * Dual of {@link markAll `fromPaths.markAll`}
   */
  export function unmarkAll<const T extends readonly [props.any, Leaf][]>(pairs: T): fromPaths.unmarkAll<T>
  export function unmarkAll(pairs: readonly [props.any, Leaf][]) { return pairs.map(unmarkOne) }
  export type unmarkAll<T extends readonly [props.any, Leaf][]> = never | { -readonly [x in keyof T]: fromPaths.unmarkOne<T[x]> }
}

/** 
 * ### {@link toPaths `tree.toPaths`}
 * #### {@link unicode.jsdoc.mapping ` 🌈 ` } ｝
 * 
 * Dual of {@link fromPaths `tree.fromPaths`}
 * 
 * See also:
 * - {@link fromPaths `tree.fromPaths`}
 */
export function toPaths<const T extends Json>
  (json: T): readonly [path: props.any, leaf: unknown][] 
export function toPaths<const T extends Json>(
  json: { [x: string]: fromPaths.Leaf }, 
  opts: toPaths.Options & { roundtrip: true }
): readonly [path: props.any, leaf: unknown][] 
export function toPaths<const T extends Json>
  (json: T, opts?: toPaths.Options): readonly [path: props.any, leaf: unknown][] 
export function toPaths<const T extends Json>
  (json: T, opts: toPaths.Options = toPaths.defaults) { 
    const config = toPaths.configFromOptions(opts)
    return toPaths.isBaseCase(json, config) 
      ? toPaths.done(json, config) 
      : toPaths.go(config)(json)
  }

export declare namespace toPaths {
  type Path<T = Json> = readonly [path: props.any, leaf: T]
  type Paths<T = Json> = readonly Path<T>[]
  type Stream<T = Json> = { prev: props.any, next: T }
  type BaseCase = undefined | Json.leaf | []
}
export namespace toPaths {
  export interface Options { roundtrip?: boolean }
  export interface Config extends globalThis.Required<Options> {}
  export const defaults = { roundtrip: false } satisfies toPaths.Config
  export const configFromOptions 
    : (opts: toPaths.Options) => toPaths.Config
    = (opts) => ({ ...toPaths.defaults, ...opts })

  export function done<T extends Json>(json: T, config: toPaths.Config & { roundtrip: true }): [path: props.any, leaf: T][]
  export function done<T extends Json>(json: T, config: toPaths.Config): [path: props.any, leaf: T][]
  export function done<T extends Json>(json: T, config: toPaths.Config) { return config.roundtrip ? json : [[[], json]] }

  export const isLeaf = (u: Json, config: toPaths.Config) =>
    config.roundtrip 
    ? fromPaths.isLeaf(u) 
    : isPrimitive(u)

  export const isEmpty = (u?: Json) =>
    isComposite(u) 
    && Object_values(u).length === 0

  export const isBaseCase = (u: Json, config: toPaths.Config): u is toPaths.BaseCase => 
    toPaths.isLeaf(u, config)
    || toPaths.isEmpty(u)

  export const isPath = (u: Json): u is toPaths.Path => Array_isArray(u) && u.length === 2 && props.is(u[0])
  export const isPaths 
    : (u: Json) => u is toPaths.Paths
    = (u: Json): u is never => Array_isArray(u) && u.every(isPath)

  export const loop = (config: toPaths.Config) => fn.loop<toPaths.Stream, toPaths.Stream | toPaths.Stream[]>
    (({ prev, next }, loop) => {
      switch (true) {
        case toPaths.isBaseCase(next, config): return { prev, next }
        case isJsonArray(next): return next.flatMap(
          fn.flow(
            (x, ix) => ({ prev: [...prev, ix], next: x }),
            loop,
          )
        )
        case isJsonObject(next): return object.keys(next).flatMap(
          fn.flow(
            (k) => ({ prev: [...prev, k], next: next[k] }),
            loop,
          )
        )
        case nonNullable(next): throw fn.throw(next)
        default: throw fn.exhaustive<never>(next)
      }
    })

  /** 
   * ### {@link go `toPaths.go`} 
   * 
   * {@link go `toPaths.go`} is responsible for wiring up the recursive
   * call ({@link loop `tree.toPaths.loop`}), and destructing the intermediate
   * representation into the final output type.
   */
  export function go(config: toPaths.Config): <const T extends Json>(json: T) => [path: props.any, leaf: T][]
  export function go(config: toPaths.Config) {
    return <const T extends Json>(json: T) => fn.pipe(
      json,
      empty,
      toPaths.loop(config),
      (xs) => Array_isArray(xs) ? xs.map(destruct(config)) : destruct(config)(xs),
    )
  }

  /** 
   * ### {@link construct `tree.toPaths.construct`} 
   * Dual of {@link destruct `tree.toPaths.destruct`}
   */
  export function construct<T extends Json>
    ([prev, next]: [props.any, next: T]): 
    { prev: props.any, next: T }
    { return { prev, next } }
  /** 
   * ### {@link destruct `tree.toPaths.destruct`} 
   * Dual of {@link construct `tree.toPaths.construct`}
   */
  export function destruct
    (config: toPaths.Config & { roundTrip: true }): 
      <V>(stream: toPaths.Stream<fromPaths.Leaf<V>>) => [props.any, V]
  export function destruct
    (config: toPaths.Config & { roundTrip: false }): 
      <V>(stream: toPaths.Stream<V>) => readonly [props.any, V]
  export function destruct
    (config: toPaths.Config): 
      <V>(stream: toPaths.Stream<V | fromPaths.Leaf<V>>) => readonly [props.any, V]
  export function destruct
    (config: toPaths.Config) { 
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
   * ### {@link empty `tree.toPaths.empty`} 
   * Least upper bound of {@link construct `tree.toPaths`}
   */
  export const empty = <T extends Json>(init: T) => construct([[], init])
}

/** 
* ## {@link flatten `tree.flatten`} 
 * ### ｛ {@link jsdoc.mapping ` 🌈 `} ｝
 * 
 * @example
 *  import { tree } from "@traversable/core"
 *  import * as vi from "vitest"
 * 
 *  const ex_01 = tree.flatten({ 
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
export function flatten<const T>
  (tree: T, options?: flatten.Options): {}
/// TODO: get these return types working
export function flatten<const T>
  (tree: T, options?: flatten.Options): {} 
/// impl.
export function flatten (
  tree: unknown, {
    preserveReferences = flatten.defaults.preserveReferences
  }: flatten.Options = flatten.defaults
) {
  if (isPrimitive(tree)) return tree
  let seen = new globalThis.WeakMap()
  let circular: (string | number)[][] = []
  let refCount = 0
  const out: 
    & { [x: string]: unknown } 
    & { [symbol.ref]?: { [x: number]: (string | number)[] } }
    = {}

  const loop = (path: (string | number)[], node: unknown) => {
    if (isPrimitive(node)) 
      void (out[path.join(".")] = node)
    else if (Array_isArray(node)) 
      void node.forEach((x, ix) => loop([...path, ix], x))
    else if (object.isRecord(node)) {
      if (seen.has(node)) {
        void refCount++
        void circular.push(seen.get(node))
        /** 
         * If the path is `[]`, the circular reference points to
         * the root of the tree. Nothing to do here (yet).
         */
        if (path.length === 0) 
          void 0
        else 
          void (out[path.join(".")] = `[Circular *[Symbol(${URI.ref})[${refCount}]]`)
      }
      else {
        void (seen.set(node, path))
        void Object_keys(node).forEach((k) => loop([...path, k], node[k]))
      }
    }
    else void Invariant.IllegalState("@traversable/core/tree.flatten") 
  }

  void loop([], tree)
  if (preserveReferences) 
    void circular.forEach((cycle, ix) => (
      void (out[symbol.ref] ??= {}),
      void (out[symbol.ref][ix + 1] = cycle)
    ))

  return out
}

export type flatten<T> = flatten.loop<T, "">
export declare namespace flatten {
  interface Options extends inline<typeof flatten.defaults> {}
  type entry = readonly [key: string, value: unknown]
  type entries = 
    | readonly [path: string, leaf: any.primitive] 
    | readonly (readonly [path: string, leaf: any.primitive])[]
    ;
  type loop<T, P extends string>
    = T extends any.primitive ? [path: P, leaf: T]
    : T extends array.any 
    ? (
      globalThis.Exclude<keyof T & string, "length"> extends infer K 
      ? K extends keyof T & string
      ? `${P extends "" ? "" : `${P}.`}${K}` extends infer Q 
      ? [Q] extends [string] ? flatten.loop<T[K], Q> : never : never
      : never
      : never
    )
    : (keyof T & string) extends infer K 
    ? K extends (keyof T & string)
    ? `${P extends "" ? "" : `${P}.`}${K}` extends infer Q 
    ? [Q] extends [string] ? flatten.loop<T[K], Q> : never : never
    : never
    : never
    ;
}

export namespace flatten {
  export const defaults = {
    /** 
     * ### {@link defaults.preserveReferences `Options.preserveReferences`}
     * 
     * Determines how {@link flatten `tree.flatten`} should handle circular
     * references.
     * 
     * If `true`, the output object will include a {@link symbol.ref `symbol.ref`}
     * property that contains the paths to each of the circularly-referenced
     * nodes in the tree.
     * 
     * The entries in {@link symbol.ref `symbol.ref`} are a mapping from the 
     * _order_ that the circular reference was discovered, to the array of path
     * segments that lead to the reference.
     * 
     * The _order_ is important, because {@link flatten `tree.flatten`}
     * doesn't have access to the name of the identifier itself. 
     * 
     * There might be a way to get that, not sure -- but barring a way to get
     * that, the order is used to disambiguate which pointers point to which 
     * references.
     * 
     * If that explanation confused you, take a look at the tests for 
     * {@link flatten `tree.flatten`} in `core/test/tree.test.ts`.
     * 
     * If unspecified, defaults to `true`.
     */
    preserveReferences: true as boolean,
  } as const
}
