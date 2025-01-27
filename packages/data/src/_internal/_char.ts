import type { jsdoc } from "./_unicode.js"

export {
  type char_finite as finite,
  char_escapeChar as escapeChar,
  char_Escapable as Escapable,
  char_Escapables as Escapables,
  char_startsWithEscapable as startsWithEscapable,
  char_Delimiters as Delimiters,
  char_isEscapable as isEscapable,
}

const CODE = {
  A: 65,
  Z: 90,
  a: 97,
  z: 122,
} as const

/**
 * ### {@link char_finite `char.finite`}
 * 
 * {@link char_finite `char.finite`} constrains a type parameter to be a single
 * character -- not an empty string literal, not 2 chars, and not a non-finite
 * string (`string`).
 * 
 * **Note:** For this to work, you need to apply {@link char_finite `char.finite`}
 * to the type parameter you're _currently_ declaring, see example below.
 * 
 * @example
 *  import type { char } from "@traversable/data"
 *  
 *  function onlySingleCharAllowed<T extends char.finite<T>>(char: T): T { return char }
 * 
 *  onlySingleCharAllowed("a")                // ✅
 *  onlySingleCharAllowed("\\")               // ✅
 *  onlySingleCharAllowed("ab")               // 🚫  
 *  onlySingleCharAllowed("🚫")               // 🚫  
 *  onlySingleCharAllowed(Math.random() + "") // 🚫  
 */
type char_finite<T> 
  = [T] extends [infer U] 
  ? [U] extends [`${string}${infer W}`] 
  ? [W] extends [""] ? string 
  : never : never : never
  ;

/** @internal */
const char_Escapables = [
  "[",  // 91
  "\\", // 92
  "]",  // 93
  "{",  // 123
  "|",  // 124
  "}",  // 125
  "(",  // 40
  ")",  // 41
  "/",  // 47
  "\"", // 34
] as const
/** @internal */
const char_Escapable = {
  "(": "(",
  ")": ")",
  "[": "[",
  "]": "]",
  "{": "{",
  "}": "}",
  "|": "|",
  "/": "/",
  "\\": "\\",
  "\"": "\""
} satisfies { [K in char_Escapable]: K }
/** @internal */
type char_Escapable = typeof char_Escapables[number]

const char_isEscapable = (char = " ") => {
  const code = char.charCodeAt(0)
  return (90 < code && code < 94) // [ \ ]
    || (122 < code && code < 126) // { | }
    || code === 40 || code === 41 //  ( )
    || code === 34 || code === 47 //  " /
}

const char_startsWithEscapable = (chars = " ") => chars.startsWith("\\") && char_isEscapable(chars.charAt(1))

const char_Delimiters = [...char_Escapables, ` `, `_`, `.`] as const

/** 
 * ## {@link char_is `char.is`}
 * ### ｛ {@link jsdoc.guard ` 🦺 ` } ｝
 * 
 * Typeguard that targets the set of strings containing a single
 * character.
 */
const char_is
  : (u: unknown) => u is string
  = (u): u is never => typeof u === "string" && u.length === 1

const char_escapeChar = (char?: string) => 
  char && char in char_Escapable ? "\\".concat(char) : char

export const invertCase = (char?: string) => {
  if (char === undefined) return ""
  else {
    const prev = char.charCodeAt(0)
    const delta 
      = CODE.a <= prev && prev <= CODE.z ? -32  
      : CODE.A <= prev && prev <= CODE.Z ? 32 
      : 0
    return globalThis.String.fromCharCode(prev + delta)
  }
}

/** 
 * ## {@link isLeadingSurrogate `char.isLeadingSurrogate`}
 * 
 * a.k.a. "high-surrogate" characters
 * 
 * Surrogates come in pairs, and can be present in any UTF-16 text.
 * 
 * When escaping UTF-16, you need to make sure "high" and "low" surrogates
 * are balanced, the way parens or brackets need to be balanced.
 * 
 * See also:
 * - the [Wikipedia page](https://en.wikipedia.org/wiki/UTF-16#U+D800_to_U+DFFF_(surrogates))
 *   on surrogates
 */
export const isLeadingSurrogate = (char: string) => {
  let pt = char.charCodeAt(0)
  return 0xd800 <= pt && pt <= 0xdbff
}

/** 
 * ## {@link isTrailingSurrogate `char.isTrailingSurrogate`}
 * 
 * a.k.a. "low-surrogate" characters
 * 
 * Surrogates come in pairs, and can be present in any UTF-16 text.
 * 
 * When escaping UTF-16, you need to make sure "high" and "low" surrogates
 * are balanced, the way parens or brackets need to be balanced.
 * 
 * See also:
 * - the [Wikipedia page](https://en.wikipedia.org/wiki/UTF-16#U+D800_to_U+DFFF_(surrogates))
 *   on surrogates
 */
export const isTrailingSurrogate = (char: string) => {
  let pt = char.charCodeAt(0)
  return 0xdc00 <= pt && pt <= 0xdfff
}
