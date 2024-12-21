import { type Compare, fn, object } from "@traversable/data"
import type { Functor } from "@traversable/registry"

import { Ext as Schema } from "./model.js"
import * as sort from "./sort.js"

export { deriveType as derive }

export namespace Algebra {
  export const types: (options?: deriveType.Options) => Functor.Algebra<Schema.lambda, string> =
    ({ minify = deriveType.defaults.minify } = deriveType.defaults) =>
    (n) => {
      const _ = minify ? "" : " "
      switch (true) {
        case Schema.is.null(n):
          return "null"
        case Schema.is.boolean(n):
          return "boolean"
        case Schema.is.integer(n):
          return "number"
        case Schema.is.number(n):
          return "number"
        case Schema.is.string(n):
          return "string"
        case Schema.is.allOf(n):
          return n.allOf.join(`${_}&${_}`)
        case Schema.is.anyOf(n):
          return n.anyOf.join(`${_}|${_}`)
        case Schema.is.oneOf(n):
          return n.oneOf.join(`${_}|${_}`)
        case Schema.is.array(n):
          return n.items + "[]"
        case Schema.is.tuple(n):
          return "[" + n.items.join(`,${_}`) + "]"
        case Schema.is.record(n):
          return `Record<string,${_}` + n.additionalProperties + ">"
        case Schema.is.object(n):
          return (
            `{${_}` +
            Object.entries(n.properties)
              .map(([k, v]) => object.parseKey(k) + (n.required.includes(k) ? `:${_}` : `?:${_}`) + v)
              .join(`;${_}`) +
            `${_}}`
          )
        default:
          return fn.exhaustive(n)
      }
    }
}

deriveType.fold = (options: deriveType.Options = deriveType.defaults) =>
  fn.flow(Schema.fromSchema, fn.cata(Schema.functor)(Algebra.types(options)))

deriveType.defaults = {
  compare: sort.derive.defaults.compare,
  typeName: "Anonymous",
  minify: false as boolean,
} satisfies deriveType._Internal.Options

declare namespace deriveType {
  type Options = Partial<typeof deriveType.defaults>
  namespace _Internal {
    interface Options {
      compare: Compare<Schema>
      typeName: string
      minify: boolean
      // preferInterfaces: boolean
    }
  }
}

function deriveType(schema: Schema.any, options?: deriveType.Options): string
function deriveType(
  schema: Schema.any,
  {
    compare = deriveType.defaults.compare,
    typeName = deriveType.defaults.typeName,
    minify = deriveType.defaults.minify,
  }: deriveType.Options = deriveType.defaults,
): string {
  const _ = minify ? "" : " "
  return fn.pipe(
    schema,
    sort.derive({ compare }),
    deriveType.fold({ compare, typeName, minify }),
    (body) => `type ${typeName}${_}=${_}` + body,
  )
}
