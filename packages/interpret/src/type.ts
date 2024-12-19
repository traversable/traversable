import { type Compare, Option, fn } from "@traversable/data"
import { openapi } from "@traversable/openapi"
import { type Functor, WeightMap } from "@traversable/registry"

import { is, or, tree } from "@traversable/core"
import { Ext, Ltd } from "./model.js"
import * as sort from "./sort.js"

export { deriveType as derive }

namespace Algebra {
  export const types: Functor.Algebra<Ext.lambda, string> = (n) => {
    switch (true) {
      case Ltd.is.null(n):
        return ""
      case Ltd.is.boolean(n):
        return ""
      case Ltd.is.integer(n):
        return ""
      case Ltd.is.number(n):
        return ""
      case Ltd.is.string(n):
        return ""
      case Ext.is.object(n):
        return ""
      case Ext.is.tuple(n):
        return ""
      case Ext.is.array(n): {
        return ""
      }
      case Ext.is.record(n): {
        return ""
      }
      case Ext.is.allOf(n): return fn.throw("UNIMPLEMENETED")
      case Ext.is.anyOf(n): return fn.throw("UNIMPLEMENETED")
      case Ext.is.oneOf(n): return fn.throw("UNIMPLEMENETED")
      default:
        return fn.exhaustive(n)
    }

  }
}

deriveType.fold = fn.flow(
  Ext.fromSchema,
  fn.tap("here", (...args) => console.log(...args.map((a) => JSON.stringify(a, null, 2)))),
  fn.cata(Ext.functor)(Algebra.types),
)

// deriveType.defaults = {}

declare namespace deriveType {}

function deriveType() {}
