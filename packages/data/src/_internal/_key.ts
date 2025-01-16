import type { newtype } from "any-ts"

import { HKT, Kind, PATTERN } from "@traversable/registry"
import * as fn from "./_function.js"
import { prop } from "./_prop.js"
import { escape as escapeString, isQuoted } from "./_string.js"
import { map } from "@traversable/data"

/** @internal */
type matchUppercaseAlpha<T extends string> = key.uppercase<T> extends T ? key.lowercase<T> extends T ? never : T : never
/** @internal */
type matchLowercaseAlpha<T extends string> = key.lowercase<T> extends T ? key.uppercase<T> extends T ? never : T : never
/** @internal */
type takeUppercaseChars<T extends string, Out extends string = never>
  = [T] extends [never] ? [match: never, nonmatch: never]
  : [T] extends [`${infer Head}${infer Tail}`]
    ? [Head] extends [matchUppercaseAlpha<Head>]
      ? takeUppercaseChars<Tail, `${[Out] extends [never] ? "" : Out}${Head}`>
      : [match: Out, nonmatch: T]
    : [match: Out, nonmatch: never]
  ;
/** @internal */
type takeLowercaseChars<T extends string, Out extends string = never>
  = [T] extends [never] ? [match: never, never_case: never]
  : [T] extends [`${infer Head}${infer Tail}`]
    ? [Head] extends [matchLowercaseAlpha<Head>]
      ? takeLowercaseChars<Tail, `${[Out] extends [never] ? "" : Out}${Head}`>
      : [match: Out, nonmatch: T]
    : [match: Out, nonmatch: never]
  ;


/** @internal */
const isSymbol = (u: unknown): u is symbol => typeof u === "symbol"
/** @internal */
const isProp = (u: unknown): u is string | number => typeof u === "string" || typeof u === "number"
/** @internal */
const SIGNED_INFINITY = globalThis.Number.NEGATIVE_INFINITY
/** @internal */
const isSignedZero = (n: number): n is -0 => n === 0 && 1 / n === SIGNED_INFINITY
/** @internal */
const Object_keys
  : <T>(x: T) => (keyof T)[]
  = globalThis.Object.keys
const Object_hasOwn = 
 <K extends keyof any>(u: unknown, k: K): u is { [P in K]: unknown } => 
  !!(u) && typeof u === "object" && globalThis.Object.hasOwn(u, k)

/** @internal */
type Any = 
  | null 
  | undefined 
  | boolean 
  | number 
  | string 
  | readonly Any[] 
  | { [x: string]: Any }

/** @internal */
const isArray
  : (u: Any) => u is readonly Any[]
  = globalThis.Array.isArray
/** @internal */
const isObject
  : (u: Any) => u is Record<string, Any>
  = (u): u is Record<string, Any> => !!u && typeof u === "object"

namespace char {
  export const Alphabet = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", 
    "j", "k", "l", "m", "n", "o", "p", "q", "r", 
    "s", "t", "u", "v", "w", "x", "y", "z",
  ] as const
  export const isUppercase = (c: string) => c === c.toUpperCase()
  export const isWhitespace = (c: string) => [" ", "\n", "\t"].includes(c)
  export const isAlpha = (c: string) => (Alphabet as readonly string[]).includes(c.toLowerCase())
  export const isDigit = (c: string) => ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(c)
  export const isAlphaNumeric = (c: string) => isAlpha(c) || isDigit(c)
  export const isNonAlphaNumeric = (c: string) => !isAlpha(c) && !isDigit(c)
}

