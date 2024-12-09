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

import type { Partial, any } from "any-ts"
import { core, tree } from "@traversable/core"
import { symbol } from "@traversable/registry"
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

import { Schema } from "./schema.js"

type Force<T> = never | { [K in keyof T]: T[K] }
type Part<T> = never | { [K in keyof T]+?: T[K] }

interface Refs { [$ref: string]: string }
type CompilationTarget = never | { refs: { [x: string]: string }, out: string }
type Continuation = { (node: Schema.any, ctx: Context, $refs: Refs): string }
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
const isNonBoolean = (node: Schema.any): node is globalThis.Exclude<typeof node, boolean> => typeof node !== "boolean"

function define<const T extends UserDefined>(definitions: T): [T, { refs: {} }]
function define<const T extends UserDefined>(definitions: T, opts: define.Options): [T, refs: { [x: string]: Schema.any }]
function define<const T extends UserDefined>(definitions: T, opts?: define.Options): [T, { refs: { [K in string]+?: Schema.any }}]
function define<const T extends UserDefined>(
  definitions: T, 
  { refs = define.defaults.refs }: define.Options = define.defaults
) { return [definitions, { refs }] }
void (define.defaults = { refs: {} } as const satisfies Required<define.Options>)
declare namespace define { interface Options { refs?: Refs } }

