import { core, fc, tree } from "@traversable/core"
import { type record as Record, fn, type keys, map, object } from "@traversable/data"
import type { Intersect } from "@traversable/registry"
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

  Schema_is as is,
  Schema_isBoolean as isBoolean,
  Schema_isInteger as isInteger,
  Schema_isNull as isNull,
  Schema_isNumber as isNumber,
  Schema_isString as isString,

  Schema_isArray as isArray,
  Schema_isTuple as isTuple,
  Schema_isRecord as isRecord,
  Schema_isObject as isObject,
  Schema_isAllOf as isAllOf,
  Schema_isAnyOf as isAnyOf,
  Schema_isOneOf as isOneOf,

  Schema_isScalar as isScalar,
  Schema_isCombinator as isCombinator,
  Schema_isRef as isRef,

  Schema_isConst as isConst,

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
export function keyMeet(lhk: keys.any, rhk: keys.any) {
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
    return { ...(Number_isNaN(globalThis.Number(x)) ? {} : { [key]: x }) }
  }
  export const minimumOf = (x?: number, y?: number) =>
    Math_min(x ?? Number_NaN, y ?? Number_NaN)
  export const maximumOf= (x?: number, y?: number) =>
    Math_max(x ?? Number_NaN, y ?? Number_NaN)
  export const factorOf = (lo?: number, hi?: number) => (x?: number) =>
    (x ?? Number_NaN) %
      Math_abs(Math_min(lo ?? Number_NaN, hi ?? Number_NaN)) ===
      0 &&
    Math_abs(Math_max(lo ?? Number_NaN, hi ?? Number_NaN)) %
      (x ?? Number_NaN) ===
      0
      ? (x ?? Number_NaN)
      : Number_NaN
}


//////////////////
///    NULL    ///
export { Schema_null as null }
type Schema_null = t.Schema_null
Schema_null.defaults = { exclude: false as boolean } satisfies Schema_null.Constraints
Schema_null.requiredKeys = ["type"] as const satisfies string[]
declare namespace Schema_null {
  interface Constraints<T = unknown> extends globalThis.Partial<Constraints.Base> {
    exclude?: boolean
    requiredKeys?: (keyof T)[]
  }
}
///
/** 
 * ## {@link Schema_null `openapi.Schema.null`}
 * 
 * An opinionated, pseudo-random JSON Schema / OpenAPI generator for "null" nodes.
 */
function Schema_null(_constraints?: Constraints): fc.Arbitrary<Schema_null> {
  return fc.record(
    typed(
      DataType.null, { 
        enum: fc.constant([null]),
        nullable: fc.constant(true),
      }
    ), 
    { requiredKeys: Schema_null.requiredKeys }
  )
}
///    NULL    ///
//////////////////


/////////////////////
///    BOOLEAN    ///
export { Schema_boolean as boolean }
type Schema_boolean = t.Schema_boolean
Schema_boolean.defaults = { exclude: false as boolean } satisfies Schema_boolean.Constraints
Schema_boolean.requiredKeys = ["type"] as const satisfies string[]
Schema_boolean.static = {}
///
/** 
 * ## {@link Schema_boolean `openapi.Schema.boolean`}
 * 
 * An opinionated, pseudo-random JSON Schema / OpenAPI generator for boolean nodes.
 */
function Schema_boolean(_constraints?: Constraints): fc.Arbitrary<t.Schema_boolean> {
  return fc.record(
    typed(
      DataType.boolean, 
      Schema_boolean.static,
    ),
    { requiredKeys: Schema_boolean.requiredKeys },
  )
}
///
declare namespace Schema_boolean {
  interface Constraints<T = unknown> extends globalThis.Partial<Constraints.Base> {
    requiredKeys?: (keyof T)[]
  }
}
///    BOOLEAN    ///
/////////////////////


