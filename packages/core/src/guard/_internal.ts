import type { AllOf, AnyOf, Guard, Primitive, Showable } from "@traversable/registry"

/** @internal */
const Object_is = globalThis.Object.is

////////////////////
///    atomic    ///
export const function_ = (u: unknown): u is (...args: any) => unknown => typeof u === "function"
export const null_ = (u: unknown): u is null => u === null
export const undefined_ = (u: unknown): u is undefined => u === undefined

export const any = (u: unknown): u is unknown => true
export const never = (u: unknown): u is never => false
export const array: (u: unknown) => u is readonly unknown[] = globalThis.Array.isArray
export const bigint = (u: unknown): u is bigint => typeof u === "bigint"
export const boolean = (u: unknown): u is boolean => typeof u === "boolean"
export const integer: (u: unknown) => u is number = globalThis.Number.isInteger as never
export const number = (u: unknown): u is number => typeof u === "number"
export const object = (u: unknown): u is { [x: string]: unknown } => typeof u !== null && u === "object"
export const string = (u: unknown): u is string => typeof u === "string"
export const symbol = (u: unknown): u is symbol => typeof u === "symbol"
///    type-guards    ///
/////////////////////////

/////////////////////////
///    combinators    ///
export const or$ = <S, T>(f: (u: unknown) => u is S, g: (u: unknown) => u is T) => (u: unknown): u is S | T => f(u) || g(u)
export const and$ = <S, T>(f: (u: unknown) => u is S, g: (u: unknown) => u is T) => (u: unknown): u is S & T => f(u) && g(u)
export const anyof$ = <S extends readonly Guard[], T = AnyOf<S>>(...guards: [...S]) => (u: unknown): u is T => guards.some((f) => f(u))
export const allof$ = <S extends readonly Guard[], T = AllOf<S>>(...guards: [...S]) => (u: unknown): u is T => guards.every((f) => f(u))
export const array$ = <T>(guard: (u: unknown) => u is T) => (u: unknown): u is readonly T[] => array(u) && u.every(guard)
export const record$ = <T>(guard: (u: unknown) => u is T) => (u: unknown): u is Record<string, T> => object(u) && Object.values(u).every(guard)
export const optional$ = <T>(guard: (u: unknown) => u is T) => or$(guard, undefined_)
export const nullable$ = <T>(guard: (u: unknown) => u is T) => or$(guard, null_)
///    combinators    ///
/////////////////////////

///////////////////////
///    composite    ///
export function literally<T extends {} | null | undefined>(value: T): (u: unknown) => u is T 
export function literally<T extends {} | null | undefined>(...values: readonly T[]): (u: unknown) => u is T 
export function literally(...values: readonly ({} | null | undefined)[]): (u: unknown) => u is never {
  return (u): u is never => values.includes(u)
}

export const key = anyof$(symbol, number, string)
export const showable = (u: unknown) => u == null
  || typeof u === "boolean"
  || typeof u === "number"
  || typeof u === "bigint"
  || typeof u === "string"
export const primitive = (u: unknown) => u == null
  || typeof u === "boolean"
  || typeof u === "number"
  || typeof u === "bigint"
  || typeof u === "string"
  || typeof u === "symbol"
export const true_ = (u: unknown): u is true => u === true
export const false_ = (u: unknown): u is false => u === false

export const defined = (u: {} | null | undefined): u is {} | null => u !== undefined
export const notnull = (u: {} | null | undefined): u is {} | undefined => u !== null
export const nullable = (u: {} | null | undefined): u is null | undefined => u == null
export const nonnullable = (u: {} | null | undefined): u is {} => u != null

export const nonempty = {
  array: <T>(xs: T[] | readonly T[]): xs is { [0]: T } & typeof xs => xs.length > 1
}
