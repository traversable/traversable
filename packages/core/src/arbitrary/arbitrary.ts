export * from "fast-check"

/** 
 * TODO:
 * - [ ] feat: fragment percent-encode set
 *   - [source](https://url.spec.whatwg.org/#fragment-percent-encode-set)
 * - [ ] feat: query percent-encode set
 *   - C0 controls + all code points greater than U+007E (~), and `"`, `#`, `<`, `>`
 *   - [source](https://url.spec.whatwg.org/#query-percent-encode-set)
 */

import { array, fn, map, object } from "@traversable/data"
import * as fc from "fast-check"

import { array$, is } from "../guard/predicates.js"
import { std } from "./data.js"
import Country = std.Country
import Currency = std.Currency
import Digit = std.Digit
import State = std.UnitedStateOfAmerica
import { has } from "@traversable/core/tree"
import type { Force, HKT } from "@traversable/registry"
import { Invariant, symbol } from "@traversable/registry"
export { symbol } from "@traversable/registry"

import symbol_optional = symbol.optional

/** @internal */
const PATTERN = {
  alphanumeric: /^[a-zA-Z][a-zA-Z0-9]+$/,
  identifier: /^[$_a-zA-Z][$_a-zA-Z0-9]*$/,
  identifier_legacy: /^[a-z$_][a-z$_0-9]*$/g,
  pathnameEZ: /^[_a-zA-Z][_a-zA-Z0-9]+$/,
  pathname: /^[a-zA-Z0-9._-]+$/,
} as const

/** @internal */
const Object_keys = globalThis.Object.keys

type Keyword = keyof typeof KEYWORD
const KEYWORD = {
  break: "break", case: "case", catch: "catch", class: "class", const: "const", 
  continue: "continue", debugger: "debugger", default: "default", delete: "delete", 
  do: "do", else: "else", export: "export", extends: "extends", false: "false", 
  finally: "finally", for: "for", function: "function", if: "if", import: "import", 
  in: "in", instanceof: "instanceof", new: "new", null: "null", return: "return", 
  super: "super", switch: "switch", this: "this", throw: "throw", true: "true", 
  try: "try", typeof: "typeof", var: "var", void: "void", while: "while", 
  with: "with", let: "let", static: "static", yield: "yield",
} as const satisfies Record<string, string>

export { isArbitrary as is }
const isArbitrary = <T>(u: unknown): u is fc.Arbitrary<T> => 
  u !== null && typeof u === "object" && "generate" in u && "shrink" in u

export function jsonString(constraints?: fc.JsonSharedConstraints) { return fc.json(constraints) }

export function json(constraints?: fc.JsonSharedConstraints) { return fc.jsonValue(constraints)}

export function alphanumeric(constraints?: fc.StringMatchingConstraints) { return fc.stringMatching(PATTERN.alphanumeric, constraints) }

export type {
  /** 
   * ### {@link fc_typeof `fc.typeof`} 
   * 
   * Infer the type of a {@link fc.Arbitrary `fc.Arbitrary`}'s target.
   */
  fc_typeof as typeof,
  /** 
   * ### {@link fc_typeof `fc.infer`} 
   * 
   * Alias for {@link fc_typeof `fc.typeof`}.
   */
  fc_typeof as infer,
  /** 
   * ### {@link fc_any `fc.any`} 
   * 
   * The superset or [least upper bound](https://en.wikipedia.org/wiki/Least-upper-bound_property)
   * of {@link fc.Arbitrary `fc.Arbitrary`}. 
   */
  fc_any as any,
  /** 
   * ### {@link fc_unwrap `fc.unwrap`} 
   * 
   * Type-level operation that, given a "shape" (an object whose properties 
   * are all {@link fc.Arbitrary `fc.Arbitraries`}), applies {@link fc_typeof `fc.infer`} 
   * to each property to infer the type of the shape overall.
   * 
   * Dual of {@link fc_wrap `fc.wrap`}.
   * 
   * See also: 
   * - {@link fc_typeof `fc.typeof`}
   * - {@link fc_wrap `fc.wrap`}
   */
  fc_unwrap as unwrap,
  /** 
   * ### {@link fc_wrap `fc.wrap`} 
   * 
   * Type-level operation that, given an object, wraps each of the object's 
   * properties in {@link fc.Arbitrary `fc.Arbitrary`}.
   * 
   * Dual of {@link fc_unwrap `fc.unwrap`}.
   * 
   * See also: 
   * - {@link fc_typeof `fc.typeof`}
   * - {@link fc_unwrap `fc.unwrap`}
   */
  fc_wrap as wrap,

  /** 
   * ### {@link fc_lambda `fc.lambda`}
   */
  // TODO: document
  fc_lambda as lambda,
}

export {
  symbol_optional as Symbol_optional,
  /**
   * ### {@link fc_null `fc.null`}
   *
   * Shorthand for `fc.constant(null)`
   * 
   * See also:
   * - {@link fc_undefined `fc.undefined`}
   *
   * @example
   *  import { fc } from "@traversable/core"
   * 
   *  const ex_01 = fc.tuple(fc.null(), fc.null())
   *  //     ^? const ex_01: fc.Arbitrary<[null, null]>
   * 
   *  console.log(fc.peek(ex_01))   // => [null, null]
   */
  fc_null as null,
  /**
   * ### {@link fc_undefined `fc.undefined`}
   *
   * Shorthand for `fc.constant(undefined)`
   *
   * See also:
   * - {@link fc_null `fc.null`}
   * 
   * @example
   *  import { fc } from "@traversable/core"
   * 
   *  const ex_01 = fc.tuple(fc.undefined(), fc.undefined())
   *  //     ^? const ex_01: fc.Arbitrary<[undefined, undefined]>
   * 
   *  console.log(fc.peek(ex_01))   // => [undefined, undefined]
   */
  fc_undefined as undefined,
}


// documentation appended to exported node (above)
type fc_typeof<T> = T extends fc.Arbitrary<infer U> ? U : never
// documentation appended to exported node (above)
type fc_any = fc.Arbitrary<unknown>
// documentation appended to exported node (above)
type fc_wrap<T> = { [K in keyof T]: fc.Arbitrary<T[K]> }
// documentation appended to exported node (above)
type fc_unwrap<T extends globalThis.Record<string, fc_any>> = { [K in keyof T]: fc_typeof<T[K]> }
// documentation appended to exported node (above)
const fc_null
  : () => fc.Arbitrary<null>
  = () => constant(null)
// documentation appended to exported node (above)
const fc_undefined
  : () => fc.Arbitrary<undefined>
  = () => constant(undefined)
interface fc_lambda extends HKT { [-1]: fc.Arbitrary<this[0]> }

