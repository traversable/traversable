import type { integer } from "@traversable/data"
import type { Compare } from "../exports.js"

/** @internal */
type NoInfer<T> = [T][T extends T ? 0 : never]
/** @internal */
const toGreatestLowerBound = (u: unknown): number => typeof u === "number" ? u : globalThis.Number.NEGATIVE_INFINITY
/** @internal */
const toLeastUpperBound = (u: unknown): number => typeof u === "number" ? u : globalThis.Number.POSITIVE_INFINITY
/** @internal */
const toLength = (x: readonly unknown[]): number => x.length

/** @internal */
const _order_boolean_ascending = ((l, r) => l === false ? -1 : r === false ? 1 : 0) satisfies Compare<boolean>
/** @internal */
const _order_number_ascending = ((l, r) => l > r ? 1 : r > l ? -1 : 0) satisfies Compare<number>
/** @internal */
const _order_integer_ascending = ((l, r) => _order_number_ascending(Math.round(l.valueOf()), Math.round(r.valueOf()))) satisfies Compare<integer>
/** @internal */
const _order_string_ascending = ((left, right) => sign.CLAMP(left.localeCompare(right))) satisfies Compare<string>
/** @internal */
const _order_datetime_ascending 
  = ((l, r) => order_number(l.getTime(), r.getTime())) satisfies Compare<globalThis.Date>
/** @internal */
const _order_date_ascending 
  = ((l, r) => order_string(l.toISOString().substring(0, 10), r.toISOString().substring(0, 10))) satisfies Compare<globalThis.Date>
/** @internal */
const compare_objects
  : (compares: { [x: keyof any]: Compare.any }, keys: (keyof any)[]) => Compare<{ [x: keyof any]: unknown }>
  = (compares, keys) => (left, right) => {
    for (let ix = 0, len = keys.length; ix < len; ix++) {
      const sign = compares[keys[ix]](left[keys[ix]], right[keys[ix]])
      if (sign !== 0) return sign
    }
    return 0
  }

/**
 * ### {@link sign `order.sign`}
 * 
 * See also:
 * - [wikipedia page](https://en.wikipedia.org/wiki/Sign_(mathematics))
 */
export type sign = -1 | 0 | 1
export namespace sign {
  export const MIN = -1
  export type MIN = typeof sign.MIN
  export const MAX = 1
  export type MAX = typeof sign.MAX
  export const ZERO = 0
  export type ZERO = typeof sign.ZERO
  export const FLIP = { "-1": 1, "1": -1, "0": 0, "-0": 0 } as const
  export type FLIP = typeof sign.FLIP
  export const CLAMP
    : (x: number) => sign
    = (x) => 0 > x ? -1 : x > 0 ? 1 : 0
  export const COMBINE
    : (s1: sign, s2: sign) => sign
    = (s1, s2) => s1 === 0 ? s2 : s1
}

/** 
 * {@link order_mapInput `order.mapInput`} is super useful when you need to (for example) sort objects by a 
 * deeply nested key.
 * 
 * In the example below, the type of `compareLengthsIn` tells us:
 * 
 * "Give me a function that maps an input of type `T` to any array value, and I will return
 * you a function that can sort two elements of type `T`".
 * 
 * @example
 *  import { order, Compare } from "@traversable/data"
 * 
 *  ////////////////
 *  /// example 1
 *  const filters = [
 *    { id: 123, label: "DEF" }, 
 *    { id: 456, label: "ABC" }, 
 *    { id: 789, label: "XYZ" },
 *  ]
 *
 *  const sortedByLabel = filters.toSorted(order.mapInput(order.string.ascending, f => f.label))
 *  const sortedById = filters.toSorted(order.mapInput(order.number.ascending, f => f.id))
 *  const sortByLabel = order.deriveSort(order.mapInput(order.string.ascending, f => f.label))
 *  //    ^?  const sortByLabel: Sort<{ label: string }>
 * 
 *  console.log(sortedByLabel) 
 *  // =>
 *  [
 *    { id: 456, label: "ABC" },
 *    { id: 123, label: "DEF" },
 *    { id: 789, label: "XYZ" },
 *  ]
 * 
 *  console.log(sortedById)
 *  // =>
 *  [
 *    { id: 123, label: "DEF" },
 *    { id: 456, label: "ABC" },
 *    { id: 789, label: "XYZ" },
 *  ]
 * 
 *  ////////////////
 *  /// example 2
 *  const receipts = [
 *    { id: 3, createdAt: new Date() },
 *    { id: 1, createdAt: new Date() },
 *    { id: 2, createdAt: new Date() },
 *  ]
 *
 *  const sortedByMostRecent = receipts.sort(
 *    order.mapInput(
 *      order.number.descending,
 *      r => r.createdAt.getTime(), 
 *  ))
 * 
 *  console.log(sortedByMostRecent) 
 *  // =>
 *  [
 *    { id: 1, createdAt: Wed Jul 17 2024 18:58.15 GMT-0500 (Central Daylight Time) },
 *    { id: 2, createdAt: Wed Jul 17 2024 18:58:16 GMT-0500 (Central Daylight Time) },
 *    { id: 3, createdAt: Wed Jul 17 2024 18:58:17 GMT-0500 (Central Daylight Time) },
 *  ]
 */
