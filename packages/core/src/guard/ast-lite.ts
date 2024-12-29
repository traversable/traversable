import type { Array, Entries, Functor, HKT, newtype, Primitive, Target } from "@traversable/registry"
import type { key, keys } from "@traversable/data"
import { fn, map, object as O } from "@traversable/data"
import { symbol } from "@traversable/registry"

import type { Json } from "../json.js"
import { TagTree } from "./tag-tree.js"

export interface Nullary<K extends string> { _tag: K }
export interface Unary<K extends string, T = unknown> { _tag: K, _type: T }
export class Nullary<K extends string> { constructor(public _tag: K) {} }
export class Unary<K extends string, T> { constructor(public _tag: K, public _type: T) {} }

export declare namespace AST {
  type Node = 
    | t.null 
    | t.boolean
    | t.integer
    | t.number
    | t.string
    | t.optional<AST.Node>
    | t.array<AST.Node>
    | t.record<AST.Node>
    | t.tuple<readonly AST.Node[]>
    | t.object<{ [x: string]: AST.Node }>
    ;
  type F<T> =
    | t.null 
    | t.boolean
    | t.integer
    | t.number
    | t.string
    | t.optional<T>
    | t.array<T>
    | t.record<T>
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
          case x._tag === "integer":
          case x._tag === "number":
          case x._tag === "string": return x
          case x._tag === "optional": return optional(f(x._type))
          case x._tag === "array": return array(f(x._type))
          case x._tag === "record": return record(f(x._type))
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

class t_null extends Nullary<"null"> {}
class t_boolean extends Nullary<"boolean"> {}
class t_integer extends Nullary<"integer"> {}
class t_number extends Nullary<"number"> {}
class t_string extends Nullary<"string"> {}
class t_optional<T> extends Unary<"optional", T> {}
class t_array<T> extends Unary<"array", T> {}
class t_record<T> extends Unary<"record", T> {}
class t_tuple<T> extends Unary<"tuple", T> {}
class t_object<T> extends Unary<"object", T> {}
export declare namespace t {
  export {
    t_null as null,
    t_boolean as boolean,
    t_integer as integer,
    t_number as number,
    t_string as string,
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
  t.optional = t_optional
  t.array = t_array
  t.record = t_record
  t.tuple = t_tuple
  t.object = t_object
}

export { null_ as null }
function null_() { return new t.null("null") }

export function boolean() { return new t_boolean("boolean") }
export function integer() { return new t_integer("integer") }
export function number() { return new t_number("number") }
export function string() { return new t_string("string") }
export function optional<T>(x: T) { return new t_optional("optional", x) }
export function array<T>(xs: T) { return new t_array("array", xs) }
export function record<T>(xs: T) { return new t_record("record", xs) }
export function tuple<S, const T extends readonly S[]>(xs: readonly [...T]) { return new t_tuple("tuple", xs)}
export function object<T>(xs: Record<string, T>) { return new t_object("object", xs) }

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
      case term[0] === symbol.tuple: return tuple(term[1])
      case term[0] === symbol.object: return object(Object.fromEntries(term[1]))
    }
  }
   
  export const toJSON: Functor.Algebra<AST.lambda, Json> = (term) => {
    switch (true) {
      default: return fn.exhaustive(term)
      case term._tag === "null": 
      case term._tag === "boolean":
      case term._tag === "integer":
      case term._tag === "number":
      case term._tag === "string": return { _tag: term._tag }
      case term._tag === "optional": 
      case term._tag === "array":
      case term._tag === "record":
      case term._tag === "tuple":
      case term._tag === "object": return { _tag: term._tag, _type: term._type }
    }
  }

  export const toString: Functor.Algebra<AST.lambda, string> = (n) => {
    switch (true) {
      default: return fn.exhaustive(n)
      case n._tag === "null": return "null"
      case n._tag === "boolean": return "boolean"
      case n._tag === "integer": return "integer"
      case n._tag === "number": return "number"
      case n._tag === "string": return "string"
      case n._tag === "optional": return n._type + " | undefined"
      case n._tag === "array": return "Array<" + n._type + ">"
      case n._tag === "record": return "Record<string, " + n._type + ">"
      case n._tag === "tuple": return "[" + n._type.join(", ") + "]"
      case n._tag === "object": {
        const xs = Object.entries(n._type).map(O.parseEntry)
        return xs.length === 0 ? "{}" : "{ " + xs.join(", ") + " }"
      }
    }
  }

  export type Struct<T = unknown> = { [x: string]: T; [x: symbol]: T }
  export interface Leaf { leaf: unknown }
  export interface Path extends keys.any {}
  export type Pathspec = readonly [...path: Path, leaf: Leaf]
  export const path = (x: Leaf, ...xs: keys.any): Array<Pathspec> => [[...xs, x]]

  export const prepend = (k: key.any) => (xs: Pathspec): Pathspec => [k, ...xs]

  export const toPaths: Functor.Algebra<AST.lambda, Array<Pathspec>> = (n) => {
    switch (true) {
      default: return fn.exhaustive(n)
      case n._tag === "null":
      case n._tag === "boolean":
      case n._tag === "integer":
      case n._tag === "number": 
      case n._tag === "string": return path({ leaf: n._tag })
      case n._tag === "optional": return n._type.map(prepend(symbol.optional))
      case n._tag === "array": return n._type.map(prepend(symbol.array))
      case n._tag === "record": return n._type.map(prepend(symbol.record))
      case n._tag === "tuple": 
        return !n._type.length ? path({ leaf: n._type }) : n._type.flatMap((ks, i) => ks.map(prepend(i)))
      case n._tag === "object": {
        const xs = Object.entries(n._type) 
        return !xs.length ? path({ leaf: n._type }) : xs.flatMap(([k, ks]) => ks.map(prepend(k))) 
      }
    }
  }

  type OpKind = typeof OpKind[keyof typeof OpKind]
  const OpKind = {
    Prefix: "prefix",
    Postfix: "postfix",
    Infix: "infix",
  }
  type Prefix = { type: "before", op: string }
  type Postfix = { type: "after", op: string }
  type Infix = { type: "infix", left: string, right: string }
  type Operation = Prefix | Postfix | Infix

  type PathHandlers = Record<key.any, (k: key.any, prev?: key.any, next?: key.any | Leaf) => string | false>
  const SegmentMap = {
    [symbol.array]: (..._) => (console.log("args", _), "[number]"),
    [symbol.record]: (..._) => (console.log("args", _), "[string]"),
    [symbol.optional]: (k, prev) => (
      console.log("args", k, prev), 
      prev === symbol.optional || prev === symbol.nullable ? false : "?"
    ),
    // [symbol.nullable]: () => "?",
    // [symbol.union]: (ix) => "[" + ix + "]",
    // [symbol.disjoint]: (ix) => "[" + ix + "]",
    // [symbol.intersection]: (ix) => "[" + ix + "]",
  } as const satisfies PathHandlers

  type Handler<K = never, O extends string = string> = (k: [K] extends [never] ? key.any : K, prev?: key.any, next?: key.any | Leaf) => O | false

  type Matchers<K> = 
    | GuardMatch<K>
    | CheckMatch
  type Matcher<K = key.any> = { 
    predicate(k: unknown): k is K
    handler: Handler<K>
  } | { 
    predicate(k: key.any): boolean
    handler: Handler 
  }

  type GuardMatch<K> = [predicate: (k: key.any) => k is key.any & K, handler: Handler<K>]
  type CheckMatch = [predicate: (k: key.any) => boolean, handler: Handler]
  

  function defineMatcher<K extends key.any>(predicate: (k: key.any) => k is K, handler: Handler<K>): Matcher<K>
  function defineMatcher(predicate: (k: key.any) => boolean, handler: Handler): Matcher<key.any>
  function defineMatcher(predicate: (k: key.any) => boolean, handler: Handler): Matcher<key.any>
    { return { predicate, handler } }

  function defineMatchers<const T extends Matchers<key.any>[]>(...matchers: T): { [K in keyof T]: Matcher<Target<T[K][0]>> } 
  function defineMatchers<const T extends Matchers<key.any>[]>(...matchers: T)
    { return matchers.map(([p, h]) => defineMatcher(p, h)) }

  const Predicates = [
    defineMatcher((k) => k === symbol.array, () => "[number]"),
    defineMatcher((k) => k === symbol.record, () => "[string]"),
    defineMatcher(
      (k): k is symbol.optional => k === symbol.optional, 
      (_, prev) => prev === symbol.optional || prev === symbol.nullable ? false : "?"
    ),
  ] as const

  const Pred2 = defineMatchers(
    [(k) => k === symbol.array, () => "[number]"],
    [(k) => k === symbol.record, () => "[string]"],
    [(k): k is symbol.optional => k === symbol.optional, (_, prev) => prev === symbol.optional || prev === symbol.nullable ? false : "?"]
  )

  export function interpretPath(ks: Pathspec): keys.any 
  export function interpretPath<T extends readonly Matcher[]>(ks: Pathspec, matchers: T): keys.any 
  export function interpretPath(_: Pathspec, matchers: readonly Matcher[] = Predicates) {
    let ks = [..._]
    let out: (key.any | false)[] = []
    let k: Pathspec[number] | undefined
    let prev: Pathspec[number] | undefined
    while ((prev = k, k = ks.shift()) !== undefined) {
      if (typeof k === "object") continue;
      else if (typeof k === "number") { void (out.push("[" + k + "]")); continue }
      else if (typeof k === "string") { 
        const prefix = prev === undefined ? "" : "."
        void (out.push(prefix + k)); continue 
      }
      else if (typeof k === "symbol") { 
        const { handler } = matchers.find(({ predicate }) => predicate(k as symbol)) ?? {}
        if (handler) {
          void (out.push(handler(k, prev as key.any, ks[0])))
          continue
        }
      }
      else return fn.exhaustive(k)
    }
    return out.filter((_) => _ !== false)
  }
  
  // => {
  //       let out: (key.any | false)[] = []
  //       let k: Pathspec[number] | undefined
  //       let prev: Pathspec[number] | undefined
  //       while ((prev = k, k = ks.shift()) !== undefined) {
  //         if (typeof k === "object") continue;
  //         // [out, k].filter((_) => _ !== false as never) satisfies [key.any[], Leaf]
  //         else if (typeof k === "number") { void (out.push("[" + k + "]")); continue }
  //         else if (typeof k === "string") { 
  //           const prefix = prev === undefined ? "" : "." // typeof prev === "symbol" ? "." : typeof prev === "string" ? "." : ""
  //           void (out.push(prefix + k)); continue 
  //         }
  //         else if (typeof k === "symbol") { 
  //           const kk = k
  //           const { handler } = matchers.find(({ predicate }) => predicate(kk)) ?? {}
  //           if (handler) {
  //             void (out.push(handler(k, prev as key.any, ks[0])))
  //             continue
  //           }
  //         }
  //         else return fn.exhaustive(k)
  //       }
  //       return out.filter((_) => _ !== false)
  //     }

  // export const interpretPath2 = (dict: PathHandlers = SegmentMap) => (...ks: Pathspec) => {
  //   let out: (key.any | false)[] = []
  //   let k: Pathspec[number] | undefined
  //   let prev: Pathspec[number] | undefined
  //   while ((prev = k, k = ks.shift()) !== undefined) {
  //     if (typeof k === "object") continue;
  //     // [out, k].filter((_) => _ !== false as never) satisfies [key.any[], Leaf]
  //     else if (typeof k === "number") { void (out.push("[" + k + "]")); continue }
  //     else if (typeof k === "string") { 
  //       const prefix = prev === undefined ? "" : "." // typeof prev === "symbol" ? "." : typeof prev === "string" ? "." : ""
  //       void (out.push(prefix + k)); continue 
  //     }
  //     else if (typeof k === "symbol") { if (k in dict) void (out.push(dict[k](k, prev as key.any, ks[0]))); continue }
  //     else return fn.exhaustive(k)
  //   }
  //   return out.filter((_) => _ !== false)
  // }
}

/**
 * @example
 * [ "aBc", 1, 0, Symbol(@Record), "deF", Symbol(@Optional), "GHi", { [symbol.leaf]: "null" } ]
 * 
 * example.aBc[1][0][string].deF?.GHi
 * 
 * 
 * 
 */


export const fromSeed = TagTree.fold(Recursive.fromSeed)
export const toJSON = AST.fold(Recursive.toJSON)
export const toString = AST.fold(Recursive.toString)
export const toPaths = AST.fold(Recursive.toPaths)
export const interpretPath = Recursive.interpretPath
