import type { Context } from "@traversable/core"
import { Extension, Traversable, core } from "@traversable/core"
import type { Handlers, HandlersWithContext } from "@traversable/core/model/extension"
import { fn, object } from "@traversable/data"
import type { Functor, _ } from "@traversable/registry"
import { KnownFormat } from "@traversable/registry"

import { openapi } from "@traversable/openapi"
import type { Flags } from "../shared.js"
import { createMask, createZodIdent, typescript as ts } from "../shared.js"
import { vendor } from "../vendor.js"

export {
  Algebra,
  derive,
  generate,
}

export type Options<T = {}> = Partial<
  & Options.Base
  & { handlers: Handlers<string>, lib?: LibOption }
>

export declare namespace Options {
  interface Base {
    absolutePath: Context["absolutePath"]
    flags: Flags
    typeName: string
    document: openapi.doc
  }
  export interface Config<T = unknown> extends 
    Options.Base 
    { handlers: Handlers<T>, z: vendor.zod["z"] }

  export namespace Config{
    interface withContext<T = unknown, Ix = unknown> extends 
      Options.Base 
      { handlers: HandlersWithContext<T, Ix>, z: vendor.zod["z"] } 
  }
}

/** @internal */
type ZodTypeAny = import("zod").ZodTypeAny
/** @internal */
type ImportPath = "zod" | (string & {})
/** @internal */
type Async<T> = () => Promise<T>
/** @internal */
type MaybeAsync<T> = never | T | Async<vendor.zod>
/** @internal */
type LibOption = ImportPath | MaybeAsync<vendor.zod>
///
/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const JSON_stringify = (u: unknown) => JSON.stringify(u, null, 2)
/** @internal */
const flags: Flags = {
  nominalTypes: true,
  preferInterfaces: true,
}

async function defineOptions<T = {}>($?: Options<T> & { z?: LibOption }): Promise<Omit<Options.Config<T>, "handlers">> {
  const z: vendor.zod["z"] = await(
    $?.z && typeof $?.z === "object" ? Promise.resolve($.z)
    : typeof $?.z === "string" ? import($.z)
    : import("zod").then((_) => _.z)
  )
  return {
    z,
    absolutePath: $?.absolutePath ? $.absolutePath : ["components", "schemas"],
    document: $?.document ?? openapi.doc({}),
    typeName: $?.typeName ?? "AnonymousZodSchema",
    flags: !$?.flags ? flags : {
      nominalTypes: $.flags.nominalTypes ?? flags.nominalTypes,
      preferInterfaces: $.flags.preferInterfaces ?? flags.preferInterfaces,
    },
  }
}

namespace Algebra {
  export const generate
    : (cfg: Options.Config<string> & { handlers: Handlers<string> }) => Functor.Algebra<Traversable.lambda, string>
    = ($) => Extension.match($, $.handlers)
  ///
  export const derive
    : <T>($: Options.Config.withContext<T, Context>) => Functor.IxAlgebra<Context, Traversable.lambda, T>
    = ($) => Extension.matchWithContext($, $.handlers)
  ///
}

const fold
  : <T>(rootContext: Context, $: Options.Config.withContext<T, Context>) => <S extends Traversable.any>(term: S) => T
  = (rootContext, $) => fn.flow(
    Traversable.fromJsonSchema,
    (_) => Traversable.foldIx(Algebra.derive($))(rootContext, _),
  )

const StringFormat = {
  [KnownFormat.string.datetime]: "z.string().datetime({ offset: true })",
  [KnownFormat.string.date]: "z.string().date()",
  [KnownFormat.string.email]: "z.string().email()",
  [KnownFormat.string.emoji]: "z.string().emoji()",
  [KnownFormat.string.ipv4]: "z.string().ip({ version: \"v4\" })",
  [KnownFormat.string.ipv6]: "z.string().ip({ version: \"v6\" })",
  [KnownFormat.string.ulid]: "z.string().ulid()",
  [KnownFormat.string.uri]: "z.string().url()",
  [KnownFormat.string.uuid]: "z.string().uuid()",
} as const satisfies { [K in KnownFormat.string[keyof typeof KnownFormat.string]]+?: string }

const z = vendor.zod().then((_) => _.z)

const StringSchema = z.then((z) => ({
  [KnownFormat.string.datetime]: z.string().datetime({ offset: true }),
  [KnownFormat.string.date]: z.string().date(),
  [KnownFormat.string.email]: z.string().email(),
  [KnownFormat.string.emoji]: z.string().emoji(),
  [KnownFormat.string.ipv4]: z.string().ip({ version: "v4" }),
  [KnownFormat.string.ipv6]: z.string().ip({ version: "v6" }),
  [KnownFormat.string.ulid]: z.string().ulid(),
  [KnownFormat.string.uri]: z.string().url(),
  [KnownFormat.string.uuid]: z.string().uuid(),
} as const satisfies { [K in KnownFormat.string[keyof typeof KnownFormat.string]]+?: ReturnType<typeof z.string> }))


const $pad = ($: Context) => " ".repeat($.indent)
const $tab = ($: Context) => " ".repeat($.indent + 2)
const newline = ($: Context, count = 0) => "\n" + " ".repeat($.indent + (2 * (count + 1)))
const printArray = ($: Context) => (left: string, body: readonly string[], right: string) => {
  return left.trim() + $pad($) + [
    $pad($) + body.map((_) => newline($) + _.trim()).join("," + $tab($))
  ].join("," + newline($))
  + newline($, -1) + right.trim()
}

