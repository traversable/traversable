import { core, fc, tree } from "@traversable/core"
import { type record as Record, fn, type keys, object } from "@traversable/data"
import type { Partial } from "@traversable/registry"
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


// export function is(u: unknown): u is Schema { return t.Schema_is(u) }

/// scalars
// is.null = t.Schema_isNull
// is.boolean = t.Schema_isBoolean
// is.integer = t.Schema_isInteger
// is.number = t.Schema_isNumber
// is.string = t.Schema_isString
// is.scalar = t.Schema_isScalar
// /// composites
// is.array = t.Schema_isArray
// is.tuple = t.Schema_isTuple
// is.record = t.Schema_isRecord
// is.object = t.Schema_isObject
// /// combinators
// is.anyOf = t.Schema_isAnyOf
// is.allOf = t.Schema_isAllOf
// is.oneOf = t.Schema_isOneOf
// is.combinator = t.Schema_isCombinator
// /// special cases
// is.$ref = t.Schema_isRef


/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const NEGATIVE_INFINITY = globalThis.Number.NEGATIVE_INFINITY
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
function typed<T extends string>(type: T): { type: fc.Arbitrary<T> }
function typed<T extends string, S extends Record.of<fc.Arbitrary.any>>(type: T, shape?: S): S & { type: fc.Arbitrary<T> }
function typed(type: string, shape = {}) /// impl.
  { return { ...shape, /* ...base, */ type: fc.constant(type) } }

