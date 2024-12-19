import { fn, map as map_ } from "@traversable/data"
import { type Functor, type HKT, URI, newtype, symbol } from "@traversable/registry"

// type __ = HKT.apply<Capture, (x: number) => string>
// interface Capture extends HKT<(_: any) => unknown> {
//   [-1]: <T extends Parameters<this[0] & {}>[0]>(_: T) => ReturnType<this[0] & {}>
// }

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

const isObject = (u: unknown): u is { [x: string]: unknown } =>
  u !== null && typeof u === "object" && !Array_isArray(u)

export type Ltd =
  | Ltd.null
  | Ltd.boolean
  | Ltd.integer
  | Ltd.number
  | Ltd.string
  | Ltd.allOf
  | Ltd.anyOf
  | Ltd.oneOf
  | Ltd.array
  | Ltd.object

export declare namespace Ltd {
  export {
    Ltd_null as null,
    Ltd_boolean as boolean,
    Ltd_integer as integer,
    Ltd_number as number,
    Ltd_string as string,
    Schema_object as object,
  }
}
export declare namespace Ltd {
  interface Ltd_null {
    type: "null"
  }
  interface Ltd_boolean {
    type: "boolean"
  }
  interface Ltd_number {
    type: "number"
  }
  interface Ltd_string {
    type: "string"
  }
  interface Ltd_integer {
    type: "integer"
  }
  interface allOf {
    allOf: readonly Ltd[]
  }
  namespace allOf {
    interface F<T> {
      allOf: readonly T[]
    }
  }
  interface anyOf {
    anyOf: readonly Ltd[]
  }
  namespace anyOf {
    interface F<T> {
      anyOf: readonly T[]
    }
  }
  interface oneOf {
    oneOf: readonly Ltd[]
  }
  namespace oneOf {
    interface F<T> {
      oneOf: readonly T[]
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
  }
  interface Schema_object {
    type: "object"
    properties: { [x: string]: Ltd }
  }
  namespace Schema_object {
    interface F<T> {
      type: "object"
      properties: { [x: string]: T }
    }
  }
  ///
  type Scalar = Ltd.null | Ltd.boolean | Ltd.integer | Ltd.number | Ltd.string
  interface lambda<T = unknown> extends HKT<T> {
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
  export const functor: Functor<Ltd.lambda> = { map }
  export function map<S, T>(f: (s: S) => T): (s: HKT.apply<Ltd.lambda, S>) => HKT.apply<Ltd.lambda, T> {
    return (x: HKT.apply<Ltd.lambda, S>) => {
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
  }

  export function fold<T>(algebra: Functor.Algebra<lambda, T>): (term: Ltd) => T
  export function fold<T>(algebra: Functor.Algebra<lambda, T>) {
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
  export function is(u: unknown): u is Ltd {
    return true
  }
  const is_null = (u: unknown): u is Ltd.null => isObject(u) && "type" in u && u.type === "null"
  void (is.null = is_null)
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
    export const isScalar = (u: unknown): u is Ltd.Scalar =>
      Ltd.is.null(u) || Ltd.is.boolean(u) || Ltd.is.integer(u) || Ltd.is.number(u) || Ltd.is.string(u)
  }

  export namespace make {
    export const boolean = (meta?: {}): Ltd.boolean => ({ type: "boolean", ...(meta && meta) })
    export const integer = (meta?: {}): Ltd.integer => ({ type: "integer", ...(meta && meta) })
    export const number = (meta?: {}): Ltd.number => ({ type: "number", ...(meta && meta) })
    export const string = (meta?: {}): Ltd.string => ({ type: "string", ...(meta && meta) })
    export const allOf = <T>(allOf: readonly T[]): Ext.allOf.F<T> => ({ allOf })
    export const anyOf = <T>(anyOf: readonly T[]): Ext.anyOf.F<T> => ({ anyOf })
    export const oneOf = <T>(oneOf: readonly T[]): Ext.oneOf.F<T> => ({ oneOf })
    export const array = <T>(items: T, meta?: {}): Ext.array.F<T> => ({
      type: "array",
      items,
      ...(meta && meta),
    })
    export const tuple = <T>(items: readonly T[], meta?: {}): Ext.tuple.F<T> => ({
      type: "tuple",
      items,
      ...(meta && meta),
    })
    export const record = <T>(additionalProperties: T, meta?: {}): Ext.record.F<T> => ({
      type: "record",
      additionalProperties,
      ...(meta && meta),
    })
    export const object = <T>(properties: { [x: string]: T }, meta?: {}): Ext.object.F<T> => ({
      type: "object",
      properties,
      ...(meta && meta),
    })
  }
  const make_null = (): Ltd.null => ({ type: "null" })
  void (make.null = make_null)
  export declare namespace make {
    export { make_null as null }
  }

  export namespace Algebra {
    export const count: Functor.Algebra<Ltd.lambda, number> = (n) => {
      switch (true) {
        case Ltd.is.null(n):
          return 1
        case Ltd.is.boolean(n):
          return 1
        case Ltd.is.integer(n):
          return 1
        case Ltd.is.number(n):
          return 1
        case Ltd.is.string(n):
          return 1
        case Ltd.is.array(n):
          return 1 + n.items
        case Ltd.is.allOf(n):
          return 1 + n.allOf.reduce((out, x) => out + x, 0)
        case Ltd.is.anyOf(n):
          return 1 + n.anyOf.reduce((out, x) => out + x, 0)
        case Ltd.is.oneOf(n):
          return 1 + n.oneOf.reduce((out, x) => out + x, 0)
        case Ltd.is.object(n):
          return 1 + Object_values(n.properties).reduce((out, x) => out + x, 0)
        default:
          return fn.exhaustive(n)
      }
    }
    export const depth: Functor.Algebra<Ltd.lambda, number> = (n) => {
      switch (true) {
        case Ltd.is.null(n):
          return 1
        case Ltd.is.boolean(n):
          return 1
        case Ltd.is.integer(n):
          return 1
        case Ltd.is.number(n):
          return 1
        case Ltd.is.string(n):
          return 1
        case Ltd.is.array(n):
          return 1 + n.items
        case Ltd.is.allOf(n):
          return 1 + Math_max(...n.allOf)
        case Ltd.is.anyOf(n):
          return 1 + Math_max(...n.anyOf)
        case Ltd.is.oneOf(n):
          return 1 + Math_max(...n.oneOf)
        case Ltd.is.object(n):
          return 1 + Math_max(...Object_values(n.properties))
        default:
          return fn.exhaustive(n)
      }
    }

    export const paths: Functor.Algebra<Ltd.lambda, readonly (readonly (keyof any)[])[]> = (n) => {
      switch (true) {
        case Ltd.is.null(n):
          return [[n.type]]
        case Ltd.is.boolean(n):
          return [[n.type]]
        case Ltd.is.integer(n):
          return [[n.type]]
        case Ltd.is.number(n):
          return [[n.type]]
        case Ltd.is.string(n):
          return [[n.type]]
        case Ltd.is.allOf(n):
          return n.allOf.map((xss) =>
            xss.flatMap((xs, ix) => [symbol.intersection, ix as keyof any].concat(xs)),
          )
        case Ltd.is.anyOf(n):
          return n.anyOf.map((xss) => xss.flatMap((xs, ix) => [symbol.union, ix as keyof any].concat(xs)))
        case Ltd.is.oneOf(n):
          return n.oneOf.map((xss) => xss.flatMap((xs, ix) => [symbol.disjoint, ix as keyof any].concat(xs)))
        case Ltd.is.array(n):
          return n.items.map((xs) => [symbol.array as keyof any].concat(xs))
        case Ltd.is.object(n):
          return Object_entries(n.properties).flatMap(([k, xss]) =>
            xss.map((xs) => [k as keyof any].concat(xs)),
          )
        default:
          return fn.exhaustive(n)
      }
    }
  }
  export const count = Ltd.fold(Ltd.Algebra.count)
  export const depth = Ltd.fold(Ltd.Algebra.depth)
  export const paths = Ltd.fold(Ltd.Algebra.paths)
}

export type Ext =
  | Ltd.null
  | Ltd.boolean
  | Ltd.integer
  | Ltd.number
  | Ltd.string
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
    interface F<T> {
      allOf: readonly T[]
    }
  }
  interface anyOf {
    anyOf: readonly Ext[]
  }
  namespace anyOf {
    interface F<T> {
      anyOf: readonly T[]
    }
  }
  interface oneOf {
    oneOf: readonly Ext[]
  }
  namespace oneOf {
    interface F<T> {
      oneOf: readonly T[]
    }
  }
  interface array {
    type: "array"
    items: Ext
  }
  namespace array {
    interface F<T> {
      type: "array"
      items: T
    }
  }
  interface tuple {
    type: "tuple"
    items: readonly Ext[]
  }
  namespace tuple {
    interface F<T> {
      type: "tuple"
      items: readonly T[]
    }
  }
  interface record {
    type: "record"
    additionalProperties: Ext
  }
  namespace record {
    interface F<T> {
      type: "record"
      additionalProperties: T
    }
  }
  interface Ext_object {
    type: "object"
    properties: { [x: string]: Ext }
  }
  namespace Ext_object {
    interface F<T> {
      type: "object"
      properties: { [x: string]: T }
    }
  }
  ///
  interface lambda<T = unknown> extends HKT<T> {
    [-1]: Ext.F<this[0]>
  }
  type F<T> =
    | Ltd.null
    | Ltd.boolean
    | Ltd.integer
    | Ltd.number
    | Ltd.string
    | Ext.allOf.F<T>
    | Ext.anyOf.F<T>
    | Ext.oneOf.F<T>
    | Ext.array.F<T>
    | Ext.object.F<T>
    | Ext.record.F<T>
    | Ext.tuple.F<T>
}

export namespace Ext {
  export namespace is {
    export const allOf = <T>(u: unknown): u is Ext.allOf.F<T> => isObject(u) && Array_isArray(u.allOf)
    export const anyOf = <T>(u: unknown): u is Ext.anyOf.F<T> => isObject(u) && Array_isArray(u.anyOf)
    export const oneOf = <T>(u: unknown): u is Ext.oneOf.F<T> => isObject(u) && Array_isArray(u.oneOf)
    export const array = <T>(u: unknown): u is Ext.array.F<T> => isObject(u) && u.type === "array"
    export const tuple = <T>(u: unknown): u is Ext.tuple.F<T> => isObject(u) && u.type === "tuple"
    export const object = <T>(u: unknown): u is Ext.object.F<T> => isObject(u) && u.type === "object"
    export const record = <T>(u: unknown): u is Ext.record.F<T> => isObject(u) && u.type === "record"
  }
  export namespace make {
    export const allOf = <T>(allOf: readonly T[]): Ext.allOf.F<T> => ({ allOf })
    export const anyOf = <T>(anyOf: readonly T[]): Ext.anyOf.F<T> => ({ anyOf })
    export const oneOf = <T>(oneOf: readonly T[]): Ext.oneOf.F<T> => ({ oneOf })
    export const array = <T>(items: T, meta?: {}): Ext.array.F<T> => ({
      type: "array",
      items,
      ...(meta && meta),
    })
    export const tuple = <T>(items: readonly T[], meta?: {}): Ext.tuple.F<T> => ({
      type: "tuple",
      items,
      ...(meta && meta),
    })
    export const record = <T>(additionalProperties: T, meta?: {}): Ext.record.F<T> => ({
      type: "record",
      additionalProperties,
      ...(meta && meta),
    })
    export const object = <T>(properties: { [x: string]: T }, meta?: {}): Ext.object.F<T> => ({
      type: "object",
      properties,
      ...(meta && meta),
    })
  }

