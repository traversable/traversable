import { Functor, fn, object } from "@traversable/data"
import { type Kind, symbol } from "@traversable/registry";
import type { Bind, Bounded, Omit, Scalar, ScalarNode } from "./types.js"

import Algebra = Functor.Algebra

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


export type Untag<T> 
  = T extends Scalar ? T 
  : T extends ScalarNode ? Omit<T, symbol.tag>
  : Omit<{ [x in keyof T]: Untag<T[x]> }, symbol.tag>
  ;
export type TagWith<S, Tag extends symbol = symbol> = S & { [symbol.tag]: Tag }
export type Tag =
  | { [symbol.tag]: symbol.null, type: "null", }
  | { [symbol.tag]: symbol.boolean, type: "boolean" }
  | { [symbol.tag]: symbol.number, type: "number" }
  | { [symbol.tag]: symbol.integer, type: "integer" }
  | { [symbol.tag]: symbol.string, type: "string" }
  | { [symbol.tag]: symbol.tuple, type: "array", prefixItems: readonly Tag[], items?: Tag }
  | { [symbol.tag]: symbol.object, type: "object", properties: { [x: string]: Tag } }
  | { [symbol.tag]: symbol.array, type: "array", items: Tag }
  | { [symbol.tag]: symbol.record, type: "object", additionalProperties: Tag, properties?: { [x: string]: Tag } }
  | { [symbol.tag]: symbol.intersection, allOf: readonly Tag[] }
  | { [symbol.tag]: symbol.union, anyOf: readonly Tag[] }
  | { [symbol.tag]: symbol.disjoint, oneOf: readonly Tag[] }
  ;

export type TagF<T> =
  | { [symbol.tag]: symbol.null, type: "null", }
  | { [symbol.tag]: symbol.boolean, type: "boolean" }
  | { [symbol.tag]: symbol.number, type: "number" }
  | { [symbol.tag]: symbol.integer, type: "integer" }
  | { [symbol.tag]: symbol.string, type: "string" }
  | { [symbol.tag]: symbol.tuple, type: "array", prefixItems: readonly TagF<T>[], items?: false | TagF<T> }
  | { [symbol.tag]: symbol.object, type: "object", properties: { [x: string]: TagF<T> } }
  | { [symbol.tag]: symbol.array, type: "array", items: TagF<T> }
  | { [symbol.tag]: symbol.record, type: "object", additionalProperties: TagF<T>, properties?: { [x: string]: TagF<T> } }
  | { [symbol.tag]: symbol.intersection, allOf: readonly TagF<T>[] }
  | { [symbol.tag]: symbol.union, anyOf: readonly TagF<T>[] }
  | { [symbol.tag]: symbol.disjoint, oneOf: readonly TagF<T>[] }
  ;

interface K extends Kind { ["~1"]: TagF<this["~0"]> }

function bmap<S, T>(f: (s: S) => T): (x: Bind<S>) => Bind<T> 
function bmap<S, T>(f: (s: S) => T) {
  return (x: Bind<S>) => {
    if (!("type" in x)) switch (true) {
      default: return fn.exhaustive(x)
      case "allOf" in x: return { allOf: x.allOf.map(f) }
      case "anyOf" in x: return { anyOf: x.anyOf.map(f) }
      case "oneOf" in x: return { oneOf: x.oneOf.map(f) }
    }
    else switch (true) {
      default: return fn.exhaustive(x)
      case x.type === "null": return x as { type: "null" }
      case x.type === "boolean": return x as { type: "boolean" }
      case x.type === "integer": return x as { type: "integer" }
      case x.type === "number": return x as { type: "number" }
      case x.type === "string": return x as { type: "string" }
      case x.type === "array": return {
        ...x,
        items: ([] as S[]).concat(x.items).map(f),
      }
      case x.type === "object": return {
        ...x,
        ...x.additionalProperties && f(x.additionalProperties),
        properties: Object.fromEntries(Object.entries(x.properties).map(([k, v]) => [k, f(v)])),
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

export function tagAlgebra<T>(xs: Bind<T>): T
export function tagAlgebra<T>(xs: Bind<T>) {
  if (!("type" in xs)) switch (true) {
    default: return fn.exhaustive(xs)
    case "allOf" in xs: return assignTag(xs, symbol.intersection)
    case "anyOf" in xs: return assignTag(xs, symbol.union)
    case "oneOf" in xs: return assignTag(xs, symbol.disjoint)
  }
  else switch (true) {
    default: return fn.exhaustive(xs)
    case xs.type === "null": return assignTag(xs, symbol.null)
    case xs.type === "boolean": return assignTag(xs, symbol.boolean)
    case xs.type === "integer": return assignTag(xs, symbol.integer)
    case xs.type === "number": return assignTag(xs, symbol.number)
    case xs.type === "string": return assignTag(xs, symbol.string)
    case xs.type === "array": 
      return assignTag(xs, Array_isArray(xs.items) ? symbol.tuple : symbol.array)
    case xs.type === "object": {
      return assignTag(xs, "additionalProperties" in xs ? symbol.record : symbol.object)
    }
  }
}

export function untagAlgebra<T>(x: TagF<T>): Untag<T>
export function untagAlgebra<T>(x: TagF<T>) { 
  delete x[symbol.tag as never]
  return x
}

// TODO: might not need this
export interface Binder extends Kind { ["~1"]: Bind<this["~0"]> }
// TODO: might not need this
export const functor: Functor<Binder> = { map: bmap }

export function cata<T>(algebra: Algebra<Binder, T>): (term: Bounded) => T {
  return function loop(term: Bounded): T { 
    return algebra(bmap(loop)(term))
  }
}

export const tag 
  : <const T extends Bounded>(term: T) => TagF<T>
  = cata(tagAlgebra)

export const untag
  : <const T>(term: TagF<T>) => Untag<T>
  // TODO: fix these (use ana maybe?)
  = cata(untagAlgebra as never) as never
