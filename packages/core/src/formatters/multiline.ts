import { fn, map, object, string } from "@traversable/data"

import { is } from "../guard/exports.js"
import type { Json } from "../json.js"

/** @internal */
const wrapWith: [before: string, after: string] = ['', '']
/** @internal */
const isArray
  : (u: unknown) => u is readonly Json.of<string>[]
  = is.array as never
/** @internal */
const isObject
  : (u: unknown) => u is { [x: string]: Json.of<string> }
  = is.object as never

type OptionsWithHandlers = Options & { handlers?: Handlers }
type Options = {
  /**
   * ### {@link defaults.indent `Options.indent`}
   *
   * Configures how many
   * {@link defaults.whitespaceUnit `Options.whitespaceUnit`}s
   * should be used when indenting.
   *
   * If unspecified, defaults to {@link defaults.indent `defaults.indent`}.
   *
   * @example
   *  import { Format } from "@traversable/core"
   *
   *  const ex_01 = Format.multiline({ x: { y: { z: 123 } } }, { indent: 4 })
   *
   *  console.log(ex_01) // =>
   *  //  "* {
   *  //   *     x: {
   *  //   *         y: {
   *  //   *             z: 123
   *  //   *         }
   *  //   *     }
   *  //   * }"
   *
   *  const ex_02 = Format.multiline(
   *    { DEF: { GHI: { JKL: 456 } } },
   *    { indent: 2, whitespaceUnit: "\t" },
   *  )
   *
   *  console.log(ex_02) // =>
   *  // "* {
   *  //  * \t\tDEF: {
   *  //  * \t\t\t\tGHI: {
   *  //  * \t\t\t\t\t\tJKL: 123
   *  //  * \t\t\t\t}
   *  //  * \t\t}
   *  //  * }"
   */
  indent?: number,
  /**
   * ### {@link defaults.leftMargin `Options.leftMargin`}
   *
   * Configures how many
   * {@link defaults.whitespaceUnit `Options.whitespaceUnit`}s
   * should be used when left-indenting.
   *
   * Note that _left_ in this context means "on the lefthand side of the `*` separator".
   *
   * If unspecified, defaults to {@link defaults.leftMargin `defaults.leftMargin`}.
   *
   * @example
   *  import { Format } from "@traversable/core"
   *  import * as vi from "vitest"
   *
   *  vi.expect(Format.multiline([1, [2, [3]]], { leftMargin: 4 }))
   *    .toMatchInlineSnapshot(`"     * [ 1, [ 2, [ 3 ] ] ]"`)
   */
  leftMargin?: number,
  leftGutter?: string,
  /**
   * ### {@link defaults.leftPadding `Options.leftPadding`}
   *
   * Configures how many
   * {@link defaults.whitespaceUnit `Options.whitespaceUnit`}s
   * should be used when right-indenting.
   *
   * Note that _right_ in this context means "on the righthand side of the `*` separator".
   *
   * If unspecified, defaults to {@link defaults.leftPadding `defaults.leftPadding`}.
   *
   * @example
   *  import { Format } from "@traversable/core"
   *  import * as vi from "vitest"
   *
   *  vi.expect(Format.multiline([1, [2, [3]]], { leftPadding: 4 }))
   *    .toMatchInlineSnapshot(`" *     [ 1, [ 2, [ 3 ] ] ]"`)
   */
  leftPadding?: number,
  /**
   * ### {@link defaults.bracesSeparator `Options.bracesSeparator`}
   *
   * Configures what character (or characters) should be used when separating object
   * braces (`"{"` and `"}"`) from their contents
   *
   * If unspecified, defaults to
   * {@link defaults.bracesSeparator `defaults.bracesSeparator`}.
   */
  bracesSeparator?: string,
  /**
   * ### {@link defaults.bracketsSeparator `Options.bracketsSeparator`}
   *
   * Configures what character (or characters) should be used when separating array
   * brackets (`"["` and `"]"`) from their contents
   *
   * If unspecified, defaults to
   * {@link defaults.bracketsSeparator `defaults.bracketsSeparator`}.
   */
  bracketsSeparator?: string,
  /**
   * ### {@link defaults.keyValueSeparator `Options.keyValueSeparator`}
   *
   * Configures what character (or characters) should be used when separating properties,
   * i.e., what comes after the key + colon (`":"`), but before the value.
   *
   * If unspecified, defaults to
   * {@link defaults.keyValueSeparator `defaults.keyValueSeparator`}.
   */
  keyValueSeparator?: string,
  /**
   * ### {@link defaults.maxWidth `Options.maxWidth`}
   *
   * Configures the line's maximum width (how many characters before a forced linebreak).
   *
   * If unspecified, defaults to {@link defaults.maxWidth `defaults.maxWidth`}.
   */
  maxWidth?: number,
  /**
   * ### {@link defaults.wrapWith `Options.wrapWith`}
   *
   * If specified, the final output string will be sandwiched between the left and
   * right elements of {@link defaults.wrapWith `Options.wrapWith`}.
   *
   * If unspecified, defaults to {@link wrapWith `defaults.wrapWith`}.
   */
  wrapWith?: readonly [before: string, after: string],
  /**
   * ### {@link defaults.whitespaceUnit `Options.whitespaceUnit`}
   *
   * The whitespace unit represents a "space", and acts as the "multiplier" that all of
   * the numeric options use to determine how much whitespace to render. For example,
   * an {@link defaults.whitespaceUnit `Options.whitespaceUnit`} of `"---"`
   * with an {@link defaults.leftMargin `Options.leftMargin`} of `2` produces
   * a left gutter of `6` hyphens, i.e. `"------"`.
   *
   * If unspecified, defaults to {@link defaults.whitespaceUnit `defaults.whitespaceUnit`}.
   */
  whitespaceUnit?: string,
}