/** 
 * ## {@link nonfinite `key.nonfinite`} 
 * 
 * Constrains a type parameter to be "non-finite" (as opposed to "finite").
 * 
 * Prior art: 
 * - Originally inspired by a 
 *   [Stack Overflow question](https://stackoverflow.com/questions/54261967/what-is-representable-used-for-in-haskell)
 *   about the purpose of indexed / representable functors
 * 
 * See also:
 * - {@link finite `key.finite`}
 * 
 * @example
 *  import { key } from "@traversable/data"
 * 
 *  const RNDM = () => globalThis.Math.random()
 * 
 *  //         This is the trick to get it working ↓↓↓ make sure you're constraining `T` in `T`'s extends clause
 *  const myNonFiniteKey = <T extends key.nonfinite<T>>(key: T): T => key
 * 
 *  const ok_01 = myNonFiniteKey(RNDOM())
 *  //    ^? const ok_01: number                                                               // ✅ No TypeError
 *  const ok_02 = myNonFiniteKey(RNDM() > 0.5 ? RNDM() : RNDM() + "")                          // ✅ No TypeError
 *  //    ^? const ok_02: string | number                                                      // ✅ No TypeError
 * 
 *  // **Note:** the `myNonFiniteKey` constructor is equivalent to the `key.nonfinite` function
 *  const ok_03 = key.nonfinite(RNDM() > 0.5 ? Symbol() : RNDM())                              // ✅ No TypeError
 *  //    ^? const ok_03: number | symbol                                                      // ✅ No TypeError
 *
 *  // **Note:** works with raw types too (not just values)
 *  type Ok_04 = key.nonfinite<globalThis.PropertyKey>                                         // ✅ No TypeError
 *  //    ^? type Ok_04 = string | number | symbol
 *  
 *  // **Note:** `key.nonfinite` is satisfied so long as any member of the union is nonfinite
 *  const ok_05 = key.nonfinite(RNDM() > 0.5 ? RNDM() : "a")                                   // ✅ No TypeError
 *  //    ^? const ok_05: number | "a"
 *  
 *  const err_06 = key.nonfinite("a")                         // 🚫 [TypeError]: 'string' is not assignable
 *  //    ^? const err_06: never                              //                 to parameter of type 'never'
 *  const err_07 = key.nonfinite(RNDM() > 0.5 ? "a" : 1)      // 🚫 [TypeError]: 'string | number' is not assignable
 *  //    ^? const err_07: never                              //                 to parameter of type 'never'
 *  type Never_01 = key.nonfinite<symbol>
 *  //    ^? type Never_01 = never
 */
const nonfinite
  : <T extends nonfinite<T>>(key: T) => T
  = fn.identity

// would happily accept a PR that simplifies this type? 🤷
// but I'll take it for now -- IMO, it's pretty damn cool that it works at all
type nonfinite<T> = never | (
  [T] extends [infer U] 
  ? [globalThis.PropertyKey] extends [T] ? U
  : [string] extends [T] ? U 
  : [number] extends [T] ? U
  : [symbol] extends [T] ? U
  : [string | number] extends [T] ? U
  : [string | symbol] extends [T] ? U
  : [symbol | number] extends [T] ? U
  : never
  : never
) & globalThis.PropertyKey

/** 
 * ## {@link finite `key.finite`} 
 * 
 * See also:
 * - {@link nonfinite `key.nonfinite`}
 * 
 * @example
 *  import { key } from "@traversable/data"
 * 
 *  const RNDM = () => globalThis.Math.random()
 * 
 *  //   This is the trick to get it working ↓↓↓ make sure you're constraining `T` in `T`'s extends clause
 *  const myFiniteKey = <T extends key.finite<T>>(key: T): T => key
 * 
 *  const ok_01 = myFiniteKey(1)
 *  //    ^? const ok_01: 1                               // ✅ No TypeError
 * 
 *  // **Note:** the `myFiniteKey` constructor is equivalent to the `key.finite` function
 *  const ok_02 = myFiniteKey(RNDM() > 0.5 ? "a" : "b")   // ✅ No TypeError
 *  //    ^? const ok_02: "a" | "b"
 * 
 *  const err_03 = key.finite("a")                        // 🚫 [TypeError]: 'string' is not assignable
 *  //    ^? const err_03: never                          //                 to parameter of type 'never'
 *  const err_04 = key.finite(RNDM() > 0.5 ? "a" : 1)     // 🚫 [TypeError]: 'string | number' is not assignable
 *  //    ^? const err_04: never                          //                 to parameter of type 'never'
 * 
 *  // **Note:** `key.finite` complains if **any** member of the union is nonfinite
 *  const err_05 = key.finite(RNDM() > 0.5 ? 1 : RNDOM() > 0.5 ? 2 : Symbol()) // 🚫 [TypeError]: '1 | 2 | symbol' is not
 *  //    ^? const err_05: number | "a"                                        // assignable to parameter of type 'never'
 */
const finite
  : <const T extends finite<T>>(key: T) => T
  = fn.identity

type finite<T> 
  = [nonfinite<T>] extends [never] 
  ? [T] extends [infer U extends keyof any] ? U 
  : never
  : never

export declare namespace key{
  export {
    finite,
    /**
     * ### {@link key_any `key.any`}
     * Greatest lower bound of the {@link key `key`} namespace
     */
    key_any as any,
    nonfinite,
  }
  export type key_any<T extends keyof never = keyof never> = T

