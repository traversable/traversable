import { z } from "zod"

import type { Context } from "@traversable/core"
import { Extension, Traversable, core } from "@traversable/core"
import type { Handlers } from "@traversable/core/model/extension"
import { fn, object } from "@traversable/data"
import type { Functor, _ } from "@traversable/registry"
import { KnownFormat } from "@traversable/registry"
import { createMask, createZodIdent, typescript as ts } from "./shared.js"

export {
  Algebra,
  derive,
  generate,
}

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const JSON_stringify = (u: unknown) => JSON.stringify(u, null, 2)

namespace Algebra {
  export const types
    : (cfg: ts.Config<string> & { handlers: Handlers<string> }) => Functor.Algebra<Traversable.lambda, string>
    = ($) => Extension.match($, $.handlers)
    ;
  export const withContext
    : <F, T, Ctx extends Context>($: ts.Config.withHandlers<T, Context>) => Functor.IxAlgebra<Ctx, Traversable.lambda, T>
    = ($) => Extension.matchWithContext($, $.handlers)
    ;
}

const fold 
  : <T>(rootContext: Context, $: ts.Config.withHandlers<T, Context>) => <S extends Traversable.any>(term: S) => T
  = (rootContext, $) => fn.flow(
    Traversable.fromJsonSchema,
    (_) => Traversable.foldIx(Algebra.withContext($))(rootContext, _),
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
} as const satisfies { [K in KnownFormat.string[keyof typeof KnownFormat.string]]+?: z.ZodTypeAny }
///
export const StringCodec = {
  [KnownFormat.string.datetime]: {
    decoder: "z.string().datetime({ offset: true }).pipe(z.coerce.date())",
    encoder: "z.date().pipe(z.coerce.string())",
  },
  [KnownFormat.string.date]: {
    decoder: [
      "z.preprocess((u) =>",
      "  typeof u === \"string\" ? !Number.isNaN(new Date(u).getTime()) ? new Date(u) : null : u,",
      "  z.date()",
      ")"
    ].filter(core.is.notnull).join(""),
    encoder: "z.date().pipe(z.coerce.string())",
  },
}

const $pad = ($: Context) => " ".repeat($.indent)
const $tab = ($: Context) => " ".repeat($.indent + 2)
const $nest = ($: Context, count = 0) => "\n" + " ".repeat($.indent + (2 * (count + 1)))
const printArray = ($: Context) => (left: string, body: readonly string[], right: string) => {
  return left.trim() + $pad($) + [
    // left,
    $pad($) + body.map((_) => $nest($) + _.trim() + ",").join($tab($))
  ].join($nest($))
  + $nest($, -1) + right.trim()
}

