import { fn } from "@traversable/data"
import type { Functor } from "@traversable/registry"
import { Ext as Schema } from "./model.js"

namespace Algebra {
  export const equal: Functor.RAlgebra<Schema.lambda, derive.Stream> = (n) => {
    switch (true) {
      default: return fn.exhaustive(n)
      case Schema.is.enum(n): return { go: (path) => "Object.is(" + path.join(", ") + ")"}
      case Schema.is.null(n): return { go: (path) => `if (${path.join("")} != null) return false;\n` }
      case Schema.is.boolean(n): return { go: (path) => `if (typeof ${path.join("")} !== "boolean") return false;\n` }
      case Schema.is.integer(n): return { go: (path) => `if (typeof ${path.join("")} !== "number") return false;\n` }
      case Schema.is.number(n): return { go: (path) => `if (typeof ${path.join("")} !== "number") return false;\n` }
      case Schema.is.string(n): return { go: (path) => `if (typeof ${path.join("")}!=="string") return false;\n` }
      case Schema.is.object(n): return {
        go: (path) => {
          return Object.entries(n.properties)
            .map(([k, [, ctx]]) => {
              const $NEXT = [...path, k]
              const $REF = path.join("")
              const $VARNAME = $NEXT.join("")
              const $POINTER = path.length === 0 ? "$" : path.join("") + `["${k}"]`
              const $DECLARATION = `let ${$VARNAME} = ${$POINTER};\n`
              const $REST = ctx.go($NEXT)
              const $CHECK =
                $REF.length === 0
                  ? ""
                  : `if (!${$REF} || typeof ${$REF} !== "object" || Array.isArray(${$REF})${
                      !ctx.nextIndex || !ctx.keyCount
                        ? ""
                        : `|| ${ctx.keyCount} > Object.keys(${$REF}).length`
                    }) return false;\n`
              return $CHECK + $DECLARATION + $REST
            })
            .join("")
        },
      }
      case Schema.is.tuple(n): return {
        go: (path) => {
          return n.items
            .map(([, ctx], ix) => {
              const $NEXT = [...path, ix]
              const $REF = path.join("")
              const $VAR = $NEXT.join("")
              const $POINTER = path.length === 0 ? "$" : $REF + `[${ix}]`
              const $DECLARATION = `let ${$VAR}=${$POINTER};\n`
              const $REST = ctx.go($NEXT)
              const $CHECK =
                $REF.length === 0
                  ? ""
                  : `if (!Array.isArray(${$REF})${
                      ctx.keyCount === undefined ? "" : ` || ${ctx.keyCount} > ${$REF}.length`
                    }) return false;\n`
              return $CHECK + $DECLARATION + $REST
            })
            .join("")
        },
      }
      ///
      case Schema.is.array(n): return fn.throw("UNIMPLEMENTED")
      case Schema.is.record(n): return fn.throw("UNIMPLEMENTED")
      case Schema.is.allOf(n): return fn.throw("UNIMPLEMENETED")
      case Schema.is.anyOf(n): return fn.throw("UNIMPLEMENETED")
      case Schema.is.oneOf(n): return fn.throw("UNIMPLEMENETED")
    }
  }
}

derive.fold = fn.flow(
  Schema.fromSchema, 
  fn.para(Schema.functor)(Algebra.equal),
)

export function derive(options?: derive.Options): (schema: Schema.Weak) => string
export function derive({ 
  functionName = derive.defaults.functionName 
}: derive.Options = derive.defaults) { 
  return (schema: Schema.Weak) => ""
  + "function " 
  + functionName 
  + "($){" 
  + derive.fold(schema).go([]) 
  + "}" 
}

export declare namespace derive {
  interface Options {
    functionName?: string
  }

  interface Stream {
    go(path: (string | number)[]): string
    nextIndex?: string | number
    keyCount?: number
  }
}

export namespace derive {
  export const defaults = {
    /**
     * ### {@link validator.defaults.functionName `validator.Options.functionName`}
     *
     * Defaults to `validate` if not specified
     */
    functionName: "validate",
  } satisfies derive.Options
}
