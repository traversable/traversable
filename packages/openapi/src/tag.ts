import { fn, map, object } from "@traversable/data"
import type { Functor, Kind as HKT, Omit, newtype } from "@traversable/registry";
import { symbol } from "@traversable/registry"
export { symbol } from "@traversable/registry"

import { Schema } from "./schema/exports.js"
import type { Scalar, Schema_scalar } from "./types.js"

/** @internal */
const Array_isArray 
  : <T>(u: unknown) => u is readonly T[]
  = globalThis.Array.isArray

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
  : T extends Schema.scalar ? Omit<T, symbol.tag>
  : Omit<{ [x in keyof T]: Untag<T[x]> }, symbol.tag>
  ;
export type TagWith<S, Tag extends symbol = symbol> = S & { [symbol.tag]: Tag }
export type Tag =
  | Tag.null
  | Tag.boolean
  | Tag.integer
  | Tag.number
  | Tag.string
  | Tag.intersection
  | Tag.union
  | Tag.disjoint
  | Tag.record
  | Tag.tuple
  | Tag.array
  | Tag.object
  ;

export declare namespace Tag { 
  export {
    infer_ as infer, 
    with_ as with,
    Tag_null as null,
    Tag_boolean as boolean,
    Tag_integer as integer,
    Tag_number as number,
    Tag_string as string,
    Tag_intersection as intersection,
    Tag_union as union,
    Tag_disjoint as disjoint,
    Tag_record as record,
    Tag_tuple as tuple,
    Tag_array as array,
    Tag_object as object,
  }
}
export declare namespace Tag {
  interface Tag_null { [symbol.tag]: symbol.null, type: "null", }
  interface Tag_boolean { [symbol.tag]: symbol.boolean, type: "boolean" }
  interface Tag_integer { [symbol.tag]: symbol.integer, type: "integer" }
  interface Tag_number { [symbol.tag]: symbol.number, type: "number" }
  interface Tag_string { [symbol.tag]: symbol.string, type: "string" }
  interface Tag_intersection { [symbol.tag]: symbol.intersection, allOf: readonly Tag[] }
  interface Tag_union { [symbol.tag]: symbol.union, anyOf: readonly Tag[] }
  interface Tag_disjoint { [symbol.tag]: symbol.disjoint, oneOf: readonly Tag[] }
  interface Tag_array { [symbol.tag]: symbol.array, type: "array", items: Tag }
  interface Tag_record { [symbol.tag]: symbol.record, type: "object", additionalProperties: Tag, properties?: { [x: string]: Tag } }
  interface Tag_tuple { [symbol.tag]: symbol.tuple, type: "array", items: readonly Tag[] }
  interface Tag_object { [symbol.tag]: symbol.object, type: "object", properties: { [x: string]: Tag } }

  interface intersectionF<R> { [symbol.tag]: symbol.intersection, allOf: readonly R[] }
  interface unionF<R> { [symbol.tag]: symbol.union, anyOf: readonly R[] }
  interface disjointF<R> { [symbol.tag]: symbol.disjoint, oneOf: readonly R[] }
  interface arrayF<R> { [symbol.tag]: symbol.array, type: "array", items: R }
  interface recordF<R> { [symbol.tag]: symbol.record, type: "object", additionalProperties: R, properties?: { [x: string]: R } }
  interface tupleF<R> { [symbol.tag]: symbol.tuple, type: "array", items: readonly R[] }
  interface objectF<R> { [symbol.tag]: symbol.object, type: "object", properties: { [x: string]: R } }

  type with_<S, Tag extends symbol = symbol> = S & { [symbol.tag]: Tag }
  type infer_<T> = T extends Tag.F<infer U> ? U : T
  type G<T extends F<unknown> = F<unknown>> = T
  type F<T = unknown> =
    | { [symbol.tag]: symbol.null, type: "null", }
    | { [symbol.tag]: symbol.boolean, type: "boolean" }
    | { [symbol.tag]: symbol.number, type: "number" }
    | { [symbol.tag]: symbol.integer, type: "integer" }
    | { [symbol.tag]: symbol.string, type: "string" }
    | { [symbol.tag]: symbol.tuple, type: "array", items: readonly T[] }
    | { [symbol.tag]: symbol.object, type: "object", properties: { [x: string]: T } }
    | { [symbol.tag]: symbol.array, type: "array", items: T }
    | { [symbol.tag]: symbol.record, type: "object", additionalProperties: T, properties?: { [x: string]: T } }
    | { [symbol.tag]: symbol.intersection, allOf: readonly T[] }
    | { [symbol.tag]: symbol.union, anyOf: readonly T[] }
    | { [symbol.tag]: symbol.disjoint, oneOf: readonly T[] }
    ;
  type rm<T> 
    = T extends Scalar ? T 
    : T extends Schema_scalar ? Omit<T, symbol.tag>
    : Omit<{ [x in keyof T]: Tag.rm<T[x]> }, symbol.tag>
    ;
  interface of<T> extends newtype<Extract<T, Schema.any>> {}
  function of<const T extends Schema.any>(x: T): Tag.of<T>
}

