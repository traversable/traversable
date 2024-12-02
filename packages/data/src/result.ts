// import type { any, mut } from "any-ts"
import { Invariant, URI } from "@traversable/registry"

import type { Result, Err, Ok } from "./exports.js"
import type { jsdoc } from "./_internal/_unicode.js"
import type { prop } from "./_internal/_prop.js"
import type { key } from "./_internal/_key.js"
import { exhaustive, identity } from "./_internal/_function.js"

/** @internal */
const Object_keys = globalThis.Object.keys
/** @internal */
const Object_values = globalThis.Object.values
/** @internal */
const JSON_stringify = globalThis.JSON.stringify
/** @internal */
const isArray
  : (u: unknown) => u is { [x: number]: Result, length: number }
  = globalThis.Array.isArray
/** @internal */
const isObject 
  : (u: unknown) => u is globalThis.Record<string, Result>
  = (u): u is never => u !== null && typeof u === "object" && !isArray(u)
/** @internal */
const logError = (e: unknown) => `Result log error: ${globalThis.console.error(e)}`
/** @internal */
const logErrors
  : (errs: object) => void
  = (errs) => globalThis.Array.isArray(errs) 
    ? errs.forEach(logError) 
    : Object_values(errs).forEach(logError)

export type { Any as any }
type Any = Result<any, any>

export type { Infer as infer }
declare namespace Infer { export type { object_ as object } }
declare namespace Infer {
  type ok<T> = T extends Ok<infer U> ? U : never
  type err<T> = T extends Err<infer U> ? U : never
  type fromPair<T extends readonly [unknown, unknown]> = never | 
    Result<T[0], T[1]>
  type array<T extends readonly unknown[]> = never | 
    [ok: { -readonly [I in keyof T]: Infer.ok<T[I]> }, err: Infer.err<T[number]>]
  type object_<T> = never |
    [ok: { -readonly [K in keyof T]: Infer.ok<T[K]> }, err: Infer.err<T[keyof T]>]
  type all<T extends { [x: number]: Result<any, any> }> = never | 
    Result<{ [K in keyof T]: Infer.ok<T[K]> }, Infer.err<T[keyof T]>>
}

/** 
 * ## {@link ok `Result.ok`}
 */
export function ok<T, E = never>(ok: T): Result<T, E> 
  { return { _tag: URI.Ok, ok } }

/** 
 * ## {@link ok `Result.ok`}
 */
export function err<E, T = never>(err: E): Result<T, E> 
  { return { _tag: URI.Err, err } }

/** 
 * ## {@link ok `Result.ok`}
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> 
  { return result._tag === URI.Ok }

/** 
 * ## {@link ok `Result.ok`}
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> 
  { return result._tag === URI.Err }

/** 
 * ## {@link ok `Result.ok`}
 */
export function isResult<T, E>(u: unknown): u is Result<T, E> {
  return (
    typeof u === "object" &&
    u !== null &&
    `_tag` in u &&
    (u._tag === URI.Ok || u._tag === URI.Err)
  )
}

/** 
 * ## {@link ok `Result.ok`}
 */
export function match<S, T, E, F>
  (handlers: { onOk(ok: S): T, onErr(err: E): F }): 
    (result: Result<S, E>) 
    => T | F

export function match<S, T, E, F>
  (handlers: { onOk(ok: S): T, onErr(err: E): F }) {
  return (result: Result<S, E>): T | F => isOk(result) 
    ? handlers.onOk(result.ok) 
    : handlers.onErr(result.err)
}

/** 
 * ## {@link union `Result.union`}
 */
export const union
  : <T, E>(result: Result<T, E>) => T | E
  = match({ onErr: identity, onOk: identity })

/** 
 * ## {@link ok `Result.ok`}
 */