/**
 * ### {@link peek `fc.peek`}
 *
 * Shorthand for {@link fc.sample `fc.sample`}, only instead of returning an
 * array of `n` number of generated values, {@link peek `fc.peek`} generates
 * just a single value and returns it directly.
 * 
 * @example
 *  import { fc } from "@traversable/core"
 * 
 *  // `fc.sample` returns array of `n` results (here, 3)
 *  console.log(fc.sample(fc.nat(12), 3))  // => [11, 3, 8]
 * 
 *  console.log(fc.sample(fc.nat(12), 1))  // => [9]
 * 
 *  // whereas `fc.peek` always generates a single result
 *  console.log(fc.peek(fc.nat(12)))       // => 8
 *  console.log(fc.peek(fc.nat(12)))       // => 5
 */
export function peek<T>(arbitrary: fc.Arbitrary<T>): T { return fc.sample(arbitrary, 1)[0] }

export { boolean_ as boolean }
/**
 * ### {@link boolean_ `fc.boolean`}
 * 
 * By default, this generator will bias toward true. 
 * To invert that, set `falseBias` to true.
 */
function boolean_(constraints?: boolean_.Constraints): fc.Arbitrary<boolean>
function boolean_(constraints: boolean_.Constraints = boolean_.defaults) {
  return fc.constantFrom(...constraints.falseBias ? [false, true] : [true, false])
}
boolean_.defaults = { falseBias: false } satisfies Required<boolean_.Constraints>
declare namespace boolean_ { interface Constraints { falseBias?: boolean } }

/**
 * ### {@link symbol `fc.symbol`}
 *
 * Generate an arbitrary, globally unique {@link globalThis.Symbol `Symbol`}
 *
 * @example
 *  import { fc } from "@traversable/core"
 * 
 *  const ex_01 = fc.symbol()
 *  //     ^? const ex_01: fc.Arbitrary<symbol>
 * 
 *  console.log(fc.peek(ex_01)) // => Symbol("!_$")
 *  console.log(fc.peek(ex_01)) // => Symbol("")
 *  console.log(fc.peek(ex_01)) // => Symbol("-1e+21")
 */
function fc_symbol(constraints?: fc.StringMatchingConstraints): fc.Arbitrary<symbol> {
  return identifier(constraints).map(Symbol.for)
}
export { fc_symbol as symbol_ }

/** ### {@link primitive `fc.primitive`} */
export function primitive() {
  return fc.oneof(fc_null(), fc_symbol(), fc.boolean(), fc.integer(), fc.float(), fc.string())
}

/** ### {@link literal `fc.literal`} */
export function literal() {
  return fc.oneof(fc_null(), fc.boolean(), fc.integer(), fc.float({ noNaN: true }), fc.string())
}

/**
 * ### {@link key `fc.key`}
 * 
 * Generate an arbitrary key (`string | number | symbol`). Optionally
 * accepts a {@link key.Constraints `constraints`} object that supports
 * excluding certain types of keys or hotswapping the arbitrary that
 * will be used.
 * 
 * @example
 *  import { fc } from "@traversable/core"
 * 
 *  const ex_01 = fc.key()
 *  //     ^? const ex_01: fc.Arbitrary<string | number | symbol>
 * 
 *  const ex_02 = fc.key({ excludeSymbols: true })
 *  //     ^? const ex_02: fc.Arbitrary<string | number>
 * 
 *  const ex_03 = fc.key({ arbitrary: fc.oneof(fc.symbol(), fc.integer({ max: -1 })).map(String) })
 *  //     ^? const ex_03: fc.Arbitrary<string | symbol>
 * 
 *  console.log(fc.peek(ex_01)) // => Symbol("!_$")
 *  console.log(fc.peek(ex_01)) // => "0xff"
 *  console.log(fc.peek(ex_01)) // => 1030090
 * 
 *  console.log(fc.peek(ex_02)) // => "toString"
 *  console.log(fc.peek(ex_02)) // => 0
 *  console.log(fc.peek(ex_02)) // => ""
 * 
 *  console.log(fc.peek(ex_03)) // => "-12030"
 *  console.log(fc.peek(ex_03)) // => Symbol("lorem")
 *  console.log(fc.peek(ex_03)) // => "-1"
 */
export function key<const T extends key.Structural>(constraints?: T): fc.Arbitrary<key.apply<T>>
export function key<K extends keyof never>({ arbitrary }: key.Nominal<K>): fc.Arbitrary<K>
export function key(constraints: key.Constraints = {}): fc.Arbitrary<keyof never> {
  return constraints.arbitrary
    ? constraints.arbitrary
    : fc.oneof(
      ...(constraints.excludeStrings ? [] : [identifier()]),
      ...(constraints.excludeNumbers ? [] : [fc.nat()]),
      ...(constraints.excludeSymbols ? [] : [fc_symbol()]),
    )
}

export function keysof<T extends {}>(object: T): fc.Arbitrary<(keyof T)[]>
export function keysof<T extends {}>(object: T) {
  const keys = globalThis.Object.keys(object)
  return keys.length === 0 
    ? fc.constant([]) 
    : fc.uniqueArray(fc.constantFrom(...globalThis.Object.keys(object)))
}

export type needle = typeof needle
export const needle = Symbol.for("needle")

type k = string | number
const pathInto = fc.array(
  fc.oneof(fc.integer(), identifier()
), { maxLength: 5, minLength: 5 }) as fc.Arbitrary<
  | [k, k, k, k, k]
  | [k, k, k, k]
  | [k, k, k]
  | [k, k]
  | [k]
  | []
>

interface Tree { [x: string | number]: TreeF }
type TreeF = needle | Tree

export const nonemptyPath = fc.array(identifier(), { minLength: 1 })

export function needleInAHaystack() {
  const treeConstraints = { maxDepth: 5, depthSize: globalThis.Number.POSITIVE_INFINITY }
  return fc.tuple(
    pathInto,
    fc.dictionary(identifier(), fc.jsonValue(treeConstraints)),
    fc.dictionary(identifier(), fc.jsonValue(treeConstraints)),
    fc.dictionary(identifier(), fc.jsonValue(treeConstraints)),
    fc.dictionary(identifier(), fc.jsonValue(treeConstraints)),
    fc.dictionary(identifier(), fc.jsonValue(treeConstraints)),
  ).map(
    ([path, $1, $2, $3, $4, $5]) => {
      const [k1, k2, k3, k4, k5] = path
      let out: unknown = needle
      k5 !== undefined && void (out = { ...$5, [k5]: out })
      k4 !== undefined && void (out = { ...$4, [k4]: out })
      k3 !== undefined && void (out = { ...$3, [k3]: out })
      k2 !== undefined && void (out = { ...$2, [k2]: out })
      k1 !== undefined && void (out = { ...$1, [k1]: out })
      return [
        out as Tree,
        path,
      ] as const
    }
  )
}

