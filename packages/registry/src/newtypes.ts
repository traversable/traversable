import type { newtype } from "any-ts"

import type { jsdoc } from "./utf-16.js"

/**
 * ## {@link Unit `Unit`}
 * ### ｛ {@link jsdoc.unit `()`} ｝
 *
 * See also:
 * - wiki page for [the Unit type](https://en.wikipedia.org/wiki/Unit_type)
 */
export interface Unit<_carrier = never> extends newtype<never> {}

export declare namespace string {
  export {
    ascii,
    base64,
    char,
    cuid,
    cuid2,
    date,
    datetime,
    dirname,
    duration,
    email,
    empty,
    emoji,
    filename,
    ip,
    nanoid,
    pathname,
    regex,
    query,
    time,
    ulid,
    url,
    utf8,
    utf16,
    uuid,
  }
}

export declare namespace number {
  export {
    negative, // namespace
    float,
    integer,
    Infinity,
    NaN,
    natural,
    zero,
  }
}

/**
 * ## {@link ascii `string.ascii`}
 * Ref: [RFC-20](https://datatracker.ietf.org/doc/html/rfc20)
 */
interface ascii<ascii = string> extends newtype<string> {}

/**
 * ## {@link base64 `string.base64`}
 */
interface base64<base64 = string> extends newtype<string> {}

/**
 * ## {@link char `string.char`}
 */
interface char<char = string> extends newtype<string> {}

/**
 * ## {@link cuid `string.cuid`}
 */
interface cuid<cuid = string> extends newtype<string> {}

/**
 * ## {@link cuid2 `string.cuid2`}
 */
interface cuid2<cuid2 = string> extends newtype<string> {}

/**
 * ## {@link date `string.date`}
 */
interface date<date = string> extends newtype<string> {}

/**
 * ## {@link datetime `string.datetime`}
 */
interface datetime<datetime = string> extends newtype<string> {}

/**
 * ## {@link dirname `string.dirname`}
 */
interface dirname<dirname = string> extends newtype<string> {}

/**
 * ## {@link duration `string.duration`}
 */
interface duration<duration = string> extends newtype<string> {}

/**
 * ## {@link email `string.email`}
 */
interface email<email = string> extends newtype<string> {}

/**
 * ## {@link empty `string.empty`}
 * ### ｛ {@link jsdoc.epsilon `ε`}, {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 */
interface empty<ε = ""> extends newtype<""> {}

/**
 * ## {@link emoji `string.emoji`}
 */
interface emoji<emoji = string> extends newtype<string> {}

/**
 * ## {@link filename `string.filename`}
 */
interface filename<filename = string> extends newtype<string> {}

/**
 * ## {@link ip `string.ip`}
 */
interface ip<ip = string> extends newtype<string> {}

/**
 * ## {@link nanoid `string.nanoid`}
 */
interface nanoid<nanoid = string> extends newtype<string> {}

/**
 * ## {@link pathname `string.pathname`}
 */
interface pathname<pathname = string> extends newtype<string> {}

/**
 * ## {@link regex `string.regex`}
 */
interface regex<regex = string> extends newtype<string> {}

/**
 * ## {@link query `string.query`}
 */
interface query<query = string> extends newtype<string> {}

/**
 * ## {@link time `string.time`}
 */
interface time<time = string> extends newtype<string> {}

/**
 * ## {@link ulid `string.ulid`}
 */
interface ulid<ulid = string> extends newtype<string> {}

/**
 * ## {@link url `string.url`}
 */
interface url<url = string> extends newtype<string> {}

/**
 * ## {@link utf8 `string.utf16`}
 */
interface utf16<utf16 = string> extends newtype<string> {}

/**
 * ## {@link utf16 `string.utf16`}
 */
interface utf8<utf8 = string> extends newtype<string> {}

/**
 * ## {@link uuid `string.uuid`}
 */
interface uuid<uuid = string> extends newtype<string> {}

/**
 * {@link natural `number.natural`}
 * ### ｛ {@link jsdoc.integer `ℤ`}, {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 *
 * See also:
 * - the wiki for [natural numbers](https://en.wikipedia.org/wiki/Natural_number)
 */
interface natural<_Max = never> extends newtype<number> {}

