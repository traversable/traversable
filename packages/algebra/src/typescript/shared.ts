import type { Context, Extension, Traversable } from "@traversable/core"
import { path, t } from "@traversable/core"

import type { newtype, Omit, Part, Partial, Require, Requiring } from "@traversable/registry"

/** @internal */
const Object_keys
  : <T>(x: T) => (keyof T)[]
  = globalThis.Object.keys
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const Array_isArray = globalThis.Array.isArray
/** @internal */
const Object_create = globalThis.Object.create

export type Flags = t.typeof<typeof Flags>
const Flags = t.object({
  nominalTypes: t.boolean(),
  preferInterfaces: t.boolean(),
})

export const buildPathname 
  : (...matchers: path.Matcher[]) 
    => <S extends Traversable.F<string>>(_: S, $: Context) 
    => (...keys: (keyof any | null)[]) 
    => readonly (string | number | symbol)[]

  = (...matchers: path.Matcher[]) => (_, $) => (...keys) => 
    path.interpreter(
      matchers, [
        $.typeName, 
        ...$.path, 
        ...keys.filter((k) => k !== null), 
        { leaf: _ } 
      ]
    )

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
    ;


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
