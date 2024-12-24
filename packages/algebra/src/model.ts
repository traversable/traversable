import { core, tree } from "@traversable/core"
import { anyOf } from "@traversable/core/is"
import { type array as Array, fn, type nonempty, object } from "@traversable/data"
import { type Functor, type HKT, type Merge, type Mutable, symbol } from "@traversable/registry"

/** @internal */
type intersect<S extends readonly {}[], Out = {}> = S extends nonempty.arrayOf<{}, infer H, infer T>
  ? intersect<T, Out & Mutable<H>>
  : Out
/** @internal */
const Array_isArray = globalThis.Array.isArray
/** @internal */
const Object_values = globalThis.Object.values
/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const Math_max = globalThis.Math.max
/** @internal */
const Object_assign = globalThis.Object.assign
/** @internal */
const isObject: (u: unknown) => u is { [x: string]: unknown } = (u): u is never =>
  u !== null && typeof u === "object" && !Array_isArray(u)


const areTheSameType
  : (l: Ext, r: Ext) => boolean 
  = (l, r) => "type" in l && "type" in r
     ? l.type === r.type
     : ("oneOf" in l && "oneOf" in r) 
    || ("allOf" in l && "allOf" in r) 
    || ("anyOf" in l && "anyOf" in r)

const bind: <T extends {}>(snd: T) => <U extends {}>(fst: U) => T & U = (snd) => (fst) =>
  Object_assign(fst, snd)

const Ltd_NullaryTags = ["null", "boolean", "integer", "number", "string"] as const satisfies string[]

const Ltd_UnaryTags = ["allOf", "anyOf", "oneOf", "array", "object"] as const satisfies string[]

const Ltd_Tags = [...Ltd_NullaryTags, ...Ltd_UnaryTags] as const satisfies string[]

const Ext_NullaryTags = Ltd_NullaryTags
const Ext_UnaryTags = [...Ltd_UnaryTags, "tuple", "record"] as const satisfies string[]
const Ext_Tags = [...Ext_NullaryTags, ...Ext_UnaryTags] as const satisfies string[]

type Ext_NullaryTag = keyof typeof Ext_NullaryTag
const Ext_NullaryTag = object.fromKeys(Ext_NullaryTags)

const Ext_ScalarTypeMap = {
  boolean: false as boolean,
  integer: 0 as number,
  number: 0 as number,
  null: null,
  string: "" as string,
} as const satisfies Record<Ext_NullaryTag, string | number | null | boolean>

const Ltd_Tag = object.fromKeys(Ltd_Tags)
type Ltd_Tag = (typeof Ltd_Tag)[keyof typeof Ltd_Tag]

const Ext_Tag = { ...Ltd_Tag, ...object.fromKeys(Ext_Tags) }
type Ext_Tag = (typeof Ext_Tag)[keyof typeof Ext_Tag]

const is_null = (u: unknown): u is Ltd.null => isObject(u) && "type" in u && u.type === "null"
const is_enum = (u: unknown): u is Ltd.enum => isObject(u) && "enum" in u

export type Ltd =
  | Ltd.null
  | Ltd.boolean
  | Ltd.integer
  | Ltd.number
  | Ltd.string
  | Ltd.enum
  | Ltd.allOf
  | Ltd.anyOf
  | Ltd.oneOf
  | Ltd.array
  | Ltd.object

