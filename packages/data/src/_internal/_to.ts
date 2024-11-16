import type { any } from "any-ts"

export declare namespace to {
  /** @internal */
  type parseInt<T> = T extends `${infer N extends number}` ? N : never

  export type { 
    /** ### {@link to_string `to.string`} */
    to_string as string,
  }
  export type to_string<T extends any.showable> = `${T}`

  /** ### {@link to.keys `to.keys`} */
  export type keys<T> = any.keysOf<T>

  /** ### {@link to.values `to.values`} */
  export type values<T, Distribute = never> 
    = [Distribute] extends [never]
    ? ([T] extends [any.array] ? T[number] : T[keyof T])
    : (T extends T ? values<T, never> : never)

  /** ### {@link to.vector `to.vector`} */
  export type vector<T> = never | 
    { [ix in globalThis.Exclude<keyof T, keyof any[]> as parseInt<ix>]: T[ix] }

  /** ### {@link to.entry `to.entry`} */
  export type entry<T = any.nonnullable> 
    = [keyof T] extends [any.keyof<T, infer K>]
    ? any.index extends K ? [key: K, value: T[K]]
    : K extends any.key ? [key: K, value: T[K]]
    : never : never
    ;
  /** ### {@link to.entries `to.entries`} */
  export type entries<T> 
    = never | any.array<[any.key] extends [keyof T] ? [key: keyof T, value: T[keyof T]] : to.entry<T>>
}
