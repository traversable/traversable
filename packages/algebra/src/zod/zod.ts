import { z } from 'zod'

import type { Meta, Traversable } from '@traversable/core'
import { schema } from '@traversable/core'
import { fn, object } from '@traversable/data'
import type { _ } from '@traversable/registry'
import { Invariant, KnownFormat } from '@traversable/registry'

import * as Gen from '../generator.js'
import * as JSDoc from '../jsdoc.js'
import * as Print from '../print.js'
import { fromUnknownValue, unsafeFromUnknownValue as fromValueObject, serialize } from './algebra.js'

import type { Index, Matchers, TargetTemplate } from '../shared.js'
import {
  JsonLike,
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
const JSON_stringify = (u: unknown) => JSON.stringify(u, null, 2)
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
  (target, $) => [
    '/**',
    ` * # {@link ${$.typeName} \`${$.typeName}\`}`,
    ` * - Visit: {@link $doc.${$.absolutePath.map(escapePathSegment).join('.')} OpenAPI definition}`,
    ' */',
    `export type ${$.typeName} = `,
    `  ${NS}.infer<typeof ${$.typeName}>`,
    `export const ${$.typeName} = ${
      $.maxWidth < (`export const ${$.typeName} = ${target}`.length)
        ? `\n  ${target}` 
        : target
    }`,
  ] as const satisfies string[]
)  satisfies TargetTemplate

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

const stringConstraints
  : (meta: Meta.string) => string[]
  = ({ format, maxLength: max, minLength: min, pattern }) => [
    format && schema.keyOf$(Formats.string.compile)(format) && Formats.string.compile[format],
    min !== undefined && `.min(${min})`,
    max !== undefined && `.max(${max})`,
    pattern !== undefined && `.regex(${pattern})`
  ].filter(schema.is.string)

const Constrain = {
  integer: numericConstraints,
  number: numericConstraints,
  string: stringConstraints,
} as const

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
    const xs = x.map(compileObjectNode($))
    switch (true) {
      case xs.length === 0: return `${NS}.unknown()`
      case xs.length === 1: return Print.array($)(`${NS}.intersection(`, xs[0], `${NS}.unknown()`, `)`)
      // case xs.length === 2: return Print.array($)(`${NS}.intersection(`, xs[0], xs[1], ')')
      default: return Print.array($)('', ...xs.slice(1).reduce((acc, x) => `${acc}.and(${x})`, ''), '')
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
  integer() { return z.number().int() },
  number() { return z.number() },
  string({ meta }) { return (Formats.string.derive[(meta?.format ?? '') as never] ?? z.string()) },
  const({ const: x }, $) { return fromValueObject(x)  },
  enum({ enum: xs }) {
    return isNonEmptyArrayOf(schema.is.string)(xs)
      ? z.enum(xs)
      : fn.pipe( xs.map(fromValueObject), (s) => twoOrMore(s) ? z.union(s) : TooFew(s))
  },
  allOf({ allOf: xs }, $) { return xs.map(deriveObjectNode($)).reduce((acc, x) => acc.and(x), z.unknown()) },
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
      xs.map(generateEntry(ss, $, ['', '.optional()'])).join(','),
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
    const EXAMPLE_TAG = JSDoc.example(k, $)
    const DESCRIPTION_TAG = JSDoc.description(k, $)
    const LINK_HERE = linkToNode(k, $)
    const LINK_TO_DOC = linkToOpenAPIDocument(k, $)
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
    .filter((_) => _ !== null)
    .join(Print.newline($))
  }
}


const isArray
  : (u: unknown) => u is z.ZodTypeAny[]
  = globalThis.Array.isArray
const isObject
  : (u: unknown) => u is Record<string, z.ZodTypeAny>
  = (u): u is never => !!u && typeof u === 'object'



// const typesOnly = {
//   null() { return 'z.ZodNull' },
//   boolean() { return 'z.ZodBoolean' },
//   integer() { return 'z.ZodNumber' },
//   number() { return 'z.ZodNumber' },
//   string() { return 'z.ZodString' },
//   enum({ enum: xs }) {
//     return xs.length === 0 ? 'z.ZodNever'
//       : xs.every(schema.is.string) ? 'z.ZodEnum<[' + xs.map(JSON_stringify).join(', ') + ']>'
//       : 'z.ZodUnion<[' + xs.map((s) => `z.ZodLiteral<${typeof s === 'string' ? JSON_stringify : String(s)}>`) + ']>'
//   },
//   // const() {},
//   const({ const: x }, ix) { return serializeType(ix)(x) },
//   array({ items: s }, $) { return Print.array($)('z.ZodArray<', s, '>') },
//   record({ additionalProperties: s }, $) { return Print.array($)('z.ZodRecord<z.ZodString, ', s, '>') },
//   tuple({ items: ss }, $) { return Print.array($)('z.ZodTuple<[', ...ss, ']>') },
//   anyOf({ anyOf: [s0 = 'z.ZodNever', ...ss] }, $) { return Print.array($)('z.ZodUnion<[', s0, ...ss, ']>') },
//   oneOf({ oneOf: [s0 = 'z.ZodNever', ...ss] }, $) { return Print.array($)('z.ZodUnion<[', s0, ...ss, ']>') },
//   allOf({ allOf: [s0, s1 = 'z.ZodUnknown', ...ss] }, $) {
//     return s0 === undefined ? s1
//       : ss.length === 0 ? s1
//       : Print.array($)('', [s1, ...ss].reduce((acc, x) => acc === '' ? x : `z.ZodIntersection<${acc}, ${x}>`, s0), '')
//   },
//   object(ss, $) {
//     return ''
//     + 'z.ZodObject<{'
//     + Object_entries(ss.properties).map(generateEntry(ss, $, ['z.ZodOptional<', '>'])).join(',')
//     + '\n' + ' '.repeat($.indent) + '}>'
//   }
// } as const satisfies Matchers<string>

