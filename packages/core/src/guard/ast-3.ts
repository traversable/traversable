import { fn, map } from "@traversable/data"
import type {
  integer,
  Intersect,
  Force,
  Functor,
  HKT,
  newtype,
  Finite,
  TypeError,
} from "@traversable/registry"
import { symbol } from "@traversable/registry"

export {
  typeof_ as typeof,
  AST,
  Functor,
  fold,
  unfold,
  short,
  null_ as null,
  boolean_ as boolean,
  symbol_ as symbol,
  integer_ as integer,
  number_ as number,
  string_ as string,
  any_ as any,
  const_ as const,
  optional_ as optional,
  array_ as array,
  record_ as record,
  tuple_ as tuple,
  allOf_ as allOf,
  anyOf_ as anyOf,
  object_ as object,
}

type ScalarShortName = keyof AST.ScalarMap

/** @internal */
type TerminalArrays_<T extends TerminalSeeds = TerminalSeeds> = never | { [I in keyof T]: `${T[I]}[]` }
/** @internal */
type TerminalRecords_<T extends TerminalSeeds = TerminalSeeds> = { [I in keyof T]: `${T[I]}{}` }

export const TerminalSeeds = ["string", "number", "boolean", "symbol", "integer", "any"] as const satisfies ScalarShortName[]
export type TerminalSeeds = typeof TerminalSeeds
export const TerminalArrays = TerminalSeeds.map((sn) => `${sn}[]` as const) as TerminalArrays_
export type TerminalArrays = typeof TerminalArrays
export const TerminalRecords = TerminalSeeds.map((sn) => `${sn}{}` as const) as TerminalRecords_
export type TerminalRecords = typeof TerminalRecords
export const Terminals = [...TerminalSeeds, ...TerminalArrays, ...TerminalRecords]
export type Terminals = typeof Terminals
export type Terminal = Terminals[number]

declare namespace AST { export { typeof_ as typeof } }
declare namespace AST {
  interface Leaf { _tag: string, _def: unknown }
  interface Branch<T = unknown> extends AST.Leaf { _children: T }
  interface Node extends AST.Leaf { _children?: unknown }

  const ScalarName: keyof typeof ScalarMap
  type ScalarName<T> = [T] extends [typeof ScalarName] ? typeof ScalarName : never

  type ScalarMap = typeof ScalarMap
  const ScalarMap: {
    symbol: symbol_
    boolean: boolean_
    integer: integer_
    number: number_
    string: string_
    any: any_
  }


  const Terminal:
    & ScalarMap
    & { [K in keyof ScalarMap as `${K}[]`]: array_<ScalarMap[K]> }
    & { [K in keyof ScalarMap as `${K}{}`]: record_<ScalarMap[K]> }

  type Composite =
    | readonly AST.Short[]
    | { [x: string]: AST.Short }

  type ScalarConst =
    | number
    | true
    | false
    | `'${string}'`
    | `"${string}"`
    | `\`${string}\``

  type Const =
    | ScalarConst
    | readonly Const[]
    | { [x: string]: Const }

  type Short =
    | null
    | readonly ["[]", Short]
    | readonly ["{}", Short]
    | readonly ["|", ...Short[]]
    | readonly ["&", ...Short[]]
    | Terminal
    | Composite
    | Const

  type ShortF<T> =
    | null
    | Terminal
    | readonly ["[]", T]
    | readonly ["{}", T]
    | readonly ["|", ...T[]]
    | readonly ["&", ...T[]]
    | readonly T[]
    | { [x: string]: T }
    // | Const

  interface ShortLambda extends HKT { [-1]: ShortF<this[0]> }