export function flatMap<S, T, E1, E2>(result: Result<S, E1>, fn: (src: S) => Result<T, E2>): Result<T, E1 | E2>
export function flatMap<S, T, E2>(fn: (src: S) => Result<T, E2>): <E1>(result: Result<S, E1>) => Result<T, E1 | E2>
/// impl.
export function flatMap<S, T, E1, E2>(
  ...args: 
    | [fn: (src: S) => Result<T, E2>] 
    | [result: Result<S, E1>, fn: (src: S) => Result<T, E2>]
) {
  return args.length === 1 
    ? (result: Result<S, E1>) => flatMap(result, ...args)
    : isErr(args[0]) ? err(args[0].err)
    : args[1](args[0].ok)
}

/** 
 * ## {@link map `Result.map`}
 * ### ｛ {@link jsdoc.mapping ` 🌈‍ `} , {@link jsdoc.preserves_structure ` 🌿‍ ` } ｝
 * 
 * Map a function over the {@link Ok `Ok`} branch of a {@link Result `Result`}.
 * 
 * Preserves structure. Structure-preserving  the {@link Ok `Ok`} branch
 * Structure-preserving 
 */
export function map<T, U, E>(result: Result<T, E>, fn: (_: T) => U): Result<U, E>
export function map<T, U, E>(fn: (_: T) => U): (result: Result<T, E>) => Result<U, E>
export function map<T, U, E>(
  ...args: 
    | [result: Result<T, E>, fn: (_: T) => U]
    | [fn: (_: T) => U] 
) {
  return args.length === 1
    ? (result: Result<T, E>) => map(result, ...args)
    : isErr(args[0])
      ? err(args[0].err)
      : ok(args[1](args[0].ok))
}

/** 
 * ## {@link mapErr `Result.mapErr`}
 */
export function mapErr<E1, E2, T>(result: Result<T, E1>, fn: (_: E1) => E2): Result<T, E2>
export function mapErr<E1, E2, T>(fn: (_: E1) => E2): (result: Result<T, E1>) => Result<T, E2>
export function mapErr<E1, E2, T>(
  ...args: 
    | [result: Result<T, E1>, fn: (_: E1) => E2]
    | [fn: (_: E1) => E2] 
) {
  return args.length === 1
    ? (result: Result<T, E1>) => mapErr(result, ...args)
    : isErr(args[0])
      ? err(args[1](args[0].err))
      : ok(args[0].ok)
}

/** 
 * ## {@link bind `Result.bind`}
 */
export function bind<S, T, K extends key.nonKeyOf<S, K>, E2>
  (name: K, fn: (src: S) => Result<T, E2>): 
    <E1>(result: Result<S, E1>) 
    => Result<S & { [P in K]: T }, E2 | E1>

export function bind<S, T, K extends key.nonKeyOf<S, K>, E2>
  (name: K, fn: (src: S) => Result<T, E2>) {
    return <E1>(result: Result<S, E1>) => flatMap(
      result, 
      (src) => map(
        fn(src), 
        (ok) => ({ ...src, [name]: ok })
      )
    )
  }

/** 
 * ## {@link assign `Result.assign`}
 */
export function assign<S, T, K extends key.nonKeyOf<S, K>>
  (name: K, fn: (src: S) => T): 
    <Err>(result: Result<S, Err>) 
    => Result<S & { [P in K]: T }, Err>

export function assign<K extends key.nonKeyOf<S, K>, S, T>
  (name: K, fn: (src: S) => T) {
    return <Err>(result: Result<S, Err>) => map(
      result, 
      (prev) => ({ ...prev, [name]: fn(prev) })
    )
  }


export { try_ as try }
/** 
 * ## {@link try_ `Result.try`}
 */
function try_<T, E>(options: { try(): T, catch(error: unknown): E }): Result<T, E>
function try_<T, E>(options: { try(): T; catch(error: unknown): E }) {
  try { return ok(options.try()) } 
  catch (e) { return err(options.catch(e)) }
}

/** 
 * ## {@link all `Result.all`}
 */
