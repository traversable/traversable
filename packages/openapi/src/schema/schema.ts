import { type JsonSchema, core, fc, tree, Traversable } from "@traversable/core"
import type { record as Record, keys } from "@traversable/data"
import { fn, integer } from "@traversable/data"
import type { Require, inline } from "@traversable/registry"
import { PATTERN, REPLACER } from "@traversable/registry"

import { type Schema, type arbitrary, format } from "../types.js"
import type * as t from "../types.js"
import {
  DataType,
} from "../types.js"

export {
  type $ref,
  type Schema_combinator as combinator,
  type Schema_composite as composite,
  type Schema_F as F,
  type Schema_Node as Node,
  type Schema_scalar as scalar,
  ///
  Schema_is as is,
  Schema_isBoolean as isBoolean,
  Schema_isInteger as isInteger,
  Schema_isNull as isNull,
  Schema_isNumber as isNumber,
  Schema_isString as isString,
  ///
  Schema_isArray as isArray,
  Schema_isTuple as isTuple,
  Schema_isRecord as isRecord,
  Schema_isObject as isObject,
  Schema_isAllOf as isAllOf,
  Schema_isAnyOf as isAnyOf,
  Schema_isOneOf as isOneOf,
  ///
  Schema_isScalar as isScalar,
  Schema_isCombinator as isCombinator,
  Schema_isRef as isRef,
  Schema_isConst as isConst,
  ///
  Schema_tag as tag,
  Schema_kinds as kinds,
} from "../types.js"

/** @internal */
const Number_NaN = globalThis.Number.NaN
/** @internal */
const Number_isNaN = globalThis.Number.isNaN
/** @internal */
const Math_min = globalThis.Math.min
/** @internal */
const Math_max = globalThis.Math.max
/** @internal */
const Math_abs = globalThis.Math.abs
/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
function typed<T extends string>(type: T):
  { type: fc.Arbitrary<T> }
function typed<T extends string, S extends Record.of<fc.Arbitrary.any>>
  (type: T, shape?: S): S & { type: fc.Arbitrary<T> }
function typed(type: string, shape = {}) /// impl.
  { return { ...shape, /* ...base, */ type: fc.constant(type) } }

// TODO: move
export function keysDoMeet(lhk: keys.any, rhk: keys.any) {
  return lhk.some((l) => rhk.includes(l)) || rhk.some((r) => lhk.includes(r))
}

/**
 * ## {@link optionally `optionally`}
 *
 * Spread objects and arrays that may or may not be defined with a uniform syntax.
 *
 * @example
 *  const ex_01 = {
 *    a: 1,
 *    b: 2,
 *    ...optionally({ c: 3 }),
 *  }
 *
 *  ex_01
 *  // ^? const ex_01: { c?: 3, a: number, b: number }
 *
 *  const ex_02 = [
 *    4,
 *    5,
 *    ...optionally(Math.random() > 0.5 && [6, 7] as const),
 *  ] as const
 *
 *  ex_02
 *  // ^? const ex_02: readonly [4, 5] | readonly [4, 5, 6, 7]
 *
 *  const maybe = (i?: { i: 8 }) => ({
 *    g: 7,
 *    h: 8,
 *    ...optionally(i),
 *  })
 *
 *  const ex_03 = maybe()
 *  //    ^? const ex_03: { g: 7, h: 8, i?: 9 }
 */
function optionally<const T extends readonly unknown[]>(maybeArray?: T | boolean): T | []
function optionally<const T extends { [x: string]: unknown }>(maybeObject?: T | boolean): { [K in keyof T]+?: T[K] }
function optionally<const T extends { [x: string]: unknown }>(_?: T) {
  return !_ ? [] : !_[Object_keys(_)[0]] ? [] : _
}

namespace Bounded {
  export function absorbNaN<K extends string>(key: K, x?: number): { [P in K]+?: number }
  export function absorbNaN(key: string, x?: number) {
    return { ...(!Number_isNaN(globalThis.Number(x)) && { [key]: x }) }
  }
  export const minimumOf = (x?: number, y?: number) =>
    Math_min(x ?? Number_NaN, y ?? Number_NaN)
  export const maximumOf = (x?: number, y?: number) =>
    x === y ? Number_NaN : Math_max(x ?? Number_NaN, y ?? Number_NaN)
  export const factorOf = (lo?: number, hi?: number) => {
    if (!lo) return Number_NaN
    else if (!hi) return Number_NaN
    else {
      const x = integer.gcd(lo, hi)
      const abs = Math_abs(+x)
      return (
        abs === 1 ||
        abs === Math_abs(lo) ||
        abs === Math_abs(hi)
      ) ? Number_NaN : +x
    }
  }
}

/** @internal */
const RFC_3339 = fc.date({ noInvalidDate: true })
/** @internal */
const RFC_3339_DATETIME = RFC_3339.map((d) => d.toISOString())
/** @internal */
const RFC_3339_DATE = RFC_3339_DATETIME.map((ds) => ds.substring(0, 10))
/** @internal */
const RFC_3339_TIME = RFC_3339.map((d) => d.toISOString().substring(11))

