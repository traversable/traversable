import type { Applicative, Compare, Functor, HKT, Kind, Monoid, Predicate, Semigroup } from "@traversable/registry"
import type { 
  any, 
  mut, 
  nonempty, 
  some, 
} from "any-ts"
import { identity, pipe, tuple } from "./_function.js"
import { key, type keys } from "./_key.js"
import type { prop } from "./_prop.js"
import type { jsdoc } from "./_unicode.js"

/** @internal - pay the lookup cost once */
const Math_min = globalThis.Math.min

/**
 * ## {@link array_any `array.any`}
 * [Least upper bound](https://en.wikipedia.org/wiki/Upper_and_lower_bounds)
 * of the `array` namespace
 */
export type array_any<T extends readonly unknown[] = unknown[]> = T

/**
 * ## {@link array_of `array.of`}
 * Type constructor for the {@link array `array`} namespace
 */
export type array_of<T> = readonly T[]

/**
 * ## {@link array_finite `array.finite`}
 * 
 * {@link array_finite `array.finite`} constrains a type parameter to be a _finite_ 
 * array (for example `[1, 2, 3]`, but not `number[]` or `(1 | 2 | 3)[]`).
 * 
 * **Note:** For this to work, you need to apply {@link array_finite `array.finite`}
 * to the type parameter you're _currently_ declaring, see example below.
 * 
 * See also:
 * - {@link array_nonfinite `array.nonfinite`}
 * 
 * @example
 *  import type { array } from "@traversable/data"
 *  
 *  function onlyTuples<T extends array.finite<T>>(array: T): T { return array }
 * 
 *  onlyTuples([])              // ✅
 *  onlyTuples([1, 2, 3])       // ✅
 *  onlyTuples(Object.keys({})) // 🚫
 */
export type array_finite<T> = [T] extends [readonly unknown[]] ? [number] extends [T["length"]] ? never : readonly unknown[] : never

/**
 * ## {@link array_nonfinite `array.nonfinite`}
 * 
 * {@link array_nonfinite `array.nonfinite`} constrains a type parameter to be a _nonfinite_ 
 * array (`number[]` or `(1 | 2 | 3)[]`, but not `[1, 2, 3]`).
 * 
 * **Note:** For this to work, you need to apply {@link array_nonfinite `array.nonfinite`}
 * to the type parameter you're _currently_ declaring, see example below.
 * 
 * See also:
 * - {@link array_finite `array.finite`}
 * 
 * @example
 *  import type { array } from "@traversable/data"
 *  
 *  function noTuples<T extends array.nonfinite<T>>(array: T): T { return array }
 * 
 *  noTuples(Object.keys({}))    // ✅
 *  noTuples("a.b.c".split(".")) // ✅
 *  noTuples([1, 2, 3])          // 🚫
 */
export type array_nonfinite<T> = [T] extends [readonly unknown[]] ? [number] extends [T["length"]] ? readonly unknown[] : never : never

export interface lambda extends HKT { [-1]: readonly this[0][] }

/** @internal */
namespace local {
  /** @internal */
  export const isNullable: any.typeguard<unknown, null | undefined> = (u): u is never => u == null
  /** @internal */
  export const isPrimitive: any.guard<any.primitive> = (u): u is never =>
    [`number`, `string`, `symbol`, `bigint`].includes(typeof u) || local.isNullable(u)
  /** @internal */
  export const array_getEmpty = <T>() => [] as readonly T[]
}

/** @internal */
declare namespace trap {
  export { trap_any as any }
  /** @internal */
  export type trap_any<t, invariant = unknown> = [t] extends [infer type] ? [1] extends [type & 0] ? invariant : never : never
}

/**
 * ## {@link array_take `array.take`}
 * 
 * {@link array_take `array.take`} takes the first `n` elements of a tuple.
 * 
 * **Note:** This implementation is unique because it _preserves tuple labels_ 
 * if they exist, making it an ideal choice when working with function arguments, 
 * where labels correspond to argument names.
 * 
 * See also: {@link array_split `array.split`}
 */
export type array_take<T extends any.array, N extends number> 
  = T extends { length: N | 0 } ? T
  : T extends nonempty.pathLeft<infer lead, any> ? array_take<lead, N>
  : []

/**
 * ## {@link array_split `array.split`}
 * 
 * {@link array_split `array.split`} splits a tuple into two parts. The
 * first tuple will have length {@link Ix `Ix`}.
 *
 * **Note:** This implementation preserves tuple labels, if they exist,
 * which makes it ideal for working with function parameters
 * (since you won't lose the names of the original parameters).
 *
 * @example
 *  import { array } from "@traversable/array"
 * 
 *  type MyTuple = [a: 1, b: 2, c: 3, d: 4, e: 5]
 *  type Split = array.split<1, MyTuple>
 *  //   ^? type Split = [before: [a: 1], after: [b: 2, c: 3, d: 4, e: 5]]
 */
export type array_split<S extends any.array, Ix extends number> 
  = array_take<S, Ix> extends any.list<infer H>
  ? S extends readonly [...H, ...infer T] 
  ? [Ix, 1] extends [1, Ix] ? [head: H, tail: T]
  : [before: H, after: T]
  : never
  : never

/** ## {@link array_split `array.split`} */ 
export type array_shift<T extends mut.array> = array_split<T, 1>

/**
 * ## {@link array_is `array.is`}
 * 
 * {@link array_is `array.is`} is similar to `Array.isArray`, but fixes a significant problem
 * where the array that is passed is erased and replaced with
 * `any[]`
 */
export const array_is: {
  <T extends trap.any<T>>(u: T): u is globalThis.Extract<any.array, T>
  (u: unknown): u is readonly unknown[]
} = globalThis.Array.isArray

/** ## {@link array_isArrayOf `array.isArrayOf`} */
export const array_isArrayOf 
  : <T>(guard: any.guard<T>) => (u: unknown) => u is any.array<T>
  = (guard) => (u): u is never => array_is(u) && u.every(guard)

/**
 * ## {@link array_let `array.let`}
 * 
 * Given an array, {@link array_let `array.let`} gives you back the array in
 * mutable form, inferring types as narrowly as possible.
 * 
 * Useful as an alternative to the `[...] as const` syntax when you don't 
 * want the array to be `readonly`.
 *
 * See also: {@link array_const `array.const`}
 * 
 * @category constructors
 */
