import { path, Extension, Traversable, core, is } from "@traversable/core"
import type { Context } from "@traversable/core"
import { fn, object } from "@traversable/data"
import type { Functor } from "@traversable/registry"
import { KnownFormat, symbol } from "@traversable/registry"

import { createMask, createZodIdent, typescript as ts } from "../shared.js"

export { generate }

core.t

/** @internal */
const JSON_stringify = (u: unknown) => JSON.stringify(u, null, 2)
/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const isKeyOf = <T extends Record<string, string>>(dictionary: T) =>
  (k: keyof any | undefined): k is keyof T =>
    k !== undefined && k in dictionary

//////////////////
///  USERLAND  ///

// interface Foo { type: "Foo" }
// interface Bar { type: "Bar" }
// interface Baz { type: "Baz" }
// ///
// const ext = Extension.register({
//   //   ^?
//   Foo: (_: unknown): _ is Foo => Math.random() > 1,
//   Bar: (_: unknown): _ is Bar => Math.random() > 1,
//   Baz: (_: unknown): _ is Baz => Math.random() > 1,
// })
// ///
// declare module "@traversable/core" {
//   interface Extension extends Extension.register<typeof ext> {}
// }

///  USERLAND  ///
//////////////////


const KnownStringFormats = {
  [KnownFormat.string.email]: "string.email",
  [KnownFormat.string.date]: "string.date",
  [KnownFormat.string.datetime]: "string.datetime",
} as const satisfies { [K in KnownFormat.string[keyof typeof KnownFormat.string]]+?: string }

const isKnownStringFormat = isKeyOf(KnownStringFormats)

const baseHandlers = {
  null(_) { return "null" },
  boolean(_) { return "boolean" },
  integer(_) { return "number" },
  number(_) { return "number" },
  string(_) { return "string" },
  enum(n) { return n.enum.map(JSON_stringify).join(" | ") },
  allOf(n) { return n.allOf.join(" & ") },
  anyOf(n) { return n.anyOf.join(" | ") },
  oneOf(n) { return n.oneOf.join(" | ") },
  array(n) { return n.items + "[]" },
  tuple(n) { return "[" + n.items.join(", ") + "]" },
  record(n) { return "Record<string, " + n.additionalProperties + ">" },
  object(n) {
    return ""
      + "{"
      + Object_entries(n.properties)
        .map(([k, v]) => ""
          + object.parseKey(k)
          + ((n.required ?? []).includes(k) ? ": " : "?: ")
          + v
        ).join(";\n")
      + "}"
  },
} satisfies Extension.BuiltIns<string>

// function traversable<KS extends (keyof any)[]>(...path: [...KS]): [trav: KS[number][], non: KS[number][]]
// function traversable<KS extends (keyof any)[]>(...path: [...KS]) {
//   let trav: (keyof any)[] = [],
//       head: keyof any | undefined
//   while((head = path.shift()) !== undefined) {
//     if (typeof head === "number") return [trav, [head, ...path]]
//     else if ()
//   }
//     // out.push(typeof head)
//     // out += char in TO ? TO[char as never] : char
//   return [trav, []]
// }

const pathHandlers = {
  null(_) { return "null" },
  boolean(_) { return "boolean" },
  integer(_) { return "number.integer" },
  number(_) { return "number" },
  string(_) { return "string" },
  enum(_) { return _.enum.map(JSON_stringify).join(" | ") },
  allOf(_) { return _.allOf.join(" & ") },
  anyOf(_) { return _.anyOf.length > 1 ? "\n" + _.anyOf.join("\n | ") : _.anyOf.join(" | ") },
  oneOf(_) { return _.oneOf.join(" | ") },
  array(_) { return "Array<" + _.items + ">" },
  tuple(_) { return "[" + _.items.join(", ") + "]" },
  record(_) { return "Record<string, " + _.additionalProperties + ">" },
  object(_, $) {
    return (
      "{"
      + Object_entries(_.properties)
        .map(([k, v]) => {
          const isOptional = !(_.required ?? []).includes(k)
          const keys = [...isOptional ? [symbol.optional, k] : [k]]
          // const symbolicName = createZodIdent($)(...path.docs)(_, $)(...isOptional ? [symbol.optional, k] : [k])
          // console.log("symbolicName", symbolicName)
          //path.interpreter(path.docs, [$.typeName, ...$.path, k, { leaf: _ } ]).join("")
          return ""
            + "/**\n" 
            // + " * ## {@link " + symbolicName.join("") + "}" 
            + "\n */\n"
            // + "/** " + path.interpreter(path.docs, [...ix, ...isOptional ? [k, "?"] : [k], { leaf: _ } ]).join("") + " */\n"
            + object.parseKey(k)
            + (isOptional ? "?: " : ": ")
            + v
            }
        ).join(";\n")
      + "}"
    )
  }
} satisfies Extension.BuiltInsWithContext<string>