/** @internal */
const EXAMPLE = {
  date: RFC_3339_DATE,
  datetime: RFC_3339_DATETIME,
  time: RFC_3339_TIME,
  uri: fc.webUrl({ withQueryParameters: true, withFragments: true }),
  uuid: fc.uuid({ version: 7 }),
  ulid: fc.ulid(),
  email: fc.emailAddress(),
} as const
///
export function datetime(constraints: Constraints.Config = Constraints.defaults) {
  return {
    format: fc.constant("date-time"),
    ...constraints.base.include.example && { example: EXAMPLE.datetime },
  }
}
export function date($: Constraints.Config = Constraints.defaults) {
  return {
    format: fc.constant("date"),
    ...$.base.include.example && { example: EXAMPLE.date },
  }
}
export function uuid(constraints: Constraints.Config = Constraints.defaults) {
  return {
    format: fc.constant("uuid"),
    ...constraints.base.include.example && { example: EXAMPLE.uuid },
  }
}
export function ulid(constraints: Constraints.Config = Constraints.defaults) {
  return {
    format: fc.constant("ulid"),
    ...constraints.base.include.example && { example: EXAMPLE.ulid },
  }
}
export function uri(constraints: Constraints.Config = Constraints.defaults) {
  return {
    format: fc.constant("uri"),
    ...constraints.base.include.example && { example: EXAMPLE.uri },
  }
}
export function email(constraints: Constraints.Config = Constraints.defaults) {
  return {
    format: fc.constant("email"),
    ...constraints.base.include.example && { example: EXAMPLE.email },
  } satisfies Record<string, fc.Arbitrary<unknown>>
}

interface NumericConstraints32 { min32?: number, max32?: number }
interface NumericConstraints64 { min64?: number, max64?: number }
interface NumericConstraints {
  format?: string
  minimum?: number
  maximum?: number
  exclusiveMinimum?: boolean | number
  exclusiveMaximum?: boolean | number
  multipleOf?: number
}

const minmax
  : (constraints?: NumericConstraints & NumericConstraints32 & NumericConstraints64) => NumericConstraints
  = ({ minimum: min, maximum: max, format, min32, min64, max32, max64, ..._ } = {}) => {
    const minimum = format === "int32" ? min32 : format === "int64" ? min64 : min
    const maximum = format === "int32" ? max32 : format === "int64" ? max64 : max
    const out = {
      format,
      ..._,
      ...Bounded.absorbNaN("minimum", Bounded.minimumOf(minimum, maximum)),
      ...Bounded.absorbNaN("maximum", Bounded.maximumOf(minimum, maximum)),
    }
    return out
  }

const constrainNumeric = (options?: { includeMultipleOf?: boolean }) => fn.flow(
  minmax,
  ({ format, minimum: min, maximum: max, exclusiveMinimum: gt, exclusiveMaximum: lt, ..._ }) => ({
    minimum: min,
    maximum: max,
    ...options?.includeMultipleOf && Bounded.absorbNaN("multipleOf", Bounded.factorOf(
      typeof min === "number" && gt !== true ? min : Number_NaN,
      typeof max === "number" && lt !== true ? max : Number_NaN,
    )),
    ...(gt === true && typeof min === "number" && { exclusiveMinimum: gt }),
    ...(lt === true && typeof max === "number" && { exclusiveMaximum: lt }),
  })
)


//////////////////
///    NULL    ///
export { Schema_null as null }

Schema_null.defaults = {
  arbitrary: Schema_null.base,
} satisfies Schema_null.Constraints
Schema_null.requiredKeys = [
  "type",
] as const satisfies string[]
Schema_null.static = {
  nullable: fc.constant(true),
}

Schema_null.base = ($: Constraints.Config): fc.Arbitrary<Schema_null> =>
  fc.record(
    typed(
      DataType.null,
      Schema_null.static
    ), {
      requiredKeys: Schema_null.requiredKeys
    }
  )

interface Schema_null<T = unknown, M extends {} = {}> extends t.Schema_null<T, M> {}
declare namespace Schema_null {
  interface Constraints<T = unknown> extends
    Partial<Constraints.Base<T>> {
      arbitrary: typeof Schema_null.base
    }
}

/**
 * ## {@link Schema_null `openapi.Schema.null`}
 *
 * An opinionated and extensible pseudo-random generator of "null" JSON Schema / OpenAPI 3.1 nodes.
 */
function Schema_null(constraints?: Constraints): fc.Arbitrary<Schema_null>
function Schema_null(_?: Constraints): fc.Arbitrary<Schema_null> {
  const $ = Constraints.configure(_)
  return $.null.arbitrary($)
}
///    NULL    ///
//////////////////


/////////////////////
///    BOOLEAN    ///
export { Schema_boolean as boolean }

Schema_boolean.defaults = {
  arbitrary: Schema_boolean.base,
} satisfies Schema_boolean.Constraints
Schema_boolean.requiredKeys = [
  "type",
] as const satisfies string[]
Schema_boolean.static = {}

Schema_boolean.base = ($: Constraints.Config): fc.Arbitrary<Schema_boolean> =>
  fc.record(
    typed(
      DataType.boolean,
      Schema_boolean.static,
    ), {
      requiredKeys: Schema_boolean.requiredKeys
    }
  )

interface Schema_boolean<T = unknown, M extends {} = {}> extends t.Schema_boolean<T, M> {}
declare namespace Schema_boolean {
  interface Constraints<T = unknown> extends
    Partial<Constraints.Base<T>> {
      arbitrary: typeof Schema_boolean.base
    }
}

/**
 * ## {@link Schema_boolean `openapi.Schema.boolean`}
 *
 * An opinionated and extensible pseudo-random generator of "boolean" JSON Schema / OpenAPI 3.1 nodes.
 */
function Schema_boolean(constraints?: Constraints): fc.Arbitrary<Schema_boolean>
function Schema_boolean(_?: Constraints): fc.Arbitrary<Schema_boolean> {
  const $ = Constraints.configure(_)
  return $.boolean.arbitrary($)
}
///    BOOLEAN    ///
/////////////////////


/////////////////////
///    INTEGER    ///
export { Schema_integer as integer }

