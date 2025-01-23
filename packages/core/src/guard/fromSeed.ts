import { fn, map } from "@traversable/data"
import type { Entries, Functor, HKT, Kind } from "@traversable/registry"
import { URI, symbol } from "@traversable/registry"

import * as t from "./ast.js"

/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries

export type TagTree_null = [_tag: symbol.null]
export type TagTree_boolean = [_tag: symbol.boolean]
export type TagTree_integer = [_tag: symbol.integer]
export type TagTree_number = [_tag: symbol.number]
export type TagTree_string = [_tag: symbol.string]
export type TagTree_any = [_tag: symbol.any]
export type TagTree_Scalar =
  | TagTree_any
  | TagTree_null
  | TagTree_boolean
  | TagTree_integer
  | TagTree_number
  | TagTree_string
  ;
export type TagTree_const = [_tag: symbol.constant, _type: {} | null | undefined]
export type TagTree_allOf = [_tag: symbol.allOf, _type: readonly TagTree[]]
export type TagTree_allOfF<T> = [_tag: symbol.allOf, _type: readonly T[]]
export type TagTree_anyOf = [_tag: symbol.anyOf, _type: readonly TagTree[]]
export type TagTree_anyOfF<T> = [_tag: symbol.anyOf, _type: readonly T[]]
export type TagTree_optional = [_tag: symbol.optional, _type: TagTree]
export type TagTree_optionalF<T> = [_tag: symbol.optional, _type: T]
export type TagTree_array = [_tag: symbol.array, _type: TagTree]
export type TagTree_arrayF<T> = [_tag: symbol.array, _type: T]
export type TagTree_record = [_tag: symbol.record, _type: TagTree]
export type TagTree_recordF<T> = [_tag: symbol.record, _type: T]
export type TagTree_tuple = [_tag: symbol.tuple, _type: readonly TagTree[]]
export type TagTree_tupleF<T> = [_tag: symbol.tuple, _type: readonly T[]]
export type TagTree_object = [_tag: symbol.object, _type: Entries<TagTree>]
export type TagTree_objectF<T> = [_tag: symbol.object, _type: Entries<T>]

export type Nullary = {
  [symbol.any]: TagTree_any
  [symbol.null]: TagTree_null
  [symbol.boolean]: TagTree_boolean
  [symbol.integer]: TagTree_integer
  [symbol.number]: TagTree_number
  [symbol.string]: TagTree_string
  [symbol.constant]: TagTree_const
}

export type Unary = {
  [symbol.constant]: TagTree_const
  [symbol.allOf]: TagTree_allOf
  [symbol.anyOf]: TagTree_anyOf
  [symbol.optional]: TagTree_optional
  [symbol.array]: TagTree_array
  [symbol.record]: TagTree_record
  [symbol.tuple]: TagTree_tuple
  [symbol.object]: TagTree_object
}

export type Unary$ = {
  [symbol.allOf]: TagTree.allOfLambda
  [symbol.anyOf]: TagTree.anyOfLambda
  [symbol.optional]: TagTree.optionalLambda 
  [symbol.array]: TagTree.arrayLambda 
  [symbol.record]: TagTree.recordLambda
  [symbol.tuple]: TagTree.tupleLambda
  [symbol.object]: TagTree.objectLambda
}

export type TagTreeMap = 
  & Nullary 
  & Unary$

/** 
 * ## {@link TagTree `TagTree`}
 * 
 * {@link TagTree `TagTree`} is an intermediate representation of
 * an abstract syntax tree.
 * 
 * This IR is primarily useful as a 
 * [seed](https://en.wikipedia.org/wiki/Random_seed) that can
 * generate other, more fully-fledged ASTs.
 * 
 * The representation is intentionally compact and lightweight to
 * help avoid stack overflows when generating trees of arbitrary size.
 */
export type TagTree = 
  | TagTree_Scalar
  | TagTree_const
  | TagTree_allOf
  | TagTree_anyOf
  | TagTree_optional
  | TagTree_array
  | TagTree_record
  | TagTree_tuple
  | TagTree_object
  ;

export declare namespace TagTree {
  export {
    TagTree_any as any,
    TagTree_null as null,
    TagTree_boolean as boolean,
    TagTree_integer as integer,
    TagTree_number as number,
    TagTree_string as string,
    TagTree_Scalar as Scalar,
    TagTree_const as const,
    TagTree_allOf as allOf,
    TagTree_allOfF as allOfF,
    TagTree_anyOf as anyOf,
    TagTree_anyOfF as anyOfF,
    TagTree_optional as optional,
    TagTree_optionalF as optionalF,
    TagTree_array as array,
    TagTree_arrayF as arrayF,
    TagTree_record as record,
    TagTree_recordF as recordF,
    TagTree_tuple as tuple,
    TagTree_tupleF as tupleF,
    TagTree_object as object,
    TagTree_objectF as objectF,
  }
}

