import { symbol } from "./symbol.js"
import type { Known, Register } from "./exports.js"
import { FailedToRegisterSymbol } from "./error.js"

/** 
 * @example
 *  import { registry } from "@traversable/registry"
 * 
 *  const MyAppErrorURI = "@my-app/MyAppErrorURI" as const
 *  const MyAppErrorSymbol = Symbol.for(MyAppErrorURI)
 *  const MyKnownSymbols = { [MyAppErrorUri]: MyAppErrorSymbol } as const
 * 
 *  declare module "@traversable/registry" { 
 *    interface SymbolRegistry extends registry.Register<typeof _registry> {} 
 *  }
 * 
 *  // export `Registry` so you can use the `get` method throughout your application
 *  export const Registry = registry.create(MyKnownSymbols)
 * 
 *  // Elsewhere in your app, get a known symbol by name via autocomplete
 *  const alias = Registry.get(MyAppErrorURI)
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
export interface SymbolRegistry extends Register<typeof symbol> {}

/////////////////////////////
///  (!) SIDE-EFFECT (!)  ///
if (!("SymbolRegistry" in globalThis)) {
  ;(globalThis as never as { SymbolRegistry: Map<any, any> })["SymbolRegistry"] = new globalThis.Map()
}

// export const KNOWN_SYMBOLS = rglobalThis as never as { [symbol.REGISTRY]: unknown })[symbol.REGISTRY] as globalThis.Map<string, symbol>
export const SymbolRegistry = globalThis.SymbolRegistry

/////////////////////////////
///  (!) SIDE-EFFECT (!)  ///
export function register<const URI extends string, const Symbol extends symbol>(uri: URI, symbol: Symbol): [URI, Known<URI, Symbol>]
export function register(uri: string, symbol: symbol): [string, symbol]
export function register(uri: string, symbol: symbol): unknown {
  // TODO: consider throwing an error if the user attempts to set a symbol that already exists in the registry
  if (!(globalThis.SymbolRegistry as any)?.has(uri)) {
    (globalThis.SymbolRegistry as any)?.set(uri, symbol)
  }
  const out = (globalThis.SymbolRegistry as any)?.get(uri)
  if (!out) FailedToRegisterSymbol(uri)("@traversable/register")
  return [uri, out]
}

export function createRegistry<const T extends globalThis.Record<string, symbol>>(uriToSymbolMap: T): 
  { get<K extends keyof SymbolRegistry>(k: K): SymbolRegistry[K]; map: SymbolRegistry }

export function createRegistry<const T extends globalThis.Record<string, symbol>>(uriToSymbolMap: T) {
  for (const uri in uriToSymbolMap) {
    const sym = uriToSymbolMap[uri]
    if (globalThis.process.env)
    void (globalThis.console.info("Registering " + uri + "..."))
    void (register(uri, sym))
  }
  return { get(k: string) { return (globalThis.SymbolRegistry as any).get(k as never) }, map: globalThis.SymbolRegistry }
}
