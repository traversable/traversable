import type { key } from "@traversable/data"
import { object as O, map } from "@traversable/data"
import type { Force, Guard, HKT, Join, Partial, Returns, inline, integer } from "@traversable/registry"
import { symbol } from "@traversable/registry"

import { Json } from "@traversable/core/json"
import { anyof$, array$, is, optional$, record$ } from "./predicates.js"

// interface lambda extends HKT { [-1]:  }

/////////////////////
///    aliases    ///
export { 
  null_ as null,
  integer_ as integer,
  const__ as const,
}
///    aliases    ///
/////////////////////

export type infer<T extends { _toType(): unknown }> = Returns<T["_toType"]>
export interface Meta {}
export interface Config {
  _type: unknown
  _tag: string
  _toType(): unknown
  toString(): string
  toJSON(): unknown
  is: unknown
}

//////////////////////
///    internal    ///
/** @internal */
type integer_ = integer
/** @internal */
const Object_keys: <T extends {}>(x: T) => (keyof T)[] = globalThis.Object.keys
/** @internal */
const Object_assign = globalThis.Object.assign
/** @internal */
const _toType = (() => void {} as never)
/** @internal */
const hasOwnProperty = globalThis.Object.prototype.hasOwnProperty
///    internal    ///
//////////////////////

export declare namespace AST {
  interface Node {
    toString(): string,
    toJSON(): unknown,
    _toType(): unknown
    _tag: Tag,
    _type: unknown,
    is(u: unknown): u is unknown
  }
  interface NodeF<T> {
    toString(): string,
    toJSON(): unknown,
    _toType(): unknown
    _tag: Tag,
    _type: T,
    is(u: unknown): u is unknown
  }
}

export namespace AST {
  export const is
    : (u: unknown) => u is AST.Node
    = (u): u is never => object({
      _tag: string(),
      _type: any(),
    }).is(u)
}

export type OptionalKeys<T extends { [x: string]: AST.Node }, K extends keyof T = keyof T> 
  = (K extends K ? T[K]["_tag"] extends Tag.optional ? K : never : never) extends infer K extends keyof T ? K : never
export type Clean<T, _ = [keyof T] extends [never] ? unknown : T> = _
export type ApplyOptionality<
  T extends { [x: string]: AST.Node }, 
  Opt extends keyof T = OptionalKeys<T>, 
  Req extends keyof T = Exclude<keyof T, Opt>
> = Force<
  & Clean<{ [K in Opt]+?: T[K]["_type"] }>
  & Clean<{ [K in Req]-?: T[K]["_type"] }>
>
export function optionalKeys<T extends { [x: string]: AST.Node }>(xs: T): OptionalKeys<T>[] 
export function optionalKeys<T extends { [x: string]: AST.Node }>(xs: T) 
  { return Object_keys(xs).filter((k) => xs[k]._tag === Tag.optional) }
  // { return Object_keys(xs).map((k) => (console.log("k", k, xs[k]), k)).filter((k) => xs[k]._tag === Tag.optional) }

export const toJSON = {
  null: { _tag: "null", /* _type: null */ },
  boolean: { _tag: "boolean", /* _type: void 0 as never as boolean */ },
  integer: { _tag: "integer", /* _type: void 0 as never as integer */ },
  number: { _tag: "number", /* _type: void 0 as never as number */ },
  string: { _tag: "string", /* _type: void 0 as never as string */ },
  any: { _tag: "any", /* _type: void 0 as unknown */ },
} as const satisfies Record<string, { _tag: string, _type?: unknown }> 

