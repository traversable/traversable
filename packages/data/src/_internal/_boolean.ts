import type { boolean } from "../boolean.js"
import type { jsdoc } from "./_unicode.js"

/**
 * ### {@link nonfinite `boolean.nonfinite`}
 * 
 * {@link nonfinite `boolean.nonfinite`} constrains a type parameter to be a 
 * _non-literal boolean_ (`boolean` is allowed, `true` and `false` are not).
 * 
 * **Note:** For this to work, you need to apply {@link nonfinite `boolean.nonfinite`}
 * to the type parameter you're _currently_ declaring, see example below.
 * 
 * See also:
 * - {@link finite `boolean.finite`}
 * 
 * @example
 *  import type { boolean } from "@traversable/data"
 *  
 *  function noLiteralsAllowed<T extends boolean.nonfinite<T>>(boolean: T) { return !boolean }
 * 
 *  noLiteralsAllowed(false)               // 🚫
 *  noLiteralsAllowed(true)                // 🚫
 *  noLiteralsAllowed(Math.random() > 0.5) // ✅
 */
export type nonfinite<T> = [boolean] extends [T] ? never : [T] extends [boolean] ? boolean : never

/**
 * ### {@link finite `boolean.finite`}
 * 
 * {@link finite `boolean.finite`} constrains a type parameter to be a _literal_ 
 * boolean (`true` or `false`, but not `boolean`).
 * 
 * **Note:** For this to work, you need to apply {@link finite `boolean.finite`}
 * to the type parameter you're _currently_ declaring, see example below.
 * 
 * See also:
 * - {@link nonfinite `boolean.nonfinite`}
 * 
 * @example
 *  import type { boolean } from "@traversable/data"
 *  
 *  function onlyLiteralsAllowed<T extends boolean.finite<T>>(boolean: T) { return !boolean }
 * 
 *  onlyLiteralsAllowed(false)               // ✅
 *  onlyLiteralsAllowed(true)                // ✅
 *  onlyLiteralsAllowed(Math.random() > 0.5) // 🚫
 */
export type finite<T> = [T] extends [boolean] ? [boolean] extends [T] ? never : boolean : never

/**
 * ### {@link is `boolean.is`}
 * #### ｛ {@link jsdoc.guard ` ️🦺‍ ` } ｝
 *
 * Narrows the type of its argument to `boolean`.
 * 
 * See also:
 * - {@link globalThis.Boolean `globalThis.Boolean`}
 */
export const is = (u: unknown): u is boolean => typeof u === "boolean"

/**
 * ### {@link isTrue `boolean.isTrue`}
 * #### ｛ {@link jsdoc.guard ` ️🦺‍ ` } ｝
 *
 * Narrows the type of its argument to `true`.
 * 
 * See also:
 * - {@link is `boolean.is`}
 * - {@link isFalse `boolean.isFalse`}
 */
export const isTrue = (u: unknown): u is true => u === true

/**
 * ### {@link isFalse `boolean.isFalse`}
 * #### ｛ {@link jsdoc.guard ` ️🦺‍ ` } ｝
 *
 * Narrows the type of its argument to `false`.
 *
 * See also:
 * - {@link is `boolean.is`}
 * - {@link isTrue `boolean.isTrue`}
 */
export const isFalse = (u: unknown): u is false => u === false

/**
 * ### {@link of `boolean.of`}
 * 
 * Constructs/coerces a boolean from an arbitrary value.
 * 
 * See also:
 * - {@link globalThis.Boolean `globalThis.Boolean`}
 */
export function of<T extends boolean.finite<T>>(finite: T): T
export function of(nonfinite: boolean): boolean
export function of(nonfinite: unknown): boolean
export function of(x: unknown) { return globalThis.Boolean(x) }

/**
 * ### {@link not `boolean.not`}
 * 
 * Implementation of [logical negation](https://en.wikipedia.org/wiki/Negation).
 */
export function not<T extends boolean.finite<T>>(boolean: T): not<T>
export function not(boolean: boolean): boolean
export function not(boolean: boolean) { return !boolean }
export type not<T> = [T] extends [true] ? false : [T] extends [false] ? true : never

/**
 * ### {@link and `boolean.and`}
 * 
 * Implementation of [logical conjunction](https://en.wikipedia.org/wiki/Logical_conjunction).
 */
export function and<L extends boolean.finite<L>, R extends boolean.finite<R>>(left: L, right: R): and<L, R>
export function and(left: boolean, right: boolean): boolean
export function and(left: boolean, right: boolean) { return left && right }
export type and<L, R> = [L, R] extends [true, true] ? true : false 
/** 
 * ### {@link and_curried `boolean.and.defer`}
 * 
 * Curried form (supports partial application) of {@link or `boolean.or`}.
 * 
 * **Use case:** More ergonomic/terse when used in a composition pipeline. 
 * 
 * **Tradeoff:** Cost is a small (but non-zero) runtime overhead.
 */
function and_curried<R extends boolean.finite<R>>(right: R): {
  <L extends boolean.finite<L>>(left: L): and<L, R>
  (left: boolean): boolean
}
function and_curried(right: boolean): (left: boolean) => boolean
function and_curried<R extends boolean.finite<R>>(right: R) { 
  return (left: boolean) => and(left, right)
}
void (and.defer = and_curried)

/** 
 * ### {@link or `boolean.or`}
 * 
 * Implementation of [logical disjunction](https://en.wikipedia.org/wiki/Logical_disjunction).
 */