// export declare function pathOf<
//   const T extends { [K in K1]+?: { [K in K2]+?: { [K in K3]+?: { [K in K4]+?: { [K in K5]+?: any.primitive } } } } },
//   K1 extends string, 
//   K2 extends string, 
//   K3 extends string, 
//   K4 extends string,
//   K5 extends string,
// >(tree: T): fc.Arbitrary<[k1?: K1, k2?: K2, k3?: K3, k4?: K4, k5?: K5]>
// export declare function pathOf<
//   const T extends { [K in K1]: { [K in K2]: { [K in K3]: { [K in K4]: { [K in K5]: unknown } } } } },
//   K1 extends keyof T, 
//   K2 extends keyof T[K1], 
//   K3 extends keyof T[K1][K2], 
//   K4 extends keyof T[K1][K2][K3],
//   K5 extends keyof T[K1][K2][K3][K4],
// >(tree: T): fc.Arbitrary<
//   | [K1, K2, K3, K4, K5]
//   | [K1, K2, K3, K4]
//   | [K1, K2, K3]
//   | [K1, K2]
//   | [K1]
//   | []
// >
// export declare function pathOf<
//   const T extends { [K in K1]: { [K in K2]: { [K in K3]: { [K in K4]: any.primitive } } } },
//   K1 extends keyof T, 
//   K2 extends keyof T[K1], 
//   K3 extends keyof T[K1][K2], 
//   K4 extends keyof T[K1][K2][K3]
// >(tree: T): fc.Arbitrary<[K1, K2, K3, K4]>


export function recordOf<K extends string, V>(object: Record<K, any>, valuesArbitrary: fc.Arbitrary<V>): fc.Arbitrary<{ [P in K]+?: V }>
export function recordOf(object: { [x: string]: unknown }, valuesArbitrary: fc.Arbitrary<unknown>) {
  const keys = globalThis.Object.keys(object)
  return (
    keys.length === 0 ? fc.constant({}) 
    : fc.uniqueArray(
      fc.tuple(
        fc.constantFrom(...globalThis.Object.keys(object)), 
        valuesArbitrary
      ), { selector: ([key]) => key }
    ).map(globalThis.Object.fromEntries)
  )
}

declare namespace record {
  type Keep<T, K extends keyof T> = never | { [P in K]: T[P] }
  type Part<T, K extends keyof T = keyof T> = never | { [P in K]+?: T[P] }
  type Forget<T> = never | { [K in keyof T]: T[K] }
  type Require<T, K extends keyof T = never> = [K] extends [never] ? T : Forget<
    & Keep<T, K>
    & Part<T, globalThis.Exclude<keyof T, K>>
  >
}

/*
: fc.Arbitrary<
  & { [K in Req]: fc.Arbitrary<unknown> }
  & { [K in Opt]: fc.Arbitrary<unknown> }
> */

export function part<
  Required extends { [x: number]: unknown }, 
  Optional extends { [x: number]: unknown }
>(
  req: { [K in keyof Required]: fc.Arbitrary<Required[K]> }, 
  opt: { [K in keyof Optional]: fc.Arbitrary<Optional[K]> }
): fc.Arbitrary<Force<
  & Required 
  & Partial<Optional>
>>

export function part<Req extends keyof any, Opt extends keyof any>(
  req: { [K in Req]: fc.Arbitrary<unknown> }, 
  opt: { [K in Opt]: fc.Arbitrary<unknown> }
) {
  const requiredKeys = Object_keys(req)
  const xyz: { [x: string]: fc.Arbitrary<unknown> } = { ...req, ...opt }
  const constraints = { requiredKeys }
  return fc.record(xyz, constraints)
}

export function record<
  const T extends Record<string, fc.Arbitrary<unknown>>, 
  _K extends keyof T = keyof T, 
  Opt extends 
  | _K extends _K ? T[_K] extends { [symbol_optional]: any } ? _K : never : never
  = _K extends _K ? T[_K] extends { [symbol_optional]: any } ? _K : never : never,
  Req extends Exclude<_K, Opt> = Exclude<_K, Opt>
>(model: T): fc.Arbitrary<Force<
  & { [K in Opt]+?: fc_typeof<T[K]> }
  & { [K in Req]-?: fc_typeof<T[K]> }
>>

export function record<T>(model: { [K in keyof T]: fc.Arbitrary<T[K]> }): fc.Arbitrary<T>

export function record<T, K extends never>(
  model: { [K in keyof T]: fc.Arbitrary<T[K]> }, 
  constraints: { requiredKeys?: readonly [] }
): fc.Arbitrary<{ [K in keyof T]+?: T[K] }>

export function record<T, K extends keyof T>(
  model: { [K in keyof T]: fc.Arbitrary<T[K]> }, 
  constraints: { requiredKeys?: K[] }
): fc.Arbitrary<record.Require<T, K>>

export function record<T, K extends keyof T>(
  model: { [K in keyof T]: fc.Arbitrary<T[K]> }, 
  constraints: { withDeletedKeys?: boolean, requiredKeys?: never }
): fc.Arbitrary<record.Require<T, K>>

export function record<T, K extends keyof T>(
  model: { [K in keyof T]: fc.Arbitrary<T[K]> }, 
  constraints: { withDeletedKeys: never, requiredKeys: never }
): fc.Arbitrary<record.Require<T, K>>

export function record<T, K extends keyof T>(
  model: { [K in keyof T]: fc.Arbitrary<T[K]> }, 
  constraints?: fc.RecordConstraints<T>
): fc.Arbitrary<record.Require<T, K>>

export function record(
  model: { [x: string]: fc.Arbitrary<unknown> }, 
  constraints = {}
) { 
  const keys = Object_keys(model)
  const opt = keys.filter((k) => (symbol_optional in model[k]))
  const requiredKeys = has("requiredKeys", array$(is.string))(constraints) 
    ? keys
      .filter((k) => constraints.requiredKeys.includes(k)) 
      .filter((k) => !opt.includes(k))
    : keys
      .filter((k) => !opt.includes(k))
  return fc.record(model, { ...constraints, requiredKeys }) 
}

