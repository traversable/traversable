import { fn, map } from "@traversable/data"
import type {
  Force,
  Functor,
  HKT,
  Intersect,
  Partial,
  Primitive,
  TypeError,
  integer,
  newtype,
} from "@traversable/registry"
import { symbol } from "@traversable/registry"
import { allOf$, anyOf$, array$, object$, optional$, record$, tuple$ } from "./combinators.js"
import { is } from "./predicates.js"

export type {
  type,
  Schema,
}
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

type Schema<T> = type<T>
interface type<T> extends newtype<T & { [symbol.schema]?: symbol.schema }> {}

type ScalarShortName = keyof AST.ScalarMap


/** @internal */
type TerminalArrays_<T extends TerminalSeeds = TerminalSeeds> = never | { [I in keyof T]: `${T[I]}[]` }
/** @internal */
type TerminalRecords_<T extends TerminalSeeds = TerminalSeeds> = never | { [I in keyof T]: `${T[I]}{}` }

/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const Array_isArray = globalThis.Array.isArray

export const TerminalSeeds = ["string", "number", "boolean", "symbol", "integer", "any"] as const satisfies ScalarShortName[]
export type TerminalSeeds = typeof TerminalSeeds
export const TerminalArrays = TerminalSeeds.map((sn) => `${sn}[]` as const) as TerminalArrays_
export type TerminalArrays = typeof TerminalArrays
export const TerminalRecords = TerminalSeeds.map((sn) => `${sn}{}` as const) as TerminalRecords_
export type TerminalRecords = typeof TerminalRecords
export const Terminals = [...TerminalSeeds, ...TerminalArrays, ...TerminalRecords]
export type Terminals = typeof Terminals
export type Terminal = Terminals[number]

type AST<T> = symbol_ | boolean_ | number_ | string_ | null_ | array_<T> | object_<T>

declare namespace AST {
  export {
    typeof_ as typeof,
    Terminal,
  }
}
declare namespace AST {
  interface Leaf<T = any> { _tag: string, _def: unknown, is: (u: unknown) => u is T }
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

  const TerminalByTag:
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

