import { object as O, fn, map } from "@traversable/data"
import type { Functor, HKT, Intersect, integer as integer_, newtype } from "@traversable/registry"

import { _phantom } from "@traversable/core/guard/types"
import type { Json } from "../json.js"


export class Nullary<T> { constructor(_type: T) { this._ = _type }; _: T }
export class Unary<T> { constructor(public _: T) {} }

// type schema<T extends { _: unknown }> = <T["_"]> // [Out] extends [{}] ? Schema<Out> : T
// function schema<T extends { _: unknown }>(x: T): schema<T> { return x as schema<T> }
// type _3 = schema<t.object<{ a: t.object<{ _():  1}>, b: t.object<{ _(): 2 }> }>>
// interface Schema<T extends {}> extends newtype<T> {}
export type Struct<T = unknown> = { [x: string]: T; [x: symbol]: T }
export type AbsorbUnless<T, Cond> = [Cond] extends [true] ? T : never
export type AbsorbUnion<T, _ = T> = T extends T ? AbsorbUnless<T, Equal<T, _>> : never
export type Equal<S, T> = (<F>() => F extends S ? 1 : 2) extends <F>() => F extends T ? 1 : 2 ? true : false

const ex_04 = object({ a: boolean(), b: object({ c: array(string()) }) })
//    ^?
const ex_05 = object({ a: boolean(), b: object({ c: string() }) })._
//    ^?



type UnionSchema<T> = [union: T]


const ex_01 = optional(number())._
//    ^?
const ex_02 = number()
//    ^?
const ex_03 = array(number())._
//    ^?
const ex_06 = any()._
//    ^?


type NullaryTag = typeof NullaryTag[keyof typeof NullaryTag]
const NullaryTag = {
  null: "null",
  boolean: "boolean",
  symbol: "symbol",
  integer: "integer",
  number: "number",
  string: "string",
  any: "any",
} as const

type Tag = typeof Tag[keyof typeof Tag]
const Tag = {
  ...NullaryTag,
  const: "const",
  optional: "optional",
  array: "array",
  record: "record",
  anyOf : "anyOf" ,
  allOf : "allOf" ,
  tuple: "tuple",
  object: "object",
} as const

export declare namespace AST {
  type Node = { _tag: Tag, _(): unknown }

    // | t.null 
    // | t.boolean
    // | t.integer
    // | t.number
    // | t.string
    // | t.symbol
    // | t.any
    // | t.const<Json>
    // | t.optional<AST.Node>
    // | t.array<AST.Node>
    // | t.record<AST.Node>
    // | t.anyOf<readonly AST.Node[]>
    // | t.allOf<readonly AST.Node[]>
    // | t.tuple<readonly AST.Node[]>
    // | t.object<{ [x: string]: AST.Node }>
    // ;

  type F<T> =
    | t.null 
    | t.boolean
    | t.integer
    | t.number
    | t.string
    | t.symbol
    | t.any
    | t.const<unknown>
    | t.optional<T>
    | t.array<T>
    | t.record<T>
    | t.anyOf<readonly T[]>
    | t.allOf<readonly T[]>
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
          case x._tag === "null": return new t.null(null)
          case x._tag === "boolean": return new t.boolean(CONST_BOOLEAN)
          case x._tag === "symbol": return new t.symbol(CONST_SYMBOL)
          case x._tag === "integer": return new t.integer(CONST_INTEGER)
          case x._tag === "number": return new t.number(CONST_NUMBER)
          case x._tag === "string": return new t.string(CONST_STRING)
          case x._tag === "any": return new t.any(CONST_UNKNOWN)
          case x._tag === "const": return new t.const(x._)
          case x._tag === "optional": return new t.optional(f(x._))
          case x._tag === "array": return new t.array(f(x._))
          case x._tag === "record": return new t.record(f(x._children))
          case x._tag === "anyOf": return new t.anyOf(x._children.map(f))
          case x._tag === "allOf": return new t.allOf( x._children.map(f))
          case x._tag === "tuple": return new t.tuple(x._children.map(f))
          case x._tag === "object": return new t.object(map(f)(x._children))
        }
      }
    }
  }
  export function fold<T>(algebra: Functor.Algebra<AST.lambda, T>) 
    { return fn.cata(AST.Functor)(algebra) }
  export function unfold<T>(coalgebra: Functor.Coalgebra<AST.lambda, T>) 
    { return fn.ana(AST.Functor)(coalgebra) }
}


