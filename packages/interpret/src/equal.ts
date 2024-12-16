import { fn, Equal, Compare, map } from "@traversable/data"
import { Ext } from "./model.js"

const Array_isArray = globalThis.Array.isArray

const Type = { a: { b: [{ c: 1, d: null, e: [[[{ f: 2, g: 3 }]]], f: 4 }, { g: 5 }] }, h: 6 }

const schemaExample = {
  type: "object",
  properties: {
    a: {
      type: "object",
      properties: {
        b: {
          type: "array",
          items: [
            { 
              type: "object", 
              properties: {
                c: { type: "number" },
                d: { type: "null" },
                e: {
                  type: "array",
                  items: [
                    {
                      type: "array",
                      items: [
                        {
                          type: "array",
                          items: [
                            {
                              type: "object",
                              properties: {
                                f: { type: "number" },
                                g: { type: "number" },
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                f: { type: "number" }
              }
            },
            { type: "object", properties: { g: { type: "number" } } }
          ]
        },
        h: { type: "number" },
      }
    }
  }
}

export interface Type {
  a: {
    b: [ {
      c: number,
      d: [ [ [ { f: number, g: number, } ] ] ],
      e: null,
      f: number,
    },
    { g: number } ],
  },
  h: number
}


const canHaz = (u: unknown): u is { [x: string]: unknown } => {
  if (!u || typeof u !== "object" || Array.isArray(u)) return false
  return true
}
const haz = <K extends string>(u: unknown, k: K): u is { [P in K]: unknown } => 
  canHaz(u) && globalThis.Object.prototype.hasOwnProperty.call(u, k)

const hazNorMore = (keyCount: number, u: object) => globalThis.Object.keys(u).length >= keyCount

/** 
 * @example
 *  function eq(l: Type, r0: Type) { 
 *    if (!r0 || typeof r0 !== "object" || Array.isArray(r0) || Object.keys(r0).length !== 2) return false
 *    var r1=r0["a"]
 *    if (!r1 || typeof r1 !== "object" || Array.isArray(r1) || Object.keys(r1).length !== 1) return false
 *    var r2=r1["b"]
 *    if (!Array.isArray(r2) || r2.length !== 2) return false
 *    var r3=r2[0]
 *    if (!r3 || typeof r3 !== "object" || Array.isArray(r3) || Object.keys(r3).length !== 4) return false
 *    var r4=r3["c"]
 *    if(r4 !== 1) return false
 *    var r5=r3["d"]
 *    if(r5 !== null) return false
 *    var r6=r3["e"]
 *    if (!Array.isArray(r6) || r6.length !== 1) return false
 *    var r7=r6[0]
 *    if (!Array.isArray(r7) || r7.length !== 1) return false
 *    var r8=r7[0]
 *    if (!Array.isArray(r8) || r8.length !== 1) return false
 *    var r9=r8[0]
 *    if (!r9 || typeof r9 !== "object" || Array.isArray(r9) || Object.keys(r9).length !== 2) return false
 *    var r10=r9["f"]
 *    if(r10 !== 2) return false
 *    var r11=r9["g"]
 *    if(r11 !== 3) return false
 *    var r12=r3["f"] 
 *    if(r12 !== 4) return false
 *    var r13=r2[1]
 *    if (!r13 || typeof r13 !== "object" || Array.isArray(r13) || Object.keys(r13).length !== 1) return false
 *    var r14=r13["g"]
 *    if(r14 !== 5) return false 
 *    var r15=r0["h"]
 *    if(r15 !== 6) return false
 *    return true
 *  }
 */


function isType(u: unknown): u is Type {
  if (!canHaz(u) || !hazNorMore(2, u)) return false;
  if (!haz(u, "h") || typeof u.h !== "number") return false;

  if (!haz(u, "a")) return false;
  let ua = u.a;
  if (!Array_isArray(ua) || 2 > ua.length) return false;
  let ua1 = ua[1];
  // if (!has(ua1, "g")) return false;
  if (typeof ua1.g !== "number") return false;
  let ua0 = ua[0];
  if (!canHaz(ua0) || !hazNorMore(4, ua0)) return false;

  let ua0e = ua0.e;
  if (ua0e !== null) return false;
  let ua0c = ua0.c;
  if (typeof ua0c !== "number") return false;
  let ua0f = ua0.f;
  if (typeof ua0f !== "number") return false;
  let ua0d = ua0.d;
  if (!Array_isArray(ua0d) || 1 > ua0d.length) return false;
  let ua0d0 = ua0d[0];
  if (!Array_isArray(ua0d0) || 1 > ua0d0.length) return false;
  let ua0d00 = ua0d0[0];
  if (!Array_isArray(ua0d00) || 1 > ua0d00.length) return false;
  let ua0d000 = ua0d00[0];
  if (!is.objN(ua0d000, 2)) return false;
  let ua0d000f = ua0d000.f
  if (typeof ua0d000f !== "number") return false;
  let ua0d000g = ua0d000.g
  if (typeof ua0d000g !== "number") return false;
  return true
}

interface Context {
  varname: string
  pointer: string
  nextKey: string | null
  minSize?: number
}
interface ContextWithNextIndex {
  varname: string
  pointer: string
  nextIndex: string | number
  nextKey: string | null
  minSize?: number
}
function isValid(name: string): boolean { return true }

export const eqBuilder = {
  null: ({ varname, pointer, nextIndex }) => `let ${varname}=${pointer}${
    typeof nextIndex === "number" ? `[${nextIndex}]` : isValid(nextIndex) ? `.${nextIndex}` : nextIndex
  };if(${varname}!=null)return false;`,
  string: ({ varname, pointer, nextIndex }) => `let ${varname}=${pointer}${
    typeof nextIndex === "number" ? `[${nextIndex}]` : isValid(nextIndex) ? `.${nextIndex}` : nextIndex
  };if(typeof ${varname}!==string)return false;`,
  number: ({ varname, pointer, nextIndex }) => `let ${varname}=${pointer}${
    typeof nextIndex === "number" ? `[${nextIndex}]` : isValid(nextIndex) ? `.${nextIndex}` : nextIndex
  };if(typeof ${varname}!==number)return false;`,
  boolean: ({ varname, pointer }) => `let ${varname}=${pointer};if(${varname}!==boolean)return false;`,
  array: ({ varname, pointer, minSize }) => `let ${varname}=${pointer};if(!Array_isArray(${varname})${
    minSize ? ` || ${minSize} > ${varname}.length` : ""
  })return false;`,
  object: ({ varname, pointer, minSize, nextIndex }) => `let ${varname}=${pointer}${
    typeof nextIndex === "number" ? `[${nextIndex}]` : isValid(nextIndex) ? `.${nextIndex}` : nextIndex
  };if(!${varname} || typeof ${varname} !== "object" || Array_isArray(${varname})${
    minSize ? ` || keyCount > Object_keys(${varname}).length` : ""
  }) return false)`,
  tuple: ({ varname, pointer, minSize, nextIndex, nextKey }) => `let ${varname}=${pointer};if(!Array_isArray(${varname})${
    minSize ? ` || ${minSize} > ${varname}.length` : ""
  })return false;`,
  integer: () => `UNIMPLEMENTED`,
  record: () => `UNIMPLEMENTED`,
} as const satisfies Record<Extract<Ext, { type: string }>["type"], (_: ContextWithNextIndex) => string>





// const has: {
//   <K extends string>(u: unknown, k: K, v: "string"): u is { [P in K]: string }
//   <K extends string>(u: unknown, k: K, v: "number"): u is { [P in K]: number }
//   <K extends string>(u: unknown, k: K, v: "boolean"): u is { [P in K]: boolean }
// } = (u: unknown, k: string, v: "string" | "number" | "boolean"): u is never => 
//   has_(u, k) && typeof u[k] === v

/* 
const has = <K extends keyof any>(u: unknown, ...ks: K[]): u is { [P in K]: unknown } => {
  let k: K | undefined
  while((k = ks.pop()) !== undefined) {
    if (!globalThis.Object.prototype.hasOwnProperty.call(u, k)) return false
  }
  return true
}
*/
// const codegenValue = (doc, code, r) => {
//   let rr = r
//   const type = typeof doc
//   const isPrimitive = doc === null || type === 'boolean' || type === 'string' || type === 'number'
//   if (isPrimitive) {
//     if (doc === Infinity) {
//       code.push(`if(r${r} !== Infinity)return false;`)
//     } else if (doc === -Infinity) {
//       code.push(`if(r${r} !== -Infinity)return false;`)
//     } else {
//       code.push(`if(r${r} !== ${JSON.stringify(doc)})return false;`)
//     }
//     return rr
//   }
//   if (Array.isArray(doc)) {
//     code.push(`if(!Array.isArray(r${r}) || r${r}.length !== ${doc.length})return false;`)
//     for (let i = 0; i < doc.length; i++) {
//       rr++
//       code.push(`var r${rr}=r${r}[${i}];`)
//       rr = codegenValue(doc[i], code, rr)
//     }
//     return rr
//   }
//   if (type === 'object' && doc) {
//     const obj = doc
//     const keys = Object.keys(obj)
//     code.push(
//       `if(!r${r} || typeof r${r} !== "object" || Array.isArray(r${r}) || Object.keys(r${r}).length !== ${keys.length})return false;`,
//     )
//     for (const key of keys) {
//       rr++
//       code.push(`var r${rr}=r${r}[${JSON.stringify(key)}];`)
//       rr = codegenValue(obj[key], code, rr)
//     }
//   }
//   if (doc === undefined) {
//     code.push(`if(r${r} !== undefined)return false;`)
//     return rr
//   }
//   return rr
// }

/** 
 * @example
 *  const codegenValue = (doc, code, r) => {
 *    let rr = r
 *    const type = typeof doc
 *    const isPrimitive = doc === null || type === 'boolean' || type === 'string' || type === 'number'
 *    
 *    if (isPrimitive) {
 *      if (doc === Infinity) {
 *        code.push(`if(r${r} !== Infinity)return false;`)
 *      } else if (doc === -Infinity) {
 *        code.push(`if(r${r} !== -Infinity)return false;`)
 *      } else {
 *        code.push(`if(r${r} !== ${JSON.stringify(doc)})return false;`)
 *      }
 *      return rr
 *    }
 *    
 *    if (Array.isArray(doc)) {
 *      code.push(`if(!Array.isArray(r${r}) || r${r}.length !== ${doc.length})return false;`)
 *      for (let i = 0; i < doc.length; i++) {
 *        rr++
 *        code.push(`var r${rr}=r${r}[${i}];`)
 *        rr = codegenValue(doc[i], code, rr)
 *      }
 *      return rr
 *    }
 *    
 *    if (type === 'object' && doc) {
 *      const obj = doc
 *      const keys = Object.keys(obj)
 *      code.push(
 *        `if(!r${r} || typeof r${r} !== "object" || Array.isArray(r${r}) || Object.keys(r${r}).length !== ${keys.length})return false;`,
 *      )
 *      for (const key of keys) {
 *        rr++
 *        code.push(`var r${rr}=r${r}[${JSON.stringify(key)}];`)
 *        rr = codegenValue(obj[key], code, rr)
 *      }
 *    }
 *    
 *    if (doc === undefined) {
 *      code.push(`if(r${r} !== undefined)return false;`)
 *      return rr
 *    }
 *    
 *    return rr
 *  }
 *
 *  const $$deepEqual = (a) => {
 *    const code = []
 *    codegenValue(a, code, 0)
 *    
 *    const fn = ['(function(r0){', ...code, 'return true;', '})']
 *    
 *    // return fn.join('\n')
 *    return fn.join('')
 *  }
 * 
 * $$deepEqual({ a: { b: [{ c: 1, d: null, e: [[[{ f: 2, g: 3 }]]], f: 4 }, { g: 5 }] }, h: 6 })
 * '(function(r0){if(!r0 || typeof r0 !== "object" || Array.isArray(r0) || Object.keys(r0).length !== 2)return false;var r1=r0["a"];if(!r1 || typeof r1 !== "object" || Array.isArray(r1) || Object.keys(r1).length !== 1)return false;var r2=r1["b"];if(!Array.isArray(r2) || r2.length !== 2)return false;var r3=r2[0];if(!r3 || typeof r3 !== "object" || Array.isArray(r3) || Object.keys(r3).length !== 4)return false;var r4=r3["c"];if(r4 !== 1)return false;var r5=r3["d"];if(r5 !== null)return false;var r6=r3["e"];if(!Array.isArray(r6) || r6.length !== 1)return false;var r7=r6[0];if(!Array.isArray(r7) || r7.length !== 1)return false;var r8=r7[0];if(!Array.isArray(r8) || r8.length !== 1)return false;var r9=r8[0];if(!r9 || typeof r9 !== "object" || Array.isArray(r9) || Object.keys(r9).length !== 2)return false;var r10=r9["f"];if(r10 !== 2)return false;var r11=r9["g"];if(r11 !== 3)return false;var r12=r3["f"];if(r12 !== 4)return false;var r13=r2[1];if(!r13 || typeof r13 !== "object" || Array.isArray(r13) || Object.keys(r13).length !== 1)return false;var r14=r13["g"];if(r14 !== 5)return false;var r15=r0["h"];if(r15 !== 6)return false;return true;})'
 * (
 *   function(r0) { 
 *     if (!r0 || typeof r0 !== "object" || Array.isArray(r0) || Object.keys(r0).length !== 2) return false;
 *     var r1=r0["a"];
 *     if (!r1 || typeof r1 !== "object" || Array.isArray(r1) || Object.keys(r1).length !== 1) return false;
 *     var r2=r1["b"];
 *     if (!Array.isArray(r2) || r2.length !== 2) return false; var r3=r2[0]; 
 *     if (!r3 || typeof r3 !== "object" || Array.isArray(r3) || Object.keys(r3).length !== 4) return false;
 *     var r4=r3["c"];
 *     if(r4 !== 1) return false;
 *     var r5=r3["d"];
 *     if(r5 !== null) return false;
 *     var r6=r3["e"];
 *     if (!Array.isArray(r6) || r6.length !== 1) return false;
 *     var r7=r6[0];
 *     if (!Array.isArray(r7) || r7.length !== 1) return false;
 *     var r8=r7[0];
 *     if (!Array.isArray(r8) || r8.length !== 1) return false;
 *     var r9=r8[0];
 *     if (!r9 || typeof r9 !== "object" || Array.isArray(r9) || Object.keys(r9).length !== 2) return false;
 *     var r10=r9["f"];
 *     if(r10 !== 2) return false;
 *     var r11=r9["g"];
 *     if(r11 !== 3) return false;
 *     var r12=r3["f"]; 
 *     if(r12 !== 4) return false;
 *     var r13=r2[1];
 *     if (!r13 || typeof r13 !== "object" || Array.isArray(r13) || Object.keys(r13).length !== 1) return false;
 *     var r14=r13["g"];
 *     if(r14 !== 5) return false; 
 *     var r15=r0["h"];
 *     if(r15 !== 6) return false;
 *     return true;
 * })
 */
// { a: { b: [{ c: 1, d: null, e: [[[{ f: 2, g: 3 }]]], f: 4 }, { g: 5 }] }, h: 6 })
// const is = {
//   obj(u): u is { [x: string]: unknown } {
//     if (!u || typeof u !== "object" || Array.isArray(u)) return false
//     return true
//   },
//   objN(u, keyCount: number): u is { [x: string]: unknown } {
//     if (!u || typeof u !== "object" || Array.isArray(u) || keyCount > Object.keys(u).length) return false
//     return true
//   },
//   arr(u): u is unknown[] { 
//     if (!u || !Array_isArray(u)) return false
//     return true
//   },
//   arrN(u, length: number): u is unknown[] { 
//     if (!u || !Array_isArray(u) || length > u.length) return false
//     return true
//   },
// } satisfies Record<string, (u: unknown, _?: any) => boolean>
// const has = {
//   own<K extends keyof any>(u: unknown, k: K): u is { [P in K]: unknown } { 
//     return globalThis.Object.prototype.hasOwnProperty.call(u, k)
//   }
// }
// const hasOwn 
//   : <K extends keyof any>(u: unknown, k: K) => u is { [P in K]: unknown }
//   = (u, k): u is never => globalThis.Object.prototype.hasOwnProperty.call(u, k)
// const isArr: {
//   <N extends number>(u: unknown, length: N): u is unknown[] & { length: N }
//   (u: unknown): u is unknown[]
// } = (u: unknown, length?: number): u is never => { 
//   if (length !== undefined) return Array_isArray(u) && u.length === length
//   return Array_isArray(u)
// }
