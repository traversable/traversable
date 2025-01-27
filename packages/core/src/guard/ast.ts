import type { StandardSchemaV1 } from "@standard-schema/spec"
import { JsonSchema } from "@traversable/core/exports"
import { fn, map } from "@traversable/data"
import type {
  Force,
  Functor,
  HKT,
  Intersect,
  Partial,
  Primitive,
  Require,
  TypeError,
  _,
  integer,
  newtype,
} from "@traversable/registry"
import { Invariant, symbol } from "@traversable/registry"
import type * as Traversable from "../model/traversable.js"
import { has } from "../tree.js"
import { allOf$, anyOf$, array$, object$, optional$, record$, tuple$ } from "./combinators.js"
import { is as is$ } from "./predicates.js"

export {
  type schema as Schema,
  type Type,
  type target,
  typeof_ as typeof,
  AST,
  Functor,
  fold,
  unfold,
  short,
  key,
  null_ as null,
  boolean_ as boolean,
  symbol_ as symbol,
  integer_ as integer,
  number_ as number,
  string_ as string,
  any_ as any,
  enum_ as enum,
  const_ as const,
  optional_ as optional,
  array_ as array,
  record_ as record,
  tuple_ as tuple,
  allOf_ as allOf,
  anyOf_ as anyOf,
  oneOf_ as oneOf,
  object_ as object,
}

type schema<O, I = unknown> = never | Schema<[I, O]>
type target<S> = S extends (_: any) => _ is infer T ? T : never
type Schema<S extends [source: any, target: unknown]> = Type<{ is(src: S[0]): src is S[1] }>
interface Type<T extends { is(src: any): src is any }> extends newtype<T & { [symbol.schema]?: symbol.schema }> {
  _type: target<T["is"]>
}

type Any<T = unknown> = 
  | null_
  | boolean_
  | symbol_
  | integer_
  | number_
  | string_
  | any_
  | const_.apply<T>
  | enum_.apply<T>
  | optional_.apply<T>
  | array_.apply<T>
  | record_.apply<T>
  | tuple_.apply<T>
  | allOf_.apply<T>
  | anyOf_.apply<T>
  | oneOf_.apply<T>
  | object_.apply<T>
  ;

type OrderedSchemas = [
  null_,
  boolean_,
  symbol_,
  integer_,
  number_,
  string_,
  any_,
  enum_<typeof enum_.spec>,
  const_<typeof const_.spec>,
  optional_<typeof optional_.spec>,
  array_<typeof array_.spec>,
  record_<typeof record_.spec>,
  tuple_<typeof tuple_.spec>,
  allOf_<typeof allOf_.spec>,
  anyOf_<typeof anyOf_.spec>,
  oneOf_<typeof oneOf_.spec>,
  object_<typeof object_.spec>,
]

const SchemaMap = {
  null: null_,
  boolean: boolean_,
  symbol: symbol_,
  integer: integer_,
  number: number_,
  string: string_,
  any: any_,
  enum: enum_,
  const: const_,
  optional: optional_,
  array: array_,
  record: record_,
  tuple: tuple_,
  allOf: allOf_,
  anyOf: anyOf_,
  oneOf: oneOf_,
  object: object_,
}

type SchemaOrder<T extends typeof SchemaOrder = typeof SchemaOrder> = { [I in keyof T]: T[I] }
const SchemaOrder = [
  SchemaMap.null,
  SchemaMap.boolean,
  SchemaMap.symbol,
  SchemaMap.integer,
  SchemaMap.number,
  SchemaMap.string,
  SchemaMap.any,
  SchemaMap.const,
  SchemaMap.optional,
  SchemaMap.array,
  SchemaMap.record,
  SchemaMap.tuple,
  SchemaMap.allOf,
  SchemaMap.anyOf,
  SchemaMap.oneOf,
  SchemaMap.object,
] as const

type ScalarShortName = keyof AST.ScalarMap

/** @internal */
type TerminalArrays_<T extends TerminalSeeds = TerminalSeeds> = never | { [I in keyof T]: `${T[I]}[]` }
/** @internal */
type TerminalRecords_<T extends TerminalSeeds = TerminalSeeds> = never | { [I in keyof T]: `${T[I]}{}` }
/** @internal */
const phantom: never = symbol.phantom as never
/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const Array_isArray = globalThis.Array.isArray

export interface Options<I = unknown, O = unknown> extends Partial<
  & typeof Options 
  & { to?: O, from?: I }
  // { from: (u: unknown) => I }
> {}

export const Options = {
  /** 
   * ## {@link Options.from `Options.from`} 
   *
   * Arbitrarily constrain a schema's input type. 
   *
   * **Note:** This option exists for advanced use cases, and gives you
   * more control over the type system than you're techically supposed to have. 
   * 
   * The typical use case for wanting to type a schema's inputs and outputs is
   * when you're rolling your own codecs, and need to support a bidirectional
   * encode/decode pipeline.
   */
  from: void 0 as unknown // (x: any) => x as any
} as const

export const TerminalSeeds = [
  "string", 
  "number", 
  "boolean", 
  "symbol", 
  "integer", 
  "any"
] as const satisfies ScalarShortName[]
export type TerminalSeeds = typeof TerminalSeeds
export const TerminalArrays = TerminalSeeds.map((sn) => `${sn}[]` as const) as TerminalArrays_
export type TerminalArrays = typeof TerminalArrays
export const TerminalRecords = TerminalSeeds.map((sn) => `${sn}{}` as const) as TerminalRecords_
export type TerminalRecords = typeof TerminalRecords
export const Terminals = [...TerminalSeeds, ...TerminalArrays, ...TerminalRecords]
export type Terminals = typeof Terminals
export type Terminal = Terminals[number]

declare namespace AST {
  export {
    typeof_ as typeof,
    Terminal,
  }
}
declare namespace AST {
  interface Leaf<T extends readonly [source: unknown, target: unknown] = readonly [any, unknown]> {
    _tag: string
    def: unknown
    _type: T[1]
    is(u: T[0]): u is T[1]
  }
  interface Node { _type: unknown, is(u: any): u is unknown }

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
    : S extends readonly ["&", ...infer T extends AST.Short[]]
    ? { -readonly [Ix in keyof T]: fromShort<T[Ix]> } extends
      | infer T extends readonly unknown[] ? allOf_<T> : never
    : S extends readonly ["|", ...infer T extends AST.Short[]]
      ? { -readonly [Ix in keyof T]: fromShort<T[Ix]> } extends
      | infer U extends AST.Node[] ? anyOf_<U>
      : never
    : S extends readonly ["[]", AST.Short] ? array_<AST.fromShort<S[1]>>
    : S extends readonly ["{}", AST.Short] ? record_<AST.fromShort<S[1]>>
    : S extends object
      ? S extends readonly unknown[]
        ? { -readonly [Ix in keyof S]: fromShort<S[Ix]> } extends
        | infer T extends readonly unknown[] ? tuple_<T>
        : never
      : S extends { [x: string]: unknown } ? object_<object_._fromShort<S>>
    : never
    : const_<const_.parse<S>>
    ;
  interface lambda extends HKT { [-1]: F<this[0]> }

