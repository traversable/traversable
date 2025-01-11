import { Traversable, core, show, t, tree } from "@traversable/core"
import { fn } from "@traversable/data"
import { openapi } from "@traversable/openapi"
import type { Functor, Partial } from "@traversable/registry"

import * as Sort from "./sort.js"
import * as Type from "./type.js"

export { deriveValidator as derive }

export type Options = Partial<typeof defaults>
export interface Stream {
  go(path: (string | number)[], depth: number, isRequired: boolean): string
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
const pairwise = (depth: number, pathname?: string) => "$" + (depth + "") + "$" + (pathname ?? "")

namespace RAlgebra {
  const handleOptional = (isRequired: boolean, path: (string | number)[]) =>
    isRequired ? "" : path.join("") + "!==undefined&&"

  export function validator(options?: Options): Functor.RAlgebra<Traversable.lambda, Stream> 
  export function validator($: Options = defaults): Functor.RAlgebra<Traversable.lambda, Stream> {
    return (n) => {
      switch (true) {
        case Traversable.is.enum(n): return { go: () => "" }
        case Traversable.is.null(n): return { go: (path) => `if(${path.join("")}!==null)return false;` }
        case Traversable.is.boolean(n): return {
          go: (path, _, req) =>
            "if(" + handleOptional(req, path) + `typeof ${path.join("")}!=="boolean")return false;`,
        }
        case Traversable.is.integer(n): return {
          go: (path, _, req) => 
            "if(" + handleOptional(req, path) + `!Number.isInteger(${path.join("")}))return false;`,
        }
        case Traversable.is.number(n): return {
          go: (path, _, req) =>
            "if(" + handleOptional(req, path) + `typeof ${path.join("")}!=="number")return false;`,
          }
        case Traversable.is.string(n): return {
          go: (path, _, req) =>
            "if(" + handleOptional(req, path) + `typeof ${path.join("")}!=="string")return false;`,
        }
        case Traversable.is.object(n): {
          return {
            go: (path, depth, req) => {
              const $path = [pairwise(depth), ...path.slice(1)]
              const $prev = $path.join("")
              const $reqOpen = req ? "" : "if(" + path.join("") + "!==undefined){"
              const $reqClose = req ? "" : "}"
              const arrayCheck = $.flags?.treatArraysLikeObjects ? "" : `||Array.isArray(${$prev})`
              const $check = `if(${!req ? `${$prev}===null||` : `!${$prev}||`}typeof ${$prev}!=="object"` + arrayCheck + `)return false;`

              return (
                "" +
                $reqOpen +
                $check +
                Object_entries(n.properties)
                  .map(([k, [x, ctx]]) => {
                    /**
                     * - [ ] TODO:
                     * Possible optimization: use # of required keys to
                     * short-circuit if target doesn't have at least that many keys
                     */
                    const isRequired = (n.required ?? []).includes(k)
                    const $next = [...$path, k]
                    const $varname = $next.join("")
                    const $var = `let ${$varname}=${$prev}["${k}"];`
                    const $rest = ctx.go($next, depth, isRequired)

                    return "" + $var + $rest
                  })
                  .join("") +
                $reqClose
              )
            },
          }
        }
        case Traversable.is.tuple(n):
          return {
            go: (path, depth, req) => {
              const $path = [pairwise(depth), ...path.slice(1)]
              const $prev = $path.join("")
              const $reqOpen = req ? "" : "if(" + path.join("") + "!==undefined){"
              const $reqClose = req ? "" : "}"
              const $check = `if(!Array.isArray(${$prev}))return false;`

              return (
                "" +
                $reqOpen +
                $check +
                n.items
                  .map(([x, ctx], ix) => {
                    const $ix = tree.has("originalIndex", core.is.number)(x) ? x.originalIndex : ix
                    const $next = [...$path, $ix]
                    // const $path = [$prev, $ix]
                    const $var = $next.join("")
                    const $binding = `let ${$var}=${$prev}[${$ix}];`
                    return $binding + ctx.go($next, depth, true)
                  })
                  .join("") +
                $reqClose
              )
            },
          }
        case Traversable.is.array(n): {
          return {
            go: (path, depth, req) => {
              const $prev = [pairwise(depth), ...path.slice(1)].join("")
              const $reqOpen = req ? "" : "if(" + path.join("") + "!==undefined){"
              const $reqClose = req ? "" : "}"
              const $check = `if(!Array.isArray(${$prev}))return false;`
              const $path = path.length === 0 ? [pairwise(depth + 1)] : [pairwise(depth + 1), ...path.slice(1)]
              const $var = $path.join("")
              const $loop = [`for(let i=0;i<${$prev}.length;i++){`, "}"]
              const $binding = `let ${$var}=${$prev}[i];`
              return (
                "" +
                $reqOpen +
                $check +
                $loop[0] +
                $binding +
                [n.items].map(([, ctx]) => ctx.go($path, depth + 1, true))[0] +
                $loop[1] +
                $reqClose
              )
            },
          }
        }
        case Traversable.is.record(n): {
          return {
            go: (path, depth, req) => {
              const $prev = [pairwise(depth), ...path.slice(1)].join("")
              const arrayCheck = $.flags?.treatArraysLikeObjects ? "" : `||Array.isArray(${$prev})`
              const $reqOpen = req ? "" : "if(" + path.join("") + "!==undefined){"
              const $reqClose = req ? "" : "}"
              const $path = path.length === 0 ? [pairwise(depth + 1)] : [pairwise(depth + 1), ...path.slice(1)]
              const $check =
                "" + `if(!${$prev}||typeof ${$prev}!=="object"` + arrayCheck + ")return false;"
              const $keys = `let $k${depth}=Object.keys(${$prev});`
              const $inner = pairwise(depth + 1, path.slice(1).join(""))
              const $binding = `let ${$inner}=${$prev}[$k${depth}[i]];`
              const $loop = [`for(let i=0;i<$k${depth}.length;i++){`, "}"]

              return (
                "" +
                $reqOpen +
                $check +
                $keys +
                $loop[0] +
                $binding +
                [n.additionalProperties].map(([, ctx]) => ctx.go($path, depth + 1, true))[0] +
                $loop[1] +
                $reqClose
              )
            },
          }
        }
        case Traversable.is.allOf(n):
          return { go: (path, depth) => n.allOf.map(([, ctx]) => ctx.go(path, depth, true)).join("") }
        default:
          return fn.exhaustive(n)
        ///
        case Traversable.is.anyOf(n): return fn.throw("UNIMPLEMENETED")
        case Traversable.is.oneOf(n): return fn.throw("UNIMPLEMENETED")
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
    (xf) => xf.go([], 0, true),
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

// export const validator: Functor.RAlgebra<Schema.lambda, Stream> = (n) => {
//   switch (true) {
//     case Schema.is.enum(n): return { go: (path) => "" }
//     case Schema.is.null(n): return { go: (path) => `if(${path.join("")}!=null)return false;` }
//     case Schema.is.boolean(n): return {
//       go: (path, _, req) =>
//         "if(" + handleOptional(req, path) + `typeof ${path.join("")}!=="boolean")return false;`,
//     }
//     case Schema.is.integer(n): return {
//       go: (path, _, req) => 
//         "if(" + handleOptional(req, path) + `!Number.isInteger(${path.join("")}))return false;`,
//     }
//     case Schema.is.number(n): return {
//       go: (path, _, req) =>
//         "if(" + handleOptional(req, path) + `typeof ${path.join("")}!=="number")return false;`,
//       }
//     case Schema.is.string(n): return {
//       go: (path, _, req) =>
//         "if(" + handleOptional(req, path) + `typeof ${path.join("")}!=="string")return false;`,
//     }
//     case Schema.is.object(n):
//       return {
//         go: (path, depth, req) => {
//           const $path = [pairwise(depth), ...path.slice(1)]
//           const $prev = $path.join("")
//           const $reqOpen = req ? "" : "if(" + path.join("") + "!==undefined){"
//           const $reqClose = req ? "" : "}"
//           const $check = `if(${!req ? "" : `!${$prev}||`}typeof ${$prev}!=="object"||Array.isArray(${$prev}))return false;`
//           return (
//             "" +
//             $reqOpen +
//             $check +
//             Object_entries(n.properties)
//               .map(([k, [x, ctx]]) => {
//                 /**
//                  * - [ ] TODO:
//                  * Possible optimization: use # of required keys to
//                  * short-circuit if target doesn't have at least that many keys
//                  */
//                 const isRequired = n.required.includes(k)
//                 const $next = [...$path, k]
//                 const $varname = $next.join("")
//                 const $var = `let ${$varname}=${$prev}["${k}"];`
//                 const $rest = ctx.go($next, depth, isRequired)
//                 return "" + $var + $rest
//               })
//               .join("") +
//             $reqClose
//           )
//         },
//       }
//     case Schema.is.tuple(n):
//       return {
//         go: (path, depth, req) => {
//           const $path = [pairwise(depth), ...path.slice(1)]
//           const $prev = $path.join("")
//           const $reqOpen = req ? "" : "if(" + path.join("") + "!==undefined){"
//           const $reqClose = req ? "" : "}"
//           const $check = `if(!Array.isArray(${$prev}))return false;`
//           return (
//             "" +
//             $reqOpen +
//             $check +
//             n.items
//               .map(([x, ctx], ix) => {
//                 const $ix = tree.has("originalIndex", is.number)(x) ? x.originalIndex : ix
//                 const $next = [...$path, $ix]
//                 // const $path = [$prev, $ix]
//                 const $var = $next.join("")
//                 const $binding = `let ${$var}=${$prev}[${$ix}];`
//                 return $binding + ctx.go($next, depth, true)
//               })
//               .join("") +
//             $reqClose
//           )
//         },
//       }
//     case Schema.is.array(n): {
//       return {
//         go: (path, depth, req) => {
//           const $prev = [pairwise(depth), ...path.slice(1)].join("")
//           const $reqOpen = req ? "" : "if(" + path.join("") + "!==undefined){"
//           const $reqClose = req ? "" : "}"
//           const $check = `if(!Array.isArray(${$prev}))return false;`
//           const $path = path.length === 0 ? [pairwise(depth + 1)] : [pairwise(depth + 1), ...path.slice(1)]
//           const $var = $path.join("")
//           const $loop = [`for(let i=0;i<${$prev}.length;i++){`, "}"]
//           const $binding = `let ${$var}=${$prev}[i];`
//           return (
//             "" +
//             $reqOpen +
//             $check +
//             $loop[0] +
//             $binding +
//             [n.items].map(([, ctx]) => ctx.go($path, depth + 1, true))[0] +
//             $loop[1] +
//             $reqClose
//           )
//         },
//       }
//     }
//     case Schema.is.record(n): {
//       return {
//         go: (path, depth, req) => {
//           const $prev = [pairwise(depth), ...path.slice(1)].join("")
//           const $reqOpen = req ? "" : "if(" + path.join("") + "!==undefined){"
//           const $reqClose = req ? "" : "}"
//           const $path = path.length === 0 ? [pairwise(depth + 1)] : [pairwise(depth + 1), ...path.slice(1)]
//           const $check =
//             "" + `if(!${$prev}||typeof ${$prev}!=="object"||Array.isArray(${$prev})` + ")return false;"
//           const $keys = `let $k${depth}=Object.keys(${$prev});`
//           const $inner = pairwise(depth + 1, path.slice(1).join(""))
//           const $binding = `let ${$inner}=${$prev}[$k${depth}[i]];`
//           const $loop = [`for(let i=0;i<$k${depth}.length;i++){`, "}"]
//           return (
//             "" +
//             $reqOpen +
//             $check +
//             $keys +
//             $loop[0] +
//             $binding +
//             [n.additionalProperties].map(([, ctx]) => ctx.go($path, depth + 1, true))[0] +
//             $loop[1] +
//             $reqClose
//           )
//         },
//       }
//     }
//     case Schema.is.allOf(n):
//       return { go: (path, depth) => n.allOf.map(([, ctx]) => ctx.go(path, depth, true)).join("") }
//     default:
//       return fn.exhaustive(n)
//     ///
//     case Schema.is.anyOf(n):
//       return fn.throw("UNIMPLEMENETED")
//     case Schema.is.oneOf(n):
//       return fn.throw("UNIMPLEMENETED")
//   }
// }
