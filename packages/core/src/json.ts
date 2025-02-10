export { Json }

import { fn } from "@traversable/data"
import type { Functor, HKT, inline } from "@traversable/registry"

/** @internal */
const Object_entries = globalThis.Object.entries
/** @internal */
const Object_fromEntries = globalThis.Object.fromEntries
/** @internal */
const Object_values = globalThis.Object.values
/** @internal */
const Object_assign = globalThis.Object.assign
/** @internal */
const Number_isInteger 
  : (u: unknown) => u is number
  = globalThis.Number.isInteger as never
/** @internal */
const Array_isArray 
  : <T>(u: unknown) => u is readonly T[]
  = globalThis.Array.isArray


/** 
 * ### {@link Json_array `Json.array`}
 */
interface Json_array extends inline<readonly Json[]> {}

/** 
 * ### {@link Json_object `Json.object`}
 */
interface Json_object extends inline<{ [x: string]: Json }> {}

/** 
 * ## {@link Json_lambda `Json.lambda`}
 */
interface Json_lambda extends HKT { [-1]: Json_of<this[0]> }

/** 
 * ## {@link Json_leaf `Json.leaf`}
 */
type Json_leaf = 
    | undefined
    | null 
    | boolean 
    | number 
    | string
    ;

/** 
 * ## {@link Json_of `Json.of`}
 */
type Json_of<T> =
  | Json_leaf
  | readonly T[]
  | { [x: string]: T }
  ;

const is = {
  undefined: (u: unknown): u is undefined => u === undefined,
  null: (u: unknown): u is null | undefined => u == null,
  boolean: (u: unknown): u is boolean => typeof u === "boolean",
  integer: (u: unknown): u is number => Number_isInteger(u),
  number: (u: unknown): u is number => typeof u === "number",
  string: (u: unknown): u is string => typeof u === "string",
  array: Array_isArray,
  object: <T>(u: unknown): u is { [x: string]: T } => 
    u !== null && typeof u === "object" && !Array_isArray(u),
  leaf: (u: unknown): u is Json_leaf => 
    is.null(u) ||
    is.boolean(u) ||
    is.integer(u) ||
    is.number(u) ||
    is.string(u),
}

declare namespace isJson { type Options = { mode?: "shallow" | "recursive" } }

/** 
 * ### {@link isJson `isJson`}
 * 
 * By default, {@link isJson `isJson`} performs a shallow
 * check on its input, which means arrays and objects nested
 * more than 2 levels deep will not be checked.
 * 
 * If you'd like the validation to be applied recursively,
 * pass the string `"recursive"` as the second argument, or
 * call {@link isJson.loop `Json.is.loop`} directly.
 */
function isJson(u: unknown): u is Json
function isJson(u: unknown, options?: isJson.Options): u is Json
function isJson(
  u: unknown, { 
    mode = "shallow" 
}: isJson.Options = { mode: "shallow" }): u is Json {
  if (mode === "recursive") return isJson.loop(u)
  else return is.leaf(u) 
  || (is.array(u) && u.every(isJson)) 
  || (is.object(u) && Object_values(u).every(isJson))
}

isJson.loop = (u: unknown): u is Json => {
  switch (true) {
    case is.leaf(u): return true
    case is.array(u): return u.every(isJson.loop)
    case is.object(u): return Object_values(u).every(isJson)
    default: return false
  }
}

type isJson = never | {
  (u: unknown): u is Json
  (u: unknown, options?: isJson.Options): u is Json
  loop: typeof isJson.loop
}

/**
 * ## {@link Json_is `Json.is`}
 */
const Json_is: isJson & typeof is = Object_assign(
  isJson,
  is,
)

/**
 * ## {@link Json_Functor `Json.Functor`}
 */
const Json_Functor: Functor<Json.lambda, Json> = { 
  map: function map(f) {
    return (x) => {
      switch (true) {
        default: return fn.exhaustive(x)
        case is.leaf(x): return x
        case is.array(x): return x.map(f)
        case is.object(x): return Object_fromEntries(Object_entries(x).map(([k, v]) => [k, f(v)]))
      }
    }
  }
}

/**
 * ## {@link Json_map `Json.map`}
 */
const Json_map = Json_Functor.map

/**
 * ## {@link Json_fold `Json.fold`}
 * 
 * Given an algebra, {@link Json_fold `Json.fold`} returns a function
 * that takes any {@link JSON `JSON`} value, and returns the result
 * of recursively applying the algebra to that value.
 * 
 * Think of it like a recursive "reduce" function.
 */
const Json_fold = fn.cata(Json_Functor)
const Json_unfold = fn.ana(Json_Functor)
const Json_refold = fn.hylo(Json_Functor)

type Json = 
  | Json_leaf
  | Json_array 
  | Json_object
  ;

declare namespace Json {
  export { 
    Json_array as array, 
    Json_lambda as lambda,
    Json_leaf as leaf,
    Json_object as object,
    Json_of as of,
    Json as any,
  }
}

/** 
 * ## {@link Json `Json`}
 */
function Json() {}
void (Json.Functor = Json_Functor)
void (Json.fold = Json_fold)
void (Json.unfold = Json_unfold)
void (Json.map = Json_Functor.map)
void (Json.is = Json_is)


////////////////
/// examples ///
namespace algebra {
  /** 
   * #### {@link toString `Json.algebra.toString`}
   * 
   * This function is included as a naive implementation of {@link JSON.stringify `JSON.stringify`}.
   * It isn't meant to be used so much as serve as an example of how recursion schemes can be used
   * to write a recursive algorithm without writing any recursive logic.
   * 
   * An algebra can be applied by using a fold, for example:
   * 
   * @example
   *  const stringify = Json.fold(Json.algebra.toString)
   * 
   *  console.log(stringify({ a: 1, b: [{ c: 2 }, "3"] })) // => {"a":1,"b":[{"c":2},"3"]}
   */
  const toString
    : Functor.Algebra<Json.lambda, string>
    = (_) => {
      switch (true) {
        default: return fn.exhaustive(_)
        case is.string(_): return '"' + _ + '"'
        case is.leaf(_): return `${_}`
        case is.array(_): return "[" + _.join(",") + "]"
        case is.object(_): return "{" + Object_entries(_).map(([k, v]) => `"${k}":${v}`).join(",") + "}"
      }
    }
}
