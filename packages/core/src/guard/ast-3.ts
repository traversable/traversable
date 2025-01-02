import { fn, map } from "@traversable/data"
import type {
  integer,
  Intersect,
  Force,
  Functor,
  HKT,
  newtype,
  symbol,
  Finite,
} from "@traversable/registry"
import type { TypeError } from "@traversable/registry"

export {
  type typeof_ as typeof,
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

  const ScalarShort: keyof ScalarMap

  type Terminal = keyof typeof Terminal
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
    | ["[]", Short]
    | ["{}", Short]
    | ["|", ...Short[]]
    | ["&", ...Short[]]
    | Terminal
    | Composite
    | Const

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
        case x._tag === "object": return object_.def(map(f)(x._def))
      }
    }
  }
}

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
interface null_ { _tag: typeof Tag.null, _def: typeof null_.spec }
declare function null_(): null_
declare namespace null_ {
  const spec: null
  const shorthand: null
  type shorthand<T> = [T] extends [typeof null_.shorthand] ? typeof null_.shorthand : never
}
///    NULL    ///
//////////////////


/////////////////////
///    BOOLEAN    ///
interface boolean_ { _tag: typeof Tag.boolean, _def: typeof boolean_.spec }
declare function boolean_(): boolean_
declare namespace boolean_ {
  const spec: boolean
  const shorthand: typeof Tag.boolean
  type shorthand<T> = [T] extends [typeof boolean_.shorthand] ? typeof boolean_.shorthand : never
}
///    BOOLEAN    ///
/////////////////////


////////////////////
///    SYMBOL    ///
interface symbol_ { _tag: typeof Tag.symbol, _def: typeof symbol_.spec }
declare function symbol_(): symbol_
declare namespace symbol_ {
  const spec: symbol
  const shorthand: typeof Tag.symbol
  type shorthand<T> = [T] extends [typeof symbol_.shorthand] ? typeof symbol_.shorthand : never
}
///    SYMBOL    ///
////////////////////


/////////////////////
///    INTEGER    ///
interface integer_ { _tag: typeof Tag.integer, _def: typeof integer_.spec }
declare function integer_(): integer_
declare namespace integer_ {
  const spec: integer
  const shorthand: typeof Tag.integer
  type shorthand<T> = [T] extends [typeof integer_.shorthand] ? typeof integer_.shorthand : never
}
///    INTEGER    ///
/////////////////////


////////////////////
///    NUMBER    ///
interface number_ { _tag: typeof Tag.number, _def: typeof number_.spec }
declare function number_(): number_
declare namespace number_ {
  const spec: number
  const shorthand: typeof Tag.number
  type shorthand<T> = [T] extends [typeof number_.shorthand] ? typeof number_.shorthand : never
}
///    NUMBER    ///
////////////////////


////////////////////
///    STRING    ///
interface string_ { _tag: typeof Tag.string, _def: typeof string_.spec }
declare function string_(): string_
declare namespace string_ {
  const spec: string
  const shorthand: typeof Tag.string
  type shorthand<T> = [T] extends [typeof string_.shorthand] ? typeof string_.shorthand : never
}
///    STRING    ///
////////////////////


/////////////////
///    ANY    ///
interface any_ { _tag: typeof Tag.any, _def: typeof any_.spec }
declare function any_(): any_
declare namespace any_ {
  const spec: unknown
  const shorthand: typeof Tag.any
  type shorthand<T> = [T] extends [typeof any_.shorthand] ? typeof any_.shorthand : never
}
///    ANY    ///
/////////////////


