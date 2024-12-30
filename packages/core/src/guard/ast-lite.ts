import type { key, keys } from "@traversable/data"
import { object as O, fn, map } from "@traversable/data"
import type { Array, Functor, HKT, integer, Showable } from "@traversable/registry"
import { symbol } from "@traversable/registry"

import type { Json } from "../json.js"
import { TagTree } from "./tag-tree.js"
import type { Leaf, Pathspec } from "./types.js"

export class Nullary<K extends string> { constructor(public _tag: K) {} }
export class Unary<K extends string, T> { constructor(public _tag: K, public _type: T) {} }
export type Struct<T = unknown> = { [x: string]: T; [x: symbol]: T }

export declare namespace AST {
  type Node = 
    | t.null 
    | t.boolean
    | t.integer
    | t.number
    | t.string
    | t.symbol
    | t.optional<AST.Node>
    | t.array<AST.Node>
    | t.record<AST.Node>
    | t.anyOf<readonly AST.Node[]>
    | t.tuple<readonly AST.Node[]>
    | t.object<{ [x: string]: AST.Node }>
    ;
  type F<T> =
    | t.null 
    | t.boolean
    | t.integer
    | t.number
    | t.string
    | t.symbol
    | t.optional<T>
    | t.array<T>
    | t.record<T>
    | t.anyOf<readonly T[]>
    | t.tuple<readonly T[]>
    | t.object<{ [x: string]: T }>
    ;
  interface lambda extends HKT { [-1]: F<this[0]> }
}
export namespace AST {
  export const Functor: Functor<AST.lambda, AST.Node> = {
    map(f) {
      return (x) => {
        switch (true) {
          default: return fn.exhaustive(x)
          case x._tag === "null":
          case x._tag === "boolean":
          case x._tag === "symbol":
          case x._tag === "integer":
          case x._tag === "number":
          case x._tag === "string": return x
          case x._tag === "optional": return optional(f(x._type))
          case x._tag === "array": return array(f(x._type))
          case x._tag === "record": return record(f(x._type))
          case x._tag === "anyOf": return anyOf(x._type.map(f))
          case x._tag === "tuple": return tuple(x._type.map(f))
          case x._tag === "object": return object(map(f)(x._type))
        }
      }
    }
  }
  export function fold<T>(algebra: Functor.Algebra<AST.lambda, T>) 
    { return fn.cata(AST.Functor)(algebra) }
  export function unfold<T>(coalgebra: Functor.Coalgebra<AST.lambda, T>) 
    { return fn.ana(AST.Functor)(coalgebra) }
}

type Widen<S> = S extends { valueOf(): infer T } ? T : S
const _phantom: {
  <T>(): T 
  <T>(_: T): Widen<T> 
} = () => void 0 as never


type Call<T> = never | ReturnType<Extract<T, { _(): unknown }>["_"]>
// type Call<T> = never | ReturnType<Extract<T, { _(): unknown }>["_"]>

const wv = anyOf([string(), array(string()), object({ a: object({ b: record(array(string())) }) })])
//    ^?
const vv = optional(string())._
//    ^?
const w = array(string())._()
//    ^?

const r = record(string())
//    ^?
const sr = record(string())._()
//    ^?
const tu = tuple([number(), boolean()])._()
//    ^?
const oo = object({ a: object({ b: tuple([ string(), integer()]), c: string() }), e: object({ f: number() })})
//    ^?

type Returns<T> = T extends (...args: any) => infer R ? R : any;

