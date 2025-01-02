import type { key } from "@traversable/data"
import { object as O } from "@traversable/data"
import type { AllOf, AnyOf, Guard, inline, newtype } from "@traversable/registry"
import { symbol as Sym } from "@traversable/registry"
import * as q from "./_internal.js"

export { 
  object$, 
  optional$,
  or$,
  and$,
  anyOf$,
  allOf$,
  array$,
  record$,
  nullable$,
  tuple$,
}

/** @internal */
const hasOwnProperty = globalThis.Object.prototype.hasOwnProperty
/** @internal */
function hasOwn<K extends key.any>(u: unknown, key: K): u is { [P in K]: unknown }
function hasOwn(u: unknown, key: key.any): u is { [x: string]: unknown } {
  return typeof key === "symbol" 
    ? O.isComposite(u) && key in u 
    : hasOwnProperty.call(u, key)
}

declare namespace schema {
  type infer<T> = T extends (u: any) => u is infer S ? S : never
  interface Options {
    exactOptionalPropertyTypes?: boolean
  }
}

namespace schema {
  export const defaults = {
    exactOptionalPropertyTypes: false,
  } satisfies globalThis.Required<schema.Options>
  export function isOptional<T>
    (u: unknown): u is optional$<T> { return !!(u as { [x: symbol]: unknown })[Sym.optional] }
  export function isRequired<T>
    (u: unknown): u is (_: unknown) => _ is T { return !schema.isOptional(u) }
  export function isOptionalNotUndefined<T>
    (u: unknown): u is optional$<T> { 
      return schema.isOptional(u) && u(undefined) === false
    }

  export function validateShape<T extends { [x: number]: (u: any) => boolean }>
    (shape: T, u: { [x: number]: unknown }): boolean
  export function validateShape<T extends { [x: string]: (u: any) => boolean }>
    (shape: T, u: { [x: string]: unknown }): boolean
  export function validateShape<T extends { [x: number]: (u: any) => boolean }>
    (shape: T, u: object): boolean
  export function validateShape<T extends { [x: string]: (u: any) => boolean }> 
    (shape: T, u: {} | { [x: string]: unknown }) {
      for (const k in shape) {
        const check = shape[k]
        switch (true) {
          case schema.isOptional(shape[k]) && !hasOwn(u, k): continue
          case schema.isOptional(shape[k]) && hasOwn(u, k) && u[k] === undefined: continue
          case schema.isOptional(shape[k]) && hasOwn(u, k) && check(u[k]): continue
          case schema.isOptional(shape[k]) && hasOwn(u, k) && !check(u[k]): return false
          case schema.isRequired(shape[k]) && !hasOwn(u, k): return false
          case schema.isRequired(shape[k]) && hasOwn(u, k) && check(u[k]) === true: continue
          case hasOwn(u, k) && check(u[k]) === true: continue
          default: throw globalThis.Error("in 'validateShape': illegal state")
          // TODO: remove this check and `continue` in default (for the semantics, not behavior) 
          // after you've verified that you haven't missed any cases
          // case hasOwn(u, k) && check(u[k]): continue
          // default: continue
        }
      }
      return true
    }

  export function validateShapeEOPT<T extends { [x: string]: (u: any) => boolean }>
    (shape: T, u: Record<string, unknown>): boolean
  export function validateShapeEOPT<T extends { [x: number]: (u: any) => boolean }>
    (shape: T, u: Record<string, unknown>): boolean
  export function validateShapeEOPT<T extends { [x: string]: (u: any) => boolean }>
    (shape: T, u: Record<string, unknown>) {
      for (const k in shape) {
        const check = shape[k]
        switch (true) {
          case schema.isOptionalNotUndefined(check) && hasOwn(u, k) && u[k] === undefined: return false
          case schema.isOptional(check) && !hasOwn(u, k): continue
          case !check(u[k]): return false
          default: continue
        }
      }
      return true
    }
}