type Config =
  & { handlers: { [K in keyof typeof defaultHandlers]: ReturnType<typeof defaultHandlers[K]> } }
  & { offset: number }
  & Required<Options>

interface Loop<Out> { (node: {} | null | undefined, offset: number): Out }

type Handlers = { [K in keyof typeof defaultHandlers]+?: ReturnType<typeof defaultHandlers[K]> }

type Tag = typeof Tags[number]
const Tags = [
  'null',
  'undefined',
  'boolean',
  'number',
  'string',
  'array',
  'object',
] as const satisfies string[]

/**
 * ### {@link defaults.handlers `Options.handlers`}
 *
 * At its core, all {@link multiline `multiline`} cares about is figuring out
 * what kind of node it's currently visiting to figure out which handler to call,
 * and then, calling it.
 *
 * This was done in order to isolate the recursive logic (which lets us solve
 * the recursive aspect once and for all) from the _interpretation_.
 *
 * In other words, {@link multiline `multiline`} inverts control completely,
 * only falling back on an opinionated set of defaults as a convenience so
 * users aren't forced to define and re-define trivial/common cases unless
 * their use case requires something different.
 */
const defaultHandlers = {
  null(_) { return (node: null, _) => `${node}` },
  undefined(_) { return (node: undefined, _) => `${node}` },
  boolean(_) { return (node: boolean, _) => `${node}` },
  number(_) { return (node: number, _) => `${node}` },
  string(_) { return (node: string, _) => `"${node}"` },
  array(loop) {
    return (x: readonly Json.of<string>[], $) =>
      x.length === 0 ? '[]'
      : fn.pipe(
        x.map((u) => loop(u, $.offset + $.indent)),
        (xs) => xs.join(
          notTooLong($.maxWidth, $.offset)(xs)
          ? `, `
          : `,\n${$.whitespaceUnit.repeat($.leftMargin)}${$.leftGutter}${$.whitespaceUnit.repeat($.offset)}`
        ),
        (s) => notTooLong($.maxWidth, $.offset)(s) ? s
        : string.between(
          `\n${$.whitespaceUnit.repeat($.leftMargin)}${$.leftGutter}${$.whitespaceUnit.repeat($.offset)}`,
          `\n${$.whitespaceUnit.repeat($.leftMargin)}${$.leftGutter}${$.whitespaceUnit.repeat($.offset - $.indent)}`
        )(s),
        (s) => fn.pipe(
          s,
          string.between(''
            + '['
            +  ( notTooLong($.maxWidth, $.offset)(s) ? $.bracketsSeparator : '' )
            ,  ( notTooLong($.maxWidth, $.offset)(s) ? $.bracketsSeparator : '' )
            + ']',
          )
        )
      )
  },
  object(loop) {
    return (x: { [x: string]: Json.of<string> }, $) => fn.pipe(
      globalThis.Object.entries(x),
      (xs) => xs.length === 0 ? '{}' :
      fn.pipe(
        xs,
        map(([k, v]) => object.parseKey(k) + ':' + $.keyValueSeparator + loop(v, $.offset + $.indent)),
        (xs) => xs.join(
          notTooLong($.maxWidth, $.offset)(xs)
          ? ', '
          : `,\n${$.whitespaceUnit.repeat($.leftMargin)}${$.leftGutter}${$.whitespaceUnit.repeat($.offset)}`
        ),
        (s) => notTooLong($.maxWidth, $.offset)(s) ? s
        : string.between(
          `\n${$.whitespaceUnit.repeat($.leftMargin)}${$.leftGutter}${$.whitespaceUnit.repeat($.offset)}`,
          `\n${$.whitespaceUnit.repeat($.leftMargin)}${$.leftGutter}${$.whitespaceUnit.repeat($.offset - $.indent)}`,
        )(s),
        (s) => string.between(''
          + '{'
          +  ( notTooLong($.maxWidth, $.offset)(s) ? $.bracesSeparator : '' )
          ,  ( notTooLong($.maxWidth, $.offset)(s) ? $.bracesSeparator : '' )
          + '}',
        )(s)
      )
    )
  },
  // object(loop) { return (node: { [x: string]: Json.of<string> }) => '' },
} as const satisfies Record<Tag, (loop: Loop<string>) => (node: never, config: Config) => string>

