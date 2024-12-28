import { type Either, type Functor, type HKT, Invariant, URI } from "@traversable/registry"

import type { any, mut } from "any-ts"
import type { array_shift } from "./_array.js"
export { fn }
export type {
  fn_any as any,
}

export {
  absorb,
  apply,
  applyN,
  call,
  exhaustive,
  distribute,
  distributes,
  flow,
  free,
  hasOwn,
  isFunction,
  isUnusedParam,
  identity,
  loop,
  loopN,
  pipe,
  softExhaustiveCheck,
  tuple,
  tupled,
  untupled,
  UnusedParam,
  upcast,
}

/** @internal */
type _ = unknown
/** @internal */
type arguments = readonly unknown[]
/** @internal */
type fn = globalThis.Function

type fn_any<T extends (...args: any) => unknown = (...args: any) => unknown> = T
type fn_some<I extends unknown[] = any[], O = unknown> = (...args: I) => O

type fn_params<T> = [T] extends [fn_some<infer I>] ? I : never
type fn_return<T> = [T] extends [fn_some<any, infer O>] ? O : never
type fn_arity<T extends fn_any, I extends fn_params<T> = fn_params<T>> = I["length"]

type fn_param<T> = [T] extends [(_: infer I) => unknown] ? I : never
type fn_param1<T> = [T] extends [(x: infer I, ...rest: any) => any] ? I : never
type fn_param2<T> = [T] extends [(x: any, y: infer I, ...rest: any) => any] ? I : never
type fn_param3<T> = [T] extends [(x: any, y: any, z: infer I, ...rest: any) => any] ? I : never

type fn_thunk<T extends constant = constant> = T 
type fn_zero<T extends nullary = nullary> = T
type fn_one<T extends unary = unary> = T
type fn_two<T extends binary = binary> = T
type fn_three<T extends ternary = ternary> = T

type fn_id<T> = T

declare namespace args {
  type zero<T extends [] = []> = T
  type one<T extends [x: unknown] = [x: any]> = T
  type two<T extends [x: unknown, y: unknown] = [x: any, y: any]> = T
  type three<T extends [x: unknown, y: unknown, z: unknown] = [x: any, y: any, z: any]> = T
  type nonfinite<T extends unknown[] = any[]> = T
}

interface constant<O = unknown> extends fn.id<() => O> {}
interface effect extends constant<void> {}
interface nullary<I extends args.zero = args.zero, O = unknown> extends fn.id<(...arg: I) => O> {}
interface unary<I extends args.one = args.one, O = unknown> extends fn.id<(...arg: I) => O> {}
interface binary<I extends args.two = args.two, O = unknown> extends fn.id<(...arg: I) => O> {}
interface ternary<I extends args.three = args.three, O = unknown> extends fn.id<(...arg: I) => O> {}
interface variadic<I extends args.nonfinite = args.nonfinite, O = unknown> extends fn.id<(...arg: I) => O> {}

namespace fn { export const never: never = void 0 as never }
declare namespace fn {
  export {
    fn_any as any,
    fn_some as some,
    fn_id as id,
    fn_params as params,
    fn_return as return,
    fn_arity as arity,
    fn_param as param,
    fn_param1 as param1,
    fn_param2 as param2,
    fn_param3 as param3,
    fn_zero as zero,
    fn_one as one,
    fn_two as two,
    fn_three as three,
    fn_thunk as thunk,
    effect,
    constant as const,
    nullary,
    binary,
    ternary,
    variadic,
  }
}
declare namespace fn {
  type signatureOf<T> = [T] extends [fn.some<infer I, infer O>] ? [args: I, out: O] : never
  /**
   * Given a function, {@link shift `fn.shift`} returns 
   * the function's first argument, and then rest of its arguments, 
   * as a tuple.
   * 
   * This operation is structure-preserving, meaning 
   * preserving argument names as tuple labels.
   *
   * @example
   *  import type { fn } from "@traversable/data"
   * 
   *  type MyFn = (x: number, y: string, z: boolean) => [x: typeof x, y: typeof y, z: typeof z]
   *  type Next = fn.shift<MyFn>
   *  //    ^? type Next = [head: number, tail: (y: string, z: boolean) => [x: number, y: string, z: boolean]]
   */
  type shift<
    T extends fn.any, 
    I extends fn.params<T> = fn.params<T>, 
    O extends fn.return<T> = fn.return<T>
  > = array_shift<I> extends [mut.one<infer Head>, mut.list<infer Tail>] ? [head: Head, tail: (...args: Tail) => O] : O
}

