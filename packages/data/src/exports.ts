import type { newtype } from "any-ts";
import { jsdoc } from "./_internal/_unicode.js"
import { URI } from "@traversable/data/_internal/_uri";

export type { nonempty } from "./nonempty.js"

export * from "./version.js";
export * as array from "./array.js"
export * as Equal from "./equal.js";
export * as fn from "./function.js"
export * as integer from "./integer.js"
export * as number from "./number.js"
export * as string from "./string.js"
export * as unicode from "./_internal/_unicode.js"
export * as Option from "./option.js"

export { boolean } from "./boolean.js"
export { entry, entries } from "./entry.js"
export { key, keys } from "./key.js"
export { map } from "./map.js"
export { object } from "./object.js"
export { prop, props } from "./prop.js"
export { record } from "./record.js"

/**
 * ## {@link Predicate `data.Predicate`}
 *
 * A predicate is a unary function that returns a boolean.
 *
 * Whereas the {@link boolean `data.boolean`} module is concerned with
 * `true` or `false`, a lot of interesting things happen when we promote
 * a boolean to a predicate -- namely, we gain _portability_ and
 * _composability_.
 *
 * For those that are curious, this is the basis of first-order logic,
 * which allows us to make logical statements about non-logical objects.
 *
 * See also:
 * - the Wikipedia page on
 * [first-order logic](https://en.wikipedia.org/wiki/First-order_logic)
 */
export type Predicate<in T = any> = (value: T) => boolean;

/**
 * ## {@link Predicate `data.Predicate`}
 */
export type Equal<in T> = (left: T, right: T) => boolean;

/**
 * ## {@link Compare `data.Compare`}
 *
 * Describes a binary operation that compares 2 elements of type {@link T `T`},
 * and returns a number summarizing their "order":
 *
 * - `-1` means {@link left `left`} is _less-than_ {@link right `right`}
 * - `+1` means {@link left `left`} is _greater-than_ {@link right `right`}
 * - `0` means {@link  left `left`} and {@link right `right`} are _equal_
 *
 * See also:
 * - {@link Equal `data.Equal`}
 * - the Wikipedia page for [total orders](https://en.wikipedia.org/wiki/Total_order)
 */
export type Compare<in T> = (left: T, right: T) => -1 | 0 | 1;
export declare namespace Compare {
	export {
		Compare_any as any,
		Compare_object as object,
		Compare_infer as infer,
	};
}
export declare namespace Compare {
	type Compare_any = Compare<any>;
	type Compare_object<T> =
		| never
		| Compare<{ -readonly [K in keyof T]: Compare.infer<T[K]> }>;
	type Compare_infer<T> = [T] extends [Compare<infer U>] ? U : never;
}

/**
 * ## {@link Pick `data.Pick`}
 *
 * Similar to the built-in {@link globalThis.Pick `Pick`} utility, but eagerly
 * evaluates its target.
 *
 * Like the built-in utility, this implementation is homomorphic
 * (structure-preserving)
 */
export type Pick<T, K extends keyof T> = never | { -readonly [x in K]: T[x] };

/**
 * ## {@link Omit `data.Omit`}
 *
 * Similar to the built-in {@link globalThis.Omit `Omit`} utility, but eagerly
 * evaluates its target.
 *
 * Like the built-in utility, this implementation is homomorphic
 * (structure-preserving)
 */
export type Omit<T, K extends keyof any> = never | Pick<T, Exclude<keyof T, K>>;

/**
 * ### {@link Force `data.Force`}
 *
 * There are a few use cases for the {@link Force `data.Force`} operation:
 *
 * - forcing evaluation
 * - "forgetting" the differences between intersections, by merging them into a single type
 * - to break an interface open so you can see the properties it contains
 */
export type Force<T> = never | { [K in keyof T]: T[K] }

/**
 * ### {@link Spread `Spread`}
 *
 * Preserves JSDoc annotations. If a property is has JSDoc annotations in both
 * {@link T `T`} and {@link U `U`}, the docs for the property in {@link U `U`}
 * are concatenated onto the end of the docs for the property in {@link T `T`}.
 */
export type Spread<T, U, _K extends keyof (T | U) = keyof (T | U)> =
	| never
	| (Pick<T | U, _K> & Omit<T, _K> & Omit<U, _K>)

/**
 * ### {@link Merge `Merge`}
 *
 * Preserves JSDoc annotations. If a property is has JSDoc annotations in both
 * {@link T `T`} and {@link U `U`}, the docs for the property in {@link U `U`}
 * are concatenated onto the end of the docs for the property in {@link T `T`}.
 */
export type Merge<T, U> = never | Force<Spread<T, U>>

export type Part<T, K extends keyof T = never> = [K] extends [never]
	? Optional<T>
	: Force<Omit<T, K> & Optional<T, K>>

export type Require<T, K extends keyof T = never> = [K] extends [never]
	? Optional<T>
	: Force<Pick<T, K> & Optional<T, Exclude<keyof T, K>>>

export type Optional<T, K extends keyof T = keyof T> = never | 
  { [P in K]+?: T[P] }

/**
 * ## {@link Sort `data.Sort`}
 *
 * If {@link Compare `data.Compare`} describes the relationship between
 * two members of a total order, then a sort operation is simply the
 * application of the comparison to `n` number of elements.
 *
 * See also:
 * - {@link Compare `data.Compare`}
 */