  type F<T> =
    | null_
    | boolean_
    | symbol_
    | integer_
    | number_
    | string_
    | any_
    | const_<T>
    | enum_<readonly T[]>
    | optional_<T>
    | array_<T>
    | record_<T>
    | allOf_<readonly T[]>
    | anyOf_<readonly T[]>
    | oneOf_<readonly T[]>
    | tuple_<readonly T[]>
    | object_<{ [x: string]: T }>
    ;
  namespace F {
    export {
      optionalF as optional,
      arrayF as array,
      recordF as record,
      allOfF as allOf,
      anyOfF as anyOf,
      oneOfF as oneOf,
      tupleF as tuple,
      objectF as object,
    }
  }
  namespace F {
    interface optionalF extends HKT<typeof optional_.spec> { [-1]: optional_<this[0]> }
    interface arrayF extends HKT<typeof array_.spec> { [-1]: array_<this[0]> }
    interface recordF extends HKT<typeof record_.spec> { [-1]: record_<this[0]> }
    interface allOfF extends HKT<typeof allOf_.spec> { [-1]: allOf_<this[0]> }
    interface anyOfF extends HKT<typeof anyOf_.spec> { [-1]: anyOf_<this[0]> }
    interface oneOfF extends HKT<typeof oneOf_.spec> { [-1]: oneOf_<this[0]> }
    interface tupleF extends HKT<typeof tuple_.spec> { [-1]: tuple_<this[0]> }
    interface objectF extends HKT<typeof object_.spec> { [-1]: object_<this[0]> }
  }
}


/**
 * ## {@link typeof_ `t.typeof`}
 * 
 * Extract a schema's target type. Analogous to zod's `z.infer`.
 */
function typeof_<S>(s: S): typeof_<S>
function typeof_<S>(s: S) { return s }
type typeof_<T> = T["_type" & keyof T]

/**
 * ## {@link Functor `t.Functor`} 
 * 
 * Apply an arbitrary function to an AST's target nodes 
 * recursively. Uses a post-order traversal (bottom-up).
 * 
 * Like all Functors, {@link Functor `t.Functor`} preserves 
 * the structure of its container.
 * 
 * @example
 * 
 * import { t } from "@traversable/core"
 * 
 * t.object({
 *   a:   
 * })
 */
const Functor: Functor<AST.lambda> = {
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
        case x._tag === "enum": return enum_.def(x.def) as never
        case x._tag === "const": return const_.def(f(x.def)) as never
        case x._tag === "optional": return optional_.def(f(x.def)) as never
        case x._tag === "array": return array_.def(f(x.def)) as never
        case x._tag === "record": return record_.def(f(x.def)) as never
        case x._tag === "allOf": return allOf_.def(x.def.map(f)) as never
        case x._tag === "anyOf": return anyOf_.def(x.def.map(f)) as never
        case x._tag === "oneOf": return oneOf_.def(x.def.map(f)) as never
        case x._tag === "tuple": return tuple_.def(x.def.map(f)) as never
        case x._tag === "object": return object_.def(map(x.def, f)) as never
      }
    }
  }
}

/**
 * ## {@link Functor `t.Functor`} 
 * 
 * Apply an arbitrary function to an AST's target nodes 
 * recursively, in a way that preserves structure.
 */
function fold<T>(g: Functor.Algebra<AST.lambda, T>) { return fn.cata(Functor)(g) }
function unfold<T>(g: Functor.Coalgebra<AST.lambda, T>) { return fn.ana(Functor)(g) }

const mutableArray$
  : <T>(guard: (u: unknown) => u is T) => (u: unknown) => u is T[]
  = (guard) => (u): u is never => Array.isArray(u) && u.every(guard)

export const isAST
  : <T>(u: unknown) => u is AST.F<T>
  = (u): u is never => !!u && typeof u === "object" && "_tag" in u && Object.values<unknown>(Tag).includes(u._tag)

function AST() {}
AST.fold = fold
AST.unfold = unfold
AST.Functor = Functor
AST.is = isAST


type NullaryTag = typeof NullaryTag[keyof typeof NullaryTag]
const NullaryTag = {
  null: "null",
  symbol: "symbol",
  boolean: "boolean",
  integer: "integer",
  number: "number",
  string: "string",
  any: "any",
} as const

type Tag = typeof Tag[keyof typeof Tag]
const Tag = {
  ...NullaryTag,
  enum: "enum",
  const: "const",
  allOf: "allOf",
  anyOf: "anyOf",
  oneOf: "oneOf",
  optional: "optional",
  array: "array",
  record: "record",
  tuple: "tuple",
  object: "object",
} as const

//////////////////
///    NULL    ///
interface null_ extends null_.def {
  is: (u: unknown) => u is this["_type"]
  get toJsonSchema(): typeof null_.toJsonSchema
}

function null_(): null_
function null_(): null_ {
  return {
    ...null_.def,
    is: is$.null,
    get toJsonSchema() { return null_.toJsonSchema },
  }
}

declare namespace null_ {
  interface def {
    _tag: typeof Tag.null
    def: typeof null_.spec
    _type: null
  }
  const spec: null
  type Short = typeof shorthand
  const shorthand: null
  type shorthand<T> = [T] extends [typeof null_.shorthand] ? typeof null_.shorthand : never
}
namespace null_ {
  export const toJsonSchema = {
    type: Tag.null,
    enum: [null] as const satisfies [any]
  }
  export const def = {
    _tag: Tag.null,
    def: symbol.null as never,
    _type: phantom,
  } as const satisfies null_.def
  export const isDef = (u: unknown): u is null_.def => !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.null
  export const is = (u: Any): u is null_ => u._tag === Tag.null
}
///    NULL    ///
//////////////////


/////////////////////
///    BOOLEAN    ///
interface boolean_ extends boolean_.def {
  is: (u: unknown) => u is this["_type"]
  get toJsonSchema(): typeof boolean_.toJsonSchema
}

function boolean_(): boolean_
function boolean_(): boolean_
function boolean_() {
  return {
    ...boolean_.def,
    is: is$.boolean,
    get toJsonSchema() { return boolean_.toJsonSchema },
  }
}

