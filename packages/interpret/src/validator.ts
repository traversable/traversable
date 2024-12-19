import { type Compare, Option, fn } from "@traversable/data"
import { openapi } from "@traversable/openapi"
import { type Functor, WeightMap } from "@traversable/registry"

import { is, or, tree } from "@traversable/core"
import { Ext, Ltd } from "./model.js"
import * as sort from "./sort.js"

export { deriveValidator as derive }

/** @internal */
const Object_entries = globalThis.Object.entries

const pairwise = (
  depth: number, 
  pathname?: string,
) => "$" + (depth + "") + "$" + (pathname ?? "")

// collisions?: (string | number)[], 
// const $collisions: (string | number)[] = [] // Object.keys(x)
// const $prev = [pairwise(depth, $collisions), ...path.slice(1)].join("")
// const $collisions = Object.keys(n.items.map((_, ix) => ix))
// const $prev =  [pairwise(depth, $collisions), ...path.slice(1)].join("")

namespace RAlgebra {
  export const validator: Functor.RAlgebra<Ext.lambda, deriveValidator.Stream> = (n) => {
    switch (true) {
      case Ltd.is.null(n):
        return { go: (path) => `if(${path.join("")}!=null)return false;` }
      case Ltd.is.boolean(n):
        return { go: (path) => `if(typeof ${path.join("")}!=="boolean")return false;` }
      case Ltd.is.integer(n):
        return { go: (path) => `if(typeof ${path.join("")}!=="number")return false;` }
      case Ltd.is.number(n):
        return { go: (path) => `if(typeof ${path.join("")}!=="number")return false;` }
      case Ltd.is.string(n):
        return { go: (path) => `if(typeof ${path.join("")}!=="string")return false;` }
      case Ext.is.object(n):
        return {
          go: (path, depth) => {
            return Object_entries(n.properties)
              .map(([k, [x, ctx]]) => {
                const $prev = [pairwise(depth), ...path.slice(1)].join("")
                const $next = [...path, k]
                const $varname = $next.join("")
                const $var = `let ${$varname}=${$prev}["${k}"];`
                const $rest = ctx.go($next, depth)
                const $check =
                  $prev.length === 0
                    ? ""
                    : `if(!${$prev}||typeof ${$prev}!=="object"||Array.isArray(${$prev})${
                        !ctx.nextIndex || !ctx.keyCount
                          ? ""
                          : `||${ctx.keyCount}>Object.keys(${$prev}).length`
                      })return false;`
                return $check + $var + $rest
              })
              .join("")
          },
        }
      case Ext.is.tuple(n):
        return {
          go: (path, depth) => {
            const $prev =  [pairwise(depth), ...path.slice(1)].join("")
            const $check = `if(!Array.isArray(${$prev}))return false;`
            return (
              $check +
              n.items
                .map(([x, ctx], ix) => {
                  const $ix = "originalIx" in x && typeof x.originalIx === "number" 
                    ? x.originalIx 
                    : ix
                  const $next = [$prev, $ix]
                  const $var = $next.join("")
                  const $binding = 
                    "let " 
                    + $var 
                    + "=" 
                    + $prev 
                    + "[" + $ix + "];"
                  return $binding + ctx.go($next, depth)
                })
                .join("")
            )
          },
        }
      case Ext.is.array(n): {
        return {
          go: (path, depth) => {
            const $prev = [pairwise(depth), ...path.slice(1)].join("")
            const $check = `if(!Array.isArray(${$prev}))return false;`
            const $path = path.length === 0 
              ? [pairwise(depth + 1)]
              : [pairwise(depth + 1), ...path.slice(1)]
            const $next = $path.join("")
            const $loop = [
              `for(let i=0;i<${$prev}.length;i++){`, 
              "}",
            ]
            const $loopVar = `let ${$next}=${$prev}[i];`
            return (
              $check
              + $loop[0] 
              + $loopVar
              + [n.items].map(([, ctx]) => ctx.go($path, depth + 1))[0] 
              + $loop[1]
            )
          },
        }
      }
      case Ext.is.record(n): {
        return {
          go: (path, depth) => {
            const $prev = [pairwise(depth), ...path.slice(1)].join("")
            const $check = `if(!${$prev}||typeof ${$prev}!=="object"||Array.isArray(${$prev}))return false;`
            const $keys = `let $k${depth}=Object.keys(${$prev});`
            // const $inner = pairwise(depth + 1, [], path.slice(1).join(""))
            const $inner = pairwise(depth + 1, path.slice(1).join(""))
            const $path = path.length === 0 
              ? [pairwise(depth + 1)]
              : [pairwise(depth + 1), ...path.slice(1)]
            const $loopVar = `let ${$inner}=${$prev}[$k${depth}[i]];`
            const $loop = [
              `for(let i=0;i<$k${depth}.length;i++){`,
              "}",
            ]

            return (
              $check
              + $keys
              + $loop[0] 
              + $loopVar
              + [n.additionalProperties].map(([, ctx]) => ctx.go($path, depth + 1))[0] 
              + $loop[1]
            )
          }
        }
      }
      case Ext.is.allOf(n):
        return fn.throw("UNIMPLEMENETED")
      case Ext.is.anyOf(n):
        return fn.throw("UNIMPLEMENETED")
      case Ext.is.oneOf(n):
        return fn.throw("UNIMPLEMENETED")
      default:
        return fn.exhaustive(n)
    }
  }
}

