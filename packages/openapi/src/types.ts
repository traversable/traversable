import { core, fc, tree } from "@traversable/core";
import type { prop } from "@traversable/data"
import { object } from "@traversable/data"
import type { HKT, KeepLast, Mutable, Partial, autocomplete, integer } from "@traversable/registry";
import { symbol } from "@traversable/registry";
import type { any, newtype } from "any-ts"

import type { parameter } from "./parameter.js"

export type inline<T> = T
export type Scalar = null | undefined | boolean | number | string | symbol

export interface $ref<T extends string = string> { readonly $ref?: T }

const Array_isArray = globalThis.Array.isArray

export type DataTypes = typeof DataTypes
export const DataTypes = [
  "null",
  "boolean", 
  "integer", 
  "number", 
  "string", 
  "object",
  "array", 
] as const satisfies string[]
export const DataType = object.fromKeys(DataTypes)
export type DataType = typeof DataType
export type DataType_null = typeof DataType.null
export type DataType_boolean = typeof DataType.boolean
export type DataType_integer = typeof DataType.integer
export type DataType_number = typeof DataType.number
export type DataType_string = typeof DataType.string
export type DataType_object = typeof DataType.object
export type DataType_array = typeof DataType.array
export declare namespace DataType {
  export {
    DataType_null as null,
    DataType_boolean as boolean,
    DataType_integer as integer,
    DataType_number as number,
    DataType_string as string,
    DataType_object as object,
    DataType_array as array,
  }
}

///////////////
/// FORMATS
/** See also: https://spec.openapis.org/registry/format/ */
export declare namespace format {
  export { number_ as number, string_ as string }
}
export namespace format {
  export type KnownIntegerFormat = (typeof KnownIntegerFormats)[number]
  export const KnownIntegerFormats = ["int32", "int64"] as const satisfies string[]
  // export const isKnownIntegerFormat = core.is.literally(...KnownIntegerFormats)

  export type ExtendedIntegerFormat = (typeof ExtendedIntegerFormats)[number]
  export const ExtendedIntegerFormats = [] as const satisfies string[]
  // export const isExtendedIntegerFormat = core.is.literally(...ExtendedIntegerFormats)

  export type integer = (typeof IntegerFormats)[number]
  export const IntegerFormats = [...KnownIntegerFormats, ...ExtendedIntegerFormats] as const
  // export const isIntegerFromat = core.is.literally(...IntegerFormats)

  export type KnownNumberFormat = (typeof KnownNumberFormats)[number]
  export const KnownNumberFormats = ["float", "double"] as const satisfies string[]
  // export const isKnownNumberFormat = core.is.literally(...KnownNumberFormats)

  export type number_ = (typeof NumberFormats[number])[number]
  // export const ExtendedNumberFormats = core.is.literally(...KnownNumberFormats)

  export type NumberFormat = (typeof NumberFormats)[number]
  export const NumberFormats = [...KnownNumberFormats] as const satisfies string[]
  // export const isNumberFormat = core.is.literally(...KnownNumberFormats)

  export type KnownStringFormat = (typeof KnownStringFormats)[number]
  export const KnownStringFormats = ["password"] as const satisfies string[]
  // export const isKnownStringFormat = core.is.literally(...KnownStringFormats)

  export type ExtendedStringFormat = (typeof ExtendedStringFormats)[number]
  export const ExtendedStringFormats = [
    "date",
    "datetime",
    "duration",
    "email",
    "time",
    "uuid",
    "ulid",
    "uri",
    "uri-reference",
  ] as const satisfies string[]

  // export const isExtendedStringFormat = core.is.literally(...ExtendedStringFormats)

  export type string_ = (typeof StringFormats)[number]
  export const StringFormats = [...ExtendedStringFormats, ...KnownStringFormats] as const satisfies string[]
  // export const isStringFormat = core.is.literally(...StringFormats)
  export const integerNative = fc.constantFrom(...KnownIntegerFormats)
  export const numberNative = fc.constantFrom(...KnownNumberFormats)
  export const stringNative = fc.constantFrom(...KnownStringFormats)

  export const stringExtended = fc.constantFrom(
    ...KnownStringFormats,
    ...ExtendedStringFormats,
  )