declare namespace boolean_ {
  interface def {
    _tag: typeof Tag.boolean
    def: typeof boolean_.spec
    _type: boolean
  }
  const spec: boolean
  type Short = typeof shorthand
  const shorthand: typeof Tag.boolean
  type shorthand<T> = [T] extends [typeof boolean_.shorthand] ? typeof boolean_.shorthand : never
}
namespace boolean_ {
  export const toJsonSchema = { type: Tag.boolean }
  export const def = {
    _tag: Tag.boolean,
    def: symbol.boolean as never,
    _type: phantom,
  } as const satisfies boolean_.def
  export const isDef = (u: unknown): u is boolean_.def => !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.boolean
  export const is = (u: Any): u is boolean_ => u._tag === Tag.boolean
}
///    BOOLEAN    ///
/////////////////////


////////////////////
///    SYMBOL    ///
interface symbol_ extends symbol_.def {
  is: (u: unknown) => u is this["_type"]
  toJsonSchema?: void
}
function symbol_(): symbol_
function symbol_(): symbol_ {
  return {
    ...symbol_.def,
    is: is$.symbol,
  }
}

declare namespace symbol_ {
  interface def {
    _tag: typeof Tag.symbol
    def: typeof symbol_.spec
    _type: symbol
  }
  const spec: symbol
  type Short = typeof shorthand
  const shorthand: typeof Tag.symbol
  type shorthand<T> = [T] extends [typeof symbol_.shorthand] ? typeof symbol_.shorthand : never
}
namespace symbol_ {
  export const toJsonSchema: void = void 0
  export const def = {
    _tag: Tag.symbol,
    def: symbol.symbol as never,
    _type: phantom,
  } as const satisfies symbol_.def
  export const isDef = (u: unknown): u is symbol_.def => !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.symbol
  export const is = (u: Any): u is symbol_ => u._tag === Tag.symbol
}
///    SYMBOL    ///
////////////////////


/////////////////////
///    INTEGER    ///
interface integer_ extends integer_.def {
  is: (u: unknown) => u is this["_type"]
  get toJsonSchema(): typeof integer_.toJsonSchema
}
function integer_(): integer_
function integer_(): integer_ {
  return {
    ...integer_.def,
    is: is$.integer as (u: unknown) => u is integer,
    get toJsonSchema() { return integer_.toJsonSchema },
  }
}
declare namespace integer_ {
  interface def {
    _tag: typeof Tag.integer
    def: typeof integer_.spec
    _type: integer
  }
  const spec: integer
  type Short = typeof shorthand
  const shorthand: typeof Tag.integer
  type shorthand<T> = [T] extends [typeof integer_.shorthand] ? typeof integer_.shorthand : never
}
namespace integer_ {
  export const toJsonSchema = { type: Tag.integer }
  export const def = {
    _tag: Tag.integer,
    def: symbol.integer as never as integer,
    _type: phantom,
  } as const satisfies integer_.def
  export const isDef = (u: unknown): u is integer_.def => !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.integer
  export const is = (u: Any): u is integer_ => u._tag === Tag.integer
}
///    INTEGER    ///
/////////////////////


////////////////////
///    NUMBER    ///
interface number_ extends number_.def {
  is: (u: unknown) => u is this["_type"]
  get toJsonSchema(): typeof number_.jsonSchema
}

function number_(): number_ 
function number_(): number_ {
  return {
    ...number_.def,
    is: is$.number,
    get toJsonSchema() { return number_.jsonSchema },
  }
}

declare namespace number_ {
  interface def {
    _tag: typeof Tag.number
    def: typeof number_.spec
    _type: number
  }
  const spec: number
  type Short = typeof shorthand
  const shorthand: typeof Tag.number
  type shorthand<T> = [T] extends [typeof number_.shorthand] ? typeof number_.shorthand : never
}
namespace number_ {
  export const jsonSchema = { type: Tag.number }
  export const def = {
    _tag: Tag.number,
    def: symbol.number as never,
    _type: phantom,
  } as const satisfies number_.def
  export const isDef = (u: unknown): u is number_.def => !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.number
  export const is = (u: Any): u is number_ => u._tag === Tag.number
}
///    NUMBER    ///
////////////////////


////////////////////
///    STRING    ///

interface string_ extends string_.def {
  is: (u: unknown) => u is this["_type"]
  get toJsonSchema(): typeof string_.toJsonSchema
}
function string_(): string_ 
function string_(): string_ {
  return {
    ...string_.def,
    is: is$.string,
    get toJsonSchema() { return string_.toJsonSchema },
  }
}

declare namespace string_ {
  interface def {
    _tag: typeof Tag.string
    def: typeof string_.spec
    _type: string
  }
  const spec: string
  const shorthand: typeof Tag.string
  type Short = typeof string_.shorthand
  type shorthand<T> = [T] extends [typeof string_.shorthand] ? typeof string_.shorthand : never
}
namespace string_ {
  export const toJsonSchema = { type: Tag.string }
  export const def = {
    _tag: Tag.string,
    def: symbol.string as never,
    _type: phantom,
  } as const satisfies string_.def
  export const isDef = (u: unknown): u is string_.def => !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.string
  export const is = (u: Any): u is string_ => u._tag === Tag.string
}
///    STRING    ///
////////////////////


/////////////////
///    ANY    ///
interface any_ extends any_.def {
  is: (u: unknown) => u is this["_type"]
  get toJsonSchema(): typeof any_.toJsonSchema
}
function any_(): any_
function any_(): any_ {
  return {
    ...any_.def,
    is: is$.any,
    get toJsonSchema() { return any_.toJsonSchema },
  }
}
declare namespace any_ {
  interface def {
    _tag: typeof Tag.any
    def: typeof any_.spec
    _type: unknown,
  }
  const spec: unknown
  const shorthand: typeof Tag.any
  type Short = typeof any_.shorthand
  type shorthand<T> = [T] extends [typeof any_.shorthand] ? typeof any_.shorthand : never
}
namespace any_ {
  export const toJsonSchema = { type: "object", properties: {} }
  export const def = {
    _tag: Tag.any,
    def: symbol.any as never,
    _type: phantom,
  } as const satisfies any_.def
  export const isDef = (u: unknown): u is any_.def => !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.any
  export const is = (u: Any): u is any_ => u._tag === Tag.any
}
///    ANY    ///
/////////////////


//////////////////
///    ENUM    ///
interface enum_<S extends typeof enum_.spec> extends enum_.def<S> {
  is: (u: unknown) => u is S
  get toJsonSchema(): enum_.toJsonSchema<S>
}

function enum_<S extends typeof enum_.children>(specs: [...S]): enum_<S>
function enum_<S extends typeof enum_.children>(xs: [...S]): enum_<S> {
  return {
    ...enum_.def(xs),
    is: anyOf$(...xs.map(is$.literally)),
    get toJsonSchema() { return enum_.toJsonSchema(xs) },
  }
}

