import { type Either, type Left, type Right, URI } from "@traversable/registry"

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> => either._tag === URI.Left
export const isRight = <R, L>(either: Either<L, R>): either is Right<R> => either._tag === URI.Right

export function left<E>(left: E): Left<E> 
  { return { _tag: URI.Left, left } }
export function right<T>(right: T): Right<T> 
  { return { _tag: URI.Right, right } }


export function fold<S, T, E, F>(onLeft: (e: E) => F, onRight: (s: S) => T) {
  return (either: Either<E, S>): F | T => isLeft(either) 
    ? onLeft(either.left) 
    : onRight(either.right)
}

export function match<S, T, E, F>(matchers: { onLeft(e: E): F, onRight(s: S): T }): 
  (either: Either<E, S>) => F | T 
  { return fold(matchers.onLeft, matchers.onRight) }
