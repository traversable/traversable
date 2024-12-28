import { key, map, object as O } from "@traversable/data"
import type { Force, inline, newtype, Partial } from "@traversable/registry"
import { symbol } from "@traversable/registry"

import * as G from "../guard.js"
import type { Json } from "../json.js"

/////////////////////
///    aliases    ///
export { 
  null_ as null,
}
///    aliases    ///
/////////////////////

export type Guard<T> = never | ((u: unknown) => u is T)

export interface Meta {}
export interface Config {
  _type: unknown
  _tag: string
  _toType(): unknown
  toString(): string
  toJSON(): Json
  is: unknown
}

//////////////////////
///    internal    ///
/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_keys 
  : <T extends {}>(x: T) => (keyof T)[]
  = globalThis.Object.keys
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const Object_assign = globalThis.Object.assign
/** @internal */
const _toType = (() => void {} as never)
/** @internal */
const hasOwnProperty = globalThis.Object.prototype.hasOwnProperty
///    internal    ///
//////////////////////

export declare namespace AST {
  type Node = {
    toString(): string,
    toJSON(): Json,
    _toType(): unknown
    _tag: Tag,
    _type: unknown,
    is(u: unknown): u is unknown
  }
}

export const toJSON = {
  null: { _tag: "null", _type: null },
  boolean: { _tag: "boolean", _type: false as boolean },
  number: { _tag: "number", _type: 0 as number },
  string: { _tag: "string", _type: "" as string },
} as const

/////////////////////
///    tagging    ///
export const Tags = [
  toJSON.null._tag,
  toJSON.boolean._tag,
  toJSON.number._tag,
  toJSON.string._tag,
  "array",
  "object",
  "optional",
  // "never"
  // "undefined",
  // "integer",
  // "bigint",
  // "const",
  // "tuple",
  // "record",
  // "any",
] as const satisfies string[]
export const Tag = O.fromKeys(Tags)
export type Tag = typeof Tag[keyof typeof Tag]
export type Tag_null = never | typeof toJSON["null"]["_tag"]
export type Tag_boolean = never | typeof toJSON["boolean"]["_tag"]
export type Tag_number = never | typeof toJSON["number"]["_tag"]
export type Tag_string = never | typeof toJSON["string"]["_tag"]
export type Tag_array = never | array_toJSON["_tag"]
export type Tag_object = never | object_toJSON["_tag"]
export type Tag_optional = never | optional_toJSON["_tag"]
///
  // type Tag_never = never | never_toJSON["_tag"]
  // type Tag_undefined = never | never_toJSON["_undefined"]
  // type Tag_integer = never | integer_toJSON["_tag"]
  // type Tag_bigint = never | bigint_toJSON["_tag"]
  // type Tag_const = never | const_toJSON["_tag"]
  // type Tag_tuple = never | tuple_toJSON["_tag"]
  // type Tag_record = never | record_toJSON["_tag"]
  // type Tag_any = never | any_toJSON["_tag"]
type Tag_Scalar = Tag_null | Tag_boolean | Tag_number | Tag_string
export declare namespace Tag {
  export {
    Tag_null as null,
    Tag_boolean as boolean,
    Tag_number as number,
    Tag_string as string,
    Tag_array as array,
    Tag_object as object,
    Tag_optional as optional,
    Tag_Scalar as Scalar,
      // Tag_never as never,
      // Tag_undefined as undefined,
      // Tag_integer as integer,
      // Tag_bigint as bigint,
      // Tag_const as const,
      // Tag_tuple as tuple,
      // Tag_record as record,
      // Tag_any as any,
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
  // export type never_toJSON = never | { _tag: "never", _type: never }
  // export const never_toJSON = { _tag: Tag.never, _type: void 0 as never }
  // export type undefined_toJSON = never | { _tag: "undefined", _type: undefined }
  // export const undefined_toJSON = { _tag: Tag.undefined, _type: undefined }
  // export type integer_toJSON = never | { _tag: "integer", _type: integer }
  // export const integer_toJSON = { _tag: Tag.integer, _type: integer }
  // export type bigint_toJSON = never | { _tag: "bigint", _type: bigint }
  // export const bigint_toJSON = { _tag: Tag.bigint, _type: bigint }
  // export type const_toJSON = never | { _tag: "const", _type: const }
  // export const const_toJSON = { _tag: Tag.const, _type: const }
  // export type tuple_toJSON = never | { _tag: "tuple", _type: tuple }
  // export const tuple_toJSON = { _tag: Tag.tuple, _type: tuple }
  // export type record_toJSON = never | { _tag: "record", _type: record }
  // export const record_toJSON = { _tag: Tag.record, _type: record }
  // export type any_toJSON = never | { _tag: "any", _type: any }
  // export const any_toJSON = { _tag: Tag.undefined, _type: any }
///    toJSON    ///
////////////////////

////////////////////
///    guards    ///
export const object_is = <T extends { [x: string]: AST.Node }>(xs: T) => (u: unknown): u is object_is<T> => G.any.object(u) && validateShape(xs, u)
export const object_isEOPT = <T extends { [x: string]: AST.Node }>(xs: T) => (u: unknown): u is object_is<T> => G.any.object(u) && validateShapeEOPT(xs, u)
export type object_is<T extends { [x: string]: AST.Node }> = T
///    guards    ///
////////////////////

//////////////////////
///    toString    ///
///    scalars
export const toString = {
  null: toJSON.null._tag,
  boolean: toJSON.boolean._tag,
  number: toJSON.number._tag,
  string: toJSON.string._tag,
} as const
///    array
export type array_toString<T extends AST.Node> = never | `${ReturnType<T["toString"]>}[]`
///    object
export type object_toString = never | `{ ${string} }`
export function object_toString<T extends { [x: string]: AST.Node }>(x: T): object_toString
export function object_toString<T extends { [x: string]: AST.Node }>(x: T) 
  { return "{ " + Object.entries(x ?? {}).map(([k, v]) => [k, v.toString()]) .join("; ") + " }" }
///    optional
export type optional_toString<T extends AST.Node> = never | `undefined | ${ReturnType<T["toString"]>}`
export function optional_toString<T extends AST.Node>(x: T): optional_toString<T> 
  { return "undefined " + x.toString() as never }
///    toString    ///
//////////////////////

interface Returns<T extends (..._: never) => {}> extends newtype<globalThis.ReturnType<T>> {}

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
    this._tag = config._tag
    this.is = config.is
  }
}
///    base    ///
//////////////////

