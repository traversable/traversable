import type { Equal } from "../exports.js"

/** @internal */
const Array_isArray 
  : (u: unknown) => u is readonly unknown[]
  = globalThis.Array.isArray
/** @internal */
const Array_from = globalThis.Array.from
/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const Math_min = globalThis.Math.min
/** @internal */
const Object_is = globalThis.Object.is
/** @internal */
const Object_hasOwn = globalThis.Object.hasOwn

/** ### {@link Equal_any `Equal.any`} */
export type Equal_any<T extends Equal<any> = Equal<any>> = T

/** ### {@link Equal_infer `Equal.infer`} */
export type Equal_infer<T> = [T] extends [Equal<infer U>] ? U : never

/** ### {@link Equal_strict `Equal.strict`} */
export const Equal_strict = <T>(x: T, y: T): boolean => x === y

/** ### {@link Equal_string `Equal.string`} */
export const Equal_string = Equal_strict<string>

/** ### {@link Equal_boolean `Equal.boolean`} */
export const Equal_boolean = Equal_strict<boolean>

/** ### {@link Equal_bigint `Equal.bigint`} */
export const Equal_bigint = Equal_strict<bigint>

/** ### {@link Equal_symbol `Equal.symbol`} */
export const Equal_symbol = Equal_strict<symbol>

/**
 * ### {@link Equal_number `Equal.number`}
 * Compares two numbers for equality.
 *
 * Implementation of
 * [`Number::sameValue`](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types-number-sameValue)
 * spec.
 *
 * tl,dr: it works like {@link globalThis.Object.is `globalThis.Object.is`} rather than `===`, which means:
 *
 * - `NaN` is equal to `NaN`
 * - `+0` is *not* equal to `-0`
 */
export const Equal_number
  : Equal<number> 
  = (x, y) => (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y)

/**
 * ## {@link Equal_mapInput `Equal.mapInput`}
 *
 * {@link Equal_mapInput `Equal.mapInput`} is, IMO, the most useful feature
 * of the `Equal` module.
 *
 * For a nice example, see {@link Equal_date `Equal.date`}.
 *
 * @example
 *  import { Equal } from "@traversable/data"
 *
 *  // convert 2 numbers to integers before comparing them
 *  const integerEqual = Equal.mapInput(Equal.number, Math.round)
 *
 *  interface User { id: number, firstName: string }
 *
 *  // creates an `Equal` for `User` that compares only their `id` properties:
 *  const userEqual = Equal.mapInput(Equal.number, (user: User) => user.id)
 */
export function Equal_mapInput<S, T>(equal: Equal<S>, f: (t: T) => S): Equal<T> {
  return (x, y) => equal(f(x), f(y))
}

/**
 * ### {@link Equal_mapInput.defer `Equal.mapInput.defer`}
 * @category combinators
 *
 * Variant of {@link Equal_mapInput `Equal.mapInput`} that supports partial application.
 */
Equal_mapInput.defer =
  <I, O>(fn: (o: O) => I) =>
  (equals: Equal<I>) =>
    Equal_mapInput(equals, fn)

/** 
 * ## {@link Equal_date `Equal.date`} 
 */
export const Equal_date
  : Equal<globalThis.Date> 
  = Equal_mapInput(Equal_number, (date) => date.getTime())

/**
 * ### {@link Equal_and `Equal.and`}
 * @category combinators
 *
 * For a variant that supports partial application, see {@link Equal_and.defer `Equal.and.defer`}.
 */
export function Equal_and<T>(left: Equal<T>, right: Equal<T>): Equal<T> {
  return (x, y) => left(x, y) && right(x, y)
}

/**
 * ### {@link Equal_and.defer `Equal.and.defer`}
 * @category combinators
 *
 * Variant of {@link Equal_and.defer `Equal.and.defer`} that supports partial application.
 */
Equal_and.defer =
  <T>(second: Equal<T>) =>
  (first: Equal<T>) =>
    Equal_and(first, second)

/**
 * ### {@link Equal_or `Equal.or`}
 * @category combinators
 *
 * For a variant that supports partial application, see {@link Equal_or.defer `Equal.or.defer`}.
 */
export function Equal_or<T>(left: Equal<T>, right: Equal<T>): Equal<T> {
  return (x, y) => left(x, y) || right(x, y)
}

/**
 * ## {@link Equal_or.defer `Equal.or.defer`}
 * @category combinators
 *
 * Variant of {@link Equal_or.defer `Equal.or.defer`} that supports partial application.
 */
