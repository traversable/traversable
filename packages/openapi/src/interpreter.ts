export {
  type Autocomplete,
  type Binary,
  type CompilationTarget,
  type Continuation,
  type Hooks,
  type Nullary,
  type Refs,
  type Unary,
  type UserDefined,
  type UserDefinitions,
  Context,
  define,
  defineHooks,
  fromHooks,
  fromAST,
}

import { core, is, tree } from "@traversable/core"
import { 
  Option, 
  array, 
  fn, 
  type key, 
  map, 
  object, 
  pair,
  type prop, 
  string,
} from "@traversable/data"
import { type Pick, symbol } from "@traversable/registry"
import type { Partial, any } from "any-ts"

import { Schema } from "./schema/exports.js"

type Force<T> = never | { [K in keyof T]: T[K] }
type Part<T> = never | { [K in keyof T]+?: T[K] }

interface Refs { [$ref: string]: string }
type CompilationTarget = never | { refs: { [x: string]: string }, out: string }
type Continuation = { (node: Schema.any | Schema.$ref, ctx: Internal.Context, $refs: Refs): string }
interface UserDefined extends UserDefinitions {}

interface Hooks extends 
  Root.Hooks, 
  Nullary.Hooks, 
  Unary.Hooks, 
  Binary.Hooks {}
type UserDefinitions = Force<
  & Root.UserDefinitions 
  & Nullary.UserDefinitions 
  & Unary.UserDefinitions 
  & Binary.UserDefinitions
>

/** @internal */
const Object_assign = globalThis.Object.assign
/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const isNonBoolean = (node: Schema.any | Schema.$ref): node is globalThis.Exclude<typeof node, boolean> => typeof node !== "boolean"

function define<const T extends UserDefined>(definitions: T): [T, { refs: {} }]
function define<const T extends UserDefined>(definitions: T, opts: define.Options): [T, refs: { [x: string]: Schema.any }]
function define<const T extends UserDefined>(definitions: T, opts?: define.Options): [T, { refs: { [K in string]+?: Schema.any }}]
function define<const T extends UserDefined>(
  definitions: T, 
  { refs = define.defaults.refs }: define.Options = define.defaults
) { return [definitions, { refs }] }
void (define.defaults = { refs: {} } as const satisfies Required<define.Options>)
declare namespace define { interface Options { refs?: Refs } }

function parseOptionality(node: Schema.object, $: Internal.Context, _$refs?: Refs): Option<readonly string[]>
function parseOptionality(node: Schema.object, $: Internal.Context) {
  // const zero: string[] = []
  switch($.optionality) {
    case "opt-in": return Option.fromNullable(node.required) satisfies Option<readonly string[]>
    case "opt-out": return Option.some(node.required ?? []) satisfies Option<readonly string[]>
    default: return fn.exhaustive($.optionality) satisfies Option<readonly string[]>
  }
}

function matchOptionality
  <T extends { isNullable: boolean, isRequired: boolean }>(shape: T): (symbol.nullable | symbol.optional)[]
function matchOptionality
  <T extends { isNullable: boolean, isRequired: boolean }>({ isNullable, isRequired }: T) {
    return fn.pipe(
      pair.of(isNullable, isRequired),
      pair.distribute(Option.fromBoolean),
      pair.mapBoth(
        Option.match({ onNone: () => null, onSome: () => symbol.nullable }), 
        Option.match({ onNone: () => symbol.optional, onSome: () => null })
      ),
      array.filter(globalThis.Boolean),
    )
  }

const normalizeNullability = tree.has("nullable", core.is.true)

const normalizeOptionality 
  : (context: Internal.Context_object<any.dict>) => Option<readonly string[]>
  = ($) => fn.pipe(
    $.required,
    Option.guard(core.is.array(core.is.string)),
  )

const parseAdditional 
  : (node: Schema.object | Schema.record, prev: Internal.Context, $refs: Refs) => Option<string>
  = (node, prev, $refs) => fn.pipe(
    node,
    Option.guard(tree.has("additionalProperties")),
    Option.map(
      fn.flow(
        object.get.defer("additionalProperties"),
        (additional) => loop(additional, prev, $refs),
      )
    ),
  )

const parseExample
  : <T extends {}>(guard?: (u: unknown) => u is T) => (node: unknown, _prev?: Internal.Context, _$refs?: Refs) => Option<T>
  = (guard = core.is.nonnullable as never) => fn.flow(
    Option.guard(tree.has("example", guard)),
    Option.map(object.get.defer("example"))
  )

type Autocomplete<T> = T | (string & {})

interface Context_string extends Context<string> { 
  example?: string,  
  /** 
   * #### {@link Context_string `Context.string.format`}
   * See also: https://swagger.io/docs/specification/data-models/data-types/#format 
   * 
   * | Format        | Description                                                                                               | Example                     |
   * | ------------- | ----------------------------------------------------------------------------------------------------------| --------------------------- |
   * | `date`        | full-date notation as defined by [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339)                | `"2017-07-21"`              |
   * | `date-string` | the date-time notation as defined by [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339)            | `"2017-07-21T17:32:28Z"`    |
   * | `password`    | a hint to UIs to mask the input                                                                           |                             |
   * | `byte`        | base64-encoded characters                                                                                 | `"U3dhZ2dlciByb2Nrcw=="`    |
   * | `binary`      | binary data, used to describe [files](https://swagger.io/docs/specification/data-models/data-types/#file) | `"00000000 0000 0001 1010"` |
   */
  format?: Autocomplete<"date" | "date-time" | "password" | "byte" | "binary">
}

export interface Context_oneOf<T = unknown> extends Context<T> {}
export interface Context_allOf<T extends any.dict> extends Context<T> {}
export interface Context_anyOf<T = unknown> extends Context<T> {}

export interface Context_object<T extends any.dict = any.dict> extends Context<T> { 
  additionalProperties?: string
  required?: readonly string[]
}

export interface Context_array extends Context {
  minItems: Schema.array["minItems"]
  maxItems: Schema.array["maxItems"]
}

export interface Context_tuple extends Context<readonly unknown[]> {}

export interface Context_ref<T = unknown> extends Context<T> {}

export interface Context_integer extends 
  Context<number>, 
  Part<{ 
    minimum: Schema.integer["minimum"]
    maximum: Schema.integer["maximum"]
    exclusiveMaximum: Schema.integer["exclusiveMaximum"]
    exclusiveMinimum: Schema.integer["exclusiveMinimum"]
    format: Schema.integer["format"]
  }> {}

export interface Context_number extends Context_integer { 
  multipleOf?: Schema.number["multipleOf"] 
}

export interface Context_record extends Context<any.dict> {}

