import * as path from "node:path"

import type { Context, Meta } from "@traversable/core"
import { Extension, type Traversable, core, keyOf$, show } from "@traversable/core"
import { fn, object } from "@traversable/data"
import { openapi } from "@traversable/openapi"
import type { _ } from "@traversable/registry"
import { KnownFormat } from "@traversable/registry"
import { z } from "zod"

import type { Index, Matchers, Options } from "../shared.js"
import { 
  createMask, 
  createOpenApiNodePath, 
  createTarget,
  createZodIdent, 
  defaults as defaults_,
  defineOptions,
} from "../shared.js"
import * as Print from "../print.js"

export {
  defaults,
  derive,
  derived,
  generate,
  generated,
  typelevel,
  typesOnly,
}

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const JSON_stringify = (u: unknown) => JSON.stringify(u, null, 2)

const defaults = {
  ...defaults_,
  typeName: defaults_.typeName + "ZodSchema",
} satisfies Omit<Options.Config<unknown>, "handlers">

///////////////////////////////////
///    CANDIDATES FOR SHARED    ///


///    CANDIDATES FOR SHARED    ///
///////////////////////////////////

/** 
 * TODO: add lightweight infrastructure to support deriving/generating codecs 
 * (lossless to/from transformations that are baked into the parsing layer)
 */
// const StringCodec = {
//   [KnownFormat.string.datetime]: {
//     decoder: "z.string().datetime({ offset: true }).pipe(z.coerce.date())",
//     encoder: "z.date().pipe(z.coerce.string())",
//   },
//   [KnownFormat.string.date]: {
//     decoder: [
//       "z.preprocess((u) =>",
//       "  typeof u === \"string\" ? !Number.isNaN(new Date(u).getTime()) ? new Date(u) : null : u,",
//       "  z.date()",
//       ")"
//     ].filter(core.is.notnull).join(""),
//     encoder: "z.date().pipe(z.coerce.string())",
//   },
// }

type StringFormat = typeof StringFormat
const StringFormat = {
  [KnownFormat.string.datetime]: ".datetime({ offset: true })",
  [KnownFormat.string.date]: ".date()",
  [KnownFormat.string.email]: ".email()",
  [KnownFormat.string.emoji]: ".emoji()",
  [KnownFormat.string.ipv4]: ".ip({ version: \"v4\" })",
  [KnownFormat.string.ipv6]: ".ip({ version: \"v6\" })",
  [KnownFormat.string.ulid]: ".ulid()",
  [KnownFormat.string.uri]: ".url()",
  [KnownFormat.string.uuid]: ".uuid()",
} as const satisfies { [K in KnownFormat.string[keyof typeof KnownFormat.string]]+?: string }

const StringSchema = {
  [KnownFormat.string.datetime]: z.string().datetime({ offset: true }),
  [KnownFormat.string.date]: z.string().date(),
  [KnownFormat.string.email]: z.string().email(),
  [KnownFormat.string.emoji]: z.string().emoji(),
  [KnownFormat.string.ipv4]: z.string().ip({ version: "v4" }),
  [KnownFormat.string.ipv6]: z.string().ip({ version: "v6" }),
  [KnownFormat.string.ulid]: z.string().ulid(),
  [KnownFormat.string.uri]: z.string().url(),
  [KnownFormat.string.uuid]: z.string().uuid(),
} as const satisfies { [K in KnownFormat.string[keyof KnownFormat.string]]+?: ReturnType<typeof z.string> }

const numericConstraints 
  : (meta: Meta.Numeric) => string[]
  = ({ exclusiveMaximum: lt, exclusiveMinimum: gt, maximum: max, minimum: min, multipleOf: factor }) => [
    typeof gt === "number" ? `.gt(${gt})` : min !== undefined && (gt === true ? `.gt(${min})` : `.min(${min})`),
    typeof lt === "number" ? `.lt(${lt})` : max !== undefined && (lt === true ? `.lt(${max})` : `.max(${max})`),
    factor !== undefined && `.multipleOf(${factor})`,
  ].filter(core.is.string)

