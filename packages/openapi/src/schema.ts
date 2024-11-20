import { core, fc, tree } from "@traversable/core"
import { array, type keys, object } from "@traversable/data"

import * as fc_ from "fast-check"

import { type Arbitrary, type arbitrary, lit, type openapi } from "./types.js"

export interface HasType<T extends DataTypes[number] = DataTypes[number]> {
  type: T
}
export type DataTypes = typeof DataTypes
export const DataTypes = array.let(["string", "number", "integer", "boolean", "array", "object"])
export type DataType = typeof DataType
export const DataType = object.fromKeys(DataTypes)
export declare namespace DataType {
  export {
    DataType_array as array,
    DataType_boolean as boolean,
    DataType_number as number,
    DataType_object as object,
    DataType_string as string,
  }
  export type DataType_string = typeof DataType.string
  export type DataType_number = typeof DataType.number
  export type DataType_boolean = typeof DataType.boolean
  export type DataType_array = typeof DataType.array
  export type DataType_object = typeof DataType.object
}

export type Autocomplete<T> = T | (string & {})

/** @internal */
type inline<T> = T

namespace Compare {
  /**
   * ### {@link keysMeet `Compare.keysMeet`}
   *
   * Compares two sets of keys. Returns `true` if they
   * [meet](https://en.wikipedia.org/wiki/Join_and_meet).
   *
   * @example
   *  console.log(Compare.keysMeet({ a: 1 }, { b: 2 }))       // => false
   *  console.log(Compare.keysMeet({ d: 3 }, { c: 4, d: 5 })) // => true
   */
  export function keysMeet(lks: keys.any, rks: keys.any) {
    return lks.some((lk) => rks.includes(lk)) || rks.some((rk) => lks.includes(rk))
  }
}

///////////////
/// FORMATS
/** See also: https://spec.openapis.org/registry/format/ */
export declare namespace format {
  export { number_ as number, string_ as string }
}
export namespace format {
  export type KnownIntegerFormat = (typeof KnownIntegerFormats)[number]
  export const KnownIntegerFormats = ["int32", "int64"] as const

  export type ExtendedIntegerFormat = (typeof ExtendedIntegerFormats)[number]
  export const ExtendedIntegerFormats = [] as const

  export type integer = (typeof IntegerFormats)[number]
  export const IntegerFormats = [...KnownIntegerFormats, ...ExtendedIntegerFormats] as const

  export type KnownNumberFormat = (typeof KnownNumberFormats)[number]
  export const KnownNumberFormats = ["float", "double"] as const

  export type number_ = (typeof ExtendedNumberFormats)[number]
  export const ExtendedNumberFormats = [] as const

  export type NumberFormat = (typeof NumberFormats)[number]
  export const NumberFormats = [...KnownNumberFormats, ...ExtendedNumberFormats] as const

  export type KnownStringFormat = (typeof KnownStringFormats)[number]
  export const KnownStringFormats = ["password"] as const

  export const ExtendedStringFormats = [
    "date",
    "datetime",
    "email",
    "uuid",
    "ulid",
    "uri",
    "uri-reference",
  ] as const

  export type string_ = (typeof StringFormats)[number]
  export const StringFormats = [...ExtendedStringFormats, ...KnownStringFormats] as const

  export const integerNative = fc_.constantFrom("int32", "int64") /* KnownIntegerFormats */

  export const numberNative = fc_.constantFrom("float", "double") /* KnownNumberFormats */

  export const stringNative = fc_.constantFrom("password") /* KnownStringFormats */

  export const stringExtended = fc_.constantFrom(
    "date",
    "datetime",
    "email",
    "uuid",
    "ulid",
    "uri",
    "uri-reference",
  ) /* ExtendedStringFormats */

  export const integer = fc_.constantFrom("int32", "int64") /* IntegerFormats */
  export const number = fc_.constantFrom("float", "double") /* NumberFormats */
  export const string = fc_.constantFrom(
    "date",
    "datetime",
    "email",
    "uuid",
    "ulid",
    "uri",
    "uri-reference",
    "password",
  ) /* StringFormats */
  export const any = fc.lorem({ mode: "words", maxCount: 1 })
}
/// FORMATS
///////////////