  type Shortish =
    | null
    | readonly ["[]" | "{}", {}]
    | readonly ["&" | "|", ...{}[]]
    | (string & {})
    | readonly {}[]
    | { [x: string]: {} }
    ;

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
    : S extends Terminal ? typeof TerminalByTag[S]
    : S extends readonly ["&", ...infer T extends AST.Short[]] ? allOf_<{ -readonly [Ix in keyof T]: fromShort<T[Ix]> }>
    : S extends readonly ["|", ...infer T extends AST.Short[]]
      ? { -readonly [Ix in keyof T]: fromShort<T[Ix]> } extends
      infer U extends AST.Node[] ? anyOf_<U> & { is: (u: unknown) => u is U[number] }
      : never
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

function typeof_<S>(s: S): typeof_<S>
function typeof_<S>(s: S) { return s }

/**
 * ## {@link typeof_ `t.typeof`}
 * 
 * Infer/extract the TypeScript type that an AST represents. If you've used
 * zod before, {@link typeof_ `t.typeof`} is analogous to `z.infer`.
 * 
 * @example
 * import * as vi from "vitest"
 * import { t } from "@traversable/core"
 * 
 * const ex_01 = t.object({ a: t.boolean(), b: t.array(t.number()), c: t.record(t.string()) })
 * const ex_02 = t.short({ a: "boolean", b: "number[]", c: "string{}" })
 * 
 * vi.assert.deepEqual(ex_01, ex_02)
 * 
 * type Ex_01 = t.typeof<typeof ex_01>
 * type Ex_02 = t.typeof<typeof ex_02>
 */
type typeof_<S>
  = S extends type<infer T> ? T
  : S extends Nullary ? S["_def"]
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
        case x._tag === "optional": return optional_.def(f(x._def)) as never
        case x._tag === "array": return array_.def(f(x._def)) as never
        case x._tag === "record": return record_.def(f(x._def)) as never
        case x._tag === "allOf": return allOf_.def(x._def.map(f)) as never
        case x._tag === "anyOf": return anyOf_.def(x._def.map(f)) as never
        case x._tag === "tuple": return tuple_.def(x._def.map(f)) as never
        case x._tag === "object": return object_.def(map(x._def, f))
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
interface null_ {
  _tag: typeof Tag.null
  _def: typeof null_.spec
  is: (u: unknown) => u is null
}
function null_(): null_
function null_() {
  return {
    _tag: Tag.null,
    _def: symbol.null as never,
    is: is.null,
  }
}
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
interface boolean_ {
  _tag: typeof Tag.boolean
  _def: typeof boolean_.spec
  is: (u: unknown) => u is boolean
}

function boolean_(): boolean_
function boolean_() {
  return {
    _tag: Tag.boolean,
    _def: symbol.boolean as never,
    is: is.boolean
  }
}

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
interface symbol_ {
  _tag: typeof Tag.symbol
  _def: typeof symbol_.spec
  is: (u: unknown) => u is symbol
}
function symbol_(): symbol_
function symbol_() {
  return {
    ...symbol_.def,
    is: is.symbol,
  }
}

declare namespace symbol_ {
  const spec: symbol
  type Short = typeof shorthand
  const shorthand: typeof Tag.symbol
  type shorthand<T> = [T] extends [typeof symbol_.shorthand] ? typeof symbol_.shorthand : never
}
namespace symbol_ {
  export const def = {
    _tag: Tag.symbol,
    _def: symbol.symbol as never
  }
}
///    SYMBOL    ///
////////////////////


/////////////////////
///    INTEGER    ///
interface integer_ {
  _tag: typeof Tag.integer
  _def: typeof integer_.spec
  is: (u: unknown) => u is integer
}
function integer_(): integer_ {
  return {
    ...integer_.def,
    is: is.integer as (u: unknown) => u is integer,
  }
}
declare namespace integer_ {
  const spec: integer
  type Short = typeof shorthand
  const shorthand: typeof Tag.integer
  type shorthand<T> = [T] extends [typeof integer_.shorthand] ? typeof integer_.shorthand : never
}
namespace integer_ {
  export const def = {
    _tag: Tag.integer,
    _def: symbol.integer as never as integer,
  }
}
///    INTEGER    ///
/////////////////////


////////////////////
///    NUMBER    ///
interface number_ {
  _tag: typeof Tag.number
  _def: typeof number_.spec
  is: (u: unknown) => u is number
}
function number_(): number_ {
  return {
    _tag: Tag.number,
    _def: symbol.number as never,
    is: is.number
  }
}

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
interface string_ {
  _tag: typeof Tag.string
  _def: typeof string_.spec
  is: (u: unknown) => u is string
}
function string_(): string_ {
  return {
    _tag: Tag.string,
    _def: symbol.string as never,
    is: is.string
  }
}

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
interface any_ {
  _tag: typeof Tag.any
  _def: typeof any_.spec
  is: (u: unknown) => u is unknown
}
function any_(): any_
function any_() {
  return {
    _tag: Tag.any,
    _def: symbol.any as never,
    is: is.any,
  }
}

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
interface const_<S> {
  _tag: typeof Tag.const
  _def: S
  is: (u: unknown) => u is S
}
function const_<const T extends [T] extends [Primitive] ? Primitive : never>(v: T): const_<const_.parse<T>>
function const_<const T extends { [x: number]: unknown }>(v: T, options: const_.Options<T>): const_<T>
function const_<const T extends { [x: number]: unknown }>(v: T, options?: const_.Options<T>): const_<T>
function const_<const T>(v: T, options?: const_.Options) {
  const eq = options?.eq
  const def = const_.def(v)
  const is = eq !== undefined 
    ? (u: unknown): u is never => eq(def._def, u) 
    : (u: unknown): u is never => u === def._def
  return {
    ...def,
    is,
  }
}

declare namespace const_ {
  type Options<T = any> = Partial<{
    /**
     * ## {@link defaults.eq `Options.eq`}
     *
     * The {@link const_ `t.const`} combinator creates a schema that
     * checks whether its argument matches the argument that was originally used
     * when the schema was defined.
     * 
     * However, if the value given to {@link const_ `t.const`} is an object,
     * that object (by default) will be compared to the original using 
     * {@link defaults.eq `defaults.eq`} (which compares both objects using `SameValueZero`
     * semantics).
     * 
     * If you'd like {@link const_ `t.const`} to compare both objects 
     * differently, use {@link const_.defaults.eq `Options.eq`} to provide
     * the alternative equivalence test that {@link const_ `t.const`} should use.
     * 
     * See also:
     * - [MDN: equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
     * - [TC39 spec: `SameValueZero`](https://tc39.es/ecma262/multipage/abstract-operations.html#sec-samevaluezero)
     */
    eq(left: typeof_<T>, right: typeof_<T>): boolean
  }>

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
  export const defaults = {
    eq: globalThis.Object.is,
  } satisfies Required<Options>

