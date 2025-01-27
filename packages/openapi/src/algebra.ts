import { core } from "@traversable/core";
import { fn, map } from "@traversable/data"

export { Functor_ as Functor }

const Array_isArray 
  : <T>(u: unknown) => u is readonly T[]
  = globalThis.Array.isArray

// TODO: 
// - implement a proper `Functor` instance
// - rename this to `F` or maybe `fAlgebra`
interface Functor_<T extends Target = Target> {}
type F<T> =
  | { type: "null" }
  | { type: "boolean" }
  | { type: "number" }
  | { type: "integer" }
  | { type: "string" }
  | { type: "array", items: T }
  | { type: "array", items: readonly T[] }
  | { type: "object", properties: { [x: string]: T }, additionalProperties?: T, required?: string[] }
  | { const: unknown }
  | { enum: readonly unknown[] }
  | { oneOf: readonly T[] }
  | { anyOf: readonly T[] }
  | { allOf: readonly T[] }
  ;

export type Target =
  | { type: "null" }
  | { type: "boolean" }
  | { type: "integer" }
  | { type: "number" }
  | { type: "string" }
  // | { type: "array", items: Target }
  | { type: "array", items: Target | readonly Target[] }
  | { type: "object", properties: { [x: string]: Target }, additionalProperties?: Target, required?: string[] }
  | { const: unknown }
  | { enum: readonly unknown[] }
  | { oneOf: readonly Target[] }
  | { anyOf: readonly Target[] }
  | { allOf: readonly Target[] }
  ;

function fmap<S, T>(f: (s: S) => T): (x: F<S>) => F<T> 
function fmap<S, T>(f: (s: S) => T) {
  return (x: F<S>): unknown => {
    if (core.is.primitive(x)) return x

    switch (true) {
      default: return x // fn.exhaustive(x)
      case "enum" in x: return x
      case "const" in x: return x
      case "allOf" in x: return { allOf: x.allOf.map(f) }
      case "anyOf" in x: return { anyOf: x.anyOf.map(f) }
      case "oneOf" in x: return { oneOf: x.oneOf.map(f) }
      case "type" in x && x.type === "null":
      case "type" in x && x.type === "boolean":
      case "type" in x && x.type === "number":
      case "type" in x && x.type === "integer":
      case "type" in x && x.type === "string": return x
      case "type" in x && x.type === "array": return { 
        ...x, 
        type: "array", 
        items: Array_isArray(x.items) ? map(x.items, f) : f(x.items),
      }
      case "type" in x && x.type === "object": return { 
        ...x, 
        type: "object", 
        ...x.required && { required: x.required },
        ...x.properties && { properties: map(x.properties, f) },
        ...x.additionalProperties && { additionalProperties: f(x.additionalProperties) },
      }
    }
  }
}

const Functor_: Functor_ = {
  map: fmap as never 
}

export const cata = fn.cata(Functor_ as never)
export const ana = fn.ana(Functor_ as never)
export const hylo = fn.hylo(Functor_ as never)

export const thinAlgebra = (x: F<Target>): Target => {
  if (core.is.primitive(x)) return x

  switch (true) {
    default: return x // fn.exhaustive(x)
    case "const" in x: return { const: x.const }
    case "enum" in x: return { enum: x.enum }
    case "allOf" in x: return { allOf: x.allOf }
    case "anyOf" in x: return { anyOf: x.anyOf }
    case "oneOf" in x: return { oneOf: x.oneOf }
    case "type" in x && x.type === "null": return { type: x.type }
    case "type" in x && x.type === "boolean": return { type: x.type }
    case "type" in x && x.type === "integer": return { type: x.type }
    case "type" in x && x.type === "number": return { type: x.type }
    case "type" in x && x.type === "string": return { type: x.type }
    case "type" in x && x.type === "array": return { type: x.type, items: x.items }
    case "type" in x && x.type === "object": return {
      type: x.type,
      ...x.required && { required: x.required },
      ...x.properties && { properties: x.properties },
      ...x.additionalProperties && { additionalProperties: x.additionalProperties },
    }
  }
}

export const forget 
  : (x: unknown) => Target
  = cata(thinAlgebra as never)
