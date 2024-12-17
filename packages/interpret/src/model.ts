import { fn } from "@traversable/data"
import { type Functor, type Kind as HKT, URI, newtype, symbol } from "@traversable/registry"

// type __ = HKT.apply<Capture, (x: number) => string>
// interface Capture extends HKT<(_: any) => unknown> {
//   [-1]: <T extends Parameters<this[0] & {}>[0]>(_: T) => ReturnType<this[0] & {}>
// }

/** @internal */
const Array_isArray = globalThis.Array.isArray
/** @internal */
const Object_create = globalThis.Object.create
/** @internal */
const Object_values = globalThis.Object.values
/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const Math_max = globalThis.Math.max

const isObject = (u: unknown): u is { [x: string]: unknown } =>
  u !== null && typeof u === "object" && !Array_isArray(u)

export type JsonSchema =
  | JsonSchema.null
  | JsonSchema.boolean
  | JsonSchema.integer
  | JsonSchema.number
  | JsonSchema.string
  | JsonSchema.allOf
  | JsonSchema.anyOf
  | JsonSchema.oneOf
  | JsonSchema.array
  | JsonSchema.object
export declare namespace JsonSchema {
  export {
    JsonSchema_null as null,
    JsonSchema_boolean as boolean,
    JsonSchema_number as number,
    JsonSchema_string as string,
    Schema_object as object,
  }
}
export declare namespace JsonSchema {
  interface JsonSchema_null {
    type: "null"
  }
  interface JsonSchema_boolean {
    type: "boolean"
  }
  interface JsonSchema_number {
    type: "number"
  }
  interface JsonSchema_string {
    type: "string"
  }
  interface integer {
    type: "integer"
  }
  interface allOf {
    allOf: readonly JsonSchema[]
  }
  namespace allOf {
    interface $<T> {
      allOf: readonly T[]
    }
  }
  interface anyOf {
    anyOf: readonly JsonSchema[]
  }
  namespace anyOf {
    interface $<T> {
      anyOf: readonly T[]
    }
  }
  interface oneOf {
    oneOf: readonly JsonSchema[]
  }
  namespace oneOf {
    interface $<T> {
      oneOf: readonly T[]
    }
  }
  interface array {
    type: "array"
    items: JsonSchema
  }
  namespace array {
    interface $<T> {
      type: "array"
      items: T
    }
  }
  interface Schema_object {
    type: "object"
    properties: { [x: string]: JsonSchema }
  }
  namespace Schema_object {
    interface $<T> {
      type: "object"
      properties: { [x: string]: T }
    }
  }
  ///
  type Scalar =
    | JsonSchema.null
    | JsonSchema.boolean
    | JsonSchema.integer
    | JsonSchema.number
    | JsonSchema.string
  interface Kind<T = unknown> extends HKT<T> {
    ["~1"]: JsonSchema.$<this["~0"]>
  }
  type $<T> =
    | JsonSchema.null
    | JsonSchema.boolean
    | JsonSchema.integer
    | JsonSchema.number
    | JsonSchema.string
    | JsonSchema.allOf.$<T>
    | JsonSchema.anyOf.$<T>
    | JsonSchema.oneOf.$<T>
    | JsonSchema.array.$<T>
    | JsonSchema.object.$<T>
}

export namespace JsonSchema {
  export const functor: Functor<JsonSchema.Kind> = { map }
  export function map<S, T>(
    f: (s: S) => T,
  ): (s: HKT.apply<JsonSchema.Kind, S>) => HKT.apply<JsonSchema.Kind, T> {
    return (x: HKT.apply<JsonSchema.Kind, S>) => {
      switch (true) {
        case JsonSchema.is.null(x):
          return x
        case JsonSchema.is.boolean(x):
          return x
        case JsonSchema.is.integer(x):
          return x
        case JsonSchema.is.number(x):
          return x
        case JsonSchema.is.string(x):
          return x
        case JsonSchema.is.array(x):
          return { ...x, items: f(x.items) }
        case JsonSchema.is.allOf(x):
          return { ...x, allOf: x.allOf.map(f) }
        case JsonSchema.is.anyOf(x):
          return { ...x, anyOf: x.anyOf.map(f) }
        case JsonSchema.is.oneOf(x):
          return { ...x, oneOf: x.oneOf.map(f) }
        case JsonSchema.is.object(x):
          return {
            ...x,
            properties: Object_fromEntries(Object_entries(x.properties).map(([k, v]) => [k, f(v)])),
          }
        default:
          return x // fn.exhaustive(x)
      }
    }
  }