//////////////
/// GUARDS

/** @internal */
const isNull: {
  (u: Schema.any | NullNode | openapi.$ref): u is NullNode
  (u: unknown): u is NullNode
} = (u: unknown): u is NullNode => u !== null && typeof u === "object" && "type" in u && u.type === "null"

/** @internal */
const includes_ = array.includes
/** @internal */
function isConst<T extends string>(u: Schema.any): u is Schema.StringNode & { const: T }
function isConst<T extends number>(u: Schema.any): u is Schema.IntegerNode & { const: T }
function isConst<T extends number>(u: Schema.any): u is Schema.NumberNode & { const: T }
function isConst<T extends boolean>(u: Schema.any): u is Schema.BooleanNode & { const: T }
function isConst(u: Schema.any): u is never {
  return Schema.is.scalar(u) && has.const(core.is.scalar)(u)
}
/** @internal */
const hasConst = <T extends {}>(guard: (u: unknown) => u is T) => tree.has(["const"], guard)

type typeOf<T, K extends keyof T = keyof T> = T extends { type: infer U extends Schema.datatype["type"] }
  ? U
  : K extends "allOf"
    ? "allOf"
    : K extends "anyOf"
      ? "anyOf"
      : K extends "oneOf"
        ? "oneOf"
        : "$ref"

function typeOf<T extends Schema.any>(u: T): typeOf<T>
function typeOf<T extends Schema.any>(u: T) {
  switch (true) {
    case "type" in u:
      return u.type
    case "allOf" in u:
      return "allOf"
    case "anyOf" in u:
      return "anyOf"
    case "oneOf" in u:
      return "oneOf"
    default:
      return "$ref"
  }
}

export declare namespace has {
  export { hasConst as const }
}
export namespace has {
  void (has.const = hasConst)
  ///
  export const items = tree.has("items")
  export const itemsSetToFalse = tree.has(["items"], core.is.literally(false))
  export const prefixItems = tree.has(["prefixItems"], core.is.array)
  export const properties = tree.has(["properties"], core.is.object)
  export const additionalProperties = tree.has(
    ["additionalProperties"],
    core.or(core.is.boolean, core.is.object),
  )
  export const atLeastOneProperty: (u: { properties?: {} }) => boolean = (u: { properties?: {} }) =>
    has.properties(u) && globalThis.Object.keys(u.properties).length > 0
}

export declare namespace is {
  export { isConst as const, isNull as null }
}
export function is(u: unknown): u is Schema.any {
  return core.or(tree.has(["type"], core.is.string), tree.has(["$ref"], core.is.string))(u)
}

export namespace is {
  void (is.null = isNull)
  void (is.const = isConst)
  ///

  export function nonRef<U>(u: U): u is globalThis.Exclude<U, openapi.$ref> {
    return u && typeof u === "object" && !("$ref" in u)
  }
  export function request(u: unknown): u is openapi.request {
    return nonRef(u)
  }
  export function requestBody(u: unknown): u is openapi.requestBody {
    return globalThis.Boolean(u) && typeof u === "object" && nonRef(u)
  }

  export const boolean: {
    (u: Schema.any | NullNode | openapi.$ref): u is Schema.BooleanNode
    (u: unknown): u is Schema.BooleanNode
  } = (u: unknown): u is never => u != null && typeof u === "object" && "type" in u && u.type === "boolean"

  export const integer: {
    (u: Schema.any | NullNode | openapi.$ref): u is Schema.IntegerNode
    (u: unknown): u is Schema.IntegerNode
  } = (u: unknown): u is never => u !== null && typeof u === "object" && "type" in u && u.type === "integer"

  export const number: {
    (u: Schema.any | NullNode | openapi.$ref): u is Schema.NumberNode
    (u: unknown): u is Schema.NumberNode
  } = (u: unknown): u is never => u != null && typeof u === "object" && "type" in u && u.type === "number"

  export const string: {
    (u: Schema.any | NullNode | openapi.$ref): u is Schema.StringNode
    (u: unknown): u is Schema.StringNode
  } = (u: unknown): u is never => u !== null && typeof u === "object" && "type" in u && u.type === "string"