  /**
   * ### {@link of `key.of`}
   *
   * Like `keyof`, but as a type constructor. Comes with different tradeoffs:
   *
   * #### Features:
   * - Optimized for cache hits to prevent unnecessary type-level
   * instantiations, which makes it more performant than inline `keyof` when the target
   * has many (~50+) keys.
   * - Supports pattern matching when used in inference-position (inside an `extends` clause).
   *
   * @example
   * type Noo = keyof globalThis.Date
   * //   ^? type Noo = keyof Date 🥺
   *
   * type Ohh = key.of<globalThis.Date>
   * //   ^? type Ohh = typeof Symbol.toPrimitive | "toDateString" | ... 41 more ... 🥹
   */
  export type of<T, K extends keyof T = keyof T> = K extends K ? K : never

  /**
   * ### {@link from `key.from`}
   *
   * Extract from {@link T `T`} those members that are assignable to `string | number | symbol`
   *
   * @example
   * declare const b: unique symbol
   * type A3 = key.from<"a" | [1, 2, 3] | typeof b | number>
   * //   ^? type A3 = "a" | typeof b | number
   *
   * type Nvr = key.from<globalThis.Date>
   * //   ^? type Nvr = never
   */
  export type from<T, K extends key.any = T extends key.any ? T : never> = K

  export type fromNumber<T extends number, U extends `${T}` = `${T}`> = U extends `${infer V extends -0}` ? "-0" : U
  export type fromString<T extends string> = T extends prop.Poisonable ? `["${T}"]` : T

  export { asKey as as }
  export type asKey<T, K = T extends symbol ? T : T extends -0 ? "-0" : `${T & (string | number)}`> = K
 
  /**
   * ### {@link and `key.and`}
   *
   * Intersects {@link T `T`} with {@link key.any `key.any`}
   *
   * @example
   * declare const b: unique symbol
   * type And = key.and<"a" | [1, 2, 3] | typeof b | number>
   * //   ^? type A3 = ("a" | typeof b | number) & (string | number | symbol)
   */
  export type and<T, K extends key.any & T = key.any & T> = K

  export type nonnumber<T extends symbol | string = symbol | string> = T
  export type nonsymbol<T extends number | string = number | string> = T
  export type nonstring<T extends symbol | number = symbol | number> = T
  export type nonKeyOf<T, K extends key.any> = never | [K] extends [keyof T] ? never : key.any

  /** 
   * A higher-kinded type (HKT) is just a type that you can pass around as a reference, without applying it (yet).
   * 
   * Usually you don't need HKTs. But sometimes, it's _really convenient_.
   * 
   * With this implementation, we initialize a "slot" -- a property name that's
   * [out of band](https://en.wikipedia.org/wiki/Out-of-band_data) -- to store the computation we'll do later.
   * 
   * That's what all the `-1` business is about: it's nothing magical. We could have used a symbol instead.
   */
  export interface Kind<In = unknown, Out = unknown> extends newtype<{ [0]: In, [-1]: Out }> {}
  export type apply<K extends Kind, Arg extends K[0]> = (K & { 0: Arg })[-1]

  export interface Pair { [0]: key.any, [1]: string }

  export namespace xf {
    interface snake extends Kind<key.any> { [-1]: key.snake<this[0]> }
    interface camel extends Kind<key.any> { [-1]: key.camel<this[0]> }
    interface kebab extends Kind<key.any> { [-1]: key.kebab<this[0]> }
    interface pascal extends Kind<key.any> { [-1]: key.pascal<this[0]> }
    interface upper extends Kind<key.any> { [-1]: key.uppercase<this[0]> }
    interface lower extends Kind<key.any> { [-1]: key.lowercase<this[0]> }
    interface prefix extends Kind<Pair> { [-1]: key.prefix<this[0][0], this[0][1]> }
    interface unprefix extends Kind<Pair> { [-1]: key.unprefix<this[0][0], this[0][1]> }
    interface postfix extends Kind<Pair> { [-1]: key.postfix<this[0][0], this[0][1]> }
    interface unpostfix extends Kind<Pair> { [-1]: key.unpostfix<this[0][0], this[0][1]> }
  }
}

export namespace key {
  /** 
   * ### {@link is `key.is`} 
   * 
   * Narrow a value from `unknown` to `string | number | symbol`
   */
  export const is = (u: unknown): u is key.any => isSymbol(u) || isProp(u)

  /** 
   * ### {@link fromNumber `key.fromNumber`} 
   * 
   * Converts a number into string-key form.
   * 
   * **Note:** {@link fromNumber `key.fromNumber`}'s coersion preserves
   * property-access semantics, which means `-0` becomes `"-0"`, not `"0"`.
   */
  export function fromNumber<N extends number>(x: N): key.as<N>
  export function fromNumber<N extends number>(x: N) { return isSignedZero(x) ? `"-0"` : x + "" }