  type fromShort<S>
    = S extends null ? null_
    : S extends Terminal ? typeof Terminal[S]
    : S extends readonly ["&", ...infer T extends AST.Short[]] ? allOf_<{ -readonly [Ix in keyof T]: fromShort<T[Ix]> }>
    : S extends readonly ["|", ...infer T extends AST.Short[]] ? anyOf_<{ -readonly [Ix in keyof T]: fromShort<T[Ix]> }>
    : S extends readonly ["[]", AST.Short] ? array_<AST.fromShort<S[1]>>
    : S extends readonly ["{}", AST.Short] ? record_<AST.fromShort<S[1]>>
    : S extends object 
      ? S extends readonly unknown[] ? tuple_<{ -readonly [Ix in keyof S]: fromShort<S[Ix]> }>
      : S extends { [x: string]: unknown } ? object_<object_._fromShort<S>>
    : never
    : const_<const_.parse<S>>
    ;

  type F<T> =
    | null_
    | boolean_
    | symbol_
    | integer_
    | number_
    | string_
    | any_
    | const_<any>
    | optional_<T>
    | array_<T>
    | record_<T>
    | allOf_<readonly T[]>
    | anyOf_<readonly T[]>
    | tuple_<readonly T[]>
    | object_<{ [x: string]: T }>
    ;

  interface lambda extends HKT { [-1]: F<this[0]> }
}


declare const test: HKT.apply<AST.ShortLambda, AST.Node>

function typeof_<S>(s: S): typeof_<S> 
function typeof_<S>(s: S) { return s }

type typeof_<S>
  = S extends Nullary ? S["_def"]
  : S extends const_<any> ? const_.parse<S["_def"]>
  : S extends optional_<infer T> ? undefined | typeof_<T>
  : S extends array_<infer T> ? typeof_<T>[]
  : S extends record_<infer T> ? globalThis.Record<string, typeof_<T>>
  : S extends tuple_<infer T> ? { -readonly [I in keyof T]: typeof_<T[I]> }
  : S extends allOf_<infer T extends readonly unknown[]> ? Intersect<{ [I in keyof T]: typeof_<T[I]> }>
  : S extends anyOf_<infer T extends readonly unknown[]> ? typeof_<T[number]>
  : S extends object_<infer T> ? object_._type<T>
  : S
  ;

const Functor: Functor<AST.lambda, AST.Node> = {
  map(f) {
    return (x) => {
      switch (true) {
        default: return fn.exhaustive(x)
        case x._tag === "null": return null_()
        case x._tag === "boolean": return boolean_()
        case x._tag === "symbol": return symbol_()
        case x._tag === "integer": return integer_()
        case x._tag === "number": return number_()
        case x._tag === "string": return string_()
        case x._tag === "any": return any_()
        case x._tag === "const": return const_(x._def)
        case x._tag === "optional": return optional_.def(f(x._def))
        case x._tag === "array": return array_.def(f(x._def))
        case x._tag === "record": return record_.def(f(x._def))
        case x._tag === "allOf": return allOf_.def(x._def.map(f))
        case x._tag === "anyOf": return anyOf_.def(x._def.map(f))
        case x._tag === "tuple": return tuple_.def(x._def.map(f))
        case x._tag === "object": return object_.def(map(x._def, f))
      }
    }
  }
}

/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const Object_values = globalThis.Object.values
/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Array_isArray = globalThis.Array.isArray

function fold<T>(algebra: Functor.Algebra<AST.lambda, T>)
  { return fn.cata(Functor)(algebra) }
function unfold<T>(coalgebra: Functor.Coalgebra<AST.lambda, T>)
  { return fn.ana(Functor)(coalgebra) }

function AST() {}
AST.fold = fold
AST.unfold = unfold
AST.Functor = Functor

type Nullary =
  | null_
  | boolean_
  | symbol_
  | integer_
  | number_
  | string_
  | any_
  ;

type NullaryTag = typeof NullaryTag[keyof typeof NullaryTag]
const NullaryTag = {
  any: "any",
  string: "string",
  number: "number",
  boolean: "boolean",
  symbol: "symbol",
  null: "null",
  integer: "integer",
} as const

