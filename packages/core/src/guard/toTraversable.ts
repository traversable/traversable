import type { Force, HKT, Kind, _, newtype, symbol } from "@traversable/registry"
import * as t from "./ast.js"
export type {
  typeof,
  Schema,
} from "./ast.js"

export type { meta as Meta }
interface meta<$> { [symbol.meta]?: $, get meta(): $ }
type decorate<T, $ = T[symbol.meta & keyof T], _ 
  = { meta: [$] extends [never] ? {} : $ & {} }> = never | _
function decorate<$>(meta: $): <T>(x: T) => decorate<T, $> 
  { return <T>(x: T) => ({ get meta() { return !!meta ? meta : meta as never }, ...x }) }

//////////////////
///    NULL    ///
export { null_ as null }
function null_<Meta = {}>(meta?: Meta): null_<Meta> {
  return {
    ...t.null(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): null_.Traversable<Meta> { 
      return null_.toTraversable(meta)
    }
  }
}
interface null_<Meta = {}> extends t.null, meta<Meta> {
  get toTraversable(): null_.Traversable<Meta>
}
declare namespace null_ {
  interface Traversable<Meta = {}>
    extends t.null.toJsonSchema 
    { meta: Meta }
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
}
///    NULL    ///
//////////////////


/////////////////////
///    BOOLEAN    ///
export { boolean_ as boolean }
function boolean_<Meta = {}>(meta?: Meta): boolean_<Meta> {
  return {
    ...t.boolean(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): boolean_.Traversable<Meta> { 
      return boolean_.toTraversable(meta)
    }
  }
}
interface boolean_<Meta = {}> extends t.boolean, meta<Meta> {
  get toTraversable(): boolean_.Traversable<Meta>
}
declare namespace boolean_ {
  interface Traversable<Meta = {}>
    extends t.boolean.toJsonSchema 
    { meta: Meta }
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
}
///    BOOLEAN    ///
/////////////////////


/////////////////////
///    INTEGER    ///
export { integer_ as integer }
function integer_<Meta = {}>(meta?: Meta): integer_<Meta> {
  return {
    ...t.integer(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): integer_.Traversable<Meta> { 
      return integer_.toTraversable(meta)
    }
  }
}
interface integer_<Meta = {}> extends t.integer, meta<Meta> {
  get toTraversable(): integer_.Traversable<Meta>
}
declare namespace integer_ {
  interface Traversable<Meta = {}>
    extends t.integer.toJsonSchema 
    { meta: Meta }
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
}
///    INTEGER    ///
/////////////////////


////////////////////
///    NUMBER    ///
export { number_ as number }
function number_<Meta = {}>(meta?: Meta): number_<Meta> {
  return {
    ...t.number(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): number_.Traversable<Meta> { 
      return number_.toTraversable(meta)
    }
  }
}
interface number_<Meta = {}> extends t.number, meta<Meta> {
  get toTraversable(): number_.Traversable<Meta>
}
declare namespace number_ {
  interface Traversable<Meta = {}>
    extends t.number.toJsonSchema 
    { meta: Meta }
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
}
///    NUMBER    ///
////////////////////


////////////////////
///    STRING    ///
export { string_ as string }
function string_<Meta>(meta?: Meta): string_<Meta> {
  return {
    ...t.string(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): string_.Traversable<Meta> { 
      return string_.toTraversable(meta)
    }
  }
}
interface string_<Meta = {}> extends t.string, meta<Meta> {
  get toTraversable(): string_.Traversable<Meta>
}
declare namespace string_ {
  interface Traversable<Meta = {}>
    extends t.string.toJsonSchema 
    { meta: Meta }
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
}
///    STRING    ///
////////////////////


/////////////////
///    ANY    ///
export { any_ as any }
function any_<Meta>(meta?: Meta): any_<Meta> {
  return {
    ...t.any(),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable(): any_.Traversable<Meta> { 
      return any_.toTraversable(meta)
    }
  }
}
interface any_<Meta = {}> extends t.any, meta<Meta> {
  get toTraversable(): any_.Traversable<Meta>
}
declare namespace any_ {
  interface Traversable<Meta = {}> extends t.any.toJsonSchema { meta: Meta }
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
}
///    STRING    ///
////////////////////

///////////////////
///    CONST    ///
export { const_ as const }
function const_<const T extends typeof t.const.children, Meta>(
  value: T, 
  meta?: Meta
): const_<T, Meta> { 
  return {
    ...t.const(value),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { 
      return const_.toTraversable(value, meta)
    }
  }
}
interface const_<T, Meta = {}> extends t.const<T>, meta<Meta> {
  get toTraversable(): const_.Traversable<T, Meta>
}
declare namespace const_ {
  interface Traversable<T extends typeof t.const.spec, Meta = {}> extends t.const.toJsonSchema<T> { 
    type: "const"
    const: T & decorate<T>
    meta: Meta
  }
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
}
///    CONST    ///
///////////////////