  export function def<T extends typeof const_.spec>(v: T): const_.def<T> {
    return {
      _tag: Tag.const,
      _def: v,
    }
  }
}
///    CONST    ///
///////////////////


//////////////////////
///    OPTIONAL    ///
interface optional_<S> {
  _tag: typeof Tag.optional
  _def: S
  is: (u: unknown) => u is undefined | typeof_<S>
}
function optional_<S extends typeof optional_.children>(s: S): optional_<S>
function optional_<S extends typeof optional_.children>(s: S) {
  return {
    ...optional_.def(s),
    is: optional$(s.is),
  }
}

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
interface allOf_<S> {
  _tag: typeof Tag.allOf
  _def: S
  // is: (u: unknown) => u is S
}
function allOf_<
  S extends typeof allOf_.children,
  T extends
  | { [Ix in keyof S]: typeof_<S[Ix]> }
  = { [Ix in keyof S]: typeof_<S[Ix]> }
>(...ss: S): allOf_<S> & { is: (u: unknown) => u is Intersect<T> }
function allOf_<S extends typeof allOf_.children>(...ss: S) {
  return {
    ...allOf_.def(ss),
    is: allOf$(...ss.map((s) => s.is)),
  }
}

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
  export function def<S extends typeof allOf_.spec>(ss: S): allOf_.def<S> { return { _tag: Tag.allOf, _def: ss } }
}
///    ALL OF    ///
////////////////////


////////////////////
///    ANY OF    ///
interface anyOf_<S extends typeof anyOf_.spec> {
  _tag: typeof Tag.anyOf
  _def: S
  // is: (u: unknown) => u is { [Ix in keyof S]: typeof_<S[Ix]> }
}
function anyOf_<
  S extends typeof anyOf_.children,
  T extends
  | { [Ix in keyof S]: typeof_<S[Ix]> }
  = { [Ix in keyof S]: typeof_<S[Ix]> }
>(...ss: S): anyOf_<S> & { is: (u: unknown) => u is T[number] }
function anyOf_<S extends typeof anyOf_.children>(...ss: S) {
  return {
    ...anyOf_.def(ss),
    is: anyOf$(...ss.map((s) => s.is)),
  }
}

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
  export function def<S extends typeof anyOf_.spec>(ss: S): anyOf_.def<S> { return { _tag: Tag.anyOf, _def: ss } }
}
///    ANY OF    ///
////////////////////


///////////////////
///    ARRAY    ///
interface array_<S> {
  _tag: typeof Tag.array
  _def: S
  is: (u: unknown) => u is typeof_<S>[]
}
function array_<S extends typeof array_.children>(s: S): array_<S>
function array_<S extends typeof array_.children>(s: S) {
  return {
    ...array_.def(s),
    is: array$(s.is),
  }
}

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
interface record_<S> {
  _tag: typeof Tag.record
  _def: S
  is: (u: unknown) => u is globalThis.Record<string, typeof_<S>>
}
function record_<S extends typeof record_.children>(s: S): record_<S>
function record_<S extends typeof record_.children>(s: S) {
  return {
    ...record_.def(s),
    is: record$(s.is),
  }
}

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
  export function def<S extends typeof record_.spec>(s: S): record_.def<S> { return { _tag: Tag.record, _def: s } }
}
///    RECORD    ///
////////////////////


///////////////////
///    TUPLE    ///
interface tuple_<S> {
  _tag: typeof Tag.tuple
  _def: S
  is: (u: unknown) => u is { [Ix in keyof S]: typeof_<S[Ix]> }
}
function tuple_<S extends typeof tuple_.children>(...ss: S): tuple_<S>
function tuple_<S extends typeof tuple_.children>(...ss: S) {
  return {
    ...tuple_.def(ss),
    is: tuple$(...ss.map((s) => s.is)),
  }
}

