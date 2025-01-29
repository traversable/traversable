import * as path from "node:path"
import type { StandardSchemaV1 } from "@standard-schema/spec"

import type { Context } from "@traversable/core"
import { Extension, Traversable, core, is, keyOf$, t } from "@traversable/core"
import { array, fn, map, object, string } from "@traversable/data"
import { deref, openapi } from "@traversable/openapi"
import type { Partial, Requiring, newtype } from "@traversable/registry"
import { Invariant, PATTERN, symbol } from "@traversable/registry"

/** @internal */
const Object_values
  : <T extends Record<keyof any, unknown>>(xs: T) => (T[keyof T])[]
  = (xs) => globalThis.Object.getOwnPropertySymbols(xs).map((sym) => xs[sym]) as never

/** @internal */
const Math_max = globalThis.Math.max
/** @internal */
const Math_abs = globalThis.Math.abs

export type JsonLike =
  | JsonLike.Scalar
  | readonly JsonLike.Shallow[]
  | { [x: string]: JsonLike.Shallow }
export declare namespace JsonLike {
  type Scalar = 
    | undefined
    | null
    | boolean
    | string
    | boolean
  type Shallow =
    | Scalar
    | readonly Scalar[]
    | { [x: string]: Scalar }
}
export const JsonLike = {
  is: (u: unknown): u is JsonLike => {
    return (
      core.is.scalar(u) 
      || core.is.array(u) && u.every(JsonLike.is)
      || core.is.object(u) && Object_values(u).every(JsonLike.is)
    )
  },
  isArray: globalThis.Array.isArray as (u: unknown) => u is readonly JsonLike.Shallow[],
}

export interface Flags extends t.typeof<typeof Flags> {}
export const Flags = t.object({
  nominalTypes: t.boolean(),
  preferInterfaces: t.boolean(),
  includeJsdocLinks: t.optional(t.boolean()),
  includeLinkToOpenApiNode: t.optional(t.string()),
  includeExamples: t.optional(t.boolean()),
})

export type PathInterpreter
  = (context: Options.Base & Context)
  => (xs: readonly (keyof any | null)[], siblingCount?: number)
  => (keyof any | null)[]

export type BuildPathInterpreter
  = <T extends Record<keyof any, keyof any | null>>(lookup: T)
  => PathInterpreter

export type Index = Options.Base & Context
export type Matchers<T> = Extension.BuiltIns<T, Index>
export type Handlers<T> = Extension.Handlers<T, Index>
export type Options<T> = Partial<
  & Options.Base
  & { handlers: Extension.Handlers<T, Index> }
>
export declare namespace Options {
  interface Base {
    absolutePath: Context["absolutePath"]
    flags: Flags
    typeName: string
    document: openapi.doc
  }
  interface Config<T> extends Options.Base, Context {
    handlers: Extension.Handlers<T, Index>
  }
}

export function fold<T>($: Options.Config<T>) {
  return Traversable.foldIx(Extension.match($))
}

export function defineOptions<T, Ix>(handlers: Extension.Handlers<T, Index>): (options?: Options<T>) => Options.Config<T> {
  return ($?: Options<T>) => ({
    handlers,
    typeName: $?.typeName ?? defaults.typeName,
    document: $?.document ?? defaults.document,
    flags: !$?.flags ? defaults.flags : {
      nominalTypes: $.flags.nominalTypes ?? defaults.flags.nominalTypes,
      preferInterfaces: $.flags.preferInterfaces ?? defaults.flags.preferInterfaces,
      includeExamples: $.flags.includeExamples ?? defaults.flags.includeExamples,
      includeJsdocLinks: $.flags.includeJsdocLinks ?? defaults.flags.includeJsdocLinks,
      includeLinkToOpenApiNode: $.flags.includeLinkToOpenApiNode ?? defaults.flags.includeLinkToOpenApiNode,
    },
    absolutePath: $?.absolutePath ?? defaults.absolutePath,
    indent: defaults.indent,
    path: defaults.path,
    depth: defaults.depth,
    siblingCount: defaults.siblingCount,
  })
}

export const defaults = {
  typeName: "Anonymous",
  absolutePath: ["components", "schemas"],
  document: openapi.doc({}),
  flags: {
    nominalTypes: true,
    preferInterfaces: true,
    includeJsdocLinks: true,
    includeExamples: true,
    includeLinkToOpenApiNode: path.resolve(),
  },
  indent: 0,
  path: [],
  depth: 0,
  siblingCount: 0,
} satisfies Omit<Options.Config<unknown>, "handlers">


