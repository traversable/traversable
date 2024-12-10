import type { newtype } from "any-ts"
import * as Option from "../option.js"
import { slurpUntil } from "../string.js"

export { 
  ANSI,
  type Ansi,
}

type Open = typeof Open[keyof typeof Open]

/**
 * ## {@link Escape `ANSI.Escape`}
 * 
 * [Source](https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797)
 * (wish I'd had this gist a decade ago)
 */
const Open = {
  Keyboard: "^[",
  Octal: "\\033",
  Unicode: "\u001b",
  Hexadecimal: "\x1b",
} as const
declare namespace Open {
  type Keyboard = typeof Open.Keyboard
  type Octal = typeof Open.Octal
  type Unicode = typeof Open.Unicode
  type Hexadecimal = typeof Open.Hexadecimal
}

const Close = "m" as const
type Close = typeof Close

/**
 * ## {@link Effect `ANSI.Effect`}
 */
const Effect = {
  Bold: [`${Open.Unicode}[1${Close}`, `${Open.Unicode}[21${Close}`],
  Dim: [`${Open.Unicode}[2${Close}`, `${Open.Unicode}[22${Close}`],
  Underline: [`${Open.Unicode}[4${Close}`, `${Open.Unicode}[24${Close}`],
  Blink: [`${Open.Unicode}[5${Close}`, `${Open.Unicode}[25${Close}`],
  Reverse: [`${Open.Unicode}[7${Close}`, `${Open.Unicode}[27${Close}`],
  Hide: [`${Open.Unicode}[8${Close}`, `${Open.Unicode}[28${Close}`],
} as const

const VGA_FG = "[38:5:" as const
const VGA_BG = "[48:5:" as const

/**
 * ## {@link Grey `ANSI.Grey`}
 */
const Grey = {
  fg: [
    [`${Open.Unicode}${VGA_FG}${232}`, Close], 
    [`${Open.Unicode}${VGA_FG}${233}`, Close], 
    [`${Open.Unicode}${VGA_FG}${234}`, Close],
    [`${Open.Unicode}${VGA_FG}${235}`, Close],
    [`${Open.Unicode}${VGA_FG}${236}`, Close],
    [`${Open.Unicode}${VGA_FG}${237}`, Close],
    [`${Open.Unicode}${VGA_FG}${238}`, Close],
    [`${Open.Unicode}${VGA_FG}${239}`, Close],
    [`${Open.Unicode}${VGA_FG}${240}`, Close],
    [`${Open.Unicode}${VGA_FG}${241}`, Close],
    [`${Open.Unicode}${VGA_FG}${242}`, Close],
    [`${Open.Unicode}${VGA_FG}${243}`, Close],
    [`${Open.Unicode}${VGA_FG}${244}`, Close],
    [`${Open.Unicode}${VGA_FG}${245}`, Close],
    [`${Open.Unicode}${VGA_FG}${246}`, Close],
    [`${Open.Unicode}${VGA_FG}${247}`, Close],
    [`${Open.Unicode}${VGA_FG}${248}`, Close],
    [`${Open.Unicode}${VGA_FG}${249}`, Close],
    [`${Open.Unicode}${VGA_FG}${250}`, Close],
    [`${Open.Unicode}${VGA_FG}${251}`, Close],
    [`${Open.Unicode}${VGA_FG}${252}`, Close],
    [`${Open.Unicode}${VGA_FG}${253}`, Close],
    [`${Open.Unicode}${VGA_FG}${254}`, Close],
    [`${Open.Unicode}${VGA_FG}${255}`, Close],
  ],
  bg: [
    [`${Open.Unicode}${VGA_BG}${232}`, Close],
    [`${Open.Unicode}${VGA_BG}${233}`, Close],
    [`${Open.Unicode}${VGA_BG}${234}`, Close],
    [`${Open.Unicode}${VGA_BG}${235}`, Close],
    [`${Open.Unicode}${VGA_BG}${236}`, Close],
    [`${Open.Unicode}${VGA_BG}${237}`, Close],
    [`${Open.Unicode}${VGA_BG}${238}`, Close],
    [`${Open.Unicode}${VGA_BG}${239}`, Close],
    [`${Open.Unicode}${VGA_BG}${240}`, Close],
    [`${Open.Unicode}${VGA_BG}${241}`, Close],
    [`${Open.Unicode}${VGA_BG}${242}`, Close],
    [`${Open.Unicode}${VGA_BG}${243}`, Close],
    [`${Open.Unicode}${VGA_BG}${244}`, Close],
    [`${Open.Unicode}${VGA_BG}${245}`, Close],
    [`${Open.Unicode}${VGA_BG}${246}`, Close],
    [`${Open.Unicode}${VGA_BG}${247}`, Close],
    [`${Open.Unicode}${VGA_BG}${248}`, Close],
    [`${Open.Unicode}${VGA_BG}${249}`, Close],
    [`${Open.Unicode}${VGA_BG}${250}`, Close],
    [`${Open.Unicode}${VGA_BG}${251}`, Close],
    [`${Open.Unicode}${VGA_BG}${252}`, Close],
    [`${Open.Unicode}${VGA_BG}${253}`, Close],
    [`${Open.Unicode}${VGA_BG}${254}`, Close],
    [`${Open.Unicode}${VGA_BG}${255}`, Close],
  ],
} as const

