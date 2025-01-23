import { fn, map } from "@traversable/data";
import type { Functor, HKT, Kind } from "@traversable/registry";

type Traversable = Traversable.Recursive

declare namespace Meta {
  interface Base {}
  interface Numeric {
    minimum?: number
    maximum?: number
    exclusiveMinimum?: boolean | number
    exclusiveMaximum?: boolean | number
    multipleOf?: number
  }
  interface Sequence {
    minLength?: number
    maxLength?: number
  }
}

declare namespace Traversable {
  interface Null { type: "null" }
  interface Boolean { type: "boolean" }
  namespace Boolean {
    interface Meta extends Meta.Base {}
  }
  interface Integer { type: "integer" }
  namespace Integer {
    interface Meta extends Meta.Base, Meta.Numeric {}
  }
  interface Number { type: "number" }
  namespace Number {
    interface Meta extends Meta.Base, Meta.Numeric {}
  }
  interface String { type: "string" }
  interface Const<V = unknown> { type: "const", value: V }
  namespace Const { interface F extends HKT { [-1]: Traversable.Const<this[0]> } }
  interface AnyOf<R> { type: "anyOf", anyOf: readonly R[] }
  namespace AnyOf { interface F extends HKT { [-1]: Traversable.AnyOf<this[0]> } }
  interface AllOf<R> { type: "allOf", allOf: readonly R[] }
  namespace AllOf { interface F extends HKT { [-1]: Traversable.AllOf<this[0]> } }
  interface OneOf<R> { type: "oneOf", oneOf: readonly R[] }
  namespace OneOf { interface F extends HKT { [-1]: Traversable.OneOf<this[0]> } }
  interface Tuple<R> { type: "tuple", items: readonly R[] }
  namespace Tuple { interface F extends HKT { [-1]: Traversable.Tuple<this[0]> } }
  interface Array<R> { type: "array", items: R }
  namespace Array { 
    interface F extends HKT { [-1]: Traversable.Array<this[0]> } 
    interface Meta extends Meta.Base, Meta.Sequence {}
  }
  interface Record<R> { type: "record", additionalProperties: R }
  namespace Record { interface F extends HKT { [-1]: Traversable.Record<this[0]> } }
  interface Object<R> { type: "object", properties: { [x: string]: R } }
  namespace Object { interface F extends HKT { [-1]: Traversable.Object<this[0]> } }
  interface Lambda extends HKT { [-1]: Traversable.F<this[0]> }
  type F<R> =
    | Traversable.Null
    | Traversable.Boolean
    | Traversable.Integer
    | Traversable.Number
    | Traversable.String
    | Kind<Traversable.AllOf.F, R>
    | Kind<Traversable.AnyOf.F, R>
    | Kind<Traversable.OneOf.F, R>
    | Kind<Traversable.Array.F, R>
    | Kind<Traversable.Tuple.F, R>
    | Kind<Traversable.Record.F, R>
    | Kind<Traversable.Object.F, R>
    ;
  type Recursive = 
    | Traversable.Null
    | Traversable.Boolean
    | Traversable.Integer
    | Traversable.Number
    | Traversable.String
    | Traversable.AnyOf<Traversable.Recursive>
    | Traversable.AllOf<Traversable.Recursive>
    | Traversable.OneOf<Traversable.Recursive>
    | Traversable.Array<Traversable.Recursive>
    | Traversable.Record<Traversable.Recursive>
    | Traversable.Object<Traversable.Recursive>
    | Traversable.Tuple<Traversable.Recursive>
    ;
}
declare namespace Traversable {
  export { Functor_map as map }
}

export const Dict = {
  null: Traversable.Null,
  boolean: Traversable.Boolean,
  integer: Traversable.Integer,
  number: Traversable.Number,
  string: Traversable.String,
  anyOf: Traversable.AnyOf,
  allOf: Traversable.AllOf,
  oneOf: Traversable.OneOf,
  array: Traversable.Array,
  object: Traversable.Object,
  tuple: Traversable.Tuple,
  record: Traversable.Record
} as const satisfies Record<Traversable["type"], (x: never) => Traversable>

export const Order = [
  "null",
  "boolean",
  "integer",
  "number",
  "string",
  "anyOf",
  "oneOf",
  "array",
  "object",
  "tuple",
  "record",
] as const satisfies { [x: number]: Traversable["type"] }

const Functor_map
  : Functor<Traversable.Lambda, Traversable>["map"] 
  = (f) => (x) => {
    switch (x.type) {
      default: return fn.exhaustive(x)
      case "null": return Dict.null()
      case "boolean": return Dict.boolean()
      case "integer": return Dict.integer()
      case "number": return Dict.number()
      case "string": return Dict.string()
      case "anyOf": return Dict.anyOf(x.anyOf.map(f))
      case "allOf": return Dict.allOf(x.allOf.map(f))
      case "oneOf": return Dict.oneOf(x.oneOf.map(f))
      case "array": return Dict.array(f(x.items))
      case "object": return Dict.object(map(x.properties, f))
      case "tuple": return Dict.tuple(x.items.map(f))
      case "record": return Dict.record(f(x.additionalProperties))
    }
  }

function Traversable() {}
namespace Traversable {
  Traversable.map = Functor_map
  export const Functor: Functor<Traversable.Lambda, Traversable> = { map: Functor_map }
  export function Null(): Traversable.Null { return { type: "null" } }
  export function Boolean(): Traversable.Boolean { return { type: "boolean" } }
  export function Integer(): Traversable.Integer { return { type: "integer" } }
  export function Number(): Traversable.Number { return { type: "number" } }
  export function String(): Traversable.String { return { type: "string" } }
  export function AnyOf<R>(anyOf: readonly R[]): Traversable.AnyOf<R> { return { type: "anyOf", anyOf } }
  export function AllOf<R>(allOf: readonly R[]): Traversable.AllOf<R> { return { type: "allOf", allOf } }
  export function OneOf<R>(oneOf: readonly R[]): Traversable.OneOf<R> { return { type: "oneOf", oneOf } }
  export function Array<R>(items: R): Traversable.Array<R> { return { type: "array", items } }
  export function Record<R>(additionalProperties: R): Traversable.Record<R> { return { type: "record", additionalProperties } }
  export function Object<R>(properties: { [x: string]: R }): Traversable.Object<R> { return { type: "object", properties }}
  export function Tuple<R>(items: readonly R[]): Traversable.Tuple<R> { return { type: "tuple", items } }
}
