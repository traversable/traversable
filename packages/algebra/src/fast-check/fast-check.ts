import type { Meta, Traversable } from '@traversable/core'
import { schema } from '@traversable/core'
import { fn, object } from '@traversable/data'
import type { _ } from '@traversable/registry'
import type { Intersect } from '@traversable/registry'
import { Invariant, KnownFormat } from '@traversable/registry'
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
  imports,
  template,
  //
  derivatives,
  derive,
  deriveAll,
  compilers,
  compile,
  compileAll,
}

type NS = typeof NS
const NS = 'fc' as const
type TypeName = typeof TypeName
const TypeName = 'Arbitrary'

/** @internal */
const Object_assign = globalThis.Object.assign
/** @internal */
const Math_fround = globalThis.Math.fround
/** @internal */
function intersect<T>(...xs: readonly T[]): Intersect<T> 
function intersect<T>(xs: readonly T[]) { return xs.reduce(Object_assign, {}) }

const dependencies = [
  `export type Intersect<S, O = unknown> = S extends readonly [infer H, ...infer T] ? Intersect<T, O & H> : O`,
  `function intersect<T>(xs: readonly T[]): Intersect<T>`,
  `function intersect<T>(xs: readonly T[]) { return xs.reduce(globalThis.Object.assign, {}) }`,
] as const

const imports = [
  `import * as ${NS} from "fast-check"`,
] as const satisfies string[]

const headers = [
  // ...imports,
  ...dependencies,
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
  imports,
  template,
} satisfies Required<Omit<Options<unknown>, 'handlers'>>

const dateDefaults = {
  noInvalidDate: true, 
  min: new globalThis.Date(0),             // circa ~1970
  max: new globalThis.Date(0xE4F00000000), // circa ~2470
} as const satisfies fc.DateConstraints

const floatDefaults = {
  noDefaultInfinity: true,
  noNaN: true,
} as const satisfies fc.FloatConstraints

const uuid = (constraints?: Parameters<typeof fc.uuid>[0]) => fc.uuid({ version: 4, ...constraints })
// Unfortunately zod validates dates using a regular expression, and doesn't invert control of this validation directly.
// Haven't found a better solution yet... for now, limit the min/max that fast-check can generate
// to match zod, which seems to be the GCD.
// 😢 `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`
const date = (constraints?: Parameters<typeof fc.date>[0]) => fc.date({ ...dateDefaults, ...constraints })
const datetime = fn.flow(date, (_) => _.map((d) => d.toISOString()))
const datestring = fn.flow(datetime, (_) => _.map((dt) => dt.slice(0, 10)))

const StringFormat = {
  [KnownFormat.string.date]: datestring,
  [KnownFormat.string.datetime]: datetime,
  [KnownFormat.string.email]: fc.emailAddress,
  [KnownFormat.string.ipv4]: fc.ipV4,
  [KnownFormat.string.ipv6]: fc.ipV6,
  [KnownFormat.string.ulid]: fc.ulid,
  [KnownFormat.string.uri]: fc.webUrl,
  [KnownFormat.string.uuid]: uuid,
} as const satisfies { [K in KnownFormat.string[keyof KnownFormat.string]]+?: (_: never) => fc.Arbitrary<string> }

const CompiledStringFormat = {
  [KnownFormat.string.date]: `${NS}.date({ noInvalidDate: true }).map((d) => d.toISOString().slice(0, 10))`,
  [KnownFormat.string.datetime]: `${NS}.date({ noInvalidDate: true }).map((d) => d.toISOString())`,
  [KnownFormat.string.email]: `${NS}.emailAddress()`,
  [KnownFormat.string.ipv4]: `${NS}.ipV4()`,
  [KnownFormat.string.ipv6]: `${NS}.ipV6()`,
  [KnownFormat.string.ulid]: `${NS}.ulid()`,
  [KnownFormat.string.uri]: `${NS}.webUrl()`,
  [KnownFormat.string.uuid]: `${NS}.uuid({ version: 4 })`,
  // [KnownFormat.string.emoji]: '.emoji()',
} as const satisfies { [K in KnownFormat.string[keyof KnownFormat.string]]+?: string }

