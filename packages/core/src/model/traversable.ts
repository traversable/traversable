import { and, anyOf } from "../guard.js"
import * as is from "../is.js"
import { has } from "../tree.js"

import { fn, type nonempty } from "@traversable/data"
import type { Functor, HKT, Merge, Mutable } from "@traversable/registry"
import * as JsonSchema from "./json-schema.js"
import type { AdditionalProps, Combinator, Enum, FiniteItems, Items, MaybeAdditionalProps, Props } from "./shared.js"

export type { 
  Traversable,
  Traversable_any as any, 
  Traversable_lambda as lambda,
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
  ///
  Traversable_F as F,
  Traversable_allOfF as allOfF,
  Traversable_anyOfF as anyOfF,
  Traversable_oneOfF as oneOfF,
  Traversable_arrayF as arrayF,
  Traversable_tupleF as tupleF,
  Traversable_recordF as recordF,
  Traversable_objectF as objectF,
  ///
}

export {
  Traversable_Functor as Functor,
  Traversable_fromSchema as fromSchema,
  Traversable_is as is,
  Traversable_unfold as unfold,
}

/** @internal */
type intersect<S extends readonly {}[], Out = {}> 
  = S extends nonempty.arrayOf<{}, infer H, infer T> ? intersect<T, Out & Mutable<H>> : Out
/** @internal */
const Object_assign = globalThis.Object.assign
/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */

type Traversable =
  | Traversable_Scalar
  | Traversable_Combinator
  | Traversable_Special
  | Traversable_Composite
  ;
type Traversable_any = 
  | JsonSchema.any
  | Traversable
  ;
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
interface Traversable_lambda extends HKT { [-1]: Traversable_F<this[0]> }

interface Traversable_null extends JsonSchema.null, Traversable_Meta {}
interface Traversable_boolean extends JsonSchema.boolean, Traversable_Meta {}
interface Traversable_integer extends JsonSchema.integer, Traversable_Meta {}
interface Traversable_number extends JsonSchema.number, Traversable_Meta {}
interface Traversable_string extends JsonSchema.string, Traversable_Meta {}
interface Traversable_enum extends Enum<{ type: "enum" }>, Traversable_Meta {}
interface Traversable_allOf extends 
  Combinator<Traversable, "allOf">, 
  Traversable_Meta 
  { type: "allOf" }

interface Traversable_anyOf extends 
  Combinator<Traversable, "anyOf">, 
  Traversable_Meta 
  { type: "anyOf" }

interface Traversable_oneOf extends 
  Combinator<Traversable, "oneOf">, 
  Traversable_Meta 
  { type: "oneOf" }

interface Traversable_array extends 
  Traversable_Meta,
  Items<Traversable> 
  { type: "array" }
  
interface Traversable_tuple extends 
  FiniteItems<Traversable>, 
  Traversable_Meta 
  { type: "tuple" }

interface Traversable_record extends 
  AdditionalProps<Traversable>, 
  Traversable_Meta 
  { type: "record" }

interface Traversable_object extends 
  Props<Traversable>, 
  MaybeAdditionalProps<Traversable>, 
  Traversable_Meta 
  { type: "object" }

interface Traversable_arrayF<T> extends 
  Items<T>, 
  Traversable_Meta 
  { type: "array" }

interface Traversable_objectF<T> extends 
  Props<T>, 
  MaybeAdditionalProps<T>, 
  Traversable_Meta 
  { type: "object" }

interface Traversable_tupleF<T> extends 
  FiniteItems<T>, 
  Traversable_Meta 
  { type: "tuple" }

interface Traversable_recordF<T> extends 
  AdditionalProps<T>, 
  Traversable_Meta 
  { type: "record" }

interface Traversable_allOfF<T> extends 
  Combinator<T, "allOf">, 
  Traversable_Meta 
  { type: "allOf" }