export const array_let
  : <const T extends any.array>(xs: T) => { -readonly [K in keyof T]: T[K]}
  = identity as never

/** 
 * ## {@link array_of `array.of`} 
 * 
 * {@link array_of `array.of`} is similar to {@link array_let `array.let`}, 
 * except that it takes any number of arguments, and returns them as an array.
 * 
 * See also: 
 * - {@link array_let `array.let`}
 * - {@link array_const `array.const`}
 * 
 * @category constructors 
 */
export const array_of
  : <const T extends any.array>(...xs: T) => { -readonly [ix in keyof T]: T[ix] }
  = tuple as never

/** 
 * ## {@link array_emptyOf `array.emptyOf`}
 * 
 * @category constructors 
 */
export const array_emptyOf
  : <T = never>() => any.array<T>
  = () => []

export function array_startsWith<T extends any.primitive>(...values: [T, ...T[]]): (xs: readonly T[]) => boolean
export function array_startsWith<T>(predicate: (x: T) => boolean): (xs: readonly T[]) => boolean
export function array_startsWith<T extends { [x: number]: unknown }>(reference: T): (xs: readonly T[]) => boolean
export function array_startsWith<T extends any.primitive>(primitive: T): (xs: readonly T[]) => boolean
export function array_startsWith<T>(...values: T[]): (xs: readonly T[]) => boolean
export function array_startsWith(
  ...args: 
    | [predicate: (x: any, y: any) => boolean]
    | [value: unknown]
    | [...values: unknown[]]
): (xs: readonly unknown[]) => boolean {
  const [h, ...t] = args
  const predicate 
    = typeof h === "function" ? h 
    : t.length === 0 ? (x: any) => globalThis.Object.is(h, x)
    : (x: any) => [h, ...t].some((y) => globalThis.Object.is(x, y))
  return (xs) => predicate(xs[0])
}

export function array_endsWith<T extends any.primitive>(...values: [T, ...T[]]): (xs: readonly T[]) => boolean
export function array_endsWith<T>(predicate: (x: T) => boolean): (xs: readonly T[]) => boolean
export function array_endsWith<T extends { [x: number]: unknown }>(reference: T): (xs: readonly T[]) => boolean
export function array_endsWith<T extends any.primitive>(primitive: T): (xs: readonly T[]) => boolean
export function array_endsWith<T>(
  ...args: 
  | [predicate: (x: any, y: any) => boolean]
  | [value: unknown]
  | [...values: unknown[]]
): (xs: readonly T[]) => boolean {
  const [h, ...t] = args
  const predicate 
    = typeof h === "function" ? h 
    : t.length === 0 ? (x: any) => globalThis.Object.is(h, x)
    : (x: any) => [h, ...t].some((y) => globalThis.Object.is(x, y))
  return (xs) => predicate(xs[xs.length - 1])
}

/** 
 * ## {@link array_unprepend `array.unprepend`}
 * 
 * Removes an element from the beginning of an array if it satisfies 
 * a condition you define.
 * 
 * The condition can be one of:
 * 
 * 1. a predicate (a function capable of returning `true` or `false` given 
 *    any element of the array
 * 2. an object to compare with the elements in the array (comparison has
 *    "same value equals" semantics, and uses 
 *    {@link globalThis.Object.is `globalThis.Object.is`} under the hood
 * 3. a primitive to compare for value equality
 * 4. an array of primitives to be tried, in order, to find a match
 * 
 * See also:
 * - {@link array_unappend `array.unappend`}
 * 
 * @example
 *  import { array } from "@traversable/data"
 *  
 *  const shift = unprepend((x) => x.id === 1)
 *  const { log } = globalThis.console
 * 
 *  const ex_01 = shift([{ id: 2, B: "B" }, { id: 3, C: "C" }, { id: 4, D: "D" }])
 *  log(ex_01)  //  =>  [{ id: 2, B: "B" }, { id: 3, C: "C" }, { id: 4, D: "D" }]
 * 
 *  const ex_02 = shift([{ id: 1, A: "A" }, { id: 2, B: "B" }, { id: 3, C: "C" }])
 *  log(ex_02)  //  =>  [                   { id: 2, B: "B" }, { id: 3, C: "C" }]
 * 
 */
export function array_unprepend<T extends any.primitive>(...values: [T, ...T[]]): (xs: readonly T[]) => readonly T[] 
export function array_unprepend<T>(predicate: (x: NoInfer<T>) => boolean): (xs: readonly T[]) => readonly T[] 
export function array_unprepend<T extends { [x: number]: unknown }>(reference: T): (xs: readonly T[]) => readonly T[] 
export function array_unprepend<T extends any.primitive>(primitive: T): (xs: readonly T[]) => readonly T[] 
export function array_unprepend(
  ...args: 
    | [predicate: (x: any, y: any) => boolean]
    | [reference: {}]
    | [any.primitive, ...any.primitive[]]
): (xs: readonly unknown[]) => readonly unknown[]  {
  const [h, ...t] = args
  const predicate = typeof h === "function" 
    ? array_startsWith(h as never) 
    : array_startsWith(...(t.length === 0 ? [(v: any) => globalThis.Object.is(h, v)] : [h, ...t]))
  return (xs) => predicate(xs as never) ? xs.slice(1) : xs
}

/** 
 * ## {@link array_unappend `array.unappend`}
 * 
 * Removes an element from the end of an array, if it satisfies a "condition"
 * you define.
 * 
 * The condition can be one of:
 * 
 * 1. a predicate (a function capable of returning `true` or `false` given 
 *    any element of the array
 * 2. an object to compare with the elements in the array (comparison has
 *    "same value equals" semantics, and uses 
 *    {@link globalThis.Object.is `globalThis.Object.is`} under the hood
 * 3. a primitive to compare for value equality
 * 4. an array of primitives to be tried, in order, to find a match
 * 
 * See also:
 * - {@link array_unprepend `array.unprepend`}
 * 
 * @example
 *  import { array } from "@traversable/data"
 *  
 *  const pop = unprepend((x) => x.id === 3)
 *  const { log } = globalThis.console
 * 
 *  const ex_01 = pop([{ id: 0, A: "A" }, { id: 1, B: "B" }, { id: 2, C: "C" }])
 *  log(ex_01)  // => [{ id: 0, A: "A" }, { id: 1, B: "B" }, { id: 2, C: "C" }]
 * 
 *  const ex_02 = pop([{ id: 1, A: "A" }, { id: 2, B: "B" }, { id: 3, C: "C" }])
 *  log(ex_02)  // => [{ id: 2, B: "B" }, { id: 3, C: "C" }                   ]
 */
