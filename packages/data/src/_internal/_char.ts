import type { nonempty } from "any-ts"

/** @internal */
export const Escapables = [
  "[", 
  "]", 
  "{", 
  "}", 
  "(", 
  ")", 
  "|", 
  "/", 
  "\\"
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
} satisfies { [K in Escapable]: K }
/** @internal */
export type Escapable = typeof Escapables[number]

export const escapeChar = (char?: string) => 
  char && char in Escapable ? "\\".concat(char) : char

export const Delimiters = [...Escapables, ` `, `_`, `.`] as const

export type escape<T extends string> = T extends nonempty.string<infer Head, infer Tail>
  ? Head extends Escapable
    ? `\\${Head}${Tail}`
    : T
  : T
