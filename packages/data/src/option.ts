import type { any } from "any-ts"
import type { Concattable, Foldable, None, Option, Predicate, Some } from "./exports.js"
import { URI } from "./_internal/_uri.js"

export type { Option, None, Some } from "./exports.js"

export { 
  type Option_infer as infer,
  Option_any as any,
  Option_try as try,
}

export type Option_any = Option<unknown>
export type Option_infer<option extends Option_any> = [option] extends [Option<infer type>] ? type : never

export const none 
  : () => None
  = () => ({ _tag: URI.None })

export const isNone
  : <T>(option: Option<T>) => option is None
  = (option): option is never => option && option._tag === URI.None

export const isSome
  : <T>(option: Option<T>) => option is Some<T>
  = (option): option is never => option && option._tag === URI.Some

export const is
  : (u: unknown) => u is Option<unknown>
  = (u): u is never => (typeof u === "object" && u !== null && "_tag" in u) ? u._tag === some(void 0)._tag || u._tag === none()._tag : false

export const some 
  : <const T>(value: T) => Some<T>
  = <const T>(value: T) => ({ _tag: URI.Some, value })

function Option_try<T, U>(throwable: (t: T) => U): (option: Option<T>) => Option<U> {
  return (option: Option<T>) => {
    if (isSome(option)) {
      try {
        return some(throwable(option.value))
      } catch(_) { return none() }
    }
    else return option
  }
}

export function getOrThrow<T>(option: Option<T>): T { 
  if (isNone(option)) {
    throw new globalThis.Error("Expected `option` to be a `Some`, got a `None` instead")
  }
  else return option.value
}

/**
 * ## {@link guard `Option.guard`}
 * 
 * Given a predicate (a function that takes any value and returns true or false), 
 * {@link guard `Option.guard`} returns a "smart constructor" that will apply 
 * the predicate to its argument, and return either an {@link some `Option.some`} 
 * or an {@link none `Option.none`}.
 * 
 * If the predicate is a type guard, {@link guard `Option.guard`} narrows as it
 * constructs.
 * 
 * **Note:** _Like_ `ts-reset`, passing {@link globalThis.Boolean `globalThis.Boolean`} 
 * for the predicate will exclude `null | undefined` from the final type.
 * 
 * **Note:** _Unlike_ `ts-reset`, passing {@link globalThis.Boolean `globalThis.Boolean`}
 * has a runtime component, and has "nullish coalesce" semantics.
 * 
 * In other words, {@link guard `Option.guard(Boolean)`} means
 * 
 * ```typescript
 * (x) => x != null` 
 * ```
 * 
 * not
 * 
 * ```typescript
 * (x) => !!x
 * ```
 * 
 * @example
 *  import { Option, fn } from "@traversable/data"
 *  import * as vi from "vitest"
 * 
 *  vi.assert.equal(fn.pipe(null, Option.guard(Boolean)), Option.none())
 *  vi.assert.equal(fn.pipe(undefined, Option.guard(Boolean)), Option.none())
 * 
 *  vi.assert.equal(fn.pipe(0, Option.guard(Boolean)), Option.some(0))
 *  vi.assert.equal(fn.pipe(1, Option.guard(Boolean)), Option.some(1))
 * 
 *  // Option.guard(Boolean) means `(x) => x != null`, not `(x) => Boolean(x)`
 *  vi.assert.equal(fn.pipe(0, Option.guard(Boolean)), Option.some(0))
 *  vi.assert.equal(fn.pipe("", Option.guard(Boolean)), Option.some(""))
 */
export function guard(guardNullable: globalThis.BooleanConstructor): <const T>(value: T) => Option<T & {}>
export function guard<A, B extends A>(guard: any.typeguard<A, B>): (value: A) => Option<B>
export function guard<T>(pred: Predicate<T>): (value: T) => Option<T>
export function guard<T>(pred: Predicate<T>) {
  return (value: T) => 
    globalThis.Object.is(value, globalThis.Boolean) 
    ? value != null ? some(value) : none()
    : pred(value) ? some(value) : none()
}

export const fromNullable = guard(globalThis.Boolean)

export const chainNullable = flatMap(guard(globalThis.Boolean))

