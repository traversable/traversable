import type { StandardSchemaV1 } from "@standard-schema/spec"
import type { JsonSchema } from "@traversable/core/exports"
import { fn, map } from "@traversable/data"
import type {
  Force,
  Functor,
  HKT,
  Intersect,
  Partial,
  Require,
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
  isAST as is,
  Tag,
  NullaryTag,
  Functor,
  fold,
  unfold,
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
  toJsonSchema,
  toTraversable,
  toStandardSchema,
}

/** @internal */
const phantom: never = symbol.phantom as never
/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const NotYetSupported = (...args: Parameters<typeof Invariant.NotYetSupported>) => 
  Invariant.NotYetSupported(...args)("core/src/guard/ast.ts")
/** @internal */
const isOptional = <T>(u: _): u is optional_<T> => has("_tag", is$.literally(Tag.optional))(u)
/** @internal */
// function hasTag(u: _): u is { _tag: string } 
function hasTag<T extends string>(tag: T): (u: _) => u is { _tag: T } 
function hasTag(tag: string) {
  return (u: _): boolean => !!u 
    && typeof u === "object"
    && "_tag" in u 
    && u._tag === tag
}

type codec<I, O> = never | Codec<[source: I, target: O]>
interface Codec<T extends [from: _, to: _]> { is(src: T[0]): src is T[1] }
type schema<O, I = _> = never | Schema<[I, O]>
type target<S> = S extends (_: any) => _ is infer T ? T : never
type Schema<S extends [source: any, target: _]> = Type<{ is(src: S[0]): src is S[1] }>
interface Type<T extends { is(src: any): src is any }> extends newtype<T & { [symbol.schema]?: symbol.schema }> {
  _type: target<T["is"]>
}
type AnyNode<T = _> = 
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

export interface Options<I = _, O = _> extends Partial<
  & typeof Options 
  & { from?: I }
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
  from: void 0 as _
} as const

declare namespace AST { export { AnyNode as any, typeof_ as typeof } }
declare namespace AST {
  interface Leaf<T extends readonly [source: _, target: _] = [source: _, target: _]> {
    _tag: string
    def: _
    _type: T[1]
    is(u: T[0]): u is T[1]
  }
  interface Node { _type: _, is(u: any): u is _ }
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
 * ## {@link isAST `AST.is`}
 * 
 * Narrows its input to be a member of {@link AST `AST`}.
 */
const isAST
  : <T>(u: _) => u is AST.F<T>
  = (u): u is never => !!u 
    && typeof u === "object" 
    && "_tag" in u && Object.values<_>(Tag).includes(u._tag)

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

function AST() {}
AST.fold = fold
AST.unfold = unfold
AST.Functor = Functor
AST.is = isAST

function fold<T>(g: Functor.Algebra<AST.lambda, T>) { return fn.cata(Functor)(g) }
function unfold<T>(g: Functor.Coalgebra<AST.lambda, T>) { return fn.ana(Functor)(g) }

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
  is(u: _): u is null
  get toJsonSchema(): typeof null_.toJsonSchema
}
function null_(): null_
function null_<I>(options: Options<I>): null_.Codec<I>
function null_(): null_ {
  return {
    ...null_.def,
    is: is$.null,
    get toJsonSchema() { return null_.toJsonSchema },
  }
}

declare namespace null_ {
  const spec: null
  interface def {
    _tag: typeof Tag.null
    def: typeof null_.spec
    _type: null
  }
  interface Codec<I> extends null_.def, codec<I, null> {}
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
  export const is = (u: _): u is null_ => hasTag(Tag.null)(u)
  export const isDef = (u: _): u is null_.def => hasTag(Tag.null)(u)
}
///    NULL    ///
//////////////////


/////////////////////
///    BOOLEAN    ///
interface boolean_ extends boolean_.def {
  is(u: _): u is boolean
  get toJsonSchema(): typeof boolean_.toJsonSchema
}
function boolean_(): boolean_
function boolean_<I>(options: Options<I>): boolean_.Codec<I>
function boolean_(): boolean_ {
  return {
    ...boolean_.def,
    is: is$.boolean,
    get toJsonSchema() { return boolean_.toJsonSchema },
  }
}
declare namespace boolean_ {
  const spec: boolean
  interface def {
    _tag: typeof Tag.boolean
    def: typeof boolean_.spec
    _type: boolean
  }
  interface Codec<I> extends boolean_.def, codec<I, boolean> {}
}
namespace boolean_ {
  export const toJsonSchema = { type: Tag.boolean }
  export const def = {
    _tag: Tag.boolean,
    def: symbol.boolean as never,
    _type: phantom,
  } as const satisfies boolean_.def
  export const is = (u: _): u is boolean_ => hasTag(Tag.boolean)(u)
  export const isDef = (u: _): u is boolean_.def => hasTag(Tag.boolean)(u)
}
///    BOOLEAN    ///
/////////////////////