export const order_mapInput
  : <T, U>(compare: Compare<U>, fn: (t: T) => U) => Compare<T> 
  = (compare, fn) => (left, right) => compare(fn(left), fn(right))

export const order_combine
  : <T>(first: Compare<T>, second: Compare<T>) => Compare<T>
  = (first, second) => (left, right) => sign.COMBINE(first(left, right), second(left, right))

const pipe_mapInput
  : <U>(compare: Compare<U>) => <T>(fn: (t: T) => U) => Compare<T>
  = (compare) => (fn) => order_mapInput(compare, fn)

/** ### {@link order_fromProp `order.fromProp`} */
export const order_fromProp
  : <K extends keyof any, T>(prop: K, compare: Compare<T>) => Compare<{ [P in K]: T }>
  = (prop, compare) => order_mapInput(compare, (x) => x[prop])

/** ### {@link order_coerce `order.coerce`} */
export const order_coerce 
  : (x: number) => sign
  = sign.CLAMP

export const order_reverse
  : <T>(compare: Compare<T>) => Compare<T>
  = (compare) => (l, r) => sign.FLIP[compare(l, r)]

/** ### {@link order_all `order.all`} */
export const order_all
  : <T>(...[head, ...tail]: Compare<T>[]) => Compare<T>
  = (...[head, ...tail]) => (left, right) => {
    let first = head(left, right)
    if (first !== 0) return first
    for (const next of tail) {
      const last = next(left, right)
      if (last !== 0) return last
    }
    return first
  }

/** 
 * ### {@link order_boolean_max `order.booleanMax`} 
 * Alias for {@link order_boolean.max `order.boolean.max`}
 */
export function order_boolean_max(booleans: readonly boolean[]): boolean
export function order_boolean_max<T>(inputs: readonly T[], toBool: (t: T) => boolean): boolean
export function order_boolean_max(xs: readonly unknown[], toBool: (u: unknown) => boolean = globalThis.Boolean): boolean {
  for (let ix = 0, len = xs.length; ix < len; ix++) if (toBool(xs[ix]) === true) return true; return false
}
/** 
 * ### {@link order_boolean_min `order.booleanMin`} 
 * Alias for {@link order_boolean.min `order.boolean.min`}
 */
export function order_boolean_min(booleans: readonly boolean[]): boolean
export function order_boolean_min<T>(inputs: readonly T[], toBool: (t: T) => boolean): boolean
export function order_boolean_min(xs: readonly unknown[], fn: (u: unknown) => boolean = globalThis.Boolean): boolean {
  for (let ix = 0, len = xs.length; ix < len; ix++) if (fn(xs[ix]) === false) return false; return true
}

/////////////////////////////////
/// order_boolean
/** 
 * ### {@link order_boolean `order.boolean`} 
 * 
 * {@link order_boolean `order.boolean`} is both a {@link Compare `Compare`} function for comparing booleans,
 * and a namespace containing a handful of combinators & helpers for mapping and sorting boolean values.
 */
export function order_boolean(left: boolean, right: boolean) { return _order_boolean_ascending(left, right) }
order_boolean.descending = _order_boolean_ascending satisfies Compare<boolean>
order_boolean.max = order_boolean_max
order_boolean.min = order_boolean_min
/// order_boolean
/////////////////////////////////