export declare namespace key {
  /** 
   * ### {@link Constraints `fc.key.Constraints`}
   * 
   * Constraints that can optionally be applied when 
   * constructing an {@link key `fc.key`} Arbitrary.
   */
  type Constraints<K extends keyof never = keyof never> =
    | (key.Structural & key.WithoutArbitrary)
    | (key.Nominal<K> & key.WithoutExcludes)
    ;
  /** 
   * ### {@link Nominal `fc.key.Nominal`}
   * 
   * Explicitly limit the {@link key `fc.key`} Arbitrary by overriding the
   * arbitrary that is used. 
   * 
   * Disjoint from {@link Structural `fc.key.Structural`}.
   */
  interface Nominal<K extends keyof never = keyof never> { arbitrary: fc.Arbitrary<K> }
  /** 
   * ### {@link Nominal `fc.key.Nominal`}
   * 
   * If you need a key arbitrary that excludes certain types that
   * the {@link key `fc.key`} arbitrary will produce, specify which
   * to exclude via {@link Structural `fc.key.Structural`}.
   * 
   * Disjoint from {@link Nominal `fc.key.Nominal`}.
   */
  interface Structural {
    excludeStrings?: boolean,
    excludeNumbers?: boolean,
    excludeSymbols?: boolean,
  }

  /** 
   * ### {@link apply `fc.key.apply`}
   * 
   * A type-level utility that applies the constraints specified 
   * by {@link Structural `fc.key.Structural`} to the output 
   * {@link key `fc.key`} Arbitrary.
   */
  type apply<
    T extends key.Structural,
    /**
     * lifting the computation up into a type parameter (`_`) forces the result to evaluate 
     * eagerly, and helps IDE perf a bit by sending TS a hint that it can cache the result
     */
    _ extends keyof never
    = excludeIfTrue<T["excludeNumbers"], number>
    | excludeIfTrue<T["excludeStrings"], string>
    | excludeIfTrue<T["excludeSymbols"], symbol>
  > = _

  /** @internal */
  interface WithoutArbitrary { arbitrary?: never }
  /** @internal */
  interface WithoutExcludes { excludeStrings?: never, excludeNumbers?: never, excludeSymbols?: never }
  /** @internal */
  type excludeIfTrue<Cond, T> = [Cond] extends [true] ? never : T
}

/**
 * ### {@link partial `fc.partial`}
 * 
 * Mimics the behavior of {@link globalThis.Partial `Partial<T>`} for an 
 * {@link fc.Arbitrary `fc.Arbitrary`} shape.
 * 
 * {@link partial `fc.partial`} is a combinator that accepts a shape of type {@link T `T`},
 * where each of the {@link T `T`}'s properties is an  {@link fc.Arbitrary `fc.Arbitrary`}, 
 * and returns an {@link fc.Arbitrary `fc.Arbitrary`} whose properties are optional.
 * 
 * If you've used the `partial` method on a zod schema before, same idea.
 * 
 * @example
 *  import { fc } from "@traversable/core"
 * 
 *  const shape = { x: fc.nat(), y: fc.nat(), z: fc.nat() }
 * 
 *  const ex_01 = fc.partial(shape)
 *  //     ^? const ex_01: fc.Arbitrary<{ x?: number, y?: number, z?: number }>
 * 
 *  console.log(fc.peek(ex_01)) // => { x: 0 }
 *  console.log(fc.peek(ex_01)) // => {}
 *  console.log(fc.peek(ex_01)) // => { z: 1, y: 9001 }
 */
export function partial<T extends { [x: string]: fc_any }>(arbitraries: T): fc.Arbitrary<{ [K in keyof T]?: fc_typeof<T[K]> }>
export function partial<T extends { [x: string]: fc_any }>(arbitraries: T) {
  return fc.record(arbitraries, { requiredKeys: [] })
}

/**
 * ### {@link shape `fc.shape`}
 * 
 * A tiny DSL / shorthand for creating a {@link fc.record `fc.record Arbitrary`}.
 * 
 * Optional properties are denoted by appending a "?" to the end of the property name. 
 * The question mark will be removed from end of the property name when generating
 * the value.
 * 
 * @example
 *  import { fc } from "@traversable/core"
 * 
 *  // using `fc.record`:
 *  const ex_01 = fc.record({ bit: fc.nat(0x1), byte: fc.nat(0xff) }, { requiredKeys: ["bit"] })
 *  //     ^? const ex_01: fc.Arbitrary<Partial<{ bit: number; byte: number; }> & globalThis.Pick<{ bit: number; byte: number; }, "bit">>
 * 
 *  // using `fc.shape`:
 *  const ex_02 = fc.shape({ bit: fc.nat(0x1), "byte?": fc.nat(0xff) })
 *  //     ^? const ex_02: fc.Arbitrary<{ bit: number, byte?: number }>
 * 
 *  // The domains of `ex_01` and `ex_02` are equivalent:
 *  console.log(fc.peek(ex_01)) // => { bit: 1, byte: 254 }
 *  console.log(fc.peek(ex_01)) // => { bit: 1 }
 *  console.log(fc.peek(ex_01)) // => { bit: 0 }
 * 
 *  console.log(fc.peek(ex_02)) // => { bit: 0 }
 *  console.log(fc.peek(ex_02)) // => { bit: 1, byte: 101 }
 *  console.log(fc.peek(ex_02)) // => { bit: 0 }
 */
export function shape<T extends { [x: string]: fc_any }>(model: T): fc.Arbitrary<shape.apply<T>>
export function shape<T extends { [x: string]: fc_any }>(model: T) {
  const [opt, req] = shape.apply(model)
  return fc.record(Object.fromEntries(opt.map((k) => [k, model[k]])), { requiredKeys: req })
}
export declare namespace shape {
  /** @internal */
  type fold<T> = never | { [K in keyof T]: T[K] }

  /** @internal */
  type apply<T extends { [x: string]: unknown }> = shape.fold<
    & { [K in keyof T as K extends `${infer Opt}?` ? Opt : never]+?: fc_typeof<T[K]> }
    & { [K in keyof T as K extends `${string}?` ? never : K]-?: fc_typeof<T[K]> }
  >
}
export namespace shape {
  /** @internal */
  const push 
    : <T>(xs: T[], y: T) => T[]
    = (xs, y) => (void xs.push(y), xs)

  const emptySeparated: [optional: string[], required: (keyof any)[]] = [[], []]

  export function apply<T extends { [x: string]: fc_any }>(model: T): 
    [optional: string[], required: (keyof T & (string | number))[]]
  // impl.
  export function apply<T extends { [x: string]: fc_any }>(model: T) {
    return fn.pipe(
      object.keys(model),
      array.reduce(
        ([opt, req], k) => is.string(k) 
          ? k.endsWith("?") ? array.of(push(opt, k.slice(0, -1)), req)
          : array.of(opt, push(req, k))
          : array.of(opt, push(req, k)), 
        emptySeparated,
      )
    )
  }
}