export declare namespace TagTree {
  interface lambda extends HKT { [-1]: TagTree.F<this[0]> }
  interface allOfLambda extends HKT { [-1]: TagTree_allOfF<readonly this[0][]> }
  interface anyOfLambda extends HKT { [-1]: TagTree_anyOfF<readonly this[0][]> }
  interface optionalLambda extends HKT { [-1]: TagTree_optionalF<this[0]> }
  interface arrayLambda extends HKT { [-1]: TagTree_arrayF<this[0]> }
  interface tupleLambda extends HKT { [-1]: TagTree_tupleF<readonly this[0][]> }
  interface objectLambda extends HKT { [-1]: TagTree_objectF<Record<string, this[0]>> }
  interface recordLambda extends HKT { [-1]: TagTree_recordF<Record<string, this[0]>> }
  type F<T> = 
    | TagTree_Scalar
    | TagTree_const
    | TagTree_optionalF<T>
    | TagTree_arrayF<T>
    | TagTree_recordF<T>
    | TagTree_tupleF<T>
    | TagTree_allOfF<T>
    | TagTree_anyOfF<T>
    | TagTree_objectF<T>
    ;
}
export namespace TagTree {
  export function nullary(tag: typeof symbol.constant): () => TagTree_const
  export function nullary<Tag extends keyof Nullary>(tag: Tag): () => Extract<TagTree_Scalar, [Tag]>
  export function nullary(tag: Nullary[keyof Nullary][0] | "const") { return () => [tag] as never }
  ///
  export function unary<Tag extends keyof Unary$>(x: Tag): (x: any) => Kind<Unary$[Tag], TagTree>
  export function unary<Tag extends TagTree[0]>(tag: Tag) { return <T>(x: T) => [tag, x] }

  export type byName<URI extends keyof typeof byName> = typeof byName[URI]
  export const byName = {
    any: nullary(symbol.any),
    null: nullary(symbol.null),
    boolean: nullary(symbol.boolean),
    integer: nullary(symbol.integer),
    number: nullary(symbol.number),
    string: nullary(symbol.string),
    constant: nullary(symbol.constant),
    allOf: unary(symbol.allOf),
    anyOf: unary(symbol.anyOf),
    optional: unary(symbol.optional),
    array: unary(symbol.array),
    record: unary(symbol.record),
    tuple: unary(symbol.tuple),
    object: unary(symbol.object),
  } as const

  ///
  export const make = {
    [symbol.any]: byName.any,
    [symbol.null]: byName.null,
    [symbol.boolean]: byName.boolean,
    [symbol.integer]: byName.integer,
    [symbol.number]: byName.number,
    [symbol.string]: byName.string,
    [symbol.constant]: byName.constant,
    [symbol.allOf]: byName.allOf,
    [symbol.anyOf]: byName.anyOf,
    [symbol.optional]: byName.optional,
    [symbol.array]: byName.array,
    [symbol.record]: byName.record,
    [symbol.tuple]: byName.tuple,
    [symbol.object]: byName.object,
  } as const
}

export namespace TagTree {
  export const Functor: Functor<TagTree.lambda, TagTree> = {
    map(f) {
      return (x) => {
        switch (true) {
          default: return fn.exhaustive(x)
          case x[0] === symbol.null:
          case x[0] === symbol.boolean:
          case x[0] === symbol.integer:
          case x[0] === symbol.number:
          case x[0] === symbol.string: 
          case x[0] === symbol.constant:
          case x[0] === symbol.any: return x
          case x[0] === symbol.array:
          case x[0] === symbol.optional:
          case x[0] === symbol.record: return [x[0], f(x[1])]
          case x[0] === symbol.allOf:
          case x[0] === symbol.anyOf:
          case x[0] === symbol.tuple: return [x[0], map(x[1], f)]
          case x[0] === symbol.object: return [x[0], map.entries(x[1], f)]
        }
      }
    }
  }

  export function fold<T>(algebra: Functor.Algebra<TagTree.lambda, T>) 
    { return fn.cata(TagTree.Functor)(algebra) }

  export function unfold<T>(coalgebra: Functor.Coalgebra<TagTree.lambda, T>) 
    { return fn.ana(TagTree.Functor)(coalgebra) }
}

export namespace Recursive {
  export const fromSeed: Functor.Algebra<TagTree.lambda, t.AST.Node> = (x) => {
    switch (true) {
      default: return fn.exhaustive(x)
      case x[0] === symbol.null: return t.null()
      case x[0] === symbol.boolean: return t.boolean()
      case x[0] === symbol.integer: return t.integer()
      case x[0] === symbol.number: return t.number()
      case x[0] === symbol.string: return t.string()
      case x[0] === symbol.any: return t.any()
      case x[0] === symbol.constant: return t.const(x[1]!)
      case x[0] === symbol.allOf: return t.allOf(...x[1])
      case x[0] === symbol.anyOf: return t.anyOf(...x[1])
      case x[0] === symbol.optional: return t.optional(x[1])
      case x[0] === symbol.array: return t.array(x[1])
      case x[0] === symbol.record: return t.record(x[1])
      case x[0] === symbol.tuple: return t.tuple(...x[1])
      case x[0] === symbol.object: return t.object(Object_fromEntries(x[1]))
    }
  }
}

export const fromSeed = fn.cata(TagTree.Functor)(Recursive.fromSeed)
