import type { Meta } from "@traversable/core"
import { core, keyOf$ } from "@traversable/core"
import { fn, object } from "@traversable/data"
import type { _ } from "@traversable/registry"
import { Invariant, KnownFormat } from "@traversable/registry"

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
  //
  generators,
  generate,
  generateAll,
}

type NS = typeof NS
const NS = 'type' as const

type TypeName = typeof TypeName
const TypeName = 'ArkType' as const

/** @internal */
const Object_entries = globalThis.Object.entries

const dependencies = [] as const satisfies string[]

const headers = [
  `import { ${NS} } from "arktype"`,
  ...dependencies,
] as const satisfies string[]

const template = (
  (target, $) => [
    '/**',
    ` * # {@link ${$.typeName} \`${$.typeName}\`}`,
    ` * - Visit: {@link $doc.${$.absolutePath.map(escapePathSegment).join('.')} OpenAPI definition}`,
    ' */',
    `export ${NS} ${$.typeName}`,
    '  //        ^?',
    `  = typeof ${$.typeName}.infer`,
    ...target.length < 0x20 
      ? [`export const ${$.typeName} = ${target.startsWith(NS) ? target : `${NS}(${target})`}`] 
      : [
        `export const ${$.typeName}`,
        `  = ${target.startsWith(NS) ? target : `${NS}(${target})`}`,
      ]
  ]
) satisfies TargetTemplate

const defaults = {
  ...defaults_,
  header: headers,
  typeName: defaults_.typeName + TypeName,
  template,
} as const satisfies Omit<Options.Config<unknown>, 'handlers'>

type StringFormat = typeof StringFormat
const StringFormat = {
  [KnownFormat.string.datetime]: '.date.iso',
  [KnownFormat.string.date]: '.date',
  [KnownFormat.string.email]: '.email',
  [KnownFormat.string.emoji]: '',
  [KnownFormat.string.ipv4]: '.ip',
  [KnownFormat.string.ipv6]: '',
  [KnownFormat.string.ulid]: '',
  [KnownFormat.string.uri]: '.url',
  [KnownFormat.string.uuid]: '.uuid',
} as const satisfies { [K in KnownFormat.string[keyof KnownFormat.string]]+?: string }
const isStringFormat = keyOf$(StringFormat)

const numericConstraints 
  : (meta: Meta.Numeric) => string
  = ({
    exclusiveMaximum: lt,
    exclusiveMinimum: gt,
    maximum: max,
    minimum: min,
    multipleOf: factor
  }: Meta.Numeric) => ([
    typeof gt === 'number'
      ? `.moreThan(${gt})`
      : min != null && (gt === true ? `.moreThan(${min})` : `.atLeast(${min})`),
    typeof lt === 'number'
      ? `.lessThan(${lt})`
      : max != null && (lt === true ? `.lessThan(${max})` : `.atMost(${max})`),
    factor != null && `.divisibleBy(${factor})`,
  ])
  .filter(core.is.string)
  .join("")


const getStringFormat = (meta: Meta.string) => isStringFormat(meta.format) ? StringFormat[meta.format] : null

const integerConstraints = numericConstraints
const numberConstraints = numericConstraints
const stringConstraints
  : (meta: Meta.string) => string
  = ({ minLength: min, maxLength: max, ...meta }) => {
  const format = getStringFormat(meta)
  const methods = ([
    min !== undefined && `.atLeastLength(${min})`,
    max !== undefined && `.atMostLength(${max})`
  ]).filter(core.is.string).join("")
  return format === null 
    ? methods 
    : format 
    + (format.endsWith('email') ? '' : '.root') 
    + methods
}

const Constrain = {
  integer: integerConstraints,
  number: numberConstraints,
  string: stringConstraints,
} as const

const StartsWithScalar = [
  ['null', '"null'],
  ['boolean', '"boolean'],
  ['number', '"number'],
  ['string', '"string'],
] as const satisfies [string, any][]

const startsWithScalar = (x: string) =>
  StartsWithScalar.some(([, start]) => x.startsWith(start))

const NotYetSupported = (nodeType: string) =>
  Invariant.NotYetSupported('arktype.derive.' + nodeType, 'arktype.derive')('algebra/src/arktype/ark.ts')

