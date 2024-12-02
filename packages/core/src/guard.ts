import type { any, inline, newtype, some } from "any-ts"

import { 
  array as array_, 
  fn, 
  type integer,
  key, 
  type nonempty, 
  object,
  string 
} from "@traversable/data"
import { Invariant, symbol } from "@traversable/registry"

export { 
  optional_ as optional,
  object_ as object,
}

/** @internal */
const Array_isArray = globalThis.Array.isArray
/** @internal */
const hasOwnProperty = globalThis.Object.prototype.hasOwnProperty
/** @internal */
function hasOwn<K extends key.any>(u: unknown, key: K): u is { [P in K]: unknown }
function hasOwn(u: unknown, key: key.any): u is { [x: string]: unknown } {
  return typeof key === "symbol" 
    ? object.isComposite(u) && key in u 
    : hasOwnProperty.call(u, key)
}

export interface Shape { [x: string]: (u: unknown) => boolean }

export type inferTarget<T extends any.guard> = [T] extends [(u: any) => u is infer target] ? target : never
export type inferSource<T extends any.guard> = [T] extends [(u: infer source) => u is any] ? source : never

export type intersect<T> = intersectAll<T extends readonly unknown[] ? T : never, unknown>
export type intersectAll<T extends readonly unknown[], X>
  = T extends nonempty.array<infer F, infer R> ? intersectAll<R, X & F> : X

/** @internal */
const integer_is
  : (u: unknown) => u is integer 
  = (u): u is never => typeof u === "number" && globalThis.Number.isInteger(u)

declare namespace int { export { integer_is as is } }
declare namespace int{
  interface atLeast<_min extends number> extends newtype<number> {}
  interface atMost<_max extends number> extends newtype<number> {}
  interface finite<_ extends number = number> extends newtype<number> {}
  interface infinite<_ extends number = number> extends newtype<number> {}
  interface NaN<_ extends number = number> extends newtype<number> {}
  interface multipleOf<_factor extends number> extends newtype<number> {}
  interface divisibleBy<_divisor extends number> extends newtype<number> {}
  type bounds<min extends number, max extends number> = bounded<[min: min, max: max]>
  interface bounded<_bounds extends readonly [min: number, max: number]> extends newtype<number> {}
  interface clamped<_clamps extends readonly [exclusiveMin: number, exclusiveMax: number]> extends newtype<number> {}
}

function int(u: unknown): u is integer { return integer_is(u) }

namespace int {
  int.is = integer_is
  export const isFinite
    : any.typeguard<unknown, int.finite>
    = (u): u is never => int.is(u) && globalThis.Number.isFinite(u)
  export const isInfinite
    : any.typeguard<unknown, int.infinite>
    = (u): u is never => int.is(u) && u === globalThis.Number.POSITIVE_INFINITY || u === -(globalThis.Number.POSITIVE_INFINITY)
  export const isNaN 
    : any.typeguard<unknown, int.NaN>
    = globalThis.Number.isNaN as never
  export const atLeast
    : <Min extends number>(min: Min) => any.typeguard<unknown, int.atLeast<Min>>
    = (min) => (u): u is never => int.is(u) && u.valueOf() >= min
  export const atMost
    : <Max extends number>(max: Max) => any.typeguard<unknown, int.atMost<Max>>
    = (max) => (u): u is never => int.is(u) && u.valueOf() <= max
  export const multipleOf
    : <Factor extends number>(factor: Factor) => any.typeguard<unknown, int.multipleOf<Factor>>
    = (factor) => (u): u is never => int.is(u) && (u.valueOf() % factor) === 0
  export const divisibleBy
    : <Divisor extends number>(divisor: Divisor) => any.typeguard<unknown, int.divisibleBy<Divisor>>
    = (divisor) => (u): u is never => int.is(u) && (u.valueOf() / divisor) === 0
  export const within
    : <Bounds extends readonly [min: number, max: number]>([min, max]: Bounds) => any.typeguard<unknown, int.bounded<Bounds>>
    = (bounds) => (u): u is never => {
      if (!int.is(u)) return false
      const [min, max] = [...bounds].sort((x, y) => x > y ? 1 : y > x ? -1 : 0)
      const v = u.valueOf()
      return max >= v && v >= min
    }
  export const between
    : <ExclusiveBounds extends readonly [minExclusive: number, maxExclusive: number]>([minExclusive, maxExclusive]: ExclusiveBounds) => 
      (u: unknown) => u is int.clamped<ExclusiveBounds>
    = (bounds) => (u): u is never => {
      if (!int.is(u)) return false
      const [min, max] = [...bounds].sort((x, y) => x > y ? 1 : y > x ? -1 : 0)
      const v = u.valueOf()
      return max > v && v > min
    }
}