///////////////////
///    CONST    ///
interface const_<S> {
  _tag: typeof Tag.const,
  _def: S
}
declare function const_<const T extends Finite<T>>(v: T): const_.def<const_.parse<T>>
declare namespace const_ {
  const spec: unknown
  const children: unknown
  type shorthand<T> 
    = [T] extends [string] 
    ? [T] extends [`'${string}'`] ? `'${string}'` 
    : [T] extends [`"${string}"`] ? `"${string}"` 
    : [T] extends [`\`${string}\``] ? `\`${string}\`` 
    : never : unknown
  function def<T extends typeof const_.spec>(): const_.def<T>
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
///    CONST    ///
///////////////////


//////////////////////
///    OPTIONAL    ///
interface optional_<S> { _tag: typeof Tag.optional, _def: S }
declare function optional_<S extends typeof optional_.children>(s: S): optional_.def<S>
declare namespace optional_ {
  const spec: unknown
  const children: AST.Node
  const shorthand: `${string}?`
  type shorthand<T> = [T] extends [typeof optional_.shorthand] ? typeof optional_.shorthand : never
  ///
  function def<S extends typeof optional_.spec>(s: S): optional_.def<S>
  interface def<S extends typeof optional_.spec> { _tag: typeof Tag.optional, _def: S }
  ///
  function type<S extends typeof optional_.children>(s: S): undefined | S["_def"]
  type _type<S extends typeof optional_.children> = undefined | S["_def"]
  interface type<S extends typeof optional_.children> { _type: optional_._type<S> }
}
///    OPTIONAL    ///
//////////////////////


////////////////////
///    ALL OF    ///
interface allOf_<S> { _tag: typeof Tag.allOf, _def: S }
declare function allOf_<S extends typeof allOf_.children>(...ss: S): allOf_<S>
declare namespace allOf_ {
  const spec: readonly unknown[]
  const children: readonly AST.Node[]
  const shorthand: ["&", ...readonly AST.Short[]]
  type shorthand<T> = [T] extends [typeof allOf_.shorthand] ? typeof allOf_.shorthand : never
  type fromShort<S extends typeof allOf_.spec> = never | allOf_<{ -readonly [Ix in keyof S]: AST.fromShort<S[Ix]> }>
  ///
  function def<S extends typeof allOf_.spec>(s: S): allOf_.def<S>
  interface def<S extends typeof allOf_.spec> { _tag: typeof Tag.allOf, _def: S }
  ///
  function type<S extends typeof allOf_.children>(ss: S): allOf_.type<S>
  interface type<S extends typeof allOf_.children> { _type: allOf_._type<S> }
  type _type<S extends typeof allOf_.children> = never | Intersect<[...{ [K in keyof S]: S[K]["_def"] }]>
}
///    ALL OF    ///
////////////////////


////////////////////
///    ANY OF    ///
interface anyOf_<S> { _tag: typeof Tag.anyOf, _def: S }
declare function anyOf_<S extends typeof anyOf_.children>(...ss: S): anyOf_<S>
declare namespace anyOf_ {
  const spec: readonly unknown[]
  const children: readonly AST.Node[]
  const shorthand: ["|", ...readonly AST.Short[]]
  type shorthand<T> = [T] extends [typeof anyOf_.shorthand] ? typeof anyOf_.shorthand : never
  type fromShort<S extends typeof anyOf_.spec> = never | anyOf_<{ -readonly [Ix in keyof S]: AST.fromShort<S[Ix]> }>
  ///
  function def<S extends typeof anyOf_.spec>(s: S): anyOf_.def<S>
  interface def<S extends typeof anyOf_.spec> { _tag: typeof Tag.anyOf, _def: S }
  ///
  function type<S extends typeof anyOf_.children>(ss: S): anyOf_.type<S>
  type _type<S extends typeof anyOf_.children> = never | S[number]["_def"]
  interface type<S extends typeof anyOf_.children> { _type: anyOf_._type<S> }
}
///    ANY OF    ///
////////////////////


///////////////////
///    ARRAY    ///
interface array_<S> { _tag: typeof Tag.array, _def: S }
declare function array_<S extends typeof array_.children>(s: S): array_<S>
declare namespace array_ {
  const spec: unknown
  const children: AST.Node
  type fromShort<S> = never | array_<AST.fromShort<S>>
  function def<S extends typeof array_.spec>(s: S): array_.def<S>
  interface def<S extends typeof array_.spec> { _tag: typeof Tag.array, _def: S }
  ///
  function type<S extends typeof array_.children>(s: S): array_.type<S>
  type _type<S extends typeof array_.children> = never | S["_def"][]
  interface type<S extends typeof array_.children> { _type: array_._type<S> }
}
///    ARRAY    ///
///////////////////


////////////////////
///    RECORD    ///
interface record_<S> { _tag: typeof Tag.record, _def: S }
declare function record_<S extends typeof record_.children>(s: S): record_<S>
declare namespace record_ {
  const spec: unknown
  const children: AST.Node
  type fromShort<T> = never | record_<AST.fromShort<T>>
  ///
  function def<S extends typeof record_.spec>(s: S): record_.def<S>
  interface def<S extends typeof record_.spec> { _tag: typeof Tag.record, _def: S }
  ///
  function type<S extends typeof record_.children>(s: S): record_.type<S>
  type _type<S extends typeof record_.children> = never | globalThis.Record<string, S["_def"]>
  interface type<S extends typeof record_.children> { _type: record_._type<S> }
}
///    RECORD    ///
////////////////////


///////////////////
///    TUPLE    ///
interface tuple_<S> { _tag: typeof Tag.tuple, _def: S }
declare function tuple_<S extends typeof tuple_.children>(...ss: S): tuple_<S>
declare namespace tuple_ {
  type spec<T> = readonly T[]
  const spec: tuple_.spec<unknown>
  const children: tuple_.spec<AST.Node>
  const shorthand: readonly AST.Short[]
  type shorthand<T> = [T] extends [typeof tuple_.shorthand] ? typeof tuple_.shorthand : never
  type fromShort<T extends typeof tuple_.shorthand> = never | tuple_<{ -readonly [I in keyof T]: AST.fromShort<T[I]> }>
  ///
  function def<S extends typeof tuple_.spec>(s: S): tuple_.def<S>
  interface def<S extends typeof tuple_.spec> { _tag: typeof Tag.tuple, _def: S }
  ///
  function type<S extends typeof tuple_.children>(ss: S): tuple_.type<S>
  type _type<S extends typeof tuple_.children> = never | { [K in keyof S]: S[K]["_def"] }
  interface type<S extends typeof tuple_.children> { _type: tuple_._type<S> }
}
///    TUPLE    ///
///////////////////


////////////////////
///    OBJECT    ///
interface object_<S> { _tag: typeof Tag.object, _def: S, _opt: object_.optionalProps<S> }
declare function object_<S extends typeof object_.children>(s: S): object_.def<S>
declare namespace object_ {
  const spec: unknown
  const children: never | { [x: string]: AST.Node }
  ///
  const shorthand: never | { [x: string]: AST.Short }
  type shorthand<T> = [T] extends [typeof object_.shorthand] ? typeof object_.shorthand : never
  type fromShort<T extends typeof object_.shorthand> = never | object_<_fromShort<T>>
  ///
  function def<S extends typeof object_.spec>(s: S): object_.def<S>
  interface def<S extends typeof object_.spec> {
    _tag: typeof Tag.object,
    _def: S
    _opt: object_.optionalProps<S>
  }
  ///
  function type<S extends typeof object_.children>(s: S): object_.type<S>
  interface type<S extends typeof object_.children> { _type: object_._type<S> }
  type _type<
    S,
    Opt extends object_.optionalProps<S> = object_.optionalProps<S>,
    Req extends Exclude<keyof S, Opt> = Exclude<keyof S, Opt>
  > = never | Force<
    & $<{ [K in Opt]+?: AST.typeof<S[K]> }>
    & $<{ [K in Req]-?: AST.typeof<S[K]> }>
  >;
  ///
  type $<T> = [keyof T] extends [never] ? unknown : T
  type optionalProps<T, K extends keyof T = keyof T> = K extends K ? T[K] extends optional_.def<any> ? K : never : never
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

declare function t_typeof<const S>(x: S): typeof_<S>
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


declare function short(s: null): null_
declare function short<const S extends AST.Terminal>(s: S): typeof AST.Terminal[S]
declare function short<const S extends readonly AST.Short[]>($: "|", ...ss: S): anyOf_.fromShort<S>
declare function short<const S extends readonly AST.Short[]>($: "&", ...ss: S): allOf_.fromShort<S>
declare function short<const S extends AST.Short>($: "[]", s: S): array_.fromShort<S>
declare function short<const S extends AST.Short>($: "{}", s: S): record_.fromShort<S>
declare function short<const S extends object_.shorthand<S>>(s: S): object_.fromShort<S>
declare function short<const S extends tuple_.shorthand<S>>(ss: S): tuple_.fromShort<S>
declare function short<const S extends const_.validate<S>>(s: S): const_<S>

// declare function short<const S extends record_.shorthand<S>>(s: S): record_.fromShort<S[1]>
// declare function short<const S extends record_.shorthand<S>>(s: S): record_<S[1]>
// declare function short<const S extends array_.shorthand<S>>($: "[]", s: AST.Short): array_<S[1]>
// declare function short<const S extends anyOf_.shorthand<S>>(...ss: S): anyOf_<tail<S>>
// declare function short<const S extends allOf_.shorthand<S>>(...ss: S): allOf_<tail<S>>
