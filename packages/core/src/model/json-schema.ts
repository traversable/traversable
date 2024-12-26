import type { Functor, HKT } from "@traversable/registry"
import { fn } from "@traversable/data"

import { allOf, anyOf } from "../guard.js"
import * as is from "../is.js"
import { has } from "../tree.js"
import type { MaybeAdditionalProps, Props } from "./shared.js"

export type {
  JsonSchema as any,
  JsonSchema_Combinator as Combinator,
  JsonSchema_Composite as Composite,
  JsonSchema_F as F,
  JsonSchema_Scalar as Scalar,
  JsonSchema_lambda,
  /// 
  JsonSchema_null as null,
  JsonSchema_boolean as boolean,
  JsonSchema_integer as integer,
  JsonSchema_number as number,
  JsonSchema_string as string,
  JsonSchema_enum as enum,
  JsonSchema_allOf as allOf,
  JsonSchema_anyOf as anyOf,
  JsonSchema_oneOf as oneOf,
  JsonSchema_object as object,
  JsonSchema_array as array,
}

export {
  JsonSchema_Functor as Functor,
  JsonSchema_is as is,
}

type Meta = {
  nullable?: boolean
}
type ObjectMeta = Meta & { required?: readonly string[] }

type JsonSchema_null = { type: "null" } & Meta
type JsonSchema_boolean = { type: "boolean" } & Meta
type JsonSchema_integer = { type: "integer" } & Meta
type JsonSchema_number = { type: "number" } & Meta
type JsonSchema_string = { type: "string" } & Meta
type JsonSchema =
  | JsonSchema_Scalar
  | JsonSchema_Combinator
  | JsonSchema_Composite
  | JsonSchema_Special
  ;
type JsonSchema_Scalar =
  | JsonSchema_null
  | JsonSchema_boolean
  | JsonSchema_integer
  | JsonSchema_number
  | JsonSchema_string
  ;
type JsonSchema_enum = { enum: readonly unknown[] } & Meta
type JsonSchema_Special = JsonSchema_enum

type JsonSchema_array = { type: "array", items: JsonSchema | readonly JsonSchema[] } & Meta
declare namespace JsonSchema_array {
  type F<T> = { type: "array", items: T | readonly T[] }
}

type JsonSchema_object = (
  & Props<JsonSchema, { type: "object" }> 
  & MaybeAdditionalProps<JsonSchema> 
  & ObjectMeta
)

declare namespace JsonSchema_object { 
  type F<T> = (
    & Props<T, { type: "object" }> 
    & MaybeAdditionalProps<T> 
    & Meta 
  )
}

type JsonSchema_Composite =
  | JsonSchema_array
  | JsonSchema_object
  ;
type JsonSchema_allOf = { allOf: readonly JsonSchema[] } & Meta
declare namespace JsonSchema_allOf { type F<T> = { allOf: readonly T[] } & Meta }
type JsonSchema_anyOf = { anyOf: readonly JsonSchema[] } & Meta
declare namespace JsonSchema_anyOf { type F<T> = { anyOf: readonly T[] } & Meta }
type JsonSchema_oneOf = { oneOf: readonly JsonSchema[] } & Meta
declare namespace JsonSchema_oneOf { type F<T> = { oneOf: readonly T[] } & Meta }

type JsonSchema_Combinator = 
  | JsonSchema_allOf
  | JsonSchema_anyOf
  | JsonSchema_oneOf
  ;

interface JsonSchema_lambda extends HKT { [-1]: JsonSchema_F<this[0]> }
type JsonSchema_F<T = any> =
  | JsonSchema_Scalar
  | JsonSchema_enum
  | JsonSchema_allOf.F<T>
  | JsonSchema_anyOf.F<T>
  | JsonSchema_oneOf.F<T>
  | JsonSchema_array.F<T>
  // | Items<T, { type: "array" }>
  | JsonSchema_object.F<T>
  ;

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Array_isArray 
  : <T>(u: T | readonly T[]) => u is readonly T[]
  = globalThis.Array.isArray

const JsonSchema_isNull 
  : (u: unknown) => u is JsonSchema_null
  = has("type", is.literally("null"))

const JsonSchema_isBoolean
  : (u: unknown) => u is JsonSchema_boolean
  = has("type", is.literally("boolean"))

const JsonSchema_isInteger 
  : (u: unknown) => u is JsonSchema_integer
  = has("type", is.literally("integer"))

const JsonSchema_isNumber 
  : (u: unknown) => u is JsonSchema_number
  = has("type", is.literally("number"))

