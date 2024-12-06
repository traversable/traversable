export { 
  type finite,
  type nonfinite,
  behead,
  escape,
  isQuoted,
  isValidIdentifier,
  replace,
  surroundedBy,
  surroundIfUnsurrounded,
  toString,
  unescape,
} from "./_internal/_string.js"
export { Equal_string as equals } from "./_internal/_equal.js"

import type { string as String, any, newtype, nonempty } from "any-ts"
import type { Concattable as concattable, Foldable as foldable } from "./exports.js"
import { key } from "./key.js"

/** @internal */
const CR = 0x0d
/** @internal */
const LF = 0x0a

/** @internal */
const not
  : <T>(predicate: (...args: T[]) => boolean) => (...args: T[]) => boolean
  = (predicate) => (...args) => !predicate(...args)

interface string_ascii extends newtype<string> {}
interface string_base64 extends newtype<string> {}
interface string_cuid extends newtype<string> {}
interface string_cuid2 extends newtype<string> {}
interface string_date extends newtype<string> {}
interface string_datetime extends newtype<string> {}
interface string_duration extends newtype<string> {}
interface string_email extends newtype<string> {}
interface string_emoji extends newtype<string> {}
interface string_nanoid extends newtype<string> {}
interface string_ip extends newtype<string> {}
interface string_regex extends newtype<string> {}
interface string_search extends newtype<string> {}
interface string_time extends newtype<string> {}
interface string_ulid extends newtype<string> {}
interface string_url extends newtype<string> {}
interface string_utf8 extends newtype<string> {}
interface string_utf16 extends newtype<string> {}
interface string_uuid extends newtype<string> {}

export type {
  /** ## {@link string_ascii `string.ascii`} */
  string_ascii as ascii,
  /** ## {@link string_base64 `string.base64`} */
  string_base64 as base64,
  /** ## {@link string_cuid `string.cuid`} */
  string_cuid as cuid,
  /** ## {@link string_cuid2 `string.cuid2`} */
  string_cuid2 as cuid2,
  /** ## {@link string_date `string.date`} */
  string_date as date,
  /** ## {@link string_datetime `string.datetime`} */
  string_datetime as datetime,
  /** ## {@link string_duration `string.duration`} */
  string_duration as duration,
  /** ## {@link string_email `string.email`} */
  string_email as email,
  /** ## {@link string_emoji `string.emoji`} */
  string_emoji as emoji,
  /** ## {@link string_ip `string.ip`} */
  string_ip as ip,
  /** ## {@link string_nanoid `string.nanoid`} */
  string_nanoid as nanoid,
  /** ## {@link string_regex `string.regex`} */
  string_regex as regex,
  /** ## {@link string_search `string.search`} */
  string_search as search,
  /** ## {@link string_time `string.time`} */
  string_time as time,
  /** ## {@link string_ulid `string.ulid`} */
  string_ulid as ulid,
  /** ## {@link string_url `string.url`} */
  string_url as url,
  /** ## {@link string_utf8 `string.utf8`} */
  string_utf8 as utf8,
  /** ## {@link string_utf16 `string.utf16`} */
  string_utf16 as utf16,
  /** ## {@link string_uuid `string.uuid`} */
  string_uuid as uuid,
}

/**
 * ## {@link from `string.from`}
 *
 * Extract from {@link T `T`} those members that are assignable to {@link string.any `string`}
 *
 * @example
 * type From = string.from<"1" | "hey" | [1, 2, 3] | 10>
 * //   ^? type From = "1" | "hey"
 */
export type from<T, S extends T extends string ? T : never = T extends string ? T : never> = S

/**
 * ## {@link and `string.and`}
 *
 * Intersects {@link T `T`} with {@link string.any `string`}
 *
 * @example
* type And = string.and<"1" | "hey" | [1, 2, 3] | 10>
* //   ^? type And = "1" | "hey"
*/
export type and<T, S extends string & T = string & T> = S

/** ## {@link split `string.split`} */
export function split<D extends any.showable>(delimiter: D): <T extends string>(text: T) => split<D, T>
export function split<D extends any.showable>(delimiter: D) { 
  return <T extends string>(text: T) => text.split(`${delimiter}`)
}

export type split<delimiter extends any.showable, text extends string> 
  = split.loop<"", [], text, delimiter>