//////////////////
///    ENUM    ///
export { enum_ as enum }
function enum_<T extends typeof t.enum.children>(...specs: [...T]): enum_<T>
function enum_<T extends typeof t.enum.children, Meta>(...args: [...T, Meta]): enum_<T, Meta>
function enum_<T extends typeof t.enum.children, Meta>(
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
    }
  }
}
interface enum_<T extends typeof t.enum.spec, Meta = {}> extends t.enum<T>, meta<Meta> {
  get toTraversable(): enum_.Traversable<T, Meta>
}
declare namespace enum_ {
  interface Traversable<T extends typeof t.enum.spec, Meta = {}> extends t.enum.toJsonSchema<T> { 
    type: "enum"
    enum: { [I in keyof T]: T[I]["_type" & keyof T[I]] & decorate<T[I]> }
    meta: Meta
  }
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
}
///    ENUM    ///
//////////////////


//////////////////////
///    OPTIONAL    ///
export { optional_ as optional }
function optional_<T extends typeof t.optional.children, Meta>(
  value: T, 
  meta?: Meta
): optional_<T, Meta> { 
  return {
    ...t.optional(value),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return optional_.toTraversable(value, meta) }
  }
}
interface optional_<T, Meta = {}> extends t.optional<T>, meta<Meta> {
  get toTraversable(): optional_.Traversable<T, Meta>
}
declare namespace optional_ {
  interface Traversable<T extends typeof t.optional.spec, Meta = {}> 
    extends newtype<{} & t.optional.toJsonSchema<T>> { 
      type: "anyOf"
      anyOf: [T & decorate<T>, const_<undefined>["toJsonSchema"]]
      meta: Meta & { optional: true }
    }
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
}
///    OPTIONAL    ///
//////////////////////


///////////////////
///    ARRAY    ///
export { array_ as array }
function array_<T extends typeof t.array.children, Meta>(
  value: T, 
  meta?: Meta
): array_<T, Meta> { 
  return {
    ...t.array(value),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { 
      return array_.toTraversable(value, meta)
    }
  }
}
interface array_<T, Meta = {}> extends t.array<T>, meta<Meta> {
  get toTraversable(): array_.Traversable<T, Meta>
}
declare namespace array_ {
  interface Traversable<T extends typeof t.array.spec, Meta = {}> extends t.array.toJsonSchema<T> { 
    meta: Meta
    items: T["toJsonSchema" & keyof T] & decorate<T>
  }
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
}
///    ARRAY    ///
///////////////////


////////////////////
///    ALL OF    ///
export { allOf_ as allOf }
function allOf_<T extends typeof t.allOf.children>(...specs: [...T]): allOf_<T>
function allOf_<T extends typeof t.allOf.children, Meta>(...args: [...T, Meta]): allOf_<T, Meta>
function allOf_<T extends typeof t.allOf.children, Meta>(
  ...args:
    | [...T, Meta] 
    | [...spec: T]
): allOf_<T, Meta> { 
  const [xs, meta] = t.parseArgs(...args)
  return {
    ...t.allOf(...xs),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return allOf_.toTraversable(xs, meta) }
  }
}
interface allOf_<T extends typeof t.allOf.spec, Meta = {}> extends t.allOf<T>, meta<Meta> {
  get toTraversable(): allOf_.Traversable<T, Meta>
}
declare namespace allOf_ {
  interface Traversable<T extends typeof t.allOf.spec, Meta = {}> extends t.allOf.toJsonSchema<T> { 
    type: "allOf"
    allOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] & decorate<T[I]> } 
    meta: Meta 
  }
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
}
///    ALL OF    ///
////////////////////


////////////////////
///    ANY OF    ///
export { anyOf_ as anyOf }
function anyOf_<T extends typeof t.anyOf.children>(...specs: [...T]): anyOf_<T>
function anyOf_<T extends typeof t.anyOf.children, Meta>(...args: [...T, Meta]): anyOf_<T, Meta>
function anyOf_<T extends typeof t.anyOf.children, Meta>(
  ...args:
    | [...T, Meta] 
    | [...spec: T]
): anyOf_<T, Meta> { 
  const [xs, meta] = t.parseArgs(...args)
  return {
    ...t.anyOf(...xs),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { 
      return anyOf_.toTraversable(xs, meta) 
    }
  }
}
interface anyOf_<T extends typeof t.anyOf.spec, Meta = {}> extends t.anyOf<T>, meta<Meta> {
  get toTraversable(): anyOf_.Traversable<T, Meta>
}
declare namespace anyOf_ {
  interface Traversable<T extends typeof t.anyOf.spec, Meta = {}> extends t.anyOf.toJsonSchema<T> { 
    type: "anyOf"
    anyOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] & decorate<T[I]> } 
    meta: Meta 
  }
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
}
///    ANY OF    ///
////////////////////