/**
 * ### {@link entry `fc.entry`}
 *
 * Generates an arbitrary entry (key-value pair). Can be optionally constrained 
 * by passing a {@link entry.Constraints `fc.entry.Constraints`} object.
 * 
 * See also:
 * - {@link entries `fc.entries`}
 * 
 * @example
 *  import { fc } from "@traversable/core"
 * 
 *  const ex_01 = fc.entry()
 *  //     ^? const ex_01: fc.Arbitrary<[key: string | number | symbol, value: unknown]>
 *  
 *  const ex_02 = fc.entry({ keyArbitrary: fc.integer({ max: -1 }).map(String) })
 *  //     ^? const ex_02: fc.Arbitrary<[key: string, value: unknown]>
 *  
 *  const ex_03 = fc.entry({ keyArbitrary: fc.lorem(), valueArbitrary: fc.oneof(fc.undefined(), fc.null()) })
 *  //     ^? const ex_03: fc.Arbitrary<[key: string, value: null | undefined]>
 * 
 *  console.log(fc.peek(ex_01)) // => ["a_90!", { _e3: -0 }]
 *  console.log(fc.peek(ex_01)) // => [Symbol("'"), { _e3: -0 }]
 * 
 *  console.log(fc.peek(ex_02)) // => [-90123312, null]
 *  console.log(fc.peek(ex_02)) // => [-19, -1]
 * 
 *  console.log(fc.peek(ex_03)) // => [8090, null]
 *  console.log(fc.peek(ex_03)) // => [-0, undefined]
 */
export function entry<K extends keyof never, V>(constraints?: entry.Constraints<K, V>): fc.Arbitrary<[key: K, value: V]>
export function entry<K extends keyof never, V>({
  keyArbitrary = key() as never,
  valueArbitrary = fc.anything() as never,
}: entry.Constraints<K, V> = {}) {
  return fc.tuple(keyArbitrary, valueArbitrary) satisfies fc.Arbitrary<[key: K, value: V]>
}
export declare namespace entry {
  /**
   * ### {@link entry.Constraints `fc.entry.Constraints`} 
   * 
   * {@link entry.Constraints `fc.entry.Constraints`} can be provided as an optional
   * argument to an {@link entry `fc.entry`} arbitrary.
   */
  interface Constraints<K extends keyof never = keyof never, V = unknown> {
    keyArbitrary?: fc.Arbitrary<K>
    valueArbitrary?: fc.Arbitrary<V>
  }
}

/**
 * ### {@link entries `fc.entries`}
 *
 * Generates an arbitrary entries array (an array of key-value pairs), where the
 * first element of each entry is unique across the entries array.
 * 
 * Can be optionally constrained by passing a
 * {@link entries.Constraints `fc.entries.Constraints`} object.
 * 
 * See also:
 * - {@link entry `fc.entry`}
 * 
 * @example
 *  import { fc } from "@traversable/core"
 * 
 *  const ex_01 = fc.entries()
 *  //     ^? const ex_01: fc.Arbitrary<[key: string | number | symbol, value: unknown][]>
 *  
 *  console.log(fc.peek(ex_01)) // => []
 *  console.log(fc.peek(ex_01)) // => [["a_90!", { _e3: -0 }], [0, { _e3: -0 }], [Symbol("'"), -90123312], [19, -1], [0, undefined]]
 */
export function entries<T, const K extends entries.Constraints>(
  arb: fc.Arbitrary<T>,
  constraints?: K
): fc.Arbitrary<entries<T, entries.apply<K>>>
/// impl.
export function entries<T>(
  arb: fc.Arbitrary<T>,
  { keys, ...constraints }: entries.Constraints = {}
) {
  return fc.uniqueArray(
    fc.tuple(key(keys), arb),
    { selector: ([k]) => k, ...constraints }
  )
}

export type entries<T, K extends keyof never = string> = never | readonly (readonly [k: K, v: T])[]
export declare namespace entries {
  /**
   * ### {@link entries.Constraints `entries.Constraints`}
   * 
   * Constrain a {@link entries `fc.entries`} arbitrary by optionally passing it a
   * {@link entries.Constraints `fc.entries.Constraints`} argument.
   */
  type Constraints<T = unknown, U = unknown> = (
    & fc.UniqueArrayConstraints<T, U>
    & { keys?: key.Structural }
  )
  export type apply<T extends entries.Constraints>
    = T extends { keys: infer K extends key.Structural } ? key.apply<K> : string
}

/**
 * ### {@link constant `fc.constant`}
 * 
 * Given a constant value, produces an arbitrary that always returns that value.
 * 
 * See also:
 * - {@link constantFrom `fc.constantFrom`}
 *
 * @example
 *  import { fc } from "@traversable/core"
 * 
 *  console.log(fc.sample(fc.peek(3.141592))) // => 3.141592
 */
export function constant<const T>(value: T): fc.Arbitrary<T> { return fc.constant(value) }

/**
 * ### {@link constantFrom `fc.constantFrom`}
 *
 * Given a running array of constant values, produces an arbitrary that returns one of
 * those values.
 * 
 * If you've used `zod.enum` before, similar idea here.
 * 
 * See also:
 * - {@link constant `fc.constant`}
 * 
 * @example
 *  import { fc } from "@traversable/core"
 * 
 *  console.log(fc.sample(fc.constantFrom("north", "south", "east", "west"), 2)) // => ["north", "west"]
 */
export function constantFrom<const T extends readonly unknown[]>(...values: T): fc.Arbitrary<T[number]> {
  return fc.constantFrom(...values)
}

/**
 * ### {@link time `fc.time`}
 *
 * Generate an arbitrary time string. To control the output format, optionally provide 
 * the {@link time.Constraints `fc.time.Constraints`} argument.
 * 
 * @example
 *  import { fc } from "@traversable/core"
 * 
 *  const ex_01 = fc.time()
 *  //     ^? const ex_01: fc.Arbitrary<string>
 *  const ex_02 = fc.time({ format: "number" })
 *  //     ^? const ex_02: fc.Arbitrary<number>
 *  const ex_03 = fc.time({ format: "string" })
 *  //     ^? const ex_03: fc.Arbitrary<string>
 *  
 *  console.log(fc.peek(ex_01)) // => "13:25:33 GMT-0500 (Central Daylight Time)"
 *  console.log(fc.peek(ex_02)) // => 1727411142086
 *  console.log(fc.peek(ex_03)) // => "13:25:08 GMT-0500 (Central Daylight Time)"
 */
