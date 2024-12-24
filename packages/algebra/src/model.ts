import { and, anyOf, core, is, tree } from "@traversable/core"
import { fn, type nonempty } from "@traversable/data"
import type { Functor, HKT, Merge, Mutable, newtype } from "@traversable/registry"

export {
  JsonSchema,
  Traversable,
}

/** @internal */
type intersect<S extends readonly {}[], Out = {}> = S extends nonempty.arrayOf<{}, infer H, infer T>
  ? intersect<T, Out & Mutable<H>>
  : Out

interface Enum<M extends {} = {}> extends newtype<M> { enum: readonly unknown[] }
interface Items<T, M extends {} = {}> extends newtype<M> { items: T }
interface FiniteItems<T, M extends {} = {}> extends newtype<M> { items: readonly T[] }
interface Props<T, M extends {} = {}> extends newtype<M> { properties: { [x: string]: T }, required?: readonly string[] }
interface MaybeAddtlProps<T, M extends {} = {}> extends newtype<M> { additionalProperties?: T }
interface AddtlProps<T, M extends {} = {}> extends newtype<M> { additionalProperties: T }
interface Combinator<T, K extends string> extends newtype<{ [P in K]: readonly T[] }> {}

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

type JsonSchema_object = Props<JsonSchema, { type: "object" }> & MaybeAddtlProps<JsonSchema> 
type JsonSchema_objectF<T> = Props<T, { type: "object" }> & MaybeAddtlProps<T>
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

declare namespace JsonSchema {
  export interface Meta { originalIndex?: number }
  export type F<T = any> =
    | JsonSchema_Scalar
    | Enum
    | JsonSchema_allOfF<T>
    | JsonSchema_anyOfF<T>
    | JsonSchema_oneOfF<T>
    | Items<T, { type: "array" }>
    | JsonSchema_objectF<T>
    ;
  export interface lambda extends HKT { [-1]: JsonSchema.F<this[0]> }

  export {
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
    JsonSchema_allOfF as allOfF,
    JsonSchema_anyOfF as anyOfF,
    JsonSchema_oneOfF as oneOfF,
    JsonSchema_objectF as objectF,
    JsonSchema_arrayF as arrayF,
  }
}

type Traversable =
  | Traversable_Scalar
  | Traversable_Combinator
  | Traversable_Special
  | Traversable_Composite
  ;

declare namespace Traversable { 
  export { 
    Traversable_any as any, 
    Traversable_lambda as lambda,
    Traversable_F as F,
    Traversable_Meta as Meta,
    Traversable_toType as toType,
    Traversable_fromJsonSchema as fromJsonSchema,
    Traversable_Scalar as Scalar,
    Traversable_Combinator as Combinator,
    Traversable_Composite as Composite,
    Traversable_Special as Special,
    /// 
    Traversable_null as null,
    Traversable_boolean as boolean,
    Traversable_integer as integer,
    Traversable_number as number,
    Traversable_string as string,
    Traversable_enum as enum,
    Traversable_allOf as allOf,
    Traversable_anyOf as anyOf,
    Traversable_oneOf as oneOf,
    Traversable_array as array,
    Traversable_tuple as tuple,
    Traversable_object as object,
    Traversable_record as record,
    Traversable_allOfF as allOfF,
    Traversable_anyOfF as anyOfF,
    Traversable_oneOfF as oneOfF,
    Traversable_arrayF as arrayF,
    Traversable_tupleF as tupleF,
    Traversable_recordF as recordF,
    Traversable_objectF as objectF,
    ///
  }
}

interface Traversable_null extends JsonSchema_null {}
interface Traversable_boolean extends JsonSchema_boolean {}
interface Traversable_integer extends JsonSchema_integer {}
interface Traversable_number extends JsonSchema_number {}
interface Traversable_string extends JsonSchema_string {}
interface Traversable_enum extends Enum<{ type: "enum" }> {}
interface Traversable_allOf extends Combinator<Traversable, "allOf"> { type: "allOf" }
interface Traversable_anyOf extends Combinator<Traversable, "anyOf"> { type: "anyOf" }
interface Traversable_oneOf extends Combinator<Traversable, "oneOf"> { type: "oneOf" }
interface Traversable_array extends Items<Traversable, { type: "array" }> {}
interface Traversable_tuple extends FiniteItems<Traversable, { type: "tuple" }> {}
interface Traversable_record extends AddtlProps<Traversable, { type: "record" }> {}
interface Traversable_object extends 
  Props<Traversable, { type: "object" }>, 
  MaybeAddtlProps<Traversable> {}

