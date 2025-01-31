import type { Meta } from "@traversable/core"
import { type Traversable, core, is, keyOf$, tree } from "@traversable/core"
import { fn, object } from "@traversable/data"
import type { _ } from "@traversable/registry"
import { Invariant, KnownFormat, PATTERN } from "@traversable/registry"
import { z } from "zod"

import * as Print from "../print.js"
import type { Index, Matchers, Options } from "../shared.js"
import {
  JsonLike,
  createMask,
  createOpenApiNodePath,
  createTarget,
  createZodIdent,
  defaults as defaults_,
  defineOptions,
  escapePathSegment,
  multilineComment,
} from "../shared.js"

export {
  defaults,
  derive,
  derived,
  generate,
  generated,
  // typelevel,
  // typesOnly,
}

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const JSON_stringify = (u: unknown) => JSON.stringify(u, null, 2)

const defaults = {
  ...defaults_,
  typeName: defaults_.typeName + 'ZodSchema',
} satisfies Omit<Options.Config<unknown>, 'handlers'>

type StringFormat = typeof StringFormat
const StringFormat = {
  [KnownFormat.string.date]: '.date()',
  [KnownFormat.string.datetime]: '.datetime({ offset: true })',
  [KnownFormat.string.email]: '.email()',
  [KnownFormat.string.emoji]: '.emoji()',
  [KnownFormat.string.ipv4]: '.ip({ version: \'v4\' })',
  [KnownFormat.string.ipv6]: '.ip({ version: \'v6\' })',
  [KnownFormat.string.ulid]: '.ulid()',
  [KnownFormat.string.uri]: '.url()',
  [KnownFormat.string.uuid]: '.uuid()',
} as const satisfies { [K in KnownFormat.string[keyof KnownFormat.string]]+?: string }

const StringSchema = {
  [KnownFormat.string.date]: z.string().date(),
  [KnownFormat.string.datetime]: z.string().datetime({ offset: true }),
  [KnownFormat.string.email]: z.string().email(),
  [KnownFormat.string.emoji]: z.string().emoji(),
  [KnownFormat.string.ipv4]: z.string().ip({ version: 'v4' }),
  [KnownFormat.string.ipv6]: z.string().ip({ version: 'v6' }),
  [KnownFormat.string.ulid]: z.string().ulid(),
  [KnownFormat.string.uri]: z.string().url(),
  [KnownFormat.string.uuid]: z.string().uuid(),
} as const satisfies { [K in KnownFormat.string[keyof KnownFormat.string]]+?: ReturnType<typeof z.string> }

const numericConstraints
  : (meta: Meta.Numeric) => string[]
  = ({ exclusiveMaximum: lt, exclusiveMinimum: gt, maximum: max, minimum: min, multipleOf: mod }) => [
    typeof gt === 'number' ? `.gt(${gt})` : min !== undefined && (gt === true ? `.gt(${min})` : `.min(${min})`),
    typeof lt === 'number' ? `.lt(${lt})` : max !== undefined && (lt === true ? `.lt(${max})` : `.max(${max})`),
    mod !== undefined && `.multipleOf(${mod})`,
  ].filter(core.is.string)

const stringConstraints
  : (meta: Meta.string) => string[]
  = ({ format, maxLength: max, minLength: min, pattern }) => [
    format && keyOf$(StringFormat)(format) && StringFormat[format],
    min !== undefined && `.min(${min})`,
    max !== undefined && `.max(${max})`,
    pattern !== undefined && `.regex(${pattern})`
  ].filter(core.is.string)

const Constrain = {
  integer: numericConstraints,
  number: numericConstraints,
  string: stringConstraints,
} as const

const detectIllegalState = (_: string) => _.includes("@example") && _.includes("@link")
const handleIllegalState = (_: string) => Invariant.IllegalState(
  "algebra/zod.generateEntry", 
  "JSDocs for an entry should never have both an example and a JSDoc link.",
  _,
)