////////////////////
///    SYMBOL    ///
interface symbol_ extends symbol_.def {
  is(u: _): u is symbol
  toJsonSchema?: void
}
function symbol_(): symbol_
function symbol_<I>(options?: Options<I>): symbol_.Codec<I>
function symbol_(): symbol_ { 
  return { 
    ...symbol_.def, 
    is: is$.symbol,
  } 
}
declare namespace symbol_ {
  const spec: symbol
  interface def {
    _tag: typeof Tag.symbol
    def: typeof symbol_.spec
    _type: symbol
  }
  interface Codec<I> extends symbol_.def, codec<I, symbol> {}
}
namespace symbol_ {
  export const toJsonSchema: void = void 0
  export const def = {
    _tag: Tag.symbol,
    def: symbol.symbol as never,
    _type: phantom,
  } as const satisfies symbol_.def
  export const is = (u: _): u is symbol_ => hasTag(Tag.symbol)(u)
  export const isDef = (u: _): u is symbol_.def => hasTag(Tag.symbol)(u)
}
///    SYMBOL    ///
////////////////////


/////////////////////
///    INTEGER    ///
interface integer_ extends integer_.def {
  is(u: _): u is integer
  get toJsonSchema(): typeof integer_.toJsonSchema
}
function integer_(): integer_
function integer_<I>(options?: Options<I>): integer_.Codec<I>
function integer_(): integer_ {
  return {
    ...integer_.def,
    is: is$.integer as (u: _) => u is integer,
    get toJsonSchema() { return integer_.toJsonSchema },
  }
}
declare namespace integer_ {
  const spec: integer
  interface def {
    _tag: typeof Tag.integer
    def: typeof integer_.spec
    _type: integer
  }
  interface Codec<I> extends integer_.def, codec<I, integer> {}
}
namespace integer_ {
  export const toJsonSchema = { type: Tag.integer }
  export const def = {
    _tag: Tag.integer,
    def: symbol.integer as never as integer,
    _type: phantom,
  } as const satisfies integer_.def
  export const is = (u: _): u is integer_ => hasTag(Tag.integer)(u)
  export const isDef = (u: _): u is integer_.def => hasTag(Tag.integer)(u)
}
///    INTEGER    ///
/////////////////////


////////////////////
///    NUMBER    ///
interface number_ extends number_.def {
  is(u: _): u is number
  get toJsonSchema(): typeof number_.jsonSchema
}
function number_(): number_ 
function number_<I>(options?: Options<I>): number_.Codec<I>
function number_(): number_ {
  return {
    ...number_.def,
    is: is$.number,
    get toJsonSchema() { return number_.jsonSchema },
  }
}
declare namespace number_ {
  const spec: number
  interface def {
    _tag: typeof Tag.number
    def: typeof number_.spec
    _type: number
  }
  interface Codec<I> extends number_.def, codec<I, number> {}
}
namespace number_ {
  export const jsonSchema = { type: Tag.number }
  export const def = {
    _tag: Tag.number,
    def: symbol.number as never,
    _type: phantom,
  } as const satisfies number_.def
  export const is = (u: _): u is number_ => hasTag(Tag.number)(u)
  export const isDef = (u: _): u is number_.def => hasTag(Tag.number)(u)
}
///    NUMBER    ///
////////////////////


////////////////////
///    STRING    ///
interface string_ extends string_.def {
  is(u: _): u is string
  get toJsonSchema(): typeof string_.toJsonSchema
}
function string_(): string_ 
function string_<I>(options?: Options<I>): string_.Codec<I>
function string_(): string_ {
  return {
    ...string_.def,
    is: is$.string,
    get toJsonSchema() { return string_.toJsonSchema },
  }
}
declare namespace string_ {
  const spec: string
  interface def {
    _tag: typeof Tag.string
    def: typeof string_.spec
    _type: string
  }
  interface Codec<I> extends string_.def, codec<I, string> {}
}
namespace string_ {
  export const toJsonSchema = { type: Tag.string }
  export const def = {
    _tag: Tag.string,
    def: symbol.string as never,
    _type: phantom,
  } as const satisfies string_.def
  export const is = (u: _): u is string_ => hasTag(Tag.string)(u)
  export const isDef = (u: _): u is string_.def => hasTag(Tag.string)(u)
}
///    STRING    ///
////////////////////