declare namespace trap {
  export { trap_any as any }
  /** @internal */
  export type trap_any<
    t, 
    invariant = unknown
  > = [t] extends [infer type] 
  ? [1] extends [type & 0] 
  ? invariant : never : never
}

const assertOptionalsAreTotallyOrdered 
  : (fns: [...fns: ((u: any) => u is unknown)[]]) => [...fns: ((u: any) => u is unknown)[]]
  = (fns: [...fns: ((u: any) => u is unknown)[]]) => {
    const firstIndex = array_.indexOf(schema.isOptional)(fns)
    if (firstIndex >= 0 && fns.slice(firstIndex + 1).some(schema.isOptional))
      return Invariant.UnexpectedRequiredElement("assertOptionalsAreTotallyOrdered")
    else return fns
  }

export const anything
  : <T>(x: T) => x is T
  = (_): _ is never => true



///
///
///


/**
 * ## {@link array_any `core.is.array.any`}
 * 
 * Typeguard that narrows its argument to be an non-finite
 * (unbounded) array whose elements all satisfy {@link guard `guard`}.
 * 
 * For a typeguard that targets a type whose index is
 * [representable](https://en.wikipedia.org/wiki/Representable_functor),
 * see {@link tuple `core.is.tuple`}.
 * 
 * See also: 
 * - {@link tuple `core.is.tuple`}
 * - {@link array_any `core.is.array.any`}
 */
export function array<T>(guard: (u: unknown) => u is T): (u: unknown) => u is array<T>
export function array<T>(guard: (u: unknown) => u is T) 
  { return (u: unknown): u is never => Array_isArray(u) && u.every(guard) }

export interface array<T> extends globalThis.ReadonlyArray<T> {}
void (array.any = array_any)

/**
 * ## {@link array_any `core.is.array.any`}
 * 
 * Typeguard that narrows its argument to the greatest lower bound
 * of the {@link globalThis.Array `Array`} type.
 * 
 * See also: 
 * - {@link array `core.is.array`}
 */
function array_any<T extends trap.any<T>>(u: T): u is globalThis.Extract<any.array, T>
function array_any(u: unknown): u is array_.any
function array_any(u: unknown): u is array_.any 
  /// impl.
  { return array_.is(u) }


// const isPartial
//   : <const T extends any.dict<any.guard>>(guards: T) => any.typeguard<unknown, { [K in keyof T]+?: inferTarget<T[K]> }>
//   = (guards) => (u): u is never => {
//     if (!isRecord(u)) return false
//     else {
//       for (const k in guards) {
//         if (!(k in u)) continue
//         else if (!guards[k](u[k])) return false
//         else continue
//       }
//       return true
//     }
//   }

export const isRecordOf
  : <T>(guard: (u: unknown) => u is T) => (u: unknown) => u is { [x: string]: T }
  = (guard) => (u): u is never => {
    return isRecord(u) && globalThis.Object.values(u).every(guard)
  }

export function isRecord(u: unknown): u is { [x: string]: unknown } { return object.isRecord(u) }
isRecord.of = isRecordOf

export const isFunction = fn.is

export interface isString<
  T extends
  | { (u: unknown): u is string }
  = { (u: unknown): u is string }
> extends newtype<T> {}
export const isString 
  : isString
  = string.is

export const isDate: any.guard<globalThis.Date> = (u): u is never => u instanceof globalThis.Date

export const isSymbol: any.guard<symbol> = (u): u is never => typeof u === "symbol"

