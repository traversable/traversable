import { type } from 'arktype'

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
  derivatives,
  derive,
  deriveAll,
  compilers,
  compile,
  compileAll,
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
    `export type ${$.typeName}`,
    '  //        ^?',
    `  = typeof ${$.typeName}.infer`,
    `export const ${$.typeName} =`,
    `  ${target.startsWith(NS) ? target : `${NS}(${target})`}`,
  ]
) satisfies TargetTemplate

const defaults = {
  ...defaults_,
  header: headers,
  typeName: defaults_.typeName + TypeName,
  template,
} as const satisfies Required<Omit<Options<unknown>, 'handlers'>>

type CompiledStringFormat = typeof CompiledStringFormat
const CompiledStringFormat = {
  [KnownFormat.string.datetime]: '.date.iso',
  [KnownFormat.string.date]: '.date',
  [KnownFormat.string.email]: '.email',
  [KnownFormat.string.ipv4]: '.ip.v4',
  [KnownFormat.string.ipv6]: '.ip.v6',
  [KnownFormat.string.uri]: '.url',
  [KnownFormat.string.uuid]: '.uuid',
  // [KnownFormat.string.emoji]: '',
  // [KnownFormat.string.ulid]: '',
} as const satisfies { [K in KnownFormat.string[keyof KnownFormat.string]]+?: string }
const isCompiledStringFormat = keyOf$(CompiledStringFormat)

const DerivedStringFormat = {
  [KnownFormat.string.datetime]: type.keywords.string.date.iso.root,
  [KnownFormat.string.date]: type.keywords.string.date.root,
  [KnownFormat.string.email]: type.keywords.string.email,
  [KnownFormat.string.ipv4]: type.keywords.string.ip.v4,
  [KnownFormat.string.ipv6]: type.keywords.string.ip.v6,
  [KnownFormat.string.uri]: type.keywords.string.url.root,
  [KnownFormat.string.uuid]: type.keywords.string.uuid.root,
  // [KnownFormat.string.datetime]: type.keywords.string.date.iso,
  // [KnownFormat.string.date]: type.keywords.string.date,
  // [KnownFormat.string.emoji]: type.'',
  // [KnownFormat.string.ulid]: '',
} satisfies Record<string, type.Any>
const isDerivedStringFormat = keyOf$(DerivedStringFormat)

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


const getCompiledStringFormat = (meta: Meta.string) => 
  isCompiledStringFormat(meta.format) ? CompiledStringFormat[meta.format] : null

const getDerivedStringBase = (meta: { format?: string }) => 
  isDerivedStringFormat(meta.format) ? DerivedStringFormat[meta.format] : type.string