export function array_unappend<T extends any.primitive>(...values: [T, ...T[]]): (xs: readonly T[]) => readonly T[] 
export function array_unappend<T>(predicate: (x: T, y: T) => boolean): (xs: readonly T[]) => readonly T[] 
export function array_unappend<T extends { [x: number]: unknown }>(reference: T): (xs: readonly T[]) => readonly T[] 
export function array_unappend<T extends any.primitive>(value: T): (xs: readonly T[]) => readonly T[] 
export function array_unappend(
  ...args: 
    | [predicate: (x: any, y: any) => boolean]
    | [reference: {}]
    | [any.primitive, ...any.primitive[]]
): (xs: readonly unknown[]) => readonly unknown[]  {
  const [h, ...t] = args
  const predicate = typeof h === "function" 
    ? array_startsWith(h as never) 
    : array_startsWith(...t.length === 0 ? [(v: any) => globalThis.Object.is(h, v)] : [h, ...t])
  return (xs) => predicate(xs as never) ? xs.slice(0, -(xs.length - 1)) : xs
}

/** 
 * ## {@link array_const `array.const`}
 */
export const array_const
  : <const T extends any.array>(xs: T) => T
  = identity

/** 
 * ## {@link array_filter `array.filter`} 
 */
export type array_filter<T extends any.array, U> = globalThis.Extract<T[number], U>

/** 
 * ## {@link array_filter `array.filter`} 
 */
export function array_filter(filterNullables: globalThis.BooleanConstructor): <const T extends any.array>(xs: T) => any.array<globalThis.NonNullable<T[number]>>
export function array_filter<const T extends any.array, U>(guard: any.typeguard<T[number], U>): (xs: T) => mut.array<U>
// impl.
export function array_filter(predicate: any.predicate) { 
  const fn = predicate === globalThis.Boolean ? (x: unknown) => x != null : predicate
  return <T>(xs: any.array<T>): any.array<T> => xs.filter(fn) 
}

/** 
 * ## {@link array_reverse `array.reverse`} 
 * 
 * {@link array_reverse `array.reverse`} has the same behavior as 
 * {@link globalThis.Array.prototype.reverse `Array.prototype.reverse`},
 * but doesn't mutate its argument.
 * 
 * See also: 
 * - {@link globalThis.Array.prototype.reverse `Array.prototype.reverse`}
 * - {@link array_sort `array.sort`}
 */
export const array_reverse
  : <T>(xs: any.array<T>) => T[] 
  = (xs) => globalThis.structuredClone(xs as [...typeof xs]).reverse() 

/** 
 * ## {@link array_reduce `array.reduce`} 
 * 
 * {@link array_reduce `array.reduce`} has the same behavior as 
 * {@link globalThis.Array.prototype.reduce `Array.prototype.reduce`},
 * but has more predictable type inference because the return type
 * depends on the initial value you give it, rather than the first 
 * argument + return type of the reducer.
 * 
 * See also: 
 * - {@link globalThis.Array.prototype.reduce `Array.prototype.reduce`}
 * - {@link array_reduceRight `array.reduceRight`}
 */
export function array_reduce<T, U>(reducer: (acc: NoInfer<U>, cur: T, ix: number, xs: readonly T[]) => U, init: U): (xs: any.array<T>) => U
export function array_reduce<T, U>(xs: any.array<T>, reducer: (acc: NoInfer<U>, cur: T, ix: number, xs: readonly T[]) => U, init: U): U
export function array_reduce<T, U>(
  ...args: 
    | [reducer: (acc: U, cur: T, ix: number, xs: readonly T[]) => U, init: U]
    | [xs: any.array<T>, reducer: (acc: U, cur: T, ix: number, xs: readonly T[]) => U, init: U]
) {
  if (args.length === 2)
    return (xs: any.array<T>) => array_reduce(xs, ...args)
  else {
    const [xs, reducer, init] = args
    return xs.reduce(reducer, init)
  }
}

/** 
 * ## {@link array_fold `array.fold`} 
 * 
 * Semantics: given an arbitrary Monoid, derives its left-associative 
 * array catamorphism.
 * 
 * Basically this is just shorthand for {@link array_reduce `array.reduce`}.
 * Convenient when you already have a monoid in-hand.
 * 
 * Besides the convenience of using a single identifier to represent a 
 * reducing or folding operation, another subtle benefit to using it is 
 * that type inference works better when the merging operation and neutral 
 * element come pre-paired together (since the type-checker better understands 
 * that there's a relationship between the two).
 * 
 * See also: 
 * - {@link globalThis.Array.prototype.reduce `Array.prototype.reduce`}
 * - {@link array_reduce `array.reduce`}
 */
export function array_fold<T>(M: Monoid<T>): (xs: readonly T[]) => T
  { return (xs: readonly T[]) => xs.reduce(M.concat, M.empty) }

/** 
 * ## {@link array_foldMap `array.foldMap`}
 * 
 * Apply a function to each element _before_ it gets reduced.
 * 
 * More useful than you might think. Contravariance semantics.
 * 
 * See also: 
 * - {@link array_fold `array.fold`}
 */
export function array_foldMap<T>(M: Monoid<T>):
  <S>(mapfn: (s: S, ix: number) => T) 
    => (xs: readonly S[]) 
    => T 
export function array_foldMap<T>(M: Monoid<T>) { 
  return <S>(mapfn: (s: S, ix: number) => T) => 
    (xs: readonly S[]) => 
      xs.reduce((acc, x, ix) => M.concat(acc, mapfn(x, ix)), M.empty) 
}