// const entries = _.items.map((x, ix) => [`_${ix}`, x] satisfies [_, _])
// Object.fromEntries()
// return ""
//   + "{" 
//   + "}"
// // .join(", ") + "}" 
// },


const zodHandlers = {
  null(_) { return "z.null()" },
  boolean(_) { return "z.boolean()" },
  integer(_) { return "z.number().int()" },
  number(_) { return "z.number()" },
  string(_) { return "z.string()" },
  enum(_) { return _.enum.map(JSON_stringify).join(" | ") },
  allOf(_) { return _.allOf.join(" & ") },
  anyOf(_) { return _.anyOf.length > 1 ? "\n" + _.anyOf.join("\n | ") : _.anyOf.join(" | ") },
  oneOf(_) { return _.oneOf.join(" | ") },
  array(_) { return "Array<" + _.items + ">" },
  tuple(_) { return "[" + _.items.join(", ") + "]" },
  record(_) { return "Record<string, " + _.additionalProperties + ">" },
  object(_, $) {
    return (
      "{"
      + Object_entries(_.properties)
        .map(([k, v]) => {
          const isOptional = !(_.required ?? []).includes(k)

          const IDENT = createZodIdent($)([
            ...$.path, 
            "shape", 
            k
          ]).join("")
  
          const MASK = createMask($)([
            ...$.path, 
            k
          ]).join("")

          return ""
            + "/**"
            + " * ## {@link " + IDENT + `\`${MASK}\`}`
            + " */"
            + object.parseKey(k)
            + (isOptional ? ": " : "?: ")
            + v
            }
        ).join(";\n")
      + "}"
    )
  }
} satisfies Extension.BuiltInsWithContext<string>

const nominalHandlers = {
  ...baseHandlers,
  integer() { return "number.integer" },
  string(n) { return isKnownStringFormat(n.meta?.format) ? KnownStringFormats[n?.meta.format] : "string" },
} satisfies Extension.BuiltIns<string>

const nominalPathHandlers = {
  ...pathHandlers,
  integer() { return "number.integer" },
  string(_) { return isKnownStringFormat(_.meta?.format) ? KnownStringFormats[_?.meta.format] : "string" },
} satisfies Extension.BuiltInsWithContext<string>

const extendedHandlers = {
  ...baseHandlers,
} satisfies Extension.BuiltIns<string>

export namespace Algebra {
  export const types
    : <Ctx extends Context>($: ts.Config.withHandlers<string, Ctx>) => Functor.IxAlgebra<Ctx, Traversable.lambda, string>
    = ($) => Extension.matchWithContext($, $.handlers)
    ;
  export const withContext
    : <Ctx extends Context>($: ts.Config.withHandlers<string, Ctx>) => Functor.IxAlgebra<Ctx, Traversable.lambda, string>
    = ($) => Extension.matchWithContext($, $.handlers)
    ;
}

// const foldTypes = <Ctx extends Context>($: ts.Config.withHandlers<string, Ctx>) => fn.flow(
//   Traversable.fromJsonSchema,
//   fn.cataIx(Traversable.IndexedFunctor)(Algebra.types($)),
// ) satisfies (term: Traversable.any) => string

const foldIx
  : (rootContext: Context, $: ts.Config.withHandlers<string, Context>) => <T extends Traversable.any>(term: T) => string
  = (rootContext, $) => fn.flow(
  // Traversable.fromJsonSchema,
  (x) => Traversable.foldIx(Algebra.withContext($))(rootContext, x),
)