const generators = {
  any() { return `${NS}.unknown()` },
  enum({ enum: xs }, ix) { 
    return Print.array(ix)(
      `${NS}.enumerated(`,
      ...xs.map(serializer(ix)),
      ')',
    )
  },
  null() { return `${NS}.null` },
  boolean() { return `${NS}.boolean` },
  integer({ meta = {} }) { return `${NS}.keywords.number.integer` + Constrain.integer(meta) },
  number({ meta = {} }) { return `${NS}.number` + Constrain.number(meta) },
  string({ meta = {} }) {
    const base = getStringFormat(meta) === null ? `${NS}.string` : `${NS}.keywords.string`
    return typeof meta.pattern === `string` 
      ? meta.pattern
      : base + Constrain.string(meta)
  },
  allOf({ allOf: [x, ...xs] }, ix) {
    return Print.rows({ separator: `\n`, indent: ix.indent })(
      x.startsWith(NS) ? x : `${NS}(` + x + `)`,
      xs.reduce((acc, cur) => `${acc}.and(${cur})`, ``),
    )
  },
  anyOf({ anyOf: [x, ...xs] }, ix) {
    return Print.rows({ separator: `\n`, indent: ix.indent })(
      x.startsWith(NS) ? x : `${NS}(` + x + `)`,
      xs.reduce((acc, cur) => `${acc}.or(${cur})`, ``)
    )
  },
  oneOf({ oneOf: [x, ...xs] }, ix) { 
    return [
      x.startsWith(NS) ? x : `${NS}(` + x + `)`,
      xs.reduce((acc, cur) => `${acc + Print.newline(ix)}.or(${cur})`, ``)
    ].join(``)
  },
  const({ const: xs }, ix) { return serializer(ix)(xs) },
  array({ items: xs }) {
    return (
      xs.startsWith(`[`) ? `${NS}(` + xs +`).array()`
      : xs.startsWith(`${NS}(`) ? (xs + `.array()`)
      : [`${NS}.null`, `${NS}.boolean`, `${NS}.number`, `${NS}.string`].includes(xs)
        ? (`"` + xs.slice(`${NS}.`.length) + `[]` + `"`)
      : startsWithScalar(xs) ? (`"` + xs.slice(1, -1) + `[]` + `"`)
      : xs.startsWith(`${NS}.`) ? (xs + `.array()`)
      : `${NS}(` + xs + `, "[]")`
    )
  },
  tuple({ items: xs }, ix) { 
    return (
      xs.length === 0 ? `[]`
      : Print.array(ix)(
        `[`,
        ...xs,
        `]`,
      )
    )
  },
  record({ additionalProperties }, ix) { 
    return Print.array({ indent: ix.indent + 2 })(
      `${NS}.Record(`, 
      `"string"`, 
      additionalProperties, 
      `)`
    )
  },
  object({ properties: p, required: req = [] }, $) {
   const xs = Object_entries(p)
     .map(([k, v]) => req.includes(k) ? `${k}: ${v}` : `${JSON.stringify(k + `?`)}: ${v}`)
    return xs.length === 0 ? `{}` 
      : Print.array($)(
        `{`,
        ...xs,
        `}`
      )
  },
} as const satisfies Matchers<string>

const generate
  : Gen.Generator<string>
  = Gen.generatorFromMatchers(generators)

const generateAll
  : (options: Options<string>) => Gen.Many<string>
  = (options) => Gen.many({ ...defaults, ...options, generate })

const NEGATIVE_INFINITY = globalThis.Number.NEGATIVE_INFINITY

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
            ? `[]` 
            : Print.array({ indent })(
              `[`,
              ...x.map(loop(indent + 2)),
              `]`
            )
        }
        case !!x && typeof x === 'object': {
          const entries = Object
            .entries(x)
            .map(([k, v]) => [object.parseKey(k), loop(indent + 2)(v)] satisfies [any, any])
          return entries.length === 0 
            ? `${NS}({}).as<{}>()` 
            : Print.array({ indent })(
              '{', 
              ...entries.map(([k, v]) => k + ': ' + v), 
              '}',
            )
        }
      }
    }

    return (x: unknown) => !JsonLike.is(x) 
      ? Invariant.NonSerializableInput("ark.serialize", x)
      : loop(2)(x)
  }