const modulo 
  : (meta: Meta.Numeric) => (x: number) => number
  = ({ minimum: min, maximum: max, multipleOf: mod }) => (x: number) => 
    mod === undefined           ? x
  : min === undefined           ? (x - (x % mod))
  : max === undefined           ? (x - (x % mod) + mod)
  : min < (x - (x % mod))       ? (x - (x % mod))
  : max > (x - (x % mod) + mod) ? (x - (x % mod) + mod)
  : x
  ;

const computeMin 
  : (meta: Meta.Numeric) => number | undefined
  = ({ exclusiveMinimum: gt, minimum }) => 
    typeof gt === 'number' ? gt + 1
    : (gt === true && typeof minimum === 'number') ? minimum + 1
    : typeof minimum === 'number' ? minimum 
    : void 0

const computeMax 
  : (meta: Meta.Numeric) => number | undefined
  = ({ exclusiveMaximum: lt, maximum }) => 
    typeof lt === 'number' ? lt - 1
    : (lt === true && typeof maximum === 'number') ? maximum - 1
    : typeof maximum === 'number' ? maximum 
    : void 0

const minmax
  : (meta: Meta.Numeric) => fc.IntegerConstraints
  = (meta) => {
    const min = computeMin(meta)
    const max = computeMax(meta)
    return {
      ...min && { min },
      ...max && { max },
    } satisfies fc.IntegerConstraints
  }

const minmaxString 
  : (meta: Meta.string) => fc.StringConstraints
  = ({ minLength, maxLength }) => ({
    ...minLength !== undefined && { minLength },
    ...maxLength !== undefined && { maxLength },
  })

const minmaxRound = fn.flow(minmax, ({ min, max }) => ({ 
  ...typeof min === 'number' && { min: Math_fround(min) },
  ...typeof max === 'number' && { max: Math_fround(max) }
}))

const compiledIntegerConstraints
  : (meta: Meta.Numeric) => string
  = (meta: Meta.Numeric) => {
    const min = computeMin(meta)
    const max = computeMax(meta)
    return [
      typeof min === 'number' && `min: ${min}`,
      typeof max === 'number' && `max: ${max}`,
    ].filter((_) => typeof _ === 'string').join(', ')
  }

const Constrain = {
  string({ minLength, maxLength }: Meta.string) {
    return {
      ...minLength !== undefined && { minLength },
      ...maxLength !== undefined && { maxLength },
    } satisfies fc.StringConstraints
  },
  compiled: {
    integer: compiledIntegerConstraints,
    float(meta: Meta.Numeric) {
      const { exclusiveMaximum: lt, exclusiveMinimum: gt /* , multipleOf: mod */ } = meta
      return [
        compiledIntegerConstraints(meta),
        typeof gt === 'number' ? `minExcluded: true` : typeof gt === 'boolean' ? `minExcluded: ${gt}` : null,
        typeof lt === 'number' ? `maxExcluded: true` : typeof lt === 'boolean' ? `maxExcluded: ${lt}` : null,
      ].filter((_) => _ !== null).join(', ')
    },
    string({ minLength, maxLength }: Meta.string) {
      const constraints = [
        minLength === undefined ? null : `minLength: ${minLength}`,
        maxLength === undefined ? null : `maxLength: ${maxLength}`,
      ].filter((_) => _ !== null).join(', ')
      return constraints
    },
  }
} as const

const deriveObjectNode 
  : ($: Index) => (x: Traversable.objectF<fc.Arbitrary<unknown>>) => fc.Arbitrary<Record<string, unknown>>
  = ($) => ({ properties: xs, required: req }) => fc.record(xs, { requiredKeys: !!req ? [...req] : req })