type Tag = typeof Tag[keyof typeof Tag]
const Tag = {
  ...NullaryTag,
  object: "object",
  array: "array",
  allOf: "allOf",
  const: "const",
  tuple: "tuple",
  optional: "optional",
  record: "record",
  anyOf: "anyOf",
} as const

//////////////////
///    NULL    ///
interface null_ 
  { _tag: typeof Tag.null, _def: typeof null_.spec }
function null_(): null_ 
  { return { _tag: Tag.null, _def: symbol.null as never } }
declare namespace null_ {
  const spec: null
  type Short = typeof shorthand
  const shorthand: null
  type shorthand<T> = [T] extends [typeof null_.shorthand] ? typeof null_.shorthand : never
}
///    NULL    ///
//////////////////


/////////////////////
///    BOOLEAN    ///
interface boolean_ 
  { _tag: typeof Tag.boolean, _def: typeof boolean_.spec }
function boolean_(): boolean_
  { return { _tag: Tag.boolean, _def: symbol.boolean as never } }

declare namespace boolean_ {
  const spec: boolean
  type Short = typeof shorthand
  const shorthand: typeof Tag.boolean
  type shorthand<T> = [T] extends [typeof boolean_.shorthand] ? typeof boolean_.shorthand : never
}
///    BOOLEAN    ///
/////////////////////


////////////////////
///    SYMBOL    ///
interface symbol_ 
  { _tag: typeof Tag.symbol, _def: typeof symbol_.spec }
function symbol_(): symbol_
  { return { _tag: Tag.symbol, _def: symbol.symbol as never } }

declare namespace symbol_ {
  const spec: symbol
  type Short = typeof shorthand
  const shorthand: typeof Tag.symbol
  type shorthand<T> = [T] extends [typeof symbol_.shorthand] ? typeof symbol_.shorthand : never
}
///    SYMBOL    ///
////////////////////


/////////////////////
///    INTEGER    ///
interface integer_ 
  { _tag: typeof Tag.integer, _def: typeof integer_.spec }
function integer_(): integer_
  { return { _tag: Tag.integer, _def: symbol.integer as never } }
declare namespace integer_ {
  const spec: integer
  type Short = typeof shorthand
  const shorthand: typeof Tag.integer
  type shorthand<T> = [T] extends [typeof integer_.shorthand] ? typeof integer_.shorthand : never
}
///    INTEGER    ///
/////////////////////


////////////////////
///    NUMBER    ///
interface number_ 
  { _tag: typeof Tag.number, _def: typeof number_.spec }
function number_(): number_
  { return { _tag: Tag.number, _def: symbol.number as never } }
declare namespace number_ {
  const spec: number
  type Short = typeof shorthand
  const shorthand: typeof Tag.number
  type shorthand<T> = [T] extends [typeof number_.shorthand] ? typeof number_.shorthand : never
}
///    NUMBER    ///
////////////////////


////////////////////
///    STRING    ///
interface string_ 
  { _tag: typeof Tag.string, _def: typeof string_.spec }
function string_(): string_
  { return { _tag: Tag.string, _def: symbol.string as never } }
declare namespace string_ {
  const spec: string
  const shorthand: typeof Tag.string
  type Short = typeof string_.shorthand
  type shorthand<T> = [T] extends [typeof string_.shorthand] ? typeof string_.shorthand : never
}
///    STRING    ///
////////////////////


/////////////////
///    ANY    ///
interface any_ 
  { _tag: typeof Tag.any, _def: typeof any_.spec }
function any_(): any_
  { return { _tag: Tag.any, _def: symbol.any as never } }
declare namespace any_ {
  const spec: unknown
  const shorthand: typeof Tag.any
  type Short = typeof any_.shorthand
  type shorthand<T> = [T] extends [typeof any_.shorthand] ? typeof any_.shorthand : never
}
///    ANY    ///
/////////////////


///////////////////
///    CONST    ///
interface const_<S> 
  { _tag: typeof Tag.const, _def: S }