const defaults = {
  indent: 1,
  leftMargin: 0,
  leftGutter: '',
  leftPadding: 0,
  bracesSeparator: ' ',
  bracketsSeparator: ' ',
  keyValueSeparator: ' ',
  maxWidth: 100,
  wrapWith,
  whitespaceUnit: ' ',
} as const satisfies Options

void (multiline.defaults = defaults)
export declare namespace multiline {
  export {
    Options,
    OptionsWithHandlers,
    Config,
    Handlers,
  }
}

/**
 * ## {@link multiline `Format.multiline`}
 *
 * Given some arbitrary JSON value, generates a well-formatted multiline-comment
 * (a comment spanning zero or more lines).
 *
 * By default, formatting is optimized for readability and stable diffs.
 *
 * At its core, {@link multiline `Format.multiline`} is unopinionated about how formatting should happen.
 *
 * If you choose not to write your own handlers, {@link multiline `Format.multiline`} will apply an
 * opinonated set of defaults that have been tailored to `@traversable`'s primary
 * use case: generating `@example` tags in JSDoc annotations.
 */
export function multiline(u: {} | null | undefined, options?: Options): string
export function multiline(
  u: {} | null | undefined, {
    indent: _indent = defaults.indent,
    leftMargin: _leftMargin = defaults.leftMargin,
    leftPadding: _leftPadding = defaults.leftPadding,
    maxWidth: _maxWidth = defaults.maxWidth,
    leftGutter = defaults.leftGutter,
    bracesSeparator = defaults.bracesSeparator,
    bracketsSeparator = defaults.bracesSeparator,
    keyValueSeparator = defaults.keyValueSeparator,
    whitespaceUnit = defaults.whitespaceUnit,
    wrapWith = defaults.wrapWith,
    handlers: userDefs,
  }: Options & { handlers?: Handlers } = defaults
) {
  const indent = Math.max(_indent, 0)
  const leftMargin = Math.max(_leftMargin, 0)
  const leftPadding = Math.max(_leftPadding, 0)
  const maxWidth = Math.max(_maxWidth, 10)
  const handlers = (loop: Loop<string>) => ({
    array: userDefs?.array || defaultHandlers.array(loop),
    string: userDefs?.string || defaultHandlers.string(loop),
    boolean: userDefs?.boolean || defaultHandlers.boolean(loop),
    number: userDefs?.number || defaultHandlers.number(loop),
    null: userDefs?.null || defaultHandlers.null(loop),
    undefined: userDefs?.undefined || defaultHandlers.undefined(loop),
    object: userDefs?.object || defaultHandlers.object(loop),
  }) satisfies Required<Handlers>
  const $ = {
    bracesSeparator,
    bracketsSeparator,
    keyValueSeparator,
    whitespaceUnit,
    wrapWith,
    maxWidth,
    leftGutter,
    leftMargin,
    leftPadding,
    indent,
  } satisfies Omit<Config, "handlers" | "offset">
  const loop = fn.loopN<[x: {} | null | undefined, offset: number], string>(
    (x, offset, loop) => {
      const handle = handlers(loop)
      const ctx = { ...$, handlers: handle, offset }
      switch (true) {
        default: return fn.exhaustive(x)
        case is.null(x): return handle.null(x, ctx)
        case is.undefined(x): return handle.undefined(x, ctx)
        case is.boolean(x): return handle.boolean(x, ctx)
        case is.number(x): return handle.number(x, ctx)
        case is.string(x): return handle.string(x, ctx)
        case isArray(x): return handle.array(x, ctx)
        case isObject(x): return handle.object(x, ctx)
        case is.nonnullable(x): return ''
      }
    }
  )
  return ''
    + wrapWith[0]
    + `${$.whitespaceUnit.repeat($.leftMargin)}${leftGutter}${$.whitespaceUnit.repeat($.leftPadding)}`
    + loop(u, $.leftPadding + indent)
    + wrapWith[1]
}

