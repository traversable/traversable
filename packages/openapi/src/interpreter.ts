import type { Partial, any, id } from "any-ts"

import { core, tree } from "@traversable/core"
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
import { symbol } from "@traversable/registry"

import { Schema } from "./schema.js"

export {
  type Binary,
  type Codegen,
  type CompilationTarget,
  type Continuation,
  type Hooks,
  type Nullary,
  type PropsContext,
  type Unary,
  type UserDefined,
  type UserDefinitions,
  Context,
  defineHooks,
  fromHooks,
  fromAST,
}

type CompilationTarget = never | 
  { refs: { [x: string]: string }, out: string }

declare namespace Codegen {
  export interface Tasks extends any.dict<UserDefinitions> {}
  export {
    CompilationTarget,
    UserDefined,
    Hooks,
  }
}

interface Refs { [x: string]: Schema.any }

export declare namespace define {
  interface Options {
    refs?: Refs
  }
}

export function define<const T extends UserDefined>(definitions: T): [T, { refs: {} }]
export function define<const T extends UserDefined>(definitions: T, opts: define.Options): [T, refs: { [x: string]: Schema.any }]
export function define<const T extends UserDefined>(definitions: T, opts?: define.Options): [T, { refs: { [K in string]+?: Schema.any }}]
export function define<const T extends UserDefined>(
  definitions: T, 
  { refs = define.defaults.refs }: define.Options = define.defaults
) { return [definitions, { refs }] }

define.defaults = {
  refs: {},
} as const satisfies Required<define.Options>

interface UserDefined extends UserDefinitions {}
type UserDefinitions = evaluate<
  Root.UserDefinitions & Nullary.UserDefinitions & Unary.UserDefinitions & Binary.UserDefinitions
>

interface Hooks extends Root.Hooks, Nullary.Hooks, Unary.Hooks, Binary.Hooks {}

type evaluate<type> = never | { [k in keyof type]: type[k] }

type Continuation = (node: Schema.any) => string
type Continuation_ = (args: readonly [node: Schema.any, context: Context]) => string

interface PropsContext extends Context {
  requiredProps: readonly string[]
  readonlyProps: readonly string[]
}

const isNonBoolean = (node: Schema.any): node is globalThis.Exclude<typeof node, boolean> => typeof node !== "boolean"

export const applyBaseContext
  : <T extends { [x: string]: unknown }>(node: (Schema.any), xf: (prev: T) => T) => (prev: Context<T>) => Context<T>
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