/**
 * ## {@link typelevel `zod.typelevel`}
 *
 * Given a JSON Schema, OpenAPI document or {@link Traversable} schema, generates the
 * __types__ that __would be generated__ by the spec.
 *
 * This target is intended for users who _only want to generate types_, and don't need
 * the zod schemas, but _still_ want the generated types to include JSDoc links and
 * OpenAPI links.
 *
 * This is required do to an implementation detail of this codegen strategy, combined
 * with a limitation of TypeScript's JSDoc implementation that makes it significantly
 * easier to create deeply nested links to particular nodes if that node's type is
 * defined as a declaration, e.g.:
 *
 * @example
 * interface Ex01 {
 *   /\** # {@link Ex01["a"] `Ex01["a"]`} *\/
 *   a: {
 *     /\** # {@link Ex01["a"]["b"] `Ex01["b"]`} *\/
 *     b: {
 *       /\** # {@link Ex01["a"]["b"]["c"] `Ex01["c"]`} *\/
 *       c: 123
 *     }
 *   }
 * }
 * declare const ex_01: Ex01
 *
 * declare const ex_02: {
 *   /\** # {@link ex_02.a `Ex02["a"]`} *\/
 *   a: {
 *     /\** # {@link ex_02.b `Ex02["b"]`} *\/
 *     b: {
 *       /\** # {@link ex_02.c `Ex02["c"]`} *\/
 *       c: 456
 *     }
 *   }
 * }
 *
 * type Id<T> = T
 * interface Ex02 extends Id<typeof ex_02> {}
 *
 * function identity<T>(x: T): T { return x }
 *
 * const ex_03 = identity(ex_01).a
 * // If you hover over `a` here 𐋇 you'll see that the JSDoc link is broken
 * const ex_04 = identity(ex_02).a
 * // If you hover over `a` here 𐋇 you'll see that the JSDoc link works 🥳
 */
// const typelevel
//   : (schema: Traversable.orJsonSchema, options: Options<string>) => string
//   = fn.flow(
//     createTarget(typesOnly),
//     ([target, $]) => [
//       '/**',
//       ` * # {@link ${$.typeName} \`${$.typeName}\`}`,
//       ` * - Visit: {@link $doc.${$.absolutePath.map(escapePathSegment).join('.')} OpenAPI definition}`,
//       ' */',
//       'export type ' + $.typeName + ' = z.infer<typeof ' + $.typeName + '>',
//       '//          ^?',
//       'export declare const ' + $.typeName + ': ' + target,
//     ].join('\n')
//   )

/**
 * TODO: add lightweight infrastructure to support deriving/generating codecs
 * (lossless to/from transformations that are baked into the parsing layer)
 */
// const StringCodec = {
//   [KnownFormat.string.datetime]: {
//     decoder: 'z.string().datetime({ offset: true }).pipe(z.coerce.date())',
//     encoder: 'z.date().pipe(z.coerce.string())',
//   },
//   [KnownFormat.string.date]: {
//     decoder: [
//       'z.preprocess((u) =>',
//       '  typeof u === \'string\' ? !Number.isNaN(new Date(u).getTime()) ? new Date(u) : null : u,',
//       '  z.date()',
//       ')'
//     ].filter(schema.is.notnull).join(''),
//     encoder: 'z.date().pipe(z.coerce.string())',
//   },
// }

// const serializeType
//   : (ix: Index) => (x: unknown) => string
//   = (ix) => {
//     const loop = (indent: number) => (x: JsonLike): string => {
//       switch (true) {
//         default: return fn.exhaustive(x)
//         case x === null:
//         case x === undefined:
//         case typeof x === 'boolean':
//         case typeof x === 'number': return 'z.ZodLiteral<' + String(x) + '>'
//         case typeof x === 'string': return 'z.ZodLiteral<"' + x + '">'
//         case JsonLike.isArray(x): {
//           return x.length === 0
//             ? 'z.ZodTuple<[]>'
//             : Print.array({ indent })(
//               'z.ZodTuple<[',
//               ...x.map(loop(indent + 2)),
//               ']>'
//             )
//         }
//         case !!x && typeof x === 'object': {
//           const entries = Object
//             .entries(x)
//             .map(([k, v]) => [JSON.stringify(k), loop(indent + 2)(v)] satisfies [any, any])
//           return entries.length === 0
//             ? 'z.ZodObject<{}>'
//             : Print.array({ indent })(
//               'z.ZodObject<{',
//               ...entries.map(([k, v]) => k + ': ' + v),
//               '}>'
//             )
//         }
//       }
//     }
//     return (x: unknown) => !JsonLike.is(x)
//       ? Invariant.NonSerializableInput("zod.serializeType", x)
//       : loop(ix.indent)(x)
//   }