/** 
 * ## {@link array_reduceRight `array.reduceRight`} 
 * 
 * {@link array_reduceRight `array.reduceRight`} has the same behavior as 
 * {@link globalThis.Array.prototype.reduceRight `Array.prototype.reduceRight`},
 * but has more predictable type inference because the return type
 * depends on the initial value you give it, rather than the first 
 * argument + return type of the reducer.
 * 
 * See also: 
 * - {@link globalThis.Array.prototype.reduceRight `Array.prototype.reduceRight`}
 * - {@link array_reduce `array.reduce`}
 */
export function array_reduceRight<T, U>
  (reducer: (acc: NoInfer<U>, cur: T, ix: number, xs: T[]) => U, init: U): (xs: any.array<T>) => U
export function array_reduceRight<T, U>
  (reducer: (acc: U, cur: T, ix: number, xs: T[]) => U, init: U) /// impl.
  { return (xs: T[]) => xs.reduceRight(reducer, init) }

/** 
 * ## {@link array_sort `array.sort`} 
 * 
 * {@link array_sort `array.sort`} has the same behavior as 
 * {@link globalThis.Array.prototype.sort `Array.prototype.sort`},
 * but doesn't mutate its argument.
 * 
 * See also: 
 * - {@link globalThis.Array.prototype.sort `Array.prototype.sort`}
 * - {@link array_reverse `array.reverse`}
 */
export function array_sort<T>(xs: any.array<T>, compare: Compare<T>): T[]
export function array_sort<T>(compare: Compare<T>): (xs: any.array<T>) => T[]
/// impl.
export function array_sort<T>(
  ...args:
    | [xs: any.array<T>, compare: Compare<T>]
    | [compare: Compare<T>]
) {
  if (args.length === 1) return (xs: any.array<T>) => array_sort(xs, args[0])
  else {
    const [xs, compare] = args
    return globalThis.structuredClone<T[]>(xs as T[]).sort(compare)
  }
}

/**
 * ## {@link array_includes `array.includes`}
 * 
 * {@link array_includes `array.includes`} is similar to 
 * 
 * `Array.prototype.includes`, with 2 notable differences:
 *
 * 1. Unlike `Array.prototype.includes`, which breaks when given an array
 * that was declared with `as const`, `array.includes` handles arrays
 * containing literals gracefully.
 *
 * 2. `array.includes` also doubles as a typeguard on `u`, where possible
 */
export function array_includes<const T extends any.primitives>(xs: T): any.typeguard<unknown, T[number]>
/// impl.
export function array_includes<const T extends any.primitives>(xs: T) { 
  return (u: unknown): u is T[number] => local.isPrimitive(u) && xs.includes(u) 
}

/** 
 * ## {@link array_every `array.every`}
 */
export function array_every<T, U extends T>(guard: any.guard<U>): (xs: any.array<T>) => xs is any.array<U>
export function array_every<T>(predicate: some.predicate<T>): (xs: any.array<T>) => boolean
/// impl.
export function array_every<T>(predicate: some.predicate<T>) { 
  return (xs: any.array<T>) => xs.every(predicate) 
}

export type array_head<T extends any.array> = T[0]
/** 
 * ## {@link array_head `array.head`}
 * 
 * {@link array_head `array.head`} gets the first element (or "head") out of an array 
 *
 * See also: 
 * - {@link array_snd `array.snd`}
 * - {@link array_tail `array.tail`}
 * - {@link array_heads `array.heads`}
 */
export const array_head 
  : <const T extends any.array>(xs: T) => T[0]
  = (xs) => xs[0]

/**
 * ## {@link array_fst `array.fst`} is an alias for {@link array_head `array.head`} 
 */
export const array_fst = array_head
export type array_fst<T extends any.array> = array_head<T>

export type array_snd<T extends any.array> = array_head<array_tail<T>>
/** 
 * ## {@link array_snd `array.snd`}
 * 
 * {@link array_snd `array.snd`} gets the second element out of an array.
 *
 * See also: 
 * - {@link array_head `array.head`}
 * - {@link array_tail `array.tail`}
 * - {@link array_snds `array.snds`}
 */
export const array_snd 
  : <const T extends array_any>(xs: T) => array_snd<T>
  = (xs) => xs[1]

export type array_tail<T extends any.array> = T extends [any, ...infer tail] ? tail : never
/** 
 * ## {@link array_tail `array.tail`}
 * 
 * {@link array_tail `array.tail`} gets the second element out of an array.
 *
 * See also: 
 * - {@link array_head `array.head`}
 * - {@link array_snd `array.snd`}
 * - {@link array_tails `array.tails`}
 */
export const array_tail 
  : <const T extends any.array>(xs: T) => array_tail<T>
  = (xs) => xs.slice(1) as never

export type array_heads<T extends any.array<array_any>> = never | { -readonly [ix in keyof T]: T[ix][0] }
/** 
 * ## {@link array_heads `array.heads`} 
 * 
 * {@link array_heads `array.heads`} takes an array of arrays (or "matrix"), and gets 
 * the first element out of each array.
 * 
 * Useful for example when you have an array of object entries, and need to get all the keys out.
 *
 * See also: 
 * - {@link array_head `array.head`}
 * - {@link array_snds `array.snds`}
 * - {@link array_tails `array.tails`}
 */
export const array_heads: {
  <const T extends any.array<any.array>>(xss: T): { [ix in keyof T]: T[ix][0] }
  <const T extends any.array<any.array>>(...xss: T): { [ix in keyof T]: T[ix][0] }
} = (...xss) => xss.flat().map(array_head as never)

/** 
 * ## {@link array_snds `array.snds`} 
 * 
 * {@link array_snds `array.snds`} takes an array of arrays (or "matrix"), and gets 
 * the second element out of each array.
 * 
 * Useful for example when you have an array of object entries, and need to get all the values out.
 *
 * See also: 
 * - {@link array_snd `array.snd`}
 * - {@link array_heads `array.heads`}
 * - {@link array_tails `array.tails`}
 */
export const array_snds: {
  <const T extends any.array<any.array>>(xss: T): { [ix in keyof T]: T[ix][1] }
  <const T extends any.array<any.array>>(...xss: T): { [ix in keyof T]: T[ix][1] }
} = (...xss) => xss.flat().map(array_snd as never)

