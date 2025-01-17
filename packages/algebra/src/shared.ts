import * as path from "node:path"

import type { Context, Extension } from "@traversable/core"
import { is, keyOf$, t, tree } from "@traversable/core"
import { deref, openapi } from "@traversable/openapi"
import type { Partial, Requiring, newtype } from "@traversable/registry"
import { symbol } from "@traversable/registry"

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

const ZOD_IDENT_MAP = {
  [symbol.optional]: "._def.innerType",
  [symbol.object]: ".shape",
  [symbol.required]: null,
  [symbol.array]: ".element"
} as const
///
const MASK_MAP = {
  [symbol.object]: "",
  [symbol.optional]: "?",
  [symbol.required]: ".",
  [symbol.array]: "[number]",
} as const
///

const OPENAPI_PATH_MAP = {
  [symbol.object]: "properties",
  [symbol.optional]: null,
  [symbol.required]: null,
  [symbol.array]: "items",
} as const

interface Invertible { [x: keyof any]: keyof any }
const sub
  : <const D extends Invertible>(dict: D) => (text: string) => string
  = (dict) => (text) => {
    let ks = [...text], out = "", k: string | undefined
    while ((k = ks.shift()) !== undefined) out += k in dict ? String(dict[k]) : k
    return out
  }

export const ESC_MAP = { "/": "𛰎", "{": "𛰧", "}": "𛰨", "-": "𛰃", "~": "ꕀ" } as const
export const escapePathSegment = sub(ESC_MAP)

/** @internal */
const buildIdentInterpreter: BuildPathInterpreter = (lookup) => ($) => (xs) => {
  let out: (keyof any | null)[] = [$.typeName]
  let ks = [...xs]
  let k: keyof any | null | undefined
  while ((k = ks.shift()) !== undefined) {
    switch (true) {
      case k === symbol.allOf: {
        const siblings = deref($.absolutePath.slice(0, -1).join("/"), is.array)($.document)
        if (!siblings) continue 
        const siblingCount = siblings.length
        const j = ks.shift()
        if (typeof j !== "number") continue
        if (j === 0) {
          const next = "._def.left".repeat(Math.max((siblingCount ?? 0) - 1, 0))
          out.push(next)
        }
        else {
          const next = "._def.left".repeat(Math.abs((siblingCount ?? 0) - j) - 1) + "._def.right"
          out.push(next)
        }
        continue
      }
      case keyOf$(lookup)(k): lookup[k] != null && out.push(lookup[k]); continue 
      case typeof k === "number": return (out.push(`[${k}]`), out) 
      case typeof k === "string": out.push(`.${k}`); continue 
      default: continue 
    }
  }
  return out
}

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
const buildOpenApiNodePathInterpreter: BuildPathInterpreter = (lookup)  => ($) => (xs) => {
  const schemaPath = $.absolutePath.map(escapePathSegment).join(".")
  let out: (keyof any | null)[] = [schemaPath]
  let ks = [...xs]
  let k: keyof any | null | undefined
  while ((k = ks.shift()) !== undefined) {
    switch (true) {
      // case typeof k === "number": { out.push(`[${k}]`); continue }
      // case typeof k === "string": { out.push("."); continue }
      // case keyOf$(lookup)(k): lookup[k] != null && out.push(lookup[k]); continue 
      default: continue
    }
  }
  return out
}

export const createMask: PathInterpreter = buildMaskInterpreter(MASK_MAP)
export const createZodIdent: PathInterpreter = buildIdentInterpreter(ZOD_IDENT_MAP)
export const createOpenApiNodePath: PathInterpreter = buildOpenApiNodePathInterpreter(OPENAPI_PATH_MAP)

// type Ix = Options.Base

export type Options<Ix, S = {}> = Partial<
  & Options.Base
  & { handlers: Extension.Handlers<S, Ix> }
>

export declare namespace Options {
  interface Base {
    absolutePath: Context["absolutePath"]
    flags: Flags
    typeName: string
    document: openapi.doc
  }

  interface Config<S, Ix> extends Options.Base, Context { 
    handlers: Extension.Handlers<S, Ix>
  }
}

type Ix = Options.Base & Context

const defaults = {
  typeName: "AnonymousZodSchema",
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
} satisfies Omit<Options.Config<unknown, Ix>, "handlers">

export function defineOptions<S>(handlers: Extension.Handlers<S, Ix>, $?: Options<S>): Options.Config<S, Ix> {
  return {
    // z,
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
  }
}


export declare namespace typescript {
  export type { handlers as Handlers }
  type handlers<Ix, T = unknown> = never | Handlers<
    & Extension.BuiltIns<T, Ix>
    & Partial<Extension.UserDefs<T, Ix>>
  >
  // export type HandlersWithContext<S = unknown, Ix = any> = Handlers<
  //   & Extension.BuiltInsWithContext<S, Ix>
  //   & globalThis.Partial<Extension.UserDefinitionsWithContext<S, Ix>>
  // >

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
