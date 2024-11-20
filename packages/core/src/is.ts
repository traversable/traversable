import type { empty as Empty, nonempty as NonEmpty, any, has, some } from "any-ts"
import { createFromFactories, fromFactories, symbol, withPrefixes } from "./guard.js"

export const guards = {
  fromFactories,
  createFromFactories,
  withPrefixes,
} as const

export declare namespace nonempty {
  export type object_<T> = Extract<T, has.oneProperty<T>>
  export { object_ as object }
}
export namespace nonempty {
  export const object = <T extends Record<string, any>>(u: T): u is nonempty.object<T> =>
    globalThis.Object.keys(u).length > 0
  export const array: <T>(u: any.array<T>) => u is NonEmpty.array<T> = (u): u is NonEmpty.array<never> =>
    u.length > 0
  export function string<T extends string>(u: T): u is T & NonEmpty.string
  export function string(u: unknown): u is NonEmpty.string
  export function string(u: unknown): u is never {
    return typeof u === "string" && u.length > 0
  }
}

export function and<L, R>(left: any.guard<L>, right: any.guard<R>): any.typeguard<unknown, L & R> {
  return (u): u is never => left(u) && right(u)
}

export function or<L, R>(left: any.guard<L>, right: any.guard<R>): any.typeguard<unknown, L | R> {
  return (u): u is never => left(u) || right(u)
}

export declare namespace empty {
  export type object_<T> = Extract<T, { [K in keyof T]?: never }>
  export { object_ as object }
}
export namespace empty {
  export const array = (u: unknown): u is Empty.array => Array.isArray(u) && u.length === 0
  export const object_ = <T>(u: T): u is empty.object<T> => true
  export const string = (u: unknown): u is "" => u === ""
}

export const keyof: {
  <K extends string, const T extends {}>(struct: T): (key: K) => key is K & keyof T
  <K extends any.key, const T extends {}>(struct: T): (key: K) => key is K & keyof T
  <K extends any.index, const T extends {}>(struct: T): (key: K) => key is K & keyof T
} =
  (struct: {}) =>
  (key: any.index): key is never =>
    key in struct

export {
  has,
  isArray as array,
  isArrayOf as arrayOf,
  isBigint as bigint,
  isBoolean as boolean,
  isFalse as false,
  isTrue as true,
  isDate as date,
  notUndefined as defined,
  isFunction as function,
  isIndex as index,
  integer,
  isPartial as partial,
  isKey as key,
  isLiteral as literal,
  isLiterally as literally,
  isNull as null,
  isNullable as nullable,
  isNumber as number,
  isObject as object,
  isPath as path,
  isPrimitive as primitive,
  isRecord as record,
  isRecordOf as recordOf,
  isScalar as scalar,
  isShowable as showable,
  isString as string,
  isSymbol as symbol,
  symbol as SYMBOL,
  isUndefined as undefined,
  not,
  nonNullable,
  notNull,
  notNullable,
  notUndefined,
} from "./guard.js"