export type array_snds<T extends any.array<any.array>> 
  = never | { [ix in keyof T]: T[ix][1] }

export type array_tails<T extends any.array<any.array>> = never | { -readonly [ix in keyof T]: array_tail<T[ix]> }
/** 
 * ## {@link array_tails `array.tails`}
 * 
 * {@link array_tails `array.tails`} takes an array of arrays (or "matrix"), and gets 
 * the all but the first element from each array.
 * 
 * See also: 
 * - {@link array_tail `array.tail`}
 * - {@link array_heads `array.heads`}
 * - {@link array_snds `array.snds`}
 */
export const array_tails: {
  <const T extends any.array<any.array>>(xss: T): { [ix in keyof T]: array_tail<T[ix]> }
  <const T extends any.array<any.array>>(...xss: T): { [ix in keyof T]: array_tail<T[ix]> }
} = (...xss) => xss.flat().map(array_tail as never)

export type array_dequeue<queue extends any.array> = never 
  | number extends queue[`length`] ? [lead: any.array<queue[number]>, last: queue[number] | undefined]
  : queue extends readonly [...infer left, infer last] ? [left: left, last: last]
  : queue
  ;
/**
 * ## {@link array_dequeue `array.dequeue`}
 * 
 * @example
 * import { array } from "@traversable/data/array"
 *
 * const foursup = array.dequeue([7, 6, 5, 4])
 * //    ^? foursup: [left: [7, 6, 5], last: 4]
 *
 * const doremi = array.dequeue({ a: 1 }, { b: 2 }, { c: 3 })
 * //    ^? doremi: [left: [{ a: 1 }, { b: 2 }], last: { c: 3 }]
 *
 * const niner = array.dequeue("did", "i", "hear", "a", "niner", "in", "there")
 * //    ^? const niner: [left: ["did", "i", "hear", "a", "niner", "in"], last: "there"]
 */
export function array_dequeue<const Q extends any.array>(queue: Q): array_dequeue<Q>
export function array_dequeue<const Q extends any.array>(...queue: Q): array_dequeue<Q>
export function array_dequeue(...queue: any.array | [any.array]) { /// impl.
  let xs = queue.flat(1)
  const z = xs.pop()
  return [xs, z]
}

/** 
 * ## {@link array_append `array.append`}
 */
export function array_append<const U>(y: U): 
  <const T extends any.array>(xs: T) => [...T, U]
  { return (xs) => [...xs, y] }

/** 
 * ## {@link array_prepend `array.prepend` 
 */
export function array_prepend<const T>(x: T): 
  <const U extends any.array>(ys: U) => [T, ...U] /// impl.
  { return (ys) => [x, ...ys] }

/** 
 * ## {@link array_flattenOnce `array.flattenOnce`} 
 */
export type array_flattenOnce<S extends any.array, Out extends any.array = []>
  = [S] extends [nonempty.array<infer H, infer T>] 
  ? array_flattenOnce<T, [...Out, ...([H] extends [any.array] ? H : [H])]>
  : Out

/** 
 * ## {@link array_flatMap `array.flatMap`}
 * 
 * Monadic-join semantics
 */
export function array_flatMap<const T, U>
  (xs: readonly T[], fn: (input: T) => any.array<U>): readonly U[]
export function array_flatMap<const T, U>
  (xs: readonly T[], fn: (input: T) => any.array<U>) /// impl.
  { return xs.flatMap(fn) }

void (array_flatMap.defer = array_flatMap_defer)


/** 
 * ## {@link array_flatMap_defer `array.flatMap.defer`}
 * 
 * Data-last variant of {@link array_flatMap `array.flatMap`}
 */
function array_flatMap_defer<const T, U>
  (fn: (input: T, ix: number, xs: readonly T[]) => any.array<U>): 
    (xs: readonly T[]) 
      => readonly U[]
function array_flatMap_defer<const T, U>
  (fn: (input: T, ix: number, xs: readonly T[]) => any.array<U>) /// impl.
  { return (xs: readonly T[]) => xs.flatMap(fn) } 

/** 
 * ## {@link array_flatten `array.flatten`} 
 */
export function array_flatten<const T extends any.array>(xs: T): array_flattenOnce<T, []>
export function array_flatten<const T extends any.array>(xs: T) /// impl.
  { return xs.flat(1) }

// TODO: improve types
/** 
 * ## {@link array_join `array.join`} 
 */
export const array_join 
  : <S extends any.showable>(separator: S) => <const T extends any.array>(xs: T) => string
  = (separator) => (xs) => xs.join(`${separator}`)

export type array_last<T extends any.array> 
  = [T] extends [readonly [...any, infer last]] ? last : never

export type array_lead<T extends any.array> 
  = [T] extends [[...infer Lead, any]] ? Lead
  : [T] extends [readonly [...infer Lead, any]] ? globalThis.Readonly<Lead>
  : never

/** 
 * ## {@link array_last `array.last`} 
 */
export function array_last<const T extends array_finite<T>>(xs: T): array_last<T>
export function array_last<const T extends nonempty.array>(xs: T): T[number]
export function array_last<const T extends any.array>(xs: T): T[number] | undefined // last<xs>
export function array_last<const T extends any.array>(xs: T) { return xs[xs.length - 1] }

/** 
 * ## {@link array_lead `array.lead`} 
 */
export function array_lead<const T extends array_finite<T>>(xs: T): array_lead<T>
export function array_lead<const T extends nonempty.mut.array>(xs: T): [T[0], ...(T[number])[]]
export function array_lead<const T extends mut.array>(xs: T): [] | T[number][]
export function array_lead<const T extends nonempty.array>(xs: T): readonly [T[0], ...(T[number])[]]
export function array_lead<const T extends any.array>(xs: T): readonly [] | readonly (T[number])[]
export function array_lead<const T extends any.array>(xs: T): any.array { return xs.slice(0, -1) }

export type array_indexBy<K extends any.key, T extends any.indexableBy<K>>
  = never | { [U in T[K]]: globalThis.Extract<{ -readonly [x in keyof T]: T[x] }, { [P in K]: U }> }