export const isKey: any.guard<any.key> = (u): u is never => ["number", "string"].includes(typeof u)

export const isIndex: any.guard<any.index> = (u): u is never =>
  ["number", "string", "symbol"].includes(typeof u)

export const isPath = <const T extends any.path>(u: unknown): u is T => Array_isArray(u) && u.every(isIndex)


export interface isBoolean<
  T extends 
  | { (u: unknown): u is boolean }
  = { (u: unknown): u is boolean }
> extends newtype<T> {}
export const isBoolean
  : isBoolean
  = (u): u is never => typeof u === "boolean"

export const isFalse: (u: unknown) => u is false = (u): u is false => u === false
export const isTrue: (u: unknown) => u is true = (u): u is true => u === true

export interface isNumber<
  T extends 
  | { (u: unknown): u is number }
  = { (u: unknown): u is number }
> extends newtype<T> {}
export const isNumber
  : isNumber 
  = (u): u is never => typeof u === "number"

export interface isBigInt<
  T extends 
  | { (u: unknown): u is bigint }
  = { (u: unknown): u is bigint }
> extends newtype<T> {}
export const isBigInt
  : isBigInt 
  = (u): u is never => typeof u === "bigint"


// type isIntegerPreserveStructure = never | { 
//   (u: unknown, $: { preserveStructure: true }): u is integer;
// }
// type isIntegerLossy = never | { (u: unknown, $: { preserveStructure: true }): u is integer; }
export interface isInteger<
  T extends { 
    (u: unknown): u is number
    (u: unknown, $: { preserveStructure: true }): u is integer
  } = { 
    (u: unknown): u is number
    (u: unknown, $: { preserveStructure: true }): u is integer
  }
  // = { (u: unknown): u is bigint }
> extends newtype<T> {}

export const isInteger
  : isInteger
  = (u): u is number => int.is(u)

export declare namespace Integer {
  interface Options {
    preserveStructure?: boolean
  }
}
export namespace Integer {
  export const defaults = {
    preserveStructure: true,
  } satisfies globalThis.Required<Integer.Options>
}

export function isKeyOf<const type extends any.object>(
  object: type,
): <key extends any.key>(key: key) => key is keyof type & key
export function isKeyOf<const type extends any.object>(object: type) {
  return (key: any.key): key is keyof type & any.key => key in object
}

export function isLiterally<T extends null | undefined | boolean | number | string | bigint>(value: T): (u: unknown) => u is T
export function isLiterally<T extends null | undefined | boolean | number | string | bigint>(...values: T[]): (u: unknown) => u is T
export function isLiterally(...vs: (null | undefined | boolean | number | string | bigint)[]) {
  return (u: unknown): u is never => isLiteral(u) && vs.includes(u)
}

export function and<L, R>(
  left: (u: unknown) => u is L, 
  right: (u: unknown) => u is R
): (u: unknown) => u is L & R {
  return (u): u is never => left(u) && right(u)
}

export function or<L, R>(
  left: (u: unknown) => u is L, 
  right: (u: unknown) => u is R
): (u: unknown) => u is L | R {
  return (u): u is never => left(u) || right(u)
}

export function anyOf<const T extends readonly unknown[]>(
  ...guards: { [x in keyof T]: (u: unknown) => u is T[x] }
): (u: unknown) => u is T[number] { 
  return (u: unknown): u is never => guards.some((fn) => fn(u)) 
}

// export interface allOf<
//   T extends
//   | { (u: unknown): u is allOf<
// > extends newtype<T> {}

export type allOf<T extends readonly unknown[], Out = unknown>
  = T extends nonempty.array<infer H, infer T>
  ? allOf<T, Out & H>
  : Out
  ;

export function allOf<const T extends readonly unknown[]>(
  ...guards: { [x in keyof T]: (u: unknown) => u is T[x] }
): (u: unknown) => u is allOf<T> { 
  return (u: unknown): u is never => guards.every((fn) => fn(u))
} 

export declare function oneOf<Name extends keyof any>(discriminantName: Name): {
  <const T extends readonly ({ [K in Name]: keyof any })[], U extends T[number] = T[number]>(
    ...guards: { [K in keyof T]: (u: unknown) => u is T[K] }
  ): {
    [K in T[number][Name]]: (u: unknown) => u is globalThis.Extract<U, { [P in Name]: K }>
  }
}