  export const integer = fc.constantFrom(...KnownIntegerFormats)
  export const number = fc.constantFrom(...NumberFormats)
  export const string = fc.constantFrom(
    ...KnownStringFormats,
    ...ExtendedStringFormats,
  )
  export const any = fc.lorem({ mode: "words", maxCount: 1 })
}
export interface Schema_Items {
  maxItems: number
  minItems: number
  uniqueItems: boolean
}
/// FORMATS
///////////////


/**
 * ## {@link typeOf `openapi.typeof`}
 * 
 * Get a string that describes and discriminates the type of
 * OpenAPI node you're inspecting. Works at the term- and
 * type-level.
 * 
 * Useful as an entrypoint into a pattern matching expression.
 */
export function typeOf<T extends Schema>(u: T): typeOf<T>
export function typeOf<T extends Schema>(u: T) {
  switch (true) {
    case "type" in u: switch (true) {
      case "additionalProperties" in u: return "record"
      case "items" in u && Array_isArray(u.items): return "tuple"
      default: return u.type
    }
    case "allOf" in u: return "allOf"
    case "anyOf" in u: return "anyOf"
    case "oneOf" in u: return "oneOf"
    default: return "$ref"
  }
}
export type typeOf<T, K extends keyof T = keyof T> 
  = "additionalProperties" extends K ? "record"
  : T extends { items: readonly unknown[] } ? "tuple"
  : T extends { type: infer U extends HasType["type"] } ? U
  : K extends "allOf" ? "allOf"
  : K extends "anyOf" ? "anyOf"
  : K extends "oneOf" ? "oneOf"
  : "$ref"
  ;
type HasType = 
  | Schema_scalar
  | Schema_array 
  | Schema_object
  | Schema_record
  | Schema_array
  | Schema_tuple
  ;

export type Schema =
  | Schema_null
  | Schema_boolean
  | Schema_integer
  | Schema_number
  | Schema_string
  | Schema_const<unknown>
  | Schema_allOf<Schema>
  | Schema_anyOf<Schema>
  | Schema_oneOf<Schema>
  | Schema_array<Schema>
  | Schema_record<Schema>
  | Schema_tuple<Schema>
  | Schema_object<Schema>
  ;

type F<T> =
  | $ref
  | Schema_null
  | Schema_boolean
  | Schema_integer
  | Schema_number
  | Schema_string
  | Schema_const
  | Schema_allOf<T>
  | Schema_anyOf<T>
  | Schema_oneOf<T>
  | Schema_array<T>
  | Schema_record<T>
  | Schema_tuple<T>
  | Schema_object<T>
  ;

export type Schema_Node = F<Schema | $ref>

export declare namespace Schema_Node {
  export { Schema_Node as any }
}

export const Schema_is
  : (u: unknown) => u is Schema
  = core.anyOf$(
    tree.has("type", core.is.literally(...DataTypes)),
    tree.has("$ref", core.is.string),
    tree.has('const', core.is.any),
    Schema_isAllOf,
    Schema_isAnyOf,
    Schema_isOneOf,
  ) as never

export const Schema_isRef
  : (u: unknown) => u is $ref
  = tree.has("$ref", core.is.string)

export function Schema_isOneOf(u: Schema | $ref): u is Schema_oneOf<Schema>
export function Schema_isOneOf<T>(u: unknown): u is Schema_oneOf<T>
export function Schema_isOneOf(u: unknown): u is Schema_oneOf<Schema> {
  return tree.has("oneOf", core.array$(Schema_is))(u)
}

export function Schema_isAnyOf(u: Schema | $ref): u is Schema_anyOf<Schema>
export function Schema_isAnyOf<T>(u: unknown): u is Schema_anyOf<T>
export function Schema_isAnyOf(u: unknown): u is Schema_anyOf<Schema> {
  return tree.has("anyOf", core.array$(Schema_is))(u)
}

export function Schema_isAllOf(u: Schema | $ref): u is Schema_allOf<Schema>
export function Schema_isAllOf<T>(u: unknown): u is Schema_allOf<T>
export function Schema_isAllOf(u: unknown): u is Schema_allOf<Schema> {
  return tree.has("allOf", core.array$(Schema_is))(u)
}

