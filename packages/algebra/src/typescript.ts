import { Extension, Traversable, t } from "@traversable/core"
import { Option, array, fn, type key, type keys, map, object, string } from "@traversable/data"
import type { Functor, Partial, Required, newtype } from "@traversable/registry"
import { Invariant, symbol } from "@traversable/registry"

//////////////////
///  USERLAND  ///
interface Foo { type: "Foo" }
interface Bar { type: "Bar" }
interface Baz { type: "Baz" }

const ext = Extension.register({
  //  ^?
  Foo: (_: unknown): _ is Foo => true,
  Bar: (_: unknown): _ is Bar => true,
  Baz: (_: unknown): _ is Baz => true,
})

declare module "@traversable/core" {
  interface Extension extends Extension.register<typeof ext> {}
}
///  USERLAND  ///
//////////////////

export type Options<T = unknown> = {
  typeName?: string
  flags?: Partial<Flags>
  handlers?: Partial<Extension.Handlers<string>>
}

export type Flags = t.infer<typeof Flags>
const Flags = t.object({
  nominalTypes: t.boolean(),
  preferInterfaces: t.boolean(),
})

const flags: Flags = {
  nominalTypes: true,
  preferInterfaces: true,
}

interface Config<T> extends Omit<Required<Options>, "flags" | "handlers"> {
  flags: Flags
  handlers: handlers<T>
}

interface Handlers<T extends {}> extends newtype<T> {}
type handlers<T = unknown> = never | Handlers<
  & Extension.BuiltIns<T>
  & Partial<Extension.UserDefinitions<T>>
>

const defaults = {
  flags,
  typeName: "AnonymousType",
} satisfies Omit<Config<string>, "handlers">

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_keys 
  : <T extends object>(object: T) => [keyof T & (string | number)] extends [never] ? string[] : (keyof T & (string | number))[]
  = globalThis.Object.keys
/** @internal */
const isKeyOf = <T extends Record<string, string>>(dictionary: T) => 
  (k: keyof any | undefined): k is keyof T => 
    k !== undefined && k in dictionary

const KnownStringFormats = {
  email: "string.email",
  date: "string.date",
  "date-time": "string.datetime",
} as const satisfies Record<string, string>

const isKnownStringFormat = isKeyOf(KnownStringFormats)

export type Reducer<Source, Target> = (acc: Target, cur: Source, ix: number, xs: readonly Source[]) => Target
export type JsDocPathReducer = Reducer<keyof any, JsDocResult>
export type JsDocResult = Option<{ linkPath: keys.any, linkName: string }>

const PATTERN = {
  Hacky: /\/\/(.+)\/\/\n/g,
  CloseComment: /(\*\/)/g,
} as const

export const trimPath = (xs: readonly (keyof any)[]) => {
  const trimmables = [
    ".options",
    ".shape",
    "._def.innerType",
    ".element",
    ".options.",
    ".shape.",
    "._def.innerType.",
    ".element.",
  ]
  let ys = [...xs]
  let x = ys.pop()
  while (trimmables.includes(x as never)) 
    void (x = ys.pop())
  return [...ys, x].join("")
}

const unary = (glyph: string, pos: "prefix" | "infix" | "postfix") => (arg: string) => ({ glyph, pos, arg })
const nullary = (glyph: string, pos: "prefix" | "infix" | "postfix") => (_?: never) => ({ glyph, pos })

const Op = {
  [symbol.optional]: unary("?", "postfix"),
  [symbol.nullable]: unary("?", "postfix"),
  [symbol.array]: nullary("[number]", "postfix"),
  [symbol.record]: nullary("[string]", "postfix"),
} as const

const behead = (path: readonly (keyof any)[]) => {
  const delimiters: string[] = [`"`, "⊔", "∩", "∪", "∅"]
  const ix = path.findIndex((k) => typeof k === "string" && string.startsWith(...delimiters)(k))
  return ix === -1 ? path : path.slice(0, ix)
}

const truncate = fn.flow(behead, trimPath)

