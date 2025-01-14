import { Traversable, core, show, t, tree } from "@traversable/core"
import { fn } from "@traversable/data"
import { openapi } from "@traversable/openapi"
import type { Functor, Partial } from "@traversable/registry"

import * as Sort from "./sort.js"
import * as Type from "./type.js"

export { deriveValidator as derive }

export type Options = Partial<typeof defaults>
export type ContinuationContext = {
  path: (string | number)[], 
  depth: number, 
  isRequired: boolean
}

export interface Stream {
  GO(ctx: ContinuationContext): string
  nextIndex?: string | number
  keyCount?: number
  required?: (string | number)[]
}

export const defaults = {
  compare: Sort.derive.defaults.compare,
  /**
   * ### {@link defaults.document `validator.Options.document`}
   *
   * If any part of the schema you'd like to interpret contains a ref,
   * {@link derive `validator.derive`} will take care of resolving them
   * for you if you provide the document via this config option.
   */
  document: openapi.doc<openapi.doc>({
    openapi: "3.1.0",
    paths: {},
    components: { schemas: {} },
    info: { title: "Untitled", version: "0.0.0" },
  }),
  /**
   * ### {@link defaults.functionName `validator.Options.functionName`}
   *
   * If not specified, {@link derive `validator.derive`} will generate a
   * function expression instead of a function declaration.
   */
  functionName: "",
  flags: { 
    /** 
     * #### {@link defaults.flags.treatArraysLikeObjects `Options.flags.treatArraysLikeObjects`} 
     * 
     * If `true`, record validations will perform an extra check that invalidates array 
     * candidates that would otherwise pass validation.
     * 
     * Since arrays are JavaScript objects, this flag is **opt-out** (defaults to `true`).
     */
    treatArraysLikeObjects: false,
    jitCompile: true as boolean,
  },
}

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const ident = (depth: number, pathname?: string) => "$" + (depth + "") + "$" + (pathname ?? "")
/** @internal */
const nextValidIdent = (...args: [depth: number, pathname?: string]) => "V" + ident(...args)

namespace RAlgebra {
  const inlineOptionalityCheck = ($: ContinuationContext) =>
    $.isRequired ? "" : $.path.join("") + "!==undefined&&"