declare namespace Internal {
  /**
   * These properties are internal because we represent
   * optional properties using the {@link Option `Option`}
   * type.
   * 
   * While we've found this approach to be great for managing
   * complexity, we also recognize that users who are unfamiliar
   * with this pattern might find this confusing, so we strip
   * out the options as a final step before sending anything to
   * the user.
   */
  export type Context<T = unknown> = Option.fromPartial<
    & Context.RequiredFields<T>
    & Partial<Context.OptionalFields<T>> 
  >
  export type Context_string = Option.fromPartial<Context.string>
  export type Context_number = Option.fromPartial<Context.number>
  export type Context_integer = Option.fromPartial<Context.integer>
  export type Context_allOf<T extends any.dict = any.dict> = Option.fromPartial<Context.allOf<T>>
  export type Context_anyOf<T = unknown> = Option.fromPartial<Context.anyOf<T>>
  export type Context_oneOf<T = unknown> = Option.fromPartial<Context.oneOf<T>>
  export type Context_ref = Option.fromPartial<Context.ref>
  export type Context_object<T extends any.dict = any.dict> = Option.fromPartial<Context.object<T>>
  export type Context_record = Option.fromPartial<Context.record>
  export type Context_array = Option.fromPartial<Context.array>
  export type Context_tuple = Option.fromPartial<Context.tuple>

}
namespace Internal {
  /*
  description: Option<string>;
    example: Option<number>;
    locals: Option<Pick<Context.OptionalFields<{}>, "description" | "example">>;
    format: Option<string>;
    minimum: Option<number>;
    maximum: Option<number>;
    exclusiveMaximum: Option<boolean>;
    exclusiveMinimum: Option<boolean>;
    multipleOf
  */
}

interface Context<T = {}>  extends 
  Context.RequiredFields<T>,
  Partial<Context.OptionalFields<T>> {}


function fromInternalArray(_: Internal.Context_array): Context.array
function fromInternalArray(_: Internal.Context_array): ContextArrayOptionalProps { return Option.toPartial(_) }
const ContextArrayOptionalProps = ["description", "locals"] as const satisfies string[]
type ContextArrayOptionalProps = Omit<Context.array, typeof ContextArrayOptionalProps[number]>

function fromInternalString(_: Internal.Context_string): Context.string
function fromInternalString(_: Internal.Context_string): ContextStringOptionalProps { return Option.toPartial(_) }
const ContextStringOptionalProps = [...ContextArrayOptionalProps, "example", "format", "userDefined"] as const satisfies string[]
type ContextStringOptionalProps = Omit<Context.string, typeof ContextStringOptionalProps[number]>

function fromInternalInteger(_: Internal.Context_integer): Context.integer
function fromInternalInteger(_: Internal.Context_integer): ContextIntegerOptionalProps { return Option.toPartial(_) }
const ContextIntegerOptionalProps = [...ContextStringOptionalProps, "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum"] as const satisfies string[]
type ContextIntegerOptionalProps = Omit<Context.integer, typeof ContextIntegerOptionalProps[number]>

function fromInternalNumber(_: Internal.Context_number): Context.number
function fromInternalNumber(_: Internal.Context_number): ContextNumberOptionalProps { return Option.toPartial(_) }
const ContextNumberOptionalProps = [...ContextIntegerOptionalProps, "multipleOf"] as const satisfies string[]
type ContextNumberOptionalProps = Omit<Context.number, typeof ContextNumberOptionalProps[number]>

// function numberToInternal(_: Context.number): Internal.Context_number
// function numberToInternal(_: Context.number): Omit<Context_number, "user_defined"> { return _ }
// function stringToInternal(_: Context.string): Internal.Context_string
// function stringToInternal(_: Context.string): Internal.Context_string { return _ }
// function integerToInternal(_: Context.integer): Internal.Context_integer
// function integerToInternal(_: Context.integer): Internal.Context_integer { return _ }
// export function toInternal<T>(_: Context<T>): Internal.Context<T>



export function fromInternal(_: Internal.Context): Context & { userDefined: unknown }
export function fromInternal(_: Internal.Context): Omit<Context, "userDefined"> { 
  return Option.toPartial(_) 
}


declare namespace Context {
  // export { type PropsContext as props }
  export {
    Context_number as number,
    Context_integer as integer,
    Context_string as string,
    Context_array as array,
    Context_object as object,
    Context_record as record,
    Context_tuple as tuple,
    Context_oneOf as oneOf,
    Context_allOf as allOf,
    Context_anyOf as anyOf,
    Context_ref as ref,
  }

  export type Partial<T extends { [x: string]: unknown }> = (
    & { moduleName: string, document: Schema.any, schemaName: string, hooks: Hooks } 
    & Part<Context<T>>
  )
  export type OptionalFields<T = {}> = {
    /// node-level config
    description: string
    example: T
    locals: Pick<OptionalFields, "example" | "description">
  }
  export type RequiredFields<T = {}> = {
    /// module-level config
    dependencies: readonly string[]
    document: Schema.any
    fileExtension: string
    focusPath: readonly string[]
    hooks: Hooks
    moduleName: string
    optionality: "opt-in" | "opt-out"
    rootSchemaName: null | string
    /// node-level config
    isNullable: boolean
    isReadonly: boolean
    isRequired: boolean
    node: Schema.any
    schemaName: string
    userDefined: T
    /// node-level state
    path: (key.any)[]
  }
}

  
const OptionalFields = {
  description: core.is.string,
  additionalProperties: core.is.string,
  required: core.is.array(core.is.string),
} as const

const createOptionalFieldsShape = <S, T extends S>(example: (src: S) => src is T) => ({
  ...OptionalFields,
  example,
  locals: {
    example,
    description: OptionalFields.description,
  }
})

// export type OptionalFields<T = {}> = {
//   /// node-level config
//   description: string
//   example: T
//   locals: Pick<OptionalFields, "example" | "description">
//   // additionalProperties?: string
//   // required?: readonly string[]
// }

namespace Context {
  export const apply
    : (node: Schema.any | Schema.$ref, xf: (prev: any) => any) => (prev: Internal.Context<any>) => Internal.Context<any>
    = (node, xf) => (prev) => {
      const isNullable = normalizeNullability(node)
      return object.intersect(prev, {
        isNullable,
        rootSchemaName: prev.rootSchemaName ?? prev.schemaName,
        userDefined: xf(prev.userDefined),
        description: fn.pipe(
          node,
          Option.guard(isNonBoolean), 
          Option.map(object.get.defer("description")),
          Option.filter(globalThis.Boolean),
        )
      })
    }

  export const init 
    : <T extends any.dict>(partial: Omit<Context.Partial<T>, "document">) => (doc: Context["document"]) => Internal.Context<T>
    = ($) => (doc) => Object_assign({
      /// module-level config
      dependencies: $.dependencies ?? [],
      document: doc, 
      fileExtension: $.fileExtension ?? "",
      focusPath: $.focusPath ?? ["components", "schemas"],
      hooks: $.hooks, 
      moduleName: $.moduleName,
      optionality: $.optionality ?? "opt-in",
      rootSchemaName: null,
    }, { /// node-level config
      node: doc,
      isNullable: $.isNullable ?? false,
      isReadonly: $.isReadonly ?? false,
      isRequired: $.isRequired ?? ($.optionality === "opt-in"),
      schemaName: $.schemaName,
      userDefined: $.userDefined ?? {} as never,
      example: Option.fromNullable($.example),
      description: Option.fromNullable($.description),
    }, { /// node-level state
      locals: Option.fromNullable($.locals),
      path: $.path ?? [],
    } as const)


