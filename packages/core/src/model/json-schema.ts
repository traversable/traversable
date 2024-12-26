import type { Functor, HKT } from "@traversable/registry"

import { fn } from "@traversable/data"
import { and, anyOf } from "../guard.js"
import * as is from "../is.js"
import * as tree from "../tree.js"
import type { Enum, Items, MaybeAdditionalProps, Props } from "./shared.js"

export type {
  JsonSchema as any,
  JsonSchema_Combinator as Combinator,
  JsonSchema_Composite as Composite,
  JsonSchema_F as F,
  JsonSchema_Meta as Meta,
  JsonSchema_Scalar as Scalar,
  JsonSchema_null as null,
  JsonSchema_enum as enum,
  JsonSchema_boolean as boolean,
  JsonSchema_integer as integer,
  JsonSchema_lambda,
  JsonSchema_number as number,
  JsonSchema_string as string,
  JsonSchema_allOf as allOf,
  JsonSchema_anyOf as anyOf,
  JsonSchema_oneOf as oneOf,
  JsonSchema_object as object,
  JsonSchema_array as array,
  JsonSchema_allOfF as allOfF,
  JsonSchema_anyOfF as anyOfF,
  JsonSchema_oneOfF as oneOfF,
  JsonSchema_objectF as objectF,
  JsonSchema_arrayF as arrayF,
}

export {
  JsonSchema_Functor as Functor,
  JsonSchema_is as is,
}

interface JsonSchema_Meta { originalIndex?: number }

type JsonSchema =
  | JsonSchema_Scalar
  | JsonSchema_Combinator
  | JsonSchema_Composite
  | JsonSchema_Special

type JsonSchema_null = { type: "null" }
type JsonSchema_boolean = { type: "boolean" }
type JsonSchema_integer = { type: "integer" }
type JsonSchema_number = { type: "number" }
type JsonSchema_string = { type: "string" }
type JsonSchema_Scalar =
  | JsonSchema_null
  | JsonSchema_boolean
  | JsonSchema_integer
  | JsonSchema_number
  | JsonSchema_string

type JsonSchema_enum = { enum: readonly unknown[] }
type JsonSchema_Special =
  | JsonSchema_enum

type JsonSchema_array =
  | { type: "array", items: JsonSchema }
  | { type: "array", items: readonly JsonSchema[] }

type JsonSchema_object = Props<JsonSchema, { type: "object" }> & MaybeAdditionalProps<JsonSchema> 
type JsonSchema_objectF<T> = Props<T, { type: "object" }> & MaybeAdditionalProps<T>
type JsonSchema_arrayF<T> =
  | { type: "array", items: T }
  | { type: "array", items: readonly T[] }

type JsonSchema_Composite =
  | JsonSchema_array
  | JsonSchema_object

type JsonSchema_allOf = { allOf: readonly JsonSchema[] }
type JsonSchema_anyOf = { anyOf: readonly JsonSchema[] }
type JsonSchema_oneOf = { oneOf: readonly JsonSchema[] }
type JsonSchema_allOfF<T> = { allOf: readonly T[] }
type JsonSchema_anyOfF<T> = { anyOf: readonly T[] }
type JsonSchema_oneOfF<T> = { oneOf: readonly T[] }
type JsonSchema_Combinator = 
  | JsonSchema_allOf
  | JsonSchema_anyOf
  | JsonSchema_oneOf


interface JsonSchema_lambda extends HKT { [-1]: JsonSchema_F<this[0]> }
type JsonSchema_F<T = any> =
  | JsonSchema_Scalar
  | Enum
  | JsonSchema_allOfF<T>
  | JsonSchema_anyOfF<T>
  | JsonSchema_oneOfF<T>
  | Items<T, { type: "array" }>
  | JsonSchema_objectF<T>
  ;

/** @internal */
const Object_entries = globalThis.Object.entries