/////////////////////
///    INTEGER    ///
export { Schema_integer as integer }
type Schema_integer = t.Schema_integer
Schema_integer.defaults = { exclude: false as boolean } satisfies Schema_integer.Constraints
Schema_integer.static = {
  format: fc.oneof(format.integer, format.any),
  minimum: fc.integer(),
  maximum: fc.integer(),
  exclusiveMinimum: fc.boolean(),
  exclusiveMaximum: fc.boolean(),
  multipleOf: fc.nat(),
}
Schema_integer.requiredKeys = ["type"] as const satisfies string[]
///
/** 
 * ## {@link Schema_integer `openapi.Schema.integer`}
 * 
 * An opinionated, pseudo-random JSON Schema / OpenAPI generator for "integer"
 * (non-floating point, numeric) nodes.
 */
function Schema_integer(_constraints?: Constraints): fc.Arbitrary<t.Schema_integer> {
  return fc.record(
    typed(
      DataType.integer, 
      Schema_integer.static,
    ), 
    { requiredKeys: Schema_integer.requiredKeys },
  ).map(({ type, format, minimum, maximum, multipleOf, exclusiveMinimum, exclusiveMaximum, ...node }) => ({
    type,
    format,
    ...Bounded.absorbNaN("minimum", Bounded.minimumOf(minimum, maximum)),
    ...Bounded.absorbNaN("maximum", Bounded.maximumOf(minimum, maximum)),
    ...Bounded.absorbNaN("multipleOf", Bounded.factorOf(minimum, maximum)(multipleOf)),
    ...(exclusiveMinimum != null && minimum != null && { exclusiveMinimum }),
    ...(exclusiveMaximum != null && maximum != null && { exclusiveMaximum }),
    ...node,
  }))
}
///
declare namespace Schema_integer {
  interface Constraints<T = unknown> extends globalThis.Partial<Constraints.Base> {
    requiredKeys?: (keyof T)[]
  }
}
///    INTEGER    ///
/////////////////////


////////////////////
///    NUMBER    ///
export { Schema_number as number}
interface Schema_number extends t.Schema_number {}
Schema_number.defaults = { exclude: false as boolean }
Schema_number.static = {}
Schema_number.requiredKeys = ["type"] as const satisfies string[]
///
/** 
 * ## {@link Schema_number `openapi.Schema.number`}
 * 
 * An opinionated, pseudo-random JSON Schema / OpenAPI generator for "number"
 * (inclusive of all numerical) nodes.
 */
function Schema_number(_constraints?: Constraints): fc.Arbitrary<t.Schema_number> { 
  return fc.record(
    typed(
      DataType.number,
      Schema_number.static,
    ), 
    { requiredKeys: Schema_number.requiredKeys },
  )
}
///
declare namespace Schema_number {
  interface Constraints<T = unknown> extends globalThis.Partial<Constraints.Base> {
    requiredKeys?: (keyof T)[]
  }
}
///    NUMBER    ///
////////////////////


////////////////////
///    STRING    ///
export { Schema_string as string }
interface Schema_string extends t.Schema_string {}
Schema_string.defaults = { exclude: false as boolean } satisfies Schema_string.Constraints
Schema_string.format = (constraints: Constraints = Constraints.defaults) => fc.oneof(
  fc.record(date(constraints), { requiredKeys: [] }),
  fc.record(datetime(constraints), { requiredKeys: [] }),
  fc.record(email(constraints), { requiredKeys: [] }),
  fc.record(ulid(constraints), { requiredKeys: [] }),
  fc.record(uuid(constraints), { requiredKeys: [] }),
  fc.record(uri(constraints), { requiredKeys: [] }),
)
Schema_string.static = {
  minLength: fc.nat(),
  maxLength: fc.nat(),
  pattern: fc.string(),
}
Schema_string.requiredKeys = ["type"] as const satisfies string[]
declare namespace Schema_string {
  interface Constraints<T = unknown> extends globalThis.Partial<Constraints.Base> {
    requiredKeys?: (keyof T)[]
  }
}
///
/** 
 * ## {@link Schema_string `openapi.Schema.string`}
 * 
 * An opinionated, pseudo-random JSON Schema / OpenAPI generator for "record"
 * (non-finite, object) nodes.
 */