export type prop<T, K extends keyof T> = T extends any.maybeIndexedBy<K> ? ({} & T[K]) : never
type DistributedKeyOf<T> = T extends T ? keyof T : never

export function prop<T extends {}, K extends DistributedKeyOf<T>>(prop: K): (option: Option<T>) => Option<prop<T, K>>
export function prop<T extends {}, K extends keyof T>(prop: K): (option: Option<T>) => Option<T[K] & {}> {
  return (option: Option<T>): Option<T[K] & {}> => isSome(option) ? fromNullable(option.value[prop]) : none()
}

export const fromPredicate
  : <T>(predicate: (value: T) => boolean) => (value: T) => Option<T>
  = (predicate) => (value) => predicate(value) ? some(value) : none()

export type struct<type> = never | { [ix in keyof type]: [type[ix]] extends [Option<infer out>] ? out : never }

export function struct<const T extends Structure<Option_any>>(options: T): Option<struct<T>>
export function struct<const T extends Structure<Option_any>>(options: T) {
  let out: Structure.any = (globalThis.Array.isArray(options) ? [] : {}) as never
  for(const [ix, option] of globalThis.Object.entries(options)) {
    if(isSome(option)) 
      out[ix] = option.value
    else return none()
  }
  return some(out)
}

type Structure<type> = Structure.List<type> | Structure.Dict<type>
declare namespace Structure {
  export { Structure_any as any }
  export interface Structure_any { [x: string | number]: unknown }
  export interface List<T> { [x: number]: T }
  export interface Dict<T> { [x: string]: T }
}


export type all<type extends Structure<Option_any>> = never | { [ix in keyof type]: [type[ix]] extends [Option<infer out>] ? out : never }

export function all<const T extends Structure<Option_any>>(options: T): Option<all<T>>
export function all<const T extends Structure<Option_any>>(options: T) {
  let out: Structure.any = (globalThis.Array.isArray(options) ? [] : {}) as never
  for(const [ix, option] of globalThis.Object.entries(options)) {
    if(isSome(option)) 
      out[ix] = option.value
    else return none()
  }
  return some(out)
}

const isNonEmptyArray
  : <T>(xs: any.array<T>) => xs is [T, ...T[]]
  = (xs): xs is never => xs.length > 0

type widen<T> = [T] extends [{ valueOf(): infer W }] ? W : T

export function Option_any<T>(...options: any.array<Option<T>>): Option<[widen<T>, ...widen<T>[]]>
export function Option_any<T>(...options: any.array<Option<T>>) {
  let out: Option_infer<typeof options[number]>[] = []
  for(const option of globalThis.Object.values(options))
    if(isSome(option)) out.push(option.value)
  
  return isNonEmptyArray(out) ? some(out) : none()
}

export function wither<const T extends { [K in string]+?: Option_any }>
  (options: T): Option<{ [K in keyof T]-?: Option_infer<T[K] & {}> }>
export function wither<const T extends { [K in string]+?: Option_any }>(options: T) {
  let out: { [x: string]: unknown } = {}
  let size = 0
  for(const [key, option] of globalThis.Object.entries(options)) {
    if(option !== undefined && isSome(option))
      out[key] = option.value
      size = size + 1
  }
  return size > 0 ? some(out) : none()
}

export function partial<const T extends { [K in string]+?: Option_any }>
  (options: T): Option<{ [K in keyof T]-?: Option<Option_infer<T[K] & {}>> }>
/// impl.
export function partial<const T extends { [P in K]+?: Option_any }, K extends any.key>(options: T) {
  let out: { [x: string]: unknown } = {} as never
  let hasSomething = false
  for(const [key, option] of globalThis.Object.entries(options)) {
    if (option != null && isSome(option as never)) 
      void (out[key] = option, hasSomething = true)
    else 
      void (out[key] = none())
  }
  return hasSomething ? some(out) : none()
}

export const getFoldable 
  : <T>(C: Concattable<T>) => Foldable<Option<T>>
  = ({ concat }) => ({
    empty: none(),
    concat(x, y) { 
      return isNone(x) ? y : isNone(y) ? x : some(concat(x.value, y.value)) 
    },
  })

export const foldMap
  : <O>(Foldable: Foldable<O>) => <I>(fn: (x: I) => O) => (option: Option<I>) => O
  = (Foldable) => (fn) => (option) => isNone(option) ? Foldable.empty : fn(option.value)