export interface isUndefined<
  T extends 
  | { (u: unknown): u is null }
  = { (u: unknown): u is null }
> extends newtype<T> {}

export const isUndefined
  : (u: unknown) => u is undefined 
  = (u): u is never => u === "undefined"

export interface isNull<
  T extends 
  | { (u: unknown): u is null }
  = { (u: unknown): u is null }
> extends newtype<T> {}

export const isNull
  : isNull
  = (u): u is never => u === null

export const isNullable
  : (u: unknown) => u is null | undefined
  = (u): u is never => u == null

export const nonnullable 
  : (u: unknown) => u is {}
  = (u): u is never => u !== null

export const defined
  : <T>(u: T) => u is Exclude<T, undefined>
  = (u): u is never => u !== undefined

export const notNull
  : <T>(u: T) => u is Exclude<T, null>
  = (u): u is never => u !== null

export type Primitive<
  T extends 
  | null | undefined | boolean | symbol | number | bigint | string 
  = null | undefined | boolean | symbol | number | bigint | string
> = T

export interface isPrimitive<
  T extends 
  | { (u: unknown): u is null }
  = { (u: unknown): u is null }
> extends newtype<T> {}

export const isPrimitive
  : isPrimitive
  = (u): u is never =>
     u == null
  || typeof u === "boolean"
  || typeof u === "symbol"
  || typeof u === "number"
  || typeof u === "string"
  || typeof u === "bigint"
  ;

export type Showable<
  T extends 
  | null | undefined | boolean | number | bigint | string
  = null | undefined | boolean | number | bigint | string
> = T

export interface isShowable<
  T extends 
  | { (u: unknown): u is Showable }
  = { (u: unknown): u is Showable }
> extends newtype<T> {}

export const isShowable
  : isShowable
  = (u): u is never =>
    u == null
  || typeof u === "boolean"
  || typeof u === "number"
  || typeof u === "string"
  || typeof u === "bigint"
  ;

export type Scalar<
  T extends 
  | boolean | number | string
  = boolean | number | string
> = T

export interface isScalar<
  T extends 
  | { (u: unknown): u is Scalar }
  = { (u: unknown): u is Scalar }
> extends newtype<T> {}

export const isScalar
  : isScalar
  = (u): u is never => 
       typeof u === "boolean"
    || typeof u === "number"
    || typeof u === "string"

export type Literal<
  T extends 
  | boolean | number | string | bigint
  = boolean | number | string | bigint
> = T

export interface isLiteral<
  T extends 
  | { (u: unknown): u is Literal }
  = { (u: unknown): u is Literal }
> extends newtype<T> {}

export const isLiteral
  : isLiteral
  = (u): u is never => 
       typeof u === "boolean"
    || typeof u === "number"
    || typeof u === "string"
    || typeof u === "bigint"


declare namespace schema {
  type infer<T> = T extends (u: any) => u is infer S ? S : never
  interface Options {
    exactOptionalPropertyTypes?: boolean
  }
}
namespace schema {
  export const defaults = {
    exactOptionalPropertyTypes: false,
  } satisfies globalThis.Required<schema.Options>
  export function isOptional<T>
    (u: unknown): u is optional_<T> { return !!(u as { [x: symbol]: unknown })[symbol.optional] }
  export function isRequired<T>
    (u: unknown): u is (_: unknown) => _ is T { return !schema.isOptional(u) }
  export function isOptionalNotUndefined<T>
    (u: unknown): u is optional_<T> { 
      return schema.isOptional(u) && u(undefined) === false
    }
}

function validateShape<T extends { [x: string]: (u: any) => boolean }>
  (shape: T, u: { [x: string]: unknown }): boolean
function validateShape<T extends { [x: number]: (u: any) => boolean }>
  (shape: T, u: { [x: number]: unknown }): boolean
