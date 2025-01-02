import type { newtype } from "any-ts"

export type * from "./types.js"
export type { emoji, gitmoji, jsdoc, math } from "./utf-16.js"
export type { integer, number } from "./newtypes.js"
export type { string } from "./newtypes.js"
export type { Finite } from "./finite.js"
export { finite } from "./finite.js"

export * from "./version.js"
export * as Invariant from "./error.js"
export type { 
  NonFinite,
  NonFiniteBoolean ,
  NonFiniteIndex, 
  NonFiniteNumber, 
  NonFiniteString, 
  TypeError,
} from "./error.js"

export { PATTERN } from "./pattern.js"
export { URI, symbol } from "./symbol.js"
export type {
  NodeWeight,
  RegisterSymbol,
  RegisterWeight,
  SymbolRegistry,
  WeightRegistry,
  Weight,
} from "./registry.js"
export {
  createSymbolRegistry,
  createWeightRegistry,
  registerSymbol,
  registerWeights,
  WeightMap,
} from "./registry.js"
export {
  WeightByType,
  // WeightMap,
} from "./tmp/node-weight-by-type.json.js"

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