  export function handleObject(
    node: Schema.object, 
    $refs: Refs, 
    xf: (prev: unknown) => unknown = fn.identity
  ) {
    const optionalKeys = [
      "description", 
      "example", 
      "additionalProperties", 
      "required", 
      "locals"
    ] as const satisfies string[] 
    return (prev: Internal.Context) => {
      return fn.pipe(
        prev,
        Context.apply(node, xf),
        object.intersect.defer({
          additionalProperties: parseAdditional(node, prev, $refs),
          required: parseOptionality(node, prev),
          example: parseExample(core.is.object.any)(node, prev, $refs),
        }),
        pair.duplicate,
        x=>x,
        pair.mapBoth(
          object.pick.defer(...optionalKeys), 
          object.omit.defer(...optionalKeys),
            // Option.fromPartial(...optionalKeys)
        ),
        ([opt, req]) => object.intersect(opt, req),
      )
    }
  }

  export function handleRecord(
    node: Schema.record<Schema.any>,
    $refs: Refs,
    xf: (prev: unknown) => unknown = fn.identity
  ) {
    return (prev: Internal.Context) => fn.pipe(
      prev,
      Context.apply(node, xf),
      object.intersect.defer({
        path: [...prev.path, symbol.string],
        example: parseExample(core.is.record)(node),
      }),
    )
  }


  /** TODO: rename to `handleArrayItems`? */
  export function handleArray(
    node: Schema.array, 
    xf: (prev: unknown) => any = fn.identity
  ) {
    const { items } = node
    return (prev: Internal.Context): Internal.Context_array => ({
      ...prev,
      path: [...prev.path, symbol.number],
      /** Example is for the parent node (the array itself, not the `items` node) */
      example: parseExample(core.is.any.array)(node),
      userDefined: xf(prev.userDefined),
      isRequired: "required" in prev && Option.is(prev.required) && Option.isNone(prev.required),
      isNullable: normalizeNullability(items),
      minItems: node.minItems,
      maxItems: node.maxItems,
    })
  }

  export const handleTuple
    : (node: Schema.tuple, xf?: (prev: readonly unknown[]) => readonly unknown[]) 
      => (prev: Internal.Context) 
      => Internal.Context<readonly unknown[]>

    = (node, xf = fn.identity) => (prev) => fn.pipe(
      prev,
      Context.apply(node, xf),
      object.intersect.defer({
        example: parseExample(core.is.array.any)(node),
        minItems: node.minItems,
        maxItems: node.maxItems,
      }),
    )


  export const handleIndex
    : (prev: Internal.Context<readonly unknown[]>, node: Schema.any) 
      => (index: prop.any, xf?: (prev: readonly unknown[]) => readonly unknown[]) 
      => Internal.Context<readonly unknown[]>

    = (prev, node) => (index, xf = fn.identity) => {
      const opt = matchOptionality({ 
        isNullable: normalizeNullability(node), 
        isRequired: prev.isRequired,
      })
      
      return fn.pipe(
        prev,
        Context.apply(node, xf),
        object.intersect.defer({
          path: [...prev.path, index, ...opt],
        })
      )
    }

  export const handleRefProperty
    : <T extends { [x: string]: unknown }>(prev: Internal.Context_object<T>) => (node: Schema.$ref, key: string, xf?: (prev: T) => T) => Internal.Context<T>
    = (prev) => 
      (node, key, xf = fn.identity) => {
        const prefix = `#/${prev.focusPath.join("/")}/` as const
        const dereferenced = fn.pipe(
          node.$ref,
          Option.fromNullable,
          Option.flatMap(Option.fromPredicate((n) => n.startsWith(prefix))),
          Option.map(($ref) => [...prev.focusPath, ...$ref.substring(prefix.length).split("/")]),
          Option.flatMap((path) => Option.fromNullable(tree.get(prev.document, ...path))),
        )
        const localExample = fn.pipe(
          dereferenced,
          Option.guard(tree.has("example")),
          Option.map(object.get.defer("example")),
        )
        const localDescription = fn.pipe(
          dereferenced,
          Option.guard(tree.has("description", core.is.string)),
          Option.map(object.get.defer("description")),
        )
        const optional = {
          isNullable: fn.pipe(
            dereferenced,
            Option.guard(tree.has("nullable", core.is.boolean)),
            Option.map((n) => n.nullable),
            Option.getOrElse(() => false),
          ),
          isRequired: fn.pipe(
            normalizeOptionality(prev),
            Option.map((xs) => xs.includes(key)),
            Option.getOrElse(() => true),
          )
        }

      return fn.pipe(
        prev,
        Context.apply(node, xf),
        object.intersect.defer({
          path: [...prev.path, key, ...matchOptionality(optional)],
          example: parseExample()(node),
          /** 
           * Resetting `required` to `Option.none` here ensures that 
           * we don't inherit it from the parent object, which makes
           * things hard to understand/debug if they're still in
           * context while we're parsing a child node downstream.
           */
          required: Option.none(),
          isRequired: optional.isRequired,
          isNullable: optional.isNullable,
          locals: Option.partial({ 
            example: localExample, 
            description: localDescription 
          }),
        })
      )
    }

  export const handleProperty 
    : <T extends { [x: string]: unknown }>(prev: Internal.Context_object<T>) 
      => (node: Schema.any, key: string, xf?: (prev: T) => T) 
      => Internal.Context<T>
    = (prev) => (node, key, xf = fn.identity) => {
      if(Schema.isRef(node))
        return handleRefProperty(prev)(node, key, xf)
      else {
        const isNullable = normalizeNullability(node)
        const isRequired = fn.pipe(
          normalizeOptionality(prev),
          Option.map((xs) => xs.includes(key)),
          Option.getOrElse(() => true),
        )
        const optionality = matchOptionality({
          isNullable,
          isRequired,
        })

        return fn.pipe(
          prev,
          Context.apply(node, xf),
          object.intersect.defer({
            path: [...prev.path, key, ...optionality],
            example: parseExample()(node),
            required: Option.none(),
            isRequired,
            locals: Option.none()
          }),
        )
      }
    }

  export const handleString
    : (node: Schema.string, xf?: (prev: string) => string) 
      => (prev: Internal.Context) 
      => Internal.Context_string
    = (node, xf = fn.identity) => (prev) => {
      const optionality = matchOptionality({ 
        isNullable: normalizeNullability(node), 
        isRequired: prev.isRequired,
      })

      return fn.pipe(
        prev,
        Context.apply(node, xf),
        object.intersect.defer({
          path: [...prev.path, ...optionality],
          format: Option.fromNullable(node.format),
          example: parseExample(core.is.string)(node),
        }),
      )
    }
  