export declare namespace split {
  type loop<Next extends string, Out extends any.array, Text extends string, Delimiter extends any.showable>
    = [Text] extends [nonempty.string<infer head, infer tail>] 
    ? [head] extends [Delimiter] ? split.loop<"", [...Out, Next], tail, Delimiter>
    : split.loop<`${Next}${head}`, Out, tail, Delimiter>
    : [...Out, Next]
    ;
}

export {
  /** ## {@link isString `string.is`} */
  isString as is,
}
const isString = (u: unknown): u is string => typeof u === "string"

/** ## {@link startsWithNumeric `string.startsWithNumeric`} */
export const startsWithNumeric
  : <T extends any.array<number | `${number}`>>(...matches: T) => (sn: string | number) => sn is `${T[number]}${number}`
  = startsWith as never

/** ## {@link startsWith `string.startsWith`} */
export type startsWith<Start extends any.showable, Rest extends string = string> = never | `${Start}${Rest}`
export function startsWith<Match extends any.showable>(match: Match): (s: string) => s is startsWith<Match>
export function startsWith<Matches extends any.showables>(...matches: Matches): (s: string) => s is startsWith<`${Matches[number]}`>
export function startsWith<Matches extends any.showables>(...matches: Matches) {
  return (s: string): s is never => matches.some(m => s.startsWith(`${m}`))
}

/** ## {@link doesNotStartWith `string.doesNotStartWith`} */
export type doesNotStartWith<Prefix extends any.showable, Text extends string> = never | globalThis.Exclude<Text, `${Prefix}${string}`>
export const doesNotStartWith: {
  <Prefix extends any.showable>(prefix: Prefix): <Text extends string>(s: Text) => s is doesNotStartWith<Prefix, Text>
  <Prefixes extends any.showables>(...prefixes: Prefixes): <Text extends string>(s: Text) => s is doesNotStartWith<Prefixes[number], Text>
} = (...prefixes: any.showables) => (s: string): s is never => !startsWith(...prefixes)(s)

/** ## {@link endsWith `string.endsWith`} */
export type endsWith<End extends any.showable, Rest extends string = string> = never | `${Rest}${End}`
export function endsWith<Match extends any.showable>(match: Match): (s: string) => s is endsWith<Match>
export function endsWith<Matches extends any.showables>(...m: Matches): (s: string) => s is endsWith<Matches[number]>
export function endsWith<Matches extends any.showables>(...matches: Matches) {
  return (s: string): s is never => matches.some(m => s.endsWith(`${m}`))
}

/** ## {@link doesNotEndWith `string.doesNotEndWith`} */
export type doesNotEndWith<End extends any.showable, Text extends string> = never | globalThis.Exclude<Text, `${string}${End}`>
export const doesNotEndWith: {
  <End extends any.showable>(end: End): <Text extends string>(s: Text) => s is doesNotEndWith<End, Text>
  <Ends extends any.showables>(...ends: Ends): <Text extends string>(s: Text) => s is doesNotEndWith<Ends[number], Text>
} = (...ends: any.showables) => (s: string): s is never => ends.every((end) => !s.endsWith(`${end}`))

/** ## {@link includes `string.includes`} */
export type includes<Query extends any.showable> = `${string}${Query}${string}`
export function includes<Query extends any.showable>(query: Query): (s: string) => s is includes<Query>
export function includes<Queries extends any.showables>(...q: Queries): (s: string) => s is includes<Queries[number]>
export function includes<queries extends any.showables>(...queries: queries) {
  return (s: string): s is never => queries.some(q => s.includes(`${q}`))
}

/** ## {@link doesNotInclude `string.doesNotInclude`} */
export type doesNotInclude<Query extends any.showable, Text extends string> = never | globalThis.Exclude<Text, `${string}${Query}${string}`>
export function doesNotInclude<Query extends any.showable>(query: Query): <Text extends string>(s: Text) => s is doesNotInclude<Query, Text>
export function doesNotInclude<Queries extends any.showables>(...q: Queries): <Text extends string>(s: Text) => s is doesNotInclude<Queries[number], Text>
export function doesNotInclude<Queries extends any.showables>(...queries: Queries) {
  return (s: string): s is never => queries.every(q => !s.includes(`${q}`))
}