deriveValidator.fold = fn.flow(Ext.fromSchema, fn.para(Ext.functor)(RAlgebra.validator))

deriveValidator.defaults = {
  compare: sort.derive.defaults.compare,
  /**
   * ### {@link defaults.document `validator.Options.document`}
   *
   * If any part of the schema you'd like to interpret contains a ref,
   * {@link derive `validator.derive`} will take care of resolving them
   * for you if you provide the document via this config option.
   */
  document: openapi.doc({
    openapi: "3.1.0",
    paths: {},
    info: { title: "Untitled", version: "0.0.0" },
  }),
  weightMap: WeightMap,
  /**
   * ### {@link defaults.functionName `validator.Options.functionName`}
   *
   * If not specified, {@link derive `validator.derive`} will generate a
   * function expression instead of a function declaration.
   */
  functionName: "",
  /**
   * ### {@link defaults.include `validator.Options.functionName`}
   *
   * If not specified, {@link derive `validator.derive`} will generate a
   * function expression instead of a function declaration.
   */
  includeType: true as boolean,
} satisfies deriveValidator._Internal.Options

declare namespace deriveValidator {
  type Options = Partial<typeof deriveValidator.defaults>
  interface Stream {
    go(path: (string | number)[], depth: number): string
    nextIndex?: string | number
    keyCount?: number
  }

  namespace _Internal {
    interface Options {
      functionName?: string
      document: openapi.doc
      compare: Compare<Ext>
      weightMap: WeightMap
      includeType: boolean
    }
  }
}

/**
 * ## {@link derive `validator.derive`}
 *
 * Given a JSON Schema object, compiles a super fast validation function.
 *
 * All this function does is return true/false depending on whether the input
 * object satisfies the spec.
 */
function deriveValidator(schema: Ltd | Ext | Ext.lax, options?: deriveValidator.Options): string
function deriveValidator(
  schema: Ltd | Ext | Ext.lax, {
    functionName,
    compare = deriveValidator.defaults.compare,
    includeType = deriveValidator.defaults.includeType,
  }: deriveValidator.Options = deriveValidator.defaults,
) {
  return fn.pipe(
    schema,
    sort.derive({ compare }),
    deriveValidator.fold,
    (xf) => xf.go([], 0),
    (body) => `function${functionName && functionName.length > 0 ? " " + functionName : ""}($0$${includeType ? ":any" : ""}){` + body + "return true;}",
  )
}