export declare namespace Ltd {
  export {
    Ltd_null as null,
    Ltd_boolean as boolean,
    Ltd_enum as enum,
    Ltd_integer as integer,
    Ltd_number as number,
    Ltd_string as string,
    Ltd_object as object,
  }
}
export declare namespace Ltd {
  interface Meta { originalIndex?: number }
  interface Ltd_null { type: "null" }
  interface Ltd_boolean { type: "boolean" }
  interface Ltd_number { type: "number" }
  interface Ltd_string { type: "string" }
  interface Ltd_integer {
    type: "integer"
  }
  interface Ltd_enum { enum: readonly unknown[] }
  interface allOf {
    allOf: readonly Ltd[]
  }
  namespace allOf {
    interface F<T> {
      allOf: readonly T[]
    }
    interface lambda extends HKT {
      [-1]: Ltd.allOf.F<this[0]>
    }
  }
  interface anyOf {
    anyOf: readonly Ltd[]
  }
  namespace anyOf {
    interface F<T> {
      anyOf: readonly T[]
    }
    interface lambda extends HKT {
      [-1]: Ltd.anyOf.F<this[0]>
    }
  }
  interface oneOf {
    oneOf: readonly Ltd[]
  }
  namespace oneOf {
    interface F<T> {
      oneOf: readonly T[]
    }
    interface lambda extends HKT {
      [-1]: Ltd.oneOf.F<this[0]>
    }
  }
  interface array {
    type: "array"
    items: Ltd
  }
  namespace array {
    interface F<T> {
      type: "array"
      items: T
    }
    interface lambda extends HKT {
      [-1]: Ltd.array.F<this[0]>
    }
    interface Meta extends Ltd.Meta {}
  }
  interface Ltd_object extends Ltd.object.Meta {
    type: "object"
    properties: { [x: string]: Ltd }
  }
  namespace Ltd_object {
    interface F<T> extends Ltd.object.Meta {
      type: "object"
      properties: { [x: string]: T }
    }
    interface lambda extends HKT {
      [-1]: Ltd.object.F<this[0]>
    }
    interface Meta extends Ltd.Meta {
      required: readonly string[]
    }
  }

  type Scalar = Ltd.null | Ltd.boolean | Ltd.integer | Ltd.number | Ltd.string
  interface lambda extends HKT {
    [-1]: Ltd.F<this[0]>
  }
  type F<T> =
    | Ltd.null
    | Ltd.boolean
    | Ltd.integer
    | Ltd.number
    | Ltd.string
    | Ltd.allOf.F<T>
    | Ltd.anyOf.F<T>
    | Ltd.oneOf.F<T>
    | Ltd.array.F<T>
    | Ltd.object.F<T>
}

export namespace Ltd {
  export const functor: Functor<Ltd.lambda, Ltd> = {
    map: function map(f) {
      return (x) => {
        switch (true) {
          case Ltd.is.null(x):
            return x
          case Ltd.is.boolean(x):
            return x
          case Ltd.is.integer(x):
            return x
          case Ltd.is.number(x):
            return x
          case Ltd.is.string(x):
            return x
          case Ltd.is.array(x):
            return { ...x, items: f(x.items) }
          case Ltd.is.allOf(x):
            return { ...x, allOf: x.allOf.map(f) }
          case Ltd.is.anyOf(x):
            return { ...x, anyOf: x.anyOf.map(f) }
          case Ltd.is.oneOf(x):
            return { ...x, oneOf: x.oneOf.map(f) }
          case Ltd.is.object(x):
            return {
              ...x,
              properties: Object_fromEntries(Object_entries(x.properties).map(([k, v]) => [k, f(v)])),
            }
          default:
            return x // fn.exhaustive(x)
        }
      }
    },
  }

  // export function fold<T>(algebra: Functor.Algebra<lambda, T>): (term: Ltd) => T
  export function fold<T>(algebra: Functor.Algebra<Ltd.lambda, T>) {
    return fn.cata(functor)(algebra)
  }

  export namespace Children {
    export const allOf: <const T extends { allOf: readonly unknown[] }>(n: T) => T["allOf"] = (n) => n.allOf
    export const anyOf: <const T extends { anyOf: readonly unknown[] }>(n: T) => T["anyOf"] = (n) => n.anyOf
    export const oneOf: <const T extends { oneOf: readonly unknown[] }>(n: T) => T["oneOf"] = (n) => n.oneOf
    export const object: <const T extends { properties: unknown }>(n: T) => T["properties"] = (n) =>
      n.properties
    export const array: <const T extends { items: unknown }>(n: T) => T["items"] = (n) => n.items
  }