/////////////////////////
///    combinators    ///
const or$ = <S, T>(f: (u: unknown) => u is S, g: (u: unknown) => u is T) => (u: unknown): u is S | T => f(u) || g(u)
const and$ = <S, T>(f: (u: unknown) => u is S, g: (u: unknown) => u is T) => (u: unknown): u is S & T => f(u) && g(u)
const anyOf$ = <S extends readonly Guard[], T = AnyOf<S>>(...guards: [...S]) => (u: unknown): u is T => guards.some((f) => f(u))
const allOf$ = <S extends readonly Guard[], T = AllOf<S>>(...guards: [...S]) => (u: unknown): u is T => guards.every((f) => f(u))
const array$ = <T>(guard: (u: unknown) => u is T) => (u: unknown): u is readonly T[] => q.array(u) && u.every(guard)
const record$ = <T>(guard: (u: unknown) => u is T) => (u: unknown): u is Record<string, T> => q.object(u) && Object.values(u).every(guard)
const nullable$ = <T>(guard: (u: unknown) => u is T) => or$(guard, q.null_)
const tuple$ = <T extends readonly unknown[]>(...guard: { [K in keyof T]: Guard<T[K]> }) => (u: unknown): u is T => { return true }
// export const optional$ = <T>(guard: (u: unknown) => u is T) => or$(guard, undefined_)
///    combinators    ///
/////////////////////////

interface optional$
  <T> extends inline<(u: unknown) => u is T>
  { [Sym.optional]?: true }
/**
 * ## {@link optional$ `optional$`}
 */
function optional$<T>(guard: (u: unknown) => u is T): optional$<T> 
function optional$<T>(predicate: (u: T) => boolean): optional$<T> 
function optional$(predicate: (u: unknown) => boolean) {
  function optional(src: unknown): src is never 
    { return predicate(src) }
  return globalThis.Object.assign(
    optional, 
    optional$.proto
  ) 
}
optional$.proto = { [Sym.optional]: true } as const

interface object$<T extends {}> extends newtype<T> {}
declare namespace object$ { 
  export interface Options extends schema.Options {}
}

const isObject
  : (u: unknown) => u is { [x: string]: unknown } 
  = (u): u is never => !!u && typeof u === "object"

/**
 * ## {@link object$ `object$`} 
 */
function object$<
  const T extends { [x: string]: (u: any) => u is unknown }, 
  S extends O.from<T> = O.from<T>
> (shape: T, options?: object$.Options): (u: unknown) => u is S

function object$<T extends { [x: string]: (u: any) => boolean }>(
  shape: T, _: object$.Options = object$.defaults,
) {
  return (u: unknown): u is never => {
    switch (true) {
      case u === null: return false
      case !isObject(u): return false
      case _.exactOptionalPropertyTypes: return schema.validateShapeEOPT(shape, u)
      case !_.exactOptionalPropertyTypes: return schema.validateShape(shape, u)
      default: throw globalThis.Error("in 'object.of': illegal state")
    }
  }
}

declare namespace object$ {
  type Target<T> = T extends (u: any) => u is infer U ? U : never
  type Pick<T, K extends keyof T> = never | { [P in K]: Target<T[P]> }
  type Part<T, K extends keyof T> = never | { [P in K]+?: Target<T[P]> }
  type OptionalKeys<T, K extends keyof T = keyof T> 
    = K extends K 
    ? T[K] extends { [Sym.optional]?: true } ? K
    : never : never
  type Optional<T, K extends OptionalKeys<T> = OptionalKeys<T>> = never | Part<T, K>
  type Required<T> = never | Pick<T, Exclude<keyof T, OptionalKeys<T>>>
  type Forget<T> = never | { -readonly [K in keyof T]: T[K] }
  type from<T, K extends keyof T = OptionalKeys<T>> = never | Forget<
    & Pick<T, Exclude<keyof T, K>>
    & Part<T, K>
  >
}

namespace object$ { 
  export const defaults = {
    ...schema.defaults,
  } satisfies globalThis.Required<object$.Options>
}
