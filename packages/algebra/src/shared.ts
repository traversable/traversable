import { z } from "zod"

import type { Context, Extension } from "@traversable/core"
import { is, keyOf$, t, tree } from "@traversable/core"
import type { openapi } from "@traversable/openapi"
import type { Partial, Requiring, inline, newtype } from "@traversable/registry"
import { symbol } from "@traversable/registry"

export interface Flags extends t.typeof<typeof Flags> {}
const Flags = t.object({
  nominalTypes: t.boolean(),
  preferInterfaces: t.boolean(),
})

export type PathInterpreter 
  = (context: Context) 
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


function deref<T>(path: string[], guard: (u: unknown) => u is T): (document: { paths: { [x: string]: {} } }) => T | undefined
function deref(path: string[]): (document: { paths: { [x: string]: {} } }) => {} | undefined
function deref(path: string[], guard: (u: unknown) => u is unknown = (_: any): _ is any => true) {
  return (document: { paths: { [x: string]: {} } }) => {
    let cursor = tree.get(document, ...path)
    while (tree.has("$ref", is.string)(cursor)) {
      cursor = deref(cursor["$ref"].split("/"))(document)
    }
  return guard(cursor) ? cursor : void 0
  }
}

/*
        if (isIntersection) {
          const siblings = deref($.absolutePath.slice(0, -1), core.is.array)($.document)
          console.log("siblings:", siblings)
          if (siblings) {
            IDENT = createZodIdent($)([
              ...$.path, 
              "shape", 
              k
            ], (siblings ?? []).length).join("")
          }
        }
 */

/** @internal */
const buildIdentInterpreter: BuildPathInterpreter = (lookup) => ($) => (xs) => {
  let out: (keyof any | null)[] = [$.typeName]
  let ks = [...xs]
  let k: keyof any | null | undefined
  while ((k = ks.shift()) !== undefined) {
    switch (true) {
      case k === symbol.allOf: {
        const siblings = deref($.absolutePath.slice(0, -1), is.array)($.document)
        if (!siblings) continue 

        const siblingCount = siblings.length
        const j = ks.shift()
        if (typeof j !== "number") continue
        // const next = j === 0 ?
        console.log("j", j);

        // if (siblingCount && j === 0) {

        if (j === 0) {
          console.log("J === 0")
          const next = "._def.left".repeat(Math.max((siblingCount ?? 0) - 1, 0))
          console.log("next", next)
          ;out.push(next)

        }
        else {
          console.log("!siblingCount || J !== 0")
          const next = "._def.left".repeat(Math.abs((siblingCount ?? 0) - j) - 1) + "._def.right"
          console.log("next in J !== 0: ", next)

          ;out.push(next)
        }

        // ["._def.left".repeat(j), ...[ js[1], ...js.slice(2)].map((_, ix, xs) => "._def.left".repeat(Math.abs(xs.length - ix) - 1) + "._def.right")]

        // let j: keyof any | null | undefined
        // let js: (keyof any | null)[] = []
        // console.log("ks", ks)
        // while ((j = ks.shift(), typeof j === "number")) {
        //   js.push(j)
        // }
        // // js.map()
        // console.log("js", js)
        // console.log("buildIdentInterpreter", ["._def.left".repeat(js.length + 0), ...[ js[1], ...js.slice(2)].map((_, ix, xs) => "._def.left".repeat(Math.abs(xs.length - ix) - 1) + "._def.right")])

        continue
      }
      // }
      // ; const test = ["._def.left".repeat(ss.length + 1), ...[ s1, ...ss].map((_, ix, xs) => "._def.left".repeat(Math.abs(xs.length - ix) - 1) + "._def.right")];
      // case k === symbol.allOf: {
      //   let js: (keyof any | null)[] = []
      //   let j: keyof any | null | undefined
      //   const BitToBinaryTreeMap = {
      //     ["0"]: ".left",
      //     ["1"]: ".right",
      //   } as const

      //   while ((j = ks.shift(), typeof j === "number")) js.push(j)
      //   const b = js.map().toString(2)
      //   const bt = [...]

      //   return 
      // }

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

export const createMask: PathInterpreter = buildMaskInterpreter(MASK_MAP)
export const createZodIdent: PathInterpreter = buildIdentInterpreter(ZOD_IDENT_MAP)

export declare namespace typescript {
  export type { handlers as Handlers }
  type handlers<T = unknown> = never | Handlers<
    & Extension.BuiltIns<T>
    & Partial<Extension.UserDefinitions<T>>
  >
  export type HandlersWithContext<S = unknown, Ix = any> = Handlers<
    & Extension.BuiltInsWithContext<S, Ix>
    & globalThis.Partial<Extension.UserDefinitionsWithContext<S, Ix>>
  >

  /** @internal */
  interface Handlers<T extends {}> extends newtype<T> {}
}

export namespace typescript {
  export type Options<T = unknown, Ix = {}, Meta = {}> = Requiring<Config<T, Ix, Meta>, "absolutePath">
  export declare namespace Options {
    interface withHandlers<T = unknown, Ix = {}, Meta = {}> extends 
      typescript.Options<T, Ix, Meta> { handlers: HandlersWithContext<T, Ix> }
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
    interface withHandlers<T = unknown, Ix = unknown> extends Config<T, Ix> { handlers: HandlersWithContext<T, Ix> } 
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