export function filter(toBoolean: globalThis.BooleanConstructor): <const T>(option: Option<T>) => Option<T & {}> 
export function filter<S, T>(guard: (src: S) => T): (option: Option<S>) => Option<[unknown] extends [T] ? S : T> 
export function filter<S>(pred: Predicate<S>): <T>(option: Option<T>) => Option<[unknown] extends [T] ? S : T>
export function filter(pred: Predicate) {
  return (option: Option<unknown>) => isSome(option) ? guard(pred)(option.value) : none()
}

export function map<A, B>(option: Option<A>, fn: (a: A) => B): Option<B>
export function map<A, B>(fn: (a: A) => B): (option: Option<A>) => Option<B>
export function map<A, B>(
  ...args: 
    | [fn: (a: A) => B]
    | [option: Option<A>, fn: (a: A) => B]
  ) {
  if (args.length === 1) 
    return (option: Option<A>) => map(option, args[0])
  else {
    const [option, fn] = args
    return isSome(option) ? some(fn(option.value)) : none()
  }
}

/** 
 * Optionally apply a wrapped function to a wrapped value:
 * 
 * - if the wrapped function is a `None`, the function will not be applied;
 * - if the wrapped value is a `None`, the function will not be applied;
 * 
 * This is one of the core operations of the lambda calculus. Its
 * behavior is imitated by the "optional call" syntax in JS. The major 
 * difference between them is that the native JS syntax is "chainable", 
 * but not _composable_.
 * 
 * @example
 *  const myConsole
 *    : { log?: (...args: unknown[]) => void }
 *    = { ...(Math.random() > 0.5 ? { log: globalThis.console.log } : {}) }
 * 
 *  //       ↓↓
 *  myConsole?.(123)
 */
export const apply
  : <A>(option: Option<A>) => <B>(wrappedFn: Option<(a: A) => B>) => Option<B> 
  = (option) => (wrappedFn) => isNone(wrappedFn) ? none() : isNone(option) ? none() : some(wrappedFn.value(option.value))

export const flap
  : <A, B>(wrappedFn: Option<(a: A) => B>) => (a: A) => A | B 
  = (wrappedFn) => (a) => isNone(wrappedFn) ? a : wrappedFn.value(a)

export function flatMap<A, B>(fn: (a: A) => Option<B>): (option: Option<A>) => Option<B> {
  return (option) => isSome(option) ? fn(option.value) : none()
}

export function join<T>(nested: Option<Option<T>>): Option<T> { 
  return isSome(nested) ? nested.value : nested
}

export function match<T, A, Z>
  (matchers: { onSome: (value: T) => A, onNone: () => Z }): (option: Option<T>) => A | Z
export function match<T, A, Z>
  (matchers: { onSome: (value: T) => A, onNone: () => Z }) 
  {
    return (option: Option<T>) => isSome(option) 
    ? matchers.onSome(option.value) 
    : matchers.onNone()
  }

export const toBoolean
  : <T>(option: Option<T>) => boolean
  = match({ onSome: () => true, onNone: () => false })

export const fromBoolean
  : (boolean: boolean) => Option<true>
  = (boolean) => boolean ? some(true) : none()

export const getOrElse
  : <U>(orElse: () => U) => <T>(option: Option<T>) => T | U
  = (orElse) => match({ onSome: (value) => value, onNone: orElse })

export const toUndefined
  : <T>(option: Option<T>) => T | undefined
  = getOrElse(() => undefined)

export const toNull
  : <T>(option: Option<T>) => T | null
  = getOrElse(() => null)

export const alt
  : <T>(getFallback: () => Option<T>) => <U>(option: Option<U>) => Option<T | U> 
  = (getFallback) => (option) => isNone(option) ? getFallback() : option

export function oneOf<S, T extends S, U extends S>
  (guard: (src: S) => T, otherwise: (src: S) => U):
    (value: S) => Option<T | U>
/// impl.
export function oneOf<S, T extends S, U extends S>
  (guard: (src: S) => T, otherwise: (src: S) => U) {
    return (value: S) => guard(value) 
      ? some(value) 
      : otherwise(value) ? some(value) : none()
  }