const serialize
  : (ix: Index) => (x: unknown) => string
  = (ix) => {
    const loop = (indent: number) => (x: JsonLike): string => {
      switch (true) {
        default: return fn.exhaustive(x)
        case x === null:
        case x === undefined:
        case typeof x === 'boolean':
        case typeof x === 'number': return 'z.literal(' + String(x) + ')'
        case typeof x === 'string': return 'z.literal("' + x + '")'
        case JsonLike.isArray(x): {
          return x.length === 0
            ? 'z.tuple([])'
            : Print.array({ indent })(
              'z.tuple([', 
              ...x.map(loop(indent + 2)), 
              '])'
            )
        }
        case !!x && typeof x === 'object': {
          const entries = Object
            .entries(x)
            .map(([k, v]) => [JSON.stringify(k), loop(indent + 2)(v)] satisfies [any, any])
          return entries.length === 0 
            ? 'z.object({})' 
            : Print.array({ indent })(
              'z.object({',
              ...entries.map(([k, v]) => k + ': ' + v),
              '})'
            )
        }
      }
    }
    return (x: unknown) => !JsonLike.is(x) 
      ? Invariant.NonSerializableInput("zod.serialize", x)
      : loop(ix.indent)(x)
  }

const serializeType
  : (ix: Index) => (x: unknown) => string
  = (ix) => {
    const loop = (indent: number) => (x: JsonLike): string => {
      switch (true) {
        default: return fn.exhaustive(x)
        case x === null:
        case x === undefined:
        case typeof x === 'boolean':
        case typeof x === 'number': return 'z.ZodLiteral<' + String(x) + '>'
        case typeof x === 'string': return 'z.ZodLiteral<"' + x + '">'
        case JsonLike.isArray(x): {
          return x.length === 0
            ? 'z.ZodTuple<[]>'
            : Print.array({ indent })(
              'z.ZodTuple<[', 
              ...x.map(loop(indent + 2)), 
              ']>'
            )
        }
        case !!x && typeof x === 'object': {
          const entries = Object
            .entries(x)
            .map(([k, v]) => [JSON.stringify(k), loop(indent + 2)(v)] satisfies [any, any])
          return entries.length === 0 
            ? 'z.ZodObject<{}>' 
            : Print.array({ indent })(
              'z.ZodObject<{',
              ...entries.map(([k, v]) => k + ': ' + v),
              '}>'
            )
        }
      }
    }
    return (x: unknown) => !JsonLike.is(x) 
      ? Invariant.NonSerializableInput("zod.serializeType", x)
      : loop(ix.indent)(x)
  }

const jsdocs = ($: Index) => (_: string) => 
  !tree.has("example")($) ? _ 
  : [
    `/** `,
    `${" ".repeat($.indent)} * @example`,
    `${" ".repeat($.indent)} * ${multilineComment($.example, { indentBy: $.indent })}`,
    `${" ".repeat($.indent)} */`,
    `${" ".repeat($.indent)}${_}`,
  ].join("\n")

const bubbleExample = (child: string, __debugPath: string[]) => {
  const start = child.indexOf("/**")
  const end = child.indexOf("*/")
  const docs = child.slice(start, end + "*/".length)
  const body = " " + docs.slice("/**".length, -"*/".length).trim()
  const rest = child.slice(end + "*/".length).trim()

  console.log()
  console.log()
  console.log()
  console.log()
  console.log()
  console.log("  =======================")
  console.group("   -+- bubbleExample -+- ")
  console.log("=======================")
  console.log("path:", __debugPath.join("."))
  console.log()
  console.log("-+--> docs\n", docs.trim())
  console.log()
  console.log("-+--> body\n", body.trim())
  console.groupEnd()

  if (start === -1 || !body.includes("@example")) 
    return [child, null] satisfies [any, any]
  else if (detectIllegalState(body)) 
    return (console.log("\n\n\n\n\n\n\n\n\n***********************\n     ILLEGAL STATE\n***********************\n", "\npath:\n", __debugPath.join("/"), "\n\ndocs:\n", docs, "\n\n\n\n\n"), [child, null] satisfies [any, any])
  else 
    return [rest, body] satisfies [any, any]
}

const generateEntry
  : (
    ss: core.Traversable.objectF<string>,
    $: Index,
    optionalTemplate: readonly [before: string, after: string]
  ) => (entry: [string, string]) => string
  = ({ required = [] }, $, [beforeOpt, afterOpt]) => ([k, v]) => {
    // console.log("\n\ntoplevel generateEntry\n", $.absolutePath.join("/"))

    const IDENT = createZodIdent($)([...$.path, 'shape', k]).join('')
    const MASK = createMask($)([...$.path, k]).join('')
    const [VALUE, EXAMPLE] = bubbleExample(v, $.absolutePath)
    const JSDOC_IDENTIFIER = !$.flags.includeJsdocLinks ? null : ' * ## {@link ' + IDENT + ` \`${MASK}\`}`
    const OPENAPI_LINK = $.flags.includeLinkToOpenApiNode === undefined ? null : fn.pipe(
      createOpenApiNodePath($)(['properties', k]).join(''),
      (_) => ` * #### {@link $doc.${_} \`Link to OpenAPI node\`}`
    )

    return ([
      '',
      '/**',
      JSDOC_IDENTIFIER,
      OPENAPI_LINK,
      EXAMPLE,
      ' */',
      `${object.parseKey(k)}: ${!required.includes(k) ? (beforeOpt + VALUE + afterOpt) : VALUE}`,
    ])
    .filter((_) => _ !== null)
    .join(Print.newline($))
  }


