import { fn } from "@traversable/data"
import type { Functor } from "@traversable/registry"
import { AST } from "./ast.js"

/** @internal */
const stringify = globalThis.JSON.stringify
/** @internal */
const Object_entries = globalThis.Object.entries

export namespace Recursive {
  export const toString: Functor.Algebra<AST.lambda, string> = (n) => {
    switch (true) {
      default: return fn.exhaustive(n)
      case n._tag === "null": return "null"
      case n._tag === "boolean": return "boolean"
      case n._tag === "symbol": return "symbol"
      case n._tag === "integer": return "integer"
      case n._tag === "number": return "number"
      case n._tag === "string": return "string"
      case n._tag === "any": return "unknown"
      case n._tag === "enum": return n.def.join(" | ")
      case n._tag === "const": return JSON.stringify(n.def)
      case n._tag === "optional": return n.def + " | undefined"
      case n._tag === "array": return "Array<" + n.def + ">"
      case n._tag === "record": return "Record<string, " + n.def + ">"
      case n._tag === "allOf": return n.def.join(" & ")
      case n._tag === "anyOf": return n.def.join(" | ")
      case n._tag === "oneOf": return n.def.join(" | ")
      case n._tag === "tuple": return "[" + n.def.join(", ") + "]"
      case n._tag === "object": {
        const xs = Object_entries(n.def).map(([k, v]) => [stringify(k), v])
        return xs.length === 0 ? "{}" : "{ " + xs.join(", ") + " }"
      }
    }
  }
}

export const toString = AST.fold(Recursive.toString)