export const Schema_isNull
  : (u: unknown) => u is Schema_null
  = core.allOf$(
    tree.has("type", core.is.literally(DataType.null)),
    // tree.has("enum", 0, core.is.literally(null)),
    // tree.has("nullable", core.is.literally(true)),
  ) as never

// export const Schema_isConst = tree.has("const")
// export function Schema_isConst(u: Schema | $ref): u is Schema_const<Schema>
export function Schema_isConst<T>(u: unknown): u is Schema_const<T>
export function Schema_isConst(u: unknown): u is Schema_const<Schema> {
  return tree.has("const")(u)
}

export const Schema_isEnum = tree.has("enum")

export const Schema_isBoolean
  : (u: unknown) => u is Schema_boolean
  = tree.has("type", core.is.literally(DataType.boolean))

export const Schema_isInteger 
  : (u: unknown) => u is Schema_integer
  = tree.has("type", core.is.literally(DataType.integer))

export const Schema_isNumber
  : (u: unknown) => u is Schema_number
  = tree.has("type", core.is.literally(DataType.number))

export const Schema_isString
  : (u: unknown) => u is Schema_string
  = tree.has("type", core.is.literally(DataType.string))

export const Schema_isObject
  = (u: unknown): u is Schema_object => core.allOf$(
    tree.has("type", core.is.literally(DataType.object)),
    tree.has("properties", (u): u is typeof u => {
      if (u === null || typeof u !== "object") return false
      else if (core.is.array(u)) return false
      else return !("additionalProperties" in u) && core.record$(Schema_is)(u)
    }),
  )(u)

export const Schema_isRecord
  : (u: unknown) => u is Schema_record
  = core.allOf$(
    tree.has("type", core.is.literally(DataType.object)),
    (u): u is never => u !== null && typeof u === "object" && !("properties" in u),
    // tree.has("properties"),
    tree.has("additionalProperties", Schema_is),
  )

export const Schema_isArray: {
  // (u: Schema | $ref): u is Schema_array<Schema>
  (u: unknown): u is Schema_array
} = core.allOf$(
  tree.has("type", core.is.literally(DataType.array)),
  tree.has("items", (u): u is typeof u => !Array_isArray(u) /* Schema_is */)
)

export const Schema_isTuple: {
  (u: unknown): u is Schema_tuple
} = (u: unknown): u is Schema_tuple => core.allOf$(
  tree.has("type", core.is.literally(DataType.array)),
  tree.has("items", core.is.array),
)(u)

export function Schema_isCombinator(u: Schema | $ref): u is Schema_combinator<Schema>
export function Schema_isCombinator(u: unknown): u is Schema_combinator
export function Schema_isCombinator(u: unknown): u is Schema_combinator {
  return core.anyOf$(
    Schema_isAllOf,
    Schema_isAnyOf,
    Schema_isOneOf,
  )(u)
}

export const Schema_isScalar: {
  (u: Schema | $ref): u is Schema_scalar
  (u: unknown): u is Schema_scalar
} = core.anyOf$(
  Schema_isNull,
  Schema_isBoolean,
  Schema_isInteger,
  Schema_isNumber,
  Schema_isString,
)

export interface Schema_base<T = {}> { nullable?: boolean, example?: T }
export interface Schema_null<_ = {}, Meta extends {} = {}> extends 
  newtype<Meta>, 
  inline<{ type: DataType.null }>, 
  Schema_base<null>
  { enum?: { [0]: null }, nullable?: true }

export interface Schema_boolean<_ = {}, Meta extends {} = {}> extends 
  newtype<Meta>, 
  inline<{ type: DataType.boolean }>, 
  Schema_base<boolean> {}

export interface Schema_integer<_ = {}, Meta extends {} = {}> extends 
  newtype<Meta>, 
  inline<{ type: DataType.integer }>, 
  Schema_base<integer> {
    format?: autocomplete<format.integer>
    exclusiveMaximum?: boolean
    exclusiveMinimum?: boolean
    multipleOf?: number
    maximum?: number
    minimum?: number
  }

export interface Schema_number<
  _ = {}, 
  Meta extends {} = {}
> extends 
  newtype<Meta>, 
  inline<{ type: "number" }>, 
  Schema_base<number>  {
    format?: autocomplete<format.number>
    minimum?: number
    maximum?: number
    exclusiveMinimum?: boolean
    exclusiveMaximum?: boolean
    multipleOf?: number
  }

