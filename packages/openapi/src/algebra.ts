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
  | { oneOf: readonly Target[] }
  | { anyOf: readonly Target[] }
  | { allOf: readonly Target[] }
  ;

function fmap<S, T>(f: (s: S) => T): (x: F<S>) => F<T> 
function fmap<S, T>(f: (s: S) => T) {
  return (x: F<S>): {} => {
    if (!("type" in x)) switch (true) {
      default:return fn.exhaustive(x)
      case "allOf" in x: return { allOf: x.allOf.map(f) }
      case "anyOf" in x: return { anyOf: x.anyOf.map(f) }
      case "oneOf" in x: return { oneOf: x.oneOf.map(f) }
    }
    else switch (true) {
      default: return fn.exhaustive(x)
      case x.type === "null":
      case x.type === "boolean":
      case x.type === "number":
      case x.type === "integer":
      case x.type === "string": return x
      case x.type === "array": return { 
        ...x, 
        type: "array", 
        items: Array_isArray(x.items) ? map(x.items, f) : f(x.items),
      }
      case x.type === "object": return { 
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

export const cata = fn.morphism.cata(Functor_ as never)
export const ana = fn.morphism.ana(Functor_ as never)
export const hylo = fn.morphism.hylo(Functor_ as never)

export const thinAlgebra = (x: F<Target>): Target => {
  if (!("type" in x)) switch (true) {
    default: return fn.exhaustive(x)
    case "allOf" in x: return { allOf: x.allOf }
    case "anyOf" in x: return { anyOf: x.anyOf }
    case "oneOf" in x: return { oneOf: x.oneOf }
  }
  else switch (true) {
    default: return fn.exhaustive(x)
    case x.type === "null": return { type: x.type }
    case x.type === "boolean": return { type: x.type }
    case x.type === "integer": return { type: x.type }
    case x.type === "number": return { type: x.type }
    case x.type === "string": return { type: x.type }
    case x.type === "array": return { type: x.type, items: x.items }
    case x.type === "object": return {
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
