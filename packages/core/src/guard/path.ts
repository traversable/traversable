import type { key, keys } from "@traversable/data"
import { symbol } from "@traversable/registry"
import type { Leaf, Pathspec } from "./types.js"

export type Handler<K = never, O extends string = string> = (k: [K] extends [never] ? keyof any : K, prev?: keyof any, next?: keyof any | Leaf) => O | false
export type Typeguard<K extends key.any, O extends string> = { predicate(k: unknown): k is K, handler: Handler<K, O> }
export type Predicate<O extends string> = { predicate(k: key.any): boolean, handler: Handler<never, O> }
export type Matcher<K extends key.any = never, O extends string = string> = Typeguard<K, O> | Predicate<O>
export type DotPrefixed = `.${string}` | (string & {})

/** 
 * ## {@link defineMatcher `path.defineMatcher`}
 * 
 * Convenience constructor that makes it slightly more ergonoic to 
 * define a {@link Matcher `path.Matcher`} pair. 
 * 
 * Useful when providing custom logic for folding/interpreting a path 
 * via {@link interpreter `path.interpreter`}.
 * 
 * See also:
 * - {@link docs `path.docs`}
 * - {@link interpreter `path.interpreter`}
 */
export function defineMatcher<K extends key.any, O extends string>(
  predicate: (k: key.any) => k is K, 
  handler: Handler<K, O>
): Matcher<K, O>
export function defineMatcher<O extends string>(
  predicate: (k: key.any) => boolean, 
  handler: Handler<never, O>
): Matcher<key.any, O>
export function defineMatcher(predicate: (k: key.any) => boolean, handler: Handler) 
  { return { predicate, handler } }

const isRecordSymbol = (k: key.any): k is symbol.record => k === symbol.record
const isArraySymbol = (k: key.any): k is symbol.record => k === symbol.array
const isOptionalSymbol = (k: key.any): k is symbol.record => k === symbol.optional
const isString = (k: key.any): k is string => typeof k === "string"
const isNumber = (k: key.any): k is number => typeof k === "number"

/**
 * ## {@link docs `path.docs`}
 * 
 * The pre-defined path DSL for documenting a node's path into a data
 * structure.
 *
 * **Note:** In each of the examples below, the path resolves to `1`:
 * 
 * |  **type**              |  **example**                   |  **syntax**     |
 * |------------------------|--------------------------------|-----------------|
 * |  finite record         |  `{ abc: { def: 1 } }`         |  `abc.def`      |
 * |  finite array (tuple)  |  `{ abc: [1, 2, 3] }`          |  `abc[0]`       |
 * |  non-finite array      |  `{ abc: 1[] }`                |  `abc[number]`  |
 * |  non-finite records    |  `{ abc: Record<string, 1> }`  |  `abc[string]`  |
 * |  optional property     |  `{ abc?: { def: 1 } }`        |  `abc?.def`     |
 * |  nullable property     |  `{ abc: null \| { def: 1 } }`  |  `abc?.def`     |
 * 
 */
export const docs = [
  defineMatcher(isNumber, (k) => `[${k}]`),
  defineMatcher(isString, (k, prev): DotPrefixed => `${prev == null ? "" : "."}${k}`),
  defineMatcher(isArraySymbol, () => `[number]` as const),
  defineMatcher(isRecordSymbol, () => `[string]` as const),
  defineMatcher(isOptionalSymbol, (_, prev) => prev === symbol.optional || prev === symbol.nullable ? false : "?"),
] as const satisfies Matcher[]

/** 
 * ## {@link interpreter `interpreter`}
 * 
 * Define an arbitrary interpreter for a {@link Pathspec `Pathspec`}.
 * 
 * This function allows you to build a small, path-derived 
 * **DSL** (domain-specific language).
 * 
 * The API could be improved to be easier to use, but it puts you in
 * full control:
 * 
 * All {@link interpreter `path.interpreter`}
 * does is loop over each element of a path, and for each, loop over the
 * list of specified predicates in search of a match. If a match is found,
 * the corresponding handler function is applied to the match.
 * 
 * **Note:** If no match is found, the path segment will not be kept. If you'd 
 * like to change that behavior, you can pass `() => true, k => k` for the 
 * final matcher.
 */
export function interpreter<T extends readonly Matcher[]>(matchers: T, ks: Pathspec): keys.any 
export function interpreter($: readonly Matcher[], _: Pathspec) {
  let ks = [..._]
  let out: (key.any | false)[] = []
  let k: Pathspec[number] | undefined
  let prev: Pathspec[number] | undefined
  while ((prev = k, k = ks.shift()) !== undefined) {
    if (typeof k === "object") break;
    const { handler } = $.find(({ predicate }) => predicate(k as keyof any)) ?? {}
    if (handler) 
      void (out.push(handler(k, prev as key.any, ks[0])))
    else continue // else out.push(k)
  }
  return out.filter((_) => _ !== false)
}