export type Sort<in out T> = (array: readonly T[]) => readonly T[];
export declare namespace Sort {
	export type infer<T> = [T] extends [Sort<infer U>] ? U : never;
	export type { Sort_any as any };
	export type Sort_any<T extends Sort<any> = Sort<any>> = T;
}

/**
 * ## {@link MapSort `data.MapSort`}
 *
 * Given a function that maps to elements of a total order, and
 * a sequence of `n` elements from the function's codomain,
 * applies to the function to each element, then, orders the
 * sequence.
 *
 * This operation is similar to a "selector" function, and is
 * useful primarily as a composition primitive, since it allows
 * a small set of sorting function to be applied to any arbitrary
 * input, given a function between them.
 *
 * See also:
 * - {@link Sort `data.Sort`}
 * - the Wikipedia page on
 * [contravariant functors](
 *   https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)
 * )
 */
export type MapSort<in T> = <S>(fn: (s: S) => T) => Sort<S>;
export declare namespace MapSort {
	/**
	 * ### {@link infer `data.MapSort.infer`}
	 * Type-level utility that extracts
	 */
	export type infer<T> = [T] extends [MapSort<infer U>] ? U : never;
	export type { MapSort_any as any };
	export type MapSort_any<T extends MapSort<any> = MapSort<any>> = T;
}

/**
 * ## {@link Option `data.Option`}
 *
 * Usually the first algebraic data type (ADT) that people encounter.
 * It has numerous names/encodings: Haskell's `Maybe`, Scala's
 * `Optional`.
 *
 * A simple, but useful primitive. These two use cases come to mind, but there
 * are others:
 *
 * - {@link Option `data.Option`} can be used as a kind of "type-safe null pointer"
 * - {@link Option `data.Option`} can be used as a control-flow primitive
 *
 * See also:
 * - {@link Result `data.Result`}
 * - the Wikipedia page for the
 * [option type](https://en.wikipedia.org/wiki/Option_type)
 */
export type Option<T> = None | Some<T>
export interface None { _tag: URI.None }
export interface Some<T> { _tag: URI.Some, value: T }

/**
 * ## {@link Result `data.Result`}
 *
 * Like {@link Option `data.Option`}, {@link Result `data.Result`} is often
 * used to describe an operation that can fail.
 *
 * Unlike {@link Option `data.Option`}, {@link Result `data.Result`}
 * comes with an extra "slot" that's most commonly used to encode the
 * _reason_ why an operation failed.
 *
 * Like all ADTs, there are good reasons to use it, and good reasons to not
 * use it. Depends entirely on the use case.
 *
 * See also:
 *
 * - {@link Option `data.Option`}
 * - Rust's docs on [`Result`](https://doc.rust-lang.org/std/result/)
 */
export type Result<T, E = never> = Ok<T> | Err<E>
export interface Ok<T> { _tag: URI.Ok, ok: T }
export interface Err<T> { _tag: URI.Err, err: T }

/**
 * ## {@link Concattable `data.Concattable`}
 *
 * a.k.a. "semigroup"
 *
 * See also:
 * - {@link Foldable `data.Foldable`}
 * - the Wikipedia page on [semigroups](https://en.wikipedia.org/wiki/Semigroup)
 */
export interface Concattable<in out T> {
	concat(left: T, right: T): T
}

/**
 * ## {@link Foldable `data.Foldable`}
 *
 * a.k.a. "monoid"
 *
 * See also:
 * - {@link Concattable `data.Concattable`}
 * - the Wikipedia page on [monoids](https://en.wikipedia.org/wiki/Monoid)
 */
export interface Foldable<in out T> extends Concattable<T> { empty: T }

/**
 * ### {@link integer `number.integer`}
 * * #### ｛ {@link jsdoc.integer `ℤ`}  ｝
 * -----
 *
 * See also: [Integer](https://en.wikipedia.org/wiki/Integer_(computer_science))
 *
 * A signed, 64-bit number representation.
 *
 * > **Note:** to convert an {@link integer `integer`} to a TypeScript number, you can use the
 *   [unary plus](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unary_plus)
 *   operator (e.g., `+ myInteger`).
 *
 * **Note:** `number -> integer` is _lossy_. For a constructor that preserves the integer exponent
 * of its argument, see {@link float `number.float`.}
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
 *    console.log(`${ex_01} > ${ex_02}`)
 *  }
 *
 *  // if you need to pass an integer to a function that expects a number, use the _unary plus operator_ (a.k.a.
 *  // ["prefix plus"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Unary_plus):
 *  const ex_03 = Math.max(ex_01, ex_02)
 *  //                     ^^^^ 🚫 Argument of type 'integer' is not assignable to parameter of type 'number'
 *
 *  //                     ↓ ✅     ↓ ✅
 *  const ex_04 = Math.max(+ ex_01, + ex_02)
 *  //    ^? const ex_04: number
 *
 *  // you can also use `valueOf`:
 *  //                     ↓ ✅    ↓ ✅
 *  const ex_05 = Math.max(+ex_01, +ex_02)
 *  //    ^? const ex_05: number
 */
export interface integer extends newtype<number> {}
