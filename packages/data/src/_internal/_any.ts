import type { newtype } from "any-ts"

export declare namespace any {
  export { object_ as object }
  export type object_ = any_object
  export interface any_object<
    T extends 
    | { [x: string]: any }
    = { [x: string]: any }
  > extends newtype<T> {}
}

export declare namespace any {
  type primitive<
    T extends
    | undefined | null | boolean | symbol | number | bigint | string
    = undefined | null | boolean | symbol | number | bigint | string
  > = T

  interface enumerable<T = unknown> { [x: number]: T }
  type indexedBy<K extends keyof any, T extends { [x in K]: unknown } = { -readonly [x in K]: unknown }> = never | T
  type keysOf<T, K extends readonly (keyof T)[] = readonly (keyof T)[]> = K

  type keyOf<T, K extends keyof T = keyof T> = K
  type propOf<T, K extends (string | number) & keyof T = (string | number) & keyof T> = K


  /** 
   * ### {@link showable `any.showable`} 
   * 
   * > __showable__: a type that can appear inside a template string literal
   *   without any loss of precision
   * 
   * When used as a **nullary type** (where {@link T `T`} is _not_ specified):
   * 
   * - {@link showable `any.showable`} serves as the
   *   [least upper bound](https://en.wikipedia.org/wiki/Infimum_and_supremum)
   *   of the set whose members can be shown
   * 
   * When used as a **type-constructor** (where {@link T `T`} _is_ specified):
   * 
   * - {@link showable `any.showable`} works as a
   *   [proof](https://en.wikipedia.org/wiki/Existential_quantification), which
   *   can be useful when you're 
   *   [pattern matching](https://en.wikipedia.org/wiki/Pattern_matching)
   * 
   * @example
   *  const ex_01 = "bob" as const satisfies any.showable
   *  //    ^? const ex_01: "bob"
   *  const ex_02 = 1n as const satisfies any.showable
   *  //    ^? const ex_02: 1n
   *  const ex_03 = ["bob"] as const satisfies any.showable
   *  //    ^! 🚫  TypeError: 'readonly ["bob"]' does not satisfy the expected type 'any.showable'
   * 
   *  type Show<T> = T extends any.showable<infer U> ? `${U}` : never
   * 
   *  type Ex04 = Show<Date | 1_000_000>
   *  //    ^? type Ex04 = "1000000"
   */
  type showable<
    T extends
    | undefined | null | boolean | number | bigint | string
    = undefined | null | boolean | number | bigint | string
  > = T

  /** 
   * ### {@link json `any.json`} 
   * 
   * Even though `undefined` is not valid JSON, it's included
   * in this type because {@link globalThis.JSON.stringify `globalThis.JSON.stringify`}
   * can return `undefined`.
   * 
   * @example
   *  console.log(JSON.stringify(undefined)) // => undefined
   */
  type json = 
    // `undefined` is included here because `JSON.stringify` returns `undefined`
    // when passed `undefined`
    | undefined 
    | null 
    | json.scalar 
    | json.object 
    | readonly json[]

  namespace json {
    export type scalar<T extends boolean | number | string = boolean | number | string> = T
    export { json_object as object }
    export interface json_object<T extends json = json> { [x: string]: T }
  }
}