const integerConstraints = numericConstraints
const numberConstraints = numericConstraints
const stringConstraints
  : (meta: Meta.string) => string
  = ({ minLength: min, maxLength: max, ...meta }) => {
  const format = getCompiledStringFormat(meta)
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

const compileObjectNode
  : ($: Index) => (x: core.Traversable.objectF<string>) => string
  = ($) => ({ properties: p, required: req = [] }) => {
    const xs = Object_entries(p)
     .map(([k, v]) => req.includes(k) ? `${k}: ${v}` : `${JSON.stringify(k + `?`)}: ${v}`)
    return xs.length === 0 ? `{}` 
      : Print.array($)(
      `{`,
      ...xs,
      `}`
    )
  }

const compilers = {
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
    const base = getCompiledStringFormat(meta) === null ? `${NS}.string` : `${NS}.keywords.string`
    return typeof meta.pattern === `string` 
      ? meta.pattern
      : base + Constrain.string(meta)
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
  object(x, $) { return compileObjectNode($)(x) },
  allOf({ allOf: xs }, $) {
    const [y, ...ys] = xs.map(compileObjectNode($))
    return Print.rows({ separator: `\n`, indent: $.indent })(
      y.startsWith(NS) ? y : `${NS}(` + y + `)`,
      ys.reduce((acc, cur) => `${acc}.and(${cur})`, ``),
    )
  },
  $ref({ $ref: x }, $) { return JSON.stringify($.refs[x]) }
} as const satisfies Matchers<string>

const compile
  : Gen.Generator<string>
  = Gen.compile(compilers, defaults)

const compileAll
  : (options: Options<string>) => Gen.All<string>
  = (options) => Gen.compileAll(compile, { ...defaults, ...options })

const deriveObjectNode 
  : ($: Index) => (x: core.Traversable.objectF<type.Any<any>>) => type.Any
  = ($: Index) => ({ properties: p, required: req = [] }: core.Traversable.objectF<type.Any<any>>) => {
    const props: Record<string, type.Any> = {}
    for (const k in p) props[req.includes(k) ? k : `${k}?`] = type(p[k])
    return type(props)
  }

const derivatives = {
  any() { return type.unknown },
  enum({ enum: xs }) { return type.enumerated(...xs) },
  null() { return type.null },
  boolean() { return type.boolean },
  integer({ 
    meta: { 
      exclusiveMaximum: lt,
      exclusiveMinimum: gt,
      minimum: min,
      maximum: max,
      multipleOf: mod,
    } = {} }, 
  ) { 
    let base = type.keywords.number.integer
    switch (true) {
      case typeof gt === 'number': 
        { void (base = base.moreThan(gt));  break }
      case min != null && (gt === true): 
        { void (base = base.moreThan(min)); break }
      case min != null: 
        { void (base = base.atLeast(min));  break }
      case typeof lt === 'number': 
        { void (base = base.lessThan(lt));  break }
      case max != null && (lt === true): 
        { void (base = base.lessThan(max)); break }
      case max != null: 
        { void (base = base.atMost(max));   break }
    }
    return typeof mod === 'number' ? base.divisibleBy(mod) : base
  },
  number({ 
    meta: { 
      exclusiveMaximum: lt,
      exclusiveMinimum: gt,
      minimum: min,
      maximum: max,
      multipleOf: mod,
    } = {} 
  }) { 
    let base = type.number
    switch (true) {
      case typeof gt === 'number': 
        { void (base = base.moreThan(gt));  break }
      case min != null && (gt === true): 
        { void (base = base.moreThan(min)); break }
      case min != null: 
        { void (base = base.atLeast(min));  break }
      case typeof lt === 'number': 
        { void (base = base.lessThan(lt));  break }
      case max != null && (lt === true): 
        { void (base = base.lessThan(max)); break }
      case max != null: 
        { void (base = base.atMost(max));   break }
    }
    return typeof mod === 'number' ? base.divisibleBy(mod) : base
  },
  string({ meta: { minLength: min, maxLength: max, format } = {} }) {
    let base = getDerivedStringBase({ format });
    void (min !== undefined && (base = base.atLeastLength(min)));
    void (max !== undefined && (base = base.atMostLength(max)));
    return base
  },
  anyOf({ anyOf: xs }) { return xs.reduce((acc, y) => acc.or(y), type.never as type<_>) },
  oneOf({ oneOf: xs }) { return xs.reduce((acc, y) => acc.or(y), type.never as type<_>) },
  const({ const: x }) { return type.unit(x) },
  array({ items: x }) { return x.array() },
  record({ additionalProperties: x }, ix) { return type.Record('string', x) },
  tuple({ items: xs }) { 
    switch (true) {
      default: return type(xs as [])
      case xs.length === 0: return type([])
      case xs.length === 1: return type([xs[0]])
      case xs.length === 2: return type([xs[0], xs[1]])
      case xs.length === 3: return type([xs[0], xs[1], xs[2]])
      case xs.length === 4: return type([xs[0], xs[1], xs[2], xs[3]])
      case xs.length === 5: return type([xs[0], xs[1], xs[2], xs[3], xs[4]])
      case xs.length === 6: return type([xs[0], xs[1], xs[2], xs[3], xs[4], xs[5]])
      case xs.length === 7: return type([xs[0], xs[1], xs[2], xs[3], xs[4], xs[5], xs[6]])
      case xs.length === 8: return type([xs[0], xs[1], xs[2], xs[3], xs[4], xs[5], xs[6], xs[7]])
      case xs.length === 9: return type([xs[0], xs[1], xs[2], xs[3], xs[4], xs[5], xs[6], xs[7], xs[8]])
    }
  },
  allOf({ allOf: xs }, $) { 
    try { return xs.map(deriveObjectNode($)).reduce((acc, y) => acc.and(y), type.unknown) } 
    catch (_) { return type.never }
  },
  object(x, $) { return deriveObjectNode($)(x) },
  $ref({ $ref: x }, $) { return $.refs[x] as never },
} as const satisfies Matchers<type.Any>

const derive
  : Gen.Generator<type.Any>
  = Gen.derive(derivatives, defaults)

const deriveAll
  : (options: Options<type.Any>) => Gen.All<type.Any>
  = (options) => Gen.deriveAll(derive, { ...defaults, ...options })

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
      ? Invariant.InputIsNotSerializable("ark.serialize", x)
      : loop(2)(x)
  }