class t_null extends Nullary<null> {}
class t_any extends Nullary<unknown> { _: unknown = _phantom(CONST_UNKNOWN); _tag = Tag.any }
class t_boolean extends Nullary<boolean> { _ = _phantom(CONST_BOOLEAN); _tag = Tag.boolean }
class t_symbol extends Nullary<symbol> { _ = _phantom(CONST_SYMBOL); _tag = Tag.symbol }
class t_integer extends Nullary<integer_> { _ = _phantom(CONST_INTEGER); _tag = Tag.integer }
class t_number extends Nullary<number> { _ = _phantom(CONST_NUMBER); _tag = Tag.number }
class t_string extends Nullary<string> { _ = _phantom(CONST_STRING); _tag = Tag.string } 
class t_const<T> extends Unary<T> { _tag = Tag.const; _ = _phantom<T>() }
class t_allOf<T extends readonly { _: unknown }[]> extends Unary<Intersect<{ [K in keyof T]: T[K] }>> 
  { _tag = Tag.allOf; _ = _phantom<Intersect<{ [K in keyof T]: T[K]["_"] }>>(); }
class t_anyOf<T extends readonly { _: unknown }[]> extends Unary<T[number]["_"]>
  { _tag = Tag.anyOf; _ = _phantom<T[number]["_"]>(); }
class t_optional<T extends { _: unknown }> extends Unary<undefined | T["_"]>
  { _tag = Tag.optional; _ = _phantom<undefined | T["_"]>() }
class t_array<T extends { _: unknown }> extends Unary<T["_"][]> 
  { _tag = Tag.array; _ = _phantom<T["_"][]>() }
class t_record<T extends { _: unknown }> extends Unary<Record<string, T["_"]> 
  { _tag = Tag.record; _ = _phantom<{}>() }
class t_tuple<const T extends readonly { _: unknown }[]> extends Unary<{ -readonly [K in keyof T]: T[K]["_"] }> 
  { _tag = Tag.tuple; _ = _phantom<never>() }
class t_object<T extends { [x: string]: { _: unknown } }> extends Unary<{ -readonly [K in keyof T]: T[K]["_"] }> 
  {  _tag = Tag.object; _ = _phantom<{ -readonly [K in keyof T]: T[K]["_"] }>(); }

export declare namespace t { 
  export {
    t_null as null,
    t_boolean as boolean,
    t_symbol as symbol,
    t_integer as integer,
    t_number as number,
    t_string as string,
    t_any as any,
    t_const as const,
    t_object as object,
    t_allOf as allOf,
    t_anyOf as anyOf,
    t_optional as optional,
    t_array as array,
    t_record as record,
    t_tuple as tuple,
  }
}
export namespace t {
  void (t.null = t_null)
  void (t.boolean = t_boolean)
  void (t.symbol = t_symbol)
  void (t.integer = t_integer)
  void (t.number = t_number)
  void (t.string = t_string)
  void (t.any = t_any)
  void (t.const = t_const)
  void (t.object = t_object)
  void (t.allOf = t_allOf)
  void (t.anyOf = t_anyOf)
  void (t.optional = t_optional)
  void (t.array = t_array)
  void (t.record = t_record)
  void (t.tuple = t_tuple)
}

const CONST_BOOLEAN = globalThis.Boolean()
const CONST_SYMBOL = globalThis.Symbol()
const CONST_UNKNOWN = CONST_BOOLEAN ? {} : CONST_BOOLEAN ? null : undefined
const CONST_NUMBER = Math.floor(Math.random() * 100)
const CONST_INTEGER = CONST_NUMBER as integer_
const CONST_STRING = "" + ""

/////////////////////
///    nullary    ///
export { null_ as null }
function null_() { return new t.null( null, "null") }
export { symbol_ as symbol }
function symbol_() { return new t.symbol(CONST_SYMBOL, "symbol") }
export function any() { return  new t.any(CONST_UNKNOWN, "any") }
export function boolean() { return new t.boolean(CONST_BOOLEAN, "boolean") }
export function integer() { return new t.integer(CONST_INTEGER, "integer") }
export function number() { return new t.number(CONST_NUMBER, "number") }
export function string() { return new t.string(CONST_STRING, "string") }
///////////////////
///    unary    ///
export { const_ as const }
function const_<T>(value: T): t.const<T> { return new t.const("const", value) }
export function optional<T>(x: T) { return new t.optional("optional", x) }
export function array<T extends { _: unknown }>(xs: T): t.array<T> { return new t.array("array", xs) }
export function record<T>(xs: T): t.record<T> { return new t.record(xs, "record") }