type Context = {
  path: readonly (key.any)[]
  locals: Option<Pick<Context, "example" | "description">>
  example: Option<unknown>
  description: Option<string>
  schemaName: string
  rootSchemaName: null | string
}

const pad 
  : (indent: number, fill?: string) => string
  = (indent, fill = " ") => {
    if(indent <= 0) return ""
    let todo = indent
    let out = ""
    while((todo--) > 0) out = out.concat(fill)
    return out
  }

const multilineComment = (u: unknown, options?: { indentBy?: number, wrap?: boolean }) => {
  const indentBy = options?.indentBy ?? 2
  const loop = fn.loopN<[node: {} | null | undefined, indent: number], string>(
    (node, indent, loop) => {
      switch(true) {
        default: return Invariant.ParseError(JSON.stringify(node, null, 2))("multilineComment")
        case t.is.string(node): return '"' + string.escape(node) + '"'
        case t.is.symbol(node): return globalThis.String(node)
        case t.is.showable(node): return node + ""
        case t.is.array(node): return node.length === 0 ? "[]" : fn.pipe(
          node,
          map((xs) => loop(xs, indent + indentBy)),
          array.join(",\n * " + pad(indent)),
          string.between(
            "\n * " + pad(indent), 
            "\n * " + pad(indent - indentBy)
          ),
          string.between("[", "]"),
        )
        case t.is.object(node): {
          const entries = Object_entries(node)
          return entries.length === 0 ? "{}" : fn.pipe(
            entries,
            map(fn.flow(
              ([k, v]) => [k, loop(v, indent + indentBy)] as const,
              object.parseEntry,
            )),
            array.join(",\n * " + pad(indent)),
            string.between("{\n * " + pad(indent), "\n * " + pad(indent - indentBy) + "}"),
          )
        }
      }
    })

  return fn.pipe(
    loop(u, indentBy), 
    (indented) => options?.wrap ? string.between("/**\n * ", "\n */")(indented) : indented,
    (comment) => comment.replace(PATTERN.CloseComment, "")
  )
}

type BuildJsDocDeps = {
  reducer: JsDocPathReducer
  linkPathPrefix: string
  linkTitlePrefix?: string
  moduleName: string
  typeName: string
  ctx: Context
}

function buildJsDoc(deps: BuildJsDocDeps) {
  const options = Option.partial(object.pick(
    deps.ctx, 
    "description", 
    "example", 
    "locals"
  ))
  if (Option.isNone(options)) return ""
  else {
    const path = deps.ctx.path.map((k) => typeof k === "string" ? k.replace(PATTERN.Hacky, "") : k)
    const links = fn.pipe(path, array.reduce(deps.reducer, Option.some({ linkPath: [deps.typeName], linkName: deps.typeName })))
    const { linkPath, linkName } = Option.getOrElse(links, () => ({ linkPath: "", linkName: "" }))

    if (Option.isSome(deps.ctx.locals)) {
      const next = { ...deps.ctx, locals: Option.none(), ...deps.ctx.locals.value }
      return buildJsDoc({ ...deps, ctx: next })
    } else {
      const jsdocPath = (typeof deps.linkTitlePrefix === "string" && deps.linkTitlePrefix.length > 0 ? `${deps.linkTitlePrefix}.` : "").concat(linkName);
      return [
        "\n",
        "/**",
        linkPath.length === 0 ? null 
        : linkName.length === 0 ? null 
        : ["\n", " * ### {@link", deps.linkPathPrefix.length > 0 ? deps.linkPathPrefix + "." : "" + linkPath, "`" + jsdocPath + "`}"].join(" "),
        ...(Option.isSome(deps.ctx.description) ? ["\n", " * " + string.escape(deps.ctx.description.value.trim())] : []),
        ...(Option.isSome(deps.ctx.example) ? ["\n", " * @example", "\n", " * " + multilineComment(deps.ctx.example.value, { wrap: false })] : []),
        "\n */",
        "\n"
      ].filter(t.is.nonnullable).join(" ")
    }
  }
}