function const_<const T extends Finite<T>>(v: T): const_<const_.parse<T>>
function const_<const T extends Finite<T>>(v: T)
  { return const_.def(v) }

declare namespace const_ {
  const spec: unknown
  const children: unknown
  type shorthand<T> 
    = [T] extends [string] 
    ? [T] extends [`'${string}'`] ? `'${string}'` 
    : [T] extends [`"${string}"`] ? `"${string}"` 
    : [T] extends [`\`${string}\``] ? `\`${string}\`` 
    : never : unknown
  interface def<T extends typeof const_.spec> { _tag: typeof Tag.const, _def: T }
  type validate<S>
    = [S] extends [string] ? 
    | [S] extends [ `'${string}'` ] ? `'${string}'`
    : [S] extends [ `"${string}"` ] ? `"${string}"`
    : [S] extends [`\`${string}\``] ? `\`${string}\``
    : TypeError<`'const' requires string literals to be be wrapped in quotes (for example, pass '"hi"' instead of 'hi')`, S>
    : unknown
  type parse<S> 
    = [S] extends [ `'${infer T}'` ] ? T
    : [S] extends [ `"${infer T}"` ] ? T
    : [S] extends [`\`${infer T}\``] ? T
    : S
    ;
}
namespace const_ {
  export function def<T extends typeof const_.spec>(v: T): const_.def<T>
    { return { _tag: Tag.const, _def: v } }

}
///    CONST    ///
///////////////////


//////////////////////
///    OPTIONAL    ///
interface optional_<S> 
  { _tag: typeof Tag.optional, _def: S }
function optional_<S extends typeof optional_.children>(s: S): optional_.def<S> 
  { return optional_.def(s) }

declare namespace optional_ {
  const spec: unknown
  const children: AST.Node
  const shorthand: `${string}?`
  type Short = typeof optional_.shorthand
  type shorthand<T> = [T] extends [typeof optional_.shorthand] ? typeof optional_.shorthand : never
  ///
  interface def<S extends typeof optional_.spec> { _tag: typeof Tag.optional, _def: S }
  ///
  function type<S extends typeof optional_.children>(s: S): undefined | S["_def"]
  type _type<S extends typeof optional_.children> = undefined | S["_def"]
  interface type<S extends typeof optional_.children> { _type: optional_._type<S> }
}
namespace optional_ {
  export function def<S extends typeof optional_.spec>(s: S): optional_.def<S>
    { return { _tag: Tag.optional, _def: s } }
}
///    OPTIONAL    ///
//////////////////////


////////////////////
///    ALL OF    ///
interface allOf_<S> 
  { _tag: typeof Tag.allOf, _def: S }
function allOf_<S extends typeof allOf_.children>(...ss: S): allOf_<S> 
  { return allOf_.def(ss) }

declare namespace allOf_ {
  const spec: readonly unknown[]
  const children: readonly AST.Node[]
  const shorthand: Short<AST.Short>
  type Short<T> = readonly ["&", ...readonly T[]]
  type shorthand<T> = [T] extends [Short<T>] ? Short<T> : never
  type fromShort<S extends typeof allOf_.spec> = never | allOf_<{ -readonly [Ix in keyof S]: AST.fromShort<S[Ix]> }>
  ///
  interface def<S extends typeof allOf_.spec> { _tag: typeof Tag.allOf, _def: S }
  ///
  function type<S extends typeof allOf_.children>(ss: S): allOf_.type<S>
  interface type<S extends typeof allOf_.children> { _type: allOf_._type<S> }
  type _type<S extends typeof allOf_.children> = never | Intersect<[...{ [K in keyof S]: S[K]["_def"] }]>
}
namespace allOf_ {
  export function def<S extends typeof allOf_.spec>(ss: S): allOf_.def<S>
  export function def<S extends typeof allOf_.spec>(ss: S): allOf_.def<S> 
  { return { _tag: Tag.allOf, _def: ss } }

}
///    ALL OF    ///
////////////////////