function Schema_string(constraints?: Constraints): fc.Arbitrary<t.Schema_string> {
  return fc
    .tuple(
      Schema_string.format(constraints),
      fc.record({
        type: fc.constant(DataType.string),
        ...Schema_string.static,
        ...constraints?.base.include.example && { example: fc.lorem() },
        ...constraints?.base.include.description && { description: fc.lorem() },
      },
      { requiredKeys: ["type"] }),
    )
    .map(([format, { example, ...body }]) => ({
      ...format,
      ...body,
      ...optionally({ example: format.example ?? example }),
    })
  )
}
/** @internal */
const RFC_3339 = fc.date({ noInvalidDate: true }).map((d) => d.toISOString())
///
export function datetime(constraints: Constraints = Constraints.defaults) {
  return {
    format: fc.constant("date-time"),
    ...(constraints.base.include?.example && {
      example: RFC_3339,
    }),
  }
}
export function date(constraints: Constraints = Constraints.defaults) {
  return {
    format: fc.constant("date"),
    ...(constraints.base.include?.example && {
      example: RFC_3339.map((ds) => ds.substring(0, 10)),
    }),
  }
}
export function uuid(constraints: Constraints = Constraints.defaults) {
  return {
    format: fc.constant("uuid"),
    ...(constraints.base.include?.example && { example: fc.uuid({ version: 7 }) }),
  }
}
export function ulid(constraints: Constraints = Constraints.defaults) {
  return {
    format: fc.constant("ulid"),
    ...(constraints.base.include?.example && { example: fc.ulid() }),
  }
}
export function uri(constraints: Constraints = Constraints.defaults) {
  return {
    format: fc.constant("uri"),
    ...(constraints.base.include?.example && {
      example: fc.webUrl({ withQueryParameters: true, withFragments: true }),
    }),
  }
}
export function email(constraints: Constraints = Constraints.defaults) {
  return {
    format: fc.constant("string"),
    ...(constraints.base.include?.example && { example: fc.emailAddress() }),
  } satisfies Record<string, fc.Arbitrary<unknown>>
}
///    STRING    ///
////////////////////


////////////////////
///    RECORD    ///
export { Schema_record as record }
interface Schema_record<T = unknown> extends t.Schema_record<T> {}
/** 
 * ## {@link Schema_record `openapi.Schema.record`}
 * 
 * An opinionated, pseudo-random JSON Schema / OpenAPI generator for "record"
 * (non-finite, object) nodes.
 */
function Schema_record<T>(
  LOOP: fc.Arbitrary<T>, 
  _constraints: Constraints
) {
  return fc.record({
    type: fc.constant(DataType.object),
    additionalProperties: LOOP,
  })
}
Schema_record.defaults = { exclude: false as boolean } satisfies Schema_record.Constraints
declare namespace Schema_record {
  interface Constraints<T = unknown> extends globalThis.Partial<Constraints.Base> 
    { requiredKeys?: (keyof T)[] }
  interface Model<S, T> { 
    additionalProperties: fc.Arbitrary<T>
    properties?: fc.Arbitrary<S>, 
  }
}
///    RECORD    ///
////////////////////


////////////////////
///    ALL OF    ///
export { Schema_allOf as allOf }
interface Schema_allOf<T = unknown> extends t.Schema_allOf<T> {}
/** 
 * ## {@link Schema_allOf `openapi.Schema.allOf`}
 * 
 * An opinionated, pseudo-random JSON Schema / OpenAPI generator for the "allOf" combinator.
 */
