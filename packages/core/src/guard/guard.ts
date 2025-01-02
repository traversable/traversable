import { fn, map } from "@traversable/data"
import type { Finite, Functor, HKT, integer, Intersect } from "@traversable/registry"

import { allOf$, anyOf$, array$, is, object$, or$, record$, tuple$ } from "./predicates.js"
import { _phantom } from "./types.js"
import * as t from "./ast-3.js"

export type { Guard }
export type { typeof } from "./ast-3.js"
export {
  Functor,
  fold,
  unfold,
  ///
  null_ as null,
  boolean_ as boolean,
  integer_ as integer,
  number_ as number,
  string_ as string,
  symbol_ as symbol,
  any_ as any,
  const_ as const,
  optional_ as optional,
  array_ as array,
  record_ as record,
  allOf_ as allOf,
  anyOf_ as anyOf,
  tuple_ as tuple,
  object_ as object,
}

// type infer<T extends Guard.Node> = ReturnType<T["_"]>

declare namespace Guard {
  type Node = 
    | null_
    | boolean_
    | integer_
    | number_
    | string_
    | symbol_
    | any_
    | const_<unknown>
    | optional_<Node>
    | array_<Node>
    | record_<Node>
    | allOf_<readonly Node[]>
    | anyOf_<readonly Node[]>
    | tuple_<readonly Node[]>
    | object_<{ [x: string]: Node }>
    ;
  interface lambda extends HKT { [-1]: F<this[0]> }
  type F<T> =
    | null_
    | boolean_
    | integer_
    | number_
    | string_
    | symbol_
    | any_
    | const_<unknown>
    | optional_<T>
    | array_<T>
    | record_<T>
    | allOf_<readonly T[]>
    | anyOf_<readonly T[]>
    | tuple_<readonly T[]>
    | object_<{ [x: string]: T }>
    ;
}

void (null_.is = is.null)
interface null_ extends ReturnType<typeof t.null> {}
function null_(): null_ { return t.null() }

void (const_.is = <const T>(v: T) => is.literally(v))
interface const_<T extends Finite<T>> extends ReturnType<typeof t.const<T>> 
  { is: (u: unknown) => u is T }
function const_<const T extends Finite<T>>(x: T): const_<T>
function const_<const T extends Finite<T>>(x: T) { return t.const(x) }

void (boolean_.is = is.boolean)
interface boolean_ extends ReturnType<typeof t.boolean> { is: (u: unknown) => u is boolean }
function boolean_(): boolean_
function boolean_() { return t.boolean() }

void (integer_.is = is.integer as (u: unknown) => u is integer)
interface integer_ extends ReturnType<typeof t.integer> 
  { is: (u: unknown) => u is integer }
function integer_(): integer_
function integer_() { return t.integer() }

void (number_.is = is.number)
interface number_ extends ReturnType<typeof t.number> 
  { is: (u: unknown) => u is number }
function number_(): number_
function number_() { return t.number() }

void (string_.is = is.string)
interface string_ extends ReturnType<typeof t.string>
  { is: (u: unknown) => u is string }
function string_(): string_
function string_() { return t.string() }

void (symbol_.is = is.symbol)
interface symbol_ extends ReturnType<typeof t.symbol>
  { is: (u: unknown) => u is symbol }
function symbol_(): symbol_
function symbol_() { return t.symbol() }

void (any_.is = is.any)
interface any_ extends ReturnType<typeof t.any> 
  { is: (u: unknown) => u is typeof u }
function any_(): any_
function any_() { return t.any() }

void (allOf_.is = allOf$)
interface allOf_<S extends typeof t.allOf.spec> extends 
  ReturnType<typeof t.allOf.def<S>> 
  { is: (u: unknown) => u is Intersect<t.typeof<S>> }
function allOf_<const S extends typeof t.allOf.spec>(...ss: S): allOf_<S>
function allOf_<const S extends typeof t.allOf.spec>(...ss: S) { return t.allOf.def(ss) }

void (anyOf_.is = anyOf$)
interface anyOf_<S extends typeof t.anyOf.spec> extends 
  ReturnType<typeof t.anyOf.def<S>> 
  { is: (u: unknown) => u is t.typeof<S[number]> }
function anyOf_<const S extends typeof t.anyOf.spec>(...ss: S): anyOf_<S> 
function anyOf_<const S extends typeof t.anyOf.spec>(...ss: S) { return t.anyOf.def(ss) }

interface optional_<S extends typeof t.optional.spec> extends 
  ReturnType<typeof t.optional.def<S>>
  { is: (u: unknown) => u is undefined | t.typeof<S> }
function optional_<S extends typeof t.optional.spec>(s: S): optional_<S> 
function optional_<S extends typeof t.optional.spec>(s: S) { return t.optional.def(s) }

void (array_.is = is.array)
interface array_<S extends typeof t.array.spec> extends 
  ReturnType<typeof t.array.def<S>>
  { is: (u: unknown) => u is readonly t.typeof<S>[] }
function array_<S extends typeof t.array.spec>(s: S): array_<S> 
function array_<S extends typeof t.array.spec>(s: S) { return t.array.def(s) }

void (record_.is = is.object)
interface record_<S extends typeof t.record.spec> extends 
  ReturnType<typeof t.record.def<S>>
  { is: (u: unknown) => u is globalThis.Record<string, t.typeof<S>> }
function record_<S extends typeof t.record.spec>(x: S): record_<S>
function record_<S extends typeof t.record.spec>(x: S) { return t.record.def(x) }

