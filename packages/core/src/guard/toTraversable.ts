import { _, type newtype } from "@traversable/registry"
import * as t from "./ast.js"


//////////////////
///    NULL    ///
export { null_ as null }
function null_<Meta>(meta?: Meta): null_<Meta> {
  return {
    ...t.null(),
    get toTraversable(): null_.Traversable<Meta> { 
      return null_.toTraversable(meta)
    }
  }
}
interface null_<Meta = {}> extends t.null {
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
function boolean_<Meta>(meta?: Meta): boolean_<Meta> {
  return {
    ...t.boolean(),
    get toTraversable(): boolean_.Traversable<Meta> { 
      return boolean_.toTraversable(meta)
    }
  }
}
interface boolean_<Meta = {}> extends t.boolean {
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
function integer_<Meta>(meta?: Meta): integer_<Meta> {
  return {
    ...t.integer(),
    get toTraversable(): integer_.Traversable<Meta> { 
      return integer_.toTraversable(meta)
    }
  }
}
interface integer_<Meta = {}> extends t.integer {
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
function number_<Meta>(meta?: Meta): number_<Meta> {
  return {
    ...t.number(),
    get toTraversable(): number_.Traversable<Meta> { 
      return number_.toTraversable(meta)
    }
  }
}
interface number_<Meta = {}> extends t.number {
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
    get toTraversable(): string_.Traversable<Meta> { 
      return string_.toTraversable(meta)
    }
  }
}
interface string_<Meta = {}> extends t.string {
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


///////////////////
///    CONST    ///
export { const_ as const }
function const_<T extends typeof t.const.children, Meta>(
  value: T, 
  meta?: Meta
): const_<T, Meta> { 
  return {
    ...t.const(value),
    get toTraversable() { 
      return const_.toTraversable(value, meta)
    }
  }
}
interface const_<T, Meta = {}> extends t.const<T> {
  get toTraversable(): const_.Traversable<T, Meta>
}
declare namespace const_ {
  interface Traversable<T extends typeof t.const.spec, Meta = {}>
    extends t.const.toJsonSchema<T> 
    { type: "const", meta: Meta }
}
namespace const_ {
  export function toTraversable<
    T extends typeof t.const.spec, 
    Meta = {}
  >(spec: T, meta?: Meta): const_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.const.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ): const_.Traversable<T, Meta> {
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
function enum_<T extends typeof t.enum.children, Meta>(
  value: T, 
  meta?: Meta
): enum_<T, Meta> { 
  return {
    ...t.enum(...value),
    get toTraversable() { 
      return enum_.toTraversable(value, meta) 
    }
  }
}
interface enum_<T extends typeof t.enum.spec, Meta = {}> extends t.enum<T> {
  get toTraversable(): enum_.Traversable<T, Meta>
}
declare namespace enum_ {
  interface Traversable<T extends typeof t.enum.spec, Meta = {}>
    extends t.enum.toJsonSchema<T> 
    { type: "enum", meta: Meta }
}
namespace enum_ {
  export function toTraversable<
    T extends typeof t.enum.spec, 
    Meta = {}
  >(spec: T, meta?: Meta): enum_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.enum.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ): enum_.Traversable<T, Meta> {
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
    get toTraversable() { return optional_.toTraversable(value, meta) }
  }
}
interface optional_<T, Meta = {}> extends t.optional<T> {
  get toTraversable(): optional_.Traversable<T, Meta>
}
declare namespace optional_ {
  interface Traversable<T extends typeof t.optional.spec, Meta = {}> 
    extends newtype<{} & t.optional.toJsonSchema<T>> { 
      type: "anyOf"
      anyOf: [T, const_<undefined>["toJsonSchema"]]
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
  ): optional_.Traversable<T, Meta> {
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
    get toTraversable() { 
      return array_.toTraversable(value, meta)
    }
  }
}
interface array_<T, Meta = {}> extends t.array<T> {
  get toTraversable(): array_.Traversable<T, Meta>
}
declare namespace array_ {
  interface Traversable<T extends typeof t.array.spec, Meta = {}>
    extends t.array.toJsonSchema<T> 
    { meta: Meta }
}
namespace array_ {
  export function toTraversable<
    T extends typeof t.array.spec, 
    Meta = {}
  >(spec: T, meta?: Meta): array_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.array.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ): array_.Traversable<T, Meta> {
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
function allOf_<T extends typeof t.allOf.children, Meta>(
  value: T, 
  meta?: Meta
): allOf_<T, Meta> { 
  return {
    ...t.allOf(...value),
    get toTraversable() { return allOf_.toTraversable(value, meta) }
  }
}
interface allOf_<T extends typeof t.allOf.spec, Meta = {}> extends t.allOf<T> {
  get toTraversable(): allOf_.Traversable<T, Meta>
}
declare namespace allOf_ {
  interface Traversable<T extends typeof t.allOf.spec, Meta = {}> 
    extends t.allOf.toJsonSchema<T> 
    { type: "allOf", meta: Meta }
}
namespace allOf_ {
  export function toTraversable<T extends typeof t.allOf.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): allOf_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.allOf.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ): allOf_.Traversable<T, Meta> {
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
function anyOf_<T extends typeof t.anyOf.children, Meta>(
  value: T, 
  meta?: Meta
): anyOf_<T, Meta> { 
  return {
    ...t.anyOf(...value),
    get toTraversable() { 
      return anyOf_.toTraversable(value, meta) 
    }
  }
}
interface anyOf_<T extends typeof t.anyOf.spec, Meta = {}> extends t.anyOf<T> {
  get toTraversable(): anyOf_.Traversable<T, Meta>
}
declare namespace anyOf_ {
  interface Traversable<T extends typeof t.anyOf.spec, Meta = {}> 
    extends t.anyOf.toJsonSchema<T> 
    { type: "anyOf", meta: Meta }
}
namespace anyOf_ {
  export function toTraversable<T extends typeof t.anyOf.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): anyOf_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.anyOf.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ): anyOf_.Traversable<T, Meta> {
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
function oneOf_<T extends typeof t.oneOf.children, Meta>(
  value: T, 
  meta?: Meta
): oneOf_<T, Meta> { 
  return {
    ...t.oneOf(...value),
    get toTraversable() { return oneOf_.toTraversable(value, meta) }
  }
}
interface oneOf_<T extends typeof t.oneOf.spec, Meta = {}> extends t.oneOf<T> {
  get toTraversable(): oneOf_.Traversable<T, Meta>
}
declare namespace oneOf_ {
  interface Traversable<T extends typeof t.oneOf.spec, Meta = {}> 
    extends t.oneOf.toJsonSchema<T> 
    { type: "oneOf", meta: Meta }
}
namespace oneOf_ {
  export function toTraversable<T extends typeof t.oneOf.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): oneOf_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.oneOf.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ): oneOf_.Traversable<T, Meta> {
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
    get toTraversable() { return record_.toTraversable(value, meta) }
  }
}
interface record_<T, Meta = {}> extends t.record<T> {
  get toTraversable(): record_.Traversable<T, Meta>
}
declare namespace record_ {
  interface Traversable<T extends typeof t.record.spec, Meta = {}> 
    extends t.record.toJsonSchema<T> 
    { meta: Meta }
}
namespace record_ {
  export function toTraversable<T extends typeof t.record.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): record_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.record.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ): record_.Traversable<T, Meta> {
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
function tuple_<T extends typeof t.tuple.children, Meta>(
  value: T, 
  meta?: Meta
): tuple_<T, Meta> { 
  return {
    ...t.tuple(...value),
    get toTraversable() { return tuple_.toTraversable(value, meta) }
  }
}
interface tuple_<T extends typeof t.tuple.spec, Meta = {}> extends t.tuple<T> { 
  get toTraversable(): tuple_.Traversable<T, Meta>
}
declare namespace tuple_ {
  interface Traversable<T extends typeof t.tuple.spec, Meta = {}> 
    extends t.tuple.toJsonSchema<T> 
    { meta: Meta }
}
namespace tuple_ {
  export function toTraversable<T extends typeof t.tuple.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): tuple_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.tuple.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ): tuple_.Traversable<T, Meta> {
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
    get toTraversable() { return object_.toTraversable(value, meta) }
  }
}
interface object_<T extends typeof t.object.spec, Meta = {}> extends t.object<T> {
  get toTraversable(): object_.Traversable<T, Meta>
}
declare namespace object_ {
  interface Traversable<T extends typeof t.object.spec, Meta = {}> 
    extends t.object.toJsonSchema<T> 
    { meta: Meta }
}
namespace object_ {
  export function toTraversable<T extends typeof t.object.spec, Meta = {}>(
    spec: T, 
    meta?: Meta
  ): object_.Traversable<T, Meta>
  export function toTraversable<T extends typeof t.object.spec, Meta = {}>(
    spec: T, 
    meta: Meta = {} as never
  ): object_.Traversable<T, Meta> {
    return {
      ...t.object.toJsonSchema(spec),
      meta,
    }
  }
}
///    OBJECT    ///
////////////////////