export function time(constraints?: time.Constraints): fc.Arbitrary<string>
export function time(constraints?: time.Constraints): fc.Arbitrary<string>
export function time(constraints?: time.Constraints): fc.Arbitrary<number>
export function time({ format, ...constraints }: time.Constraints = time.defaults) {
  return fc
  .date(constraints)
  .map((d) => 
    globalThis.Number.isNaN(d.getTime()) ? "" 
    : format === "number" ? d.getTime()
    : d.toTimeString()
  )
}
export namespace time {
  /**
   * ### {@link time.Constraints `fc.time.Constraints`}
   * 
   * Optionally constrain a {@link time `fc.time`} arbitrary. 
   * 
   * Supports targeting the "time" substring of an [ISO-8601](https://www.cl.cam.ac.uk/~mgk25/iso-time.html) 
   * date string, or milliseconds since the number of milliseconds for this date since the 
   * [epoch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date)
   * via the `"format"` property.
   */
  export interface Constraints extends fc.DateConstraints { format?: "string" | "number" }
  /**
   * ### {@link time.defaults `fc.time.defaults`}
   * 
   * Default constraints that are applied to a {@link time `fc.time`} arbitrary unless
   * specified otherwise by the user.
   */
  export const defaults = {
    format: "string",
    noInvalidDate: true,
  } satisfies time.Constraints
}

/**
 * ### {@link datetime `fc.datetime`}
 *
 * @example
 *  import { fc } from "@traversable/core"
 *  
 *  console.log(fc.sample(fc.datetime(), 1))  // => "2024-09-27T01:14:07.134Z"
 * 
 *  const ex_01 = fc.datetime()
 *  //     ^? const ex_01: fc.Arbitrary<string>
 *  const ex_02 = fc.time({ format: "number" })
 *  //     ^? const ex_02: fc.Arbitrary<number>
 *  const ex_03 = fc.time({ format: "string" })
 *  //     ^? const ex_01: fc.Arbitrary<string>
 *  
 *  console.log(fc.peek(ex_01)) // => "13:25:33 GMT-0500 (Central Daylight Time)"
 *  console.log(fc.peek(ex_02)) // => 1727411142086
 *  console.log(fc.peek(ex_03)) // => "13:25:08 GMT-0500 (Central Daylight Time)"
 */
export function datetime(constraints?: datetime.Constraints): fc.Arbitrary<string>
export function datetime({ locale, ...constraints }: datetime.Constraints = datetime.defaults) {
  return fc
    .date(constraints)
    .map((date) => 
      globalThis.Number.isNaN(date.getTime()) ? "" 
      : locale ? date.toLocaleTimeString() : date.toTimeString()
    )
}
export declare namespace datetime {
  interface Constraints extends fc.DateConstraints {
    locale?: boolean
  }
}
export namespace datetime {
  export const defaults = {
    locale: false,
  } satisfies datetime.Constraints
}

/**
 * ### {@link datestring `fc.datestring`}
 *
 * @example
 * console.log(fc.sample(fc.datestring(), 1))  // => "2024-09-27"
 */
export function datestring(constraints?: fc.DateConstraints): fc.Arbitrary<string>
export function datestring(constraints: fc.DateConstraints = {}) {
  return datetime(constraints)
    .map((dt) => dt.substring(0, 10))
}

/**
 * ### {@link stringNumeric `fc.stringNumeric`}
 *
 * @example
 * console.log(fc.sample(fc.stringNumeric(), 1))  // => "-11.424"
 */
export function stringNumeric(constraints?: fc.FloatConstraints): fc.Arbitrary<`${number}`>
export function stringNumeric(constraints?: fc.FloatConstraints) {
  return fc.oneof(fc.float(constraints).map(globalThis.String))
}

/**
 * ### {@link identifier `fc.identifier`}
 * 
 * Generates a string that satisfies:
 * 
 * > `/^[$_a-zA-Z][$_a-zA-Z0-9]*$/`
 *
 * @example
 * console.log(fc.peek(fc.identifier())) // => "b2_sd$A1B_z"
 * console.log(fc.peek(fc.identifier())) // => "10"
 * console.log(fc.peek(fc.identifier())) // => "$$$"
 */
export function identifier(constraints?: fc.StringMatchingConstraints): fc.Arbitrary<string>
export function identifier(constraints?: fc.StringMatchingConstraints) {
  return fc.stringMatching(PATTERN.identifier, constraints).filter((ident) => !(ident in KEYWORD))
}

/**
 * ### {@link pathname `fc.pathname`}
 * 
 * Generates a string that satisfies:
 * 
 * > `/^[a-zA-Z0-9._-]+$/`
 *
 * @example
 * console.log(fc.peek(fc.pathname())) // => "b2_sdA1B-.z"
 * console.log(fc.peek(fc.pathname())) // => "-0.0"
 * console.log(fc.peek(fc.pathname())) // => "...---..."
 */
export function pathname(constraints?: fc.StringMatchingConstraints): fc.Arbitrary<string>
export function pathname(constraints?: fc.StringMatchingConstraints) {
  return fc.stringMatching(PATTERN.pathname, constraints)
}

export function pathnameEZ(constraints?: fc.StringMatchingConstraints): fc.Arbitrary<string>
export function pathnameEZ(constraints?: fc.StringMatchingConstraints) {
  return fc.stringMatching(PATTERN.pathnameEZ, constraints)
}

/**
 * ### {@link optional `fc.optional`}
 *
 * @example
 * console.log(fc.sample(fc.optional(fc.nat()), 5)) // => [89, null, 4, 1190, null]
 */
export function optional<T>(arbitrary: fc.Arbitrary<T>, constraints?: fc.OneOfConstraints): fc.Arbitrary<T | undefined> & { readonly [symbol_optional]: true }
export function optional<T>(arbitrary: fc.Arbitrary<T>, constraints: fc.OneOfConstraints = {}): fc.Arbitrary<T | undefined> {
  const model = fc.oneof(constraints, arbitrary, fc.constant(undefined));
  (model as any)[symbol_optional] = true;
  return model
}

/**
 * ### {@link nullable `fc.nullable`}
 *
 * @example
 * console.log(fc.sample(fc.nullable(fc.nat()), 5)) // => [89, null, 4, 1190, null]
 */
export function nullable<T>(arbitrary: fc.Arbitrary<T>, constraints?: fc.OneOfConstraints): fc.Arbitrary<T | null>
export function nullable<T>(arbitrary: fc.Arbitrary<T>, constraints: fc.OneOfConstraints = {}) {
  return fc.oneof(constraints, arbitrary, fc.constant(null))
}

/**
 * ### {@link digit `fc.digit`}
 * @example
 * console.log(fc.sample(fc.digit(), 3)) // => [5, 1, 8]
 */
export function digit(constraints?: digit.Constraints): fc.Arbitrary<Digit>
export function digit(constraints: digit.Constraints = digit.defaults) {
  return fc
    .integer({ ...digit.defaults, ...constraints })
    .map((ix) => std.Digits[ix])
}

export namespace digit {
  export interface Constraints extends globalThis.Omit<fc.IntegerConstraints, "min" | "max"> {
    min?: std.Digit
    max?: std.Digit
  }
  export const defaults = {
    min: 0,
    max: std.Digits.length - 1 as std.Digit,
  } satisfies digit.Constraints
}

export const percent = () => fc.nat(100)
export const percentage = () => percent().map((x) => `${x}%`)

