import { array, fn, object, props, string } from "@traversable/data"
import type { Ext, Extensible as Guard, Negate, Tree, any, never, newtype, some } from "any-ts"

export const symbol_not_found = Symbol.for("@core/guard/symbol::NotFound") 
export type symbol_not_found = typeof symbol_not_found

export declare namespace symbol {
  export { symbol_not_found as not_found }
}
export namespace symbol {
  void (symbol.not_found = symbol_not_found)
  export const isNotNotFound = <T>(u: T): u is Exclude<T, symbol> => u !== symbol.not_found
  export const isNotFound = (u: unknown): u is symbol.not_found => u === symbol.not_found
}

/** @internal */
const integer_is
  : (u: unknown) => u is integer 
  = (u): u is never => typeof u === "number" && globalThis.Number.isInteger(u)

export interface integer<_ extends number = number> extends newtype<number> {}
export declare namespace integer {
  export { integer_is as is }
}
export declare namespace integer {
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
export function integer(u: unknown): u is integer { return integer_is(u) }
export namespace integer {
  integer.is = integer_is
  export const isFinite
    : any.typeguard<unknown, integer.finite>
    = (u): u is never => integer.is(u) && globalThis.Number.isFinite(u)
  export const isInfinite
    : any.typeguard<unknown, integer.infinite>
    = (u): u is never => integer.is(u) && u === globalThis.Number.POSITIVE_INFINITY || u === -(globalThis.Number.POSITIVE_INFINITY)
  export const isNaN 
    : any.typeguard<unknown, integer.NaN>
    = globalThis.Number.isNaN as never
  export const atLeast
    : <Min extends number>(min: Min) => any.typeguard<unknown, integer.atLeast<Min>>
    = (min) => (u): u is never => integer.is(u) && u.valueOf() >= min
  export const atMost
    : <Max extends number>(max: Max) => any.typeguard<unknown, integer.atMost<Max>>
    = (max) => (u): u is never => integer.is(u) && u.valueOf() <= max
  export const multipleOf
    : <Factor extends number>(factor: Factor) => any.typeguard<unknown, integer.multipleOf<Factor>>
    = (factor) => (u): u is never => integer.is(u) && (u.valueOf() % factor) === 0
  export const divisibleBy
    : <Divisor extends number>(divisor: Divisor) => any.typeguard<unknown, integer.divisibleBy<Divisor>>
    = (divisor) => (u): u is never => integer.is(u) && (u.valueOf() / divisor) === 0
  export const within
    : <Bounds extends readonly [min: number, max: number]>([min, max]: Bounds) => any.typeguard<unknown, integer.bounded<Bounds>>
    = (bounds) => (u): u is never => {
      if (!integer.is(u)) return false
      const [min, max] = [...bounds].sort((x, y) => x > y ? 1 : y > x ? -1 : 0)
      const v = u.valueOf()
      return max >= v && v >= min
    }
  export const between
    : <ExclusiveBounds extends readonly [minExclusive: number, maxExclusive: number]>([minExclusive, maxExclusive]: ExclusiveBounds) => 
      any.typeguard<unknown, integer.clamped<ExclusiveBounds>>
    = (bounds) => (u): u is never => {
      if (!integer.is(u)) return false
      const [min, max] = [...bounds].sort((x, y) => x > y ? 1 : y > x ? -1 : 0)
      const v = u.valueOf()
      return max > v && v > min
    }
}

export const isArray = array.is
export const isArrayOf
  : <T>(guard: any.guard<T>) => any.guard<any.array<T>>
  = (guard) => (u: unknown): u is never => globalThis.Array.isArray(u) && u.every(guard)

export type inferTarget<T extends any.guard> = [T] extends [(u: any) => u is infer target] ? target : never
export type inferSource<T extends any.guard> = [T] extends [(u: infer source) => u is any] ? source : never

export const isObject = object.is
export const isPartial
  : <const T extends any.dict<any.guard>>(guards: T) => any.typeguard<unknown, { [K in keyof T]+?: inferTarget<T[K]> }>
  = (guards) => (u): u is never => {
    if (!isRecord(u)) return false
    else {
      for (const k in guards) {
        if (!(k in u)) continue
        else if (!guards[k](u[k])) return false
        else continue
      }
      return true
    }
  }
export const isRecord = object.isRecord

export const isRecordOf
  : <T>(guard: (u: unknown) => u is T) => (u: unknown) => u is { [x: string]: T }
  = (guard) => (u): u is never => {
    return isRecord(u) && globalThis.Object.values(u).every(guard)
  }

export const isFunction = fn.is
export const isString = string.is

export const isDate: any.guard<globalThis.Date> = (u): u is never => u instanceof globalThis.Date

export const isSymbol: any.guard<symbol> = (u): u is never => typeof u === "symbol"

export const isKey: any.guard<any.key> = (u): u is never => ["number", "string"].includes(typeof u)

export const isIndex: any.guard<any.index> = (u): u is never =>
  ["number", "string", "symbol"].includes(typeof u)

export const isPath = <const T extends any.path>(u: unknown): u is T => Array.isArray(u) && u.every(isIndex)

export const isBoolean: any.typeguard<unknown, boolean> = (u): u is never => typeof u === "boolean"
export const isFalse: any.typeguard<unknown, false> = (u): u is false => u === false
export const isTrue: any.typeguard<unknown, true> = (u): u is true => u === true

export const isBigint: any.typeguard<unknown, bigint> = (u): u is never => typeof u === "bigint"

export const isNumber: any.typeguard<unknown, number> = (u): u is never => typeof u === "number"

export function isKeyOf<const type extends any.object>(
  object: type,
): <key extends any.key>(key: key) => key is keyof type & key
export function isKeyOf<const type extends any.object>(object: type) {
  return (key: any.key): key is keyof type & any.key => key in object
}

export function isLiterally<T extends boolean | number | string | bigint>(value: T): any.guard<T> 
export function isLiterally<T extends boolean | number | string | bigint>(...values: T[]): any.guard<T> 
export function isLiterally(...vs: (boolean | number | string | bigint)[]) {
  return (u: unknown): u is never => isLiteral(u) && vs.includes(u)
}

export function has<K extends any.index>(key: K): any.typeguard<unknown, any.indexedBy<K>> // (unknown: unknown) => unknown is any.indexedBy<key>
export function has<K extends any.index, V>(
  key: K,
  guard: any.guard<V>,
): any.typeguard<unknown, { [k in K]: V }>
export function has<const P extends any.path>(path: P): any.typeguard<unknown, Tree.traversableBy<P>>
export function has<const P extends any.path, V>(
  path: P,
  guard: any.guard<V>,
): any.typeguard<unknown, Tree.unfold<P, V>>
// impl.
export function has(pathspec: any.key | any.path, guard: any.guard<{}> = notNullable) {
  return (u: unknown): u is never => {
    if (u === null || typeof u !== "object") return false
    else if (isKey(pathspec)) {
      return isKeyOf(u)(pathspec) && guard(u[pathspec])
    }
    else {
      const out = pathspec.reduce(
        (acc, k) => (isObject(acc) && k in acc ? acc[k as string] : null),
        u as any.struct,
      )
      return guard(out) && symbol.isNotNotFound(out)
    }
  }
}

export function and<L, R>(left: any.guard<L>, right: any.guard<R>): any.typeguard<unknown, L & R> {
  return (u): u is never => left(u) && right(u)
}

export function or<L, R>(left: any.guard<L>, right: any.guard<R>): any.typeguard<unknown, L | R> {
  return (u): u is never => left(u) || right(u)
}

export const isPrimitive: any.guard<any.primitive> = (u): u is never =>
  ["number", "string", "symbol", "bigint", "boolean"].includes(typeof u) || isNullable(u)

export const isShowable: any.guard<any.showable> = (u): u is never =>
  isNullable(u) || ["number", "string", "bigint", "boolean"].includes(typeof u) 

export const isScalar: any.guard<any.literal> = (u): u is never =>
  ["number", "string", "boolean"].includes(typeof u)

export const isLiteral: any.guard<any.literal> = (u): u is never =>
  ["number", "string", "boolean", "bigint"].includes(typeof u)

export const isUndefined: any.guard<undefined> = (u): u is never => typeof u === "undefined"

export const isNull: any.typeguard<unknown, null> = (u): u is never => u === null

export const isNullable: any.typeguard<unknown, null | undefined> = (u): u is never => u == null

/**
 * ### {@link not `is.not`}
 *
 * {@link not `not`} accepts an arbitrary predicate,
 * and returns a **new predicate** with the **logic inverted**.
 *
 * So if the function you give it would have returned `true` for a
 * certain input, it will now also return `false`.
 *
 * The runtime logic for that operation is trivial. The innovation
 * that this combinator brings is that it also inverts that logic
 * _at the type-level_.
 *
 * ### Try it out
 * - {@link https://tsplay.dev/mpooaN TypeScript playground}
 *
 * Credit goes to Kristian Notari for figuring out how to get this to work 🎉
 * https://github.com/kristiannotari
 *
 * @example
 *  import { is } from "@traversable/core"
 *
 *  declare const maybeDef456:
 *    | { def: 456 }
 *    | null
 *    | undefined
 *
 *  if(is.not(is.nullable)(maybeDef456)) {
 *    maybeDef456
 *    // ^? const maybeDef456: { def: 456 } 😌
 *  }
 */
export function not<fn extends Guard<any>>(fn: fn): Negate<fn>
export function not<from, to extends from>(fn: any.typeguard<from, to>): Negate<Ext.extend<from, to>>
export function not<type>(fn: some.predicate<type>): some.predicate<type>
export function not(fn: Guard<any> | any.typeguard | any.predicate) {
  return (u: unknown) => !fn(u)
}

export const notNullable = not(isNullable)
export const nonNullable = (u: unknown): u is any.nonnullable => Boolean(u)
export const notUndefined = not(isUndefined)
export const notNull = not(isNull)

type Factories<_ extends any.key> = never | any.dict<{ new (): { [tag in _]: any.key } }>
type prefixed<ctors, union> =
  | never
  | {
      -readonly [k in keyof ctors as k extends any.key ? `is${Capitalize<`${k}`>}` : k]: any.typeguard<
        union,
        some.instanceOf<ctors[k]>
      >
    }

type unprefixed<ctors, union> =
  | never
  | { -readonly [k in keyof ctors]: any.typeguard<union, some.instanceOf<ctors[k]>> }

const removePrefix = (key: string | symbol) =>
  typeof key === "string" && key.startsWith("is") ? key.substring(2) : key

type fromFactories<
  types extends any.dict<{ new (): { [tag in _]: any.key } }>,
  _ extends any.key,
  withPrefixes extends "withPrefixes" = never,
> =
  | never
  | ([types[keyof types]] extends [{ new (): any.indexedBy<_, infer union> }]
      ? [withPrefixes] extends [never]
        ? unprefixed<types, union>
        : prefixed<types, union>
      : never.close.inline_var<"union">)

export function createFromFactories<_ extends any.key>(
  tag: _,
): {
  <T extends Factories<_> = never>(): fromFactories<T, _>
  <T extends Factories<_>>(factories: T): fromFactories<T, _>
}
export function createFromFactories<_ extends any.key>(
  tag: _,
  withPrefixes: "withPrefixes",
): {
  <T extends Factories<_> = never>(): fromFactories<T, _, "withPrefixes">
  <T extends Factories<_>>(factories: T): fromFactories<T, _, "withPrefixes">
}
// impl.
export function createFromFactories<_ extends any.key>(_tag: _, withPrefixes?: "withPrefixes") {
  return () => {
    return new globalThis.Proxy(
      {},
      {
        get(_target, discriminant, _receiver) {
          return (u: unknown) => {
            const tag = withPrefixes ? removePrefix(discriminant) : discriminant
            return typeof u === "object" && u !== null && _tag in u && u[_tag as never] === tag
          }
        },
      },
    )
  }
}

export const fromFactories = createFromFactories("_tag")
export const withPrefixes = createFromFactories("_tag", "withPrefixes")