/////////////////
///    ANY    ///
interface any_ extends any_.def {
  is(u: _): u is this["_type"]
  get toJsonSchema(): typeof any_.toJsonSchema
}
function any_(): any_
function any_<I>(options?: Options<I>): any_.Codec<I>
function any_(): any_ {
  return {
    ...any_.def,
    is: is$.any,
    get toJsonSchema() { return any_.toJsonSchema },
  }
}
declare namespace any_ {
  const spec: _
  interface def {
    _tag: typeof Tag.any
    def: typeof any_.spec
    _type: _,
  }
  interface Codec<I> extends any_.def, codec<I, _> {}
}
namespace any_ {
  export const toJsonSchema = { type: "object", properties: {} }
  export const def = {
    _tag: Tag.any,
    def: symbol.any as never,
    _type: phantom,
  } as const satisfies any_.def
  export const is = (u: _): u is any_ => hasTag(Tag.any)(u)
  export const isDef = (u: _): u is any_.def => hasTag(Tag.any)(u)
}
///    ANY    ///
/////////////////


//////////////////
///    ENUM    ///
interface enum_<S extends typeof enum_.spec> extends enum_.def<S> {
  is(u: _): u is S
  get toJsonSchema(): enum_.toJsonSchema<S>
}
function enum_<S extends typeof enum_.children>(...specs: [...S]): enum_<S>
function enum_<I, O extends typeof enum_.children>(options: Options<I>, ...specs: [...O]): enum_.Codec<I, O>
function enum_<I, O extends typeof enum_.children>(
  ...args: 
    | [I, ...O]
    | [...s: O]
) {
  const [, xs] = parseArgs(...args)
  return {
    ...enum_.def(xs),
    is: anyOf$(...xs.map(is$.literally)),
    get toJsonSchema() { return enum_.toJsonSchema(xs) },
  }
}

declare namespace enum_ {
  const spec: readonly _[]
  const children: readonly AST.Node[]
  interface def<S extends typeof enum_.spec> {
    _tag: typeof Tag.enum
    def: S
    _type: S[number]["_type" & keyof S[number]],
  }
  interface Codec<I, O extends typeof enum_.spec> extends enum_.def<O>, codec<I, O> {}
  type apply<T> = enum_<readonly T[]>
  type toJsonSchema<S extends typeof enum_.spec> = never | { "enum": { [I in keyof S]: S[I]["_type" & keyof S[I]] } }
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
  export const is = <T extends typeof enum_.spec>(u: _): u is enum_<T> => hasTag(Tag.enum)(u)
  export const isDef = <T extends typeof enum_.spec>(u: _): u is enum_.def<T> => hasTag(Tag.enum)(u)
}
///    ENUM    ///
//////////////////


///////////////////
///    CONST    ///
interface const_<S> extends const_.def<S> {
  is(u: _): u is S
  get toJsonSchema(): const_.toJsonSchema<S>
}
function const_<const T>(value: T, options?: const_.Options<T>): const_<T>
function const_<I, const O>(value: O, options: const_.Options<I> & { from: I }): const_.Codec<I, O>
function const_<const T>(v: T, _?: const_.Options<T>): const_<T> {
  const eq = _?.eq
  const def = const_.def(v)
  const is 
    = eq === undefined 
    ? ((u: _): u is T => u === v)
    : ((u: _): u is never => eq(def.def, u as T))
  return {
    ...def,
    is,
    get toJsonSchema() { return const_.toJsonSchema(v) },
  }
}
declare namespace const_ { export { options as Options } }
declare namespace const_ {
  const spec: _
  const children: _
  interface def<T extends typeof const_.spec> {
    _tag: typeof Tag.const
    def: T
    _type: T
  }
  interface Codec<I, O> extends const_.def<O>, codec<I, O> {}
  type apply<T> = const_<T>
  type toJsonSchema<T> = never | { "const": T }
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
    eq?(left: T, right: T): boolean
  }> {}
}
namespace const_ {
  export function def<T extends typeof const_.spec>(v: T): const_.def<T> {
    return {
      _tag: Tag.const,
      def: v,
      _type: phantom,
    } as const satisfies const_.def<T>
  }
  export function toJsonSchema<const S>(value: S): const_.toJsonSchema<S> 
  export function toJsonSchema<const S>(value: S) { return { const: value } }
  export const defaults = { eq: globalThis.Object.is } satisfies Require<Options, "eq">
  export const is = <T>(u: _): u is const_<T> => hasTag(Tag.const)(u)
  export const isDef = <T>(u: _): u is const_.def<T> => hasTag(Tag.const)(u)
}
///    CONST    ///
///////////////////