const enumerableConstraints
  : (meta: Meta.Enumerable) => string[]
  = ({ maxLength: max, minLength: min }) => [
    min !== undefined && `.min(${min})`,
    max !== undefined && `.max(${max})`,
  ].filter(core.is.string)

const stringConstraints
  : (meta: Meta.string) => string[]
  = (meta) => [
    meta.format && keyOf$(StringFormat)(meta.format) && StringFormat[meta.format],
    ...enumerableConstraints(meta),
  ].filter(core.is.string)

const Constrain = {
  integer: numericConstraints,
  number: numericConstraints,
  string: stringConstraints,
} as const

const generateEntry
  : (
    ss: core.Traversable.objectF<string>, 
    $: Index, 
    optionalTemplate: readonly [before: string, after: string]
  ) => (entry: [string, string]) => string
  = ({ required = [] }, $, [beforeOpt, afterOpt]) => ([k, v]) => {
    const IDENT = createZodIdent($)([...$.path, "shape", k]).join("")
    const MASK = createMask($)([...$.path, k]).join("")
    const JSDOC_IDENTIFIER = !$.flags.includeJsdocLinks ? null : " * ## {@link " + IDENT + ` \`${MASK}\`}`
    const OPENAPI_LINK = $.flags.includeLinkToOpenApiNode === undefined ? null : fn.pipe(
      createOpenApiNodePath($)(["properties", k]).join(""),
      (_) => ` * #### {@link $doc.${_} \`Link to OpenAPI node\`}`
    )
    // console.log("v", show.serialize(v, "leuven"))
    return ([
      "",
      "/**",
      JSDOC_IDENTIFIER,
      OPENAPI_LINK,
      " */",
      object.parseKey(k) + ": "
      + (
        !required.includes(k)
        ? v.includes("\n") 
          ? beforeOpt + Print.newline($, 1) + v + afterOpt
          : beforeOpt + v + afterOpt
        : 
        v
      )
    ])
    .filter((_) => _ !== null)
    .join(Print.newline($))
  }


const generated = {
  null() { return "z.null()" as const },
  boolean() { return "z.boolean()" as const },
  integer({ meta = {} }) { return `z.number().int()${Constrain.integer(meta).join("")}` as const },
  number({ meta = {} }) { return `z.number()${Constrain.number(meta).join("")}` as const },
  string({ meta = {} }) { return `z.string()${Constrain.string(meta).join("")}` as const },
  enum({ enum: xs }, $) {
    if (xs.length === 0) return "z.never()"
    else if (xs.every(core.is.string)) return "z.enum([" + xs.join(", ") + "])"
    else {
      const ss = xs.filter(core.is.primitive).map((v) => "z.literal(" + typeof v === "string" ? JSON_stringify(v) : String(v) + ")")
      return ss.length === 1 ? ss[0] : Print.array($)("z.union([", ...ss, "])")
    }
  },
  array({ items: s }, $) { return (console.log("s", s), Print.array($)("z.array(", s, ")")) },
  record({ additionalProperties: s }, $) { return Print.array($)("z.record(", s, ")") },
  tuple({ items: ss }, $) { return Print.array($)("z.tuple([", ...ss, "])") },
  anyOf({ anyOf: [s0 = "z.never()", s1 = "z.never()", ...ss] }, $) { return Print.array($)("z.union([", s0, s1, ...ss, "])") },
  oneOf({ oneOf: [s0 = "z.never()", s1 = "z.never()", ...ss] }, $) { return Print.array($)("z.union([", s0, s1, ...ss, "])") },
  allOf({ allOf: [s0, s1 = "z.unknown()", ...ss] }, $) { 
    switch (true) {
      case s0 === undefined: return "z.unknown()"
      case ss.length === 0: return Print.array($)("z.intersection(", s0, s1, ")")
      default: return Print.array($)("", [s1, ...ss].reduce((acc, x) => acc === "" ? x : `${acc}.and(${x})`, s0), "")
    }
  },
  object(ss, $) {
    return ""
    + "z.object({"
    + Object_entries(ss.properties).map(generateEntry(ss, $, ["z.optional(", ")"])).join(",")
    + "\n" + " ".repeat($.indent) + "})"
  }
} as const satisfies Matchers<string>

