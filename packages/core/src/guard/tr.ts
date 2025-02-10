import { fn, map } from "@traversable/data"
import { Invariant, symbol } from "@traversable/registry"
import type { 
  Functor, 
  HKT, 
  Kind, 
  _, 
  newtype 
} from "@traversable/registry"

import type * as Traversable from "../model/traversable.js"
import { has } from "../tree.js"
import * as t from "./ast.js"

///
export type { typeof, Schema } from "./ast.js"
export type { meta as Meta }
interface meta<$> { [symbol.meta]?: $, get meta(): $ }

/** @internal */
type decorate<T, $ = T[symbol.meta & keyof T], _ 
  = { meta: [$] extends [never] ? {} : $ & {} }> = never | _
/** @internal */
function decorate<$>(meta: $): <T>(x: T) => decorate<T, $> 
  { return <T>(x: T) => ({ get meta() { return !!meta ? meta : meta as never }, ...x }) }
/** @internal */
const phantom: never = symbol.phantom as never

/** @internal */
const NotSupported = (...args: Parameters<typeof Invariant.NotYetSupported>) => 
  Invariant.NotYetSupported(...args)("core/src/guard/tr.ts")

//////////////////
///    NULL    ///
export { null_ as null }
function null_<const Meta = {}>(meta?: Meta): null_<Meta> {
  return {
    ...t.null(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): null_.Traversable<Meta> { return null_.toTraversable(meta) },
    _lambda: null_._lambda,
  }
}
interface null_<Meta = {}> extends t.null, meta<Meta> {
  get toTraversable(): null_.Traversable<Meta>
  _lambda: null_._lambda,
}
declare namespace null_ {
  interface Traversable<Meta = {}>
    extends t.null.toJsonSchema 
    { meta: Meta }
  interface _lambda extends HKT<typeof t.null.spec> { [-1]: null_ }
}
namespace null_ {
  export function toTraversable<Meta = {}>
    (meta?: Meta): null_.Traversable<Meta>
  export function toTraversable<Meta = {}>(
    meta: Meta = {} as never
  ): null_.Traversable<Meta> {
    return {
      ...t.null.toJsonSchema,
      meta,
    }
  }
  export const _lambda: null_._lambda = phantom
}
///    NULL    ///
//////////////////


/////////////////////
///    BOOLEAN    ///
export { boolean_ as boolean }
function boolean_<const Meta = {}>(meta?: Meta): boolean_<Meta> {
  return {
    ...t.boolean(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): boolean_.Traversable<Meta> { 
      return boolean_.toTraversable(meta)
    },
    _lambda: boolean_._lambda,
  }
}
interface boolean_<Meta = {}> extends t.boolean, meta<Meta> {
  get toTraversable(): boolean_.Traversable<Meta>
  _lambda: boolean_._lambda,
}
declare namespace boolean_ {
  interface Traversable<Meta = {}>
    extends t.boolean.toJsonSchema 
    { meta: Meta }
  interface _lambda extends HKT<typeof t.boolean.spec> { [-1]: boolean_ }
}
namespace boolean_ {
  export function toTraversable<Meta = {}>
    (meta?: Meta): boolean_.Traversable<Meta>
  export function toTraversable<Meta = {}>(
    meta: Meta = {} as never
  ): boolean_.Traversable<Meta> {
    return {
      ...t.boolean.toJsonSchema,
      meta,
    }
  }
  export const _lambda: boolean_._lambda = phantom
}
///    BOOLEAN    ///
/////////////////////


/////////////////////
///    INTEGER    ///
export { integer_ as integer }
function integer_<const Meta = {}>(meta?: Meta): integer_<Meta> {
  return {
    ...t.integer(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): integer_.Traversable<Meta> { return integer_.toTraversable(meta) },
    _lambda: integer_._lambda,
  }
}
interface integer_<Meta = {}> extends t.integer, meta<Meta> {
  get toTraversable(): integer_.Traversable<Meta>
  _lambda: integer_._lambda
}
declare namespace integer_ {
  interface Traversable<Meta = {}>
    extends t.integer.toJsonSchema 
    { meta: Meta }
  interface _lambda extends HKT<typeof t.integer.spec> { [-1]: integer_ }
}
namespace integer_ {
  export function toTraversable<Meta = {}>
    (meta?: Meta): integer_.Traversable<Meta>
  export function toTraversable<Meta = {}>(
    meta: Meta = {} as never
  ): integer_.Traversable<Meta> {
    return {
      ...t.integer.toJsonSchema,
      meta,
    }
  }
  export const _lambda: integer_._lambda = phantom
}
///    INTEGER    ///
/////////////////////