////////////////////
///    ANY OF    ///
interface anyOf_<S> 
  { _tag: typeof Tag.anyOf, _def: S }
function anyOf_<S extends typeof anyOf_.children>(...ss: S): anyOf_<S>
  { return anyOf_.def(ss) }

declare namespace anyOf_ {
  const spec: readonly unknown[]
  const children: readonly AST.Node[]
  const shorthand: Short<AST.Short>
  type Short<T> = readonly ["|", ...readonly T[]]
  type shorthand<T> = [T] extends [anyOf_.Short<T>] ? anyOf_.Short<T> : never
  type fromShort<S extends typeof anyOf_.spec> = never | anyOf_<{ -readonly [Ix in keyof S]: AST.fromShort<S[Ix]> }>
  ///
  interface def<S extends typeof anyOf_.spec> { _tag: typeof Tag.anyOf, _def: S }
  ///
  function type<S extends typeof anyOf_.children>(ss: S): anyOf_.type<S>
  type _type<S extends typeof anyOf_.children> = never | S[number]["_def"]
  interface type<S extends typeof anyOf_.children> { _type: anyOf_._type<S> }
}
namespace anyOf_ {
  export function def<S extends typeof anyOf_.spec>(ss: S): anyOf_.def<S>
    { return { _tag: Tag.anyOf, _def: ss } }
}
///    ANY OF    ///
////////////////////


///////////////////
///    ARRAY    ///
interface array_<S> 
  { _tag: typeof Tag.array, _def: S }
function array_<S extends typeof array_.children>(s: S): array_<S> 
  { return array_.def(s) }

declare namespace array_ {
  const spec: unknown
  const children: AST.Node
  type fromShort<S> = never | array_<AST.fromShort<S>>
  const shorthand: Short<AST.Short>
  type Short<T> = readonly ["[]", T]
  interface def<S extends typeof array_.spec> { _tag: typeof Tag.array, _def: S }
  ///
  function type<S extends typeof array_.children>(s: S): array_.type<S>
  type _type<S extends typeof array_.children> = never | S["_def"][]
  interface type<S extends typeof array_.children> { _type: array_._type<S> }
}
namespace array_ {
  export function def<S extends typeof array_.spec>(s: S): array_.def<S>
  export function def<S extends typeof array_.spec>(s: S): array_.def<S>
    { return { _tag: Tag.array, _def: s } } 
}
///    ARRAY    ///
///////////////////


////////////////////
///    RECORD    ///
interface record_<S> 
  { _tag: typeof Tag.record, _def: S }
function record_<S extends typeof record_.children>(s: S): record_<S>
  { return record_.def(s) }

declare namespace record_ {
  const spec: unknown
  const children: AST.Node
  type fromShort<T> = never | record_<AST.fromShort<T>>

  const shorthand: Short<AST.Short>
  type Short<T> = readonly ["{}", T]

  ///
  interface def<S extends typeof record_.spec> { _tag: typeof Tag.record, _def: S }
  ///
  function type<S extends typeof record_.children>(s: S): record_.type<S>
  type _type<S extends typeof record_.children> = never | globalThis.Record<string, S["_def"]>
  interface type<S extends typeof record_.children> { _type: record_._type<S> }
}
namespace record_ {
  export function def<S extends typeof record_.spec>(s: S): record_.def<S>
    { return { _tag: Tag.record, _def: s } }
}
///    RECORD    ///
////////////////////


///////////////////
///    TUPLE    ///
interface tuple_<S> 
  { _tag: typeof Tag.tuple, _def: S }
function tuple_<S extends typeof tuple_.children>(...ss: S): tuple_<S>
  { return tuple_.def(ss) }

declare namespace tuple_ {
  type spec<T> = readonly T[]
  const spec: tuple_.spec<unknown>
  const children: tuple_.spec<AST.Node>
  const shorthand: Short<AST.Short>
  type Short<T> = readonly T[]