export interface Schema_string<
  _ = {}, 
  Meta extends {} = {}
> extends 
  newtype<Meta>, 
  inline<{ type: "string" }>, 
  Schema_base<string>  {
    pattern?: autocomplete<format.string>
    format?: string
    minLength?: number
    maxLength?: number
  }

export type Schema_scalar<Meta extends {} = {}> = 
  | Schema_null<Meta>
  | Schema_boolean<Meta>
  | Schema_integer<Meta>
  | Schema_number<Meta>
  | Schema_string<Meta>
  ;

export interface Schema_const<T = unknown, Meta extends {} = {}> extends newtype<Meta> { readonly const: T }
export interface Schema_allOf<T = unknown, Meta extends {} = {}> extends newtype<Meta> { readonly allOf: readonly T[] }
export interface Schema_anyOf<T = unknown, Meta extends {} = {}> extends newtype<Meta> { readonly anyOf: readonly T[] }
export interface Schema_oneOf<T = unknown, Meta extends {} = {}> extends newtype<Meta> { readonly oneOf: readonly T[] }
export type Schema_combinator<T = unknown, Meta extends {} = {}> =
  | Schema_allOf<T>
  | Schema_anyOf<T>
  | Schema_oneOf<T>
  ;

export interface Schema_array<T = unknown, Meta extends {} = {}> extends newtype<Meta>, Partial<Schema_Items> {
  readonly type: "array", 
  readonly items: T
}
export interface Schema_tuple<T = unknown, Meta extends {} = {}> extends newtype<Meta>, Partial<Schema_Items> {
  readonly type: "array", 
  readonly items: readonly T[]
}

export interface Schema_record<T = unknown, Meta extends {} = {}> extends newtype<Meta> { 
  readonly type: "object"
  // readonly required?: readonly string[]
  readonly additionalProperties: T
  // readonly properties?: { [x: string]: T }
}
export interface Schema_object<T = unknown, Meta extends {} = {}> { 
  readonly type: "object"
  readonly required?: readonly string[]
  readonly properties: { [x: string]: T }
  readonly additionalProperties?: T
}

export type Schema_composite<T = unknown, Meta extends {} = {}> =
  | Schema_array<T, Meta>
  | Schema_tuple<T, Meta>
  | Schema_object<T, Meta>
  | Schema_record<T, Meta>
  ;

export interface Schema_Null<T = unknown> extends newtype<T & {}>, Schema_base { [symbol.tag]: symbol.null }
export interface Schema_Boolean<T = unknown> extends newtype<T & {}>, Schema_base { [symbol.tag]: symbol.boolean }
export interface Schema_Integer<T = unknown> extends newtype<T & {}>, Schema_base { [symbol.tag]: symbol.integer }
export interface Schema_Number<T = unknown> extends newtype<T & {}>, Schema_base { [symbol.tag]: symbol.number }
export interface Schema_String<T = unknown> extends newtype<T & {}>, Schema_base { [symbol.tag]: symbol.string }

export type Schema_F<T> =
  | Schema_null
  | Schema_boolean
  | Schema_integer
  | Schema_number
  | Schema_string
  | Schema_const<unknown>
  | Schema_anyOf<T>
  | Schema_allOf<T>
  | Schema_oneOf<T>
  | Schema_array<T>
  | Schema_object<T>
  | Schema_tuple<T>
  | Schema_record<T>
  ;

export interface Schema_Const<T = unknown> extends newtype<T & {}> { [symbol.tag]: symbol.constant }
export interface Schema_AllOf<T = unknown> extends newtype<T & {}> { [symbol.tag]: symbol.allOf }
export interface Schema_AnyOf<T = unknown> extends newtype<T & {}> { [symbol.tag]: symbol.anyOf }
export interface Schema_OneOf<T = unknown> extends newtype<T & {}> { [symbol.tag]: symbol.oneOf }
export interface Schema_Object<T = unknown> extends newtype<T & {}> { [symbol.tag]: symbol.object }
export interface Schema_Array<T = unknown> extends newtype<T & {}> { [symbol.tag]: symbol.array }
export interface Schema_Tuple<T = unknown> extends newtype<T & {}> { [symbol.tag]: symbol.tuple }
export interface Schema_Record<T = unknown> extends newtype<T & {}> { [symbol.tag]: symbol.record }