  export function fold<T>(algebra: Functor.Algebra<Kind, T>): (term: JsonSchema) => T
  export function fold<T>(algebra: Functor.Algebra<Kind, T>) {
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

  /// TODO: make this typeguard not a liar
  export function is(u: unknown): u is JsonSchema {
    return true
  }
  const is_null = (u: unknown): u is JsonSchema.null => isObject(u) && "type" in u && u.type === "null"
  void (is.null = is_null)
  export namespace is {
    export const boolean = (u: unknown): u is JsonSchema.boolean => isObject(u) && u.type === "boolean"
    export const integer = (u: unknown): u is JsonSchema.integer => isObject(u) && u.type === "integer"
    export const number = (u: unknown): u is JsonSchema.number => isObject(u) && u.type === "number"
    export const string = (u: unknown): u is JsonSchema.string => isObject(u) && u.type === "string"
    export const allOf = <T>(u: unknown): u is JsonSchema.allOf.$<T> => isObject(u) && Array_isArray(u.allOf)
    export const anyOf = <T>(u: unknown): u is JsonSchema.anyOf.$<T> => isObject(u) && Array_isArray(u.anyOf)
    export const oneOf = <T>(u: unknown): u is JsonSchema.oneOf.$<T> => isObject(u) && Array_isArray(u.oneOf)
    export const object = <T>(u: unknown): u is JsonSchema.object.$<T> =>
      isObject(u) && u.type === "object" && !!u.properties
    export const array = <T>(u: unknown): u is JsonSchema.array.$<T> => isObject(u) && u.type === "array"
    export const isScalar = (u: unknown): u is JsonSchema.Scalar =>
      JsonSchema.is.null(u) ||
      JsonSchema.is.boolean(u) ||
      JsonSchema.is.integer(u) ||
      JsonSchema.is.number(u) ||
      JsonSchema.is.string(u)
  }

  export namespace make {
    export const boolean = (): JsonSchema.boolean => ({ type: "boolean" })
    export const integer = (): JsonSchema.integer => ({ type: "integer" })
    export const number = (): JsonSchema.number => ({ type: "number" })
    export const string = (): JsonSchema.string => ({ type: "string" })
    export const allOf = <T>(allOf: readonly T[]): Ext.allOf.$<T> => ({ allOf })
    export const anyOf = <T>(anyOf: readonly T[]): Ext.anyOf.$<T> => ({ anyOf })
    export const oneOf = <T>(oneOf: readonly T[]): Ext.oneOf.$<T> => ({ oneOf })
    export const array = <T>(items: T): Ext.array.$<T> => ({ type: "array", items })
    export const tuple = <T>(items: readonly T[]): Ext.tuple.$<T> => ({ type: "tuple", items })
    export const record = <T>(additionalProperties: T): Ext.record.$<T> => ({
      type: "record",
      additionalProperties,
    })
    export const object = <T>(properties: { [x: string]: T }): Ext.object.$<T> => ({
      type: "object",
      properties,
    })
  }
  const make_null = (): JsonSchema.null => ({ type: "null" })
  void (make.null = make_null)
  export declare namespace make {
    export { make_null as null }
  }

  export namespace Algebra {
    export const count: Functor.Algebra<JsonSchema.Kind, number> = (n) => {
      switch (true) {
        case JsonSchema.is.null(n):
          return 1
        case JsonSchema.is.boolean(n):
          return 1
        case JsonSchema.is.integer(n):
          return 1
        case JsonSchema.is.number(n):
          return 1
        case JsonSchema.is.string(n):
          return 1
        case JsonSchema.is.array(n):
          return 1 + n.items
        case JsonSchema.is.allOf(n):
          return 1 + n.allOf.reduce((out, x) => out + x, 0)
        case JsonSchema.is.anyOf(n):
          return 1 + n.anyOf.reduce((out, x) => out + x, 0)
        case JsonSchema.is.oneOf(n):
          return 1 + n.oneOf.reduce((out, x) => out + x, 0)
        case JsonSchema.is.object(n):
          return 1 + Object_values(n.properties).reduce((out, x) => out + x, 0)
        default:
          return fn.exhaustive(n)
      }
    }
    export const depth: Functor.Algebra<JsonSchema.Kind, number> = (n) => {
      switch (true) {
        case JsonSchema.is.null(n):
          return 1
        case JsonSchema.is.boolean(n):
          return 1
        case JsonSchema.is.integer(n):
          return 1
        case JsonSchema.is.number(n):
          return 1
        case JsonSchema.is.string(n):
          return 1
        case JsonSchema.is.array(n):
          return 1 + n.items
        case JsonSchema.is.allOf(n):
          return 1 + Math_max(...n.allOf)
        case JsonSchema.is.anyOf(n):
          return 1 + Math_max(...n.anyOf)
        case JsonSchema.is.oneOf(n):
          return 1 + Math_max(...n.oneOf)
        case JsonSchema.is.object(n):
          return 1 + Math_max(...Object_values(n.properties))
        default:
          return fn.exhaustive(n)
      }
    }

    export const paths: Functor.Algebra<JsonSchema.Kind, readonly (readonly (keyof any)[])[]> = (n) => {
      switch (true) {
        case JsonSchema.is.null(n):
          return [[n.type]]
        case JsonSchema.is.boolean(n):
          return [[n.type]]
        case JsonSchema.is.integer(n):
          return [[n.type]]
        case JsonSchema.is.number(n):
          return [[n.type]]
        case JsonSchema.is.string(n):
          return [[n.type]]
        case JsonSchema.is.allOf(n):
          return n.allOf.map((xss) =>
            xss.flatMap((xs, ix) => [symbol.intersection, ix as keyof any].concat(xs)),
          )
        case JsonSchema.is.anyOf(n):
          return n.anyOf.map((xss) => xss.flatMap((xs, ix) => [symbol.union, ix as keyof any].concat(xs)))
        case JsonSchema.is.oneOf(n):
          return n.oneOf.map((xss) => xss.flatMap((xs, ix) => [symbol.disjoint, ix as keyof any].concat(xs)))
        case JsonSchema.is.array(n):
          return n.items.map((xs) => [symbol.array as keyof any].concat(xs))
        case JsonSchema.is.object(n):
          return Object_entries(n.properties).flatMap(([k, xss]) =>
            xss.map((xs) => [k as keyof any].concat(xs)),
          )
        default:
          return fn.exhaustive(n)
      }
    }
  }
  export const count = JsonSchema.fold(JsonSchema.Algebra.count)
  export const depth = JsonSchema.fold(JsonSchema.Algebra.depth)
  export const paths = JsonSchema.fold(JsonSchema.Algebra.paths)
}

export type Ext =
  | JsonSchema.null
  | JsonSchema.boolean
  | JsonSchema.integer
  | JsonSchema.number
  | JsonSchema.string
  | Ext.allOf
  | Ext.anyOf
  | Ext.oneOf
  | Ext.array
  | Ext.object
  | Ext.tuple
  | Ext.record
export declare namespace Ext {
  export { Ext_object as object }
}
export declare namespace Ext {
  interface allOf {
    allOf: readonly Ext[]
  }
  namespace allOf {
    interface $<T> {
      allOf: readonly T[]
    }
  }
  interface anyOf {
    anyOf: readonly Ext[]
  }
  namespace anyOf {
    interface $<T> {
      anyOf: readonly T[]
    }
  }
  interface oneOf {
    oneOf: readonly Ext[]
  }
  namespace oneOf {
    interface $<T> {
      oneOf: readonly T[]
    }
  }
  interface array {
    type: "array"
    items: Ext
  }
  namespace array {
    interface $<T> {
      type: "array"
      items: T
    }
  }
  interface tuple {
    type: "tuple"
    items: readonly Ext[]
  }
  namespace tuple {
    interface $<T> {
      type: "tuple"
      items: readonly T[]
    }
  }
  interface record {
    type: "record"
    additionalProperties: Ext
  }
  namespace record {
    interface $<T> {
      type: "record"
      additionalProperties: T
    }
  }
  interface Ext_object {
    type: "object"
    properties: { [x: string]: Ext }
  }
  namespace Ext_object {
    interface $<T> {
      type: "object"
      properties: { [x: string]: T }
    }
  }
  ///
  interface Kind<T = unknown> extends HKT<T> {
    ["~1"]: Ext.$<this["~0"]>
  }
  type $<T> =
    | JsonSchema.null
    | JsonSchema.boolean
    | JsonSchema.integer
    | JsonSchema.number
    | JsonSchema.string
    | Ext.allOf.$<T>
    | Ext.anyOf.$<T>
    | Ext.oneOf.$<T>
    | Ext.array.$<T>
    | Ext.object.$<T>
    | Ext.record.$<T>
    | Ext.tuple.$<T>
}

export namespace Ext {
  export namespace is {
    export const allOf = <T>(u: unknown): u is Ext.allOf.$<T> => isObject(u) && Array_isArray(u.allOf)
    export const anyOf = <T>(u: unknown): u is Ext.anyOf.$<T> => isObject(u) && Array_isArray(u.anyOf)
    export const oneOf = <T>(u: unknown): u is Ext.oneOf.$<T> => isObject(u) && Array_isArray(u.oneOf)
    export const array = <T>(u: unknown): u is Ext.array.$<T> => isObject(u) && u.type === "array"
    export const tuple = <T>(u: unknown): u is Ext.tuple.$<T> => isObject(u) && u.type === "tuple"
    export const object = <T>(u: unknown): u is Ext.object.$<T> => isObject(u) && u.type === "object"
    export const record = <T>(u: unknown): u is Ext.record.$<T> => isObject(u) && u.type === "record"
  }
  export namespace make {
    export const allOf = <T>(allOf: readonly T[]): Ext.allOf.$<T> => ({ allOf })
    export const anyOf = <T>(anyOf: readonly T[]): Ext.anyOf.$<T> => ({ anyOf })
    export const oneOf = <T>(oneOf: readonly T[]): Ext.oneOf.$<T> => ({ oneOf })
    export const array = <T>(items: T): Ext.array.$<T> => ({ type: "array", items })
    export const tuple = <T>(items: readonly T[]): Ext.tuple.$<T> => ({ type: "tuple", items })
    export const record = <T>(additionalProperties: T): Ext.record.$<T> => ({
      type: "record",
      additionalProperties,
    })
    export const object = <T>(properties: { [x: string]: T }): Ext.object.$<T> => ({
      type: "object",
      properties,
    })
  }

