import { and, allOf, anyOf } from "../guard.js"
import * as is from "../is.js"
import { has, mightHave } from "../tree.js"

import { fn, keys, type nonempty } from "@traversable/data"
import type { Functor, HKT, Merge, Mutable, newtype, Partial } from "@traversable/registry"
import * as JsonSchema from "./json-schema.js"
import type { AdditionalProps, Combinator, Enum, FieldOptionality, FiniteItems, Items, MaybeAdditionalProps, Props } from "./shared.js"

export type {
  Traversable,
  Traversable_any as any,
  Traversable_F as F,
  Traversable_lambda as lambda,
  Traversable_Meta as Meta,
  Traversable_toType as toType,
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
}

export {
  Traversable_Functor as Functor,
  Traversable_fromJsonSchema as fromJsonSchema,
  Traversable_has as has,
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
const Object_keys = globalThis.Object.keys
/** @internal */
const Array_isArray 
  : <T>(u: T | readonly T[]) => u is readonly T[]
  = globalThis.Array.isArray

type Traversable =
  | Traversable_Scalar
  | Traversable_Combinator
  | Traversable_Special
  | Traversable_Composite
  ;
type Traversable_any =
  | JsonSchema.any
  | Traversable_noMeta
  ;

type Traversable_noMeta =
  | Traversable_object.F<Traversable_noMeta, never>
  | Traversable_array.F<Traversable_noMeta, never>
  | Traversable_tuple.F<Traversable_noMeta, never>
  | Traversable_record.F<Traversable_noMeta, never>
  | Traversable_Scalar<never>
  | Traversable_Special<never>
  | Traversable_Combinator<never>
  | Traversable_Composite<never>

declare const nometa: Traversable_noMeta

// 
type Traversable_Scalar<M = Default> =
  | Traversable_null<M>
  | Traversable_boolean<M>
  | Traversable_integer<M>
  | Traversable_number<M>
  | Traversable_string<M>
  ;
type Traversable_Special<M = Default> =
  | Traversable_enum<M>
  ;
type Traversable_Combinator<M = Default> =
  | Traversable_allOf<M>
  | Traversable_anyOf<M>
  | Traversable_oneOf<M>
  ;
type Traversable_Composite<M = Default> =
  | Traversable_array<M>
  | Traversable_tuple<M>
  | Traversable_record<M>
  | Traversable_object<M & Traversable_Meta_object>
  ;
type Traversable_F<T, M = Default> =
  | Traversable_Scalar<M>
  | Traversable_Special<M>
  | Traversable_allOf.F<T, M>
  | Traversable_anyOf.F<T, M>
  | Traversable_oneOf.F<T, M>
  | Traversable_array.F<T, M>
  | Traversable_tuple.F<T, M>
  | Traversable_record.F<T, M>
  | Traversable_object.F<T, M & Traversable_Meta_object>
  ;

const Traversable_isMeta
  : (u: unknown) => u is Traversable_Meta
  = allOf(
    has("nullable", is.boolean),
    mightHave("originalIndex", is.number),
    has("optional", is.boolean),
    has("path", is.array(is.key)),
  ) satisfies (u: unknown) => u is Traversable_Meta

type Traversable_Meta = typeof Traversable_Meta
type Traversable_Meta_object = Traversable_Meta & { required?: readonly string[] }
declare namespace Traversable_Meta {
  export { Traversable_Meta_object as object }
}

declare const Traversable_Meta: {
  /**
   * ### {@link Traversable_Meta.originalIndex `Traversable_Meta.originalIndex`}
   *
   * If a document sort like {@link TODO: add JSDoc link to `sort`} has been
   * applied AND the containing node is "ordered" (as is the case for tuple nodes,
   * for example), then the child node will contain an `originalIndex` property
   * indicating the order that it originally appeared in its container.
   */
  originalIndex?: number

  path: keys.any
  /**
   * ### {@link Traversable_Meta.nullable `Traversable_Meta.nullable`}
   * 
   * Any JSON Schema node can be explicitly marked as nullable.
   *
   * If an OpenAPI node is "nullable", it is almost always implicitly so.
   * For example the node might be a member of an `anyOf` or `oneOf` subtree,
   * and one of its siblings is {@link Traversable_null `null`}.
   *
   * To simplify the interop story and standardize both definitions of nullability,
   * all `Traversable` nodes include a `nullable` property whose value is a
   * boolean that explicitly indicates whether `null` is a valid value for that
   * field.
   *
   * **Note:** this information may be inferrable from other contextual data --
   * all this field does is make that fact explicit, and available on the metadata
   * of the node itself.
   *
   * **Note:** in this context, "nullable" has the semantics of "OR null" --
   * optionality and nullability in this context are distinct concepts, as is
   * "OR undefined" (which depending on your view, might be synonymous with
   * the term "optional").
   */
  nullable: boolean
  /**
   * ### {@link Traversable_Meta.optional `Traversable_Meta.optional`}
   * 
   * Both JSON Schema and OpenAPI objects have an optional field called 
   * "required", which is an array of property names that will always
   * be present in the object.
   * 
   * Similar to the {@link Traversable_Meta.nullable `nullable`} property,
   * all {@link Traversable `Traversable`} nodes have a metadata property
   * called {@link Traversable_Meta.optional `optional`}, indicating whether
   * the node may or may not exist.
   * 
   * **Note:** This property exists on all nodes, whether or not their
   * containing node is an object. If the node's parent is not an object,
   * this proprety will be ignored.
   */
  optional: boolean
}

interface HasMeta<T extends {}> extends newtype<T> {}

type Traversable_hasMeta<T> = HasMeta<[T] extends [never] ? {} : { meta: T }>

type Default = Traversable_Meta

function Traversable_has() {}
Traversable_has.meta = has("meta", Traversable_isMeta) as <M>(u: unknown) => u is Traversable_hasMeta<M>

interface Traversable_lambda extends HKT { [-1]: Traversable_F<this[0]> }

interface Traversable_null<M = Default> extends Traversable_hasMeta<M>, JsonSchema.null {}
interface Traversable_boolean<M = Default> extends Traversable_hasMeta<M>, JsonSchema.boolean {}
interface Traversable_integer<M = Default> extends Traversable_hasMeta<M>, JsonSchema.integer {}
interface Traversable_number<M = Default> extends Traversable_hasMeta<M>, JsonSchema.number {}
interface Traversable_string<M = Default> extends Traversable_hasMeta<M>, JsonSchema.string {}
interface Traversable_enum<M = Default> extends Traversable_hasMeta<M>, Enum<{ type: "enum" }> {}

interface Traversable_allOf<M = Default> extends
  Traversable_hasMeta<M>,
  Combinator<Traversable, "allOf">
  { type: "allOf" }
declare namespace Traversable_allOf {
  interface F<T, M = Default> extends
    Traversable_hasMeta<M>,
    Combinator<T, "allOf">
    { type: "allOf" }
}

interface Traversable_anyOf<M = Default> extends
  Traversable_hasMeta<M>,
  Combinator<Traversable, "anyOf">
  { type: "anyOf" }
declare namespace Traversable_anyOf {
  interface F<T, M = Default> extends
    Traversable_hasMeta<M>,
    Combinator<T, "anyOf">
    { type: "anyOf" }
}

interface Traversable_oneOf<M = Default> extends
  Traversable_hasMeta<M>,
  Combinator<Traversable, "oneOf">
  { type: "oneOf" }

declare namespace Traversable_oneOf {
  interface F<T, M = Default> extends
    Traversable_hasMeta<M>,
    Combinator<T, "oneOf">
    { type: "oneOf" }
}

interface Traversable_tuple<M = Default> extends
  Traversable_hasMeta<M>,
  FiniteItems<Traversable>
  { type: "tuple" }

declare namespace Traversable_tuple {
  interface F<T, M = Default> extends
    Traversable_hasMeta<M>,
    FiniteItems<T>
    { type: "tuple" }
}

interface Traversable_record<M = Default> extends
  Traversable_hasMeta<M>,
  AdditionalProps<Traversable>
  { type: "record" }
declare namespace Traversable_record {
  interface F<T, M = Default> extends
    Traversable_hasMeta<M>,
    AdditionalProps<T>
    { type: "record" }
}

interface Traversable_array<M = Default> extends
  Traversable_hasMeta<M>,
  Items<Traversable>
  { type: "array" }
declare namespace Traversable_array {
  interface F<T, M = Default> extends
    Traversable_hasMeta<M>,
    Items<T>
    { type: "array" }
}

interface Traversable_object<
  M extends 
  | Traversable_Meta_object 
  = Traversable_Meta_object
> extends 
  Traversable_hasMeta<M>,
  Props<Traversable>,
  MaybeAdditionalProps<Traversable>
  { type: "object" }

declare namespace Traversable_object {
  interface F<
    T, 
    M extends 
    | Traversable_Meta_object 
    = Traversable_Meta_object
  > extends
    Traversable_hasMeta<M>,
    Props<T>,
    MaybeAdditionalProps<T>
    { type: "object" }
}

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
  null: allOf(
    // Traversable_has.meta,
    JsonSchema.is.null,
  ) as (u: unknown) => u is Traversable_null,
  boolean: allOf(
    // Traversable_has.meta,
    JsonSchema.is.boolean,
  ) as (u: unknown) => u is Traversable_boolean,
  integer: allOf(
    // Traversable_has.meta,
    JsonSchema.is.integer as (u: unknown) => u is Traversable_integer,
  ),
  number: allOf(
    // Traversable_has.meta,
    JsonSchema.is.number,
  ) as (u: unknown) => u is Traversable_number,
  string: allOf(
    // Traversable_has.meta,
    JsonSchema.is.string,
  ) as (u: unknown) => u is Traversable_string,
  enum: allOf(
    // Traversable_has.meta,
    has("type", is.literally("enum")),
    JsonSchema.is.enum,
  ) as (u: unknown) => u is Traversable_enum,
  allOf: allOf(
    // Traversable_has.meta,
    has("type", is.literally("allOf")),
    JsonSchema.is.allOf,
  ) as <T>(u: unknown) => u is Traversable_allOf.F<T>,
  anyOf: allOf(
    // Traversable_has.meta,
    has("type", is.literally("anyOf")),
    JsonSchema.is.anyOf,
  ) as <T>(u: unknown) => u is Traversable_anyOf.F<T>,
  oneOf: allOf(
    // Traversable_has.meta,
    has("type", is.literally("oneOf")),
    JsonSchema.is.oneOf,
  ) as <T>(u: unknown) => u is Traversable_oneOf.F<T>,
  object: allOf(
    // Traversable_has.meta,
    has("type", is.literally("object")),
    has("properties", is.any.object),
  ) as <T>(u: unknown) => u is Traversable_object.F<T>,
  array: allOf(
    // Traversable_has.meta,
    has("type", is.literally("array")),
  ) as <T>(u: unknown) => u is Traversable_array.F<T>,
  record: has("type", is.literally("record")) as <T>(u: unknown) => u is Traversable_record.F<T>,
  tuple: allOf(
    // Traversable_has.meta,
    has("type", is.literally("tuple")),
    has("items", is.any.array),
  ) as never as <T>(u: unknown) => u is Traversable_tuple.F<T>,
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
const fromJsonSchema = (cfg: Traversable_fromJsonSchema.Config) => (n: JsonSchema.any) => {
  const meta = createMeta(n, cfg)
  switch (true) {
    default: return fn.softExhaustiveCheck(n)
    case JsonSchema.is.enum(n): return { type: "enum", meta, enum: n.enum }
    case JsonSchema.is.scalar(n): return { type: n.type, meta, }
    case JsonSchema.is.allOf(n): return { type: "allOf", meta, allOf: n.allOf }
    case JsonSchema.is.anyOf(n): return { type: "anyOf", meta, anyOf: n.anyOf }
    case JsonSchema.is.oneOf(n): return { type: "oneOf", meta, oneOf: n.oneOf }
    case JsonSchema.is.array(n): return { type: Array_isArray(n.items) ? "tuple" : "array", meta, items: n.items }
    case JsonSchema.is.object(n): return { 
      type: n.properties ? "object" : "record", 
      meta,
      ...n.properties && { properties: n.properties },
      ...n.additionalProperties && { additionalProperties: n.additionalProperties },
    }
  }
}

function Traversable_unfold<T>(coalgebra: Functor.Coalgebra<Traversable_lambda, T>): (term: T) => Traversable
function Traversable_unfold<T>(coalgebra: Functor.Coalgebra<Traversable_lambda, T>) /// impl.
  { return fn.ana(Traversable_Functor)(coalgebra) }

const Traversable_fromSchema 
  : <T extends JsonSchema.any | Traversable>(term: T) => Traversable
  = Traversable_unfold(fromSchema as never)
