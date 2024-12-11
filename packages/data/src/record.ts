import type { newtype } from "any-ts"
import type { key } from "./_internal/_key.js"

import { identity } from "./_internal/_function.js"

/**
 * ## {@link nonfinite `record.nonfinite`}
 * 
 * {@link nonfinite `record.nonfinite`} constrains a type parameter to be a
 * record whose index is non-finite.
 * 
 * For example, the following examples all satisfy `record.nonfinite`:
 * 
 * ```typescript
 *  import type { record } from "@traversable/data"
 * 
 *  type NonFinite1 = globalThis.Record<string | symbol, unknown>
 *  type Ok1 = record.nonfinite<NonFinite1> 
 *  //   ^? type Ok1 = {}
 * 
 *  type NonFinite2 = { [K in string]?: unknown }
 *  type Ok2 = record.nonfinite<NonFinite2>
 * 
 *  interface NonFinite3 { [x: number]: unknown }
 *  type Ok3 = record.nonfinite<NonFinite3>
 * ```
 * 
 * Because these examples have known/knowable index signatures, they do not:
 * 
 * ```typescript
 *  import type { record } from "@traversable/data"
 * 
 *  type Finite1 = globalThis.Record<"a" | "b", unknown>
 *  type Never1 = nonfinite<HKT>
 *  //   ^? type Never1 = never
 *   
 *  type Finite2 = { [Symbol.iterator](): Iterator<unknown> }
 *  type Never2 = nonfinite<HKT>
 *  //   ^? type Never2 = never
 *   
 *  interface HKT<I = unknown, O = unknown> { [0]: I, [-1]: O }
 *  type Never3 = nonfinite<HKT>
 *  //   ^? type Never3 = never
 * ```
 * 
 * See also:
 * - {@link finite `record.finite`}
 * 
 * @example
 *  import type { record } from "@traversable/data"
 * 
 *  function nonfinite<T extends record.nonfinite<T>>(record: T) { return record }
 *  
 *  // 
 *  const ex_01 = nonfinite({ [Math.random() + ""]: Math.random() })   // ✅ No TypeError
 *  //    ^? const ex_01: { [x: string]: number }
 * 
 *  const ex_02 = nonfinite({ [Math.random()]: 1, [Symbol.for()]: 2 }) // ✅ No TypeError
 *  //    ^? const ex_02: { [x: number]: number, [x: symbol]: number }
 * 
 *  const ex_03 = nonfinite({ a: 1 })      // 🚫 [TypeError]: '{ a: number }` is not 
 *  //    ^? const ex_03: never            //    assignable to parameter of type 'never'
 */
const nonfinite
  : <const T extends nonfinite<T>>(record: T) => { -readonly [K in keyof T]: T[K] }
  = identity

type nonfinite<T, K extends keyof T = keyof T> 
  = globalThis.Record<string, any> extends T ? globalThis.Record<string, unknown>
  : number extends K ? globalThis.Record<number, unknown>
  : symbol extends K ? globalThis.Record<symbol, unknown>
  : never 
  ;

/**
 * ## {@link finite `record.finite`}
 * 
 * {@link finite `record.finite`} constrains a type parameter to be a "finite"
 * record (that is, a record whose index signature is comprised of finite
 * keys).
 * 
 * **Note:** For this to work, you need to apply {@link finite `record.finite`}
 * to the type parameter you're _currently_ declaring, see example below.
 * 
 * See also:
 * - {@link nonfinite `record.nonfinite`}
 * 
 * @example
 *  import { record, object } from "@traversable/data"
 * 
 *  const sym = Symbol.for("HEY")
 * 
 *  const ex_01 = record.finite({ [-1]: 2, "0": 1, [symbol]: 3 })
 *  //    ^? const ex_01: { [-1]: 2, "0": 1, [symbol]: 3 }
 * 
 *  const ex_02 = record.finite({ [Symbol()]: 1 })  // ✅ No TypeError
 *  //    ^? const ex_02: never
 * 
 *  const ex_03 = record.finite({ [sym]: 9 })
 *  //    ^? const ex_03: { [sym]: 9 }
 * 
 *  const ex_04 = record.finite(                    // [🚫 TypeError]: '{ [k: string]: number; }' is 
 *    //  ^? const ex_04: never                     // not assignable to parameter of type 'never'
 *    globalThis.Object.fromEntries(globalThis.Object.entries({ a: 1, b: 2 }))
 *  ) 
 * 
 *  const ex_05 = record.finite(                    // ✅ No TypeError
 *    //  ^? const ex_05: { a: 1, b: 2 }
 *    object.fromEntries(object.entries({ a: 1, b: 2 }))
 *  )
 */
const finite
  : <const T extends finite<T>>(record: T) => { -readonly [K in keyof T]: T[K] } 
  = identity

type finite<T> = [nonfinite<T>] extends [never] ? {} : never

/** 
 * ## {@link record `record`} 
 * 
 * Uses the `newtype` type constructor to implement "sticky" records (interfaces
 * that support arbitrary, finite index signatures).
 * 
 * This can be really nice given the right use case, to preserve a value's
 * semantics.
 * 
 * **Note:** the order of `key` and `value` are swapped
 */
export interface record<K extends key.any = string, V = unknown> extends newtype<globalThis.Record<K, V>> {}

export declare namespace record {
  export {
    finite,
    nonfinite,
  }
}
export declare namespace record {
  type and<T> = never | (record & T)
  type from<T> = never | (T extends record & infer V ? unknown extends V ? record : V : never)
  type of<T> = never | record<string, T>
}

export namespace record {
  void (record.finite = finite)
  void (record.nonfinite = nonfinite)
}
