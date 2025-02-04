import type { Traversable } from '@traversable/core'
import { fn, object } from '@traversable/data'
import type { _ } from '@traversable/registry'
import { type Intersect, Invariant } from '@traversable/registry'
import * as fc from 'fast-check'

import * as Gen from '../generator.js'
import * as Print from '../print.js'
import type { Index, Matchers, Options, TargetTemplate } from '../shared.js'
import {
  JsonLike,
  defaults as defaults_,
  escapePathSegment,
} from '../shared.js'

export {
  NS,
  TypeName,
  defaults,
  dependencies,
  headers,
  template,
  //
  derivatives,
  derive,
  deriveAll,
  generators,
  generate,
  generateAll,
}

type NS = typeof NS
const NS = 'fc' as const
type TypeName = typeof TypeName
const TypeName = 'Arbitrary'

/** @internal */
const Object_assign = globalThis.Object.assign

/** @internal */
function intersect<T>(xs: readonly T[]): Intersect<T> 
function intersect<T>(xs: readonly T[]) { return xs.reduce(Object_assign, {}) }

const dependencies = [
  '',
  `export type Intersect<S, O = unknown> = S extends readonly [infer H, ...infer T] ? Intersect<T, O & H> : O`,
  `function intersect<T>(xs: readonly T[]): Intersect<T>`,
  `function intersect<T>(xs: readonly T[]) { return xs.reduce(globalThis.Object.assign, {}) }`,
  // `type Infer<T> = T extends ${NS}.Arbitrary<infer F> ? F : never`,
] as const

const headers = [
  `import * as ${NS} from "fast-check"`,
  // ...dependencies,
] as const satisfies string[]

const template = (
  (target: string, $: Options.Config<string>) => [
    '/**' as const,
    ` * # {@link ${$.typeName} \`${$.typeName}\`}`,
    ` * - Visit: {@link $doc.${$.absolutePath.map(escapePathSegment).join('.')} OpenAPI definition}`,
    ' */',
    `export const ${$.typeName} = ${target}`,
  ] as const satisfies string[]
) satisfies TargetTemplate

const defaults = {
  ...defaults_,
  typeName: defaults_.typeName + 'Arbitrary',
  header: headers,
  template,
} satisfies Omit<Options.Config<unknown>, 'handlers'>

const derivatives = {
  any(_) { return fc.anything() },
  null(_) { return fc.constant(null) },
  boolean(_) { return fc.boolean() },
  integer(_) { return fc.integer() },
  number(_) { return fc.oneof(fc.float(), fc.integer()) },
  string(_) { return fc.oneof(fc.lorem(), fc.string()) },
  anyOf({ anyOf: xs, ..._ }, _$) { return fc.tuple(...xs).map(intersect) },
  oneOf({ oneOf: xs, ..._ }, _$) { return fc.oneof(...xs) },
  allOf({ allOf: xs, ..._ }, _$) { return fc.oneof(...xs) },
  const({ const: x, ..._ }, _$) { return fc.constant(x) },
  enum({ enum: xs, ..._ }, _$) { return fc.constantFrom(...xs) },
  array({ items: x, ..._ }, _$) { return fc.array(x) },
  tuple({ items: xs, ..._ }, _$) { return fc.tuple(...xs) },
  record({ additionalProperties: x, ..._ }, _$) { return fc.dictionary(fc.oneof(fc.lorem(), fc.string()), x) },
  object({ properties: xs, required: req, ..._ }, $) { return fc.record(xs, { requiredKeys: [...(req || [])] }) }
} as const satisfies Matchers<fc.Arbitrary<unknown>>

/**
 * ## {@link derive `typebox.derive`}
 *
 * Given a JSON Schema, OpenAPI document or {@link Traversable} schema, generates the
 * corresponding fast-check arbitrary in-memory.
 *
 * Usually you'd use {@link derive `fastcheck.derive`} over {@link generate `fastcheck.generate`}
 * when you don't have control over the schema, and you don't know the schema ahead of
 * time (i.e., the schema is dynamic in some way).
 *
 * If you do know the schema at compile time, using {@link generate `fastcheck.generate`} is
 * more efficient.
 */
