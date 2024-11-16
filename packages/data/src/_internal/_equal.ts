import type { any, some } from "any-ts";
import type { Equal } from "../exports.js";

/** @internal */
const Array_isArray = globalThis.Array.isArray;
/** @internal */
const Object_keys = globalThis.Object.keys;
/** @internal */
const Math_min = globalThis.Math.min;
/** @internal */
const Object_is = globalThis.Object.is;
/** @internal */
const Object_hasOwn = globalThis.Object.hasOwn;

/** ### {@link Equal_any `Equal.any`} */
export type Equal_any<T extends Equal<any> = Equal<any>> = T;

/** ### {@link Equal_infer `Equal.infer`} */
export type Equal_infer<T> = [T] extends [Equal<infer U>] ? U : never;

/** ### {@link Equal_strict `Equal.strict`} */
export const Equal_strict = <T>(x: T, y: T): boolean => x === y;

/** ### {@link Equal_string `Equal.string`} */
export const Equal_string = Equal_strict<string>;

/** ### {@link Equal_boolean `Equal.boolean`} */
export const Equal_boolean = Equal_strict<boolean>;

/** ### {@link Equal_bigint `Equal.bigint`} */
export const Equal_bigint = Equal_strict<bigint>;

/** ### {@link Equal_symbol `Equal.symbol`} */
export const Equal_symbol = Equal_strict<symbol>;

/**
 * ### {@link Equal_number `Equal.number`}
 * Compares two numbers for equality.
 *
 * Implementation of
 * [`Number::sameValue`](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types-number-sameValue)
 * spec.
 *
 * tl,dr: it works like {@link globalThis.Object.is `globalThis.Object.is`} rather than `===`, which means:
 *
 * - `NaN` is equal to `NaN`
 * - `+0` is *not* equal to `-0`
 */
export const Equal_number: Equal<number> = (x, y) =>
	(x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y);

/**
 * ### {@link Equal_mapInput `Equal.mapInput`}
 *
 * {@link Equal_mapInput `Equal.mapInput`} is the lowkey badass of the Equal module.
 *
 * For a nice example of it being used, see {@link Equal_date `Equal.date`}.
 *
 * @category combinators
 * @example
 *  import { Equal } from "@traversable/data"
 *
 *  // convert 2 numbers to integers before comparing them
 *  const integerEqual = Equal.mapInput(Equal.number, Math.round)
 *
 *  interface User { id: number, firstName: string }
 *
 *  // creates an `Equal` for `User` that compares only their `id` properties:
 *  const userEqual = Equal.mapInput(Equal.number, (user: User) => user.id)
 */
export function Equal_mapInput<T, U>(
	equiv: Equal<T>,
	fn: (u: U) => T,
): Equal<U> {
	return (left, right) => equiv(fn(left), fn(right));
}

/**
 * ### {@link Equal_mapInput.defer `Equal.mapInput.defer`}
 * @category combinators
 *
 * Variant of {@link Equal_mapInput `Equal.mapInput`} that supports partial application.
 */
Equal_mapInput.defer =
	<I, O>(fn: (o: O) => I) =>
	(equals: Equal<I>) =>
		Equal_mapInput(equals, fn);

/** ### {@link Equal_date `Equal.date`} */
export const Equal_date: Equal<globalThis.Date> = Equal_mapInput(
	Equal_number,
	(date) => date.getTime(),
);

/**
 * ### {@link Equal_and `Equal.and`}
 * @category combinators
 *
 * For a variant that supports partial application, see {@link Equal_and.defer `Equal.and.defer`}.
 */
export function Equal_and<T>(left: Equal<T>, right: Equal<T>): Equal<T> {
	return (x, y) => left(x, y) && right(x, y);
}

/**
 * ### {@link Equal_and.defer `Equal.and.defer`}
 * @category combinators
 *
 * Variant of {@link Equal_and.defer `Equal.and.defer`} that supports partial application.
 */
Equal_and.defer =
	<T>(second: Equal<T>) =>
	(first: Equal<T>) =>
		Equal_and(first, second);

/**
 * ### {@link Equal_or `Equal.or`}
 * @category combinators
 *
 * For a variant that supports partial application, see {@link Equal_or.defer `Equal.or.defer`}.
 */
