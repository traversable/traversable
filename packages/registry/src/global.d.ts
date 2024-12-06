import type { SymbolRegistry } from "./registry.ts"
import { symbol } from "./symbol.ts"

type GlobalThis = typeof globalThis

declare global {
  var SymbolRegistry: SymbolRegistry
}