/**
 * ### {@link postalCode `fc.postalCode`}
 *
 * Generate an arbitrary US postal code.
 */
export function postalCode(constraints?: fc.OneOfConstraints): fc.Arbitrary<postalCode.Main | postalCode.Full>
export function postalCode(constraints: fc.OneOfConstraints = {}) {
  return fc.oneof(
    constraints,
    postalCode.Main,
    postalCode.Full,
  )
}

export namespace postalCode {
  export type Main = `${number}${number}${number}${number}${number}`
  export const Main = fc.stringMatching(/^\d{5}$/) as fc.Arbitrary<postalCode.Main>
  export type Extension = `${number}${number}${number}${number}`
  export const Extension = fc.stringMatching(/^\d{4}$/) as fc.Arbitrary<postalCode.Extension>
  export type Full = `${Main}-${Extension}`
  export const Full: fc.Arbitrary<postalCode.Full> = fc
    .tuple(postalCode.Main, postalCode.Extension)
    .map(([code, ext]) => `${code}-${ext}` as const)
}


/**
 * ### {@link country `fc.country`}
 *
 * Generate an arbitrary {@link std.Country `Country`}, as defined
 * by [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2).
 *
 * See also:
 * - {@link std.Country `std.Country`}
 * - {@link state `fc.state`}
 *
 * @example
 * console.log(fc.sample(fc.country(), 3)) // => [{ name: "United States", code: "US" }, { name: "Malaysia", code: "MY" }]
 */
export function country(): fc.Arbitrary<Country> {
  return fc
    .nat(std.Countries.length - 1)
    .map((ix) => std.Countries[ix])
}

export namespace country {
  export type Code = std.Country["code"]
  export function code(): fc.Arbitrary<country.Code> {
    return country().map((c) => c.code)
  }
}

/**
 * ### {@link state `fc.state`}
 *
 * Generate an arbitrary {@link std.State `US State`}, as defined by
 * [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2).
 *
 * See also:
 * - {@link std.State `std.State`}
 * - {@link country `fc.country`}
 *
 * @example
 * console.log(fc.sample(fc.state.name(), 2)) // => [{ name: "Arizona", code: "AZ" }, { name: "Texas", code: "TX" }]
 */
export function state(): fc.Arbitrary<State>
export function state() {
  return fc
    .nat(std.UnitedStatesOfAmerica.length - 1)
    .map((ix) => std.UnitedStatesOfAmerica[ix])
}

export namespace state {
  export const _internal = fc
    .nat(std.UnitedStatesOfAmerica.length - 1)
    .map((ix) => std.UnitedStatesOfAmerica[ix])

  export type Code = std.UnitedStateOfAmerica["code"]
  /**
   * ### {@link code `fc.state.code`}
   *
   * Generate an arbitrary 2-letter abbreviation representing a US state.
   *
   * @example
   *  
   *  console.log(fc.peek(fc.state.code())) // => "AZ"
   *  console.log(fc.peek(fc.state.code())) // => "TX"
   */
  export function code(): fc.Arbitrary<std.UnitedStateOfAmerica["code"]> {
    return state().map((s) => s.code)
  }
}

export type Phone<
  D extends phone.Delimiter,
  _ extends
  | phone.Delimiters<D>
  = phone.Delimiters<D>
> = `${number}${_[0]}${number}${_[1]}${number}`

/**
 * ### {@link phone `fc.phone`}
 *
 * Generate an arbitrary US phone number.
 *
 * @example
 *  import { fc } from "@traversable/core"
 * 
 *  console.log(fc.peek(fc.phone()))                   // => "5559198900"
 *  console.log(fc.peek(fc.phone({ delimiter: "-" }))) // => "555-919-8900"
 */
export function phone<const T extends phone.Delimiter>(constraints?: phone.Constraints<T>): fc.Arbitrary<Phone<T>>
/// impl.
export function phone(constraints?: phone.Constraints) {
  const [L, R] 
    = constraints?.delimiter == null ? phone.defaults.delimiter
    : typeof constraints.delimiter === "string" ? [constraints.delimiter, constraints.delimiter]
    : constraints.delimiter
  return phone.components
    .map(([prefix, exchange, line]) => `${prefix}${L}${exchange}${R}${line}`)
}

export namespace phone {
  export type Delimiter = string | readonly [left: string, right: string]
  export type Delimiters<T extends phone.Delimiter> = T extends string ? [T, T] : T
  export type Prefix = `${number}${number}${number}`
  export interface Constraints<D extends phone.Delimiter = phone.Delimiter> {
    delimiter?: D
    includeCountryCode?: boolean
  }
  export const defaults = {
    /** 
     * #### {@link defaults.delimiter `fc.phone.defaults.delimiter`} 
     * 
     * The default value that will be used
     * **Note:** This constraint is currently __unimplemented__
     */
    delimiter: ["", ""],
    /** 
     * #### {@link defaults.includeCountryCode `fc.phone.defaults.includeCountryCode`} 
     * 
     * **Note:** This constraint is currently __unimplemented__
     */
    includeCountryCode: false
  } satisfies Required<phone.Constraints>
  export const prefix = fc
    .tuple(digit(), digit(), digit())
    .map(([x, y, z]) => `${x}${y}${z}`) as fc.Arbitrary<phone.Prefix>
  export type Exchange = `${number}${number}${number}`
  export const exchange = fc
    .tuple(digit(), digit(), digit())
    .map(([x, y, z]) => `${x}${y}${z}`) as fc.Arbitrary<phone.Exchange>
  export type Line = `${number}${number}${number}${number}`
  export const line = fc
    .tuple(digit(), digit(), digit(), digit())
    .map(([w, x, y, z]) => `${w}${x}${y}${z}`) as fc.Arbitrary<phone.Line>
  export type Components = [
    `${number}${number}${number}`,
    `${number}${number}${number}`,
    `${number}${number}${number}${number}`,
  ]
  export const components: fc.Arbitrary<phone.Components> = fc.tuple(
    phone.prefix,
    phone.exchange,
    phone.line,
  )
}

export function currency(): fc.Arbitrary<Currency>
export function currency() {
  return fc
    .nat(std.Currencies.length - 1)
    .map((ix) => std.Currencies[ix])
}

export namespace currency {
  export function code(): fc.Arbitrary<Currency["code"]> {
    return currency().map((_) => _.code)
  }
}

export function flags<FF extends string>(...flags: FF[]): fc.Arbitrary<{ [F in FF]+?: boolean }>
export function flags<FF extends string>(flags: { [x: string]: FF }): fc.Arbitrary<{ [F in FF]+?: boolean }>
export function flags(...args: flags.anyArgs) {
  return fn.pipe(
    args,
    flags.fromArgs,
    object.values,
    map(flags.entry),
    object.fromEntries,
    (model) => fc.record(model, { requiredKeys: [] }),
  )
}

