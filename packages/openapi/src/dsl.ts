import { fn, map, object, type prop } from "@traversable/data"
import type { Functor } from "@traversable/registry"

import { Schema } from "./schema/exports.js"
import { type Kind, type Tag, symbol } from "./tag.js"

/** @internal */
const Object_entries = globalThis.Object.entries

const Tags = [
  "Array",
  "Disjoint",
  "Index",
  "Intersection",
  "Key",
  "Nullable",
  "Optional",
  "Record",
  "Union",
] as const satisfies string[]

type TAG = typeof TAG[keyof typeof TAG]
const TAG = object.fromKeys(Tags)
const LOOKUP = {
  [TAG.Array]: symbol.array,
  [TAG.Index]: symbol.numeric_index,
  [TAG.Intersection]: symbol.intersection,
  [TAG.Key]: symbol.string_index,
  [TAG.Nullable]: symbol.nullable,
  [TAG.Optional]: symbol.optional,
  [TAG.Record]: symbol.record,
  [TAG.Union]: symbol.union,
  [TAG.Disjoint]: symbol.disjoint,
} as const satisfies { [K in typeof Tags[number]]: symbol }
const REVERSE = object.invert(LOOKUP)

const Positions = [
  "INFIX", 
  "PREFIX", 
  "POSTFIX"
] as const satisfies string[] 
type POS = typeof POS[keyof typeof POS]
const POS = object.fromKeys(Positions)

const Arities = [0, 1] as const satisfies number[]
type ARITY = typeof ARITY[keyof typeof ARITY]
const ARITY = {
  [0]: "Nullary",
  [1]: "Unary",
} as const satisfies Record<Extract<keyof typeof Arities, `${number}`>, string>

interface Sigil<
  Tag extends TAG = TAG,
  V extends string = string,
  Pos extends POS = POS,
  Arity extends ARITY = ARITY
> {
  _tag: Tag
  value: V
  pos: Pos
  arity: Arity
}

function sigil<
  Tag extends TAG,
  V extends string,
  Pos extends POS,
  Arity extends ARITY
>(_tag: Tag, value: V, pos: Pos, arity: Arity): Sigil<Tag, V, Pos, Arity> 
  { return { _tag, value, pos, arity } }

export const SIGIL = {
  [TAG.Array]: sigil(TAG.Array, "[number]", POS.POSTFIX, ARITY[0]),
  [TAG.Disjoint]: sigil(TAG.Disjoint, "(::$0)", POS.INFIX, ARITY[0]),
  [TAG.Index]: sigil(TAG.Index, "[$0]", POS.INFIX, ARITY[1]),
  [TAG.Intersection]: sigil(TAG.Intersection, "(&:$0)]", POS.INFIX, ARITY[1]),
  [TAG.Key]: sigil(TAG.Key, '["$0"]', POS.INFIX, ARITY[1]),
  [TAG.Nullable]: sigil(TAG.Nullable, "?.", POS.PREFIX, ARITY[0]),
  [TAG.Optional]: sigil(TAG.Optional, "?", POS.PREFIX, ARITY[0]),
  [TAG.Record]: sigil(TAG.Record, "[string]", POS.POSTFIX, ARITY[0]),
  [TAG.Union]: sigil(TAG.Union, "(|:$0)", POS.INFIX, ARITY[1]),
} as const satisfies { [K in TAG]: Sigil<K> }

function dmap<S, T>(f: (s: S) => T): (s: Schema.F<S>) => Schema.F<T>
function dmap<S, T>(f: (s: S) => T) {
  return (x: Schema.F<S>) => {
    switch (true) {
      case Schema.isNull(x): return x
      case Schema.isBoolean(x): return x
      case Schema.isInteger(x): return x
      case Schema.isNumber(x): return x
      case Schema.isString(x): return x
      case Schema.isAllOf(x): return { ...x, allOf: map(x.allOf, f) }
      case Schema.isAnyOf(x): return { ...x, anyOf: map(x.anyOf, f) }
      case Schema.isOneOf(x): return { ...x, oneOf: map(x.oneOf, f) }
      case Schema.isTuple(x): return { ...x, items: map(x.items, f) }
      case Schema.isArray(x): return { ...x, items: f(x.items) }
      case Schema.isObject(x): return {
        ...x,
        ...x.additionalProperties && { additionalProperties: f(x.additionalProperties) },
        properties: map(x.properties, f),
      }
      case Schema.isRecord(x): 
        return { ...x, additionalProperties: f(x.additionalProperties) }
      default: return fn.exhaustive(x)
    }
  }
}

