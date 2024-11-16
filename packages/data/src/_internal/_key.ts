import type { newtype } from "any-ts"
import * as fn from "./_function.js"

/** @internal */
type matchUppercaseAlpha<T extends string> = key.toUpper<T> extends T ? key.toLower<T> extends T ? never : T : never
/** @internal */
type matchLowercaseAlpha<T extends string> = key.toLower<T> extends T ? key.toUpper<T> extends T ? never : T : never
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
const isProp = (u: unknown): u is string | number => ["number", "string"].includes(typeof u)

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

export declare namespace key {
  export {
    /**
     * ### {@link key_any `key.any`}
     * Greatest lower bound of the {@link key `key`} namespace
     */
    key_any as any
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
    interface upper extends Kind<key.any> { [-1]: key.toUpper<this[0]> }
    interface lower extends Kind<key.any> { [-1]: key.toLower<this[0]> }
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
   * ### {@link toUpper `key.toUpper`} 
   * 
   * If {@link toUpper `key.toUpper`} receives a:
   * 
   * - `string`: uppercase the string
   * - `number`: coerce the number to a string
   * - `symbol`: return the symbol
   */
  export function toUpper<K extends key.any>(k: K): key.toUpper<K>
  export function toUpper(k: key.any) { return isSymbol(k) ? k : `${k}`.toUpperCase() }
  export type toUpper<K extends key.any> = K extends symbol ? K : globalThis.Uppercase<`${K & (string | number)}`>

  /** 
   * ### {@link toLower `key.toLower`} 
   *
   * If {@link toLower `key.toLower`} receives a:
   * 
   * - `string`: lowercase the string
   * - `number`: coerce the number to a string
   * - `symbol`: return the symbol
   */
  export function toLower<K extends key.any>(k: K): key.toLower<K>
  export function toLower(k: key.any) { return isSymbol(k) ? k : `${k}`.toLowerCase() }
  export type toLower<K extends key.any> = K extends symbol ? K : globalThis.Lowercase<`${K & (string | number)}`>

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
        O extends "" ? `${toLower<L>}${toUpper<R>}` : `${O}${toLower<L>}${toUpper<R>}`, _
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
        O extends "" ? toLower<H> 
        : H extends `${number}` ? `${O}${H}` 
        : toUpper<H> extends H ? `${O}${_}${toLower<H>}` 
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
    //  export type Article = typeof Article
    //  export const Article = { a: "a", an: "an", the: "the" }
    //  export type Preposition = typeof Preposition
    //  export const Preposition = { as: "as", at: "at", by: "by", for: "for", in: "in", of: "of", off: "off", on: "on", per: "per", to: "to", up: "up", via: "via" }
    //  export type Conjunction = typeof Conjunction
    //  export const Conjunction = { and: "and", as: "as", but: "but", for: "for", if: "if", nor: "nor", or: "or", so: "so", yet: "yet" }
    /** TODO: implement special handling of minor words */
    //  export type MinorWord = typeof MinorWord
    //  export const MinorWord = { ...Article, ...Conjunction, ...Preposition }
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
  export function capitalize(k: key.any) { return isSymbol(k) ? k : `${k}`.substring(0, 1).toUpperCase().concat(`${k}`.slice(1)) }
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
  export function uncapitalize(k: key.any) { return isSymbol(k) ? k : `${k}`.substring(0, 1).toLowerCase().concat(`${k}`.slice(1)) }
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
}

export declare namespace keys {
  export { keys_any as any }
  export type keys_any<T extends readonly key.any[] = readonly key.any[]> = T
  export type and<T> = T & keys.any
  export type from<T extends readonly unknown[]> 
    = readonly [any, ...any[]] extends T 
    ? globalThis.Extract<readonly [key.any, ...keys.any], T> 
    : globalThis.Extract<T, keys.any>
    ;
}

export namespace keys {
  export const is = (u: unknown): u is keys.any => globalThis.Array.isArray(u) && u.every(key.is)
}