//////////////////////
///    OPTIONAL    ///
interface optional_<S extends typeof optional_.spec> extends optional_.def<S> {
  is(u: _): u is this["_type"]
  get toJsonSchema(): optional_.toJsonSchema<S>
}
function optional_<S extends typeof optional_.children>(spec: S): optional_<S>
function optional_<I, O extends typeof optional_.children>(spec: O, options: Options<I>): optional_.Codec<I, O>
function optional_<S extends typeof optional_.children>(s: S): optional_<S> {
  return {
    ...optional_.def(s),
    is: optional$(s.is),
    get toJsonSchema() { return optional_.toJsonSchema(s) },
  }
}
declare namespace optional_ {
  const spec: _
  const children: AST.Node
  interface def<S extends typeof optional_.spec> {
    _tag: typeof Tag.optional,
    def: S,
    _type: S["_type" & keyof S] | undefined
  }
  interface Codec<I, O> extends optional_.def<O>, codec<I, O> {}
  type apply<T> = optional_<T>
  type toJsonSchema<T> = T["toJsonSchema" & keyof T]
}
namespace optional_ {
  export function def<S extends typeof optional_.spec>(s: S): optional_.def<S> {
    return {
      _tag: Tag.optional,
      def: s,
      _type: phantom,
    } as const satisfies optional_.def<S>
  }
  export function toJsonSchema<S extends typeof optional_.spec>(spec: S): optional_.toJsonSchema<S>
  export function toJsonSchema<S extends typeof optional_.spec>(spec: S) 
    { return has("toJsonSchema")(spec) && spec.toJsonSchema }
  export const is = <T>(u: _): u is optional_<T> => hasTag(Tag.optional)(u)
  export const isDef = <T>(u: _): u is optional_.def<T> => hasTag(Tag.optional)(u)
}
///    OPTIONAL    ///
//////////////////////

function parseArgs<I, O extends readonly _[]>(...args: [I, ...O] | O): [I, O]
function parseArgs<I, O extends readonly [] | readonly unknown[]>(
  ...args: 
    | [I, ...O]
    | [...s: O]
) {
  const [head, ...tail] = args
  return has("from")(head) ? [head, tail] : [null, args]
}

////////////////////
///    ALL OF    ///
interface allOf_<S extends readonly _[]> extends allOf_.def<S> {
  is(u: _): u is this["_type"]
  get toJsonSchema(): allOf_.toJsonSchema<S>
}
function allOf_<S extends typeof allOf_.children>(...specs: S): allOf_<S>
function allOf_<I, O extends typeof allOf_.children>(options: Options<I>, ...xs: [...O]): allOf_.Codec<I, O>
function allOf_<I, O extends typeof allOf_.children>(
  ...args:
    | [I, ...O]
    | [...s: O]
) {
  const [, xs] = parseArgs(...args)
  return {
    ...allOf_.def(xs),
    is: allOf$(...xs.map((x) => x.is)),
    get toJsonSchema() { return allOf_.toJsonSchema(xs) },
  }
}
declare namespace allOf_ {
  const spec: readonly _[]
  const children: readonly AST.Node[]
  interface def<S extends typeof allOf_.spec> {
    _tag: typeof Tag.allOf
    def: S
    _type: Intersect<{ [I in keyof S]: S[I]["_type" & keyof S[I]] }>
  }
  interface Codec<I, O extends typeof allOf_.spec> extends allOf_.def<O>, codec<I, O> {}
  type apply<T> = allOf_<readonly T[]>
  type toJsonSchema<T extends typeof allOf_.spec> = never | { 
    allOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] } 
  }
}
namespace allOf_ {
  export function def<S extends typeof allOf_.spec>(ss: S): allOf_.def<S> {
    return {
      _tag: Tag.allOf,
      def: ss,
      _type: phantom,
    } as const satisfies allOf_.def<S>
  }
  export function toJsonSchema<S extends typeof allOf_.spec>(spec: S): allOf_.toJsonSchema<S>
  export function toJsonSchema<S extends typeof allOf_.spec>(spec: S) 
    { return { allOf: spec.filter(has("toJsonSchema")).map((_) => _.toJsonSchema) } }
  export const is = <T extends typeof allOf_.spec>(u: _): u is allOf_<T> => hasTag(Tag.allOf)(u)
  export const isDef = <T extends typeof allOf_.spec>(u: _): u is allOf_.def<T> => hasTag(Tag.allOf)(u)
}
///    ALL OF    ///
////////////////////