const JsonSchema_isNull 
  : (u: unknown) => u is JsonSchema_null
  = tree.has("type", is.literally("null"))

const JsonSchema_isBoolean
  : (u: unknown) => u is JsonSchema_boolean
  = tree.has("type", is.literally("boolean"))

const JsonSchema_isInteger 
  : (u: unknown) => u is JsonSchema_integer
  = tree.has("type", is.literally("integer"))

const JsonSchema_isNumber 
  : (u: unknown) => u is JsonSchema_number
  = tree.has("type", is.literally("number"))

const JsonSchema_isString 
  : (u: unknown) => u is JsonSchema_string
  = tree.has("type", is.literally("string"))

const JsonSchema_isEnum
  : (u: unknown) => u is JsonSchema_enum
  = tree.has("enum", is.any.array) as never

const JsonSchema_isScalar
  : (u: unknown) => u is JsonSchema_Scalar 
  = anyOf(
    JsonSchema_isNull,
    JsonSchema_isBoolean,
    JsonSchema_isInteger,
    JsonSchema_isNumber,
    JsonSchema_isString,
  )

const JsonSchema_isAllOf
  : <T>(u: unknown) => u is JsonSchema_allOfF<T> 
  = tree.has("allOf", is.any.array) as never

const JsonSchema_isAnyOf
  : <T>(u: unknown) => u is JsonSchema_anyOfF<T> 
  = tree.has("anyOf", is.any.array) as never

const JsonSchema_isOneOf
  : <T>(u: unknown) => u is JsonSchema_oneOfF<T> 
  = tree.has("oneOf", is.any.array) as never

const JsonSchema_isArray 
  : <T>(u: unknown) => u is JsonSchema_arrayF<T> 
  = tree.has("type", is.literally("array")) as never

const JsonSchema_isObject 
  : <T>(u: unknown) => u is JsonSchema_objectF<T> 
  = and(
    tree.has("type", is.literally("object")),
    (u: unknown): u is never => is.any.record(u) && !("properties" in u)
  )

const JsonSchema_isCombinator 
  : <T>(u: unknown) => u is JsonSchema_Combinator
  = anyOf(
    JsonSchema_isAllOf,
    JsonSchema_isAnyOf,
    JsonSchema_isOneOf,
  ) as never

const JsonSchema_isComposite 
  : (u: unknown) => u is JsonSchema_array | JsonSchema_object
  = is.or(
    JsonSchema_isArray,
    JsonSchema_isObject,
  ) as never

function JsonSchema_is<T>(u: unknown): u is JsonSchema_F<T> {
  return anyOf(
    JsonSchema_isNull,
    JsonSchema_isBoolean,
    JsonSchema_isInteger,
    JsonSchema_isNumber,
    JsonSchema_isString,
    JsonSchema_isEnum,
    JsonSchema_isArray,
    JsonSchema_isObject,
    JsonSchema_isOneOf,
    JsonSchema_isAnyOf,
    JsonSchema_isAllOf,
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
void (JsonSchema_is.combinator = JsonSchema_isCombinator)
void (JsonSchema_is.composite = JsonSchema_isComposite)
void (JsonSchema_is.scalar = JsonSchema_isScalar)

const JsonSchema_Functor: Functor<JsonSchema_lambda, JsonSchema> = {
  map(f) {
    return (x) => {
      switch (true) {
        default: return fn.softExhaustiveCheck(x)
        case JsonSchema_is.enum(x): return { enum: x.enum }
        case JsonSchema_is.scalar(x): return x
        case JsonSchema_is.array(x): return { ...x, items: f(x.items) }
        case JsonSchema_is.allOf(x): return { ...x, allOf: x.allOf.map(f) }
        case JsonSchema_is.anyOf(x): return { ...x, anyOf: x.anyOf.map(f) }
        case JsonSchema_is.oneOf(x): return  { ...x, oneOf: x.oneOf.map(f) }
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