Equal_or.defer =
  <T>(second: Equal<T>) =>
  (first: Equal<T>) =>
    Equal_or(first, second)

/**
 * ## {@link Equal_reduce `Equal.reduce`}
 * 
 * To "fold" in this context means to "stack" equivalence relations.
 * 
 * It might be helpful to think of these relations as constraints.
 * Given that, the purpose of {@link Equal_reduce Equal.reduce} is to
 * _reduce_ an array of constraints into a single constraint.
 * 
 * The only thing to remember is that whereas a constraint is (usually)
 * unary, an equivalence relation is always a binary operation.
 */
export function Equal_reduce<T>(head: Equal<T>, tail: globalThis.Iterable<Equal<T>>): Equal<T> {
  return (x, y) => {
    if (!head(x, y)) return false
    for (const equal of tail) 
      if (!equal(x, y)) return false
    return true
  }
}

/**
 * ## {@link Equal_fold.defer `Equal.fold.defer`}
 * @category combinators
 *
 * Variant of {@link Equal_fold `Equal.fold`} that supports partial application.
 */
Equal_reduce.defer =
  <T>(base: Equal<T>) =>
  (rest: Iterable<Equal<T>>) =>
    Equal_reduce(base, rest)

/**
 * ## {@link Equal_identity `Equal.identity`}
 *
 * {@link Equal_identity `Equal.identity`} acts as an identity
 * for any {@link Equal `Equal`}.
 * 
 * In other words, composing or "stacking" any {@link Equal `Equal`} with 
 * {@link Equal_identity `Equal.identity`} is the same thing as 
 * doing nothing at all: we always end up with the same equivalence that
 * we started with.
 */
export const Equal_identity: Equal<unknown> = () => true

/**
 * ## {@link Equal_all `Equal.all`}
 * @category combinators
 */
export const Equal_all: <T>(equals: globalThis.Iterable<Equal<T>>) => Equal<T> =
  (equals) => Equal_reduce(Equal_identity, equals)

/**
 * ## {@link Equal_product `Equal.product`}
 *
 * Given an {@link Equal `Equal<T>`} and an {@link Equal `Equal<U>`},
 * {@link Equal_product `Equal.product`} creates a new {@link Equal `Equal`}
 * that is capable of comparing their
 * [Cartesian product](https://en.wikipedia.org/wiki/Cartesian_product),
 * {@link Equal `Equal<[T, U]>`}.
 *
 * For a variant the supports partial application, see
 * {@link Equal_product.defer `Equal.product.defer`}.
 */
export function Equal_product<T, U>(
  left: Equal<T>,
  right: Equal<U>,
): Equal<readonly [x: T, y: U]> {
  return ([x1, y1], [x2, y2]) => left(x1, x2) && right(y1, y2)
}

/**
 * ## {@link Equal_product.defer `Equal.product.defer`}
 *
 * Curried form of {@link Equal_product `Equal.product`}.
 */
Equal_product.defer =
  <U>(right: Equal<U>) =>
  <T>(left: Equal<T>) =>
    Equal_product(left, right)

/**
 * ## {@link Equal_every `Equal.every`}
 */
export const Equal_every
  : <T>(eqs: globalThis.Iterable<Equal<T>>) => Equal<readonly T[]> 
  = (_) => {
    const eqs = Array_from(_)
    return (x, y) => {
      const len = Math_min(x.length, y.length)
      if (eqs.length < len) return false
      for (let ix = 0; ix < len; ix++)
        if (!eqs[ix](x[ix], y[ix])) return false
      return true
    }
  }

/**
 * ### {@link Equal_some `Equal.some`}
 */
export const Equal_some
  : <T>(eqs: globalThis.Iterable<Equal<T>>) => Equal<readonly T[]> 
  = (_) => {
    const eqs = Array_from(_)
    return (x, y) => {
      const len = Math_min(x.length, y.length)
      if (eqs.length < len) return false
      for(let ix = 0; ix < len; ix++)
        if (eqs[ix](x[ix], y[ix])) return true
      return false
    }
  }

/**
 * ### {@link Equal_tuple `Equal.tuple`}
 *
 * Given a tuple of {@link Equal `Equal`} relations, {@link Equal_tuple `Equal.tuple`}
 * returns a new {@link Equal `Equal`} that compares two tuples, pairwise.
 */
export const Equal_tuple
  : <T extends readonly Equal<never>[]>(...eqs: [...T]) => Equal<{ [I in keyof T]: Equal_infer<T[I]> }> 
  = (...eqs) => Equal_every(eqs)

