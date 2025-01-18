import * as path from "node:path"
import { type } from "arktype"

import type { Context, Meta } from "@traversable/core"
import { type Extension, Traversable, core, keyOf$ } from "@traversable/core"
import { fn, object } from "@traversable/data"
import { openapi } from "@traversable/openapi"
import type { _ } from "@traversable/registry"
import { KnownFormat } from "@traversable/registry"
import { z } from "zod"

import type { Index, Matchers, Options } from "../shared.js"
import * as Print from "../print.js"
import {
  createMask,
  createOpenApiNodePath,
  createZodIdent,
  createTarget,
  defaults as defaults_,
  escapePathSegment,
  unescapePathSegment,
} from "../shared.js"

export {
  defaults,
  // generate,
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
  typeName: defaults_.typeName + "ArkTypeSchema",
}  satisfies Omit<Options.Config<unknown>, "handlers">

type("null")
type("boolean")
type("number.integer <= 1")
type("string")
type("string[]")
type("Record<string, number>")
type('"hey" | "ho" | "lets"')
type('never')

type asa = typeof asa.infer
const asa = type({ a: type("string", "[]") })


const sd = type("string.date")
const suuid = type("string.uuid")
const uri = type("string.url")
const ipv4 = type("string.ip.v4")
const ipv6 = type("string.ip.v6")
const mult = type("number % 10")


type StringFormat = typeof StringFormat
const StringFormat = {
  [KnownFormat.string.datetime]: ".date.iso",
  [KnownFormat.string.date]: ".date",
  [KnownFormat.string.email]: ".email",
  [KnownFormat.string.emoji]: "",
  [KnownFormat.string.ipv4]: ".ip",
  [KnownFormat.string.ipv6]: "",
  [KnownFormat.string.ulid]: "",
  [KnownFormat.string.uri]: ".url",
  [KnownFormat.string.uuid]: ".uuid",
} as const satisfies { [K in KnownFormat.string[keyof typeof KnownFormat.string]]+?: string }

const StringSchema = {
  [KnownFormat.string.datetime]: type(`string${StringFormat["date-time"]}`),
  [KnownFormat.string.date]: type(`string${StringFormat.date}`),
  [KnownFormat.string.email]: type(`string${StringFormat.email}`),
  [KnownFormat.string.emoji]: type(`string${StringFormat.emoji}`),
  [KnownFormat.string.ipv4]: type(`string${StringFormat.ipv4}`),
  [KnownFormat.string.ipv6]: type(`string${StringFormat.ipv6}`),
  [KnownFormat.string.ulid]: type(`string${StringFormat.ulid}`),
  [KnownFormat.string.uri]: type(`string${StringFormat.uri}`),
  [KnownFormat.string.uuid]: type(`string${StringFormat.uuid}`),
} as const satisfies { [K in KnownFormat.string[keyof KnownFormat.string]]+?: ReturnType<typeof z.string> }

const preNumeric
  : (meta: Meta.Numeric) => string[]
  = ({ exclusiveMaximum: lt, exclusiveMinimum: gt, maximum: max, minimum: min, multipleOf: factor }) => [
    factor !== undefined && `(`,
    typeof gt === "number" ? `${gt} < ` : min !== undefined && (gt === true ? `${min} < ` : `${min} <= `),
  ].filter(core.is.string)

const postNumeric
  : (meta: Meta.Numeric) => string[]
  = ({ exclusiveMaximum: lt, exclusiveMinimum: gt, maximum: max, minimum: min, multipleOf: factor }) => [
    typeof lt === "number" ? ` < ${lt}` : max !== undefined && (lt === true ? ` < ${max}` : ` <= ${max}`),
    factor !== undefined && `) % ${factor}`,
  ].filter(core.is.string)

const preString
  : (meta: Meta.Enumerable) => string[]
  = ({ minLength: min }) => [
    min !== undefined && `${min} < `,
  ].filter(core.is.string)

const postString
  : (meta: Meta.string) => string[]
  = ({ maxLength: max, format }) => [
    // format && keyOf$(StringFormat)(meta.format) && StringFormat[meta.format],
    format && keyOf$(StringFormat)(format) && StringFormat[format],
    max !== undefined && ` < ${max}`,
  ].filter(core.is.string)