/////////////////////
///    tagging    ///
export const Tags = [
  toJSON.null._tag,
  toJSON.boolean._tag,
  toJSON.integer._tag,
  toJSON.number._tag,
  toJSON.string._tag,
  "array",
  "object",
  "optional",
  "const",
  "anyOf",
  "record",
  // "never"
  // "undefined",
  // "bigint",
  // "tuple",
  "any",
] as const satisfies string[]
export const Tag = O.fromKeys(Tags)
export type Tag = typeof Tag[keyof typeof Tag]
export type Tag_null = never | typeof toJSON["null"]["_tag"]
export type Tag_boolean = never | typeof toJSON["boolean"]["_tag"]
export type Tag_number = never | typeof toJSON["number"]["_tag"]
export type Tag_integer = never | typeof toJSON["integer"]["_tag"]
export type Tag_string = never | typeof toJSON["string"]["_tag"]
export type Tag_array = never | array_toJSON["_tag"]
export type Tag_object = never | object_toJSON["_tag"]
export type Tag_optional = never | optional_toJSON["_tag"]
export type Tag_any = never | typeof toJSON["any"]["_tag"]
export type Tag_const = never | const_toJSON["_tag"]
export type Tag_anyOf = never | anyOf_toJSON["_tag"]
export type Tag_record = never | record_toJSON["_tag"]
// typeof toJSON["any"]["_tag"]
///
// type Tag_never = never | never_toJSON["_tag"]
// type Tag_undefined = never | never_toJSON["_undefined"]
// type Tag_bigint = never | bigint_toJSON["_tag"]
// type Tag_tuple = never | tuple_toJSON["_tag"]
// type Tag_record = never | record_toJSON["_tag"]

type Tag_Scalar = Tag_null | Tag_boolean | Tag_integer | Tag_number | Tag_string
type Tag_Atomic = Tag_Scalar | Tag_any
export declare namespace Tag {
  export {
    Tag_null as null,
    Tag_boolean as boolean,
    Tag_integer as integer,
    Tag_number as number,
    Tag_string as string,
    Tag_array as array,
    Tag_object as object,
    Tag_optional as optional,
    Tag_record as record,
    Tag_any as any,
    Tag_anyOf as anyOf,
    /// 
    Tag_Scalar as Scalar,
    Tag_Atomic as Atomic,
    // Tag_never as never,
    // Tag_undefined as undefined,
    // Tag_integer as integer,
    // Tag_bigint as bigint,
    // Tag_const as const,
    // Tag_tuple as tuple,
    // Tag_record as record,
  }
}
///     tagging    ///
//////////////////////

////////////////////
///    toJSON    ///
///    scalars
///    object
export type object_toJSON<T extends { [x: string]: AST.Node } = { [x: string]: AST.Node }> 
  = never | { _tag: "object", _type: { -readonly [K in keyof T]: ReturnType<T[K]["toJSON"]> } }
export function object_toJSON<const T extends { [x: string]: AST.Node }>(_: T): object_toJSON<T>
export function object_toJSON<const T extends { [x: string]: AST.Node }>(_: T)
  { return { _tag: Tag.object, _type: Object.fromEntries(Object.entries(_).map(([k, v]) => [k, v.toJSON()])) } }
///    array
export type array_toJSON<T extends AST.Node = AST.Node> = { _tag: "array", _type: ReturnType<T["toJSON"]> } 
export function array_toJSON<T extends AST.Node>(_: T): array_toJSON<T>
  { return { _tag: Tag.array, _type: _.toJSON() as never } }
///    optional
export type optional_toJSON<T extends AST.Node = AST.Node> = { _tag: "optional", _type: ReturnType<T["toJSON"]> }
export function optional_toJSON<T extends AST.Node>(_: T): optional_toJSON<T>
  { return { _tag: Tag.optional, _type: _.toJSON() as never } }
///    cons
export type const_toJSON<T extends Json | undefined = {}> = never | { _tag: "const", _type: T }
export function const_toJSON<T extends Json>(_: T): const_toJSON<T> { return { _tag: Tag.const, _type: _ } }

export type anyOf_toJSON<T extends readonly AST.Node[] = readonly AST.Node[]> = { _tag: "anyOf", _type: { [K in keyof T]: ReturnType<T[K]["toJSON"]> } }
export function anyOf_toJSON<const T extends readonly AST.Node[]>(_: T): anyOf_toJSON<T> 
export function anyOf_toJSON<const T extends readonly AST.Node[]>(_: T) 
  { { return { _tag: Tag.anyOf, _type: _.map((x) => x.toJSON() ) } } }