  export function is<T>(u: unknown): u is Ltd.F<T> {
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
  is.null = is_null
  is.enum = is_enum


  export namespace is {
    export const boolean = (u: unknown): u is Ltd.boolean => isObject(u) && u.type === "boolean"
    export const integer = (u: unknown): u is Ltd.integer => isObject(u) && u.type === "integer"
    export const number = (u: unknown): u is Ltd.number => isObject(u) && u.type === "number"
    export const string = (u: unknown): u is Ltd.string => isObject(u) && u.type === "string"
    export const allOf = <T>(u: unknown): u is Ltd.allOf.F<T> => isObject(u) && Array_isArray(u.allOf)
    export const anyOf = <T>(u: unknown): u is Ltd.anyOf.F<T> => isObject(u) && Array_isArray(u.anyOf)
    export const oneOf = <T>(u: unknown): u is Ltd.oneOf.F<T> => isObject(u) && Array_isArray(u.oneOf)
    export const object = <T>(u: unknown): u is Ltd.object.F<T> =>
      isObject(u) && u.type === "object" && !!u.properties
    export const array = <T>(u: unknown): u is Ltd.array.F<T> => isObject(u) && u.type === "array"
    export const scalar = (u: unknown): u is Ltd.Scalar =>
      (  Ltd.is.null(u) 
      || Ltd.is.boolean(u) 
      || Ltd.is.integer(u) 
      || Ltd.is.number(u) 
      || Ltd.is.string(u))
    export const combinator = (u: unknown): u is Ltd.allOf | Ltd.anyOf | Ltd.oneOf => 
      (  is.allOf(u) 
      || is.anyOf(u) 
      || is.oneOf(u))
    export const composite = (u: unknown): u is Ltd.array | Ltd.object => 
      (  is.array(u) 
      || is.object(u))
  }

  export namespace make {
    export const boolean: (meta?: Ltd.Meta) => Ltd.boolean = (meta = {}) => ({ type: "boolean", ...meta })
    export const integer: (meta?: Ltd.Meta) => Ltd.integer = (meta = {}) => ({ type: "integer", ...meta })
    export const number: (meta?: Ltd.Meta) => Ltd.number = (meta = {}) => ({ type: "number", ...meta })
    export const string: (meta?: Ltd.Meta) => Ltd.string = (meta = {}) => ({ type: "string", ...meta })
    export const allOf: <T>(allOf: readonly T[]) => Ltd.allOf.F<T> = (allOf) => ({ allOf })
    export const anyOf: <T>(anyOf: readonly T[]) => Ltd.anyOf.F<T> = (anyOf) => ({ anyOf })
    export const oneOf: <T>(oneOf: readonly T[]) => Ltd.oneOf.F<T> = (oneOf) => ({ oneOf })
    export const array
      : <T>(items: T, meta?: Ltd.Meta) => Ltd.array.F<T> 
      = (_, meta = {}) => ({ type: "array", items: _, ...meta })
    export const object
      : <T>( properties: { [x: string]: T }, meta?: Ltd.Meta & { required?: readonly string[] }) => Ltd.object.F<T> 
      = (_, { required = [], ...meta } = { required: [] }) => ({ type: "object", properties: _, required, ...meta })
  }

  const make_null
    : () => Ltd.null 
    = () => ({ type: "null" })
  const make_enum
    : <const T extends readonly unknown[]>(enum_: T) => Ltd.enum 
    = (enum_) => ({ enum: enum_ })

  void (Ltd.make.null = make_null)
  void (Ltd.make.enum = make_enum)
  export declare namespace make { export { make_null as null, make_enum as enum } }

  export namespace Algebra {
    export const count: Functor.Algebra<Ltd.lambda, number> = (n) => {
      switch (true) {
        default: return fn.exhaustive(n)
        case Ltd.is.enum(n):
        case Ltd.is.scalar(n): return 1
        case Ltd.is.array(n): return 1 + n.items
        case Ltd.is.allOf(n): return 1 + n.allOf.reduce((out, x) => out + x, 0)
        case Ltd.is.anyOf(n): return 1 + n.anyOf.reduce((out, x) => out + x, 0)
        case Ltd.is.oneOf(n): return 1 + n.oneOf.reduce((out, x) => out + x, 0)
        case Ltd.is.object(n): return 1 + Object_values(n.properties).reduce((out, x) => out + x, 0)
      }
    }
    export const depth: Functor.Algebra<Ltd.lambda, number> = (n) => {
      switch (true) {
        default: return fn.exhaustive(n)
        case Ltd.is.enum(n):
        case Ltd.is.scalar(n): return 1
        case Ltd.is.array(n): return 1 + n.items
        case Ltd.is.allOf(n): return 1 + Math_max(...n.allOf)
        case Ltd.is.anyOf(n): return 1 + Math_max(...n.anyOf)
        case Ltd.is.oneOf(n): return 1 + Math_max(...n.oneOf)
        case Ltd.is.object(n): return 1 + Math_max(...Object_values(n.properties))
      }
    }

    export const paths: Functor.Algebra<Ltd.lambda, readonly (readonly (keyof any)[])[]> = (n) => {
      switch (true) {
        case Ltd.is.enum(n): return []
        case Ltd.is.scalar(n): return [[n.type]]
        case Ltd.is.array(n): return n.items.map((xs) => [symbol.array as keyof any].concat(xs))
        case Ltd.is.allOf(n): return n.allOf.map((xss) => xss.flatMap((xs, ix) => [symbol.intersection, ix as keyof any].concat(xs)))
        case Ltd.is.anyOf(n): return n.anyOf.map((xss) => xss.flatMap((xs, ix) => [symbol.union, ix as keyof any].concat(xs))) 
        case Ltd.is.oneOf(n): return n.oneOf.map((xss) => xss.flatMap((xs, ix) => [symbol.disjoint, ix as keyof any].concat(xs)))
        case Ltd.is.object(n): return Object_entries(n.properties).flatMap(([k, xss]) => xss.map((xs) => [k as keyof any].concat(xs)))
        default: return fn.exhaustive(n)
      }
    }
  }
  export const count = Ltd.fold(Ltd.Algebra.count)
  export const depth = Ltd.fold(Ltd.Algebra.depth)
  export const paths = Ltd.fold(Ltd.Algebra.paths)
}

export type Ext =
  | Ext.null
  | Ext.enum
  | Ext.boolean
  | Ext.integer
  | Ext.number
  | Ext.string
  | Ext.allOf
  | Ext.anyOf
  | Ext.oneOf
  | Ext.array
  | Ext.object
  | Ext.tuple
  | Ext.record
export declare namespace Ext {
  export {
    Ext_null as null,
    Ext_enum as enum,
    Ext_boolean as boolean,
    Ext_integer as integer,
    Ext_number as number,
    Ext_string as string,
    Ext_object as object,
    Ext_Tag as Tag,
    Ext_any as any,
  }
}
export declare namespace Ext {
  type Ext_any<T extends Ext | Ext.Weak | Ltd = Ext | Ext.Weak | Ltd> = T
  type Scalar = Ext.null | Ext.boolean | Ext.integer | Ext.number | Ext.string
  interface Meta extends Ltd.Meta {}
  interface Ext_null extends Ltd.null { _type: null }
  interface Ext_enum extends Ltd.enum { _type: this["enum"][number] ; tag: "enum" }
  interface Ext_boolean extends Ltd.boolean { _type: boolean }
  interface Ext_integer extends Ltd.integer { _type: number }
  interface Ext_number extends Ltd.number { _type: number }
  interface Ext_string extends Ltd.string { _type: string }
  interface allOf { type: "allOf", allOf: readonly Ext[] }
  namespace allOf {
    export { F as of }
    export interface F<T> { allOf: readonly T[] }
    export interface lambda extends HKT { [-1]: Ext.allOf.F<this[0]> }
  }
  interface anyOf { type: "anyOf", anyOf: readonly Ext[] }
  namespace anyOf {
    export { F as of }
    export interface F<T> { type: "anyOf", anyOf: readonly T[] }
    export interface lambda extends HKT { [-1]: Ext.anyOf.F<this[0]> }
  }
  interface oneOf { type: "oneOf", oneOf: readonly Ext[] }
  namespace oneOf {
    export { F as of }
    export interface F<T> { type: "oneOf", oneOf: readonly T[] }
    export interface lambda extends HKT { [-1]: Ext.oneOf.F<this[0]> }
  }
  interface array extends Ext.Meta {
    type: typeof Ext.Tag.array
    items: Ext
  }
  namespace array {
    export { F as of }
    export interface F<T> extends Ext.Meta {
      type: typeof Ext.Tag.array
      items: T
    }
    export interface lambda extends HKT {
      [-1]: Ext.array.F<this[0]>
    }
    export interface Meta extends Ext.Meta {}
  }
  interface Ext_object extends Ext.object.Meta {
    type: typeof Ext.Tag.object
    properties: { [x: string]: Ext }
  }
  namespace Ext_object {
    export { F as of }
    export interface F<T> extends Ext.object.Meta {
      type: typeof Ext.Tag.object
      properties: { [x: string]: T }
    }
    export interface lambda extends HKT {
      [-1]: Ext.object.F<this[0]>
    }
    export interface Meta extends Ext.Meta {
      required: readonly string[]
    }
  }
  interface tuple extends Ext.Meta {
    type: typeof Ext.Tag.tuple
    items: readonly Ext[]
  }
  namespace tuple {
    export { F as of }
    export interface F<T> extends Ext.Meta {
      type: typeof Ext.Tag.tuple
      items: readonly T[]
    }
    export interface lambda extends HKT {
      [-1]: Ext.tuple.F<this[0]>
    }
    export interface Meta extends Ext.Meta {}
  }
  interface record extends Ext.Meta {
    type: typeof Ext.Tag.record
    additionalProperties: Ext
  }
  namespace record {
    export { F as of }
    export interface F<T> extends Ext.Meta {
      type: typeof Ext.Tag.record
      additionalProperties: T
    }
    export interface lambda extends HKT {
      [-1]: Ext.record.F<this[0]>
    }
    export interface Meta extends Ext.Meta {}
  }