////////////////////
///    ONE OF    ///
export { oneOf_ as oneOf }
function oneOf_<T extends typeof t.oneOf.children>(...specs: [...T]): oneOf_<T>
function oneOf_<T extends typeof t.oneOf.children, Meta>(...args: [...T, Meta]): oneOf_<T, Meta>
function oneOf_<T extends typeof t.oneOf.children, Meta>(
  ...args:
  | [...T, Meta] 
  | [...spec: T]
): oneOf_<T, Meta> { 
  const [xs, meta] = t.parseArgs(...args)
  return {
    ...t.oneOf(...xs),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return oneOf_.toTraversable(xs, meta) }
  }
}
interface oneOf_<T extends typeof t.oneOf.spec, Meta = {}> extends t.oneOf<T>, meta<Meta> {
  get toTraversable(): oneOf_.Traversable<T, Meta>
}
declare namespace oneOf_ {
  interface Traversable<T extends typeof t.oneOf.spec, Meta = {}> extends t.oneOf.toJsonSchema<T> { 
    type: "oneOf"
    oneOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] & decorate<T[I]> } 
    meta: Meta 
  }
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
}
///    ONE OF    ///
////////////////////

////////////////////
///    RECORD    ///
export { record_ as record }
function record_<T extends typeof t.record.children, Meta>(
  value: T, 
  meta?: Meta
): record_<T, Meta> { 
  return {
    ...t.record(value),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return record_.toTraversable(value, meta) }
  }
}
interface record_<T, Meta = {}> extends t.record<T>, meta<Meta> {
  get toTraversable(): record_.Traversable<T, Meta>
}
declare namespace record_ {
  interface Traversable<T extends typeof t.record.spec, Meta = {}> extends t.record.toJsonSchema<T> { 
    meta: Meta 
    additionalProperties: T["toJsonSchema" & keyof T] & decorate<T>
  }
}
namespace record_ {
  export function toTraversable<T extends typeof t.record.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): record_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.record.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ) {
    return {
      ...t.record.toJsonSchema(spec),
      meta,
    }
  }
}
///    RECORD    ///
////////////////////


///////////////////
///    TUPLE    ///
export { tuple_ as tuple }
function tuple_<T extends typeof t.tuple.children>(...specs: T): tuple_<T>
function tuple_<T extends typeof t.tuple.children, Meta>(...args: [...T, Meta]): tuple_<T, Meta>
function tuple_<T extends typeof t.tuple.children, Meta>(
  ...args:
  | [...T, Meta]
  | [...spec: T]
): tuple_<T, Meta> { 
  const [xs, meta] = t.parseArgs(...args)
  return {
    ...t.tuple(...xs),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return tuple_.toTraversable(xs, meta) }
  }
}
interface tuple_<T extends typeof t.tuple.spec, Meta = {}> extends t.tuple<T>, meta<Meta> { 
  get toTraversable(): tuple_.Traversable<T, Meta>
}
declare namespace tuple_ {
  interface Traversable<T extends typeof t.tuple.spec, Meta = {}> extends t.tuple.toJsonSchema<T> { 
    meta: Meta 
    items: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] & decorate<T[I]> }
  }
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
      ...t.tuple.toJsonSchema(spec),
      meta,
    }
  }
}
///    TUPLE    ///
///////////////////

////////////////////
///    OBJECT    ///
export { object_ as object }
function object_<T extends typeof t.object.children, Meta>(
  value: T, 
  meta?: Meta
): object_<T, Meta> { 
  return {
    ...t.object(value),
    get meta() { return !!meta ? meta : meta as never },
    get toTraversable() { return object_.toTraversable(value, meta) }
  }
}
interface object_<T extends typeof t.object.spec, Meta = {}> extends t.object<T>, meta<Meta> {
  get toTraversable(): object_.Traversable<T, Meta>
}
declare namespace object_ {
  interface Traversable<T extends typeof t.object.spec, Meta = {}> extends t.object.toJsonSchema<T> { 
    meta: Meta, 
    properties: { [K in keyof T]: T[K]["toJsonSchema" & keyof T[K]] & decorate<T[K]> } 
  }
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
}
///    OBJECT    ///
////////////////////