  /** 
   * ### {@link fromString `key.fromString`} 
   * 
   * Converts a string into string-key form. Useful when you're generating
   * code, used internally by {@link key.as `key.as`}.
   * 
   * Handles escaping and surrounding the property name with brackets if 
   * the property would otherwise be vulnerable to prototype poisoning.
   */
  export function fromString<S extends string>(s: S): key.fromString<S>
  export function fromString<S extends string>(s: S): string {
    const escaped = escapeString(s)
    const quoted = isQuoted(s) ? escaped : `"${escaped}"`
    return prop.isPoisonable(s) || !PATTERN.identifier.test(s) ? `[${quoted}]` : quoted
  }

  export const fromSymbol 
    : <T extends symbol>(sym: T) => T
    = fn.identity

  /** 
   * ### {@link as `key.as`} 
   * 
   * Converts its argument into string-key form.
   * 
   * @example
   *  import { key } from "@traversable/data"
   * 
   *  const lossy = String(-0)
   *  //     ^?    const lossy: string  -_-;;
   *  console.log(lossy)    // =>  "0"  -_-;;
   * 
   *  const lossless = key.as(-0)
   *  //     ^?   const lossless: "-0"  (^.^
   *  console.log(lossless) // => "-0"  (^.^
   */
  export function as<K extends key.any>(key: K): key.as<K>
  export function as<K extends key.any>(key: K, toString: (k: K) => string): key.as<K>
  export function as<K extends key.any>(key: K, toString?: (k: K) => string): key.as<K>
  export function as(k: key.any, toString: (k: key.any) => string = globalThis.String) {
    switch (true) {
      case typeof k === "string": return key.fromString(k)
      case typeof k === "number": return key.fromNumber(k)
      case typeof k === "symbol": return key.fromSymbol(k)
      default: return toString(k)
    }
  }

  /** 
   * ### {@link toUpper `key.toUpper`} 
   * 
   * If {@link toUpper `key.toUpper`} receives a:
   * 
   * - `string`: uppercase the string
   * - `number`: coerce the number to a string
   * - `symbol`: return the symbol
   */
  export function uppercase<K extends key.any>(k: K): key.uppercase<K>
  export function uppercase(k: key.any) { return isSymbol(k) ? k : `${k}`.toUpperCase() }
  export type uppercase<K extends key.any> = K extends symbol ? K : globalThis.Uppercase<`${K & (string | number)}`>

  /** 
   * ### {@link toLower `key.toLower`} 
   *
   * If {@link toLower `key.toLower`} receives a:
   * 
   * - `string`: lowercase the string
   * - `number`: coerce the number to a string
   * - `symbol`: return the symbol
   */
  export function lowercase<K extends key.any>(k: K): key.lowercase<K>
  export function lowercase(k: key.any) { return isSymbol(k) ? k : `${k}`.toLowerCase() }
  export type lowercase<K extends key.any> = K extends symbol ? K : globalThis.Lowercase<`${K & (string | number)}`>

  /** 
   * ### {@link prefix `key.prefix`} 
   *
   * If {@link prefix `key.prefix`} receives a:
   * 
   * - `string`: prepends the {@link before `before`} argument to the string
   * - `number`: coerce the number to a string and prepends {@link before `before`}
   * - `symbol`: return the symbol
   */
  export function prefix<P extends string | number>(before: P): <K extends key.any>(k: K) => key.prefix<K, P>
  export function prefix(before: string | number) { return (k: key.any) => isSymbol(k) ? k : `${before}${k}` }
  export type prefix<K extends key.any, Add extends string | number> = K extends symbol ? K : `${Add}${K & (string | number)}`

  /** 
   * ### {@link postfix `key.postfix`} 
   *
   * If {@link postfix `key.postfix`} receives a:
   * 
   * - `string`: appends the {@link after `after`} argument to the string
   * - `number`: coerce the number to a string and appends {@link after `after`}
   * - `symbol`: return the symbol
   */
  export function postfix<P extends string | number>(after: P): <K extends key.any>(k: K) => key.postfix<K, P>
  export function postfix(after: string | number) { return (k: key.any) => isSymbol(k) ? k : `${k}${after}` }
  export type postfix<K extends key.any, Add extends string | number> = K extends symbol ? K : `${K & (string | number)}${Add}`