  ///
  interface lambda extends HKT {
    [-1]: Ext.F<this[0]>
  }
  type F<T> =
    | Ext.null
    | Ext.boolean
    | Ext.integer
    | Ext.number
    | Ext.string
    | Ext.enum
    | Ext.allOf.F<T>
    | Ext.anyOf.F<T>
    | Ext.oneOf.F<T>
    | Ext.array.of<T>
    | Ext.object.F<T>
    | Ext.record.F<T>
    | Ext.tuple.F<T>
}

export namespace Ext {
  // export declare namespace is { export { is_null as null }}
  export function is<T>(u: unknown): u is Ext.F<T> {
    return Ltd.is(u)
  }
  is.null = (u: unknown): u is Ext.null => is_null(u)
  is.enum = (u: unknown): u is Ext.enum => Ltd.is.enum(u)

  export namespace is {
    export const boolean = Ltd.is.boolean
    export const integer = Ltd.is.integer
    export const number = Ltd.is.number
    export const string = Ltd.is.string
    export const allOf = <T>(u: unknown): u is Ext.allOf.F<T> => isObject(u) && Array_isArray(u.allOf)
    export const anyOf = <T>(u: unknown): u is Ext.anyOf.F<T> => isObject(u) && Array_isArray(u.anyOf)
    export const oneOf = <T>(u: unknown): u is Ext.oneOf.F<T> => isObject(u) && Array_isArray(u.oneOf)
    export const array = <T>(u: unknown): u is Ext.array.of<T> => isObject(u) && u.type === "array"
    export const tuple = <T>(u: unknown): u is Ext.tuple.F<T> => isObject(u) && u.type === "tuple"
    export const object = <T>(u: unknown): u is Ext.object.F<T> => isObject(u) && u.type === "object"
    export const record = <T>(u: unknown): u is Ext.record.F<T> => isObject(u) && u.type === "record"
    export const scalar = Ltd.is.scalar
    export const combinator = Ltd.is.combinator
    export const composite = Ltd.is.composite
  }