  export const functor: Functor<Ext.Kind, Ext> = { map }
  export function map<S, T>(f: (s: S) => T): (s: Ext.$<S>) => Ext.$<T> {
    return (x: Ext.$<S>) => {
      switch (true) {
        case JsonSchema.is.null(x):
          return x
        case JsonSchema.is.boolean(x):
          return x
        case JsonSchema.is.integer(x):
          return x
        case JsonSchema.is.number(x):
          return x
        case JsonSchema.is.string(x):
          return x
        case Ext.is.allOf(x):
          return { ...x, allOf: x.allOf.map(f) }
        case Ext.is.anyOf(x):
          return { ...x, anyOf: x.anyOf.map(f) }
        case Ext.is.oneOf(x):
          return { ...x, oneOf: x.oneOf.map(f) }
        case Ext.is.tuple(x):
          return { ...x, items: x.items.map(f) }
        case Ext.is.array(x):
          return { ...x, items: f(x.items) }
        case Ext.is.record(x):
          return { ...x, additionalProperties: f(x.additionalProperties) }
        case Ext.is.object(x):
          return {
            ...x,
            properties: Object_fromEntries(Object_entries(x.properties).map(([k, v]) => [k, f(v)])),
          }
        default:
          return x // fn.exhaustive(x)
      }
    }
  }

