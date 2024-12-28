import type { inline } from "@traversable/registry"
import { symbol } from "@traversable/registry"
import type { AST, Config, Meta, OptionalKeys } from "./ast.js"
import { 
  array_, 
  object_, 
  objectEOPT,
  objectDefault,
  optional_,
  optionalKeys,
  leaf, 
  Tag ,
} from "./ast.js"

/** @internal */
const Object_assign = globalThis.Object.assign

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

//////////////////
///    null    ///
export { null_ as null }
function null_(): t.null
function null_<Meta extends null_.Meta>(opts: null_.Options<Meta>): t.null
function null_<Meta extends null_.Meta>(opts?: null_.Options<Meta>): t.null
function null_($?: null_.Options): t.null
  { return new t.null($) }
///
declare namespace null_ {
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
export function array(_: AST.Node, $?: array.Options): t.array<AST.Node>
  { return new t.array(_, $) }
///
export declare namespace array {
  type Meta = t.Meta
  type Options<Meta extends array.Meta = {}> = {
    meta: Meta
  }
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


export class t_boolean extends type<leaf<Tag.boolean, boolean>> { 
  constructor(_opts?: boolean.Options) { super(leaf(Tag.boolean, false as boolean)) } 
}

export class t_number extends type<leaf<Tag.number, number>> { 
  constructor(_opts?: number.Options) { super(leaf(Tag.number, 0 as number)) } 
}

export class t_string extends type<leaf<Tag.string, string>> { 
  constructor(_opts?: string.Options) { super(leaf(Tag.string, "" as string)) } 
}

export class t_null extends type<leaf<Tag.null, null>> { 
  constructor(_opts?: null_.Options) { super(leaf(Tag.null, null)) } 
}

export class t_object <const T extends { [x: string]: AST.Node }> extends type<object_<T>> { 
  constructor(public _: T, opts?: object.Options) { 
    const proto = opts?.exactOptionalPropertyTypes ? objectEOPT(_) : objectDefault(_)
    super(proto) 
    this.optionalKeys = optionalKeys(_)
  } 
  optionalKeys: OptionalKeys<T>[]
}

export class t_array<T extends AST.Node> extends type<array_<T>> { 
  constructor(_: T, _opts?: array.Options) { super(array_(_)) } 
}

//////////////////////
///    optional    ///
export class t_optional<T extends AST.Node> extends type<optional_<T>> { 
  meta: optional.Meta
  constructor(_: T, _opts?: optional.Options) { 
    super(optional_(_)) 
    this.meta = { [symbol.optional]: true }
  } 
}

export declare namespace t {
  export type { Meta, Config }
  export { 
    t_null as null, 
    t_boolean as boolean,
    t_number as number,
    t_string as string,
    t_array as array,
    t_object as object,
    t_optional as optional,
  }
}
export namespace t {
  void (t.null = t_null)
  void (t.boolean = t_boolean)
  void (t.number = t_number)
  void (t.string = t_string)
  void (t.array = t_array)
  void (t.object = t_object)
  void (t.optional = t_optional)
}


  /////////////////////
  ///    boolean    ///
  // export class
  //   /** @ts-ignore */
  //   boolean
  //   extends type<leaf<Tag.boolean, boolean>>
  //   { constructor(_opts?: boolean.Options) { super(leaf(Tag.boolean, false as boolean)) } }

  // ////////////////////
  // ///    number    ///
  // export class
  //   /** @ts-ignore */
  //   number
  //   extends type<leaf<Tag.number, number>>
  //   { constructor(_opts?: number.Options) { super(leaf(Tag.number, 0 as number)) } }

  // ////////////////////
  // ///    string    ///
  // export class
  //   /** @ts-ignore */
  //   string
  //   extends type<leaf<Tag.string, string>>
  //   { constructor(_opts?: string.Options) { super(leaf(Tag.string, "" as string)) } }

  // ////////////////////
  // ///    object    ///
  // export class
  //   /** @ts-ignore */
  //   object
  //   <const T extends { [x: string]: AST.Node }> extends type<object_<T>> { 
  //     constructor(public _: T, opts?: object.Options) { 
  //       const proto = opts?.exactOptionalPropertyTypes ? objectEOPT(_) : objectDefault(_)
  //       super(proto) 
  //       this.optionalKeys = optionalKeys(_)
  //     } 
  //     optionalKeys: OptionalKeys<T>[]
  //   }

  // ///////////////////
  // ///    array    ///
  // export class array<T extends AST.Node> extends type<array_<T>>
  //   { constructor(_: T, _opts?: array.Options) { super(array_(_)) } }