/** 
 * ## {@link unprefix `string.unprefix`} 
 * 
 * @example
 *  import { string } from "@traversable/data"
 * 
 *  const ex_01 = "BinaryTree" as const
 * 
 *  const ex_02 = string.unprefix("Binary")(ex_01)
 *  //       ^? const ex_02: "Tree"
 *  console.log(ex_02) // => "Tree"
 *  
 *  const ex_03 = string.unprefix("blah")("no match? no change")
 *  //       ^? const ex_03: "no match? no change"
 *  console.log(ex_03) // => "no match? no change"
 */
export function unprefix<Prefix extends string>(prefix: Prefix): <Text extends string>(text: Text) => unprefix<Prefix, Text>
export function unprefix<Prefix extends any.showable>(prefix: Prefix): <Text extends string>(text: Text) => unprefix<Prefix, Text>
export function unprefix<prefix extends any.showable>(prefix: prefix) {
  const query = `${prefix}`
  return <Text extends string>(text: Text) => text.startsWith(query) ? text.substring(query.length) : text
}
export type unprefix<
  Prefix extends any.showable, 
  Text extends string, 
  Distributive = never
> = [Distributive] extends [never] 
  ? ([Text] extends [`${Prefix}${infer Rest}`] ? Rest : Text)
  : (Text extends Text ? unprefix<Prefix, Text, never> : never)
  ;

/** 
 * ## {@link unpostfix `string.unpostfix`} 
 * 
 * @example
 *  import { string } from "@traversable/data"
 * 
 *  const ex_01 = "© traversable, 2024" as const
 * 
 *  const ex_02 = string.unpostfix(", 2024")(ex_01)
 *  //       ^? const ex_02: "© traversable"
 *  console.log(ex_02) // => "© traversable"
 * 
 *  const ex_03 = string.unprefix("blah")("no match? no change")
 *  //       ^? const ex_03: "no match? no change"
 *  console.log(ex_03) // => "no match? no change"
 */
export function unpostfix<End extends string>(end: End): <Text extends string>(s: Text) => unpostfix<End, Text>
export function unpostfix<End extends any.showable>(end: End): <Text extends string>(s: Text) => unpostfix<End, Text>
export function unpostfix<End extends any.showable>(end: End) {
  const query = `${end}`
  return <Text extends string>(s: Text) => s.endsWith(query) ? s.substring(0, s.length - query.length) : s
}
export type unpostfix<
  End extends any.showable, 
  Text extends string, 
  Distributive = never
> = [Distributive] extends [never] 
  ? [Text] extends [`${infer Lead}${End}`] ? Lead : Text
  : Text extends Text ? unpostfix<End, Text, never> : never
  ;

/** ## {@link isSurroundedBy `string.isSurroundedBy`} */
export const isSurroundedBy 
  : <T extends any.showable>(match: T) => (s: string) => s is `${T}${string}${T}`
  = (match) => (s): s is never => startsWith(match)(s) && endsWith(match)(s)

/** ## {@link contains `string.contains`} */
export const contains 
  : <T extends any.showable>(match: T) => (s: string) => s is `${string}${T}${string}`
  = (match) => (s): s is never => s.includes(`${match}`)

/** ## {@link unsurround `string.unsurround`} */
export const unsurround 
  : <Rm extends any.showable>(rm: Rm) => <Text extends string>(s: Text) => string
  = (rm) => (s) => s.startsWith(`${rm}`)
    ? s.endsWith(`${rm}`) ? s.slice(`${rm}`.length, -`${rm}`.length)
    : s.slice(`${rm}`.length)
    : s.endsWith(`${rm}`) ? s.slice(0, -`${rm}`.length)
    : s
    ;

/** ## {@link surround `string.surround`} */
export const surround 
  : <Ends extends any.showable>(ends: Ends) => <Btwn extends string>(s: Btwn) => string
  = (ends) => (s) => s.startsWith(`${ends}`)
    ? s.endsWith(`${ends}`) ? s
    : `${s}${ends}`
    : s.endsWith(`${ends}`) ? `${ends}${s}`
    : `${ends}${s}${ends}`
    ;

/** 
 * ## {@link isLineBreak `string.isLineBreak`} 
 * 
 * @example 
 *  import { string } from "@traversable/data" 
 * 
 *  console.log(string.isLineBreak(0x0d)) // => true
 *  console.log(string.isLineBreak(0x0a)) // => true
 *  console.log(string.isLineBreak(""))   // => false
 *  console.log(string.isLineBreak("\n")) // => false
 */