Schema_integer.defaults = {
  arbitrary: Schema_integer.base,
} satisfies Schema_integer.Constraints
Schema_integer.requiredKeys = [
  "type",
  "min32",
  "max32",
  "min64",
  "max64",
] as const satisfies string[]
Schema_integer.static = {
  format: fc.oneof(format.integer, format.any),
  minimum: fc.integer({ min: -0x5000, max: +0x5000 }),
  maximum: fc.integer({ min: -0x5000, max: +0x5000 }),
  min32: fc.integer({ min: -0x80000000, max: +0x80000000 }),
  max32: fc.integer({ min: -0x80000000, max: +0x80000000 }),
  min64: fc.integer({ min: -0x1fffffffffffff, max: +0x1fffffffffffff }),
  max64: fc.integer({ min: -0x1fffffffffffff, max: +0x1fffffffffffff }),
  exclusiveMinimum: fc.boolean(),
  exclusiveMaximum: fc.boolean(),
}

Schema_integer.base = ($: Constraints.Config): fc.Arbitrary<Schema_integer> =>
  fc.record(
    typed(
      DataType.integer,
      Schema_integer.static,
    ), {
      requiredKeys: Schema_integer.requiredKeys
    },
  ).map(({ type, format, ..._ }) => ({
    type,
    format,
    ...constrainNumeric({ includeMultipleOf: true })({ ..._, format }),
  })
)

interface Schema_integer<T = unknown, M extends {} = {}> extends t.Schema_integer<T, M> {}
declare namespace Schema_integer {
  interface Constraints<T = unknown> extends
    Partial<Constraints.Base<T>> {
      arbitrary: typeof Schema_integer.base
    }
}

/**
 * ## {@link Schema_integer `openapi.Schema.integer`}
 *
 * An opinionated and extensible pseudo-random generator of "integer" JSON Schema /
 * OpenAPI 3.1 nodes.
 *
 * See also:
 * - {@link Schema_number `openapi.Schema.number`}
 */
function Schema_integer(constraints?: Constraints): fc.Arbitrary<Schema_integer>
function Schema_integer(_?: Constraints): fc.Arbitrary<Schema_integer> {
  const $ = Constraints.configure(_)
  return $.integer.arbitrary($)
}
///    INTEGER    ///
/////////////////////


////////////////////
///    NUMBER    ///
export { Schema_number as number}

Schema_number.defaults = {
  arbitrary: Schema_number.base,
} satisfies Schema_number.Constraints
Schema_number.requiredKeys = [
  "type",
] as const satisfies string[]
Schema_number.static = {
  format: fc.oneof(format.number, format.any),
  minimum: fc.fix(2, { min: -0x100_000, max: +0x100_000 }),
  maximum: fc.fix(2, { min: -0x100_000, max: +0x100_000 }),
  exclusiveMinimum: fc.boolean(),
  exclusiveMaximum: fc.boolean(),
}

Schema_number.base = ($: Constraints.Config): fc.Arbitrary<Schema_number> =>
  fc.record(
    typed(
      DataType.number,
      Schema_number.static,
    ), {
      requiredKeys: Schema_number.requiredKeys
    },
  ).map(({ type, format, ..._ }) => ({
    type,
    format,
    ...constrainNumeric({ includeMultipleOf: false })(_),
  })
)

interface Schema_number<T = unknown, M extends {} = {}> extends t.Schema_number<T, M> {}
declare namespace Schema_number {
  interface Constraints<T = unknown> extends
    Partial<Constraints.Base<T>> {
      arbitrary: typeof Schema_number.base
    }
}

/**
 * ## {@link Schema_number `openapi.Schema.number`}
 *
 * An opinionated and extensible pseudo-random generator of "number" JSON Schema /
 * OpenAPI 3.1 nodes.
 *
 * See also:
 * - {@link Schema_integer `openapi.Schema.integer`}
 */
function Schema_number(constraints?: Constraints): fc.Arbitrary<Schema_number>
function Schema_number(_?: Constraints): fc.Arbitrary<Schema_number> {
  const $ = Constraints.configure(_)
  return $.number.arbitrary($)
}
///    NUMBER    ///
////////////////////


////////////////////
///    STRING    ///
export { Schema_string as string }

Schema_string.defaults = {
  arbitrary: Schema_string.base,
} satisfies Schema_string.Constraints
Schema_string.requiredKeys = [
  "type",
] as const satisfies string[]
Schema_string.format = (constraints: Constraints.Config) => fc.oneof(
  fc.record(date(constraints), { requiredKeys: [] }),
  fc.record(datetime(constraints), { requiredKeys: [] }),
  fc.record(email(constraints), { requiredKeys: [] }),
  fc.record(ulid(constraints), { requiredKeys: [] }),
  fc.record(uuid(constraints), { requiredKeys: [] }),
  fc.record(uri(constraints), { requiredKeys: [] }),
)
Schema_string.static = {
  minLength: fc.integer({ min: -0x100, max: +0x00 }),
  maxLength: fc.integer({ min: -0x100, max: +0x00 }),
  pattern: fc.string({ minLength: +0x1, maxLength: +0x20 }).map(escapeRegularExpression),
}

function escapeRegularExpression(pattern: string) {
  return new RegExp(pattern.replace(PATTERN.escapeRegExp, `\\${REPLACER.Match}`)).toString()
}

Schema_string.base = ($: Constraints.Config): fc.Arbitrary<Schema_string> => {
  return fc.tuple(
    fc.option(Schema_string.format($), { nil: void 0 }),
    fc.record({
      type: fc.constant(DataType.string),
      ...Schema_string.static,
      ...$.base.include?.example && { example: fc.lorem() },
      ...$.base.include?.description && { description: fc.lorem() },
    },
    { requiredKeys: ["type"] }),
  )
  .map(([format, { example, minLength: _min, maxLength: _max, pattern, ...body }]) => {
    const min = Bounded.minimumOf(_min, _max)
    const max = Bounded.maximumOf(_min, _max)
    const { minLength } = Bounded.absorbNaN(
      "minLength",
      ( ["date", "date-time"].includes(format?.format ?? "") ? Number.NaN
      : ["email", "ulid", "uuid", "uri"].includes(format?.format ?? "") ? min % 0
      : min
      )
    )
    const { maxLength } = Bounded.absorbNaN(
      "maxLength",
      ( ["date", "date-time"].includes(format?.format ?? "") ? Number.NaN
      : ["email", "ulid", "uuid", "uri"].includes(format?.format ?? "") ? max % 0
      : max )
    )
    return {
      ...format,
      ...!["date", "date-time"].includes(format?.format ?? "") && {
        minLength,
        maxLength,
      },
      ...body,
      ...!format && pattern && { pattern },
      ...optionally({ example: format?.example ?? example }),
    }
  })
}