  export const array: {
    (u: Schema.any | NullNode | openapi.$ref): u is Schema.ArrayNode
    (u: unknown): u is Schema.ArrayNode
  } = (u: unknown): u is never => u !== null && typeof u === "object" && "type" in u && u.type === "array"

  export const tuple: {
    (u: Schema.any | NullNode | openapi.$ref): u is Schema.TupleNode
    (u: unknown): u is Schema.TupleNode
  } = (u: unknown): u is Schema.TupleNode =>
    u !== null && typeof u === "object" && has.prefixItems(u) && "items" in u && u.items === false

  export const object: {
    (u: Schema.any | NullNode | openapi.$ref): u is Schema.ObjectNode
    (u: unknown): u is Schema.ObjectNode
  } = (u: unknown): u is Schema.ObjectNode =>
    u !== null && typeof u === "object" && "type" in u && u.type === "object"

  export const oneOf = (u: unknown): u is Schema.OneOf => tree.has(["oneOf"], core.is.array)(u)

  export const anyOf = (u: unknown): u is Schema.AnyOf => tree.has(["anyOf"], core.is.array)(u)

  export const allOf = (u: unknown): u is Schema.AllOf => tree.has(["allOf"], core.is.array)(u)

  export const scalar: {
    (u: Schema.any | NullNode | openapi.$ref): u is Schema.Scalar
    (u: unknown): u is Schema.Scalar
  } = (u: unknown): u is Schema.Scalar =>
    u !== null &&
    typeof u === "object" &&
    "type" in u &&
    ["boolean", "integer", "number", "string"].includes(u.type as string)

  export const hasType = <T extends DataTypes[number] = DataTypes[number]>(
    u: unknown,
    type?: T,
  ): u is { type: T } => tree.has(["type"], type ? core.is.literally(type) : includes_(DataTypes))(u)

  export const booleanLiteral = (
    u: Schema.any | NullNode | openapi.$ref,
  ): u is Schema.BooleanNode & { const: boolean } => Schema.is.boolean(u) && has.const(core.is.boolean)(u)

  export const integerLiteral = (
    u: Schema.any | NullNode | openapi.$ref,
  ): u is Schema.IntegerNode & { const: number } => Schema.is.integer(u) && has.const(core.is.number)(u)

  export const numberLiteral: {
    (u: Schema.any | NullNode | openapi.$ref): u is Schema.NumberNode & { const: number }
    (u: unknown): u is Schema.NumberNode & { const: number }
  } = (u: unknown): u is Schema.NumberNode & { const: number } =>
    Schema.is.number(u) && has.const(core.is.number)(u)

  export const ref = <T extends string>(u: unknown): u is openapi.$ref<T> => tree.has("$ref")(u)
  // : (u: unknown) => u is Ref.typedef
  export const stringLiteral = (
    u: Schema.any | NullNode | openapi.$ref,
  ): u is Schema.NumberNode & { const: string } => Schema.is.string(u) && has.const(core.is.string)(u)
  /// TODO: flesh out refs
}
/// GUARDS
//////////////

export interface XML extends Arbitrary.infer<typeof XML> {}
export const XML = fc.record(
  {
    name: fc.string(),
    namespace: fc.string(), // format: "uri"
    attribute: fc.boolean(), // default: false
    wrapped: fc.boolean(), // default: false
  },
  { requiredKeys: [] },
)

export interface ExternalDocumentation extends Arbitrary.infer<ReturnType<typeof ExternalDocumentation>> {}
export const ExternalDocumentation = (constraints: Schema.Constraints = Schema.defaultConstraints) =>
  fc.record(
    {
      url: fc.string(), // format: "uri-reference"
      ...(constraints.include?.description && { description: fc.lorem() }),
    },
    { requiredKeys: ["url"] },
  )

/////////////
/// SCHEMA
/** ### {@link Schema_Base `oas.Schema.Base`} */
export interface Schema_Base<T = unknown> extends Arbitrary.unmap<ReturnType<typeof Schema_base<T>>> {}

