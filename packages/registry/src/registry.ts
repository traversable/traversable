import { execSync as $ } from "node:child_process"
import * as fs from "node:fs"
import * as path from "node:path"

import { FailedToRegisterSymbol } from "./error.js"
import type { Known, Open } from "./exports.js"
import type { symbol } from "./symbol.js"
import { WeightByType } from "./tmp/node-weight-by-type.json.js"
import { PKG_NAME } from "./version.js"

const $$_REGISTRY_KEY_$$ = `@${PKG_NAME}` as const
const SymbolRegistryKey = "SymbolRegistry" as const
const WeightRegistryKey = "WeightRegistry" as const
const PATH = {
  Weight: {
    read: path.join(path.resolve(), "packages", "registry", "src", "tmp", "node-weight-by-type.json"),
    write: path.join(
      path.resolve(),
      "packages",
      "registry",
      "src",
      "__generated__",
      "node-weight-by-type.json",
    ),
  },
} as const

const RegistryKeys = [SymbolRegistryKey, WeightRegistryKey] as const satisfies string[]

export type NodeWeight<T = any> = {
  weight: number
  predicate(u: unknown): u is T
}

/**
 * TODO:
 * 1. make sure these weights are override-able from userland
 * 2. add real predicates
 */
export type WeightMap = {
  [K in keyof WeightByType]: { weight: WeightByType[K]; predicate: (u: unknown) => u is unknown }
}
export const WeightMap = {
  null: {
    weight: WeightByType.null,
    predicate: (u): u is never => true,
  },
  boolean: {
    weight: WeightByType.boolean,
    predicate: (u): u is never => true,
  },
  integer: {
    weight: WeightByType.integer,
    predicate: (u): u is never => true,
  },
  number: {
    weight: WeightByType.number,
    predicate: (u): u is never => true,
  },
  string: {
    weight: WeightByType.string,
    predicate: (u): u is never => true,
  },
  allOf: {
    weight: WeightByType.allOf,
    predicate: (u): u is never => true,
  },
  anyOf: {
    weight: WeightByType.anyOf,
    predicate: (u): u is never => true,
  },
  oneOf: {
    weight: WeightByType.oneOf,
    predicate: (u): u is never => true,
  },
  record: {
    weight: WeightByType.record,
    predicate: (u): u is never => true,
  },
  object: {
    weight: WeightByType.object,
    predicate: (u): u is never => true,
  },
  tuple: {
    weight: WeightByType.tuple,
    predicate: (u): u is never => true,
  },
  array: {
    weight: WeightByType.array,
    predicate: (u): u is never => true,
  },
  unknown: {
    weight: WeightByType.unknown,
    predicate: (u): u is never => true,
  },
} satisfies WeightMap

export type StickyNumeric<T> = never | (T | (number & {}))
export type Weight = never | StickyNumeric<WeightByType[keyof WeightByType]>

export type RegisterWeight<T extends {}> = Open<T, WeightByType>
export type RegisterSymbol<
  T,
  _ extends { [URI in keyof T & string]: Known<URI, T[URI] & symbol> } = {
    [URI in keyof T & string]: Known<URI, T[URI] & symbol>
  },
> = { [K in keyof _]: _[K] }

