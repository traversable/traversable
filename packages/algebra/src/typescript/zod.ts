import { z } from "zod"

import type { Functor, newtype } from "@traversable/registry"
import { KnownFormat, symbol } from "@traversable/registry"
import type { ConfigWithContext, Context } from "@traversable/core"
import { Extension, is, t, path, Traversable, } from "@traversable/core"
import { fn, object } from "@traversable/data"
import { buildPathname } from "./shared.js"
import { typescript as ts } from "./shared.js"
import { Handlers } from "@traversable/core/model/extension"

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


const pathToSymbol = {
  /** 
   * @example
   * cbind.placerat 
   * // -> 
   * cbind.shape.placerat
   */
  object: [".shape", "."],
  /** 
   * `abc.shape.def.element.shape.ghi` ->
   * `abc.shape.a[number].shape.pellentesque`
   * 
   * @example
   * const abc = z.object({ 
   *   def: z.array(
   *     z.object({
   *       /\** 
   *         ## {@link abc.shape.def.element.shape.ghi `abc.shape.def[number].shape.ghi`}
   *         *\/
   *       ghi: z.any()
   *     })
   *   )
   * })
   */
  array: [".element", "[number]" /** [number]. ? */],
  /** 
   * `stu.element.shape.vwr` ->
   * `xyz[string].vwr`
   * 
   * @example
   * const stu = z.record(
   *   z.object({
   *     /\** 
   *       * ## {@link stu.element.shape.vwr `xyz[string].vwr`}
   *       *\/
   *     vwr: z
   *   })
   * )
   */
  record: [".element", "[string]" /** [string]. ? */],
  optional: ["_def.innerType", "?" /** ?. ? */],
  tuple: [".items", "DONE"],
  anyOf: [".options", ""],
  oneOf: [".options", ""],
} as const

// export const docs = [
//   defineMatcher(isNumber, (k) => `[${k}]`),
//   defineMatcher(isString, (k, prev): DotPrefixed => `${prev == null ? "" : "."}${k}`),
//   defineMatcher(isArraySymbol, () => `[number]` as const),
//   defineMatcher(isRecordSymbol, () => `[string]` as const),
//   defineMatcher(
//     isOptionalSymbol, 
//     (_, prev, next) => 
//       isLeaf(next) || next === undefined ? ""
//       : prev === Sym.optional || prev === Sym.nullable ? false 
//       : "?"
//   ),
// ] as const satisfies Matcher[]

const pathInterpreter = [
  path.defineMatcher(is.literally(symbol.object), (k, p, n) => (console.log("symbol.object, k - p - n: ", k, p, n), ".SHAPE", pathToSymbol.object[0])),
  path.defineMatcher(is.number, (k) => (console.log("is.number", k), `[${k}]`)),
  path.defineMatcher(is.string, (k, prev) => (console.log("is.string", k), `${prev == null ? "" : "."}${k}`)),
  
  path.defineMatcher(is.literally(symbol.array), () => pathToSymbol.array[0]),
  path.defineMatcher(is.literally(symbol.record), () => pathToSymbol.record[0]),
  // path.defineMatcher(is.literally(symbol.optional), (k, p, n) => pathToSymbol.optional[0]),
  path.defineMatcher(is.literally(symbol.tuple), () => pathToSymbol.tuple[0]),
  path.defineMatcher(is.literally(symbol.anyOf), () => pathToSymbol.anyOf[0]),
  path.defineMatcher(is.literally(symbol.oneOf), () => pathToSymbol.oneOf[0]),
] as const satisfies path.Matcher[]

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
    ].filter(is.notnull).join(""),
    encoder: "z.date().pipe(z.coerce.string())",
  },
}

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

const foldIx
  = <F, T>(rootContext: Context, $: ts.Config.withHandlers<T, Context>) => { 
      return fn.flow(
      Traversable.fromJsonSchema,
      (x) => Traversable.foldIx(Algebra.withContext($))(rootContext, x)
    )
  }

    // (term: Traversable.any) => T
  // = (rootContext, $) => fn.flow(
  // Traversable.fromJsonSchema,
  // (x) => Traversable.foldIx()
  // // (Algebra.withContext($))(rootContext, x),

const derived = {
  null() { return z.null() },
  boolean() { return z.boolean() },
  integer() { return z.number().int() },
  number() { return z.number() },
  string({ meta }) { return StringSchema[(meta?.format ?? "") as never] ?? z.string() },
  enum(_) { 
    const ss = _.enum
      .filter(is.primitive)
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

const generated = {
  null() { return "z.null()" },
  boolean() { return "z.boolean()" },
  integer() { return "z.number().int()" },
  number() { return "z.number()" },
  string({ meta }) { return StringFormat[(meta?.format ?? "") as never] ?? "z.string()" },
  enum(_) { 
    const ss = _.enum
      .filter(is.primitive)
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
      default: return "z.union([" + ss.join(", ") + "])"
    }
  },
  allOf({ allOf: ss }) { return ss.reduce((acc, x) => acc === "" ? x : `${acc}.and(${x})`, "") },
  anyOf({ anyOf: ss }) { 
    switch (true) {
      case ss.length === 0: return "z.never()"
      case ss.length === 1: return ss[0]
      default: return "z.union([" + ss.join(", ") + "])"
    }
  },
  oneOf({ oneOf: ss }) { 
    switch (true) {
      case ss.length === 0: return "z.never()"
      case ss.length === 1: return ss[0]
      default: return "z.union([" + ss.join(", ") + "])"
    }
  },
  array({ items: s }) { return "z.array(" + s + ")" },
  tuple({ items: ss }) { return "z.tuple([" + ss.join(", ") + "])" },
  record({ additionalProperties: s }) { return "z.record(" + s + ")" },
  object(_, $) {
    const { properties, additionalProperties: catchall, required = [] } = _
    const createPathname = buildPathname(...pathInterpreter)(_, $)
    return ""
    + "z.object({"
    + Object_entries(properties)
      .map(([k, v]) => {
        const isOptional = !required.includes(k)
        const pathname = createPathname(k)
        console.log("pathname", pathname)
        return ""
          + "/**\n" 
          + " * ## {@link " 

          /// node path -> JSDoc
          + pathname.join("") 
          /// node path -> DSL
          // + pathname.join("") 

          + "}"
          + "\n"
          + " */\n"
          + (object.parseKey(k) + ": " + v + (isOptional ? ".optional()" : ""))
          // + (isOptional ? "?: " : ": ")
          // + v
      })
      .join(",\n")
    + "})"  // + catchall !== undefined ? ".catchall(" + catchall + ")" : ""
  }
} as const satisfies Extension.BuiltInsWithContext<string>


function generate<T extends Traversable.any>(schema: T, options: ts.Options<string, Context>): string
function generate(
  schema: Traversable.any, options: ts.Options<string, Context>
) {
  const typeName = options.typeName ?? ts.defaults.typeName.concat("ZodSchema")
  // {
  //   typeName,
  //   handlers: _,
  //   flags: {
  //     nominalTypes = ts.defaults.flags.nominalTypes,
  //     preferInterfaces = ts.defaults.flags.preferInterfaces,
  //   } = ts.defaults.flags,
  // }
  console.log("options" , options)
  return fn.pipe(
    schema,
    foldIx({ 
      ...ts.rootContext, 
      absolutePath: 
      options.absolutePath, 
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
    (body) => "export const " + typeName + " = " + body
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
