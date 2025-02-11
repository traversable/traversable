import * as T from "@sinclair/typebox"
import { type Traversable, schema } from "@traversable/core"
import { fn, map } from "@traversable/data"
import type { _ } from "@traversable/registry"
import { Invariant } from "@traversable/registry"

import * as Gen from "../generator.js"
import * as Print from "../print.js"
import type { Index, Matchers, Options, TargetTemplate } from "../shared.js"
import {
  JsonLike,
  defaults as defaults_,
  escapePathSegment,
} from "../shared.js"

export {
  NS,
  TypeName,
  defaults,
  dependencies,
  headers,
  template,
  serializer,
  //
  derivatives,
  derive,
  deriveAll,
  compilers,
  compile,
  compileAll,
}

/** @internal */
const Object_entries = globalThis.Object.entries

type NS = typeof NS
const NS = 'T' as const

type TypeName = typeof TypeName
const TypeName = 'TypeBox' as const

const dependencies = [] as const satisfies string[]
const imports = [
  `import * as ${NS} from "@sinclair/typebox"`,
] as const satisfies string[]
const headers = [
  ...dependencies,
] as const satisfies string[]

const template = (
  (target: string, $: Options.Config<string>) => [
    '/**',
    ` * # {@link ${$.typeName} \`${$.typeName}\`}`,
    ` * - Visit: {@link $doc.${$.absolutePath.map(escapePathSegment).join('.')} OpenAPI definition}`,
    ' */',
    `export type ${$.typeName}\n  = typeof ${$.typeName}.static`,
    '//          ^?',
    `export const ${$.typeName}\n  = ${target}`,
  ] as const
) satisfies TargetTemplate

const defaults = {
  ...defaults_,
  typeName: defaults_.typeName + TypeName,
  header: headers,
  imports,
  template,
} satisfies Required<Omit<Options<unknown>, 'handlers'>>

const deriveObjectNode 
  : ($: Index) => (x: Traversable.objectF<T.TAnySchema>) => T.TAnySchema
  = ($) => ({ properties: p, additionalProperties, required = [], ..._ }) => {
    const xs = Object.entries(p)
    return xs.length === 0 
      ? T.Object({})
      : fn.pipe(
        xs.map(([k, v]) => [
          k, 
          required.includes(k) ? v : T.Optional(v)
        ] satisfies [any, any]),
        Object.fromEntries,
        (ps) => T.Object(ps, _)
      )
  }

const derivatives = {
  any(_) { return T.Unknown(_) },
  null(_) { return T.Null(_) },
  boolean(_) { return T.Boolean(_) },
  integer(_) { return T.Integer(_) },
  number(_) { return T.Number(_) },
  string(_) { return T.String(_) },
  anyOf({ anyOf: xs, ..._ }, $) { return T.Union([...xs], { ...$, ..._ }) },
  oneOf({ oneOf: xs, ..._ }, $) { return T.Union([...xs], { ...$, ..._ }) },
  const({ const: x, ..._ }, $) { return T.Const(x, { ...$, ..._ }) },
  array({ items: x, ..._ }, $) { return T.Array(x, { ...$, ..._ }) },
  tuple({ items: xs, ..._ }, $) { return T.Tuple([...xs], { ...$, ..._ }) },
  object(x, $) { return deriveObjectNode($)(x) },
  record({ additionalProperties: x, ..._ }, $) 
    { return T.Record(T.String(), x, { ...$, ..._ }) },
  allOf({ allOf: xs, ..._ }, $) 
    { return T.Intersect([...xs], { ...$, ..._ }) },
  enum({ enum: xs, ..._ }, $) { 
    return fn.pipe(
      xs.filter((schema.anyOf$(schema.is.string, schema.is.number))),
      map((x) => [x, x] satisfies [any, any]),
      (xs) => Object.fromEntries(xs),
      (xs) => T.Enum(xs, { ...$, ..._ })
    )
  },
  $ref({ $ref: x }, $) { return $.refs[x] as never },
} as const satisfies Matchers<T.TAnySchema>

/**
 * ## {@link derive `typebox.derive`}
 *
 * Given a JSON Schema, OpenAPI document or {@link Traversable} schema, generates the
 * corresponding TypeBox schema in-memory.
 *
 * Usually you'd use {@link derive `typebox.derive`} over {@link generate `typebox.generate`}
 * when you don't have control over the schema, and you don't know the schema ahead of
 * time (i.e., the schema is dynamic in some way).
 *
 * If you do know the schema at compile time, using {@link generate `typebox.generate`} is
 * more efficient.
 */