const derivatives = {
  any() { return fc.jsonValue() },
  null() { return fc.constant(null) },
  boolean() { return fc.boolean() },
  integer({ meta = {} }) { return fc.integer(minmax(meta)).map(modulo(meta)) },
  number({ meta = {} }) { return fc.float(minmaxRound(meta)) },
  string({ meta = {} }) { 
    return schema.keyOf$(StringFormat)(meta.format) 
      ? StringFormat[meta.format]() 
      : fc.string(minmaxString(meta))
  },
  anyOf({ anyOf: xs, ..._ }, _$) { return fc.oneof(...xs) },
  oneOf({ oneOf: xs, ..._ }, _$) { return fc.oneof(...xs) },
  const({ const: x, ..._ }, _$) { return fc.constant(x) },
  enum({ enum: xs, ..._ }, _$) { return fc.constantFrom(...xs) },
  array({ items: x, ..._ }, _$) { return fc.array(x) },
  tuple({ items: xs, ..._ }, _$) { return fc.tuple(...xs) },
  record({ additionalProperties: x, ..._ }, _$) 
    { return fc.dictionary(fc.oneof(fc.lorem(), fc.string()), x) },
  object(x, $) { return deriveObjectNode($)(x)  },
  allOf({ allOf: xs, ..._ }, $) 
    { return fc.tuple(...xs).map((ys) => ys.reduce(intersect)) },
  $ref({ $ref: x }, $) { return $.refs[x] as never },
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
  = Gen.derive(derivatives, defaults)

const deriveAll
  : (options: Options<fc.Arbitrary<unknown>>) => Gen.All<fc.Arbitrary<unknown>>
  = ($) => Gen.deriveAll(defaults)(derive, $)

const compileObjectNode 
  : (x: Traversable.objectF<string>, $: Index) => string
  = ({ properties: xs, required: req, ..._ }, _$) => { 
  return `${NS}.record({`
    + Object.entries(xs).map(([k, v]) => object.parseKey(k) + ': ' + v) 
    + `}, { requiredKeys: [${(req ?? []).map((_) => '"' + String(_) + '"').join(', ')}] })`
}

const compilers = {
  any() { return `${NS}.anything()` },
  null() { return `${NS}.constant(null)` },
  boolean() { return `${NS}.boolean()` },
  integer({ meta = {} }) { return `${NS}.integer({${Constrain.compiled.integer(meta)}})` },
  number({ meta = {} }) { return `${NS}.float({${Constrain.compiled.float(meta)}})` },
  string({ meta = {} }) { 
    return schema.keyOf$(CompiledStringFormat)(meta.format) 
      ? CompiledStringFormat[meta.format]
      : `${NS}.string({${Constrain.compiled.string(meta)}})`
  },
  allOf({ allOf: xs, ..._ }, $) { return `${NS}.tuple(` + xs.join(', ') + ').map(intersect)' },
  anyOf({ anyOf: xs, ..._ }) { return `${NS}.oneof(` + xs.join(', ') + ')' },
  oneOf({ oneOf: xs, ..._ }) { return `${NS}.oneof(` + xs.join(', ') + ')' },
  const({ const: x, ..._ }, $) { return `${NS}.constant(` + serializer($)(x) + ')' },
  enum({ enum: xs, ..._ }) { return `${NS}.constantFrom(` + xs.join(', ') + ')' },
  object(x, $) { return compileObjectNode(x, $) },
  array({ items: x, ..._ }) { return `${NS}.array(` + x + ')' },
  tuple({ items: xs, ..._ }) { return `${NS}.tuple(` + xs.join(', ') + ')' },
  record({ additionalProperties: x, ..._ }) { return `${NS}.dictionary(${NS}.oneof(${NS}.lorem(), ${NS}.string()), ${x})` },
  $ref({ $ref: x }, $) { return $.refs[x] as never },
} as const satisfies Matchers<string>

const compile
  : Gen.Generator<string>
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
            .map(([k, v]) => [object.parseKey(k), loop(indent + 2)(v)] satisfies [any, any])
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
      ? Invariant.InputIsNotSerializable("fastcheck.serialize", x)
      : loop(0)(x)
  }
