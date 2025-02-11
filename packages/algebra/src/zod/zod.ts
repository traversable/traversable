import { z } from 'zod'

import type { Meta, Traversable } from '@traversable/core'
import { schema } from '@traversable/core'
import { fn, object } from '@traversable/data'
import type { _ } from '@traversable/registry'
import { Invariant, KnownFormat } from '@traversable/registry'

import * as Gen from '../generator.js'
import * as JSDoc from '../jsdoc.js'
import * as Print from '../print.js'
import { unsafeFromUnknownValue as fromValueObject, serialize } from './algebra.js'

import type { Index, Matchers, TargetTemplate } from '../shared.js'
import {
  type Options,
  createMask,
  createZodIdent,
  defaults as defaults_,
  escapePathSegment,
  linkToOpenAPIDocument,
} from '../shared.js'

export {
  type Formats,
  NS,
  TypeName,
  dependencies,
  defaults,
  template,
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
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const Array_isArray = globalThis.Array.isArray
/** @internal */
const twoOrMore = <T>(u: readonly T[]): u is readonly [T, T, ...T[]] => Array_isArray(u) && u.length > 1
/** @internal */
const TooFew = (xs: readonly z.ZodTypeAny[]) => Invariant.ZodUnionsRequireTwoOrMore('algebra/zod.derivatives', xs)
/** @internal */
const isNonEmptyArrayOf
  : <T>(guard: (u: unknown) => u is T) => (u: unknown) => u is readonly [T, ...T[]]
  = (guard) => (u): u is never => Array_isArray(u) && u.every(guard)

type NS = typeof NS
const NS = 'z' as const

type TypeName = typeof TypeName
const TypeName = 'zod' as const

const dependencies = [] as const satisfies string[]
const headers = [
  `import { ${NS} } from "zod"`,
  ...dependencies,
] as const satisfies string[]

const template = (
  (target, $) => {
    const linkToOpenApiNode = $.flags.includeLinkToOpenApiNode 
      ? ` * - Visit: {@link $doc.${
        $.absolutePath.map(escapePathSegment).join('.')
      } OpenAPI definition}` as const
      : null
    const comment 
      = !$.flags.includeComment ? [] 
      : [
        '/**',
        ` * # {@link ${$.typeName} \`${$.typeName}\`}`,
        linkToOpenApiNode,
        ' */',
      ].filter((_) => _ !== null)

    return [
      ...comment,
      `export type ${$.typeName} = `,
      `  ${NS}.infer<typeof ${$.typeName}>`,
      `export const ${$.typeName} = ${
        $.maxWidth < (`export const ${$.typeName} = ${target}`.length)
          ? `\n  ${target}` 
          : target
      }`,
    ]
}) satisfies TargetTemplate

const Formats = {
  integer: {
    compile: {
      [KnownFormat.integer.int32]: `${NS}.number()`,
      [KnownFormat.integer.int64]: `${NS}.number()`,
    } satisfies { [K in KnownFormat.integer[keyof KnownFormat.integer]]+?: string },
    derive: {
      [KnownFormat.integer.int32]: z.number().int(),
      [KnownFormat.integer.int64]: z.number().int(),
    } satisfies { [K in KnownFormat.integer[keyof KnownFormat.integer]]+?: ReturnType<typeof z.number> },
  },
  number: {
    compile: {
      [KnownFormat.number.double]: `${NS}.number()`,
      [KnownFormat.number.float]: `${NS}.number()`,
    } satisfies { [K in KnownFormat.number[keyof KnownFormat.number]]+?: string },
    derive: {
      [KnownFormat.number.double]: z.number(),
      [KnownFormat.number.float]: z.number(),
    } satisfies { [K in KnownFormat.number[keyof KnownFormat.number]]+?: ReturnType<typeof z.number> },
  },
  string: {
    compile: {
      [KnownFormat.string.date]: '.date()',
      [KnownFormat.string.datetime]: '.datetime({ offset: true })',
      [KnownFormat.string.email]: '.email()',
      [KnownFormat.string.emoji]: '.emoji()',
      [KnownFormat.string.ipv4]: '.ip({ version: \'v4\' })',
      [KnownFormat.string.ipv6]: '.ip({ version: \'v6\' })',
      [KnownFormat.string.ulid]: '.ulid()',
      [KnownFormat.string.uri]: '.url()',
      [KnownFormat.string.uuid]: '.uuid()',
    } as const satisfies { [K in KnownFormat.string[keyof KnownFormat.string]]+?: string },
    derive: {
      [KnownFormat.string.date]: z.string().date(),
      [KnownFormat.string.datetime]: z.string().datetime({ offset: true }),
      [KnownFormat.string.emoji]: z.string().emoji(),
      [KnownFormat.string.ipv4]: z.string().ip({ version: 'v4' }),
      [KnownFormat.string.ipv6]: z.string().ip({ version: 'v6' }),
      [KnownFormat.string.ulid]: z.string().ulid(),
      [KnownFormat.string.uri]: z.string().url(),
      [KnownFormat.string.uuid]: z.string().uuid(),
      // [KnownFormat.string.email]: z.string().email(),
    } as const satisfies { [K in KnownFormat.string[keyof KnownFormat.string]]+?: ReturnType<typeof z.string> },
  },
} as const

const defaults = {
  derive: {
    ...defaults_,
    typeName: defaults_.typeName + TypeName,
    header: headers,
    template,
    integerFormats: Formats.integer.derive,
    numberFormats: Formats.number.derive,
    stringFormats: Formats.string.derive,
  },
  compile: {
    ...defaults_,
    typeName: defaults_.typeName + TypeName,
    header: headers,
    template,
    integerFormats: Formats.integer.compile,
    numberFormats: Formats.number.compile,
    stringFormats: Formats.string.compile,
  },
}

const numericConstraints
  : (meta: Meta.Numeric) => string[]
  = ({ exclusiveMaximum: lt, exclusiveMinimum: gt, maximum: max, minimum: min, multipleOf: mod }) => [
    typeof gt === 'number' ? `.gt(${gt})` : min !== undefined && (gt === true ? `.gt(${min})` : `.min(${min})`),
    typeof lt === 'number' ? `.lt(${lt})` : max !== undefined && (lt === true ? `.lt(${max})` : `.max(${max})`),
    mod !== undefined && `.multipleOf(${mod})`,
  ].filter(schema.is.string)

const derivedNumericConstraints
  : (meta: Meta.Numeric, base: z.ZodNumber) => z.ZodNumber
  = ({ exclusiveMaximum: lt, exclusiveMinimum: gt, maximum: max, minimum: min, multipleOf: mod }, base) => {
    if (typeof gt === 'number') base = base.gt(gt)
    else if (min !== undefined) {
      if (gt === true) base = base.gt(min)
      else if (gt === false) base = base.min(min)
    }
    if (typeof lt === 'number') base = base.lt(lt)
    else if (max !== undefined) {
      if (lt === true) base = base.lt(max)
      else if (lt === false) base = base.max(max)
    }
    if (mod !== undefined) base = base.multipleOf(mod)
    return base
  }

const stringConstraints
  : (meta: Meta.string) => string[]
  = ({ format, maxLength: max, minLength: min, pattern }) => [
    format && schema.keyOf$(Formats.string.compile)(format) && Formats.string.compile[format],
    min !== undefined && `.min(${min})`,
    max !== undefined && `.max(${max})`,
    pattern !== undefined && `.regex(${pattern})`
  ].filter(schema.is.string)

const derivedStringConstraints
  : (meta: Meta.string) => z.ZodString
  = ({ format, maxLength: max, minLength: min, pattern }) => {
    let base = z.string()
    if (format && schema.keyOf$(Formats.string.derive)(format)) base = Formats.string.derive[format]
    if (min !== undefined) base = base.min(min)
    if (max !== undefined) base = base.max(max)
    if (pattern !== undefined) base = base.regex(new RegExp(pattern))
    return base
  }

const Constrain = {
  integer: numericConstraints,
  number: numericConstraints,
  string: stringConstraints,
} as const

const ConstrainDerivative = {
  integer: derivedNumericConstraints,
  number: derivedNumericConstraints,
  string: derivedStringConstraints,
}

const compilers = {
  any(_, $) { return `${NS}.unknown()` },
  null(_, $) { return `${NS}.null()` },
  boolean(_, $) { return `${NS}.boolean()` },
  integer({ meta = {} }, $) { return `${NS}.number().int()${Constrain.integer(meta).join('')}` },
  number({ meta = {} }, $) { return `${NS}.number()${Constrain.number(meta).join('')}` },
  string({ meta = {} }, $) { return `${NS}.string()${Constrain.string(meta).join('')}` },
  const({ const: xs }, $) { return serialize($.indent, xs) },
  enum({ enum: xs }, $) {
    if (xs.length === 0) return `${NS}.never()`
    else if (xs.every(schema.is.string)) 
      return Print.array($)(`${NS}.enum([`, ...xs, `])`)
    else return `${NS}.union([${serialize($.indent, xs)}])`
  },
  array({ items: s }, $) { return Print.array($)(`${NS}.array(`, s, ')') },
  record({ additionalProperties: s }, $) { return Print.array($)(`${NS}.record(`, s, ')') },
  tuple({ items: ss }, $) { return Print.array($)(`${NS}.tuple([`, ...ss, '])') },
  object(ss, $) { return compileObjectNode($)(ss) },
  anyOf({ anyOf: xs }, $) {
    switch (true) {
      case xs.length === 0: return `${NS}.never()`
      case xs.length === 1: return xs[0]
      default: return Print.array($)(`${NS}.union([`, ...xs, '])')
    }
  },
  oneOf({ oneOf: xs }, $) {
    switch (true) {
      case xs.length === 0: return `${NS}.never()`
      case xs.length === 1: return xs[0]
      default: return Print.array($)(`${NS}.union([`, ...xs, '])')
    }
  },
  allOf({ allOf: x }, $) {
    // const xs = x.map(compileObjectNode($))
    switch (true) {
      case x.length === 0: return `${NS}.unknown()`
      case x.length === 1: return Print.array($)(`${NS}.intersection(`, x[0] as never as string, `${NS}.unknown()`, `)`)
      // case xs.length === 2: return Print.array($)(`${NS}.intersection(`, xs[0], xs[1], ')')
      default: return Print.array($)('', ...x.slice(1).reduce((acc, x) => `${acc}.and(${x})`, ''), '')
    }
  },
  $ref({ $ref: x }, $) {
    const reference = $.refs[x]
    return x
  }
} as const satisfies Matchers<string>

/**
 * ## {@link compile `zod.compile`}
 *
 * Given a JSON Schema, OpenAPI document or {@link Traversable} schema, compiles the
 * corresponding zod schema in string form.
 *
 * If you need to derive a schema dynamically, for example if the spec comes from
 * some kind of user input, use {@link derive `zod.derive`} instead.
 */
const compile
  : Gen.Generator<string>
  = Gen.compile(compilers, defaults.compile)

const compileAll
  : (options: Options<string>) => Gen.All<string>
  = (options) => Gen.compileAll(compile, { ...defaults.compile, ...options })

const deriveObjectNode
  : ($: Index) => (x: Traversable.objectF<z.ZodTypeAny>) => z.ZodTypeAny
  = ($) => ({ properties: p, additionalProperties: catchall, required = [] }) => {
    const xs = Object_entries(p)
    const opt = xs.filter(([k]) => !required.includes(k))
    const req = xs.filter(([k]) =>  required.includes(k))
    const obj = z.object({
      ...Object_fromEntries(req),
      ...Object_fromEntries(opt.map(([k, v]) => [k, z.optional(v)] satisfies [any, any])),
    })
    return catchall === undefined ? obj : obj.catchall(catchall)
  }

const derivatives = {
  any() { return z.unknown() },
  null() { return z.null() },
  boolean() { return z.boolean() },
  integer({ meta = {} }) { return ConstrainDerivative.integer(meta, z.number().int()) },
  number({ meta = {} }) { return ConstrainDerivative.number(meta, z.number()) },
  string({ meta = {} }) { return ConstrainDerivative.string(meta) },
  const({ const: x }, $) { return fromValueObject(x)  },
  enum({ enum: xs }) {
    return isNonEmptyArrayOf(schema.is.string)(xs)
      ? z.enum(xs)
      : fn.pipe( xs.map(fromValueObject), (s) => twoOrMore(s) ? z.union(s) : TooFew(s))
  },
  allOf({ allOf: xs }, $) { return xs.reduce((acc, x) => acc.and(x), z.unknown()) },
  anyOf({ anyOf: xs }) { return twoOrMore(xs) ? z.union(xs) : TooFew(xs) },
  oneOf({ oneOf: xs }) { return twoOrMore(xs) ? z.union(xs) : TooFew(xs) },
  array({ items: s }) { return z.array(s) },
  tuple({ items: [s, ...ss] }) { return z.tuple([s, ...ss]) },
  record({ additionalProperties: s }) { return z.record(s) },
  object(ss, $) { return deriveObjectNode($)(ss) },
  $ref({ $ref: x }, $) {
    return z.never()
  }
} as const satisfies Matchers<z.ZodTypeAny>

/**
 * ## {@link derive `zod.derive`}
 *
 * Given a JSON Schema, OpenAPI document or {@link Traversable} schema, generates the
 * corresponding zod schema in-memory.
 *
 * Usually you'd use {@link derive `zod.derive`} over {@link generate `zod.generate`}
 * when you don't have control over the schema, and you don't know the schema ahead of
 * time (i.e., the schema is dynamic in some way).
 *
 * If you do know the schema at compile time, using {@link generate `zod.generate`} is
 * more efficient.
 */
const derive
  : Gen.Generator<z.ZodTypeAny>
  = Gen.derive(derivatives, defaults.derive)

const deriveAll
  : (options: Options<z.ZodTypeAny>) => Gen.All<z.ZodTypeAny>
  = (options) => Gen.deriveAll(derive, { ...defaults, ...options })

function linkToNode(k: string, $: Index): string | null {
  const IDENT = createZodIdent($)([...$.path, 'shape', k]).join('')
  const MASK = createMask($)([...$.path, k]).join('')
  return !$.flags.includeJsdocLinks
    ? null
    : ' * ## {@link ' + IDENT + ` \`${MASK}\`}`
}

const compileObjectNode = ($: Index) => (ss: Traversable.objectF<string>) => {
  const xs = Object_entries(ss.properties)
  return xs.length === 0
    ? `${NS}.object({})`
    : Print.array($)(
      `${NS}.object({`,
      ...xs.map(generateEntry(ss, $, ['', '.optional()'])),
      `})`.concat(!ss.additionalProperties ? '' : `.catchall(${ss.additionalProperties})`),
    )
    // : `${NS}.object({`
    // + xs.map(generateEntry(ss, $, ['', '.optional()'])).join(',')
    // + '\n'
    // + ' '.repeat($.indent)
    // + '})'
    // + (!ss.additionalProperties ? '' : `.catchall(${ss.additionalProperties})`)
}


function generateEntry(
    { required = [] }: Traversable.objectF<string>,
    $: Index,
    [BEFORE_OPT, AFTER_OPT]: readonly [before: string, after: string]
): (entry: [string, string]) => string {
  return ([k, v]) => {
    const EXAMPLE_TAG = $.flags.includeExamples ? JSDoc.example(k, $) : null
    const DESCRIPTION_TAG = $.flags.includeDescription ? JSDoc.description(k, $) : null
    const LINK_HERE = $.flags.includeJsdocLinks ? linkToNode(k, $) : null
    const LINK_TO_DOC = $.flags.includeLinkToOpenApiNode ? linkToOpenAPIDocument(k, $) : null
    const JSDOCS = [LINK_HERE, LINK_TO_DOC, DESCRIPTION_TAG, EXAMPLE_TAG].filter((_) => _ !== null)
    const COMMENT = JSDOCS.length === 0 ? [] : ['/**', ...JSDOCS, ' */']
    return ([
      ...COMMENT,
      `${object.parseKey(k)}: ${
        !required.includes(k)
          ? (BEFORE_OPT + v + AFTER_OPT)
          : v
      }`,
    ])
    .join(Print.newline($))
  }
}