function generate<Meta>(schema: Traversable.any, options: ts.Options<string, Context, Meta>): string
function generate<Meta>(schema: Traversable.any, options: ts.Options.withHandlers<string, Context, Meta>): string
function generate<Meta>(schema: Traversable.any, options: ts.Options | ts.Options.withHandlers): string {
// function generate(
//   schema: Traversable.any, options: ts.Options.withHandlers<string, Context> = ts.defaults as never
// ): string {
  const typeName = options?.typeName ?? ts.defaults.typeName.concat("TypeScriptType")
  return fn.pipe(
    schema,
    foldIx({ 
      absolutePath: options.absolutePath,
      typeName,
      indent: 0,
      depth: ts.rootContext.depth,
      // document: options
      path: ts.rootContext.path,
    }, {
      absolutePath: options.absolutePath,
      typeName,
      handlers: {
        ...pathHandlers,
        ...(options as { handlers: {} })["handlers"],
      },
      flags: {
        nominalTypes: options?.flags?.nominalTypes ?? ts.defaults.flags.nominalTypes,
        preferInterfaces: options?.flags?.preferInterfaces ?? ts.defaults.flags.preferInterfaces,
      },
      rootMeta: {
        data: options?.rootMeta?.data,
        serializer: options?.rootMeta?.serializer,
      },
    },
  ),
    (body) => [
      "export type " + typeName + " = typeof " + typeName,
      "export declare const " + typeName + ": " + body
    ].filter(is.notnull).join("\n")
  )
}

// function deriveType(schema: Traversable.any, options?: Options): string
// function deriveType(
//   schema: Traversable.any, {
//     typeName = defaults.typeName,
//     flags: {
//       nominalTypes = defaults.flags.nominalTypes,
//       preferInterfaces = defaults.flags.preferInterfaces,
//     } = defaults.flags,
//   }: Options = deriveType.defaults,
// ): string {
//   const $ = {
//     typeName,
//     flags,
//     handlers:
//   }
//   // _ = minify ? "" : " "
//   return fn.pipe(
//     schema,
//     Sort.derive({ compare }),
//     deriveType.fold({ compare, typeName, minify }),
//     (body) => "type " + typeName + _ + "=" + _ + body,
//   )
// }

// void (deriveType.defaults = deriveType_defaults)
// void (deriveType.fold = deriveType_fold)

// export const typescriptTypes = (
//   $: TypeScriptInterpreterDeps,
//   jsdocConfig: { rootPrefix: string, linkPathPrefix: string, linkTitlePrefix?: string }
// ) =>
//   codegen.define({
//   canonical: (name) => ID.ns.types.concat(".").concat(prefixNumeric(string.pascal(name))),
//   imports: "",
//   banner: "",
//   import: () => "",
//   export: () => "",
//   afterEach: (s: string, ctx: Context) => `${s}${ctx.isNullable ? " | null" : ""}`,
//   integer: $.flags.preserveStructure ? ID.type.integer : ID.type.number,
//   number: ID.type.number,
//   string: (ctx) =>
//   ( !$.flags.preserveStructure ? "string"
//     : ctx.format === "date" ? ID.type.dateString
//     : ctx.format === "date-time" ? ID.type.datetimeString
//     : ID.type.string
//   ),
//   boolean: ID.type.boolean,
//   anyObject: "object",
//   emptyObject: `{}`,
//   emptyArray: `[]`,
//   anyArray: `unknown[]`,
//   // const: { after: (n) => typeof n === "string" ? `"${n}"` : `${n}` },
//   anyOf: { join: (xs) => xs.join(` | `) },
//   oneOf: { join: (xs) => xs.join(` | `) },
//   allOf: { join: (xs) => xs.join(" & ") },
//   array: { after: (n) => `(${n})[]` },
//   tuple: { afterAll: (s) => `[${s}]` },
//   record: { after: string.between("Record<string, ", ">") },
//   enum: {
//     join: xs => xs.join(" | "),
//     afterEach: (x, ix) => [typeof x === "string" ? `"${x}"` : `${x}`, ix],
//   },
//   object: {
//     join: (xs) => xs.join(`, `),
//     afterEach: (v, k, ctx) => {
//       //       const jsdoc = (name: string) => buildJsDoc(jsdocSchemaPathReducer, "", jsDocPrefix)($)(name, ctx);
//       // const jsdoc = (name: string) => buildJsDoc(jsdocSchemaPathReducer, "", jsDocPrefix)($)(name, ctx);
//       const jsdoc = (name: string) => buildJsDoc(jsdocSchemaPathReducer, jsdocConfig.linkPathPrefix, jsdocConfig.rootPrefix) ($)(name, ctx);

//       return $.flags.includeComments
//         ? [
//           fn.pipe(
//             string.unprefix(ID.ns.types.concat("."))(ctx.schemaName),
//             jsdoc,
//             string.postfix(`${k}${ctx.isRequired ? "" : "?"}: `),
//           ),
//           v
//         ]
//         : [`${k}${ctx.isRequired ? "" : "?"}: `, v]
//     },
//     afterAll: (s) => `{ ${s} }`,
//   },