export function Equal_or<T>(left: Equal<T>, right: Equal<T>): Equal<T> {
	return (x, y) => left(x, y) || right(x, y);
}

/**
 * ### {@link Equal_or.defer `Equal.or.defer`}
 * @category combinators
 *
 * Variant of {@link Equal_or.defer `Equal.or.defer`} that supports partial application.
 */
Equal_or.defer =
	<T>(second: Equal<T>) =>
	(first: Equal<T>) =>
		Equal_or(first, second);

/**
 * ### {@link Equal_compose `Equal.compose`}
 * @category combinators
 */
export function Equal_compose<T>(
	base: Equal<T>,
	rest: globalThis.Iterable<Equal<T>>,
): Equal<T> {
	return (left, right) => {
		if (!base(left, right)) return false;

		for (const eq of rest) if (!eq(left, right)) return false;
		return true;
	};
}

/**
 * ### {@link Equal_compose.defer `Equal.compose.defer`}
 * @category combinators
 *
 * Variant of {@link Equal_compose `Equal.compose`} that supports* partial application.
 */
Equal_compose.defer =
	<T>(base: Equal<T>) =>
	(rest: Iterable<Equal<T>>) =>
		Equal_compose(base, rest);

/**
 * ### {@link Equal_noop `Equal.noop`}
 *
 * {@link Equal_noop `Equal.noop`} is the identity operation:
 * combining an {@link Equal `Equal`} with {@link Equal_always `Equal.always`}
 * is a no-op.
 * @category empty
 */
export const Equal_noop: Equal<unknown> = () => true;

/**
 * ### {@link Equal_all `Equal.all`}
 * @category combinators
 */
export const Equal_all: <T>(equals: globalThis.Iterable<Equal<T>>) => Equal<T> =
	(equals) => Equal_compose(Equal_noop, equals);

/**
 * ### {@link Equal_product `Equal.product`}
 *
 * Given an {@link Equal `Equal<T>`} and an {@link Equal `Equal<U>`},
 * {@link Equal_product `Equal.product`} creates a new {@link Equal `Equal`}
 * that is capable of comparing their
 * [Cartesian product](https://en.wikipedia.org/wiki/Cartesian_product),
 * {@link Equal `Equal<[T, U]>`}.
 *
 * For a variant the supports partial application, see
 * {@link Equal_product.defer `Equal.product.defer`}.
 */
export function Equal_product<T, U>(
	left: Equal<T>,
	right: Equal<U>,
): Equal<readonly [x: T, y: U]> {
	return ([x1, y1], [x2, y2]) => left(x1, x2) && right(y1, y2);
}

/**
 * ### {@link Equal_product.defer `Equal.product.defer`}
 *
 * Curried form of {@link Equal_product `Equal.product`}.
 */
Equal_product.defer =
	<U>(right: Equal<U>) =>
	<T>(left: Equal<T>) =>
		Equal_product(left, right);

/**
 * ### {@link Equal_every `Equal.every`}
 * @category combinators
 */
export const Equal_every: <T>(
	equivs: globalThis.Iterable<Equal<T>>,
) => Equal<readonly T[]> = (equivs) => (x, y) => {
	const length = Math_min(x.length, y.length);
	let ix = 0;
	for (const equiv of equivs) {
		if (ix >= length) break;
		if (!equiv(x[ix], y[ix])) return false;
		ix++;
	}
	return true;
};

/**
 * ### {@link Equal_some `Equal.some`}
 * @category combinators
 */
export const Equal_some: <T>(
	equivs: globalThis.Iterable<Equal<T>>,
) => Equal<any.array<T>> = (equivs) => (x, y) => {
	const length = Math_min(x.length, y.length);
	let ix = 0;
	for (const equiv of equivs) {
		if (ix >= length) break;
		if (equiv(x[ix], y[ix])) return true;
		ix++;
	}
	return false;
};

/**
 * ### {@link Equal_tuple `Equal.tuple`}
 *
 * Given a tuple of {@link Equal `Equal`} relations, {@link Equal_tuple `Equal.tuple`}
 * returns a new {@link Equal `Equal`} that compares a pair of tuples, pairwise.
 * @category combinators
 */
export const Equal_tuple: <T extends readonly Equal<any>[]>(
	...equiv: T
) => Equal<{ [I in keyof T]: [T[I]] extends [Equal<infer U>] ? U : never }> = (
	...equiv
) => Equal_every(equiv);