  export namespace make {
    export const boolean: (meta?: Ext.Meta) => Ext.boolean = fn.flow(
      Ltd.make.boolean,
      bind({ _type: false as boolean }),
    )
    export const integer: (meta?: Ext.Meta) => Ext.integer = fn.flow(
      Ltd.make.integer,
      bind({ _type: 0 as number }),
    )
    export const number: (meta?: Ext.Meta) => Ext.number = fn.flow(
      Ltd.make.number,
      bind({ _type: 0 as number }),
    )
    // = Ltd.make.number
    export const string: (meta?: Ext.Meta) => Ext.string = fn.flow(
      Ltd.make.string,
      bind({ _type: "" as string }),
    )
    export const array: <T>(items: T, meta?: Ext.Meta) => Ext.array.F<T> = (items, meta = {}) => ({
      type: "array",
      items,
      ...meta,
    })
    export const tuple: <T>(items: readonly T[], meta?: Ext.Meta) => Ext.tuple.F<T> = (items, meta = {}) => ({
      type: "tuple",
      items,
      ...meta,
    })
    export const record: <T>(additionalProperties: T, meta?: Ext.Meta) => Ext.record.F<T> = (
      _,
      meta = {},
    ) => ({ type: "record", additionalProperties: _, ...meta })
    export const object: <T>(
      properties: { [x: string]: T },
      meta?: Ext.Meta & { required?: readonly string[] },
    ) => Ext.object.F<T> = (_, { required = [], ...meta } = { required: [] }) => ({
      type: "object",
      properties: _,
      required,
      ...meta,
    })
  }