/** ### {@link Schema_base `oas.Schema.base`} */
export const Schema_base = <T>(constraints: Schema.Constraints<T> = Schema.defaultConstraints) => ({
  ...(constraints.nullable && { nullable: fc.boolean({ falseBias: true }) }), // default: false
  ...(constraints.include?.examples && {
    example: (constraints.arbitrary ?? fc.jsonValue()) as fc.Arbitrary<T>,
  }),
  ...(constraints.include?.const && { const: constraints.arbitrary ?? (fc.jsonValue() as fc.Arbitrary<T>) }),
  ...(constraints.include?.description && { description: fc.lorem() }),
  deprecated: fc.boolean(), // default: false
})

/** ### {@link Discriminator `oas.Discriminator`} */
export interface Discriminator extends Arbitrary.infer<typeof Discriminator> {}
export const Discriminator = fc.record(
  {
    propertyName: fc.string(),
    mapping: fc.dictionary(fc.string(), fc.string()),
  },
  { requiredKeys: ["propertyName"] },
)

type Schema_Scalar = BooleanNode | IntegerNode | NumberNode | StringNode

type Schema_datatype = NullNode | Schema.Scalar | ArrayNode | TupleNode | ObjectNode

type Schema_any = Schema_datatype | Schema.Combinator | openapi.$ref

/** ### {@link Schema `oas.Schema`} */
export namespace Schema {
  /** ### {@link Constraints `oas.Schema.Constraints`} */
  export interface Constraints<T = unknown> {
    depthSize?: fc.DepthSize
    nullable?: boolean
    empty?: T
    include?: arbitrary.Include
    arbitrary?: fc.Arbitrary<T>
  }

  /** ### {@link defaultConstraints `oas.Schema.defaultConstraints`} */
  export const defaultConstraints = {
    include: {
      description: false,
      example: false,
      examples: false,
      const: false,
    },
    depthSize: "small",
    empty: void 0 as never,
    nullable: true,
  } satisfies Required<Omit<Schema.Constraints, "arbitrary">> & { include: Required<arbitrary.Include> }

  /** ### {@link dictionary `oas.Schema.dictionary`} */
  export function dictionary(constraints: Schema.Constraints = Schema.defaultConstraints) {
    return fc.record({
      type: fc.constant(lit("object")),
      ...Schema_base({ ...constraints, empty: {} }),
      // discriminator: Discriminator,
      properties: fc.dictionary(Schema.any()),
    })
  }

  /** ### {@link boolean `oas.Schema.boolean`} */
  export const boolean = BooleanNode
  /** ### {@link integer `oas.Schema.integer`} */
  export const integer = IntegerNode
  /** ### {@link number `oas.Schema.number`} */
  export const number = NumberNode
  /** ### {@link string `oas.Schema.string`} */
  export const string = StringNode

  //////////
  /// def.
  /** ### {@link define `oas.Schema.define`} */
  export const define = (constraints: Schema.Constraints = Schema.defaultConstraints) =>
    fc.letrec((loop) => ({
      object: ObjectNode(loop("tree") as never, loop("tree") as never, constraints),
      array: ArrayNode(loop("tree") as never, constraints),
      oneOf: OneOfNode(loop("tree") as never),
      anyOf: AnyOfNode(loop("tree") as never),
      allOf: AllOfNode(loop("object") as never),
      tree: fc.oneof(
        { depthSize: constraints?.depthSize ?? Schema.defaultConstraints.depthSize },
        IntegerNode(constraints),
        NumberNode(constraints),
        StringNode(constraints),
        loop("array"),
        loop("object"),
        BooleanNode(constraints),
        loop("oneOf"),
        loop("anyOf"),
        loop("allOf"),
      ),
    }))

  function OneOfNode<T extends Schema.any>(arbitrary: fc.Arbitrary<T>): fc.Arbitrary<{ oneOf: T[] }>
  function OneOfNode<T extends Schema.any>(arbitrary: fc.Arbitrary<T>) {
    return fc.record({
      oneOf: fc.uniqueArray(arbitrary, {
        minLength: 1,
        maxLength: 3,
        selector: globalThis.Object.keys,
        comparator: Compare.keysMeet,
      }),
    })
  }