function parseOptionality(node: Schema.ObjectNode, $: Context, _$refs?: Refs): Option<readonly string[]>
function parseOptionality(node: Schema.ObjectNode, $: Context) {
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
  : (context: Context.object) => Option<readonly string[]>
  = ($: Context.object) => {
    return fn.pipe(
      $.required,
      Option.guard(core.is.array(core.is.string)),
    )
  }
    // if (Option.isNone($.required)) return Option.none()
    // else if (Option.isSome($.required)) return fn.pipe(
    //   $.required,
    //   // x=>x,
    //   Option.guard(core.is.array(core.is.string)),
    // )
    // else return fn.exhaustive($.required)

const parseAdditional 
  : (node: Schema.ObjectNode, prev: Context<{}>, $refs: Refs) => Option<string>
  = (node, prev, $refs) => fn.pipe(
    Option.fromNullable(node.additionalProperties),
    Option.map((additional) => loop(additional, prev, $refs))
  )

const parseExample
  : <T extends {}>(guard?: (u: unknown) => u is T) => (node: unknown, _prev?: Context, _$refs?: Refs) => Option<T>
  = (guard = core.is.nonnullable as never) => fn.flow(
    Option.guard(tree.has("example", guard)),
    Option.map(object.get.defer("example"))
  )

type Autocomplete<T> = T | (string & {})

interface Context_string<
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

export interface Context_oneOf<T extends any.dict> extends Context<T> {}
export interface Context_allOf<T extends any.dict> extends Context<T> {}
export interface Context_anyOf<T extends any.dict> extends Context<T> {}

export interface Context_object
  <T extends any.dict = any.dict> extends Context<T> { 
  additionalProperties: Option<string>
  example: Option<unknown>
  required: Option<readonly string[]>
}

export interface Context_array
  <T extends any.dict = any.dict> extends Context<T> {
  example: Option<readonly unknown[]>
  minItems: Schema.ArrayNode["minItems"]
  maxItems: Schema.ArrayNode["maxItems"]
}

export interface Context_tuple
  <T extends any.dict = any.dict> extends Context<T> 
  { example: Option<readonly unknown[]> }

export interface Context_ref
  <T extends any.dict = any.dict> extends Context<T> 
  { example: Option<unknown> }

export interface Context_integer
  <T extends any.dict = any.dict> extends Context<T>, Part<{ 
  minimum: Schema.IntegerNode["minimum"]
  maximum: Schema.IntegerNode["maximum"]
  exclusiveMaximum: Schema.IntegerNode["exclusiveMaximum"]
  exclusiveMinimum: Schema.IntegerNode["exclusiveMinimum"]
  format: Schema.IntegerNode["format"]
}> { example: Option<number> }

export interface Context_number
  <T extends any.dict = any.dict> extends Context_integer<T> { 
  example: Option<number>, 
  multipleOf: Schema.NumberNode["multipleOf"] 
}

export interface Context_record
  <T extends Schema.any = Schema.any> extends Context<T> 
  { example: Option<{ [x: string]: unknown }> }

// barrelFile: null | string

interface Context<T = {}> {
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
  description: Option<string>
  example: Option<unknown>
  isNullable: boolean
  isReadonly: boolean
  isRequired: boolean
  node: Schema.any
  schemaName: string
  userDefined: T

  /// node-level state
  locals: Option<Pick<Context, "example" | "description">>
  path: (key.any)[]
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
}

namespace Context {
  export const apply
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

  export const init 
    : <T extends any.dict>(partial: Omit<Context.Partial<T>, "document">) => (doc: Context["document"]) => Context<T>
    = ($) => (doc) => Object_assign(
        { /// module-level config
          dependencies: $.dependencies ?? [],
          document: doc, 
          fileExtension: $.fileExtension ?? "",
          focusPath: $.focusPath ?? ["components", "schemas"],
          hooks: $.hooks, 
          moduleName: $.moduleName,
          optionality: $.optionality ?? "opt-in",
          rootSchemaName: null,
        }, 
        { /// node-level config
          node: doc,
          description: $.description ?? Option.none(),
          example: $.example ?? Option.none(),
          isNullable: $.isNullable ?? false,
          isReadonly: $.isReadonly ?? false,
          isRequired: $.isRequired ?? ($.optionality === "opt-in"),
          schemaName: $.schemaName,
          userDefined: $.userDefined ?? {} as never,
        }, { /// node-level state
          locals: $.locals ?? Option.none(),
          path: $.path ?? [],
        } as const
      )

  export const handleObject 
    : <T extends any.dict>(
      node: Schema.ObjectNode, 
      $refs: Refs, 
      xf?: (prev: T) => T
    ) => (prev: Context<T>) 
      => Context.object<T>
    = (node, $refs, xf = fn.identity) => (prev) => fn.pipe(
      prev,
      Context.apply(node, xf),
      object.intersect.defer({
        additionalProperties: parseAdditional(node, prev, $refs),
        required: parseOptionality(node, prev),
        example: parseExample(core.is.object.any)(node, prev, $refs),
      }),
    )


  /** TODO: rename to `handleArrayItems`? */
  export const handleArray
    : <T extends { [x: string]: unknown }>(node: Schema.ArrayNode, xf?: (prev: T) => T) => (prev: Context<T>) => Context.array<T>
    = (node, xf = fn.identity) => (prev) => {
      const { items } = node
      return {
        ...prev,
        path: [...prev.path, symbol.number],
        /** Example is for the parent node (the array itself, not the `items` node) */
        example: parseExample(core.is.any.array)(node),
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
      Context.apply(node, xf),
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
          Context.apply(node, xf),
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
        Context.apply(node, xf),
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
      Context.apply(node, xf),
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
      Context.apply(node, xf),
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
        Context.apply(node, xf),
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
        Context.apply(node, xf),
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
        Context.apply(node, xf),
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
  : (ctx: Context) => (refNode: unknown) => string 
  = (ctx) => (refNode) => {
    if (!hasRef(refNode)) throw Error(`\`parseRef\` received a node that did not have a string property called "$ref"`)
    const focus = "#/".concat(ctx.focusPath.join("/")).concat("/")
    return refNode.$ref.slice(focus.length)
  }

// TODO:
// const dereferencePointer (...) => {}

const deref
  : (prev: Context, $refs: Refs, loop: Continuation) => (node: Schema.$ref) => string
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
 
function fromAST(ctx: Context): (root: Schema.any) => CompilationTarget 
function fromAST($: Context) {
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

function handleString(node: Schema.StringNode, $: Context, _$: Refs): string {
  const next = Context.handleString(node)($)
  return fn.pipe(
    $.hooks.string(next).value,
    $.hooks.afterEach(next),
  )
}

function handleNumber(node: Schema.NumberNode, $: Context, _$: Refs): string {
  const next = Context.handleNumber(node)($)
  return fn.pipe(
    $.hooks.number(next).value,
    $.hooks.afterEach(next),
  )
}

function handleBoolean(_: Schema.BooleanNode, $: Context, _$: Refs): string {
  const next = $
  return fn.pipe(
    $.hooks.boolean(next).value,
    $.hooks.afterEach(next),
  )
}

function handleInteger(node: Schema.IntegerNode, $: Context, _$: Refs): string {
  const next = Context.handleInteger(node)($)
  return fn.pipe(
    $.hooks.integer(next).value,
    $.hooks.afterEach(next),
  )
}

function handleNull(_: Schema.NullNode, $: Context, _$: Refs): string {
  const next = $
  return $.hooks.null(next).value
}

function handleArray<T extends Schema.any>(node: Schema.ArrayNode<T>, $: Context, $refs: Refs): string {
  const next = Context.handleArray(node)($)
  return fn.pipe(
    node.items, 
    $.hooks.array.before($),
    (n) => loop(n, next, $refs), 
    $.hooks.array.after($),
    $.hooks.afterEach($),
  )
}

function handleTuple<T extends readonly Schema.any[]>(node: Schema.TupleNode<T>, $: Context, $refs: Refs): string {
  const tupleContext = Context.handleTuple(node)($)
  const next = Context.handleIndex(tupleContext, node)
  return fn.pipe(
    node.prefixItems,
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

function handleOneOf(node: Schema.OneOf, $: Context, $refs: Refs): string {
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

function handleAllOf(node: Schema.AllOf, $: Context, $refs: Refs): string {
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

function handleAnyOf(node: Schema.AnyOf, $: Context, $refs: Refs): string {
  const next = Context.handleAnyOf($, node)
  return (
    fn.pipe(
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
  )
}

function handleObject(node: Schema.ObjectNode, $: Context, $refs: Refs): string {
  const objectContext = Context.handleObject(node, $refs)($)
  const beforeEach = (n: Schema.any, k: prop.any) => [n, object.parseKey(k)] as const
  return fn.pipe(
    node.properties,
    $.hooks.object.beforeAll(objectContext),
    map(
      fn.flow(
        beforeEach,
        ([childNode, childKey]) => {
          const propertyContext = Context.handleProperty(objectContext)(childNode, childKey)

          return fn.pipe(
            builtins.object.beforeEach(objectContext)(childNode, childKey),
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

const loop = fn.loopN<[node: Schema.any, ctx: Context, $refs: Refs], string>
  ((node, prev, $refs, loop) => {
    switch (true) {
    /** make sure we have the node in-hand before we pattern match */
    case Schema.is.ref(node): return deref(prev, $refs, loop)(node)
    case Schema.is.string(node): return handleString(node, prev, $refs)
    case Schema.is.number(node): return handleNumber(node, prev, $refs)
    case Schema.is.boolean(node): return handleBoolean(node, prev, $refs)
    case Schema.is.integer(node):  return handleInteger(node, prev, $refs)
    case Schema.is.null(node): return handleNull(node, prev, $refs)
    case Schema.is.array(node): return handleArray(node, prev, $refs)
    case Schema.is.tuple(node): return handleTuple(node, prev, $refs)
    case Schema.is.anyOf(node): return handleAnyOf(node, prev, $refs)
    case Schema.is.oneOf(node): return handleOneOf(node, prev, $refs)
    case Schema.is.allOf(node): return handleAllOf(node, prev, $refs)
    case Schema.is.object(node): return handleObject(node, prev, $refs)
    // case Schema.is.object(node) && Object_keys(node).length > 0: return handleEmptyObject(node, prev, $refs)
    default: return fn.exhaustive(node)
  }
})


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

  export function defineHooks<H extends Part<Nullary.UserDefinitions>>(hooks?: H): Nullary.Hooks {
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

  export function defineHooks(hooks?: Part<Unary.UserDefinitions>): Unary.Hooks {
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
    beforeAll(ctx: Context): <T>(before: T) => T
    afterAll(ctx: Context): (after: string) => string
    beforeEach(ctx: Context): <Ix extends key.any>(before: Schema.any, prop: Ix) => readonly [before: Schema.any, prop: Ix]
    afterEach(ctx: Context): (after: string, prop: string) => readonly [after: string, prop: string]
    join(ctx: Context): (xs: readonly string[]) => string
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
      join(ctx: Context): (props: readonly string[]) => string
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

  export function defineHook<H extends Part<Binary.UserDefined<any, any>>>(
    hook?: H,
  ): Binary.Hook
  export function defineHook(hook: Binary.UserDefined<any, any>): Binary.Hook {
    return {
      beforeAll:
        !hook || !(prop.beforeAll in hook)
          ? fallback[prop.beforeAll]
          : ($) => (before) => hook[prop.beforeAll]!(before, $),
      afterAll:
        !hook || !(prop.afterAll in hook)
          ? fallback[prop.afterAll]
          : ($) => (after) => hook[prop.afterAll]!(after, $),
      afterEach:
        !hook || !(prop.afterEach in hook)
          ? fallback.afterEach
          : ($) => (after, index) => hook[prop.afterEach]!(after, index, $),
      beforeEach:
        !hook || !(prop.beforeEach in hook)
          ? fallback.beforeEach
          : ($) => (before, index) => hook[prop.beforeEach]!(before, index, $),
      join:
        !hook || !(prop.join in hook)
          ? fallback[prop.join]
          : ($) => (xs) => hook[prop.join]!(xs, $),
    }
  }

  export function defineHooks<H extends Part<Binary.UserDefinitions>>(hooks?: H): Binary.Hooks
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
    afterAll($: Context): (after: string) => string
    afterEach($: Context): (after: string) => string
    beforeAll($: Context): (before: Schema.any) => Schema.any
    /**
     * `Hooks.canonical` lets you configure the _canonical_ name of the value you're
     * interpreting. This is similar to a "ref" from the OpenAPI/JSONSchema spec.
     *
     * Note that the _canonical name_ will match the _filename_ that is generated
     * for that schema. The _canonical name_ will also be the _named export_ that
     * that file creates.
     */
    canonical($?: Context): (identifier: string) => string
    imports($: Context): (identifier: string) => readonly string[]
    import($: Context): ({ ref, path, ext }: { ref: string; path: string, ext: string }) => string
    export($: Context): ({ ref, path, ext }: { ref: string; path: string, ext: string }) => string
    identifier($: Context): (identifier: string, body: string) => string
    banner($: Context): string
    ref: {
      before($: Context): (node: Schema.any) => Schema.any,
      after($: Context): (generated: string) => string,
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
    beforeAll?(before: Schema.any, ctx: Context): Schema.any
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
      before?: (node: Schema.any, ctx: Context) => Schema.$ref
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

  export const afterAll: (hook: UserDefinitions["afterAll"]) => Root.Hooks[`afterAll`] = (hook) =>
    hook ? ($) => (after) => hook(after, $) : fallbacks.afterAll

  export const afterEach
    : (hook: UserDefinitions["afterEach"]) => Root.Hooks[`afterEach`] 
    = (hook) => hook ? ($) => (after) => hook(after, $) : fallbacks.afterEach

  export const beforeAll: (hook: UserDefinitions["beforeAll"]) => Root.Hooks[`beforeAll`] = (hook) =>
    hook ? ($) => (before) => hook(before, $) : fallbacks.beforeAll

  export const canonical
    : (hook: UserDefinitions["canonical"]) => Root.Hooks["canonical"] 
    = (hook) => ($) => (identifier) =>
      hook
        ? Root.isCasing(hook)
          ? (Root.casing[hook] as (s: string) => string)(identifier)
          : hook(identifier, $ as Context) // TODO: fix this type assertion
        : fallbacks[byName.canonical]($)(identifier)

  export const banner
    : (hook: UserDefinitions["banner"]) => Root.Hooks["banner"]
    = (hook) => core.is.defined(hook)
      ? ($) => typeof hook === "string" ? hook : hook($)
      : fallbacks.banner

  export const import_: (hook: UserDefinitions["import"]) => Root.Hooks[`import`] = (hook) =>
    hook ? ($) => (descriptor) => hook(descriptor, $) : fallbacks.import

  export const ref: (hook: UserDefinitions["ref"]) => Root.Hooks[`ref`] 
    = (hook) => ({
      before:  hook?.before ? (($) => (node) => hook.before!(node, $)) : fallbacks.ref.before,
      after: hook?.after ? ($) => (generated) => hook.after!(generated, $) : fallbacks.ref.after,
    })

  export const export_
    : (hook: UserDefinitions["export"]) => Root.Hooks["export"] 
    = (hook) => hook ? ($) => (descriptor) => hook(descriptor, $) : fallbacks.export

  export const imports: (hook: UserDefinitions["imports"]) => Root.Hooks[`imports`] = (hook) =>
    hook
      ? ($) => (identifier) =>
          core.is.function(hook) ? hook(identifier, $) : core.is.string(hook) ? [hook] : hook
      : fallbacks.imports

  export const identifier: (hook: UserDefinitions["identifier"]) => Root.Hooks[`identifier`] =
    (hook) => ($) => (identifier, body) =>
      hook
        ? core.is.string(hook)
          ? hook
          : hook(identifier, body, $)
        : fallbacks.identifier($)(identifier, body)

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

// /** @deprecated use {@link Continuation `Continuation`} instead */
// type Continuation_ = (args: readonly [node: Schema.any, $: Context]) => string
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
// const deref 
//   : (prev: Context, loop: Continuation_) => (refs: { [x: string]: string }) => (node: Schema.$ref) => string
//   = (prev, loop) => 
//     ($refs) => 
//     (node) => {
//       const $ref = parseRef(prev)(node)
//       if($ref.includes("/")) {
//         const path = [...prev.focusPath, ...$ref.split("/")]
//         const dereferenced 
//           = tree.has(...path)(prev.document) 
//           ? tree.get(prev.document, ...path) 
//           : null
//         if(dereferenced == null) return "" 
//         else {
//           const next = fn.pipe(
//             prev,
//             applyBaseContext(dereferenced, fn.identity),
//             object.intersect.defer({
//               path: [ ...prev.path],
//               // path: [ ...prev.path, ...optionalitySegments],
//             }),
//           )
//           const value = fn.pipe(
//             dereferenced,
//             prev.hooks.ref.before(next),
//             (n) => fn.pipe(
//               loop([n, next]),
//               /** TODO: figure out why running this hook breaks Faker codegen */
//               // prev.hooks.ref.after(Context.handleRef(prev, node)()),
//             ),
//           ) satisfies string
//           return ($refs[$ref] = value, value)
//         }
//       }
//       else {
//         const identifier = fn.pipe(
//           $ref,
//           prev.hooks.canonical(prev),
//           prev.hooks.ref.after(Context.handleRef(node)(prev)),
//         ) satisfies string
//         return ($refs[$ref] = identifier, identifier)
//       }
//     }
/** 
 * - [ ] TODO: first-class support for records
 * @example
 * case Schema.is.record(node): {
 *   const next = Context.handleRecord(node)(prev)
 *   return fn.pipe(
 *     node.additionalProperties,
 *     userland.record.before(prev),
 *     (n) => loop([n, next]),
 *     userland.record.after(prev),
 *     userland.afterEach(next),
 *   )
 * }
 */
/// TODO: add support for "enum" type
// case Schema.is.const(node): {
//   const next = prev
//   return fn.pipe(
//     node.const,
//     (v) => (string.is(v) ? `"${v}"` : `${v}`),
//     userland.const.before(next),
//     globalThis.String,
//     userland.const.after(next),
//     userland.afterEach(next),
//   )
// }
/** 
 * - [ ] TODO: do we need to keep supporting this?
 * @example
 * case isAnyObjectNode(node): {
 *   const next = prev
 *   return fn.pipe(
 *     userland.anyObject(next).value,
 *     userland.afterEach(next),
 *   )
 * }
 */
// interface PropsContext extends Context {
//   requiredProps: readonly string[]
//   readonlyProps: readonly string[]
// }
// declare namespace Codegen {
  // export interface Tasks extends any.dict<UserDefinitions> {}
  // export {
  //   CompilationTarget,
  //   UserDefined,
  //   Hooks,
  // }
// }
    // case Schema.is.record(node): {
    //   const next = Context.handleRecord(node)(prev)
    //   return fn.pipe(
    //     node.additionalProperties,
    //     userland.record.before(prev),
    //     (n) => loop([n, next]),
    //     userland.record.after(prev),
    //     userland.afterEach(next),
    //   )
    // }
// function handleEmptyObject(node: Schema.ObjectNode, $: Context, $refs: Refs): string {
//   const next = $
//   return fn.pipe(
//     $.hooks.emptyObject(next).value,
//     $.hooks.afterEach(next),
//   )
// }
// const hookMap = {
//   beforeAll,
//   afterEach,
//   afterAll,
//   imports,
//   banner,
//   canonical,
//   identifier,
//   ref,
//   import: import_,
//   export: export_,
// } as const
// export function defineHook<K extends keyof Root.Hooks>(
//   key: K,
//   hook?: Root.UserDefinitions[K],
// ): Root.Hooks[K]
// export function defineHook(key: keyof Root.Hooks, userland?: Root.UserDefinitions[keyof Root.Hooks]) {
//   return hookMap[key](userland as never)
// }
