import type * as array from "../array.js"
import type { key } from "../key.js"

export declare namespace entry {
  export {
    /**
     * ### {@link entry_any `entry.any`}
     * Greatest lower bound of the {@link entry `entry`} namespace
     */
    /**
     * ### {@link entry_any `entry.any`}
     * [Least upper bound](https://en.wikipedia.org/wiki/Upper_and_lower_bounds)
     * of the `entry` namespace
     */
    entry_any as any
  }
  export type entry_any<
    T extends
    | entry.of<unknown>
    = entry.of<unknown>
  > = T
  export type from<T, U extends T extends entry.any ? T : never = T extends entry.any ? T : never> = U
}

export namespace entry {
  /**
   * ### {@link of `entry.of`}
   */
  export function of<K extends key.any, V>(key: K, value: V): entry.of<V, K> { return [key, value] as const }
  export type of<V, K extends key.any = key.any> = readonly [key: K, value: V]

  /**
   * ### {@link key `entry.key`}
   */
  export function key<const T extends entry.any>([k]: T): entry.key<T> { return k }
  export type key<T extends entry.any> = T[0]

  /**
   * ### {@link value `entry.value`}
   */
  export function value<const T extends entry.any>([, v]: T): entry.value<T> { return v }
  export type value<T extends entry.any> = T[1]

  /**
   * ### {@link map `entry.map`}
   */
  export function map<const T extends entry.any, U>(xs: T, fn: (x: T[1], xs: T) => U): entry.of<U, T[0]>
  /// impl.
  export function map<const T extends entry.any, U>(xs: T, fn: (x: T[1], xs: T) => U) { return entry.of(xs[0], fn(xs[1], xs)) }

  /**
   * ### {@link mapKey `entry.mapKey`}
   */
  export function mapKey<const T extends entry.any, K extends key.any>(xs: T, fn: (k: T[0], xs: T) => K): entry.of<T[1], K>
  /// impl.
  export function mapKey<const T extends entry.any, K extends key.any>(xs: T, fn: (k: T[0], xs: T) => K) {
    return entry.of(fn(xs[0], xs), xs[1])
  }
}

export declare namespace entries {
  export {
    /**
     * ### {@link entries_any `entries.any`}
     * Greatest lower bound of the {@link entries `entries`} namespace
     */
    entries_any as any
  }
  export type entries_any<T extends { [x: number]: entry.any } = { [x: number]: entry.any }> = T
  export type of<T> = readonly entry.of<T, key.any>[]
  export type keys<T extends entries.any> = { -readonly [x in keyof T]: entry.from<T[x]>[0] }
  export type values<T extends entries.any> = { -readonly [x in keyof T]: entry.from<T[x]>[1] }
  export type key<T extends entries.any> = T[number][0]
  export type value<T extends entries.any> = T[number][1]
}

export namespace entries {
  /**
   * ### {@link of `entries.of`}
   *
   * Construct a composite structure made of zero or more {@link entry.any `entry`} component parts.
   */
  export function of<const T extends array.of<entry.any>>(...xs: T): { -readonly [ix in keyof T]: [k: T[ix][0], v: T[ix][1]] }
  export function of<const T extends { [x: number]: entry.any }>(xs: T): { -readonly [k in keyof T]: [k: T[number & k][0], v: T[number & k][1]] }
  /// impl.
  export function of(
    ...xs:
      | (entry.any[])
      | [{ [x: number]: entry.any }]
  ) {
    return globalThis.Array.isArray(xs[0]) ? xs : xs[0]
  }

  /**
   * ### {@link keys `entries.keys`}
   *
   * @example
   * const ex_01 = entries.keys([["a", 1], ["b", 2], [3, "c"]])
   * //       ^? const ex_01: ["a", "b", 3]
   * console.log(ex_01) // => ["a", "b", 3]
   */
  export function keys<const T extends entries.any>(xs: T): entries.keys<T>
  export function keys(xs: entries.any) {
    let out: key.any[] = []
    if (globalThis.Array.isArray(xs)) return xs.map(entry.key)
    else for (const k in xs) void out.push(xs[k][0]); return out
  }

  /**
   * ### {@link values `entries.values`}
   *
   * @example
   *  import { entries } from "@traversable/data"
   * 
   *  const ex_01 = entries.values([["a", 1], ["b", 2], [3, "c"]])
   *  //       ^? const ex_01: [1, 2, "c"]
   *  console.log(ex_01) // => [1, 2, "c"]
   */
  export function values<T extends entries.any>(xs: T): entries.values<T>
  export function values<T extends entries.any>(xs: T) {
    let out: unknown[] = []
    if (globalThis.Array.isArray(xs)) return xs.map(entry.value)
    else for (const k in xs) void out.push(xs[k][1]); return out
  }