  function AnyOfNode<T extends Schema.any>(arbitrary: fc.Arbitrary<T>): fc.Arbitrary<{ anyOf: T[] }>
  function AnyOfNode<T extends Schema.any>(arbitrary: fc.Arbitrary<T>) {
    return fc.record({
      anyOf: fc.uniqueArray(arbitrary, {
        minLength: 1,
        maxLength: 3,
        selector: globalThis.Object.keys,
        comparator: Compare.keysMeet,
      }),
    })
  }

  function AllOfNode<T extends Schema.ObjectNode>(arbitrary: fc.Arbitrary<T>): fc.Arbitrary<{ allOf: T[] }>
  function AllOfNode<T extends Schema.ObjectNode>(arbitrary: fc.Arbitrary<T>) {
    return fc.record({
      allOf: fc.uniqueArray(arbitrary, {
        minLength: 1,
        maxLength: 3,
        selector: globalThis.Object.keys,
        comparator: Compare.keysMeet,
      }),
    })
  }

  /** ### {@link declare `oas.Schema.declare`} */
  export type declare = {
    tree: Schema_any
    array: Schema.ArrayNode<Schema_any>
    object: Schema.ObjectNode
  }

  /** ### {@link typedef `oas.Schema.typedef`} */
  export interface typedef extends Schema.declare {}
  /** ### {@link typedef `oas.Schema.typedef`} */
  export const typedef = Schema.define()
  /** ### {@link any `oas.Schema.any`} */

  /** ### {@link array `oas.Schema.array`} */
  export const array = typedef.array
  /** ### {@link object `oas.Schema.object`} */
  export const object = typedef.object

  /** ### {@link OneOf `oas.Schema.OneOf`} */
  export interface OneOf {
    oneOf: readonly Schema.any[]
  }

  /** ### {@link oneOf `oas.Schema.oneOf`} */
  export const oneOf = typedef.oneOf

  /** ### {@link AnyOf `oas.Schema.AnyOf`} */
  export interface AnyOf {
    anyOf: readonly Schema.any[]
  }

  /** ### {@link anyOf `oas.Schema.anyOf`} */
  export const anyOf = typedef.anyOf

  /** ### {@link AllOf `oas.Schema.AllOf`} */
  export interface AllOf {
    allOf: readonly Schema.any[]
  }

  /** ### {@link allOf `oas.Schema.allOf`} */
  export const allOf = typedef.allOf

  export function any(constraints: Schema.Constraints = Schema.defaultConstraints): fc.Arbitrary<Schema.any> {
    return fc.oneof(
      Schema.object,
      Schema.array,
      Schema.oneOf,
      Schema.anyOf,
      Schema.allOf,
      Schema.string(),
      Schema.number(),
      Schema.integer(),
      Schema.boolean(),
    )
  }

  export type Combinator = Schema.AllOf | Schema.AnyOf | Schema.OneOf
}

void (Schema.is = is)
void (Schema.base = Schema_base)
void (Schema.NullNode = NullNode)
void (Schema.BooleanNode = BooleanNode)
void (Schema.IntegerNode = IntegerNode)
void (Schema.NumberNode = NumberNode)
void (Schema.StringNode = StringNode)
void (Schema.ObjectNode = ObjectNode)
void (Schema.ArrayNode = ArrayNode)
void (Schema.typeof = typeOf)

export interface $ref<T extends string = string> extends openapi.$ref<T> {}

/** ### {@link Schema `oas.Schema`} */
export declare namespace Schema {
  export {
    is,
    typeOf as typeof,
    ArrayNode,
    BooleanNode,
    IntegerNode,
    NullNode,
    NumberNode,
    ObjectNode,
    $ref,
    StringNode,
    TupleNode,
    /** ### {@link Schema_any `oas.Schema.any`} */
    Schema_any as any,
    /** ### {@link Schema_datatype `oas.Schema.datatype`} */
    Schema_datatype as datatype,
    /** ### {@link Schema_Base `oas.Schema.Base`} */
    Schema_Base as Base,
    /** ### {@link Schema_base `oas.Schema.base`} */
    Schema_base as base,
    /** ### {@link Schema_Scalar `oas.Schema.Scalar`} */
    Schema_Scalar as Scalar,
  }
}

// export interface Ref<T extends string = string> extends inline<{ $ref: T }> { required: never }