export type Trampoline<T> = T | Trampoline.loop<T>
export declare namespace Trampoline {
  interface loop<T> { (): Trampoline<T> }
}

/**
 * ### {@link trampoline `fn.trampoline`}
 *
 * A ["trampoline"](https://groups.google.com/g/clojure/c/YlfLxEVLy4U?pli=1)
 * is an optimization that can be applied to recursive operations, and is a reliable
 * strategy for avoiding stack overflows.
 *
 * The reason this works is because a trampoline treats the stack of successive calls
 * as a _pull-based_ stream. This "bubbles" the next loop, rather than "nesting" it.
 * This small tweak is enough to invert control, externalizing the loop, which
 * signals to the runtime that it can release the frame back into the pool.
 *
 * Besides making tail-calls significantly easier to optimize, trampolines can be used
 * as a primitive for creating / unwinding infinite data structures _lazily_
 * (on-demand). If you've ever written a breadth-first traversal of a tree, this should
 * be familiar territory: think BFS, with support mutually recursive calls.
 */
export function trampoline<T>(input: Trampoline<T>): T {
  let output = input
  while (isFunction(output)) void (output = output())
  return output
}

type UnusedParam = typeof UnusedParam
const UnusedParam = Symbol.for(`@traversable/data/fn::UnusedParam`)
const isUnusedParam = (u: unknown): u is UnusedParam => u === UnusedParam

const identity
  : <const T>(x: T) => T 
  = (x) => x

const upcast
  : <I extends O, O>(i: I) => O
  = identity

const absorb
  : <T>(x: T) => never 
  = (x) => x as never

const apply
  : <const I>(input: I) => <O>(f: (i: I) => O) => O 
  = (a) => (f) => f(a)

const applyN
  : <const T extends readonly unknown[]>(...args: T) => <O>(f: (...args: T) => O) => O 
  = (...a) => (f) => f(...a)

const call
  : <T>(fn: () => T) => T 
  = (fn) => fn()

/**
 * {@link loop `fn.loop`} puts a recursive function in tail-position. 
 * 
 * When in tail-position, a recursive function is able to re-use stack frames for successive calls, which means:
 *
 * - no stack overflows
 * - a more predictable performance profile (linear)
 *
 * See also: 
 * - the Wikipedia page on [continuation passing style}](https://en.wikipedia.org/wiki/Continuation-passing_style)
 * - {@link ana `fn.ana`}
 * - {@link apo `fn.apo`}
 * - {@link cata `fn.cata`}
 * - {@link para `fn.para`}
 */
const loop
  : <A, B>(fn: (a: A, next: (a: A) => B) => B) => (a: A) => B
  = (fn) => (a) => {
    const next = (a_: typeof a) => fn(a_, next)
    return fn(a, next)
  }

type ContinuationFn<A extends readonly unknown[], B> = (...params: [...args: A, loop: (...args: A) => B]) => B

function loopN<A extends readonly unknown[], B>(fn: ContinuationFn<A, B>): (...a: A) => B {
  return (...a: A) => {
    const next = (...a_: typeof a) => fn(...a_, next)
    return fn(...a, next)
  }
}

/**
 * Checks to make sure a function's implementation is total
 */
const exhaustive
  : <_ extends never = never>(..._: _[]) => _ 
  = (..._) => Invariant.FailedToExhaustivelyMatch("@traversable/data/fn.exhaustive", _)

const softExhaustiveCheck
  : <_ extends never = never>(..._: _[]) => _ 
  = identity

const free
  : <T = never>(type: T) => T 
  = identity

const isFunction
  : (u: unknown) => u is fn.any
  = (u): u is never => typeof u === "function"

const hasOwn
  : (struct: any.object, prop: keyof any) => boolean 
  = (struct, prop) => globalThis.Object.prototype.hasOwnProperty.call(struct, prop)

const tuple
  : <const T extends any.array>(...xs: T) => T 
  = (...xs) => xs