export type record_toJSON<T extends AST.Node = AST.Node> = { _tag: "record", _type: ReturnType<T["toJSON"]> }
export function record_toJSON<const T extends AST.Node>(_: T): record_toJSON<T> 
export function record_toJSON<const T extends AST.Node>(_: T) { { return { _tag: Tag.record, _type: _.toJSON() } } }

// export type never_toJSON = never | { _tag: "never", _type: never }
// export const never_toJSON = { _tag: Tag.never, _type: void 0 as never }
// export type undefined_toJSON = never | { _tag: "undefined", _type: undefined }
// export const undefined_toJSON = { _tag: Tag.undefined, _type: undefined }
// export type bigint_toJSON = never | { _tag: "bigint", _type: bigint }
// export const bigint_toJSON = { _tag: Tag.bigint, _type: bigint }
// export type tuple_toJSON = never | { _tag: "tuple", _type: tuple }
// export const tuple_toJSON = { _tag: Tag.tuple, _type: tuple }
// export type record_toJSON = never | { _tag: "record", _type: record }
// export const record_toJSON = { _tag: Tag.record, _type: record }
///    toJSON    ///
////////////////////

////////////////////
///    guards    ///

export const object_is = <T extends { [x: string]: AST.Node }>(xs: T) => (u: unknown): u is object_is<T> => is.object(u) && validateShape(xs, u)
export const object_isEOPT = <T extends { [x: string]: AST.Node }>(xs: T) => (u: unknown): u is object_is<T> => is.object(u) && validateShapeEOPT(xs, u)
export type object_is<T extends { [x: string]: AST.Node }> = { [K in keyof T]: never | ReturnType<T[K]["_toType"]> }
///    guards    ///
////////////////////

//////////////////////
///    toString    ///
///    scalars
export const toString = {
  null: toJSON.null._tag,
  boolean: toJSON.boolean._tag,
  integer: toJSON.integer._tag,
  number: toJSON.number._tag,
  string: toJSON.string._tag,
  any: toJSON.any._tag,
} as const
///    array
export type array_toString<T extends AST.Node> = never | `(${ReturnType<T["toString"]>})[]`
///    object
export type object_toString = never | `{ ${string} }`
export function object_toString<T extends { [x: string]: AST.Node }>(x: T): object_toString
export function object_toString<T extends { [x: string]: AST.Node }>(x: T) { 
  const entries = Object.entries(x)
  return entries.length === 0 ? "{}" : "{ " + Object.entries(x).map(([k, v]) => ['"' + k + '"', v.toString()].join(": ")).join(", ") + " }" 
}
///    optional
export type optional_toString<T extends AST.Node> = never | `undefined | ${ReturnType<T["toString"]>}`
export function optional_toString<T extends AST.Node>(x: T): optional_toString<T> 
  { return x.toString() + " | undefined" as never }
export const const_toString = JSON.stringify
export type anyOf_toString<T extends readonly AST.Node[]> = Join<{ [K in keyof T]: ReturnType<T[K]["toString"]> }, " | ">
export function anyOf_toString<T extends readonly AST.Node[]>(xs: T): anyOf_toString<T>
export function anyOf_toString<T extends readonly AST.Node[]>(xs: T) { return xs.map((x) => x.toString()).join(" | ") }
export type record_toString<T extends AST.Node> = `Record<string, ${ReturnType<T["toString"]>}>`
export function record_toString<T extends AST.Node>(_: T): record_toString<T> 
export function record_toString<T extends AST.Node>(_: T) { return "Record<" + _.toString() + ">" }
///    toString    ///
//////////////////////

//////////////////
///    base    ///
export class type<T extends t.Config> {
  _tag: T["_tag"]
  _type!: T["_type"]
  is: T["is"]
  toJSON():  ReturnType<T["toJSON"]>
  toJSON(): ReturnType<t.Config["toJSON"]>
  toJSON(): ReturnType<T["toJSON"]>
  toJSON() { return this.config.toJSON() }
  toString(): ReturnType<T["toString"]>
  toString(): ReturnType<t.Config["toString"]>
  toString(): ReturnType<T["toString"]>
  toString() { return this.config.toString() }
  _toType(): ReturnType<T["_toType"]>
  _toType(): ReturnType<t.Config["_toType"]>
  _toType(): ReturnType<T["_toType"]>
  _toType() { return this._type }
  constructor(public config: T) {
    Object_assign(this, config)
    this.toJSON = config.toJSON as never
    this._tag = config._tag
    this.is = config.is
  }
}
///    base    ///
//////////////////