interface Schema_string<T = unknown, M extends {} = {}> extends t.Schema_string<T, M> {}
declare namespace Schema_string {
  interface Constraints<T = unknown> extends
    Partial<Constraints.Base<T>> {
      arbitrary: typeof Schema_string.base,
    }
}

/**
 * ## {@link Schema_string `openapi.Schema.string`}
 *
 * An opinionated and extensible pseudo-random generator of "string" JSON Schema /
 * OpenAPI 3.1 nodes.
 */
function Schema_string(constraints?: Constraints): fc.Arbitrary<Schema_string>
function Schema_string(_?: Constraints): fc.Arbitrary<Schema_string> {
  const $ = Constraints.configure(_)
  return $.string.arbitrary($)
}
///    STRING    ///
////////////////////


////////////////////
///    RECORD    ///
export { Schema_record as record }
Schema_record.requiredKeys = [
  "type",
  "additionalProperties",
] as const satisfies string[]
Schema_record.defaults = {
  arbitrary: Schema_record.base,
} satisfies Schema_record.Constraints

Schema_record.base = <T>(
  LOOP: fc.Arbitrary<T>,
  $: Constraints.Config
): fc.Arbitrary<Schema_record<T>> =>
  fc.record({
    type: fc.constant(DataType.object),
    additionalProperties: LOOP,
  }, {
    requiredKeys: Schema_record.requiredKeys
  }
)

interface Schema_record<T = unknown, M extends {} = {}> extends t.Schema_record<T, M> {}
declare namespace Schema_record {
  interface Constraints<T = unknown> extends
    Partial<Constraints.Base<T>> {
      arbitrary: typeof Schema_record.base
    }
}

/**
 * ## {@link Schema_record `openapi.Schema.record`}
 *
 * An opinionated and extensible pseudo-random generator of "record" JSON Schema /
 * OpenAPI 3.1 nodes.
 *
 * A "record" in this context specifies a _non-finite_ object, rather than
 * a _finite_ object.
 *
 * We can draw an analogy between arrays and records on the one hand, and
 * tuples and objects on the other:
 *
 * ```
 * //   [non-finite]               ->                  [finite]
 * // array  :  record             ::               tuple  :  object
 * Array<T>  :  Record<string, T>  ::  [x: T, y: T, z: T]  :  { x: T, y: T, z: T }
 * ```
 *
 * In practice, the difference between a record vs. an object is that
 * __a record will never have a `properties` field__.
 *
 * See also:
 * - {@link Schema_object `openapi.Schema.object`}
 */
function Schema_record<T>
  (model: fc.Arbitrary<T>, constraints?: Constraints):
    fc.Arbitrary<Schema_record<T>>
///
function Schema_record<T>(LOOP: fc.Arbitrary<T>, _?: Constraints) {
  const $ = Constraints.configure(_)
  return $.record.arbitrary(LOOP, $)
}
///    RECORD    ///
////////////////////


////////////////////
///    ALL OF    ///
export { Schema_allOf as allOf }

Schema_allOf.requiredKeys = [
  "allOf",
] as const satisfies string[]
Schema_allOf.defaults = {
  arbitrary: Schema_allOf.base,
  comparator: keysDoMeet,
  minLength: 1,
  maxLength: 3,
  selector: Object_keys as never,
} satisfies Schema_allOf.Constraints

Schema_allOf.base = <T>(
  LOOP: fc.Arbitrary<T>,
  $: Constraints.Config,
): fc.Arbitrary<Schema_allOf<T>> =>
  fc.record({
    allOf: fc.uniqueArray(
      LOOP,
      $.allOf
    )
  }, {
    requiredKeys: Schema_allOf.requiredKeys
  },
)

interface Schema_allOf<T = unknown, M extends {} = {}> extends t.Schema_allOf<T, M> {}
declare namespace Schema_allOf {
  interface Constraints<S = any, T = any> extends
    Partial<Constraints.Base<T>>,
    Partial<fc.UniqueArrayConstraintsCustomCompareSelect<S, T>> {
      arbitrary: (model: fc.Arbitrary<T>, constraints: Constraints.Config) => fc.Arbitrary<Schema_allOf<T>>
      // arbitrary: typeof Schema_allOf.base
    }
}

/**
 * ## {@link Schema_allOf `openapi.Schema.allOf`}
 *
 * An opinionated and extensible pseudo-random generator of "allOf" JSON Schema /
 * OpenAPI 3.1 nodes.
 *
 * JSON Schema's `allOf` combinator corresponds to the `&` operator in TypeScript,
 * which combines its arguments under intersection.
 *
 * See also:
 * - {@link Schema_anyOf `openapi.Schema.anyOf`}
 * - {@link Schema_oneOf `openapi.Schema.oneOf`}
 */
function Schema_allOf<T>
  (model: fc.Arbitrary<T>, constraints?: Constraints): 
    fc.Arbitrary<Schema_allOf<T>>
///
function Schema_allOf<T>(
  LOOP: fc.Arbitrary<T>,
  _: Constraints = Constraints.defaults
): fc.Arbitrary<Schema_allOf<T>> {
  const $ = Constraints.configure(_)
  return $.allOf.arbitrary(LOOP, $)
}
///    ALL OF    ///
////////////////////


////////////////////
///    ANY OF    ///
export { Schema_anyOf as anyOf }