export interface Schema_NullF extends HKT<{}> { [-1]: Schema_Null<this[0]> }
export interface Schema_BooleanF extends HKT<{}> { [-1]: Schema_Boolean<this[0]> }
export interface Schema_IntegerF extends HKT<{}> { [-1]: Schema_Integer<this[0]> }
export interface Schema_NumberF extends HKT<{}> { [-1]: Schema_Number<this[0]> }
export interface Schema_StringF extends HKT<{}> { [-1]: Schema_String<this[0]> }
export interface Schema_AnyOfF extends HKT<{}> { [-1]: Schema_AnyOf<this[0]> }
export interface Schema_OneOfF extends HKT<{}> { [-1]: Schema_OneOf<this[0]> }
export interface Schema_AllOfF extends HKT<{}> { [-1]: Schema_AllOf<this[0]> }
export interface Schema_ConstF extends HKT<{}> { [-1]: Schema_Const<this[0]> }

export interface SchemaKind extends HKT<Schema_F<any>> { [-1]: Schema_F<this[0]> }

export type Schema_kinds = typeof Schema_kinds
export declare const Schema_kinds: {
  null: Schema_NullF
  boolean: Schema_BooleanF
  integer: Schema_IntegerF
  number: Schema_NumberF
  string: Schema_StringF
  const: Schema_ConstF
  record: Schema_Record
  allOf: Schema_AllOfF
  anyOf: Schema_AnyOfF
  oneOf: Schema_OneOfF
}

export type Schema_tag<T>
  = T extends Schema_scalar ? Schema_tag.scalar<T>
  : T extends Schema_tuple ? Schema_tag.tuple<T>
  : T extends Schema_array ? Schema_tag.array<T>
  : T extends Schema_record ? Schema_tag.record<T>
  : T extends Schema_object ? Schema_tag.object<T>
  : T extends Schema_allOf ? Schema_tag.allOf<T>
  : T extends Schema_anyOf ? Schema_tag.anyOf<T>
  : T extends Schema_oneOf ? Schema_tag.oneOf<T>
  : never
  ;

export declare namespace Schema_tag { export { object_ as object } }
export declare namespace Schema_tag {
  type scalar<T extends Schema_scalar> = HKT.apply<typeof Schema_kinds[T["type"]], Mutable<T>>
  type array<
    T extends Schema_array, 
    $ extends 
    | KeepLast<T, { items: Schema_tag<T["items"]> }>
    = KeepLast<T, { items: Schema_tag<T["items"]> }>
  > = never | Schema_Array<$>
  type tuple<
    T extends Schema_tuple, 
    _ extends T["items"] = T["items"],
    $ extends 
    | KeepLast<T, { items: { -readonly [K in keyof _]: Schema_tag<_[K]> } }>
    = KeepLast<T, { items: { -readonly [K in keyof _]: Schema_tag<_[K]> } }>
  > = never | Schema_Tuple<$>
  type object_<
    T extends Schema_object, 
    $ extends 
    | KeepLast<T, { properties: { -readonly [K in keyof T["properties"]]: Schema_tag<T["properties"][K]> } }>
    = KeepLast<T, { properties: { -readonly [K in keyof T["properties"]]: Schema_tag<T["properties"][K]> } }>
  > = never | Schema_Object<$>
  type record<
    T extends Schema_record, 
    $ extends 
    | KeepLast<T, { additionalProperties: Schema_tag<T["additionalProperties"]> }>
    = KeepLast<T, { additionalProperties: Schema_tag<T["additionalProperties"]> }>
  > = never | Schema_Record<$>
  type allOf<T extends Schema_allOf> = never | Schema_AllOf<T> 
  type anyOf<T extends Schema_anyOf> = never | Schema_AnyOf<T> 
  type oneOf<T extends Schema_oneOf> = never | Schema_OneOf<T> 
  type const_<
    T extends Schema_const,
    $ extends 
    | KeepLast<T, { const: T["const"] }>
    = KeepLast<T, { const: T["const"] }>
  > = never | Schema_Const<$>
}

export interface Predicate<
  S = {} | null | undefined, 