/**
 * See also {@link untupled `fn.untupled`}.
 *
 * {@link tupled `fn.tupled`} and {@link untupled `fn.untupled`} are useful when
 * you need to convert an `n-ary` function to a `variadic` function, or vice-versa.
 * See the examples at bottom.
 *
 * Sometimes called `curry` and `uncurry` in other languages -- but those
 * names are confusing in languages that don't curry functions by default, like
 * JavaScript.
 *
 * These functions together form an _adjoint pair_, which is a fancy term for
 * "almost inverses". You could also say they're each other's _dual_.
 *
 * This _adjoint pair_ in particular is sometimes used as the canonical example
 * of an adjunction. If you're interested in learning more, the name for this
 * adjunction (curry and uncurry) is the "tensor-hom adjunction".
 *
 * @example
 *  const min = tupled(Math.min)
 *  //    ^? const min: (a: number[]) => number
 */
function tupled<I extends arguments, O>(fn: (...args: [...I]) => O): (args: I) => O
function tupled<I extends mut.array, O>(fn: (...args: [...I]) => O): (args: I) => O
function tupled<I extends arguments, const O>(fn: (...args: [...I]) => O): (args: I) => O {
  return (args) => fn(...args)
}

/**
 * See also {@link tupled `fn.tupled`}
 *
 * {@link untupled `fn.untupled`} and {@link tupled `fn.tupled`} are useful
 * when you need to convert a `unary` function to its `n-ary` (or "variadic")
 * version.
 *
 * @example
 *   import { object } from '@traversable/core'
 *
 *   const fromEntries = untupled(object.fromEntries)
 *   const out = fromEntries(
 *     [`abc`, [12, 23]],
 *     [`def`, [34, 45]],
 *     [`ghi`, [56, 78]],
 *   )
 *
 *   console.log(out)
 *   //          ^? const out: { abc: [12, 23], def: [34, 45], ghi: [56, 78] }
 */
function untupled<const I extends arguments, O>(fn: (a: I) => O): (...a: I) => O
function untupled<const I extends mut.array, O>(fn: (a: I) => O): (...a: I) => O
function untupled<const I extends arguments, const O>(fn: (args: I) => O): (...args: I) => O {
  return (...args) => fn(args)
}

/**
 * Adapted from:
 * {@link https://github.com/gcanti/fp-ts/blob/master/src/function.ts#L236-L342 `fp-ts`}
 */