export function or<L extends boolean.finite<L>, R extends boolean.finite<R>>(left: L, right: R): or<L, R>
export function or(left: boolean, right: boolean): boolean
export function or(left: boolean, right: boolean) { return left || right }
export type or<L, R> = [L] extends [true] ? true : [R] extends [true] ? true : false
/** 
 * ### {@link or_curried `boolean.or.defer`}
 * 
 * Curried form (supports partial application) of {@link or `boolean.or`}.
 * 
 * **Use case:** More ergonomic/terse when used in a composition pipeline. 
 * 
 * **Tradeoff:** Cost is a small (but non-zero) runtime overhead.
 */
function or_curried<R extends boolean.finite<R>>(right: R): {
  <L extends boolean.finite<L>>(left: L): or<L, R>
  (right: boolean): boolean
}
function or_curried(left: boolean): (right: boolean) => boolean
function or_curried<R extends boolean.finite<R>>(right: R) {
  return (left: boolean) => or(left, right)
}
void (or.defer = or_curried)

/** 
 * ### {@link xor `boolean.xor`}
 * 
 * Implementation of [logical xor](https://en.wikipedia.org/wiki/Exclusive_or).
 * 
 * @example
 *  import { boolean } from "@traversable/data"
 * 
 *  const ex_01 = boolean.xor(Math.random() > 0.5, Math.random() > 0.5)
 *  //     ^? const ex_01: boolean
 *  const ex_02 = boolean.xor(true, true)
 *  //     ^? const ex_02: false
 *  const ex_03 = boolean.xor(false, false)
 *  //     ^? const ex_03: false
 *  const ex_04 = boolean.xor(false, true)
 *  //     ^? const ex_04: true
 *  const ex_05 = boolean.xor(true, false)
 *  //     ^? const ex_05: true
 */
export function xor<L extends boolean.finite<L>, R extends boolean.finite<R>>(left: L, right: R): xor<L, R>
export function xor(left: boolean, right: boolean): boolean
export function xor(left: boolean, right: boolean) { return (left && !right) || (right && !left) }
export type xor<L, R> = [L, R] extends [true, false] ? true : [L, R] extends [false, true] ? true : false
/**
 * ### {@link xor_curried `boolean.xor.defer`}
 * 
 * Curried form (supports partial application) of {@link xor `boolean.xor`}.
 * 
 * **Use case:** More ergonomic/terse when used in a composition pipeline. 
 * 
 * **Tradeoff:** Cost is a small (but non-zero) runtime overhead.
 */
function xor_curried<L extends boolean.finite<L>>(left: L): {
  <R extends boolean.finite<R>>(right: R): xor<L, R>
  (right: boolean): boolean
}
function xor_curried(left: boolean): (right: boolean) => boolean
function xor_curried(left: boolean) { return (right: boolean) => xor(left, right) as never }
void (xor.defer = xor_curried)

/** 
 * ### {@link nor `boolean.nor`}
 * 
 * Returns `true` when both arguments are `false`.
 * 
 * See also: 
 * - [logical nor](https://en.wikipedia.org/wiki/Logical_NOR).
 */
export function nor<L extends boolean.finite<L>, R extends boolean.finite<R>>(left: L, right: R): nor<L, R>
export function nor(left: boolean, right: boolean): boolean
export function nor(left: boolean, right: boolean) { return left === false && right === false }
export type nor<L, R> = [L, R] extends [false, false] ? true : false

/** 
 * ### {@link nor_curried `boolean.nor.defer`}
 * 
 * Curried form (supports partial application) of {@link nor `boolean.nor`}.
 * 
 * **Use case:** More ergonomic/terse when used in a composition pipeline. 
 * 
 * **Tradeoff:** Cost is a small (but non-zero) runtime overhead.
 */
function nor_curried<L extends boolean.finite<L>>(left: L): {
  <R extends boolean.finite<R>>(right: R): nor<L, R>
  (right: boolean): boolean
}
function nor_curried(left: boolean): (right: boolean) => boolean
function nor_curried(left: boolean) { return (right: boolean) => nor(left, right) as never }
void (nor.defer = nor_curried)

/**
 * ### {@link nand `boolean.nand`}
 * 
 * Implementation of [logical nand](https://en.wikipedia.org/wiki/Sheffer_stroke).
 * 
 * @example
 *  import { boolean } from "@traversable/data"
 * 
 *  const ex_01 = boolean.nand(Math.random() > 0.5, Math.random() > 0.5)
 *  //     ^? const ex_01: boolean
 *  const ex_02 = boolean.nand(true, true)
 *  //     ^? const ex_02: true
 *  const ex_03 = boolean.nand(false, false)
 *  //     ^? const ex_03: true
 *  const ex_04 = boolean.nand(false, true)
 *  //     ^? const ex_04: false
 *  const ex_05 = boolean.nand(true, false)
 *  //     ^? const ex_05: false
 */
export function nand<L extends boolean.finite<L>, R extends boolean.finite<R>>(left: L, right: R): nand<L, R>
export function nand(left: boolean, right: boolean): boolean
export function nand(left: boolean, right: boolean) { return (left && right) || (!left && !right) }
export type nand<L, R> = [L, R] extends [true, true] ? true : [L, R] extends [false, false] ? true : false

/** 
 * ### {@link nand_curried `boolean.nand.defer`}
 * 
 * Curried form (supports partial application) of {@link nand `boolean.nand`}.
 * 
 * **Use case:** More ergonomic/terse when used in a composition pipeline. 
 * 
 * **Tradeoff:** Cost is a small (but non-zero) runtime overhead.
 */
function nand_curried<L extends boolean.finite<L>>(left: L): {
  <R extends boolean.finite<R>>(right: R): nand<L, R>
  (right: boolean): boolean
}
function nand_curried(left: boolean): (right: boolean) => boolean
function nand_curried(left: boolean) { return (right: boolean) => nand(left, right) as never }
void (nand.defer = nand_curried)