  export function fold<T>(algebra: Functor.Algebra<Ext.Kind, T>): (term: Ext) => T
  export function fold<T>(algebra: Functor.Algebra<Ext.Kind, T>) {
    /// impl.
    return fn.cata(functor)(algebra)
  }

  export function unfold<T>(coalgebra: Functor.Coalgebra<Ext.Kind, T>): (term: T) => Ext
  export function unfold<T>(coalgebra: Functor.Coalgebra<Ext.Kind, T>) {
    return fn.ana(functor)(coalgebra)
  }

  export namespace Algebra {
    export const count: Functor.Algebra<Ext.Kind, number> = (n) => {
      switch (true) {
        case JsonSchema.is.null(n):
          return 1
        case JsonSchema.is.boolean(n):
          return 1
        case JsonSchema.is.integer(n):
          return 1
        case JsonSchema.is.number(n):
          return 1
        case JsonSchema.is.string(n):
          return 1
        case Ext.is.array(n):
          return 1 + n.items
        case JsonSchema.is.allOf(n):
          return 1 + n.allOf.reduce((out, x) => out + x, 0)
        case JsonSchema.is.anyOf(n):
          return 1 + n.anyOf.reduce((out, x) => out + x, 0)
        case JsonSchema.is.oneOf(n):
          return 1 + n.oneOf.reduce((out, x) => out + x, 0)
        case Ext.is.tuple(n):
          return 1 + n.items.reduce((out, x) => out + x, 0)
        case Ext.is.record(n):
          return 1 + Object_values(n.additionalProperties).reduce((out, x) => out + x, 0)
        case Ext.is.object(n):
          return 1 + Object_values(n.properties).reduce((out, x) => out + x, 0)
        default:
          return fn.exhaustive(n)
      }
    }
    export const depth: Functor.Algebra<Ext.Kind, number> = (n) => {
      switch (true) {
        case JsonSchema.is.null(n):
          return 1
        case JsonSchema.is.boolean(n):
          return 1
        case JsonSchema.is.integer(n):
          return 1
        case JsonSchema.is.number(n):
          return 1
        case JsonSchema.is.string(n):
          return 1
        case Ext.is.array(n):
          return 1 + n.items
        case Ext.is.allOf(n):
          return 1 + Math_max(...n.allOf)
        case Ext.is.anyOf(n):
          return 1 + Math_max(...n.anyOf)
        case Ext.is.oneOf(n):
          return 1 + Math_max(...n.oneOf)
        case Ext.is.tuple(n):
          return 1 + Math_max(...Object_values(n.items))
        case Ext.is.object(n):
          return 1 + Math_max(...Object_values(n.properties))
        case Ext.is.record(n):
          return 1 + Math_max(...Object_values(n.additionalProperties))
        default:
          return fn.exhaustive(n)
      }
    }
    export const paths: Functor.Algebra<Ext.Kind, readonly (readonly (keyof any)[])[]> = (n) => {
      switch (true) {
        case JsonSchema.is.null(n):
          return [[n.type]]
        case JsonSchema.is.boolean(n):
          return [[n.type]]
        case JsonSchema.is.integer(n):
          return [[n.type]]
        case JsonSchema.is.number(n):
          return [[n.type]]
        case JsonSchema.is.string(n):
          return [[n.type]]
        case Ext.is.allOf(n):
          return n.allOf.map((xss) => xss.flatMap((xs, ix) => [ix as keyof any].concat(xs)))
        case Ext.is.anyOf(n):
          return n.anyOf.map((xss) => xss.flatMap((xs, ix) => [ix as keyof any].concat(xs)))
        case Ext.is.oneOf(n):
          return n.oneOf.map((xss) => xss.flatMap((xs, ix) => [ix as keyof any].concat(xs)))
        case Ext.is.tuple(n):
          return n.items.flatMap((xss, ix) => xss.map((xs) => [ix as keyof any].concat(xs)))
        case Ext.is.record(n):
          return n.additionalProperties.map((path) => [symbol.record as keyof any].concat(path))
        case Ext.is.array(n):
          return n.items.map((xs) => [symbol.array as keyof any].concat(xs))
        case Ext.is.object(n):
          return Object_entries(n.properties).flatMap(([k, xss]) =>
            xss.map((xs) => [k as keyof any].concat(xs)),
          )
        default:
          return fn.exhaustive(n)
      }

      // switch (true) {
      //   case Schema.is.null(n): return [[n.type]]
      //   case Schema.is.boolean(n): return [[n.type]]
      //   case Schema.is.integer(n): return [[n.type]]
      //   case Schema.is.number(n): return [[n.type]]
      //   case Schema.is.string(n): return [[n.type]]
      //   case Ext.is.array(n): return n.items.map((path) => [symbol.array as keyof any].concat(path))
      //   case Ext.is.tuple(n): return n.items.map((paths) => paths.flatMap((path, ix) => [ix as keyof any].concat(path)))
      //   case Ext.is.allOf(n): return n.allOf.map((paths) => paths.flatMap((path, ix) => [ix as keyof any].concat(path)))
      //   case Ext.is.anyOf(n): return n.anyOf.map((paths) => paths.flatMap((path, ix) => [ix as keyof any].concat(path)))
      //   case Ext.is.oneOf(n): return n.oneOf.map((paths) => paths.flatMap((path, ix) => [ix as keyof any].concat(path)))
      //   case Ext.is.record(n):
      //     return n.additionalProperties.map((path) => [symbol.record as keyof any].concat(path))
      //   case Ext.is.object(n):
      //     return Object_entries(n.properties).flatMap(([k, paths]) => paths.map((path) => [k as keyof any].concat(path)))
      //   default: return exhaustive(n)
      // }
    }
  }