Schema_anyOf.requiredKeys = [
  "anyOf",
] as const satisfies string[]
Schema_anyOf.defaults = {
  arbitrary: Schema_anyOf.base,
  minLength: 1,
  maxLength: 3,
} satisfies Schema_anyOf.Constraints

Schema_anyOf.base = <T>(
  LOOP: fc.Arbitrary<T>,
  $: Constraints.Config
): fc.Arbitrary<Schema_anyOf<T>> =>
  fc.record({
    anyOf: fc.uniqueArray(
      LOOP,
      $.anyOf
    )
  }, {
    requiredKeys: Schema_anyOf.requiredKeys
  }
)

interface Schema_anyOf<T = unknown, M extends {} = {}> extends t.Schema_anyOf<T, M> {}
declare namespace Schema_anyOf {
  type Constraints<T = unknown, U = unknown> = (
    & fc.UniqueArrayConstraints<T, U>
    & Partial<Constraints.Base<T>>
    & { arbitrary: typeof Schema_anyOf.base }
  )
}

/**
 * ## {@link Schema_anyOf `openapi.Schema.anyOf`}
 *
 * An opinionated and extensible pseudo-random generator of "anyOf" JSON Schema /
 * OpenAPI 3.1 nodes.
 *
 * JSON Schema's `anyOf` combinator corresponds to the `|` operator in TypeScript.
 *
 * See also:
 * - {@link Schema_allOf `openapi.Schema.allOf`}
 * - {@link Schema_oneOf `openapi.Schema.oneOf`}
 */
function Schema_anyOf<T>
  (model: fc.Arbitrary<T>, constraints?: Constraints): 
    fc.Arbitrary<Schema_anyOf<T>>
///
function Schema_anyOf<T>(
  LOOP: fc.Arbitrary<T>, 
  _: Constraints = Constraints.defaults
): fc.Arbitrary<Schema_anyOf<T>> {
  const $ = Constraints.configure(_)
  return $.anyOf.arbitrary(LOOP, $)
}
///    ANY OF    ///
////////////////////


////////////////////
///    ONE OF    ///
export { Schema_oneOf as oneOf }
Schema_oneOf.defaults = {
  arbitrary: Schema_oneOf.base,
  minLength: 1,
  maxLength: 3,
} satisfies Schema_oneOf.Constraints

Schema_oneOf.base = <T>(
  LOOP: fc.Arbitrary<T>,
  $: Constraints.Config
): fc.Arbitrary<Schema_oneOf<T>> =>
  fc.record({
    oneOf: fc.uniqueArray(
      LOOP,
      $.oneOf
    )
  }, {
    requiredKeys: ["oneOf"]
  },
)

interface Schema_oneOf<T = unknown, M extends {} = {}> extends t.Schema_oneOf<T, M> {}
declare namespace Schema_oneOf {
  type Constraints<T = unknown, U = unknown> = (
    & Partial<Constraints.Base<T>>
    & fc.UniqueArrayConstraints<T, U> 
    & { arbitrary: typeof Schema_oneOf.base }
  )
}

/**
 * ## {@link Schema_oneOf `openapi.Schema.oneOf`}
 *
 * An opinionated and extensible pseudo-random generator of "oneOf" JSON Schema /
 * OpenAPI 3.1 nodes.
 *
 * JSON Schema's `oneOf` combinator corresponds to a disjoint or discriminated
 * union in TypeScript.
 *
 * Many JSON Schema validators enforce "only one" semantics, by making sure that
 * 1, and only 1, of the conditions succeeds.
 *
 * This is mentality, I would argue, misses the point: the semantics of a disjoint
 * union are spiritually much closer to _variants_ in OCaml, or _enums_ in Rust,
 * or _data constructors_ in Haskell, all of which are special cases of a
 * [sum type](https://en.wikipedia.org/wiki/Algebraic_data_type).
 *
 * When modeling a domain with sum types and product types, performing additional
 * checks to ensure that one, and only one, member of a sum type is matched is
 * more or less redundant.
 *
 * It's not that it's a terrible thing to do -- just not strictly necessary.
 *
 * In fact, I would go further by making the case that the fact that JSON Schema
 * _optimizes_ unlawful unions as being exactly backwards: ideally, a good
 * specification would invest more energy into making the _simple_ thing the
 * easy thing, rather than optimizing for the path that is already easy, but
 * encourages bad habits and wishful thinking.
 *
 * See also:
 * - {@link Schema_allOf `openapi.Schema.allOf`}
 * - {@link Schema_oneOf `openapi.Schema.oneOf`}
 */
function Schema_oneOf<T>
  (model: fc.Arbitrary<T>, constraints?: Constraints):
    fc.Arbitrary<Schema_oneOf<T>>
///
function Schema_oneOf<T>(
  LOOP: fc.Arbitrary<T>,
  _: Constraints = Constraints.defaults
): fc.Arbitrary<Schema_oneOf<T>> {
  const $ = Constraints.configure(_)
  return $.oneOf.arbitrary(LOOP, $)
}
///    ONE OF    ///
////////////////////


///////////////////
///    ARRAY    ///
export { Schema_array as array }

Schema_array.requiredKeys = [
  "type", 
  "items",
] as const satisfies string[]
Schema_array.defaults = {
  arbitrary: Schema_array.base,
  // TODO: this should be a _value_, not an arbitrary... right? 🤔
  maxItems: fc.nat(),
  // TODO: this should be a _value_, not an arbitrary... right? 🤔
  minItems: fc.nat(),        // default: 0
  // TODO: this should be a _value_, not an arbitrary... right? 🤔
  uniqueItems: fc.boolean(), // default: false
} satisfies Schema_array.Constraints

Schema_array.base = <T>(
  LOOP: fc.Arbitrary<T>,
  $: Constraints.Config
) =>
  fc.record(
    typed(
      DataType.array, {
        items: LOOP,
      }
    ), {
      requiredKeys: Schema_array.requiredKeys,
    },
  )

