export {
  anything,
  anyOf,
  allOf,
  oneOf,
  array,
  bigint,
  boolean,
  isFalse as false,
  isTrue as true,
  isDate as date,
  defined,
  isFunction as function,
  isIndex as index,
  partial,
  isKey as key,
  isLiteral as literal,
  isLiterally as literally,
  isNull as null,
  isNullable as nullable,
  number,
  object,
  isPath as path,
  isPrimitive as primitive,
  record,
  isScalar as scalar,
  isShowable as showable,
  isString as string,
  isSymbol as symbol,
  isUndefined as undefined,
  nonnullable,
  notNull,
  optional,
  or,
  tuple,
} from "./guard.js"

import type { key, prop } from "@traversable/data"
import type { empty as Empty, nonempty as NonEmpty, has } from "any-ts"

import { 
  any as any_,
  array,
  object,
  record,
} from "./guard.js"

export declare namespace any {
  export {
    any_object as object,
    any_array as array,
    any_record as record,
  }
}
const any_object = object.any
const any_array = any_.array
const any_record = record.any
export namespace any {
  void (any.object = any_object)
  void (any.array = any_array)
  void (any.record = any_record)
}

export declare namespace nonempty {
  export type object_<T> = Extract<T, has.oneProperty<T>>
  export { object_ as object }
}
export namespace nonempty {
  export const object = <T extends Record<string, any>>(u: T): u is nonempty.object<T> =>
    globalThis.Object.keys(u).length > 0
  export const array: <T>(u: readonly T[]) => u is NonEmpty.array<T> = (u): u is NonEmpty.array<never> =>
    u.length > 0
  export function string<T extends string>(u: T): u is T & NonEmpty.string
  export function string(u: unknown): u is NonEmpty.string
  export function string(u: unknown): u is never {
    return typeof u === "string" && u.length > 0
  }
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
  <K extends prop.any, const T extends {}>(struct: T): (key: K) => key is K & keyof T
  <K extends key.any, const T extends {}>(struct: T): (key: K) => key is K & keyof T
} =
  (struct: {}) =>
  (key: key.any): key is never =>
    key in struct