  /** 
   * ### {@link camel `key.camel`}
   *
   * If {@link camel `key.camel`} receives a:
   * 
   * - `string`: converts the string to [camel case](https://en.wikipedia.org/wiki/Camel_case),
   *    e.g. `camelCase` instead of `PascalCase`, `snake_case` or `kebab-case`
   * - `number`: coerce the number to a string
   * - `symbol`: return the symbol
   */
  export function camel<K extends key.any>(k: K): key.camel<K>
  export function camel<K extends key.any, Delimiter extends string>(k: K, delimiter: Delimiter): key.camel<K, Delimiter>
  export function camel(k: key.any, delimiter = "_") {
    if (isSymbol(k)) return k
    else {
      const loop = fn.loop<[todo: string, out: string], string>(([todo, out], loop) => {
        if (todo === "") return out
        else {
          const head = todo.charAt(0)
          const tail = todo.substring(1)
          return loop(
            [
              char.isNonAlphaNumeric(head) ? capitalize(tail) : tail,
              ( out === "" ) ? head.toLowerCase()
              : char.isNonAlphaNumeric(head) ? out
              : char.isDigit(head) ? `${out}${head}`
              : head === delimiter ? `${out}${delimiter}${head.toUpperCase()}`
              : `${out}${head}`
            ]
          )
        }
      })

      return loop([globalThis.String(k), ""])
    }
  }

  export type camel<
    Key extends key.any, 
    Delimiter extends string = "_", 
    Out extends string = ""
  > = Key extends string | number ? camel.loop<`${Key}`, Out, Delimiter> : Key
    
  /** @internal */
  export declare namespace camel {
    type loop<S extends string, O extends string, _ extends string> 
      = S extends `${infer L}${_}${infer R}${infer T}`
      ? camel.loop<
        T, 
        O extends "" ? `${lowercase<L>}${uppercase<R>}` : `${O}${lowercase<L>}${uppercase<R>}`, _
      > : `${O}${S}`
  }

  /** 
   * ### {@link snake `key.snake`} 
   *
   * If {@link snake `key.snake`} receives a:
   * 
   * - `string`: converts the string to [snake case](https://en.wikipedia.org/wiki/Snake_case),
   *    e.g. `snake_case` instead of `kebab-case`, `camelCase` or `PascalCase`
   * - `number`: coerce the number to a string
   * - `symbol`: return the symbol
   */
  export function snake<K extends key.any>(k: K): key.snake<K>
  export function snake<K extends key.any, _ extends string>(k: K, delimiter: _): key.snake<K, _>
  export function snake(k: key.any, delimiter = "_") { 
    if (isSymbol(k)) return k
    else {
      const loop = fn.loop<[todo: string, out: string], string>(([todo, out], loop) => {
        if (todo === "") return out
        else {
          const head = todo.charAt(0)
          const tail = todo.substring(1)
          return loop(
            [
              char.isNonAlphaNumeric(head) ? capitalize(tail) : tail,
              ( out === "" ) ? head.toLowerCase()
              : char.isNonAlphaNumeric(head) ? out
              : char.isDigit(head) ? `${out}${head}`
              : char.isUppercase(head) ? `${out}${delimiter}${head.toLowerCase()}`
              : `${out}${head}`
            ]
          )
        }
      })

      return loop([globalThis.String(k), ""])
    }
  }

  export type snake<
    Key extends key.any, 
    Delimiter extends string = "_", 
    Out extends string = ""
  > = Key extends string | number ? snake.loop<`${Key}`, Out, Delimiter> : Key
    
  /** @internal */
  export declare namespace snake {
    type loop<S extends string, O extends string, _ extends string> 
      = S extends `${infer H}${infer T}`
      ? H extends " " ? loop<key.capitalize<T>, O, _>
      : snake.loop<
        T,
        O extends "" ? lowercase<H> 
        : H extends `${number}` ? `${O}${H}` 
        : uppercase<H> extends H ? `${O}${_}${lowercase<H>}` 
        : `${O}${H}`,
        _ 
      > : `${O}${S & (string | number)}`
  }
  
  /** 
   * ### {@link pascal `key.pascal`}
   *
   * If {@link pascal `key.pascal`} receives a:
   * 
   * - `string`: converts the string to [Pascal case](https://en.wiktionary.org/wiki/Pascal_case), 
   *    e.g. `PascalCase` instead of `camelCase`, `snake_case` or `kebab-case`
   * - `number`: coerce the number to a string
   * - `symbol`: return the symbol
   */
  export function pascal<K extends key.any>(k: K): key.pascal<K>
  export function pascal<K extends key.any, _ extends string>(k: K, delimiter: _): key.pascal<K, _>
  export function pascal(k: key.any, delimiter = "_") { return key.capitalize(key.camel(k, delimiter)) }
  export type pascal<Key extends key.any, Delimiter extends string = "_"> = key.capitalize<key.camel<Key, Delimiter>>