  const make_null
    : () => Ext.null 
    = fn.flow(Ltd.make.null, bind({ _type: null }))

  const make_enum
    : <const T extends readonly unknown[]>(enum_: T) => Ext.enum 
    = (enum_) => fn.pipe(Ltd.make.enum(enum_), bind({ tag: "enum" as const, _type: enum_[0] }))

  void (Ext.make.null = make_null)
  export declare namespace make {
    export { make_null as null, make_enum as enum }
  }

  export const functor: Functor<Ext.lambda, Ext> = { map }
  export function map<S, T>(f: (s: S) => T): (s: Ext.F<S>) => Ext.F<T> {
    return (x: Ext.F<S>) => {
      switch (true) {
        default: return fn.softExhaustiveCheck(x)
        case Ext.is.enum(x): return x
        case Ext.is.null(x): return x
        case Ext.is.boolean(x): return x
        case Ext.is.integer(x): return x
        case Ext.is.number(x): return x
        case Ext.is.string(x): return x
        case Ext.is.array(x): return { ...x, items: f(x.items) }
        case Ext.is.allOf(x): return { ...x, allOf: x.allOf.map(f) }
        case Ext.is.anyOf(x): return { ...x, anyOf: x.anyOf.map(f) }
        case Ext.is.oneOf(x): return { ...x, oneOf: x.oneOf.map(f) }
        case Ext.is.tuple(x): return { ...x, items: x.items.map(f) }
        case Ext.is.record(x): return { ...x, additionalProperties: f(x.additionalProperties) }
        case Ext.is.object(x): return {
          ...x,
          properties: Object_fromEntries(Object_entries(x.properties).map(([k, v]) => [k, f(v)])),
        }
      }
    }
  }

  export function fold<T>(algebra: Functor.Algebra<Ext.lambda, T>): (term: Ext) => T
  export function fold<T>(algebra: Functor.Algebra<Ext.lambda, T>) {
    /// impl.
    return fn.cata(functor)(algebra)
  }

  export function unfold<T>(coalgebra: Functor.Coalgebra<Ext.lambda, T>): (term: T) => Ext
  export function unfold<T>(coalgebra: Functor.Coalgebra<Ext.lambda, T>) {
    /// impl.
    return fn.ana(functor)(coalgebra)
  }

  export namespace Algebra {
    export const count: Functor.Algebra<Ext.lambda, number> = (n) => {
      switch (true) {
        case Ext.is.enum(n): return 1
        case Ext.is.scalar(n): return 1
        case Ext.is.array(n): return 1 + n.items
        case Ext.is.allOf(n): return 1 + n.allOf.reduce((out, x) => out + x, 0)
        case Ext.is.anyOf(n): return 1 + n.anyOf.reduce((out, x) => out + x, 0)
        case Ext.is.oneOf(n): return 1 + n.oneOf.reduce((out, x) => out + x, 0)
        case Ext.is.tuple(n): return 1 + n.items.reduce((out, x) => out + x, 0)
        case Ext.is.record(n): return 1 + Object_values(n.additionalProperties).reduce((out, x) => out + x, 0)
        case Ext.is.object(n): return 1 + Object_values(n.properties).reduce((out, x) => out + x, 0)
        default: return fn.exhaustive(n)
      }
    }