export const isLineBreak 
  : (char: string) => boolean
  = (char) => [CR, LF].includes(char.charCodeAt(0))

/**
 * ## {@link capitalize `string.capitalize`}
 *
 * @example
 * const ex_01 = string.capitalize("abc")
 * //       ^? const ex_01: "Abc"
 * console.log(ex_01) // => "Abc"
 *
 * const ex_02 = string.capitalize("ABC")
 * //       ^? const ex_02: "ABC"
 * console.log(ex_02) // => "ABC"
 *
 * const ex_03 = string.capitalize("123")
 * //       ^? const ex_03: "123"
 * console.log(ex_03) // => "123"
 */
export function capitalize<T extends string>(text: T): globalThis.Capitalize<T>
/// impl.
export function capitalize<T extends string>(text: T) { return text.charAt(0).toUpperCase().concat(text.substring(1)) }

/**
 * ## {@link uncapitalize `string.uncapitalize`}
 * 
 * {@link uncapitalize `string.uncapitalize`} uncapitalizes a string.
 *
 * @example
 * const ex_01 = string.uncapitalize("ABC")
 * //       ^? const ex_01: "aBC"
 * console.log(ex_01) // => "aBC"
 *
 * const ex_02 = string.uncapitalize("abc")
 * //       ^? const ex_02: "abc"
 * console.log(ex_02) // => "abc"
 *
 * const ex_03 = string.uncapitalize("123")
 * //       ^? const ex_03: "123"
 * console.log(ex_03) // => "123"
 */
export function uncapitalize<T extends string>(text: T): globalThis.Uncapitalize<T>
/// impl.
export function uncapitalize<T extends string>(text: T) { return text.charAt(0).toLowerCase().concat(text.substring(1)) }

/**
 * ## {@link snake `string.snake`}
 * 
 * {@link snake `string.snake`} converts a string to snake-case.
 *
 * If the type passed into {@link snake `string.snake`} is a string literal,
 * the implementation is _also applied at the type-level_, which
 * is important when (for example) mapping over the keys of an
 * object.
 *
 * @example
 * import { string } from "@traversable/data"
 *
 * const ex_01 = string.snake("propertyCard")
 * //       ^? const ex_01: "property_card"
 * console.log(ex_01) // => "property_card"
 *
 * const ex_02 = string.snake("background-color", "-")
 * //       ^? const ex_02: "backgroundColor"
 * console.log(ex_02) // => "backgroundColor"
 * 
 * const ex_03 = string.snake("max-width", "-")
 * //       ^? const ex_03: "maxWidth"
 * console.log(ex_03) // => "maxWidth"
 */
export type snake<T extends string> = key.snake<T>
export const snake 
  : <T extends string>(string: T) => key.snake<T>
  = key.snake

/** 
 * ## {@link uppercase `string.uppercase`} 
 *
 * @example
 * import { string } from "@traversable/data"
 *
 * const ex_01 = string.uppercase("hoboken_new_jersey")
 * //       ^? const ex_01: "HOBOKEN_NEW_JERSEY"
 * console.log(ex_01) // => "HOBOKEN_NEW_JERSEY"
 */
export type uppercase<T extends string> = key.uppercase<T>
export const uppercase 
  : <T extends string>(string: T) => key.uppercase<T>
  = key.uppercase

/** 
 * ## {@link lowercase `string.lowercase`} 
 * @example
 * import { string } from "@traversable/data"
 *
 * const ex_01 = string.lowercase("CHAISE_LOUNGE")
 * //       ^? const ex_01: "chaise_lounge"
 * console.log(ex_01) // => "chaise_lounge"
 */
export type lowercase<T extends string> = key.lowercase<T>
export const lowercase 
  : <T extends string>(string: T) => key.lowercase<T>
  = key.lowercase

/**
 * ## {@link kebab `string.kebab`}
 * 
 * {@link kebab `string.kebab`} converts a string to kebab-case.
 *
 * If the type passed into {@link kebab `string.kebab`} is a string literal,
 * the implementation is _also applied at the type-level_, which
 * is important when (for example) mapping over the keys of an
 * object.
 *
 * @example
 * import { string } from "@traversable/data"
 *
 * const ex_1 = string.kebab("propertyCard")
 * //    ^? const ex_1: "property-card"
 *
 * const ex_2 = string.kebab("FBIVan2024")
 * //    ^? const ex_2: "fbi-van-2024"
 */