declare namespace enum_ {
  interface def<S extends typeof enum_.spec> {
    _tag: typeof Tag.enum
    def: S
    _type: S[number],
  }
  type apply<T> = enum_<readonly T[]>
  const spec: readonly unknown[]
  const children: readonly AST.Node[]
  type toJsonSchema<S extends typeof enum_.spec> = never | { "enum": [...S] }
}

namespace enum_ {
  export function toJsonSchema<const S extends typeof enum_.spec>(value: S): enum_.toJsonSchema<S> 
  export function toJsonSchema<const S extends typeof enum_.spec>(value: S) {
    return { 
      enum: [...value] 
    }
  }
  export function def<T extends typeof enum_.spec>(v: T): enum_.def<T> {
    return {
      _tag: Tag.enum,
      def: v,
      _type: phantom,
    } as const satisfies enum_.def<T>
  }
  export const isDef = <T extends typeof enum_.spec>(u: unknown): u is enum_.def<T> => 
    !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.enum
  export const is = <T extends typeof enum_.spec>(u: unknown): u is enum_<T> => isDef(u)
}
///    ENUM    ///
//////////////////



///////////////////
///    CONST    ///
interface const_<S> extends const_.def<S> {
  is: (u: unknown) => u is S
  get toJsonSchema(): const_.toJsonSchema<S>
}

const Is = {
  const: <T>(value: T) => (u: unknown): u is T => u === value,
  optional: <T>(guard: (u: unknown) => u is T) => optional$(guard),
  array: <T>(guard: (u: unknown) => u is T) => array$(guard),
  record: <T>(guard: (u: unknown) => u is T) => record$(guard),
  object: <T extends typeof object_.children>(xs: T) => object$(map(xs, (x) => x.is)),
  tuple: <T extends typeof tuple_.children>(xs: T) => tuple$(...xs.map((x) => x.is)),
  allOf: <T extends typeof allOf_.children>(xs: T) => allOf$(...xs.map((x) => x.is)),
  anyOf: <T extends typeof anyOf_.children>(xs: T) => anyOf$(...xs.map((x) => x.is)),
  oneOf: <T extends typeof oneOf_.children>(xs: T) => anyOf$(...xs.map((x) => x.is)),
}


function shortConst_<const T extends [T] extends [Primitive] ? Primitive : never>(value: T): const_<const_.parse<T>>
function shortConst_<const T extends { [x: number]: unknown }>(value: T, options: const_.Options<T>): const_<T>
function shortConst_<const T extends { [x: number]: unknown }>(value: T, options?: const_.Options<T>): const_<T>
function shortConst_<const T>(v: T, _?: const_.Options) {
  return const_(v, _)
}

function const_<const T>(value: T, options?: const_.Options<T>): const_<T>
function const_<const T>(v: T, _?: const_.Options<T>): const_<T> {
  const eq = _?.eq
  const def = const_.def(v)
  const is = eq !== undefined 
    ? (u: unknown): u is never => eq(def.def, u as T) 
    : Is.const(v)
  return {
    ...def,
    is,
    get toJsonSchema() { return const_.toJsonSchema(v) },
  }
}

declare namespace const_ {
  export { options as Options }
}

declare namespace const_ {
  interface options<T = any, I = any> extends Options<I>, Partial<{
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
    eq(left: T, right: T): boolean
  }> {}

  interface def<T extends typeof const_.spec> {
    _tag: typeof Tag.const
    def: T
    _type: T
  }
  type apply<T> = const_<T>
  const spec: unknown
  const children: unknown
  type shorthand<T>
    = [T] extends [string]
    ? [T] extends [`'${string}'`] ? `'${string}'`
    : [T] extends [`"${string}"`] ? `"${string}"`
    : [T] extends [`\`${string}\``] ? `\`${string}\``
    : never : unknown
  type toJsonSchema<T> = never | { "const": T }
  type validate<S>
    = [S] extends [string] ?
    | [S] extends [ `'${string}'` ] ? `'${string}'`
    : [S] extends [ `"${string}"` ] ? `"${string}"`
    : [S] extends [`\`${string}\``] ? `\`${string}\``
    : TypeError<`'short' requires string literals to be be wrapped in quotes (for example, pass '"hi"' instead of 'hi')`, S>
    : unknown
    ;
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
  } satisfies Require<Options, "eq">
  export function toJsonSchema<const S>(value: S): const_.toJsonSchema<S> 
  export function toJsonSchema<const S>(value: S) {
    return { const: value }
  }
  export function def<T extends typeof const_.spec>(v: T): const_.def<T> {
    return {
      _tag: Tag.const,
      def: v,
      _type: phantom,
    } as const satisfies const_.def<T>
  }
  export const isDef = <T>(u: unknown): u is const_.def<T> => 
    !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.const
  export const is = <T>(u: unknown): u is const_<T> => isDef(u)
}
///    CONST    ///
///////////////////


//////////////////////
///    OPTIONAL    ///
interface optional_<S extends typeof optional_.spec> extends optional_.def<S> {
  is: (u: unknown) => u is this["_type"]
  get toJsonSchema(): optional_.toJsonSchema<S>
}
function optional_<S extends typeof optional_.children>(spec: S): optional_<S>
function optional_<S extends typeof optional_.children>(s: S): optional_<S> {
  return {
    ...optional_.def(s),
    is: optional$(s.is),
    get toJsonSchema() { return optional_.toJsonSchema(s) },
  }
}

declare namespace optional_ {
  type apply<T> = optional_<T>
  interface def<S extends typeof optional_.spec> {
    _tag: typeof Tag.optional,
    def: S,
    _type: S["_type" & keyof S] | undefined
  }
  const spec: unknown
  const children: AST.Node
  const shorthand: `${string}?`
  type Short = typeof optional_.shorthand
  type shorthand<T> = [T] extends [typeof optional_.shorthand] ? typeof optional_.shorthand : never
  type toJsonSchema<T> = T["toJsonSchema" & keyof T]
}

namespace optional_ {
  export function toJsonSchema<S extends typeof optional_.spec>(spec: S): optional_.toJsonSchema<S>
  export function toJsonSchema<S extends typeof optional_.spec>(spec: S) {
    return has("toJsonSchema")(spec) && spec.toJsonSchema
  }
  export function def<S extends typeof optional_.spec>(s: S): optional_.def<S> {
    return {
      _tag: Tag.optional,
      def: s,
      _type: phantom,
    } as const satisfies optional_.def<S>
  }
  export const isDef = <T>(u: unknown): u is optional_.def<T> => 
    !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.optional
  export const is 
    : <T>(u: unknown) => u is optional_<T>
    = (u): u is never => !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.optional
}
///    OPTIONAL    ///
//////////////////////


