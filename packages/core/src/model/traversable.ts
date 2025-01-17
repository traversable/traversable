import { fn, map, type nonempty } from "@traversable/data"
import { symbol } from "@traversable/registry"
import type {
  Functor,
  HKT,
  IndexedFunctor,
  Kind,
  Merge,
  Mutable
} from "@traversable/registry"

import { t } from "../guard/index.js"
import { is } from "../guard/predicates.js"
import { has } from "../tree.js"
import * as JsonSchema from "./json-schema.js"
import type { Context, Meta } from "./meta.js"
import type {
  AdditionalProps,
  Combinator,
  Enum,
  FiniteItems,
  Items,
  MaybeAdditionalProps,
  Props
} from "./shared.js"

export type {
  Traversable,
  Traversables,
  Traversable_any as any,
  Traversable_lambda as lambda,
  Traversable_Map as Map,
  Context,

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
  IndexedFunctor,
  Traversable_Known as Known,
  Traversable_is as is,
  Traversable_fold as fold,
  Traversable_foldIx as foldIx,
  Traversable_unfold as unfold,
  /// adjunctions
  Traversable_fromAST as fromAST,
  Traversable_fromJsonSchema as fromJsonSchema,
  type Traversable_toType as toType,

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
const Object_keys = globalThis.Object.keys
/** @internal */

type Traversables = [
  Traversable_null,
  Traversable_boolean,
  Traversable_integer,
  Traversable_number,
  Traversable_string,
  Traversable_enum,
  Traversable_allOf,
  Traversable_anyOf,
  Traversable_oneOf,
  Traversable_array,
  Traversable_tuple,
  Traversable_record,
  Traversable_object,
]

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

type Traversable_Map<F> = {
  null: Traversable_null
  boolean: Traversable_boolean
  integer: Traversable_integer
  number: Traversable_number
  string: Traversable_string
  enum: Traversable_enum
  allOf: Traversable_allOfF<F>
  anyOf: Traversable_anyOfF<F>
  oneOf: Traversable_oneOfF<F>
  array: Traversable_arrayF<F>
  tuple: Traversable_tupleF<F>
  record: Traversable_recordF<F>
  object: Traversable_objectF<F>
}

const key = t.anyOf(t.symbol(), t.number(), t.string())

export interface Meta_Base extends t.typeof<typeof Meta_Base> {}
export const Meta_Base = t.object({
  nullable: t.optional(t.boolean()),
  optional: t.optional(t.boolean()),
  path: t.optional(t.array(key)),
})

const Traversable_Meta = t.object({ meta: Meta_Base })
interface Traversable_Meta extends Meta.has<Meta.Base> {}

interface Traversable_lambda extends HKT { [-1]: Traversable_F<this[0]> }
///
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

type Traversable_init =
  | Traversable_Scalar
  | Traversable_enum
  | Traversable_allOfF<Traversable_init>
  | Traversable_anyOfF<Traversable_init>
  | Traversable_oneOfF<Traversable_init>
  | Traversable_arrayF<Traversable_init>
  | Traversable_tupleF<Traversable_init>
  | Traversable_recordF<Traversable_init>
  | Traversable_objectF<Traversable_init>

// Kind<Traversable_lambda, Kind<Traversable_lambda>>


declare namespace Traversable_Combinator {
  type F<T> = Traversable_allOfF<T> | Traversable_anyOfF<T> | Traversable_oneOfF<T>
}
declare namespace Traversable_Composite {
  type F<T> = Traversable_arrayF<T> | Traversable_recordF<T> | Traversable_tupleF<T> | Traversable_objectF<T>
}


type Traversable_fromJsonSchema<T extends JsonSchema.any> = Traversable_fromJsonSchema.loop<T>
declare namespace Traversable_fromJsonSchema {
  type loop<S>
    // Optimization: if `S` is the full union, short circuit
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

const Traversable_Known = [
  "null",
  "boolean",
  "integer",
  "number",
  "string",
  "enum",
  "allOf",
  "anyOf",
  "oneOf",
  "array",
  "tuple",
  "record",
  "object",
] as const satisfies string[]

interface Traversable_null extends JsonSchema.null, Traversable_Meta {}
const Traversable_null = JsonSchema.null
const Traversable_isNull = Traversable_null.is as (u: unknown) => u is Traversable_null

interface Traversable_boolean extends JsonSchema.boolean, Traversable_Meta {}
const Traversable_boolean = JsonSchema.boolean
const Traversable_isBoolean = Traversable_boolean.is as (u: unknown) => u is Traversable_boolean

interface Traversable_integer extends JsonSchema.integer, Meta.has<Meta.integer> {}
const Traversable_integer = JsonSchema.integer
const Traversable_isInteger = Traversable_integer.is as (u: unknown) => u is Traversable_integer

interface Traversable_number extends JsonSchema.number, Meta.has<Meta.number> {}
const Traversable_number = JsonSchema.number
const Traversable_isNumber = Traversable_number.is as (u: unknown) => u is Traversable_number

interface Traversable_string extends JsonSchema.string, Meta.has<Meta.string> {}
const Traversable_string = JsonSchema.string
const Traversable_isString = Traversable_string.is as (u: unknown) => u is Traversable_string

interface Traversable_enum extends Enum<{ type: "enum" }>, Traversable_Meta {}
const Traversable_enum = t.object({ type: t.const("enum"), enum: t.array(t.any()) })
const Traversable_isEnum = Traversable_enum.is as (u: unknown) => u is Traversable_enum

const Traversable_anyOf = t.object({ type: t.const("anyOf"), anyOf: t.array(t.any()) })
const Traversable_isAnyOf = Traversable_anyOf.is as <T>(u: unknown) => u is Traversable_anyOfF<T>

const Traversable_oneOf = t.object({ type: t.const("oneOf"), oneOf: t.array(t.any()) })
const Traversable_isOneOf = Traversable_oneOf.is as <T>(u: unknown) => u is Traversable_oneOfF<T>

const Traversable_allOf = t.object({ type: t.const("allOf"), allOf: t.array(t.any()) })
const Traversable_isAllOf = Traversable_allOf.is as <T>(u: unknown) => u is Traversable_allOfF<T>

const Traversable_array = t.object({ type: t.const("array"), items: t.any() })
const Traversable_isArray = Traversable_array.is as <T>(u: unknown) => u is Traversable_arrayF<T>

const Traversable_object = t.object({ type: t.const("object"), properties: t.record(t.any()) })
const Traversable_isObject = Traversable_object.is as <T>(u: unknown) => u is Traversable_objectF<T>

const Traversable_tuple = t.object({ type: t.const("tuple"), items: t.array(t.any()) })
const Traversable_isTuple = Traversable_tuple.is as <T>(u: unknown) => u is Traversable_tupleF<T>

const Traversable_record = t.object({ type: t.const("record") })
const Traversable_isRecord = Traversable_record.is as <T>(u: unknown) => u is Traversable_recordF<T>

const Traversable_Scalar = JsonSchema.Scalar
const Traversable_isScalar = JsonSchema.is.scalar as (u: unknown) => u is Traversable_Scalar

const Traversable_Combinator = t.anyOf(
  Traversable_allOf,
  Traversable_anyOf,
  Traversable_oneOf,
)
const Traversable_isCombinator = Traversable_Combinator.is as <T>(u: unknown) => u is Traversable_Combinator.F<T>

const Traversable_Composite = t.anyOf(
  Traversable_array,
  Traversable_record,
  Traversable_tuple,
  Traversable_object,
)
const Traversable_isComposite = Traversable_Composite.is as <T>(u: unknown) => u is Traversable_Composite.F<T>

const is_ = {
  null: Traversable_isNull,
  boolean: Traversable_isBoolean,
  integer: Traversable_isInteger,
  number: Traversable_isNumber,
  string: Traversable_isString,
  enum: Traversable_isEnum,
  allOf: Traversable_isAllOf,
  anyOf: Traversable_isAnyOf,
  oneOf: Traversable_isOneOf,
  object: Traversable_isObject,
  array: Traversable_isArray,
  record: Traversable_isRecord,
  tuple: Traversable_isTuple,
  ///
  scalar: Traversable_isScalar,
  combinator: Traversable_isCombinator,
  composite: Traversable_isComposite,
}

type Traversable =
  | Traversable_Scalar
  | Traversable_Combinator
  | Traversable_Special
  | Traversable_Composite

const Traversable_is = Object_assign(
  function Traversable_is<T>(u: unknown): u is Traversable_F<T> {
    return t.anyOf(
      Traversable_null,
      Traversable_boolean,
      Traversable_integer,
      Traversable_number,
      Traversable_string,
      Traversable_enum,
      Traversable_allOf,
      Traversable_anyOf,
      Traversable_oneOf,
      Traversable_array,
      Traversable_record,
      Traversable_tuple,
      Traversable_object,
    ).is(u)
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

const PathPrefixMap = {
  boolean: null,
  integer: null,
  null: null,
  number: null,
  string: null,
  ///
  enum: "enum",
  allOf: "allOf",
  anyOf: "anyOf",
  array: "items",
  object: "properties",
  oneOf: "oneOf",
  record: "additionalProperties",
  tuple: "items",
} as const satisfies Record<Traversable["type"], string | null>

const IxFunctor: IndexedFunctor<Context, Traversable_lambda, Traversable_any> = {
  map: Traversable_Functor.map,
  mapWithIndex(g) {
    return ($, xs) => {
      const h = (next?: keyof any) => (path: (keyof any)[], overrides?: {}) => ({
        ...$,
        depth: $.depth + 1,
        indent: $.indent + 2,
        // `next` is already applied to the path, bc sometimes `next`
        // isn't actually last (as is the case with `symbol.optional`)
        path,
        absolutePath: [...$.absolutePath, PathPrefixMap[xs.type], String(next)].filter((_) => _ !== null),
        ...overrides,
      } satisfies Context)

      switch (true) {
        default: return fn.softExhaustiveCheck(xs)
        case Traversable_is.enum(xs): return xs
        case Traversable_is.null(xs): return xs
        case Traversable_is.boolean(xs): return xs
        case Traversable_is.integer(xs): return xs
        case Traversable_is.number(xs): return xs
        case Traversable_is.string(xs): return xs
        case Traversable_is.array(xs): return { ...xs, items: g(h()([...$.path, symbol.array]), xs.items) }
        case Traversable_is.allOf(xs): return { ...xs, allOf: xs.allOf.map((x, i) => g(h(i)([...$.path, symbol.allOf, i]), x)) }
        case Traversable_is.anyOf(xs): return { ...xs, anyOf: xs.anyOf.map((x, i) => g(h(i)([...$.path, symbol.anyOf, i]), x)) }
        case Traversable_is.oneOf(xs): return { ...xs, oneOf: xs.oneOf.map((x, i) => g(h(i)([...$.path, symbol.oneOf, i]), x)) }
        case Traversable_is.tuple(xs): return { ...xs, items: xs.items.map((x, i) => g(h(i)([...$.path, symbol.tuple, i]), x)) }
        case Traversable_is.record(xs): return { ...xs, additionalProperties: g(h()([...$.path, symbol.record]), xs.additionalProperties) }
        case Traversable_is.object(xs): {
          const { additionalProperties: a, properties: p, ...y } = xs
          const entries = Object_entries(p).map(([k, v]) => {
            const isOptional = !xs.required?.includes(k)
            const path = [ ...$.path, symbol.object, k, ...(isOptional ? [symbol.optional] : [])]
            return [k, g(h(k)(path), v)] satisfies [any, any]
          })

          return {
            ...y,
            properties: Object_fromEntries(entries),
            // TODO: move to `symbol.record` instead?
            // ...a && { additionalProperties: f({ ...$, depth, path: [symbol.record, ...$.path] }, a) }
          }
        }
      }
    }
  }
}

function Traversable_unfold<T>(g: Functor.Coalgebra<Traversable_lambda, T>): (expr: T) => Traversable
function Traversable_unfold<T>(g: Functor.Coalgebra<Traversable_lambda, T>)
  { return fn.ana(Traversable_Functor)(g) }

function Traversable_fold<T>(g: Functor.Algebra<Traversable_lambda, T>): <S>(term: S) => T
function Traversable_fold<T>(g: Functor.Algebra<Traversable_lambda, T>)
  { return fn.cata(Traversable_Functor)(g) }

function Traversable_foldIx<Ix, T>(algebra: Functor.IxAlgebra<Ix, Traversable_lambda, T>): <S>(ix: Ix, term: S) => T
function Traversable_foldIx<T>(algebra: Functor.IxAlgebra<Context, Traversable_lambda, T>)
  { return fn.cataIx<Context, Traversable_lambda, Traversable_any>(IxFunctor)(algebra) }

/** @internal */
const fromJsonSchema = (expr: JsonSchema.any) => {
  const meta = {
    ...has("originalIndex", t.number().is)(expr) && { originalIndex: expr.originalIndex },
    ...has("required", t.array(t.string()).is)(expr) && { required: expr.required },
  }
  switch (true) {
    default: return fn.softExhaustiveCheck(expr)
    case JsonSchema.is.null(expr): return { meta, ...expr, type: expr.type }
    case JsonSchema.is.enum(expr): return { meta, ...expr, type: "enum" }
    case JsonSchema.is.boolean(expr): return { meta, ...expr, type: expr.type }
    case JsonSchema.is.integer(expr): return { meta, ...expr, type: expr.type }
    case JsonSchema.is.number(expr): return { meta, ...expr, type: expr.type }
    case JsonSchema.is.string(expr): return { meta, ...expr, type: expr.type }
    case JsonSchema.is.allOf(expr): return { meta, ...expr, type: "allOf", allOf: expr.allOf, }
    case JsonSchema.is.anyOf(expr): return { meta, ...expr, type: "anyOf", anyOf: expr.anyOf }
    case JsonSchema.is.oneOf(expr): return { meta, ...expr, type: "oneOf", oneOf: expr.oneOf }
    case JsonSchema.is.array(expr): return { meta, ...expr, type: is.array(expr.items) ? "tuple" : "array" }
    case JsonSchema.is.object(expr): return { meta, ...expr, type: expr.properties ? "object" : "record" }
  }
}

const fromAST
  : Functor.Algebra<t.AST.lambda, Traversable>
  = (x) => {
    switch (true) {
      default: return fn.exhaustive(x)
      case x._tag === "any": return fn.throw("Unimplemented")
      case x._tag === "symbol": return fn.throw("Unimplemented")
      case x._tag === "null": return { ...x, ...Traversable_null, type: x._tag }
      case x._tag === "boolean": return { ...x, ...Traversable_boolean, type: x._tag }
      case x._tag === "integer": return { ...x, ...Traversable_integer, type: x._tag }
      case x._tag === "number": return { ...x, ...Traversable_number, type: x._tag }
      case x._tag === "string": return { ...x, ...Traversable_string, type: x._tag }
      case x._tag === "const": return { ...x, type: "enum", enum: x._def }  // <- TODO: make sure this isn't lossy
      case x._tag === "optional": return { ...x._def, meta: { ...x._def.meta, optional: true } }
      case x._tag === "allOf": return { ...x, type: x._tag, allOf: x._def }
      case x._tag === "anyOf": return { ...x, type: x._tag, anyOf: x._def }
      case x._tag === "array": return { type: x._tag, items: x._def }
      case x._tag === "record": return { type: x._tag, additionalProperties: x._def }
      case x._tag === "tuple": return { type: x._tag, items: x._def }
      case x._tag === "object": return {
        type: x._tag,
        properties: x._def,
        required: Object.keys(x._def).filter((k) => !x._def[k].meta?.optional),
      } satisfies Traversable_object
    }
  }

const Traversable_fromJsonSchema
  : <T extends JsonSchema.any | Traversable>(term: T) => Traversable
  = Traversable_unfold(fromJsonSchema as never)

const Traversable_fromAST
  : <S extends t.AST.Node>(term: S) => Traversable
  = t.AST.fold(fromAST)