const ZOD_IDENT_MAP = {
  [symbol.optional]: "._def.innerType",
  [symbol.object]: ".shape",
  [symbol.required]: null,
  [symbol.array]: ".element"
} as const
const ZOD_IDENTS = Object_values(ZOD_IDENT_MAP)
///
const MASK_MAP = {
  [symbol.object]: "",
  [symbol.optional]: "?",
  [symbol.required]: ".",
  [symbol.array]: "[number]",
} as const
///


interface Invertible { [x: keyof any]: keyof any }
const sub
  : <const D extends Invertible>(dict: D) => (text: string) => string
  = (dict) => (text) => {
    let ks = [...text], out = "", k: string | undefined
    while ((k = ks.shift()) !== undefined) out += k in dict ? String(dict[k]) : k
    return out
  }

export const ESC_MAP = { 
  "#": "ꖛ",
  ".": "ⴰ",
  "/": "𛰎",     /* 〳Ⳇ   */ 
  "{": "𛰧",
  "}": "𛰨", 
  "-": "ㄧ",
  "~": "ᯈ",    /* ᜑꕀ  */ 
} as const

export const escapePathSegment = sub(ESC_MAP)
export const unescapePathSegment = sub(object.invert(ESC_MAP))

/** @internal */
const buildIdentInterpreter: BuildPathInterpreter = (lookup) => ($) => (xs) => {
  let out: (keyof any | null)[] = [$.typeName]
  let ks = [...xs]
  let k: keyof any | null | undefined
  while ((k = ks.shift()) !== undefined) {
    switch (true) {
      case k === symbol.anyOf: return out
      case k === symbol.allOf: {
        const siblings = deref($.absolutePath.slice(0, -1).join("/"), is.array)($.document)
        if (!siblings) continue
        const siblingCount = siblings.length
        const j = ks.shift()
        if (typeof j !== "number") continue
        if (j === 0) {
          const next = "._def.left".repeat(Math_max((siblingCount ?? 0) - 1, 0))
          out.push(next)
        }
        else {
          const next = "._def.left".repeat(Math_abs((siblingCount ?? 0) - j) - 1) + "._def.right"
          out.push(next)
        }
        continue
      }
      case keyOf$(lookup)(k): lookup[k] != null && out.push(lookup[k]); continue
      /**
       * If `k` is a number, we can't go any deeper without breaking the JSDoc link.
       *
       * To avoid "click-to-follow" actions from linking users to the zod docs,
       * only keep up to the last object property we saw:
       */
      case typeof k === "number": return trimPath(out)
      case typeof k === "string": out.push(`.${k}`); continue
      default: continue
    }
  }
  return out
}

/** @internal */
const trimPath = (xs: (keyof any | null)[]) => fn.pipe(
  xs,
  array.lastIndexOf((_) => is.string(_) && !ZOD_IDENTS.includes(_ as never)),
  // (x) => x = 1,
  (x) => Math_max(x, 1),
  (x) => xs.slice(0, x),
)

/** @internal */
const buildMaskInterpreter: BuildPathInterpreter = (lookup) => ({ typeName }) => (xs) => {
  let out: (keyof any | null)[] = [typeName]
  let ks = [...xs]
  let k: keyof any | null | undefined
  while ((k = ks.shift()) !== undefined) {
    const last = out[out.length - 1] ?? null
    switch (true) {
      case typeof k === "number": { out.push(`[${k}]`); continue }
      case typeof k === "string": { out.push(`.${k}`); continue }
      case keyOf$(lookup)(k): {
        const v = lookup[k]
        const js = last === lookup[symbol.optional] && String(v).length ? [".", v] : [v]
        v != null && out.push(...js); continue
      }
      default: { continue }
    }
  }
  return out
}

/** @internal */
const buildOpenApiNodePathInterpreter: BuildPathInterpreter = ()  => ($) => (xs) => {
  const path = $.absolutePath.map(escapePathSegment)
  switch (true) {
    case path.includes("anyOf"): {
      const ix = path.indexOf("anyOf")
      return [path[0], ...path.slice(1, ix).map((_) => "." + _)]
    }
    case path.includes("allOf"): {
      const ix = path.indexOf("allOf")
      return [path[0], ...path.slice(1, ix).map((_) => "." + _)]
    }
    default: {
      const tail = [...path.slice(1), ...xs].map((_) => "." + String(_))
      return [path[0], ...tail]
    }
  }
}

export const createMask: PathInterpreter = buildMaskInterpreter(MASK_MAP)
export const createZodIdent: PathInterpreter = buildIdentInterpreter(ZOD_IDENT_MAP)
export const createOpenApiNodePath: PathInterpreter = buildOpenApiNodePathInterpreter({})