/////////////////////
///    scalars    ///
export interface leaf<Tag extends Tag.Scalar, T> {
  _tag: Tag
  _type: T
  _toType(): this["_type"]
  toJSON(): typeof toJSON[Tag]
  toString(): typeof toString[Tag]
  is: Guard<this["_type"]>
}
export function leaf<Tag extends Tag.Scalar, T>(tag: Tag, type: T): leaf<Tag, T>
export function leaf<Tag extends Tag.Scalar, T>(_tag: Tag, _type: T) {
  return {
    _tag,
    _type,
    _toType,
    toJSON() { return toJSON[_tag] },
    toString() { return toString[_tag] },
    is: G[_tag],
  }
}
///    scalars    ///
/////////////////////

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
  is: G.array(x.is) as never,
  toJSON() { return array_toJSON(x) },
  toString() { return x["toString"]() + "[]" as never },
} as const) satisfies t.Config
///    array    ///
///////////////////

//////////////////////
///    optional    ///
export interface optional_<T extends AST.Node> {
  _tag: Tag.optional
  _type: undefined | T["_type"]
  _toType(): this["_type"],
  is: Guard<this["_type"]>
  toJSON(): { _tag: "optional", _type: ReturnType<T["toJSON"]> }
  toString(): optional_toString<T>
  meta: optional.Meta
}

// function optional_<T>(guard: (u: unknown) => u is T): optional_<T> 
// function optional_<T>(predicate: (u: T) => boolean): optional_<T> 
// function optional_(predicate: (u: unknown) => boolean) {
//   function optional(src: unknown): src is never { return predicate(src) }
//   return globalThis.Object.assign(
//     optional, 
//     optional_.proto
//   ) 
// }

///
export const optional_ = <T extends AST.Node>(x: T): optional_<T> => ({
  _tag: Tag.optional,
  _type: undefined,
  _toType,
  is: G.optional(x.is),
  toJSON() { return optional_toJSON(x) },
  toString() { return optional_toString(x) },
  meta: optional.meta,
} as const) satisfies t.Config & optional.Options
///    optional    ///
//////////////////////

////////////////////
///    object    ///
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

export interface object_<T extends { [x: string]: AST.Node }> {
  _tag: "object"
  _type: ApplyOptionality<T>
  _toType(): this["_type"]
  toString(): object_toString
  toJSON(): object_toJSON<T>
  is: Guard<object_is<T>>
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

export class null$
  extends type<leaf<Tag.null, null>>
  { constructor(_opts?: null_.Options) { super(leaf(Tag.null, null)) } }

export declare namespace t {
  export { null$ as null, Meta, Config }
}

export namespace t {
  void (t.null = null$)
  /////////////////////
  ///    boolean    ///
  export class
    /** @ts-ignore */
    boolean
    extends type<leaf<Tag.boolean, boolean>>
    { constructor(_opts?: boolean.Options) { super(leaf(Tag.boolean, false as boolean)) } }

  ////////////////////
  ///    number    ///
  export class
    /** @ts-ignore */
    number
    extends type<leaf<Tag.number, number>>
    { constructor(_opts?: number.Options) { super(leaf(Tag.number, 0 as number)) } }

  ////////////////////
  ///    string    ///
  export class
    /** @ts-ignore */
    string
    extends type<leaf<Tag.string, string>>
    { constructor(_opts?: string.Options) { super(leaf(Tag.string, "" as string)) } }

  ////////////////////
  ///    object    ///
  export class
    /** @ts-ignore */
    object
    <const T extends { [x: string]: AST.Node } = {}> extends type<object_<T>> { 
      constructor(public _: T, opts?: object.Options) { 
        const proto = opts?.exactOptionalPropertyTypes ? objectEOPT(_) : objectDefault(_)
        super(proto) 
        this.optionalKeys = optionalKeys(_)
      } 
      optionalKeys: OptionalKeys<T>[]
    }

  ///////////////////
  ///    array    ///
  export class array<T extends AST.Node> extends type<array_<T>>
    { constructor(_: T, _opts?: array.Options) { super(array_(_)) } }

  //////////////////////
  ///    optional    ///
  export class optional<T extends AST.Node> extends type<optional_<T>> { 
    meta: optional.Meta
    constructor(_: T, _opts?: optional.Options) { 
      super(optional_(_)) 
      this.meta = { [symbol.optional]: true }
    } 
  }
}

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
    exactOptionalPropertyTypes: true 
  } satisfies Required<object.Options>
}
///    object    ///
////////////////////

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

// const abc = object({ 
//   a: object({ 
//     b: object({ 
//       c: optional(number()),
//       d: string(),
//       e: array(array(boolean()))
//     })
//   })
// })


// interface property<T extends {}> extends newtype<T> {}
// interface optionalProperty<T extends {}> extends inline<{ [symbol.optional]: true }>, newtype<T> {}