  export const handleInteger
    : (node: Schema.integer, xf?: (prev: number) => number) 
      => (prev: Internal.Context) 
      => Internal.Context_integer
    = (node, xf = fn.identity) => (prev) => fn.pipe(
      prev,
      Context.apply(node, xf),
      object.intersect.defer({
        example: parseExample(core.is.number)(node),
        format: Option.fromNullable(node.format),
        maximum: Option.fromNullable(node.maximum),
        minimum: Option.fromNullable(node.minimum),
        exclusiveMaximum: Option.fromNullable(node.exclusiveMaximum),
        exclusiveMinimum: Option.fromNullable(node.exclusiveMinimum),
      }),
    )

  export const handleNumber 
    : (node: Schema.number, xf?: (prev: number) => number) 
      => (prev: Internal.Context) 
      => Internal.Context_number
    = (node, xf = fn.identity) => (prev) => fn.pipe(
      prev,
      Context.apply(node, xf),
      object.intersect.defer({
        example: parseExample(core.is.number)(node),
        format: Option.fromNullable(node.format),
        maximum: Option.fromNullable(node.maximum),
        minimum: Option.fromNullable(node.minimum),
        exclusiveMaximum: Option.fromNullable(node.exclusiveMaximum),
        exclusiveMinimum: Option.fromNullable(node.exclusiveMinimum),
        multipleOf: Option.fromNullable(node.multipleOf),
      }),
    )
      
  export const handleRef 
    : (node: Schema.$ref | Schema.any, xf?: (prev: unknown) => unknown) 
      => (prev: Internal.Context) 
      => Internal.Context_ref
    = (node, xf = fn.identity) => (prev) => {
      return fn.pipe(
        prev,
        Context.apply(node, xf),
        object.intersect.defer({
          example: parseExample()(node),
        }),
      )
    }

  export const handleOneOf 
    : (prev: Internal.Context<unknown>, node: Schema.oneOf<Schema.any>) 
      => (pos: prop.any, xf?: (prev: unknown) => unknown) 
      => Internal.Context_oneOf
    = (prev, node) => (pos, xf = fn.identity) => {
      const nextSegment = `⊔${pos}` as const
      return fn.pipe(
        prev,
        Context.apply(node, xf),
        object.intersect.defer({
          example: parseExample()(node),
          path: [...prev.path, nextSegment],
        })
      )
    }

  export const handleAnyOf 
    : (prev: Internal.Context<unknown>, node: Schema.anyOf<Schema.any>) 
      => (pos: prop.any, xf?: (prev: unknown) => unknown) 
      => Internal.Context_anyOf
    = (prev, node) => (pos, xf = fn.identity) => {
      const nextSegment = `∪${pos}` as const
      return fn.pipe(
        prev,
        Context.apply(node, xf),
        object.intersect.defer({
          example: parseExample()(node),
          path: [...prev.path, nextSegment],
        }),
      )
    }

  export const handleAllOf 
    : (prev: Internal.Context, node: Schema.allOf<Schema.any>) 
      => (pos: prop.any, xf?: (prev: unknown) => unknown) 
      => Internal.Context_allOf
    = (prev, node) => (pos, xf = fn.identity) => {
      const nextSegment = `∩${pos}` as const 
      return fn.pipe(
        prev,
        Context.apply(node, xf),
        object.intersect.defer({
          example: parseExample()(node),
          path: [...prev.path, nextSegment],
        })
      )
    }
}

const hasRef
  : (u: unknown) => u is { $ref: string }
  = (u): u is never => u !== null && typeof u === "object" && "$ref" in u

export const parseRef
  : <T>(ctx: Internal.Context<T>) => (refNode: unknown) => string 
  = (ctx) => (refNode) => {
    if (!hasRef(refNode)) throw Error(`\`parseRef\` received a node that did not have a string property called "$ref"`)
    const focus = "#/".concat(ctx.focusPath.join("/")).concat("/")
    return refNode.$ref.slice(focus.length)
  }

// TODO:
// const dereferencePointer (...) => {}

const deref
  : <T>(prev: Internal.Context, $refs: Refs, loop: Continuation) => (node: Schema.any | Schema.$ref) => string
  = (prev, $refs, loop) => (node) => {
    const $ref = parseRef(prev)(node)
    if($ref.includes("/")) {
      const path = [...prev.focusPath, ...$ref.split("/")]
      const dereferenced 
        = tree.has(...path)(prev.document) 
        ? tree.get(prev.document, ...path) 
        : null

      if(dereferenced == null) return "" 
      else {
        const next = fn.pipe(
          prev,
          Context.apply(dereferenced, fn.identity),
          object.intersect.defer({
            path: [ ...prev.path],
          }),
        )

        const $value = fn.pipe(
          dereferenced,
          prev.hooks.ref.before(next),
          (n) => fn.pipe(
            loop(n, next, $refs),
            /** TODO: figure out why running this hook breaks Faker codegen */
            // prev.hooks.ref.after(Context.handleRef(prev, node)()),
          ),
        ) satisfies string
        return ($refs[$ref] = $value, $value)
      }
    }
    else {
      const identifier = fn.pipe(
        $ref,
        prev.hooks.canonical(prev),
        prev.hooks.ref.after(Context.handleRef(node)(prev)),
      ) satisfies string
      return ($refs[$ref] = identifier, identifier)
    }
  }


const builtins = { 
  object: {
    beforeEach(ctx: Internal.Context) { 
      return (prop: Schema.any, key: string | number) => 
        [prop, object.parseKey(key)] satisfies [Schema.any, string] 
    }
  }
} as const

const interpreted
  : (refs: { [x: string]: string }) => (out: string) => CompilationTarget 
  = (refs) => (out) => ({
    refs,
    out,
  })

const fromHooks
  : (schemaName: string, hooks: Hooks, moduleName: string) => (document: Schema.any) => CompilationTarget 
  = (schemaName: string, hooks: Hooks, moduleName: string) => (doc) => fn.pipe(
    fromAST,
    fn.apply(Context.init({ moduleName, schemaName, hooks })(doc)),
    fn.apply(doc),
  )

export interface InlineArgs {
  hooks: UserDefined
  moduleName: string
  schemaName?: string
}

export const inline 
  : (params: InlineArgs) 
    => (schema: Schema.any, root?: Schema.any) 
    => CompilationTarget
  = ({ hooks, moduleName, schemaName = "inline" }) => 
    (schema, root) => fn.pipe(
      root ?? schema,
      Context.init({
        moduleName,
        schemaName,
        hooks: defineHooks(hooks),
      }),
      fromAST,
      fn.apply(schema),
    )
 
