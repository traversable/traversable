import * as T from "@sinclair/typebox"
import { type Traversable, anyOf$, core } from "@traversable/core"
import { fn, map } from "@traversable/data"
import type { _ } from "@traversable/registry"
import { Invariant } from "@traversable/registry"

import * as Print from "../print.js"
import type { Index, Matchers, Options } from "../shared.js"
import {
  JsonLike,
  createTarget,
  defaults as defaults_,
  escapePathSegment,
} from "../shared.js"

export {
  defaults,
  derive,
  derived,
  generate,
  generated,
}

const defaults = {
  ...defaults_,
  typeName: defaults_.typeName + 'TypeBox',
} satisfies Omit<Options.Config<unknown>, 'handlers'>

const serialize
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
          const xs = globalThis.Object.entries(x)
          return xs.length === 0 ? '{}' : fn.pipe(
            xs,
            map(([k, v]) => JSON.stringify(k) + ': ' + loop(indent + 2)(v)),
            (xs) => Print.array({ indent })('{', ...xs, '}'),
          )
        }
      }
    }
    return (x: unknown) => !JsonLike.is(x) 
      ? Invariant.NonSerializableInput("typebox.serialize", x)
      : loop(ix.indent)(x)
  }

T.Null().static
T.Object({a: T.Null()}).static

const derived = {
  any(_) { return T.Unknown(_) },
  null(_) { return T.Null(_) },
  boolean(_) { return T.Boolean(_) },
  integer(_) { return T.Integer(_) },
  number(_) { return T.Number(_) },
  string(_) { return T.String(_) },
  anyOf({ anyOf: xs, ..._ }, $) { return T.Union([...xs], { ...$, ..._ }) },
  oneOf({ oneOf: xs, ..._ }, $) { return T.Union([...xs], { ...$, ..._ }) },
  allOf({ allOf: xs, ..._ }, $) { return T.Intersect([...xs], { ...$, ..._ }) },
  const({ const: x, ..._ }, $) { return T.Const(x, { ...$, ..._ }) },
  array({ items: x, ..._ }, $) { return T.Array(x, { ...$, ..._ }) },
  tuple({ items: xs, ..._ }, $) { return T.Tuple([...xs], { ...$, ..._ }) },
  record({ additionalProperties: x, ..._ }, $) 
    { return T.Record(T.String(), x, { ...$, ..._ }) },
  object({ properties: xs, additionalProperties, ..._ }, $) 
    { return T.Object(xs, { additionalProperties, ...$, ..._ }) },
  enum({ enum: xs, ..._ }, $) { 
    return fn.pipe(
      xs.filter((anyOf$(core.is.string, core.is.number))),
      map((x) => [x, x] satisfies [any, any]),
      (xs) => Object.fromEntries(xs),
      (xs) => T.Enum(xs, { ...$, ..._ })
    )
  },
} as const satisfies Matchers<T.TAnySchema>

const generated = {
  any(_) { return 'T.Unknown()' },
  null(_) { return 'T.Null()' as const },
  boolean(_) { return 'T.Boolean()' as const },
  integer(_) { return 'T.Integer()' as const },
  number(_) { return 'T.Number()' as const },
  string(_) { return 'T.String()' as const },
  anyOf(_, $) { return Print.array($)('T.Union([', _.anyOf.join(', '), '])') },
  oneOf(_, $) { return Print.array($)('T.Union([', _.oneOf.join(', '), '])') },
  allOf(_, $) { return Print.array($)('T.Intersect([', _.allOf.join(', '), '])') },
  const(_, $) { return 'T.Const(' + serialize($)(_.const) + ')' },
  array(_, $) { return Print.array($)('T.Array(', _.items, ')') },
  enum(_, $) { return 'T.Enum([' + _.enum.map(serialize($)).join(', ') + '])' },
  tuple(_, $) { 
    return _.items.length === 0 
      ? 'T.Tuple([])' : 'T.Tuple([\n' 
      + ' '.repeat($.indent + 2) 
      +  _.items.join(',\n' 
      + ' '.repeat($.indent + 2)) 
      + '\n' + ' '.repeat($.indent) 
      + '])' 
  },
  record(_, $) 
    { return Print.array($)('T.Record(T.String(), ', _.additionalProperties, ')') },
  object(_, $) { 
    const xs = globalThis.Object.entries(_.properties)
    return xs.length === 0 ? 'T.Object({})' : fn.pipe(
      xs.map(
        ([k, v]) => JSON.stringify(k) + ': ' + v + ',' + '\n' + ' '.repeat($.indent + 2)
      ).join(''),
      (xs) => 'T.Object({\n' + ' '.repeat($.indent + 2) + xs + '\n' + ' '.repeat($.indent) + '})',
    )
  }
} as const satisfies Matchers<string>

/**
 * ## {@link generate `typebox.generate`}
 *
 * Given a JSON Schema, OpenAPI document or {@link Traversable} schema, generates the
 * corresponding TypeBox schema as a string.
 *
 * If you need to derive a schema dynamically, especially if the schema comes from
 * some kind of user input, use {@link derive `typebox.derive`} instead.
 */
const generate
  : (schema: core.Traversable.orJsonSchema, options: Options<string>) => string
  = fn.flow(
    createTarget(generated),
    ([target, $]) => [
      '/**',
      ` * # {@link ${$.typeName} \`${$.typeName}\`}`,
      ` * - Visit: {@link $doc.${$.absolutePath.map(escapePathSegment).join('.')} OpenAPI definition}`,
      ' */',
      'export type ' + $.typeName + ' = typeof ' + $.typeName + '.static',
      '//          ^?',
      'export const ' + $.typeName + ' = ' + target,
    ].join('\n')
  )

/**
 * ## {@link derive `zod.derive`}
 *
 * Given a JSON Schema, OpenAPI document or {@link Traversable} schema, generates the
 * corresponding zod schema in-memory.
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
  = fn.flow(
    createTarget(derived),
    ([target]) => target,
  )