/**
 * ### {@link order_number_max `order.number.max`}
 * 
 * @param numbers an array of numbers
 * @param min an "empty" (minimum) value
 * @returns the highest number it encountered in {@link numbers `numbers`}
 * 
 * **Note:** Comparing any number to {@link globalThis.NaN `NaN`} returns {@link globalThis.NaN `NaN`}, 
 * which is almost never what you want. To remove this footgun, if {@link order_number_max `order.number.max`} 
 * encounters {@link globalThis.NaN `NaN`}, or if the computed maximum is non-finite according to
 * {@link globalThis.Number.isFinite `Number.isFinite`}, it returns {@link min `min`} instead.
 */
export function order_number_max<N extends number>(numbers: readonly N[], min: NoInfer<N>): N
/**
 * ### {@link order_number_max `order.number.max`}
 * 
 * @param inputs an array of any type {@link T `T`}
 * @param min an "empty" (minimum) value
 * @param toNumber a function that knows how to convert any {@link T `T`} into a number
 * @returns the highest number it encountered after applying {@link toNumber `toNumber`} to each element
 * 
 * **Note:** Comparing any number to {@link globalThis.NaN `NaN`} returns {@link globalThis.NaN `NaN`}, 
 * which is almost never what you want. 
 * 
 * To remove this footgun, if {@link order_number_max `order.number.max`} encounters 
 * {@link globalThis.NaN `NaN`}, or if the computed maximum is non-finite (determined by
 * {@link globalThis.Number.isFinite `Number.isFinite`}), it returns {@link min `min`} instead.
 */
export function order_number_max<T, N extends number>(inputs: readonly T[], min: NoInfer<N>, toNumber: (t: NoInfer<T>) => N): N
/// impl.
export function order_number_max(xs: readonly unknown[], min: number, fn: (u: unknown) => number = toGreatestLowerBound) {
  const reduced = xs.reduce<number>((acc, cur) => globalThis.Math.max(acc, fn(cur)), min); 
  return !globalThis.Number.isFinite(reduced) ? min : reduced
}

/**
 * ### {@link order_number_min `order.number.min`}
 * 
 * @param numbers an array of numbers
 * @param max an "empty" (maximum) value
 * @returns the lowest number it encountered in {@link numbers `numbers`}
 * 
 * **Note:** Comparing any number to {@link globalThis.NaN `NaN`} returns {@link globalThis.NaN `NaN`}, 
 * which is almost never what you want. To remove this footgun, if {@link order_number_min `order.number.min`} 
 * encounters {@link globalThis.NaN `NaN`}, or if the computed maximum is non-finite according to
 * {@link globalThis.Number.isFinite `Number.isFinite`}, it returns {@link max `max`} instead.
 */
export function order_number_min<N extends number>(numbers: readonly N[], max: NoInfer<N>): N
/**
 * ### {@link order_number_min `order.number.min`}
 * 
 * @param inputs an array of any type {@link T `T`}
 * @param max an "empty" (maximum) value
 * @param toNumber a function that knows how to convert any {@link T `T`} into a number
 * @returns the lowest number it encountered after applying {@link toNumber `toNumber`} to each element
 *
 * **Note:** Comparing any number to {@link globalThis.NaN `NaN`} returns {@link globalThis.NaN `NaN`}, 
 * which is almost never what you want. 
 * 
 * To remove this footgun, if {@link order_number_min `order.number.min`} encounters 
 * {@link globalThis.NaN `NaN`}, or if the computed minimum is non-finite (determined by
 * {@link globalThis.Number.isFinite `Number.isFinite`}), it returns {@link max `max`} instead.
 */
export function order_number_min<T, N extends number>(inputs: readonly T[], max: NoInfer<N>, toNumber: (t: NoInfer<T>) => N): N
/// impl.
export function order_number_min(xs: readonly unknown[], max: number, fn: (u: unknown) => number = toLeastUpperBound) {
  const reduced = xs.reduce<number>((acc, cur) => globalThis.Math.min(acc, fn(cur)), max); 
  return !globalThis.Number.isFinite(reduced) ? max : reduced
}


