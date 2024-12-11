import { type Functor, fn, map, object } from "@traversable/data"
import { type Kind as HKT, type kind, newtype, type Omit, symbol } from "@traversable/registry";
import { type Scalar, type ScalarNode, Schema } from "./types.js"

export type URI = typeof URI[keyof typeof URI]
export const URI = object.pick(
  symbol, 
  "union",
  "disjoint",
  "intersection",
  "null",
  "boolean",
  "integer",
  "number",
  "string",
  "array",
  "object",
  "record",
  "tuple",
)

const lookup = {
  null: symbol.null,
  boolean: symbol.boolean,
  integer: symbol.integer,
  number: symbol.number,
  string: symbol.string,
  array: symbol.array,
  tuple: symbol.tuple,
  record: symbol.record,
  object: symbol.object,
  anyOf: symbol.union,
  oneOf: symbol.disjoint,
  intersection: symbol.intersection,
} as const

export type Tag =
  | { [symbol.tag]: symbol.null, type: "null", }
  | { [symbol.tag]: symbol.boolean, type: "boolean" }
  | { [symbol.tag]: symbol.number, type: "number" }
  | { [symbol.tag]: symbol.integer, type: "integer" }
  | { [symbol.tag]: symbol.string, type: "string" }
  | { [symbol.tag]: symbol.tuple, type: "array", prefixItems: readonly Tag[] }
  | { [symbol.tag]: symbol.object, type: "object", properties: { [x: string]: Tag } }
  | { [symbol.tag]: symbol.array, type: "array", items: Tag }
  | { [symbol.tag]: symbol.record, type: "object", additionalProperties: Tag }
  | { [symbol.tag]: symbol.intersection, allOf: readonly Tag[] }
  | { [symbol.tag]: symbol.union, anyOf: readonly Tag[] }
  | { [symbol.tag]: symbol.disjoint, oneOf: readonly Tag[] }
  ;

export declare namespace Tag { export { with_ as with } }
export declare namespace Tag {
  type with_<S, Tag extends symbol = symbol> = S & { [symbol.tag]: Tag }
  type G<T extends F<unknown> = F<unknown>> = T
  type F<T> =
    | { [symbol.tag]: symbol.null, type: "null", }
    | { [symbol.tag]: symbol.boolean, type: "boolean" }
    | { [symbol.tag]: symbol.number, type: "number" }
    | { [symbol.tag]: symbol.integer, type: "integer" }
    | { [symbol.tag]: symbol.string, type: "string" }
    | { [symbol.tag]: symbol.tuple, type: "array", prefixItems: readonly Tag.F<T>[], items?: false | Tag.F<T> }
    | { [symbol.tag]: symbol.object, type: "object", properties: { [x: string]: Tag.F<T> } }
    | { [symbol.tag]: symbol.array, type: "array", items: Tag.F<T> }
    | { [symbol.tag]: symbol.record, type: "object", additionalProperties: Tag.F<T>, properties?: { [x: string]: Tag.F<T> } }
    | { [symbol.tag]: symbol.intersection, allOf: readonly Tag.F<T>[] }
    | { [symbol.tag]: symbol.union, anyOf: readonly Tag.F<T>[] }
    | { [symbol.tag]: symbol.disjoint, oneOf: readonly Tag.F<T>[] }
    ;
  type rm<T> 
    = T extends Scalar ? T 
    : T extends ScalarNode ? Omit<T, symbol.tag>
    : Omit<{ [x in keyof T]: Tag.rm<T[x]> }, symbol.tag>
    ;
  interface of<T> extends newtype<Extract<T, Schema>> {}
  function of<const T extends Schema>(x: T): Tag.of<T>
}

interface K extends Kind { ["~1"]: TagF<this["~0"]> }

