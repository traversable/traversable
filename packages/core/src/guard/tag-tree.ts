import { fn, map } from "@traversable/data"
import type { Entries, Functor, HKT } from "@traversable/registry"
import { symbol } from "@traversable/registry"

export type TagTree_null = [_tag: symbol.null]
export type TagTree_boolean = [_tag: symbol.boolean]
export type TagTree_integer = [_tag: symbol.integer]
export type TagTree_number = [_tag: symbol.number]
export type TagTree_string = [_tag: symbol.string]
export type TagTree_Scalar =
  | TagTree_null
  | TagTree_boolean
  | TagTree_integer
  | TagTree_number
  | TagTree_string
  ;

export type TagTree_optional = [_tag: symbol.optional, _type: TagTree]
export type TagTree_optionalF<T> = [_tag: symbol.optional, _type: T]
export type TagTree_array = [_tag: symbol.array, _type: TagTree]
export type TagTree_arrayF<T> = [_tag: symbol.array, _type: T]
export type TagTree_record = [_tag: symbol.record, _type: TagTree]
export type TagTree_recordF<T> = [_tag: symbol.record, _type: T]
export type TagTree_tuple = [_tag: symbol.tuple, _type: readonly TagTree[]]
export type TagTree_tupleF<T> = [_tag: symbol.tuple, _type: readonly T[]]
export type TagTree_anyOf = [_tag: symbol.anyOf, _type: readonly TagTree[]]
export type TagTree_anyOfF<T> = [_tag: symbol.anyOf, _type: readonly T[]]
export type TagTree_object = [_tag: symbol.object, _type: Entries<TagTree>]
export type TagTree_objectF<T> = [_tag: symbol.object, _type: Entries<T>]

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
 * help avoid stack overflows.
 */
export type TagTree = 
  | TagTree_Scalar
  | TagTree_optional
  | TagTree_array
  | TagTree_record
  | TagTree_anyOf
  | TagTree_tuple
  | TagTree_object
  ;

export type Unary = {
  [symbol.optional]: TagTree.optionalLambda 
  [symbol.array]: TagTree.arrayLambda 
  [symbol.record]: TagTree.recordLambda
  [symbol.tuple]: TagTree.tupleLambda
  [symbol.object]: TagTree.objectLambda
  [symbol.anyOf]: TagTree.anyOfLambda
}

export type TagTreeMap = {
  null: TagTree_null
  boolean: TagTree_boolean
  integer: TagTree_integer
  number: TagTree_number
  string: TagTree_string
  optional: TagTree_optional
  array: TagTree_array
  record: TagTree_record
  tuple: TagTree_tuple
  object: TagTree_object
}

export declare namespace TagTree {
  interface lambda extends HKT { [-1]: TagTree.F<this[0]> }
  interface optionalLambda extends HKT { [-1]: TagTree_optionalF<this[0]> }
  interface arrayLambda extends HKT { [-1]: TagTree_arrayF<this[0]> }
  interface anyOfLambda extends HKT { [-1]: TagTree_anyOfF<this[0]> }
  interface tupleLambda extends HKT { [-1]: TagTree_tupleF<this[0]> }
  interface objectLambda extends HKT { [-1]: TagTree_objectF<this[0]> }
  interface recordLambda extends HKT { [-1]: TagTree_recordF<this[0]> }
  type F<T> = 
    | TagTree_Scalar
    | TagTree_optionalF<T>
    | TagTree_arrayF<T>
    | TagTree_recordF<T>
    | TagTree_tupleF<T>
    | TagTree_anyOfF<T>
    | TagTree_objectF<T>
    ;
}
export namespace TagTree {
  export function nullary<Tag extends TagTree_Scalar[0]>(tag: Tag): () => Extract<TagTree_Scalar, [Tag]>
  export function nullary(tag: TagTree_Scalar[0]) { return () => [tag] as never }
  ///
  export function unary<Tag extends keyof Unary, F extends Unary[Tag]>(x: Tag): 
    <T extends HKT.apply<F, unknown>[1]>(x: T) 
      => HKT.apply<F, T>
  export function unary<Tag extends TagTree[0]>(tag: Tag) { return <T>(x: T) => [tag, x] }
  ///
  export const make = {
    null: nullary(symbol.null),
    boolean: nullary(symbol.boolean),
    integer: nullary(symbol.integer),
    number: nullary(symbol.number),
    string: nullary(symbol.string),
    optional: unary(symbol.optional),
    array: unary(symbol.array),
    record: unary(symbol.record),
    anyOf: unary(symbol.anyOf),
    tuple: unary(symbol.tuple),
    object: unary(symbol.object),
  } satisfies Record<string, (_: never) => TagTree>
}

export namespace TagTree {
  export const Functor: Functor<TagTree.lambda, TagTree> = {
    map(f) {
      return (x) => {
        switch (true) {
          default: return fn.exhaustive(x) // (console.log("EXHAUSTIVE FAIL IN 'TagTree.Functor'", x), x)
          case x[0] === symbol.null:
          case x[0] === symbol.boolean:
          case x[0] === symbol.integer:
          case x[0] === symbol.number:
          case x[0] === symbol.string: return x
          case x[0] === symbol.array: 
          case x[0] === symbol.optional:
          case x[0] === symbol.record: return [x[0], f(x[1])]
          case x[0] === symbol.anyOf:
          case x[0] === symbol.tuple: return [x[0], map(x[1], f)]
          case x[0] === symbol.object: return [x[0], map.entries(f)(x[1])]
        }
      }
    }
  }
  export function fold<T>(algebra: Functor.Algebra<TagTree.lambda, T>) 
    { return fn.cata(TagTree.Functor)(algebra) }
  export function unfold<T>(coalgebra: Functor.Coalgebra<TagTree.lambda, T>) 
    { return fn.ana(TagTree.Functor)(coalgebra) }
}
