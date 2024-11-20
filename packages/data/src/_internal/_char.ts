import type { nonempty } from "any-ts"

/** @internal */
export const Escapables = [
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
export const Escapable = {
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
} satisfies { [K in Escapable]: K }
/** @internal */
export type Escapable = typeof Escapables[number]

export const isEscapable = (char = " ") => {
  const code = char.charCodeAt(0)
  return (90 < code && code < 94) // [ \ ]
    || (122 < code && code < 126) // { | }
    || code === 40 || code === 41 //  ( )
    || code === 34 || code === 47 //  " /
}

export const startsWithEscapable = (chars = " ") => chars.startsWith("\\") && isEscapable(chars.charAt(1))

export const Delimiters = [...Escapables, ` `, `_`, `.`] as const

export type escape<T extends string> = T extends nonempty.string<infer Head, infer Tail>
  ? Head extends Escapable
    ? `\\${Head}${Tail}`
    : T
  : T

export const escapeChar = (char?: string) => 
  char && char in Escapable ? "\\".concat(char) : char