function flow<a extends arguments, b>(ab: (...a: a) => b): (...a: a) => b
function flow<a extends arguments, b, c>(ab: (...a: a) => b, bc: (b: b) => c): (...a: a) => c
function flow<a extends arguments, b, c, d>(
  ab: (...a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
): (...a: a) => d
function flow<a extends arguments, b, c, d, e>(
  ab: (...a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
): (...a: a) => e
function flow<a extends arguments, b, c, d, e, f>(
  ab: (...a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
): (...a: a) => f
function flow<a extends arguments, b, c, d, e, f, g>(
  ab: (...a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
): (...a: a) => g
function flow<a extends arguments, b, c, d, e, f, g, h>(
  ab: (...a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
): (...a: a) => h
function flow<a extends arguments, b, c, d, e, f, g, h, i>(
  ab: (...a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
): (...a: a) => i
function flow<a extends arguments, b, c, d, e, f, g, h, i, j>(
  ab: (...a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
): (...a: a) => j
function flow(
  ...args:
    | [ ab: fn ]
    | [ ab: fn, bc: fn ]
    | [ ab: fn, bc: fn, cd: fn ]
    | [ ab: fn, bc: fn, cd: fn, de: fn ]
    | [ ab: fn, bc: fn, cd: fn, de: fn, ef: fn ]
    | [ ab: fn, bc: fn, cd: fn, de: fn, ef: fn, fg: fn ]
    | [ ab: fn, bc: fn, cd: fn, de: fn, ef: fn, fg: fn, gh: fn ]
    | [ ab: fn, bc: fn, cd: fn, de: fn, ef: fn, fg: fn, gh: fn, hi: fn ]
    | [ ab: fn, bc: fn, cd: fn, de: fn, ef: fn, fg: fn, gh: fn, hi: fn, ij: fn ]
) {
  switch (true) {
    case args.length === 1:
      return args[0]
    case args.length === 2:
      return function (this: unknown) {
        return args[1](args[0].apply(this, arguments))
      }
    case args.length === 3:
      return function (this: unknown) {
        return args[2](args[1](args[0].apply(this, arguments)))
      }
    case args.length === 4:
      return function (this: unknown) {
        return args[3](args[2](args[1](args[0].apply(this, arguments))))
      }
    case args.length === 5:
      return function (this: unknown) {
        return args[4](
          args[3](args[2](args[1](args[0].apply(this, arguments)))),
        )
      }
    case args.length === 6:
      return function (this: unknown) {
        return args[5](
          args[4](args[3](args[2](args[1](args[0].apply(this, arguments))))),
        )
      }
    case args.length === 7:
      return function (this: unknown) {
        return args[6](
          args[5](
            args[4](args[3](args[2](args[1](args[0].apply(this, arguments))))),
          ),
        )
      }
    case args.length === 8:
      return function (this: unknown) {
        return args[7](
          args[6](
            args[5](
              args[4](
                args[3](args[2](args[1](args[0].apply(this, arguments)))),
              ),
            ),
          ),
        )
      }
    case args.length === 9:
      return function (this: unknown) {
        return args[8](
          args[7](
            args[6](
              args[5](
                args[4](
                  args[3](args[2](args[1](args[0].apply(this, arguments)))),
                ),
              ),
            ),
          ),
        )
      }
    default:
      return void 0
  }
}

/**
 * ### {@link distribute `fn.distribute`}
 * 
 * Distributes an argument to many (0 or more) functions.
 */
function distribute<const T extends { [x: number]: fn.any }>(fns: T): 
  (param: fn.param<T[number]>) => { -readonly [K in keyof T]: fn.return<T[K]> }
function distribute<const T extends { [x: string]: fn.any }>(fns: T): 
  (param: fn.param<T[keyof T]>) => { -readonly [K in keyof T]: fn.return<T[K]> }
/// impl.
function distribute<T extends { [x: string]: fn.any }>(fns: T) {
  return (...arg: [fn.param<T[keyof T]>]) => {
    if (globalThis.Array.isArray(fns)) {
      let out: unknown[] = []
      for (let ix = 0, len = fns.length; ix < len; ix++) 
        out.push(fns[ix](...arg))
      return out
    }
    else {
      let out: { [x: string]: unknown } = {}
      for (const k in fns) out[k] = fns[k](...arg)
      return out
    }
  }
} 

function distributes<const T extends { [x: string]: fn.any }>(fns: T): 
  (...params: fn.params<T[keyof T]>) => { -readonly [K in keyof T]: fn.return<T[K]> }
function distributes<const T extends { [x: number]: fn.any }>(fns: T): 
  (...params: fn.params<T[number]>) => { -readonly [K in keyof T]: fn.return<T[K]> }
/// impl.
function distributes<T extends { [x: string]: fn.any }>(fns: T) {
  return (...args: fn.params<T[keyof T]>) => {
    if (globalThis.Array.isArray(fns)) {
      let out: unknown[] = []
      for (const fn of fns) out.push(fn(...args))
      return out
    }
    else {
      let out: { [x: string]: unknown } = {}
      for (const k in fns) out[k] = fns[k](...args)
      return out
    }
  }
} 

export function tee<T, A, B>(leftFn: (t: T) => A, rightFn: (t: T) => B): (t: T) => [left: A, right: B]
export function tee<T, A, B>(leftFn: (t: T) => A, rightFn: (t: T) => B) { 
  return (value: T) => [leftFn(value), rightFn(value)]
}


/**
 * Adapted from:
 * {@link https://github.com/gcanti/fp-ts/blob/master/src/function.ts#L416-L689 `fp-ts`}
 */
function pipe(): void
function pipe<const a>(a: a): a
function pipe<const a, b>(a: a, ab: (a: a) => b): b
function pipe<const a, b, c>(a: a, ab: (a: a) => b, bc: (b: b) => c): c
function pipe<const a, b, c, d>(a: a, ab: (a: a) => b, bc: (b: b) => c, cd: (c: c) => d): d
function pipe<const a, b, c, d, e>(a: a, ab: (a: a) => b, bc: (b: b) => c, cd: (c: c) => d, de: (d: d) => e,): e
function pipe<const a, b, c, d, e, f>(a: a, ab: (a: a) => b, bc: (b: b) => c, cd: (c: c) => d, de: (d: d) => e, ef: (e: e) => f): f
function pipe<const a, b, c, d, e, f, g>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
): g
function pipe<const a, b, c, d, e, f, g, h>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
): h
function pipe<const a, b, c, d, e, f, g, h, i>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
): i
function pipe<const a, b, c, d, e, f, g, h, i, j>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
): j
function pipe<const a, b, c, d, e, f, g, h, i, j, k>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
  jk: (j: j) => k,
): k
function pipe<const a, b, c, d, e, f, g, h, i, j, k, l>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
  jk: (j: j) => k,
  kl: (k: k) => l,
): l
function pipe<const a, b, c, d, e, f, g, h, i, j, k, l, m>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
  jk: (j: j) => k,
  kl: (k: k) => l,
  lm: (l: l) => m,
): m
function pipe<const a, b, c, d, e, f, g, h, i, j, k, l, m, n>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
  jk: (j: j) => k,
  kl: (k: k) => l,
  lm: (l: l) => m,
  mn: (m: m) => n,
): n
function pipe<const a, b, c, d, e, f, g, h, i, j, k, l, m, n, o>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
  jk: (j: j) => k,
  kl: (k: k) => l,
  lm: (l: l) => m,
  mn: (m: m) => n,
  no: (n: n) => o,
): o
function pipe<const a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
  jk: (j: j) => k,
  kl: (k: k) => l,
  lm: (l: l) => m,
  mn: (m: m) => n,
  no: (n: n) => o,
  op: (o: o) => p,
): p
function pipe<const a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
  jk: (j: j) => k,
  kl: (k: k) => l,
  lm: (l: l) => m,
  mn: (m: m) => n,
  no: (n: n) => o,
  op: (o: o) => p,
  pq: (p: p) => q,
): q
function pipe<const a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
  jk: (j: j) => k,
  kl: (k: k) => l,
  lm: (l: l) => m,
  mn: (m: m) => n,
  no: (n: n) => o,
  op: (o: o) => p,
  pq: (p: p) => q,
  qr: (q: q) => r,
): r
function pipe<const a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
  jk: (j: j) => k,
  kl: (k: k) => l,
  lm: (l: l) => m,
  mn: (m: m) => n,
  no: (n: n) => o,
  op: (o: o) => p,
  pq: (p: p) => q,
  qr: (q: q) => r,
  rs: (r: r) => s,
): s
function pipe<const a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t>(
  a: a,
  ab: (a: a) => b,
  bc: (b: b) => c,
  cd: (c: c) => d,
  de: (d: d) => e,
  ef: (e: e) => f,
  fg: (f: f) => g,
  gh: (g: g) => h,
  hi: (h: h) => i,
  ij: (i: i) => j,
  jk: (j: j) => k,
  kl: (k: k) => l,
  lm: (l: l) => m,
  mn: (m: m) => n,
  no: (n: n) => o,
  op: (o: o) => p,
  pq: (p: p) => q,
  qr: (q: q) => r,
  rs: (r: r) => s,
  st: (s: s) => t,
): t
function pipe(
  ...a:
    | [_]
    | [_, fn]
    | [_, fn, fn]
    | [_, fn, fn, fn]
    | [_, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn]
    | [_, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn] 
    | [_, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn, fn]
): unknown {
  switch (true) {
    case a.length === 1:
      return a[0]
    case a.length === 2:
      return a[1](a[0])
    case a.length === 3:
      return a[2](a[1](a[0]))
    case a.length === 4:
      return a[3](a[2](a[1](a[0])))
    case a.length === 5:
      return a[4](a[3](a[2](a[1](a[0]))))
    case a.length === 6:
      return a[5](a[4](a[3](a[2](a[1](a[0])))))
    case a.length === 7:
      return a[6](a[5](a[4](a[3](a[2](a[1](a[0]))))))
    case a.length === 8:
      return a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0])))))))
    case a.length === 9:
      return a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0]))))))))
    case a.length === 10:
      return a[9](a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0])))))))))
    case a.length === 11:
      return a[10](a[9](a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0]))))))))))
    case a.length === 12:
      return a[11](a[10](a[9](a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0])))))))))))
    case a.length === 13:
      return a[12](a[11](a[10](a[9](a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0]))))))))))))
    case a.length === 14:
      return a[13](a[12](a[11](a[10](a[9](a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0])))))))))))))
    case a.length === 15:
      return a[14](a[13](a[12](a[11](a[10](a[9](a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0]))))))))))))))
    case a.length === 16:
      return a[15](a[14](a[13](a[12](a[11](a[10](a[9](a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0])))))))))))))))
    case a.length === 17:
      return a[16](a[15](a[14](a[13](a[12](a[11](a[10](a[9](a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0]))))))))))))))))
    case a.length === 18:
      return a[17](a[16](a[15](a[14](a[13](a[12](a[11](a[10](a[9](a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0])))))))))))))))))
    case a.length === 19:
      return a[18](a[17](a[16](a[15](a[14](a[13](a[12](a[11](a[10](a[9](a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0]))))))))))))))))))
    case a.length === 20:
      return a[19](a[18](a[17](a[16](a[15](a[14](a[13](a[12](a[11](a[10](a[9](a[8](a[7](a[6](a[5](a[4](a[3](a[2](a[1](a[0])))))))))))))))))))
    default: {
      const args: any.functions = a
      let ret: unknown = args[0]
      for (let ix = 1, len = args.length; ix < len; ix++) ret = args[ix](ret)
      return ret
    }
  }
}