type Traversable_Scalar =
  | Traversable_null
  | Traversable_boolean
  | Traversable_integer
  | Traversable_number 
  | Traversable_string 
  ;
type Traversable_Special =
  | Traversable_enum
  ;
type Traversable_Combinator =
  | Traversable_allOf
  | Traversable_anyOf
  | Traversable_oneOf
  ;
type Traversable_Composite =
  | Traversable_array
  | Traversable_tuple
  | Traversable_record
  | Traversable_object
  ;
interface Traversable_arrayF<T> extends Items<T> { type: "array" }
interface Traversable_objectF<T> extends Props<T>, MaybeAddtlProps<T> { type: "object" }
interface Traversable_tupleF<T> extends FiniteItems<T> { type: "tuple" }
interface Traversable_recordF<T> extends AddtlProps<T> { type: "record" }
interface Traversable_allOfF<T> extends Combinator<T, "allOf"> { type: "allOf" }
interface Traversable_anyOfF<T> extends Combinator<T, "anyOf"> { type: "anyOf" }
interface Traversable_oneOfF<T> extends Combinator<T, "oneOf"> { type: "oneOf" }

type Traversable_any = 
  | JsonSchema
  | Traversable

type Traversable_fromJsonSchema<T extends JsonSchema> = Traversable_fromJsonSchema.loop<T>
declare namespace Traversable_fromJsonSchema {
  type loop<S> 
    // if `S` is the full union, short circuit
    = [JsonSchema] extends [S] ? Traversable
    : S extends JsonSchema_Scalar ? Extract<Traversable_Scalar, { type: S["type"] }>
    : S extends { allOf: infer T } ? S & { type: "allOf"; allOf: readonly Traversable_fromJsonSchema.loop<T>[] }
    : S extends { anyOf: infer T } ? S & { type: "anyOf"; anyOf: readonly Traversable_fromJsonSchema.loop<T>[] }
    : S extends { oneOf: infer T } ? { type: "oneOf"; oneOf: readonly T[] }
    : S extends { properties: { [x: string]: infer T } } ? { type: "object"; properties: { [x: string]: Traversable_fromJsonSchema.loop<T> } }
    : S extends { additionalProperties: infer T } ? { type: "record"; additionalProperties: Traversable_fromJsonSchema.loop<T> }
    : S extends { items: infer T extends readonly unknown[] } ? { type: "tuple"; items: { [I in keyof T]: Traversable_fromJsonSchema.loop<T[I]> } }
    : S extends { items: infer T } ? { type: "array"; items: Traversable_fromJsonSchema.loop<T> }
    : never
}

type Traversable_toType<T> = Traversable_toType.loop<T>
declare namespace Traversable_toType {
  type loop<S> 
    = S extends JsonSchema_Scalar ? (typeof ScalarTypeMap)[S["type"]]
    : S extends { allOf: infer T extends readonly {}[] } ? intersect<T>
    : S extends { anyOf: infer T extends Traversable.any } ? Traversable_toType.loop<T>
    : S extends { oneOf: infer T extends Traversable.any } ? Traversable_toType.loop<T>
    : S extends { items: infer T extends readonly Traversable.any[] } ? { -readonly [I in keyof T]: Traversable_toType.loop<T[I]> }
    : S extends { items: infer T extends Traversable.any } ? readonly Traversable_toType.loop<T>[]
    : S extends { properties: infer T extends { [x: string]: Traversable.any }, required: readonly (infer Req extends string)[] } 
    ? Merge<
      { -readonly [K in Req & keyof T]: Traversable_toType.loop<T[K]> },
      { -readonly [K in Exclude<keyof T, Req>]+?: Traversable_toType.loop<T[K]> }
    >
    : S extends { additionalProperties: infer T extends Traversable.any } 
    ? globalThis.Record<string, Traversable_toType.loop<T>> 
    : never

  const ScalarTypeMap: {
    null: null
    boolean: boolean
    integer: number
    number: number
    string: string
  }
}

type Traversable_F<T> =
  | Traversable_Scalar
  | Traversable_Special
  | Traversable_allOfF<T>
  | Traversable_anyOfF<T>
  | Traversable_oneOfF<T>
  | Traversable_arrayF<T>
  | Traversable_tupleF<T>
  | Traversable_recordF<T>
  | Traversable_objectF<T>
  ;
interface Traversable_Meta extends JsonSchema.Meta {}
interface Traversable_lambda extends HKT { [-1]: Traversable.F<this[0]> }