void (tuple_.is = tuple$)
interface tuple_<S extends typeof t.tuple.spec> extends 
  ReturnType<typeof t.tuple.def<S>>
  { is: (u: unknown) => u is t.typeof<S> }
function tuple_<S extends typeof t.tuple.spec>(s: S): tuple_<S>
function tuple_<S extends typeof t.tuple.spec>(s: S) { return t.tuple.def(s) }

void (object_.is = is.object)
interface object_<S extends typeof t.object.spec> extends 
  ReturnType<typeof t.object.def<S>>
  { is: (u: unknown) => u is { [K in keyof S]: t.typeof<S[K]> } }

function object_<S extends typeof t.object.spec>(s: S): object_<S>
function object_<S extends typeof t.object.spec>(s: S) { return t.object.def(s) }

const Nullary = {
  null: null_.is,
  boolean: boolean_.is,
  symbol: symbol_.is,
  integer: integer_.is,
  number: number_.is,
  string: string_.is,
  const: const_.is,
  any: any_.is,
  allOf: allOf_.is,
  anyOf: anyOf_.is,
  array: array_.is,
  record: record_.is,
  tuple: tuple_.is,
  object: object_.is,
} as const

const Functor: Functor<Guard.lambda, Guard.Node> = {
  map(f) {
    return (x) => {
      switch (true) {
        default: return fn.exhaustive(x)
        case x._tag === "null":
        case x._tag === "boolean":
        case x._tag === "symbol":
        case x._tag === "integer":
        case x._tag === "number":
        case x._tag === "string": 
        case x._tag === "any": return x
        case x._tag === "const": return const_(x._def)
        case x._tag === "allOf": return allOf_(...x._def.map(f))
        case x._tag === "anyOf": return anyOf_(...x._def.map(f))
        case x._tag === "optional": return optional_(f(x._def))
        case x._tag === "array": return array_(f(x._def))
        case x._tag === "record": return record_(f(x._def))
        case x._tag === "tuple": return tuple_(x._def.map(f))
        case x._tag === "object": return object_(map(f)(x._def))
      }
    }
  }
}

function fold<T>(algebra: Functor.Algebra<Guard.lambda, T>) 
  { return fn.cata(Functor)(algebra) }

function unfold<T>(coalgebra: Functor.Coalgebra<Guard.lambda, T>) 
  { return fn.ana(Functor)(coalgebra) }


// export namespace t {
//   /* @ts-expect-error */
//   export class boolean extends t_.boolean { is = is.boolean }
//   export class integer extends t_.integer { is: (u: unknown) => u is int = is.integer }
//   /* @ts-expect-error */
//   export class number extends t_.number { is = is.number }
//   /* @ts-expect-error */
//   export class string extends t_.string { is = is.string }
//   /* @ts-expect-error */
//   export class symbol extends t_.symbol { is = is.symbol }
//   /* @ts-expect-error */
//   export class any extends t_.any { is = is.any }
//   export class allOf<T extends readonly unknown[]> extends t_.allOf<T> 
//     { is: Guard.fromAST<this> = allOf$(...this._children.map((c) => (c as Guard.Node)?.is)) }
//   export class anyOf<T extends readonly unknown[]> extends t_.anyOf<T> 
//     { is: Guard.fromAST<this> = anyOf$(...this._children.map((c) => (c as Guard.Node)?.is)) }
//   export class optional<T> extends t_.optional<T> 
//     { is: Guard.fromAST<this> = anyOf$(is.undefined, (this._children as Guard.Node)?.is) }
//   export class array<T> extends t_.array<T> 
//     { is: Guard.fromAST<this> = array$((this._children as Guard.Node)?.is) as never }
//   export class record<T> extends t_.record<T> 
//     { is: Guard.fromAST<this> = record$((this._children as Guard.Node)?.is) as never }
//   export class tuple<T> extends t_.tuple<T> 
//     { is: Guard.fromAST<this> = tuple$(...(this._children as Guard.Node[]).map((_) => _.is)) as never }
//   export class /// object ↓↓
//     /* @ts-expect-error */
//     object<T> extends lt.object<T> 
//     { is: Guard.fromAST<this> = object$(map(this._children, (x) => (x as Guard.Node).is) as never) }
// }
// export { null$ as null }
// function null$() { return new t.null("null") }
// export function boolean(): t.boolean { return new t.boolean("boolean") }
// export function symbol(): t.symbol { return new t.symbol("symbol") }
// export function integer(): t.integer { return new t.integer("integer") }
// export function number(): t.number { return new t.number("number") }
// export function string(): t.string { return new t.string("string") }
// export function any(): t.any { return new t.any("any") }
// export { const$ as const }
// function const$<const T>(x: T): t.const<T> { return new t.const("const", x) }
// export function optional<T extends Guard.Node>(x: T): t.optional<T> { return new t.optional("optional", x) }
// export function array<T extends Guard.Node>(x: T): t.array<T> { return new t.array("array", x) }
// export function record<T extends Guard.Node>(x: T): t.record<T> { return new t.record("record", x) }
// export function allOf<const T extends readonly t.object<{}>[]>(...xs: T): t.allOf<T> { return new t.allOf("allOf", xs) }
// export function anyOf<const T extends readonly Guard.Node[]>(...xs: T): t.anyOf<T> { return new t.anyOf("anyOf", xs) }
// export function tuple<T extends readonly Guard.Node[]>(...xs: T): t.tuple<T> { return new t.tuple("tuple", xs) }
// export function object<T extends { [x: string]: Guard.Node }>(x: T): t.object<T> { return new t.object("object", x) }