const derive
  : Gen.Generator<fc.Arbitrary<unknown>>
  = fn.flow(
    Gen.fromMatchers(derivatives),
    ([target]) => target,
  )

const deriveAll
  : (options: Options<fc.Arbitrary<unknown>>) => Gen.Many<fc.Arbitrary<unknown>>
  = (options) => Gen.many({ ...defaults, ...options, generate: derive })

const generators = {
  any(_) { return `${NS}.anything()` },
  null(_) { return `${NS}.constant(null)` },
  boolean(_) { return `${NS}.boolean()` },
  integer(_) { return `${NS}.integer()` },
  number(_) { return `${NS}.oneof(${NS}.float(), ${NS}.integer())` },
  string(_) { return `${NS}.oneof(${NS}.lorem(), ${NS}.string())` },
  allOf({ allOf: xs, ..._ }, _$) { return `${NS}.tuple(` + xs.join(', ') + ').map(intersect)' },
  anyOf({ anyOf: xs, ..._ }, _$) { return `${NS}.oneof(` + xs.join(', ') + ')' },
  oneOf({ oneOf: xs, ..._ }, _$) { return `${NS}.oneof(` + xs.join(', ') + ')' },
  const({ const: x, ..._ }, $) { return `${NS}.constant(` + serializer($)(x) + ')' },
  enum({ enum: xs, ..._ }, _$) { return `${NS}.constantFrom(` + xs.join(', ') + ')' },
  array({ items: x, ..._ }, _$) { return `${NS}.array(` + x + ')' },
  tuple({ items: xs, ..._ }, _$) { return `${NS}.tuple(` + xs.join(', ') + ')' },
  record({ additionalProperties: x, ..._ }, _$) { 
    return `${NS}.dictionary(${NS}.oneof(${NS}.lorem(), ${NS}.string()), ${x})` 
  },
  object({ properties: xs, required: req, ..._ }, _$) { 
    return `${NS}.record({`
      + Object.entries(xs).map(([k, v]) => object.parseKey(k) + ': ' + v) 
      + `}, { requiredKeys: [${(req ?? []).map((_) => '"' + String(_) + '"').join(', ')}] })` 
  }
} as const satisfies Matchers<string>

const generate
  : Gen.Generator<string>
  = Gen.generatorFromMatchers(generators, defaults)

const generateAll
  : (options: Options<string>) => Gen.Many<string>
  = (options) => Gen.many({ ...defaults, ...options, generate })

const serializer
  : (ix: Index) => (x: unknown) => string
  = (ix) => {
    const loop = (indent: number) => (x: JsonLike): string => {
      switch (true) {
        default: return fn.exhaustive(x)
        case x === null:
        case x === undefined: return '"null"'
        case typeof x === 'boolean': return '"' + String(x) + '"'
        case typeof x === 'number': return '"' + String(x) + '"'
        case typeof x === 'string': return `'` + JSON.stringify(x) + `'`
        case JsonLike.isArray(x): {
          return x.length === 0 
            ? '[]' 
            : Print.array({ indent })(
              '[',
              ...x.map(loop(indent + 2)),
              ']'
            )
        }
        case !!x && typeof x === 'object': {
          const entries = Object
            .entries(x)
            .map(([k, v]) => [JSON.stringify(k), loop(indent + 2)(v)] satisfies [any, any])
          return entries.length === 0 
            ? '{}' 
            : Print.array({ indent })(
              '{', 
              ...entries.map(([k, v]) => k + ': ' + v), 
              '}',
            )
        }
      }
    }

    return (x: unknown) => !JsonLike.is(x) 
      ? Invariant.NonSerializableInput("fastcheck.serialize", x)
      : loop(0)(x)
  }