/////////////////////
///    scalars    ///
export interface leaf<Tag extends Tag.Atomic, T> {
  _tag: Tag
  _type: T
  _toType(): this["_type"]
  toJSON(): typeof toJSON[Tag]
  toString(): typeof toString[Tag]
  is: Guard<this["_type"]>
}
export function leaf<Tag extends Tag.Atomic, T>(tag: Tag, type?: T): leaf<Tag, T>
export function leaf<Tag extends Tag.Atomic, T>(_tag: Tag, _type?: T) {
  return {
    _tag,
    toJSON() { return toJSON[_tag] },
    toString() { return toString[_tag] },
    is: is[_tag],
    ...(Math.random() > 1 && { _type: void 0 }) as { _type: never },
    _toType,
  }
}
///    scalars    ///
/////////////////////

///////////////////
///    const    ///
export interface const_<T extends Json | undefined> {
  _tag: "const"
  _type: T
  _toType(): this["_type"],
  is: Guard<this["_type"]>
  toJSON(): { _tag: "const", _type: T }
  toString(): string
}
///
export const const_ = <T extends Json>(x: T): const_<T> => ({
  _toType,
  _tag: Tag.const,
  _type: x as typeof x,
  is: is.literally(x) as never,
  toJSON() { return { _tag: Tag.const, _type: x } },
  toString() { return const_toString(x) },
} as const) satisfies t.Config
///    array    ///
///////////////////

///////////////////
///    array    ///
export interface array_<T extends AST.Node> {
  _tag: "array"
  _type: readonly T["_type"][]
  _toType(): this["_type"],
  is: Guard<this["_type"]>
  toJSON(): { _tag: "array", _type: ReturnType<T["toJSON"]> }
  toString(): array_toString<T>
}
///
export const array_ = <T extends AST.Node>(x: T): array_<T> => ({
  _toType,
  _tag: Tag.array,
  _type: [],
  is: array$(x.is) as never,
  toJSON() { return array_toJSON(x) },
  toString() { return "(" + x["toString"]() + ")" + "[]" as never },
} as const) satisfies t.Config
///    array    ///
///////////////////

////////////////////
///    record    ///
export interface record_<T extends AST.Node> {
  _tag: "record"
  _type: Record<string, T["_type"]>
  _toType(): this["_type"],
  is: Guard<this["_type"]>
  toJSON(): { _tag: "record", _type: ReturnType<T["toJSON"]> }
  toString(): `Record<string, ${ReturnType<T["toString"]>}>`
  // array_toString<T>
}
///
export const record_ = <T extends AST.Node>(x: T): record_<T> => ({
  _toType,
  _tag: "record",
  _type: void 0 as never,
  is: record$(x.is),
  toJSON() { return record_toJSON(x) },
  toString() { return record_toString(x) },
})
///    record    ///
////////////////////

//////////////////////
///    optional    ///
export interface optional_<T extends AST.Node> {
  _tag: Tag.optional
  _type: undefined | ReturnType<T["_toType"]>
  _toType(): this["_type"],
  is: Guard<this["_type"]>
  toJSON(): { _tag: "optional", _type: ReturnType<T["toJSON"]> }
  toString(): optional_toString<T>
  meta: optional.Meta
}
///
export const optional_ = <T extends AST.Node>(x: T): optional_<T> => ({
  _tag: Tag.optional,
  _type: undefined,
  _toType,
  is: optional$(x.is) as Guard<ReturnType<T["_toType"]>>,
  toJSON() { return optional_toJSON(x) },
  toString() { return optional_toString(x) },
  meta: optional.meta,
} as const) satisfies t.Config & optional.Options
///    optional    ///
//////////////////////

////////////////////
///    object    ///