interface Schema_array<T = unknown, M extends {} = {}> extends t.Schema_array<T, M> {}
declare namespace Schema_array {
  interface Constraints<T = unknown> extends
    Partial<Constraints.Items>,
    Partial<Constraints.Base<T>>,
    fc.ArrayConstraints {
      arbitrary: typeof Schema_array.base
    }
}

/**
 * ## {@link Schema_array `openapi.Schema.array`}
 *
 * An opinionated and extensible pseudo-random generator of "array" JSON Schema /
 * OpenAPI 3.1 nodes.
 *
 * See also:
 * - {@link Schema_tuple `openapi.Schema.tuple`}
 */
function Schema_array<T>
  (model: fc.Arbitrary<T>, constraints?: Constraints): 
    fc.Arbitrary<t.Schema_array<T>>

function Schema_array<T>(
  LOOP: fc.Arbitrary<T>,
  _: Constraints = Constraints.defaults
): fc.Arbitrary<t.Schema_array<T>> {
  const $ = Constraints.configure(_)
  return $.array.arbitrary(LOOP, $)
}
///    ARRAY    ///
///////////////////


////////////////////
///    OBJECT    ///
export { Schema_object as object }

Schema_object.defaults = {
  arbitrary: Schema_object.base,
  keySize: "small",
  const: void 0,
  description: "",
  nullable: false,
  example: void 0,
  include: {
    const: false,
    description: false,
    example: false,
    examples: false,
  },
} as const satisfies Required<Schema_object.Constraints>

Schema_object.base = <T>(
  LOOP: Schema_object.Model<T>,
  $: Constraints.Config
): fc.Arbitrary<Schema_object<T>> => {
  const keyConfig = {
    size: $.object?.keySize ?? Schema_object.defaults.keySize,
  } as const satisfies fc.StringMatchingConstraints
  const entriesConfig = {
    selector: ([k]: [string, unknown]) => k
  } as const satisfies fc.UniqueArrayConstraints<[string, any], any>
  return fc.tuple(
    fc.uniqueArray(fc.tuple(fc.identifier(keyConfig), LOOP.properties), entriesConfig),
    fc.option(LOOP.additionalProperties, { freq: 2 }),
  ).map(([ENTRIES, ADDT]) => {
    const properties = Object_fromEntries(ENTRIES)
    const required = fc.peek(fc.keysof(properties)).map(globalThis.String)
    return {
      type: DataType.object,
      ...required.length > 0 && { required },
      ...ADDT && { additionalProperties: ADDT },
      properties,
    }
  })
}

interface Schema_object<T = unknown, M extends {} = {}> extends t.Schema_object<T, M> {}
declare namespace Schema_object {
  interface Model<T = unknown> {
    properties: fc.Arbitrary<T>
    additionalProperties: fc.Arbitrary<T>
  }
  interface Constraints<T = unknown> extends
    Partial<Constraints.Base<T>> {
      arbitrary: typeof Schema_object.base
      keySize?: fc.StringMatchingConstraints["size"]
    }
}

/**
 * ## {@link Schema_object `openapi.Schema.object`}
 *
 * An opinionated and extensible pseudo-random generator of "object" JSON Schema /
 * OpenAPI 3.1 nodes.
 *
 * See also:
 * - {@link Schema_record `openapi.Schema.record`}
 */
function Schema_object
  <T extends Schema>(model: Schema_object.Model<T>, constraints?: Constraints):
    fc.Arbitrary<Schema_object<T>>
function Schema_object
  <T>(model: Schema_object.Model<T>, constraints?: Constraints):
    fc.Arbitrary<Schema_object<T>>
///
function Schema_object(
  LOOP: Schema_object.Model,
  _: Constraints = Constraints.defaults
): fc.Arbitrary<Schema_object> {
  const $ = Constraints.configure(_)
  return $.object.arbitrary(LOOP, $)
}
///    OBJECT    ///
////////////////////


///////////////////
///    TUPLE    ///
export { Schema_tuple as tuple }

Schema_tuple.requiredKeys = [
  "items",
  "type",
] as const satisfies string[]
Schema_tuple.defaults = {
  arbitrary: Schema_tuple.base,
  minLength: 1,
} satisfies Schema_tuple.Constraints

Schema_tuple.base = <T>(
  LOOP: fc.Arbitrary<T>,
  $: Constraints.Config
): fc.Arbitrary<Schema_tuple<T>> =>
  fc.record(
    typed(
      DataType.array, {
        items: fc.array(LOOP),
      },
    ), {
      requiredKeys: Schema_tuple.requiredKeys
    },
  )

interface Schema_tuple<T = Schema, M extends {} = {}> extends t.Schema_tuple<T, M> {}
declare namespace Schema_tuple {
  interface Constraints<T = unknown> extends
    Partial<Constraints.Base<T>>,
    fc.ArrayConstraints {
      arbitrary: typeof Schema_tuple.base
    }
}

/**
 * ## {@link Schema_tuple `openapi.Schema.tuple`}
 *
 * An opinionated, extensible, pseudo-random generator for JSON Schema / OpenAPI 3.1 "tuple" nodes
 *
 * - a.k.a, "finite array"
 * - acts as a semantic bridge between JSON Schema array nodes whose 'items' property is itself an array,
 *   and a corresponding OpenAPI 3.1+ array node whose 'prefixItems' property is a non-empty array.
 *
 * See also:
 * - {@link Schema_array `openapi.Schema.array`}
 */
function Schema_tuple
  <T extends Schema>(model: fc.Arbitrary<T>, constraints?: Constraints):
    fc.Arbitrary<Schema_tuple<T>>
function Schema_tuple
  <T>(model: fc.Arbitrary<T>, constraints?: Constraints):
    fc.Arbitrary<Schema_tuple<T>>
