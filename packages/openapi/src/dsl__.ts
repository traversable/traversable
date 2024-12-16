import { type any, fn, map, object } from "@traversable/data"
import { deriveFromTags } from "@traversable/core"

import { Schema } from "./schema/exports.js"
import { Kind, type Tag, symbol, functor } from "./tag.js"
import { Kind as HKT, URI } from "@traversable/registry"
import type { Functor, newtype, Parameter } from "@traversable/registry"

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_values = globalThis.Object.values
/** @internal */
const Math_max = globalThis.Math.max

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

const is = deriveFromTags("_tag", Tags)<typeof SIGIL[keyof typeof SIGIL]>()
SIGIL[TAG.Disjoint]._tag

function fmap<S, T>(f: (s: S) => T): (s: Schema.F<S>) => Schema.F<T>
function fmap<S, T>(f: (s: S) => T) {
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
      case Schema.isTuple(x): return { ...x, items: x.items.map(f) }
      case Schema.isArray(x): return { ...x, items: f(x.items) }
      case Schema.isObject(x): return {
        ...x,
        ...x.additionalProperties && { additionalProperties: f(x.additionalProperties) },
        properties: map(x.properties, f),
      }
      case Schema.isRecord(x): 
        return { ...x, additionalProperties: f(x.additionalProperties) }
      default: return x // fn.exhaustive(x)
    }
  }
}

// export function cata<F extends Kind>(Functor: Functor<F>): 
//   <S, T>(algebra: (term: HKT.apply<F, S>) => T) 
//     => (term: HKT.apply<F, S>) 
//     => T 


// export function ana<T>(coalgebra: Functor.Coalgebra<Kind, T>): (term: T) => HKT.apply<Kind, T>
// function ana<F extends HKT>(coalgebra: Functor.Coalgebra<HKT<F>, Schema.any>): <T extends Schema.any>(term: T) => HKT.apply<F, T> {
//   return function loop(term: T): HKT.apply<F, F> {
//     return F.map(loop)(coalgebra(term))
//   }
// }
// export function ana<F extends Functor<K>, K extends Kind, T>
//   (F: F, coalg: (t: HKT.apply<K, T>) => T): (term: HKT.apply<K, T>) => T {
//       return function loop(term: T): HKT.apply<F, F> {
//         return F.map(loop)(coalg(term))
//       }
//       // return (term: HKT.apply<K, T>) => {
//       // }
//   }


export declare function free<F extends HKT>(F: F): <T>(expr: T) => HKT.apply<F, T> 
export const project = free(Kind())
// export const inject function forget<F extends HKT, T>(term: HKT.apply<F, T>): T

// export declare function forget<F extends HKT, T>(term: HKT.apply<F, T>): T
// => json



const depthAlgebra
  : (node: Schema.F<number>) => number 
  = (n) => {
    switch (true) {
      case Schema.isNull(n): return 1
      case Schema.isBoolean(n): return 1
      case Schema.isInteger(n): return 1
      case Schema.isNumber(n): return 1
      case Schema.isString(n): return 1
      case Schema.isAllOf(n): return 1 + Math_max(...n.allOf)
      case Schema.isAnyOf(n): return 1 + Math_max(...n.anyOf)
      case Schema.isOneOf(n): return 1 + Math_max(...n.oneOf)
      case Schema.isTuple(n): return 1 + Math_max(...n.items)
      case Schema.isArray(n): return 1 + n.items
      case Schema.isRecord(n): return 1 + n.additionalProperties
      case Schema.isObject(n): return 1 + 
        Math_max(...Object_values(n.properties).concat(n.additionalProperties ?? []))
      default: return fn.exhaustive(n)
    }
  }

const countAlgebra
  : (node: Schema.F<number>) => number 
  = (n) => {
    switch (true) {
      case Schema.isNull(n): 
      case Schema.isBoolean(n): return 1
      case Schema.isInteger(n): return 1
      case Schema.isNumber(n): return 1
      case Schema.isString(n): return 1
      case Schema.isAllOf(n): return 1 + n.allOf.reduce((out, x) => out + x, 0)
      case Schema.isAnyOf(n): return 1 + n.anyOf.reduce((out, x) => out + x, 0)
      case Schema.isOneOf(n): return 1 + n.oneOf.reduce((out, x) => out + x, 0)
      case Schema.isTuple(n): return 1 + n.items.reduce((out, x) => out + x, 0)
      case Schema.isArray(n): return 1 + n.items
      case Schema.isRecord(n): return 1 + n.additionalProperties
      case Schema.isObject(n): return 1 + 
        Object_values(n.properties).concat(n.additionalProperties ?? []).reduce((out, x) => out + x, 0)
      default: return fn.exhaustive(n)
    }
  }

export function cata<F extends Kind>(Functor: Functor<F>) {
  return <I, O>(algebra: (term: HKT.apply<F, I>) => O) => {
    return function loop(term: HKT.apply<F, I>): O { 
      return algebra(Functor.map(loop)(project(term)))
    }
  }
}
export const fold = cata({ map: fmap })
export const depth = fold(depthAlgebra)




// const ex_02 = depthAna({ type: "boolean" })

// console.log("ex_02", ex_02)




  
//   coalgebra: Functor.Coalgebra<HKT<F>, Schema.any>): <T extends Schema.any>(term: T) => HKT.apply<F, T> {
//   return function loop(term: T): HKT.apply<F, F> {
//     return F.map(loop)(coalgebra(term))
//   }
// }
 
 

// export const unfold  = <A> (g: (r: A) =>JsonValF<A>) : (j: A) => JsonVal => {
//   const res = (j: A): JsonVal => jmap (res) (g(j))  //no need to embed, no need to do 'embed(jmap(res)(g(j)))'
//   return res
// }