> { (src: S, path: prop.any[]): boolean }

export type DocLike = { 
  paths?: {}, 
  components?: { schemas?: {} },
}

export declare namespace arbitrary {
  interface Countable {
    maxCount?: number
    minCount?: number
  }
  interface Schemas extends arbitrary.Countable {}
  interface Paths extends arbitrary.Countable {}
  interface PathParams extends arbitrary.Countable {}
  interface PathSegments extends arbitrary.Countable {}
  interface Request extends arbitrary.Countable {}
  interface Responses extends arbitrary.Countable {
    maxContentTypeCount?: number
    minContentTypeCount?: number
  }
  interface Include {
    example?: boolean
    examples?: boolean
    description?: boolean
    const?: boolean
  }
  interface Constraints {
    include?: arbitrary.Include
    schemas?: arbitrary.Schemas
    paths?: arbitrary.Paths
    pathParams?: arbitrary.PathParams
    pathSegments?: arbitrary.PathSegments
    responses?: arbitrary.Responses
  }
}

type AppliedConstraints = { [K in keyof arbitrary.Constraints]-?: Required<arbitrary.Constraints[K]> }

export const applyConstraints: (constraints?: arbitrary.Constraints) => AppliedConstraints = (_) =>
  !_
    ? defaults
    : {
        include: !_.include
          ? defaults.include
          : {
              const: _.include.const ?? defaults.include.const,
              description: _.include.description ?? defaults.include.description,
              example: _.include.example ?? defaults.include.example,
              examples: _.include.examples ?? defaults.include.examples,
            },
        pathParams: !_.pathParams
          ? defaults.pathParams
          : {
              maxCount: _.pathParams.maxCount ?? defaults.pathParams.maxCount,
              minCount: _.pathParams.minCount ?? defaults.pathParams.minCount,
            },
        paths: !_.paths
          ? defaults.paths
          : {
              maxCount: _.paths.maxCount ?? defaults.paths.maxCount,
              minCount: _.paths.minCount ?? defaults.paths.minCount,
            },
        pathSegments: !_.pathSegments
          ? defaults.pathSegments
          : {
              maxCount: _.pathSegments.maxCount ?? defaults.pathSegments.maxCount,
              minCount: _.pathSegments.minCount ?? defaults.pathSegments.minCount,
            },
        responses: !_.responses
          ? defaults.responses
          : {
              maxCount: _.responses.maxCount ?? defaults.responses.maxCount,
              minCount: _.responses.minCount ?? defaults.responses.minCount,
              maxContentTypeCount: _.responses.maxContentTypeCount ?? defaults.responses.maxContentTypeCount,
              minContentTypeCount: _.responses.minContentTypeCount ?? defaults.responses.minContentTypeCount,
            },
        schemas: !_.schemas
          ? defaults.schemas
          : {
              maxCount: _.schemas.maxCount ?? defaults.schemas.maxCount,
              minCount: _.schemas.minCount ?? defaults.schemas.minCount,
            },
      }

export const defaults = {
  schemas: {
    minCount: 1,
    maxCount: 25,
  },
  include: {
    const: false,
    description: false,
    example: false,
    examples: false,
  },
  paths: {
    minCount: 6,
    maxCount: 25,
  },
  pathParams: {
    minCount: 1,
    maxCount: 4,
  },
  pathSegments: {
    minCount: 1,
    maxCount: 4,
  },
  responses: {
    maxContentTypeCount: 5,
    minContentTypeCount: 2,

    minCount: 1,
    maxCount: 5,
  },
} satisfies Required<arbitrary.Constraints>

/** @internal */
export const lit: <T extends any.primitive>(value: T) => T = (value) => value

export function openapi() {}
openapi.is = {
  request: (u: openapi.requestBody): u is openapi.request => !("$ref" in u),
}

namespace http {
  export const Verb = {
    get: "get",
    post: "post",
    put: "put",
  } as const

  export const MediaType = {
    applicationJSON: "application/json",
    applicationFormURLEncoded: "application/x-www-form-urlencoded",
    applicationJavascript: "application/javascript",
    applicationOctetStream: "application/octet-stream",
    applicationXML: "application/xml",
    imageGIF: "image/gif",
    imageJPEG: "image/jpeg",
    imagePNG: "image/png",
    multipartFormData: "multipart/form-data",
    textCSV: "text/csv",
    textHTML: "text/html",
    textPlain: "text/plain",
    textXML: "text/xml",
  } as const
}