function validateShape<T extends { [x: string]: (u: any) => boolean }> 
  (shape: T, u: { [x: string]: unknown }) {
    for (const k in shape) {
      const check = shape[k]
      switch (true) {
        case schema.isOptional(shape[k]) && !hasOwn(u, k): continue
        case schema.isOptional(shape[k]) && hasOwn(u, k) && u[k] === undefined: continue
        case schema.isOptional(shape[k]) && hasOwn(u, k) && check(u[k]): continue
        case schema.isOptional(shape[k]) && hasOwn(u, k) && !check(u[k]): return false
        case schema.isRequired(shape[k]) && !hasOwn(u, k): return false
        case schema.isRequired(shape[k]) && hasOwn(u, k) && check(u[k]) === true: continue
        case hasOwn(u, k) && check(u[k]) === true: continue
        default: throw globalThis.Error("in 'validateShape': illegal state")
        // TODO: remove this check and `continue` in default (for the semantics, not behavior) 
        // after you've verified that you haven't missed any cases
        // case hasOwn(u, k) && check(u[k]): continue
        // default: continue
      }
    }
    return true
  }


function validateShapeEOPT<T extends { [x: string]: (u: any) => boolean }>
  (shape: T, u: { [x: string]: unknown }): boolean
function validateShapeEOPT<T extends { [x: number]: (u: any) => boolean }>
  (shape: T, u: { [x: number]: unknown }): boolean
function validateShapeEOPT<T extends { [x: string]: (u: any) => boolean }>
  (shape: T, u: { [x: string | number]: unknown }) {
    for (const k in shape) {
      const check = shape[k]
      switch (true) {
        case schema.isOptionalNotUndefined(check) && hasOwn(u, k) && u[k] === undefined: return false
        case schema.isOptional(check) && !hasOwn(u, k): continue // u[k] === undefined: continue
        case !check(u[k]): return false
        default: continue
      }
    }
    return true
  }

export function tuple<T extends readonly unknown[]>
  (...guards: { [ix in keyof T]: (u: unknown) => u is T[ix] }): (u: unknown) => u is T
export function tuple<T extends readonly unknown[]>(
  guards: { [ix in keyof T]: (u: unknown) => u is T[ix] }, 
  options: tuple.Options & { readonly: false }
): (u: unknown) => u is { -readonly [ix in keyof T]: T[ix] }
export function tuple<T extends readonly unknown[]>(
  guards: { [ix in keyof T]: (u: unknown) => u is T[ix] }, 
  options: tuple.Options & { readonly: true }
): (u: unknown) => u is { +readonly [ix in keyof T]: T[ix] }
export function tuple<T extends readonly unknown[]>(
  guards: { [ix in keyof T]: (u: unknown) => u is T[ix] }, 
  options?: tuple.Options
): (u: unknown) => u is { +readonly [ix in keyof T]: T[ix] }
/// impl.
export function tuple(
  ...args:
    | [...fns: ((u: any) => u is unknown)[]]
    | [fns: ((u: any) => u is unknown)[], options?: tuple.Options]
): (u: unknown) => u is never {
  const [shape, _] = array(isFunction)(args) 
    ? [args, tuple.defaults] 
    : [args[0], { ...tuple.defaults, ...args[1] }]
  void assertOptionalsAreTotallyOrdered(shape)
  return (u: unknown): u is never => {
    if (!array.any(u)) return false
    switch (true) {
      case array_.lastIndexOf(schema.isOptional)(shape) > u.length: return false
      case _.exactOptionalPropertyTypes: return validateShapeEOPT(shape, u)
      case !_.exactOptionalPropertyTypes: return validateShape(shape, u)
      default: throw globalThis.Error("in 'tuple': illegal state")
    }
  }
}

export declare namespace tuple {
  export interface Options extends schema.infer<typeof tuple.Options> {}
}

export namespace tuple {
  export const options = {
    /** 
     * ## {@link options.exactOptionalPropertyTypes `tuple.Options.exactOptionalPropertyTypes`}
     */
    exactOptionalPropertyTypes: isBoolean,
    /** 
     * ## {@link options.readonly `tuple.Options.readonly`}
     */
    readonly: isBoolean,
  } as const 

  export const Options = partial(options)