function fromAST(ctx: Internal.Context): (root: Schema.any) => CompilationTarget 
function fromAST($: Internal.Context) {
  void ($.schemaName = $.hooks.canonical($)($.schemaName))
  void ($.isReadonly = $.isReadonly ?? false)
  void ($.isRequired = $.isRequired ?? false)
  let $refs: any.dict<string> = {}
  return fn.flow(
    $.hooks.beforeAll($),
    (n) => loop(n, $, $refs),
    $.hooks.afterAll($),
    interpreted($refs)
  )
}

function handleString(node: Schema.string, $: Internal.Context, _$: Refs): string {
  const next = Context.handleString(node)($)
  return fn.pipe(
    $.hooks.string(next).value,
    $.hooks.afterEach(next),
  )
}

function handleNumber(node: Schema.number, $: Internal.Context, _$: Refs): string {
  const next = Context.handleNumber(node)($)
  return fn.pipe(
    $.hooks.number(next).value,
    $.hooks.afterEach(next),
  )
}

function handleBoolean(_: Schema.boolean, $: Internal.Context, _$: Refs): string {
  const next = $
  return fn.pipe(
    $.hooks.boolean(next).value,
    $.hooks.afterEach(next),
  )
}

function handleInteger(node: Schema.integer, $: Internal.Context, _$: Refs): string {
  const next = Context.handleInteger(node)($)
  return fn.pipe(
    $.hooks.integer(next).value,
    $.hooks.afterEach(next),
  )
}

function handleNull(_: Schema.null, $: Internal.Context, _$: Refs): string {
  const next = $
  return $.hooks.null(next).value
}

function handleArray<T extends Schema.any>(node: Schema.array<T>, $: Internal.Context, $refs: Refs): string {
  const next = Context.handleArray(node)($)
  return fn.pipe(
    node.items, 
    $.hooks.array.before($),
    (n) => loop(n, next, $refs), 
    $.hooks.array.after($),
    $.hooks.afterEach($),
  )
}

function handleTuple<T extends Schema.any>(node: Schema.tuple<T>, $: Internal.Context, $refs: Refs): string {
  const tupleContext = Context.handleTuple(node)($)
  const next = Context.handleIndex(tupleContext, node)
  return fn.pipe(
    node.items,
    $.hooks.tuple.beforeAll(tupleContext),
    map(
      fn.flow(
        (node, ix) => $.hooks.tuple.beforeEach(next(ix))(node, ix),
        ([node, ix]) => [loop(node, next(ix), $refs), ix + ""],
        ([node, ix]) => $.hooks.tuple.afterEach(next(ix))(node, ix),
        ([node, _]) => node,
      ),
    ),
    $.hooks.tuple.join($),
    $.hooks.tuple.afterAll($),
    $.hooks.afterEach($),
  )
}

function handleOneOf(node: Schema.oneOf<Schema.any>, $: Internal.Context, $refs: Refs): string {
  const next = Context.handleOneOf($, node)
  return (
    fn.pipe(
      node.oneOf,
      $.hooks.oneOf.beforeAll($),
      map(
        fn.flow(
          (x, ix) => { return $.hooks.oneOf.beforeEach($)(x, ix) },
          ([node, ix]) => [loop(node, next(ix), $refs), ix + ""],
          ([node, ix]) => $.hooks.oneOf.afterEach(next(ix))(node, ix),
          ([node, _x]) => node,
        ),
      ),
      $.hooks.oneOf.join($),
      $.hooks.oneOf.afterAll($),
      $.hooks.afterEach($),
    )
  )
}

function handleAllOf(node: Schema.allOf<Schema.any>, $: Internal.Context, $refs: Refs): string {
  const next = Context.handleAllOf($, node)
  return (
    fn.pipe(
      node.allOf,
      $.hooks.allOf.beforeAll($),
      map(
        fn.flow(
          (x, ix) => { return $.hooks.allOf.beforeEach($)(x, ix) },
          ([node, ix]) => [loop(node, next(ix), $refs), ix + ""],
          ([node, ix]) => $.hooks.allOf.afterEach(next(ix))(node, ix),
          ([node, _x]) => node,
        ),
      ),
      $.hooks.allOf.join($),
      $.hooks.allOf.afterAll($),
      $.hooks.afterEach($),
    )
  )
}

function handleAnyOf(node: Schema.anyOf<Schema.any>, $: Internal.Context, $refs: Refs): string {
  const next = Context.handleAnyOf($, node)
  return fn.pipe(
    node.anyOf,
    $.hooks.anyOf.beforeAll($),
    map(
      fn.flow(
        (x, ix) => { return $.hooks.anyOf.beforeEach($)(x, ix) },
        ([node, ix]) => [loop(node, next(ix), $refs), ix + ""],
        ([node, ix]) => $.hooks.anyOf.afterEach(next(ix))(node, ix),
        ([node, _x]) => node,
      ),
    ),
    $.hooks.anyOf.join($),
    $.hooks.anyOf.afterAll($),
    $.hooks.afterEach($),
  )
}

function handleRecord(node: Schema.record<Schema.any>, $: Internal.Context, $refs: Refs): string {
  const next = Context.handleRecord(node, $refs)($)
  return fn.pipe(
    node.additionalProperties,
    $.hooks.record.before($),
    (n) => loop(n, next, $refs),
    $.hooks.record.after($),
    $.hooks.afterEach(next),
  )
}

// TODO: does this break things?                                          vvvvvvv
function handleObject(node: Schema.object<Schema.any>, $: Internal.Context, $refs: Refs): string {
  const objectContext = Context.handleObject(node, $refs)($)
  return fn.pipe(
    node.properties,
    $.hooks.object.beforeAll(objectContext),
    map(
      fn.flow(
        (childNode, childKey) => {
          const entry = builtins.object.beforeEach(objectContext)(childNode, childKey)
          const propertyContext = Context.handleProperty(objectContext)(...entry)

          return fn.pipe(
            entry,
            ([n, k]) => $.hooks.object.beforeEach(objectContext)(n, k),
            ([n, k]) => [loop(n, propertyContext, $refs), k],
            ([s, k]) => $.hooks.object.afterEach(propertyContext)(s, k),
            ([s, k]) => s.concat(k),
          )
        }
      )
    ),
    object.values,
    $.hooks.object.join(objectContext),
    $.hooks.object.afterAll(objectContext),
    $.hooks.afterEach($),
  )
}

const loop = fn.loopN<[node: Schema.any | Schema.$ref, ctx: Internal.Context<unknown>, $refs: Refs], string>
  ((node, prev, $refs, loop) => {
    switch (true) {
    /** make sure we have the node in-hand before we start pattern matching */
    case Schema.isRef(node): return deref(prev, $refs, loop)(node)
    case Schema.isString(node): return handleString(node, prev, $refs)
    case Schema.isNumber(node): return handleNumber(node, prev, $refs)
    case Schema.isBoolean(node): return handleBoolean(node, prev, $refs)
    case Schema.isInteger(node): return handleInteger(node, prev, $refs)
    case Schema.isNull(node): return handleNull(node, prev, $refs)
    case Schema.isTuple(node): return handleTuple(node, prev, $refs)
    case Schema.isArray(node): return handleArray(node, prev, $refs)
    case Schema.isAnyOf(node): return handleAnyOf(node, prev, $refs)
    case Schema.isOneOf(node): return handleOneOf(node, prev, $refs)
    case Schema.isAllOf(node): return handleAllOf(node, prev, $refs)
    case Schema.isRecord(node): return handleRecord(node, prev, $refs)
    case Schema.isObject(node): return handleObject(node, prev, $refs)
    default: return node // fn.exhaustive(node)
  }
})