export interface NullNode {
  type: "null"
  nullable: true
  enum: [null]
}
export function NullNode(): fc.Arbitrary<NullNode> {
  return fc.constant({ type: "null", nullable: true, enum: [null] })
}

export interface BooleanNode extends Partial<Schema_Base<boolean>> {
  type: "boolean"
}
export function BooleanNode(
  constraints: Schema.Constraints = Schema.defaultConstraints,
): fc.Arbitrary<BooleanNode> {
  return fc.record(
    {
      type: fc.constant(lit("boolean")),
      ...Schema_base({ ...constraints, empty: false, arbitrary: fc.boolean() }),
    },
    { requiredKeys: ["type"] },
  )
}

function absorbNaN<K extends string>(key: K, x?: number): { [P in K]+?: number }
function absorbNaN(key: string, x?: number) {
  return { ...(globalThis.Number.isNaN(globalThis.Number(x)) ? {} : { [key]: x }) }
}
const minimumOf = (x?: number, y?: number) =>
  globalThis.Math.min(x ?? globalThis.Number.NaN, y ?? globalThis.Number.NaN)
const maximumOf = (x?: number, y?: number) =>
  globalThis.Math.max(x ?? globalThis.Number.NaN, y ?? globalThis.Number.NaN)
const factorOf = (lo?: number, hi?: number) => (x?: number) =>
  (x ?? globalThis.Number.NaN) %
    globalThis.Math.abs(globalThis.Math.min(lo ?? globalThis.Number.NaN, hi ?? globalThis.Number.NaN)) ===
    0 &&
  globalThis.Math.abs(globalThis.Math.max(lo ?? globalThis.Number.NaN, hi ?? globalThis.Number.NaN)) %
    (x ?? globalThis.Number.NaN) ===
    0
    ? (x ?? globalThis.Number.NaN)
    : globalThis.Number.NaN

/** ### {@link IntegerNode `oas.IntegerNode`} */
export interface IntegerNode extends Partial<Schema_Base<number>> {
  type: "integer"
  format?: Autocomplete<format.integer>
  minimum?: number
  maximum?: number
  exclusiveMinimum?: boolean
  exclusiveMaximum?: boolean
  multipleOf?: number
}

export function IntegerNode(
  constraints: Schema.Constraints = Schema.defaultConstraints,
): fc.Arbitrary<IntegerNode> {
  return fc
    .record(
      {
        type: fc.constant(lit("integer")),
        format: fc.oneof(format.integer, format.any),
        minimum: fc.integer(),
        maximum: fc.integer(),
        exclusiveMinimum: fc.boolean(), // default: false
        exclusiveMaximum: fc.boolean(), // default: false
        multipleOf: fc.nat(),
        ...Schema_base({ ...constraints, empty: 0, arbitrary: fc.integer() }),
      },
      { requiredKeys: ["type"] },
    )
    .map(({ type, format, minimum, maximum, multipleOf, exclusiveMinimum, exclusiveMaximum, ...node }) => ({
      type,
      format,
      ...absorbNaN("minimum", minimumOf(minimum, maximum)),
      ...absorbNaN("maximum", maximumOf(minimum, maximum)),
      ...absorbNaN("multipleOf", factorOf(minimum, maximum)(multipleOf)),
      ...(exclusiveMinimum != null && minimum != null && { exclusiveMinimum }),
      ...(exclusiveMaximum != null && maximum != null && { exclusiveMaximum }),
      ...node,
    }))
}

/** ### {@link NumberNode `oas.NumberNode`} */
export interface NumberNode extends Partial<Schema_Base<number>> {
  type: "number"
  format?: Autocomplete<format.number>
  minimum?: number
  maximum?: number
  exclusiveMinimum?: boolean
  exclusiveMaximum?: boolean
  multipleOf?: number
}