export interface WeightRegistry extends RegisterWeight<WeightMap> {}
/**
 * @example
 *  import { registry } from "@traversable/registry"
 *
 *  const MyAppErrorURI = "@my-app/MyAppErrorURI" as const
 *  const MyAppErrorSymbol = Symbol.for(MyAppErrorURI)
 *  const MyKnownSymbols = { [MyAppErrorUri]: MyAppErrorSymbol } as const
 *
 *
 *  // export `Registry` so you can use the `get` method throughout your application
 *  export const SymbolRegistry = registry.createSymbolRegistry(MyKnownSymbols)
 *
 *  // register the registry with TypeScript:
 *  declare module "@traversable/registry" {
 *    interface SymbolRegistry extends registry.RegisterSymbol<typeof SymbolRegistry> {}
 *  }
 *
 *  // Elsewhere in your app, retrieve a known symbol by name:
 *  //                          🠛🠛 autocompletes 🠛🠛
 *  const alias = Registry.get("@my-app/MyAppErrorURI")
 *  //     ^? const alias: registry.Known<"@my-app/MyAppErrorURI", typeof MyAppErrorSymbol>
 *
 *  // At runtime, the value of `alias` is the symbol you registered -- not a wrapper:
 *  console.log(alias === MyAppErrorSymbol)
 *  // => true
 *  console.log(alias)
 *  // => Symbol(@my-app/MyAppErrorURI)
 *
 *  // At the type-level, `@traversable/register` does a bit of magic to make sure nothing
 *  // is lost, by "extending" the `valueOf` and `toString` methods on the symbol you gave it:
 *  // to be more precise:
 *
 *  const sym = alias.valueOf()
 *  //     ^? const sym: typeof MyAppErrorSymbol
 *
 *  const uri = elsewhere.toString()
 *  //     ^? const uri: "@my-app/MyAppErrorURI"
 */
export interface SymbolRegistry extends RegisterSymbol<typeof symbol> {}

/** @internal */
const bindGlobals = (): void => {
  void ((globalThis as any)[$$_REGISTRY_KEY_$$] ??= {})
  for (const key of RegistryKeys) void ((globalThis as any)[$$_REGISTRY_KEY_$$][key] ??= new globalThis.Map())
}

export function createSymbolRegistry<const T extends globalThis.Record<string, symbol>>(
  uriToSymbolMap: T,
): { get<K extends keyof SymbolRegistry>(k: K): SymbolRegistry[K]; map: SymbolRegistry }
export function createSymbolRegistry<const T extends globalThis.Record<string, symbol>>(uriToSymbolMap: T) {
  for (const uri in uriToSymbolMap) {
    const sym = uriToSymbolMap[uri]
    if (globalThis.process.env.NODE_ENV === "development")
      void globalThis.console.info("Registering " + uri + "...")
    void registerSymbol(uri, sym)
  }
  return {
    get(k: string) {
      return ((globalThis as any)[$$_REGISTRY_KEY_$$][SymbolRegistryKey] as any).get(k as never)
    },
    map: (globalThis as any)[$$_REGISTRY_KEY_$$][SymbolRegistryKey],
  }
}

/////////////////////////////
///  (!) SIDE-EFFECT (!)  ///
export function registerSymbol<const URI extends string, const Symbol extends symbol>(
  uri: URI,
  symbol: Symbol,
): [URI, Known<URI, Symbol>]
export function registerSymbol(uri: string, symbol: symbol): [string, symbol]
export function registerSymbol(uri: string, symbol: symbol) {
  // TODO: consider throwing an error if the user attempts to set a symbol that already exists in the registry
  if (!(globalThis as any)[$$_REGISTRY_KEY_$$][SymbolRegistryKey]?.has(uri))
    void (globalThis as any)[$$_REGISTRY_KEY_$$][SymbolRegistryKey]?.set(uri, symbol)
  const out = (globalThis as any)[$$_REGISTRY_KEY_$$][SymbolRegistryKey]?.get(uri)
  if (!out) return FailedToRegisterSymbol(uri)(PKG_NAME)
  else return [uri, out]
}

declare const WeightAPI: {
  map: WeightRegistry
  get<K extends keyof WeightRegistry>(k: K): WeightRegistry[K]
  write<K extends keyof WeightRegistry, V extends number>(
    key: K,
    value: V,
    options?: { dryrun?: boolean },
  ): { prev: number; next: number }
  write<K extends keyof WeightRegistry, V extends number>(key: K, value: V): boolean
}

export function createWeightRegistry<
  const T extends { [x: string]: { weight: number; predicate(u: unknown): u is unknown } },