declare namespace Nullary {
  type UserDefined = ((context: Internal.Context) => string) | string
  type Hook = (context: Internal.Context) => { value: string }
  type StringHook = (context: Internal.Context_string) => { value: string }
  type NumberHook = (context: Internal.Context_number) => { value: string }
  type IntegerHook = (context: Internal.Context_integer) => { value: string }
  type UserDefinedStringHook = ((context: Context.string) => string) | string
  type UserDefinedNumberHook = ((context: Context.number) => string) | string
  type UserDefinedIntegerHook = ((context: Context.integer) => string) | string
  type UserDefinitions = {
    string: UserDefinedStringHook
    number: UserDefinedNumberHook
    integer: UserDefinedIntegerHook
    boolean: Nullary.UserDefined
    null: Nullary.UserDefined
  }
  interface Hooks {
    ////////////////
    /// scalars
    /** See the {@link https://swagger.io/docs/specification/data-models/data-types/#boolean `OpenAPI docs`} on boolean nodes */
    boolean: Hook
    /** See the {@link https://swagger.io/docs/specification/data-models/data-types/#numbers `OpenAPI docs`} on numeric nodes */
    integer: IntegerHook
    /** See the {@link https://swagger.io/docs/specification/data-models/data-types/#numbers `OpenAPI docs`} on numeric nodes */
    number: NumberHook
    /** See the {@link https://swagger.io/docs/specification/data-models/data-types/#string `OpenAPI docs`} on string nodes */
    string: StringHook
    null: Hook
  }
}

namespace Nullary {
  export const names = array.of(
    `boolean`,
    `integer`,
    `null`,
    `number`,
    `string`,
    `anyArray`,
    `anyObject`,
    `emptyObject`,
  )
  export const byName = object.fromKeys(names)
  export const isName = array.includes(names)
  export const fallback: Nullary.Hook = () => ({ value: `` })

  export function defineHooks<H extends Part<Nullary.UserDefinitions>>(hooks?: H): Nullary.Hooks {
    return fn.pipe(
      Nullary.byName, 
      object.transform.defer({
        string: (x) => ((context: Internal.Context_string) => ({ value: core.is.function(hooks?.string) ? hooks.string(fromInternalString(context)) : hooks?.string ?? "" })),
        number: () => ((context: Internal.Context_number) => ({ value: core.is.function(hooks?.number) ? hooks.number(fromInternalNumber(context)) : hooks?.number ?? "" })),
        integer: () => ((context: Internal.Context_integer) => ({ value: core.is.function(hooks?.integer) ? hooks.integer(fromInternalInteger(context)) : hooks?.integer ?? "" })),
        boolean: () => ((context: Internal.Context) => ({ value: core.is.function(hooks?.boolean) ? hooks.boolean(context) : hooks?.boolean ?? "" })),
        /** @deprecated - use `nullable` on {@link Context `Context`} instead */
        null: () => ((context: Internal.Context) => ({ value: core.is.function(hooks?.null) ? hooks.null(context) : hooks?.null ?? "" })),
      }),
    )
  }
        
  export const fallbacks = defineHooks()
}

namespace Unary {
  export type UserDefined = UserDefinitions[keyof UserDefinitions]
  export const props = array.of(
    `before`, 
    `after`,
  )
  export const names = array.of(
    `array`, 
    `const`, 
    `record`,
  )
  export const prop = object.fromKeys(props)
  export const byName = object.fromKeys(names)
  export const isName = array.includes(names)

  export type UserDefinitions = {
    array?: {
      before?(node: Schema.any, context: Context.array): Schema.any
      after?(node: string, context: Context.array): string
    }
    const?: {
      before?(value: any.literal, context: Context): any.literal
      after?(node: string, context: Context): string
    }
    record?: {
      before?(node: Schema.any, context: Context): Schema.any
      after?(node: string, context: Context): string
    }
  }

  export interface Hooks {
    array: {
      before(context: Internal.Context): (node: Schema.any) => Schema.any
      after(context: Internal.Context): (node: string) => string
    }
    const: {
      before(context: Internal.Context): (node: any.literal) => any.literal
      after(context: Internal.Context): (node: string) => string
    }
    record: {
      before(context: Internal.Context): (node: Schema.any) => Schema.any
      after(context: Internal.Context): (node: string) => string
    }
  }

  export function defineHooks(hooks?: Part<Unary.UserDefinitions>): Unary.Hooks {
    return fn.pipe(
      Unary.byName,
      object.transform.defer({
        array: () => ({ 
          before: (context: Internal.Context_array) => 
            (node: Schema.any) => tree.has("before", core.is.function)(hooks?.array) 
              ? hooks.array.before(node, fromInternalArray(context)) 
              : node,
          after: (context: Internal.Context_array) => 
            (node: string) => tree.has("after", core.is.function)(hooks?.array)
              ? hooks.array.after(node, fromInternalArray(context))
              : node,
        }),
        const: () => ({
          before: (context: Internal.Context) => 
            (node: any.literal) => tree.has("before", core.is.function)(hooks?.const)
              ? hooks.const.before(node, fromInternal(context))
              : node,
          after: (context: Internal.Context) => 
            (node: string) => tree.has("after", core.is.function)(hooks?.const)
              ? hooks.const.after(node, fromInternal(context))
              : node,
        }),
        record: () => ({
          before: (context: Internal.Context_record) => 
            (node: Schema.any) => tree.has("before", core.is.function)(hooks?.record)
              ? hooks!.record!.before?.(node, fromInternal(context))! 
              : node,
          after: (context: Internal.Context_record) => 
            (node: string) => tree.has("after", core.is.function)(hooks?.record)
              ? hooks.record.after(node, fromInternal(context))
              : node,
        }),
      }),
    )
  }

  export const fallbacks: Unary.Hooks = defineHooks()
}

namespace Binary {
  export const propNames = array.of(`beforeAll`, `afterAll`, `beforeEach`, `afterEach`, `join`)
  export const names = array.of(`allOf`, `anyOf`, `oneOf`, `tuple`, `object`, `enum`)
  export const prop = object.fromKeys(propNames)
  export const byName = object.fromKeys(names)