function jsdocSchemaPathReducer(
  option: JsDocResult, 
  current: keyof any, 
  ix: number, 
  xs: readonly (keyof any)[]
): JsDocResult {
  return Option.none()
  // return fn.pipe(
  //   option,
  //   Option.map(
  //     ([left, right]) => {
  //       switch (true) {
  //         case typeof current === "symbol":
  //           return ([
  //             [...left, ".element"], 
  //             `${right.endsWith("?") ? `${right}.` : right}[${
  //               current === codegen.symbol.string ? "string" : "number"}]`
  //           ]) as const
  //         case typeof current === "number": // CASE: tuple index
  //           return [[...left, ".items.", current], `${right}[${current}]`] as const
  //         case current === "∅" || current === "?" && ix === xs.length - 1:
  //           // TODO: [removeRepeating("._def.innerType")(left), `${right}${right.endsWith("?") ? "" : "?"}`]
  //           return [[...left, "._def.innerType"], `${right}${right.endsWith("?") ? "" : "?"}`]
  //         case (current as string).startsWith('"') && (current as string).endsWith('"'):
  //           return [[...left, current], `${right}[${current}]`]
  //         case current === "∅" || current === "?":
  //           return [[...left, "._def.innerType"], `${right}${right.endsWith("?") ? "" : "?"}`] as const
  //         case (current as string).startsWith("∪"):
  //           return [[...left, ".options.", string.unprefix("∪")(current)], `${right}[${string.unprefix("∪")(current)}]`] as const
  //         case (current as string).startsWith("⊔"):
  //           return [[...left, ".options.", string.unprefix("⊔")(current)], `${right}[${string.unprefix("⊔")(current)}]`] as const
  //         case (current as string).startsWith("∩"):
  //           return [[...left, ".options.", string.unprefix("∩")(current)], `${right}[${string.unprefix("∩")(current)}]`] as const
  //         default: 
  //           return [[...left, ".shape.", current], `${right}.${current}`] as const
  //       }
  //     }
  //   )
  // )
}

const baseHandlers = {
  enum(n) { return n.enum.map((_) => typeof _ === "string" ? '"' + string.escape(_)  + '"' : _).join(" | ") },
  null(_) { return "null" },
  boolean(_) { return "boolean" },
  integer(_) { return "number" },
  number(_) { return "number" },
  string(_) { return "string" },
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
        ).join(";") 
      + "}"
  },
} satisfies Extension.BuiltIns<string>

const nominalHandlers = {
  ...baseHandlers,
  integer() { return "number.integer" },
  string(n) { return isKnownStringFormat(n.meta.format) ? KnownStringFormats[n.meta.format] : "string" },
} satisfies Extension.BuiltIns<string>

const extendedHandlers = {
  ...baseHandlers,
} satisfies Extension.BuiltIns<string>

export namespace Algebra {
  export const types
    : (cfg: Config<string>) => Functor.Algebra<Traversable.lambda, string> 
    = (cfg) => {
      const base = cfg.flags.nominalTypes ? nominalHandlers : {}
      const $ = { ...base, ...cfg.handlers }
      return Extension.match({ handlers: $ }, $)
    }
}

const deriveType_fold = (cfg: Config<string>) => fn.flow(
  Traversable.fromSchema, 
  fn.cata(Traversable.Functor)(Algebra.types(cfg)),
) satisfies (term: Traversable.any) => string

function deriveType(schema: Traversable.any, options?: Options): string
function deriveType(schema: Traversable.any, { flags, handlers, ...opts }: Options = defaults): string {
  const typeName = opts.typeName ?? defaults.typeName
  return fn.pipe(
    schema,
    deriveType_fold({ 
      typeName, 
      flags: { 
        nominalTypes: flags?.nominalTypes ?? true,
        preferInterfaces: flags?.preferInterfaces ?? true,
      }, 
      handlers: { 
        ...baseHandlers, 
        ...handlers,
      } 
    }),
    (body) => "type " + typeName + " = " + body,
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