////////////////////
///    NUMBER    ///
export { number_ as number }
function number_<const Meta = {}>(meta?: Meta): number_<Meta> {
  return {
    ...t.number(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): number_.Traversable<Meta> { return number_.toTraversable(meta) },
    _lambda: number_._lambda,
  }
}
interface number_<Meta = {}> extends t.number, meta<Meta> {
  get toTraversable(): number_.Traversable<Meta>
  _lambda: number_._lambda
}
declare namespace number_ {
  interface Traversable<Meta = {}>
    extends t.number.toJsonSchema 
    { meta: Meta }
  interface _lambda extends HKT<typeof t.number.spec> { [-1]: number_ }
}
namespace number_ {
  export function toTraversable<Meta = {}>
    (meta?: Meta): number_.Traversable<Meta>
  export function toTraversable<Meta = {}>(
    meta: Meta = {} as never
  ): number_.Traversable<Meta> {
    return {
      ...t.number.toJsonSchema,
      meta,
    }
  }
  export const _lambda: number_._lambda = phantom
}
///    NUMBER    ///
////////////////////


////////////////////
///    STRING    ///
export { string_ as string }
function string_<const Meta>(meta?: Meta): string_<Meta> {
  return {
    ...t.string(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): string_.Traversable<Meta> { 
      return string_.toTraversable(meta)
    },
    _lambda: string_._lambda,
  }
}
interface string_<Meta = {}> extends t.string, meta<Meta> {
  get toTraversable(): string_.Traversable<Meta>
  _lambda: string_._lambda
}
declare namespace string_ {
  interface Traversable<Meta = {}>
    extends t.string.toJsonSchema 
    { meta: Meta }
  interface _lambda extends HKT<typeof t.string.spec> { [-1]: string_ }
}
namespace string_ {
  export function toTraversable<Meta = {}>(meta?: Meta): string_.Traversable<Meta>
  export function toTraversable<Meta = {}>(
    meta: Meta = {} as never
  ): string_.Traversable<Meta> {
    return {
      ...t.string.toJsonSchema,
      meta,
    }
  }
  export const _lambda: string_._lambda = phantom
}
///    STRING    ///
////////////////////


/////////////////
///    ANY    ///
export { any_ as any }
function any_<const Meta>(meta?: Meta): any_<Meta> {
  return {
    ...t.any(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): any_.Traversable<Meta> { 
      return any_.toTraversable(meta)
    },
    _lambda: any_._lambda,
  }
}
interface any_<Meta = {}> extends t.any, meta<Meta> {
  get toTraversable(): any_.Traversable<Meta>
  _lambda: any_._lambda
}
declare namespace any_ {
  interface Traversable<Meta = {}> extends t.any.toJsonSchema { meta: Meta }
  interface _lambda extends HKT<typeof t.any.spec> { [-1]: any_ }
}
namespace any_ {
  export function toTraversable<Meta = {}>(meta?: Meta): any_.Traversable<Meta>
  export function toTraversable<Meta = {}>(
    meta: Meta = {} as never
  ) {
    return {
      ...t.any.toJsonSchema,
      meta,
    }
  }
  export const _lambda: any_._lambda = phantom
}
///    STRING    ///
////////////////////