  export function startsWith<P extends string>(start: P): <K extends key.any>(key: K) => key is K & `${P}${string}`
  export function startsWith<P extends string>(start: P) { 
    return <K extends key.any>(key: K): key is never => 
      typeof key === "string" || typeof key === "number" ? `${key}`.startsWith(start) : false
  }

  export function endsWith<P extends string>(end: P): <K extends key.any>(key: K) => key is K & `${string}${P}`
  export function endsWith<P extends string>(end: P) { 
    return <K extends key.any>(key: K): key is never => 
      typeof key === "string" || typeof key === "number" ? `${key}`.endsWith(end) : false
  }

  export function doesNotStartWith<P extends string>(start: P): <K extends key.any>(key: K) => key is Exclude<K, `${P}${string}`>
  export function doesNotStartWith<P extends string>(start: P) { 
    return <K extends key.any>(key: K): key is never => !startsWith(start)(key)
  }

  export function doesNotEndWith<P extends string>(end: P): <K extends key.any>(key: K) => key is Exclude<K, `${string}${P}`>
  export function doesNotEndWith<P extends string>(end: P) { 
    return <K extends key.any>(key: K): key is never => !endsWith(end)(key)
  }

  /** 
   * ### {@link kebab `key.kebab`}
   *
   * If {@link kebab `key.kebab`} receives a:
   * 
   * - `string`: converts the string to [kebab-case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case),
   *    e.g. `kebab-case` instead of `snake_case`, `camelCase` or `PascalCase`
   * - `number`: coerce the number to a string
   * - `symbol`: return the symbol
   */
  export function kebab<K extends key.any>(key: K): key.kebab<K>
  export function kebab(k: key.any) { return snake(k, "-") }
  export type kebab<K extends key.any> = snake<K, "-">
   
  /** 
   * ### {@link titlecase `key.titlecase`}
   *
   * Converts a string to title-case. 
   * 
   * Algorithm is applied at the type-level and to the value, so the two always stay in sync.
   * 
   * - Optionally accepts a {@link delimiter `delimiter`} argument, which is the character
   *   {@link titlecase `key.titlecase`} should treat as the boundary between words 
   *   (defaults to {@link titlecase.defaults.delimiter `defaults.delimiter`} if not provided)
   * 
   * - Optionally accepts a {@link separator `separator`} argument, which is the character
   *   {@link titlecase `key.titlecase`} should insert in place of {@link delimiter `delimiter`}
   *   (defaults to {@link titlecase.defaults.separator `defaults.separator`} if not provided)
   * 
   * @example
   *  import { key } from "@traversable/data"
   * 
   *   const ex_01 = titlecase("ten animals i slam in a net")
   *   //    ^? const ex_01: "Ten Animals I Slam In A Net"
   *   console.log(ex_01) // => const ex_01: "Ten Animals I Slam In A Net"
   *
   *   const ex_02 = titlecase("custom separator example", { separator: "/" })
   *   //    ^?    const ex_02: const ex_02: "Custom/Separator/Example"
   *   console.log(ex_02) // => const ex_02: "Custom/Separator/Example"
   *
   *   const ex_03 = titlecase("drop.it.like.its.hot", { delimiter: ".", separator: "~" })
   *   //    ^?                 const ex_03: "Drop~It~Like~Its~Hot"
   *   console.log(ex_03) // => const ex_03: "Drop~It~Like~Its~Hot"
   */
  export function titlecase<
    K extends key.any, 
    Delimit extends string = string,
    Separate extends string = string
  >(
    key: K,
    options?: titlecase.Options<Delimit, Separate>
  ): titlecase<
    K, 
    [string] extends [Delimit] ? typeof titlecase.defaults.delimiter : Delimit, 
    [string] extends [Separate] ? typeof titlecase.defaults.separator : Separate
  >
  /// impl.
  export function titlecase(
    k: key.any, 
    { 
      delimiter: del = titlecase.defaults.delimiter, 
      separator: sep = titlecase.defaults.separator,
    }: titlecase.Options = titlecase.defaults
  ) {
    if (isSymbol(k)) return k
    else {
      const loop = fn.loop<[todo: string, out: string], string>(([todo, out], loop) => {
        if (todo === "") return out
        else {
          const head = todo.charAt(0)
          const tail = todo.substring(1)
          return loop(
            [
              head === del ? capitalize(tail) : tail,
              ( out === "" ) ? capitalize(head)
              : head === del ? `${out}${sep}`
              : `${out}${head}`
            ]
          )
        }
      })

      return loop([globalThis.String(k), ""])
    }
  }
  export type titlecase<K extends key.any, Delimiter extends string = " ", Separator extends string = " ">
    = K extends string | number ? titlecase.loop<`${K}`, "", Delimiter, Separator> : K