>(uriToSymbolMap: T): typeof WeightAPI
export function createWeightRegistry(weightMap?: {
  [x: string]: { weight: number; predicate(u: unknown): u is unknown }
}) {
  if (globalThis.process.env.NODE_ENV === "development")
    void globalThis.console.info("Registering node weights...")
  void registerWeights(weightMap ?? WeightMap)
  return {
    map: (globalThis as any)[$$_REGISTRY_KEY_$$][WeightRegistryKey],
    get(k: string) {
      return (globalThis as any)[$$_REGISTRY_KEY_$$][WeightRegistryKey].get(k)
    },
    write(
      k: keyof any,
      next: number,
      { dryrun = false }: { dryrun?: boolean } = { dryrun: false },
    ): boolean | { prev: number; next: number } {
      const prev = (globalThis as any)[$$_REGISTRY_KEY_$$][WeightRegistryKey].get(k)
      if (prev != null && typeof prev === "object" && typeof prev.weight === "number") {
        if (prev.weight === next) {
          console.log("CACHE HIT")
          return true
        } else {
          if (dryrun) {
            console.log("[DRYRUN]: \n\tweight:" + String(k), "\n\tprev:" + prev.weight, "\n\tto:" + next)
            return { prev: prev.weight, next }
          }
          ;(globalThis as any)[$$_REGISTRY_KEY_$$][WeightRegistryKey]?.set(k, next)
          let content = fs.readFileSync(PATH.Weight.read).toString("utf8")
          console.log("content", content)
          const matcher = new RegExp('"' + String(k) + '"' + ":[\\s?]*[\\d]+[,]?", "g")
          if (!matcher.test(content)) return false
          else {
            fs.writeFileSync(
              PATH.Weight.write,
              content.replace(matcher, '"' + String(k) + '": ' + next + ","),
            )
          }
        }
      }
      return void 0 as never
    },
  }
}

/**
 * @example
 * import { registry } from "@traverable/registry"
 * import { sort } from "@traverable/algebra"
 *
 * const myWeights = registry.registerWeights({
 *   customNode: {
 *     weight: 9000,
 *     predicate: (node): node is CustomNode => "_tag" in node && node._tag === "CustomNode"
 *   }
 * })
 *
 * declare module "@traversable/openapi" {
 *   interface WeightRegistry extends registry.RegisterWeight<typeof myWeights> {}
 * }
 *
 * // Extends the built-in sort function to be able to identify and weigh custom
 * // nodes when applying a recursive sort to an OpenAPI document
 * const customSortFn = sort({ paths: {} }, myWeights)
 */
export function registerWeights<
  const T extends { [x: string]: { weight: number; predicate(u: unknown): u is unknown } },
>(weights: T & Partial<WeightMap>): RegisterWeight<T>
/// impl.
export function registerWeights<const T extends { [x: string]: number }>(weights: T & Partial<WeightMap>) {
  let out: { [x: string]: unknown } = {}
  for (const key in weights) {
    if (!(globalThis as any)[$$_REGISTRY_KEY_$$][WeightRegistryKey]?.has(key))
      void (globalThis as any)[$$_REGISTRY_KEY_$$][WeightRegistryKey]?.set(key, weights[key])
    out[key] = (globalThis as any)[$$_REGISTRY_KEY_$$][WeightRegistryKey]?.get(key)
  }
  return out
}

/////////////////////////////
///  (!) SIDE-EFFECT (!)  ///
void bindGlobals()

// if (!("SymbolRegistry" in globalThis)) {
//   ;(globalThis as never as { SymbolRegistry: Map<any, any> })["SymbolRegistry"] = new globalThis.Map()
// }
// // export const KNOWN_SYMBOLS = rglobalThis as never as { [symbol.REGISTRY]: unknown })[symbol.REGISTRY] as globalThis.Map<string, symbol>
// export const SymbolRegistry = globalThis.SymbolRegistry
