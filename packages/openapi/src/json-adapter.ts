import { type JSON, is } from "@traversable/core"
import { Option, fn, type keys, map, number, object, pair } from "@traversable/data"
import { Invariant } from "@traversable/registry"
import { Schema } from "./schema.js"

type Mutable<T> = never | { -readonly [K in keyof T]: T[K] }
type Keep<T, K extends keyof T = never> 
  = [K] extends [never] ? T : 
  & { [P in K]-?: T[P] } 
  & { [P in Exclude<keyof T, K>]+?: T[P] }

export type toJSON<T> 
  = T extends { type: "null" } ? null
  : T extends { type: "integer" | "number" | "string" | "boolean"; const: infer S } ? S
  : T extends { type: "array"; prefixItems: infer S extends readonly unknown[] } ? { [x in keyof S]: toJSON<S[x]> }
  : T extends { type: "array"; items: infer S extends readonly unknown[] } ? { [x in keyof S]: toJSON<S[x]> }
  : T extends { type: "object"; properties: infer S } ? { [k in keyof S]: toJSON<S[k]> }
  : T

/** 
 * ## {@link toJSON `oas.toJSON`}
 * 
 * Converts an OpenAPI document to beta-normal form.
 * 
 * You can control how the leaves will be normalized by defining a
 * {@link normalizer `normalizer`}, which is just a function that takes
 * the leaf node and returns a fallback value of that type.
 * 
 * If no normalizer is defined, {@link toJSON `oas.toJSON`} will use the
 * node's example data, if it exists.
 * 
 * If it does not exist, the leaf's corresponding entry in 
 * {@link toJSON.defaults `oas.toJSON.defaults`} will be used.
 * 
 * See also:
 * - {@link fromJSON `oas.fromJSON`}
 * 
 * @example
 *  import { oas } from "@hotelengine/shared-oas"
 *  import * as vi from "vitest"
 *
 *  // 🡻🡻 ✅
 *  vi.assert.equal( 
 *    oas.toJSON({
 *      type: "object",
 *      required: ["a", "b"],
 *      properties: {
 *        a: { type: "boolean", const: true },
 *        b: {
 *          type: "array",
 *          items: false,
 *          minItems: 3,
 *          maxItems: 3,
 *          prefixItems: [
 *            { type: "number", const: 1 },
 *            { type: "null", nullable: true, enum: [null] },
 *            {
 *              type: "object",
 *              required: ["c"],
 *              properties: { c: { type: "string", const: "" } },
 *            },
 *          ],
 *        },
 *      },
 *    }),
 *    { a: true, b: [1, null, { c: "" }] }
 *  )
 */
export function toJSON<T>(document: T): toJSON<T>
export function toJSON<T>(document: T, normalizer: toJSON.Normalizer): toJSON<T>
export function toJSON(document: Schema.any): toJSON<{}>
export function toJSON<T>(tree: Schema.any, normalizer?: toJSON.Normalizer) {
  const traverse = toJSON.loop(normalizer)
  return traverse(tree)
}

export namespace toJSON {
  export interface Normalizer extends Partial<{
    string(node: Schema.StringNode): string
    number(node: Schema.NumberNode): number
    integer(node: Schema.IntegerNode): number
    boolean(node: Schema.BooleanNode): boolean
  }> {}

  export const defaults = {
    boolean() { return false },
    integer() { return 0 },
    number() { return 0 },
    string() { return "" },
  } as const satisfies Required<toJSON.Normalizer>

  export const loop 
    : (normalize?: toJSON.Normalizer) => (a: Schema.any) => unknown
    = (normalize) => fn.loop((node, loop) => {
        switch (true) {
          case Schema.is.null(node): return node.enum[0]
          case Schema.is.const(node): return node.const
          case Schema.is.boolean(node): return (
            normalize?.boolean?.(node) 
            ?? node.example 
            ?? toJSON.defaults.boolean()
          )
          case Schema.is.integer(node): return (
            normalize?.integer?.(node) 
            ?? node.example 
            ?? toJSON.defaults.integer()
          )
          case Schema.is.number(node): return (
            normalize?.number?.(node) 
            ?? node.example 
            ?? toJSON.defaults.number()
          )
          case Schema.is.string(node): return (
            normalize?.string?.(node) 
            ?? node.example 
            ?? toJSON.defaults.string()
          )
          case Schema.is.tuple(node): return map(node.prefixItems, loop)
          case Schema.is.array(node): return [loop(node.items)]
          case Schema.is.object(node): return map(node.properties, loop)
          case Schema.is.allOf(node): return Invariant.NotYetSupported("allOf", "openapi.toJSON")
          case Schema.is.anyOf(node): return Invariant.NotYetSupported("anyOf", "openapi.toJSON")
          case Schema.is.oneOf(node): return Invariant.NotYetSupported("oneOf", "openapi.toJSON")
          case Schema.is.ref(node): return Invariant.NotYetSupported("ref", "openapi.toJSON")
          default: return fn.exhaustive(node)
        }
      }
    )
}

export type fromJSON<T> 
  = T extends null ? { type: "null"; nullable: true; enum: [null] }
  : T extends boolean ? { type: "boolean"; const: T }
  : T extends bigint ? { type: "string"; format: "bigint"; const: `${T}` }
  : T extends number ? { type: "number"; const: T }
  : T extends string ? { type: "string"; const: T }
  : T extends readonly JSON[] ? fromJSON.array<T>
  : fromJSON.object<T>
  ;