const generated = {
  null() { return "z.null()" },
  boolean() { return "z.boolean()" },
  integer() { return "z.number().int()" },
  number() { return "z.number()" },
  string({ meta }) { return StringFormat[(meta?.format ?? "") as never] ?? "z.string()" },
  enum({ enum: s }, $) {
    const ss = s.filter(core.is.primitive)
      .map((v) => {
        switch (true) {
          case typeof v === "symbol": return `z.literal(${String(v)})`
          case typeof v === "string": return `z.literal(${JSON_stringify(v)})`
          default: return `z.literal(${v})`
        }
      }
    )
    switch (true) {
      case ss.length === 0: return "z.never()"
      case ss.length === 1: return ss[0]
      default: return printArray($)("z.union([", ss, "])")
    }
  },
  anyOf({ anyOf: [s0 = "z.never()", s1 = "z.never()", ...ss] }, $) 
    { return printArray($)("z.union([", [s0, s1, ...ss], "])") },
  oneOf({ oneOf: [s0 = "z.never()", s1 = "z.never()", ...ss] }, $) 
    { return printArray($)("z.union([", [s0, s1, ...ss], "])") },
  allOf({ allOf: [s0, s1 = "z.unknown()", ...ss] }, $) { 
    switch (true) {
      case s0 === undefined: return "z.unknown()"
      case ss.length === 0: return printArray($)("z.intersection(", [s0, s1], ")")
      default: return printArray($)(
        "", [[s1, ...ss].reduce((acc, x) => acc === "" ? x : `${acc}.and(${x})`, s0)], "")
    }
  },
  array({ items: s }, $) 
    { return printArray($)("z.array(", [s], ")") },
  record({ additionalProperties: s }, $) 
    { return printArray($)("z.record(", [s], ")") },
  tuple({ items: ss }, $) { 
    switch (true) {
      case ss.length === 0:  return "z.tuple([])"
      case ss.length === 1:  return "z.tuple([" + ss[0] + "])"
      default: return printArray($)("z.tuple([", ss, "])")
    }
  },
  object({ properties, required = [] }, $) {
    return "z.object({"
    + Object_entries(properties)
      .map(([k, v]) => {
        const IDENT = createZodIdent($)([...$.path, "shape", k]).join("")
        const MASK = createMask($)([...$.path, k]).join("")
        return [
          "",
          "/**",
          " * ## {@link " + IDENT + ` \`${MASK}\`}`,
          " */",
          object.parseKey(k) + ": "
          + (
            !required.includes(k)
            ? v.includes("\n") 
              ? "z.optional(" + newline($, 1) + v + ")"
              : "z.optional(" + v + ")"
            : v
          )
        ].join(newline($))
      })
      .join(",")
    + "\n" + " ".repeat($.indent) + "})"
  }
} as const satisfies Extension.BuiltInsWithContext<string>

const derived = z.then((z) => ({
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
      ...Object_fromEntries(opt.map(([k, v]) => [k, v.optional()] satisfies [string, any])),
    })
    return catchall === undefined ? obj : obj.catchall(catchall)
  }
} as const satisfies Extension.BuiltInsWithContext<ZodTypeAny>))

async function generate<T extends Traversable.any>(schema: T, options: Options<string>): Promise<string>
async function generate(
  schema: Traversable.any, options: Options<string>
) {
  const $ = await defineOptions(options)
  return fn.pipe(
    schema,
    fold(
      { ...$, ...ts.rootContext, indent: 0, siblingCount: 0 }, 
      { ...$, handlers: generated },
    ),
    (body) => [
      "export type " + $.typeName + " = z.infer<typeof " + $.typeName + ">",
      "//          ^?",
      "export const " + $.typeName + " = " + body
    ].join("\n"),
  )
}

async function derive(schema: Traversable.any, options: Options<ZodTypeAny>): Promise<ZodTypeAny>
async function derive(schema: Traversable.any, options: Options<ZodTypeAny>): Promise<ZodTypeAny> {
  const $ = await defineOptions(options)
  const handlers = await derived
  return fn.pipe(
    schema,
    fold(
      { ...$, ...ts.rootContext, indent: 0, siblingCount: 0 },
      { ...$, handlers },
    ),
  )
}

/** 
 * TODO: implement generate zod schemas with `declare const`, that way
 * users can get the JSDoc linking without any risk of adding to their bundle
 */
// async function generateSchemaTypes<T extends Traversable.any>(schema: T, options: Options<string>): Promise<string>
// async function generateSchemaTypes(
//   schema: Traversable.any, options: Options<string>
// ) {
//   const $ = await defineOptions(options)
//   return fn.pipe(
//     schema,
//     fold(
//       { ...$, ...ts.rootContext, indent: 0, siblingCount: 0 }, 
//       { ...$, handlers: generated },
//     ),
//     (body) => [
//       "export type " + $.typeName + " = z.infer<typeof " + $.typeName + ">",
//       "//          ^?",
//       "export const " + $.typeName + " = " + body
//     ].join("\n"),
//   )
// }

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