export interface object_<T extends { [x: string]: AST.Node }> {
  _tag: "object"
  _type: ApplyOptionality<T>
  _toType(): this["_type"]
  toString(): object_toString
  toJSON(): object_toJSON<T>
  is: Guard<{ [K in keyof T]: never | ReturnType<T[K]["_toType"]> }>
  meta: { optionalKeys: readonly OptionalKeys<T>[] },
}

export const objectDefault = <const T extends { [x: string]: AST.Node }>(xs: T): object_<T> => ({
  _toType,
  _tag: Tag.object,
  _type: {} as never,
  is: object_is(xs),
  toString: () => object_toString(xs),
  toJSON: () => object_toJSON(xs),
  meta: { optionalKeys: optionalKeys(xs) }
} as const) satisfies t.Config & { meta: object.Meta }

export const objectEOPT = <const T extends { [x: string]: AST.Node }>(xs: T): object_<T> => ({
  _toType,
  _tag: Tag.object,
  _type: {} as never,
  is: object_isEOPT(xs),
  toString: () => object_toString(xs),
  toJSON: () => object_toJSON(xs),
  meta: { optionalKeys: optionalKeys(xs) }
} as const) satisfies t.Config & { meta: object.Meta }
///    object    ///
////////////////////

///////////////////
///    anyOf    ///
export interface anyOf_<T extends readonly AST.Node[]> {
  _tag: "anyOf"
  _type: ReturnType<T[number]["_toType"]>
  _toType(): this["_type"]
  is: Guard<this["_type"]>
  toString(): anyOf_toString<T>
  toJSON(): { _tag: "anyOf", _type: { [K in keyof T]: ReturnType<T[K]["toJSON"]> } }
}

export const anyOf_ = <T extends readonly AST.Node[]>(xs: T): anyOf_<T> => ({
  _toType,
  _tag: Tag.anyOf,
  _type: {} as never,
  is: anyof$(...xs.map((x) => x.is)) as never,
  toString: () => anyOf_toString(xs),
  toJSON: () => anyOf_toJSON(xs),
}) as const satisfies t.Config

///    anyOf    ///
///////////////////

////////////////////
///    null     ///
export class null$
  extends type<leaf<Tag.null, null>>
  { constructor(_opts?: null_.Options) { super(leaf(toJSON.null._tag, /** toJSON.null._type */)) } }
////////////////////
///    const     ///
export class
  const$<T extends Json>
  extends type<const_<T>>
  { constructor(_: T, _opts?: const__.Options) { super(const_(_)) } }

export declare namespace t {
  export { 
    null$ as null, 
    const$ as const,
    Meta,
    Config,
  }
}

export namespace t {
  void (t.null = null$)
  void (t.const = const$)
  /////////////////
  ///    any    ///
  export class 
    /** @ts-ignore */
    any extends type<leaf<Tag.any, unknown>> { constructor(_opts?: any.Options) { super(leaf(toJSON.any._tag, toJSON.any._type))}}
  /////////////////////
  ///    boolean    ///
  export class
    /** @ts-ignore */
    boolean
    extends type<leaf<Tag.boolean, boolean>>
    { constructor(_opts?: boolean.Options) { super(leaf(toJSON.boolean._tag /*, toJSON.boolean._type */)) } }

  ////////////////////
  ///    integer    ///
  export class
    /** @ts-ignore */
    integer
    extends type<leaf<Tag.integer, integer_>>
    { constructor(_opts?: integer_.Options) { super(leaf(toJSON.integer._tag, /* toJSON.integer._type */)) } }

  ////////////////////
  ///    number    ///
  export class
    /** @ts-ignore */
    number
    extends type<leaf<Tag.number, number>>
    { constructor(_opts?: number.Options) { super(leaf(toJSON.number._tag, /* toJSON.number._type) */)) } }

  ////////////////////
  ///    string    ///
  export class
    /** @ts-ignore */
    string
    extends type<leaf<Tag.string, string>>
    { constructor(_opts?: string.Options) { super(leaf(toJSON.string._tag, void 0 as never as string)) } }