/**
 * ## {@link fromJSON `oas.fromJSON`}
 *
 * @example
 *  import { oas } from "@hotelengine/shared-oas"
 *  import * as vi from "vitest"
 *
 *  // 🡻🡻 ✅
 *  vi.assert.equal(
 *    oas.fromJSON({ a: true, b: [1, null, { c: "" }]}),
 *    {
 *      type: "object",
 *      required: ["a", "b"],
 *      properties: {
 *        a: { type: "boolean", const: true },
 *        b: {
 *          type: "array",
 *          items: false,
 *          minItems: 3,
 *          maxItems: 3,
 *          prefixItems: [
 *            { type: "number", const: 1 },
 *            { type: "null", nullable: true, enum: [null] },
 *            {
 *              type: "object",
 *              required: ["c"],
 *              properties: { c: { type: "string", const: "" } },
 *            },
 *          ],
 *        },
 *      },
 *    }
 *  )
 */
export function fromJSON<const T>(json: T): fromJSON<Mutable<T>>
export function fromJSON(json: JSON.any): {} {
  return fromJSON.loop(json)
}

export declare namespace fromJSON {
  export interface Loop { (_: JSON.any): Keep<Schema.datatype, "type"> }
  export interface Context { path: [...keys.any] }
  export type array<T extends readonly JSON[]> = never | {
    type: "array"
    items: false
    minItems: T["length"]
    maxItems: T["length"]
    prefixItems
      : number extends T["length"] ? fromJSON<T[number]>
      : { -readonly [ix in keyof T]: fromJSON<T[ix]> }
  }

  export { object_ as object }
  export type object_<T> = never | {
    type: "object"
    required: (keyof T)[]
    properties : { -readonly [K in keyof T]: fromJSON<T[K]> }
  }
}

export namespace fromJSON {
  export const fromNull = () =>
    ({
      type: "null",
      nullable: true,
      enum: [null],
    }) satisfies Schema.NullNode

  export const fromBigint = (node: bigint) =>
    ({
      type: "string",
      format: "bigint",
      const: `${node}`,
    }) satisfies Schema.StringNode & { const: string }

  export function typeOf<T extends JSON>(value: T): typeOf<T>
  export function typeOf<T extends JSON>(value: T): string { return typeof value }
  export type typeOf<T> 
    = T extends null ? "null"
    : T extends boolean ? "boolean"
    : T extends number ? "number"
    : T extends bigint ? "bigint"
    : T extends string ? "string"
    : T extends readonly unknown[] ? "array" 
    : T extends (...args: any) => unknown ? "function"
    : "object" 
    ;
  export function fromScalar(node: boolean): Schema.BooleanNode
  export function fromScalar(node: number): Schema.NumberNode
  export function fromScalar(node: string): Schema.StringNode
  export function fromScalar(
    node: boolean | number | string,
  ): Schema.BooleanNode | Schema.NumberNode | Schema.StringNode
  /// impl.
  export function fromScalar(node: boolean | number | string): {} {
    return {
      type: typeOf(node),
      const: node,
    } satisfies { 
      type: Schema.Scalar["type"]
      const: Schema.Scalar["const"]
    }
  }

  const tupleBase = { 
    type: "array", 
    items: false,
  } as const

  export const fromArray 
    : (loop: fromJSON.Loop) => (node: readonly JSON[]) => Schema.TupleNode<readonly Schema.any[]>
    = (loop) => fn.flow(
      pair.duplicate,
      pair.mapBoth(
        fn.flow(
          Option.guard(is.nonempty.array),
          Option.map(fn.flow(map(loop), x => x as never)),
          Option.getOrElse(() => [] as readonly Schema.any[]),
          object.bind("prefixItems"),
        ),
        node => ({ 
          ...tupleBase,
          minItems: node.length, 
          maxItems: node.length,
        })
      ),
      fn.tupled(object.intersect),
    )

  const objectBase = {
    type: "object"
  } as const

  export const fromObject = (loop: fromJSON.Loop) => (node: JSON.object) => {
    const keys = globalThis.Object.keys(node)
    if (keys.length === 0) return { ...objectBase, properties: {} }
    else {
      return fn.pipe(
        map(node, loop),
        object.bind("properties"),
        (shape) => ({ ...shape, required: object.keys(shape.properties) }),
        object.intersect.defer(objectBase),
      )
    }
  }

  export const loop = fn.loop<JSON.any, Keep<Schema.datatype, "type">>((node, loop) => {
    switch (true) {
      case number.isNonFinite(node):
      case is.null(node): return fromJSON.fromNull()
      case is.bigint(node): return fromJSON.fromBigint(node)
      case is.number(node): return fromJSON.fromScalar(node)
      case is.string(node): return fromJSON.fromScalar(node)
      case is.boolean(node): return fromJSON.fromScalar(node)
      case is.array.any(node): return fromJSON.fromArray(loop)(node)
      case is.object.any(node): return fromJSON.fromObject(loop)(node)
      // TODO: handle `{} | undefined` and return `fn.exhaustive(node)`
      default: return fn.throw(node) 
    }
  })
}