function notTooLong(maxWidth: number, offset: number): (ss: string | string[]) => boolean {
  return (ss) => maxWidth
    > 0
    + ' * '.length
    + offset
    + (typeof ss === 'string' ? ss : ss.join()).length
}


// import { Functor, HKT, inline, Kind, Widen } from "@traversable/registry"
// import { Json } from "./json.js"
// import { is } from "./guard/exports.js"
// import { fn, map, object, string } from "@traversable/data"
// const loop = fn.loopN<[x: {} | null | undefined, $: multiline.Internal], string>(
//   (z, $, loop) => {
//     console.log('looping', z)
//     switch (true) {
//       default: return fn.exhaustive(z)
//       case is.null(z):
//       case is.undefined(z):
//       case is.boolean(z):
//       case is.number(z): ///return `${z}`
//       case is.string(z): return JSON.stringify(z)  // `${z}` // `""`
//       case is.array(z): return fn.tap("is array")(
//         z.length === 0 ? '[]' :
//         fn.pipe(
//           z.map((y) => loop(y, { ...$, INDENT: $.OFFSET + $.INDENT })),
//           (ys) => ys.join(
//             notTooLong(ys)
//             ? ', '
//             : (console.log("other branch", ys), `,\n${$.__.repeat($.LEFT)} * ${$.__.repeat($.OFFSET)}`)
//           ),
//           (s) => notTooLong(s) ? s
//           : (console.log('other branch', s), string.between(
//             `\n${$.__.repeat($.LEFT)} * ${$.__.repeat($.OFFSET)}`,
//             `\n${$.__.repeat($.RIGHT)} * ${$.__.repeat($.OFFSET - $.INDENT)}`
//           )(s)),
//           (s) => fn.pipe(
//             s,
//             string.between(''
//               + '['
//               +  ( notTooLong(s) ? $.BRACK : '' )
//               ,  ( notTooLong(s) ? $.BRACK : '' )
//               + ']',
//             )
//           )
//         )
//       )
//       case is.object(z): return (console.log("is object", z), fn.pipe(
//         globalThis.Object.entries(z),
//         (xs) => xs.length === 0 ? '{}' :
//         fn.pipe(
//           xs,
//           map(([k, v]) => object.parseKey(k) + ':' + $.KV + loop(v, { ...$, INDENT: $.OFFSET+ $.INDENT })),
//           (xs) => xs.join(
//             notTooLong(xs)
//             ? ', '
//             : `,\n${$.__.repeat($.LEFT)} * ${$.__.repeat($.OFFSET)}`
//           ),
//           (s) => notTooLong(s) ? s
//           : string.between(
//             `\n${$.__.repeat($.LEFT)} * ${$.__.repeat($.OFFSET)}`,
//             `\n${$.__.repeat($.LEFT)} * ${$.__.repeat($.OFFSET - $.INDENT)}`,
//           )(s),
//           (s) => string.between(''
//             + '{'
//             +  ( notTooLong(s) ? $.BRACE : '' )
//             ,  ( notTooLong(s) ? $.BRACE : '' )
//             + '}',
//           )(s)
//         )
//       ))
//       case is.nonnullable(z): return ''
//     }
//     function notTooLong(ss: string | string[]): boolean {
//       const out = $.MAX
//         > 0
//         + ' * '.length
//         + $.OFFSET
//         + (typeof ss === 'string' ? ss : ss.join()).length
//         console.log("not too long out for input: ", ss, out)
//       return out
//     }
//   }
// )
// const rAlgebra: Functor.RAlgebraʹ<Json.lambda, string>
//   = (z) => (fa) => {
//     return 'ehy'
//   }
// Json.foldWithPrevious(rAlgebra)
// Json.foldWithPrevious<string>(
//   (z) => {
//     console.log('looping', z)
//     switch (true) {
//       default: return fn.exhaustive(z)
//       case is.null(z): return z + ''
//       case is.undefined(z): return z + ''
//       case is.boolean(z): return z + ''
//       case is.number(z): return String(z)
//       case is.string(z): return JSON.stringify("STR" + z + "STR")  // `${z}` // `""`
//       case is.array(z): {
//         return z.length === 0 ? '[]' : fn.pipe(
//           z,
//           map(([y, _]) => {
//           })
//         )
//       }
//       // fn.tap("is array")(
//       //   z.length === 0 ? '[]' :
//       //   fn.pipe(
//       //     z.map((y) => loop(y, { ...$, INDENT: $.OFFSET + $.INDENT })),
//       //     (ys) => ys.join(
//       //       notTooLong(ys)
//       //       ? ', '
//       //       : (console.log("other branch", ys), `,\n${$.__.repeat($.LEFT)} * ${$.__.repeat($.OFFSET)}`)
//       //     ),
//       //     (s) => notTooLong(s) ? s
//       //     : (console.log('other branch', s), string.between(
//       //       `\n${$.__.repeat($.LEFT)} * ${$.__.repeat($.OFFSET)}`,
//       //       `\n${$.__.repeat($.RIGHT)} * ${$.__.repeat($.OFFSET - $.INDENT)}`
//       //     )(s)),
//       //     (s) => fn.pipe(
//       //       s,
//       //       string.between(''
//       //         + '['
//       //         +  ( notTooLong(s) ? $.BRACK : '' )
//       //         ,  ( notTooLong(s) ? $.BRACK : '' )
//       //         + ']',
//       //       )
//       //     )
//       //   )
//       // )
//       case is.object(z): return (console.log("is object", z), fn.pipe(
//         globalThis.Object.entries(z),
//         (xs) => xs.length === 0 ? '{}' :
//         fn.pipe(
//           xs,
//           map(([k, v]) => object.parseKey(k) + ':' + $.KV + loop(v, { ...$, INDENT: $.OFFSET+ $.INDENT })),
//           (xs) => xs.join(
//             notTooLong(xs)
//             ? ', '
//             : `,\n${$.__.repeat($.LEFT)} * ${$.__.repeat($.OFFSET)}`
//           ),
//           (s) => notTooLong(s) ? s
//           : string.between(
//             `\n${$.__.repeat($.LEFT)} * ${$.__.repeat($.OFFSET)}`,
//             `\n${$.__.repeat($.LEFT)} * ${$.__.repeat($.OFFSET - $.INDENT)}`,
//           )(s),
//           (s) => string.between(''
//             + '{'
//             +  ( notTooLong(s) ? $.BRACE : '' )
//             ,  ( notTooLong(s) ? $.BRACE : '' )
//             + '}',
//           )(s)
//         )
//       ))
//       case is.nonnullable(z): return ''
//     }
//     function notTooLong(ss: string | string[]): boolean {
//       const out = $.MAX
//         > 0
//         + ' * '.length
//         + $.OFFSET
//         + (typeof ss === 'string' ? ss : ss.join()).length
//         console.log("not too long out for input: ", ss, out)
//       return out
//     }
// })
// const multiline_ = ($: multiline.Internal) => {
//   const before = ''
//       + wrapWith[0]
//       + `${$.__.repeat($.LEFT)} * ${$.__.repeat($.RIGHT)}`
//   const after = wrapWith[1]
//   // const f = Json.fold(algebra({ ...$, INDENT: $.RIGHT + $.INDENT }))
//   const alg = (_: {} | null | undefined) => loop(_, $)
//   return fn.flow(
//     Json.foldWithPrevious(alg),
//     (_) => before + _ + after,
//   )
// }
// function parseOptions($: Options = multiline.defaults): multiline.Internal {
//   const { BRACE, BRACK, KV, WS, WRAP, ...options } = {
//     INDENT: $?.indent ?? defaults.indent,
//     LEFT: $?.leftMargin ?? defaults.leftMargin,
//     RIGHT: $?.leftPadding ?? defaults.leftPadding,
//     MAX: $?.maxWidth ?? defaults.maxWidth,
//     BRACE: $?.bracesSeparator ?? defaults.bracesSeparator,
//     BRACK: $?.bracketsSeparator ?? defaults.bracesSeparator,
//     KV: $?.keyValueSeparator ?? defaults.keyValueSeparator,
//     WS: $?.whitespaceUnit ?? defaults.whitespaceUnit,
//     WRAP: $?.wrapWith || defaults.wrapWith,
//   }
//   const INDENT = Math.max(options.INDENT, 0)
//   const LEFT = Math.max(options.LEFT, 0)
//   const RIGHT = Math.max(options.RIGHT, 0)
//   const MAX = Math.max(options.MAX, 10)
//   const __ = WS.repeat(INDENT)
//   return {
//     OFFSET: 0,
//     INDENT,
//     LEFT,
//     RIGHT,
//     MAX,
//     BRACE,
//     BRACK,
//     KV,
//     WS,
//     __,
//     WRAP,
//   }
// }
// void (multiline.defaults = defaults)
// /**
//  * ## {@link multiline `Format.multiline`}
//  *
//  * Generates a JavaScript comment spanning many (zero or more) lines.
//  *
//  * Output format can be configured via
//  * {@link Options `Options`}.
//  */
// export function multiline(input: Json, options?: Options): string
// export function multiline(x: Json, $?: Options): string {
//   console.log(parseOptions($))
//   return multiline_(parseOptions($))(x as Json)
// }
// export declare namespace multiline {
//   /**
//    * ### {@link Options `Options`}
//    */
//   type Options = { [K in keyof Config]+?: Config[K] }