export declare namespace flags {
  type anyArgs<FF extends string = string> = 
    | [...flags: FF[]]
    | [flags: { [x: string]: FF }]
    ;
}
export namespace flags {
  /** @internal */
  const isKeys = (u: readonly unknown[]): u is string[] => 
    globalThis.Array.isArray(u) && u.every((x) => typeof x === "string")
  export const fromArgs 
    : <FF extends string>(args: [{ [x: string]: FF }] | FF[]) => { [x: number]: FF }
    = (args) => isKeys(args) ? args : args[0]
  export const entry 
    : <FF extends string>(flag: FF) => [flag: FF, value: fc.Arbitrary<boolean>]
    = (flag) => [flag, fc.boolean()]
}

export function dictionary<T>(
  valueArb: fc.Arbitrary<T>, 
  constraints?: dictionary.Constraints
): fc.Arbitrary<globalThis.Record<string, T>>

export function dictionary<K extends string, T>(
  keyArb: fc.Arbitrary<K>,
  valueArb: fc.Arbitrary<T>, 
  constraints?: dictionary.Constraints
): fc.Arbitrary<globalThis.Record<K, T>>

export function dictionary<K extends string, T>(
  ...args: dictionary.allArgs<T, K>
): fc.Arbitrary<globalThis.Record<K, T>> {
  if (args.length === 3) return fc.dictionary(...args)
  else if (args.length === 1) return fc.dictionary(identifier(), args[0])
  else if (args.length === 2 && isArbitrary(args[1])) return fc.dictionary(args[0] as never, args[1])
  else return fc.dictionary(identifier(), args[0] as never, (args[1] ?? {}) as never)
}

export declare namespace dictionary {
  interface Constraints extends fc.DictionaryConstraints {}
  type allArgs<T = unknown, K extends string = string> = 
    | [valueArb: fc.Arbitrary<T>, constraints?: fc.DictionaryConstraints]
    | [keyArb: fc.Arbitrary<K>, valueArb: fc.Arbitrary<T>, constraints?: fc.DictionaryConstraints]
}

/**
 * ### {@link fix `fc.fix`}
 * 
 * Arbitrary representing a string numeric that has been converted to "fixed-point" notation.
 * 
 * See also: 
 * - {@link globalThis.Number.prototype.toFixed `Number.prototype.toFixed`}
 *
 * @example
 * console.log(fc.peek(fc.fix(1)))                     // => 5.6
 * console.log(fc.peek(fc.fix(2)))                     // => -101031.12
 * console.log(fc.peek(fc.fix(3)))                     // => 404.923
 * console.log(fc.peek(fc.fix(2, { min: 0, max: 1 }))) // => 0.98
 */
export const fix 
  : (n: number, constraints?: fc.IntegerConstraints) => fc.Arbitrary<number>
  = (n, constraints) => fc.tuple(
    fc.integer(constraints), 
    fc.nat(10 ** n),
  ).map(([base, dec]) => +((base + (dec === 0 ? dec : dec / (10 ** n))).toFixed(n)))


namespace char {

}

type Token =
  | Token.Char
  | Token.Repetition
  | Token.Quantifier
  | Token.Alternative
  | Token.CharacterClass
  | Token.ClassRange
  | Token.Group
  | Token.Disjunction
  | Token.Assertion
  | Token.Backreference

declare namespace Token {
  type Char = {
    type: 'Char'
    kind: 'meta' | 'simple' | 'decimal' | 'hex' | 'unicode'
    symbol: string | undefined
    value: string
    codePoint: number
    escaped?: true
  }
  type Repetition = {
    type: 'Repetition'
    expression: Token
    quantifier: Token.Quantifier
  }
  type Quantifier = 
    | {
      type: 'Quantifier'
      kind: '+' | '*' | '?'
      greedy: boolean
    } 
    | {
      type: 'Quantifier'
      kind: 'Range'
      greedy: boolean
      from: number
      to: number | undefined
    }
  type Alternative = {
    type: 'Alternative'
    expressions: Token[]
  }

  type CharacterClass = {
    type: 'CharacterClass'
    expressions: Token[]
    negative?: true
  }

  type Group =
    | {
      type: 'Group'
      capturing: true
      number: number
      expression: Token
    }
    | {
      type: 'Group'
      capturing: true
      nameRaw: string
      name: string
      number: number
      expression: Token
    }
    | {
      type: 'Group'
      capturing: false
      expression: Token
    }
  type Disjunction = {
    type: 'Disjunction'
    left: Token | null
    right: Token | null
  }
  type Assertion =
    | {
        type: 'Assertion'
        kind: '^' | '$'
        negative?: true
      }
    | {
      type: 'Assertion'
      kind: 'Lookahead' | 'Lookbehind'
      negative?: true
      assertion: Token
    }
  type Backreference =
    | {
      type: 'Backreference'
      kind: 'number'
      number: number
      reference: number
    }
    | {
      type: 'Backreference'
      kind: 'name'
      number: number
      referenceRaw: string
      reference: string
    }
    type ClassRange = {
      type: 'ClassRange'
      from: Token.Char
      to: Token.Char
    }
  }
namespace Token {
  export const char 
    : <K extends Token.Char['kind']>(kind: K, char: string, escaped?: true) => Token.Char
    = <K extends Token.Char['kind']>(kind: K, char: string, escaped?: true) => ({
      type: 'Char',
      kind,
      value: char,
      symbol: char,
      codePoint: char.codePointAt(0) ?? -1,
      escaped,
    } satisfies Token.Char)
}

const TOKEN_MAP = {
  '\\w': 'METACHAR_WORD',
  '\\W': '!METACHAR_WORD',
  '\\d': 'METACHAR_DIGIT',
  '\\D': '!METACHAR_DIGIT',
  '\\s': 'METACHAR_SPACE',
  '\\S': '!METACHAR_SPACE',
  '\\b': 'METACHAR_BREAK',
  '\\B': '!METACHAR_BREAK',
  '.': 'METACHAR'
}

/** 
 * ## {@link pattern `pattern`}
 * 
 * Generates a seed that can be parsed by {@link fc.stringMatching `fc.stringMatching`}
 * to produce an arbitrary string matching the pattern.
 * 
 * The use case for {@link pattern} is when you're generating an arbitrary
 * Arbitrary. Given that use case, you can't know or care _what_ arbitrary will be
 * generated, but need to know that the spec that you're generating is sound, and
 * that the arbitrary generator is capable of generating arbitraries capable of satisfying
 * their own spec.
 */
// export const pattern
//   : () => { }
//   = () => {
//   }
// export declare namespace pattern {
// }
