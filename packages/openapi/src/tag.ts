import { fn, map, object } from "@traversable/data"
import { symbol } from "@traversable/registry";

import type { UpperBound } from "./types.js"

/** @internal */
const Array_isArray 
  : <T>(u: unknown) => u is readonly T[]
  = globalThis.Array.isArray
/** @internal */
const Object_defineProperty = globalThis.Object.defineProperty

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

export type TagWith<S, Tag extends symbol = symbol> = S & { [symbol.tag]: Tag }
export type Tagged =
  | { [symbol.tag]: symbol.null, type: "null", }
  | { [symbol.tag]: symbol.boolean, type: "boolean" }
  | { [symbol.tag]: symbol.number, type: "number" }
  | { [symbol.tag]: symbol.integer, type: "integer" }
  | { [symbol.tag]: symbol.string, type: "string" }
  | { [symbol.tag]: symbol.tuple, type: "array", prefixItems: readonly Tagged[], items?: Tagged }
  | { [symbol.tag]: symbol.object, type: "object", properties: { [x: string]: Tagged } }
  | { [symbol.tag]: symbol.array, type: "array", items: Tagged }
  | { [symbol.tag]: symbol.record, type: "object", additionalProperties: Tagged, properties?: { [x: string]: Tagged } }
  | { [symbol.tag]: symbol.intersection, allOf: readonly Tagged[] }
  | { [symbol.tag]: symbol.union, anyOf: readonly Tagged[] }
  | { [symbol.tag]: symbol.disjoint, oneOf: readonly Tagged[] }
  ;

export type Fixed<T> =
  | { [symbol.tag]: symbol.null, type: "null", }
  | { [symbol.tag]: symbol.boolean, type: "boolean" }
  | { [symbol.tag]: symbol.number, type: "number" }
  | { [symbol.tag]: symbol.integer, type: "integer" }
  | { [symbol.tag]: symbol.string, type: "string" }
  | { [symbol.tag]: symbol.tuple, type: "array", prefixItems: readonly Fixed<T>[], items?: false | Fixed<T> }
  | { [symbol.tag]: symbol.object, type: "object", properties: { [x: string]: Fixed<T> } }
  | { [symbol.tag]: symbol.array, type: "array", items: Fixed<T> }
  | { [symbol.tag]: symbol.record, type: "object", additionalProperties: Fixed<T>, properties?: { [x: string]: Fixed<T> } }
  | { [symbol.tag]: symbol.intersection, allOf: readonly Fixed<T>[] }
  | { [symbol.tag]: symbol.union, anyOf: readonly Fixed<T>[] }
  | { [symbol.tag]: symbol.disjoint, oneOf: readonly Fixed<T>[] }
  ;

function kmap<S, T>(f: (s: S) => T): (x: Fixed<S>) => Fixed<T>
function kmap<S, T>(f: (s: Fixed<S>) => Fixed<T>) {
  return (x: Fixed<S>) => {
    switch (true) {
      default: return x // fn.exhaustive(x)
      case x[symbol.tag] === symbol.null: 
      case x[symbol.tag] === symbol.boolean: 
      case x[symbol.tag] === symbol.integer: 
      case x[symbol.tag] === symbol.number: 
      case x[symbol.tag] === symbol.string: return x
      case x[symbol.tag] === symbol.disjoint: return map(x.oneOf, f)
      case x[symbol.tag] === symbol.union: return map(x.anyOf, f)
      case x[symbol.tag] === symbol.intersection: return map(x.allOf, f)
      case x[symbol.tag] === symbol.array: return f(x.items)
      case x[symbol.tag] === symbol.tuple: 
        return map([...x.prefixItems, ...x.items ? [f(x.items)] : []], f)
      case x[symbol.tag] === symbol.object: return { 
        ...x, 
        properties: map(x.properties, f) 
      }
      case x[symbol.tag] === symbol.record: return { 
        ...x, 
        additionalProperties: f(x.additionalProperties),
        ...x.properties && { properties: map(x.properties, f) },
      }
    }
  }
}

function assignTag<T, Tag extends symbol>(x: T, tag: Tag): TagWith<T, Tag>
function assignTag(x: unknown, sym: symbol) {
  return Object_defineProperty(
    x,
    symbol.tag,
    { value: sym, configurable: true, enumerable: true, writable: false }
  )
}

export function algebra(xs: Fixed<Tagged>): Fixed<Tagged>
export function algebra(xs: Fixed<Tagged>) {
  console.log("xs in tag algebra", xs)
  if (!("type" in xs)) switch (true) {
    default: return xs // fn.exhaustive(xs)
    case "allOf" in xs: return assignTag(xs, symbol.intersection)
    case "anyOf" in xs: return assignTag(xs, symbol.union)
    case "oneOf" in xs: return assignTag(xs, symbol.disjoint)
  }
  else switch (true) {
    default: return xs // fn.exhaustive(xs)
    case xs.type === "null": return assignTag(xs, symbol.null)
    case xs.type === "boolean": return assignTag(xs, symbol.boolean)
    case xs.type === "integer": return assignTag(xs, symbol.integer)
    case xs.type === "number": return assignTag(xs, symbol.number)
    case xs.type === "string": return assignTag(xs, symbol.string)
    case xs.type === "array": 
      return assignTag(xs, Array_isArray(xs.items) ? symbol.tuple : symbol.array)
    case xs.type === "object": {
      console.log("xs.type === \"object\"", xs)
      return assignTag(xs, "additionalProperties" in xs ? symbol.record : symbol.object)
    }
  }
}

// export { Functor_ as Functor }
// TODO: fix this with `Fix`
interface Functor_<T extends Tagged = Tagged> {}
const Functor_: Functor_ = { map: kmap as never }

export const tag 
  : (x: UpperBound) => Fixed<Tagged>
  // TODO: fix this with `Fix`
  = fn.morphism.cata(Functor_ as never)(algebra as never)