////////////////////
///    ANY OF    ///
interface anyOf_<S extends typeof anyOf_.spec> extends anyOf_.def<S> {
  is(u: _): u is S[number]["_type" & keyof S[number]]
  get toJsonSchema(): anyOf_.toJsonSchema<S>
}
function anyOf_<S extends typeof anyOf_.children>(...specs: S): anyOf_<S>
function anyOf_<I, O extends typeof anyOf_.children>(options: Options<I>, ...xs: [...O]): anyOf_.Codec<I, O>
function anyOf_<I, O extends typeof anyOf_.children>(
  ...args:
    | [I, ...O]
    | [...s: O]
) {
  const [, xs] = parseArgs(...args)
  return {
    ...anyOf_.def(xs),
    is: anyOf$(...xs.map((x) => x.is)),
    get toJsonSchema() { return anyOf_.toJsonSchema(xs) },
  }
}
declare namespace anyOf_ {
  const spec: readonly _[]
  const children: readonly AST.Node[]
  interface def<S extends typeof anyOf_.spec> {
    _tag: typeof Tag.anyOf
    def: S
    _type: S[number]["_type" & keyof S[number]]
  }
  interface Codec<I, O extends typeof allOf_.spec> extends anyOf_.def<O>, codec<I, O> {}
  type apply<T> = anyOf_<readonly T[]>
  type toJsonSchema<T extends typeof anyOf_.spec> = never | { 
    anyOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] } 
  }
}
namespace anyOf_ {
  export function def<S extends typeof anyOf_.spec>(ss: S): anyOf_.def<S> {
    return {
      _tag: Tag.anyOf,
      def: ss,
      _type: phantom,
    }
  }
  export function toJsonSchema<S extends typeof anyOf_.spec>(specs: S): anyOf_.toJsonSchema<S> 
  export function toJsonSchema<S extends typeof anyOf_.spec>(spec: S) 
    { return { anyOf: spec.filter(has("toJsonSchema")).map((_) => _.toJsonSchema) } }
  export const is = <T extends typeof anyOf_.spec>(u: _): u is anyOf_<T> => hasTag(Tag.anyOf)(u)
  export const isDef = <T extends typeof anyOf_.spec>(u: _): u is anyOf_.def<T> => hasTag(Tag.anyOf)(u)
}
///    ANY OF    ///
////////////////////


////////////////////
///    ONE OF    ///
interface oneOf_<S extends typeof oneOf_.spec> extends oneOf_.def<S> {
  is(u: _): u is S[number]["_type" & keyof S[number]]
  get toJsonSchema(): oneOf_.toJsonSchema<S>
}
function oneOf_<S extends typeof oneOf_.children>(...specs: S): oneOf_<S>
function oneOf_<I, O extends typeof oneOf_.children>(options: Options<I>, ...xs: O): oneOf_.Codec<I, O>
function oneOf_<I, O extends typeof oneOf_.children>(
  ...args:
  | [I, ...O]
  | [...s: O]
) {
  const [, xs] = parseArgs(...args)
  return {
    ...oneOf_.def(xs),
    is: anyOf$(...xs.map((x) => x.is)),
    get toJsonSchema() { return oneOf_.toJsonSchema(xs) },
  }
}
declare namespace oneOf_ {
  const spec: readonly _[]
  const children: readonly AST.Node[]
  interface def<S extends typeof oneOf_.spec> {
    _tag: typeof Tag.oneOf
    def: S
    _type: S[number]["_type" & keyof S[number]]
  }
  interface Codec<I, O extends typeof oneOf_.spec> extends oneOf_.def<O>, codec<I, O> {}
  type apply<T> = oneOf_<readonly T[]>
  type toJsonSchema<T extends typeof oneOf_.spec> = never | { 
    oneOf: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] } 
  }
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
  export const is = <T extends typeof oneOf_.spec>(u: _): u is oneOf_<T> => hasTag(Tag.oneOf)(u)
  export const isDef = <T extends typeof oneOf_.spec>(u: _): u is oneOf_.def<T> => hasTag(Tag.oneOf)(u)
}
///    ONE OF    ///
////////////////////


///////////////////
///    ARRAY    ///
interface array_<S extends typeof array_.spec> extends array_.def<S> {
  is(src: _): src is typeof_<S>[]
  toJsonSchema: array_.toJsonSchema<S>
}

function array_<S extends typeof array_.children>(spec: S): array_<S>
function array_<I, O extends typeof array_.children>(spec: O, options: Options<I>): array_.Codec<I, O>
function array_<S extends typeof array_.children>(x: S) {
  return {
    ...array_.def(x),
    is: array$(x.is),
    get toJsonSchema() { return array_.toJsonSchema(x) },
  }
}