export const log
  : (msg: string, logger?: (...args: unknown[]) => void) => (x: unknown) => void 
  = (msg, logger = globalThis.console.log) => (x) => logger(msg, x)

export const chainFirst
  : <const T>(x: T) => (eff: (x: T) => void) => T 
  = (x) => (eff) => (void eff(x), x)

export const tap
  : (msg: string, logger?: (...args: unknown[]) => void) => <const T>(x: T) => T 
  = (msg, logger = globalThis.console.log) => flow(chainFirst, apply(log(msg, logger)))

export const fanout 
  : <A, B, C>(ab: (a: A) => B, ac: (a: A) => C) => (a: A) => [B, C]
  = (ab, ac) => (a) => [ab(a), ac(a)]
 
export const fanin 
  : <A, B, C>(ba: (b: B) => A, ca: (c: C) => A) => (cb: Either<C, B>) => A
  = (ba, ca) => (cb) => cb._tag === URI.Left ? ca(cb.left) : ba(cb.right)


/** 
 * ## {@link ana `fn.ana`}
 * 
 * Dual of {@link cata `fn.cata`}.
 * 
 * Repeatedly apply a "reduce" or _fold_ operation to a functor instance using 
 * co-recursion. 
 * 
 * Since the operation is co-recursive, in practice, you're typically building _up_
 * a data structure (like a tree).
 * 
 * The nice thing about using an anamorphism is that it lets you write the operation
 * without having to worry about the recursive bit. 
 * 
 * tl,dr: 
 * 
 * If you can write a `map` function for the data structure you're targeting, then
 * just give that function to {@link ana `fn.any`} along with the non-recursive
 * operation you want performed, and it will take care of repeatedly applying the
 * operation (called a "coalgebra") to the data structure, returning you the final
 * result.
 * 
 * See also:
 * - the [Wikipedia page](https://en.wikipedia.org/wiki/Anamorphism) on anamorphisms
 * - {@link apo `fn.apo`}
 * - {@link cata `fn.cata`}
 * - {@link hylo `fn.hylo`}
 * - {@link para `fn.para`}
 */