///////////////////
///    CONST    ///
export { const_ as const }
function const_<const T extends typeof t.const.children, const Meta>(
  value: T, 
  meta?: Meta
): const_<T, Meta> { 
  return {
    ...t.const(value),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return const_.toTraversable(value, meta) },
    _lambda: const_._lambda,
  }
}
interface const_<T, Meta = {}> extends t.const<T>, meta<Meta> {
  get toTraversable(): const_.Traversable<T, Meta>
  _lambda: const_._lambda
}
declare namespace const_ {
  interface Traversable<T extends typeof t.const.spec, Meta = {}> extends t.const.toJsonSchema<T> { 
    type: "const"
    const: T & decorate<T>
    meta: Meta
  }
  interface _lambda extends HKT<typeof t.const.spec> { [-1]: const_<this[0]> }
}
namespace const_ {
  export function toTraversable<
    T extends typeof t.const.spec, 
    Meta = {}
  >(spec: T, meta?: Meta): const_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.const.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ) {
    return {
      type: "const",
      ...t.const.toJsonSchema(spec),
      meta,
    }
  }
  export const _lambda: const_._lambda = phantom
}
///    CONST    ///
///////////////////

//////////////////
///    ENUM    ///
export { enum_ as enum }
function enum_<T extends typeof t.enum.children>(...specs: [...T]): enum_<T>
function enum_<T extends typeof t.enum.children, const Meta>(...args: [...T, Meta]): enum_<T, Meta>
function enum_<T extends typeof t.enum.children, const Meta>(
  ...args:
    | [...T, Meta] 
    | [...spec: T]
): enum_<T, Meta> { 
  const [xs, meta] = t.parseArgs(...args)
  return {
    ...t.enum(...xs),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { 
      return enum_.toTraversable(xs, meta) 
    },
    _lambda: enum_._lambda,
  }
}
interface enum_<T extends typeof t.enum.spec, Meta = {}> extends Omit<t.enum<T>, '_lambda'>, meta<Meta> {
  get toTraversable(): enum_.Traversable<T, Meta>
  _lambda: enum_._lambda
}
declare namespace enum_ {
  interface Traversable<T extends typeof t.enum.spec, Meta = {}> extends t.enum.toJsonSchema<T> { 
    type: "enum"
    enum: { [I in keyof T]: T[I]["_type" & keyof T[I]] & decorate<T[I]> }
    meta: Meta
  }
  interface _lambda extends HKT<typeof t.enum.spec> { [-1]: enum_<this[0]> }
}
namespace enum_ {
  export function toTraversable<
    T extends [] | typeof t.enum.spec, 
    Meta = {}
  >(spec: T, meta?: Meta): enum_.Traversable<T, Meta>
  export function toTraversable<T extends [] | typeof t.enum.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ) {
    return {
      type: "enum",
      ...t.enum.toJsonSchema(spec),
      meta,
    }
  }
  export const _lambda: enum_._lambda = phantom
}
///    ENUM    ///
//////////////////


//////////////////////
///    OPTIONAL    ///
export { optional_ as optional }
function optional_<T extends typeof t.optional.children, const Meta>(
  value: T, 
  meta?: Meta
): optional_<T, Meta> { 
  return {
    ...t.optional(value),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return optional_.toTraversable(value, meta) },
    _lambda: optional_._lambda,
  }
}
interface optional_<T, Meta = {}> extends t.optional<T>, meta<Meta> {
  get toTraversable(): optional_.Traversable<T, Meta>
  _lambda: optional_._lambda
}
declare namespace optional_ {
  interface Traversable<T extends typeof t.optional.spec, Meta = {}> 
    extends newtype<{} & t.optional.toJsonSchema<T>> { 
      type: "anyOf"
      anyOf: [T & decorate<T>, const_<undefined>["toJsonSchema"]]
      meta: Meta & { optional: true }
    }
  interface _lambda extends HKT<typeof t.optional.spec> { [-1]: optional_<this[0]> }
}
namespace optional_ {
  export function toTraversable<
    T extends typeof t.optional.spec, 
    Meta = {}
  >(spec: T, meta?: Meta): optional_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.optional.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ) {
    return {
      type: "anyOf",
      anyOf: [spec, { const: undefined }],
      meta: { ...meta, optional: true },
    }
  }
  export const _lambda: optional_._lambda = phantom
}
///    OPTIONAL    ///
//////////////////////