  type shorthand<T> = [T] extends [typeof tuple_.shorthand] ? typeof tuple_.shorthand : never
  type fromShort<T extends typeof tuple_.shorthand> = never | tuple_<{ -readonly [I in keyof T]: AST.fromShort<T[I]> }>
  ///
  interface def<S extends typeof tuple_.spec> { _tag: typeof Tag.tuple, _def: S }
  ///
  function type<S extends typeof tuple_.children>(ss: S): tuple_.type<S>
  type _type<S extends typeof tuple_.children> = never | { [K in keyof S]: S[K]["_def"] }
  interface type<S extends typeof tuple_.children> { _type: tuple_._type<S> }
}
namespace tuple_ {
  export function def<S extends typeof tuple_.spec>(ss: S): tuple_.def<S>
    { return { _tag: Tag.tuple, _def: ss } }
}
///    TUPLE    ///
///////////////////


////////////////////
///    OBJECT    ///
interface object_<S> 
  { _tag: typeof Tag.object, _def: S, _opt: object_._opt<S>[] }

function object_<S extends typeof object_.children>(s: S) { 
  return { 
    _tag: Tag.object, 
    _def: object_.def(s),
    _opt: object_._opt(s),
  }
}

namespace object_ {
  export function hasQuestionMark<K extends string>(key: K): key is K & `${string}?` { return key.endsWith("?") }
  export function rmQuestionMark<K extends string>(key: K): string { return key.endsWith("?") ? key.slice(0, -1) : key }
  export function _opt<S>(children: { [x: string]: S }): _opt<S>[]
  export function _opt<S extends { [x: string]: unknown }>(children: S): string[] 
    { return Object_keys(children).filter(hasQuestionMark).map((k) => k.slice(0, -1)) }
  
  export function def<S extends typeof object_.spec>(children: S): object_<S>
  export function def(children: typeof object_.children): { [x: string]: unknown } {
    let out: { [x: string]: unknown } = {}
    const ks = Object_keys(children)
    for (let ix = 0, len = ks.length; ix < len; ix++) {
      const k = ks[ix]
      out[rmQuestionMark(k)] = hasQuestionMark(k) ? optional_(children[k]) : children[k]
    }
    return out
  }
}

declare namespace object_ {
  const spec: never | { [x: string]: unknown }
  const children: never | { [x: string]: AST.Node }
  ///
  const shorthand: never | Short<AST.Short>
  type Short<T> = never | { [x: string]: T }
  type shorthand<T> = [T] extends [typeof object_.shorthand] ? typeof object_.shorthand : never
  type fromShort<T extends typeof object_.shorthand> = never | object_<_fromShort<T>>
  ///
  interface def<S extends typeof object_.spec> {
    _tag: typeof Tag.object,
    _def: S
    _opt: object_._opt<S>
  }
  ///
  function type<S extends typeof object_.children>(s: S): object_.type<S>
  interface type<S extends typeof object_.children> { _type: object_._type<S> }
  type _type<
    S,
    Opt extends object_._opt<S> = object_._opt<S>,
    Req extends Exclude<keyof S, Opt> = Exclude<keyof S, Opt>
  > = never | Force<
    & $<{ [K in Opt]+?: AST.typeof<S[K]> }>
    & $<{ [K in Req]-?: AST.typeof<S[K]> }>
  >;
  ///
  type $<T> = [keyof T] extends [never] ? unknown : T
  type _opt<T, K extends keyof T = keyof T> = K extends K ? T[K] extends optional_.def<any> ? K : never : never
  type hasQuestionMark<T, K extends string & keyof T = string & keyof T> = K extends `${string}?` ? K : never
  type noQuestionMark<T, K extends keyof T = keyof T> = K extends `${string}?` ? never : K
  ///
  type _fromShort<
    S,
    Opt extends object_.hasQuestionMark<S> = object_.hasQuestionMark<S>,
    Req extends object_.noQuestionMark<S> = object_.noQuestionMark<S>
  > = never | Force<
    & $<{ [K in Opt as K extends `${infer _}?` ? _ : K]: optional_<AST.fromShort<S[K]>> }>
    & $<{ [K in Req]-?: AST.fromShort<S[K]> }>
  >
}
///    OBJECT    ///
////////////////////