const derived = {
  null() { return z.null() },
  boolean() { return z.boolean() },
  integer() { return z.number().int() },
  number() { return z.number() },
  string({ meta }) { return StringSchema[(meta?.format ?? "") as never] ?? z.string() },
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

const typesOnly = {
  null() { return "z.ZodNull" },
  boolean() { return "z.ZodBoolean" },
  integer() { return "z.ZodNumber" },
  number() { return "z.ZodNumber" },
  string() { return "z.ZodString" },
  enum({ enum: xs }) { 
    return xs.length === 0 ? "z.ZodNever" 
      : xs.every(core.is.string) ? "z.ZodEnum<[" + xs.map(JSON_stringify).join(", ") + "]>" 
      : "z.ZodUnion<[" + xs.map((s) => `z.ZodLiteral<${typeof s === "string" ? JSON_stringify : String(s)}>`) + "]>"
  },
  array({ items: s }, $) { return Print.array($)("z.ZodArray<", s, ">") },
  record({ additionalProperties: s }, $) { return Print.array($)("z.ZodRecord<z.ZodString, ", s, ">") },
  tuple({ items: ss }, $) { return Print.array($)("z.ZodTuple<[", ...ss, "]>") },
  anyOf({ anyOf: [s0 = "z.ZodNever", ...ss] }, $) { return Print.array($)("z.ZodUnion<[", s0, ...ss, "]>") },
  oneOf({ oneOf: [s0 = "z.ZodNever", ...ss] }, $) { return Print.array($)("z.ZodUnion<[", s0, ...ss, "]>") },
  allOf({ allOf: [s0, s1 = "z.ZodUnknown", ...ss] }, $) { 
    return s0 === undefined ? "z.ZodUnknown"
      : ss.length === 0 ? s1
      : Print.array($)("", [s1, ...ss].reduce((acc, x) => acc === "" ? x : `z.ZodIntersection<${acc}, ${x}>`, s0), "")
  },
  object(ss, $) {
    return ""
    + "z.ZodObject<{"
    + Object_entries(ss.properties).map(generateEntry(ss, $, ["z.ZodOptional<", ">"])).join(",")
    + "\n" + " ".repeat($.indent) + "}>"
  }
} as const satisfies Matchers<string>

/** 
 * ## {@link generate `zod.generate`}
 * 
 * Given a JSON Schema, OpenAPI document or {@link Traversable} schema, generates the 
 * corresponding zod schema as a long, concatenated string.
 * 
 * Usually you'd use {@link generate `zod.generate`} over {@link derive `zod.derive`}
 * ahead of time, as part of a build step, rather than on the fly. 
 * 
 * If you need to derive a schema dynamically, _especially_ if the schema comes from 
 * some kind of user input, use {@link derive `zod.derive`} instead.
 */
const generate 
  : (schema: core.Traversable.any, options: Options<string>) => string
  = fn.flow(
    createTarget(generated),
    ([target, $]) => [
      "export type " + $.typeName + " = z.infer<typeof " + $.typeName + ">",
      "//          ^?",
      "export const " + $.typeName + " = " + target,
    ].join("\n")
  )

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
 * // If you hover over `a` here 𐋇 you'll see that JSDoc link is broken
 * const ex_04 = identity(ex_02).a
 * // If you hover over `a` here 𐋇 you'll see that JSDoc link works
 */
const typelevel
  : (schema: core.Traversable.any, options: Options<string>) => string
  = fn.flow(
    createTarget(typesOnly),
    ([target, $]) => [
      "export type " + $.typeName + " = z.infer<typeof " + $.typeName + ">",
      "//          ^?",
      "export declare const " + $.typeName + ": " + target,
    ].join("\n")
  )