interface Traversable_anyOfF<T> extends 
  Combinator<T, "anyOf">, 
  Traversable_Meta 
  { type: "anyOf" }

interface Traversable_oneOfF<T> extends 
  Combinator<T, "oneOf">, 
  Traversable_Meta 
  { type: "oneOf" }


type Traversable_fromJsonSchema<T extends JsonSchema.any> = Traversable_fromJsonSchema.loop<T>
declare namespace Traversable_fromJsonSchema {
  type loop<S> 
    // if `S` is the full union, short circuit
    = [JsonSchema.any] extends [S] ? Traversable
    : S extends JsonSchema.Scalar ? Extract<Traversable_Scalar, { type: S["type"] }>
    : S extends { allOf: infer T } ? S & { type: "allOf"; allOf: readonly loop<T>[] }
    : S extends { anyOf: infer T } ? S & { type: "anyOf"; anyOf: readonly loop<T>[] }
    : S extends { oneOf: infer T } ? { type: "oneOf"; oneOf: readonly T[] }
    : S extends { properties: { [x: string]: infer T } } ? { type: "object"; properties: { [x: string]: loop<T> } }
    : S extends { additionalProperties: infer T } ? { type: "record"; additionalProperties: loop<T> }
    : S extends { items: infer T extends readonly unknown[] } ? { type: "tuple"; items: { [I in keyof T]: loop<T[I]> } }
    : S extends { items: infer T } ? { type: "array"; items: loop<T> }
    : never
}

/** @internal */
type ScalarType = {
  null: null
  boolean: boolean
  integer: number
  number: number
  string: string
}

type Traversable_toType<T> = Traversable_toType.loop<T>
declare namespace Traversable_toType {
  type loop<S> 
    = S extends JsonSchema.Scalar ? ScalarType[S["type"]]
    : S extends { allOf: infer T extends readonly {}[] } ? intersect<T>
    : S extends { anyOf: infer T extends Traversable_any } ? loop<T>
    : S extends { oneOf: infer T extends Traversable_any } ? loop<T>
    : S extends { items: infer T extends readonly Traversable_any[] } ? { -readonly [I in keyof T]: loop<T[I]> }
    : S extends { items: infer T extends Traversable_any } ? readonly loop<T>[]
    : S extends { properties: infer T extends { [x: string]: Traversable_any }, required: readonly (infer Req extends string)[] } 
    ? Merge<
      { -readonly [K in Req & keyof T]: Traversable_toType.loop<T[K]> },
      { -readonly [K in Exclude<keyof T, Req>]+?: Traversable_toType.loop<T[K]> }
    >
    : S extends { additionalProperties: infer T extends Traversable_any } 
    ? globalThis.Record<string, Traversable_toType.loop<T>> 
    : never
}


const is_ = {
  null: JsonSchema.is.null as (u: unknown) => u is Traversable_null,
  boolean: JsonSchema.is.boolean as (u: unknown) => u is Traversable_boolean,
  integer: JsonSchema.is.integer as (u: unknown) => u is Traversable_integer,
  number: JsonSchema.is.number as (u: unknown) => u is Traversable_number,
  string: JsonSchema.is.string as (u: unknown) => u is Traversable_string,
  enum: and(
    has("type", is.literally("enum")),
    JsonSchema.is.enum,
  ) as (u: unknown) => u is Traversable_enum,
  allOf: and(
    has("type", is.literally("allOf")),
    JsonSchema.is.allOf,
  ) as <T>(u: unknown) => u is Traversable_allOfF<T>,
  anyOf: and(
    has("type", is.literally("anyOf")),
    JsonSchema.is.anyOf,
  ) as <T>(u: unknown) => u is Traversable_anyOfF<T>,
  oneOf: and(
    has("type", is.literally("oneOf")),
    JsonSchema.is.oneOf,
  ) as <T>(u: unknown) => u is Traversable_oneOfF<T>,
  object: and(
    has("type", is.literally("object")),
    has("properties", is.any.object),
  ) as <T>(u: unknown) => u is Traversable_objectF<T>,
  array: and(
    has("type", is.literally("array")),
    (u: unknown): u is typeof u => true,
  ) as <T>(u: unknown) => u is Traversable_arrayF<T>,
  record: has("type", is.literally("record")) as <T>(u: unknown) => u is Traversable_recordF<T>,
  tuple: and(
    has("type", is.literally("tuple")),
    has("items", is.any.array),
  ) as <T>(u: unknown) => u is Traversable_tupleF<T>,
  scalar: JsonSchema.is.scalar,
}