///////////////////
///    ARRAY    ///
export { array_ as array }
function array_<T extends typeof t.array.children, const Meta>(
  value: T, 
  meta?: Meta
): array_<T, Meta> { 
  return {
    ...t.array(value),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { 
      return array_.toTraversable(value, meta)
    },
    _lambda: array_._lambda,
  }
}
interface array_<T, Meta = {}> extends t.array<T>, meta<Meta> {
  get toTraversable(): array_.Traversable<T, Meta>
    _lambda: array_._lambda
}
declare namespace array_ {
  interface Traversable<T extends typeof t.array.spec, Meta = {}> extends t.array.toJsonSchema<T> { 
    meta: Meta
    items: T["toJsonSchema" & keyof T] & decorate<T>
  }
  interface _lambda extends HKT<typeof t.array.spec> { [-1]: array_<this[0]> }
}
namespace array_ {
  export function toTraversable<
    T extends typeof t.array.spec, 
    Meta = {}
  >(spec: T, meta?: Meta): array_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.array.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ) {
    return {
      ...t.array.toJsonSchema(spec),
      meta,
    }
  }
  export const _lambda: array_._lambda = phantom
}
///    ARRAY    ///
///////////////////


////////////////////
///    ALL OF    ///
export { allOf_ as allOf }
function allOf_<T extends typeof t.allOf.spec>(...specs: [...T]): allOf_<T>
// function allOf_<T extends typeof t.allOf.children, Meta>(...args: [...T, Meta]): allOf_<T, Meta>
function allOf_<T extends typeof t.allOf.children, const Meta>(
  ...args:
    | [...T, Meta] 
    | [...spec: T]
): allOf_<T, Meta> { 
  const [xs, meta] = t.parseArgs(...args)
  return {
    ...t.allOf(...xs),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return allOf_.toTraversable(xs, meta) },
    _lambda: allOf_._lambda
  }
}
interface allOf_<T extends typeof t.allOf.spec, Meta = {}> extends t.allOf<T>, meta<Meta> {
  get toTraversable(): allOf_.Traversable<T, Meta>
  _lambda: allOf_._lambda
}
declare namespace allOf_ {
  interface Traversable<T extends typeof t.allOf.spec, Meta = {}> extends t.allOf.toJsonSchema<T> { 
    type: "allOf"
    allOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] & decorate<T[I]> } 
    meta: Meta 
  }
  interface _lambda extends HKT<typeof t.allOf.spec> { [-1]: allOf_<this[0]> }
}
namespace allOf_ {
  export function toTraversable<T extends typeof t.allOf.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): allOf_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.allOf.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ) {
    return {
      type: "allOf",
      ...t.allOf.toJsonSchema(spec),
      meta,
    }
  }
  export const _lambda: allOf_._lambda = phantom
}
///    ALL OF    ///
////////////////////

////////////////////
///    ANY OF    ///
export { anyOf_ as anyOf }
function anyOf_<T extends typeof t.anyOf.children>(...specs: [...T]): anyOf_<T>
function anyOf_<T extends typeof t.anyOf.children, const Meta>(...args: [...T, Meta]): anyOf_<T, Meta>
function anyOf_<T extends typeof t.anyOf.children, const Meta>(
  ...args:
    | [...T, Meta] 
    | [...spec: T]
): anyOf_<T, Meta> { 
  const [xs, meta] = t.parseArgs(...args)
  return {
    ...t.anyOf(...xs),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return anyOf_.toTraversable(xs, meta) },
    _lambda: anyOf_._lambda,
  }
}
interface anyOf_<T extends typeof t.anyOf.spec, Meta = {}> extends t.anyOf<T>, meta<Meta> {
  get toTraversable(): anyOf_.Traversable<T, Meta>
  _lambda: anyOf_._lambda,
}
declare namespace anyOf_ {
  interface Traversable<T extends typeof t.anyOf.spec, Meta = {}> extends t.anyOf.toJsonSchema<T> { 
    type: "anyOf"
    anyOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] & decorate<T[I]> } 
    meta: Meta 
  }
  interface _lambda extends HKT<typeof t.anyOf.spec> { [-1]: anyOf_<this[0]> }
}
namespace anyOf_ {
  export function toTraversable<T extends typeof t.anyOf.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): anyOf_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.anyOf.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ) {
    return {
      type: "anyOf",
      ...t.anyOf.toJsonSchema(spec),
      meta,
    }
  }
  export const _lambda: anyOf_._lambda = phantom
}
///    ANY OF    ///
////////////////////