export declare namespace openapi {
  export { parameter }
}
export declare namespace openapi {
  const document: document.meta & {
    openapi: "3.0.1"
    schemas: openapi.schemas
    paths: { ["/api/v2/example/{id}"]?: openapi.pathitem } & {
      [path: string]: {
        // TODO: add TRACE, HEAD, etc.
        [http.Verb.get]?: openapi.operation
        [http.Verb.put]?: openapi.operation
        // [http.Verb.delete]?: openapi.operation
        // [http.Verb.patch]?: openapi.operation
        [http.Verb.post]?: {
          parameters?: readonly openapi.parameter[]
          responses?: {
            200?: openapi.response
            500?: openapi.response
          } & {
            /**
             * ### [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
             */
            [status: number]: {
              description?: string
              content?: {
                [http.MediaType.applicationJSON]?: openapi.mediatype
                [http.MediaType.applicationJavascript]?: openapi.mediatype
                [http.MediaType.applicationOctetStream]?: openapi.mediatype
                [http.MediaType.applicationXML]?: openapi.mediatype
                [http.MediaType.imageGIF]?: openapi.mediatype
                [http.MediaType.imageJPEG]?: openapi.mediatype
                [http.MediaType.imagePNG]?: openapi.mediatype
                [http.MediaType.multipartFormData]?: openapi.mediatype
                [http.MediaType.textCSV]?: openapi.mediatype
                [http.MediaType.textHTML]?: openapi.mediatype
                [http.MediaType.textPlain]?: openapi.mediatype
                [http.MediaType.textXML]?: openapi.mediatype
                // [http.MediaType.enum.applicationJSON]?: openapi.mediatype
                // [http.MediaType.enum.applicationFormURLEncoded]?: openapi.mediatype
                // [http.MediaType.enum.applicationOctetStream]?: openapi.mediatype
                // [http.MediaType.enum.applicationXML]?: openapi.mediatype
                // [http.MediaType.enum.imageGIF]?: openapi.mediatype
                // [http.MediaType.enum.imageJPEG]?: openapi.mediatype
                // [http.MediaType.enum.imagePNG]?: openapi.mediatype
                // [http.MediaType.enum.multipartFormData]?: openapi.mediatype
                // [http.MediaType.enum.textCSV]?: openapi.mediatype
                // [http.MediaType.enum.textHTML]?: openapi.mediatype
                // [http.MediaType.enum.textPlain]?: openapi.mediatype
                // [http.MediaType.enum.textXML]?: openapi.mediatype
              }
              headers?: openapi.headers
            }
          }
        }
      }
    }
  }

  namespace meta {
    interface server {}
    interface contact {}
    interface externalDocs {}
    interface license {}
    interface servers extends inline<readonly openapi.meta.server[]> {}
    interface reqs {}
    interface security extends inline<readonly openapi.meta.reqs[]> {}
    interface callbacks {}
    interface tag {}
    interface tags extends inline<readonly openapi.meta.tag[]> {}
    interface example {}
    interface examples extends inline<{ [name: string]: openapi.meta.example }> {}
    interface info {
      title: string
      version: string
      description?: string
      termsOfService?: string
      contact?: openapi.meta.contact
      license?: openapi.meta.license
    }
  }

  interface document extends document.meta {
    openapi: string
    paths: openapi.paths
    components?: openapi.components
  }
  namespace document {
    interface meta {
      info: openapi.meta.info
      servers?: openapi.meta.servers
      security?: openapi.meta.security
      tags?: openapi.meta.tags
      externalDocs?: openapi.meta.externalDocs
    }
  }

  interface components {
    schemas?: schemas
  }
  interface paths extends inline<{ [path: string]: openapi.pathitem }> {}
  interface $ref<T extends string = string> {
    $ref: T
  }
  interface pathitem extends pathitem.meta, pathitem.verbs {}