class t_null extends Nullary<"null"> {}
class t_boolean extends Nullary<"boolean"> { _(): boolean { return _phantom(false)  }}
class t_integer extends Nullary<"integer"> { _(): integer { return _phantom<integer>() } }
class t_number extends Nullary<"number"> { _(): number { return _phantom(0) } }
class t_string extends Nullary<"string"> { _(): string { return _phantom("") } }
class t_symbol extends Nullary<"symbol"> { _(): symbol { return _phantom(Symbol()) } }
// class t_anyOf<T> extends Unary<"anyOf", T> { _t(): { [K in keyof T]: Call<T[K]> } { return _phantom } }
class t_anyOf<T> extends Unary<"anyOf", T> { _() { return _phantom<Returns<T[number & keyof T]["_" & keyof T[number & keyof T]]>>() } }
class t_optional<T> extends Unary<"optional", T> { _() { return _phantom<Returns<T["_" & keyof T]> | undefined>() } }
class t_array<T> extends Unary<"array", T> { _() { return _phantom<Returns<T["_" & keyof T]>[]>() } }
class t_record<T> extends Unary<"record", T> { _() { return _phantom<Record<string, Returns<T["_" & keyof T]>>>() } }
class t_tuple<T> extends Unary<"tuple", T> { _() { return _phantom<{ -readonly [K in keyof T]: Returns<T[K]["_" & keyof T[K]]> }>() }}
class t_object<T> extends Unary<"object", T> { _(): { [K in keyof T]: Returns<T[K]["_" & keyof T[K]]> } { return _phantom() } }
export declare namespace t {
  export {
    t_null as null,
    t_boolean as boolean,
    t_integer as integer,
    t_number as number,
    t_string as string,
    t_symbol as symbol,
    t_anyOf as anyOf,
    t_optional as optional,
    t_array as array,
    t_record as record,
    t_tuple as tuple,
    t_object as object,
  }
}
export namespace t {
  t.null = t_null
  t.boolean = t_boolean
  t.integer = t_integer
  t.number = t_number
  t.string = t_string
  t.symbol = t_symbol
  t.anyOf = t_anyOf,
  t.optional = t_optional
  t.array = t_array
  t.record = t_record
  t.tuple = t_tuple
  t.object = t_object
}

export { null_ as null }
function null_() { return new t.null("null") }
export { symbol_ as symbol }
function symbol_() { return new t_symbol("symbol") }

export function boolean() { return new t_boolean("boolean") }
export function integer() { return new t_integer("integer") }
export function number() { return new t_number("number") }
export function string() { return new t_string("string") }
/// unary
export function optional<T>(x: T) { return new t_optional("optional", x) }
export function array<T>(xs: T) { return new t_array("array", xs) }
export function record<T>(xs: T) { return new t_record("record", xs) }
/// binary
export function anyOf<S, const T extends readonly S[]>(xs: T) { return new t_anyOf<T>("anyOf", xs as never) }
export function tuple<S, const T extends readonly S[]>(xs: T) { return new t_tuple("tuple", xs) }
export function object<S, T extends Record<number, S>>(xs: T) { return new t_object("object", xs) }

export namespace Corecursive {
  export const ast: Functor.Coalgebra<AST.lambda, TagTree> = (expr) => {
    switch (true) {
      default: return fn.exhaustive(expr)
      case expr[0] === symbol.null: return null_()
      case expr[0] === symbol.boolean: return boolean()
      case expr[0] === symbol.integer: return integer()
      case expr[0] === symbol.number: return number()
      case expr[0] === symbol.string: return string()
      case expr[0] === symbol.optional: return optional(expr[1])
      case expr[0] === symbol.array: return array(expr[1])
      case expr[0] === symbol.record: return record(expr[1])
      case expr[0] === symbol.anyOf: return anyOf(expr[1])
      case expr[0] === symbol.tuple: return tuple(expr[1])
      case expr[0] === symbol.object: return object(Object.fromEntries(expr[1]))
    }
  }
}