/**
 * ### {@link Equal_array `Equal.array`}
 *
 * Creates a new {@link Equal `Equal`} for an array of values based
 * on a given {@link Equal `Equal`} for the elements of the array.
 */
export function Equal_array<T>(equal: Equal<T>): Equal<readonly T[]> {
  return (x, y) => {
    if (x.length !== y.length) return false
    for (let ix = 0, len = x.length; ix < len; ix++)
      if (!equal(x[ix], y[ix])) return false
    return true
  }
}

Equal_array.defer = <T>(equiv: Equal<T>) => 
  (left: readonly T[]) => 
    (right: readonly T[]) => 
      Equal_array(equiv)(left, right) 

/**
 * ### {@link Equal_nonemptyArray `Equal.nonemptyArray`}
 *
 * Creates a new {@link Equal `Equal`} for an object or array of values based
 * on a given {@link Equal `Equal`} for the values of the object (or elements of the array).
 */
export const Equal_nonemptyArray
  : <T>(equal: Equal<T>, sequence: globalThis.Iterable<Equal<T>>) => Equal<readonly [T, ...T[]]> 
  = (head, sequence) => {
    const tail = Equal_every(sequence)
    return (x, y) => (!head(x[0], y[0]) ? false : tail(x.slice(1), y.slice(1)))
  }

/**
 * ### {@link Equal_object `Equal.object`}
 *
 * Creates a new {@link Equal `Equal`} for an object of values based
 * on a given {@link Equal `Equal`} for the values of the object.
 */
export function Equal_object
  <const T extends { [x: number]: Equal }>(equal: T): 
    Equal<{ [I in keyof T]: Equal_infer<T[I]> }>
///
export function Equal_object(eqs: { [x: string]: Equal }) {
  const index = Object_keys(eqs)
  return (x: { [x: string]: unknown }, y: { [x: string]: unknown }) => {
    if (
      Array_isArray(x) &&
      Array_isArray(y) &&
      x.length !== y.length
    ) return false

    for (const ix of index) 
      if (!eqs[ix](x[ix], y[ix])) return false
    return true
  }
}

/**
 * ### {@link Equal_struct `Equal.struct`}
 *
 * Given a dictionary whose properties contain {@link Equal `Equal`} relations,
 * {@link Equal_struct `Equal.struct`} creates an {@link Equal `Equal`}
 * for the structure as a whole.
 */
export const Equal_struct
  : <T extends { [x: string]: Equal }>(equal: T) => Equal<{ [K in keyof T]: Equal_infer<T[K]> }> 
  = Equal_object

/**
 * ### {@link Equal_isSameValue `Equal.isSameValue`}
 *
 * Equivalent to `globalThis.Object.is`. Included for completeness.
 *
 * See also:
 *
 * - the TC39 spec for [`SaveValue`](https://tc39.es/ecma262/#sec-samevalue)
 * - {@link globalThis.Object.is `globalThis.Object.is`}
 * - {@link Equal_isSameValueZero `Equal.isSameValueZero`}
 *
 * @example
 *  import { Equal } from "@traversable/data"
 *
 *  // sanity check
 *  console.log(+0 === +0)                   // => true
 *  // so far so good...
 *
 *  console.log(+0 === -0)                   // => true
 *  // 🤔 that... makes sense, I guess?...
 *
 *  console.log(NaN === NaN)                 // => true
 *  // 🙁 that... makes zero sense.
 *
 *  console.log(Object.is(+0, -0))           // => false
 *  console.log(Equal.isSameValue(+0, -0))   // => false
 *
 *  console.log(Object.is(NaN, NaN))         // => true
 *  console.log(Equal.isSameValue(NaN, NaN)) // => true
 */
export function Equal_isSameValue<T>(x: T, y: T): boolean
export function Equal_isSameValue(x: unknown, y: unknown): boolean
export function Equal_isSameValue(x: any, y: any) {
  return (
    /** 
     * If `x === y`, but `1 / x` does not equal `1 / y`, 
     * then either `x === -0`, or `y === -0`.
     * 
     * This is true because in JavaScript:
     * 
     * `(1 / +0) === Number.POSITIVE_INFINITY`
     * `(1 / -0) === Number.NEGATIVE_INFINITY`
     */
    (x === y && (x !== 0 || 1 / x === 1 / y)) ||
    /** 
     * If `x !== x`, then `x === Number.NaN`.
     * If `y !== y`, then `y === Number.NaN`.
     * Therefore, if `x !== x && y !== y`, then `x` and `y` are both `NaN`
     */
    (x !== x && y !== y)
  )
}