////////////////////
///    binary    ///
export function allOf<const T extends readonly { _: unknown }[]>(xs: T): t.allOf<T> { return new t.allOf("allOf", xs) }
export function anyOf<const T extends readonly { _: unknown }[]>(xs: T) { return new t.anyOf("anyOf", xs) }
export function tuple<S, const T extends readonly S[]>(xs: T) { return new t.tuple("tuple", xs) }
export function object<const T extends Record<string, { _: unknown }>>(xs: T): t.object<T> { return new t.object("object", xs) }

// export namespace Corecursive {
//   export const ast: Functor.Coalgebra<AST.lambda, TagTree> = (expr) => {
//     switch (true) {
//       default: return fn.exhaustive(expr)
//       case expr[0] === Sym.null: return null_()
//       case expr[0] === Sym.boolean: return boolean()
//       case expr[0] === Sym.integer: return integer()
//       case expr[0] === Sym.number: return number()
//       case expr[0] === Sym.string: return string()
//       case expr[0] === Sym.optional: return optional(expr[1])
//       case expr[0] === Sym.array: return array(expr[1])
//       case expr[0] === Sym.record: return record(expr[1])
//       case expr[0] === Sym.anyOf: return anyOf(expr[1])
//       case expr[0] === Sym.tuple: return tuple(expr[1])
//       case expr[0] === Sym.object: return object(Object.fromEntries(expr[1]))
//     }
//   }
// }

namespace Recursive {
   

}

export const toJSON = AST.fold(Recursive.toJSON)
export const toString = AST.fold(Recursive.toString)

/**
 * @example
 * 
 * t.object({
 *   a: t.array(
 *     t.object({
 *       b: t.string(),
 *       c: t.oneOf(
 *         t.object({
 *           tag: "Ok"
 *           ok: t.any()
 *         }),
 *         t.object({
 *           tag: "Err",
 *           err: t.any(),
 *         })
 *       )
 *     })
 *   )
 * })
 * 
 * t.oneOf(
 *   t.object({
 *     type: t.const("Ok"),
 *     ok: t.any()
 *   }),
 *   t.object({
 *     type: t.const("Err"),
 *     err: t.any(),
 *   }),
 * )
 * 
 * {
 *   _tag: "OneOf",
 *   _meta: { path: [] }
 *   _children: [
 *     {
 *       _tag: "Object",
 *       _meta: { path: [@Symbol(OneOf), 0]}
 *       _children: {
 *         type: { _tag: "Const", _meta: { path: [@Symbol(OneOf), 0, "type"] }, _children: "Ok" },
 *         ok: { _tag: "Any", _meta: { path: [@Symbol(OneOf), 0, "ok"] }, _children: null },
 *       }
 *     },
 *     {
 *       _tag: "Object",
 *       _meta: { path: [@Symbol(OneOf), 1] },
 *       _children: {
 *         type: { _tag: "Const", _meta: { path: [@Symbol(OneOf), 1 "type"] }, _children: "Err" },
 *         err: { _tag: "Any", _meta: { path: [@Symbol(OneOf), 1 "err"] }, _children: null },
 *       }
 *     }
 *   ]
 * }
 * 
 */

const y = {
  _tag: "OneOf",
  _meta: { path: [] },
  _children: [
    {
      _tag: "Object",
      _meta: { path: ["@Symbol(OneOf)", 0]},
      _children: {
        type: { _tag: "Const", _meta: { path: ["@Symbol(OneOf)", 0, "type"] }, _children: "Ok" },
        ok: { _tag: "Any", _meta: { path: ["@Symbol(OneOf)", 0, "ok"] }, _children: null },
      }
    },
    {
      _tag: "Object",
      _meta: { path: ["@Symbol(OneOf)", 1] },
      _children: {
        type: { _tag: "Const", _meta: { path: ["@Symbol(OneOf)", 1, "type"] }, _children: "Err" },
        err: { _tag: "Any", _meta: { path: ["@Symbol(OneOf)", 1, "err"] }, _children: null },
      }
    }
  ]
} as const