export type kebab<T extends string> = key.kebab<T>
export const kebab
  : <T extends string>(string: T) => key.kebab<T>
  = key.kebab


export const titlecase
  : <T extends string>(string: T) => key.titlecase<T>
  = key.titlecase

/**
 * ## {@link camel `string.camel`} 
 * 
 * {@link camel `string.camel`} converts a string to camel-case.
 *
 * If the type passed into {@link camel `string.camel`} is a string literal,
 * the implementation is _also applied at the type-level_, which
 * is important when (for example) mapping over the keys of an
 * object.
 *
 * @example
 * import { string } from "@traversable/shared/data"
 *
 * const ex_1 = string.camel("recursive_descent")
 * //    ^? const ex_1: "recursiveDescent"
 *
 * const ex_2 = string.camel("binary_search_tree")
 * //    ^? const ex_2: "binarySearchTree"
 */
export type camel<T extends string, _ extends string = "_"> = key.camel<T, _>
export const camel: {
  <T extends string, _ extends string>(string: T, delimiter: _): camel<T, _>
  <T extends string>(string: T): camel<T>
} = key.camel

/**
 * ## {@link pascal `string.pascal`} 
 * 
 * {@link pascal `string.pascal`} converts a string to pascal-case.
 *
 * If the type passed into {@link pascal `string.pascal`} is a string literal,
 * the implementation is _also applied at the type-level_, which
 * is important when (for example) mapping over the keys of an
 * object.
 *
 * @example
 * import { string } from "@traversable/data"
 *
 * const ex_01 = string.pascal("view_only_traveler")
 * //       ^? const ex_01: "ViewOnlyTraveler"
 * console.log(ex_01) // => "ViewOnlyTraveler"
 */
export type pascal<T extends string, Delimiter extends string = "_"> = key.pascal<T, Delimiter>
export const pascal: {
  <T extends string, _ extends string>(string: T, delimiter: _): pascal<T, _>
  <T extends string>(string: T): pascal<T>
} = key.pascal

/**
 * ## {@link between `string.between`}
 * 
 * Inserts `btwn` between two {@link ends `ends`}.
 *
 * Note that `btwn` doesn't have to be a string; the `any.showable`
 * type constrains the input to be any value that can be interpolated
 * as a string (anything that can be used in a template string).
 */
export function embed
  <const ends extends any.pair<string, string>>(...ends: ends)
    : <btwn extends any.primitive>(between: btwn) => embed<btwn & any.showable, ends>
export function embed
  <btwn extends any.showable>(between: btwn)
    : <const ends extends any.pair<string, string>>(...ends: ends) => embed<btwn, ends>
export function embed
  <btwn extends any.primitive>(between: btwn)
    : <const ends extends any.pair<string, string>>(...ends: ends) => embed<btwn & any.showable, ends>
// impl.
export function embed(
  ...arg: 
    | [end_0: string, end_1: string] 
    | [btwn: any.showable]
) {
  return arg.length === 1
    ? <const ends extends any.pair<string, string>>(...ends: ends) => `${ends[0]}${arg[0]}${ends[1]}`
      : <btwn extends any.showable>(between: btwn) => `${arg[0]}${between}${arg[1]}`
}

export type embed<
  between extends any.showable,
  ends extends any.pair<string, string>,
> = `${ends[0]}${between}${ends[1]}`

/** ## {@link between `string.between`} */
export const between
  : <left extends string, right extends string>(...args: [left, right]) => <text extends string>(text: text) => `${left}${text}${right}`
  = embed


/** ## {@link join `string.join`} */
export type join<xs extends any.array<any.showable>, btwn extends any.showable> = String.join<xs, btwn>
export function join<delimiter extends any.showable>(
  delimiter: delimiter,
): {
  <const xs extends any.showables>(xs: xs): join<xs, delimiter>
  <const xs extends any.showables>(...xs: xs): join<xs, delimiter>
}
export function join<delimiter extends any.showable>(delimiter: delimiter) {
  return <const xs extends any.showables>(...xs: xs) => {
    return xs.flat().join(`${delimiter}`)
  }
}

/** ## {@link joinAll `string.joinAll`} */
export const joinAll: <_ extends any.showable>(
  delimiter: _,
) => <const T extends any.showables>(...xs: T) => join<T, _> = join

