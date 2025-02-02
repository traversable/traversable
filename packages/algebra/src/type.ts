import { type Compare, fn, object } from "@traversable/data"
import type { Functor } from "@traversable/registry"

import { Traversable } from "@traversable/core"
import * as Sort from "./sort.js"

export { deriveType as derive }

/** @internal */
const Object_entries = globalThis.Object.entries

export namespace Algebra {
  export const types: (options?: deriveType.Options) => Functor.Algebra<Traversable.lambda, string> =
    ({ minify = deriveType.defaults.minify } = deriveType.defaults) =>
    (n) => {
      const _ = minify ? "" : " "
      switch (true) {
        default: return fn.exhaustive(n)
        case Traversable.is.enum(n): return n.enum.join(" | ")
        case Traversable.is.const(n): return JSON.stringify(n.const)
        case Traversable.is.null(n): return "null"
        case Traversable.is.any(n): return "unknown"
        case Traversable.is.boolean(n): return "boolean"
        case Traversable.is.integer(n): return "number"
        case Traversable.is.number(n): return "number"
        case Traversable.is.string(n): return "string"
        case Traversable.is.allOf(n): return n.allOf.join(_ + "&" + _)
        case Traversable.is.anyOf(n): return n.anyOf.join(_ + "|" + _)
        case Traversable.is.oneOf(n): return n.oneOf.join(_ + "|" + _)
        case Traversable.is.array(n): return n.items + "[]"
        case Traversable.is.tuple(n): return "[" + n.items.join("," + _) + "]"
        case Traversable.is.record(n): return "Record<string," + _ + n.additionalProperties + ">"
        case Traversable.is.object(n): return "{" + _ 
          + Object_entries(n.properties).map(([k, v]) => "" 
            + object.parseKey(k) 
            + ((n.required ?? []).includes(k) ? ":" + _ : "?:" + _) 
            + v
          ).join(";" + _) 
          + _ + "}"
      }
    }
}

declare namespace deriveType {
  type Options = Partial<typeof deriveType.defaults>
  namespace _Internal {
    interface Options {
      compare: Compare<Traversable>
      typeName: string
      minify: boolean
      // preferInterfaces: boolean
    }
  }
}

const deriveType_fold = (options: deriveType.Options = deriveType.defaults) => fn.flow(
  Traversable.fromJsonSchema, 
  fn.cata(Traversable.Functor)(Algebra.types(options)),
)

const deriveType_defaults = {
  compare: Sort.derive.defaults.compare,
  typeName: "Anonymous",
  minify: false as boolean,
} satisfies deriveType._Internal.Options

function deriveType(schema: Traversable.orJsonSchema, options?: deriveType.Options): string
function deriveType(
  schema: Traversable.orJsonSchema, {
    compare = deriveType.defaults.compare,
    typeName = deriveType.defaults.typeName,
    minify = deriveType.defaults.minify,
  }: deriveType.Options = deriveType.defaults,
): string {
  const _ = minify ? "" : " "
  return fn.pipe(
    schema,
    Sort.derive({ compare }),
    deriveType.fold({ compare, typeName, minify }),
    (body) => "type " + typeName + _ + "=" + _ + body,
  )
}

void (deriveType.defaults = deriveType_defaults)
void (deriveType.fold = deriveType_fold)