const generated = {
  null(_, $) { return jsdocs($)('z.null()') },
  // null(_, $) { return 'z.null()' },
  boolean(_, $) { return jsdocs($)('z.boolean()') },
  // boolean(_, $) { return 'z.boolean()' },
  integer({ meta = {} }, $) { return jsdocs($)(`z.number().int()${Constrain.integer(meta).join('')}`) },
  // integer({ meta = {} }, $) { return `z.number().int()${Constrain.integer(meta).join('')}` },
  number({ meta = {} }, $) { return jsdocs($)(`z.number()${Constrain.number(meta).join('')}`) },
  // number({ meta = {} }, $) { return `z.number()${Constrain.number(meta).join('')}` },
  string({ meta = {} }, $) { return jsdocs($)(`z.string()${Constrain.string(meta).join('')}`) },
  // string({ meta = {} }, $) { return `z.string()${Constrain.string(meta).join('')}` },
  const({ const: xs }, $) { return jsdocs($)(serialize($)(xs)) },
  // const({ const: xs }, $) { return serialize($)(xs) },
  enum({ enum: xs }, $) {
    if (xs.length === 0) return jsdocs($)('z.never()')
    else if (xs.every(core.is.string)) return jsdocs($)('z.enum([' + xs.join(', ') + '])')
    else {
      const ss = xs.filter(core.is.primitive).map((v) => 'z.literal(' + typeof v === 'string' ? JSON_stringify(v) : String(v) + ')')
      return ss.length === 1 ? jsdocs($)(ss[0]) : jsdocs($)(Print.array($)('z.union([', ...ss, '])'))
    }
  },
  // enum({ enum: xs }, $) {
  //   if (xs.length === 0) return 'z.never()'
  //   else if (xs.every(core.is.string)) return 'z.enum([' + xs.join(', ') + '])'
  //   else {
  //     const ss = xs.filter(core.is.primitive).map((v) => 'z.literal(' + typeof v === 'string' ? JSON_stringify(v) : String(v) + ')')
  //     return ss.length === 1 ? ss[0] : Print.array($)('z.union([', ...ss, '])')
  //   }
  // },
  array({ items: s }, $) { return jsdocs($)(Print.array($)('z.array(', s, ')')) },
  // array({ items: s }, $) { return Print.array($)('z.array(', s, ')') },
  record({ additionalProperties: s }, $) { return jsdocs($)(Print.array($)('z.record(', s, ')')) },
  // record({ additionalProperties: s }, $) { return Print.array($)('z.record(', s, ')') },
  tuple({ items: ss }, $) { return jsdocs($)(Print.array($)('z.tuple([', ...ss, '])')) },
  // tuple({ items: ss }, $) { return Print.array($)('z.tuple([', ...ss, '])') },
  anyOf({ anyOf: [s0 = 'z.never()', s1 = 'z.never()', ...ss] }, $) { return jsdocs($)(Print.array($)('z.union([', s0, s1, ...ss, '])')) },
  // anyOf({ anyOf: [s0 = 'z.never()', s1 = 'z.never()', ...ss] }, $) { return Print.array($)('z.union([', s0, s1, ...ss, '])') },
  oneOf({ oneOf: [s0 = 'z.never()', s1 = 'z.never()', ...ss] }, $) { return jsdocs($)(Print.array($)('z.union([', s0, s1, ...ss, '])')) },
  // oneOf({ oneOf: [s0 = 'z.never()', s1 = 'z.never()', ...ss] }, $) { return Print.array($)('z.union([', s0, s1, ...ss, '])') },
  allOf({ allOf: [s0, s1 = 'z.unknown()', ...ss] }, $) {
    switch (true) {
      case s0 === undefined: return jsdocs($)('z.unknown()')
      case ss.length === 0: return jsdocs($)(Print.array($)('z.intersection(', s0, s1, ')'))
      default: return jsdocs($)(Print.array($)('', [s1, ...ss].reduce((acc, x) => acc === '' ? x : `${acc}.and(${x})`, s0), ''))
    }
  },
  // allOf({ allOf: [s0, s1 = 'z.unknown()', ...ss] }, $) {
  //   switch (true) {
  //     case s0 === undefined: return 'z.unknown()'
  //     case ss.length === 0: return Print.array($)('z.intersection(', s0, s1, ')')
  //     default: return Print.array($)('', [s1, ...ss].reduce((acc, x) => acc === '' ? x : `${acc}.and(${x})`, s0), '')
  //   }
  // },
  object(ss, $) {
    const _ = Object_entries(ss.properties).map(generateEntry(ss, $, ['z.optional(', ')'])).join(',')
    const gen = `z.object({${_ + '\n' + ' '.repeat($.indent)}})`
    return jsdocs($)(gen)
    // return gen
  },
  // object(ss, $) {
  //   const _ = Object_entries(ss.properties).map(generateEntry(ss, $, ['z.optional(', ')'])).join(',')
  //   return `z.object({${_ + '\n' + ' '.repeat($.indent)}})`
  // },
} as const satisfies Matchers<string>