////////////////////
///    ALL OF    ///
interface allOf_<S extends readonly unknown[]> extends allOf_.def<S> {
  is: (u: unknown) => u is this["_type"]
  get toJsonSchema(): allOf_.toJsonSchema<S>
}
function allOf_<S extends typeof allOf_.children>(...specs: S): allOf_<S>
function allOf_<S extends typeof allOf_.children>(...xs: S): allOf_<S> {
  return {
    ...allOf_.def(xs),
    is: allOf$(...xs.map((x) => x.is)),
    get toJsonSchema() { return allOf_.toJsonSchema(xs) },
  }
}

declare namespace allOf_ {
  interface def<S extends typeof allOf_.spec> {
    _tag: typeof Tag.allOf
    def: S
    _type: Intersect<{ [I in keyof S]: S[I]["_type" & keyof S[I]] }>
  }
  type apply<T> = allOf_<readonly T[]>
  const spec: readonly unknown[]
  const children: readonly AST.Node[]
  const shorthand: Short<AST.Short>
  type Short<T> = readonly ["&", ...readonly T[]]
  type shorthand<T> = [T] extends [Short<T>] ? Short<T> : never
  type fromShort<S extends typeof allOf_.spec> = never | allOf_<{ -readonly [Ix in keyof S]: AST.fromShort<S[Ix]> }>
  type toJsonSchema<T extends typeof allOf_.spec> = never | { allOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] } }
}

namespace allOf_ {
  export function toJsonSchema<S extends typeof allOf_.spec>(spec: S): allOf_.toJsonSchema<S>
  export function toJsonSchema<S extends typeof allOf_.spec>(spec: S) {
    return {
      allOf: spec.filter(has("toJsonSchema")).map((_) => _.toJsonSchema),
    }
  }

  export function def<S extends typeof allOf_.spec>(ss: S): allOf_.def<S> {
    return {
      _tag: Tag.allOf,
      def: ss,
      _type: phantom,
    } as const satisfies allOf_.def<S>
  }
  export const isDef = <T extends typeof allOf_.spec>(u: unknown): u is allOf_.def<T> => 
    !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.allOf
  export const is 
    : <T extends typeof allOf_.spec>(u: unknown) => u is allOf_<T>
    = (u): u is never => isDef(u)
}
///    ALL OF    ///
////////////////////


////////////////////
///    ANY OF    ///
interface anyOf_<S extends typeof anyOf_.spec> extends anyOf_.def<S> {
  is: (u: unknown) => u is S[number]["_type" & keyof S[number]]
  get toJsonSchema(): anyOf_.toJsonSchema<S>
}
function anyOf_<S extends typeof anyOf_.children>(...specs: S): anyOf_<S>
function anyOf_<S extends typeof anyOf_.children>(...xs: S) {
  return {
    ...anyOf_.def(xs),
    is: anyOf$(...xs.map((x) => x.is)),
    get toJsonSchema() { return anyOf_.toJsonSchema(xs) },
  }
}

declare namespace anyOf_ {
  interface def<S extends typeof anyOf_.spec> {
    _tag: typeof Tag.anyOf
    def: S
    _type: S[number]["_type" & keyof S[number]]
  }
  type apply<T> = anyOf_<readonly T[]>
  const spec: readonly unknown[]
  const children: readonly AST.Node[]
  const shorthand: Short<AST.Short>
  type Short<T> = readonly ["|", ...readonly T[]]
  type shorthand<T> = [T] extends [anyOf_.Short<T>] ? anyOf_.Short<T> : never
  type fromShort<S extends typeof anyOf_.spec> = never | anyOf_<{ -readonly [Ix in keyof S]: AST.fromShort<S[Ix]> }>
  type toJsonSchema<T extends typeof anyOf_.spec> = never | { anyOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] } }
}

namespace anyOf_ {
  export function toJsonSchema<S extends typeof anyOf_.spec>(specs: S): anyOf_.toJsonSchema<S> 
  export function toJsonSchema<S extends typeof anyOf_.spec>(spec: S) {
    return {
      anyOf: spec.filter(has("toJsonSchema")).map((_) => _.toJsonSchema)
    }
  }
  export function def<S extends typeof anyOf_.spec>(ss: S): anyOf_.def<S> {
    return {
      _tag: Tag.anyOf,
      def: ss,
      _type: phantom,
    }
  }
  export const isDef = <T extends typeof anyOf_.spec>(u: unknown): u is anyOf_.def<T> => 
    !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.anyOf
  export const is 
    : <T extends typeof anyOf_.spec>(u: unknown) => u is anyOf_<T>
    = (u): u is never => isDef(u)
}
///    ANY OF    ///
////////////////////


////////////////////
///    ONE OF    ///
interface oneOf_<S extends typeof oneOf_.spec> extends oneOf_.def<S> {
  is: (u: unknown) => u is S[number]["_type" & keyof S[number]]
  get toJsonSchema(): oneOf_.toJsonSchema<S>
}
function oneOf_<S extends typeof oneOf_.children>(...specs: S): oneOf_<S>
function oneOf_<S extends typeof oneOf_.children>(...xs: S) {
  return {
    ...oneOf_.def(xs),
    is: anyOf$(...xs.map((x) => x.is)),
    get toJsonSchema() { return oneOf_.toJsonSchema(xs) },
  }
}

declare namespace oneOf_ {
  interface def<S extends typeof oneOf_.spec> {
    _tag: typeof Tag.oneOf
    def: S
    _type: S[number]["_type" & keyof S[number]]
  }
  type apply<T> = oneOf_<readonly T[]>
  const spec: readonly unknown[]
  const children: readonly AST.Node[]
  const shorthand: Short<AST.Short>
  type Short<T> = readonly ["|", ...readonly T[]]
  type shorthand<T> = [T] extends [oneOf_.Short<T>] ? oneOf_.Short<T> : never
  type fromShort<S extends typeof oneOf_.spec> = never | oneOf_<{ -readonly [Ix in keyof S]: AST.fromShort<S[Ix]> }>
  type toJsonSchema<T extends typeof oneOf_.spec> = never | { oneOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] } }
}

namespace oneOf_ {
  export function toJsonSchema<S extends typeof oneOf_.spec>(specs: S): oneOf_.toJsonSchema<S> 
  export function toJsonSchema<S extends typeof oneOf_.spec>(spec: S) {
    return {
      oneOf: spec.filter(has("toJsonSchema")).map((_) => _.toJsonSchema)
    }
  }
  export function def<S extends typeof oneOf_.spec>(ss: S): oneOf_.def<S> {
    return {
      _tag: Tag.oneOf,
      def: ss,
      _type: phantom,
    }
  }
  export const isDef = <T extends typeof oneOf_.spec>(u: unknown): u is oneOf_.def<T> => 
    !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.oneOf
  export const is 
    : <T extends typeof oneOf_.spec>(u: unknown) => u is oneOf_<T>
    = (u): u is never => isDef(u)
}
///    ONE OF    ///
////////////////////