  export declare namespace titlecase {
    interface Options<Del extends string = string, Sep extends string = string> {
      delimiter?: Del
      separator?: Sep
    }
  type configFromOptions<T extends titlecase.Options> = titlecase.Options<{} & T["delimiter"], {} & T["separator"]>

    type loop<S extends string, O extends string, Del extends string, Sep extends string>
      = S extends `${infer L}${Del}${infer T}`
      ? titlecase.loop<
        T,
        O extends "" ? capitalize<L> : `${O}${Sep}${capitalize<L>}`,
        Del,
        Sep
      >
      : `${O extends "" ? "" : `${O}${Sep}`}${capitalize<S>}`
      ;

    
  }

  export namespace titlecase {
    export const defaults = {
      delimiter: " ",
      separator: " ",
    } as const satisfies titlecase.Options
  }

  /** 
   * ### {@link capitalize `key.capitalize`}
   *
   * If {@link capitalize `key.capitalize`} receives a:
   * 
   * - `string`: capitalizes the string (uppercases _only_ the first letter, leaving the rest alone)
   * - `number`: coerce the number to a string
   * - `symbol`: return the symbol
   */
  export function capitalize<K extends key.any>(k: K): key.capitalize<K>
  export function capitalize(k: key.any) { return isSymbol(k) ? k : `${k}`.charAt(0).toUpperCase().concat(`${k}`.substring(1)) }
  export type capitalize<K extends key.any> = never | K extends symbol ? K : globalThis.Capitalize<`${K & (string | number)}`>

  /**
   * ### {@link uncapitalize `key.uncapitalize`} 
   *
   * If {@link uncapitalize `key.uncapitalize`} receives a:
   * 
   * - `string`: uncapitalizes the string (lowercases _only_ the first letter, leaving the rest alone)
   * - `number`: coerce the number to a string
   * - `symbol`: return the symbol
   */
  export function uncapitalize<K extends key.any>(k: K): key.uncapitalize<K>
  export function uncapitalize(k: key.any) { return isSymbol(k) ? k : `${k}`.charAt(0).toLowerCase().concat(`${k}`.substring(1)) }
  export type uncapitalize<K extends key.any> = never | K extends symbol ? K : globalThis.Uncapitalize<`${K & (string | number)}`>

  /** 
   * ### {@link unprefix `key.unprefix`} 
   *
   * If {@link unprefix `key.unprefix`} receives a:
   * 
   * - `string`: removes the {@link rm `rm`} argument from the beginning of the string if it exists,
   *    otherwise leaves the string alone
   * - `number`: coerce the number to a string and removes the {@link rm `rm`} argument
   *    from the beginnin of the string, if it exists
   * - `symbol`: return the symbol
   */
  export const unprefix
    : <Rm extends string | number>(rm: Rm) => <K extends key.any>(k: K) => key.unprefix<K, Rm>
    = (rm) => (k) => (isProp(k) ? `${k}`.startsWith(`${rm}`) ? `${k}`.substring(`${rm}`.length) : k : k) as never

  export type unprefix<K extends key.any, Remove extends string | number> 
    = K extends `${Remove}${infer T}` ? T : K

  /** 
   * ### {@link unpostfix `key.unpostfix`} 
   *
   * If {@link unpostfix `key.unpostfix`} receives a:
   * 
   * - `string`: removes the {@link rm `rm`} argument from the end of the string if it exists,
   *    otherwise leaves the string alone
   * - `number`: coerce the number to a string and removes the {@link rm `rm`} argument
   *    from the end of the string, if it exists
   * - `symbol`: return the symbol
   */
  export const unpostfix
    : <Rm extends string | number>(rm: Rm) => <K extends key.any>(k: K) => key.unpostfix<K, Rm>
    = (rm) => (k) => (isProp(k) ? `${k}`.endsWith(`${rm}`) ? `${k}`.slice(0, -`${rm}`.length) : k : k) as never

  export type unpostfix<K extends key.any, Remove extends string | number> 
    = K extends `${infer T}${Remove}` ? T : K

