import type { Functor } from "@traversable/registry"
import { fn } from "@traversable/data"
import { Traversable } from "@traversable/core"

namespace Algebra {
  export const equal: Functor.RAlgebra<Traversable.lambda, derive.Stream> = (n) => {
    switch (true) {
      default: return fn.exhaustive(n)
      case Traversable.is.enum(n): return { go: (path) => "Object.is(" + path.join(", ") + ")"}
      case Traversable.is.const(n): return { go: (path) => "Object.is(" + path.join(", ") + ")" }
      case Traversable.is.null(n): return { go: (path) => `if (${path.join("")} != null) return false;\n` }
      case Traversable.is.boolean(n): return { go: (path) => `if (typeof ${path.join("")} !== "boolean") return false;\n` }
      case Traversable.is.integer(n): return { go: (path) => `if (typeof ${path.join("")} !== "number") return false;\n` }
      case Traversable.is.number(n): return { go: (path) => `if (typeof ${path.join("")} !== "number") return false;\n` }
      case Traversable.is.string(n): return { go: (path) => `if (typeof ${path.join("")}!=="string") return false;\n` }
      case Traversable.is.object(n): return {
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
      case Traversable.is.tuple(n): return {
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
      case Traversable.is.any(n): return fn.throw("UNIMPLEMENTED")
      case Traversable.is.array(n): return fn.throw("UNIMPLEMENTED")
      case Traversable.is.allOf(n): return fn.throw("UNIMPLEMENETED")
      case Traversable.is.anyOf(n): return fn.throw("UNIMPLEMENETED")
      case Traversable.is.oneOf(n): return fn.throw("UNIMPLEMENETED")
      case Traversable.is.record(n): return fn.throw("UNIMPLEMENTED")
    }
  }
}

derive.fold = fn.flow(
  Traversable.fromJsonSchema, 
  fn.para(Traversable.Functor)(Algebra.equal),
)

export function derive(options?: derive.Options): (schema: Traversable.orJsonSchema) => string
export function derive({ 
  functionName = derive.defaults.functionName 
}: derive.Options = derive.defaults) { 
  return (schema: Traversable.orJsonSchema) => ""
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