export function ana<F extends HKT, _F>(Functor: Functor<F, _F>): 
  <T>(coalgebra: Functor.Coalgebra<F, T>) => <S extends _F>(term: S) => HKT.apply<F, T>
/// impl.
export function ana<F extends HKT>(Functor: Functor<F>) {
  return <T>(coalgebra: Functor.Coalgebra<F, T>) => {
    return function loop(term: T): HKT.apply<F, T> {
      return Functor.map(loop)(coalgebra(term))
    }
  }
}

/** 
 * ## {@link cata `fn.cata`}
 * 
 * Dual of {@link ana `fn.ana`}.
 * 
 * See also:
 * - {@link ana `fn.ana`}
 * - {@link apo `fn.apo`}
 * - {@link hylo `fn.hylo`}
 * - {@link para `fn.para`}
 */
export function cata<F extends HKT, _F>(F: Functor<F, _F>): 
  <T>(algebra: Functor.Algebra<F, T>) => <S extends _F>(term: S) => T

export function cata<F extends HKT>(F: Functor<F>) {
  return <T>(algebra: Functor.Algebra<F, T>) => {
    return function loop(term: HKT.apply<F, T>): T {
      return algebra(F.map(loop)(term))
    }
  }
}

/** 
 * ## {@link para `fn.para`}
 * 
 * Dual of {@link apo `fn.apo`}.
 * 
 * See also:
 * - {@link ana `fn.ana`}
 * - {@link apo `fn.apo`}
 * - {@link cata `fn.cata`}
 * - {@link hylo `fn.hylo`}
 */