/**
 * ## {@link generate `zod.generate`}
 *
 * Given a JSON Schema, OpenAPI document or {@link Traversable} schema, generates the
 * corresponding zod schema as a long, concatenated string.
 *
 * If you need to derive a schema dynamically, _especially_ if the schema comes from
 * some kind of user input, use {@link derive `zod.derive`} instead.
 */
const generate
  : (schema: core.Traversable.any, options: Options<string>) => string
  = fn.flow(
    createTarget(generated),
    ([target, $]) => [
      '/**',
      ` * # {@link ${$.typeName} \`${$.typeName}\`}`,
      ` * - Visit: {@link $doc.${$.absolutePath.map(escapePathSegment).join('.')} OpenAPI definition}`,
      ' */',
      'export type ' + $.typeName + ' = z.infer<typeof ' + $.typeName + '>',
      '//          ^?',
      'export const ' + $.typeName + ' = ' + target,
    ].join('\n')
  )


const derived = {
  null() { return z.null() },
  boolean() { return z.boolean() },
  integer() { return z.number().int() },
  number() { return z.number() },
  string({ meta }) { return (StringSchema[(meta?.format ?? '') as never] ?? z.string()) },
  const() { return z.never() },
  enum({ enum: ss }) {
    const [s0, s1, ...sn] = ss.filter(core.is.primitive).map((v) => z.literal(v))
    return z.union([s0, s1, ...sn])
  },
  allOf({ allOf: ss }) { return ss.reduce((acc, x) => acc.and(x), z.unknown()) },
  anyOf({ anyOf: [s0, s1, ...sn] }) { return z.union([s0, s1, ...sn]) },
  oneOf({ oneOf: [s0, s1, ...sn] }) { return z.union([s0, s1, ...sn]) },
  array({ items: s }) { return z.array(s) },
  tuple({ items: [s, ...ss] }) { return z.tuple([s, ...ss]) },
  record({ additionalProperties: s }) { return z.record(s) },
  object({ properties: ss, additionalProperties: catchall, required = [] }) {
    const xs = Object_entries(ss)
    const opt = xs.filter(([k]) => !required.includes(k))
    const req = xs.filter(([k]) =>  required.includes(k))
    const obj = z.object({
      ...Object_fromEntries(req),
      ...Object_fromEntries(opt.map(([k, v]) => [k, v.optional()] satisfies [any, any])),
    })
    return catchall === undefined ? obj : obj.catchall(catchall)
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
  : (schema: Traversable.any, options: Options<z.ZodTypeAny>) => z.ZodTypeAny
  = fn.flow(
    createTarget(derived),
    ([target]) => target,
  )

// const typesOnly = {
//   null() { return 'z.ZodNull' },
//   boolean() { return 'z.ZodBoolean' },
//   integer() { return 'z.ZodNumber' },
//   number() { return 'z.ZodNumber' },
//   string() { return 'z.ZodString' },
//   enum({ enum: xs }) {
//     return xs.length === 0 ? 'z.ZodNever'
//       : xs.every(core.is.string) ? 'z.ZodEnum<[' + xs.map(JSON_stringify).join(', ') + ']>'
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
//   : (schema: core.Traversable.any, options: Options<string>) => string
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
//     ].filter(core.is.notnull).join(''),
//     encoder: 'z.date().pipe(z.coerce.string())',
//   },
// }