////////////////////
///    ONE OF    ///
export { oneOf_ as oneOf }
function oneOf_<T extends typeof t.oneOf.children>(...specs: [...T]): oneOf_<T>
function oneOf_<T extends typeof t.oneOf.children, const Meta>(...args: [...T, Meta]): oneOf_<T, Meta>
function oneOf_<T extends typeof t.oneOf.children, const Meta>(
  ...args:
  | [...T, Meta] 
  | [...spec: T]
): oneOf_<T, Meta> { 
  const [xs, meta] = t.parseArgs(...args)
  return {
    ...t.oneOf(...xs),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return oneOf_.toTraversable(xs, meta) },
    _lambda: oneOf_._lambda,
  }
}
interface oneOf_<T extends typeof t.oneOf.spec, Meta = {}> extends t.oneOf<T>, meta<Meta> {
  get toTraversable(): oneOf_.Traversable<T, Meta>
    _lambda: oneOf_._lambda
}
declare namespace oneOf_ {
  interface Traversable<T extends typeof t.oneOf.spec, Meta = {}> extends t.oneOf.toJsonSchema<T> { 
    type: "oneOf"
    oneOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] & decorate<T[I]> } 
    meta: Meta 
  }
  interface _lambda extends HKT<typeof t.oneOf.spec> { [-1]: oneOf_<this[0]> }
}
namespace oneOf_ {
  export function toTraversable<T extends typeof t.oneOf.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): oneOf_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.oneOf.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ) {
    return {
      type: "oneOf",
      ...t.oneOf.toJsonSchema(spec),
      meta,
    }
  }
  export const _lambda: oneOf_._lambda = phantom
}
///    ONE OF    ///
////////////////////

////////////////////
///    RECORD    ///
export { record_ as record }
function record_<T extends typeof t.record.children, const Meta extends {}>(
  value: T, 
  meta?: Meta
): record_<T, Meta> { 
  return {
    ...t.record(value),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return record_.toTraversable(value, meta) },
    _lambda: record_._lambda,
  }
}
interface record_<T, Meta = {}> extends t.record<T>, meta<Meta> {
  get toTraversable(): record_.Traversable<T, Meta>
  _lambda: record_._lambda
}
declare namespace record_ {
  interface Traversable<T extends typeof t.record.spec, Meta = {}> extends Omit<t.record.toJsonSchema<T>, "type"> { 
    type: typeof t.Tag.record
    meta: Meta 
    additionalProperties: T["toJsonSchema" & keyof T] & decorate<T>
  }
  interface _lambda extends HKT<typeof t.tuple.spec> { [-1]: record_<this[0]> }
}
namespace record_ {
  export function toTraversable<T extends typeof t.record.spec, Meta extends {} = {}>(
    spec: T, 
    meta?: Meta
  ): record_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.record.spec, Meta extends {} = {}>(
    spec: T, 
    meta: Meta = {} as never
  ) {
    return {
      ...t.record.toJsonSchema(spec),
      type: t.Tag.record,
      meta,
    }
  }
  export const _lambda: record_._lambda = phantom
}
///    RECORD    ///
////////////////////


///////////////////
///    TUPLE    ///
export { tuple_ as tuple }
function tuple_<T extends typeof t.tuple.children>(...specs: T): tuple_<T>
function tuple_<T extends typeof t.tuple.children, const Meta>(...args: [...T, Meta]): tuple_<T, Meta>
function tuple_<T extends typeof t.tuple.children, const Meta>(
  ...args:
  | [...T, Meta]
  | [...spec: T]
): tuple_<T, Meta> { 
  const [xs, meta] = t.parseArgs(...args)
  return {
    ...t.tuple(...xs),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return tuple_.toTraversable(xs, meta) },
    _lambda: tuple_._lambda
  }
}
interface tuple_<T extends typeof t.tuple.spec, Meta = {}> extends t.tuple<T>, meta<Meta> { 
  get toTraversable(): tuple_.Traversable<T, Meta>
  _lambda: tuple_._lambda
}
declare namespace tuple_ {
  interface Traversable<T extends typeof t.tuple.spec, Meta = {}> extends Omit<t.tuple.toJsonSchema<T>, 'type'> { 
    meta: Meta 
    type: 'tuple'
    items: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] & decorate<T[I]> }
  }
  interface _lambda extends HKT<typeof t.tuple.spec> { [-1]: tuple_<this[0]> }
}
namespace tuple_ {
  export function toTraversable<T extends typeof t.tuple.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): tuple_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.tuple.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ) {
    return {
      type: "tuple",
      items: spec.filter(has("toTraversable")).map((_) => _.toTraversable) as never,
      minItems: spec.length,
      maxItems: spec.length,
      meta,
    } as tuple_.Traversable<T>
  }
  export const _lambda: tuple_._lambda = phantom
}
///    TUPLE    ///
///////////////////

