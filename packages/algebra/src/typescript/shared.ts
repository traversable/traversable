import type { Context, Extension } from "@traversable/core"
import { keyOf$, t } from "@traversable/core"
import type { Partial, Requiring, newtype } from "@traversable/registry"
import { symbol } from "@traversable/registry"

export type Flags = t.typeof<typeof Flags>
const Flags = t.object({
  nominalTypes: t.boolean(),
  preferInterfaces: t.boolean(),
})

export type BuildPathInterpreter = 
  <T extends Record<keyof any, keyof any | null>>(lookup: T) 
    => (context: Context) 
    => (xs: readonly (keyof any | null)[]) 
    => (keyof any | null)[]

export type PathInterpreter = (context: Context) 
  => (xs: readonly (keyof any | null)[]) 
  => (keyof any | null)[]

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

/** @internal */
const buildIdentInterpreter: BuildPathInterpreter = (lookup) => ({ typeName }) => (xs) => {
  let out: (keyof any | null)[] = [typeName]
  let ks = [...xs]
  let k: keyof any | null | undefined
  while ((k = ks.shift()) !== undefined) {
    switch (true) {
      case keyOf$(lookup)(k): { lookup[k] != null && out.push(lookup[k]); continue }
      case typeof k === "number": { return (out.push(`[${k}]`), out) }
      case typeof k === "string": { out.push(`.${k}`); continue }
      default: { continue }
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

function configFromOptions<T, Meta>(options: typescript.Options<T, Meta>): typescript.Config<T>
function configFromOptions<T, Ctx, Meta>(options: typescript.Options<T, Ctx, Meta>): typescript.Config<T, Meta>
function configFromOptions<T>($: typescript.Options | typescript.Options): typescript.Config | typescript.Config {
  return {
    absolutePath: $.absolutePath,
    typeName: $.typeName ?? typescript.defaults.typeName,
    flags: !$.flags ? typescript.defaults.flags : {
      nominalTypes: $.flags.nominalTypes ?? typescript.defaults.flags.nominalTypes,
      preferInterfaces: $.flags.preferInterfaces ?? typescript.defaults.flags.preferInterfaces,
    },
    rootMeta: !$.rootMeta ? typescript.defaults.rootMeta : {
      data: $.rootMeta.data ?? typescript.defaults.rootMeta.data,
      serializer: $.rootMeta.serializer ?? typescript.defaults.rootMeta.serializer,
    },
  }
}

export namespace typescript {
  export type Options<T = unknown, Ix = {}, Meta = {}> = Requiring<Config<T, Ix, Meta>, "absolutePath">
  export declare namespace Options {
    interface withHandlers<T = unknown, Ix = {}, Meta = {}> extends 
      typescript.Options<T, Ix, Meta> { handlers: HandlersWithContext<T, Ix> }
  }
  // {
  //   typeName?: string
  //   flags?: Partial<Flags>
  //   handlers?: Partial<Extension.HandlersWithContext<T>>
    // rootMeta?: Partial<Metadata.Root<Meta>>
  // }

  export const flags: typescript.Flags = {
    nominalTypes: true,
    preferInterfaces: true,
  }

  export const defaults = {
    flags,
    typeName: "Anonymous",
    rootMeta: {} as Metadata.Root,
  } // satisfies Omit<Config<string>, "handlers">

  export interface Config<T = unknown, Ix = unknown, Meta = unknown> {
    absolutePath: `/${string}`
    typeName: string
    flags: Flags
    rootMeta: Metadata.Root<Meta>
  }
  export declare namespace Config{
    interface withHandlers<T = unknown, Ix = unknown> extends Config<T, Ix> { handlers: HandlersWithContext<T, Ix> } 
  }
    // handlers?: Extension.HandlersWithContext<T>
    // Omit<Required<Options>, "flags" | "handlers"> { 
    //   flags: Flags, 
    //   handlers: HandlersWithContext<T, Ix> 
    // }

  export declare namespace Metadata {
    interface Root<T = {}> {
      data: T
      serializer?(x: T): string
    }
  }

  ///
  export type Flags = t.typeof<typeof typescript.Flags>
  export const Flags = t.object({
    nominalTypes: t.boolean(),
    preferInterfaces: t.boolean(),
  })
  ///
  export const rootContext = { path: [], depth: 0 }
  ///
  ///
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