export function createTarget<T, Ix>(matchers: Extension.Handlers<T, Ix>): (schema: Traversable.any, options: Options<T>) => [target: T, config: Options.Config<T>]
export function createTarget<T, Ix>(matchers: Extension.Handlers<T, Ix>): (schema: Traversable.any, options: Options<T>) => [target: T, config: Options.Config<T>]
export function createTarget<T>(matchers: Handlers<T>) {
  return (schema: Traversable.any, options: Options<T>) => {
    const $ = defineOptions(matchers)(options)
    return fn.pipe(
      fold($),
      fn.applyN($, schema),
      (target) => [target, $] satisfies [any, any],
    )
  }
}


////////////////////////////////
///    ☠️ ☠️ ☠️ LEGACY ☠️ ☠️ ☠️    ///
////////////////////////////////
////////////////////////////////

/** TODO: delete this namespace */
export declare namespace typescript {
  export type { handlers as Handlers }
  type handlers<Ix, T = unknown> = never | Handlers<
    & Extension.BuiltIns<T, Ix>
    & Partial<Extension.UserDefs<T, Ix>>
  >
  /** @internal */
  interface Handlers<T extends {}> extends newtype<T> {}
}

export namespace typescript {
  export type Options<T = unknown, Ix = {}, Meta = {}> = Requiring<Config<T, Ix, Meta>, "absolutePath">
  export declare namespace Options {
    interface withHandlers<T = unknown, Ix = {}, Meta = {}> extends
      typescript.Options<T, Ix, Meta> { handlers: Extension.Handlers<T, Ix> }
  }

  export const flags: typescript.Flags = {
    nominalTypes: true,
    preferInterfaces: true,
  }

  export const defaults = {
    flags,
    typeName: "Anonymous",
    rootMeta: {} as Metadata.Root,
  }

  export interface Config<T = unknown, Ix = unknown, Meta = unknown> {
    absolutePath: Context["absolutePath"]
    typeName: string
    flags: Flags
    rootMeta: Metadata.Root<Meta>
    document: openapi.doc
  }

  export declare namespace Config{
    interface withHandlers<T = unknown, Ix = unknown> extends Config<T, Ix> { handlers: Extension.Handlers<T, Ix> }
  }

  export declare namespace Metadata {
    interface Root<T = {}> {
      data: T
      serializer?(x: T): string
    }
  }

  export type Flags = t.typeof<typeof typescript.Flags>
  export const Flags = t.object({
    nominalTypes: t.boolean(),
    preferInterfaces: t.boolean(),
  })
  export const rootContext = { path: [], depth: 0 }
}

// const flags: Flags = {
//   nominalTypes: true,
//   preferInterfaces: true,
// }

// interface Handlers<T extends {}> extends newtype<T> {}
// type handlers<T = unknown> = never | Handlers<
//   & Extension.BuiltIns<T>
//   & Partial<Extension.UserDefinitions<T>>
// >

// type handlersWithContext<S = unknown, Ix = any> = never | Handlers<
//   & Extension.BuiltInsWithContext<S, Ix>
//   & Partial<Extension.UserDefinitionsWithContext<S, Ix>>
// >

const pad
  : (indent: number, fill?: string) => string
  = (indent, fill = " ") => {
    if (indent <= 0) return ""
    let todo = indent
    let out = ""
    while ((todo--) > 0) out += fill
    return out
  }

export const multilineComment = (u: unknown, options?: { indentBy?: number, wrap?: boolean }) => {
  const indentBy = options?.indentBy ?? 2
  const loop = fn.loopN<[node: {} | null | undefined, indent: number], string>(
    (node, indent, loop) => {
      switch(true) {
        default: return Invariant.ParseError(JSON.stringify(node))("multilineComment")
        case is.string(node): return '"' + string.escape(node) + '"'
        case is.symbol(node): return globalThis.String(node)
        case is.showable(node): return node + ""
        case is.array(node): return node.length === 0 ? "[]" : fn.pipe(
          node,
          map((xs) => loop(xs, indent + indentBy)),
          array.join(",\n * " + pad(indent)),
          string.between(
            "\n * " + pad(indent),
            "\n * " + pad(indent - indentBy)
          ),
          string.between("[", "]"),
        )
        case is.object(node): {
          const entries = Object.entries(node)
          return entries.length === 0 ? "{}" : fn.pipe(
            entries,
            map(
              fn.flow(
                ([k, v]) => [k, loop(v, indent + indentBy)] satisfies [any, any],
                object.parseEntry,
              )
            ),
            array.join(",\n * " + pad(indent)),
            string.between("{\n * " + pad(indent), "\n * " + pad(indent - indentBy) + "}"),
          )
        }
      }
    })

  return fn.pipe(
    loop(u, indentBy),
    (indented) => options?.wrap ? string.between("/**\n * ", "\n */")(indented) : indented,
    (comment) => comment.replace(PATTERN.multilineCommentTerminator, "")
  )
}