/** ## {@link joinArray `string.joinArray`} */
export const joinArray: <_ extends any.showable>(
  delimiter: _,
) => <const xs extends any.showables>(xs: xs) => join<xs, _> = join

/** ## {@link concat `string.concat`} */
export const concat
  : <left extends any.showable, right extends any.showable>(left: left, right: right) => `${left}${right}` 
  = (left, right) => `${left}${right}`

/** ## {@link path `string.path`} */
export const path: <T extends any.showables>(...xs: T) => String.join<T, `/`> = (...xs) =>
  xs.reduce((acc, x) => `${acc}/${x}`, ``) as never

/** ## {@link postfix `string.postfix`} */
export const postfix: <after extends any.showable>(
  after: after,
) => <text extends string>(text: text) => `${text}${after}` = (after) => (text) => concat(text, after)

/** ## {@link prefix `string.prefix`} */
export const prefix: <before extends any.showable>(
  before: before,
) => <text extends string>(text: text) => `${before}${text}` = (before) => (text) => concat(before, text)

/** ## {@link newline `string.newline`} */
export const newline 
  : <text extends string>(text: text) => `${text}\n`
  = (text) => text.trim().concat("\n") as never

/** ## {@link trim `string.trim`} */
export function trim<Text extends string>(s: Text): trim<Text>
export function trim(s: string) { return s.trim() }
export type trim<T> = never 
  | [T] extends [`\n${infer Rest}`] ? trim<Rest>
  : [T] extends [`${infer Rest}\n`] ? trim<Rest>
  : (T)

/** ## {@link newlines `string.newlines`} */
export const newlines = <x extends number = 2>(count: x = 2 as never) => <type extends string>(string: type) => {
  let s = string.trim()
  let todo: number = count
  while(todo > 0) {
    s = s + "\n"
    todo = todo - 1
  }
  return s
}

/** ## {@link toLines `string.toLines`} */
export const toLines
  : (joinWith?: any.showable) => (xs: any.showables) => string
  = (joinWith = "\n") => (xs) => xs.join(`${joinWith}`)

/** ## {@link Concattable `string.Concattable`} */
export const Concattable
  : concattable<string> 
  = { concat: (x, y) => x.concat(y) }

/** ## {@link Foldable `string.Foldable`} */
export const Foldable
  : foldable<string>
  = { ...Concattable, empty: "" }


export type interpolate<
  text extends any.key, 
  lookup extends any.invertible, 
  captures extends any.pair<string, string> = ["${", "}"]
> = interpolate.recurse<"", text, lookup, captures>

export declare namespace interpolate {
  type recurse<acc extends string, path extends any.key, dict extends any.invertible, captures extends any.pair<string, string>>
    = path extends `${infer head}${captures[0]}${any.propertyOf<dict, infer param>}${captures[1]}${infer tail}`
    ? interpolate.recurse<`${acc}${head}${dict[param]}`, tail, dict, captures>
    : `${acc}${path}`
    ;
}

/** ## {@link interpolate `string.interpolate`} */
export const interpolate
  : <const Dict extends any.invertible>(lookup: Dict) => {
     <L extends any.showable, R extends any.showable>(...captures: [L, R]): <T extends string>(text: T) => interpolate<T, Dict, [`${L}`, `${R}`]>
     <C extends any.showable>(capture: C): <T extends string>(text: T) => interpolate<T, Dict, [`${C}`, `${C}`]>
  }
  = (lookup) => (...[left, right = left]: [any.key] | [any.key, any.key]) => (text: string) => {
    let out: string = text
    for(const [k, v] of globalThis.Object.entries(lookup)) 
      out = out.replaceAll(embed(`${left}`, `${right}`)(globalThis.String(k)), `${v}`)
    return out as never
  }

/** ## {@link KeyOf `string.KeyOf`} */
export type KeyOf<O, K extends string> = never | (K & keyof O)

/** ## {@link isKeyOf `string.isKeyOf`} */
export function isKeyOf<const O extends object, K extends string>(key: K, object: O): key is KeyOf<O, K>
export function isKeyOf<const O extends object, K extends string>(object: O): (key: K) => key is KeyOf<O, K>
/// impl.
export function isKeyOf(
  ...args: 
    | [key: string, object: object]
    | [object: object]
): unknown {
  if(args.length === 1) return (key: string) => key in args[0]
  else {
    const [key, object] = args
    return key in object
  }
}