function Schema_allOf<T>(LOOP: fc.Arbitrary<T>, constraints?: Constraints): fc.Arbitrary<{ allOf: readonly T[] }>
function Schema_allOf<T>(
  LOOP: fc.Arbitrary<T>, 
  _: Constraints = Constraints.defaults
) {
  const $ = Constraints.configure(_).allOf
  return fc.record({ allOf: Schema_allOf.base(LOOP, $.constraints) }, { requiredKeys: ["allOf"] })
}
///
Schema_allOf.defaults = {
  exclude: true as boolean,
  minLength: 1, 
  maxLength: 3,
  selector: Object_keys,
  comparator: keyMeet,
} satisfies Schema_allOf.Constraints
///
Schema_allOf.base = <T>(LOOP: fc.Arbitrary<T>, $: Schema_allOf.Constraints = Schema_allOf.defaults): fc.Arbitrary<readonly T[]> =>
  fc.uniqueArray(LOOP, { ...Schema_allOf.defaults, ...$ })
///
// TODO: decide how you want to handle intersections -- for now just treating them like arrays of records
// of the model, to make them easier to reason about
// Schema_allOf.base = <T>(model: fc.Arbitrary<T>, $: Schema_allOf.Constraints = Schema_allOf.defaults): fc.Arbitrary<T[]> =>
//   fc.uniqueArray(model, { ...Schema_allOf.defaults, ...$ }).map((xs) => xs.reduce((acc, x) => Object_assign(acc, x), Object_create(null)))
///
Schema_allOf.default = <T>(...args: Parameters<typeof Schema_allOf.base<T>>): fc.Arbitrary<readonly T[]> => Schema_allOf.base(...args)
declare namespace Schema_allOf {
  interface Constraints<S = any, T = any> extends fc.UniqueArrayConstraintsCustomCompareSelect<S, T> { exclude?: boolean }
}
///    ALL OF    ///
////////////////////


////////////////////
///    ANY OF    ///
export { Schema_anyOf as anyOf }
interface Schema_anyOf<T = unknown> extends t.Schema_anyOf<T> {}
/** 
 * ## {@link Schema_anyOf `openapi.Schema.anyOf`}
 * 
 * An opinionated, pseudo-random JSON Schema / OpenAPI generator for the "anyOf" combinator.
 */
function Schema_anyOf<T>(LOOP: fc.Arbitrary<T>, constraints: Constraints): fc.Arbitrary<{ anyOf: T[] }>
function Schema_anyOf<T>(LOOP: fc.Arbitrary<T>, _: Constraints) {
  const $ = Constraints.configure(_).anyOf
  return fc.record(
    { anyOf: Schema_anyOf.base(LOOP, $.constraints) }, 
    { requiredKeys: ["anyOf"] }
  )
}
Schema_anyOf.base = <T>(LOOP: fc.Arbitrary<T>, $: Schema_anyOf.Constraints = Schema_anyOf.defaults): fc.Arbitrary<T[]> => 
  fc.uniqueArray(LOOP, { minLength: 1, maxLength: 3, ...$ })
///
Schema_anyOf.defaults = {
  exclude: false as boolean,
  minLength: 1, 
  maxLength: 3,
} satisfies Schema_anyOf.Constraints
declare namespace Schema_anyOf {
  type Constraints<T = unknown, U = unknown> = fc.UniqueArrayConstraints<T, U> & { exclude?: boolean }
}
///    ANY OF    ///
////////////////////


////////////////////
///    ONE OF    ///
export { Schema_oneOf as oneOf }
interface Schema_oneOf<T = unknown> extends t.Schema_oneOf<T> {}
///
/** 
 * ## {@link Schema_oneOf `openapi.Schema.oneOf`}
 * 
 * An opinionated, pseudo-random JSON Schema / OpenAPI generator for the "oneOf" combinator.
 */
function Schema_oneOf<T>(LOOP: fc.Arbitrary<T>, constraints?: Constraints): fc.Arbitrary<{ oneOf: T[] }>
function Schema_oneOf<T>(LOOP: fc.Arbitrary<T>, $: Constraints = Constraints.defaults) {
  return fc.record({
    oneOf: Schema_oneOf.base(LOOP, Constraints.configure($).oneOf.constraints) 
  })
}
///
Schema_oneOf.base = <T>(LOOP: fc.Arbitrary<T>, $: Schema_oneOf.Constraints = Schema_oneOf.defaults) => 
  fc.uniqueArray(LOOP, { minLength: 1, maxLength: 3, ...$ })
