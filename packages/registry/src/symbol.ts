export { symbol_ as symbol, URI }

const ns = "@traversable/registry/URI" as const
const URI_REGISTRY = `${ns}::KnownSymbolRegistry`

const URI_null = `${ns}::Null` as const
type URI_null = typeof URI_null
const URI_undefined = `${ns}::Undefined` as const
type URI_undefined = typeof URI_undefined
const URI_boolean = `${ns}::Boolean` as const
type URI_boolean = typeof URI_boolean
const URI_symbol = `${ns}::Symbol` as const
type URI_symbol = typeof URI_symbol
const URI_number = `${ns}::Number` as const
type URI_number = typeof URI_number
const URI_bigint = `${ns}::Bigint` as const
type URI_bigint = typeof URI_bigint
const URI_string = `${ns}::String` as const
type URI_string = typeof URI_string
const URI_object = `${ns}::Object` as const
type URI_object = typeof URI_object

const symbol_null = Symbol.for(URI_null)
type symbol_null = typeof symbol_null
const symbol_undefined = Symbol.for(URI_undefined)
type symbol_undefined = typeof symbol_undefined
const symbol_boolean = Symbol.for(URI_boolean)
type symbol_boolean = typeof symbol_boolean
const symbol_symbol = Symbol.for(URI_symbol)
type symbol_symbol = typeof symbol_symbol
const symbol_number = Symbol.for(URI_number)
type symbol_number = typeof symbol_number
const symbol_bigint = Symbol.for(URI_bigint)
type symbol_bigint = typeof symbol_bigint
const symbol_string = Symbol.for(URI_string)
type symbol_string = typeof symbol_string
const symbol_object = Symbol.for(URI_object)
type symbol_object = typeof symbol_object
const symbol_REGISTRY = Symbol.for(URI_REGISTRY)
type symbol_REGISTRY = typeof symbol_REGISTRY




declare namespace URI {
  export { URI_REGISTRY as REGISTRY }
  export {
    URI_null as null,
    URI_undefined as undefined,
    URI_boolean as boolean,
    URI_symbol as symbol,
    URI_number as number,
    URI_bigint as bigint,
    URI_string as string,
    URI_object as object,
  }
}

namespace URI {
  /////////////////////////////////////////////////////
  /// URIs that do __NOT__ have an associated symbol
  export const Some = `${ns}::Option.Some` as const
  export type Some = typeof Some
  export const None = `${ns}::Option.None` as const
  export type None = typeof None
  export const Ok = `${ns}::Result.Ok` as const
  export type Ok = typeof Ok
  export const Err = `${ns}::Result.Err` as const
  export type Err = typeof Err
  export const Left = `${ns}::Either.Left` as const
  export type Left = typeof Left
  export const Right = `${ns}::Either.Right` as const
  export type Right = typeof Right
  /// URIs that do __NOT__ have an associated symbol
  /////////////////////////////////////////////////////

  /////////////////////////////////////////////////////
  /// URIs that __do__ have an associated symbol
  /**
   * See also:
   * - NodeJS docs on [https://nodejs.org/api/util.html#utilinspectcustom](util.inspect.custom)
   */
  export const nodejs_util_inspect_custom = "nodejs.util.inspect.custom" as const
  export const ref = `${ns}::Ref` as const
  export type ref = typeof URI.ref
  export const leaf = `${ns}::Leaf` as const
  export type leaf = typeof URI.leaf
  export const not_found = `${ns}::NotFound` as const
  export type not_found = typeof URI.not_found
  export const nullable = `${ns}::Nullable` as const
  export type nullable = typeof URI.nullable
  export const optional = `${ns}::Optional` as const
  export type optional = typeof URI.optional
  export const unit = `${ns}::Unit` as const
  export type unit = typeof URI.unit
  export const numeric_index = `${ns}::NumericIndex` as const
  export type numeric_index = typeof URI.numeric_index
  export const string_index = `${ns}::StringIndex` as const
  export type string_index = typeof URI.string_index
  export const sum = `${ns}::SumType` as const
  export type sum = typeof URI.sum
  export const product = `${ns}::ProductType` as const
  export type product = typeof URI.product
  export const join = `${ns}::Join` as const
  export type join = typeof URI.join
  export const meet = `${ns}::Meet` as const
  export type meet = typeof URI.meet
  export const finite = `${ns}::Finite` as const
  export type finite = typeof URI.finite
  export const nonfinite = `${ns}::NonFinite` as const
  export type nonfinite = typeof URI.nonfinite
  export const union = `${ns}::Union` as const
  export const integer = `${ns}::Integer` as const
  export type integer = typeof URI.integer
  export type union = typeof URI.union
  export const array = `${ns}::Array` as const
  export type array = typeof URI.array
  export const record = `${ns}::Record` as const
  export type record = typeof URI.record
  export const tuple = `${ns}::Tuple` as const
  export type tuple = typeof URI.tuple
  export const intersection = `${ns}::Intersection` as const
  export type intersection = typeof URI.intersection
  export const disjoint = `${ns}::DisjointUnion` as const
  export type disjoint = typeof URI.disjoint
  export const tag = `${ns}::tag` as const
  export type tag = typeof URI.tag
  /// URIs that __do__ have an associated symbol
  /////////////////////////////////////////////////////
}

