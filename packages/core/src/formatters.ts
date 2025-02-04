import { fn, map, object, string } from "@traversable/data"

import { is } from "./guard/exports.js"
import type { Json } from "./json.js"

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
 * ### {@link defaults.handlers `multiline.Options.handlers`}
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
          : `,\n${$.whitespaceUnit.repeat($.leftOffset)} * ${$.whitespaceUnit.repeat($.offset)}`
        ),
        (s) => notTooLong($.maxWidth, $.offset)(s) ? s
        : string.between(
          `\n${$.whitespaceUnit.repeat($.leftOffset)} * ${$.whitespaceUnit.repeat($.offset)}`,
          `\n${$.whitespaceUnit.repeat($.rightOffset)} * ${$.whitespaceUnit.repeat($.offset - $.indent)}`
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
          : `,\n${$.whitespaceUnit.repeat($.leftOffset)} * ${$.whitespaceUnit.repeat($.offset)}`
        ),
        (s) => notTooLong($.maxWidth, $.offset)(s) ? s
        : string.between(
          `\n${$.whitespaceUnit.repeat($.leftOffset)} * ${$.whitespaceUnit.repeat($.offset)}`,
          `\n${$.whitespaceUnit.repeat($.leftOffset)} * ${$.whitespaceUnit.repeat($.offset - $.indent)}`,
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
} as const satisfies Record<Tag, (loop: Loop<string>) => (node: never, config: multiline.Config) => string>

const defaults = {
  /**
   * ### {@link defaults.indent `multiline.Options.indent`}
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
  indent: 1,
  /**
   * ### {@link defaults.leftOffset `multiline.Options.leftOffset`}
   *
   * Configures how many
   * {@link defaults.whitespaceUnit `Options.whitespaceUnit`}s
   * should be used when left-indenting.
   *
   * Note that _left_ in this context means "on the lefthand side of the `*` separator".
   *
   * If unspecified, defaults to {@link defaults.leftOffset `defaults.leftOffset`}.
   *
   * @example
   *  import { Format } from "@traversable/core"
   *  import * as vi from "vitest"
   *
   *  vi.expect(Format.multiline([1, [2, [3]]], { leftOffset: 4 }))
   *    .toMatchInlineSnapshot(`"     * [ 1, [ 2, [ 3 ] ] ]"`)
   */
  leftOffset: 0,
  /**
   * ### {@link defaults.rightOffset `multiline.Options.rightOffset`}
   *
   * Configures how many
   * {@link defaults.whitespaceUnit `Options.whitespaceUnit`}s
   * should be used when right-indenting.
   *
   * Note that _right_ in this context means "on the righthand side of the `*` separator".
   *
   * If unspecified, defaults to {@link defaults.rightOffset `defaults.rightOffset`}.
   *
   * @example
   *  import { Format } from "@traversable/core"
   *  import * as vi from "vitest"
   *
   *  vi.expect(Format.multiline([1, [2, [3]]], { rightOffset: 4 }))
   *    .toMatchInlineSnapshot(`" *     [ 1, [ 2, [ 3 ] ] ]"`)
   */
  rightOffset: 0,
  /**
   * ### {@link defaults.bracesSeparator `multiline.Options.bracesSeparator`}
   *
   * Configures what character (or characters) should be used when separating object
   * braces (`"{"` and `"}"`) from their contents
   *
   * If unspecified, defaults to
   * {@link defaults.bracesSeparator `defaults.bracesSeparator`}.
   */
  bracesSeparator: ' ',
  /**
   * ### {@link defaults.bracketsSeparator `multiline.Options.bracketsSeparator`}
   *
   * Configures what character (or characters) should be used when separating array
   * brackets (`"["` and `"]"`) from their contents
   *
   * If unspecified, defaults to
   * {@link defaults.bracketsSeparator `defaults.bracketsSeparator`}.
   */
  bracketsSeparator: ' ',
  /**
   * ### {@link defaults.keyValueSeparator `multiline.Options.keyValueSeparator`}
   *
   * Configures what character (or characters) should be used when separating properties,
   * i.e., what comes after the key + colon (`":"`), but before the value.
   *
   * If unspecified, defaults to
   * {@link defaults.keyValueSeparator `defaults.keyValueSeparator`}.
   */
  keyValueSeparator: ' ',
  /**
   * ### {@link defaults.maxWidth `multiline.Options.maxWidth`}
   *
   * Configures the line's maximum width (how many characters before a forced linebreak).
   *
   * If unspecified, defaults to {@link defaults.maxWidth `defaults.maxWidth`}.
   */
  maxWidth: 100,
  /**
   * ### {@link defaults.wrapWith `multiline.Options.wrapWith`}
   *
   * If specified, the final output string will be sandwiched between the left and
   * right elements of {@link defaults.wrapWith `Options.wrapWith`}.
   *
   * If unspecified, defaults to {@link wrapWith `defaults.wrapWith`}.
   */
  wrapWith,
  /**
   * ### {@link defaults.whitespaceUnit `multiline.Options.whitespaceUnit`}
   *
   * The whitespace unit represents a "space", and acts as the "multiplier" that all of
   * the numeric options use to determine how much whitespace to render. For example,
   * an {@link defaults.whitespaceUnit `Options.whitespaceUnit`} of `"---"`
   * with an {@link defaults.leftOffset `Options.leftOffset`} of `2` produces
   * a left gutter of `6` hyphens, i.e. `"------"`.
   *
   * If unspecified, defaults to {@link defaults.whitespaceUnit `defaults.whitespaceUnit`}.
   */
  whitespaceUnit: ' ',
}