export function all<const T extends { [x: number]: Result }>(results: T): Infer.all<T>
export function all<const T extends { [x: string]: Result }>(results: T): Infer.all<T>
export function all(results: { [x: number | string]: Result }): Result<unknown, unknown> {
  if (isArray(results)) {
    let out: unknown[] = [],
        result: Result
    for (let ix = 0; ix < results.length; ix++) {
      result = results[ix]
      if (isErr(result)) return result
      else void (out.push(result.ok))
    }
    return ok(out)
  } else {
    let out: { [x: string]: unknown } = {},
        result: Result
    for (const key of Object_keys(results)) {
      result = results[key]
      if (isErr(result)) return result
      else if (isOk(result)) void (out[key] = result.ok)
      else return exhaustive(result)
    }
    return ok(out)
  }
}

/** 
 * ## {@link compact `Result.compact`}
 */
export function compact<const T extends { [x: number]: Result }>(results: T): Infer.all<T>
export function compact<const T extends { [x: string]: Result }>(results: T): Infer.all<T>
export function compact<const T extends { [x: number]: Result }>(results: T, forEachError?: (errs: object) => void): Infer.all<T>
export function compact<const T extends { [x: string]: Result }>(results: T, forEachError?: (errs: object) => void): Infer.all<T>
/// impl.
export function compact(
  results: { [x: number | string]: Result }, 
  forEachError: (errs: object) => void = logErrors
): Result<unknown, unknown> {
  switch (true) {
    case isArray(results): {
      let out = [], 
          errs = [], 
          result: Result
      for (let ix = 0; ix < results.length; ix++) {
        void (result = results[ix])
        if(isErr(result)) void errs.push(result)
        else if (isOk(result)) void out.push(result.ok)
        else exhaustive(result)
      }
      void forEachError(errs)
      return ok(out)
    }
    case isObject(results): {
      let out: { [x: string]: unknown } = {}, 
          errs: { [x: string]: unknown } = {}, 
          result: Result
      for (const k of globalThis.Object.keys(results)) {
        void (result = results[k])
        if(isErr(result)) void (errs[k] = result.err)
        else if (isOk(result)) void (out[k] = result.ok)
        else return exhaustive(result)
      }
      void forEachError(errs)
      return ok(out)
    }
    default: return exhaustive(results)
  }
}

/** 
 * ## {@link toError `Result.toError`}
 */
export const toError 
  : (error: unknown, msg?: string) => globalThis.Error
  = (e, msg = "") => e instanceof globalThis.Error ? e 
    : new globalThis.Error(msg.concat(JSON_stringify(e, null, 2)))

/** 
 * ## {@link fromPredicate `Result.fromPredicate`}
 */
export function fromPredicate<T>(predicate: (t: T) => boolean): (t: T) => Result<T, globalThis.Error>
export function fromPredicate<T, E>(predicate: (t: T) => boolean, onFalse: (t: T) => E): (t: T) => Result<T, E>
/// impl.
export function fromPredicate<T, E>(predicate: (t: T) => boolean, onFalse?: (t: T) => E) {
  return (t: T) => predicate(t) ? ok(t) : err(
    onFalse?.(t) ?? 
    toError(t, Invariant.PredicateFailed("@traversable/data/Result.fromPredicate"))
  )
}

/** 
 * ## {@link guard `Result.guard`}
 */
export function guard<S, T extends S>
  (guard: (src: S) => src is T): 
    (src: S) => Result<T, globalThis.Error>
export function guard<S, T extends S, E>
  (guard: (src: S) => src is T, onFalse: (src: S) => E): 
    (src: S) => Result<T, E>
export function guard<S, T extends S, E>
  (guard: (src: S) => src is T, onFalse: (src: S) => E = toError as never) 
  /// impl.
  { return (src: S) => (guard(src) ? ok(src) : err(onFalse(src))) }

/** 
 * ## {@link tap `Result.tap`}
 */
export function tap<T, E, _>(eff: (t: T) => Result<_, E>): 
  (result: Result<T, E>) => Result<T, E>
export function tap<T, E1, E2, _>(eff: (t: T) => Result<_, E2>): 
  (result: Result<T, E1>) => Result<T, E1 | E2>
/// impl.
export function tap<T, E, _>(eff: (t: T) => Result<_, E>) { 
  return (result: Result<T, E>) => { 
    const _ = isOk(result) ? eff(result.ok) : result
    return isOk(_) ? result : _
  }
}