/**
 * ### {@link Equal_array `Equal.array`}
 *
 * Creates a new {@link Equal `Equal`} for an array of values based
 * on a given {@link Equal `Equal`} for the elements of the array.
 * @category combinators
 */
export const Equal_array: <T>(equiv: Equal<T>) => Equal<readonly T[]> =
	(equiv) => (left, right) => {
		if (left.length !== right.length) return false;

		for (let ix = 0; ix < self.length; ix++)
			if (!equiv(left[ix], right[ix])) return false;

		return true;
	};

/**
 * ### {@link Equal_nonemptyArray `Equal.nonemptyArray`}
 *
 * Creates a new {@link Equal `Equal`} for an object or array of values based
 * on a given {@link Equal `Equal`} for the values of the object (or elements of the array).
 * @category combinators
 */
export const Equal_nonemptyArray: <T>(
	equiv: Equal<T>,
	sequence: globalThis.Iterable<Equal<T>>,
) => Equal<readonly [T, ...T[]]> = (equiv, sequence) => {
	const eqs = Equal_every(sequence);
	return (x, y) => (!equiv(x[0], y[0]) ? false : eqs(x.slice(1), y.slice(1)));
};

/**
 * ### {@link Equal_object `Equal.object`}
 *
 * Creates a new {@link Equal `Equal`} for an object or array of values based
 * on a given {@link Equal `Equal`} for the values of the object (or elements of the array).
 * @category combinators
 */
export function Equal_object<const T extends { [x: number]: Equal<any> }>(
	equiv: T,
): Equal<{ [K in some.keyof<T>]: Equal_infer<T[K]> }>;
export function Equal_object<const T extends { [x: string]: Equal<any> }>(
	equiv: T,
): Equal<{ [K in some.keyof<T>]: Equal_infer<T[K]> }>;
export function Equal_object<const T extends { [x: string]: Equal<any> }>(
	equiv: T,
) {
	const index = Object_keys(equiv);
	return (left: { [x: string]: unknown }, right: { [x: string]: unknown }) => {
		if (
			Array_isArray(left) &&
			Array_isArray(right) &&
			left.length !== right.length
		)
			return false;

		for (const ix of index) if (!equiv[ix](left[ix], right[ix])) return false;
		return true;
	};
}

/**
 * ### {@link Equal_struct `Equal.struct`}
 *
 * Given a dictionary whose properties contain {@link Equal `Equal`} relations,
 * {@link Equal_struct `Equal.struct`} creates an {@link Equal `Equal`}
 * for the structure as a whole.
 *
 * Implemented in terms of the more general combinator, {@link Equal_object `Equal.object`}.
 * @category combinators
 */
export const Equal_struct: <T extends { [x: string]: Equal<any> }>(
	equiv: T,
) => Equal<{ [K in keyof T]: Equal_infer<T[K]> }> = Equal_object;

/**
 * ### {@link isSameValue `Equal.isSameValue`}
 *
 * Equivalence to `globalThis.Object.is`. Included for completeness/
 * the learnings.
 *
 * See also:
 *
 * - the TC39 spec for [`SaveValue`](https://tc39.es/ecma262/#sec-samevalue)
 * - {@link globalThis.Object.is `globalThis.Object.is`}
 * - {@link Equal_isSameValueZero `Equal.isSameValueZero`}
 *
 * @example
 *  import { Equal } from "@traversable/data"
 *
 *  // sanity check
 *  console.log(+0 === +0)                   // => true
 *  // so far so good...
 *
 *  console.log(+0 === -0)                   // => true
 *  // 🤔 that... makes sense, I guess?...
 *
 *  console.log(NaN === NaN)                 // => true
 *  // 🙁 that... makes zero sense.
 *
 *  console.log(Object.is(+0, -0))           // => false
 *  console.log(Equal.isSameValue(+0, -0))   // => false
 *
 *  console.log(Object.is(NaN, NaN))         // => true
 *  console.log(Equal.isSameValue(NaN, NaN)) // => true
 */