  export type UserDefinitions = {
    allOf?: UserDefined<Schema.any[], number>
    anyOf?: UserDefined<Schema.any[], number>
    oneOf?: UserDefined<Schema.any[], number>
    tuple?: {
      beforeAll?(properties: readonly Schema.any[], ctx: Context.tuple): readonly Schema.any[]
      beforeEach?(item: Schema.any, itemIndex: number, ctx: Context.tuple): readonly [item: Schema.any, itemIndex: number]
      afterEach?(item: string, itemIndex: string, ctx: Context.tuple): readonly [item: string, itemIndex: string]
      join?(items: readonly string[], ctx: Context.tuple): string
      afterAll?(generated: string, ctx: Context.tuple): string
    }
    object?: {
      beforeAll?(properties: { [x: string]: Schema.any }, ctx: Context.object): { [x: string]: Schema.any }
      beforeEach?(property: Schema.any, propertyKey: string, ctx: Context.object): readonly [property: Schema.any, propertyKey: string]
      afterEach?(property: string, propertyKey: string, ctx: Context.object): readonly [key: string, value: string]
      join?(properties: readonly string[], ctx: Context.object): string
      afterAll?(generated: string, ctx: Context.object): string
    }
    enum?: UserDefined<any.json[], any>
  }
  export interface Hook {
    beforeAll(ctx: Internal.Context): <T>(before: T) => T
    afterAll(ctx: Internal.Context): (after: string) => string
    beforeEach(ctx: Internal.Context): <Ix extends key.any>(before: Schema.any, prop: Ix) => readonly [before: Schema.any, prop: Ix]
    afterEach(ctx: Internal.Context): (after: string, prop: string) => readonly [after: string, prop: string]
    join(ctx: Internal.Context): (xs: readonly string[]) => string
  }
  export type UserDefined<T, Ix extends key.any> = {
    beforeAll?(nodes: T, ctx: Context): T
    beforeEach?(node: Schema.any, index: Ix, ctx: Context): [before: Schema.any, index: Ix]
    afterEach?(generated: string, key: string, ctx: Context): [key: string, value: string]
    join?(generated: readonly string[], ctx: Context): string
    afterAll?(after: string, ctx: Context): string
  }
  export interface Hooks {
    allOf: Binary.Hook
    anyOf: Binary.Hook
    oneOf: Binary.Hook
    tuple: {
      beforeAll(ctx: Internal.Context_tuple): (before: readonly Schema.any[]) => readonly Schema.any[]
      afterAll(ctx: Internal.Context): (after: string) => string
      beforeEach(ctx: Internal.Context): (item: Schema.any, itemIndex: number) => readonly [item: Schema.any, index: number]
      afterEach(ctx: Internal.Context): (item: string, itemIndex: string) => readonly [item: string, index: string]
      join(ctx: Internal.Context): (items: readonly string[]) => string
    }
    // Binary.Hook
    object: {
      beforeAll(ctx: Internal.Context_object): (before: { [x: string]: Schema.any }) => { [x: string]: Schema.any }
      afterAll(ctx: Internal.Context): (after: string) => string
      beforeEach(ctx: Internal.Context): (prop: Schema.any, key: string) => readonly [prop: Schema.any, key: string]
      afterEach(ctx: Internal.Context): (prop: string, key: string) => readonly [prop: string, key: string]
      join(ctx: Internal.Context): (props: readonly string[]) => string
    }
  }

  export const isName = array.includes(names)
  export const fallback: Binary.Hook = {
    beforeAll: fn.constant(fn.identity),
    afterAll: fn.constant(fn.identity),
    beforeEach: fn.constant(pair.of),
    afterEach: fn.constant(pair.of),
    join: fn.constant(fn.flow(string.joinArray(`, `))),
  }

  export function defineHook<H extends Part<Binary.UserDefined<any, any>>>(hook?: H): Binary.Hook 
    export function defineHook(hook: Binary.UserDefined<any, any>): Binary.Hook {
    return {
      beforeAll: !hook || !(prop.beforeAll in hook)
        ? fallback[prop.beforeAll]
        : ($) => (before) => hook[prop.beforeAll]!(before, fromInternal($)),
      afterAll: !hook || !(prop.afterAll in hook)
        ? fallback[prop.afterAll]
        : ($) => (after) => hook[prop.afterAll]!(after, fromInternal($)),
      afterEach: !hook || !(prop.afterEach in hook)
        ? fallback.afterEach
        : ($) => (after, index) => hook[prop.afterEach]!(after, index, fromInternal($)),
      beforeEach: !hook || !(prop.beforeEach in hook)
        ? fallback.beforeEach
        : ($) => (before, index) => hook[prop.beforeEach]!(before, index, fromInternal($)),
      join: !hook || !(prop.join in hook)
        ? fallback[prop.join]
        : ($) => (xs) => hook[prop.join]!(xs, fromInternal($)),
    }
  }

  export function defineHooks<H extends Part<Binary.UserDefinitions>>(hooks?: H): Binary.Hooks
  export function defineHooks(hooks: Binary.UserDefinitions): Binary.Hooks {
    return fn.pipe(
      Binary.byName,
      map((key) => (hooks && tree.has(key)(hooks) ? Binary.defineHook(hooks[key]) : Binary.fallback)),
    )
  }
  export const fallbacks: Binary.Hooks = defineHooks()
}

namespace Root {
  export type casing = keyof typeof casing
  export const casing = {
    camelCase: string.camel,
    snakeCase: string.snake,
    pascalCase: string.pascal,
  }

  export const isCasing = array.includes(object.keys(casing))
  //           ^?

  export interface Hooks {
    afterAll($: Internal.Context): (after: string) => string
    afterEach($: Internal.Context): (after: string) => string
    beforeAll($: Internal.Context): (before: Schema.any | Schema.$ref) => Schema.any | Schema.$ref
    /**
     * `Hooks.canonical` lets you configure the _canonical_ name of the value you're
     * interpreting. This is similar to a "ref" from the OpenAPI/JSONSchema spec.
     *
     * Note that the _canonical name_ will match the _filename_ that is generated
     * for that schema. The _canonical name_ will also be the _named export_ that
     * that file creates.
     */
    canonical($?: Internal.Context): (identifier: string) => string
    imports($: Internal.Context): (identifier: string) => readonly string[]
    import($: Internal.Context): ({ ref, path, ext }: { ref: string; path: string, ext: string }) => string
    export($: Internal.Context): ({ ref, path, ext }: { ref: string; path: string, ext: string }) => string
    identifier($: Internal.Context): (identifier: string, body: string) => string
    banner($: Internal.Context): string
    ref: {
      before($: Internal.Context): (node: Schema.any | Schema.$ref) => Schema.any | Schema.$ref,
      after($: Internal.Context): (generated: string) => string,
    }
  }