//   identifier: (name, body) => {
//     const identifier = string.unprefix(ID.ns.types.concat("."))(prefixNumeric(name))
//     return !$.flags.typeScriptPreferInterfaces
//       ? [
//         `export type ${identifier} = typeof ${identifier}`,
//         `export const ${identifier}: ${body}`,
//       ].join("\n")
//       :
//       fn.pipe(
//         generateInterfaceFromDeclarationIfPossible(body),
//         Option.match({
//           onNone: () => [
//             `export type ${identifier} = typeof ${identifier}`,
//             `export const ${identifier}: ${body}`,
//           ].join("\n"),
//           onSome: (body) => fn.pipe(
//             `export interface ${identifier} extends inline<typeof ${identifier}> {}`,
//             string.newline,
//             string.postfix(`export const ${identifier}: ${body}`),
//           )
//         }),
//       )
//     },
//   null: `null`,
// })

// export const trimPath = (xs: readonly (keyof any)[]) => {
//   const trimmables = [
//     ".options",
//     ".shape",
//     "._def.innerType",
//     ".element",
//     ".options.",
//     ".shape.",
//     "._def.innerType.",
//     ".element.",
//   ]
//   let ys = [...xs]
//   let x = ys.pop()
//   while (trimmables.includes(x as never))
//     void (x = ys.pop())
//   return [...ys, x].join("")
// }

// const unary = (glyph: string, pos: "prefix" | "infix" | "postfix") => (arg: string) => ({ glyph, pos, arg })
// const nullary = (glyph: string, pos: "prefix" | "infix" | "postfix") => (_?: never) => ({ glyph, pos })
// const Op = {
//   [symbol.optional]: unary("?", "postfix"),
//   [symbol.nullable]: unary("?", "postfix"),
//   [symbol.array]: nullary("[number]", "postfix"),
//   [symbol.record]: nullary("[string]", "postfix"),
// } as const
// const behead = (path: readonly (keyof any)[]) => {
//   const delimiters: string[] = [`"`, "⊔", "∩", "∪", "∅"]
//   const ix = path.findIndex((k) => typeof k === "string" && string.startsWith(...delimiters)(k))
//   return ix === -1 ? path : path.slice(0, ix)
// }
// const truncate = fn.flow(behead, trimPath)

// function jsdocSchemaPathReducer(
//   option: JsDocResult,
//   current: keyof any,
//   ix: number,
//   xs: readonly (keyof any)[]
// ): JsDocResult {
//   return Option.none()
//   // return fn.pipe(
//   //   option,
//   //   Option.map(
//   //     ([left, right]) => {
//   //       switch (true) {
//   //         case typeof current === "symbol":
//   //           return ([
//   //             [...left, ".element"],
//   //             `${right.endsWith("?") ? `${right}.` : right}[${
//   //               current === codegen.symbol.string ? "string" : "number"}]`
//   //           ]) as const
//   //         case typeof current === "number": // CASE: tuple index
//   //           return [[...left, ".items.", current], `${right}[${current}]`] as const
//   //         case current === "∅" || current === "?" && ix === xs.length - 1:
//   //           // TODO: [removeRepeating("._def.innerType")(left), `${right}${right.endsWith("?") ? "" : "?"}`]
//   //           return [[...left, "._def.innerType"], `${right}${right.endsWith("?") ? "" : "?"}`]
//   //         case (current as string).startsWith('"') && (current as string).endsWith('"'):
//   //           return [[...left, current], `${right}[${current}]`]
//   //         case current === "∅" || current === "?":
//   //           return [[...left, "._def.innerType"], `${right}${right.endsWith("?") ? "" : "?"}`] as const
//   //         case (current as string).startsWith("∪"):
//   //           return [[...left, ".options.", string.unprefix("∪")(current)], `${right}[${string.unprefix("∪")(current)}]`] as const
//   //         case (current as string).startsWith("⊔"):
//   //           return [[...left, ".options.", string.unprefix("⊔")(current)], `${right}[${string.unprefix("⊔")(current)}]`] as const
//   //         case (current as string).startsWith("∩"):
//   //           return [[...left, ".options.", string.unprefix("∩")(current)], `${right}[${string.unprefix("∩")(current)}]`] as const
//   //         default:
//   //           return [[...left, ".shape.", current], `${right}.${current}`] as const
//   //       }
//   //     }
//   //   )
//   // )
// }

// function buildJsDoc(deps: BuildJsDocDeps) {
//   const options = Option.partial(object.pick(
//     deps.ctx,
//     "description",
//     "example",
//     "locals"
//   ))
//   if (Option.isNone(options)) return ""
//   else {
//     const path = deps.ctx.path.map((k) => typeof k === "string" ? k.replace(PATTERN.Hacky, "") : k)
//     const links = fn.pipe(path, array.reduce(deps.reducer, Option.some({ linkPath: [deps.typeName], linkName: deps.typeName })))
//     const { linkPath, linkName } = Option.getOrElse(links, () => ({ linkPath: "", linkName: "" }))