export function cata<T>(algebra: Functor.Algebra<Kind, T>): (term: Schema.any) => T {
  return function loop(term: Schema.any): T { 
    return algebra(dmap(loop)(term))
  }
}

const pathsAlgebra = (x: Tag.F<readonly (readonly prop.any[])[]>) => {
  switch (true) {
    // return x
    default: return x // fn.exhaustive(x)
    case x[symbol.tag] === symbol.null: return x.type
    case x[symbol.tag] === symbol.boolean: return x.type
    case x[symbol.tag] === symbol.integer: return x.type
    case x[symbol.tag] === symbol.number: return x.type
    case x[symbol.tag] === symbol.string: return x.type
    case x[symbol.tag] === symbol.array: return [x.items, symbol.array]
    case x[symbol.tag] === symbol.tuple: return x.items.map((xs) => [xs, symbol.array])
    case x[symbol.tag] === symbol.record: return map(x.additionalProperties, ((v, k) => [].concat(k as never).concat()))
  }
}

// case x[symbol.tag] === symbol.union: return x.anyOf.map(([h, ...t]) => [h, ...t, symbol.union])
// case x[symbol.tag] === symbol.disjoint: return x.oneOf.map(([h, ...t]) => [h, ...t.slice(0, -1), symbol.disjoint, t[t.length - 1]])
// case x[symbol.tag] === symbol.intersection: return x.allOf.map(([h, ...t]) => [h, ...t.slice(0, -1), symbol.intersection, t[t.length - 1]])
// case x[symbol.tag] === symbol.object: return [].concat(x.properties).map(([k, v]) => )
// Object_entries(x.properties), map((v, k) => [].concat(k).concat(v))
//  return [].concat(json).map(
//           ([k, x]) => {
//             return x.map((y) => isLeaf(y) ? [y, k] : [k].concat(y))
//           }
//         )
// [].concat(k).concat(v)))

export const paths
  // : (x: unknown) => array.of<unknown>
  = cata(pathsAlgebra as never)



// // export function pathsAlgebra<const T>(x: Tag.F<T>): Tag.infer<T> 
// // export function pathsAlgebra(x: Tag.F<(keyof any)[]>) {
// //   switch (true) {
// //     // return x
// //     case x[symbol.tag] === symbol.null: return [x.type]
// //     case x[symbol.tag] === symbol.boolean: return [x.type]
// //     case x[symbol.tag] === symbol.integer: return [x.type]
// //     case x[symbol.tag] === symbol.number: return [x.type]
// //     case x[symbol.tag] === symbol.string: return [x.type]
    
// //     // case x[symbol.tag] === symbol.union: return x.anyOf.map(([h, ...t]) => [h, ...t, symbol.union])
// //     // case x[symbol.tag] === symbol.disjoint: return x.oneOf.map(([h, ...t]) => [h, ...t.slice(0, -1), symbol.disjoint, t[t.length - 1]])
// //     // // case x[symbol.tag] === symbol.intersection: return x.allOf.map(([h, ...t]) => [h, ...t.slice(0, -1), symbol.intersection, t[t.length - 1]])
// //     // case x[symbol.tag] === symbol.array: return ([] as (typeof x.items)[]).concat([x.items, symbol.array])
// //     // case x[symbol.tag] === symbol.tuple: return x.items.map(([h, ...t]) => [h, ...t.slice(0, -1), symbol.array, t[t.length - 1]])
// //     // case x[symbol.tag] === symbol.record: return Object_entries(x.additionalProperties).map(([k, v]) => [].concat(k as never).concat())
// //     case x[symbol.tag] === symbol.object: return fn.pipe(
// //       x.properties,
// //       map((p) => [...p])

// //     )
// //     default: return x // fn.exhaustive(x)
// //   }
// // }

// export const paths
//   // : (x: unknown) => array.of<unknown>
//   = cata(pathsAlgebra)

// const z = paths({ type: "array", items: [{ type: "string" }] })