/** @internal */
const Array_isArray = globalThis.Array.isArray
/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const isObject: (u: unknown) => u is { [x: string]: unknown } = (u): u is never =>
  u !== null && typeof u === "object" && !Array_isArray(u)

const JsonSchema_isNull = tree.has("type", is.literally("null"))
const JsonSchema_isBoolean = tree.has("type", is.literally("boolean"))
const JsonSchema_isInteger = tree.has("type", is.literally("integer"))
const JsonSchema_isNumber = tree.has("type", is.literally("number"))
const JsonSchema_isString = tree.has("type", is.literally("string"))
const JsonSchema_isEnum
  : (u: unknown) => u is { enum: readonly unknown[] } 
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
  = tree.has("allOf", core.is.any.array) as never

const JsonSchema_isAnyOf
  : <T>(u: unknown) => u is JsonSchema_anyOfF<T> 
  = tree.has("anyOf", core.is.any.array) as never
const JsonSchema_isOneOf
  : <T>(u: unknown) => u is JsonSchema_oneOfF<T> 
  = tree.has("oneOf", core.is.any.array) as never

namespace JsonSchema {
  export function is<T>(u: unknown): u is JsonSchema.F<T> {
    return anyOf(
      is.null,
      is.boolean,
      is.integer,
      is.number,
      is.string,
      is.enum,
      is.array,
      is.object,
      is.oneOf,
      is.anyOf,
      is.allOf,
    )(u)
  }
  is.null = JsonSchema_isNull
  is.enum = JsonSchema_isEnum

  export namespace is {
    export const boolean = (u: unknown): u is JsonSchema.boolean => isObject(u) && u.type === "boolean"
    export const integer = (u: unknown): u is JsonSchema.integer => isObject(u) && u.type === "integer"
    export const number = (u: unknown): u is JsonSchema.number => isObject(u) && u.type === "number"
    export const string = (u: unknown): u is JsonSchema.string => isObject(u) && u.type === "string"
    export const allOf = <T>(u: unknown): u is JsonSchema.allOfF<T> => isObject(u) && Array_isArray(u.allOf)
    export const anyOf = <T>(u: unknown): u is JsonSchema.anyOfF<T> => isObject(u) && Array_isArray(u.anyOf)
    export const oneOf = <T>(u: unknown): u is JsonSchema.oneOfF<T> => isObject(u) && Array_isArray(u.oneOf)
    export const object = <T>(u: unknown): u is JsonSchema.objectF<T> =>
      isObject(u) && u.type === "object" && !!u.properties
    export const array = <T>(u: unknown): u is JsonSchema.arrayF<T> => isObject(u) && u.type === "array"
    export const scalar = (u: unknown): u is JsonSchema.Scalar =>
      (  JsonSchema.is.null(u) 
      || JsonSchema.is.boolean(u) 
      || JsonSchema.is.integer(u) 
      || JsonSchema.is.number(u) 
      || JsonSchema.is.string(u))
    export const combinator = (u: unknown): u is JsonSchema.allOf | JsonSchema.anyOf | JsonSchema.oneOf => 
      (  is.allOf(u) 
      || is.anyOf(u) 
      || is.oneOf(u))
    export const composite = (u: unknown): u is JsonSchema.array | JsonSchema.object => 
      (  is.array(u) 
      || is.object(u))
  }