const JsonSchema_isString 
  : (u: unknown) => u is JsonSchema_string
  = has("type", is.literally("string"))

const JsonSchema_isEnum
  : (u: unknown) => u is JsonSchema_enum
  = has("enum", is.any.array)

const JsonSchema_isAllOf
  : <T>(u: unknown) => u is JsonSchema_allOf.F<T> 
  = has("allOf", is.any.array) as never

const JsonSchema_isAnyOf
  : <T>(u: unknown) => u is JsonSchema_anyOf.F<T> 
  = has("anyOf", is.any.array) as never

const JsonSchema_isOneOf
  : <T>(u: unknown) => u is JsonSchema_oneOf.F<T> 
  = has("oneOf", is.any.array) as never

const JsonSchema_isArray 
  : <T>(u: unknown) => u is JsonSchema_array.F<T> 
  = has("type", is.literally("array")) as never

const JsonSchema_isObject 
  : <T>(u: unknown) => u is JsonSchema_object.F<T> 
  = has("type", is.literally("object")) as never

const JsonSchema_isScalar
  : (u: unknown) => u is JsonSchema_Scalar 
  = anyOf(
    JsonSchema_isNull,
    JsonSchema_isBoolean,
    JsonSchema_isInteger,
    JsonSchema_isNumber,
    JsonSchema_isString,
  )

const JsonSchema_isSpecial
  : (u: unknown) => u is JsonSchema_Special
  = anyOf(JsonSchema_isEnum)

const JsonSchema_isCombinator 
  : <T>(u: unknown) => u is JsonSchema_Combinator
  = anyOf(
    JsonSchema_isAllOf,
    JsonSchema_isAnyOf,
    JsonSchema_isOneOf,
  ) as never

const JsonSchema_isComposite 
  : (u: unknown) => u is JsonSchema_array | JsonSchema_object
  = anyOf(
    JsonSchema_isArray,
    JsonSchema_isObject,
  ) as never

function JsonSchema_is<T>(u: unknown): u is JsonSchema_F<T> {
  return anyOf(
    JsonSchema_isScalar,
    JsonSchema_isSpecial,
    JsonSchema_isComposite,
    JsonSchema_isCombinator,
  )(u)
}

void (JsonSchema_is.null = JsonSchema_isNull)
void (JsonSchema_is.boolean = JsonSchema_isBoolean)
void (JsonSchema_is.integer = JsonSchema_isInteger)
void (JsonSchema_is.number = JsonSchema_isNumber)
void (JsonSchema_is.string = JsonSchema_isString)
void (JsonSchema_is.enum = JsonSchema_isEnum)
void (JsonSchema_is.allOf = JsonSchema_isAllOf)
void (JsonSchema_is.anyOf = JsonSchema_isAnyOf)
void (JsonSchema_is.oneOf = JsonSchema_isOneOf)
void (JsonSchema_is.object = JsonSchema_isObject)
void (JsonSchema_is.array = JsonSchema_isArray)
void (JsonSchema_is.scalar = JsonSchema_isScalar)
void (JsonSchema_is.special = JsonSchema_isSpecial)
void (JsonSchema_is.combinator = JsonSchema_isCombinator)
void (JsonSchema_is.composite = JsonSchema_isComposite)

const JsonSchema_Functor: Functor<JsonSchema_lambda, JsonSchema> = {
  map(f) {
    return (x) => {
      switch (true) {
        default: return fn.softExhaustiveCheck(x)
        case JsonSchema_is.enum(x): return { ...x, enum: x.enum }
        case JsonSchema_is.scalar(x): return x
        case JsonSchema_is.allOf(x): return { ...x, allOf: x.allOf.map(f) }
        case JsonSchema_is.anyOf(x): return { ...x, anyOf: x.anyOf.map(f) }
        case JsonSchema_is.oneOf(x): return  { ...x, oneOf: x.oneOf.map(f) }
        case JsonSchema_is.array(x): return { 
          ...x, 
          items: Array_isArray(x.items) 
            ? x.items.map(f)
            : f(x.items),
        }
        case JsonSchema_is.object(x): {
          const { additionalProperties: aprops, properties: props, ...y } = x
          const p = Object_entries(props).map(([k, v]) => [k, f(v)] satisfies [string, any])
          const a = aprops ? f(aprops) : null
          return {
            ...y,
            properties: Object.fromEntries(p),
            ...a && { additionalProperties: a },
          }
        }
      }
    }
  }
}