///////////////////
///    ARRAY    ///
interface array_<S extends typeof array_.spec> extends array_.def<S> {
  is(src: unknown): src is typeof_<S>[]
  toJsonSchema: array_.toJsonSchema<S>
}

function array_<S extends typeof array_.children>(spec: S): array_<S>
function array_<S extends typeof array_.children>(x: S) {
  return {
    ...array_.def(x),
    is: array$(x.is),
    get toJsonSchema() { return array_.toJsonSchema(x) },
  }
}

declare namespace array_ {
  interface def<S extends typeof array_.spec> {
    _tag: typeof Tag.array
    def: S
    _type: S["_type" & keyof S][]
  }
  type apply<T> = array_<T>
  const spec: unknown
  const children: AST.Node
  type fromShort<S> = never | array_<AST.fromShort<S>>
  const shorthand: Short<AST.Short>
  type Short<T> = readonly ["[]", T]
  type toJsonSchema<T> = never | {
    type: "array",
    items: T["toJsonSchema" & keyof T]
  }
}
namespace array_ {
  export function toJsonSchema<S extends typeof array_.spec>(spec: S): array_.toJsonSchema<S> 
  export function toJsonSchema<S extends typeof array_.spec>(spec: S) {
    return {
      type: "array",
      ...has("toJsonSchema")(spec) && { items: spec.toJsonSchema },
    }
  }
  export function def<S extends typeof array_.spec>(s: S): array_.def<S>
  export function def<S extends typeof array_.spec>(s: S): array_.def<S> {
    return {
      _tag: Tag.array,
      def: s,
      _type: phantom,
    }
  }
  export const isDef = <T extends typeof array_.spec>(u: unknown): u is array_.def<T> => 
    !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.array
  export const is 
    : <T>(u: unknown) => u is array_<T>
    = (u): u is never => isDef(u)
}
///    ARRAY    ///
///////////////////


////////////////////
///    RECORD    ///
interface record_<S extends typeof record_.spec> extends record_.def<S> {
  is(src: unknown): src is this["_type"]
  get toJsonSchema(): record_.toJsonSchema<S>
}

function record_<S extends typeof record_.children>(spec: S): record_<S>
function record_<S extends typeof record_.children>(x: S): record_<S> {
  return {
    ...record_.def(x),
    is: record$(x.is),
    get toJsonSchema() { return record_.toJsonSchema(x) },
  }
}

declare namespace record_ {
  interface def<S extends typeof record_.spec> {
    _tag: typeof Tag.record,
    def: S
    _type: globalThis.Record<string, S["_type" & keyof S]>
  }
  type apply<T> = record_<T>
  const spec: unknown
  const children: AST.Node
  type fromShort<T> = never | record_<AST.fromShort<T>>
  const shorthand: Short<AST.Short>
  type Short<T> = readonly ["{}", T]
  type toJsonSchema<T> = never | {
    type: "object",
    additionalProperties: T["toJsonSchema" & keyof T]
  }
}

namespace record_ {
  export function toJsonSchema<S extends typeof record_.spec>(spec: S): record_.toJsonSchema<S>
  export function toJsonSchema<S extends typeof record_.spec>(spec: S) {
    return {
      type: "object",
      ...has("toJsonSchema")(spec) && { additionalProperties: spec.toJsonSchema as S },
    }
  }
  export function def<S extends typeof record_.spec>(s: S): record_.def<S> {
    return {
      _tag: Tag.record,
      def: s,
      _type: phantom,
    }
  }
  export const isDef = <T extends typeof record_.spec>(u: unknown): u is record_.def<T> => 
    !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.record
  export const is 
    : <T>(u: unknown) => u is record_<T>
    = (u): u is never => isDef(u)
}
///    RECORD    ///
////////////////////


///////////////////
///    TUPLE    ///
interface tuple_<S extends typeof tuple_.spec> extends tuple_.def<S, tuple_.opt<S>> {
  is(src: unknown): src is this["_type"]
  get toJsonSchema(): tuple_.toJsonSchema<S>
}

function tuple_<S extends typeof tuple_.children>(...specs: S): tuple_<S>
function tuple_<S extends typeof tuple_.children>(...xs: S) {
  return {
    ...tuple_.def(xs),
    is: tuple$(...xs.map((x) => x.is)),
    get toJsonSchema() { return tuple_.toJsonSchema(xs) },
  }
}

declare namespace tuple_ {
  interface def<
    S extends typeof tuple_.spec, 
    Opt extends tuple_.opt<S> = tuple_.opt<S>
  > {
    _tag: typeof Tag.tuple
    def: S
    _type: [...this["_opt"][0], ...this["_opt"][1]]
    _opt: Opt
  }
  type apply<T> = tuple_<readonly T[]>
  const spec: readonly unknown[]
  const children: readonly AST.Node[]
  const shorthand: Short<AST.Short>
  type Short<T> = readonly T[]
  type shorthand<T> = [T] extends [Short<AST.Short>] ? Short<AST.Short> : never
  type fromShort<T extends typeof tuple_.shorthand>
    = never | { -readonly [I in keyof T]: AST.fromShort<T[I]> } extends
    | infer S extends readonly unknown[]
    ? tuple_<S> : never
    ;
  type toJsonSchema<T extends typeof tuple_.spec> = never | {
    type: "array",
    items: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] }
    minItems: T["length"]
    maxItems: T["length"]
  }
  type opt<T extends readonly unknown[], Opt extends readonly unknown[] = []> 
    = [T] extends [readonly [...infer Todo, optional_<infer S>]] ? tuple_.opt<Todo, [...Opt, S["_type" & keyof S]]>
    : [Opt] extends [readonly []] ? [{ [I in keyof T]: T[I]["_type" & keyof T[I]] }, []] 
    : [req: { [I in keyof T]: T[I]["_type" & keyof T[I]] }, opt: labelOptionals<Opt>]
    ;
  type Labeled = typeof labels[keyof typeof labels]
  const labels: {
    1: readonly [ᣔ0: _]
    2: readonly [ᣔ0: _, ᣔ1: _]
    3: readonly [ᣔ0: _, ᣔ1: _, ᣔ2: _]
    4: readonly [ᣔ0: _, ᣔ1: _, ᣔ2: _, ᣔ3: _]
    5: readonly [ᣔ0: _, ᣔ1: _, ᣔ2: _, ᣔ3: _, ᣔ4: _]
    6: readonly [ᣔ0: _, ᣔ1: _, ᣔ2: _, ᣔ3: _, ᣔ4: _, ᣔ5: _]
    7: readonly [ᣔ0: _, ᣔ1: _, ᣔ2: _, ᣔ3: _, ᣔ4: _, ᣔ5: _, ᣔ6: _]
    8: readonly [ᣔ0: _, ᣔ1: _, ᣔ2: _, ᣔ3: _, ᣔ4: _, ᣔ5: _, ᣔ6: _, ᣔ7: _]
    9: readonly [ᣔ0: _, ᣔ1: _, ᣔ2: _, ᣔ3: _, ᣔ4: _, ᣔ5: _, ᣔ6: _, ᣔ7: _, ᣔ8: _]
  }
  type labelOptionals<
    T extends readonly unknown[], 
    S extends 
    | (typeof labels)[keyof typeof labels & T["length"]]
    = (typeof labels)[keyof typeof labels & T["length"]]
  > = { [I in keyof S]+?: T[I & keyof T] }
}
namespace tuple_ {
  export const toJsonSchema = <const S extends typeof tuple_.spec>(spec: S) => {
    return {
      type: "array",
      items: spec.filter(has("toJsonSchema")).map((_) => _.toJsonSchema),
      minItems: spec.length,
      maxItems: spec.length,
    } as tuple_.toJsonSchema<S>
  }