export function NumberNode(
  constraints: Schema.Constraints = Schema.defaultConstraints,
): fc.Arbitrary<NumberNode> {
  return fc
    .record(
      {
        type: fc.constant(lit("number")),
        format: fc.oneof(format.number, format.any),
        minimum: fc.float(),
        maximum: fc.float(),
        exclusiveMinimum: fc.boolean(), // default: false
        exclusiveMaximum: fc.boolean(), // default: false
        multipleOf: fc.float({ min: 1, minExcluded: true }),
        ...Schema_base({ ...constraints, empty: 0, arbitrary: fc.float() }),
      },
      { requiredKeys: ["type"] },
    )
    .map(({ type, format, minimum, maximum, multipleOf, exclusiveMinimum, exclusiveMaximum, ...node }) => ({
      type,
      format,
      ...absorbNaN("minimum", minimumOf(minimum, maximum)),
      ...absorbNaN("maximum", maximumOf(minimum, maximum)),
      ...absorbNaN("multipleOf", factorOf(minimum, maximum)(multipleOf)),
      ...(exclusiveMinimum != null && minimum != null && { exclusiveMinimum }),
      ...(exclusiveMaximum != null && maximum != null && { exclusiveMaximum }),
      ...node,
    }))
}

/** ### {@link StringNode `oas.StringNode`} */
export interface StringNode extends Partial<Schema_Base<string>> {
  type: "string"
  pattern?: Autocomplete<format.string>
  format?: string
  minLength?: number
  maxLength?: number
}

/** ### {@link StringNode `oas.StringNode`} */
export function StringNode(
  constraints: Schema.Constraints = Schema.defaultConstraints,
): fc.Arbitrary<StringNode> {
  return fc
    .tuple(
      StringNode_format(constraints),
      fc.record(
        {
          type: fc.constant(lit("string")),
          pattern: fc.string(), // format: "regex"
          minLength: fc.nat(),
          maxLength: fc.nat(),
          // format: fc.oneof(format.string, format.any),
          ...Schema_base({
            ...constraints,
            empty: "",
            arbitrary: fc.oneof(fc.lorem(), fc.string({ unit: "binary-ascii" })),
          }),
        },
        { requiredKeys: ["type"] },
      ),
    )
    .map(([format, { example, ...body }]) => ({
      ...format,
      ...body,
      ...((format.example || example) && { example: format.example ?? example }),
    }))
}
void (StringNode.email = StringNode_email)
void (StringNode.date = StringNode_date)
void (StringNode.datetime = StringNode_datetime)
void (StringNode.ulid = StringNode_ulid)
void (StringNode.uuid = StringNode_uuid)
void (StringNode.uri = StringNode_uri)
void (StringNode.format = StringNode_format)

export function StringNode_email(constraints: Schema.Constraints = Schema.defaultConstraints) {
  return {
    format: fc.constant("string"),
    ...(constraints.include?.example && { example: fc.emailAddress() }),
  } satisfies Record<string, fc.Arbitrary<unknown>>
}
export function StringNode_date(constraints: Schema.Constraints = Schema.defaultConstraints) {
  return {
    format: fc.constant("date"),
    ...(constraints.include?.example && {
      example: fc.date({ noInvalidDate: true }).map((d) => d.toISOString().substring(0, 10)),
    }),
  }
}
export function StringNode_datetime(constraints: Schema.Constraints = Schema.defaultConstraints) {
  return {
    format: fc.constant("datetime"),
    ...(constraints.include?.example && {
      example: fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
    }),
  }
}
export function StringNode_uuid(constraints: Schema.Constraints = Schema.defaultConstraints) {
  return {
    format: fc.constant("uuid"),
    ...(constraints.include?.example && { example: fc.uuid({ version: 7 }) }),
  }
}
export function StringNode_ulid(constraints: Schema.Constraints = Schema.defaultConstraints) {
  return {
    format: fc.constant("ulid"),
    ...(constraints.include?.example && { example: fc.uuid({ version: 7 }) }),
  }
}
export function StringNode_uri(constraints: Schema.Constraints = Schema.defaultConstraints) {
  return {
    format: fc.constant("uri"),
    ...(constraints.include?.example && {
      example: fc.webUrl({ withQueryParameters: true, withFragments: true }),
    }),
  }
}
export function StringNode_format(constraints: Schema.Constraints = Schema.defaultConstraints) {
  return fc.oneof(
    fc.record(StringNode_date(constraints), { requiredKeys: [] }),
    fc.record(StringNode_datetime(constraints), { requiredKeys: [] }),
    fc.record(StringNode_email(constraints), { requiredKeys: [] }),
    fc.record(StringNode_ulid(constraints), { requiredKeys: [] }),
    fc.record(StringNode_uuid(constraints), { requiredKeys: [] }),
    fc.record(StringNode_uri(constraints), { requiredKeys: [] }),
  )
}

