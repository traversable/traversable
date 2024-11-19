import { props, type prop, nonempty, fn } from "@traversable/data"
import { record as isRecord } from "@traversable/core/is"
import { newtype } from "any-ts";

// export function unsafeSet<const T extends keys.any>(path: T, value: {}) {
//   return (tree: { [x: keyof any]: any }) => path.reduce(
//     (acc, key, ix) => ix === path.length - 1 
//       ? void (acc[key] = value)
//       : acc?.[key], 
//     tree
//   )
// }
// type treeFrom<P extends props.any, T>
//   = P extends readonly [...infer Todo extends props.any, infer Last extends prop.any] 
//   ? treeFrom<Todo, { [K in Last]: T }> : T
// function treeFrom<const P extends props.any, T>(path: P, leaf?: T): treeFrom<P, T>
// function treeFrom<const P extends props.any, T>(path: [...P], leaf: T = {} as never) {
//   let key: string | number | undefined
//   let out: unknown = leaf
//   while (void (key = path.pop()), key !== undefined) {
//     if (typeof key === "number") {
//       let struct = []
//       void (struct[key] = out)
//       void (out = struct)
//     } else {
//       let struct: { [y: string]: unknown } = {}
//       void (struct[key] = out)
//       void (out = struct)
//     }
//   }
//   return out
// }
// function setDeep<const P extends props.any, A>(path: [...P], leaf: A): {
//   <S extends { [x: number]: unknown }>(tree: S): {}
//   <S extends { [x: string]: unknown }>(tree: S): {}
// }
// function setDeep<const P extends props.any, A>(path: [...P], leaf: A) {
//   return <S extends { [x: string | number]: any }>(tree: S) => {
//     let seen: P[number][] = []
//     let cursor: unknown = tree
//     let key: string | number | undefined
//     while (
//       key = path.shift(), 
//       key !== undefined && (key = `${key}`),
//       key !== undefined
//     ) {
//       if (!isRecord(cursor)) return tree
//       else {
//         void seen.push(key)
//         if (has(key, or(is.array, is.record))(cursor))
//           void (cursor = cursor[key])
//         else 
//           void (cursor[key] = path.length === 0 ? leaf : treeFrom(path)), 
//           void (cursor = cursor[key])
//       }
//     }
//     return tree
//   }
// }

/** @internal */
function hasOwn<K extends prop.any>(u: unknown, key: K): 
  u is K extends K ? { [P in K]: unknown } : never
/// impl.
function hasOwn(
  u: unknown, 
  key: prop.any
): u is { [x: string]: unknown } {
  return globalThis.Object.prototype.hasOwnProperty.call(u, key)
}

/** @internal */
function get_(x: {}, ks: [...props.any]) {
  let 
    out: unknown = x,
    k: string | number | undefined
  while ((k = ks.shift()) !== undefined) {
    if (hasOwn(out, k + "")) void (out = out[k])
    else return symbol.not_found
  }
  return out
}
/** @internal */
function has_(x: {}, ks: [...props.any]): boolean {
  return get_(x, ks) !== symbol.not_found
}

export namespace symbol {
  export type not_found = typeof symbol.not_found
  export const not_found = Symbol.for("@traversable/core/lens/symbol::not_found")
}

interface has<T extends {}> extends newtype<T> {}
declare namespace has {
  type path<KS extends props.any, T = {}>
    = KS extends nonempty.propsLeft<infer Todo, infer K>
    ? has.loop<T, K, Todo>
    : has<T & {}>
    ;
  type loop<
    T, 
    K extends prop.any, 
    Todo extends props.any
  > = has.path<Todo, { [P in K]: T }>
  type maybeLoop<
    T,
    K extends prop.any,
    Todo extends props.any
  > = mightHave<Todo, { [P in K]+?: T }>
}

type mightHave<KS extends props.any, T = {}>
  = KS extends nonempty.propsLeft<infer Todo, infer K>
  ? has.maybeLoop<T, K, Todo>
  : T extends {} ? has<T> : T
  ;