  /**
   * ### {@link map `entries.map`}
   *
   * @example
   *  import { entries } from "@traversable/data"
   * 
   *  const ex_01 = entries.map([["2", 4], ["3", 9]], (v, ix, array) => [v + "", +ix % 2 === 0, array.length])
   *  //       ^? const ex_01: [[k: "2", v: [string, boolean, 2]], [k: "3", v: [string, boolean, 2]]]
   *  console.log(ex_01) // => [["2", ["4", true, 2]], ["3", ["9", false, 2]]]
   * 
   *  const ex_02 = entries.map({ "2e+1": [20, "twenty"], "3e+1": [30, "thirty"] }, (v, k) => [v.length, Number.parseFloat(k)])
   *  //       ^? const ex_02: { "2e+1": [k: 20, v: [number, number]], "3e+1": [k: 30, v: [number, number]] }
   *  console.log(ex_02) // => { "2e+1": [20, [6, 20], "3e+1": [30, [6, 30]] }
   */
  export function map<const T extends { [key: number]: entry.any }, const U>(
    entries: T,
    func: map.function<T, U>
  ): { -readonly [k in keyof T]: [k: map.key<T, k>, v: U] }

  /**
   * ### {@link map `entries.map`}
   *
   * @example
   *  import { entries, fn } from "@traversable/data"
   * 
   *  const ex_01 = fn.pipe([["2", 4], ["3", 9]], entries.map((v, ix, array) => [v + "", +ix % 2 === 0, array.length]))
   *  //       ^? const ex_01: [[k: "2", v: [string, boolean, 2]], [k: "3", v: [string, boolean, 2]]]
   *  console.log(ex_01) // => [["2", ["4", true, 2]], ["3", ["9", false, 2]]]
   * 
   *  const ex_02 = fn.pipe({ "2e+1": [20, "twenty"], "3e+1": [30, "thirty"] }, entries.map((v, k) => [v.length, Number.parseFloat(k)]))
   *  //       ^? const ex_02: { "2e+1": [k: 20, v: [number, number]], "3e+1": [k: 30, v: [number, number]] }
   *  console.log(ex_02) // => { "2e+1": [20, [6, 20], "3e+1": [30, [6, 30]] }
   */
  export function map<const T extends { [key: number]: entry.any }, const U>(
    func: map.function<T, U>
  ): (entries: T) => { -readonly [k in keyof T]: [k: map.key<T, k>, v: U] }

  /// impl.
  export function map(
    ...args: 
      | [func: map.function]
      | [entries: entries.any, func: map.function]
  ) {
    if (args.length === 1) 
      return (entries: entries.any) => map(entries, args[0])
    else {
      const [xs, f] = args
      if (globalThis.Array.isArray(xs)) {
        let out: [k: key.any, v: unknown][] = []
        for (let ix = 0 as never, len = xs.length; ix < len; ix++) {
          const [k, v] = xs[ix]
          out.push([k, f(v, ix, xs)])
        }
        return out
      }
      else {
        let out: { [ix: key.any]: [k: key.any, v: unknown] } = {}
        for (const ix in xs) {
          const [k, v] = xs[ix]
          out[ix] = ([k, f(v, ix as never, xs)])
        }
        return out
      }
    }
  }

  export declare namespace map {
    export type key<T extends entries.any, K extends keyof T = keyof T> = globalThis.Extract<T[K], { 0: key.any }>[0]
    export type value<T extends entries.any> = globalThis.Extract<T[keyof T], { 1: unknown }>[1]
    export type index<T extends entries.any, K extends keyof T = keyof T> = K extends number ? never : T[K] extends entry.any ? K : never
    export { func as function }
    export interface func<T extends entries.any = entries.any, U = unknown> { 
      (value: map.value<T>, index: map.index<T>, object: T): U 
    }
    export interface keyFunction<T extends entries.any = entries.any, U extends key.any = key.any> { 
      (key: map.key<T>, index: map.index<T>, object: T): U
    }
  }

  export function mapBoth<const T extends { [key: number]: entry.any }, const U, K extends key.any>(
    entries: T,
    keyFunc: map.keyFunction<T, K>,
    valueFunc: map.function<T, U>,
  ): { -readonly [x in keyof T]: [k: K, v: U] }

  export function mapBoth<const T extends { [key: number]: entry.any }, const U, K extends key.any>(
    keyFunc: map.keyFunction<T, K>,
    valueFunc: map.function<T, U>,
  ): (entries: T) => { -readonly [x in keyof T]: [k: K, v: U] }

  export function mapBoth(
    ...args: 
      | [keyFunc: map.keyFunction, valueFunc: map.function]
      | [entries: entries.any, keyFunc: map.keyFunction, func: map.function]
  ) {
    if (args.length === 2)
      return (entries: entries.any) => mapBoth(entries, ...args)
    else {
      const [xs, f, g] = args
      if (globalThis.Array.isArray(xs)) {
        let out: [k: key.any, v: unknown][] = []
        for (let ix = 0 as never, len = xs.length; ix < len; ix++) {
          const [k, v] = xs[ix]
          out.push([f(k, ix, xs), g(v, ix, xs)])
        }
        return out
      }
      else {
        let out: { [ix: key.any]: [k: key.any, v: unknown] } = {}
        for (const ix in xs) {
          const [k, v] = xs[ix]
          out[ix] = ([f(k, ix as never, xs), g(v, ix as never, xs)])
        }
        return out
      }
    }
  }

  export declare namespace mapBoth {

  }
}