  export function of<const T extends { [x: number]: unknown }>(object: T): <K extends key.any>(key: K) => key is K & keyof T
  export function of(object: { [x: number]: unknown }) {
    return (key: key.any): key is never => globalThis.Object.prototype.hasOwnProperty.call(object, key)
  }

  /** 
   * ## {@link asAccessor `key.asAccessor`} 
   * 
   * Normalizes a key as a stringified property-accessor. 
   * 
   * Useful when you're generating code and need to
   * access support arbitrary property access, and don't have control
   * over the input (usually because it's user-provided).
   * 
   * **Note:** Since the use case for {@link asAccessor `key.asAccessor`} 
   * is generating code, it does not support symbols, and will throw an
   * exception at runtime if given one.
   * 
   * @example
   *  import { key } from "@traversable/data"
   * 
   *  key.asAccessor("hey")        // => .hey
   *  key.asAccessor("oh hi mark") // => ["oh hi mark"]
   *  key.asAccessor("oh_hi_mark") // => .oh_hi_mark
   *  key.asAccessor(9000.1)       // => ["9000.1"]
   *  key.asAccessor(-0)           // => ["-0"]
   *  key.asAccessor(Symbol())     // => TypeError(...)
   */
  export function asAccessor<K extends key.any>(k: K): string {
    const name: string = key.as(k) as string
    return typeof k === "symbol" ? asAccessor.handleSymbol(k)
      : name.startsWith("[") || isQuoted(name) ? name : `.${name}`
  }
  void (asAccessor.handleSymbol = (k: symbol) => {
    throw globalThis.Error("'key.normalize' does not support symbols, got: " + globalThis.String(key))
  })
}

void (key.finite = finite)
void (key.nonfinite = nonfinite)

export declare namespace keys {
  export { keys_any as any, keys_map as map }
  export type keys_any<T extends readonly key.any[] = readonly key.any[]> = T
  export type and<T> = T & keys.any
  export type from<T extends readonly unknown[]> 
    = readonly [any, ...any[]] extends T 
    ? globalThis.Extract<readonly [key.any, ...keys.any], T> 
    : globalThis.Extract<T, keys.any>
    ;
}


function keys_map<F extends HKT.Function<HKT<keyof any, keyof any>>>(F: F): 
  <const T extends Record<F[0], unknown>>(object: T) => { [K in keyof T as Kind<F, K>]: T[K] }
function keys_map<F extends HKT<keyof any, keyof any>>(F: F): 
  <const T extends Record<F[0], unknown>>(object: T) => { [K in keyof T as Kind<F, K>]: T[K] }
function keys_map<KI extends keyof any, KO extends keyof any>(f: (k: KI) => KO): 
  <const T extends Record<KI, unknown>>(object: T) => { [K in keyof T as KO]: T[K] }
function keys_map(f: (k: keyof any) => keyof any) {
  return (x: Record<keyof any, unknown>) => {
    let out: Record<keyof any, unknown> = {}
    for (const k in x) out[f(k)] = x[k]
    return out
  }
}
///
namespace keys_map {
  export function deep(f: (s: string) => string): (x: Any) => Any {
    return (x) => {
      switch (true) {
        default: return fn.exhaustive(x)
        case x === null:
        case x === undefined:
        case typeof x === "boolean":
        case typeof x === "number":
        case typeof x === "string": return x
        case isArray(x): return map(x, keys_map.deep(f))
        case isObject(x): {
          let out: Record<keyof any, Any> = {}
          for (const k in x) out[f(k)] = keys_map.deep(f)(x[k])
          return out
        }
      }
    }
  }
}

export namespace keys {
  keys.map = keys_map
  export const is = (u: unknown): u is keys.any => globalThis.Array.isArray(u) && u.every(key.is)

  /** 
   * ## {@link keys.intersect `keys.intersect`}
   * 
   * Given a running array of objects called {@link objects `objects`},
   * {@link keys.intersect `keys.intersect`} reduces them to an array of 
   * _only_ the keys that are present in _all_ objects.
   */
  export function intersect<const T extends {}[]>(...objects: [...T]): (keyof T[number])[] {
    const [x, ...xs] = objects
    let out = Object_keys(x)
    let $: T[number] | undefined = x
    while (($ = xs.shift()) !== undefined)
      out = out.filter((k) => Object_hasOwn($, k))
    return out
  }

  export function union<T extends {}>(...objects: [...T[]]): (T extends T ? (keyof T) : never)[]
  export function union<T extends {}>(...objects: [...T[]]) {
    let out = new globalThis.Set()
    for (const x of objects) for (const k of Object_keys(x)) void out.add(k)
    return [...out]
  }
  
}