/**
 * ### {@link Equal_isSameValueZero `Equal.isSameValueZero`}
 *
 * Triple equals.
 *
 * See also:
 *
 * - the TC39 spec for [`SameValueZero`](https://tc39.es/ecma262/#sec-samevaluezero)
 * - {@link globalThis.Object.is `globalThis.Object.is`}
 * - {@link isSameValue `Equal.isSameValue`}
 *
 * @example
 *  import { Equal } from "@traversable/data"
 *
 *  console.log(+0 === +0)                       // => true
 *  console.log(+0 === -0)                       // => true
 *  console.log(Equal.isSameValueZero(+0, -0))   // => true
 *
 *  console.log(NaN === NaN)                     // => true
 *  console.log(Equal.isSameValueZero(NaN, NaN)) // => true
 */
export function Equal_isSameValueZero<T>(x: T, y: T): boolean
export function Equal_isSameValueZero(x: unknown, y: unknown): boolean
export function Equal_isSameValueZero(x: any, y: any) {
  return x === y
}

/**
 * ### {@link Equal_shallow `Equal.shallow`}
 *
 * Equivalent to applying {@link Equal_isSameValue `Equal.isSameValue`}
 * to each of an array's elements or an object's properties.
 */
export function Equal_shallow<T extends { [x: number]: unknown }>(x: T, y: T): boolean
export function Equal_shallow<T extends { [x: string]: unknown }>(x: T, y: T): boolean
export function Equal_shallow<T extends { [x: string]: unknown }>(x: T, y: T): boolean {
  if (Object_is(x, y)) return true
  if (!x || typeof x !== "object" || !x || typeof y !== "object") return false
  const keys = Object_keys(x)
  if (keys.length !== Object_keys(y).length) return false
  for (let ix = 0, len = keys.length; ix < len; ix++) {
    const k = keys[ix]
    if (!Object_hasOwn(y, k) || !Object_is(x[k], y[k])) return false
  }
  return true
}

/**
 * ### {@link Equal_deep `Equal.deep`}
 *
 * Recursively compare 2 JSON objects for equality by value.
 *
 * Like [lodash.isEqual](https://lodash.com/docs/4.17.15#isEqual) and
 * [underscore.isEqual](https://underscorejs.org/docs/modules/isEqual.html),
 * but ~2-3x faster.
 * 
 * Prior art:
 * - Draws heavily from [`@streamich`'s implementation of `deepEqual`
 *   ](https://github.com/streamich/json-joy/tree/master/src)
 *
 * See also:
 * - {@link Equal_shallow `Equal.shallow`}
 * - {@link globalThis.Object.is `globalThis.Object.is`}
 *
 * @example
 *  import { Equal } from "@traversable/data"
 *
 *  Equal.deep({ a: 1, b: { c: [2, { d: 3 }] } }, { a: 1, b: { c: [2, { d:   3 }] } }) // => ✅
 *  Equal.deep({ a: 1, b: { c: [2, { d: 3 }] } }, { a: 1, b: { c: [2, { d: 300 }] } }) // => 🚫
 */
export function Equal_deep<T>(x: T, y: T): boolean
export function Equal_deep(x: T, y: T): boolean
export function Equal_deep(x: T, y: T): boolean {
  if (Object_is(x, y)) return true 
  let len: number | undefined
  let ix: number | undefined
  let ks: string[]

  if (Array_isArray(x)) {
    if (!Array_isArray(y)) return false
    void (len = x.length)
    if (len !== y.length) return false
    for (ix = len; ix-- !== 0; ) 
      if (!Equal_deep(x[ix], y[ix])) return false
    return true
  }

  if (x && y && typeof x === "object" && typeof y === "object") {
    const yks = Object_keys(y)
    void (ks = Object_keys(x))
    void (len = ks.length)
    if (len !== yks.length) return false
    if (Array_isArray(y)) return false
    for (ix = len; ix-- !== 0; ) {
      const k = ks[ix]
      /** 
       * 2025-01-23 [AHRJ]: handles a false positive edge case
       * @example
       * Equal.deep({ "": [] }, { " ": undefined }) // => true 😵
       */
      if (!yks.includes(k)) return false
      if (!Equal_deep(x[k], y[k])) return false
    }
    return true 
  }
  return false
}

/** 
 * Equivalent to unknown, but with a narrowing profile that's
 * suitable for {@link Equal_deep `Equal.deep`}'s use case.
 */
type T = 
  | null 
  | undefined
  | symbol
  | boolean
  | number
  | bigint
  | string
  | readonly unknown[]
  | { [x: string]: unknown }
  ;