interface foreground<
  _ extends 
  | readonly [R: number, G: number, B: number]
  = readonly [R: number, G: number, B: number]
> extends newtype<`${Open.Unicode}38:${2}::${number}:${number}:${number}m${string}\u001b[49${Close}`> {}

/** 
 * ## {@link foreground `ANSI.foreground`}
 */
function foreground<
  R extends number, 
  G extends number, 
  B extends number, 
  _ extends ColorSpaceId = 2
> (R: R, G: G, B: B, _: _): (text: string) => ANSI.foreground<[R: R, G: G, B: B]>
function foreground<
  R extends number, 
  G extends number, 
  B extends number, 
  _ extends ColorSpaceId = 2
> (R: R, G: G, B: B, _: _)
  { return (text: string) => `\u001b[38:${_}::${R}:${G}:${B}m${text}\u001b[39m` as const }


interface background<
  _ extends 
  | readonly [R: number, G: number, B: number]
  = readonly [R: number, G: number, B: number]
> extends newtype<`\u001b[48:${2}::${number}:${number}:${number}m${string}\u001b[49m`> {}

/** 
 * ## {@link background `ANSI.background`}
 */
function background<
  R extends number, 
  G extends number, 
  B extends number, 
  _ extends ColorSpaceId = 2
> (R: R, G: G, B: B, _: _): (text: string) => background<[R: R, G: G, B: B]>
function background
  <R extends number, G extends number, B extends number, _ extends ColorSpaceId = 2> 
  (R: R, G: G, B: B, _: _ = 2 as never): unknown
  { return (text: string) => `\u001b[48:${_}::${R}:${G}:${B}m${text}\u001b[49m` as const }

/**
 * ## {@link Ansi `ANSI.Ansi`}
 */
type Ansi<
  T extends 
  | readonly [R: number, G: number, B: number] 
  = readonly [R: number, G: number, B: number]
> = never | ANSI<{ fg(text: string | background): foreground<T>, bg(text: string | foreground): background<T> }>

/** 
 * ## {@link ANSI `data.ANSI`}
 */
function ANSI
  <R extends number, G extends number, B extends number, _ extends ColorSpaceId = 2>
  (R: R, G: G, B: B): Ansi<[R: R, G: G, B: B]>
function ANSI
  <R extends number, G extends number, B extends number, _ extends ColorSpaceId = 2>
  (R: R, G: G, B: B) { 
    return {
      fg(text: string) { return foreground<R, G, B>(R as R, G as G, B as B, 2)(text) },
      bg(text: string) { return background<R, G, B>(R as R, G as G, B as B, 2)(text) },
    } 
  }

interface ANSI<T extends { 
  fg(text: string): foreground
  bg(text: string): background 
}> extends newtype<T> {}

/** 
 * ## {@link ColorSpaceId `ANSI.ColorSpaceId`} 
 * 
 * There might be a more precise name for this, but I have not been able to find a
 * spec anywhere.
 * 
 * [This](https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit:~:text=is%20a%20leading%20%22-,colorspace,-ID%22.%5B)
 * is the only place I've seen it given a name, and `2` is the only value that 
 * consistently renders RGB on my machine (iTerm2 with Apple silicon)
 * 
 * See also:
 * - [ECMA-48](https://ecma-international.org/wp-content/uploads/ECMA-48_5th_edition_june_1991.pdf)
 */
type ColorSpaceId = typeof ColorSpaceId[keyof typeof ColorSpaceId]
const ColorSpaceId = {
  ["RGB"]: 2,
  ["CMY"]: 3,
  ["CMYK"]: 4,
} as const