/**
 * ## {@link array_indexBy `array.indexBy`}
 *
 * @example
 * const ex_01 = array.indexBy("tag")([
 * //     ^? const ex_01: { A: { tag: "A", name: "Janet Planet" }, B: { tag: "B", name: "Bob Ross" } }
 *   { tag: "A", name: "Janet Planet" },
 *   { tag: "B", name: "Bob Ross" },
 * ])
 * console.log(ex_01) // => { A: { tag: "A", name: "Janet Planet" }, B: { tag: "B", name: "Bob Ross" } }
 */
export function array_indexBy<K extends string | number>(index: K):
  <const T extends { -readonly [P in K]: string | number }>(list: readonly T[])
  => { [U in T[K]]: globalThis.Extract<{ -readonly [K in keyof T]: T[K] }, { [P in K]: U }> }
/// impl.
export function array_indexBy<K extends string | number>(index: K) {
  return <const T extends { [P in K]: string | number }>(list: T[]) => {
    const out: { [x: string]: unknown } = {}
    for (const element of list)
      out[element[index]] = element
    return out
  }
}

/** 
 * ## {@link array_find `array.find`} 
 */
export function array_find<S, T extends S>(guard: (src: S) => src is T): (xs: readonly S[]) => T | undefined
export function array_find<T>(pred: Predicate<T>): (xs: readonly T[]) => T | undefined
export function array_find<T>(pred: some.predicate<T>) { return (xs: readonly T[]) => xs.find(pred) }

/** 
 * ## {@link array_findLast `array.findLast`} 
 */
export function array_findLast<T>(predicate: (u: T) => boolean): (xs: readonly T[]) => number
export function array_findLast<T>(predicate: (u: T) => boolean) {
  return (xs: readonly T[]): T | undefined => {
    for (let ix = xs.length - 1; ix >= 0; ix--)
      if (predicate(xs[ix])) return xs[ix]
    return undefined
  }
} 

/** 
 * ## {@link array_indexOf `array.indexOf`} 
 */
export function array_indexOf<T>(predicate: (x: T) => boolean): (xs: readonly T[]) => number
export function array_indexOf<T>(needle: T): (xs: readonly T[]) => number
export function array_indexOf<T>(_: ((x: T) => boolean) | T) {
  const predicate = typeof _ === "function" ? _ as never : (x: T) => x === _
  return (xs: readonly T[]) => {
    for (let ix = 0, len = xs.length; ix < len; ix++)
      if (predicate(xs[ix])) return ix
    return -1
  }
}

/** 
 * ## {@link array_lastIndexOf `array.lastIndexOf`} 
 */
export function array_lastIndexOf<T>(predicate: (x: T) => boolean): (xs: readonly T[]) => number
export function array_lastIndexOf<T>(needle: T): (xs: readonly T[]) => number
export function array_lastIndexOf<T>(_: ((x: T) => boolean) | T) {
  const predicate = typeof _ === "function" ? _ as never : (x: T) => x === _
  return (xs: readonly T[]): number => {
    for (let ix = xs.length - 1; ix >= 0; ix--)
      if (predicate(xs[ix])) return ix
    return -1
  }
} 

/** 
 * ## {@link array_getSemigroup `array.getSemigroup`} 
 */
export function array_getSemigroup<T = never>(): Semigroup<readonly T[]> {
  return ({ concat: (l, r) => l.length === 0 ? r : r.length === 0 ? l : l.concat(r) })
}

/** 
 * ## {@link array_getMonoid `array.getMonoid`} 
 */
export const array_getMonoid
  : <T = never>() => Monoid<readonly T[]> 
  = () => ({ concat: array_getSemigroup().concat, empty: local.array_getEmpty() })

/** 
 * ## {@link array_prefix `array.prefix`} 
 * 
 * @example
 *  import { array } from "@traversable/data"
 * 
 *  const ex_01 = array
 */
export function array_prefix<const T extends keys.any, Add extends prop.any>
  (keys: T, prefix: Add): { -readonly [ix in keyof T]: key.prefix<T[ix], Add> }
export function array_prefix(keys: keys.any, prefix: prop.any) 
  { return keys.map(key.prefix(prefix)) }

export type array_prefix<T extends keys.any, Add extends prop.any> 
  = never | { -readonly [ix in keyof T]: key.prefix<T[ix], Add> }

/** 
 * ## {@link array_prefix.defer `array.prefix.defer`} 
 * ### ｛ {@link jsdoc.curried ` ️🍛‍ ` } ｝
 * 
 * In cases where you need to append the same prefix in more than one place,
 * {@link array_prefix.defer `array.prefix.defer`} provides support for
 * "deferring" when  the data, making it easier to re-use.
 * 
 * This is sometimes called a function's "data-last" variant, which is a special
 * case of [currying](https://en.wikipedia.org/wiki/Currying), one that is optimized 
 * for [function composition](https://en.wikipedia.org/wiki/Function_composition).
 * 
 * @example
 *  import { array, fn } from "@traversable/data"
 * 
 *  const routes_01 = ["trends/bookers/breakdown", "trends/bookers/top_by_adr", "trends/bookers/top_by_quantity"] as const
 *  const routes_02 = ["trends/departments/breakdown", "trends/departments/top_by_adr", "trends/departments/top_by_quantity"] as const
 *  
 *  const rmTrends = array.prefix.defer("trends/")
 *  const rmBookers = array.prefix.defer("bookers/")
 *  const rmDepartments = array.prefix.defer("departments/")
 *  
 *  const ex_01 = rmTrends(routes_01)
 *  //       ^/?  const ex_01: ["bookers/breakdown", "bookers/top_by_adr", "bookers/top_by_quantity"]
 *  const ex_02 = rmBookers(ex_01)
 *  //       ^/? const ex_02: ["breakdown", "top_by_adr", "top_by_quantity"]
 *  const ex_03 = rmTrends(routes_02)
 *  //       ^/?  const ex_03: ["departments/breakdown", "departments/top_by_adr", "departments/top_by_quantity"]
 *  const ex_04 = rmDepartments(ex_02)
 *  //       ^/? const ex_04: ["breakdown", "top_by_adr", "top_by_quantity"]
 */