const zzzs = object_({ a: optional_(number_()), b: string_() })._opt

const isScalarShortName = (s: string): s is Terminal => Terminals.includes(s as never)

const isShorthand = (_: unknown): _ is AST.Short => true
const isTerminal = (u: unknown): u is Terminal => typeof u === "string" && isScalarShortName(u)
const isArrayShorthand = <T>(u: unknown): u is array_.Short<T> => Array_isArray(u) && u[0] === "[]"
const isRecordShorthand = <T>(u: unknown): u is record_.Short<T> => Array_isArray(u) && u[0] === "{}"
const isTupleShorthand = <T>(u: unknown): u is tuple_.Short<T> => Array_isArray(u) && u.every(isShorthand)
const isObjectShorthand = <T>(u: unknown): u is object_.Short<T> => !!u && typeof u === "object" && Object_values(u).every(isShorthand)
const isAllOfShorthand = <T>(u: unknown): u is allOf_.Short<T> => Array_isArray(u) && u[0] === "|"
const isAnyOfShorthand = <T>(u: unknown): u is anyOf_.Short<T> => Array_isArray(u) && u[0] === "&"
const isConstStringLiteral 
  : (s: AST.Short) => s is `'${string}'` | `"${string}"` | `\`${string}\``
  = (s): s is never => 
    typeof s === "string" && (
      s.startsWith("'") && s.endsWith("'") || 
      s.startsWith("`") && s.endsWith("`") || 
      s.startsWith(`"`) && s.endsWith(`"`)
    )

const terminalMap = {
  boolean: boolean_,
  "boolean[]": fn.flow(boolean_, array_),
  "boolean{}": fn.flow(boolean_, record_),
  symbol: symbol_,
  "symbol[]": fn.flow(symbol_, array_),
  "symbol{}": fn.flow(symbol_, record_),
  integer: integer_,
  "integer[]": fn.flow(integer_, array_),
  "integer{}": fn.flow(integer_, record_),
  number: number_,
  "number[]": fn.flow(number_, array_),
  "number{}": fn.flow(number_, record_),
  string: string_,
  "string[]": fn.flow(string_, array_),
  "string{}": fn.flow(string_, record_),
  any: any_,
  "any[]": fn.flow(any_, array_),
  "any{}": fn.flow(any_, record_),
} as const satisfies { [K in keyof typeof AST.Terminal]: () => typeof AST.Terminal[K] }

type tail<S> = S extends readonly [any, ...infer T] ? T : never
function tail<const T extends readonly unknown[]>(xs: T): tail<T>
function tail<const T extends readonly unknown[]>(xs: T) 
  { return xs.slice(1) }

const ShortFunctor: Functor<AST.ShortLambda, AST.Short> = {
  map: (f) => (x) => {
    switch (true) {
      default: return fn.exhaustive(x)
      case x === null: return x
      case isTerminal(x): return x
      case isArrayShorthand(x): return [x[0], f(x[1])]
      case isRecordShorthand(x): return [x[0], f(x[1])]
      case isAllOfShorthand(x): return [x[0], f(x[1])]
      case isAnyOfShorthand(x): return [x[0], f(x[1])]
      case isObjectShorthand(x): return map(x, f)
      case isTupleShorthand(x): return map(x, f)
    }
  }
}

function foldShort<T>(algebra: Functor.Algebra<AST.ShortLambda, T>) 
  { return fn.cata(ShortFunctor)(algebra) }
function unfoldShort<T>(coalgebra: Functor.Coalgebra<AST.ShortLambda, T>) 
  { return fn.ana(ShortFunctor)(coalgebra) }