// const stringConstraints
//   : (meta: Meta.string) => string[]
//   = (meta) => [
//     meta.format && keyOf$(StringFormat)(meta.format) && StringFormat[meta.format],
//     ...enumerableConstraints(meta),
//   ].filter(core.is.string)

const Constrain = {
  integer: { pre: preNumeric, post: postNumeric },
  number: { pre: preNumeric, post: postNumeric },
  string: { pre: preString, post: postString },
} as const

const generateEntry
  : (
    ss: core.Traversable.objectF<string>,
    $: Index,
  ) => (entry: [string, string]) => string
  = ({ required = [] }, $ ) => ([k, v]) => {
    console.log("REQUIRED", required)
    return [
      "",
      (!required.includes(k) ? JSON.stringify(k + "?") : k) 
      + ": "
      + v,
    ].filter((_) => _ !== null)
    .join(Print.newline($))

    // const IDENT = createZodIdent($)([...$.path, "shape", k]).join("")
    // const MASK = createMask($)([...$.path, k]).join("")
    // const JSDOC_IDENTIFIER = !$.flags.includeJsdocLinks ? null : " * ## {@link " + IDENT + ` \`${MASK}\`}`
    // const OPENAPI_LINK = $.flags.includeLinkToOpenApiNode === undefined ? null : fn.pipe(
    //   createOpenApiNodePath($)(["properties", k]).join(""),
    //   (_) => ` * #### {@link $doc.${_} \`Link to OpenAPI node\`}`
    // )
    // return ([
    //   "",
    //   // "/**",
    //   // JSDOC_IDENTIFIER,
    //   // OPENAPI_LINK,
    //   // " */",
    //   k + !required.includes(k) ? "?" : ""
    //   + ": "
    //   + (
    //     v.includes("\n")
    //     ? Print.newline($, 1) + v
    //     : v
    //   )
    // ])
    // 
    // .join(Print.newline($))
  }


const ScalarEntries = [
  ["null", '"null"'],
  ["boolean", '"boolean"'],
  ["integer", '"number.integer"'],
  ["number", '"number"'],
  ["string", '"string"'],
] as const satisfies [string, any][]
type Scalar = typeof Scalar[keyof typeof Scalar]
const Scalar = object.fromEntries(ScalarEntries)
const Scalars: string[] = ScalarEntries.map(([, s]) => s)
const isScalar = (u: unknown): u is Scalar => typeof u === "string" && (
  Scalars.includes(u) ||
  Scalars.some((s) => u.startsWith(s)) || 
  Scalars.some((s) => u.startsWith(s))
  // !u.includes("{")
  // Scalars.(([, s]) => (s + "[][]") as unknown).includes(u)
)

//  ||
  // Scalars.map(([, s]) => s).includes(u as never)
  

const generated = {
  null() { return "type.null" },
  boolean() { return "type.boolean" },
  integer() { return "type.number" },
  number() { return "type.number" },
  string() { return "type.string" },
  enum() { return "" },
  array({ items: xs }) { return xs + ".array()" },
  tuple({ items: xs }) { return "[" + xs.join(", ") + "]" },
  record() { return "" },
  allOf() { return "" },
  anyOf({ anyOf: [x, ...xs] }) { 
    return [
      x.startsWith("type(") ? x : "type(" + x + ")",
      xs.reduce((acc, cur) => `${acc}.or(${cur.startsWith("type(") ? cur.slice(5, -1) : cur})`, "")
    ].filter((_) => _ !== null)
    .join("\n")
  },
  oneOf() { return "" },
  object({ properties: p, required: req = [] }, $) { 
    const xs = Object_entries(p)
    return xs.length === 0 
      ? "{}" 
      : Print.array($)(
        "{" ,
        ...xs.map(([k, v]) => req.includes(k) ? `${k}: ${v}` : `${JSON.stringify(k + "?")}: ${v}`),
        "}"
      )
  },
} as const satisfies Matchers<string>

