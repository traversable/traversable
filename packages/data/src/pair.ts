import type { any } from "any-ts"
import * as fn from "./_internal/_function.js"

export type { Pair as any }
export type Pair<
  L = unknown, 
  R = unknown,
> = never | readonly [left: L, right: R]

export { isPair as is } from "./_internal/_pair.js"

export { let_ as let }

function let_<const T extends Pair>(pair: T): [T[0], T[1]]
function let_<const T extends Pair>(pair: T) {
  return [...pair]
}

export { const_ as const }

function const_<const T extends Pair>(pair: T): T
function const_<const T extends Pair>(pair: T): T 
  { return pair }

export const of
  : <L, R>(left: L, right: R) => Pair<L, R> 
  = (left, right) => [left, right]

export const duplicate
  : <const T>(value: T) => Pair<T, T>
  = (value) => [value, value]

export function pair<L, R>(left: L, right: R): Pair<L, R> {
  return of(left, right)
}

export function mapLeft<A, Z>(f: (left: A) => Z): <B>([x, y]: Pair<A, B>) => [Z, B] {
  return ([x, y]) => [f(x), y]
}

export function mapRight<B, Z>(f: (right: B) => Z): <A>([x, y]: Pair<A, B>) => [A, Z] { return ([x, y]) => [x, f(y)] }

export function mapBoth<A, B, N, M>(f: (a: A) => N, g: (b: B) => M): ([x, y]: Pair<A, B>) => [N, M] {
  return ([x, y]) => [f(x), g(y)]
}

export function distribute<A, B>(fn: (a: A) => B): (pair: Pair<A, A>) => Pair<B, B>
export function distribute<A, B>(fn: (a: A) => B) { return ([x, y]: Pair<A, A>) => of(fn(x), fn(y)) }

export const first
  : <A, B>(pair: Pair<A, B>) => A 
  = ([left]) => left

export const second
  : <A, B>(pair: Pair<A, B>) => B 
  = ([, right]) => right

export const applyPair
  : <A, B, Z>(binaryFn: (a: A, b: B) => Z) => (pair: Pair<A, B>) => Z 
  = fn.tupled

export const applyBoth
  : <A, B, Z>(unaryFn: (pair: [A, B]) => Z) => (...pair: Pair<A, B>) => Z 
  = fn.untupled

export const concat
  : <L extends any.showable, R extends any.showable>(pair: Pair<L, R>) => `${L}${R}` 
  = ([x, y]) => `${x}${y}`