array_prefix.defer = 
  <P extends prop.any>(prefix: P) => 
  <const KS extends keys.any>(keys: KS) => 
  array_prefix(keys, prefix)


/** 
 * ## {@link array_unprefix `array.unprefix`} 
 * 
 * @example
 *  import { array } from "@traversable/data"
 * 
 *  const ex_01 = array
 */
export function array_unprefix<const T extends keys.any, Rm extends prop.any>
  (keys: T, remove: Rm): { -readonly [x in keyof T]: key.unprefix<T[x], Rm> }
export function array_unprefix(keys: keys.any, remove: prop.any) 
  { return keys.map(key.unprefix(remove)) }

export type array_unprefix<T extends keys.any, Rm extends prop.any> 
  = never | { -readonly [x in keyof T]: key.unprefix<T[x], Rm> }

/** 
 * ## {@link array_unprefix.defer `array.unprefix.defer`} 
 * ### ｛ {@link jsdoc.curried ` ️🍛‍ ` } ｝
 * 
 * In cases where you need to remove the same prefix in more than one place,
 * {@link array_unprefix.defer `array.unprefix.defer`} provides support for
 * "deferring" the data, making it easier to re-use.
 * 
 * This is sometimes called a function's "data-last" variant, which is a special
 * case of [currying](https://en.wikipedia.org/wiki/Currying), one that is optimized 
 * for [function composition](https://en.wikipedia.org/wiki/Function_composition).
 * 
 * @example
 *  import { array, fn } from "@traversable/data"
 * 
 *  const routes_01 = ["trends/bookers/breakdown", "trends/bookers/top_by_adr", "trends/bookers/top_by_quantity"] as const
 *  const routes_02 = ["trends/departments/breakdown", "trends/departments/top_by_adr", "trends/departments/top_by_quantity"] as const
 *  
 *  const rmTrends = array.unprefix.defer("trends/")
 *  const rmBookers = array.unprefix.defer("bookers/")
 *  const rmDepartments = array.unprefix.defer("departments/")
 *  
 *  const ex_01 = rmTrends(routes_01)
 *  //       ^/?  const ex_01: ["bookers/breakdown", "bookers/top_by_adr", "bookers/top_by_quantity"]
 *  const ex_02 = rmBookers(ex_01)
 *  //       ^/? const ex_02: ["breakdown", "top_by_adr", "top_by_quantity"]
 *  const ex_03 = rmTrends(routes_02)
 *  //       ^/?  const ex_03: ["departments/breakdown", "departments/top_by_adr", "departments/top_by_quantity"]
 *  const ex_04 = rmDepartments(ex_02)
 *  //       ^/? const ex_04: ["breakdown", "top_by_adr", "top_by_quantity"]
 */
array_unprefix.defer = 
  <P extends prop.any>(prefix: P) => 
  <const KS extends keys.any>(keys: KS) => 
  array_unprefix(keys, prefix)

/** 
 * ## {@link array_capitalize `array.capitalize`} 
 * 
 * @example
 *  import { array } from "@traversable/data"
 * 
 *  const ex_01 = array
 */
export function array_capitalize<const T extends keys.any>(keys: T): 
  { -readonly [x in keyof T]: key.capitalize<T[x]> }
export function array_capitalize(keys: keys.any) 
  { return keys.map(key.capitalize) }

export type array_capitalize<T extends keys.any> = never | { -readonly [x in keyof T]: key.capitalize<T[x]> }

/** 
 * ## {@link array_uncapitalize `array.uncapitalize`} 
 * 
 * @example
 *  import { array } from "@traversable/data"
 * 
 *  const ex_01 = array
 */
export function array_uncapitalize<const T extends keys.any>(keys: T): 
  { -readonly [x in keyof T]: key.uncapitalize<T[x]> }
export function array_uncapitalize(keys: keys.any) 
  { return keys.map(key.uncapitalize) }
export type array_uncapitalize<T extends keys.any> 
  = never | { -readonly [x in keyof T]: key.uncapitalize<T[x]> }

/** 
 * ## {@link array_lowercase `array.lowercase`} 
 * 
 * @example
 *  import { array } from "@traversable/data"
 * 
 *  const ex_01 = array.lowercase("YES", "NO", "MAYBE", "I", "DON'T", "KNOW")
 *  //     ^?     const ex_01: ["yes", "no", "maybe", "i", "don't", "know"]
 *  console.log(ex_01)   // => ["yes", "no", "maybe", "i", "don't", "know"]
 * 
 *  const ex_02 = array.lowercase(["Can", "you", "repeat", "the", "question"])
 *  //     ^?     const ex_02: ["can", "you", "repeat", "the", "question"]
 *  console.log(ex_02)   // => ["CAN", "YOU", "REPEAT", "THE", "QUESTION"]
 *  
 *  const ex_03 = array.lowercase(["Smells", "Like", "Teen", "Spirit",  1991])
 *  //     ^?      const ex_03: ["smells", "like", "teen", "spirit", "1991"]
 *  console.log(ex_03)    // => ["smells", "like", "teen", "spirit", "1991"]
 */
export function array_lowercase<const T extends keys.any>(keys: T): { -readonly [x in keyof T]: key.lowercase<T[x]> }
export function array_lowercase(...args: keys.any | [keys.any]) { return args.flat(1).map(key.lowercase) }
export type array_lowercase<T extends keys.any> = never | { -readonly [x in keyof T]: key.lowercase<T[x]> }

/** 
 * ## {@link array_uppercase `array.uppercase`} 
 * 
 * @example
 *  import { array } from "@traversable/data"
 * 
 *  const ex_01 = array.uppercase("yes", "no", "maybe", "i", "don't", "know")
 *  //     ^?     const ex_01: ["YES", "NO", "MAYBE", "I", "DON'T", "KNOW"]
 *  console.log(ex_01)   // => ["YES", "NO", "MAYBE", "I", "DON'T", "KNOW"]
 * 
 *  const ex_02 = array.uppercase(["can", "you", "repeat", "the", "question"])
 *  //     ^?     const ex_02: ["CAN", "YOU", "REPEAT", "THE", "QUESTION"]
 *  console.log(ex_02)   // => ["CAN", "YOU", "REPEAT", "THE", "QUESTION"]
 *  
 *  const ex_03 = array.uppercase(["smells", "Like", "Teen", "Spirit",  1991])
 *  //     ^?      const ex_03: ["SMELLS", "LIKE", "TEEN", "SPIRIT", "1991"]
 *  console.log(ex_03)    // => ["SMELLS", "LIKE", "TEEN", "SPIRIT", "1991"]
 */