// const generated = {
//   null() { return '"null"' as const },
//   boolean() { return '"boolean"' as const },
//   integer({ meta = {} }) { return `"${Constrain.integer.pre(meta).join("")}number.integer${Constrain.integer.post(meta).join("")}"` },
//   number({ meta = {} }) { return `"${Constrain.number.pre(meta).join("")}number${Constrain.number.post(meta).join("")}"` },
//   string({ meta = {} }) { return `"${Constrain.string.pre(meta).join("")}string${Constrain.string.post(meta).join("")}"` as const },
//   enum({ enum: xs }, $) {
//     if (xs.length === 0) return '"never"'
//     else if (xs.every(core.is.string)) return xs.join('\" | \"')
//     else {
//       return fn.throw("unhandled non-string enum in arktype generator")
//     }
//   },
//   array({ items: s }, $) {
//     return isScalar(s) ? s.slice(0, -1) + '[]"' : s +  ".array()"
//     // const _ = s.slice(1, -1)
//     // console.log("\n\n\n\nARRAY:\n", s, isScalar(s), s.slice(1, -1), "\n\n\n")
//     // return isScalar(_) 
//     //   ? `"${_}[]"`
//     //   : "type(" + s + ', "[]")'
//   },
//   record({ additionalProperties: s }, $) { return Print.array($)('"Record<string, ', s, '>"') },
//   tuple({ items: ss }, $) { return Print.array($)("[", ss.join(", "), "]") },
//   anyOf({ anyOf: [s0, ...ss] }, $) { 
//     // const s = s0.startsWith("type(") && s0.endsWith(")") ? s0 : `type(${s0})`
//     console.log("\n\n\ns in anyOf", s0, "\n\n\n")

//     // console.group("generated.anyOf")
//     // console.log("ss", ss.map((_) => `type(${_})`))
//     // console.groupEnd()
//     /**
//      * @example
//      * type(type({
//      *   "A?": "string",
//      *   "_?": "number",
//      *   "E?": "boolean",
//      *   _K: "null",
//      *   "_I?": "number.integer",
//      *   "B?": type("null").or("boolean"),
//      *   "$?": "null[]",
//      *   "Q?": "number.integer",
//      *   "__?": "boolean"
//      * }).or("number.integer").or("number.integer"))
//      */

//     return ss.reduce(
//       (acc, s) => acc.concat(".or(".concat(s.startsWith("type(") && s.endsWith(")") ? s.slice(5, -1) : s).concat(")")), 
//       s0.startsWith("type(") && s0.endsWith(")") ? s0 : `type(${s0})`
//     )
//       // : ss.reduce((acc, s) => acc.concat(".or(".concat(s.startsWith("type(") && s.endsWith(")") ? s.slice("type(".length, -(")".length)) : s).concat(")")), "type(" + s0 + ")")
//       // s0.startsWith("type(") && s0.endsWith(")") 
//   },
//   oneOf({ oneOf: ss }, $) { return Print.array($)("", ss.join(" | "), "") },
//   allOf({ allOf: ss }, $) { return Print.array($)("", ss.join(" & "), "") },
//   object(ss, $) {
//     const entries = Object_entries(ss.properties)
//     const out = entries.length === 0 ? "{}" 
//     : ""
//     + "{"
//     + entries.map(generateEntry(ss, $)).join(",")
//     + "\n" + " ".repeat($.indent) + "}"
//     console.log("\n\n\n\n", "OUT", out, "\n\n\n")
//     return out
//   }
// } as const satisfies Matchers<string>

export const generate
  : (schema: Traversable.any, options: Options<string>) => string
  = fn.flow(
    createTarget(generated),
    ([target, $]) => [
      "/**",
      " * " + "# {@link $doc." + $.absolutePath.map(escapePathSegment).join(".") + " `" + $.typeName + "`}",
      " * " + "- Visit: {@link $doc." + $.absolutePath.map(escapePathSegment).join(".") + " OpenAPI definition}",
      " */",
      "export type " + $.typeName + " = typeof " + $.typeName + ".infer",
      // "//          ^?",
      "export const " + $.typeName + " = " + (target.startsWith("type") ? target : ("type(" + target + ")")) 
    ].join("\n")
  )