//     if (Option.isSome(deps.ctx.locals)) {
//       const next = { ...deps.ctx, locals: Option.none(), ...deps.ctx.locals.value }
//       return buildJsDoc({ ...deps, ctx: next })
//     } else {
//       const jsdocPath = (typeof deps.linkTitlePrefix === "string" && deps.linkTitlePrefix.length > 0 ? `${deps.linkTitlePrefix}.` : "").concat(linkName);
//       return [
//         "\n",
//         "/**",
//         linkPath.length === 0 ? null
//         : linkName.length === 0 ? null
//         : ["\n", " * ### {@link", deps.linkPathPrefix.length > 0 ? deps.linkPathPrefix + "." : "" + linkPath, "`" + jsdocPath + "`}"].join(" "),
//         ...(Option.isSome(deps.ctx.description) ? ["\n", " * " + string.escape(deps.ctx.description.value.trim())] : []),
//         ...(Option.isSome(deps.ctx.example) ? ["\n", " * @example", "\n", " * " + multilineComment(deps.ctx.example.value, { wrap: false })] : []),
//         "\n */",
//         "\n"
//       ].filter(is.nonnullable).join(" ")
//     }
//   }
// }

// type BuildJsDocDeps = {
//   reducer: JsDocPathReducer
//   linkPathPrefix: string
//   linkTitlePrefix?: string
//   moduleName: string
//   typeName: string
//   ctx: LegacyContext
// }

// /** @internal */
// const Object_keys
//   : <T extends object>(object: T) => [keyof T & (string | number)] extends [never] ? string[] : (keyof T & (string | number))[]
//   = globalThis.Object.keys

// export type Reducer<Source, Target> = (acc: Target, cur: Source, ix: number, xs: readonly Source[]) => Target
// export type JsDocPathReducer = Reducer<keyof any, JsDocResult>
// export type JsDocResult = Option<{ linkPath: keys.any, linkName: string }>

// const PATTERN = {
//   Hacky: /\/\/(.+)\/\/\n/g,
//   CloseComment: /(\*\/)/g,
// } as const

// type LegacyContext = {
//   path: readonly (key.any)[]
//   locals: Option<Pick<LegacyContext, "example" | "description">>
//   example: Option<unknown>
//   description: Option<string>
//   schemaName: string
//   rootSchemaName: null | string
// }

// const pad
//   : (indent: number, fill?: string) => string
//   = (indent, fill = " ") => {
//     if (indent <= 0) return ""
//     let todo = indent
//     let out = ""
//     while ((todo--) > 0) out += fill
//     return out
//   }

// const multilineComment = (u: unknown, options?: { indentBy?: number, wrap?: boolean }) => {
//   const indentBy = options?.indentBy ?? 2
//   const loop = fn.loopN<[node: {} | null | undefined, indent: number], string>(
//     (node, indent, loop) => {
//       switch(true) {
//         default: return Invariant.ParseError(JSON_stringify(node))("multilineComment")
//         case is.string(node): return '"' + string.escape(node) + '"'
//         case is.symbol(node): return globalThis.String(node)
//         case is.showable(node): return node + ""
//         case is.array(node): return node.length === 0 ? "[]" : fn.pipe(
//           node,
//           map((xs) => loop(xs, indent + indentBy)),
//           array.join(",\n * " + pad(indent)),
//           string.between(
//             "\n * " + pad(indent),
//             "\n * " + pad(indent - indentBy)
//           ),
//           string.between("[", "]"),
//         )
//         case is.object(node): {
//           const entries = Object_entries(node)
//           return entries.length === 0 ? "{}" : fn.pipe(
//             entries,
//             map(
//               fn.flow(
//                 ([k, v]) => [k, loop(v, indent + indentBy)] satisfies [any, any],
//                 object.parseEntry,
//               )
//             ),
//             array.join(",\n * " + pad(indent)),
//             string.between("{\n * " + pad(indent), "\n * " + pad(indent - indentBy) + "}"),
//           )
//         }
//       }
//     })

//   return fn.pipe(
//     loop(u, indentBy),
//     (indented) => options?.wrap ? string.between("/**\n * ", "\n */")(indented) : indented,
//     (comment) => comment.replace(PATTERN.CloseComment, "")
//   )
// }