  ////////////////////
  ///    object    ///
  export class
    /** @ts-ignore */
    object
    <const S extends { [x: string]: AST.Node } = {}> extends type<object_<S>> { 
      constructor(public _: S, opts?: object.Options) { 
        const proto = opts?.exactOptionalPropertyTypes ? objectEOPT(_) : objectDefault(_)
        super(proto) 
        this.optionalKeys = optionalKeys(_)
      } 
      optionalKeys: OptionalKeys<S>[]
      // map<T>(f: (s: AST.Node) => T): { [x: string]: T } 
      //   { return Object.fromEntries(Object.entries(this._).map(([k, v]) => [k, f(v)])) }
    }

  ///////////////////
  ///    array    ///
  export class array<T extends AST.Node> extends type<array_<T>>
    { constructor(public _: T, _opts?: array.Options) { super(array_(_)) } }

  //////////////////////
  ///    optional    ///
  export class optional<T extends AST.Node> extends type<optional_<T>> { 
    meta: optional.Meta
    constructor(public _: T, _opts?: optional.Options) { 
      super(optional_(_)) 
      this.meta = { [symbol.optional]: true }
    } 
  }

  ///////////////////
  ///    anyOf    ///
  export class anyOf<const T extends readonly AST.Node[]> extends type<anyOf_<T>> 
    { constructor(public _: T, _opts?: anyOf.Options) { super(anyOf_(_)) } }

  ////////////////////
  ///    record    ///
  export class record<const T extends AST.Node> extends type<record_<T>> 
    { constructor(public _: T, _opts?: record.Options) { super(record_(_)) } }
}

/////////////////
///    any    ///
export function any(): t.any { return new t.any() } 
export declare namespace any { type Meta = t.Meta; type Options<Meta extends any.Meta = {}> = { meta: Meta } }
///    any    ///
/////////////////

//////////////////
///    null    ///
export function null_(): t.null
export function null_<Meta extends null_.Meta>(opts: null_.Options<Meta>): t.null
export function null_<Meta extends null_.Meta>(opts?: null_.Options<Meta>): t.null
export function null_($?: null_.Options): t.null
  { return new t.null($) }
///
export declare namespace null_ {
  type Meta = t.Meta
  type Options<Meta extends null_.Meta = {}> = {
    meta: Meta
  }
}
///    null    ///
//////////////////

///////////////////
///    const    ///
export function const__<T extends Json>(type: T): t.const<T>
export function const__<T extends Json>(type: T, opts: const__.Options): t.const<T>
export function const__<T extends Json>(type: T, opts?: const__.Options): t.const<T>
export function const__(_: Json, $: const__.Options = const__.defaults): t.const<Json>
  { return new t.const(_, $) }
///
export declare namespace const__ {
  type Meta = t.Meta
  type Options<Meta extends const__.Meta = {}> = Partial<{
    meta: Meta
  }>
}
export namespace const__ {
  export const meta = {} satisfies Required<const__.Meta>
  export const defaults = { meta } satisfies Required<Options>
}
///    const    ///
///////////////////


/////////////////////
///    boolean    ///
export function boolean(): t.boolean
export function boolean<Meta extends boolean.Meta>(opts: boolean.Options<Meta>): t.boolean
export function boolean<Meta extends boolean.Meta>(opts?: boolean.Options<Meta>): t.boolean
export function boolean($?: boolean.Options): t.boolean
  { return new t.boolean($) }
///
export declare namespace boolean {
  type Meta = t.Meta
  type Options<Meta extends boolean.Meta = {}> = {
    meta: Meta
  }
}
///    boolean    ///
/////////////////////

////////////////////
///    string    ///
export function string(): t.string
export function string<Meta extends string.Meta>(opts: string.Options<Meta>): t.string
export function string<Meta extends string.Meta>(opts?: string.Options<Meta>): t.string
export function string($?: string.Options): t.string
  { return new t.string($) }
///
export declare namespace string {
  type Meta = t.Meta
  type Options<Meta extends string.Meta = {}> = {
    meta: Meta
  }
}
///    string    ///
////////////////////

