import { fn } from "@traversable/data"
import type { Functor } from "@traversable/registry"
import { Ltd, Ext as Schema } from "./model.js"

namespace Algebra {
  export const equal: Functor.RAlgebra<Schema.lambda, derive.Stream> = (n) => {
    switch (true) {
      case Ltd.is.null(n):
        return { go: (path) => `if (${path.join("")} != null) return false;\n` }
      case Ltd.is.boolean(n):
        return { go: (path) => `if (typeof ${path.join("")} !== "boolean") return false;\n` }
      case Ltd.is.integer(n):
        return { go: (path) => `if (typeof ${path.join("")} !== "number") return false;\n` }
      case Ltd.is.number(n):
        return { go: (path) => `if (typeof ${path.join("")} !== "number") return false;\n` }
      case Ltd.is.string(n):
        return { go: (path) => `if (typeof ${path.join("")}!=="string") return false;\n` }
      case Schema.is.object(n):
        return {
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
      case Schema.is.tuple(n):
        return {
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
      default:
        return fn.exhaustive(n)
      ///
      case Schema.is.array(n):
        return fn.throw("UNIMPLEMENTED")
      case Schema.is.record(n):
        return fn.throw("UNIMPLEMENTED")
      case Schema.is.allOf(n):
        return fn.throw("UNIMPLEMENETED")
      case Schema.is.anyOf(n):
        return fn.throw("UNIMPLEMENETED")
      case Schema.is.oneOf(n):
        return fn.throw("UNIMPLEMENETED")
    }
  }
}

derive.fold = fn.flow(Schema.fromSchema, fn.para(Schema.functor)(Algebra.equal))

export function derive(schema: Schema.Weak | Ltd, options?: derive.Options): string
export function derive(
  schema: Schema.Weak | Ltd,
  { functionName = derive.defaults.functionName }: derive.Options = derive.defaults,
) {
  return `function ${functionName}($){` + derive.fold(schema).go([]) + "}"
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

// import { Compare, Equal, fn, map } from "@traversable/data"
// import type { Ext } from "./model.js"
// const Array_isArray = globalThis.Array.isArray
// const Type = { a: { b: [{ c: 1, d: null, e: [[[{ f: 2, g: 3 }]]], f: 4 }, { g: 5 }] }, h: 6 }
// const schemaExample = {
//   type: "object",
//   properties: {
//     a: {
//       type: "object",
//       properties: {
//         b: {
//           type: "array",
//           items: [
//             {
//               type: "object",
//               properties: {
//                 c: { type: "number" },
//                 d: { type: "null" },
//                 e: {
//                   type: "array",
//                   items: [
//                     {
//                       type: "array",
//                       items: [
//                         {
//                           type: "array",
//                           items: [
//                             {
//                               type: "object",
//                               properties: {
//                                 f: { type: "number" },
//                                 g: { type: "number" },
//                               },
//                             },
//                           ],
//                         },
//                       ],
//                     },
//                   ],
//                 },
//                 f: { type: "number" },
//               },
//             },
//             { type: "object", properties: { g: { type: "number" } } },
//           ],
//         },
//         h: { type: "number" },
//       },
//     },
//   },
// }
// export interface Type {
//   a: {
//     b: [
//       {
//         c: number
//         d: [[[{ f: number; g: number }]]]
//         e: null
//         f: number
//       },
//       { g: number },
//     ]
//   }
//   h: number
// }
// const canHaz = (u: unknown): u is { [x: string]: unknown } => {
//   if (!u || typeof u !== "object" || Array.isArray(u)) return false
//   return true
// }
// const haz = <K extends string>(u: unknown, k: K): u is { [P in K]: unknown } =>
//   canHaz(u) && globalThis.Object.prototype.hasOwnProperty.call(u, k)
// const hazNorMore = (keyCount: number, u: object) => globalThis.Object.keys(u).length >= keyCount
// function isType(u: unknown): u is Type {
//   if (!canHaz(u) || !hazNorMore(2, u)) return false
//   if (!haz(u, "h") || typeof u.h !== "number") return false
//   if (!haz(u, "a")) return false
//   let u14 = u.a
//   if (!Array_isArray(u14) || 2 > u14.length) return false
//   let ua1 = u14[1]
//   // if (!has(ua1, "g")) return false;
//   if (typeof ua1.g !== "number") return false
//   let ua0 = u14[0]
//   if (!canHaz(ua0) || !hazNorMore(4, ua0)) return false
//   let ua0e = ua0.e
//   if (ua0e !== null) return false
//   let ua0c = ua0.c
//   if (typeof ua0c !== "number") return false
//   let ua0f = ua0.f
//   if (typeof ua0f !== "number") return false
//   let ua0d = ua0.d
//   if (!Array_isArray(ua0d) || 1 > ua0d.length) return false
//   let ua0d0 = ua0d[0]
//   if (!Array_isArray(ua0d0) || 1 > ua0d0.length) return false
//   let ua0d00 = ua0d0[0]
//   if (!Array_isArray(ua0d00) || 1 > ua0d00.length) return false
//   let ua0d000 = ua0d00[0]
//   if (!is.objN(ua0d000, 2)) return false
//   let ua0d000f = ua0d000.f
//   if (typeof ua0d000f !== "number") return false
//   let ua0d000g = ua0d000.g
//   if (typeof ua0d000g !== "number") return false
//   return true
// }
// interface Context {
//   varname: string
//   pointer: string
//   nextKey: string | null
//   minSize?: number
// }
// interface ContextWithNextIndex {
//   // varname: string
//   // pointer: string
//   // nextIndex: string | number
//   // nextKey: string | null
//   // minSize?: number
//   varname: string
//   children: unknown
//   type: "null" | "boolean" | "integer" | "number" | "string" | "array" | "tuple" | "object" | "record"
// }
// function isValid(name: string): boolean {
//   return true
// }
// export const eqBuilder = {
//   null: ({ varname, /* , pointer, nextIndex */ }) =>
//     `let ${varname}=${"pointer"}${
//       "nextIndex"
//       // typeof nextIndex === "number" ? `[${nextIndex}]` : isValid(nextIndex) ? `.${nextIndex}` : nextIndex
//     };if(${varname}!=null)return false;`,
//   string: ({ varname, /* pointer, nextIndex */ }) =>
//     `let ${varname}=${"pointer"}${
//       "nextIndex"
//       // typeof nextIndex === "number" ? `[${nextIndex}]` : isValid(nextIndex) ? `.${nextIndex}` : nextIndex
//     };if(typeof ${varname}!==string)return false;`,
//   number: ({ varname, /* pointer, nextIndex */ }) =>
//     `let ${varname}=${"pointer"}${
//       "nextIndex"
//       // typeof nextIndex === "number" ? `[${nextIndex}]` : isValid(nextIndex) ? `.${nextIndex}` : nextIndex
//     };if(typeof ${varname}!==number)return false;`,
//   boolean: ({ varname, /* pointer */ }) => `let ${varname}=${"pointer"};if(${varname}!==boolean)return false;`,
//   array: ({ varname, /* pointer, minSize */ }) =>
//     `let ${varname}=${"pointer"};if(!Array_isArray(${varname})${
//       "minSize"
//       // minSize ? ` || ${minSize} > ${varname}.length` : ""
//     })return false;`,
//   object: ({ varname, /* pointer, minSize, nextIndex */ }) =>
//     `let ${varname}=${"pointer"}${
//       "nextIndex"
//       // typeof nextIndex === "number" ? `[${nextIndex}]` : isValid(nextIndex) ? `.${nextIndex}` : nextIndex
//     };if(!${varname} || typeof ${varname} !== "object" || Array_isArray(${varname})${
//       "minSize"
//       // minSize ? ` || keyCount > Object_keys(${varname}).length` : ""
//     }) return false)`,
//   tuple: ({ varname, /* pointer, minSize, nextIndex, nextKey */ }) =>
//     `let ${varname}=${"pointer"};if(!Array_isArray(${varname})${
//       "minSize"
//       // minSize ? ` || ${minSize} > ${varname}.length` : ""
//     })return false;`,
//   integer: () => `UNIMPLEMENTED`,
//   record: () => `UNIMPLEMENTED`,
// } as const satisfies Record<Extract<Ext, { type: string }>["type"], (_: ContextWithNextIndex) => string>
// // const has: {
// //   <K extends string>(u: unknown, k: K, v: "string"): u is { [P in K]: string }
// //   <K extends string>(u: unknown, k: K, v: "number"): u is { [P in K]: number }
// //   <K extends string>(u: unknown, k: K, v: "boolean"): u is { [P in K]: boolean }
// // } = (u: unknown, k: string, v: "string" | "number" | "boolean"): u is never =>
// //   has_(u, k) && typeof u[k] === v
// /*
// const has = <K extends keyof any>(u: unknown, ...ks: K[]): u is { [P in K]: unknown } => {
//   let k: K | undefined
//   while((k = ks.pop()) !== undefined) {
//     if (!globalThis.Object.prototype.hasOwnProperty.call(u, k)) return false
//   }
//   return true
// }
// */
//
// // { a: { b: [{ c: 1, d: null, e: [[[{ f: 2, g: 3 }]]], f: 4 }, { g: 5 }] }, h: 6 })
// // const is = {
// //   obj(u): u is { [x: string]: unknown } {
// //     if (!u || typeof u !== "object" || Array.isArray(u)) return false
// //     return true
// //   },
// //   objN(u, keyCount: number): u is { [x: string]: unknown } {
// //     if (!u || typeof u !== "object" || Array.isArray(u) || keyCount > Object.keys(u).length) return false
// //     return true
// //   },
// //   arr(u): u is unknown[] {
// //     if (!u || !Array_isArray(u)) return false
// //     return true
// //   },
// //   arrN(u, length: number): u is unknown[] {
// //     if (!u || !Array_isArray(u) || length > u.length) return false
// //     return true
// //   },
// // } satisfies Record<string, (u: unknown, _?: any) => boolean>
// // const has = {
// //   own<K extends keyof any>(u: unknown, k: K): u is { [P in K]: unknown } {
// //     return globalThis.Object.prototype.hasOwnProperty.call(u, k)
// //   }
// // }
// // const hasOwn
// //   : <K extends keyof any>(u: unknown, k: K) => u is { [P in K]: unknown }
// //   = (u, k): u is never => globalThis.Object.prototype.hasOwnProperty.call(u, k)
// // const isArr: {
// //   <N extends number>(u: unknown, length: N): u is unknown[] & { length: N }
// //   (u: unknown): u is unknown[]
// // } = (u: unknown, length?: number): u is never => {
// //   if (length !== undefined) return Array_isArray(u) && u.length === length
// //   return Array_isArray(u)
// // }