/**
 * ## {@link multiline `Format.multiline`}
 *
 * Given some arbitrary JSON value, generates a well-formatted multiline-comment
 * (a comment spanning zero or more lines).
 *
 * By default, formatting is optimized for readability and stable diffs.
 *
 * At its core, {@link multiline `multiline`} is unopinionated about how formatting should happen.
 *
 * If you choose not to write your own handlers, {@link multiline `multiline`} will apply an
 * opinonated set of defaults that have been tailored to `@traversable`'s primary
 * use case: generating `@example` tags in JSDoc annotations.
 */
export function multiline(u: {} | null | undefined, options?: multiline.Options): string
export function multiline(
  u: {} | null | undefined, {
    indent: _indent = defaults.indent,
    leftOffset: _leftOffset = defaults.leftOffset,
    rightOffset: _rightOffset = defaults.rightOffset,
    maxWidth: _maxWidth = defaults.maxWidth,
    bracesSeparator = defaults.bracesSeparator,
    bracketsSeparator = defaults.bracesSeparator,
    keyValueSeparator = defaults.keyValueSeparator,
    whitespaceUnit = defaults.whitespaceUnit,
    wrapWith = defaults.wrapWith,
    handlers: userDefs,
  }: multiline.Options = defaults
) {
  const indent = Math.max(_indent, 0)
  const leftOffset = Math.max(_leftOffset, 0)
  const rightOffset = Math.max(_rightOffset, 0)
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
    leftOffset,
    rightOffset,
    indent,
  } satisfies Omit<multiline.Config, "handlers" | "offset">
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
    + `${$.whitespaceUnit.repeat($.leftOffset)} * ${$.whitespaceUnit.repeat($.rightOffset)}`
    + loop(u, $.rightOffset + indent)
    + wrapWith[1]
}

function notTooLong(maxWidth: number, offset: number): (ss: string | string[]) => boolean {
  return (ss) => maxWidth
    > 0
    + ' * '.length
    + offset
    + (typeof ss === 'string' ? ss : ss.join()).length
}

void (multiline.defaults = defaults)
export declare namespace multiline {
  type Options =
    & { handlers?: Handlers }
    & Partial<typeof defaults>
  type Config =
    & { handlers: { [K in keyof typeof defaultHandlers]: ReturnType<typeof defaultHandlers[K]> } }
    & { offset: number }
    & typeof defaults
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
// function parseOptions($: multiline.Options = multiline.defaults): multiline.Internal {
//   const { BRACE, BRACK, KV, WS, WRAP, ...options } = {
//     INDENT: $?.indent ?? defaults.indent,
//     LEFT: $?.leftOffset ?? defaults.leftOffset,
//     RIGHT: $?.rightOffset ?? defaults.rightOffset,
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
//  * {@link multiline.Options `multiline.Options`}.
//  */
// export function multiline(input: Json, options?: multiline.Options): string
// export function multiline(x: Json, $?: multiline.Options): string {
//   console.log(parseOptions($))
//   return multiline_(parseOptions($))(x as Json)
// }
// export declare namespace multiline {
//   /**
//    * ### {@link multiline.Options `multiline.Options`}
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
//   //   leftOffset?: number
//   //   rightOffset?: number
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
// // function multiline(u: {} | null | undefined, options?: multiline.Options): string
// // export function multiline(
// //   u: {} | null | undefined, {
// //     indent: _indent = defaults.indent,
// //     leftOffset: _left = defaults.leftOffset,
// //     rightOffset: _right = defaults.rightOffset,
// //     maxWidth: _maxWidth = defaults.maxWidth,
// //     bracesSeparator: BRACE = defaults.bracesSeparator,
// //     bracketsSeparator: BRACK = defaults.bracesSeparator,
// //     keyValueSeparator: KV = defaults.keyValueSeparator,
// //     whitespaceUnit: _whitespaceUnit = defaults.whitespaceUnit,
// //     wrapWith = defaults.wrapWith,
// //   }: multiline.Options = multiline_defaults
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
