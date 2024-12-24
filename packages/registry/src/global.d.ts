import type { 
  SymbolRegistry,
  NodeRegistry,
} from "./registry.js"
import { symbol } from "./symbol.js"

type GlobalThis = typeof globalThis

declare global {
  var SymbolRegistry: SymbolRegistry
  var NodeRegistry: NodeRegistry
}