///
function Schema_tuple<T>(
  LOOP: fc.Arbitrary<T>,
  _: Constraints = Constraints.defaults
): fc.Arbitrary<Schema_tuple<T>> {
  const $ = Constraints.configure(_)
  return $.tuple.arbitrary(LOOP, $)
}
///    TUPLE    ///
///////////////////


/////////////////
///    ANY    ///
export { Schema_any as any }
type Schema_any = Schema
/**
 * ## {@link Schema_any `openapi.Schema.any`}
 *
 * An opinionated and extensible pseudo-random generator of "any" arbitrary
 * JSON Schema / OpenAPI 3.1 node.
 */
function Schema_any(_?: Constraints): fc.Arbitrary<Schema_any>
function Schema_any(_: Constraints = Constraints.defaults) { return loop(_).any }
///    ANY    ///
/////////////////

export interface Constraints extends inline<
  & {
    [K in keyof typeof Constraints.schemaDefaults]+?:
    Partial<typeof Constraints.schemaDefaults[K]>
  }
  & {
    base?: Partial<Constraints.Config["base"]>
    sortBias?: Constraints.Config["sortBias"]
  }
> {}

export declare namespace Constraints {
  interface Items extends globalThis.Partial<{ [K in keyof t.Schema_Items]: fc.Arbitrary<t.Schema_Items[K]> }> {}
  interface RootBase {
    exclude: readonly Tag[]
    include: t.arbitrary.Include
  }

  interface Base<T = unknown> {
    nullable: boolean
    description: string
    const: T
    include: t.arbitrary.Include
    example: T
  }

  interface Config {
    base: Constraints.RootBase
    sortBias: {
      (l: Tag, r: Tag): -1 | 0 | 1
      (l: Tag, r: Tag): number
      (l: Tag, r: Tag): -1 | 0 | 1
    }
    null: Require<Schema_null.Constraints, "arbitrary">
    boolean: Require<Schema_boolean.Constraints, "arbitrary">
    integer: Require<Schema_integer.Constraints, "arbitrary">
    number: Require<Schema_number.Constraints, "arbitrary">
    string: Require<Schema_string.Constraints, "arbitrary">
    record: Require<Schema_record.Constraints, "arbitrary">
    object: Require<Schema_object.Constraints, "arbitrary">
    tuple: Require<Schema_tuple.Constraints, "arbitrary">
    allOf: Require<Schema_allOf.Constraints, "arbitrary">
    anyOf: Require<Schema_anyOf.Constraints, "arbitrary">
    array: Require<Schema_array.Constraints, "arbitrary">
    oneOf: Require<Schema_oneOf.Constraints, "arbitrary">
  }
}

export namespace Constraints {
  export const include = {
    description: false,
    example: false,
    examples: false,
    const: false,
  } satisfies t.arbitrary.Include
  export const schemaDefaults = {
    allOf: { ...Schema_allOf.defaults, arbitrary: Schema_allOf.base },
    anyOf: { ...Schema_anyOf.defaults, arbitrary: Schema_anyOf.base },
    array: { ...Schema_array.defaults, arbitrary: Schema_array.base },
    boolean: { ...Schema_boolean.defaults, arbitrary: Schema_boolean.base },
    integer: { ...Schema_integer.defaults, arbitrary: Schema_integer.base },
    null: { ...Schema_null.defaults, arbitrary: Schema_null.base },
    number: { ...Schema_number.defaults, arbitrary: Schema_number.base },
    object: { ...Schema_object.defaults, arbitrary: Schema_object.base },
    oneOf: { ...Schema_oneOf.defaults, arbitrary: Schema_oneOf.base },
    record: { ...Schema_record.defaults, arbitrary: Schema_record.base },
    string: { ...Schema_string.defaults, arbitrary: Schema_string.base },
    tuple: { ...Schema_tuple.defaults, arbitrary: Schema_tuple.base },
  } as const
  export const defaults = {
    ...schemaDefaults,
    /**
     * ## {@link Constraints.defaults.sortBias `Constraints.sortBias`}
     *
     * If you'd like to change the frequency that a particular node is generated
     * relative to other nodes, you can provide a sorting function that will
     * change the order that the node is passed to fast-check's
     * {@link fc.letrec `letrec`} arbitrary.
     *
     * **Directionality:** nodes with lower indices have a greater chance of
     * being generated compared with higher indices.
     */
    sortBias: <Constraints.Config["sortBias"]>(() => 0),
    base: {
      exclude: <Tag[]>[],
      include: Constraints.include,
    },
    // {
    //   exclude: false,
    //   include: Constraints.include,
    //   nullable: false,
    //   const: void 0,
    //   description: "",
    //   example: void 0,
    // },
  }
  export const rootBase: RootBase = {
    exclude: <Tag[]>[],
    include: Constraints.include,
  } satisfies RootBase

  export function configure(_?: Constraints): Constraints.Config {
    return !_ ? Constraints.defaults : {
      sortBias: _.sortBias ?? Constraints.defaults.sortBias,
      base: !_.base ? Constraints.rootBase : {
        exclude: _.base.exclude ?? Constraints.rootBase.exclude,
        include: !_.base.include ? Constraints.include : { ...Constraints.include, ..._.base.include },
      },
      allOf: !_.allOf ? Constraints.defaults.allOf : { ...Constraints.defaults.allOf, ..._?.allOf },
      anyOf: !_.anyOf ? Constraints.defaults.anyOf : { ...Constraints.defaults.anyOf, ..._?.anyOf },
      array: !_.array ? Constraints.defaults.array : { ...Constraints.defaults.array, ..._?.array },
      boolean: !_.boolean ? Constraints.defaults.boolean : { ...Constraints.defaults.boolean, ..._?.boolean },
      integer: !_.integer ? Constraints.defaults.integer : { ...Constraints.defaults.integer, ..._?.integer },
      null: !_.null ? Constraints.defaults.null : { ...Constraints.defaults.null, ..._?.null },
      number: !_.number ? Constraints.defaults.number : { ...Constraints.defaults.number, ..._?.number },
      object: !_.object ? Constraints.defaults.object : { ...Constraints.defaults.object, ..._?.object },
      oneOf: !_.oneOf ? Constraints.defaults.oneOf : { ...Constraints.defaults.oneOf, ..._?.oneOf },
      record: !_.record ? Constraints.defaults.record : { ...Constraints.defaults.record, ..._?.record },
      string:  !_.string ? Constraints.defaults.string : { ...Constraints.defaults.string, ..._?.string },
      tuple: !_.tuple ? Constraints.defaults.tuple : { ...Constraints.defaults.tuple, ..._?.tuple },
    } satisfies Constraints.Config
  }
}

