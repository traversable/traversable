import type { newtype } from "any-ts"

export type * from "./types.js"
export type { emoji, gitmoji, jsdoc, math } from "./utf-16.js"
export type { integer, number } from "./newtypes.js"
export type { string } from "./newtypes.js"
export type { SymbolRegistry } from "./registry.js"

export * from "./version.js"
export * as Invariant from "./error.js"
export { PATTERN } from "./pattern.js"
export { URI, symbol } from "./symbol.js"
export { createRegistry, createRegistry as create, register } from "./registry.js"

export type Register<
  T,
  _ extends { [URI in keyof T & string]: Known<URI, T[URI] & symbol> } = {
    [URI in keyof T & string]: Known<URI, T[URI] & symbol>
  },
> = { [K in keyof _]: _[K] }

/**
 * ## {@link symbol_new `symbol.new`}
 *
 * TODO: add usage docs
 */
export interface Known<URI extends string, Sym extends symbol>
  extends newtype<globalThis.Omit<Symbol, "valueOf" | "toString">> {
  valueOf(): Sym
  toString(): `Symbol(${URI})`
}