////////////////////
///    OBJECT    ///
export { object_ as object }
function object_<T extends typeof t.object.children, const Meta>(
  value: T, 
  meta?: Meta
): object_<T, Meta> { 
  return {
    ...t.object(value),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return object_.toTraversable(value, meta) },
    _lambda: object_._lambda
  }
}
interface object_<T extends typeof t.object.spec, Meta = {}> extends t.object<T>, meta<Meta> {
  get toTraversable(): object_.Traversable<T, Meta>
  _lambda: object_._lambda
}
declare namespace object_ {
  interface Traversable<T extends typeof t.object.spec, Meta = {}> extends t.object.toJsonSchema<T> { 
    meta: Meta, 
    properties: { [K in keyof T]: T[K]["toJsonSchema" & keyof T[K]] & decorate<T[K]> } 
  }
  interface _lambda extends HKT<{}> { [-1]: object_<this[0]> }
}
namespace object_ {
  export function toTraversable<T extends typeof t.object.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): object_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.object.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ) {
    return {
      ...t.object.toJsonSchema(spec),
      meta,
    }
  }
  export const _lambda: object_._lambda = phantom
}
///    OBJECT    ///
////////////////////


export type lambda = typeof lambda
export const lambda = {
  null: null_._lambda,
  boolean: boolean_._lambda,
  integer: integer_._lambda,
  number: number_._lambda,
  string: string_._lambda,
  enum: enum_._lambda,
  const: const_._lambda,
  optional: optional_._lambda,
  array: array_._lambda,
  record: record_._lambda,
  tuple: tuple_._lambda,
  object: object_._lambda,
  allOf: allOf_._lambda,
  anyOf: anyOf_._lambda,
  oneOf: oneOf_._lambda,
}

namespace Recursive {
  export const toTraversableMap = {
    symbol: () => NotSupported('symbol', 'Recursive.fromASTMap'),
    any: any_.toTraversable,
    null: null_.toTraversable,
    boolean: boolean_.toTraversable,
    integer: integer_.toTraversable,
    number: number_.toTraversable,
    string: string_.toTraversable,
    enum: enum_.toTraversable,
    const: const_.toTraversable,
    array: array_.toTraversable,
    anyOf: anyOf_.toTraversable,
    oneOf: oneOf_.toTraversable,
    optional: optional_.toTraversable,
    record: record_.toTraversable,
    tuple: tuple_.toTraversable,
    object: object_.toTraversable,
    allOf: map(allOf_.toTraversable),
  }

  export const toTraversable
    : Functor.Algebra<t.AST.lambda, Traversable.F<_>>
    = (ast) => (Recursive.toTraversableMap[ast._tag] as (_?: any) => never)(ast.def)

  export type toTraversable<
    S, 
    _F extends 
    | lambda[S['_tag' & keyof S] & keyof lambda] 
    = lambda[S['_tag' & keyof S] & keyof lambda]
  > = Kind<_F, S['def' & keyof S]>['toTraversable']
}

export function fold<S>(g: Functor.Algebra<t.AST.lambda, S>) { return fn.cata(t.Functor)(g) }

/** 
 * ## {@link toTraversable `tr.toTraversable`}
 * 
 * Converts either a {@link t `t`} schema or a {@link tr `tr`} schema
 * to its {@link Traversable `Traversable`} form.
 */
export const toTraversable
  : <S extends t.Schema>(term: S) => Recursive.toTraversable<S> 
  = fold(Recursive.toTraversable) as <S extends t.Schema>(term: S) => Recursive.toTraversable<S> 