//   interface Config extends inline<{ [K in keyof typeof defaults]: Widen<typeof defaults[K]> }> {}
//   type Internal =  {
//     INDENT: number;
//     LEFT: number;
//     RIGHT: number;
//     MAX: number;
//     BRACE: string;
//     BRACK: string;
//     KV: string;
//     WS: string;
//     __: string;
//     WRAP: [before: string, after: string];
//     OFFSET: number
//   }
// }
//   // never | {
//   //   indent?: number
//   //   leftMargin?: number
//   //   leftPadding?: number
//   //   bracesSeparator?: string
//   //   bracketsSeparator?: string
//   //   keyValueSeparator?: string
//   //   whitespaceUnit?: string
//   //   wrapWith?: [before: string, after: string]
//   //   maxWidth?: number
//   // }
// // function algebra($: multiline.Internal): Functor.Algebra<Json.lambda, string> {
// //   return fn.loopN<[x: {} | null | undefined, offset: number], string>(
// //     (z, offset, loop) => {
// //       console.log('looping', z)
// //       switch (true) {
// //         default: return fn.exhaustive(z)
// //         case is.null(z):
// //         case is.undefined(z):
// //         case is.boolean(z):
// //         case is.number(z): return `${z}`
// //         case is.string(z): return `"${z}"`
// //         case is.array(z): return fn.tap("is array")(
// //           z.length === 0 ? '[]' :
// //           fn.pipe(
// //             z.map((y) => loop(y, offset + $.INDENT)),
// //             (ys) => ys.join(
// //               notTooLong(ys)
// //               ? ', '
// //               : (console.log("other branch", ys), `,\n${$.__.repeat($.LEFT)} * ${$.__.repeat(offset)}`)
// //             ),
// //             (s) => notTooLong(s) ? s
// //             : (console.log('other branch', s), string.between(
// //               `\n${$.__.repeat($.LEFT)} * ${$.__.repeat(offset)}`,
// //               `\n${$.__.repeat($.RIGHT)} * ${$.__.repeat(offset - $.INDENT)}`
// //             )(s)),
// //             (s) => fn.pipe(
// //               s,
// //               string.between(''
// //                 + '['
// //                 +  ( notTooLong(s) ? $.BRACK : '' )
// //                 ,  ( notTooLong(s) ? $.BRACK : '' )
// //                 + ']',
// //               )
// //             )
// //           )
// //         )
// //         case is.object(z): return (console.log("is object", z), fn.pipe(
// //           globalThis.Object.entries(z),
// //           (xs) => xs.length === 0 ? '{}' :
// //           fn.pipe(
// //             xs,
// //             map(([k, v]) => object.parseKey(k) + ':' + $.KV + loop(v, offset + $.INDENT)),
// //             (xs) => xs.join(
// //               notTooLong(xs)
// //               ? ', '
// //               : `,\n${$.__.repeat($.LEFT)} * ${$.__.repeat(offset)}`
// //             ),
// //             (s) => notTooLong(s) ? s
// //             : string.between(
// //               `\n${$.__.repeat($.LEFT)} * ${$.__.repeat(offset)}`,
// //               `\n${$.__.repeat($.LEFT)} * ${$.__.repeat(offset - $.INDENT)}`,
// //             )(s),
// //             (s) => string.between(''
// //               + '{'
// //               +  ( notTooLong(s) ? $.BRACE : '' )
// //               ,  ( notTooLong(s) ? $.BRACE : '' )
// //               + '}',
// //             )(s)
// //           )
// //         ))
// //         case is.nonnullable(z): return ''
// //       }
// //       function notTooLong(ss: string | string[]): boolean {
// //         const out = $.MAX
// //           > 0
// //           + ' * '.length
// //           + offset
// //           + (typeof ss === 'string' ? ss : ss.join()).length
// //           console.log("not too long out for input: ", ss, out)
// //         return out
// //       }
// //     }
// //   )
// // }
// // function multiline(u: {} | null | undefined, options?: Options): string
// // export function multiline(
// //   u: {} | null | undefined, {
// //     indent: _indent = defaults.indent,
// //     leftMargin: _left = defaults.leftMargin,
// //     leftPadding: _right = defaults.leftPadding,
// //     maxWidth: _maxWidth = defaults.maxWidth,
// //     bracesSeparator: BRACE = defaults.bracesSeparator,
// //     bracketsSeparator: BRACK = defaults.bracesSeparator,
// //     keyValueSeparator: KV = defaults.keyValueSeparator,
// //     whitespaceUnit: _whitespaceUnit = defaults.whitespaceUnit,
// //     wrapWith = defaults.wrapWith,
// //   }: Options = multiline_defaults
// // ) {
// //   const indent = Math.max(_indent, 0)
// //   const lhsOffset = Math.max(_left, 0)
// //   const rhsOffset = Math.max(_right, 0)
// //   const maxWidth = Math.max(_maxWidth, 10)
// //   const __ = _whitespaceUnit.repeat(indent)
// //   const loop = fn.loopN<[x: {} | null | undefined, offset: number], string>(
// //     (x, offset, loop) => {
// //       switch (true) {
// //         default: return fn.exhaustive(x)
// //         case is.null(x):
// //         case is.undefined(x):
// //         case is.boolean(x):
// //         case is.number(x): return `${x}`
// //         case is.string(x): return `"${x}"`
// //         case is.array(x): return (
// //           x.length === 0 ? '[]' :
// //           fn.pipe(
// //             x.map((u) => loop(u, offset + indent)),
// //             (xs) => xs.join(
// //               notTooLong(xs)
// //               ? `, `
// //               : `,\n${__.repeat(lhsOffset)} * ${__.repeat(offset)}`
// //             ),
// //             (s) => notTooLong(s) ? s
// //             : string.between(
// //               `\n${__.repeat(lhsOffset)} * ${__.repeat(offset)}`,
// //               `\n${__.repeat(rhsOffset)} * ${__.repeat(offset - indent)}`
// //             )(s),
// //             (s) => fn.pipe(
// //               s,
// //               string.between(''
// //                 + '['
// //                 +  ( notTooLong(s) ? BRACK : '' )
// //                 ,  ( notTooLong(s) ? BRACK : '' )
// //                 + ']',
// //               )
// //             )
// //           )
// //         )
// //         case is.object(x): return fn.pipe(
// //           globalThis.Object.entries(x),
// //           (xs) => xs.length === 0 ? '{}' :
// //           fn.pipe(
// //             xs,
// //             map(([k, v]) => object.parseKey(k) + ':' + KV + loop(v, offset + indent)),
// //             (xs) => xs.join(
// //               notTooLong(xs)
// //               ? ', '
// //               : `,\n${__.repeat(lhsOffset)} * ${__.repeat(offset)}`
// //             ),
// //             (s) => notTooLong(s) ? s
// //             : string.between(
// //               `\n${__.repeat(lhsOffset)} * ${__.repeat(offset)}`,
// //               `\n${__.repeat(lhsOffset)} * ${__.repeat(offset - indent)}`,
// //             )(s),
// //             (s) => string.between(''
// //               + '{'
// //               +  ( notTooLong(s) ? BRACE : '' )
// //               ,  ( notTooLong(s) ? BRACE : '' )
// //               + '}',
// //             )(s)
// //           )
// //         )
// //         case is.nonnullable(x): return ''
// //       }
// //       function notTooLong(ss: string | string[]): boolean {
// //         return maxWidth
// //           > 0
// //           + ' * '.length
// //           + offset
// //           + (typeof ss === 'string' ? ss : ss.join()).length
// //       }
// //     }
// //   )
// //   return ''
// //     + wrapWith[0]
// //     + `${__.repeat(lhsOffset)} * ${__.repeat(rhsOffset)}`
// //     + loop(u, rhsOffset + indent)
// //     + wrapWith[1]
// // }