declare namespace array_ {
  const spec: _
  const children: AST.Node
  interface def<S extends typeof array_.spec> {
    _tag: typeof Tag.array
    def: S
    _type: S["_type" & keyof S][]
  }
  interface Codec<I, O> extends array_.def<O>, codec<I, O> {}
  type apply<T> = array_<T>
  type toJsonSchema<T> = never | {
    type: "array"
    items: T["toJsonSchema" & keyof T]
  }
}
namespace array_ {
  export function def<S extends typeof array_.spec>(s: S): array_.def<S>
  export function def<S extends typeof array_.spec>(s: S): array_.def<S> {
    return {
      _tag: Tag.array,
      def: s,
      _type: phantom,
    }
  }
  export function toJsonSchema<S extends typeof array_.spec>(spec: S): array_.toJsonSchema<S> 
  export function toJsonSchema<S extends typeof array_.spec>(spec: S) {
    return {
      type: "array",
      ...has("toJsonSchema")(spec) && { items: spec.toJsonSchema },
    }
  }
  export const is = <T extends typeof array_.spec>(u: _): u is array_<T> => hasTag(Tag.array)(u)
  export const isDef = <T extends typeof array_.spec>(u: _): u is array_.def<T> => hasTag(Tag.array)(u)
}
///    ARRAY    ///
///////////////////


////////////////////
///    RECORD    ///
interface record_<S extends typeof record_.spec> extends record_.def<S> {
  is(src: _): src is this["_type"]
  get toJsonSchema(): record_.toJsonSchema<S>
}
function record_<S extends typeof record_.children>(spec: S): record_<S>
function record_<I, O extends typeof record_.children>(spec: O, options: Options<I>): record_.Codec<I, O>
function record_<S extends typeof record_.children>(x: S): record_<S> {
  return {
    ...record_.def(x),
    is: record$(x.is),
    get toJsonSchema() { return record_.toJsonSchema(x) },
  }
}
declare namespace record_ {
  const spec: _
  const children: AST.Node
  interface def<S extends typeof record_.spec> {
    _tag: typeof Tag.record,
    def: S
    _type: globalThis.Record<string, S["_type" & keyof S]>
  }
  interface Codec<I, O> extends record_.def<O>, codec<I, O> {}
  type apply<T> = record_<T>
  type toJsonSchema<T> = never | {
    type: "object",
    additionalProperties: T["toJsonSchema" & keyof T]
  }
}
namespace record_ {
  export function def<S extends typeof record_.spec>(s: S): record_.def<S> {
    return {
      _tag: Tag.record,
      def: s,
      _type: phantom,
    }
  }
  export function toJsonSchema<S extends typeof record_.spec>(spec: S): record_.toJsonSchema<S>
  export function toJsonSchema<S extends typeof record_.spec>(spec: S) {
    return {
      type: "object",
      ...has("toJsonSchema")(spec) && { additionalProperties: spec.toJsonSchema as S },
    }
  }
  export const isDef = <T extends typeof record_.spec>(u: _): u is record_.def<T> => hasTag(Tag.record)(u)
  export const is 
    : <T>(u: _) => u is record_<T>
    = (u): u is never => hasTag(Tag.record)(u)
}
///    RECORD    ///
////////////////////


///////////////////
///    TUPLE    ///
interface tuple_<S extends typeof tuple_.spec> extends tuple_.def<S, tuple_.opt<S>> {
  is(src: _): src is this["_type"]
  get toJsonSchema(): tuple_.toJsonSchema<S>
}
function tuple_<S extends typeof tuple_.children>(...s: S): tuple_<S>
function tuple_<I, O extends typeof tuple_.children>(options: Options<I>, ...s: O): tuple_.Codec<I, O>
function tuple_<I, O extends typeof tuple_.children>(
  ...args:
    | [I, ...O]
    | [...s: O]
) {
  const [, xs] = parseArgs(...args)
  return {
    ...tuple_.def(xs),
    is: tuple$(...xs.map((x) => x.is)),
    get toJsonSchema() { return tuple_.toJsonSchema(xs) },
  }
}

