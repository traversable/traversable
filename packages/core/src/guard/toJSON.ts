import { fn } from "@traversable/data"
import type { Functor } from "@traversable/registry"
import type { Json } from "../json.js"
import { AST } from "./ast.js"

export namespace Recursive {
  export const toJSON: Functor.Algebra<AST.lambda, Json> = (term) => {
    switch (true) {
      default: return fn.exhaustive(term)
      case term._tag === "null": 
      case term._tag === "boolean":
      case term._tag === "symbol":
      case term._tag === "integer":
      case term._tag === "number":
      case term._tag === "string": 
      case term._tag === "any": return { _tag: term._tag }
      case term._tag === "const":
      case term._tag === "optional": 
      case term._tag === "array":
      case term._tag === "record":
      case term._tag === "anyOf":
      case term._tag === "allOf":
      case term._tag === "tuple":
      case term._tag === "object": return { _tag: term._tag, _def: term._def }
    }
  }
}

export const toJSON = AST.fold(Recursive.toJSON)