Schema_oneOf.defaults = {
  exclude: false as boolean,
  minLength: 1, 
  maxLength: 3,
} satisfies Schema_oneOf.Constraints
declare namespace Schema_oneOf {
  type Constraints<T = unknown, U = unknown> = fc.UniqueArrayConstraints<T, U> & { exclude?: boolean }
}
///    ONE OF    ///
////////////////////


///////////////////
///    ARRAY    ///
export { Schema_array as array }
interface Schema_array<T = unknown> extends t.Schema_array<T> {}
///
/** 
 * ## {@link Schema_array `openapi.Schema.array`}
 * 
 * An opinionated, pseudo-random JSON Schema / OpenAPI object node generator.
 */
function Schema_array<T>(model: fc.Arbitrary<T>, constraints?: Constraints): fc.Arbitrary<{ type: DataType.array, items: T }>
function Schema_array<T>(LOOP: fc.Arbitrary<T>, _: Constraints = Constraints.defaults) {
  return fc.record(
    typed(
      DataType.array, 
      { items: LOOP }
    ),
    { requiredKeys: Schema_array.requiredKeys }
  )
}
///
Schema_array.defaults = {
  exclude: false as boolean,
  maxItems: fc.nat(),
  minItems: fc.nat(), // default: 0
  uniqueItems: fc.boolean(), // default: false
} satisfies Schema_array.Constraints
Schema_array.requiredKeys = ["type", "items"] as const satisfies string[]
declare namespace Schema_array {
  interface Constraints extends 
    globalThis.Partial<Constraints.Items>,
    globalThis.Partial<Constraints.Base>, 
    fc.ArrayConstraints {}
}
///    ARRAY    ///
///////////////////



////////////////////
///    OBJECT    ///
export { Schema_object as object }
interface Schema_object<T = Schema> extends t.Schema_object<T> {}
///
/** 
 * ## {@link Schema_object `openapi.Schema.object`}
 * 
 * An opinionated, pseudo-random JSON Schema / OpenAPI object node generator.
 */
function Schema_object<T extends Schema>(
  LOOP: {
    properties: fc.Arbitrary<T>, 
    additionalProperties: fc.Arbitrary<T>, 
  },
  constraints?: Constraints
): fc.Arbitrary<t.Schema_object<T>> 
///
function Schema_object<T>(
  LOOP: {
    properties: fc.Arbitrary<unknown>, 
    additionalProperties: fc.Arbitrary<{}>, 
  },
  constraints?: Constraints
): fc.Arbitrary<t.Schema_object<T>> 
///
function Schema_object(
  LOOP: {
    properties: fc.Arbitrary<unknown>, 
    additionalProperties: fc.Arbitrary<{}>, 
  },
  _?: Constraints
): fc.Arbitrary<t.Schema_object> {
  return fc.tuple(
    // fc.uniqueArray(fc.tuple(fc.lorem({ maxCount: 1, mode: "words" }), LOOP.properties), { selector: ([k]) => k }),
    // fc.uniqueArray(fc.tuple(fc.lorem({ maxCount: 1, mode: "words" }), LOOP.properties), { selector: ([k]) => k }),
    // fc.entries(LOOP.properties, { keys: { excludeSymbols: true} }),
    fc.uniqueArray(fc.tuple(fc.identifier({ size: "xsmall" }).map((_) => _.toUpperCase()), LOOP.properties), { selector: ([k]) => k }),
    fc.option(LOOP.additionalProperties, { freq: 2 }),
  ).map(([ENTRIES, ADDT]) => {
    const properties = Object_fromEntries(ENTRIES)
    const required = fc.peek(fc.keysof(properties)).map(globalThis.String)
    return {
      type: DataType.object,
      // ...base,
      ...required.length > 0 && { required },
      ...ADDT && { additionalProperties: ADDT },
      properties,
    }
  })
}
///
Schema_object.defaults = { exclude: false } satisfies Schema_object.Constraints
declare namespace Schema_object {
  interface Constraints<T = unknown> extends globalThis.Partial<Constraints.Base> {
    requiredKeys?: (keyof T)[]
  }
}
///    OBJECT    ///
////////////////////