  namespace pathitem {
    /** TODO: implement trace, head, options */
    interface verbs {
      [http.Verb.get]?: openapi.operation
      [http.Verb.get]?: openapi.operation
      [http.Verb.post]?: openapi.operation
      [http.Verb.put]?: openapi.operation
      // [http.Verb.delete]?: openapi.operation
      // [http.Verb.patch]?: openapi.operation
    }
    interface meta {
      servers?: openapi.meta.servers
      $ref?: string
      summary?: string
      description?: string
      parameters?: openapi.parameters
    }
  }

  interface operation extends operation.meta {
    responses: openapi.responses
    parameters?: openapi.parameters
    requestBody?: openapi.requestBody
  }

  namespace operation {
    interface meta
      extends globalThis.Partial<{
        tags?: string[]
        summary?: string
        description?: string
        operationId?: string
        externalDocs?: openapi.meta.externalDocs
        callbacks?: openapi.meta.callbacks
        deprecated?: boolean
        security?: openapi.meta.security
        servers?: openapi.meta.servers
      }> {}
  }

  type requestBody = openapi.request
  // | openapi.$ref
  interface request {
    description?: string
    required?: boolean
    content?: openapi.content
  }

  interface schemas {
    [x: string]: Schema
  }
  interface parameters extends inline<readonly openapi.parameter[]> {}

  interface response {
    content?: openapi.content
    headers?: openapi.headers
  }
  interface responses extends 
    inline<{ [x: `1${number}`]: openapi.response }>,
    inline<{ [x: `2${number}`]: openapi.response }>,
    inline<{ [x: `3${number}`]: openapi.response }>,
    inline<{ [x: `4${number}`]: openapi.response }>,
    inline<{ [x: `5${number}`]: openapi.response }> {}

  interface content {
    [http.MediaType.applicationJSON]?: openapi.mediatype
    [http.MediaType.applicationFormURLEncoded]?: openapi.mediatype
    [http.MediaType.applicationOctetStream]?: openapi.mediatype
    [http.MediaType.applicationXML]?: openapi.mediatype
    [http.MediaType.applicationJavascript]?: openapi.mediatype
    [http.MediaType.imageGIF]?: openapi.mediatype
    [http.MediaType.imageJPEG]?: openapi.mediatype
    [http.MediaType.imagePNG]?: openapi.mediatype
    [http.MediaType.multipartFormData]?: openapi.mediatype
    [http.MediaType.textCSV]?: openapi.mediatype
    [http.MediaType.textHTML]?: openapi.mediatype
    [http.MediaType.textPlain]?: openapi.mediatype
    [http.MediaType.textXML]?: openapi.mediatype
  }

  type header = openapi.header.any
  interface headers extends inline<{ [name: string]: openapi.header }> {}
  namespace header {
    export { header_any as any }
    export interface header_any {}
  }

  interface mediatype<T = unknown> {
    schema?: Schema
    examples?: openapi.meta.examples
    example?: T
    encoding?: openapi.encoding
  }

  interface encoding {
    contentType?: string
    headers?: openapi.headers
    style?: string
    explode?: boolean
    allowReserved?: boolean
  }
}

export const style = {
  cookie: ["form"] as const satisfies string[],
  header: ["simple"] as const satisfies string[],
  path: [
    "simple", 
    "matrix", 
    "label",
  ] as const satisfies string[],
  query: [
    "form", 
    "spaceDelimited", 
    "pipeDelimited", 
    "deepObject",
  ] as const satisfies string[],
} as const

export declare namespace style {
  export type cookie = (typeof style.cookie)[number]
  export type header = (typeof style.header)[number]
  export type path = (typeof style.path)[number]
  export type query = (typeof style.query)[number]
}

export interface path_parameter
  extends inline<{
    in: "path"
    name: string
    schema: Schema
    required: boolean
    style?: style.path
    explode?: boolean
  }> {}

export interface query_parameter
  extends inline<{
    in: "query"
    name: string
    schema: Schema
    required?: boolean
    style?: style.query
    explode?: boolean
    deprecated?: boolean
  }> {}

export interface header_parameter
  extends inline<{
    in: "header"
    name: string
    schema: Schema
    required?: boolean
    style?: style.header
    explode?: boolean
    deprecated?: boolean
  }> {}

export interface cookie_parameter
  extends inline<{
    in: "cookie"
    name: string
    schema: Schema
    required?: boolean
    style?: style.cookie
    explode?: boolean
    deprecated?: boolean
  }> {}