/**
 * ## {@link slurpWhile `string.slurpWhile`}
 *
 * {@link slurpWhile `string.slurpWhile`} takes a single-char predicate, an iterable of characters.
 * It loops over the characters until it **finds the first character that fails the predicate**.
 *
 * It collects the chars that passed into a string, and the chars starting from the first to fail, and
 * returns the pair as a tuple, e.g. `[passingChars, remainingChars]`.
 *
 * **Note:** To support "lookbehind" like behavior, the predicate is also called with the substring of "seen" chars.
 *
 * See also:
 * - {@link slurpUntil `string.slurpUntil`}
 *
 * @example
 *  const chomp = slurpWhile(char => char !== "#")
 *
 *  // The first element of the tuple contains every character that passed the predicate. In this example, none of the characters
 *  // passed, so the first element is the empty string:
 *  chomp("#YOLO")
 *  //=> ["", "#YOLO"]
 *
 *  // If the predicate succeeds for every character, second element will be `null` as a signal that the entire string was slurped:
 *  chomp("abcdefghijklmnopqrstuvwxyz")
 *  //=> ["abcdefghijklmnopqrstuvwxyz", null]
 *
 *  // It's worth reiterating that the slurped substring will **not** include the
 *  // failing character.
 *  chomp("https://developer.mozilla.org/en-US/docs/Web/API/URL/hash#examples")
 *  //=> ['https://developer.mozilla.org/en-US/docs/Web/API/URL/hash', '#examples']
 */
export function slurpWhile<T extends string | readonly string[]>(
  predicate: (char: string, seen: string) => boolean
): (chars: T) => { slurped: string, unslurped: T }
/// impl.
export function slurpWhile(predicate: (char: string, seen: string) => boolean) {
  return (chars: string | readonly string[]) => {
    let out = ""
    for (let ix = 0, len = chars.length; ix < len; ix++) {
      const char = chars[ix]
      if (predicate(char, out)) out += char
      else return { slurped: out, unslurped: chars.slice(ix) }
    }
    return { slurped: out, unslurped: "" }
  }
}

/**
 * ## {@link slurpUntil `string.slurpUntil`}
 *
 * {@link slurpUntil `string.slurpUntil`} takes a string and a predicate to apply to each character of the string,
 * and loops over the string until it **finds the first character that satisfies the predicate**.
 *
 * It collects the chars that failed the predicate into a string, and the chars starting from the first to pass, and
 * returns the pair as a tuple, e.g. `[failingChars, remainingChars]`.
 *
 * **Note:** To support "lookbehind" like behavior, the predicate is also called with the substring of "seen" chars.
 *
 * See also:
 * - {@link slurpWhile `string.slurpWhile`}
 *
 * @example
 *  const chomp = slurpUntil(char => char === "#")
 *
 *  // The first element of the tuple contains every character that passed the predicate. In this example, none of the characters
 *  // passed, so the first element is the empty string:
 *  chomp("#YOLO")
 *  // => ["", "#YOLO"]
 *
 *  // If the predicate succeeds for every character, second element will be `null` as a signal that the entire string was slurped:
 *  chomp("abcdefghijklmnopqrstuvwxyz")
 *  // => ["abcdefghijklmnopqrstuvwxyz", null]
 *
 *  // It's worth reiterating that `slurpWhile` performs an _exclusive_ match, so the slurped substring will **not** include the
 *  // failing character on the left side:
 *  chomp("https://developer.mozilla.org/en-US/docs/Web/API/URL/hash#examples")
 *  // => ['https://developer.mozilla.org/en-US/docs/Web/API/URL/hash', '#examples']
 */
export const slurpUntil: typeof slurpWhile = (predicate: (char: string, seen: string) => boolean) => slurpWhile(not(predicate))

/**
 * ## {@link rmChars `string.rmChars`}
 */
export function rmChars<T extends readonly string[]>(...rm: T): (s: string) => string
export function rmChars<T extends readonly string[]>(...rm: T) {
  return (s: string) => {
    let chars = [...s]
    let c: string | undefined = void 0
    let out = ""
    while (c = chars.shift()) {
      if (rm.indexOf(c) === -1) out = out+= c
    }
    return out
  }
}