export function array_uppercase<const T extends keys.any>(keys: T): { -readonly [x in keyof T]: key.uppercase<T[x]> }
export function array_uppercase(keys: keys.any) { return keys.map(key.uppercase) }
export type array_uppercase<T extends keys.any> = never | { -readonly [x in keyof T]: key.uppercase<T[x]> }

/** 
 * ## {@link array_camel `array.camel`} 
 * 
 * @example
 *  import { array } from "@traversable/data"
 * 
 *  const ex_01 = array
 */
export const array_camel: {
  <const T extends keys.any>(keys: T): { -readonly [x in keyof T]: key.camel<T[x]> }
  <const T extends keys.any, Sep extends string>(keys: T, separator: Sep): { -readonly [x in keyof T]: key.camel<T[x], Sep> }
} = (keys: keys.any, separator = "_") => keys.map((k) => key.camel(k, separator))
export type array_camel<T extends keys.any, Sep extends string = "_"> = never | { -readonly [x in keyof T]: key.camel<T[x], Sep> }


/** 
 * ## {@link array_pascal `array.pascal`} 
 * 
 * @example
 *  import { array } from "@traversable/data"
 * 
 *  const ex_01 = array 
 */
export const array_pascal: {
  <const T extends keys.any>(keys: T): { -readonly [x in keyof T]: key.pascal<T[x]> }
  <const T extends keys.any, Sep extends string>(keys: T, separator: Sep): { -readonly [x in keyof T]: key.pascal<T[x], Sep> }
} = (keys: keys.any, separator = "_") => keys.map((k) => key.pascal(k, separator))
export type array_pascal<T extends keys.any, Sep extends string = "_"> = never | { -readonly [x in keyof T]: key.pascal<T[x], Sep> }

/**
 * ## {@link array_zip `array.zip`}
 * ### ｛ {@link jsdoc.combining ` 🪢 `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 * 
 * Takes 2 arrays (`L` and `R`), and returns an array of 2-tuples whose length 
 * is the _shorter_ of the two input arrays, where the element at index `n` in the 
 * output array is contains the elements in `L` and `R` at `n` joined pairwise.
 * 
 * {@link array_zip `array.zip`} __preserves__ as much __structure__ as possible at 
 * the type-level, without needing to resort to recursion. This works because the
 * output type is homomorphic with regard to its inputs.
 * 
 * @example
* 
*  import { array } from "@traversable/array"
*  
*  const ex_01 = array.zip(["L1", "L2", "L3"], ["R1", "R2", "R3"])
*  //     ^? const ex_01: [[x: "L1", y: "R1"], [x: "L2", y: "R2"], [x: "L3", y: "R3"]]
* 
*  const ex_02 = array.zip(["L1", "L2", "L3"], ["R1"])
*  //     ^? const ex_02: [[x: "L1", y: "R1"]]
* 
*  const ex_03 = array.zip(["L1", "L2", "L3", "L4", "L5", "L6"], ["R1", "R2"])
*  //     ^? const ex_03: [[x: "L1", y: "R1"], [x: "L2", y: "R2"]]
*  
*  const ex_04 = array.zip(Array.from({ length: Math.random() * 100 }), Array.from({ length: Math.random() * 100 }))
*  //     ^? const ex_04: [x: unknown, y: unknown][]
*/

export function array_zip<
 const L extends readonly unknown[],
 const R extends any.indexedBy<keyof L>
> (left: L, right: R): { -readonly [I in keyof L]: [x: L[I], y: R[I]] }
export function array_zip<
 const L extends any.indexedBy<keyof R>,
 const R extends readonly unknown[]
> (left: L, right: R): { -readonly [I in keyof R]: [x: L[I], y: R[I]] }
export function array_zip<
 const L extends readonly unknown[], 
 const R extends readonly unknown[]
> (left: L, right: R): [x: L[number], y: R[number]][]
/// impl.
export function array_zip(xs: readonly unknown[], ys: readonly unknown[]): [unknown, unknown][] {
 let out: [unknown, unknown][] = []
 for (let ix = 0; ix < Math_min(xs.length, ys.length); ix++)
   void (out[ix] = [xs[ix], ys[ix]]);
 return out
}

export type array_zip<
  L extends { [x: number]: unknown }, 
  R extends { [y: number]: unknown },
  _ = L extends any.indexedBy<keyof R> ? R 
    : R extends any.indexedBy<keyof L> ? L : never
> = [_] extends [never] ? [x: L[number], y: R[number]][]
  : { -readonly [I in keyof _]: [x: L[I & keyof L], y: R[I & keyof R]] }

/** 
 * ## {@link array_forEach `array.forEach`}
 * ### ｛ {@link jsdoc.empty ` ️🕳️‍ ` } ｝
 * 
 * Same semantics as {@link globalThis.Array.prototype.forEach `Array.prototype.forEach`}.
 */
export function array_forEach<T extends array_any>(xs: T, effect: (x: T[number], ix: number) => void): void
  { return xs.forEach(effect) }

/** 
 * ## {@link array_forEach `array.forEach`}
 * ### ｛ {@link jsdoc.preserves_structure ` ️🌿️ ` } ｝
 * 
 * Derive an array from an {@link globalThis.Iterable `Iterable`}.
 */
export const array_fromIterable
  : <T>(xs: globalThis.Iterable<T>) => Kind<lambda, T>
  = (xs) => globalThis.Array.isArray(xs) ? xs : globalThis.Array.from(xs)

export function array_traverse<F extends HKT>(F: Applicative<F>)
  : <A, B>(f: (a: A) => Kind<F, B>) => (iter: globalThis.Iterable<A>) => Kind<F, B[]> 
  { return (f) => (iter) => F.map(F.of(f), array_fromIterable(iter).map) }