/**
 * ## {@link integer `number.integer`}
 * ### ｛ {@link jsdoc.integer `ℤ`}, {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 *
 * A signed, 64-bit number representation.
 *
 * 1. {@link integer `integer`} is a [newtype](https://doc.rust-lang.org/rust-by-example/generics/new_types.html)
 * that inherits from {@link globalThis.Number.prototype `Number.prototype`}, but
 * preserves (at the type-level) what is otherwise lost: that the value it represents
 * is a whole number.
 *
 * 2. The {@link integer `integer`} function constructs an {@link integer `integer`} from
 * an arbitrary JavaScript number.
 *
 * In most contexts, an {@link integer `integer`} and a regular number can be used
 * interchangably, but sometimes you'll need to explicitly "unwrap" an {@link integer `integer`}
 * to "forget" that information -- see the example below.
 *
 * > **Note:** to convert an {@link integer `integer`} to a TypeScript number, you can use the
 *   [unary plus](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unary_plus)
 *   operator (e.g., `+ myInteger`).
 *
 * > **Note:** `number -> integer` is _lossy_. For a constructor that preserves the integer exponent
 * of its argument, see {@link float `number.float`.}
 *
 * See also:
 * - [Reference](https://en.wikipedia.org/wiki/Integer_(computer_science))
 *
 * @example
 *  import { integer } from "@traversable/data"
 *
 *  const coinToss = () => integer(Math.random())
 *
 *  const ex_01 = coinToss()
 *  //    ^? const ex_01: integer
 *
 *  const ex_02 = coinToss()
 *  //    ^? const ex_02: integer
 *
 *  // integers can be compared using infix operators like `>`, `>=`, `<` and `<=`, like regular numbers:
 *  if (ex_01 > ex_02) {
 *    // integers can be interpolated:
 *    console.log(`${ex_01} is greater than ${ex_02}`)
 *  }
 *
 *  // if you need to pass an integer to a function that expects a number, you can use the _unary plus operator_ (a.k.a.
 *  // ["prefix plus"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unary_plus):
 *  const ex_03 = Math.max(ex_01, ex_02)
 *  //                     ^^^^ 🚫 Argument of type 'integer' is not assignable to parameter of type 'number'
 *
 *  //                     ↓ ✅     ↓ ✅
 *  const ex_04 = Math.max(+ ex_01, + ex_02)
 *  //    ^? const ex_04: number
 *
 *  // you can also use `valueOf`:
 *  //                            ↓ ✅             ↓ ✅
 *  const ex_05 = Math.max(ex_01.valueOf(), ex_02.valueOf())
 *  //    ^? const ex_05: number
 */
export interface integer<ℤ = number> extends newtype<number> {}

/**
 * ## {@link float `number.float`}
 * ### ｛ {@link jsdoc.real `ℝ`}, {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 * -----
 * 1. {@link float `float`} is a [newtype](https://doc.rust-lang.org/rust-by-example/generics/new_types.html)
 * that inherits from {@link globalThis.Number.prototype `Number.prototype`} and represents an exponential
 * number (a number with a non-zero number after the decimal point).
 *
 * 2. The {@link float `float`} function constructs a {@link float `float`} (or
 * "floating point" or "real" number) from an arbitrary JavaScript number.
 *
 * In most contexts, a {@link float `float`} and a regular number can be used
 * interchangably, but sometimes you'll need to "unwrap" a {@link float `float`}
 * to explicitly "forget" that -- see the example below.
 *
 * - [Reference](https://en.wikipedia.org/wiki/Floating-point_arithmetic)
 * - See also, {@link integer `number.integer`}
 */
interface float<ℝ = number> extends newtype<number> {}

/**
 * ## {@link NaN `number.NaN`}
 * ### ｛ {@link jsdoc.empty ` ️🕳️‍ `}, {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 */
interface NaN<NaN = number> extends newtype<number> {}

/**
 * ## {@link Infinity `number.Infinity`}
 * ### ｛ {@link jsdoc.infinity `+∞`}, {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 */
interface Infinity<_ = typeof Number.POSITIVE_INFINITY> extends newtype<number> {}

/**
 * ## {@link zero `number.zero`}
 * ### ｛ {@link jsdoc.empty ` 🕳️‍ `}, {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 */
interface zero<_ = 0> extends newtype<number> {}

declare namespace negative {
  /**
   * ## {@link Infinity `number.negative.Infinity`}
   * ### ｛ {@link jsdoc.infinity `-∞`}, {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
   */
  interface Infinity<_ = typeof Number.NEGATIVE_INFINITY> extends newtype<number> {}

  /**
   * ## {@link zero `number.negative.zero`}
   * ### ｛ {@link jsdoc.empty ` 🕳️‍ `}, {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
   * See also:
   * - [zero element](https://en.wikipedia.org/wiki/Zero_element)
   */
  interface zero<_ = -0> extends newtype<number> {}
}