interface ItemConstraints {
  maxItems: number
  minItems: number
  uniqueItems: boolean
}

/**
 * A "tuple" node can be represented in JSON schema by
 * setting the items key to `false`, and using `prefixItems`
 * to define the schemas at each index.
 */
export interface TupleNode<T extends { [x: number]: unknown } = readonly Schema.any[]>
  extends globalThis.Partial<Schema_Base<T>>,
    globalThis.Partial<ItemConstraints> {
  type: "array"
  items: false
  prefixItems: T
}

export function TupleNode<const T extends readonly unknown[]>(
  items: fc.Arbitrary<T>,
  constraints?: Schema.Constraints,
): fc.Arbitrary<TupleNode<T>>
export function TupleNode<const T extends { [x: number]: unknown }>(
  items: fc.Arbitrary<T>,
  constraints?: Schema.Constraints,
): fc.Arbitrary<TupleNode<T>>
export function TupleNode(items: fc.Arbitrary<{ [x: number]: unknown }>, constraints?: Schema.Constraints) {
  return fc.record({
    type: fc.constant("array"),
    items: fc.constant(false),
    prefixItems: items,
    ...Schema_base({ ...constraints, empty: [] as never, arbitrary: items }),
    maxItems: fc.nat(),
    minItems: fc.nat(), // default: 0
    uniqueItems: fc.boolean(), // default: false
  })
}

export interface ArrayNode<T extends Schema.any = Schema.any>
  extends globalThis.Partial<Schema_Base<readonly T[]>>,
    globalThis.Partial<ItemConstraints> {
  type: "array"
  items: T
  prefixItems?: never
}

/** ### {@link ArrayNode `oas.ArrayNode`} */
export function ArrayNode<T extends Schema.any>(
  items: fc.Arbitrary<T>,
  constraints?: Schema.Constraints,
): fc.Arbitrary<ArrayNode<T>>
export function ArrayNode(
  items: fc.Arbitrary<Schema.any>,
  constraints?: Schema.Constraints,
): fc.Arbitrary<ArrayNode<Schema.any>>
export function ArrayNode(
  items: fc.Arbitrary<unknown>,
  constraints: Schema.Constraints = Schema.defaultConstraints,
): {} {
  return fc.record(
    {
      type: fc.constant(lit("array")),
      items,
      ...Schema_base({ ...constraints, empty: [] }),
      maxItems: fc.nat(),
      minItems: fc.nat(), // default: 0
      uniqueItems: fc.boolean(), // default: false
    },
    {
      requiredKeys: ["type", "items"],
    },
  )
}

interface ObjectNode_Shape {
  discriminator: Arbitrary.infer<typeof Discriminator>
}

/** ### {@link ObjectNode `oas.ObjectNode`} */
interface ObjectNode<T extends { [x: string]: unknown } = { [x: string]: Schema.any }, U = T>
  extends globalThis.Partial<Schema_Base>,
    globalThis.Partial<ObjectNode_Shape> {
  type: "object"
  properties: T
  // additionalProperties?: boolean | Ref.typedef | U
  required: readonly ({} extends T ? unknown : keyof T & (string | number))[]
}

/** @internal */
function addProps<T>(properties: fc.Arbitrary<T>) {
  return fc.oneof(properties, fc.constant(false))
}

function ObjectNode<T extends fc.Arbitrary<Schema.any>, U>(
  properties: T,
  additional?: fc.Arbitrary<U>,
  constraints: Schema.Constraints = Schema.defaultConstraints,
) {
  return fc
    .record(
      {
        type: fc.constant("object"),
        properties: fc.dictionary(properties),
        ...(core.is.record(additional) && { additionalProperties: addProps(additional) }),
        ...Schema_base({ ...constraints, empty: {} }),
      },
      { requiredKeys: ["type", "properties"] },
    )
    .map(({ type, ...schema }) => ({
      type,
      required: [...(has.atLeastOneProperty(schema) ? fc.peek(fc.keysof(schema.properties)) : [])],
      ...schema,
    }))
}