/////////////////////////////////
/// order_number
/** 
 * ### {@link order_number `order.number`} 
 * 
 * {@link order_number `order.number`} is both a {@link Compare `Compare`} function for comparing numbers,
 * and a namespace containing a handful of combinators & helpers for mapping and sorting numeric values.
 */
export function order_number<N extends number>(left: N, right: N): sign
export function order_number(left: number, right: number): sign
export function order_number(left: number, right: number) { return _order_number_ascending(left, right) }
order_number.ascending = _order_number_ascending satisfies Compare<number>
order_number.max = order_number_max
order_number.min = order_number_min
/// order_number
/////////////////////////////////

/////////////////////////////////
/// order_integer
/** 
 * ### {@link order_integer `order.integer`} 
 * 
 * {@link order_integer `order.integer`} is both a {@link Compare `Compare`} function for comparing 
 * {@link integer `integer`} types, and a namespace containing a handful of combinators
 * & helpers for mapping and sorting integer values.
 */
export function order_integer(left: integer, right: integer): sign { return _order_integer_ascending(left, right) }
order_integer.ascending = _order_integer_ascending satisfies Compare<integer>
/// order_integer
/////////////////////////////////

/////////////////////////////////
/// order_string
/** 
 * ### {@link order_string `order.string`} 
 * 
 * {@link order_string `order.string`} is both a {@link Compare `Compare`} function for comparing strings,
 * and a namespace containing a handful of combinators & helpers for mapping and sorting string values.
 */
export function order_string<T extends string>(left: T, right: T): sign { return _order_string_ascending(left, right) }
order_string.ascending = _order_string_ascending satisfies Compare<string>
order_string.lengthAscending = order_mapInput(_order_number_ascending, (s: string) => s.length) satisfies Compare<string>
/// order_string
/////////////////////////////////

/////////////////////////////////
/// order_array
/** 
 * ### {@link order_array.zero `order.array.zero`} 
 * 
 * {@link order_array.zero `order.array.zero`} constructs an empty array. Can be useful as an initializer when calling 
 * {@link globalThis.Array.prototype.reduce `Array.prototype.reduce`}.
 * 
 * Users can specify the array's type by providing a type parameteter at the call site, but in many contexts TypeScript
 * is able to infer type type from its context.
 */
export const order_array_zero
  : <T>() => T[] 
  = () => []

/**
 * ### {@link order_array_max `order.arrayMax`} 
 * Alias for {@link order_array.max `order.array.max`}
 */
export function order_array_max<T>(arrays: readonly (readonly T[])[]): T[]
export function order_array_max<T>(arrays: readonly (readonly T[])[], fn: (ts: readonly T[]) => number): T[]
export function order_array_max<T>(arrays: readonly (readonly T[])[], fn = toLength) {
  return arrays.reduce((acc, cur) => fn(cur) > fn(acc) ? cur : acc, order_array_zero())
}
/** 
 * ### {@link order_array_min `order.arrayMin`} 
 * Alias for {@link order_array.min `order.array.min`}
 */
export function order_array_min<T>(arrays: readonly (readonly T[])[]): T[]
export function order_array_min<T>(arrays: readonly (readonly T[])[], fn: (ts: readonly T[]) => number): T[]
export function order_array_min<T>(arrays: readonly (readonly T[])[], fn = toLength) {
  return arrays.reduce((acc, cur) => fn(cur) < fn(acc) ? cur : acc, order_array_zero())
}

/** ### {@link order_array `order.array`} */
export function order_array<T>(compare: Compare<T>): Compare<readonly T[]> {
  return (l, r) => {
    for (let ix = 0, len = Math.min(l.length, r.length); ix < len; ix++) {
      const sign = compare(l[ix], r[ix])
      if (sign !== 0) return sign
    }
    return _order_number_ascending(l.length, r.length)
  }
}
/** ### {@link order_array.lengthAscending `order.array.lengthAscending`} */
order_array.lengthAscending = order_mapInput(order_number, (x: readonly unknown[]) => x.length) satisfies Compare<readonly unknown[]>
/** ### {@link order_array.lengthDescending `order.array.lengthDescending`} */
order_array.lengthDescending = order_reverse(order_array.lengthAscending)
/** ### {@link order_array.sortLengthAscending `order.array.sortLengthAscending`} */
/** ### {@link order_array.sortLengthDescending `order.array.sortLengthDescending`} */
/** 
 * ### {@link order_array.zero `order.array.zero`} 
 * Alias for {@link order_array_zero `order.arrayZero`}
 */