const derive
  : (schema: Traversable.orJsonSchema, options: Options<T.TAnySchema>) => T.TAnySchema
  = Gen.derive(derivatives, defaults)

const deriveAll
  : (options: Options<T.TAnySchema>) => Gen.All<T.TAnySchema>
  = ($) => Gen.deriveAll(defaults)(derive, $)

const compilers = {
  any() { return `${NS}.Unknown()` },
  $ref({ $ref: x }, $) { return $.refs[x] as string },
  null() { return `${NS}.Null()` as const },
  boolean() { return `${NS}.Boolean()` as const },
  integer() { return `${NS}.Integer()` as const },
  number() { return `${NS}.Number()` as const },
  string() { return `${NS}.String()` as const },
  object(x, $) { return compileObjectNode(x, $) },
  const(x, $) { return `${NS}.Const(` + serializer($)(x.const) + `)` },
  enum(x, $) { return `${NS}.Enum([` + x.enum.map(serializer($)).join(`, `) + `])` },
  array(x, $) { return Print.array($)(`${NS}.Array(`, x.items, `)`) },
  record(x, $) { return Print.array($)(`${NS}.Record(T.String(), `, x.additionalProperties, `)`) },
  tuple(x, $) {
    return x.items.length === 0 
      ? `${NS}.Tuple([])` : `${NS}.Tuple([\n` 
      + ` `.repeat($.indent + 2) 
      +  x.items.join(`,\n` 
      + ` `.repeat($.indent + 2)) 
      + `\n` + ` `.repeat($.indent) 
      + `])`
  },
  anyOf(x, $) { return Print.array($)(`${NS}.Union([`, x.anyOf.join(`, `), `])`) },
  oneOf(x, $) { return Print.array($)(`${NS}.Union([`, x.oneOf.join(`, `), `])`) },
  allOf(x, $) { 
    return Print.array($)(
      `${NS}.Intersect([`, 
      x.allOf.join(`, `), 
      `])`
    ) 
  },
} as const satisfies Matchers<string>

const compileObjectNode 
  : (x: Traversable.objectF<string>, $: Index) => string
  = ({ properties, required = [] }, $) => {
    const xs = globalThis.Object.entries(properties)
    return xs.length === 0 ? `${NS}.Object({})` : fn.pipe(
      xs.map(
        ([k, v]) => JSON.stringify(k) + `: ` + (required.includes(k) ? v : `${NS}.Optional(${v})` )  + `,` + `\n` + ` `.repeat($.indent + 2)
      ).join(``),
      (xs) => `${NS}.Object({\n` + ` `.repeat($.indent + 2) + xs + `\n` + ` `.repeat($.indent) + `})`,
    )
  }

/**
 * ## {@link compile `typebox.compile`}
 *
 * Given a JSON Schema, OpenAPI document or {@link Traversable} schema, compile the
 * corresponding TypeBox schema as a string.
 *
 * If you need to derive a schema dynamically, especially if the schema comes from
 * some kind of user input, use {@link derive `typebox.derive`} instead.
 */
const compile
  : (schema: Traversable.orJsonSchema, options: Options<string>) => string
  = Gen.compile(compilers, defaults)

const compileAll
  : (options: Options<string>) => Gen.All<string>
  = ($) => Gen.compileAll(defaults)(compile, $)

const serializer
  : (ix: Index) => (x: unknown) => string
  = (ix) => {
    const loop = (indent: number) => (x: JsonLike): string => {
      switch (true) {
        default: return fn.exhaustive(x)
        case x === null:
        case x === undefined:
        case typeof x === 'boolean':
        case typeof x === 'number': return x + ''
        case typeof x === 'string': return '"' + x + '"'
        case JsonLike.isArray(x): 
          return x.length === 0 ? '[]' 
            : Print.array({ indent })('[', 
              ...x.map(loop(indent + 2)), 
            ']')
        case !!x && typeof x === 'object': {
          const xs = Object_entries(x)
          return xs.length === 0 ? '{}' : fn.pipe(
            xs,
            map(([k, v]) => JSON.stringify(k) + ': ' + loop(indent + 2)(v)),
            (xs) => Print.array({ indent })('{', ...xs, '}'),
          )
        }
      }
    }
    return (x: unknown) => !JsonLike.is(x) 
      ? Invariant.InputIsNotSerializable("typebox.serialize", x)
      : loop(ix.indent)(x)
  }
