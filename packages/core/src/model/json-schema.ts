import { fn } from "@traversable/data"
import type { Functor, HKT } from "@traversable/registry"

import { t } from "../guard/index.js"
import { is } from "../guard/predicates.js"
import * as tree from "../tree.js"
import type { Meta } from "./meta.js"
import type { Enum, Items, MaybeAdditionalProps, Props } from "./shared.js"

export type {
  JsonSchema_F as F,
  JsonSchema_Meta as Meta,
  JsonSchema_lambda,
  JsonSchema_allOfF as allOfF,
  JsonSchema_anyOfF as anyOfF,
  JsonSchema_oneOfF as oneOfF,
  JsonSchema_objectF as objectF,
  JsonSchema_arrayF as arrayF,
}
export {
  JsonSchema as any,
  JsonSchema_Combinator as Combinator,
  JsonSchema_Composite as Composite,
  JsonSchema_Scalar as Scalar,
  JsonSchema_null as null,
  JsonSchema_enum as enum,
  JsonSchema_boolean as boolean,
  JsonSchema_integer as integer,
  JsonSchema_number as number,
  JsonSchema_string as string,
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

interface JsonSchema_Meta extends Meta.JsonSchema {}
interface JsonSchema_lambda extends HKT { [-1]: JsonSchema_F<this[0]> }

/** @internal */
const Object_entries = globalThis.Object.entries

interface JsonSchema_null { type: "null" }

const JsonSchema_null = t.object({ type: t.const('"null"') })
const JsonSchema_isNull
  : (u: unknown) => u is JsonSchema_null
  = JsonSchema_null.is

  declare const thing: unknown
  if(JsonSchema_isNull(thing)) {
    thing
  }

interface JsonSchema_boolean { type: "boolean" }
const JsonSchema_boolean = t.object({ type: t.const("boolean") })
const JsonSchema_isBoolean
  : (u: unknown) => u is JsonSchema_boolean
  = JsonSchema_boolean.is

interface JsonSchema_integer { type: "integer" }
const JsonSchema_integer = t.object({ type: t.const("integer") })
const JsonSchema_isInteger
  : (u: unknown) => u is JsonSchema_integer
  = JsonSchema_integer.is

interface JsonSchema_number { type: "number" }
const JsonSchema_number = t.object({ type: t.const("number") })
const JsonSchema_isNumber
  : (u: unknown) => u is JsonSchema_number
  = JsonSchema_number.is

interface JsonSchema_string { type: "string" }
const JsonSchema_string = t.object({ type: t.const("string") })
const JsonSchema_isString
  : (u: unknown) => u is JsonSchema_string
  = JsonSchema_string.is

interface JsonSchema_enum { enum: readonly unknown[] }
const JsonSchema_enum = t.object({ enum: t.array(t.any()) })
const JsonSchema_isEnum
  : (u: unknown) => u is JsonSchema_enum
  = JsonSchema_enum.is

type JsonSchema_Special = JsonSchema_enum
type JsonSchema_Scalar =
  | JsonSchema_null
  | JsonSchema_boolean
  | JsonSchema_integer
  | JsonSchema_number
  | JsonSchema_string
  ;
const JsonSchema_Scalar = t.anyOf(
  JsonSchema_null,
  JsonSchema_boolean,
  JsonSchema_integer,
  JsonSchema_number,
  JsonSchema_string,
)

const JsonSchema_isScalar
  : (u: unknown) => u is JsonSchema_Scalar
  = JsonSchema_Scalar.is

interface JsonSchema_allOf { allOf: readonly JsonSchema[] }
interface JsonSchema_allOfF<T> { allOf: readonly T[] }
const JsonSchema_allOf = t.object({ allOf: t.array(t.any()) })
const JsonSchema_isAllOf
  : <T>(u: unknown) => u is JsonSchema_allOfF<T>
  = tree.has("allOf", is.array) as never

interface JsonSchema_anyOf { anyOf: readonly JsonSchema[] }
interface JsonSchema_anyOfF<T> { anyOf: readonly T[] }
const JsonSchema_anyOf = t.object({ anyOf: t.array(t.any()) })
const JsonSchema_isAnyOf
  : <T>(u: unknown) => u is JsonSchema_anyOfF<T>
  = JsonSchema_anyOf.is as never

interface JsonSchema_oneOf { oneOf: readonly JsonSchema[] }
interface JsonSchema_oneOfF<T> { oneOf: readonly T[] }
const JsonSchema_oneOf = t.object({ oneOf: t.array(t.any()) })
function JsonSchema_isOneOf<T>(u: unknown): u is JsonSchema_oneOfF<T>
function JsonSchema_isOneOf(u: unknown) { return JsonSchema_oneOf.is(u) }

interface JsonSchema_array { type: "array", items: JsonSchema | readonly JsonSchema[] }
interface JsonSchema_arrayF<T> { type: "array", items: T | readonly T[] }

const JsonSchema_array = t.object({ type: t.const("array") })
function JsonSchema_isArray<T>(u: unknown): u is JsonSchema_arrayF<T> 
function JsonSchema_isArray(u: unknown) { return JsonSchema_array.is(u) }

interface JsonSchema_object extends 
  MaybeAdditionalProps<JsonSchema>, 
  Props<JsonSchema, { type: "object" }> {}

interface JsonSchema_objectF<T> extends 
  MaybeAdditionalProps<T>, 
  Props<T, { type: "object" }> {}

const JsonSchema_object = t.object({ type: t.const("object") })
function JsonSchema_isObject<T>(u: unknown): u is JsonSchema_objectF<T>
function JsonSchema_isObject(u: unknown) { return JsonSchema_object.is(u) && !("properties" in u) }

type JsonSchema_Combinator =
  | JsonSchema_allOf
  | JsonSchema_anyOf
  | JsonSchema_oneOf
const JsonSchema_Combinator = t.anyOf(
  JsonSchema_allOf,
  JsonSchema_anyOf,
  JsonSchema_oneOf,
)

function JsonSchema_isCombinator(u: unknown): u is JsonSchema_Combinator
function JsonSchema_isCombinator(u: unknown) { return JsonSchema_Combinator.is(u) }

type JsonSchema_Composite =
  | JsonSchema_array
  | JsonSchema_object
const JsonSchema_Composite = t.anyOf(
  JsonSchema_array,
  JsonSchema_object,
)

function JsonSchema_isComposite(u: unknown): u is JsonSchema_array | JsonSchema_object
function JsonSchema_isComposite(u: unknown) { return JsonSchema_Composite.is(u) }

type JsonSchema =
  | JsonSchema_Scalar
  | JsonSchema_Combinator
  | JsonSchema_Composite
  | JsonSchema_Special
  ;

type JsonSchema_F<T = any> =
  | JsonSchema_Scalar
  | Enum
  | JsonSchema_allOfF<T>
  | JsonSchema_anyOfF<T>
  | JsonSchema_oneOfF<T>
  | Items<T, { type: "array" }>
  | JsonSchema_objectF<T>
  ;
const JsonSchema = t.anyOf(
  JsonSchema_null,
  JsonSchema_boolean,
  JsonSchema_integer,
  JsonSchema_number,
  JsonSchema_string,
  JsonSchema_allOf,
  JsonSchema_anyOf,
  JsonSchema_oneOf,
  JsonSchema_array,
  JsonSchema_object,
)

function JsonSchema_is<T>(u: unknown): u is JsonSchema_F<T> {
  return JsonSchema.is(u)
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