////////////////////
///    number    ///
export function number(): t.number
export function number<Meta extends number.Meta>(opts: number.Options<Meta>): t.number
export function number<Meta extends number.Meta>(opts?: number.Options<Meta>): t.number
export function number($?: number.Options): t.number
  { return new t.number($) }
///
export declare namespace number {
  type Meta = t.Meta
  type Options<Meta extends number.Meta = {}> = {
    meta: Meta
  }
}
///    number    ///
////////////////////

/////////////////////
///    integer    ///
function integer_(): t.integer
function integer_<Meta extends integer_.Meta>(opts: integer_.Options<Meta>): t.integer
function integer_<Meta extends integer_.Meta>(opts?: integer_.Options<Meta>): t.integer
function integer_($?: integer_.Options): t.integer
  { return new t.integer($) }
///
declare namespace integer_ {
  type Meta = t.Meta
  type Options<Meta extends integer_.Meta = {}> = {
    meta: Meta
  }
}
///    number    ///
////////////////////

////////////////////
///    object    ///
export function object<T extends { [x: string]: AST.Node }>(types: T): t.object<T>
export function object<T extends { [x: string]: AST.Node }, M extends object.Meta>(types: T, opts: object.Options<M>): t.object<T>
export function object<T extends { [x: string]: AST.Node }, M extends object.Meta>(types: T, opts?: object.Options<M>): t.object<T>
export function object(
  xs: Record<string, AST.Node>, $: object.Options = object.defaults): t.object<{}> {
  return new t.object(xs, $) 
}
///
export declare namespace object {
  interface Meta extends t.Meta { optionalKeys: readonly (keyof any)[] }
  type Options<Meta extends object.Meta = object.Meta> = Partial<{
    meta: Meta
    exactOptionalPropertyTypes: boolean
  }>
}
export namespace object {
  export const meta: Required<object.Meta> = {
    optionalKeys: []
  } satisfies Required<object.Meta>
  export const defaults = { 
    meta,
    exactOptionalPropertyTypes: true,
  } satisfies Required<object.Options>
}
///    object    ///
////////////////////

export const hasOptions = <T extends readonly AST.Node[]>(u: anyOf.arguments<T>): u is [...types: [...T]] => u.every(AST.is)
export function separateArguments<T extends readonly AST.Node[]>(args: anyOf.arguments<T>): [types: T, opts: anyOf.Options]
export function separateArguments<T extends readonly AST.Node[]>(args: anyOf.arguments<T>) {
  return hasOptions(args) ? [args.slice(1), args[args.length - 1]] : [args, {} satisfies anyOf.Options]
}


///////////////////
///    anyOf    ///
export function anyOf<T extends readonly AST.Node[]>(...types: [...T]): t.anyOf<T> 
export function anyOf<T extends readonly AST.Node[]>(...args: [...T, opts: anyOf.Options]): t.anyOf<T> 
export function anyOf<T extends readonly AST.Node[]>(...args: [...T, opts?: anyOf.Options]): t.anyOf<T> 
export function anyOf<T extends readonly AST.Node[]>(...args: anyOf.arguments<T>): t.anyOf<T> { 
  const [xs, $] = separateArguments(args)
  return new t.anyOf(xs, $) 
}

anyOf(string(), number()).is

///
export declare namespace anyOf {
  type Meta = t.Meta
  type Options<Meta extends anyOf.Meta = {}> = Partial<{ meta: Meta }>
  type arguments<T extends readonly AST.Node[] = readonly AST.Node[]> = never
    | [...types: T]
    | [...types: T, opts?: anyOf.Options]
    ;
}
export namespace anyOf {
}
///    anyOf    ///
///////////////////

///////////////////
///    array    ///
export function array<T extends AST.Node>(type: T): t.array<T>
export function array<T extends AST.Node>(type: T, opts: array.Options): t.array<T>
export function array<T extends AST.Node>(type: T, opts?: array.Options): t.array<T>
export function array(_: AST.Node, $: array.Options = array.defaults): t.array<AST.Node>
  { return new t.array(_, $) }