    export const depth: Functor.Algebra<Ext.lambda, number> = (n) => {
      switch (true) {
        default: return fn.exhaustive(n)
        case Ext.is.enum(n): return 1
        case Ext.is.scalar(n): return 1
        case Ext.is.array(n): return 1 + n.items
        case Ext.is.allOf(n): return 1 + Math_max(...n.allOf)
        case Ext.is.anyOf(n): return 1 + Math_max(...n.anyOf)
        case Ext.is.oneOf(n): return 1 + Math_max(...n.oneOf)
        case Ext.is.tuple(n): return 1 + Math_max(...Object_values(n.items))
        case Ext.is.object(n): return 1 + Math_max(...Object_values(n.properties))
        case Ext.is.record(n): return 1 + Math_max(...Object_values(n.additionalProperties))
      }
    }
    export const paths: Functor.Algebra<Ext.lambda, readonly (readonly (keyof any)[])[]> = (n) => {
      switch (true) {
        default: return fn.softExhaustiveCheck(n)
        case Ext.is.enum(n): return []
        case Ext.is.scalar(n): return [[n.type]]
        case Ext.is.allOf(n): return n.allOf.map((xss) => xss.flatMap((xs, ix: keyof any) => [ix].concat(xs)))
        case Ext.is.anyOf(n): return n.anyOf.map((xss) => xss.flatMap((xs, ix: keyof any) => [ix].concat(xs)))
        case Ext.is.oneOf(n): return n.oneOf.map((xss) => xss.flatMap((xs, ix: keyof any) => [ix].concat(xs)))
        case Ext.is.tuple(n): return n.items.flatMap((xss, ix) => xss.map((xs) => [ix as keyof any].concat(xs)))
        case Ext.is.record(n): return n.additionalProperties.map((path) => [symbol.record as keyof any].concat(path))
        case Ext.is.array(n): return n.items.map((xs) => [symbol.array as keyof any].concat(xs))
        case Ext.is.object(n): return Object_entries(n.properties).flatMap(([k, xss]) => xss.map((xs) => [k as keyof any].concat(xs)))
      }
    }
  }

  export type Weak =
    | Ltd.Scalar
    | Ltd.enum
    | Ext.Scalar
    | Ext.allOf.F<Weak>
    | Ext.anyOf.F<Weak>
    | Ext.oneOf.F<Weak>
    | Weak.ArrayLike
    | Weak.TupleLike
    | Weak.ObjectLike
    | Weak.CombinatorLike

  export namespace Weak {
    export type ArrayLike = { type: "array"; items: Weak }
    export type TupleLike = { type: "array" | "tuple"; items: readonly Weak[] }
    export type ObjectLike =
      | { type: "object"; properties: globalThis.Record<string, Weak>; additionalProperties?: Weak }
      | { type: "object" | "record"; additionalProperties: Weak }
    export type CombinatorLike =
      | { type?: "allOf"; allOf: Ltd.allOf["allOf"] }
      | { type?: "anyOf"; anyOf: Ltd.anyOf["anyOf"] }
      | { type?: "oneOf"; oneOf: Ltd.oneOf["oneOf"] }
    export const isArrayLike = (u: unknown): u is ArrayLike => isObject(u) && u.type === "array"
    export const isObjectLike = (u: unknown): u is Weak.ObjectLike => isObject(u) && u.type === "object"
    export const isTupleLike = (u: unknown): u is TupleLike =>
      isObject(u) && u.type === "array" && Array_isArray(u.items)
    export const isRecordLike = (u: unknown): u is TupleLike =>
      isObject(u) && u.type === "object" && Array_isArray(u.items)
  }