export function Equal_isSameValue<T>(x: T, y: T): boolean;
export function Equal_isSameValue(x: unknown, y: unknown): boolean;
export function Equal_isSameValue(x: any, y: any) {
	return (
		(x === y && (x !== 0 || 1 / x === 1 / y)) || // handle `-0`
		(x !== x && y !== y)
	); // handle `NaN`
}

/**
 * ### {@link Equal_isSameValueZero `Equal.isSameValueZero`}
 *
 * Triple equals.
 *
 * See also:
 *
 * - the TC39 spec for [`SameValueZero`](https://tc39.es/ecma262/#sec-samevaluezero)
 * - {@link globalThis.Object.is `globalThis.Object.is`}
 * - {@link isSameValue `Equal.isSameValue`}
 *
 * @example
 *  import { Equal } from "@traversable/data"
 *
 *  console.log(+0 === +0)                       // => true
 *  console.log(+0 === -0)                       // => true
 *  console.log(Equal.isSameValueZero(+0, -0))   // => true
 *
 *  console.log(NaN === NaN)                     // => true
 *  console.log(Equal.isSameValueZero(NaN, NaN)) // => true
 */
export function Equal_isSameValueZero<T>(x: T, y: T): boolean;
export function Equal_isSameValueZero(x: unknown, y: unknown): boolean;
export function Equal_isSameValueZero(x: any, y: any) {
	return x === y;
}

/**
 * ### {@link Equal_shallow `Equal.shallow`}
 *
 * Equivalent to applying {@link Equal_isSameValue `Equal.isSameValue`}
 * to each of an array's elements or an object's properties.
 */
export function Equal_shallow<T extends { [x: number]: unknown }>(
	x: T,
	y: T,
): boolean;
export function Equal_shallow<T extends { [x: string]: unknown }>(
	x: T,
	y: T,
): boolean;
export function Equal_shallow<T extends { [x: number]: unknown }>(
	x: T,
	y: T,
): boolean;
export function Equal_shallow(
	x: { [x: string]: unknown },
	y: { [x: string]: unknown },
): boolean {
	if (Object_is(x, y)) return true;
	if (
		x === null ||
		typeof x !== "object" ||
		y === null ||
		typeof y !== "object"
	)
		return false;
	const keys = Object_keys(x);
	if (keys.length !== Object_keys(y).length) return false;
	for (let ix = 0, len = keys.length; ix < len; ix++) {
		const k = keys[ix];
		if (!Object_hasOwn(y, k) || !Object_is(x[k], y[k])) return false;
	}
	return true;
}

/**
 * ### {@link Equal_deep `Equal.deep`}
 *
 * Recursively compare 2 JSON objects for equality by value.
 *
 * Like [lodash.isEqual](https://lodash.com/docs/4.17.15#isEqual) and
 * [underscore.isEqual](https://underscorejs.org/docs/modules/isEqual.html),
 * but ~2-3x faster.
 *
 * See also:
 * - {@link globalThis.Object.is `globalThis.Object.is`}
 *
 * @example
 *  import { Equal } from "@traversable/data"
 *
 *  Equal.deep({ a: 1, b: { c: [2, 3, 4] } }, { a: 1, b: { c: [2, 3,  4] } }) // => true  ✅
 *  Equal.deep({ a: 1, b: { c: [2, 3, 4] } }, { A: 1, b: { c: [2, 3, 40] } }) // => false 🚫
 */
export function Equal_deep<T>(left: T, right: T): boolean;
export function Equal_deep(left: unknown, right: unknown): boolean;
export function Equal_deep(x: unknown, y: unknown): boolean {
	if (x === y) return true;
	let len: number | undefined;
	let ix: number | undefined;
	let ks: string[];

	if (Array_isArray(x)) {
		if (!Array_isArray(y)) return false;
		void (len = x.length);
		if (len !== y.length) return false;
		for (ix = len; ix-- !== 0; ) if (!Equal_deep(x[ix], y[ix])) return false;
		return true;
	}

	// Objects
	if (x && y && typeof x === "object" && typeof y === "object") {
		void (ks = Object_keys(x));
		void (len = ks.length);
		if (len !== Object_keys(y).length) return false;
		if (Array_isArray(y)) return false;
		for (ix = len; ix-- !== 0; ) {
			const k = ks[ix];
			if (!Equal_deep(x[k as never], y[k as never])) return false;
		}
		return true;
	}

	return false;
}