  export const functor: Functor<Ext.lambda, Ext> = { map }
  export function map<S, T>(f: (s: S) => T): (s: Ext.F<S>) => Ext.F<T> {
    return (x: Ext.F<S>) => {
      // console.log("[Ext.map TOPLEVEL]", x)
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
        case Ext.is.allOf(x):
          return { ...x, allOf: x.allOf.map(f) }
        case Ext.is.anyOf(x):
          return { ...x, anyOf: x.anyOf.map(f) }
        case Ext.is.oneOf(x):
          return { ...x, oneOf: x.oneOf.map(f) }
        case Ext.is.tuple(x): {
          // console.log("[Ext.map, TUPLE CASE]:", x)
          return { ...x, items: x.items.map((y, ix) => f(...([y, ix + 10] as never as [S]))) }
        }
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

  export function fold<T>(algebra: Functor.Algebra<Ext.lambda, T>): (term: Ext) => T
  export function fold<T>(algebra: Functor.Algebra<Ext.lambda, T>) {
    /// impl.
    return fn.cata(functor)(algebra)
  }

  export function unfold<T>(coalgebra: Functor.Coalgebra<Ext.lambda, T>): (term: T) => Ext
  export function unfold<T>(coalgebra: Functor.Coalgebra<Ext.lambda, T>) {
    return fn.ana(functor)(coalgebra)
  }

  export namespace Algebra {
    export const count: Functor.Algebra<Ext.lambda, number> = (n) => {
      switch (true) {
        case Ltd.is.null(n):
          return 1
        case Ltd.is.boolean(n):
          return 1
        case Ltd.is.integer(n):
          return 1
        case Ltd.is.number(n):
          return 1
        case Ltd.is.string(n):
          return 1
        case Ext.is.array(n):
          return 1 + n.items
        case Ext.is.allOf(n):
          return 1 + n.allOf.reduce((out, x) => out + x, 0)
        case Ext.is.anyOf(n):
          return 1 + n.anyOf.reduce((out, x) => out + x, 0)
        case Ext.is.oneOf(n):
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
    export const depth: Functor.Algebra<Ext.lambda, number> = (n) => {
      switch (true) {
        case Ltd.is.null(n):
          return 1
        case Ltd.is.boolean(n):
          return 1
        case Ltd.is.integer(n):
          return 1
        case Ltd.is.number(n):
          return 1
        case Ltd.is.string(n):
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
    export const paths: Functor.Algebra<Ext.lambda, readonly (readonly (keyof any)[])[]> = (n) => {
      switch (true) {
        case Ltd.is.null(n):
          return [[n.type]]
        case Ltd.is.boolean(n):
          return [[n.type]]
        case Ltd.is.integer(n):
          return [[n.type]]
        case Ltd.is.number(n):
          return [[n.type]]
        case Ltd.is.string(n):
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
    }
  }

  export type lax =
    | Ltd.Scalar
    | Ext.allOf.F<lax>
    | Ext.anyOf.F<lax>
    | Ext.oneOf.F<lax>
    | lax.ArrayLike
    | lax.TupleLike
    | lax.ObjectLike

  export namespace lax {
    export type ArrayLike = { type: "array"; items: lax }
    export type TupleLike = { type: "array"; items: readonly lax[] }
    export type ObjectLike =
      | { type: "object"; properties: globalThis.Record<string, lax> }
      | { type: "object"; additionalProperties: lax }
    export const isTupleLike = (u: unknown): u is TupleLike =>
      isObject(u) && u.type === "array" && Array_isArray(u.items)
    export const isArrayLike = (u: unknown): u is ArrayLike => isObject(u) && u.type === "array"
    export const isObjectLike = (u: unknown): u is lax.ObjectLike => isObject(u) && u.type === "object"
  }

  export namespace Coalgebra {
    export const fromSchema: Functor.Coalgebra<Ext.lambda, Ext.lax> = (expr) => {
      const meta = "originalIx" in expr ? { originalIx: expr.originalIx } : {}
      switch (true) {
        case Ltd.is.null(expr):
          return Ltd.make.null()
        case Ltd.is.boolean(expr):
          return Ltd.make.boolean(meta)
        case Ltd.is.integer(expr):
          return Ltd.make.integer(meta)
        case Ltd.is.number(expr):
          return Ltd.make.number(meta)
        case Ltd.is.string(expr):
          return Ltd.make.string(meta)
        case Ltd.is.allOf(expr):
          return Ext.make.allOf(expr.allOf)
        case Ltd.is.anyOf(expr):
          return Ext.make.anyOf(expr.anyOf)
        case Ltd.is.oneOf(expr):
          return Ext.make.oneOf(expr.oneOf)
        case lax.isObjectLike(expr):
          return "properties" in expr
            ? Ext.make.object(expr.properties, meta)
            : Ext.make.record(expr.additionalProperties, meta)
        case lax.isTupleLike(expr):
          return Ext.make.tuple(expr.items, meta)
        case lax.isArrayLike(expr):
          return Ext.make.array(expr.items, meta)
        /**
         * **Note:**
         *
         * This case intentionally does _NOT_ throw when executed.
         *
         * That way if a user passes an `Ext` schema (a schema that has
         * _already_ been transformed into its intermediate representation),
         * {@link fromSchema `Ext.fromSchema`} behaves like the identity function.
         */
        default:
          return fn.softExhaustiveCheck(expr)
      }
    }
  }

  export const count = Ext.fold(Ext.Algebra.count)
  export const depth = Ext.fold(Ext.Algebra.depth)
  export const paths = Ext.fold(Ext.Algebra.paths)
  // TODO: fix this type! the problem is that `lax` has not been fully instantiated.
  export const fromSchema: <const T>(term: T) => fromSchema<T> = Ext.unfold(Ext.Coalgebra.fromSchema) as never

  export type fromSchema<T> = T extends Ltd.Scalar
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
