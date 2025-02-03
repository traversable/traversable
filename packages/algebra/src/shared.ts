import * as path from "node:path"

import type { Context } from "@traversable/core"
import { Extension, Traversable, core, is, keyOf$, t } from "@traversable/core"
import { array, fn, object, string } from "@traversable/data"
import { OpenAPI, deref, type openapi } from "@traversable/openapi"
import type { Partial, Requiring, newtype } from "@traversable/registry"
import { symbol } from "@traversable/registry"

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
    document: OpenAPI.doc<Traversable.orJsonSchema>
    header: string | string[]
  }
  interface Config<T> extends Options.Base, Context {
    handlers: Extension.Handlers<T, Index>
  }
}

export function fold<T>($: Options.Config<T>) {
  return Traversable.foldIx(Extension.match($))
}

export function optionsFromMatchers<T, Ix>(handlers: Extension.Handlers<T, Index>): (options?: Options<T>) => Options.Config<T> {
  return ($?: Options<T>) => ({
    handlers,
    typeName: $?.typeName ?? defaults.typeName,
    document: $?.document ?? defaults.document,
    header: $?.header || defaults.header,
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

export function parseOptions<T>(_: Options<T>) {
  return {
    handlers: _.handlers,
    absolutePath: _.absolutePath || defaults.absolutePath,
    document: _.document || defaults.document,
    ..._.header && { header: _.header },
    // header: _.header ?? defaults.header,
    typeName: _.typeName ?? defaults.typeName,
    flags: !_.flags ? defaults.flags : {
      nominalTypes: _.flags?.nominalTypes ?? defaults.flags.nominalTypes,
      preferInterfaces: _.flags?.preferInterfaces ?? defaults.flags.preferInterfaces,
      includeExamples: _.flags?.includeExamples ?? defaults.flags.includeExamples,
      includeJsdocLinks: _.flags?.includeJsdocLinks ?? defaults.flags.includeJsdocLinks,
      includeLinkToOpenApiNode: _.flags?.includeLinkToOpenApiNode ?? defaults.flags.includeLinkToOpenApiNode,
    },
  }
}

export const defaults = {
  typeName: "Anonymous",
  absolutePath: ["components", "schemas"],
  document:  OpenAPI.new({}),
  header: [],
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
} as const satisfies Omit<Options.Config<unknown>, "handlers">


const ZOD_IDENT_MAP = {
  [symbol.optional]: "._def.innerType",
  [symbol.object]: ".shape",
  [symbol.record]: ".element",
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
  : <const T extends Invertible>(dict: T) => (text: string) => string
  = (dict) => (text) => {
    let chars = [...text], out = "", char: string | undefined
    while ((char = chars.shift()) !== undefined) out += char in dict ? String(dict[char]) : char
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
  (x) => Math_max(x, 1),
  (x) => xs.slice(0, x),
)

/** @internal */
const buildMaskInterpreter: BuildPathInterpreter = (lookup) => ({ typeName, path }) => (xs) => {
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
  const path = [...$.absolutePath.map(escapePathSegment), ...xs]
  let out: string[] = []
  for (let ix = 0, len = path.length; ix < len; ix++) {
    const x = String(path[ix])
    if (!string.isValidIdentifier(x)) return out
    else out.push(ix === 0 ? x : '.' + x)
  }
  return out
}

export const createMask: PathInterpreter = buildMaskInterpreter(MASK_MAP)
export const createZodIdent: PathInterpreter = buildIdentInterpreter(ZOD_IDENT_MAP)
export const createOpenApiNodePath: PathInterpreter = buildOpenApiNodePathInterpreter({})

export function linkToOpenAPIDocument(k: string, $: Index): string | null {
  return $.flags.includeLinkToOpenApiNode === undefined 
    ? null 
    : ''
    + ' * #### {@link $doc.' 
    + createOpenApiNodePath($)(['properties', k]).join('') 
    +  ' `Link to OpenAPI node`}'
}



const pad
  : (indent: number, fill?: string) => string
  = (indent, fill = " ") => {
    if (indent <= 0) return ""
    let todo = indent
    let out = ""
    while ((todo--) > 0) out += fill
    return out
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