  export function def<S extends typeof tuple_.spec>(ss: S): tuple_.def<S> {
    return {
      _tag: Tag.tuple,
      def: ss,
      _type: phantom,
      _opt: phantom,
    }
  }
  export const isDef = <T extends typeof tuple_.spec>(u: unknown): u is tuple_.def<T> => 
    !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.tuple
  export const is 
    : <T extends typeof tuple_.spec>(u: unknown) => u is { def: tuple_<T> }
    = (u): u is never => isDef(u)
}
///    TUPLE    ///
///////////////////


////////////////////
///    OBJECT    ///
interface object_<S extends typeof object_.spec> extends object_.def<S> {
  is(src: unknown): src is this["_type"]
  get toJsonSchema(): object_.toJsonSchema<S>
}

/**
 * ## {@link object_ `t.object`}
 */
function object_<S extends typeof object_.children>(spec: S): object_<S>
function object_<S extends typeof object_.children>(xs: S) {
  return {
    _tag: Tag.object,
    def: object_.def(xs),
    _opt: object_.opt(xs),
    _type: phantom,
    toJsonSchema: object_.toJsonSchema(xs),
    is: object$(map(xs, (x) => x.is))
  }
}

declare namespace object_ {
  interface def<
    S extends typeof object_.spec,
    Opt extends object_.opt<S> = object_.opt<S>,
    Req extends Exclude<keyof S, Opt> = Exclude<keyof S, Opt>
  > {
    _tag: typeof Tag.object,
    def: S
    _type: Force<
      & $<{ [K in Opt]+?: S[K]["_type" & keyof S[K]] }>
      & $<{ [K in Req]-?: S[K]["_type" & keyof S[K]] }>
    >
    _opt: object_.opt<S[0]>[]
  }
  type apply<T> = object_<{ [x: string]: T }>
  const spec: never | { [x: string]: unknown }
  const children: never | { [x: string]: AST.Node }
  const shorthand: never | Short<AST.Short>
  type Short<T> = never | { [x: string]: T }
  type shorthand<T> = [T] extends [typeof object_.shorthand] ? typeof object_.shorthand : never
  type fromShort<T extends typeof object_.shorthand> = never | object_<_fromShort<T>>
  type toJsonSchema<T, Req = Exclude<keyof T, object_.opt<T>>> = never | {
    type: typeof Tag.object,
    required: [Req] extends [never] ? [] : Req[]
    properties: { [K in keyof T]: T[K]["toJsonSchema" & keyof T[K]] }
  }
  type $<T> = [keyof T] extends [never] ? unknown : T
  type opt<T, K extends keyof T = keyof T> = K extends K ? T[K] extends optional_.def<any> ? K : never : never
  type hasQuestionMark<T, K extends string & keyof T = string & keyof T> = K extends `${string}?` ? K : never
  type noQuestionMark<T, K extends keyof T = keyof T> = K extends `${string}?` ? never : K
  type _fromShort<
    S,
    Opt extends object_.hasQuestionMark<S> = object_.hasQuestionMark<S>,
    Req extends object_.noQuestionMark<S> = object_.noQuestionMark<S>
  > = never | Force<
    & $<{ [K in Opt as K extends `${infer _}?` ? _ : K]: optional_<AST.fromShort<S[K]>> }>
    & $<{ [K in Req]-?: AST.fromShort<S[K]> }>
  >
}

namespace object_ {
  export function hasQuestionMark<K extends string>(key: K): key is K & `${string}?` { return key.endsWith("?") }
  export function rmQuestionMark<K extends string>(key: K): string { return key.endsWith("?") ? key.slice(0, -1) : key }
  export function opt<S>(children: S): opt<S>[]
  export function opt<S extends { [x: string]: unknown }>(children: S): string[]
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
  const isOptional = <T>(u: unknown): u is optional_<T> => has("_tag", is$.literally(Tag.optional))(u)
  export function toJsonSchema<S extends typeof object_.spec>(spec: S): object_.toJsonSchema<S>
  export function toJsonSchema<S extends typeof object_.spec>(spec: S) {
    return {
      type: Tag.object,
      required: Object.keys(spec).filter((k) => !isOptional(spec[k])),
      properties: fn.pipe(
        Object.entries(spec),
        (xs) => xs.filter(tuple$(is$.string, has("toJsonSchema", is$.nonnullable))),
        (xs) => xs.map(([k, v]) => [k, v.toJsonSchema]),
        Object.fromEntries,
      )
    }
  }
  export const isDef
    : <T extends typeof object_.spec>(u: unknown) => u is object_.def<T>
    = (u): u is never => !!u && typeof u === "object" && "_tag" in u && u._tag === Tag.object
  export const is 
    : <T extends typeof object_.spec>(u: unknown) => u is object_<T>
    = (u): u is never => isDef(u)
}
///    OBJECT    ///
////////////////////

const key = anyOf_(string_(), number_(), symbol_())

const isScalarShortName = (s: string): s is Terminal => Terminals.includes(s as never)
const isTerminal = (u: unknown): u is Terminal => typeof u === "string" && isScalarShortName(u)
const isArrayShorthand = <T>(u: unknown): u is array_.Short<T> => (u as any)?.[0] === "[]"
const isRecordShorthand = <T>(u: unknown): u is record_.Short<T> => Array_isArray(u) && u[0] === "{}"
const isTupleShorthand = <T>(u: unknown): u is tuple_.Short<T> => Array_isArray(u) && u.every(isShorthand)
const isObjectShorthand = <T>(u: unknown): u is object_.Short<T> => !!u && typeof u === "object"
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
const isShorthand
  = (_: unknown): _ is AST.Short =>
  isTerminal(_) ||
  isArrayShorthand(_) ||
  isRecordShorthand(_) ||
  isTupleShorthand(_) ||
  isObjectShorthand(_) ||
  isAllOfShorthand(_) ||
  isAnyOfShorthand(_) ||
  isConstStringLiteral(_)