const depthIdentifier = fc.createDepthIdentifier()

export interface SchemaLoop<Meta extends {} = {}> {
  null: Schema_null<Schema_any, Meta>
  boolean: Schema_boolean<Schema_any, Meta>
  integer: Schema_integer<Schema_any, Meta>
  number: Schema_number<Schema_any, Meta>
  string: Schema_string<Schema_any, Meta>
  object: Schema_object<Schema_any, Meta>
  array: Schema_array<Schema_any, Meta>
  record: Schema_record<Schema_any, Meta>
  tuple: Schema_tuple<Schema_any, Meta>
  allOf: Schema_allOf<Schema_any, Meta>
  anyOf: Schema_anyOf<Schema_any, Meta>
  oneOf: Schema_oneOf<Schema_any, Meta>
  any: Schema_any
}

/**
 * Order in this array determines default bias; change the order by
 * providing {@link Constraints.sortBias}.
 *
 * TODO: turn `allOf` and `const` back on
 */

export const Tags = [
  "string",
  "number",
  "integer",
  "object",
  "boolean",
  "null",
  "array",
  "record",
  "tuple",
  "allOf",
  "anyOf",
  "oneOf",
] as const satisfies (Tag)[]
export type Tag = { [K in keyof SchemaLoop]: K }[keyof SchemaLoop]

export function loop(constraints: Constraints = Constraints.defaults): fc.LetrecValue<SchemaLoop> {
  const $ = Constraints.configure(constraints)
  return fc.letrec((LOOP: fc.LetrecTypedTie<SchemaLoop>) => {
    const loops = Tags
      .filter((_) => !$.base.exclude.includes(_))
      .sort($.sortBias)
      .map(LOOP) as fc.Arbitrary<Schema_any>[]

    return {
      null: Schema_null(constraints),
      boolean: Schema_boolean(constraints),
      integer: Schema_integer(constraints),
      number: Schema_number(constraints),
      string: Schema_string(constraints),
      array: Schema_array(LOOP("any"), constraints),
      record: Schema_record(LOOP("any"), constraints),
      allOf: Schema_allOf(LOOP("any"), constraints),
      anyOf: Schema_anyOf(LOOP("any"), constraints),
      oneOf: Schema_oneOf(LOOP("any"), constraints),
      tuple: Schema_tuple(LOOP("any"), constraints),
      object: Schema_object({
        properties: LOOP("any"),
        additionalProperties: LOOP("any")
      }, constraints),
      any: fc.oneof(
        { depthIdentifier },
        ...loops,
      ),
    }
  })
}

const hasConst = <T extends {}>(guard: (u: unknown) => u is T) => tree.has("const", guard)
export declare namespace has {
  export { hasConst as const }
}
export namespace has {
  void (has.const = hasConst)
  ///
  export const items = tree.has("items")
  export const itemsSetToFalse = tree.has("items", core.is.literally(false))
  export const properties = tree.has("properties", core.is.object)
  export const additionalProperties = tree.has(
    "additionalProperties",
    core.or$(core.is.boolean, core.is.object),
  )
  export const atLeastOneProperty
    : (u: { properties?: {} }) => boolean
    = (u) => has.properties(u) && globalThis.Object.keys(u.properties).length > 0
}

/**
 * @example
 *
 * const Quantifier = {
 *   OneOrMore: '+',
 *   ZeroOrMore: '*',
 *   ZeroOrOne: '?',
 *   OneOrMoreLazy: '+?',
 *   ZeroOrMoreLazy: '*?',
 *   ZeroOrOneLazy: '??',
 *   RangeExact: '{n}',
 *   RangeBetween: '{n,m}',
 *   RangeAtLeast: '{n,}',
 *   RangeExactLazy: '{n}?',
 *   RangeBetweenLazy: '{n,m}?',
 *   RangeAtLeastLazy: '{n,}?',
 * }
 *
 * const Anchor = {
 *   BeginningOfInput: "^",
 *   EndOfInput: "$",
 * }
 *
 * const Combinators = {
 *   Alt: "|",
 * }
 *
 *
 * const Composite = {
 *   CharacterClass: '[abc]',
 *   RangeCharacterClass: '[a-z]',
 *   ComplementedCharacterClass: '[^abc]',
 *   ComplementedRangeCharacterClass: '[^a-z]',
 *   Grouping: '(...)',
 * }
 * const characterClasses = `[abc]`
 * const rangeCharacterClasses =
 */

/*
if (model.properties) {
  return fc.tuple(
    fc.entries(model.properties, { keys: { excludeSymbols: true } }),
    model.additionalProperties,
  ).map(([props, additionalProperties]) => {
    const properties = Object_fromEntries(props)
    const required = fc.peek(fc.keysof(properties))
    return {
      ...Schema_record.static,
      ...required.length > 0 && { required },
      additionalProperties,
      properties,
    }
  })
}
else {
  return fc.record({
    type: fc.constant(DataType.object),
    additionalProperties: model.additionalProperties,
  })
}
*/