function has<KS extends props.any>(...path: [...KS]): (u: unknown) => u is has.path<KS>
function has<V, KS extends props.any>(path: KS, guard: (u: unknown) => u is V): (u: unknown) => u is has.path<KS, V>
function has(
  ...args:
    | [path: props.any, guard: (u: unknown) => u is typeof u]
    | [...props.any]
) {
  return (u: {}) => {
    if (props.is(args)) {
      const got = get_(u, args)
      return got !== symbol.not_found
    }
    else {
      const [path, guard] = args
      const got = get_(u, path as typeof path[number][])
      return got !== symbol.not_found && guard(got)
    }
  }
}


type get<T, KS extends props.any> = get.loop<KS, T>;

declare namespace get {
  type loop<KS extends props.any, T>
    = KS extends readonly [infer K extends keyof T, ...infer Todo extends props.any]
    ? get.loop<Todo, T[K]>
    : T
}

export function get<KS extends props.any>(...path: [...KS]): {
  <T extends has<KS>>(shape: T): get<T, KS>
  <T extends mightHave<KS>>(shape: T): get<T, KS>
  <T extends {}>(shape: T): unknown
}
export function get<KS extends props.any, U>(path: [...KS], fallback: U): {
  <T extends has<KS>>(shape: T): get<T, KS>
  <T extends mightHave<KS>>(shape: T): get<T, KS> | U
  <T extends {}>(shape: T): {} | U
}
/// impl.
export function get(
  ...args:
    | [...path: props.any]
    | [path: [...props.any], fallback: unknown]
) {
  return (shape: {}) => {
    if (props.is(args)) {
      const got = get_(shape, args)
      return got === symbol.not_found ? void 0 : got
    }
    else {
      const [ks, fallback] = args
      const got = get_(shape, ks)
      return got === symbol.not_found ? fallback : got
    }
}





// function get_<KS extends props.any>(...path: [...KS]): <T extends has<KS>>(shape: T) => get<T, KS>
// function get_<KS extends props.any>(...path: [...KS]): <T extends mightHave<KS>>(shape: T) => get<T, KS>
// function get_<KS extends props.any>(...path: [...KS]): <T extends {}>(shape: T) => unknown
// function get_(...path: props.any) {
//   const loop = fn.loop<[x: unknown, ks: props.any], unknown>(([x, [k, ...ks]], loop) => {
//     switch (true) {
//       case k === undefined: return x
//       case hasOwn(x, k): return loop([x[k], ks])
//       default: return void 0
//     }
//   })
//   return (shape: { [x: string]: unknown }) => loop([shape, path])
// }
// export type get<P extends props.any, T>
//   = P extends readonly [infer Head extends keyof T, ...infer Tail extends props.any] 
//   ? get<Tail, T[Head]> 
//   : [P] extends [readonly [any]] ? get.not_found 
//   : T
// export function get<P extends props.any>(...path: [...P]): <const T extends { [x: string]: unknown }>(tree: T) => get<P, T>
// export function get<P extends props.any>(...path: [...P]) {
//   return <const T extends { [x: string]: unknown }>(tree: T) => {
//     let out: unknown = tree
//     let key: string | number | undefined
//     while (
//       key = path.shift(), 
//       key !== undefined && (key = `${key}`),
//       key !== undefined
//     ) {
//       if (has(key)(out)) void (out = out[key])
//       else void (out = get.not_found)
//     }
//     return out
//   }
// }
// export namespace get {
//   export type not_found = typeof not_found
//   export const not_found = Symbol.for("@openapi/reffer/get::not_found")
//   export const isNotFound = (u: unknown): u is get.not_found => u === get.not_found
// }
/*** 
 * STUFF IN THIS FILE MOVED FROM `openapi/reffer`
 */
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
///                          vvv  MOVE OR DELETE  vvv                          ///
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