declare namespace tuple_ {
  const spec: readonly _[]
  const children: readonly AST.Node[]
  interface def<
    S extends typeof tuple_.spec, 
    Opt extends tuple_.opt<S> = tuple_.opt<S>
  > {
    _tag: typeof Tag.tuple
    def: S
    _type: [...this["_opt"][0], ...this["_opt"][1]]
    _opt: Opt
  }
  interface Codec<I, O extends typeof tuple_.spec> extends tuple_.def<O>, codec<I, O> {}
  type apply<T> = tuple_<readonly T[]>
  type toJsonSchema<T extends typeof tuple_.spec> = never | {
    type: "array",
    items: { [I in keyof T]: T[I]["toJsonSchema" & keyof T[I]] }
    minItems: T["length"]
    maxItems: T["length"]
  }
  type opt<T extends readonly _[], Opt extends readonly _[] = []> 
    = [T] extends [readonly [...infer Todo, optional_<infer S>]] ? tuple_.opt<Todo, [...Opt, S["_type" & keyof S]]>
    : [Opt] extends [readonly []] ? [{ [I in keyof T]: T[I]["_type" & keyof T[I]] }, []] 
    : [req: { [I in keyof T]: T[I]["_type" & keyof T[I]] }, opt: withLabels<Opt>]
    ;
  type withLabels<
    T extends readonly _[], 
    S extends 
    | (typeof labels)[keyof typeof labels & T["length"]]
    = (typeof labels)[keyof typeof labels & T["length"]]
  > = never | [S] extends [never] 
    ? { [I in keyof T]+?: T[I] }            // CASE: 10+ optional elements
    : { [I in keyof S]+?: T[I & keyof T] }  // CASE: 0-9 optional elements
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
  type __withLabels__ = withLabels<
    [null_, null_, null_, optional_<null_>, optional_<null_>, optional_<null_>, optional_<null_>, optional_<null_>, optional_<null_>, optional_<null_>]
  >
}
namespace tuple_ {
  export function def<S extends typeof tuple_.spec>(ss: S): tuple_.def<S> {
    return {
      _tag: Tag.tuple,
      def: ss,
      _type: phantom,
      _opt: phantom,
    }
  }
  export const toJsonSchema = <const S extends typeof tuple_.spec>(spec: S) => {
    return {
      type: "array",
      items: spec.filter(has("toJsonSchema")).map((_) => _.toJsonSchema),
      minItems: spec.length,
      maxItems: spec.length,
    } as tuple_.toJsonSchema<S>
  }
  export const is = <T extends typeof tuple_.spec>(u: _): u is tuple_<T> => hasTag(Tag.tuple)(u)
  export const isDef = <T extends typeof tuple_.spec>(u: _): u is tuple_.def<T> => hasTag(Tag.tuple)(u)
}
///    TUPLE    ///
///////////////////


////////////////////
///    OBJECT    ///
interface object_<S extends typeof object_.spec> extends object_.def<S> {
  is(src: _): src is this["_type"]
  get toJsonSchema(): object_.toJsonSchema<S>
}
/**
 * ## {@link object_ `t.object`}
 */
function object_<S extends typeof object_.children>(spec: S): object_<S>
function object_<I, O extends typeof object_.children>(spec: O, options: Options<I>): object_.Codec<I, O>
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
  const spec: never | { [x: string]: _ }
  const children: never | { [x: string]: AST.Node }
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
  interface Codec<I, O extends typeof object_.spec> extends object_.def<O>, codec<I, O> {}
  type apply<T> = object_<{ [x: string]: T }>
  type toJsonSchema<T, Req = Exclude<keyof T, object_.opt<T>>> = never | {
    type: typeof Tag.object,
    required: [Req] extends [never] ? [] : Req[]
    properties: { [K in keyof T]: T[K]["toJsonSchema" & keyof T[K]] }
  }
  type $<T> = [keyof T] extends [never] ? _ : T
  type opt<T, K extends keyof T = keyof T> = K extends K ? T[K] extends optional_.def<any> ? K : never : never
  type hasQuestionMark<T, K extends string & keyof T = string & keyof T> = K extends `${string}?` ? K : never
  type noQuestionMark<T, K extends keyof T = keyof T> = K extends `${string}?` ? never : K
}

namespace object_ {
  export function def<S extends typeof object_.spec>(children: S): object_<S>
  export function def(children: typeof object_.children): { [x: string]: _ } {
    let out: { [x: string]: _ } = {}
    const ks = Object_keys(children)
    for (let ix = 0, len = ks.length; ix < len; ix++) {
      const k = ks[ix]
      out[rmQuestionMark(k)] = hasQuestionMark(k) ? optional_(children[k]) : children[k]
    }
    return out
  }
  export function hasQuestionMark<K extends string>(key: K): key is K & `${string}?` { return key.endsWith("?") }
  export function rmQuestionMark<K extends string>(key: K): string { return key.endsWith("?") ? key.slice(0, -1) : key }
  export function opt<S>(children: S): opt<S>[]
  export function opt<S extends { [x: string]: _ }>(children: S): string[]
    { return Object_keys(children).filter(hasQuestionMark).map((k) => k.slice(0, -1)) }
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
  export const is = <T extends typeof object_.spec>(u: _): u is object_<T> => hasTag(Tag.allOf)(u)
  export const isDef = <T extends typeof object_.spec>(u: _): u is object_.def<T> => hasTag(Tag.object)(u)
}
///    OBJECT    ///
////////////////////

