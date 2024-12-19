import { type Compare, fn, object } from "@traversable/data"
import { type Functor } from "@traversable/registry"

import { Ext, Ltd } from "./model.js"
import * as sort from "./sort.js"

export { deriveType as derive }

namespace Algebra {
  export const types: Functor.Algebra<Ext.lambda, string> = (n) => {
    switch (true) {
      case Ltd.is.null(n): return "null"
      case Ltd.is.boolean(n): return "boolean"
      case Ltd.is.integer(n): return "number"
      case Ltd.is.number(n): return "number"
      case Ltd.is.string(n): return "string"
      case Ext.is.allOf(n): return n.allOf.join(" & ")
      case Ext.is.anyOf(n): return n.anyOf.join(" | ")
      case Ext.is.oneOf(n): return n.oneOf.join(" | ")
      case Ext.is.array(n): return "(" + n.items + ")[]"
      case Ext.is.tuple(n): return "[" + n.items.join(", ") + "]"
      case Ext.is.record(n): return "Record<string, " + n.additionalProperties + ">"
      case Ext.is.object(n): return "{ " + Object.entries(n.properties).map(([k, v]) => object.parseKey(k) + ": " + v).join("; ") + " }"
      default: return fn.exhaustive(n)
    }
  }
}

deriveType.fold = fn.flow(
  Ext.fromSchema,
  fn.cata(Ext.functor)(Algebra.types),
)

deriveType.defaults = {
  compare: sort.derive.defaults.compare,
  typeName: "Anonymous",
} satisfies deriveType._Internal.Options

declare namespace deriveType {
  type Options = Partial<typeof deriveType.defaults>
  namespace _Internal {
    interface Options {
      compare: Compare<Ext>
      typeName: string
      // preferInterfaces: boolean
    }
  }
}

function deriveType(schema: Ltd | Ext | Ext.lax, options?: deriveType.Options): string
function deriveType(
  schema: Ltd | Ext | Ext.lax, { 
    compare = deriveType.defaults.compare,
    typeName = deriveType.defaults.typeName,
  }: deriveType.Options = deriveType.defaults
): string {
  return fn.pipe(
    schema,
    sort.derive({ compare }),
    deriveType.fold,
    (body) => `type ${typeName} = ` + body + ``,
  )
}