///////////////////
///    TUPLE    ///
export { Schema_tuple as tuple }
interface Schema_tuple<T = Schema> extends t.Schema_tuple<T> {}
/** 
 * ## {@link Schema_tuple `openapi.Schema.tuple`}
 * 
 * An opinionated, extensible, pseudo-random generator for JSON Schema / OpenAPI 3.1 "tuple" nodes 
 * 
 * - a.k.a, "finite array"
 * - bridges semantics between a JSON Schema array whose 'items' property is itself an array, 
 *   and a corresponding OpenAPI 3.1+ array node whose 'prefixItems' property is a non-empty array.
 */
function Schema_tuple<T extends Schema>(arbitrary: fc.Arbitrary<T>, constraints?: Constraints): fc.Arbitrary<Schema_tuple<T>> 
function Schema_tuple<T>(arbitrary: fc.Arbitrary<T>, constraints?: Constraints): fc.Arbitrary<Schema_tuple<T>> 
function Schema_tuple<T extends Schema>(
  LOOP: fc.Arbitrary<T>, 
  constraints: Constraints = Constraints.defaults
): fc.Arbitrary<Schema_tuple<T>> {
  const $ = constraints.tuple
  return fc.record( 
    typed(
      DataType.array, {
        items: fc.array(LOOP),
      },
    ), {
      requiredKeys: [
        "items",
        "type",
      ] 
    }
  )
}
///
Schema_tuple.defaults = {
  exclude: false as boolean,
  minLength: 1,
} satisfies Schema_tuple.Constraints
///
declare namespace Schema_tuple {
  type Constraints = fc.ArrayConstraints & { exclude?: boolean }
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
 * An opinionated, extensible, pseudo-random generator for "any" arbitrary
 * JSON Schema / OpenAPI 3.1 "tuple" node.
 */
function Schema_any(_?: Constraints): fc.Arbitrary<Schema> 
function Schema_any(_: Constraints = Constraints.defaults) 
  { return loop(_).any }
///    ANY    ///
/////////////////

/**
 * If you need complete control over which generators are 
 * used, you can provide them via the {@link Generators `Generators`}
 * option. This library will consult this object first.
 */
export declare namespace Constraints {
  interface Config extends Required<Constraints> {}
  interface Items extends globalThis.Partial<{ [K in keyof t.Schema_Items]: fc.Arbitrary<t.Schema_Items[K]> }> {}
  interface Base<T = unknown> {
    exclude: boolean
    nullable: boolean
    description: string
    const: T
    include: arbitrary.Include
    example: T
  }
}

export interface Constraints<T = unknown, U = unknown> {
  base: Constraints.Base
  null: {
    // generator: typeof Schema_null.default
    constraints: typeof Schema_null.defaults
  }
  boolean: {
    // generator: typeof Schema_boolean.default,
    constraints: typeof Schema_boolean.defaults
  }
  integer: {
    // generator: typeof Schema_integer.default
    constraints: typeof Schema_integer.defaults
  }
  number: {
    // generator: typeof Schema_number.default
    constraints: typeof Schema_number.defaults
  }
  string: {
    // generator: typeof Schema_string.default
    constraints: typeof Schema_string.defaults
  }
  array: {
    // generator: typeof Schema_array.default
    constraints: typeof Schema_array.defaults
  }
  record: {
    // generator: typeof Schema_record.default
    constraints: typeof Schema_record.defaults
  }
  tuple: {
    // generator: typeof Schema_tuple.default
    constraints: typeof Schema_tuple.defaults
  }
  object: {
    // generator: typeof Schema_object.default
    constraints: typeof Schema_object.defaults
  }
  allOf: {
    // generator: typeof Schema_allOf.default
    constraints: typeof Schema_allOf.defaults
  }
  anyOf: {
    // generator: typeof Schema_anyOf.default
    constraints: typeof Schema_anyOf.defaults
  }
  oneOf: {
    // generator: typeof Schema_oneOf.default
    constraints: typeof Schema_oneOf.defaults
  }
}

export namespace Constraints {
  export const include = {
    description: false,
    example: false,
    examples: false,
    const: false,
  } satisfies arbitrary.Include
  export const defaults = {
    base: {
      exclude: false,
      include: Constraints.include,
      nullable: false,
      const: void 0,
      description: "",
      example: void 0,
    },
    allOf: {
      constraints: Schema_allOf.defaults,
    },
    anyOf: {
      constraints: Schema_anyOf.defaults,
    },
    array:  {
      constraints: Schema_array.defaults,
    },
    boolean:  {
      constraints: Schema_boolean.defaults,
    },
    integer:  {
      constraints: Schema_integer.defaults,
    },
    null:  {
      constraints: Schema_null.defaults,
    },
    number: {
      constraints: Schema_number.defaults,
    },
    object: {
      constraints: Schema_object.defaults,
    },
    oneOf: {
      constraints: Schema_oneOf.defaults,
    },
    record: {
      constraints: Schema_record.defaults,
    },
    string: {
      constraints: Schema_string.defaults,
    },
    tuple: {
      constraints: Schema_tuple.defaults,
    },
  } satisfies Required<Constraints>