order_array.zero = order_array_zero
/** ### {@link order_array.max `order.array.max`} */
order_array.max = order_boolean_max
/** ### {@link order_array.min `order.array.min`} */
order_array.min = order_boolean_min
/// order_array
/////////////////////////////////

/////////////////////////////////
/// order_datetime
/** ### {@link order_datetime `order.datetime`} */
export function order_datetime(left: globalThis.Date, right: globalThis.Date): sign { return _order_datetime_ascending(left, right) }
/// order_datetime
/////////////////////////////////

/////////////////////////////////
/// order_date
/** ### {@link order_date `order.date`} */
export function order_date(left: globalThis.Date, right: globalThis.Date): sign { return _order_date_ascending(left, right) }
/// order_date
/////////////////////////////////

/**
 * ### {@link order_object `order.object`}
 * 
 * Given an object whose properties are {@link Compare `Compare`} functions, {@link order_object `order.object`}
 * derives a {@link Compare `Compare`} function that knows how to compare two objects that satisfy the specified
 * properties.
 * 
 * **Note:** The order that the {@link Compare `Compare`} functions will be applied depends on the order that it
 * was added to the {@link compares `compares`} object. If you need to specify the order, take a look at the 2nd 
 * overload.
 * 
 * [Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in#:~:text=keys%20in%20ascending-,chronological,-order%20of%20property)
 * 
 * @example
 *  import { order } from "@traversable/data"
 *
 *  type Table = {
 *    id: number
 *    createdAt: Date
 *    updatedAt: Date
 *    tags: string[]
 *  }
 * 
 *  const byLastTouchThenFewestTags =
 *    //  ^? Compare<{ updatedAt: Date, tags: readonly unknown[] }>
 *    order.object({ updatedAt: order.date.descending, tags: array.lengthAscending }, "updatedAt", "tags")
 */
export function order_object<const T extends { [x: string]: Compare.any }>(compares: T): Compare.object<T>
/**
 * ### {@link order_object `order.object`}
 * 
 * Given an object whose properties are {@link Compare `Compare`} functions, {@link order_object `order.object`}
 * derives a {@link Compare `Compare`} function that knows how to compare two objects that satisfy the specified
 * properties.
 *
 * **Note:** The order that the comparisons will be appied depends first on the order of appearance in {@link keyOrder `keyOrder`},
 * then on its insertion order in {@link compares `compares`}.
 * 
 * [Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in#:~:text=keys%20in%20ascending-,chronological,-order%20of%20property)
 * 
 * @example
 *  import { order } from "@traversable/data"
 *
 *  type Table = {
 *    id: number
 *    createdAt: Date
 *    updatedAt: Date
 *    tags: string[]
 *  }
 * 
 *  const byLastTouchThenFewestTags =
 *    //  ^? Compare<{ updatedAt: Date, tags: readonly unknown[] }>
 *    order.object({ updatedAt: order.date.descending, tags: array.lengthAscending }, "updatedAt", "tags")
 */
export function order_object<const T extends { [x: string]: Compare.any }>(compares: T, ...keyOrder: readonly [keyof T, ...(keyof T)[]]): Compare.object<T>
export function order_object<const T extends { [x: string]: Compare.any }>(
  compares: T, 
  ...keyOrder: readonly [] | readonly [keyof T, ...(keyof T)[]]
): Compare.object<T> {
  if (keyOrder.length === 0) 
    return compare_objects(compares, globalThis.Object.keys(compares))
  else {
    const keys = globalThis.Object.keys(compares)
    let order = [...keyOrder]
    for (let ix = 0, len = keys.length; ix < len; ix++)
      if (!order.includes(keys[ix])) order.push(keys[ix])

    return compare_objects(compares, order)
  }
}

export namespace pipe {
  /** ### {@link pipe_mapInput `order.pipe.mapInput`} */
  export const mapInput = pipe_mapInput
}