export function para<F extends HKT, _F>(F: Functor<F, _F>): 
  <T>(ralgebra: Functor.RAlgebra<F, T>) => <S extends _F>(term: S) => T 
    
export function para<F extends HKT>(F: Functor<F>) {
  return <T>(ralgebra: Functor.RAlgebra<F, T>) => {
    function fanout(term: T): HKT.apply<F, [F, T]>
      { return [term, para(F)(ralgebra)(term)] }
    return flow(
      F.map(fanout),
      ralgebra,
    )
  }
}

// export function para<F extends HKT, _>(F: Functor<F, _>):
//   <T>(algebra: (term: HKT.apply<F, [F, T]>) => T) 
//     => (term: HKT.apply<F, [_, T]>) 
//     => HKT.apply<F, [F, T]>
// export function para<F extends HKT>(F: Functor<F>) {
//   return <T>(algebra: (term: HKT.apply<F, [F, T]>) => T) => {
//     return function loop(term: HKT.apply<F, [F, T]>): HKT.apply<F, [F, T]> {
//       return [term, algebra(F.map(loop)(term))]
//     }
//   }
// }

/** 
 * ## {@link apo `fn.apo`}
 * 
 * Dual of {@link para `fn.para`}.
 * 
 * See also:
 * - {@link ana `fn.ana`}
 * - {@link apo `fn.apo`}
 * - {@link cata `fn.cata`}
 * - {@link hylo `fn.hylo`}
 */
export function apo<F extends HKT>(F: Functor<F>): 
  <T>(coalgebra: Functor.RCoalgebra<F, T>) 
    => (expr: T)
    => HKT.apply<F, T> 

export function apo<F extends HKT>(F: Functor<F>) {
  return <T>(coalgebra: Functor.RCoalgebra<F, T>) => 
    (expr: T): HKT.apply<F, T> => pipe(
      coalgebra(expr),
      F.map(
        (e) => e._tag === URI.Right 
          ? identity 
          : apo(F)(coalgebra)
      )
    )
}

/** 
 * ## {@link hylo `fn.hylo`}
 * 
 * Run an anamorphism, followed by a catamorphism, on a 
 * recursive data structure.
 * 
 * The benefit to using {@link hylo `fn.hylo`} rather than
 * just using function composition is performance: by providing
 * the co-/algebra ahead of time, we're able to avoid building up
 * an intermediate data structure in memory.
 * 
 * See also:
 * - {@link ana `fn.ana`}
 * - {@link apo `fn.apo`}
 * - {@link cata `fn.cata`}
 * - {@link hylo `fn.hylo`}
 */
export function hylo
  <F extends HKT>(F: Functor<F>): 
  <S, T>(
    algebra: Functor.Algebra<F, T>, 
    coalgebra: Functor.Coalgebra<F, S>
  ) => (s: S) 
    => T

export function hylo
  <F extends HKT>(Functor: Functor<F>) {
    return <S, T>(
      algebra: Functor.Algebra<F, T>, 
      coalgebra: Functor.Coalgebra<F, S>
    ) => 
      (s: S) => pipe(
        coalgebra(s),
        Functor.map(hylo(Functor)(algebra, coalgebra)),
        algebra,
      )
  }

/** 
 * ## {@link dimap `fn.dimap`}
 * 
 * Implementation of `dimap` for the function or "Arrow" profunctor.
 */
export function dimap<S, T, A, B>
  (f: (s: S) => A, h: (b: B) => T): 
    (g: (a: A) => B) => (s: S) => T 
export function dimap<S, T, A, B>
  (f: (s: S) => A, h: (b: B) => T) 
  { return (g: (a: A) => B) => flow(f, g, h) }
