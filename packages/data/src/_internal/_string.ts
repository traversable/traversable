import type { any, nonempty, some } from "any-ts"

import { type Escapables, escapeChar } from "./_char.js"

/**
 * ### {@link finite `string.finite`}
 * 
 * {@link finite `string.finite`} constrains a type parameter to be a _literal_ 
 * string (`string`, not `"hey"` or `"ho"`).
 * 
 * **Note:** For this to work, you need to apply {@link finite `string.finite`}
 * to the type parameter you're _currently_ declaring, see example below.
 * 
 * See also:
 * - {@link finite `string.finite`}
 * 
 * @example
 *  import type { string } from "@traversable/data"
 *  
 *  function onlyLiteralsAllowed<T extends string.finite<T>>(string: T) { return string + "!" }
 * 
 *  onlyLiteralsAllowed("hey")                    // ✅
 *  onlyLiteralsAllowed("ho")                     // ✅
 *  onlyLiteralsAllowed(new Date().toISOString()) // 🚫
 */
export type finite<T> = string extends T ? never : [T] extends [string] ? string : never

/**
 * ### {@link nonfinite `string.nonfinite`}
 * 
 * {@link nonfinite `string.nonfinite`} constrains a type parameter to be a _literal_ 
 * string (`string`, not `"hey"` or `"ho"`).
 * 
 * **Note:** For this to work, you need to apply {@link nonfinite `string.nonfinite`}
 * to the type parameter you're _currently_ declaring, see example below.
 * 
 * See also:
 * - {@link finite `string.finite`}
 * 
 * @example
 *  import type { string } from "@traversable/data"
 *  
 *  function onlyNonLiteralsAllowed<T extends string.nonfinite<T>>(string: T) { return string + "!" }
 * 
 *  onlyNonLiteralsAllowed(new Date().toISOString())    // ✅
 *  onlyNonLiteralsAllowed(encodeURIComponent("?q=hi")) // ✅
 *  onlyNonLiteralsAllowed("hi how are you?")           // 🚫
 */
export type nonfinite<T> = string extends T ? string : never

const PATTERN = {
  between: /(?<=\{).+?(?=\})/g,
  identifier: /^[a-z$_][a-z$_0-9]*$/i,
  doubleQuoted: /(?<=^").+?(?="$)/,
  singleQuoted: /(?<=^').+?(?='$)/,
  graveQuoted: /(?<=^`).+?(?=`$)/,
}

export type replace<
  T extends string,
  Changeset extends readonly [find: string, replace: string],
> = T extends `${infer Before}${Changeset[0]}${infer After}` ? `${Before}${Changeset[1]}${After}` : T

/**
 * ### {@link replace `string.replace`}
 * 
 * {@link replace `string.replace`} replaces text in a string. If possible, the change
 * is also applied at the type-level.
 *
 * See also: `String.prototype.replace`.
 */
export function replace<F extends string, R extends string>(
  find: F,
  replace: R,
): <T extends string>(text: T) => replace<T, [prev: F, next: R]>
export function replace(find: string, replace: string) {
  return (text: string) => text.replace(find, replace)
}

export type behead<T extends string> = string extends T
  ? [head: string, tail: string]
  : T extends nonempty.string<infer Head, infer Tail>
    ? [head: Head, tail: Tail]
    : [head: ``, tail: ``]

export function behead<T extends string>(text: T): behead<T>
export function behead(text: string) { return [text.charAt(0), text.substring(1)] }

/** ### {@link toString `string.toString`} */
export const toString
  : <T extends any.showable>(showable: T) => `${T}`
  = (showable) => `${showable}`

/** ### {@link isQuoted `string.isQuoted`} */
export const isQuoted 
  : (text: any.showable) => boolean
  = (text) => {
    const string = `${text}`
    return (
      PATTERN.singleQuoted.test(string) ||
      PATTERN.doubleQuoted.test(string) ||
      PATTERN.graveQuoted.test(string)
    )
  }

/** ### {@link isValidIdentifier `string.isValidIdentifier`} */
export const isValidIdentifier = (name: keyof any): boolean =>
  // TODO: bug (fixed?)
  typeof name === "symbol" ? true : isQuoted(name) || PATTERN.identifier.test(`${name}`)

/** ### {@link isValidPropertyName `string.isValidPropertyName`} */
export const isValidPropertyName
  : some.predicate<any.primitive>
  = (name) => typeof name === "symbol" ? true : PATTERN.identifier.test(`${name}`)

/**
 * ### {@link surroundedBy `string.surroundedBy`}
 */
export function surroundedBy<T extends string>(matchEnds: T): (string: string) => string is `${T}${string}${T}`
export function surroundedBy<L extends string, R extends string>(left: L, right: R): (string: string) => string is `${L}${string}${R}`
export function surroundedBy(
  ...args: 
    | [matchEnds: string] 
    | [left: string, right: string]
) {
  return (string: string) => {
    if(args.length === 1) return string.startsWith(args[0]) && string.endsWith(args[0])
    else {
      const [left, right] = args
      return string.startsWith(left) && string.endsWith(right)
    }
  }
}

/**
 * ### {@link surroundIfUnsurrounded `string.surroundIfUnsurrounded`}
 */
export function surroundIfUnsurrounded<T extends string>(surroundWith: T): (string: string) => `${T}${string}${T}`
export function surroundIfUnsurrounded<L extends string, R extends string>(left: L, right: R): (string: string) => `${L}${string}${R}`
export function surroundIfUnsurrounded(
  ...args: 
    | [surroundWith: string] 
    | [left: string, right: string]
) {
  return (string: string) => {
    const [left, right] = args.length === 1 ? [args[0], args[0]] : args
    return surroundedBy(left, right)(string) ? string : `${left}${string}${right}`
  }
}

/**
 * ### {@link escape `string.escape`}
 * 
 * Loops through a string, prefixing any char that is an element of the 
 * set of {@link Escapables `Escapables`} with the the escape sequence (`\\`)
 * 
 * **Note:** This implementation does not cover the entire UTF-16 charset.
 * This is intentional, but might change in the future. The complexity of
 * accounting for lone surrogates made the prospect a non-starter given
 * time constraints.
 * 
 * For more info, refer to the 
 * [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters).
 */
export function escape(text: string) {
  const todo = [...text]
  let out = ""
  while (todo.length > 0) 
    void (out += escapeChar(todo.shift()))
  return out
}