///
export declare namespace array {
  type Meta = t.Meta
  type Options<Meta extends array.Meta = {}> = {
    readonly?: boolean
    meta: Meta
  }
}
export namespace array {
  export const meta = {} satisfies array.Meta
  export const defaults = {
    meta,
    readonly: false,
  } satisfies Required<array.Options>
}
///    array    ///
///////////////////

////////////////////
///    record    ///
export function record<T extends AST.Node>(type: T): t.record<T>
export function record<T extends AST.Node>(type: T, opts: record.Options): t.record<T>
export function record<T extends AST.Node>(type: T, opts?: record.Options): t.record<T>
export function record(_: AST.Node, $: record.Options = array.defaults): t.record<AST.Node>
  { return new t.record(_, $) }
///
export declare namespace record {
  type Meta = t.Meta
  type Options<Meta extends array.Meta = {}> = {
    readonly?: boolean
    meta: Meta
  }
}
///    record    ///
////////////////////

//////////////////////
///    optional    ///
export function optional<T extends AST.Node>(type: T): t.optional<T>
export function optional<T extends AST.Node>(type: T, opts: optional.Options): t.optional<T>
export function optional<T extends AST.Node>(type: T, opts?: optional.Options): t.optional<T>
export function optional(_: AST.Node, $?: optional.Options): t.optional<AST.Node>
  { return new t.optional(_, $) }

export declare namespace optional {
  interface Meta extends t.Meta, inline<{ [symbol.optional]: true }> {}
  type Options<Meta extends optional.Meta = { [symbol.optional]: true }> = {
    meta: Meta
  }
}
export namespace optional {
  export const meta = { 
    [symbol.optional]: true 
  } satisfies optional.Meta
  export const defaults = { 
    meta 
  } satisfies optional.Options
}
///    optional    ///
//////////////////////

////////////////////////
///    validation    ///
export function isOptional<T extends AST.Node>(u: unknown): u is optional_<T> { 
  return !!(u as any)?.meta?.[symbol.optional] 
}
export function isOptionalNotUndefined<T extends AST.Node>(u: unknown): u is optional_<T> { 
  return isOptional(u) && u.is(undefined) === false 
}
export function isComposite<T>(u: unknown): u is { [x: string]: T } { 
  return u !== null && typeof u === "object" 
}

function hasOwn<K extends key.any>(u: unknown, key: K): u is { [P in K]: unknown }
function hasOwn(u: unknown, key: key.any): u is { [x: string]: unknown } {
  return typeof key === "symbol" 
    ? isComposite(u) && key in u 
    : hasOwnProperty.call(u, key)
}

function validateShape<T extends { [x: string]: AST.Node }>(xs: T, u: { [x: string]: unknown }) {
  const s = map(xs, (x) => x.is)
  for (const k in s) {
    const check = s[k]
    switch (true) {
      case isOptional(s[k]) && !hasOwn(u, k): continue
      case isOptional(s[k]) && hasOwn(u, k) && u[k] === undefined: continue
      case isOptional(s[k]) && hasOwn(u, k) && check(u[k]): continue
      case isOptional(s[k]) && hasOwn(u, k) && !check(u[k]): return false
      case hasOwn(u, k) && check(u[k]) === true: continue
      default: throw globalThis.Error("in 'validateShape': illegal state")
    }
  }
  return true
}

function validateShapeEOPT<T extends { [x: string]: AST.Node }>(xs: T, u: { [x: string]: unknown }) {
  const s = map(xs, (x) => x.is)
  for (const k in s) {
    const check = s[k]
    switch (true) {
      case isOptionalNotUndefined(check) && hasOwn(u, k) && u[k] === undefined: return false
      case isOptional(check) && !hasOwn(u, k): continue // u[k] === undefined: continue
      case !check(u[k]): return false
      default: continue
    }
  }
  return true
}

///    validation    ///
////////////////////////

const abc = object({ 
  a: object({ 
    b: object({ 
      c: optional(integer_()),
      d: string(),
      e: array(array(boolean()))
    })
  })
}).toJSON()


// interface property<T extends {}> extends newtype<T> {}
// interface optionalProperty<T extends {}> extends inline<{ [symbol.optional]: true }>, newtype<T> {}