  export function configure(_?: Constraints): Constraints.Config {
    return !_ ? Constraints.defaults : {
      base: !_.base ? Constraints.defaults.base : { ...Constraints.defaults.base, ..._?.base },
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

const depthIdentifier = fc.createDepthIdentifier();

export interface SchemaLoop<Meta extends {} = {}> {
  null: t.Schema_null<Schema, Meta>
  boolean: t.Schema_boolean<Schema, Meta>
  integer: t.Schema_integer<Schema, Meta>
  number: t.Schema_number<Schema, Meta>
  string: t.Schema_string<Schema, Meta>
  object: t.Schema_object<Schema, Meta>
  array: t.Schema_array<Schema, Meta>
  record: t.Schema_record<Schema, Meta>
  tuple: t.Schema_tuple<Schema, Meta>
  allOf: t.Schema_allOf<Schema, Meta>
  anyOf: t.Schema_anyOf<Schema, Meta>
  oneOf: t.Schema_oneOf<Schema, Meta>
  any: t.Schema
}

export function loop(constraints: Constraints = Constraints.defaults) {
  return fc.letrec((LOOP: fc.LetrecTypedTie<{ [K in keyof SchemaLoop]+?: SchemaLoop[K] }>) => {
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
        additionalProperties: LOOP("any") as fc.Arbitrary<Schema> 
      }, constraints),
      any: fc.oneof(
        { depthIdentifier },
        ...[
          constraints.null.constraints.exclude ? null : LOOP("null"),
          constraints.boolean.constraints.exclude ? null : LOOP("boolean"),
          constraints.integer.constraints.exclude ? null : LOOP("integer"),
          constraints.number.constraints.exclude ? null : LOOP("number"),
          constraints.object.constraints.exclude ? null : LOOP("object"),
          constraints.allOf.constraints.exclude ? null : LOOP("allOf"),
        ].filter((_) => _ != null),
      ) as 
      fc.Arbitrary<
        | t.Schema_number<Schema, {}> 
        | t.Schema_boolean<Schema, {}> 
        | t.Schema_object<Schema, {}> 
        | t.Schema_null<Schema, {}> 
        | t.Schema_integer<Schema, {}> 
        | t.Schema_allOf<Schema, {}>
      >
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

/** @internal */
function simulateOptional<K extends keyof any, V>(key: K, value: V): { [P in K]+?: V }
function simulateOptional<K extends keyof any, V>(key: K, value: V) {
  return { 
    ...Math.random() > 0 && { [key]: value } 
  }
}

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