void (URI.REGISTRY = URI_REGISTRY)
void (URI.null = URI_null)
void (URI.undefined = URI_undefined)
void (URI.boolean = URI_boolean)
void (URI.symbol = URI_symbol)
void (URI.number = URI_number)
void (URI.bigint = URI_bigint)
void (URI.string = URI_string)
void (URI.object = URI_object)

declare namespace symbol_ {
  export { symbol_REGISTRY as REGISTRY }
  export {
    symbol_null as null,
    symbol_undefined as undefined,
    symbol_boolean as boolean,
    symbol_symbol as symbol,
    symbol_number as number,
    symbol_bigint as bigint,
    symbol_string as string,
    symbol_object as object,
  }
}
namespace symbol_ {
  /**
   * See also:
   * - NodeJS docs on [https://nodejs.org/api/util.html#utilinspectcustom](util.inspect.custom)
   */
  export const nodejs_util_inspect_custom = Symbol.for(URI.nodejs_util_inspect_custom)
  export const ref = Symbol.for(URI.ref)
  export type ref = typeof symbol_.ref
  export const leaf = Symbol.for(URI.leaf)
  export type leaf = typeof symbol_.leaf
  export const not_found = Symbol.for(URI.not_found)
  export type not_found = typeof symbol_.not_found
  export const nullable = Symbol.for(URI.nullable)
  export type nullable = typeof symbol_.nullable
  export const optional = Symbol.for(URI.optional)
  export type optional = typeof symbol_.optional
  export const unit = Symbol.for(URI.unit)
  export type unit = typeof symbol_.unit
  export const numeric_index = Symbol.for(URI.numeric_index)
  export type numeric_index = typeof symbol_.numeric_index
  export const string_index = Symbol.for(URI.string_index)
  export type string_index = typeof symbol_.string_index
  ///
  export const sum = Symbol.for(URI.sum)
  export type sum = typeof symbol_.sum
  export const product = Symbol.for(URI.product)
  export type product = typeof symbol_.product
  export const join = Symbol.for(URI.join)
  export type join = typeof symbol_.join
  export const meet = Symbol.for(URI.meet)
  export type meet = typeof symbol_.meet
  export const finite = Symbol.for(URI.finite)
  export type finite = typeof symbol_.finite
  export const nonfinite = Symbol.for(URI.nonfinite)
  export type nonfinite = typeof symbol_.nonfinite
  export const union = Symbol.for(URI.union)
  export type union = typeof symbol_.union
  export const integer = Symbol.for(URI.integer)
  export type integer = typeof symbol_.integer
  export const array = Symbol.for(URI.array)
  export type array = typeof symbol_.array
  export const record = Symbol.for(URI.record)
  export type record = typeof symbol_.record
  export const tuple = Symbol.for(URI.tuple)
  export type tuple = typeof symbol_.tuple
  export const intersection = Symbol.for(URI.intersection)
  export type intersection = typeof symbol_.intersection
  export const disjoint = Symbol.for(URI.disjoint)
  export type disjoint = typeof symbol_.disjoint
  export const tag = Symbol.for(URI.tag)
  export type tag = typeof symbol_.tag
}

void (symbol_.REGISTRY = symbol_REGISTRY)
void (symbol_.undefined = symbol_undefined)
void (symbol_.null = symbol_null)
void (symbol_.boolean = symbol_boolean)
void (symbol_.symbol = symbol_symbol)
void (symbol_.number = symbol_number)
void (symbol_.bigint = symbol_bigint)
void (symbol_.string = symbol_string)
void (symbol_.object = symbol_object)