function bmap<S, T>(f: (s: S) => T): (x: Schema.F<S>) => Schema.F<T> 
function bmap<S, T>(f: (s: S) => T) {
  return (x: Schema.F<S>) => {
    if (!("type" in x)) switch (true) {
      case "allOf" in x: return { allOf: x.allOf.map(f) }
      case "anyOf" in x: return { anyOf: x.anyOf.map(f) }
      case "oneOf" in x: return { oneOf: x.oneOf.map(f) }
      default: return fn.exhaustive(x)
    }
    else switch (true) {
      default: return fn.exhaustive(x)
      case x.type === "null": return x
      case x.type === "boolean": return x
      case x.type === "integer": return x
      case x.type === "number": return x
      case x.type === "string": return x
      case x.type === "array": return {
        ...x,
        items: Array_isArray(x.items) ? map(x.items, f) : f(x.items)
      }
      case x.type === "object": return {
        ...x,
        ..."properties" in x && { properties: map(x.properties, f) },
        ...x.additionalProperties && { additionalProperties: f(x.additionalProperties) },
      }
    }
  }
}

export function tagAlgebra<T>(xs: Schema.F<T>): T
export function tagAlgebra<T>(xs: Schema.F<T>) {
  if (!("type" in xs)) switch (true) {
    default: return fn.exhaustive(xs)
    case "allOf" in xs: return { ...xs, [symbol.tag]: symbol.intersection }
    case "anyOf" in xs: return { ...xs, [symbol.tag]: symbol.intersection }
    case "oneOf" in xs: return { ...xs, [symbol.tag]: symbol.disjoint }
  }
  else switch (true) {
    default: return fn.exhaustive(xs)
    case xs.type === "null": return { ...xs, [symbol.tag]: symbol.null }
    case xs.type === "boolean": return { ...xs, [symbol.tag]: symbol.boolean }
    case xs.type === "integer": return { ...xs, [symbol.tag]: symbol.integer }
    case xs.type === "number": return { ...xs, [symbol.tag]: symbol.number }
    case xs.type === "string": return { ...xs, [symbol.tag]: symbol.string }
    case xs.type === "array": return { ...xs, [symbol.tag]: Schema.isTuple(xs) ? symbol.tuple : symbol.array }
    case xs.type === "object": return { ...xs, [symbol.tag]: Schema.isRecord(xs) ? symbol.record : symbol.object }
  }
}

export function untagAlgebra<T>(x: Tag.F<T>): Untag<T>
export function untagAlgebra<T>(x: Tag.F<T>): T
export function untagAlgebra<T>({ [symbol.tag]: _, ...x }: Tag.F<T>) 
  { return x }

export interface Kind extends HKT { ["~1"]: Schema.F<this["~0"]> }
export const functor: Functor<Kind> = { map: bmap }
export const ana = fn.morphism.ana(functor)


export function cata<T>(algebra: Functor.Algebra<Kind, T>): (term: Schema.any) => T {
  return function loop(term: Schema.any): T { 
    return algebra(bmap(loop)(term))
  }
}
/**
 * function ana<T>(coalgebra: Functor.Coalgebra<Kind, T>) {
 *   return function loop(term: T): HKT.apply<F, F> {
 *     return F.map(loop)(coalgebra(term))
 *   }
 * }
 */

export const tag 
  : <const T extends Schema.any>(term: T) => Tag.F<T>
  = cata(tagAlgebra)


export const untag
  : <const T>(term: Tag.F<T>) => Untag<T>
  // TODO: fix these
  = cata(untagAlgebra as never) as never