  export type lax =
    | JsonSchema.Scalar
    | Ext.allOf.$<lax>
    | Ext.anyOf.$<lax>
    | Ext.oneOf.$<lax>
    | lax.ArrayLike
    | lax.TupleLike
    | lax.ObjectLike

  export namespace lax {
    export type ArrayLike = { type: "array"; items: lax }
    export type TupleLike = { type: "array"; items: readonly lax[] }
    export type ObjectLike =
      | { type: "object"; properties: globalThis.Record<string, lax> }
      | { type: "object"; additionalProperties: lax }
    export const isTupleLike = (u: unknown): u is TupleLike => isObject(u) && u.type === "array" && Array_isArray(u.items)
    export const isArrayLike = (u: unknown): u is ArrayLike => isObject(u) && u.type === "array"
    export const isObjectLike = (u: unknown): u is lax.ObjectLike => isObject(u) && u.type === "object"
  }

  export namespace Coalgebra {
    export const fromSchema: Functor.Coalgebra<Ext.Kind, Ext.lax> = (expr) => {
      switch (true) {
        case JsonSchema.is.null(expr):
          return JsonSchema.make.null()
        case JsonSchema.is.boolean(expr):
          return JsonSchema.make.boolean()
        case JsonSchema.is.integer(expr):
          return JsonSchema.make.integer()
        case JsonSchema.is.number(expr):
          return JsonSchema.make.number()
        case JsonSchema.is.string(expr):
          return JsonSchema.make.string()
        case JsonSchema.is.allOf(expr):
          return Ext.make.allOf(expr.allOf)
        case JsonSchema.is.anyOf(expr):
          return Ext.make.anyOf(expr.anyOf)
        case JsonSchema.is.oneOf(expr):
          return Ext.make.oneOf(expr.oneOf)
        case lax.isObjectLike(expr):
          return "properties" in expr
            ? Ext.make.object(expr.properties)
            : Ext.make.record(expr.additionalProperties)
        case lax.isTupleLike(expr): return Ext.make.tuple(expr.items)
        case lax.isArrayLike(expr): return Ext.make.array(expr.items)
        default:
          return fn.exhaustive(expr)
      }
    }
  }

  export const count = Ext.fold(Ext.Algebra.count)
  export const depth = Ext.fold(Ext.Algebra.depth)
  export const paths = Ext.fold(Ext.Algebra.paths)
  // TODO: fix this type! the problem is that `lax` has not been fully instantiated.
  export const fromSchema: <const T>(term: T) => fromSchema<T> = Ext.unfold(Ext.Coalgebra.fromSchema) as never

  export type fromSchema<T> = T extends JsonSchema.Scalar
    ? T
    : T extends { allOf: infer S }
      ? { allOf: fromSchema<S> }
      : T extends { anyOf: infer S }
        ? { anyOf: fromSchema<S> }
        : T extends { oneOf: infer S }
          ? { oneOf: fromSchema<S> }
          : T extends { properties: infer S }
            ? { type: "object"; properties: fromSchema<S> }
            : T extends { additionalProperties: infer S }
              ? { type: "record"; additionalProperties: fromSchema<S> }
              : T extends { items: infer S extends readonly unknown[] }
                ? { type: "tuple"; items: { [K in keyof S]: fromSchema<S[K]> } }
                : T extends { items: infer S }
                  ? { type: "array"; items: fromSchema<S> }
                  : never
}