const parseOptionality 
  : (node: Schema.ObjectNode) => ($: Context) => Option<readonly string[]>
  = (node) => ($) => {
    const zero: string[] = []
    switch($.optionality) {
      case "opt-in": return Option.fromNullable(node.required) satisfies Option<readonly string[]>
      case "opt-out": return Option.some(node.required ?? zero) satisfies Option<readonly string[]>
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
  : (context: Context.object) => Option<readonly string[]>
  = ($: Context.object) => {
    if (Option.isNone($.required)) return Option.none()
    else if (Option.isSome($.required)) return fn.pipe(
      $.required,
      Option.guard(core.is.array(core.is.string)),
    )
    else return fn.exhaustive($.required)
  }

const parseExample
  : <T extends any.nonnullable>(guard?: (u: unknown) => u is T) => (node: unknown) => Option<T>
  = (guard = core.is.nonnullable as never) => fn.flow(
    Option.guard(tree.has("example", guard)),
    Option.map(object.get.defer("example"))
  )

export type Autocomplete<T> = T | (string & {})

export interface Context_string<
  T extends 
  | { [x: string]: unknown } 
  = { [x: string]: unknown }
> extends Context<T> { 
  example: Option<string>,  
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
  format: Autocomplete<"date" | "date-time" | "password" | "byte" | "binary">
}

export interface Context_oneOf<T extends { [x: string]: unknown } = { [x: string]: unknown }> extends Context<T> {}
export interface Context_allOf<T extends { [x: string]: unknown } = { [x: string]: unknown }> extends Context<T> {}
export interface Context_anyOf<T extends { [x: string]: unknown } = { [x: string]: unknown }> extends Context<T> {}
export interface Context_object<T extends { [x: string]: unknown } = { [x: string]: unknown }, U = unknown> extends 
  Context<T>, 
  id<{ required: Option<readonly string[]>, }> 
  { example: Option<unknown>, additionalProperties: Option<string> }
export interface Context_array<T extends { [x: string]: unknown } = { [x: string]: unknown }> extends 
  Context<T>, 
  globalThis.Pick<Schema.ArrayNode, "minItems" | "maxItems"> 
  { example: Option<readonly unknown[]> }
export interface Context_tuple<T extends { [x: string]: unknown } = { [x: string]: unknown }> extends 
  Context<T> 
  { example: Option<readonly unknown[]> }
export interface Context_ref<T extends { [x: string]: unknown } = { [x: string]: unknown }> extends 
  Context<T> 
  { example: Option<unknown> }
export interface Context_integer<T extends { [x: string]: unknown } = { [x: string]: unknown }> extends 
  Context<T>, 
  globalThis.Pick<Schema.IntegerNode, "minimum" | "maximum" | "exclusiveMaximum" | "exclusiveMinimum" | "format"> 
  { example: Option<number> }
export interface Context_number<T extends { [x: string]: unknown } = { [x: string]: unknown }> extends 
  Context_integer<T>, 
  globalThis.Pick<Schema.NumberNode, "multipleOf"> 
  { example: Option<number> }
export interface Context_record<T extends Schema.any = Schema.any> extends 
  Context<T> 
  { example: Option<{ [x: string]: unknown }> }

interface Context<T = {}> {
  moduleName: string
  schemaName: string
  optionality: "opt-in" | "opt-out"
  rootSchemaName: null | string
  document: Schema.any
  fileExtension: string
  isReadonly: boolean
  isRequired: boolean
  isNullable: boolean
  focusPath: readonly string[]
  hooks: Hooks
  barrelFile: null | string
  path: readonly (key.any)[]
  dependencies: readonly string[]
  description: Option<string>
  example: Option<unknown>
  locals: Option<globalThis.Pick<Context, "example" | "description">>
  userDefined: T
}


declare namespace Context {
  export { type PropsContext as Props }
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
    & globalThis.Partial<Context<T>>
  )
}

namespace Context {
  export const initializer 
  : <T extends { [x: string]: unknown }>(partial: Context.Partial<T>) => Context<T>
  = (partial) => globalThis.Object.assign({ 
      barrelFile: partial.barrelFile ?? null,
      dependencies: partial.dependencies ?? [],
      description: partial.description ?? Option.none(),
      example: partial.example ?? Option.none(),
      fileExtension: partial.fileExtension ?? "",
      focusPath: partial.focusPath ?? ["components", "schemas"],
      isNullable: partial.isNullable ?? false,
      isReadonly: partial.isReadonly ?? false,
      isRequired: partial.isRequired ?? (partial.optionality === "opt-in"),
      locals: partial.locals ?? Option.none(),
      optionality: partial.optionality ?? "opt-in",
      path: partial.path ?? [],
      rootSchemaName: null,
      userDefined: partial.userDefined ?? {} as never,
    } as const, { 
      document: partial.document, 
      hooks: partial.hooks, 
      moduleName: partial.moduleName,
      schemaName: partial.schemaName,
    })

  export const handleObject 
    : <T extends { [x: string]: unknown }>(node: Schema.ObjectNode, loop: Continuation_, xf?: (prev: T) => T) => (prev: Context<T>) => Context.object<T>
    = (node, loop, xf = fn.identity) => (prev) => {
      const additionalProperties = fn.pipe(
        Option.fromNullable(node.additionalProperties),
        Option.map((additional) => loop([additional, prev]))
      )

      return fn.pipe(
        prev,
        applyBaseContext(node, xf),
        object.intersect.defer({
          additionalProperties,
          required: parseOptionality(node)(prev),
          example: parseExample(core.is.object.any)(node),
        }),
      )
    }

  /** TODO: rename to `handleArrayItems`? */
  export const handleArray
    : <T extends { [x: string]: unknown }>(node: Schema.ArrayNode, xf?: (prev: T) => T) => (prev: Context<T>) => Context.array<T>
    = (node, xf = fn.identity) => (prev) => {
      const { items } = node
      return {
        ...prev,
        path: [...prev.path, symbol.number],
        /** Example is for the parent node (the array itself, not the `items` node) */
        example: parseExample(core.is.array.any)(node),
        userDefined: xf(prev.userDefined),
        isRequired: "required" in prev && Option.is(prev.required) && Option.isNone(prev.required),
        isNullable: normalizeNullability(items),
        minItems: node.minItems,
        maxItems: node.maxItems,
      }
    }

  export const handleTuple
    : <T extends { [x: string]: unknown }>(node: Schema.TupleNode, xf?: (prev: T) => T) => (prev: Context<T>) => Context.tuple<T>
    = (node, xf = fn.identity) => (prev) => fn.pipe(
      prev,
      applyBaseContext(node, xf),
      object.intersect.defer({
        example: parseExample(core.is.array.any)(node),
        minItems: node.minItems,
        maxItems: node.maxItems,
      }),
    )


  export const handleIndex
    : <T extends { [x: string]: unknown }>(prev: Context<T>, node: Schema.any) => (index: prop.any, xf?: (prev: T) => T) => Context<T>
    = (prev, node) => 
      (index, xf = fn.identity) => {
        const opt = matchOptionality({ 
          isNullable: normalizeNullability(node), 
          isRequired: prev.isRequired,
        })
        
        return fn.pipe(
          prev,
          applyBaseContext(node, xf),
          object.intersect.defer({
            path: [...prev.path, index, ...opt],
          })
        )
      }

  export const handleRefProperty
    : <T extends { [x: string]: unknown }>(prev: Context.object<T>) => (node: Schema.$ref, key: string, xf?: (prev: T) => T) => Context<T>
    = (prev) => 
      (node, key, xf = fn.identity) => {
        const prefix = `#/${prev.focusPath.join("/")}/` as const
        const dereferenced = fn.pipe(
          node.$ref,
          Option.guard((n) => n?.startsWith(prefix)),
          Option.map(($ref) => [...prev.focusPath, ...$ref.substring(prefix.length).split("/")]),
          Option.flatMap(
            (path) => 
              tree.has(...path)(prev.document) 
              ? Option.some(tree.get(prev.document, ...path) as never)
              : Option.none()
          ),
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
            Option.map(object.get.defer("nullable")),
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
        applyBaseContext(node, xf),
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
    : <T extends { [x: string]: unknown }>(prev: Context.object<T>) => (node: Schema.any, key: string, xf?: (prev: T) => T) => Context<T>
    = (prev) => 
      (node, key, xf = fn.identity) => {

        if(Schema.is.ref(node)) return handleRefProperty(prev)(node, key, xf)
        else {
          const isNullable = normalizeNullability(node)
          const isRequired = fn.pipe(
            normalizeOptionality(prev),
            Option.map((xs) => xs.includes(key)),
            Option.getOrElse(() => true),
          )
          const optionality = matchOptionality({
            isNullable: normalizeNullability(node),
            isRequired: fn.pipe(
              normalizeOptionality(prev),
              Option.map((xs) => xs.includes(key)),
              Option.getOrElse(() => true),
            )
          })

          return fn.pipe(
            prev,
            applyBaseContext(node, xf),
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
    : <T extends { [x: string]: unknown }>
      (node: Schema.StringNode, xf?: (prev: T) => T) 
      => (prev: Context<T>) 
      => Context.string<T>
    = (node, xf = fn.identity) => (prev) => {
      const optionality = matchOptionality({ 
        isNullable: normalizeNullability(node), 
        isRequired: prev.isRequired,
      })

      return fn.pipe(
        prev,
        applyBaseContext(node, xf),
        object.intersect.defer({
          path: [...prev.path, ...optionality],
          format: node.format ?? "string",
          example: parseExample(core.is.string)(node),
        }),
      )
    }
  
  export const handleInteger
    : <T extends { [x: string]: unknown }>
      (node: Schema.IntegerNode, xf?: (prev: T) => T) 
      => (prev: Context<T>) 
      => Context.integer<T>
    = (node, xf = fn.identity) => (prev) => fn.pipe(
      prev,
      applyBaseContext(node, xf),
      object.intersect.defer({
        example: parseExample(core.is.number)(node),
        format: node.format,
        maximum: node.maximum,
        minimum: node.minimum,
        exclusiveMaximum: node.exclusiveMaximum,
        exclusiveMinimum: node.exclusiveMinimum,
      }),
    )

  export const handleNumber 
    : <T extends { [x: string]: unknown }>
      (node: Schema.NumberNode, xf?: (prev: T) => T) 
      => (prev: Context<T>) 
      => Context.number<T>
    = (node, xf = fn.identity) => (prev) => fn.pipe(
      prev,
      applyBaseContext(node, xf),
      object.intersect.defer({
        example: parseExample(core.is.number)(node),
        format: node.format,
        maximum: node.maximum,
        minimum: node.minimum,
        exclusiveMaximum: node.exclusiveMaximum,
        exclusiveMinimum: node.exclusiveMinimum,
        multipleOf: node.multipleOf,
      }),
    )
      
  export const handleRef 
    : <T extends { [x: string]: unknown }>
      (node: Schema.$ref, xf?: (prev: T) => T) 
      => (prev: Context<T>) 
      => Context.ref<T>
    = (node, xf = fn.identity) => (prev) => {
      return fn.pipe(
        prev,
        applyBaseContext(node, xf),
        object.intersect.defer({
          example: parseExample()(node),
        }),
      )
    }

  export const handleOneOf 
    : <T extends { [x: string]: unknown }>
      (prev: Context<T>, node: Schema.OneOf) 
      => (pos: prop.any, xf?: (prev: T) => T) 
      => Context.oneOf<T>
    = (prev, node) => (pos, xf = fn.identity) => {
      const nextSegment = `⊔${pos}` as const
      return fn.pipe(
        prev,
        applyBaseContext(node, xf),
        object.intersect.defer({
          example: parseExample()(node),
          path: [...prev.path, nextSegment],
        })
      )
    }

  export const handleAnyOf 
    : <T extends { [x: string]: unknown }>
      (prev: Context<T>, node: Schema.AnyOf) 
      => (pos: prop.any, xf?: (prev: T) => T) 
      => Context.anyOf<T>
    = (prev, node) => (pos, xf = fn.identity) => {
      const nextSegment = `∪${pos}` as const
      return fn.pipe(
        prev,
        applyBaseContext(node, xf),
        object.intersect.defer({
          example: parseExample()(node),
          path: [...prev.path, nextSegment],
        }),
      )
    }

  export const handleAllOf 
    : <T extends { [x: string]: unknown }>
      (prev: Context<T>, node: Schema.AllOf) 
      => (pos: prop.any, xf?: (prev: T) => T) 
      => Context.allOf<T>
    = (prev, node) => (pos, xf = fn.identity) => {
      const nextSegment = `∩${pos}` as const 
      return fn.pipe(
        prev,
        applyBaseContext(node, xf),
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
  : (ctx: Context) => (refNode: unknown) => string 
  = (ctx) => (refNode) => {
    if (!hasRef(refNode)) throw Error(`\`parseRef\` received a node that did not have a string property called "$ref"`)
    const focus = "#/".concat(ctx.focusPath.join("/")).concat("/")
    return refNode.$ref.slice(focus.length)
  }

const deref 
  : (prev: Context, loop: Continuation_) => (refs: { [x: string]: string }) => (node: Schema.$ref) => string
  = (prev, loop) => 
    ($refs) => 
    (node) => {
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
            applyBaseContext(dereferenced, fn.identity),
            object.intersect.defer({
              path: [ ...prev.path],
              // path: [ ...prev.path, ...optionalitySegments],
            }),
          )

          const value = fn.pipe(
            dereferenced,
            prev.hooks.ref.before(next),
            (n) => fn.pipe(
              loop([n, next]),
              /** TODO: figure out why running this hook breaks Faker codegen */
              // prev.hooks.ref.after(Context.handleRef(prev, node)()),
            ),
          ) satisfies string
          return ($refs[$ref] = value, value)
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
    beforeEach(ctx: Context) { 
      return (prop: Schema.any, key: string) => { 
        return [prop, object.parseKey(key)] satisfies [Schema.any, string] 
      }
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
  = (schemaName, hooks, moduleName) => (document) =>
    fromAST(Context.initializer({ moduleName, schemaName, hooks, document }))(document)

export interface InlineParams {
  hooks: UserDefined
  moduleName: string
  schemaName?: string
}
export const inline 
  : (params: InlineParams) 
    => (schema: Schema.any, root?: Schema.any) 
    => CompilationTarget
  = ({ hooks, moduleName, schemaName = "inline" }) => (schema, root = schema) => fromAST(
    Context.initializer({ 
      moduleName,
      schemaName,
      hooks: defineHooks(hooks),
      document: root,
    }))(schema)
 
const fromAST
  : (ctx: Context) => (root: Schema.any) => CompilationTarget 
  = (ctx) => {
    const { hooks: userHook } = ctx
    const context = {
      ...ctx,
      isReadonly: ctx.isReadonly ?? false,
      isRequired: ctx.isRequired ?? true,
      schemaName: userHook.canonical(ctx)(ctx.schemaName),
    }

    const refs: { [x: string]: string } = {}
    const loop = fn.loop<readonly [node: Schema.any, ctx: Context], string>(([node, prev], loop) => {
      switch (true) {
        /** make sure we have the node in-hand before we begin pattern matching */
        case Schema.is.ref(node): return deref(prev, loop)(refs)(node)

        /** 
         * - [ ] TODO: add support for enum nodes
         * @example
         * case Schema.is.enum(node): {
         *   const next = prev
         *   return fn.pipe(
         *     node.enum,
         *     userHook.enum.beforeAll(prev),
         *     map(
         *       fn.flow(
         *         // userHook.enum.beforeEach
         *         (json, ix) => userHook.enum.afterEach(next)(`${json}`, `${ix}`),
         *         ([v]) => v,
         *       )
         *     ),
         *     userHook.enum.join(next),
         *     userHook.enum.afterAll(next),
         *     // userHook.afterEach(next),
         *   )
         * }
         */

        case Schema.is.const(node): {
          const next = prev
          return fn.pipe(
            node.const,
            (v) => (string.is(v) ? `"${v}"` : `${v}`),
            userHook.const.before(next),
            globalThis.String,
            userHook.const.after(next),
            userHook.afterEach(next),
          )
        }

        case Schema.is.string(node): {
          const next = Context.handleString(node)(prev)
          return fn.pipe(
            userHook.string(next).value,
            userHook.afterEach(next),
          )
        }
        case Schema.is.number(node): {
          const next = Context.handleNumber(node)(prev)
          return fn.pipe(
            userHook.number(next).value,
            userHook.afterEach(next),
          )
        }
        case Schema.is.boolean(node): {
          const next = prev
          return fn.pipe(
            userHook.boolean(next).value,
            userHook.afterEach(next),
          )
        }
        case Schema.is.integer(node): {
          const next = Context.handleInteger(node)(prev)
          return fn.pipe(
            userHook.integer(next).value,
            userHook.afterEach(next),
          )
        }
        case Schema.is.null(node): {
          const next = prev
          return fn.pipe(
            userHook.null(next).value,
            // userHook.afterEach(next),
          )
        }

        /** 
         * - [ ] TODO: first-class support for records
         * @example
         * case Schema.is.record(node): {
         *   const next = Context.handleRecord(node)(prev)
         *   return fn.pipe(
         *     node.additionalProperties,
         *     userHook.record.before(prev),
         *     (n) => loop([n, next]),
         *     userHook.record.after(prev),
         *     userHook.afterEach(next),
         *   )
         * }
         */

        /** 
         * - [ ] TODO: do we need to keep supporting this?
         * @example
         * case isAnyObjectNode(node): {
         *   const next = prev
         *   return fn.pipe(
         *     userHook.anyObject(next).value,
         *     userHook.afterEach(next),
         *   )
         * }
         */

        case Schema.is.array(node): {
          const next = Context.handleArray(node)(prev)
          return fn.pipe(
            node.items, 
            userHook.array.before(prev), 
            (n) => loop([n, next]), 
            userHook.array.after(prev),
            userHook.afterEach(prev),
          )
        }

        case Schema.is.tuple(node): {
          const tupleContext = Context.handleTuple(node)(prev)
          const next = Context.handleIndex(tupleContext, node)
          return fn.pipe(
            node.prefixItems,
            userHook.tuple.beforeAll(tupleContext),
            map(
              fn.flow(
                (node, ix) => userHook.tuple.beforeEach(next(ix))(node, ix),
                ([node, ix]) => pair.of(loop([node, next(ix)]), globalThis.String(ix)),
                ([node, ix]) => userHook.tuple.afterEach(next(ix))(node, ix),
                ([node, _]) => node,
              ),
            ),
            userHook.tuple.join(prev),
            userHook.tuple.afterAll(prev),
            /** 
             * **NOTE:** This hook runs here, instead of inside the `map` call above, because
             * calling it inside the map "distributes" the hook over each member of the union. 
             * 
             * This goes against the grain of OpenAPI's semantics, which allows
             * users to apply fields (like `nullable`) to the composite itself.
             * 
             * If you want to run something after every node in the tuple), use 
             * `hooks.tuple.afterEach` instead of `hooks.afterEach`.
             */
            userHook.afterEach(prev),
          )
        }

        case Schema.is.anyOf(node): {
          const next = Context.handleAnyOf(prev, node)
          return fn.pipe(
            node.anyOf,
            userHook.anyOf.beforeAll(prev),
            map(
              fn.flow(
                userHook.anyOf.beforeEach(prev),
                ([node, ix]) => pair.of(loop([node, next(ix)]), globalThis.String(ix)),
                ([node, ix]) => userHook.anyOf.afterEach(next(ix))(node, ix),
                ([node, _x]) => node,
              ),
            ),
            userHook.anyOf.join(prev),
            userHook.anyOf.afterAll(prev),
            userHook.afterEach(prev),
          )
        }

        // case Schema.is.record(node): {
        //   const next = Context.handleRecord(node)(prev)
        //   return fn.pipe(
        //     node.additionalProperties,
        //     userHook.record.before(prev),
        //     (n) => loop([n, next]),
        //     userHook.record.after(prev),
        //     userHook.afterEach(next),
        //   )
        // }

        case Schema.is.oneOf(node): {
          const next = Context.handleOneOf(prev, node)
          return (
            fn.pipe(
              node.oneOf,
              userHook.oneOf.beforeAll(prev),
              map(
                fn.flow(
                  (x, ix) => { return userHook.oneOf.beforeEach(prev)(x, ix) },
                  ([node, ix]) => [loop([node, next(ix)]), ix + ""] satisfies [string, string],
                  ([node, ix]) => userHook.oneOf.afterEach(next(ix))(node, ix),
                  ([node, _x]) => node,
                ),
              ),
              userHook.oneOf.join(prev),
              userHook.oneOf.afterAll(prev),
              userHook.afterEach(prev),
            )
          )
        }

        case Schema.is.allOf(node): {
          const next = Context.handleAllOf(prev, node)
          return (
              fn.pipe(
                node.allOf,
                userHook.allOf.beforeAll(prev),
                map(
                  fn.flow(
                    userHook.allOf.beforeEach(prev),
                    ([node, ix]) => pair.of(loop([node, next(ix)]), globalThis.String(ix)),
                    ([node, ix]) => userHook.allOf.afterEach(next(ix))(node, ix),
                    ([node, _x]) => node,
                  ),
                ),
                userHook.allOf.join(prev),
                userHook.allOf.afterAll(prev),
                userHook.afterEach(prev),
              )
            )
          }

        case Schema.is.object(node): {
          const objectContext = Context.handleObject(node, loop)(prev)
          const beforeEach = (n: Schema.any, k: prop.any) => [n, object.parseKey(k)] as const
          return fn.pipe(
            node.properties,
            userHook.object.beforeAll(objectContext),
            map(
              fn.flow(
                beforeEach,
                ([childNode, childKey]) => {
                  const propertyContext = Context.handleProperty(objectContext)(childNode, childKey)

                  return fn.pipe(
                    builtins.object.beforeEach(objectContext)(childNode, childKey),
                    ([n, k]) => userHook.object.beforeEach(objectContext)(n, k),
                    ([n, k]) => pair.of(loop([n, propertyContext]), k),
                    ([s, k]) => userHook.object.afterEach(propertyContext)(s, k),
                    ([s, k]) => s.concat(k),
                  )
                }
              )
            ),
            object.values,
            userHook.object.join(objectContext),
            userHook.object.afterAll(objectContext),
            userHook.afterEach(prev),
          )
        }

        case Schema.is.object(node) && globalThis.Object.keys(node).length > 0: {
          const next = prev
          return fn.pipe(
            userHook.emptyObject(next).value,
            userHook.afterEach(next),
          )
        }

        default: return fn.exhaustive(node)
      }
    })

    return fn.flow(
      userHook.beforeAll(context), 
      (n) => loop([n, context]), 
      userHook.afterAll(context), 
      interpreted(refs)
    )
}

declare namespace Nullary {
  type UserDefined = ((context: Context) => string) | string
  type Hook = (context: Context) => { value: string }
  type StringHook = (context: Context.string) => { value: string }
  type NumberHook = (context: Context.number) => { value: string }
  type IntegerHook = (context: Context.integer) => { value: string }
  type UserDefinedStringHook = ((context: Context.string) => string) | string
  type UserDefinedNumberHook = ((context: Context.number) => string) | string
  type UserDefinedIntegerHook = ((context: Context.integer) => string) | string
  type UserDefinitions = {
    string: UserDefinedStringHook
    number: UserDefinedNumberHook
    integer: UserDefinedIntegerHook
    boolean: Nullary.UserDefined
    null: Nullary.UserDefined
    anyArray: Nullary.UserDefined
    anyObject: Nullary.UserDefined
    emptyObject: Nullary.UserDefined
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
    ////////////////////////////
    /// terminal nodes
    anyArray: Hook
    anyObject: Hook
    emptyObject: Hook
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

  export function defineHooks<H extends globalThis.Partial<Nullary.UserDefinitions>>(hooks?: H): Nullary.Hooks {
    return fn.pipe(
      Nullary.byName, 
      object.transform.defer({
        string: () => ((context: Context.string) => ({ value: core.is.function(hooks?.string) ? hooks.string(context) : hooks?.string ?? "" })),
        number: () => ((context: Context.number) => ({ value: core.is.function(hooks?.number) ? hooks.number(context) : hooks?.number ?? "" })),
        integer: () => ((context: Context.integer) => ({ value: core.is.function(hooks?.integer) ? hooks.integer(context) : hooks?.integer ?? "" })),
        boolean: () => ((context: Context) => ({ value: core.is.function(hooks?.boolean) ? hooks.boolean(context) : hooks?.boolean ?? "" })),
        anyArray: () => ((context: Context) => ({ value: core.is.function(hooks?.anyArray) ? hooks.anyArray(context) : hooks?.anyArray ?? "" })),
        anyObject: () => ((context: Context) => ({ value: core.is.function(hooks?.anyObject) ? hooks.anyObject(context) : hooks?.anyObject ?? "" })),
        emptyObject: () => ((context: Context) => ({ value: core.is.function(hooks?.emptyObject) ? hooks.emptyObject(context) : hooks?.emptyObject ?? "" })),
        /** @deprecated - use `nullable` on {@link Context `Context`} instead */
        null: () => ((context: Context) => ({ value: core.is.function(hooks?.null) ? hooks.null(context) : hooks?.null ?? "" })),
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
      before(context: Context): (node: Schema.any) => Schema.any
      after(context: Context): (node: string) => string
    }
    const: {
      before(context: Context): (node: any.literal) => any.literal
      after(context: Context): (node: string) => string
    }
    record: {
      before(context: Context): (node: Schema.any) => Schema.any
      after(context: Context): (node: string) => string
    }
  }

  export function defineHooks(hooks?: globalThis.Partial<Unary.UserDefinitions>): Unary.Hooks {
    return fn.pipe(
      Unary.byName,
      object.transform.defer({
        array: () => ({ 
          before: (context: Context.array) => (node: Schema.any) => tree.has("before", core.is.function)(hooks?.array) ? hooks.array.before(node, context) : node, 
          after: (context: Context.array) => (node: string) => tree.has("after", core.is.function)(hooks?.array) ? hooks.array.after(node, context) : node,
        }),
        const: () => ({
          before: (context: Context) => (node: any.literal) => tree.has("before", core.is.function)(hooks?.const) ? hooks.const.before(node, context) : node,
          after: (context: Context) => (node: string) => tree.has("after", core.is.function)(hooks?.const) ? hooks.const.after(node, context) : node
        }),
        record: () => ({
          before: (context: Context.record) => (node: Schema.any) => tree.has("before", core.is.function)(hooks?.record) ? hooks.record.before(node, context) : node,
          after: (context: Context.record) => (node: string) => tree.has("after", core.is.function)(hooks?.record) ? hooks.record.after(node, context) : node
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
      beforeAll?(properties: readonly Schema.any[], context: Context.tuple): readonly Schema.any[]
      beforeEach?(item: Schema.any, itemIndex: number, context: Context.tuple): readonly [item: Schema.any, itemIndex: number]
      afterEach?(item: string, itemIndex: string, context: Context.tuple): readonly [item: string, itemIndex: string]
      join?(items: readonly string[], context: Context.tuple): string
      afterAll?(generated: string, context: Context.tuple): string
    }
    object?: {
      beforeAll?(properties: { [x: string]: Schema.any }, context: Context.object): { [x: string]: Schema.any }
      beforeEach?(property: Schema.any, propertyKey: string, context: Context.object): readonly [property: Schema.any, propertyKey: string]
      afterEach?(property: string, propertyKey: string, context: Context.object): readonly [key: string, value: string]
      join?(properties: readonly string[], context: Context.object): string
      afterAll?(generated: string, context: Context.object): string
    }
    enum?: UserDefined<any.json[], any>
  }
  export interface Hook {
    beforeAll(context: Context): <T>(before: T) => T
    afterAll(context: Context): (after: string) => string
    beforeEach(context: Context): <Ix extends key.any>(before: Schema.any, prop: Ix) => readonly [before: Schema.any, prop: Ix]
    afterEach(context: Context): (after: string, prop: string) => readonly [after: string, prop: string]
    join(context: Context): (xs: readonly string[]) => string
  }
  export type UserDefined<T, Ix extends key.any> = {
    beforeAll?(nodes: T, ctx: Context): T
    beforeEach?(node: Schema.any, index: Ix, context: Context): [before: Schema.any, index: Ix]
    afterEach?(generated: string, key: string, context: Context): [key: string, value: string]
    join?(generated: readonly string[], context: Context): string
    afterAll?(after: string, context: Context): string
  }
  export interface Hooks {
    allOf: Binary.Hook
    anyOf: Binary.Hook
    oneOf: Binary.Hook
    tuple: {
      beforeAll(ctx: Context.tuple): (before: readonly Schema.any[]) => Schema.any[]
      afterAll(ctx: Context): (after: string) => string
      beforeEach(ctx: Context): (item: Schema.any, itemIndex: number) => [item: Schema.any, index: number]
      afterEach(ctx: Context): (item: string, itemIndex: string) => [item: string, index: string]
      join(ctx: Context): (items: readonly string[]) => string
    }
    // Binary.Hook
    object: {
      beforeAll(ctx: Context.object): (before: { [x: string]: Schema.any }) => { [x: string]: Schema.any }
      afterAll(ctx: Context): (after: string) => string
      beforeEach(ctx: Context): (prop: Schema.any, key: string) => [prop: Schema.any, key: string]
      afterEach(ctx: Context): (prop: string, key: string) => [prop: string, key: string]
      join(context: Context): (props: readonly string[]) => string
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

  export function defineHook<H extends globalThis.Partial<Binary.UserDefined<any, any>>>(
    hook?: H,
  ): Binary.Hook
  export function defineHook(hook: Binary.UserDefined<any, any>): Binary.Hook {
    return {
      beforeAll:
        !hook || !(prop.beforeAll in hook)
          ? fallback[prop.beforeAll]
          : (context) => (before) => hook[prop.beforeAll]!(before, context),
      afterAll:
        !hook || !(prop.afterAll in hook)
          ? fallback[prop.afterAll]
          : (context) => (after) => hook[prop.afterAll]!(after, context),
      afterEach:
        !hook || !(prop.afterEach in hook)
          ? fallback.afterEach
          : (context) => (after, index) => hook[prop.afterEach]!(after, index, context),
      beforeEach:
        !hook || !(prop.beforeEach in hook)
          ? fallback.beforeEach
          : (context) => (before, index) => hook[prop.beforeEach]!(before, index, context),
      join:
        !hook || !(prop.join in hook)
          ? fallback[prop.join]
          : (context) => (xs) => hook[prop.join]!(xs, context),
    }
  }

  export function defineHooks<H extends globalThis.Partial<Binary.UserDefinitions>>(hooks?: H): Binary.Hooks
  export function defineHooks(hooks: Binary.UserDefinitions): Binary.Hooks {
    return fn.pipe(
      Binary.byName,
      map((key) => (hooks && tree.has(key)(hooks) ? Binary.defineHook(hooks[key]) : Binary.fallback)),
    ) as never
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
    afterAll(context: Context): (after: string) => string
    afterEach(context: Context): (after: string) => string
    beforeAll(context: Context): (before: Schema.any) => Schema.any
    /**
     * `Hooks.canonical` lets you configure the _canonical_ name of the value you're
     * interpreting. This is similar to a "ref" from the OpenAPI/JSONSchema spec.
     *
     * Note that the _canonical name_ will match the _filename_ that is generated
     * for that schema. The _canonical name_ will also be the _named export_ that
     * that file creates.
     */
    canonical(context?: Context): (identifier: string) => string
    imports(context: Context): (identifier: string) => readonly string[]
    import(context: Context): ({ ref, path, ext }: { ref: string; path: string, ext: string }) => string
    export(context: Context): ({ ref, path, ext }: { ref: string; path: string, ext: string }) => string
    identifier(context: Context): (identifier: string, body: string) => string
    banner(context: Context): string
    ref: {
      before(context: Context): (node: Schema.any) => Schema.any,
      after(context: Context): (generated: string) => string,
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
    afterEach?(generatedOutput: string, context: Context): string
    afterAll?(generatedOutput: string, context: Context): string
    beforeAll?(before: Schema.any, context: Context): Schema.any
    /**
     * `UserDefinitions.canonical`
     */
    canonical?: casing | ((identifier: string, context: Context) => string)
    imports?: string | readonly string[] | ((identifier: string, context: Context) => readonly string[])
    import?: ({ ref, path, ext }: { ref: string; path: string; ext?: string }, context: Context) => string
    export?: ({ ref, path, ext }: { ref: string; path: string; ext?: string }, context: Context) => string
    identifier?: string | ((identifier: string, body: string, context: Context) => string)
    banner?: string | ((context: Context) => string)
    ref?: {
      before?: (node: Schema.any, context: Context) => Schema.$ref
      after?: (generated: string, context: Context) => string
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

  export const afterAll: (hook: UserDefinitions["afterAll"]) => Root.Hooks[`afterAll`] = (hook) =>
    hook ? (context) => (after) => hook(after, context) : fallbacks.afterAll

  export const afterEach
    : (hook: UserDefinitions["afterEach"]) => Root.Hooks[`afterEach`] 
    = (hook) => hook ? (context) => (after) => hook(after, context) : fallbacks.afterEach

  export const beforeAll: (hook: UserDefinitions["beforeAll"]) => Root.Hooks[`beforeAll`] = (hook) =>
    hook ? (context) => (before) => hook(before, context) : fallbacks.beforeAll

  export const canonical
    : (hook: UserDefinitions["canonical"]) => Root.Hooks["canonical"] 
    = (hook) => (context) => (identifier) =>
      hook
        ? Root.isCasing(hook)
          ? (Root.casing[hook] as (s: string) => string)(identifier)
          : hook(identifier, context as Context) // TODO: fix this type assertion
        : fallbacks[byName.canonical](context)(identifier)

  export const banner
    : (hook: UserDefinitions["banner"]) => Root.Hooks["banner"]
    = (hook) => core.is.defined(hook)
      ? (context) => typeof hook === "string" ? hook : hook(context)
      : fallbacks.banner

  export const import_: (hook: UserDefinitions["import"]) => Root.Hooks[`import`] = (hook) =>
    hook ? (context) => (descriptor) => hook(descriptor, context) : fallbacks.import

  export const ref: (hook: UserDefinitions["ref"]) => Root.Hooks[`ref`] 
    = (hook) => ({
      before:  hook?.before ? ((context) => (node) => hook.before!(node, context)) : fallbacks.ref.before,
      after: hook?.after ? (context) => (generated) => hook.after!(generated, context) : fallbacks.ref.after,
    })

  export const export_
    : (hook: UserDefinitions["export"]) => Root.Hooks["export"] 
    = (hook) => hook ? (context) => (descriptor) => hook(descriptor, context) : fallbacks.export

  export const imports: (hook: UserDefinitions["imports"]) => Root.Hooks[`imports`] = (hook) =>
    hook
      ? (context) => (identifier) =>
          core.is.function(hook) ? hook(identifier, context) : core.is.string(hook) ? [hook] : hook
      : fallbacks.imports

  export const identifier: (hook: UserDefinitions["identifier"]) => Root.Hooks[`identifier`] =
    (hook) => (context) => (identifier, body) =>
      hook
        ? core.is.string(hook)
          ? hook
          : hook(identifier, body, context)
        : fallbacks.identifier(context)(identifier, body)

  const hookMap = {
    beforeAll,
    afterEach,
    afterAll,
    imports,
    banner,
    canonical,
    identifier,
    ref,
    import: import_,
    export: export_,
  } as const

  export function defineHook<K extends keyof Root.Hooks>(
    key: K,
    hook?: Root.UserDefinitions[K],
  ): Root.Hooks[K]
  export function defineHook(key: keyof Root.Hooks, hook?: Root.UserDefinitions[keyof Root.Hooks]) {
    return hookMap[key](hook as never)
  }

  export function defineHooks<H extends globalThis.Partial<Root.UserDefinitions>>(hooks?: H): Root.Hooks
  export function defineHooks(hooks: globalThis.Partial<Root.UserDefinitions>): Root.Hooks {
    return {
      beforeAll: beforeAll(hooks.beforeAll),
      afterAll: afterAll(hooks.afterAll),
      afterEach: afterEach(hooks.afterEach),
      banner: banner(hooks.banner),
      imports: imports(hooks.imports),
      import: import_(hooks.import),
      export: export_(hooks.export),
      canonical: canonical(hooks.canonical),
      identifier: identifier(hooks.identifier),
      ref: ref(hooks.ref),
    }
  }
}

export const fallbacks: Hooks = {
  afterEach: fn.constant(fn.identity),
  afterAll: fn.constant(fn.identity),
  beforeAll: fn.constant(fn.identity),
  canonical: fn.constant(fn.identity),
  ref: {
    before: fn.constant(fn.identity),
    after: fn.constant(fn.identity),
  },
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
  ...Nullary.fallbacks,
  ...Unary.fallbacks,
  ...Binary.fallbacks,
}

function defineHooks(hooks?: Partial<UserDefinitions>) {
  return !hooks ? fallbacks : { 
    ...(Nullary.defineHooks(object.pick(hooks, "boolean", "emptyObject", "anyObject", "integer", "anyArray", "null", "number", "string"))),
    ...(Unary.defineHooks(object.pick(hooks, "array", "const", "record"))),
    ...(Binary.defineHooks(object.pick(hooks, "allOf", "anyOf", "enum", "object", "oneOf", "tuple"))), 
    ...(Root.defineHooks(object.pick(hooks, "afterAll", "afterEach", "banner", "beforeAll", "canonical", "export", "identifier", "import", "imports", "ref"))),
  } satisfies Hooks
}

// export function handleRecord<T extends Schema.any>(
//   node: RecordNode<T>, 
//   xf?: (prev: T) => T
// ): (prev: Context<{}>) => Context.record<T>

// export function handleRecord<T extends Schema.any>(
//   node: RecordNode<T>, 
//   xf?: (prev: T) => T
// ) {
//   return (prev: Context) => fn.pipe(
//     prev,
//     object.intersect.defer({
//       path: [...prev.path, symbol.string],
//       example: parseExample(core.is.record)(node),
//     }),
//   )
// }
  