export namespace Recursive {
  export const fromSeed: Functor.Algebra<AST.ShortLambda, AST.Node> = (x) => {
    switch (true) {
      default: return fn.exhaustive(x)
      case x === null: return null_()
      case isTerminal(x): return terminalMap[x]()
      case isArrayShorthand(x): return array_(x[1])
      case isRecordShorthand(x): return record_(x[1])
      case isAllOfShorthand(x): return allOf_(...tail(x))
      case isAnyOfShorthand(x): return anyOf_(...tail(x))
      case isTupleShorthand(x): return tuple_(...x)
      case isObjectShorthand(x): return object_(x)
    }
  }
}

export const fromSeed = foldShort(Recursive.fromSeed)


/**
 * @example
 * type Short =
 *   | null
 *   | readonly ["[]", Short]
 *   | readonly ["{}", Short]
 *   | readonly ["|", ...Short[]]
 *   | readonly ["&", ...Short[]]
 *   | Terminal
 *   | Composite
 *   | Const
 */

const matchShorthand = (s: AST.Short) => {
  return (_: any) => {
    switch (true) {
      case s === null: return null_()
      case isTerminal(s): return terminalMap[s]()
      case isArrayShorthand(s): return array_(s[1])
      case isRecordShorthand(s): return record_(_)
      case isTupleShorthand(s): return tuple_(s)
      case isObjectShorthand(s): return object_(s)
      case isAllOfShorthand(s): return allOf_(_)
      case isAnyOfShorthand(s): return anyOf_(_)
      case isConstStringLiteral(s): return const_(_)
      case typeof s === "number": return const_(_)
      case typeof s === "boolean": return const_(_)
      default: return (fn.softExhaustiveCheck(s), const_(_))
    }
  }
}

// function short(s: null): null_
// function short<const S extends AST.Terminal>(s: S): typeof AST.Terminal[S]
// function short<const S extends readonly AST.Short[]>($: "|", ...ss: S): anyOf_.fromShort<S>
// function short<const S extends readonly AST.Short[]>($: "&", ...ss: S): allOf_.fromShort<S>
// function short<const S extends AST.Short>($: "[]", s: S): array_.fromShort<S>
// function short<const S extends AST.Short>($: "{}", s: S): record_.fromShort<S>
// function short<const S extends object_.shorthand<S>>(s: S): object_.fromShort<S>
// function short<const S extends tuple_.shorthand<S>>(ss: S): tuple_.fromShort<S>
// function short<const S extends const_.validate<S>>(s: S): const_<S>

const short: {
  (s: null): null_
  <const S extends Terminal>(s: S): typeof AST.Terminal[S]
  <const S extends readonly AST.Short[]>($: "|", ...ss: S): anyOf_.fromShort<S>
  <const S extends readonly AST.Short[]>($: "&", ...ss: S): allOf_.fromShort<S>
  <const S extends AST.Short>($: "[]", s: S): array_.fromShort<S>
  <const S extends AST.Short>($: "{}", s: S): record_.fromShort<S>
  <const S extends object_.shorthand<S>>(s: S): object_.fromShort<S>
  <const S extends tuple_.shorthand<S>>(ss: S): tuple_.fromShort<S>
  <const S extends const_.validate<S>>(s: S): const_<S>
} = matchShorthand as never


// (s: never): unknown {
//   return matchShorthand(s)
// }


// declare function short<const S extends record_.shorthand<S>>(s: S): record_.fromShort<S[1]>
// declare function short<const S extends record_.shorthand<S>>(s: S): record_<S[1]>
// declare function short<const S extends array_.shorthand<S>>($: "[]", s: AST.Short): array_<S[1]>
// declare function short<const S extends anyOf_.shorthand<S>>(...ss: S): anyOf_<tail<S>>
// declare function short<const S extends allOf_.shorthand<S>>(...ss: S): allOf_<tail<S>>
