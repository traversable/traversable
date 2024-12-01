import type { newtype } from "any-ts"

export * from "./version.js"
export * as Invariant from "./error.js"
export { PATTERN } from "./pattern.js"
export { URI, symbol } from "./symbol.js"
export type { SymbolRegistry } from "./registry.js"
export { createRegistry, createRegistry as create, register } from "./registry.js"


export type Register<
  T, 
  U extends 
  | { [URI in keyof T & string]: Known<URI, T[URI] & symbol> }
  = { [URI in keyof T & string]: Known<URI, T[URI] & symbol> }
> = { [K in keyof U]: U[K] }

/** 
 * ## {@link symbol_new `symbol.new`} 
 * 
 * TODO: add usage docs
 */
export interface Known<URI extends string, Symbol extends symbol> extends 
  newtype<globalThis.Omit<Symbol, "valueOf" | "toString">> {
  valueOf(): Symbol
  toString(): `Symbol(${URI})`
}