const key = anyOf_(string_(), number_(), symbol_())

namespace Recursive {
  export const toJsonSchema: Functor.Algebra<AST.lambda, JsonSchema.F<_>>
    = (ast) => {
      switch (ast._tag) {
        default: return fn.exhaustive(ast)
        case "any": return NotYetSupported("any", "Recursive.toJsonSchema")
        case "symbol": return NotYetSupported("symbol", "Recursive.toJsonSchema")
        case "null": return { type: "null" } satisfies JsonSchema.null
        case "boolean": return { type: "boolean" } satisfies JsonSchema.boolean
        case "integer": return { type: "integer" } satisfies JsonSchema.integer
        case "number": return { type: "number" } satisfies JsonSchema.number
        case "string": return { type: "string" } satisfies JsonSchema.string
        case "enum": return { enum: ast.def } satisfies JsonSchema.enum
        case "const": return { const: ast.def } satisfies JsonSchema.const
        case "array": return { type: "array", items: ast.def } satisfies JsonSchema.arrayF<_>
        case "allOf": return { allOf: ast.def } satisfies JsonSchema.allOfF<_>
        case "anyOf": return { anyOf: ast.def } satisfies JsonSchema.anyOfF<_>
        case "oneOf": return { oneOf: ast.def } satisfies JsonSchema.oneOfF<_>
        case "optional": return { type: "anyOf", anyOf: [ast.def, { type: "enum"}], meta: { optional: true } }
        case "record": return { type: "object", additionalProperties: ast.def, properties: {} } satisfies JsonSchema.objectF<_>
        case "tuple": return { type: "array", items: ast.def } satisfies JsonSchema.arrayF<_>
        case "object": return {
          type: "object",
          // required: Object.values(ast.def).filter((_) => _.meta?.optional !== true).map((_) => _.type),
          properties: ast.def,
        } satisfies JsonSchema.objectF<_>
      }
    }
  export const toTraversable
    : Functor.Algebra<AST.lambda, Traversable.F<_>>
    = (ast) => {
      switch (ast._tag) {
        default: return fn.exhaustive(ast)
        case "any": return NotYetSupported("any", "Recursive.toTraversable")
        case "symbol": return NotYetSupported("symbol", "Recursive.toTraversable")
        case "null": return { type: "null" } satisfies Traversable.null
        case "boolean": return { type: "boolean" } satisfies Traversable.boolean
        case "integer": return { type: "integer" } satisfies Traversable.integer
        case "number": return { type: "number" } satisfies Traversable.number
        case "string": return { type: "string" } satisfies Traversable.string
        case "enum": return { type: "enum", enum: ast.def } satisfies Traversable.enum
        case "const": return { type: "const", const: ast.def } satisfies Traversable.const
        case "array": return { type: "array", items: ast.def } satisfies Traversable.arrayF<_>
        case "allOf": return { type: "allOf", allOf: ast.def } satisfies Traversable.allOfF<_>
        case "anyOf": return { type: "anyOf", anyOf: ast.def } satisfies Traversable.anyOfF<_>
        case "oneOf": return { type: "oneOf", oneOf: ast.def } satisfies Traversable.oneOfF<_>
        case "optional": return { type: "anyOf", anyOf: [ast.def, { type: "enum"}], meta: { optional: true } }
        case "record": return { type: "record", additionalProperties: ast.def } satisfies Traversable.recordF<_>
        case "tuple": return { type: "tuple", items: ast.def } satisfies Traversable.tupleF<_>
        case "object": return {
          type: "object",
          required: Object.values(ast.def).filter((_) => _.meta?.optional !== true).map((_) => _.type),
          properties: ast.def,
        } satisfies Traversable.objectF<_>
      }
    }
}

const toJsonSchema = fold(Recursive.toJsonSchema)
const toTraversable = fold(Recursive.toTraversable)

function toStandardSchema<T extends S, S = _>(schema: { is(src: S): src is T }): StandardSchemaV1<S, T>
function toStandardSchema<T extends S, S = _>(schema: { is(src: S): src is T }): StandardSchemaV1<S, T> {
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
  } satisfies StandardSchemaV1<S, T>
}