//////////////////////////////////////
/// @traversable-specific palettes
const green = ANSI(175, 238, 87)
const yellow = ANSI(250, 215, 21)
const red = ANSI(251, 42, 33)
const white = ANSI(255, 255, 255)
const mint = ANSI(2, 255, 82)
//////////////////////////////////////
/// leuven
const Leuven = {
  body: ANSI(255, 255, 224),
  bodyAlt1: ANSI(226, 249, 226),
  bodyAlt2: ANSI(226, 225, 213),
  comment: ANSI(175, 174, 176),
  glyph: ANSI(190, 58, 169),
  identifierTerm: ANSI(12, 11, 254),
  identifierType: ANSI(15, 130, 15),
  keyword: ANSI(58, 59, 74),
  link: ANSI(235, 245, 235),
  operator: ANSI(47, 148, 224),
  pragma: ANSI(255, 94, 95),
}
//////////////////////////////////////
/// spacemacs (light)
const Spacemacs = {
  body: ANSI(252, 248, 239),
  bodyAlt: ANSI(239, 234, 233),
  comment: ANSI(211, 211, 231),
  identifierTerm: ANSI(58, 138, 202),
  identifierType: ANSI(78, 148, 126),
  keyword: ANSI(185, 43, 86),
  glyph: ANSI(101, 83, 112),
  link: ANSI(108, 45, 96),
  operator: ANSI(255, 164, 76),
  pragma: ANSI(219, 144, 96),
} as const
const darkGreen  = ANSI(15, 130, 15)
const lightGreen = ANSI(235, 245, 235)


//////////////////////////////////////
/// other colors
const bold = format(`\x1B[1m`, `\x1B[22m`, `\x1B[22m\x1B[0m`)
const strikethrough = format(`\x1B[9m`, `\x1B[29m`)
const dim = format(`\x1B[2m`, `\x1B[22m`)
const gray = format(`\x1B[90m`, `\x1B[39m`)
const italic = format(`\x1B[3m`, `\x1B[23m`)
const lightblue = format(`\x1B[104m`, `\x1B[254m`, `\x1B[0m`)
const bgBlack = format("\x1B[40m", "\x1B[49m")
const hush = format(`\x1B[2m`, `\x1B[22m`)
const invert = format(`\x1B[7m`, `\x1B[27m`)
const task = (text: string) => print(`\n\n${hush(`❲🌳❳`)} ${text}\n`)
const underline = format(`\x1B[4m`, `\x1B[24m`)

const Hask = {
  body: ANSI(253, 246, 227),
  bodyAlt: ANSI(238, 232, 213),
  comment: ANSI(138, 138, 138),
  glyph: ANSI(220, 50, 47),
  identifierTerm: ANSI(7, 54, 66),
  identifierType: ANSI(95, 95, 175),
  keyword: ANSI(175, 0, 95),
  link: ANSI(238, 232, 213),
  operator: ANSI(211, 54, 130),
  pragma: ANSI(42, 161, 152),
} as const

//////////////////////////////////////
/// helpers
function print<T extends readonly unknown[]>(...args: T): T
function print(...args: readonly unknown[]) 
  { return (globalThis.console.log(...args), args) }
function format(open: string, close: string, replace?: string): (text: string | number) => string
function format(open: string, close: string, replace?: string) 
  { return (text: string | number) => `${open}${text}${replace ?? close}` }

declare namespace ANSI {
  export {
    background,
    bgBlack,
    bold,
    ColorSpaceId,
    dim,
    foreground,
    gray,
    green,
    Hask,
    Leuven,
    Spacemacs,
    hush,
    invert,
    italic,
    lightblue,
    mint,
    red,
    strikethrough,
    task,
    underline,
    white,
    yellow,
  }
}

namespace ANSI {
  void (ANSI.background = background)
  void (ANSI.bgBlack = bgBlack)
  void (ANSI.bold = bold)
  void (ANSI.ColorSpaceId = ColorSpaceId)
  void (ANSI.dim = dim)
  void (ANSI.foreground = foreground)
  void (ANSI.gray = gray)
  void (ANSI.green = green)
  void (ANSI.Hask = Hask)
  void (ANSI.Leuven = Leuven)
  void (ANSI.Spacemacs = Spacemacs)
  void (ANSI.hush = hush)
  void (ANSI.invert = invert)
  void (ANSI.italic = italic)
  void (ANSI.lightblue = lightblue)
  void (ANSI.mint = mint)
  void (ANSI.red = red)
  void (ANSI.strikethrough = strikethrough)
  void (ANSI.task = task)
  void (ANSI.underline = underline)
  void (ANSI.white = white)
  void (ANSI.yellow = yellow)
}