declare namespace tuple_ {
  type spec<T> = readonly T[]
  const spec: tuple_.spec<unknown>
  const children: tuple_.spec<AST.Node>
  const shorthand: Short<AST.Short>
  type Short<T> = readonly T[]

  type shorthand<T> = [T] extends [Short<AST.Short>] ? Short<AST.Short> : never
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
interface object_<S> {
  _tag: typeof Tag.object
  _def: S
  _opt: object_._opt<S>[]
  is: (u: unknown) => u is { [K in keyof S]: typeof_<S[K]> }
}

function object_<S extends typeof object_.children>(xs: S): object_<S>
function object_<S extends typeof object_.children>(xs: S) {
  return {
    _tag: Tag.object,
    _def: object_.def(xs),
    _opt: object_._opt(xs),
    is: object$(map(xs, (x) => x.is))
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

const isScalarShortName = (s: string): s is Terminal => Terminals.includes(s as never)
const isTerminal = (u: unknown): u is Terminal => typeof u === "string" && isScalarShortName(u)
const isArrayShorthand = <T>(u: unknown): u is array_.Short<T> => (u as any)?.[0] === "[]"
const isRecordShorthand = <T>(u: unknown): u is record_.Short<T> => Array_isArray(u) && u[0] === "{}"
const isTupleShorthand = <T>(u: unknown): u is tuple_.Short<T> => Array_isArray(u) && u.every(isShorthand)
const isObjectShorthand = <T>(u: unknown): u is object_.Short<T> => !!u && typeof u === "object" // && Object_values(u).every(isShorthand)
const isAllOfShorthand = <T>(u: unknown): u is allOf_.Short<T> => Array_isArray(u) && u[0] === "|"
const isAnyOfShorthand = <T>(u: unknown): u is anyOf_.Short<T> => {
  return (u as any)?.[0] === "&"
}
const isConstStringLiteral
  : (u: unknown) => u is `'${string}'` | `"${string}"` | `\`${string}\``
  = (u): u is never => typeof u === "string" && (
    u.startsWith("'") && u.endsWith("'") ||
    u.startsWith("`") && u.endsWith("`") ||
    u.startsWith(`"`) && u.endsWith(`"`) 
    // || Array.isArray(u) && isConstStringLiteral(u[0])
  )
const isShorthand = (_: unknown): _ is AST.Short => {
  return isTerminal(_) ||
    isArrayShorthand(_) ||
    isRecordShorthand(_) || 
    isTupleShorthand(_) ||
    isObjectShorthand(_) ||
    isAllOfShorthand(_) ||
    isAnyOfShorthand(_) ||
    isConstStringLiteral(_)

  // true
}

// TODO: fix type assertion
const parseConstStringLiteral = (s: AST.Short) =>
  (isConstStringLiteral(s) ? s.slice(1, -1) : s) as never

const terminalMap = {
  any: any_,
  "any[]": fn.flow(any_, array_),
  "any{}": fn.flow(any_, record_),
  boolean: boolean_,
  "boolean[]": fn.flow(boolean_, array_),
  "boolean{}": fn.flow(boolean_, record_),
  integer: integer_,
  "integer[]": fn.flow(integer_, array_),
  "integer{}": fn.flow(integer_, record_),
  number: number_,
  "number[]": fn.flow(number_, array_),
  "number{}": fn.flow(number_, record_),
  string: string_,
  "string[]": fn.flow(string_, array_),
  "string{}": fn.flow(string_, record_),
  symbol: symbol_,
  "symbol[]": fn.flow(symbol_, array_),
  "symbol{}": fn.flow(symbol_, record_),
} as const satisfies { [Tag in keyof typeof AST.TerminalByTag]: () => typeof AST.TerminalByTag[Tag] }

type tail<S> = S extends readonly [any, ...infer T] ? T : never
function tail<const T extends readonly unknown[]>(xs: T): tail<T>
function tail<const T extends readonly unknown[]>(xs: T)
  { return xs.slice(1) }

const ShortFunctor: Functor<AST.ShortLambda, AST.Short> = {
  map: (f) => (x) => {
    switch (true) {
      default: return (console.info("exhaustive check in ast.ShortFunctor, x:", x), x)
      case x === null: return x
      case isTerminal(x): return x
      case isArrayShorthand(x): return [x[0], f(x[1])]
      case isRecordShorthand(x): return [x[0], f(x[1])]
      case isAllOfShorthand(x): return [x[0], f(x[1])]
      case isAnyOfShorthand(x): return [x[0], f(x[1])]
      case isObjectShorthand(x): return map(x, f)
      case isTupleShorthand(x): return map(x, f)
      case isConstStringLiteral(x): return x
    }
  }
}

function foldShorthand<T>(algebra: Functor.Algebra<AST.ShortLambda, T>)
  { return fn.cata(ShortFunctor)(algebra) }

export namespace Recursive {
  export const UnrecognizedLiteral 
    : (_: unknown) => never
    = (_) => fn.throw(""
      + `Unrecognized string literal. Expected the name of a type (like \`string\`") `
      + `or a string wrapped in quotes (like \`'xyx'\`, x), got: `, 
      _
    )
  export const fromSeed: Functor.Algebra<AST.ShortLambda, AST.Node> = (x) => {
    switch (true) {
      case x === null: return null_()
      case isTerminal(x): return terminalMap[x]()
      case isArrayShorthand(x): return array_(x[1])
      case isRecordShorthand(x): return record_(x[1])
      case isAllOfShorthand(x): return allOf_(...tail(x))
      case isAnyOfShorthand(x): return anyOf_(...tail(x))
      case isTupleShorthand(x): return tuple_(...x)
      case isObjectShorthand(x): return object_(x)
      case isConstStringLiteral(x): return const_(parseConstStringLiteral(x)) 
      default: return typeof x === "string" ? UnrecognizedLiteral(x) : const_(x) 
    }
  }
}

export const fromSeed = foldShorthand(Recursive.fromSeed)

const short: {
  (s: undefined): null_
  (s: null): null_
  <const S extends Terminal>(s: S): typeof AST.TerminalByTag[S]
  // <const S extends string>(s: S): const_<const_.parse<S>>
  <const S extends readonly AST.Short[]>($: "|", ...ss: S): anyOf_.fromShort<S>
  <const S extends readonly AST.Short[]>($: "&", ...ss: S): allOf_.fromShort<S>
  <const S extends AST.Short>($: "[]", s: S): array_.fromShort<S>
  <const S extends AST.Short>($: "{}", s: S): record_.fromShort<S>
  <const S extends object_.shorthand<S>>(s: S): object_.fromShort<S>
  <const S extends tuple_.shorthand<S>>(ss: S): tuple_.fromShort<S>
  <const S>(s: S): const_<S>
} = ((
  ...args:
    | [x: undefined]
    | [x: null]
    | [x: Terminal]
    | [x: `'${string}'`]
    | [x: `"${string}"`]
    | [x: `\`${string}\``]
    | [$: "|", ...xs: AST.Short[]]
    | [$: "&", ...xs: AST.Short[]]
    | [$: "[]", x: AST.Short]
    | [$: "{}", x: AST.Short]
    | [x: object_.Short<AST.Short>]
    | [xs: tuple_.Short<AST.Short>]
) => {
  switch (true) {
    case args[0] === null: return null_()
    case isTerminal(args[0]): return terminalMap[args[0]]()
    case isConstStringLiteral(args[0]): return const_(parseConstStringLiteral(args[0]))
    case args[0] === "[]": return array_(fromSeed(args[1]))
    case args[0] === "{}": return record_(fromSeed(args[1]))
    case args[0] === "&": return allOf_(...tail(args).map(fromSeed))
    case args[0] === "|": return anyOf_(...tail(args).map(fromSeed))
    case isObjectShorthand(args[0]): return fn.pipe(
      Object.entries(args[0]),
      (xs) => xs.map(([k, v]) => [k, fromSeed(v)] satisfies [string, any]),
      Object.fromEntries,
      object_,
    )
    case isTupleShorthand(args): return tuple_(...args.filter((x) => x !== undefined).map((x) => fromSeed(x)))
    default: return typeof args[0] === "string" ? Recursive.UnrecognizedLiteral(args[0]) : const_(args[0] as never)
  }
}) as never // TODO: fix type assertion