// TODO: move
export function keysMeet(lks: keys.any, rks: keys.any) {
  return lks.some((lk) => rks.includes(lk)) || rks.some((rk) => lks.includes(rk))
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
  return !_ ? [] : !_[globalThis.Object.keys(_)[0]] ? [] : _
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

export { null_ as null }
type null_ = t.Schema_null
null_.defaults = {} satisfies null_.Constraints
null_.requiredKeys = ["type"] as const satisfies string[]
declare namespace null_ {
  interface Constraints<T = unknown> extends Partial<Constraints.Base> {
    requiredKeys?: (keyof T)[]
  }
}

/** 
 * ## {@link null_ `schema.null`}
 */
function null_(_constraints?: Constraints): fc.Arbitrary<null_> {
  return fc.record(
    typed(
      DataType.null, { 
        enum: fc.constant([null]),
        nullable: fc.constant(true),
        // nululable: 
      }
    ), 
    { requiredKeys: null_.requiredKeys }
  )
}

export { boolean_ as boolean }
type boolean_ = t.Schema_boolean
boolean_.defaults = {} satisfies boolean_.Constraints
boolean_.requiredKeys = ["type"] as const satisfies string[]
boolean_.static = {}

/** 
 * ## {@link boolean_ `Schema.boolean`}
 */
function boolean_(_constraints?: Constraints): fc.Arbitrary<t.Schema_boolean> {
  return fc.record(
    typed(
      DataType.boolean, 
      boolean_.static,
    ),
    { requiredKeys: boolean_.requiredKeys },
  )
}

declare namespace boolean_ {
  interface Constraints<T = unknown> extends Partial<Constraints.Base> {
    requiredKeys?: (keyof T)[]
  }
}

export { integer }
type integer = t.Schema_integer
integer.defaults = {} satisfies integer.Constraints
integer.static = {
  format: fc.oneof(format.integer, format.any),
  minimum: fc.integer(),
  maximum: fc.integer(),
  exclusiveMinimum: fc.boolean(),
  exclusiveMaximum: fc.boolean(),
  multipleOf: fc.nat(),
}
integer.requiredKeys = ["type"] as const satisfies string[]

/** 
 * ## {@link integer `Schema.integer`}
 */
function integer(_constraints?: Constraints): fc.Arbitrary<t.Schema_integer> {
  return fc.record(
    typed(
      DataType.integer, 
      integer.static,
    ), 
    { requiredKeys: integer.requiredKeys },
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

declare namespace integer {
  interface Constraints<T = unknown> extends Partial<Constraints.Base> {
    requiredKeys?: (keyof T)[]
  }
}

export { number_ as number}
interface number_ extends t.Schema_number {}
number_.defaults = {}
number_.static = {}
number_.requiredKeys = ["type"] as const satisfies string[]


/** 
 * ## {@link number_ `schema.number`}
 */
function number_(_constraints?: Constraints): fc.Arbitrary<t.Schema_number> { 
  return fc.record(
    typed(
      DataType.number,
      number_.static,
    ), 
    { requiredKeys: number_.requiredKeys },
  )
}

export declare namespace number_ {
  export interface Constraints<T = unknown> extends Partial<Constraints.Base> {
    requiredKeys?: (keyof T)[]
  }
}


export function email(constraints: Constraints = Constraints.defaults) {
  return {
    format: fc.constant("string"),
    ...(constraints.base.include?.example && { example: fc.emailAddress() }),
  } satisfies Record<string, fc.Arbitrary<unknown>>
}
export function date(constraints: Constraints = Constraints.defaults) {
  return {
    format: fc.constant("date"),
    ...(constraints.base.include?.example && {
      example: fc.date({ noInvalidDate: true }).map((d) => d.toISOString().substring(0, 10)),
    }),
  }
}
export function datetime(constraints: Constraints = Constraints.defaults) {
  return {
    format: fc.constant("datetime"),
    ...(constraints.base.include?.example && {
      example: fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
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
    ...(constraints.base.include?.example && { example: fc.uuid({ version: 7 }) }),
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

export { string_ as string }
interface string_ extends t.Schema_string {}
string_.defaults = {} satisfies string_.Constraints
string_.format = (constraints: Constraints = Constraints.defaults) => fc.oneof(
  fc.record(date(constraints), { requiredKeys: [] }),
  fc.record(datetime(constraints), { requiredKeys: [] }),
  fc.record(email(constraints), { requiredKeys: [] }),
  fc.record(ulid(constraints), { requiredKeys: [] }),
  fc.record(uuid(constraints), { requiredKeys: [] }),
  fc.record(uri(constraints), { requiredKeys: [] }),
)
string_.static = {
  minLength: fc.nat(),
  maxLength: fc.nat(),
  pattern: fc.string(),
}
string_.requiredKeys = ["type"] as const satisfies string[]
declare namespace string_ {
  interface Constraints<T = unknown> extends Partial<Constraints.Base> {
    requiredKeys?: (keyof T)[]
  }
}

/** 
 * ## {@link string_ `schema.string`}
 */
function string_(constraints?: Constraints): fc.Arbitrary<t.Schema_string> {
  return fc
    .tuple(
      string_.format(constraints),
      fc.record(
        {
          type: fc.constant(DataType.string),
          ...string_.static,
          ...constraints?.base.include.example && { example: fc.lorem() },
          ...constraints?.base.include.description && { description: fc.lorem() },
          // ...base
        },
        { requiredKeys: ["type"] },
      ),
    )
    .map(([format, { example, ...body }]) => ({
      ...format,
      ...body,
      ...optionally({ example: format.example ?? example }),
    })
  )
}

/** 
 * ## {@link record `schema.record`}
 */
export interface record<T = unknown> extends t.Schema_record<T> {}
export function record<T>(
  model: fc.Arbitrary<T>, 
  _constraints: Constraints
) {
  return fc.record({
    type: fc.constant(DataType.object),
    additionalProperties: model,
  })
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
        ...record.static,
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

record.defaults = {} satisfies record.Constraints
record.static = {
  type: DataType.object,
}
export declare namespace record {
  interface Constraints<T = unknown> extends Partial<Constraints.Base> 
    { requiredKeys?: (keyof T)[] }
  interface Model<S, T> { 
    additionalProperties: fc.Arbitrary<T>
    properties?: fc.Arbitrary<S>, 
  }
}

export { allOf }
interface allOf<T = unknown> extends t.Schema_allOf<T> {}

/** 
 * ## {@link allOf `schema.allOf`}
 */
function allOf<T>(model: fc.Arbitrary<T>, constraints?: Constraints): fc.Arbitrary<{ allOf: T[] }>
function allOf<T>(
  model: fc.Arbitrary<T>, 
  _: Constraints = Constraints.defaults
) {
  const $ = Constraints.configure(_).allOf
  return fc.record({ allOf: allOf.base(model, $.constraints) }, { requiredKeys: ["allOf"] })
}

allOf.defaults = {
  minLength: 1, 
  maxLength: 3,
  selector: globalThis.Object.keys,
  comparator: keysMeet,
} satisfies allOf.Constraints
allOf.base = <T>(model: fc.Arbitrary<T>, $: allOf.Constraints = allOf.defaults): fc.Arbitrary<T[]> =>
  fc.uniqueArray(model, { ...allOf.defaults, ...$ })
allOf.default = <T>(...args: Parameters<typeof allOf.base<T>>): fc.Arbitrary<T[]> => allOf.base(...args)
declare namespace allOf {
  type Constraints<S = any, T = any> = fc.UniqueArrayConstraintsCustomCompareSelect<S, T>
}

export { anyOf }
interface anyOf<T = unknown> extends t.Schema_anyOf<T> {}

/** 
 * ## {@link allOf `schema.allOf`}
 */
function anyOf<T>(model: fc.Arbitrary<T>, constraints: Constraints): fc.Arbitrary<{ anyOf: T[] }>
function anyOf<T>(LOOP: fc.Arbitrary<T>, _: Constraints) {
  const $ = Constraints.configure(_).anyOf
  return fc.record(
    { anyOf: anyOf.base(LOOP, $.constraints) }, 
    { requiredKeys: ["anyOf"] }
  )
}
anyOf.base = <T>(model: fc.Arbitrary<T>, $: anyOf.Constraints = anyOf.defaults): fc.Arbitrary<T[]> => 
  fc.uniqueArray(model, { minLength: 1, maxLength: 3, ...$ })

anyOf.defaults = {
  minLength: 1, 
  maxLength: 3,
} satisfies anyOf.Constraints
declare namespace anyOf {
  type Constraints<T = unknown, U = unknown> = fc.UniqueArrayConstraints<T, U>
}

export { oneOf }
interface oneOf<T = unknown> extends t.Schema_oneOf<T> {}

/** 
 * ## {@link oneOf `schema.oneOf`}
 */
function oneOf<T>(arbitrary: fc.Arbitrary<T>, constraints?: Constraints): fc.Arbitrary<{ oneOf: T[] }>
function oneOf<T>(LOOP: fc.Arbitrary<T>, $: Constraints = Constraints.defaults) {
  return fc.record({
    oneOf: oneOf.base(LOOP, Constraints.configure($).oneOf.constraints) 
  })
}

oneOf.base = <T>(LOOP: fc.Arbitrary<T>, $: oneOf.Constraints = oneOf.defaults) => 
  fc.uniqueArray(LOOP, { minLength: 1, maxLength: 3, ...$ })
oneOf.defaults = {
  minLength: 1, 
  maxLength: 3,
} satisfies oneOf.Constraints
declare namespace oneOf {
  type Constraints<T = unknown, U = unknown> = fc.UniqueArrayConstraints<T, U>
}

export { array }
interface array<T = unknown> extends t.Schema_array<T> {}

/** 
 * ## {@link oneOf `schema.oneOf`}
 */
function array<T>(model: fc.Arbitrary<T>, constraints?: Constraints): fc.Arbitrary<{ type: DataType.array, items: T }>
function array<T>(LOOP: fc.Arbitrary<T>, _: Constraints = Constraints.defaults) {
  return fc.record(
    typed(
      DataType.array, 
      { items: LOOP }
    ),
    { requiredKeys: array.requiredKeys }
  )
}

array.defaults = {
  maxItems: fc.nat(),
  minItems: fc.nat(), // default: 0
  uniqueItems: fc.boolean(), // default: false
} satisfies array.Constraints
array.requiredKeys = ["type", "items"] as const satisfies string[]
declare namespace array {
  interface Constraints extends 
    Partial<Constraints.Items>,
    Partial<Constraints.Base>, 
    fc.ArrayConstraints {}
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
        ...record.static,
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

export { object_ as object }
interface object_<T = Schema> extends t.Schema_object<T> {}


function object_<T extends Schema>(
  model: {
    properties: fc.Arbitrary<T>, 
    additionalProperties: fc.Arbitrary<T>, 
  },
  constraints?: Constraints
): fc.Arbitrary<t.Schema_object<T>> 

function object_<T>(
  model: {
    properties: fc.Arbitrary<unknown>, 
    additionalProperties: fc.Arbitrary<{}>, 
  },
  constraints?: Constraints
): fc.Arbitrary<t.Schema_object<T>> 

function object_(
  LOOP: {
    properties: fc.Arbitrary<unknown>, 
    additionalProperties: fc.Arbitrary<{}>, 
  },
  _?: Constraints
): fc.Arbitrary<t.Schema_object> {
  return fc.tuple(
    fc.entries(LOOP.properties, { keys: { excludeSymbols: true} }),
    fc.option(LOOP.additionalProperties, { freq: 2 }),
  ).map(([ENTRIES, ADDT]) => {
    const properties = globalThis.Object.fromEntries(ENTRIES)
    const required = fc.peek(fc.keysof(properties)).map(globalThis.String)
    return {
      type: DataType.object,
      // ...base,
      ...required.length > 0 && { required },
      ...ADDT && { additionalProperties: ADDT },
      properties,
    }
  })

  // if (model.additionalProperties)

}

  // return fc.entries(LOOP, { keys: { excludeSymbols: true} }).map((entries) => {
  //   const properties = globalThis.Object.fromEntries(entries)
  //   const required = fc.peek(fc.keysof(properties)).map(globalThis.String)
  //   return {
  //     type: DataType.object,
  //     // ...base,
  //     ...required.length > 0 && { required },
  //     properties,
  //   }
  // })


object_.defaults = {} satisfies object_.Constraints
declare namespace object_ {
  interface Constraints<T = unknown> extends Partial<Constraints.Base> {
    requiredKeys?: (keyof T)[]
  }
}

export { tuple }
interface tuple<T = Schema> extends t.Schema_tuple<T> {}

function tuple<T extends Schema>(arbitrary: fc.Arbitrary<T>, constraints?: Constraints): fc.Arbitrary<tuple<T>> 
function tuple<T>(arbitrary: fc.Arbitrary<T>, constraints?: Constraints): fc.Arbitrary<tuple<T>> 
function tuple<T extends Schema>(
  LOOP: fc.Arbitrary<T>, 
  constraints: Constraints = Constraints.defaults
): fc.Arbitrary<tuple<T>> {
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

tuple.defaults = {
  minLength: 1,
} satisfies tuple.Constraints

declare namespace tuple {
  type Constraints = fc.ArrayConstraints
}

export { any_ as any }
type any_ = Schema
function any_(_?: Constraints): fc.Arbitrary<Schema> 
function any_(_: Constraints = Constraints.defaults) 
  { return loop(_).any }

/**
 * If you need complete control over which generators are 
 * used, you can provide them via the {@link Generators `Generators`}
 * option. This library will consult this object first.
 */
export declare namespace Constraints {
  interface Config extends Required<Constraints> {}
  interface Items extends Partial<{ [K in keyof t.Schema_Items]: fc.Arbitrary<t.Schema_Items[K]> }> {}
  interface Base<T = unknown> {
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
    // generator: typeof null_.default
    constraints: typeof null_.defaults
  }
  boolean: {
    // generator: typeof boolean.default,
    constraints: typeof boolean_.defaults
  }
  integer: {
    // generator: typeof integer.default
    constraints: typeof integer.defaults
  }
  number: {
    // generator: typeof number.default
    constraints: typeof number_.defaults
  }
  string: {
    // generator: typeof string.default
    constraints: typeof string_.defaults
  }
  array: {
    // generator: typeof array.default
    constraints: typeof array.defaults
  }
  record: {
    // generator: typeof record.default
    constraints: typeof record.defaults
  }
  tuple: {
    // generator: typeof tuple.default
    constraints: typeof tuple.defaults
  }
  object: {
    // generator: typeof object_.default
    constraints: typeof object_.defaults
  }
  allOf: {
    // generator: typeof allOf.default
    constraints: typeof allOf.defaults
  }
  anyOf: {
    // generator: typeof anyOf.default
    constraints: typeof anyOf.defaults
  }
  oneOf: {
    // generator: typeof oneOf.default
    constraints: typeof oneOf.defaults
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
      include: Constraints.include,
      nullable: false,
      const: void 0,
      description: "",
      example: void 0,
    },
    allOf: {
      constraints: allOf.defaults,
      // generator: allOf.default,
    },
    anyOf: {
      constraints: anyOf.defaults,
      // generator: anyOf.default,
    },
    array:  {
      constraints: array.defaults,
      // generator: array.default,
    },
    boolean:  {
      constraints: boolean_.defaults,
      // generator: boolean.default,
    },
    integer:  {
      constraints: integer.defaults,
      // generator: integer.default,
    },
    null:  {
      constraints: null_.defaults,
      // generator: null_.default,
    },
    number: {
      constraints: number_.defaults,
      // generator: number.default,
    },
    object: {
      constraints: object_.defaults,
      // generator: object_.default,
    },
    oneOf: {
      constraints: oneOf.defaults,
      // generator: oneOf.default,
    },
    record: {
      constraints: record.defaults,
      // generator: record.default,
    },
    string: {
      constraints: string_.defaults,
      // generator: string.default,
    },
    tuple: {
      constraints: tuple.defaults,
      // generator: tuple.default,
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

interface Stream {
  object: t.Schema_object<Schema>
  array: t.Schema_array<Schema>
  record: t.Schema_record<Schema>
  tuple: t.Schema_tuple<Schema>
  allOf: t.Schema_allOf<Schema>
  anyOf: t.Schema_anyOf<Schema>
  oneOf: t.Schema_oneOf<Schema>
  scalar: t.Schema_scalar
  any: t.Schema
}

export function loop(constraints: Constraints = Constraints.defaults) {
  return fc.letrec<Stream>((LOOP: fc.LetrecTypedTie<Stream>) => ({
    object: object_({ 
      properties: LOOP("any"), 
      additionalProperties: LOOP("any") 
    }, constraints),
    array: array(LOOP("any"), constraints),
    record: record(LOOP("any"), constraints),
    tuple: tuple(LOOP("any"), constraints),
    allOf: allOf(LOOP("any"), constraints),
    anyOf: anyOf(LOOP("any"), constraints),
    oneOf: oneOf(LOOP("any"), constraints),
    scalar: fc.oneof(
      { depthIdentifier },
      string_(constraints),
      number_(constraints),
      integer(constraints),
      boolean_(constraints),
      null_(constraints),
    ),
    any: fc.oneof(
      { depthIdentifier },
      LOOP("scalar"),
      LOOP("object"),
      LOOP("tuple"),
      LOOP("array"),
      LOOP("record"),
      LOOP("allOf"),
      LOOP("anyOf"),
      LOOP("oneOf"),
    )
  }))
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
  export const properties = tree.has("properties", core.is.object.any)
  export const additionalProperties = tree.has(
    "additionalProperties",
    core.or(core.is.boolean, core.is.object.any),
  )
  export const atLeastOneProperty
    : (u: { properties?: {} }) => boolean 
    = (u) => has.properties(u) && globalThis.Object.keys(u.properties).length > 0
}

/** @internal */
function simulateOptional<K extends keyof any, V>(key: K, value: V): { [P in K]+?: V }
function simulateOptional<K extends keyof any, V>(key: K, value: V) {
  return { 
    ...Math.random() > NEGATIVE_INFINITY && { [key]: value } 
  }
}