  export type UserDefinitions = {
    /** 
     * This hook runs after the `after` or `afterAll` hook of the node finishes (if it has one).
     * There are 2 ways to think about this hook: either you can think of it as the last thing
     * that runs that is specific to that particuar node, or, and this mental model might be
     * more precise, you can think of this hooks as being the first thing we do on our way 
     * "back up" the call stack.
     */
    afterEach?(generatedOutput: string, ctx: Context): string
    afterAll?(generatedOutput: string, ctx: Context): string
    beforeAll?(before: Schema.any | Schema.$ref, ctx: Context): Schema.any | Schema.$ref
    /**
     * `UserDefinitions.canonical`
     */
    canonical?: casing | ((identifier: string, ctx: Context) => string)
    imports?: string | readonly string[] | ((identifier: string, ctx: Context) => readonly string[])
    import?: ({ ref, path, ext }: { ref: string; path: string; ext?: string }, ctx: Context) => string
    export?: ({ ref, path, ext }: { ref: string; path: string; ext?: string }, ctx: Context) => string
    identifier?: string | ((identifier: string, body: string, ctx: Context) => string)
    banner?: string | ((ctx: Context) => string)
    ref?: {
      before?: (node: Schema.any | Schema.$ref, ctx: Context) => Schema.$ref
      after?: (generated: string, ctx: Context) => string
    }
  }

  export const names = array.of(
    `afterAll`, 
    `beforeAll`, 
    `canonical`, 
    `imports`, 
    `import`, 
    `export`,
    `identifier`
  )

  export const byName = object.fromKeys(names)
  export const isName = array.includes(names)

  export const fallbacks: Root.Hooks = {
    afterAll: fn.constant(fn.identity),
    afterEach: fn.constant(fn.identity),
    beforeAll: fn.constant(fn.identity),
    canonical: fn.constant(fn.identity),
    imports: () => () => [],
    import: () => ({ ext, path, ref }) => 
      `import { ${ref} } from "./${path}${ext.startsWith(".") ? "" : "."}${ext}"`,
    export: () => ({ ext, path, ref }) => 
      `export { ${ref} } from "./${path}${ext.startsWith(".") ? "" : "."}${ext}"`,
    identifier: () => (varName, body) => `export const ${varName} = ${body}`,
    banner: () => string.newline(`
/**
 * 🚫 auto-generated file • do not edit by hand 🚫
 */`
    ),
    ref: {
      before: fn.constant(fn.identity),
      after: fn.constant(fn.identity),
    }
  }

  export const afterAll
    : (hook: UserDefinitions["afterAll"]) => Root.Hooks[`afterAll`] 
    = (hook) => hook ? ($) => (after) => hook(after, fromInternal($)) : fallbacks.afterAll

  export const afterEach
    : (hook: UserDefinitions["afterEach"]) => Root.Hooks[`afterEach`] 
    = (hook) => hook ? ($) => (after) => hook(after, fromInternal($)) : fallbacks.afterEach

  export const beforeAll
    : (hook: UserDefinitions["beforeAll"]) => Root.Hooks[`beforeAll`] 
    = (hook) => hook ? ($) => (before) => hook(before, fromInternal($)) : fallbacks.beforeAll

  export const canonical
    : (hook: UserDefinitions["canonical"]) => Root.Hooks["canonical"] 
    = (hook) => ($) => (identifier) =>
      hook
        ? Root.isCasing(hook)
          ? (Root.casing[hook] as (s: string) => string)(identifier)
          : hook(identifier, Option.toPartial($ as {}) as Context) // TODO: fix this type assertion
        : fallbacks[byName.canonical]($)(identifier)

  export const banner
    : (hook: UserDefinitions["banner"]) => Root.Hooks["banner"]
    = (hook) => core.is.defined(hook)
      ? ($) => typeof hook === "string" ? hook : hook(fromInternal($))
      : fallbacks.banner

  export const import_
    : (hook: UserDefinitions["import"]) => Root.Hooks[`import`] 
    = (hook) => hook ? ($) => (descriptor) => hook(descriptor, fromInternal($)) : fallbacks.import

  export const ref: (hook: UserDefinitions["ref"]) => Root.Hooks[`ref`] 
    = (hook) => ({
      before: hook?.before ? ($) => (node) => hook.before!(node, fromInternal($)) : fallbacks.ref.before,
      after: hook?.after ? ($) => (generated) => hook.after!(generated, fromInternal($)) : fallbacks.ref.after,
    })

  export const export_
    : (hook: UserDefinitions["export"]) => Root.Hooks["export"] 
    = (hook) => hook ? ($) => (descriptor) => hook(descriptor, fromInternal($)) : fallbacks.export

  export const imports
    : (hook: UserDefinitions["imports"]) => Root.Hooks[`imports`] 
    = (hook) => !hook ? fallbacks.imports 
      : ($) => (identifier) => core.is.function(hook) 
      ? hook(identifier, fromInternal($)) 
      : core.is.string(hook) ? [hook] : hook

  export const identifier
    : (hook: UserDefinitions["identifier"]) => Root.Hooks[`identifier`] 
    = (hook) => ($) => (identifier, body) => 
      !hook ? fallbacks.identifier($)(identifier, body)
      : core.is.string(hook) ? hook : hook(identifier, body, fromInternal($))

  export function defineHooks<H extends Part<Root.UserDefinitions>>(hooks?: H): Root.Hooks
  export function defineHooks(userland: Part<Root.UserDefinitions>): Root.Hooks {
    return {
      beforeAll: beforeAll(userland.beforeAll),
      afterAll: afterAll(userland.afterAll),
      afterEach: afterEach(userland.afterEach),
      banner: banner(userland.banner),
      imports: imports(userland.imports),
      import: import_(userland.import),
      export: export_(userland.export),
      canonical: canonical(userland.canonical),
      identifier: identifier(userland.identifier),
      ref: ref(userland.ref),
    }
  }
}

export const fallbacks: Hooks = {
  afterEach: fn.constant(fn.identity),
  afterAll: fn.constant(fn.identity),
  beforeAll: fn.constant(fn.identity),
  canonical: fn.constant(fn.identity),
  imports: fn.constant(() => []),
  ref: {
    before: fn.constant(fn.identity),
    after: fn.constant(fn.identity),
  },
  import: () => ({ ext, path, ref }) => `import { ${ref} } from "./${path}${ext.startsWith(".") ? "" : "."}${ext}"`,
  export: () => ({ ext, path, ref }) => `export { ${ref} } from "./${path}${ext.startsWith(".") ? "" : "."}${ext}"`,
  identifier: () => (varName, body) => `export const ${varName} = ${body}`, banner: () => string.newline(`
/**
 * 🚫 auto-generated file • do not edit by hand 🚫
 */`
  ),
  ...Nullary.fallbacks,
  ...Unary.fallbacks,
  ...Binary.fallbacks,
}

function defineHooks(hooks?: Partial<UserDefinitions>) {
  return !hooks ? fallbacks : { 
    ...Nullary.defineHooks(object.pick(hooks, ...object.keys(Nullary.byName))),
    ...Unary.defineHooks(object.pick(hooks, ...object.keys(Unary.byName))),
    ...Binary.defineHooks(object.pick(hooks, ...object.keys(Binary.byName))), 
    ...Root.defineHooks(object.pick(hooks, ...object.keys(Root.byName))),
  } satisfies Hooks
}