  /**
   * - [ ] TODO:
   * Possible optimization: use # of required keys to
   * short-circuit if target doesn't have at least that many keys
   */
  export function validator(options?: Options): Functor.RAlgebra<Traversable.lambda, Stream> 
  export function validator($$: Options = defaults): Functor.RAlgebra<Traversable.lambda, Stream> {
    return (n) => {
      switch (true) {
        default: return fn.exhaustive(n)
        case Traversable.is.enum(n): return { GO: () => "" }

        case Traversable.is.null(n): return { 
          GO: ($) => {
            return ""
              + "if(" 
              + $.path.join("") 
              + "!==null){return false;}"
            //
          }
        } 
        case Traversable.is.boolean(n): return { 
          GO: ($) => ""
            + "if("
            + inlineOptionalityCheck($)
            + "typeof "
            + $.path.join("")
            + '!=="boolean"'
            + ")return false;"
          //
        } 
        case Traversable.is.integer(n): return { 
          GO: ($) => ""
            + "if(" 
            + inlineOptionalityCheck($) 
            + "!Number.isInteger(" 
            + $.path.join("") 
            + "))return false;"
          //
        }
        case Traversable.is.number(n): return {
          GO: ($) => ""
            + "if(" 
            + inlineOptionalityCheck($) 
            + `typeof ${$.path.join("")}!=="number")return false;`
          //
        }
        case Traversable.is.string(n): return {
          GO: ($) => "" 
            + "if(" 
            + inlineOptionalityCheck($) 
            +  "typeof " + $.path.join("") + '!=="string"'
            + ")return false;"
          //
        }

        case Traversable.is.allOf(n): return { 
          GO($) { return n.allOf.map(([, ctx]) => ctx.GO($)).join("") } 
        }

        case Traversable.is.anyOf(n): return { 
          GO($) { 
            const path = [ident($.depth), ...$.path.slice(1)]
            const $valid = `v${path.join("")}`
            return "let " + $valid + "=" + "[" 
              + n.anyOf.map(([, xf]) => {
                const CHILD = xf.GO({ path, depth: $.depth, isRequired: true })
                return "(() => {" + CHILD + "return true;})()"
              })
              .join(",")
              + "].some((_) => _ === true);" 
              + "if(" + $valid + "!==true)return false;"
          }
        }

        case Traversable.is.oneOf(n): return {
          GO($) { 
            const path = [ident($.depth), ...$.path.slice(1)]
            const $valid = `v${path.join("")}`
            return "let " + $valid + "=" + "[" 
              + n.oneOf.map(([, xf]) => {
                const CHILD = xf.GO({ path, depth: $.depth, isRequired: true })
                return "(() => {" + CHILD + "return true;})()"
              })
              .join(",")
              + "].filter((_) => _ === true);" 
              + "if(" + $valid + ".length !==1)return false;"
          }
        }

        case Traversable.is.object(n): return {
          GO($) {
            const $$_path = [ident($.depth), ...$.path.slice(1)]
            const $$_varname = $$_path.join("")
            const CHILDREN = Object_entries(n.properties)
              .map(([k, [, xf]]) => {
                const isRequired = (n.required ?? []).includes(k)
                const path = [...$$_path, k]
                const $_varname = path.join("")
                const var_ = `let ${$_varname}=${$$_varname}["${k}"];`
                const CHILD = xf.GO({ ...$, path, isRequired })
                return var_ + CHILD
              })
            //

            const $$_check
              = "if(" 
              + (! $.isRequired ? $$_varname + "===null" : "!" + $$_varname)
              + "||"
              + "typeof " + $$_varname + '!=="object"' 
              + ($$.flags?.treatArraysLikeObjects ? "" : "||Array.isArray(" + $$_varname + ")")
              + ")"
              + "return false;"
            //

            const $$_reqOpen  = $.isRequired ? ( "" ) : ( "if(" + $.path.join("") + "!==undefined){" )
            const $$_reqClose = $.isRequired ? ( "" ) : ( "}" )
            //
            return "" 
              + $$_reqOpen
              + $$_check
              + CHILDREN.join("")
              + $$_reqClose
            //
          },
        }

        case Traversable.is.tuple(n): return {
          GO($) {
            const $$_path = [ident($.depth), ...$.path.slice(1)]
            const $$_varname = $$_path.join("")
            const $reqOpen = $.isRequired ? "" : "if(" + $$_varname + "!==undefined){"
            const $reqClose = $.isRequired ? "" : "}"
            const $check = `if(!Array.isArray(${$$_varname}))return false;`
            return "" 
              + $reqOpen 
              + $check 
              + n.items
                .map(([x, ctx], ix) => {
                  const ix_ = tree.has("originalIndex", core.is.number)(x) ? x.originalIndex : ix
                  const path = [...$$_path, ix_]
                  const varname_ = path.join("")
                  const var_ = `let ${varname_}=${$$_varname}[${ix_}];`
                  return var_ + ctx.GO({ path, depth: $.depth, isRequired: true })
                }).join("") 
              + $reqClose
            //
          },
        }

        case Traversable.is.array(n): {
          return {
            GO($) {
              const $prev = [ident($.depth), ...$.path.slice(1)].join("")
              const $reqOpen = $.isRequired ? "" : "if(" + $.path.join("") + "!==undefined){"
              const $reqClose = $.isRequired ? "" : "}"
              const $check = `if(!Array.isArray(${$prev}))return false;`
              const $loop = [`for(let i=0;i<${$prev}.length;i++){`, "}"]
              const path = $.path.length === 0 ? [ident($.depth + 1)] : [ident($.depth + 1), ...$.path.slice(1)]
              const $var = path.join("")
              const $binding = `let ${$var}=${$prev}[i];`
              return ""
                + $reqOpen
                + $check
                + $loop[0]
                + $binding
                + [n.items].map(([, ctx]) => ctx.GO({ path, depth: $.depth + 1, isRequired: true }))[0]
                + $loop[1]
                + $reqClose
              //
            },
          }
        }

        case Traversable.is.record(n): {
          return {
            GO($) {
              const $prev = [ident($.depth), ...$.path.slice(1)].join("")
              const arrayCheck = $$.flags?.treatArraysLikeObjects ? "" : `||Array.isArray(${$prev})`
              const $reqOpen = $.isRequired ? "" : "if(" + $.path.join("") + "!==undefined){"
              const $reqClose = $.isRequired ? "" : "}"
              const $check =
                "" + `if(!${$prev}||typeof ${$prev}!=="object"` + arrayCheck + ")return false;"
              const $keys = `let $k${$.depth}=Object.keys(${$prev});`
              const $inner = ident($.depth + 1, $.path.slice(1).join(""))
              const $binding = `let ${$inner}=${$prev}[$k${$.depth}[i]];`
              const $loop = [`for(let i=0;i<$k${$.depth}.length;i++){`, "}"]
              const path = $.path.length === 0 ? [ident($.depth + 1)] : [ident($.depth + 1), ...$.path.slice(1)]
              //
              return ""
                + $reqOpen
                + $check
                + $keys
                + $loop[0]
                + $binding
                + [n.additionalProperties].map(([, ctx]) => ctx.GO({ path, depth: $.depth + 1, isRequired: true }))[0]
                + $loop[1]
                + $reqClose
            }
          }
        }
      }
    }
  }
}

deriveValidator.defaults = defaults
deriveValidator.fold = ({ 
  compare = deriveValidator.defaults.compare,
  flags: { 
    treatArraysLikeObjects = defaults.flags.treatArraysLikeObjects,
    jitCompile = defaults.flags.jitCompile,
  } = defaults.flags,
}: Pick<Options, "compare" | "flags"> = deriveValidator.defaults,
) =>
  fn.flow(
    Sort.derive({ compare }), 
    Traversable.fromJsonSchema,
    fn.para(Traversable.Functor)(RAlgebra.validator({ flags: { treatArraysLikeObjects, jitCompile }})), 
    (xf) => xf.GO({ path: [], depth: 0, isRequired: true }),
  );

/**
 * ## {@link derive `validator.derive`}
 *
 * Given a JSON Schema object, compiles a super fast validation function.
 *
 * All this function does is return true/false depending on whether the input
 * object satisfies the spec.
 */
function deriveValidator(schema: Traversable.any, options?: Options): string
function deriveValidator(
  schema: Traversable.any,
  {
    functionName,
    compare = defaults.compare,
    flags = defaults.flags,
  }: Options = deriveValidator.defaults,
) {
  const $_ = flags.jitCompile ? "" : " "
  const $type = flags.jitCompile ? "" : ":" + $_ + "$0$ is " + Type.derive.fold({ minify: flags.jitCompile })(schema)
  return fn.pipe(
    schema,
    deriveValidator.fold({ compare, flags }),
    (body) =>
      "" +
      (flags.jitCompile ? "(" : "") +
      `function${functionName && functionName.length > 0 ? " " + functionName : ""}($0$${
        flags.jitCompile ? "" : ":any"
      })${$type}{` +
      body +
      "return true;}" +
      (flags.jitCompile ? ")" : ""),
  )
}