  export namespace Coalgebra {
    export const fromSchema: Functor.Coalgebra<Ext.lambda, Ext.Weak> = (expr) => {
      const meta = {
        ...tree.has("originalIndex", core.is.number)(expr) && { originalIndex: expr.originalIndex },
        ...tree.has("required", core.is.array(core.is.string))(expr) && { required: expr.required },
      }
      switch (true) {
        case Ltd.is.enum(expr): return Ext.make.enum(expr.enum)
        case Ltd.is.null(expr): return Ext.make.null()
        case Ltd.is.boolean(expr): return Ext.make.boolean(meta)
        case Ltd.is.integer(expr): return Ext.make.integer(meta)
        case Ltd.is.number(expr): return Ext.make.number(meta)
        case Ltd.is.string(expr): return Ext.make.string(meta)
        case Ltd.is.allOf(expr): return { type: "allOf", allOf: expr.allOf }
        case Ltd.is.anyOf(expr): return { type: "anyOf", anyOf: expr.anyOf }
        case Ltd.is.oneOf(expr): return { type: "oneOf", oneOf: expr.oneOf }
        case Weak.isTupleLike(expr): return Ext.make.tuple(expr.items, meta)
        case Weak.isArrayLike(expr): return Ext.make.array(expr.items, meta)
        case Weak.isObjectLike(expr): return !("properties" in expr) 
          ? Ext.make.record(expr.additionalProperties, meta) 
          : Ext.make.object(expr.properties, { ...meta })

        /**
         * **Note:**
         *
         * This case intentionally does _NOT_ throw when executed.
         *
         * That way if a user passes an `Ext` schema (a schema that has
         * _already_ been transformed into its intermediate representation),
         * {@link fromSchema `Ext.fromSchema`} behaves like the identity function.
         */
        default: return fn.softExhaustiveCheck(expr)
      }
    }
  }

  export const count = Ext.fold(Ext.Algebra.count)
  export const depth = Ext.fold(Ext.Algebra.depth)
  export const paths = Ext.fold(Ext.Algebra.paths)
  export const fromSchema = Ext.unfold(Ext.Coalgebra.fromSchema)

  export type fromSchema<T extends Ext.Weak> = fromSchema.loop<T>
  export declare namespace fromSchema {
    type loop<S> =
      // if `S` is the full union, don't recurse: just return `Ext`
      [Ltd] extends [S] ? Ext
      : S extends Ltd.Scalar ? Extract<Ext.Scalar, { type: S["type"] }>
      : S extends { allOf: infer T } ? S & { type: "allOf"; allOf: readonly fromSchema.loop<T>[] }
      : S extends { anyOf: infer T } ? S & { type: "anyOf"; anyOf: readonly fromSchema.loop<T>[] }
      : S extends { oneOf: infer T } ? { type: "oneOf"; oneOf: readonly Ext[] }
      : S extends { properties: { [x: string]: infer T } } ? { type: "object"; properties: { [x: string]: fromSchema.loop<T> } }
      : S extends { additionalProperties: infer T } ? { type: "record"; additionalProperties: fromSchema.loop<T> }
      : S extends { items: infer T extends readonly unknown[] } ? { type: "tuple"; items: { [I in keyof T]: fromSchema.loop<T[I]> } }
      : S extends { items: infer T } ? { type: "array"; items: fromSchema.loop<T> }
      : never
  }

  export type toType<T extends Weak> = toType.loop<T>
  export declare namespace toType {
    type loop<S extends Weak> 
      = S extends Ltd.Scalar ? (typeof Ext_ScalarTypeMap)[S["type"]]
      : S extends { allOf: infer T extends readonly {}[] } ? intersect<T>
      : S extends { anyOf: infer T extends Weak } ? toType.loop<T>
      : S extends { oneOf: infer T extends Weak } ? toType.loop<T>
      : S extends { items: infer T extends readonly Weak[] }
              ? { -readonly [I in keyof T]: toType.loop<T[I]> }
      : S extends { items: infer T extends Weak }
                ? readonly toType.loop<T>[]
      : S extends { 
        properties: infer T extends { [x: string]: Weak }, 
        required: readonly (infer Req extends string)[] 
     } 
      ? Merge<
        { -readonly [K in Req & keyof T]: toType.loop<T[K]> },
        { -readonly [K in Exclude<keyof T, Req>]+?: toType.loop<T[K]> }
      >
      : S extends { additionalProperties: infer T extends Weak } ? globalThis.Record<string, toType.loop<T>> : never
  }
}

void (Ext.Tag = Ext_Tag)