  export const Functor: Functor<JsonSchema.lambda, JsonSchema> = {
    map: function map(f) {
      return (x) => {
        switch (true) {
          default: return fn.softExhaustiveCheck(x)
          case JsonSchema.is.enum(x): return { enum: x.enum }
          case JsonSchema.is.scalar(x): return x
          case JsonSchema.is.array(x): return { ...x, items: f(x.items) }
          case JsonSchema.is.allOf(x): return { ...x, allOf: x.allOf.map(f) }
          case JsonSchema.is.anyOf(x): return { ...x, anyOf: x.anyOf.map(f) }
          case JsonSchema.is.oneOf(x): return  { ...x, oneOf: x.oneOf.map(f) }
          case JsonSchema.is.object(x): {
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
    },
  }
}


const Traversable_is = {
  null: JsonSchema_isNull as (u: unknown) => u is Traversable_null,
  boolean: JsonSchema_isBoolean as (u: unknown) => u is Traversable_boolean,
  integer: JsonSchema_isInteger as (u: unknown) => u is Traversable_integer,
  number: JsonSchema_isNumber as (u: unknown) => u is Traversable_number,
  string: JsonSchema_isString as (u: unknown) => u is Traversable_string,
  enum: and(
    tree.has("type", is.literally("enum")),
    JsonSchema_isEnum,
  ) as (u: unknown) => u is Traversable_enum,
  allOf: and(
    tree.has("type", is.literally("allOf")),
    JsonSchema_isAllOf,
  ) as <T>(u: unknown) => u is Traversable_allOfF<T>,
  anyOf: and(
    tree.has("type", is.literally("anyOf")),
    JsonSchema_isAnyOf,
  ) as <T>(u: unknown) => u is Traversable_anyOfF<T>,
  oneOf: and(
    tree.has("type", is.literally("oneOf")),
    JsonSchema_isOneOf,
  ) as <T>(u: unknown) => u is Traversable_oneOfF<T>,
  object: and(
    tree.has("type", is.literally("object")),
    tree.has("properties", is.any.object),
  ) as <T>(u: unknown) => u is Traversable_objectF<T>,
  array: and(
    tree.has("type", is.literally("array")),
    (u: unknown): u is typeof u => true,
  ) as <T>(u: unknown) => u is Traversable_arrayF<T>,
  record: tree.has("type", is.literally("record")) as <T>(u: unknown) => u is Traversable_recordF<T>,
  tuple: and(
    tree.has("type", is.literally("tuple")),
    tree.has("items", core.is.any.array),
  ) as <T>(u: unknown) => u is Traversable_tupleF<T>,
  scalar: JsonSchema_isScalar,
}

export const Traversable_Functor: Functor<Traversable.lambda, Traversable> = { map }
export function map<S, T>(f: (s: S) => T): (s: Traversable.F<S>) => Traversable.F<T> {
  return (x: Traversable.F<S>) => {
    switch (true) {
      default: return fn.softExhaustiveCheck(x)
      case Traversable.is.enum(x): return x
      case Traversable.is.null(x): return x
      case Traversable.is.boolean(x): return x
      case Traversable.is.integer(x): return x
      case Traversable.is.number(x): return x
      case Traversable.is.string(x): return x
      case Traversable.is.array(x): return { ...x, items: f(x.items) }
      case Traversable.is.allOf(x): return { ...x, allOf: x.allOf.map(f) }
      case Traversable.is.anyOf(x): return { ...x, anyOf: x.anyOf.map(f) }
      case Traversable.is.oneOf(x): return { ...x, oneOf: x.oneOf.map(f) }
      case Traversable.is.tuple(x): return { ...x, items: x.items.map(f) }
      case Traversable.is.record(x): return { ...x, additionalProperties: f(x.additionalProperties) }
      case Traversable.is.object(x): {
        const { additionalProperties: addtl, properties: props, ...y } = x
        const target = Object_entries(props).map(([k, v]) => [k, f(v)])
        return {
          ...y,
          properties: Object_fromEntries(target),
          ...addtl && { additionalProperties: f(addtl) },
        }
      }
    }
  }
}

const Traversable_fromSchema
  = ((expr: JsonSchema) => {
    const meta = {
      ...tree.has("originalIndex", core.is.number)(expr) && { originalIndex: expr.originalIndex },
      ...tree.has("required", core.is.array(core.is.string))(expr) && { required: expr.required },
    }
    switch (true) {
      default: return fn.softExhaustiveCheck(expr)
      case JsonSchema.is.enum(expr): return { ...expr, type: "enum" }
      case JsonSchema.is.scalar(expr): return expr
      case JsonSchema.is.allOf(expr): return { ...expr, type: "allOf", allOf: expr.allOf, }
      case JsonSchema.is.anyOf(expr): return { ...expr, type: "anyOf", anyOf: expr.anyOf }
      case JsonSchema.is.oneOf(expr): return { ...expr, type: "oneOf", oneOf: expr.oneOf }
      case JsonSchema.is.array(expr): return { ...meta, ...expr, type: Array_isArray(expr.items) ? "tuple" : "array" }
      case JsonSchema.is.object(expr): return { ...expr, type: expr.properties ? "object" : "record" }
    }
  }) as (expr: JsonSchema) => Traversable

const fromSchema 
  : (term: JsonSchema | Traversable) => Traversable
  = Traversable_unfold(Traversable_fromSchema as never)

export function Traversable_unfold<T>(coalgebra: Functor.Coalgebra<Traversable.lambda, T>): (term: T) => Traversable
export function Traversable_unfold<T>(coalgebra: Functor.Coalgebra<Traversable.lambda, T>) /// impl.
  { return fn.ana(Traversable_Functor)(coalgebra) }

function Traversable() {}
Traversable.is = Traversable_is
Traversable.Functor = Traversable_Functor
Traversable.fromSchema = fromSchema
