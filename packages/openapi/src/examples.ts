import { Traversable } from '@traversable/core'
import { fn, map } from "@traversable/data"
import type { Functor } from "@traversable/registry"

const getExample = (node: Traversable) => node.meta?.example

namespace Algebra {
  export const composeExamples
    : Functor.Algebra<Traversable.lambda, Traversable>
    = (x) => {
      switch (true) {
        case Traversable.is.null(x): {
          x.meta && void (x.meta.example = null);
          return x
        }
        case Traversable.is.tuple(x): {
          x.meta && void (x.meta.example = map(x.items, getExample));
          return x
        }
        case Traversable.is.object(x): { 
          x.meta && void (x.meta.example = map(x.properties, getExample));
          return x
        }
        default: return x
      }
    }
}

/** 
 * ## {@link composeExamples `composeExamples`}
 * 
 * Traverses a JSON Schema or OpenAPI spec from the bottom-up, 
 * gathering any `example` nodes that it finds and uses them to build
 * up larger examples to distribute them to the branch nodes.
 * 
 * You can apply this rewrite rule to an OpenAPI document wholesale
 * by passing {@link composeExamples `composeExamples`} to `OpenAPI.map`.
 */
export const composeExamples = fn.cata(Traversable.Functor)(Algebra.composeExamples)