const generated = {
  null() { return "z.null()" },
  boolean() { return "z.boolean()" },
  integer() { return "z.number().int()" },
  number() { return "z.number()" },
  string({ meta }) { return StringFormat[(meta?.format ?? "") as never] ?? "z.string()" },
  enum(_, $) {
    const ss = _.enum
      .filter(core.is.primitive)
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
  allOf({ allOf: ss }, $) { 
    switch (true) {
      case ss.length === 0: return "z.unknown()"
      case ss.length === 1: return "z.intersection(z.unknown(), " + ss[0] + ")"
      case ss.length === 2: return printArray($)("z.intersection(" , ss, ")")
      default: return ss.reduce((acc, x) => acc === "" ? x : `${acc}.and(${x})`, "")
    }
  },
  anyOf({ anyOf: ss }, $) {
    switch (true) {
      case ss.length === 0: return "z.union([z.never(), z.never()])"
      case ss.length === 1: return printArray($)("z.union([", [ss[0], "z.never()"], "])")
      default: return printArray($)("z.union([", ss, "])")
    }
  },
  oneOf({ oneOf: ss }, $) {
    switch (true) {
      case ss.length === 0: return "z.union([z.never(), z.never()])"
      case ss.length === 1: return printArray($)("z.union([", [ss[0], "z.never()"], "])")
      default: return printArray($)("z.union([", ss, "])")
    }
  },
  array({ items: s }, $) { return printArray($)("z.array(", [s], ")") },
  tuple({ items: ss }, $) { 
    switch (true) {
      case ss.length === 0:  return "z.tuple([])"
      case ss.length === 1:  return "z.tuple([" + ss[0] + "])"
      default: return printArray($)("z.tuple([", ss, "])")
    }
  },
  record({ additionalProperties: s }, $) { return printArray($)("z.record(", [s], ")") },
  object({ properties, required = [] }, $) {
    return "z.object({"
    + Object_entries(properties)
      .map(([k, v]) => {
        const IDENT = createZodIdent($)([
          ...$.path, 
          "shape", 
          k
        ]).join("")

        const MASK = createMask($)([
          ...$.path, 
          k
        ]).join("")

        return [
          "",
          "/**",
          " * ## {@link " + IDENT + `\`${MASK}\`}`,
          " */",
          object.parseKey(k) 
          + ": " 
          + (
            !required.includes(k)
            ? v.includes("\n") 
              ? "z.optional(" + $nest($, 1) + v + ")"
              : "z.optional(" + v + ")"
            : v
          )
        ].join($nest($))
      })
      .join(",")
    + "\n" + " ".repeat($.indent) + "})"
  }
} as const satisfies Extension.BuiltInsWithContext<string>

const derived = {
  null() { return z.null() },
  boolean() { return z.boolean() },
  integer() { return z.number().int() },
  number() { return z.number() },
  string({ meta }) { return StringSchema[(meta?.format ?? "") as never] ?? z.string() },
  enum(_) {
    const ss = _.enum
      .filter(core.is.primitive)
      .map((v) => z.literal(v))
    switch (true) {
      case ss.length === 0: return z.never()
      case ss.length === 1: return ss[0]
      default: return z.union([ss[0], ss[1], ...ss.slice(2)])
    }
  },
  allOf({ allOf: ss }) { return ss.reduce((acc, x) => acc.and(x), z.unknown()) },
  anyOf({ anyOf: ss }) {
    switch (true) {
      case ss.length === 0: return z.never()
      case ss.length === 1: return ss[0]
      default: return z.union([ss[0], ss[1], ...ss.slice(2)])
    }
  },
  oneOf({ oneOf: ss }) {
    switch (true) {
      case ss.length === 0: return z.never()
      case ss.length === 1: return ss[0]
      default: return z.union([ss[0], ss[1], ...ss.slice(2)])
    }
  },
  array({ items: s }) { return z.array(s) },
  tuple({ items: [s, ...ss] }) { return z.tuple([s, ...ss]) },
  record({ additionalProperties: s }) { return z.record(s) },
  object({ properties, additionalProperties: catchall, required = [] }) {
    const xs = Object_entries(properties)
    const opt = xs.filter(([k]) => !required.includes(k))
    const req = xs.filter(([k]) =>  required.includes(k))
    const obj = z.object({
      ...Object_fromEntries(req),
      ...Object_fromEntries(opt.map(([k, v]) => [k, v.optional()] satisfies [string, any])),
    })
    return catchall === undefined ? obj : obj.catchall(catchall)
  }
} as const satisfies Extension.BuiltInsWithContext<z.ZodTypeAny>

function generate<T extends Traversable.any>(schema: T, options: ts.Options<string, Context>): string
function generate(
  schema: Traversable.any, options: ts.Options<string, Context>
) {
  const typeName = options.typeName ?? ts.defaults.typeName.concat("ZodSchema")
  return fn.pipe(
    schema,
    fold({
      ...ts.rootContext,
      absolutePath: options.absolutePath,
      indent: 0,
      typeName
    }, {
      absolutePath: options.absolutePath,
      rootMeta: {
        data: options.rootMeta?.data,
        serializer: options.rootMeta?.serializer,
      },
      handlers: generated,
      typeName,
      flags: {
        nominalTypes: true,
        preferInterfaces: true
      },
    }),
    (body) => [
      "export type " + typeName + " = z.infer<typeof " + typeName + ">",
      "//          ^?",
      "export const " + typeName + " = " + body
    ].join("\n"),
    
  )
}

function derive(
  schema: Traversable.any,
  options: ts.Options<z.ZodTypeAny, Context>
): z.ZodTypeAny
function derive(
  schema: Traversable.any,
  options: ts.Options<z.ZodTypeAny, Context>
): z.ZodTypeAny {
  return fn.throw("NOT IMPLEMENTED")
}

// function derive(schema: Traversable.any, options?: OptionsWithContext<z.ZodTypeAny, Context>): z.ZodTypeAny
// function derive(
//   schema: Traversable.any, {
//     handlers: _,
//     typeName = defaults.typeName,
//     flags: {
//       nominalTypes = defaults.flags.nominalTypes,
//       preferInterfaces = defaults.flags.preferInterfaces,
//     } = defaults.flags,
//   }: OptionsWithContext<z.ZodTypeAny, Context> = defaults
// ): z.ZodTypeAny {
//   return fn.pipe(
//     schema,
//     foldIx(
//       { ...rootContext, typeName },
//       {
//         handlers: derived,
//         typeName: typeName,
//         flags: {
//           nominalTypes,
//           preferInterfaces,
//         }
//       }
//     ),
//     // (body) => [
//     //   "export const " + typeName + " = typeof " + typeName,
//     //   "export declare const " + typeName + ": " + body
//     // ].filter(is.notnull).join("\n")
//   )
// }