function fmap<S, T>(f: (s: S) => T): (x: Schema.F<S>) => Schema.F<T> 
function fmap<S, T>(f: (s: S) => T) {
  return (x: Schema.F<S>) => {
    if (!("type" in x)) switch (true) {
      default: return fn.exhaustive(x)
      case "allOf" in x: return { allOf: x.allOf.map(f) }
      case "anyOf" in x: return { anyOf: x.anyOf.map(f) }
      case "oneOf" in x: return { oneOf: x.oneOf.map(f) }
    }
    else switch (true) {
      case x.type === "null": return x
      case x.type === "boolean": return x
      case x.type === "integer": return x
      case x.type === "number": return x
      case x.type === "string": return x
      case x.type === "array": return {
        ...x,
        ...Schema.isNonFinite(x) && { items: f(x.items) },
        ...Schema.isFinite(x) && { 
          prefixItems: map(x.prefixItems, f), 
          ..."items" in x && { items: map(x.items, f) },
        },
      }
      case x.type === "object": return {
        ...x,
        ...Schema.isFinite(x) && { properties: map(x.properties, f) },
        ...Schema.isNonFinite(x) && { 
          additionalProperties: f(x.additionalProperties),  
          ..."properties" in x && { properties: map(x.properties, f) }
        },
      }
      default: return fn.exhaustive(x)
    }
  }
}

class Fix<F extends Kind> {
  constructor(unfix: )
}


// export function tagAlgebra<T extends >(xs: Schema.F<T>): T
export function tagAlgebra<T, const U extends Schema.F<T>>(xs: U) {
  if (!("type" in xs)) return { 
    ...xs, 
    [symbol.tag]
      : "allOf" in xs ? symbol.intersection
      : "anyOf" in xs ? symbol.union
      : "oneOf" in xs ? symbol.disjoint
      : fn.exhaustive(xs)
  }
  else switch (true) {
    default: return fn.exhaustive(xs)
    case xs.type === "null": return { ...xs, [symbol.tag]: symbol.null }
    case xs.type === "boolean": return { ...xs, [symbol.tag]: symbol.boolean }
    case xs.type === "integer": return { ...xs, [symbol.tag]: symbol.integer }
    case xs.type === "number": return { ...xs, [symbol.tag]: symbol.number }
    case xs.type === "string": return { ...xs, [symbol.tag]: symbol.string }
    case xs.type === "array": return { ...xs, [symbol.tag]: Schema.isFinite(xs) ? symbol.tuple : symbol.array }
    case xs.type === "object": return { ...xs, [symbol.tag]: Schema.isFinite(xs) ? symbol.object : symbol.record }
  }
}

export function untagAlgebra<T>(x: Tag.F<T>): Tag.rm<T>
export function untagAlgebra<T>(x: Tag.F<T>) { 
  delete x[symbol.tag as never]
  return x
}

export interface Kind extends HKT { ["~1"]: Schema.F<this["~0"]> }
export const functor: Functor<Kind> = { map: fmap }

export function cata<T>(algebra: Functor.Algebra<Kind, T>): (term: Schema) => T {
  return function loop(term: Schema): T { 
    return algebra(fmap(loop)(term))
  }
}

interface TagKind extends HKT<Schema> { 
  ["~1"]
  : [this["~0"], keyof this["~0"]] extends 
  | [Schema & infer T extends Schema, infer K extends keyof any] 
  ? T extends { type: infer Type extends keyof typeof lookup } 
    ? Type extends "object" ? "additionalProperties" extends keyof T 
      ? Tag.of<T & { [symbol.tag]: symbol.record }>
      : Tag.of<T & { [symbol.tag]: symbol.object }>
    : Type extends "array" ? "prefixItems" extends keyof T 
      ? Tag.of<T & { [symbol.tag]: symbol.tuple }>
      : Tag.of<T & { [symbol.tag]: symbol.array }>
      : Tag.of<T & { [symbol.tag]: typeof lookup[T["type"]] }>
    : K extends keyof typeof lookup 
      ? Tag.of<T & { [symbol.tag]: typeof lookup[K] }>
    : ["COULD NOT INFER A TAG FOR:", T]
  : never
}
export const tag 
  : <const T extends Schema>(schema: T) => HKT.apply<TagKind, T>
  = cata(tagAlgebra)

export const untag
  : <const T>(term: Tag.F<T>) => Tag.rm<T>
  // TODO: fix these (use ana maybe?)
  = cata(untagAlgebra as never) as never