// TODO: fix type assertion
const parseConstStringLiteral = (s: AST.Short) =>
  (isConstStringLiteral(s) ? s.slice(1, -1) : s) as never

const terminalMap = {
  any: any_,
  "any[]": () => array_(any_()),
  "any{}": () => record_(any_()),
  boolean: boolean_,
  "boolean[]": () => array_(boolean_()),
  "boolean{}": () => record_(boolean_()),
  integer: integer_,
  "integer[]": () => array_(integer_()),
  "integer{}": () => record_(integer_()),
  number: number_,
  "number[]": () => array_(number_()),
  "number{}": () => record_(number_()),
  string: string_,
  "string[]": () => array_(string_()),
  "string{}": () => record_(string_()),
  symbol: symbol_,
  "symbol[]": () => array_(symbol_()),
  "symbol{}": () => record_(symbol_()),
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

function foldShorthand<T>(algebra: Functor.Algebra<AST.ShortLambda, T>) { return fn.cata(ShortFunctor)(algebra) }

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

  const NotYetSupported = (...args: Parameters<typeof Invariant.NotYetSupported>) => Invariant.NotYetSupported(...args)("core/src/guard/ast.ts")

  export const toTraversable
    : Functor.Algebra<AST.lambda, Traversable.F<unknown>>
    = (ast) => {
      switch (ast._tag) {
        default: return fn.exhaustive(ast)
        case "any": return NotYetSupported("any", "Corecursive.toTraversable")
        case "symbol": return NotYetSupported("symbol", "Corecursive.toTraversable")
        case "null": return { type: "null" } satisfies Traversable.null
        case "boolean": return { type: "boolean" } satisfies Traversable.boolean
        case "integer": return { type: "integer" } satisfies Traversable.integer
        case "number": return { type: "number" } satisfies Traversable.number
        case "string": return { type: "string" } satisfies Traversable.string
        case "enum": return { type: "enum", enum: ast.def } satisfies Traversable.enum
        case "const": return { type: "const", const: ast.def } satisfies Traversable.const
        case "array": return { type: "array", items: ast.def } satisfies Traversable.arrayF<unknown>
        case "allOf": return { type: "allOf", allOf: ast.def } satisfies Traversable.allOfF<unknown>
        case "anyOf": return { type: "anyOf", anyOf: ast.def } satisfies Traversable.anyOfF<unknown>
        case "oneOf": return { type: "oneOf", oneOf: ast.def } satisfies Traversable.oneOfF<unknown>
        case "optional": return { type: "anyOf", anyOf: [ast.def, { type: "enum"}], meta: { optional: true } }
        case "record": return { type: "record", additionalProperties: ast.def } satisfies Traversable.recordF<unknown>
        case "tuple": return { type: "tuple", items: ast.def } satisfies Traversable.tupleF<unknown>
        case "object": return {
          type: "object",
          required: Object.values(ast.def).filter((_) => _.meta?.optional !== true).map((_) => _.type),
          properties: ast.def,
        } satisfies Traversable.objectF<unknown>
      }
    }

  export const toJsonSchema: Functor.Algebra<AST.lambda, JsonSchema.F<unknown>>
    = (ast) => {
      switch (ast._tag) {
        default: return fn.exhaustive(ast)
        case "any": return NotYetSupported("any", "Corecursive.toJsonSchema")
        case "symbol": return NotYetSupported("symbol", "Corecursive.toJsonSchema")
        case "null": return { type: "null" } satisfies JsonSchema.null
        case "boolean": return { type: "boolean" } satisfies JsonSchema.boolean
        case "integer": return { type: "integer" } satisfies JsonSchema.integer
        case "number": return { type: "number" } satisfies JsonSchema.number
        case "string": return { type: "string" } satisfies JsonSchema.string
        case "enum": return { enum: ast.def } satisfies JsonSchema.enum
        case "const": return { const: ast.def } satisfies JsonSchema.const
        case "array": return { type: "array", items: ast.def } satisfies JsonSchema.arrayF<unknown>
        case "allOf": return { allOf: ast.def } satisfies JsonSchema.allOfF<unknown>
        case "anyOf": return { anyOf: ast.def } satisfies JsonSchema.anyOfF<unknown>
        case "oneOf": return { oneOf: ast.def } satisfies JsonSchema.oneOfF<unknown>
        case "optional": return { type: "anyOf", anyOf: [ast.def, { type: "enum"}], meta: { optional: true } }
        case "record": return { type: "object", additionalProperties: ast.def, properties: {} } satisfies JsonSchema.objectF<unknown>
        case "tuple": return { type: "array", items: ast.def } satisfies JsonSchema.arrayF<unknown>
        case "object": return {
          type: "object",
          // required: Object.values(ast.def).filter((_) => _.meta?.optional !== true).map((_) => _.type),
          properties: ast.def,
        } satisfies JsonSchema.objectF<unknown>
      }
    }
}

export const fromSeed = foldShorthand(Recursive.fromSeed)
// export const toJsonSchema = fold(Recursive.toJsonSchema)

const short: {
  (s: undefined): null_
  (s: null): null_
  <const S extends Terminal>(s: S): typeof AST.TerminalByTag[S]
  <const S extends string>(s: S): const_<const_.parse<S>>
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
  /** forcing the 2nd overload for use in a pipeline */
  const objectSchema
    : <S extends typeof object_.children>(spec: S) => object_<S>
    = object_

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
      objectSchema,
    )
    case isTupleShorthand(args): return tuple_(...args.filter((x) => x !== undefined).map((x) => fromSeed(x)))
    default: return typeof args[0] === "string" ? Recursive.UnrecognizedLiteral(args[0]) : const_(args[0] as never)
  }
}) as never // TODO: fix type assertion

export function toStandardSchema<T extends S, S = unknown>(schema: { is(src: S): src is T }): StandardSchemaV1<S, T>
export function toStandardSchema<T extends S, S = unknown>(schema: { is(src: S): src is T }): StandardSchemaV1<S, T> {
  return {
    "~standard": {
      version: 1,
      vendor: "traversable",
      validate: (src) => {
        const s: S = src as never
        return schema.is(s) 
          ? { value: s } 
          : { issues: [] }
      },
      types: {
        input: <S>phantom,
        output: <T>phantom,
      }
    }
  }
}