namespace Recursive {
  export const fromSeed: Functor.Algebra<TagTree.lambda, AST.Node> = (term) => {
    switch (true) {
      default: return fn.exhaustive(term)
      case term[0] === symbol.null: return null_()
      case term[0] === symbol.boolean: return boolean()
      case term[0] === symbol.integer: return integer()
      case term[0] === symbol.number: return number()
      case term[0] === symbol.string: return string()
      case term[0] === symbol.optional: return optional(term[1])
      case term[0] === symbol.array: return array(term[1])
      case term[0] === symbol.record: return record(term[1])
      case term[0] === symbol.anyOf: return anyOf(term[1])
      case term[0] === symbol.tuple: return tuple(term[1])
      case term[0] === symbol.object: return object(Object.fromEntries(term[1]))
    }
  }
   
  export const toJSON: Functor.Algebra<AST.lambda, Json> = (term) => {
    switch (true) {
      default: return fn.exhaustive(term)
      case term._tag === "null": 
      case term._tag === "boolean":
      case term._tag === "symbol":
      case term._tag === "integer":
      case term._tag === "number":
      case term._tag === "string": return { _tag: term._tag }
      case term._tag === "optional": 
      case term._tag === "array":
      case term._tag === "record":
      case term._tag === "anyOf":
      case term._tag === "tuple":
      case term._tag === "object": return { _tag: term._tag, _type: term._type }
    }
  }

  export const toString: Functor.Algebra<AST.lambda, string> = (n) => {
    switch (true) {
      default: return fn.exhaustive(n)
      case n._tag === "null": return "null"
      case n._tag === "boolean": return "boolean"
      case n._tag === "symbol": return "symbol"
      case n._tag === "integer": return "integer"
      case n._tag === "number": return "number"
      case n._tag === "string": return "string"
      case n._tag === "optional": return n._type + " | undefined"
      case n._tag === "array": return "Array<" + n._type + ">"
      case n._tag === "record": return "Record<string, " + n._type + ">"
      case n._tag === "anyOf": return n._type.join(" | ")
      case n._tag === "tuple": return "[" + n._type.join(", ") + "]"
      case n._tag === "object": {
        const xs = Object.entries(n._type).map(O.parseEntry)
        return xs.length === 0 ? "{}" : "{ " + xs.join(", ") + " }"
      }
    }
  }

  export const path = (x: Leaf, ...xs: keys.any): Array<Pathspec> => [[...xs, x]]
  export const prepend = (k: key.any, y?: key.any) => (xs: Pathspec): Pathspec => [...y ? [k, y] : [k], ...xs]

  export const toPaths: Functor.Algebra<AST.lambda, Array<Pathspec>> = (n) => {
    switch (true) {
      default: return fn.exhaustive(n)
      case n._tag === "null":
      case n._tag === "boolean":
      case n._tag === "symbol":
      case n._tag === "integer":
      case n._tag === "number": 
      case n._tag === "string": return path({ leaf: n._tag })
      case n._tag === "optional": return n._type.map(prepend(symbol.optional))
      case n._tag === "array": return n._type.map(prepend(symbol.array))
      case n._tag === "record": return n._type.map(prepend(symbol.record))
      case n._tag === "anyOf":
        return !n._type.length ? path({ leaf: n._type }) : n._type.flatMap((ks, i) => ks.map(prepend(symbol.anyOf, i)))
      case n._tag === "tuple": 
        return !n._type.length ? path({ leaf: n._type }) : n._type.flatMap((ks, i) => ks.map(prepend(i)))
      case n._tag === "object": {
        const xs = Object.entries(n._type) 
        return !xs.length ? path({ leaf: n._type }) : xs.flatMap(([k, ks]) => ks.map(prepend(k))) 
      }
    }
  }

}

const z = object({
  a: number(),
})._()

const y = object({
  a: object({
    b: object({
      c: array(string())
    })
  })
})._()

const x = anyOf([number(), string()])._()
const s = string()._()

export const fromSeed = TagTree.fold(Recursive.fromSeed)
export const toJSON = AST.fold(Recursive.toJSON)
export const toString = AST.fold(Recursive.toString)
export const toPaths = AST.fold(Recursive.toPaths)
