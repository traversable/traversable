import { Compare, array, fn, map, number, order } from "@traversable/data"
import { Weight } from "@traversable/openapi"
import type { Functor } from "@traversable/registry"
import { Ext, JsonSchema } from "./model.js"

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries

namespace RAlgebra {
  export const validator: Functor.RAlgebra<Ext.Kind, derive.Stream> = (n) => {
    switch (true) {
      case JsonSchema.is.null(n):
        return { go: (path) => `if(${path.join("")} != null) return false;` }
      case JsonSchema.is.boolean(n):
        return { go: (path) => `if(typeof ${path.join("")} !== "boolean") return false;` }
      case JsonSchema.is.integer(n):
        return { go: (path) => `if(typeof ${path.join("")} !== "number") return false;` }
      case JsonSchema.is.number(n):
        return { go: (path) => `if(typeof ${path.join("")} !== "number") return false;` }
      case JsonSchema.is.string(n):
        return { go: (path) => `if(typeof ${path.join("")}!=="string") return false;` }
      case Ext.is.object(n):
        return {
          go: (path) => {
            return Object.entries(n.properties)
              .map(([k, [, ctx]]) => {
                const $NEXT = [...path, k]
                const $REF = path.join("")
                const $VARNAME = $NEXT.join("")
                const $POINTER = path.length === 0 ? "$" : path.join("") + `["${k}"]`
                const $DECLARATION = `let ${$VARNAME} = ${$POINTER};`
                const $REST = ctx.go($NEXT)
                const $CHECK =
                  $REF.length === 0
                    ? ""
                    : `if (!${$REF} || typeof ${$REF} !== "object" || Array.isArray(${$REF})${
                        !ctx.nextIndex || !ctx.keyCount
                          ? ""
                          : `|| ${ctx.keyCount} > Object.keys(${$REF}).length`
                      }) return false;`
                return $CHECK + $DECLARATION + $REST
              })
              .join("")
          },
        }
      case Ext.is.tuple(n):
        return {
          go: (path) => {
            return n.items
              .map(([, ctx], ix) => {
                const $NEXT = [...path, ix]
                const $REF = path.join("")
                const $VAR = $NEXT.join("")
                const $POINTER = path.length === 0 ? "$" : $REF + `[${ix}]`
                const $DECLARATION = `let ${$VAR}=${$POINTER};`
                const $REST = ctx.go($NEXT)
                const $CHECK =
                  $REF.length === 0
                    ? ""
                    : `if (!Array.isArray(${$REF})${
                        ctx.keyCount === undefined ? "" : ` || ${ctx.keyCount} > ${$REF}.length`
                      }) return false;`
                return $CHECK + $DECLARATION + $REST
              })
              .join("")
          },
        }
      case Ext.is.array(n):
        return fn.throw("UNIMPLEMENTED")
      case Ext.is.record(n):
        return fn.throw("UNIMPLEMENTED")
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

derive.fold = fn.flow(Ext.fromSchema, fn.para(Ext.functor)(RAlgebra.validator))

const WeightMap = { ...Weight.byType, array: Weight.byType.object, object: Weight.byType.array }

/**
 * ## {@link derive `validator.derive`}
 *
 * Given a JSON Schema object, compiles a super fast validation function.
 *
 * All this function does is return true/false depending on whether the input
 * object satisfies the spec.
 */
export function derive(schema: JsonSchema | Ext.lax, options?: derive.Options): string
export function derive(
  schema: JsonSchema | Ext.lax,
  { functionName = derive.defaults.functionName }: derive.Options = derive.defaults,
) {
  return `(function ${functionName}($){` + derive.fold(schema).go([]) + "})"
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