const Traversable_is = Object_assign(
  function Traversable_is<T>(u: unknown): u is Traversable_F<T> {
    return anyOf(
      is_.null,
      is_.boolean,
      is_.integer,
      is_.number,
      is_.string,
      is_.allOf,
      is_.anyOf,
      is_.oneOf,
      is_.record,
      is_.tuple,
      is_.array,
      is_.object,
    )(u)
  },
  is_,
)

const Traversable_Functor: Functor<Traversable_lambda, Traversable> = { 
  map(f) {
    return (x) => {
      switch (true) {
        default: return fn.softExhaustiveCheck(x)
        case Traversable_is.enum(x): return x
        case Traversable_is.null(x): return x
        case Traversable_is.boolean(x): return x
        case Traversable_is.integer(x): return x
        case Traversable_is.number(x): return x
        case Traversable_is.string(x): return x
        case Traversable_is.array(x): return { ...x, items: f(x.items) }
        case Traversable_is.allOf(x): return { ...x, allOf: x.allOf.map(f) }
        case Traversable_is.anyOf(x): return { ...x, anyOf: x.anyOf.map(f) }
        case Traversable_is.oneOf(x): return { ...x, oneOf: x.oneOf.map(f) }
        case Traversable_is.tuple(x): return { ...x, items: x.items.map(f) }
        case Traversable_is.record(x): return { ...x, additionalProperties: f(x.additionalProperties) }
        case Traversable_is.object(x): {
          const { additionalProperties: a, properties: p, ...y } = x
          const entries = Object_entries(p).map(([k, v]) => [k, f(v)])
          return {
            ...y,
            properties: Object_fromEntries(entries),
            ...a && { additionalProperties: f(a) },
          }
        }
      }
    }
  }
}

/** @internal */
const fromSchema = (expr: JsonSchema.any) => {
  const meta = {
    ...has("originalIndex", is.number)(expr) && { originalIndex: expr.originalIndex },
    ...has("required", is.array(is.string))(expr) && { required: expr.required },
  }
  switch (true) {
    default: return fn.softExhaustiveCheck(expr)
    case JsonSchema.is.enum(expr): return { ...expr, type: "enum" }
    case JsonSchema.is.scalar(expr): return expr
    case JsonSchema.is.allOf(expr): return { ...expr, type: "allOf", allOf: expr.allOf, }
    case JsonSchema.is.anyOf(expr): return { ...expr, type: "anyOf", anyOf: expr.anyOf }
    case JsonSchema.is.oneOf(expr): return { ...expr, type: "oneOf", oneOf: expr.oneOf }
    case JsonSchema.is.array(expr): return { ...meta, ...expr, type: is.any.array(expr.items) ? "tuple" : "array" }
    case JsonSchema.is.object(expr): return { ...expr, type: expr.properties ? "object" : "record" }
  }
}

function Traversable_unfold<T>(coalgebra: Functor.Coalgebra<Traversable_lambda, T>): (term: T) => Traversable
function Traversable_unfold<T>(coalgebra: Functor.Coalgebra<Traversable_lambda, T>) /// impl.
  { return fn.ana(Traversable_Functor)(coalgebra) }

const Traversable_fromSchema 
  : <T extends JsonSchema.any | Traversable>(term: T) => Traversable
  = Traversable_unfold(fromSchema as never)