  export const defaults: globalThis.Required<tuple.Options> = {
    ...schema.defaults,
    readonly: false,
  }

  tuple.options.exactOptionalPropertyTypes
}

/**
 * ## {@link optional `is.optional`}
 */
function optional_<T>(guard: (u: unknown) => u is T): optional_<T> 
function optional_<T>(predicate: (u: T) => boolean): optional_<T> 
function optional_(predicate: (u: unknown) => boolean) {
  function optional(src: unknown): src is never 
    { return predicate(src) }
  return globalThis.Object.assign(
    optional, 
    optional_.proto
  ) 
}
optional_.proto = { [symbol.optional]: true } as const

interface optional_
  <T> extends inline<(u: unknown) => u is T>
  { [symbol.optional]?: true }
/** 
 * ## {@link object_any `is.object.any`} 
 */
function object_any(u: unknown): u is object.any { return object.isRecord(u) }

/// 
///
///
interface object_<T extends {}> extends newtype<T> {}
declare namespace object_ { 
  export { object_any as any } 
  export interface Options extends schema.Options {}
}

/**
 * ## {@link object_ `is.object`} 
 */
function object_<
  const T extends { [x: string]: (u: any) => u is unknown }, 
  S extends object.from<T> = object.from<T>
> (shape: T, options?: object_.Options): (u: unknown) => u is object_<S>

function object_<T extends { [x: string]: (u: any) => boolean }>(
  shape: T, _: object_.Options = object_.defaults,
) {
  return (u: unknown): u is never => {
    switch (true) {
      case !object.isRecord(u): return false
      case _.exactOptionalPropertyTypes: return validateShapeEOPT(shape, u)
      case !_.exactOptionalPropertyTypes: return validateShape(shape, u)
      default: throw globalThis.Error("in 'object.of': illegal state")
    }
  }
}

declare namespace object_ {
  type Target<T> = T extends (u: any) => u is infer U ? U : never
  type Pick<T, K extends keyof T> = never | { [P in K]: Target<T[P]> }
  type Part<T, K extends keyof T> = never | { [P in K]+?: Target<T[P]> }
  type OptionalKeys<T, K extends keyof T = keyof T> 
    = K extends K 
    ? T[K] extends { [symbol.optional]?: true } ? K
    : never : never
  type Optional<T, K extends OptionalKeys<T> = OptionalKeys<T>> = never | Part<T, K>
  type Required<T> = never | Pick<T, Exclude<keyof T, OptionalKeys<T>>>
  type Forget<T> = never | { -readonly [K in keyof T]: T[K] }
  type from<T, K extends keyof T = OptionalKeys<T>> = never | Forget<
    & Pick<T, Exclude<keyof T, K>>
    & Part<T, K>
  >
}
namespace object_ { 
  void (object_.any = object_any) 
  export const defaults = {
    ...schema.defaults,
  } satisfies globalThis.Required<object_.Options>
}


/**
 * ## {@link partial `core.is.partial`} 
 * 
 * The {@link partial `core.is.partial`} combinator accepts a 
 * {@link Shape `core.is.Shape`}, and returns a typeguard whose
 * properties are all optional.
 */
export function partial<
  T extends Shape,
  S extends 
  | { [K in keyof T]+?: globalThis.Exclude<schema.infer<T[K]>, undefined> }
  = { [K in keyof T]+?: globalThis.Exclude<schema.infer<T[K]>, undefined> },
>(fields: T, options?: partial.Options): (u: unknown) => u is partial<S>
export function partial(
  shape: Shape,
  _: partial.Options = partial.defaults
) /// impl.
  { 
    let out: { [x: string]: (u: unknown) => u is unknown } = {}
    for (const k in shape) {
      out[k] = schema.isOptional(shape[k]) ? shape[k] : optional_(shape[k])
    }
    return object_(out, _)
  }

/**
 * ## {@link partial `is.partial`} 
 */
export interface partial<T extends {}> extends newtype<T> {}
export declare namespace partial {
  interface Options extends object_.Options {}
}
export namespace partial {
  export const defaults = {
    ...object_.defaults,
  } satisfies globalThis.Required<partial.Options>
}
